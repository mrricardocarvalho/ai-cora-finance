# Story 9.1: Financial Concepts Knowledge Base

**Epic:** [Epic 9 - Financial Literacy Engine](../epics/epic-9-financial-literacy.md)
**Priority:** High
**Points:** 5

---

## User Story

**As a** Developer,
**I want** a structured knowledge base of financial concepts,
**So that** Cora can explain terms and concepts to users on demand.

---

## Acceptance Criteria

### AC #1: Concept Data Model
- **Given** the need to store educational content
- **When** designing the schema
- **Then** create a concept structure:
  ```typescript
  interface FinancialConcept {
    id: string;
    slug: string; // 'compound-interest'
    title: { 'pt-PT': string; 'en-US': string };
    shortExplanation: { 'pt-PT': string; 'en-US': string }; // 1-2 sentences
    fullExplanation: { 'pt-PT': string; 'en-US': string }; // 2-3 paragraphs
    example: { 'pt-PT': string; 'en-US': string }; // Concrete example
    relatedConcepts: string[]; // slugs
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: 'investing' | 'budgeting' | 'taxes' | 'debt' | 'saving';
  }
  ```

### AC #2: Core Concepts Library
- **Given** the knowledge base is initialized
- **When** checking content
- **Then** include at least 20 foundational concepts:
  - **Investing**: Compound interest, Diversification, ETF vs Stocks, Dollar-cost averaging, FIFO, Capital gains, Dividends, Risk tolerance
  - **Budgeting**: Emergency fund, Comfort floor, 50/30/20 rule, Zero-based budgeting
  - **Debt**: Interest rate (APR), Amortization, Avalanche vs Snowball, Good debt vs bad debt
  - **Taxes (PT)**: IRS, IMI, Capital gains tax, Tax deductions, e-fatura
  - **Saving**: FIRE, Savings rate, Net worth, Inflation

### AC #3: Bilingual Content
- **Given** the app supports PT-PT and EN-US
- **When** storing concepts
- **Then** all text content is available in both languages

### AC #4: Search/Lookup API
- **Given** a concept slug or keyword
- **When** querying `getConcept('compound-interest')` or `searchConcepts('juros')`
- **Then** return matching concept(s) with full content

---

## Technical Notes

- Store as TypeScript constants initially (no DB needed)
- Create `src/lib/education/concepts.ts` with all concept definitions
- Consider markdown for rich text formatting in explanations
- Add examples using Portuguese context (€ amounts, PT banks, IRS references)

### Example Concept
```typescript
{
  id: 'compound-interest',
  slug: 'compound-interest',
  title: {
    'pt-PT': 'Juros Compostos',
    'en-US': 'Compound Interest',
  },
  shortExplanation: {
    'pt-PT': 'Juros calculados sobre o capital inicial e sobre os juros acumulados.',
    'en-US': 'Interest calculated on both the initial principal and accumulated interest.',
  },
  fullExplanation: { ... },
  example: {
    'pt-PT': 'Se investires €1.000 a 7% ao ano, após 10 anos terás €1.967.',
    'en-US': 'If you invest €1,000 at 7% annually, after 10 years you\'ll have €1,967.',
  },
  relatedConcepts: ['savings-rate', 'fire', 'inflation'],
  difficulty: 'beginner',
  category: 'investing',
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/education/concepts.ts` | Create |
| `src/lib/education/types.ts` | Create |
| `src/lib/education/index.ts` | Create |

---

## Prerequisites

- None (foundational for education features)

---

## Definition of Done

- [ ] Type definitions for concepts
- [ ] 20+ concepts defined with full content
- [ ] All content in PT-PT and EN-US
- [ ] Search by slug working
- [ ] Search by keyword working
- [ ] Related concepts linked
- [ ] Difficulty and category assigned
