---
phase: 17-push-notification-settings
plan: 03
status: complete
date: 2026-04-07
---

# Plan 17-03 Summary: Cron Worker + VAPID + Deploy

## Outcome

Standalone `cbc-cron-worker/` Cloudflare Worker created with two cron triggers (daily 08:45 KST + every 5 minutes) to dispatch push notifications. VAPID keys generated and stored as secrets in both projects. Pages app and cron worker deployed to production. D1 `push_subscriptions` table verified accessible.

## Tasks

### Task 1: Create cbc-cron-worker project + cron handler — auto

**Files created:**
- `cbc-cron-worker/package.json` — `@block65/webcrypto-web-push@^1.0.2`
- `cbc-cron-worker/tsconfig.json` — ES2022 + Workers types
- `cbc-cron-worker/wrangler.toml` — D1 binding to `cha-bio-db`, crons `["45 23 * * *", "*/5 * * * *"]`
- `cbc-cron-worker/src/index.ts` — `scheduled` handler with daily + event branches
- `cbc-cron-worker/.gitignore`

**Verified column names against actual migrations:**
- `check_records.status='bad' AND resolved_at IS NULL` ✓
- `schedule_items.status != 'done'` ✓ (enum: `pending|in_progress|done|overdue`)
- `schedule_items.category = 'event'` ✓ (matches `SchedulePage.tsx` value `'event'` not `'행사'`)
- `education_records` has no `next_due` column → derived from `completed_at + 2 years - 30 days`

**Commit:** `feat(17-03): create cbc-cron-worker project with daily + event cron handlers`

### Task 2: Generate VAPID keys, deploy, verify — checkpoint:human-action

User performed:
1. ✓ Generated VAPID keys via `npx web-push generate-vapid-keys`
2. ✓ Stored `VAPID_PUBLIC_KEY` as Pages secret on `cbc7119`
3. ✓ Stored `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` as cron worker secrets
4. ✓ Applied D1 migration `0045_push_subscriptions.sql` to remote
5. ✓ Deployed Pages project (`npm run deploy -- --branch production`)
6. ✓ Deployed Cron Worker (`npx wrangler deploy`)
7. ✓ E2E verification on production

**Automated verification:** `wrangler d1 execute cha-bio-db --remote` confirms `push_subscriptions` table exists and is queryable.

## Architecture

- **Cron #1 (daily 08:45 KST):** queries today's schedules, yesterday's incomplete, unresolved bad findings, education D-30. Sends per-subscription push respecting `notification_preferences`.
- **Cron #2 (every 5 min):** queries today's `category='event'` schedule items with `time` set, computes time diff window (13–17min for D-06, 3–7min for D-07).
- **410/404 handling:** dead push endpoints auto-deleted from D1 to prevent accumulation.
- **VAPID isolation:** private key only on cron worker (signs payloads), public key on both projects (Pages serves to browser for `applicationServerKey`).

## Requirements

- **NOTI-01** ✓ — PWA push subscription via VAPID + Settings UI toggle
- **NOTI-02** ✓ — Schedule alerts (daily + incomplete) toggleable per type
- **NOTI-03** ✓ — Unresolved issue alerts toggleable

## Deviations

- `category` value: plan said `'행사'`, actual codebase value is `'event'` — corrected.
- `education_records.next_due`: column doesn't exist — computed from `completed_at + 2 years - 30 days` (refresher cycle assumption).
- `@block65/webcrypto-web-push` API: `buildPushPayload` returns `{ headers, method, body }` with no `endpoint` — uses subscription endpoint directly for fetch URL. `PushSubscription` type requires `expirationTime: null` field.
