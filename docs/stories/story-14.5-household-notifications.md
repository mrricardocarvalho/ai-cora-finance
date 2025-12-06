# Story 14.5: Household Notifications & Communication

**Epic:** [Epic 14 - Collaborative Finances (Multi-User/Household)](../epics/epic-14-collaborative-finances.md)
**Priority:** Low (Future)
**Points:** 5

---

## User Story

**As a** Household member,
**I want** to stay informed about shared financial activity,
**So that** we maintain transparency and coordination.

---

## Acceptance Criteria

### AC #1: Activity Feed
- **Given** household has shared activity
- **When** viewing household page
- **Then** show activity feed:
  - "Maria added €200 to Vacation Fund"
  - "João categorized €50 as Groceries"
  - "New transaction: €85 at Continente (shared account)"

### AC #2: Notification Preferences
- **Given** household notifications exist
- **When** configuring
- **Then** allow per-user settings:
  - All shared activity
  - Only large transactions (> €X)
  - Goals & budgets only
  - None

### AC #3: Large Transaction Alerts
- **Given** large transaction on shared account
- **When** exceeds threshold (default €100)
- **Then** notify all members: "€250 spent at [Merchant] on shared account"

### AC #4: Goal Milestone Celebrations
- **Given** shared goal milestone reached
- **When** 25%, 50%, 75%, 100%
- **Then** notify all: "🎉 Vacation Fund is 50% complete! Keep going!"

### AC #5: Budget Warnings
- **Given** shared budget approaching limit
- **When** 80% used
- **Then** warn all: "⚠️ Grocery budget is 80% used with 10 days left"

### AC #6: In-App Comments (Stretch)
- **Given** shared transaction
- **When** member adds comment
- **Then** visible to all: "This was for the kids' party" — João

---

## Technical Notes

- Create household activity log
- Integrate with existing notification system
- Respect individual preferences

### Activity Log Schema
```sql
CREATE TABLE household_activity (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  activity_type TEXT NOT NULL,
  entity_type TEXT, -- 'transaction', 'goal', 'budget'
  entity_id UUID,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_household_activity_household_time 
ON household_activity(household_id, created_at DESC);

-- Notification preferences
ALTER TABLE profiles 
ADD COLUMN household_notification_prefs JSONB DEFAULT '{
  "all_activity": false,
  "large_transactions": true,
  "large_threshold": 100,
  "goals_budgets": true
}';
```

### Activity Types
```typescript
type HouseholdActivityType =
  | 'transaction_added'
  | 'transaction_categorized'
  | 'goal_contribution'
  | 'goal_milestone'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'member_joined'
  | 'member_left'
  | 'comment_added';

interface HouseholdActivity {
  id: string;
  householdId: string;
  userId: string;
  activityType: HouseholdActivityType;
  entityType?: string;
  entityId?: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
```

### Notification Dispatcher
```typescript
async function notifyHouseholdMembers(
  householdId: string,
  activity: HouseholdActivity,
  excludeUserId?: string // Don't notify the actor
): Promise<void> {
  const members = await getHouseholdMembers(householdId);
  
  for (const member of members) {
    if (member.userId === excludeUserId) continue;
    
    const prefs = member.householdNotificationPrefs;
    
    if (shouldNotify(activity, prefs)) {
      await sendPushNotification(member.userId, {
        title: getActivityTitle(activity),
        body: activity.message,
        data: {
          type: 'household_activity',
          householdId,
          activityId: activity.id,
        },
      });
    }
  }
}

function shouldNotify(
  activity: HouseholdActivity,
  prefs: HouseholdNotificationPrefs
): boolean {
  if (prefs.all_activity) return true;
  
  if (prefs.large_transactions && activity.activityType === 'transaction_added') {
    const amount = Math.abs(activity.metadata?.amount || 0);
    return amount >= prefs.large_threshold;
  }
  
  if (prefs.goals_budgets) {
    return ['goal_contribution', 'goal_milestone', 'budget_warning', 'budget_exceeded']
      .includes(activity.activityType);
  }
  
  return false;
}
```

### Activity Feed Component
```typescript
function HouseholdActivityFeed({ householdId }: { householdId: string }) {
  const { data: activities } = useHouseholdActivity(householdId);
  
  return (
    <div className="space-y-3">
      <h3>Recent Activity</h3>
      {activities?.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function ActivityItem({ activity }: { activity: HouseholdActivity }) {
  const icon = getActivityIcon(activity.activityType);
  const member = useMember(activity.userId);
  
  return (
    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-sm">
          <strong>{member?.name}</strong> {activity.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `db/migrations/00XX_household_activity.sql` | Create |
| `src/lib/household/activity.ts` | Create |
| `src/lib/household/notifications.ts` | Create |
| `src/components/household/ActivityFeed.tsx` | Create |
| `src/components/settings/HouseholdNotificationPrefs.tsx` | Create |
| `src/app/settings/household/notifications/page.tsx` | Create |

---

## Prerequisites

- Story 14.1: Household Creation (for household context)
- Story 6.1: Web Push (for notifications)

---

## Definition of Done

- [ ] Activity feed shows household events
- [ ] Per-user notification preferences work
- [ ] Large transaction alerts sent
- [ ] Goal milestone notifications
- [ ] Budget warning notifications
- [ ] Activity logged for all shared actions
- [ ] Preferences UI functional
- [ ] RLS protects activity data
