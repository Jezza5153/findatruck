# Interaction Patterns — FindATruck

This is the standard behavior for loading, errors, empty states, filtering, and selection.
Do not invent new patterns per screen.

## 1) Loading
### Rule: Skeletons over spinners
- Use skeletons when content shape is known (cards, lists).
- Use spinners only for:
  - tiny inline actions (button submit)
  - unknown/variable duration tasks

### Standard states
- Initial page load:
  - Show skeleton for list/cards
  - Map shows placeholder/skeleton until ready
- Refresh:
  - Keep current data visible
  - Show subtle "updating" indicator
  - No full-screen wipe

### Button loading
- Disable button
- Show loader icon
- Keep label visible when possible

## 2) Errors
### Rule: Always provide a next step
Patterns:
- Inline error for sections (preferred)
- Toast only for transient errors
- Never show raw stack traces to user

Copy rules:
- Explain what happened in human terms
- Offer 1 action: retry, change filter, check connection

Examples:
- "We couldn't load trucks right now. Try again."
- "No results for these filters. Reset filters."

## 3) Empty states
### Rule: Helpful, not apologetic
Empty state must include:
- What it means
- What the user can do next
- Optional shortcut action

Examples:
- "No trucks nearby right now. Try expanding the radius."
- "No events for this neighborhood. Show all events."

## 4) Filtering
### Rule: Filters feel instant
- Local filtering preferred (no network round-trips) unless required.
- Inputs:
  - Search: debounce
  - Chips: immediate
  - Toggle open-now: immediate

When filtering changes:
- Keep scroll position stable when possible
- Animate minimally (no dramatic transitions)
- If results list becomes empty, show empty state immediately

## 5) Selection syncing (Map <-> List)
### Rule: One selected item at a time
When user selects a marker:
- Highlight corresponding card
- Optionally scroll the list to it (only if not disruptive)
When user selects a card:
- Highlight marker
- Center map gently (no aggressive zoom)

Never:
- Select multiple items by accident
- Teleport map unexpectedly
- Cause list re-render storms

## 6) Status semantics (Open / Closed)
### Rule: Not color-only
Status must be indicated by:
- Label text ("Open now", "Closed")
- Icon or badge
- Color as secondary reinforcement

Status must remain consistent across:
- Markers
- Cards
- Widget

## 7) Widget/embed behavior
### Rule: Predictable in unknown containers
- No global CSS leakage
- Avoid viewport-based heights
- Prefer content-sized layout
- Safe defaults:
  - `useApi` true
  - `showHeader` true
  - graceful fallback if API fails

## 8) Micro-interactions
- Hover states only as enhancement
- Mobile must work without hover
- Focus visible always
- Transition durations subtle (avoid slow animations)

## 9) Copy style (FindATruck tone)
- Short
- Direct
- No corporate wording
- No "Oops!" unless it fits your brand voice
