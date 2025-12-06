# Story 5.4: Goal Management (Savings Buckets)

**Status:** Done
**Epic:** 5. Debt & Planning
**Story:**
**As a** User,
**I want** to create specific savings goals and track their progress,
**So that** I stay motivated to save for things I care about.

## Acceptance Criteria
1.  [x] **Schema:** Create `goals` table in Drizzle/Supabase.
    *   Fields: `id`, `user_id`, `name`, `target_amount`, `current_amount`, `deadline` (Date), `linked_account_id` (Nullable FK).
2.  [x] **Page:** Create `/planning/goals` page (or a tab within `/planning`).
3.  [x] **Add Goal UI:** Create a Dialog form to add a new goal.
    *   *Smart Link:* Allow user to select a "Savings Account" to link. If linked, `current_amount` should be read-only (synced from account balance).
    *   *Manual:* If not linked, user manually updates `current_amount`.
4.  [x] **Goal Card UI:** Display each goal as a card.
    *   **Visuals:** Title, Amount (Current / Target), Deadline.
    *   **Progress Bar:** Visual indicator of % complete. Color changes based on status (Green = On Track, Yellow = Behind).
5.  [x] **Logic:** Calculate "Monthly Savings Needed" to hit the deadline based on the remaining amount.
    *   Display: "Save €X/month to reach goal by [Date]."
6.  [x] **Confetti:** If a goal reaches 100%, trigger a confetti animation (Micro-interaction).

## Implementation Notes

- Files added: `src/components/planning/goal-card.tsx`, `src/components/planning/add-goal-dialog.tsx`, `src/app/(dashboard)/planning/goals/page.tsx`.
- Server actions and validations already implemented in `src/lib/actions/goals.ts` and `src/lib/validations/goals.ts`.
- Confetti uses `canvas-confetti` and is fired when a goal reaches 100%.
- Linked account selection is supported in the Add Goal dialog, and account balances are fetched and used to display current progress on goal cards.

## Dev Notes (Context)

**1. Schema Definition (`goals`):**

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => profiles.id),
  name: text("name").notNull(),
  target_amount: decimal("target_amount").notNull(),
  current_amount: decimal("current_amount").default("0"),
  deadline: date("deadline"),
  linked_account_id: uuid("linked_account_id").references(() => accounts.id), // Optional
  created_at: timestamp("created_at").defaultNow(),
});

**2. "Linked Account" Logic:**
If `linked_account_id` is present:
*   The Goal Card should fetch the *current balance* of that account dynamically (or update `current_amount` whenever the account updates via triggers).
*   *Simpler MVP:* Just fetch the account balance at runtime when rendering the Goal Card and display that instead of `current_amount`.

**3. "On Track" Calculation:**
*   `MonthsRemaining = differenceInMonths(deadline, today)`
*   `AmountNeeded = Target - Current`
*   `RequiredMonthly = AmountNeeded / MonthsRemaining`
*   *Visual:* If `RequiredMonthly` is suspiciously high (e.g., > 50% of income), show a warning icon.

**4. UI Polish:**
Use `shadcn/ui` Progress component.
*   `<Progress value={percentage} className="h-2" />`

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-5.4-goal-management"
  title: "Goal Management"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "date-fns"
    - "canvas-confetti" (for the celebration)
    - "@types/canvas-confetti"
  shadcn_components_to_add:
    - "progress"
    - "dialog"
    - "popover"
    - "calendar"
  folder_structure:
    - "/app/(dashboard)/planning/goals/page.tsx"
    - "/components/planning/goal-card.tsx"
    - "/components/planning/add-goal-dialog.tsx"
    - "/lib/actions/goals.ts"
    - "/db/schema.ts"
  logic_constraints:
    - "Target amount must be > 0"
    - "Deadline must be in the future"
  visual_logic:
    progress_bar: "bg-primary"
    completed: "bg-success"
  verify: "Create a goal 'New Laptop' for €2000. Set current to €1000. Verify progress bar is 50%. Set to €2000 and verify confetti fires."