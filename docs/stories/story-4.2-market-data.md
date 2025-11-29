# Story 4.2: Market Data Sync Service

**Status:** Approved
**Epic:** 4. Investment Engine
**Story:**
**As a** System,
**I want** to automatically update the current price of all tracked assets,
**So that** the user's Net Worth and Portfolio Performance are always up-to-date without manual input.

## Acceptance Criteria
1.  [ ] **Library:** Install and configure `yahoo-finance2` (Robust Node.js wrapper for Yahoo Finance).
2.  [ ] **Service:** Implement `updateAssetPrices()` in `lib/services/market-data.ts`.
    *   Logic: Query DB for all distinct `ticker` symbols in `assets`.
    *   Batch Fetch: Request prices from Yahoo Finance.
    *   Update DB: Update `current_price` and `last_updated` in the `assets` table.
3.  [ ] **API Route (Cron):** Create a Route Handler `/api/cron/update-prices` that calls the service.
4.  [ ] **Security:** Protect the Cron route with a `CRON_SECRET` header (standard Vercel Cron pattern) to prevent unauthorized triggers.
5.  [ ] **Error Handling:** If a ticker is invalid or API fails, log the error but do not crash the entire batch.
6.  [ ] **Verification:** Manually triggering the API route updates the prices in the database.

## Dev Notes (Context)

**1. Why Yahoo Finance?**
For an MVP/Personal tool, it's the best free source. Later, we can swap the `IMarketData` interface to use a paid provider like EODHD or AlphaVantage if needed.

**2. Implementation Hint:**

import yahooFinance from 'yahoo-finance2';

export async function updateAssetPrices() {
  const assetsList = await db.select().from(assets);
  const tickers = assetsList.map(a => a.ticker);
  
  // Yahoo often accepts array, or loop with delay to avoid rate limits
  const quotes = await yahooFinance.quote(tickers);
  
  for (const quote of quotes) {
    await db.update(assets)
      .set({ 
        current_price: quote.regularMarketPrice, 
        last_updated: new Date() 
      })
      .where(eq(assets.ticker, quote.symbol));
  }
}

**3. Vercel Cron Config:**
Add `vercel.json` (optional for local, but good for deployment):

{
  "crons": [{
    "path": "/api/cron/update-prices",
    "schedule": "*/30 * * * *"
  }]
}

**4. Rate Limiting:**
Be gentle. If we have > 50 assets, batch them or add a small delay.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-4.2-market-data"
  title: "Market Data Sync Service"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "yahoo-finance2"
  env_vars_required:
    - "CRON_SECRET" (generate a random string)
  folder_structure:
    - "/lib/services/market-data.ts"
    - "/app/api/cron/update-prices/route.ts"
    - "/vercel.json"
  logic_constraints:
    - "Update 'assets' table only"
    - "Handle partial failures (one bad ticker shouldn't stop others)"
  verify: "Insert dummy asset 'AAPL'. Call API route via Curl/Postman. Check DB to see if 'current_price' is updated."