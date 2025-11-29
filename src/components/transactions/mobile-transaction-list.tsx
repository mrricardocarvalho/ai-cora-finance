"use client"
import React from 'react'
import type { Transaction } from './types'
import { format } from 'date-fns'
import Badge from '../ui/Badge'

export default function MobileTransactionList({ items, selectedIds = {}, onToggle }:{ items: Transaction[]; selectedIds?: Record<string, boolean>; onToggle?: (id:string)=>void }){
  return (
    <div className="space-y-2">
      {items.map(t => (
        <div key={t.id} data-row-id={t.id} className={`p-3 border rounded flex justify-between items-start ${t.confidence_score === null || Number(t.confidence_score) < 0.8 ? 'border-yellow-400' : ''}`}>
          <div>
            <input type="checkbox" checked={!!selectedIds?.[t.id]} aria-label={`select-${t.id}`} onChange={()=>onToggle?.(t.id)} />
            <div className="font-medium">{t.merchant}</div>
            <div className="text-xs text-slate-500">{format(new Date(t.date), 'dd/MM/yyyy')}</div>
            {t.confidence_score === null || Number(t.confidence_score) < 0.8 ? <div className="mt-1"><Badge variant="warning">Review</Badge></div> : null}
          </div>
          <div className={`${Number(t.amount) < 0 ? 'text-red-600' : 'text-green-600'} font-semibold`}>{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Math.abs(Number(t.amount)))}</div>
        </div>
      ))}
    </div>
  )
}
