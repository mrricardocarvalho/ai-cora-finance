# Story 11.4: Big Purchase Decision Helper

**Status:** Approved
**Epic:** [Epic 11 - Comprehensive "What-If" Simulator](../epics/epic-11-what-if-simulator.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** help deciding whether I can afford a big purchase,
**So that** I don't make decisions that derail my financial goals.

---

## Acceptance Criteria

### AC #1: Purchase Input
- **Given** user is considering a purchase
- **When** entering details
- **Then** collect:
  - Purchase amount (€)
  - Financing option: Cash / Loan / Both
  - If loan: Interest rate, term
  - Urgency: Need now / Can wait / Nice to have

### AC #2: Affordability Analysis
- **Given** purchase details
- **When** analyzing
- **Then** show:
  - Impact on emergency fund (would it drop below 3 months?)
  - Impact on savings goals (delays by X months)
  - Monthly cash flow impact (if financed)
  - Safe-to-Spend before/after

### AC #3: Recommendation
- **Given** analysis is complete
- **When** displaying recommendation
- **Then** provide clear guidance:
  - ✅ "You can comfortably afford this"
  - ⚠️ "Possible, but delays your vacation goal by 4 months"
  - ❌ "This would deplete your emergency fund. Consider waiting or financing."

### AC #4: Alternative Scenarios
- **Given** the purchase might not be immediately affordable
- **When** showing options
- **Then** suggest:
  - "Save €200/month for 6 months, then buy cash"
  - "Finance at 5% APR for 24 months = €X/month"
  - "Wait for price drop / sale"

### AC #5: Common Purchases
- **Given** users have similar big decisions
- **When** starting the helper
- **Then** offer quick-start templates:
  - New Car
  - Home Renovation
  - Vacation
  - Electronics (laptop, phone)
  - Custom

---

## Technical Notes

- Integrate with Safe-to-Spend calculation
- Use goal projection logic
- Create simple decision tree for recommendations

### Affordability Assessment
```typescript
interface PurchaseAnalysis {
  canAfford: boolean;
  emergencyFundImpact: 'safe' | 'reduced' | 'depleted';
  goalDelays: Map<string, number>; // goal name -> months delayed
  safeToSpendAfter: number;
  recommendation: 'go' | 'caution' | 'wait';
  alternatives: PurchaseAlternative[];
}

interface PurchaseAlternative {
  type: 'save' | 'finance' | 'wait';
  description: string;
  timeline: string;
  monthlyImpact?: number;
}
```

### Decision Logic
```typescript
function assessPurchase(purchase: Purchase, finances: UserFinances): PurchaseAnalysis {
  // Check emergency fund impact
  const remainingEmergencyFund = finances.emergencyFund - purchase.amount;
  const monthsOfExpenses = remainingEmergencyFund / finances.monthlyExpenses;
  
  if (monthsOfExpenses < 1) return { recommendation: 'wait', ... };
  if (monthsOfExpenses < 3) return { recommendation: 'caution', ... };
  return { recommendation: 'go', ... };
}
```

### Purchase Templates
```typescript
const purchaseTemplates = [
  { name: 'New Car', typicalAmount: 25000, typicalFinancing: true },
  { name: 'Home Renovation', typicalAmount: 15000, typicalFinancing: false },
  { name: 'Vacation', typicalAmount: 3000, typicalFinancing: false },
  { name: 'Laptop', typicalAmount: 1500, typicalFinancing: false },
];
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/planning/purchase-advisor.ts` | Create |
| `src/components/planning/PurchaseDecisionHelper.tsx` | Create |
| `src/app/(dashboard)/planning/scenarios/purchase/page.tsx` | Create |

---

## Prerequisites

- Story 3.2: Safe-to-Spend Logic (for affordability)
- Story 5.5: Emergency Fund (for fund impact)
- Story 5.4: Goal Management (for goal delays)

---

## Definition of Done

- [ ] Purchase input form with financing options
- [ ] Emergency fund impact calculated
- [ ] Goal delay impact calculated
- [ ] Clear recommendation displayed
- [ ] Alternative scenarios suggested
- [ ] Purchase templates available
- [ ] Mobile responsive
