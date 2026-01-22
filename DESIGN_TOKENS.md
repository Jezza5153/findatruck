# Design Tokens — ATruck (Final Color System)

> **Vibe:** Asphalt street • warm lights • food glow • not corporate

---

## 1️⃣ Core Neutrals (the foundation)

These replace all blue/steel backgrounds.

| Token | Hex | Usage |
|-------|-----|-------|
| Asphalt (page bg) | `#0F1115` | `bg-asphalt`, `--background` |
| Charcoal (card bg) | `#171A20` | `bg-charcoal`, `--card` |
| Elevated surface | `#1E232B` | `bg-elevated`, `--popover`, `--muted` |
| Subtle divider | `rgba(255,255,255,0.08)` | `border-subtle`, `--border` |
| Strong divider | `rgba(255,255,255,0.14)` | `border-strong` |

> ⚠️ Kill all navy/blue gradients. Everything starts here.

---

## 2️⃣ Text Colors (warm, readable, not icy)

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| Primary text | `#FAFAF7` | `text-warm-white`, `text-foreground` |
| Secondary text | `rgba(250,250,247,0.72)` | `text-warm-secondary` |
| Muted/meta text | `rgba(250,250,247,0.48)` | `text-warm-muted`, `text-muted-foreground` |
| Disabled text | `rgba(250,250,247,0.32)` | `text-warm-disabled` |

> ⚠️ Never use pure white on dark—it looks harsh.

---

## 3️⃣ Brand Accents (THIS is your identity)

| Token | Hex | Tailwind Class |
|-------|-----|----------------|
| Brand Orange (primary) | `#FF6A00` | `bg-brand-orange`, `text-brand-orange` |
| Brand Orange (hover) | `#FF8126` | `bg-brand-orange-hover` |
| Brand Yellow (highlight) | `#FFC700` | `bg-brand-yellow`, `text-brand-yellow` |
| Brand Yellow (soft) | `#FFD84D` | `bg-brand-yellow-soft` |

**Usage:**
- **Orange** = actions (CTA, links, primary buttons)
- **Yellow** = status, highlights, "Open Now", attention

---

## 4️⃣ Status Colors (warm palette)

| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Open / Available | `#FFC700` (yellow) | `text-status-open`, `bg-status-open` |
| Closed / Inactive | `rgba(250,250,247,0.38)` | `text-status-closed` |
| Busy / Popular | `#FF6A00` | `text-status-busy` |
| Featured / Premium | `#FFD84D` | `text-status-featured` |

> 👉 This keeps everything inside the warm palette—no clashing greens!

---

## 5️⃣ Buttons (exact mapping)

### Primary CTA (Get Started, Join, Check In)
```css
background: #FF6A00;
background-hover: #FF8126;
color: #0F1115;
```
Use: `bg-primary text-primary-foreground hover:bg-brand-orange-hover`

### Secondary CTA
```css
background: #1E232B;
background-hover: #262C36;
color: #FAFAF7;
border: rgba(255,255,255,0.12);
```
Use: `bg-secondary text-secondary-foreground border-subtle`

### Ghost / Icon Buttons
```css
background: transparent;
background-hover: rgba(255,255,255,0.06);
icon-color: rgba(250,250,247,0.72);
```
Use: `bg-transparent hover:bg-ghost-hover text-warm-secondary`

---

## 6️⃣ Cards

| Property | Value | Tailwind |
|----------|-------|----------|
| Card BG | `#171A20` | `bg-card` |
| Card Hover | `#1E232B` | `hover:bg-elevated` |
| Card Border | `rgba(255,255,255,0.08)` | `border-subtle` |
| Card Shadow | none (use contrast) | — |

**Featured card glow (optional):**
```css
box-shadow: 0 0 0 1px rgba(255,199,0,0.25);
```
Use: `card-featured-glow`

---

## 7️⃣ Inputs / Search

| Property | Value | Tailwind |
|----------|-------|----------|
| Input BG | `#1E232B` | `bg-input` |
| Input Border | `rgba(255,255,255,0.10)` | `border-subtle` |
| Input Focus Border | `#FF6A00` | `ring-ring` |
| Placeholder | `rgba(250,250,247,0.40)` | `placeholder:text-warm-muted` |

---

## 8️⃣ Background

### Recommended (clean + premium)
```css
background-color: #0F1115;
```
Use: `bg-background` or `bg-asphalt`

### Optional subtle glow (header only)
```css
background:
  radial-gradient(
    800px 400px at 20% -10%,
    rgba(255,106,0,0.10),
    transparent 60%
  ),
  #0F1115;
```
Use: `bg-header-glow`

> ⚠️ No full-page gradients. Only subtle, directional warmth.

---

## 9️⃣ Spacing Scale

| Size | Tailwind | Rem |
|------|----------|-----|
| xs | `2` | 0.5rem |
| sm | `3-4` | 0.75–1rem |
| md | `6` | 1.5rem |
| lg | `8` | 2rem |
| xl | `10-12` | 2.5–3rem |

**Rules:**
- Card padding: `p-4` (default), `p-6` (dense desktop)
- Section spacing: `space-y-6`
- Between title and meta: `space-y-1` or `space-y-2`

---

## 🔟 Radius & Shadows

### Radius
| Element | Class |
|---------|-------|
| Buttons | `rounded-xl` |
| Cards | `rounded-2xl` |
| Inputs | `rounded-xl` |
| Chips | `rounded-full` |

### Shadows
| Element | Class |
|---------|-------|
| Cards | `shadow-sm` or none |
| Modals | `shadow-lg` |

---

## Typography

| Element | Size | Weight |
|---------|------|--------|
| Page Titles | `text-2xl` / `text-3xl` | `font-semibold` |
| Card Titles | `text-lg` | `font-semibold` |
| Body | `text-sm` / `text-base` | — |
| Meta | `text-xs` / `text-sm` | `text-muted-foreground` |

---

## Quick Reference: Tailwind Classes

```css
/* Backgrounds */
bg-background      /* #0F1115 - page */
bg-card            /* #171A20 - cards */
bg-muted           /* #1E232B - elevated */
bg-primary         /* #FF6A00 - CTA */
bg-accent          /* #FFC700 - highlight */

/* Text */
text-foreground           /* #FAFAF7 */
text-muted-foreground     /* warm muted */
text-primary              /* #FF6A00 */

/* Custom utilities (globals.css) */
bg-brand-orange           /* #FF6A00 */
bg-brand-orange-hover     /* #FF8126 */
bg-brand-yellow           /* #FFC700 */
text-status-open          /* #FFC700 */
text-status-busy          /* #FF6A00 */
border-subtle             /* rgba(255,255,255,0.08) */
card-featured-glow        /* yellow glow */
bg-header-glow            /* warm header gradient */
```
