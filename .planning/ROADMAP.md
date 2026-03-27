# Roadmap: CHA Bio Complex Fire Safety System — Milestone 2

**Project:** CHA Bio Complex Fire Safety Management System
**Milestone:** Completion — Bug Fixes, Excel Reports, Schedule Linkage
**Created:** 2026-03-28
**Granularity:** Standard
**Coverage:** 19/19 v1 requirements mapped

---

## Phases

- [ ] **Phase 1: Deployment & Infrastructure** - 504 오류 해결 및 프로덕션 배포 파이프라인 확립
- [ ] **Phase 2: Stabilization & Code Quality** - 기존 완료 기능 전수 테스트 및 버그 수정
- [ ] **Phase 3: Excel Reports — Annual Matrix Types** - 5종 연간 매트릭스 점검일지 엑셀 출력 구현
- [ ] **Phase 4: Completion Tracking & Daily Reporting** - 일일업무일지 출력 및 일정↔기록 연결 로직

---

## Phase Details

### Phase 1: Deployment & Infrastructure
**Goal**: 프로덕션 배포 파이프라인이 동작하고 D1 스키마가 로컬/원격 일치한다
**Depends on**: Nothing (first phase)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. `wrangler pages deploy` 명령이 504 없이 완료되고 https://cbc7119.pages.dev 에 최신 빌드가 반영된다
  2. 프로덕션 환경에서 로그인, 대시보드, 점검 기록 기본 플로우가 오류 없이 동작한다
  3. `wrangler d1 migrations list --remote` 와 `--local` 결과가 동일하게 표시된다
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Vite bundle splitting (manualChunks) + public/_headers cache control
- [x] 01-02-PLAN.md — GitHub remote repo creation + GitHub Actions CI/CD workflow
- [ ] 01-03-PLAN.md — D1 migration verification + production smoke test

### Phase 2: Stabilization & Code Quality
**Goal**: 기존에 구현된 모든 기능이 버그 없이 동작하고 코드베이스가 일관된 패턴을 따른다
**Depends on**: Phase 1
**Requirements**: STAB-01, STAB-02, STAB-03, STAB-04, STAB-05, STAB-06, STAB-07, STAB-08
**Success Criteria** (what must be TRUE):
  1. 4인 계정 모두 로그인/로그아웃이 정상 작동하고 권한별 접근이 올바르게 제어된다
  2. 대시보드의 4개 카드(점검현황, 미조치이슈, 오늘일정, 승강기고장)가 실제 DB 데이터와 일치하게 표시된다
  3. 소방 점검 플로우(카테고리 → 구역 → 층 → 개소 → 결과 입력 → 저장)가 13개 카테고리 모두에서 오류 없이 완료된다
  4. QR 스캔 점검, QR 출력(2종), 소화기 공개 점검표, 기존 엑셀 출력 4종이 모두 정상 다운로드된다
  5. `xlsx-js-style` 등 미사용 의존성이 제거되고 번들 크기가 감소한다
**Plans**: 5 plans

Plans:
- [ ] 02-01-PLAN.md — Production test: Auth + Dashboard + Fire Inspection (STAB-01, STAB-02, STAB-03)
- [ ] 02-02-PLAN.md — Production test: QR + Schedule + Excel 4 types + Operations (STAB-04, STAB-05, STAB-06, STAB-07)
- [ ] 02-03-PLAN.md — Dependency cleanup: xlsx-js-style + lucide-react + date-fns removal (STAB-08)
- [ ] 02-04-PLAN.md — Bug batch fix (critical/major/minor) + production deploy
- [ ] 02-05-PLAN.md — Final smoke test + Phase 2 completion

### Phase 3: Excel Reports — Annual Matrix Types
**Goal**: 법정 요구 5종 연간 매트릭스 점검일지를 현장 양식과 동일한 레이아웃으로 즉시 출력할 수 있다
**Depends on**: Phase 2
**Requirements**: EXCEL-01, EXCEL-02, EXCEL-03, EXCEL-04, EXCEL-05
**Success Criteria** (what must be TRUE):
  1. 소방펌프 점검일지를 출력하면 20개 점검항목과 양호/불량 기호가 기재된 A4 1장 엑셀 파일이 다운로드된다
  2. 자탐/제연/방화셔터/피난방화시설 각각의 점검일지를 출력하면 10개 또는 9개 항목 × 12개월 매트릭스에 ○/△/× 기호가 채워진 엑셀 파일이 다운로드된다
  3. 출력된 엑셀 파일이 Excel/Numbers에서 열릴 때 레이아웃 손상이나 깨진 문자가 없다
  4. 각 점검일지는 점검 기록 DB 데이터를 기반으로 자동 채워진다 (수동 입력 불필요)
**Plans**: TBD
**UI hint**: yes

### Phase 4: Completion Tracking & Daily Reporting
**Goal**: 일일업무일지가 자동으로 조합되고 대시보드의 일정 완료 상태가 점검 기록과 연동된다
**Depends on**: Phase 3
**Requirements**: EXCEL-06, LINK-01, LINK-02
**Success Criteria** (what must be TRUE):
  1. 날짜를 선택하면 해당 날의 근무표/점검일정/승강기이역/소방일정이 자동 기재된 일일업무일지 엑셀 파일이 다운로드된다
  2. 점검 기록을 저장하면 연결된 점검 계획 일정의 완료 상태가 자동으로 업데이트된다
  3. 대시보드 "오늘 일정" 카드에서 각 일정의 완료/미완료 상태가 실제 점검 기록 존재 여부 기반으로 표시된다
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Deployment & Infrastructure | 2/3 | In Progress|  |
| 2. Stabilization & Code Quality | 0/5 | Not started | - |
| 3. Excel Reports — Annual Matrix Types | 0/? | Not started | - |
| 4. Completion Tracking & Daily Reporting | 0/? | Not started | - |

---

## Coverage Map

| Requirement | Phase |
|-------------|-------|
| DEPLOY-01 | Phase 1 |
| DEPLOY-02 | Phase 1 |
| DEPLOY-03 | Phase 1 |
| STAB-01 | Phase 2 |
| STAB-02 | Phase 2 |
| STAB-03 | Phase 2 |
| STAB-04 | Phase 2 |
| STAB-05 | Phase 2 |
| STAB-06 | Phase 2 |
| STAB-07 | Phase 2 |
| STAB-08 | Phase 2 |
| EXCEL-01 | Phase 3 |
| EXCEL-02 | Phase 3 |
| EXCEL-03 | Phase 3 |
| EXCEL-04 | Phase 3 |
| EXCEL-05 | Phase 3 |
| EXCEL-06 | Phase 4 |
| LINK-01 | Phase 4 |
| LINK-02 | Phase 4 |

**Total:** 19/19 v1 requirements mapped

---
*Roadmap created: 2026-03-28*
*Last updated: 2026-03-28 after Phase 2 planning*
