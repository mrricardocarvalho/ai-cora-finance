import { pgTable, uuid, text, decimal, integer, boolean, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'

// Drizzle schema for profiles table; include a minimal `auth.users` table so we can reference it
export const authUsers = pgTable('auth.users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
})

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  email: text('email'),
  comfort_floor: decimal('comfort_floor', { precision: 10, scale: 2 }).default('0'),
  risk_tolerance: text('risk_tolerance'),
  onboarding_completed: boolean('onboarding_completed').default(false),
  onboarding_step: integer('onboarding_step').default(1),
  currency: text('currency').default('EUR'),
  push_subscription: text('push_subscription'),
  notification_preferences: text('notification_preferences'),
  learned_concepts: text('learned_concepts').array().default([]),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Account type enum
export const accountTypeEnum = pgEnum('account_type', ['checking', 'savings', 'credit_card', 'loan', 'broker'])

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  balance: decimal('balance', { precision: 14, scale: 2 }).default('0'),
  institution: text('institution').notNull(),
  interest_rate: decimal('interest_rate', { precision: 6, scale: 4 }),
  min_payment: decimal('min_payment', { precision: 14, scale: 2 }),
  due_date: integer('due_date'),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey(),
  account_id: uuid('account_id').notNull().references(() => accounts.id),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  description: text('description').default(''),
  category: text('category').default(''),
  is_recurring: boolean('is_recurring').default(false),
  tax_deductible: boolean('tax_deductible').default(false),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const recurring_patterns = pgTable('recurring_patterns', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  merchant_name: text('merchant_name').notNull(),
  merchant_slug: text('merchant_slug'),
  amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
  frequency: text('frequency').default('monthly'),
  last_date: timestamp('last_date'),
  next_date: timestamp('next_date'),
  category: text('category'),
  is_active: boolean('is_active').default(true),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const insightTypeEnum = pgEnum('insight_type', ['urgent', 'warning', 'opportunity', 'info'])
export const insightStatusEnum = pgEnum('insight_status', ['new', 'read', 'dismissed', 'acted'])

export const insights = pgTable('insights', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  type: insightTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  loss_amount: decimal('loss_amount', { precision: 14, scale: 2 }),
  action_link: text('action_link'),
  score_impact: integer('score_impact').default(0),
  status: insightStatusEnum('status').default('new'),
  created_at: timestamp('created_at').defaultNow(),
})

export const monthlySummaries = pgTable('monthly_summaries', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  month: timestamp('month').notNull(), // first day of month
  total_in: decimal('total_in', { precision: 14, scale: 2 }).default('0'),
  total_out: decimal('total_out', { precision: 14, scale: 2 }).default('0'),
  savings_rate: decimal('savings_rate', { precision: 5, scale: 2 }).default('0'),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  name: text('name').notNull(),
  target_amount: decimal('target_amount', { precision: 14, scale: 2 }).notNull(),
  current_amount: decimal('current_amount', { precision: 14, scale: 2 }).default('0'),
  deadline: timestamp('deadline'),
  linked_account_id: uuid('linked_account_id').references(() => accounts.id),
  created_at: timestamp('created_at').defaultNow(),
})

export const assets = pgTable('assets', {
  ticker: text('ticker').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  current_price: decimal('current_price', { precision: 14, scale: 4 }).default('0'),
  last_updated: timestamp('last_updated')
})

export const investmentTxTypeEnum = pgEnum('investment_transaction_type', ['buy', 'sell', 'dividend'])

export const investmentTransactions = pgTable('investment_transactions', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  account_id: uuid('account_id').references(() => accounts.id),
  ticker: text('ticker').notNull().references(() => assets.ticker),
  type: investmentTxTypeEnum('type').notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 6 }).notNull(),
  price_per_share: decimal('price_per_share', { precision: 14, scale: 6 }).notNull(),
  fees: decimal('fees', { precision: 14, scale: 6 }).default('0'),
  date: timestamp('date').notNull(),
  created_at: timestamp('created_at').defaultNow(),
})

export const holdings = pgTable('holdings', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  account_id: uuid('account_id').notNull().references(() => accounts.id),
  ticker: text('ticker').notNull().references(() => assets.ticker),
  quantity: decimal('quantity', { precision: 18, scale: 6 }).notNull(),
  avg_cost_basis: decimal('avg_cost_basis', { precision: 18, scale: 6 }).notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Chat/Conversations schema (FR23-FR27)
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  title: text('title').default('New conversation'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant'])

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey(),
  conversation_id: uuid('conversation_id').notNull().references(() => conversations.id),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  role: text('role').notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  suggested_questions: text('suggested_questions'), // JSON array stored as text
  created_at: timestamp('created_at').defaultNow(),
})

export const recommendationStatusEnum = pgEnum('recommendation_status', ['active', 'completed', 'dismissed', 'snoozed'])
export const recommendationPriorityEnum = pgEnum('recommendation_priority', ['urgent', 'important', 'optimization'])

export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').notNull().references(() => profiles.id),
  type: text('type').notNull(), // e.g. 'emergency_fund', 'debt_payoff'
  title: text('title').notNull(),
  description: text('description').notNull(),
  action_link: text('action_link'),
  priority: recommendationPriorityEnum('priority').default('optimization'),
  status: recommendationStatusEnum('status').default('active'),
  snoozed_until: timestamp('snoozed_until'),
  impact_score: integer('impact_score').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const autopilotRules = pgTable('autopilot_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  trigger_type: text('trigger_type').notNull(),
  trigger_condition: jsonb('trigger_condition').notNull(),
  action_type: text('action_type').notNull(),
  action_params: jsonb('action_params').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  last_triggered: timestamp('last_triggered'),
  trigger_count: integer('trigger_count').default(0).notNull(),
})

export const ruleExecutionLog = pgTable('rule_execution_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  rule_id: uuid('rule_id').notNull().references(() => autopilotRules.id, { onDelete: 'cascade' }),
  triggered_at: timestamp('triggered_at').defaultNow().notNull(),
  event_data: jsonb('event_data'),
  action_result: jsonb('action_result'),
})

