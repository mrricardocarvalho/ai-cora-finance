import { createAsset, recordInvestmentTransaction, getHoldings } from '../actions/investments'
import { createClient } from '../supabase/server'

async function run(){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) { console.error('No auth user'); process.exit(1) }
  const userId = user.id
  // create asset
  await createAsset({ ticker: 'VWCE.DE', name: 'Vanguard World', type: 'etf', current_price: 50 })
  // find a broker account for user
  const accRes = await supabase.from('accounts').select('*').eq('user_id', userId).limit(1)
  const acc = accRes.data?.[0]
  if(!acc){ console.error('No account available for investments'); process.exit(1) }
  // record a buy
  const buyRes = await recordInvestmentTransaction({ accountId: acc.id, ticker: 'VWCE.DE', type: 'buy', quantity: 2, pricePerShare: 50, fees: 0.5, date: new Date().toISOString() })
  console.log('buyRes', buyRes)
  const holdings = await getHoldings(userId)
  console.log('holdings', holdings)
}

run().catch(e=>{ console.error(e); process.exit(2) })
