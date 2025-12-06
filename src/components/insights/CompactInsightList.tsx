"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Info, TrendingUp, Shield, Sparkles, ChevronRight } from 'lucide-react'
import { useTranslations } from '../../lib/i18n'

type InsightRow = { 
  id: string
  type: string
  title: string
  message: string
  created_at?: string 
}

type Props = {
  insights: InsightRow[]
  maxItems?: number
}

const TYPE_CONFIG: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  urgent: { icon: AlertCircle, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger)]/10' },
  warning: { icon: Sparkles, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]/10' },
  opportunity: { icon: TrendingUp, color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/10' },
  tax: { icon: Shield, color: 'text-[var(--tax)]', bg: 'bg-[var(--tax)]/10' },
  info: { icon: Info, color: 'text-[var(--info)]', bg: 'bg-[var(--info)]/10' },
  observation: { icon: Info, color: 'text-[var(--info)]', bg: 'bg-[var(--info)]/10' },
  celebration: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
}

export default function CompactInsightList({ insights, maxItems = 3 }: Props) {
  const router = useRouter()
  const t = useTranslations()
  const displayedInsights = insights.slice(0, maxItems)
  const remainingCount = insights.length - maxItems
  
  if (insights.length === 0) {
    return null
  }
  
  return (
    <div className="bg-surface border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="divide-y divide-[var(--border)]">
        {displayedInsights.map((insight) => {
          const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info
          const Icon = config.icon
          
          return (
            <button
              key={insight.id}
              onClick={() => router.push('/insights')}
              className="w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-subtle)] transition-colors text-left"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                <Icon size={16} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {insight.title}
                </p>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
            </button>
          )
        })}
      </div>
      
      {remainingCount > 0 && (
        <button
          onClick={() => router.push('/insights')}
          className="w-full p-3 text-sm text-[var(--primary)] hover:bg-[var(--bg-subtle)] transition-colors font-medium border-t border-[var(--border)]"
        >
          {t.insights.viewMore} {remainingCount} insight{remainingCount > 1 ? 's' : ''} →
        </button>
      )}
      
      {remainingCount <= 0 && insights.length > 0 && (
        <button
          onClick={() => router.push('/insights')}
          className="w-full p-3 text-sm text-[var(--primary)] hover:bg-[var(--bg-subtle)] transition-colors font-medium border-t border-[var(--border)]"
        >
          {t.insights.viewAll} →
        </button>
      )}
    </div>
  )
}
