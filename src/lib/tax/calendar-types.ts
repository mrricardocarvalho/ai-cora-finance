/**
 * Tax Calendar Types and Utilities
 * Shared types and non-async functions for client and server use
 */
import { startOfDay } from 'date-fns'

// AC #1: Tax Event Types
export type TaxEventType = 'deadline' | 'payment' | 'info'
export type TaxAppliesTo = 'all' | 'property_owners' | 'investors' | 'self_employed' | 'car_owners'

// AC #1: Tax Calendar Event structure
export interface TaxCalendarEvent {
  id: string
  event_name: string
  event_name_pt: string
  event_type: TaxEventType
  base_month: number
  base_day: number
  description: string
  description_pt: string
  applies_to: TaxAppliesTo
  reminder_days_before: number[]
  action_url: string | null
  tips: string | null
  tips_pt: string | null
}

// User-specific tax event instance
export interface TaxEventInstance {
  id: string
  event: TaxCalendarEvent
  due_date: string
  days_until: number
  status: 'pending' | 'done' | 'not_applicable' | 'dismissed'
  urgency: 'urgent' | 'warning' | 'info' | 'normal'
}

// User profile tax preferences
export interface UserTaxProfile {
  is_property_owner: boolean
  is_self_employed: boolean
  is_investor: boolean
  is_car_owner: boolean
}

// AC #3: Dynamic date calculation for a given year
export function calculateEventDate(baseMonth: number, baseDay: number, year: number): Date {
  // Handle months 0-indexed in Date
  let date = new Date(year, baseMonth - 1, baseDay)
  
  // Handle day overflow (e.g., Feb 30 becomes March 2)
  // Adjust to last day of month if needed
  if (date.getMonth() !== baseMonth - 1) {
    date = new Date(year, baseMonth, 0) // Last day of baseMonth
  }
  
  return startOfDay(date)
}

// AC #4: Filter events based on user profile
export function eventAppliesToUser(appliesTo: TaxAppliesTo, profile: UserTaxProfile): boolean {
  switch (appliesTo) {
    case 'all':
      return true
    case 'property_owners':
      return profile.is_property_owner
    case 'investors':
      return profile.is_investor
    case 'self_employed':
      return profile.is_self_employed
    case 'car_owners':
      return profile.is_car_owner
    default:
      return true
  }
}

// Calculate urgency based on days until deadline
export function calculateUrgency(daysUntil: number, eventType: TaxEventType): 'urgent' | 'warning' | 'info' | 'normal' {
  if (eventType === 'info') return 'info'
  
  if (daysUntil <= 0) return 'urgent'
  if (daysUntil <= 3) return 'urgent'
  if (daysUntil <= 14) return 'warning'
  if (daysUntil <= 30) return 'info'
  return 'normal'
}
