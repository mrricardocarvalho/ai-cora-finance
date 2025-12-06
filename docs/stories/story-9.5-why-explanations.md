# Story 9.5: Contextual "Why" Explanations

**Epic:** [Epic 9 - Financial Literacy Engine](../epics/epic-9-financial-literacy.md)
**Priority:** High
**Points:** 5

---

## User Story

**As a** User,
**I want** every recommendation from Cora to include a brief explanation of WHY,
**So that** I understand the reasoning and can make informed decisions.

---

## Acceptance Criteria

### AC #1: Insight "Why" Sections
- **Given** an insight is displayed (any type)
- **When** user taps/expands for details
- **Then** show a "Why this matters" section explaining the reasoning

### AC #2: Recommendation Reasoning
- **Given** Cora suggests "Pay off your credit card before investing"
- **When** showing the recommendation
- **Then** include: "Credit card interest (19.9% APR) exceeds typical investment returns (7-10%), so paying it off is mathematically the best return on your money."

### AC #3: Dashboard Metric Explanations
- **Given** the Health Score or Safe-to-Spend widget
- **When** user taps "?" icon or long-presses
- **Then** show explanation of how it's calculated and why it matters

### AC #4: Investment Insight Context
- **Given** a tax-loss harvesting opportunity insight
- **When** displayed
- **Then** include: "Selling this at a loss can offset €X in gains, reducing your tax bill by €Y. This is called tax-loss harvesting."

### AC #5: Template System
- **Given** developers need to add explanations
- **When** creating new insights/features
- **Then** provide a template/pattern for including "why" content:
  ```typescript
  {
    title: "...",
    message: "...",
    why: "...", // New field
    learnMore: "concept-slug" // Link to full explanation
  }
  ```

---

## Technical Notes

- Extend insight schema with `why` and `learn_more_concept` fields
- Update InsightCard component to show "Why" expandable section
- Create reusable `<WhyExplanation />` component

### Extended Insight Type
```typescript
interface InsightWithWhy extends InsightRow {
  why?: string;
  learnMoreConcept?: string; // slug to concept
}
```

### Example Insight with Why
```typescript
{
  type: 'opportunity',
  title: 'Tax-Loss Harvesting Opportunity',
  message: 'Selling ABNB at a loss could save you €180 in taxes',
  why: 'You have €2,340 in realized gains this year. Selling ABNB at its current €650 loss would offset those gains, reducing your tax bill by approximately €180 (28% of €650). This strategy is called tax-loss harvesting.',
  learnMoreConcept: 'tax-loss-harvesting',
}
```

### WhyExplanation Component
```tsx
<WhyExplanation 
  text={insight.why}
  learnMoreSlug={insight.learnMoreConcept}
  expandable={true}
/>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/types.ts` | Modify (extend InsightRow) |
| `src/components/InsightCard.tsx` | Modify (add Why section) |
| `src/components/education/WhyExplanation.tsx` | Create |
| All insight generation files | Modify (add `why` field) |

---

## Prerequisites

- Story 9.1: Financial Concepts Knowledge Base (for Learn More links)
- Story 3.4: Insight Engine (provides insight framework)

---

## Definition of Done

- [ ] Insight type extended with `why` and `learnMoreConcept`
- [ ] InsightCard shows expandable "Why" section
- [ ] WhyExplanation component is reusable
- [ ] Dashboard metrics have "?" explanations
- [ ] At least 10 insights have `why` content
- [ ] Learn More links to concept pages
- [ ] Bilingual "why" content
