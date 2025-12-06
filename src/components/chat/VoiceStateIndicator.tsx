"use client"

import React from 'react'
import { Mic, MicOff, Volume2, Loader2, Pause } from 'lucide-react'
import { motion } from 'framer-motion'
import { VoiceState, getStateDisplay } from '../../lib/voice/conversation-mode'
import { useI18n } from '../../lib/i18n'

interface VoiceStateIndicatorProps {
  state: VoiceState
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: { icon: 'w-4 h-4', container: 'px-2 py-1 text-xs', dot: 'w-2 h-2' },
  md: { icon: 'w-5 h-5', container: 'px-3 py-1.5 text-sm', dot: 'w-2.5 h-2.5' },
  lg: { icon: 'w-6 h-6', container: 'px-4 py-2 text-base', dot: 'w-3 h-3' }
}

const STATE_COLORS = {
  idle: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
  listening: 'bg-[var(--primary)]/10 text-[var(--primary)]',
  processing: 'bg-[var(--warning)]/10 text-[var(--warning)]',
  speaking: 'bg-[var(--accent)]/10 text-[var(--accent)]',
  paused: 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
}

const STATE_ICONS = {
  idle: MicOff,
  listening: Mic,
  processing: Loader2,
  speaking: Volume2,
  paused: Pause
}

export default function VoiceStateIndicator({
  state,
  showLabel = true,
  size = 'md',
  className = ''
}: VoiceStateIndicatorProps) {
  const { locale } = useI18n()
  const stateInfo = getStateDisplay(state, locale)
  const sizeClasses = SIZE_CLASSES[size]
  const colorClass = STATE_COLORS[state]
  const Icon = STATE_ICONS[state]

  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 rounded-full ${colorClass} ${sizeClasses.container} ${className}`}
      role="status"
      aria-label={stateInfo.text}
    >
      {/* Animated dot for active states */}
      {(state === 'listening' || state === 'speaking') && (
        <motion.span
          className={`${sizeClasses.dot} rounded-full bg-current`}
          animate={{
            opacity: [1, 0.5, 1],
            scale: [1, 1.2, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 1
          }}
        />
      )}

      {/* Icon */}
      <Icon 
        className={`${sizeClasses.icon} ${state === 'processing' ? 'animate-spin' : ''}`} 
      />

      {/* Label */}
      {showLabel && (
        <span className="font-medium whitespace-nowrap">
          {stateInfo.text}
        </span>
      )}
    </motion.div>
  )
}

/**
 * Compact version for chat header
 */
export function VoiceIndicatorDot({ 
  isActive, 
  className = '' 
}: { 
  isActive: boolean
  className?: string 
}) {
  if (!isActive) return null

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`relative flex h-3 w-3 ${className}`}
    >
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"
        animate={{ scale: [1, 1.5], opacity: [0.75, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary)]" />
    </motion.span>
  )
}
