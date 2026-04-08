# Roadmap: CHA Bio Complex Fire Safety System

## Milestones

- ✅ **v1.0 Completion** — Phases 1-4 (shipped 2026-03-31)
- ✅ **v1.1 UI 재편 + 기능 확장** — Phases 5-11 (shipped 2026-04-05)
- ✅ **v1.2 UX 개선 + 다운로드** — Phases 12-15 (shipped 2026-04-06)
- ✅ **v1.3 설정 페이지** — Phases 16-19 (shipped 2026-04-08)
- 🚧 **v1.4 문서 관리** — Phases 20-22 (started 2026-04-08)

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

<details>
<summary>✅ v1.3 설정 페이지 (Phases 16-19) — SHIPPED 2026-04-08</summary>

- [x] Phase 16: Settings Page + Profile (2/2 plans) — completed 2026-04-05
- [x] Phase 17: Push Notification Settings (3/3 plans) — completed 2026-04-07
- [x] Phase 18: Menu Customization (3/3 plans) — completed 2026-04-08
- [x] Phase 19: App Info & Cache (1/1 plan) — completed 2026-04-08

Full details: `.planning/milestones/v1.3-ROADMAP.md`

</details>

### 🚧 v1.4 문서 관리 (Phases 20-22)

- [ ] **Phase 20: Document Storage Infrastructure** — D1 `documents` 테이블 + R2 presigned URL 업로드/다운로드 API (admin gated, 130MB 대용량 대응)
- [ ] **Phase 21: Documents Page UI** — DocumentsPage 라우트로 소방계획서·소방훈련자료 업로드(admin)/다운로드(전체)/연도별 이력 조회
- [ ] **Phase 22: 업무수행기록표 Form + Excel Output** — `work_logs` 테이블 + 폼 입력 페이지 + 기존 양식 호환 xlsx-js-style 출력 + 월별 재출력

## Phase Details

<details>
<summary>Archived phase details (Phases 12-19 — v1.2/v1.3)</summary>

See milestone archives:
- `.planning/milestones/v1.2-ROADMAP.md` (Phases 12-15)
- `.planning/milestones/v1.3-ROADMAP.md` (Phases 16-19)

</details>

### Phase 20: Document Storage Infrastructure
**Goal**: 소방 문서를 R2에 안전하게 업로드/다운로드하고 메타데이터를 D1에서 조회할 수 있는 백엔드 인프라가 존재한다
**Depends on**: Phase 19 (v1.3 complete)
**Requirements**: DOC-07 (부분), DOC-02·DOC-05 백엔드 (admin 업로드), DOC-01·DOC-03·DOC-04·DOC-06 백엔드 (다운로드/이력)
**Success Criteria** (what must be TRUE):
  1. D1 `documents` 테이블이 존재하고 (id, type, year, title, filename, r2_key, size, uploaded_by, uploaded_at) 구조로 메타데이터를 보존한다
  2. admin 권한 staff만 호출 가능한 R2 presigned upload URL 발급 API가 존재하여, 클라이언트가 ~130MB 소방훈련자료를 Workers 100MB request 제한을 우회해 직접 R2에 PUT할 수 있다
  3. 업로드 완료 후 메타데이터를 등록하는 commit API가 admin 권한으로 동작하고, 일반 staff는 401/403을 받는다
  4. 모든 staff가 호출 가능한 list API가 type별·연도별 정렬된 문서 목록을 반환하고, download API가 R2에서 파일을 스트리밍 또는 presigned download URL로 제공한다
**Plans:** 2/3 plans executed
Plans:
- [x] 20-01-PLAN.md — Migration 0046_documents.sql + shared helpers (_helpers.ts)
- [x] 20-02-PLAN.md — R2 multipart upload endpoints (create/upload-part/complete/abort)
- [ ] 20-03-PLAN.md — List + download endpoints + production deploy + smoke test

### Phase 21: Documents Page UI
**Goal**: 사용자가 문서 관리 페이지에서 소방계획서·소방훈련자료를 업로드(admin)·다운로드(전체)·연도별로 조회할 수 있다
**Depends on**: Phase 20
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, DOC-07 (UI/wire 부분)
**Success Criteria** (what must be TRUE):
  1. SideMenu에서 "문서 관리" 항목으로 진입하는 DocumentsPage 라우트가 존재한다
  2. 모든 staff가 소방계획서/소방훈련자료의 최신본을 탭 한 번으로 다운로드할 수 있다 (iOS PWA 호환 — window.open 패턴 재사용)
  3. admin staff에게만 업로드 버튼이 노출되며, 연도·제목 입력 후 R2 presigned URL을 통해 직접 업로드(진행률 표시)되고 완료 시 목록에 즉시 반영된다
  4. 연도별 이력 섹션에서 과거 버전을 선택해 다운로드할 수 있다 (소방계획서·소방훈련자료 각각)
  5. 일반 staff가 업로드 API를 직접 호출해도 권한 거부로 차단된다
**Plans**: TBD
**UI hint**: yes

### Phase 22: 업무수행기록표 Form + Excel Output
**Goal**: 사용자가 소방안전관리자 업무수행기록표를 앱에서 작성·저장하고 기존 양식과 동일한 .xlsx로 출력할 수 있다
**Depends on**: Phase 21
**Requirements**: WORKLOG-01, WORKLOG-02, WORKLOG-03
**Success Criteria** (what must be TRUE):
  1. D1 `work_logs` 테이블이 존재하여 월(year_month)·작성자·필드별 본문을 저장한다
  2. 사용자가 업무수행기록표 작성 페이지에서 대상 월과 각 항목 필드를 입력하고 저장할 수 있다
  3. 저장한 월의 기록을 다시 열어 수정하고 재저장할 수 있다 (월별 단일 레코드)
  4. "엑셀 출력" 버튼 탭 시 기존 양식 파일과 동일한 셀 구조·서식의 .xlsx 파일이 xlsx-js-style 기반으로 즉시 다운로드된다 (기존 `src/utils/generateExcel.ts` 패턴 재사용, 신규 라이브러리 추가 금지)
**Plans**: TBD
**UI hint**: yes

<!-- ARCHIVED_PHASES_START

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
**Plans:** 1 plan
Plans:
- [x] 19-01-PLAN.md — vite define version injection + SettingsPanel 앱 정보 section + cache clear + deploy
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
**Goal**: 사용자가 SideMenu 항목 순서와 표시/숨김을 divider 모델로 커스터마이징할 수 있다 (BottomNav는 Phase 18에서 5개 고정)
**Depends on**: Phase 16
**Requirements**: MENU-01, MENU-02
**Success Criteria** (what must be TRUE):
  1. 설정 페이지의 MenuSettingsSection에서 SideMenu 항목 순서를 위/아래 버튼으로 변경하고 divider(그룹 구분선)를 추가/편집/삭제할 수 있다
  2. 설정 페이지에서 SideMenu 항목별 표시/숨김 토글을 켜고 끌 수 있다
  3. "설정 저장" 버튼으로 저장한 메뉴 설정이 서버에 퍼시스트되어 앱을 닫고 다시 열어도 유지된다
**Plans:** 3/3 plans complete
Plans:
- [x] 18-01-PLAN.md — MenuConfig types (divider model) + DEFAULT_SIDE_MENU + legacy migration + SideMenu read-only refactor
- [x] 18-02-PLAN.md — MenuSettingsSection editor component (move/toggle/rename/add/delete/reset/save)
- [x] 18-03-PLAN.md — Mount in SettingsPanel + production deploy + human verification
**UI hint**: yes

### Phase 19: App Info & Cache
**Goal**: 사용자가 빌드 버전을 확인하고 서비스워커 캐시를 직접 초기화할 수 있다
**Depends on**: Phase 16
**Requirements**: APP-01, APP-02
**Success Criteria** (what must be TRUE):
  1. 설정 페이지에서 현재 앱 빌드 버전을 확인할 수 있다
  2. 캐시 초기화 버튼을 탭하면 서비스워커 캐시가 삭제되고 완료 메시지가 표시된다
  3. 캐시 초기화 후 앱이 최신 리소스로 새로고침된다
**Plans:** 1/1 plans complete
Plans:
- [x] 19-01-PLAN.md — vite define version injection + SettingsPanel 앱 정보 section + cache clear + deploy
**UI hint**: yes

ARCHIVED_PHASES_END -->

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
| 18. Menu Customization | v1.3 | 3/3 | Complete   | 2026-04-08 |
| 19. App Info & Cache | v1.3 | 1/1 | Complete   | 2026-04-08 |
| 20. Document Storage Infrastructure | v1.4 | 2/3 | In Progress|  |
| 21. Documents Page UI | v1.4 | 0/— | Not started | — |
| 22. 업무수행기록표 Form + Excel | v1.4 | 0/— | Not started | — |

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
*v1.3 shipped: 2026-04-08*
*v1.4 started: 2026-04-08*
*Last updated: 2026-04-08*
