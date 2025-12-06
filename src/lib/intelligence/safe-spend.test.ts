import getSafeToSpend from './safe-spend'
import { createClient as createServerSupabase } from '../supabase/server'

// This is an integration-style test; requires a running Supabase instance and a valid user session with TEST_USER_ID

describe('getSafeToSpend', ()=>{
  it('calculates expected SafeToSpend using balances and pending bills', async ()=>{
    const supabase = await createServerSupabase()
    const userRes = await supabase.auth.getUser()
    const user = userRes.data.user
    if(!user) throw new Error('No test user available')
    const userId = user.id
    // set up accounts
    await supabase.from('accounts').upsert({ id: 'test-acc-1', user_id: userId, name: 'Test', type: 'checking', balance: 1000, institution: 'Test' })
    await supabase.from('profiles').upsert({ id: userId, email: 'test@example.com', comfort_floor: 500 })
    // create a recurring bill due this month for 100
    const now = new Date()
    const nextDate = new Date(); nextDate.setDate(Math.min(28, now.getDate()+5))
    await supabase.from('recurring_patterns').upsert({ id: 'tst-rec-1', user_id: userId, merchant_name: 'Test subs', amount: 100, next_date: nextDate.toISOString(), is_active: true })
    const result = await getSafeToSpend(userId)
    expect(result.status).toBeDefined()
    expect(Math.round(result.value)).toEqual(400)
  }, 20000)
})
