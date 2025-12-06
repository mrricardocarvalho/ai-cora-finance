# Epic 7: Advanced Intelligence & Forecasting

**Goal:** Extend Cora's proactive intelligence with anomaly detection, cash flow forecasting, and smarter spending analysis to prevent financial surprises before they happen.

**Prerequisites:** Epic 3 complete (Insight Engine, Recurring Detection, Safe-to-Spend).

**Business Value:** Users get warned about unusual spending patterns and can see into the future of their cash flow, reducing financial anxiety and preventing overdrafts.

---

## Stories

### Story 7.1: Spending Anomaly Detection Engine

**As a** User,
**I want** Cora to alert me when a recurring expense is significantly higher than usual,
**So that** I can catch billing errors, rate increases, or unusual consumption before they drain my account.

**Acceptance Criteria:**

**AC #1: Historical Baseline Calculation**
- **Given** a user has at least 3 months of transaction history for a merchant/category
- **When** the system analyzes recurring transactions
- **Then** it calculates a rolling average and standard deviation for that expense

**AC #2: Anomaly Detection Trigger**
- **Given** a new transaction is imported or added
- **When** the amount exceeds the historical average by more than 30% (configurable threshold)
- **Then** the system generates an `anomaly` type insight

**AC #3: Insight Content Quality**
- **Given** an anomaly is detected for "EDP Comercial" (electricity)
- **When** the insight is generated
- **Then** it includes:
  - Merchant/category name
  - Current amount vs average ("€87.50 vs usual €62.30")
  - Percentage difference ("+40%")
  - Historical context ("This is your highest electricity bill in 6 months")

**AC #4: Category-Level Anomalies**
- **Given** a user's "Dining Out" category spending in a month
- **When** total spending exceeds the 3-month average by 50%+
- **Then** generate a category-level anomaly insight ("You've spent 50% more on dining this month")

**AC #5: Smart Filtering**
- **Given** a one-time large purchase (e.g., annual insurance)
- **When** it matches a known annual pattern
- **Then** do NOT flag it as anomaly (use recurring pattern detection to identify annual bills)

**Technical Notes:**
- Create `anomaly_baselines` table or compute on-the-fly from `transactions`
- Add `detectAnomalies` function in `src/lib/intelligence/anomaly.ts`
- Integrate with Insight Engine (Epic 3) to generate insights
- Consider merchant name normalization (e.g., "EDP*COMERCIAL" → "EDP")

**Files to Create/Modify:**
- `src/lib/intelligence/anomaly.ts` (new)
- `src/lib/intelligence/insights.ts` (integrate anomaly triggers)
- `db/migrations/00XX_anomaly_baselines.sql` (optional, for caching)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 7.2: Cash Flow Forecasting Engine

**As a** User,
**I want** to see a projection of my account balance for the next 30 days,
**So that** I can anticipate when I might run low and plan accordingly.

**Acceptance Criteria:**

**AC #1: Recurring Bill Projection**
- **Given** the system has detected recurring patterns (from Epic 3)
- **When** calculating the forecast
- **Then** it schedules expected debits based on historical dates (e.g., Netflix on the 15th, rent on the 1st)

**AC #2: Income Projection**
- **Given** the user has regular income deposits (salary)
- **When** calculating the forecast
- **Then** it includes expected income based on historical patterns

**AC #3: Daily Balance Projection**
- **Given** current balance of €2,500 and recurring expenses of €1,800 over next 30 days
- **When** the forecast is calculated
- **Then** it returns an array of daily projected balances: `[{ date, projectedBalance, events: [] }]`

**AC #4: Floor Crossing Alert**
- **Given** user's comfort floor is €500
- **When** the projected balance drops below €500 at any point in the next 30 days
- **Then** generate a `warning` insight: "At current pace, you'll hit your comfort floor on December 18th"

**AC #5: Confidence Indicator**
- **Given** limited historical data (< 3 months)
- **When** displaying the forecast
- **Then** show a "Low Confidence" indicator explaining predictions improve with more data

**AC #6: What-If Exclusion**
- **Given** a user wants to see impact of a large purchase
- **When** they input a hypothetical expense (e.g., "€500 on Dec 10")
- **Then** the forecast recalculates showing the adjusted trajectory

**Technical Notes:**
- Create `calculateCashFlowForecast(userId, days = 30)` in `src/lib/intelligence/forecast.ts`
- Use `recurring_patterns` table for scheduled bills
- Return data structure suitable for line chart visualization
- Consider edge cases: variable income, irregular patterns

**Files to Create/Modify:**
- `src/lib/intelligence/forecast.ts` (new)
- `src/lib/intelligence/insights.ts` (add floor-crossing trigger)
- `src/app/api/intelligence/forecast/route.ts` (new API endpoint)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 7.3: Cash Flow Forecast UI

**As a** User,
**I want** to see my cash flow forecast visually on the dashboard,
**So that** I can quickly understand my financial trajectory.

**Acceptance Criteria:**

**AC #1: Forecast Chart Component**
- **Given** the user is on the Dashboard or Home page
- **When** the page loads
- **Then** display a line chart showing projected balance over the next 30 days

**AC #2: Visual Elements**
- **Given** the chart is rendered
- **When** the user views it
- **Then** it shows:
  - Current balance as starting point (solid line for past, dashed for future)
  - Comfort floor as a horizontal red dashed line
  - Projected balance line (green if stays above floor, transitions to orange/red as it approaches)
  - Key events as dots/markers (payday, large bills)

**AC #3: Interactive Tooltips**
- **Given** the user hovers over a point on the forecast line
- **When** the tooltip appears
- **Then** it shows: date, projected balance, and any scheduled events for that day

**AC #4: Floor Warning Highlight**
- **Given** the projection crosses below the comfort floor
- **When** displaying the chart
- **Then** highlight the danger zone with a red shaded area and show the specific date

**AC #5: Mobile Responsive**
- **Given** the user is on mobile
- **When** viewing the forecast
- **Then** show a simplified view (weekly instead of daily, or summary card with key dates)

**AC #6: "Days Until Floor" Metric**
- **Given** the forecast predicts hitting the floor
- **When** displayed
- **Then** show prominently: "14 days until comfort floor" with the specific date

**Technical Notes:**
- Use Recharts (already in project) for visualization
- Create `CashFlowForecastChart` component
- Integrate with Dashboard layout
- Consider skeleton loading state while forecast calculates

**Files to Create/Modify:**
- `src/components/dashboard/CashFlowForecastChart.tsx` (new)
- `src/app/(dashboard)/page.tsx` or `src/app/(dashboard)/dashboard/page.tsx` (integrate)
- `src/lib/i18n/translations.ts` (add forecast-related strings)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 7.4: Diversification Analysis & Recommendations

**As a** User,
**I want** Cora to analyze my investment portfolio concentration and suggest improvements,
**So that** I don't unknowingly take on excessive risk.

**Acceptance Criteria:**

**AC #1: Concentration Detection**
- **Given** a user's portfolio with holdings
- **When** any single asset exceeds 25% of total portfolio value
- **Then** flag as "concentrated" risk

**AC #2: Sector/Type Analysis**
- **Given** portfolio holdings with asset types (ETF, Stock, Crypto, Bond)
- **When** analyzing diversification
- **Then** calculate allocation percentages by type and identify imbalances

**AC #3: Geographic Diversification (Stretch)**
- **Given** assets have region metadata (US, EU, Emerging Markets)
- **When** analyzing diversification
- **Then** show geographic allocation (requires asset metadata enhancement)

**AC #4: Insight Generation**
- **Given** portfolio is 60% in a single ETF (e.g., VWCE)
- **When** insight engine runs
- **Then** generate `opportunity` insight: "Your portfolio is 60% concentrated in VWCE. Consider diversifying to reduce single-asset risk."

**AC #5: Risk Score**
- **Given** portfolio analysis is complete
- **When** displayed on Portfolio page
- **Then** show a simple risk indicator:
  - 🟢 Well Diversified (no asset > 25%, multiple types)
  - 🟡 Moderate Concentration (one asset 25-40%)
  - 🔴 High Concentration (one asset > 40% or single type > 80%)

**AC #6: Educational Context**
- **Given** a diversification insight is shown
- **When** user taps "Learn More"
- **Then** show explanation of why diversification matters (micro-lesson hook)

**Technical Notes:**
- Create `analyzeDiversification(userId)` in `src/lib/intelligence/portfolio-analysis.ts`
- Extend `assets` table with `asset_type` enum if not present (ETF, Stock, Bond, Crypto, Cash)
- Integrate with Insight Engine for proactive recommendations

**Files to Create/Modify:**
- `src/lib/intelligence/portfolio-analysis.ts` (new)
- `src/components/portfolio/DiversificationCard.tsx` (new)
- `src/app/(dashboard)/portfolio/page.tsx` (integrate card)
- `src/lib/intelligence/insights.ts` (add diversification trigger)

**Estimated Effort:** 5 points (1-2 days)

---

## Epic Summary

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| 7.1 | Spending Anomaly Detection Engine | 5 | High |
| 7.2 | Cash Flow Forecasting Engine | 8 | High |
| 7.3 | Cash Flow Forecast UI | 5 | High |
| 7.4 | Diversification Analysis & Recommendations | 5 | Medium |

**Total Points:** 23
**Estimated Timeline:** 1-2 weeks

---

## Success Metrics

- [ ] Anomaly detection catches at least 1 unusual bill per quarter
- [ ] Cash flow forecast accuracy within 10% for 7-day predictions
- [ ] Users report reduced financial surprises
- [ ] Portfolio risk visibility improves investment confidence
