-- Migration: add push_subscription to profiles
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS push_subscription jsonb;
-- No index needed; JSON stored as subscription object
