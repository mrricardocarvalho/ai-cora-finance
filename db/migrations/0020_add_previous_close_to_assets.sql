-- Add previous_close column to assets table for day change calculation
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS previous_close NUMERIC(15,4);

-- Comment for clarity
COMMENT ON COLUMN public.assets.previous_close IS 'Previous day closing price for calculating day change';
