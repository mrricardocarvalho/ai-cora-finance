import { ScenarioModification } from './types'

export interface LifeEventTemplate {
  id: string
  name: string
  description: string
  icon: string
  defaultModifications: (params: any) => ScenarioModification[]
  params: LifeEventParam[]
}

export interface LifeEventParam {
  key: string
  label: string
  type: 'number' | 'currency' | 'months'
  defaultValue: number
}

export const LIFE_EVENT_TEMPLATES: LifeEventTemplate[] = [
  {
    id: 'baby',
    name: 'Having a Baby',
    description: 'Model the costs of a new child and parental leave.',
    icon: '👶',
    params: [
      { key: 'monthlyCost', label: 'Monthly Cost', type: 'currency', defaultValue: 400 },
      { key: 'leaveMonths', label: 'Parental Leave (Months)', type: 'months', defaultValue: 4 },
      { key: 'incomeReduction', label: 'Income Reduction during Leave (%)', type: 'number', defaultValue: 50 }
    ],
    defaultModifications: (params) => [
      {
        type: 'expense',
        value: params.monthlyCost,
        startMonth: 0,
        description: 'Child expenses'
      },
      {
        type: 'income',
        value: 1 - (params.incomeReduction / 100), // Multiplier
        isMultiplier: true,
        startMonth: 0,
        endMonth: params.leaveMonths,
        description: `Parental leave (${params.incomeReduction}% income reduction)`
      }
    ]
  },
  {
    id: 'house',
    name: 'Buying a House',
    description: 'Down payment, mortgage, and maintenance.',
    icon: '🏠',
    params: [
      { key: 'downPayment', label: 'Down Payment', type: 'currency', defaultValue: 50000 },
      { key: 'mortgagePayment', label: 'Mortgage Payment', type: 'currency', defaultValue: 800 },
      { key: 'maintenance', label: 'Maintenance/Utilities', type: 'currency', defaultValue: 200 }
    ],
    defaultModifications: (params) => [
      {
        type: 'one_time_expense',
        value: params.downPayment,
        startMonth: 0,
        description: 'House Down Payment'
      },
      {
        type: 'expense',
        value: params.mortgagePayment + params.maintenance,
        startMonth: 0,
        description: 'Mortgage & Maintenance'
      }
    ]
  },
  {
    id: 'wedding',
    name: 'Getting Married',
    description: 'Wedding costs.',
    icon: '💍',
    params: [
      { key: 'cost', label: 'Wedding Cost', type: 'currency', defaultValue: 15000 }
    ],
    defaultModifications: (params) => [
      {
        type: 'one_time_expense',
        value: params.cost,
        startMonth: 0,
        description: 'Wedding Cost'
      }
    ]
  },
  {
    id: 'career_break',
    name: 'Career Break / Sabbatical',
    description: 'Time off work with no income.',
    icon: '🛑',
    params: [
      { key: 'months', label: 'Duration (Months)', type: 'months', defaultValue: 6 }
    ],
    defaultModifications: (params) => [
      {
        type: 'income',
        value: 0,
        startMonth: 0,
        endMonth: params.months,
        description: 'Career Break (No Income)'
      }
    ]
  },
  {
    id: 'business',
    name: 'Starting a Business',
    description: 'Initial investment and variable income.',
    icon: '🚀',
    params: [
      { key: 'investment', label: 'Initial Investment', type: 'currency', defaultValue: 10000 },
      { key: 'monthsNoIncome', label: 'Months with No Income', type: 'months', defaultValue: 6 }
    ],
    defaultModifications: (params) => [
      {
        type: 'one_time_expense',
        value: params.investment,
        startMonth: 0,
        description: 'Business Investment'
      },
      {
        type: 'income',
        value: 0,
        startMonth: 0,
        endMonth: params.monthsNoIncome,
        description: 'Business Ramp-up (No Income)'
      }
    ]
  },
  {
    id: 'move_abroad',
    name: 'Moving Abroad',
    description: 'Relocation costs and cost of living adjustment.',
    icon: '✈️',
    params: [
      { key: 'relocationCost', label: 'Relocation Cost', type: 'currency', defaultValue: 5000 },
      { key: 'newExpenses', label: 'New Monthly Expenses', type: 'currency', defaultValue: 2500 }
    ],
    defaultModifications: (params) => [
      {
        type: 'one_time_expense',
        value: params.relocationCost,
        startMonth: 0,
        description: 'Relocation Cost'
      },
      {
        type: 'expense',
        value: params.newExpenses,
        startMonth: 0,
        description: 'New Cost of Living'
      }
    ]
  },
  {
    id: 'early_retirement',
    name: 'Early Retirement',
    description: 'Stop working before standard retirement age.',
    icon: '🏖️',
    params: [
      { key: 'retirementExpenses', label: 'Retirement Expenses', type: 'currency', defaultValue: 2000 }
    ],
    defaultModifications: (params) => [
      {
        type: 'income',
        value: 0,
        startMonth: 0,
        description: 'Early Retirement (Income Stops)'
      },
      {
        type: 'expense',
        value: params.retirementExpenses,
        startMonth: 0,
        description: 'Retirement Living Expenses'
      }
    ]
  }
]
