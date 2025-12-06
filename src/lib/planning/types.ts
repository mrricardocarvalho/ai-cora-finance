export interface Scenario {
  id: string;
  name: string;
  baselineDate: Date;
  modifications: ScenarioModification[];
  projectionMonths: number; // Default 60 (5 years)
}

export interface ScenarioModification {
  type: 'income' | 'expense' | 'savings_rate' | 'investment_return' | 
        'one_time_expense' | 'one_time_income' | 'debt_payoff' | 'goal_change';
  value: number;
  startMonth?: number;
  endMonth?: number;
  description: string;
}

export interface DebtBaseline {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

export interface GoalBaseline {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  targetDate?: Date;
}

export interface FinancialBaseline {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  debts: DebtBaseline[];
  investments: number;
  totalSavings: number; // Liquid cash/savings
  goals: GoalBaseline[];
}

export interface MonthlySnapshot {
  month: number; // 0-based from baseline
  date: Date;
  netWorth: number;
  savings: number;
  debt: number;
  investmentValue: number;
}

export interface ScenarioProjection {
  months: MonthlySnapshot[];
  fireDate: Date | null;
  goalCompletions: Map<string, Date>;
  endNetWorth: number;
}

export interface ScenarioComparison {
  fireDateDeltaMonths: number; // positive = later, negative = earlier
  netWorthDelta: number;
  goalCompletionDeltas: Map<string, number>; // months delta
}
