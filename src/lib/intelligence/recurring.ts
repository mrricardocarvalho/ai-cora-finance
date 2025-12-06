"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { addMonths, differenceInDays } from 'date-fns'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

function normalizeMerchant(desc?: string){
  if(!desc) return ''
  return desc.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
}

function merchantSlug(desc?: string){
  const n = normalizeMerchant(desc)
  return n.replace(/\s+/g, '-')
}

export type DetectedPattern = { merchant: string; amount: number; last_date: string; category?: string | null }
export async function detectRecurringPatterns(userId: string) {
  if(!userId) return { success: false, error: 'missing userId' }
  const supabase = await createServerSupabase()
  // Fetch transactions in the last 12 months to narrow the detection window
  const threshold = new Date()
  threshold.setFullYear(threshold.getFullYear() - 1)
  const res = await supabase.from('transactions').select('*').eq('user_id', userId).gte('date', threshold.toISOString()).order('date', { ascending: true })
  if(res.error) return { success: false, error: res.error.message }
  const txs = res.data || []
  // group by normalized merchant/description
  type TxRow = { id: string; account_id?: string; user_id?: string; amount: number | string; date: string; description?: string; category?: string | null }
  const buckets: Record<string, TxRow[]> = {}
  // Use slug as bucket key, and keep a human-friendly merchant name from last seen description
  const nameMap: Record<string, string> = {}
  for(const t of txs){
    const slug = merchantSlug(t.description || '')
    if(!slug) continue
    buckets[slug] = buckets[slug] || []
    buckets[slug].push(t)
    // save a human readable name if available
    if(t.description && t.description.trim().length > 0) nameMap[slug] = t.description
  }

  const matches: DetectedPattern[] = []
  for(const key of Object.keys(buckets)){
    const group = buckets[key] as TxRow[]
    if(group.length < 2) continue
    // sort by date
    const sorted = group.slice().sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime())
    const diffs = [] as number[]
    for(let i=1;i<sorted.length;i++){ diffs.push(differenceInDays(new Date(sorted[i].date), new Date(sorted[i-1].date))) }
    const avgDiff = diffs.length ? (diffs.reduce((s,n)=>s+n,0)/diffs.length) : 0
    // require monthly-ish frequency 25..35 days
    if(!(avgDiff >= 25 && avgDiff <= 35)) continue
    // amounts: mean and variance check
    const amounts = sorted.map(s=> Math.abs(Number(s.amount)))
    const mean = amounts.reduce((s,n)=>s+n, 0)/amounts.length
    const allClose = amounts.every(a => Math.abs(a-mean) <= mean * 0.05)
    if(!allClose) continue
    // candidate pattern
    matches.push({ merchant: key, amount: mean, last_date: sorted[sorted.length-1].date, category: sorted[sorted.length-1].category || null })
  }

  if(matches.length === 0) return { success: true, patterns: [] }

  // Upsert patterns and mark transactions
  for(const m of matches){
    const { merchant, amount, last_date, category } = m
    const slug = merchant
    const merchantName = nameMap[slug] || slug.replace(/-/g, ' ')
    const existing = await supabase.from('recurring_patterns').select('*').eq('user_id', userId).eq('merchant_slug', slug).limit(1)
    const nextDate = addMonths(new Date(last_date), 1).toISOString().slice(0,19)
    if(existing.error) return { success: false, error: existing.error.message }
    if(existing.data && existing.data.length > 0){
      const ex = existing.data[0]
      await supabase.from('recurring_patterns').update({ amount, last_date, next_date: nextDate, category, is_active: true, merchant_name: merchantName, merchant_slug: slug }).eq('id', ex.id)
    } else {
      await supabase.from('recurring_patterns').insert([{ id: crypto.randomUUID(), user_id: userId, merchant_name: merchantName, merchant_slug: slug, amount, frequency: 'monthly', last_date, next_date: nextDate, category, is_active: true }])
    }
    // mark transactions as recurring by ids collected from the buckets
    const idsToMark = (buckets[slug] || []).map(t => t.id).filter(Boolean)
    if(idsToMark.length > 0){
      await supabase.from('transactions').update({ is_recurring: true }).in('id', idsToMark).eq('user_id', userId)
    }
  }
  await revalidatePath('/data')
  return { success: true, patterns: matches }
}

export default detectRecurringPatterns
