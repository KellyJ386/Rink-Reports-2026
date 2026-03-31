# Rink Reports Development Roadmap

## Context

Rink Reports is an ice rink facility management PWA (Next.js 14 + Supabase + Tailwind). The codebase is at **~13,250 lines across 105 files** with TypeScript compiling clean. All 8 modules have fully built-out frontend pages and ~30 API routes. The app is in a **strong mid-build state** — the UI layer and core architecture are well-established, but several backend, testing, and production-readiness gaps remain.

---

## Current State Summary

### What's Done Well
- **All 8 module pages**: Fully built with forms, history views, offline support, draft persistence
- **Auth system**: Login, forgot/reset password, role hierarchy (6 levels), module-level access control
- **Dashboard layout**: Sidebar, header, breadcrumbs, mobile responsive, dark mode tokens
- **Offline-first architecture**: IndexedDB sync queue, offline banner, draft auto-save via `useFormDraft`
- **Design system**: Tailwind config with brand tokens, dark mode (`class` strategy), 48px touch targets
- **PWA basics**: manifest.json, sw.js, service worker registration in root layout
- **SVG diagrams**: RinkDiagram + BodyDiagram components
- **API routes**: Server-side Supabase client, facility_id isolation, Zod validation (daily-reports)
- **Admin panel**: 8 sections (facility, rinks, users, modules, equipment, thresholds, notifications, retention)

### What's Missing / Incomplete
See roadmap phases below.

---

## Roadmap

### Phase 1: Backend Hardening (High Priority)
**Goal: Make all API routes production-ready**

1. **Zod validation on all API routes** — Only `daily-reports/tabs` has validation schemas. Add Zod schemas for all POST/PUT endpoints across all modules.
   - Files: `src/lib/validations/` (add schemas per module), all `src/app/api/**/route.ts`

2. **Missing API routes** — Several endpoints referenced by frontend pages don't exist:
   - `/api/ice-operations/rinks` and `/api/ice-operations/machines` (ice-ops page fetches these)
   - `/api/scheduling/shift-types` and `/api/scheduling/employees`
   - `/api/incidents/locations`
   - `/api/refrigeration/equipment/[id]/fields`
   - `/api/air-quality/locations` and `/api/air-quality/reports`
   - `/api/admin/rinks`, `/api/admin/thresholds`, `/api/admin/retention`
   - `/api/reports/generate` (general report generation)
   - `/api/dashboard/alerts`

3. **RLS policy audit** — Verify Row Level Security on all Supabase tables. Every query must filter by `facility_id`.

4. **Auth middleware enforcement** — `src/middleware.ts` handles session refresh, but verify protected routes actually reject unauthenticated requests at the API layer.

---

### Phase 2: Database & Schema (High Priority)
**Goal: Ensure Supabase schema matches all module needs**

1. **Verify/create tables** for all modules:
   - `daily_report_tabs`, `daily_report_checklist_items`, `daily_report_entries`
   - `ice_depth_templates`, `ice_depth_measurement_points`, `ice_depth_readings`
   - `ice_cuts`, `blade_changes`, `edging_logs`, `circle_checks`, `circle_check_items`
   - `shifts`, `shift_types`, `availability`, `swap_requests`
   - `incidents` (with body_parts JSON field)
   - `refrigeration_equipment`, `refrigeration_reading_fields`, `refrigeration_readings`
   - `air_quality_metrics`, `air_quality_readings`
   - `facilities`, `profiles`, `equipment`, `notification_settings`, `retention_settings`

2. **Update `src/types/database.ts`** to match actual Supabase schema (add generated types via `supabase gen types`)

---

### Phase 3: Onboarding & Billing (Medium Priority)
**Goal: Complete the signup-to-paid flow**

1. **Onboarding flow** — 3-step flow (Account Creation -> Facility Info -> Stripe Checkout)
   - Pages: `/onboarding/step-1`, `/step-2`, `/step-3`
   - API: `/api/onboarding/facility` exists but needs the full flow

2. **Stripe integration** — `/api/billing/webhook` and `/api/billing/create-checkout-session` exist but need verification:
   - Webhook handles `checkout.session.completed`, subscription updates, cancellations
   - Subscription status check middleware (block access if subscription lapsed)

3. **HubSpot webhook** — `/api/hubspot/inactivity-check` exists; verify it creates Company + Contact on signup and tags 30-day inactive users

---

### Phase 4: Testing (Medium Priority)
**Goal: Establish test coverage**

- **No test files exist currently** (0 test files found)
- Priority testing targets:
  1. Auth hook (`useAuth`) — role hierarchy, module access
  2. Offline sync queue (`sync-queue.ts`) — add/process/retry logic
  3. API routes — auth checks, validation, facility isolation
  4. UI components — Button, Input, Modal, Checkbox render correctly
  5. Form pages — submission flow, error handling, draft persistence

---

### Phase 5: PWA & Offline Hardening (Medium Priority)
**Goal: Reliable offline experience**

1. **Service worker** — `public/sw.js` exists but needs verification:
   - Cache strategy for app shell, API responses, static assets
   - Background sync for queued form submissions

2. **Offline sync queue** — `src/lib/offline/sync-queue.ts` exists; verify:
   - Exponential backoff on retry
   - Conflict resolution strategy
   - Queue persistence across page reloads

3. **next-pwa integration** — Listed in CLAUDE.md but NOT in `package.json` or `next.config.js`. Either add it or document the manual approach.

---

### Phase 6: Export & Reporting (Lower Priority)
**Goal: PDF/CSV/Excel export for all modules**

1. **Air Quality compliance reports** — Report generation modal exists in UI; backend `/api/air-quality/reports` needs implementation using `jspdf` + `xlsx`
2. **General report endpoint** — `/api/reports/generate` route exists; implement for all modules
3. **Incident reports** — 7-year retention with exportable records

---

### Phase 7: Notification System (Lower Priority)
**Goal: In-app + email alerts**

1. **Notification service** — `src/lib/notifications.ts` exists; connect to:
   - Threshold alerts (air quality, refrigeration out-of-range)
   - Shift swap requests (scheduling)
   - Admin-configurable notification channels (in-app, email, SMS)
2. **Notification bell** — Header shows `notificationCount={0}` hardcoded; connect to real data via `/api/notifications`

---

### Phase 8: Polish & Production (Lower Priority)
**Goal: Launch-ready quality**

1. **Dark mode toggle** — Tailwind `darkMode: 'class'` configured but no user-facing toggle exists
2. **Profile page** — `/dashboard/profile` exists; verify password change and profile editing work
3. **Accessibility audit** — WCAG 2.1 AA compliance (aria labels, focus management, contrast ratios)
4. **Error boundaries** — Add React error boundaries for graceful failure
5. **Loading skeletons** — Replace spinner-only loading states with content skeletons
6. **Favicon & icons** — `public/icons/` exists; verify apple-touch-icon and all PWA icon sizes

---

## Verification

After each phase:
1. `npx tsc --noEmit` — TypeScript compiles clean
2. `npm run lint` — No ESLint errors
3. `npm run build` — Production build succeeds
4. Manual smoke test of affected modules
5. (Phase 4+) `npm run test` — All tests pass
