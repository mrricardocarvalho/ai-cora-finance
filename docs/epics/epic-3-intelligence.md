# Epic 3: Intelligence & Insights

**Goal:** Implement the proactive intelligence engines that calculate "Safe-to-Spend," detect recurring patterns, and populate the Insight Feed.
**Prerequisites:** Epic 2 complete (Transactions are flowing into the system).

## Stories

### Story 3.1: Recurring Pattern Detection Engine
**As a** System,
**I want** to analyze transaction history to identify subscriptions and recurring bills,
**So that** I can predict future liabilities.

**Acceptance Criteria:**
1.  Create `recurring_patterns` table or flag in DB.
2.  Implement a background job (or Server Action) that scans `transactions`.
3.  **Logic:** Identify transactions with similar amounts (+/- 5%) and similar descriptions occurring on similar days of the month (e.g., "Netflix" on the 15th).
4.  Mark these transactions as `is_recurring = true`.
5.  Calculate the total "Monthly Fixed Costs" based on these patterns.

### Story 3.2: Safe-to-Spend Calculator (The Brain)
**As a** User,
**I want** to know exactly how much money I can spend today without breaking my budget,
**So that** I don't feel anxious about buying things.

**Acceptance Criteria:**
1.  Implement `calculateSafeSpend` Server Action.
2.  **Formula:** `(Sum of Checking/Savings) - (Comfort Floor) - (Sum of Pending Recurring Bills for current month)`.
3.  **Performance:** Ensure this query is optimized (use Aggregates if possible, or indexed queries).
4.  Return the value and a status (Safe/Caution/Danger).

### Story 3.3: Dashboard & Safe-to-Spend UI
**As a** User,
**I want** to see my Safe-to-Spend number prominently on the home screen,
**So that** I have instant clarity.

**Acceptance Criteria:**
1.  Implement the `SafeToSpendWidget` component.
2.  **Visuals:**
    *   Green text if > 0 ("Safe to spend").
    *   Red text if < 0 ("Over budget").
3.  **Localization:** Strict Portuguese formatting (`1.234,56 €`).
4.  **Interaction:** Tapping the widget shows the math breakdown (Total - Floor - Bills).

### Story 3.4: Insight Generation Engine (Infrastructure)
**As a** System,
**I want** to generate discrete "Insight" objects based on data events,
**So that** the user sees a feed of relevant information.

**Acceptance Criteria:**
1.  Create `insights` table (type, title, message, score_impact, status).
2.  Implement the **Event Listener** logic (e.g., via Database Triggers or Service Layer hooks).
3.  **Trigger 1 (Floor):** If `SafeSpend` drops below 10% of buffer -> Generate `Urgent` insight.
4.  **Trigger 2 (Subscription):** If a new recurring pattern is found -> Generate `Info` insight.
5.  **Trigger 3 (Health):** If `SafeSpend` increases vs last month -> Generate `Opportunity` insight.

### Story 3.5: The Insight Feed UI
**As a** User,
**I want** to see a prioritized list of insights instead of a static dashboard,
**So that** I know what requires my attention immediately.

**Acceptance Criteria:**
1.  Implement the `InsightFeed` component on the Home Page.
2.  **Sorting:** Urgent > Warning > Opportunity > Info > Date.
3.  **Components:** Use the `InsightCard` from UX Spec.
4.  **Interactions:**
    *   "Dismiss" removes from view.
    *   "Act" performs the linked action (e.g., "Review Subscription").
5.  **Gamification:** Display `+5 Health Score` toast animation when an insight is acted upon.

### Story 3.6: Monthly Spending Aggregates
**As a** User,
**I want** to see how my spending compares to last month,
**So that** I can track my trends.

**Acceptance Criteria:**
1.  Create `monthly_summaries` Materialized View (or table updated via triggers).
2.  Calculate `Total In`, `Total Out`, and `Savings Rate` per month.
3.  Display "Quick Stats" cards on Desktop Sidebar and Mobile Dashboard tab.
4.  Show trend indicators (e.g., "↓ 12% vs last month").