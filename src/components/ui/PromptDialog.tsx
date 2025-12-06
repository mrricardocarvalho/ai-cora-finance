"use client"
import React from 'react'
import Button from './button'

export default function PromptDialog({ open, title, defaultValue, placeholder, onCancel, onConfirm }:{ open: boolean; title?: string; defaultValue?: string; placeholder?: string; onCancel: ()=>void; onConfirm: (value: string)=>void }){
  const [value, setValue] = React.useState(defaultValue || '')
  React.useEffect(()=>{ setValue(defaultValue || '') }, [defaultValue])
  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="presentation">
      <div className="bg-surface border border-[var(--border)] p-6 rounded-2xl shadow-elevated max-w-md w-full" role="dialog" aria-modal="true">
        {title ? <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3> : null}
        <div className="mt-3">
          <input 
            placeholder={placeholder} 
            value={value} 
            onChange={(e)=>setValue(e.target.value)} 
            className="w-full p-3 border border-[var(--border)] rounded-xl bg-surface text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20" 
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={()=>onConfirm(value)}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}
