"use client"
import React from 'react'
import Button from './button'

export default function ConfirmDialog({ open, title, description, onCancel, onConfirm }:{ open: boolean; title?: string; description?: string; onCancel: ()=>void; onConfirm: ()=>void }){
  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" role="presentation">
      <div className="bg-surface border border-[var(--border)] p-6 rounded-2xl shadow-elevated max-w-md w-full">
        {title ? <h3 className="text-lg font-semibold" role="heading">{title}</h3> : null}
        {description ? <p className="text-sm text-[var(--text-secondary)] mt-2">{description}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}
