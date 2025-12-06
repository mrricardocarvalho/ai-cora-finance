# Story 13.3: Weekly Financial Summary (Auto-Generated)

**As a** User,
**I want** a weekly summary of my financial status,
**So that** I stay informed without actively checking.

## Acceptance Criteria

### AC #1: Weekly Summary Generation
- **Given** it's Sunday evening (configurable)
- **When** weekly summary is generated
- **Then** create a comprehensive report:
  - Week's spending vs last week
  - Progress toward monthly budget
  - Notable transactions (largest, unusual)
  - Upcoming bills in next 7 days
  - Goal progress updates

### AC #2: In-App Summary Card
- **Given** summary is generated
- **When** user opens app on Monday
- **Then** show summary card at top of feed: "Your Week in Review 📊"

### AC #3: Push Notification
- **Given** user has enabled weekly summary notifications
- **When** summary is generated
- **Then** send push: "Your weekly financial summary is ready. You spent €X this week (↑12% vs last week)."

### AC #4: Personalized Highlights
- **Given** the summary
- **When** notable events occurred
- **Then** highlight:
  - "🎉 You saved €200 more than usual this week!"
  - "⚠️ Dining out was 40% over your weekly average"
  - "✅ Rent payment processed successfully"

### AC #5: Actionable Next Steps
- **Given** the summary includes recommendations
- **When** displayed
- **Then** include 1-2 action items:
  - "Review that €150 subscription renewal"
  - "You're €50 under budget — consider extra debt payment"

## Technical Notes
- Create scheduled job for weekly summary generation
- Store summary in `insights` or dedicated table
- Make day/time configurable in settings

## Tasks
- [x] Create `src/lib/intelligence/weekly-summary.ts`
- [x] Implement summary generation logic (spending vs last week, bills, goals)
- [x] Create `src/app/api/cron/weekly-summary/route.ts`
- [x] Create `src/components/insights/WeeklySummaryCard.tsx`
- [x] Add unit tests
