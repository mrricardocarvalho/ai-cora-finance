# Story 6.1: Web Push Notification Infrastructure

**Status:** Approved
**Epic:** 6. Polish & Proactive Reach
**Story:**
**As a** System,
**I want** to establish a secure channel to send encrypted notifications to the user's device,
**So that** I can alert them about urgent financial matters even when the app is closed.

## Acceptance Criteria
1.  [ ] **VAPID Configuration:** Generate VAPID Public/Private keys and configure them in Environment Variables (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).
2.  [ ] **Service Worker:** Ensure a Service Worker (`sw.js`) is registered in the Next.js app (using `next-pwa` or manual registration) to handle the `push` event.
3.  [ ] **Subscription UI:** Create a "Enable Notifications" button/toggle in the Settings page.
    *   On click: Request Browser Permission -> Get PushSubscription -> Send to Server.
4.  [ ] **Database Storage:** Update `profiles` table (if not already done in 1.2/4.1) to store the `push_subscription` JSON object.
5.  [ ] **Backend Sender:** Implement `sendNotification(userId, title, body)` utility using the `web-push` library.
6.  [ ] **Test:** Create a hidden/dev-only button "Send Test Notification" that triggers a real push to the current device.

## Dev Notes (Context)

**1. VAPID Keys:**
You need to generate these once.
Run: `npx web-push generate-vapid-keys`
Save output to `.env.local`.

**2. Service Worker Logic (`public/custom-sw.js`):**

self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: data.url }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

**3. Database Schema:**
Ensure `profiles` has a column:
`push_subscription: jsonb("push_subscription")`

**4. Security:**
*   Never expose the Private Key to the client.
*   The `sendNotification` function must run on the server (Server Action).

**5. Library:**
Use `web-push` for the Node.js backend.

import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@corafinance.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);


---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-6.1-web-push"
  title: "Web Push Notification Infrastructure"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "web-push"
    - "next-pwa" (optional, or manual sw setup)
  devDependencies:
    - "@types/web-push"
  env_vars_required:
    - "NEXT_PUBLIC_VAPID_PUBLIC_KEY"
    - "VAPID_PRIVATE_KEY"
    - "NEXT_PUBLIC_APP_URL"
  folder_structure:
    - "/public/sw.js" (Service Worker)
    - "/lib/services/notifications.ts" (Sender logic)
    - "/components/settings/notification-manager.tsx" (UI)
    - "/app/manifest.json" (Ensure gcm_sender_id is set if needed, usually not for VAPID)
  verify: "Click 'Enable Notifications'. Allow permission. Click 'Test Send'. Phone/Desktop should show a system notification."