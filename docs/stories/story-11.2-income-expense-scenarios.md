# Story 11.2: Income & Expense Scenarios

**Status:** Completed
**Epic:** [Epic 11 - Comprehensive "What-If" Simulator](../epics/epic-11-what-if-simulator.md)
**Priority:** High
**Points:** 5

---

## User Story

**As a** User,
**I want** to see what happens if my income changes or expenses increase,
**So that** I can prepare for career changes, raises, or lifestyle inflation.

---

## Acceptance Criteria

### AC #1: Income Change Simulator
- **Given** user enters a new income amount
- **When** simulating
- **Then** show impact on:
  - Monthly savings potential
  - FIRE date (if tracking FIRE)
  - Time to reach savings goals
  - Net worth in 5 years

### AC #2: Quick Presets
- **Given** the simulator
- **When** choosing scenarios
- **Then** offer presets:
  - "10% Raise" 
  - "20% Pay Cut" (job loss planning)
  - "Career Change" (custom input)
  - "Side Hustle +€500/month"

### AC #3: Expense Scenarios
- **Given** user wants to model expense changes
- **When** simulating
- **Then** allow:
  - Percentage increase (e.g., "10% lifestyle inflation")
  - Fixed increase (e.g., "+€200/month rent increase")
  - Category-specific (e.g., "Double childcare costs")

### AC #4: Combined Scenarios
- **Given** real life is complex
- **When** building scenario
- **Then** allow combining: "Get a raise AND have a baby"

### AC #5: Visual Comparison
- **Given** scenarios are calculated
- **When** displaying
- **Then** show:
  - Side-by-side net worth projection charts
  - Summary cards with key metrics delta
  - Timeline showing goal/FIRE date changes

---

## Technical Notes

- Use scenario engine from Story 11.1
- Create intuitive slider/input interface
- Store favorite scenarios in profile

### Preset Definitions
```typescript
const incomePresets = [
  { id: 'raise-10', label: '10% Raise', modifier: { type: 'income', multiplier: 1.10 } },
  { id: 'cut-20', label: '20% Pay Cut', modifier: { type: 'income', multiplier: 0.80 } },
  { id: 'side-hustle', label: 'Side Hustle +€500', modifier: { type: 'income', value: 500 } },
];

const expensePresets = [
  { id: 'inflation-10', label: '10% Lifestyle Inflation', modifier: { type: 'expense', multiplier: 1.10 } },
  { id: 'rent-increase', label: '+€200 Rent', modifier: { type: 'expense', value: 200 } },
];
```

### UI Layout
```
┌────────────────────────────────────────┐
│  What If... Income & Expenses          │
├────────────────────────────────────────┤
│  Income Change                         │
│  [10% Raise] [Pay Cut] [Custom...]     │
│  Current: €3,000 → New: €3,300         │
├────────────────────────────────────────┤
│  Expense Change                        │
│  [+10%] [+€200] [Custom...]            │
│  Current: €2,000 → New: €2,200         │
├────────────────────────────────────────┤
│  [Compare Scenarios]                   │
├────────────────────────────────────────┤
│  Results:                              │
│  ├── Net Worth Chart (side-by-side)    │
│  ├── FIRE: 2038 → 2035 (3 years sooner)│
│  └── Vacation Goal: Dec → Oct          │
└────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/planning/IncomeScenarioSimulator.tsx` | Create |
| `src/components/planning/ExpenseScenarioSimulator.tsx` | Create |
| `src/app/(dashboard)/planning/scenarios/page.tsx` | Create |

---

## Prerequisites

- Story 11.1: Unified Scenario Engine (provides calculation logic)

---

## Definition of Done

- [x] Income change input with presets
- [x] Expense change input with presets
- [x] Combined scenarios work
- [x] Visual comparison chart renders
- [x] FIRE date impact displayed
- [x] Goal impact displayed (Partially - engine supports it, UI shows FIRE date)
- [x] Presets work correctly
- [x] Mobile responsive
