"use client"
import React, { useRef, useState, useEffect } from 'react'
import { SafeToSpendResult } from '../../lib/intelligence/safe-spend'
import Button from '../ui/button'
import { formatCurrency, formatDate } from '../../lib/utils'
import { useTranslations } from '../../lib/i18n'

export default function SafeToSpendWidget({ data }: { data: SafeToSpendResult | null }){
  const t = useTranslations()
  const w = t.widgets.safeToSpend
  const detailsRef = useRef<HTMLDetailsElement | null>(null)
  const [expanded, setExpanded] = useState(false)
  useEffect(()=>{ if(detailsRef.current) detailsRef.current.open = expanded }, [expanded])
  useEffect(()=>{
    const el = detailsRef.current
    if(!el) return
    const handler = () => setExpanded(Boolean(el.open))
    el.addEventListener('toggle', handler)
    return ()=> el.removeEventListener('toggle', handler)
  }, [])
  if(!data) return (
    <div className="p-5 rounded-2xl bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] shadow-glass">
      <div className="animate-pulse h-5 w-32 bg-white/10 rounded-lg" />
      <div className="mt-3 h-8 w-28 bg-white/10 rounded-lg animate-pulse" />
    </div>
  )
  const isSafe = data.value > 0
  const color = isSafe ? 'text-[var(--success)]' : 'text-[var(--danger)]'
  const accentColor = isSafe ? 'from-emerald-500/20 to-emerald-500/5' : 'from-red-500/20 to-red-500/5'
  return (
    <article className={`p-5 rounded-2xl bg-gradient-to-br ${accentColor} backdrop-blur-lg border border-[var(--border-glass)] shadow-glass hover:shadow-elevated transition-all duration-300 ease-smooth`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">{w.title}</h4>
          <div aria-live="polite" className={`text-2xl font-bold ${color} mt-1`} id="safe-to-spend-value">{formatCurrency(data.value)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button aria-controls="safe-to-spend-details" aria-expanded={expanded} aria-label={w.viewDetails} variant="secondary" size="sm" onClick={() => setExpanded(v=>!v)}>
            {w.details}
          </Button>
        </div>
      </div>
      {data.details.comfortFloor <= 0 ? (
        <div className="mt-3 text-sm text-[var(--text-muted)]">{w.setComfortFloor} — <a href="/settings" className="text-[var(--primary)] underline hover:text-[var(--primary-hover)] transition-colors">{w.goToSettings}</a></div>
      ) : (
        <details ref={detailsRef} className="mt-4" id="safe-to-spend-details">
        <summary className="text-sm text-[var(--text-muted)] cursor-pointer hover:text-[var(--primary)] transition-colors">▶ {w.viewDetails}</summary>
          <div className="mt-3 text-sm space-y-2 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-xs text-[var(--text-muted)] mb-2">{w.updated}: {formatDate(data.details.asOf)}</div>
          <div className="flex justify-between text-[var(--text-secondary)]"><span>{w.liquidAssets}</span><span className="font-medium text-[var(--text-primary)]">{formatCurrency(data.details.liquidAssets)}</span></div>
          <div className="flex justify-between text-[var(--text-secondary)]"><span>{w.comfortFloor}</span><span className="font-medium text-[var(--text-primary)]">-{formatCurrency(data.details.comfortFloor)}</span></div>
          <div className="flex justify-between text-[var(--text-secondary)]"><span>{w.pendingBills}</span><span className="font-medium text-[var(--text-primary)]">-{formatCurrency(data.details.pendingBills)}</span></div>
          <div className="flex justify-between pt-2 border-t border-[var(--border)] font-semibold text-[var(--text-primary)]"><span>{w.total}</span><span>{formatCurrency(data.value)}</span></div>
        </div>
      </details>
      )}
    </article>
  )
}
