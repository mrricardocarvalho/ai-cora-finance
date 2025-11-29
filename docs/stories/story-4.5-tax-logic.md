# Story 4.5: Portuguese Tax Logic Engine (FIFO)

**Status:** Approved
**Epic:** 4. Investment Engine
**Story:**
**As a** System,
**I want** to calculate capital gains using the First-In-First-Out (FIFO) method,
**So that** the tax estimates comply with Portuguese IRS rules and the user knows their true liability.

## Acceptance Criteria
1.  [ ] **Logic Utility:** Implement `calculateFIFOGains(transactions)` in `lib/intelligence/tax.ts`.
2.  [ ] **FIFO Algorithm:**
    *   Fetch all `BUY` transactions for a specific ticker (sorted by Date ASC).
    *   Fetch all `SELL` transactions (sorted by Date ASC).
    *   Iterate through Sells, "depleting" the Buys from oldest to newest.
    *   Match quantities to determine the specific Cost Basis for each Sell.
3.  [ ] **Tax Calculation:**
    *   `Gain = (SellPrice * Qty) - (BuyPrice * MatchedQty) - SellFees - BuyFees`.
    *   `Tax = Gain * 0.28` (Standard PT Rate).
    *   If Gain < 0, Tax = 0 (Loss).
4.  [ ] **Portfolio Integration:** Update the `getPortfolioData` action to run this calculation for *hypothetical* sells (i.e., "Unrealized Tax Liability").
    *   *Scenario:* "If I sold everything today, what would I owe?"
5.  [ ] **UI Update:** Add a "Tax Exposure" card or tooltip to the Portfolio view showing the estimated 28% liability on unrealized gains.

## Dev Notes (Context)

**1. The FIFO Algorithm (Example):**
*   **Buy A:** Jan 1, 10 units @ €100.
*   **Buy B:** Feb 1, 10 units @ €120.
*   **Sell X:** Mar 1, 5 units @ €150.

*   *Logic:* We sell 5 units from **Buy A** (Oldest).
*   *Cost Basis:* 5 * €100 = €500.
*   *Proceeds:* 5 * €150 = €750.
*   *Gain:* €250.
*   *Remaining Inventory:* 5 units of Buy A, 10 units of Buy B.

**2. Data Structure:**
You will need a helper class or function that maintains an "Inventory" of batches.

interface TaxLot {
  date: Date;
  price: number;
  qtyRemaining: number;
  fees: number;
}

**3. Portuguese Nuances:**
*   Tax rate is flat **28%** for capital gains.
*   Losses can offset gains (Tax Loss Harvesting), but for this story, just calculate the raw liability per asset.

**4. Performance:**
This calculation happens in memory based on the transaction history. It should be fast enough for typical user portfolios (< 1000 trades).

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-4.5-tax-logic"
  title: "Portuguese Tax Logic Engine (FIFO)"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "date-fns"
  folder_structure:
    - "/lib/intelligence/tax.ts"
    - "/lib/actions/portfolio.ts" (Update)
    - "/components/portfolio/tax-exposure-card.tsx"
  logic_constraints:
    - "FIFO (First-In, First-Out) is mandatory"
    - "Tax Rate = 0.28"
    - "Include fees in cost basis calculation"
  verify: "Create test: Buy 10@100, Buy 10@200. Sell 10@300. Gain should be based on the 100 price (2000 profit), not average."