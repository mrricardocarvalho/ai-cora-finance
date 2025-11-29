# Story 1.2: Database Schema & Auth Setup

**Status:** Approved
**Epic:** 1. Foundation & Core Infrastructure
**Story:**
**As a** Developer,
**I want** to configure Supabase Authentication and the initial Database Schema,
**So that** users can securely sign up, log in, and have a profile record created automatically.

## Acceptance Criteria
1.  [x] **Environment:** Supabase environment variables added to `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) — configure actual values in .env.
2.  [x] **Dependencies:** `@supabase/ssr` and `@supabase/supabase-js` added to the project (installed or present in devDependencies).
3.  [x] **Auth Client:** Supabase Browser Client and Server Client utilities created in `src/lib/supabase` (`client.ts`, `server.ts`).
4.  [x] **Middleware:** Next.js `middleware.ts` implemented to redirect unauthenticated requests to `/login` for the protected routes.
5.  [x] **Schema:** Drizzle schema defined for the `profiles` table in `src/db/schema.ts` (drizzle types used, id primary key and required fields defined).
6.  [x] **Migration:** SQL migration created in `db/migrations/0001_init_profiles.sql` for the profiles table, policies, and trigger. Applying to Supabase requires credentials.
7.  [x] **Triggers:** Migration contains a trigger function (`handle_new_auth_user`) and trigger (`insert_profile_after_insert`) to insert profile on `auth.users` insert.
8.  [x] **UI:** Basic Login/Signup page created at `/login` (`src/app/login/page.tsx`) using local `Button` placeholder components (run `npx shadcn-ui@latest init` to fully adopt shadcn/ui components).

## Dev Notes (Context)

**1. Tech Stack Additions:**
*   **Auth:** Use `@supabase/ssr` (The modern standard for Next.js App Router).
*   **Database:** Drizzle ORM (postgres-js driver recommended for serverless).

**2. Schema Definition (`profiles`):**
Reference `docs/architecture.md` Section 4.1.
typescript
// db/schema.ts
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => auth.users.id, { onDelete: "cascade" }),
  email: text("email"), // Optional, useful for display
  comfort_floor: decimal("comfort_floor", { precision: 10, scale: 2 }).default("0"),
  risk_tolerance: text("risk_tolerance"), // Enum: 'low', 'medium', 'high'
  onboarding_completed: boolean("onboarding_completed").default(false),
  onboarding_step: integer("onboarding_step").default(1),
  currency: text("currency").default("EUR"),
  updated_at: timestamp("updated_at").defaultNow(),
});

**3. The "User Creation" Trigger (Critical):**
Since we are using Supabase Auth, we need a PostgreSQL trigger to sync the Auth User to our Public Profile table.
*   *SQL Logic:* `after insert on auth.users` -> `insert into public.profiles (id, email) values (new.id, new.email)`

**4. RLS Policies:**
*   Enable RLS on `profiles`.
*   Policy: "Users can view own profile" -> `auth.uid() = id`.
*   Policy: "Users can update own profile" -> `auth.uid() = id`.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James when you hand him the story.

yaml
Provide:
  story_id: "story-1.2-auth"
  title: "Database Schema & Auth Setup"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  next_version: "14"
  dependencies:
    - "@supabase/ssr"
    - "@supabase/supabase-js"
    - "postgres"
    - "drizzle-orm"
    - "dotenv"
  devDependencies:
    - "drizzle-kit"
    - "@types/pg"
  env_vars_required:
    - "NEXT_PUBLIC_SUPABASE_URL"
    - "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    - "DATABASE_URL" (Transaction connection pooler for Drizzle)
  folder_structure:
    - "/lib/supabase" (for client/server clients)
    - "/db" (for schema.ts)
    - "/app/auth" (for callback route)
    - "/app/login" (for UI)
    - "/middleware.ts"
  schema_requirements:
    table: "profiles"
    fields: [id, email, comfort_floor, risk_tolerance, onboarding_completed, onboarding_step, currency]
    rls: true
  auth_flow: "Email/Password"
  verify: "Able to sign up a new user at /login and see the record in Supabase 'profiles' table."
