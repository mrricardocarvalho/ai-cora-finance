import { generateWeeklySummary } from './weekly-summary'
import { createClient } from '../supabase/server'

// Mock Supabase
jest.mock('../supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock Utils
jest.mock('../utils', () => ({
  formatCurrency: (val: number) => `${val} €`
}))

// Mock Notification Guard
jest.mock('../services/notification-guard', () => ({
  shouldSendNotification: jest.fn().mockResolvedValue(true)
}))

// Mock Notifications
jest.mock('../actions/notifications', () => ({
  sendNotification: jest.fn()
}))

describe('Weekly Summary', () => {
  const mockFrom = jest.fn()
  const mockSelect = jest.fn()
  const mockEq = jest.fn()
  const mockGte = jest.fn()
  const mockLte = jest.fn()
  const mockInsert = jest.fn()
  const mockSingle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      from: mockFrom
    })
    
    // Setup chain
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ gte: mockGte, eq: mockEq }) // handle multiple eqs
    mockGte.mockReturnValue({ lte: mockLte })
    mockLte.mockReturnValue({ then: (resolve: any) => resolve({ data: [], error: null }) }) // Default empty
    
    // Insert chain
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })
    mockSingle.mockResolvedValue({ data: { id: 'insight-123' }, error: null })
  })

  it('calculates spending and percent change correctly', async () => {
    const now = new Date()
    // Mock transactions
    // We need to be careful with dates. The function calculates startCurrent/startLast based on 'now'.
    // We can't easily control 'now' inside the function without DI or system time mocking.
    // But we can ensure our mock data covers the ranges the function WILL calculate.
    // The function uses `startOfWeek(now)`.
    
    // Let's just mock the return of the transaction query to return items that WILL fall into the buckets.
    // But wait, the function filters the returned list using `t.date >= startCurrent`.
    // So we need to provide dates that match the real current week.
    
    // We'll rely on the fact that the function fetches a range covering both weeks.
    // We just need to provide dates that are "today" and "7 days ago".
    
    const today = new Date().toISOString()
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    
    mockLte.mockImplementation(() => Promise.resolve({
      data: [
        { amount: -100, date: today, category: 'Food' }, // Current week
        { amount: -50, date: today, category: 'Transport' }, // Current week
        { amount: -200, date: eightDaysAgo, category: 'Food' } // Last week
      ],
      error: null
    }))

    // Mock other queries (bills, goals) to return empty
    mockEq.mockImplementation((field) => {
      if (field === 'user_id') return { gte: mockGte, eq: mockEq, select: mockSelect } // generic
      return { gte: mockGte, eq: mockEq }
    })
    
    // We need to handle the specific table calls
    mockFrom.mockImplementation((table) => {
      if (table === 'transactions') return { select: mockSelect }
      if (table === 'recurring_patterns') return { select: () => ({ eq: () => ({ gte: () => ({ lte: async () => ({ data: [], error: null }) }) }) }) }
      if (table === 'goals') return { select: () => ({ eq: async () => ({ data: [], error: null }) }) }
      if (table === 'insights') return { insert: mockInsert }
      return { select: mockSelect }
    })

    const result = await generateWeeklySummary('user1')
    
    expect(result.success).toBe(true)
    expect(result.summary).toBeDefined()
    if (result.summary) {
      expect(result.summary.totalSpent).toBe(150) // 100 + 50
      expect(result.summary.lastWeekSpent).toBe(200)
      // (150 - 200) / 200 = -0.25 = -25%
      expect(result.summary.percentChange).toBe(-25)
      expect(result.summary.topCategories[0].category).toBe('Food')
      expect(result.summary.highlights[0]).toContain('25% less')
    }
  })

  it('identifies upcoming bills', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'transactions') return { select: () => ({ eq: () => ({ gte: () => ({ lte: async () => ({ data: [], error: null }) }) }) }) }
      if (table === 'recurring_patterns') {
        return { 
          select: () => ({ 
            eq: () => ({ 
              gte: () => ({ 
                lte: async () => ({ 
                  data: [{ merchant_name: 'Netflix', amount: 15, next_date: new Date().toISOString() }], 
                  error: null 
                }) 
              }) 
            }) 
          }) 
        }
      }
      if (table === 'goals') return { select: () => ({ eq: async () => ({ data: [], error: null }) }) }
      if (table === 'insights') return { insert: mockInsert }
      return { select: mockSelect }
    })

    const result = await generateWeeklySummary('user1')
    expect(result.summary?.upcomingBills).toHaveLength(1)
    expect(result.summary?.upcomingBills[0].name).toBe('Netflix')
    expect(result.summary?.actions[0]).toContain('Prepare 15 €')
  })
})
