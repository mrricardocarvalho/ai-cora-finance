# Story 10.1: Interactive Extra Payment Simulator

**Epic:** [Epic 10 - Debt Optimization & Simulation](../epics/epic-10-debt-optimization.md)
**Priority:** High
**Points:** 8
**Status:** Completed

---

## User Story

**As a** User,
**I want** to see exactly how extra payments affect my debt payoff timeline,
**So that** I can decide whether to put extra money toward debt or investments.

---

## Acceptance Criteria

### AC #1: Simulator Interface
- **Given** user has debts in the system
- **When** navigating to Debt section
- **Then** show an "Extra Payment Simulator" card/section

### AC #2: Input Controls
- **Given** the simulator is displayed
- **When** user interacts
- **Then** provide:
  - Slider or input for "Extra monthly payment" (€0 - €500+)
  - Toggle to apply extra to: "Highest Interest First" or "Smallest Balance First" or "Specific Debt"
  - Optional: One-time lump sum input

### AC #3: Real-Time Calculation
- **Given** user adjusts the extra payment slider to €100
- **When** calculation runs
- **Then** show immediately (no page reload):
  - New payoff date vs current payoff date
  - Total interest saved
  - Months saved
  - Side-by-side comparison visualization

### AC #4: Visualization
- **Given** results are calculated
- **When** displayed
- **Then** show:
  - Two timeline bars: "Current Path" vs "With Extra Payments"
  - Debt balance over time chart (both scenarios)
  - Interest paid comparison (bar chart)

### AC #5: Per-Debt Breakdown
- **Given** user has multiple debts
- **When** viewing results
- **Then** show table with each debt:
  | Debt | Current Payoff | New Payoff | Interest Saved |
  |------|----------------|------------|----------------|
  | Card A | Dec 2026 | Aug 2026 | €340 |
  | Loan B | Jan 2028 | Sep 2027 | €580 |

### AC #6: Save Scenario
- **Given** user finds a plan they like
- **When** they click "Set as Goal" or "Save Plan"
- **Then** save as a target and track progress against it

---

## Technical Notes

- Extend `src/lib/planning/debt.ts` with `simulateExtraPayments(debts, extraMonthly, strategy)`
- Return month-by-month projection for charting
- Consider Web Worker for complex calculations if slow

### Simulation Function
```typescript
interface ExtraPaymentSimulation {
  originalPayoffDate: Date;
  newPayoffDate: Date;
  totalInterestSaved: number;
  monthsSaved: number;
  monthlyProjection: MonthlyDebtSnapshot[];
  perDebtBreakdown: DebtPayoffComparison[];
}

function simulateExtraPayments(
  debts: Debt[],
  extraMonthly: number,
  strategy: 'avalanche' | 'snowball' | 'specific',
  specificDebtId?: string
): ExtraPaymentSimulation;
```

### Amortization Formula
```typescript
// Monthly payment for amortizing loan
const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
// Where P = principal, r = monthly rate, n = months
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/planning/debt-simulator.ts` | Create |
| `src/components/planning/ExtraPaymentSimulator.tsx` | Create |
| `src/components/planning/DebtComparisonChart.tsx` | Create |
| `src/app/(dashboard)/planning/debt/page.tsx` | Modify (integrate) |

---

## Prerequisites

- Story 5.1: Debt Data (provides debt records)
- Story 5.2: Debt Engine (provides basic calculations)

---

## Definition of Done

- [ ] Simulator UI with slider/input controls
- [ ] Strategy toggle (Avalanche/Snowball/Specific)
- [ ] Real-time calculation updates
- [ ] Comparison visualization renders
- [ ] Per-debt breakdown table
- [ ] Save plan functionality
- [ ] Mobile responsive
- [ ] Unit tests for simulation math
