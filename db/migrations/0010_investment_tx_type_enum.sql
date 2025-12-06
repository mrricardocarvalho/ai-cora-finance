-- Add enum type for investment transactions and convert existing column to use it
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investment_transaction_type') THEN
    CREATE TYPE investment_transaction_type AS ENUM ('buy', 'sell', 'dividend');
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- Convert type column to investment_transaction_type using safe cast
ALTER TABLE public.investment_transactions
  ALTER COLUMN type TYPE investment_transaction_type USING (type::investment_transaction_type);

-- Optional: add constraint to ensure only supported types are present (already enforced by enum)
