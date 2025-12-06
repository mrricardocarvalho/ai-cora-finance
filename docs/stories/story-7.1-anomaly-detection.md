# Story 7.1: Spending Anomaly Detection Engine

**Status:** Completed
**Epic:** [Epic 7 - Advanced Intelligence & Forecasting](../epics/epic-7-advanced-intelligence.md)
**Priority:** High
**Points:** 5

---

## User Story

**As a** User,
**I want** Cora to alert me when a recurring expense is significantly higher than usual,
**So that** I can catch billing errors, rate increases, or unusual consumption before they drain my account.

---

## Acceptance Criteria

### AC #1: Historical Baseline Calculation
- **Given** a user has at least 3 months of transaction history for a merchant/category
- **When** the system analyzes recurring transactions
- **Then** it calculates a rolling average and standard deviation for that expense

### AC #2: Anomaly Detection Trigger
- **Given** a new transaction is imported or added
- **When** the amount exceeds the historical average by more than 30% (configurable threshold)
- **Then** the system generates an `anomaly` type insight

### AC #3: Insight Content Quality
- **Given** an anomaly is detected for "EDP Comercial" (electricity)
- **When** the insight is generated
- **Then** it includes:
  - Merchant/category name
  - Current amount vs average ("€87.50 vs usual €62.30")
  - Percentage difference ("+40%")
  - Historical context ("This is your highest electricity bill in 6 months")

### AC #4: Category-Level Anomalies
- **Given** a user's "Dining Out" category spending in a month
- **When** total spending exceeds the 3-month average by 50%+
- **Then** generate a category-level anomaly insight ("You've spent 50% more on dining this month")

### AC #5: Smart Filtering
- **Given** a one-time large purchase (e.g., annual insurance)
- **When** it matches a known annual pattern
- **Then** do NOT flag it as anomaly (use recurring pattern detection to identify annual bills)

---

## Technical Notes

- Create `anomaly_baselines` table or compute on-the-fly from `transactions`
- Add `detectAnomalies` function in `src/lib/intelligence/anomaly.ts`
- Integrate with Insight Engine (Epic 3) to generate insights
- Consider merchant name normalization (e.g., "EDP*COMERCIAL" → "EDP")

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/anomaly.ts` | Create |
| `src/lib/intelligence/insights.ts` | Modify (integrate anomaly triggers) |
| `db/migrations/00XX_anomaly_baselines.sql` | Create (optional, for caching) |

---

## Prerequisites

- Story 3.1: Recurring Detection (provides pattern data)
- Story 3.4: Insight Engine (provides insight generation framework)

---

## Definition of Done

- [ ] Anomaly detection calculates baselines from 3+ months of data
- [ ] Anomalies are generated when spending exceeds 30% threshold
- [ ] Insights include clear context (amount, percentage, historical comparison)
- [ ] Category-level anomalies work for monthly totals
- [ ] Annual patterns are excluded from anomaly detection
- [ ] Unit tests for anomaly calculation logic
- [ ] Integration with Insight Feed
