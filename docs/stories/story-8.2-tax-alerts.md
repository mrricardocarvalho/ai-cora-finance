# Story 8.2: Tax Deadline Alerts & Notifications

**Epic:** [Epic 8 - Portuguese Tax Intelligence](../epics/epic-8-tax-intelligence.md)
**Priority:** High
**Points:** 5

---

## User Story

**As a** User,
**I want** to receive proactive alerts before tax deadlines,
**So that** I have time to prepare and never miss a filing.

---

## Acceptance Criteria

### AC #1: Reminder Schedule
- **Given** a tax deadline exists (e.g., IRS submission June 30)
- **When** the current date is within the reminder window
- **Then** generate insights at these intervals:
  - 30 days before: `info` insight ("IRS submission opens in 30 days")
  - 14 days before: `warning` insight ("IRS deadline in 2 weeks")
  - 3 days before: `urgent` insight ("IRS deadline in 3 days!")
  - Day of: `urgent` insight ("Today is the IRS deadline!")

### AC #2: Insight Content Quality
- **Given** a tax deadline alert is generated
- **When** displayed to user
- **Then** it includes:
  - Clear deadline name and date
  - What action is required
  - Link to relevant resource (Portal das Finanças or internal page)
  - Contextual tip (e.g., "Make sure you have your NIF and access credentials ready")

### AC #3: Push Notification Integration
- **Given** user has enabled push notifications for "Tax Deadlines"
- **When** an urgent tax alert is generated (3 days or less)
- **Then** send a push notification with the alert

### AC #4: Dismissal & Snooze
- **Given** a tax insight is shown
- **When** user dismisses it
- **Then** don't show the same deadline alert again (but show next milestone)
- **When** user marks as "Done" or "Not Applicable"
- **Then** suppress all further alerts for that specific deadline this year

### AC #5: No Spam Guarantee
- **Given** multiple tax events in the same period
- **When** generating alerts
- **Then** consolidate into a summary insight if > 2 deadlines within 7 days

---

## Technical Notes

- Extend Insight Engine with tax calendar trigger
- Add `tax_alert_preferences` to profiles or use existing notification preferences
- Create `checkTaxDeadlines()` function that runs daily (or on user login)

### Alert Priority Logic
```typescript
function getTaxAlertPriority(daysUntil: number): InsightType {
  if (daysUntil <= 0) return 'urgent';
  if (daysUntil <= 3) return 'urgent';
  if (daysUntil <= 14) return 'warning';
  return 'info';
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/tax-alerts.ts` | Create |
| `src/lib/intelligence/insights.ts` | Modify (integrate tax triggers) |
| `src/lib/actions/notifications.ts` | Modify (add tax notification logic) |

---

## Prerequisites

- Story 8.1: Portuguese Tax Calendar System (provides deadline data)
- Story 6.1: Web Push (provides notification infrastructure)

---

## Definition of Done

- [ ] Alerts generated at 30, 14, 3, and 0 days before deadlines
- [ ] Insight content includes actionable guidance
- [ ] Push notifications work for urgent alerts
- [ ] Dismiss/Done functionality prevents spam
- [ ] Multiple deadlines are consolidated
- [ ] User preferences respected
