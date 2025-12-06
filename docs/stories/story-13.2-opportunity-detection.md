# Story 13.2: Opportunity Detection Engine

**Status:** Completed
**Epic:** [Epic 13 - Predictive Guidance & Financial Autopilot](../epics/epic-13-predictive-autopilot.md)
**Priority:** High
**Points:** 8

---

## User Story

**As a** User,
**I want** Cora to spot opportunities I might miss,
**So that** I can optimize my finances without constant monitoring.

---

## Acceptance Criteria

### AC #1: Surplus Detection
- **Given** user has unexpected surplus (income > usual expenses)
- **When** detected at month end
- **Then** suggest: "You have €400 extra this month. Options: Pay down [Debt] (save €X interest), Invest (grow long-term), or Build emergency fund."

### AC #2: Price Drop Opportunities
- **Given** tracked investments have significant drops
- **When** price drops 10%+ from recent high
- **Then** alert (for DCA investors): "VWCE is down 12% from its high. Good time to add to your position? [Learn about dollar-cost averaging]"

### AC #3: Goal Acceleration
- **Given** user is ahead of pace on savings goal
- **When** surplus continues
- **Then** suggest: "You're 3 months ahead on your vacation goal! Increase target? Or redirect to [other goal]?"

### AC #4: Debt Payoff Opportunity
- **Given** user has high-interest debt AND investable cash
- **When** math favors debt payoff
- **Then** recommend: "Paying €500 toward your credit card yields guaranteed 19.9% return. Consider prioritizing debt over savings temporarily?"

### AC #5: Refinancing Opportunity
- **Given** user has existing loans
- **When** market rates drop significantly below their rate
- **Then** alert: "Interest rates have dropped. Refinancing your mortgage could save €X/month."

### AC #6: Tax Timing Opportunities
- **Given** approaching year-end
- **When** user has unrealized gains/losses
- **Then** suggest: "Realizing €X in losses before Dec 31 could offset gains and save €Y in taxes."

---

## Technical Notes

- Create opportunity scoring based on financial impact
- Prioritize opportunities by potential savings/benefit
- Include "Dismiss" and "Learn More" actions

### Opportunity Scoring
```typescript
interface Opportunity {
  type: OpportunityType;
  title: string;
  message: string;
  impact: number; // € saved/earned
  confidence: 'high' | 'medium' | 'low';
  action: OpportunityAction;
  learnMoreConcept?: string;
}

type OpportunityType = 
  | 'surplus_allocation'
  | 'investment_dip'
  | 'goal_acceleration'
  | 'debt_payoff'
  | 'refinancing'
  | 'tax_timing';

function scoreOpportunity(opportunity: Opportunity): number {
  const baseScore = opportunity.impact;
  const confidenceMultiplier = { high: 1.0, medium: 0.7, low: 0.4 };
  return baseScore * confidenceMultiplier[opportunity.confidence];
}
```

### Surplus Detection
```typescript
function detectSurplus(
  currentMonth: MonthlyAggregate,
  averages: MonthlyAverages
): Opportunity | null {
  const surplus = currentMonth.income - currentMonth.expenses - averages.averageExpenses;
  
  if (surplus > 100) { // Minimum threshold
    return {
      type: 'surplus_allocation',
      title: 'Unexpected Surplus',
      message: `You have €${surplus} extra this month.`,
      impact: surplus,
      confidence: 'high',
      action: suggestSurplusAllocation(surplus),
    };
  }
  return null;
}
```

### Investment Dip Detection
```typescript
function detectInvestmentDip(holdings: Holding[]): Opportunity[] {
  return holdings
    .filter(h => {
      const dropFromHigh = (h.highPrice52w - h.currentPrice) / h.highPrice52w;
      return dropFromHigh >= 0.10; // 10%+ drop
    })
    .map(h => ({
      type: 'investment_dip',
      title: `${h.symbol} Down ${formatPercent(dropFromHigh)}`,
      message: `${h.symbol} is down from its 52-week high. Good time to DCA?`,
      impact: 0, // Speculative
      confidence: 'medium',
      learnMoreConcept: 'dollar-cost-averaging',
    }));
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/opportunity-engine.ts` | Create |
| `src/lib/intelligence/insights.ts` | Modify (integrate opportunities) |
| `src/lib/types.ts` | Modify (add Opportunity types) |

---

## Prerequisites

- Story 3.6: Monthly Aggregates (for surplus detection)
- Story 4.2: Market Data (for investment dips)
- Story 5.1: Debt Data (for debt payoff opportunities)

---

## Definition of Done

- [ ] Surplus detection and allocation suggestions
- [ ] Investment dip alerts for DCA
- [ ] Goal acceleration suggestions
- [ ] Debt payoff opportunity detection
- [ ] Tax timing suggestions
- [ ] Opportunity scoring and prioritization
- [ ] Learn More links to concepts
- [ ] Dismiss functionality
