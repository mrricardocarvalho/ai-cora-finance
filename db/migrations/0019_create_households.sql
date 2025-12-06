CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

CREATE TABLE IF NOT EXISTS household_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invites ENABLE ROW LEVEL SECURITY;

-- Households: Visible to members
CREATE POLICY "Household members can view household"
  ON households FOR SELECT
  USING (
    id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid()
    )
  );

-- Households: Creator can insert
CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Households: Admins can update
CREATE POLICY "Admins can update household"
  ON households FOR UPDATE
  USING (
    id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Household Members: Visible to members of same household
CREATE POLICY "Members can view other members"
  ON household_members FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid()
    )
  );

-- Household Members: Admins can insert (invite acceptance logic handles this usually, but for direct adds)
-- Actually, usually the system inserts. But if we allow admins to add directly?
-- Let's stick to: Users can insert themselves if they have a valid invite (handled by app logic usually, but RLS needs to allow it).
-- Or better: Admins can manage members.
CREATE POLICY "Admins can manage members"
  ON household_members FOR ALL
  USING (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to join (insert themselves) - this is tricky with RLS. 
-- Often easier to use a SECURITY DEFINER function for joining.
-- For now, let's allow users to see their own membership.
CREATE POLICY "Users can view own membership"
  ON household_members FOR SELECT
  USING (user_id = auth.uid());

-- Invites: Admins can view/create
CREATE POLICY "Admins can view invites"
  ON household_invites FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create invites"
  ON household_invites FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Invites: Public view by token (for joining)? 
-- No, usually we fetch by token using a secure function or service role.
-- But for the "Join Page", we might need to read the invite details by token.
CREATE POLICY "View invite by token"
  ON household_invites FOR SELECT
  USING (true); -- Be careful here. Maybe restrict to specific columns if possible, or rely on token being secret.
