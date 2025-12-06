# Story 13.5: Financial Autopilot Rules

status: review

**Epic:** [Epic 13 - Predictive Guidance & Financial Autopilot](../epics/epic-13-predictive-autopilot.md)
**Priority:** Low (Future)
**Points:** 8

---

## User Story

**As a** User,
**I want** to set up automatic financial rules,
**So that** good financial habits happen without my intervention.

---

## Acceptance Criteria

### AC #1: Rule Definition Interface
- **Given** user wants to automate decisions
- **When** creating a rule
- **Then** provide templates:
  - "When [TRIGGER], then [ACTION]"

### AC #2: Trigger Types
- **Given** rule creation
- **When** selecting trigger
- **Then** offer:
  - "Safe-to-Spend exceeds €X"
  - "End of month"
  - "Paycheck received"
  - "Bill paid (specific merchant)"
  - "Spending category exceeds €X"

### AC #3: Action Types
- **Given** trigger fires
- **When** executing action
- **Then** support:
  - "Alert me" (notification)
  - "Add to savings goal" (track recommendation)
  - "Suggest debt payment" (recommendation)
  - "Show summary" (generate insight)

### AC #4: Example Rules
- **Given** users need inspiration
- **When** creating rules
- **Then** suggest templates:
  - "When paycheck arrives, remind me to invest €200"
  - "When Safe-to-Spend > €500, suggest extra debt payment"
  - "When dining out > €200/month, warn me"
  - "On the 1st, show my monthly summary"

### AC #5: Rule Management
- **Given** rules are created
- **When** managing
- **Then** allow:
  - Enable/disable rules
  - Edit conditions
  - View trigger history
  - Delete rules

### AC #6: Future: Auto-Execution (v4)
- **Given** bank API integration exists (future)
- **When** enabled
- **Then** actually execute transfers (not just recommendations)
- NOTE: This is Future Vision - for now, rules only generate recommendations

---

## Technical Notes

- Create `autopilot_rules` table
- Implement rule engine that runs on relevant events
- Start with notification-only actions (safe)

### Rule Data Model
```typescript
interface AutopilotRule {
  id: string;
  userId: string;
  name: string;
  enabled: boolean;
  trigger: RuleTrigger;
  action: RuleAction;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

interface RuleTrigger {
  type: TriggerType;
  condition: TriggerCondition;
}

type TriggerType = 
  | 'safe_to_spend_exceeds'
  | 'end_of_month'
  | 'income_received'
  | 'bill_paid'
  | 'category_exceeds'
  | 'date_recurring';

interface RuleAction {
  type: ActionType;
  params: Record<string, any>;
}

type ActionType =
  | 'notify'
  | 'create_insight'
  | 'suggest_goal_contribution'
  | 'suggest_debt_payment';
```

### Rule Engine
```typescript
class RuleEngine {
  async evaluateRules(event: FinancialEvent): Promise<void> {
    const rules = await this.getUserRules(event.userId);
    
    for (const rule of rules) {
      if (this.matchesTrigger(rule.trigger, event)) {
        await this.executeAction(rule.action, event);
        await this.recordTrigger(rule.id);
      }
    }
  }
  
  private matchesTrigger(trigger: RuleTrigger, event: FinancialEvent): boolean {
    switch (trigger.type) {
      case 'safe_to_spend_exceeds':
        return event.type === 'balance_update' && 
               event.safeToSpend > trigger.condition.amount;
      case 'income_received':
        return event.type === 'transaction' && 
               event.transaction.amount > 0 &&
               this.looksLikeIncome(event.transaction);
      // ... more cases
    }
  }
}
```

### Database Schema
```sql
CREATE TABLE autopilot_rules (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL,
  trigger_condition JSONB NOT NULL,
  action_type TEXT NOT NULL,
  action_params JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_triggered TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0
);

CREATE TABLE rule_execution_log (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES autopilot_rules(id),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  event_data JSONB,
  action_result JSONB
);
```

### Rule Templates
```typescript
const ruleTemplates = [
  {
    name: 'Invest on Payday',
    trigger: { type: 'income_received', condition: {} },
    action: { type: 'notify', params: { message: 'Payday! Time to invest €{amount}' } },
  },
  {
    name: 'Surplus Debt Alert',
    trigger: { type: 'safe_to_spend_exceeds', condition: { amount: 500 } },
    action: { type: 'suggest_debt_payment', params: {} },
  },
  {
    name: 'Dining Warning',
    trigger: { type: 'category_exceeds', condition: { category: 'Dining', amount: 200 } },
    action: { type: 'notify', params: { message: 'Dining budget exceeded!' } },
  },
];
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/automation/rule-engine.ts` | Create |
| `src/lib/automation/triggers.ts` | Create |
| `src/lib/automation/actions.ts` | Create |
| `src/components/settings/AutopilotRules.tsx` | Create |
| `src/app/settings/autopilot/page.tsx` | Create |
| `db/migrations/00XX_autopilot_rules.sql` | Create |

---

## Prerequisites

- Story 3.2: Safe-to-Spend Logic (for financial triggers)
- Story 3.1: Recurring Detection (for bill triggers)
- Story 6.1: Web Push (for notifications)

---

## Definition of Done

- [x] Rule creation UI with templates
- [x] 5+ trigger types implemented
- [x] 4+ action types implemented
- [x] Rule engine evaluates on events
- [x] Rule management (enable/disable/edit/delete)
- [x] Trigger history visible
- [x] Example templates available
- [x] Rules persist in database
- [x] Unit tests for rule engine
