# Story 14.2: Shared vs Personal Account Designation

**Epic:** [Epic 14 - Collaborative Finances (Multi-User/Household)](../epics/epic-14-collaborative-finances.md)
**Priority:** Low (Future)
**Points:** 5

---

## User Story

**As a** Household member,
**I want** to mark some accounts as shared and others as personal,
**So that** we see joint finances together while keeping individual privacy.

---

## Acceptance Criteria

### AC #1: Account Visibility Setting
- **Given** user has accounts
- **When** in household
- **Then** each account can be:
  - "Personal" (only I see)
  - "Shared with Household" (all members see)

### AC #2: Default to Personal
- **Given** new account added
- **When** user is in household
- **Then** default to personal (privacy first)

### AC #3: Shared Account Aggregation
- **Given** multiple members share accounts
- **When** viewing household dashboard
- **Then** aggregate shared balances and transactions

### AC #4: Clear Visual Distinction
- **Given** accounts are displayed
- **When** viewing
- **Then** clearly indicate:
  - 🔒 Personal accounts
  - 👥 Shared accounts

### AC #5: Transaction Attribution
- **Given** shared account transactions
- **When** viewing
- **Then** show which member added/categorized if known

### AC #6: Privacy Preservation
- **Given** RLS policies
- **When** querying
- **Then** personal accounts NEVER visible to other household members

---

## Technical Notes

- Add `visibility` column to `accounts` table
- Modify RLS policies to respect visibility
- Create household-aware queries

### Schema Updates
```sql
-- Add visibility column
ALTER TABLE accounts 
ADD COLUMN visibility TEXT DEFAULT 'personal' 
CHECK (visibility IN ('personal', 'household'));

-- Add household_id for shared context
ALTER TABLE accounts 
ADD COLUMN household_id UUID REFERENCES households(id);

-- Update RLS policy
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;

CREATE POLICY "Users can view accounts"
  ON accounts FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      visibility = 'household' 
      AND household_id IN (
        SELECT household_id FROM household_members 
        WHERE user_id = auth.uid()
      )
    )
  );
```

### Visibility Toggle Component
```typescript
interface AccountVisibilityProps {
  accountId: string;
  currentVisibility: 'personal' | 'household';
  householdId?: string;
}

function AccountVisibilityToggle({ 
  accountId, 
  currentVisibility, 
  householdId 
}: AccountVisibilityProps) {
  const [visibility, setVisibility] = useState(currentVisibility);
  
  const handleToggle = async () => {
    const newVisibility = visibility === 'personal' ? 'household' : 'personal';
    
    await updateAccountVisibility(accountId, newVisibility, householdId);
    setVisibility(newVisibility);
  };
  
  if (!householdId) return null; // No household, no toggle
  
  return (
    <div className="flex items-center gap-2">
      <Switch checked={visibility === 'household'} onChange={handleToggle} />
      <span>
        {visibility === 'personal' ? '🔒 Personal' : '👥 Shared'}
      </span>
    </div>
  );
}
```

### Household Aggregation Query
```typescript
async function getHouseholdAccounts(
  userId: string, 
  householdId: string
): Promise<AccountSummary> {
  const accounts = await db.query.accounts.findMany({
    where: or(
      and(eq(accounts.userId, userId)), // All my accounts
      and(
        eq(accounts.visibility, 'household'),
        eq(accounts.householdId, householdId)
      ) // Shared accounts
    ),
  });
  
  return {
    personal: accounts.filter(a => a.userId === userId && a.visibility === 'personal'),
    shared: accounts.filter(a => a.visibility === 'household'),
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
    sharedBalance: accounts
      .filter(a => a.visibility === 'household')
      .reduce((sum, a) => sum + a.balance, 0),
  };
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `db/migrations/00XX_account_visibility.sql` | Create |
| `src/components/accounts/AccountVisibilityToggle.tsx` | Create |
| `src/lib/household/accounts.ts` | Create |
| `src/components/accounts/AccountCard.tsx` | Modify (add visibility badge) |

---

## Prerequisites

- Story 14.1: Household Creation (for household context)
- Story 2.1: Banking Schema (for accounts table)

---

## Definition of Done

- [ ] Visibility setting on accounts
- [ ] Default to personal
- [ ] Shared accounts visible to all household members
- [ ] Visual badges (🔒/👥)
- [ ] RLS enforces visibility
- [ ] Personal accounts never leak
- [ ] Transaction attribution visible
