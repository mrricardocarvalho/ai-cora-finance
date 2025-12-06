-- Add confidence_score column to transactions table
-- This stores the AI's confidence in the category assignment (0.0 - 1.0)
-- When user manually edits category, set to 1.0

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS confidence_score numeric(3,2) DEFAULT NULL;

-- Index for finding low-confidence transactions that need review
CREATE INDEX IF NOT EXISTS idx_transactions_low_confidence 
ON public.transactions(user_id, confidence_score) 
WHERE confidence_score IS NULL OR confidence_score < 0.8;

COMMENT ON COLUMN public.transactions.confidence_score IS 'AI confidence score for category (0.0-1.0). NULL = not AI categorized, 1.0 = user confirmed';
