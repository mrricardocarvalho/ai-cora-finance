# Story 14.3: Household Dashboard

**Epic:** [Epic 14 - Collaborative Finances (Multi-User/Household)](../epics/epic-14-collaborative-finances.md)
**Priority:** Low (Future)
**Points:** 5

---

## User Story

**As a** Household member,
**I want** to see a combined view of our shared finances,
**So that** we understand our joint financial position.

---

## Acceptance Criteria

### AC #1: Household Overview
- **Given** user is in a household
- **When** viewing household dashboard
- **Then** display:
  - Combined shared account balances
  - Total shared net worth
  - Shared spending this month

### AC #2: Dual View Toggle
- **Given** household dashboard
- **When** toggling view
- **Then** switch between:
  - "My View" (personal + shared)
  - "Household View" (shared only)

### AC #3: Member Contribution Breakdown
- **Given** shared accounts
- **When** viewing spending
- **Then** show contribution by member:
  - "João: €500 (45%)"
  - "Maria: €600 (55%)"

### AC #4: Shared Transaction Feed
- **Given** household dashboard
- **When** viewing transactions
- **Then** show shared account transactions with member attribution

### AC #5: Privacy-Respecting Metrics
- **Given** calculating household metrics
- **When** one member has personal accounts
- **Then** never include personal data in household totals

### AC #6: Navigation Integration
- **Given** user is in household
- **When** using bottom navigation
- **Then** add "Household" option or toggle in existing views

---

## Technical Notes

- Create household-specific aggregation queries
- Build toggle component for personal/household view
- Respect RLS throughout

### Household Dashboard Data
```typescript
interface HouseholdDashboard {
  household: {
    id: string;
    name: string;
    memberCount: number;
  };
  sharedAccounts: AccountSummary[];
  totalSharedBalance: number;
  monthlySpending: {
    total: number;
    byMember: MemberSpending[];
    byCategory: CategorySpending[];
  };
  recentTransactions: SharedTransaction[];
}

interface MemberSpending {
  memberId: string;
  memberName: string;
  amount: number;
  percentage: number;
}

async function getHouseholdDashboard(
  householdId: string
): Promise<HouseholdDashboard> {
  const [accounts, transactions, members] = await Promise.all([
    getSharedAccounts(householdId),
    getSharedTransactions(householdId, thisMonth()),
    getHouseholdMembers(householdId),
  ]);
  
  const spendingByMember = calculateSpendingByMember(transactions, members);
  
  return {
    household: await getHousehold(householdId),
    sharedAccounts: accounts,
    totalSharedBalance: sumBalances(accounts),
    monthlySpending: {
      total: sumSpending(transactions),
      byMember: spendingByMember,
      byCategory: groupByCategory(transactions),
    },
    recentTransactions: transactions.slice(0, 20),
  };
}
```

### View Toggle Component
```typescript
type ViewMode = 'personal' | 'household';

function ViewModeToggle() {
  const [mode, setMode] = useViewMode();
  const { household } = useHousehold();
  
  if (!household) return null;
  
  return (
    <SegmentedControl
      value={mode}
      onChange={setMode}
      options={[
        { value: 'personal', label: '👤 My View' },
        { value: 'household', label: '👥 Household' },
      ]}
    />
  );
}
```

### Household Dashboard Page
```typescript
// src/app/household/page.tsx
export default async function HouseholdPage() {
  const { userId } = await requireAuth();
  const household = await getUserHousehold(userId);
  
  if (!household) {
    redirect('/settings/household');
  }
  
  const dashboard = await getHouseholdDashboard(household.id);
  
  return (
    <div className="space-y-6">
      <HouseholdHeader household={dashboard.household} />
      
      <BalanceCard 
        title="Shared Balance"
        amount={dashboard.totalSharedBalance}
      />
      
      <SpendingBreakdown 
        total={dashboard.monthlySpending.total}
        byMember={dashboard.monthlySpending.byMember}
      />
      
      <SharedTransactionFeed 
        transactions={dashboard.recentTransactions}
      />
    </div>
  );
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/household/page.tsx` | Create |
| `src/components/household/HouseholdDashboard.tsx` | Create |
| `src/components/household/MemberSpendingChart.tsx` | Create |
| `src/components/household/ViewModeToggle.tsx` | Create |
| `src/lib/household/dashboard.ts` | Create |

---

## Prerequisites

- Story 14.1: Household Creation (for household context)
- Story 14.2: Account Visibility (for shared accounts)

---

## Definition of Done

- [ ] Household overview displays correctly
- [ ] View toggle (My View / Household)
- [ ] Member contribution breakdown visible
- [ ] Shared transaction feed works
- [ ] Personal data never shown in household view
- [ ] Navigation updated for household access
