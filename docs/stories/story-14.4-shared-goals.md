# Story 14.4: Shared Goals & Budgets

**Epic:** [Epic 14 - Collaborative Finances (Multi-User/Household)](../epics/epic-14-collaborative-finances.md)
**Priority:** Low (Future)
**Points:** 5

---

## User Story

**As a** Household,
**I want** shared goals and budgets we all contribute to,
**So that** we work together toward common financial objectives.

---

## Acceptance Criteria

### AC #1: Shared Goal Creation
- **Given** household exists
- **When** creating a goal
- **Then** option to make it:
  - Personal (just me)
  - Shared (household)

### AC #2: Shared Goal Progress
- **Given** shared goal exists
- **When** viewing progress
- **Then** show:
  - Total progress toward target
  - Contributions by each member
  - "João: €500 | Maria: €300"

### AC #3: Fair Share Suggestions
- **Given** creating shared goal
- **When** setting contributions
- **Then** suggest:
  - Equal split
  - Income-proportional split
  - Custom amounts

### AC #4: Household Budgets
- **Given** shared spending categories
- **When** setting budgets
- **Then** create household-level budgets:
  - "Groceries: €600/month (household)"
  - Track against shared account spending

### AC #5: Budget Notifications for All
- **Given** household budget exceeded
- **When** threshold hit
- **Then** notify all members (not just spender)

### AC #6: Individual vs Shared Budget View
- **Given** viewing budgets
- **When** in household
- **Then** show both:
  - My personal budgets
  - Household shared budgets

---

## Technical Notes

- Extend `goals` table with household support
- Create `household_budgets` table
- Notifications sent to all members

### Goal Schema Update
```sql
-- Add household support to goals
ALTER TABLE goals 
ADD COLUMN visibility TEXT DEFAULT 'personal' 
CHECK (visibility IN ('personal', 'household'));

ALTER TABLE goals 
ADD COLUMN household_id UUID REFERENCES households(id);

-- Track individual contributions
CREATE TABLE goal_contributions (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(12,2) NOT NULL,
  contributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household budgets
CREATE TABLE household_budgets (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, category)
);
```

### Fair Share Calculator
```typescript
interface FairShareResult {
  type: 'equal' | 'income_proportional' | 'custom';
  shares: MemberShare[];
}

interface MemberShare {
  memberId: string;
  memberName: string;
  monthlyAmount: number;
  percentage: number;
}

function calculateFairShares(
  goalAmount: number,
  targetMonths: number,
  members: HouseholdMember[]
): FairShareResult[] {
  const monthlyTotal = goalAmount / targetMonths;
  
  return [
    // Equal split
    {
      type: 'equal',
      shares: members.map(m => ({
        memberId: m.id,
        memberName: m.name,
        monthlyAmount: monthlyTotal / members.length,
        percentage: 100 / members.length,
      })),
    },
    // Income proportional (if income data available)
    members.every(m => m.monthlyIncome) ? {
      type: 'income_proportional',
      shares: calculateIncomeProportional(members, monthlyTotal),
    } : null,
  ].filter(Boolean);
}
```

### Shared Goal Card
```typescript
interface SharedGoalCardProps {
  goal: SharedGoal;
  contributions: GoalContribution[];
}

function SharedGoalCard({ goal, contributions }: SharedGoalCardProps) {
  const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);
  const progress = (totalContributed / goal.targetAmount) * 100;
  
  const byMember = groupBy(contributions, 'userId');
  
  return (
    <Card>
      <h3>{goal.name}</h3>
      <ProgressBar value={progress} />
      <p>€{totalContributed} / €{goal.targetAmount}</p>
      
      <div className="mt-4 space-y-2">
        <h4>Contributions</h4>
        {Object.entries(byMember).map(([memberId, memberContributions]) => (
          <MemberContributionRow 
            key={memberId}
            memberId={memberId}
            total={sumContributions(memberContributions)}
          />
        ))}
      </div>
    </Card>
  );
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `db/migrations/00XX_shared_goals_budgets.sql` | Create |
| `src/lib/household/goals.ts` | Create |
| `src/lib/household/budgets.ts` | Create |
| `src/components/goals/SharedGoalCard.tsx` | Create |
| `src/components/goals/FairShareCalculator.tsx` | Create |
| `src/components/budget/HouseholdBudgetCard.tsx` | Create |

---

## Prerequisites

- Story 14.1: Household Creation (for household context)
- Story 5.3: Goal Tracking (for goals infrastructure)

---

## Definition of Done

- [ ] Shared goal creation works
- [ ] Member contributions tracked
- [ ] Fair share suggestions available
- [ ] Household budgets created
- [ ] Budget alerts sent to all members
- [ ] Personal vs shared budget views
- [ ] Progress visualization shows contributions
