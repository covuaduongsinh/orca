import type { PreloadApi } from '../../../../preload/api-types'

type EventListenerCallback = (data: unknown) => void

type BrowserSpeechRecognitionEvent = {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: {
        transcript: string
      }
    }
  }
}

type BrowserSpeechRecognitionErrorEvent = {
  error: string
}

type BrowserSpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognitionInstance

class WebEventEmitter {
  private listeners: Record<string, EventListenerCallback[]> = {}

  on(event: string, callback: EventListenerCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
    return () => {
      this.listeners[event] = this.listeners[event]?.filter((cb) => cb !== callback) ?? []
    }
  }

  emit(event: string, data: unknown): void {
    const list = this.listeners[event]
    if (list) {
      for (const cb of list) {
        cb(data)
      }
    }
  }
}

export function createWebSpeechApi(): PreloadApi['speech'] {
  let recognition: BrowserSpeechRecognitionInstance | null = null
  let activeSessionId: string | null = null
  const events = new WebEventEmitter()

  return {
    getCatalog: async () => [
      {
        id: 'web-speech-api',
        type: 'whisper',
        language: 'auto',
        sampleRate: 16000,
        streaming: true,
        provider: 'local',
        label: 'Web Speech API',
        description: 'Use browser built-in speech recognition',
        sizeBytes: 0,
        downloadFiles: []
      }
    ],
    getModelStates: async () => [
      {
        id: 'web-speech-api',
        status: 'ready'
      }
    ],
    getOpenAiApiKeyStatus: async () => ({ configured: false }),
    saveOpenAiApiKey: async () => ({ configured: false }),
    clearOpenAiApiKey: async () => ({ configured: false }),
    getGroqApiKeyStatus: async () => ({ configured: false }),
    saveGroqApiKey: async () => ({ configured: false }),
    clearGroqApiKey: async () => ({ configured: false }),
    downloadModel: async () => {},
    cancelDownload: async () => {},
    deleteModel: async () => {},

    // @ts-expect-error -- generic event callback conversion
    onPartialTranscript: (cb) => events.on('partialTranscript', cb),
    // @ts-expect-error -- generic event callback conversion
    onFinalTranscript: (cb) => events.on('finalTranscript', cb),
    onDownloadProgress: () => () => {},
    // @ts-expect-error -- generic event callback conversion
    onReady: (cb) => events.on('ready', cb),
    // @ts-expect-error -- generic event callback conversion
    onStopped: (cb) => events.on('stopped', cb),
    // @ts-expect-error -- generic event callback conversion
    onError: (cb) => events.on('error', cb),

    startDictation: async (_modelId, _hotwords, sessionId) => {
      const windowWithSpeech = window as unknown as {
        SpeechRecognition?: BrowserSpeechRecognitionConstructor
        webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
      }
      const SpeechRecognitionCtor =
        windowWithSpeech.SpeechRecognition ?? windowWithSpeech.webkitSpeechRecognition
      if (!SpeechRecognitionCtor) {
        events.emit('error', {
          sessionId,
          error: 'Your browser does not support the Web Speech API.'
        })
        return
      }

      activeSessionId = sessionId
      recognition = new SpeechRecognitionCtor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'vi-VN'

      recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
        if (activeSessionId !== sessionId) {
          return
        }

        let interimTranscript = ''
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i]
          if (item?.isFinal) {
            finalTranscript += item[0]?.transcript ?? ''
          } else if (item) {
            interimTranscript += item[0]?.transcript ?? ''
          }
        }

        if (interimTranscript) {
          events.emit('partialTranscript', { sessionId, text: interimTranscript })
        }
        if (finalTranscript) {
          events.emit('finalTranscript', { sessionId, text: finalTranscript, metadata: {} })
        }
      }

      recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
        if (activeSessionId !== sessionId) {
          return
        }
        events.emit('error', { sessionId, error: event.error })
      }

      recognition.onend = () => {
        if (activeSessionId === sessionId) {
          events.emit('stopped', { sessionId })
          activeSessionId = null
          recognition = null
        }
      }

      recognition.start()
      events.emit('ready', { sessionId })
    },

    stopDictation: async (sessionId) => {
      if (recognition && activeSessionId === sessionId) {
        recognition.stop()
      }
    },

    feedAudio: async () => {
      // No-op for Web Speech API as it handles its own audio
    }
  }
}
