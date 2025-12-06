# Story 8.3: Tax Deduction Scanner

**Epic:** [Epic 8 - Portuguese Tax Intelligence](../epics/epic-8-tax-intelligence.md)
**Priority:** High
**Points:** 8

---

## User Story

**As a** User,
**I want** Cora to scan my transactions for potential IRS deductions,
**So that** I can maximize my tax refund without manually tracking receipts.

---

## Acceptance Criteria

### AC #1: Deduction Category Mapping
- **Given** Portuguese IRS deduction categories
- **When** scanning transactions
- **Then** identify expenses in these categories:
  - **Saúde (Health)**: 15% deductible, max €1,000 (pharmacies, doctors, hospitals)
  - **Educação (Education)**: 30% deductible, max €800 (schools, universities, books)
  - **Habitação (Housing)**: Rent payments (15%, max €502) or mortgage interest
  - **Lares (Care homes)**: 25% deductible, max €403.75
  - **Despesas Gerais (General)**: 35% of VAT-validated expenses, max €250
  - **Ginásios/Health clubs**: Included in general expenses if VAT-validated

### AC #2: Transaction Scanning Logic
- **Given** transactions with categories and merchant names
- **When** the scanner runs
- **Then** match known merchant patterns to deduction categories:
  - "Farmácia*", "Continente Saúde", "Wells" → Health
  - "Universidade*", "FNAC Livros", "Wook" → Education
  - Rent payments (if tagged) → Housing

### AC #3: Annual Deduction Summary
- **Given** a tax year's transactions have been scanned
- **When** user views the tax section
- **Then** show summary:
  - Total potential deductions by category
  - Amount vs maximum allowed
  - Estimated tax benefit (deduction × rate)

### AC #4: Missing Deduction Insights
- **Given** user has health expenses but none in education
- **When** analyzing deduction opportunities
- **Then** generate `opportunity` insight: "You have €200 unused in education deductions. Books, courses, and school supplies count!"

### AC #5: VAT Validation Reminder
- **Given** general expenses require NIF on invoice (e-fatura)
- **When** showing deduction summary
- **Then** remind user: "For General Expenses to count, make sure your NIF is on the receipt and validated in e-fatura"

### AC #6: Deduction Confidence Scoring
- **Given** a transaction is flagged as potential deduction
- **When** confidence is < 80%
- **Then** mark as "Review" and let user confirm/reject

---

## Technical Notes

- Create `tax_deductions` table or use transaction tagging
- Portuguese merchant database for common deductible merchants
- Consider AI-assisted categorization for edge cases
- Reference: https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/IRS/

### Deduction Categories
```typescript
const deductionCategories = {
  health: { rate: 0.15, maxAmount: 1000, ptName: 'Saúde' },
  education: { rate: 0.30, maxAmount: 800, ptName: 'Educação' },
  housing: { rate: 0.15, maxAmount: 502, ptName: 'Habitação' },
  careHomes: { rate: 0.25, maxAmount: 403.75, ptName: 'Lares' },
  general: { rate: 0.35, maxAmount: 250, ptName: 'Despesas Gerais', isVAT: true },
};
```

### Merchant Patterns
```typescript
const healthMerchants = [
  /farmácia/i, /pharmacy/i, /hospital/i, /clínica/i,
  /continente\s*saúde/i, /wells/i, /dentist/i,
];
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/tax/deduction-scanner.ts` | Create |
| `src/lib/tax/deduction-categories.ts` | Create |
| `db/migrations/00XX_tax_deductions.sql` | Create (optional) |
| `src/app/(dashboard)/planning/tax/page.tsx` | Create |

---

## Prerequisites

- Story 2.5: AI Extraction (provides categorized transactions)
- Story 3.4: Insight Engine (provides insight framework)

---

## Definition of Done

- [ ] All 5 deduction categories scannable
- [ ] Merchant pattern matching implemented
- [ ] Annual summary with amounts vs limits
- [ ] Tax benefit calculation displayed
- [ ] Missing deduction insights generated
- [ ] Confidence scoring with user review
- [ ] VAT reminder for general expenses
- [ ] Unit tests for scanner logic
