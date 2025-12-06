-- Add indexes to improve user-specific queries and recent insights by type
CREATE INDEX IF NOT EXISTS idx_insights_user_created_at ON insights (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_user_type_created_at ON insights (user_id, type, created_at DESC);
