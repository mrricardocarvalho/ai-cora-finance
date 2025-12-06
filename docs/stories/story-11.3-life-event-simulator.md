# Story 11.3: Major Life Event Simulator

**Status:** Approved
**Epic:** [Epic 11 - Comprehensive "What-If" Simulator](../epics/epic-11-what-if-simulator.md)
**Priority:** Medium
**Points:** 8

---

## User Story

**As a** User,
**I want** to model major life events and their financial impact,
**So that** I can make informed decisions about big life changes.

---

## Acceptance Criteria

### AC #1: Life Event Templates
- **Given** common major life events
- **When** selecting an event
- **Then** offer pre-built scenarios:
  - **Having a Baby**: +€400/month expenses, -1 income for X months (parental leave)
  - **Buying a House**: Down payment, mortgage payment, maintenance costs
  - **Getting Married**: Wedding cost, combined finances option
  - **Career Break**: X months without income
  - **Starting a Business**: Investment needed, variable income
  - **Moving Abroad**: Cost of living adjustment
  - **Early Retirement**: Stop income at date X

### AC #2: Customizable Parameters
- **Given** a life event template
- **When** user selects it
- **Then** allow customization:
  - Timing (when does it happen?)
  - Costs (adjust to actual expected values)
  - Duration (how long does impact last?)

### AC #3: Multi-Event Timeline
- **Given** life rarely has one change at a time
- **When** planning
- **Then** allow adding multiple events to a timeline:
  - "Buy house in 2025, have baby in 2026, one parent part-time in 2027"

### AC #4: Impact Summary
- **Given** events are modeled
- **When** showing results
- **Then** display:
  - "This plan delays your FIRE date by 3 years"
  - "You'll need €15,000 more in emergency fund"
  - "Your net worth in 2030: €X (vs €Y without events)"

### AC #5: Feasibility Check
- **Given** the scenario is calculated
- **When** results show
- **Then** flag risks:
  - "⚠️ Your emergency fund would be depleted during month 8"
  - "⚠️ You'd need to reduce savings rate to 5% to afford this"

---

## Technical Notes

- Create life event templates with default values
- Allow chaining events on a timeline
- Show clear warnings for risky scenarios

### Life Event Templates
```typescript
const lifeEventTemplates = {
  baby: {
    name: 'Having a Baby',
    modifications: [
      { type: 'expense', value: 400, startMonth: 0, description: 'Child expenses' },
      { type: 'income', multiplier: 0.5, startMonth: 0, endMonth: 4, description: 'Parental leave' },
    ],
    customizable: ['expenseAmount', 'leaveMonths'],
  },
  house: {
    name: 'Buying a House',
    modifications: [
      { type: 'one_time_expense', value: 50000, startMonth: 0, description: 'Down payment' },
      { type: 'expense', value: 800, startMonth: 0, description: 'Mortgage payment' },
    ],
    customizable: ['downPayment', 'mortgageAmount'],
  },
  // ... more templates
};
```

### Timeline Visualization
```
Timeline
│
├── 2025 Jan ─── Buy House (€50k down, +€800/mo)
│
├── 2026 Mar ─── Have Baby (+€400/mo, -50% income 4mo)
│
└── 2027 Sep ─── Partner Part-time (-€500/mo income)

Impact: FIRE delayed 3.5 years | Net worth in 2030: €180k
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/planning/life-events.ts` | Create |
| `src/components/planning/LifeEventSimulator.tsx` | Create |
| `src/components/planning/EventTimeline.tsx` | Create |
| `src/app/(dashboard)/planning/scenarios/life-events/page.tsx` | Create |

---

## Prerequisites

- Story 11.1: Unified Scenario Engine (provides calculation logic)

---

## Definition of Done

- [ ] 7 life event templates defined
- [ ] Parameters customizable per event
- [ ] Multi-event timeline works
- [ ] Impact summary accurate
- [ ] Risk warnings display correctly
- [ ] Timeline visualization renders
- [ ] Mobile responsive
- [ ] Bilingual event names/descriptions
