import { createClient } from '../supabase/server'
import { startOfWeek, endOfWeek, subWeeks, addDays, format } from 'date-fns'
import { formatCurrency } from '../utils'
import crypto from 'crypto'

export type WeeklySummary = {
  totalSpent: number
  lastWeekSpent: number
  percentChange: number
  topCategories: { category: string; amount: number }[]
  largestTransaction: { description: string; amount: number } | null
  upcomingBills: { name: string; amount: number; date: string }[]
  goalProgress: { name: string; progress: number }[]
  highlights: string[]
  actions: string[]
}

export async function generateWeeklySummary(userId: string): Promise<{ success: boolean; summary?: WeeklySummary; insightId?: string }> {
  const supabase = await createClient()
  const now = new Date()
  
  // Date ranges
  const startCurrent = startOfWeek(now, { weekStartsOn: 1 }).toISOString() // Monday
  const endCurrent = endOfWeek(now, { weekStartsOn: 1 }).toISOString()
  const startLast = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString()

  // 1. Fetch Transactions
  const { data: txs } = await supabase.from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startLast)
    .lte('date', endCurrent)
  
  if (!txs) return { success: false }

  const currentTxs = txs.filter(t => t.date >= startCurrent)
  const lastTxs = txs.filter(t => t.date >= startLast && t.date < startCurrent)

  // Calculate Totals (Outflows only)
  const totalSpent = currentTxs.reduce((sum, t) => sum + (Number(t.amount) < 0 ? Math.abs(Number(t.amount)) : 0), 0)
  const lastWeekSpent = lastTxs.reduce((sum, t) => sum + (Number(t.amount) < 0 ? Math.abs(Number(t.amount)) : 0), 0)
  
  const percentChange = lastWeekSpent > 0 
    ? Math.round(((totalSpent - lastWeekSpent) / lastWeekSpent) * 100) 
    : 0

  // Top Categories
  const categories: Record<string, number> = {}
  currentTxs.forEach(t => {
    if (Number(t.amount) < 0) {
      const cat = t.category || 'Uncategorized'
      categories[cat] = (categories[cat] || 0) + Math.abs(Number(t.amount))
    }
  })
  const topCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({ category, amount }))

  // Largest Transaction
  const largestTx = currentTxs
    .filter(t => Number(t.amount) < 0)
    .sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)))[0]
  
  const largestTransaction = largestTx 
    ? { description: largestTx.description || 'Unknown', amount: Math.abs(Number(largestTx.amount)) }
    : null

  // 2. Upcoming Bills (Next 7 days)
  const nextWeek = addDays(now, 7).toISOString()
  const { data: bills } = await supabase.from('recurring_patterns')
    .select('*')
    .eq('user_id', userId)
    .gte('next_date', now.toISOString())
    .lte('next_date', nextWeek)
  
  const upcomingBills = (bills || []).map(b => ({
    name: b.merchant_name,
    amount: Number(b.amount),
    date: b.next_date
  }))

  // 3. Goal Progress
  const { data: goals } = await supabase.from('goals')
    .select('*')
    .eq('user_id', userId)
  
  const goalProgress = (goals || []).map(g => ({
    name: g.name,
    progress: Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)
  }))

  // 4. Highlights & Actions
  const highlights: string[] = []
  if (percentChange < -10) highlights.push(`🎉 You spent ${Math.abs(percentChange)}% less than last week!`)
  else if (percentChange > 10) highlights.push(`⚠️ Spending is up ${percentChange}% vs last week.`)
  
  if (largestTransaction && largestTransaction.amount > 100) {
    highlights.push(`Largest expense: ${largestTransaction.description} (${formatCurrency(largestTransaction.amount)})`)
  }

  const actions: string[] = []
  if (upcomingBills.length > 0) {
    const totalBills = upcomingBills.reduce((sum, b) => sum + b.amount, 0)
    actions.push(`Prepare ${formatCurrency(totalBills)} for ${upcomingBills.length} upcoming bills.`)
  }
  if (goalProgress.some(g => g.progress >= 90 && g.progress < 100)) {
    actions.push(`You're close to hitting a goal! Check your progress.`)
  }

  const summary: WeeklySummary = {
    totalSpent,
    lastWeekSpent,
    percentChange,
    topCategories,
    largestTransaction,
    upcomingBills,
    goalProgress,
    highlights,
    actions
  }

  // 5. Save Insight
  const title = `Weekly Summary: ${format(now, 'MMM d')}`
  const message = `You spent ${formatCurrency(totalSpent)} this week (${percentChange > 0 ? '+' : ''}${percentChange}%). \n\n${highlights.join('\n')}`
  
  const { data: ins, error } = await supabase.from('insights').insert([{
    id: crypto.randomUUID(),
    user_id: userId,
    type: 'info',
    title,
    message,
    action_link: '/analytics',
    score_impact: 0,
    // We could store the full JSON summary in a metadata field if the schema supported it, 
    // but for now we just use the message.
  }]).select().single()

  if (error) return { success: false }

  // Send Push
  try {
    const { shouldSendNotification } = await import('../services/notification-guard')
    const allowed = await shouldSendNotification(userId, 'weekly_summary') 
    // Guard types: 'urgent' | 'opportunities' | 'updates' (implied)
    // We'll assume 'opportunities' or just skip guard for summary if it's a specific setting.
    // For now, let's use 'opportunities' as a proxy for general helpful info.
    if (allowed) {
      const { sendNotification } = await import('../actions/notifications')
      await sendNotification(userId, title, `You spent ${formatCurrency(totalSpent)} this week. Tap to view details.`, '/analytics')
    }
  } catch (e) {
    console.warn('Push failed', e)
  }

  return { success: true, summary, insightId: ins.id }
}
