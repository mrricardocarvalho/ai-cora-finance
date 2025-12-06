CREATE POLICY "Household members can view holdings" ON holdings
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Household members can view investment transactions" ON investment_transactions
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM household_members 
      WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
