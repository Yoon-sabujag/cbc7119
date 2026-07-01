---
phase: quick-260702-1vw
plan: 01
subsystem: fire-alarm-panel
tags: [bug-fix, phase-25, takeover, alarm, sw, pinch-zoom]
key-files:
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx
    - cha-bio-safety/src/hooks/usePinchZoom.ts
    - cha-bio-safety/src/sw.ts
decisions:
  - "P2-1: ackedId (string|null) 상태로 교체 — 인지한 alarm.id 저장 후 id 비교로 두번째 경보 takeover 재노출"
  - "P2-2: 오픈타임 스냅샷 ref (openAlarmRef / panelOpenAlarmRef) 패턴 — save 분기·prefill 이 폴링 race 로부터 격리"
  - "P2-3: lastTouchAt 700ms 가드 — onTouchStart/End 에서 세팅, onDoubleClick early-return 으로 합성 dblclick 차단"
  - "SW-FALLBACK: fallback 을 '/' 로 변경하여 prod 260701-pnl 바이트 수렴"
metrics:
  duration: ~10min
  completed: "2026-07-02"
  tasks: 4
  files: 3
---

# Phase quick-260702-1vw Plan 01: Phase 25 버그수정 4건 (takeover/resolve-sw-fallback) Summary

**One-liner:** alarmAcked→ackedId id-비교 takeover, 오픈타임 스냅샷 save-분기, 700ms 더블탭 가드, sw fallback '/' prod수렴

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | P2-1 데스크톱 두번째 경보 takeover | 704c9158 | InspectionPage.tsx |
| 2 | P2-2 resolve/create 오분기 — 오픈타임 스냅샷 | f5978ff7 | InspectionPage.tsx |
| 3 | P2-3 줌 더블탭 자기리셋 가드 | 1b6f05d3 | usePinchZoom.ts |
| 4 | SW-FALLBACK notificationclick fallback | f68def8e | sw.ts |

## Verify-Marker Results

- **P2-1-OK**: `ackedId !== activeAlarm.id` 1건, `setAckedId(ackId)` 1건, `alarmAcked` 잔존 0건
- **P2-2-OK**: `resolve(activeAlarm.id` 잔존 0건, `resolve(snap.id` 2건, `openAlarmRef` / `panelOpenAlarmRef` 각 1건, `prefilledRef` / `panelPrefilledRef` 중복 없음(각 1건)
- **P2-3-OK**: `Date.now() - lastTouchAt.current < 700` 1건, `lastTouchAt.current = Date.now()` 2건, ref 선언 1건
- **SW-FALLBACK-OK**: `회귀 방지 (prod 260701-pnl)` 주석 존재, `': '/'` fallback 존재, `'/fire-alarm'` 잔존 0건

## TypeScript Result

`cd cha-bio-safety && npx tsc --noEmit` — **PASS** (no output, zero errors)

## Invariants Verified

- FloorPlanPage.tsx 무변경 (git diff 0줄)
- `mode` / `panelMode` DISPLAY 로직 무변경 (스냅샷은 save-branch + prefill 한정)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- 704c9158: `fix(260702-1vw): P2-1 데스크톱 두번째 경보 takeover — alarmAcked sticky bool -> ackedId id-비교`
- f5978ff7: `fix(260702-1vw): P2-2 resolve/create 오분기 — 오픈타임 activeAlarm 스냅샷 (모바일+데스크톱)`
- 1b6f05d3: `fix(260702-1vw): P2-3 줌 더블탭 자기리셋 — usePinchZoom 최근터치 700ms 가드`
- f68def8e: `fix(260702-1vw): SW-FALLBACK notificationclick fallback /fire-alarm -> / (prod 수렴)`
