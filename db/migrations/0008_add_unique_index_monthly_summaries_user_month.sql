-- Ensure uniqueness and fast lookups for monthly summaries by user/month
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_summaries_user_month_unique ON monthly_summaries (user_id, month);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_month ON monthly_summaries (user_id, month);
