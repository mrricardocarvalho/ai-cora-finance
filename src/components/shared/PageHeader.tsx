"use client"
import React from 'react'
import { useTranslations } from '../../lib/i18n'

// Specific text components for use in server components
export function HomeGreeting() {
  const t = useTranslations()
  return (
    <header>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.pages.home.greeting}</h1>
      <p className="text-[var(--text-secondary)] mt-1">{t.pages.home.subtitle}</p>
    </header>
  )
}

export function InsightHistoryHeader() {
  const t = useTranslations()
  return (
    <h2 className="text-lg font-medium mb-4 text-[var(--text-primary)]">{t.pages.home.insightHistory}</h2>
  )
}

export function NoInsightsMessage() {
  const t = useTranslations()
  return (
    <div className="bg-surface border border-[var(--border)] rounded-xl p-6 text-center">
      <p className="text-[var(--text-muted)]">{t.pages.home.noInsightsYet}</p>
      <a href="/data" className="text-[var(--primary)] hover:text-[var(--primary-hover)] mt-2 inline-block font-medium">
        {t.pages.home.goToData}
      </a>
    </div>
  )
}

export function DashboardHeader() {
  const t = useTranslations()
  return (
    <header>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.pages.dashboard.title}</h1>
      <p className="mt-1 text-[var(--text-secondary)]">{t.pages.dashboard.subtitle}</p>
    </header>
  )
}

export function DashboardOverviewHeader() {
  const t = useTranslations()
  return (
    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t.pages.dashboard.overview}</h2>
  )
}

export function DashboardRecentInsightsHeader() {
  const t = useTranslations()
  return (
    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t.pages.dashboard.recentInsights}</h2>
  )
}

export function DataHeader() {
  const t = useTranslations()
  return (
    <header>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.pages.data.title}</h1>
      <p className="mt-1 text-[var(--text-secondary)]">{t.pages.data.subtitle}</p>
    </header>
  )
}

export function PortfolioHeader() {
  const t = useTranslations()
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.pages.portfolio.title}</h1>
        <p className="mt-1 text-[var(--text-secondary)]">{t.pages.portfolio.subtitle}</p>
      </div>
    </header>
  )
}

export function PortfolioHoldingsHeader() {
  const t = useTranslations()
  return (
    <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t.portfolio.holdings}</h2>
  )
}

export function PortfolioNoHoldings() {
  const t = useTranslations()
  return (
    <div className="p-6 text-center">
      <p className="mb-4 text-[var(--text-secondary)]">{t.pages.portfolio.noHoldings}</p>
      <a href="/data" className="inline-block px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition-opacity">
        {t.pages.portfolio.startInvesting}
      </a>
    </div>
  )
}

export function PortfolioLoginRequired() {
  const t = useTranslations()
  return <div className="p-4">{t.pages.portfolio.loginRequired}</div>
}

export function PortfolioLoadError({ error }: { error: string }) {
  const t = useTranslations()
  return <div className="p-4">{t.pages.portfolio.loadError}: {error}</div>
}

export function PlanningHeader() {
  const t = useTranslations()
  return (
    <header>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t.pages.planning.title}</h1>
      <p className="mt-1 text-[var(--text-secondary)]">{t.pages.planning.subtitle}</p>
    </header>
  )
}

export function FireProjectionHeader() {
  const t = useTranslations()
  return (
    <h3 className="text-md font-semibold text-[var(--text-primary)] mb-3">{t.pages.planning.fireProjection}</h3>
  )
}

// Root page components
export function RootHomeGreeting() {
  const t = useTranslations()
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t.pages.home.greeting}</h1>
      <p className="text-[var(--text-secondary)]">{t.pages.home.subtitle}</p>
    </div>
  )
}

export function RootOverviewHeader() {
  const t = useTranslations()
  return (
    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t.widgets.overview.title}</h2>
  )
}

export function RootRecentInsightsHeader() {
  const t = useTranslations()
  return (
    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t.pages.home.recentInsights}</h2>
  )
}

export function ViewDetailsLink() {
  const t = useTranslations()
  return (
    <a 
      href="/insights" 
      className="text-sm text-[var(--primary)] hover:underline font-medium flex-shrink-0"
    >
      {t.pages.home.viewDetails}
    </a>
  )
}
