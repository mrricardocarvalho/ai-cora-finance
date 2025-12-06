# Story 3.2: Safe-to-Spend Calculator (The Brain)

**Status:** Approved
**Epic:** 3. Intelligence & Insights
**Story:**
**As a** User,
**I want** to know exactly how much liquid cash I have available *after* accounting for my safety net and upcoming bills,
**So that** I can spend guilt-free without breaking my budget.

## Acceptance Criteria
1.  [x] **Server Action:** Implement `getSafeToSpend(userId)` in `lib/intelligence/safe-spend.ts`.
2.  [x] **Liquid Assets Calculation:** Sum the `balance` of all accounts where `type` is 'checking' or 'savings'. (Ignore investments/debt).
3.  [x] **Comfort Floor Retrieval:** Fetch the `comfort_floor` value from the `profiles` table.
4.  [x] **Pending Bills Calculation:**
    *   Fetch active `recurring_patterns`.
    *   Filter for items where `next_date` is between **Today** and **End of Current Month**.
    *   Sum these amounts.
5.  [x] **The Formula:** `SafeSpend = LiquidAssets - ComfortFloor - PendingBills`.
6.  [x] **Status Logic:** Return a status enum along with the value:
    *   `Safe` (Value > 0)
    *   `Caution` (Value between 0 and -10% of floor)
    *   `Danger` (Value < -10% of floor)
7.  [x] **Verification:** Create a unit test or simple script to verify the math with mock data.

## Dev Notes (Context)

**1. The Math Logic (Example):**
*   **Date:** Nov 15th. End of Month: Nov 30th.
*   **Balances:** Moey (€1000) + Activo (€500) = **€1500**.
*   **Floor:** **€500**.
*   **Recurring Patterns:**
    *   Netflix (€15) - Due Nov 10th (Already paid, ignore).
    *   Rent (€800) - Due Nov 1st (Already paid, ignore).
    *   Gym (€40) - Due Nov 20th (**Include**).
    *   Internet (€50) - Due Nov 28th (**Include**).
*   **Pending Bills:** €40 + €50 = **€90**.
*   **Safe-to-Spend:** 1500 - 500 - 90 = **€910**.

**2. Date Handling:**
Use `date-fns` for robust date comparison.
*   `endOfMonth(new Date())`
*   `isAfter(billDate, today) && isBefore(billDate, endOfMonth)`

**3. Performance:**
Do **not** query the `transactions` table here. Query the `accounts` table (current balance) and `recurring_patterns` table. This ensures the calculation is instant (<50ms).

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-3.2-safe-spend-logic"
  title: "Safe-to-Spend Calculator"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "date-fns"
  folder_structure:
    - "/lib/intelligence/safe-spend.ts"
    - "/lib/actions/dashboard.ts" (Expose to UI)
  inputs:
    - "accounts table (checking/savings)"
    - "profiles table (comfort_floor)"
    - "recurring_patterns table (next_date)"
  logic_constraints:
    - "Only count bills due remaining in the current month"
    - "Ignore investment accounts"
  verify: "Run a script that sets Balance=1000, Floor=500, PendingBill=100. Result should be 400."