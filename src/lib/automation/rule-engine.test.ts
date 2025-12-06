import { RuleEngine, FinancialEvent } from './rule-engine'
import { createClient } from '../supabase/server'

// Mock Supabase
jest.mock('../supabase/server', () => ({
  createClient: jest.fn()
}))

describe('Rule Engine', () => {
  const mockFrom = jest.fn()
  
  // Helper to create a chainable mock
  const createChain = (data: any) => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
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

  it('executes rule when trigger matches', async () => {
    // Setup rule
    const mockRule = {
      id: 'rule-1',
      user_id: 'user-1',
      enabled: true,
      trigger_type: 'safe_to_spend_exceeds',
      trigger_condition: { amount: 500 },
      action_type: 'notify',
      action_params: { message: 'Rich!' }
    }
    
    // Mock return for rules query
    mockFrom.mockImplementation((table) => {
      if (table === 'autopilot_rules') return createChain([mockRule])
      return createChain([])
    })

    // Setup event
    const event: FinancialEvent = {
      userId: 'user-1',
      type: 'balance_update',
      data: { safeToSpend: 600 }
    }

    const engine = new RuleEngine()
    await engine.evaluateRules(event)

    // Verify action execution (logging for notify)
    // Check if rule execution log was inserted
    // We expect insert to be called for rule_execution_log
    expect(mockFrom).toHaveBeenCalledWith('rule_execution_log')
  })

  it('ignores rule when trigger does not match', async () => {
    const mockRule = {
      id: 'rule-1',
      user_id: 'user-1',
      enabled: true,
      trigger_type: 'safe_to_spend_exceeds',
      trigger_condition: { amount: 500 },
      action_type: 'notify',
      action_params: { message: 'Rich!' }
    }
    
    mockFrom.mockImplementation((table) => {
      if (table === 'autopilot_rules') return createChain([mockRule])
      return createChain([])
    })

    const event: FinancialEvent = {
      userId: 'user-1',
      type: 'balance_update',
      data: { safeToSpend: 400 } // Less than 500
    }

    const engine = new RuleEngine()
    await engine.evaluateRules(event)

    // Should NOT insert into rule_execution_log
    expect(mockFrom).not.toHaveBeenCalledWith('rule_execution_log')
  })
})

