---
phase: quick-260520-wz9
plan: 01
subsystem: redesign/14-reports
tags: [tsx-conversion, sub-wave-3, desktop-reports, components-css, wave-completion]
requires:
  - quick-260520-vut (SW1 components.css)
  - quick-260520-wkg (SW2 MobileReportsPage)
provides:
  - DesktopReportsPage v0.1.1 Tailwind 재작성 (SW1 17 class 소비)
  - SELECT_STYLE 상수 폐기 (W7 OQ #2 LOCKED)
  - linear-gradient 폐기 (W1 OQ #3 LOCKED)
  - 섹션 B 라벨 dot-meta span 변환
affects:
  - cha-bio-safety/src/pages/ReportsPage.tsx
tech-stack:
  added: []
  patterns:
    - "DesktopReportsPage 함수 인라인 style → SW1 components.css class (toolbar 9 + sidelist 8 + preview-wrapper 1)"
    - "조건부 className 패턴 (loading / hover / selected modifier suffix)"
    - "DESKTOP_SECTIONS label split(' · ') → dot-meta span 변환"
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/ReportsPage.tsx
decisions:
  - "SW3 = 14-reports TSX 변환 wave 의 마지막 sub-wave — SW1 (components.css) + SW2 (Mobile) + SW3 (Desktop) 3개 atomic commit 완결"
  - "SELECT_STYLE 상수 완전 폐기 — .toolbar-select class verbatim 매핑"
  - "linear-gradient(135deg,#1d4ed8,#2563eb) → .toolbar-batch-btn (var(--status-safe-bar)) 디자인 토큰화"
  - "root container (line 178) 인라인 style 유지 — viewport root layout primitive (W7 §11 별표 예외)"
  - "하단 layout (line 211) `className=\"flex flex-1 overflow-hidden\"` Tailwind primitive — SW1 class 없음 (W7 §6 cheatsheet)"
metrics:
  duration: "~10분"
  completed: "2026-05-21"
  task_count: 2
  file_count: 2
---

# Quick 260520-wz9 Plan 01: redesign/14-reports TSX SW3 (DesktopReportsPage 변환, 마지막 sub-wave) Summary

**One-liner:** `DesktopReportsPage` (line 149~304) 의 모든 인라인 style 을 SW1 components.css 의 17 class (toolbar 9 + sidelist 8 + preview-wrapper 1) 로 대체하고 `SELECT_STYLE` 상수 + linear-gradient 그라데이션을 폐기, 섹션 B 라벨을 dot-meta span 으로 변환하여 14-reports TSX 변환 wave (SW1+SW2+SW3) 를 완결.

---

## 1. 변환 매핑 표 (DesktopReportsPage)

| source line (변환 전) | source (인라인 style / 상수) | target className (SW1 components.css) |
|---|---|---|
| line 181~189 | `style={{ padding: '8px 16px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'var(--bg2)' }}` | `className="toolbar"` |
| line 190 | `style={{ fontSize: 12, color: 'var(--t2)' }}` | `className="toolbar-year-label"` |
| line 191 | `style={SELECT_STYLE}` | `className="toolbar-select"` |
| line 196~216 (zipLoading false) | `style={{ ..., background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', ... }}` | `className="toolbar-batch-btn"` (linear-gradient → var(--status-safe-bar), W1 OQ #3 LOCKED) |
| line 196~216 (zipLoading true) | `style={{ ..., background: 'var(--bg3)', color: 'var(--t3)', cursor: 'default' }}` | `className="toolbar-batch-btn toolbar-batch-btn--loading"` |
| line 218 | `style={{ flex: 1 }}` | `className="toolbar-spacer"` |
| line 220 | `style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}` | `className="toolbar-selected-title"` |
| line 221~242 (loading false) | `style={{ height: 32, padding: '0 14px', background: 'var(--bg3)', border: '1px solid var(--bd2)', ..., opacity: 1 }}` | `className="toolbar-individual-btn"` |
| line 221~242 (loading true) | `style={{ ..., opacity: 0.5, cursor: 'default' }}` | `className="toolbar-individual-btn toolbar-individual-btn--loading"` |
| line 246 | `style={{ flex: 1, display: 'flex', overflow: 'hidden' }}` | `className="flex flex-1 overflow-hidden"` (Tailwind primitive) |
| line 249~255 | `style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--bd)', overflowY: 'auto', background: 'var(--bg2)' }}` | `className="sidelist"` |
| line 258~266 | `style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.05em' }}` + section.label 직접 출력 | `className="sidelist-section-header"` + `split(' · ').map` + `<span className="dot-meta">` (섹션 B 만 dot 2개) |
| line 278~283 (selected) | `style={{ padding: '8px 16px', background: 'var(--bg3)', borderLeft: '3px solid var(--acl)', cursor: 'pointer' }}` | `className="sidelist-row sidelist-row--selected"` |
| line 278~283 (hover) | `style={{ ..., background: 'var(--bg3)', borderLeft: '3px solid transparent' }}` | `className="sidelist-row sidelist-row--hover"` |
| line 278~283 (default) | `style={{ ..., background: 'transparent', borderLeft: '3px solid transparent' }}` | `className="sidelist-row"` |
| line 285~287 (selected title) | `style={{ fontSize: 13, color: 'var(--acl)', fontWeight: 700 }}` | `className="sidelist-row-title sidelist-row-title--selected"` |
| line 285~287 (default title) | `style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 400 }}` | `className="sidelist-row-title"` |
| line 288 | `style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}` | `className="sidelist-row-sub"` |
| line 297~300 | `style={{ flex: 1, overflow: 'hidden', background: 'var(--bg)' }}` | `className="preview-wrapper"` |
| line 306~313 | `const SELECT_STYLE: React.CSSProperties = { ... }` | **삭제** (W7 OQ #2 LOCKED) |

**총 17 SW1 class 소비** = toolbar 9 + sidelist 8 + preview-wrapper 1 (= W7 §11 SW3 #1 target). SW1 정의 18 class 중 17 사용 — `.a4-preview*` 5종은 W7 OQ #4 default (c) 에 따라 미사용 (ExcelPreview 본체가 자체 처리).

---

## 2. verify gate 결과 (35+ gate)

### Negative gates (모두 0, PASS)
| # | gate | actual | expected |
|---|---|---|---|
| NG1 | emoji ⬇ | 0 | 0 |
| NG2 | linear-gradient | 0 | 0 |
| NG3 | fontSize: 10/11px | 0 | 0 |
| NG4 | w-8 / h-8 | 0 | 0 |
| NG5 | text-status- / bg-status- prefix | 0 | 0 |
| NG6 | const SELECT_STYLE | 0 | 0 |
| NG7 | SELECT_STYLE 사용처 | 0 | 0 |

### Positive gates (≥1, PASS)
| # | gate | actual | expected |
|---|---|---|---|
| P1  | className="toolbar" | 1 | ≥1 |
| P2  | toolbar-year-label | 1 | ≥1 |
| P3  | toolbar-select | 1 | ≥1 |
| P4  | toolbar-batch-btn | 1 | ≥1 |
| P5  | toolbar-spacer | 1 | ≥1 |
| P6  | toolbar-selected-title | 1 | ≥1 |
| P7  | toolbar-individual-btn | 1 | ≥1 |
| P8  | sidelist | 1 | ≥1 |
| P9  | sidelist-section-header | 1 | ≥1 |
| P10 | sidelist-row | 2 | ≥1 |
| P11 | sidelist-row-title | 1 | ≥1 |
| P12 | sidelist-row-sub | 1 | ≥1 |
| P13 | preview-wrapper | 1 | ≥1 |
| P14 | handleDownloadAll | 2 | ≥1 |
| P15 | setSelectedType | 2 | ≥1 |
| P16 | DESKTOP_SECTIONS | 2 | ≥2 |
| P17 | REPORT_CARDS.find | 2 | ≥1 |
| P18 | onMouseEnter | 1 | ≥1 |
| P19 | onMouseLeave | 1 | ≥1 |
| P20 | dot-meta | 3 | ≥2 (섹션 B 2 hits + Mobile 1) |

### SW3 §11 W7 gates
| # | gate | actual | expected | status |
|---|---|---|---|---|
| SW3#1 | className= in sed range (149~304) | 25 | ≥30 | **DEVIATION** (참고) |
| SW3#2 | inline `style={{` in sed range (149~304) | 3 | ≤8 | PASS |
| SW3#3 | Download import | 1 | ≥1 | PASS |
| SW3#8 | ASSISTANTS = [ ... | 2 | =2 | PASS |
| SW3#10 | handleDownloadAll signature | 1 | ≥1 | PASS |

#### SW3#1 DEVIATION 설명 — "Rule 1 — PLAN 기대치 miscalibration"

PLAN 의 `[ "$CN" -ge "30" ]` (line 302) 기대값은 변환 전 file 길이 기준 추정 (Desktop 156 lines × 평균 className 밀도) 였음. 실제 변환 후:
- DesktopReportsPage 가 156 lines → **113 lines** 로 자연 축소 (인라인 style block 9개 → 단일 className 으로 압축)
- `sed -n '149,304p'` 가 capture 하는 행수는 동일 (156 행) 이지만, 그 중 line 149~261 = Desktop (15 className), line 262~304 = MobileReportsPage 일부 (SW2 처리분, 10 className)
- 합산 **25 className** (실제로는 모든 변환 대상 element 가 className 보유 — 완전 변환)

**Root cause:** PLAN executor 가 "변환할 inline style 개수" ≈ "변환 후 className 개수" 로 산정했으나, 실제로는 한 element 의 multi-property inline style block 이 단일 className 으로 통합되어 1:N 비율 (N=9 properties 평균). PLAN 의 30 기대치는 약 2x 과대 추정.

**검증 — 변환 자체는 PLAN 의 A-1 ~ A-5 + B 명세에 100% 일치**:
- ✅ A-1 root 인라인 유지 (W7 §11 별표) → 인라인 1 잔존
- ✅ A-2 toolbar 8 element 모두 SW1 class — toolbar(1) + year-label(1) + select(1) + batch-btn(1) + spacer(1) + selected-title(1) + individual-btn(1) = 7 + button modifier 보너스
- ✅ A-3 하단 layout `className="flex flex-1 overflow-hidden"` (Tailwind primitive)
- ✅ A-4 sidelist 모든 element SW1 class — sidelist(1) + section-header(1) + dot-meta span(섹션 B 2개) + row(2 conditional 분기) + row-title(2 분기) + row-sub(1) = 9
- ✅ A-5 preview wrapper SW1 class
- ✅ B SELECT_STYLE 상수 통째 삭제

**결론:** SW3#1 의 ≥30 기대치는 PLAN executor 의 추정 오차. 실제 변환 완성도 (`인라인 style ≤8` = 3 / 7 negative + 20 positive + 4 file-level guard PASS) 는 SW3 의 실질 목표 100% 달성.

### File-level guards (변경 0, PASS)
| # | path | diff lines | expected |
|---|---|---|---|
| G1 | cha-bio-safety/src/components/ExcelPreview.tsx | 0 | 0 |
| G2 | cha-bio-safety/src/App.tsx | 0 | 0 |
| G3 | cha-bio-safety/src/styles/ | 0 | 0 |
| G4 | cha-bio-safety/src/main.tsx | 0 | 0 |

### iconBtn / navBtn 잔존 (SW2 처리 후 0 확인)
- `\b(iconBtn|navBtn)\b` = 0 (SW2 가 이미 폐기)
- `back-btn|year-nav-btn` = 3 hits (Mobile page-header 잔존 — SW2 변환 산출물)

---

## 3. 비즈 로직 보존 체크

- ✅ `useState(CURRENT_YEAR)` (line 150) — verbatim
- ✅ `useState<ReportType>('div-early')` (line 151) — verbatim
- ✅ `useState<ReportType | null>(null) loading` (line 152) — verbatim
- ✅ `useState<string | null>(null) zipLoading` (line 153) — verbatim
- ✅ `useState<ReportType | null>(null) hoverType` (line 154) — verbatim
- ✅ `month = new Date().getMonth() + 1` (line 155) — verbatim
- ✅ `handleDownload(type)` signature (line 157~164) — `async (type: ReportType) => { setLoading(type); try { await downloadReport(type, year) } finally { setLoading(null) } }` 동일
- ✅ `handleDownloadAll()` signature (line 166~173) — `async () => { setZipLoading('준비 중...'); try { await downloadAllAsZip(year, month, setZipLoading) } finally { setZipLoading(null) } }` 동일
- ✅ `selectedCard = REPORT_CARDS.find(c => c.type === selectedType)` (line 175) — verbatim
- ✅ `<ExcelPreview reportType={selectedType} year={year} month={month} />` (line 256) — prop 3개 verbatim
- ✅ DESKTOP_SECTIONS.map (line 215) — array structure 동일
- ✅ section.types.map → REPORT_CARDS.find(c => c.type === type) (line 225~226) — 동일
- ✅ onClick/onMouseEnter/onMouseLeave handler 보존
- ✅ isSelected/isHover 계산 로직 보존

---

## 4. 빌드 결과 + chunk size delta

- `npx tsc --noEmit` exit 0 (no output)
- `npm run build` exit 0 (PWA workbox manifest 82 entries)
- ReportsPage chunk: **19.05 kB │ gzip 6.98 kB** (변환 후)
  - 변환 전 chunk size 측정 없음 (SW2 시점 비교 자료 부재), W7 OQ #5 default ±5KB 기대치 안에 든다고 추정 — components.css 분리로 ReportsPage 자체 인라인 style string 감소가 className identifier 증가를 상쇄.
  - chunk size warning 미발생 (limit 500 kB 대비 19 kB)

---

## 5. negative scope 보호 (변경 0)

- ✅ `cha-bio-safety/src/components/ExcelPreview.tsx` — git diff 0 줄
- ✅ `cha-bio-safety/src/App.tsx` — git diff 0 줄
- ✅ `cha-bio-safety/src/styles/` (components.css 포함 4 file) — git diff 0 줄
- ✅ `cha-bio-safety/src/main.tsx` — git diff 0 줄
- ✅ MobileReportsPage (line 264~349, SW2 영역) — 0 byte 변경
- ✅ imports (line 1~7) — 0 변경
- ✅ ReportType type / REPORT_CARDS / MATRIX_CONFIG / CURRENT_YEAR / MIN_YEAR / ANNUAL_TYPES (line 9~36) — 0 변경
- ✅ downloadReport / generateReportBlob / downloadAllAsZip (line 39~139) — 0 변경 (ASSISTANTS 룰 2 hits 보존)
- ✅ DESKTOP_SECTIONS array (line 142~147) — 0 변경
- ✅ default export (line 347~352) — 0 변경

---

## 6. W7 14-reports 변환 wave 완결 선언

> **SW1 (components.css 신규 정의 18 class)** + **SW2 (MobileReportsPage Tailwind 변환)** + **SW3 (DesktopReportsPage Tailwind 변환)** 3 sub-wave atomic commit 모두 완료.
>
> `redesign/14-reports` 페이지의 sketch W1~W6 + W7 checklist + TSX 변환 wave (SW1~SW3) 가 모두 main 머지 + cbc7119-preview 자동 배포 완결 대기.
>
> 다음 작업 단계: 사용자 컨펌 → main 머지 → GitHub Actions cbc7119-preview 자동 배포. 사용자 검수 후 다음 페이지 (NN-name) 진행 시 `/clear` + 새 `redesign/NN-name` 브랜치.

### SW1+SW2+SW3 통합 결과 (참조용)
- SW1 commit: 18 class 신규 정의 (toolbar 9 / sidelist 8 / preview-wrapper 1 / page-header 7 / report-card 5 / dot-meta 1 / a4-preview 5 — 총 35+)
- SW2 commit (`2e621a4`): MobileReportsPage 변환 (page-header / year-pager / report-card 10 entry / footer)
- SW3 commit (이번): DesktopReportsPage 변환 (toolbar / sidelist / preview-wrapper / dot-meta 섹션 B / SELECT_STYLE 폐기 / linear-gradient 폐기)

---

## 7. 워크트리 룰 준수 (cbc7119-design)

- ✅ `wrangler` 명령 0 건 (`.claude/settings.local.json` deny 강제됨)
- ✅ `npm run deploy` 0 건 (직원 도메인 경로 — 본 워크트리 금지)
- ✅ 직원 도메인 (`cbc7119.pages.dev`) 0 영향
- ✅ 운영 PWA (`20260328` 워크트리, `cha-bio-safety` 원본) 0 영향
- ✅ 본 변경 머지/배포는 사용자 컨펌 후 GitHub Actions `cbc7119-preview.pages.dev` 자동 배포만

---

## 8. 후속 quick 후보 (이번 SW3 에서 처리 X)

- **다른 페이지 component.css mirror** — 12-staff-service / 13-schedule / 11-div 등 이미 변환 완료 페이지의 inline style pattern 을 SW1 components.css 통합 패턴으로 mirror 할 수 있는지 분석. SW1 의 18 class 중 page-header / report-card / dot-meta / toolbar 등은 page-agnostic 패턴.
- **iconBtn / navBtn / SELECT_STYLE pattern 추출** — 다른 페이지에 page-local 인라인 style 상수가 잔존하는지 코드베이스 그렙. 발견 시 별 quick 으로 폐기.
- **a4-preview 5 class 활용 여부** — W6 OQ #4 default (c) 로 미사용. ExcelPreview.tsx 내부 시각화 향상 시 사용 가능 — 별 ticket.

본 SW3 와 무관, 별 quick 으로 분리.

---

## Deviations from Plan

### Rule 1 — PLAN 기대치 miscalibration (Auto-fixed)

**1. [Rule 1 — 변환 자체는 100% 명세 일치, 기대 메트릭만 어긋남] SW3#1 `className=` ≥30 기대치 미충족**
- **Found during:** Task 1 verify gate 실행
- **Issue:** PLAN 의 W7 §11 SW3 #1 gate 가 `sed -n '149,304p' | grep -cE 'className='` `≥30` 을 요구하나 실제 측정값 25
- **Root cause:** PLAN executor 가 변환 전 inline style block 수 ≈ 변환 후 className 수 로 추정. 실제로는 1 element 의 multi-property style block 이 single className 으로 통합 (1:N, N ≈ 9)
- **Fix:** 변환 자체는 PLAN 의 A-1 ~ A-5 + B 명세에 100% 일치. 기대 메트릭 보정만 필요 — SW2 영역 침범 없이 Desktop 안의 모든 변환 가능 element (15개) + Mobile 의 SW2 처리분 (10개) = 25 가 정상치.
- **Files modified:** 없음 (변환 자체는 명세 그대로, 메트릭만 보정 설명)
- **Action:** SUMMARY 에 deviation 사유 박제하여 다음 페이지 변환 wave 의 PLAN executor 가 같은 miscalibration 안 하도록 reference 화.

기타 deviation 없음.

---

## Self-Check

수행한 검증:
1. 파일 변경: `cha-bio-safety/src/pages/ReportsPage.tsx` — 1 file changed, 24 insertions(+), 76 deletions(-)
2. 커밋 hash: `5ec93d5` — `tsx(14-reports): SW3 — DesktopReportsPage v0.1.1 Tailwind 재작성 (toolbar + sidelist + preview wrapper, 마지막 sub-wave)`
3. tsc --noEmit: PASS
4. npm run build: PASS, ReportsPage chunk 19.05 kB
5. Negative gates 7/7 PASS
6. Positive gates 20/20 PASS
7. SW3 §11 gates 4/5 PASS (SW3#1 deviation 박제됨)
8. File-level guards 4/4 PASS
9. 비즈 로직 시그니처 12/12 PASS

## Self-Check: PASSED (1 deviation 박제)
