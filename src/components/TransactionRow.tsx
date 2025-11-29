"use client"
import React from 'react'

type Transaction = { id: string; merchant: string; date: string; amount: number; category: string }

export default function TransactionRow({ t, selected, onToggle } : { t: Transaction; selected: boolean; onToggle: (id:string)=>void }){
  const isExpense = t.amount < 0
  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!!selected}
          aria-label={`select-transaction-${t.id}`}
          onChange={() => onToggle(t.id)}
        />
        <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-sm">
          {t.merchant[0]}
        </div>
        <div>
          <div className="text-sm font-medium">{t.merchant}</div>
          <div className="text-xs text-slate-500">{t.date} • {t.category}</div>
        </div>
      </div>
      <div className={isExpense ? 'text-red-600' : 'text-green-600'}>{formatPT(Math.abs(t.amount))}</div>
    </div>
  )
}

function formatPT(n:number){
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n)
}
