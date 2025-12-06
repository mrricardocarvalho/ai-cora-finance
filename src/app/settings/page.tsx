'use client'

import React from 'react'
import Link from 'next/link'
import { Bell, Database, Mic, Palette } from 'lucide-react'
import LanguageSwitcher from '../../components/settings/language-switcher'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { useTranslations, useI18n } from '../../lib/i18n'

export default function SettingsPage() {
  const t = useTranslations()
  const { locale } = useI18n()
  const isPortuguese = locale.startsWith('pt')
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6 text-[var(--text-primary)]">{t.settings.title}</h1>
      
      <div className="grid gap-4">
        {/* Theme Section */}
        <div className="p-5 bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
              <Palette size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-medium text-[var(--text-on-glass)]">
                {isPortuguese ? 'Aparência' : 'Appearance'}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {isPortuguese ? 'Escolha o tema da aplicação' : 'Choose your preferred theme'}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <Link 
          href="/settings/notifications" 
          className="block p-4 bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl hover:bg-[var(--surface-elevated)] hover:shadow-elevated transition-all duration-300 shadow-glass"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-glass)] flex items-center justify-center">
              <Bell size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="font-medium text-[var(--text-on-glass)]">{t.settings.notifications}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t.settings.notificationsDesc}</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/settings/voice" 
          className="block p-4 bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl hover:bg-[var(--surface-elevated)] hover:shadow-elevated transition-all duration-300 shadow-glass"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-glass)] flex items-center justify-center">
              <Mic size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="font-medium text-[var(--text-on-glass)]">
                {isPortuguese ? 'Voz e Acessibilidade' : 'Voice & Accessibility'}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {isPortuguese 
                  ? 'Configure respostas por voz e atalhos de teclado' 
                  : 'Configure voice responses and keyboard shortcuts'}
              </p>
            </div>
          </div>
        </Link>
        
        <Link 
          href="/settings/data" 
          className="block p-4 bg-[var(--surface-glass)] backdrop-blur-lg border border-[var(--border-glass)] rounded-2xl hover:bg-[var(--surface-elevated)] hover:shadow-elevated transition-all duration-300 shadow-glass"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-glass)] flex items-center justify-center">
              <Database size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="font-medium text-[var(--text-on-glass)]">{t.settings.data}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t.settings.dataDesc}</p>
            </div>
          </div>
        </Link>

        <LanguageSwitcher />
      </div>
    </div>
  )
}
