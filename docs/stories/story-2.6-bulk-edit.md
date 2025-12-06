# Story 2.6: Bulk Edit & Correction

**Status:** Completed
**Epic:** 2. Banking & Data Ingestion
**Story:**
**As a** Power User,
**I want** to select multiple transactions and update their category or delete them in batch,
**So that** I can fix AI categorization errors efficiently without repetitive clicking.

## Acceptance Criteria
1.  [ ] **Selection UI:** Enable "Row Selection" in the `TransactionTable` (Desktop: Checkboxes, Mobile: Long-press toggles selection mode).
2.  [ ] **Floating Action Bar:** When 1 or more items are selected, display a floating bar at the bottom of the screen showing:
    *   "X items selected"
    *   "Edit Category" button
    *   "Delete" button
    *   "Cancel" (X) button
3.  [ ] **Bulk Update Action:** Implement `bulkUpdateCategories(ids: string[], category: string)` Server Action.
4.  [ ] **Bulk Delete Action:** Implement `bulkDeleteTransactions(ids: string[])` Server Action.
5.  [ ] **Keyboard Shortcuts:** Implement the "Power User" shortcuts defined in UX Spec v1.3:
    *   `Space`: Toggle selection of focused row.
    *   `Esc`: Clear selection.
    *   `Delete` / `Backspace`: Trigger delete for selected rows.
6.  [ ] **Feedback:** Show a toast notification on success (e.g., "Updated 12 transactions").
7.  [ ] **Performance:** Ensure the UI updates optimistically (instant feedback) before the server confirms.

## Dev Notes (Context)

**1. TanStack Table Features:**
We are already using `@tanstack/react-table`. Enable its built-in Row Selection API:
*   `getCoreRowModel`, `rowSelection` state.
*   Add a checkbox column to the `columns` definition.

**2. Floating Bar UX:**
Use a fixed position `div` at `bottom-4` (or `bottom-20` on mobile to sit above nav).
*   *Animation:* Slide up when `selectedRows.length > 0`.
*   *Component:* Create `components/transactions/bulk-action-bar.tsx`.

**3. Server Action Optimization:**
Use Drizzle's `inArray` operator for efficiency.

// lib/actions/transactions.ts
export async function bulkUpdateCategories(ids: string[], category: string) {
  // Auth check...
  await db.update(transactions)
    .set({ category, confidence_score: 1.0 }) // Mark as confident since human edited
    .where(
      and(
        eq(transactions.user_id, userId),
        inArray(transactions.id, ids)
      )
    );
  revalidatePath('/data');
}

**4. Optimistic UI:**
Since bulk updates can take a second, consider using `useOptimistic` or simply showing a loading spinner on the Bulk Bar buttons to prevent double-clicks.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-2.6-bulk-edit"
  title: "Bulk Edit & Correction"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "@tanstack/react-table" (already installed)
    - "lucide-react"
  shadcn_components_to_add:
    - "checkbox"
    - "dialog" (for category picker)
    - "command" (for searchable category list)
  folder_structure:
    - "/components/transactions/bulk-action-bar.tsx"
    - "/components/transactions/category-picker.tsx"
    - "/lib/actions/transactions.ts" (update existing)
  keyboard_shortcuts:
    - "Space" (Select)
    - "Escape" (Cancel)
    - "Delete" (Delete)
  verify: "Select 3 transactions. Click 'Edit Category'. Change to 'Food'. Verify all 3 update in the DB and UI."
