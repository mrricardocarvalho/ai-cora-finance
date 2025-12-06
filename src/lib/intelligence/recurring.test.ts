import { detectRecurringPatterns, DetectedPattern } from './recurring'
import { createClient as createServerSupabase } from '../supabase/server'

// NOTE: These tests require a running Supabase instance and proper env vars for server client. Run manually.

describe('detectRecurringPatterns', ()=>{
  it('detects monthly Netflix recurring pattern', async ()=>{
    const supabase = await createServerSupabase()
    const userRes = await supabase.auth.getUser()
    const user = userRes.data.user
    if(!user) throw new Error('No test user available')
    const userId = user.id

    const txs = [
      { id: 't1', account_id: 'a1', user_id: userId, amount: -9.99, date: '2025-08-01', description: 'Netflix X', category: 'Subscriptions' },
      { id: 't2', account_id: 'a1', user_id: userId, amount: -9.99, date: '2025-09-01', description: 'Netflix X', category: 'Subscriptions' },
      { id: 't3', account_id: 'a1', user_id: userId, amount: -9.99, date: '2025-10-01', description: 'Netflix X', category: 'Subscriptions' }
    ]

    // insert transactions
    await supabase.from('transactions').upsert(txs)
    const res = await detectRecurringPatterns(userId)
    expect(res.success).toBeTruthy()
    expect(Array.isArray(res.patterns)).toBeTruthy()
    const found = (res.patterns as DetectedPattern[]).find((p)=> p.merchant.includes('netflix'))
    expect(found).toBeDefined()
  }, 20000)
})
