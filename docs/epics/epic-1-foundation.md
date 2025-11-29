# Epic 1: Foundation & Core Infrastructure

**Goal:** Initialize the Cora Finance PWA with a robust tech stack, secure authentication, and the core UI layout.
**Prerequisites:** Node.js, Supabase Project created.

## Stories

### Story 1.1: Project Initialization & Tech Stack
**As a** Developer,
**I want** to initialize the Next.js repository with the defined tech stack,
**So that** we have a solid foundation for development.

**Acceptance Criteria:**
1.  Initialize Next.js 14+ (App Router) with TypeScript.
2.  Install Tailwind CSS and `shadcn/ui`.
3.  Configure the "Oceanic Trust" color palette in `tailwind.config.ts` (Primary: #0D9488, etc.).
4.  Set up Drizzle ORM with Supabase connection.
5.  Configure `lucide-react` for icons.
6.  Repo compiles and runs locally on `localhost:3000`.

### Story 1.2: Database Schema & Auth Setup
**As a** User,
**I want** to register and log in securely,
**So that** my financial data is protected.

**Acceptance Criteria:**
1.  Apply the Supabase Migration for the `profiles` table (from Arch v1.4).
2.  Implement Supabase Auth (Email/Password) with Next.js Middleware protection.
3.  Create the Onboarding Flow (Step 1: Account Creation).
4.  **Security:** Enable Row Level Security (RLS) on `profiles` (Users can only read/update their own profile).

### Story 1.3: Application Shell & Navigation
**As a** User,
**I want** to navigate between the main sections of the app,
**So that** I can access different features easily.

**Acceptance Criteria:**
1.  Implement the Responsive Layout (Sidebar for Desktop, Bottom Nav for Mobile).
2.  Create placeholder pages for: Home (Feed), Dashboard, Portfolio, Planning.
3.  Implement the "Privacy Shield" indicator (Static for now) in the UI.
4.  Ensure the layout uses the "Oceanic Trust" theme.

### Story 1.4: Onboarding Flow (UI Only)
**As a** User,
**I want** to set my "Comfort Floor" and "Currency",
**So that** the app knows my preferences.

**Acceptance Criteria:**
1.  Create the "Conversational Onboarding" UI (Wizard style).
2.  Collect `comfort_floor`, `risk_tolerance`, and `currency`.
3.  Save these values to the `profiles` table in Supabase.
4.  Redirect to Home upon completion.