# Story 13.2: Opportunity Detection Engine

**As a** User,
**I want** Cora to spot opportunities I might miss,
**So that** I can optimize my finances without constant monitoring.

## Acceptance Criteria

### AC #1: Surplus Detection
- **Given** user has unexpected surplus (income > usual expenses)
- **When** detected at month end
- **Then** suggest: "You have €400 extra this month. Options: Pay down [Debt] (save €X interest), Invest (grow long-term), or Build emergency fund."

### AC #2: Price Drop Opportunities
- **Given** tracked investments have significant drops
- **When** price drops 10%+ from recent high
- **Then** alert (for DCA investors): "VWCE is down 12% from its high. Good time to add to your position? [Learn about dollar-cost averaging]"

### AC #3: Goal Acceleration
- **Given** user is ahead of pace on savings goal
- **When** surplus continues
- **Then** suggest: "You're 3 months ahead on your vacation goal! Increase target? Or redirect to [other goal]?"

### AC #4: Debt Payoff Opportunity
- **Given** user has high-interest debt AND investable cash
- **When** math favors debt payoff
- **Then** recommend: "Paying €500 toward your credit card yields guaranteed 19.9% return. Consider prioritizing debt over savings temporarily?"

### AC #5: Refinancing Opportunity
- **Given** user has existing loans
- **When** market rates drop significantly below their rate
- **Then** alert: "Interest rates have dropped. Refinancing your mortgage could save €X/month."

### AC #6: Tax Timing Opportunities
- **Given** approaching year-end
- **When** user has unrealized gains/losses
- **Then** suggest: "Realizing €X in losses before Dec 31 could offset gains and save €Y in taxes."

## Technical Notes
- Create `src/lib/intelligence/opportunity-engine.ts`
- Create opportunity scoring based on financial impact
- Prioritize opportunities by potential savings/benefit
- Include "Dismiss" and "Learn More" actions
- Integrate with `src/lib/intelligence/insights.ts`

## Tasks
- [x] Create `src/lib/intelligence/opportunity-engine.ts` with core logic
- [x] Implement Surplus Detection logic
- [x] Implement Price Drop logic (mock market data if needed)
- [x] Implement Goal Acceleration logic
- [x] Implement Debt Payoff logic
- [x] Implement Refinancing logic (mock rates)
- [x] Implement Tax Timing logic
- [x] Integrate with `generateInsights`
- [x] Add unit tests
