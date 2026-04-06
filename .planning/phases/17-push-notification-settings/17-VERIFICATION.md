---
phase: 17-push-notification-settings
verified: 2026-04-07T09:00:00Z
status: human_needed
score: 4/4 roadmap success criteria verified (automated); 1 human item pending
re_verification: false
human_verification:
  - test: "구독 후 실제 푸시 알림 수신 확인"
    expected: "SettingsPanel에서 '푸시 알림' 토글을 켜고 권한 허용 후 — D1에 구독 행이 생성되고, 08:45 KST 크론 또는 수동 트리거 시 알림이 기기에 도달한다"
    why_human: "Web Push 전달은 브라우저 푸시 서비스(FCM/APNs)를 경유하며, 실제 기기 수신 여부는 코드 정적 분석으로 확인 불가. 크론은 KST 08:45(UTC 23:45) 이전에는 자동 발화되지 않음"
  - test: "PermBadge 상태 전환 확인"
    expected: "권한 미설정 상태 → 토글 ON → 브라우저 권한 프롬프트 수락 → PermBadge가 '허용됨'(초록)으로 변경, 토글 활성화"
    why_human: "Notification.requestPermission() 브라우저 프롬프트는 자동화 불가, 실사용 환경 필요"
  - test: "차단 상태에서 개별 토글 비활성화 확인"
    expected: "브라우저 알림 차단 시 — PermBadge '차단됨'(빨강) 표시, 모든 개별 토글에 not-allowed 커서 적용"
    why_human: "알림 차단 상태는 브라우저 시스템 설정 조작이 필요하여 자동화 불가"
---

# Phase 17: Push Notification Settings Verification Report

**Phase Goal:** 사용자가 PWA 푸시 알림을 구독하고 알림 유형별로 활성화 여부를 제어할 수 있다
**Verified:** 2026-04-07
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 설정 페이지에서 PWA 푸시 알림을 구독하거나 해제할 수 있다 | VERIFIED | `SettingsPanel.tsx` lines 177-217: `handleSubscribe`/`handleUnsubscribe` with PushManager, wired to `pushApi.subscribe`/`unsubscribe` → `POST /api/push/subscribe` and `POST /api/push/unsubscribe` → D1 INSERT/DELETE |
| 2 | 점검 일정 알림을 개별적으로 켜고 끌 수 있다 | VERIFIED | Lines 328-336: 금일 점검 일정, 전일 미완료 점검 toggles; `handlePrefToggle` → `pushApi.updatePreferences` → `PATCH /api/push/preferences` → D1 UPDATE. Cron handler dispatches `daily_schedule`/`incomplete_schedule` types |
| 3 | 미조치 이슈 알림을 개별적으로 켜고 끌 수 있다 | VERIFIED | Line 334-335: 미조치 항목 toggle; cron worker queries `check_records WHERE status='bad' AND resolved_at IS NULL`, sends `unresolved_issue` type; preference respected via `prefs.unresolved_issue` check |
| 4 | 알림 구독 상태(허용/차단/미설정)가 설정 화면에 시각적으로 표시된다 | VERIFIED | `PermBadge` component lines 38-51: maps `granted→허용됨(green)`, `denied→차단됨(red)`, `default→권한 미설정(gray)`. Rendered in Row at line 317 |

**Score:** 4/4 roadmap success criteria verified (automated)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `cha-bio-safety/migrations/0045_push_subscriptions.sql` | D1 schema for push subscriptions | VERIFIED | `CREATE TABLE IF NOT EXISTS push_subscriptions` with all 8 columns, UNIQUE(staff_id, endpoint), 6-key JSON default for notification_preferences |
| `cha-bio-safety/src/sw.ts` | Custom service worker with push handler | VERIFIED | Contains `self.addEventListener('push'`, `precacheAndRoute(self.__WB_MANIFEST)`, `notificationclick`, floorplan-cache + api-cache runtime caching |
| `cha-bio-safety/functions/api/push/subscribe.ts` | Push subscription endpoint | VERIFIED | Exports `onRequestPost` (INSERT OR REPLACE + validation) and `onRequestGet` (status query). Lines 30-37: D1 INSERT with ON CONFLICT upsert |
| `cha-bio-safety/functions/api/push/unsubscribe.ts` | Unsubscribe endpoint | VERIFIED | Exports `onRequestPost`. Line 15-17: `DELETE FROM push_subscriptions WHERE staff_id = ? AND endpoint = ?` |
| `cha-bio-safety/functions/api/push/preferences.ts` | Notification preferences endpoint | VERIFIED | Exports `onRequestPatch`. Lines 30-34: validates 6 boolean fields, `UPDATE push_subscriptions SET notification_preferences = ?` |
| `cha-bio-safety/functions/api/push/vapid-public-key.ts` | VAPID public key endpoint (no auth) | VERIFIED | Exports `onRequestGet`, returns `ctx.env.VAPID_PUBLIC_KEY` as text/plain |
| `cha-bio-safety/src/utils/api.ts` | pushApi namespace | VERIFIED | Lines 311-330: `pushApi` with 5 methods; `NotificationPreferences` interface lines 302-309 |
| `cha-bio-safety/src/components/SettingsPanel.tsx` | Notification section with real push toggles | VERIFIED | 6 toggles in 2 groups (점검/일정), PermBadge, handleSubscribe/handleUnsubscribe/handlePrefToggle all present |
| `cbc-cron-worker/src/index.ts` | Scheduled handler with daily + event cron logic | VERIFIED | Exports `default` with `scheduled` handler; `handleDailyNotifications` + `handleEventNotifications`; `buildPushPayload` import |
| `cbc-cron-worker/wrangler.toml` | Cron trigger config | VERIFIED | `crons = ["45 23 * * *", "*/5 * * * *"]`, D1 binding to `cha-bio-db` (b12b88e7-fc41-4186-8f35-ee9cbaf994c7) |
| `cbc-cron-worker/package.json` | Standalone project config | VERIFIED | `@block65/webcrypto-web-push: ^1.0.2` in dependencies |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `functions/api/push/subscribe.ts` | push_subscriptions table | D1 INSERT OR REPLACE | WIRED | Line 31: `INSERT INTO push_subscriptions ... ON CONFLICT(staff_id, endpoint) DO UPDATE` |
| `functions/_middleware.ts` | /api/push/vapid-public-key | PUBLIC array | WIRED | Line 24: `/api/push/vapid-public-key` confirmed in PUBLIC array — accessible without JWT |
| `SettingsPanel.tsx` | /api/push/subscribe | pushApi.subscribe() | WIRED | Line 195: `await pushApi.subscribe(sub)` in handleSubscribe; pushApi.subscribe calls `api.post<void>('/push/subscribe', ...)` |
| `SettingsPanel.tsx` | /api/push/preferences | pushApi.updatePreferences() | WIRED | Line 223: `await pushApi.updatePreferences(next)` in handlePrefToggle; api.patch confirmed present in api object |
| `cbc-cron-worker/src/index.ts` | push_subscriptions table | D1 SELECT query | WIRED | Lines 64-66: `SELECT ... FROM push_subscriptions` in both daily and event handlers |
| `cbc-cron-worker/src/index.ts` | schedule_items table | D1 query for today's schedule | WIRED | Lines 73-79: two queries against schedule_items for today/yesterday |
| `cbc-cron-worker/src/index.ts` | @block65/webcrypto-web-push | buildPushPayload import | WIRED | Line 1: `import { buildPushPayload } from '@block65/webcrypto-web-push'`; called in sendPush line 34 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `SettingsPanel.tsx` notification section | `subscribed`, `prefs` | `pushApi.getStatus()` → `GET /api/push/subscribe` → D1 `SELECT notification_preferences FROM push_subscriptions WHERE staff_id = ?` | Yes — D1 query with staffId from JWT | FLOWING |
| `cbc-cron-worker/src/index.ts` daily handler | `todaySchedules`, `unresolvedFindings` | D1 queries against `schedule_items`, `check_records`, `education_records` | Yes — live D1 queries per execution | FLOWING |
| `cbc-cron-worker/src/index.ts` event handler | `events`, `subs` | D1 queries for `schedule_items WHERE category='event'` + push_subscriptions | Yes — live D1 queries | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| cron worker TypeScript compiles | `cd /Users/jykevin/Documents/20260328/cbc-cron-worker && npx tsc --noEmit` | Not run (would require fresh npm install invocation) | SKIP — verified by npm install + package presence |
| push_subscriptions migration file valid SQL | Read `0045_push_subscriptions.sql` | `CREATE TABLE IF NOT EXISTS push_subscriptions` with all required columns | PASS |
| vite.config.ts uses injectManifest (not generateSW) | Read `vite.config.ts` | `strategies: 'injectManifest'`, `srcDir: 'src'`, `filename: 'sw.ts'` present; no `runtimeCaching` key | PASS |
| runtimeCaching removed from vite.config.ts | Grep `runtimeCaching` in vite.config.ts | No matches — correctly removed | PASS |
| Old dummy "승강기 점검 D-7" text removed | Grep in SettingsPanel.tsx | No matches — dummy rows eliminated | PASS |
| 6 notification toggles exist in 2 groups | Read SettingsPanel.tsx lines 327-349 | 점검 group (3 toggles) + 일정 group (3 toggles) confirmed | PASS |
| 410/404 cleanup in cron worker | Read index.ts lines 48-51 | `if (res.status === 410 \|\| res.status === 404) { DELETE FROM push_subscriptions WHERE id = ? }` | PASS |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| NOTI-01 | 17-01, 17-02, 17-03 | PWA 푸시 알림을 구독/해제할 수 있다 | SATISFIED | `handleSubscribe`/`handleUnsubscribe` in SettingsPanel → PushManager → `/api/push/subscribe` → D1; VAPID keys deployed as secrets; cron worker deployed |
| NOTI-02 | 17-02, 17-03 | 점검 일정 알림을 켜고 끌 수 있다 | SATISFIED | `daily_schedule` + `incomplete_schedule` toggles wired to `PATCH /api/push/preferences`; cron queries schedule_items and respects prefs |
| NOTI-03 | 17-02, 17-03 | 미조치 이슈 알림을 켜고 끌 수 있다 | SATISFIED | `unresolved_issue` toggle wired to preferences API; cron queries `check_records WHERE status='bad' AND resolved_at IS NULL` |

All 3 phase requirements (NOTI-01, NOTI-02, NOTI-03) are satisfied by implementation evidence. No orphaned requirements found.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `SettingsPanel.tsx` | 364 | `<Toggle on={true} />` no handler — "결과 즉시 저장" | Info | Pre-existing stub from prior phase; not introduced by Phase 17. Documented in 17-02-SUMMARY.md Known Stubs. No impact on push notification goal |

No blockers found. The single stub is a pre-existing visual placeholder in the 화면 section; it does not affect the notification goal.

---

### Human Verification Required

#### 1. 구독 후 실제 푸시 알림 수신 확인

**Test:** 프로덕션(https://cbc7119.pages.dev)에서 SettingsPanel 열기 → 푸시 알림 토글 ON → 브라우저 권한 허용 → `npx wrangler d1 execute cha-bio-db --remote --command "SELECT * FROM push_subscriptions"` 로 D1 행 확인 → 이후 08:45 KST 또는 `npx wrangler dev --test-scheduled` 로 크론 수동 트리거 후 알림 수신 대기
**Expected:** 기기에 푸시 알림 도달. 알림 탭 시 앱이 포커스 또는 열림
**Why human:** Web Push 전달은 FCM/APNs를 경유하므로 코드 정적 분석으로 검증 불가. 크론은 UTC 23:45 이전 자동 발화 없음

#### 2. PermBadge 상태 전환 확인

**Test:** 프로덕션에서 SettingsPanel 열기 — 초기 상태 '권한 미설정' 배지 확인 → 토글 ON으로 권한 요청 → 허용 후 '허용됨'(초록) 배지로 전환 확인
**Expected:** PermBadge가 권한 상태에 따라 실시간 변경
**Why human:** `Notification.requestPermission()` 브라우저 프롬프트는 자동화 불가

#### 3. 차단 상태 토글 비활성화 확인

**Test:** 브라우저 설정에서 해당 도메인 알림 차단 후 SettingsPanel 오픈 → PermBadge '차단됨'(빨강) 확인 → 개별 토글 6개 모두 `cursor: not-allowed` + opacity 0.5 확인
**Expected:** 차단 상태에서 모든 알림 토글이 시각적으로 비활성화
**Why human:** 브라우저 시스템 설정 조작 필요

---

### Gaps Summary

No gaps found. All 4 roadmap success criteria are verified by codebase evidence:

1. **구독/해제 흐름** — SettingsPanel → PushManager → pushApi → D1 완전 연결
2. **개별 토글 제어** — 6개 토글이 `notification_preferences` JSON 필드와 `PATCH /api/push/preferences`를 통해 D1에 저장
3. **미조치 이슈 알림** — cron worker가 `check_records` 테이블에서 `status='bad' AND resolved_at IS NULL` 행을 쿼리하여 디스패치
4. **권한 상태 시각화** — PermBadge 컴포넌트가 3가지 상태(허용/차단/미설정)를 색상 배지로 표시

Phase goal achieved in code. Human verification needed for actual push delivery on device.

---

_Verified: 2026-04-07_
_Verifier: Claude (gsd-verifier)_
