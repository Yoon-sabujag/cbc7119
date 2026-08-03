---
phase: quick-260803-nok-weekend-range-task-event
plan: 01
subsystem: schedule
tags: [react, cloudflare-pages-functions, d1, schedule, dashboard]

requires: []
provides:
  - task/event 연속(멀티데이) 일정이 범위 전체 주말·공휴일이어도 SchedulePage 달력·일자 목록·점 표시 및 대시보드 월간 캘린더 점 표시에서 노출됨
  - 추가 모달 미리보기 안내문이 task/event 시 거짓 "주말·공휴일 N일 제외" 문구를 표시하지 않음
affects: [schedule, dashboard]

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/SchedulePage.tsx
    - cha-bio-safety/functions/api/dashboard/stats.ts

key-decisions:
  - "task·event 카테고리에 한해서만 주말·공휴일 자동 제외 규칙 해제 (사용자 LOCKED 결정). inspect·elevator·fire 는 기존 규칙 유지."

patterns-established: []

requirements-completed: [QUICK-NOK-01]

duration: 5min
completed: 2026-08-03
---

# Quick Task 260803-nok: task/event 연속 일정 주말·공휴일 표시 예외 Summary

**SchedulePage.tsx matchesDate/skippedCount와 stats.ts monthScheduleDates의 isRange 게이트에 task/event 카테고리 예외 3개소를 동일하게 적용해 "유령 일정"(8/8~8/9 처럼 범위 전체가 주말인 task/event 일정이 표시 0일이 되던 버그) 수정**

## Performance

- **Duration:** 5분
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- SchedulePage.tsx `matchesDate`: task/event 범위 일정은 주말·공휴일 여부와 무관하게 항상 표시되도록 early-return 추가 (달력 점·일자 목록에 반영)
- SchedulePage.tsx 추가 모달 `skippedCount`: task/event 카테고리일 때는 0으로 고정되어, 미리보기 안내문이 거짓 "주말·공휴일 N일 제외" 문구 대신 "N일 범위로 1건 추가됩니다"만 표시
- stats.ts `monthScheduleDates`의 `isRange`: task/event 는 false 취급되어 주말·공휴일 스킵 게이트를 우회, 대시보드 월간 캘린더 점도 범위 전일 표시

## Task Commits

Each task was committed atomically:

1. **Task 1: task·event 연속 일정 주말·공휴일 표시 예외 적용 (3개소)** - `076e02de` (fix)

**Plan metadata:** (오케스트레이터가 별도 커밋)

## Files Created/Modified
- `cha-bio-safety/src/pages/SchedulePage.tsx` - matchesDate 예외 early-return 추가, skippedCount 카테고리 인식 분기
- `cha-bio-safety/functions/api/dashboard/stats.ts` - monthScheduleDates isRange 계산에 task/event 제외 반영

## Decisions Made
- 플랜에 이미 LOCKED 된 결정(사용자 확정)을 그대로 적용: task·event 만 예외, 나머지 카테고리(inspect/elevator/fire)는 무변경. MonthlyPlanPreview dayCatMap(inspect 전용)은 손대지 않음.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 코드 변경은 완료 및 로컬 tsc 검증 통과. 배포는 오케스트레이터/사용자 몫(이 세션에서는 배포 명령 미실행).
- 실기기/실환경 검증(8/8~8/9 같은 주말 전체 범위 task·event 일정 실제 추가 후 달력·대시보드 노출 확인) 필요 시 배포 후 진행 권장.

---
*Phase: quick-260803-nok-weekend-range-task-event*
*Completed: 2026-08-03*
