"use client"
import React, { useEffect } from 'react'
// simple maps to track long-press across rows
const longPressTimers: Record<string, number> = {}
const longPressIsLong: Record<string, boolean> = {}
const LONG_PRESS_MS = 550
import type { Transaction } from './types'
import { format } from 'date-fns'
import { formatDate, formatCurrency } from '../../lib/utils'
import Badge from '../ui/badge'

function categoryColorClass(cat?: string){
  if(!cat) return 'bg-[var(--bg-subtle)]'
  const key = cat.toLowerCase()
  if(['groceries','food','restaurants'].some(k=>key.includes(k))) return 'bg-[var(--warning)]/10 text-[var(--warning)]'
  if(['salary','income','refund'].some(k=>key.includes(k))) return 'bg-[var(--success)]/10 text-[var(--success)]'
  if(['transport','fuel','taxi'].some(k=>key.includes(k))) return 'bg-[var(--primary)]/10 text-[var(--primary)]'
  return 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
}

// Check if transaction needs review: no confidence AND (no category OR uncategorized)
function needsReview(t: Transaction): boolean {
  const hasConfidence = t.confidence_score !== null && t.confidence_score !== undefined && !isNaN(Number(t.confidence_score))
  if (hasConfidence && Number(t.confidence_score) >= 0.8) return false
  if (!hasConfidence && t.category && t.category !== 'Uncategorized') return false
  return true
}

export default function MobileTransactionList({ items, selectedIds = {}, onToggle, onOpenDetails }:{ items: Transaction[]; selectedIds?: Record<string, boolean>; onToggle?: (id:string)=>void; onOpenDetails?: (t: Transaction | null)=>void }){
  useEffect(()=>{
    return () => { // cleanup timers on unmount
      Object.values(longPressTimers).forEach(t => clearTimeout(t))
      Object.keys(longPressTimers).forEach(k => delete longPressTimers[k])
      Object.keys(longPressIsLong).forEach(k => delete longPressIsLong[k])
    }
  }, [])
  return (
    <div className="space-y-2">
      {items.map(t => {
        // use local refs per row via closures via React.useRef cannot be called in loops.
        // We'll use a mutable map stored on the component closure to track timers per id.
        return (
        <div key={t.id} data-row-id={t.id}
          onPointerDown={() => {
            const id = t.id
            longPressTimers[id] = window.setTimeout(()=>{ longPressIsLong[id] = true; onToggle?.(id) }, LONG_PRESS_MS)
            longPressIsLong[id] = false
          }}
          onPointerUp={() => {
            const id = t.id
            if(longPressTimers[id]) { window.clearTimeout(longPressTimers[id]); delete longPressTimers[id] }
          }}
          onPointerLeave={() => {
            const id = t.id
            if(longPressTimers[id]) { window.clearTimeout(longPressTimers[id]); delete longPressTimers[id] }
          }}
          onClick={()=>{ if(!longPressIsLong[t.id]) onOpenDetails?.(t) }}
          className={`p-3 border border-[var(--border)] rounded-xl bg-surface flex justify-between items-start shadow-card ${needsReview(t) ? 'border-[var(--warning)]' : ''}`}>
          <div>
            <input type="checkbox" checked={!!selectedIds?.[t.id]} aria-label={`select-${t.id}`} onChange={()=>onToggle?.(t.id)} className="mr-2" />
            <div className="font-medium text-[var(--text-primary)] inline">{t.description}</div>
            <div className="text-xs text-[var(--text-muted)]">{formatDate(t.date)} • {t.account_name || 'Unknown'}</div>
            <div className="mt-1 flex items-center gap-2">
              {t.category ? <Badge className={categoryColorClass(t.category)}>{t.category}</Badge> : null}
              {needsReview(t) ? <Badge variant="warning">Review</Badge> : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`${Number(t.amount) < 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'} font-semibold`}>{formatCurrency(Math.abs(Number(t.amount)))}</div>
            <button className="text-sm text-[var(--primary)]" onClick={(e)=>{ e.stopPropagation(); onOpenDetails?.(t) }}>Details</button>
          </div>
        </div>
      )})}
    </div>
  )
}
