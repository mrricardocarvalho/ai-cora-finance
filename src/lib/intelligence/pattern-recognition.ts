import { createClient as createServerSupabase } from '../supabase/server';
import { subMonths, format, getMonth, parseISO } from 'date-fns';
import { formatCurrency } from '../utils';

export type PatternInsight = {
  type: 'seasonal' | 'trend' | 'creep' | 'cashflow';
  title: string;
  message: string;
  confidence: 'high' | 'medium' | 'low';
  actionable?: string;
  metadata?: Record<string, unknown>;
};

interface Transaction {
  amount: number;
  date: string;
  description?: string;
  category?: string;
  merchant_name?: string;
  [key: string]: unknown;
}

interface RecurringPattern {
  amount: number;
  frequency: string;
  created_at: string;
  [key: string]: unknown;
}

interface MonthlySummary {
  total_in: number;
  total_out: number;
  [key: string]: unknown;
}

export async function detectPatterns(userId: string): Promise<PatternInsight[]> {
  const supabase = await createServerSupabase();
  const insights: PatternInsight[] = [];

  // Fetch necessary data
  // 1. Transactions (last 12-24 months for seasonality)
  const twoYearsAgo = subMonths(new Date(), 24).toISOString();
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', twoYearsAgo)
    .order('date', { ascending: true });

  // 2. Recurring Patterns
  const { data: recurring } = await supabase
    .from('recurring_patterns')
    .select('*')
    .eq('user_id', userId);

  // 3. Monthly Summaries
  const { data: summaries } = await supabase
    .from('monthly_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('month', { ascending: true });

  if (!transactions || transactions.length === 0) return [];

  // Run Analyses
  insights.push(...analyzeSeasonality(transactions));
  insights.push(...analyzeBillTrends(transactions));
  if (recurring) insights.push(...analyzeSubscriptionCreep(recurring));
  if (summaries) insights.push(...predictCashFlow(summaries));

  return insights;
}

export function analyzeSeasonality(transactions: Transaction[]): PatternInsight[] {
  const insights: PatternInsight[] = [];
  const currentMonth = getMonth(new Date());
  const nextMonth = (currentMonth + 1) % 12;
  
  // Group spending by month (0-11)
  const monthlySpending: Record<number, number[]> = {};
  
  transactions.forEach(tx => {
    if (tx.amount < 0) { // Expenses only
      const date = parseISO(tx.date);
      const month = getMonth(date);
      if (!monthlySpending[month]) monthlySpending[month] = [];
      monthlySpending[month].push(Math.abs(tx.amount));
    }
  });

  // Calculate average monthly spending
  const monthAverages: Record<number, number> = {};

  for (let m = 0; m < 12; m++) {
    if (monthlySpending[m] && monthlySpending[m].length > 0) {
      const sum = monthlySpending[m].reduce((a, b) => a + b, 0);
      monthAverages[m] = sum; // Total for that month across years? No, need per year.
      // Actually, let's sum per month-year first.
    }
  }

  // Re-do: Sum by YYYY-MM first
  const monthlyTotals: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.amount < 0) {
      const key = tx.date.substring(0, 7); // YYYY-MM
      monthlyTotals[key] = (monthlyTotals[key] || 0) + Math.abs(tx.amount);
    }
  });

  // Now group by Month Index (0-11)
  const monthIndexTotals: Record<number, number[]> = {};
  Object.entries(monthlyTotals).forEach(([key, total]) => {
    const month = parseInt(key.split('-')[1]) - 1;
    if (!monthIndexTotals[month]) monthIndexTotals[month] = [];
    monthIndexTotals[month].push(total);
  });

  // Calculate global average monthly spend
  const allTotals = Object.values(monthlyTotals);
  if (allTotals.length < 6) return []; // Need at least 6 months data
  const globalAvg = allTotals.reduce((a, b) => a + b, 0) / allTotals.length;

  // Check Next Month for Seasonality
  const nextMonthTotals = monthIndexTotals[nextMonth];
  if (nextMonthTotals && nextMonthTotals.length > 0) {
    const nextMonthAvg = nextMonthTotals.reduce((a, b) => a + b, 0) / nextMonthTotals.length;
    
    // If next month is significantly higher than global average (> 20%)
    if (nextMonthAvg > globalAvg * 1.2) {
      const diff = nextMonthAvg - globalAvg;
      const monthName = format(new Date(2024, nextMonth, 1), 'MMMM');
      
      insights.push({
        type: 'seasonal',
        title: `Seasonal Spending Alert: ${monthName}`,
        message: `Based on your history, you typically spend ${formatCurrency(diff)} more in ${monthName} than average.`,
        confidence: nextMonthTotals.length >= 2 ? 'high' : 'medium',
        actionable: 'Consider setting aside extra funds now.'
      });
    }
  }

  return insights;
}

export function analyzeBillTrends(transactions: Transaction[]): PatternInsight[] {
  const insights: PatternInsight[] = [];
  // Identify bills (utilities, insurance, etc.) - simplified by category or description keywords
  // For now, let's look for repeated merchants with "Energy", "Water", "Telecom", "Internet"
  
  const billKeywords = ['energy', 'water', 'telecom', 'internet', 'electric', 'gas'];
  const billTx = transactions.filter(tx => {
    if (tx.amount >= 0) return false;
    const desc = (tx.description || '').toLowerCase();
    const cat = (tx.category || '').toLowerCase();
    return billKeywords.some(k => desc.includes(k) || cat.includes(k));
  });

  // Group by merchant
  const merchantBills: Record<string, { date: Date, amount: number }[]> = {};
  billTx.forEach(tx => {
    const merchant = tx.merchant_name || tx.description || 'Unknown';
    if (!merchantBills[merchant]) merchantBills[merchant] = [];
    merchantBills[merchant].push({ date: parseISO(tx.date), amount: Math.abs(tx.amount) });
  });

  // Analyze trends per merchant
  Object.entries(merchantBills).forEach(([merchant, bills]) => {
    if (bills.length < 4) return; // Need history
    bills.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Simple linear regression or just compare first/last avg
    const recent = bills.slice(-3);
    const old = bills.slice(0, 3);
    
    const recentAvg = recent.reduce((s, b) => s + b.amount, 0) / recent.length;
    const oldAvg = old.reduce((s, b) => s + b.amount, 0) / old.length;

    if (recentAvg > oldAvg * 1.15) { // 15% increase
      const increase = recentAvg - oldAvg;
      insights.push({
        type: 'trend',
        title: `Bill Increase Detected: ${merchant}`,
        message: `Your payments to ${merchant} have increased by ~${formatCurrency(increase)} compared to earlier periods.`,
        confidence: bills.length > 6 ? 'high' : 'medium',
        actionable: 'Check if your contract expired or usage increased.'
      });
    }
  });

  return insights;
}

export function analyzeSubscriptionCreep(recurring: RecurringPattern[]): PatternInsight[] {
  const insights: PatternInsight[] = [];
  // This requires history of recurring patterns, but the table usually stores current state.
  // We can check if the TOTAL of recurring expenses is high relative to income, or if new ones added recently.
  // AC #4 says "total subscriptions increase month-over-month".
  // Without a history table of recurring_patterns snapshots, we can't easily do this EXACTLY as requested.
  // However, we can look at the `updated_at` or `created_at` of patterns.
  
  // Alternative: Sum up active subscriptions.
  // If we assume the `recurring_patterns` table is the source of truth for "Active Subscriptions".
  
  // If we had previous month's total... we don't.
  // But we can check for RECENTLY added subscriptions (last 30 days) and flag "Creep" if significant.
  
  const oneMonthAgo = subMonths(new Date(), 1);
  const newSubs = recurring.filter(p => new Date(p.created_at) > oneMonthAgo);
  
  if (newSubs.length > 0) {
    const newAmount = newSubs.reduce((s, p) => s + Math.abs(p.amount), 0);
    if (newAmount > 20) { // Threshold
      insights.push({
        type: 'creep',
        title: 'Subscription Creep Alert',
        message: `You've added ${formatCurrency(newAmount)} in new recurring commitments recently.`,
        confidence: 'high',
        actionable: 'Review your active services.'
      });
    }
  }

  return insights;
}

export function predictCashFlow(summaries: MonthlySummary[]): PatternInsight[] {
  const insights: PatternInsight[] = [];
  if (summaries.length < 3) return [];

  // Calculate Savings Rate Trend
  // Savings Rate = (In - Out) / In
  const rates = summaries.map(s => {
    const income = s.total_in || 0;
    const expenses = s.total_out || 0;
    return income > 0 ? (income - expenses) / income : 0;
  });

  // Check for declining trend
  // Simple check: last 3 months declining
  let declining = true;
  for (let i = rates.length - 1; i > rates.length - 3; i--) {
    if (rates[i] >= rates[i-1]) declining = false;
  }

  if (declining && rates[rates.length-1] < 0.15) { // Dropped below 15%
    insights.push({
      type: 'cashflow',
      title: 'Savings Rate Declining',
      message: `Your savings rate has dropped recently (now ${(rates[rates.length-1]*100).toFixed(1)}%).`,
      confidence: summaries.length > 6 ? 'high' : 'medium',
      actionable: 'Check for lifestyle inflation or one-off expenses.'
    });
  }

  return insights;
}
