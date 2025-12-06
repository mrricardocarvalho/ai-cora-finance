import { recalculateMonthlySummary, getQuickStats } from './analytics'
import { createClient } from '../supabase/server'

// Integration-style test requiring real Supabase server session

describe('recalculateMonthlySummary & quick stats', ()=>{
  it('recalculates monthly summary and exposes quick stats', async ()=>{
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) throw new Error('No test user')
    const userId = user.id
    // insert transactions in this month
    const now = new Date()
    const t1 = { id: 'tst-analytics-1', account_id: 'a1', user_id: userId, amount: 1000, date: now.toISOString(), description: 'Salary' }
    const t2 = { id: 'tst-analytics-2', account_id: 'a1', user_id: userId, amount: -200, date: now.toISOString(), description: 'Groceries' }
    await supabase.from('transactions').upsert([t1, t2])
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const res = await recalculateMonthlySummary(userId, monthStart)
    expect(res.success).toBeTruthy()
    const stats = await getQuickStats(userId)
    expect(stats.success).toBeTruthy()
  }, 20000)
})
