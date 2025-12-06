-- Add unique index to enforce one recurring pattern per user per merchant slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_recurring_patterns_user_slug_unique ON recurring_patterns (user_id, merchant_slug);
