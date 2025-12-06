# Story 6.4: PWA Installation & Offline Mode

**Status:** Done
**Epic:** 6. Polish & Proactive Reach
**Story:**
**As a** User,
**I want** to install Cora on my phone and access my data even with spotty internet,
**So that** it feels like a native app and is always accessible.

## Acceptance Criteria
1.  [x] **Manifest:** Configure `manifest.json` with:
    *   Name: "Cora Finance"
    *   Theme Color: `#0D9488` (Oceanic Teal)
    *   Display: `standalone` (No browser UI)
    *   Icons: Standard set (192, 512, maskable).
2.  [x] **Service Worker (Caching):** Updated `public/sw.js` to cache the App Shell and API responses using `stale-while-revalidate`.
3.  [x] **Offline Indicator:** Created `src/components/shared/network-status.tsx` and integrated into `app/layout.tsx`. Also disabled server-bound actions (upload, save preferences) when offline as example usage.
    *   If offline: Show a subtle "You are offline. Viewing cached data." banner.
    *   Disable actions that require server (e.g., "Save Transaction", "Upload PDF").
4.  [x] **Install Prompt:** Created `src/components/shared/install-prompt.tsx`, integrated into layout, and added iOS fallback.
5.  [x] **Meta Tags:** Added `app/head.tsx` with `manifest`, theme color, Apple meta tags, and icons.
**Dev Notes:**
- The service worker is manually registered at runtime by `src/components/shared/sw-register.tsx` and also during subscription flow in `NotificationManager`.
- All PWA assets are placed in `public/icons/*` and `public/manifest.json`.
- Testing: Build locally, go offline in DevTools, refresh, verify app shell loads and the 'You are offline' banner appears.


## Dev Notes (Context)

**1. Manifest Location:**
`/app/manifest.ts` (Next.js App Router dynamic manifest) OR `/public/manifest.json`.
*   *Preference:* `manifest.ts` allows using environment variables if needed, but static JSON is fine.

**2. Caching Strategy (Workbox or Manual):**
Since we already touched `sw.js` in Story 6.1 for Push, we need to be careful not to overwrite it.
*   *Recommendation:* Use `@ducanh2912/next-pwa` (a maintained fork of `next-pwa`) which handles the caching complexity and allows a `customWorkerDir` to include our Push logic.
*   *Alternative (Manual):* Just cache the static assets. For API calls (`/api/dashboard`), use `stale-while-revalidate`.

**3. Offline Detection Hook:**

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    // Add event listeners for 'online' and 'offline'
    // Update state
  }, []);
  return isOnline;
}

**4. iOS Quirks:**
iOS doesn't fully support the "Install Prompt" event programmatically.
*   *UI Logic:* If iOS detected, show a "How to Install" drawer (Tap Share -> Add to Home Screen).
*   If Android/Desktop, show the button linked to `beforeinstallprompt` event.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-6.4-pwa-offline"
  title: "PWA Installation & Offline Mode"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "@ducanh2912/next-pwa" (Recommended for App Router)
  shadcn_components_to_add:
    - "alert" (for offline banner)
    - "drawer" (for iOS instructions)
  folder_structure:
    - "/app/manifest.ts"
    - "/components/shared/network-status.tsx"
    - "/components/shared/install-prompt.tsx"
    - "/next.config.js" (Update for PWA plugin)
  assets_required:
    - "Generate placeholder icons in /public/icons (192x192, 512x512)"
  verify: "Build app. Go Offline (DevTools). Refresh. App should load. 'You are offline' banner should appear."
