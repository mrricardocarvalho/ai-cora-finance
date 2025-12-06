"use client"
import React from 'react'
import { getSupabaseClient } from '../../lib/supabase/client'

export default function Avatar(){
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    const client = getSupabaseClient()
    if (client) {
      await client.auth.signOut()
    }
    window.location.href = '/login'
  }

  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-medium">A</button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-surface border border-[var(--border)] rounded-xl shadow-elevated p-2 z-50">
          <button 
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full text-left p-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  )
}
