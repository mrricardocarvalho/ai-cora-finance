import { createClient } from '@/lib/supabase/server'
import { RuleTrigger, TriggerType, TriggerCondition } from './triggers'
import { ActionParams } from './actions'

export interface FinancialEvent {
  userId: string
  type: 'balance_update' | 'transaction' | 'date'
  data: {
    safeToSpend?: number
    amount?: number
    [key: string]: unknown
  }
}

export class RuleEngine {
  async evaluateRules(event: FinancialEvent) {
    const supabase = await createClient()
    
    // Fetch enabled rules for user
    const { data: rules } = await supabase
      .from('autopilot_rules')
      .select('*')
      .eq('user_id', event.userId)
      .eq('enabled', true)

    if (!rules) return

    for (const rule of rules) {
      const trigger = { type: rule.trigger_type as TriggerType, condition: rule.trigger_condition as unknown as TriggerCondition }
      
      if (this.matchesTrigger(trigger, event)) {
        await this.executeAction(rule.id, rule.action_type as string, rule.action_params as unknown as ActionParams, event)
      }
    }
  }

  private matchesTrigger(trigger: RuleTrigger, event: FinancialEvent): boolean {
    switch (trigger.type) {
      case 'safe_to_spend_exceeds':
        return event.type === 'balance_update' && 
               (event.data.safeToSpend || 0) > (trigger.condition.amount || 0)
      
      case 'income_received':
        return event.type === 'transaction' && 
               (event.data.amount || 0) > 0 && // Positive amount
               (trigger.condition.amount ? (event.data.amount || 0) >= trigger.condition.amount : true)
               // In real app, check category or description for 'salary', 'payroll' etc.

      case 'category_exceeds':
        // This would require aggregating monthly spend for category first
        // For MVP, we might skip complex aggregation in real-time
        return false 

      case 'end_of_month':
        if (event.type !== 'date') return false
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        return tomorrow.getMonth() !== today.getMonth()

      default:
        return false
    }
  }

  private async executeAction(ruleId: string, type: string, params: ActionParams, event: FinancialEvent) {
    const supabase = await createClient()
    const result: Record<string, unknown> = { success: true }

    try {
      switch (type) {
        case 'notify':
          // In real app: send push notification
          console.log(`[Autopilot] Notify: ${params.message}`)
          break

        case 'create_insight':
          await supabase.from('insights').insert({
            user_id: event.userId,
            type: 'info',
            title: params.title || 'Autopilot Insight',
            message: params.message || 'Rule triggered',
            status: 'new'
          })
          break

        case 'suggest_goal_contribution':
          await supabase.from('recommendations').insert({
            user_id: event.userId,
            type: 'goal_contribution',
            title: 'Goal Contribution',
            description: `Autopilot suggests contributing €${params.amount} to your goal.`,
            priority: 'important',
            status: 'active',
            action_link: `/goals/${params.goal_id}`
          })
          break
          
        case 'suggest_debt_payment':
            await supabase.from('recommendations').insert({
              user_id: event.userId,
              type: 'debt_payment',
              title: 'Extra Debt Payment',
              description: `Autopilot suggests an extra debt payment of €${params.amount}.`,
              priority: 'important',
              status: 'active',
              action_link: `/debt`
            })
            break
      }

      // Log execution
      await supabase.from('rule_execution_log').insert({
        rule_id: ruleId,
        event_data: event.data,
        action_result: result
      })

      // Update rule stats
      // Note: Supabase doesn't have atomic increment in simple update, 
      // but we can use rpc or just ignore for MVP
    } catch (error) {
      console.error('Error executing rule action:', error)
    }
  }
}

