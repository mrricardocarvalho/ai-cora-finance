# Epic 9: Financial Literacy Engine

**Goal:** Build an educational layer into Cora that teaches users WHY, not just WHAT, through contextual micro-lessons triggered by their actual financial situations.

**Prerequisites:** Epic 3 complete (Insight Engine), Core features working.

**Business Value:** Users become financially literate over time, making better decisions independently. This builds long-term trust and engagement, differentiating Cora from apps that just show data.

---

## Stories

---

### Story 9.1: Education Module Types & Structure

**As a** Developer,
**I want** type definitions and folder structure for the education module,
**So that** I have a foundation to build the knowledge base.

**Acceptance Criteria:**

**AC #1: Create Education Types File**
- **Given** the need for type safety
- **When** implementing education features
- **Then** create `src/lib/education/types.ts` with:
  ```typescript
  export type ConceptDifficulty = 'beginner' | 'intermediate' | 'advanced';
  export type ConceptCategory = 'investing' | 'budgeting' | 'taxes' | 'debt' | 'saving';
  
  export interface LocalizedString {
    'pt-PT': string;
    'en-US': string;
  }
  
  export interface FinancialConcept {
    id: string;
    slug: string;
    title: LocalizedString;
    shortExplanation: LocalizedString;
    fullExplanation: LocalizedString;
    example: LocalizedString;
    relatedConcepts: string[];
    difficulty: ConceptDifficulty;
    category: ConceptCategory;
  }
  ```

**AC #2: Create Index Export File**
- **Given** the module structure
- **When** setting up exports
- **Then** create `src/lib/education/index.ts` with placeholder exports

**Files to Create:**
- `src/lib/education/types.ts` (new)
- `src/lib/education/index.ts` (new)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.1.1: Core Concepts - Beginner Investing (Part 1)

**As a** Developer,
**I want** beginner investing concepts defined,
**So that** users can learn fundamental investing concepts.

**Acceptance Criteria:**

**AC #1: Create Concepts File with First 4 Investing Concepts**
- **Given** the types are defined
- **When** adding concepts
- **Then** create `src/lib/education/concepts/investing-beginner.ts` with:
  - `compound-interest`: Juros Compostos / Compound Interest
  - `etf-basics`: O que é um ETF / What is an ETF
  - `diversification`: Diversificação / Diversification
  - `dollar-cost-averaging`: Investimento Periódico / Dollar-Cost Averaging

**AC #2: Bilingual Content**
- Each concept has PT-PT and EN-US versions for all text fields

**AC #3: Related Concepts Linked**
- Each concept references related concept slugs

**Files to Create:**
- `src/lib/education/concepts/investing-beginner.ts` (new)

**Estimated Effort:** 2 points (1-2 hours)

---

### Story 9.1.2: Core Concepts - Beginner Budgeting

**As a** Developer,
**I want** beginner budgeting concepts defined,
**So that** users can learn fundamental budgeting concepts.

**Acceptance Criteria:**

**AC #1: Create Budgeting Concepts File**
- **Given** the types are defined
- **When** adding concepts
- **Then** create `src/lib/education/concepts/budgeting-beginner.ts` with:
  - `emergency-fund`: Fundo de Emergência / Emergency Fund
  - `50-30-20-rule`: Regra 50/30/20 / 50/30/20 Rule
  - `savings-rate`: Taxa de Poupança / Savings Rate
  - `net-worth`: Património Líquido / Net Worth

**Files to Create:**
- `src/lib/education/concepts/budgeting-beginner.ts` (new)

**Estimated Effort:** 2 points (1-2 hours)

---

### Story 9.1.3: Core Concepts - Beginner Debt

**As a** Developer,
**I want** beginner debt concepts defined,
**So that** users can learn fundamental debt concepts.

**Acceptance Criteria:**

**AC #1: Create Debt Concepts File**
- **Given** the types are defined
- **When** adding concepts
- **Then** create `src/lib/education/concepts/debt-beginner.ts` with:
  - `good-debt-bad-debt`: Dívida Boa vs Má / Good Debt vs Bad Debt
  - `interest-rate-apr`: Taxa de Juro (TAEG) / Interest Rate (APR)
  - `avalanche-vs-snowball`: Avalanche vs Bola de Neve / Avalanche vs Snowball
  - `amortization`: Amortização / Amortization

**Files to Create:**
- `src/lib/education/concepts/debt-beginner.ts` (new)

**Estimated Effort:** 2 points (1-2 hours)

---

### Story 9.1.4: Core Concepts - Beginner Taxes (Portugal)

**As a** Developer,
**I want** beginner Portuguese tax concepts defined,
**So that** users can learn fundamental tax concepts.

**Acceptance Criteria:**

**AC #1: Create Taxes Concepts File**
- **Given** the types are defined
- **When** adding concepts
- **Then** create `src/lib/education/concepts/taxes-beginner.ts` with:
  - `irs-basics`: Noções de IRS / IRS Basics
  - `capital-gains-tax`: Imposto sobre Mais-Valias / Capital Gains Tax
  - `tax-deductions`: Deduções Fiscais / Tax Deductions
  - `e-fatura`: e-Fatura / e-Invoice System

**Files to Create:**
- `src/lib/education/concepts/taxes-beginner.ts` (new)

**Estimated Effort:** 2 points (1-2 hours)

---

### Story 9.1.5: Core Concepts - Intermediate & Advanced

**As a** Developer,
**I want** intermediate and advanced concepts defined,
**So that** users can continue learning beyond basics.

**Acceptance Criteria:**

**AC #1: Create Intermediate Concepts File**
- **Given** the types are defined
- **When** adding concepts
- **Then** create `src/lib/education/concepts/intermediate.ts` with:
  - `fire`: Independência Financeira (FIRE) / Financial Independence (FIRE)
  - `tax-loss-harvesting`: Tax-Loss Harvesting / Tax-Loss Harvesting
  - `asset-allocation`: Alocação de Ativos / Asset Allocation
  - `risk-tolerance`: Tolerância ao Risco / Risk Tolerance

**AC #2: Create Advanced Concepts File**
- **Given** the types are defined
- **When** adding concepts
- **Then** create `src/lib/education/concepts/advanced.ts` with:
  - `rebalancing`: Rebalanceamento / Rebalancing
  - `tax-efficient-investing`: Investimento Eficiente Fiscalmente / Tax-Efficient Investing
  - `inflation-impact`: Impacto da Inflação / Inflation Impact

**Files to Create:**
- `src/lib/education/concepts/intermediate.ts` (new)
- `src/lib/education/concepts/advanced.ts` (new)

**Estimated Effort:** 2 points (1-2 hours)

---

### Story 9.1.6: Concepts Aggregator & Search Functions

**As a** Developer,
**I want** a unified concepts aggregator and search functionality,
**So that** I can lookup and search concepts easily.

**Acceptance Criteria:**

**AC #1: Create Concepts Aggregator**
- **Given** all concept files exist
- **When** importing concepts
- **Then** create `src/lib/education/concepts/index.ts` that:
  - Imports all concept files
  - Exports a combined `ALL_CONCEPTS` array
  - Exports by category: `INVESTING_CONCEPTS`, `BUDGETING_CONCEPTS`, etc.

**AC #2: Create Search Functions**
- **Given** the concepts aggregator exists
- **When** needing to find concepts
- **Then** add to `src/lib/education/index.ts`:
  - `getConcept(slug: string): FinancialConcept | undefined`
  - `searchConcepts(query: string, locale: 'pt-PT' | 'en-US'): FinancialConcept[]`
  - `getConceptsByCategory(category: ConceptCategory): FinancialConcept[]`
  - `getConceptsByDifficulty(difficulty: ConceptDifficulty): FinancialConcept[]`

**Files to Create/Modify:**
- `src/lib/education/concepts/index.ts` (new)
- `src/lib/education/index.ts` (modify)

**Estimated Effort:** 2 points (1 hour)

---

### Story 9.2: Database Migration for Learned Concepts

**As a** Developer,
**I want** database support for tracking learned concepts,
**So that** users' learning progress persists.

**Acceptance Criteria:**

**AC #1: Create Migration File**
- **Given** the profiles table exists
- **When** adding learning tracking
- **Then** create migration `db/migrations/00XX_add_learned_concepts.sql`:
  ```sql
  ALTER TABLE profiles
  ADD COLUMN learned_concepts TEXT[] DEFAULT '{}';
  
  COMMENT ON COLUMN profiles.learned_concepts IS 
    'Array of concept slugs the user has learned';
  ```

**AC #2: Apply Migration**
- **Given** the migration file exists
- **When** running migrations
- **Then** the column is added successfully

**Files to Create:**
- `db/migrations/00XX_add_learned_concepts.sql` (new - use next available number)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.2.1: Learning State Server Actions

**As a** Developer,
**I want** server actions for managing learned concepts,
**So that** the UI can track learning progress.

**Acceptance Criteria:**

**AC #1: Create Learning Actions File**
- **Given** the database column exists
- **When** managing learning state
- **Then** create `src/lib/actions/learning.ts` with:
  - `markConceptLearned(conceptSlug: string): Promise<void>`
  - `getLearnedConcepts(): Promise<string[]>`
  - `hasLearnedConcept(conceptSlug: string): Promise<boolean>`
  - `resetLearningProgress(): Promise<void>` (optional, for testing)

**AC #2: Server Action Validation**
- **Given** a user marks a concept as learned
- **When** the concept slug is invalid
- **Then** throw an error (concept must exist in knowledge base)

**Files to Create:**
- `src/lib/actions/learning.ts` (new)

**Estimated Effort:** 2 points (1 hour)

---

### Story 9.2.2: Learning Context Provider

**As a** Developer,
**I want** a React Context for learning state,
**So that** components can access learning status efficiently.

**Acceptance Criteria:**

**AC #1: Create Learning Context**
- **Given** the server actions exist
- **When** managing client-side learning state
- **Then** create `src/components/education/LearningContext.tsx` with:
  - `LearningProvider` component
  - `useLearning()` hook returning:
    - `learnedConcepts: string[]`
    - `hasLearned: (slug: string) => boolean`
    - `markAsLearned: (slug: string) => Promise<void>`
    - `isLoading: boolean`

**AC #2: Optimistic Updates**
- **Given** a user marks a concept as learned
- **When** updating state
- **Then** update UI immediately, revert on server error

**Files to Create:**
- `src/components/education/LearningContext.tsx` (new)

**Estimated Effort:** 2 points (1 hour)

---

### Story 9.2.3: LearnChip Component

**As a** Developer,
**I want** a small "Learn" chip component,
**So that** I can trigger micro-lessons from any context.

**Acceptance Criteria:**

**AC #1: Create LearnChip Component**
- **Given** the need for non-intrusive learning triggers
- **When** displaying learning opportunities
- **Then** create `src/components/education/LearnChip.tsx`:
  - Props: `conceptSlug: string`, `size?: 'sm' | 'md'`
  - Display: "💡 Learn" or just "💡" for small
  - Hidden if user has already learned this concept
  - On click: opens MicroLesson popover/dialog

**AC #2: Styling**
- Chip uses app's design system (shadcn Button variant or Badge)
- Subtle appearance, doesn't distract from main content

**Files to Create:**
- `src/components/education/LearnChip.tsx` (new)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.2.4: MicroLesson Component

**As a** Developer,
**I want** a micro-lesson display component,
**So that** users see brief educational content.

**Acceptance Criteria:**

**AC #1: Create MicroLesson Component**
- **Given** a concept slug
- **When** displaying the micro-lesson
- **Then** create `src/components/education/MicroLesson.tsx` showing:
  - Concept title
  - Short explanation (2-3 sentences)
  - Example with numbers
  - "Learn More" link to `/learn/[slug]`
  - "Got it" button that marks concept as learned

**AC #2: Popover/Dialog Display**
- **Given** MicroLesson is triggered
- **When** displaying
- **Then** show as:
  - Popover on desktop (positioned near trigger)
  - Bottom sheet on mobile

**AC #3: Locale Support**
- **Given** the app's current locale
- **When** displaying content
- **Then** show content in the user's language

**Files to Create:**
- `src/components/education/MicroLesson.tsx` (new)

**Estimated Effort:** 2 points (1-2 hours)

---

### Story 9.2.5: Trigger Detection System

**As a** Developer,
**I want** a system to detect when to show learning opportunities,
**So that** micro-lessons appear at the right moments.

**Acceptance Criteria:**

**AC #1: Create Trigger Definitions**
- **Given** the need for contextual learning
- **When** defining triggers
- **Then** create `src/lib/education/triggers.ts` with:
  ```typescript
  export interface LearningTrigger {
    id: string;
    conceptSlug: string;
    triggerType: 'first-view' | 'first-action' | 'insight-related';
    context: string; // e.g., 'fire-projection', 'add-etf', 'first-debt'
  }
  
  export const LEARNING_TRIGGERS: LearningTrigger[] = [
    { id: 't1', conceptSlug: 'fire', triggerType: 'first-view', context: 'fire-projection' },
    { id: 't2', conceptSlug: 'etf-basics', triggerType: 'first-action', context: 'add-etf' },
    { id: 't3', conceptSlug: 'interest-rate-apr', triggerType: 'first-action', context: 'first-debt' },
    { id: 't4', conceptSlug: 'emergency-fund', triggerType: 'first-action', context: 'set-comfort-floor' },
    { id: 't5', conceptSlug: 'tax-loss-harvesting', triggerType: 'insight-related', context: 'tax-loss-insight' },
  ];
  ```

**AC #2: Trigger Check Function**
- **Given** triggers are defined
- **When** checking if a trigger should fire
- **Then** add `shouldShowTrigger(context: string, learnedConcepts: string[]): LearningTrigger | null`

**Files to Create:**
- `src/lib/education/triggers.ts` (new)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.3: Learn Index Page

**As a** Developer,
**I want** a Learn section landing page,
**So that** users can browse all concepts.

**Acceptance Criteria:**

**AC #1: Create Learn Page Route**
- **Given** the Next.js app structure
- **When** creating the learn section
- **Then** create `src/app/(dashboard)/learn/page.tsx`:
  - Page title: "Learn" / "Aprender"
  - Brief intro text
  - Display concept library (Story 9.4.2)

**AC #2: Basic Page Structure**
- Use existing page layout patterns
- Include breadcrumb: Home > Learn

**Files to Create:**
- `src/app/(dashboard)/learn/page.tsx` (new)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.3.1: Concept Detail Page

**As a** Developer,
**I want** individual concept detail pages,
**So that** users can read full explanations.

**Acceptance Criteria:**

**AC #1: Create Dynamic Route**
- **Given** the Next.js app structure
- **When** viewing a concept
- **Then** create `src/app/(dashboard)/learn/[slug]/page.tsx`:
  - Fetch concept by slug from knowledge base
  - 404 if concept not found
  - Display full concept content

**AC #2: Page Content**
- Breadcrumb: Learn > [Category] > [Concept Title]
- Category badge
- Full explanation (formatted markdown)
- Example section with calculations
- Related concepts cards
- "Mark as Learned" button

**Files to Create:**
- `src/app/(dashboard)/learn/[slug]/page.tsx` (new)

**Estimated Effort:** 2 points (1-2 hours)

---

### Story 9.3.2: ConceptCard Component

**As a** Developer,
**I want** a card component for displaying concepts,
**So that** concepts are displayed consistently.

**Acceptance Criteria:**

**AC #1: Create ConceptCard Component**
- **Given** the need to display concepts in lists
- **When** showing a concept
- **Then** create `src/components/education/ConceptCard.tsx`:
  - Props: `concept: FinancialConcept`, `showLearned?: boolean`
  - Display: title, category badge, difficulty indicator
  - "Learned" checkmark if user has learned it
  - Clickable, links to `/learn/[slug]`

**AC #2: Styling Variants**
- Default size for library grid
- Compact size for "Related Concepts" section

**Files to Create:**
- `src/components/education/ConceptCard.tsx` (new)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.3.3: ExampleCalculation Component

**As a** Developer,
**I want** an interactive example calculation component,
**So that** concepts include concrete examples.

**Acceptance Criteria:**

**AC #1: Create ExampleCalculation Component**
- **Given** the need for interactive examples
- **When** showing compound interest example
- **Then** create `src/components/education/ExampleCalculation.tsx`:
  - Props: `type: 'compound-interest' | 'savings-rate' | ...`
  - Display calculation with inputs (optional: make inputs editable)
  - Show result with clear formatting

**AC #2: Compound Interest Example**
- Inputs: monthly amount, years, return rate
- Output: final amount, total contributed, gains
- Compare to simple interest

**Files to Create:**
- `src/components/education/ExampleCalculation.tsx` (new)

**Estimated Effort:** 2 points (1-2 hours)

---

### Story 9.4: LearningProgress Component

**As a** Developer,
**I want** a learning progress summary component,
**So that** users see their progress at a glance.

**Acceptance Criteria:**

**AC #1: Create LearningProgress Component**
- **Given** the user's learned concepts
- **When** displaying progress
- **Then** create `src/components/education/LearningProgress.tsx`:
  - Props: `learnedConcepts: string[]`
  - Display: "You've learned X of Y concepts"
  - Visual progress ring or bar
  - Breakdown by category (optional)

**AC #2: Styling**
- Use app's design system
- Celebratory styling when complete (100%)

**Files to Create:**
- `src/components/education/LearningProgress.tsx` (new)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.4.1: ConceptLibrary Component

**As a** Developer,
**I want** a browsable concept library component,
**So that** users can explore concepts by category.

**Acceptance Criteria:**

**AC #1: Create ConceptLibrary Component**
- **Given** all concepts
- **When** displaying the library
- **Then** create `src/components/education/ConceptLibrary.tsx`:
  - Category filter tabs: All | Investing | Budgeting | Taxes | Debt | Saving
  - Difficulty filter (optional)
  - Grid of ConceptCards
  - Learned concepts marked with checkmark

**AC #2: Responsive Layout**
- Desktop: 3-4 column grid
- Mobile: 1-2 column grid

**Files to Create:**
- `src/components/education/ConceptLibrary.tsx` (new)

**Estimated Effort:** 2 points (1 hour)

---

### Story 9.4.2: Learning Recommendations

**As a** Developer,
**I want** a recommendation engine for next concepts,
**So that** users know what to learn next.

**Acceptance Criteria:**

**AC #1: Create Recommendations Module**
- **Given** user's learned concepts and financial activity
- **When** suggesting next concepts
- **Then** create `src/lib/education/recommendations.ts`:
  - `getNextRecommendedConcept(learnedConcepts: string[], userContext?: UserContext): FinancialConcept`
  - Logic:
    1. Prioritize beginner concepts first
    2. Complete one category before suggesting another
    3. Consider user's actual data (has investments → investing concepts)

**AC #2: Continue Learning Section**
- **Given** the Learn page
- **When** displaying
- **Then** show "Continue Learning: [Next Concept Card]"

**Files to Create:**
- `src/lib/education/recommendations.ts` (new)

**Estimated Effort:** 2 points (1 hour)

---

### Story 9.4.3: Add Learn to Navigation

**As a** Developer,
**I want** the Learn section in the navigation,
**So that** users can find the learning area.

**Acceptance Criteria:**

**AC #1: Update Navigation**
- **Given** the main navigation component
- **When** adding Learn section
- **Then** add "📚 Learn" item:
  - Icon: BookOpen or GraduationCap
  - Link to `/learn`
  - Position: under Planning or as standalone section

**Files to Modify:**
- Navigation component (identify existing nav file)

**Estimated Effort:** 1 point (15 min)

---

### Story 9.5: WhyExplanation Component

**As a** Developer,
**I want** a reusable "Why" explanation component,
**So that** insights can explain their reasoning.

**Acceptance Criteria:**

**AC #1: Create WhyExplanation Component**
- **Given** the need to explain "why" for insights
- **When** displaying an insight
- **Then** create `src/components/education/WhyExplanation.tsx`:
  - Props: `why: string`, `learnMoreSlug?: string`
  - Display: collapsible "Why this matters" section
  - If learnMoreSlug provided, show "Learn more →" link

**AC #2: Styling**
- Subtle, secondary text styling
- Expandable by default or collapsed

**Files to Create:**
- `src/components/education/WhyExplanation.tsx` (new)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.5.1: Extend Insight Types for Why Field

**As a** Developer,
**I want** the insight types extended with why/learn fields,
**So that** insights can include explanations.

**Acceptance Criteria:**

**AC #1: Update Insight Types**
- **Given** the existing insight types
- **When** adding why support
- **Then** modify `src/lib/types.ts` or relevant file:
  ```typescript
  // Add to InsightRow or insight interface
  why?: string;
  learnMoreConcept?: string; // concept slug
  ```

**AC #2: Backward Compatible**
- New fields are optional
- Existing insights continue to work

**Files to Modify:**
- `src/lib/types.ts` or relevant types file

**Estimated Effort:** 1 point (15 min)

---

### Story 9.5.2: Update InsightCard with Why Section

**As a** Developer,
**I want** InsightCard to display the why explanation,
**So that** users understand insight reasoning.

**Acceptance Criteria:**

**AC #1: Update InsightCard**
- **Given** the WhyExplanation component exists
- **When** an insight has a `why` field
- **Then** display WhyExplanation below the insight content

**AC #2: Conditional Rendering**
- Only show "Why" section if `why` field is present
- Show "Learn more" link if `learnMoreConcept` is present

**Files to Modify:**
- `src/components/InsightCard.tsx` (or equivalent)

**Estimated Effort:** 1 point (30 min)

---

### Story 9.5.3: Add Why Content to Existing Insights

**As a** Developer,
**I want** existing insights to include why explanations,
**So that** users get educational value from insights.

**Acceptance Criteria:**

**AC #1: Update Tax-Related Insights**
- **Given** tax-loss harvesting insights exist
- **When** generating them
- **Then** include `why` explaining the tax benefit

**AC #2: Update Spending Insights**
- **Given** anomaly/spending insights exist
- **When** generating them
- **Then** include `why` explaining budgeting importance

**AC #3: Update Investment Insights**
- **Given** investment insights exist
- **When** generating them
- **Then** include `why` with relevant financial concept

**Files to Modify:**
- Insight generation files (identify from codebase)

**Estimated Effort:** 2 points (1-2 hours)

---

## Epic Summary (Granular Breakdown)

| Story | Title | Points | Priority | Dependency |
|-------|-------|--------|----------|------------|
| 9.1 | Education Module Types & Structure | 1 | High | None |
| 9.1.1 | Core Concepts - Beginner Investing | 2 | High | 9.1 |
| 9.1.2 | Core Concepts - Beginner Budgeting | 2 | High | 9.1 |
| 9.1.3 | Core Concepts - Beginner Debt | 2 | High | 9.1 |
| 9.1.4 | Core Concepts - Beginner Taxes (PT) | 2 | High | 9.1 |
| 9.1.5 | Core Concepts - Intermediate & Advanced | 2 | Medium | 9.1 |
| 9.1.6 | Concepts Aggregator & Search Functions | 2 | High | 9.1.1-9.1.5 |
| 9.2 | Database Migration for Learned Concepts | 1 | High | None |
| 9.2.1 | Learning State Server Actions | 2 | High | 9.2 |
| 9.2.2 | Learning Context Provider | 2 | High | 9.2.1 |
| 9.2.3 | LearnChip Component | 1 | High | 9.2.2 |
| 9.2.4 | MicroLesson Component | 2 | High | 9.1.6, 9.2.3 |
| 9.2.5 | Trigger Detection System | 1 | Medium | 9.2.2 |
| 9.3 | Learn Index Page | 1 | High | 9.1.6 |
| 9.3.1 | Concept Detail Page | 2 | High | 9.3 |
| 9.3.2 | ConceptCard Component | 1 | High | 9.1.6 |
| 9.3.3 | ExampleCalculation Component | 2 | Medium | 9.3.1 |
| 9.4 | LearningProgress Component | 1 | Medium | 9.2.2 |
| 9.4.1 | ConceptLibrary Component | 2 | Medium | 9.3.2 |
| 9.4.2 | Learning Recommendations | 2 | Low | 9.1.6, 9.2.2 |
| 9.4.3 | Add Learn to Navigation | 1 | High | 9.3 |
| 9.5 | WhyExplanation Component | 1 | High | None |
| 9.5.1 | Extend Insight Types for Why Field | 1 | High | None |
| 9.5.2 | Update InsightCard with Why Section | 1 | High | 9.5, 9.5.1 |
| 9.5.3 | Add Why Content to Existing Insights | 2 | Medium | 9.5.2, 9.1.6 |

**Total Points:** 37 (increased due to granularity)
**Estimated Timeline:** 2-3 weeks

---

## Implementation Order (Recommended)

### Phase 1: Foundation (Day 1-2)
1. Story 9.1 - Types & Structure
2. Story 9.1.1 - Investing Concepts
3. Story 9.1.2 - Budgeting Concepts
4. Story 9.1.3 - Debt Concepts
5. Story 9.1.4 - Tax Concepts
6. Story 9.1.6 - Aggregator & Search

### Phase 2: Learning Tracking (Day 3-4)
1. Story 9.2 - Database Migration
2. Story 9.2.1 - Server Actions
3. Story 9.2.2 - Learning Context
4. Story 9.5.1 - Extend Insight Types
5. Story 9.5 - WhyExplanation Component

### Phase 3: UI Components (Day 5-6)
1. Story 9.3.2 - ConceptCard
2. Story 9.2.3 - LearnChip
3. Story 9.2.4 - MicroLesson
4. Story 9.4 - LearningProgress

### Phase 4: Pages (Day 7-8)
1. Story 9.3 - Learn Index Page
2. Story 9.3.1 - Concept Detail Page
3. Story 9.4.1 - ConceptLibrary
4. Story 9.4.3 - Navigation Update

### Phase 5: Integration (Day 9-10)
1. Story 9.5.2 - Update InsightCard
2. Story 9.5.3 - Add Why to Insights
3. Story 9.2.5 - Trigger Detection
4. Story 9.1.5 - Intermediate/Advanced Concepts
5. Story 9.3.3 - ExampleCalculation
6. Story 9.4.2 - Recommendations

---

## Success Metrics

- [ ] Users complete at least 5 micro-lessons in first month
- [ ] 80% of users can explain their Safe-to-Spend number to a friend
- [ ] Reduced repeat questions on same concepts in chat
- [ ] Users report increased financial confidence (qualitative)

---

## Initial Concept List (Priority Order)

### Beginner (Must Have)
1. Emergency Fund
2. Compound Interest
3. Net Worth
4. Budgeting Basics (50/30/20)
5. Good Debt vs Bad Debt
6. Savings Rate
7. ETF Basics
8. IRS/Tax Basics (Portugal)

### Intermediate
9. Diversification
10. Dollar-Cost Averaging
11. FIRE (Financial Independence)
12. Tax-Loss Harvesting
13. Asset Allocation
14. Interest Rate (APR/APY)
15. Amortization

### Advanced
16. Risk-Adjusted Returns
17. Rebalancing
18. Tax-Efficient Investing
19. Withdrawal Strategies
20. Inflation Impact
