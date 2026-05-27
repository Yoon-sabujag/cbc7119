---
phase: 260527-egj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html
  - src/pages/DashboardPage.tsx
autonomous: false
requirements:
  - QUICK-260527-egj-01
  - QUICK-260527-egj-02
tags:
  - dashboard
  - donut
  - design-system
  - v0.1.1
  - 6.1-progress-color-rule
must_haves:
  truths:
    - "대시보드 '이번 달 점검 현황' 도넛 색이 §6.1 Progress Color Rule (4단계 진척률 매핑) 만 사용한다"
    - "ITEM_COLORS 회전 팔레트 (server m.color) 가 도넛 중앙 trail/value 색에 더 이상 사용되지 않는다"
    - "DIV/컴프레셔 doubleCycle 의 early/late overlay arc 색 (info 파랑 / warn 주황) 은 변경 없이 유지된다"
    - "API 응답 shape (m.color, m.early_color, m.late_color 포함) 무수정 — BC 유지"
    - "모바일 strip (size 76, line 318-336) + 데스크톱 strip (size 44, line 666-684) 두 영역 모두 동일 룰 적용"
    - "TSX 변경 전 사용자에게 시안 HTML 로 §6.1 적용 결과를 먼저 보여주고 명시적 승인을 받는다"
  artifacts:
    - path: ".planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html"
      provides: "§6.1 Progress Color Rule 시각화 시안 (standalone HTML)"
      contains: "Old (ITEM_COLORS) vs New (§6.1) before/after + 모바일 strip + 데스크톱 strip + doubleCycle 예시"
    - path: "src/pages/DashboardPage.tsx"
      provides: "progressColor(pct) helper + 두 Donut 렌더 위치 color prop 교체"
      contains: "function progressColor"
  key_links:
    - from: "src/pages/DashboardPage.tsx Donut color prop (mobile, ~line 319/331)"
      to: "progressColor(m.pct) helper"
      via: "JSX color prop"
      pattern: "color=\\{progressColor\\(m\\.pct\\)\\}"
    - from: "src/pages/DashboardPage.tsx Donut color prop (desktop, ~line 668/680)"
      to: "progressColor(m.pct) helper"
      via: "JSX color prop"
      pattern: "color=\\{progressColor\\(m\\.pct\\)\\}"
    - from: "progressColor helper"
      to: "tokens.css §6.1 hex 값"
      via: "직접 hex 리턴 (CSS var() 가 SVG stroke attribute 에서 일부 환경 안전치 않을 수 있어 hex 직접 사용)"
      pattern: "#22c55e|#3b82f6|#f59e0b|#8b949e"
---

<objective>
대시보드 "이번 달 점검 현황" 도넛 색상을 디자인 시스템 v0.1.1 §6.1 Progress Color Rule 에 맞게 클라이언트에서 derive 한다. API (functions/api/dashboard/stats.ts) 는 무수정 (m.color 응답 필드 유지, BC), 클라이언트 DashboardPage.tsx 에서만 진척률 → 색 매핑을 적용한다.

§6.1 룰:
- 100%: `--status-safe-bar` (#22c55e)
- 50~99%: `--accent` (#3b82f6)
- 1~49%: `--status-warning-bar` (#f59e0b)
- 0%: `--text-tertiary` (#8b949e)

카테고리별 임의 색 배정 폐지 (현재 stats.ts ITEM_COLORS 13색 회전 팔레트).

**범위 한정:**
- 적용 대상 = 모바일 strip (DashboardPage.tsx line 318-336, Donut size 76) + 데스크톱 strip (line 666-684, Donut size 44) 의 중앙 pct 도넛 trail/value 색.
- 적용 제외 = DIV/컴프레셔 doubleCycle 의 early/late overlay arc 색 (m.early_color / m.late_color). 이건 §6.1 적용 범위 밖 (two-lap cycle 진행 단계 구분용 overlay) — 그대로 유지.

Purpose: 카테고리마다 임의 색으로 보여 진척률을 한눈에 읽기 어려웠던 문제 해결. 모든 도넛이 동일 색 룰을 따르므로 "100% 초록 / 진행 중 파랑 / 부진 노랑 / 미시작 회색" 만으로 상태를 바로 인지.
Output: 시안 HTML 1개 + DashboardPage.tsx patch (helper 1 + JSX 4 곳).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/CLAUDE.md
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.local.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/01-dashboard/design-system.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/01-dashboard/01-dashboard.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/DashboardPage.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/components/ui/index.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/styles/tokens.css

<interfaces>
<!-- Donut 컴포넌트 시그니처 (src/components/ui/index.tsx:161) -->
```typescript
interface DonutProps {
  pct: number              // 0~100
  color: string            // 중앙 trail+value 색 (hex 또는 CSS var)
  size?: number            // default 40
  strokeWidth?: number     // default 5
  doubleCycle?: {
    earlyPct: number
    latePct: number
    earlyColor: string     // overlay arc 1 (info)
    lateColor: string      // overlay arc 2 (warn)
  }
}
export function Donut({ pct, color, size = 40, strokeWidth = 5, doubleCycle }: DonutProps)
```

<!-- MonthlyItem 타입 (DashboardPage.tsx line 27-39 부근) -->
```typescript
interface MonthlyItem {
  label: string
  pct: number
  total: number
  done: number
  color: string                      // 현재 사용 — §6.1 적용 후엔 무시
  doubleCycle?: boolean
  early_pct?: number
  late_pct?: number
  early_color?: string               // info / warn overlay arc — 유지
  late_color?: string                // 유지
}
```

<!-- §6.1 색 hex 값 (tokens.css line 38-55) -->
```
--status-safe-bar:    #22c55e   (100%)
--accent:             #3b82f6   (50~99%)
--status-warning-bar: #f59e0b   (1~49%)
--text-tertiary:      #8b949e   (0%)
```

<!-- 현재 stats.ts color 할당 (무수정 대상, 참고만) -->
- ITEM_COLORS = ['#22c55e','#3b82f6','#f59e0b','#0ea5e9','#8b5cf6','#ec4899','#f97316','#14b8a6','#6366f1','#84cc16','#ef4444','#06b6d4','#a855f7']
- 100% 완료: ITEM_COLORS[idx]
- 0% 미시작: '#52525b' (회색)
- 그 외: ITEM_COLORS[idx]
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: 시안 HTML — §6.1 Progress Color Rule 도넛 시각화 (standalone)</name>
  <files>.planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html</files>
  <action>
Standalone HTML 시안 파일을 만든다 (외부 의존성 0, tokens.css hex 인라인 복사).

**구조:**
1. `<style>` 블록에 다크 surface 토큰 + §6.1 4색 hex 인라인:
   - --surface-page: #0a0d12
   - --surface-raised: #1a1f27
   - --text-primary: #e6edf3
   - --text-secondary: #adb6c0
   - --text-tertiary: #8b949e
   - --status-safe-bar: #22c55e
   - --accent: #3b82f6
   - --status-warning-bar: #f59e0b
   - --info: #38bdf8
   - --warn: #fb923c

2. **섹션 A — Old vs New 색 룰 비교 (헤더):**
   - 가로 2열 grid (`grid-template-columns: 1fr 1fr`).
   - 왼쪽 "Old: ITEM_COLORS 회전 팔레트" — 4개 도넛 (label: 소화기/유도등/소화전/방화셔터, pct: 100/87/33/0) 에 server 가 주는 13색 중 4개 (#22c55e, #3b82f6, #f59e0b, #52525b 형태로 카테고리별 임의 배정 한 것 처럼) 적용.
   - 오른쪽 "New (§6.1)" — 동일 4개 도넛에 진척률 기반 색만 적용 (100→safe-bar, 87→accent, 33→warning-bar, 0→text-tertiary).
   - 시각적 비교가 메인 목적. 각 도넛 아래 pct 값 + 현재 색 hex 캡션.

3. **섹션 B — 모바일 strip (실제 배치 재현):**
   - 헤더 "모바일 strip (size 76, 2행)".
   - 다양한 pct 7개 도넛 가로 정렬: [100, 87, 60, 50, 33, 12, 0].
   - Donut size 76, strokeWidth 5 (실제 컴포넌트 비율). SVG 직접 그리기 (cx/cy=38, r=33, circumference=2*PI*33).
   - 각 도넛: trail full ring (`stroke: color, opacity: 0.18`) + value arc (`stroke: color, strokeDasharray=circumference*pct/100`) + 중앙 텍스트 `pct%`.
   - 도넛 아래 label (소화기/유도등/소화전/방화셔터/분말소화기/이산화탄소/스프링클러 같은 예시) + done/total (예: 14/14, 13/15, 6/10, 5/10, 5/15, 2/16, 0/12).
   - leading-snug 캡션 스타일 (caption + text-secondary).

4. **섹션 C — 데스크톱 strip:**
   - 헤더 "데스크톱 strip (size 44, 단일 행 가로 스크롤)".
   - 동일 7 도넛 size 44, strokeWidth 5, cx/cy=22, r=18 로 SVG.
   - 가로 한 줄 (overflow-x:auto), gap 16px.

5. **섹션 D — doubleCycle (DIV/컴프) 예외 시각화:**
   - 헤더 "doubleCycle — §6.1 적용 범위 밖 (overlay arc 그대로 유지)".
   - 도넛 1개 (size 76): 중앙 pct 60 → §6.1 적용 (accent #3b82f6 trail+value).
   - + overlay arc 2개: earlyPct 40 (#38bdf8 info), latePct 80 (#fb923c warn) — 동일 r 위에 SVG circle stroke overlay 로 표현.
   - 캡션: "중앙 60% 도넛 색만 §6.1 적용. early/late overlay arc 는 변경 없음."

6. **CSS:**
   - body: background:#0a0d12, color:#e6edf3, font-family: system-ui/Noto Sans KR fallback.
   - 섹션 카드: background:#1a1f27, border-radius:12px, padding:16px, margin-bottom:16px.
   - 도넛 컨테이너 flex column, gap 6px, items-center, text 중앙 정렬.

**금지:**
- 외부 CSS/JS/이미지 의존 금지 (standalone).
- "approved" 같은 자신감 문구 헤더에 적지 말 것.
- 디자인 룰 §6.2 카드 색 / §6.3 카테고리 카드 / 외 다른 룰은 시각화 대상 아님 (이번 task 는 §6.1 도넛만).

per requirement QUICK-260527-egj-01 — 시안 HTML 먼저 (CLAUDE.local.md 룰).
  </action>
  <verify>
    <automated>test -f .planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html &amp;&amp; grep -v '^&lt;!--' .planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html | grep -E '#22c55e|#3b82f6|#f59e0b|#8b949e' | wc -l | awk '{ if ($1 &gt;= 4) print "PASS: §6.1 4색 모두 포함"; else { print "FAIL: §6.1 색 누락 (찾은 색 수: " $1 ")"; exit 1 } }' &amp;&amp; grep -c 'doubleCycle\|early\|late' .planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html | awk '{ if ($1 &gt; 0) print "PASS: doubleCycle 섹션 존재"; else { print "FAIL: doubleCycle 시각화 누락"; exit 1 } }' &amp;&amp; grep -c 'size 76\|size=\"76\"\|width=\"76\"' .planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html | awk '{ if ($1 &gt; 0) print "PASS: 모바일 size 76 표기 포함"; else { print "FAIL: 모바일 size 76 누락"; exit 1 } }'</automated>
  </verify>
  <done>
- sketch/donut-progress-color.html 파일 존재.
- §6.1 4색 (#22c55e, #3b82f6, #f59e0b, #8b949e) 모두 포함.
- Old vs New 비교 섹션 + 모바일 strip (size 76, 7 도넛) + 데스크톱 strip (size 44) + doubleCycle 예외 섹션 모두 존재.
- standalone (외부 의존성 0, 브라우저에서 더블클릭으로 열림).
- Task 2 진행 전 사용자가 브라우저에서 열어보고 명시적으로 "OK / TSX 진행" 승인 필요.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Checkpoint: 시안 HTML 사용자 승인 대기 (DO NOT EXECUTE TASK 3 WITHOUT APPROVAL)</name>
  <what-built>
.planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html — §6.1 Progress Color Rule 도넛 시각화 시안 (Old vs New 비교 + 모바일/데스크톱 strip + doubleCycle 예외).
  </what-built>
  <how-to-verify>
1. `open .planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html` 으로 브라우저에서 연다.
2. 4개 섹션 확인:
   - Old vs New 비교 (4 카테고리 같은 pct, 색만 다름)
   - 모바일 strip 7 도넛 (pct 100/87/60/50/33/12/0 → safe-bar / accent / accent / accent / warning-bar / warning-bar / text-tertiary)
   - 데스크톱 strip 동일 7 도넛 size 44
   - doubleCycle 예외 (중앙 §6.1 + early info / late warn overlay 그대로)
3. 색 매핑이 §6.1 의도 (100% 초록 / 50~99% 파랑 / 1~49% 노랑 / 0% 회색) 와 일치하는지 본다.
4. doubleCycle 의 early(파랑 info)/late(주황 warn) overlay 가 §6.1 영향 없이 그대로 인지 확인한다.
  </how-to-verify>
  <resume-signal>
"approved" 또는 "TSX 진행" 입력 시 Task 3 (DashboardPage.tsx patch) 진행. 수정 요청 시 Task 1 으로 돌아간다. 본 게이트가 풀리지 않으면 Task 3 절대 실행 금지.
  </resume-signal>
</task>

<task type="auto" tdd="false">
  <name>Task 3: DashboardPage.tsx — progressColor helper + 2영역 4 Donut color prop 교체</name>
  <files>src/pages/DashboardPage.tsx</files>
  <behavior>
- progressColor(100) === '#22c55e'
- progressColor(87)  === '#3b82f6'
- progressColor(50)  === '#3b82f6'
- progressColor(49)  === '#f59e0b'
- progressColor(1)   === '#f59e0b'
- progressColor(0)   === '#8b949e'
- progressColor(NaN) treated as 0 → '#8b949e' (방어적)
- progressColor(150) treated as ≥100 → '#22c55e' (방어적)
- progressColor(-5)  treated as 0 → '#8b949e' (방어적)
  </behavior>
  <action>
**선행 조건: Task 2 checkpoint 가 사용자 "approved" 응답으로 풀린 후에만 실행. 아니면 즉시 중단.**

DashboardPage.tsx 를 다음과 같이 수정한다:

1. **helper 추가** — 파일 상단 (IS_ANDROID 상수 다음, line ~18 근처) 에 다음 함수 삽입:

```typescript
// §6.1 Progress Color Rule (design-system v0.1.1)
// 진척률 → 색 매핑. 모든 진척률 도넛/색바에서 일관 적용.
// 카테고리별 임의 색 배정 폐지 (server stats.ts ITEM_COLORS 회전 폐기).
function progressColor(pct: number): string {
  const p = Number.isFinite(pct) ? pct : 0
  if (p >= 100) return '#22c55e' // --status-safe-bar
  if (p >= 50)  return '#3b82f6' // --accent
  if (p >= 1)   return '#f59e0b' // --status-warning-bar
  return '#8b949e'               // --text-tertiary (0% 미시작)
}
```

2. **모바일 strip 교체** (line 318-336 영역):
   - 318 라인 부근의 `<Donut pct={m.pct} color={m.color} size={76} doubleCycle={{...}} />` 에서 `color={m.color}` → `color={progressColor(m.pct)}`.
   - 331 라인 부근의 `<Donut pct={m.pct} color={m.color} size={76} />` 에서도 `color={m.color}` → `color={progressColor(m.pct)}`.

3. **데스크톱 strip 교체** (line 666-684 영역):
   - 668 라인 부근 doubleCycle Donut: `color={m.color}` → `color={progressColor(m.pct)}`.
   - 680 라인 부근 일반 Donut: `color={m.color}` → `color={progressColor(m.pct)}`.

4. **유지 (변경 금지):**
   - doubleCycle 내부 `earlyColor: m.early_color ?? 'var(--info)'` / `lateColor: m.late_color ?? 'var(--warn)'` 4 곳 모두 그대로 둔다. §6.1 영향 범위 밖.
   - MonthlyItem 인터페이스 (라인 27~) 의 color/early_color/late_color 필드 정의 그대로 (API 응답 shape 유지를 위해 클라이언트 타입도 보존).
   - functions/api/dashboard/stats.ts 절대 수정 금지.
   - done/total 캡션의 `text-safe` 조건 (`m.total > 0 && m.done >= m.total`) 그대로.

5. **사후 검증 grep:**
   - `grep -n 'color={m.color}' src/pages/DashboardPage.tsx` 결과 0 건이어야 한다 (모두 progressColor 로 교체).
   - `grep -n 'progressColor(m.pct)' src/pages/DashboardPage.tsx` 결과 정확히 4 건이어야 한다 (모바일 2 + 데스크톱 2).
   - `grep -n 'm.early_color\|m.late_color' src/pages/DashboardPage.tsx` 결과 4 건 그대로 유지 (모바일 doubleCycle 2 + 데스크톱 doubleCycle 2).

6. **wrangler 명령 사용 금지** — CLAUDE.local.md 룰. 빌드 검증은 tsc / npm run build 만.

per requirement QUICK-260527-egj-02.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety &amp;&amp; grep -c 'function progressColor' src/pages/DashboardPage.tsx | awk '{ if ($1 == 1) print "PASS: helper 1개 정의"; else { print "FAIL: helper 개수 " $1; exit 1 } }' &amp;&amp; grep -c 'progressColor(m.pct)' src/pages/DashboardPage.tsx | awk '{ if ($1 == 4) print "PASS: 4 곳 적용 (모바일 2 + 데스크톱 2)"; else { print "FAIL: progressColor(m.pct) 적용 수 " $1 " (기대 4)"; exit 1 } }' &amp;&amp; grep -c 'color={m.color}' src/pages/DashboardPage.tsx | awk '{ if ($1 == 0) print "PASS: 잔존 color={m.color} 0건"; else { print "FAIL: 잔존 color={m.color} " $1 "건"; exit 1 } }' &amp;&amp; grep -c 'm.early_color\|m.late_color' src/pages/DashboardPage.tsx | awk '{ if ($1 == 4) print "PASS: doubleCycle overlay 보존 (early/late 합 4)"; else { print "FAIL: doubleCycle overlay 변형됨 " $1; exit 1 } }' &amp;&amp; npx tsc --noEmit 2&gt;&amp;1 | tail -20</automated>
  </verify>
  <done>
- progressColor 함수가 DashboardPage.tsx 파일 상단에 추가됨 (정확히 1개).
- 모바일 strip 2 Donut + 데스크톱 strip 2 Donut 모두 `color={progressColor(m.pct)}` 사용.
- doubleCycle 의 earlyColor/lateColor 4 곳 변경 없음.
- `color={m.color}` 잔존 0건.
- functions/api/dashboard/stats.ts 수정 없음 (`git diff functions/api/dashboard/stats.ts` empty).
- npx tsc --noEmit 통과 (관련 에러 없음 — 기존 비관련 에러는 무시).
- 빌드 후 브라우저에서 대시보드 monthly strip 색이 §6.1 룰 (100% 초록 / 50~99% 파랑 / 1~49% 노랑 / 0% 회색) 로 보임.
  </done>
</task>

</tasks>

<verification>
- Task 1: 시안 HTML 존재 + §6.1 4색 모두 + 4 섹션 (Old/New + 모바일 + 데스크톱 + doubleCycle).
- Task 2: 사용자 명시 승인 ("approved" / "TSX 진행") 없이는 Task 3 진입 금지.
- Task 3: helper 1개 + 4 곳 교체 + doubleCycle overlay 4 곳 보존 + stats.ts 무변경 + tsc 통과.

**End-to-end visual check (수동, deploy 후 한 번):**
- main 머지 → cbc7119-preview 자동 배포 (wrangler 금지).
- /dashboard 모바일 폭 + 데스크톱 폭 둘 다 "이번 달 점검 현황" 도넛 색이 §6.1 룰 따르는지 확인.
- DIV/컴프 카드 doubleCycle 의 info/warn overlay 색이 그대로인지 확인.
</verification>

<success_criteria>
- 시안 HTML 1개 (사용자 승인 받음).
- DashboardPage.tsx patch: progressColor helper + 4 곳 color prop 교체.
- API (stats.ts) 수정 0 byte.
- doubleCycle overlay (early_color/late_color) 변경 0 곳.
- TypeScript 컴파일 통과.
- 대시보드 monthly 도넛 모두 §6.1 4색 (#22c55e/#3b82f6/#f59e0b/#8b949e) 만 사용.
- v0.1.1 §6.1 "카테고리별 임의 색 배정 폐지" 룰 만족.
</success_criteria>

<output>
After completion, create `.planning/quick/260527-egj-6-1-progress-color-rule-derive/260527-egj-SUMMARY.md` describing:
- 시안 HTML 경로 + 사용자 승인 시점
- DashboardPage.tsx 변경 라인 번호 + before/after 색 매핑
- doubleCycle overlay 유지 확인 결과
- tsc / build 통과 여부
- main 머지 + cbc7119-preview 자동 배포 결과
- 직원 도메인 (cbc7119) 무영향 확인
</output>
