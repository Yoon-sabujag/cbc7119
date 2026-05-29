---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: PWA 데스크톱 최적화
status: executing
stopped_at: Phase 12+13 complete, Phase 14 next
last_updated: "2026-04-26T13:55:00Z"
last_activity: 2026-04-26
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 4
  completed_plans: 3
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-05)

**Core value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.
**Current focus:** Phase 12 — document-editing-export

## Current Position

Phase: 13
Plan: Not started
Status: Ready to execute
Last activity: 2026-05-29 - **Tier 2 데스크톱 진행** Phase B Wave 14b (260529-q5a): RemediationPage 데스크톱 zone 12 변환 + 1 옵션 N + 1 부분 변환 (15→3 합계 -80%). 페어 (14a+14b) 누적 25→3 (-88%) — RemediationPage 완결. 다음: Wave 15b 후속

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- No plans completed yet.

| Phase 11 P01 | 17 | 2 tasks | 5 files |
| Phase 11 P02 | 20 | 1 tasks | 2 files |
| Phase 12 P01 | 25 | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v1.1 init: PWA 유지 (네이티브 앱 X) — 4인 팀 규모에서 오버헤드. PWA+File System Access API로 충분
- v1.1 init: File System Access API 채택 — 브라우저 재시작 시 권한 재요청 1회 감수
- v1.1 init: Chrome/Edge 타겟 — File System Access API 지원 브라우저 한정
- [Phase 11]: lucide-react@0.454.0 installed — listed in CLAUDE.md spec but missing from package.json
- [Phase 11]: DesktopSidebar uses 3px transparent left border on inactive items to prevent layout shift on activation
- [Phase 11]: Split NO_NAV_PATHS into MOBILE/DESKTOP variants: DESKTOP keeps only ['/', '/login'] to show sidebar on all authenticated pages
- [Phase 11]: main tag uses overflow: auto instead of nested div overflow: hidden to enable desktop page scrolling without phantom bottom gap
- [Phase 12]: HTML table preview is data-confirmation quality not pixel-perfect Excel reproduction — print via Excel download for precision
- [Phase 12]: downloadReport() shared async function used by both desktop and mobile layouts in ReportsPage
- [Phase 12]: data-no-print attribute pattern on chrome elements for @media print control (sidebar, header, tab row, left panel)

### Pending Todos

1 pending todo(s) in `.planning/todos/pending/`

- 설정 패널 미구현 기능 목록 (v2로 이월 — SETTINGS-01~05 전부 v2 deferred)

### Blockers/Concerns

- Phase 11 시작 전 반드시 `html { overflow: hidden }` 글로벌 CSS를 모바일 전용으로 범위 제한 필요 (미수정 시 모든 데스크톱 페이지 스크롤 불가)
- Phase 11 시작 전 BottomNav 데스크톱 숨김 시 페이지별 `paddingBottom` 인라인 스타일 감사 필요 (phantom gap 방지)
- Phase 13 구현 전 `queryPermission()` / `requestPermission()` 플로우를 Chrome 122+ 실제 동작에 맞게 검증 필요

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260410-h2u | StaffServicePage 휴가신청서 출력 기능 추가 - 3분할 레이아웃, 새 휴가종류, 엑셀/프린트 | 2026-04-10 | 8db68d9 | [260410-h2u-staffservicepage-3](./quick/260410-h2u-staffservicepage-3/) |
| 260411-cwr | AdminPage 분리 - 직원관리/개소관리 독립 페이지 + 데스크톱 UI | 2026-04-11 | 9de63a7 | [260411-cwr-adminpage-ui](./quick/260411-cwr-adminpage-ui/) |
| 260420-e72 | 데스크톱 대시보드 승강기 고장 카드에 검사도래 배지 추가 | 2026-04-20 | 72bd198 | [260420-e72-desktop-elev-insp-badge](./quick/260420-e72-desktop-elev-insp-badge/) |
| 260426-jeh | QR 스캔이 iPhone 후면 초광각(0.5x) 카메라를 자동 선택하도록 수정 | 2026-04-26 | 9ceaa49 | [260426-jeh-qr-ultra-wide](./quick/260426-jeh-qr-ultra-wide/) |
| 260426-jzp | QR 스캔 video track zoom 0.5x 강제 + 임시 진단 표시 (260426-jeh 후속, iOS 26 매크로 자동전환 우회) | 2026-04-26 | b02eb45 | [260426-jzp-qr-zoom-0-5x](./quick/260426-jzp-qr-zoom-0-5x/) |
| 260426-kfj | QR 스캔 임시 진단 UI 제거 (260426-jzp 디버그 완료, ultra wide 자동선택 검증됨) | 2026-04-26 | 19c8da3 | [260426-kfj-qr-cleanup](./quick/260426-kfj-qr-cleanup/) |
| 260426-rzy | 소화기 마커/점검개소 삭제 cascade 추가 + CP-FE-0362 고아 행 정리 + production 배포 | 2026-04-26 | d3d4d7a | [260426-rzy-cascade-fix](./quick/260426-rzy-cascade-fix/) |
| 260426-u7f | CheckpointsPage 개소 추가 모달 — 카테고리=소화기 시 종류/제조정보 등 7필드 + extinguisherApi.create 라우팅 | 2026-04-26 | a539828 | [260426-u7f-checkpointspage-ext-fields](./quick/260426-u7f-checkpointspage-ext-fields/) |
| 260426-vk9 | 지하층 floor 형식('B1F'~'B5F'→'B1'~'B5') + 소화기 zone 매핑('지' 강제) 보정 | 2026-04-26 | d604771 | [260426-vk9-floor-zone-fix](./quick/260426-vk9-floor-zone-fix/) |
| 260428-er6 | 사이드 메뉴 라벨과 페이지 헤더 표기 통일 (사이드 메뉴 기준) | 2026-04-28 | e6480d7 | [260428-er6-menu-header-titles](./quick/260428-er6-menu-header-titles/) |
| 260428-hbh | QRScanPage 데드 코드 제거(found/form/done stage) + GlobalHeader portal 통합 | 2026-04-28 | 3a231a5 | [260428-hbh-qrscanpage-cleanup](./quick/260428-hbh-qrscanpage-cleanup/) |
| 260429-mao | 도면 분말 소화기 마커 연한 경고 강조 (A안) — stroke 색·두께 + danger ! 배지, 헬퍼 추출 | 2026-04-29 | 5a2005d | [260429-mao-ext-marker-warning](./quick/260429-mao-ext-marker-warning/) |
| 260429-n1e | 소화기 접근불가 개소 자동완료 + 13개 cp 마이그레이션 (분말 9 + 할로겐 4, 완강기 패턴 적용) | 2026-04-29 | 7a9d3e7 | [260429-n1e-extinguisher-inaccessible](./quick/260429-n1e-extinguisher-inaccessible/) |
| 260429-qd8 | 접근불가 개소 자동완료 cron 추가 (cbc-cron-worker, 매일 KST 15:00, 그 달 마지막 점검일 카테고리 일괄 처리) | 2026-04-29 | e5e1994 | [260429-qd8-access-blocked-cron](./quick/260429-qd8-access-blocked-cron/) |
| 260502-hgx | 클라 [접근불가] useEffect 두 개 제거 (cron 단일화) + 5/2 잘못 들어간 14건 admin 삭제 + production 배포 | 2026-05-02 | 09fbc75 | [260502-hgx-useeffect-cron-5-2-14-admin](./quick/260502-hgx-useeffect-cron-5-2-14-admin/) |
| 260504-mwn | 업무수행기록표 엑셀 출력 깨짐 수정 (firstSheet dangling pointer + AA셀 \n 이중 이스케이프) + production 배포 | 2026-05-04 | 4edeb94 | [260504-mwn-fix-worklog-excel-firstsheet-pointer-aa-](./quick/260504-mwn-fix-worklog-excel-firstsheet-pointer-aa-/) |
| 260513-lz1 | 소방점검관리 종합정밀 카드 지적사항에 수정 기능 추가 (FindingFormSheet 공유 컴포넌트 + PUT admin 게이트 제거 + 모바일/데스크톱 수정 버튼) | 2026-05-13 | 11a5be6 | [260513-lz1-legal-finding-edit-feature](./quick/260513-lz1-legal-finding-edit-feature/) |
| 260527-egj | 대시보드 월간 도넛 §6.1 Progress Color Rule 적용 (클라이언트 derive — progressColor helper + 4 곳 color prop 교체, API stats.ts 무수정, doubleCycle overlay 보존) | 2026-05-27 | a780d60 | [260527-egj-6-1-progress-color-rule-derive](./quick/260527-egj-6-1-progress-color-rule-derive/) |
| 260527-fcd | 모바일 점검 카테고리 카드 강조 반전 (InspectionPage.tsx:5187 — 미시작 opacity-60 제거 / 완료에 opacity-50 추가 + safe-bg/safe-bar 유지, 옵션 B. 데스크톱 카드 무수정) | 2026-05-27 | 156f933 | [260527-fcd-dim-highlight](./quick/260527-fcd-dim-highlight/) |
| 260527-gql | 코드베이스 잔존 unicode 이모지 → Lucide 전면 교체 (Dashboard 🔥⏰📋 / Inspection 🧯✅📋🔧 / Elevator ✅🚨⚠️ / Extinguishers 🔍 / FindingDetail 🔧 — 18 곳 live + INSPECT_RESULT_OPTIONS / CATEGORY_GROUPS / ZONE_CONFIG dead icon 필드 정리. §7.1 룰 enforce. 데스크톱 카드 byte 무수정) | 2026-05-27 | aa381be | [260527-gql-emoji-lucide-sweep-5-18-7-1-enforce](./quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/) |
| 260527-tb3 | LegalPage (소방점검 관리) 디자인 sweep — production submission-ppt 트랙 (W1~W9) 머지 후 잔존 emoji 8곳 (체크박스 ✓ / 사진상태 ✓✗ / 잠금 🔒 ×4 / 저장 💾) → Lucide (Check/X/Lock/Save) + 비표준 색 토큰 5곳 (bg-warning / border-safe / border-warning) 정리. 옵션 B (dirty=warning-bg outline) / 옵션 1 (pill border 제거) / Save 아이콘 동반. inline style 141곳 별도 phase. 비즈니스 로직 0 변경. | 2026-05-27 | 47b9088 | [260527-tb3-legalpage-sweep-emoji-8-lucide-4](./quick/260527-tb3-legalpage-sweep-emoji-8-lucide-4/) |
| 260527-wdc | LegalPage Phase B — inline style 141곳 → tailwind class 변환 (옵션 X 정확값 arbitrary + P leading 명시 보존 + M className conditional, 색변수 N 잔존 6곳: borderBottom var(--accent) 탭 underline 3곳 / fontFamily inherit textarea 2곳 / linear-gradient 조치완료 버튼 1곳). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide 7 import / 색 토큰 -bar 변종 / emoji 0) 보존. 비즈니스 로직 0 byte (onClick/useState/useMutation/useQuery/useEffect/legalApi/fetch 모두 identical). TypeScript 0 error. 145 ins / 186 del (-41 net, 1250→1209 줄). | 2026-05-27 | 184e548 | [260527-wdc-legalpage-phase-b-inline-style-141-tailw](./quick/260527-wdc-legalpage-phase-b-inline-style-141-tailw/) |
| 260528-01h | sibling Legal pages Phase B — inline style 64곳 → tailwind class (LegalFindingsPage 29→2 + LegalFindingDetailPage 35→4, 합쳐 90.6% 감소). wdc 옵션 (X 정확값 arbitrary + P leading 명시 + M conditional, 색변수 N) 그대로 승계. 잔존 6곳 = linear-gradient/SKELETON 박제/fontFamily inherit/rgba overlay/transition ease 등 tailwind 표현 불가 케이스. 시각 결과 0 byte. Phase A 결과 (Lucide imports + 색 토큰 -bar + emoji 0) 양쪽 파일 보존. 비즈 anchor (10종 + onClick handler bodies) precise grep 모두 identical. TypeScript 0 error. 68 ins / 124 del (-56 net, 734→678 합계). | 2026-05-28 | 894c9d0 | [260528-01h-legalfindingspage-legalfindingdetailpage](./quick/260528-01h-legalfindingspage-legalfindingdetailpage/) |
| 260528-0hr | Phase B 마스터 로드맵 v2 — 모바일 우선 22 wave 구조 (Tier 1 모바일 위주 11 + Tier 2 큰 데스크톱 분기 페이지 4 모바일 + 4 데스크톱 + Tier 3 컴포넌트 3). 코드 grep 검증으로 Q1-Q8 중 5건 확정 (InspectionPage emoji 25 / ElevatorFindingDetail sweep / AdminPage skip / sketch 신규 X / 비색 1곳 SettingsPanel L143). 모바일/데스크톱 zone 분류 brace tracking 분석 28 페이지. Cherry-pick 묶음 A (Legal 완료) + B + C1/C2 + D. | 2026-05-28 | aaf18ce | [260528-0hr-phase-b-master-roadmap](./quick/260528-0hr-phase-b-master-roadmap/) |
| 260528-a3v | Phase B Wave 1 워밍업 — QRScanPage 1→0 (w-full) + DivPage 4→4 (동적 color/chartH 옵션 N 잔존) + ReportsPage 3→0 (flex-col h-full overflow-hidden + bg-surface-page tailwind 토큰). 합계 8→4 (-50%). 옵션 X+P+M+색변수N 승계. 시각 0 byte. 비즈 anchor (9종 × 3 파일 + onClick precise) identical. TypeScript 0 error. 변경 파일 2 (DivPage 미수정). | 2026-05-28 | 18fd138 | [260528-a3v-phase-b-wave-1](./quick/260528-a3v-phase-b-wave-1/) |
| 260528-c9s | Phase B Wave 2 인증/스플래시 (캘리브 risk) — LoginPage 28→2 (옵션 M conditional + 동적 색변수 N 잔존 L98/L103 isSelected 분기) + SplashScreen 13→1 (캘리브 룰 옵션 X 정확값 보존, width:\`${pct}%\` 동적 옵션 N 잔존 L55). 합계 41→3 (-92.7%). w-8/h-8/p-8=48px tailwind override 함정 회피 (`pb-[32px]` arbitrary 적용, 메모리 anchor `feedback_tailwind_w8_h8_is_48px.md`). 옵션 X+P+M+색변수N 승계. 시각 0 byte. 비즈 anchor (5종 × 2 파일 + onClick precise) identical. TypeScript 0 error. 변경 파일 2. LoginPage 223→215줄 / SplashScreen 89→72줄. | 2026-05-28 | d36a20f | [260528-c9s-phase-b-wave-2](./quick/260528-c9s-phase-b-wave-2/) |
| 260528-cjn | Phase B Wave 3 근무/연간 (양쪽 캘리브 risk) — WorkShiftPage 24→5 (HDR_H/ROW_H 상수 + SHIFT_COLOR 동적 변수 옵션 N 잔존, L195 tdy spread → conditional className 옵션 M) + AnnualPlanPage 21→1 (L79 yearPos 캘리브 좌표 시그니처 LOCKED 보존, OQ #5 주석). 합계 45→6 (-86.7%). w-7=32/p-7=32 config override 함정 자체 발견+follow-up patch (pb-7 → pb-[28px], 메모리 anchor `feedback_tailwind_w8_h8_is_48px.md` 일반화). 옵션 X+P+M+색변수N 승계. 시각 0 byte. 비즈 anchor (9종 × 2 파일 + onClick precise) identical. TypeScript 0 error. holidays fetch + yearPos.y/x + HDR_H=52/ROW_H=46 보존. | 2026-05-28 | 4e99270 | [260528-cjn-phase-b-wave-3](./quick/260528-cjn-phase-b-wave-3/) |
| 260528-gsh | Phase B Wave 4 보고/대시보드 — Dashboard 10→5 (IS_ANDROID 의도 인라인 3건 보존 + CAT_DOT/catColor 동적 2건 옵션 N, animation 4건 → [animation:slideUp_...] arbitrary + paddingBottom calc 변환) + DailyReport 10→8 (캘리브 시스템 imgRect/pt.x.y/textStyle spread/DAILY_CALIB_STEPS/4 marker 잔존, root + page-body 2건 변환) + WorkLog 20→8 (캘리브 마커 시스템 8건 잔존, toolbar + spacer + margin 12건 변환). 합계 40→21 (-47.5%). 옵션 X+P+M+색변수N + 의도 inline N. 시각 0 byte. 비즈 anchor (9종 × 3 파일 + onClick precise) identical. TypeScript 0 error. Wave 3 borderRadius 트랩 precedent preemptive 적용 (rounded-[10px]/[6px] arbitrary). | 2026-05-28 | 05fddf1 | [260528-gsh-phase-b-wave-4](./quick/260528-gsh-phase-b-wave-4/) |
| 260528-h3z | Phase B Wave 5 조치 상세 — RemediationDetailPage 11→2 (fontFamily inherit L483/L493 옵션 N 잔존, tailwind 표현 불가). 9건 변환 (root flex + spinner [animation:spin_.7s_linear_infinite] + whitespace-pre-wrap 2 + paddingBottom calc + record.status/submitting conditional 옵션 M). 옵션 X+P+M+색변수N 승계. 시각 0 byte. 비즈 anchor (9종 + 5 uniq onClick) identical. 5 카테고리 자동화 useEffect 10건 + remediationApi 100% 보존. TypeScript 0 error. w-[28px] arbitrary (w-7=32 함정 회피). | 2026-05-28 | db728c0 | [260528-h3z-phase-b-wave-5](./quick/260528-h3z-phase-b-wave-5/) |
| 260528-hbv | Phase B Wave 6 일정/교육 (단일 wave 최대치 137) — SchedulePage 83→20 (inp/lbl L1174/L1178 정의 보존 + spread 6건 → style={inp} 단일 참조 전환 + width-only spread 4건 → className transformations + cellStyle/headCell spread 7건 옵션 N + cat?.color 동적 5건 옵션 N + AddModal/EditModal isDesktop conditional 옵션 M template literal with px-[28px] 함정 회피) + EducationPage 54→3 (51건 변환, fontFamily inherit 2건 Wave 5 precedent + sectionLabelStyle spread 1건 잔존, h-12/pl-11/w-11 default + px-[32px] arbitrary). 합계 137→23 (-83.2%). 옵션 X+P+M+색변수N + shared style obj N. 시각 0 byte. vite build PASS + TypeScript 0 error + 비즈 anchor (9종 × 2 파일 + Schedule 17 uniq onClick + Education 7 uniq onClick) identical. 142 ins / 290 del / -148 net. | 2026-05-28 | e267291 | [260528-hbv-phase-b-wave-6](./quick/260528-hbv-phase-b-wave-6/) |
| 260528-iht | Phase B Wave 7 직원 서비스 — StaffServicePage 34→10 (-71%). 24건 변환 (식대 카드 RGBA 4종 + 색 hex 6건 + linear-gradient + animation 2건 + grid-template-columns + shadow 등 arbitrary 통합) / 10건 옵션 N 잔존 (L754 cell multiline cellBg+conditional border+vendor prefix + L779 dateColor + L832 l.bg loop + L862 barColor template + L990/L1237 SHIFT_COLOR + L1161/L1183 좌표 spread + L1285/L1296 vendor as any). 옵션 M 신규 1건 (L779 isFullLeave conditional). 옵션 X 신규: `[-webkit-overflow-scrolling:touch]` arbitrary 첫 사례. redesign/12 (직원 서비스) Phase B 완결. 비즈 anchor (9종 + 13 uniq onClick) identical. TypeScript 0 error. | 2026-05-28 | 316e1eb | [260528-iht-phase-b-wave-7](./quick/260528-iht-phase-b-wave-7/) |
| 260528-irl | Phase B Wave 8 소화기 — ExtinguisherPublic 44→0 (-100%) + ExtinguishersList 78→15 (-81%). 합계 122→15 (-87.7%). **핵심 신규 패턴**: Public tbl/th/cl style object → className string const 변환 (locked list 외 shared style 변환 첫 사례). 16+ spread (`{...th, textAlign:'center'}`) → template literal (`` `${th} text-center` ``) 일괄 해소로 Public 44건 전부 변환. List 잔존 15건: gridCols 동적 2 + badgeBg/Color 1 + shared style spread 11 (actionBtn/dangerBtn 3 + inputStyle 동적 borderColor 6 + textTransform 1 + infoBanner 1 + modalWrapper 1). 8 shared style 정의 (page + List 7개) 100% 보존. 옵션 X+P+M+색변수N + shared style obj N + vendor N. 시각 0 byte. vite build PASS (14.79s, PWA 7931 KiB) + TypeScript 0 error + 비즈 anchor identical. | 2026-05-28 | de15e07 | [260528-irl-phase-b-wave-8](./quick/260528-irl-phase-b-wave-8/) |
| 260528-jey | Phase B Wave 9 도면 — FloorPlanPage 25→12 (-52%). 13건 변환 (L262/L264 marker 위험 배지 + L1044/L1050 notification banner 2종 blue+red + L1078 img full-cover + L1151 placeholder var(--t3)→text-text-tertiary + L1373 bottomsheet shadow + L1694/L1695 popup overlay+box + L1727/L1742/L2079 backdrop 3종 chrome 통일 + L2151 height 단독). 12건 옵션 N 잔존 (L1013 vendor as any + L1041/L1080 marker 좌표 동적 transform scale conditional + L1104 SVG textShadow + L1308/L1320 balloon positioning arrow conditional spread + L1846/L1897/L2118/L2167 textarea height+fontFamily inherit + L2137/L2147 input fontFamily inherit). chrome 통일 룰 6번째 페이지 변환 (backdrop inline → className 통합). 옵션 X+P+M+색변수N+좌표 N+vendor N+SVG N. 시각 0 byte. 비즈 anchor identical. TypeScript 0 error. 13 ins / 34 del / -21 net. | 2026-05-28 | 7701872 | [260528-jey-phase-b-wave-9](./quick/260528-jey-phase-b-wave-9/) |
| 260528-jxo | Phase B Wave 10 점검 메가 (6047줄) — InspectionPage 47 inline + 26 emoji 합 73 → 35. **Phase A 코드 emoji 0 마무리** (모든 페이지 누적, Lucide Check 신규 import L22). Part A 26 emoji 변환: 그룹 A 11 동적 span (Check size=12 inline-block) + 그룹 B 14 안내문/라벨/버튼 (Check size=12-14 with align-text-bottom JSX fragment) + 그룹 C 1 ✕→X. Part B 47 inline: 12건 변환 (gradient overlay 4건 arbitrary + scroll-snap 2건 + center highlight + SVG block + DIV pressure color + touchAction → touch-pan-y + conditional gradient 2건 옵션 M + NAV_BOTTOM 4건 arbitrary calc + zIndex 2건 옵션 M arbitrary) / 35 옵션 N 잔존 (module-scope const ITEM_H/containerH/pad/NAV_BOTTOM 12건 + 모달 transform animation 6건 + multiline conditional 6건 + 동적 색 5건 + DIV border 2건 + bottom-sheet modal 2건 + misc 2건). 비즈 anchor (9종 + 64 uniq onClick) identical. vite build PASS. TypeScript 0 error. 60 ins / 61 del / -1 net. | 2026-05-28 | cd22afc | [260528-jxo-phase-b-wave-10](./quick/260528-jxo-phase-b-wave-10/) |
| 260528-nkv | **Phase B Wave 11 FINAL Tier 1** — ElevatorFindingDetail 60 inline + 3 ✕ 합 63 → 2 (-96.7%). 3 ✕→X (size 24/14/10) + Lucide X import 추가. 58 inline 변환 (토큰 alias 매핑 var(--t1/t2/t3/bg/bd/bd2/acl/danger) → tailwind tokens + spinner [animation:spin_.7s_linear_infinite] + 표준 P1/P2/P3 다수). 2 옵션 N 잔존: L83 ImageViewer img (scale/pos/dragging 3-state 동적) + L245 content container (status 동적 paddingBottom). 옵션 X+P+M+색변수N 승계. 시각 0 byte. deprecated 진입점 호환 보존. 비즈 anchor (9종 + 10 uniq onClick) identical. TypeScript 0 error. vite build succeeded. **Tier 1 마무리** — 11 wave atomic + 38 emoji 0 (3 sweep waves: irl/jxo/nkv 누적) + 시각 0 byte 보존. 다음: Tier 2 (12a~15b 모바일 zone 분할). | 2026-05-28 | 9c5ae9a | [260528-nkv-phase-b-wave-11](./quick/260528-nkv-phase-b-wave-11/) |
| 260529-epe | **Phase B Wave 12a Tier 2 START** — StaffManage 모바일 zone 52→2 (-96%) + 데스크톱 24 보존 = 76→26 합계. 모바일 zone 50건 변환: bottom-sheet/center modal + replace modal + form modal + staff card + skeleton + mobile FAB. 잔존 2 = INPUT_STYLE spread (form 사번 input multi-state + 입사일 disabled multi-prop). **신규 패턴 (이후 wave reference)**: (1) Zone-aware sweep `{isDesktop ? ... : ...}` ternary 양쪽 분기 + `{isDesktop && ...}` block 보존 / `{!isDesktop && ...}` 변환. (2) Boundary line 보존 룰 — desktop ternary 양쪽 분기에 동일 inline 등장 시 둘 다 보존 (한쪽만 변환하면 일관성 깨짐). (3) LABEL_STYLE/INPUT_STYLE module const + spread 옵션 N (Wave 6 hbv precedent). 토큰 alias 매핑. 비즈 anchor (9종 + 18 uniq onClick) identical. vite build PASS (16.34s). TypeScript 0 error. 50 ins / 62 del / -12 net. | 2026-05-29 | 1ca5c94 | [260529-epe-phase-b-wave-12a](./quick/260529-epe-phase-b-wave-12a/) |
| 260529-f2w | **Phase B Wave 13a** — CheckpointsPage 모바일 zone 42→3 (-92.9%) + 데스크톱 38 보존 = 80→41 합계 (-48.8%). 모바일 zone 39건 변환: BottomSheet/DesktopModal/CheckPointModalContent form (카테고리/구역/층/종류/개소명 라벨+input) + CheckPointCard (status dot/badge/meta/action) + skeleton-wrap + mobile card-list/empty/fab-wrap. 잔존 3 = INPUT_STYLE spread (L253 카테고리 select + L274 층 select + L286 소화기 종류 select, 모두 `{...INPUT_STYLE, appearance:'none', cursor:'pointer'}` non-config dynamic combo — Wave 6 hbv precedent). Wave 12a zone-aware sweep + boundary 보존 + module const 옵션 N 패턴 그대로 14번째 atomic 도달. 토큰 alias 매핑. 비즈 anchor (9종 + 12 onClick / 4 useState / 3 useMutation / 4 useQuery) identical. vite build PASS (PWA precache 82 entries, 7931.92 KiB). TypeScript 0 error. 40 ins / 48 del / -8 net. | 2026-05-29 | 9cafd5c | [260529-f2w-phase-b-wave-13a](./quick/260529-f2w-phase-b-wave-13a/) |
| 260529-gj2 | **Phase B Wave 14a** — RemediationPage 모바일 zone 11→1 (-90.9%) + 데스크톱 14 보존 = 25→15 합계 (-40%). 모바일 zone 10건 변환: pre-L325 helper(renderCard + filterBar = 5건) + post-L537 mobile view 렌더(card-list root + filter row + count badge + 모바일 carousel 등 5건). 잔존 1 = L547 mobile list `{scrollbarWidth: 'none'}` (Tailwind 미지원, desktop L297 동일 옵션 N — Wave 14b 동일 처리 예정). **신규 패턴 (이후 wave reference)**: (1) **early-return zone 분할 첫 사례** — `if (isDesktop) { return (...) }` 구조의 desktop 블록 14건 보존, default mobile return 만 변환 (12a/13a `{isDesktop ? : }` ternary 와 다른 패턴). (2) **helper shared zone 첫 사례** — renderCard/filterBar 안 inline 은 pre-L325 한 곳에만 정의, 한 번 변환으로 양 view 자동 적용 (의도된 부수효과, desktop zone 룰 위반 X). (3) L301 vs L605 transition 차이 명시 매핑 (`transition-colors duration-[130ms]` vs `transition-all duration-150`). SKELETON_STYLE module const 보존. 비즈 anchor (10종 + 7 onClick / 3 useState / 2 useQuery / 1 useNavigate / 1 useSearchParams) identical. TypeScript 0 error. 10 ins / 96 del / -86 net (helper 정의 압축). | 2026-05-29 | 435b0c6 | [260529-gj2-phase-b-wave-14a](./quick/260529-gj2-phase-b-wave-14a/) |
| 260529-q5a | **Phase B Wave 14b** — RemediationPage 데스크톱 zone 12 변환 + 1 옵션 N + 1 부분 변환 (14→2) + 모바일 잔존 1 보존 = 15→3 합계 (-80%). 페어 (14a+14b) 누적 25→3 (-88%) — RemediationPage 완결. 데스크톱 zone 12 변환: detail-empty (text-[13px]) + table root (w-full border-collapse mb-5) + kv-table th/td loop × 2 (옵션 X+token) + resolved th/td × 4 쌍 (조치일시/조치자/조치 내용/소모 자재). 잔존 2 옵션 N: L297 desktop list scrollbar (단독 옵션 N) + L335 detail-pane 부분 변환 (padding+boxSizing className 화, scrollbarWidth inline 잔존). **신규 패턴**: (1) early-return 페어 wave 첫 사례 (`if (isDesktop) { return }` 의 14a default mobile + 14b desktop block 분할), (2) 부분 변환 첫 사례 (multi-prop combo 중 Tailwind 미지원 prop 만 inline 잔존, 나머지 className 화 — spread 가 아닌 일반 객체 분리). 비즈 anchor 12종 + 7 unique onClick identical. TypeScript 0 error / Vite build PASS. 14 ins / 17 del / -3 net. | 2026-05-29 | effabd2 | [260529-q5a-phase-b-wave-14b](./quick/260529-q5a-phase-b-wave-14b/) |
| 260529-ozt | **Phase B Wave 13b** — CheckpointsPage 데스크톱 zone 36 변환 + 2 옵션 N 잔존 (38→2) + 모바일 잔존 4 보존 = 42→6 합계 (-85.7%). 페어 (13a+13b) 누적 80→6 (-92.5%) — CheckpointsPage 완결. 데스크톱 zone 36 변환: desktop-header (L517-549 카테고리/zone/floor filter + 카운트 + 추가 버튼 7건) + mobile-header boundary paired (L555-580 7건) + desktop-content data-table (L607-651 22건: thead th × 7 + state-empty + tr 옵션 M (border + transition + opacity) + body td × 6 + status-cell/dot 옵션 M). 옵션 N 잔존 2 = L523 desktop cat select `{...INPUT_STYLE, height:36, appearance:'none', cursor:'pointer', paddingRight:32}` 4-prop combo + L555 mob-cat select `{...INPUT_STYLE, appearance:'none', cursor:'pointer', paddingRight:36}` 3-prop combo. 모바일 잔존 4 보존: BottomSheet sheet root Pattern A + INPUT_STYLE spread × 3 (카테고리/층/소화기 종류 select). boundary paired conversion 룰 12b→13b 두 번째 적용. 비즈 anchor (12종 + 9 unique onClick) identical. TypeScript 0 error / Vite build PASS. 37 ins / 44 del / -7 net. | 2026-05-29 | bfdfda9 | [260529-ozt-phase-b-wave-13b](./quick/260529-ozt-phase-b-wave-13b/) |
| 260529-odl | **Phase B Wave 12b** — StaffManagePage 데스크톱 zone 24→0 (-100%) + 모바일 잔존 3 보존 = 27→3 합계 (-88.9%). 페어 (12a+12b) 누적 76→3 (-96.1%) — StaffManagePage 완결. 데스크톱 zone 25건 변환: desktop-header (boundary `flexShrink:0` → `shrink-0`) + desktop add btn + mobile-header boundary paired + desktop-content (`px-6 pb-6`) + data-table (`w-full border-collapse`) + thead th × 7 (`py-2.5 px-2` + width:60 옵션 X) + state-empty + tr row 옵션 M (border-b + transition + opacity conditional) + body td × 7 + role-badge 옵션 M 2-prop (bg+color conditional) + status-cell/dot 옵션 M (color/bg conditional). 잔존 3 = BottomSheet sheet root (Pattern A) + INPUT_STYLE spread × 2 (form 사번 + 입사일). **신규 패턴**: boundary paired conversion (12a 보존했던 desktop+mobile-header `flexShrink:0` 짝꿍을 12b 페어 완결 시 둘 다 변환). 비즈 anchor (11종 + 15 unique onClick) identical. TypeScript 0 error / Vite build PASS. 24 ins / 31 del / -7 net. | 2026-05-29 | 1484f6e | [260529-odl-phase-b-wave-12b](./quick/260529-odl-phase-b-wave-12b/) |
| 260529-h8u | **Phase B Wave 15a 메가 분할 종결** — ElevatorPage 모바일 zone 101→27 (-73.3%) + 데스크톱 105 보존 = 206→132 합계 (-35.9%). **메가 페이지 2-plan 분할 atomic 첫 사례** — 15a-1 (Fault/Repair/Findings 트랙 51→11, e37a5ca) + 15a-2 (Cert/Info/Annual 트랙 50→16, 44f7b2d). 분할 결정 근거: 컨텍스트 부담 + 검증 복잡도 + ~90분 비례 추정 + 자연 의미 boundary + rollback 안전성. 변환 컴포넌트 14개 (ElevatorPage main stragglers + EvDetailModal + EvSelector + Fault modals 3종 + CertViewerModal + FindingCountBadge + FindingsPanel + RepairListSection + RepairImageViewer + RepairNewModal + CertSummary + CertBlock + ElevatorInfoCard + MinwonFindingsPanel). 옵션 N 잔존 27 = gradient FAB×4 + cellSt/kSt/vSt spread×11 + dynamic-grid/transform×5 + WebkitOverflowScrolling×1 + dynamic-color×1 + Field flex prop×2 + NAV_H partial×1 + CertBlock accent partial×2. 데스크톱 zone L527-L1024 정확 경계 sed 검증. 16개 module const 보존 (STATUS_STYLE/OVERALL_STYLE/RESULT_STYLE/INSPECT_TYPE_LABEL/TYPE_ICON/TYPE_ICON_COMPONENT/CHECK_ITEMS_EV/CHECK_ITEMS_ES/HISTORY_TABS/EV_FLOORS/EV_GROUPS_FAULT/EV_GROUPS_ANNUAL/ES_NODES_FAULT/ES_NODES_ANNUAL/CHECK_ITEM_LABELS/PERIOD_OPTIONS). TYPE_ICON emoji 4 보존 (🛗📦🔲↕️). 비즈 anchor (10종 + 45 onClick / 35 useState / 5 useEffect / 14 useQuery / 1 useNavigate / 3 useMutation / 15 fetch) identical. TypeScript 0 error. vite build PASS 양 plan. **모바일 zone 마지막 wave 종결** — 4 페이지 (StaffManage/Checkpoints/Remediation/Elevator) 모바일 sweep 완료 (101+42+11+101=255 inline → 27+3+1+27=58, -77.3%). 다음: 모바일 종합 검증 → Wave 12b~15b 데스크톱 zone phase. | 2026-05-29 | 44f7b2d | [260529-h8u-phase-b-wave-15a](./quick/260529-h8u-phase-b-wave-15a/) |

## Session Continuity

Last session: 2026-04-26T13:55:00Z
Stopped at: 260426-vk9 지하층 floor 형식 + 소화기 zone 매핑 fix 완료 (사용자 PWA 검증 대기, CP-FE-0449 정리 포함)
Resume file: .planning/ROADMAP.md
| 2026-05-04 | fast | InspectionPage 헤더 '리스트' → '소화기 관리' 변경 | ✅ |
| 2026-05-29 | fast | StaffManage + Checkpoints 모달 z-[50] → z-[200] (BottomNav z:100 위로 — 모바일 모달 접근 불가 fix, 기존 버그) | ✅ |
| 2026-05-29 | fast | StaffManage + Checkpoints BottomSheet → InspectionPage 표준 Pattern A 재설계 (z-[200] hack revert + bottom:NAV_BOTTOM + maxHeight:calc(100dvh-54px-safe)) | ✅ |
| 2026-05-29 | fast | StaffManage + Checkpoints 모달 input 가로 overflow + 좌우 스크롤 차단 fix (INPUT_STYLE minWidth:0 + sheet overflow-x-hidden) | ✅ |
| 2026-05-29 | fast | 생년월일 input native widget 제거 (appearance-none [-webkit-appearance:none]) — EducationPage 이수일 input 표준 패턴 따라감 | ✅ |
| 2026-05-29 | fast | ElevatorPage L673 desktop 헤더 emoji TYPE_ICON → Lucide 통일 + TYPE_ICON 정의 삭제 (redesign/07-elevator 누락 cleanup) | ✅ |
| 2026-05-29 | fast | ElevatorPage 데스크톱 좌측 escalator 카드 TypeIcon 누락 fix (h-32→h-36 + shrink-0, 운행 구간 2줄 + 공단 호기 overflow) | ✅ |
