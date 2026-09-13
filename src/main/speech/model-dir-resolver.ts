import { mkdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import type { SpeechModelManifest } from '../../shared/speech-types'
import { getCatalogModel } from './model-catalog'
import { getSpeechModelCacheDirCandidates, type SpeechModelCacheDir } from './model-cache-path'

export function prepareModelsDir(requestedModelsDir: string): SpeechModelCacheDir {
  let lastError: unknown = null
  for (const candidate of getSpeechModelCacheDirCandidates(requestedModelsDir)) {
    try {
      mkdirSync(candidate.modelsDir, { recursive: true })
      return candidate
    } catch (error) {
      lastError = error
      if (candidate.migrationSourceDir) {
        console.warn('[speech] Failed to prepare ASCII speech model cache:', error)
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

export function getSafeModelDir(modelId: string, root: string): string {
  const manifest = getCatalogModel(modelId)
  if (!manifest) {
    throw new Error(`Unknown model: ${modelId}`)
  }
  const modelsRoot = resolve(root)
  const modelDir = resolve(modelsRoot, modelId)
  const rel = relative(modelsRoot, modelDir)
  if (rel.startsWith('..') || rel === '' || rel.includes('..') || resolve(rel) === rel) {
    throw new Error(`Invalid model id: ${modelId}`)
  }
  return modelDir
}

export function validateModelFiles(manifest: SpeechModelManifest, modelDir: string): boolean {
  if (!manifest.downloadFiles) {
    return false
  }
  return manifest.downloadFiles.every(({ name, sizeBytes }) => {
    try {
      return statSync(join(modelDir, name)).size === sizeBytes
    } catch {
      return false
    }
  })
}
