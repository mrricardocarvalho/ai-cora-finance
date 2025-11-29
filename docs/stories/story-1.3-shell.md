# Story 1.3: Application Shell & Navigation

**Status:** Approved
**Epic:** 1. Foundation & Core Infrastructure
**Story:**
**As a** User,
**I want** a responsive navigation structure that adapts to my device (Mobile vs Desktop),
**So that** I can easily access the Home, Dashboard, and Data sections.

## Acceptance Criteria
1.  [x] **Route Groups:** Create a `(dashboard)` route group for authenticated pages to share the main layout.
2.  [x] **Mobile Layout:** Implement the "Bottom Navigation" bar (Home, Dashboard, Data, Goals) visible only on mobile breakpoints.
3.  [x] **Desktop Layout:** Implement the "Left Sidebar" navigation visible only on desktop breakpoints (`md` or `lg`).
4.  [x] **Header:** Create a responsive Header component containing:
    *   Cora Logo.
    *   User Avatar (with Dropdown for Sign Out).
    *   **Placeholder:** "Safe-to-Spend" widget area (static for now).
5.  [x] **Privacy Shield:** Implement the "Privacy Shield" UI indicator (Lock Icon + "Encrypted") in the Sidebar/Settings area (static for now).
6.  [x] **Responsiveness:** Layout switches seamlessly between Mobile and Desktop views without layout shift.
7.  [x] **Theme:** All components use the "Oceanic Trust" color palette variables defined in Story 1.1.

## Dev Notes (Context)

**1. Navigation Structure (UX Spec v1.3):**
*   **Home:** `/` (Insight Feed)
*   **Dashboard:** `/dashboard` (Deep dive charts)
*   **Data:** `/data` (Transactions & Accounts)
*   **Goals:** `/planning` (Goals & Debt)

**2. shadcn/ui Components Needed:**
*   `Sheet` (for Mobile Menu if needed, though Bottom Nav is preferred for primary).
*   `Button` (Ghost variant for nav items).
*   `Avatar` (User profile).
*   `DropdownMenu` (User settings/logout).
*   `Separator`.

**3. Icons (Lucide React):**
*   Home: `Home`
*   Dashboard: `BarChart3`
*   Data: `Wallet` or `CreditCard`
*   Goals: `Target`
*   Privacy: `Lock`

**4. Layout Strategy:**
Use Next.js Layouts.

// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden md:flex" />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
        <BottomNav className="md:hidden" />
      </main>
    </div>
  )
}


**5. Privacy Shield:**
Just a visual component for now. Green lock icon with text "Encrypted". Place it at the bottom of the Desktop Sidebar.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

yaml
Provide:
  story_id: "story-1.3-shell"
  title: "Application Shell & Navigation"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  next_version: "14"
  dependencies:
    - "lucide-react"
    - "clsx"
    - "tailwind-merge"
  shadcn_components_to_add:
    - "sheet"
    - "button"
    - "avatar"
    - "dropdown-menu"
    - "separator"
  folder_structure:
    - "/app/(dashboard)/layout.tsx"
    - "/app/(dashboard)/page.tsx" (Home)
    - "/components/layout/sidebar.tsx"
    - "/components/layout/bottom-nav.tsx"
    - "/components/layout/header.tsx"
    - "/components/shared/privacy-shield.tsx"
  navigation_items:
    - { label: "Home", href: "/", icon: "Home" }
    - { label: "Dashboard", href: "/dashboard", icon: "BarChart3" }
    - { label: "Data", href: "/data", icon: "Wallet" }
    - { label: "Goals", href: "/planning", icon: "Target" }
  colors:
    primary: "Use CSS variable --primary"
    background: "Use CSS variable --background"
  verify: "Navigation appears correctly on mobile (bottom) and desktop (sidebar). Links navigate to placeholder pages."
