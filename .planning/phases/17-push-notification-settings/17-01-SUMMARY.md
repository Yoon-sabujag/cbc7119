---
phase: 17-push-notification-settings
plan: "01"
subsystem: push-infrastructure
tags: [push-notifications, service-worker, pwa, d1, api]
dependency_graph:
  requires: []
  provides: [push-subscription-api, custom-service-worker, push-event-handler]
  affects: [cha-bio-safety/functions/api/push, cha-bio-safety/src/sw.ts, cha-bio-safety/vite.config.ts]
tech_stack:
  added: ["@block65/webcrypto-web-push@^1.0.2", "workbox-precaching", "workbox-core", "workbox-routing", "workbox-strategies", "workbox-expiration"]
  patterns: [injectManifest, d1-insert-or-replace, cloudflare-pages-functions]
key_files:
  created:
    - cha-bio-safety/migrations/0045_push_subscriptions.sql
    - cha-bio-safety/functions/api/push/subscribe.ts
    - cha-bio-safety/functions/api/push/unsubscribe.ts
    - cha-bio-safety/functions/api/push/preferences.ts
    - cha-bio-safety/functions/api/push/vapid-public-key.ts
    - cha-bio-safety/src/sw.ts
  modified:
    - cha-bio-safety/functions/_middleware.ts
    - cha-bio-safety/vite.config.ts
    - cha-bio-safety/tsconfig.json
    - cha-bio-safety/package.json
decisions:
  - "Use INSERT OR REPLACE with ON CONFLICT(staff_id, endpoint) to upsert subscriptions — handles re-subscribe gracefully"
  - "POST /api/push/unsubscribe instead of DELETE for simpler body parsing in Cloudflare Pages Functions"
  - "WebWorker added to tsconfig lib rather than separate tsconfig for sw to keep config simple"
  - "D1 migration applied to remote immediately (wrangler d1 execute --remote)"
metrics:
  duration: "~25 min"
  completed: "2026-04-07"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 4
---

# Phase 17 Plan 01: Push Notification Infrastructure Summary

Push notification infrastructure established using D1 storage, Cloudflare Pages Functions API endpoints, and a custom VitePWA service worker with injectManifest strategy.

## What Was Built

**D1 Schema** (`migrations/0045_push_subscriptions.sql`): `push_subscriptions` table with `staff_id`, `endpoint`, `p256dh`, `auth`, and `notification_preferences` (JSON, all-true defaults). Unique constraint on `(staff_id, endpoint)` for upsert safety. Applied to remote D1 immediately.

**API Endpoints** (4 files):
- `GET /api/push/subscribe` — returns current subscription status + preferences for the authenticated staff member
- `POST /api/push/subscribe` — upserts a push subscription (INSERT OR REPLACE) with input validation per T-17-03
- `POST /api/push/unsubscribe` — removes subscription by `(staff_id, endpoint)`
- `PATCH /api/push/preferences` — updates `notification_preferences` JSON for all subscriptions of the staff member
- `GET /api/push/vapid-public-key` — returns VAPID public key without auth (added to `_middleware.ts` PUBLIC array)

**Custom Service Worker** (`src/sw.ts`): Full injectManifest-compatible service worker with:
- `precacheAndRoute(self.__WB_MANIFEST)` for precaching
- Runtime caching ported from vite.config.ts (floorplan-cache CacheFirst, api-cache NetworkFirst)
- `push` event handler: parses JSON payload, shows notification via `showNotification`
- `notificationclick` handler: focuses existing app window or opens new one

**VitePWA Config** (`vite.config.ts`): Migrated from `generateSW` to `injectManifest` strategy. `workbox.runtimeCaching` block removed (now in sw.ts). `injectManifest.globIgnores` preserves floorplan exclusion.

**TypeScript Config** (`tsconfig.json`): Added `"WebWorker"` to `lib` array for `ServiceWorkerGlobalScope`, `PushEvent`, `NotificationEvent` type resolution.

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | D1 migration + API endpoints | 2816f12 | migrations/0045, functions/api/push/*, _middleware.ts, package.json |
| 2 | VitePWA injectManifest + custom SW | 9df9323 | src/sw.ts, vite.config.ts, tsconfig.json |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All endpoints are fully wired to D1. Service worker push handler is production-ready (pending VAPID key provisioning by user).

## Threat Flags

No new threat surface beyond the plan's threat model. T-17-01 through T-17-05 mitigations applied:
- staffId always from JWT payload, never from request body (T-17-01)
- Input validation on endpoint, p256dh, auth before D1 insert (T-17-03)
- VAPID_PRIVATE_KEY not referenced in this plan (Plan 03 concern)

## Self-Check: PASSED

- `cha-bio-safety/migrations/0045_push_subscriptions.sql` — FOUND
- `cha-bio-safety/functions/api/push/subscribe.ts` — FOUND
- `cha-bio-safety/functions/api/push/unsubscribe.ts` — FOUND
- `cha-bio-safety/functions/api/push/preferences.ts` — FOUND
- `cha-bio-safety/functions/api/push/vapid-public-key.ts` — FOUND
- `cha-bio-safety/src/sw.ts` — FOUND
- Commit 2816f12 — FOUND
- Commit 9df9323 — FOUND
- `npm run build` — PASSED (injectManifest mode, 60 precache entries)
