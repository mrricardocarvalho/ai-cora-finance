"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import CoraAvatar from './cora-avatar'
import { useTranslations } from '../../lib/i18n'

export type CoraContext = 
  | 'home'
  | 'dashboard' 
  | 'portfolio'
  | 'planning/goals'
  | 'planning/debt'
  | 'planning/taxes'
  | 'forecast'
  | 'learn'
  | 'data'
  | 'settings'

interface CoraHeaderProps {
  context: CoraContext
  /** Optional dynamic data to personalize the message */
  data?: {
    insightSummary?: string
    goalsCount?: number
    goalsOnTrack?: number
    debtTotal?: number
    nextDeadline?: string
    userName?: string
  }
  /** Loading state - shows thinking animation */
  isLoading?: boolean
  /** Custom greeting override */
  customGreeting?: string
  /** Optional click handler - defaults to opening chat with context */
  onClick?: () => void
}

export default function CoraHeader({ 
  context, 
  data, 
  isLoading = false,
  customGreeting,
  onClick 
}: CoraHeaderProps) {
  const t = useTranslations()
  const router = useRouter()

  const getContextMessage = (): string => {
    if (customGreeting) return customGreeting

    switch (context) {
      case 'home':
        if (data?.insightSummary) return data.insightSummary
        return t.pages.home.subtitle
      
      case 'dashboard':
        return t.pages.dashboard.subtitle
      
      case 'portfolio':
        return t.pages.portfolio.subtitle
      
      case 'planning/goals':
        if (data?.goalsCount !== undefined) {
          const onTrack = data.goalsOnTrack ?? 0
          return `You have ${data.goalsCount} active goals. ${onTrack} on track.`
        }
        return t.planning.goalsDesc
      
      case 'planning/debt':
        if (data?.debtTotal !== undefined && data.debtTotal > 0) {
          const formatted = data.debtTotal.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
          return `Let's tackle your ${formatted} debt together.`
        }
        return t.planning.debtDesc
      
      case 'planning/taxes':
        if (data?.nextDeadline) {
          return `Tax season prep: Next deadline is ${data.nextDeadline}.`
        }
        return t.pages.tax.subtitle
      
      case 'forecast':
        return t.widgets.forecast.title + ' — ' + t.widgets.forecast.highConfidence
      
      case 'learn':
        return 'Building financial literacy, one lesson at a time.'
      
      case 'data':
        return t.pages.data.subtitle
      
      case 'settings':
        return 'Customize how I work for you.'
      
      default:
        return t.chat.greetingSubtitle
    }
  }

  const getGreeting = (): string => {
    const hour = new Date().getHours()
    const name = data?.userName || ''
    
    if (hour < 12) {
      return name ? `Good morning, ${name}!` : 'Good morning!'
    } else if (hour < 18) {
      return name ? `Good afternoon, ${name}!` : 'Good afternoon!'
    } else {
      return name ? `Good evening, ${name}!` : 'Good evening!'
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default: navigate to chat with context
      router.push(`/chat?context=${context}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5 border border-[var(--primary)]/10 hover:border-[var(--primary)]/20 transition-all text-left group"
      aria-label="Talk to Cora"
    >
      <CoraAvatar state={isLoading ? 'thinking' : 'idle'} size={40} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
          {context === 'home' ? getGreeting() : 'Cora'}
        </p>
        <p className="text-sm text-[var(--text-secondary)] truncate">
          {getContextMessage()}
        </p>
      </div>
      <div className="text-[var(--text-muted)] text-xs opacity-0 group-hover:opacity-100 transition-opacity self-center">
        Ask me →
      </div>
    </button>
  )
}
