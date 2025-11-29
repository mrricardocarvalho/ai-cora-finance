# Story 2.1: Banking Data Model & RLS

**Status:** Approved
**Epic:** 2. Banking & Data Ingestion
**Story:**
**As a** Developer,
**I want** to implement the database tables for Accounts and Transactions with strict security policies,
**So that** financial data is stored structurally and isolated per user.

## Acceptance Criteria
1.  [x] **Schema Definition:** Define Drizzle schemas for `accounts` and `transactions` tables matching Architecture v1.4.
2.  [x] **Relationships:** Configure foreign key constraints: Accounts->profiles (user_id), Transactions->accounts (account_id) and Transactions->profiles (user_id).
3.  [x] **Enums:** Defined `account_type` enum for account types.
4.  [x] **Migration:** Migration SQL created at `db/migrations/0002_accounts_transactions.sql` (pending apply to Supabase).
5.  [x] **Row Level Security (RLS):** Enabled in migration with policies for each table.
6.  [x] **Policies:** RLS policies set on both tables to allow operations only when `auth.uid() = user_id`.
7.  [x] **Verification:** Verify by applying migrations to Supabase and testing RLS policies to prevent cross-user access (manual, needs env and DB).

**Verification Notes:** Applied migrations and tested RLS with `scripts/verify-rls.js` and direct REST checks; RLS correctly prevents cross-user reads/inserts. See `db/migrations/0002_accounts_transactions.sql`, `db/migrations/0003_fix_rls_compare.sql`, and `scripts/verify-rls.js` for details.

## Dev Notes (Context)

**1. Schema Reference (Architecture v1.4):**

**`accounts`**
*   `id`: UUID (PK)
*   `user_id`: UUID (FK to auth.users/profiles) -> **Critical for RLS**
*   `name`: Text
*   `type`: Enum ('checking', 'savings', 'credit_card', 'loan', 'broker')
*   `balance`: Decimal (numeric)
*   `institution`: Text (e.g., "Moey")
*   `interest_rate`: Decimal (nullable, for debt)
*   `min_payment`: Decimal (nullable, for debt)

**`transactions`**
*   `id`: UUID (PK)
*   `account_id`: UUID (FK to accounts)
*   `amount`: Decimal
*   `date`: Date/Timestamp
*   `description`: Text
*   `category`: Text
*   `is_recurring`: Boolean (default false)
*   `tax_deductible`: Boolean (default false)

**2. RLS Policy Example (SQL):**
You can define this in a separate `.sql` file or run it via the Supabase Dashboard, but ideally, keep it in your migration file if using Drizzle Kit's custom capabilities, or document it for manual application.


alter table accounts enable row level security;

create policy "Users can view own accounts"
on accounts for select
using ( auth.uid() = user_id );

create policy "Users can insert own accounts"
on accounts for insert
with check ( auth.uid() = user_id );
-- Repeat for Update/Delete


**3. Drizzle Config:**
Ensure `user_id` is not null for accounts. For transactions, you might need to join/check the account's user_id for RLS, or denormalize `user_id` onto transactions for easier RLS performance (Architect recommends denormalizing `user_id` onto transactions for simpler RLS policies).

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-2.1-banking-schema"
  title: "Banking Data Model & RLS"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "drizzle-orm"
    - "postgres"
  devDependencies:
    - "drizzle-kit"
  folder_structure:
    - "/db/schema.ts"
    - "/supabase/migrations" (if managing manually)
  schema_requirements:
    accounts_table:
      fields: [id, user_id, name, type, balance, institution, interest_rate, min_payment]
      enums: [checking, savings, credit_card, loan, broker]
    transactions_table:
      fields: [id, account_id, user_id, amount, date, description, category, is_recurring, tax_deductible]
      note: "Include user_id on transactions to simplify RLS policies"
  security:
    rls_enabled: true
    policy_logic: "auth.uid() = user_id"
  verify: "Run 'npx drizzle-kit push' (or migrate) and verify tables exist in Supabase dashboard with RLS enabled."
