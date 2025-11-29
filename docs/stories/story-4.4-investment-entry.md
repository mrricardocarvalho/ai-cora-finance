# Story 4.4: Manual Investment Entry

**Status:** Approved
**Epic:** 4. Investment Engine
**Story:**
**As a** User,
**I want** to record my investment buys and sells manually,
**So that** my portfolio reflects my actual holdings across different brokers.

## Acceptance Criteria
1.  [ ] **UI Component:** Create `AddInvestmentDialog` component (triggered from Portfolio page).
2.  [ ] **Ticker Search:** Implement a searchable Combobox (using `Command` component) that queries the `assets` table or Yahoo Finance API to find assets by Symbol or Name.
3.  [ ] **Form Fields:**
    *   Date (DatePicker)
    *   Ticker (Search)
    *   Type (Select: Buy, Sell, Dividend)
    *   Quantity (Decimal)
    *   Price per Share (Decimal)
    *   Fees (Decimal - Critical for Tax)
4.  [ ] **Validation (Client & Server):**
    *   "Sell" quantity cannot exceed current holding quantity for that ticker.
    *   Price and Qty must be positive.
5.  [ ] **Server Action:** Integrate with `recordInvestmentTransaction` (from Story 4.1 logic).
    *   Ensure it handles the atomic update of the `holdings` table.
6.  [ ] **Feedback:** Show success toast and refresh the Portfolio page.

## Dev Notes (Context)

**1. Ticker Search Implementation:**
*   *Fast Path:* Search local `assets` table first.
*   *Slow Path:* If not found locally, allow user to type a ticker and "Search Market" (calls Yahoo API via Server Action to validate and insert into `assets` table if valid).
*   *UX:* Use shadcn `Combobox` / `Command`.

**2. Handling "Fees":**
Fees are distinct from price.
*   *Buy Cost Basis:* `(Price * Qty) + Fees`
*   *Sell Net Proceeds:* `(Price * Qty) - Fees`
Ensure the form captures this explicitly as it lowers the tax burden.

**3. "Sell" Validation Logic:**
When Type is "Sell":
1.  Fetch current holding for this `account_id` + `ticker`.
2.  If `current_holding.qty < sell_qty`, throw error: "Insufficient holdings".

**4. Server Action Signature:**

// lib/actions/investments.ts
export async function addTransaction(data: InvestmentFormData) {
  // 1. Validate Zod
  // 2. If Ticker new, add to assets table
  // 3. db.transaction(async (tx) => {
  //      Insert Transaction
  //      Update Holding (Weighted Avg logic)
  //    })
  // 4. revalidatePath('/portfolio')
}

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-4.4-investment-entry"
  title: "Manual Investment Entry"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "zod"
    - "react-hook-form"
    - "cmdk" (for combobox)
  shadcn_components_to_add:
    - "dialog"
    - "form"
    - "command"
    - "popover"
    - "calendar" (date picker)
  folder_structure:
    - "/components/portfolio/add-investment-dialog.tsx"
    - "/components/portfolio/ticker-search.tsx"
    - "/lib/actions/investments.ts" (Update)
    - "/lib/validations/investment.ts"
  logic_constraints:
    - "Prevent selling more than owned"
    - "Fees must be stored separately"
  verify: "Search for 'AAPL'. Add a Buy of 10 units. Add a Sell of 5 units. Check if Holdings shows 5 units remaining."