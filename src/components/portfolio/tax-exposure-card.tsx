"use client"
import React from 'react'
import { formatCurrency } from '../../lib/utils'
import { useTranslations } from '../../lib/i18n'

export default function TaxExposureCard({ taxExposure }:{ taxExposure: { totalTax: number; byTicker: Record<string, { realizedGain:number; unrealizedGain:number; gain:number; tax:number }> } | null }){
  const [open, setOpen] = React.useState(false)
  const t = useTranslations()

  if(!taxExposure) return (
    <div className="p-4 border border-[var(--border)] rounded-xl bg-surface shadow-card">
      <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.taxExposure}</div>
      <div className="text-sm text-[var(--text-muted)] mt-2">{t.portfolio.noData}</div>
    </div>
  )

  const { totalTax, byTicker } = taxExposure
  let totalRealized = 0
  let totalUnrealized = 0
  for(const ticker of Object.values(byTicker)){
    totalRealized += Number(ticker.realizedGain || 0)
    totalUnrealized += Number(ticker.unrealizedGain || 0)
  }
  const totalGain = totalRealized + totalUnrealized
  const effectiveRate = totalGain > 0 ? (totalTax / totalGain) * 100 : 28
  
  // Sort tickers by gain (descending)
  const sortedTickers = Object.entries(byTicker).sort((a, b) => Number(b[1].gain || 0) - Number(a[1].gain || 0))
  
  return (
    <div className="p-4 border border-[var(--border)] rounded-xl bg-surface shadow-card">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.taxExposure}</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">{formatCurrency(Math.round(totalTax * 100) / 100)}</div>
        </div>
        <div className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium">
          {t.portfolio.estimated} {effectiveRate.toFixed(0)}%
        </div>
      </div>
      
      {/* Summary pills */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 p-2 bg-[var(--bg-subtle)] rounded-lg">
          <div className="text-xs text-[var(--text-muted)]">{t.portfolio.realized}</div>
          <div className={`text-sm font-semibold ${totalRealized >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {formatCurrency(Math.round(totalRealized * 100) / 100)}
          </div>
        </div>
        <div className="flex-1 p-2 bg-[var(--bg-subtle)] rounded-lg">
          <div className="text-xs text-[var(--text-muted)]">{t.portfolio.unrealized}</div>
          <div className={`text-sm font-semibold ${totalUnrealized >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {formatCurrency(Math.round(totalUnrealized * 100) / 100)}
          </div>
        </div>
      </div>
      
      {/* Toggle for per-ticker breakdown */}
      <button 
        className="w-full text-left text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium flex items-center gap-1" 
        onClick={()=>setOpen(!open)}
      >
        <span>{open ? '▼' : '▶'}</span>
        <span>{open ? t.portfolio.hideBreakdown : t.portfolio.showBreakdown}</span>
      </button>
      
      {open && (
        <div className="mt-3 space-y-2">
          {sortedTickers.map(([ticker, info]) => {
            const gain = Number(info.gain || 0)
            const tax = Number(info.tax || 0)
            const realized = Number(info.realizedGain || 0)
            const unrealized = Number(info.unrealizedGain || 0)
            
            return (
              <div key={ticker} className="p-3 bg-[var(--bg-subtle)] rounded-lg">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-semibold text-[var(--text-primary)]">{ticker}</span>
                  <div className="text-right">
                    <span className={`font-semibold ${gain >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {formatCurrency(Math.round(gain * 100) / 100)}
                    </span>
                    <span className="text-[var(--text-muted)] mx-1">/</span>
                    <span className="text-rose-600 font-medium">{formatCurrency(Math.round(tax * 100) / 100)}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                  <span>R: <span className={realized >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatCurrency(Math.round(realized * 100) / 100)}</span></span>
                  <span>U: <span className={unrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatCurrency(Math.round(unrealized * 100) / 100)}</span></span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
