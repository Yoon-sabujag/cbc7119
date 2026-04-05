# Roadmap: CHA Bio Complex Fire Safety System

## Milestones

- ✅ **v1.0 Completion** — Phases 1-4 (shipped 2026-03-31)
- ✅ **v1.1 UI 재편 + 기능 확장** — Phases 5-11 (shipped 2026-04-05)
- 🚧 **v1.2 UX 개선 + 다운로드** — Phases 12-15 (in progress)

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

### 🚧 v1.2 UX 개선 + 다운로드 (In Progress)

**Milestone Goal:** 법적 점검·조치 관련 UX 편의성 개선 및 보고서 다운로드 기능

- [ ] **Phase 12: Multi-Photo Infrastructure** - DB migration + useMultiPhotoUpload hook + PhotoGrid component (architectural blocker)
- [ ] **Phase 13: Finding BottomSheet Restructure** - 점검항목 선택 + 위치 3단계 드롭다운 + 사진 업로드 통합
- [ ] **Phase 14: Schedule Date Range** - 시작일/종료일 범위로 연속 일정 한번에 등록
- [ ] **Phase 15: Finding Download** - 건별 다운로드 + 일괄 ZIP + iOS PWA 지원

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
**Plans:** 1/2 plans executed
Plans:
- [x] 12-01-PLAN.md — Migration + dependency + types + useMultiPhotoUpload hook + PhotoGrid component
- [ ] 12-02-PLAN.md — API handler updates + LegalFindingDetailPage integration + deploy
**UI hint**: yes

### Phase 13: Finding BottomSheet Restructure
**Goal**: 지적사항 등록 시 공통 항목 선택과 구조화된 위치 입력이 가능하다
**Depends on**: Phase 12
**Requirements**: FIND-01, FIND-02
**Success Criteria** (what must be TRUE):
  1. 지적사항 등록 화면에서 공통 점검항목 목록에서 선택하거나 직접 입력할 수 있다
  2. 위치를 구역→층→상세위치 3단계 드롭다운으로 입력할 수 있다
  3. 지적사항 등록 시 사진을 최대 5장까지 첨부할 수 있다 (Phase 12 PhotoGrid 활용)
**Plans**: TBD
**UI hint**: yes

### Phase 14: Schedule Date Range
**Goal**: 법적 점검 연속 일정을 시작일/종료일 범위로 한번에 등록할 수 있다
**Depends on**: Phase 11
**Requirements**: SCHED-01, SCHED-02
**Success Criteria** (what must be TRUE):
  1. 일정 추가 시 종료일 입력 필드가 나타나고 날짜 범위를 선택할 수 있다
  2. 범위 선택 시 "N일 일정이 추가됩니다" 미리보기가 실시간으로 표시된다
  3. 확인 후 해당 기간의 각 날짜에 일정이 개별적으로 등록된다
**Plans**: TBD
**UI hint**: yes

### Phase 15: Finding Download
**Goal**: 지적사항 내용과 사진을 건별 또는 일괄로 다운로드할 수 있다
**Depends on**: Phase 12
**Requirements**: DL-01, DL-02, DL-03
**Success Criteria** (what must be TRUE):
  1. 지적사항 상세 화면에서 건별 다운로드 버튼으로 내용+사진을 내려받을 수 있다
  2. 라운드 목록에서 일괄 다운로드 버튼으로 전체 지적사항을 ZIP으로 내려받을 수 있다
  3. iOS PWA 홈 화면 모드에서 다운로드가 정상 동작한다 (window.open + 공유시트)
**Plans**: TBD
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
| 12. Multi-Photo Infrastructure | v1.2 | 1/2 | In Progress|  |
| 13. Finding BottomSheet Restructure | v1.2 | 0/? | Not started | - |
| 14. Schedule Date Range | v1.2 | 0/? | Not started | - |
| 15. Finding Download | v1.2 | 0/? | Not started | - |

---
*Roadmap created: 2026-03-28*
*v1.1 shipped: 2026-04-05*
*v1.2 started: 2026-04-05*
*Last updated: 2026-04-05*
