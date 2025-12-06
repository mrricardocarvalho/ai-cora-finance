-- Add starting_balance column to accounts
-- This stores the initial balance as of when the account was created/linked
-- The balance column will then be: starting_balance + sum(transactions)

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS starting_balance numeric(14,2) DEFAULT 0;

-- Also add a starting_balance_date to know as of when the starting balance is valid
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS starting_balance_date date DEFAULT CURRENT_DATE;

-- For existing accounts, copy the current balance to starting_balance
-- This preserves the values users entered when creating accounts
UPDATE public.accounts 
SET starting_balance = balance,
    starting_balance_date = CURRENT_DATE
WHERE starting_balance IS NULL OR starting_balance = 0;

-- Add a comment to clarify the relationship
COMMENT ON COLUMN public.accounts.starting_balance IS 'The account balance as of starting_balance_date. Used as baseline for transaction calculations.';
COMMENT ON COLUMN public.accounts.balance IS 'Current calculated balance = starting_balance + sum of transactions after starting_balance_date';
