import { generateInsights, getInsights } from './insights'
import { createClient as createServerSupabase } from '../supabase/server'

// Integration test for insights generation

describe('generateInsights', ()=>{
  it('creates urgent insight on negative SafeToSpend', async ()=>{
    const supabase = await createServerSupabase()
    const userRes = await supabase.auth.getUser()
    const user = userRes.data.user
    if(!user) throw new Error('No test user available')
    const userId = user.id
    // ensure low balance and high comfort floor
    await supabase.from('profiles').upsert({ id: userId, comfort_floor: 1000 })
    await supabase.from('accounts').upsert({ id: 'ins-acc-1', user_id: userId, name: 'Test', type: 'checking', balance: 50, institution: 'Test' })
    // generate insights
    const res = await generateInsights(userId)
    expect(res.success).toBeTruthy()
    const list = await getInsights(userId)
    expect(list.success).toBeTruthy()
    type InsightRow = { type: string }
    const urgent = (list.data || []).find((i: InsightRow)=>i.type === 'urgent')
    expect(urgent).toBeDefined()
  }, 20000)
})
