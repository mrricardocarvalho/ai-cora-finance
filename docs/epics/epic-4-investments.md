# Epic 4: Investment Engine (The Wealth)

**Goal:** Enable users to track investment portfolios across multiple brokers (XTB, Degiro, etc.) and understand their performance and tax liability under Portuguese law.
**Prerequisites:** Epic 2 complete (Core Data Infrastructure).

## Stories

### Story 4.1: Investment Data Model (Event-Sourced)
**As a** Developer,
**I want** to implement a robust schema for tracking assets and holdings,
**So that** the portfolio data remains mathematically accurate over time.

**Acceptance Criteria:**
1.  Create `assets` table (ticker, name, type, current_price, last_updated).
2.  Create `investment_transactions` table (type: buy/sell/dividend, qty, price, fees, date).
3.  Create `holdings` table (derived state).
4.  **Logic:** Implement Database Triggers (or Service Logic) so that inserting a 'Buy' transaction automatically updates the `holdings` quantity and average cost basis.
5.  **Constraint:** Users cannot edit `holdings` directly; they must add/edit transactions.

### Story 4.2: Market Data Sync Service
**As a** System,
**I want** to update asset prices automatically,
**So that** the user's net worth is current.

**Acceptance Criteria:**
1.  Implement `syncMarketData` background job (Cron).
2.  Integration: Connect to **Yahoo Finance API** (or equivalent MVP provider).
3.  **Logic:** Fetch current price for all distinct tickers in the `assets` table.
4.  **Optimization:** Cache prices in the DB. Update frequency: Every 15-30 mins (or on user refresh).
5.  Handle API failures gracefully (stale data warning).

### Story 4.3: Portfolio Dashboard UI
**As a** User,
**I want** to see my total portfolio value and asset allocation,
**So that** I understand my risk exposure.

**Acceptance Criteria:**
1.  Create `PortfolioView` page.
2.  **Visuals:**
    *   Total Balance (Sum of all holdings * current price).
    *   Performance (Current Value - Total Cost Basis).
    *   Allocation Chart (Pie chart by Asset Type: Stock/ETF/Crypto).
3.  **Components:** Use `Recharts` for visualizations.
4.  **List:** Show individual holdings with "Day Change" and "Total Return".

### Story 4.4: Manual Investment Entry
**As a** User,
**I want** to record my buys and sells,
**So that** my portfolio stays accurate.

**Acceptance Criteria:**
1.  Create "Add Investment Transaction" Modal.
2.  Fields: Ticker (Searchable), Date, Type (Buy/Sell), Quantity, Price per Share, **Fees**.
3.  **Validation:** Ensure "Sell" quantity does not exceed current holding.
4.  **Search:** Auto-complete tickers using the Market Data API.

### Story 4.5: Portuguese Tax Logic Engine (FIFO)
**As a** System,
**I want** to calculate capital gains using the First-In-First-Out method,
**So that** the tax estimates comply with Portuguese IRS rules.

**Acceptance Criteria:**
1.  Implement `calculateCapitalGains` utility.
2.  **Logic:** When a "Sell" is simulated or recorded, match the sold shares against the *oldest* "Buy" records (FIFO).
3.  Calculate `Gain = (SellPrice - BuyPrice) * Qty - Fees`.
4.  Estimate Tax Liability: `Gain * 0.28` (Standard PT Tax Rate).
5.  Display "Estimated Tax" on the Portfolio view.

### Story 4.6: Tax Optimization Insights
**As a** User,
**I want** to know if I can lower my taxes,
**So that** I don't pay more than necessary.

**Acceptance Criteria:**
1.  Integrate with **Insight Engine** (Epic 3).
2.  **Trigger:** If a holding has a negative return (Current < Avg Cost).
3.  **Insight:** Generate `Opportunity` insight: "Tax-Loss Harvesting: Selling X could offset €Y in gains."
4.  **Disclaimer:** Include standard "Not Financial Advice" disclaimer on these specific insights.