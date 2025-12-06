# Story 3.3: Dashboard & Safe-to-Spend UI

**Status:** Approved
**Epic:** 3. Intelligence & Insights
**Story:**
**As a** User,
**I want** to see my Safe-to-Spend number prominently on the dashboard,
**So that** I have instant clarity on my financial position without doing math.

## Acceptance Criteria
1.  [x] **Dashboard Page:** Update `/app/(dashboard)/page.tsx` (Home) to display the core dashboard layout.
2.  [x] **Data Fetching:** Integrate `getSafeToSpend` (from Story 3.2) into the page load (Server Component).
3.  [x] **Widget UI:** Create `SafeToSpendWidget` component.
    *   Display the calculated amount in large text.
    *   **Visuals:** Green text (`text-success`) if Positive, Red text (`text-danger`) if Negative/Danger.
    *   **Format:** Strict Portuguese format (`1.234,56 €`).
4.  [x] **Breakdown View:** On click/tap, expand or open a Popover showing the math:
    *   `+ Liquid Cash`
    *   `- Comfort Floor`
    *   `- Pending Bills`
    *   `= Safe to Spend`
5.  [x] **Loading State:** Show a `Skeleton` loader while fetching data to prevent layout shift.
6.  [x] **Responsive:** Full width on Mobile, distinct card on Desktop sidebar (as per UX Spec).

## Dev Notes (Context)

**1. UX Spec Reference:**
*   **Mobile:** Top of the feed, very prominent.
*   **Desktop:** Sidebar widget.
*   **Colors:** Use the CSS variables `--success` (#10B981) and `--danger` (#F43F5E).

**2. Component Structure:**

// components/dashboard/safe-spend-widget.tsx
export function SafeToSpendWidget({ data }: { data: SafeSpendData }) {
  const isSafe = data.amount > 0;
  
  return (
    <Card className="border-l-4" style={{ borderLeftColor: isSafe ? 'var(--success)' : 'var(--danger)' }}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Safe to Spend</CardTitle>
        <div className={cn("text-2xl font-bold", isSafe ? "text-success" : "text-danger")}>
          {formatCurrency(data.amount)}
        </div>
      </CardHeader>
      {/* Popover or Accordion for breakdown details */}
    </Card>
  )
}

**3. Formatting Utility:**
Ensure you use the reusable formatter created in Epic 1/2 or create one now:
`new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)`

**4. Error Handling:**
If `comfort_floor` is not set (user skipped onboarding), display a prompt: "Set Comfort Floor to see Safe-to-Spend" linking to settings.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-3.3-dashboard-ui"
  title: "Dashboard & Safe-to-Spend UI"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "lucide-react"
    - "clsx"
    - "tailwind-merge"
  shadcn_components_to_add:
    - "card"
    - "skeleton"
    - "popover" (for breakdown details)
    - "button"
  folder_structure:
    - "/app/(dashboard)/page.tsx" (Update)
    - "/components/dashboard/safe-spend-widget.tsx"
    - "/lib/utils/formatting.ts" (Currency helper)
  visual_logic:
    positive: "text-success (#10B981)"
    negative: "text-danger (#F43F5E)"
  verify: "Widget appears on Dashboard. Shows Green € value if balance > floor. Clicking reveals the math breakdown."
