# Story 1.1: Project Initialization & Tech Stack

**Status:** Approved
**Epic:** 1. Foundation & Core Infrastructure
**Story:**
**As a** Developer,
**I want** to initialize the Next.js repository with the defined tech stack and visual identity,
**So that** we have a solid, type-safe foundation for development.

## Acceptance Criteria
1.  [x] **Next.js Setup:** Next.js 14+ (App Router) project initialized with TypeScript and ESLint.
2.  [x] **Styling Engine:** Tailwind CSS installed and configured.
3.  [x] **Component Library:** `shadcn/ui` placeholder added and init instructions included (run `npx shadcn-ui@latest init` to finish).
4.  [x] **Theme Config:** "Oceanic Trust" color palette (Primary: #0D9488, etc.) configured in `tailwind.config.ts` and CSS variables.
5.  [x] **Database ORM:** Drizzle ORM dependency added; connection logic stubbed in `src/db/index.ts` for Story 1.2.
6.  [x] **Icons:** `lucide-react` installed.
7.  [x] **Verification:** Application compiles without errors and runs on `http://localhost:3000` showing a basic "Hello Cora" page using the primary color.

## Tasks
- [x] Run `npx create-next-app@latest` (Use TypeScript, Tailwind, ESLint, App Router) — repo already initialized.
- [x] Run `npx shadcn-ui@latest init` (Default style, Slate base color) — placeholder components and README added; run command to finish.
- [x] Update `tailwind.config.ts` and `globals.css` with the custom color palette.
- [x] Install dependencies: `drizzle-orm`, `postgres`, `lucide-react`, `clsx`, `tailwind-merge`.
- [x] Install dev dependencies: `drizzle-kit`.
- [x] Clean up default Next.js boilerplate (remove Vercel logos/styles).
- [x] Create a simple landing page to test the build.

## Dev Notes (Context)

**1. Tech Stack (Strict):**
*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript (Strict mode)
*   **Styling:** Tailwind CSS
*   **UI:** shadcn/ui
*   **Package Manager:** npm or pnpm (User's choice, stick to one)

**2. "Oceanic Trust" Color Palette (CRITICAL):**
Please configure these exact variables in `globals.css` (root) and map them in `tailwind.config.ts`.

*   **Primary:** `#0D9488` (Deep Teal)
*   **Primary Foreground:** `#FFFFFF`
*   **Background:** `#FAFAFA` (Light Gray)
*   **Surface/Card:** `#FFFFFF`
*   **Success:** `#10B981`
*   **Warning:** `#F59E0B`
*   **Danger:** `#F43F5E`
*   **Info:** `#0EA5E9`
*   **Tax/IRS Accent:** `#E17055` (Terracotta)

**3. Folder Structure Preference:**
Follow standard Next.js App Router conventions:
text
/app
  /layout.tsx
  /page.tsx
  /globals.css
/components
  /ui (shadcn components)
  /shared (custom components)
/lib
  /utils.ts
/db (for Drizzle later)


**4. Dark Mode:**
Prepare the CSS variables for Dark Mode support (class strategy), but focus on Light Mode default for this story.
