import { createClient } from '../supabase/server'
import { detectTaxHarvesting } from './tax'

describe('detectTaxHarvesting', ()=>{
  it('creates opportunity insight when loss > 100 and enforces 7-day idempotency', async ()=>{
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) throw new Error('No test user')
    const userId = user.id

    // Ensure asset exists
    await supabase.from('assets').upsert({ ticker: 'TAXT', name: 'Tax Test', type: 'stock', current_price: 800 })
    // Create holdings: Avg cost 1000, quantity 1 -> loss 200 > 100
    await supabase.from('accounts').upsert({ id: 'tax-acc-1', user_id: userId, name: 'Broker', type: 'broker', balance: 0, institution: 'Test' })
    await supabase.from('holdings').upsert({ id: 'tax-hold-1', user_id: userId, account_id: 'tax-acc-1', ticker: 'TAXT', quantity: 1, avg_cost_basis: 1000 })

    // Run detection -> should create insight
    const res1 = await detectTaxHarvesting(userId)
    expect(res1.success).toBeTruthy()
    expect(res1.created && res1.created.length > 0).toBeTruthy()
    // verify inserted insight has loss_amount equal to expected loss
    const insightsRes = await supabase.from('insights').select('id, loss_amount').eq('user_id', userId).eq('type', 'opportunity').eq('title', `Tax-Loss Harvesting Opportunity: TAXT`).order('created_at', { ascending: false }).limit(1)
    expect(insightsRes.error).toBeNull()
    expect(insightsRes.data && insightsRes.data.length > 0).toBeTruthy()
    const recent = insightsRes.data?.[0]
    expect(recent).toBeDefined()
    expect(Number(recent?.loss_amount || 0)).toBeCloseTo(200)

    // Run again with same data -> should not create a new insight
    const res2 = await detectTaxHarvesting(userId)
    expect(res2.success).toBeTruthy()
    expect(res2.created && res2.created.length === 0).toBeTruthy()

    // Update holdings to increase loss by >20%: set avg_cost_basis higher so loss increases
    await supabase.from('holdings').update({ avg_cost_basis: 1200 }).eq('id','tax-hold-1')
    const res3 = await detectTaxHarvesting(userId)
    // Should create new insight because loss increased >20%
    expect(res3.success).toBeTruthy()
    expect(res3.created && res3.created.length > 0).toBeTruthy()
  }, 30000)
})
