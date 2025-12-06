"use client"
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings } from 'lucide-react'
import { getSupabaseClient } from '../../lib/supabase/client'
import CoraAvatar from '../shared/cora-avatar'
import { ThemeToggleCompact } from '../ui/ThemeToggle'
import { useTranslations } from '../../lib/i18n'

export default function Header(){
  const t = useTranslations()
  const [safeToSpend, setSafeToSpend] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchSafeToSpend() {
      try {
        const res = await fetch('/api/intelligence/safe-to-spend')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data && typeof json.data.value === 'number') {
            setSafeToSpend(json.data.value)
          }
        }
      } catch (e) {
        console.warn('Failed to fetch safe-to-spend:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSafeToSpend()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
  }

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/login')
  }

  return (
    <header className="
      w-full px-6 py-4 flex items-center justify-between
      bg-[var(--surface-glass)] backdrop-blur-xl
      border-b border-[var(--border-glass)]
      shadow-glass
    ">
      {/* Safe to Spend Indicator */}
      <div className="flex items-center gap-6">
        <div className="
          hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-2xl
          bg-[var(--surface-glass)] backdrop-blur-sm
          border border-[var(--border-glass)]
          shadow-glass
          transition-all duration-300 ease-smooth
          hover:shadow-elevated hover:scale-[1.02]
        ">
          <span className="text-sm text-[var(--text-muted)]">{t.header.available}</span>
          <span className="text-base font-semibold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
            {loading ? '...' : safeToSpend !== null ? formatCurrency(safeToSpend) : '--'}
          </span>
        </div>
      </div>

      {/* Right side: Theme toggle & User Menu */}
      <div className="flex items-center gap-3">
        <ThemeToggleCompact />
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="
              rounded-2xl p-1
              transition-all duration-300 ease-smooth
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2
              hover:scale-105
            "
            aria-label={t.header.userMenu}
            aria-expanded={menuOpen}
          >
            <CoraAvatar state="idle" />
          </button>
          
          {menuOpen && (
            <div className="
              absolute right-0 mt-3 w-52 z-50 overflow-hidden
              bg-[var(--surface-glass)] backdrop-blur-2xl
              border border-[var(--border-glass)]
              rounded-2xl shadow-float
              animate-in fade-in slide-in-from-top-2 duration-200
            ">
              <div className="py-2">
                <button
                  onClick={() => { router.push('/settings'); setMenuOpen(false) }}
                  className="
                    w-full flex items-center gap-3 px-4 py-3 
                    text-sm font-medium text-[var(--text-on-glass)]
                    transition-all duration-300 ease-smooth
                    hover:bg-[var(--primary-glass)] hover:text-[var(--primary)]
                  "
                >
                  <Settings size={18} />
                  {t.nav.settings}
                </button>
                <div className="mx-3 border-t border-[var(--border-glass)]" />
                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-3 px-4 py-3
                    text-sm font-medium text-[var(--danger)]
                    transition-all duration-300 ease-smooth
                    hover:bg-[var(--danger-glass)]
                  "
                >
                  <LogOut size={18} />
                  {t.header.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
