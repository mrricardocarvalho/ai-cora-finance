-- Migration: add account type and ownership checks, and input validation to record_investment_transaction
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
  v_acc_type text;
  v_acc_user uuid;
begin
  -- Input validation
  if p_quantity <= 0 then
    raise exception 'Quantity must be greater than 0';
  end if;
  if p_price_per_share < 0 then
    raise exception 'Price per share must be non-negative';
  end if;
  if p_fees < 0 then
    raise exception 'Fees must be non-negative';
  end if;
  -- Account ownership and type validation
  select type, user_id into v_acc_type, v_acc_user from public.accounts where id = p_account_id;
  if not found then
    raise exception 'Account not found';
  end if;
  if v_acc_user is distinct from p_user_id then
    raise exception 'Account does not belong to the user';
  end if;
  if v_acc_type != 'broker' then
    raise exception 'Account must be a broker account';
  end if;

  -- existing logic (same code as original function body)
  insert into public.investment_transactions (id, user_id, account_id, ticker, type, quantity, price_per_share, fees, date, created_at)
  values (gen_random_uuid(), p_user_id, p_account_id, p_ticker, p_type, p_quantity, p_price_per_share, p_fees, p_date, now()) returning id into v_txid;

  if p_type = 'buy' then
    select * into v_holding from public.holdings where user_id = p_user_id and account_id = p_account_id and ticker = p_ticker for update;
    if not found then
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
    null;
  end if;
  return v_txid;
end; $$ language plpgsql security definer;

-- Grant execute to authenticated role if needed
-- GRANT EXECUTE ON FUNCTION public.record_investment_transaction(uuid, uuid, text, text, numeric, numeric, numeric, timestamptz) TO authenticated;
