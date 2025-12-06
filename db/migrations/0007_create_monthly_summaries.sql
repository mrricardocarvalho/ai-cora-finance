-- Migration: create monthly_summaries table

CREATE TABLE IF NOT EXISTS monthly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month timestamptz NOT NULL,
  total_in numeric(14,2) DEFAULT 0,
  total_out numeric(14,2) DEFAULT 0,
  savings_rate numeric(5,2) DEFAULT 0,
  updated_at timestamptz DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_user_month ON monthly_summaries(user_id, month);
CREATE INDEX IF NOT EXISTS idx_monthly_user ON monthly_summaries(user_id);

-- RLS policies
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Monthly Summaries: Select own" ON public.monthly_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Monthly Summaries: Insert own" ON public.monthly_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Monthly Summaries: Update own" ON public.monthly_summaries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Monthly Summaries: Delete own" ON public.monthly_summaries FOR DELETE USING (auth.uid() = user_id);
