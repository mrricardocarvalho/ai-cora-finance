# Story 2.2: Account Management (CRUD)

**Status:** Approved
**Epic:** 2. Banking & Data Ingestion
**Story:**
**As a** User,
**I want** to manually add, edit, and delete my bank accounts,
**So that** I can organize my transaction sources and see my current balances.

## Acceptance Criteria
1.  [x] **Page:** Create the `/data` page (protected route).
2.  [x] **List UI:** Display a list/grid of existing accounts.
    *   Show: Name, Institution, Balance, Type.
    *   Visuals: Use `Card` component. Distinct icon/color for "Debt" types vs "Asset" types.
3.  [x] **Add Action:** Create an "Add Account" button that opens a `Dialog` (Modal).
4.  [x] **Form:** Implement a form with Zod validation:
    *   Name (Required)
    *   Institution (Text)
    *   Type (Select: Checking, Savings, Credit Card, Loan, Broker)
    *   Balance (Decimal/Currency input)
5.  [x] **Server Actions:** Implement `createAccount`, `updateAccount`, and `deleteAccount` in `lib/actions/accounts.ts`.
6.  [x] **UX:** Show success toast on creation. Handle loading states (disable button while saving).
7.  [x] **Empty State:** If no accounts exist, show a friendly empty state with a call to action.

**Verification Notes:**
- Added `src/app/(dashboard)/data/page.tsx` rendering the accounts list and add modal.
- Implemented `src/components/accounts/*` components for list, form and delete confirmation.
- Implemented Zod validation in `src/lib/validations/accounts.ts` and server actions in `src/lib/actions/accounts.ts` that ensure server-side validation and revalidation of `/data` after changes.
- The server actions use the server Supabase client and will respect RLS policies.
- Added minimal success UX via `window.alert` and loading state toggles; created friendly empty state when accounts list is empty.

To verify manually:
1. Start the dev server: `npm run dev`.
2. Log in to your Supabase-backed app and visit `/data`.
3. Click "Add Account", fill the form and submit — you should see the account appear in the list after the modal closes. Use different users to confirm RLS.

## Dev Notes (Context)

**1. UI Components (shadcn/ui):**
*   `Dialog` (for the form)
*   `Form` + `Input` + `Select`
*   `Card` (to display accounts)
*   `AlertDialog` (for delete confirmation - safety first!)

**2. Server Action Pattern:**

// lib/actions/accounts.ts
'use server'
import { db } from '@/db'
import { accounts } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function createAccount(data: AccountSchema) {
  // 1. Auth check
  // 2. Validate Zod
  // 3. Insert into DB (user_id is auto-injected from session)
  // 4. revalidatePath('/data')
}

**3. Currency Handling:**
*   Store as `decimal` in DB.
*   Input should allow decimals (e.g., "1250.50").
*   Display using the Portuguese formatter: `Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })`.

**4. Account Types:**
Map the Enum from Story 2.1 to user-friendly labels:
*   `checking` -> "Conta à Ordem"
*   `savings` -> "Conta Poupança"
*   `credit_card` -> "Cartão de Crédito"
*   `loan` -> "Empréstimo"
*   `broker` -> "Investimentos"

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-2.2-account-crud"
  title: "Account Management (CRUD)"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "zod"
    - "react-hook-form"
    - "lucide-react"
  shadcn_components_to_add:
    - "dialog"
    - "alert-dialog"
    - "toast"
    - "select"
  folder_structure:
    - "/app/(dashboard)/data/page.tsx"
    - "/components/accounts/account-list.tsx"
    - "/components/accounts/account-form.tsx"
    - "/components/accounts/delete-account-dialog.tsx"
    - "/lib/actions/accounts.ts"
    - "/lib/validations/accounts.ts" (Zod)
  database_table: "accounts"
  localization: "pt-PT"
  verify: "User can add a 'Moey' account with 1000€ and see it appear in the list."
