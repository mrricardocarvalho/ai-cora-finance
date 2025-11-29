# Story 3.4: Insight Generation Engine (Infrastructure)

**Status:** Approved
**Epic:** 3. Intelligence & Insights
**Story:**
**As a** System,
**I want** to generate discrete "Insight" objects based on financial data events,
**So that** the user sees a feed of relevant, prioritized information instead of just raw numbers.

## Acceptance Criteria
1.  [ ] **Schema:** Create `insights` table in Drizzle/Supabase.
    *   Fields: `id`, `user_id`, `type` (Enum), `title`, `message`, `action_link`, `score_impact`, `status` (Enum), `created_at`.
2.  [ ] **Generation Logic:** Implement `generateInsights(userId)` service in `lib/intelligence/insights.ts`.
3.  [ ] **Rule 1 (Comfort Floor):** If `SafeSpend` < 0 -> Generate `Urgent` insight: "You have breached your Comfort Floor."
4.  [ ] **Rule 2 (Low Buffer):** If `SafeSpend` is positive but < 10% of Floor -> Generate `Warning` insight: "Approaching Comfort Floor."
5.  [ ] **Rule 3 (New Subscription):** If a new `recurring_pattern` was added recently -> Generate `Info` insight: "New subscription detected: [Merchant]."
6.  [ ] **Idempotency:** Ensure we don't generate duplicate insights for the same event on the same day.
7.  [ ] **API:** Create Server Action `getInsights(userId)` to fetch active insights sorted by Priority (Urgent > Warning > Opportunity > Info) then Date.

## Dev Notes (Context)

**1. Database Schema (`insights`):**
```typescript
export const insightTypeEnum = pgEnum('insight_type', ['urgent', 'warning', 'opportunity', 'info']);
export const insightStatusEnum = pgEnum('insight_status', ['new', 'read', 'dismissed', 'acted']);

export const insights = pgTable("insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => profiles.id),
  type: insightTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  action_link: text("action_link"), // e.g., "/data" or "/planning"
  score_impact: integer("score_impact").default(0), // Gamification
  status: insightStatusEnum("status").default("new"),
  created_at: timestamp("created_at").defaultNow(),
});

**2. Trigger Strategy:**
For MVP, call `generateInsights(userId)` explicitly at the end of:
*   `uploadStatement` (after parsing).
*   `updateProfile` (if floor changes).
*   A periodic check (e.g., when the user loads the dashboard, check if > 24h since last check).

**3. Sorting Logic:**
When fetching, use a weighted sort:
*   Urgent = 1
*   Warning = 2
*   Opportunity = 3
*   Info = 4
*   Then by `created_at` DESC.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-3.4-insight-engine"
  title: "Insight Generation Engine"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "drizzle-orm"
  folder_structure:
    - "/lib/intelligence/insights.ts" (Logic)
    - "/lib/actions/insights.ts" (Public API)
    - "/db/schema.ts" (Update)
  schema_requirements:
    table: "insights"
    enums:
      type: [urgent, warning, opportunity, info]
      status: [new, read, dismissed, acted]
  logic_rules:
    - "Check SafeSpend vs ComfortFloor"
    - "Check for new recurring patterns"
    - "Prevent duplicates (1 per day per type)"
  verify: "Manually set SafeSpend to negative. Run generator. Check DB for 'Urgent' insight row."