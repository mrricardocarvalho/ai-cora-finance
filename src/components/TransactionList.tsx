"use client"
import React from 'react'
import TransactionRow from './TransactionRow'

type Transaction = { id: string; merchant: string; date: string; amount: number; category: string }

export default function TransactionList({ items }:{ items: Transaction[] }){
  const [sel, setSel] = React.useState<Record<string,boolean>>({})
  const toggle = (id:string)=> setSel(s=>({...s,[id]:!s[id]}))
  const any = Object.values(sel).some(Boolean)
  return (
    <div className="border border-[var(--border)] rounded-xl bg-surface">
      {items.map(i=> <TransactionRow key={i.id} t={i} selected={!!sel[i.id]} onToggle={toggle} />)}
      {any && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-surface border border-[var(--border)] p-3 rounded-2xl shadow-elevated flex gap-2 backdrop-blur-sm">
          <button className="px-4 py-2 bg-[var(--bg-subtle)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--primary)]/10 transition-colors">Edit Category</button>
          <button className="px-4 py-2 bg-[var(--bg-subtle)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--primary)]/10 transition-colors">Exclude</button>
          <button className="px-4 py-2 bg-[var(--danger)] text-white rounded-xl hover:opacity-90 transition-opacity">Delete</button>
        </div>
      )}
    </div>
  )
}
