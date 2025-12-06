-- Allow viewing household members' profiles
CREATE POLICY "Household members can view profiles" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

-- Allow viewing household members' recurring patterns
CREATE POLICY "Household members can view recurring patterns" ON recurring_patterns
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
