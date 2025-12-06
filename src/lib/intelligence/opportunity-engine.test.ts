import { detectOpportunities } from './opportunity-engine'
import { createClient } from '../supabase/server'

// Mock Supabase
jest.mock('../supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock Utils
jest.mock('../utils', () => ({
  formatCurrency: (val: number) => `${val} €`
}))

describe('Opportunity Engine', () => {
  const mockFrom = jest.fn()
  
  // Helper to create a chainable mock
  const createChain = (data: any) => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error: null }),
    then: (resolve: any) => resolve({ data, error: null }) // Allow await directly on chain
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      from: mockFrom
    })
    
    // Default mock implementation
    mockFrom.mockImplementation((table) => {
      return createChain(null) // Default return null for everything
    })
  })

  it('detects surplus opportunity', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'monthly_summaries') {
        return createChain({ total_in: 2000, total_out: 1500 })
      }
      return createChain(null)
    })

    const opps = await detectOpportunities('user1')
    const surplus = opps.find(o => o.type === 'surplus')
    expect(surplus).toBeDefined()
    expect(surplus?.title).toContain('Unusual Surplus')
    expect(surplus?.message).toContain('500 €')
  })

  it('detects price drop opportunity', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'holdings') {
        return createChain([
          { 
            ticker: 'VWCE', 
            avg_cost_basis: 100, 
            assets: { current_price: 85, name: 'Vanguard' } 
          }
        ])
      }
      return createChain(null)
    })

    const opps = await detectOpportunities('user1')
    const drop = opps.find(o => o.type === 'price_drop')
    expect(drop).toBeDefined()
    expect(drop?.title).toContain('Price Drop: VWCE')
    expect(drop?.message).toContain('15% below')
  })

  it('detects goal acceleration', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'goals') {
        return createChain([{
          name: 'Vacation',
          target_amount: 1000,
          current_amount: 700,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 50).toISOString()
        }])
      }
      return createChain(null)
    })

    const opps = await detectOpportunities('user1')
    const goal = opps.find(o => o.type === 'goal_acceleration')
    expect(goal).toBeDefined()
    expect(goal?.title).toContain('Ahead of Schedule')
  })

  it('detects debt payoff opportunity', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'accounts') {
        const chain = createChain([])
        chain.select = jest.fn().mockImplementation((cols) => {
            const subChain = createChain([])
            if (cols === 'balance') {
                // This is the savings query
                subChain.then = (resolve: any) => resolve({ data: [{ balance: 5000 }], error: null })
            } else {
                // This is the main query
                subChain.then = (resolve: any) => resolve({ 
                    data: [{ name: 'Credit Card', type: 'credit_card', interest_rate: 20, balance: 1000 }], 
                    error: null 
                })
            }
            subChain.eq = jest.fn().mockReturnThis()
            subChain.in = jest.fn().mockReturnThis()
            return subChain
        })
        return chain
      }
      return createChain(null)
    })

    const opps = await detectOpportunities('user1')
    const debt = opps.find(o => o.type === 'debt_payoff')
    expect(debt).toBeDefined()
    expect(debt?.title).toContain('High Interest Debt')
  })

  it('detects refinancing opportunity', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'accounts') {
         const chain = createChain([])
         chain.select = jest.fn().mockImplementation((cols) => {
            const subChain = createChain([])
            if (cols === 'balance') {
                subChain.then = (resolve: any) => resolve({ data: [], error: null }) 
            } else {
                subChain.then = (resolve: any) => resolve({ 
                    data: [{ name: 'Old Loan', type: 'loan', interest_rate: 9, balance: 10000 }], 
                    error: null 
                })
            }
            subChain.eq = jest.fn().mockReturnThis()
            subChain.in = jest.fn().mockReturnThis()
            return subChain
        })
        return chain
      }
      return createChain(null)
    })

    const opps = await detectOpportunities('user1')
    const refi = opps.find(o => o.type === 'refinancing')
    expect(refi).toBeDefined()
    expect(refi?.title).toContain('Refinance Opportunity')
  })
})