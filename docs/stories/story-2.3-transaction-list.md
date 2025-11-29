# Story 2.3: Transaction List UI (The "Smart" List)

**Status:** Approved
**Epic:** 2. Banking & Data Ingestion
**Story:**
**As a** User,
**I want** to view my transactions with clear visual cues for income, expenses, and uncertain categories,
**So that** I can quickly validate my financial data.

## Acceptance Criteria
1.  [x] **Server Action:** Implement `getTransactions` with support for Pagination (page, pageSize) and Filtering (by account_id).
2.  [x] **Desktop UI (Table):** Implement a `DataTable` (using `@tanstack/react-table` via shadcn) for desktop view.
    *   Columns: Date, Description, Category, Amount, Status/Actions.
3.  [x] **Mobile UI (List):** Implement a card-based list view for mobile.
    *   Layout: Description (Top), Date (Sub), Amount (Right).
    *   Interaction: Tap to view details (Sheet/Drawer).
4.  [x] **Visual Logic:**
    *   **Income:** Display amounts in Green (`text-success`).
    *   **Expense:** Display amounts in Slate/Red (`text-primary` or `text-danger`).
    *   **Confidence:** If `confidence_score < 0.8` (or null), display a yellow "Review" badge or border.
5.  [x] **Pagination:** Implement "Next/Prev" controls or "Load More" button.
6.  [x] **Formatting:** Dates in `DD/MM/YYYY`, Currency in `pt-PT` format.

**Verification Notes:**
- Implemented `getTransactions` at `src/lib/actions/transactions.ts` for server-side pagination and optional account filtering.
- Desktop table at `src/components/transactions/transaction-table.tsx` uses `@tanstack/react-table` and formats dates and amounts correctly.
- Mobile list at `src/components/transactions/mobile-transaction-list.tsx` shows card layout and highlights low confidence entries with a warning badge.
- Pagination implemented via `src/components/transactions/TransactionListContainer.tsx` using `Load More` with client-side Supabase fetching and appending results.
- Manual verifications:
  1. Run `npm run dev` and visit `/dashboard` or `/data`.
  2. Ensure transactions are visible in desktop/table and mobile layouts (use responsive dev tools).
  3. Insert a low-confidence transaction with `confidence_score: 0.5` and verify the 'Review' badge and yellow highlight appear.

## Dev Notes (Context)

**1. Data Fetching Strategy:**
*   Use a Server Action `getTransactions({ page: 1, limit: 20 })`.
*   Return `{ data: Transaction[], metadata: { totalCount, totalPages } }`.
*   Sort by `date` DESC (newest first).

**2. The "Confidence" Logic:**
Even though we haven't built the AI parser yet, we need the UI to support the concept.
*   *Mock Data:* When testing, insert a few dummy transactions with `confidence_score: 0.5` to verify the "Review" UI state works.

**3. Responsive Implementation:**
You don't need two separate data fetches. Fetch once, render differently based on CSS media queries (Tailwind `hidden md:block`).
*   `<div className="hidden md:block"><DataTable /></div>`
*   `<div className="md:hidden"><MobileTransactionList /></div>`

**4. Category Badge:**
Use the `Badge` component. Map category names to specific colors if possible (or just use a default for now).

**5. Libraries:**
*   `@tanstack/react-table` (Standard for shadcn/ui data tables).
*   `date-fns` (For date formatting).

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-2.3-transaction-list"
  title: "Transaction List UI"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "@tanstack/react-table"
    - "date-fns"
  shadcn_components_to_add:
    - "table"
    - "badge"
    - "dropdown-menu"
    - "sheet" (for mobile details)
    - "skeleton" (for loading states)
  folder_structure:
    - "/components/transactions/transaction-table.tsx" (Desktop)
    - "/components/transactions/mobile-transaction-list.tsx" (Mobile)
    - "/components/transactions/columns.tsx" (Table Defs)
    - "/lib/actions/transactions.ts"
  database_table: "transactions"
  pagination_size: 20
  verify: "User sees a list of transactions. Low confidence items are highlighted. Mobile view works."
