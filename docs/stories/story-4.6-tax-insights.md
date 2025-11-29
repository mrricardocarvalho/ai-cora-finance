# Story 4.6: Tax Optimization Insights

**Status:** Approved
**Epic:** 4. Investment Engine
**Story:**
**As a** User,
**I want** to be alerted when I have an opportunity to lower my taxes (Tax-Loss Harvesting),
**So that** I don't pay more to the IRS than necessary.

## Acceptance Criteria
1.  [ ] **Analysis Logic:** Implement `detectTaxHarvesting(userId)` in `lib/intelligence/tax.ts`.
2.  [ ] **Trigger:** Hook this analysis to run after `syncMarketData` (Story 4.2) or when the Portfolio page is loaded.
3.  [ ] **The Rule:**
    *   Iterate through all current `holdings`.
    *   Check if `Current Price < Avg Cost Basis` (Unrealized Loss).
    *   If `Unrealized Loss > €100` (Threshold to avoid noise), flag as opportunity.
4.  [ ] **Insight Generation:** Create an `Opportunity` insight record:
    *   Title: "Tax-Loss Harvesting Opportunity"
    *   Message: "Selling [Ticker] could generate a €[Amount] loss to offset other capital gains."
    *   Action Link: `/portfolio`
    *   Score Impact: +5
5.  [ ] **Visuals:** Display a specific "IRS Shield" icon or badge on the Insight Card (using the Terracotta color `#E17055`).
6.  [ ] **Disclaimer:** Ensure the Insight Card includes a subtle footer: *"Not financial advice. Consult a tax professional."*

## Dev Notes (Context)

**1. What is Tax-Loss Harvesting?**
If you made €1000 profit on Stock A, you owe €280 tax (28%).
If you have a €500 loss on Stock B, you can sell Stock B to "realize" the loss.
Net Profit = €1000 - €500 = €500.
New Tax = €140. **You saved €140.**

**2. Integration:**
*   Reuse `createInsight` from Story 3.4.
*   Reuse `holdings` data from Story 4.1.

**3. Idempotency (Critical):**
Do not spam the user. If we generated a "Harvest [Ticker]" insight today, do not generate it again for 7 days unless the loss increases significantly (> 20%).

**4. UI Polish:**
Use the `Badge` component with the specific Tax Color defined in Story 1.1 (`tax_accent`).

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-4.6-tax-insights"
  title: "Tax Optimization Insights"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "drizzle-orm"
  folder_structure:
    - "/lib/intelligence/tax.ts" (Update)
    - "/lib/actions/insights.ts" (Update)
    - "/components/insights/insight-card.tsx" (Update for Tax Badge)
  logic_constraints:
    - "Threshold: Loss must be > 100 EUR"
    - "Frequency: Max 1 alert per ticker per week"
  visual_logic:
    tax_badge: "bg-[#E17055] text-white"
  verify: "Mock a holding with Cost=1000, Current=500. Run detection. Verify 'Opportunity' insight appears in Feed with Tax Badge."
