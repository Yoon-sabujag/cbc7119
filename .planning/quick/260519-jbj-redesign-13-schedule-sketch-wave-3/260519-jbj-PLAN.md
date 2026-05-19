---
phase: 260519-jbj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html
autonomous: true
requirements:
  - REDESIGN-13-W3
must_haves:
  truths:
    - "사용자가 sketch-wave-3.html 을 브라우저로 열어 데스크톱(1280px) + 모바일(393px) 다크/라이트 frame 으로 월간 점검 계획 미리보기 테이블의 시각 디자인을 컨펌할 수 있다"
    - "테이블은 SchedulePage.tsx line 498~643 (MonthlyPlanPreview) 의 구조/색/분기 룰을 verbatim 으로 재현하되, 노안 격상(9/10/11 → 12px) 적용 후 결과를 사용자에게 시연한다"
    - "PLAN_PREVIEW_ROWS 21개 label 모두 truncate 없이 그대로 노출된다 (line 99~121 verbatim)"
    - "W1 + W2 LOCKED 결정 (카테고리 5 hex / 라이트 event #94a3b8 / 멀티데이 = dot only / '오늘' 칩 본문 0회 / 상태 칩 색 verbatim / FAB 우하단 / 시간 자리 멀티데이 텍스트) 이 mirror 된다"
    - "16개 verify gate grep 항목이 모두 PASS 한다 (negative gate 포함)"
    - "Open Question 3건이 카드 형태로 노출되어 사용자 답변을 유도한다"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html"
      provides: "Wave 3 시안 — 월간 점검 계획 미리보기 테이블 (데스크톱 1280 + 모바일 393 다크/라이트)"
      min_lines: 600
      contains: "{mo}월 중요업무추진계획(방재)"
  key_links:
    - from: "sketch-wave-3.html <style> 블록"
      to: "tokens.css line 16~197 + typography.css line 28~95"
      via: "verbatim 임베드 (W2 sketch line 23~95 패턴 mirror)"
      pattern: "tokens.css line.*verbatim"
    - from: "sketch-wave-3.html 테이블 마크업"
      to: "SchedulePage.tsx line 498~643 MonthlyPlanPreview"
      via: "셀 분기 룰 / 색상 / PLAN_PREVIEW_ROWS verbatim"
      pattern: "PLAN_PREVIEW_ROWS|MonthlyPlanPreview"
    - from: "sketch-wave-3.html OQ 카드"
      to: "사용자 답변 (LOCKED 결정)"
      via: "다음 wave 또는 TSX 변환 전 컨펌"
      pattern: "OQ #[1-3]"
---

<objective>
redesign/13-schedule sketch wave 3 의 단일 시안 HTML (`sketch-wave-3.html`) 작성. 범위는 **월간 점검 계획 미리보기 테이블** (SchedulePage.tsx 의 `MonthlyPlanPreview` 컴포넌트, line 498~643) 의 시각 디자인 컨펌용 정적 HTML. TSX 변환 아님.

Purpose: W1 (캘린더 + 카테고리 hex 세트) 과 W2 (일자 헤더 + 일정 카드 + FAB) 가 완결된 상태에서, 13-schedule 페이지의 마지막 남은 큰 시각 영역인 "엑셀 다운로드 클릭 시 생성되는 미리보기 테이블" 디자인을 사용자가 컨펌할 수 있도록 시연한다. 노안 격상(9/10/11 → 12px) 후 가독성을 확인하고, 데스크톱 1280px / 모바일 393px frame 모두에서 31일 × 21행 그리드가 어떻게 펼쳐지는지 보여준다.

Output: 단일 HTML 파일 (`cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html`, ≥600 라인). W1/W2 와 동일 chrome (tokens.css + typography.css verbatim 임베드 + data-theme 토글).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@CLAUDE.local.md
@cha-bio-safety/docs/redesign-context/13-schedule/13-schedule.md
@cha-bio-safety/docs/redesign-context/13-schedule/design-system.md
@cha-bio-safety/docs/redesign-context/13-schedule/tokens.css
@cha-bio-safety/docs/redesign-context/13-schedule/typography.css
@cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html

<interfaces>
<!-- 다음 verbatim 인용 블록들은 executor 가 sketch HTML 마크업에 그대로 옮겨야 함. -->
<!-- grep 으로 source 에서 직접 추출. 추측한 값/라벨 사용 금지. -->

### A) PLAN_PREVIEW_ROWS — SchedulePage.tsx line 98~121 verbatim (21행)

```ts
const PLAN_PREVIEW_ROWS: { label: string; daily?: boolean; cats?: string[]; cl?: Record<string,string>; note?: string }[] = [
  { label: '소화설비 점검(소화기, 소화전)', cats: ['소화기','소화전'], cl: {'소화기':'기','소화전':'전'} },
  { label: '경보설비 점검(자탐설비, 비상방송설비)', daily: true, note: '일상점검' },
  { label: '피난설비(유도등 및 완강기) 점검', daily: true, note: '일상점검' },
  { label: '더블인터록밸브 점검(콤프레셔포함)', cats: ['DIV','컴프레셔','유도등','배연창','완강기'], cl: {'유도등':'유도등','배연창':'배연창','완강기':'완강기'}, note: '격주' },
  { label: '소화 활동설비(전실제연댐퍼,연결송수관)', cats: ['전실제연댐퍼','연결송수관'] },
  { label: '특별피난계단 점검', cats: ['특별피난계단'] },
  { label: '소방펌프 주변 점검(MCC, 지하수조)', daily: true, note: '일상점검' },
  { label: '청정소화약제 점검', cats: ['청정소화약제','소방펌프'], cl: {'소방펌프':'펌프'}, note: '펌프' },
  { label: '배연창 관리상태 점검', daily: true, note: '일상점검' },
  { label: '화재수신반 점검', daily: true, note: '일상점검' },
  { label: '방화셔터 연동제어기 점검', cats: ['방화셔터'] },
  { label: '피난,방화시설 집중점검(비파라치)', cats: ['방화문'] },
  { label: '옥상 및 취약지구 순찰점검', daily: true, note: '일상점검' },
  { label: '전층 방화문 점검', cats: ['방화문'], note: '방화문' },
  { label: '비상콘센트 설비 점검', cats: ['비상콘센트'], note: '소화전' },
  { label: '소방용 전원공급반 점검', cats: ['소방용전원공급반'] },
  { label: '승강기 점검(운행상태, AS신청)', daily: true, note: '일상점검' },
  { label: '출입통제 시스템 및 CCTV 점검', daily: true, note: '상황발생시 현장점검' },
  { label: '주차장비 시스템', cats: ['주차장비','CCTV'], cl: {'CCTV':'cctv'} },
  { label: '회전문 점검', cats: ['회전문'] },
  { label: '전관방송 시스템 점검', daily: true, note: '일상점검' },
]
```

### B) 헤더 (모바일+데스크톱 공통) — SchedulePage.tsx line 470~486 verbatim 구조

- 백 버튼 (svg 화살표)
- 타이틀: `월간 점검 계획` (text-title, 노안 격상 14 → 14px 유지, 본문은 동일)
- **엑셀 다운로드 버튼**:
  - bg `linear-gradient(135deg,#15803d,#22c55e)` verbatim
  - 라벨: `엑셀 다운로드` (기본) / `생성 중...` (planLoading=true 상태 variant)
  - svg 다운 화살표 icon (line 479 verbatim path)
  - 노안 격상: source 12px → **14px** (`text-body` Tailwind class)
  - planLoading 시 bg `var(--surface-sunken)` + 텍스트 `var(--text-tertiary)` + disabled
- **+ 추가 버튼**: bg `var(--acl)` (`--text-link`), 텍스트 `+ 추가`, 12px → **14px**
  - OQ #2 결과에 따라 표시/숨김 — 시안에는 노출 + OQ 카드에 옵션 명시

### C) MonthlyPlanPreview 테이블 구조 — line 535~641 verbatim

#### C-1. 컨테이너
```ts
<div style={{ width: '100%', padding: '12px 20px 8px', background: 'var(--bg2)' }}>
```

#### C-2. 타이틀
```ts
<div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--t1)' }}>
  {mo}월 중요업무추진계획(방재)
</div>
```
→ 시안에서는 `mo` 자리에 mock `5` 또는 `{mo}` 그대로 노출 (목 데이터 = 2026-05 사용).

#### C-3. thead 2-row
- **날짜 행**: `[빈칸][시행일자][1..31][비고]` — 폰트 weight 700
  - 날짜 색: 일/공휴일 = `#ef4444`, 토 = `#3b82f6`, 평일 = `var(--t1)`
  - 배경: 오늘 = `rgba(59,130,246,0.18)` / 일·공휴 = `rgba(239,68,68,0.08)` / 토 = `rgba(59,130,246,0.08)` / 평일 = `var(--bg3)`
  - 오늘 셀: `borderLeft/Right/Top: 2px solid var(--acl)`
- **요일 행**: `[NO.][내 용][일~토 7일 반복 × 4.4 패턴][빈칸]` — 폰트 weight 600
  - 색은 날짜 행과 동일 (요일별)
  - 오늘 셀: `borderLeft/Right: 2px solid var(--acl)`

#### C-4. tbody — PLAN_PREVIEW_ROWS.map (21행)
- NO. 셀: `${ri + 1}` weight 600
- 내용 셀: `row.label` (text-left, paddingLeft:6, 노안 격상 10 → 12px)
- 31일 셀 분기:
  - 텍스트 결정:
    - `row.daily` true → `'점검'` (모든 평일)
    - `row.cats` 존재 → `dayCatMap[d]` 에 매칭되는 cat 발견 시 `row.cl?.[cat] ?? '점검'`
    - 그 외 → 빈 문자열 (셀에 `'.'` 표시, color transparent)
  - 배경 결정:
    - 주말 일/공휴: `rgba(239,68,68,0.06)`
    - 주말 토: `rgba(59,130,246,0.06)`
    - text 있고 `!row.daily`: `rgba(34,197,94,0.1)` (safe 0.10)
    - 그 외: transparent
  - 오늘 셀: `borderLeft/Right: 2px solid var(--acl)`, 마지막 행이면 `borderBottom` 도 추가
- 비고 셀: `row.note ?? ''` — `whiteSpace: normal`, lineHeight 1.2, 노안 격상 9 → 12px

### D) 셀 스타일 base — line 529~533 verbatim
```ts
const cellStyle = {
  border: '1px solid var(--bd)', padding: '3px 1px', textAlign: 'center',
  fontSize: 11 /* → 12 노안 격상 */, lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--t1)',
}
const headCell = { ...cellStyle, fontWeight: 700, background: 'var(--bg3)', color: 'var(--t1)' }
```

### E) W1/W2 chrome 패턴 mirror — sketch-wave-2.html line 1~310 동일 구조

- `<html lang="ko" data-theme="dark">` 기본
- Pretendard CDN + Tailwind CDN
- `<style>` 블록에 tokens.css line 16~197 verbatim + typography.css line 28~95 verbatim 임베드
  (W2 sketch line 23~310 의 임베드 블록을 그대로 복사해도 무방 — 동일 토큰셋)
- data-theme 토글 버튼 (다크/라이트)
- 카테고리 5 hex (#3b82f6 / #eab308 / #e2e8f0 / #f97316 / #ef4444) 는 본 wave 의 dayCatMap mock 시연에 사용 — dot 또는 배경 cue 용
- 라이트 mode 의 event dot 은 #94a3b8 hardcode (W1 OQ #1 LOCKED a — 미리보기 테이블 자체에는 event dot 없지만 chrome consistency 유지를 위해 동일 override 블록 유지)

### F) Mock 데이터 — 2026-05 기준 시연
- `curMonth = '2026-05'`
- `todayStr = '2026-05-19'` (오늘 = 19일 화요일, 2026 cal 기준)
- `daysInMonth = 31`
- `firstDow = 5` (2026-05-01 = 금요일)
- `holidays = { '2026-05-05': '어린이날' }` (2026-05 공휴일)
- mock items (dayCatMap 시연용 — W1+W2 멀티데이 시나리오와 일관):
  - `5/4 (월)`: `소화기` (행 1 → 'ㄱ기' 표시)
  - `5/6 (수)`: `소화전` (행 1 → '전' 표시) + `자탐` (행 2 daily 이라 무관, daily 행은 '점검')
  - `5/12 ~ 5/15 (화~금, 멀티데이 4일)`: `DIV` + `컴프레셔` (행 4 → '점검')
  - `5/12`: `방화셔터` (행 11 → '점검')
  - `5/19 (오늘, 화)`: `전실제연댐퍼` (행 5 → '점검')
  - `5/21 (목)`: `청정소화약제` (행 8 → '점검')
  - `5/26 (화)`: `방화문` (행 12, 14 → '점검')

### G) 노안 격상 매핑 (source → sketch 시안)
- thead 폰트 11 → **12px** (text-caption + leading-none)
- tbody NO. + 셀 텍스트 11/10 → **12px** (text-caption + leading-none)
- 내용(label) 셀 10 → **12px** (text-caption + leading-none)
- 비고 셀 9 → **12px** (text-caption + leading-none, lineHeight 1.2 유지)
- 타이틀 14 → **14px** 유지 (이미 충분, 변경 없음)
- 헤더 버튼 라벨 12 → **14px** (text-body)

### H) 31일 cramped 시연 — desktop frame 1280px
- thead.width = 2% (NO) + 20% (내용) + 31 × ~2.4% (날짜) + 6% (비고) = 약 102% (자연 펼침)
- 1280 frame container `max-width:1280px; width:100%`, 테이블 `width:100%; tableLayout:fixed`
- 31일 셀 폭 ≈ (1280 - NO - 내용 - 비고) / 31 ≈ 31px → 폰트 12px 1글자 (예: '기', '전', '점검' 2글자) 노출 가능 여부 시연

### I) 모바일 frame 393px — overflow-x:auto 가로 스크롤
- frame container `max-width:393px`
- 내부 wrapper `overflow-x:auto`
- 테이블 `min-width:900px` (또는 `width:900px`) — 자연 가로 스크롤 발생
- 좌측 NO + 내용 컬럼 `position:sticky; left:0` — OQ #1 옵션에 따라 시연 (sticky 시연 한 버전 + sticky 없는 자연 버전)

### J) OQ 카드 — W2 sketch line 855~895 패턴 mirror
- `<h3>Open Question · 사용자 답변 필요 (3건)</h3>` 카드
- 각 OQ 에 a) / b) / c) 옵션 명시 + executor 의 기본 선택 표시

</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: sketch-wave-3.html 작성 (단일 시안 HTML)</name>
  <files>cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html</files>
  <action>
다음 구조로 단일 HTML 파일을 작성:

### 1. Chrome (라인 1~310 권장)
- DOCTYPE + `<html lang="ko" data-theme="dark">`
- `<head>`: meta + title `13 월간 점검 계획 — sketch W3 미리보기 테이블` + Pretendard CDN + Tailwind CDN
- `<style>` 블록:
  - tokens.css line 16~197 verbatim 임베드 (다크 + 라이트 + spacing + radius)
    → W2 sketch line 23~170 그대로 복붙
  - typography.css line 28~95 verbatim 임베드
    → W2 sketch line 173~240 그대로 복붙
  - 라이트 모드 event dot #94a3b8 override (W2 line 240~245 mirror)
  - frame 컨테이너 스타일 (`.frame-desktop`, `.frame-mobile-dark`, `.frame-mobile-light`)
  - 테이블 base 스타일 (`.preview-table`, `.preview-table th`, `.preview-table td`, `.preview-table .head-cell`, `.preview-table .num-cell`, `.preview-table .label-cell`, `.preview-table .note-cell`, `.preview-table .day-cell`, `.preview-table .day-cell.today`, `.preview-table .day-cell.sun`, `.preview-table .day-cell.sat`, `.preview-table .day-cell.holiday`, `.preview-table .day-cell.filled`)
  - 헤더 영역 스타일 (`.page-header`, `.btn-excel`, `.btn-excel.loading`, `.btn-add`)
  - OQ 카드 스타일

### 2. 파일 헤더 주석 (HTML <!-- 블록)
W2 sketch line 4~14 패턴 mirror — 작성 날짜, 범위, out of scope, 참조 (design-system.md v0.1.1 §1~§7, SchedulePage.tsx line 498~643 verbatim, sketch-wave-1.html + sketch-wave-2.html LOCKED 결정 mirror) + Open Questions (3건) 명시.

### 3. data-theme 토글 버튼
```html
<div class="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex gap-1 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-lg p-1">
  <button onclick="document.documentElement.dataset.theme='dark'" class="px-3 py-1 rounded text-caption leading-none">다크</button>
  <button onclick="document.documentElement.dataset.theme='light'" class="px-3 py-1 rounded text-caption leading-none">라이트</button>
</div>
```

### 4. 데스크톱 1280px frame (메인 시연)
- `<section class="frame-desktop">` 컨테이너 `max-width:1280px; margin:60px auto 20px; background:var(--surface-page);`
- **헤더 영역** (line 470~486 verbatim 구조, 노안 격상 적용):
  - 백 svg + `월간 점검 계획` 타이틀 + 엑셀 다운로드 버튼 (linear-gradient #15803d→#22c55e) + + 추가 버튼
  - 버튼 라벨 14px (text-body)
- **MonthlyPlanPreview 테이블** (line 498~643 verbatim 구조):
  - 컨테이너 `padding:12px 20px 8px; background:var(--surface-raised)`
  - 타이틀 `5월 중요업무추진계획(방재)` text-center, 14px weight 700, marginBottom 8px
  - `<table>` width:100% borderCollapse:collapse tableLayout:fixed
  - thead 2-row:
    - 행1 (날짜): `[빈칸 2%][시행일자 20%][1..31 각 ~2.4%][비고 6%]` — 1~31 각 셀에 firstDow=5 기준 dow 계산, 일/공휴=빨강, 토=파랑, 평일=t1. 오늘=5/19 셀에 acl borderLeft/Right/Top 2px
    - 행2 (요일): `[NO.][내 용][일월화수목금토 반복 (firstDow=5 → 5/1=금, 5/2=토, 5/3=일...)][빈칸]` weight 600
  - tbody 21행 (PLAN_PREVIEW_ROWS verbatim, truncate 금지):
    - 각 행: `[ri+1][label][31일 셀][note]`
    - 31일 셀: §F mock 데이터 기준 dayCatMap 매칭 → text 결정 (점검/기/전/유도등 등)
    - 셀 배경: 주말/공휴 0.06, daily 아닌 행에 text 있음 → safe 0.10, 그 외 transparent
    - 오늘=5/19 셀에 acl border, 마지막 행(21번)이면 borderBottom 추가
    - 빈 셀은 `'.'` 표시 color transparent
- **Empty month variant** (작은 sub-frame, 옵션):
  - `<section>` 작은 cardle에 동일 테이블 1행만 (PLAN_PREVIEW_ROWS[0]) 모든 평일 셀이 빈 `.` 으로 채워진 상태 시연
- **planLoading variant** (작은 sub-frame, 옵션):
  - 헤더만 따로 시연 — 엑셀 버튼이 `생성 중...` + disabled 배경

### 5. 모바일 frame 393px × 2 (다크 + 라이트)
각 frame:
- `<section class="frame-mobile-dark">` (또는 light)
- `max-width:393px; margin:20px auto;`
- 라이트 frame 은 `data-theme="light"` 강제 (frame 내부 div 에 inline `data-theme` attribute)
- 헤더 영역 (데스크톱과 동일, 폭만 좁음)
- **테이블 wrapper**: `<div style="overflow-x:auto; width:100%; -webkit-overflow-scrolling:touch;">`
- **테이블**: 데스크톱과 동일 마크업, `min-width:900px` (자연 가로 스크롤 발생)
- **OQ #1 시연**: 데스크톱 frame 옆 또는 모바일 다크 frame 에 sticky 좌측 컬럼(NO + 내용)을 적용한 버전 추가. CSS `position:sticky; left:0; background:var(--surface-raised); z-index:2; box-shadow:2px 0 4px rgba(0,0,0,0.2)` → 사용자가 스크롤 시연 후 OQ 답변 가능.

### 6. OQ 카드 영역 (페이지 하단)
W2 sketch line 855~895 패턴 mirror:

```html
<section class="max-w-[1280px] mx-auto my-8 p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-default)]">
  <h3 class="text-title text-amber-300 mb-3 font-medium">Open Question · 사용자 답변 필요 (3건)</h3>
  <ul class="space-y-3 text-body text-[var(--text-secondary)]">
    <li>
      <strong>OQ #1</strong> — 모바일 393px frame 좌측 NO+내용 컬럼 sticky 여부:
      <br/>a) sticky 적용 (가로 스크롤 시에도 행 식별 가능, 우측 본문 영역 손실 ~22%)
      <br/>b) sticky 없음 (자연 스크롤, 좌측 가려져서 행 식별 어려움)
      <br/>→ 시안 기본: a) sticky 적용
    </li>
    <li>
      <strong>OQ #2</strong> — 미리보기 페이지에서 W2 LOCKED c) FAB 표시 여부:
      <br/>a) FAB 유지 (페이지 일관성)
      <br/>b) FAB 숨김 (미리보기 페이지에서 일정 추가는 부자연스러움 — 다운로드 기능에 집중)
      <br/>c) "+ 추가" 헤더 버튼만 유지, FAB 숨김
      <br/>→ 시안 기본: b) FAB 숨김 (이 wave 는 미리보기 시연이 본질)
    </li>
    <li>
      <strong>OQ #3</strong> — 데스크톱 1280px frame 의 셀 폭/폰트 처리:
      <br/>a) 1280 그대로 (31일 cramped, 폰트 12px 1~2글자만 노출)
      <br/>b) min-width:1800 강제 → 데스크톱도 가로 스크롤
      <br/>c) 셀 폰트 12 → 11 축소 (노안 격상 후퇴)
      <br/>→ 시안 기본: a) 1280 cramped 그대로 (사용자가 실제 보고 판단)
    </li>
  </ul>
</section>
```

### 7. LOCKED 일관성 카드 (페이지 하단)
W2 sketch line 855~895 mirror — W1+W2 LOCKED 결정이 W3 에서도 동일하게 적용된 항목 명시:
- 카테고리 5 hex 세트 (#3b82f6/#eab308/#e2e8f0/#f97316/#ef4444) — dayCatMap mock 에 사용
- 라이트 event dot #94a3b8 hardcode override
- 멀티데이 = dot only (W1 OQ #2 LOCKED) — 미리보기 셀에 dot 별도 표시 없음, text 결정 룰만 사용
- "오늘" 칩 본문 0회 (W1 OQ #3 LOCKED) — 오늘 셀은 acl border 로만 표식
- 상태 칩 색 source verbatim (W2 OQ #1 LOCKED a)
- 멀티데이 범위 = 시간 자리 텍스트 (W2 OQ #3 LOCKED b) — 미리보기 테이블에는 적용 없음

### 8. 검수 체크리스트 카드 (페이지 하단)
- 16개 verify gate grep 항목을 사용자가 확인 가능한 형태로 노출

### 9. Inline style 예외 사유 명시
- 페이지 하단 작은 카드에 "31×21 dynamic 셀 색상은 Tailwind utility 로 표현 어려워 inline style 예외 허용 — 사유는 SUMMARY 에 명시" 1줄 추가.

### 검수 후 자가 verify (executor 자체 grep)
다음 16개 검사를 모두 실행하고 결과를 SUMMARY 에 기록:

1. `wc -l sketch-wave-3.html` ≥ 600
2. `python3 -c "import re; print(len(re.findall(r'[\\U0001F300-\\U0001FAFF\\U00002600-\\U000027BF]', open('...sketch-wave-3.html').read())))"` == 0
3. `grep -v 'verbatim\\|source\\|line ' sketch-wave-3.html | grep -E 'font-size:\\s*(9|10|11)px' | grep -c .` == 0
   (단, 주석에 "source 9/10/11px verbatim" 인용은 제외)
4. `grep -v '^#' sketch-wave-3.html | grep -c 'text-status-'` == 0
5. `grep -c '#3b82f6' sketch-wave-3.html` ≥ 1 AND `grep -c '#eab308' sketch-wave-3.html` ≥ 1 AND `grep -c '#e2e8f0' sketch-wave-3.html` ≥ 1 AND `grep -c '#f97316' sketch-wave-3.html` ≥ 1 AND `grep -c '#ef4444' sketch-wave-3.html` ≥ 1
6. `grep -c '#94a3b8' sketch-wave-3.html` ≥ 1
7. PLAN_PREVIEW_ROWS 21 label 전수 점검:
   `for L in '소화설비 점검(소화기, 소화전)' '경보설비 점검(자탐설비, 비상방송설비)' '피난설비(유도등 및 완강기) 점검' '더블인터록밸브 점검(콤프레셔포함)' '소화 활동설비(전실제연댐퍼,연결송수관)' '특별피난계단 점검' '소방펌프 주변 점검(MCC, 지하수조)' '청정소화약제 점검' '배연창 관리상태 점검' '화재수신반 점검' '방화셔터 연동제어기 점검' '피난,방화시설 집중점검(비파라치)' '옥상 및 취약지구 순찰점검' '전층 방화문 점검' '비상콘센트 설비 점검' '소방용 전원공급반 점검' '승강기 점검(운행상태, AS신청)' '출입통제 시스템 및 CCTV 점검' '주차장비 시스템' '회전문 점검' '전관방송 시스템 점검'; do grep -q "$L" sketch-wave-3.html || echo MISSING: $L; done`
   → MISSING 출력 0건
8. 1~31 일자 모두 등장 — `for i in $(seq 1 31); do grep -q ">$i<\\|>$i</td>\\|>$i</th>" sketch-wave-3.html || echo MISSING-DAY $i; done` (또는 mock 데이터로 daysInMonth=31 변수 명시)
9. 요일 7개: `for W in 일 월 화 수 목 금 토; do grep -q ">$W<" sketch-wave-3.html || echo MISSING-WEEKDAY $W; done`
10. `grep -c 'tokens.css line.*verbatim' sketch-wave-3.html` ≥ 1
11. `grep -c 'typography.css line.*verbatim' sketch-wave-3.html` ≥ 1
12. `grep -c 'data-theme' sketch-wave-3.html` ≥ 3 (html attr + 다크 토글 + 라이트 토글 + 라이트 frame 강제)
13. `grep -c '엑셀 다운로드' sketch-wave-3.html` ≥ 1
14. 5/12~15 멀티데이 mock 셀 — `grep -c "5/12\\|2026-05-12" sketch-wave-3.html` ≥ 1 AND `grep -c "5/15\\|2026-05-15" sketch-wave-3.html` ≥ 1 (또는 셀에 시각 표시)
15. 5/19 오늘 셀 2px accent border — `grep -c "border.*var(--acl).*2px\\|2px solid var(--acl)" sketch-wave-3.html` ≥ 3
16. 타이틀 verbatim — `grep -c '5월 중요업무추진계획(방재)\\|{mo}월 중요업무추진계획(방재)' sketch-wave-3.html` ≥ 1

### Negative gate (검수 시 0 이어야 함)
- 이모지 0
- `font-size: 9px` / `font-size: 10px` / `font-size: 11px` 0 (주석/verbatim 인용 제외)
- W1/W2 LOCKED 결정 위반 0 — 카테고리 5 hex 외 색상 0, "오늘" 텍스트 칩 본문 0, 멀티데이 dot 별표 0
- 비즈 로직 변경 0 — `row.daily` true 인 경우에도 "점검" 외의 텍스트로 변경 금지

### 작성 순서 권장
1. W2 sketch (sketch-wave-2.html) 전체 chrome (line 1~310) 을 W3 으로 복사 → file name + title + 헤더 주석 만 W3 으로 변경
2. data-theme 토글 + 라이트 event override 유지
3. 데스크톱 1280 frame 작성 (헤더 + 미리보기 테이블 본체)
4. 모바일 다크 393 frame (overflow-x:auto + sticky 좌측)
5. 모바일 라이트 393 frame
6. Empty / planLoading variant
7. OQ 카드 + LOCKED 일관성 카드 + 검수 체크리스트
8. 자가 grep 16 항목 실행 → SUMMARY 에 결과 기록
  </action>
  <verify>
    <automated>
bash -c '
SK="cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html"
[ -f "$SK" ] || { echo FAIL-EXIST; exit 1; }
L=$(wc -l < "$SK"); [ "$L" -ge 600 ] || { echo FAIL-LINES:$L; exit 1; }
E=$(python3 -c "import re,sys; print(len(re.findall(r\"[\\U0001F300-\\U0001FAFF\\U00002600-\\U000027BF]\", open(\"$SK\").read())))")
[ "$E" -eq 0 ] || { echo FAIL-EMOJI:$E; exit 1; }
# status- prefix 0
SP=$(grep -c "text-status-" "$SK"); [ "$SP" -eq 0 ] || { echo FAIL-STATUS-PREFIX:$SP; exit 1; }
# 5 카테고리 hex
for H in "#3b82f6" "#eab308" "#e2e8f0" "#f97316" "#ef4444"; do grep -q "$H" "$SK" || { echo FAIL-HEX:$H; exit 1; }; done
# 라이트 event #94a3b8
grep -q "#94a3b8" "$SK" || { echo FAIL-LIGHT-EVENT; exit 1; }
# tokens + typography verbatim
grep -q "tokens.css line.*verbatim" "$SK" || { echo FAIL-TOKENS-VERBATIM; exit 1; }
grep -q "typography.css line.*verbatim" "$SK" || { echo FAIL-TYPO-VERBATIM; exit 1; }
# data-theme ≥ 3
DT=$(grep -c "data-theme" "$SK"); [ "$DT" -ge 3 ] || { echo FAIL-DATA-THEME:$DT; exit 1; }
# 엑셀 다운로드 라벨
grep -q "엑셀 다운로드" "$SK" || { echo FAIL-EXCEL-LABEL; exit 1; }
# 21 PLAN_PREVIEW_ROWS label verbatim
for L in "소화설비 점검(소화기, 소화전)" "경보설비 점검(자탐설비, 비상방송설비)" "피난설비(유도등 및 완강기) 점검" "더블인터록밸브 점검(콤프레셔포함)" "소화 활동설비(전실제연댐퍼,연결송수관)" "특별피난계단 점검" "소방펌프 주변 점검(MCC, 지하수조)" "청정소화약제 점검" "배연창 관리상태 점검" "화재수신반 점검" "방화셔터 연동제어기 점검" "피난,방화시설 집중점검(비파라치)" "옥상 및 취약지구 순찰점검" "전층 방화문 점검" "비상콘센트 설비 점검" "소방용 전원공급반 점검" "승강기 점검(운행상태, AS신청)" "출입통제 시스템 및 CCTV 점검" "주차장비 시스템" "회전문 점검" "전관방송 시스템 점검"; do grep -q "$L" "$SK" || { echo FAIL-LABEL:$L; exit 1; }; done
# 요일 7개
for W in 일 월 화 수 목 금 토; do grep -q ">$W<" "$SK" || { echo FAIL-WEEKDAY:$W; exit 1; }; done
# 9/10/11 px font-size 0 (verbatim 인용 행 제외)
BAD=$(grep -nE "font-size:\\s*(9|10|11)px" "$SK" | grep -v "verbatim\\|source\\|line " | wc -l | tr -d " ")
[ "$BAD" -eq 0 ] || { echo FAIL-FONTSIZE-BAD:$BAD; exit 1; }
# accent border 2px (오늘 셀)
AB=$(grep -c "2px solid var(--acl)\\|borderLeft.*2.*var(--acl)\\|border-left.*2px.*acl" "$SK"); [ "$AB" -ge 3 ] || { echo FAIL-ACCENT-BORDER:$AB; exit 1; }
# 타이틀 verbatim
grep -qE "(5|\\{mo\\})월 중요업무추진계획\\(방재\\)" "$SK" || { echo FAIL-TITLE; exit 1; }
# OQ 카드
OQ=$(grep -c "OQ #" "$SK"); [ "$OQ" -ge 3 ] || { echo FAIL-OQ:$OQ; exit 1; }
echo PASS
'
    </automated>
  </verify>
  <done>
- `sketch-wave-3.html` 파일 존재, ≥600 라인
- 16개 verify gate 모두 PASS (자동화 grep 결과)
- 데스크톱 1280 + 모바일 393 다크 + 모바일 393 라이트 3개 frame 모두 표시
- PLAN_PREVIEW_ROWS 21 label 전부 noтрункated 노출
- W1+W2 LOCKED 결정 일관성 시각 확인 가능
- OQ 3건 카드로 노출 (사용자 답변 유도)
- 사용자가 브라우저로 열어 시각 컨펌 가능한 상태
- 커밋 메시지 예시: `redesign(13-schedule): sketch wave 3 — 월간 점검 계획 미리보기 테이블 (1280+393 다크/라이트, 21행 verbatim, OQ 3건)`
  </done>
</task>

</tasks>

<verification>
실행 후:

1. **파일 존재 + 라인 수**: `[ -f cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html ] && wc -l ... >= 600`
2. **16 grep gate 자동화** (task verify 내장)
3. **브라우저 컨펌**: 사용자가 `open cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html` 실행 후 시각 검수
4. **OQ 답변 대기**: 다음 단계 (W4 또는 TSX 변환) 진입 전 사용자가 OQ #1/#2/#3 LOCKED 답변 확정

</verification>

<success_criteria>
- ✓ sketch-wave-3.html 생성 (≥600 라인)
- ✓ MonthlyPlanPreview (SchedulePage.tsx line 498~643) verbatim 구조 재현
- ✓ PLAN_PREVIEW_ROWS 21행 label 전부 노출 (truncate 0)
- ✓ 노안 격상 적용 (9/10/11 → 12px 모두, 헤더 12 → 14px)
- ✓ 데스크톱 1280 + 모바일 393 다크 + 모바일 393 라이트 frame
- ✓ tokens.css + typography.css verbatim 임베드 + data-theme 토글
- ✓ W1+W2 LOCKED 결정 mirror (카테고리 hex 5 / #94a3b8 / 멀티데이 dot only / "오늘" 본문 칩 0 / 상태 색 verbatim / 시간 자리 멀티데이)
- ✓ 16 verify gate 전수 PASS
- ✓ OQ 3건 카드 노출 + 기본 선택값 명시
- ✓ git 커밋 (브랜치 = redesign/13-schedule)
</success_criteria>

<output>
After completion, create `.planning/quick/260519-jbj-redesign-13-schedule-sketch-wave-3/260519-jbj-SUMMARY.md` with:
- 작업 요약 (sketch wave 3 작성 완결)
- 자가 verify 16 항목 결과 (각 항목 PASS/FAIL + 측정값)
- inline style 예외 사유 (31×21 dynamic 셀 색상 → Tailwind 으로 표현 어려운 패턴)
- 사용자 다음 액션: 브라우저로 sketch-wave-3.html 열기 → OQ 3건 답변 → 다음 wave (TSX 변환) 진행
- 커밋 hash + 브랜치 (redesign/13-schedule) 기록
</output>
