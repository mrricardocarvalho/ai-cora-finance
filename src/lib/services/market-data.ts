import YahooFinance from 'yahoo-finance2'
import { createClient as createServerSupabase } from '../supabase/server'
import { detectTaxHarvesting } from '../intelligence/tax'

// Initialize Yahoo Finance v3
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

type UpdateResult = {
  ticker: string
  updated: boolean
  error?: string
}

export async function updateAssetPrices(): Promise<{updated: UpdateResult[], failed: UpdateResult[]}> {
  const supabase = await createServerSupabase()
  const { data: tickersData, error } = await supabase.from('assets').select('ticker')
  if (error) throw error
  const rawTickers = (tickersData || []).map((r: { ticker: string }) => r.ticker).filter(Boolean)
  const tickers = Array.from(new Set(rawTickers))
  const updated: UpdateResult[] = []
  const failed: UpdateResult[] = []

  const batchSize = 25
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize)
    const promises = batch.map(async (ticker) => {
      try {
        const q = await yahooFinance.quote(ticker)
        type YahooQuote = { regularMarketPrice?: number; regularMarketPreviousClose?: number }
        const quote = q as YahooQuote
        const price = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose ?? null
        if (price == null) {
          failed.push({ ticker, updated: false, error: 'no price found' })
          return
        }
        const res = await supabase.from('assets').update({ current_price: price, last_updated: new Date().toISOString() }).eq('ticker', ticker).select()
        if (res.error) {
          const msg = res.error?.message ?? String(res.error)
          failed.push({ ticker, updated: false, error: msg || 'update failed' })
          return
        }
        updated.push({ ticker, updated: true })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('Failed to update', ticker, message)
        failed.push({ ticker, updated: false, error: message })
      }
    })
    await Promise.all(promises)
    // polite delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 500))
  }
  // After updating assets, attempt to detect tax harvesting opportunities for all users.
  try{
    const updatedTickers = updated.map((u) => u.ticker)
    if (updatedTickers.length > 0) {
      const supabase2 = await createServerSupabase()
      const holdingsRes = await supabase2.from('holdings').select('user_id').in('ticker', updatedTickers)
      if (!holdingsRes.error && holdingsRes.data && holdingsRes.data.length) {
        const users = Array.from(new Set((holdingsRes.data || []).map((h: { user_id: string }) => h.user_id)))
        for(const u of users){
          try{ await detectTaxHarvesting(u) } catch(e){ console.warn('detectTaxHarvesting failed', e) }
        }
      }
    }
  }catch(e){ console.warn('Error running tax harvesting after update', e) }

  return { updated, failed }
}

export default updateAssetPrices
