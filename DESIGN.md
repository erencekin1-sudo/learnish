# Learnish — Design System: Sophisticated Playful

A refined, modern parenting and health-focused design system using high-contrast colors (`#171e19`, `#ca0013`) paired with soft backgrounds (`#eeebe3`) and sage accents (`#b7c6c2`). The design balances playfulness through rounded iconography and typography with professional reliability through structured information grids.

---

## 1. Aesthetic Identity & Principles

- **Sophisticated Playful:** Approachable, warm, yet deeply trustworthy and authoritative for learning English vocabulary.
- **Strict Color Semantics:**
  - **Charcoal (`#171e19`):** Primary text and backgrounds. Pure black (`#000000`) is NEVER used.
  - **Vibrant Red (`#ca0013`):** Exclusively reserved for high-impact CTAs, critical alerts, notification badges, and the Center Floating Action Button (FAB).
  - **Gray-Green / Sage (`#b7c6c2`):** Used at 20–30% opacity for delicate borders (`rgba(183, 198, 194, 0.3)`), decorative organic blobs, and secondary labels.
  - **Off-White (`#eeebe3`):** Soft warm canvas ground providing comfortable readability without harsh screen glare.
  - **White (`#ffffff`):** Crisp surface plane for elevated cards and glassmorphism-lite nested layers.
- **Oversized Organic Radii:**
  - Main cards / containers: **`40px` (2.5rem)** to preserve the signature soft but modern look.
  - Nested items / secondary cards: **`24px` (1.5rem)**.
  - Bento metric cards / category squares: **`16px` (1.0rem)**.
  - Floating pills: **`9999px`** (e.g. 160px category pills, floating bottom navigation bar).
  - Action circles & FAB: **`50%`**.
- **Soft Atmospheric Depth:**
  - Large-spread subtle shadows: `0 20px 50px -12px rgba(23, 30, 25, 0.08)`.
  - Glassmorphism-lite on nested cards: `background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(12px)`.
  - Red glow on FAB: `0 10px 25px -4px rgba(202, 0, 19, 0.35)`.
- **Typographic System:**
  - Typeface: **Nunito** across all weights (400–900).
  - Headings: 32px / Font-Black (900).
  - Subheadings: 20px / Font-Black (800–900).
  - Labels: 10px / 12px Font-Bold with uppercase tracking (`letter-spacing: 0.06em` – `0.08em`).
- **Motion & Transitions:**
  - Smooth View-Transitions with `0.25s ease-in/out fade`.
  - Interactive controls ease with `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 2. Core Layout & UI Components

### 2.1 Header
- Top-aligned header with 56px top padding.
- **Left Side:** Greeting text using a 12px uppercase label in `#b7c6c2` and a 30px bold name/title in `#171e19`.
- **Right Side:** 48px circular profile image with a 2px white border and a 16px red notification badge at the bottom-right.

### 2.2 Horizontal Scroll Selector
- Horizontal snap-scrolling list of category buttons.
- **Inactive State:** 56x56px white square with 16px radius and `#b7c6c2`/30 border.
- **Active State:** 160px wide pill in `#171e19`, featuring an internal 40px red circle for the value/icon and white text for status labels.

### 2.3 Hero Feature Card
- Large white card with 40px (2.5rem) radius and subtle shadow.
- Top-right: Semi-transparent decorative blob (`#b7c6c2`/20).
- Top: 64x64px white square icon holder (16px radius) with an emoji.
- Center: Nested 2-column grid for metrics (Bento Metric Cards: 16px radius, white at 80% opacity, backdrop-filter blur, 10px uppercase `#b7c6c2` title, 14px bold `#171e19` content with leading 32px circular icon in `#ca0013` at 10% opacity).
- Bottom: Alert/info box using `#b7c6c2`/20 background with 16px radius.
- Primary CTA: High-impact Vibrant Red (`#ca0013`) action button.

### 2.4 Secondary Feed Items
- Vertical list of cards with 24px radius, white background, and `#b7c6c2`/30 border.
- 56px icon container with a 10% opacity color background.
- 18px bold headings.
- Circular trailing checkbox button (40px) that changes to red on hover/active.

### 2.5 Floating Navigation Bar
- Fixed bottom-aligned pill (8px from bottom edges) in `#171e19`, height 64px.
- **Center Action (FAB):** 56px circular button using `#ca0013`, offset vertically by -32px (floating 32px above the bar) with a 4px `#eeebe3` border creating a "cutout" visual effect, white icon, and red shadow (`rgba(202, 0, 19, 0.35)`).
- **Icons:** 48px touch targets, white icon for active state, `#b7c6c2` for inactive.
