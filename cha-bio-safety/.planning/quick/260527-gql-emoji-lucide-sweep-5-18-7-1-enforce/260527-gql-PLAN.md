---
phase: 260527-gql
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html
  - src/pages/DashboardPage.tsx
  - src/pages/InspectionPage.tsx
  - src/pages/ElevatorPage.tsx
  - src/pages/ExtinguishersListPage.tsx
  - src/pages/ElevatorFindingDetailPage.tsx
autonomous: false
requirements:
  - QUICK-260527-gql
must_haves:
  truths:
    - "5 페이지 파일에서 유니코드 이모지(🔥⏰📋✅⚠️❌🔧🚨🔍🧯📊)가 제로 잔존"
    - "각 위치에서 Lucide React icon (또는 FireExtinguisherCustom) 이 동일한 시각적 역할을 수행"
    - "데스크톱 카테고리 카드 영역(InspectionPage 5820-5867)은 byte-level 무변경"
    - "INSPECT_RESULT_OPTIONS / REMEDIATION_OPTIONS 실사용처 모두 새 icon 컴포넌트로 렌더링 정상"
    - "ExtinguishersListPage 검색 input 의 🔍 placeholder 가 absolute Search icon + plain placeholder text 로 분리됨"
    - "InspectionPage 의 CATEGORY_GROUPS icon 필드(dead code) 모두 제거되어 unused emoji 0"
    - "타입체크(npx tsc --noEmit) 가 신규 에러 0 으로 통과"
  artifacts:
    - path: ".planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html"
      provides: "4 컨텍스트 패턴 Old/New 가로 비교 시안 (standalone HTML)"
      contains: "RESULT pill / Schedule header / Streak badge / Search input"
    - path: "src/pages/DashboardPage.tsx"
      provides: "streak badge + schedule section header 에 Lucide icon"
      contains: "Flame"
    - path: "src/pages/InspectionPage.tsx"
      provides: "RESULT/REMEDIATION pill + 카테고리 헤더 + 빈상태 + 데드코드 정리"
      contains: "CheckCircle2"
    - path: "src/pages/ElevatorPage.tsx"
      provides: "수리완료/미해결/주의관찰/조치메모/지적사항 Lucide icon 통일"
      contains: "AlertTriangle"
    - path: "src/pages/ExtinguishersListPage.tsx"
      provides: "검색 input placeholder + absolute Search icon"
      contains: "Search"
    - path: "src/pages/ElevatorFindingDetailPage.tsx"
      provides: "조치 메모/수리 라벨에 Wrench Lucide icon"
      contains: "Wrench"
  key_links:
    - from: "src/pages/DashboardPage.tsx"
      to: "lucide-react"
      via: "named import 확장"
      pattern: "from 'lucide-react'"
    - from: "src/pages/InspectionPage.tsx"
      to: "src/components/ui/icons.tsx (FireExtinguisherCustom)"
      via: "named import"
      pattern: "FireExtinguisherCustom"
    - from: "INSPECT_RESULT_OPTIONS / REMEDIATION_OPTIONS"
      to: "JSX render sites within InspectionPage"
      via: "opt.iconComp (React.ComponentType) 또는 opt.icon (React.ComponentType) 으로 타입 변경"
      pattern: "<Icon size="
---

<objective>
코드베이스 잔존 유니코드 이모지를 Lucide React icon (또는 커스텀 SVG)으로 전면 1:1 교체.
메모리 `feedback_redesign_sketch_rule_enforcement.md` §7.1 "이모지 금지, Lucide 통일" 룰을 5 파일 18 instance 에 일괄 enforce.

Purpose: 디자인 룰 §7.1 위반 잔존분 제거. 이전 redesign wave 들이 시각 영역(시안→TSX)만 다듬은 결과, 비-디자인 코드 경로(데스크톱 영역, 모달 상태 라벨, dead code) 의 이모지가 남아 있음. 이번 1회 sweep 으로 룰 enforce 종결.
Output: standalone sketch HTML (4 패턴) + 5 페이지 파일 패치.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@../../../CLAUDE.local.md
@.planning/STATE.md
@src/components/ui/icons.tsx

<interfaces>
<!-- 커스텀 아이콘 — FireExtinguisherCustom 은 src/components/ui/icons.tsx 에 정의됨 -->
<!-- 사용처 예: <FireExtinguisherCustom size={14} /> 또는 <FireExtinguisherCustom size={16} className="..." /> -->

From src/components/ui/icons.tsx:
```typescript
export function StairsIcon({ size = 20, color, style, className, ...rest }: IconProps);
export function ShutterIcon(props: IconProps);
export function FireExtinguisherCustom(props: IconProps);
// IconProps: { size?: number; color?: string; style?: React.CSSProperties; className?: string }
```

From lucide-react (사용할 named exports):
```typescript
import { Flame, Clock, ClipboardList, CheckCircle2, AlertTriangle, AlertCircle, XCircle, Wrench, Search } from 'lucide-react'
// 모든 컴포넌트 공통 prop: { size?: number; className?: string; color?: string; strokeWidth?: number }
// 색 기본값 = currentColor — 부모 텍스트 색 상속
```

DashboardPage.tsx 기존 import (line 5):
```typescript
import { Map as MapIcon, BarChart3, Siren, Users } from 'lucide-react'
```
→ 확장: `Flame, Clock, ClipboardList` 추가.

InspectionPage.tsx INSPECT_RESULT_OPTIONS 현재 시그니처 (line 121-130):
```typescript
const INSPECT_RESULT_OPTIONS = [
  { value:'normal',  label:'정상', color:'var(--safe)',   bg:'rgba(34,197,94,.13)',  icon:'✅' },
  { value:'caution', label:'주의', color:'var(--warn)',   bg:'rgba(245,158,11,.13)', icon:'⚠️' },
  { value:'bad',     label:'불량', color:'var(--danger)', bg:'rgba(239,68,68,.13)',  icon:'❌' },
];
const REMEDIATION_OPTIONS = [
  { value:'unresolved', label:'미조치', color:'var(--fire)',  bg:'rgba(249,115,22,.13)',  icon:'🔧' },
  ...
];
```
→ `icon` 의 타입을 string 에서 React component (또는 별도 `iconComp` 필드 추가) 로 전환.
   채택안: 필드명은 `icon` 유지하고 타입을 `React.ComponentType<{ size?: number; className?: string }>` 로 변경.
   사용처는 `const I = opt.icon; <I size={12} />` 패턴으로 교체.
</interfaces>

<emoji_inventory>
**확정 매핑 표 (Task 3 의 단일 진실 원천):**

| 파일 | 라인(approx) | 이모지 | Lucide / 커스텀 | 사이즈 가이드 |
|---|---|---|---|---|
| DashboardPage.tsx | 529 | 🔥 | Flame | size=12, className="inline-block align-text-bottom ml-0.5" |
| DashboardPage.tsx | 638 | ⏰ | Clock | size=11, className="inline-block align-text-bottom mr-1" |
| DashboardPage.tsx | 644 | 📋 | ClipboardList | size=11, className="inline-block align-text-bottom mr-1" |
| InspectionPage.tsx | 51-67 (CATEGORY_GROUPS) | 🚪☁️🛡️🚗⚡⬜️📊💨⬅️🪟🪢🚰🧯🌊🔔📹 | **삭제 (dead code)** | n/a — `icon:` 필드 + interface 모두 제거 |
| InspectionPage.tsx | 122 | ✅ | CheckCircle2 | iconComp 패턴 |
| InspectionPage.tsx | 123 | ⚠️ | AlertTriangle | iconComp 패턴 |
| InspectionPage.tsx | 124 | ❌ | XCircle | iconComp 패턴 |
| InspectionPage.tsx | 129 | 🔧 | Wrench | iconComp 패턴 |
| InspectionPage.tsx | 3934 | 🧯 | FireExtinguisherCustom | size=14 또는 컨텍스트 맞춤 |
| InspectionPage.tsx | 4223 | ✅ | CheckCircle2 | 컨텍스트 맞춤 |
| InspectionPage.tsx | 4445 | 📋 | ClipboardList | 컨텍스트 맞춤 |
| InspectionPage.tsx | 4464 | 🔧 | Wrench | 컨텍스트 맞춤 |
| InspectionPage.tsx | 5005 | 📋 | ClipboardList | 컨텍스트 맞춤 |
| ElevatorPage.tsx | 721 | ✅ | CheckCircle2 | 수리완료 |
| ElevatorPage.tsx | 721 | 🚨 | AlertCircle | 미해결 |
| ElevatorPage.tsx | 855 | ⚠️ | AlertTriangle | 주의관찰 |
| ElevatorPage.tsx | 2630 | ✅ | CheckCircle2 | fontSize:9 컨텍스트 → size=10 |
| ElevatorPage.tsx | 3426 | ⚠️ | AlertTriangle | fontSize:12 fontWeight:700 → size=12 |
| ExtinguishersListPage.tsx | 429 | 🔍 | Search | size=16, absolute left-3 top-1/2 -translate-y-1/2 |
| ElevatorFindingDetailPage.tsx | 324 | 🔧 | Wrench | size=14, inline-block align-text-bottom mr-1 |
| ElevatorFindingDetailPage.tsx | 348 | 🔧 | Wrench | size=14, inline-block align-text-bottom mr-1 |

**메모:** CATEGORY_GROUPS 16 항목 전체에 이모지 `icon:` 필드 존재 (위 inventory 표에서 확인). 18 instance 카운트는 5 파일의 "사용되는" 이모지만 대상으로 했고, CATEGORY_GROUPS 의 icon 필드 16개는 dead code 라 별도 카운트 외 일괄 삭제 처리.
</emoji_inventory>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Sketch HTML 작성 (4 컨텍스트 패턴 Old/New 비교)</name>
  <files>.planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html</files>
  <action>
Standalone HTML 1 파일 작성. cha-bio-safety/.planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html (디렉토리 없으면 생성).

요구사항:
1) `<!DOCTYPE html>` + meta viewport. 다크 surface 토큰 CSS 변수 인라인:
   ```css
   --surface-page:#0a0d12; --surface-card:#0f1318; --border:#1f2937;
   --text-primary:#e5e7eb; --text-secondary:#9ca3af; --text-tertiary:#6b7280;
   --safe-bar:#22c55e; --warning-bar:#f59e0b; --danger-bar:#ef4444; --fire-bar:#f97316;
   --safe-bg:rgba(34,197,94,.13); --warning-bg:rgba(245,158,11,.13);
   --danger-bg:rgba(239,68,68,.13); --fire-bg:rgba(249,115,22,.13);
   ```
2) 본문은 다크 배경 + 4 섹션. 각 섹션 헤딩 + Old/New 가로 2열 (`display:grid; grid-template-columns:1fr 1fr; gap:24px;`). 좌측 라벨 "Old (이모지)" / 우측 라벨 "New (Lucide)". 컨테이너는 카드 톤 (`background:var(--surface-card); padding:16px; border-radius:12px; border:1px solid var(--border)`).
3) 4 패턴:
   - **Pattern A — RESULT pill (정상/주의/불량/미조치)**: 4 pill 가로 나열. Old 쪽은 `✅ 정상 / ⚠️ 주의 / ❌ 불량 / 🔧 미조치` 이모지 + 라벨. New 쪽은 동일 라벨 + Lucide SVG (CheckCircle2 / AlertTriangle / XCircle / Wrench). pill 형태: `display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:600;`. 색은 status bar 색을 글자/border 에 적용 + 옅은 bg (`safe-bg` 등).
   - **Pattern B — Schedule section header (시간확정 / 시간미정)**: 작은 caption 헤딩 2개. text-caption 풍 (`font-size:12px; letter-spacing:0.05em; text-transform:uppercase; color:var(--text-secondary)`). Old: `⏰ 시간 확정` / `📋 시간 미정`. New: `<svg> 시간 확정` / `<svg> 시간 미정` — Lucide Clock / ClipboardList size=11 inline.
   - **Pattern C — Streak badge (연속 N일 점검 달성 🔥)**: text-caption inline. Old: `연속 7일 점검 달성 🔥`. New: `연속 7일 점검 달성 <Flame size=12>` — Flame icon 색은 fire-bar (#f97316) 로 visually 강조.
   - **Pattern D — Search input placeholder (소화기 검색 🔍)**: input 1줄 (`width:320px; background:var(--surface-card); border:1px solid var(--border); border-radius:8px; padding:10px 14px; color:var(--text-primary)`). Old: `placeholder="🔍 증지번호·제조번호 검색"` (이모지 placeholder 내부). New: input 좌측 absolute Search SVG (size=16, color:var(--text-tertiary), left:12px) + input padding-left:36px + placeholder="증지번호·제조번호 검색" (이모지 없음). 부모는 `position:relative;`.
4) Lucide SVG 는 직접 인라인 path (lucide-react v0.454 와 동일 path). 정확 path 가 어려우면 24x24 viewBox 단순 outline 으로 직접 그리되 stroke-width=2, fill=none, stroke=currentColor, stroke-linecap=round, stroke-linejoin=round 패턴 유지. 각 패턴마다 사이즈는 위 패턴 가이드 따름.
5) 페이지 최상단에 간단한 헤더: `<h1>emoji → Lucide 1:1 교체 시안</h1>` + 부제 `<p style="color:var(--text-secondary)">4 컨텍스트 패턴 — 룰 §7.1 enforce (5 파일 18 instance)</p>`.
6) iOS Safari + Chrome 모두에서 그대로 열림. JS 의존 없음. 외부 CDN/폰트 의존 없음 (system-ui).

비즈니스 데이터 의미 변경 없음. 색/사이즈는 위 토큰표 그대로.
  </action>
  <verify>
    <automated>test -s .planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html &amp;&amp; grep -c "Pattern" .planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html | awk '$1>=4'</automated>
  </verify>
  <done>
HTML 파일이 디스크에 존재 + 4 패턴 (RESULT pill / Schedule header / Streak badge / Search input) 모두 Old/New 좌우 비교 형태로 렌더링됨. 다크 배경 + 토큰 색 적용. 외부 의존 0.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Sketch 사용자 컨펌</name>
  <what-built>
.planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html 에 4 컨텍스트 패턴 Old/New 비교 시안 작성됨.

이 시안이 5 파일 18 instance 일괄 교체의 단일 진실 원천이 됩니다.
패턴 A (RESULT pill) → InspectionPage.tsx + ElevatorPage.tsx 의 모든 상태 pill 에 적용.
패턴 B (Schedule header) → DashboardPage.tsx 데스크톱 영역 시간확정/시간미정 헤딩.
패턴 C (Streak badge) → DashboardPage.tsx 연속 N일 streak.
패턴 D (Search input) → ExtinguishersListPage.tsx 검색 input.
  </what-built>
  <how-to-verify>
1) 브라우저로 파일 직접 열기:
   `open .planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html`
2) 각 패턴 확인:
   - Pattern A: 정상/주의/불량/미조치 4 pill 의 Lucide icon 이 의미 매핑 OK 인가? (CheckCircle2=정상, AlertTriangle=주의, XCircle=불량, Wrench=미조치)
   - Pattern B: Clock / ClipboardList 가 작은 caption (size=11) 으로 텍스트 옆에 자연스럽게 붙는가?
   - Pattern C: Flame size=12 가 streak badge 안에서 안 어색한가? (fire 색 활용)
   - Pattern D: Search input 좌측 absolute icon + placeholder text 분리가 자연스러운가?
3) 색/사이즈/border-radius 가 기존 디자인 룰 §6.3 (status pill) / §6.2 (negative rule) 과 충돌 없는가?
  </how-to-verify>
  <resume-signal>
"approved" 또는 패턴별 수정 사항 알려주시면 시안 보완 후 다시 컨펌 받음. 승인 전 Task 3 절대 실행 금지.
  </resume-signal>
</task>

<task type="auto">
  <name>Task 3: 5 파일 18 instance TSX 일괄 패치 (+ CATEGORY_GROUPS dead-code icon 16건 제거)</name>
  <files>src/pages/DashboardPage.tsx, src/pages/InspectionPage.tsx, src/pages/ElevatorPage.tsx, src/pages/ExtinguishersListPage.tsx, src/pages/ElevatorFindingDetailPage.tsx</files>
  <action>
승인된 시안 기준 1:1 교체. 비즈니스 로직(onClick, useState, useQuery, data flow) 무수정. 토큰 색/레이아웃 무변경. inventory 표 (위 `<emoji_inventory>` 블록) 가 단일 진실 원천.

**Step 1 — DashboardPage.tsx:**
- Line 5 import 확장:
  ```ts
  import { Map as MapIcon, BarChart3, Siren, Users, Flame, Clock, ClipboardList } from 'lucide-react'
  ```
- Line 529 streak badge: 텍스트 "연속 {stats.streakDays}일 점검 달성 🔥" 의 🔥 를 제거하고 그 자리에 `<Flame size={12} className="inline-block align-text-bottom ml-0.5" />` JSX 삽입. fire 색 강조가 필요하면 className 에 `text-fire-bar` 추가 (없어도 currentColor 로 streak 영역 톤 유지).
- Line 638: `⏰ 시간 확정` 를 `<><Clock size={11} className="inline-block align-text-bottom mr-1" />시간 확정</>` 으로 교체 (JSX fragment 또는 기존 span 내부 적용).
- Line 644: `📋 시간 미정` 를 `<><ClipboardList size={11} className="inline-block align-text-bottom mr-1" />시간 미정</>` 으로 교체.

**Step 2 — InspectionPage.tsx:**

(a) CATEGORY_GROUPS dead code 제거 (line 51-67 부근):
- `CATEGORY_GROUPS` 배열 각 항목에서 `icon:'<emoji>',` 필드 완전 삭제 (16 항목 전부).
- 위쪽 type/interface 정의에서 `icon: string;` 필드도 같이 제거.
- grep 검증: `grep -nE "icon:\s*'[^']+'" src/pages/InspectionPage.tsx` 결과 0 (CATEGORY_GROUPS 영역 한정).
- 만약 CATEGORY_GROUPS 의 `icon` 필드를 어딘가에서 실제로 참조하고 있다면 (`.icon` 으로 read) — 그 사용처도 제거. 대신 CATEGORY_ICONS Lucide 매핑이 source of truth.

(b) INSPECT_RESULT_OPTIONS / REMEDIATION_OPTIONS 타입 전환 (line 121-130):
- `import { CheckCircle2, AlertTriangle, XCircle, Wrench } from 'lucide-react'` (기존 import 줄 확장 또는 추가).
- 두 배열의 `icon: '<emoji>'` 를 React component 참조로 변경:
  ```ts
  const INSPECT_RESULT_OPTIONS = [
    { value:'normal',  label:'정상', color:'var(--safe)',   bg:'rgba(34,197,94,.13)',  icon: CheckCircle2 },
    { value:'caution', label:'주의', color:'var(--warn)',   bg:'rgba(245,158,11,.13)', icon: AlertTriangle },
    { value:'bad',     label:'불량', color:'var(--danger)', bg:'rgba(239,68,68,.13)',  icon: XCircle },
  ];
  const REMEDIATION_OPTIONS = [
    { value:'unresolved', label:'미조치', color:'var(--fire)',  bg:'rgba(249,115,22,.13)',  icon: Wrench },
    /* (배열의 나머지 항목들은 그대로 유지하되, 이모지가 있던 항목은 동일 패턴으로 컴포넌트로) */
  ];
  ```
- `opt.icon` 사용처 전수 grep: `grep -n "opt\.icon\|\.icon}" src/pages/InspectionPage.tsx`.
  - 기존 `{opt.icon}` (string emoji 렌더링) 패턴을 `{(() => { const I = opt.icon; return <I size={14} />; })()}` 또는 `<opt.icon size={14} />` (JSX dot rendering — 대문자 시작이 아니라 작동 안 함, 따라서 `const I = opt.icon` 변수 할당 후 `<I />`) 로 교체.
  - 사이즈는 컨텍스트별로 — pill 안에서는 size=12, mr-0.5; 큰 라벨이면 size=14.

(c) 라인별 단발 교체:
- Line 3934 `🧯`: `<FireExtinguisherCustom size={14} />` (or 컨텍스트 사이즈). `import { FireExtinguisherCustom } from '../components/ui/icons'` 추가.
- Line 4223 `✅`: `<CheckCircle2 size={14} className="inline-block align-text-bottom mr-1" />` (컨텍스트 사이즈 맞춤).
- Line 4445 `📋`: `<ClipboardList size={14} className="inline-block align-text-bottom mr-1" />`.
- Line 4464 `🔧`: `<Wrench size={14} className="inline-block align-text-bottom mr-1" />`.
- Line 5005 `📋`: `<ClipboardList size={14} className="inline-block align-text-bottom mr-1" />`.

(d) **변경 금지 영역 (가드):**
- Line 5820-5867 (데스크톱 카테고리 카드) — byte-level 무변경.
- getCatBarClass / progressColor / CATEGORY_ICONS — 무변경.

**Step 3 — ElevatorPage.tsx:**
- import 확장: `import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'` (기존 import 줄에 통합).
- Line 721 conditional (`✅` / `🚨`): JSX 분기 `{isFixed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}` 패턴 (실제 변수명은 코드 컨텍스트 따라). 두 곳 모두 inline (수리완료/미해결).
- Line 855 `⚠️`: `<AlertTriangle size={12} className="inline-block align-text-bottom mr-1" />` (주의관찰 항목).
- Line 2630 `✅` (inline style fontSize:9): `<CheckCircle2 size={10} style={{display:'inline-block', verticalAlign:'text-bottom', marginRight:2}} />` (inline style 유지). 또는 svg 자체 width/height=10.
- Line 3426 `⚠️` (fontSize:12 fontWeight:700): `<AlertTriangle size={12} style={{display:'inline-block', verticalAlign:'text-bottom', marginRight:4}} />` (지적사항 및 조치 헤더).

**Step 4 — ExtinguishersListPage.tsx:**
- import 추가: `import { Search } from 'lucide-react'` (기존 lucide import 확장).
- Line 429 placeholder 변경:
  Before:
  ```tsx
  <input ... placeholder="🔍 증지번호·제조번호 검색" ... />
  ```
  After (input 의 부모/wrapper 가 `relative` 인지 확인. 아니면 wrapper div 추가):
  ```tsx
  <div className="relative">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
    <input ... placeholder="증지번호·제조번호 검색" className="... pl-9 ..." />
  </div>
  ```
  - input 의 기존 패딩-left 가 있으면 `pl-9` (36px) 로 교체. 그 외 className/props 모두 유지.
  - 이미 wrapper 가 relative 인 경우 div 신설 없이 inline icon 만 추가.

**Step 5 — ElevatorFindingDetailPage.tsx:**
- import 추가: `import { Wrench } from 'lucide-react'`.
- Line 324, 348 `🔧` 두 곳 모두 `<Wrench size={14} className="inline-block align-text-bottom mr-1" />` 로 교체.

**검증 시퀀스 (verify 가 모두 통과해야 done):**
1) `grep -rE '🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' src/pages/DashboardPage.tsx src/pages/InspectionPage.tsx src/pages/ElevatorPage.tsx src/pages/ExtinguishersListPage.tsx src/pages/ElevatorFindingDetailPage.tsx | wc -l` → **0**.
2) `grep -nE "icon:\s*'[^']+'" src/pages/InspectionPage.tsx` → **0** (CATEGORY_GROUPS / RESULT / REMEDIATION 의 emoji string icon 0).
3) `npx tsc --noEmit` → 관련 신규 에러 0. (기존 에러는 무관, diff 만 본다)
4) `sed -n '5820,5867p' src/pages/InspectionPage.tsx` 이전/이후 동일 (byte-level guard).
5) 각 import 가 실제 사용처 있음 — unused lucide import 0. 검증: 각 새로 추가한 named import 별로 `grep -c "<ComponentName" src/pages/<File>.tsx` 가 >= 1.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety &amp;&amp; EMOJI=$(grep -rE '🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' src/pages/DashboardPage.tsx src/pages/InspectionPage.tsx src/pages/ElevatorPage.tsx src/pages/ExtinguishersListPage.tsx src/pages/ElevatorFindingDetailPage.tsx 2>/dev/null | wc -l | tr -d ' ') &amp;&amp; DEAD=$(grep -cE "icon:\s*'[^']+'" src/pages/InspectionPage.tsx 2>/dev/null || echo 0) &amp;&amp; echo "emoji=$EMOJI dead_icon=$DEAD" &amp;&amp; [ "$EMOJI" = "0" ] &amp;&amp; [ "$DEAD" = "0" ] &amp;&amp; npx tsc --noEmit 2>&amp;1 | grep -E "src/pages/(DashboardPage|InspectionPage|ElevatorPage|ExtinguishersListPage|ElevatorFindingDetailPage)\.tsx" | wc -l | awk '$1==0 {print "tsc OK"; exit 0} {print "tsc FAIL"; exit 1}'</automated>
  </verify>
  <done>
- 5 파일에서 유니코드 이모지 잔존 0 (target list).
- InspectionPage.tsx CATEGORY_GROUPS / RESULT / REMEDIATION 의 emoji string icon 필드 모두 제거 또는 React component 로 전환.
- 모든 새 Lucide / FireExtinguisherCustom import 가 실사용되어 unused import 0.
- tsc --noEmit 관련 신규 에러 0.
- 데스크톱 카테고리 카드 영역 (InspectionPage 5820-5867) byte-level 무변경.
- 디자인 룰 §7.1 enforce 완료.
  </done>
</task>

</tasks>

<verification>
**최종 통합 검증 (Task 3 종료 후):**

1) 이모지 잔존 0:
   ```bash
   grep -rE '🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' src/pages/{DashboardPage,InspectionPage,ElevatorPage,ExtinguishersListPage,ElevatorFindingDetailPage}.tsx | wc -l
   # 기대값: 0
   ```

2) Dead-code icon string 0 (InspectionPage 한정):
   ```bash
   grep -cE "icon:\s*'[^']+'" src/pages/InspectionPage.tsx
   # 기대값: 0
   ```

3) Unused import 0:
   ```bash
   for COMP in Flame Clock ClipboardList CheckCircle2 AlertTriangle AlertCircle XCircle Wrench Search FireExtinguisherCustom; do
     for F in src/pages/DashboardPage.tsx src/pages/InspectionPage.tsx src/pages/ElevatorPage.tsx src/pages/ExtinguishersListPage.tsx src/pages/ElevatorFindingDetailPage.tsx; do
       IMP=$(grep -c "\b$COMP\b" "$F" 2>/dev/null || echo 0)
       USE=$(grep -c "<$COMP\|$COMP\b\s*[,}]" "$F" 2>/dev/null || echo 0)
       # 각 컴포넌트가 import 되어 있으면 사용처도 있어야 함
     done
   done
   ```

4) 타입체크:
   ```bash
   npx tsc --noEmit 2>&1 | grep -E "src/pages/(DashboardPage|InspectionPage|ElevatorPage|ExtinguishersListPage|ElevatorFindingDetailPage)\.tsx"
   # 기대값: 빈 출력
   ```

5) 데스크톱 영역 가드 (InspectionPage 5820-5867):
   - Task 시작 전 hash 저장 → Task 종료 후 비교
   ```bash
   sed -n '5820,5867p' src/pages/InspectionPage.tsx | shasum
   # Task 1 전후 동일 해시
   ```

6) 빌드 검증 (선택):
   ```bash
   npm run build
   # 빌드 실패 0
   ```

7) (배포 검증은 사용자 영역 — main push 시 cbc7119-preview 자동 배포)
</verification>

<success_criteria>
- sketch HTML 1 파일 + 5 TSX 파일 패치 commit 가능 상태.
- 5 파일 18 instance + CATEGORY_GROUPS dead code 16 항목 모두 처리 완료.
- 디자인 룰 §7.1 (이모지 금지, Lucide 통일) 5 파일 enforce 종결.
- 비즈니스 로직 / 데스크톱 영역 무수정 (가드 통과).
- tsc / 빌드 통과.
</success_criteria>

<output>
After completion, create `.planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/260527-gql-SUMMARY.md` summarizing:
- 시안 패턴 4종 + 각 패턴 적용된 파일/라인 매핑
- 18 instance + CATEGORY_GROUPS 16 dead code 처리 결과
- 데스크톱 영역 byte-level guard 통과 증거 (sha)
- tsc / 빌드 결과
- 메모리 룰 §7.1 enforce 종결 선언
</output>
