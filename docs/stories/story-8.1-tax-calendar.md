# Story 8.1: Portuguese Tax Calendar System

**Epic:** [Epic 8 - Portuguese Tax Intelligence](../epics/epic-8-tax-intelligence.md)
**Priority:** High
**Points:** 5

---

## User Story

**As a** User,
**I want** Cora to know all important Portuguese tax deadlines,
**So that** I never miss a payment or filing date.

---

## Acceptance Criteria

### AC #1: Tax Calendar Data Model
- **Given** the system needs to store tax events
- **When** designing the schema
- **Then** create a `tax_calendar` table with:
  - `id` (UUID)
  - `event_name` (text)
  - `event_type` ('deadline' | 'payment' | 'info')
  - `due_date` (date)
  - `description` (text)
  - `applies_to` ('all' | 'property_owners' | 'investors' | 'self_employed')
  - `reminder_days_before` (integer array)

### AC #2: Pre-populated Portuguese Tax Events
- **Given** the system is initialized
- **When** checking the tax calendar
- **Then** it includes these key dates (annually recurring):
  - **January 31**: Deadline to update household composition (Agregado Familiar)
  - **February 15**: IRS withholding tables update
  - **March 31**: Annual property tax (IMI) - 1st installment for values > €500
  - **April 1 - June 30**: IRS submission period
  - **May 31**: IMI 2nd installment (if applicable)
  - **June 30**: IRS submission deadline
  - **July 31**: IRS refund expected (typical)
  - **August 31**: IRS payment deadline (if owing)
  - **September 30**: IMI 3rd installment (if applicable)
  - **November 30**: IMI single payment (if < €100)
  - **December 31**: Last day for tax-deductible expenses

### AC #3: Dynamic Date Calculation
- **Given** tax deadlines are defined
- **When** a new year begins
- **Then** the system auto-generates that year's specific dates

### AC #4: User-Specific Relevance
- **Given** user profile indicates property ownership or self-employment
- **When** filtering tax events
- **Then** show only relevant deadlines (property owner sees IMI, non-owners don't)

### AC #5: Tax Event API
- **Given** the frontend needs tax calendar data
- **When** calling `/api/tax/calendar`
- **Then** return upcoming events for the next 90 days, sorted by date

---

## Technical Notes

- Create `tax_calendar` table with seed data
- Consider storing base templates and generating year-specific instances
- Add `is_property_owner`, `is_self_employed` to `profiles` if needed
- Portuguese tax authority reference: https://www.portaldasfinancas.gov.pt

### Seed Data Structure
```typescript
const taxEvents = [
  {
    event_name: 'IRS Submission Opens',
    event_type: 'info',
    month: 4, day: 1,
    applies_to: 'all',
    reminder_days_before: [7],
  },
  {
    event_name: 'IRS Submission Deadline',
    event_type: 'deadline',
    month: 6, day: 30,
    applies_to: 'all',
    reminder_days_before: [30, 14, 3, 0],
  },
  // ... more events
];
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `db/migrations/00XX_create_tax_calendar.sql` | Create |
| `src/lib/tax/calendar.ts` | Create |
| `src/app/api/tax/calendar/route.ts` | Create |
| `db/seed/tax-calendar-pt.ts` | Create |

---

## Prerequisites

- None (foundational for tax features)

---

## Definition of Done

- [ ] Tax calendar table created with proper schema
- [ ] All Portuguese tax deadlines seeded
- [ ] Dynamic year calculation works
- [ ] User profile filtering by relevance
- [ ] API returns next 90 days of events
- [ ] Bilingual support (PT-PT/EN-US)
