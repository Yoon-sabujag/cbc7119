---
phase: 25-panel-monitoring
plan: 06
subsystem: pwa
tags: [service-worker, workbox, push, notificationclick, deep-link, fire-alarm, panel-monitoring]

# Dependency graph
requires: [25-03, 25-04]
provides:
  - SW push handler forwards payload url + alarmType into notification.data (superset payload 호환)
  - notificationclick 딥링크 — data.url 우선, existing WindowClient.navigate(url) 후 focus / 없으면 openWindow(url)
  - fallback map — fire -> /fire-alarm, equip -> /inspection?panel=fire-alarm
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "injectManifest SW 에서 event.data.json() superset destructure — 구 payload(url undefined)는 fallback 으로 안전 폴백"
    - "WindowClient.navigate 존재 가드 (typeof existing.navigate === 'function') — 미지원 환경은 focus 폴백 (TS-safe)"
    - "notificationclick 목적지 = data.url || (alarmType/type==='equip' ? /inspection?panel=fire-alarm : /fire-alarm), 백엔드 per-type url verbatim 우선"

key-files:
  created: []
  modified:
    - cha-bio-safety/src/sw.ts

key-decisions:
  - "openWindow('/') 하드코딩 제거 — data.url 딥링크 + fire/equip fallback 로 대체, 기존 precache/runtime-cache/push-show 로직 무변경"
  - "open-redirect 방지 — url 은 same-origin app 경로에만 client.navigate/openWindow, cross-origin URL 구성 안 함 (T-25-06a mitigate); fallback 은 고정 literal"
  - "기존 focus-only 대신 existing.navigate(url).then(focus) — 이미 열린 창을 목적지로 실제 이동 (25-03/25-04 destinations 존재)"

patterns-established:
  - "SW notification.data 를 통한 push -> in-app deep-link 라우팅 (payload url 우선 + type 기반 fallback)"

requirements-completed: [PANEL-UI-08]

# Metrics
duration: ~8min
completed: 2026-07-01
---

# Phase 25 Plan 06: Service Worker 푸시 딥링크 Summary

**`src/sw.ts` 의 push 핸들러가 §1.4 superset payload 의 `url` + `alarmType` 을 `notification.data` 로 전달하고, notificationclick 이 `data.url`(백엔드 per-type url verbatim 우선, 없으면 fire -> /fire-alarm / equip -> /inspection?panel=fire-alarm fallback)을 읽어 이미 열린 WindowClient 면 `navigate(url)` 후 focus, 없으면 `openWindow(url)` 로 실제 딥링크 이동 — 기존 `openWindow('/')` 하드코딩 제거, precache/runtime-cache/push-show 로직은 무변경.**

## Performance
- **Duration:** ~8 min
- **Completed:** 2026-07-01
- **Tasks:** 1
- **Files modified:** 1 (sw.ts, +18/-5)

## Accomplishments
- **Task 1 — push url 전달 + notificationclick 딥링크 (8c5dc65):**
  - **push 핸들러:** `event.data.json()` destructure 를 `{ title, body, type, url, alarmType }` superset 으로 확장(모두 optional — 구 payload 는 url/alarmType undefined 로 안전), `showNotification` options 의 `data: { type }` -> `data: { type, url, alarmType }`. `tag: type || 'default'` / icon / badge / body / try-catch 무변경.
  - **notificationclick:** `event.notification.close()` 후 목적지 계산 — `const data = event.notification.data || {}`, `const fallback = (data.alarmType === 'equip' || data.type === 'equip') ? '/inspection?panel=fire-alarm' : '/fire-alarm'`, `const url = data.url || fallback`. `matchAll` 핸들러: existing same-origin WindowClient 발견 시 `typeof existing.navigate === 'function' ? existing.navigate(url).then(c => c ? c.focus() : existing.focus()) : existing.focus()` (navigate 미지원 TS-safe 폴백), 없으면 `self.clients.openWindow(url)`. `event.waitUntil(...)` 유지.

## Task Commits
1. **Task 1: SW push forwards url+alarmType, notificationclick navigates via data.url** - `8c5dc65` (feat)

## Files Created/Modified
- `cha-bio-safety/src/sw.ts` - push 핸들러 url/alarmType 전달 + notificationclick 딥링크(navigate/openWindow) + fire/equip fallback. injectManifest `precacheAndRoute(self.__WB_MANIFEST)`, workbox runtime-cache(floorplan CacheFirst / api NetworkFirst), skipWaiting/clientsClaim/cleanupOutdatedCaches 무변경.

## Decisions Made
- 딥링크 목적지는 `data.url` (백엔드 per-type url) verbatim 우선 — forward-compatible. 없을 때만 type 기반 fallback (fire takeover 를 default 로).
- `existing.navigate` 존재 가드로 WindowClient.navigate 타이핑 이슈 회피 + 구형 환경 focus 폴백 — tsc clean.
- open-redirect(T-25-06a) — url 은 same-origin app 경로에만 사용, cross-origin URL 미구성; fallback 은 고정 literal. 기존 try/catch (T-25-06b) 유지로 malformed payload 는 fallback.

## Deviations from Plan
None. 플랜대로 push 전달 + notificationclick 딥링크만 augment, 나머지 SW 로직 무변경.

## Issues Encountered
None. `npx tsc --noEmit` 프로젝트 전역 clean.

## User Setup Required
None. 백엔드 push (VAPID) 는 이 디자인 트랙(cbc7119-preview)에 의도적으로 미배포 -> 실제 push tap -> /fire-alarm(fire) / 화재수신반 페이지(equip) 통합 검증은 백엔드 배포된 staging/prod 에서만 가능. SW 변경의 목적지 존재성은 25-03(?panel=fire-alarm auto-open) / 25-04(/fire-alarm route)로 검증됨.

## Verification
- `cd cha-bio-safety && npx tsc --noEmit` — clean.
- grep present: `data: { type, url, alarmType }`, `data.url`, `/fire-alarm`, `panel=fire-alarm`, `.navigate(`.
- 하드코딩 `openWindow('/')` 단독 경로 제거 (url 변수 기반 openWindow(url) 로 대체).
- Emoji-zero + arrow-zero (Korean 코멘트 `->` ASCII 사용).
- Scope: sw.ts 단일 파일만 수정.

## Self-Check: PASSED
