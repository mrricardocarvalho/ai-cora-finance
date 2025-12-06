ALTER TABLE accounts ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'personal'; -- 'personal', 'shared'

-- RLS Policy Update
-- First, drop existing policy if it conflicts or update it.
-- Usually "Users can view own accounts" exists. We need to ADD a policy for shared accounts.

CREATE POLICY "Household members can view shared accounts" ON accounts
  FOR SELECT USING (
    visibility = 'shared' 
    AND user_id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
