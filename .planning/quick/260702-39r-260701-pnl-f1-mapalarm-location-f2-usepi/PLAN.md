---
quick_id: 260702-39r
slug: 260701-pnl-f1-mapalarm-location-f2-usepi
date: 2026-07-02
status: in-progress
---

# 화재수신반 260701-pnl 이관 (3)(4) prod 미러

staging(cbc7119-data) 검증완료 4항목의 prod 미러. SSOT: `cbc7119-data/.planning/quick/260701-pnl-panel-alarm-backend/PROD-HANDOFF-audience-and-roster.md`.

## Recon 결과 — 스코프 축소

| 항목 | prod 실측 | 조치 |
|---|---|---|
| (1) getPanelAudienceIds (push.ts) | prod push.ts = staging **byte-identical** (본체 이관 aecaf292 에 이미 포함) | 무변경 |
| (2) shift_offset (cha-bio-db) | 0053 기준 완전 일치 (박0/윤1/김2/석fixed-day) + E2E-PANEL 부재(count=0) | 무변경 |
| (3) F1 mapAlarm location | `mapAlarm()` 리턴에 location 누락 present | **패치** |
| (4) F2 usePinchZoom 더블탭 | `lastTouchAt` 0건 (합성 dblclick 충돌 버그 present) | **패치** |

→ 실제 코드 변경은 (3)(4) 뿐.

## 제약

- worktree isolation 금지 (production 콘솔, origin/HEAD=main → worktree 는 main 기준 분기 오염). inline 적용.
- wrangler/배포는 메인 Claude 가 별도 처리 (서브에이전트 deploy 금지 룰).
- `.planning/production-sync.md` 는 배포 후 실해시/URL 로 마감.
- `cha-bio-safety/` 하위 2파일만 수정.

## Tasks

### T1 — F1: mapAlarm location (커밋 1)
`cha-bio-safety/functions/_lib/alarm.ts` — `mapAlarm()` 리턴 `detectedAt` 다음에 `location: LOCATION_LABEL,` 1줄. staging 4a8315e 동일. (`LOCATION_LABEL` L10 / `mapAlarmSummary` location 은 기존.)

### T2 — F2: usePinchZoom 더블탭 가드 (커밋 2)
`cha-bio-safety/src/hooks/usePinchZoom.ts` — staging 5cecc14 동일 4 hunk:
1. `lastTap` ref 다음에 `lastTouchAt` ref 선언(+주석)
2. `onTouchStart` 초입 `lastTouchAt.current = Date.now()`
3. `onTouchEnd` 초입 `lastTouchAt.current = Date.now()`
4. `onDoubleClick` 초입 `if (Date.now() - lastTouchAt.current < 700) return`(+주석)

## 검증 게이트
- `npx tsc --noEmit` 0 errors
- `npm run build` 성공
- grep: alarm.ts `location: LOCATION_LABEL` ×2, `LOCATION_LABEL` ×3 / usePinchZoom.ts `lastTouchAt` ×4
- 원자 커밋 2개(F1/F2 분리), production 브랜치

## 배포/후속 (메인 Claude)
- `wrangler pages deploy dist --branch production` (functions bundle 포함, CWD=cha-bio-safety)
- production-sync.md 이관 엔트리 실해시+URL 로 마감
- staging preview P2-1/P2-2 (InspectionPage takeover/resolve↔create) 는 별도 재승격 대상 (본 배치 제외, usePinchZoom=P2-3 는 (4)로 커버됨)
