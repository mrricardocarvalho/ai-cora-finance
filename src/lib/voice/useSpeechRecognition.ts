"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { SpeechRecognitionService } from './speech-to-text'

interface UseSpeechRecognitionProps {
  onResult?: (transcript: string, isFinal: boolean) => void
  onEnd?: () => void
  onError?: (error: string) => void
  lang?: string
}

export function useSpeechRecognition({ onResult, onEnd, onError, lang = 'pt-PT' }: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const serviceRef = useRef<SpeechRecognitionService | null>(null)

  useEffect(() => {
    serviceRef.current = new SpeechRecognitionService({
      lang,
      continuous: false,
      interimResults: true,
      onStart: () => setIsListening(true),
      onEnd: () => {
        setIsListening(false)
        onEnd?.()
      },
      onError: (err) => {
        setIsListening(false)
        setError(err)
        onError?.(err)
      },
      onResult: (transcript, isFinal) => {
        onResult?.(transcript, isFinal)
      }
    })

    setIsSupported(serviceRef.current.getIsSupported())

    return () => {
      serviceRef.current?.stop()
    }
  }, [lang, onResult, onEnd, onError])

  const startListening = useCallback(() => {
    setError(null)
    serviceRef.current?.start()
  }, [])

  const stopListening = useCallback(() => {
    serviceRef.current?.stop()
  }, [])

  const abortListening = useCallback(() => {
    serviceRef.current?.abort()
  }, [])

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    abortListening
  }
}
