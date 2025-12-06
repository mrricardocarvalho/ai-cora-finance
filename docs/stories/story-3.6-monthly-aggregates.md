# Story 3.6: Monthly Spending Aggregates

**Status:** Approved
**Epic:** 3. Intelligence & Insights
**Story:**
**As a** User,
**I want** to see how my current spending compares to last month,
**So that** I can spot negative trends before they become problems.

## Acceptance Criteria
1.  [x] **Schema:** Create `monthly_summaries` table to store pre-calculated totals per user/month.
    *   Fields: `id`, `user_id`, `month` (Date/String YYYY-MM), `total_in`, `total_out`, `savings_rate`.
2.  [x] **Calculation Logic:** Implement a server-side recalculation service that updates this table whenever a transaction is added/updated/deleted (MVP strategy).
    *   *Note:* For MVP, a SQL Trigger is preferred for data integrity, but a robust Server Action recalculation is acceptable if SQL complexity is too high.
3.  [x] **UI Component:** Implement `QuickStatCard` from UX Spec v1.3.
    *   Props: `label`, `value`, `trend` ('up', 'down', 'neutral'), `trendValue` (e.g., "+12%").
4.  [x] **Dashboard Integration:** Display 3 Quick Stats on the Dashboard (Desktop Sidebar / Mobile Tab):
    *   **Net Worth:** (Sum of all accounts).
    *   **This Month:** (Total Out vs Last Month).
    *   **Savings Rate:** (Total In - Total Out) / Total In %.
5.  [x] **Visuals:**
    *   Spending Trend: Red if Up (Bad), Green if Down (Good).
    *   Savings Trend: Green if Up (Good), Red if Down (Bad).

## Dev Notes (Context)

**1. Database Schema (`monthly_summaries`):**

export const monthlySummaries = pgTable("monthly_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => profiles.id),
  month: date("month").notNull(), // First day of month
  total_in: decimal("total_in").default("0"),
  total_out: decimal("total_out").default("0"),
  updated_at: timestamp("updated_at").defaultNow(),
});

**2. The SQL Trigger Approach (Recommended):**
If using Drizzle Kit, you can add a `sql` migration file:

CREATE OR REPLACE FUNCTION update_monthly_summary() RETURNS TRIGGER AS $$
BEGIN
  -- Logic to recalculate total_in/out for the specific user and month
  -- Insert or Update monthly_summaries
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_summary
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_monthly_summary();

*Alternative (Simpler for MVP):* Just create a `recalculateMonth(userId, date)` function in TypeScript and call it inside `uploadStatement` and `createTransaction`.

**3. Trend Calculation:**
*   Fetch Current Month Summary.
*   Fetch Previous Month Summary.
*   `Trend % = ((Current - Previous) / Previous) * 100`.

**4. Component Design:**
See `ux-design-directions.html` "Quick Stat Cards" section.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-3.6-monthly-aggregates"
  title: "Monthly Spending Aggregates"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "date-fns"
  shadcn_components_to_add:
    - "card"
  folder_structure:
    - "/components/dashboard/quick-stat-card.tsx"
    - "/lib/actions/analytics.ts"
    - "/db/schema.ts"
  logic_preference: "TypeScript recalculation function (easier to debug than raw SQL triggers for now)"
  visual_logic:
    spending_up: "text-danger (Bad)"
    spending_down: "text-success (Good)"
  verify: "Add a transaction for 100€. Check if 'This Month' stat updates. Add transaction for last month. Check if Trend % updates."
