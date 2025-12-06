# Epic 6: Polish & Proactive Reach (The Delight)

**Goal:** Implement proactive communication channels (Web Push), finalize security/privacy features (GDPR), and apply the final layer of UI/UX polish to ensure the app feels native and trustworthy.
**Prerequisites:** Epic 3 complete (Insight Engine).

## Stories

### Story 6.1: Web Push Notification Infrastructure
**As a** System,
**I want** to send encrypted notifications to the user's device,
**So that** I can alert them about urgent financial matters even when the app is closed.

**Acceptance Criteria:**
1.  Configure VAPID keys and `web-push` library on the server.
2.  Implement Service Worker registration in Next.js.
3.  Create "Enable Notifications" UI flow (Browser permission request).
4.  Save `PushSubscription` object to `profiles` table.
5.  **Test:** Trigger a test notification from the server and receive it on mobile/desktop.

### Story 6.2: Notification Logic & Settings
**As a** User,
**I want** to control what Cora notifies me about,
**So that** I don't feel spammed.

**Acceptance Criteria:**
1.  Create "Notification Settings" page.
2.  Toggles for: Urgent Alerts, Tax Deadlines, Weekly Summaries, Opportunities.
3.  **Logic:** Update Insight Engine to check user preferences before sending Push.
4.  **Quiet Hours:** Do not send non-urgent notifications between 10 PM and 8 AM.

### Story 6.3: Privacy Shield & GDPR Compliance
**As a** User,
**I want** to see proof that my data is secure and have control over it,
**So that** I trust the application.

**Acceptance Criteria:**
1.  Implement `PrivacyShield` component in the Sidebar/Settings (Green Lock Icon + "Encrypted" status).
2.  **Data Export:** Create "Download My Data" button (JSON export of all user tables).
3.  **Right to be Forgotten:** Create "Delete Account" flow (Hard delete of all rows in Supabase).
4.  **API:** Endpoint `/api/status/privacy` confirms active RLS and SSL connection.

### Story 6.4: PWA Installation & Offline Mode
**As a** User,
**I want** to install Cora as an app on my phone,
**So that** it feels native and works when I have bad signal.

**Acceptance Criteria:**
1.  Configure `manifest.json` with icons, theme colors ("Oceanic Trust"), and display mode.
2.  Configure Service Worker caching strategy (Stale-While-Revalidate) for dashboard data.
3.  **Offline UI:** If offline, show cached data with a "You are offline" indicator, disable actions that require server.
4.  **Install Prompt:** Show custom "Install Cora" button if browser supports it.

### Story 6.5: Portuguese Localization & Formatting
**As a** User,
**I want** the app to feel natively Portuguese,
**So that** I don't feel like I'm using a translated US app.

**Acceptance Criteria:**
1.  **Strict Currency:** Ensure ALL numbers use `Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })`. (e.g., `1.234,56 €`).
2.  **Dates:** Ensure all dates use `DD/MM/YYYY` format.
3.  **Copy Review:** Verify all AI prompts and UI text use natural European Portuguese (PT-PT), not Brazilian Portuguese.

### Story 6.6: UX Micro-Interactions (Delight)
**As a** User,
**I want** the interface to feel alive and responsive,
**So that** managing money feels less tedious.

**Acceptance Criteria:**
1.  **Cora Avatar:** Implement "Thinking" and "Speaking" animation states during AI processing.
2.  **Confetti:** Trigger confetti animation when a Goal is reached or Debt is paid off.
3.  **Skeletons:** Ensure smooth loading states for all dashboards (no layout shift).
4.  **Toast:** Use specific "Success" toasts for bulk actions ("Updated 5 transactions").

---

## Agent Orchestration Stories (Cora as Central Assistant)

### Story 6.7: Cora-Centric Home Page Redesign
**As a** user,
**I want** the home page to feel like Cora is greeting me and telling me what matters,
**So that** I get instant value without navigating around.

**Acceptance Criteria:**
1.  **Hero section is Cora speaking** — Avatar + personalized greeting + top insight in natural language.
2.  Insight Feed is primary content (above dashboard widgets).
3.  Each insight card uses Cora's voice ("I noticed...", "You might want to...").
4.  **Guided prompt at bottom**: Context-aware next step (no accounts → "Let's add your first account"; no transactions → "Upload a statement to get started"; all good → "You're all caught up!").
5.  Chat input always visible at bottom (sticky footer on mobile).
6.  Layout: Cora Hero → Insight Feed → Quick Stats → Chat Input.

### Story 6.8: Contextual Next-Step Prompts
**As a** user who just completed an action,
**I want** Cora to tell me what to do next,
**So that** I don't feel lost in the app.

**Acceptance Criteria:**
1.  After account creation → Cora says "Great! Now upload a statement for this account."
2.  After statement upload → Cora says "I found X transactions. Want to review the categories?"
3.  After onboarding complete → Cora says "Let's connect your first bank account."
4.  After bulk categorization → Cora says "Nice! Your spending insights are updating..."
5.  After goal creation → Cora says "I'll track your progress and remind you along the way."
6.  After debt entry → Cora says "I'll calculate the best payoff strategy for you."
7.  Implementation: Reusable `<CoraPrompt message="..." action="..." href="..." />` component.

### Story 6.9: Omnipresent Cora Header
**As a** user,
**I want** to see Cora's avatar and a contextual message on every main screen,
**So that** she feels like my personal assistant throughout the entire app.

**Acceptance Criteria:**
1.  Create reusable `<CoraHeader context="..." />` component.
2.  **Contexts and messages:**
    - `home`: Personalized greeting + top insight summary
    - `dashboard`: "Here's your spending breakdown for this period."
    - `portfolio`: "Your investments at a glance. [insight if available]"
    - `planning/goals`: "You have X active goals. [progress summary]"
    - `planning/debt`: "Let's tackle your debt together. [strategy hint]"
    - `planning/taxes`: "Tax season prep: [status or next deadline]."
    - `forecast`: "Here's what I predict for your cash flow."
    - `learn`: "Building financial literacy, one lesson at a time."
    - `data`: "Your accounts and transaction data live here."
    - `settings`: "Customize how I work for you."
3.  Each context can optionally fetch a relevant proactive snippet from the insight engine.
4.  Avatar uses appropriate state (idle, thinking if loading).
5.  Tapping Cora header opens chat with context pre-filled.

### Story 6.10: AI-Powered Onboarding Conversation
**As a** new user,
**I want** Cora to have a real AI conversation with me during onboarding,
**So that** I feel I'm talking to an intelligent assistant, not filling out a form.

**Acceptance Criteria:**
1.  Replace canned Portuguese responses with LLM-generated responses via `sendMessage()` or new `generateOnboardingResponse()` action.
2.  Cora adapts her language and follow-up questions based on user responses.
3.  Cora explains WHY each question matters ("Your comfort floor helps me alert you before you overspend...").
4.  Cora summarizes what she learned at the end ("So you're focused on saving for a house, you're moderate risk, and your floor is €500. Got it!").
5.  System prompt includes onboarding context so AI stays on track.
6.  **Fallback:** If AI call fails, graceful degradation to current wizard flow.
7.  Conversation history saved to DB for continuity.