---
phase: quick-260428-er6
plan: 01
subsystem: ui-strings
tags: [polish, i18n-strings, header-consistency, sot]
dependency_graph:
  requires:
    - "src/components/SideMenu.tsx (MENU 배열, 변경 금지 SOT)"
  provides:
    - "App.tsx PAGE_TITLES (모바일 일반 페이지 헤더 / 데스크톱 GlobalHeader 텍스트)"
    - "6개 페이지의 자체 <header> span 텍스트 (모바일/데스크톱)"
  affects: []
tech_stack:
  added: []
  patterns:
    - "Single source of truth: SideMenu MENU 배열의 한글 라벨이 모든 페이지 헤더 텍스트의 진실 원천"
key_files:
  created: []
  modified:
    - src/App.tsx
    - src/pages/SchedulePage.tsx
    - src/pages/ReportsPage.tsx
    - src/pages/WorkShiftPage.tsx
    - src/pages/FloorPlanPage.tsx
    - src/pages/DailyReportPage.tsx
    - src/pages/WorkLogPage.tsx
decisions:
  - "사이드 메뉴 라벨을 SOT 로 정하고 헤더를 메뉴에 맞춤 (반대 방향 X). 메뉴 라벨이 6개 항목에 대해 더 정확한 한국어이고 띄어쓰기가 일관됨."
  - "다운로드 버튼/파일 상단 코멘트는 변경하지 않음 — 헤더 외 컨텍스트는 별도 의미. replace_all 금지로 정확히 헤더 컨텍스트만 치환."
metrics:
  duration_minutes: ~3
  completed: 2026-04-28
---

# Phase quick-260428-er6 Plan 01: 사이드 메뉴 라벨과 페이지 헤더 표기 통일 Summary

운영 관찰 모드 폴리싱 — SideMenu MENU 배열을 SOT 로 정하고 6개 라우트(/workshift, /floorplan, /daily-report, /worklog, /schedule, /reports)의 PAGE_TITLES + 페이지 자체 헤더 한글 문자열을 글자 단위로 일치시켰다.

## 작업 내역 (총 13 Edit, 7 파일)

### A. src/App.tsx — PAGE_TITLES 4개 키

| 라우트 | Before | After |
|---|---|---|
| `/daily-report` | `일일업무일지` | `일일 업무 일지` |
| `/workshift` | `근무표` | `월간 출근부` |
| `/floorplan` | `건물 도면` | `소방 시설 도면` |
| `/worklog` | `업무수행기록표` | `업무 수행 기록표` |

(`/schedule`, `/reports` PAGE_TITLES 는 이미 메뉴 라벨과 일치하여 변경 없음)

### B. 6개 페이지 자체 <header> span 텍스트

| 파일 | 위치 | Before | After |
|---|---|---|---|
| SchedulePage.tsx | line 427 (데스크톱, fontSize:15) | 점검 계획 관리 | 월간 점검 계획 |
| SchedulePage.tsx | line 467 (모바일, fontSize:14) | 점검 계획 관리 | 월간 점검 계획 |
| ReportsPage.tsx | line 337 (모바일) | 점검 기록 출력 | 점검 일지 출력 |
| WorkShiftPage.tsx | line 94 (모바일) | 월 근무표 | 월간 출근부 |
| FloorPlanPage.tsx | line 751 (모바일) | 건물 도면 | 소방 시설 도면 |
| DailyReportPage.tsx | line 411 (데스크톱 좌측 패널) | 일일업무일지 | 일일 업무 일지 |
| DailyReportPage.tsx | line 457 (모바일) | 일일업무일지 | 일일 업무 일지 |
| WorkLogPage.tsx | line 741 (데스크톱 좌측 패널) | 업무수행기록표 | 업무 수행 기록표 |
| WorkLogPage.tsx | line 808 (모바일) | 업무수행기록표 | 업무 수행 기록표 |

### 보존 (변경하지 않음)

- `src/components/SideMenu.tsx` — SOT 무결성 (git diff 0건)
- `DailyReportPage.tsx` line 1 코멘트 `// ── 일일업무일지 페이지 ──`
- `DailyReportPage.tsx` line 347, 376 다운로드 버튼 라벨 ``⬇ 일일업무일지(${mm}월) 다운로드``
- `WorkLogPage.tsx` line 1 코멘트 `// ── 업무수행기록표 페이지 ──`

## 자동 검증 결과 (PASS)

```
=== PAGE_TITLES old strings (expect 0 each) ===
'/workshift': '근무표':         0 PASS
'/floorplan': '건물 도면':       0 PASS
'/daily-report': '일일업무일지':  0 PASS
'/worklog': '업무수행기록표':    0 PASS

=== PAGE_TITLES new strings (expect 1 each) ===
'/workshift': '월간 출근부':      1 PASS
'/floorplan': '소방 시설 도면':   1 PASS
'/daily-report': '일일 업무 일지': 1 PASS
'/worklog': '업무 수행 기록표':   1 PASS

=== Page header old strings (expect 0 each) ===
SchedulePage 점검 계획 관리:    0 PASS
ReportsPage 점검 기록 출력:      0 PASS
WorkShiftPage 월 근무표:        0 PASS
FloorPlanPage 건물 도면:        0 PASS
DailyReportPage 일일업무일지:    0 PASS
WorkLogPage 업무수행기록표:      0 PASS

=== Page header new strings (expect ≥1) ===
SchedulePage 월간 점검 계획:    2 PASS (데스크톱 + 모바일)
ReportsPage 점검 일지 출력:     1 PASS
WorkShiftPage 월간 출근부:      1 PASS
FloorPlanPage 소방 시설 도면:   1 PASS
DailyReportPage 일일 업무 일지:  2 PASS (데스크톱 + 모바일)
WorkLogPage 업무 수행 기록표:    2 PASS (데스크톱 + 모바일)

=== 보존 검증 (expect non-zero) ===
DailyReportPage // 일일업무일지 페이지 코멘트:  1 PASS (line 1)
DailyReportPage 다운로드 버튼 ⬇ 일일업무일지...: 2 PASS (line 347, 376 — grep -n 직접 확인)
WorkLogPage // 업무수행기록표 페이지 코멘트:    1 PASS (line 1)

=== SOT 보존 ===
git diff --stat src/components/SideMenu.tsx: empty PASS
SideMenu MENU 라벨 5개(월간 점검 계획/소방 시설 도면/월간 출근부/일일 업무 일지/업무 수행 기록표) 그대로 존재 PASS
```

## Deviations from Plan

None — 13개 Edit 호출 모두 plan 그대로 실행, 추가 발견 사항 없음.

## Commits

| 종류 | Hash | 메시지 |
|---|---|---|
| 코드 | `e6480d7` | fix(quick-260428-er6): 사이드 메뉴 라벨과 페이지 헤더 표기 통일 |

7 files changed, 13 insertions(+), 13 deletions(-)

## 사용자 검증 (배포 후 단계)

모바일 + 데스크톱 둘 다에서:
1. 사이드 메뉴 → `월간 점검 계획` 클릭 → 헤더 `월간 점검 계획` 확인
2. 사이드 메뉴 → `점검 일지 출력` 클릭 → 헤더 `점검 일지 출력` 확인
3. 사이드 메뉴 → `월간 출근부` 클릭 → 헤더 `월간 출근부` 확인
4. 사이드 메뉴 → `소방 시설 도면` 클릭 → 헤더 `소방 시설 도면` 확인
5. 사이드 메뉴 → `일일 업무 일지` 클릭 → 헤더 `일일 업무 일지` 확인 (좌측 패널 데스크톱 헤더도 동일)
6. 사이드 메뉴 → `업무 수행 기록표` 클릭 → 헤더 `업무 수행 기록표` 확인 (좌측 패널 데스크톱 헤더도 동일)

## Self-Check: PASSED

- File `src/App.tsx` — FOUND, modified
- File `src/pages/SchedulePage.tsx` — FOUND, modified
- File `src/pages/ReportsPage.tsx` — FOUND, modified
- File `src/pages/WorkShiftPage.tsx` — FOUND, modified
- File `src/pages/FloorPlanPage.tsx` — FOUND, modified
- File `src/pages/DailyReportPage.tsx` — FOUND, modified
- File `src/pages/WorkLogPage.tsx` — FOUND, modified
- Commit `e6480d7` — FOUND in `git log`
- All grep verifications match expected counts
- SideMenu.tsx (SOT) unchanged confirmed
