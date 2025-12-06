# Story 5.6: FIRE Projection (Financial Independence)

**Status:** Done
**Epic:** 5. Debt & Planning
**Story:**
**As a** User,
**I want** to see when I will achieve Financial Independence (FIRE) based on my current habits,
**So that** I stay motivated to maintain a high savings rate.

## Acceptance Criteria
1.  [x] **Logic:** Implement `calculateFIREProjection` utility.
    *   **FI Number:** `Annual Expenses * 25` (Standard 4% Rule).
    *   **Current Net Worth:** Sum of all Assets - Sum of all Debts.
    *   **Annual Savings:** `Average Monthly Savings * 12`.
    *   **Growth Rate:** Default 7% (inflation-adjusted market return).
2.  [x] **Projection Loop:** Calculate Net Worth growth year-over-year until it hits the FI Number.
    *   Return: `YearsToFI`, `RetirementDate`.
3.  [x] **UI Component:** Create `FIREChart` component (Recharts).
    *   X-Axis: Years (Now -> Future).
    *   Line 1: Projected Net Worth.
    *   Line 2 (Reference): FI Number (Horizontal Line).
    *   Intersection Point: Highlight the "Freedom Date".
4.  [x] **"What-If" Simulator:** Add a slider for "Monthly Savings".
    *   Moving the slider instantly updates the chart and date.
    *   *Insight:* "Saving €X more per month brings retirement Y years closer."
5.  [x] **Page:** Add this to the `/planning` dashboard.

## Implementation Notes

- Files added: `src/lib/planning/fire.ts`, `src/app/api/planning/calculate-fire/route.ts`, `src/components/planning/fire-chart.tsx`, `src/components/planning/fire-simulator.tsx`, `src/components/planning/client-fire-sim.tsx`.
- Server Action: `calculateFIREProjectionForUser` in `src/lib/actions/planning.ts` exposed the server utility function.
- Data sources: Net worth uses holdings (from `getPortfolioData`) + account balances; Average expense derived from `monthly_summaries`, fallback patterns handled.
- UI: Slider updates projection via API; chart shows net worth and a FI target line; impact shown in small cards (years to FI, retirement date, annual savings).

## Dev Notes (Context)

**1. The Math (Simplified for MVP):**

let currentNW = netWorth;
let year = 0;
while (currentNW < fiNumber) {
  // Add investment growth
  currentNW += currentNW * 0.07; 
  // Add new savings
  currentNW += annualSavings;
  year++;
  if (year > 50) break; // Cap at 50 years
}

**2. Data Sources:**
*   **Net Worth:** Reuse `getPortfolioData` + `getSafeToSpend` logic (Total Assets - Total Liabilities).
*   **Expenses:** Reuse `monthly_summaries` average.

**3. Visuals:**
*   Use the "Oceanic Trust" palette.
*   **Net Worth Line:** Primary Teal (`#0D9488`).
*   **FI Target Line:** Success Green (`#10B981`).
*   **Intersection:** Show a Tooltip: "You are Free! 🎉 (Year 2032)".

**4. Portuguese Context:**
While the "4% Rule" is US-centric, it is widely used in the EU FIRE community.
*   *Optional Polish:* Allow user to adjust "Safe Withdrawal Rate" (e.g., 3.5% is safer for EU due to lower bond yields/taxes), but default to 4%.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-5.6-fire-projection"
  title: "FIRE Projection"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "recharts"
    - "date-fns"
  shadcn_components_to_add:
    - "slider"
    - "card"
    - "switch" (for advanced settings)
  folder_structure:
    - "/components/planning/fire-chart.tsx"
    - "/components/planning/fire-simulator.tsx"
    - "/lib/planning/fire.ts"
  logic_constraints:
    - "Default Growth Rate: 7%"
    - "Default Withdrawal Rate: 4%"
  verify: "Set Net Worth 0, Expenses 40k, Savings 20k/yr. Verify chart shows ~15-17 years to reach 1M."