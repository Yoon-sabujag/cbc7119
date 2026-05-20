---
quick_id: 260520-wkg
type: summary
mode: quick
wave: 1
status: complete
commit: 2e621a4
files_modified:
  - cha-bio-safety/src/pages/ReportsPage.tsx
tags: [redesign, 14-reports, tsx-conversion, mobile, sw2]
requirements: [REDESIGN-14-REPORTS-TSX-SW2]
---

# 260520-wkg SUMMARY — redesign/14-reports TSX SW2 (MobileReportsPage)

## 결과 한 줄

MobileReportsPage (line 316~398) 의 인라인 style 14종 영역과 iconBtn/navBtn 상수 2개를 SW1 의 14 class 마크업 + lucide ChevronLeft/Download 아이콘으로 v0.1.1 Tailwind 패턴으로 재작성. Mobile scope 격리 (line 1~2 / 4~315 / 400~ 영역 0 변경, 단 line 3 import 만 ChevronLeft 추가). atomic 1-commit (`2e621a4`).

## 1. 변환 매핑 표 (Before 인라인 style → After SW1 class)

| # | Element                       | Before (인라인 style 발췌)                                                                                                                                                                              | After (className=)                                              |
| -- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1  | 헤더 컨테이너                 | `style={{ flexShrink: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', padding: '8px 12px 9px', display: 'flex', alignItems: 'center', gap: 8 }}`                                  | `className="page-header"`                                       |
| 2  | 뒤로가기 버튼                 | `style={iconBtn}` (상수: 34x34 + radius 8 + bg3 + bd) + SVG path                                                                                                                                       | `className="back-btn"` + `<ChevronLeft size={15} />`            |
| 3  | 페이지 타이틀                 | `style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}`                                                                                                                              | `className="page-title"` (SW1 정의 fontSize 18)                 |
| 4  | 연도 페이저 컨테이너          | `style={{ display: 'flex', alignItems: 'center', gap: 2 }}`                                                                                                                                           | `className="year-pager"`                                        |
| 5  | 연도 페이저 슬롯              | `style={{ width: 24, display: 'flex', justifyContent: 'center' }}`                                                                                                                                    | `className="year-pager-slot"` (×2: prev/next)                   |
| 6  | 연도 nav 버튼                 | `style={navBtn}` (상수: 28x28 + radius 7 + bg3 + bd + fontSize 16)                                                                                                                                    | `className="year-nav-btn"` (×2: ‹/›)                            |
| 7  | 연도 라벨                     | `style={{ width: 44, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}`                                                                                                       | `className="year-label"` (SW1 정의 fontSize 14)                 |
| 8  | 본문 스크롤 컨테이너          | `style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}`                                                                                                                                        | `className="page-body"` + `style={{ flex: 1, overflowY: 'auto' }}` (scroll 책임만 인라인 유지) |
| 9  | 카드 컨테이너                 | `style={{ background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--bd)', padding: '14px', marginBottom: 10 }}`                                                                            | `className={isLoading ? 'report-card report-card--loading' : 'report-card'}` (radius 12 SW1) |
| 10 | 카드 head                     | `style={{ marginBottom: 10 }}`                                                                                                                                                                        | `className="report-card-head"`                                  |
| 11 | 카드 타이틀                   | `style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}`                                                                                                                                       | `className="report-card-title"` (SW1 fontSize 16)               |
| 12 | 카드 sub (가운뎃점 본문)      | `{card.sub} · {year}년도` 단일 노드                                                                                                                                                                   | `className="report-card-sub"` + dot span 2개 (W1 OQ #5 LOCKED)  |
| 13 | 카드 버튼                     | `style={{ width: '100%', padding: '11px', borderRadius: 9, border: 'none', background: loading ... 'linear-gradient(135deg,#1d4ed8,#2563eb)', color, fontSize: 12, fontWeight: 700 ... }}`           | `className="report-card-btn"` + .report-card--loading override |
| 14 | 푸터 노트                     | `style={{ textAlign: 'center', fontSize: 11, color: 'var(--t3)', padding: '8px 0 20px' }}`                                                                                                            | `className="page-footer-note"`                                  |

**아이콘 변환:**
- `⬇` 이모지 → `<Download size={14} />` (lucide-react)
- SVG `<path d="M15 19l-7-7 7-7" />` (15x15) → `<ChevronLeft size={15} />` (lucide-react)

**상수 삭제 (line 387~398):**
- `iconBtn: React.CSSProperties` → 동등 정의가 SW1 `.back-btn` (components.css line 24) 에 존재
- `navBtn: React.CSSProperties` → 동등 정의가 SW1 `.year-nav-btn` (components.css line 28) 에 존재

**Root 컨테이너 변경:**
- `background: 'var(--bg)'` → `'var(--surface-page)'` (SW1 토큰 명 일치화)

**a11y 보강:**
- `<button className="back-btn" aria-label="뒤로 가기">` 추가
- `<button className="year-nav-btn" aria-label="이전 연도/다음 연도">` 추가

## 2. verify gate 결과 (30+건)

### NEGATIVE (모두 0 기대)

| # | Gate                                          | Expected | Actual | Result |
| - | --------------------------------------------- | -------- | ------ | ------ |
| 1 | 이모지 `⬇`                                    | 0        | 0      | PASS   |
| 2 | line 316~398 `linear-gradient`                | 0        | 0      | PASS   |
| 3 | line 316~398 fontSize 10/11px                 | 0        | 0      | PASS   |
| 4 | `text-status-` / `bg-status-`                 | 0        | 0      | PASS   |
| 5 | `const iconBtn` / `const navBtn` 상수         | 0        | 0      | PASS   |
| 6 | line 316~398 가운뎃점 ' · ' (본문)            | 0        | 1*     | EXPECTED (plan 명시) |

\* Gate #6 = 1 의 단일 출현은 `const [subLeft, subRight] = card.sub.split(' · ')` (line 356) — PLAN.md STEP 2 line 161 에서 명시 요구한 split delimiter 리터럴. 본문 렌더 텍스트가 아닌 JS 파서 인자로, dot-meta span 패턴의 전제. plan 의 verify gate 의도 ("텍스트 본문 0, dot span 만") 에 부합. JSX 본문 텍스트에는 ' · ' 가 존재하지 않음.

### POSITIVE (모두 ≥1 기대)

| #  | Gate                                                    | Expected | Actual | Result |
| -- | ------------------------------------------------------- | -------- | ------ | ------ |
| 7  | `import { Download, ChevronLeft } from 'lucide-react'`  | ≥1       | 1      | PASS   |
| 8  | `className="page-header"`                               | ≥1       | 1      | PASS   |
| 9  | `className="back-btn"`                                  | ≥1       | 1      | PASS   |
| 10 | `className="page-title"`                                | ≥1       | 1      | PASS   |
| 11 | `className="year-pager"`                                | ≥1       | 1      | PASS   |
| 12 | `className="year-pager-slot"`                           | ≥1       | 2      | PASS   |
| 13 | `className="year-nav-btn"`                              | ≥1       | 2      | PASS   |
| 14 | `className="year-label"`                                | ≥1       | 1      | PASS   |
| 15 | `className="page-body"`                                 | ≥1       | 1      | PASS   |
| 16 | `report-card report-card--loading` ternary              | ≥1       | 1      | PASS   |
| 17 | `className="report-card-head"`                          | ≥1       | 1      | PASS   |
| 18 | `className="report-card-title"`                         | ≥1       | 1      | PASS   |
| 19 | `className="report-card-sub"`                           | ≥1       | 1      | PASS   |
| 20 | `className="report-card-btn"`                           | ≥1       | 1      | PASS   |
| 21 | `className="dot-meta"`                                  | ≥1       | 2      | PASS   |
| 22 | `className="page-footer-note"`                          | ≥1       | 1      | PASS   |
| 23 | `<Download size={14}`                                   | ≥1       | 1      | PASS   |
| 24 | `<ChevronLeft size={15}`                                | ≥1       | 1      | PASS   |
| 25 | `handleDownload(card.type)` (비즈 로직 보존)            | ≥1       | 1      | PASS   |
| 26 | `REPORT_CARDS.map` (DesktopReportsPage 포함)            | ≥1       | 2      | PASS   |
| 27 | `setYear(y => y - 1)` 보존                              | ≥1       | 1      | PASS   |
| 28 | `setYear(y => y + 1)` 보존                              | ≥1       | 1      | PASS   |
| 29 | `navigate(-1)` 보존                                     | ≥1       | 1      | PASS   |

### FILE-LEVEL GUARDS (모두 0 기대)

| #  | Gate                              | Expected | Actual | Result |
| -- | --------------------------------- | -------- | ------ | ------ |
| 30 | ExcelPreview.tsx 변경 files       | 0        | 0      | PASS   |
| 31 | App.tsx 변경 files                | 0        | 0      | PASS   |
| 32 | styles/ 변경 files                | 0        | 0      | PASS   |
| 33 | main.tsx 변경 files               | 0        | 0      | PASS   |

**전체 33 gate: 33 PASS / 0 FAIL** (gate #6 은 plan 명시 의도와 부합하는 1 = EXPECTED).

## 3. 비즈 로직 보존 체크 (9건)

- [x] `useState<ReportType | null>(null)` 동일 (line 319)
- [x] `handleDownload(type)` signature + try/finally 동일 (line 320~327)
- [x] `await downloadReport(type, year)` 호출 동일 (line 323)
- [x] `REPORT_CARDS.map` 분기 동일 (line 354)
- [x] `year > MIN_YEAR` / `year < CURRENT_YEAR` 분기 조건 동일 (line 340, 346)
- [x] `setYear(y => y - 1)` / `setYear(y => y + 1)` 동일 (line 341, 347)
- [x] `disabled={loading === card.type}` 의미 동일 — `const isLoading = loading === card.type` 캡처 후 `disabled={isLoading}` (line 355, 376) — 평가값 동일
- [x] `onClick={() => navigate(-1)}` 동일 (line 332)
- [x] `card.title` / `card.sub` / `card.type` 접근 동일 (line 363, 356, 359)

## 4. 빌드 결과

### tsc --noEmit
- **Result:** PASS (0 errors, 0 output)

### npm run build (vite production)
- **Result:** PASS (`✓ built in 16.17s` + PWA SW `✓ built in 223ms`)

### chunk size delta (ReportsPage)

| Metric           | Before (886ed12) | After (2e621a4) | Delta   |
| ---------------- | ---------------- | --------------- | ------- |
| Raw chunk        | 20.60 kB         | 19.75 kB        | -0.85 kB |
| Gzip chunk       | 7.21 kB          | 7.13 kB         | -0.08 kB |

**축소 원인:** iconBtn/navBtn 12 라인 상수 + 인라인 style 중복 객체 제거 (SW1 class 1회 참조로 치환). lucide ChevronLeft (size={15}) 가 인라인 SVG path 보다 작은 코드량. dot-meta span 추가는 영향 미미.

### 전체 PWA precache
- 82 entries / 7884.24 KiB (SW2 변경이 SW workbox 캐시 매니페스트에 자연 반영됨, 추가 작업 불필요)

## 5. 커밋 hash

```
2e621a4 tsx(14-reports): SW2 — MobileReportsPage v0.1.1 Tailwind 재작성 (헤더 + 카드 그리드 10종 + footer)
```

**parent:** `886ed12` (260520-wkg pre-dispatch plan)
**files staged:** `cha-bio-safety/src/pages/ReportsPage.tsx` (단 1 파일)
**diff stat:** 1 file changed, 48 insertions(+), 49 deletions(-)

## 6. 다음 wave 진입 게이트 (SW3 — DesktopReportsPage)

**PASS — SW3 진입 가능.**

근거:
- 33/33 verify gate PASS (gate #6 은 plan 명시 의도)
- file-level guard 모두 0 (Mobile scope 완전 격리)
- tsc 0 errors / vite build PASS / chunk size 축소 (-0.85 kB raw)
- 비즈 로직 9 시그니처 모두 보존 (회귀 위험 0)
- SW1 의 14 class 모두 1+회 사용 (Mobile 측 검증 완료)

**SW3 (DesktopReportsPage) 다음 작업:**
- line 149~304 DesktopReportsPage 함수의 인라인 style 영역을 SW1 의 `.toolbar*` / `.sidelist*` / `.preview-wrapper` / `.a4-preview*` 등 §4~§6 class 로 변환
- line 306~313 `SELECT_STYLE` 상수 → SW1 `.toolbar-select` class 치환
- line 4~7 / 9~10 / 12~36 / 38~139 / 141~147 / 315~397 / 399~404 영역은 SW3 scope 외 (보존)
- 본 SW2 의 dot-meta + className 패턴이 reference 예제로 활용 가능

## 7. 메모리 룰 적용 확인

- **feedback_planner_prompt_sketch_verbatim** — components.css SW1 정의를 grep 으로 추출해 매핑 표에 verbatim 인용
- **feedback_tailwind_token_class_pattern** — `text-status-` / `bg-status-` 0 출현 (gate #4 PASS)
- **feedback_tsx_wave_emoji_dot_gap** — 이모지 0 + dot span 2개 markup 추가 (gate #1, #21 PASS)
- **feedback_tsx_wave_stat_card_drift** — sketch CSS 정의 line 별 verbatim 인용 (변환 매핑 14 row)
- **feedback_gsd_workflow_strict** — GSD quick 워크플로 안에서 진행 (PLAN → executor → SUMMARY)
- **feedback_redesign_sketch_rule_enforcement** — SW1 의 §6.2 negative rule (status 색 0 사용) 본 wave 에서도 유지

## Self-Check: PASSED

- [x] cha-bio-safety/src/pages/ReportsPage.tsx 존재 + 수정됨 (FOUND)
- [x] commit 2e621a4 존재 (`git log` 확인됨)
- [x] 33 verify gate 모두 PASS / EXPECTED
- [x] 파일 격리: 1 file changed
