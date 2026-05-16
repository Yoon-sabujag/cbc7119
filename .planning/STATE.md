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

Last activity: 2026-05-16 - **redesign/03-qr-scan sketch (QR 스캔 페이지)**: qr-scan-sketch.html 1507줄, 6 viewport. 2 stage (Scan / Manual) + 카메라 에러 + cpError + loading + Spinner 카탈로그. 이모지 3종 → lucide (📷→Camera, 🔍→ScanLine, Spinner→Loader2). primary 그라디언트 → bg-accent 단색 채택 (3C 일관). verify gate A~G 7/7 PASS. 코드 변경 0건. 다음: 사용자 검수 → TSX 변환 (별도 quick).

Previous: 2026-05-16 - **redesign/07-elevator TSX Wave 11 — 옵션 B 3C 변환 (안전관리자 탭)**: safety-mgr-sketch.html (cf538a3) 1:1 매핑. ElevatorPage.tsx `tab === 'safety'` IIFE 블록 +63/-44 (3463→3482). 3 정보 카드(프로필/교육/등록) v0.1.1 토큰 + Tailwind + lucide. ddayClass 헬퍼 신설 ({text, bg} className 객체 4 분기). lucide 신규 3종(User/BookOpen/Building2) + 재사용 4종(ElevatorIcon/MoveDiagonal/CheckCircle2/X). 비즈니스 로직 100% 보존 (fmtDday 분기 키워드/safetyMgrQuery/data 필드). 변환 영역 var() 0 / 9·10·11px 0 / 이모지 0 / 인라인 style 0 (Tailwind arbitrary grid-cols-[repeat(4,1fr)_6px_repeat(2,1fr)] 채택). tsc 0 / npm build PASS. Wave 1~10 + 다른 컴포넌트 보존. **→ 옵션 B 시리즈 완결 (Wave 9 3A + Wave 10 3B + Wave 11 3C, 5탭 본문 모두 v0.1.1 변환).** 사용자 검수 → main 머지 → 배포.

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
| 260510-b7q | 에스컬레이터 호기 매핑 0056 물리배치에 정렬 — ES_NODES_FAULT/ANNUAL id-label-floor 일치(고장 1·2호기 제외=5,6,3,4 / 수리 전체=5,6,3,4,1,2). 04-07 swap 이후 라벨만 갱신되고 floor↔ID 배치가 방치된 모순 해소 | 2026-05-09 | 050baf0 | [260510-b7q-es-nodes-fault-annual-id-label-floor-005](./quick/260510-b7q-es-nodes-fault-annual-id-label-floor-005/) |
| 260510-4li | redesign/02-inspection 1차 시안 — InspectionPage 메인 화면(헤더/Zone 탭/카테고리 16종/층 칩/CP 리스트) + 일반 결과 모달 + Revisit/AccessBlocked 팝업 (2312줄, 4뷰포트, §6.3 카테고리 카드 룰 + §7.2 아이콘 매핑 정확 적용). 특수 모달 7종은 2차 시안 별도 진행. | 2026-05-10 | 1f52181 | [260510-4li-redesign-02-inspection-sketch-main](./quick/260510-4li-redesign-02-inspection-sketch-main/) |
| 260510-4x7 | redesign/07-elevator 1차 시안 — ElevatorPage 페이지 컨테이너 + 자체 헤더(6탭+검색+액션) + 호기 그리드(11 EV + 6 ES, 그룹별 카드, 좌측 3px 색바 §6.1) + 에스컬레이터 노선도 + 4 상태 변종(정상/고장/점검중/운행중지) + 검색/빈/스켈레톤 (2013줄, 4뷰포트, §6.1~9 룰 준수). 5 모달 + KOELSA 는 2·3차 별도. | 2026-05-10 | 3e478d8 | [260510-4x7-redesign-07-elevator-1-html-6](./quick/260510-4x7-redesign-07-elevator-1-html-6/) |
| 260510-c2z | redesign/07-elevator 1차 시안 재작성 — list 탭 구조 정정(EvSelector 5그룹/에스컬 노선도 → 코드 실제 구조인 type 4분류 단순 카드) + Option A Lucide 아이콘(ArrowUpDown/Package/UtensilsCrossed/ChevronsUpDown) 적용. 노선도는 모달 전용으로 2차 시안 이동. (2020줄, 4뷰포트, 9/9 verify PASS) | 2026-05-10 | 8bbf504 | [260510-c2z-redesign-07-elevator-1-list-4-type-optio](./quick/260510-c2z-redesign-07-elevator-1-list-4-type-optio/) |
| 260510-b7q | 에스컬레이터 호기 매핑 0056 물리배치에 정렬 — ES_NODES_FAULT/ANNUAL id-label-floor 일치(고장 1·2호기 제외=5,6,3,4 / 수리 전체=5,6,3,4,1,2). 04-07 swap 이후 라벨만 갱신되고 floor↔ID 배치가 방치된 모순 해소 | 2026-05-09 | 050baf0 | [260510-b7q-es-nodes-fault-annual-id-label-floor-005](./quick/260510-b7q-es-nodes-fault-annual-id-label-floor-005/) |
| 260513-czc | ElevatorPage next-inspection 기능 통째 제거 (의도하지 않았던 D-N/검사 초과/기록 없음 배지 + GET /api/elevators/next-inspection 핸들러 + 타입 + map) — 4 파일 +2/-131, DB 컬럼 elevators.next_inspection 은 죽은 컬럼이라 그대로 둠. production 배포 | 2026-05-13 | c377e4b | [260513-czc-elevatorpage-next-inspection-d-n-api](./quick/260513-czc-elevatorpage-next-inspection-d-n-api/) |
| 260514-i4r | redesign/02-inspection 2단계 Wave 1 — InspectionPage.tsx 시안 기반 v0.1.1 토큰 + Tailwind 교체본 (5346→5559줄, +711/-498). 메인 page render + 일반 InspectionModal 셸 + 5 보조 컴포넌트(WheelPicker / Resolution* / PhotoViewer / FireAlarmModal / InspectionSummaryCard / DesktopInspectionView) §6.1~7.3 룰 정확 적용. 5 특수 모달 본문(Stairwell/Cctv/Baeyeon/Div+Compressor/PowerPanel/ParkingGate/Damper) + InspectionModal 내부 5 증상 피커 JSX 는 WAVE2-PRESERVE 마커로 보존(Wave 2~6 별도). 비즈니스 로직 100% 보존, tsc/build 통과. Task 4(사용자 시각 검증) 대기. | 2026-05-14 | 400a865 | [260514-i4r-redesign-02-inspection-tsx](./quick/260514-i4r-redesign-02-inspection-tsx/) |
| 260514-pnr | Wave 1 fix — InspectionPage.tsx 외부 컴포넌트 3종(PhotoButton/InspectionRevisitPopup/AccessBlockedPopup) lucide 아이콘 + v0.1.1 토큰 통일 (3 파일 +22/-15). 📷→Camera, ⚠️→CheckCircle2/Flame (variant 분기), 🚫→ShieldAlert. 옛 토큰(--bg2/--bd/--acl/--t1~3/--danger) → v0.1.1 (--surface-raised/--border-default/--accent/--text-primary~tertiary/--status-danger). AccessBlockedPopup 은 FloorPlanPage 도 공유 — 동일 시각 자동 적용(컨펌됨). 후속 fix: 색 정합 (조치대기=fire, 접근불가=danger), a11y role=alertdialog, R2 deploy race chunk hash 강제 변경. i4r Task 4 시각 검증에서 사용자 발견 → fix. | 2026-05-14 | 8d59adf | [260514-pnr-wave-1-fix-photobutton-revisitpopup-acce](./quick/260514-pnr-wave-1-fix-photobutton-revisitpopup-acce/) |
| 260514-sp7 | redesign/02-inspection TSX Wave 2 — 증상 피커 5종 (유도등/소화기/소화전/방화셔터/전실제연댐퍼) v0.1.1 토큰 + Tailwind 변환 (InspectionPage.tsx +80/-57). WAVE2-PRESERVE-START/END 마커 제거(Wave 2 완료 시그널). flex flex-wrap gap-1.5 + button flex-1 basis-0 + inactive(border-default/surface-raised/text-secondary) / active(accent border + tinted bg + text-accent). fontSize 10/11 → text-label(13px) 노안 친화. 비즈니스 로직 100% 보존(5 detection 분기 / 5 setter / 5 옵션 라벨 / '직접 입력' memo 분기). tsc 0 / build 통과. | 2026-05-14 | 3aad9bd | [260514-sp7-redesign-02-inspection-tsx-wave-2-5](./quick/260514-sp7-redesign-02-inspection-tsx-wave-2-5/) |
| 260514-tbj | redesign/02-inspection TSX Wave 4 — BaeyeonModal(+81/-54) + DamperModal(+228/-134) v0.1.1 토큰 + Tailwind 변환 + **댐퍼 증상 피커 신설** (자동화 5종 카테고리 룰 완성 — 유도등/소화기/소화전/방화셔터/전실제연댐퍼 모두 활성) + InspectionModal dead code 4곳 청소. 후속 fix: stair 모드 피커 추가 / 연결송수관 피커 제거(별개 설비). InspectionPage.tsx 5582→5703줄(+309/-188). tsc/build 통과. cbc7119 디자인 리포 한정. | 2026-05-14 | 6232e65 | [260514-tbj-redesign-02-inspection-tsx-wave-4](./quick/260514-tbj-redesign-02-inspection-tsx-wave-4/) |
| 260515-0l7 | redesign/02-inspection TSX Wave 3 — DIV/컴프 모달 (DivUnderPicker + DivTrendSubview + DivModal + CompressorModal) v0.1.1 토큰 + Tailwind 변환, InspectionPage.tsx 5716→5872줄 (+333/-177, 변환 영역 ~1246줄). doubleCycle 1주차/2주차 입력 / DIV·컴프 짝꿍 매핑 (DIV_PT_CP↔COMP_PT_CP) / detectDivTrend p1+p2 호출 / autoReason 자동 판단 / mode='from-div' overlay 9분기 / showTrend overlay / 사진 흐름(260508-ibx) / fetch API / KST timestamp 한 줄도 변경 없음. **증상 피커 미도입** (DIV/컴프는 자동화 5종 카테고리 아님 — 메모리 룰). dead code 청소: resultColor/resultLabel 헬퍼 §7.1 inline 분기로 대체. lucide TrendingUp/X/ChevronRight/Flame 추가. tsc 0 / build 통과. cbc7119 디자인 리포 한정. | 2026-05-15 | 5e95414 | [260515-0l7-redesign-02-inspection-tsx-wave-3-div](./quick/260515-0l7-redesign-02-inspection-tsx-wave-3-div/) |
| 260515-1p0 | redesign/02-inspection TSX Wave 5 — StairwellModal (특별피난계단, 5 계단실 일괄 입력 좌/우 2열) + CctvModal (DVR 13대 일괄 좌7/우6) v0.1.1 토큰 + Tailwind 변환. InspectionPage.tsx 5872→5937줄 (+168/-103). **260505-cib photoKey 1건 대표 부여 룰** (caution/bad 우선 → 첫 cp/층) handleSave 한 줄도 변경 없음 — 전층/전 DVR 중복 저장 버그 재발 방지. 증상 피커 미도입 (자동화 5종 아님). lucide StairsIcon/Video/Server 통일. tsc 0 / build 통과. cbc7119 디자인 리포 한정. | 2026-05-15 | 809964f | [260515-1p0-redesign-02-inspection-tsx-wave-5-cctv](./quick/260515-1p0-redesign-02-inspection-tsx-wave-5-cctv/) |
| 260515-2r5 | **redesign/02-inspection TSX Wave 6 (마지막)** — PowerPanelModal (소방용전원공급반 PP-X-Y) + ParkingGateModal (주차장비/회전문 — 북문/남문) v0.1.1 토큰 + Tailwind 변환. InspectionPage.tsx 5937→6024줄 (+183/-96). EXCEL-02 자탐 매핑 데이터 흐름 한 줄도 변경 없음 (메모리 룰). loc-card 좌우 스와이프 / useInspectionRevisitPopup category 분기 보존. 증상 피커 미도입 (자동화 5종 아님). lucide Zap/Car/ChevronLeft·Right/CheckCircle2/AlertTriangle/XCircle 재사용 (신규 import 0건). tsc 0 / build 통과. cbc7119 디자인 리포 한정. **→ Wave 1~6 모든 모달 v0.1.1 정합 = InspectionPage TSX 전 변환 완료.** | 2026-05-15 | 8cae633 | [260515-2r5-redesign-02-inspection-tsx-wave-6-powerp](./quick/260515-2r5-redesign-02-inspection-tsx-wave-6-powerp/) |
| 260515-3mc | redesign/07-elevator TSX 변환 Wave 1 — list 탭 (ElevatorPage 메인): ElevatorIcon 커스텀 SVG icons.tsx 추가 + TYPE_ICON_COMPONENT 매퍼(passenger=ElevatorIcon/cargo=Package/dumbwaiter=UtensilsCrossed/escalator=MoveDiagonal) + 모바일 자체 헤더(미해결 칩 + 6탭) + list 탭 본문(type 4분류 그룹, 카드 좌측 3px 색바 §6.1, 다음 점검 배지 3상태) + 데스크톱 헤더(고장/수리 CTA §6.4 그라디언트 보존) + 좌측 호기 배치도(evGroups 4그룹 + 에스컬 그리드) v0.1.1 토큰+Tailwind 교체. 5 모달/EvSelector/EsNodeMap/다른 5탭 본문/desktopRightTab/KoelsaHistorySection/RepairListSection 보존(Wave 2+). ElevatorPage 3209→3277줄. 비즈니스 로직 100% 보존, 인라인 금지 키 0건, 9-11px 0건, 이모지 0건, npm build PASS. | 2026-05-15 | 7a3cf32 | [260515-3mc-redesign-07-elevator-tsx-wave-1-list](./quick/260515-3mc-redesign-07-elevator-tsx-wave-1-list/) |
| 260515-4zh | redesign/07-elevator 2차 sketch — EvSelector + EsNodeMap + EsBtn (호기 선택 헬퍼) v0.1.1 시안 HTML. 4 viewport × 2 mode(엘리베이터/에스컬) × 2 variant(FAULT/ANNUAL). 5그룹 호기 그리드 (투명 3 + 오렌지 3 + 기타 2 + 화물 2 + 덤웨이터 1, 동적 컬럼 3/3/2/2/1) + 호기 버튼 3상태 (비선택/선택 accent/고장 fire+Siren) + EsBtn 2상태 통일 (비선택 / 선택 accent — 상행/하행은 ChevronUp/ChevronDown 아이콘으로만 구분, 색 차별 X) + EsNodeMap 4 노선 (B1↔M 제외, FAULT) vs 6 노선 (M층 포함, ANNUAL). §6.1 색 의미 단순화: fire=호기고장 / accent=선택(엘리베이터·EsBtn 공통). 호기 ID(EV-NN/ES-NN) 본문 노출 0건 — "N호기" 라벨만. Empty state 신규 디자인. 1546줄, 13/13 verify PASS, 이모지 0건 / 인라인 0건 / 9-11px 0건. 코드 변경 0건. 1차 리뷰 fix 83e0c1f 반영 (54 라벨 치환 + 색 통일). EsBtn fill 통일 fix 80baa1c 반영 (.es-btn-selected = .ev-btn-selected 와 동일한 accent fill — 내부 채움 + text-on-accent). 2B/2C/2D 모달 sketch 별도 quick. | 2026-05-15 | 80baa1c | [260515-4zh-redesign-07-elevator-2-sketch-evselector](./quick/260515-4zh-redesign-07-elevator-2-sketch-evselector/) |
| 260515-bgg | redesign/07-elevator 2B sketch — Fault 흐름 3 모달 (FaultNewModal 모바일 / FaultNewFullscreen 데스크톱 풀스크린 / FaultResolveModal) v0.1.1 시안 HTML. 4 viewport: VP1 모바일다크-FaultNew(1호기 선택, 승객 ON, fire 그라디언트 CTA 활성) / VP2 모바일라이트-FaultResolve(완료 입력) / VP3 데스크톱다크-Fullscreen(7호기, 자체 헤더 AlertTriangle+TKE 부제) / VP4 데스크톱라이트-FaultResolve(5호기 escalator MoveDiagonal, CTA 비활성 opacity 0.5). EvSelector 임베드 = 2A 시각 (호기 라벨 N호기, accent fill, ChevronUp/Down 방향). §6.1 색 분리: fire=호기고장 / danger=승객 즉시 위험 / accent=선택+수리완료 CTA. 이모지 0건 (🚨→AlertTriangle/Siren, ✕→X, TYPE_ICON→매퍼). 1541줄, 12/12 verify PASS, EV-/ES- 본문 0건 / 인라인 0건. 코드 변경 0건. 2C(Inspect)/2D(Repair/EvDetail) 별도 quick. | 2026-05-15 | 7a8afd2 | [260515-bgg-redesign-07-elevator-3-sketch-fault-faul](./quick/260515-bgg-redesign-07-elevator-3-sketch-fault-faul/) |
| 260515-g61 | redesign/07-elevator 2C sketch — **RepairNewModal 만 valid** (InspectModal 시안은 사후 검증 결과 dead code — `setModal('inspect_new')` 호출처 0건, 점검 기록 탭은 API 자동 표시). 4 viewport: ~~VP1 모바일다크-Inspect~~ (legacy) / VP2 모바일라이트-Repair(엘베 1호기, 수리대상 홀+1F warning, 4단계 사진, CTA 활성) / ~~VP3 데스크톱다크-Inspect~~ (legacy) / VP4 데스크톱라이트-Repair edit(에스컬 5호기, 수리대상 토글 숨김, CTA 비활성 opacity 0.5). 컴포넌트 카탈로그: 수리 대상 4옵션(카/홀/기계실/피트 — warning 통일) + 홀 층 칩 + 4단계 사진 라벨. **§6.1 색 의미 — RepairNewModal 한정 결정: accent=호기선택+CTA / warning=수리 부위 작업 / fire=호기 고장(미사용 본 sketch)**. 점검 토글 safe/danger 결정은 본 페이지 미적용 (API 자동). EvSelector 임베드 = 2A 시각 (N호기 라벨, accent fill). 1991줄, 13/13 verify PASS. Wave 2+ TSX cleanup 후보: InspectModal 함수+'inspect_new' Modal type+submitInspect mutation 제거. 코드 변경 0건. 2D(EvDetailModal) / API 자동 탭 본문 sketch 별도 quick. | 2026-05-15 | 27b20e6 | [260515-g61-redesign-07-elevator-2c-sketch-inspectmo](./quick/260515-g61-redesign-07-elevator-2c-sketch-inspectmo/) |
| 260515-hbv | redesign/07-elevator 2D sketch — EvDetailModal (호기 상세, 카드 클릭 진입) v0.1.1 시안 HTML. 6 영역 시각화: 헤더(N호기 + 위치 + lucide X) / 기간 선택(1/3/6/12개월 칩, accent fill, 기본 3개월) / ElevatorInfoCard placeholder / 층별 누적 이력(엘베만 — 고장 N회 danger + 조치지적 N회 warning + 상태 아이콘 AlertOctagon|AlertTriangle|CheckCircle2) / 점검항목 필터(엘베만, 6옵션 chips) / 이력 5탭(전체/고장/수리/점검/검사 — accent fill). 4 viewport: VP1 모바일다크 1호기 3개월 / VP2 모바일라이트 4호기 고장 탭 / VP3 데스크톱다크 11호기 덤웨이터 검사 탭 + KIND_STYLE 카탈로그 / VP4 데스크톱라이트 5호기 에스컬(점검필터·층별 통계 숨김 variant). **§6.1 KIND_STYLE 색 결정 (사용자 검토 대기): fault=fire(주황, 호기 고장 의미 list와 통일) / repair=safe(녹) / inspect=info(파, accent 다른 톤) / annual=text-secondary 회색(분류만, 의미색 X — warning 토큰 충돌 회피)**. §6.1 7색 단계화 완성 (fire/danger/warning/safe/info/accent/회색). 호기 아이콘 매퍼 = 2A 동일 (ElevatorIcon/Package/UtensilsCrossed/MoveDiagonal). 1799줄, 12/12 verify PASS, EV-/ES- 본문 0건 / 인라인 0건 / 9-11px 0건 / 이모지 0건. 코드 변경 0건. 사용자 입력 모달 시리즈 (2B/2C/2D) 완결. 다음: API 자동 탭 본문 sketch (점검기록/검사기록/안전관리자/고장리스트/수리리스트) 또는 Wave 2 TSX 변환 시작. | 2026-05-15 | 477225e | [260515-hbv-redesign-07-elevator-2d-sketch-evdetailm](./quick/260515-hbv-redesign-07-elevator-2d-sketch-evdetailm/) |
| 260515-ia6 | redesign/07-elevator TSX Wave 2 — **EvSelector + EsBtn + EsNodeMap 헬퍼 3종** v0.1.1 토큰 + Tailwind 변환 (라인 1894~2008). 2A 시안 (260515-4zh) 1:1 매핑 source. EsBtn: 색 통일 (accent fill — 비선택 surface-sunken / 선택 .ev-btn-selected accent fill), 방향(상행/하행) = ChevronUp/ChevronDown lucide 만으로 구분 (색 차별 X). EsNodeMap: 컨테이너 bg-surface-sunken + 가운데 1px border-default + 층 레이블 토큰화. EvSelector: 종류 토글 (엘리베이터=ElevatorIcon 커스텀 / 에스컬=MoveDiagonal lucide) + 5그룹 호기 그리드 (gridTemplateColumns 동적값 화이트리스트) + 호기 버튼 3상태 (비선택/선택 accent/고장 fire-bg+AlertTriangle). 사용처 4 모달 (FaultNew/Fullscreen/InspectModal/RepairNewModal) EvSelector 호출 한 줄도 변경 없음 — 비즈니스 로직 100% 보존. lucide ChevronUp/ChevronDown 신규 import (다른 import 재사용). icons.tsx / tailwind.config.js / 다른 컴포넌트 수정 0건. 변환 영역 인라인 금지 키 0건 / 9-11px 0건 / 이모지 0건 / 옛 토큰 0건. tsc 0 / npm build PASS (ElevatorPage-BZgp9YDW.js chunk). 다음 wave: Fault 모달 3종 (2B sketch 권위, Wave 3). InspectModal cleanup 별도 wave. | 2026-05-15 | 36bd57f | [260515-ia6-redesign-07-elevator-tsx-wave-2-evselect](./quick/260515-ia6-redesign-07-elevator-tsx-wave-2-evselect/) |
| 260515-iz1 | redesign/07-elevator TSX Wave 3 — **Fault 모달 3종** (FaultNewModal 모바일 + FaultNewFullscreen 데스크톱 풀스크린 + FaultResolveModal) v0.1.1 토큰 + Tailwind 변환 (라인 2022~2255). 2B 시안 (260515-bgg) 1:1 매핑 source. **FaultNewModal**: 승객 탑승 토글 활성 시 bg-danger-bg + AlertTriangle (이모지 🚨 제거) / CTA fire 그라디언트 (§6.4 예외, TKE_TEL 자동 다이얼 보존). **FaultNewFullscreen**: 자체 헤더 (AlertTriangle 아이콘 박스 + 부제 + lucide X 닫기) / 풀스크린 화이트리스트 (position/zIndex/paddingTop+safe-area var(--sat)) / CTA 이모지 🚨 본문 제거. **FaultResolveModal**: 고장 정보 카드 TYPE_ICON_COMPONENT 매퍼 사용 (Wave 1 재사용) / CTA accent 단색. lucide X 신규 import (1건만 추가, AlertTriangle 등 Wave 1+2 재사용). 비즈니스 로직 100% 보존 (state/handlers/floorPart/passPart 정규식/submitFault.mutate/resolveFault.mutate). ModalWrap/Field/MultiPhotoUpload/EvSelector 컴포넌트 본체 + 5 모달 사용처 호출 수정 0건. icons.tsx/tailwind.config.js/다른 컴포넌트 수정 0건. 변환 영역 인라인 금지 키 0건 + 9-11px 0건 + 이모지 0건 + 옛 토큰 0건. tsc 0 / npm build PASS. 다음 wave: RepairNewModal (2C 시안, Wave 4). InspectModal cleanup 별도. | 2026-05-15 | 8752e81 | [260515-iz1-redesign-07-elevator-tsx-wave-3-fault-3-](./quick/260515-iz1-redesign-07-elevator-tsx-wave-3-fault-3-/) |
| 260515-jp3 | redesign/07-elevator TSX Wave 4 — **RepairNewModal** v0.1.1 토큰 + Tailwind 변환 (라인 3082~3236). 2C 시안 (260515-g61) 1:1 매핑 source (InspectModal viewport legacy, RepairNewModal valid 만). **수리 대상 4옵션** (카/홀/기계실/피트, 엘리베이터만) + **홀 층 칩** = warning 토큰 (bg-warning-bg + outline-warning + text-warning — 옛 yellow `#eab308` 직접색 제거). 에스컬레이터 시 수리 대상 영역 숨김 (`!isEscalator &&`) 보존. **CTA**: `primaryBtnSt` 그라디언트 → `bg-accent` 단색 + `style={{ opacity }}` 화이트리스트. **edit 모드 정정**: CTA 라벨 "수리 기록 저장" → "수정 완료" (시안 권위, 헤더 "수리 기록 수정" 과 일관). **4 단계 사진 라벨** 보존 (부품 입고/파손 부품/수리 중/수리 완료, MultiPhotoUpload props 시그니처 그대로). 11px → text-label(13px) 노안 룰. 비즈니스 로직 100% 보존 (state 13 / handleSubmit / canSubmit / isEscalator useEffect / elevatorRepairApi.create-update / qc.invalidateQueries / toast). props (elevators/selected/onClose/editData) 시그니처 보존. ModalWrap/Field/MultiPhotoUpload/EvSelector/EsBtn/EsNodeMap/Fault 3 모달/InspectModal/EvDetailModal/icons.tsx/tailwind.config.js 한 줄도 수정 X. inputSt/primaryBtnSt 글로벌 상수 본체 보존 (InspectModal Wave 6 cleanup 까지). 변환 영역 인라인 금지 키 0건 (opacity 화이트리스트) / 9-11px 0건 / 이모지 0건 / 옛 토큰 0건 / #eab308 0건. tsc 0 / npm build PASS. 다음 wave: EvDetailModal (2D 시안 KIND_STYLE, Wave 5). InspectModal cleanup 별도 Wave 6. | 2026-05-15 | 4d9e26a | [260515-jp3-redesign-07-elevator-tsx-wave-4-repairne](./quick/260515-jp3-redesign-07-elevator-tsx-wave-4-repairne/) |
| 260515-k5p | redesign/07-elevator TSX Wave 5 — **EvDetailModal** v0.1.1 토큰 + Tailwind 변환 (라인 1696~1958, +136/-71). 2D 시안 (260515-hbv) 1:1 매핑 source. **KIND_STYLE 재설계**: `{color, icon}` → `{textCls, barCls, Icon: React.ComponentType}` (이모지 완전 제거, Tailwind className enum 적용, PurgeCSS 안전). **색 결정 확정 (2D 권위)**: fault=text-fire+bg-fire-bar+AlertOctagon / repair=text-safe+bg-safe-bar+Wrench / inspect=text-info+bg-info-bar+ClipboardCheck / annual=text-text-tertiary+bg-text-tertiary+FileSearch. **헤더**: TYPE_ICON_COMPONENT 매퍼 (Wave 1 재사용) + lucide X. **기간/점검필터/이력탭 3 영역**: .ev-btn-selected 패턴 통일 (bg-accent + text-on-accent 선택 / bg-surface-sunken + text-text-tertiary 비선택). **층별 누적 이력 legend+row**: 미해결=AlertOctagon+text-fire / 이력있음=AlertTriangle+text-warning / 이상없음=CheckCircle2+text-safe (이모지 🔴⚠️✅ 제거). **이력 카드 좌측 3px 색바**: borderLeft 동적 인라인 → `<span absolute className barCls>` 정적 (PurgeCSS 안전). **빈 상태**: 이력=FileSearch / 층별=CheckCircle2. **lucide 신규 4종**: AlertOctagon / ClipboardCheck / FileSearch / CheckCircle2 (Wrench 등 다른 lucide 는 Wave 1~4 재사용). 비즈니스 로직 100% 보존 (state 3종 periodIdx/checkFilter/histTab / body scroll lock useEffect / 데이터 fetch / filtered/floorStats 계산 / isDesktop 분기 / HISTORY_TABS/PERIOD_OPTIONS/CHECK_ITEM_LABELS 상수). props (ev/onClose) 시그니처 보존. ElevatorInfoCard 호출 한 줄도 변경 X. ModalWrap/Field/MultiPhotoUpload/EvSelector/EsBtn/EsNodeMap/Fault 3 모달/RepairNewModal/InspectModal/icons.tsx/tailwind.config.js 한 줄도 수정 X. 변환 영역 인라인 금지 키 0건 (화이트리스트: position/inset/zIndex/transform/maxHeight/boxShadow/WebkitOverflowScrolling/overscrollBehavior) / 9-11px 0건 / 이모지 0건 / 옛 토큰 0건. tsc 0 / npm build PASS (ElevatorPage-CIO-v4sb.js chunk). 다음 wave: InspectModal cleanup (dead code + inputSt/primaryBtnSt 글로벌 상수 정리, Wave 6 최종). | 2026-05-15 | ef16be2 | [260515-k5p-redesign-07-elevator-tsx-wave-5-evdetail](./quick/260515-k5p-redesign-07-elevator-tsx-wave-5-evdetail/) |
| 260515-kr9 | **redesign/07-elevator TSX Wave 6 (마지막)** — InspectModal dead code cleanup + primaryBtnSt 글로벌 상수 제거. 사용자 권위 확인 (2C SUMMARY 정정): InspectModal 호출처 0건 (`setModal('inspect_new')` 진입점 없음), 점검 기록 탭은 API 자동. **5 제거 항목**: (1) InspectModal 함수 정의 (line 2365~ ~95줄) (2) `type Modal` 의 `'inspect_new'` 멤버 (3) `<InspectModal>` JSX 분기 (line 1670) (4) submitInspect useMutation (line 483~) (5) primaryBtnSt 글로벌 상수 정의 — 다른 사용처 0건 (Wave 4 RepairNewModal 변환으로 인라인 교체됨). **보존 항목**: inputSt 글로벌 상수 (RepairListSection 3건 사용 중 — line 2975/2980/2984), 다른 Modal type union 멤버 (fault_new/fault_resolve/repair_new/ev_detail), Wave 1~5 변환 결과, ModalWrap/Field/MultiPhotoUpload/EsBtn/EsNodeMap/icons.tsx/tailwind.config.js. ElevatorPage 3421 → 3290줄 (-131줄). bundle 100.29 kB → 95.82 kB (-4.47 kB). 12 sentinel 함수 (EvDetailModal/EvSelector/FaultNew/Fullscreen/Resolve/RepairNew/EsBtn/EsNodeMap/ModalWrap/Field/RepairListSection/ElevatorInfoCard) 모두 보존. TypeScript 0 / npm build PASS. **→ ElevatorPage TSX 변환 시리즈 완결 (Wave 1~6).** 사용자 입력 모달 (Fault/Repair) 시각 검토 후 main 머지 + 배포. | 2026-05-15 | 87cacf1 | [260515-kr9-redesign-07-elevator-tsx-wave-6-inspectm](./quick/260515-kr9-redesign-07-elevator-tsx-wave-6-inspectm/) |
| 260516-k2u | **redesign/03-qr-scan sketch** — qr-scan-sketch.html (1507줄) v0.1.1 시안. QR 스캔 페이지 첫 sketch (이전엔 03-qr-scan/sketch/ 디렉토리 없음). 6 viewport 시각화. **2 stage**: (A) Scan — QR reader 320px max 1:1 black + 240×240 코너 4 마커 가이드 `.qr-corner-frame/.tl/.tr/.bl/.br` (인라인 회피) + 로딩 overlay + 안내문 + cpError danger 카드. (B) Manual — 큰 `<ScanLine size=40 />` (🔍 제거) + label + input + primary 버튼. **상태/카탈로그**: 카메라 에러 카드 `<Camera size=28 />` (📷 제거) + 다시 시도/수동 입력 2 버튼 / cpError "QR 코드를 찾을 수 없습니다.\n(QR-3F-OFF-001)" / loading overlay / primary 활성·비활성·loading 3 variant + ghost · accent ghost / Loader2 size 4 단계(16/20/24/28) / 9개 변환 룰 박스 (TSX 가이드). **이모지 → lucide 3종**: 📷→Camera, 🔍→ScanLine (QR 컨텍스트), Spinner CSS keyframes→Loader2 animate-spin. **색 통일**: rgba(239,68,68,*)→bg-danger-bg + border-danger-bar/40 + text-danger / 헤더 토글 var(--t2/acl)→text-text-secondary·text-accent / primary 그라디언트→bg-accent text-on-accent **단색 채택** (3C 일관, 옛 그라디언트 폐기). **verify gate A~G 7/7 PASS** (라인 1507 / 9·10·11px 0 / inline style 0 / [data-theme] 13 ≥4 / 옛 토큰(--bg2/bd/bd2/t1/t2/t3/bg3/acl) 0 / 본문 이모지 0 / 코드 변경 0). 코드 0건 변경 (QRScanPage/GlobalHeader/icons.tsx/tailwind.config.js/다른 sketch HTML 단 한 줄도 수정 X). 비즈니스 로직 (Stage 전환/Html5Qrcode/lookupCheckpoint/portal/state) 모두 코드 그대로. 다음 wave TSX 변환 1:1 매핑 source. main 머지 X, 배포 X. | 2026-05-16 | 00858ae | [260516-k2u-redesign-03-qr-scan-sketch-qr-v0-1-1-htm](./quick/260516-k2u-redesign-03-qr-scan-sketch-qr-v0-1-1-htm/) |
| 260516-027 | **redesign/07-elevator TSX Wave 11 — 옵션 B 3C 변환** (안전관리자 탭 본문). safety-mgr-sketch.html (cf538a3, 260515-wvq) 1:1 매핑. ElevatorPage.tsx `tab === 'safety'` IIFE 블록 변환 (+63/-44, 3463→3482). **3 정보 카드**: (A) 프로필 카드 — 48×48 round avatar `<User size=28 />` (👤 제거) + 이름 `text-[16px] font-bold` arbitrary + '승강기 안전관리자' 부제 + 선임일/교육이수일 2-col grid `bg-surface-sunken rounded-lg`. (B) 교육 현황 카드 — 헤더 `<BookOpen size=16 />` (📚 제거) + 보수(재)/신규 row `bg-surface-sunken rounded-xl` + **ddayClass 헬퍼 신설** ({text, bg} className 객체 반환, 4 분기: <0 danger / ≤60 warning / ≤365 info / >365 safe — fmtDday 분기 키워드 100% 보존, 색만 className 으로 교체). (C) 공단 등록 현황 카드 — 헤더 `<Building2 size=16 />` (🏢 제거) + 등록 수 텍스트 (등록 `text-safe font-bold` / 미등록 `text-warning`) + 호기 그리드 Tailwind arbitrary `grid grid-cols-[repeat(4,1fr)_6px_repeat(2,1fr)]` (인라인 gridTemplateColumns 제거) + 헤더 🛗→`<ElevatorIcon size=14 />` / ↕️→`<MoveDiagonal size=14 />` + chip `<CheckCircle2 size=11 />`(isReg) 또는 `<X size=11 />`(!isReg) — ✓/✗ 텍스트 제거. **5 상태**: 로딩 `text-center py-10 text-caption` / 빈 `<EmptyState icon={<User size=36 />} />` (👤 제거) / 정상 3 카드 / D-day 4 분기 / 등록 chip 2 분기. **lucide 신규 3종**: User/BookOpen/Building2. **재사용 4종**: ElevatorIcon/MoveDiagonal/CheckCircle2/X. **비즈니스 로직 100% 보존**: safetyMgrQuery/data.manager·education·registration/m.realName·maskedName·appointedAt·eduDate·eduValidFrom·eduValidTo/edu.refreshEdu·newEdu daysLeft·deadline/reg.total·registered·registeredIds/fmtDday 분기 키워드/elevators·evMap·find·grid 정의/chip type 분기. **Wave 1~10 + 다른 컴포넌트 단 한 줄도 수정 X** (list/TYPE_ICON_COMPONENT/EvSelector/EsBtn/EsNodeMap/Fault 3 모달/RepairNew/EvDetail/헬퍼 4종/고장+수리 탭/FAB/점검+검사 탭/KoelsaHistorySection). icons.tsx/tailwind.config.js 0건 수정. 변환 영역 var() 0 / 9·10·11px 0 / 이모지 0 / 인라인 style 0 (Tailwind arbitrary 채택). TypeScript 0 / npm build PASS. **→ 옵션 B 시리즈 완결 (Wave 9 3A + Wave 10 3B + Wave 11 3C, 5탭 본문 모두 변환).** 사용자 검수 → main 머지 → 배포. | 2026-05-16 | d97f1f9 | [260516-027-redesign-07-elevator-tsx-wave-11-b-3c-v0](./quick/260516-027-redesign-07-elevator-tsx-wave-11-b-3c-v0/) |
| 260515-wvq | **redesign/07-elevator 옵션 B 3C sketch** — safety-mgr-sketch.html (1596줄) v0.1.1 시안. 안전관리자 탭 본문 4 viewport 시각화. **3 정보 카드**: (A) 프로필 카드 (48×48 round avatar `<User size=28 />` + 이름 + '승강기 안전관리자' 부제 + 2-col grid 선임일/교육이수일), (B) 교육 현황 카드 (헤더 `<BookOpen />` 또는 GraduationCap, 보수(재) row + 신규 row, D-day chip 4 분기 — fmtDday 함수 100% 보존: <0=danger / ≤60=warning / ≤365=info / >365=safe), (C) 공단 등록 현황 카드 (헤더 `<Building2 />` + 등록 수 텍스트 safe·warning 분기 + 3 rows × 7 cols 호기 그리드 `gridTemplateColumns:'repeat(4,1fr) 6px repeat(2,1fr)'` 보존 + 호기 chip `EV/ES{number}` + `<CheckCircle2 />` 또는 `<X />` size=11). **5 상태**: 정상 / D-day 4 분기 카탈로그 / 빈 (`<User size=36 />` + "안전관리자 정보가 없어요") / 로딩 / 미등록 강조. **이모지 → lucide 완전 치환**: 👤→User, 📚→BookOpen 또는 GraduationCap, 🏢→Building2, 🛗→ElevatorIcon, ↕️→MoveDiagonal, ✓→CheckCircle2, ✗→X. **verify gate A~G 7/7 PASS** (라인 1596 / 9-11px 0 / inline style 0 / EV-/ES- 0 / [data-theme] 5 ≥4 / 옛 토큰 0 / 코드 변경 0). 코드 0건 변경 (ElevatorPage/icons.tsx/tailwind.config.js/3A·3B sketch HTML 단 한 줄도 수정 X). fmtDday/m·edu·reg 데이터 라벨/그리드 columns/EmptyState 분기 100% 보존. Wave 11 (3C 변환) 1:1 매핑 source. **옵션 B sketch 시리즈 완결 (3A/3B/3C 3 파일).** main 머지 X, 배포 X. 다음: 사용자 검수 → Wave 11 변환. | 2026-05-15 | cf538a3 | [260515-wvq-redesign-07-elevator-b-3c-sketch-v0-1-1-](./quick/260515-wvq-redesign-07-elevator-b-3c-sketch-v0-1-1-/) |
| 260515-rfh | **redesign/07-elevator TSX Wave 10 — 옵션 B 3B 변환** (점검 기록 탭 + 검사 기록 탭 + KoelsaHistorySection 본체). inspect-cert-history-sketch.html (031ddfb, 260515-qpm) 1:1 매핑. **ElevatorPage.tsx 점검 기록 탭 본문** (line 1225~1386): 월 피커 32×32 button + `<ChevronLeft·ChevronRight />` (‹/› 제거) + EmptyState `<ClipboardList size={36} />` (📋 제거) + 4 타입 그룹 헤더 + 호기 카드 `relative ... before:w-[3px] before:rounded-l-xl` 좌측 색바 (양호 safe-bar / 이상 warning-bar / 미점검 surface-sunken) + 펼침: 점검업체/점검자 2-col grid + A~E 카운트 칩 객체 매핑 (A safe / B warning / C danger / D·E text-tertiary) + 주의관찰 grid 3-col `'50px 1fr auto'` (화이트리스트 보존) + `<AlertTriangle size={12} />` (⚠️ 제거) + cellBase 변수 (display:contents + isLast 분기). **검사 기록 탭 본문** (line 1387~1578): dispClass 헬퍼 신설 ({text, bg, bar} className 객체 반환, 5종 분기 — 합격 safe / 보완후·조건부 warning / 보완·불합격 danger / null·기타 text-tertiary, 기존 dispColor var() 반환 함수 교체) + 연도 피커 동일 구조 + EmptyState `<Search size={36} />`(hasAny=false) / `<ClipboardList size={36} />`(yearStr 빈) + 호기 카드 좌측 색바 dispClass.bar 동적 + 검사 이력 카드 `bg-surface-sunken` + 부적합 fails grid (article/title bold + failDesc + failDescInspector text-tertiary). **KoelsaHistorySection.tsx 본체** (198→193줄, +28/-33): boxStyle 인라인 객체 → boxCls className 변수 + isMobile 분기 className 매핑 (padCls/headerCls/dateCls/subCls) + dispClass 헬퍼 + `<AlertTriangle size={12} />` 부적합 헤더 + `<ChevronRight rotate-90 분기 />` 펼침 chevron + props 시그니처 ({certNo, data, isLoading, isError, isMobile}) 100% 보존. **lucide 신규** (5종): ClipboardList/Search/ChevronLeft (ElevatorPage), AlertTriangle/ChevronRight (KoelsaHistorySection). **비즈니스 로직 100% 보존**: koelsaQuery/koelsaMap/availableMonths/expandedInspect/mobileAnnualQueries/dispWords 분기 키워드/data.issues/item.fails/formatDistanceToNow ko locale/fmtDate8/fmtDate. **TYPE_ICON 글로벌 정의 line 194 유지** (EvDetailModal line 673 Wave 5 영역 의존). **안전관리자 탭** (`tab === 'safety'`, line 1579~) **+ Wave 1~9 변환 결과 단 한 줄도 수정 X** (list/EvSelector/EsBtn/EsNodeMap/Fault 3 모달/RepairNew/EvDetail/헬퍼 4종/고장+수리 탭/FAB). icons.tsx/tailwind.config.js 0건 수정. ElevatorPage 3371→3449 (+78), KoelsaHistorySection 198→193 (-5). +221/-148 합계. TypeScript 0 에러 / npm build PASS (160ms, PWA precache 82 entries). 변환 영역 var() 0 / 9·10·11px 0 / 이모지(📋🔍⚠️) 0 / KoelsaHistorySection 인라인 style 0. 사용자 검수 → main 머지 → 배포. 다음: 3C(안전관리자 탭) sketch+변환 묶음. | 2026-05-15 | 8481d45 | [260515-rfh-redesign-07-elevator-tsx-wave-10-b-3b-ko](./quick/260515-rfh-redesign-07-elevator-tsx-wave-10-b-3b-ko/) |
| 260515-qpm | **redesign/07-elevator 옵션 B 3B sketch** — inspect-cert-history-sketch.html (1888줄) v0.1.1 시안. 점검 기록 탭 본문 + 검사 기록 탭 본문 + KoelsaHistorySection 5 상태 시각화. 4 viewport (모바일다크/라이트 + 데스크톱다크/라이트). 점검 카드 3변형(양호 접힘 + 이상 펼침 [점검업체/점검자 grid + A~E 결과 카운트 칩 + 주의관찰 항목 3-col grid (titNo/itemName(+detail)/긴급수리·주의관찰)] + 미점검 접힘). 검사 카드 2변형(합격 접힘 + 보완후합격 펼침 [날짜/검사종류/dispWords 배지/유효기간/기관/회사명 + 부적합 fails — standardArticle.standardTitle "▸ ..." + failDesc + failDescInspector]). KoelsaHistorySection 5 상태(정상 + cert_no 없음 + 로딩 스켈레톤 + 에러 + 빈 historyCount=0). 월/연도 피커 32×32 button + ChevronLeft·Right + disabled opacity 0.4 통일. 이모지 0건 (📋→ClipboardList, 🔍→Search, ⚠️→AlertTriangle, ‹·›→ChevronLeft·Right). 9·10·11px → 12px+ 격상. 호기 라벨 'N호기' 만 (EV-NN/ES-NN 본문 0건). dispWords 5종 카탈로그 row (합격/보완후합격/조건부/보완/불합격 — KoelsaHistorySection.dispColor 100% 보존). TYPE_ICON_COMPONENT 매퍼 3A 재사용. **verify gate A~G 7/7 PASS** (라인 1888 / 9-11px 0 / inline style 0 / EV-/ES- 0 / [data-theme] 6 ≥4 / 옛 토큰 0 / 코드 변경 0). 코드 0건 변경 (ElevatorPage/KoelsaHistorySection/icons.tsx/tailwind.config.js/다른 sketch HTML/다른 컴포넌트 — 단 한 줄도 수정 X). Wave 10 (3B 변환) 1:1 매핑 source. 3C(안전관리자 탭) sketch + 모든 TSX 변환은 별도 quick. main 머지 X, 배포 X. | 2026-05-15 | 031ddfb | [260515-qpm-redesign-07-elevator-b-3b-sketch-koelsah](./quick/260515-qpm-redesign-07-elevator-b-3b-sketch-koelsah/) |
| 260515-m4h | **redesign/07-elevator TSX Wave 7 (옵션 A)** — 헬퍼 4종 본체 변환 + BottomNav 회귀 fix + datetime-local overflow fix. **z-index 100 → 110 5건** (ModalWrap x2 inline → Tailwind z-[110] 통일 + EvDetailModal z-[100]→z-[110] x2 + FaultNewFullscreen zIndex:100→110 x1) — BottomNav 동일 z-100 stacking + DOM 순서로 모달 아래 깔리던 회귀 root fix. backdrop z-[90] 보존. **datetime-local input 3건** (FaultNewModal/FaultNewFullscreen/FaultResolveModal '수리 완료 일시') className 끝에 `min-w-0 max-w-full appearance-none` 추가 — iOS Safari native datetime picker intrinsic width 가 box-border 적용에도 부모 boundary 넘어 우측 overflow 되던 이슈 root fix. **헬퍼 4종 본체 변환** (Wave 1~6 에서 "헬퍼 본체 수정 0건" 룰로 보존됐던 영역, 이번 wave 일관성 결손 해소): (1) **ModalWrap** (line 2512~): 인라인 var(--bg2/bd/bd2/t1/t3) + ✕ 이모지 → `bg-surface-raised`/`border-border-default`/`border-border-strong`/`text-text-primary`/`text-text-tertiary` + `<X size={20} />`. dynamic 값 (top:50% transform, bottom:NAV_H, dynamic maxHeight calc) 만 inline-style 잔존. (2) **Field** (line 2531~): label 인라인 fontSize:11/var(--t2)/mb:5 → `block text-label font-bold text-text-secondary mb-[5px]`. `style` prop 시그니처 보존 (호출처 `{flex:1}` 등). (3) **EmptyState** (line 2539~): flex column center + py-10 + gap-2.5, 본문 13px var(--t3) → `text-body-sm text-text-tertiary`. `icon:string` 시그니처 유지 (이모지 받음). (4) **MultiPhotoUpload** (line 2967~): 라벨 + hidden file inputs + 갤러리 flex/gap/overflow + 64x64 추가 버튼 dashed border + 사진 카드 + 16x16 ✕ 삭제 버튼 → 전부 Tailwind v0.1.1 토큰. **📷 → `<Camera size={18} className="text-text-tertiary" />`** (lucide-react import 에 Camera 추가), ✕ 삭제 → `<X size={9} strokeWidth={3} />` on `bg-danger text-white`. **헬퍼 4종 시그니처 100% 보존** (호출처 변경 0건). photo upload mutation logic / compressImage import / PhotoSourceModal 호출 / fetch API / token / state 변경 0건. sketch 0건 (메모리 권위: 헬���는 시각 결정 단순). ElevatorPage.tsx +63/-30. **5개 var() 토큰 (--bg2/bd/bd2/t1/t2/t3/bg3)** 헬퍼 변환 영역에서 0건, 단 5탭 본문 영역 (ListTab/RepairListSection/탭 기록 본문 등) 의 ~267 var() + 4 이모지는 plan 명시 out-of-scope (옵션 B 5탭 wave 에서 처리). 헬퍼 4종 정의 시그니처 보존, npm build PASS (ElevatorPage chunk 95.13 kB). 사용자 검수 → main 머지 → 배포. 다음: 5탭 본문 sketch+변환 (옵션 B). | 2026-05-15 | 7872cc3 | [260515-m4h-redesign-07-elevator-tsx-wave-7-helpers-fix](./quick/260515-m4h-redesign-07-elevator-tsx-wave-7-helpers-fix/) |

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
