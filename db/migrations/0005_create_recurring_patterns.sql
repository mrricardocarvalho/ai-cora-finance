-- Migration: create recurring_patterns table

CREATE TABLE IF NOT EXISTS recurring_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  merchant_name text NOT NULL,
  amount numeric(14,2) NOT NULL,
  frequency text DEFAULT 'monthly',
  last_date timestamp,
  next_date timestamp,
  category text,
  is_active boolean DEFAULT true,
  updated_at timestamp DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_merchant ON recurring_patterns(merchant_name);

-- Row level security enabled + policies
ALTER TABLE public.recurring_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recurring: Select own" ON public.recurring_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Recurring: Insert own" ON public.recurring_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recurring: Update own" ON public.recurring_patterns FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recurring: Delete own" ON public.recurring_patterns FOR DELETE USING (auth.uid() = user_id);
