"use client"

import React, { useEffect, useState } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeechRecognition } from '../../lib/voice/useSpeechRecognition'
import { useAudioRecorder } from '../../lib/voice/useAudioRecorder'
import { transcribeAudio } from '../../lib/actions/voice'
import AudioWaveform from './AudioWaveform'
import { useTranslations } from '../../lib/i18n'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onListeningChange?: (isListening: boolean) => void
  disabled?: boolean
  className?: string
}

export default function VoiceInput({ 
  onTranscript, 
  onListeningChange, 
  disabled = false,
  className = ''
}: VoiceInputProps) {
  const t = useTranslations()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { 
    isListening: isSpeechListening, 
    isSupported: isSpeechSupported, 
    error: speechError, 
    startListening: startSpeech, 
    stopListening: stopSpeech 
  } = useSpeechRecognition({
    onResult: (transcript) => {
      onTranscript(transcript)
    },
    onError: (err) => {
      console.error('Voice input error:', err)
    }
  })

  const {
    isRecording: isRecorderRecording,
    startRecording: startRecorder,
    stopRecording: stopRecorder,
    error: recorderError
  } = useAudioRecorder()

  const isListening = isSpeechSupported ? isSpeechListening : isRecorderRecording
  const error = speechError || recorderError

  useEffect(() => {
    onListeningChange?.(isListening || isProcessing)
  }, [isListening, isProcessing, onListeningChange])

  const handleClick = async () => {
    if (isSpeechSupported) {
      if (isSpeechListening) {
        stopSpeech()
      } else {
        startSpeech()
      }
    } else {
      if (isRecorderRecording) {
        setIsProcessing(true)
        try {
          const blob = await stopRecorder()
          const formData = new FormData()
          formData.append('file', blob, 'recording.webm')
          
          const result = await transcribeAudio(formData)
          if (result.success && result.text) {
            onTranscript(result.text)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setIsProcessing(false)
        }
      } else {
        await startRecorder()
      }
    }
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <AnimatePresence>
        {(isListening || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="absolute right-full mr-2 flex items-center bg-surface border border-[var(--border)] rounded-full px-3 py-1 shadow-sm whitespace-nowrap overflow-hidden"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
            ) : (
              <AudioWaveform isListening={isListening} />
            )}
            <span className="text-xs text-[var(--text-secondary)] ml-2">
              {isProcessing ? (t.common?.loading || 'Processing...') : (t.chat?.listening || 'Listening...')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`
          p-3 rounded-full transition-all duration-200
          ${isListening 
            ? 'bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20 animate-pulse' 
            : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
          }
          ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isListening ? (t.chat?.stopListening || 'Stop listening') : (t.chat?.startListening || 'Start voice input')}
        aria-label={isListening ? (t.chat?.stopListening || 'Stop listening') : (t.chat?.startListening || 'Start voice input')}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
      
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[var(--danger)] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {t.common?.error || 'Error'}
        </div>
      )}
    </div>
  )
}
