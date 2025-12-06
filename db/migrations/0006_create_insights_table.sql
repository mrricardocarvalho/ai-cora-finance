-- Migration: create insights table with enums

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'insight_type') THEN
    CREATE TYPE insight_type AS ENUM ('urgent', 'warning', 'opportunity', 'info');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'insight_status') THEN
    CREATE TYPE insight_status AS ENUM ('new', 'read', 'dismissed', 'acted');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_link text,
  score_impact integer DEFAULT 0,
  status insight_status DEFAULT 'new',
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_user_type on insights(user_id, type);
CREATE INDEX IF NOT EXISTS idx_insights_user_created on insights(user_id, created_at);

-- RLS and policies
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insights: Select own" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insights: Insert own" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insights: Update own" ON public.insights FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insights: Delete own" ON public.insights FOR DELETE USING (auth.uid() = user_id);
