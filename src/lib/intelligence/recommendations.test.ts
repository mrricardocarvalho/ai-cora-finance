import { generateRecommendations } from './recommendations'
import { createClient } from '../supabase/server'

// Mock Supabase
jest.mock('../supabase/server', () => ({
  createClient: jest.fn()
}))

describe('Recommendations Engine', () => {
  const mockFrom = jest.fn()
  
  // Helper to create a chainable mock
  const createChain = (data: any) => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
      then: (resolve: any) => resolve({ data, error: null })
    }
    return chain
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      from: mockFrom
    })
  })

  it('recommends emergency fund if savings low', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'accounts') return createChain([{ type: 'checking', balance: 500 }])
      if (table === 'goals') return createChain([])
      if (table === 'recommendations') return createChain([])
      if (table === 'insights') return createChain([]) // Handle insights query
      return createChain([])
    })

    const result = await generateRecommendations('user1')
    expect(result.created).toBeDefined()
    expect(result.created![0].type).toBe('emergency_fund_start')
    expect(result.created![0].priority).toBe('urgent')
  })

  it('recommends debt payoff if high interest debt exists', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'accounts') return createChain([{ type: 'credit_card', balance: 2000, interest_rate: 19.9 }])
      if (table === 'goals') return createChain([{ name: 'Emergency Fund', current_amount: 5000, target_amount: 5000 }])
      if (table === 'recommendations') return createChain([])
      if (table === 'insights') return createChain([])
      return createChain([])
    })

    const result = await generateRecommendations('user1')
    expect(result.created).toBeDefined()
    expect(result.created![0].type).toBe('debt_payoff_high')
    expect(result.created![0].priority).toBe('urgent')
  })

  it('recommends investing if basics covered', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'accounts') return createChain([{ type: 'savings', balance: 10000 }])
      if (table === 'goals') return createChain([{ name: 'Emergency Fund', current_amount: 5000, target_amount: 5000 }])
      if (table === 'recommendations') return createChain([])
      if (table === 'insights') return createChain([])
      return createChain([])
    })

    const result = await generateRecommendations('user1')
    expect(result.created).toBeDefined()
    expect(result.created![0].type).toBe('investing_start')
    expect(result.created![0].priority).toBe('important')
  })
})
