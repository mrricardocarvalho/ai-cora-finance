"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { subMonths, startOfMonth, format } from 'date-fns'
import { formatCurrency } from '../utils'

// AC #1: Types for anomaly detection
export interface MerchantBaseline {
  merchantSlug: string
  merchantName: string
  average: number
  stdDev: number
  count: number
  minAmount: number
  maxAmount: number
  lastDate: string
}

export interface CategoryBaseline {
  category: string
  monthlyAverage: number
  stdDev: number
  monthCount: number
}

export interface Anomaly {
  type: 'merchant' | 'category'
  identifier: string // merchant slug or category name
  displayName: string
  currentAmount: number
  average: number
  percentDiff: number
  historicalContext: string
  transactionId?: string
  transactionDate?: string
}

export interface AnomalyResult {
  success: boolean
  anomalies: Anomaly[]
  error?: string
}

// Configuration - AC #2: configurable threshold
const MERCHANT_ANOMALY_THRESHOLD = 0.30 // 30% above average
const CATEGORY_ANOMALY_THRESHOLD = 0.50 // 50% above average for categories
const MIN_DATA_POINTS = 3 // Minimum transactions for baseline

// Normalize merchant name for grouping (same logic as recurring.ts)
function merchantSlug(desc?: string): string {
  if (!desc) return ''
  return desc.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50)
}

// AC #1: Calculate rolling average and standard deviation for merchant
function calculateStats(amounts: number[]): { average: number; stdDev: number } {
  if (amounts.length === 0) return { average: 0, stdDev: 0 }
  const avg = amounts.reduce((s, n) => s + n, 0) / amounts.length
  const variance = amounts.reduce((s, n) => s + Math.pow(n - avg, 2), 0) / amounts.length
  return { average: avg, stdDev: Math.sqrt(variance) }
}

// AC #5: Check if transaction matches an annual pattern
async function isAnnualPattern(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  userId: string,
  merchantSlug: string
): Promise<boolean> {
  const res = await supabase
    .from('recurring_patterns')
    .select('frequency')
    .eq('user_id', userId)
    .eq('merchant_slug', merchantSlug)
    .eq('is_active', true)
    .limit(1)
  
  if (res.error || !res.data || res.data.length === 0) return false
  return res.data[0].frequency === 'yearly' || res.data[0].frequency === 'annual'
}

// AC #1: Build merchant baselines from transaction history
export async function buildMerchantBaselines(userId: string): Promise<MerchantBaseline[]> {
  const supabase = await createServerSupabase()
  
  // Get transactions from the last 12 months (expenses only)
  const twelveMonthsAgo = subMonths(new Date(), 12).toISOString()
  const res = await supabase
    .from('transactions')
    .select('id, description, amount, date, category')
    .eq('user_id', userId)
    .lt('amount', 0) // Only expenses
    .gte('date', twelveMonthsAgo)
    .order('date', { ascending: true })
  
  if (res.error || !res.data) return []
  
  type TxRow = { id: string; description: string; amount: number | string; date: string; category?: string }
  
  // Group by merchant slug
  const buckets: Record<string, { amounts: number[]; lastDate: string; name: string }> = {}
  
  for (const tx of res.data as TxRow[]) {
    const slug = merchantSlug(tx.description)
    if (!slug) continue
    
    const amount = Math.abs(Number(tx.amount))
    if (!buckets[slug]) {
      buckets[slug] = { amounts: [], lastDate: tx.date, name: tx.description || slug }
    }
    buckets[slug].amounts.push(amount)
    buckets[slug].lastDate = tx.date
  }
  
  // Build baselines for merchants with enough data
  const baselines: MerchantBaseline[] = []
  
  for (const [slug, data] of Object.entries(buckets)) {
    if (data.amounts.length < MIN_DATA_POINTS) continue
    
    const { average, stdDev } = calculateStats(data.amounts)
    
    baselines.push({
      merchantSlug: slug,
      merchantName: data.name,
      average: Math.round(average * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      count: data.amounts.length,
      minAmount: Math.min(...data.amounts),
      maxAmount: Math.max(...data.amounts),
      lastDate: data.lastDate
    })
  }
  
  return baselines
}

// AC #4: Build category baselines from monthly totals
export async function buildCategoryBaselines(userId: string): Promise<CategoryBaseline[]> {
  const supabase = await createServerSupabase()
  
  // Get last 6 months of transactions grouped by category and month
  const sixMonthsAgo = subMonths(new Date(), 6).toISOString()
  const res = await supabase
    .from('transactions')
    .select('amount, date, category')
    .eq('user_id', userId)
    .lt('amount', 0) // Only expenses
    .gte('date', sixMonthsAgo)
  
  if (res.error || !res.data) return []
  
  type TxRow = { amount: number | string; date: string; category?: string }
  
  // Group by category -> month -> total
  const categoryMonthlyTotals: Record<string, Record<string, number>> = {}
  
  for (const tx of res.data as TxRow[]) {
    const cat = tx.category || 'Uncategorized'
    const month = format(new Date(tx.date), 'yyyy-MM')
    const amount = Math.abs(Number(tx.amount))
    
    if (!categoryMonthlyTotals[cat]) {
      categoryMonthlyTotals[cat] = {}
    }
    categoryMonthlyTotals[cat][month] = (categoryMonthlyTotals[cat][month] || 0) + amount
  }
  
  // Calculate baselines
  const baselines: CategoryBaseline[] = []
  
  for (const [category, monthlyData] of Object.entries(categoryMonthlyTotals)) {
    const monthlyTotals = Object.values(monthlyData)
    if (monthlyTotals.length < 2) continue // Need at least 2 months
    
    const { average, stdDev } = calculateStats(monthlyTotals)
    
    baselines.push({
      category,
      monthlyAverage: Math.round(average * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      monthCount: monthlyTotals.length
    })
  }
  
  return baselines
}

// AC #2 & #3: Detect anomalies for a specific transaction
export async function detectTransactionAnomaly(
  userId: string,
  transactionId: string,
  description: string,
  amount: number,
  date: string
): Promise<Anomaly | null> {
  const supabase = await createServerSupabase()
  const slug = merchantSlug(description)
  if (!slug) return null
  
  const absAmount = Math.abs(amount)
  
  // AC #5: Skip if this is a known annual pattern
  if (await isAnnualPattern(supabase, userId, slug)) {
    return null
  }
  
  // Get historical transactions for this merchant
  const twelveMonthsAgo = subMonths(new Date(date), 12).toISOString()
  const res = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', userId)
    .lt('amount', 0)
    .gte('date', twelveMonthsAgo)
    .lt('date', date) // Only transactions before this one
    .ilike('description', `%${slug.replace(/-/g, '%')}%`)
  
  if (res.error || !res.data || res.data.length < MIN_DATA_POINTS) return null
  
  type TxRow = { amount: number | string; date: string }
  const amounts = (res.data as TxRow[]).map(t => Math.abs(Number(t.amount)))
  const { average } = calculateStats(amounts)
  
  if (average === 0) return null
  
  const percentDiff = ((absAmount - average) / average)
  
  // AC #2: Check if exceeds threshold
  if (percentDiff <= MERCHANT_ANOMALY_THRESHOLD) return null
  
  // AC #3: Build historical context (no longer need sortedAmounts since we use max)
  const isHighest = absAmount > Math.max(...amounts)
  const historicalContext = isHighest
    ? `This is your highest ${description} charge in the past ${amounts.length} transactions`
    : `This is higher than your usual ${formatCurrency(average)} average`
  
  return {
    type: 'merchant',
    identifier: slug,
    displayName: description,
    currentAmount: absAmount,
    average: Math.round(average * 100) / 100,
    percentDiff: Math.round(percentDiff * 100),
    historicalContext,
    transactionId,
    transactionDate: date
  }
}

// AC #4: Detect category-level anomalies for current month
export async function detectCategoryAnomalies(userId: string): Promise<Anomaly[]> {
  const supabase = await createServerSupabase()
  
  const now = new Date()
  const currentMonthStart = startOfMonth(now).toISOString()
  
  // Get current month spending by category
  const currentRes = await supabase
    .from('transactions')
    .select('amount, category')
    .eq('user_id', userId)
    .lt('amount', 0)
    .gte('date', currentMonthStart)
  
  if (currentRes.error || !currentRes.data) return []
  
  type TxRow = { amount: number | string; category?: string }
  
  // Sum current month by category
  const currentByCategory: Record<string, number> = {}
  for (const tx of currentRes.data as TxRow[]) {
    const cat = tx.category || 'Uncategorized'
    currentByCategory[cat] = (currentByCategory[cat] || 0) + Math.abs(Number(tx.amount))
  }
  
  // Get baselines
  const baselines = await buildCategoryBaselines(userId)
  const baselineMap = new Map(baselines.map(b => [b.category, b]))
  
  // Check for anomalies
  const anomalies: Anomaly[] = []
  
  for (const [category, currentTotal] of Object.entries(currentByCategory)) {
    const baseline = baselineMap.get(category)
    if (!baseline || baseline.monthlyAverage === 0) continue
    
    const percentDiff = (currentTotal - baseline.monthlyAverage) / baseline.monthlyAverage
    
    if (percentDiff > CATEGORY_ANOMALY_THRESHOLD) {
      anomalies.push({
        type: 'category',
        identifier: category,
        displayName: category,
        currentAmount: Math.round(currentTotal * 100) / 100,
        average: baseline.monthlyAverage,
        percentDiff: Math.round(percentDiff * 100),
        historicalContext: `You've spent ${Math.round(percentDiff * 100)}% more on ${category} this month compared to your ${baseline.monthCount}-month average`
      })
    }
  }
  
  return anomalies
}

// Main function: Detect all anomalies for a user
export async function detectAnomalies(userId: string): Promise<AnomalyResult> {
  if (!userId) return { success: false, anomalies: [], error: 'userId required' }
  
  try {
    const supabase = await createServerSupabase()
    
    // Get recent transactions (last 7 days) to check for merchant anomalies
    const weekAgo = subMonths(new Date(), 0)
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const recentRes = await supabase
      .from('transactions')
      .select('id, description, amount, date')
      .eq('user_id', userId)
      .lt('amount', 0)
      .gte('date', weekAgo.toISOString())
      .order('date', { ascending: false })
    
    const merchantAnomalies: Anomaly[] = []
    
    if (!recentRes.error && recentRes.data) {
      type TxRow = { id: string; description: string; amount: number | string; date: string }
      for (const tx of recentRes.data as TxRow[]) {
        const anomaly = await detectTransactionAnomaly(
          userId,
          tx.id,
          tx.description || '',
          Number(tx.amount),
          tx.date
        )
        if (anomaly) {
          merchantAnomalies.push(anomaly)
        }
      }
    }
    
    // Check category anomalies
    const categoryAnomalies = await detectCategoryAnomalies(userId)
    
    return {
      success: true,
      anomalies: [...merchantAnomalies, ...categoryAnomalies]
    }
  } catch (e) {
    console.error('detectAnomalies failed:', e)
    return { success: false, anomalies: [], error: String(e) }
  }
}

export default detectAnomalies
