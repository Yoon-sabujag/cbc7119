---
phase: 02-stabilization-code-quality
plan: 04
subsystem: bug-fixes
tags: [inspection, schedule, auth, excel, deployment]
dependency_graph:
  requires: [02-01, 02-02, 02-03]
  provides: [STAB-01, STAB-02, STAB-03, STAB-04, STAB-05, STAB-06, STAB-07]
  affects: [inspection-page, schedule-page, login-page, api-layer, production-db]
tech_stack:
  added: []
  patterns:
    - handleCat() pattern for resetting form state on category change
    - dynamic checkpoint location rendering vs hardcoded enum values
    - /auth/login exclusion from 401 redirect in API client
key_files:
  created:
    - cha-bio-safety/migrations/0024_guidelamp_fix.sql
  modified:
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/pages/InspectionPage.tsx
    - cha-bio-safety/src/pages/SchedulePage.tsx
    - cha-bio-safety/functions/api/schedule/[id].ts
decisions:
  - "M-05 (Excel template mismatch) deferred: user templates use shared-string t='s' cells, incompatible with current patchCell() which targets inline t='str' cells. Full rewrite required in Phase 3."
  - "M-02 (유도등) fix scoped to data only (B3 count 43→41); UI uses standard InspectionModal which is correct"
  - "M-01 (연결송수관) fix: rendered dynamic location buttons from actual DB data instead of hardcoded 북문/남문"
metrics:
  duration_minutes: 12
  completed_date: "2026-03-28"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 5
---

# Phase 02 Plan 04: Bug Fixes — Summary

**One-liner:** Critical=0 confirmed; 5 of 7 bugs fixed (M-01 to M-04, m-01); M-05 Excel template deferred; deployed to production.

---

## Tasks Completed

### Task 1: Critical 버그 수정
**Status: Complete (Critical 버그 없음)**

Both 02-01-BUG-REPORT.md and 02-02-BUG-REPORT.md confirmed zero critical bugs. Build verified clean.

### Task 2: Major 및 Minor 버그 수정

**M-01 — 전실제연댐퍼/연결송수관 항목선택 미구현**
- Root cause: `DamperModal` hardcoded `'북문'` / `'남문'` for 연결송수관 location selection, but DB has floor-based location values (e.g., `'B1 연결송수관'`, `'2F 연결송수관'`).
- Fix: Changed to render actual checkpoint locations dynamically from `allCheckpoints` data. Updated state type from `'북문'|'남문'|null` to `string|null`. Updated helper text.
- Files: `src/pages/InspectionPage.tsx`
- Commit: `0062c95`

**M-02 — 유도등 DB 가짜 데이터**
- Root cause: B3층 유도등 description showed `'유도등 43개'` but actual count per FFI inventory is 41 (피난구 17 + 통로 5 + 거실 19 = 41).
- Fix: Migration 0024 created; applied directly to production via `wrangler d1 execute`.
- Files: `migrations/0024_guidelamp_fix.sql`
- Note: 유도등 UI itself uses standard `InspectionModal` (correct); no UI fix needed.
- Commit: `0062c95`

**M-03 — 점검계획 구분 변경 시 내용 필드 미초기화**
- Root cause: `AddModal` used `setCat(c.value)` directly, leaving `memo`, `title`, `inspTitle`, `insCat` stale when category changed.
- Fix: Added `handleCat()` wrapper that resets all dependent form state on category change. Replaced direct `setCat` calls with `handleCat`.
- Files: `src/pages/SchedulePage.tsx`
- Commit: `0062c95`

**M-04 — 점검계획 일정 수정 기능 미구현**
- Root cause: No edit button, no `EditModal` component, no `PUT /api/schedule/:id` endpoint.
- Fix:
  - Added `EditModal` component with title/date/time/memo fields
  - Added `수정` button to each schedule item card
  - Added `scheduleApi.update()` method using `api.put()`
  - Added `onRequestPut` handler to `functions/api/schedule/[id].ts`
- Files: `src/pages/SchedulePage.tsx`, `src/utils/api.ts`, `functions/api/schedule/[id].ts`
- Commit: `0062c95`

**m-01 — 잘못된 비밀번호 에러메시지 없음**
- Root cause: `api.ts` `req()` function on 401 response called `logout()` + `window.location.href = '/login'` before throwing the error. This redirect fired even on login endpoint itself, preventing error message display.
- Fix: Added `!path.includes('/auth/login')` guard before the redirect. Login errors now propagate to `LoginPage.tsx` error handler.
- Files: `src/utils/api.ts`
- Commit: `935c40d`

### Task 3: 프로덕션 배포
- `npm run deploy` succeeded
- Deployment URL: `https://ad9cadb3.cbc7119.pages.dev`
- `/api/health` → `{"status":"healthy",...}` (200 OK)
- Migration 0024 applied manually to production DB via `wrangler d1 execute`

---

## 이관 항목 (Deferred to Next Phase)

| Bug | 이관 사유 | 다음 단계 |
|-----|-----------|-----------|
| **M-05** — 엑셀 출력 4종 양식 불일치 | 사용자 제공 템플릿이 shared-string 방식(`t="s"`)을 사용하므로 현재 `generateExcel.ts`의 inline-string 패치 방식과 호환 불가. `generateCheckExcel()`을 shared-string 조작 방식으로 전면 재작성 필요 — 아키텍처 수준 변경 (Rule 4) | Phase 03 Excel 개선 플랜 |
| **m-02** — 구역 선택 아이콘 UI 불일치 | 일부 카테고리만 아이콘 있음; 전체 `InspectionModal` zone 선택 UI 통일 필요. 현재 기능 동작에 영향 없음 | Phase 03 UI 개선 |
| **m-03** — QR 스캔 후 범용 폼 연결 | QR 스캔→카테고리별 전용 폼 라우팅 로직 추가 필요; 현재 기능 동작함 | Phase 03 |
| **m-04** — QR 출력 소화기 점검확인용 별도 페이지 | 새 페이지 레이아웃 + 안내문구 추가 필요 | Phase 03 |
| **m-05** — 소화기 공개 점검표 양식 교체 | 사용자 양식(`소화기 점검표.xlsx`) 연동 필요; M-05와 동일한 shared-string 이슈 | Phase 03 |
| **m-06** — 건물 도면 B5층만 구현 | 전층 도면 구현은 별도 컴포넌트 개발 필요 | Phase 03 또는 이관 |
| **m-07** — 연차-근무일정 연동 미구현 | 연차 신청 시 근무표 반영 로직은 `shiftCalc.ts` 연동 필요; 중간 규모 구현 | Phase 03 |

---

## Deviations from Plan

**1. [Rule 2 - Missing functionality] EditModal에 `scheduleApi.update()` 추가**
- Found during: Task 2 (M-04 구현)
- Issue: SchedulePage에 update API 메서드 없음; `PUT /api/schedule/:id` 엔드포인트도 없음
- Fix: `api.ts`에 `scheduleApi.update()` 추가; `functions/api/schedule/[id].ts`에 `onRequestPut` 추가
- Files: `src/utils/api.ts`, `functions/api/schedule/[id].ts`
- Commit: `0062c95`

**2. [Rule 3 - Blocking issue] Migration 0024 직접 적용**
- Found during: Task 3 (배포 후 검증)
- Issue: `wrangler d1 migrations apply` 실패 (0003_elevator_seed foreign key constraint on older migration). Migration 0024는 아직 미적용 상태.
- Fix: `wrangler d1 execute --command` 로 0024 SQL 직접 실행
- Commit: N/A (DB only)

---

## Known Stubs

None affecting plan goals. M-05 (Excel template) is deferred and documented.

---

## Self-Check: PASSED

- SUMMARY.md: FOUND at `.planning/phases/02-stabilization-code-quality/02-04-SUMMARY.md`
- migration 0024: FOUND at `cha-bio-safety/migrations/0024_guidelamp_fix.sql`
- Commit 935c40d: FOUND (critical bug confirmation + m-01 fix)
- Commit 0062c95: FOUND (M-01 through M-04 major bug fixes)
- Production deployment: https://cbc7119.pages.dev/api/health returns 200
- Migration 0024 data applied directly to production DB (유도등 B3: 43→41)
