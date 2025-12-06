ALTER TABLE goals ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'personal';

-- Update RLS for goals to respect visibility
DROP POLICY IF EXISTS "Household members can view goals" ON goals;

CREATE POLICY "Household members can view shared goals" ON goals
  FOR SELECT USING (
    visibility = 'shared' 
    AND user_id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
