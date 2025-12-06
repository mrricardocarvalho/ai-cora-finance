-- Add index for holdings.user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
