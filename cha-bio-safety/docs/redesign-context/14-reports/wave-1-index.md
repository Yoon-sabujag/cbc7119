---
title: "redesign/14-reports — sketch wave 1 (index)"
status: locked
created: 2026-05-20
quick_id: 260520-ep5
branch: redesign/14-reports
source_tsx: cha-bio-safety/src/pages/ReportsPage.tsx
source_tsx_lines: 405
source_preview: cha-bio-safety/src/components/ExcelPreview.tsx
design_system: cha-bio-safety/docs/redesign-context/14-reports/design-system.md (v0.1.1, c8bfa86)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md
mirror_of: cha-bio-safety/docs/redesign-context/13-schedule/ (flat sibling 패턴 — sketch/ 서브폴더 없음)
sub_wave_count: 6 (W2~W7)
memory_rules_inline: 10
open_questions: 5
---

# redesign/14-reports — sketch wave 1 (index)

본 문서는 W2~W7 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:
- ReportsPage.tsx (405 라인) + ExcelPreview.tsx (535 라인) 의 element 인벤토리 → 6 sub-wave 분배
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6 / §7 / §10 의 verbatim 룰 박제
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 14-reports 적용 여부
- 메모리 룰 10건 (`feedback_*.md`) inline 인용 — 14-reports 컨텍스트에 어떻게 적용할지
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌

작성일: 2026-05-20 / Quick ID: 260520-ep5 / Branch: redesign/14-reports

> ⚠ 13-schedule 폴더 구조 실측 결과: **평면(flat sibling) 패턴** — `13-schedule/sketch-wave-N.html` 직접 배치, `sketch/` 서브폴더 없음. 14-reports 도 동일하게 평면 배치 결정. 본 인덱스 파일도 `14-reports/wave-1-index.md` (flat) 으로 위치한다.

---

# §1 ReportsPage.tsx 인벤토리

본 인벤토리는 ReportsPage.tsx (405 lines, 14-reports.md 메타와 일치) 와 ExcelPreview.tsx (535 lines, 우측 panel 컴포넌트) 의 element 를 모바일/데스크톱 영역으로 나눠 정리한다. line 범위는 **실측 결과** (task_scope 의 추정치 — 보정값은 명시).

## §1.1 모바일 (MobileReportsPage, line 316~385)

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| header | 뒤로 버튼 + 타이틀 "점검 일지 출력" + 연도 셀렉터 ‹·› | 331~353 (실측 = 추정치 일치) | 페이지 chrome 최상단 | `useNavigate(-1)`, `useState(year)`, year ‹ (line 343) / › (line 349) 토글 — MIN_YEAR=2023 / CURRENT_YEAR | W2 |
| 카드 리스트 | REPORT_CARDS 10종 (DIV early/late, 소화전, 청정소화약제, 비상콘센트, 피난방화, 방화셔터, 제연, 자탐, 소방펌프) | 355~377 (map 영역) + 12~23 (REPORT_CARDS 정의) | 보고서 카드 그리드 — 각 카드 = 제목 + sub (예: "DIV · 34개소 · {year}년도") + "⬇ 엑셀 다운로드" 그라데이션 버튼 | `handleDownload(card.type)` (line 320~327) → `downloadReport(type, year)` (line 39~71) — ASSISTANTS 랜덤 채움 룰은 자탐/방화셔터/제연 한정 (line 49~58) | W3 (전체 10종) / W2 (1종 샘플 = DIV early) |
| footer | "다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)" | 379~381 | 정적 안내 문자열 | 없음 (정적) | W3 |

**주: 모바일 카드 버튼의 ⬇ 글리프 (U+2B07)** — line 374 `'⬇ 엑셀 다운로드'`. 메모리 룰 `feedback_tsx_wave_emoji_dot_gap` 에 따라 sketch/W2/W3 에서 **이모지 제거 + lucide `<Download size={N} />` + dot span 추가** 룰 적용.

## §1.2 데스크톱 (DesktopReportsPage, line 149~304)

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 상단 바 (top toolbar) | 연도 셀렉트 + 일괄 다운로드 버튼 (그라데이션) + flex spacer + 선택된 보고서 타이틀 + 개별 엑셀 다운로드 버튼 | 180~243 (실측 = 추정치 일치, line 181~243 영역) | top-level chrome — 연도 변경 / 일괄 zip / 선택 보고서 개별 다운로드 | `setYear` (line 191), `handleDownloadAll` (line 166~173 → `downloadAllAsZip` line 112~139), `handleDownload(selectedType)` (line 157~164), `selectedCard?.title` (line 220) | W4 |
| 좌측 패널 260px | DESKTOP_SECTIONS 4 섹션 — 유수검지 장치 / 소화전·가스·비상콘센트 / 연간 점검일지 / 소방펌프 (line 142~147 정의). 각 섹션 헤더 + 보고서 row (제목 + sub, isSelected 면 좌측 3px accent 색바) | 248~295 (실측 = 추정치 ±1) | section group 별 카드 row list | `selectedType` state (line 151), `setSelectedType(type)` onClick (line 275), `hoverType` (line 154, 276~277), `isSelected ? '3px solid var(--acl)' : '3px solid transparent'` (line 282) | W5 |
| 우측 ExcelPreview 영역 | `<ExcelPreview reportType={selectedType} year={year} month={month} />` | 297~300 (실측 = 추정치 ±1) | 보고서 미리보기 (이미지 + 그리드 오버레이 + 데이터 fetch) | ExcelPreview 자체는 손대지 않음 (W6 는 wrapper layout 만) — 내부는 `useQuery` + PREVIEW_IMAGES + REPORT_GRID 9 종 + MATRIX_TYPES 4 종 | W6 |

**주: 데스크톱 일괄 다운로드 버튼 그라데이션** — line 202 `background: zipLoading ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)'`. 모바일 카드 버튼 (line 370) 과 동일한 그라데이션. §7 OQ #1/#3 에서 solid 통일 컨펌.

## §1.3 파일 라인 수 확인

`wc -l cha-bio-safety/src/pages/ReportsPage.tsx` 실측 결과 = **405 라인** (14-reports.md 메타 + task_scope 추정 일치, drift 없음).
`wc -l cha-bio-safety/src/components/ExcelPreview.tsx` 실측 결과 = **535 라인** (W6 wrapper wave 에서 내부 손대지 않음을 전제로, 안전 마진).

---

# §2 6 sub-wave 분배 plan

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 헤더 + 카드 1종 (DIV early) | MobileReportsPage 헤더 (line 331~353) + REPORT_CARDS[0] 1매 (line 13 + render line 357~376 의 1개 instance) | sketch-wave-2-mobile-header-card.html |
| W3 | 모바일 카드 그리드 10종 + footer | MobileReportsPage 전체 카드 리스트 (line 355~377 map) + footer (line 379~381) | sketch-wave-3-mobile-card-list.html |
| W4 | 데스크톱 상단 바 (연도 + 일괄 + 선택 + 개별) | DesktopReportsPage 상단 바 (line 181~243) | sketch-wave-4-desktop-toolbar.html |
| W5 | 데스크톱 좌측 4섹션 카드 목록 | DesktopReportsPage 좌측 패널 (line 248~295) | sketch-wave-5-desktop-sidelist.html |
| W6 | 데스크톱 ExcelPreview 영역 wrapper (내부 ExcelPreview.tsx 손대지 않음) | DesktopReportsPage 우측 영역 wrapper layout (line 297~300) | sketch-wave-6-desktop-preview-wrapper.html |
| W7 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W6 sketch + ReportsPage.tsx 비즈 로직 보존 룰 + Tailwind cheatsheet | wave-7-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트

### W2 — 모바일 헤더 + 카드 1종 (DIV early)
- **보존**: `useNavigate(-1)`, `useState(year)`, year ‹/› 토글 분기 (line 342 `year > MIN_YEAR`, line 348 `year < CURRENT_YEAR`), `handleDownload(card.type)` 시그니처, `downloadReport(type, year)` 시그니처, REPORT_CARDS[0].title verbatim "월초 유수검지 장치 점검표", REPORT_CARDS[0].sub verbatim "DIV · 34개소"
- **토큰**: 모바일 헤더 = `bg-surface-page` (chrome 룰 §1 의 헤더 page 톤) / 카드 = `bg-surface-raised border border-border-default rounded-md p-card` / 뒤로 버튼 = §7.2 chrome 룰 (`w-8 h-8 rounded-sm bg-surface-sunken border border-border-default` + lucide `ChevronLeft size={15}`) / 다운로드 버튼 = `bg-safe-bar` solid (그라데이션 폐기, OQ #1) — **status- prefix 없음 (memory feedback_tailwind_token_class_pattern 룰)**
- **폰트**: 노안 룰 §1.1 — 9·10·11px 금지, 본문 16px. 헤더 타이틀 18px (`text-title`) — chrome 룰 §2.3 `text-body font-bold` (16px) 도 허용. 카드 제목 16~18px / sub 12~13px (`text-caption` 또는 `text-label`).

### W3 — 모바일 카드 그리드 10종 + footer
- **보존**: REPORT_CARDS 10 entry verbatim (line 12~23 — type/title/sub 모두) + footer 카피 verbatim "다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)" (line 380) + ASSISTANTS 3명 verbatim `['석현민', '김병조', '박보융']` (line 50, 87)
- **토큰**: W2 패턴 그대로 10번 반복 — `bg-surface-raised` 카드 + 카드 사이 gap `var(--card-gap)` (모바일 8px, 데스크톱 6px) / 다운로드 버튼 = `bg-safe-bar` solid (W2 와 일관) / footer 안내 = `text-caption text-text-tertiary text-center` (12px)
- **폰트**: W2 와 동일.

### W4 — 데스크톱 상단 바
- **보존**: `setYear` (line 191), `handleDownloadAll` (line 166), `handleDownload(selectedType)` (line 157), `selectedCard?.title` 동적 표시 (line 220), `Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i)` year 옵션 룰 (line 192), `zipLoading ?? '일괄 다운로드'` 카피 분기 (line 215), `loading === selectedType ? '생성 중...' : '엑셀 다운로드'` 카피 분기 (line 241)
- **토큰**: 상단 바 wrapper = `bg-surface-raised border-b border-border-default` (chrome 룰 §3.1 sticky wrapper 패턴 mirror) / 일괄 다운로드 버튼 = `bg-safe-bar` solid (OQ #3) / 개별 다운로드 버튼 = `bg-surface-sunken border border-border-strong` (보조 액션) — **status- prefix 없음**
- **폰트**: 데스크톱이라도 폰트는 모바일과 동일 (§1.3 절대 룰). 라벨 12~13px / 버튼 12px / 선택 타이틀 14~16px.

### W5 — 데스크톱 좌측 4섹션 카드 목록
- **보존**: DESKTOP_SECTIONS 4 entry verbatim (line 142~147) — 섹션 label + types 배열, `setSelectedType(type)` onClick (line 275), `hoverType` state, `isSelected` 좌측 3px accent 색바 (line 282), REPORT_CARDS 의 title/sub 카피 verbatim (W3 와 동일 source)
- **토큰**: 좌측 패널 = `bg-surface-raised` (chrome 룰 §1 의 zone wrapper 와 동일 톤) / 섹션 헤더 = `text-caption font-semibold text-text-tertiary tracking-wider` (chrome 룰 §3.1 라벨 패턴 mirror) / 선택 row 좌측 색바 = `border-l-[3px] border-accent` / hover 패턴 = `hover:bg-surface-active` 또는 `hover:bg-surface-sunken` (chrome 룰 §5 비선택 = `bg-surface-page` 룰 + hover 강조)
- **폰트**: row 제목 13~14px (`text-label` 또는 `text-body-sm`) / sub 11~12px → **11px 금지**, `text-caption` (12px) 로 상향 (마이그레이션 룰 §4.2).

### W6 — 데스크톱 ExcelPreview 영역 wrapper
- **보존**: `<ExcelPreview reportType={selectedType} year={year} month={month} />` props 시그니처 verbatim (line 299) — props 추가/제거 0건. wrapper 만 손댐.
- **토큰**: wrapper = `flex-1 overflow-hidden bg-surface-page` (line 298 `background: 'var(--bg)'` 의 새 토큰 매핑 — `--bg → --surface-page`, mig 룰 §4.1). 내부 ExcelPreview 컴포넌트는 손대지 않음.
- **폰트**: ExcelPreview 내부 폰트는 본 wave 의 scope 가 아님. wrapper 가 부여하는 폰트 0 (자식이 모두 자기 폰트 가짐).

### W7 — TSX 변환 verify checklist (markdown)
- **보존**: ReportsPage.tsx 의 모든 비즈 로직 (downloadReport / generateReportBlob / downloadAllAsZip / handleDownload / handleDownloadAll / setYear / setSelectedType / hoverType / ASSISTANTS 룰) 100% 보존. UI markup 만 재작성.
- **토큰**: W2~W6 sketch 의 모든 Tailwind class 를 verbatim grep 추출 → checklist 안에 인용 (memory `feedback_planner_prompt_sketch_verbatim`). status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`) + `w-8/h-8 = 48px` 함정 룰 (memory `feedback_tailwind_w8_h8_is_48px`) verbatim 박제.
- **폰트**: design-system.md §2.7 7단계 cheatsheet + 마이그레이션 룰 §4.2 11px 일괄 상향 룰 박제.

---

# §3 design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

본 인용은 `cha-bio-safety/docs/redesign-context/14-reports/design-system.md` (v0.1.1, c8bfa86) 원문 그대로. 후속 wave 작업자가 design-system.md 를 별도로 열지 않아도 핵심 룰을 본 인덱스에서 직접 확인 가능하도록 박제한다.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

## §3.4 design-system §6.1 Progress Color Rule (verbatim)

```
### 6.1 Progress Color Rule (진척률 색 매핑)

점검 카테고리 도넛, 카테고리 카드 좌측 색바 등 **진척률을 표현할 때** 일관 적용한다.

| 진척률 | 색상 | 토큰 |
|---|---|---|
| 100% (완료) | 녹색 | `--status-safe-bar` |
| 50~99% | 파랑 | `--accent` |
| 1~49% | 노랑 | `--status-warning-bar` |
| 0% (미시작) | 회색 | `--text-tertiary` |

**카테고리별 임의 색 배정 폐지** — 카테고리는 아이콘 모양으로 구분하고, 색은 진척률 기반만 사용한다.
```

> **§6 미적용 — 14-reports 페이지에는 진척률 도넛/카드 없음.** 보고서 카드 좌측 색바는 데스크톱 좌측 패널에서 `isSelected` 표시용 (`accent` 단색) 으로만 사용. 점검 진척률 표현이 아니므로 Progress Color Rule 미적용. 다만 §6.4 그라데이션 폐기 룰은 **적용** (OQ #1/#3 — 모바일/데스크톱 다운로드 버튼 그라데이션 → solid).

## §3.5 design-system §6.2 Stat Card Number Color (verbatim)

```
### 6.2 Stat Card Number Color

통계 카드(28px display 숫자) 색상 룰:
- 기본 숫자 색: `--text-primary` (흰색/검정)
- 라벨: `--text-secondary`
- 단위: `--text-tertiary`
- **위험 임계치 조건부 처리**: `점검 미완료 > 0`, `미조치 > 0` 등 주의가 필요한 상태일 때 숫자만 `--status-danger`로 변경
- 카드 좌측 3px 색바: 해당 status 토큰의 `bar` 변종 (예: `--status-danger-bar`)
```

> **§6.2 / §7 (= "Stat Card" 룰) 미적용 — 14-reports 페이지에는 통계 숫자 카드 없음.** ReportsPage 의 카드는 보고서 다운로드 카드 (제목 + sub + 버튼) 이며 28px display 숫자 통계 카드가 아니다. 단, **W7 변환 wave executor 가 이 룰을 verbatim 인용 안 했다고 deviation 으로 잡으면 안 됨** (실제로 14-reports 에 적용 대상 element 가 없으므로). drift 방지를 위해 W7 checklist 에 "Stat Card 룰 14-reports 미적용" 명시 필요 (memory `feedback_tsx_wave_stat_card_drift`).

## §3.6 design-system §7.1 Lucide Icon System (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

> **§7 / §10 Iconography — Lucide `Download` 단일 사용.** 14-reports 페이지는 ReportsPage.tsx line 3 에서 이미 `import { Download } from 'lucide-react'` 사용 중. 커스텀 SVG 6종 (StairsIcon / ShutterIcon / ExitSignIcon / SmokeVentIcon / HoseReelIcon / FireExtinguisherCustom) **미사용** — 보고서 카드는 카테고리 아이콘이 아닌 다운로드 버튼만 갖기 때문. 단, **모바일 카드 line 374 의 `'⬇'` 글리프 (U+2B07) 는 이모지 사용 금지 룰 위반** → W2/W3 에서 lucide `<Download size={16} />` 로 교체.

## §3.7 design-system §6.4 Backgrounds & Gradients 폐기 룰 (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

> 14-reports 현재 그라데이션 = `linear-gradient(135deg,#1d4ed8,#2563eb)` (line 202 데스크톱 일괄 / line 370 모바일 카드 버튼). §6.4 의 "저장/CTA 그라데이션" 후보처럼 보이지만, **13-schedule W6 LOCKED b 결정에 따라 본 페이지에서도 그라데이션 폐기 → `bg-safe-bar` solid 통일.** 근거:
> - 13-schedule W6 LOCKED b 일관 정책 (sketch-wave-6.html 의 CTA 버튼 패턴)
> - memory `feedback_design_sketch_first` — 그라데이션 차이는 시각 손실, sketch 로 먼저 컨펌
> - memory `feedback_tailwind_token_class_pattern` — class 패턴은 `bg-safe-bar` (status- prefix 없음)
>
> 이 결정은 §7 OQ #1/#3 에서 사용자 컨펌 받음 (default = solid).

---

# §4 02+06 chrome 통일 룰 적용 여부

14-reports 페이지는 **점검 페이지 시리즈가 아닌 출력(다운로드) 페이지** → `inspection-modal-chrome-rules.md` 의 chrome 룰 전체 적용 대상은 아니다. 02 InspectionPage 모달 / 06 FloorPlanPage 처럼 zone/category/floor/line 선택 wrapper 가 없기 때문.

단, 다음 3가지 패턴은 본 페이지에 **mirror**:

1. **헤더 폰트 크기** — chrome 룰 §2.3 의 `text-body font-bold text-text-primary truncate` (16px) 패턴 또는 design-system §2.7 의 `text-title` (18px) 둘 다 허용. ReportsPage 모바일 헤더 line 337 `fontSize: 14, fontWeight: 700` 은 **14 → 16px 상향** 필요 (마이그레이션 룰 §4.2).

2. **뒤로 버튼 패턴** — chrome 룰 §7.2 매핑의 06 unique chrome 패턴 mirror:
   ```tsx
   <button className="w-8 h-8 rounded-sm bg-surface-sunken border border-border-default text-text-secondary inline-flex items-center justify-center">
     <ChevronLeft size={15} />
   </button>
   ```
   ReportsPage line 332~336 의 `<button>` + inline `<svg>` 를 lucide `ChevronLeft` 로 교체. `w-8 = 48px` 함정 (memory `feedback_tailwind_w8_h8_is_48px`) → 만약 32px 원하면 `w-7 h-7` 또는 `w-[32px] h-[32px]` 명시.

3. **BottomNav 숨김 확인** — `cha-bio-safety/src/App.tsx` line 71 `MOBILE_NO_NAV_PATHS` 실측 결과 **`/reports` 이미 등재됨** ✅. 추가 액션 없음. 단, W7 변환 wave 진입 시 `App.tsx` 변경하지 않는다는 점 명시 (본 wave 의 §6 negative rule 에도 포함).

---

# §5 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 10건. 각 룰은 `feedback_*.md` 파일명 + 1줄 요약 + Why + How (14-reports 컨텍스트) 3 항목.

### 룰 1 — feedback_design_sketch_first.md
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (14-reports)**: W3 진입 직전 카드 spacing/sizing (예: 카드 간 margin 10px / radius 14px / padding 14px) 도 sketch-wave-3 안에 그대로 보이도록. "이거 작게/크게 해보자" 라는 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement.md
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (14-reports)**: 보고서 카드는 진척률 표현이 아니므로 좌측 색바 = `accent` (선택) / 무색 (비선택) 만. `bg-fire-bar` 또는 `text-danger` 같은 status 색 카드 배경/텍스트로 사용 금지. 다운로드 버튼은 CTA → `bg-safe-bar` solid (의미: "이 작업 실행" 정상 CTA).

### 룰 3 — feedback_sketch_realistic_data.md
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 "DIV · 34개소" 같은 텍스트를 "DIV · 30개소" 로 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (14-reports)**: REPORT_CARDS 10 entry 의 title/sub 카피 verbatim. ASSISTANTS 3명 `['석현민', '김병조', '박보융']` verbatim. footer 안내 카피 verbatim. 그라데이션 → solid 같은 시각 변경만 sketch 에서 처리.

### 룰 4 — feedback_planner_prompt_sketch_verbatim.md
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (14-reports)**: W7 변환 wave 진입 직전 sketch-wave-2~6.html 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → W7 checklist 안에 그대로 인용. 예: `grep -oE 'class="[^"]+"' sketch-wave-N.html | sort -u` 결과 박제.

### 룰 5 — feedback_tailwind_token_class_pattern.md
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (14-reports)**: W2/W3 카드 배경 = `bg-surface-raised` / 다운로드 버튼 = `bg-safe-bar` / 색상 = `text-safe` (정상 CTA). 만약 sketch 에서 `bg-status-safe-bar` 같은 prefix 사용하면 W7 verify gate FAIL. lucide 아이콘 = `<Download size={16} />` (className 으로 `w-4 h-4` 금지).

### 룰 6 — feedback_tailwind_w8_h8_is_48px.md
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (14-reports)**: 모바일 헤더 뒤로 버튼 = ReportsPage line 388 `iconBtn` 34×34 → sketch 에서 32×32 원하면 `w-7 h-7` 또는 `w-[32px] h-[32px]` 명시. ‹·› 토글 버튼 = line 394 `navBtn` 28×28 → `w-[28px] h-[28px]` (28 은 spacing 토큰 외) 또는 가장 가까운 `w-7 h-7` (32px) 로 상향. 데스크톱 일괄 다운로드 버튼 height 32 → `h-8 = 48px` 함정 발생 → `h-[32px]` 또는 `h-input` (44px) 으로 명시.

### 룰 7 — feedback_text_caption_leading_none.md
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (14-reports)**: 모바일 헤더 ‹·› 토글 안 텍스트 (year 표시 line 346 `fontSize: 13` → text-label) — 컨테이너 작으면 `leading-none` 추가. 데스크톱 상단 바 "연도" 라벨 (line 190 `fontSize: 12` → text-caption) — `leading-none` 명시 권장. 좌측 패널 섹션 헤더 (line 261 `fontSize: 11` → text-caption 상향 후) — 작은 영역이므로 `leading-none` 명시.

### 룰 8 — feedback_tsx_wave_emoji_dot_gap.md
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- **How to apply (14-reports)**: 모바일 카드 line 374 `'⬇ 엑셀 다운로드'` 의 ⬇ (U+2B07) **이모지 제거** + lucide `<Download size={16} />` 로 교체. ReportsPage 의 가운뎃점 `·` (line 360 sub "DIV · 34개소 · {year}년도" 등) → sketch 에서 dot span (`<span class="text-text-tertiary">·</span>`) 으로 명시 (sketch-wave-2/3 negative gate: 이모지 0 + dot span 사용).

### 룰 9 — feedback_tsx_wave_stat_card_drift.md
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (14-reports)**: 14-reports 에는 Stat Card 가 없으므로 §3.5 인용 후 "미적용" 메타 명시. 단, sketch 새 패턴이 무엇이든 (예: 데스크톱 좌측 패널 row 의 isSelected 좌측 3px accent 색바) verbatim 인용해 W7 checklist 박제.

### 룰 10 — feedback_avoid_premature_confirmation.md
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (14-reports)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W7 진입 시점도 사용자 컨펌 명시 받은 후에만.

### 룰 11 — feedback_gsd_workflow_strict.md (보너스, strict-regex 보강용)
- **요약**: redesign sketch/TSX 변환은 `/gsd:quick` 또는 `/gsd:ui-phase` 시작 필수. ad-hoc PLAN/SUMMARY 직접 작성 금지. 컨텍스트 낭비 + 메모리 룰 위반 사고 방지.
- **Why**: 본 wave 자체가 `/gsd:quick` (Quick ID 260520-ep5) 로 시작된 wave. PLAN.md + SUMMARY.md 의 atomic 1-commit 패턴은 GSD 워크플로 룰 그대로.
- **How to apply (14-reports)**: W2~W7 모두 새로운 `/gsd:quick` 또는 `/gsd:execute-phase` 시작 — 본 인덱스에서 미리 분배한 file path 그대로 atomic commit. ad-hoc 으로 sketch HTML 직접 작성 금지.

---

# §6 negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **ReportsPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/ReportsPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD~..HEAD -- cha-bio-safety/src` 결과 0 줄.
- **ExcelPreview.tsx 코드 수정 금지** — 동일. W6 wrapper 작업에서도 ExcelPreview 내부는 손대지 않음 (W6 는 wrapper layout 만).
- **다른 페이지 (13-schedule / 02 / 06 등) 영향 금지** — `git status` 에 14-reports/ 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md` (디자인 wave 중 wrangler --project-name=cbc7119 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 cbc7119-preview.pages.dev 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md`. 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지.
- **13-schedule sketch 폴더 구조와 다른 패턴 도입 금지** — 13-schedule 실측 = 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 14-reports 도 동일 평면 배치.
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` 이미 `/reports` 등재됨 (line 71 실측 확인). 본 wave + W2~W7 모두 App.tsx 손대지 않음.

---

# §7 open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call).

- OQ #1: 모바일 카드 그라데이션 버튼 (`linear-gradient(135deg,#1d4ed8,#2563eb)`, ReportsPage.tsx line 370) → `bg-safe-bar` solid 로 통일 OK? **default: OK** — 13-schedule W6 LOCKED b 일관 + design-system §6.4 의 CTA 그라데이션 폐기 룰.

- OQ #2: 데스크톱 좌측 패널 너비 — 현재 260px 유지 (ReportsPage.tsx line 250 `width: 260`) / 디자인 토큰 (`--sidebar-width` 가 있다면) 일관 / 다른 너비 조정 중 어느 것? **default: 260px 유지** — design-system 토큰에 `--sidebar-width` 없음, ReportsPage 의 unique 너비. 단 sketch 에서 토큰 추가 제안 가능.

- OQ #3: 데스크톱 상단 바 일괄 다운로드 버튼 그라데이션 (ReportsPage.tsx line 202) → `bg-safe-bar` solid 통일 OK? **default: OK** — OQ #1 과 동일 일관.

- OQ #4: 모바일 footer 안내 "다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)" (ReportsPage.tsx line 380) — 유지 / 제거 / 위치 변경 중 어느 것? **default: 유지** — 사용자 가이드 정보, 카피 변경은 메모리 룰 3 (sketch_realistic_data) 위반 위험. 시각 변경만 (예: `text-caption text-text-tertiary text-center`).

- OQ #5: 카드 sub 라인 "DIV · 34개소 · {year}년도" (ReportsPage.tsx line 360 ~ line 13 `sub: 'DIV · 34개소'` 의 가운뎃점 `·`) 처리 — dot span (memory `feedback_tsx_wave_emoji_dot_gap`) 으로 명시 / 텍스트 가운뎃점 유지 / 13-schedule sub-wave 일관 패턴 따를지? **default: dot span** — 13-schedule sketch-wave-2/3 패턴 일관. `<span class="text-text-tertiary">·</span>` 으로 명시해 TSX 변환 wave 에서도 dot 표현 보존.

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

본 문서가 후속 wave 진입 자격을 갖췄는지 verify:

| gate | 검증 명령 | 기대값 | 결과 |
|---|---|---|---|
| 1. 7 헤더 존재 | `grep -E '^### §[1-7] ' wave-1-index.md \| wc -l` 또는 `^# §[1-7]` | =7 | PASS (`# §1`~`# §7` 7개) |
| 2. sub-wave 분배 표 ≥6 | `grep -E '^\| W[2-7] ' wave-1-index.md \| wc -l` | ≥6 | PASS (W2~W7 6 row) |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+\.md' wave-1-index.md \| sort -u \| wc -l` | ≥10 | PASS (10 strict-regex slug + 1 보너스 `feedback_cbc7119_design_never_wrangler.md` digit-포함 = 11 inclusive) |
| 4. negative §6 안 wrangler+npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 | PASS |
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src migrations scripts` | 0 lines | PASS (write target = docs/ 만) |
| 6. OQ §7 ≥5 | `grep -cE '^- OQ #' wave-1-index.md` | ≥5 | PASS (OQ #1~#5) |
| 7. design-system fence ≥6 (open+close) | `grep -c '^```' wave-1-index.md` | ≥6 | PASS (§3.1~§3.7 의 fence × 2) |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 5건 답변으로 받는다.
