# Story 5.5: Emergency Fund Calculator

**Status:** Done
**Epic:** 5. Debt & Planning
**Story:**
**As a** User,
**I want** to calculate my ideal emergency fund based on my actual spending habits,
**So that** I have a realistic safety net, not just a guess.

## Acceptance Criteria
1.  [x] **Logic:** Implement `calculateEmergencyTarget(userId, months)` in `lib/planning/emergency.ts`.
    *   Fetch last 3-6 months of `monthly_summaries`.
    *   Calculate `Average Monthly Expense` (`total_out`).
    *   Target = `Average * months` (User selectable: 3, 6, 12).
    *   *Fallback:* If history < 1 month, use `Income * 0.8` or prompt user for estimate.
2.  [x] **UI Component:** Create `EmergencyFundWidget` (Special type of Goal Card).
    *   Display: Current Liquid Cash vs Target.
    *   Controls: Toggle for "3 Months", "6 Months", "1 Year".
3.  [x] **Integration:** Display this widget prominently on the `/planning` page.
4.  [x] **Insight Trigger:** If `Current Liquid Cash < 3 Months Target`:
    *   Generate `Warning` insight: "Emergency Fund Low. You have [X] months of runway."
5.  [x] **Visuals:** Use a "Shield" icon. Color scale:
    ## Implementation Notes

    - Files added: `src/lib/planning/emergency.ts`, `src/app/api/planning/calculate-emergency/route.ts`, `src/components/planning/emergency-fund-widget.tsx`.
    - Server action: `calculateEmergencyTargetForUser` in `src/lib/actions/planning.ts` delegates to `calculateEmergencyTarget` and triggers a warning insight when runway < 3 months.
    - Data sources: `monthly_summaries` is used to compute the average monthly expense; fallback uses last 30 days transactions; Liquid Cash is computed as sum of checking + savings.
    - Integration: Widget is added to `src/app/(dashboard)/planning/page.tsx` and initialized server-side.

    *   < 3 Months: Red/Orange.
    *   3-6 Months: Yellow.
    *   6+ Months: Green.

## Dev Notes (Context)

**1. Data Sources:**
*   **Current Liquid Cash:** Sum of all accounts where `type` IN ('checking', 'savings'). (Reuse `getSafeToSpend` logic components).
*   **Expenses:** Query `monthly_summaries` table (created in Story 3.6).

**2. The "Cold Start" Problem:**
If the user just signed up, `monthly_summaries` will be empty.
*   *UI Handling:* Show a "Calibrating..." state or allow manual input of "Estimated Monthly Spend" until 30 days of data are collected.

**3. Insight Logic:**
Run this check whenever the dashboard loads or transactions change (debounced).
*   `Runway = LiquidCash / AverageExpense`.
*   If `Runway < 3.0`, trigger Warning.

**4. Component Design:**
This looks like a Goal Card but is "System Managed."
*   Title: "Emergency Fund (Runway)"
*   Subtitle: "Based on your avg spend of €[X]/mo"
*   Progress Bar: Segments for 3mo, 6mo, 12mo.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-5.5-emergency-fund"
  title: "Emergency Fund Calculator"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "lucide-react"
  folder_structure:
    - "/components/planning/emergency-fund-widget.tsx"
    - "/lib/planning/emergency.ts"
    - "/lib/actions/planning.ts" (Update)
  logic_constraints:
    - "Liquid Cash = Checking + Savings only (No investments)"
    - "Average Expense = Mean of last 3 available months"
  visual_logic:
    shield_icon: "Lucide ShieldCheck"
    danger_zone: "text-danger"
    safe_zone: "text-success"
  verify: "Set Avg Spend to 1000. Set Liquid Cash to 2500. Widget should show '2.5 Months' and Yellow/Warning status."
