// Portfolio analysis types and client-safe utilities
// These are separated from the server actions to allow client-side imports

// AC #5: Risk level types
export type RiskLevel = 'low' | 'moderate' | 'high'

// AC #1 & #2: Holding with analysis data
export interface HoldingAnalysis {
  ticker: string
  name: string
  type: string
  value: number
  percentage: number
  isConcentrated: boolean
}

// AC #2: Type allocation breakdown
export interface TypeAllocation {
  type: string
  value: number
  percentage: number
  isOverweight: boolean
}

// AC #3: Geographic allocation (stretch goal)
export interface GeoAllocation {
  region: string
  value: number
  percentage: number
}

// Main diversification analysis result
export interface DiversificationAnalysis {
  success: boolean
  riskLevel: RiskLevel
  holdings: HoldingAnalysis[]
  typeAllocation: TypeAllocation[]
  geoAllocation: GeoAllocation[]
  concentratedAssets: string[]
  recommendations: string[]
  error?: string
}

// AC #5: Risk indicator mapping - client-safe utility
export function getRiskIndicator(level: RiskLevel): { emoji: string; label: string; color: string } {
  switch (level) {
    case 'low':
      return { emoji: '🟢', label: 'Well Diversified', color: 'text-green-600' }
    case 'moderate':
      return { emoji: '🟡', label: 'Moderate Concentration', color: 'text-amber-600' }
    case 'high':
      return { emoji: '🔴', label: 'High Concentration', color: 'text-red-600' }
  }
}
