# Epic 13: Predictive Guidance & Financial Autopilot

**Goal:** Transform Cora from reactive to predictive — anticipating user needs and providing guidance before problems occur or opportunities are missed.

**Prerequisites:** Epic 3 (Insights), Epic 7 (Forecasting), Epic 8 (Tax), significant user data history.

**Business Value:** Users experience Cora as a true financial advisor who "just knows" what they need. This is the differentiating feature that makes Cora feel magical compared to other finance apps.

---

## Stories

### Story 13.1: Predictive Pattern Recognition

**As a** System,
**I want** to identify patterns and predict future financial events,
**So that** Cora can proactively alert users before things happen.

**Acceptance Criteria:**

**AC #1: Seasonal Spending Patterns**
- **Given** user has 12+ months of data
- **When** analyzing spending
- **Then** identify seasonal patterns:
  - December spending spike (holidays)
  - September education expenses
  - Summer vacation spending
  - Annual insurance renewals

**AC #2: Proactive Seasonal Alerts**
- **Given** seasonal pattern detected (e.g., December +€500 average)
- **When** November arrives
- **Then** generate `info` insight: "Based on last year, you typically spend €500 more in December. Consider setting aside extra now."

**AC #3: Bill Increase Prediction**
- **Given** utility bills show upward trend
- **When** analyzing recent months
- **Then** predict: "Your electricity bills have increased 15% over 6 months. At this rate, expect €X/month by summer."

**AC #4: Subscription Creep Detection**
- **Given** recurring expenses are tracked
- **When** total subscriptions increase month-over-month
- **Then** alert: "Your monthly subscriptions have grown by €45 over the past year. Review your active services?"

**AC #5: Cash Flow Tightening Prediction**
- **Given** expenses growing faster than income
- **When** trend continues for 3+ months
- **Then** early warning: "Your savings rate has dropped from 22% to 15%. At current pace, you'll be at 0% by [date]."

**AC #6: Confidence Scoring**
- **Given** predictions are generated
- **When** displaying
- **Then** include confidence indicator based on data quality:
  - High: 12+ months data, consistent patterns
  - Medium: 6-12 months data
  - Low: < 6 months data (flag as "early prediction")

**Technical Notes:**
- Create `src/lib/intelligence/pattern-recognition.ts`
- Use statistical methods: moving averages, trend detection, seasonality
- Run analysis daily or weekly (not real-time)

**Files to Create/Modify:**
- `src/lib/intelligence/pattern-recognition.ts` (new)
- `src/lib/intelligence/seasonal-analysis.ts` (new)
- `src/lib/intelligence/insights.ts` (integrate predictive triggers)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 13.2: Opportunity Detection Engine

**As a** User,
**I want** Cora to spot opportunities I might miss,
**So that** I can optimize my finances without constant monitoring.

**Acceptance Criteria:**

**AC #1: Surplus Detection**
- **Given** user has unexpected surplus (income > usual expenses)
- **When** detected at month end
- **Then** suggest: "You have €400 extra this month. Options: Pay down [Debt] (save €X interest), Invest (grow long-term), or Build emergency fund."

**AC #2: Price Drop Opportunities**
- **Given** tracked investments have significant drops
- **When** price drops 10%+ from recent high
- **Then** alert (for DCA investors): "VWCE is down 12% from its high. Good time to add to your position? [Learn about dollar-cost averaging]"

**AC #3: Goal Acceleration**
- **Given** user is ahead of pace on savings goal
- **When** surplus continues
- **Then** suggest: "You're 3 months ahead on your vacation goal! Increase target? Or redirect to [other goal]?"

**AC #4: Debt Payoff Opportunity**
- **Given** user has high-interest debt AND investable cash
- **When** math favors debt payoff
- **Then** recommend: "Paying €500 toward your credit card yields guaranteed 19.9% return. Consider prioritizing debt over savings temporarily?"

**AC #5: Refinancing Opportunity**
- **Given** user has existing loans
- **When** market rates drop significantly below their rate
- **Then** alert: "Interest rates have dropped. Refinancing your mortgage could save €X/month."

**AC #6: Tax Timing Opportunities**
- **Given** approaching year-end
- **When** user has unrealized gains/losses
- **Then** suggest: "Realizing €X in losses before Dec 31 could offset gains and save €Y in taxes."

**Technical Notes:**
- Create opportunity scoring based on financial impact
- Prioritize opportunities by potential savings/benefit
- Include "Dismiss" and "Learn More" actions

**Files to Create/Modify:**
- `src/lib/intelligence/opportunity-engine.ts` (new)
- `src/lib/intelligence/insights.ts` (integrate opportunity triggers)
- Types for opportunity insights

**Estimated Effort:** 8 points (2-3 days)

---

### Story 13.3: Weekly Financial Summary (Auto-Generated)

**As a** User,
**I want** a weekly summary of my financial status,
**So that** I stay informed without actively checking.

**Acceptance Criteria:**

**AC #1: Weekly Summary Generation**
- **Given** it's Sunday evening (configurable)
- **When** weekly summary is generated
- **Then** create a comprehensive report:
  - Week's spending vs last week
  - Progress toward monthly budget
  - Notable transactions (largest, unusual)
  - Upcoming bills in next 7 days
  - Goal progress updates

**AC #2: In-App Summary Card**
- **Given** summary is generated
- **When** user opens app on Monday
- **Then** show summary card at top of feed: "Your Week in Review 📊"

**AC #3: Push Notification**
- **Given** user has enabled weekly summary notifications
- **When** summary is generated
- **Then** send push: "Your weekly financial summary is ready. You spent €X this week (↑12% vs last week)."

**AC #4: Personalized Highlights**
- **Given** the summary
- **When** notable events occurred
- **Then** highlight:
  - "🎉 You saved €200 more than usual this week!"
  - "⚠️ Dining out was 40% over your weekly average"
  - "✅ Rent payment processed successfully"

**AC #5: Actionable Next Steps**
- **Given** the summary includes recommendations
- **When** displayed
- **Then** include 1-2 action items:
  - "Review that €150 subscription renewal"
  - "You're €50 under budget — consider extra debt payment"

**AC #6: Email Option (Stretch)**
- **Given** user prefers email
- **When** summary is generated
- **Then** optionally send email digest

**Technical Notes:**
- Create scheduled job for weekly summary generation
- Store summary in `insights` or dedicated table
- Make day/time configurable in settings

**Files to Create/Modify:**
- `src/lib/intelligence/weekly-summary.ts` (new)
- `src/components/insights/WeeklySummaryCard.tsx` (new)
- `src/app/api/cron/weekly-summary/route.ts` (new - Vercel cron)

**Estimated Effort:** 5 points (1-2 days)

---

### Story 13.4: Smart Recommendations Engine

**As a** User,
**I want** Cora to give me personalized recommendations based on my situation,
**So that** I always know what financial action to take next.

**Acceptance Criteria:**

**AC #1: Priority Action Queue**
- **Given** user has multiple financial improvement opportunities
- **When** generating recommendations
- **Then** rank by impact and urgency:
  1. Urgent (action needed this week)
  2. Important (significant impact)
  3. Optimization (nice to have)

**AC #2: Situational Recommendations**
- **Given** user's current financial state
- **When** generating recommendations
- **Then** match to situation:
  - No emergency fund → "Build 1 month emergency fund first"
  - High-interest debt → "Focus on debt payoff"
  - No investments → "Start investing €50/month"
  - All basics covered → "Optimize: tax-loss harvest / rebalance"

**AC #3: One Thing Focus**
- **Given** many possible recommendations
- **When** displaying to user
- **Then** highlight ONE primary action: "Your #1 priority this month: [Action]"

**AC #4: Progress Tracking**
- **Given** a recommendation is acted upon
- **When** user completes it
- **Then** celebrate and reveal next priority

**AC #5: Ignore/Snooze Options**
- **Given** user doesn't want a recommendation
- **When** they dismiss it
- **Then** offer:
  - "Not for me" (permanently dismiss)
  - "Remind me in 1 month" (snooze)
  - "Already done" (mark complete)

**AC #6: Recommendation Reasoning**
- **Given** a recommendation is shown
- **When** user wants to understand why
- **Then** include explanation: "I'm recommending this because [reason]" with link to learn more.

**Technical Notes:**
- Create decision tree for recommendation prioritization
- Use user profile (goals, risk tolerance) for personalization
- Track recommendation status in DB

**Files to Create/Modify:**
- `src/lib/intelligence/recommendations.ts` (new)
- `src/components/insights/RecommendationCard.tsx` (new)
- `db/migrations/00XX_recommendations_tracking.sql` (new)

**Estimated Effort:** 8 points (2-3 days)

---

### Story 13.5: Financial Autopilot Rules

**As a** User,
**I want** to set up automatic financial rules,
**So that** good financial habits happen without my intervention.

**Acceptance Criteria:**

**AC #1: Rule Definition Interface**
- **Given** user wants to automate decisions
- **When** creating a rule
- **Then** provide templates:
  - "When [TRIGGER], then [ACTION]"

**AC #2: Trigger Types**
- **Given** rule creation
- **When** selecting trigger
- **Then** offer:
  - "Safe-to-Spend exceeds €X"
  - "End of month"
  - "Paycheck received"
  - "Bill paid (specific merchant)"
  - "Spending category exceeds €X"

**AC #3: Action Types**
- **Given** trigger fires
- **When** executing action
- **Then** support:
  - "Alert me" (notification)
  - "Add to savings goal" (track recommendation)
  - "Suggest debt payment" (recommendation)
  - "Show summary" (generate insight)

**AC #4: Example Rules**
- **Given** users need inspiration
- **When** creating rules
- **Then** suggest templates:
  - "When paycheck arrives, remind me to invest €200"
  - "When Safe-to-Spend > €500, suggest extra debt payment"
  - "When dining out > €200/month, warn me"
  - "On the 1st, show my monthly summary"

**AC #5: Rule Management**
- **Given** rules are created
- **When** managing
- **Then** allow:
  - Enable/disable rules
  - Edit conditions
  - View trigger history
  - Delete rules

**AC #6: Future: Auto-Execution (v4)**
- **Given** bank API integration exists (future)
- **When** enabled
- **Then** actually execute transfers (not just recommendations)
- NOTE: This is Future Vision - for now, rules only generate recommendations

**Technical Notes:**
- Create `autopilot_rules` table
- Implement rule engine that runs on relevant events
- Start with notification-only actions (safe)

**Files to Create/Modify:**
- `src/lib/automation/rule-engine.ts` (new)
- `src/lib/automation/triggers.ts` (new)
- `src/lib/automation/actions.ts` (new)
- `src/components/settings/AutopilotRules.tsx` (new)
- `src/app/settings/autopilot/page.tsx` (new)
- `db/migrations/00XX_autopilot_rules.sql` (new)

**Estimated Effort:** 8 points (2-3 days)

---

## Epic Summary

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| 13.1 | Predictive Pattern Recognition | 8 | High |
| 13.2 | Opportunity Detection Engine | 8 | High |
| 13.3 | Weekly Financial Summary | 5 | Medium |
| 13.4 | Smart Recommendations Engine | 8 | Medium |
| 13.5 | Financial Autopilot Rules | 8 | Low (Future) |

**Total Points:** 37
**Estimated Timeline:** 3 weeks

---

## Success Metrics

- [ ] Users receive actionable predictions 2+ weeks before events
- [ ] 50%+ of opportunities acted upon
- [ ] Weekly summary open rate > 70%
- [ ] Users report feeling "ahead" of their finances (qualitative)

---

## The Predictive Intelligence Stack

```
┌─────────────────────────────────────────┐
│         User-Facing Insights            │
│  (Weekly Summary, Recommendations,       │
│   Opportunity Alerts, Predictions)       │
├─────────────────────────────────────────┤
│         Intelligence Layer               │
│  ┌─────────────┐ ┌─────────────────────┐ │
│  │ Pattern     │ │ Opportunity         │ │
│  │ Recognition │ │ Detection           │ │
│  └─────────────┘ └─────────────────────┘ │
│  ┌─────────────┐ ┌─────────────────────┐ │
│  │ Seasonal    │ │ Recommendation      │ │
│  │ Analysis    │ │ Engine              │ │
│  └─────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────┤
│         Data Foundation                  │
│  Transactions, Recurring Patterns,       │
│  Cash Flow, User Profile, Goals          │
└─────────────────────────────────────────┘
```

---

## Cora's Personality Through Predictions

Predictive insights should embody Cora's warm, knowledgeable personality:

**Don't say:** "Alert: December spending historically 45% above average."

**Do say:** "Hey! December is usually your biggest spending month — last year it was €500 more than average. Want me to help you budget for the holidays?"

**Don't say:** "Surplus of €400 detected. Consider allocation."

**Do say:** "Great news — you've got €400 extra this month! Your credit card is costing you 19.9% interest. Want me to show you how much you'd save by putting this toward it?"
