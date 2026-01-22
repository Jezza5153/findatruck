# RELEASE CHECKLIST — FindATruck

Use this checklist before every production deploy.
Goal: fast, stable, no surprises.

## 0) Quick sanity
- [ ] I can create an account and log in
- [ ] The main map page loads fast with no blank screen
- [ ] Filters work and do not lag
- [ ] Truck cards render correctly
- [ ] Event cards render correctly
- [ ] Open and closed status is correct
- [ ] No console errors in production build

## 1) Build and type safety
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes locally

Red flags:
- Any `any` types added to "make it work"
- Silencing errors instead of fixing
- New eslint disables

## 2) Bundle and performance
- [ ] Map code is client-only and isolated
- [ ] No large new dependencies added without reason
- [ ] No new heavy libraries pulled into shared components
- [ ] No obvious re-render storms (filters, lists, widget)

Checks:
- [ ] Largest pages still feel instant on mobile
- [ ] Skeletons show instead of spinner loops
- [ ] API errors do not freeze the UI

## 3) Data integrity and API
- [ ] API calls are centralized, not duplicated all over UI
- [ ] Error handling returns friendly empty states
- [ ] Fallback demo data only used when intended

If DB changes:
- [ ] No schema changes unless explicitly approved
- [ ] No destructive queries or deletes introduced
- [ ] `npm run db:push` runs cleanly

## 4) Auth and security
- [ ] Login flow works
- [ ] Role-based access enforced (customer/owner/admin)
- [ ] Protected routes redirect properly
- [ ] No secrets committed
- [ ] CSP not weakened

## 5) Payments (if Stripe configured)
- [ ] Checkout session creation works
- [ ] Webhook handler processes events
- [ ] Idempotency prevents double charges
- [ ] Subscription status updates correctly

## 6) SEO and public pages
- [ ] Titles and meta descriptions still render
- [ ] Canonical URLs still correct
- [ ] Noindex not accidentally enabled

## 7) Deployment smoke test (production)
After deploy:
- [ ] Homepage loads
- [ ] Map loads and shows trucks
- [ ] Filters work
- [ ] A truck detail view opens
- [ ] Health endpoint returns healthy: `curl /api/health`
- [ ] No spike in 500 errors

## 8) Rollback plan
- [ ] I can revert the deployment quickly
- [ ] I know what commit caused the change
- [ ] I can disable new features behind a flag (if used)

---

## Quick commands

```bash
# Full pre-deploy check
npm run typecheck && npm run lint && npm run build

# Health check
curl -s http://localhost:9002/api/health | jq

# Database studio
npm run db:studio

# Push schema changes
npm run db:push
```
