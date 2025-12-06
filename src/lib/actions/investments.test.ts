import { createClient } from '../supabase/server'
import { createAsset, addTransaction, getHoldings } from './investments'
import { InvestmentFormData } from '../validations/investment'

describe('investments: recordInvestmentTransaction', ()=>{
  it('records buys, updates holdings avg cost, and disallows oversell', async ()=>{
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) throw new Error('No test user')
    const userId = user.id
    // create a broker account for the user
    await supabase.from('accounts').upsert({ id: 'inv-acc-1', user_id: userId, name: 'Broker Test', type: 'broker', balance: 1000, institution: 'Test' })

    // create asset
    await createAsset({ ticker: 'VWCE.DE', name: 'Vanguard World', type: 'etf', current_price: 50 })

    // Buy 2 shares at 50 with 0.5 fees
    const buy1Input: InvestmentFormData = { accountId: 'inv-acc-1', ticker: 'VWCE.DE', type: 'buy', quantity: 2, pricePerShare: 50, fees: 0.5, date: new Date().toISOString() }
    const buy1 = await addTransaction(buy1Input)
    expect(buy1.success).toBeTruthy()
    // Check holdings
    const holdings1 = await getHoldings(userId)
    expect(holdings1.success).toBeTruthy()
    type HoldingRow = { id?: string; ticker: string; account_id: string; quantity: string | number; avg_cost_basis: string | number }
    const h1 = (holdings1.data || []).find((h: HoldingRow)=>h.ticker === 'VWCE.DE' && h.account_id === 'inv-acc-1')
    expect(h1).toBeDefined()
    expect(Number(h1.quantity)).toEqual(2)
    // avg should be 50 + 0.5/2 = 50.25
    expect(Math.round(Number(h1.avg_cost_basis) * 100) / 100).toEqual(50.25)

    // Buy 1 more at 60 with fees 0.2
    const buy2Input: InvestmentFormData = { accountId: 'inv-acc-1', ticker: 'VWCE.DE', type: 'buy', quantity: 1, pricePerShare: 60, fees: 0.2, date: new Date().toISOString() }
    const buy2 = await addTransaction(buy2Input)
    expect(buy2.success).toBeTruthy()
    const holdings2 = await getHoldings(userId)
    const h2 = (holdings2.data || []).find((h: HoldingRow)=>h.ticker === 'VWCE.DE' && h.account_id === 'inv-acc-1')
    expect(h2).toBeDefined()
    expect(Number(h2.quantity)).toEqual(3)
    // new avg = ((2*50.25) + (1*60 + 0.2))/3 = ((100.5) + 60.2)/3 = 160.7/3 ≈ 53.5666667
    expect(Math.round(Number(h2.avg_cost_basis) * 1000) / 1000).toBeCloseTo(53.567, 3)

    // Sell 1, holdings quantity reduces to 2, avg cost unchanged
    const sellInput: InvestmentFormData = { accountId: 'inv-acc-1', ticker: 'VWCE.DE', type: 'sell', quantity: 1, pricePerShare: 70, fees: 0, date: new Date().toISOString() }
    const sell = await addTransaction(sellInput)
    expect(sell.success).toBeTruthy()
    const holdings3 = await getHoldings(userId)
    const h3 = (holdings3.data || []).find((h: HoldingRow)=>h.ticker === 'VWCE.DE' && h.account_id === 'inv-acc-1')
    expect(Number(h3.quantity)).toEqual(2)
    expect(Math.round(Number(h3.avg_cost_basis) * 1000) / 1000).toBeCloseTo(Number(h2.avg_cost_basis), 3)

    // Attempt to sell more than holdings should fail
    const badSellInput: InvestmentFormData = { accountId: 'inv-acc-1', ticker: 'VWCE.DE', type: 'sell', quantity: 100, pricePerShare: 70, fees: 0, date: new Date().toISOString() }
    const badSell = await addTransaction(badSellInput)
    expect(badSell.success).toBeFalsy()
  }, 30000)

  it('normalizes tickers and handles lower-case ticker inputs', async ()=>{
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) throw new Error('No test user')
    const userId = user.id
    // create a broker account for the user
    await supabase.from('accounts').upsert({ id: 'inv-acc-2', user_id: userId, name: 'Broker Test 2', type: 'broker', balance: 1000, institution: 'Test' })

    // Add asset using uppercase
    await createAsset({ ticker: 'AAPL', name: 'Apple Inc', type: 'stock', current_price: 150 })

    // Add transaction with lowercase ticker
    const buyLower: InvestmentFormData = { accountId: 'inv-acc-2', ticker: 'aapl', type: 'buy', quantity: 1, pricePerShare: 150, fees: 0, date: new Date().toISOString() }
    const res = await addTransaction(buyLower)
    expect(res.success).toBeTruthy()
    const holdings = await getHoldings(userId)
    const h = (holdings.data || []).find((h:any)=>h.ticker === 'AAPL' && h.account_id === 'inv-acc-2')
    expect(h).toBeDefined()
    expect(Number(h.quantity)).toEqual(1)
  })
})
// Keep only one integration test block; recordInvestmentTransaction is covered by addTransaction tests
