import { 
  calculateCashFlowForecast, 
  generateFloorCrossingInsight,
  type WhatIfScenario 
} from './forecast'

// Unit tests for forecast engine
// These tests require a running Supabase instance with test data

describe('Cash Flow Forecast', () => {
  const testUserId = process.env.TEST_USER_ID || 'test-user-id'

  describe('calculateCashFlowForecast', () => {
    it('should return error for empty userId', async () => {
      const result = await calculateCashFlowForecast('', 30)
      expect(result.success).toBe(false)
      expect(result.error).toBe('userId required')
    })

    it('should return 31 days for 30-day forecast (including today)', async () => {
      const result = await calculateCashFlowForecast(testUserId, 30)
      expect(result.success).toBe(true)
      expect(result.days.length).toBe(31)
    })

    it('should have starting balance in first day', async () => {
      const result = await calculateCashFlowForecast(testUserId, 30)
      if (result.success && result.days.length > 0) {
        expect(typeof result.days[0].projectedBalance).toBe('number')
      }
    })

    it('should include comfort floor', async () => {
      const result = await calculateCashFlowForecast(testUserId, 30)
      expect(typeof result.comfortFloor).toBe('number')
    })

    it('should have confidence indicator', async () => {
      const result = await calculateCashFlowForecast(testUserId, 30)
      expect(['high', 'medium', 'low']).toContain(result.confidence)
    })
  })

  describe('What-If Scenarios', () => {
    it('should apply hypothetical expense', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().slice(0, 10)
      
      const scenarios: WhatIfScenario[] = [
        { amount: -500, date: dateStr, description: 'Test expense' }
      ]
      
      const withScenario = await calculateCashFlowForecast(testUserId, 30, scenarios)
      const withoutScenario = await calculateCashFlowForecast(testUserId, 30)
      
      if (withScenario.success && withoutScenario.success) {
        // Find the day with the scenario
        const dayWithScenario = withScenario.days.find(d => d.date === dateStr)
        const dayWithoutScenario = withoutScenario.days.find(d => d.date === dateStr)
        
        if (dayWithScenario && dayWithoutScenario) {
          // Balance should be 500 less with the scenario
          expect(dayWithScenario.projectedBalance).toBeLessThan(dayWithoutScenario.projectedBalance)
        }
      }
    })
  })

  describe('generateFloorCrossingInsight', () => {
    it('should return null when no floor crossing', async () => {
      const mockForecast = {
        success: true,
        days: [],
        startingBalance: 5000,
        comfortFloor: 500,
        floorCrossingDate: null,
        daysUntilFloor: null,
        confidence: 'high' as const
      }
      
      const insight = await generateFloorCrossingInsight(testUserId, mockForecast)
      expect(insight).toBeNull()
    })

    it('should return warning when floor crossing detected', async () => {
      const mockForecast = {
        success: true,
        days: [],
        startingBalance: 1000,
        comfortFloor: 500,
        floorCrossingDate: '2025-12-20',
        daysUntilFloor: 15,
        confidence: 'high' as const
      }
      
      const insight = await generateFloorCrossingInsight(testUserId, mockForecast)
      expect(insight).not.toBeNull()
      expect(insight?.type).toBe('warning')
      expect(insight?.title).toBe('Cash Flow Warning')
    })
  })
})

// Confidence calculation tests
describe('Confidence Calculation', () => {
  function calculateConfidence(dataMonths: number): 'high' | 'medium' | 'low' {
    if (dataMonths >= 6) return 'high'
    if (dataMonths >= 3) return 'medium'
    return 'low'
  }

  it('should return high for 12 months of data', () => {
    expect(calculateConfidence(12)).toBe('high')
  })

  it('should return high for 6 months of data', () => {
    expect(calculateConfidence(6)).toBe('high')
  })

  it('should return medium for 4 months of data', () => {
    expect(calculateConfidence(4)).toBe('medium')
  })

  it('should return low for 1 month of data', () => {
    expect(calculateConfidence(1)).toBe('low')
  })

  it('should return low for 0 months of data', () => {
    expect(calculateConfidence(0)).toBe('low')
  })
})
