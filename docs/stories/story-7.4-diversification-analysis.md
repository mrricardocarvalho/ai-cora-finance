# Story 7.4: Diversification Analysis & Recommendations

**Epic:** [Epic 7 - Advanced Intelligence & Forecasting](../epics/epic-7-advanced-intelligence.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** Cora to analyze my investment portfolio concentration and suggest improvements,
**So that** I don't unknowingly take on excessive risk.

---

## Acceptance Criteria

### AC #1: Concentration Detection
- **Given** a user's portfolio with holdings
- **When** any single asset exceeds 25% of total portfolio value
- **Then** flag as "concentrated" risk

### AC #2: Sector/Type Analysis
- **Given** portfolio holdings with asset types (ETF, Stock, Crypto, Bond)
- **When** analyzing diversification
- **Then** calculate allocation percentages by type and identify imbalances

### AC #3: Geographic Diversification (Stretch)
- **Given** assets have region metadata (US, EU, Emerging Markets)
- **When** analyzing diversification
- **Then** show geographic allocation (requires asset metadata enhancement)

### AC #4: Insight Generation
- **Given** portfolio is 60% in a single ETF (e.g., VWCE)
- **When** insight engine runs
- **Then** generate `opportunity` insight: "Your portfolio is 60% concentrated in VWCE. Consider diversifying to reduce single-asset risk."

### AC #5: Risk Score
- **Given** portfolio analysis is complete
- **When** displayed on Portfolio page
- **Then** show a simple risk indicator:
  - 🟢 Well Diversified (no asset > 25%, multiple types)
  - 🟡 Moderate Concentration (one asset 25-40%)
  - 🔴 High Concentration (one asset > 40% or single type > 80%)

### AC #6: Educational Context
- **Given** a diversification insight is shown
- **When** user taps "Learn More"
- **Then** show explanation of why diversification matters (micro-lesson hook)

---

## Technical Notes

- Create `analyzeDiversification(userId)` in `src/lib/intelligence/portfolio-analysis.ts`
- Extend `assets` table with `asset_type` enum if not present (ETF, Stock, Bond, Crypto, Cash)
- Integrate with Insight Engine for proactive recommendations

### Risk Calculation Logic
```typescript
function calculateRiskLevel(holdings: Holding[]): 'low' | 'moderate' | 'high' {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const maxConcentration = Math.max(...holdings.map(h => h.value / totalValue));
  
  if (maxConcentration > 0.4) return 'high';
  if (maxConcentration > 0.25) return 'moderate';
  return 'low';
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/intelligence/portfolio-analysis.ts` | Create |
| `src/components/portfolio/DiversificationCard.tsx` | Create |
| `src/app/(dashboard)/portfolio/page.tsx` | Modify (integrate card) |
| `src/lib/intelligence/insights.ts` | Modify (add diversification trigger) |

---

## Prerequisites

- Story 4.1: Investment Schema (provides holdings data)
- Story 4.3: Portfolio UI (provides portfolio page)

---

## Definition of Done

- [ ] Concentration detection identifies assets > 25%
- [ ] Type allocation is calculated and displayed
- [ ] Risk score (🟢/🟡/🔴) is visible on portfolio page
- [ ] Insights generated for concentration issues
- [ ] Learn More links to diversification concept
- [ ] Unit tests for risk calculation
