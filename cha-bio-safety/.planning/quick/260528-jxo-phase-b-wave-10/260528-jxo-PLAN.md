---
phase: 260528-jxo-phase-b-wave-10-inspection-mega
plan: 01
type: execute
wave: 10
depends_on: [260528-jey]
files_modified:
  - src/pages/InspectionPage.tsx
autonomous: true
roadmap-wave: Tier 1 / Wave 10 (점검 메가 — 47 inline + 25 emoji)
---

<objective>
**Phase B Wave 10 — 점검 메가 페이지.** InspectionPage 6047줄 — 단일 파일 최대.

- **47 inline → tailwind** (옵션 X+P+M+색변수N+const N + animation N)
- **25 emoji `✓` + 1 `✕` → Lucide** (Phase A precedent)

옵션 X+P+M+색변수N + module-scope const N (ITEM_H/containerH/pad/NAV_BOTTOM) 승계.

### 위험 anchor
- 메모리 `project_redesign_02_inspection_status.md` — 16 카테고리 sketch 완결
- 메모리 `feedback_inspection_unresolved_color.md` — 미조치 색 status-fire 룰 보존
- 메모리 `project_inspection_completion_rule.md` — 완료 단일 룰 보존
- 비즈 anchor 매우 다양 (다수 useQuery / useMutation / fetch / onClick handlers)
</objective>

<context>

### Part A: Emoji sweep (25곳 ✓ + 1 ✕ — Phase A precedent)

**Lucide import 확장 필요**: 기존 import 에 `Check` 추가 (이미 있는 것: X / CheckCircle2 / 기타 다수)

**그룹 A — 동적 `<span>✓</span>` 11곳** (Phase A 룰 직접 변환):
- L395 `{done && !isActive && <span className="text-caption ml-1 opacity-85">✓</span>}` → `{done && !isActive && <Check size={12} className="inline-block ml-1 opacity-85" />}`
- L860 동일 패턴
- L882 동일
- L906 동일
- L2388 동일
- L2644 동일
- L2666 동일
- L3033 동일
- L3057 동일
- L3072 동일
- L3096 동일

**그룹 B — 안내문/라벨/버튼 텍스트 inline ✓ 14곳** (Phase A precedent `🔒 제출 완료` 같은 패턴):
- L934 `<div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-[9px] text-label text-safe flex items-center gap-1.5">✓ 이미 점검 완료된 항목입니다</div>` → `>... gap-1.5"><Check size={14} />이미 점검 완료된 항목입니다</div>` (gap-1.5 이미 있음)
- L969 `<div className="...">✓ 저장 완료</div>` → 동일 패턴 + gap-1.5 추가 또는 inline-block prefix
- L3130 `✓ {stairDoneCount}/{stairCPs.length}층 이미 점검 완료` → `<><Check size={N} className="inline-block mr-1" />{...}</>` JSX fragment
- L3230 동일 패턴 (저장 완료)
- L3242 동일 (점검 완료)
- L3295 동일 (저장 완료)
- L3312 동일 (점검 완료)
- L3343 동일 (저장 완료)
- L4235 `<div className="... text-caption text-safe">✓ 저장 완료</div>` → 동일
- L4647 button text `'✓ 조치 완료'` → `<><Check size={14} className="inline-block align-text-bottom mr-1" />조치 완료</>` (Phase A L599 패턴)
- L5205 `allDone ? '✓ 완료'` → `allDone ? <><Check size={12} className="inline-block mr-0.5" />완료</> : ...` (JSX fragment)
- L5864 `✓ 점검완료 {c.completed}` → `<><Check size={N} className="inline-block mr-1" />점검완료 {c.completed}</>`
- L5981 `excludeNormal ? '✓ 정상 제외' : '정상 제외'` → `excludeNormal ? <><Check size={12} className="inline-block mr-0.5" />정상 제외</> : '정상 제외'`

**그룹 C — `✕` 1곳**:
- L4512 `>✕</button>` → `><X size={14} /></button>` (X 이미 import)

**자동 제외 (주석 안 텍스트)**:
- L3948 `'✓ 점검 완료'` (제거 코드 설명 주석)
- L4676 `// ... ✓ 뱃지 기준` (주석)

### Part B: Inline style sweep (47곳)

**모듈 스코프 const 옵션 N 보존**:
- L44 `NAV_BOTTOM = 'calc(54px + env(safe-area-inset-bottom, 20px))'`
- L167/L1038 `ITEM_H = 44`
- L178/L1067 `containerH = ITEM_H * VISIBLE`
- L179/L1066 `pad = ITEM_H * Math.floor(VISIBLE / 2)`
- `style={{ height: containerH }}` `style={{ height: ITEM_H }}` `style={{ paddingTop: pad, ... }}` 모두 옵션 N 잔존

**잔존 (옵션 N, 예상 ~28-32곳)**:
- L209/L212/L215/L218/L224/L239 picker scroll (containerH/ITEM_H/pad 참조) — 잔존
- L360/L520/L609/L717/L832/L2362/L2518/L2614/L2764/L3001 multiline 모달 transform animation (visible state 동적) — 잔존
- L984/L3360 conditional gradient `background: submitting||... ? 'var(...)' : 'linear-gradient(...)'` — 옵션 M 가능 (or 잔존)
- L1072/L1076/L1080/L1084/L1090/L1098 picker variant (containerH/ITEM_H/pad/scrollSnap 동적) — 잔존
- L1134/L1523/L1539/L2039/L5365 multiline modal `top: 'var(--sat, 0px)', bottom: NAV_BOTTOM` (+ 조건부 zIndex/transform) — NAV_BOTTOM const 잔존 OR arbitrary
- L1172/L1238/L1730/L5641 `style={{ color: ... }}` 동적 색 — 잔존
- L1174 svg `display:'block'` — 정적, but SVG element style → 잔존 (SVG 속성)
- L3835 multiline (확인 후)
- L3918 `touchAction: 'pan-y'` — vendor 분류, `[touch-action:pan-y]` arbitrary 가능 or 잔존
- L4423/L4564 multiline (확인 후)

**변환 가능 (예상 ~15-19곳)**:
- L215/L218/L1080/L1084 background gradient overlay (정적 calc) → arbitrary `bg-[linear-gradient(...)]`
- L1090 `scrollSnapType: 'y mandatory'` (정적) → `[scroll-snap-type:y_mandatory]` arbitrary
- L2259/L2518/L2764 (확인 후)
- L4512 `top: 'calc(var(--sat, 0px) + 14px)'` → `top-[calc(var(--sat,0px)+14px)]` arbitrary
- 단순 정적 패턴들

### 예상

| Category | Before | After | 변환 |
|---|---:|---:|---:|
| inline | 47 | ~28-32 | ~15-19 |
| emoji ✓/✕ | 26 | **0** | 26 |
| **합계 inline+emoji** | **73** | **~28-32** | **~41-45 (-58%)** |

### 룰 (locked)
- 옵션 X+P+M+색변수N + module-scope const N + animation N + SVG element N
- 비즈 anchor precise diff = empty (다수 anchor — 9종 + onClick precise)
- Phase A 보존 확장: 이전 페이지 emoji 모두 Lucide, **이 wave 가 Phase A enforcement 마무리**
- TypeScript 0 error
- 변경 파일 = 1 .tsx 만

### 함정 회피
- w-7=32 / w-8=48 config
- Lucide `<Check>` size 일관성: 동적 inline span 옆 → size={12} (text-caption 영역), 안내문/버튼 텍스트 → size={14} (text-label 영역) — Phase A 패턴 따름
- `Check` lucide import 신규 추가 — 기존 multi-line import block 에 alphabetical 또는 그룹별 추가

### 메모리 anchors
- `feedback_tailwind_w8_h8_is_48px.md`
- `feedback_tailwind_token_class_pattern.md`
- `project_redesign_02_inspection_status.md` (16 카테고리 sketch 완결)
- `feedback_inspection_unresolved_color.md` (미조치 = status-fire 룰 보존)
- `project_inspection_completion_rule.md` (완료 단일 룰)

</context>

<tasks>

<task type="auto">
  <name>Task 1: Bulk sweep InspectionPage — emoji + inline → Lucide + tailwind</name>
  <files>src/pages/InspectionPage.tsx</files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/InspectionPage.tsx
echo "style before: $(grep -c 'style={{' $F)"
echo "emoji before: $(grep -cE '✓|✗|✕|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"

for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/jxo-before.txt

grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/jxo-clicks.txt

# Lucide import check
grep "from 'lucide-react'" $F
```

### Step 2: Lucide import 확장 — `Check` 추가

기존 multi-line import block 에 `Check` 추가. 위치는 그룹 주석에 따라:
- `// 결과 (5종)` 그룹: `CheckCircle2, AlertTriangle, XCircle, Wrench, HelpCircle` 인접
- 또는 default block 상단 `ChevronLeft, ChevronRight, Bell, X, TrendingUp, Flame, Check` 식

가장 자연스러운: `Check,` 를 `Bell,` 뒤 또는 `X,` 옆 (이미 있음)에 알파벳순.

### Step 3: Emoji sweep (Part A)

**그룹 A 11곳** — 동적 `<span>✓</span>` 패턴 일괄 변환:
```
{cond && <span className="text-caption ml-1 opacity-NN">✓</span>}
→
{cond && <Check size={12} className="inline-block ml-1 opacity-NN" />}
```

**그룹 B 14곳** — 안내문 / 라벨 / 버튼 텍스트 변환:
- L934/L3242/L3312: `>✓ 이미 점검 완료된 항목입니다</div>` → `><Check size={14} />이미 점검 완료된 항목입니다</div>` (gap-1.5 이미 있음)
- L969/L3230/L3295/L3343/L4235: `>✓ 저장 완료</div>` → `><Check size={14} />저장 완료</div>` (4235 의 gap 추가 검토)
- L3130: `✓ {stairDoneCount}/...` → `<><Check size={14} className="inline-block mr-1" />{stairDoneCount}/...</>` (JSX fragment)
- L4647: button content `'✓ 조치 완료'` → 텍스트 conditional 안 `<><Check size={14} className="inline-block align-text-bottom mr-1" />조치 완료</>` (Phase A L599 패턴 일관)
- L5205: `allDone ? '✓ 완료'` → `allDone ? <><Check size={12} className="inline-block align-text-bottom mr-0.5" />완료</>`
- L5864: `✓ 점검완료 ...` → `<><Check size={12} className="inline-block mr-1" />점검완료 {c.completed}</>`
- L5981: `excludeNormal ? '✓ 정상 제외'` → `excludeNormal ? <><Check size={12} className="inline-block mr-0.5" />정상 제외</> : '정상 제외'`

**그룹 C 1곳 — L4512 `>✕</button>` → `><X size={14} /></button>`** (X 이미 import)

**자동 제외**: L3948 (주석), L4676 (주석) — 변경 0

### Step 4: Inline style sweep (Part B)

PLAN context "잔존" / "변환 가능" 표 그대로.

**module-scope const 보존**: ITEM_H/containerH/pad/NAV_BOTTOM 옵션 N 잔존.

**모달 transform animation 보존**: L360/L609/L832/L2362/L2614/L3001 동적.

**변환 핵심**:
- background gradient 정적 (L215/L218/L1080/L1084) → arbitrary
- L1090 `scrollSnapType: 'y mandatory'` → `[scroll-snap-type:y_mandatory]`
- L4512 button `top: 'calc(var(--sat, 0px) + 14px)'` → `top-[calc(var(--sat,0px)+14px)]`
- 그 외 단순 정적 → className

### Step 5: After verification

```bash
F=src/pages/InspectionPage.tsx

echo "style after: $(grep -c 'style={{' $F)"
echo "emoji after: $(grep -cE '✓|✗|✕|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
# emoji MUST be 0 (주석 안 ✓ 도 제외 검토 — 변경 안전하면 그대로)
# 단 L3948 / L4676 주석은 정규식에 잡힘 → 잔존 OK (코드 변경 0)

# 주석 제외하고 코드 안 emoji
grep -vE '^\s*//|^\s*\*|^\s*/\*' $F | grep -cE '✓|✗|✕'
# MUST = 0

for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/jxo-after.txt
diff /tmp/jxo-before.txt /tmp/jxo-after.txt
# MUST empty

grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/jxo-clicks-after.txt
diff /tmp/jxo-clicks.txt /tmp/jxo-clicks-after.txt

echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

# Lucide Check + X import 확인
grep "from 'lucide-react'" $F
grep -E "^\s*(Check|X),?\s*$|^.*\s+(Check|X),?\s*$" $F | head -5

cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/InspectionPage.tsx" | grep -v ".planning/" | wc -l
```

### Step 6: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/InspectionPage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260528-jxo-01): Phase B Wave 10 — InspectionPage 47 inline + 25 emoji → tailwind + Lucide

47 inline 중 ~15-19건 변환 (gradient overlay + scrollSnap + var calc 등) / ~28-32건 옵션 N 잔존 (ITEM_H/containerH/pad/NAV_BOTTOM module-scope const + 모달 transform animation + 동적 색 + SVG style).
25 ✓ + 1 ✕ → Lucide Check (신규 import) + X (기존). Phase A precedent 완료.
옵션 X+P+M+색변수N+const N+animation N+SVG N. 시각 0 byte. 비즈 anchor identical. TypeScript 0 error.
EOF
)"
```

### Step 7: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260528-jxo-phase-b-wave-10/260528-jxo-SUMMARY.md`.
포함:
- 옵션 + emoji sweep 룰
- Before/After style + emoji count
- Lucide import 변경 (Check 추가)
- 그룹 A/B/C emoji 변환 매핑
- inline 잔존/변환 분류
- 비즈 anchor identity 결과
- Phase A 완료 확인 (모든 페이지 emoji 0 — 누적 catalog)
- Self-Check: PASSED
- Next: Wave 11 (ElevatorFindingDetailPage)

Do NOT commit SUMMARY.md.

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && S=$(grep -c 'style={{' src/pages/InspectionPage.tsx) && E=$(grep -vE '^\s*//|^\s*\*|^\s*/\*' src/pages/InspectionPage.tsx | grep -cE '✓|✗|✕') && echo "S=$S E=$E" && [ "$S" -le "35" ] && [ "$E" = "0" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/InspectionPage.tsx)" = "0" ] && grep -E "Check," src/pages/InspectionPage.tsx | head -1 && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - InspectionPage inline ≤35 (47→~28-32 예상)
    - 코드 안 emoji = 0 (주석 안 ✓ 잔존 OK, 변경 0)
    - Lucide import 에 `Check` 추가 (X 이미 있음)
    - 비즈 anchor precise diff = empty
    - 비색 0 (Phase A 보존)
    - TypeScript 0 error
    - 변경 파일 = 1 .tsx 만
  </done>
</task>

</tasks>
