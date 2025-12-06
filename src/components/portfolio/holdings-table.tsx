"use client"
import React from 'react'
import { formatCurrency, formatNumber } from '../../lib/utils'
import HoldingDetailDialog from './holding-detail-dialog'
import { useTranslations } from '../../lib/i18n'

export type Holding = { id: string; ticker: string; name: string; quantity: number; avg_cost_basis: number; current_price: number; value: number; cost: number; unrealized: number; percent: number }

export default function HoldingsTable({ items }:{ items: Holding[] }){
  const t = useTranslations()
  const [selectedHolding, setSelectedHolding] = React.useState<Holding | null>(null)
  
  return (
    <>
      <div className="overflow-x-auto">
        {/* Desktop Table */}
        <table className="w-full table-auto hidden sm:table">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.ticker}</th>
              <th className="text-left p-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.name}</th>
              <th className="text-right p-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.quantity}</th>
              <th className="text-right p-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.price}</th>
              <th className="text-right p-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.value}</th>
              <th className="text-right p-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.return}</th>
              <th className="text-right p-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{t.portfolio.plPercent}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(h => {
              const plPercent = h.cost > 0 ? ((h.value - h.cost) / h.cost) * 100 : 0
              return (
                <tr 
                  key={h.id} 
                  onClick={() => setSelectedHolding(h)}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                >
                  <td className="p-3 font-medium text-[var(--text-primary)]">{h.ticker}</td>
                  <td className="p-3 text-[var(--text-secondary)] max-w-[200px] truncate">{h.name !== h.ticker ? h.name : '—'}</td>
                  <td className="p-3 text-right text-[var(--text-primary)]">{formatNumber(h.quantity, h.quantity % 1 === 0 ? 0 : 2)}</td>
                  <td className="p-3 text-right text-[var(--text-primary)]">{formatCurrency(h.current_price)}</td>
                  <td className="p-3 text-right font-medium text-[var(--text-primary)]">{formatCurrency(Math.round(h.value * 100) / 100)}</td>
                  <td className={`p-3 text-right font-medium ${h.unrealized < 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                    {formatCurrency(Math.round(h.unrealized * 100) / 100)}
                  </td>
                  <td className={`p-3 text-right font-medium ${plPercent < 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                    {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(1)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {items.map(h => {
            const plPercent = h.cost > 0 ? ((h.value - h.cost) / h.cost) * 100 : 0
            return (
              <div 
                key={h.id} 
                onClick={() => setSelectedHolding(h)}
                className="p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-[var(--text-primary)]">{h.ticker}</span>
                    {h.name !== h.ticker && (
                      <p className="text-sm text-[var(--text-muted)] truncate max-w-[180px]">{h.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${h.unrealized < 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                      {formatCurrency(Math.round(h.unrealized * 100) / 100)}
                    </span>
                    <span className={`ml-2 text-sm ${plPercent < 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                      ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>{formatNumber(h.quantity, h.quantity % 1 === 0 ? 0 : 2)} @ {formatCurrency(h.current_price)}</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatCurrency(Math.round(h.value * 100) / 100)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Holding Detail Dialog */}
      {selectedHolding && (
        <HoldingDetailDialog 
          open={!!selectedHolding} 
          onClose={() => setSelectedHolding(null)} 
          holding={selectedHolding}
        />
      )}
    </>
  )
}
