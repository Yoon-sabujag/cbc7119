# Phase 17: Push Notification Settings — Research

**Researched:** 2026-04-07
**Domain:** Web Push API + VAPID + Cloudflare Workers Cron + VitePWA Service Worker
**Confidence:** MEDIUM — core patterns verified via official docs and npm registry; cron architecture has a critical constraint confirmed via community sources

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** iOS 26+ 타겟으로 업데이트 — PWA 푸시 알림 완전 지원, fallback 불필요
- **D-02:** 금일 점검 일정 알림 — Cron #1 (08:45 KST) 발송
- **D-03:** 전일 미완료 점검 알림 — Cron #1 (08:45 KST) 발송
- **D-04:** 미조치 항목 알림 — Cron #1 (08:45 KST) 발송
- **D-05:** 교육 D-30 알림 — Cron #1 (08:45 KST) 발송
- **D-06:** 행사 15분전 알림 — Cron #2 (*/5 매 5분) 발송
- **D-07:** 행사 5분전 알림 — Cron #2 (*/5 매 5분) 발송
- **D-08:** Cron 2개 사용 — #1: 매일 08:45 KST, #2: */5 (행사 임박)
- **D-09:** Cloudflare Workers 무료 플랜 Cron Trigger 한도 (최대 5개) 내 운용, 여유 3개
- **D-10:** 알림 토글 ON 시 브라우저 권한 요청 자동 트리거 → 허용 시 자동 구독
- **D-11:** 브라우저 권한 차단 시 토글 비활성화(회색) + 탭하면 "브라우저 설정에서 알림을 허용해주세요" 안내
- **D-12:** 그룹 분리 배치 — 점검 그룹(금일 점검/미완료/미조치) | 일정 그룹(행사/교육 D-30)
- **D-13:** 기존 SettingsPage의 알림 섹션 스타일(Row + Toggle 컴포넌트) 유지
- **D-14:** Web Push API + VAPID 키 사용 — Cloudflare Workers에서 web-push 발송
- **D-15:** D1에 push_subscriptions 테이블 생성 (staff_id, endpoint, p256dh, auth, notification_preferences JSON)
- **D-16:** notification_preferences에 알림 유형별 on/off 저장 (서버사이드, 구독 시 기본 전체 ON)

### Claude's Discretion
- VAPID 키 생성 및 환경변수 관리 방식
- push_subscriptions 테이블 상세 스키마
- Cron Worker 내부 로직 구조
- 푸시 메시지 본문 포맷
- Service Worker push event handler 구현 상세

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NOTI-01 | PWA 푸시 알림을 구독/해제할 수 있다 | Browser Permission flow, PushManager.subscribe(), D1 push_subscriptions table, Pages Functions API endpoints |
| NOTI-02 | 점검 일정 알림을 켜고 끌 수 있다 | notification_preferences JSON column, separate Cron Worker querying schedule_items |
| NOTI-03 | 미조치 이슈 알림을 켜고 끌 수 있다 | notification_preferences JSON column, Cron Worker querying check_records/remediation |
</phase_requirements>

---

## Summary

Phase 17 implements PWA push notifications using the Web Push API with VAPID authentication, Cloudflare D1 for subscription storage, and Cloudflare Workers Cron Triggers for scheduled dispatch. The most critical architectural constraint uncovered in research: **Cloudflare Pages Functions do NOT support cron triggers** — a separate, standalone Cloudflare Worker with its own `wrangler.toml` is required for the Cron job. This separate worker can bind to the same D1 database (`cha-bio-db`) using the same `database_id`.

The second critical constraint: the popular `web-push` npm package does NOT work on Cloudflare Workers (uses Node.js `crypto.createECDH` which is unavailable). The correct library is `@block65/webcrypto-web-push` (v1.0.2, uses Web Crypto API, verified compatible with Cloudflare Workers).

For the service worker: the current VitePWA configuration uses `generateSW` (auto-generated). To add a custom push event handler, the strategy must change to `injectManifest`, requiring a custom `sw.ts` that preserves all current workbox caching behavior while adding the push event listener.

**Primary recommendation:** Deploy a separate `cbc-cron-worker/` Cloudflare Worker project alongside the existing `cbc7119` Pages project. Both bind to the same D1 database. VAPID keys are generated once (CLI tool) and stored as Worker secrets in both projects.

---

## Project Constraints (from CLAUDE.md)

These directives must be honored in all planning:

- **Stack locked:** Cloudflare Pages + D1 + R2 — no external services, no additional $cost
- **TypeScript only** for all application code (functions, workers, migrations)
- **Inline styles + CSS variables** for React components (no CSS modules, no new CSS libraries)
- **React Query mutations** for API calls (not raw fetch in components)
- **D1 migration files** in `cha-bio-safety/migrations/` directory, numbered `00NN_name.sql`
- **Error messages in Korean** for user-visible errors
- **No Prettier/ESLint** — follow existing code style (2-space indent, single quotes)
- **Strict mode disabled** in tsconfig — don't add strict type annotations unnecessarily
- **Named exports** for utilities/components, default export for page components
- **Naming:** PascalCase components, camelCase utilities, UPPER_SNAKE_CASE constants

---

## Critical Architecture Finding: Cron Triggers Require a Separate Worker

**[VERIFIED: Cloudflare Community + Official Docs]**

Cloudflare Pages Functions (`functions/` directory) support only HTTP request handlers (`onRequestGet`, `onRequestPost`, etc.). They do NOT support the `scheduled()` handler. This is confirmed by official docs and community consensus.

**Approach: Separate Cloudflare Worker project**

```
# New directory alongside cha-bio-safety/
cbc-cron-worker/
├── wrangler.toml        # name = "cbc-cron-worker", [triggers], [[d1_databases]]
├── src/
│   └── index.ts         # export default { scheduled() { ... } }
└── package.json
```

The cron worker's `wrangler.toml` binds to the **same** D1 database by using the same `database_id = "b12b88e7-fc41-4186-8f35-ee9cbaf994c7"` from the existing `wrangler.toml`. This is fully supported — multiple Workers/Pages projects can bind to the same D1 database.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@block65/webcrypto-web-push` | 1.0.2 | Send VAPID-authenticated push notifications from Workers | Only Edge-compatible Web Push library; `web-push` (Node crypto) does not work on Cloudflare Workers |
| `workbox-precaching` | 7.4.0 | Precache manifest injection in custom service worker | Required when switching VitePWA to `injectManifest` strategy |
| `workbox-core` | 7.4.0 | `clientsClaim()`, `skipWaiting()` for SW lifecycle | Required by workbox patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `workbox-routing` | 7.4.0 | Runtime caching routes in custom SW | Needed to preserve current API + floorplan caching |
| `workbox-strategies` | 7.4.0 | `NetworkFirst`, `CacheFirst` strategies | Needed to preserve current runtime caching |

**Version verification:** [VERIFIED: npm registry — 2026-04-07]
- `@block65/webcrypto-web-push`: 1.0.2 (published 2024)
- `workbox-*`: 7.4.0 (published 2024)
- `web-push`: 3.6.7 — DO NOT USE on Cloudflare Workers

### VAPID Key Generation (CLI, one-time)

VAPID keys are generated once using the library's CLI and stored as Worker secrets. They do NOT go in version control.

```bash
# Generate VAPID key pair (run once, save output securely)
node -e "
const { generateVapidKeys } = require('@block65/webcrypto-web-push');
generateVapidKeys().then(keys => console.log(JSON.stringify(keys, null, 2)));
"
```

The output is two Base64url-encoded strings: `publicKey` and `privateKey` (P-256 ECDH keys).

**Store as Cloudflare secrets (not in wrangler.toml vars):**
```bash
# For the Pages project (needed to serve public key to browser)
echo "YOUR_PUBLIC_KEY" | npx wrangler pages secret put VAPID_PUBLIC_KEY --project-name cbc7119

# For the cron worker (needed to sign push requests)
echo "YOUR_PUBLIC_KEY"  | npx wrangler secret put VAPID_PUBLIC_KEY  --name cbc-cron-worker
echo "YOUR_PRIVATE_KEY" | npx wrangler secret put VAPID_PRIVATE_KEY --name cbc-cron-worker
```

**Installation:**
```bash
# In cha-bio-safety/ (Pages project — for sending push from Pages API if needed)
npm install @block65/webcrypto-web-push

# In cha-bio-safety/ (dev dependencies for custom service worker)
npm install -D workbox-precaching workbox-core workbox-routing workbox-strategies

# In cbc-cron-worker/ (new separate Worker project)
npm install @block65/webcrypto-web-push
```

---

## Architecture Patterns

### Recommended Project Structure

```
# Existing Pages project (add to)
cha-bio-safety/
├── src/
│   ├── pages/SettingsPage.tsx          # Add notification section with real toggles
│   └── sw.ts                           # NEW: custom service worker (injectManifest)
├── functions/
│   └── api/
│       └── push/
│           ├── subscribe.ts            # POST /api/push/subscribe
│           ├── unsubscribe.ts          # DELETE /api/push/unsubscribe
│           └── preferences.ts          # PATCH /api/push/preferences
├── migrations/
│   └── 0045_push_subscriptions.sql     # NEW: push_subscriptions table
└── vite.config.ts                      # Change strategies to injectManifest

# New standalone cron worker
cbc-cron-worker/
├── src/
│   └── index.ts                        # scheduled() handler
├── wrangler.toml                       # [triggers] crons, [[d1_databases]]
└── package.json
```

### Pattern 1: D1 Schema for push_subscriptions

```sql
-- migrations/0045_push_subscriptions.sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id                       TEXT PRIMARY KEY,
  staff_id                 TEXT NOT NULL REFERENCES staff(id),
  endpoint                 TEXT NOT NULL,
  p256dh                   TEXT NOT NULL,
  auth                     TEXT NOT NULL,
  notification_preferences TEXT NOT NULL DEFAULT '{"daily_schedule":true,"incomplete_schedule":true,"unresolved_issue":true,"education_reminder":true,"event_15min":true,"event_5min":true}',
  created_at               TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at               TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(staff_id, endpoint)
);
```

**Field mapping from browser PushSubscription:**
- `endpoint` ← `subscription.endpoint`
- `p256dh` ← `subscription.getKey('p256dh')` → Base64url string
- `auth` ← `subscription.getKey('auth')` → Base64url string

**notification_preferences keys:**

| Key | Cron | D-02 to D-07 mapping |
|-----|------|----------------------|
| `daily_schedule` | Cron #1 | D-02 금일 점검 일정 |
| `incomplete_schedule` | Cron #1 | D-03 전일 미완료 점검 |
| `unresolved_issue` | Cron #1 | D-04 미조치 항목 |
| `education_reminder` | Cron #1 | D-05 교육 D-30 |
| `event_15min` | Cron #2 | D-06 행사 15분전 |
| `event_5min` | Cron #2 | D-07 행사 5분전 |

### Pattern 2: Cron Worker wrangler.toml

```toml
name = "cbc-cron-worker"
compatibility_date = "2024-09-23"
main = "src/index.ts"

[[d1_databases]]
binding = "DB"
database_name = "cha-bio-db"
database_id = "b12b88e7-fc41-4186-8f35-ee9cbaf994c7"

[triggers]
crons = [
  "45 23 * * *",   # 08:45 KST = 23:45 UTC previous day
  "*/5 * * * *"    # every 5 minutes
]
```

**Timezone note:** KST = UTC+9. 08:45 KST = 23:45 UTC (previous calendar day).
The cron expression `"45 23 * * *"` fires at 23:45 UTC every day, which is 08:45 KST the next morning.

### Pattern 3: Scheduled Handler with Cron Discrimination

```typescript
// cbc-cron-worker/src/index.ts
export interface Env {
  DB: D1Database
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    switch (controller.cron) {
      case '45 23 * * *':
        ctx.waitUntil(handleDailyNotifications(env))
        break
      case '*/5 * * * *':
        ctx.waitUntil(handleEventNotifications(env))
        break
    }
  }
}
```

`controller.cron` returns the exact cron string that fired. Use `switch` on it to route logic.
[VERIFIED: Cloudflare Scheduled Handler docs]

### Pattern 4: Sending a Push Notification

```typescript
// Source: @block65/webcrypto-web-push pattern
import { buildPushPayload } from '@block65/webcrypto-web-push'

async function sendPush(env: Env, sub: PushSubRow, payload: { title: string; body: string; type: string }) {
  const { endpoint, headers, body } = await buildPushPayload(
    { data: JSON.stringify(payload) },
    {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth }
    },
    {
      subject: 'mailto:admin@chabio.com',
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY,
    }
  )
  const res = await fetch(endpoint, { method: 'POST', headers, body })
  if (res.status === 410) {
    // Subscription expired — delete from D1
    await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(sub.endpoint).run()
  }
}
```

HTTP 410 from push service = subscription gone. Always delete from D1 on 410.

### Pattern 5: Browser Subscription Flow (React)

```typescript
// In SettingsPage.tsx — subscribing to push
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

async function subscribeUser(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.ready
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  const vapidPublicKey = await fetch('/api/push/vapid-public-key').then(r => r.text())
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  })
}
```

**Permission states:** `'granted'` | `'denied'` | `'default'`
- `'denied'` → toggle disabled (greyed), tap shows 안내 toast
- `'default'` → first toggle ON triggers `requestPermission()`

### Pattern 6: VitePWA injectManifest + Push Handler

Switch from `generateSW` to `injectManifest` in `vite.config.ts`:

```typescript
// vite.config.ts change
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  // ... manifest stays same
})
```

Create `cha-bio-safety/src/sw.ts`:

```typescript
/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Preserve existing runtime caching
registerRoute(
  ({ url }) => /\/floorplans\/.+\.(svg|png|pdf)$/.test(url.pathname),
  new CacheFirst({ cacheName: 'floorplan-cache', plugins: [{ ... }] })
)
registerRoute(
  ({ request, url }) => request.method === 'GET' && /\/api\//.test(url.pathname),
  new NetworkFirst({ cacheName: 'api-cache', plugins: [{ ... }] })
)

// Push event handler
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return
  const { title, body } = event.data.json()
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    })
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
```

**tsconfig.json change needed:** Add `"webworker"` to `compilerOptions.lib` so `ServiceWorkerGlobalScope` resolves.

### Pattern 7: Pages API Endpoints

Three new endpoints follow existing `functions/api/` file-based routing pattern:

```
POST   /api/push/subscribe      → save subscription to D1
DELETE /api/push/unsubscribe    → remove subscription from D1
PATCH  /api/push/preferences    → update notification_preferences JSON
GET    /api/push/vapid-public-key → return VAPID_PUBLIC_KEY (public route)
```

The VAPID public key endpoint must be added to the `PUBLIC` array in `_middleware.ts`:
```typescript
const PUBLIC = ['/api/auth/login', '/api/health', '/api/push/vapid-public-key']
```

### Anti-Patterns to Avoid

- **Using `web-push` npm package:** It uses `crypto.createECDH` (Node.js only). Always fails on Cloudflare Workers with "crypto.createECDH is not a function". Use `@block65/webcrypto-web-push` instead.
- **Storing VAPID keys in wrangler.toml `[vars]`:** These go in `wrangler secret` (encrypted), never in plaintext config.
- **Putting cron handler in `functions/` directory:** Pages Functions do not expose a `scheduled()` export. It will silently do nothing.
- **Skipping 410 handling:** When a push service returns 410, the subscription is permanently gone. Not cleaning up from D1 causes every future cron to send to dead endpoints, wasting CPU time on the 10ms free plan limit.
- **Calling `requestPermission()` outside a user gesture:** Browsers require permission requests to originate from a user action (button click). The toggle's `onClick` is the correct place.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| VAPID authentication & payload encryption | Custom ECDH/HKDF crypto in Workers | `@block65/webcrypto-web-push` | Push payload encryption (ECDH + HKDF + AES-GCM) is complex; spec compliance is non-trivial |
| Workbox precache manifest injection | Manual cache-busting SW | VitePWA `injectManifest` strategy | Hash-based cache invalidation requires build-tool integration |
| VAPID key generation | Custom P-256 key generation | Library CLI or `crypto.subtle.generateKey` + export | Key format (uncompressed EC point, Base64url) is easy to get wrong |

**Key insight:** The Web Push encryption spec (RFC 8291) involves layered ECDH + HKDF + AES-128-GCM. Hand-rolling this against different push services (FCM, APNs Web Push) is guaranteed to fail in subtle ways. Use the verified library.

---

## Common Pitfalls

### Pitfall 1: iOS Push Requires PWA to be Added to Home Screen
**What goes wrong:** Push notifications silently do nothing on iOS even with permission granted
**Why it happens:** Apple only enables push for iOS PWAs added to the Home Screen, not for in-browser visits. This is intentional per Apple's implementation.
**How to avoid:** iOS 16.4+ is required (D-01 sets iOS 26+ target, so fully satisfied). The app already has a proper PWA manifest with `"display": "standalone"` which enables the capability. No code change needed; just user education that the app must be on the Home Screen.
**Warning signs:** Push works on Android/desktop but silently fails on iOS → user hasn't added to Home Screen
[VERIFIED: iOS 16.4+ requirement via MDN + Apple Developer Forums]

### Pitfall 2: KST/UTC Time Conversion in Cron
**What goes wrong:** Cron fires at wrong time (e.g., 08:45 UTC instead of 08:45 KST)
**Why it happens:** Cloudflare Cron Triggers execute on UTC exclusively. There is no timezone option.
**How to avoid:** 08:45 KST = 23:45 UTC previous day → use `"45 23 * * *"`. The scheduled time's calendar date in UTC differs from KST date — when generating "today's schedule" notifications, query using KST date, not UTC date: `new Date(controller.scheduledTime + 9*3600*1000)`.
**Warning signs:** Daily notifications arriving at 17:45 (8:45 UTC = 17:45 KST) instead of 08:45 KST

### Pitfall 3: Cron 10ms CPU Limit on Free Plan
**What goes wrong:** Cron worker is killed after 10ms CPU time, notifications not sent
**Why it happens:** Cloudflare Workers free plan limits CPU time to 10ms per invocation (wall time is 15 min, but CPU time is 10ms)
**How to avoid:** Keep cron logic minimal — a D1 query + push fetch is fast. Avoid heavy computation. Use `ctx.waitUntil()` for each push fetch call (they are I/O, not CPU). Up to ~50 async fetch calls should complete within the 15-min wall time well within 10ms CPU.
**Warning signs:** Cron worker logs show early termination; not all subscribers receive notifications

### Pitfall 4: generateSW vs injectManifest Migration
**What goes wrong:** After switching to `injectManifest`, workbox routing stops working; API cache disappears; floorplan cache stops working
**Why it happens:** `generateSW` auto-generated the runtime caching from `workbox.runtimeCaching` config. With `injectManifest`, you own the entire SW and must manually recreate these routes.
**How to avoid:** Port every `runtimeCaching` entry from current `vite.config.ts` to `sw.ts` as explicit `registerRoute()` calls. Verify in browser devtools Network tab that API responses are still served from cache on repeated requests.
**Warning signs:** After update, API responses always show "(from network)"; floorplan images not cached

### Pitfall 5: PushSubscription Keys Are ArrayBuffer Not String
**What goes wrong:** `p256dh`/`auth` stored as `[object ArrayBuffer]` in D1
**Why it happens:** `subscription.getKey('p256dh')` returns `ArrayBuffer | null`, not a string
**How to avoid:** Convert to Base64url before storing:
```typescript
function arrayBufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
const p256dh = arrayBufferToBase64(subscription.getKey('p256dh')!)
const auth = arrayBufferToBase64(subscription.getKey('auth')!)
```

### Pitfall 6: Duplicate Subscriptions Per Staff
**What goes wrong:** One staff member accumulates multiple subscriptions (phone + tablet + browser); cron sends duplicate notifications
**Why it happens:** Each device/browser has a distinct endpoint. Without deduplication, subscribing on multiple devices creates multiple rows.
**How to avoid:** D1 schema uses `UNIQUE(staff_id, endpoint)` — INSERT OR REPLACE handles re-subscription on the same device gracefully. Multiple devices per user intentionally deliver to all of them (desired behavior for 4-person team).

---

## Code Examples

### Subscribe endpoint (Pages Function)

```typescript
// functions/api/push/subscribe.ts
import type { PagesFunction } from '@cloudflare/workers-types'

interface Env { DB: D1Database; VAPID_PUBLIC_KEY: string }

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { staffId } = (ctx as any).data
  const { endpoint, keys } = await ctx.request.json() as {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }
  const id = crypto.randomUUID()
  await ctx.env.DB.prepare(`
    INSERT INTO push_subscriptions (id, staff_id, endpoint, p256dh, auth)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(staff_id, endpoint) DO UPDATE SET
      p256dh = excluded.p256dh,
      auth = excluded.auth,
      updated_at = datetime('now')
  `).bind(id, staffId, endpoint, keys.p256dh, keys.auth).run()
  return Response.json({ success: true })
}
```

### Preferences endpoint (Pages Function)

```typescript
// functions/api/push/preferences.ts
export const onRequestPatch: PagesFunction<Env> = async (ctx) => {
  const { staffId } = (ctx as any).data
  const prefs = await ctx.request.json()
  await ctx.env.DB.prepare(`
    UPDATE push_subscriptions
    SET notification_preferences = ?, updated_at = datetime('now')
    WHERE staff_id = ?
  `).bind(JSON.stringify(prefs), staffId).run()
  return Response.json({ success: true })
}
```

### Daily notification cron handler (Cron Worker)

```typescript
// cbc-cron-worker/src/index.ts — handleDailyNotifications
async function handleDailyNotifications(env: Env) {
  // Convert scheduled time to KST date (UTC+9)
  const kstNow = new Date(Date.now() + 9 * 3600 * 1000)
  const today = kstNow.toISOString().slice(0, 10)

  const subs = await env.DB.prepare(`
    SELECT staff_id, endpoint, p256dh, auth, notification_preferences
    FROM push_subscriptions
  `).all()

  for (const sub of subs.results) {
    const prefs = JSON.parse(sub.notification_preferences as string)

    if (prefs.daily_schedule) {
      const schedules = await env.DB.prepare(
        `SELECT title FROM schedule_items WHERE date = ? OR (date <= ? AND end_date >= ?)`
      ).bind(today, today, today).all()
      if (schedules.results.length > 0) {
        await sendPush(env, sub as any, {
          title: '오늘의 점검 일정',
          body: `${schedules.results.length}건의 점검 일정이 있습니다`,
          type: 'daily_schedule'
        })
      }
    }
    // ... similar blocks for incomplete_schedule, unresolved_issue, education_reminder
  }
}
```

### SettingsPage notification section (React)

```typescript
// Notification permission state
const [permState, setPermState] = useState<NotificationPermission>(
  'Notification' in window ? Notification.permission : 'denied'
)
const [subscribed, setSubscribed] = useState(false)
const [prefs, setPrefs] = useState({
  daily_schedule: true, incomplete_schedule: true,
  unresolved_issue: true, education_reminder: true,
  event_15min: true, event_5min: true,
})

// Toggle that triggers permission request on first ON
async function handleToggleSubscribe(on: boolean) {
  if (on) {
    const result = await Notification.requestPermission()
    setPermState(result)
    if (result !== 'granted') return
    const sub = await subscribeUser()
    if (!sub) return
    await pushApi.subscribe(sub)
    setSubscribed(true)
  } else {
    await pushApi.unsubscribe()
    setSubscribed(false)
  }
}

// Preference toggle (only enabled when subscribed)
async function handlePrefToggle(key: string, on: boolean) {
  const next = { ...prefs, [key]: on }
  setPrefs(next)
  await pushApi.updatePreferences(next)
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `web-push` npm on any server | `@block65/webcrypto-web-push` or raw Web Crypto for edge | 2023-2024 | Must use Web Crypto-native library on Workers/Edge |
| VitePWA `generateSW` only | `injectManifest` for custom push handler | VitePWA 0.x+ | Custom push handler requires owning the SW file |
| iOS push never supported | iOS 16.4+ supports Web Push for installed PWAs | iOS 16.4 (March 2023) | No fallback needed for iOS 26+ target |
| Cron in Pages Functions | Separate Cloudflare Worker with `[triggers]` | Always — Pages never supported this | Requires separate Worker project deployment |

**Deprecated/outdated:**
- `web-push` npm package on edge runtimes: Does not work; replaced by Web Crypto native libraries
- VitePWA `generateSW` for push: Cannot add custom event listeners; must use `injectManifest`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@block65/webcrypto-web-push` API uses `buildPushPayload(message, subscription, vapidKeys)` signature | Code Examples | buildPushPayload call in cron worker will fail at runtime; check actual package exports before coding |
| A2 | `generateVapidKeys()` is exported from `@block65/webcrypto-web-push` for key generation | Standard Stack | Need alternative CLI for VAPID key generation (e.g., `npx web-push generate-vapid-keys`) |
| A3 | Cron Worker can query `schedule_items`, `check_records`, `education_records` tables by staff_id to compose notification content | Architecture Patterns | Cron logic may need additional D1 queries; table structures should be verified before coding |
| A4 | `workbox-routing` + `workbox-strategies` API is stable at 7.x — `registerRoute`, `NetworkFirst`, `CacheFirst` constructors unchanged | Code Examples | SW runtime caching will break if API changed |

---

## Open Questions

1. **VAPID key generation timing**
   - What we know: Keys must be generated once and stored as secrets; library provides API
   - What's unclear: Whether `generateVapidKeys()` is actually exported by `@block65/webcrypto-web-push` (README was 404 during research) — confirmed by package description and GitHub example
   - Recommendation: Wave 0 task should verify API with `node -e "const {generateVapidKeys} = require('@block65/webcrypto-web-push'); console.log(typeof generateVapidKeys)"` before writing cron code

2. **Cron Worker free plan CPU limit impact**
   - What we know: Free plan = 10ms CPU, 15 min wall time; push sends are I/O (fetch), not CPU
   - What's unclear: Whether 4 users × 6 notification types × D1 queries + fetch calls fits in 10ms CPU
   - Recommendation: Keep D1 queries to 1-2 per cron run (join, not per-user queries); use `Promise.allSettled` for concurrent push sends

3. **SettingsPage existing notification stubs**
   - What we know: Phase 16 created SettingsPage with 3 dummy toggles: 점검 미완료 알림, 미조치 항목 알림, 승강기 점검 D-7 알림 (all local state only)
   - What's unclear: Whether to reuse the existing `Toggle` component as-is or extend it to support disabled state for blocked permission
   - Recommendation: Extend Toggle to accept `disabled` and `onClick` props; the current `defaultOn` prop pattern is not suitable for controlled state

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | Installing packages, VAPID key generation | ✓ | npm 10+ | — |
| Wrangler CLI | Deploying cron worker, setting secrets | ✓ | 4.75.0 (from CLAUDE.md) | — |
| Cloudflare Workers free plan Cron slots | Cron #1 + Cron #2 | ✓ (5 slots, 2 used, 3 remaining) | — | — |
| D1 database `cha-bio-db` | Cron worker D1 binding | ✓ | database_id = b12b88e7... | — |
| Browser Push API | Subscribe in browser | ✓ iOS 16.4+ / Android 15+ / Chrome | — | — |
| `@block65/webcrypto-web-push` | Push sending | not installed yet | 1.0.2 | — |
| `workbox-precaching` | Custom SW | not installed yet | 7.4.0 | — |

**Missing dependencies with no fallback:**
- None that block architecture. All installable via npm.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

nyquist_validation is enabled (config.json: `"nyquist_validation": true`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | TypeScript compiler (`tsc --noEmit`) — no test framework detected in project |
| Config file | `cha-bio-safety/tsconfig.json` |
| Quick run command | `cd cha-bio-safety && npx tsc --noEmit` |
| Full suite command | `cd cha-bio-safety && npx tsc --noEmit` |

No Jest/Vitest/Playwright detected in project. TypeScript compilation is the primary automated check.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NOTI-01 | push_subscriptions table exists in D1 | smoke (wrangler d1 execute) | `npx wrangler d1 execute cha-bio-db --remote --command "SELECT name FROM sqlite_master WHERE name='push_subscriptions'"` | ❌ Wave 0 |
| NOTI-01 | POST /api/push/subscribe returns 200 | integration (manual) | Manual on production | — |
| NOTI-01 | Push arrives in browser after subscribe | e2e (manual) | Manual on device | — |
| NOTI-02 | daily_schedule toggle persists to D1 | integration (manual) | Manual on production | — |
| NOTI-03 | unresolved_issue toggle persists to D1 | integration (manual) | Manual on production | — |

### Sampling Rate
- **Per task commit:** `cd cha-bio-safety && npx tsc --noEmit`
- **Per wave merge:** `cd cha-bio-safety && npx tsc --noEmit` + deploy to production + manual push test on device
- **Phase gate:** Full TypeScript compilation green + push notification received on at least one device

### Wave 0 Gaps
- [ ] `cha-bio-safety/src/sw.ts` — custom service worker (new file, replaces generateSW)
- [ ] `cha-bio-safety/migrations/0045_push_subscriptions.sql` — D1 schema
- [ ] `cbc-cron-worker/` directory with `wrangler.toml` + `package.json` + `src/index.ts`
- [ ] `@block65/webcrypto-web-push` installed in both projects
- [ ] `workbox-precaching`, `workbox-core`, `workbox-routing`, `workbox-strategies` installed as devDependencies
- [ ] VAPID keys generated and stored as Cloudflare secrets

---

## Security Domain

security_enforcement is not explicitly set to false → treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | JWT middleware already enforces auth on `/api/push/*` endpoints |
| V3 Session Management | no | — |
| V4 Access Control | yes | `/api/push/subscribe` — staffId from JWT, not from request body (cannot subscribe for another user) |
| V5 Input Validation | yes | Validate `endpoint` is a URL, `p256dh`/`auth` are non-empty strings before D1 insert |
| V6 Cryptography | yes | VAPID private key stored as Cloudflare secret (encrypted at rest); never in wrangler.toml `[vars]` or version control |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Subscribing other users (staffId spoofing) | Tampering | staffId taken from JWT payload in `(ctx as any).data`, not request body |
| VAPID private key exposure | Information Disclosure | Store as `wrangler secret`, never in `wrangler.toml [vars]`, never in git |
| Push subscription endpoint scraping | Tampering | Endpoints only stored in D1, never returned to client |
| Subscription enumeration | Information Disclosure | GET /api/push/preferences only returns own preferences (JWT-scoped) |

---

## Sources

### Primary (HIGH confidence)
- [Cloudflare Scheduled Handler docs](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/) — controller.cron, handler signature
- [Cloudflare Cron Triggers docs](https://developers.cloudflare.com/workers/configuration/cron-triggers/) — wrangler.toml [triggers] syntax
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) — free plan: 5 cron triggers, 10ms CPU, 15 min wall time
- [MDN: push_event](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/push_event) — push event handler, showNotification
- npm registry — verified versions: `@block65/webcrypto-web-push@1.0.2`, `workbox-*@7.4.0`

### Secondary (MEDIUM confidence)
- [VitePWA injectManifest guide](https://vite-pwa-org.netlify.app/workbox/inject-manifest) — injectManifest strategy, sw.ts structure
- [GitHub: block65/webcrypto-web-push examples/cloudflare-workers](https://github.com/block65/webcrypto-web-push/blob/master/examples/cloudflare-workers/main.ts) — buildPushPayload usage pattern
- [GitHub: draphy/pushforge](https://github.com/draphy/pushforge) — alternative VAPID library, confirmed CF Workers compatible
- iOS 16.4 PWA push requirement — confirmed by MDN, Apple Developer Forums, multiple sources

### Tertiary (LOW confidence)
- [Cloudflare Community: Pages cron not supported](https://community.cloudflare.com/t/schedule-a-cloudflare-pages-function/615507) — confirmed via community + official docs gap (no `scheduled()` in Pages docs)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm versions verified, library CF Workers compatibility confirmed via official example
- Architecture (cron as separate worker): HIGH — confirmed by official Pages docs absence of `scheduled()` + community consensus
- Cron/KST timezone conversion: HIGH — Cloudflare docs confirm UTC-only; math is elementary
- Push subscription browser flow: HIGH — MDN verified
- Service Worker injectManifest migration: MEDIUM — VitePWA docs confirmed strategy exists; exact workbox 7.x API assumed stable
- `@block65/webcrypto-web-push` exact API signature: MEDIUM — GitHub example found but README was 404; exact function params are A1/A2 assumptions

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (30 days — libraries and Cloudflare platform are relatively stable)
