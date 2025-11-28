# Cora Finance - Product Requirements Document

**Author:** Ricar
**Date:** 2025-11-27
**Version:** 1.0

---

## Executive Summary

Cora Finance is an AI-powered personal finance assistant built specifically for Portuguese tax residents. The product addresses a fundamental gap in the market: while US-centric apps like Mint and YNAB dominate globally, they fail to understand Portuguese tax law (IRS), local banking systems (Moey, ActivoBank, CGD), or EU investment brokers (XTB, Trading212, Degiro).

The core insight driving Cora is that most people don't budget because it's exhausting and boring. They rely on mental rules like "don't go below €X" while leaving significant money on the table through missed tax optimizations, suboptimal investments, and invisible recurring expenses. Cora watches your money so you don't have to — proactively surfacing insights, recommendations, and alerts in natural language.

This is a personal-first project with commercial potential, solving the author's own problem before expanding to the underserved Portuguese market.

### What Makes This Special

**Portugal-First Intelligence.** Cora isn't a translated American app — it's built from the ground up with Portuguese tax law, banking systems, and EU investment regulations as first-class citizens. The compelling moment isn't "here's a pie chart of your spending" — it's **"You're leaving €847 on the table this year in IRS deductions you didn't claim."**

The unique value proposition:
- **Proactive, not reactive** — Cora comes to you with insights; you don't dig
- **Tax-aware** — Every financial decision is contextualized with Portuguese IRS implications
- **Personalized** — Learns your comfort floor, goals, worries, and risk tolerance
- **Educational** — Teaches WHY, not just WHAT, building financial literacy over time

---

## Project Classification

**Technical Type:** Web Application (PWA)
**Domain:** Fintech (Personal Finance)
**Complexity:** High

### Classification Rationale

**Web Application (PWA):**
- Browser-first for universal access without app store friction
- Progressive Web App for installability, push notifications, and offline capability
- Mobile-responsive design with touch-first interactions
- Native mobile apps deferred until user base justifies platform investment

**Fintech Domain - High Complexity:**
- Handles sensitive financial data requiring robust security
- Must comply with GDPR for EU data protection
- Educational financial guidance requires clear disclaimers (not financial advice)
- Portuguese tax law integration demands accuracy and regular updates
- Bank statement parsing across multiple institution formats
- Investment portfolio aggregation across EU brokers

### Domain Context

**Regulatory Landscape (Portugal/EU):**
- **GDPR:** Mandatory for any EU service handling personal data. Cora must provide data export, deletion rights, and transparent data usage policies.
- **PSD2/Open Banking:** Enables future API connections to Portuguese banks, though initial MVP uses manual statement import.
- **Financial Advice Disclaimer:** Cora provides educational guidance, not regulated financial advice. Clear disclaimers are required throughout.
- **IRS (Portuguese Tax Authority):** Tax optimization features must accurately reflect current Portuguese tax law. Annual updates required during tax season.

**Banking & Investment Ecosystem:**
- **Portuguese Banks:** Moey (digital-native, clean exports), ActivoBank (tech-friendly), CGD, Millennium BCP (legacy formats)
- **EU Brokers:** XTB, Trading212, Degiro — each with different export formats and tax reporting
- **Tax Considerations:** Capital gains tax, dividend taxation, tax-loss harvesting opportunities, IRS deduction categories

---

## Success Criteria

### Personal Success (Primary - This is for Ricar first)

| Criterion | Measurement |
|-----------|-------------|
| **Weekly Active Usage** | Ricar opens Cora at least once per week (not abandoned like other finance apps) |
| **Spending Visibility** | Clear understanding of where money goes each month, categorized meaningfully |
| **Tax Optimization Value** | At least one actionable tax optimization discovered per year (worth €100+) |
| **Reduced Financial Anxiety** | Confidence in financial health replaces vague worry |
| **Investment Clarity** | Understanding of portfolio risk, diversification, and tax implications |

### Product Success (If Commercialized)

| Metric | Target |
|--------|--------|
| **Retention** | 60%+ monthly active users after 3 months |
| **Engagement** | Average 3+ meaningful interactions per week |
| **Value Delivered** | Users report saving/optimizing €500+ annually |
| **NPS** | 50+ (users would recommend to friends) |
| **Conversion** | 10%+ free users convert to premium features |

---

## Product Scope

### MVP - Minimum Viable Product

The MVP philosophy for Cora Finance is ambitious by design: **build the full vision**. With AI-assisted development and this being a personal-first project, there's no artificial constraint to "ship something small." The goal is to build what Ricar actually needs to replace financial anxiety with confidence.

**P0 Features (Must Have for Launch):**

| Category | Features |
|----------|----------|
| **Data & Accounts** | Bank statement PDF import with AI parsing, smart auto-categorization, categorization review UI, multi-account dashboard |
| **Conversational Interface** | Natural language chat, rich responses (graphs, lists, tables), dashboard view |
| **Onboarding** | Conversational onboarding interview, comfort floor setup, goals & worries capture, risk tolerance assessment |
| **Insights** | Spending dashboard, financial health score (0-100) |

**P1 Features (Full Vision):**

| Category | Features |
|----------|----------|
| **Advanced Insights** | Invisible spending detector, anomaly detection, floor alert system, cash flow forecasting |
| **Tax Intelligence** | Tax deduction finder, tax calendar & alerts, investment tax optimization, tax harvesting alerts, IRS Q&A |
| **Investment Analysis** | Portfolio overview, risk analysis, diversification recommendations, performance tracking |
| **Debt Management** | Debt overview, payoff strategy comparison, extra payment simulator, loan advisor |
| **Goals & FIRE** | Savings goals, emergency fund calculator, FIRE calculator, "what if" simulator |
| **Financial Literacy** | Contextual micro-lessons, concept explanations, progress-based learning |
| **Notifications** | Push notifications for proactive alerts |
| **API Connections** | Direct connections to Moey, ActivoBank, XTB, Trading212, Degiro |

### Growth Features (Post-MVP)

| Feature | Description |
|---------|-------------|
| **Voice Interface** | "Jarvis mode" — hands-free interaction with Cora |
| **Predictive Guidance** | Proactive financial recommendations before you ask |
| **Multi-Language** | Spanish, French, German for EU expansion |
| **Native Mobile Apps** | iOS and Android when user base justifies |
| **Collaborative Features** | Shared household finances, partner access |

### Vision (Future)

| Phase | Focus |
|-------|-------|
| **v2: Jarvis Mode** | Voice interface, predictive guidance, full financial autopilot |
| **v3: EU Expansion** | Spain, France, Germany tax systems, country-specific integrations |
| **v4: Financial Autopilot** | AI-driven automatic optimization with user approval |

---

## Fintech Domain Requirements

### Compliance & Regulatory

| Requirement | Description |
|-------------|-------------|
| **GDPR Compliance** | Full EU data protection: consent management, data portability, right to deletion, privacy policy |
| **Financial Advice Disclaimer** | Clear messaging throughout: "Educational guidance, not regulated financial advice" |
| **Data Security** | Encryption at rest and in transit, secure authentication, audit logging |
| **Tax Accuracy Disclaimer** | Tax suggestions are informational; users should verify with tax professionals |

### Security Architecture

| Aspect | Requirement |
|--------|-------------|
| **Authentication** | Secure login with optional 2FA, session management |
| **Data Encryption** | AES-256 for data at rest, TLS 1.3 for transit |
| **Access Control** | User data isolation, no cross-user data access |
| **Audit Trail** | Log all data access and modifications |
| **Backup & Recovery** | Regular encrypted backups, disaster recovery plan |

### Fraud Prevention

| Measure | Description |
|---------|-------------|
| **Input Validation** | Sanitize all uploaded files, validate PDF structure |
| **Rate Limiting** | Prevent abuse of AI features and file uploads |
| **Anomaly Detection** | Flag suspicious account activity patterns |

---

## Web Application Specific Requirements

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| Mobile browsers | iOS Safari, Chrome Android |

### PWA Capabilities

| Feature | Requirement |
|---------|-------------|
| **Installability** | Web app manifest, service worker, install prompt |
| **Offline Support** | Cache critical assets, show cached data when offline |
| **Push Notifications** | Web push for proactive alerts (P1) |
| **Responsive Design** | Mobile-first, works on all screen sizes |

### Performance Targets

| Metric | Target |
|--------|--------|
| **First Contentful Paint** | < 1.5s |
| **Time to Interactive** | < 3s |
| **Lighthouse Score** | > 90 (Performance, Accessibility, Best Practices) |
| **Bundle Size** | < 500KB initial load |

---

## User Experience Principles

### Design Philosophy

Cora should feel like a **knowledgeable friend who happens to be a financial expert** — not a cold banking app or an overwhelming spreadsheet.

| Principle | Manifestation |
|-----------|---------------|
| **Conversational First** | Chat is the primary interface; dashboard supplements it |
| **Proactive, Not Passive** | Cora speaks up when something matters; users don't dig |
| **Explain, Don't Dictate** | Every recommendation includes WHY, building understanding |
| **Calm Confidence** | Reduce anxiety through clarity, not overwhelm with data |
| **Portuguese Native** | Natural Portuguese language, PT-specific examples and context |

### Key Interactions

| Interaction | Design Intent |
|-------------|---------------|
| **Onboarding Interview** | Conversational, warm, not a form — Cora asks and listens |
| **Statement Upload** | Drag-and-drop simplicity, clear progress, immediate feedback |
| **Category Correction** | Quick swipe/tap to fix AI mistakes, learning confirmation |
| **Chat Interface** | Natural language input, rich visual responses, suggested questions |
| **Dashboard** | Glanceable health score, drill-down for details, no clutter |
| **Alerts** | Contextual, actionable, not spammy — respect attention |

---

## Functional Requirements

### User Account & Access

- **FR1:** Users can create accounts using email and password
- **FR2:** Users can log in securely and maintain sessions across devices
- **FR3:** Users can reset passwords via email verification
- **FR4:** Users can update profile information and preferences
- **FR5:** Users can delete their account and all associated data (GDPR)
- **FR6:** Users can export all their data in a portable format (GDPR)

### Onboarding & Personalization

- **FR7:** Cora conducts a conversational onboarding interview upon first login
- **FR8:** Users can define their comfort floor (minimum balance threshold)
- **FR9:** Users can capture their financial goals and worries
- **FR10:** Users can complete a risk tolerance assessment for investment guidance
- **FR11:** Users can update their preferences and profile at any time
- **FR12:** Cora personalizes all advice based on captured user context

### Data Import & Management

- **FR13:** Users can upload bank statement PDFs for parsing
- **FR14:** System parses PDF statements using AI and extracts transactions
- **FR15:** System auto-categorizes transactions with confidence scoring
- **FR16:** Users can review and correct AI categorization decisions
- **FR17:** System learns from user corrections to improve future categorization
- **FR18:** Users can manually add transactions not in statements
- **FR19:** Users can manually add investment holdings and positions
- **FR20:** Users can manually add debts (loans, credit cards, mortgage)
- **FR21:** Users can manage multiple bank accounts in unified view
- **FR22:** Users can connect to banks/brokers via API (P1: Moey, ActivoBank, XTB, Trading212, Degiro)

### Conversational Interface

- **FR23:** Users can ask Cora questions in natural Portuguese or English
- **FR24:** Cora responds with contextual answers based on user's financial data
- **FR25:** Cora can display rich responses: charts, tables, lists, comparisons
- **FR26:** Cora suggests follow-up questions based on conversation context
- **FR27:** Users can access conversation history
- **FR28:** Cora proactively initiates conversations when insights are discovered

### Dashboard & Visualization

- **FR29:** Users see a unified dashboard showing all accounts, investments, and debts
- **FR30:** Dashboard displays financial health score (0-100) with explanation
- **FR31:** Users can view spending breakdown by category and time period
- **FR32:** Users can drill down into any category to see individual transactions
- **FR33:** Users can view net worth over time (assets minus liabilities)
- **FR34:** Users can toggle between different time views (week, month, year, all-time)

### Spending Insights

- **FR35:** System calculates spending patterns and trends automatically
- **FR36:** System detects invisible spending (forgotten subscriptions, recurring charges)
- **FR37:** System detects spending anomalies ("electricity 40% higher than usual")
- **FR38:** System tracks comfort floor and predicts when user will hit it
- **FR39:** System provides cash flow forecasting based on patterns
- **FR40:** Users receive alerts when approaching comfort floor

### Tax Intelligence (Portugal-Specific)

- **FR41:** System scans transactions for potential IRS tax deductions
- **FR42:** System maintains Portuguese tax calendar with key deadlines
- **FR43:** Users receive proactive alerts for upcoming tax deadlines
- **FR44:** System analyzes investment portfolio for tax optimization opportunities
- **FR45:** System identifies tax-loss harvesting opportunities
- **FR46:** Users can ask tax-related questions ("Can I deduct my home office?")
- **FR47:** Cora provides Portuguese tax context for all financial recommendations

### Investment Analysis

- **FR48:** Users can view unified portfolio across all brokers
- **FR49:** System analyzes portfolio risk and concentration
- **FR50:** System provides diversification recommendations with explanations
- **FR51:** System tracks investment performance vs benchmarks
- **FR52:** System calculates returns adjusted for Portuguese capital gains tax
- **FR53:** System explains investment concepts in educational format

### Debt Management

- **FR54:** Users can view all debts in unified overview
- **FR55:** System compares payoff strategies (Avalanche vs Snowball)
- **FR56:** System simulates extra payment scenarios with interest savings
- **FR57:** Users can input loan proposals for comparison
- **FR58:** System reveals true cost of loans (total interest, effective rate)
- **FR59:** System recommends optimal debt payoff order

### Goals & FIRE

- **FR60:** Users can create and track savings goals with deadlines
- **FR61:** System calculates emergency fund target based on actual expenses
- **FR62:** System tracks FIRE progress and projects retirement date
- **FR63:** Users can run "what if" scenarios (save more, earn more, spend less)
- **FR64:** System shows goal progress visually with projections

### Financial Literacy

- **FR65:** System delivers contextual micro-lessons triggered by user situations
- **FR66:** System explains financial concepts when making recommendations
- **FR67:** System tracks learning progress and unlocks deeper content
- **FR68:** Users can browse financial literacy content library

### Notifications (P1)

- **FR69:** Users can opt-in to push notifications
- **FR70:** System sends proactive alerts for important financial events
- **FR71:** Users can configure notification preferences and frequency
- **FR72:** Notifications are actionable with direct links to relevant context

---

## Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| **Page Load Time** | < 3 seconds on 4G connection |
| **Chat Response Time** | < 2 seconds for AI responses |
| **PDF Processing** | < 30 seconds for typical bank statement |
| **Search Response** | < 500ms for transaction search |
| **Dashboard Render** | < 1 second for initial dashboard load |

### Security

| Requirement | Implementation |
|-------------|----------------|
| **Data Encryption** | AES-256 at rest, TLS 1.3 in transit |
| **Authentication** | Secure password hashing (bcrypt/argon2), optional 2FA |
| **Session Management** | Secure tokens, automatic expiration, device tracking |
| **Input Validation** | Sanitize all inputs, prevent injection attacks |
| **File Upload Security** | Validate PDF structure, scan for malware, size limits |
| **API Security** | Rate limiting, authentication required, CORS configuration |

### Scalability

| Aspect | Approach |
|--------|----------|
| **Initial Scale** | Single user (Ricar) — no horizontal scaling needed |
| **Future Scale** | Architecture should support 1,000+ users with minimal changes |
| **Data Growth** | Efficient storage for years of transaction history |
| **AI Costs** | Monitor and optimize LLM API usage |

### Accessibility

| Requirement | Standard |
|-------------|----------|
| **WCAG Compliance** | Level AA minimum |
| **Keyboard Navigation** | Full functionality without mouse |
| **Screen Reader Support** | Semantic HTML, ARIA labels |
| **Color Contrast** | Minimum 4.5:1 ratio |
| **Text Sizing** | Responsive to user font size preferences |

### Integration

| Integration | Purpose |
|-------------|---------|
| **LLM API** | Conversational interface, transaction categorization, insights |
| **PDF Parser** | Extract transaction data from bank statements |
| **Push Notification Service** | Web push for proactive alerts |
| **Email Service** | Password reset, optional email notifications |
| **Future: Bank APIs** | PSD2/Open Banking connections (P1) |
| **Future: Broker APIs** | Investment data sync (P1) |

---

## Summary

Cora Finance transforms the frustrating experience of managing personal finances in Portugal into a calm, confident relationship with money. By combining AI-powered intelligence with deep Portuguese tax and banking context, Cora delivers what no existing app can: **proactive, personalized financial guidance that speaks your language and understands your rules.**

**Core Value Delivered:**
- 🎯 "I finally know where my money goes"
- 💰 "I'm not leaving money on the table anymore"
- 📊 "My investments make sense now"
- 😌 "Financial anxiety replaced with confidence"

---

_This PRD captures the complete requirements for Cora Finance._

_Created: 2025-11-27 through collaborative discovery between Ricar and AI PM._

_A Portugal-first personal finance assistant — built for Ricar, ready for Portugal._
