# Story 9.3: Full Concept Pages

**Epic:** [Epic 9 - Financial Literacy Engine](../epics/epic-9-financial-literacy.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** to read detailed explanations of financial concepts,
**So that** I can deepen my understanding beyond the micro-lessons.

---

## Acceptance Criteria

### AC #1: Concept Detail Page
- **Given** a user navigates to `/learn/[concept-slug]`
- **When** the page loads
- **Then** display:
  - Concept title and category badge
  - Full explanation (2-3 paragraphs)
  - Concrete example with calculations
  - Visual aid (chart or diagram if applicable)
  - Related concepts (clickable links)
  - "Mark as Learned" button

### AC #2: Example Calculations
- **Given** the concept is "Compound Interest"
- **When** showing the example
- **Then** display an interactive example:
  - "If you invest €100/month for 20 years at 7% return..."
  - Show the calculation and final amount
  - Compare to simple interest

### AC #3: Personalized Examples
- **Given** user has actual financial data
- **When** showing concept examples
- **Then** use their real numbers when relevant:
  - "Your current savings rate of 22% means..."
  - "At your average monthly spend of €1,850..."

### AC #4: Related Concepts Navigation
- **Given** a concept has related concepts
- **When** displayed on the page
- **Then** show as clickable cards at the bottom

### AC #5: Breadcrumb Navigation
- **Given** user is on a concept page
- **When** viewing
- **Then** show: Learn > Category > Concept Name

---

## Technical Notes

- Use Next.js dynamic routes: `src/app/(dashboard)/learn/[slug]/page.tsx`
- Consider MDX for rich content with components
- Add concept pages to sitemap for SEO (future)

### Page Layout
```
┌────────────────────────────────────────┐
│ Learn > Investing > Compound Interest  │
├────────────────────────────────────────┤
│ # Compound Interest                    │
│ [Investing] [Beginner]                │
│                                        │
│ [Full explanation paragraphs...]       │
│                                        │
│ ## Example                            │
│ [Interactive calculation with         │
│  user's actual numbers if available]  │
│                                        │
│ ## Related Concepts                   │
│ [Card] [Card] [Card]                  │
│                                        │
│ [✓ Mark as Learned]                   │
└────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/(dashboard)/learn/page.tsx` | Create |
| `src/app/(dashboard)/learn/[slug]/page.tsx` | Create |
| `src/components/education/ConceptCard.tsx` | Create |
| `src/components/education/ExampleCalculation.tsx` | Create |

---

## Prerequisites

- Story 9.1: Financial Concepts Knowledge Base (provides content)
- Story 9.2: Micro-Lesson Triggers (provides learned_concepts tracking)

---

## Definition of Done

- [ ] Dynamic route `/learn/[slug]` works
- [ ] Full content displays correctly
- [ ] Interactive examples render
- [ ] Personalized examples use user data
- [ ] Related concepts are clickable
- [ ] Breadcrumb navigation works
- [ ] "Mark as Learned" updates profile
- [ ] Bilingual content works
