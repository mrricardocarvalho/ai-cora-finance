-- Add merchant_slug to recurring_patterns and create an index for lookups
ALTER TABLE recurring_patterns
  ADD COLUMN IF NOT EXISTS merchant_slug text;
CREATE INDEX IF NOT EXISTS idx_recurring_patterns_merchant_slug_user_id ON recurring_patterns (merchant_slug, user_id);

-- Backfill merchant_slug from merchant_name where present
UPDATE recurring_patterns
SET merchant_slug = regexp_replace(lower(regexp_replace(coalesce(merchant_name, ''), '[^a-z0-9\s]+', '', 'g')), '\\s+', '-', 'g')
WHERE merchant_slug IS NULL OR merchant_slug = '';
