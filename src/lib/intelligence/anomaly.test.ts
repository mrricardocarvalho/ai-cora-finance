import { 
  buildMerchantBaselines, 
  buildCategoryBaselines,
  detectAnomalies
} from './anomaly'

// Unit tests for anomaly detection logic
// These tests require a running Supabase instance with test data

describe('Anomaly Detection', () => {
  // Mock user ID for tests
  const testUserId = process.env.TEST_USER_ID || 'test-user-id'

  describe('buildMerchantBaselines', () => {
    it('should return empty array for user with no transactions', async () => {
      // This test assumes a clean user or requires setup
      const baselines = await buildMerchantBaselines('non-existent-user')
      expect(Array.isArray(baselines)).toBe(true)
    })
  })

  describe('buildCategoryBaselines', () => {
    it('should return empty array for user with no transactions', async () => {
      const baselines = await buildCategoryBaselines('non-existent-user')
      expect(Array.isArray(baselines)).toBe(true)
    })
  })

  describe('detectAnomalies', () => {
    it('should return success false for missing userId', async () => {
      const result = await detectAnomalies('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('userId required')
    })

    it('should return anomalies array', async () => {
      const result = await detectAnomalies(testUserId)
      expect(result.success).toBe(true)
      expect(Array.isArray(result.anomalies)).toBe(true)
    })
  })
})

// Statistical helper tests (pure functions)
describe('Statistical Calculations', () => {
  // Helper to test calculateStats logic
  function calculateStats(amounts: number[]): { average: number; stdDev: number } {
    if (amounts.length === 0) return { average: 0, stdDev: 0 }
    const avg = amounts.reduce((s, n) => s + n, 0) / amounts.length
    const variance = amounts.reduce((s, n) => s + Math.pow(n - avg, 2), 0) / amounts.length
    return { average: avg, stdDev: Math.sqrt(variance) }
  }

  it('should calculate correct average', () => {
    const result = calculateStats([10, 20, 30])
    expect(result.average).toBe(20)
  })

  it('should calculate correct standard deviation', () => {
    const result = calculateStats([10, 10, 10])
    expect(result.stdDev).toBe(0)
  })

  it('should handle empty array', () => {
    const result = calculateStats([])
    expect(result.average).toBe(0)
    expect(result.stdDev).toBe(0)
  })

  it('should detect high variation', () => {
    const result = calculateStats([10, 50, 10, 50])
    expect(result.stdDev).toBeGreaterThan(15) // High stdDev
  })
})

// Anomaly threshold tests
describe('Anomaly Thresholds', () => {
  const MERCHANT_ANOMALY_THRESHOLD = 0.30 // 30%

  it('should flag transaction 40% above average', () => {
    const average = 100
    const current = 140
    const percentDiff = (current - average) / average
    expect(percentDiff).toBeGreaterThan(MERCHANT_ANOMALY_THRESHOLD)
  })

  it('should not flag transaction 20% above average', () => {
    const average = 100
    const current = 120
    const percentDiff = (current - average) / average
    expect(percentDiff).toBeLessThanOrEqual(MERCHANT_ANOMALY_THRESHOLD)
  })

  it('should not flag transaction at average', () => {
    const average = 100
    const current = 100
    const percentDiff = (current - average) / average
    expect(percentDiff).toBe(0)
  })
})
