---
phase: 260519-dll-redesign-13-schedule-sketch-wave-2-add-c
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html
autonomous: true
requirements:
  - SKETCH-W2-DATE-HEADER
  - SKETCH-W2-CARD-LIST
  - SKETCH-W2-LEGEND
  - SKETCH-W2-ADD-CTA
  - SKETCH-W2-STATES
  - SKETCH-W2-W1-CONSISTENCY

must_haves:
  truths:
    - "사용자는 sketch-wave-2.html 파일 하나를 브라우저로 열면, 다크/라이트 두 frame 에서 W2 범위(선택 일자 헤더 + 일정 카드 리스트 + 카테고리 범례 + add CTA + empty/loading 상태)를 동시에 확인할 수 있다"
    - "사용자는 우상단 다크/라이트 토글로 라이트 모드의 event 카테고리 색(#94a3b8) 이 다크(#e2e8f0)와 어떻게 다른지 일관성 검증 가능하다"
    - "사용자는 5종 카테고리(점검/업무/행사/승강기/소방) 각각이 별도 카드로 렌더되어 hex 색이 W1 의 dot 색과 1:1 매칭됨을 확인할 수 있다"
    - "사용자는 진행중/완료/지연/예정 4종 상태 칩이 각각 다른 status 토큰 (info/safe/danger/warning) 으로 표시됨을 시각적으로 확인할 수 있다"
    - "사용자는 멀티데이 카드 (5/12~5/15 소방 종합점검) 가 일반 카드와 어떻게 다른 형식으로 범위 표시되는지 확인할 수 있다"
    - "사용자는 sub-category 라벨 (점검분류 / 승강기 업체 / 소방 업체) 이 카드에 어떻게 노출되는지 확인할 수 있다"
    - "사용자는 빈 상태(등록된 일정 없음)와 로딩 상태(불러오는 중) variant 를 별도 셀에서 확인할 수 있다"
    - "사용자는 add CTA 의 3가지 후보 (헤더 + 추가 / inline + 일정 추가 / FAB) 를 동시에 비교할 수 있다 — OQ #2 답변용"
    - "사용자는 OQ 3건 (상태색 매핑, add CTA 형태, 멀티데이 표시 자리) 의 옵션 비교를 sketch 안에서 즉시 판단할 수 있다"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html"
      provides: "Wave 2 시안 (일자 헤더 + 카드 리스트 + 범례 + CTA + 상태 variant + OQ 카드)"
      min_lines: 700
      contains: "sketch-wave-2.html"
  key_links:
    - from: "sketch-wave-2.html `<style>` 블록"
      to: "tokens.css line 16~197 + typography.css line 28~95"
      via: "verbatim copy (W1 mirror)"
      pattern: "--surface-page.*#0a0d12"
    - from: "sketch-wave-2.html 카테고리 hex set"
      to: "SchedulePage.tsx line 81~87 SCHED_CATEGORIES"
      via: "verbatim hex 5종 (#3b82f6 / #eab308 / #e2e8f0 / #f97316 / #ef4444)"
      pattern: "#3b82f6.*#eab308.*#e2e8f0.*#f97316.*#ef4444"
    - from: "sketch-wave-2.html 상태 라벨"
      to: "SchedulePage.tsx line 89~94 STATUS_LABEL"
      via: "verbatim 한글 라벨 4종 (예정/진행중/완료/지연)"
      pattern: "예정.*진행중.*완료.*지연"
    - from: "sketch-wave-2.html 카테고리 범례"
      to: "12-staff sketch W3 mirror (memory: project_redesign_12_staff_service_status.md)"
      via: "text-caption + leading-none + dot + 라벨 horizontal row"
      pattern: "leading-none"
---

<objective>
redesign/13-schedule 페이지의 sketch wave 2 (`sketch-wave-2.html`) 시안 1장 작성.

W1 에서 헤더 + 월/연도 네비 + 캘린더 grid 까지 LOCKED. 이번 W2 는 그 아래 영역 — 선택된 일자의 일정 카드 리스트 + 카테고리 범례 + add CTA + 상태 variant + 빈/로딩 상태 — 의 정적 HTML 시안. TSX 변환 아님.

**범위 (사용자 task_scope 그대로):**
1. 선택된 일자 헤더 (YYYY-MM-DD (요일) + 일정 개수)
2. 일자별 일정 카드 리스트 — 카테고리 dot, 제목, 상태 배지, 시간/범위, sub-category 라벨, 메모, 액션 (완료/수정/삭제)
3. 빈 상태 / 로딩 상태 / 에러 상태
4. 카테고리 범례 (5종 dot + 라벨, 12-staff W3 mirror)
5. add CTA (3종 후보 — 헤더 + 추가 / inline / FAB)
6. OQ 3건 카드 + footer 메모리 룰 체크리스트

**Purpose:**
- 사용자가 W2 범위의 디자인을 한 번에 확인 + OQ 3건 결정
- 변환 wave 의 source 가 됨 (W1 + W2 → 다음 변환 wave 의 input)
- W1 의 LOCKED 결정 (카테고리 hex 5종, "오늘" 칩 제거, 멀티데이 = dot only) 모두 일관 mirror

**Output:**
- `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html` (~700-900 라인 self-contained HTML)
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
@cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx
@cha-bio-safety/docs/redesign-context/13-schedule/tokens.css
@cha-bio-safety/docs/redesign-context/13-schedule/typography.css
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html

<interfaces>
<!-- W2 작성 시 source-of-truth: SchedulePage.tsx 와 W1 sketch 의 verbatim 추출. -->
<!-- executor 는 아래 인용을 그대로 사용. 추측한 hex / 라벨 / 분기 룰 금지. -->

### SCHED_CATEGORIES (SchedulePage.tsx line 81~87, verbatim)
```ts
const SCHED_CATEGORIES: { value: ScheduleCategory; label: string; color: string }[] = [
  { value:'inspect',  label:'점검',   color:'#3b82f6' },
  { value:'task',     label:'업무',   color:'#eab308' },
  { value:'event',    label:'행사',   color:'#e2e8f0' },  // 라이트 모드: #94a3b8 (W1 OQ #1 LOCKED)
  { value:'elevator', label:'승강기', color:'#f97316' },
  { value:'fire',     label:'소방',   color:'#ef4444' },
]
```

### STATUS_LABEL (SchedulePage.tsx line 89~94, verbatim)
```ts
const STATUS_LABEL: Record<string,{label:string;color:string}> = {
  pending:     { label:'예정',   color:'var(--t3)'     },  // = var(--text-tertiary)
  in_progress: { label:'진행중', color:'var(--acl)'    },  // = var(--accent) (info 톤)
  done:        { label:'완료',   color:'var(--safe)'   },  // = var(--status-safe)
  overdue:     { label:'지연',   color:'var(--danger)' },  // = var(--status-danger)
}
```

### INSP_CATEGORIES (점검 sub-category 19종, SchedulePage.tsx line 35~39, verbatim)
```ts
const INSP_CATEGORIES = [
  '소화기','소화전','방화문','특별피난계단','유도등','방화셔터','DIV','컴프레셔',
  '비상콘센트','배연창','주차장비','완강기','전실제연댐퍼',
  '청정소화약제','연결송수관','소방용전원공급반','회전문','소방펌프','CCTV',
]
```

### ELEV_SUBCATS (승강기 sub-category 3종, line 63, verbatim)
```ts
const ELEV_SUBCATS = ['승강기 정기 점검', '승강기 수리', '승강기 법정 검사'] as const
const ELEV_AGENCY = {
  '승강기 정기 점검': 'TKE',
  '승강기 수리': 'TKE',
  '승강기 법정 검사': '한국승강기안전공단',
}
```

### FIRE_SUBCATS (소방 sub-category 4종, line 64, verbatim)
```ts
const FIRE_SUBCATS = ['소방 상반기 종합정밀점검', '소방 하반기 작동기능점검', '소방 시설물 공사', '소방 관공서 불시 점검'] as const
const FIRE_AGENCY = {
  '소방 상반기 종합정밀점검': '동양소방',
  '소방 하반기 작동기능점검': '동양소방',
  '소방 시설물 공사':       '동양소방',
  '소방 관공서 불시 점검':   '성남소방서',
}
```

### renderCard (모바일 단일 카드) — SchedulePage.tsx line 304~345 verbatim 분기 룰
- `cat = catInfo(item.category)` → 카테고리 hex 매핑
- `st = STATUS_LABEL[item.status] ?? STATUS_LABEL.pending`
- 헤더 row: `{카테고리 배지 (cat.color + cat.color+'22' bg, 10px 폰트 → W2 는 text-caption 12px 로 상향)} + {inspectionCategory 칩 (info 톤)} + {상태 라벨 (st.color, 우측 정렬, marginLeft:auto)}`
- 제목 row: `{item.title}` (fontSize:12 → W2 는 text-body 16px 또는 text-title 18px 로 노안 대응 상향)
- 본문 row: `{item.memo}` (whiteSpace:'pre-line', WebkitLineClamp 3 줄 잘림), `{item.time}` (시간 라벨)
- 액션 row: `{완료(if !done)} + {수정} + {삭제}` (각 fontSize:10 → text-caption 12 상향)
- [!] 원본 fontSize 9·10·11px 는 W2 sketch 에서 모두 text-caption(12) 또는 text-label(13) 로 상향 (디자인 시스템 v0.1.1 §1.1 노안 우선)

### day header 라벨 분기 (SchedulePage.tsx line 349~353 verbatim)
```ts
<span>{selDate === today ? '오늘' : `${selDate.slice(5).replace('-','/')}`} 일정</span>
<span>{dayItems.length}건</span>
```
- W2 sketch 는 선택 셀 = 5/5 (어린이날, 오늘 아님) → "5/5 일정" + "3건" 형식
- 추가로 멀티데이 시연용: 5/12 선택 시 → "5/12 일정" + "1건" 변형

### Empty state (line 365~372 verbatim)
```
등록된 일정이 없습니다 <br/>
[+ 일정 추가] 버튼 (centered, marginTop:12)
```

### Loading state (line 363~364 verbatim)
```
불러오는 중...
```

### W1 에 LOCKED 된 결정 (sketch-wave-1.html 헤더 주석)
- OQ #1 LOCKED a) — 라이트 event dot = #94a3b8 (slate-400). 다크 = #e2e8f0
- OQ #2 LOCKED 유지 — 멀티데이 표시는 일자 셀당 dot 만. band 추가 안 함
- OQ #3 LOCKED 제거 — "오늘" 칩 제거. 네비는 ‹ / 라벨 / › 만

### Mock data 시나리오 (W1 + W2 일관)
W1 의 캘린더에 dot 으로 표시된 일정과 W2 의 카드 리스트가 1:1 매칭되어야 함. W2 에서 사용할 시나리오:

**시나리오 A — 선택 셀 = 5/5 (어린이날, dot=event)**
- 카드 1: 카테고리=행사, 제목="어린이날 휴무", 상태=예정, 시간=없음, 메모="공휴일, 점검 일정 없음"
- 카드 2: 카테고리=업무, 제목="당직 인계 정리", 상태=완료, 시간=09:00, 메모 없음
- 카드 3: 카테고리=점검, 제목="전층 소화기 점검", inspectionCategory="소화기", 상태=진행중, 시간=14:00, 메모="   - 소화기 압력상태 점검\n   - 안전핀 체결상태 확인" (INSP_DEFAULTS line 42 verbatim 일부)

**시나리오 B — 멀티데이 카드 (5/12~5/15 소방)**
- 카드: 카테고리=소방, 제목="소방 상반기 종합정밀점검", inspectionCategory="동양소방" (FIRE_AGENCY), 상태=예정, 범위=2026-05-12 ~ 2026-05-15 (4일), 시간=없음

**시나리오 C — 지연 카드 (별도 sub-strip)**
- 카드: 카테고리=승강기, 제목="승강기 수리", inspectionCategory="TKE", 상태=지연, 시간=2026-05-10 11:00 (이미 지난 날짜), 메모="3호기 도어 센서 교체 필요"

**시나리오 D — Empty state (선택 셀 = 5/26)**
- "등록된 일정이 없습니다" + [+ 일정 추가] 버튼

**시나리오 E — Loading state**
- "불러오는 중..." centered placeholder
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: sketch-wave-2.html 작성 (단일 self-contained HTML)</name>
  <files>cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html</files>
  <action>
**파일 1개를 처음부터 작성**. 약 700~900 라인. 기존 sketch-wave-1.html 의 구조 패턴 mirror.

**파일 헤더 주석 (sketch-wave-1.html mirror)**
```html
<!--
  sketch-wave-2.html — redesign/13-schedule W2
  작성: 2026-05-19 / quick 260519-dll
  범위: 선택된 일자 헤더 + 일자별 일정 카드 리스트 + 카테고리 범례 + add CTA + 상태 variant + 빈/로딩 상태
  out of scope: 월간 점검 계획 미리보기 테이블 (별도 wave) / AddModal 내부 / EditModal 내부 / 자동 생성 패널
  참조: design-system.md v0.1.1 §1~§7, SchedulePage.tsx line 81~94 + 304~405 verbatim, sketch-wave-1.html LOCKED 결정 mirror

  open questions — W2 에서 사용자 답변 필요 (3건):
    OQ #1 — 상태 칩 색 매핑
      a) 예정=text-tertiary 회색 / 진행중=accent / 완료=safe / 지연=danger (SchedulePage.tsx line 89~94 verbatim mirror)
      b) 예정=info-bg / 진행중=warning-bg / 완료=safe-bg / 지연=danger-bg (status-bg 채움 방식, 더 시각 강조)
      c) 예정=outline 회색 / 진행중=fire (조치 대기 아님 + accent 중복 회피) / 완료=safe / 지연=danger
    OQ #2 — add CTA 형태
      a) 헤더 우측 [+ 추가] (모바일 — SchedulePage.tsx line 482 verbatim 위치 유지)
      b) 일정 리스트 위 inline [+ 일정 추가] 풀폭 버튼 (Empty state 의 추가 버튼 항상 노출)
      c) FAB (우하단 fixed 56px 원형, accent bg)
    OQ #3 — 멀티데이 카드 범위 표시 자리
      a) 제목 옆 칩: "어린이날 (5/12~5/15 · 4일)"  /  "소방 종합정밀점검 ⏷ 5/12~5/15"
      b) 시간 자리 (시간 라벨이 비어 있으니): "[CAL] 5/12 ~ 5/15 (4일)" — [!] 이모지 금지 → "5/12 ~ 5/15 (4일)" 텍스트만
      c) 별도 라인 (상단 메타 row 마지막에 inline-flex 칩): [범위: 5/12 ~ 5/15 · 4일]
-->
```

**HTML <head>**
- tailwind play CDN (sketch-wave-1.html line 20 그대로)
- Pretendard variable webfont (sketch-wave-1.html line 19 그대로)
- `<style>` 블록 안에 tokens.css line 16~197 verbatim + typography.css line 28~95 verbatim 임베드 (W1 line 22~234 그대로 cp)
- frame-shell + page-bg-dark + page-bg-light 헬퍼 클래스 (W1 line 238~246 그대로)
- tailwind.config (W1 line 248~290 그대로 cp — 토큰명 매핑 동일)

**<body class="page-bg-dark min-h-screen p-6">**

#### ① 다크/라이트 토글 (W1 line 297~317 verbatim cp)

#### ② 헤더 캡션
```html
<header class="mb-6 max-w-[1400px] mx-auto">
  <h1 class="text-heading text-white mb-2">13-schedule sketch W2 — 일자 헤더 + 일정 카드 리스트 + 범례 + CTA + 상태 variant</h1>
  <p class="text-label text-zinc-400">
    모바일 393px (다크 + 라이트 side-by-side) + 데스크톱 1280px placeholder. 우상단 토글로 frame 분기됨.
    W1 의 LOCKED 결정 (카테고리 hex 5종, "오늘" 칩 제거, 멀티데이 = dot only) 일관 mirror.
  </p>
</header>
```

#### ③ 모바일 frame 2개 (다크 + 라이트 side-by-side)
W1 의 frame-shell width:393px 패턴 mirror. 각 frame 안에 다음 sections 순서로 배치 (W1 의 캘린더 부분은 placeholder 로 축약 → "↑ 이전 wave: 헤더 + 월네비 + 캘린더" dashed border block 으로 W1 본문 대체):

##### 섹션 A — "↑ 이전 wave" placeholder (W1 본문 자리 축약)
```html
<div class="border-2 border-dashed border-border-default rounded-md-token text-center text-caption text-text-tertiary"
  style="margin:12px 16px; padding:24px 16px; line-height:1.5;">
  ↑ 이전 wave (W1): 자체 헤더 + 월/연도 네비 + 캘린더 grid<br/>
  현재 선택 셀 = 2026-05-05 (어린이날)
</div>
```

##### 섹션 B — 공휴일 라벨 (W1 의 ④ 그대로 유지)
```html
<div class="text-caption font-semibold" style="margin:0 16px 8px; padding-left:2px; color:var(--status-danger); line-height:1.5;">
  어린이날
</div>
```

##### 섹션 C — 선택된 일자 헤더 (W2 신규 — verbatim 분기 룰 적용)
- 다크 frame: "5/5 일정" + "3건" + (OQ #2 a 옵션 시연용) 우측 [+ 추가] accent 버튼
- 라이트 frame: "5/5 일정" + "3건" + 우측 [+ 추가]
- SchedulePage.tsx line 349~360 분기 룰 verbatim — `selDate === today ? '오늘' : selDate.slice(5).replace('-','/')` 형식. selDate=2026-05-05, today=2026-05-19 → "5/5"
- text-caption (12px) + text-text-secondary + font-semibold + flex 정렬, gap=8px
- 우측 [+ 추가] = text-caption + bg-accent + text-white + rounded-sm-token + padding 6px 12px + line-height:1
- **이모지 금지** — "[CAL]" 같은 거 사용하지 말 것

##### 섹션 D — 일정 카드 리스트 (W2 핵심 — 3장 카드 시연)
flex-col + gap-8px 컨테이너 안에 다음 3장 카드 (시나리오 A):

**카드 1 — 행사 + 예정**
```html
<div class="bg-surface-raised border border-border-default rounded-md-token"
  style="padding:12px 14px;">
  <!-- 상단 메타 row -->
  <div class="flex items-center flex-wrap" style="gap:6px; margin-bottom:6px;">
    <!-- 카테고리 배지 (cat.color + cat.color+'22' bg) -->
    <span class="text-caption font-semibold rounded-sm-token"
      style="color:#e2e8f0; background:rgba(226,232,240,0.13); padding:2px 8px; line-height:1.4;">
      행사
    </span>
    <!-- 우측 상태 라벨 — OQ #1 a 옵션 (text-tertiary 회색) -->
    <span class="text-caption font-medium" style="margin-left:auto; color:var(--text-tertiary); line-height:1;">예정</span>
  </div>
  <!-- 제목 (text-body 16px, 노안 상향) -->
  <div class="text-body font-semibold text-text-primary" style="margin-bottom:4px;">어린이날 휴무</div>
  <!-- 메모 -->
  <div class="text-caption text-text-secondary" style="white-space:pre-line; line-height:1.5; margin-bottom:0;">공휴일, 점검 일정 없음</div>
  <!-- 액션 row (완료 없음 — 행사라 완료 처리 불필요) -->
  <div class="flex" style="gap:6px; margin-top:8px;">
    <button class="text-caption font-medium rounded-sm-token border border-border-default bg-surface-sunken text-text-secondary" style="padding:4px 10px; line-height:1.4;">수정</button>
    <button class="text-caption font-medium rounded-sm-token border border-border-default bg-surface-sunken text-text-tertiary" style="padding:4px 10px; line-height:1.4;">삭제</button>
  </div>
</div>
```

**카드 2 — 업무 + 완료** (시간 09:00 포함, status=완료 → text-status-safe, "완료" 버튼 미노출)
```html
- 카테고리 배지: "업무" (#eab308 + rgba(234,179,8,0.13))
- 상태 라벨 우측: "완료" (color:var(--status-safe))
- 제목: "당직 인계 정리"
- 시간 row: "09:00" (text-caption + text-text-tertiary + line-height:1.4)
- 액션: [수정] [삭제] 만 (완료 상태라 "완료" 버튼 hidden)
```

**카드 3 — 점검 + 진행중 + sub-category**
```html
- 카테고리 배지: "점검" (#3b82f6 + rgba(59,130,246,0.13))
- sub-category 칩 (inspectionCategory): "소화기" — text-caption + color:var(--status-info) + bg:var(--status-info-bg) + rounded-sm-token + padding:2px 8px
- 상태 라벨 우측: "진행중" (color:var(--accent))
- 제목: "전층 소화기 점검"
- 메모 (whiteSpace:pre-line 3줄 + WebkitLineClamp 3):
  "   - 소화기 압력상태 점검
   - 안전핀 체결상태 확인
   - 위치표시 스티커 부착상태 점검"
- 시간 row: "14:00"
- 액션: [완료] [수정] [삭제]
  - [완료] = text-caption + border 1px solid var(--status-safe) + bg:var(--status-safe-bg) + color:var(--status-safe) + font-semibold
```

##### 섹션 E — 멀티데이 카드 sub-strip
"멀티데이 / 범위 일정" 라벨 (text-caption text-text-tertiary) + 카드 1장 시연 (시나리오 B). 카드 안에 OQ #3 의 3가지 범위 표시 후보 동시 노출 (각 후보 옆에 "옵션 a/b/c" 라벨 칩):

```html
<!-- 옵션 a: 제목 옆 칩 -->
"소방 상반기 종합정밀점검" + <span class="ml-1 text-caption rounded-pill bg-surface-sunken px-2">5/12~5/15 · 4일</span>

<!-- 옵션 b: 시간 자리 텍스트 -->
시간 row 자리에 "5/12 ~ 5/15 (4일)" (text-caption + text-text-tertiary)

<!-- 옵션 c: 상단 메타 row 안에 별도 칩 -->
상단 메타 row 에 카테고리 배지 + [범위: 5/12 ~ 5/15 · 4일] 칩 + 상태 라벨
```

각 후보는 별도 카드로 3장 렌더 (다크 frame). 라이트 frame 은 옵션 c 만 mirror.

##### 섹션 F — 상태 variant sub-strip
flex-col gap-8px 안에 4장 카드 (모두 카테고리=점검 단일 고정, 상태만 4종 변경):
- 카드 P: 상태=예정 (text-text-tertiary 회색)
- 카드 Q: 상태=진행중 (text-accent)
- 카드 R: 상태=완료 (text-status-safe, opacity:0.7 — 흐릿 처리)
- 카드 S: 상태=지연 (text-status-danger + 좌측 4px bar 추가: `<div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--status-danger-bar);border-radius:8px 0 0 8px"></div>` + 카드 relative + padding-left 16px)

라벨 헤더: "상태 variant 4종" (text-caption font-semibold text-text-secondary)

##### 섹션 G — 카테고리 범례 (5종 dot + 라벨)
12-staff sketch W3 mirror — text-caption + leading-none. flex-wrap horizontal row, gap=12px:
```html
<div class="flex flex-wrap items-center" style="gap:12px; padding:12px 14px; background:var(--surface-raised); border:1px solid var(--border-default); border-radius:12px;">
  <span class="text-caption text-text-secondary font-semibold" style="line-height:1;">카테고리</span>
  <span class="flex items-center" style="gap:4px;">
    <span style="width:8px;height:8px;border-radius:50%;background:#3b82f6;"></span>
    <span class="text-caption text-text-primary" style="line-height:1;">점검</span>
  </span>
  <span class="flex items-center" style="gap:4px;">
    <span style="width:8px;height:8px;border-radius:50%;background:#eab308;"></span>
    <span class="text-caption text-text-primary" style="line-height:1;">업무</span>
  </span>
  <span class="flex items-center" style="gap:4px;">
    <span style="width:8px;height:8px;border-radius:50%;background:#e2e8f0;"></span>
    <span class="text-caption text-text-primary" style="line-height:1;">행사</span>
  </span>
  <span class="flex items-center" style="gap:4px;">
    <span style="width:8px;height:8px;border-radius:50%;background:#f97316;"></span>
    <span class="text-caption text-text-primary" style="line-height:1;">승강기</span>
  </span>
  <span class="flex items-center" style="gap:4px;">
    <span style="width:8px;height:8px;border-radius:50%;background:#ef4444;"></span>
    <span class="text-caption text-text-primary" style="line-height:1;">소방</span>
  </span>
</div>
```
라이트 frame: `#e2e8f0` 행사 dot 만 `#94a3b8` 로 교체 (W1 OQ #1 LOCKED a 일관)

##### 섹션 H — Empty state (별도 sub-strip)
```html
<div class="border border-border-default bg-surface-raised rounded-md-token text-center"
  style="padding:32px 16px; margin-top:8px;">
  <div class="text-body text-text-tertiary" style="margin-bottom:12px;">등록된 일정이 없습니다</div>
  <button class="text-label font-semibold rounded-sm-token border border-border-strong bg-surface-sunken text-text-secondary"
    style="padding:10px 20px;">
    + 일정 추가
  </button>
</div>
```
라벨: "Empty state (선택 셀 = 5/26 시연)" (text-caption font-semibold text-text-tertiary)

##### 섹션 I — Loading state
```html
<div class="text-center text-caption text-text-tertiary" style="padding:32px 16px;">
  불러오는 중...
</div>
```
라벨: "Loading state"

##### 섹션 J — add CTA 3종 비교 (OQ #2 결정용)
sketch 안에 한 번에 3가지 옵션 시연:
- 옵션 a (headerInline): 섹션 C 의 "선택된 일자 헤더" 우측에 이미 [+ 추가] 버튼 노출 → 옵션 a 라벨 칩으로 표시
- 옵션 b (listAbove): 일정 리스트 위 inline [+ 일정 추가] 풀폭 버튼 sub-strip (text-label font-semibold + bg-accent + text-white + rounded-sm-token + padding 10px + width:100%)
- 옵션 c (FAB): frame 우하단 fixed (style="position:absolute;right:16px;bottom:24px;width:56px;height:56px;border-radius:50%;background:var(--accent);color:#fff;font-size:24px;font-weight:600;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(59,130,246,0.4);") + "+" 텍스트
  - [!] frame-shell 자체에 relative 추가 또는 별도 wrapper 필요 (W1 frame-shell 은 overflow:hidden 이라 FAB 가 절대 위치로 들어가도 frame 안에 보임)
  - 옵션 c 라벨 칩으로 명시

각 옵션 sub-strip 라벨: "옵션 a — 헤더 우측 inline" / "옵션 b — 리스트 위 풀폭" / "옵션 c — FAB"

#### ④ 데스크톱 frame 1개 (1280px placeholder)
W1 의 데스크톱 frame 패턴 (W1 line 940~1027) mirror. 좌=달력 placeholder(↑ 이전 wave dashed) + 우=일정 리스트 (모바일과 동일 카드 3장 + 범례 + CTA, but 카테고리별 컬럼 grid 로 — SchedulePage.tsx line 374~398 verbatim 룰: `display:flex; gap:12px; flex-wrap:wrap; 각 컬럼 width:300px + 카테고리 컬러 + count`).

데스크톱 frame 안 카드 시연 — 카테고리별 컬럼 3개:
- 컬럼 1: "행사 (1)" — 카드 1
- 컬럼 2: "업무 (1)" — 카드 2
- 컬럼 3: "점검 (1)" — 카드 3

각 컬럼 헤더: text-caption + font-semibold + color:cat.color + borderBottom: 2px solid {cat.color}44 + padding:3px 0 + margin-bottom:6px

#### ⑤ OQ 카드 (사용자 답변 영역) — 섹션 클래스
W1 의 LOCKED 카드 (line 1030~1047) 패턴 mirror, but "LOCKED" 대신 "OPEN" 색 (rgba(59,130,246,0.06) bg + border + accent 톤):

```html
<section class="max-w-[1400px] mx-auto mb-12 p-5 rounded-md-token"
  style="background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.3);">
  <h3 class="text-title font-medium" style="color:var(--accent); margin-bottom:12px;">OQ OPEN · 사용자 답변 필요 (3건)</h3>
  <ol class="text-label text-zinc-200 list-decimal pl-5" style="line-height:1.7;">
    <li class="mb-2">
      <strong>OQ #1 — 상태 칩 색 매핑</strong><br/>
      a) source verbatim: 예정=tertiary 회색 / 진행중=accent / 완료=safe / 지연=danger<br/>
      b) status-bg 채움: 예정=info-bg / 진행중=warning-bg / 완료=safe-bg / 지연=danger-bg<br/>
      c) outline 회색: 예정=outline / 진행중=fire / 완료=safe / 지연=danger
    </li>
    <li class="mb-2">
      <strong>OQ #2 — add CTA 형태</strong><br/>
      a) 헤더 우측 inline [+ 추가] (모바일 source verbatim 위치)<br/>
      b) 리스트 위 풀폭 [+ 일정 추가] 버튼<br/>
      c) FAB (우하단 56px 원형 fixed)
    </li>
    <li>
      <strong>OQ #3 — 멀티데이 범위 표시 자리</strong><br/>
      a) 제목 옆 칩: "소방 종합점검 [5/12~5/15 · 4일]"<br/>
      b) 시간 자리 텍스트: "5/12 ~ 5/15 (4일)"<br/>
      c) 상단 메타 row 별도 칩: [범위: 5/12 ~ 5/15 · 4일]
    </li>
  </ol>
</section>
```

#### ⑥ Footer 메모리 룰 체크리스트 (W1 line 1052~1066 mirror, 확장)
```html
<footer class="max-w-[1400px] mx-auto p-5 rounded-md-token text-caption text-zinc-500"
  style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); line-height:1.6;">
  <p class="mb-2"><strong class="text-zinc-300">메모리 룰 체크리스트 (작성 시 강제)</strong></p>
  <ul class="list-disc pl-5">
    <li>이모지 0 (feedback_tsx_wave_emoji_dot_gap.md)</li>
    <li>9·10·11px font-size 0 (text-caption 12 마지노선, feedback_text_caption_leading_none.md)</li>
    <li>status- prefix className 0 (text-fire-bar O, text-status-fire-bar X — feedback_tailwind_token_class_pattern.md)</li>
    <li>SCHED_CATEGORIES hex 5종 verbatim — #3b82f6 / #eab308 / #e2e8f0 (다크) · #94a3b8 (라이트) / #f97316 / #ef4444</li>
    <li>STATUS_LABEL 한글 4종 verbatim — 예정 / 진행중 / 완료 / 지연</li>
    <li>tokens.css line 16~197 verbatim + typography.css line 28~95 verbatim 임베드</li>
    <li>data-theme 토글 동작 (다크/라이트)</li>
    <li>W1 LOCKED 결정 일관: 라이트 event #94a3b8 / 멀티데이 = dot only / "오늘" 칩 제거</li>
    <li>작은 컨테이너 안 text-caption → leading-none 또는 line-height:1 명시 (feedback_text_caption_leading_none.md)</li>
    <li>w-8/h-8 = 48px 함정 회피 — 명시적 px 또는 aspect-square (feedback_tailwind_w8_h8_is_48px.md)</li>
    <li>비즈니스 로직 0 변경 (SchedulePage.tsx 1줄도 수정 X — 시안 디자인만)</li>
    <li>inline style 사용 시 토큰 var(--*) 또는 hex set 만 — 임의 hex 금지</li>
  </ul>
</footer>
```

---

**작성 강제 룰 (executor 자체 검수):**
- 이모지 한 글자도 사용 금지 — 카드, 라벨, 버튼, 코멘트 어디에도 X
- font-size: 9px / 10px / 11px 직접 지정 금지. text-caption (12px) 또는 text-label (13px) class 만 사용
- `text-status-*` 형식 className 금지. tailwind config 에 정의된 `text-safe / text-danger / text-warning / text-info / text-fire / text-safe-bar / ...` 사용
- 모든 카테고리 hex 는 SCHED_CATEGORIES 5종 (#3b82f6/#eab308/#e2e8f0/#f97316/#ef4444) 만 사용. 라이트 모드 event 만 #94a3b8 예외
- 모든 상태 라벨은 STATUS_LABEL 4종 한글 (예정/진행중/완료/지연) verbatim
- 카드, 칩, 버튼의 text-caption 들은 line-height:1 또는 leading-none 명시 (작은 컨테이너 안)
- inline style 사용 가능 (W1 패턴 — sketch 는 self-contained 라 일부 inline 불가피). 단, 색은 var(--*) 토큰 또는 SCHED_CATEGORIES hex set 만
- 비즈니스 로직 (matchesDate / dotMap / dayItems sort / SchedulePage.tsx 의 어떤 코드도) 변경 0 — 시안은 시각만
  </action>
  <verify>
    <automated>
# Verify gate — 14개 grep 항목 (모두 PASS 필수)
cd /Users/jykevin/Documents/cbc7119-design

F="cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html"

# 1. 파일 존재 + 최소 라인 수
test -f "$F" || { echo "FAIL: $F not found"; exit 1; }
LC=$(wc -l < "$F")
test "$LC" -ge 600 || { echo "FAIL: line count $LC < 600"; exit 1; }
echo "PASS 1: file exists ($LC lines)"

# 2. 이모지 0 (BMP-외 + 흔한 BMP 이모지 + 기호 이모지 + VS16 + ZWJ)
EMOJI=$(LC_ALL=C python3 -c "
import re,sys
s=open('$F',encoding='utf-8').read()
# Emoji ranges (all expressed via \u escapes so this plan file stays ASCII-clean):
#   U+2600..U+27BF (Misc Symbols + Dingbats), U+1F000..U+1FFFF (Emoji/Pictographs),
#   U+FE0F (VS16), U+200D (ZWJ). Allowed visible chars like single-angle quotes / arrows
#   (U+2039/U+203A/U+2191/U+2193) fall outside U+2600..U+27BF so they are safe.
pat=re.compile('[\u2600-\u27BF\U0001F000-\U0001FFFF\uFE0F\u200D]')
m=pat.findall(s)
print(len(m))
")
test "$EMOJI" = "0" || { echo "FAIL 2: emoji count = $EMOJI (expected 0)"; exit 1; }
echo "PASS 2: emoji 0"

# 3. 9·10·11px font-size 0 (HTML comment 안의 카드 폰트 룰 인용 가능 — comment 제외)
# grep 'font-size:9px' 또는 'font-size:10px' 또는 'font-size:11px' (콜론 뒤 공백 무관)
# 코멘트 안은 <!-- ... --> 라 sed 로 제거 후 검사
SMALL=$(sed -E 's/<!--[^>]*-->//g' "$F" | grep -E 'font-size:\s*(9|10|11)px' | wc -l | tr -d ' ')
test "$SMALL" = "0" || { echo "FAIL 3: small font-size count = $SMALL (expected 0)"; exit 1; }
echo "PASS 3: 9/10/11px font-size 0"

# 4. status- prefix className 0 (text-status-fire 등)
STATUS_PFX=$(grep -E 'class="[^"]*text-status-' "$F" | wc -l | tr -d ' ')
test "$STATUS_PFX" = "0" || { echo "FAIL 4: text-status-* count = $STATUS_PFX (expected 0)"; exit 1; }
echo "PASS 4: text-status-* prefix 0"

# 5. SCHED_CATEGORIES hex 5종 모두 등장
for HEX in '#3b82f6' '#eab308' '#e2e8f0' '#f97316' '#ef4444'; do
  C=$(grep -c "$HEX" "$F")
  test "$C" -ge 1 || { echo "FAIL 5: $HEX missing"; exit 1; }
done
echo "PASS 5: all 5 category hex present"

# 6. 라이트 모드 event #94a3b8 등장 (W1 OQ #1 LOCKED)
test "$(grep -c '#94a3b8' "$F")" -ge 1 || { echo "FAIL 6: #94a3b8 (light event dot) missing"; exit 1; }
echo "PASS 6: #94a3b8 light event present"

# 7. STATUS_LABEL 4종 한글 모두 등장
for L in '예정' '진행중' '완료' '지연'; do
  test "$(grep -c "$L" "$F")" -ge 1 || { echo "FAIL 7: status label '$L' missing"; exit 1; }
done
echo "PASS 7: all 4 status labels present"

# 8. tokens.css 임베드 (W1 핵심 토큰 verbatim)
test "$(grep -c -- '--surface-page:    #0a0d12' "$F")" -ge 1 || { echo "FAIL 8: tokens.css surface-page dark missing"; exit 1; }
test "$(grep -c -- '--surface-page:    #ffffff' "$F")" -ge 1 || { echo "FAIL 8: tokens.css surface-page light missing"; exit 1; }
echo "PASS 8: tokens.css embedded"

# 9. typography.css 임베드 (.text-caption / .text-title / .text-body)
test "$(grep -c '.text-caption' "$F")" -ge 1 || { echo "FAIL 9: .text-caption missing"; exit 1; }
test "$(grep -c '.text-title' "$F")" -ge 1 || { echo "FAIL 9: .text-title missing"; exit 1; }
test "$(grep -c '.text-body' "$F")" -ge 1 || { echo "FAIL 9: .text-body missing"; exit 1; }
echo "PASS 9: typography.css embedded"

# 10. data-theme 토글 동작 (setTheme 함수)
test "$(grep -c 'setTheme' "$F")" -ge 2 || { echo "FAIL 10: setTheme function missing"; exit 1; }
echo "PASS 10: data-theme toggle present"

# 11. 카드 핵심 요소 — 카테고리 배지 + 상태 라벨 + 제목 + 액션 (수정/삭제)
test "$(grep -c '수정' "$F")" -ge 1 || { echo "FAIL 11: 수정 button missing"; exit 1; }
test "$(grep -c '삭제' "$F")" -ge 1 || { echo "FAIL 11: 삭제 button missing"; exit 1; }
echo "PASS 11: card actions (수정/삭제) present"

# 12. add CTA 3종 옵션 모두 등장 (옵션 a / 옵션 b / 옵션 c)
test "$(grep -c '옵션 a' "$F")" -ge 1 || { echo "FAIL 12: 옵션 a missing"; exit 1; }
test "$(grep -c '옵션 b' "$F")" -ge 1 || { echo "FAIL 12: 옵션 b missing"; exit 1; }
test "$(grep -c '옵션 c' "$F")" -ge 1 || { echo "FAIL 12: 옵션 c missing"; exit 1; }
echo "PASS 12: 3 CTA options present"

# 13. OQ 3건 (#1, #2, #3) 모두 등장
for OQ in 'OQ #1' 'OQ #2' 'OQ #3'; do
  test "$(grep -c "$OQ" "$F")" -ge 1 || { echo "FAIL 13: $OQ missing"; exit 1; }
done
echo "PASS 13: OQ 3 items present"

# 14. Empty + Loading state 모두 등장
test "$(grep -c '등록된 일정이 없습니다' "$F")" -ge 1 || { echo "FAIL 14: empty state missing"; exit 1; }
test "$(grep -c '불러오는 중' "$F")" -ge 1 || { echo "FAIL 14: loading state missing"; exit 1; }
echo "PASS 14: empty + loading states present"

# 15. 멀티데이 범위 표시 ("5/12" + "5/15" + "4일" 같이)
test "$(grep -c '5/12' "$F")" -ge 1 || { echo "FAIL 15: multi-day 5/12 missing"; exit 1; }
test "$(grep -c '5/15' "$F")" -ge 1 || { echo "FAIL 15: multi-day 5/15 missing"; exit 1; }
echo "PASS 15: multi-day range present"

# 16. 카테고리 범례 5종 dot + 라벨 모두 등장
for L in '점검' '업무' '행사' '승강기' '소방'; do
  test "$(grep -c "$L" "$F")" -ge 1 || { echo "FAIL 16: legend label '$L' missing"; exit 1; }
done
echo "PASS 16: 5 category legend labels present"

echo ""
echo "=========================================="
echo "ALL 16 VERIFY GATES PASSED"
echo "=========================================="
    </automated>
  </verify>
  <done>
- `cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html` 파일 존재 (≥ 600 라인)
- 자동 verify gate 16개 모두 PASS
- 다크/라이트 frame 2개 (모바일) + 데스크톱 1개 frame 모두 렌더
- 일정 카드 3장 (시나리오 A) + 멀티데이 sub-strip (시나리오 B, OQ #3 a/b/c 3장) + 상태 variant 4장 (P/Q/R/S) + Empty + Loading + 카테고리 범례 + CTA 3 옵션 + OQ 카드 + Footer 모두 노출
- 사용자가 브라우저에서 파일 열어서 OQ 3건 답변 가능한 상태
  </done>
</task>

</tasks>

<verification>
브라우저 검증 (사용자 컨펌):
1. `open cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html`
2. 우상단 다크/라이트 토글 → 라이트 모드에서 행사 카테고리 dot 이 #94a3b8 로 변경되는지 확인
3. 모바일 frame 다크 + 라이트 side-by-side 비교 — 5종 카테고리 hex 일관성, 4종 상태 라벨 색 차이
4. 멀티데이 카드 3 옵션 (a/b/c) 시각 비교 → OQ #3 답변 도출
5. 상태 variant 4장 (P/Q/R/S) 색 + 좌측 4px bar(지연) 시각 확인
6. add CTA 3 옵션 (헤더 inline / 리스트 위 풀폭 / FAB) 비교 → OQ #2 답변 도출
7. 상태 칩 색 매핑 (현재 source verbatim 옵션 a 만 시연됨) → OQ #1 답변
8. W1 의 LOCKED 결정 ("오늘" 칩 제거 / 멀티데이 dot only / 라이트 #94a3b8) 일관 유지 확인
</verification>

<success_criteria>
1. 파일 1개 생성 (`sketch-wave-2.html`, 600~900 라인)
2. 자동 verify gate 16개 모두 PASS
3. 사용자가 브라우저에서 직접 보고 OQ 3건 (#1 상태색 / #2 CTA / #3 멀티데이) 답변 가능
4. W1 LOCKED 결정 일관 mirror (hex 5종, 라이트 event #94a3b8, "오늘" 칩 제거, 멀티데이 = dot only)
5. 비즈니스 로직 변경 0 (SchedulePage.tsx 한 줄도 수정 X)
6. 메모리 룰 체크리스트 footer 에 명시 + 룰 위반 0
</success_criteria>

<output>
After completion, no SUMMARY.md needed (quick mode, single sketch). 
사용자가 sketch 보고 OQ 답변 → 다음 wave (TSX 변환 또는 W3) 진행.
</output>
