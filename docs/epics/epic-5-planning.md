# Epic 5: Debt & Planning (The Future)

**Goal:** Provide users with strategic tools to pay off debt efficiently, save for specific goals, and project their financial independence (FIRE).
**Prerequisites:** Epic 2 complete (Core Data), Epic 3 complete (Monthly Summaries for savings rate).

## Stories

### Story 5.1: Debt Data Enrichment
**As a** User,
**I want** to add details to my loan accounts (Interest Rate, Min Payment),
**So that** Cora can calculate the best payoff strategy.

**Acceptance Criteria:**
1.  Update `accounts` table to support `interest_rate`, `min_payment`, and `due_date` for debt types.
2.  Update "Edit Account" UI to expose these fields only for Credit Cards and Loans.
3.  **Validation:** Interest rate must be a percentage (0-100).
4.  **Visuals:** Display debt accounts with a distinct visual style (e.g., Orange accents) in the Accounts list.

### Story 5.2: Debt Strategy Engine (Simulator)
**As a** System,
**I want** to simulate different payoff methods,
**So that** I can show the user how much time and money they can save.

**Acceptance Criteria:**
1.  Implement `calculateDebtStrategy` utility.
2.  **Input:** List of debts, Total Monthly Budget for Debt.
3.  **Simulation A (Avalanche):** Pay minimums on all, put excess towards *highest interest rate*.
4.  **Simulation B (Snowball):** Pay minimums on all, put excess towards *lowest balance*.
5.  **Output:** Payoff Date and Total Interest Paid for both scenarios.

### Story 5.3: Debt Dashboard & Insights
**As a** User,
**I want** to see a comparison of strategies,
**So that** I can choose the one that motivates me.

**Acceptance Criteria:**
1.  Create `DebtView` page.
2.  **Visuals:** "Time to Debt Free" chart comparing Current vs. Optimized path.
3.  **Insight Integration:** If the user has extra cash (from Safe-to-Spend), generate an Insight: "Pay €50 extra to [Card Name] to save €20 in interest."
4.  **Recommendation:** Highlight "Avalanche" as the "Cheapest" option and "Snowball" as the "Fastest Win" option.

### Story 5.4: Goal Management (Savings Buckets)
**As a** User,
**I want** to set up specific savings goals (e.g., "Vacation", "New Car"),
**So that** I can track my progress.

**Acceptance Criteria:**
1.  Create `goals` table (name, target_amount, current_amount, deadline, type).
2.  Create "Add Goal" UI.
3.  **Visuals:** Progress bars with "On Track" / "Behind" indicators based on the deadline.
4.  **Linkage:** Allow linking a Goal to a specific Savings Account (auto-update `current_amount` from account balance).

### Story 5.5: Emergency Fund Calculator
**As a** User,
**I want** to know exactly how much I need for a safety net,
**So that** I feel secure.

**Acceptance Criteria:**
1.  Calculate `Average Monthly Expenses` (based on last 3 months of data from Epic 3).
2.  **Logic:** Target = `Average Expenses * User Preference (3, 6, or 12 months)`.
3.  Display as a special "System Goal" on the Dashboard.
4.  **Insight:** If `Total Liquid Cash < Target`, generate a `Warning` insight: "Emergency Fund below target."

### Story 5.6: FIRE Projection (Financial Independence)
**As a** User,
**I want** to see when I can retire based on my current habits,
**So that** I stay motivated to save.

**Acceptance Criteria:**
1.  Implement `calculateFIRE` utility.
2.  **Inputs:** Current Net Worth, Average Monthly Spend, Safe Withdrawal Rate (default 4%).
3.  **Projection:** Calculate the "Crossover Point" where `Invested Assets * 0.04 > Annual Expenses`.
4.  **Visuals:** A simple line chart showing Net Worth growth vs. FI Number.
5.  **What-If:** Allow user to toggle "Savings Rate" slider to see how it affects the date.