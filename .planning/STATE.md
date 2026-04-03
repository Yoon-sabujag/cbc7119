---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: UI 재편 + 기능 확장
status: verifying
stopped_at: "Completed 10-02-PLAN.md (checkpoint:human-verify pending)"
last_updated: "2026-04-03T05:06:03.105Z"
last_activity: 2026-04-03
progress:
  total_phases: 7
  completed_phases: 6
  total_plans: 12
  completed_plans: 12
  percent: 90
---

# Project State: CHA Bio Complex Fire Safety System

**Last updated:** 2026-03-31
**Milestone:** v1.1 — UI 재편 + 기능 확장

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core Value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다

**Current Focus:** Phase 10 — legal-inspection

---

## Current Position

Phase: 10 (legal-inspection) — EXECUTING
Plan: 2 of 2
Status: Phase complete — ready for verification
Last activity: 2026-04-03 - Completed quick task 260403-jg3: CCTV DVR 점검 기능 추가

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
| 도면 4종 완성 (GSD 외부, 2026-04-02~03) | 감지기/스프링클러/소화기·소화전 PDF→크롭→4000px 투명 PNG 파이프라인 |
| 감지기 마커: 연기감지기(◉)/열감지기(△) | 2종으로 시작, 향후 확장 |
| 스프링클러 마커: 폐쇄형헤드(●)/개방형헤드(○)/헤드왕(◎)/시험밸브(▣) | 4종 |
| 소화기·소화전 마커: 소화기(▲)/소화전(⬡)/완강기(◇)/DIV(■) | 마커 타입별 점검 개소 카테고리 매핑 |
| extinguishers 테이블 (migration 0035) | 엑셀 관리대장 448개 이관, check_points FK 연결 |
| 소화기 연한 3단계 경고 | 도래(9년, 노랑)/임박(9.5년, 주황)/초과(10년, 빨강) — 분말 소화기 기준 |
| 마커 편집 권한 확장 | admin + MARKER_EDITOR_IDS (현재 윤종엽 2022051052) — API 3곳 동시 적용 |
| 도면 인라인 점검 기록 | 페이지 이동 없이 도면 위에서 점검 결과+사진 저장, 점검 페이지와 동일 DB |
| 마커-개소 연결 중복 방지 | 추가/수정 모달에서 이미 연결된 개소 드롭다운 제외 |
| 소화기 점검표 QR 페이지 리라이트 | 엑셀 양식 그대로 HTML 테이블, 점검사항 그림 포함, colgroup 비율 고정 |
| SideMenu 연차/식사 통합 | "연차 관리"+"식사 기록" → "연차 및 식사" /staff-service로 통합 |
| 직원서비스 달력 셀 리라이트 | 좌상단 근무타입, 우상단 날짜, 우하단 팀원연차/소검/승검/공휴일명 |
| 연차 신청 차단 | 팀원 연차일+소방 점검일+승강기 검사일 차단, 음영 표시 |
| 공휴일 API 자동 동기화 | 공공데이터포털 특일정보 API, holidays 테이블(migration 0036), 1일1회 자동 갱신 + 하드코딩 fallback |
| 주말 날짜 색상 | 일요일/공휴일 진한빨강(#7f1d1d), 토요일 진한파랑(#1e3a5f), 주말 opacity 제거 |
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

- D1 at migration 0035; extinguishers 테이블 추가 (소화기 관리대장 상세)
- 도면 이미지: public/floorplans/{guidelamp,detector,sprinkler,extinguisher}/{floor}.png (4종 × 13층, 4000px 투명 PNG)
- 도면 PDF→PNG 파이프라인: pymupdf 크롭(derotation_matrix) → 4000px alpha=True 렌더
- FloorPlanPage: 4개 planType 모두 ready:true, PNG <img> 방식 통일
- API: /api/floorplan-markers (GET/POST) + /api/floorplan-markers/[id] (PUT/DELETE)
- API: /api/extinguishers (GET 전체 목록) + /api/extinguishers/[checkPointId] (GET 상세)
- 소화기 리스트 오버레이: ExtinguisherListOverlay (점검 모달 내 풀스크린)
- 인라인 점검 모달: 도면에서 직접 점검 기록 입력 (inspectionApi 연동, 사진 첨부)
- D1 at migration 0036; holidays 테이블 (공공데이터포털 API 연동)
- API: /api/holidays (GET 조회) + /api/holidays/sync (POST 동기화, public 경로)
- 공휴일 동기화: StaffServicePage 진입 시 localStorage 기반 1일1회 자동, XML 파싱
- ExtinguisherPublicPage: 엑셀 양식 HTML 재현, colgroup 비율 고정, extinguisher-check.png
- SideMenu: 연차관리+식사기록 → "연차 및 식사" /staff-service 통합
- StaffServicePage 달력: 셀 레이아웃 전면 리라이트 (좌상단 근무/우상단 날짜/우하단 공휴일+팀원연차+소검+승검)
- 연차 신청 차단: teamLeaveMap + inspectDates + elevInspectDates → isBlocked() 함수
- D1 at migration 0032; v1.1에서 0034-0038 (5개 신규 마이그레이션) 적용 예정
- RemediationPage: 신규 마이그레이션 불필요 (migration 0012 스키마 이미 존재)
- Admin settings: migration 0036 (system_settings 테이블) 필요
- NO_NAV_PATHS in App.tsx: /meal, /education, /admin, /legal-inspection 추가 필요; /remediation은 추가하면 안 됨
- STAFF_ROLES 하드코딩 제거 대상: DashboardPage.tsx lines 14-19
- streakDays 하드코딩 제거 대상: dashboard/stats.ts (현재 TODO 주석)
- SideMenu 미조치 배지 하드코딩(2) 제거: Phase 6에서 live count로 교체

### Blockers

None currently.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260403-jg3 | CCTV DVR 점검 기능 추가 | 2026-04-03 | da372bd | [260403-jg3-cctv-dvr](./quick/260403-jg3-cctv-dvr/) |

---

## Session Continuity

**Last session:** 2026-04-03T14:00:00.000Z
**Stopped at:** Completed 10-02-PLAN.md (checkpoint:human-verify pending) + Ad-hoc 2차 완료

**Key files:**

- `.planning/ROADMAP.md` — phases 5-11 defined
- `.planning/REQUIREMENTS.md` — 20 requirements, traceability updated
- `.planning/PROJECT.md` — project context with v1.1 goals

**Ad-hoc 작업 1차 (2026-04-02~03, GSD 외부):**

- 감지기/스프링클러/소화기·소화전 도면 PDF 크롭 → 4000px 투명 PNG 생성 및 배포
- FloorPlanPage 4개 카테고리 활성화, 마커 타입 정의, 마커-개소 연결
- extinguishers 테이블 + 448개 엑셀 데이터 이관 (migration 0035)
- 소화기 점검 모달 상세정보 패널 + 연한 3단계 경고 (도래/임박/초과)
- 소화기 리스트 오버레이 (필터/검색/연한 필터)
- 마커 편집 권한 확장 (admin + 윤종엽)
- 도면 인라인 점검 기록 입력 (사진 첨부 포함, 페이지 이동 없이)
- 임의 생성 check_points 6개 삭제, CP 층 정보 수정

**Ad-hoc 작업 2차 (2026-04-03, GSD 외부):**

- 소화기 점검표 QR 페이지: 엑셀 양식 HTML 재현 (점검사항 그림, colgroup 비율 고정, 복사 방지)
- SideMenu: 연차 관리 + 식사 기록 → "연차 및 식사" /staff-service 통합
- 직원서비스 달력: 셀 레이아웃 전면 개선 (좌상단 근무/우상단 날짜/우하단 공휴일명+팀원연차+소검+승검)
- 연차 신청 차단: 팀원 연차일 + 소방 점검일 + 승강기 검사일 차단 + 음영 표시
- 공휴일 API 자동 동기화: 공공데이터포털 특일정보 API, holidays 테이블 (migration 0036), 1일1회 자동
- 주말 날짜 색상 진하게, opacity 제거, 주말 식대 ₩ 기호 수정

---
*State initialized: 2026-03-28*
*Milestone v1.1 roadmap created: 2026-03-31*
