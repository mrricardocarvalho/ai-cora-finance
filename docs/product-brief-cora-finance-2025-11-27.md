# Product Brief: cora-finance

**Date:** 2025-11-27
**Author:** Ricar
**Context:** Personal tool with commercial potential — solving my own problem first

---

## Executive Summary

Cora Finance is an AI-powered personal finance assistant designed specifically for the Portuguese market. Unlike traditional budgeting apps that require tedious manual tracking, Cora acts as a proactive financial partner — connecting to your bank accounts and investment brokers, continuously analyzing your financial data, and providing personalized advice in natural language.

The core insight: Most people don't budget because it's exhausting and boring. They have mental rules ("don't go below €X") but leave money on the table through missed tax optimizations, suboptimal investments, and unnecessary expenses. Cora watches your money so you don't have to, telling you what's happening and what to do — in plain Portuguese, with Portuguese rules.

---

## Core Vision

### Problem Statement

Managing personal finances in Portugal is frustrating because:
1. **No tracking happens** — Most people simply watch their account balance and hope for the best
2. **Tax optimization requires expertise** — Portuguese tax law (IRS) has opportunities most people miss
3. **Investment decisions lack context** — Understanding capital gains taxes and portfolio risk requires research people don't do
4. **Loan comparisons are confusing** — Bank proposals are designed to obscure true costs

The result: People leave significant money on the table while feeling anxious about their financial health.

### Problem Impact

- Missed tax deductions and optimization opportunities (potentially hundreds to thousands of euros annually)
- Suboptimal investment decisions due to lack of Portuguese tax context
- Overpaying on loans by not properly comparing bank proposals
- Unnecessary subscription and expense leakage
- Constant low-grade financial anxiety from not knowing "where the money goes"

### Why Existing Solutions Fall Short

**US-Centric Apps (Mint, YNAB, etc.):**
- Don't understand Portuguese tax law, banking system, or investment regulations
- No integration with Portuguese banks (Moey, ActivoBank) or EU brokers (XTB, Trading212, Degiro)
- Budgeting-focused rather than advice-focused

**Portuguese Banking Apps:**
- Only show their own accounts — no unified view
- No proactive insights or recommendations
- No investment or tax intelligence

**Manual Spreadsheets:**
- Require discipline most people don't have
- No automation, no intelligence, no proactive alerts

### Proposed Solution

Cora Finance — an AI financial assistant that:
1. **Connects to your accounts** — Banks (Moey, ActivoBank) and brokers (XTB, Trading212, Degiro)
2. **Learns about YOU** — Through an onboarding interview: your comfort floor, goals, worries, risk tolerance
3. **Watches continuously** — Analyzes all financial data in the background
4. **Speaks proactively** — Alerts, recommendations, and insights via chat and push notifications
5. **Understands Portugal** — Tax optimization, investment taxation, loan analysis with PT-specific knowledge

### Key Differentiators

| Differentiator | What It Means |
|----------------|---------------|
| **Portugal-First** | Built for Portuguese tax law, banks, and brokers — not a US app with translations |
| **Flexible Data Import** | API connections OR manual bank statement import — user's choice, privacy respected |
| **Personalized AI** | Learns your habits, needs, and worries — advice is tailored to YOU |
| **Proactive Intelligence** | Cora comes to you with insights — you don't have to dig |
| **Conversational Interface** | Natural language chat with rich responses (lists, graphs, visuals) |
| **Tax-Aware** | Understands IRS implications of investment and financial decisions |
| **Financial Coach** | Teaches WHY, not just WHAT — builds financial literacy over time |

---

## Target Users

### Primary Users

**Profile: "The Passive Investor"** (like Ricar)

People who:
- Have income and investments but don't actively track finances
- Use a mental "floor" (minimum balance) as their only budgeting system
- Invest regularly but don't optimize for taxes or analyze their portfolio
- Know they're probably leaving money on the table but lack time/energy to investigate
- Are Portuguese tax residents dealing with IRS, Portuguese banks, and EU brokers

**Demographics:**
- Age: 25-45 (tech-comfortable, earning professionals)
- Location: Portugal (tax residents)
- Income: Medium to high earners with disposable income to invest
- Current behavior: Watch account balance, invest monthly, hope for the best

**Pain points:**
- "I don't know where my money goes"
- "I probably miss tax deductions but researching is exhausting"
- "Are my investments any good? I have no idea"
- "When I need a loan, I don't know how to compare offers"

### Secondary Users

**Profile: "The Anxious Saver"**

People who:
- Want to start investing but feel overwhelmed
- Need more guidance and hand-holding
- Are building their emergency fund or paying off debt
- Would benefit from more structured goal-tracking

*Note: This user type could be supported in future versions with more goal-oriented features.*

### User Journey

**Onboarding (Critical First Experience):**
1. User connects bank accounts and brokers
2. Cora conducts a conversational interview:
   - "What's your comfort floor — the balance you never want to go below?"
   - "What are your financial worries right now?"
   - "Are you saving for anything specific?"
   - "How do you feel about investment risk?"
3. Cora analyzes historical data while learning preferences
4. First insights delivered: "Here's what I noticed about your finances..."

**Ongoing Experience:**
- Cora monitors silently in the background
- Push notifications when something matters: "Your subscriptions increased 20% this month"
- Chat interface for questions: "Can I deduct my home office on IRS?"
- Rich visual responses: graphs, lists, comparisons
- Proactive alerts: "At current spending, you'll hit your floor in 14 days"

---

## Complete Feature Vision

*Before scoping MVP, here's the full product vision:*

### 🏦 Data & Accounts
| Feature | Description |
|---------|-------------|
| **Bank Statement Import** | Manual PDF upload with AI-powered parsing and auto-categorization |
| **Smart Categorization** | AI categorizes transactions automatically, flags uncertain items for user review |
| **API Connections** | Future: Direct connections to Moey, ActivoBank, XTB, Trading212, Degiro |
| **Multi-Account Dashboard** | Unified view of all accounts, investments, and debts |

### 📊 Insights & Monitoring
| Feature | Description |
|---------|-------------|
| **Financial Health Score** | Single 0-100 metric showing overall financial health with improvement tips |
| **Spending Insights** | "You spent €340 on subscriptions — 3 you haven't used" |
| **Invisible Spending Detector** | Surfaces forgotten subscriptions, recurring charges, bank fees |
| **Anomaly Detection** | "Your electricity bill is 40% higher than usual" |
| **Floor Alert System** | Learns your comfort floor, predicts when you'll hit it |
| **Cash Flow Forecasting** | "At current spending, you'll hit your floor in 14 days" |

### 💰 Tax Intelligence (Portugal-Specific)
| Feature | Description |
|---------|-------------|
| **Tax Deduction Finder** | Scans transactions for potential IRS deductions |
| **Tax Calendar & Alerts** | Proactive reminders for Portuguese tax deadlines |
| **Investment Tax Optimization** | "Selling Stock X before Dec 31 saves €560 in capital gains tax" |
| **Tax Harvesting Alerts** | Identifies loss-harvesting opportunities |
| **IRS Q&A** | Natural language questions: "Can I deduct my home office?" |

### 📈 Investment Analysis
| Feature | Description |
|---------|-------------|
| **Portfolio Overview** | Unified view across all brokers |
| **Risk Analysis** | "Your portfolio is 90% tech stocks — here's the risk" |
| **Diversification Recommendations** | Contextual advice with explanations |
| **Performance Tracking** | Returns vs benchmarks, adjusted for PT taxes |

### 🏠 Debt Destroyer
| Feature | Description |
|---------|-------------|
| **Debt Overview** | All debts in one place: credit cards, loans, mortgage |
| **Payoff Strategy Comparison** | Avalanche vs Snowball with YOUR numbers |
| **Extra Payment Simulator** | "Paying €200 extra/month saves €12,400 in interest" |
| **Loan Advisor** | Compare bank proposals, reveal true costs |

### 🎯 Goals & FIRE
| Feature | Description |
|---------|-------------|
| **Savings Goals** | Vacation, car, gifts — visual progress tracking |
| **Emergency Fund Calculator** | Based on actual expenses: "You need €5,550, you're at €2,000" |
| **FIRE Calculator** | Track financial independence progress, projected retirement date |
| **"What If" Simulator** | "What if I save €500 more monthly?" scenarios |

### 🧠 Financial Literacy
| Feature | Description |
|---------|-------------|
| **Contextual Micro-Lessons** | 2-minute lessons triggered by user situations |
| **Concept Explanations** | Don't just say "diversify" — teach WHY |
| **Progress-Based Learning** | Unlocks deeper content as user engagement grows |

### 💬 Conversational Interface
| Feature | Description |
|---------|-------------|
| **Natural Language Chat** | Ask anything about your finances |
| **Rich Responses** | Graphs, lists, tables, comparisons in chat |
| **Push Notifications** | Proactive alerts when something matters |
| **Dashboard View** | At-a-glance financial health overview |
| **Future: Voice Interface** | Jarvis-style voice interaction |

---

## Success Metrics

### Personal Success (This is for YOU first)
- Ricar actually uses Cora weekly (not abandoned like other apps)
- Clear visibility into where money goes each month
- At least one tax optimization discovered per year
- Reduced financial anxiety — confidence in financial health

### Product Success (If commercialized)
- User retention: 60%+ monthly active users after 3 months
- Engagement: Average 3+ interactions per week
- Value delivered: Users report saving/optimizing €500+ annually
- NPS: 50+ (users would recommend to friends)

### Business Objectives

**Phase 1: Personal Tool**
- Build for yourself, validate the concept works

**Phase 2: Expand to Portuguese Market**
- Freemium model: Free basic features, premium for advanced tax/investment tools
- Target: 1,000 active users in Portugal

**Phase 3: EU Expansion**
- Adapt for Spain, France, Germany (similar tax complexity, underserved markets)

---

## MVP Scope

### 🎯 MVP Philosophy
*Build the full vision. With AI-assisted development and no time constraints, there's no reason to artificially limit scope. This is a personal tool first — build what YOU need.*

### Core Features (MVP v1 — Full Vision)

#### 🏦 Data & Accounts
| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | **Bank Statement Import** | Manual PDF upload with AI-powered parsing |
| P0 | **Smart Auto-Categorization** | AI categorizes transactions, flags uncertain items |
| P0 | **Categorization Review UI** | User corrects errors, AI learns from corrections |
| P0 | **Multi-Account Dashboard** | Unified view of all accounts, investments, debts |
| P1 | **API Connections** | Direct connections to Moey, ActivoBank, XTB, Trading212, Degiro |

#### 📊 Insights & Monitoring
| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | **Spending Dashboard** | Where does the money go? Visual breakdown |
| P0 | **Financial Health Score** | Single 0-100 metric with improvement tips |
| P1 | **Invisible Spending Detector** | Surfaces forgotten subscriptions, recurring charges |
| P1 | **Anomaly Detection** | "Your electricity bill is 40% higher than usual" |
| P1 | **Floor Alert System** | Track comfort floor, predict when you'll hit it |
| P1 | **Cash Flow Forecasting** | "At current spending, you'll hit your floor in 14 days" |

#### 💰 Tax Intelligence (Portugal-Specific)
| Priority | Feature | Description |
|----------|---------|-------------|
| P1 | **Tax Deduction Finder** | Scans transactions for potential IRS deductions |
| P1 | **Tax Calendar & Alerts** | Proactive reminders for Portuguese tax deadlines |
| P1 | **Investment Tax Optimization** | "Selling Stock X before Dec 31 saves €560" |
| P1 | **Tax Harvesting Alerts** | Identifies loss-harvesting opportunities |
| P1 | **IRS Q&A** | Natural language: "Can I deduct my home office?" |

#### 📈 Investment Analysis
| Priority | Feature | Description |
|----------|---------|-------------|
| P1 | **Portfolio Overview** | Unified view across all brokers |
| P1 | **Risk Analysis** | "Your portfolio is 90% tech stocks — here's the risk" |
| P1 | **Diversification Recommendations** | Contextual advice with explanations |
| P1 | **Performance Tracking** | Returns vs benchmarks, adjusted for PT taxes |

#### 🏠 Debt Destroyer
| Priority | Feature | Description |
|----------|---------|-------------|
| P1 | **Debt Overview** | All debts in one place: credit cards, loans, mortgage |
| P1 | **Payoff Strategy Comparison** | Avalanche vs Snowball with YOUR numbers |
| P1 | **Extra Payment Simulator** | "Paying €200 extra/month saves €12,400 in interest" |
| P1 | **Loan Advisor** | Compare bank proposals, reveal true costs |

#### 🎯 Goals & FIRE
| Priority | Feature | Description |
|----------|---------|-------------|
| P1 | **Savings Goals** | Vacation, car, gifts — visual progress tracking |
| P1 | **Emergency Fund Calculator** | Based on actual expenses |
| P1 | **FIRE Calculator** | Track financial independence, projected retirement date |
| P1 | **"What If" Simulator** | "What if I save €500 more monthly?" scenarios |

#### 🧠 Financial Literacy
| Priority | Feature | Description |
|----------|---------|-------------|
| P1 | **Contextual Micro-Lessons** | 2-minute lessons triggered by user situations |
| P1 | **Concept Explanations** | Teach WHY, not just WHAT |
| P1 | **Progress-Based Learning** | Unlocks deeper content as engagement grows |

#### 💬 Conversational Interface
| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | **Natural Language Chat** | Ask Cora anything about your finances |
| P0 | **Rich Responses** | Graphs, lists, tables, comparisons in chat |
| P1 | **Push Notifications** | Proactive alerts when something matters |
| P0 | **Dashboard View** | At-a-glance financial health overview |

#### 🎙️ Onboarding & Personalization
| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | **Conversational Onboarding** | Cora interviews user to learn preferences |
| P0 | **Comfort Floor Setup** | Define and track your mental safety net |
| P0 | **Goals & Worries Capture** | Personalize advice based on what matters |
| P0 | **Risk Tolerance Assessment** | Tailor investment guidance |

### Out of Scope for MVP

| Feature | Why Deferred |
|---------|-------------|
| Voice interface | "Jarvis mode" — build after core UX is solid |
| Multi-language support | Portuguese and English first, other EU languages later |
| Native mobile apps | PWA first, native when user base justifies |

### MVP Success Criteria

**Ricar's Full Test:**
1. ✅ I import my bank statements and Cora categorizes 80%+ correctly
2. ✅ I see a complete picture of spending, investments, and debts in one dashboard
3. ✅ Cora proactively tells me about tax optimization opportunities
4. ✅ I can ask any financial question and get a useful, PT-specific answer
5. ✅ My investment portfolio is analyzed with risk and tax context
6. ✅ I have a clear debt payoff strategy with real numbers
7. ✅ I'm tracking savings goals and FIRE progress
8. ✅ I learn something new about finance each week through micro-lessons
9. ✅ Financial anxiety is replaced with confidence and clarity

### Future Vision (Post-MVP)

**v2: Jarvis Mode**
- Voice interface for hands-free interaction
- Predictive financial guidance
- Full financial autopilot

**v3: EU Expansion**
- Spain, France, Germany tax systems
- Multi-language support
- Country-specific bank integrations

---

## Technical Preferences

### Platform
- **Web Application** (Primary) — Accessible anywhere, no app store approval needed
- **Progressive Web App (PWA)** — Installable, push notifications, offline capability
- **Mobile Apps** (Future) — Native iOS/Android when user base justifies

### Technology Considerations
- Modern web stack (React/Vue/Svelte for frontend)
- AI/LLM integration for conversational interface and categorization
- Secure data storage (user's financial data is sensitive)
- PDF parsing for bank statement import
- Chart/visualization library for rich data display

### Data Privacy
- User data stored securely, encrypted at rest
- No selling of user data
- GDPR compliant (EU requirement)
- Option for local-only storage in future

---

## Risks and Assumptions

### Key Assumptions
- Portuguese users are underserved by current finance apps ✓
- AI can accurately categorize Portuguese bank transactions (needs validation)
- Users will import bank statements manually if the value is clear
- Portuguese tax knowledge can be encoded into AI guidance

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **AI categorization accuracy** | Users frustrated if too many errors | Start with common categories, learn from corrections |
| **Bank statement format variety** | Each bank has different export formats | Support major PT banks first (Moey, ActivoBank, CGD, Millennium) |
| **Tax advice liability** | Legal risk if advice is wrong | Clear disclaimers: "educational, not financial advice" |
| **Scope creep** | Never ship if too ambitious | Strict MVP, launch fast, iterate |
| **User adoption** | Build it and no one comes | Building for self first validates core value |

---

## Open Questions

- Which Portuguese banks have the cleanest export formats to support first?
- What LLM/AI approach for Portuguese financial categorization?
- Regulatory requirements for financial tools in Portugal (if any)?
- Freemium pricing model for eventual commercialization?

---

_This Product Brief captures the vision and requirements for cora-finance._

_Created: 2025-11-27 through collaborative discovery with Ricar._

_This is a personal-first project with commercial potential for the underserved Portuguese market._

_Next: PRD will transform this brief into detailed product requirements._
