"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { getTaxEventsNeedingReminders, type TaxEventInstance } from '../tax/calendar'
import { format, parseISO } from 'date-fns'

// Tax Insight type matching the insights table structure
export interface TaxInsight {
  type: 'urgent' | 'warning' | 'info'
  title: string
  message: string
  actionUrl?: string
}

// AC #1: Reminder schedule thresholds
const REMINDER_THRESHOLDS = {
  URGENT: 3,      // 3 days or less
  WARNING: 14,    // 2 weeks
  INFO: 30        // 30 days
}

// AC #2: Generate insight content for tax deadline
function generateTaxInsightContent(
  event: TaxEventInstance,
  locale: 'pt-PT' | 'en-US'
): { type: 'urgent' | 'warning' | 'info'; title: string; message: string } {
  const isPT = locale === 'pt-PT'
  const eventName = isPT ? event.event.event_name_pt : event.event.event_name
  const description = isPT ? event.event.description_pt : event.event.description
  const tips = isPT ? event.event.tips_pt : event.event.tips
  const daysUntil = event.days_until
  const dueDate = format(parseISO(event.due_date), 'MMMM d, yyyy')
  
  // Day of deadline
  if (daysUntil === 0) {
    return {
      type: 'urgent',
      title: isPT 
        ? `🚨 Hoje: ${eventName}` 
        : `🚨 Today: ${eventName}`,
      message: isPT
        ? `Hoje é o prazo! ${description}${tips ? ` 💡 ${tips}` : ''}`
        : `Today is the deadline! ${description}${tips ? ` 💡 ${tips}` : ''}`
    }
  }
  
  // 1-3 days
  if (daysUntil <= REMINDER_THRESHOLDS.URGENT) {
    return {
      type: 'urgent',
      title: isPT 
        ? `⚠️ ${daysUntil} dias: ${eventName}` 
        : `⚠️ ${daysUntil} days: ${eventName}`,
      message: isPT
        ? `Faltam ${daysUntil} dias para ${eventName.toLowerCase()}! ${tips || ''}`
        : `Only ${daysUntil} days until ${eventName.toLowerCase()}! ${tips || ''}`
    }
  }
  
  // 4-14 days (warning)
  if (daysUntil <= REMINDER_THRESHOLDS.WARNING) {
    const weeks = Math.ceil(daysUntil / 7)
    return {
      type: 'warning',
      title: isPT 
        ? `📅 ${weeks === 1 ? 'Esta semana' : `${weeks} semanas`}: ${eventName}`
        : `📅 ${weeks === 1 ? 'This week' : `${weeks} weeks`}: ${eventName}`,
      message: isPT
        ? `${eventName} é a ${dueDate}. ${description}`
        : `${eventName} is on ${dueDate}. ${description}`
    }
  }
  
  // 15-30 days (info)
  return {
    type: 'info',
    title: isPT 
      ? `📆 Em breve: ${eventName}` 
      : `📆 Coming up: ${eventName}`,
    message: isPT
      ? `${eventName} aproxima-se (${dueDate}). ${tips || description}`
      : `${eventName} is approaching (${dueDate}). ${tips || description}`
  }
}

// AC #5: Consolidate multiple deadlines
function consolidateTaxInsights(
  events: TaxEventInstance[],
  locale: 'pt-PT' | 'en-US'
): Array<{ type: 'urgent' | 'warning' | 'info'; title: string; message: string; eventIds: string[] }> {
  const isPT = locale === 'pt-PT'
  
  // Group by week
  const thisWeek = events.filter(e => e.days_until <= 7)
  const nextTwoWeeks = events.filter(e => e.days_until > 7 && e.days_until <= 14)
  // const later = events.filter(e => e.days_until > 14) // Reserved for future monthly digest
  
  const insights: Array<{ type: 'urgent' | 'warning' | 'info'; title: string; message: string; eventIds: string[] }> = []
  
  // Handle urgent events individually
  const urgentEvents = events.filter(e => e.days_until <= REMINDER_THRESHOLDS.URGENT)
  for (const event of urgentEvents) {
    const content = generateTaxInsightContent(event, locale)
    insights.push({ ...content, eventIds: [event.id] })
  }
  
  // Consolidate if more than 2 events in same period
  const nonUrgentThisWeek = thisWeek.filter(e => e.days_until > REMINDER_THRESHOLDS.URGENT)
  if (nonUrgentThisWeek.length > 2) {
    insights.push({
      type: 'warning',
      title: isPT 
        ? `📋 ${nonUrgentThisWeek.length} prazos fiscais esta semana`
        : `📋 ${nonUrgentThisWeek.length} tax deadlines this week`,
      message: isPT
        ? `Tem vários prazos fiscais esta semana: ${nonUrgentThisWeek.map(e => e.event.event_name_pt).join(', ')}`
        : `You have multiple tax deadlines this week: ${nonUrgentThisWeek.map(e => e.event.event_name).join(', ')}`,
      eventIds: nonUrgentThisWeek.map(e => e.id)
    })
  } else {
    // Individual insights for non-urgent this week
    for (const event of nonUrgentThisWeek) {
      const content = generateTaxInsightContent(event, locale)
      insights.push({ ...content, eventIds: [event.id] })
    }
  }
  
  // Consolidate next two weeks if many
  if (nextTwoWeeks.length > 2) {
    insights.push({
      type: 'info',
      title: isPT 
        ? `📅 ${nextTwoWeeks.length} prazos fiscais nas próximas 2 semanas`
        : `📅 ${nextTwoWeeks.length} tax deadlines in the next 2 weeks`,
      message: isPT
        ? `Prepare-se: ${nextTwoWeeks.map(e => e.event.event_name_pt).join(', ')}`
        : `Get ready: ${nextTwoWeeks.map(e => e.event.event_name).join(', ')}`,
      eventIds: nextTwoWeeks.map(e => e.id)
    })
  } else {
    for (const event of nextTwoWeeks) {
      const content = generateTaxInsightContent(event, locale)
      insights.push({ ...content, eventIds: [event.id] })
    }
  }
  
  return insights
}

// Main function: Check tax deadlines and generate insights
export async function checkTaxDeadlines(
  userId: string,
  locale: 'pt-PT' | 'en-US' = 'pt-PT'
): Promise<Array<{ type: 'urgent' | 'warning' | 'info'; title: string; message: string; eventIds: string[]; actionUrl?: string }>> {
  const events = await getTaxEventsNeedingReminders(userId)
  
  if (events.length === 0) {
    return []
  }
  
  const insights = consolidateTaxInsights(events, locale)
  
  // Add action URLs where available
  return insights.map(insight => {
    // Find first event with action URL
    const eventWithUrl = events.find(e => 
      insight.eventIds.includes(e.id) && e.event.action_url
    )
    return {
      ...insight,
      actionUrl: eventWithUrl?.event.action_url ?? undefined
    }
  })
}

// Generate insight objects for the insight engine
export async function generateTaxInsights(
  userId: string,
  locale: 'pt-PT' | 'en-US' = 'pt-PT'
): Promise<TaxInsight[]> {
  const alerts = await checkTaxDeadlines(userId, locale)
  
  return alerts.map(alert => ({
    type: alert.type,
    title: alert.title,
    message: alert.message,
    actionUrl: alert.actionUrl
  }))
}

// AC #3: Check if should send push notification
export async function shouldSendTaxPush(
  userId: string,
  _eventId: string
): Promise<boolean> {
  const supabase = await createServerSupabase()
  
  // Check notification preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_prefs')
    .eq('id', userId)
    .single()
  
  if (!profile?.notification_prefs) return false
  
  // Check if tax notifications are enabled
  // notification_prefs structure: { urgent: boolean, opportunities: boolean, ... }
  const prefs = profile.notification_prefs as Record<string, boolean>
  
  // Tax deadlines should trigger urgent notifications
  return prefs.urgent === true
}

// Record that a reminder was sent
export async function recordReminderSent(
  userId: string,
  eventId: string
): Promise<void> {
  const supabase = await createServerSupabase()
  const currentYear = new Date().getFullYear()
  
  await supabase
    .from('tax_calendar_instances')
    .upsert({
      tax_event_id: eventId,
      user_id: userId,
      year: currentYear,
      due_date: new Date().toISOString().split('T')[0], // Will be updated properly
      last_reminder_sent: new Date().toISOString()
    }, {
      onConflict: 'tax_event_id,user_id,year'
    })
}

export default checkTaxDeadlines
