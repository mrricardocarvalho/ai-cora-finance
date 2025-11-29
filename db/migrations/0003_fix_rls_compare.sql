-- Fix RLS policies to compare user_id::text to auth.uid() explicitly

-- Ensure RLS is enabled for both tables
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

-- Drop existing policies for accounts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Accounts: Select own account') THEN
    DROP POLICY "Accounts: Select own account" ON public.accounts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Accounts: Insert own account') THEN
    DROP POLICY "Accounts: Insert own account" ON public.accounts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Accounts: Update own account') THEN
    DROP POLICY "Accounts: Update own account" ON public.accounts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Accounts: Delete own account') THEN
    DROP POLICY "Accounts: Delete own account" ON public.accounts;
  END IF;
END$$;

-- Recreate policies with explicit cast
create policy "Accounts: Select own account" on public.accounts for select using (user_id = auth.uid()::uuid);
create policy "Accounts: Insert own account" on public.accounts for insert with check (user_id = auth.uid()::uuid);
create policy "Accounts: Update own account" on public.accounts for update using (user_id = auth.uid()::uuid) with check (user_id = auth.uid()::uuid);
create policy "Accounts: Delete own account" on public.accounts for delete using (user_id = auth.uid()::uuid);

-- Drop existing policies for transactions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Transactions: Select own transaction') THEN
    DROP POLICY "Transactions: Select own transaction" ON public.transactions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Transactions: Insert own transaction') THEN
    DROP POLICY "Transactions: Insert own transaction" ON public.transactions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Transactions: Update own transaction') THEN
    DROP POLICY "Transactions: Update own transaction" ON public.transactions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Transactions: Delete own transaction') THEN
    DROP POLICY "Transactions: Delete own transaction" ON public.transactions;
  END IF;
END$$;

create policy "Transactions: Select own transaction" on public.transactions for select using (user_id = auth.uid()::uuid);
create policy "Transactions: Insert own transaction" on public.transactions for insert with check (user_id = auth.uid()::uuid);
create policy "Transactions: Update own transaction" on public.transactions for update using (user_id = auth.uid()::uuid) with check (user_id = auth.uid()::uuid);
create policy "Transactions: Delete own transaction" on public.transactions for delete using (user_id = auth.uid()::uuid);
