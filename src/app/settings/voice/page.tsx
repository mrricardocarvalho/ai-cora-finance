"use client"

import React, { useState, useEffect } from 'react'
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  Shield, 
  Keyboard, 
  WifiOff,
  Play,
  ChevronLeft,
  Check
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  getVoicePreferences, 
  setVoicePreferences, 
  VoicePreferences, 
  VoiceSpeed,
  SPEED_LABELS,
  getAccessibilityContext,
  DEFAULT_VOICE_PREFERENCES
} from '../../../lib/voice/preferences'
import { 
  getTTSService, 
  VoiceInfo 
} from '../../../lib/voice/text-to-speech'
import { useI18n } from '../../../lib/i18n'

export default function VoiceSettingsPage() {
  const { locale } = useI18n()
  const isPortuguese = locale.startsWith('pt')

  const [preferences, setPreferences] = useState<VoicePreferences>(DEFAULT_VOICE_PREFERENCES)
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([])
  const [ttsSupported, setTtsSupported] = useState(false)
  const [sttSupported, setSttSupported] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false)
  const [testPlaying, setTestPlaying] = useState(false)

  // Load preferences and check support
  useEffect(() => {
    const prefs = getVoicePreferences()
    setPreferences(prefs)

    const context = getAccessibilityContext()
    setTtsSupported(context.speechSynthesisSupported)
    setSttSupported(context.speechRecognitionSupported)
    setIsOnline(navigator.onLine)

    // Load available voices
    if (context.speechSynthesisSupported) {
      const tts = getTTSService({ locale })
      // Voices may load async, so try again after a delay
      const loadVoices = () => {
        const voices = tts.getAvailableVoices(locale)
        setAvailableVoices(voices)
      }
      loadVoices()
      setTimeout(loadVoices, 500)
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [locale])

  // Update preference
  const updatePreference = <K extends keyof VoicePreferences>(
    key: K, 
    value: VoicePreferences[K]
  ) => {
    const updated = setVoicePreferences({ [key]: value })
    setPreferences(updated)

    // Show privacy notice when enabling voice for first time
    if (key === 'enabled' && value === true && !showPrivacyNotice) {
      setShowPrivacyNotice(true)
    }
  }

  // Test voice
  const testVoice = () => {
    if (!ttsSupported) return

    setTestPlaying(true)
    const tts = getTTSService({
      locale,
      speed: preferences.speed,
      voiceId: preferences.preferredVoiceId,
      onEnd: () => setTestPlaying(false),
      onError: () => setTestPlaying(false)
    })

    const testText = isPortuguese
      ? 'Olá! Eu sou a Cora, a tua assistente financeira. Como posso ajudar-te hoje?'
      : 'Hello! I am Cora, your financial assistant. How can I help you today?'

    tts.speak(testText)
  }

  const stopTest = () => {
    const tts = getTTSService({ locale })
    tts.stop()
    setTestPlaying(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link 
          href="/settings" 
          className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
          aria-label={isPortuguese ? 'Voltar' : 'Back'}
        >
          <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {isPortuguese ? 'Definições de Voz' : 'Voice Settings'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isPortuguese 
              ? 'Configure a experiência de voz da Cora' 
              : 'Configure Cora\'s voice experience'}
          </p>
        </div>
      </div>

      {/* Offline warning */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-xl flex items-center gap-3"
        >
          <WifiOff className="w-5 h-5 text-[var(--warning)]" />
          <p className="text-sm text-[var(--warning)]">
            {isPortuguese 
              ? 'As funcionalidades de voz requerem ligação à internet.' 
              : 'Voice features require an internet connection.'}
          </p>
        </motion.div>
      )}

      {/* Browser support warning */}
      {(!ttsSupported || !sttSupported) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-xl"
        >
          <p className="text-sm text-[var(--warning)]">
            {!ttsSupported && !sttSupported
              ? (isPortuguese 
                ? 'O seu navegador não suporta funcionalidades de voz.' 
                : 'Your browser does not support voice features.')
              : !ttsSupported
                ? (isPortuguese 
                  ? 'O seu navegador não suporta síntese de voz.' 
                  : 'Your browser does not support speech synthesis.')
                : (isPortuguese 
                  ? 'O seu navegador não suporta reconhecimento de voz.' 
                  : 'Your browser does not support speech recognition.')}
          </p>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Voice Responses Toggle */}
        <SettingCard
          icon={preferences.enabled ? Volume2 : VolumeX}
          title={isPortuguese ? 'Respostas por Voz' : 'Voice Responses'}
          description={isPortuguese 
            ? 'A Cora lê as respostas em voz alta' 
            : 'Cora reads responses aloud'}
        >
          <ToggleSwitch
            enabled={preferences.enabled}
            onChange={(enabled) => updatePreference('enabled', enabled)}
            disabled={!ttsSupported}
            ariaLabel={isPortuguese ? 'Ativar respostas por voz' : 'Enable voice responses'}
          />
        </SettingCard>

        {/* Voice Speed */}
        <SettingCard
          icon={Play}
          title={isPortuguese ? 'Velocidade da Voz' : 'Voice Speed'}
          description={isPortuguese 
            ? 'Ajusta a velocidade da fala' 
            : 'Adjust speech speed'}
        >
          <div className="flex gap-2">
            {(['slow', 'normal', 'fast'] as VoiceSpeed[]).map((speed) => (
              <button
                key={speed}
                onClick={() => updatePreference('speed', speed)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  preferences.speed === speed
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
                disabled={!ttsSupported}
              >
                {SPEED_LABELS[speed][isPortuguese ? 'pt' : 'en']}
              </button>
            ))}
          </div>
        </SettingCard>

        {/* Voice Selection */}
        {availableVoices.length > 0 && (
          <SettingCard
            icon={Volume2}
            title={isPortuguese ? 'Voz Preferida' : 'Preferred Voice'}
            description={isPortuguese 
              ? 'Escolhe a voz da Cora' 
              : 'Choose Cora\'s voice'}
          >
            <select
              value={preferences.preferredVoiceId || ''}
              onChange={(e) => updatePreference('preferredVoiceId', e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-surface text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              disabled={!ttsSupported}
              aria-label={isPortuguese ? 'Selecionar voz preferida' : 'Select preferred voice'}
            >
              <option value="">
                {isPortuguese ? 'Automático (recomendado)' : 'Automatic (recommended)'}
              </option>
              {availableVoices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.localName} {voice.gender === 'female' ? '♀' : voice.gender === 'male' ? '♂' : ''}
                </option>
              ))}
            </select>
          </SettingCard>
        )}

        {/* Test Voice */}
        {ttsSupported && (
          <SettingCard
            icon={Volume2}
            title={isPortuguese ? 'Testar Voz' : 'Test Voice'}
            description={isPortuguese 
              ? 'Ouve uma amostra da voz da Cora' 
              : 'Hear a sample of Cora\'s voice'}
          >
            <button
              onClick={testPlaying ? stopTest : testVoice}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                testPlaying
                  ? 'bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20'
                  : 'bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20'
              }`}
            >
              {testPlaying ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  {isPortuguese ? 'Parar' : 'Stop'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {isPortuguese ? 'Ouvir' : 'Listen'}
                </>
              )}
            </button>
          </SettingCard>
        )}

        {/* Auto-listen after response */}
        <SettingCard
          icon={Mic}
          title={isPortuguese ? 'Ouvir Automaticamente' : 'Auto-listen After Response'}
          description={isPortuguese 
            ? 'Ativa o microfone após a Cora responder' 
            : 'Activate microphone after Cora responds'}
        >
          <ToggleSwitch
            enabled={preferences.autoListenAfterResponse}
            onChange={(enabled) => updatePreference('autoListenAfterResponse', enabled)}
            disabled={!sttSupported}
            ariaLabel={isPortuguese ? 'Ouvir automaticamente' : 'Auto-listen after response'}
          />
        </SettingCard>

        {/* Confirmation before sending */}
        <SettingCard
          icon={Check}
          title={isPortuguese ? 'Confirmar Antes de Enviar' : 'Confirm Before Sending'}
          description={isPortuguese 
            ? 'Pede confirmação antes de enviar mensagens de voz' 
            : 'Ask for confirmation before sending voice messages'}
        >
          <ToggleSwitch
            enabled={preferences.confirmBeforeSending}
            onChange={(enabled) => updatePreference('confirmBeforeSending', enabled)}
            disabled={!sttSupported}
            ariaLabel={isPortuguese ? 'Confirmar antes de enviar' : 'Confirm before sending'}
          />
        </SettingCard>

        {/* Keyboard Shortcuts */}
        <SettingCard
          icon={Keyboard}
          title={isPortuguese ? 'Atalhos de Teclado' : 'Keyboard Shortcuts'}
          description={isPortuguese 
            ? 'Controla a voz com o teclado' 
            : 'Control voice with keyboard'}
          fullWidth
        >
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <kbd className="px-2 py-1 bg-[var(--bg-subtle)] rounded font-mono">V</kbd>
              <span>{isPortuguese ? 'Ativar voz' : 'Toggle voice'}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <kbd className="px-2 py-1 bg-[var(--bg-subtle)] rounded font-mono">Esc</kbd>
              <span>{isPortuguese ? 'Parar' : 'Stop'}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <kbd className="px-2 py-1 bg-[var(--bg-subtle)] rounded font-mono">P</kbd>
              <span>{isPortuguese ? 'Pausar/Retomar' : 'Pause/Resume'}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <kbd className="px-2 py-1 bg-[var(--bg-subtle)] rounded font-mono">Space</kbd>
              <span>{isPortuguese ? 'Falar' : 'Speak'}</span>
            </div>
          </div>
        </SettingCard>

        {/* Privacy Notice */}
        <SettingCard
          icon={Shield}
          title={isPortuguese ? 'Privacidade de Voz' : 'Voice Privacy'}
          description={isPortuguese 
            ? 'Como tratamos os teus dados de voz' 
            : 'How we handle your voice data'}
          fullWidth
        >
          <div className="mt-3 p-3 bg-[var(--bg-subtle)] rounded-lg">
            <p className="text-sm text-[var(--text-secondary)]">
              {isPortuguese 
                ? 'A voz é processada para compreender as tuas perguntas. O áudio não é armazenado permanentemente. O processamento é feito em tempo real para proporcionar uma experiência fluida.'
                : 'Voice is processed to understand your questions. Audio is not stored permanently. Processing is done in real-time to provide a seamless experience.'}
            </p>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}

// Setting Card Component
function SettingCard({
  icon: Icon,
  title,
  description,
  children,
  fullWidth = false
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
      <div className={`flex ${fullWidth ? 'flex-col' : 'items-center justify-between'}`}>
        <div className={`flex items-center gap-3 ${fullWidth ? 'mb-3' : ''}`}>
          <div className="p-2 rounded-lg bg-[var(--primary)]/10">
            <Icon className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-medium text-[var(--text-primary)]">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
          </div>
        </div>
        {!fullWidth && children}
      </div>
      {fullWidth && children}
    </div>
  )
}

// Toggle Switch Component
function ToggleSwitch({
  enabled,
  onChange,
  disabled = false,
  ariaLabel
}: {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
  ariaLabel: string
}) {
  return (
    // eslint-disable-next-line jsx-a11y/aria-proptypes
    <button
      type="button"
      role="switch"
      aria-checked={enabled ? 'true' : 'false'}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer'
      } ${
        enabled 
          ? 'bg-[var(--primary)]' 
          : 'bg-[var(--bg-hover)]'
      }`}
    >
      <motion.span
        layout
        className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
        initial={false}
        animate={{
          x: enabled ? 24 : 4
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
