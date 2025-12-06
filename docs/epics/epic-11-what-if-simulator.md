# Epic 11: Comprehensive "What-If" Simulator

**Goal:** Build a powerful scenario planning tool that lets users model different financial futures and see the impact of major life decisions.

**Prerequisites:** Epic 3 (Monthly data), Epic 5 (FIRE, Goals), Epic 10 (Debt simulator).

**Business Value:** Users can make confident decisions about major life choices (career changes, big purchases, early retirement) by seeing the projected financial impact before committing.

---

## Stories

### Story 11.1: Unified Scenario Engine

**As a** Developer,
**I want** a reusable scenario simulation engine,
**So that** all "what-if" features share consistent logic.

**Acceptance Criteria:**

**AC #1: Scenario Data Model**
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

**AC #2: Projection Calculation**
- **Given** a scenario with modifications
- **When** calculating projection
- **Then** return month-by-month data:
  - Net worth projection
  - Savings progression
  - Debt balance progression
  - Goal completion dates
  - FIRE date impact

**AC #3: Baseline from Actual Data**
- **Given** user's current financial data
- **When** creating a scenario
- **Then** baseline uses:
  - Current net worth
  - Average monthly income (last 3 months)
  - Average monthly expenses (last 3 months)
  - Current savings rate
  - Current debts and interest rates

**AC #4: Comparison Output**
- **Given** baseline and modified scenarios
- **When** comparing
- **Then** return:
  - Delta in FIRE date (months earlier/later)
  - Delta in net worth at projection end
  - Delta in goal completion dates
  - Key milestones affected

**Technical Notes:**
- Create `src/lib/planning/scenario-engine.ts`
- Pure functions for testability
- Consider memoization for repeated calculations

**Files to Create/Modify:**
- `src/lib/planning/scenario-engine.ts` (new)
- `src/lib/planning/types.ts` (new - shared types)
- Unit tests for scenario calculations

**Estimated Effort:** 8 points (2-3 days)

---

### Story 11.2: Income & Expense Scenarios

**As a** User,
**I want** to see what happens if my income changes or expenses increase,
**So that** I can prepare for career changes, raises, or lifestyle inflation.

**Acceptance Criteria:**

**AC #1: Income Change Simulator**
- **Given** user enters a new income amount
- **When** simulating
- **Then** show impact on:
  - Monthly savings potential
  - FIRE date (if tracking FIRE)
  - Time to reach savings goals
  - Net worth in 5 years

**AC #2: Quick Presets**
- **Given** the simulator
- **When** choosing scenarios
- **Then** offer presets:
  - "10% Raise" 
  - "20% Pay Cut" (job loss planning)
  - "Career Change" (custom input)
  - "Side Hustle +€500/month"

**AC #3: Expense Scenarios**
- **Given** user wants to model expense changes
- **When** simulating
- **Then** allow:
  - Percentage increase (e.g., "10% lifestyle inflation")
  - Fixed increase (e.g., "+€200/month rent increase")
  - Category-specific (e.g., "Double childcare costs")

**AC #4: Combined Scenarios**
- **Given** real life is complex
- **When** building scenario
- **Then** allow combining: "Get a raise AND have a baby"

**AC #5: Visual Comparison**
- **Given** scenarios are calculated
- **When** displaying
- **Then** show:
  - Side-by-side net worth projection charts
  - Summary cards with key metrics delta
  - Timeline showing goal/FIRE date changes

**Technical Notes:**
- Use scenario engine from Story 11.1
- Create intuitive slider/input interface
- Store favorite scenarios in profile

**Files to Create/Modify:**
- `src/components/planning/IncomeScenarioSimulator.tsx` (new)
- `src/components/planning/ExpenseScenarioSimulator.tsx` (new)
- `src/app/(dashboard)/planning/scenarios/page.tsx` (new)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 11.3: Major Life Event Simulator

**As a** User,
**I want** to model major life events and their financial impact,
**So that** I can make informed decisions about big life changes.

**Acceptance Criteria:**

**AC #1: Life Event Templates**
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

**AC #2: Customizable Parameters**
- **Given** a life event template
- **When** user selects it
- **Then** allow customization:
  - Timing (when does it happen?)
  - Costs (adjust to actual expected values)
  - Duration (how long does impact last?)

**AC #3: Multi-Event Timeline**
- **Given** life rarely has one change at a time
- **When** planning
- **Then** allow adding multiple events to a timeline:
  - "Buy house in 2025, have baby in 2026, one parent part-time in 2027"

**AC #4: Impact Summary**
- **Given** events are modeled
- **When** showing results
- **Then** display:
  - "This plan delays your FIRE date by 3 years"
  - "You'll need €15,000 more in emergency fund"
  - "Your net worth in 2030: €X (vs €Y without events)"

**AC #5: Feasibility Check**
- **Given** the scenario is calculated
- **When** results show
- **Then** flag risks:
  - "⚠️ Your emergency fund would be depleted during month 8"
  - "⚠️ You'd need to reduce savings rate to 5% to afford this"

**Technical Notes:**
- Create life event templates with default values
- Allow chaining events on a timeline
- Show clear warnings for risky scenarios

**Files to Create/Modify:**
- `src/lib/planning/life-events.ts` (new - event templates)
- `src/components/planning/LifeEventSimulator.tsx` (new)
- `src/components/planning/EventTimeline.tsx` (new)
- `src/app/(dashboard)/planning/scenarios/life-events/page.tsx` (new)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 11.4: Big Purchase Decision Helper

**As a** User,
**I want** help deciding whether I can afford a big purchase,
**So that** I don't make decisions that derail my financial goals.

**Acceptance Criteria:**

**AC #1: Purchase Input**
- **Given** user is considering a purchase
- **When** entering details
- **Then** collect:
  - Purchase amount (€)
  - Financing option: Cash / Loan / Both
  - If loan: Interest rate, term
  - Urgency: Need now / Can wait / Nice to have

**AC #2: Affordability Analysis**
- **Given** purchase details
- **When** analyzing
- **Then** show:
  - Impact on emergency fund (would it drop below 3 months?)
  - Impact on savings goals (delays by X months)
  - Monthly cash flow impact (if financed)
  - Safe-to-Spend before/after

**AC #3: Recommendation**
- **Given** analysis is complete
- **When** displaying recommendation
- **Then** provide clear guidance:
  - ✅ "You can comfortably afford this"
  - ⚠️ "Possible, but delays your vacation goal by 4 months"
  - ❌ "This would deplete your emergency fund. Consider waiting or financing."

**AC #4: Alternative Scenarios**
- **Given** the purchase might not be immediately affordable
- **When** showing options
- **Then** suggest:
  - "Save €200/month for 6 months, then buy cash"
  - "Finance at 5% APR for 24 months = €X/month"
  - "Wait for price drop / sale"

**AC #5: Common Purchases**
- **Given** users have similar big decisions
- **When** starting the helper
- **Then** offer quick-start templates:
  - New Car
  - Home Renovation
  - Vacation
  - Electronics (laptop, phone)
  - Custom

**Technical Notes:**
- Integrate with Safe-to-Spend calculation
- Use goal projection logic
- Create simple decision tree for recommendations

**Files to Create/Modify:**
- `src/lib/planning/purchase-advisor.ts` (new)
- `src/components/planning/PurchaseDecisionHelper.tsx` (new)
- `src/app/(dashboard)/planning/scenarios/purchase/page.tsx` (new)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 11.5: FIRE "What-If" Enhancement

**As a** User,
**I want** to explore different paths to FIRE,
**So that** I can find a plan that balances lifestyle and retirement timing.

**Acceptance Criteria:**

**AC #1: Multi-Variable Sliders**
- **Given** the FIRE projection page
- **When** exploring scenarios
- **Then** provide interactive sliders for:
  - Monthly savings amount
  - Expected investment return (conservative/moderate/aggressive)
  - Target annual spending in retirement
  - Withdrawal rate (3% / 3.5% / 4% / 4.5%)

**AC #2: Real-Time Projection**
- **Given** sliders are adjusted
- **When** values change
- **Then** immediately update:
  - FIRE date
  - Required portfolio size (FI Number)
  - Years to FIRE
  - Monthly savings needed to hit target date

**AC #3: Comparison View**
- **Given** user wants to compare paths
- **When** selecting comparison mode
- **Then** show up to 3 scenarios side-by-side:
  - "Coast FIRE" (save heavily now, coast later)
  - "Barista FIRE" (part-time income after)
  - "Full FIRE" (complete financial independence)

**AC #4: Coast FIRE Calculator**
- **Given** Coast FIRE concept
- **When** calculating
- **Then** show:
  - "At €150,000 invested, you could stop saving and retire at 65"
  - "You'll reach Coast FIRE in X years at current savings rate"

**AC #5: Sensitivity Analysis**
- **Given** uncertainty in assumptions
- **When** showing projections
- **Then** display range:
  - Pessimistic (5% returns): FIRE in 18 years
  - Expected (7% returns): FIRE in 14 years
  - Optimistic (9% returns): FIRE in 11 years

**AC #6: Save Scenarios**
- **Given** user finds a preferred path
- **When** they click "Save This Plan"
- **Then** store and track progress against it

**Technical Notes:**
- Enhance existing FIRE calculator with multi-variable inputs
- Add scenario comparison feature
- Store preferred scenario for progress tracking

**Files to Create/Modify:**
- `src/lib/planning/fire.ts` (enhance)
- `src/components/planning/fire-simulator.tsx` (enhance with sliders)
- `src/components/planning/FIREScenarioComparison.tsx` (new)
- `src/components/planning/SensitivityChart.tsx` (new)

**Estimated Effort:** 5 points (1-2 days)

---

## Epic Summary

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| 11.1 | Unified Scenario Engine | 8 | High |
| 11.2 | Income & Expense Scenarios | 5 | High |
| 11.3 | Major Life Event Simulator | 8 | Medium |
| 11.4 | Big Purchase Decision Helper | 5 | Medium |
| 11.5 | FIRE "What-If" Enhancement | 5 | Medium |

**Total Points:** 31
**Estimated Timeline:** 2-3 weeks

---

## Success Metrics

- [ ] Users run at least 3 scenarios in first month
- [ ] 70% of users report increased confidence in major decisions
- [ ] Scenario tool used before major purchases (qualitative)
- [ ] FIRE engagement increases with enhanced simulator

---

## Navigation Structure

```
Planning
├── Goals
├── Debt
├── FIRE
└── Scenarios (NEW)
    ├── Income & Expenses
    ├── Life Events
    ├── Big Purchases
    └── Saved Scenarios
```
