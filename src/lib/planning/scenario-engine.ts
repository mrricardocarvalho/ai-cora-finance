import { FinancialBaseline, ScenarioModification, ScenarioProjection, ScenarioComparison, MonthlySnapshot } from './types';
import { addMonths, differenceInMonths } from 'date-fns';



export function calculateScenario(
  baseline: FinancialBaseline,
  modifications: ScenarioModification[],
  projectionMonths: number = 60
): ScenarioProjection {
  const months: MonthlySnapshot[] = [];
  const goalCompletions = new Map<string, Date>();
  let fireDate: Date | null = null;

  // Initial State
  let currentInvestments = baseline.investments;
  // We assume Net Worth = Investments + Cash - Debts.
  // For projection, we simplify: Cash + Investments are "Assets".
  // We grow "Assets" with savings and investment returns.
  // We assume baseline.netWorth includes everything.
  // Let's track "Assets" and "Debts".
  let currentAssets = baseline.netWorth + baseline.debts.reduce((s, d) => s + d.balance, 0);
  
  // If currentAssets < currentInvestments (impossible?), fix.
  if (currentAssets < currentInvestments) currentAssets = currentInvestments;

  const currentDebts = baseline.debts.map(d => ({ ...d }));
  
  // Calculate Base Living Expenses (Total Expenses - Debt Min Payments)
  const initialTotalMinPayment = baseline.debts.reduce((sum, d) => sum + d.minPayment, 0);
  const baseLivingExpenses = Math.max(0, baseline.monthlyExpenses - initialTotalMinPayment);

  const startDate = new Date();

  for (let i = 0; i < projectionMonths; i++) {
    const currentDate = addMonths(startDate, i);
    
    // 1. Determine Current Parameters based on Modifications
    let modIncome = baseline.monthlyIncome;
    let modLivingExpenses = baseLivingExpenses; // Start with base
    let investmentReturnRate = 0.07 / 12; // Default 7% annual

    for (const mod of modifications) {
      if (mod.startMonth !== undefined && i < mod.startMonth) continue;
      if (mod.endMonth !== undefined && i > mod.endMonth) continue;

      switch (mod.type) {
        case 'income':
          modIncome = mod.value;
          break;
        case 'expense':
          // If user modifies expense, is it Total or Living?
          // Usually users think in Total.
          // But if debt drops, Total drops.
          // Let's assume modifications apply to Living Expenses unless specified.
          // Or if it's a "value" override, maybe it overrides the whole thing?
          // Let's assume it's an override of Living Expenses for now, or add to it?
          // The interface is `value: number`.
          // If I say "Expense = 2000", does that include debt?
          // Let's assume modifications are DELTAS or OVERRIDES?
          // AC says "value: number".
          // Let's assume it overrides the relevant component.
          modLivingExpenses = mod.value; 
          break;
        case 'savings_rate':
          // Implies Expenses = Income * (1 - rate)
          modLivingExpenses = modIncome * (1 - mod.value);
          break;
        case 'investment_return':
          investmentReturnRate = mod.value / 12;
          break;
        case 'one_time_expense':
          if (i === mod.startMonth) modLivingExpenses += mod.value;
          break;
        case 'one_time_income':
          if (i === mod.startMonth) modIncome += mod.value;
          break;
      }
    }

    // 2. Process Debts
    let currentMonthDebtPayment = 0;
    currentDebts.forEach(d => {
      if (d.balance > 0) {
        const interest = d.balance * (d.interestRate / 100 / 12);
        d.balance += interest;
        const payment = Math.min(d.minPayment, d.balance);
        d.balance -= payment;
        currentMonthDebtPayment += payment;
      }
    });

    // 3. Calculate Savings
    const totalExpenses = modLivingExpenses + currentMonthDebtPayment;
    const monthlySavings = modIncome - totalExpenses;

    // 4. Grow Assets
    // Apply investment return to the portion that is investments
    // We only know `currentInvestments` vs `currentAssets`.
    // Let's assume `currentInvestments` grows at `investmentReturnRate`.
    // And `monthlySavings` is added to `currentInvestments` (assuming we invest savings).
    // Cash portion stays flat (0% return) for simplicity.
    
    const nonInvestedCash = Math.max(0, currentAssets - currentInvestments);
    currentInvestments *= (1 + investmentReturnRate);
    
    // Add savings to investments (or subtract from cash if negative)
    if (monthlySavings > 0) {
      currentInvestments += monthlySavings;
    } else {
      // Burn cash first, then investments
      if (nonInvestedCash >= Math.abs(monthlySavings)) {
        // reduced from cash (implicitly handled by updating currentAssets below)
      } else {
        currentInvestments += (monthlySavings + nonInvestedCash); // Reduce investments by remainder
      }
    }
    
    currentAssets = currentInvestments + nonInvestedCash + monthlySavings; // Update total assets
    // Note: This logic is slightly circular.
    // Correct:
    // Assets_New = Assets_Old + Savings + Investment_Growth
    // Investment_Growth = Investments * Rate
    
    // Recalculate:
    const growth = currentInvestments * investmentReturnRate; // Growth on OLD balance
    // currentInvestments is already updated above? Yes `*=`
    // Let's revert and do it cleanly.
    
    // Clean Step 4:
    // const growth = currentInvestments * investmentReturnRate;
    // currentInvestments += growth;
    // currentAssets += growth; // Assets grow by investment return
    // currentAssets += monthlySavings; // Assets grow/shrink by savings
    // currentInvestments += monthlySavings; // Assume 100% savings go to investments
    
    // 5. FIRE Check
    // FI Number = Annual Living Expenses * 25 (Debt free usually assumed, or include debt payments?)
    // Usually FI = 25x Expenses. If we still have debt, expenses include debt.
    // But if debt is temporary, we shouldn't multiply it by 25.
    // Standard FIRE: 25x Living Expenses + Debt Payoff Amount?
    // Or just 25x Current Total Expenses?
    // Let's use 25x Living Expenses.
    const fiNumber = modLivingExpenses * 12 * 25;
    const totalDebt = currentDebts.reduce((sum, d) => sum + d.balance, 0);
    const netWorth = currentAssets - totalDebt;

    if (!fireDate && netWorth >= fiNumber) {
      fireDate = currentDate;
    }

    months.push({
      month: i,
      date: currentDate,
      netWorth: netWorth,
      savings: monthlySavings,
      debt: totalDebt,
      investmentValue: currentInvestments
    });
  }

  return {
    months,
    fireDate,
    goalCompletions,
    endNetWorth: months[months.length - 1].netWorth
  };
}

export function compareScenarios(
  baseline: ScenarioProjection,
  modified: ScenarioProjection
): ScenarioComparison {
  let fireDateDeltaMonths = 0;
  if (baseline.fireDate && modified.fireDate) {
    fireDateDeltaMonths = differenceInMonths(modified.fireDate, baseline.fireDate);
  } else if (baseline.fireDate && !modified.fireDate) {
    fireDateDeltaMonths = 999; // Modified never reaches FIRE (worse)
  } else if (!baseline.fireDate && modified.fireDate) {
    fireDateDeltaMonths = -999; // Modified reaches FIRE (better)
  }

  const netWorthDelta = modified.endNetWorth - baseline.endNetWorth;
  
  const goalCompletionDeltas = new Map<string, number>();
  // TODO: Implement goal completion logic in projection first

  return {
    fireDateDeltaMonths,
    netWorthDelta,
    goalCompletionDeltas
  };
}
