# ARCHITECTURE — FindATruck

This document explains how FindATruck is structured and how code should be changed safely.

## 1) What FindATruck does
FindATruck is a fast, mobile-first food truck discovery app:
- Users find trucks near them on a map
- Users can filter by neighborhood (wijken), tags, open status, and events
- Data can come from:
  - API (production)
  - Local mock data (dev/demo)
- There is a customer-facing embed widget that must stay stable

Primary goals:
- Speed
- Stability
- Clear UI
- Predictable data flows

## 2) Main principles
- Server-first rendering when possible
- Keep client bundles small
- Maps are client-only, everything else should prefer server components
- Data fetching should be centralized, cached where appropriate
- Avoid duplication of types and schemas

## 3) High-level flow
1. Page loads with server-rendered shell (fast)
2. Client map mounts only where needed
3. Data loads from API (or fallback demo data)
4. UI renders event cards and truck cards
5. Filtering is local UI state, not database calls, unless explicitly needed

## 4) Directory map

### App Router pages
- `src/app/`
  - Responsible for routing and composing pages
  - Prefer Server Components by default
  - Use Client Components only for:
    - Map
    - Drag, drop
    - Complex interactive filters
    - Anything that depends on browser APIs (geolocation)

Typical routes:
- `src/app/page.tsx` - Marketing or landing page
- `src/app/map/page.tsx` - Main discovery experience
- `src/app/owner/*` - Owner dashboard
- `src/app/customer/*` - Customer dashboard
- `src/app/admin/*` - Admin tools
- `src/app/api/*` - API routes

### UI components
- `src/components/`
  - Reusable UI primitives and feature components
  - Rules:
    - Presentational components should be stateless where possible
    - Feature components can own state, but keep it contained

### Lib layer
- `src/lib/`
  - Core utilities, auth, database, validation
  - `src/lib/db/` - Drizzle config and schema
  - `src/lib/auth.ts` - NextAuth configuration
  - `src/lib/stripe.ts` - Payment integration
  - `src/lib/storage.ts` - R2 file storage
  - `src/lib/rate-limit.ts` - Request rate limiting
  - `src/lib/validation.ts` - Zod schemas

### Types
- `src/lib/types.ts` - Shared TypeScript types
- `src/lib/db/schema.ts` - Database schema (source of truth)

Rule: Never duplicate data shapes across files. Import the type or schema.

### Database
- `src/lib/db/schema.ts` - Database schema (17 tables)
- `src/lib/db/index.ts` - Database connection
- `drizzle/` - Migrations

Rule: UI never talks to the database directly, always through API routes.

## 5) Performance boundaries
- Map components must be:
  - Dynamically imported when possible
  - Client-only
  - Isolated to avoid pulling heavy libraries into the rest of the app
- Avoid re-render storms:
  - Memoize heavy lists
  - Debounce filter inputs if needed
  - Keep derived data in `useMemo`

## 6) Error handling strategy
- API layer returns consistent error shapes
- UI shows:
  - Skeletons on load
  - Friendly empty states
  - Minimal toasts for failures
- No raw errors shown to end users

## 7) What not to do
- Do not refactor file structure without explicit instruction
- Do not change widget props in breaking ways
- Do not add new state management libraries
- Do not add new UI frameworks
- Do not introduce a new backend approach without agreement
