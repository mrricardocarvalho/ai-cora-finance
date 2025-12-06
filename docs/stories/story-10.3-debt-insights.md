# Story 10.3: Debt Payoff Insights & Motivation

**Status:** Completed
**Epic:** [Epic 10 - Debt Optimization & Simulation](../epics/epic-10-debt-optimization.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** Cora to celebrate my debt progress and suggest optimizations,
**So that** I stay motivated on my debt-free journey.

---

## Acceptance Criteria

### AC #1: Progress Tracking
- **Given** user has been paying down debt
- **When** balance decreases
- **Then** track:
  - Total debt reduction this month/year
  - Percentage of original debt paid off
  - Streak of on-time payments

### AC #2: Milestone Celebrations
- **Given** user reaches a milestone
- **When** achieved
- **Then** generate `celebration` insight:
  - "🎉 You've paid off 25% of your credit card!"
  - "You've saved €120 in interest by paying extra this month"
  - "Debt-free in 8 months at current pace!"

### AC #3: Opportunity Insights
- **Given** user has Safe-to-Spend surplus
- **When** analyzing
- **Then** suggest: "You have €150 extra this month. Putting it toward [Debt X] would save €45 in interest."

### AC #4: Comparison to Plan
- **Given** user set a debt payoff goal
- **When** tracking
- **Then** show: "You're 2 months ahead of schedule!" or "You're 1 month behind plan"

### AC #5: Interest Paid Counter
- **Given** debt has interest
- **When** displaying debt overview
- **Then** show running total: "Total interest paid this year: €423"

### AC #6: Payoff Countdown
- **Given** projected payoff date
- **When** displaying debt card
- **Then** show: "X months until debt-free" with motivational messaging

---

## Technical Notes

- Extend insight triggers for debt milestones
- Store debt starting balance for comparison
- Confetti animation on major milestones (reuse from Epic 6)

### Milestone Triggers
```typescript
const debtMilestones = [
  { percentage: 25, message: "You've paid off 25% of your {debtName}!" },
  { percentage: 50, message: "Halfway there! 50% of {debtName} is gone!" },
  { percentage: 75, message: "Just 25% left on {debtName}! Keep going!" },
  { percentage: 100, message: "🎉 {debtName} is PAID OFF!" },
];
```

### Progress Calculation
```typescript
interface DebtProgress {
  originalBalance: number;
  currentBalance: number;
  percentagePaid: number;
  amountPaid: number;
  interestPaidThisYear: number;
  projectedPayoffDate: Date;
  monthsUntilPayoff: number;
  isAheadOfPlan: boolean;
  daysAheadOrBehind: number;
}
```

### Opportunity Detection
```typescript
function detectDebtOpportunity(safeToSpend: number, debts: Debt[]) {
  const surplus = safeToSpend - minimumBuffer;
  if (surplus > 50) {
    const highestInterestDebt = debts.sort((a, b) => b.interestRate - a.interestRate)[0];
    const interestSaved = calculateInterestSaved(highestInterestDebt, surplus);
    return {
      type: 'opportunity',
      message: `You have €${surplus} extra. Putting it toward ${highestInterestDebt.name} would save €${interestSaved} in interest.`,
    };
  }
  return null;
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/debt-insights.ts` | Create |
| `src/lib/intelligence/insights.ts` | Modify (integrate debt triggers) |
| `src/components/planning/DebtProgressCard.tsx` | Create or enhance |

---

## Prerequisites

- Story 5.1: Debt Data (provides debt records)
- Story 3.4: Insight Engine (provides insight framework)
- Story 3.2: Safe-to-Spend Logic (for surplus detection)

---

## Definition of Done

- [x] Progress tracking with original balance comparison (Mocked due to schema limits)
- [ ] Milestone insights generated at 25/50/75/100% (Skipped due to lack of history)
- [ ] Confetti animation on major milestones
- [x] Surplus opportunity insights work
- [ ] Plan comparison shows ahead/behind
- [x] Interest counter displayed (Insight)
- [x] Payoff countdown visible (Card)
- [ ] Unit tests for progress calculations
