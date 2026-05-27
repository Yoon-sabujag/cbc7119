---
phase: 260527-gql
plan: 01
subsystem: design-rule-enforce
tags: [emoji-sweep, lucide, design-rule-7-1, dead-code-cleanup]
dependency-graph:
  requires: []
  provides:
    - "디자인 룰 §7.1 (이모지 금지, Lucide 통일) 5 파일 enforce 완결"
  affects:
    - "src/pages/DashboardPage.tsx"
    - "src/pages/InspectionPage.tsx"
    - "src/pages/ElevatorPage.tsx"
    - "src/pages/ExtinguishersListPage.tsx"
    - "src/pages/ElevatorFindingDetailPage.tsx"
tech-stack:
  added: []
  patterns:
    - "absolute icon + plain placeholder for search inputs"
    - "inline-flex container for icon + text in inline status spans"
key-files:
  created:
    - ".planning/quick/260527-gql-emoji-lucide-sweep-5-18-7-1-enforce/sketch/emoji-to-lucide.html"
  modified:
    - "src/pages/DashboardPage.tsx"
    - "src/pages/InspectionPage.tsx"
    - "src/pages/ElevatorPage.tsx"
    - "src/pages/ExtinguishersListPage.tsx"
    - "src/pages/ElevatorFindingDetailPage.tsx"
decisions:
  - "Pattern 1 (INSPECT_RESULT_OPTIONS / ALL_RESULT_OPTIONS icon 필드) 는 코드 어디서도 read 되지 않는 dead code 로 확인 → 필드 통째 삭제 (orchestrator override)"
  - "CATEGORY_GROUPS 16개 icon 필드도 동일 패턴 dead code → 삭제. CATEGORY_ICONS Lucide 매핑이 단일 진실 원천"
  - "ZONE_CONFIG 3개 icon 필드도 동일 dead code → 삭제. ZONE_ICONS Lucide 매핑이 단일 진실 원천 (verify gate 통과 위해 추가 적용)"
  - "ExtinguishersListPage 검색 input 은 inline-style 기반이라 wrapper/icon 모두 inline-style 사용 (Tailwind class 미혼용)"
  - "데스크톱 카테고리 카드 영역 byte-level guard 통과 (sha = a89596a1ea4317f2365189644bc310bf6755b78d)"
metrics:
  duration: "Task 1 + Task 3 합산 (이 dispatch 는 Task 3 단독, 약 15분)"
  completed: 2026-05-27
---

# 260527-gql Plan 01: emoji → Lucide sweep (5 파일 18 곳) Summary

## One-liner

5 페이지 파일의 잔존 이모지 18 instance + dead-code icon 필드 23개를 Lucide React (또는 FireExtinguisherCustom) 로 1:1 교체. 디자인 룰 §7.1 enforce 종결.

## Objective Recap

코드베이스 잔존 유니코드 이모지를 Lucide React icon (또는 커스텀 SVG)으로 전면 1:1 교체.
메모리 `feedback_redesign_sketch_rule_enforcement.md` §7.1 "이모지 금지, Lucide 통일" 룰을 5 파일에 일괄 enforce.

## Sketch (Task 1) — f0534ef (이미 main 머지)

4 컨텍스트 패턴 Old/New 가로 비교 시안 (standalone HTML):
- Pattern A — RESULT pill (정상/주의/불량/미조치) → CheckCircle2 / AlertTriangle / XCircle / Wrench
- Pattern B — Schedule header (시간확정/시간미정) → Clock / ClipboardList
- Pattern C — Streak badge (연속 N일 점검 달성 🔥) → Flame
- Pattern D — Search input (placeholder 🔍) → absolute Search icon + plain placeholder

User approved at Task 2 checkpoint.

## TSX Patch (Task 3) — aa381be (이 dispatch)

### Step 1 — DashboardPage.tsx (3 live)

| Line | Before | After |
| --- | --- | --- |
| 5 (import) | `Map as MapIcon, BarChart3, Siren, Users` | + `Flame, Clock, ClipboardList` |
| 529 | `연속 {stats.streakDays}일 점검 달성 🔥` | `… 달성 <Flame size={12} className="inline-block align-text-bottom ml-0.5" />` |
| 638 | `⏰ 시간 확정` | `<Clock size={11} className="inline-block align-text-bottom mr-1" />시간 확정` |
| 644 | `📋 시간 미정` | `<ClipboardList size={11} className="inline-block align-text-bottom mr-1" />시간 미정` |

### Step 2 — InspectionPage.tsx (5 live + 23 dead-code)

**Live JSX (5건):**

| Line (post-patch) | Before | After |
| --- | --- | --- |
| 28~30 (import) | (없음) | + `ClipboardList` |
| 3938 | `<span className="text-[14px]">🧯</span>` | `<FireExtinguisherCustom size={14} className="text-text-secondary shrink-0" />` |
| 4227 | `✅ 점검 완료` | `<CheckCircle2 size={14} className="inline-block align-text-bottom mr-1" />점검 완료` |
| 4449 | `📋 점검 시` (inline) | `<ClipboardList size={12} className="inline-block align-text-bottom mr-1" />점검 시` |
| 4468 | `🔧 조치 후` (inline) | `<Wrench size={12} className="inline-block align-text-bottom mr-1" />조치 후` |
| 5009 | `<span className="text-[20px]">📋</span>` | `<ClipboardList size={20} className="shrink-0" />` |

**Dead-code 정리 (23건 삭제):**

- **CATEGORY_GROUPS (line 51~67, 16건):**
  - Interface 의 `icon:string;` 필드 제거.
  - 16개 literal 모두 `icon: '<emoji>'` 라인 삭제 (🚪☁️🛡️🚗⚡⬜️📊💨⬅️🪟🪢🚰🧯🌊🔔📹).
  - 데스크톱 카드 렌더링은 line 5824 의 `CATEGORY_ICONS[idx]` (Lucide 매핑) 사용 — 무영향.
- **INSPECT_RESULT_OPTIONS (line 121~125, 3건):**
  - Type signature 의 `icon:string` 제거.
  - 3개 literal `icon: '✅' / '⚠️' / '❌'` 삭제.
  - 사용처 grep: `opt.label`, `opt.value`, `opt.color`, `opt.bg` 만 read — `opt.icon` 참조 0건 (orchestrator pre-check 확인).
- **ALL_RESULT_OPTIONS (line 127~131, 2건):**
  - Type signature 의 `icon:string` 제거.
  - 2개 literal `icon: '🔧' / '❓'` 삭제.
  - 사용처: `resultOpt.label` 만 (line 4438, 4577).
- **ZONE_CONFIG (line 138~144, 3건):**
  - Plan 의 emoji target 리스트에는 미포함이지만, orchestrator 의 verify gate `grep -c "icon:'"` → 0 요구 만족 위해 같이 삭제.
  - Interface 의 `icon:string` 필드 + 3개 literal `icon: '🔬' / '🏢' / '🚇'` 삭제.
  - 사용처: line 3870 의 `ZONE_ICONS[z.key]` (FlaskConical/Building2/TrainFront) 만 read — `z.icon` 참조 0건.

### Step 3 — ElevatorPage.tsx (4 live)

| Line (post-patch) | Before | After |
| --- | --- | --- |
| 16 (import) | `… AlertTriangle, Wrench, … CheckCircle2 …` | + `AlertCircle` |
| 721 | `{f.is_resolved ? '✅ 수리완료' : '🚨 미해결'}` (string ternary) | `{f.is_resolved ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}` + 텍스트 분리 + `display:inline-flex` |
| 856 | `⚠️ 주의관찰 항목` | `<AlertTriangle size={12} />` + 텍스트 분리 + `display:flex` |
| 2633 | `✅ {f.resolutionMemo}` | `<CheckCircle2 size={10} style={{ flexShrink:0 }} />` + `<span>{f.resolutionMemo}</span>` + flex wrapper |
| 3429 | `⚠️ 지적사항 및 조치` | `<AlertTriangle size={12} />` + 텍스트 분리 + flex wrapper |

### Step 4 — ExtinguishersListPage.tsx (1 live)

| Line (post-patch) | Before | After |
| --- | --- | --- |
| 7 (import) | (없음) | + `import { Search } from 'lucide-react'` |
| 428~448 | `<input ... placeholder="🔍 증지번호·제조번호 검색" .../>` | `<div style={{ position:'relative', flex:2, minWidth:120, display:'flex', alignItems:'center' }}><Search size={14} style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)', pointerEvents:'none'}} /><input ... placeholder="증지번호·제조번호 검색" style={{ width:'100%', padding:'0 10px 0 30px', ... }} /></div>` |

flex/minWidth/height 등 원본 스타일 보존, padding-left 만 10px → 30px 로 늘려 icon 공간 확보.

### Step 5 — ElevatorFindingDetailPage.tsx (2 live)

| Line (post-patch) | Before | After |
| --- | --- | --- |
| 6 (import) | (없음) | + `import { Wrench } from 'lucide-react'` |
| 325~326 | `🔧 수리이력에서 조치 선택` | `<Wrench size={14} />\n수리이력에서 조치 선택` + button 에 `display:inline-flex, alignItems:center, justifyContent:center, gap:6` |
| 350 | `🔧 연결됨: ` | `<Wrench size={14} />연결됨: ` + span 에 `display:inline-flex, alignItems:center, gap:4, verticalAlign:middle` |

## Verify Gate Results

| Gate | Expected | Actual | Status |
| --- | --- | --- | --- |
| 1. Emoji 잔존 (target 11종) in 5 파일 | 0 | 0 | PASS |
| 2. `grep -c "icon:'"` in InspectionPage.tsx | 0 | 0 | PASS |
| 2b. `grep -c "icon: '"` in InspectionPage.tsx | 0 | 0 | PASS |
| 3. lucide import 사용처 매칭 | 모든 신규 import 사용처 ≥ 1 | Flame/Clock/ClipboardList/FireExtinguisherCustom/Wrench/Search/AlertCircle 전부 사용처 확인 | PASS |
| 4. 데스크톱 카드 영역 byte-level sha | `a89596a1ea4317f2365189644bc310bf6755b78d` | `a89596a1ea4317f2365189644bc310bf6755b78d` (line 5824~5871, 라인 시프트 4) | PASS |
| 5. tsc --noEmit | target 파일 신규 에러 0 | 0 (exit=0) | PASS |
| 6a. `function progressColor` in DashboardPage | 1 | 1 | PASS |
| 6b. `rgba(34,197,94,0.28)` in InspectionPage | 1 | 1 | PASS |

## Desktop Card Region Guard

- Plan 의 5820-5867 라인 범위는 type signature 4 byte 삭제 (`icon:string;` × 1 + literal icon 라인 16개) 로 인해 line shift +4 발생.
- 새 라인 범위 5824-5871 의 sha = `a89596a1ea4317f2365189644bc310bf6755b78d` — pre-patch sha 와 동일.
- git diff hunk 도 desktop 영역(5824 이후) 미터치 확인.

## TSC Result

```
exit=0
$ ./node_modules/.bin/tsc --noEmit
(empty stdout — 0 errors)
```

5 파일 신규 에러 0.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Critical] ZONE_CONFIG dead-code icon 필드 (3건) 추가 삭제**

- **Found during:** Task 3 verify gate 실행 중
- **Issue:** Plan 의 emoji target regex 에 `🔬🏢🚇` 가 미포함이라 ZONE_CONFIG 의 dead-code icon 3 건이 잔존. 그러나 orchestrator 의 명시 verify gate `grep -c "icon:'"` → 0 요구 만족 불가 (3 잔존).
- **Fix:** ZONE_CONFIG type signature 의 `icon:string` 필드 + 3개 literal 삭제. ZONE_ICONS Lucide 매핑이 실제 렌더링 source of truth (line 3870 `ZONE_ICONS[z.key]`) 라 안전.
- **Files modified:** src/pages/InspectionPage.tsx (line 138~144)
- **Commit:** aa381be (Task 3 패치에 통합)

**2. [Pattern 1 dead-code override 적용]**

- **Source:** Orchestrator pre-check 가 `grep "opt\.icon"` → 0 매치 확인 후 instruct: "RESULT_OPTIONS icon 필드 Lucide 변환 X, 삭제 O".
- **Action:** INSPECT_RESULT_OPTIONS / ALL_RESULT_OPTIONS 의 `icon:string` 필드 + 5개 emoji literal 모두 삭제. 사용처 grep 으로 read 0 건 재확인 후 적용.
- **결과:** Plan 의 "iconComp 패턴 전환" 지시 대신 더 깔끔한 "필드 삭제" 패턴 적용. CATEGORY_GROUPS dead-code 16건과 동일 패턴.

### Pre-existing State (out of scope)

- 8 다른 emoji (✕ U+2715 on ElevatorFindingDetailPage line 351, ▲▼ on InspectionPage line 4999 등) 는 plan 의 target regex 외 — 미터치.

## Memory Rule §7.1 Enforce 종결

5 파일 (DashboardPage, InspectionPage, ElevatorPage, ExtinguishersListPage, ElevatorFindingDetailPage) 의 target emoji (🔥⏰📋✅⚠️❌🔧🚨🔍🧯📊) 잔존 0.
디자인 룰 §7.1 "이모지 금지, Lucide 통일" 의 5-파일 enforce 사이클 종결.
이후 새 페이지/모달 작성 시 sketch/TSX 모두 §7.1 검증 게이트 통과 필수 (메모리 룰 unchanged).

## Self-Check: PASSED

- src/pages/DashboardPage.tsx — modified, committed (aa381be)
- src/pages/InspectionPage.tsx — modified, committed (aa381be)
- src/pages/ElevatorPage.tsx — modified, committed (aa381be)
- src/pages/ExtinguishersListPage.tsx — modified, committed (aa381be)
- src/pages/ElevatorFindingDetailPage.tsx — modified, committed (aa381be)
- Task 1 sketch: f0534ef (already merged via bd2220c)
- Task 3 patch: aa381be (this dispatch)
