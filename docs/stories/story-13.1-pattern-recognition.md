# Story 13.1: Predictive Pattern Recognition

**Epic:** [Epic 13 - Predictive Guidance & Financial Autopilot](../epics/epic-13-predictive-autopilot.md)
**Priority:** High
**Points:** 8

---

## User Story

**As a** System,
**I want** to identify patterns and predict future financial events,
**So that** Cora can proactively alert users before things happen.

---

## Acceptance Criteria

### AC #1: Seasonal Spending Patterns
- **Given** user has 12+ months of data
- **When** analyzing spending
- **Then** identify seasonal patterns:
  - December spending spike (holidays)
  - September education expenses
  - Summer vacation spending
  - Annual insurance renewals

### AC #2: Proactive Seasonal Alerts
- **Given** seasonal pattern detected (e.g., December +€500 average)
- **When** November arrives
- **Then** generate `info` insight: "Based on last year, you typically spend €500 more in December. Consider setting aside extra now."

### AC #3: Bill Increase Prediction
- **Given** utility bills show upward trend
- **When** analyzing recent months
- **Then** predict: "Your electricity bills have increased 15% over 6 months. At this rate, expect €X/month by summer."

### AC #4: Subscription Creep Detection
- **Given** recurring expenses are tracked
- **When** total subscriptions increase month-over-month
- **Then** alert: "Your monthly subscriptions have grown by €45 over the past year. Review your active services?"

### AC #5: Cash Flow Tightening Prediction
- **Given** expenses growing faster than income
- **When** trend continues for 3+ months
- **Then** early warning: "Your savings rate has dropped from 22% to 15%. At current pace, you'll be at 0% by [date]."

### AC #6: Confidence Scoring
- **Given** predictions are generated
- **When** displaying
- **Then** include confidence indicator based on data quality:
  - High: 12+ months data, consistent patterns
  - Medium: 6-12 months data
  - Low: < 6 months data (flag as "early prediction")

---

## Technical Notes

- Create `src/lib/intelligence/pattern-recognition.ts`
- Use statistical methods: moving averages, trend detection, seasonality
- Run analysis daily or weekly (not real-time)

### Pattern Detection Algorithms
```typescript
// Seasonal pattern detection
function detectSeasonality(
  monthlyData: MonthlyAggregate[],
  minMonths: number = 12
): SeasonalPattern[] {
  if (monthlyData.length < minMonths) return [];
  
  // Group by month, compare year-over-year
  const byMonth = groupBy(monthlyData, d => d.month);
  
  return Object.entries(byMonth).map(([month, values]) => ({
    month: parseInt(month),
    averageSpend: mean(values.map(v => v.totalSpend)),
    deviation: standardDeviation(values.map(v => v.totalSpend)),
    isSignificant: values.length >= 2,
  }));
}

// Trend detection
function detectTrend(
  values: number[],
  windowSize: number = 3
): 'increasing' | 'decreasing' | 'stable' {
  const movingAvg = movingAverage(values, windowSize);
  const slope = linearRegression(movingAvg).slope;
  
  if (slope > 0.05) return 'increasing';
  if (slope < -0.05) return 'decreasing';
  return 'stable';
}
```

### Confidence Scoring
```typescript
function calculateConfidence(dataMonths: number): 'high' | 'medium' | 'low' {
  if (dataMonths >= 12) return 'high';
  if (dataMonths >= 6) return 'medium';
  return 'low';
}
```

### Insight Message Templates
```typescript
const predictiveTemplates = {
  seasonal: (month: string, amount: number) =>
    `Based on last year, you typically spend €${amount} more in ${month}. Consider setting aside extra now.`,
  billIncrease: (category: string, percentIncrease: number, projected: number) =>
    `Your ${category} bills have increased ${percentIncrease}% over 6 months. At this rate, expect €${projected}/month by summer.`,
  savingsRateDecline: (fromRate: number, toRate: number, zeroDate: string) =>
    `Your savings rate has dropped from ${fromRate}% to ${toRate}%. At current pace, you'll be at 0% by ${zeroDate}.`,
};
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/pattern-recognition.ts` | Create |
| `src/lib/intelligence/seasonal-analysis.ts` | Create |
| `src/lib/intelligence/insights.ts` | Modify (integrate predictive triggers) |

---

## Prerequisites

- Story 3.6: Monthly Aggregates (provides historical data)
- Story 3.1: Recurring Detection (provides subscription data)
- 12+ months of user data for best results

---

## Definition of Done

- [ ] Seasonal pattern detection works
- [ ] Proactive seasonal alerts generated
- [ ] Bill increase trends detected
- [ ] Subscription creep detection works
- [ ] Savings rate decline warning
- [ ] Confidence scoring implemented
- [ ] Unit tests for pattern algorithms
