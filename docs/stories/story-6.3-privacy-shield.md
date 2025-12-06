# Story 6.3: Privacy Shield & GDPR Compliance

**Status:** Done
**Epic:** 6. Polish & Proactive Reach
**Story:**
**As a** User,
**I want** visual confirmation that my data is secure and full control over my data (Export/Delete),
**So that** I trust Cora with my financial life and know I am not locked in.

## Acceptance Criteria
1.  [x] **Privacy Status API:** Create an API route `/api/status/privacy` that verifies:
    *   SSL Connection is active.
    *   Database connection is active.
    *   RLS (Row Level Security) is enabled on the `transactions` table (query `pg_policies` or similar check).
2.  [x] **Privacy Shield UI:** Create `PrivacyShield` component (Sidebar/Settings).
    *   **State:** Call the API. If all checks pass -> Green Lock "Encrypted". If fail -> Red "Check Security".
    *   **Tooltip:** "Your data is encrypted at rest and isolated via RLS."
3.  [x] **Data Export:** Implement `exportUserData` Server Action.
    *   Fetch all user data (Profile, Accounts, Transactions, Investments, Goals).
    *   Bundle into a JSON file.
    *   Trigger browser download.
4.  [x] **Account Deletion (Danger Zone):** Create "Delete Account" flow in Settings.

## Implementation Notes

- Files added/updated: `src/app/api/status/privacy/route.ts`, `src/components/shared/PrivacyShield.tsx`, `src/lib/actions/user-data.ts`, `src/app/api/user/export/route.ts`, `src/app/api/user/delete/route.ts`, `src/lib/supabase/admin.ts`, `src/app/settings/data/page.tsx`.
- Privacy API: Checks TLS via header / URL and DB connectivity; attempts to query `pg_policies` to detect RLS on `transactions`.
- Privacy Shield: Renders status (Green Lock or Red) in the Sidebar and Settings page, with a small tooltip and region display.
- Export: `exportUserData` collects profile, accounts, transactions, investments and goals and returns them as a JSON export via `/api/user/export`.
- Delete Account: `deleteAccountAndUser` uses the Supabase Admin (service role) key to delete the user (`admin.auth.deleteUser`) from `auth.users`. The UI requires typing `DELETE` before performing the action.
- Security: The `SUPABASE_SERVICE_ROLE_KEY` must be present on the server — never expose it to the client.

    *   **UX:** Require typing "DELETE" to confirm.
    *   **Action:** Delete the user from `auth.users` (Supabase Admin) which cascades to all public tables via FK constraints.
    *   **Cleanup:** Ensure no orphaned data remains.

## Dev Notes (Context)

**1. Privacy API Logic:**
For the MVP, a "True" check is sufficient, but checking RLS metadata is a nice "Proof of Life".

// app/api/status/privacy/route.ts
export async function GET() {
  // 1. Check if we are on HTTPS (req.url)
  // 2. Simple DB query to ensure connection
  return NextResponse.json({ 
    encrypted: true, 
    rls_enabled: true, 
    region: 'eu-west-1' 
  });
}


**2. Data Export:**
Don't generate a PDF (too hard). Generate a structured JSON.

const exportData = {
  profile: { ... },
  accounts: [ ... ],
  transactions: [ ... ]
};
// Return as Blob/File to client

**3. Deletion (Supabase Admin):**
You need the `service_role` key to delete a user from `auth.users`.
*   *Security Warning:* Do NOT expose the service role key to the client. Use a Server Action.
*   `await supabaseAdmin.auth.admin.deleteUser(userId)`

**4. UI Location:**
*   **Shield:** Bottom of Sidebar (Desktop), Top of Settings (Mobile).
*   **GDPR Actions:** `/settings/security` or `/settings/data`.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-6.3-privacy-shield"
  title: "Privacy Shield & GDPR Compliance"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "@supabase/supabase-js" (Admin client)
  env_vars_required:
    - "SUPABASE_SERVICE_ROLE_KEY" (New! For deletion)
  shadcn_components_to_add:
    - "tooltip"
    - "alert-dialog"
    - "badge"
  folder_structure:
    - "/components/shared/privacy-shield.tsx"
    - "/app/(dashboard)/settings/data/page.tsx"
    - "/lib/actions/user-data.ts"
    - "/app/api/status/privacy/route.ts"
  verify: "Click Export Data -> Download JSON. Click Delete Account -> User deleted from Auth and redirected to Login."