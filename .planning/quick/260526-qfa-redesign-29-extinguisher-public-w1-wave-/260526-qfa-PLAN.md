---
phase: quick-260526-qfa
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md
autonomous: true
requirements:
  - REDESIGN-29-WAVE1
must_haves:
  truths:
    - "wave-1-index.md 파일이 cha-bio-safety/docs/redesign-context/29-extinguisher-public/ 직속에 생성됨 (sketch/ 서브폴더 X — 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education 평면 패턴 mirror)"
    - "7개 필수 섹션(§1~§7) 모두 채워짐"
    - "인벤토리 표가 ExtinguisherPublicPage.tsx 단일 파일 149 lines 5 영역 (외곽 page 컨테이너 + table 본체 + 제목/관리자/종류/헤더 행 + 1~12월 점검 행 + 우측 안내 셀(7행 이미지/소화기번호/설치장소) + 하단 빨강 푸터) + 비즈 시그니처 박스 분리"
    - "sub-wave 분배 표가 W2 행을 포함 (149 lines 종이 양식 모방 페이지 → 단일 atomic sketch 권장 + W3 TSX 변환 checklist — 28-splash/23-education 단일 atomic 패턴 mirror, 10-cctv-info 69 lines 단일 sketch precedent 참고)"
    - "design-system.md §1.1/§1.2/§1.3 인용이 fence 안 verbatim 으로 포함 (§6/§7 은 미적용 또는 부분 적용 1줄 메타 동반 — 종이 양식 모방 페이지라 토큰화 범위 좁음)"
    - "메모리 룰 12개 inline 인용 (10건 + 29-extinguisher-public 특화 2건 — 종이 양식 색 #c00/#FFD700/#f0ede5 보존 룰 + WebkitUserSelect 비즈 보존 + 인쇄 친화 @media print 글로벌 영향 박제)"
    - "negative rule 섹션이 표 markup 제거 금지 / 빨강 헤더+푸터 #c00 색 변경 금지 / 황금 헤더 텍스트 #FFD700 변경 금지 / 베이지 헤더 셀 #f0ede5 변경 금지 / 우측 7행 /extinguisher-check.png 이미지 셀 markup 변경 금지 / WebkitUserSelect 비즈 보존 / wrangler 금지 / npm run deploy 금지 / 평면 폴더 / App.tsx 미수정 / 점검관리자 하드코딩 '석현민' 변경 여부 OQ / 콜백 번호 '031-881-7119' 비즈 보존 / 부 점검관리자 빈 셀 처리 OQ 12건 포함"
    - "OQ 4~5건이 §7 에 정리됨 (페이지 컨테이너 maxWidth 480 토큰화 여부 / 페이지 background #fff 토큰화 여부 / fontFamily Noto Sans KR 토큰 치환 / 점검관리자 하드코딩 '석현민' 동적 분기 여부 / 부 점검관리자 빈 셀 처리)"
    - "ExtinguisherPublicPage.tsx + 외부 의존 코드 변경 0"
    - "/e/:checkpointId (public route) 가 App.tsx 실측 — Auth wrapper 미감싸기 + 인증 없음 + 미들웨어 public route + chrome 룰 미적용 결과 §4 에 박제"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md"
      provides: "W2 (sketch atomic) + W3 (TSX 변환) 진입을 위한 단일 진입점 인덱스 + 룰 verbatim 인용 + sub-wave 분배 매핑 (ExtinguisherPublicPage 149 lines 종이 양식 모방 인증 전 페이지용 1~2 sub-wave 분배)"
      contains: "§1. ExtinguisherPublicPage 인벤토리, §2. 1~2 sub-wave 분배, §3. design-system §1.1/§1.2/§1.3 verbatim + §6/§7 미적용 메타, §4. chrome 통일 룰 (인증 전 public 페이지 = chrome 룰 직접 적용 X + App.tsx 실측 박제), §5. 메모리 룰 12개 inline, §6. negative rule, §7. open questions"
  key_links:
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx"
      via: "§1 인벤토리에 line 범위 인용 + §2 sub-wave 분배 표의 element/line 매핑"
      pattern: "line [0-9]+"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/29-extinguisher-public/design-system.md"
      via: "§3 fence verbatim 인용 (§1.1/§1.2/§1.3 본문 박제 + §6/§7 미적용/부분 적용 1줄 메타)"
      pattern: "design-system.md §"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md"
      via: "§4 chrome 룰 (인증 전 public 페이지 → chrome 룰 직접 적용 X + 28-splash 인증 전 precedent mirror 1단락)"
      pattern: "inspection-modal-chrome-rules"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/App.tsx"
      via: "§4 Auth wrapper 미감싸기 실측 — /e/:checkpointId route 가 Auth wrapper 외부에 정의 + functions/_middleware.ts public route 등재"
      pattern: "/e/:checkpointId|ExtinguisherPublic|Auth"
---

<objective>
redesign/29-extinguisher-public sketch 작업의 wave 1 — 후속 wave(W2 sketch + W3 TSX 변환) 의 단일 진입점이 되는 인덱스/룰 정리 문서 1개만 작성한다.

Purpose: ExtinguisherPublicPage.tsx (149 lines — 인증 없이 접근 가능 `/e/:checkpointId` public route 소화기 점검표 종이 양식 모방 페이지) 단일 파일의 모든 element 를 **1~2 sub-wave** 로 분배 (10-cctv-info 69 lines 단일 sketch precedent + 28-splash + 23-education 통합 atomic 패턴 검토), 그리고 design-system.md §1.1/§1.2/§1.3 룰 (§6/§7 은 토큰화 범위 좁음 — 미적용/부분 적용 1줄 메타 동반) 과 메모리 룰 12개 (10 기본 + 29-extinguisher-public 특화 2건 — 종이 양식 색 hex 보존 룰 + WebkitUserSelect 비즈 보존 + @media print 글로벌 영향 박제) 를 verbatim 박제해서 후속 sketch wave 작업자가 이 인덱스만 보면 일관되게 작업할 수 있도록 한다.

Output: `cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md` 단 1개 파일. 코드 변경 0건. sketch HTML 생성 0건 (그건 W2 부터).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./CLAUDE.local.md

# 28-splash W1 + 23-education W1 precedent (이번 wave 가 mirror 할 정확한 7 섹션 + sub-wave 구조 — 단 sub-wave 갯수는 페이지 규모/특수성에 맞춰 1~2로 축소)
@.planning/quick/260522-209-redesign-28-splash-sketch-wave-1-splashs/260522-209-PLAN.md
@.planning/quick/260522-gmp-redesign-23-education-w1/260522-gmp-PLAN.md

# 28-splash W1 + 23-education W1 산출물 (가장 최근 7섹션 mirror + 12 메모리 룰 패턴 가장 최근 origin)
@cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md
@cha-bio-safety/docs/redesign-context/23-education/wave-1-index.md

# 10-cctv-info 69 lines 단일 sketch precedent (페이지 규모/단순성 mirror — 종이 양식 모방 페이지 단일 sketch 패턴)
@cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html

# Source file (이 wave 의 분석 대상, 수정 0)
@cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx

# Redesign context (이 wave 가 산출할 인덱스가 인용/참조하는 문서들)
@cha-bio-safety/docs/redesign-context/29-extinguisher-public/29-extinguisher-public.md
@cha-bio-safety/docs/redesign-context/29-extinguisher-public/design-system.md
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md

# App.tsx 실측 (chrome 등록 여부 + Auth wrapper 적용 여부)
@cha-bio-safety/src/App.tsx

# functions middleware (public route 등재 실측)
@cha-bio-safety/functions/_middleware.ts

# 평면 sibling 패턴 일관 — 본 wave 도 동일.
</context>

<interfaces>
<!-- 후속 wave 가 산출할 sketch 파일 명명 규칙 (이 인덱스가 §2 표에서 인용) -->
<!-- 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan + 28-splash + 23-education 평면 패턴 일관 — 29-extinguisher-public/ 직속에 위치 -->

# 권장 분배 (149 lines 종이 양식 모방 페이지 → 단일 atomic sketch + TSX checklist)
W2 → cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html  (전체 1 sketch — 외곽 컨테이너 + table 본체 + 제목/관리자/종류/헤더 행 + 1~12월 행 + 우측 7행 안내 셀 + 하단 빨강 푸터 모두 단일 HTML)
W3 → cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-3-tsx-conversion-checklist.md  (markdown, sketch 아님 — TSX 교체본 checklist + verify gate)

# 대안: §2 에서 W2 단일 통합 vs W2+W3 분할 (예: 외곽+표 vs 우측 안내 셀+푸터) 권장안과 근거 비교 — 페이지 분석 후 결정.
# 10-cctv-info (69 lines) 가 단일 sketch precedent. 28-splash/23-education 의 4-wave 분할은 통합 320~591 lines 규모. 29-extinguisher-public 149 lines 는 10-cctv-info 와 28-splash 의 중간 — sketch 자체는 단일 atomic 권장이 자연.

# 비즈 로직 시그니처 (W3 TSX 보존 checklist 의 anchor — 이 인덱스가 §1 + §6 에서 인용)

## ExtinguisherPublicPage.tsx (line 1~149)
- 인터페이스 3종 (CheckRecord, CheckpointInfo, ExtInfo) (line 4~6)
- export default function ExtinguisherPublicPage() (line 8)
- useParams<{ checkpointId: string }>() (line 9)
- useState 5종 — cp / ext / records / loading / error (line 10~14)
- useEffect (line 16~26): fetch `/api/public/extinguisher/${encodeURIComponent(checkpointId)}` → setCp/setExt/setRecords or setError → finally setLoading(false)
- year + yearShort 계산 (line 28~29): `new Date().getFullYear()` / `year % 100`
- byMonth 그룹핑 (line 31~37): records 를 월별로 그룹화하고 각 월의 가장 최근 점검만 유지 (year 일치 필터 후 max checked_at)
- months 배열 (line 42): `Array.from({ length: 12 }, (_, i) => i + 1)` — 1~12월
- typeText (line 43): `ext?.type ?? '-'`
- ROW_H 상수 (line 44): 35 (고정 행 높이, 이미지 230px / 7행 + 패딩)
- 우측 셀 분기 (line 103~118): i === 0 → 7행 rowSpan 이미지 셀 / i === 7 → '소화기번호' 라벨 / i === 8 → mgmtNo / i === 9 → '설 치 장 소' 라벨 / i === 10 → 2행 rowSpan location

## 인쇄 모방 색/스타일 (보존 필수, 1 byte 변경 금지)
- 빨강 헤더 background `#c00` + color `#FFD700` ("소 화 기 점 검 표", line 63)
- 빨강 푸터 background `#c00` + color `#fff` ("이상 발견 즉시 수리를 의뢰하십시오." + "방 재 실 031-881-7119", line 135)
- 베이지 헤더 셀 background `#f0ede5` (`th` 객체 + 헤더 행 inline, line 87, 148)
- 검정 표 외곽 border `2px solid #333`
- 회색 셀 border `1px solid #999` (th) / `1px solid #bbb` (cl)
- WebkitUserSelect 'none' + userSelect 'none' + WebkitTouchCallout 'none' (line 146) — 텍스트 선택 비활성화
- fontFamily `"Noto Sans KR", sans-serif` (line 146) — 페이지 외곽 정의
- 점검관리자 정 = "석현민" 하드코딩 (line 76) — OQ 후보
- 부 점검관리자 = 빈 셀 (line 83) — OQ 후보
- 콜백 번호 = "031-881-7119" (line 137, 방재실)
- 우측 이미지 = "/extinguisher-check.png" 정기점검(월1회) 안내 (line 107)
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: wave-1-index.md 작성</name>
  <files>cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md</files>
  <action>
ExtinguisherPublicPage.tsx (149 lines) + 29-extinguisher-public.md + design-system.md + inspection-modal-chrome-rules.md + App.tsx (관련 라인) + functions/_middleware.ts (public route 등재) 를 모두 끝까지 읽은 뒤 아래 7개 섹션을 가진 단일 markdown 파일을 작성한다. 파일은 **Write 도구로 생성** (heredoc/cat 금지).

먼저 정확한 line 수를 실측하라:
```bash
wc -l cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
```
결과가 149 와 다르면 인덱스 §1.2 에 실측치로 박제 (drift 명시).

---

# 파일 헤더 (frontmatter)

YAML frontmatter 1블록:
- `title`: "redesign/29-extinguisher-public — sketch wave 1 (index)"
- `status`: ready_for_oq
- `created`: 2026-05-26
- `quick_id`: 260526-qfa
- `branch`: redesign/29-extinguisher-public
- `source_tsx`: cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx
- `source_tsx_lines`: 149  (실측 후 보정)
- `design_system`: cha-bio-safety/docs/redesign-context/29-extinguisher-public/design-system.md (v0.1.1)
- `chrome_rules`: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (인증 전 public 페이지 = 점검 시리즈 아님 — 직접 적용 X, 28-splash 인증 전 precedent mirror 만)
- `mirror_of`: cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) + cha-bio-safety/docs/redesign-context/23-education/wave-1-index.md (260522-gmp) — 7 섹션 구조 mirror, sub-wave 갯수는 페이지 규모(149 lines)에 맞춰 1~2 로 축소
- `precedent_short_page`: cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html (69 lines 단일 sketch precedent — 종이 양식/단순 페이지 단일 atomic 패턴 origin)
- `biz_anchor_precedent`: cha-bio-safety/docs/redesign-context/28-splash/wave-1-index.md (260522-209) — 비즈 anchor 16건 1 byte 변경 0 패턴 일반화
- `sub_wave_count`: 2 (W2 sketch atomic + W3 TSX checklist) — 권장
- `memory_rules_inline`: 12 (10 기본 + 종이 양식 색 hex 보존 룰 일반화 + WebkitUserSelect 비즈 보존 + @media print 글로벌 영향)
- `open_questions`: 4~5

---

# 파일 본문 헤더 (frontmatter 다음)

상단에 다음 1블록:
- 제목: `# redesign/29-extinguisher-public — sketch wave 1 (index)`
- 1-2줄 설명: 본 문서는 W2~W3 진입의 단일 진입점이며, 이 인덱스만 봐도 후속 wave 가 디자인 룰 / 메모리 룰 / sub-wave 분배 / OQ 를 알 수 있도록 한다.
- 산출일자: 2026-05-26 / Quick ID 260526-qfa / branch redesign/29-extinguisher-public
- 1줄 메타: "28-splash W1 (260522-209) + 23-education W1 (260522-gmp) 의 7 섹션 구조를 mirror. ExtinguisherPublicPage 149 lines 인증 없는 public route (`/e/:checkpointId`) 소화기 점검표 종이 양식 모방 페이지. **이 페이지는 디자인 토큰 적용 범위가 좁다** — 페이지 외곽 컨테이너 (maxWidth/padding/배경)만 토큰화 후보, 표 자체는 종이 양식 그대로 유지 (29-extinguisher-public.md 섹션 4 명시). 10-cctv-info 69 lines 단일 sketch precedent + 28-splash/23-education 의 통합 atomic 패턴 둘 다 reference. sub-wave 권장 = W2 sketch 단일 atomic + W3 TSX 변환 checklist."

---

# §1. ExtinguisherPublicPage.tsx 인벤토리

5 영역으로 나눠 표로 정리. 각 행은 (영역 / element / source file:line 범위 / 역할 / 비즈 로직 연결 / 후속 wave 매핑) 6 컬럼.

**29-extinguisher-public 의 구조 특이성** (인벤토리 머리말 1단락):
- **종이 양식 모방 페이지** — 29-extinguisher-public.md 섹션 4 "이 페이지는 종이 인쇄 양식을 모방하는 게 목적. 디자인 시스템을 강하게 적용하지 말 것. 흰 배경/검정 텍스트/빨강 헤더는 인쇄용 의도된 색 — 변경 금지. 토큰화는 페이지 외곽(혹시 모바일에서 화면으로 볼 때 컨테이너 폭/패딩)만 적용. 표 자체는 단순 HTML 그대로 유지." verbatim 인용.
- **149 lines 단일 파일** — 28-splash 통합 320 lines + 23-education 591 lines + 16-workshift 226 lines 보다 작음. 10-cctv-info 69 lines 보다 큼. **sub-wave 분할이 자연스럽지 않음** → W2 단일 atomic sketch 권장.
- **인증 없음 public route** — App.tsx 에서 `<Auth>` 외부에 Route 정의. functions/_middleware.ts 의 `/api/public/*` public route 매칭. /e/:checkpointId 형태. **chrome 룰 직접 적용 X** (28-splash 인증 전 스플래시와 유사하지만 다른 패턴 — 스플래시는 timer 후 navigate, 이건 영구 페이지).
- **WebkitUserSelect 'none'** (line 146) — 텍스트 선택/롱탭 메뉴 비활성화 비즈. **보존 필수** (변경 시 인쇄/스크린샷 캡처 시도 시 한국어 IME 메뉴 노출됨 — 사용자 의도 위반).
- **인라인 style 객체 3종 + cellSpacing/cellPadding 0** — `page` (line 146) / `tbl` (line 147) / `th` (line 148) / `cl` (line 149) 4 객체 + table props `cellSpacing={0} cellPadding={0}` (line 48) 인라인. **종이 양식 모방의 시각 정확도** 가 토큰화 우선순위보다 높음 — 변환 시 1 byte 픽셀 변경 0 룰 적용 (15-daily-report SW3 portraitPos precedent 일반화).
- **인쇄 색 보존 hex 5종** — `#c00` (빨강 헤더+푸터 배경) / `#FFD700` (황금 헤더 텍스트) / `#fff` (흰 배경 + 푸터 텍스트) / `#000` (검정 본문) / `#f0ede5` (베이지 셀 배경) / `#333` (검정 외곽 border) / `#999` (회색 셀 border th) / `#bbb` (회색 셀 border cl) / `#999` (월/일 회색 sep). 모두 design-system 토큰과 무관한 인쇄용 의도된 색 — **1 byte 변경 금지**.
- **하드코딩 사용자명 1건** — line 76 점검관리자 정 = "석현민". 동적 분기 OQ 후보 (예: 방재실장 staff API 호출 / 환경변수 / D1 query). 부 점검관리자는 빈 셀.
- **/extinguisher-check.png 이미지 의존** (line 107) — `/public/` 폴더 정적 자산. 변경 0, 표 우측 7행 rowSpan rowH*7 = 245px 정기점검 안내 PNG. **이미지 파일 자체 변경 금지**.
- **콜백 번호 verbatim** — "031-881-7119" (line 137, 방재실) 변경 금지.
- **모바일 전용** — maxWidth 480 (line 146) 컨테이너로 PC 1920x1080 에서도 모바일 폭 유지. 데스크톱 분기 없음. 인쇄 시 A4 종이에도 맞도록 표 폭 100%.

**영역 1: 인터페이스 + state + 데이터 fetch** (line 1~26)
- imports (line 1~2): useEffect / useState (react) + useParams (react-router-dom)
- 인터페이스 3종 (line 4~6): CheckRecord / CheckpointInfo / ExtInfo — 비즈 데이터 모양 (변경 금지, API 응답 shape)
- function 시그니처 (line 8): `export default function ExtinguisherPublicPage()`
- useParams (line 9): `<{ checkpointId: string }>`
- useState × 5 (line 10~14): cp (CheckpointInfo|null) / ext (ExtInfo|null) / records (CheckRecord[]) / loading (true 시작) / error (string|null)
- useEffect (line 16~26): fetch `/api/public/extinguisher/${encodeURIComponent(checkpointId)}` → json.success 분기 → setCp/setExt/setRecords 또는 setError → catch `'네트워크 오류'` → finally setLoading(false). 의존성 [checkpointId].
- 비즈: API 시그니처 + 인터페이스 shape + state 5종 변경 금지
- 후속 wave: **W2** (loading/error/cp null 3 state 표시 — 단 빈 표는 cp 있어도 records 0 이면 모든 월 빈 셀)

**영역 2: 계산 + 그룹핑 + 가드** (line 28~44)
- year + yearShort 계산 (line 28~29): `new Date().getFullYear()` / `year % 100`
- byMonth 그룹핑 (line 31~37): records 를 월별로 그룹화, year 일치 필터 후 max checked_at 만 유지
- loading 가드 (line 39): page + `'조회 중...'` (textAlign center padding 40 color #333 fontSize 14)
- error or !cp 가드 (line 40): page + `error ?? '데이터를 찾을 수 없습니다'` (동일 스타일)
- months (line 42): 1~12 배열
- typeText (line 43): `ext?.type ?? '-'`
- ROW_H (line 44): 35 (이미지 230px / 7행 + 패딩)
- 비즈: byMonth 룰 + ROW_H + year 분기 변경 금지
- 후속 wave: **W2** (loading/error 두 가드 카피 verbatim + ROW_H 시각화)

**영역 3: 외곽 page 컨테이너 + table + colgroup** (line 46~60, 146~149)
- page (line 46~47, 146): maxWidth 480 / margin '0 auto' / padding '8px 8px 8px' / fontFamily Noto Sans KR / background `#fff` / color `#000` / fontWeight 700 / WebkitUserSelect none / userSelect none / WebkitTouchCallout none — 사용자 텍스트 선택/롱탭 메뉴 차단
- table (line 48, 147): cellSpacing 0 / cellPadding 0 / width 100% / borderCollapse collapse / border `2px solid #333` / fontSize 12 / color #000 / fontWeight 700
- colgroup (line 49~60): 10 col — 월 6% / `/` 3% / 일 6% / 점검자1 10% / 점검자2 10% / 이상유무 10% / 서명 13% / 점검사항1 14% / 점검사항2 14% / 점검사항3 14% (합 100%)
- 비즈: colgroup 비율 변경 = 인쇄 시 표 폭 깨짐 — **1 byte 변경 금지**
- 후속 wave: **W2** (외곽 + table colgroup 시각화)

**영역 4: 제목 thead + 관리자/종류 행 + 헤더 행** (line 62~94)
- thead 제목 (line 62~66): colSpan 10 / background #c00 / color #FFD700 / textAlign center / fontSize 18 / fontWeight 900 / padding '10px 0' / letterSpacing 0.15em / border `2px solid #333` — "소 화 기 점 검 표" (공백 verbatim)
- 년도 행 (line 70~77): th '년 도' colSpan 3 + cl yearShort textAlign right + cl '년' textAlign left + th '점검관리자' rowSpan 2 colSpan 2 + th '정' + cl colSpan 2 '석현민'
- 종류 행 (line 79~84): th '종 료' colSpan 3 + cl typeText colSpan 2 + th '부' + cl colSpan 2 (빈 셀)
- 헤더 행 (line 87~94): background `#f0ede5` / th '월' + '/' + '일' + 점검자성명 colSpan 2 + 이상유무/서명 colSpan 2 + 점검사항 colSpan 3
- 비즈: 라벨 verbatim ('년 도' / '종 료' / '점검관리자' / '정' / '부' / '월' / '/' / '일' / '점검자성명' / '이상유무/서명' / '점검사항') + '석현민' 하드코딩 (OQ 후보) + '/' 폰트 #999 색 / 폭 8px
- 후속 wave: **W2**

**영역 5: 1~12월 점검 행 + 우측 안내 셀 (rowSpan) + 하단 푸터** (line 96~141)
- months.map (line 97~131): 12 행 각각 rec = byMonth[m] / day / name / status ('무' if normal else '유' if rec else '')
- 우측 셀 분기 (line 103~118):
  - i === 0 → rowSpan 7 + colSpan 3 + img `/extinguisher-check.png` (alt "정기점검(월1회)") + height ROW_H*7 / objectFit fill / borderLeft `2px solid #333`
  - i === 7 → th '소화기번호' (fontSize 10 height ROW_H)
  - i === 8 → cl `ext?.mgmtNo ?? cp.locationNo ?? '-'`
  - i === 9 → th '설 치 장 소' (fontSize 10)
  - i === 10 → rowSpan 2 cl `ext?.location ?? cp.location` (lineHeight 1.4 verticalAlign middle)
  - i === 1~6, 11 → null (rowSpan 으로 셀 차지)
- 좌측 6 셀 (line 121~127): 월 m / `/` separator (color #999 폰트 padding 0 width 8) / 일 day / 점검자 colSpan 2 name / 이상유무 status / 서명 name (모두 textAlign center height ROW_H)
- 하단 푸터 행 (line 134~139): colSpan 10 / background #c00 / color #fff / textAlign center / fontSize 11 / fontWeight 700 / padding '8px 6px' / lineHeight 1.8 / border `2px solid #333` — "이상 발견 즉시 수리를 의뢰하십시오." + br + "방 재 실 &nbsp;&nbsp;&nbsp; 031-881-7119" (fontSize 10)
- 비즈: 우측 분기 인덱스 (0, 7, 8, 9, 10) + ROW_H*7 = 245 이미지 셀 높이 + '무'/'유' 분기 + status 카피 + 푸터 카피 verbatim + 031-881-7119
- 후속 wave: **W2** (전체 표 단일 atomic sketch)

---

## §1.1 영역별 인벤토리 표

`| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |` 마크다운 표로 위 5 영역 모든 element 를 표 row 로 박제. 23-education W1 표 형식 mirror (~25~30 rows 예상).

## §1.2 line 수 실측 확인

`wc -l cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx` 결과 fence 인용. drift 시 인덱스 본문에 보정 명시.

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W3 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (28-splash W1 의 비즈 anchor 16건 보존 룰 일반화 + 15-daily-report SW3 portraitPos 좌표 시스템 precedent 일반화):

```
[ExtinguisherPublicPage.tsx — react-router / state / fetch]
- useParams<{ checkpointId: string }>()                                                   (변경 금지)
- useState × 5 — cp / ext / records / loading / error                                     (각 state 초기값 변경 금지)
- fetch `/api/public/extinguisher/${encodeURIComponent(checkpointId)}`                    (API path 변경 금지)
- json.success 분기 → setCp(json.data.checkpoint) / setExt(json.data.extinguisher)        (응답 shape 변경 금지)
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

[ExtinguisherPublicPage.tsx — 인쇄 색 hex (8종) + 폰트/속성]
- background #c00 (헤더 + 푸터)                                                           (1 byte 변경 금지)
- color #FFD700 (헤더 텍스트 "소 화 기 점 검 표")                                          (1 byte 변경 금지)
- color #fff (푸터 텍스트 + page background)                                              (1 byte 변경 금지)
- background #f0ede5 (베이지 헤더 셀)                                                     (1 byte 변경 금지)
- border #333 (외곽 + thead + 우측 분리)                                                  (1 byte 변경 금지)
- border #999 (th 셀 + '/' 폰트)                                                          (1 byte 변경 금지)
- border #bbb (cl 셀)                                                                     (1 byte 변경 금지)
- color #000 (본문)                                                                       (1 byte 변경 금지)
- fontFamily "Noto Sans KR", sans-serif                                                   (1 byte 변경 금지 — OQ 토큰 치환)
- fontWeight 700 (페이지 전역)                                                            (1 byte 변경 금지)
- WebkitUserSelect 'none' + userSelect 'none' + WebkitTouchCallout 'none'                 (비즈 보존)

[ExtinguisherPublicPage.tsx — 라벨/카피 verbatim]
- "소 화 기 점 검 표" (공백 포함)                                                          (1 byte 변경 금지)
- "년 도" / "종 료" / "점검관리자" / "정" / "부"                                            (verbatim — 공백 포함)
- "월" / "/" / "일" / "점검자성명" / "이상유무/서명" / "점검사항"                          (verbatim)
- "소화기번호" / "설 치 장 소"                                                             (verbatim — '설 치 장 소' 공백)
- "무" / "유"                                                                              (status 라벨)
- "이상 발견 즉시 수리를 의뢰하십시오."                                                    (verbatim)
- "방 재 실     031-881-7119" (&nbsp; × 3)                                  (1 byte 변경 금지)
- "조회 중..."                                                                             (loading)
- "데이터를 찾을 수 없습니다"                                                              (error fallback)
- "네트워크 오류"                                                                          (catch fallback)
- "석현민"                                                                                 (점검관리자 정 — OQ 후보)
- "/extinguisher-check.png"                                                                (이미지 path verbatim)

[ExtinguisherPublicPage.tsx — colgroup 비율]
- 6 / 3 / 6 / 10 / 10 / 10 / 13 / 14 / 14 / 14 (% 합 100)                                  (1% 변경 금지 — 인쇄 폭 깨짐)
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

§3.1 — design-system.md §1.1 (노안 친화) verbatim fence 인용

§3.2 — design-system.md §1.2 (정보 인지 > 미적 정제) verbatim fence 인용

§3.3 — design-system.md §1.3 (모바일/데스크톱 같은 시스템 다른 밀도) verbatim fence 인용

§3.4 — design-system.md §6 (시각 규칙 확장) — **미적용/부분 적용 1줄 메타**:
> ⚠ §6 Progress Color Rule / Stat Card / 카테고리 카드 / Backgrounds & Gradients / Hover / Animation / Shadows / Layout Rules / Transparency / Imagery 모두 **이 페이지에서 미적용** — 종이 양식 모방 목적, 색 #c00/#FFD700/#f0ede5/#333/#999/#bbb 모두 인쇄용 의도된 색 보존 우선. 단 §6.4 Backgrounds (페이지 외곽 컨테이너 배경) 토큰 치환 OQ #2 검토 가능.

§3.5 — design-system.md §7 (Iconography) — **미적용 1줄 메타**:
> ⚠ §7 Lucide + 커스텀 SVG 아이콘 모두 **이 페이지에서 미적용** — 이 페이지에 아이콘 없음. `/extinguisher-check.png` 정적 이미지만 사용. §7.1 Lucide 룰 / §7.6 커스텀 SVG 모두 무관.

§3.6 — design-system.md §2.7 Typography — **부분 적용 메타**:
> ⚠ §2.7 text-* 클래스는 종이 양식 폰트 크기 (10/11/12/18) 와 매핑 어려움 — 10px 은 §2.7 최소 (text-caption 12) 미만. 인쇄 시각 일관성 우선 → §2.7 미적용. fontFamily "Noto Sans KR" 은 §2.7 의 design-system 기본 폰트와 일치.

---

# §4. chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` 의 02 InspectionPage + 06 FloorPlanPage chrome 룰은 **점검 시리즈 페이지에 적용** (모달 chrome / 헤더 / 뒤로가기 / 푸터 액션 통일). 

**29-extinguisher-public 적용 여부:** **직접 적용 X**.
- 점검 시리즈 아님 — 공개 조회용 종이 양식 페이지.
- 인증 없음 — App.tsx 의 `<Auth>` wrapper 외부에 Route 정의 (실측 박제 — `cha-bio-safety/src/App.tsx` 에서 `/e/:checkpointId` 또는 `ExtinguisherPublicPage` 임포트/Route 위치 확인 후 line 번호 박제).
- functions/_middleware.ts public route 매칭 — `/api/public/*` 패턴 (실측 박제 — middleware 파일에서 public path list 확인).
- BottomNav 미노출 / SideMenu 미노출 / 글로벌 AppHeader 미노출 — 인증 전 페이지 + maxWidth 480 모바일 폭 컨테이너만 표시.
- chrome 룰 미적용 결과 — 페이지가 종이 양식 그 자체. 헤더/푸터는 페이지 내부의 표 thead/tfoot 가 대신.

**28-splash 인증 전 precedent mirror:** 28-splash 도 인증 전 `/` route 였지만 chrome 룰 직접 적용 X. 본 페이지도 동일 패턴. 단 28-splash 는 timer 후 navigate, 본 페이지는 영구 페이지 (R/F 5)이므로 영구 인증 전 표시 패턴.

`/e/:checkpointId` App.tsx 실측 결과는 다음 형식으로 §4 박제 (실측 후 line 번호 보정):
- App.tsx 의 Route 정의 line 박제 (lazy import 또는 직접 import 위치)
- `<Auth>` wrapper 외부 위치 확인 (line 박제)
- `MOBILE_NO_NAV_PATHS` / `DESKTOP_NO_NAV_PATHS` 등재 여부 — 일반적으로 wildcard `/e/*` 또는 patternMatch 가 필요. 실측해서 등재 여부 박제 (등재 X 면 그래도 BottomNav 가 안 보이는 이유는 인증 없어 Auth wrapper 자체가 미감싸기 때문).
- functions/_middleware.ts 에서 `/api/public/extinguisher/` 가 public route list 에 등재되어 있는지 line 박제.

---

# §5. 메모리 룰 inline 인용 (12건)

기본 10건 (28-splash + 23-education W1 mirror):
1. `feedback_tsx_wave_emoji_dot_gap` — sketch 의 이모지 0 verify gate. (29-extinguisher-public 의 이모지는 0 — 종이 양식)
2. `feedback_tsx_wave_stat_card_drift` — sketch verbatim 인용 + verify gate. (인쇄 색 hex 8종 verbatim 인용)
3. `feedback_planner_prompt_sketch_verbatim` — sketch CSS verbatim 인용 grep 으로 추출.
4. `feedback_redesign_sketch_rule_enforcement` — design-system §6.2 negative rule 강제.
5. `feedback_design_changes_ask_first` — 디자인 변경 전 사용자 컨펌 필수.
6. `feedback_sketch_realistic_data` — 시안 표시 분기/라벨 룰은 코드 그대로 (점검관리자 '석현민' 하드코딩은 sketch 에 그대로 표시 — 변경 OQ 만 §7 에 정리).
7. `feedback_tailwind_token_class_pattern` — status- prefix 없음 + lucide size prop. (본 페이지 미적용 — Tailwind 토큰 미적용 페이지)
8. `feedback_tailwind_w8_h8_is_48px` — w-8 = 48px 함정. (본 페이지 미적용 — Tailwind 미적용)
9. `feedback_check_branch_before_edit` — main 단일 trunk 룰 + 작업 시작 전 brunch 확인.
10. `project_cbc7119_design_repo` + `reference_cbc7119_domain` + `feedback_cbc7119_design_never_wrangler` — 디자인 워크트리에서 wrangler 명령 금지 + 직원 도메인 cbc7119 작업 절대 X (CLAUDE.local.md 강제).

29-extinguisher-public 특화 2건:
11. **종이 양식 색 hex 8종 보존 룰** (`feedback_tsx_wave_stat_card_drift` 일반화) — `#c00` / `#FFD700` / `#fff` / `#000` / `#f0ede5` / `#333` / `#999` / `#bbb` 모두 인쇄용 의도된 색. design-system 토큰과 무관. **1 byte 변경 금지**. W3 TSX 변환 시 Tailwind arbitrary `bg-[#c00]` / `text-[#FFD700]` 등 직접 사용 또는 인라인 style 보존 (전체 토큰화 강제 X — 종이 양식 시각 일관성이 토큰화보다 우선).
12. **WebkitUserSelect/userSelect/WebkitTouchCallout 비즈 보존** (`feedback_design_changes_ask_first` 일반화) — 사용자 텍스트 선택/롱탭 메뉴 비활성화. 인쇄/스크린샷 시도 시 한국어 IME 메뉴 노출 방지. **변경 금지**. + `@media print` 인쇄 친화 글로벌 영향 박제 (현재 인라인 페이지에는 직접 사용 없으나 cha-bio-safety/src/index.css 글로벌 @media print 규칙이 본 페이지 fontSize/border/색에 영향 가능 — 실측 후 W3 verify 에 포함).

---

# §6. negative rule (이 wave 에서 금지된 것 + 후속 wave 에 전달할 금지 사항)

본 W1 wave (인덱스 작성) 금지:
- sketch HTML 생성 금지 (그건 W2)
- ExtinguisherPublicPage.tsx 코드 변경 금지 (그건 W3)
- design-system.md / tokens.css / typography.css 변경 금지 (스냅샷)
- 29-extinguisher-public.md 변경 금지 (컨텍스트 원본)
- App.tsx 변경 금지
- functions/_middleware.ts 변경 금지
- wrangler 명령 금지 (CLAUDE.local.md 강제)
- npm run deploy 금지 (직원 도메인 cbc7119 가는 경로)
- sketch/ 서브폴더 생성 금지 (평면 패턴 강제)

후속 wave (W2 sketch + W3 TSX) 에 전달할 negative rule (총 12+ 건):
- 표 markup 제거 금지 — table/colgroup/thead/tbody 구조 보존
- 빨강 헤더 #c00 + #FFD700 색 변경 금지
- 빨강 푸터 #c00 + #fff 색 변경 금지
- 베이지 헤더 셀 #f0ede5 색 변경 금지
- 외곽 border #333 색 변경 금지
- 회색 셀 border #999/#bbb 색 변경 금지
- 우측 7행 `/extinguisher-check.png` 이미지 셀 rowSpan/colSpan/markup 변경 금지
- colgroup 비율 6/3/6/10/10/10/13/14/14/14 변경 금지
- ROW_H = 35 변경 금지
- WebkitUserSelect/userSelect/WebkitTouchCallout 비즈 보존
- fontFamily "Noto Sans KR" 토큰 치환 OQ (변경 시 §7 사용자 결정)
- 점검관리자 '석현민' 하드코딩 변경 여부 OQ (§7 사용자 결정)
- 부 점검관리자 빈 셀 처리 OQ (§7 사용자 결정)
- 콜백 번호 "031-881-7119" 비즈 보존
- 카피 verbatim ("소 화 기 점 검 표" / "이상 발견 즉시 수리를 의뢰하십시오." / "방 재 실" / "조회 중..." / "데이터를 찾을 수 없습니다" / "네트워크 오류" / 라벨 11종 / "무"/"유" 등)
- @media print 글로벌 영향 변경 금지 (만약 cha-bio-safety/src/index.css 에 정의되어 있다면 — 실측 후 W3 verify)
- wrangler 금지 / npm run deploy 금지 / 직원 도메인 cbc7119 작업 금지 (CLAUDE.local.md)
- App.tsx 미수정 (Route 정의 변경 금지)
- functions/_middleware.ts 미수정 (public route list 변경 금지)

---

# §7. open questions (사용자 컨펌 대기, W2 진입 직전)

**OQ #1 — fontFamily "Noto Sans KR" 토큰 치환 여부**
- 현재: `fontFamily: '"Noto Sans KR", sans-serif'` 인라인 (line 146)
- design-system 기본 폰트와 일치 → Tailwind `font-sans` 클래스 또는 토큰 치환 가능
- 검토: 종이 양식 시각 일관성 vs design-system 일치
- 권장: 일관성 동일 → 치환 권장 (시각 변화 0, 코드 가독성 개선)

**OQ #2 — page background `#fff` 토큰 치환 여부**
- 현재: `background: '#fff'` 인라인 (line 146)
- design-system: `--surface-page` 라이트 = `#ffffff` (일치)
- 검토: 종이 양식 시각 일관성 vs 토큰화
- 권장: 시각 변화 0 → 치환 안전. 단 다크 모드 사용자가 본 페이지를 다크로 표시할 가능성 0 (인쇄용) — 치환 시 자동으로 다크 적용되면 인쇄 의도 위반. **인라인 #fff 유지 권장**.

**OQ #3 — page maxWidth 480 토큰화 여부**
- 현재: `maxWidth: 480` 인라인 (line 146)
- design-system: 명시적 maxWidth 토큰 없음 — Tailwind `max-w-md` (28rem = 448px) / `max-w-lg` (32rem = 512px) 와 불일치
- 권장: 현재 480 보존 (1 byte 변경 0 룰) → Tailwind arbitrary `max-w-[480px]` 사용 또는 인라인 유지

**OQ #4 — 점검관리자 정 "석현민" 하드코딩 동적 분기**
- 현재: line 76 `'석현민'` 하드코딩
- 검토: 방재실장이 변경되면 코드 수정 필요. 동적 분기 후보 — staff API 호출 (admin role 중 '주임' 또는 정 표시) / 환경변수 / D1 query (extinguishers 테이블의 manager 필드)
- 권장: **이번 redesign 범위 X** — sketch/TSX 변환에서 그대로 보존, 별도 quick task 로 분리 권장. 사용자 컨펌 시 §7 결정.

**OQ #5 — 부 점검관리자 빈 셀 처리**
- 현재: line 83 빈 셀
- 검토: 표 정렬상 빈 셀 그대로 두는 게 자연스러움 (현재). 또는 '-' 표시. 또는 향후 부 점검관리자 동적 분기 (OQ #4 와 연동)
- 권장: 빈 셀 유지 (현재 동작 보존)

---

위 7 섹션을 마크다운으로 작성한다. 표/펜스/링크/메타 모두 28-splash + 23-education W1 형식 mirror.

**작성 후 자체 verify:**
- ls 로 파일 존재 확인
- wc -l 으로 line 수 측정 (예상 ~400~500 lines — 28-splash 562 / 23-education 612 보다 적음, 페이지 규모 작음)
- grep 으로 §1~§7 헤더 7개 존재 확인
- grep 으로 비즈 anchor 27건 (위 §1.3 박스) 인용 확인
- grep 으로 negative rule 12+ 건 존재 확인
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md &amp;&amp; grep -c "^# §[1-7]\." cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md | grep -q "^7$" &amp;&amp; grep -q "ExtinguisherPublicPage.tsx" cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md &amp;&amp; grep -q "#c00" cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md &amp;&amp; grep -q "WebkitUserSelect" cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md &amp;&amp; grep -q "031-881-7119" cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md &amp;&amp; grep -q "석현민" cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md &amp;&amp; grep -q "extinguisher-check.png" cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md &amp;&amp; grep -q "ROW_H" cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md &amp;&amp; grep -q "open_questions" cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md</automated>
  </verify>
  <done>
- 단일 파일 `cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md` 생성됨
- frontmatter (title / status / created / quick_id / branch / source_tsx / source_tsx_lines / design_system / chrome_rules / mirror_of / precedent_short_page / biz_anchor_precedent / sub_wave_count / memory_rules_inline / open_questions) 모두 포함
- §1~§7 7 섹션 모두 채워짐 (각 § 헤더 존재 grep 확인)
- §1.1 인벤토리 표 행 ≥ 20 (5 영역 × 평균 4~5 element)
- §1.2 line 수 실측 박스 포함
- §1.3 비즈 시그니처 보존 anchor 27건 박스 포함 (react/state/fetch 7건 + 비즈 로직 함수 7건 + 인쇄 색 hex+폰트 11건 + 카피 verbatim 17건 + colgroup 1건)
- §3 design-system §1.1 / §1.2 / §1.3 verbatim 인용 (§6/§7 미적용 메타 + §2.7 부분 적용 메타)
- §4 chrome 룰 직접 적용 X 결과 박제 + App.tsx + functions/_middleware.ts 실측 line 번호 박제
- §5 메모리 룰 12건 inline 인용 (10 기본 + 2 특화)
- §6 negative rule 12+ 건 (W1 자체 + 후속 wave 전달)
- §7 OQ 5건 정리
- ExtinguisherPublicPage.tsx + 외부 의존 코드 변경 0 (편집 0 보장 — Read 외 사용 금지)
- sketch HTML 생성 0 (그건 W2 부터)
- wrangler 명령 0 호출 / npm run deploy 0 호출 (CLAUDE.local.md 강제)
  </done>
</task>

</tasks>

<verification>
- W1-INDEX 산출물 1개 파일 (`cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md`)
- 코드 변경 0 (`git status cha-bio-safety/src/ cha-bio-safety/functions/` 결과 modified 0 — `cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md` 만 untracked)
- sketch HTML 생성 0 (`ls cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-*.html` 결과 0)
- 평면 패턴 — `sketch/` 서브폴더 미생성 (`ls cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch/` 결과 No such file)
- wrangler 명령 0 호출 (이 wave 의 모든 Bash call 로그에 `wrangler` 토큰 0)
- npm run deploy 0 호출
- §1~§7 마크다운 헤더 7개 존재
- 비즈 anchor 27건 박스 존재
- 메모리 룰 12건 inline 인용
- OQ 4~5건 §7 정리
</verification>

<success_criteria>
- 후속 wave (W2 sketch + W3 TSX) 작업자가 이 인덱스 1개 파일만 보고 시작 가능
- design-system §1.1/§1.2/§1.3 verbatim + §6/§7 미적용 메타가 fence 안에 박제
- 비즈 anchor 27건 1 byte 변경 0 룰이 W3 verify gate 의 source of truth
- chrome 룰 직접 적용 X 결정이 §4 에 박제 (App.tsx + middleware 실측 line 번호)
- OQ 4~5건이 사용자 컨펌 진입점으로 §7 에 정리
- 메모리 룰 12건 inline 인용으로 후속 wave 의 deviation 위험 0
- ExtinguisherPublicPage + App.tsx + middleware 코드 변경 0 (sketch HTML 도 생성 0)
</success_criteria>

<output>
After completion, create `.planning/quick/260526-qfa-redesign-29-extinguisher-public-w1-wave-/260526-qfa-SUMMARY.md` summarizing:
- 산출 파일 path + line 수 + frontmatter 키 갯수
- §1.1 인벤토리 표 row 수 + §1.3 비즈 anchor 갯수
- §3 design-system 인용 § 갯수
- §4 chrome 룰 결정 (직접 적용 X 결정 + 실측 line 박제 결과)
- §5 메모리 룰 12건 inline 인용 결과
- §6 negative rule 갯수
- §7 OQ 갯수 + 핵심 OQ 1줄 요약
- 코드 변경 0 / sketch HTML 0 / wrangler 0 / npm deploy 0 verify 결과
- 다음 wave (W2 sketch atomic + W3 TSX checklist) 진입 가능 status
</output>
