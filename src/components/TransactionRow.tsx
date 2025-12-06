"use client"
import React from 'react'
import { formatCurrency } from '../lib/utils'
import { Badge } from './ui/badge'

type Transaction = { id: string; merchant?: string | null; description?: string | null; date: string; amount: number; category: string; confidence_score?: number | null }

function needsReview(t: Transaction): boolean {
  const hasConfidence = t.confidence_score !== null && t.confidence_score !== undefined && !isNaN(Number(t.confidence_score))
  // Needs review if: confidence < 0.8, OR no confidence and category is Uncategorized/empty
  if (hasConfidence && Number(t.confidence_score) < 0.8) return true
  if (!hasConfidence && (!t.category || t.category === 'Uncategorized')) return true
  return false
}

export default function TransactionRow({ t, selected, onToggle } : { t: Transaction; selected: boolean; onToggle: (id:string)=>void }){
  const isExpense = t.amount < 0
  return (
    <div className="flex items-center justify-between p-3 border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] transition-colors">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!!selected}
          aria-label={`select-transaction-${t.id}`}
          onChange={() => onToggle(t.id)}
          className="accent-[var(--primary)]"
        />
        <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-sm font-medium text-[var(--primary)]">
          { (t.merchant && t.merchant.length > 0) ? t.merchant[0] : (t.description && t.description.length > 0 ? t.description[0] : '?') }
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">{t.merchant}</span>
            {needsReview(t) && <Badge variant="warning">Rever</Badge>}
          </div>
          <div className="text-xs text-[var(--text-muted)]">{t.date} • {t.category}</div>
        </div>
      </div>
      <div className={isExpense ? 'text-[var(--danger)]' : 'text-[var(--success)]'}>{formatCurrency(Math.abs(t.amount))}</div>
    </div>
  )
}

// legacy helper removed; use formatCurrency from lib/utils
