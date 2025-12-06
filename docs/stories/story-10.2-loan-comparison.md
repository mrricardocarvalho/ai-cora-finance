# Story 10.2: Loan Comparison Calculator

**Status:** Completed
**Epic:** [Epic 10 - Debt Optimization & Simulation](../epics/epic-10-debt-optimization.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** to compare loan offers side-by-side,
**So that** I can choose the best option when refinancing or taking new debt.

---

## Acceptance Criteria

### AC #1: Loan Input Form
- **Given** user wants to compare loans
- **When** accessing the calculator
- **Then** allow input of up to 3 loan scenarios:
  - Loan amount (€)
  - Interest rate (APR %)
  - Term (months or years)
  - Fees (origination, closing costs)

### AC #2: Total Cost Calculation
- **Given** loan parameters are entered
- **When** calculating
- **Then** show for each loan:
  - Monthly payment
  - Total interest paid
  - Total cost (principal + interest + fees)
  - Effective APR (including fees)

### AC #3: Side-by-Side Comparison
- **Given** multiple loans are entered
- **When** comparing
- **Then** highlight:
  - Lowest monthly payment
  - Lowest total cost
  - Best value recommendation

### AC #4: Amortization Schedule
- **Given** a loan is selected
- **When** user clicks "View Schedule"
- **Then** show month-by-month breakdown:
  - Payment number, Principal, Interest, Remaining Balance

### AC #5: Real-World Scenarios
- **Given** common refinancing scenarios
- **When** displayed
- **Then** provide templates:
  - "Refinance Credit Card Debt"
  - "Mortgage Comparison"
  - "Auto Loan"
  - Each pre-fills typical terms for Portugal

### AC #6: Break-Even Analysis
- **Given** comparing refinance vs current debt
- **When** new loan has fees
- **Then** calculate: "You'll break even on fees after X months"

---

## Technical Notes

- Create `src/lib/planning/loan-calculator.ts`
- Standard amortization formula: `M = P * [r(1+r)^n] / [(1+r)^n - 1]`
- Store loan scenarios in session/local storage (not DB unless user saves)

### Calculation Functions
```typescript
interface LoanCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  effectiveAPR: number;
  amortizationSchedule: AmortizationRow[];
}

function calculateLoan(
  principal: number,
  annualRate: number,
  termMonths: number,
  fees: number
): LoanCalculation;

function calculateBreakEven(
  currentMonthlyPayment: number,
  newMonthlyPayment: number,
  refinancingFees: number
): number; // months to break even
```

### Amortization Row
```typescript
interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/planning/loan-calculator.ts` | Create |
| `src/components/planning/LoanComparisonCalculator.tsx` | Create |
| `src/components/planning/AmortizationTable.tsx` | Create |
| `src/app/(dashboard)/planning/debt/compare/page.tsx` | Create |

---

## Prerequisites

- None (standalone calculator)

---

## Definition of Done

- [x] Multi-loan input form (up to 3)
- [x] All calculations accurate
- [x] Side-by-side comparison table
- [x] Best option highlighted
- [x] Amortization schedule viewable
- [ ] Scenario templates available
- [ ] Break-even calculation works
- [x] Mobile responsive
- [ ] Unit tests for calculations
