# Story 13.4: Smart Recommendations Engine

**Status:** Approved
**Epic:** [Epic 13 - Predictive Guidance & Financial Autopilot](../epics/epic-13-predictive-autopilot.md)
**Priority:** Medium
**Points:** 8

---

## User Story

**As a** User,
**I want** Cora to give me personalized recommendations based on my situation,
**So that** I always know what financial action to take next.

---

## Acceptance Criteria

### AC #1: Priority Action Queue
- **Given** user has multiple financial improvement opportunities
- **When** generating recommendations
- **Then** rank by impact and urgency:
  1. Urgent (action needed this week)
  2. Important (significant impact)
  3. Optimization (nice to have)

### AC #2: Situational Recommendations
- **Given** user's current financial state
- **When** generating recommendations
- **Then** match to situation:
  - No emergency fund → "Build 1 month emergency fund first"
  - High-interest debt → "Focus on debt payoff"
  - No investments → "Start investing €50/month"
  - All basics covered → "Optimize: tax-loss harvest / rebalance"

### AC #3: One Thing Focus
- **Given** many possible recommendations
- **When** displaying to user
- **Then** highlight ONE primary action: "Your #1 priority this month: [Action]"

### AC #4: Progress Tracking
- **Given** a recommendation is acted upon
- **When** user completes it
- **Then** celebrate and reveal next priority

### AC #5: Ignore/Snooze Options
- **Given** user doesn't want a recommendation
- **When** they dismiss it
- **Then** offer:
  - "Not for me" (permanently dismiss)
  - "Remind me in 1 month" (snooze)
  - "Already done" (mark complete)

### AC #6: Recommendation Reasoning
- **Given** a recommendation is shown
- **When** user wants to understand why
- **Then** include explanation: "I'm recommending this because [reason]" with link to learn more.

---

## Technical Notes

- Create decision tree for recommendation prioritization
- Use user profile (goals, risk tolerance) for personalization
- Track recommendation status in DB

### Recommendation Priority Logic
```typescript
type RecommendationPriority = 'urgent' | 'important' | 'optimization';

interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  why: string;
  impact: number; // € or relative score
  action: RecommendationAction;
  learnMoreConcept?: string;
}

const priorityRules: PriorityRule[] = [
  { condition: 'no_emergency_fund', priority: 'urgent', rec: 'build_emergency_fund' },
  { condition: 'high_interest_debt', priority: 'urgent', rec: 'pay_high_interest' },
  { condition: 'no_comfort_floor_set', priority: 'important', rec: 'set_comfort_floor' },
  { condition: 'no_investments', priority: 'important', rec: 'start_investing' },
  { condition: 'portfolio_unbalanced', priority: 'optimization', rec: 'rebalance' },
  { condition: 'tax_loss_opportunity', priority: 'optimization', rec: 'harvest_losses' },
];
```

### Financial Hierarchy
```typescript
// Dave Ramsey-inspired priority order
const financialHierarchy = [
  'starter_emergency_fund',     // €1,000 starter fund
  'pay_high_interest_debt',     // Credit cards, etc.
  'full_emergency_fund',        // 3-6 months expenses
  'invest_for_retirement',      // 15% of income
  'pay_off_all_debt',           // Mortgage, loans
  'invest_and_give',            // Build wealth, be generous
];

function getNextRecommendation(userState: UserFinancialState): Recommendation {
  for (const step of financialHierarchy) {
    if (!isStepComplete(userState, step)) {
      return generateRecommendation(step, userState);
    }
  }
  return generateOptimizationRecommendation(userState);
}
```

### Recommendation Tracking Schema
```sql
CREATE TABLE recommendation_status (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  recommendation_type TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'completed', 'dismissed', 'snoozed'
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/recommendations.ts` | Create |
| `src/components/insights/RecommendationCard.tsx` | Create |
| `db/migrations/00XX_recommendations_tracking.sql` | Create |

---

## Prerequisites

- Story 3.2: Safe-to-Spend Logic (for financial state)
- Story 5.1: Debt Data (for debt recommendations)
- Story 5.5: Emergency Fund (for fund status)

---

## Definition of Done

- [ ] Priority queue generates ranked recommendations
- [ ] Situational matching works
- [ ] "One Thing" focus displayed
- [ ] Progress tracking and celebration
- [ ] Dismiss/snooze functionality
- [ ] Reasoning included with each recommendation
- [ ] Recommendation status persisted
- [ ] Unit tests for priority logic
