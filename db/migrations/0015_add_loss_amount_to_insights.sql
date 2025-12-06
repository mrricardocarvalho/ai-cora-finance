-- Add numeric loss_amount column to insights for robust tax-loss tracking
ALTER TABLE public.insights
  ADD COLUMN IF NOT EXISTS loss_amount numeric(14,2);

CREATE INDEX IF NOT EXISTS idx_insights_user_type_title_created_at ON public.insights(user_id, type, title, created_at);
