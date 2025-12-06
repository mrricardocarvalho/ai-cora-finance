"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TextToSpeechService, getTTSService, isTTSSupported, VoiceSpeed } from '../../lib/voice/text-to-speech'
import { getVoicePreferences, setVoicePreferences } from '../../lib/voice/preferences'
import { useI18n } from '../../lib/i18n'

interface VoiceResponseProps {
  text: string
  autoPlay?: boolean
  onSpeakingChange?: (isSpeaking: boolean) => void
  onComplete?: () => void
  compact?: boolean
  className?: string
}

const SPEED_OPTIONS: VoiceSpeed[] = ['slow', 'normal', 'fast']
const SPEED_LABELS: Record<VoiceSpeed, string> = {
  slow: '0.75×',
  normal: '1×',
  fast: '1.25×'
}

export default function VoiceResponse({
  text,
  autoPlay = false,
  onSpeakingChange,
  onComplete,
  compact = false,
  className = ''
}: VoiceResponseProps) {
  const { locale } = useI18n()
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState<VoiceSpeed>('normal')
  const [tts, setTts] = useState<TextToSpeechService | null>(null)

  // Initialize TTS on mount
  useEffect(() => {
    const supported = isTTSSupported()
    setIsSupported(supported)

    if (supported) {
      const prefs = getVoicePreferences()
      setSpeed(prefs.speed)

      const service = getTTSService({
        locale,
        speed: prefs.speed,
        voiceId: prefs.preferredVoiceId,
        onStart: () => {
          setIsSpeaking(true)
          setIsPaused(false)
          onSpeakingChange?.(true)
        },
        onEnd: () => {
          setIsSpeaking(false)
          setIsPaused(false)
          onSpeakingChange?.(false)
          onComplete?.()
        },
        onPause: () => setIsPaused(true),
        onResume: () => setIsPaused(false),
        onError: (err) => {
          console.error('TTS Error:', err)
          setIsSpeaking(false)
          setIsPaused(false)
          onSpeakingChange?.(false)
        }
      })

      setTts(service)

      // Auto-play if enabled
      if (autoPlay && prefs.enabled && text) {
        // Small delay to ensure component is mounted
        setTimeout(() => {
          service.speak(text)
        }, 100)
      }
    }

    return () => {
      // Cleanup: stop any ongoing speech
      if (tts) {
        tts.stop()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  // Handle text changes
  useEffect(() => {
    if (autoPlay && tts && text) {
      const prefs = getVoicePreferences()
      if (prefs.enabled) {
        tts.stop()
        setTimeout(() => {
          tts.speak(text)
        }, 100)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  const handlePlay = useCallback(() => {
    if (!tts || !text) return

    if (isPaused) {
      tts.resume()
    } else if (isSpeaking) {
      tts.pause()
    } else {
      tts.speak(text)
    }
  }, [tts, text, isPaused, isSpeaking])

  const handleStop = useCallback(() => {
    if (tts) {
      tts.stop()
      setIsSpeaking(false)
      setIsPaused(false)
      onSpeakingChange?.(false)
    }
  }, [tts, onSpeakingChange])

  const handleSpeedChange = useCallback(() => {
    const currentIndex = SPEED_OPTIONS.indexOf(speed)
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
    const newSpeed = SPEED_OPTIONS[nextIndex]
    
    setSpeed(newSpeed)
    setVoicePreferences({ speed: newSpeed })
    
    if (tts) {
      tts.setSpeed(newSpeed)
    }
  }, [speed, tts])

  if (!isSupported) {
    return null
  }

  if (compact) {
    return (
      <button
        onClick={handlePlay}
        className={`p-2 rounded-full transition-all duration-200 ${
          isSpeaking
            ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
            : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
        } ${className}`}
        title={isSpeaking ? 'Pause' : 'Listen'}
        aria-label={isSpeaking ? 'Pause speech' : 'Read message aloud'}
      >
        {isSpeaking ? (
          isPaused ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    )
  }

  return (
    <AnimatePresence>
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] ${className}`}
        >
          {/* Animated waveform indicator */}
          <div className="flex items-center gap-0.5 h-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-[var(--primary)] rounded-full"
                animate={{
                  height: isPaused ? 8 : [8, 16, 8],
                }}
                transition={{
                  repeat: isPaused ? 0 : Infinity,
                  duration: 0.5,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Play/Pause button */}
          <button
            onClick={handlePlay}
            className="p-1.5 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
            aria-label={isPaused ? 'Resume speech' : 'Pause speech'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-[var(--primary)]" />
            ) : (
              <Pause className="w-4 h-4 text-[var(--primary)]" />
            )}
          </button>

          {/* Stop button */}
          <button
            onClick={handleStop}
            className="p-1.5 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Stop speech"
          >
            <Square className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>

          {/* Speed control */}
          <button
            onClick={handleSpeedChange}
            className="px-2 py-1 text-xs font-medium rounded bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label={`Speech speed: ${SPEED_LABELS[speed]}`}
          >
            {SPEED_LABELS[speed]}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Voice toggle button for enabling/disabling voice responses
 */
export function VoiceToggle({ className = '' }: { className?: string }) {
  const [enabled, setEnabled] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const supported = isTTSSupported()
    setIsSupported(supported)
    if (supported) {
      const prefs = getVoicePreferences()
      setEnabled(prefs.enabled)
    }
  }, [])

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    setVoicePreferences({ enabled: newEnabled })
  }

  if (!isSupported) {
    return null
  }

  return (
    // eslint-disable-next-line jsx-a11y/aria-proptypes
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        enabled
          ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20'
          : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-hover)]'
      } ${className}`}
      aria-label={enabled ? 'Disable voice responses' : 'Enable voice responses'}
      aria-pressed={enabled ? 'true' : 'false'}
    >
      {enabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {enabled ? '🔊 Voice On' : '🔇 Voice Off'}
      </span>
    </button>
  )
}
