# Story 6.2: Notification Logic & Settings

**Status:** Done
**Epic:** 6. Polish & Proactive Reach
**Story:**
**As a** User,
**I want** to control exactly what Cora notifies me about and when,
**So that** I feel informed but not spammed or anxious.

## Acceptance Criteria
1.  [x] **Schema Update:** Update `profiles` table to include `notification_preferences` (JSONB).
    *   Fields: `urgent` (bool), `opportunities` (bool), `weekly_summary` (bool), `quiet_hours_enabled` (bool), `quiet_hours_start` (string "22:00"), `quiet_hours_end` (string "08:00").
2.  [x] **Settings Page:** Create `/settings/notifications` page.
3.  [x] **UI Controls:** Implement Toggles (Switch component) for each category and Time Pickers for Quiet Hours.
4.  [x] **Logic Guard:** Implement a utility `shouldSendNotification(userId, type)` on the server.
    *   Check if user has enabled that `type`.
    *   Check if current time (in user's timezone) is within `Quiet Hours`.
    *   *Exception:* `Urgent` alerts (like "Comfort Floor Breach") might override Quiet Hours if critical (optional, stick to strict quiet for MVP).
5.  [x] **Integration:** Update the `Insight Engine` (Story 3.4) to call `shouldSendNotification` before triggering the Web Push.

## Implementation Notes

- Files added: `src/lib/validations/notifications.ts`, `db/migrations/0012_add_notification_prefs_to_profiles.sql`, `src/lib/actions/settings.ts`, `src/lib/services/notification-guard.ts`, `src/components/settings/notification-form.tsx`, and `src/app/settings/notifications/page.tsx` updated to include the form.
- Schema: `notification_preferences` stored as `jsonb` with defaults; Drizzle schema updated to include `notification_preferences` text column for compatibility.
- UI: `NotificationForm` allows toggling categories and selecting quiet hours time; initial values fetched server-side and passed from `getNotificationPreferences`.
- Guard: `shouldSendNotification` uses `date-fns-tz` to compute local time using a `timezone` field if present, otherwise defaults to `Europe/Lisbon`. It verifies the user preference bool for the type and quiet hours enforcement.
- Integration: `generateInsights`, `detectTaxHarvesting`, and emergency warning logic now check `shouldSendNotification` before issuing a push via `sendNotification` (server action `src/lib/actions/notifications.ts`).


## Dev Notes (Context)

**1. Database Schema (JSONB):**
Using JSONB allows flexibility without migrating columns later.

// Default value
const defaultPrefs = {
  urgent: true,
  opportunities: true,
  weekly_summary: false,
  quiet_hours_enabled: true,
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00"
}

**2. Timezone Handling:**
*   This is tricky on the server. Ideally, store the user's timezone in `profiles` (e.g., 'Europe/Lisbon').
*   If timezone is missing, assume 'Europe/Lisbon' (since this is a Portugal-first app) or UTC.
*   Use `date-fns-tz` to compare Server Time vs User Quiet Hours.

**3. Server Action:**
`updateNotificationPreferences(data: z.infer<typeof NotificationSettingsSchema>)`

**4. UI Components:**
*   `Switch` (shadcn/ui) for toggles.
*   `Select` or `Input type="time"` for hours.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-6.2-notification-settings"
  title: "Notification Logic & Settings"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "date-fns-tz"
  shadcn_components_to_add:
    - "switch"
    - "label"
    - "separator"
  folder_structure:
    - "/app/(dashboard)/settings/notifications/page.tsx"
    - "/components/settings/notification-form.tsx"
    - "/lib/services/notification-guard.ts" (The logic)
    - "/lib/actions/settings.ts"
  default_timezone: "Europe/Lisbon"
  verify: "Turn off 'Opportunities'. Trigger an Opportunity Insight. Verify Insight appears in Feed but NO Push Notification is sent."