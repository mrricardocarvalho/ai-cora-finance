CREATE POLICY "Household members can view insights" ON insights
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
