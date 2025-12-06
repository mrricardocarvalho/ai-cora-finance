# Epic 8: Portuguese Tax Intelligence

**Goal:** Build comprehensive Portuguese tax awareness into Cora, including a tax calendar with IRS deadlines, deduction scanning, and proactive tax-related alerts throughout the year.

**Prerequisites:** Epic 3 complete (Insight Engine), Epic 4 complete (Investment tax logic).

**Business Value:** Users never miss a tax deadline, discover deductions they didn't know about, and feel confident during IRS season. This is a key Portugal-specific differentiator.

---

## Stories

### Story 8.1: Portuguese Tax Calendar System

**As a** User,
**I want** Cora to know all important Portuguese tax deadlines,
**So that** I never miss a payment or filing date.

**Acceptance Criteria:**

**AC #1: Tax Calendar Data Model**
- **Given** the system needs to store tax events
- **When** designing the schema
- **Then** create a `tax_calendar` table with: id, event_name, event_type (deadline/payment/info), due_date, description, applies_to (all/property_owners/investors/self_employed), reminder_days_before

**AC #2: Pre-populated Portuguese Tax Events**
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

**AC #3: Dynamic Date Calculation**
- **Given** tax deadlines are defined
- **When** a new year begins
- **Then** the system auto-generates that year's specific dates

**AC #4: User-Specific Relevance**
- **Given** user profile indicates property ownership or self-employment
- **When** filtering tax events
- **Then** show only relevant deadlines (property owner sees IMI, non-owners don't)

**AC #5: Tax Event API**
- **Given** the frontend needs tax calendar data
- **When** calling `/api/tax/calendar`
- **Then** return upcoming events for the next 90 days, sorted by date

**Technical Notes:**
- Create `tax_calendar` table with seed data
- Consider storing base templates and generating year-specific instances
- Add `is_property_owner`, `is_self_employed` to `profiles` if needed
- Portuguese tax authority site for reference: https://www.portaldasfinancas.gov.pt

**Files to Create/Modify:**
- `db/migrations/00XX_create_tax_calendar.sql` (new)
- `src/lib/tax/calendar.ts` (new)
- `src/app/api/tax/calendar/route.ts` (new)
- `db/seed/tax-calendar-pt.ts` (new - seed data)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 8.2: Tax Deadline Alerts & Notifications

**As a** User,
**I want** to receive proactive alerts before tax deadlines,
**So that** I have time to prepare and never miss a filing.

**Acceptance Criteria:**

**AC #1: Reminder Schedule**
- **Given** a tax deadline exists (e.g., IRS submission June 30)
- **When** the current date is within the reminder window
- **Then** generate insights at these intervals:
  - 30 days before: `info` insight ("IRS submission opens in 30 days")
  - 14 days before: `warning` insight ("IRS deadline in 2 weeks")
  - 3 days before: `urgent` insight ("IRS deadline in 3 days!")
  - Day of: `urgent` insight ("Today is the IRS deadline!")

**AC #2: Insight Content Quality**
- **Given** a tax deadline alert is generated
- **When** displayed to user
- **Then** it includes:
  - Clear deadline name and date
  - What action is required
  - Link to relevant resource (Portal das Finanças or internal page)
  - Contextual tip (e.g., "Make sure you have your NIF and access credentials ready")

**AC #3: Push Notification Integration**
- **Given** user has enabled push notifications for "Tax Deadlines"
- **When** an urgent tax alert is generated (3 days or less)
- **Then** send a push notification with the alert

**AC #4: Dismissal & Snooze**
- **Given** a tax insight is shown
- **When** user dismisses it
- **Then** don't show the same deadline alert again (but show next milestone)
- **When** user marks as "Done" or "Not Applicable"
- **Then** suppress all further alerts for that specific deadline this year

**AC #5: No Spam Guarantee**
- **Given** multiple tax events in the same period
- **When** generating alerts
- **Then** consolidate into a summary insight if > 2 deadlines within 7 days

**Technical Notes:**
- Extend Insight Engine with tax calendar trigger
- Add `tax_alert_preferences` to profiles or use existing notification preferences
- Create `checkTaxDeadlines()` function that runs daily (or on user login)

**Files to Create/Modify:**
- `src/lib/intelligence/tax-alerts.ts` (new)
- `src/lib/intelligence/insights.ts` (integrate tax triggers)
- `src/lib/actions/notifications.ts` (add tax notification logic)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 8.3: Tax Deduction Scanner

**As a** User,
**I want** Cora to scan my transactions for potential IRS deductions,
**So that** I can maximize my tax refund without manually tracking receipts.

**Acceptance Criteria:**

**AC #1: Deduction Category Mapping**
- **Given** Portuguese IRS deduction categories
- **When** scanning transactions
- **Then** identify expenses in these categories:
  - **Saúde (Health)**: 15% deductible, max €1,000 (pharmacies, doctors, hospitals)
  - **Educação (Education)**: 30% deductible, max €800 (schools, universities, books)
  - **Habitação (Housing)**: Rent payments (15%, max €502) or mortgage interest
  - **Lares (Care homes)**: 25% deductible, max €403.75
  - **Despesas Gerais (General)**: 35% of VAT-validated expenses, max €250
  - **Ginásios/Health clubs**: Included in general expenses if VAT-validated

**AC #2: Transaction Scanning Logic**
- **Given** transactions with categories and merchant names
- **When** the scanner runs
- **Then** match known merchant patterns to deduction categories:
  - "Farmácia*", "Continente Saúde", "Wells" → Health
  - "Universidade*", "FNAC Livros", "Wook" → Education
  - Rent payments (if tagged) → Housing

**AC #3: Annual Deduction Summary**
- **Given** a tax year's transactions have been scanned
- **When** user views the tax section
- **Then** show summary:
  - Total potential deductions by category
  - Amount vs maximum allowed
  - Estimated tax benefit (deduction × rate)

**AC #4: Missing Deduction Insights**
- **Given** user has health expenses but none in education
- **When** analyzing deduction opportunities
- **Then** generate `opportunity` insight: "You have €200 unused in education deductions. Books, courses, and school supplies count!"

**AC #5: VAT Validation Reminder**
- **Given** general expenses require NIF on invoice (e-fatura)
- **When** showing deduction summary
- **Then** remind user: "For General Expenses to count, make sure your NIF is on the receipt and validated in e-fatura"

**AC #6: Deduction Confidence Scoring**
- **Given** a transaction is flagged as potential deduction
- **When** confidence is < 80%
- **Then** mark as "Review" and let user confirm/reject

**Technical Notes:**
- Create `tax_deductions` table or use transaction tagging
- Portuguese merchant database for common deductible merchants
- Consider AI-assisted categorization for edge cases
- Reference: https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/IRS/

**Files to Create/Modify:**
- `src/lib/tax/deduction-scanner.ts` (new)
- `src/lib/tax/deduction-categories.ts` (new - category definitions)
- `db/migrations/00XX_tax_deductions.sql` (optional)
- `src/app/(dashboard)/planning/tax/page.tsx` (new - tax planning view)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 8.4: Tax Planning Dashboard

**As a** User,
**I want** a dedicated view showing my tax situation,
**So that** I can see deductions, deadlines, and optimization opportunities in one place.

**Acceptance Criteria:**

**AC #1: Tax Planning Page**
- **Given** user navigates to Planning → Tax (or dedicated tax section)
- **When** the page loads
- **Then** display a comprehensive tax overview

**AC #2: Upcoming Deadlines Card**
- **Given** there are tax deadlines in the next 90 days
- **When** displaying the card
- **Then** show a timeline/list of upcoming dates with status indicators

**AC #3: Deduction Summary Card**
- **Given** transaction scanning has identified deductions
- **When** displaying the card
- **Then** show:
  - Horizontal bar chart of each category (amount vs max)
  - Total estimated tax benefit
  - "Add Missing Receipt" action for manual entries

**AC #4: Investment Tax Card**
- **Given** user has investments
- **When** displaying the card
- **Then** show:
  - Realized capital gains this year
  - Unrealized gains/losses
  - Tax-loss harvesting opportunities (from Epic 4)
  - Estimated capital gains tax liability

**AC #5: Year Selector**
- **Given** user wants to review past tax years
- **When** selecting a year (2024, 2023, etc.)
- **Then** filter all data to that tax year

**AC #6: IRS Submission Checklist**
- **Given** it's IRS submission season (April-June)
- **When** showing the tax page
- **Then** display a checklist:
  - [ ] Access credentials ready (Portal das Finanças)
  - [ ] e-fatura expenses validated
  - [ ] Rent receipts registered (if applicable)
  - [ ] Investment broker reports downloaded
  - [ ] Submit IRS declaration

**AC #7: Export for Accountant**
- **Given** user works with a tax professional
- **When** clicking "Export Summary"
- **Then** generate a PDF/CSV with all deduction categories and investment transactions

**Technical Notes:**
- Create new page under Planning section
- Aggregate data from multiple sources (transactions, investments, calendar)
- Consider linking to external resources (Portal das Finanças)

**Files to Create/Modify:**
- `src/app/(dashboard)/planning/tax/page.tsx` (new)
- `src/components/planning/TaxDeadlinesCard.tsx` (new)
- `src/components/planning/DeductionSummaryCard.tsx` (new)
- `src/components/planning/TaxChecklistCard.tsx` (new)
- `src/lib/i18n/translations.ts` (add tax section strings)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 8.5: IRS Knowledge Base & Q&A Enhancement

**As a** User,
**I want** to ask Cora Portuguese tax questions and get accurate answers,
**So that** I can understand my tax situation without consulting an accountant for basic questions.

**Acceptance Criteria:**

**AC #1: Tax Knowledge Injection**
- **Given** user asks a tax question in chat
- **When** Cora processes the query
- **Then** include Portuguese tax context in the AI prompt:
  - Current tax rates (28% capital gains, income tax brackets)
  - Deduction limits and rules
  - Common scenarios and answers

**AC #2: Common Tax Questions**
- **Given** the chat interface
- **When** in tax context
- **Then** suggest relevant starter questions:
  - "Posso deduzir as despesas do meu home office?"
  - "Como funciona a tributação de dividendos?"
  - "Qual é o prazo para entregar o IRS?"
  - "Como declaro ganhos de criptomoedas?"

**AC #3: Personalized Tax Answers**
- **Given** user asks "How much tax will I owe on my investments?"
- **When** Cora responds
- **Then** use actual portfolio data:
  - "Based on your €2,340 realized gains this year, you'd owe approximately €655 in capital gains tax (28%)"

**AC #4: Disclaimer Requirement**
- **Given** any tax-related response
- **When** displaying to user
- **Then** append disclaimer: "This is educational guidance, not tax advice. For complex situations, consult a certified accountant (TOC)."

**AC #5: Source References**
- **Given** Cora provides tax information
- **When** applicable
- **Then** include reference links to official sources (Portal das Finanças, Código do IRS)

**Technical Notes:**
- Enhance chat system prompt with Portuguese tax knowledge
- Create structured tax knowledge base (`src/lib/tax/knowledge.ts`)
- Consider RAG (Retrieval Augmented Generation) for complex tax code queries
- Keep tax information dated and flag outdated info

**Files to Create/Modify:**
- `src/lib/tax/knowledge.ts` (new - tax facts and rules)
- `src/lib/actions/chat.ts` (enhance tax context injection)
- `src/lib/ai/prompts.ts` (add tax specialist prompt variant)

**Estimated Effort:** 5 points (1-2 days)

---

## Epic Summary

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| 8.1 | Portuguese Tax Calendar System | 5 | High |
| 8.2 | Tax Deadline Alerts & Notifications | 5 | High |
| 8.3 | Tax Deduction Scanner | 8 | High |
| 8.4 | Tax Planning Dashboard | 8 | Medium |
| 8.5 | IRS Knowledge Base & Q&A Enhancement | 5 | Medium |

**Total Points:** 31
**Estimated Timeline:** 2-3 weeks

---

## Success Metrics

- [ ] Zero missed tax deadlines for users with notifications enabled
- [ ] Average user discovers €200+ in deductions they weren't tracking
- [ ] 90% of tax questions answered without external research
- [ ] IRS season stress reduced (qualitative feedback)

---

## Portuguese Tax Reference Data

### Income Tax Brackets (2024)
| Income | Rate |
|--------|------|
| Up to €7,703 | 13.25% |
| €7,703 - €11,623 | 18% |
| €11,623 - €16,472 | 23% |
| €16,472 - €21,321 | 26% |
| €21,321 - €27,146 | 32.75% |
| €27,146 - €39,791 | 37% |
| €39,791 - €51,997 | 43.5% |
| €51,997 - €81,199 | 45% |
| Above €81,199 | 48% |

### Capital Gains Tax
- Standard rate: 28%
- Holding period > 365 days: Still 28% (no preferential rate in PT)
- Crypto: Treated as capital gains (taxable if held < 365 days as of 2023)

### Key Deduction Limits (2024)
| Category | Rate | Maximum |
|----------|------|---------|
| Health | 15% | €1,000 |
| Education | 30% | €800 |
| Housing (Rent) | 15% | €502 |
| General (e-fatura) | 35% of VAT | €250 |
| Care Homes | 25% | €403.75 |
