# Story 5.3: Debt Dashboard & Insights

**Status:** Done
**Epic:** 5. Debt & Planning
**Story:**
**As a** User,
**I want** to visualize my debt payoff timeline and simulate extra payments,
**So that** I can choose the strategy that saves me the most money or time.

## Acceptance Criteria
1.  [x] **Page:** Create `/planning/debt` page.
2.  [x] **Summary Header:** Display Total Debt, Average Interest Rate, and Projected Payoff Date (Default strategy).
3.  [x] **Simulator UI:** Implement the `DebtSimulator` component.
    *   **Input:** "Extra Monthly Payment" Slider (Range: €0 - €1000).
    *   **Toggle:** Strategy Switcher (Avalanche vs. Snowball).
4.  [x] **Visualization:** Use `Recharts` to plot "Balance Over Time" for the selected strategy.
    *   X-Axis: Time (Months/Years).
    *   Y-Axis: Total Balance.
    *   *Bonus:* Show "Current Path" (Min payments only) as a ghost line for comparison.
5.  [x] **Impact Card:** Display a dynamic card: "By paying an extra €[X], you will be debt-free [Y] months earlier and save €[Z] in interest."
6.  [x] **Recommendation:** Highlight the "Avalanche" strategy with a "Financially Optimal" badge and "Snowball" with "Psychological Win" badge.

## Implementation Notes

- Files added: `src/components/planning/debt-simulator.tsx`, `src/components/planning/payoff-chart.tsx`, `src/app/(dashboard)/planning/debt/page.tsx`, and API route `src/app/api/planning/calculate-strategy/route.ts`.
- Backend: `calculateDebtStrategy` implemented in `src/lib/planning/debt.ts`; wrapper `calculateDebtStrategyForUser` in `src/lib/actions/planning.ts`.
- UI: Slider and strategy toggle implemented, with debounced server fetch. Recharts used for plot with baseline and selected strategy lines.
- Empty state: page displays 'Debt Free!' when no credit_card/loan accounts found.

## Dev Notes (Context)

**1. Data Fetching:**
*   Call `calculateDebtStrategy(userId, extraPayment)` (from Story 5.2) via a Server Action.
*   Since the slider needs instant feedback, consider fetching the *baseline* data once, but re-fetching the simulation data `onChange` (debounced) or `onCommit` of the slider.

**2. Recharts Configuration:**
*   **Line Chart:**
    *   Line 1 (Red/Orange): Baseline (Min Payments).
    *   Line 2 (Green/Teal): Optimized Strategy.
*   **Tooltip:** Show date and balance at that point.

**3. Visual Logic:**
*   **Avalanche:** Usually saves more *Interest*.
*   **Snowball:** Usually clears specific *Accounts* faster (count of debts drops).
*   *UI Tip:* Show the "Interest Saved" number in Green (`text-success`).

**4. Empty State:**
If the user has no accounts of type `credit_card` or `loan`, show a "Debt Free! 🎉" celebration state.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-5.3-debt-ui"
  title: "Debt Dashboard & Insights"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "recharts"
    - "lucide-react"
  shadcn_components_to_add:
    - "slider"
    - "tabs" (for strategy toggle)
    - "card"
    - "badge"
  folder_structure:
    - "/app/(dashboard)/planning/debt/page.tsx"
    - "/components/planning/debt-simulator.tsx"
    - "/components/planning/payoff-chart.tsx"
    - "/lib/actions/planning.ts"
  visual_logic:
    avalanche_color: "#0D9488 (Primary)"
    snowball_color: "#F59E0B (Warning/Orange)"
    baseline_color: "#64748B (Slate)"
  verify: "Move the slider to €100. Verify the Chart line drops faster and the 'Interest Saved' number increases."