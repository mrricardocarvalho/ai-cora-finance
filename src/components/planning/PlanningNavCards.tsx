"use client"
import React from 'react'
import Link from 'next/link'
import { Target, CreditCard, Receipt } from 'lucide-react'
import { useTranslations } from '../../lib/i18n'

export default function PlanningNavCards() {
  const t = useTranslations()
  
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Link href="/planning/goals" className="group p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card hover:border-[var(--primary)] hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
            <Target size={20} className="text-[var(--primary)]" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
            {t.pages.planning.goalsCard}
          </h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{t.pages.planning.goalsCardDesc}</p>
      </Link>
      
      <Link href="/planning/debt" className="group p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card hover:border-[var(--accent)] hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
            <CreditCard size={20} className="text-[var(--accent)]" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            {t.pages.debt.title}
          </h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{t.pages.planning.debtCardDesc}</p>
      </Link>
      
      <Link href="/planning/tax" className="group p-4 bg-surface border border-[var(--border)] rounded-xl shadow-card hover:border-emerald-500 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Receipt size={20} className="text-emerald-500" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
            {t.pages?.tax?.title ?? 'Impostos'}
          </h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{t.pages?.tax?.subtitle ?? 'Calendário fiscal e deduções IRS'}</p>
      </Link>
    </section>
  )
}
