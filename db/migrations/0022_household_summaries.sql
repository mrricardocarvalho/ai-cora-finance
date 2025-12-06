CREATE POLICY "Household members can view monthly summaries" ON monthly_summaries
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
