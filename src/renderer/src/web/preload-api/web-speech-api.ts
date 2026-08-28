import type { PreloadApi } from '../../../../preload/api-types'

class WebEventEmitter {
  private listeners: Record<string, Function[]> = {}
  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(callback)
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }
  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data))
    }
  }
}

export function createWebSpeechApi(): PreloadApi['speech'] {
  let recognition: any = null
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
        label: 'Trình duyệt Web (Web Speech API)',
        description: 'Sử dụng nhận diện giọng nói tích hợp của trình duyệt',
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

    onPartialTranscript: (cb) => events.on('partialTranscript', cb),
    onFinalTranscript: (cb) => events.on('finalTranscript', cb),
    onDownloadProgress: () => () => {},
    onReady: (cb) => events.on('ready', cb),
    onStopped: (cb) => events.on('stopped', cb),
    onError: (cb) => events.on('error', cb),

    startDictation: async (_modelId, _hotwords, sessionId) => {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        events.emit('error', {
          sessionId,
          error: 'Trình duyệt của bạn không hỗ trợ Web Speech API.'
        })
        return
      }

      activeSessionId = sessionId
      recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true

      // We can try to read language from localStorage, or default to Vietnamese
      // since the user wants Vietnamese specifically!
      recognition.lang = 'vi-VN'

      recognition.onresult = (event: any) => {
        if (activeSessionId !== sessionId) return

        let interimTranscript = ''
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        if (interimTranscript) {
          events.emit('partialTranscript', { sessionId, text: interimTranscript })
        }
        if (finalTranscript) {
          events.emit('finalTranscript', { sessionId, text: finalTranscript, metadata: {} })
        }
      }

      recognition.onerror = (event: any) => {
        if (activeSessionId !== sessionId) return
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
