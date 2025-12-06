"use client"
import React from 'react'
import Button from '../ui/button'
import { categories } from '../../lib/ai/category-list'

type Props = {
  open: boolean
  onClose: ()=>void
  onConfirm: (category: string)=>void
  title?: string
}

export default function CategoryPicker({ open, onClose, onConfirm, title = 'Choose category' }: Props){
  const [q, setQ] = React.useState('')
  const [sel, setSel] = React.useState<string | null>(null)
  React.useEffect(()=>{ if(!open){ setQ(''); setSel(null) } }, [open])
  if(!open) return null
  const filtered = categories.filter(c => c.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-surface border border-[var(--border)] p-6 rounded-2xl shadow-elevated max-w-md w-full">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        <div className="mt-3">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search categories" className="w-full p-3 border border-[var(--border)] rounded-xl bg-surface text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20" />
          <div className="mt-2 max-h-48 overflow-auto border border-[var(--border)] rounded-xl p-1">
            {filtered.map(c => (
              <div key={c} className={`p-2 rounded-lg cursor-pointer transition-colors ${sel===c ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'}`} onClick={()=>setSel(c)}>
                {c}
              </div>
            ))}
            {filtered.length === 0 && <div className="p-2 text-sm text-[var(--text-muted)]">No categories</div>}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={()=> sel && (onConfirm(sel), onClose()) } disabled={!sel}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}
