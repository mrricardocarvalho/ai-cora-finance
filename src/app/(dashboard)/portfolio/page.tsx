import React from 'react'
import { createClient } from '../../../lib/supabase/server'
import { getPortfolioData } from '../../../lib/actions/portfolio'
import { analyzeDiversification } from '../../../lib/intelligence/portfolio-analysis'
import PortfolioSummary from '../../../components/portfolio/portfolio-summary'
import AllocationChart from '../../../components/portfolio/allocation-chart'
import HoldingsTable from '../../../components/portfolio/holdings-table'
import AddInvestmentWrapper from '../../../components/portfolio/add-investment-wrapper'
import TaxExposureCard from '../../../components/portfolio/tax-exposure-card'
import DiversificationCard from '../../../components/portfolio/DiversificationCard'
import RefreshPricesButton from '../../../components/portfolio/refresh-prices-button'
import { PortfolioHeader, PortfolioHoldingsHeader, PortfolioNoHoldings, PortfolioLoginRequired, PortfolioLoadError } from '../../../components/shared/PageHeader'

export default async function PortfolioPage(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return (<PortfolioLoginRequired />)
  const resp = await getPortfolioData(user.id)
  if(!resp.success) return (<PortfolioLoadError error={String(resp.error)} />)
  const data = resp.data || { holdings: [], totals: { totalValue: 0, totalCost: 0, totalUnrealized: 0, totalReturnPercent: 0 } }
  const { holdings, totals } = data
  
  // Story 7.4: Run diversification analysis
  const diversificationAnalysis = await analyzeDiversification(user.id)
  
  // Determine chart data based on asset type diversity
  const assetTypes = new Set(holdings.map(h => h.type))
  const CHART_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316']
  
  let allocationData: { name: string; value: number; color: string }[]
  
  if (assetTypes.size <= 1) {
    // Only one asset type (e.g., all ETFs) - show breakdown by individual holdings
    allocationData = holdings.map((h, i) => ({
      name: h.ticker,
      value: h.value,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }))
  } else {
    // Multiple asset types - show breakdown by type (stocks, ETFs, bonds, etc.)
    const allocationMap: Record<string, number> = {}
    for (const h of holdings) { 
      allocationMap[h.type] = (allocationMap[h.type] || 0) + h.value 
    }
    allocationData = Object.entries(allocationMap).map(([k, v], i) => ({
      name: k,
      value: v,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }))
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <PortfolioHeader />

      {/* Portfolio Summary - always full width for cleaner look */}
      <section>
        <PortfolioSummary totals={totals} />
      </section>

      {/* Charts Row - side by side on medium+ screens */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-[var(--border)] rounded-xl bg-surface shadow-card">
          <AllocationChart data={allocationData} />
        </div>
        <TaxExposureCard taxExposure={resp?.data?.taxExposure || null} />
      </section>
      
      {/* Story 7.4: Diversification Analysis Card */}
      <section>
        <DiversificationCard analysis={diversificationAnalysis} />
      </section>

      {/* Holdings Table */}
      <section className="p-4 sm:p-5 bg-surface border border-[var(--border)] rounded-xl shadow-card">
        <div className="flex justify-between items-center mb-4">
          <PortfolioHoldingsHeader />
          <div className="flex items-center gap-2">
            <RefreshPricesButton />
            <AddInvestmentWrapper />
          </div>
        </div>
        {holdings.length === 0 ? (
          <PortfolioNoHoldings />
        ) : (
          <HoldingsTable items={holdings} />
        )}
      </section>
    </div>
  )
}
