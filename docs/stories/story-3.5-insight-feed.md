# Story 3.5: The Insight Feed UI

**Status:** Approved
**Epic:** 3. Intelligence & Insights
**Story:**
**As a** User,
**I want** to see a prioritized feed of financial insights on my home screen,
**So that** I know exactly what requires my attention without digging through data.

## Acceptance Criteria
1.  [ ] **Component:** Create `InsightCard` component matching UX Spec v1.3.
    *   Props: `priority`, `title`, `message`, `timestamp`, `actions`, `scoreImpact`.
2.  [ ] **Visual Styles:** Implement distinct styles for priorities:
    *   **Urgent:** Red border/badge (`border-danger`, `bg-danger/10`).
    *   **Warning:** Amber border/badge.
    *   **Opportunity:** Green border/badge.
    *   **Info:** Blue/Gray styling.
3.  [ ] **Feed Container:** Create `InsightFeed` component that fetches data via Server Action (`getInsights`).
4.  [ ] **Interactions:**
    *   **Dismiss:** Clicking "X" or "Dismiss" removes the card from view immediately (Optimistic UI).
    *   **Act:** Clicking the primary action button navigates to the relevant page (e.g., `/data`) AND marks the insight as 'acted'.
5.  [ ] **Gamification:** When an insight is marked 'acted', trigger a **Success Toast** showing `+5 Health Score` (Visual only for now, logic in next story).
6.  [ ] **Empty State:** If no insights exist, show the "All Clear" state defined in UX Spec ("🎉 All caught up!").

## Dev Notes (Context)

**1. Insight Card Structure (shadcn/ui):**
```tsx
<Card className={cn("border-l-4", priorityColorClass)}>
  <CardHeader className="flex flex-row justify-between">
    <Badge variant={priority}>{priorityLabel}</Badge>
    <span className="text-xs text-muted-foreground">{timeAgo}</span>
  </CardHeader>
  <CardContent>
    <h3 className="font-bold">{title}</h3>
    <p className="text-sm text-muted-foreground">{message}</p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button size="sm" onClick={handleAct}>View</Button>
    <Button size="sm" variant="ghost" onClick={handleDismiss}>Dismiss</Button>
  </CardFooter>
</Card>

**2. Optimistic Updates:**
Use `useOptimistic` (Next.js 14) or local state to hide the card *immediately* when clicked, then call the Server Action `dismissInsight(id)` in the background. Do not make the user wait for the server roundtrip.

**3. Icons:**
*   Urgent: `AlertCircle`
*   Opportunity: `TrendingUp` or `Sparkles`
*   Info: `Info`

**4. Toast Library:**
Use `sonner` (standard in modern shadcn/ui) for the "+5 Health Score" popup.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-3.5-insight-feed"
  title: "The Insight Feed UI"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "lucide-react"
    - "date-fns" (for '2 hours ago')
    - "sonner" (for toasts)
  shadcn_components_to_add:
    - "card"
    - "badge"
    - "button"
    - "sonner"
  folder_structure:
    - "/components/insights/insight-card.tsx"
    - "/components/insights/insight-feed.tsx"
    - "/app/(dashboard)/page.tsx" (Update to include Feed)
    - "/lib/actions/insights.ts" (markAsRead, dismiss)
  visual_logic:
    urgent: "border-l-danger"
    opportunity: "border-l-success"
  verify: "Feed appears on Home. Clicking Dismiss hides the card instantly. Clicking Act shows a '+5 Health Score' toast."