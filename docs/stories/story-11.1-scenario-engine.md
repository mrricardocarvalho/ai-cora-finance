# Story 11.1: Unified Scenario Engine

**Epic:** [Epic 11 - Comprehensive "What-If" Simulator](../epics/epic-11-what-if-simulator.md)
**Priority:** High
**Points:** 8

---

## User Story

**As a** Developer,
**I want** a reusable scenario simulation engine,
**So that** all "what-if" features share consistent logic.

---

## Acceptance Criteria

### AC #1: Scenario Data Model
- **Given** the need to model financial futures
- **When** designing the engine
- **Then** create a scenario structure:
  ```typescript
  interface Scenario {
    id: string;
    name: string;
    baselineDate: Date;
    modifications: ScenarioModification[];
    projectionMonths: number; // Default 60 (5 years)
  }
  
  interface ScenarioModification {
    type: 'income' | 'expense' | 'savings_rate' | 'investment_return' | 
          'one_time_expense' | 'one_time_income' | 'debt_payoff' | 'goal_change';
    value: number;
    startMonth?: number;
    endMonth?: number;
    description: string;
  }
  ```

### AC #2: Projection Calculation
- **Given** a scenario with modifications
- **When** calculating projection
- **Then** return month-by-month data:
  - Net worth projection
  - Savings progression
  - Debt balance progression
  - Goal completion dates
  - FIRE date impact

### AC #3: Baseline from Actual Data
- **Given** user's current financial data
- **When** creating a scenario
- **Then** baseline uses:
  - Current net worth
  - Average monthly income (last 3 months)
  - Average monthly expenses (last 3 months)
  - Current savings rate
  - Current debts and interest rates

### AC #4: Comparison Output
- **Given** baseline and modified scenarios
- **When** comparing
- **Then** return:
  - Delta in FIRE date (months earlier/later)
  - Delta in net worth at projection end
  - Delta in goal completion dates
  - Key milestones affected

---

## Tasks/Subtasks

- [x] Define Scenario and Baseline Types (`src/lib/planning/types.ts`) <!-- id: 1 -->
- [x] Implement Baseline Extraction Logic (`src/lib/planning/scenario-engine.ts`) <!-- id: 2 -->
- [x] Implement Projection Calculation Engine (`src/lib/planning/scenario-engine.ts`) <!-- id: 3 -->
- [x] Implement Scenario Comparison Logic (`src/lib/planning/scenario-engine.ts`) <!-- id: 4 -->
- [x] Create Unit Tests (`src/lib/planning/scenario-engine.test.ts`) <!-- id: 5 -->

---

## File List

- src/lib/planning/types.ts
- src/lib/planning/scenario-engine.ts
- src/lib/planning/scenario-engine.test.ts

---

## Dev Agent Record

### Debug Log
- Initialized tasks based on ACs.
- Implemented types, engine, and tests.
- Verified with unit tests.

### Completion Notes
- Implemented the core Scenario Engine as a reusable library.
- Supports income/expense modifications, one-time events, and debt payoff projection.
- Includes `extractBaseline` to pull real user data from Supabase.
- Includes `calculateScenario` for month-by-month projection.
- Includes `compareScenarios` for delta analysis.
- Unit tests cover key scenarios.

---

## Technical Notes

- Create `src/lib/planning/scenario-engine.ts`
- Pure functions for testability
- Consider memoization for repeated calculations

### Core Engine Interface
```typescript
interface ScenarioProjection {
  months: MonthlySnapshot[];
  fireDate: Date | null;
  goalCompletions: Map<string, Date>;
  endNetWorth: number;
}

interface MonthlySnapshot {
  month: number; // 0-based from baseline
  date: Date;
  netWorth: number;
  savings: number;
  debt: number;
  investmentValue: number;
}

function calculateScenario(
  baseline: FinancialBaseline,
  modifications: ScenarioModification[],
  projectionMonths: number
): ScenarioProjection;

function compareScenarios(
  baseline: ScenarioProjection,
  modified: ScenarioProjection
): ScenarioComparison;
```

### Baseline Extraction
```typescript
interface FinancialBaseline {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  debts: DebtBaseline[];
  investments: number;
  goals: GoalBaseline[];
}

async function extractBaseline(userId: string): Promise<FinancialBaseline>;
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/planning/scenario-engine.ts` | Create |
| `src/lib/planning/types.ts` | Create |
| `src/lib/planning/scenario-engine.test.ts` | Create |

---

## Prerequisites

- Story 3.6: Monthly Aggregates (provides historical averages)
- Story 5.1: Debt Data (provides debt info)
- Story 5.6: FIRE Projection (provides FIRE calculation logic)

---

## Definition of Done

- [x] Scenario and Modification types defined
- [x] Baseline extraction from user data
- [x] Month-by-month projection calculation
- [x] FIRE date impact calculation
- [x] Goal completion date impact
- [x] Scenario comparison function
- [x] Pure functions with no side effects
- [x] Comprehensive unit tests

## Status
review
