# Story 13.4: Smart Recommendations Engine

status: review

**As a** User,
**I want** Cora to give me personalized recommendations based on my situation,
**So that** I always know what financial action to take next.

## Acceptance Criteria

### AC #1: Priority Action Queue
- **Given** user has multiple financial improvement opportunities
- **When** generating recommendations
- **Then** rank by impact and urgency:
  1. Urgent (action needed this week)
  2. Important (significant impact)
  3. Optimization (nice to have)

### AC #2: Situational Recommendations
- **Given** user's current financial state
- **When** generating recommendations
- **Then** match to situation:
  - No emergency fund → "Build 1 month emergency fund first"
  - High-interest debt → "Focus on debt payoff"
  - No investments → "Start investing €50/month"
  - All basics covered → "Optimize: tax-loss harvest / rebalance"

### AC #3: One Thing Focus
- **Given** many possible recommendations
- **When** displaying to user
- **Then** highlight ONE primary action: "Your #1 priority this month: [Action]"

### AC #4: Progress Tracking
- **Given** a recommendation is acted upon
- **When** user completes it
- **Then** celebrate and reveal next priority

### AC #5: Ignore/Snooze Options
- **Given** user doesn't want a recommendation
- **When** they dismiss it
- **Then** offer:
  - "Not for me" (permanently dismiss)
  - "Remind me in 1 month" (snooze)
  - "Already done" (mark complete)

### AC #6: Recommendation Reasoning
- **Given** a recommendation is shown
- **When** user wants to understand why
- **Then** include explanation: "I'm recommending this because [reason]" with link to learn more.

## Technical Notes
- Create decision tree for recommendation prioritization
- Use user profile (goals, risk tolerance) for personalization
- Track recommendation status in DB

## Tasks
- [x] Create migration for `recommendations` table
- [x] Create `src/lib/intelligence/recommendations.ts` (Logic)
- [x] Implement prioritization logic (Emergency Fund > Debt > Invest)
- [x] Create `src/components/insights/RecommendationCard.tsx`
- [x] Add unit tests
