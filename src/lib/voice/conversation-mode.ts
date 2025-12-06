/**
 * Conversation mode state machine for Jarvis Mode
 * Manages continuous voice conversation flow
 */

export type VoiceState = 
  | 'idle'        // Not in voice mode
  | 'listening'   // Waiting for user input
  | 'processing'  // Transcribing/thinking
  | 'speaking'    // Cora is responding
  | 'paused'      // Waiting for wake word or timeout

export type VoiceEvent =
  | 'activate'
  | 'deactivate'
  | 'speech_detected'
  | 'speech_end'
  | 'response_ready'
  | 'finished_speaking'
  | 'interrupted'
  | 'timeout'
  | 'wake_word'
  | 'error'
  | 'pause'
  | 'resume'

export interface VoiceSession {
  state: VoiceState
  startTime: Date
  interactionCount: number
  lastActivity: Date
  errorCount: number
}

export interface ConversationModeConfig {
  silenceTimeout: number        // Seconds before timing out (default: 10)
  pauseAfterSpeaking: number    // Seconds pause after Cora speaks (default: 1)
  maxContinuousTime: number     // Max session time in minutes (default: 30)
  autoListenAfterResponse: boolean
  wakeWords: string[]
}

export const DEFAULT_CONFIG: ConversationModeConfig = {
  silenceTimeout: 10,
  pauseAfterSpeaking: 1,
  maxContinuousTime: 30,
  autoListenAfterResponse: true,
  wakeWords: ['hey cora', 'ok cora', 'okay cora', 'olá cora', 'ola cora']
}

// Exit command patterns
const EXIT_PATTERNS = [
  'stop listening',
  'exit jarvis mode',
  'exit voice mode',
  'stop voice',
  'goodbye',
  'parar de ouvir',
  'sair do modo voz',
  'tchau',
  'adeus'
]

/**
 * State machine transition function
 */
export function transition(current: VoiceState, event: VoiceEvent): VoiceState {
  switch (current) {
    case 'idle':
      if (event === 'activate') return 'listening'
      break
      
    case 'listening':
      if (event === 'speech_detected') return 'processing'
      if (event === 'timeout') return 'paused'
      if (event === 'deactivate') return 'idle'
      if (event === 'error') return 'paused'
      break
      
    case 'processing':
      if (event === 'response_ready') return 'speaking'
      if (event === 'error') return 'listening'
      if (event === 'deactivate') return 'idle'
      break
      
    case 'speaking':
      if (event === 'finished_speaking') return 'listening'
      if (event === 'interrupted') return 'listening'
      if (event === 'deactivate') return 'idle'
      if (event === 'pause') return 'paused'
      break
      
    case 'paused':
      if (event === 'wake_word') return 'listening'
      if (event === 'resume') return 'listening'
      if (event === 'deactivate') return 'idle'
      if (event === 'activate') return 'listening'
      break
  }
  
  return current
}

/**
 * Check if text contains an exit command
 */
export function isExitCommand(text: string): boolean {
  const lower = text.toLowerCase().trim()
  return EXIT_PATTERNS.some(pattern => lower.includes(pattern))
}

/**
 * Check if text contains a wake word
 */
export function isWakeWord(text: string, customWords?: string[]): boolean {
  const lower = text.toLowerCase().trim()
  const words = customWords || DEFAULT_CONFIG.wakeWords
  return words.some(word => lower.includes(word))
}

/**
 * Create a new voice session
 */
export function createSession(): VoiceSession {
  return {
    state: 'idle',
    startTime: new Date(),
    interactionCount: 0,
    lastActivity: new Date(),
    errorCount: 0
  }
}

/**
 * Update session with new state
 */
export function updateSession(session: VoiceSession, event: VoiceEvent): VoiceSession {
  const newState = transition(session.state, event)
  
  return {
    ...session,
    state: newState,
    lastActivity: new Date(),
    interactionCount: event === 'speech_detected' 
      ? session.interactionCount + 1 
      : session.interactionCount,
    errorCount: event === 'error' 
      ? session.errorCount + 1 
      : session.errorCount
  }
}

/**
 * Check if session has exceeded maximum time
 */
export function isSessionExpired(session: VoiceSession, maxMinutes: number = DEFAULT_CONFIG.maxContinuousTime): boolean {
  const elapsed = Date.now() - session.startTime.getTime()
  return elapsed > maxMinutes * 60 * 1000
}

/**
 * Get state display info
 */
export function getStateDisplay(state: VoiceState, locale: string): { icon: string; text: string; description: string } {
  const isPortuguese = locale.startsWith('pt')
  
  switch (state) {
    case 'idle':
      return {
        icon: '🎤',
        text: isPortuguese ? 'Modo Voz Inativo' : 'Voice Mode Off',
        description: isPortuguese ? 'Toque para ativar' : 'Tap to activate'
      }
    case 'listening':
      return {
        icon: '🎤',
        text: isPortuguese ? 'A ouvir...' : 'Listening...',
        description: isPortuguese ? 'Fale agora' : 'Speak now'
      }
    case 'processing':
      return {
        icon: '🧠',
        text: isPortuguese ? 'A processar...' : 'Processing...',
        description: isPortuguese ? 'A pensar...' : 'Thinking...'
      }
    case 'speaking':
      return {
        icon: '🔊',
        text: isPortuguese ? 'A falar...' : 'Speaking...',
        description: isPortuguese ? 'Cora está a responder' : 'Cora is responding'
      }
    case 'paused':
      return {
        icon: '⏸️',
        text: isPortuguese ? 'Em pausa' : 'Paused',
        description: isPortuguese ? 'Diga "Olá Cora" para continuar' : 'Say "Hey Cora" to continue'
      }
  }
}
