# Story 13.3: Weekly Financial Summary (Auto-Generated)

**Status:** Completed
**Epic:** [Epic 13 - Predictive Guidance & Financial Autopilot](../epics/epic-13-predictive-autopilot.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** a weekly summary of my financial status,
**So that** I stay informed without actively checking.

---

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

### AC #6: Email Option (Stretch)
- **Given** user prefers email
- **When** summary is generated
- **Then** optionally send email digest

---

## Technical Notes

- Create scheduled job for weekly summary generation
- Store summary in `insights` or dedicated table
- Make day/time configurable in settings

### Summary Data Structure
```typescript
interface WeeklySummary {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  generatedAt: Date;
  
  spending: {
    thisWeek: number;
    lastWeek: number;
    changePercent: number;
  };
  
  budgetProgress: {
    spent: number;
    budget: number;
    percentUsed: number;
    daysRemaining: number;
  };
  
  notableTransactions: {
    largest: Transaction;
    unusual: Transaction[];
  };
  
  upcomingBills: RecurringExpense[];
  
  goalUpdates: GoalProgress[];
  
  highlights: SummaryHighlight[];
  
  actionItems: ActionItem[];
}

interface SummaryHighlight {
  type: 'celebration' | 'warning' | 'info';
  emoji: string;
  message: string;
}

interface ActionItem {
  title: string;
  description: string;
  link: string;
}
```

### Cron Job Setup (Vercel)
```typescript
// src/app/api/cron/weekly-summary/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Generate summaries for all users
  const users = await getAllActiveUsers();
  for (const user of users) {
    await generateWeeklySummary(user.id);
  }
  
  return Response.json({ generated: users.length });
}
```

### vercel.json cron config
```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-summary",
      "schedule": "0 18 * * 0"
    }
  ]
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/weekly-summary.ts` | Create |
| `src/components/insights/WeeklySummaryCard.tsx` | Create |
| `src/app/api/cron/weekly-summary/route.ts` | Create |
| `vercel.json` | Modify (add cron) |

---

## Prerequisites

- Story 3.6: Monthly Aggregates (for spending data)
- Story 3.1: Recurring Detection (for upcoming bills)
- Story 6.1: Web Push (for notifications)

---

## Definition of Done

- [ ] Weekly summary generates on schedule
- [ ] Summary card displays in Insight Feed
- [ ] Push notification sent (if enabled)
- [ ] Highlights are personalized
- [ ] Action items are actionable
- [ ] Day/time configurable
- [ ] Cron job deployed and working
