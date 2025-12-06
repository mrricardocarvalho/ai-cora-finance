/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createServerSupabase } from '../supabase/server';
import { getPortfolioData } from '../actions/portfolio';
import { FinancialBaseline, DebtBaseline, GoalBaseline } from './types';

export async function extractBaseline(userId: string): Promise<FinancialBaseline> {
  const supabase = await createServerSupabase();

  // 1. Fetch Accounts (Debts & Assets)
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);

  if (accError) throw new Error(`Failed to fetch accounts: ${accError.message}`);

  // 2. Fetch Monthly Summaries (Income/Expenses)
  const { data: summaries, error: sumError } = await supabase
    .from('monthly_summaries')
    .select('total_in, total_out')
    .eq('user_id', userId)
    .order('month', { ascending: false })
    .limit(3);

  if (sumError) throw new Error(`Failed to fetch summaries: ${sumError.message}`);

  // 3. Fetch Goals
  const { data: goalsData, error: goalError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId);

  if (goalError) throw new Error(`Failed to fetch goals: ${goalError.message}`);

  // 4. Fetch Portfolio
  const portfolio = await getPortfolioData(userId);
  const investmentValue = portfolio.success ? (portfolio.data?.totals?.totalValue || 0) : 0;

  // Process Data
  const debts: DebtBaseline[] = (accounts || [])
    .filter((a: any) => a.type === 'credit_card' || a.type === 'loan' || (a.balance < 0))
    .map((a: any) => ({
      id: a.id,
      name: a.name,
      balance: Math.abs(a.balance),
      interestRate: a.interest_rate || 0,
      minPayment: a.min_payment || 0
    }));

  const assetAccounts = (accounts || []).filter((a: any) => !debts.find(d => d.id === a.id));
  const cashAssets = assetAccounts.reduce((sum: number, a: any) => sum + (a.balance > 0 ? a.balance : 0), 0);
  
  const netWorth = cashAssets + investmentValue - debts.reduce((sum, d) => sum + d.balance, 0);

  // Averages
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  if (summaries && summaries.length > 0) {
    monthlyIncome = summaries.reduce((sum: number, s: any) => sum + (s.total_in || 0), 0) / summaries.length;
    monthlyExpenses = summaries.reduce((sum: number, s: any) => sum + (s.total_out || 0), 0) / summaries.length;
  }

  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;

  const goals: GoalBaseline[] = (goalsData || []).map((g: any) => ({
    id: g.id,
    name: g.name,
    currentAmount: g.current_amount || 0,
    targetAmount: g.target_amount || 0,
    targetDate: g.deadline ? new Date(g.deadline) : undefined
  }));

  return {
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    debts,
    investments: investmentValue, // Assuming investments are part of Net Worth but tracked separately for growth
    totalSavings: cashAssets,
    goals
  };
}
