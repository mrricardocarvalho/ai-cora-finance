'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Locale, translations, TranslationKeys } from './translations'

const STORAGE_KEY = 'cora-locale'
const COOKIE_NAME = 'cora-locale'
const DEFAULT_LOCALE: Locale = 'pt-PT'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [mounted, setMounted] = useState(false)

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && (saved === 'pt-PT' || saved === 'en-US')) {
      setLocaleState(saved)
      // Also set cookie for server-side access
      document.cookie = `${COOKIE_NAME}=${saved};path=/;max-age=31536000`
    }
    setMounted(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    // Set cookie for server-side access (1 year expiry)
    document.cookie = `${COOKIE_NAME}=${newLocale};path=/;max-age=31536000`
    // Update html lang attribute
    document.documentElement.lang = newLocale.split('-')[0]
  }, [])

  // Get translations for current locale
  const t = translations[locale]

  // Prevent hydration mismatch by using default locale until mounted
  const value: I18nContextType = {
    locale: mounted ? locale : DEFAULT_LOCALE,
    setLocale,
    t: mounted ? t : translations[DEFAULT_LOCALE],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Hook that just returns translations (simpler for most components)
export function useTranslations() {
  const { t } = useI18n()
  return t
}
