-- Migration: add notification_preferences to profiles
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"urgent": true, "opportunities": true, "weekly_summary": false, "quiet_hours_enabled": true, "quiet_hours_start": "22:00", "quiet_hours_end": "08:00"}';
