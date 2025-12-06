"use server"

import { createClient as createServerSupabase } from '../supabase/server'
import { callOpenRouter } from '../ai/openrouter'
import { formatCurrency } from '../utils'
import { subDays, startOfMonth, endOfMonth, format, differenceInMinutes } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import type { Locale } from '../i18n/translations'

// In-memory cache for proactive analysis (per user+locale, expires after 30 minutes)
const analysisCache = new Map<string, { result: AnalysisResult; timestamp: Date }>()
const CACHE_DURATION_MINUTES = 30

export interface ProactiveInsight {
  type: 'observation' | 'warning' | 'opportunity' | 'celebration'
  title: string
  message: string
  actionable?: string
  priority: number // 1-10, higher = more important
}

export interface AnalysisResult {
  success: boolean
  insights: ProactiveInsight[]
  greeting: string
  lastAnalyzed: string
  error?: string
  cached?: boolean
}

interface TransactionRow {
  id: string
  date: string
  description: string
  amount: number
  category: string
  merchant_slug?: string
}

interface RecurringRow {
  merchant_name: string
  amount: number
  frequency: string
  last_seen: string
}

interface MonthlySummaryRow {
  month: string
  total_in: number
  total_out: number
  savings_rate: number
}

/**
 * Run proactive analysis on user's financial data
 * This is designed to be called when user opens the chat or dashboard
 * and should return personalized, actionable insights.
 * Results are cached for 30 minutes to reduce API calls.
 */
export async function runProactiveAnalysis(userId: string, locale: Locale = 'pt-PT'): Promise<AnalysisResult> {
  if (!userId) {
    return { success: false, insights: [], greeting: '', lastAnalyzed: '', error: 'userId required' }
  }

  const cacheKey = `${userId}:${locale}`
  const dateFnsLocale = locale === 'en-US' ? enUS : ptBR
  const isEnglish = locale === 'en-US'

  // Check cache first
  const cached = analysisCache.get(cacheKey)
  if (cached) {
    const minutesAgo = differenceInMinutes(new Date(), cached.timestamp)
    if (minutesAgo < CACHE_DURATION_MINUTES) {
      console.log(`[ProactiveAnalysis] Using cached result (${minutesAgo}min old)`)
      return { ...cached.result, cached: true }
    }
    // Cache expired, remove it
    analysisCache.delete(cacheKey)
  }

  const supabase = await createServerSupabase()
  const now = new Date()

  try {
    // Gather comprehensive financial data
    const [
      accountsRes,
      profileRes,
      recentTxRes,
      recurringRes,
      summariesRes,
      prevInsightsRes
    ] = await Promise.all([
      // Accounts
      supabase.from('accounts').select('name, type, balance').eq('user_id', userId),
      // Profile with preferences
      supabase.from('profiles').select('comfort_floor, worries, goals, risk_tolerance').eq('id', userId).single(),
      // Recent transactions (last 60 days for trend analysis)
      supabase.from('transactions')
        .select('id, date, description, amount, category, merchant_slug')
        .eq('user_id', userId)
        .gte('date', subDays(now, 60).toISOString())
        .order('date', { ascending: false })
        .limit(200),
      // Active recurring patterns
      supabase.from('recurring_patterns')
        .select('merchant_name, amount, frequency, last_seen')
        .eq('user_id', userId)
        .eq('is_active', true),
      // Monthly summaries (last 6 months)
      supabase.from('monthly_summaries')
        .select('month, total_in, total_out, savings_rate')
        .eq('user_id', userId)
        .order('month', { ascending: false })
        .limit(6),
      // Recent insights (to avoid repetition)
      supabase.from('insights')
        .select('title, created_at')
        .eq('user_id', userId)
        .gte('created_at', subDays(now, 7).toISOString())
    ])

    // Process data
    const accounts = (accountsRes.data || []).map(a => ({
      name: a.name,
      type: a.type,
      balance: Number(a.balance || 0)
    }))
    
    const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0)
    const profile = profileRes.data as { comfort_floor?: number; worries?: string; goals?: string; risk_tolerance?: string } | null
    const comfortFloor = Number(profile?.comfort_floor || 0)
    
    const transactions = (recentTxRes.data || []) as TransactionRow[]
    const recurring = (recurringRes.data || []) as RecurringRow[]
    const summaries = (summariesRes.data || []) as MonthlySummaryRow[]
    const recentInsightTitles = (prevInsightsRes.data || []).map(i => i.title)

    // Separate this month vs last month transactions
    const thisMonthStart = startOfMonth(now)
    const lastMonthStart = startOfMonth(subDays(thisMonthStart, 1))
    const lastMonthEnd = endOfMonth(subDays(thisMonthStart, 1))

    const thisMonthTx = transactions.filter(t => new Date(t.date) >= thisMonthStart)
    const lastMonthTx = transactions.filter(t => {
      const d = new Date(t.date)
      return d >= lastMonthStart && d <= lastMonthEnd
    })

    // Calculate spending by category for this month
    const spendingByCategory: Record<string, number> = {}
    thisMonthTx.forEach(t => {
      if (t.amount < 0) {
        const cat = t.category || 'Outros'
        spendingByCategory[cat] = (spendingByCategory[cat] || 0) + Math.abs(t.amount)
      }
    })

    // Calculate totals
    const thisMonthSpending = thisMonthTx
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const lastMonthSpending = lastMonthTx
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const thisMonthIncome = thisMonthTx
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    // Build context for AI - using locale-aware date format
    const dateFormat = isEnglish ? "MMMM d, yyyy" : "d 'de' MMMM 'de' yyyy"
    const context = {
      currentDate: format(now, dateFormat, { locale: dateFnsLocale }),
      dayOfMonth: now.getDate(),
      accounts: accounts.map(a => `${a.name} (${a.type}): ${formatCurrency(a.balance)}`).join('\n'),
      netWorth: formatCurrency(netWorth),
      comfortFloor: formatCurrency(comfortFloor),
      safeToSpend: formatCurrency(Math.max(0, netWorth - comfortFloor - recurring.reduce((s, r) => s + Math.abs(r.amount), 0))),
      thisMonthSpending: formatCurrency(thisMonthSpending),
      lastMonthSpending: formatCurrency(lastMonthSpending),
      spendingChange: lastMonthSpending > 0 
        ? `${((thisMonthSpending - lastMonthSpending) / lastMonthSpending * 100).toFixed(1)}%`
        : 'N/A',
      thisMonthIncome: formatCurrency(thisMonthIncome),
      topCategories: Object.entries(spendingByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, amt]) => `${cat}: ${formatCurrency(amt)}`)
        .join('\n'),
      recurringBills: recurring.map(r => 
        `${r.merchant_name}: ${formatCurrency(Math.abs(r.amount))} (${r.frequency})`
      ).join('\n') || (isEnglish ? 'No subscriptions detected' : 'Nenhuma subscrição detectada'),
      savingsRateTrend: summaries.length >= 2
        ? summaries.slice(0, 3).map(s => `${format(new Date(s.month), 'MMM', { locale: dateFnsLocale })}: ${s.savings_rate.toFixed(1)}%`).join(', ')
        : (isEnglish ? 'Insufficient data' : 'Dados insuficientes'),
      userWorries: profile?.worries || (isEnglish ? 'Not specified' : 'Não especificado'),
      userGoals: profile?.goals || (isEnglish ? 'Not specified' : 'Não especificado'),
      recentLargeTransactions: transactions
        .filter(t => Math.abs(t.amount) > 100)
        .slice(0, 5)
        .map(t => `${format(new Date(t.date), 'dd/MM')}: ${t.description} - ${formatCurrency(t.amount)}`)
        .join('\n') || (isEnglish ? 'No recent large transactions' : 'Nenhuma transação grande recente'),
      alreadyMentionedInsights: recentInsightTitles.join(', ') || (isEnglish ? 'None' : 'Nenhum')
    }

    // Ask AI to generate proactive insights - language-aware prompt
    const languageInstruction = isEnglish 
      ? 'Generate all text in English.'
      : 'Generate all text in Portuguese.'
    
    const systemPrompt = `You are Cora, a proactive personal finance assistant. Analyze the user's financial data and generate 2-4 personalized, actionable insights. ${languageInstruction}

## Your Personality
- Warm, supportive, like a financially savvy friend
- Direct but encouraging
- Focus on what matters most RIGHT NOW
- Celebrate wins, don't just warn about problems

## User's Financial Snapshot
**Date:** ${context.currentDate} (day ${context.dayOfMonth} of month)

**Accounts:**
${context.accounts}

**Key Numbers:**
- Net Worth: ${context.netWorth}
- Comfort Floor: ${context.comfortFloor}
- Safe to Spend: ${context.safeToSpend}

**This Month:**
- Spending: ${context.thisMonthSpending}
- Income: ${context.thisMonthIncome}
- vs Last Month: ${context.spendingChange}

**Top Spending Categories:**
${context.topCategories}

**Recurring Bills:**
${context.recurringBills}

**Savings Rate Trend:** ${context.savingsRateTrend}

**Recent Large Transactions:**
${context.recentLargeTransactions}

**User's Concerns:** ${context.userWorries}
**User's Goals:** ${context.userGoals}

**Insights Already Mentioned This Week (AVOID REPEATING):**
${context.alreadyMentionedInsights}

## Task
Generate a JSON response with:
1. A personalized greeting (1 sentence, warm and specific to their situation)
2. 2-4 insights, each with:
   - type: "observation" | "warning" | "opportunity" | "celebration"
   - title: Short title (max 8 words, Portuguese)
   - message: Detailed insight (2-3 sentences, Portuguese)
   - actionable: Optional specific action they can take (Portuguese)
   - priority: 1-10 (10 = most urgent/important)

## Guidelines
- If it's early in the month, focus on planning
- If late in the month, focus on review and optimization
- Look for unusual spending patterns vs previous month
- Check if approaching comfort floor
- Identify unused subscriptions or saving opportunities
- Celebrate good habits (high savings rate, staying under budget)
- Reference their goals/worries when relevant
- Be specific with numbers and categories
- DON'T repeat insights from the "Already Mentioned" list

Respond ONLY with valid JSON, no markdown:
{
  "greeting": "string",
  "insights": [
    {
      "type": "observation|warning|opportunity|celebration",
      "title": "string",
      "message": "string",
      "actionable": "string (optional)",
      "priority": number
    }
  ]
}`

    const aiResponse = await callOpenRouter(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Analyze my finances and give me insights.' }],
      undefined,
      1500,
      0.7
    )

    // Parse AI response
    let parsed: { greeting: string; insights: ProactiveInsight[] }
    try {
      // Try to extract JSON from the response (handle if wrapped in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      parsed = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('[ProactiveAnalysis] Failed to parse AI response:', aiResponse?.substring(0, 500))
      // Fallback to basic insights based on data we have
      parsed = generateFallbackInsights({
        netWorth: context.netWorth,
        thisMonthSpending: context.thisMonthSpending,
        spendingChange: context.spendingChange,
        topCategories: context.topCategories,
        savingsRateTrend: context.savingsRateTrend,
        recurringBills: context.recurringBills
      }, netWorth, thisMonthSpending, lastMonthSpending)
    }

    // Sort insights by priority
    const sortedInsights = parsed.insights.sort((a, b) => b.priority - a.priority)

    const result: AnalysisResult = {
      success: true,
      insights: sortedInsights,
      greeting: parsed.greeting,
      lastAnalyzed: now.toISOString()
    }

    // Cache the result with locale key
    analysisCache.set(cacheKey, { result, timestamp: now })

    return result

  } catch (error) {
    // Check if it's a rate limit error - just use fallback silently
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
      console.log('[ProactiveAnalysis] Rate limited, using fallback insights')
    } else {
      console.error('[ProactiveAnalysis] Error:', error)
    }
    
    // Return basic insights as fallback
    const fallback = generateFallbackInsights({
      netWorth: '€0,00',
      thisMonthSpending: '€0,00',
      spendingChange: 'N/A',
      topCategories: '',
      savingsRateTrend: '',
      recurringBills: ''
    }, 0, 0, 0, isEnglish)
    
    return {
      success: true, // Return true so UI shows something
      insights: fallback.insights,
      greeting: fallback.greeting,
      lastAnalyzed: now.toISOString()
    }
  }
}

/**
 * Clear the analysis cache for a user
 * Call this when significant financial data changes
 */
export async function clearAnalysisCache(userId: string): Promise<void> {
  // Clear both locale caches
  analysisCache.delete(`${userId}:pt-PT`)
  analysisCache.delete(`${userId}:en-US`)
}

/**
 * Get cached analysis or run new one if stale
 * Analysis is cached for 30 minutes per user
 */
export async function getOrRunAnalysis(userId: string, locale: Locale = 'pt-PT'): Promise<AnalysisResult> {
  return runProactiveAnalysis(userId, locale)
}

// Generate fallback insights when AI fails
interface FallbackContext {
  netWorth: string
  thisMonthSpending: string
  spendingChange: string
  topCategories: string
  savingsRateTrend: string
  recurringBills: string
}

function generateFallbackInsights(
  context: FallbackContext, 
  netWorth: number, 
  thisMonthSpending: number, 
  lastMonthSpending: number,
  isEnglish: boolean = false
): { greeting: string; insights: ProactiveInsight[] } {
  const insights: ProactiveInsight[] = []
  
  // Greeting
  const greeting = isEnglish 
    ? `Hi! You have ${context.netWorth} available.`
    : `Olá! Tens ${context.netWorth} disponível.`
  
  // Insight 1: Monthly spending summary
  insights.push({
    type: 'observation',
    title: isEnglish ? 'This month\'s spending' : 'Gastos deste mês',
    message: isEnglish 
      ? `You've spent ${context.thisMonthSpending} so far this month.`
      : `Este mês gastaste ${context.thisMonthSpending} até agora.`,
    priority: 5
  })
  
  // Insight 2: Spending change comparison
  if (lastMonthSpending > 0) {
    const change = ((thisMonthSpending - lastMonthSpending) / lastMonthSpending * 100)
    if (change > 10) {
      insights.push({
        type: 'warning',
        title: isEnglish ? 'Spending rising' : 'Gastos a subir',
        message: isEnglish 
          ? `You're spending ${Math.abs(change).toFixed(0)}% more than last month.`
          : `Estás a gastar ${Math.abs(change).toFixed(0)}% mais que no mês passado.`,
        actionable: isEnglish ? 'Review your top spending categories.' : 'Revê as categorias onde mais gastas.',
        priority: 7
      })
    } else if (change < -10) {
      insights.push({
        type: 'celebration',
        title: isEnglish ? 'Great savings!' : 'Boa poupança!',
        message: isEnglish 
          ? `You're spending ${Math.abs(change).toFixed(0)}% less than last month. Keep it up!`
          : `Estás a gastar ${Math.abs(change).toFixed(0)}% menos que no mês passado. Continua assim!`,
        priority: 6
      })
    }
  }
  
  // Insight 3: Top category
  if (context.topCategories && context.topCategories.length > 0) {
    const topCategory = context.topCategories.split('\n')[0]
    if (topCategory) {
      insights.push({
        type: 'observation',
        title: isEnglish ? 'Top category' : 'Categoria principal',
        message: isEnglish 
          ? `Your biggest expense is: ${topCategory}`
          : `A tua maior despesa é: ${topCategory}`,
        priority: 4
      })
    }
  }
  
  // Insight 4: Net worth status
  if (netWorth > 0) {
    insights.push({
      type: 'opportunity',
      title: isEnglish ? 'Your net worth' : 'O teu património',
      message: isEnglish 
        ? `You have ${context.netWorth} in total. Consider diversifying if you haven't already.`
        : `Tens ${context.netWorth} no total. Considera diversificar se ainda não o fizeste.`,
      actionable: isEnglish ? 'Explore the Portfolio section to see options.' : 'Explora a secção de Portfólio para ver opções.',
      priority: 3
    })
  }
  
  return { greeting, insights }
}
