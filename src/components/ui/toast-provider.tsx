"use client"
import React, { createContext, useContext, useState, useCallback } from 'react'

type Toast = { id: string; type: 'success'|'error'|'info'; message: string }
type ContextValue = { toast: (type: Toast['type'], message: string)=>void }

const ToastContext = createContext<ContextValue | null>(null)

function ToastItem({ toast: t }: { toast: Toast }) {
  const classes = t.type === 'success' 
    ? 'bg-green-600 text-white' 
    : t.type === 'error' 
      ? 'bg-red-600 text-white' 
      : 'bg-[var(--primary)] text-white'
  
  // Use separate components based on type to avoid ESLint issues with conditional ARIA
  if (t.type === 'error') {
    return (
      <div className={`px-3 py-2 rounded-md shadow-sm flex items-center gap-2 ${classes}`} role="alert" aria-live="assertive">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-sm">{t.message}</div>
      </div>
    )
  }
  
  return (
    <div className={`px-3 py-2 rounded-md shadow-sm flex items-center gap-2 ${classes}`} role="status" aria-live="polite">
      {t.type === 'success' && (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {t.type === 'info' && (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8h.01M11 12h1v4h1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
        </svg>
      )}
      <div className="text-sm">{t.message}</div>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = useCallback((type: Toast['type'], message: string)=>{
    const id = Math.random().toString(16).slice(2)
    setToasts(t => [...t, { id, type, message }])
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if(!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx.toast
}
