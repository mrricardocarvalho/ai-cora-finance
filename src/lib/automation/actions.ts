export type ActionType =
  | 'notify'
  | 'create_insight'
  | 'suggest_goal_contribution'
  | 'suggest_debt_payment'

export interface ActionParams {
  message?: string
  title?: string
  goal_id?: string
  amount?: number // Fixed amount or percentage? For now fixed.
  percentage?: number
}

export interface RuleAction {
  type: ActionType
  params: ActionParams
}

export const ACTION_DEFINITIONS: Record<ActionType, { label: string; description: string; fields: (keyof ActionParams)[] }> = {
  notify: {
    label: 'Send Notification',
    description: 'Send a push notification',
    fields: ['message']
  },
  create_insight: {
    label: 'Create Insight',
    description: 'Add an item to your insights feed',
    fields: ['title', 'message']
  },
  suggest_goal_contribution: {
    label: 'Suggest Goal Contribution',
    description: 'Create a recommendation to contribute to a goal',
    fields: ['goal_id', 'amount']
  },
  suggest_debt_payment: {
    label: 'Suggest Debt Payment',
    description: 'Create a recommendation to pay down debt',
    fields: ['amount']
  }
}
