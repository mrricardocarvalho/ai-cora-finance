# Story 6.5: Portuguese Localization & Formatting

**Status:** Done
**Epic:** 6. Polish & Proactive Reach
**Story:**
**As a** User,
**I want** the app to use Portuguese formatting for currency, dates, and numbers,
**So that** it feels like a native tool built for my region, not a generic translation.

## Acceptance Criteria
1.  [x] **Currency Utility:** Create a global `formatCurrency(value)` utility.
    *   Must use `pt-PT` locale.
    *   Symbol (`€`) at the end.
    *   Thousands separator: `.` (dot).
    *   Decimal separator: `,` (comma).
2.  [x] **Date Utility:** Create a global `formatDate(date)` utility.
    *   Standard: `DD/MM/YYYY` (e.g., 29/11/2025).
    *   Short: `DD MMM` (e.g., 29 Nov).
    *   Relative: `pt-PT` locale (e.g., "há 2 horas").
3.  [x] **Audit & Apply:** Scanned and updated many components (Dashboard, Transactions, Portfolio) to use formatting utilities.
4.  [x] **Input Handling:** Implemented `parseLocalizedNumber` and applied to common amount inputs (Goals, Invest dialog, Accounts min payment & balance).
5.  [ ] **Copy Review:** Verify UI text uses **European Portuguese (PT-PT)** spelling/grammar (e.g., "Ecrã" not "Tela", "Aceder" not "Acessar").

**Notes:**
- Utilities added: `src/lib/utils/formatting.ts` and re-exported from `src/lib/utils.ts`.
- Updated components: Transactions, Mobile Transactions list, Transaction Details, Goal Card, FIRE Chart, Debt Simulator, Allocation Chart, Portfolio holdings, Accounts list, Safe-To-Spend Widget, Add Investment dialog, Add Goal dialog, Account Form.
- Input parsing applied for: `target_amount`, `pricePerShare`, `quantity`, `fees`, `balance`, and `min_payment`.
- Remaining manual textual copy review (full PT-PT translation) is out of scope for this story and left as TODO.

## Dev Notes (Context)

**1. Currency Implementation:**

// lib/utils/formatting.ts
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

**2. Date Implementation:**
Import the locale from `date-fns`.

import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale'; // pt = European Portuguese (pt-BR is Brazilian)

export const formatDate = (date: Date) => {
  return format(date, 'dd/MM/yyyy', { locale: pt });
}

**3. Input Parsing:**
HTML `input type="number"` is tricky with commas.
*   *Recommendation:* Use `type="text"` with a simple parser that replaces `,` with `.` before saving to state/Zod.
*   *Or:* Use a library like `react-currency-input-field` if complex masking is needed (keep it simple for MVP).

**4. Common PT-PT vs PT-BR Traps:**
*   "Guardar" (Save) vs "Salvar".
*   "Registo" (Register/Log) vs "Registro".
*   "Equipa" (Team) vs "Equipe".
*   "Ficheiro" (File) vs "Arquivo".

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-6.5-localization"
  title: "Portuguese Localization & Formatting"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "date-fns"
  folder_structure:
    - "/lib/utils/formatting.ts" (New centralized utils)
    - "/components/ui/currency-input.tsx" (Optional wrapper)
  localization_config:
    locale: "pt-PT"
    currency: "EUR"
  verify: "Render 1234.56. It should display as '1.234,56 €'. Render today's date. It should be '29/11/2025'."