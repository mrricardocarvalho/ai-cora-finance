# Story 5.2: Debt Strategy Engine (Simulator)

**Status:** Completed
**Epic:** 5. Debt & Planning
**Story:**
**As a** System,
**I want** to simulate different debt payoff strategies (Avalanche vs. Snowball),
**So that** I can calculate exactly how much time and interest the user can save.

## Acceptance Criteria
1.  [x] **Service:** Implement `calculateDebtStrategy(userId, extraMonthlyPayment)` in `lib/planning/debt.ts`.
2.  [x] **Input Gathering:** Fetch all accounts where type is `credit_card` or `loan`.
    *   Required fields: `balance`, `interest_rate`, `min_payment`.
3.  [x] **Simulation Logic:** Create a simulation loop that runs month-by-month until all debt is zero.
    *   **Scenario A (Avalanche):** Sort debts by Interest Rate (DESC). Apply `extraMonthlyPayment` to the top debt.
    *   **Scenario B (Snowball):** Sort debts by Balance (ASC). Apply `extraMonthlyPayment` to the top debt.
4.  [x] **Math Rules:**
    *   Monthly Interest = `(Balance * Rate) / 12`.
    *   New Balance = `Balance + Interest - Payment`.
    *   If a debt is paid off, roll its minimum payment into the "Snowball" for the next debt.
5.  [x] **Output:** Return a comparison object:
    *   `avalanche`: { payoffDate, totalInterestPaid, graphData }
    *   `snowball`: { payoffDate, totalInterestPaid, graphData }
6.  [x] **Unit Test:** Write a test case to prove Avalanche saves more money than Snowball mathematically.

## Dev Notes (Context)

**1. The Simulation Loop (Pseudo-code):**

let currentDebts = [...initialDebts];
let totalInterest = 0;
let months = 0;

while (currentDebts.some(d => d.balance > 0)) {
  months++;
  let availableCash = totalMinPayments + extraPayment;

  // 1. Charge Interest & Pay Minimums
  currentDebts.forEach(d => {
    const interest = d.balance * (d.rate / 100 / 12);
    d.balance += interest;
    totalInterest += interest;
    
    const payment = Math.min(d.balance, d.minPayment);
    d.balance -= payment;
    availableCash -= payment;
  });

  // 2. Pay Extra (Strategy Specific)
  // Sort currentDebts based on Strategy (Rate DESC or Balance ASC)
  const target = currentDebts.find(d => d.balance > 0);
  if (target) {
    target.balance -= availableCash; // Apply remaining snowball
  }
  
  // 3. Break if infinite loop (> 30 years)
  if (months > 360) break; 
}

**2. Handling "No Extra Payment":**
If `extraMonthlyPayment` is 0, both strategies are identical (just paying minimums). The engine should still calculate the baseline "Time to Freedom."

**3. Performance:**
This is a CPU-bound task but very fast for < 20 debts. Run it in a Server Action or Utility function.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-5.2-debt-engine"
  title: "Debt Strategy Engine"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "date-fns"
  folder_structure:
    - "/lib/planning/debt.ts"
    - "/lib/actions/planning.ts"
    - "/tests/debt-engine.test.ts" (Optional but recommended)
  logic_constraints:
    - "Avalanche = Sort by Rate DESC"
    - "Snowball = Sort by Balance ASC"
    - "Max simulation duration = 50 years (prevent infinite loops)"
  verify: "Create 2 debts: Small($1k, 5%) and Large($10k, 20%). Run simulator. Avalanche should pay Large first. Snowball should pay Small first."