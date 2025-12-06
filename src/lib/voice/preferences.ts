/**
 * Voice preferences management
 * Stores and retrieves user voice settings
 */

export type VoiceSpeed = 'slow' | 'normal' | 'fast'

export interface VoicePreferences {
  enabled: boolean
  speed: VoiceSpeed
  autoListenAfterResponse: boolean
  confirmBeforeSending: boolean
  preferredVoiceId?: string
}

export const DEFAULT_VOICE_PREFERENCES: VoicePreferences = {
  enabled: false,
  speed: 'normal',
  autoListenAfterResponse: false,
  confirmBeforeSending: false,
  preferredVoiceId: undefined
}

const STORAGE_KEY = 'cora_voice_preferences'

/**
 * Get voice preferences from local storage
 */
export function getVoicePreferences(): VoicePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_VOICE_PREFERENCES
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_VOICE_PREFERENCES, ...parsed }
    }
  } catch (e) {
    console.error('Failed to load voice preferences:', e)
  }

  return DEFAULT_VOICE_PREFERENCES
}

/**
 * Save voice preferences to local storage
 */
export function setVoicePreferences(preferences: Partial<VoicePreferences>): VoicePreferences {
  const current = getVoicePreferences()
  const updated = { ...current, ...preferences }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save voice preferences:', e)
    }
  }

  return updated
}

/**
 * Reset voice preferences to defaults
 */
export function resetVoicePreferences(): VoicePreferences {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to reset voice preferences:', e)
    }
  }
  return DEFAULT_VOICE_PREFERENCES
}

/**
 * Check if screen reader is likely active
 */
export function isScreenReaderActive(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for common screen reader indicators
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  // Note: There's no reliable way to detect screen readers
  // We use reduced motion as a proxy since screen reader users often enable it
  return hasReducedMotion
}

/**
 * Check accessibility context
 */
export interface AccessibilityContext {
  prefersReducedMotion: boolean
  speechSynthesisSupported: boolean
  speechRecognitionSupported: boolean
}

export function getAccessibilityContext(): AccessibilityContext {
  if (typeof window === 'undefined') {
    return {
      prefersReducedMotion: false,
      speechSynthesisSupported: false,
      speechRecognitionSupported: false
    }
  }

  return {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    speechSynthesisSupported: 'speechSynthesis' in window,
    speechRecognitionSupported: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  }
}

/**
 * Speed value mappings for display
 */
export const SPEED_LABELS: Record<VoiceSpeed, { en: string; pt: string }> = {
  slow: { en: 'Slow', pt: 'Lento' },
  normal: { en: 'Normal', pt: 'Normal' },
  fast: { en: 'Fast', pt: 'Rápido' }
}

export const SPEED_VALUES: Record<VoiceSpeed, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25
}
