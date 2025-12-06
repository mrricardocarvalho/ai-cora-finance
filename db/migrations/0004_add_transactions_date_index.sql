-- Add index on transactions.date for performance
create index if not exists idx_transactions_date on public.transactions(date);
