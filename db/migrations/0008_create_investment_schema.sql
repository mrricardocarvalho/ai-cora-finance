-- Migration: create assets, investment_transactions, holdings and an rpc function to record transactions atomically

-- assets table
create table if not exists public.assets (
  ticker text primary key,
  name text not null,
  type text not null,
  current_price numeric(14,4) default 0,
  last_updated timestamptz
);

-- investment_transactions table
create table if not exists public.investment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  ticker text not null references public.assets(ticker),
  type text not null,
  quantity numeric(18,6) not null,
  price_per_share numeric(14,6) not null,
  fees numeric(14,6) default 0,
  date timestamptz not null,
  created_at timestamptz default now()
);

-- holdings table
create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  ticker text not null references public.assets(ticker),
  quantity numeric(18,6) not null,
  avg_cost_basis numeric(18,6) not null,
  updated_at timestamptz default now(),
  unique (account_id, ticker)
);

-- RLS for holdings and investment_transactions
alter table public.investment_transactions enable row level security;
create policy "InvestmentTx: Select own" on public.investment_transactions for select using (auth.uid() = user_id);
create policy "InvestmentTx: Insert own" on public.investment_transactions for insert with check (auth.uid() = user_id);
create policy "InvestmentTx: Update own" on public.investment_transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "InvestmentTx: Delete own" on public.investment_transactions for delete using (auth.uid() = user_id);

alter table public.holdings enable row level security;
create policy "Holdings: Select own" on public.holdings for select using (auth.uid() = user_id);
create policy "Holdings: Insert own" on public.holdings for insert with check (auth.uid() = user_id);
create policy "Holdings: Update own" on public.holdings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Holdings: Delete own" on public.holdings for delete using (auth.uid() = user_id);

-- Function to atomically record an investment transaction and update holdings
create or replace function public.record_investment_transaction(
  p_user_id uuid,
  p_account_id uuid,
  p_ticker text,
  p_type text,
  p_quantity numeric,
  p_price_per_share numeric,
  p_fees numeric,
  p_date timestamptz
) returns uuid as $$
declare
  v_holding public.holdings%rowtype;
  v_newqty numeric;
  v_newavg numeric;
  v_txid uuid;
begin
  -- insert transaction
  insert into public.investment_transactions (id, user_id, account_id, ticker, type, quantity, price_per_share, fees, date, created_at)
  values (gen_random_uuid(), p_user_id, p_account_id, p_ticker, p_type, p_quantity, p_price_per_share, p_fees, p_date, now()) returning id into v_txid;

  if p_type = 'buy' then
    -- try to find existing holding
    select * into v_holding from public.holdings where user_id = p_user_id and account_id = p_account_id and ticker = p_ticker for update;
    if not found then
      -- insert new holding
      insert into public.holdings (id, user_id, account_id, ticker, quantity, avg_cost_basis, updated_at)
      values (gen_random_uuid(), p_user_id, p_account_id, p_ticker, p_quantity, p_price_per_share + (p_fees / nullif(p_quantity,0)), now());
    else
      v_newqty := v_holding.quantity + p_quantity;
      v_newavg := ((v_holding.quantity * v_holding.avg_cost_basis) + ((p_quantity * p_price_per_share) + p_fees)) / v_newqty;
      update public.holdings set quantity = v_newqty, avg_cost_basis = v_newavg, updated_at = now() where id = v_holding.id;
    end if;
  elsif p_type = 'sell' then
    select * into v_holding from public.holdings where user_id = p_user_id and account_id = p_account_id and ticker = p_ticker for update;
    if not found then
      raise exception 'Insufficient holdings for sell';
    end if;
    if v_holding.quantity < p_quantity then
      raise exception 'Insufficient holdings: cannot sell more than held';
    end if;
    v_newqty := v_holding.quantity - p_quantity;
    if v_newqty = 0 then
      update public.holdings set quantity = 0, avg_cost_basis = 0, updated_at = now() where id = v_holding.id;
    else
      update public.holdings set quantity = v_newqty, updated_at = now() where id = v_holding.id;
    end if;
  else
    -- other types (dividend) no holding change
    null;
  end if;
  return v_txid;
end; $$ language plpgsql security definer;

-- Grant execute to authenticated role if needed
-- GRANT EXECUTE ON FUNCTION public.record_investment_transaction(uuid, uuid, text, text, numeric, numeric, numeric, timestamptz) TO authenticated;

create index if not exists idx_holdings_account_ticker on public.holdings(account_id, ticker);
create index if not exists idx_investment_transactions_user_ticker on public.investment_transactions(user_id, ticker);

-- end
