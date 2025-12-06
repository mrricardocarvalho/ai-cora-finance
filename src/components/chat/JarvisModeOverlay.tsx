"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, Mic, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  VoiceEvent,
  VoiceSession,
  createSession, 
  updateSession, 
  isExitCommand,
  getStateDisplay,
  DEFAULT_CONFIG
} from '../../lib/voice/conversation-mode'
import { SpeechRecognitionService } from '../../lib/voice/speech-to-text'
import { TextToSpeechService, getTTSService, isTTSSupported } from '../../lib/voice/text-to-speech'
import { getVoicePreferences } from '../../lib/voice/preferences'
import { useI18n } from '../../lib/i18n'
import CoraAvatar from '../shared/cora-avatar'

interface JarvisModeOverlayProps {
  isOpen: boolean
  onClose: () => void
  onMessage: (message: string) => Promise<string>
}

export default function JarvisModeOverlay({
  isOpen,
  onClose,
  onMessage
}: JarvisModeOverlayProps) {
  const { locale } = useI18n()
  
  const [session, setSession] = useState<VoiceSession>(createSession())
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognitionService | null>(null)
  const ttsRef = useRef<TextToSpeechService | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Dispatch event and update session
  const dispatch = useCallback((event: VoiceEvent) => {
    setSession(prev => updateSession(prev, event))
  }, [])

  // Clear timeouts
  const clearTimeouts = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
      pauseTimeoutRef.current = null
    }
  }, [])

  // Start listening
  const startListening = useCallback(() => {
    clearTimeouts()
    setTranscript('')
    setError(null)
    
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
    
    // Set silence timeout
    silenceTimeoutRef.current = setTimeout(() => {
      dispatch('timeout')
    }, DEFAULT_CONFIG.silenceTimeout * 1000)
  }, [clearTimeouts, dispatch])

  // Stop listening
  const stopListening = useCallback(() => {
    clearTimeouts()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [clearTimeouts])

  // Speak response
  const speak = useCallback((text: string) => {
    if (ttsRef.current && text) {
      setResponse(text)
      ttsRef.current.speak(text)
    }
  }, [])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.stop()
    }
  }, [])

  // Handle user transcript
  const handleTranscript = useCallback(async (text: string, isFinal: boolean) => {
    setTranscript(text)
    
    // Reset silence timeout on any speech
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = setTimeout(() => {
        dispatch('timeout')
      }, DEFAULT_CONFIG.silenceTimeout * 1000)
    }
    
    if (isFinal && text.trim()) {
      // Check for exit command
      if (isExitCommand(text)) {
        dispatch('deactivate')
        onClose()
        return
      }
      
      dispatch('speech_detected')
      stopListening()
      
      try {
        // Get response from chat
        const responseText = await onMessage(text)
        
        dispatch('response_ready')
        speak(responseText)
      } catch (err) {
        console.error('Jarvis mode error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        dispatch('error')
      }
    }
  }, [dispatch, stopListening, onMessage, speak, onClose])

  // Initialize services
  useEffect(() => {
    if (!isOpen) return

    const prefs = getVoicePreferences()

    // Initialize speech recognition
    recognitionRef.current = new SpeechRecognitionService({
      lang: locale,
      continuous: false,
      interimResults: true,
      onStart: () => {
        dispatch('activate')
      },
      onResult: handleTranscript,
      onEnd: () => {
        // Will be handled by state machine
      },
      onError: (err) => {
        console.error('Recognition error:', err)
        setError(err)
        dispatch('error')
      }
    })

    // Initialize TTS
    if (isTTSSupported()) {
      ttsRef.current = getTTSService({
        locale,
        speed: prefs.speed,
        voiceId: prefs.preferredVoiceId,
        onStart: () => {
          // Speaking started
        },
        onEnd: () => {
          dispatch('finished_speaking')
          
          // Auto-listen after response if enabled
          if (prefs.autoListenAfterResponse) {
            pauseTimeoutRef.current = setTimeout(() => {
              startListening()
            }, DEFAULT_CONFIG.pauseAfterSpeaking * 1000)
          }
        },
        onError: (err) => {
          console.error('TTS error:', err)
          dispatch('error')
        }
      })
    }

    // Start listening when opened
    dispatch('activate')
    startListening()

    return () => {
      clearTimeouts()
      stopListening()
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, locale])

  // Handle state changes
  useEffect(() => {
    switch (session.state) {
      case 'listening':
        if (!recognitionRef.current?.getIsSupported()) return
        // Start listening if not already
        break
      case 'paused':
        stopListening()
        break
      case 'idle':
        stopListening()
        stopSpeaking()
        break
    }
  }, [session.state, stopListening, stopSpeaking])

  // Handle user interruption
  const handleInterrupt = useCallback(() => {
    if (session.state === 'speaking') {
      stopSpeaking()
      dispatch('interrupted')
      startListening()
    }
  }, [session.state, stopSpeaking, dispatch, startListening])

  // Get state display info
  const stateInfo = getStateDisplay(session.state, locale)
  const isPortuguese = locale.startsWith('pt')

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={(e) => {
          // Only close if clicking the backdrop, not content
          if (e.target === e.currentTarget) {
            dispatch('deactivate')
            onClose()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="flex flex-col items-center justify-center h-full px-4"
        >
          {/* Close button */}
          <button
            onClick={() => {
              dispatch('deactivate')
              onClose()
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isPortuguese ? 'Fechar' : 'Close'}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Title */}
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-white text-xl font-semibold mb-8 flex items-center gap-2"
          >
            <span className="text-2xl">🎤</span>
            {isPortuguese ? 'Modo Jarvis Ativo' : 'Jarvis Mode Active'}
          </motion.h2>

          {/* Cora Avatar with state animation */}
          <motion.div
            className="relative mb-8"
            animate={{
              scale: session.state === 'speaking' ? [1, 1.05, 1] : 1
            }}
            transition={{
              repeat: session.state === 'speaking' ? Infinity : 0,
              duration: 1.5
            }}
          >
            <CoraAvatar
              state={
                session.state === 'processing' ? 'thinking' :
                session.state === 'speaking' ? 'speaking' :
                'idle'
              }
              size={96}
            />
            
            {/* Pulsing ring for listening state */}
            {session.state === 'listening' && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[var(--primary)]"
                animate={{
                  scale: [1, 1.4, 1.4],
                  opacity: [0.8, 0, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5
                }}
              />
            )}
          </motion.div>

          {/* Audio waveform visualization */}
          {(session.state === 'listening' || session.state === 'speaking') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-1 h-16 mb-4"
            >
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 rounded-full ${
                    session.state === 'listening' 
                      ? 'bg-[var(--primary)]' 
                      : 'bg-[var(--accent)]'
                  }`}
                  animate={{
                    height: [16, 32 + Math.random() * 24, 16]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + Math.random() * 0.3,
                    delay: i * 0.1
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* State indicator */}
          <motion.div
            key={session.state}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-6"
          >
            <p className="text-2xl mb-1">{stateInfo.icon}</p>
            <p className="text-white text-lg font-medium">{stateInfo.text}</p>
            <p className="text-white/60 text-sm">{stateInfo.description}</p>
          </motion.div>

          {/* Transcript display */}
          {transcript && session.state !== 'speaking' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md bg-white/10 rounded-lg px-4 py-3 mb-4"
            >
              <p className="text-white text-center">&ldquo;{transcript}&rdquo;</p>
            </motion.div>
          )}

          {/* Response display */}
          {response && session.state === 'speaking' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md bg-[var(--primary)]/20 rounded-lg px-4 py-3 mb-4"
              onClick={handleInterrupt}
            >
              <p className="text-white text-center text-sm line-clamp-3">{response}</p>
              <p className="text-white/50 text-xs text-center mt-2">
                {isPortuguese ? 'Toque para interromper' : 'Tap to interrupt'}
              </p>
            </motion.div>
          )}

          {/* Processing indicator */}
          {session.state === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-white/80"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isPortuguese ? 'A pensar...' : 'Thinking...'}</span>
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 text-red-200 rounded-lg px-4 py-2 mb-4"
            >
              {error}
            </motion.div>
          )}

          {/* Exit instructions */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-sm mt-8"
          >
            {isPortuguese 
              ? 'Diga "Parar de ouvir" para sair' 
              : 'Say "Stop listening" to exit'}
          </motion.p>

          {/* Quick action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mt-6"
          >
            {/* Resume/Pause button for paused state */}
            {session.state === 'paused' && (
              <button
                onClick={() => {
                  dispatch('resume')
                  startListening()
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-hover)] transition-colors"
              >
                <Mic className="w-4 h-4" />
                {isPortuguese ? 'Continuar' : 'Resume'}
              </button>
            )}

            {/* Mic toggle for speaking state */}
            {session.state === 'speaking' && (
              <button
                onClick={handleInterrupt}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
              >
                <Mic className="w-4 h-4" />
                {isPortuguese ? 'Interromper' : 'Interrupt'}
              </button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
