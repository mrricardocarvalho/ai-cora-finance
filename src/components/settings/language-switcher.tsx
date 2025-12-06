'use client'

import React from 'react'
import { Globe, Check } from 'lucide-react'
import { useI18n, Locale } from '../../lib/i18n'

const LOCALES: { code: Locale; flag: string }[] = [
  { code: 'pt-PT', flag: '🇵🇹' },
  { code: 'en-US', flag: '🇺🇸' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <Globe size={24} className="text-[var(--primary)]" />
        <div>
          <h2 className="font-medium text-[var(--text-primary)]">{t.settings.language}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t.settings.languageDesc}</p>
        </div>
      </div>
      
      <div className="grid gap-2">
        {LOCALES.map(({ code, flag }) => (
          <button
            key={code}
            onClick={() => setLocale(code)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all
              ${locale === code 
                ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
                : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-subtle)]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{flag}</span>
              <span className={`text-sm ${locale === code ? 'text-[var(--primary)] font-medium' : 'text-[var(--text-primary)]'}`}>
                {t.languages[code]}
              </span>
            </div>
            {locale === code && (
              <Check size={18} className="text-[var(--primary)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
