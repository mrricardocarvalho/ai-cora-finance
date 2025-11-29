"use client"
import React from 'react'
import TransactionRow from './TransactionRow'

type Transaction = { id: string; merchant: string; date: string; amount: number; category: string }

export default function TransactionList({ items }:{ items: Transaction[] }){
  const [sel, setSel] = React.useState<Record<string,boolean>>({})
  const toggle = (id:string)=> setSel(s=>({...s,[id]:!s[id]}))
  const any = Object.values(sel).some(Boolean)
  return (
    <div className="border rounded">
      {items.map(i=> <TransactionRow key={i.id} t={i} selected={!!sel[i.id]} onToggle={toggle} />)}
      {any && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border p-2 rounded shadow-md flex gap-2">
          <button className="px-3 py-1 bg-slate-100 rounded">Edit Category</button>
          <button className="px-3 py-1 bg-slate-100 rounded">Exclude</button>
          <button className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
        </div>
      )}
    </div>
  )
}
