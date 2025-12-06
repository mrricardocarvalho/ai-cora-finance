"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { calculateFIFOGainsForPortfolio, InvestmentTx } from '../intelligence/tax'

export async function getCachedTaxExposure(userId: string) {
  const supabase = await createServerSupabase()
  const res = await supabase.from('tax_exposure_cache').select('data, total_tax, updated_at').eq('user_id', userId).limit(1).single()
  if(res.error) return { success: false, error: res.error.message }
  if(!res.data) return { success: true, data: null }
  return { success: true, data: { ...res.data.data, totalTax: Number(res.data.total_tax), updatedAt: res.data.updated_at } }
}

export async function setCachedTaxExposure(userId: string, data: any, totalTax: number) {
  const supabase = await createServerSupabase()
  const res = await supabase.from('tax_exposure_cache').upsert([{ user_id: userId, data, total_tax: totalTax }], { onConflict: 'user_id' }).select()
  if(res.error) return { success: false, error: res.error.message }
  return { success: true }
}

export async function recomputeTaxExposure(userId: string) {
  const supabase = await createServerSupabase()
  // Fetch transactions grouped by ticker
  const txRes = await supabase.from('investment_transactions').select('id, account_id, ticker, type, quantity, price_per_share, fees, date').eq('user_id', userId).order('date', { ascending: true })
  if(txRes.error) return { success: false, error: txRes.error.message }
  const txs = txRes.data as InvestmentTx[]
  const grouped: Record<string, InvestmentTx[]> = {}
  for(const t of txs){ grouped[t.ticker] = grouped[t.ticker] || []; grouped[t.ticker].push(t) }

  // fetch current prices for tickers via assets
  const tickers = Object.keys(grouped)
  const assetsRes = await supabase.from('assets').select('ticker, current_price').in('ticker', tickers)
  const prices: Record<string, number> = {}
  if(!assetsRes.error && assetsRes.data){
    for(const a of assetsRes.data as any[]) prices[a.ticker] = Number(a.current_price || 0)
  }

  const exposure = calculateFIFOGainsForPortfolio(grouped, prices)
  await setCachedTaxExposure(userId, exposure, exposure.totalTax)
  return { success: true, data: exposure }
}

// Named exports only — do not use default export in "use server" files
