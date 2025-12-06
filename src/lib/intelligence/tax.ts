// Tax FIFO utility for capital gains

export type InvestmentTx = {
  id: string
  account_id?: string
  ticker: string
  type: 'buy'|'sell'|'dividend'
  quantity: number | string
  price_per_share: number | string
  fees?: number | string
  date: string
}

export type FIFOGain = {
  ticker: string
  realizedGain: number
  unrealizedGain: number
  gain: number
  tax: number
}

export function calculateFIFOGainsForTicker(transactions: InvestmentTx[], currentPrice: number): FIFOGain {
  // Build buy lots
  const buys: Array<{ qtyRemaining: number; originalQty: number; price: number; originalFees: number; date: string }> = []
  const sells: InvestmentTx[] = []
  for (const t of transactions.sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime())){
    if(t.type === 'buy'){
      const qty = Number(t.quantity || 0)
      const price = Number(t.price_per_share || 0)
      const fees = Number(t.fees || 0)
      buys.push({ qtyRemaining: qty, originalQty: qty, price, originalFees: fees, date: t.date })
    } else if(t.type === 'sell'){
      sells.push(t)
    }
  }

  // Apply sells to buy lots (FIFO), adjusting remaining qty and buy fees.
  // While applying sells, compute realized gains using sell price and proportionate fees.
  let realizedTotalGain = 0
  for(const s of sells){
    let sellQty = Number(s.quantity || 0)
    const originalSellQty = sellQty
    const sellPrice = Number(s.price_per_share || 0)
    const sellFees = Number(s.fees || 0)
    while(sellQty > 0 && buys.length > 0){
      const lot = buys[0]
      const matched = Math.min(sellQty, lot.qtyRemaining)
      // allocate buy fees proportionally
      const proportion = matched / lot.originalQty
      const buyFeeAllocated = lot.originalFees * proportion
      // reduce lot
      lot.qtyRemaining = +(lot.qtyRemaining - matched).toFixed(12)
      // reduce originalFees by allocated amount (useful for remaining inventory calculation)
      lot.originalFees = +(lot.originalFees - buyFeeAllocated).toFixed(12)
      // Allocate proportion of sell fees to this matched portion
      const sellFeeAllocated = (originalSellQty > 0 ? (sellFees * (matched / originalSellQty)) : 0)
      // Realized gain for this matched portion = proceeds - cost - buyFeesAllocated - sellFeeAllocated
      const realizedProceeds = sellPrice * matched
      const realizedCost = lot.price * matched
      const matchedGain = realizedProceeds - realizedCost - buyFeeAllocated - sellFeeAllocated
      realizedTotalGain += matchedGain
      sellQty = +(sellQty - matched).toFixed(12)
      if(lot.qtyRemaining <= 0) buys.shift()
    }
    // if sells exceed buys, we simply ignore (no negatives on inventory) — sold short scenario not expected
  }

  // Now calculate unrealized gain if we sold remaining lots at currentPrice
  let unrealizedGain = 0
  for(const lot of buys){
    const qty = lot.qtyRemaining
    if(qty <= 0) continue
    const proceeds = currentPrice * qty
    const cost = lot.price * qty
    const buyFees = lot.originalFees // remaining buy fees associated with the lot
    const gain = proceeds - cost - buyFees
    unrealizedGain += gain
  }
  const totalGain = realizedTotalGain + unrealizedGain
  const taxBase = (realizedTotalGain > 0 ? realizedTotalGain : 0) + (unrealizedGain > 0 ? unrealizedGain : 0)
  const tax = +(taxBase * 0.28).toFixed(2)
  return {
    ticker: transactions[0]?.ticker || '',
    realizedGain: +realizedTotalGain.toFixed(2),
    unrealizedGain: +unrealizedGain.toFixed(2),
    gain: +totalGain.toFixed(2),
    tax
  }
}

import { createClient as createServerSupabase } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { subDays } from 'date-fns'
import crypto from 'crypto'
import { formatCurrency } from '../utils'

export function calculateFIFOGainsForPortfolio(allTransactions: Record<string, InvestmentTx[]>, currentPrices: Record<string, number>) {
  const byTicker: Record<string, { realizedGain: number; unrealizedGain: number; gain: number; tax: number }> = {}
  let totalTax = 0
  for(const [ticker, txs] of Object.entries(allTransactions)){
    const price = currentPrices[ticker] || 0
    const res = calculateFIFOGainsForTicker(txs, price)
    byTicker[ticker] = { realizedGain: res.realizedGain, unrealizedGain: res.unrealizedGain, gain: res.gain, tax: res.tax }
    totalTax += res.tax
  }
  return { byTicker, totalTax: +totalTax.toFixed(2) }
}

export async function detectTaxHarvesting(userId: string) {
  if(!userId) return { success: false, error: 'userId required' }
  const supabase = await createServerSupabase()
  const holdingsRes = await supabase.from('holdings').select('ticker, quantity, avg_cost_basis, assets(current_price, name)').eq('user_id', userId)
  if(holdingsRes.error) return { success: false, error: holdingsRes.error.message }
  type HoldingRow = { ticker: string; quantity: string; avg_cost_basis: string; assets?: { current_price?: string; name?: string }[] }
  const holdings = holdingsRes.data as HoldingRow[] || []
  const sevenDaysAgo = subDays(new Date(), 7).toISOString()
  const created: string[] = []
  for(const h of holdings){
    const qty = Number(h.quantity || 0)
    const avg = Number(h.avg_cost_basis || 0)
    const price = Number(h.assets?.[0]?.current_price || 0)
    const loss = (avg - price) * qty
    if(loss > 100){
      const title = `Tax-Loss Harvesting Opportunity: ${h.ticker}`
      const message = `Selling ${h.ticker} could generate a ${formatCurrency(loss)} loss to offset other capital gains.`
      const existsRes = await supabase.from('insights').select('id, loss_amount, created_at').eq('user_id', userId).eq('type', 'opportunity').eq('title', title).gte('created_at', sevenDaysAgo).limit(1)
      if(existsRes.error) continue
      let shouldInsert = true
      if(existsRes.data && existsRes.data.length > 0){
        const prev = existsRes.data[0]
        const prevLoss = Number(prev.loss_amount || 0)
        if(!(loss > prevLoss * 1.2)) shouldInsert = false
      }
      if(shouldInsert){
        const ins = await supabase.from('insights').insert([{ id: crypto.randomUUID(), user_id: userId, type: 'opportunity', title, message, action_link: '/portfolio', score_impact: 5, loss_amount: loss }])
        if(!ins.error){
          try{ const { shouldSendNotification } = await import('../services/notification-guard'); const allowed = await shouldSendNotification(userId, 'opportunities'); if(allowed){ const { sendNotification } = await import('../actions/notifications'); await sendNotification(userId, title, message, '/portfolio') } }catch(e){ console.warn('send push failed', e) }
        }
        created.push(title)
      }
    }
  }
  if(created.length > 0) await revalidatePath('/')
  return { success: true, created }
}
