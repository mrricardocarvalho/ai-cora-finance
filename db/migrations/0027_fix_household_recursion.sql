-- Fix infinite recursion in household_members policies
-- The issue is "Members can view other members" policy queries household_members itself recursively.

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "Members can view other members" ON household_members;
DROP POLICY IF EXISTS "Admins can manage members" ON household_members;
DROP POLICY IF EXISTS "Household members can view household" ON households;
DROP POLICY IF EXISTS "Admins can update household" ON households;

-- 2. Create a secure function to get user's household IDs
-- This function runs with SECURITY DEFINER to bypass RLS when checking membership
CREATE OR REPLACE FUNCTION get_my_household_ids()
RETURNS TABLE (household_id UUID) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
STABLE
AS $$
  SELECT household_id 
  FROM household_members 
  WHERE user_id = auth.uid();
$$;

-- 3. Re-create policies using the secure function

-- Households: Visible if ID is in my households
CREATE POLICY "Household members can view household"
  ON households FOR SELECT
  USING (
    id IN (SELECT household_id FROM get_my_household_ids())
  );

-- Households: Admins can update
-- We need to check role. We can't use the function for role check easily unless we return role too.
-- Or we can just check household_members directly but we need to avoid recursion on household_members table.
-- But wait, this policy is on 'households' table, so querying 'household_members' is fine!
-- The recursion was on 'household_members' table querying 'household_members'.

CREATE POLICY "Admins can update household"
  ON households FOR UPDATE
  USING (
    id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Household Members: Visible to members of same household
-- This was the recursive one: ON household_members ... SELECT ... FROM household_members
-- Now we use the function which bypasses RLS.
CREATE POLICY "Members can view other members"
  ON household_members FOR SELECT
  USING (
    household_id IN (SELECT household_id FROM get_my_household_ids())
  );

-- Household Members: Admins can manage
-- Again, recursive if we query household_members directly.
-- We can use a similar function for admin check, or just join with the function result.
-- But we need to know if *I* am an admin of that household.
-- get_my_household_ids() just returns IDs.

CREATE OR REPLACE FUNCTION is_household_admin(hid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM household_members 
    WHERE household_id = hid 
      AND user_id = auth.uid() 
      AND role = 'admin'
  );
$$;

CREATE POLICY "Admins can manage members"
  ON household_members FOR ALL
  USING (
    is_household_admin(household_id)
  );

-- Also ensure users can see themselves (redundant with "Members can view other members" usually, but good for safety)
-- The previous "Users can view own membership" is fine and non-recursive.
-- We don't need to drop/recreate it if it was: USING (user_id = auth.uid())

-- Fix for "Admins can view invites" on household_invites table
-- This queries household_members, which is fine (different table).
-- But let's use the helper for consistency and performance.
DROP POLICY IF EXISTS "Admins can view invites" ON household_invites;
CREATE POLICY "Admins can view invites"
  ON household_invites FOR SELECT
  USING (
    is_household_admin(household_id)
  );

DROP POLICY IF EXISTS "Admins can create invites" ON household_invites;
CREATE POLICY "Admins can create invites"
  ON household_invites FOR INSERT
  WITH CHECK (
    is_household_admin(household_id)
  );
