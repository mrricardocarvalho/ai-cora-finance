# Story 8.5: IRS Knowledge Base & Q&A Enhancement

**Epic:** [Epic 8 - Portuguese Tax Intelligence](../epics/epic-8-tax-intelligence.md)
**Priority:** Medium
**Points:** 5

---

## User Story

**As a** User,
**I want** to ask Cora Portuguese tax questions and get accurate answers,
**So that** I can understand my tax situation without consulting an accountant for basic questions.

---

## Acceptance Criteria

### AC #1: Tax Knowledge Injection
- **Given** user asks a tax question in chat
- **When** Cora processes the query
- **Then** include Portuguese tax context in the AI prompt:
  - Current tax rates (28% capital gains, income tax brackets)
  - Deduction limits and rules
  - Common scenarios and answers

### AC #2: Common Tax Questions
- **Given** the chat interface
- **When** in tax context
- **Then** suggest relevant starter questions:
  - "Posso deduzir as despesas do meu home office?"
  - "Como funciona a tributação de dividendos?"
  - "Qual é o prazo para entregar o IRS?"
  - "Como declaro ganhos de criptomoedas?"

### AC #3: Personalized Tax Answers
- **Given** user asks "How much tax will I owe on my investments?"
- **When** Cora responds
- **Then** use actual portfolio data:
  - "Based on your €2,340 realized gains this year, you'd owe approximately €655 in capital gains tax (28%)"

### AC #4: Disclaimer Requirement
- **Given** any tax-related response
- **When** displaying to user
- **Then** append disclaimer: "This is educational guidance, not tax advice. For complex situations, consult a certified accountant (TOC)."

### AC #5: Source References
- **Given** Cora provides tax information
- **When** applicable
- **Then** include reference links to official sources (Portal das Finanças, Código do IRS)

---

## Technical Notes

- Enhance chat system prompt with Portuguese tax knowledge
- Create structured tax knowledge base (`src/lib/tax/knowledge.ts`)
- Consider RAG (Retrieval Augmented Generation) for complex tax code queries
- Keep tax information dated and flag outdated info

### Tax Knowledge Structure
```typescript
const taxKnowledge = {
  capitalGainsTax: {
    rate: 0.28,
    description: 'Standard rate for all capital gains in Portugal',
    cryptoRule: 'Taxable if held < 365 days (as of 2023)',
  },
  incomeBrackets: [
    { upTo: 7703, rate: 0.1325 },
    { upTo: 11623, rate: 0.18 },
    // ... more brackets
  ],
  deductionLimits: {
    health: { rate: 0.15, max: 1000 },
    education: { rate: 0.30, max: 800 },
    // ...
  },
  lastUpdated: '2024-01-01',
};
```

### System Prompt Addition
```
You are also knowledgeable about Portuguese tax law (IRS). When answering tax questions:
1. Use current Portuguese tax rates and rules
2. Reference the user's actual financial data when relevant
3. Always include the disclaimer about consulting a professional
4. Cite official sources when possible
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/tax/knowledge.ts` | Create |
| `src/lib/actions/chat.ts` | Modify (enhance tax context) |
| `src/lib/ai/prompts.ts` | Modify (add tax specialist prompt) |

---

## Prerequisites

- Story 2.3 or equivalent chat functionality
- Story 4.5: Tax Logic (provides user's tax data)

---

## Definition of Done

- [ ] Tax knowledge base with current PT rates
- [ ] Chat recognizes tax questions
- [ ] Answers use personalized user data
- [ ] Disclaimer appended to all tax responses
- [ ] Official source links included
- [ ] Suggested tax questions in chat
- [ ] Knowledge marked with last-updated date
