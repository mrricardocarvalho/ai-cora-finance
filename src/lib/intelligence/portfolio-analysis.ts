"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { getPortfolioData } from '../actions/portfolio'

// Re-export types from the client-safe module
export type { 
  RiskLevel, 
  HoldingAnalysis, 
  TypeAllocation, 
  GeoAllocation, 
  DiversificationAnalysis 
} from './portfolio-analysis-types'

// Import types for internal use
import type { 
  RiskLevel, 
  HoldingAnalysis, 
  TypeAllocation, 
  GeoAllocation, 
  DiversificationAnalysis 
} from './portfolio-analysis-types'

// AC #1 & #5: Calculate risk level based on concentration
function calculateRiskLevel(
  maxConcentration: number,
  typeConcentration: number
): RiskLevel {
  // AC #5: High risk if single asset > 40% or single type > 80%
  if (maxConcentration > 0.40 || typeConcentration > 0.80) return 'high'
  // Moderate if single asset > 25%
  if (maxConcentration > 0.25) return 'moderate'
  return 'low'
}

// AC #4: Generate diversification recommendations
function generateRecommendations(
  holdings: HoldingAnalysis[],
  typeAllocation: TypeAllocation[],
  riskLevel: RiskLevel
): string[] {
  const recommendations: string[] = []
  
  // Find concentrated assets
  const concentrated = holdings.filter(h => h.isConcentrated)
  
  if (concentrated.length > 0) {
    const topConcentrated = concentrated.sort((a, b) => b.percentage - a.percentage)[0]
    recommendations.push(
      `Your portfolio is ${Math.round(topConcentrated.percentage)}% concentrated in ${topConcentrated.ticker}. Consider diversifying to reduce single-asset risk.`
    )
  }
  
  // Check type concentration
  const overweightTypes = typeAllocation.filter(t => t.isOverweight)
  if (overweightTypes.length > 0) {
    const topType = overweightTypes[0]
    recommendations.push(
      `${Math.round(topType.percentage)}% of your portfolio is in ${topType.type}s. Consider adding other asset types for better balance.`
    )
  }
  
  // General recommendations based on risk level
  if (riskLevel === 'high') {
    recommendations.push(
      'High concentration increases volatility. Consider spreading investments across more assets.'
    )
  }
  
  // Check if only one asset type
  if (typeAllocation.length === 1) {
    recommendations.push(
      'Your portfolio has only one asset type. Consider adding bonds, stocks, or other assets for diversification.'
    )
  }
  
  // No recommendations if well diversified
  if (recommendations.length === 0 && riskLevel === 'low') {
    recommendations.push(
      'Your portfolio appears well diversified. Continue monitoring as market conditions change.'
    )
  }
  
  return recommendations
}

// Main analysis function
export async function analyzeDiversification(userId?: string): Promise<DiversificationAnalysis> {
  const supabase = await createServerSupabase()
  
  let uid = userId
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser()
    uid = user?.id
  }
  
  if (!uid) {
    return {
      success: false,
      riskLevel: 'low',
      holdings: [],
      typeAllocation: [],
      geoAllocation: [],
      concentratedAssets: [],
      recommendations: [],
      error: 'User not authenticated'
    }
  }
  
  // Get portfolio data
  const portfolioRes = await getPortfolioData(uid)
  
  if (!portfolioRes.success || !portfolioRes.data) {
    return {
      success: false,
      riskLevel: 'low',
      holdings: [],
      typeAllocation: [],
      geoAllocation: [],
      concentratedAssets: [],
      recommendations: [],
      error: portfolioRes.error || 'Failed to load portfolio'
    }
  }
  
  const { holdings: rawHoldings, totals } = portfolioRes.data
  const totalValue = totals.totalValue || 0
  
  if (totalValue === 0 || rawHoldings.length === 0) {
    return {
      success: true,
      riskLevel: 'low',
      holdings: [],
      typeAllocation: [],
      geoAllocation: [],
      concentratedAssets: [],
      recommendations: ['Start investing to see diversification analysis.']
    }
  }
  
  // AC #1: Analyze individual holdings
  const holdings: HoldingAnalysis[] = rawHoldings.map(h => {
    const percentage = (h.value / totalValue) * 100
    return {
      ticker: h.ticker,
      name: h.name,
      type: h.type || 'unknown',
      value: h.value,
      percentage,
      isConcentrated: percentage > 25 // AC #1: Flag if > 25%
    }
  }).sort((a, b) => b.percentage - a.percentage)
  
  // Find max concentration
  const maxConcentration = holdings.length > 0 
    ? holdings[0].percentage / 100 
    : 0
  
  // AC #2: Calculate type allocation
  const typeMap: Record<string, number> = {}
  for (const h of rawHoldings) {
    const type = h.type || 'Unknown'
    typeMap[type] = (typeMap[type] || 0) + h.value
  }
  
  const typeAllocation: TypeAllocation[] = Object.entries(typeMap)
    .map(([type, value]) => ({
      type,
      value,
      percentage: (value / totalValue) * 100,
      isOverweight: (value / totalValue) > 0.60 // Flag if > 60%
    }))
    .sort((a, b) => b.percentage - a.percentage)
  
  // Find max type concentration
  const maxTypeConcentration = typeAllocation.length > 0
    ? typeAllocation[0].percentage / 100
    : 0
  
  // AC #5: Calculate risk level
  const riskLevel = calculateRiskLevel(maxConcentration, maxTypeConcentration)
  
  // Get concentrated asset tickers
  const concentratedAssets = holdings
    .filter(h => h.isConcentrated)
    .map(h => h.ticker)
  
  // AC #3: Geographic allocation (stretch - based on asset regions if available)
  // For now, return empty - would need asset metadata enhancement
  const geoAllocation: GeoAllocation[] = []
  
  // AC #4: Generate recommendations
  const recommendations = generateRecommendations(holdings, typeAllocation, riskLevel)
  
  return {
    success: true,
    riskLevel,
    holdings,
    typeAllocation,
    geoAllocation,
    concentratedAssets,
    recommendations
  }
}

// AC #4: Generate insight for concentrated portfolio
export async function generateDiversificationInsight(
  analysis: DiversificationAnalysis
): Promise<{ type: 'opportunity'; title: string; message: string } | null> {
  if (analysis.riskLevel === 'low' || analysis.concentratedAssets.length === 0) {
    return null
  }
  
  const topConcentrated = analysis.holdings.find(h => h.isConcentrated)
  if (!topConcentrated) return null
  
  return {
    type: 'opportunity',
    title: 'Portfolio Concentration Alert',
    message: `Your portfolio is ${Math.round(topConcentrated.percentage)}% concentrated in ${topConcentrated.ticker}. Consider diversifying to reduce single-asset risk.`
  }
}

export default analyzeDiversification
