# DO NOT TOUCH — Protected Areas (FindATruck)

This file lists code and behaviors that must not be changed unless explicitly requested.
If a change is needed, propose it first, explain the risk, and provide a safe plan.

## 1) Auth and session logic
Protected:
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/auth-helpers.ts` - Auth utility functions
- `src/middleware.ts` - Route protection
- Session callbacks and token logic

Rule:
- Do not touch auth unless there is a clear bug report with reproducible steps.

## 2) Database schema
Protected:
- `src/lib/db/schema.ts` - All 17 tables
- `drizzle/` - Migration history
- Production data integrity

Rule:
- No schema changes without explicit instruction.
- No destructive migrations.
- No data resets.
- No fake data in production queries.

## 3) Environment variables and deployment wiring
Protected:
- `.env.local` variable names
- Runtime assumptions (Edge vs Node)
- Cloudflare R2, Neon, Stripe config glue

Rule:
- Do not rename env vars.
- If new vars are required, add them in a backward compatible way and document them.

Current protected env vars:
- `DATABASE_URL`
- `AUTH_SECRET`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## 4) Map provider integration
Protected:
- Google Maps initialization and loader logic
- API key usage patterns
- Marker clustering logic
- Leaflet fallback (if present)

### Marker System (locked)
Asset base path: `/public/markers` → referenced as `/markers/*`

State priority (highest wins):
1. selected → `truck-selected.gif` (56px)
2. event → `event-default.svg` (48px)
3. featured → `truck-default.svg` (48px)
4. busy → `truck-busy.gif` (48px)
5. open → `truck-open.gif` (48px)
6. closed → `truck-closed.svg` (40px)
7. default → `truck-default.svg` (40px)

Animation rule:
- GIFs allowed ONLY when zoom ≥ 14
- When zoom < 14, all animated states use `truck-default.svg`
- Clusters are ALWAYS static (`cluster.svg`, 38px)

Key files:
- `src/lib/map/markers.ts` - Asset paths, sizing, state resolver
- `src/lib/map/clusterRenderer.ts` - Cluster styling
- `src/lib/map/network.ts` - Slow network detection
- `src/components/FoodTruckMap.tsx` - Imperative marker management

Animation gating (slow internet safety):
- Initial load: ONLY static SVG markers (no GIFs)
- GIF animation requires ALL conditions:
  - User has interacted (drag/click) OR 2s idle
  - Zoom ≥ 15
  - Network is not slow (no 2g/slow-2g, no saveData)
- Cap: Only selected + 6 nearest visible markers can animate

Rule:
- Do not swap map libraries.
- Do not change marker semantics (state priority, zoom threshold, sizes) unless requested.
- Do not move marker assets out of `/public/markers/`.
- Do not weaken animation gating (protects slow networks).

## 5) Payment integration
Protected:
- `src/lib/stripe.ts` - Stripe client and helpers
- `src/app/api/stripe/webhook/route.ts` - Webhook handler
- `src/lib/idempotency.ts` - Payment deduplication

Rule:
- No changes to payment flows without explicit approval.
- Webhook idempotency must remain intact.

## 6) Rate limiting and security
Protected:
- `src/lib/rate-limit.ts` - Rate limiter configuration
- `src/lib/alerting.ts` - Security alerting
- CSP and security headers

Rule:
- Do not weaken rate limits.
- Do not disable fail-closed behavior for high-risk endpoints.

## 7) SEO and public routes
Protected:
- Metadata patterns in layout files
- Canonical URLs
- robots.txt, sitemap if present

Rule:
- Do not remove structured data or SEO metadata.

## 8) Release quality gates
Protected:
- TypeScript strict mode
- ESLint rules
- Format rules

Rule:
- Do not disable failing checks. Fix root causes instead.

---

## How to propose a change to protected areas

When a protected change is required, respond with:
1. What is broken and why it matters
2. The smallest safe change
3. Risk assessment
4. Rollback plan
