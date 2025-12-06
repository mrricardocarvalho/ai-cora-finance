-- Add index to speed up user transaction queries by date
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions (user_id, date);
