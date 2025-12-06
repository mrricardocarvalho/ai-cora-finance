'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from '../../lib/i18n'

export default function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'personal'
  const t = useTranslations()

  const setView = (v: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    router.push(`?${params.toString()}`)
  }

  return (
    <div
      className="inline-flex h-fit p-1 rounded-full bg-[var(--surface-glass)] border border-[var(--border-glass)] shadow-glass backdrop-blur-xl"
      aria-label={t.accounts.visibilities.personal}
      role="tablist"
    >
      <button
        onClick={() => setView('personal')}
        role="tab"
        aria-selected={view === 'personal'}
        className={`
          px-4 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 ease-smooth
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2
          ${view === 'personal'
            ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-glow'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }
        `}
      >
        {t.accounts.visibilities.personal}
      </button>
      <button
        onClick={() => setView('household')}
        role="tab"
        aria-selected={view === 'household'}
        className={`
          px-4 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all duration-200 ease-smooth
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2
          ${view === 'household'
            ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-glow'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }
        `}
      >
        {t.accounts.visibilities.shared}
      </button>
    </div>
  )
}
