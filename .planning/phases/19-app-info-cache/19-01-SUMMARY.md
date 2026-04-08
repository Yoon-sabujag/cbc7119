---
phase: 19-app-info-cache
plan: "01"
subsystem: settings-panel
tags: [pwa, version, cache-clear, service-worker, vite-define]
dependency_graph:
  requires: []
  provides: [APP-01, APP-02]
  affects: [cha-bio-safety/src/components/SettingsPanel.tsx, cha-bio-safety/vite.config.ts]
tech_stack:
  added: []
  patterns:
    - vite define for compile-time constant injection
    - Intl.DateTimeFormat sv-SE Asia/Seoul for KST timestamp without extra deps
    - usePersistedCollapse reuse from Phase 18
key_files:
  created:
    - cha-bio-safety/src/vite-env.d.ts
  modified:
    - cha-bio-safety/vite.config.ts
    - cha-bio-safety/src/components/SettingsPanel.tsx
decisions:
  - "Used Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }) in vite.config.ts — sv-SE locale natively produces YYYY-MM-DD HH:mm format, no date-fns-tz dependency needed"
  - "앱 정보 section placed above 로그아웃 button (D-05), default collapsed (D-06), key settings.appinfo.collapsed"
  - "Cache clear Row uses chevron child (consistent with Row onClick pattern from 계정 section)"
metrics:
  duration_seconds: 2725
  completed_date: "2026-04-08T04:28:51Z"
  tasks_completed: 3
  tasks_total: 4
  files_changed: 3
---

# Phase 19 Plan 01: App Info & Cache Summary

**One-liner:** Vite define injects build version (v0.2.0) + KST timestamp into SettingsPanel collapsible 앱 정보 section with cache-clear-and-reload handler.

## What Was Built

### Task 1: vite define + type declarations (387f53c)

Added to `cha-bio-safety/vite.config.ts`:
- `readFileSync`/`resolve` imports from `node:fs`/`node:path`
- `APP_VERSION` read from `package.json` (`"0.2.0"`)
- `BUILD_TIME` computed with `Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', ... })` — produces `YYYY-MM-DD HH:mm` KST natively
- `define: { __APP_VERSION__: JSON.stringify(APP_VERSION), __BUILD_TIME__: JSON.stringify(BUILD_TIME) }` block

Created `cha-bio-safety/src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string
```

### Task 2: SettingsPanel 앱 정보 section (f84a8bb)

Added to `SettingsPanel.tsx`:
- `usePersistedCollapse('settings.appinfo.collapsed', true)` — default collapsed, localStorage persisted
- `cacheClearing` state for loading label
- `handleClearCache()`: `!('caches' in window)` guard → `caches.keys()` → parallel `caches.delete()` → `navigator.serviceWorker.getRegistration()?.update()` → `window.location.reload()`
- New `{/* 앱 정보 */}` section inserted ABOVE `{/* 로그아웃 */}`:
  - `SectionHeader` with chevron collapse toggle
  - Version Row: `v${__APP_VERSION__} (${__BUILD_TIME__})`
  - Cache clear Row: label toggles to `초기화 중…` while running, chevron child
  - Address Row: `차바이오컴플렉스 방재 / 경기도 성남시 분당구 판교로 335`
- Removed old hardcoded `차바이오컴플렉스 방재 v1.0.0` footer block

### Task 3: Production build + deploy (76c29b2)

- `npm run build`: tsc + vite build, 61 precached entries, no errors
- `wrangler pages deploy dist --project-name=cbc7119 --branch=production`
- Deploy URL: https://80bbd33c.cbc7119.pages.dev
- Production URL: https://cbc7119.pages.dev
- Confirmed: `"0.2.0"` and `"2026-04-08 ..."` timestamp in `dist/assets/index-CglkF6Mh.js`

### Task 4: Human verification checkpoint

Awaiting user verification (see checkpoint below).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Version and build time are real compile-time values. Cache clear handler is fully wired.

## Threat Flags

None. No new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

- cha-bio-safety/vite.config.ts: exists with __APP_VERSION__ define
- cha-bio-safety/src/vite-env.d.ts: exists with declare const declarations
- cha-bio-safety/src/components/SettingsPanel.tsx: settings.appinfo.collapsed present, v1.0.0 absent
- Commits 387f53c, f84a8bb, 76c29b2: all present in git log
