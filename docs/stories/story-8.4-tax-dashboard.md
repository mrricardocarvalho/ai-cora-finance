# Story 8.4: Tax Planning Dashboard

**Epic:** [Epic 8 - Portuguese Tax Intelligence](../epics/epic-8-tax-intelligence.md)
**Priority:** Medium
**Points:** 8

---

## User Story

**As a** User,
**I want** a dedicated view showing my tax situation,
**So that** I can see deductions, deadlines, and optimization opportunities in one place.

---

## Acceptance Criteria

### AC #1: Tax Planning Page
- **Given** user navigates to Planning → Tax (or dedicated tax section)
- **When** the page loads
- **Then** display a comprehensive tax overview

### AC #2: Upcoming Deadlines Card
- **Given** there are tax deadlines in the next 90 days
- **When** displaying the card
- **Then** show a timeline/list of upcoming dates with status indicators

### AC #3: Deduction Summary Card
- **Given** transaction scanning has identified deductions
- **When** displaying the card
- **Then** show:
  - Horizontal bar chart of each category (amount vs max)
  - Total estimated tax benefit
  - "Add Missing Receipt" action for manual entries

### AC #4: Investment Tax Card
- **Given** user has investments
- **When** displaying the card
- **Then** show:
  - Realized capital gains this year
  - Unrealized gains/losses
  - Tax-loss harvesting opportunities (from Epic 4)
  - Estimated capital gains tax liability

### AC #5: Year Selector
- **Given** user wants to review past tax years
- **When** selecting a year (2024, 2023, etc.)
- **Then** filter all data to that tax year

### AC #6: IRS Submission Checklist
- **Given** it's IRS submission season (April-June)
- **When** showing the tax page
- **Then** display a checklist:
  - [ ] Access credentials ready (Portal das Finanças)
  - [ ] e-fatura expenses validated
  - [ ] Rent receipts registered (if applicable)
  - [ ] Investment broker reports downloaded
  - [ ] Submit IRS declaration

### AC #7: Export for Accountant
- **Given** user works with a tax professional
- **When** clicking "Export Summary"
- **Then** generate a PDF/CSV with all deduction categories and investment transactions

---

## Technical Notes

- Create new page under Planning section
- Aggregate data from multiple sources (transactions, investments, calendar)
- Consider linking to external resources (Portal das Finanças)

### Page Layout
```
┌─────────────────────────────────────────┐
│  Tax Planning 2024      [Year: 2024 ▼]  │
├───────────────┬─────────────────────────┤
│  Deadlines    │    Deduction Summary    │
│  Timeline     │    [Bar Charts]         │
│               │    Est. Benefit: €XXX   │
├───────────────┴─────────────────────────┤
│  Investment Taxes                        │
│  Gains: €X | Losses: €Y | Tax: €Z       │
├──────────────────────────────────────────┤
│  IRS Checklist (April-June only)         │
│  [✓] [✓] [ ] [ ] [ ]                    │
├──────────────────────────────────────────┤
│  [Export Summary]                        │
└──────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/(dashboard)/planning/tax/page.tsx` | Create |
| `src/components/planning/TaxDeadlinesCard.tsx` | Create |
| `src/components/planning/DeductionSummaryCard.tsx` | Create |
| `src/components/planning/TaxChecklistCard.tsx` | Create |
| `src/lib/i18n/translations.ts` | Modify (add tax section strings) |

---

## Prerequisites

- Story 8.1: Tax Calendar System (provides deadlines)
- Story 8.3: Tax Deduction Scanner (provides deduction data)
- Story 4.5: Tax Logic (provides investment tax data)

---

## Definition of Done

- [ ] Tax page accessible from Planning section
- [ ] Deadlines card shows upcoming events
- [ ] Deduction summary with progress bars
- [ ] Investment tax section displays gains/losses
- [ ] Year selector filters all data
- [ ] IRS checklist shows during season
- [ ] Export generates PDF/CSV
- [ ] Mobile responsive layout
- [ ] Bilingual translations
