# Story 9.2: Contextual Micro-Lesson Triggers

**Epic:** [Epic 9 - Financial Literacy Engine](../epics/epic-9-financial-literacy.md)
**Priority:** High
**Points:** 8

---

## User Story

**As a** User,
**I want** Cora to offer brief explanations when I encounter new financial concepts,
**So that** I learn naturally while using the app.

---

## Acceptance Criteria

### AC #1: Trigger Points Definition
- **Given** the user interacts with the app
- **When** they encounter these situations
- **Then** offer a micro-lesson:
  - First time viewing FIRE projection → Explain FIRE concept
  - First time seeing tax-loss harvesting insight → Explain tax-loss harvesting
  - First time adding an ETF → Explain ETF vs individual stocks
  - First debt added → Explain interest and APR
  - Comfort floor first set → Explain emergency fund concepts
  - First anomaly detected → Explain budgeting importance

### AC #2: Non-Intrusive Delivery
- **Given** a learning opportunity is detected
- **When** presenting to user
- **Then** show as:
  - A small "💡 Learn" chip/button near the relevant element
  - OR an expandable section at the bottom of a card
  - NOT a blocking modal or popup

### AC #3: Micro-Lesson Format
- **Given** user taps "Learn" or expands the lesson
- **When** the content displays
- **Then** show:
  - 2-3 sentence explanation (30-second read)
  - One concrete example with numbers
  - "Learn More" link to full concept page
  - "Got it" dismissal button

### AC #4: Learning State Tracking
- **Given** a user dismisses or completes a micro-lesson
- **When** they encounter the same trigger again
- **Then** don't show the same lesson (mark as "learned" in profile)

### AC #5: Learning Progress Storage
- **Given** the need to track what users have learned
- **When** designing storage
- **Then** add `learned_concepts: string[]` to profiles table

---

## Technical Notes

- Create trigger detection logic that checks user's learning history
- Use React Context or Zustand for client-side learning state
- Create reusable `<MicroLesson conceptId="..." trigger="..." />` component

### Trigger Configuration
```typescript
const educationTriggers = [
  { trigger: 'first_fire_view', conceptSlug: 'fire' },
  { trigger: 'first_tax_loss_harvest', conceptSlug: 'tax-loss-harvesting' },
  { trigger: 'first_etf_added', conceptSlug: 'etf-basics' },
  { trigger: 'first_debt_added', conceptSlug: 'interest-rate-apr' },
  { trigger: 'comfort_floor_set', conceptSlug: 'emergency-fund' },
  { trigger: 'first_anomaly', conceptSlug: 'budgeting-basics' },
];
```

### Component Usage
```tsx
<MicroLesson 
  conceptSlug="compound-interest"
  trigger="first_investment"
  position="below"
/>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/education/triggers.ts` | Create |
| `src/components/education/MicroLesson.tsx` | Create |
| `src/components/education/LearnChip.tsx` | Create |
| `src/lib/actions/profiles.ts` | Modify (add learning tracking) |
| `db/migrations/00XX_add_learned_concepts.sql` | Create |

---

## Prerequisites

- Story 9.1: Financial Concepts Knowledge Base (provides content)

---

## Definition of Done

- [ ] Trigger detection logic implemented
- [ ] MicroLesson component renders non-intrusively
- [ ] Content shows short explanation + example
- [ ] "Learn More" links to full concept
- [ ] Learning state persisted in profile
- [ ] Same lesson not shown twice
- [ ] 6+ triggers configured
