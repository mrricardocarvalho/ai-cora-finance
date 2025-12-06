import { z } from 'zod'

export const notificationPreferencesSchema = z.object({
  urgent: z.boolean().default(true),
  opportunities: z.boolean().default(true),
  weekly_summary: z.boolean().default(false),
  quiet_hours_enabled: z.boolean().default(true),
  quiet_hours_start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format').default('22:00'),
  quiet_hours_end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format').default('08:00'),
  // Household notification preferences
  household_activity: z.boolean().default(true),
  household_goal_updates: z.boolean().default(true),
  household_spending_alerts: z.boolean().default(true),
  household_member_activity: z.boolean().default(false)
})

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>
