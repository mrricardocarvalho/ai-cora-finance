"use server"
import { createClient as createServerSupabase } from '../supabase/server'
import { addDays, format, getYear, differenceInDays, startOfDay } from 'date-fns'
import {
  type TaxEventType,
  type TaxAppliesTo,
  type TaxCalendarEvent,
  type TaxEventInstance,
  type UserTaxProfile,
  calculateEventDate,
  eventAppliesToUser,
  calculateUrgency
} from './calendar-types'

// Re-export types for convenience
export type { TaxEventType, TaxAppliesTo, TaxCalendarEvent, TaxEventInstance, UserTaxProfile }
export { calculateEventDate }

// AC #5: Get upcoming tax events for a user
export async function getUpcomingTaxEvents(
  userId?: string,
  daysAhead: number = 90
): Promise<{ success: boolean; events: TaxEventInstance[]; error?: string }> {
  const supabase = await createServerSupabase()
  
  let uid = userId
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser()
    uid = user?.id
  }
  
  if (!uid) {
    return { success: false, events: [], error: 'User not authenticated' }
  }
  
  // Fetch user's tax profile - handle missing columns gracefully
  let profile: Record<string, boolean | null> | null = null
  try {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('is_property_owner, is_self_employed, is_investor, is_car_owner')
      .eq('id', uid)
      .single()
    
    if (profileError) {
      // If columns don't exist yet, just use defaults
      console.warn('Tax profile columns may not exist yet:', profileError.message)
    } else {
      profile = data
    }
  } catch {
    console.warn('Error fetching tax profile, using defaults')
  }
  
  const userProfile: UserTaxProfile = {
    is_property_owner: profile?.is_property_owner ?? false,
    is_self_employed: profile?.is_self_employed ?? false,
    is_investor: profile?.is_investor ?? true, // Default to investor for most users
    is_car_owner: profile?.is_car_owner ?? false
  }
  
  // Fetch all active tax events
  const { data: events, error: eventsError } = await supabase
    .from('tax_calendar')
    .select('*')
    .eq('is_active', true)
  
  if (eventsError) {
    // If tax_calendar table doesn't exist yet, return empty
    if (eventsError.code === '42P01') {
      return { success: true, events: [] }
    }
    return { success: false, events: [], error: eventsError.message }
  }
  
  if (!events || events.length === 0) {
    return { success: true, events: [] }
  }
  
  // Fetch user's existing instances (to check status)
  const currentYear = getYear(new Date())
  const { data: instances } = await supabase
    .from('tax_calendar_instances')
    .select('tax_event_id, status')
    .eq('user_id', uid)
    .eq('year', currentYear)
  
  const instanceMap = new Map(
    instances?.map(i => [i.tax_event_id, i.status]) ?? []
  )
  
  const today = startOfDay(new Date())
  const endDate = addDays(today, daysAhead)
  
  // AC #3 & #4: Calculate dates and filter events
  const upcomingEvents: TaxEventInstance[] = []
  
  for (const event of events) {
    // Filter by user profile
    if (!eventAppliesToUser(event.applies_to as TaxAppliesTo, userProfile)) {
      continue
    }
    
    // Calculate this year's date
    let eventDate = calculateEventDate(event.base_month, event.base_day, currentYear)
    
    // If date has passed, check next year
    if (eventDate < today) {
      eventDate = calculateEventDate(event.base_month, event.base_day, currentYear + 1)
    }
    
    // Check if within range
    if (eventDate > endDate) {
      continue
    }
    
    const daysUntil = differenceInDays(eventDate, today)
    const status = instanceMap.get(event.id) ?? 'pending'
    
    // Skip done or dismissed events
    if (status === 'done' || status === 'dismissed') {
      continue
    }
    
    upcomingEvents.push({
      id: event.id,
      event: event as TaxCalendarEvent,
      due_date: format(eventDate, 'yyyy-MM-dd'),
      days_until: daysUntil,
      status: status as 'pending' | 'done' | 'not_applicable' | 'dismissed',
      urgency: calculateUrgency(daysUntil, event.event_type as TaxEventType)
    })
  }
  
  // Sort by date
  upcomingEvents.sort((a, b) => a.days_until - b.days_until)
  
  return { success: true, events: upcomingEvents }
}

// Mark a tax event as done, dismissed, or not applicable
export async function updateTaxEventStatus(
  eventId: string,
  status: 'done' | 'not_applicable' | 'dismissed',
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabase()
  
  let uid = userId
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser()
    uid = user?.id
  }
  
  if (!uid) {
    return { success: false, error: 'User not authenticated' }
  }
  
  const currentYear = getYear(new Date())
  
  // Get the event to calculate due date
  const { data: event } = await supabase
    .from('tax_calendar')
    .select('base_month, base_day')
    .eq('id', eventId)
    .single()
  
  if (!event) {
    return { success: false, error: 'Event not found' }
  }
  
  const dueDate = calculateEventDate(event.base_month, event.base_day, currentYear)
  
  // Upsert the instance
  const { error } = await supabase
    .from('tax_calendar_instances')
    .upsert({
      tax_event_id: eventId,
      user_id: uid,
      year: currentYear,
      due_date: format(dueDate, 'yyyy-MM-dd'),
      status
    }, {
      onConflict: 'tax_event_id,user_id,year'
    })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// Get tax events that need reminders
export async function getTaxEventsNeedingReminders(
  userId: string
): Promise<TaxEventInstance[]> {
  const result = await getUpcomingTaxEvents(userId, 90)
  
  if (!result.success) return []
  
  // Filter to events that match reminder schedule
  return result.events.filter(event => {
    const reminderDays = event.event.reminder_days_before
    return reminderDays.includes(event.days_until)
  })
}

// Update user's tax profile flags
export async function updateTaxProfile(
  updates: Partial<UserTaxProfile>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabase()
  
  let uid = userId
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser()
    uid = user?.id
  }
  
  if (!uid) {
    return { success: false, error: 'User not authenticated' }
  }
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', uid)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

export default getUpcomingTaxEvents
