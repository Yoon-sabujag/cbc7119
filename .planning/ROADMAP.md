# Roadmap: CHA Bio Complex Fire Safety System

## Milestones

- ✅ **v1.0 Completion** — Phases 1-4 (shipped 2026-03-31)
- 🚧 **v1.1 UI 재편 + 기능 확장** — Phases 5-11 (in progress)

## Phases

<details>
<summary>✅ v1.0 Completion (Phases 1-4) — SHIPPED 2026-03-31</summary>

- [x] Phase 1: Deployment & Infrastructure (3/3 plans) — completed 2026-03-28
- [x] Phase 2: Stabilization & Code Quality (5/5 plans) — completed 2026-03-28
- [x] Phase 3: Excel Reports — Annual Matrix Types (2/2 plans) — completed 2026-03-28
- [x] Phase 4: Completion Tracking & Daily Reporting (3/3 plans) — completed 2026-03-30

</details>

### 🚧 v1.1 UI 재편 + 기능 확장 (In Progress)

**Milestone Goal:** BottomNav/SideMenu 네비게이션 재편과 함께 조치관리, 식사기록, 보수교육, 법적점검, 승강기검사, 관리자설정 등 잔여 기능 구현

- [x] **Phase 5: Navigation Restructuring** - BottomNav/SideMenu 재편 — 더보기 제거, 조치 탭 신규, 햄버거 메뉴 통합 (completed 2026-04-01)
- [x] **Phase 6: Remediation Tracking** - 조치 관리 페이지 — 불량/주의 개소 조치 기록, 상태 전환, 필터, R2 사진 첨부 (completed 2026-04-01)
- [x] **Phase 7: Tech Debt + Admin** - 점검자 동적 로딩 + 관리자 설정 (직원 CRUD, 개소 관리). TECH-02/ADMIN-03 보류 (completed 2026-04-02)
- [ ] **Phase 8: Meal Records** - 식사 이용 기록 + 월별 통계 — 개인별 미식 기록, 제공 식수 자동 계산, 요약 카드. MEAL-03/04 데스크톱 보류
- [ ] **Phase 9: Education Management** - 보수교육 일정 관리 — 등록/이수/인증서 R2, D-day 경고
- [ ] **Phase 10: Legal Inspection** - 법적 점검 관리 — 소방 점검 기록, 지적사항, 서류 R2
- [ ] **Phase 11: Elevator Inspection Certs** - 승강기 법정검사 인증서 R2 업로드/조회

### Ad-hoc: 도면 페이지 유도등 PNG 마커 시스템 (completed 2026-04-02, GSD 외부 작업)

FloorPlanPage 전면 리라이트 — SVG viewBox → PNG + CSS transform 핀치줌 + 마커 오버레이. 유도등 도면 13층 PNG 배포, floor_plan_markers 테이블(0033), 마커 CRUD API, 관리자 편집(롱프레스 추가/드래그 이동/삭제), 6종 유도등 마커 체계(천장피난구/벽부피난구/거실통로/복도통로/계단통로/객석통로), 점검 개소 연결 및 점검 페이지 연동.

## Phase Details

### Phase 5: Navigation Restructuring
**Goal**: 사용자가 조치 메뉴를 BottomNav에서 직접 접근하고, 더보기 페이지 없이 햄버거 메뉴로 모든 항목을 탐색할 수 있다
**Depends on**: Phase 4 (v1.0 complete)
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. BottomNav에 조치 탭이 표시되고 /remediation 으로 이동한다
  2. 승강기 항목이 BottomNav에 유지되고 SideMenu 시스템 섹션에서도 접근 가능하다
  3. /more 경로로 접근하면 앱이 404가 아닌 적절한 페이지(대시보드 등)로 리디렉션한다
  4. SideMenu(햄버거)에 더보기 항목들이 통합되어 용도별로 구분된다
**Plans**: 2 plans
Plans:
- [x] 05-01-PLAN.md — GlobalHeader + BottomNav 탭 교체 + RemediationPage + 라우트 정리
- [x] 05-02-PLAN.md — SideMenu 4섹션 재편 + 페이지별 헤더/SideMenu 중복 제거
**UI hint**: yes

### Phase 6: Remediation Tracking
**Goal**: 점검에서 불량/주의 판정된 개소의 조치 진행 상황을 기록하고 추적할 수 있다
**Depends on**: Phase 5
**Requirements**: REM-01, REM-02, REM-03, REM-04
**Success Criteria** (what must be TRUE):
  1. 조치 관리 페이지에서 불량/주의 판정 개소 목록을 카테고리·상태·기간별로 필터링해 조회할 수 있다
  2. 각 항목에 조치 메모를 작성하고 상태(미조치/조치중/완료)를 변경할 수 있다
  3. 조치 전/후 사진을 R2에 업로드하고 해당 항목 상세 화면에서 확인할 수 있다
  4. 대시보드의 미조치 카운트가 실제 미조치 건수와 일치한다 (하드코딩 2 제거)
**Plans**: 2 plans
Plans:
- [x] 06-01-PLAN.md — API 엔드포인트 + 공유 훅 추출 + API 클라이언트
- [x] 06-02-PLAN.md — RemediationPage 목록 + 상세 페이지 + 라우팅 + 배지 연동
**UI hint**: yes

### Phase 7: Tech Debt + Admin
**Goal**: 점검자 이름이 DB에서 동적으로 조회되고, 관리자가 직원·시스템 설정을 앱에서 관리할 수 있다
**Depends on**: Phase 6
**Requirements**: TECH-01, ADMIN-01, ADMIN-02
**Success Criteria** (what must be TRUE):
  1. 점검 기록의 점검자 이름이 DB staff 테이블에서 조회되고 하드코딩 STAFF_ROLES 맵이 코드에서 제거된다
  2. 관리자 계정으로만 접근 가능한 관리자 설정 페이지가 존재하며, 직원 계정 추가/수정/비밀번호 초기화가 가능하다
  3. 관리자가 시스템 설정(점검 카테고리 조회, 개소 추가/수정/비활성화)을 앱 내에서 구성할 수 있다
**Plans**: 2 plans
Plans:
- [x] 07-01-PLAN.md — DB 마이그레이션 + API 엔드포인트 + TECH-01 하드코딩 제거 + 라우팅
- [x] 07-02-PLAN.md — AdminPage 완전 구현 (직원관리 + 개소관리 2탭)
**UI hint**: yes

### Phase 8: Meal Records
**Goal**: 팀원이 매일 미식(안 먹은 끼니)을 앱에서 기록하고, 월별 식사 통계(제공/실제/미식/주말 식대)를 조회할 수 있다
**Depends on**: Phase 7
**Requirements**: MEAL-01, MEAL-02
**Success Criteria** (what must be TRUE):
  1. 개인별로 미식(안 먹은 끼니)을 달력에서 탭으로 기록하고 수정할 수 있다
  2. 월별 제공 식수, 실제 식수, 미식 횟수, 주말 식대를 요약 카드로 조회할 수 있다
**Plans**: 2 plans
Plans:
- [ ] 08-01-PLAN.md — DB 마이그레이션 + API 엔드포인트 + mealCalc 유틸 + 라우팅
- [ ] 08-02-PLAN.md — MealPage 달력 UI + 탭 인터랙션 + 통계 카드 + 메뉴표 placeholder
**UI hint**: yes

### Phase 9: Education Management
**Goal**: 팀원의 보수교육 일정을 관리하고, 이수 완료 및 인증서를 기록하며, 마감 임박 시 경고를 확인할 수 있다
**Depends on**: Phase 7
**Requirements**: EDU-01, EDU-02, EDU-03
**Success Criteria** (what must be TRUE):
  1. 교육 일정(교육명, 날짜, 기관, 대상자)을 등록·수정·조회할 수 있다
  2. 이수 완료를 기록하고 인증서 파일을 R2에 업로드해 앱에서 다운로드할 수 있다
  3. 개인 페이지에서 다음 교육 마감일까지의 D-day를 확인할 수 있다
**Plans**: TBD
**UI hint**: yes

### Phase 10: Legal Inspection
**Goal**: 소방시설 법적 점검(작동기능/종합정밀) 결과를 기록하고, 지적사항 시정 진행을 추적하며, 관련 서류를 보관할 수 있다
**Depends on**: Phase 7
**Requirements**: LEGAL-01, LEGAL-02
**Success Criteria** (what must be TRUE):
  1. 법적 점검 결과(점검 유형, 일자, 점검기관, 결과)를 기록하고 관련 서류를 R2에 업로드할 수 있다
  2. 지적사항을 항목별로 등록하고 시정조치 내용과 완료 여부를 기록할 수 있다
**Plans**: TBD
**UI hint**: yes

### Phase 11: Elevator Inspection Certs
**Goal**: 승강기 법정검사 인증서/리포트를 업로드하고 ElevatorPage에서 조회할 수 있다
**Depends on**: Phase 7
**Requirements**: ELEV-02
**Success Criteria** (what must be TRUE):
  1. 승강기 법정검사 인증서/리포트를 R2에 업로드하고 ElevatorPage에서 확인할 수 있다
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Deployment & Infrastructure | v1.0 | 3/3 | Complete | 2026-03-28 |
| 2. Stabilization & Code Quality | v1.0 | 5/5 | Complete | 2026-03-28 |
| 3. Excel Reports — Annual Matrix Types | v1.0 | 2/2 | Complete | 2026-03-28 |
| 4. Completion Tracking & Daily Reporting | v1.0 | 3/3 | Complete | 2026-03-30 |
| 5. Navigation Restructuring | v1.1 | 2/2 | Complete   | 2026-04-01 |
| 6. Remediation Tracking | v1.1 | 2/2 | Complete    | 2026-04-01 |
| 7. Tech Debt + Admin | v1.1 | 2/2 | Complete   | 2026-04-02 |
| 8. Meal Records | v1.1 | 0/2 | Planned | - |
| 9. Education Management | v1.1 | 0/? | Not started | - |
| 10. Legal Inspection | v1.1 | 0/? | Not started | - |
| 11. Elevator Inspection Certs | v1.1 | 0/? | Not started | - |

---
*Roadmap created: 2026-03-28*
*v1.1 phases added: 2026-03-31*
*Last updated: 2026-04-02*
