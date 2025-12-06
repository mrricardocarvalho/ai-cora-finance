# Story 5.1: Debt Data Enrichment

**Status:** Completed
**Epic:** 5. Debt & Planning
**Story:**
**As a** User,
**I want** to add interest rates and minimum payments to my loan accounts,
**So that** Cora can calculate the best payoff strategy for me.

## Acceptance Criteria
1.  [x] **Schema Update:** Modify the `accounts` table to include nullable fields:
    *   `interest_rate` (Decimal, e.g., 14.5 for 14.5%).
    *   `min_payment` (Decimal).
    *   `due_date` (Integer, 1-31, day of month).
2.  [x] **Migration:** Generate and apply Drizzle migration.
3.  [x] **Form UI Update:** Update the `AccountForm` (from Story 2.2).
    *   **Conditional Logic:** If Account Type is `credit_card` or `loan`, show the new fields.
    *   **Hide:** If Account Type is `checking`, `savings`, or `broker`, hide these fields.
4.  [x] **Validation:**
    *   Interest Rate must be between 0 and 100.
    *   Min Payment must be positive.
5.  [x] **List UI Update:** In the Account List, display a "Debt Badge" (Orange) for these accounts showing the Interest Rate (e.g., "14.5% APR").

## Dev Notes (Context)

**1. Schema Change:**

// db/schema.ts
export const accounts = pgTable("accounts", {
  // ... existing fields
  interest_rate: decimal("interest_rate"), // Nullable
  min_payment: decimal("min_payment"),     // Nullable
  due_date: integer("due_date"),           // Nullable
});

**2. Zod Schema Update:**
You need to update `lib/validations/accounts.ts`. Use `z.discriminatedUnion` or `superRefine` to make fields required *only* if type is debt.
*   *Simpler approach for MVP:* Make them optional in Zod, but show visual "Required" stars in UI if type is debt.

**Implementation Notes:**
- `src/db/schema.ts` updated to include `due_date` on `accounts` table and `db/migrations/0009_add_due_date_to_accounts.sql` was added.
- `src/lib/validations/accounts.ts` updated: `interest_rate`, `min_payment`, `due_date` optional with constraints (interest_rate between 0-100, min_payment >=0, due_date 1-31).
- `src/components/accounts/AccountForm.tsx` updated to show/hide these fields for `credit_card` and `loan` types and pass numeric values.
- `src/components/accounts/AccountList.tsx` shows a Debt Badge (Orange) for accounts with interest_rate.
- `src/lib/actions/accounts.ts` now persists the `interest_rate`, `min_payment`, and `due_date` fields.

**3. Visuals:**
Use the `--debt` color variable (`#F97316` / Orange) for the Interest Rate badge. This highlights the "cost" of the debt.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-5.1-debt-data"
  title: "Debt Data Enrichment"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "drizzle-orm"
    - "zod"
  folder_structure:
    - "/db/schema.ts"
    - "/components/accounts/account-form.tsx" (Update)
    - "/components/accounts/account-card.tsx" (Update)
    - "/lib/validations/accounts.ts" (Update)
  logic_constraints:
    - "Interest rate is percentage (0-100)"
    - "Fields only visible for 'credit_card' and 'loan' types"
  visual_logic:
    debt_accent: "text-orange-500 / bg-orange-100"
  verify: "Edit an existing Credit Card account. Add 18% APR. Verify it saves and shows an 18% badge in the list."