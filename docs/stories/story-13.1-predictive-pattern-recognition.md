# Story 13.1: Predictive Pattern Recognition

**As a** System,
**I want** to identify patterns and predict future financial events,
**So that** Cora can proactively alert users before things happen.

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

## Technical Notes
- Create `src/lib/intelligence/pattern-recognition.ts`
- Use statistical methods: moving averages, trend detection, seasonality
- Run analysis daily or weekly (not real-time)

## Tasks/Subtasks
- [x] Create `src/lib/intelligence/pattern-recognition.ts` (Core logic) <!-- id: 1 -->
- [x] Implement Seasonal Spending Detection (AC #1) <!-- id: 2 -->
- [x] Implement Bill Trend Analysis (AC #3) <!-- id: 3 -->
- [x] Implement Subscription Creep Detection (AC #4) <!-- id: 4 -->
- [x] Implement Cash Flow Prediction (AC #5) <!-- id: 5 -->
- [x] Integrate with Insights Engine (`src/lib/intelligence/insights.ts`) <!-- id: 6 -->
- [x] Create Unit Tests for Pattern Recognition <!-- id: 7 -->

## Dev Agent Record

### Debug Log
- [x] Initial plan created
- [x] Implemented core logic and all analysis functions in `pattern-recognition.ts`
- [x] Integrated with `insights.ts`
- [x] Verified with unit tests

### Completion Notes
Implemented the Predictive Pattern Recognition engine with 4 key analysis types:
1. **Seasonality**: Detects month-over-month spending spikes based on historical data.
2. **Bill Trends**: Identifies increasing trends in utility/recurring bills.
3. **Subscription Creep**: Alerts on recently added recurring commitments.
4. **Cash Flow**: Warns when savings rate is declining and drops below 15%.

All analyses are integrated into the main `generateInsights` flow and will produce `info`, `warning`, or `urgent` insights based on severity.

## File List
- src/lib/intelligence/pattern-recognition.ts
- src/lib/intelligence/pattern-recognition.test.ts
- src/lib/intelligence/insights.ts

## Change Log
- 2025-12-06: Initial implementation of Story 13.1

## Status
Status: Completed
