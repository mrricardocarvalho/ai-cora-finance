"use client"
import React from 'react'
import { X } from 'lucide-react'

export default function Sheet({ open, onClose, children, title }:{ open: boolean; onClose: ()=>void; children: React.ReactNode; title?: string }){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="
          absolute inset-0 
          bg-black/40 backdrop-blur-md
          animate-in fade-in duration-200
        " 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      {/* Sheet Content */}
      <div className="
        relative w-full md:max-w-2xl max-h-[90vh] overflow-y-auto
        m-0 md:m-4 p-6
        bg-[var(--surface-glass)] backdrop-blur-2xl
        rounded-t-3xl md:rounded-3xl
        border border-[var(--border-glass)]
        shadow-float
        animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out
      ">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[var(--text-on-glass)]">{title}</h3>
          <button 
            onClick={onClose} 
            aria-label="Close" 
            className="
              p-2.5 rounded-xl
              text-[var(--text-muted)]
              bg-[var(--surface-glass)] backdrop-blur-sm
              border border-[var(--border-glass)]
              shadow-[var(--edge-highlight)]
              transition-all duration-fast ease-smooth
              hover:text-[var(--text-on-glass)] hover:bg-[var(--primary-glass)]
              hover:scale-105
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
            "
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div>{children}</div>
      </div>
    </div>
  )
}
