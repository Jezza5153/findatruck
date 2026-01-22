# UI Review Checklist — FindATruck

Use this checklist for every UI PR. If any critical item fails, it's not ready.

## A) 3-Second Test (Critical)
- [ ] Within 3 seconds, a first-time user understands what this screen does.
- [ ] The primary action is visually obvious.
- [ ] The most important info is visible without reading paragraphs.

If not: simplify hierarchy, reduce noise, increase contrast.

---

## B) Visual Hierarchy
- [ ] One primary CTA (only one).
- [ ] Secondary actions are visually quieter.
- [ ] Titles are clearly stronger than body text.
- [ ] Status (Open/Closed, Today, Distance) is scannable in < 1 sec.
- [ ] No "everything is bold" problem.

---

## C) Layout Stability (No Jank)
- [ ] No layout shift on load (CLS near zero).
- [ ] Skeleton matches final layout.
- [ ] Images/icons don't pop in and move text.
- [ ] Cards keep consistent height where reasonable.
- [ ] Filters don't cause reflow storms.

---

## D) Interaction Feedback (No Dead Clicks)
- [ ] Every button has a pressed/active state.
- [ ] Loading states are visible and accurate.
- [ ] Disabled states are obvious and explainable.
- [ ] Errors show a helpful next step.
- [ ] Empty state explains what to do next.

---

## E) Mobile-First (Reality Check)
Assume: one hand + bad network + bright daylight.
- [ ] Tap targets >= 44px.
- [ ] No hover-only interactions.
- [ ] Modals/sheets are thumb-friendly.
- [ ] Critical info appears above the fold.
- [ ] No tiny chips, no micro text.

---

## F) Accessibility (Non-negotiable)
- [ ] Semantic elements: button/link/input correct.
- [ ] Keyboard navigation works.
- [ ] Focus rings are visible.
- [ ] Inputs have labels (not only placeholders).
- [ ] Icon buttons have aria-label.
- [ ] Contrast is acceptable.

---

## G) Performance & Render Discipline
- [ ] No new heavy dependency introduced for UI polish.
- [ ] List rendering avoids unnecessary re-renders (memoization if needed).
- [ ] Derived data uses useMemo (only where helpful).
- [ ] Handlers use useCallback when passed deep.
- [ ] Map code stays isolated and does not bloat the rest of the app.

---

## H) FindATruck-Specific Checks

### Map Experience
- [ ] Map renders fast (no blank screen).
- [ ] Open/Closed status is unmistakable.
- [ ] Marker interactions are predictable.
- [ ] Selecting a marker clearly highlights the related card (or vice versa).
- [ ] Map errors do not break the page.

### Truck / Event Cards
- [ ] Title + status + distance/time visible at a glance.
- [ ] Actions (navigate, details, share) are obvious.
- [ ] Card does not feel cramped.
- [ ] Content doesn't overflow or wrap awkwardly.

### Embed Widget
- [ ] No global styles leak.
- [ ] Default props unchanged.
- [ ] Works in unknown container widths.
- [ ] Height behavior stable (no jumpy resize).

---

## Decision Rule
If you must choose:
**Clarity > density**  
**Stability > cleverness**  
**Speed > extra features**
