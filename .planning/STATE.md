---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: UI 재편 + 기능 확장
status: executing
stopped_at: Completed 09-01-PLAN.md
last_updated: "2026-04-02T22:57:59.830Z"
last_activity: 2026-04-02
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 10
  completed_plans: 9
  percent: 100
---

# Project State: CHA Bio Complex Fire Safety System

**Last updated:** 2026-03-31
**Milestone:** v1.1 — UI 재편 + 기능 확장

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core Value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다

**Current Focus:** Phase 09 — education-management

---

## Current Position

Phase: 09 (education-management) — EXECUTING
Plan: 2 of 2
Status: Ready to execute
Last activity: 2026-04-02

Progress: [█████████░] 90% (Phase 09 plan 1 of 2 complete)

---

## Accumulated Context

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Excel generation stays client-side (fflate + XML patching) | Workers CPU limit; established pattern |
| BottomNav 재편: 더보기 제거, 조치 신규, 승강기 이동 | 더보기와 햄버거 메뉴 기능 중복 해소 |
| 도면 리뉴얼 v1.1 제외 | DWG 레이어 미분리로 SVG 6-7MB/층, 별도 마일스톤 |
| Phase 7 완료 후 Phase 8-11 독립 실행 가능 | /api/staff 엔드포인트와 admin role-guard를 Phase 7에서 확립 |
| 법적 점검 지적사항 → 조치관리 통합은 v1.2로 이관 | source_type 연동 복잡도 vs 4인 팀 가치 불균형 |
| SideMenu 4섹션 구조 + soon:boolean 패턴 | 준비중 아이템을 disabled 렌더링으로 표시; 하드코딩 배지 전면 제거 (D-04, D-05, D-06) |
| SideMenu 하단 사용자 카드/로그아웃 버튼 보존 | MorePage 삭제 후 유일한 로그아웃 경로 (D-07) |
| 도면 PNG 방식으로 전환 (GSD 외부 작업) | DWG→SVG 불가로 PNG 채택, CSS transform 핀치줌, 마커 오버레이 방식 |
| 유도등 도면 6종 마커 체계 | 천장피난구(역사다리꼴)/벽부피난구(■)/거실통로(▽)/복도통로(◆세로선)/계단통로(◆가로선)/객석통로(●) |
| 마커 좌표 % 기반 저장 | 이미지 크기와 무관하게 일관된 위치, objectFit:contain 렌더 영역 기준 |
| Tab state via URL searchParams in RemediationPage | Back navigation restores active filter tab (미조치/완료/전체) |
| 개소명(location) added to remediation card + detail | Field workers need specific location name, not just zone/floor |
| 조치자 name via staff JOIN (not raw staffId) | Resolved by API-level JOIN already in place; detail page renders name field |
| Staff/CheckPoint CRUD API: 5 endpoints, admin role-guard pattern | plain: prefix password, COALESCE partial update, camelCase mapping |
| TECH-01 complete: useStaffList hook replaces STAFF_ROLES/STAFF hardcoding | getMonthlySchedule accepts optional staffData param; fallback to [] |
| /admin route + SideMenu role-based filtering (item.role guard) | AdminPage scaffold redirects assistants to /dashboard |
| AdminPage tab state via useState (no URL params) | Internal navigation only, per D-13 |
| Category list read-only (Lock icon, no CRUD) | checkPointApi.categories() for display only, per D-09 |
| Inline confirmation for destructive actions (deactivate/password reset) | Replaces button row in modal — avoids nested modals pattern |
| Optimistic mealMap overlay: optimisticMealMap state + server data merge | Immediate tap feedback; rollback on API error prevents stale UI |
| lucide-react absent in project: inline SVG functions used instead | Matches AdminPage.tsx pattern; avoids adding unneeded dependency |
| No DELETE on education_records | 이수 이력은 법적 보존 대상 (D-09) |
| GET /api/education: all roles can view all records | D-11 — no role filter on read; all 4 staff see each other's training |
| Education write: admin OR record owner | D-10 — self-service allowed; staff can record their own training |

### Architecture Notes

- D1 at migration 0033; floor_plan_markers 테이블 추가 (0033_floor_plan_markers.sql)
- 도면 이미지: public/floorplans/guidelamp/{floor}.png (13층, 총 ~17MB)
- FloorPlanPage: SVG viewBox → CSS transform 방식으로 전면 리라이트
- FloorB5.tsx: 미사용 상태 (삭제 가능)
- API: /api/floorplan-markers (GET/POST) + /api/floorplan-markers/[id] (PUT/DELETE)
- D1 at migration 0032; v1.1에서 0034-0038 (5개 신규 마이그레이션) 적용 예정
- RemediationPage: 신규 마이그레이션 불필요 (migration 0012 스키마 이미 존재)
- Admin settings: migration 0036 (system_settings 테이블) 필요
- NO_NAV_PATHS in App.tsx: /meal, /education, /admin, /legal-inspection 추가 필요; /remediation은 추가하면 안 됨
- STAFF_ROLES 하드코딩 제거 대상: DashboardPage.tsx lines 14-19
- streakDays 하드코딩 제거 대상: dashboard/stats.ts (현재 TODO 주석)
- SideMenu 미조치 배지 하드코딩(2) 제거: Phase 6에서 live count로 교체

### Blockers

None currently.

---

## Session Continuity

**Last session:** 2026-04-02T22:57:59.825Z
**Stopped at:** Completed 09-01-PLAN.md

**Key files:**

- `.planning/ROADMAP.md` — phases 5-11 defined
- `.planning/REQUIREMENTS.md` — 20 requirements, traceability updated
- `.planning/PROJECT.md` — project context with v1.1 goals

---
*State initialized: 2026-03-28*
*Milestone v1.1 roadmap created: 2026-03-31*
