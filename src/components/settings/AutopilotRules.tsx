'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Zap, Edit2, History, X, AlertCircle, Check } from 'lucide-react'
import { TRIGGER_DEFINITIONS, TriggerType, TriggerCondition } from '@/lib/automation/triggers'
import { ACTION_DEFINITIONS, ActionType, ActionParams } from '@/lib/automation/actions'
import { getSupabaseClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface Rule {
  id: string
  name: string
  enabled: boolean
  trigger_type: TriggerType
  trigger_condition: TriggerCondition
  action_type: ActionType
  action_params: ActionParams
  created_at?: string
}

interface TriggerExecution {
  id: string
  rule_id: string
  triggered_at: string
  result: 'success' | 'failed' | 'skipped'
  details?: string
}

interface RuleFormData {
  name: string
  trigger_type: TriggerType
  trigger_condition: TriggerCondition
  action_type: ActionType
  action_params: ActionParams
}

const DEFAULT_FORM_DATA: RuleFormData = {
  name: '',
  trigger_type: 'safe_to_spend_exceeds',
  trigger_condition: { amount: 500 },
  action_type: 'notify',
  action_params: { message: '' }
}

function RuleFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  isEditing
}: {
  open: boolean
  onClose: () => void
  onSave: (data: RuleFormData) => Promise<void>
  initialData?: RuleFormData
  isEditing: boolean
}) {
  const [formData, setFormData] = useState<RuleFormData>(initialData || DEFAULT_FORM_DATA)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData(initialData || DEFAULT_FORM_DATA)
      setErrors({})
    }
  }, [open, initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    const triggerDef = TRIGGER_DEFINITIONS[formData.trigger_type]
    triggerDef.fields.forEach(field => {
      if (field === 'amount' && (!formData.trigger_condition.amount || formData.trigger_condition.amount <= 0)) {
        newErrors[`trigger_${field}`] = 'Amount must be greater than 0'
      }
      if (field === 'category' && !formData.trigger_condition.category) {
        newErrors[`trigger_${field}`] = 'Category is required'
      }
      if (field === 'merchant' && !formData.trigger_condition.merchant) {
        newErrors[`trigger_${field}`] = 'Merchant is required'
      }
    })

    const actionDef = ACTION_DEFINITIONS[formData.action_type]
    actionDef.fields.forEach(field => {
      if (field === 'message' && !formData.action_params.message?.trim()) {
        newErrors[`action_${field}`] = 'Message is required'
      }
      if (field === 'title' && !formData.action_params.title?.trim()) {
        newErrors[`action_${field}`] = 'Title is required'
      }
      if (field === 'amount' && (!formData.action_params.amount || formData.action_params.amount <= 0)) {
        newErrors[`action_${field}`] = 'Amount must be greater than 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    
    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const updateTriggerCondition = (field: keyof TriggerCondition, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      trigger_condition: { ...prev.trigger_condition, [field]: value }
    }))
  }

  const updateActionParams = (field: keyof ActionParams, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      action_params: { ...prev.action_params, [field]: value }
    }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-surface border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4"
      >
        <div className="sticky top-0 bg-surface border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Rule' : 'Create Rule'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-lg" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Rule Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Rule Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Auto-save when flush"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Trigger Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">When this happens...</label>
            <select
              value={formData.trigger_type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                trigger_type: e.target.value as TriggerType,
                trigger_condition: {}
              }))}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              aria-label="Select trigger type"
            >
              {Object.entries(TRIGGER_DEFINITIONS).map(([key, def]) => (
                <option key={key} value={key}>{def.label}</option>
              ))}
            </select>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {TRIGGER_DEFINITIONS[formData.trigger_type].description}
            </p>

            {/* Trigger Condition Fields */}
            <div className="mt-3 space-y-3">
              {TRIGGER_DEFINITIONS[formData.trigger_type].fields.includes('amount') && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Amount (€)</label>
                  <input
                    type="number"
                    value={formData.trigger_condition.amount || ''}
                    onChange={(e) => updateTriggerCondition('amount', Number(e.target.value))}
                    placeholder="500"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                  {errors.trigger_amount && <p className="text-sm text-red-500 mt-1">{errors.trigger_amount}</p>}
                </div>
              )}
              {TRIGGER_DEFINITIONS[formData.trigger_type].fields.includes('category') && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.trigger_condition.category || ''}
                    onChange={(e) => updateTriggerCondition('category', e.target.value)}
                    placeholder="e.g., Dining"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                  {errors.trigger_category && <p className="text-sm text-red-500 mt-1">{errors.trigger_category}</p>}
                </div>
              )}
              {TRIGGER_DEFINITIONS[formData.trigger_type].fields.includes('merchant') && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Merchant</label>
                  <input
                    type="text"
                    value={formData.trigger_condition.merchant || ''}
                    onChange={(e) => updateTriggerCondition('merchant', e.target.value)}
                    placeholder="e.g., Netflix"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                  {errors.trigger_merchant && <p className="text-sm text-red-500 mt-1">{errors.trigger_merchant}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Then do this...</label>
            <select
              value={formData.action_type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                action_type: e.target.value as ActionType,
                action_params: {}
              }))}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              aria-label="Select action type"
            >
              {Object.entries(ACTION_DEFINITIONS).map(([key, def]) => (
                <option key={key} value={key}>{def.label}</option>
              ))}
            </select>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {ACTION_DEFINITIONS[formData.action_type].description}
            </p>

            {/* Action Params Fields */}
            <div className="mt-3 space-y-3">
              {ACTION_DEFINITIONS[formData.action_type].fields.includes('title') && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.action_params.title || ''}
                    onChange={(e) => updateActionParams('title', e.target.value)}
                    placeholder="e.g., Savings Opportunity"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                  {errors.action_title && <p className="text-sm text-red-500 mt-1">{errors.action_title}</p>}
                </div>
              )}
              {ACTION_DEFINITIONS[formData.action_type].fields.includes('message') && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Message</label>
                  <textarea
                    value={formData.action_params.message || ''}
                    onChange={(e) => updateActionParams('message', e.target.value)}
                    placeholder="e.g., You have extra cash - consider saving it!"
                    rows={3}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
                  />
                  {errors.action_message && <p className="text-sm text-red-500 mt-1">{errors.action_message}</p>}
                </div>
              )}
              {ACTION_DEFINITIONS[formData.action_type].fields.includes('amount') && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Amount (€)</label>
                  <input
                    type="number"
                    value={formData.action_params.amount || ''}
                    onChange={(e) => updateActionParams('amount', Number(e.target.value))}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                  {errors.action_amount && <p className="text-sm text-red-500 mt-1">{errors.action_amount}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface border-t border-[var(--border)] px-6 py-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Rule'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

function TriggerHistoryDialog({
  open,
  onClose,
  ruleId,
  ruleName
}: {
  open: boolean
  onClose: () => void
  ruleId: string
  ruleName: string
}) {
  const [executions, setExecutions] = useState<TriggerExecution[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!open || !supabase) return

    const fetchHistory = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('autopilot_trigger_history')
        .select('*')
        .eq('rule_id', ruleId)
        .order('triggered_at', { ascending: false })
        .limit(20)

      if (data) setExecutions(data as TriggerExecution[])
      setLoading(false)
    }

    fetchHistory()
  }, [open, ruleId, supabase])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-surface border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden mx-4"
      >
        <div className="sticky top-0 bg-surface border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Trigger History</h2>
            <p className="text-sm text-[var(--text-muted)]">{ruleName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-lg" aria-label="Close history dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <p className="text-center text-[var(--text-muted)] py-8">Loading history...</p>
          ) : executions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
              <p className="text-[var(--text-muted)]">No executions yet</p>
              <p className="text-sm text-[var(--text-muted)]">This rule hasn&apos;t been triggered.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map(exec => (
                <div
                  key={exec.id}
                  className="flex items-start gap-3 p-3 bg-[var(--bg-subtle)] rounded-lg"
                >
                  <div className={`p-1.5 rounded-full ${
                    exec.result === 'success' ? 'bg-green-100 text-green-600' :
                    exec.result === 'failed' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {exec.result === 'success' ? <Check className="w-4 h-4" /> :
                     exec.result === 'failed' ? <AlertCircle className="w-4 h-4" /> :
                     <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{exec.result}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(exec.triggered_at).toLocaleString()}
                    </p>
                    {exec.details && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">{exec.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export function AutopilotRulesList() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [historyRule, setHistoryRule] = useState<Rule | null>(null)
  const supabase = getSupabaseClient()

  const fetchRules = useCallback(async () => {
    if (!supabase) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('autopilot_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setRules(data as Rule[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const toggleRule = async (id: string, current: boolean) => {
    if (!supabase) return
    // Optimistic update
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !current } : r))
    
    await supabase
      .from('autopilot_rules')
      .update({ enabled: !current })
      .eq('id', id)
  }

  const deleteRule = async (id: string) => {
    if (!supabase) return
    if (!confirm('Delete this rule? This cannot be undone.')) return
    
    setRules(rules.filter(r => r.id !== id))
    await supabase.from('autopilot_rules').delete().eq('id', id)
  }

  const createRule = async (formData: RuleFormData) => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newRule = {
      user_id: user.id,
      name: formData.name,
      trigger_type: formData.trigger_type,
      trigger_condition: formData.trigger_condition,
      action_type: formData.action_type,
      action_params: formData.action_params,
      enabled: true
    }

    const { data } = await supabase.from('autopilot_rules').insert(newRule).select().single()
    if (data) setRules([data as Rule, ...rules])
  }

  const updateRule = async (formData: RuleFormData) => {
    if (!supabase || !editingRule) return

    const updates = {
      name: formData.name,
      trigger_type: formData.trigger_type,
      trigger_condition: formData.trigger_condition,
      action_type: formData.action_type,
      action_params: formData.action_params
    }

    const { data } = await supabase
      .from('autopilot_rules')
      .update(updates)
      .eq('id', editingRule.id)
      .select()
      .single()

    if (data) {
      setRules(rules.map(r => r.id === editingRule.id ? data as Rule : r))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Autopilot Rules</h2>
            <p className="text-muted-foreground">Automate your financial habits</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-[var(--bg-hover)] rounded" />
                    <div className="h-3 w-2/3 bg-[var(--bg-hover)] rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Autopilot Rules</h2>
          <p className="text-muted-foreground">Automate your financial habits</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      <div className="grid gap-4">
        {rules.length === 0 && (
          <Card>
            <CardContent className="pt-6 pb-8 text-center">
              <Zap className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
              <h3 className="font-semibold mb-1">No rules configured</h3>
              <p className="text-muted-foreground mb-4">
                Create autopilot rules to automate your financial habits.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Rule
              </Button>
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {rules.map(rule => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className={!rule.enabled ? 'opacity-60' : ''}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${rule.enabled ? 'bg-primary/10' : 'bg-[var(--bg-hover)]'}`}>
                      <Zap className={`w-5 h-5 ${rule.enabled ? 'text-primary' : 'text-[var(--text-muted)]'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        When <strong>{TRIGGER_DEFINITIONS[rule.trigger_type]?.label}</strong>
                        {rule.trigger_condition.amount && ` (€${rule.trigger_condition.amount})`}
                        {rule.trigger_condition.category && ` (${rule.trigger_condition.category})`}
                        , then <strong>{ACTION_DEFINITIONS[rule.action_type]?.label}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setHistoryRule(rule)}
                      title="View trigger history"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingRule(rule)}
                      title="Edit rule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
                      <span className="text-sm text-muted-foreground">{rule.enabled ? 'On' : 'Off'}</span>
                      <Switch 
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id, rule.enabled)}
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Dialog */}
      <RuleFormDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={createRule}
        isEditing={false}
      />

      {/* Edit Dialog */}
      <RuleFormDialog
        open={!!editingRule}
        onClose={() => setEditingRule(null)}
        onSave={updateRule}
        initialData={editingRule ? {
          name: editingRule.name,
          trigger_type: editingRule.trigger_type,
          trigger_condition: editingRule.trigger_condition,
          action_type: editingRule.action_type,
          action_params: editingRule.action_params
        } : undefined}
        isEditing={true}
      />

      {/* History Dialog */}
      <TriggerHistoryDialog
        open={!!historyRule}
        onClose={() => setHistoryRule(null)}
        ruleId={historyRule?.id || ''}
        ruleName={historyRule?.name || ''}
      />
    </div>
  )
}

