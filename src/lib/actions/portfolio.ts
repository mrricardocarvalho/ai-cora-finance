"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { getInvestmentTransactions } from './investments'
import { calculateFIFOGainsForPortfolio, InvestmentTx, detectTaxHarvesting } from '../intelligence/tax'
import { getCachedTaxExposure, recomputeTaxExposure } from './tax'

export type AssetData = { ticker: string; name: string; current_price: string; previous_close?: string; type: string }

export type HoldingRow = {
  id: string
  ticker: string
  quantity: string
  avg_cost_basis: string
  account_id: string
  assets?: AssetData | AssetData[] | null
}

export async function getPortfolioData(userId?: string, view: 'personal' | 'household' = 'personal') {
  const supabase = await createServerSupabase()
  let uid = userId
  if (!uid) {
    const { data } = await supabase.auth.getUser()
    uid = data.user?.id
  }
  if(!uid) return { success: false, error: 'userId required' }

  // Query holdings with assets - previous_close may not exist yet if migration not applied
  let query = supabase.from('holdings').select('id, ticker, quantity, avg_cost_basis, account_id, assets(ticker,name,current_price,type)')
  if (view === 'personal') query = query.eq('user_id', uid)
  const res = await query
  if(res.error) return { success: false, error: res.error.message }
  
  const rows = (res.data || []) as HoldingRow[]
  const holdings = rows.map(r => {
    // Handle both array and object form of assets join
    let asset: AssetData | null = null
    if (Array.isArray(r.assets)) {
      asset = r.assets[0] || null
    } else if (r.assets && typeof r.assets === 'object') {
      asset = r.assets as AssetData
    }
    
    const qty = Number(r.quantity || 0)
    const avg = Number(r.avg_cost_basis || 0)
    const price = Number(asset?.current_price || 0)
    const previousClose = Number(asset?.previous_close || 0)
    const value = price * qty
    const cost = avg * qty
    const unrealized = value - cost
    const percent = cost ? (unrealized / cost) * 100 : 0
    
    // Day change calculation
    const dayChange = previousClose > 0 ? (price - previousClose) * qty : 0
    const dayChangePercent = previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0
    
    return {
      id: r.id,
      ticker: r.ticker,
      name: asset?.name || r.ticker,
      quantity: qty,
      avg_cost_basis: avg,
      current_price: price,
      previous_close: previousClose,
      value,
      cost,
      unrealized,
      percent,
      dayChange,
      dayChangePercent,
      type: asset?.type || 'unknown'
    }
  })

  // Calculate totals including day change
  const totals = holdings.reduce((acc, h) => ({
    totalValue: acc.totalValue + h.value,
    totalCost: acc.totalCost + h.cost,
    totalUnrealized: acc.totalUnrealized + h.unrealized,
    totalDayChange: acc.totalDayChange + h.dayChange
  }), { totalValue: 0, totalCost: 0, totalUnrealized: 0, totalDayChange: 0 })

  const totalReturnPercent = totals.totalCost ? (totals.totalUnrealized / totals.totalCost) * 100 : 0

  // Compute tax exposure using FIFO per ticker (favor cached results)
  const txRes = await getInvestmentTransactions(uid, view)
  let taxExposure = { totalTax: 0, byTicker: {} as Record<string, { realizedGain: number; unrealizedGain: number; gain: number; tax: number }> }
  if(txRes.success){
    const investments = txRes.data || []
    // Group transactions by ticker
    const grouped: Record<string, InvestmentTx[]> = {}
    for(const tx of investments){
      const t: InvestmentTx = {
        id: tx.id,
        account_id: tx.account_id,
        ticker: tx.ticker,
        type: tx.type,
        quantity: Number(tx.quantity),
        price_per_share: Number(tx.price_per_share),
        fees: Number(tx.fees || 0),
        date: tx.date
      }
      grouped[t.ticker] = grouped[t.ticker] || []
      grouped[t.ticker].push(t)
    }
    // Build current prices map for tickers from holdings/assets
    const currentPrices: Record<string, number> = {}
    for(const h of holdings) currentPrices[h.ticker] = h.current_price || 0
    // Prefer cache when available for quick responses
    try{
      const cache = await getCachedTaxExposure(uid)
      if(cache.success && cache.data && view === 'personal'){ // Only use cache for personal view
        taxExposure = cache.data
        const ageMs = Date.now() - new Date(cache.data.updatedAt).getTime()
        if(ageMs > 5 * 60 * 1000){
          // stale, trigger recompute in background
          recomputeTaxExposure(uid).catch(()=>{})
        }
      } else {
        // compute and cache in background
        taxExposure = calculateFIFOGainsForPortfolio(grouped, currentPrices)
        if (view === 'personal') recomputeTaxExposure(uid).catch(()=>{})
      }
    } catch(e){
      taxExposure = calculateFIFOGainsForPortfolio(grouped, currentPrices)
    }
    // Run tax harvesting detection on each portfolio load (non-blocking): fire-and-forget
    try { if (view === 'personal') detectTaxHarvesting(uid).catch(e => console.warn('Tax harvesting detection failed', e)) } catch(e) { console.warn('Tax harvesting detection failed', e) }
  }

  return {
    success: true,
    data: {
      holdings,
      totals: { ...totals, totalReturnPercent },
      taxExposure
    }
  }
}
