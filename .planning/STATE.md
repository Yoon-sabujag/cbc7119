---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: 문서 관리
status: milestone_complete
stopped_at: Phase 24 UI-SPEC approved
last_updated: "2026-05-02T13:34:00.000Z"
last_activity: 2026-05-02 -- Phase 24 shipped (extinguisher asset-location split, v0.2.1)
progress:
  total_phases: 12
  completed_phases: 11
  total_plans: 31
  completed_plans: 25
  percent: 92
---

# Project State: CHA Bio Complex Fire Safety System

**Last updated:** 2026-04-08
**Milestone:** v1.4 — 문서 관리

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-08)

**Core value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다
**Current focus:** Phase 24 — extinguisher-asset-location

Last activity: 2026-05-15 - Completed quick task 260515-g61: redesign/07-elevator 2C sketch — 입력 모달 (InspectModal + RepairNewModal) v0.1.1 시안 HTML, 4 viewport, 1991줄, 13/13 verify PASS, 수리 대상 색 = warning 토큰 채택 (호기 선택 accent 와 의미 분리), 사용자 검토 대기

**신규 기능 개발 금지. 실전 검증을 통해 나오는 이슈 대응만 수행.**

**1순위 — 2026-05 법정점검 실전 검증** ⭐

- 방재팀이 앱으로 실제 법정점검을 수행
- 점검 중 발견되는 UX 불편/누락/버그를 퀵으로 하나씩 다듬기
- 점검일지 엑셀 출력이 법적 제출 기준에 부합하는지 실물 확인
- 이 단계에서만 필요한 기능 추가/수정을 허용 (현장 요구 기반)

**2순위 — 자동 푸시 크론 관찰** (즉시 시작)

- 2026-04-21 이후 매일 아침 08:45 KST 자동 푸시가 실제로 쏴지는지 관찰
- 안 쏘이면 → `cbc-cron-worker` 로그 확인 (`npx wrangler tail cbc-cron-worker`)
- 조건 매치 안 되어 발송 안 되는 것이 대부분일 것 (schedule_items 빈 경우 등)

**3순위 — 엑셀 양식 파일 교체** (사소)

- 기존 양식 파일을 교체해주기만 하면 끝나는 자잘한 수정 사항
- 사용자가 양식 파일 준비되면 요청 시 처리

**하지 말 것**

- ❌ 새로운 기능 추가 (메신저, broadcast, 알림 확장 등)
- ❌ 기존 기능 리팩터/재설계 (버그 외)
- ❌ 성능 최적화 (실제 느린 증상 없음)

**"완성" 선언 조건** (아직 아님)

- 5월 법정점검 1회 이상 실제 수행 + 제출 성공
- 자동 푸시 크론 1개월 관찰에서 이상 없음
- 방재팀 4명이 일상적으로 앱을 사용 중

위 조건 충족 시 v1.0 공식 릴리스 선언 (현재 0.2.0)

## Current Position

Phase: 24
Plan: Not started
Status: Milestone complete
Last activity: 2026-05-02

Progress: [░░░░░░░░░░] 0% (v1.4, 0/3 phases)

## Performance Metrics

**Velocity:**

- Total plans completed (v1.4): 0
- Average duration: —
- Total execution time: —

**By Phase (v1.4):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 20. Document Storage Infrastructure | — | — | — |
| 21. Documents Page UI | — | — | — |
| 22. 업무수행기록표 Form + Excel | — | — | — |
| 22 | 2 | - | - |
| 24 | 6 | - | - |

*Updated after each plan completion*
| Phase 20 P01 | 4 | 2 tasks | 2 files |
| Phase 20 P02 | 12 | 3 tasks | 4 files |
| Phase 20 P03 | 6 | 3 tasks | 2 files |
| Phase 21 P03 | 2 | 1 tasks | 1 files |
| Phase 21 P04 | 4 | 3 tasks | 4 files |
| Phase 21 P05 | 15 min | 3 tasks | 3 files |

## Accumulated Context

### Roadmap Evolution

| 260502-wet | 스프링클러 2F 도면 PNG 교체 — DWG→PDF 신규 도면 4000×2946 RGBA (pdftocairo -transp + 그레이 흰색화 + alpha 부스트 + 컬러 +1px dilation), 1F·3F 톤 매칭, ?v=18 캐시버스팅, 알고리즘 메모리 저장 | 2026-05-03 | (final) | [260502-wet-2f-png-pdf-4000px-png](./quick/260502-wet-2f-png-pdf-4000px-png/) |
| 260503-2t5 | 점검·조치 자동화 5종 (유도등 회귀 + 소화기/소화전/방화셔터/전실제연댐퍼 신규) + 분말 → 분말 3.3kg DB+UI 통일 (D1 416행 마이그레이션) | 2026-05-03 | (multi) | [260503-2t5-3-3kg](./quick/260503-2t5-3-3kg/) |
- Phase 24 added (2026-04-30): 소화기 자산-위치 분리 — 5월 법정점검 준비. 운영 관찰 모드 예외 진행. CONTEXT.md 작성됨.
- Phase 24 shipped (2026-05-02): v0.2.1 production 배포 + 7개 success criteria UAT 모두 PASS. extinguishers.status + check_records.extinguisher_id 추가, /extinguishers 페이지 신설, 빈 ❓ 마커 + 범례 미배치 항목, 양방향 마커 동행 동선. UAT 중 발견된 12건 fix 모두 즉시 적용 완료(잔존 quick task 없음).

### Decisions

Carried from prior milestones:

- [v1.2 Research]: iOS PWA에서 `<a download>` 미동작 (WebKit bug 167341) — window.open() + 공유시트 사용
- [v1.2 Research]: 클라이언트 ZIP (fflate.zipSync) 사용 — Worker 128MB 제한 + 4인 팀 규모에 서버사이드 불필요
- [Phase 15]: window.open synchronously before async ops — iOS PWA popup bypass
- [Deploy]: wrangler deploy에 `--branch=production` 필수 (안 붙이면 Preview)
- [Deploy]: 프로덕션 배포 후 테스트 (로컬 서버 X)

v1.4 roadmap decisions:

- [v1.4 Roadmap]: 3-phase 구조 — Phase 20 백엔드(스키마+R2 API), Phase 21 UI 통합, Phase 22 업무수행기록표 (독립 워크스트림)
- [v1.4 Roadmap]: 소방훈련자료 ~130MB는 Workers 100MB request body 제한 초과 → R2 presigned upload URL 필수 (multipart 대신 direct PUT)
- [v1.4 Roadmap]: 업로드 권한은 기존 `role === 'admin'` 미들웨어 패턴 재사용 — 새 권한 시스템 도입 안 함
- [v1.4 Roadmap]: Excel 출력은 기존 `xlsx-js-style` + `src/utils/generateExcel.ts` 패턴 재사용 — 신규 라이브러리 추가 금지
- [v1.4 Roadmap]: DOC-07(메타 테이블)은 스키마가 land하는 Phase 20에 anchor, DOC-01..06은 사용자 가시 동작이 완성되는 Phase 21에 anchor
- [Phase 20]: requireAdmin returns Response (not throws) to allow early-return in handlers
- [Phase 20]: D1 documents table locked to D-02 schema; CHECK constraint enforces plan|drill enum at DB level
- [Phase 20]: upload-part reads params from URL query string to keep body as raw ReadableStream (no buffering)
- [Phase 20]: complete.ts sorts parts ascending before R2 complete() — R2 requires ordered parts
- [Phase 20]: Both DB failure paths call STORAGE.delete(key) per D-25 to prevent R2 orphan objects
- [Phase 20]: No admin gate on list/download per D-19 — all authenticated staff can read documents
- [Phase 20]: Migration 0046 applied to production D1 before deploy — documents table live at cha-bio-db
- [Phase 21]: migrateLegacyMenuConfig forward-merges missing DEFAULT_SIDE_MENU items (Phase 18 bug fix)
- [Phase 24]: 자산-위치 분리 — 마커는 영구 위치, ext 는 status('active'/'폐기') + check_point_id 가변 자산. ≤3 필드 변경 룰 백엔드 enforce. 빈 마커 cp 자동 생성 안 함(자산 배치 시점에만 cp 생성, 점검 대상 노출 가드).
- [Phase 24]: floorplan-markers DELETE cascade 정책 변경 — ext 자산은 unassign 만, 자산 행 보존.
- [Phase 24]: marker_id 기반 placing endpoint(`POST /api/floorplan-markers/:id/place-asset`) — atomic batch (cp 생성 + ext 매핑 + marker update). cp_id 없는 빈 마커도 자산 배치 가능.
- [Phase 24]: 마커 시각이 자산 type 기반 분기(분말/분말 20kg/할로겐/K급, 강화액→K급, 이산화탄소→할로겐). marker_type 자체는 fire_extinguisher default 로 두고 자산이 결정.
- [Phase 24]: cp.zone CHECK 제약 제거 + 'common' → 'basement' 정리(0081 마이그레이션) — 의미 부합. 향후 zone 추가 시 마이그레이션 불필요.
- [Phase 24]: extinguishers.check_point_id NOT NULL 제거(0080 마이그레이션) — skip_marker 등록 + dispose/unassign NULL set 가능.
- [Phase 24]: floor/zone 필터 COALESCE(cp, ext) — 매핑된 자산이 ext.floor=NULL 이어도 cp.floor 기준 매치.

### Pending Todos

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260412-8b1 | 데스크톱 버전 로그인 페이지 UI/UX 개선 | 2026-04-12 | c5866e5 | [260412-8b1-ui-ux](./quick/260412-8b1-ui-ux/) |
| 260420-c5s | DIV 압력관리 탱크배수주기 탭 추가 및 배수주기 이름 변경 | 2026-04-19 | e4995aa | [260420-c5s-div](./quick/260420-c5s-div/) |
| 260420-ee1 | DIV 압력관리 데스크톱 버전 (마스터-디테일 레이아웃) | 2026-04-20 | eb0b442 | [260420-ee1-div](./quick/260420-ee1-div/) |
| 260420-fri | 스플래쉬 버전 체크 + 조건부 캐시 초기화 (달라졌을 때만 리로드) | 2026-04-20 | 3a0a04b | [260420-fri-splash-version-cache](./quick/260420-fri-splash-version-cache/) |
| 260420-mk6 | 공단 공식 API 기반 승강기 검사이력 동기화 (민원24 대체, 2개 API 체이닝) | 2026-04-20 | 085b2ec | [260420-mk6-inspect-history](./quick/260420-mk6-inspect-history/) |
| 260420-n04 | 승강기 검사기록 탭 UI 연동 + 자동 새로고침 (6h TTL, 부적합 펼침) | 2026-04-20 | 1cbbbc8 | [260420-n04-inspect-history-ui](./quick/260420-n04-inspect-history-ui/) |
| 260420-npr | 검사 기록 탭 기존 UI 제거 (PDF 업로드/민원24 카드/모달 삭제, -985 lines) | 2026-04-20 | d7bec4c | [260420-npr-annual-cleanup](./quick/260420-npr-annual-cleanup/) |
| 260420-p6l | 검사일정등록 제거 + 모바일 검사기록 연도피커/카드 펼침 (점검기록 패턴) | 2026-04-20 | d13da34 | [260420-p6l-schedule-removal-mobile-picker](./quick/260420-p6l-schedule-removal-mobile-picker/) |
| 260420-q10 | 관리자 푸시 테스트 발송 기능 (/api/push/test + 설정 버튼 + README) | 2026-04-20 | 7f01d5a | [260420-q10-push-test](./quick/260420-q10-push-test/) |
| 260423-dzx | Galaxy S25 Android 레이아웃 버그 수정 (Layout dvh → 100%, 근무자 칩 small) | 2026-04-23 | ddd724a | [260423-dzx-galaxy-s25-android-layout-dvh](./quick/260423-dzx-galaxy-s25-android-layout-dvh/) |
| 260423-htx | 일반 점검 완료 개소 재진입 시 팝업 통일 (9개 카테고리 + FloorPlan, (가)완료/(나)조치대기 2-variant) | 2026-04-23 | 87389b7 | [260423-htx-inspection-revisit-popup](./quick/260423-htx-inspection-revisit-popup/) |
| 260424-1x0 | 유도등 InspectionModal 재진입 팝업 지원 (marker 기반 monthRecords 병행 업서트) | 2026-04-24 | 78bd71f | [260424-1x0-guidelamp-inspectionmodal-revisit](./quick/260424-1x0-guidelamp-inspectionmodal-revisit/) |
| 260424-1x1 | 접근불가 개소 자동 스킵 대신 팝업 노출 (AccessBlockedPopup + picker 포함) | 2026-04-24 | 44463c4 | [260424-1x1-access-blocked-popup](./quick/260424-1x1-access-blocked-popup/) |
| 260424-7l2 | 유도등 마커 description 지원 — floor_plan_markers에 description 컬럼 추가(migration 0072) + InspectionModal/API 반영 | 2026-04-24 | 1a3f514 | [260424-7l2-guidelamp-marker-access-blocked](./quick/260424-7l2-guidelamp-marker-access-blocked/) |
| 260424-7l3 | CheckpointsPage 마커 id 편집 라우팅 수정 (FPM- 프리픽스는 floorplan-markers PUT으로) + FloorPlan 접근불가 팝업 반영 | 2026-04-24 | 97cb3d8 | [260424-7l3-checkpointspage-marker-route](./quick/260424-7l3-checkpointspage-marker-route/) |
| 260426-cyv | 5/1 노동절 공휴일 인식 버그 + 평일공휴일/공휴일직후토요일 식대 보정 (holidays.ts 통합 + mealCalc isHoliday/isPrevDayHoliday 옵션) | 2026-04-26 | 76a8aa5 | [260426-cyv-may-holiday-meal-fix](./quick/260426-cyv-may-holiday-meal-fix/) |
| 260426-f54 | 점검 "완료" 정의 통일 — bad+resolved 도 완료로 인정 (카드/대시보드/층별 화면 일관화: isCpCompleted 헬퍼 + dashboard SQL 7곳 보정) | 2026-04-26 | b7e4c71 | [260426-f54-completion-rule-bad-resolved](./quick/260426-f54-completion-rule-bad-resolved/) |
| 260428-id1 | B1 비상콘센트 CP-B1-6-BC 4월 누락 기록 회복 (D1 INSERT, SH 짝꿍과 동일 timestamp/staff/result, 154/154 회복) | 2026-04-28 | 9a3887d | [260428-id1-recover-cp-b1-6-bc-april](./quick/260428-id1-recover-cp-b1-6-bc-april/) |
| 260428-lha | FloorPlanPage 평면도 모달에 paired 비상콘센트(BC) 입력 섹션 + 직렬 저장 추가 (4-27 박보융 BC 누락 사고 재발 방지, 단일 파일 +94/-3) | 2026-04-28 | db7ced6 | [260428-lha-floorplanpage-paired-bc-modal](./quick/260428-lha-floorplanpage-paired-bc-modal/) |
| 260429-meq | 승강기 고장 접수/수리 완료 모달 사진 첨부 5장 지원 (migration 0074 elevator_faults photo_keys + repair_photo_keys, 3개 모달 MultiPhotoUpload 통합) | 2026-04-29 | 97fd14f | [260429-meq-elevator-fault-photo-upload](./quick/260429-meq-elevator-fault-photo-upload/) |
| 260505-c9d | 특별피난계단 점검 사진이 전층 record에 중복 저장되던 버그 수정 — StairwellModal.handleSave photoKey 분배를 1건 대표 부여(caution/bad 우선 → 첫 층)로 변경 | 2026-05-04 | d5fbf55 | [260505-c9d-stairwell-photo-fix](./quick/260505-c9d-stairwell-photo-fix/) |
| 260505-cib | CCTV / Damper stair 모달도 같은 batch-save 패턴 — CctvModal.handleSave (DVR 13대) + DamperModal.handleStairSave (전실제연댐퍼 stair) 에 동일 정책(caution/bad 우선 → 첫 cp) 적용. coverage sweep 완료. | 2026-05-05 | 509b62a | [260505-cib-cctv-damper-stair](./quick/260505-cib-cctv-damper-stair/) |
| 260508-ibx | DIV/Compressor 점검 사진이 조치 상세에 안 보이던 버그 수정 — onSaveRecord 시그니처에 photoKey 추가해 check_records 에도 저장 + ZONE_LABEL 4곳에 'basement: 지하' 추가 (mig 0081 이후 라벨 누락) | 2026-05-08 | 601602e | [260508-ibx-div-comp-check-records-zone-basement](./quick/260508-ibx-div-comp-check-records-zone-basement/) |
| 260509-3e3 | redesign/01-dashboard 1단계 — DashboardPage 재디자인 v0.1.1 시안 HTML (모바일/데스크톱 × 라이트/다크 4뷰포트, 모든 섹션 1:1 매핑 + loading/error/empty 상태) | 2026-05-09 | 376bcb2 | [260509-3e3-redesign-01-dashboard-sketch](./quick/260509-3e3-redesign-01-dashboard-sketch/) |
| 260509-5xl | redesign/01-dashboard 2단계 — DashboardPage.tsx 시안 기반 v0.1.1 토큰 + Tailwind 교체본 (697→775줄, 인라인 style 10건 화이트리스트만, §6.2 negative rule + §7.1 일관성 정확 적용, 비즈니스 로직 100% 보존) | 2026-05-09 | 2786bf5 | [260509-5xl-redesign-01-dashboard-tsx](./quick/260509-5xl-redesign-01-dashboard-tsx/) |
| 260510-4li | redesign/02-inspection 1차 시안 — InspectionPage 메인 화면(헤더/Zone 탭/카테고리 16종/층 칩/CP 리스트) + 일반 결과 모달 + Revisit/AccessBlocked 팝업 (2312줄, 4뷰포트, §6.3 카테고리 카드 룰 + §7.2 아이콘 매핑 정확 적용). 특수 모달 7종은 2차 시안 별도 진행. | 2026-05-10 | 1f52181 | [260510-4li-redesign-02-inspection-sketch-main](./quick/260510-4li-redesign-02-inspection-sketch-main/) |
| 260510-4x7 | redesign/07-elevator 1차 시안 — ElevatorPage 페이지 컨테이너 + 자체 헤더(6탭+검색+액션) + 호기 그리드(11 EV + 6 ES, 그룹별 카드, 좌측 3px 색바 §6.1) + 에스컬레이터 노선도 + 4 상태 변종(정상/고장/점검중/운행중지) + 검색/빈/스켈레톤 (2013줄, 4뷰포트, §6.1~9 룰 준수). 5 모달 + KOELSA 는 2·3차 별도. | 2026-05-10 | 3e478d8 | [260510-4x7-redesign-07-elevator-1-html-6](./quick/260510-4x7-redesign-07-elevator-1-html-6/) |
| 260510-c2z | redesign/07-elevator 1차 시안 재작성 — list 탭 구조 정정(EvSelector 5그룹/에스컬 노선도 → 코드 실제 구조인 type 4분류 단순 카드) + Option A Lucide 아이콘(ArrowUpDown/Package/UtensilsCrossed/ChevronsUpDown) 적용. 노선도는 모달 전용으로 2차 시안 이동. (2020줄, 4뷰포트, 9/9 verify PASS) | 2026-05-10 | 8bbf504 | [260510-c2z-redesign-07-elevator-1-list-4-type-optio](./quick/260510-c2z-redesign-07-elevator-1-list-4-type-optio/) |
| 260510-b7q | 에스컬레이터 호기 매핑 0056 물리배치에 정렬 — ES_NODES_FAULT/ANNUAL id-label-floor 일치(고장 1·2호기 제외=5,6,3,4 / 수리 전체=5,6,3,4,1,2). 04-07 swap 이후 라벨만 갱신되고 floor↔ID 배치가 방치된 모순 해소 | 2026-05-09 | 050baf0 | [260510-b7q-es-nodes-fault-annual-id-label-floor-005](./quick/260510-b7q-es-nodes-fault-annual-id-label-floor-005/) |
| 260515-3mc | redesign/07-elevator TSX 변환 Wave 1 — list 탭 (ElevatorPage 메인): ElevatorIcon 커스텀 SVG icons.tsx 추가 + TYPE_ICON_COMPONENT 매퍼(passenger=ElevatorIcon/cargo=Package/dumbwaiter=UtensilsCrossed/escalator=MoveDiagonal) + 모바일 자체 헤더(미해결 칩 + 6탭) + list 탭 본문(type 4분류 그룹, 카드 좌측 3px 색바 §6.1, 다음 점검 배지 3상태) + 데스크톱 헤더(고장/수리 CTA §6.4 그라디언트 보존) + 좌측 호기 배치도(evGroups 4그룹 + 에스컬 그리드) v0.1.1 토큰+Tailwind 교체. 5 모달/EvSelector/EsNodeMap/다른 5탭 본문/desktopRightTab/KoelsaHistorySection/RepairListSection 보존(Wave 2+). ElevatorPage 3209→3277줄. 비즈니스 로직 100% 보존, 인라인 금지 키 0건, 9-11px 0건, 이모지 0건, npm build PASS. | 2026-05-15 | 7a3cf32 | [260515-3mc-redesign-07-elevator-tsx-wave-1-list](./quick/260515-3mc-redesign-07-elevator-tsx-wave-1-list/) |
| 260515-4zh | redesign/07-elevator 2차 sketch — EvSelector + EsNodeMap + EsBtn (호기 선택 헬퍼) v0.1.1 시안 HTML. 4 viewport × 2 mode(엘리베이터/에스컬) × 2 variant(FAULT/ANNUAL). 5그룹 호기 그리드 (투명 3 + 오렌지 3 + 기타 2 + 화물 2 + 덤웨이터 1, 동적 컬럼 3/3/2/2/1) + 호기 버튼 3상태 (비선택/선택 accent/고장 fire+Siren) + EsBtn 2상태 통일 (비선택 / 선택 accent — 상행/하행은 ChevronUp/ChevronDown 아이콘으로만 구분, 색 차별 X) + EsNodeMap 4 노선 (B1↔M 제외, FAULT) vs 6 노선 (M층 포함, ANNUAL). §6.1 색 의미 단순화: fire=호기고장 / accent=선택(엘리베이터·EsBtn 공통). 호기 ID(EV-NN/ES-NN) 본문 노출 0건 — "N호기" 라벨만. Empty state 신규 디자인. 1546줄, 13/13 verify PASS, 이모지 0건 / 인라인 0건 / 9-11px 0건. 코드 변경 0건. 1차 리뷰 fix 83e0c1f 반영 (54 라벨 치환 + 색 통일). EsBtn fill 통일 fix 80baa1c 반영 (.es-btn-selected = .ev-btn-selected 와 동일한 accent fill — 내부 채움 + text-on-accent). 2B/2C/2D 모달 sketch 별도 quick. | 2026-05-15 | 80baa1c | [260515-4zh-redesign-07-elevator-2-sketch-evselector](./quick/260515-4zh-redesign-07-elevator-2-sketch-evselector/) |
| 260515-bgg | redesign/07-elevator 2B sketch — Fault 흐름 3 모달 (FaultNewModal 모바일 / FaultNewFullscreen 데스크톱 풀스크린 / FaultResolveModal) v0.1.1 시안 HTML. 4 viewport: VP1 모바일다크-FaultNew(1호기 선택, 승객 ON, fire 그라디언트 CTA 활성) / VP2 모바일라이트-FaultResolve(완료 입력) / VP3 데스크톱다크-Fullscreen(7호기, 자체 헤더 AlertTriangle+TKE 부제) / VP4 데스크톱라이트-FaultResolve(5호기 escalator MoveDiagonal, CTA 비활성 opacity 0.5). EvSelector 임베드 = 2A 시각 (호기 라벨 N호기, accent fill, ChevronUp/Down 방향). §6.1 색 분리: fire=호기고장 / danger=승객 즉시 위험 / accent=선택+수리완료 CTA. 이모지 0건 (🚨→AlertTriangle/Siren, ✕→X, TYPE_ICON→매퍼). 1541줄, 12/12 verify PASS, EV-/ES- 본문 0건 / 인라인 0건. 코드 변경 0건. 2C(Inspect)/2D(Repair/EvDetail) 별도 quick. | 2026-05-15 | 7a8afd2 | [260515-bgg-redesign-07-elevator-3-sketch-fault-faul](./quick/260515-bgg-redesign-07-elevator-3-sketch-fault-faul/) |
| 260515-g61 | redesign/07-elevator 2C sketch — 입력 모달 2종 (InspectModal 점검 기록 입력 / RepairNewModal 수리 기록 입력+수정) v0.1.1 시안 HTML. 4 viewport: VP1 모바일다크-Inspect(엘베 1호기, 도어 불량, overall=bad danger, 조치+층 입력, accent CTA) / VP2 모바일라이트-Repair(엘베 1호기, 수리대상 홀+1F warning, 4단계 사진, CTA 활성) / VP3 데스크톱다크-Inspect(에스컬 5호기, 점검 모두 정상, overall=safe) / VP4 데스크톱라이트-Repair edit(에스컬 5호기, 수리대상 토글 숨김, CTA 비활성 opacity 0.5). 컴포넌트 카탈로그: 점검 토글 2상태(정상 safe/불량 danger) + 종합 결과 3변종(safe/warning/danger) + 수리 대상 4옵션(카/홀/기계실/피트 — warning 통일) + 홀 층 칩 + 4단계 사진 라벨. **§6.1 색 의미 단계화 확장: accent=호기선택+CTA / warning=수리 부위 작업 / safe=점검 정상 / danger=점검 불량 / fire=호기 고장(본 sketch 미사용)**. EvSelector 임베드 = 2A 시각 (N호기 라벨, accent fill). 1991줄, 13/13 verify PASS, EV-/ES- 본문 0건 / 인라인 0건 / 9-11px 0건 / 이모지 0건. 코드 변경 0건. 2D(EvDetailModal) / 3차(KOELSA) 별도 quick. | 2026-05-15 | 27b20e6 | [260515-g61-redesign-07-elevator-2c-sketch-inspectmo](./quick/260515-g61-redesign-07-elevator-2c-sketch-inspectmo/) |

### Blockers/Concerns

- Phase 20: R2 presigned URL 발급 방식 — Workers에서 AWS SigV4 서명 직접 구현 vs `aws4fetch` 등 경량 라이브러리 사용 검토 필요
- Phase 20: 업로드 완료 confirm API 흐름 — presigned PUT 성공 후 클라이언트가 metadata commit API 호출하는 2단계 vs Workers가 R2 binding으로 검증하는 단일 단계 검토
- Phase 22: 기존 업무수행기록표 양식 파일(.xlsx) 위치 및 셀 매핑 사양 확보 필요 — 작성자 요청

## Session Continuity

Last session: 2026-04-29T18:00:38.408Z
Stopped at: Phase 24 UI-SPEC approved
Resume file: .planning/phases/24-extinguisher-asset-location/24-UI-SPEC.md

---
*State initialized: 2026-03-28*
*Milestone v1.1 shipped: 2026-04-05*
*Milestone v1.2 shipped: 2026-04-06*
*Milestone v1.3 shipped: 2026-04-08*
*Milestone v1.4 roadmap created: 2026-04-08*
| 2026-04-20 | fast | 직원관리 직급순 정렬 | ✅ |
| 2026-04-29 | fast | PhotoSourceModal 취소 버튼이 BottomNav에 가려지지 않게 padding-bottom 보강 (35a498e) | ✅ |
