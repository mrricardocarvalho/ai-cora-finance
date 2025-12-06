/**
 * Text-to-Speech service for Cora voice responses
 * Uses Web Speech Synthesis API with voice selection and playback controls
 */

import { preprocessForSpeech, extractReadableContent, containsNonReadableContent } from './text-preprocessing'

export type VoiceSpeed = 'slow' | 'normal' | 'fast'

export interface TTSOptions {
  locale: string
  speed: VoiceSpeed
  voiceId?: string
  onStart?: () => void
  onEnd?: () => void
  onPause?: () => void
  onResume?: () => void
  onError?: (error: string) => void
  onBoundary?: (charIndex: number) => void
}

export interface VoiceInfo {
  id: string
  name: string
  lang: string
  localName: string
  isDefault: boolean
  gender?: 'female' | 'male' | 'unknown'
}

const SPEED_VALUES: Record<VoiceSpeed, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.25
}

// Preferred voice patterns for Cora's persona (female, natural-sounding)
const PREFERRED_VOICE_PATTERNS = {
  'pt': ['maria', 'joana', 'ana', 'female', 'google', 'microsoft'],
  'en': ['samantha', 'victoria', 'female', 'google', 'microsoft', 'zira']
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private options: TTSOptions
  private isPaused: boolean = false
  private voices: SpeechSynthesisVoice[] = []
  private voicesLoaded: boolean = false

  constructor(options: TTSOptions) {
    this.options = options
    this.init()
  }

  private init() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
      this.loadVoices()
      
      // Voices may load asynchronously
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices()
      this.voicesLoaded = this.voices.length > 0
    }
  }

  public isSupported(): boolean {
    return this.synthesis !== null
  }

  public getAvailableVoices(filterLocale?: string): VoiceInfo[] {
    if (!this.voicesLoaded) {
      this.loadVoices()
    }

    let filtered = this.voices
    if (filterLocale) {
      const langPrefix = filterLocale.split('-')[0].toLowerCase()
      filtered = this.voices.filter(v => 
        v.lang.toLowerCase().startsWith(langPrefix)
      )
    }

    return filtered.map(v => ({
      id: v.voiceURI,
      name: v.name,
      lang: v.lang,
      localName: v.localService ? v.name : `${v.name} (Online)`,
      isDefault: v.default,
      gender: this.detectGender(v.name)
    }))
  }

  private detectGender(voiceName: string): 'female' | 'male' | 'unknown' {
    const name = voiceName.toLowerCase()
    const femalePatterns = ['female', 'woman', 'samantha', 'victoria', 'karen', 'moira', 'zira', 'maria', 'joana', 'ana', 'helena', 'catarina']
    const malePatterns = ['male', 'man', 'daniel', 'alex', 'david', 'james', 'carlos', 'pedro', 'joao', 'miguel']
    
    if (femalePatterns.some(p => name.includes(p))) return 'female'
    if (malePatterns.some(p => name.includes(p))) return 'male'
    return 'unknown'
  }

  private getBestVoice(locale: string): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded) {
      this.loadVoices()
    }

    // If user specified a voice, try to find it
    if (this.options.voiceId) {
      const userVoice = this.voices.find(v => v.voiceURI === this.options.voiceId)
      if (userVoice) return userVoice
    }

    const langPrefix = locale.split('-')[0].toLowerCase()
    const matchingVoices = this.voices.filter(v => 
      v.lang.toLowerCase().startsWith(langPrefix)
    )

    if (matchingVoices.length === 0) {
      // Fallback to any available voice
      return this.voices[0] || null
    }

    // Get preferred patterns for this language
    const patterns = PREFERRED_VOICE_PATTERNS[langPrefix as keyof typeof PREFERRED_VOICE_PATTERNS] || ['female', 'google']

    // Score voices based on preferred patterns
    const scoredVoices = matchingVoices.map(voice => {
      let score = 0
      const nameLower = voice.name.toLowerCase()
      
      patterns.forEach((pattern, index) => {
        if (nameLower.includes(pattern)) {
          score += patterns.length - index // Higher score for earlier patterns
        }
      })
      
      // Prefer online/high-quality voices
      if (!voice.localService) score += 1
      
      // Prefer exact locale match
      if (voice.lang.toLowerCase() === locale.toLowerCase()) score += 2
      
      return { voice, score }
    })

    // Sort by score descending
    scoredVoices.sort((a, b) => b.score - a.score)
    
    return scoredVoices[0]?.voice || matchingVoices[0]
  }

  public speak(text: string): void {
    if (!this.synthesis) {
      this.options.onError?.('Speech synthesis not supported')
      return
    }

    // Cancel any ongoing speech
    this.stop()

    // Preprocess text for natural speech
    const processedText = containsNonReadableContent(text)
      ? extractReadableContent(text, this.options.locale)
      : preprocessForSpeech(text, this.options.locale)

    if (!processedText.trim()) {
      this.options.onEnd?.()
      return
    }

    // Create utterance
    this.currentUtterance = new SpeechSynthesisUtterance(processedText)
    this.currentUtterance.lang = this.options.locale
    this.currentUtterance.rate = SPEED_VALUES[this.options.speed]
    this.currentUtterance.pitch = 1.0
    this.currentUtterance.volume = 1.0

    // Set voice
    const voice = this.getBestVoice(this.options.locale)
    if (voice) {
      this.currentUtterance.voice = voice
    }

    // Set up event handlers
    this.currentUtterance.onstart = () => {
      this.isPaused = false
      this.options.onStart?.()
    }

    this.currentUtterance.onend = () => {
      this.currentUtterance = null
      this.isPaused = false
      this.options.onEnd?.()
    }

    this.currentUtterance.onerror = (event) => {
      console.error('TTS Error:', event.error)
      this.currentUtterance = null
      this.isPaused = false
      this.options.onError?.(event.error)
    }

    this.currentUtterance.onpause = () => {
      this.isPaused = true
      this.options.onPause?.()
    }

    this.currentUtterance.onresume = () => {
      this.isPaused = false
      this.options.onResume?.()
    }

    this.currentUtterance.onboundary = (event) => {
      this.options.onBoundary?.(event.charIndex)
    }

    // Speak
    this.synthesis.speak(this.currentUtterance)
  }

  public pause(): void {
    if (this.synthesis && this.synthesis.speaking && !this.isPaused) {
      this.synthesis.pause()
    }
  }

  public resume(): void {
    if (this.synthesis && this.isPaused) {
      this.synthesis.resume()
    }
  }

  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.currentUtterance = null
      this.isPaused = false
    }
  }

  public isSpeaking(): boolean {
    return this.synthesis?.speaking || false
  }

  public isPausedState(): boolean {
    return this.isPaused
  }

  public setSpeed(speed: VoiceSpeed): void {
    this.options.speed = speed
  }

  public setVoice(voiceId: string): void {
    this.options.voiceId = voiceId
  }

  public setLocale(locale: string): void {
    this.options.locale = locale
  }

  public updateOptions(options: Partial<TTSOptions>): void {
    this.options = { ...this.options, ...options }
  }
}

// Singleton instance for app-wide use
let ttsInstance: TextToSpeechService | null = null

export function getTTSService(options?: Partial<TTSOptions>): TextToSpeechService {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeechService({
      locale: options?.locale || 'en-US',
      speed: options?.speed || 'normal',
      ...options
    })
  } else if (options) {
    ttsInstance.updateOptions(options)
  }
  return ttsInstance
}

export function isTTSSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'speechSynthesis' in window
}
