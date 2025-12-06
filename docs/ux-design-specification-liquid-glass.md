# Cora Finance UX Design Specification — Liquid Glass Edition

_Created on 2025-12-06 by Ricar_
_Design Direction: macOS 26 "Lake Tahoe" Liquid Glass + Glassmorphism_
_Generated using BMad Method - Create UX Design Workflow v2.0_

---

## Executive Summary

**Cora Finance** transforms into a premium, modern experience with the **Liquid Glass** design language — inspired by Apple's macOS 26 "Lake Tahoe" aesthetic. This specification defines a translucent, fluid, and deeply layered visual system that elevates the finance app from functional to *delightful*.

### Design Philosophy: "Translucent Clarity"

> "The interface should feel like looking through crystal-clear water — you see the depth beneath, but the surface is where you interact."

**Core Principles:**
1. **Glass as Functional Layer** — Navigation and controls float on translucent glass above content
2. **Depth Through Blur** — Backdrop blur creates visual hierarchy and focus
3. **Fluid Motion** — Smooth transitions and morphing interactions
4. **Concentric Harmony** — Rounded shapes nest concentrically (outer curves inform inner curves)
5. **Light & Refraction** — Subtle highlights and shadows suggest physical depth

### Why Liquid Glass for Finance?

| Challenge | How Liquid Glass Solves It |
|-----------|---------------------------|
| **Data overload** | Translucent layers create visual hierarchy, guiding focus |
| **Trust & Premium feel** | Glass aesthetic signals sophistication and modernity |
| **Reducing anxiety** | Soft, fluid visuals feel calming vs. harsh, flat UIs |
| **Distinguishing Cora** | Unique aesthetic differentiates from typical fintech apps |

---

## 1. Design System Foundation

### 1.1 Design System Choice

**Selected:** **shadcn/ui** with Tailwind CSS + **Custom Liquid Glass Layer**

#### What We're Adding

| Layer | Purpose |
|-------|---------|
| **Glass Primitives** | Reusable glass effect classes and utilities |
| **Liquid Animations** | Fluid motion system with Framer Motion |
| **Depth Tokens** | Blur levels, transparency scales, shadow depth |
| **Concentric Radius** | Nested border-radius system |

#### Design Tokens Foundation

```css
/* === LIQUID GLASS DESIGN TOKENS === */

/* Depth Layers (z-index + blur + opacity) */
--layer-base: 0;           /* Content layer */
--layer-elevated: 1;       /* Cards, elevated content */
--layer-glass: 2;          /* Glass navigation, sidebars */
--layer-modal: 3;          /* Modals, sheets */
--layer-toast: 4;          /* Notifications */

/* Backdrop Blur Scale */
--blur-none: 0;
--blur-sm: 8px;
--blur-md: 16px;
--blur-lg: 24px;
--blur-xl: 40px;

/* Glass Opacity Scale */
--glass-opacity-subtle: 0.4;
--glass-opacity-medium: 0.6;
--glass-opacity-strong: 0.8;

/* Concentric Border Radius */
--radius-xs: 8px;
--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 20px;
--radius-xl: 24px;
--radius-2xl: 32px;
--radius-full: 9999px;

/* Spacing Scale (4px base) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

/* Shadow Depth System */
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);
--shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.12);
--shadow-elevated: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-float: 0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12);

/* Glass Edge Highlights (Refraction Effect) */
--edge-highlight: inset 0 1px 1px rgba(255, 255, 255, 0.1);
--edge-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.05);

/* Animation Timing */
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--easing-glass: cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 2. Color System: "Crystal Lake"

### 2.1 Color Philosophy

The **Crystal Lake** palette draws inspiration from:
- Deep mountain lakes at twilight (rich, dark backgrounds)
- Morning light refracting through water (vibrant accents)
- Frosted glass with subtle color tinting

**Key Insight:** Colors in Liquid Glass are never flat. They have *depth* — achieved through layered transparency and subtle gradients.

### 2.2 Light Mode Palette

```css
:root {
  /* === BACKGROUNDS === */
  /* Main background with subtle cool tint */
  --bg-base: #F0F4F8;
  --bg-subtle: #E8EDF2;
  --bg-muted: #DFE5EB;
  
  /* Surface colors (cards, elevated content) */
  --surface: rgba(255, 255, 255, 0.85);
  --surface-elevated: rgba(255, 255, 255, 0.92);
  --surface-glass: rgba(255, 255, 255, 0.65);
  
  /* === PRIMARY: Deep Indigo-Violet === */
  --primary: #6366F1;
  --primary-hover: #5558E3;
  --primary-active: #4F46E5;
  --primary-subtle: rgba(99, 102, 241, 0.12);
  --primary-glass: rgba(99, 102, 241, 0.15);
  --primary-glow: rgba(99, 102, 241, 0.25);
  --primary-foreground: #FFFFFF;
  
  /* === ACCENT: Electric Cyan === */
  --accent: #06B6D4;
  --accent-hover: #0891B2;
  --accent-subtle: rgba(6, 182, 212, 0.12);
  --accent-glass: rgba(6, 182, 212, 0.15);
  --accent-glow: rgba(6, 182, 212, 0.3);
  
  /* === TEXT HIERARCHY === */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --text-on-glass: rgba(15, 23, 42, 0.9);
  
  /* === SEMANTIC COLORS === */
  /* Success: Emerald with depth */
  --success: #10B981;
  --success-subtle: rgba(16, 185, 129, 0.12);
  --success-glass: rgba(16, 185, 129, 0.15);
  --success-glow: rgba(16, 185, 129, 0.25);
  
  /* Warning: Amber warmth */
  --warning: #F59E0B;
  --warning-subtle: rgba(245, 158, 11, 0.12);
  --warning-glass: rgba(245, 158, 11, 0.15);
  
  /* Danger: Rose with urgency */
  --danger: #EF4444;
  --danger-subtle: rgba(239, 68, 68, 0.12);
  --danger-glass: rgba(239, 68, 68, 0.15);
  
  /* Info: Sky blue clarity */
  --info: #3B82F6;
  --info-subtle: rgba(59, 130, 246, 0.12);
  --info-glass: rgba(59, 130, 246, 0.15);
  
  /* === FINANCE-SPECIFIC === */
  --money-in: #22C55E;
  --money-out: #64748B;
  --investment: #8B5CF6;
  --investment-glow: rgba(139, 92, 246, 0.25);
  --savings: #14B8A6;
  --tax: #F97316;
  --debt: #DC2626;
  
  /* === BORDERS & DIVIDERS === */
  --border: rgba(15, 23, 42, 0.08);
  --border-hover: rgba(15, 23, 42, 0.15);
  --border-glass: rgba(255, 255, 255, 0.2);
  --border-glass-strong: rgba(255, 255, 255, 0.35);
  
  /* === GRADIENTS === */
  --gradient-primary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%);
  --gradient-accent: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
  --gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
  --gradient-shine: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%);
  --gradient-mesh: radial-gradient(at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                   radial-gradient(at 80% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
}
```

### 2.3 Dark Mode Palette

```css
html.dark, .dark {
  /* === BACKGROUNDS: Deep, rich, not pure black === */
  --bg-base: #0A0D14;
  --bg-subtle: #10141C;
  --bg-muted: #161B26;
  
  /* Surface with glass-like translucency */
  --surface: rgba(22, 27, 38, 0.85);
  --surface-elevated: rgba(30, 36, 50, 0.9);
  --surface-glass: rgba(22, 27, 38, 0.65);
  
  /* === PRIMARY: Lighter indigo for dark mode === */
  --primary: #818CF8;
  --primary-hover: #6366F1;
  --primary-active: #5558E3;
  --primary-subtle: rgba(129, 140, 248, 0.15);
  --primary-glass: rgba(129, 140, 248, 0.12);
  --primary-glow: rgba(129, 140, 248, 0.3);
  --primary-foreground: #0F0E1A;
  
  /* === ACCENT: Brighter cyan === */
  --accent: #22D3EE;
  --accent-hover: #06B6D4;
  --accent-subtle: rgba(34, 211, 238, 0.15);
  --accent-glass: rgba(34, 211, 238, 0.12);
  --accent-glow: rgba(34, 211, 238, 0.35);
  
  /* === TEXT === */
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --text-on-glass: rgba(241, 245, 249, 0.92);
  
  /* === SEMANTIC === */
  --success: #34D399;
  --success-subtle: rgba(52, 211, 153, 0.15);
  --success-glow: rgba(52, 211, 153, 0.3);
  
  --warning: #FBBF24;
  --warning-subtle: rgba(251, 191, 36, 0.15);
  
  --danger: #F87171;
  --danger-subtle: rgba(248, 113, 113, 0.15);
  
  --info: #60A5FA;
  --info-subtle: rgba(96, 165, 250, 0.15);
  
  /* === FINANCE === */
  --money-in: #4ADE80;
  --investment: #A78BFA;
  --investment-glow: rgba(167, 139, 250, 0.35);
  --savings: #2DD4BF;
  --tax: #FB923C;
  --debt: #F87171;
  
  /* === BORDERS === */
  --border: rgba(248, 250, 252, 0.08);
  --border-hover: rgba(248, 250, 252, 0.15);
  --border-glass: rgba(255, 255, 255, 0.1);
  --border-glass-strong: rgba(255, 255, 255, 0.2);
  
  /* === GRADIENTS === */
  --gradient-primary: linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #C4B5FD 100%);
  --gradient-accent: linear-gradient(135deg, #22D3EE 0%, #60A5FA 100%);
  --gradient-glass: linear-gradient(135deg, rgba(30,36,50,0.9) 0%, rgba(22,27,38,0.7) 100%);
  --gradient-shine: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%);
  --gradient-mesh: radial-gradient(at 20% 30%, rgba(129, 140, 248, 0.12) 0%, transparent 50%),
                   radial-gradient(at 80% 70%, rgba(34, 211, 238, 0.08) 0%, transparent 50%);
}
```

---

## 3. Typography

### 3.1 Font Stack

```css
/* Primary: SF Pro Display / Inter fallback */
--font-sans: 'SF Pro Display', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

/* Monospace: SF Mono / JetBrains Mono fallback */
--font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2 Type Scale

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Display** | 48px | 700 | 1.1 | -0.02em | Hero headlines |
| **H1** | 32px | 600 | 1.2 | -0.01em | Page titles |
| **H2** | 24px | 600 | 1.3 | -0.01em | Section headers |
| **H3** | 20px | 600 | 1.4 | 0 | Card titles |
| **H4** | 16px | 600 | 1.5 | 0 | Subsections |
| **Body** | 16px | 400 | 1.6 | 0 | Primary content |
| **Body SM** | 14px | 400 | 1.5 | 0 | Secondary content |
| **Caption** | 12px | 500 | 1.4 | 0.01em | Labels, timestamps |
| **Money LG** | 32px | 700 | 1.1 | -0.02em | Large amounts |
| **Money MD** | 24px | 600 | 1.2 | -0.01em | Standard amounts |
| **Money SM** | 16px | 600 | 1.4 | 0 | Inline amounts |

### 3.3 Localization

```css
/* Portuguese format: 1.234,56 € */
/* Date format: DD/MM/YYYY */
```

---

## 4. Liquid Glass Components

### 4.1 Glass Panel (Base Primitive)

The foundation of the Liquid Glass system.

```css
.glass-panel {
  background: var(--surface-glass);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: 
    var(--shadow-glass),
    var(--edge-highlight),
    var(--edge-shadow);
  transition: all var(--duration-normal) var(--easing-glass);
}

.glass-panel:hover {
  background: var(--surface-elevated);
  border-color: var(--border-glass-strong);
  box-shadow: var(--shadow-elevated);
  transform: translateY(-2px);
}
```

### 4.2 Glass Card

```typescript
interface GlassCardProps {
  variant: 'default' | 'elevated' | 'interactive' | 'glow';
  blur?: 'sm' | 'md' | 'lg';
  tint?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}
```

**Variants:**
- **default** — Standard glass with medium blur
- **elevated** — Higher opacity, stronger shadow, used for primary content
- **interactive** — Lift and glow on hover
- **glow** — Subtle colored glow around edges (for highlighted cards)

### 4.3 Glass Button

```typescript
interface GlassButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  glow?: boolean;  // Adds colored glow on hover
  morphTo?: 'menu' | 'popover';  // Fluid morphing animation
}
```

**Primary Button:**
```css
.btn-glass-primary {
  background: var(--gradient-primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: var(--radius-lg);
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: var(--shadow-glass), 0 0 0 0 var(--primary-glow);
  transition: all var(--duration-fast) var(--easing-smooth);
}

.btn-glass-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-elevated), 0 0 24px var(--primary-glow);
}

.btn-glass-primary:active {
  transform: translateY(0) scale(0.98);
}
```

**Secondary Button (Glass):**
```css
.btn-glass-secondary {
  background: var(--surface-glass);
  backdrop-filter: blur(var(--blur-sm));
  color: var(--text-primary);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  padding: 12px 24px;
  font-weight: 500;
  box-shadow: var(--edge-highlight);
  transition: all var(--duration-fast) var(--easing-smooth);
}

.btn-glass-secondary:hover {
  background: var(--surface-elevated);
  border-color: var(--primary-subtle);
  color: var(--primary);
  box-shadow: var(--shadow-glass), 0 0 16px var(--primary-glow);
}
```

### 4.4 Glass Sidebar

The sidebar floats as a glass panel on the left side, with content visible through it.

```css
.glass-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: var(--surface-glass);
  backdrop-filter: blur(var(--blur-lg));
  -webkit-backdrop-filter: blur(var(--blur-lg));
  border-right: 1px solid var(--border-glass);
  box-shadow: 
    var(--shadow-glass),
    inset 1px 0 0 var(--border-glass-strong);
  z-index: var(--layer-glass);
}

/* Nav items within glass sidebar */
.glass-sidebar .nav-item {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  color: var(--text-on-glass);
  transition: all var(--duration-fast) var(--easing-smooth);
}

.glass-sidebar .nav-item:hover {
  background: var(--primary-glass);
  color: var(--primary);
}

.glass-sidebar .nav-item.active {
  background: var(--primary-subtle);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary-glass);
}
```

### 4.5 Glass Input

```css
.glass-input {
  background: var(--surface-glass);
  backdrop-filter: blur(var(--blur-sm));
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all var(--duration-fast) var(--easing-smooth);
}

.glass-input::placeholder {
  color: var(--text-muted);
}

.glass-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface-elevated);
  box-shadow: 
    0 0 0 3px var(--primary-glass),
    var(--shadow-glass);
}

.glass-input:hover:not(:focus) {
  border-color: var(--border-hover);
  background: var(--surface);
}
```

### 4.6 Glass Modal / Sheet

```css
.glass-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(var(--blur-sm));
  z-index: var(--layer-modal);
}

.glass-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface-elevated);
  backdrop-filter: blur(var(--blur-xl));
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-float);
  padding: var(--space-6);
  max-width: 90vw;
  max-height: 85vh;
  overflow: auto;
  z-index: var(--layer-modal);
}

/* Bottom sheet for mobile */
.glass-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface-elevated);
  backdrop-filter: blur(var(--blur-xl));
  border-top: 1px solid var(--border-glass);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  box-shadow: var(--shadow-float);
  padding: var(--space-6);
  padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
  z-index: var(--layer-modal);
}

/* Handle indicator */
.glass-sheet::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 5px;
  background: var(--text-muted);
  border-radius: var(--radius-full);
  opacity: 0.5;
}
```

### 4.7 Glass Toast

```css
.glass-toast {
  background: var(--surface-elevated);
  backdrop-filter: blur(var(--blur-lg));
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: 14px 20px;
  box-shadow: var(--shadow-elevated);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.glass-toast.success {
  border-left: 3px solid var(--success);
  box-shadow: var(--shadow-elevated), 0 0 20px var(--success-glow);
}

.glass-toast.error {
  border-left: 3px solid var(--danger);
  box-shadow: var(--shadow-elevated), 0 0 20px var(--danger-subtle);
}
```

---

## 5. Layout System

### 5.1 Desktop Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [GLASS HEADER]  Safe-to-Spend: €420  ●●●  [Avatar]              │
├──────────────┬───────────────────────────────────────────────────┤
│              │                                                    │
│  [GLASS      │   [MAIN CONTENT AREA]                             │
│   SIDEBAR]   │                                                    │
│              │   ┌────────────────────────────────────────────┐  │
│  ● Home      │   │  Content floats on subtle gradient mesh   │  │
│  ○ Chat      │   │  background. Glass cards and components   │  │
│  ○ Dashboard │   │  layer on top with blur effects.          │  │
│  ○ Data      │   │                                            │  │
│  ○ Portfolio │   └────────────────────────────────────────────┘  │
│  ○ Planning  │                                                    │
│              │                                                    │
│  ─────────   │                                                    │
│  ○ Settings  │                                                    │
│              │                                                    │
│  [PRIVACY    │                                                    │
│   SHIELD]    │                                                    │
│              │                                                    │
└──────────────┴───────────────────────────────────────────────────┘
```

**Key Layout Principles:**
- **Background:** Subtle gradient mesh (not flat color)
- **Sidebar:** Glass panel with 24px blur, content bleeds through
- **Content:** 32px padding, cards use glass styling
- **Header:** Minimal glass bar with key metrics

### 5.2 Mobile Layout

```
┌─────────────────────────────┐
│ [GLASS HEADER]              │
│ Safe-to-Spend: €420    ●    │
├─────────────────────────────┤
│                             │
│  [MAIN CONTENT]             │
│                             │
│  ┌─────────────────────┐   │
│  │  Glass Card         │   │
│  │  with blur effect   │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  Another Card       │   │
│  └─────────────────────┘   │
│                             │
├─────────────────────────────┤
│ [GLASS BOTTOM NAV]          │
│ 🏠  📊  💬  ⚙️              │
│ with blur and glow          │
└─────────────────────────────┘
```

### 5.3 Gradient Mesh Background

```css
.app-background {
  background: var(--bg-base);
  background-image: var(--gradient-mesh);
  min-height: 100vh;
}

/* Optional: Animated mesh for hero sections */
@keyframes mesh-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animated-mesh {
  background-size: 200% 200%;
  animation: mesh-shift 15s ease infinite;
}
```

---

## 6. Interaction Patterns

### 6.1 Hover Effects

| Element | Effect |
|---------|--------|
| **Glass Card** | Lift 2px, increase shadow, brighter surface |
| **Button** | Lift 2px, scale 1.02, glow appears |
| **Nav Item** | Background tint, color shift |
| **Input** | Border color change, surface brighten |

### 6.2 Focus States

```css
/* Focus ring for accessibility */
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 2px var(--bg-base),
    0 0 0 4px var(--primary);
}
```

### 6.3 Loading States

```css
/* Glass skeleton */
.glass-skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-glass) 0%,
    var(--surface) 50%,
    var(--surface-glass) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 6.4 Button Morphing (Liquid Effect)

When a button opens a menu, it should *morph* fluidly rather than pop.

```css
/* Using Framer Motion layoutId for morphing */
.morph-trigger[data-state="open"] {
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-sm);
}
```

---

## 7. Responsive Design

### 7.1 Breakpoints

| Name | Range | Layout Changes |
|------|-------|----------------|
| **Mobile** | < 640px | Single column, bottom nav, sheets |
| **Tablet** | 640px - 1024px | Collapsible sidebar, 2-column |
| **Desktop** | > 1024px | Full sidebar, multi-column |

### 7.2 Touch Targets

- **Minimum:** 44×44px (Apple HIG)
- **Recommended:** 48×48px for primary actions
- **Spacing:** Minimum 8px between touch targets

### 7.3 Glass Effects on Mobile

```css
/* Reduce blur on lower-powered devices */
@media (prefers-reduced-motion: reduce) {
  .glass-panel,
  .glass-sidebar,
  .glass-modal {
    backdrop-filter: none;
    background: var(--surface-elevated);
  }
}

/* Reduce blur intensity on mobile for performance */
@media (max-width: 640px) {
  :root {
    --blur-md: 12px;
    --blur-lg: 16px;
  }
}
```

---

## 8. Accessibility

### 8.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** | 4.5:1 minimum for text on glass surfaces |
| **Focus Indicators** | Visible 2px ring on all interactive elements |
| **Keyboard Navigation** | Full functionality without mouse |
| **Motion** | Respect `prefers-reduced-motion` |
| **Transparency** | Respect `prefers-reduced-transparency` |

### 8.2 Reduced Transparency Support

```css
@media (prefers-reduced-transparency: reduce) {
  :root {
    --surface-glass: var(--surface-elevated);
    --glass-opacity-subtle: 0.95;
    --glass-opacity-medium: 0.97;
    --glass-opacity-strong: 1;
  }
  
  .glass-panel,
  .glass-sidebar,
  .glass-modal {
    backdrop-filter: none;
    background: var(--surface-elevated);
  }
}
```

### 8.3 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Tab** | Move between interactive elements |
| **⌘K / Ctrl+K** | Open command palette |
| **Esc** | Close modals, menus |
| **Arrow Keys** | Navigate lists |

---

## 9. Animation Guidelines

### 9.1 Timing Functions

| Name | Curve | Use Case |
|------|-------|----------|
| **Smooth** | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| **Bounce** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful feedback |
| **Glass** | `cubic-bezier(0.16, 1, 0.3, 1)` | Morphing, appearing |

### 9.2 Duration Scale

| Duration | Value | Use Case |
|----------|-------|----------|
| **Instant** | 100ms | Micro-interactions |
| **Fast** | 200ms | Hover states |
| **Normal** | 300ms | Transitions |
| **Slow** | 500ms | Page transitions |

### 9.3 Key Animations

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Glow Pulse (for active items) */
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 12px var(--primary-glow);
  }
  50% {
    box-shadow: 0 0 24px var(--primary-glow);
  }
}
```

---

## 10. Implementation Priorities

### Phase 1: Foundation
1. Update `globals.css` with Liquid Glass tokens
2. Update `tailwind.config.ts` with new color system
3. Create `.glass-*` utility classes
4. Update `Card` component with glass variants
5. Update `Button` component with glass styling
6. Update `Sidebar` with glass effect

### Phase 2: Components
1. Update `Input`, `Select`, `Textarea` with glass styling
2. Update `Modal`, `Sheet`, `Dialog` with glass
3. Update `Toast` notifications
4. Add gradient mesh background

### Phase 3: Polish
1. Add Framer Motion for fluid animations
2. Implement button morphing
3. Add loading skeletons
4. Performance optimization for mobile

---

## Appendix: Quick Reference

### Glass Classes

```css
.glass-subtle    /* Light glass effect, low blur */
.glass-medium    /* Standard glass, medium blur */
.glass-strong    /* High opacity, heavy blur */
.glass-tint-primary  /* Glass with primary color tint */
.glass-tint-accent   /* Glass with accent color tint */
.glass-glow      /* Glass with outer glow */
```

### Color Utilities

```css
.bg-primary-glass
.bg-accent-glass
.bg-success-glass
.border-glass
.shadow-glass
.shadow-glow
```

---

_This specification establishes the Liquid Glass design language for Cora Finance. The goal is to create a premium, modern experience that feels sophisticated yet approachable — like the best native apps on macOS and iOS._
