# Story 7.3: Cash Flow Forecast UI

**Status:** Completed
**Epic:** [Epic 7 - Advanced Intelligence & Forecasting](../epics/epic-7-advanced-intelligence.md)
**Priority:** High
**Points:** 5

---

## User Story

**As a** User,
**I want** to see my cash flow forecast visually on the dashboard,
**So that** I can quickly understand my financial trajectory.

---

## Acceptance Criteria

### AC #1: Forecast Chart Component
- **Given** the user is on the Dashboard or Home page
- **When** the page loads
- **Then** display a line chart showing projected balance over the next 30 days

### AC #2: Visual Elements
- **Given** the chart is rendered
- **When** the user views it
- **Then** it shows:
  - Current balance as starting point (solid line for past, dashed for future)
  - Comfort floor as a horizontal red dashed line
  - Projected balance line (green if stays above floor, transitions to orange/red as it approaches)
  - Key events as dots/markers (payday, large bills)

### AC #3: Interactive Tooltips
- **Given** the user hovers over a point on the forecast line
- **When** the tooltip appears
- **Then** it shows: date, projected balance, and any scheduled events for that day

### AC #4: Floor Warning Highlight
- **Given** the projection crosses below the comfort floor
- **When** displaying the chart
- **Then** highlight the danger zone with a red shaded area and show the specific date

### AC #5: Mobile Responsive
- **Given** the user is on mobile
- **When** viewing the forecast
- **Then** show a simplified view (weekly instead of daily, or summary card with key dates)

### AC #6: "Days Until Floor" Metric
- **Given** the forecast predicts hitting the floor
- **When** displayed
- **Then** show prominently: "14 days until comfort floor" with the specific date

---

## Technical Notes

- Use Recharts (already in project) for visualization
- Create `CashFlowForecastChart` component
- Integrate with Dashboard layout
- Consider skeleton loading state while forecast calculates

### Chart Configuration
```typescript
// Color scheme
const colors = {
  projectedLine: '#22c55e', // green-500 (healthy)
  warningLine: '#f59e0b', // amber-500 (approaching floor)
  dangerLine: '#ef4444', // red-500 (below floor)
  floorLine: '#ef4444', // dashed red
  dangerZone: 'rgba(239, 68, 68, 0.1)', // red background
};
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/dashboard/CashFlowForecastChart.tsx` | Create |
| `src/app/(dashboard)/page.tsx` or dashboard route | Modify (integrate chart) |
| `src/lib/i18n/translations.ts` | Modify (add forecast strings) |

---

## Prerequisites

- Story 7.2: Cash Flow Forecasting Engine (provides data)

---

## Definition of Done

- [ ] Forecast chart renders on dashboard
- [ ] Line shows projected balance with appropriate colors
- [ ] Comfort floor line is visible
- [ ] Tooltips show date, balance, and events
- [ ] Danger zone highlighted when floor is crossed
- [ ] Mobile-responsive design implemented
- [ ] "Days until floor" metric visible when applicable
- [ ] Loading state with skeleton
- [ ] Translations for PT-PT and EN-US
