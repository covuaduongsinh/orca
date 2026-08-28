import { getSecretStore } from '../../shared/secret-store'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

type StoredGroqKey = {
  encryptedKeyBase64: string
}

const GROQ_SPEECH_TOKEN_FILE = 'groq-speech-token.enc'
let cachedGroqSpeechApiKey: string | null = null

function getOrcaDir(): string {
  return join(homedir(), '.orca')
}

function ensureOrcaDir(): void {
  const dir = getOrcaDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function getGroqKeyPath(): string {
  return join(getOrcaDir(), GROQ_SPEECH_TOKEN_FILE)
}

function readLegacyJsonStoredGroqKey(): StoredGroqKey | null {
  const keyPath = getGroqKeyPath()
  if (!existsSync(keyPath)) {
    return null
  }
  try {
    const parsed = JSON.parse(readFileSync(keyPath, 'utf8')) as Partial<StoredGroqKey>
    if (typeof parsed.encryptedKeyBase64 !== 'string' || parsed.encryptedKeyBase64 === '') {
      return null
    }
    return { encryptedKeyBase64: parsed.encryptedKeyBase64 }
  } catch {
    return null
  }
}

export function hasGroqSpeechApiKey(): boolean {
  return existsSync(getGroqKeyPath())
}

export function saveGroqSpeechApiKey(apiKey: string): void {
  const trimmed = apiKey.trim()
  if (!trimmed) {
    throw new Error('Groq API key is required')
  }
  ensureOrcaDir()
  if (getSecretStore().isEncryptionAvailable()) {
    writeFileSync(getGroqKeyPath(), getSecretStore().encryptString(trimmed), { mode: 0o600 })
    cachedGroqSpeechApiKey = trimmed
    return
  }

  console.warn('[speech] secret encryption unavailable — storing Groq speech key in plaintext')
  writeFileSync(getGroqKeyPath(), trimmed, { encoding: 'utf8', mode: 0o600 })
  cachedGroqSpeechApiKey = trimmed
}

export function readGroqSpeechApiKey(): string {
  if (cachedGroqSpeechApiKey !== null) {
    return cachedGroqSpeechApiKey
  }

  const keyPath = getGroqKeyPath()
  if (!existsSync(keyPath)) {
    throw new Error('Groq API key is not configured')
  }
  try {
    const raw = readFileSync(keyPath)
    const legacyJson = readLegacyJsonStoredGroqKey()
    if (legacyJson) {
      cachedGroqSpeechApiKey = getSecretStore().decryptString(
        Buffer.from(legacyJson.encryptedKeyBase64, 'base64')
      )
      return cachedGroqSpeechApiKey
    }
    cachedGroqSpeechApiKey = getSecretStore().isEncryptionAvailable()
      ? getSecretStore().decryptString(raw)
      : raw.toString('utf8')
    return cachedGroqSpeechApiKey
  } catch {
    throw new Error('Groq API key could not be decrypted')
  }
}

export function clearGroqSpeechApiKey(): void {
  cachedGroqSpeechApiKey = null
  rmSync(getGroqKeyPath(), { force: true })
}
