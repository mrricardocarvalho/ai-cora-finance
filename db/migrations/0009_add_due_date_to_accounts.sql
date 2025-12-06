-- Migration: Add due_date to accounts
alter table if exists public.accounts
  add column if not exists due_date integer;

-- Update: No RLS changes necessary for this field (user-only access enforced by user_id)
