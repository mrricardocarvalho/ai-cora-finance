"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import getSafeToSpend, { SafeToSpendResult } from './safe-spend'
import { runProactiveAnalysis, type ProactiveInsight } from './proactive-analysis'
import { detectAnomalies, type Anomaly } from './anomaly'
import { calculateCashFlowForecast, generateFloorCrossingInsight } from './forecast'
import { analyzeDiversification, generateDiversificationInsight } from './portfolio-analysis'
import { detectPatterns } from './pattern-recognition'
import { detectOpportunities } from './opportunity-engine'
import { detectTaxHarvesting } from './tax'
import { detectDebtInsights } from './debt-insights'
import { subDays, startOfDay } from 'date-fns'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { formatCurrency } from '../utils'
import { getServerLocale } from '../i18n/server'

export type CreatedInsight = { type: string; title: string }

/**
 * Generate insights using AI-powered proactive analysis
 * Falls back to rule-based insights if AI fails
 */
export async function generateInsights(userId: string) {
  if(!userId) return { success: false, error: 'userId required', proactiveAnalysis: null }
  const supabase = await createServerSupabase()
  const locale = await getServerLocale()
  
  // Helper to check idempotency: same title & type created today
  async function existsToday(type: string, title: string){
    const today = startOfDay(new Date()).toISOString()
    const q = await supabase.from('insights').select('id').eq('user_id', userId).eq('type', type).eq('title', title).gte('created_at', today).limit(1)
    if(q.error) return false
    return (q.data && q.data.length > 0)
  }
  
  async function sendPushIfAllowed(type: 'urgent' | 'opportunities', title: string, message: string, link: string) {
    try {
      const { shouldSendNotification } = await import('../services/notification-guard')
      const allowed = await shouldSendNotification(userId, type)
      if (allowed) {
        const { sendNotification } = await import('../actions/notifications')
        await sendNotification(userId, title, message, link)
      }
    } catch(e) {
      console.warn('send push failed', e)
    }
  }

  const created: CreatedInsight[] = []
  
  // Try AI-powered analysis first (locale-aware)
  let proactiveAnalysis: { greeting: string; insights: ProactiveInsight[] } | null = null
  
  try {
    const analysis = await runProactiveAnalysis(userId, locale)
    
    if (analysis.success && analysis.insights.length > 0) {
      // Store for returning to caller
      proactiveAnalysis = {
        greeting: analysis.greeting,
        insights: analysis.insights
      }
      
      // Convert ProactiveInsight to database insights
      for (const insight of analysis.insights) {
        const type = mapInsightType(insight.type)
        const title = insight.title
        
        if (!(await existsToday(type, title))) {
          const scoreImpact = insight.type === 'celebration' ? 5 : 
                             insight.type === 'warning' ? -5 : 0
          
          const ins = await supabase.from('insights').insert([{
            id: crypto.randomUUID(),
            user_id: userId,
            type,
            title,
            message: insight.message + (insight.actionable ? `\n\n💡 ${insight.actionable}` : ''),
            action_link: '/chat', // Lead to chat for more details
            score_impact: scoreImpact
          }])
          
          if (!ins.error) {
            // Send push for high priority insights
            if (insight.priority >= 7) {
              await sendPushIfAllowed(
                type === 'urgent' ? 'urgent' : 'opportunities',
                title,
                insight.message.slice(0, 100),
                '/chat'
              )
            }
            created.push({ type, title })
          }
        }
      }
      
      await revalidatePath('/')
      return { success: true, created, proactiveAnalysis }
    }
  } catch (e) {
    console.warn('AI analysis failed, falling back to rules:', e)
  }
  
  // Fallback to basic rule-based insights
  const fallbackResult = await generateRuleBasedInsights(userId)
  return { ...fallbackResult, proactiveAnalysis }
}

// Map ProactiveInsight types to database insight_type enum
function mapInsightType(type: ProactiveInsight['type']): 'urgent' | 'warning' | 'opportunity' | 'info' {
  switch (type) {
    case 'warning': return 'urgent'
    case 'opportunity': return 'opportunity'
    case 'celebration': return 'info'
    case 'observation': 
    default: return 'info'
  }
}

// Original rule-based insights as fallback
async function generateRuleBasedInsights(userId: string) {
  const supabase = await createServerSupabase()
  
  // Get Safe to Spend (defensive)
  let safe: SafeToSpendResult = { value: 0, status: 'Safe', details: { liquidAssets: 0, comfortFloor: 0, pendingBills: 0, asOf: new Date().toISOString() } }
  try { const s = await getSafeToSpend(userId); if (s && 'value' in s) safe = s } catch(e){ console.warn('generateInsights: getSafeToSpend failed:', e) }
  
  async function existsToday(type: string, title: string){
    const today = startOfDay(new Date()).toISOString()
    const q = await supabase.from('insights').select('id').eq('user_id', userId).eq('type', type).eq('title', title).gte('created_at', today).limit(1)
    if(q.error) return false
    return (q.data && q.data.length > 0)
  }

  const created: CreatedInsight[] = []
  
  // Rule 1 & 2: Comfort floor related
  const comfortFloor = safe.details.comfortFloor || 0
  const value = safe.value
  if (value < 0) {
    const title = 'Comfort Floor Breached'
    const message = 'You have breached your Comfort Floor. Consider transferring funds or reducing spending.'
    if(!(await existsToday('urgent', title))){
      const ins = await supabase.from('insights').insert([{ id: crypto.randomUUID(), user_id: userId, type: 'urgent', title, message, action_link: '/onboarding', score_impact: -10 }])
      if(!ins.error){
        try{ const { shouldSendNotification } = await import('../services/notification-guard'); const allowed = await shouldSendNotification(userId, 'urgent'); if(allowed){ const { sendNotification } = await import('../actions/notifications'); await sendNotification(userId, title, message, '/onboarding') } }catch(e){ console.warn('send push failed', e) }
      }
      created.push({ type: 'urgent', title })
    }
  } else if (comfortFloor > 0 && value > 0 && value < (comfortFloor * 0.1)){
    const title = 'Approaching Comfort Floor'
    const message = 'Your Safe-to-Spend is low compared to your comfort floor. Reduce discretionary spending.'
    if(!(await existsToday('warning', title))){
      const ins = await supabase.from('insights').insert([{ id: crypto.randomUUID(), user_id: userId, type: 'warning', title, message, action_link: '/planning', score_impact: -5 }])
      if(!ins.error){
        try{ const { shouldSendNotification } = await import('../services/notification-guard'); const allowed = await shouldSendNotification(userId, 'opportunities'); if(allowed){ const { sendNotification } = await import('../actions/notifications'); await sendNotification(userId, title, message, '/planning') } }catch(e){ console.warn('send push failed', e) }
      }
      created.push({ type: 'warning', title })
    }
  }

  // Rule 3: New recurring patterns added in the last 3 days
  const threeDaysAgo = subDays(new Date(), 3).toISOString()
  type RecurringPatternRow = { id: string; merchant_name: string; amount: number | string; updated_at?: string }
  const rec = await supabase.from('recurring_patterns').select('*').eq('user_id', userId).gte('created_at', threeDaysAgo).order('created_at', { ascending: false })
  if(!rec.error && rec.data && rec.data.length > 0){
    for(const p of (rec.data as RecurringPatternRow[])){
      const title = `New subscription detected: ${p.merchant_name}`
      const message = `A new subscription was detected: ${p.merchant_name} at ${formatCurrency(Number(p.amount || 0))}.`
      if(!(await existsToday('info', title))){
        const ins = await supabase.from('insights').insert([{ id: crypto.randomUUID(), user_id: userId, type: 'info', title, message, action_link: '/data', score_impact: 0 }])
        if(!ins.error){
          try{ const { shouldSendNotification } = await import('../services/notification-guard'); const allowed = await shouldSendNotification(userId, 'opportunities'); if(allowed){ const { sendNotification } = await import('../actions/notifications'); await sendNotification(userId, title, message, '/data') } }catch(e){ console.warn('send push failed', e) }
        }
        created.push({ type: 'info', title })
      }
    }
  }

  // Epic 7 Rule 4: Spending Anomaly Detection (Story 7.1)
  try {
    const anomalyResult = await detectAnomalies(userId)
    if (anomalyResult.success && anomalyResult.anomalies.length > 0) {
      for (const anomaly of anomalyResult.anomalies.slice(0, 3)) { // Limit to 3 anomalies
        const title = anomaly.type === 'merchant' 
          ? `Unusual charge: ${anomaly.displayName}`
          : `High spending: ${anomaly.displayName}`
        const message = anomaly.type === 'merchant'
          ? `${formatCurrency(anomaly.currentAmount)} vs usual ${formatCurrency(anomaly.average)} (+${anomaly.percentDiff}%). ${anomaly.historicalContext}`
          : anomaly.historicalContext
        
        if (!(await existsToday('warning', title))) {
          const ins = await supabase.from('insights').insert([{
            id: crypto.randomUUID(),
            user_id: userId,
            type: 'warning',
            title,
            message,
            action_link: '/data',
            score_impact: -3
          }])
          if (!ins.error) {
            created.push({ type: 'warning', title })
          }
        }
      }
    }
  } catch (e) {
    console.warn('Anomaly detection failed:', e)
  }

  // Epic 7 Rule 5: Cash Flow Forecast Floor Crossing (Story 7.2)
  try {
    const forecast = await calculateCashFlowForecast(userId, 30)
    const floorInsight = await generateFloorCrossingInsight(userId, forecast)
    if (floorInsight) {
      const title = floorInsight.title
      if (!(await existsToday('warning', title))) {
        const ins = await supabase.from('insights').insert([{
          id: crypto.randomUUID(),
          user_id: userId,
          type: 'warning',
          title,
          message: floorInsight.message,
          action_link: '/',
          score_impact: -5
        }])
        if (!ins.error) {
          try {
            const { shouldSendNotification } = await import('../services/notification-guard')
            const allowed = await shouldSendNotification(userId, 'urgent')
            if (allowed) {
              const { sendNotification } = await import('../actions/notifications')
              await sendNotification(userId, title, floorInsight.message.slice(0, 100), '/')
            }
          } catch (e) {
            console.warn('send push failed', e)
          }
          created.push({ type: 'warning', title })
        }
      }
    }
  } catch (e) {
    console.warn('Forecast insight failed:', e)
  }

  // Epic 7 Rule 6: Portfolio Diversification (Story 7.4)
  try {
    const diversification = await analyzeDiversification(userId)
    const divInsight = await generateDiversificationInsight(diversification)
    if (divInsight) {
      const title = divInsight.title
      if (!(await existsToday('opportunity', title))) {
        const ins = await supabase.from('insights').insert([{
          id: crypto.randomUUID(),
          user_id: userId,
          type: 'opportunity',
          title,
          message: divInsight.message,
          action_link: '/portfolio',
          score_impact: 0
        }])
        if (!ins.error) {
          created.push({ type: 'opportunity', title })
        }
      }
    }
  } catch (e) {
    console.warn('Diversification insight failed:', e)
  }

  // Epic 13: Predictive Pattern Recognition (Story 13.1)
  try {
    const patterns = await detectPatterns(userId)
    for (const pattern of patterns) {
      // Map pattern types to DB types
      let dbType: 'info' | 'warning' | 'opportunity' | 'urgent' = 'info'
      let scoreImpact = 0
      
      switch (pattern.type) {
        case 'seasonal':
          dbType = 'info'
          scoreImpact = 0
          break
        case 'trend':
          dbType = 'warning'
          scoreImpact = -3
          break
        case 'creep':
          dbType = 'warning'
          scoreImpact = -5
          break
        case 'cashflow':
          dbType = 'urgent'
          scoreImpact = -10
          break
      }

      if (!(await existsToday(dbType, pattern.title))) {
        const ins = await supabase.from('insights').insert([{
          id: crypto.randomUUID(),
          user_id: userId,
          type: dbType,
          title: pattern.title,
          message: pattern.message + (pattern.actionable ? `\n\n💡 ${pattern.actionable}` : ''),
          action_link: '/data', // Default link
          score_impact: scoreImpact
        }])
        
        if (!ins.error) {
          // Send push for high confidence/urgent items
          if (pattern.confidence === 'high' || dbType === 'urgent') {
             try {
              const { shouldSendNotification } = await import('../services/notification-guard')
              const allowed = await shouldSendNotification(userId, dbType === 'urgent' ? 'urgent' : 'opportunities')
              if (allowed) {
                const { sendNotification } = await import('../actions/notifications')
                await sendNotification(userId, pattern.title, pattern.message.slice(0, 100), '/data')
              }
            } catch (e) {
              console.warn('send push failed', e)
            }
          }
          created.push({ type: dbType, title: pattern.title })
        }
      }
    }
  } catch (e) {
    console.warn('Pattern recognition failed:', e)
  }

  // Epic 13: Opportunity Detection (Story 13.2)
  try {
    const opportunities = await detectOpportunities(userId)
    for (const opp of opportunities) {
      // Map to DB types - mostly 'opportunity' but high priority debt could be 'urgent' or 'warning' if we wanted
      // For now, stick to 'opportunity' as per story intent
      const dbType = 'opportunity'
      
      if (!(await existsToday(dbType, opp.title))) {
        const ins = await supabase.from('insights').insert([{
          id: crypto.randomUUID(),
          user_id: userId,
          type: dbType,
          title: opp.title,
          message: opp.message + (opp.actionable ? `\n\n💡 ${opp.actionable}` : ''),
          action_link: '/planning', 
          score_impact: opp.score_impact
        }])
        
        if (!ins.error) {
          // Send push for high priority opportunities
          if (opp.priority === 'high') {
             try {
              const { shouldSendNotification } = await import('../services/notification-guard')
              const allowed = await shouldSendNotification(userId, 'opportunities')
              if (allowed) {
                const { sendNotification } = await import('../actions/notifications')
                await sendNotification(userId, opp.title, opp.message.slice(0, 100), '/planning')
              }
            } catch (e) {
              console.warn('send push failed', e)
            }
          }
          created.push({ type: dbType, title: opp.title })
        }
      }
    }
  } catch (e) {
    console.warn('Opportunity detection failed:', e)
  }

  // Epic 10: Debt Insights (Story 10.3)
  try {
    const debtInsights = await detectDebtInsights(userId)
    for (const insight of debtInsights) {
      if (!(await existsToday(insight.type, insight.title))) {
        const ins = await supabase.from('insights').insert([{
          id: crypto.randomUUID(),
          user_id: userId,
          type: insight.type,
          title: insight.title,
          message: insight.message + (insight.actionable ? `\n\n💡 ${insight.actionable}` : ''),
          action_link: '/planning/debt',
          score_impact: insight.score_impact
        }])
        
        if (!ins.error) {
          created.push({ type: insight.type, title: insight.title })
        }
      }
    }
  } catch (e) {
    console.warn('Debt insights failed:', e)
  }

  // Epic 13: Tax Harvesting (Story 13.2 AC#6)
  try {
    // detectTaxHarvesting handles its own insertion and checks
    await detectTaxHarvesting(userId)
  } catch (e) {
    console.warn('Tax harvesting detection failed:', e)
  }

  await revalidatePath('/')
  return { success: true, created }
}

export type InsightRow = { 
  id: string; 
  type: string; 
  title: string; 
  message: string; 
  action_link?: string; 
  score_impact?: number; 
  status?: string; 
  created_at?: string;
  why?: string;
  learn_more_concept?: string;
}
export async function getInsights(userId: string, view: 'personal' | 'household' = 'personal') {
  if(!userId) return { success: false, error: 'userId required' }
  const supabase = await createServerSupabase()
  // Use a CASE expression to order by priority
  let query = supabase.from('insights')
    .select('*')
    .neq('status', 'dismissed')
    .order('created_at', { ascending: false })
    .limit(50)
    
  if (view === 'personal') query = query.eq('user_id', userId)
  
  const res = await query
  if(res.error) return { success: false, error: res.error.message }
  // sort in memory by priority mapping: urgent=1, warning=2, opportunity=3, info=4
  const mapping: Record<string, number> = { urgent: 1, warning: 2, opportunity: 3, info: 4 }
  type InsightRow = { id: string; type: string; title: string; message: string; created_at: string }
  const rows = (res.data || []).sort((a: InsightRow, b: InsightRow) => (mapping[a.type] || 99) - (mapping[b.type] || 99) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return { success: true, data: rows }
}

// No default export (server 'use server' files must only export async functions)
