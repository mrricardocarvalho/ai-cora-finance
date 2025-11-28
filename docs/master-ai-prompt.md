Hello! I’m **Sally**, your UX Expert. 🎨

I have synthesized the **PRD**, **UX Specification**, and **Architecture** into a **Master Frontend Prompt**.

This prompt is optimized for **v0.dev** (Vercel) or **Lovable.ai**. It instructs the AI to build the complete application shell, including the custom "Oceanic Trust" theme, the complex "Insight Feed" logic, and the responsive layout structure.

### 🚀 How to Use This
1.  Go to **[v0.dev](https://v0.dev)** or **[Lovable.ai](https://lovable.ai)**.
2.  **Copy and Paste** the entire code block below.
3.  **Iterate:** Once the initial UI is generated, you can ask for specific pages (like "Show me the Investment Portfolio view") using the context established here.

---

### 📋 The Master AI Prompt

```markdown
# Role
You are a Senior Frontend Engineer and UX Designer specializing in Fintech. You are building the high-fidelity frontend for "Cora Finance," a Portugal-first personal finance PWA.

# Tech Stack & Constraints
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- UI Library: shadcn/ui (Radix Primitives)
- Icons: Lucide React
- Charts: Recharts
- Font: Inter (Body), JetBrains Mono (Numbers)
- Design: Mobile-First, Responsive (PWA)

# Visual Identity: "Oceanic Trust"
Implement these CSS variables for the theme. Do not use default shadcn blacks/whites.
- Primary: #0D9488 (Deep Teal)
- Background: #FAFAFA (Light Gray) / #0F172A (Dark Navy)
- Surface: #FFFFFF / #1E293B
- Success: #10B981 | Warning: #F59E0B | Danger: #F43F5E
- Tax/IRS Accent: #E17055 (Terracotta)

# Core Layout Requirements
1. **Mobile Layout:**
   - Top Header: Logo + Health Score Gauge + "Safe-to-Spend" Widget.
   - Main Content: Scrollable area.
   - Bottom Navigation: Home (Feed), Dashboard, Transactions, Chat.
   - Floating Action: "Ask Cora" Chat Input (expands to bottom sheet).

2. **Desktop Layout:**
   - Left Sidebar: Navigation + Health Score + Quick Stats.
   - Main Content: Central feed/dashboard.
   - Right Panel: Collapsible "Chat with Cora" persistent view.

# Key Components to Build

## 1. The Proactive Insight Feed (Home View)
Instead of a static dashboard, the home page is a feed of "Insight Cards".
Create a component `InsightCard` with props: `priority` (urgent, warning, opportunity, info), `title`, `message`, `timestamp`, and `actions` (array of buttons).
- **Urgent:** Red border/badge. Example: "Approaching Comfort Floor".
- **Opportunity:** Green border/badge. Example: "Tax Deduction Found (+€200)".
- **Tax:** Terracotta badge. Example: "IRS Deadline in 5 days".

## 2. Safe-to-Spend Widget
Display a prominent metric: `Available - Comfort Floor - Pending Bills`.
- If positive: Green text, "Safe to spend".
- If negative: Red text, "Over budget".
- Format currency strictly as Portuguese Euro: `1.234,56 €` (Symbol at end).

## 3. Transaction List (with Bulk Edit)
Create a `TransactionRow` component.
- Left: Category Icon (color-coded).
- Middle: Merchant Name + Date.
- Right: Amount (Red for expense, Green for income).
- **Interaction:** Long-press (or checkbox) triggers "Bulk Selection Mode".
- **Bulk Bar:** When items selected, show floating bar at bottom: "Edit Category", "Exclude", "Delete".

## 4. Privacy Shield
Add a small, reassuring UI element in the Sidebar/Settings:
- Icon: Lock (Green).
- Text: "End-to-End Encrypted".
- Tooltip: "Your data is processed locally or encrypted at rest."

# Mock Data for Preview
Please initialize the app with this state so I can see the UI populated:
- **User:** Ricar, Comfort Floor: €500.
- **Safe-to-Spend:** €420 (Green).
- **Health Score:** 78/100 (Good).
- **Insights:**
  1. [Urgent] "Projected to hit floor in 4 days."
  2. [Opportunity] "Netflix subscription unused for 3 months."
  3. [Tax] "Upload health receipts for IRS."
- **Transactions:** Mix of Moey and ActivoBank records.

# Instructions
Generate the main layout shell (`layout.tsx`), the Home Page (`page.tsx`) with the Insight Feed, and the Transaction List component. Ensure the "Oceanic Trust" color theme is applied globally.
```

---

### 👩‍🎨 Sally's Tips for Refinement

Once the AI generates the initial UI, here are the **follow-up prompts** you should use to polish specific areas:

1.  **For the Charts:**
    > "Add a `SpendingChart` component using Recharts. It should show a Bar Chart of spending by category for the last 30 days. Use the 'Oceanic Trust' color palette for the bars."
2.  **For the Chat Interface:**
    > "Create the `ChatInterface` component. It should support 'Rich Bubbles'—meaning if I ask about spending, it renders a mini-chart inside the chat bubble, not just text."
3.  **For Onboarding:**
    > "Create the `OnboardingFlow` component. It should be a step-by-step conversational wizard (not a form) that asks for the 'Comfort Floor' and 'Financial Goals'."

**You are now ready to build!** Good luck, Ricar. This is going to be a beautiful app. 🚀