# Epic 2: Banking & Data Ingestion

**Goal:** Enable users to import, manage, and categorize their financial transactions from Portuguese banks.
**Prerequisites:** Epic 1 complete (Auth & DB connection established).

## Stories

### Story 2.1: Banking Data Model & RLS
**As a** Developer,
**I want** to set up the database tables for Accounts and Transactions,
**So that** we can store financial data securely.

**Acceptance Criteria:**
1.  Create `accounts` table (id, name, type, balance, institution).
2.  Create `transactions` table (id, amount, date, description, category, confidence_score).
3.  **Security:** Implement strict Row Level Security (RLS) policies on both tables (`auth.uid() = user_id`).
4.  Create Drizzle schema definitions and types.
5.  Run migration and verify RLS prevents cross-user access.

### Story 2.2: Account Management (CRUD)
**As a** User,
**I want** to manually add my bank accounts (e.g., Moey, ActivoBank),
**So that** I can organize my transaction sources.

**Acceptance Criteria:**
1.  Create "Add Account" Modal/Page.
2.  Support fields: Name, Type (Checking/Savings), Current Balance.
3.  Display list of accounts in the "Data" tab.
4.  Allow editing and deleting accounts (Cascade delete transactions).

### Story 2.3: Transaction List UI (The "Smart" List)
**As a** User,
**I want** to view my transactions with clear visual cues,
**So that** I can quickly spot errors or uncategorized items.

**Acceptance Criteria:**
1.  Implement `TransactionRow` component from UX Spec.
2.  **Visuals:** Green for income, Red for expense.
3.  **Confidence UI:** If `confidence_score < 0.8`, show "Review" badge/highlight (Yellow).
4.  **Responsiveness:** Mobile (Swipe actions) vs Desktop (Table view).
5.  Implement Pagination (as per UX v1.3) to handle large datasets.

### Story 2.4: PDF Upload & Stage 1 Parsing (Infrastructure)
**As a** User,
**I want** to upload a PDF bank statement,
**So that** I don't have to type transactions manually.

**Acceptance Criteria:**
1.  Create `uploadStatement` Server Action.
2.  Implement `pdf-parse` (Node.js) to extract raw text from the file.
3.  **Security:** File is processed in memory and NOT stored/saved to disk (Data Minimization).
4.  **UX:** Show "Transparent Processing" UI (Log: "Reading PDF...", "Extracting Text...").
5.  Output: Raw text string ready for AI.

### Story 2.5: AI Extraction & Categorization (Stage 2)
**As a** System,
**I want** to convert raw PDF text into structured JSON,
**So that** it can be stored in the database.

**Acceptance Criteria:**
1.  Connect to OpenAI API (GPT-4o-mini is sufficient/cheaper for this).
2.  Prompt Engineering: Instruct AI to extract Date, Description, Amount, and **Category** from the raw text.
3.  **Portuguese Context:** Instruct AI to recognize PT merchant names (e.g., "Continente", "Pingo Doce" -> Groceries).
4.  Insert extracted data into `transactions` table.
5.  Return "Receipt Summary" to UI (e.g., "Imported 45 transactions").

### Story 2.6: Bulk Edit & Correction
**As a** Power User,
**I want** to select multiple transactions and change their category at once,
**So that** I can fix AI mistakes efficiently.

**Acceptance Criteria:**
1.  Implement "Select Mode" (Long press on mobile, Checkbox on desktop).
2.  Show "Bulk Action Bar" when items are selected.
3.  Implement `bulkUpdateCategories` Server Action.
4.  **Keyboard Shortcuts:** Support `Space` to select, `C` to categorize (Desktop).