# Roadmap: CHA Bio Complex Fire Safety System

## Milestones

- ✅ **v1.0 Completion** — Phases 1-4 (shipped 2026-03-31)
- ✅ **v1.1 UI 재편 + 기능 확장** — Phases 5-11 (shipped 2026-04-05)
- ✅ **v1.2 UX 개선 + 다운로드** — Phases 12-15 (shipped 2026-04-06)
- 🚧 **v1.3 설정 페이지** — Phases 16-19 (in progress)

## Phases

<details>
<summary>✅ v1.0 Completion (Phases 1-4) — SHIPPED 2026-03-31</summary>

- [x] Phase 1: Deployment & Infrastructure (3/3 plans) — completed 2026-03-28
- [x] Phase 2: Stabilization & Code Quality (5/5 plans) — completed 2026-03-28
- [x] Phase 3: Excel Reports — Annual Matrix Types (2/2 plans) — completed 2026-03-28
- [x] Phase 4: Completion Tracking & Daily Reporting (3/3 plans) — completed 2026-03-30

</details>

<details>
<summary>✅ v1.1 UI 재편 + 기능 확장 (Phases 5-11) — SHIPPED 2026-04-05</summary>

- [x] Phase 5: Navigation Restructuring (2/2 plans) — completed 2026-04-01
- [x] Phase 6: Remediation Tracking (2/2 plans) — completed 2026-04-01
- [x] Phase 7: Tech Debt + Admin (2/2 plans) — completed 2026-04-02
- [x] Phase 8: Meal Records (2/2 plans) — completed 2026-04-02
- [x] Phase 9: Education Management (2/2 plans) — completed 2026-04-02
- [x] Phase 10: Legal Inspection (2/2 plans) — completed 2026-04-04
- [x] Phase 11: Elevator Inspection Certs (3/3 plans) — completed 2026-04-04

Full details: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 UX 개선 + 다운로드 (Phases 12-15) — SHIPPED 2026-04-06</summary>

- [x] Phase 12: Multi-Photo Infrastructure (2/2 plans) — completed 2026-04-06
- [x] Phase 13: Finding BottomSheet Restructure — completed 2026-04-06
- [x] Phase 14: Schedule Date Range — completed 2026-04-06
- [x] Phase 15: Finding Download (2/2 plans) — completed 2026-04-05

</details>

### 🚧 v1.3 설정 페이지 (In Progress)

**Milestone Goal:** 사용자별 앱 설정을 관리할 수 있는 설정 페이지 구축

- [x] **Phase 16: Settings Page + Profile** - 설정 페이지 진입점 + 비밀번호·이름 변경 + 로그아웃 (completed 2026-04-05)
- [x] **Phase 17: Push Notification Settings** - PWA 푸시 알림 구독/해제 + 알림 유형별 토글 (completed 2026-04-06)
- [ ] **Phase 18: Menu Customization** - BottomNav 순서 변경 + SideMenu 항목 표시/숨김 설정
- [ ] **Phase 19: App Info & Cache** - 빌드 버전 표시 + 서비스워커 캐시 초기화

## Phase Details

### Phase 12: Multi-Photo Infrastructure
**Goal**: 지적사항·조치 사진을 최대 5장 저장·표시하는 공유 인프라가 존재한다
**Depends on**: Phase 11
**Requirements**: PHOTO-01, PHOTO-02, PHOTO-03
**Success Criteria** (what must be TRUE):
  1. 지적사항 또는 조치 사진을 최대 5장까지 업로드할 수 있다
  2. 업로드된 사진이 썸네일 그리드로 표시된다
  3. 썸네일을 탭하면 라이트박스로 풀스크린 확대보기된다
  4. 기존 단일 사진(photo_key) 데이터가 기존과 동일하게 표시된다 (하위 호환)
**Plans:** 2/2 plans executed
Plans:
- [x] 12-01-PLAN.md — Migration + dependency + types + useMultiPhotoUpload hook + PhotoGrid component
- [x] 12-02-PLAN.md — API handler updates + LegalFindingDetailPage integration + deploy
**UI hint**: yes

### Phase 13: Finding BottomSheet Restructure
**Goal**: 지적사항 등록 시 공통 항목 선택과 구조화된 위치 입력이 가능하다
**Depends on**: Phase 12
**Requirements**: FIND-01, FIND-02
**Success Criteria** (what must be TRUE):
  1. 지적사항 등록 화면에서 공통 점검항목 목록에서 선택하거나 직접 입력할 수 있다
  2. 위치를 구역→층→상세위치 3단계 드롭다운으로 입력할 수 있다
  3. 지적사항 등록 시 사진을 최대 5장까지 첨부할 수 있다 (Phase 12 PhotoGrid 활용)
**Plans:** 1/1 plans complete
Plans:
- [x] 13-01-PLAN.md — ZONE_FLOOR_DETAILS constant + combo select for location detail + deploy
**UI hint**: yes

### Phase 14: Schedule Date Range
**Goal**: 법적 점검 연속 일정을 시작일/종료일 범위로 한번에 등록할 수 있다
**Depends on**: Phase 11
**Requirements**: SCHED-01, SCHED-02
**Success Criteria** (what must be TRUE):
  1. 일정 추가 시 종료일 입력 필드가 나타나고 날짜 범위를 선택할 수 있다
  2. 범위 선택 시 "N일 일정이 추가됩니다" 미리보기가 실시간으로 표시된다
  3. 확인 후 해당 기간의 각 날짜에 일정이 개별적으로 등록된다
**Plans:** 1/1 plan
Plans:
- [ ] 13-01-PLAN.md — ZONE_FLOOR_DETAILS constant + combo select for location detail + deploy
**UI hint**: yes

### Phase 15: Finding Download
**Goal**: 지적사항 내용과 사진을 건별 또는 일괄로 다운로드할 수 있다
**Depends on**: Phase 12
**Requirements**: DL-01, DL-02, DL-03
**Success Criteria** (what must be TRUE):
  1. 지적사항 상세 화면에서 건별 다운로드 버튼으로 내용+사진을 내려받을 수 있다
  2. 라운드 목록에서 일괄 다운로드 버튼으로 전체 지적사항을 ZIP으로 내려받을 수 있다
  3. iOS PWA 홈 화면 모드에서 다운로드가 정상 동작한다 (window.open + 공유시트)
**Plans:** 2/2 plans complete
Plans:
- [x] 15-01-PLAN.md — findingDownload.ts 유틸리티 + LegalFindingDetailPage 건별 다운로드 버튼
- [x] 15-02-PLAN.md — LegalFindingsPage 일괄 ZIP 다운로드 + 프로덕션 배포/검증
**UI hint**: yes

### Phase 16: Settings Page + Profile
**Goal**: 사용자가 설정 페이지에서 비밀번호·이름을 변경하고 로그아웃할 수 있다
**Depends on**: Phase 15
**Requirements**: PROF-01, PROF-02, APP-03
**Success Criteria** (what must be TRUE):
  1. SideMenu 또는 BottomNav에서 설정 페이지로 진입할 수 있다
  2. 설정 페이지에서 현재 비밀번호 확인 후 새 비밀번호로 변경할 수 있다
  3. 설정 페이지에서 자신의 이름을 수정하고 저장할 수 있다
  4. 설정 페이지에서 로그아웃 버튼으로 세션을 종료하고 로그인 화면으로 이동한다
**Plans:** 2/2 plans complete
Plans:
- [x] 16-01-PLAN.md — Profile API + authStore update + SettingsPage component
- [x] 16-02-PLAN.md — App.tsx wiring + SideMenu/DesktopSidebar cleanup + deploy
**UI hint**: yes

### Phase 17: Push Notification Settings
**Goal**: 사용자가 PWA 푸시 알림을 구독하고 알림 유형별로 활성화 여부를 제어할 수 있다
**Depends on**: Phase 16
**Requirements**: NOTI-01, NOTI-02, NOTI-03
**Success Criteria** (what must be TRUE):
  1. 설정 페이지에서 PWA 푸시 알림을 구독하거나 해제할 수 있다
  2. 점검 일정 알림을 개별적으로 켜고 끌 수 있다
  3. 미조치 이슈 알림을 개별적으로 켜고 끌 수 있다
  4. 알림 구독 상태(허용/차단/미설정)가 설정 화면에 시각적으로 표시된다
**Plans:** 3/3 plans complete
Plans:
- [x] 17-01-PLAN.md — D1 migration + API endpoints + VitePWA injectManifest + custom service worker
- [x] 17-02-PLAN.md — pushApi client + SettingsPanel notification toggles with permission flow
- [x] 17-03-PLAN.md — Cron Worker project + VAPID keys + production deploy + E2E verification
**UI hint**: yes

### Phase 18: Menu Customization
**Goal**: 사용자가 BottomNav 순서와 SideMenu 표시 항목을 직접 커스터마이징할 수 있다
**Depends on**: Phase 16
**Requirements**: MENU-01, MENU-02
**Success Criteria** (what must be TRUE):
  1. 설정 페이지에서 BottomNav 메뉴 항목을 드래그 또는 버튼으로 순서 변경할 수 있다
  2. 설정 페이지에서 SideMenu 항목별 표시/숨김 토글을 켜고 끌 수 있다
  3. 변경한 메뉴 설정이 앱을 닫고 다시 열어도 유지된다 (로컬 퍼시스턴스)
**Plans:** 1/3 plans executed
Plans:
- [x] 18-01-PLAN.md — MenuConfig types + migration utility + typed settingsApi
- [ ] 18-02-PLAN.md — BottomNav configurable + SideMenu editMode removal (read-only)
- [ ] 18-03-PLAN.md — MenuSettingsSection (BottomNav + SideMenu editor) + SettingsPanel mount + deploy
**UI hint**: yes

### Phase 19: App Info & Cache
**Goal**: 사용자가 빌드 버전을 확인하고 서비스워커 캐시를 직접 초기화할 수 있다
**Depends on**: Phase 16
**Requirements**: APP-01, APP-02
**Success Criteria** (what must be TRUE):
  1. 설정 페이지에서 현재 앱 빌드 버전을 확인할 수 있다
  2. 캐시 초기화 버튼을 탭하면 서비스워커 캐시가 삭제되고 완료 메시지가 표시된다
  3. 캐시 초기화 후 앱이 최신 리소스로 새로고침된다
**Plans:** 1/1 plan
Plans:
- [ ] 13-01-PLAN.md — ZONE_FLOOR_DETAILS constant + combo select for location detail + deploy
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Deployment & Infrastructure | v1.0 | 3/3 | Complete | 2026-03-28 |
| 2. Stabilization & Code Quality | v1.0 | 5/5 | Complete | 2026-03-28 |
| 3. Excel Reports | v1.0 | 2/2 | Complete | 2026-03-28 |
| 4. Completion Tracking & Daily Reporting | v1.0 | 3/3 | Complete | 2026-03-30 |
| 5. Navigation Restructuring | v1.1 | 2/2 | Complete | 2026-04-01 |
| 6. Remediation Tracking | v1.1 | 2/2 | Complete | 2026-04-01 |
| 7. Tech Debt + Admin | v1.1 | 2/2 | Complete | 2026-04-02 |
| 8. Meal Records | v1.1 | 2/2 | Complete | 2026-04-02 |
| 9. Education Management | v1.1 | 2/2 | Complete | 2026-04-02 |
| 10. Legal Inspection | v1.1 | 2/2 | Complete | 2026-04-04 |
| 11. Elevator Inspection Certs | v1.1 | 3/3 | Complete | 2026-04-04 |
| 12. Multi-Photo Infrastructure | v1.2 | 2/2 | Complete | 2026-04-06 |
| 13. Finding BottomSheet Restructure | v1.2 | 1/1 | Complete   | 2026-04-06 |
| 14. Schedule Date Range | v1.2 | — | Complete | 2026-04-06 |
| 15. Finding Download | v1.2 | 2/2 | Complete | 2026-04-05 |
| 16. Settings Page + Profile | v1.3 | 2/2 | Complete    | 2026-04-05 |
| 17. Push Notification Settings | v1.3 | 3/3 | Complete    | 2026-04-07 |
| 18. Menu Customization | v1.3 | 1/3 | In Progress|  |
| 19. App Info & Cache | v1.3 | 0/? | Not started | - |

## Backlog

### 월간 방재업무계획 엑셀 생성 (BACKLOG)

**Goal:** SchedulePage 점검 일정 데이터 기반으로 월간 방재업무계획 엑셀 시트 자동 생성
**Reference:** `작업용/3월_중요업무추진계획(방재).xlsx` 2번째 시트 (N월 방재업무계획)
**구조:** NO | 내용 | 1~31일 셀(점검 여부) | 비고 — 기존 양식과 동일 포맷
**Requirements:** TBD

---
*Roadmap created: 2026-03-28*
*v1.1 shipped: 2026-04-05*
*v1.2 shipped: 2026-04-06*
*v1.3 started: 2026-04-06*
*Last updated: 2026-04-07*
