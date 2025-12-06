export type TriggerType = 
  | 'safe_to_spend_exceeds'
  | 'end_of_month'
  | 'income_received'
  | 'bill_paid'
  | 'category_exceeds'

export interface TriggerCondition {
  amount?: number
  category?: string
  merchant?: string
  day?: number
}

export interface RuleTrigger {
  type: TriggerType
  condition: TriggerCondition
}

export const TRIGGER_DEFINITIONS: Record<TriggerType, { label: string; description: string; fields: (keyof TriggerCondition)[] }> = {
  safe_to_spend_exceeds: {
    label: 'Safe-to-Spend Exceeds',
    description: 'Trigger when your Safe-to-Spend balance goes above a certain amount',
    fields: ['amount']
  },
  end_of_month: {
    label: 'End of Month',
    description: 'Trigger on the last day of the month',
    fields: []
  },
  income_received: {
    label: 'Income Received',
    description: 'Trigger when a deposit looks like income',
    fields: ['amount'] // Optional min amount
  },
  bill_paid: {
    label: 'Bill Paid',
    description: 'Trigger when a specific bill is paid',
    fields: ['merchant']
  },
  category_exceeds: {
    label: 'Category Budget Exceeded',
    description: 'Trigger when spending in a category exceeds a limit',
    fields: ['category', 'amount']
  }
}
