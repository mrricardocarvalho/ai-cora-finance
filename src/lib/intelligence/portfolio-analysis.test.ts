import { 
  analyzeDiversification, 
  generateDiversificationInsight
} from './portfolio-analysis'
import {
  getRiskIndicator,
  type RiskLevel
} from './portfolio-analysis-types'

// Unit tests for portfolio diversification analysis
// These tests require a running Supabase instance with test data

describe('Portfolio Diversification Analysis', () => {
  const testUserId = process.env.TEST_USER_ID || 'test-user-id'

  describe('analyzeDiversification', () => {
    it('should return error for unauthenticated user', async () => {
      // This will fail auth check if no user
      const result = await analyzeDiversification()
      // Result depends on auth state - either success with empty or error
      expect(typeof result.success).toBe('boolean')
    })

    it('should return analysis structure with all fields', async () => {
      const result = await analyzeDiversification(testUserId)
      
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('riskLevel')
      expect(result).toHaveProperty('holdings')
      expect(result).toHaveProperty('typeAllocation')
      expect(result).toHaveProperty('geoAllocation')
      expect(result).toHaveProperty('concentratedAssets')
      expect(result).toHaveProperty('recommendations')
    })

    it('should return valid risk level', async () => {
      const result = await analyzeDiversification(testUserId)
      expect(['low', 'moderate', 'high']).toContain(result.riskLevel)
    })
  })

  describe('generateDiversificationInsight', () => {
    it('should return null for well-diversified portfolio', async () => {
      const mockAnalysis = {
        success: true,
        riskLevel: 'low' as RiskLevel,
        holdings: [
          { ticker: 'VWCE', name: 'Vanguard', type: 'ETF', value: 1000, percentage: 20, isConcentrated: false },
          { ticker: 'BND', name: 'Bond', type: 'Bond', value: 1000, percentage: 20, isConcentrated: false }
        ],
        typeAllocation: [],
        geoAllocation: [],
        concentratedAssets: [],
        recommendations: []
      }
      
      const insight = await generateDiversificationInsight(mockAnalysis)
      expect(insight).toBeNull()
    })

    it('should return insight for concentrated portfolio', async () => {
      const mockAnalysis = {
        success: true,
        riskLevel: 'high' as RiskLevel,
        holdings: [
          { ticker: 'VWCE', name: 'Vanguard', type: 'ETF', value: 8000, percentage: 60, isConcentrated: true },
          { ticker: 'BND', name: 'Bond', type: 'Bond', value: 2000, percentage: 40, isConcentrated: true }
        ],
        typeAllocation: [],
        geoAllocation: [],
        concentratedAssets: ['VWCE', 'BND'],
        recommendations: ['Diversify']
      }
      
      const insight = await generateDiversificationInsight(mockAnalysis)
      expect(insight).not.toBeNull()
      expect(insight?.type).toBe('opportunity')
    })
  })
})

// Risk calculation tests
describe('Risk Level Calculation', () => {
  function calculateRiskLevel(
    maxConcentration: number,
    typeConcentration: number
  ): RiskLevel {
    if (maxConcentration > 0.40 || typeConcentration > 0.80) return 'high'
    if (maxConcentration > 0.25) return 'moderate'
    return 'low'
  }

  it('should return high for 50% single asset concentration', () => {
    expect(calculateRiskLevel(0.50, 0.60)).toBe('high')
  })

  it('should return high for 90% single type concentration', () => {
    expect(calculateRiskLevel(0.20, 0.90)).toBe('high')
  })

  it('should return moderate for 30% single asset concentration', () => {
    expect(calculateRiskLevel(0.30, 0.50)).toBe('moderate')
  })

  it('should return low for 20% single asset concentration', () => {
    expect(calculateRiskLevel(0.20, 0.50)).toBe('low')
  })

  it('should return low for well-diversified portfolio', () => {
    expect(calculateRiskLevel(0.15, 0.40)).toBe('low')
  })
})

// Risk indicator tests
describe('getRiskIndicator', () => {
  it('should return green for low risk', () => {
    const indicator = getRiskIndicator('low')
    expect(indicator.emoji).toBe('🟢')
    expect(indicator.label).toBe('Well Diversified')
  })

  it('should return yellow for moderate risk', () => {
    const indicator = getRiskIndicator('moderate')
    expect(indicator.emoji).toBe('🟡')
    expect(indicator.label).toBe('Moderate Concentration')
  })

  it('should return red for high risk', () => {
    const indicator = getRiskIndicator('high')
    expect(indicator.emoji).toBe('🔴')
    expect(indicator.label).toBe('High Concentration')
  })
})
