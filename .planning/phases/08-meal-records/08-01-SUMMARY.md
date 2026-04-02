---
phase: 08-meal-records
plan: "01"
subsystem: meal-records
tags: [database, api, utility, routing]
dependency_graph:
  requires: []
  provides: [meal_records-table, api-meal-get-post, mealApi-client, mealCalc-utils, meal-route]
  affects: [src/App.tsx, src/components/SideMenu.tsx, src/utils/api.ts]
tech_stack:
  added: []
  patterns: [cloudflare-pages-function, upsert-on-conflict, pure-utility-functions, lazy-route]
key_files:
  created:
    - cha-bio-safety/migrations/0035_meal_records.sql
    - cha-bio-safety/functions/api/meal/index.ts
    - cha-bio-safety/src/utils/mealCalc.ts
  modified:
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/App.tsx
    - cha-bio-safety/src/components/SideMenu.tsx
decisions:
  - SideMenu label changed to '식사 기록' (from '식당 메뉴') per executor discretion noted in CONTEXT.md
metrics:
  duration: "7 minutes"
  completed_date: "2026-04-02"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 3
---

# Phase 08 Plan 01: Meal Records Infrastructure Summary

식사 기록 기능의 백엔드(D1 테이블 + /api/meal GET/POST), 프론트엔드 유틸리티(calcProvidedMeals/calcWeekendAllowance), mealApi 클라이언트, /meal 라우팅 및 SideMenu 활성화 완료.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | DB 마이그레이션 + API 엔드포인트 + mealApi 클라이언트 | 78e57e8 | migrations/0035_meal_records.sql, functions/api/meal/index.ts, src/utils/api.ts |
| 2 | 제공 식수/주말 식대 계산 유틸 + 라우팅 와이어링 | 7c25c67 | src/utils/mealCalc.ts, src/App.tsx, src/components/SideMenu.tsx |

## What Was Built

### Task 1: DB + API + Client

**Migration `0035_meal_records.sql`:**
- `meal_records` 테이블: `staff_id TEXT REFERENCES staff(id)`, `date TEXT`, `skipped_meals INTEGER CHECK(IN 0,1,2)`, `UNIQUE(staff_id, date)`
- `idx_meal_records_staff_month` 인덱스

**`functions/api/meal/index.ts`:**
- `onRequestGet`: `staffId`(JWT) + `month=YYYY-MM` 파라미터로 월별 행 조회, snake_case → camelCase 매핑 (`skipped_meals as skippedMeals`)
- `onRequestPost`: `skippedMeals=0`이면 DELETE, 양수면 `INSERT OR REPLACE ON CONFLICT DO UPDATE` upsert
- 입력 검증: 날짜 형식(YYYY-MM-DD), skippedMeals 범위(0/1/2)

**`src/utils/api.ts`:**
- `mealApi.list(year, month)` — GET /api/meal?month=YYYY-MM
- `mealApi.upsert(date, skippedMeals)` — POST /api/meal

### Task 2: Utils + Routing

**`src/utils/mealCalc.ts`:**
- `calcProvidedMeals(rawShift, leaveType, dayOfWeek)` — D-08~D-14 8케이스 처리:
  - 전일 연차/공가 → 0
  - 비번 → 0
  - 일요일 당직 → 0
  - 토요일 당직 → 1
  - 평일 당직 → 2
  - 반차/공가 0.5일 + 주간 → 1
  - 평일 주간 → 1
  - 휴일 → 0
  - legacy `'half'` leaveType 포함
- `calcWeekendAllowance(rawShift, dayOfWeek)` — 토요일 당직 5500원, 일요일 당직 11000원

**`src/App.tsx`:**
- `MealPage` lazy import 추가
- `/meal` Route 등록 (Auth 보호)

**`src/components/SideMenu.tsx`:**
- 식사 기록 메뉴 `soon: false` 활성화 (이전: `soon: true`)
- 라벨 '식당 메뉴' → '식사 기록' 변경

## Deviations from Plan

### Executor Discretion

**1. SideMenu 라벨 '식사 기록'으로 변경**
- **Found during:** Task 2
- **Issue:** Plan에서 "executor discretion per CONTEXT.md"로 허용된 라벨 변경
- **Fix:** '식당 메뉴' → '식사 기록' (기능을 더 정확히 표현)
- **Files modified:** cha-bio-safety/src/components/SideMenu.tsx

### TypeScript Note

`MealPage.tsx`가 아직 존재하지 않아 `tsc --noEmit`에서 `Cannot find module './pages/MealPage'` 에러 발생. 이는 Plan 02에서 MealPage.tsx 생성 시 해소되는 예정된 일시적 상태 (계획서에 명시됨).

## Known Stubs

None — 이 플랜은 백엔드 인프라 및 유틸리티만 구축. UI는 Plan 02에서 구현.

## Self-Check: PASSED
