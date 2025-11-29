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