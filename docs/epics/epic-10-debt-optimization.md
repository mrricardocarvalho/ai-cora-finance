# Epic 10: Debt Optimization & Simulation

**Goal:** Extend debt management with interactive simulators that help users visualize the impact of extra payments and compare loan options.

**Prerequisites:** Epic 5 complete (Debt overview, basic Avalanche/Snowball).

**Business Value:** Users can make data-driven decisions about debt payoff strategies and loan choices, potentially saving thousands in interest.

---

## Stories

### Story 10.1: Interactive Extra Payment Simulator

**As a** User,
**I want** to see exactly how extra payments affect my debt payoff timeline,
**So that** I can decide whether to put extra money toward debt or investments.

**Acceptance Criteria:**

**AC #1: Simulator Interface**
- **Given** user has debts in the system
- **When** navigating to Debt section
- **Then** show an "Extra Payment Simulator" card/section

**AC #2: Input Controls**
- **Given** the simulator is displayed
- **When** user interacts
- **Then** provide:
  - Slider or input for "Extra monthly payment" (€0 - €500+)
  - Toggle to apply extra to: "Highest Interest First" or "Smallest Balance First" or "Specific Debt"
  - Optional: One-time lump sum input

**AC #3: Real-Time Calculation**
- **Given** user adjusts the extra payment slider to €100
- **When** calculation runs
- **Then** show immediately (no page reload):
  - New payoff date vs current payoff date
  - Total interest saved
  - Months saved
  - Side-by-side comparison visualization

**AC #4: Visualization**
- **Given** results are calculated
- **When** displayed
- **Then** show:
  - Two timeline bars: "Current Path" vs "With Extra Payments"
  - Debt balance over time chart (both scenarios)
  - Interest paid comparison (bar chart)

**AC #5: Per-Debt Breakdown**
- **Given** user has multiple debts
- **When** viewing results
- **Then** show table with each debt:
  | Debt | Current Payoff | New Payoff | Interest Saved |
  |------|----------------|------------|----------------|
  | Card A | Dec 2026 | Aug 2026 | €340 |
  | Loan B | Jan 2028 | Sep 2027 | €580 |

**AC #6: Save Scenario**
- **Given** user finds a plan they like
- **When** they click "Set as Goal" or "Save Plan"
- **Then** save as a target and track progress against it

**Technical Notes:**
- Extend `src/lib/planning/debt.ts` with `simulateExtraPayments(debts, extraMonthly, strategy)`
- Return month-by-month projection for charting
- Consider Web Worker for complex calculations if slow

**Files to Create/Modify:**
- `src/lib/planning/debt-simulator.ts` (new or extend debt.ts)
- `src/components/planning/ExtraPaymentSimulator.tsx` (new)
- `src/components/planning/DebtComparisonChart.tsx` (new)
- `src/app/(dashboard)/planning/debt/page.tsx` (integrate simulator)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 10.2: Loan Comparison Calculator

**As a** User,
**I want** to compare loan offers side-by-side,
**So that** I can choose the best option when refinancing or taking new debt.

**Acceptance Criteria:**

**AC #1: Loan Input Form**
- **Given** user wants to compare loans
- **When** accessing the calculator
- **Then** allow input of up to 3 loan scenarios:
  - Loan amount (€)
  - Interest rate (APR %)
  - Term (months or years)
  - Fees (origination, closing costs)

**AC #2: Total Cost Calculation**
- **Given** loan parameters are entered
- **When** calculating
- **Then** show for each loan:
  - Monthly payment
  - Total interest paid
  - Total cost (principal + interest + fees)
  - Effective APR (including fees)

**AC #3: Side-by-Side Comparison**
- **Given** multiple loans are entered
- **When** comparing
- **Then** highlight:
  - Lowest monthly payment
  - Lowest total cost
  - Best value recommendation

**AC #4: Amortization Schedule**
- **Given** a loan is selected
- **When** user clicks "View Schedule"
- **Then** show month-by-month breakdown:
  - Payment number, Principal, Interest, Remaining Balance

**AC #5: Real-World Scenarios**
- **Given** common refinancing scenarios
- **When** displayed
- **Then** provide templates:
  - "Refinance Credit Card Debt"
  - "Mortgage Comparison"
  - "Auto Loan"
  - Each pre-fills typical terms for Portugal

**AC #6: Break-Even Analysis**
- **Given** comparing refinance vs current debt
- **When** new loan has fees
- **Then** calculate: "You'll break even on fees after X months"

**Technical Notes:**
- Create `src/lib/planning/loan-calculator.ts`
- Standard amortization formula: `M = P * [r(1+r)^n] / [(1+r)^n - 1]`
- Store loan scenarios in session/local storage (not DB unless user saves)

**Files to Create/Modify:**
- `src/lib/planning/loan-calculator.ts` (new)
- `src/components/planning/LoanComparisonCalculator.tsx` (new)
- `src/components/planning/AmortizationTable.tsx` (new)
- `src/app/(dashboard)/planning/debt/compare/page.tsx` (new page)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 10.3: Debt Payoff Insights & Motivation

**As a** User,
**I want** Cora to celebrate my debt progress and suggest optimizations,
**So that** I stay motivated on my debt-free journey.

**Acceptance Criteria:**

**AC #1: Progress Tracking**
- **Given** user has been paying down debt
- **When** balance decreases
- **Then** track:
  - Total debt reduction this month/year
  - Percentage of original debt paid off
  - Streak of on-time payments

**AC #2: Milestone Celebrations**
- **Given** user reaches a milestone
- **When** achieved
- **Then** generate `celebration` insight:
  - "🎉 You've paid off 25% of your credit card!"
  - "You've saved €120 in interest by paying extra this month"
  - "Debt-free in 8 months at current pace!"

**AC #3: Opportunity Insights**
- **Given** user has Safe-to-Spend surplus
- **When** analyzing
- **Then** suggest: "You have €150 extra this month. Putting it toward [Debt X] would save €45 in interest."

**AC #4: Comparison to Plan**
- **Given** user set a debt payoff goal
- **When** tracking
- **Then** show: "You're 2 months ahead of schedule!" or "You're 1 month behind plan"

**AC #5: Interest Paid Counter**
- **Given** debt has interest
- **When** displaying debt overview
- **Then** show running total: "Total interest paid this year: €423"

**AC #6: Payoff Countdown**
- **Given** projected payoff date
- **When** displaying debt card
- **Then** show: "X months until debt-free" with motivational messaging

**Technical Notes:**
- Extend insight triggers for debt milestones
- Store debt starting balance for comparison
- Confetti animation on major milestones (reuse from Epic 6)

**Files to Create/Modify:**
- `src/lib/intelligence/debt-insights.ts` (new)
- `src/lib/intelligence/insights.ts` (integrate debt triggers)
- `src/components/planning/DebtProgressCard.tsx` (new or enhance)

**Estimated Effort:** 5 points (1-2 days)

---

## Epic Summary

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| 10.1 | Interactive Extra Payment Simulator | 8 | High |
| 10.2 | Loan Comparison Calculator | 5 | Medium |
| 10.3 | Debt Payoff Insights & Motivation | 5 | Medium |

**Total Points:** 18
**Estimated Timeline:** 1-1.5 weeks

---

## Success Metrics

- [ ] Users simulate at least one extra payment scenario
- [ ] Average user discovers €300+ potential interest savings
- [ ] 50% of users with debt engage with simulator monthly
- [ ] Debt payoff completion rate increases (long-term)

---

## Formulas Reference

### Monthly Payment (Amortization)
```
M = P * [r(1+r)^n] / [(1+r)^n - 1]

Where:
M = Monthly payment
P = Principal (loan amount)
r = Monthly interest rate (annual rate / 12)
n = Total number of payments (months)
```

### Total Interest
```
Total Interest = (M * n) - P
```

### Effective APR (with fees)
```
Effective APR = (Total Interest + Fees) / P / Years * 100
```

### Avalanche Method Order
```
Sort debts by interest_rate DESC
Pay minimums on all
Apply extra to highest interest first
```

### Snowball Method Order
```
Sort debts by balance ASC
Pay minimums on all
Apply extra to smallest balance first
```
