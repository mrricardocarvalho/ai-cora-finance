# Story 4.1: Investment Data Model (Event-Sourced)

**Status:** Approved
**Epic:** 4. Investment Engine
**Story:**
**As a** Developer,
**I want** to implement a robust database schema for Assets, Transactions, and Holdings,
**So that** the portfolio data remains mathematically accurate and audit-proof for tax purposes.

## Acceptance Criteria
1.  [ ] **Schema `assets`:** Create a table for global asset data (Ticker, Name, Type, Current Price).
2.  [ ] **Schema `investment_transactions`:** Create the "Source of Truth" table (Buy/Sell/Dividend, Qty, Price, Fees, Date).
3.  [ ] **Schema `holdings`:** Create the "Derived State" table (Current Qty, Avg Cost Basis).
4.  [ ] **Atomic Logic:** Implement a `recordInvestmentTransaction` Server Action using a **Database Transaction**.
    *   When a "Buy" is recorded -> Insert Transaction -> Update/Insert Holding (+Qty, Recalculate Avg Cost).
    *   When a "Sell" is recorded -> Insert Transaction -> Update Holding (-Qty).
5.  [ ] **Constraints:** Ensure `holdings` cannot go negative (validation).
6.  [ ] **Migration:** Generate and push Drizzle migration.

## Dev Notes (Context)

**1. Schema Reference (Architecture v1.4):**

// assets (Global - shared prices)
export const assets = pgTable("assets", {
  ticker: text("ticker").primaryKey(), // e.g. "VWCE.DE"
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stock', 'etf', 'crypto'
  current_price: decimal("current_price").default("0"),
  last_updated: timestamp("last_updated"),
});

// investment_transactions (History)
export const investmentTransactions = pgTable("investment_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  account_id: uuid("account_id").references(() => accounts.id), // Must be type='broker'
  ticker: text("ticker").references(() => assets.ticker),
  type: text("type").notNull(), // 'buy', 'sell', 'dividend'
  quantity: decimal("quantity").notNull(),
  price_per_share: decimal("price_per_share").notNull(),
  fees: decimal("fees").default("0"),
  date: date("date").notNull(),
});

// holdings (Current State)
export const holdings = pgTable("holdings", {
  id: uuid("id").primaryKey().defaultRandom(),
  account_id: uuid("account_id").references(() => accounts.id),
  ticker: text("ticker").references(() => assets.ticker),
  quantity: decimal("quantity").notNull(),
  avg_cost_basis: decimal("avg_cost_basis").notNull(),
});

**2. The Atomic Update (Logic):**
Use `db.transaction(async (tx) => { ... })` to ensure data integrity.
*   **Avg Cost Formula (Weighted Average):**
    `NewAvg = ((OldQty * OldAvg) + (NewQty * BuyPrice)) / (OldQty + NewQty)`
    *Note: Fees are usually added to the cost basis for tax purposes.*

**3. RLS:**
Apply standard RLS (`auth.uid() = user_id` via account join) to Transactions and Holdings. `assets` table might need to be public-read (or shared) if we centralize prices later, but for now, treat as system data.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-4.1-investment-schema"
  title: "Investment Data Model"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "drizzle-orm"
  folder_structure:
    - "/db/schema.ts"
    - "/lib/actions/investments.ts" (Logic)
  schema_requirements:
    tables: [assets, investment_transactions, holdings]
    relationships: "Transactions -> Accounts, Holdings -> Accounts, Both -> Assets"
  logic_requirements:
    - "Use db.transaction for atomicity"
    - "Calculate Weighted Average Cost Basis on Buy"
    - "Prevent negative holdings on Sell"
  verify: "Call `recordInvestmentTransaction` with a Buy. Check that `holdings` table automatically has the correct Qty and AvgCost."
