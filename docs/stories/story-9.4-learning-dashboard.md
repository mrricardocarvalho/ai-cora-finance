# Story 9.4: Learning Progress Dashboard

**Epic:** [Epic 9 - Financial Literacy Engine](../epics/epic-9-financial-literacy.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** to see my learning progress and discover new concepts,
**So that** I stay motivated to improve my financial literacy.

---

## Acceptance Criteria

### AC #1: Learn Section in Navigation
- **Given** the main navigation
- **When** viewing menu
- **Then** show "Learn" or "📚 Learn" section (under Planning or as standalone)

### AC #2: Learning Dashboard
- **Given** user navigates to Learn section
- **When** page loads
- **Then** display:
  - Progress summary: "You've learned 8 of 25 concepts"
  - Visual progress bar or ring
  - "Continue Learning" suggested next concept
  - Concept library organized by category

### AC #3: Category Browsing
- **Given** the concept library
- **When** viewing
- **Then** organize by category with filters:
  - All | Investing | Budgeting | Taxes | Debt | Saving
  - Show concept cards with title, difficulty, and "Learned" badge

### AC #4: Difficulty Progression
- **Given** concepts have difficulty levels
- **When** suggesting next concept
- **Then** recommend based on:
  - Unlocked beginner concepts first
  - Intermediate concepts after beginner in category complete
  - User's actual financial activity (has investments → suggest investing concepts)

### AC #5: Achievement System (Stretch)
- **Given** user completes learning milestones
- **When** achieved
- **Then** show celebration:
  - "🎓 Budgeting Basics Complete!" after all budgeting beginner concepts
  - Add to a visible achievements list

### AC #6: Insights Integration
- **Given** the Insight Engine
- **When** generating insights
- **Then** occasionally suggest learning: "Want to understand why diversification matters? Learn about it →"

---

## Technical Notes

- Calculate progress from `learned_concepts` array in profile
- Create learning recommendations based on user activity
- Consider gamification elements to encourage completion

### Progress Calculation
```typescript
function calculateLearningProgress(learnedConcepts: string[]) {
  const total = allConcepts.length;
  const learned = learnedConcepts.length;
  const byCategory = categories.map(cat => ({
    category: cat,
    learned: learnedConcepts.filter(c => getConcept(c).category === cat).length,
    total: allConcepts.filter(c => c.category === cat).length,
  }));
  return { total, learned, percentage: (learned / total) * 100, byCategory };
}
```

### Next Concept Recommendation
```typescript
function getNextRecommendation(learnedConcepts: string[], userContext: UserContext) {
  // Priority: Relevant to user activity > Difficulty progression > Random
  const unlearned = allConcepts.filter(c => !learnedConcepts.includes(c.slug));
  
  // If user has investments, prioritize investing concepts
  if (userContext.hasInvestments) {
    const investingConcepts = unlearned.filter(c => c.category === 'investing');
    if (investingConcepts.length) return investingConcepts[0];
  }
  
  // Beginner first
  const beginner = unlearned.filter(c => c.difficulty === 'beginner');
  if (beginner.length) return beginner[0];
  
  return unlearned[0];
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/(dashboard)/learn/page.tsx` | Enhance with dashboard |
| `src/components/education/LearningProgress.tsx` | Create |
| `src/components/education/ConceptLibrary.tsx` | Create |
| `src/lib/education/recommendations.ts` | Create |

---

## Prerequisites

- Story 9.1: Financial Concepts Knowledge Base
- Story 9.2: Micro-Lesson Triggers (provides learned_concepts tracking)

---

## Definition of Done

- [ ] Learn section in navigation
- [ ] Progress summary shows X of Y learned
- [ ] Visual progress indicator
- [ ] Category filtering works
- [ ] Next concept recommendation is smart
- [ ] Learned badge shows on completed concepts
- [ ] Achievement celebration (stretch)
- [ ] Insights occasionally suggest learning
