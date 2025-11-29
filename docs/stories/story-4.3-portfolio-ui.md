# Story 4.3: Portfolio Dashboard UI

**Status:** Approved
**Epic:** 4. Investment Engine
**Story:**
**As a** User,
**I want** to see my total portfolio value, performance, and asset allocation,
**So that** I understand my net worth and risk exposure at a glance.

## Acceptance Criteria
1.  [ ] **Page:** Create `/portfolio` page (Protected route).
2.  [ ] **Data Fetching:** Implement `getPortfolioData(userId)` Server Action.
    *   Join `holdings` with `assets` (to get current price).
    *   Calculate `Current Value` (`Quantity * Current Price`).
    *   Calculate `Cost Basis` (`Quantity * Avg Cost`).
    *   Calculate `Unrealized Gain/Loss` (`Value - Cost`).
3.  [ ] **Summary Cards:** Display 3 top cards:
    *   **Total Value** (e.g., €12,500).
    *   **Total Return** (e.g., +€1,200 / +10.5%). Color Green if +, Red if -.
    *   **Day Change** (Optional/Stretch: Needs historical price, can mock for MVP).
4.  [ ] **Allocation Chart:** Implement a Donut/Pie Chart using `Recharts` showing breakdown by Asset Type (Stock vs ETF vs Crypto) or by Asset Name.
5.  [ ] **Holdings List:** Display a table of individual holdings.
    *   Columns: Ticker, Name, Qty, Price, Value, Return.
6.  [ ] **Empty State:** If no holdings exist, show a "Start Investing" CTA (links to Add Transaction).

## Dev Notes (Context)

**1. Math Logic (Unrealized P&L):**
We are calculating *Unrealized* gains here (paper gains).
*   `Total Value = SUM(Holding.qty * Asset.current_price)`
*   `Total Cost = SUM(Holding.qty * Holding.avg_cost_basis)`
*   `Total Return % = ((Total Value - Total Cost) / Total Cost) * 100`

**2. Recharts Implementation:**
Use the `PieChart` component from Recharts (wrapped in a shadcn Card).
*   *Colors:* Use the financial palette:
    *   ETF: `#0D9488` (Primary)
    *   Stock: `#6366F1` (Indigo)
    *   Crypto: `#F59E0B` (Warning/Orange)
    *   Cash: `#10B981` (Success)

**3. Mobile Optimization:**
*   On Mobile: Hide the "Cost Basis" and "Qty" columns in the table; just show Ticker, Value, and Return.
*   Chart: Keep it simple, hide legend if it takes too much space.

**4. Performance:**
Ensure `getPortfolioData` runs efficiently. It should be a single query with a join.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-4.3-portfolio-ui"
  title: "Portfolio Dashboard UI"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "recharts"
    - "lucide-react"
  shadcn_components_to_add:
    - "card"
    - "table"
    - "badge"
  folder_structure:
    - "/app/(dashboard)/portfolio/page.tsx"
    - "/components/portfolio/portfolio-summary.tsx"
    - "/components/portfolio/allocation-chart.tsx"
    - "/components/portfolio/holdings-table.tsx"
    - "/lib/actions/portfolio.ts"
  visual_logic:
    positive_return: "text-success"
    negative_return: "text-danger"
  verify: "Manually insert a holding (10 units of AAPL at $150). Ensure 'assets' table has AAPL at $200. Verify Dashboard shows Total Value $2000 and Return +$500."