# Story 14.1: Household Creation & Member Invitations

**Epic:** [Epic 14 - Collaborative Finances (Multi-User/Household)](../epics/epic-14-collaborative-finances.md)
**Priority:** Low (Future)
**Points:** 8
**Status:** Completed

---

## User Story

**As a** User,
**I want** to create a household and invite my partner/family,
**So that** we can manage finances together.

---

## Acceptance Criteria

### AC #1: Household Creation
- **Given** user wants to share finances
- **When** creating a household
- **Then** provide:
  - Household name (e.g., "The Smiths")
  - Creator becomes admin

### AC #2: Invitation Flow
- **Given** household exists
- **When** admin invites member
- **Then** send invite via:
  - Email with unique invite link
  - In-app notification if recipient is user

### AC #3: Invite Acceptance
- **Given** invite is received
- **When** recipient accepts
- **Then**:
  - Add to household
  - Show onboarding: "Welcome to [Household]! Choose what to share."

### AC #4: Permission Roles
- **Given** household has members
- **When** managing roles
- **Then** support:
  - Admin: can invite, remove, manage settings
  - Member: can view shared, contribute to shared goals

### AC #5: Leave/Remove Household
- **Given** user wants to leave
- **When** leaving
- **Then**:
  - Remove access to shared data
  - Keep personal data intact
  - Last admin cannot leave (must transfer or delete)

### AC #6: Household Limit
- **Given** free tier
- **When** household membership
- **Then** limit to 2 members (couple) for free, 5 for premium

---

## Technical Notes

- Create `households` and `household_members` tables
- Use secure invite tokens with expiry
- RLS policies for household data isolation

### Database Schema
```sql
CREATE TABLE households (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE household_members (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

CREATE TABLE household_invites (
  id UUID PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for household isolation
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can view"
  ON households FOR SELECT
  USING (id IN (
    SELECT household_id FROM household_members 
    WHERE user_id = auth.uid()
  ));
```

### Invite Token Generation
```typescript
async function createInvite(
  householdId: string,
  email: string,
  invitedBy: string
): Promise<HouseholdInvite> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const invite = await db.insert(householdInvites).values({
    householdId,
    email,
    token,
    invitedBy,
    expiresAt,
  }).returning();
  
  await sendInviteEmail(email, invite);
  
  return invite;
}
```

### Accept Invite
```typescript
async function acceptInvite(token: string, userId: string): Promise<void> {
  const invite = await db.query.householdInvites.findFirst({
    where: and(
      eq(householdInvites.token, token),
      isNull(householdInvites.acceptedAt),
      gt(householdInvites.expiresAt, new Date())
    ),
  });
  
  if (!invite) throw new Error('Invalid or expired invite');
  
  await db.transaction(async (tx) => {
    await tx.insert(householdMembers).values({
      householdId: invite.householdId,
      userId,
      role: 'member',
    });
    
    await tx.update(householdInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(householdInvites.id, invite.id));
  });
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `db/migrations/00XX_households.sql` | Create |
| `src/lib/household/create.ts` | Create |
| `src/lib/household/invite.ts` | Create |
| `src/components/household/CreateHouseholdModal.tsx` | Create |
| `src/components/household/InviteMemberForm.tsx` | Create |
| `src/app/household/join/[token]/page.tsx` | Create |
| `src/app/settings/household/page.tsx` | Create |

---

## Prerequisites

- Story 1.2: Auth System (for user management)
- Email sending capability (Supabase or third-party)

---

## Definition of Done

- [x] Household creation works
- [x] Invite via email with secure token
- [x] Accept invite flow works
- [x] Admin/Member roles enforced
- [x] Leave household works
- [x] Last admin protection
- [x] Invite expiry handled
- [x] RLS policies secure data
