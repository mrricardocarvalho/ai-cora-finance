-- Create account_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
    CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit_card', 'loan', 'broker');
  END IF;
END$$;

-- Create accounts table
create table if not exists public.accounts (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type account_type not null,
  balance numeric(14,2) default 0,
  institution text not null,
  interest_rate numeric(6,4),
  min_payment numeric(14,2),
  updated_at timestamptz default now()
);

-- Create transactions table (has user_id for simpler RLS)
create table if not exists public.transactions (
  id uuid primary key,
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  date timestamptz not null,
  description text default '',
  category text default '',
  is_recurring boolean default false,
  tax_deductible boolean default false,
  updated_at timestamptz default now()
);

-- Enable RLS and policies for accounts
alter table public.accounts enable row level security;

create policy "Accounts: Select own account" on public.accounts for select using (auth.uid() = user_id);
create policy "Accounts: Insert own account" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Accounts: Update own account" on public.accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Accounts: Delete own account" on public.accounts for delete using (auth.uid() = user_id);

-- Enable RLS and policies for transactions
alter table public.transactions enable row level security;

create policy "Transactions: Select own transaction" on public.transactions for select using (auth.uid() = user_id);
create policy "Transactions: Insert own transaction" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Transactions: Update own transaction" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Transactions: Delete own transaction" on public.transactions for delete using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_accounts_userid on public.accounts(user_id);
create index if not exists idx_transactions_user_account on public.transactions(user_id, account_id);
