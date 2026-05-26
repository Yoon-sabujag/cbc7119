---
title: "redesign/29-extinguisher-public — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-26
quick_id: 260526-qfa
branch: redesign/29-extinguisher-public
source_tsx: cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
source_tsx_lines: 149
design_system: cha-bio-safety/docs/redesign-context/29-extinguisher-public/design-system.md (v0.1.1)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (인증 전 public 페이지 = 점검 시리즈 아님 — 직접 적용 X, 28-splash 인증 전 precedent mirror 만)
mirror_of: cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) + cha-bio-safety/docs/redesign-context/23-education/wave-1-index.md (260522-gmp) — 7 섹션 구조 mirror, sub-wave 갯수는 페이지 규모(149 lines)에 맞춰 1~2 로 축소
precedent_short_page: cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html (69 lines 단일 sketch precedent — 종이 양식/단순 페이지 단일 atomic 패턴 origin)
biz_anchor_precedent: cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) — 비즈 anchor 16건 1 byte 변경 0 패턴 일반화
sub_wave_count: 2 (W2 sketch atomic + W3 TSX checklist) — 권장
memory_rules_inline: 12 (10 기본 + 종이 양식 색 hex 보존 룰 일반화 + WebkitUserSelect 비즈 보존 + @media print 글로벌 영향)
open_questions: 5
---

# redesign/29-extinguisher-public — sketch wave 1 (index)

본 문서는 W2~W3 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:

- ExtinguisherPublicPage.tsx (149 lines — 인증 없이 접근 가능 `/e/:checkpointId` public route 소화기 점검표 종이 양식 모방 페이지) 단일 파일의 element 인벤토리 → 1~2 sub-wave 분배 + **비즈 시그니처 anchor** 보존 (`useParams<{ checkpointId }>` / `useState × 5` cp+ext+records+loading+error / fetch `/api/public/extinguisher/${encodeURIComponent(checkpointId)}` / `json.success` 분기 / `setCp/setExt/setRecords` 또는 `setError` / catch `'네트워크 오류'` / `new Date().getFullYear()` + `year % 100` / `byMonth` 그룹핑 룰 / `months = Array.from({length:12},(_,i)=>i+1)` / `typeText = ext?.type ?? '-'` / `ROW_H = 35` / status 분기 'normal'→'무'/else→'유'/없음→'' / 우측 셀 i 분기 0/7/8/9/10 / 인쇄 색 hex 8종 #c00·#FFD700·#fff·#000·#f0ede5·#333·#999·#bbb / fontFamily "Noto Sans KR", sans-serif / fontWeight 700 / WebkitUserSelect+userSelect+WebkitTouchCallout 'none' / colgroup 비율 6/3/6/10/10/10/13/14/14/14 / 라벨 verbatim 11종 / 카피 verbatim 6종 / 점검관리자 정 '석현민' 하드코딩 / 콜백 번호 '031-881-7119' / 이미지 경로 '/extinguisher-check.png')
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 의 verbatim 룰 박제 (§6 / §7 은 미적용 1줄 메타 + §2.7 부분 적용 1줄 메타 — 종이 양식 모방 페이지라 토큰화 범위 좁음)
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 29-extinguisher-public 적용 여부 (인증 전 public 페이지 = 점검 시리즈 아님 — 직접 적용 X. App.tsx 실측 박제 — `/e/:checkpointId` 가 `<Auth>` wrapper **외부**에 정의 (line 295) + `MOBILE_NO_NAV_PATHS` (line 71) 미등재이지만 `showNav = isAuthenticated` (line 114) 단락으로 BottomNav 무조건 숨김 + lazy import line 32 / functions/_middleware.ts 의 `PUBLIC_PREFIX` (line 27) 에 `/api/public/` 등재로 토큰 없이 API 접근 가능)
- 메모리 룰 12건 (`feedback_*.md` 10 + 종이 양식 색 hex 8종 보존 룰 일반화 + WebkitUserSelect/userSelect/WebkitTouchCallout 비즈 보존 + @media print 글로벌 영향 박제) inline 인용 — 29-extinguisher-public 특화 룰 2건 (인쇄 색 1 byte 변경 0 룰 + 텍스트 선택 차단 비즈 보존) 포함
- §6 negative rule (이 wave 에서 금지된 것 + 후속 wave 에 전달할 12+ 건)
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌 (fontFamily Noto Sans KR 토큰 치환 / page background #fff 토큰 치환 / maxWidth 480 토큰화 / 점검관리자 '석현민' 동적 분기 / 부 점검관리자 빈 셀 처리)

작성일: 2026-05-26 / Quick ID: 260526-qfa / Branch: redesign/29-extinguisher-public

> 28-splash W1 (260522-209) + 23-education W1 (260522-gmp) 의 7 섹션 구조를 mirror. ExtinguisherPublicPage 149 lines 인증 없는 public route (`/e/:checkpointId`) 소화기 점검표 종이 양식 모방 페이지. **이 페이지는 디자인 토큰 적용 범위가 좁다** — 페이지 외곽 컨테이너 (maxWidth/padding/배경)만 토큰화 후보, 표 자체는 종이 양식 그대로 유지 (29-extinguisher-public.md 섹션 4 명시). 10-cctv-info 69 lines 단일 sketch precedent + 28-splash/23-education 의 통합 atomic 패턴 둘 다 reference. sub-wave 권장 = W2 sketch 단일 atomic + W3 TSX 변환 checklist. 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education 모두 평면(flat sibling) 패턴 — `29-extinguisher-public/sketch-wave-N-{slug}.html` 직접 배치, `sketch/` 서브폴더 없음. 본 인덱스도 `29-extinguisher-public/wave-1-index.md` (flat) 으로 위치한다.

---

# §1. ExtinguisherPublicPage.tsx 인벤토리

본 인벤토리는 ExtinguisherPublicPage.tsx (149 lines, 실측) 의 element 를 (1) 인터페이스 + state + 데이터 fetch / (2) 계산 + 그룹핑 + 가드 / (3) 외곽 page 컨테이너 + table + colgroup / (4) 제목 thead + 관리자/종류 행 + 헤더 행 / (5) 1~12월 점검 행 + 우측 안내 셀 (rowSpan) + 하단 푸터 5 영역으로 나눠 정리한다. line 범위는 **실측 결과** (Read 도구 + grep 검증, drift 없음).

**29-extinguisher-public 의 구조 특이성** (인벤토리 머리말):

- **종이 양식 모방 페이지** — 29-extinguisher-public.md 섹션 4 "이 페이지는 종이 인쇄 양식을 모방하는 게 목적. 디자인 시스템을 강하게 적용하지 말 것. 흰 배경/검정 텍스트/빨강 헤더는 인쇄용 의도된 색 — 변경 금지. 토큰화는 페이지 외곽(혹시 모바일에서 화면으로 볼 때 컨테이너 폭/패딩)만 적용. 표 자체는 단순 HTML 그대로 유지." verbatim 인용.
- **149 lines 단일 파일** — 28-splash 통합 320 lines + 23-education 591 lines + 16-workshift 226 lines 보다 작음. 10-cctv-info 69 lines 보다 큼. **sub-wave 분할이 자연스럽지 않음** → W2 단일 atomic sketch 권장.
- **인증 없음 public route** — App.tsx 에서 `<Auth>` 외부에 Route 정의 (실측: line 295 `<Route path="/e/:checkpointId" element={<ExtinguisherPublicPage />} />` — Auth wrapper 미감싸기). lazy import line 32 `const ExtinguisherPublicPage = lazy(() => import('./pages/ExtinguisherPublicPage'))`. functions/_middleware.ts 의 `PUBLIC_PREFIX` (line 27) 에 `'/api/public/'` 등재 — 토큰 없이 API 접근 가능. `/e/:checkpointId` 가 `MOBILE_NO_NAV_PATHS` (line 71) 미등재이지만 `showNav = isAuthenticated` (line 114) 단락으로 BottomNav 무조건 숨김 (인증 없음). **chrome 룰 직접 적용 X** (28-splash 인증 전 스플래시와 유사하지만 다른 패턴 — 스플래시는 timer 후 navigate, 이건 영구 페이지).
- **WebkitUserSelect 'none'** (line 146) — 텍스트 선택/롱탭 메뉴 비활성화 비즈. **보존 필수** (변경 시 인쇄/스크린샷 캡처 시도 시 한국어 IME 메뉴 노출됨 — 사용자 의도 위반).
- **인라인 style 객체 4종 + cellSpacing/cellPadding 0** — `page` (line 146) / `tbl` (line 147) / `th` (line 148) / `cl` (line 149) 4 객체 + table props `cellSpacing={0} cellPadding={0}` (line 48) 인라인. **종이 양식 모방의 시각 정확도** 가 토큰화 우선순위보다 높음 — 변환 시 1 byte 픽셀 변경 0 룰 적용 (15-daily-report SW3 portraitPos precedent 일반화).
- **인쇄 색 보존 hex 8종** — `#c00` (빨강 헤더+푸터 배경) / `#FFD700` (황금 헤더 텍스트) / `#fff` (흰 배경 + 푸터 텍스트) / `#000` (검정 본문) / `#f0ede5` (베이지 셀 배경) / `#333` (검정 외곽 border) / `#999` (회색 셀 border th + '/' 폰트) / `#bbb` (회색 셀 border cl). 모두 design-system 토큰과 무관한 인쇄용 의도된 색 — **1 byte 변경 금지**.
- **하드코딩 사용자명 1건** — line 76 점검관리자 정 = "석현민". 동적 분기 OQ 후보 (예: 방재실장 staff API 호출 / 환경변수 / D1 query). 부 점검관리자는 빈 셀 (line 83).
- **/extinguisher-check.png 이미지 의존** (line 107) — `/public/` 폴더 정적 자산. 변경 0, 표 우측 7행 rowSpan ROW_H*7 = 245px 정기점검 안내 PNG. **이미지 파일 자체 변경 금지**.
- **콜백 번호 verbatim** — "031-881-7119" (line 137, 방재실) 변경 금지.
- **모바일 전용** — maxWidth 480 (line 146) 컨테이너로 PC 1920x1080 에서도 모바일 폭 유지. 데스크톱 분기 없음. 인쇄 시 A4 종이에도 맞도록 표 폭 100%.
- **@media print 글로벌 영향** — `cha-bio-safety/src/index.css` 의 `@media print` 룰 (line 95~124) 이 본 페이지에도 적용 — `data-no-print` / `data-print-only` / `@page` 사이즈 + `-webkit-print-color-adjust: exact` (배경 색 인쇄 강제) 가 본 페이지의 #c00 빨강 헤더+푸터 인쇄에 의존. 글로벌 룰 변경 금지.

## §1.1 영역별 인벤토리 표

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 인터페이스 + state + 데이터 fetch | imports (useEffect / useState — react + useParams — react-router-dom) | 1~2 | 정적 import 묶음 | react-router-dom useParams 시그니처 변경 금지 | 무관 (보존만) |
| 1. 인터페이스 + state + 데이터 fetch | interface CheckRecord { id, result, memo?, checked_at, staff_name } | 4 | API 응답 shape | 변경 금지 — 백엔드 API 계약 | 무관 (보존만) |
| 1. 인터페이스 + state + 데이터 fetch | interface CheckpointInfo { id, locationNo, location, floor, description? } | 5 | API 응답 shape | 변경 금지 — 백엔드 API 계약 | 무관 (보존만) |
| 1. 인터페이스 + state + 데이터 fetch | interface ExtInfo { mgmtNo, type, approvalNo?, manufacturedAt?, manufacturer?, prefixCode?, sealNo?, serialNo?, note?, location? } | 6 | API 응답 shape | 변경 금지 — 백엔드 API 계약 | 무관 (보존만) |
| 1. 인터페이스 + state + 데이터 fetch | export default function ExtinguisherPublicPage() | 8 | 함수 시그니처 | named export 변경 금지 (App.tsx default import) | 무관 (보존만) |
| 1. 인터페이스 + state + 데이터 fetch | useParams<{ checkpointId: string }>() | 9 | URL param 추출 | 변경 금지 — `/e/:checkpointId` route 와 결합 | W2 (loading state ↔ checkpointId 없음 분기) |
| 1. 인터페이스 + state + 데이터 fetch | useState × 5 — cp (CheckpointInfo|null=null) / ext (ExtInfo|null=null) / records (CheckRecord[]=[]) / loading (true) / error (string|null=null) | 10~14 | 컴포넌트 state | 각 초기값 변경 금지 | W2 (loading/error/empty 3 state 표시) |
| 1. 인터페이스 + state + 데이터 fetch | useEffect (fetch `/api/public/extinguisher/${encodeURIComponent(checkpointId)}` → json.success → setCp/setExt/setRecords or setError → catch '네트워크 오류' → finally setLoading(false), deps [checkpointId]) | 16~26 | 데이터 fetch + state 업데이트 | API path / json.success 분기 / catch 카피 / finally setLoading false 순서 변경 금지 | 무관 (보존만) |
| 2. 계산 + 그룹핑 + 가드 | year = new Date().getFullYear() / yearShort = year % 100 | 28~29 | 현재 연도 + 2자리 표시 | 계산식 변경 금지 (인쇄 양식 연도 표기) | W2 (헤더 yearShort 표시) |
| 2. 계산 + 그룹핑 + 가드 | byMonth 그룹핑 (records.forEach → year 일치 필터 → month → max checked_at 만 유지) | 31~37 | 월별 최신 점검 1건만 유지 | **핵심 비즈 룰** — 변경 금지 (한 달 여러 점검 시 최신만 표시) | W2 (1~12월 행 데이터 source) |
| 2. 계산 + 그룹핑 + 가드 | loading 가드 (`<div style={page}><div style={{textAlign:center, padding:40, color:#333, fontSize:14}}>조회 중...</div></div>`) | 39 | loading 단순 표시 | 카피 '조회 중...' verbatim | W2 (loading 시각화) |
| 2. 계산 + 그룹핑 + 가드 | error \|\| !cp 가드 (동일 wrapper, 카피 `error ?? '데이터를 찾을 수 없습니다'`) | 40 | error/cp null fallback | 카피 '데이터를 찾을 수 없습니다' verbatim | W2 (error/empty 시각화) |
| 2. 계산 + 그룹핑 + 가드 | months = Array.from({ length: 12 }, (_, i) => i + 1) | 42 | 1~12 배열 | 12개월 fixed — 변경 금지 | W2 (months.map 좌측 6 셀) |
| 2. 계산 + 그룹핑 + 가드 | typeText = ext?.type ?? '-' | 43 | 종류 표시 fallback | fallback '-' 보존 (ext null 시) | W2 (종류 셀) |
| 2. 계산 + 그룹핑 + 가드 | ROW_H = 35 (고정 행 높이, 이미지 230px / 7행 + 패딩) | 44 | rowSpan 7 이미지 / 단일 행 height | 1 byte 변경 금지 (ROW_H * 7 = 245 이미지 셀 높이) | W2 (좌측 6 셀 + 우측 이미지 7행) |
| 3. 외곽 page 컨테이너 + table + colgroup | page 인라인 객체 (maxWidth 480 / margin '0 auto' / padding '8px 8px 8px' / fontFamily "Noto Sans KR", sans-serif / background #fff / color #000 / fontWeight 700 / WebkitUserSelect none / userSelect none / WebkitTouchCallout none) | 46, 146 | 페이지 외곽 wrapper + 텍스트 선택 차단 | maxWidth 480 + fontFamily + WebkitUserSelect 변경 금지 (OQ #1~#3 사용자 컨펌) | W2 (외곽 시각화) + W3 (TSX 토큰 치환 검토) |
| 3. 외곽 page 컨테이너 + table + colgroup | table + cellSpacing={0} + cellPadding={0} + tbl 인라인 객체 (width 100% / borderCollapse collapse / border `2px solid #333` / fontSize 12 / color #000 / fontWeight 700) | 48, 147 | 표 본체 | cellSpacing/cellPadding=0 + borderCollapse collapse 변경 금지 (인쇄 양식 시각) | W2 + W3 |
| 3. 외곽 page 컨테이너 + table + colgroup | colgroup 10 col — 6% 월 / 3% '/' / 6% 일 / 10% 점검자1 / 10% 점검자2 / 10% 이상유무 / 13% 서명 / 14% 점검사항1 / 14% 점검사항2 / 14% 점검사항3 (합 100%) | 49~60 | 표 컬럼 폭 분배 | **1% 변경 금지** (인쇄 폭 깨짐) | W2 (colgroup 시각화) |
| 4. 제목 thead + 관리자/종류 행 + 헤더 행 | thead 제목 (colSpan 10 / background #c00 / color #FFD700 / textAlign center / fontSize 18 / fontWeight 900 / padding '10px 0' / letterSpacing 0.15em / border `2px solid #333`) — "소 화 기 점 검 표" (공백 verbatim) | 62~66 | 페이지 식별 | 카피 + 색 #c00/#FFD700 + letterSpacing 0.15em 변경 금지 | W2 (헤더 시각화) |
| 4. 제목 thead + 관리자/종류 행 + 헤더 행 | tbody 시작 + "년도 / 점검관리자 / 정" 행 (th '년 도' colSpan 3 + cl yearShort textAlign right + cl '년' textAlign left + th '점검관리자' rowSpan 2 colSpan 2 + th '정' + cl colSpan 2 '석현민') | 68~77 | 연도 + 점검관리자 정 표시 | '석현민' 하드코딩 (OQ #4) / 공백 라벨 '년 도' / '정' verbatim | W2 (관리자 행 시각화) |
| 4. 제목 thead + 관리자/종류 행 + 헤더 행 | "종류 / 부" 행 (th '종 류' colSpan 3 + cl typeText colSpan 2 + th '부' + cl colSpan 2 빈 셀) | 79~84 | 종류 + 부 점검관리자 표시 | 부 빈 셀 (OQ #5) / 공백 라벨 '종 류' / '부' verbatim | W2 (종류 행 시각화) |
| 4. 제목 thead + 관리자/종류 행 + 헤더 행 | 헤더 행 (background #f0ede5 / th '월' borderRight transparent + '/' borderLeft/Right transparent + '일' borderLeft transparent + 점검자성명 colSpan 2 + 이상유무/서명 colSpan 2 + 점검사항 colSpan 3) | 86~94 | 1~12월 컬럼 헤더 | 베이지 #f0ede5 배경 + 라벨 11종 verbatim ('월','/','일','점검자성명','이상유무/서명','점검사항') 변경 금지 | W2 (헤더 행 시각화) |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | months.map((m, i) => …) — rec = byMonth[m] / day / name / status ('무' if rec.result==='normal' else '유' if rec else '') | 96~131 | 12 행 점검 데이터 | status 분기 라벨 verbatim '무'/'유' 변경 금지 | W2 (좌측 6 셀 시각화) |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | 우측 셀 i === 0 → rowSpan 7 + colSpan 3 + img `/extinguisher-check.png` (alt "정기점검(월1회)") + height ROW_H*7 / objectFit fill / position absolute / top0 left0 / borderLeft `2px solid #333` | 103~109 | 정기점검 안내 PNG | 이미지 경로 + alt + rowSpan 7 + objectFit fill 변경 금지 | W2 (우측 7행 이미지 시각화) |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | 우측 셀 i === 7 → th colSpan 3 '소화기번호' (fontSize 10 height ROW_H borderLeft `2px solid #333`) | 110~111 | 우측 정보 라벨 | 카피 '소화기번호' verbatim | W2 |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | 우측 셀 i === 8 → cl colSpan 3 `ext?.mgmtNo ?? cp.locationNo ?? '-'` (textAlign center borderLeft `2px solid #333` height ROW_H) | 112~113 | 소화기 번호 값 | fallback 체인 ext?.mgmtNo → cp.locationNo → '-' 변경 금지 | W2 |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | 우측 셀 i === 9 → th colSpan 3 '설 치 장 소' (fontSize 10 height ROW_H borderLeft `2px solid #333`) | 114~115 | 우측 정보 라벨 | 카피 '설 치 장 소' (공백 verbatim) | W2 |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | 우측 셀 i === 10 → cl rowSpan 2 colSpan 3 `ext?.location ?? cp.location` (textAlign center borderLeft `2px solid #333` fontSize 10 verticalAlign middle lineHeight 1.4) | 116~117 | 설치 장소 값 (마지막 2행 차지) | fallback 체인 ext?.location → cp.location 변경 금지 | W2 |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | 좌측 6 셀 (월 m / `/` separator color #999 padding 0 width 8 / 일 day / 점검자 colSpan 2 name / 이상유무 status / 서명 name) — 모두 textAlign center + height ROW_H + 일부 borderLeft/Right transparent | 120~127 | 월별 좌측 6 셀 | 색 #999 + width 8 + textAlign center 변경 금지 | W2 |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | 하단 푸터 (tr / td colSpan 10 / background #c00 / color #fff / textAlign center / fontSize 11 / fontWeight 700 / padding '8px 6px' / lineHeight 1.8 / border `2px solid #333`) — "이상 발견 즉시 수리를 의뢰하십시오." + br + span fontSize 10 "방 재 실 &nbsp;&nbsp;&nbsp; 031-881-7119" | 133~139 | 안전 안내 + 콜백 번호 | 카피 verbatim + 색 #c00/#fff + lineHeight 1.8 + &nbsp; ×3 변경 금지 | W2 (푸터 시각화) |
| 5. 1~12월 점검 행 + 우측 안내 셀 + 하단 푸터 | 인라인 style 객체 정의 (page line 146 / tbl line 147 / th line 148 / cl line 149) | 146~149 | 4 객체 (페이지/표/th/cl) | 픽셀 1 byte 변경 금지 | W3 (TSX className 치환 시 시각 동일 verify) |

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
     149 cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
```

drift 없음 (Plan frontmatter `source_tsx_lines: 149` 일치).

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W3 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (28-splash W1 의 비즈 anchor 16건 보존 룰 일반화 + 15-daily-report SW3 portraitPos 좌표 시스템 precedent 일반화):

```
[ExtinguisherPublicPage.tsx — react-router / state / fetch]
- useParams<{ checkpointId: string }>()                                                   (변경 금지)
- useState × 5 — cp / ext / records / loading / error                                     (각 state 초기값 변경 금지)
- fetch `/api/public/extinguisher/${encodeURIComponent(checkpointId)}`                    (API path 변경 금지)
- json.success 분기 → setCp(json.data.checkpoint) / setExt(json.data.extinguisher)        (응답 shape 변경 금지)
- setRecords(json.data.records)                                                           (응답 records 키 변경 금지)
- setError(json.error ?? '조회 실패')                                                     (fallback 카피 verbatim)
- catch '네트워크 오류'                                                                   (카피 verbatim)
- finally setLoading(false)                                                               (순서 변경 금지)

[ExtinguisherPublicPage.tsx — 비즈 로직 함수]
- year = new Date().getFullYear() / yearShort = year % 100                                (계산 식 변경 금지)
- byMonth 그룹핑 룰 — year 일치 필터 + max checked_at 만 유지                              (변경 금지)
- months = Array.from({ length: 12 }, (_, i) => i + 1)                                    (12개월 fixed)
- typeText = ext?.type ?? '-'                                                             (fallback '-' 보존)
- ROW_H = 35                                                                              (1 byte 변경 금지)
- status 분기 — 'normal' → '무' / 외 → '유' / rec 없음 → ''                                (라벨 verbatim)
- 우측 셀 분기 — i === 0/7/8/9/10                                                          (인덱스 변경 금지)
- 우측 셀 i === 8 fallback chain — ext?.mgmtNo ?? cp.locationNo ?? '-'                    (체인 순서 보존)
- 우측 셀 i === 10 fallback chain — ext?.location ?? cp.location                          (체인 순서 보존)

[ExtinguisherPublicPage.tsx — 인쇄 색 hex (8종) + 폰트/속성]
- background #c00 (헤더 + 푸터)                                                           (1 byte 변경 금지)
- color #FFD700 (헤더 텍스트 "소 화 기 점 검 표")                                          (1 byte 변경 금지)
- color #fff (푸터 텍스트 + page background)                                              (1 byte 변경 금지)
- background #f0ede5 (베이지 헤더 셀 + th 객체 기본)                                       (1 byte 변경 금지)
- border #333 (외곽 + thead + 우측 분리 — 2px solid)                                       (1 byte 변경 금지)
- border #999 (th 셀 + '/' 폰트 — 1px solid)                                              (1 byte 변경 금지)
- border #bbb (cl 셀 — 1px solid)                                                          (1 byte 변경 금지)
- color #000 (본문 + page/tbl/th/cl)                                                       (1 byte 변경 금지)
- color #333 (loading/error 메시지 / 외곽 border)                                          (1 byte 변경 금지)
- fontFamily "Noto Sans KR", sans-serif                                                   (1 byte 변경 금지 — OQ #1 토큰 치환)
- fontWeight 700 (페이지 전역 + tbl + th + cl)                                            (1 byte 변경 금지)
- letterSpacing 0.15em (헤더 제목 "소 화 기 점 검 표")                                     (1 byte 변경 금지)
- lineHeight 1.8 (푸터 본문)                                                              (1 byte 변경 금지)
- lineHeight 1.4 (설치 장소 셀)                                                            (1 byte 변경 금지)
- WebkitUserSelect 'none' + userSelect 'none' + WebkitTouchCallout 'none'                 (비즈 보존 — 텍스트 선택 차단)

[ExtinguisherPublicPage.tsx — 라벨/카피 verbatim]
- "소 화 기 점 검 표" (공백 포함)                                                          (1 byte 변경 금지)
- "년 도" / "종 류" / "점검관리자" / "정" / "부"                                            (verbatim — 공백 포함)
- "월" / "/" / "일" / "점검자성명" / "이상유무/서명" / "점검사항"                          (verbatim)
- "소화기번호" / "설 치 장 소"                                                             (verbatim — '설 치 장 소' 공백)
- "무" / "유"                                                                              (status 라벨)
- "이상 발견 즉시 수리를 의뢰하십시오."                                                    (verbatim)
- "방 재 실     031-881-7119" (&nbsp; × 3)                                                 (1 byte 변경 금지)
- "조회 중..."                                                                             (loading)
- "데이터를 찾을 수 없습니다"                                                              (error fallback)
- "조회 실패"                                                                              (json.error fallback)
- "네트워크 오류"                                                                          (catch fallback)
- "석현민"                                                                                 (점검관리자 정 — OQ #4)
- "정기점검(월1회)"                                                                        (img alt verbatim)
- "/extinguisher-check.png"                                                                (이미지 path verbatim)
- "년"                                                                                     (yearShort 뒤 라벨)

[ExtinguisherPublicPage.tsx — colgroup 비율 + ROW_H]
- 6 / 3 / 6 / 10 / 10 / 10 / 13 / 14 / 14 / 14 (% 합 100)                                  (1% 변경 금지 — 인쇄 폭 깨짐)
- ROW_H = 35 → ROW_H * 7 = 245 (우측 이미지 셀 높이)                                       (1 byte 변경 금지)
- 우측 이미지 셀 borderLeft 2px solid #333                                                 (2px 변경 금지 — 좌우 분리선)
```

---

# §2. sub-wave 분배

**권장 분배** (149 lines 종이 양식 모방 페이지 — 10-cctv-info 69 lines 단일 sketch precedent + 28-splash/23-education 통합 atomic 패턴 종합):

| wave | 파일 | 범위 | 산출물 |
|---|---|---|---|
| W2 | `sketch-wave-2-extinguisher-table.html` | ExtinguisherPublicPage 149 lines 전체 — 외곽 page + table colgroup + thead 제목 + 관리자/종류 행 + 헤더 행 + 1~12월 행 + 우측 안내 셀 (7행 이미지 / 소화기번호 / 설치장소) + 하단 빨강 푸터 모두 단일 sketch HTML | 1개 HTML 파일 (loading/error/empty 3 state 는 sketch HTML 내부에서 변형 표시 또는 별도 섹션 — sketch 작업자 판단) |
| W3 | `wave-3-tsx-conversion-checklist.md` | sketch → TSX 변환 checklist (sketch CSS verbatim 인용 + 비즈 anchor 27건 1 byte 변경 0 verify gate + Tailwind class 치환표 + WebkitUserSelect 보존 + 인쇄 색 hex 보존 verify) | markdown 1개 (sketch 아님) |

**대안 분할 후보** (만약 W2 단일 atomic 으로 컨텍스트 부담 시):
- W2a `sketch-wave-2-table-main.html` (외곽 + table + 제목/관리자/종류/헤더 + 1~12월 좌측 6 셀)
- W2b `sketch-wave-3-table-right.html` (우측 안내 셀 + 푸터 강조)
- W3 `wave-4-tsx-conversion-checklist.md`

**권장:** W2 단일 atomic. 페이지 단순성 + 종이 양식 모방의 시각 일관성이 분할 시 깨질 위험. 10-cctv-info (69 lines) 가 단일 sketch 로 무리없이 완결됨 (260517-upw + 260517-ctx + 260522-ffc 3 wave 완결 status `project_redesign_10_cctv_info_status` 참고). 28-splash 4-wave 는 통합 320 lines 기준이라 본 페이지(149)에는 과분.

---

# §3. design-system.md verbatim 인용

## §3.1 design-system.md §1.1 (노안 친화) verbatim

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

**29-extinguisher-public 적용 메타:** 본 페이지는 종이 양식 모방 — fontSize 10 (th + 소화기번호/설치장소) / 11 (푸터 본문) / 12 (tbl + cl + 헤더 행) / 18 (제목) 사용. **9·10·11px 사용 금지 룰 미적용** — 인쇄 양식 가독성 우선, design-system §1.2 "정보 인지 > 미적 정제" 의 spec 적용. 터치 타겟 44px 룰도 미적용 (조작 element 0).

## §3.2 design-system.md §1.2 (정보 인지 > 미적 정제) verbatim

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

**29-extinguisher-public 적용 메타:** 본 페이지는 **종이 양식 그대로** = "정보 인지" 의 끝판왕 (인쇄 양식 = 가장 검증된 정보 디자인). 빨강 헤더+푸터 (긴급 정보) / 황금 헤더 텍스트 (식별) / 베이지 헤더 셀 (정보 영역) 모두 § 1.2 룰 적용 결과. 변경 금지.

## §3.3 design-system.md §1.3 (모바일/데스크톱 같은 시스템 다른 밀도) verbatim

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

**29-extinguisher-public 적용 메타:** **데스크톱 분기 없음** — maxWidth 480 (line 146) 으로 PC 1920x1080 에서도 모바일 폭 유지. 인쇄 시 A4 종이에 맞도록 표 폭 100%. §1.3 의 "다른 밀도" 룰 미적용 (모바일 전용 페이지).

## §3.4 design-system.md §6 (시각 규칙 확장) — 미적용 1줄 메타

> ⚠ §6 Progress Color Rule / Stat Card / 카테고리 카드 / Backgrounds & Gradients / Hover / Animation / Shadows / Layout Rules / Transparency / Imagery 모두 **이 페이지에서 미적용** — 종이 양식 모방 목적, 색 #c00/#FFD700/#f0ede5/#333/#999/#bbb 모두 인쇄용 의도된 색 보존 우선. 단 §6.4 Backgrounds (페이지 외곽 컨테이너 배경 #fff) 토큰 치환 OQ #2 검토 가능.

## §3.5 design-system.md §7 (Iconography) — 미적용 1줄 메타

> ⚠ §7 Lucide + 커스텀 SVG 아이콘 모두 **이 페이지에서 미적용** — 이 페이지에 아이콘 없음. `/extinguisher-check.png` 정적 이미지만 사용. §7.1 Lucide 룰 / §7.6 커스텀 SVG (FireExtinguisherCustom 등) 모두 무관.

## §3.6 design-system.md §2.7 Typography — 부분 적용 메타

> ⚠ §2.7 text-* 클래스는 종이 양식 폰트 크기 (10/11/12/18) 와 매핑 어려움 — 10px 은 §2.7 최소 (text-caption 12) 미만. 인쇄 시각 일관성 우선 → §2.7 미적용. fontFamily "Noto Sans KR" 은 §2.7 의 design-system 기본 폰트와 일치하므로 OQ #1 토큰 치환 검토 가능 (font-sans utility).

---

# §4. chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` 의 02 InspectionPage + 06 FloorPlanPage chrome 룰은 **점검 시리즈 페이지에 적용** (모달 chrome / 헤더 / 뒤로가기 / 푸터 액션 통일).

**29-extinguisher-public 적용 여부:** **직접 적용 X**.
- 점검 시리즈 아님 — 공개 조회용 종이 양식 페이지.
- **인증 없음** — App.tsx 의 `<Auth>` wrapper **외부**에 Route 정의.
  - 실측 — `cha-bio-safety/src/App.tsx`:
    - line 32: `const ExtinguisherPublicPage = lazy(() => import('./pages/ExtinguisherPublicPage'))` — lazy import
    - line 51~53: `function Auth({ children }) { … return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace /> }` — Auth wrapper 정의
    - line 295: `<Route path="/e/:checkpointId" element={<ExtinguisherPublicPage />} />` — **Auth wrapper 미감싸기** (sibling Routes 들 line 267~294 는 모두 `<Auth>…</Auth>` 감쌈)
- **functions/_middleware.ts public route 매칭** — `/api/public/*` 패턴
  - 실측 — `cha-bio-safety/functions/_middleware.ts`:
    - line 26: `const PUBLIC = ['/api/auth/login', '/api/health', '/api/holidays/sync', '/api/push/vapid-public-key']`
    - line 27: `const PUBLIC_PREFIX = ['/api/uploads/', '/api/public/', '/api/holidays', '/api/_telemetry/']`
    - line 42: `if (!url.pathname.startsWith('/api/') || PUBLIC.includes(url.pathname) || PUBLIC_PREFIX.some(p => url.pathname.startsWith(p))) { … }` — 토큰 검증 skip
  - 결과: `/api/public/extinguisher/${checkpointId}` 는 토큰 없이 접근 가능 — public.
- **BottomNav 미노출** — App.tsx line 114 `const showNav = isAuthenticated` + line 302 `{!isDesktop && showNav && <BottomNav … />}`. 인증 없으므로 showNav false → BottomNav 무조건 숨김. (`/e/:checkpointId` 가 `MOBILE_NO_NAV_PATHS` line 71 미등재이지만 showNav false 단락으로 의미 없음.)
- **SideMenu 미노출** — App.tsx line 218 `{!isDesktop && showNav && …}` — 동일 단락.
- **데스크톱 글로벌 AppHeader 미노출** — App.tsx line 227 `{isDesktop && showNav && !DESKTOP_HEADER_HIDE_PATHS.includes(location.pathname) && (…)}` — showNav false 단락으로 데스크톱에서도 헤더 미렌더.
- **chrome 룰 미적용 결과** — 페이지가 종이 양식 그 자체. 헤더/푸터는 페이지 내부의 표 thead/tfoot 가 대신.

**28-splash 인증 전 precedent mirror:** 28-splash 도 인증 전 `/` route 였지만 chrome 룰 직접 적용 X (28-splash W1 §4 참조). 본 페이지도 동일 패턴. 단 28-splash 는 timer 후 navigate (R/F 1), 본 페이지는 영구 페이지 (R/F 5)이므로 영구 인증 전 표시 패턴.

---

# §5. 메모리 룰 inline 인용 (12건)

기본 10건 (28-splash + 23-education W1 mirror):

1. **`feedback_tsx_wave_emoji_dot_gap`** — sketch 의 이모지 0 verify gate. 29-extinguisher-public 의 이모지는 0 (종이 양식 — 텍스트/숫자만). 특수 글리프도 0 — 슬래시 `/` 와 한자/한글 라벨만 사용.

2. **`feedback_tsx_wave_stat_card_drift`** — sketch verbatim 인용 + verify gate. 인쇄 색 hex 8종 (#c00/#FFD700/#fff/#000/#f0ede5/#333/#999/#bbb) + colgroup 비율 6/3/6/10/10/10/13/14/14/14 + ROW_H 35 + letterSpacing 0.15em + lineHeight 1.4/1.8 모두 verbatim 인용 + W3 verify gate 강제.

3. **`feedback_planner_prompt_sketch_verbatim`** — sketch CSS verbatim 인용 grep 으로 추출. W2 sketch 작성 시 ExtinguisherPublicPage.tsx 의 page/tbl/th/cl 4 객체 + thead 인라인 style + 푸터 인라인 style 을 grep 으로 추출해 sketch CSS 에 그대로 인용.

4. **`feedback_redesign_sketch_rule_enforcement`** — design-system §6.2 negative rule 강제 (위험 임계치 아닌 카드는 status 색 금지). **본 페이지에는 status 색 자체가 없음** (#c00 은 인쇄 빨강이지 status-danger 가 아님) — §6 미적용 메타와 결합. sketch 에 status 토큰 사용 금지.

5. **`feedback_design_changes_ask_first`** — 디자인 변경 전 사용자 컨펌 필수. 본 페이지는 종이 양식 모방 — 외형 변경 0 default. fontFamily/maxWidth/background 토큰 치환 4건 모두 §7 OQ 로 사용자 컨펌 후에만 진행.

6. **`feedback_sketch_realistic_data`** — 시안 표시 분기/라벨 룰은 코드 그대로. 점검관리자 '석현민' 하드코딩은 sketch 에 그대로 표시. 빈 셀 (부 점검관리자) 도 그대로 표시. 변경 OQ 만 §7 에 정리.

7. **`feedback_tailwind_token_class_pattern`** — status- prefix 없음 (text-fire-bar O / text-status-fire-bar X) + lucide size={N} prop. **본 페이지 미적용** — Tailwind 토큰 미적용 페이지 (종이 양식 인쇄 색 보존). 단 W3 에서 페이지 외곽 토큰 치환 시 `bg-surface-page` / `text-text-primary` 등의 token utility 사용 시 본 패턴 강제.

8. **`feedback_tailwind_w8_h8_is_48px`** — w-8 = 48px 함정. **본 페이지 미적용** — Tailwind 미적용 페이지. 단 W3 에서 ROW_H = 35 를 Tailwind utility 로 치환 시 `h-[35px]` arbitrary 필수 (`h-8` = 48px 이 아닌 35px 강제).

9. **`feedback_check_branch_before_edit`** — main 단일 trunk 룰 + 작업 시작 전 brunch 확인. W2 sketch + W3 TSX 시작 전 `git status` + `git branch --show-current` 으로 redesign/29-extinguisher-public 브랜치 검증.

10. **`project_cbc7119_design_repo` + `reference_cbc7119_domain` + `feedback_cbc7119_design_never_wrangler`** — 디자인 워크트리에서 wrangler 명령 금지 + 직원 도메인 cbc7119 작업 절대 X (CLAUDE.local.md 강제). W2 sketch + W3 TSX 모두 wrangler 0 호출 / `npm run deploy` 0 호출. main push 시 GitHub Actions 자동 cbc7119-preview 배포만 사용.

29-extinguisher-public 특화 2건:

11. **종이 양식 색 hex 8종 보존 룰** (`feedback_tsx_wave_stat_card_drift` 일반화) — `#c00` / `#FFD700` / `#fff` / `#000` / `#f0ede5` / `#333` / `#999` / `#bbb` 모두 인쇄용 의도된 색. design-system 토큰과 무관. **1 byte 변경 금지**. W3 TSX 변환 시 Tailwind arbitrary `bg-[#c00]` / `text-[#FFD700]` 등 직접 사용 또는 인라인 style 보존 (전체 토큰화 강제 X — 종이 양식 시각 일관성이 토큰화보다 우선). 28-splash 비즈 anchor 16건 1 byte 변경 0 패턴 일반화 + 15-daily-report SW3 portraitPos 좌표 시스템 precedent 결합.

12. **WebkitUserSelect/userSelect/WebkitTouchCallout 비즈 보존 + @media print 글로벌 영향** (`feedback_design_changes_ask_first` 일반화) — 사용자 텍스트 선택/롱탭 메뉴 비활성화 비즈. 인쇄/스크린샷 시도 시 한국어 IME 메뉴 노출 방지. **변경 금지**. 추가로 `cha-bio-safety/src/index.css` 글로벌 `@media print` 룰 (line 95~124 — `data-no-print` / `data-print-only` / `@page` / `-webkit-print-color-adjust: exact`) 이 본 페이지 인쇄 시 #c00 빨강 헤더+푸터 배경 색 보존에 의존. **글로벌 @media print 룰 변경 금지** (다른 페이지에도 영향 — 본 페이지 한정 변경 시 부수 효과 폭증).

---

# §6. negative rule (이 wave 에서 금지된 것 + 후속 wave 에 전달할 금지 사항)

본 W1 wave (인덱스 작성) 금지:
- sketch HTML 생성 금지 (그건 W2)
- ExtinguisherPublicPage.tsx 코드 변경 금지 (그건 W3)
- design-system.md / tokens.css / typography.css 변경 금지 (스냅샷)
- 29-extinguisher-public.md 변경 금지 (컨텍스트 원본)
- App.tsx 변경 금지
- functions/_middleware.ts 변경 금지
- src/index.css 변경 금지 (글로벌 @media print 룰 보존)
- wrangler 명령 금지 (CLAUDE.local.md 강제)
- npm run deploy 금지 (직원 도메인 cbc7119 가는 경로)
- sketch/ 서브폴더 생성 금지 (평면 패턴 강제 — 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education 일관)
- /public/extinguisher-check.png 이미지 파일 변경 금지

후속 wave (W2 sketch + W3 TSX) 에 전달할 negative rule (총 22건):
1. 표 markup 제거 금지 — table/colgroup/thead/tbody 구조 보존
2. 빨강 헤더 #c00 + #FFD700 색 변경 금지
3. 빨강 푸터 #c00 + #fff 색 변경 금지
4. 베이지 헤더 셀 #f0ede5 색 변경 금지
5. 외곽 border #333 (2px solid) 색 변경 금지
6. 회색 셀 border #999/#bbb 색 변경 금지
7. 우측 7행 `/extinguisher-check.png` 이미지 셀 rowSpan/colSpan/markup 변경 금지
8. colgroup 비율 6/3/6/10/10/10/13/14/14/14 변경 금지
9. ROW_H = 35 변경 금지
10. WebkitUserSelect/userSelect/WebkitTouchCallout 'none' 비즈 보존
11. fontFamily "Noto Sans KR", sans-serif 토큰 치환 OQ #1 (변경 시 §7 사용자 결정)
12. 점검관리자 '석현민' 하드코딩 변경 여부 OQ #4 (§7 사용자 결정)
13. 부 점검관리자 빈 셀 처리 OQ #5 (§7 사용자 결정)
14. 콜백 번호 "031-881-7119" 비즈 보존
15. 카피 verbatim 17종 ("소 화 기 점 검 표" / "이상 발견 즉시 수리를 의뢰하십시오." / "방 재 실" / "조회 중..." / "데이터를 찾을 수 없습니다" / "조회 실패" / "네트워크 오류" / "정기점검(월1회)" / 라벨 11종 / '무'/'유' 등) verbatim 보존
16. 인라인 letterSpacing 0.15em (헤더) / lineHeight 1.4 (설치 장소) / lineHeight 1.8 (푸터) 변경 금지
17. cellSpacing={0} + cellPadding={0} + borderCollapse collapse 변경 금지
18. status 토큰 사용 금지 (인쇄 색은 status 토큰과 무관)
19. @media print 글로벌 영향 변경 금지 (src/index.css 의 line 95~124 룰 보존)
20. wrangler 금지 / npm run deploy 금지 / 직원 도메인 cbc7119 작업 금지 (CLAUDE.local.md)
21. App.tsx 미수정 (Route 정의 line 295 변경 금지)
22. functions/_middleware.ts 미수정 (public route list 변경 금지)

---

# §7. open questions (사용자 컨펌 대기, W2 진입 직전)

**OQ #1 — fontFamily "Noto Sans KR" 토큰 치환 여부**
- 현재: `fontFamily: '"Noto Sans KR", sans-serif'` 인라인 (line 146)
- design-system 기본 폰트와 일치 → Tailwind `font-sans` 클래스 또는 토큰 치환 가능
- 검토: 종이 양식 시각 일관성 vs design-system 일치
- 권장: 일관성 동일 → 치환 권장 (시각 변화 0, 코드 가독성 개선). 단 Tailwind config 의 `font-sans` 가 "Noto Sans KR" 을 첫 stack 으로 지정하는지 확인 후 결정.

**OQ #2 — page background `#fff` 토큰 치환 여부**
- 현재: `background: '#fff'` 인라인 (line 146)
- design-system: `--surface-page` 라이트 = `#ffffff` (일치)
- 검토: 종이 양식 시각 일관성 vs 토큰화
- 권장: 시각 변화 0 → 치환 안전. 단 다크 모드 사용자가 본 페이지를 다크로 표시할 가능성 0 (인쇄용) — 치환 시 자동으로 다크 적용되면 인쇄 의도 위반. **인라인 #fff 유지 권장** (또는 Tailwind arbitrary `bg-[#fff]` — 다크 모드 무관 강제).

**OQ #3 — page maxWidth 480 토큰화 여부**
- 현재: `maxWidth: 480` 인라인 (line 146)
- design-system: 명시적 maxWidth 토큰 없음 — Tailwind `max-w-md` (28rem = 448px) / `max-w-lg` (32rem = 512px) 와 불일치
- 권장: 현재 480 보존 (1 byte 변경 0 룰) → Tailwind arbitrary `max-w-[480px]` 사용 또는 인라인 유지

**OQ #4 — 점검관리자 정 "석현민" 하드코딩 동적 분기**
- 현재: line 76 `'석현민'` 하드코딩
- 검토: 방재실장이 변경되면 코드 수정 필요. 동적 분기 후보 — staff API 호출 (admin role 중 '주임' 또는 정 표시) / 환경변수 / D1 query (extinguishers 테이블의 manager 필드)
- 권장: **이번 redesign 범위 X** — sketch/TSX 변환에서 그대로 보존, 별도 quick task 로 분리 권장. 사용자 컨펌 시 §7 결정.

**OQ #5 — 부 점검관리자 빈 셀 처리**
- 현재: line 83 빈 셀 (`<td colSpan={2} style={{ ...cl, textAlign:'center' }}></td>`)
- 검토: 표 정렬상 빈 셀 그대로 두는 게 자연스러움 (현재). 또는 '-' 표시. 또는 향후 부 점검관리자 동적 분기 (OQ #4 와 연동)
- 권장: 빈 셀 유지 (현재 동작 보존) — OQ #4 동적 분기 시 함께 검토.

---

## 후속 wave 진입 체크리스트 (OQ 5건 사용자 컨펌 후)

W2 sketch atomic 진입 시 다음을 sketch HTML 에 verbatim 인용:
- §1.3 비즈 anchor 27건 박스 전체
- §3.1~§3.6 design-system 인용 + 미적용/부분 적용 메타
- §6 negative rule 22건
- §7 OQ 5건의 사용자 결정 결과 (예: OQ #1 = 치환 / OQ #2 = 유지 / OQ #3 = 유지 / OQ #4 = redesign 범위 X / OQ #5 = 유지)

W3 TSX 변환 checklist 진입 시 다음을 verify gate 강제:
- ExtinguisherPublicPage.tsx 의 비즈 anchor 27건 1 byte 변경 0 (grep + diff 검증)
- 인쇄 색 hex 8종 보존 (sketch HTML grep + TSX grep 동일 결과)
- WebkitUserSelect 등 3 속성 보존
- colgroup 비율 + ROW_H + letterSpacing/lineHeight 보존
- 카피 verbatim 17종 보존 (grep 비교)
