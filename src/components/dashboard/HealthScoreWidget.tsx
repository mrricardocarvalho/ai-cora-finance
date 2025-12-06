"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { HealthScoreResult } from '../../lib/actions/health-score'
import { useTranslations } from '../../lib/i18n'

interface HealthScoreWidgetProps {
  data: HealthScoreResult | null
}

const STATUS_STYLES = {
  excellent: { color: 'text-[var(--success)]', ring: 'var(--success)', bg: 'bg-[var(--success-glass)]' },
  good: { color: 'text-[var(--primary)]', ring: 'var(--primary)', bg: 'bg-[var(--primary-glass)]' },
  fair: { color: 'text-[var(--warning)]', ring: 'var(--warning)', bg: 'bg-[var(--warning-glass)]' },
  poor: { color: 'text-[var(--danger)]', ring: 'var(--danger)', bg: 'bg-[var(--danger-glass)]' }
}

const FACTOR_STATUS = {
  positive: { color: 'text-[var(--success)]', bg: 'bg-[var(--success-glass)]', icon: '✓' },
  neutral: { color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-glass)]', icon: '○' },
  negative: { color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-glass)]', icon: '!' }
}

export default function HealthScoreWidget({ data }: HealthScoreWidgetProps) {
  const t = useTranslations()
  const w = t.widgets.healthScore
  const [expanded, setExpanded] = useState(false)
  
  const STATUS_LABELS: Record<string, string> = {
    excellent: w.excellent,
    good: w.good,
    fair: w.fair,
    poor: w.poor
  }
  
  if (!data) {
    return (
      <div className="p-5 rounded-2xl bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] shadow-glass">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-white/10 rounded-lg mb-3" />
          <div className="h-20 w-20 bg-white/10 rounded-full mx-auto" />
        </div>
      </div>
    )
  }
  
  const styles = STATUS_STYLES[data.status]
  const label = STATUS_LABELS[data.status]
  const circumference = 2 * Math.PI * 42 // radius = 42
  const progress = (data.score / 100) * circumference
  
  return (
    <article className="p-5 rounded-2xl bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] shadow-glass hover:shadow-elevated transition-all duration-300 ease-smooth">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">{w.title}</h4>
          <span className={`text-xs font-medium ${styles.color} ${styles.bg} px-2.5 py-1 rounded-lg mt-2 inline-block`}>
            {label}
          </span>
        </div>
        {data.trend !== 'stable' && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            data.trend === 'up' ? 'text-[var(--success)] bg-[var(--success-glass)]' : 'text-[var(--danger)] bg-[var(--danger-glass)]'
          }`}>
            {data.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{w.vsMonth}</span>
          </div>
        )}
      </div>
      
      {/* Circular Score */}
      <div className="flex justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--border-glass)"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={styles.ring}
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference
              }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-3xl font-bold ${styles.color}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {data.score}
            </motion.span>
            <span className="text-xs text-[var(--text-muted)]">/100</span>
          </div>
        </div>
      </div>
      
      {/* Expand button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] py-2 rounded-xl hover:bg-white/5 transition-all duration-300 ease-smooth"
        aria-expanded={expanded}
        aria-controls="health-factors"
      >
        {expanded ? (
          <>{w.hideDetails} <ChevronUp className="w-4 h-4" /></>
        ) : (
          <>{w.showDetails} <ChevronDown className="w-4 h-4" /></>
        )}
      </button>
      
      {/* Factors breakdown */}
      {expanded && (
        <motion.div
          id="health-factors"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-4 border-t border-[var(--border)] space-y-3"
        >
          {data.factors.map((factor, i) => {
            const factorConfig = FACTOR_STATUS[factor.status]
            return (
              <div key={i} className="flex items-start gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm ${factorConfig.color} ${factorConfig.bg}`}>
                  {factorConfig.icon}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{factor.name}</span>
                    <span className={`text-sm font-semibold ${factorConfig.color}`}>{factor.score}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{factor.description}</p>
                  {/* Mini progress bar */}
                  <div className="mt-2 h-1.5 bg-[var(--border-glass)] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        factor.status === 'positive' ? 'bg-[var(--success)]' :
                        factor.status === 'neutral' ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.score}%` }}
                      transition={{ delay: 0.1 * i, duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </article>
  )
}
