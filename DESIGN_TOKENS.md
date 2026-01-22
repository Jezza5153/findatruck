# Design Tokens — FindATruck (Tailwind + shadcn)

These tokens create a consistent "calm, premium, fast" UI.
Do not freestyle spacing/typography per component.

## 1) Spacing Scale (use these only)
Use Tailwind spacing utilities in this scale:
- xs: 2 (0.5rem)
- sm: 3-4 (0.75–1rem)
- md: 6 (1.5rem)
- lg: 8 (2rem)
- xl: 10-12 (2.5–3rem)

Rules:
- Card padding: p-4 (default), p-6 (dense desktop)
- Section spacing: space-y-6
- Between title and meta: space-y-1 or space-y-2
- Do not stack random p-5, p-7 unless justified.

## 2) Radius
- Buttons: rounded-xl
- Cards: rounded-2xl
- Inputs: rounded-xl
- Chips: rounded-full

Consistency beats "variety".

## 3) Shadows
Keep subtle:
- Cards: shadow-sm
- Modals: shadow-lg
Avoid heavy shadows for normal UI.

## 4) Typography (scannability)
Use a predictable hierarchy:

### Page Titles
- text-2xl / text-3xl
- font-semibold

### Section Titles / Card Titles
- text-lg
- font-semibold

### Body
- text-sm / text-base
- leading-relaxed for paragraphs, leading-snug for meta

### Meta (status, time, distance)
- text-xs / text-sm
- muted foreground

Rules:
- Never rely on color alone for status.
- Numbers must be easy to scan: use tabular-nums where useful.

## 5) Color discipline (shadcn tokens)
Use shadcn semantic classes:
- bg-background / text-foreground
- text-muted-foreground
- border-border
- bg-muted
- ring-ring

Avoid hardcoding hex colors in components.
If you must add brand accents, do it via theme tokens.

## 6) Component density presets

### Card (default)
- p-4, rounded-2xl, border, shadow-sm
- title text-lg
- meta text-sm muted
- actions aligned right, minimal

### Card (compact list)
- p-3
- title text-base
- meta text-xs

### Filter chips
- small, but finger-friendly
- no tiny hit areas
- keep to one line, scroll horizontally if needed

## 7) Icon usage (Lucide)
Rules:
- Icons are supportive, not decoration.
- Sizes:
  - inline icon: h-4 w-4
  - buttons: h-4 w-4 or h-5 w-5
- Always include accessible label if icon-only.

## 8) Map layout tokens (FindATruck)
- Map container min-height on mobile: enough to feel like "the product"
- Avoid layout jumps:
  - reserve height
  - skeleton placeholder for map
- Cards should not fight the map visually
