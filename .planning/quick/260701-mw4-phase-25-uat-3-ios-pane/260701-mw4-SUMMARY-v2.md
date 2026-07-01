# 260701-mw4 — UAT 2차 수정 (v2)

1차(adda858a) 배포 후 사용자 재검수에서 3건 모두 미해결/오정렬 재보고 → 헤드리스 Chrome 로 **실측**하며 재수정. 이번엔 추측 대신 `Google Chrome --headless --screenshot` + `getBoundingClientRect` dump 로 실제 좌표를 측정해 검증.

## 재수정 3건

### FIX-1 (재) 모바일 수신반 라이브 ↔ 오늘현황 겹침
- **원인(실측 재현):** `aspect-video` 를 **grid item 에 직접** 부여 → 높이 압박(overflow) 상황에서 `auto` 트랙이 min-content 로 축소되고 aspect 항목이 트랙 밖으로 넘쳐 ②오늘현황과 겹침. 헤드리스 Chrome 에서 phone main 높이를 줄이자 재현됨.
- **수정:** grid item 을 **plain block** 로 두고 (`aspect-video` 제거, `className="w-full h-full"` prop 제거) 16:9 높이는 내부 `LivePanelImage` 의 aspect-video 가 정의 — **데스크톱 라이브 위젯과 동일 패턴**. 재현 HTML 에서 겹침 0 확인.
- DashboardPage.tsx `①-b 화재수신반 라이브`.

### FIX-3 (재) 데스크톱 캘린더/오늘일정 정렬 + 캘린더 높이
- **원인(실측):** 캘린더 자연높이 = **368px**, 라이브(264)+캘린더(368) 가 상단그룹 가용공간(592)을 초과 → 캘린더가 점검현황 바닥보다 **70px 아래**로 넘쳐 오늘일정과 겹침. (1차의 mt-auto 상단그룹은 콘텐츠가 넘쳐 무력화됨.)
- **수정:** 상단그룹/`mt-auto` 철거. 캘린더 카드를 **`flex-1 min-h-[248px] overflow-y-auto justify-center`** + 셀 `w-7`(32)→`w-6`(24) 컴팩트. 오늘일정 `flex-1`→**`shrink-0 h-[133px]`**(빠른도구 행 높이와 일치).
- **실측 검증 (1920×1080):** 캘린더 bottom == 점검현황 bottom (**차 0**), 오늘일정 top == 빠른도구 top (**차 0**), 캘린더 368→**298px**(compact). 짧은 뷰포트에선 min-h 로 붕괴 방지 + 컨테이너 스크롤(그레이스풀).
- DashboardPage.tsx 데스크톱 Row3 우측 컬럼.

### FIX-2 (재) 데스크톱 화재수신반 pane 헤더 높이
- **원인:** 1차에서 **잘못된 기준**(조치상세 pane, 72px, w-8 백버튼)에 맞춤. 사용자 실제 요구 = "다른 점검 항목 페이지와 맞춰라" = **카테고리 상세 헤더(:6632)** = 백버튼 없이 아이콘+타이틀, **~50px**.
- **수정:** `px-5 py-3`→`px-5 py-2`, 백버튼 `w-8 h-8 rounded-sm`(48)→`w-7 h-7 rounded-[7px]`(32). 점검모드 토글 유지.
- **실측:** 카테고리 헤더 50px vs 화재수신반 후보 **53px** (차 3px, 시각 동일). 형제 조치상세 pane(:6540)·:5482 백버튼 무변경.
- InspectionPage.tsx 화재수신반 id-head.

## 검증 방법 (재현/실측 파일)
`repro-mobile.html`(겹침 재현/수정) · `repro-measure.html`(현행 실측: 캘린더 70px 넘침) · `repro-fix.html`/`repro-fix3-*.html`(수정 정렬 실측: 차 0) · `repro-header2.html`(헤더 높이 매칭) + 각 PNG. 모두 `--headless --screenshot` + rect dump 로 좌표 확인.

## 게이트
- `cd cha-bio-safety && npm run build` (tsc + vite + PWA) PASS. DashboardPage/InspectionPage 번들 정상.
- 배포: redesign/25-panel-uat-fixes-2 → main 머지 1회 (cbc7119-preview 단일 배포).

## 잔여 / 주의
- 데스크톱은 **1920×1080 고정 kiosk 기준** 완전 정렬. 리뷰 브라우저가 1080 미만이면 캘린더 min-h 로 인해 약간의 오정렬 + 컨테이너 스크롤(정상 그레이스풀 저하) — kiosk(1080)에서 확인 권장.
- 캘린더 셀 24px 컴팩트: 점검 일정 dot 많은 달은 카드 내부 소폭 스크롤 가능(경미).
