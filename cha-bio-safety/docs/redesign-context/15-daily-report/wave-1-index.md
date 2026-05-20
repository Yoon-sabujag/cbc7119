---
title: "redesign/15-daily-report — sketch wave 1 (index)"
status: locked
created: 2026-05-21
quick_id: 260521-1k6
branch: redesign/15-daily-report
source_tsx: cha-bio-safety/src/pages/DailyReportPage.tsx
source_tsx_lines: 840
design_system: cha-bio-safety/docs/redesign-context/15-daily-report/design-system.md (v0.1.1, c8bfa86)
mirror_of: cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md
sub_wave_count: 6 (W2~W7)
memory_rules_inline: 10
open_questions: 7
inherit_from: cha-bio-safety/src/styles/components.css (14-reports SW1 결과 — 6 class 재사용)
---

# redesign/15-daily-report — sketch wave 1 (index)

본 문서는 W2~W7 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:
- DailyReportPage.tsx (840 라인) 의 element 인벤토리 → 6 sub-wave 분배
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6.1 / §6.2 / §6.4 / §7.1 의 verbatim 룰 박제
- 14-reports SW1 결과 (`cha-bio-safety/src/styles/components.css`) 의 class inherit / 신규 정의 매핑
- 메모리 룰 10건 (`feedback_*.md`) inline 인용 — 15-daily-report 컨텍스트에 어떻게 적용할지
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 7건 — W2 진입 직전 사용자 컨펌

작성일: 2026-05-21 / Quick ID: 260521-1k6 / Branch: redesign/15-daily-report

> ⚠ 14-reports / 13-schedule 폴더 구조 실측 결과: **평면(flat sibling) 패턴** — `14-reports/sketch-wave-N.html` 직접 배치, `sketch/` 서브폴더 없음. 15-daily-report 도 동일하게 평면 배치 결정. 본 인덱스 파일도 `15-daily-report/wave-1-index.md` (flat sibling) 으로 위치한다.

---

# §1 DailyReportPage.tsx 인벤토리

본 인벤토리는 DailyReportPage.tsx (840 lines, 15-daily-report.md 메타와 일치) 의 element 를 imports/상수 / 메인 컴포넌트(모바일/데스크톱) / 공통 본문 / dateNav / 캘리브레이션 / EditableCard 영역으로 나눠 정리한다. line 범위는 **실측 결과**.

## §1.1 Imports & 상수 (line 1~58)

| 영역 | element | line 범위 | 역할 | 후속 wave |
|---|---|---|---|---|
| imports | `useState/useEffect/useCallback/useRef`, `useNavigate`, `useQuery/useQueryClient`, `toast`, `dailyReportApi`, `buildDailyReportData`, `generateDailyExcel`, `useStaffList`, `useIsDesktop` | 1~10 | React Query + API + 데스크톱 분기 hook | W7 (TSX checklist) |
| 날짜 유틸 | `todayKST()`, `addDays()`, `nowKSTHour()` | 12~27 | KST 기준 날짜 계산 | W7 (보존 룰) |
| `iconBtn` | 34×34 rounded-sm 둥근 버튼 | 30~34 | 뒤로 버튼 사양 (모바일 헤더) | W2 |
| `navBtn` | 28×28 rounded-sm + `lineHeight: '1'` | 36~41 | ‹/› 날짜 네비 버튼 | W2 |
| `card` | bg-bg2 + border + radius 14 + padding 14 + margin-bottom 10 | 43~46 | EditableCard / 인원현황 카드 공통 wrapper | W3 |
| `textareaStyle` | fontSize 12 + padding 10/12 + resize vertical | 48~53 | EditableCard textarea | W3 |
| `smallBtn` | fontSize 10 + 4/10 padding + radius 6 | 55~58 | 초기화/저장 작은 버튼 | W3 |

**주: fontSize 10/11/12 다수 출현** — line 51 (textarea 12), line 56 (smallBtn 10), line 381 (안내 10), line 391 (날짜 13), line 419/428 (인쇄 미리보기 11) → 마이그레이션 룰 §4.2 (9·10·11px 일괄 상향) 적용 대상.

## §1.2 Main 컴포넌트 — 모바일 렌더 (line 446~465)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| 자체 헤더 | bg-bg2 + border-bottom + padding 8/12/9 + flex 헤더 — 뒤로 버튼 (line 451 inline svg) + 타이틀 "일일 업무 일지" (line 456 `fontSize: 14, fontWeight: 700`) + dateNav | 449~458 | `useNavigate(-1)` (line 451), `dateNav` 인라인 (line 457) |
| 스크롤 본문 | `flex: 1, overflowY: 'auto', padding: '12px 16px'` | 461~463 | `formContent` 인라인 (line 462) |

**주: line 456 `fontSize: 14`** — 마이그레이션 §4.2 노안 룰에 따라 → text-title (18px) 상향. 14-reports `.page-title` (18px) inherit 패턴.
**주: line 452~454 inline `<svg>`** — lucide `ChevronLeft size={15}` 로 교체 (chrome 룰 §7.2 / 14-reports 동일 패턴).

## §1.3 Main 컴포넌트 — 데스크톱 렌더 (line 403~444)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| 좌측 편집 패널 | `flex: 1, overflow: auto, padding: '24px 32px'` — dateNav flex-end (line 410~412) + formContent (line 413) | 405~414 | dateNav 인라인 |
| 우측 A4 portrait preview | `aspectRatio: '210 / 297', height: '100%', flexShrink: 0, borderLeft: '1px solid var(--bd)', overflow: 'hidden'` + "인쇄 미리보기" 라벨 (line 426~433) + `<DailyPortraitPreview>` (line 434~440) | 416~441 | `DailyPortraitPreview` props 시그니처 (line 434~440: `date`, `todayText`, `tomorrowText`, `notes`, `personnel`) |

**주: 라벨 line 428 `fontSize: 11`** — 마이그레이션 §4.2 → text-caption (12px) 상향. 단 라벨 자체 카피 ("인쇄 미리보기") verbatim 유지 (memory `feedback_sketch_realistic_data`).
**주: `useIsDesktop` 분기 — line 64 hook + line 404 분기** = 소스 이미 모바일/데스크톱 분기 구현. OQ #5 default 재조정 (분기 보존).

## §1.4 공통 본문 formContent (line 270~385)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| EditableCard × 3 | 금일업무 (rows=10) + 명일업무 (rows=5) + 특이사항 (rows=4) — `<EditableCard label field value onChange onSave onReset saving rows placeholder />` | 273~296 | `handleManualSave` (line 169), `handleReset` (line 184), `debouncedSave` 2초 (line 150), `saving[field]` state |
| 인원현황 카드 | label "인원현황" + body "총원 N · 현재원 M · 비번 X · 연차 ..." (line 305~314) | 298~318 | `preview?.personnel` 데이터 + 가운뎃점 `·` 구분자 (W3 dot span 으로 치환) |
| 다운로드 버튼 | 모바일/데스크톱 분기 — daily 그라데이션 버튼 + monthly border 버튼 | 320~379 | `handleDailyDownload` (line 197), `handleMonthlyDownload` (line 212), 그라데이션 line 328/357 (OQ #1) |
| 안내 줄 | "수정 내용은 자동 저장됩니다 · 월별은 저장된 모든 날짜를 포함합니다" | 381~383 | 정적 (`fontSize: 10` → text-caption 12) — 14-reports `.page-footer-note` inherit |

**주: 다운로드 버튼 line 334/347/363/376 의 ⬇ 글리프 (U+2B07) 4건** — memory `feedback_tsx_wave_emoji_dot_gap` 에 따라 lucide `<Download size={16} />` 교체 (W4 처리).
**주: 그라데이션 `linear-gradient(135deg,#1d4ed8,#2563eb)` 2건 (line 328/357)** — 14-reports W6 LOCKED b 일관 결정 → `bg-safe-bar` solid 통일 (OQ #1, default OK).

## §1.5 dateNav 공통 (line 387~401)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| ‹ navBtn | line 390 — `<button onClick={goBack} style={navBtn}>‹</button>` | 390 | `goBack` (line 193, `setDate(d => addDays(d, -1))`) |
| 날짜 표시 | `<span>` width 90 + fontSize 13 + fontWeight 700 | 391~393 | `date` state (line 68, `YYYY-MM-DD`) |
| › navBtn 또는 spacer | `canForward ? <button>›</button> : <span width:28 />` (line 394~399) | 394~399 | `canForward = date < today` (line 80) — 미래 날짜 시 chevron spacer 로 자리 유지 |

**주: 미래 날짜 비활성 UX (line 394~399)** — chevron 자체 숨김 + spacer 28px. (OQ #3, default = 유지).

## §1.6 캘리브레이션 + DailyPortraitPreview + DailyCalibMarker (line 468~808)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| `DAILY_CALIB_STEPS` 15 step | date / today / tomorrow / notes / pTotal / pPresent / pDuty / pOff / pRest / pLeave / pHalf / pTraining / pAbsent / dayWorker / dutyWorker | 469~485 | 인쇄 미리보기 좌표 캘리브레이션 (15 key) |
| 상수 | `DAILY_CALIB_KEY = 'calib_daily_report'`, `FINGER_OFFSET = 60` | 487~488 | localStorage key + 손가락 가림 보정 |
| `loadDailyCalib` / `saveDailyCalib` | localStorage 의 캘리브 데이터 직접 IO | 494~499 | 좌표 저장/로드 |
| `DailyPortraitPreview` 컴포넌트 | A4 portrait image (`/templates/preview/daily-1.png`, line 662) + 오버레이 (LARGE_KEYS, overlayItems) + 캘리브레이션 모드 + 위치 설정 버튼 | 501~782 | `useState(calibMode)`, `onCalibTouchStart/Move/End`, `clientToImgPct`, `advanceStep`, `<DailyCalibMarker>` 호출 |
| 위치 설정 버튼 | `hasCalib ? '위치 재설정' : '⚠ 위치 설정'` (line 777) | 766~779 | 캘리브 진입/완료 토글 (line 774 `fontSize: 12` = OK = text-caption 그대로) |
| `DailyCalibMarker` 컴포넌트 | 캘리브 십자 + 라벨 마커 (active 시 16→20 확대) | 784~808 | 좌표 시각화 |

**주: 12-staff W8 lp[] 패턴 mirror** — W6 wrapper wave 가 내부 캘리브레이션/오버레이/이미지 좌표 시스템 모두 **100% 보존**, 외곽 wrapper / 안내 바 / 버튼 만 손댐.
**주: line 777 의 ⚠ 글리프** — OQ #7 (default = lucide `<AlertTriangle size={14} />` 교체).

## §1.7 EditableCard (line 810~840)

| 영역 | element | line 범위 | 비즈 로직 연결 |
|---|---|---|---|
| wrapper | `style={card}` (`bg-bg2 + border + radius 14 + padding 14`) | 817 | `card` 상수 (line 43~46) |
| 헤더 | label + 초기화 버튼 + 저장 버튼 | 818~828 | label `fontSize: 13` (line 819) → text-body 16 상향 / smallBtn `fontSize: 10` (line 55) → text-caption 12 상향 |
| textarea | `textareaStyle` (`fontSize: 12`, line 48) + onFocus/onBlur border 변경 | 829~837 | `rows` prop (10/5/4), `value`/`onChange`, placeholder 분기 |

**주: 단일 컴포넌트 3 카드 재사용** — 금일/명일/특이사항 모두 동일 컴포넌트. W3 sketch 에서 새 디자인도 단일 컴포넌트 유지.

## §1.8 파일 라인 수 확인

`wc -l cha-bio-safety/src/pages/DailyReportPage.tsx` 실측 결과 = **840 라인** (15-daily-report.md 메타 + task_scope 추정 일치, drift 없음).
`useIsDesktop` import 확인 = **line 10 import + line 64 사용** → 소스 이미 모바일/데스크톱 분기 구현. OQ #5 default 재조정 (분기 보존).
⬇ 글리프 (U+2B07) 사용처: **line 334, 347, 363, 376 — 4건** (memory `feedback_tsx_wave_emoji_dot_gap` 적용 대상).
그라데이션 사용처: **line 328, 357 — 2건** (`linear-gradient(135deg,#1d4ed8,#2563eb)` 동일, 14-reports W6 LOCKED b 일관 통일 대상).

---

# §2 6 sub-wave 분배 plan

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 모바일 헤더 + 날짜 네비 | DailyReportPage 모바일 헤더 (line 449~458) + dateNav (line 387~401) | sketch-wave-2-mobile-header-date-nav.html |
| W3 | 공통 본문 — EditableCard 3종 + 인원현황 카드 | formContent EditableCard × 3 (line 273~296) + 인원현황 카드 (line 298~318) + EditableCard 컴포넌트 (line 810~840) | sketch-wave-3-editable-cards-personnel.html |
| W4 | 다운로드 액션 (모바일/데스크톱 공통) | formContent 다운로드 버튼 영역 (line 320~379) + 안내 줄 (line 381~383) | sketch-wave-4-download-action.html |
| W5 | 데스크톱 layout (좌측 편집 + 우측 A4 preview 분할) | DailyReportPage 데스크톱 렌더 (line 403~444) | sketch-wave-5-desktop-layout.html |
| W6 | DailyPortraitPreview wrapper (내부 캘리브레이션 보존) | DailyPortraitPreview wrapper (line 501~782 중 외곽만) — `.daily-portrait-wrapper` + `.daily-portrait-setup-btn` 등 | sketch-wave-6-portrait-preview-wrapper.html |
| W7 | TSX 변환 verify checklist (markdown, sketch 아님) | W2~W6 sketch + DailyReportPage.tsx 비즈 로직 보존 룰 + 14-reports inherit class 매핑 + 신규 class 명단 | wave-7-tsx-conversion-checklist.md |

## §2.1 각 wave 보존 / 토큰 / 폰트

### W2 — 모바일 헤더 + 날짜 네비
- **보존**: `useNavigate(-1)` (line 451), `setDate(d => addDays(d, -1))` (line 193, goBack), `setDate(d => addDays(d, 1))` (line 194, goForward — `canForward` guard), `date` state 형식 `YYYY-MM-DD` (line 68), `isFutureDate = date > today` 분기 (line 79)
- **토큰**: 헤더 = `.page-header` (14-reports inherit) / 뒤로 버튼 = `.back-btn` (14-reports inherit, w-[34px]) / 타이틀 = `.page-title` (18px, font-size 상향) / 날짜 네비 = **새 class** `.date-nav` / `.date-nav-btn` (w-7 h-7 = 32px, w-8 함정 회피 — memory `feedback_tailwind_w8_h8_is_48px`) / `.date-display` (min-w 90px, leading-none — memory `feedback_text_caption_leading_none`)
- **폰트**: 타이틀 18px text-title / 날짜 14~16px text-body-sm 또는 text-body / ‹/› 16px (현 line 38 그대로) — **9·10·11px 0건**

### W3 — EditableCard × 3 + 인원현황
- **보존**: EditableCard 컴포넌트 시그니처 100% (label / field / value / onChange / onSave / onReset / saving / rows / placeholder), `handleManualSave` (line 169), `handleReset` (line 184), `debouncedSave` 2초 (line 150), `rows` prop verbatim (10/5/4), 인원현황 텍스트 조립 (line 305~314) — `총원 N · 현재원 M · 비번 X · 연차 ...` 가운뎃점 `·` dot span 으로 치환 (memory `feedback_tsx_wave_emoji_dot_gap`)
- **토큰**: 카드 = **새 class** `.editable-card` (bg-surface-raised, rounded-md, border, padding 14) / 헤더 = `.editable-card-head` (flex, margin-bottom 8) / 라벨 = `.editable-card-label` (text-body 16px → 마이그레이션 §4.2 line 819 `fontSize: 13` 상향) / 초기화·저장 버튼 = `.editable-card-btn--reset` / `.editable-card-btn--save` (smallBtn line 55 `fontSize: 10` → 12px text-caption 상향) / textarea = `.editable-card-textarea` (line 48 `fontSize: 12` → text-body 16px 검토, 또는 text-body-sm 14px 유지)
- **폰트**: 라벨 13→16 (마이그레이션 §4.2), 버튼 10→12, textarea 12→14~16. **9·10·11px 0건.**

### W4 — 다운로드 액션
- **보존**: `handleDailyDownload` (line 197), `handleMonthlyDownload` (line 212), 그라데이션 → solid 통일 결정 (OQ #1), 카피 verbatim `${Number(mm)}월${dd}일 방재업무일지 다운로드` (line 334, 363) + `일일업무일지(${mm}월) 다운로드` (line 347, 376), 안내 verbatim `수정 내용은 자동 저장됩니다 · 월별은 저장된 모든 날짜를 포함합니다` (line 382)
- **토큰**: daily 버튼 = **새 class** `.download-btn--daily` (`bg-safe-bar` solid, 14-reports W6 LOCKED b 일관 / OQ #1) / monthly 버튼 = `.download-btn--monthly` (`bg-surface-sunken border border-border-strong`, 보조 액션) / 컨테이너 = `.download-action` (모바일 stack, 데스크톱 flex gap 8) / 안내 = `.page-footer-note` (14-reports inherit, 12px text-caption text-text-tertiary text-center)
- **폰트**: 버튼 13 → text-body 16 (마이그레이션 §4.2 카드 제목/CTA 16~18) / 안내 10 → 12 (text-caption). **9·10·11px 0건.** 이모지 ⬇ 4건 (line 334, 347, 363, 376) → lucide `<Download size={16} />` 교체 (memory `feedback_tsx_wave_emoji_dot_gap` + design-system §7.1).

### W5 — 데스크톱 layout (좌측 편집 + 우측 A4 portrait preview)
- **보존**: 데스크톱 분기 (`useIsDesktop` line 64), 좌측 패널 `flex: 1, overflow: auto, padding: '24px 32px'` (line 408), 우측 패널 `aspectRatio: '210 / 297', height: '100%', flexShrink: 0, borderLeft` (line 416~423), 우측 상단 "인쇄 미리보기" 라벨 (line 426~433, line 432 텍스트 verbatim)
- **토큰**: 좌측 컨테이너 = bg-surface-page + page-padding (24px) / 우측 컨테이너 = `.daily-portrait-wrapper` (aspectRatio 210/297, borderLeft border-default, bg-surface-page) / "인쇄 미리보기" 라벨 = `.daily-portrait-print-label` (text-caption text-text-secondary uppercase, position absolute top-2 leading-none)
- **폰트**: 데스크톱이라도 모바일과 동일 (§1.3 절대 룰). "인쇄 미리보기" 11 → 12 text-caption 상향 (마이그레이션 §4.2). dateNav flex-end 정렬 (line 410) 그대로.

### W6 — DailyPortraitPreview wrapper
- **보존**: `<DailyPortraitPreview date={date} todayText={todayText} tomorrowText={tomorrowText} notes={notes} personnel={preview?.personnel} />` props 시그니처 verbatim (line 434~440). 내부 캘리브레이션 로직 (`onCalibTouchStart` / `onCalibTouchMove` / `onCalibTouchEnd` / `clientToImgPct` / `advanceStep` / `loadDailyCalib` / `saveDailyCalib` / `DAILY_CALIB_STEPS` 15 step / FINGER_OFFSET 60 / LARGE_KEYS / overlayItems) **100% 보존** — 12-staff W8 lp[] 패턴 mirror.
- **토큰**: 외곽 wrapper = `.daily-portrait-wrapper` / `<img>` = `.daily-portrait-image` (maxWidth/maxHeight 100%, objectFit contain, rounded-sm, bg-white) / 오버레이 영역 = `.daily-portrait-overlay-area` (position absolute, pointerEvents 캘리브 모드 분기) / 캘리브레이션 안내 바 = `.daily-portrait-calib-bar` (line 732~763 — position absolute top-2 transform translateX, padding 10px 20px, font-weight 700) / 확인 버튼 = `.daily-portrait-calib-confirm` (bg-safe solid) / 취소 버튼 = `.daily-portrait-calib-cancel` (bg overlay) / 위치 설정 버튼 = `.daily-portrait-setup-btn` (line 766~779, hasCalib 분기 → modifier class)
- **폰트**: 캘리브 안내 바 폰트 14·11 그대로 (오버레이 UI, 정보 노출 UX). **단, 위치 설정 버튼 line 776 `fontSize: 12` 는 text-caption 그대로 (12px = OK).**

### W7 — TSX 변환 verify checklist (markdown)
- **보존**: DailyReportPage.tsx 의 모든 비즈 로직 100% 보존 (`useQuery × 2`, `useMutation` 없음, `useState × 7`, `useRef × 2`, `useCallback × 7`, `useEffect × 1`, `handleDailyDownload`, `handleMonthlyDownload`, `handleManualSave`, `handleReset`, `handleTodayChange`, `handleTomorrowChange`, `handleNotesChange`, `goBack`, `goForward`, `debouncedSave`, `buildDailyReportData`, `generateDailyExcel`, `dailyReportApi.*`, `loadDailyCalib`, `saveDailyCalib`). UI markup 만 재작성.
- **토큰**: W2~W6 sketch 의 모든 Tailwind class / CSS class 정의를 verbatim grep 추출 → W7 checklist 안에 인용 (memory `feedback_planner_prompt_sketch_verbatim`).
- **폰트**: design-system §2.7 + 마이그레이션 §4.2 박제. 9·10·11px 0건 룰 명시.

---

# §3 design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

본 인용은 `cha-bio-safety/docs/redesign-context/15-daily-report/design-system.md` (v0.1.1, c8bfa86) 원문 그대로. 후속 wave 작업자가 design-system.md 를 별도로 열지 않아도 핵심 룰을 본 인덱스에서 직접 확인 가능하도록 박제한다.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

> 15-daily-report 의 fontSize 출현: 10 (smallBtn line 56), 11 (인쇄 미리보기 line 428), 12 (textarea line 51, 안내 line 381, 위치설정 line 774), 13 (날짜 line 391, EditableCard label line 819), 14 (헤더 타이틀 line 456) — **§1.1 위반 다수**. W2~W6 sketch + W7 변환 시 11 → 12 / 10 → 12 / 13 → 16 / 14 → 18 일괄 상향 (마이그레이션 §4.2). 단 캘리브레이션 오버레이 UI (안내 바 14·11) 는 정보 노출 UX 우선이라 예외 검토.

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

> 15-daily-report 에 적용 — EditableCard (금일/명일/특이사항) + 인원현황 카드 + 다운로드 액션 + 안내 줄 4 위계가 시각적으로 분명히 구분되어야 함. 카드 경계는 `border border-border-default` 명확. 그라데이션 폐기 (§3.7) 가 §1.2 의 "장식 빼기" 룰 연속.

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

> 15-daily-report 에 적용 — 데스크톱은 좌우 분할 (좌측 편집 + 우측 A4 portrait) **레이아웃** 으로 밀도 차이 책임. 폰트는 모바일과 동일 (W5 sketch 의 절대 룰). page-padding `--page-padding` 자동 분기 (모바일 16 / 데스크톱 24).

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

> **§6.1 미적용 — 15-daily-report 페이지에는 진척률 도넛/카테고리 카드 없음.** 자동 집계 카드 / EditableCard / 인원현황 카드는 raw 정보 카드 (진척률 표현 아님). Progress Color Rule 미적용. 다만 §6.4 그라데이션 폐기 룰은 **적용** (OQ #1 — 다운로드 버튼 그라데이션 → `bg-safe-bar` solid).

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

> **§6.2 / §7 ("Stat Card" 룰) 미적용 — 15-daily-report 페이지에는 통계 숫자 카드 없음.** 인원현황 카드는 "총원 N · 현재원 M · ..." 텍스트 줄 형식 (28px display 숫자 아님). W7 변환 wave executor 가 이 룰을 verbatim 인용 안 했다고 deviation 으로 잡으면 안 됨 (memory `feedback_tsx_wave_stat_card_drift`). drift 방지 명시 박제.

## §3.6 design-system §7.1 Lucide Icon System (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

> **§7 / §10 Iconography — Lucide `ChevronLeft` + `Download` 2개 사용.** DailyReportPage.tsx 는 현재 line 452~454 의 raw `<svg>` 와 line 390 `navBtn` 안 텍스트 `‹` / line 396 `›` 사용 중. W2 진입 시 lucide `<ChevronLeft size={15} />` (뒤로 버튼) + `<ChevronLeft size={16} />` / `<ChevronRight size={16} />` (날짜 네비) 로 교체. line 334/347/363/376 의 `⬇` 글리프 4건 → `<Download size={16} />` 로 교체 (이모지 사용 금지 룰). line 777 의 ⚠ 글리프 → lucide `<AlertTriangle size={14} />` 교체 (OQ #7 default).

## §3.7 design-system §6.4 Backgrounds & Gradients 폐기 룰 (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

> 15-daily-report 현재 그라데이션 = line 328 / line 357 `linear-gradient(135deg,#1d4ed8,#2563eb)`. 14-reports W6 LOCKED b 결정 (sketch-wave-6.html CTA solid) 과 동일 정책 적용 → **그라데이션 폐기 → `bg-safe-bar` solid.** 근거:
> - 14-reports W6 LOCKED b 일관 정책
> - memory `feedback_design_sketch_first` — 그라데이션 차이는 시각 손실, sketch 로 먼저 컨펌
> - memory `feedback_tailwind_token_class_pattern` — class 패턴은 `bg-safe-bar` (status- prefix 없음)
> §7 OQ #1 에서 사용자 컨펌 (default = solid).

---

# §4 14-reports SW1 결과물 (components.css) inherit 매핑

본 페이지는 14-reports SW1 (`cha-bio-safety/src/styles/components.css` 의 40 class) 결과를 일부 재사용 가능. inherit / 신규 매핑:

## §4.1 재사용 가능 class (inherit, ≥3 항목 충족)

| class | 14-reports 정의 위치 | 15-daily-report 적용 element | 비고 |
|---|---|---|---|
| `.page-header` | components.css line 1 | DailyReportPage line 449~458 모바일 자체 헤더 | bg-surface-raised, padding 8 12 9 동일 |
| `.back-btn` | components.css line 2 | DailyReportPage line 451 뒤로 버튼 (34×34) | iconBtn line 30 동일 사양 |
| `.page-title` | components.css line 3 | DailyReportPage line 456 타이틀 "일일 업무 일지" | 18px text-title (현 14 → 18 상향) |
| `.page-body` | components.css line 8 | DailyReportPage line 461 스크롤 본문 (padding 12 16) | 동일 |
| `.dot-meta` | components.css line 15 | 인원현황 카드 "·" 구분자 (line 307~313) + dateNav 안 spacer | 4×4 회색 dot |
| `.page-footer-note` | components.css line 16 | DailyReportPage line 381~383 안내 줄 | text-align center, 12px, text-tertiary |

## §4.2 신규 정의 (W2~W6 sketch + W7 TSX wave 에서 components.css 추가, ≥10 항목 충족)
- `.date-nav` / `.date-nav-btn` / `.date-display` (3건, W2)
- `.editable-card` / `.editable-card-head` / `.editable-card-label` / `.editable-card-actions` / `.editable-card-btn--reset` / `.editable-card-btn--save` / `.editable-card-textarea` (7건, W3)
- `.summary-card` / `.summary-card-label` / `.summary-card-body` (3건, W3 — 인원현황 카드 별도 패턴)
- `.download-action` / `.download-btn--daily` / `.download-btn--monthly` (3건, W4)
- `.daily-portrait-wrapper` / `.daily-portrait-image` / `.daily-portrait-overlay-area` / `.daily-portrait-overlay-item` / `.daily-portrait-overlay-item--large` / `.daily-portrait-calib-bar` / `.daily-portrait-calib-confirm` / `.daily-portrait-calib-cancel` / `.daily-portrait-calib-marker` / `.daily-portrait-setup-btn` / `.daily-portrait-setup-btn--missing` / `.daily-portrait-print-label` (12건, W5+W6)

신규 class 합계 ≈28건. `≥10건` 요건 충족.

## §4.3 14-reports `.report-card-btn` ↔ 15-daily-report `.download-btn--daily` 비교
14-reports `.report-card-btn` (components.css line 13): `background: var(--status-safe-bar); color: var(--text-on-accent); font-size: 16px;` — 15-daily-report `.download-btn--daily` 도 동일 패턴 적용. 다만 daily 페이지는 height 자유, padding 12 (모바일) 그대로.

---

# §5 메모리 룰 inline 인용 (≥10건, verbatim slug)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건 (10 본문 + 2 보너스). 각 룰은 `feedback_*.md` 파일명 + 1줄 요약 + Why + How (15-daily-report 컨텍스트) 3 항목.

## 룰 1 — feedback_design_sketch_first.md
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저, 인라인 직행 금지
- **Why**: 변경 후 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적
- **How (15-daily-report)**: W3 EditableCard 카드 간 margin / padding / radius 도 sketch-wave-3 안에 명시. "초기화 버튼 작게/크게" 같은 인라인 변경 금지.

## 룰 2 — feedback_redesign_sketch_rule_enforcement.md
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성
- **Why**: status 색은 의미 fix — 미적 색으로 사용 시 정보 위계 무너짐
- **How (15-daily-report)**: EditableCard / 인원현황 카드는 정보 카드 → `bg-surface-raised border-border-default` 만. `bg-fire-bar` / `text-danger` 같은 status 색 배경/텍스트 사용 금지. 다운로드 버튼은 CTA → `bg-safe-bar` solid OK.

## 룰 3 — feedback_sketch_realistic_data.md
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄
- **Why**: 카피 임의 변경 시 코드 변경 wave 가 deviation 으로 잡음
- **How (15-daily-report)**: 카피 verbatim — "일일 업무 일지" (헤더), "금일업무" / "명일업무" / "특이사항" / "인원현황", "초기화" / "저장" / "저장 중..." / "생성 중..." / "월별 생성 중...", "${mm}월${dd}일 방재업무일지 다운로드" / "일일업무일지(${mm}월) 다운로드", "수정 내용은 자동 저장됩니다 · 월별은 저장된 모든 날짜를 포함합니다", "인쇄 미리보기", "위치 재설정" / "⚠ 위치 설정" (line 777). 시각 변경 (그라데이션 → solid, 14 → 16px) 만 sketch 에서 처리.

## 룰 4 — feedback_planner_prompt_sketch_verbatim.md
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 verbatim 인용
- **Why**: 토큰명/사이즈 추측은 deviation 유발 (03-qr-scan 6건 사례)
- **How (15-daily-report)**: W7 변환 wave 진입 직전 sketch-wave-2~6.html 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → W7 checklist 안에 verbatim 인용. 예: `grep -oE 'class="[^"]+"' sketch-wave-N.html | sort -u` 결과 박제.

## 룰 5 — feedback_tailwind_token_class_pattern.md
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지)
- **Why**: 11-div TSX v3 hotfix(4ce707e) — `status-` prefix tailwind.config 에 없어서 class 안 먹음
- **How (15-daily-report)**: 다운로드 버튼 = `bg-safe-bar` (`bg-status-safe-bar` X). 인원현황 카드 = `bg-surface-raised` (정보 카드, status 색 X). lucide 아이콘 = `<Download size={16} />` / `<ChevronLeft size={15} />` (className 으로 `w-4 h-4` 금지).

## 룰 6 — feedback_tailwind_w8_h8_is_48px.md
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용
- **How (15-daily-report)**: 뒤로 버튼 = line 30 `iconBtn` 34×34 → sketch 에서 `.back-btn` (14-reports inherit, w-[34px] h-[34px]) 또는 `w-7 h-7` (32px). 날짜 네비 ‹/› = line 36 `navBtn` 28×28 → `w-[28px] h-[28px]` 명시 또는 `w-7 h-7` (32px) 상향. **`w-8 h-8` (48px) 금지.**

## 룰 7 — feedback_text_caption_leading_none.md
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 작은 영역은 `leading-none` 명시
- **Why**: line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생
- **How (15-daily-report)**: 날짜 네비 안 날짜 표시 (line 391 `fontSize: 13` → text-label) `leading-none` 추가. ‹/› 버튼 안 텍스트 (line 38 `fontSize: 16`) `leading-none` 명시 (line 40 `lineHeight: '1'` 기존 룰 = leading-none 유지). 인원현황 카드 안 한 줄 텍스트는 본문 → `leading-relaxed` 유지.

## 룰 8 — feedback_tsx_wave_emoji_dot_gap.md
- **요약**: alias sed-replace X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify
- **Why**: sketch 의 `🎯` `⬇` 같은 글리프가 TSX 변환에서 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 자동 적용 안 됨
- **How (15-daily-report)**: ⬇ 글리프 (line 334, 347, 363, 376) **이모지 제거** + lucide `<Download size={16} />` 로 교체. ⚠ 글리프 (line 777, "⚠ 위치 설정") → lucide `<AlertTriangle size={14} />` 로 교체 또는 그대로 유지 (사용자 컨펌 OQ #7). 인원현황 카드 안 `·` 구분자 (line 307~313) → `<span class="dot-meta" />` 4×4 회색 dot span 으로 명시 (14-reports `.dot-meta` 재사용). dateNav 의 날짜 표시 (line 391) 좌우 ‹·› 사이는 dot 아닌 spacing 으로 처리.

## 룰 9 — feedback_tsx_wave_stat_card_drift.md
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰을 덮어쓰는 사고
- **How (15-daily-report)**: 15-daily-report 에는 Stat Card 없으므로 §3.5 인용 후 "미적용" 메타 명시. 단, sketch 새 패턴 (예: EditableCard 의 새 디자인) verbatim 인용해 W7 checklist 박제. 특히 EditableCard 의 라벨/버튼/textarea 폰트 상향 (13→16 / 10→12 / 12→14~16) 은 sketch 에서 명시, W7 변환 시 source line 819/55/48 의 fontSize 가 그대로 새 디자인 덮어쓰지 않게 verify.

## 룰 10 — feedback_avoid_premature_confirmation.md
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미
- **How (15-daily-report)**: 본 인덱스 완료 후 "§7 OQ 7건 컨펌 부탁" 보고만. "wave 1 완벽" / "W2 진입 가능" 같은 자신감 표현 금지. W2~W7 진입도 사용자 명시 컨펌 후에만.

## 룰 11 (보너스) — feedback_gsd_workflow_strict.md
- **요약**: redesign sketch/TSX 변환은 `/gsd:quick` 또는 `/gsd:ui-phase` 시작 필수. ad-hoc PLAN/SUMMARY 직접 작성 금지
- **Why**: 컨텍스트 낭비 + 메모리 룰 위반 사고 방지
- **How (15-daily-report)**: 본 wave 자체가 `/gsd:quick` (Quick ID 260521-1k6) 로 시작된 wave. W2~W7 모두 새로운 `/gsd:quick` 시작 — 본 인덱스에서 미리 분배한 file path 그대로 atomic commit. ad-hoc sketch HTML 직접 작성 금지.

## 룰 12 (보너스) — feedback_cbc7119_design_never_wrangler.md
- **요약**: 디자인 wave 중 wrangler --project-name=cbc7119 절대 X. main push 자동 cbc7119-preview 만
- **Why**: 직원 도메인 (`cbc7119.pages.dev`) 과 디자인 도메인 (`cbc7119-preview.pages.dev`) 분리 룰
- **How (15-daily-report)**: 본 워크트리 (cbc7119-design) 는 cbc7119-preview 만 다룸. wrangler 명령 + `npm run deploy` 모두 금지. §6 negative rule 에도 박제.

(unique slug ≥10건 — 1~10 본문 + 11/12 보너스 = 12개)

---

# §6 negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **DailyReportPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/DailyReportPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src` 결과 0 줄.
- **components.css 수정 금지** — 14-reports SW1 결과물 그대로. W7 TSX 변환 wave 에서만 신규 class 추가.
- **다른 페이지 (13-schedule / 14-reports / 02 / 06 등) 영향 금지** — `git status` 에 15-daily-report/ 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md`. `.claude/settings.local.json` deny 강제.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰. 직원 도메인 (`cbc7119.pages.dev`) 경로.
- **14-reports sketch 폴더 구조와 다른 패턴 도입 금지** — 14-reports 실측 = 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 15-daily-report 도 동일 평면 배치.
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` 이미 `/daily-report` 등재됨 (15-daily-report.md §2 메타 확인). 본 wave + W2~W7 모두 App.tsx 손대지 않음.
- **외부 의존 `/templates/preview/daily-1.png` 변경/이동 금지** — W6 wrapper wave 가 내부 image src 손대지 않음 (DailyPortraitPreview line 662 verbatim).

---

# §7 open questions (W2 진입 직전 사용자 컨펌, ≥5건)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 7건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call).

- **OQ #1**: 다운로드 버튼 그라데이션 (`linear-gradient(135deg,#1d4ed8,#2563eb)`, line 328 / line 357) → `bg-safe-bar` solid 통일 OK? **default: OK** — 14-reports W6 LOCKED b 일관 + design-system §6.4 CTA 그라데이션 폐기.

- **OQ #2**: 자동 집계 카드 (인원현황) 디자인 — (a) Progress §6.1 / (b) Stat Card §7 좌측 3px / (c) 단순 정보 카드. **default: (c) 단순 정보 카드** — 인원현황은 raw 정보 줄, 진척률/통계 28px display 숫자 아님. `bg-surface-raised border-border-default rounded-md p-card` 만.

- **OQ #3**: 미래 날짜 비활성 UX — 현재 소스 (line 394~399) 는 `›` 버튼을 spacer 로 대체 (chevron 자체 숨김). 유지 / chevron disabled+opacity / toast 알림 중? **default: 유지 (소스 그대로)** — 사용자가 이미 적응한 UX, 변경 위험. memory 룰 3 (sketch_realistic_data) 표시 분기 룰 보존.

- **OQ #4**: DailyPortraitPreview 변환 scope — (a) wrapper layout 만 (내부 캘리브레이션/오버레이/이미지 보존) / (b) 본체까지 변환. **default: (a) wrapper 만** — 12-staff W8 lp[] 패턴 + 14-reports W6 OQ #1 mirror. 캘리브레이션 좌표 (DAILY_CALIB_STEPS 15 step / LARGE_KEYS / overlayItems / FINGER_OFFSET) 100% 보존.

- **OQ #5**: 데스크톱 분기 — DailyReportPage.tsx 는 이미 `useIsDesktop` (line 10, 64) 으로 모바일/데스크톱 분기 구현 중. (a) 분기 유지 (소스 그대로) / (b) 단일 함수 통합 후 `lg:*` 분기. **default: (a) 분기 유지** — 데스크톱은 좌측 편집 + 우측 A4 portrait 분할 (line 403~444), 모바일은 단일 컬럼 스크롤 (line 446~465). 구조 차이가 커서 lg:* 단일 함수 부적절. memory 룰 3 (sketch_realistic_data) 준수.

- **OQ #6**: 모바일 안내 줄 (line 381~383) "수정 내용은 자동 저장됩니다 · 월별은 저장된 모든 날짜를 포함합니다" — 유지 / 제거 / 위치 변경 중? **default: 유지** — 사용자 가이드 정보, 카피 변경은 memory 룰 3 위반 위험. 시각 변경만 (10 → 12px text-caption, `.page-footer-note` 14-reports inherit).

- **OQ #7**: 위치 설정 버튼 (line 766~779) `⚠ 위치 설정` 글리프 처리 — (a) lucide `<AlertTriangle size={14} />` 교체 / (b) ⚠ 글리프 유지 (현재 소스 그대로). **default: (a) lucide 교체** — memory `feedback_tsx_wave_emoji_dot_gap` 룰. 단 사용자가 ⚠ 글리프 유지 선호 시 (b) 도 acceptable (시각 강조 효과 보존).

---

# §8 자체 verify gate (작성 완료 후 통과해야 할 8 gate)

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. §1~§8 헤더 존재 | `grep -cE '^# §[1-8] ' wave-1-index.md` | =8 |
| 2. sub-wave 분배 표 ≥6 row | `grep -cE '^\| W[2-7] ' wave-1-index.md` | ≥6 |
| 3. design-system fence ≥6 (open+close ×3) | `grep -c '^```' wave-1-index.md` | ≥6 |
| 4. unique feedback_* slug ≥10 | `grep -oE 'feedback_[a-z_]+\.md' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 5. OQ §7 ≥5 | `grep -cE '^- \*\*OQ #' wave-1-index.md` | ≥5 |
| 6. 14-reports inherit class ≥3 | §4.1 표 row count | ≥3 (실제 6) |
| 7. 신규 class 명단 ≥10 | §4.2 bullet count | ≥10 (실제 ≈28) |
| 8. negative §6 wrangler+npm run deploy 박제 | `grep -c 'wrangler' wave-1-index.md` ≥1 AND `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |

추가 negative gate:
- `git diff --name-only HEAD -- cha-bio-safety/src` 결과 0 lines (src/** 변경 0)
- `ls cha-bio-safety/docs/redesign-context/15-daily-report/sketch-wave-*.html 2>/dev/null` 결과 빈 출력 (sketch HTML 0개)

모두 PASS 시 본 인덱스가 W2 진입 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 7건 답변으로 받는다.
