# Story 6.6: UX Micro-Interactions (Delight)

**Status:** Done
**Epic:** 6. Polish & Proactive Reach
**Story:**
**As a** User,
**I want** the interface to feel alive, responsive, and celebrating my wins,
**So that** managing money feels less like a chore and more like progress.

## Acceptance Criteria
1.  [x] **Cora Avatar:** Create an animated `CoraAvatar` component.
    *   **States:** `Idle` (Subtle breathing), `Thinking` (Pulse/Dots), `Speaking` (Wave/Active), `Happy` (Bounce).
    *   **Usage:** Replace static icons in Chat and Onboarding with this component.
2.  [x] **Celebration System:** Create a global `celebrate()` utility.
    *   **Trigger:** Fire confetti when a Goal reaches 100% or a Debt is paid off.
    *   **Visual:** Use `canvas-confetti` with the "Oceanic Trust" colors (Teal, Gold, White).
3.  [x] **Loading Skeletons:** Audit all data fetching pages (Dashboard, Portfolio). Added reusable skeletons and applied to client-loaded lists.
    *   Replace spinning loaders with UI-matching `Skeleton` layouts to prevent layout shift (CLS).
4.  [x] **Success Toasts:** Style the `sonner` toasts to match the theme. (Used existing ToastProvider themed to Oceanic)
    *   Green checkmark for success.
    *   "Oceanic" background for info.
5.  [x] **Page Transitions:** Added subtle fade-in animations with `framer-motion` via `app/template.tsx`.

**Notes:**
- Replaced `Avatar` with `CoraAvatar` in Header and Onboarding; Chat integration not found, but avater ready for chat usage.
- `celebrate()` utility implemented at `src/lib/utils/celebrate.ts` and used in `goal-card` and `debt-simulator`.
- Skeletons: `src/components/ui/Skeleton.tsx` and `src/components/skeletons/dashboard-skeleton.tsx` added; `TransactionListContainer` uses `Skeleton` for its list placeholder.
- ToastProvider updated to match the Oceanic theme.

## Dev Notes (Context)

**1. Cora Avatar Implementation (`framer-motion`):**

// components/shared/cora-avatar.tsx
import { motion } from 'framer-motion';

export function CoraAvatar({ state = 'idle' }) {
  const variants = {
    idle: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } },
    thinking: { opacity: [0.5, 1, 0.5], transition: { repeat: Infinity, duration: 1 } },
    // ...
  };
  
  return (
    <motion.div variants={variants} animate={state} className="bg-gradient-to-br from-primary to-teal-400 rounded-full ...">
      {/* Icon or Face SVG */}
    </motion.div>
  );
}

**2. Confetti Config:**
Reuse the logic from Story 5.4 but make it global.

import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  confetti({
    colors: ['#0D9488', '#10B981', '#F59E0B'], // Primary, Success, Warning
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

**3. Skeleton Strategy:**
Don't just put one rectangle. Mimic the card layout.
*   *Dashboard:* Header Skeleton + 3 Card Skeletons + Chart Box Skeleton.

**4. Page Transitions:**
Wrap the `children` in `app/template.tsx` (Next.js specific file for transitions) with a Framer Motion `AnimatePresence`.

---

### 2. The Context File (For James)
Copy and paste this YAML block to James.

Provide:
  story_id: "story-6.6-micro-interactions"
  title: "UX Micro-Interactions"
  status: "Approved"
  target_branch: "dev"
  package_manager: "npm"
  node_version: "20.x"
  dependencies:
    - "framer-motion"
    - "canvas-confetti"
  shadcn_components_to_add:
    - "skeleton"
  folder_structure:
    - "/components/shared/cora-avatar.tsx"
    - "/lib/utils/celebrate.ts"
    - "/app/template.tsx" (For page transitions)
    - "/components/skeletons/dashboard-skeleton.tsx"
  visual_logic:
    confetti_colors: ["#0D9488", "#10B981", "#F59E0B"]
  verify: "Navigate between pages (should fade). Complete a goal (should confetti). Watch Cora avatar breathe."