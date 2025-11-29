# Story 3.1: Recurring Pattern Detection Engine

**Status:** Approved
**Epic:** 3. Intelligence & Insights
**Story:**
**As a** System,
**I want** to analyze transaction history to identify subscriptions and recurring bills,
**So that** I can predict future liabilities for the "Safe-to-Spend" calculation.

## Acceptance Criteria
1.  [ ] **Schema:** Create a `recurring_patterns` table to store detected bills (merchant, amount, frequency, next_due_date).
2.  [ ] **Detection Logic:** Implement a utility `detectRecurringPatterns(userId)` that scans the `transactions` table.
3.  [ ] **Algorithm:** Identify transactions with:
    *   Same Description (fuzzy match or exact).
    *   Similar Amount (+/- 5% variance).
    *   Regular Interval (Monthly).
4.  [ ] **Action:** When a pattern is found:
    *   Insert/Update row in `recurring_patterns`.
    *   Update the specific rows in `transactions` setting `is_recurring = true`.
5.  [ ] **Trigger:** Hook this logic to run after `uploadStatement` (Story 2.4/2.5) completes.
6.  [ ] **Verification:** Uploading 3 months of data with "Netflix" charges results in a "Netflix" entry in the `recurring_patterns` table.

## Dev Notes (Context)

**1. Database Schema (`recurring_patterns`):**
This table was implied in the Architecture Section 5.1 inputs.

export const recurring_patterns = pgTable("recurring_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => profiles.id),
  merchant_name: text("merchant_name").notNull(),
  amount: decimal("amount").notNull(),
  frequency: text("frequency").default("monthly"), // 'monthly', 'yearly'
  last_date: date("last_date"),
  next_date: date("next_date"), // Projected
  category: text("category"),
  is_active: boolean("is_active").default(true),
});

**2. Detection Algorithm (Heuristic):**
Keep it simple for MVP.
*   Group transactions by `description`.
*   If a group has >= 2 entries AND dates are roughly ~30 days apart (+/- 5 days) -> It's a subscription.
*   Calculate `next_date` by adding 1 month to `last_date`.

**3. Integration Point:**
Update `lib/actions/upload.ts`. After the AI inserts transactions, call `await detectRecurringPatterns(userId)`.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-3.1-recurring-detection"
  title: "Recurring Pattern Detection Engine"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "date-fns" (for date math)
  folder_structure:
    - "/lib/intelligence/recurring.ts" (Logic)
    - "/db/schema.ts" (Update with new table)
    - "/lib/actions/upload.ts" (Hook integration)
  schema_requirements:
    table: "recurring_patterns"
    fields: [id, user_id, merchant_name, amount, frequency, last_date, next_date, is_active]
  algorithm_constraints:
    - "Minimum 2 occurrences to flag as recurring"
    - "Monthly frequency default"
  verify: "Manually insert 2 transactions for 'Spotify' 1 month apart. Run detection. Check if 'recurring_patterns' table has a Spotify entry."
