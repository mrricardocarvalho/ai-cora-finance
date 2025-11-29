import { pgTable, uuid, text, decimal, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'

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
