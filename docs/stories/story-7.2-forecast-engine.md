# Story 7.2: Cash Flow Forecasting Engine

**Epic:** [Epic 7 - Advanced Intelligence & Forecasting](../epics/epic-7-advanced-intelligence.md)
**Priority:** High
**Points:** 8

---

## User Story

**As a** User,
**I want** to see a projection of my account balance for the next 30 days,
**So that** I can anticipate when I might run low and plan accordingly.

---

## Acceptance Criteria

### AC #1: Recurring Bill Projection
- **Given** the system has detected recurring patterns (from Epic 3)
- **When** calculating the forecast
- **Then** it schedules expected debits based on historical dates (e.g., Netflix on the 15th, rent on the 1st)

### AC #2: Income Projection
- **Given** the user has regular income deposits (salary)
- **When** calculating the forecast
- **Then** it includes expected income based on historical patterns

### AC #3: Daily Balance Projection
- **Given** current balance of €2,500 and recurring expenses of €1,800 over next 30 days
- **When** the forecast is calculated
- **Then** it returns an array of daily projected balances: `[{ date, projectedBalance, events: [] }]`

### AC #4: Floor Crossing Alert
- **Given** user's comfort floor is €500
- **When** the projected balance drops below €500 at any point in the next 30 days
- **Then** generate a `warning` insight: "At current pace, you'll hit your comfort floor on December 18th"

### AC #5: Confidence Indicator
- **Given** limited historical data (< 3 months)
- **When** displaying the forecast
- **Then** show a "Low Confidence" indicator explaining predictions improve with more data

### AC #6: What-If Exclusion
- **Given** a user wants to see impact of a large purchase
- **When** they input a hypothetical expense (e.g., "€500 on Dec 10")
- **Then** the forecast recalculates showing the adjusted trajectory

---

## Technical Notes

- Create `calculateCashFlowForecast(userId, days = 30)` in `src/lib/intelligence/forecast.ts`
- Use `recurring_patterns` table for scheduled bills
- Return data structure suitable for line chart visualization
- Consider edge cases: variable income, irregular patterns

### Data Structure
```typescript
interface ForecastDay {
  date: string; // ISO date
  projectedBalance: number;
  events: ForecastEvent[];
  confidence: 'high' | 'medium' | 'low';
}

interface ForecastEvent {
  type: 'income' | 'expense';
  description: string;
  amount: number;
  source: 'recurring' | 'predicted' | 'hypothetical';
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/forecast.ts` | Create |
| `src/lib/intelligence/insights.ts` | Modify (add floor-crossing trigger) |
| `src/app/api/intelligence/forecast/route.ts` | Create |

---

## Prerequisites

- Story 3.1: Recurring Detection (provides recurring patterns)
- Story 3.2: Safe-to-Spend Logic (provides comfort floor)

---

## Definition of Done

- [ ] Forecast engine calculates 30-day projections
- [ ] Recurring income and expenses are projected accurately
- [ ] Daily balance array returned with events
- [ ] Floor crossing generates warning insight
- [ ] Confidence indicator based on data quality
- [ ] What-if scenarios can be calculated
- [ ] API endpoint returns forecast data
- [ ] Unit tests for projection calculations
