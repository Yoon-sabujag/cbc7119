---
phase: 17-push-notification-settings
plan: 02
subsystem: frontend-settings
tags: [push-notifications, settings-panel, subscription, permissions]
dependency_graph:
  requires: [17-01]
  provides: [notification-settings-ui, push-subscription-flow]
  affects: [cha-bio-safety/src/components/SettingsPanel.tsx, cha-bio-safety/src/utils/api.ts]
tech_stack:
  added: []
  patterns: [controlled-toggle, optimistic-update, permission-gate, push-subscription]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/components/SettingsPanel.tsx
decisions:
  - "Toggle made fully controlled (on/onChange/disabled) — uncontrolled pattern incompatible with server-driven subscription state"
  - "patch method added to api object — worktree version was missing it, required for updatePreferences"
  - "applicationServerKey cast via `as unknown as ArrayBuffer` — TS strict Uint8Array generic incompatibility with PushSubscriptionOptionsInit"
metrics:
  duration: 25 min
  completed: 2026-04-07
---

# Phase 17 Plan 02: Push Notification Settings UI Summary

Real push notification subscription UI replacing dummy toggles in SettingsPanel — controlled Toggle with permission gate, PermBadge, 6 preference toggles in 2 groups (점검/일정), optimistic preference updates via pushApi.

## What Was Built

**Task 1: pushApi namespace in api.ts**

Added to `cha-bio-safety/src/utils/api.ts`:
- `NotificationPreferences` interface with 6 boolean fields: `daily_schedule`, `incomplete_schedule`, `unresolved_issue`, `education_reminder`, `event_15min`, `event_5min`
- `pushApi` namespace with 5 methods: `getVapidKey` (raw fetch, plain text), `getStatus`, `subscribe` (with base64url key encoding), `unsubscribe`, `updatePreferences`
- `patch` method added to `api` object (was missing from worktree version)

**Task 2: Real notification UI in SettingsPanel.tsx**

Replaced `cha-bio-safety/src/components/SettingsPanel.tsx`:
- `Toggle` converted from uncontrolled to controlled (`on`, `onChange`, `disabled` props)
- `PermBadge` component added: shows 허용됨/차단됨/권한 미설정 as colored pill badges
- Notification state: `permState`, `subscribed`, `prefs` (6 booleans, default all true)
- `useEffect` loads subscription status via `pushApi.getStatus()` on panel open
- `handleSubscribe()`: checks permission, calls `Notification.requestPermission()`, subscribes via PushManager, saves to server
- `handleUnsubscribe()`: unsubscribes PushManager + server
- `handlePrefToggle()`: optimistic update with revert on API failure
- Old dummy rows removed: "점검 미완료 알림", "미조치 항목 알림", "승강기 점검 D-7 알림"
- New section: 6 real toggles in 2 labeled groups (점검 / 일정)
- 화면 section "결과 즉시 저장" Toggle updated to new controlled signature

## Commits

| Task | Commit | Files |
|------|--------|-------|
| 1+2 (worktree) | 7f996ed | cha-bio-safety/src/utils/api.ts, cha-bio-safety/src/components/SettingsPanel.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `patch` method to api object**
- **Found during:** Task 1
- **Issue:** Worktree's `api.ts` lacked the `patch` method; `pushApi.updatePreferences` calls `api.patch` which would be undefined at runtime
- **Fix:** Added `patch: <T>(p: string, b: unknown) => req<T>(p, { method:'PATCH', body: JSON.stringify(b) })` to the `api` object
- **Files modified:** cha-bio-safety/src/utils/api.ts
- **Commit:** 7f996ed

**2. [Rule 1 - Bug] TypeScript Uint8Array generic cast for applicationServerKey**
- **Found during:** Task 2 build verification
- **Issue:** `TS2322: Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'string | BufferSource'` — TypeScript strict generic mismatch between `Uint8Array<ArrayBufferLike>` and `ArrayBuffer` expected by `PushSubscriptionOptionsInit`
- **Fix:** Cast via `as unknown as ArrayBuffer` — standard workaround for this TS/DOM types discrepancy
- **Files modified:** cha-bio-safety/src/components/SettingsPanel.tsx
- **Commit:** 7f996ed

**3. [Note] Worktree has older/simpler SettingsPanel**
- The worktree's SettingsPanel.tsx is an older version (~113 lines) vs the main repo's full version (~279 lines) with profile management, password change, etc. The plan's task was applied to the worktree file as-is, preserving its structure while adding all required notification functionality.

## Known Stubs

- "결과 즉시 저장" toggle in 화면 section: `<Toggle on={true} />` — no handler, visual placeholder only. Pre-existing stub, not introduced by this plan. Future phase will wire it.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced by this plan's UI layer. VAPID public key exposure is accepted per T-17-08 (intended to be public per Web Push spec).

## Self-Check: PASSED

- cha-bio-safety/src/utils/api.ts: contains `export const pushApi` — FOUND
- cha-bio-safety/src/utils/api.ts: contains `NotificationPreferences` — FOUND
- cha-bio-safety/src/components/SettingsPanel.tsx: contains `PermBadge` — FOUND
- cha-bio-safety/src/components/SettingsPanel.tsx: contains `handleSubscribe` — FOUND
- cha-bio-safety/src/components/SettingsPanel.tsx: does NOT contain "승강기 점검 D-7" — CONFIRMED
- Build passes (`npm run build` exits 0) — CONFIRMED
- Commit 7f996ed exists — CONFIRMED
