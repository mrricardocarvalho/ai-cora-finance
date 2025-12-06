-- Add table to cache tax exposure per user
CREATE TABLE IF NOT EXISTS public.tax_exposure_cache (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  total_tax numeric(14,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_exposure_cache_user_id ON public.tax_exposure_cache(user_id);
