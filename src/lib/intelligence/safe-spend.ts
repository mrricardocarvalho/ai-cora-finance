"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { startOfDay, endOfMonth, formatISO } from 'date-fns'

export type SafeToSpendStatus = 'Safe'|'Caution'|'Danger'
export type SafeToSpendResult = {
  value: number
  status: SafeToSpendStatus
  details: {
    liquidAssets: number
    comfortFloor: number
    pendingBills: number
    asOf: string
  }
}

export async function getSafeToSpend(userId: string, view: 'personal' | 'household' = 'personal'): Promise<SafeToSpendResult> {
  if(!userId) throw new Error('userId required')
  const supabase = await createServerSupabase()

  const roundTwo = (v:number) => Math.round((v + Number.EPSILON) * 100) / 100
  const now = startOfDay(new Date())

  // Liquid assets: sum of checking and savings balances
  let accQuery = supabase.from('accounts').select('balance').in('type', ['checking', 'savings'])
  if (view === 'personal') accQuery = accQuery.eq('user_id', userId)
  
  const accRes = await accQuery
  if(accRes.error) {
    console.warn('getSafeToSpend: accounts query failed:', accRes.error.message)
    // Return default values for new users with no accounts
    return {
      value: 0,
      status: 'Safe',
      details: {
        liquidAssets: 0,
        comfortFloor: 500,
        pendingBills: 0,
        asOf: now.toISOString()
      }
    }
  }
  type AccountRow = { balance: string | number }
  // Coerce DB decimal strings safely to numbers and compute a cents-accurate sum
  const balances = accRes.data?.map((a: AccountRow)=> Number(a.balance ?? 0)) || []
  const liquidAssetsUnrounded = balances.reduce((s,n)=> s + (Number(n) || 0), 0)
  const liquidAssets = roundTwo(liquidAssetsUnrounded)

  // comfort floor
  let profileQuery = supabase.from('profiles').select('comfort_floor')
  if (view === 'personal') profileQuery = profileQuery.eq('id', userId)
  
  const profileRes = await profileQuery
  if(profileRes.error) {
    console.warn('getSafeToSpend: profile query failed:', profileRes.error.message)
  }
  
  // Sum comfort floors of all visible profiles (myself + household members if view=household)
  const comfortFloorUnrounded = (profileRes.data || []).reduce((s, p) => s + Number(p.comfort_floor || 0), 0)
  // Default to 500 if 0 (e.g. new user)
  const comfortFloor = roundTwo(comfortFloorUnrounded || 500)

  // pending bills: active recurring_patterns where next_date in [today, endOfMonth]
  const end = endOfMonth(now)
  const nowIso = formatISO(now)
  const endIso = formatISO(end)
  
  let billsQuery = supabase.from('recurring_patterns').select('amount, next_date, is_active').eq('is_active', true).gte('next_date', nowIso).lte('next_date', endIso)
  if (view === 'personal') billsQuery = billsQuery.eq('user_id', userId)
  
  const billsRes = await billsQuery
  if(billsRes.error) {
    console.warn('getSafeToSpend: recurring_patterns query failed:', billsRes.error.message)
  }
  type PatternRow = { amount: string | number, next_date?: string | null, is_active?: boolean }
  const pendingBillsUnrounded = (billsRes.data || []).reduce((s:number, item: PatternRow) => s + Number(item.amount || 0), 0)
  const pendingBills = roundTwo(pendingBillsUnrounded)

  const safeValueUnrounded = liquidAssets - comfortFloor - pendingBills
  const safeValue = roundTwo(safeValueUnrounded)
  // status logic
  const cautionThreshold = comfortFloor * 0.1
  const status: SafeToSpendStatus = safeValue > 0 ? 'Safe' : (safeValue >= -cautionThreshold ? 'Caution' : 'Danger')

  return {
    value: Number(safeValue),
    status,
    details: {
      liquidAssets: Number(liquidAssets),
      comfortFloor: Number(comfortFloor),
      pendingBills: Number(pendingBills),
      asOf: now.toISOString()
    }
  }
}

export default getSafeToSpend
