# Story 11.5: FIRE "What-If" Enhancement

**Status:** Approved
**Epic:** [Epic 11 - Comprehensive "What-If" Simulator](../epics/epic-11-what-if-simulator.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** to explore different paths to FIRE,
**So that** I can find a plan that balances lifestyle and retirement timing.

---

## Acceptance Criteria

### AC #1: Multi-Variable Sliders
- **Given** the FIRE projection page
- **When** exploring scenarios
- **Then** provide interactive sliders for:
  - Monthly savings amount
  - Expected investment return (conservative/moderate/aggressive)
  - Target annual spending in retirement
  - Withdrawal rate (3% / 3.5% / 4% / 4.5%)

### AC #2: Real-Time Projection
- **Given** sliders are adjusted
- **When** values change
- **Then** immediately update:
  - FIRE date
  - Required portfolio size (FI Number)
  - Years to FIRE
  - Monthly savings needed to hit target date

### AC #3: Comparison View
- **Given** user wants to compare paths
- **When** selecting comparison mode
- **Then** show up to 3 scenarios side-by-side:
  - "Coast FIRE" (save heavily now, coast later)
  - "Barista FIRE" (part-time income after)
  - "Full FIRE" (complete financial independence)

### AC #4: Coast FIRE Calculator
- **Given** Coast FIRE concept
- **When** calculating
- **Then** show:
  - "At €150,000 invested, you could stop saving and retire at 65"
  - "You'll reach Coast FIRE in X years at current savings rate"

### AC #5: Sensitivity Analysis
- **Given** uncertainty in assumptions
- **When** showing projections
- **Then** display range:
  - Pessimistic (5% returns): FIRE in 18 years
  - Expected (7% returns): FIRE in 14 years
  - Optimistic (9% returns): FIRE in 11 years

### AC #6: Save Scenarios
- **Given** user finds a preferred path
- **When** they click "Save This Plan"
- **Then** store and track progress against it

---

## Technical Notes

- Enhance existing FIRE calculator with multi-variable inputs
- Add scenario comparison feature
- Store preferred scenario for progress tracking

### FIRE Calculation Types
```typescript
type FIREType = 'full' | 'coast' | 'barista';

interface FIREScenario {
  type: FIREType;
  monthlySavings: number;
  expectedReturn: number;
  withdrawalRate: number;
  targetAnnualSpending: number;
  partTimeIncome?: number; // for barista FIRE
}

interface FIREProjection {
  fireDate: Date;
  yearsToFire: number;
  requiredPortfolio: number;
  coastFireNumber?: number;
  coastFireDate?: Date;
}
```

### Sensitivity Ranges
```typescript
const returnScenarios = {
  pessimistic: 0.05,
  expected: 0.07,
  optimistic: 0.09,
};

function calculateSensitivity(scenario: FIREScenario): {
  pessimistic: FIREProjection;
  expected: FIREProjection;
  optimistic: FIREProjection;
};
```

### Coast FIRE Formula
```typescript
// Coast FIRE = amount needed now that will grow to FIRE number by retirement age
function calculateCoastFIRE(
  targetFireNumber: number,
  yearsUntilTraditionalRetirement: number,
  expectedReturn: number
): number {
  return targetFireNumber / Math.pow(1 + expectedReturn, yearsUntilTraditionalRetirement);
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/planning/fire.ts` | Modify (enhance calculations) |
| `src/components/planning/fire-simulator.tsx` | Modify (add sliders) |
| `src/components/planning/FIREScenarioComparison.tsx` | Create |
| `src/components/planning/SensitivityChart.tsx` | Create |

---

## Prerequisites

- Story 5.6: FIRE Projection (provides basic FIRE logic)
- Story 11.1: Unified Scenario Engine (provides comparison framework)

---

## Definition of Done

- [ ] Multi-variable sliders implemented
- [ ] Real-time projection updates
- [ ] 3-scenario comparison view
- [ ] Coast FIRE calculation works
- [ ] Sensitivity analysis with 3 return levels
- [ ] Save scenario functionality
- [ ] Mobile responsive
- [ ] Bilingual labels
