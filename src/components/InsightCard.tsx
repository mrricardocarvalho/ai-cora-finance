"use client"
import React from 'react'
import { AlertCircle, Info, TrendingUp, X, Shield, Sparkles } from 'lucide-react'
import { Badge } from './ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { pt, enUS } from 'date-fns/locale'
import { useI18n } from '../lib/i18n'

type P = {
  priority: 'urgent' | 'warning' | 'opportunity' | 'info' | 'tax'
  id?: string
  title: string
  message: string
  timestamp?: string
  actions?: React.ReactNode
  onDismiss?: (id: string)=>void | Promise<void>
  scoreImpact?: number
}

export default function InsightCard({ id, priority, title, message, timestamp, actions, scoreImpact, onDismiss }: P) {
  const { t, locale } = useI18n()
  const dateFnsLocale = locale === 'pt-PT' ? pt : enUS
  
  const priorityStyles = {
    urgent: {
      border: 'border-l-4 border-[var(--danger)]',
      bg: 'bg-red-500/10 backdrop-blur-lg',
      icon: 'bg-red-500/20 text-[var(--danger)]',
      label: t.insights.urgent
    },
    warning: {
      border: 'border-l-4 border-[var(--warning)]',
      bg: 'bg-amber-500/10 backdrop-blur-lg',
      icon: 'bg-amber-500/20 text-[var(--warning)]',
      label: t.insights.warning
    },
    opportunity: {
      border: 'border-l-4 border-[var(--success)]',
      bg: 'bg-emerald-500/10 backdrop-blur-lg',
      icon: 'bg-emerald-500/20 text-[var(--success)]',
      label: t.insights.opportunity
    },
    tax: {
      border: 'border-l-4 border-[var(--tax)]',
      bg: 'bg-orange-500/10 backdrop-blur-lg',
      icon: 'bg-orange-500/20 text-[var(--tax)]',
      label: t.insights.tax
    },
    info: {
      border: 'border-l-4 border-[var(--info)]',
      bg: 'bg-blue-500/10 backdrop-blur-lg',
      icon: 'bg-blue-500/20 text-[var(--info)]',
      label: t.insights.info
    }
  }
  
  const style = priorityStyles[priority]
  const Icon = priority === 'urgent' ? AlertCircle : priority === 'opportunity' ? TrendingUp : priority === 'tax' ? Shield : priority === 'warning' ? Sparkles : Info
  const isTaxInsight = title && title.toLowerCase().includes('tax-loss')
  
  return (
    <article className={`p-4 rounded-2xl border border-[var(--border-glass)] ${style.border} ${style.bg} shadow-glass transition-all duration-300 ease-smooth hover:shadow-elevated hover:scale-[1.01]`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.icon}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={priority === 'warning' ? 'warning' : priority === 'urgent' ? 'danger' : priority === 'opportunity' ? 'success' : 'default'} className="text-xs">
                {style.label}
              </Badge>
              {isTaxInsight && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-[var(--tax)] text-white font-medium">
                  <Shield size={12} /> IRS
                </div>
              )}
            </div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)] mt-1.5">{title}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{message}</p>
            {isTaxInsight && (
              <div className="mt-2 text-xs text-[var(--text-muted)] italic">
                {t.insights.taxAdvice}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button 
            aria-label={t.insights.dismiss} 
            onClick={()=>id && onDismiss?.(id)} 
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-on-glass)] hover:bg-white/10 transition-all duration-200"
          >
            <X size={16} />
          </button>
          {timestamp && (
            <time className="text-xs text-[var(--text-muted)]">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: dateFnsLocale })}
            </time>
          )}
          {typeof scoreImpact === 'number' && (
            <div className={`mt-1 text-xs font-medium ${scoreImpact > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {scoreImpact > 0 ? `+${scoreImpact}` : scoreImpact} pts
            </div>
          )}
        </div>
      </div>
      {actions && (
        <div className="mt-4 flex gap-2 justify-end pt-3 border-t border-white/10">
          {actions}
        </div>
      )}
    </article>
  )
}
