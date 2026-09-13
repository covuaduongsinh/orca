import { app } from 'electron'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { rename, rm } from 'node:fs/promises'
import { join } from 'node:path'
import type { SpeechModelState, SpeechModelStatus } from '../../shared/speech-types'
import { SPEECH_MODEL_CATALOG, getCatalogModel, isLocalSpeechModel } from './model-catalog'
import { hasOpenAiSpeechApiKey } from './openai-api-key-store'
import { hasGroqSpeechApiKey } from './groq-api-key-store'
import { migrateSpeechModelCacheIfNeeded } from './model-cache-path'
import { SpeechModelDownloadTransport } from './speech-model-download-transport'
import {
  removeModelDownloadFiles,
  removeModelDownloadStaging
} from './speech-model-download-cleanup'
import { prepareModelsDir, getSafeModelDir, validateModelFiles } from './model-dir-resolver'

type DownloadHandle = {
  abort: () => void
}

type ProgressCallback = (modelId: string, progress: number) => void

export class ModelManager extends SpeechModelDownloadTransport {
  private modelsDir: string
  private migrationSourceDir: string | null
  private migrationReady: Promise<void>
  private activeDownloads = new Map<string, DownloadHandle>()
  private modelStates = new Map<string, SpeechModelState>()
  private progressCallbacks = new Set<ProgressCallback>()

  constructor(customModelsDir?: string) {
    super()
    const requestedModelsDir = customModelsDir || join(app.getPath('userData'), 'speech-models')
    const prepared = prepareModelsDir(requestedModelsDir)
    this.modelsDir = prepared.modelsDir
    this.migrationSourceDir = prepared.migrationSourceDir
    // Why: migration copies large model files, so run it async and gate state reads on it to keep the UI responsive.
    this.migrationReady = migrateSpeechModelCacheIfNeeded(
      prepared.migrationSourceDir,
      prepared.modelsDir
    )
  }

  setProgressCallback(cb: ProgressCallback): () => void {
    // Why: return an unsubscribe so concurrent settings windows don't replace each other's callback.
    this.progressCallbacks.add(cb)
    return () => {
      this.progressCallbacks.delete(cb)
    }
  }

  getModelsDir(): string {
    return this.modelsDir
  }

  async getModelStates(): Promise<SpeechModelState[]> {
    const states: SpeechModelState[] = []
    for (const manifest of SPEECH_MODEL_CATALOG) {
      const state = await this.getModelState(manifest.id)
      states.push(state)
    }
    return states
  }

  async getModelState(modelId: string): Promise<SpeechModelState> {
    await this.migrationReady
    const cached = this.modelStates.get(modelId)
    if (cached && (cached.status === 'downloading' || cached.status === 'extracting')) {
      return cached
    }

    const manifest = getCatalogModel(modelId)
    if (!manifest) {
      return { id: modelId, status: 'error', error: 'Unknown model' }
    }

    if (manifest.provider === 'openai') {
      return {
        id: modelId,
        status: hasOpenAiSpeechApiKey() ? 'ready' : 'not-downloaded'
      }
    }

    if (manifest.provider === 'groq') {
      return {
        id: modelId,
        status: hasGroqSpeechApiKey() ? 'ready' : 'not-downloaded'
      }
    }

    const modelDir = this.getModelDir(modelId)
    if (existsSync(modelDir) && validateModelFiles(manifest, modelDir)) {
      const state: SpeechModelState = { id: modelId, status: 'ready' }
      this.modelStates.set(modelId, state)
      return state
    }

    return { id: modelId, status: 'not-downloaded' }
  }

  getModelDir(modelId: string): string {
    return getSafeModelDir(modelId, this.modelsDir)
  }

  async downloadModel(modelId: string): Promise<void> {
    // Why: no migration await — it never races a download, and awaiting would defer setup cancelDownload relies on.
    if (this.activeDownloads.has(modelId)) {
      return
    }

    const manifest = getCatalogModel(modelId)
    if (!manifest) {
      throw new Error(`Unknown model: ${modelId}`)
    }
    if (!isLocalSpeechModel(manifest)) {
      throw new Error(`Model does not support downloads: ${modelId}`)
    }
    if (!manifest.downloadFiles?.length || !manifest.sizeBytes) {
      throw new Error(`Model download metadata missing: ${modelId}`)
    }

    const modelDir = this.getModelDir(modelId)
    if (existsSync(modelDir) && validateModelFiles(manifest, modelDir)) {
      this.updateState(modelId, 'ready')
      return
    }

    this.updateState(modelId, 'downloading', 0)

    const stagingDir = `${modelDir}.partial`
    const legacyArchivePath = join(this.modelsDir, `${modelId}.tar.bz2`)
    // Why: resuming an unverified file left by a crashed process could preserve corrupt bytes.
    rmSync(stagingDir, { recursive: true, force: true })
    try {
      rmSync(legacyArchivePath, { force: true })
    } catch {
      // best-effort legacy cleanup
    }
    mkdirSync(stagingDir, { recursive: true })
    let aborted = false
    const abortController = new AbortController()

    const handle: DownloadHandle = {
      abort: () => {
        aborted = true
        // Why: a stalled HTTPS request may never deliver another chunk, so tear it down immediately.
        abortController.abort()
      }
    }
    this.activeDownloads.set(modelId, handle)

    try {
      await this.downloadModelFiles(
        manifest,
        stagingDir,
        modelId,
        () => aborted,
        abortController.signal
      )

      if (aborted) {
        return
      }

      await rm(modelDir, { recursive: true, force: true })
      await rename(stagingDir, modelDir)
      this.updateState(modelId, 'ready')
    } catch (err) {
      if (!aborted) {
        console.error('[speech] Model download failed:', modelId, err)
        this.updateState(modelId, 'error', undefined, String(err))
      }
      removeModelDownloadFiles(modelDir, stagingDir, legacyArchivePath)
      if (!aborted) {
        // Why: the settings UI awaits this to surface failures; stay quiet on cancellation, rethrow real errors.
        throw err
      }
    } finally {
      this.activeDownloads.delete(modelId)
      removeModelDownloadStaging(stagingDir, legacyArchivePath)
    }
  }

  cancelDownload(modelId: string): void {
    const handle = this.activeDownloads.get(modelId)
    if (handle) {
      handle.abort()
      this.updateState(modelId, 'not-downloaded')
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    await this.migrationReady
    if (!getCatalogModel(modelId)) {
      throw new Error(`Unknown model: ${modelId}`)
    }
    const manifest = getCatalogModel(modelId)
    if (!manifest || !isLocalSpeechModel(manifest)) {
      throw new Error(`Model does not support deletion: ${modelId}`)
    }
    this.cancelDownload(modelId)
    const modelDir = this.getModelDir(modelId)
    if (existsSync(modelDir)) {
      await rm(modelDir, { recursive: true, force: true })
    }
    await rm(`${modelDir}.partial`, { recursive: true, force: true })
    await rm(join(this.modelsDir, `${modelId}.tar.bz2`), { force: true })
    // Why: also delete the pre-migration copy, or the next launch re-migrates it and resurrects the model.
    if (this.migrationSourceDir) {
      const sourceModelDir = getSafeModelDir(modelId, this.migrationSourceDir)
      if (existsSync(sourceModelDir)) {
        await rm(sourceModelDir, { recursive: true, force: true })
      }
    }
    this.modelStates.delete(modelId)
  }

  private updateState(
    modelId: string,
    status: SpeechModelStatus,
    progress?: number,
    error?: string
  ): void {
    const previous = this.modelStates.get(modelId)
    // Whole-percent state matches the UI and prevents chunk-level IPC/poll churn.
    const reportedProgress =
      status === 'downloading' && progress !== undefined
        ? Math.round(progress * 100) / 100
        : progress
    if (
      status === 'downloading' &&
      previous?.status === 'downloading' &&
      previous.error === error &&
      previous.progress === reportedProgress
    ) {
      return
    }
    const state: SpeechModelState = { id: modelId, status, progress: reportedProgress, error }
    this.modelStates.set(modelId, state)
    // Repeated non-download states can be the requesting window's only resync signal.
    const progressValue = reportedProgress ?? (status === 'extracting' ? 0.95 : -1)
    for (const callback of this.progressCallbacks) {
      callback(modelId, progressValue)
    }
  }

  protected reportDownloadProgress(modelId: string, progress: number): void {
    this.updateState(modelId, 'downloading', progress)
  }
}
