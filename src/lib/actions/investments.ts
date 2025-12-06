"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { investmentSchema, InvestmentFormData } from '../validations/investment'

export async function recordInvestmentTransaction({ accountId, ticker, type, quantity, pricePerShare, fees, date }: { accountId: string; ticker: string; type: 'buy'|'sell'|'dividend'; quantity: number; pricePerShare: number; fees?: number; date: string }){
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }
  const res = await supabase.rpc('record_investment_transaction', { p_user_id: user.id, p_account_id: accountId, p_ticker: ticker, p_type: type, p_quantity: quantity, p_price_per_share: pricePerShare, p_fees: fees || 0, p_date: date })
  if(res.error) return { success: false, error: res.error.message }
  await revalidatePath('/data')
  await revalidatePath('/')
  const returned = res.data
  const txId = Array.isArray(returned) ? (returned[0] as any) : returned
  return { success: true, txId }
}

export async function getHoldings(userId: string){
  const supabase = await createServerSupabase()
  const res = await supabase.from('holdings').select('*').eq('user_id', userId)
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

export async function getInvestmentTransactions(userId: string, view: 'personal' | 'household' = 'personal'){
  const supabase = await createServerSupabase()
  let query = supabase.from('investment_transactions').select('*').order('date', { ascending: false })
  if (view === 'personal') query = query.eq('user_id', userId)
  const res = await query
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

export async function createAsset({ ticker, name, type, current_price }: { ticker: string; name: string; type: string; current_price?: number }){
  const supabase = await createServerSupabase()
  const normalizedTicker = (ticker || '').toUpperCase().trim()
  const res = await supabase.from('assets').upsert([{ ticker: normalizedTicker, name, type, current_price: current_price || 0 }], { onConflict: 'ticker' }).select()
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

export async function searchAssets(query: string){
  if(!query) return { success: true, data: [] }
  const supabase = await createServerSupabase()
  const q = query.trim()
  const res = await supabase.from('assets').select('*').or(`ticker.ilike.%${q}%,name.ilike.%${q}%`).limit(30)
  if(res.error) return { success: false, error: res.error.message }
  return { success: true, data: res.data }
}

export async function addTransaction(data: InvestmentFormData){
  const supabase = await createServerSupabase()
  const parsed = investmentSchema.safeParse(data)
  if(!parsed.success) return { success: false, error: 'Invalid investment data' }
  const { accountId, ticker: rawTicker, type, quantity, pricePerShare, fees = 0, date } = parsed.data
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { success: false, error: 'Not authenticated' }

  // Normalize ticker early so subsequent checks use the normalized form
  const ticker = (rawTicker || '').toUpperCase().trim()

  // For sells, check current holding quantity
  if(type === 'sell'){
    const holdRes = await supabase.from('holdings').select('quantity').eq('user_id', user.id).eq('account_id', accountId).eq('ticker', ticker).limit(1).single()
    if(holdRes.error) return { success: false, error: holdRes.error.message }
    const curQty = Number(holdRes.data?.quantity || 0)
    if(Number(quantity) > curQty) return { success: false, error: 'Insufficient holdings' }
  }

  // Validate inputs: quantity and price
  if (Number(quantity) <= 0) return { success: false, error: 'Quantity must be greater than 0' }
  if (Number(pricePerShare) < 0) return { success: false, error: 'Price per share must be non-negative' }

  // Ensure account is a broker account
  const accRes = await supabase.from('accounts').select('type').eq('id', accountId).eq('user_id', user.id).limit(1).single()
  if(accRes.error) return { success: false, error: accRes.error.message }
  const accType = accRes.data?.type
  if(accType !== 'broker') return { success: false, error: 'Account must be a broker account' }

  // Ensure asset exists locally; (createAsset is an upsert)
  await createAsset({ ticker, name: ticker, type: 'stock', current_price: pricePerShare })

  const res = await recordInvestmentTransaction({ accountId, ticker, type, quantity, pricePerShare, fees, date })
  if(!res.success) return res
  await revalidatePath('/portfolio')
  return { success: true, txId: res.txId }
}

// No default export
