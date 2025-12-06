# Epic 14: Collaborative Finances (Household Mode)

**Goal:** Enable couples and families to manage shared finances together while maintaining individual privacy where desired.

**Prerequisites:** All core features stable, user authentication robust.

**Business Value:** Addresses a major pain point for households — couples fight about money, and shared visibility reduces conflict. Also expands market from individuals to households.

---

## Stories

### Story 14.1: Household Creation & Invitations

**As a** User,
**I want** to create a household and invite my partner,
**So that** we can manage our finances together.

**Acceptance Criteria:**

**AC #1: Household Creation**
- **Given** user is logged in
- **When** navigating to Settings → Household
- **Then** show option: "Create Household" or "Join Household"

**AC #2: Invitation Flow**
- **Given** user creates a household
- **When** inviting a partner
- **Then**:
  - Generate unique invite link/code
  - Option to send via email
  - Link expires after 7 days
  - Maximum 2 members initially (couple mode)

**AC #3: Join Household**
- **Given** user receives invite link
- **When** clicking and logging in
- **Then**:
  - Show household creator's name
  - Confirm joining
  - Account linked to household

**AC #4: Household Naming**
- **Given** household is created
- **When** setting up
- **Then** allow naming: "The [Family Name] Household" or custom name

**AC #5: Member Roles**
- **Given** household has members
- **When** managing
- **Then** define roles:
  - Admin: Can invite/remove members, manage household settings
  - Member: Can view shared data, contribute accounts

**AC #6: Leave/Dissolve Household**
- **Given** user wants to leave
- **When** leaving
- **Then**:
  - Personal data unlinks from household
  - If admin leaves, transfer admin to other member
  - If last member, household dissolved

**Technical Notes:**
- Create `households` table (id, name, created_by, created_at)
- Create `household_members` table (household_id, user_id, role, joined_at)
- Add `household_id` to profiles (nullable)

**Files to Create/Modify:**
- `db/migrations/00XX_create_households.sql` (new)
- `src/lib/actions/household.ts` (new)
- `src/app/settings/household/page.tsx` (new)
- `src/components/settings/HouseholdManagement.tsx` (new)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 14.2: Shared vs Personal Account Designation

**As a** User,
**I want** to mark which accounts are shared vs personal,
**So that** my partner and I have appropriate visibility.

**Acceptance Criteria:**

**AC #1: Account Visibility Setting**
- **Given** user is in a household
- **When** viewing/editing an account
- **Then** show visibility toggle:
  - 🏠 Shared (visible to household)
  - 👤 Personal (visible only to me)

**AC #2: Default Setting**
- **Given** new account is created
- **When** in household mode
- **Then** prompt for visibility selection (no silent default)

**AC #3: Shared Account Aggregation**
- **Given** accounts marked as shared
- **When** viewing household dashboard
- **Then** aggregate all shared accounts from all members

**AC #4: Personal Privacy**
- **Given** account is marked personal
- **When** partner views any screen
- **Then** personal account data is completely hidden

**AC #5: Transaction Visibility**
- **Given** an account's visibility
- **When** viewing transactions
- **Then** transaction visibility matches account visibility

**AC #6: Visual Indicators**
- **Given** mixed visibility accounts
- **When** viewing account list
- **Then** show clear icons: 🏠 for shared, 👤 for personal

**Technical Notes:**
- Add `visibility` column to accounts table: 'shared' | 'personal'
- Modify RLS policies to respect visibility
- Create household-aware queries

**Files to Create/Modify:**
- `db/migrations/00XX_add_account_visibility.sql` (new)
- `src/lib/actions/accounts.ts` (modify for visibility)
- `src/components/accounts/AccountForm.tsx` (add visibility toggle)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 14.3: Household Dashboard

**As a** Household,
**I want** a shared view of our combined finances,
**So that** we can make decisions together.

**Acceptance Criteria:**

**AC #1: Household Dashboard View**
- **Given** user is in a household
- **When** viewing dashboard
- **Then** show toggle: "My View" / "Household View"

**AC #2: Combined Metrics**
- **Given** household view is active
- **When** displaying metrics
- **Then** show combined:
  - Total household balance (shared accounts only)
  - Household Safe-to-Spend
  - Combined net worth
  - Household spending by category

**AC #3: Member Contribution View**
- **Given** household dashboard
- **When** viewing spending
- **Then** optionally show breakdown by member: "You: €800 | Partner: €650"

**AC #4: Shared Goals Progress**
- **Given** household has shared goals
- **When** viewing
- **Then** show combined progress: "Vacation Fund: €2,000 / €5,000 (You: €1,200, Partner: €800)"

**AC #5: Household Health Score**
- **Given** combined data
- **When** calculating health score
- **Then** show household-level score based on shared accounts

**AC #6: Recent Shared Activity**
- **Given** shared accounts
- **When** viewing household feed
- **Then** show recent transactions from all shared accounts with member attribution

**Technical Notes:**
- Create household-specific queries
- Build toggle between personal and household view
- Careful with performance - aggregate queries across members

**Files to Create/Modify:**
- `src/lib/actions/household-dashboard.ts` (new)
- `src/components/dashboard/HouseholdDashboard.tsx` (new)
- `src/components/dashboard/ViewToggle.tsx` (new)
- `src/app/(dashboard)/page.tsx` (integrate household view)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 14.4: Shared Goals & Budgets

**As a** Couple,
**I want** to create shared savings goals,
**So that** we can work together toward common objectives.

**Acceptance Criteria:**

**AC #1: Shared Goal Creation**
- **Given** user is in household
- **When** creating a goal
- **Then** option to make it: Personal or Shared (Household)

**AC #2: Joint Contribution Tracking**
- **Given** shared goal exists
- **When** tracking progress
- **Then** track contributions by member

**AC #3: Contribution Visualization**
- **Given** shared goal with contributions
- **When** viewing
- **Then** show: stacked bar or pie showing each member's contribution

**AC #4: Shared Budget Categories**
- **Given** household wants joint budgets
- **When** setting up
- **Then** allow shared category budgets: "Groceries: €600/month (household)"

**AC #5: Budget vs Actual by Member**
- **Given** shared budget
- **When** viewing
- **Then** show who spent what: "Groceries: €450 / €600 (You: €200, Partner: €250)"

**AC #6: Fair Share Indicators**
- **Given** shared expenses
- **When** viewing over time
- **Then** optionally show balance: "You've covered 55% of shared expenses this month"

**Technical Notes:**
- Add `household_id` to goals table for shared goals
- Create contribution tracking
- Build household budget aggregation

**Files to Create/Modify:**
- `db/migrations/00XX_add_household_to_goals.sql` (new)
- `src/lib/actions/goals.ts` (modify for household support)
- `src/components/planning/SharedGoalCard.tsx` (new)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 14.5: Household Notifications & Communication

**As a** Household Member,
**I want** relevant notifications about shared finances,
**So that** we stay coordinated.

**Acceptance Criteria:**

**AC #1: Shared Insight Notifications**
- **Given** insight affects shared finances
- **When** generated
- **Then** notify both household members

**AC #2: Large Transaction Alerts**
- **Given** large transaction on shared account
- **When** detected
- **Then** notify both members: "€500 spent at [Merchant] on shared account"

**AC #3: Budget Threshold Alerts**
- **Given** shared budget approaching limit
- **When** 80% spent
- **Then** notify household: "Household dining budget is 80% spent (€240 remaining)"

**AC #4: Goal Milestone Notifications**
- **Given** shared goal reaches milestone
- **When** achieved
- **Then** celebrate with both members: "🎉 You've hit 50% of your vacation goal together!"

**AC #5: Discussion Prompts**
- **Given** significant financial event
- **When** relevant
- **Then** prompt discussion: "Your household spending increased 20% this month. Time for a budget chat?"

**AC #6: Notification Preferences per Member**
- **Given** household notifications
- **When** configuring
- **Then** each member controls their own notification preferences

**Technical Notes:**
- Extend notification system for multi-recipient
- Add household-specific notification types
- Respect individual preferences

**Files to Create/Modify:**
- `src/lib/actions/notifications.ts` (extend for household)
- `src/lib/intelligence/insights.ts` (household insight triggers)
- `src/components/settings/HouseholdNotificationSettings.tsx` (new)

**Estimated Effort:** 5 points (1-2 days)

---

## Epic Summary

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| 14.1 | Household Creation & Invitations | 5 | High |
| 14.2 | Shared vs Personal Account Designation | 5 | High |
| 14.3 | Household Dashboard | 8 | High |
| 14.4 | Shared Goals & Budgets | 5 | Medium |
| 14.5 | Household Notifications & Communication | 5 | Medium |

**Total Points:** 28
**Estimated Timeline:** 2 weeks

---

## Success Metrics

- [ ] 30% of users create households within 6 months of feature launch
- [ ] Household users have 40% higher engagement than solo users
- [ ] Reduced reported financial conflicts (survey)
- [ ] Household goals have higher completion rate than personal goals

---

## Privacy & Security Considerations

### Data Isolation Requirements
1. **Personal accounts are NEVER visible to other household members**
   - RLS policies must enforce strict isolation
   - UI must not leak personal data

2. **Consent is explicit**
   - Joining household requires clear acknowledgment
   - Account sharing is opt-in per account

3. **Leaving is clean**
   - When leaving, all data associations with household are removed
   - Personal data stays with user

4. **Audit trail**
   - Log all household membership changes
   - Track who shared what when

### RLS Policy Updates
```sql
-- Example: Accounts visible to household members if shared
CREATE POLICY "Household members can view shared accounts" ON accounts
  FOR SELECT USING (
    visibility = 'shared' 
    AND user_id IN (
      SELECT user_id FROM household_members 
      WHERE household_id = (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
```

---

## Future Enhancements (v2)

- **Children's accounts**: Track kids' allowances, teach financial literacy
- **Family mode (3+ members)**: Extended households beyond couples
- **Chore/allowance system**: Track and reward financial behaviors
- **Expense splitting**: "Split the grocery bill" functionality
- **Financial discussions**: In-app comments on transactions
