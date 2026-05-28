---
phase: 260528-cjn-phase-b-wave-3-workshift-annual
plan: 01
type: execute
wave: 3
depends_on: [260528-c9s]
files_modified:
  - src/pages/WorkShiftPage.tsx
  - src/pages/AnnualPlanPage.tsx
autonomous: true
requirements:
  - QUICK-260528-cjn-PHASE-B-WAVE-3
roadmap-wave: Tier 1 / Wave 3 (근무/연간 — 양쪽 캘리브 위험)
---

<objective>
**Phase B Wave 3 — 근무표/연간 계획.** 마스터 로드맵 v2 Tier 1 세 번째 wave.

- WorkShiftPage (254줄, 24 inline) — 캘리브 룰 + HDR_H/ROW_H/SHIFT_COLOR 동적 변수
- AnnualPlanPage (210줄, 21 inline) — **캘리브 좌표 시그니처 5건 1 byte 변경 0 precedent**

**옵션 X+P+M+색변수N 승계.** 시각 0 byte.

### 위험 anchor
- **WorkShiftPage**: 메모리 `project_redesign_16_workshift_status.md` — 표 sticky scroll + SHIFT_COLOR 인라인 + holidays fetch 보존
- **AnnualPlanPage**: 메모리 `project_redesign_17_annual_plan_status.md` — 캘리브 좌표 시그니처 5건 1 byte 변경 0 precedent + executor cherry-pick 사고 3회 패턴 (L79 yearPos 안전)
</objective>

<context>

### WorkShiftPage 24 inline 변환 매핑

**P2 root + header (변환)**
- L86 `style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}` → `h-full flex flex-col overflow-hidden`
- L91 multiline header style — 라인 91-95 확인 후 변환 (P1 + flex)
- L102 `cursor:'pointer'` → `cursor-pointer`
- L107 `flex:1` → `flex-1`
- L112 `height:34, padding:'0 14px'` → `h-[34px] px-[14px]`
- L121 `flexShrink:0, gap:8, padding:'10px 12px'` → `shrink-0 gap-2 px-3 py-[10px]`
- L127 `padding:'7px 10px', outline:'none'` → `px-2.5 py-[7px] outline-none`
- L135 동일

**P6 isDesktop conditional (옵션 M)**
- L142 multiline `flex:1, overflow:'auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent: 'flex-start', paddingTop: isDesktop ? '12vh' : 0`
  → `className={\`flex-1 overflow-auto flex flex-col items-center justify-start ${isDesktop ? 'pt-[12vh]' : 'pt-0'}\`}`
- L149 `display:'inline-flex', flexDirection:'column', padding: isDesktop ? '0 32px' : '16px 24px'`
  → `className={\`inline-flex flex-col ${isDesktop ? 'px-[32px]' : 'px-6 py-4'}\`}` (w-8/p-8=48 함정 회피, isDesktop 32 → arbitrary)

**P3/P5 table cells**
- L150 `display:'flex'` → `flex`
- L152 `flexShrink:0` → `shrink-0`
- L153 `borderCollapse:'collapse'` → `border-collapse`
- L158 `height:HDR_H, width:82, padding:'0 10px', whiteSpace:'nowrap'` — **HDR_H 는 상수 (L11 = 52)**. 옵션:
  - A) HDR_H 변수 잔존 (옵션 N): style={{ height: HDR_H }} 유지 + className `w-[82px] px-2.5 whitespace-nowrap`
  - B) HDR_H 값 전개 (옵션 X 풀 적용): className `h-[52px] w-[82px] px-2.5 whitespace-nowrap`
  - **권장: A** — 상수 변수는 자기 자신 인터페이스, 유지보수성. (메모리 anchor `project_redesign_16_workshift_status.md` 표 sticky 보존)
- L169 `height:ROW_H, padding:'0 10px', whiteSpace:'nowrap'` — 동일 (A 권장)
- L172 `marginTop:2` → `mt-[2px]`
- L181 `flex:1, overflowX:'auto'` → `flex-1 overflow-x-auto`
- L182 `borderCollapse:'collapse'` → `border-collapse`

**P6 동적 multiline (옵션 N 잔존)**
- L195 th `height: HDR_H, minWidth: 40, padding: '4px 2px', textAlign:'center', ...(tdy ? { background: 'rgba(59,130,246,0.15)' } : {})` 
  → 정적 부분 className `min-w-10 px-[2px] py-1 text-center` + HDR_H 잔존 (옵션 A) + 동적 background spread **옵션 N 잔존** (`style={{ height: HDR_H, ...(tdy ? { background: 'rgba(59,130,246,0.15)' } : {}) }}`)
  - **단순화 가능**: tdy 가 boolean 이므로 conditional className: `${tdy ? 'bg-[rgba(59,130,246,0.15)]' : ''}` (옵션 M)
  - 단 spread pattern 보존이 유지보수 좋을 수도. 사용자 결정: **옵션 M 우선** (M+색변수N 룰에 맞춤)
- L202 `marginTop:2` → `mt-[2px]`
- L218 td multiline `height: ROW_H, minWidth: 40, padding: '0 2px', textAlign:'center', color: SHIFT_COLOR[sh], background: SHIFT_COLOR[sh]+'22'` 
  → 정적 `min-w-10 px-[2px] text-center` + ROW_H 잔존 + **SHIFT_COLOR 동적 옵션 N 잔존** (배열 변수)
  - 결과: `style={{ height: ROW_H, color: SHIFT_COLOR[sh], background: SHIFT_COLOR[sh]+'22' }}`

**P2 footer**
- L236 `gap:14, padding:'10px 0 28px'` → `gap-[14px] pt-[10px] pb-7` (pb-7 default = 28px)
- L238 `gap:5` → `gap-[5px]` (gap-5 config = 20px, 5px arbitrary)
- L241 `background:SHIFT_COLOR[sh]+'22', borderColor:SHIFT_COLOR[sh], color:SHIFT_COLOR[sh]` — 전체 동적 SHIFT_COLOR **옵션 N 잔존**

### WorkShiftPage 예상: 24 → 잔존 ~5 (HDR_H L158/L169/L195 + ROW_H L218 + SHIFT_COLOR L241)
- L195/L218 의 conditional background 를 className conditional 로 변환하면 style 잔존하지만 `height: HDR_H` 라 잔존

### AnnualPlanPage 21 inline 변환 매핑

**P3 정적 wrapper**
- L63 `position:'relative', width:'100%', height:'100%'` → `relative w-full h-full`
- L71 multiline img — 정적 `w-full h-full object-contain bg-white` + 동적 `cursor: calibMode ? 'crosshair' : 'default'` → 옵션 M conditional `${calibMode ? 'cursor-crosshair' : 'cursor-default'}`
- **L79 yearPos multiline (캘리브 좌표 — OQ #5 LOCKED 주석)** — top/left 동적 백분율, fontFamily inline, 캘리브 좌표 시그니처 = **옵션 N 잔존 전체** (변경 0)
- L94 calibMode 안내 multiline — 정적 부분 변환 가능 `absolute top-2 left-1/2 -translate-x-1/2 bg-[rgba(59,130,246,0.9)] px-4 py-[6px] whitespace-nowrap pointer-events-none`

**P2/P3 wrapper continuation**
- L111 `width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden'` → `w-full h-full flex flex-col overflow-hidden`
- L115 `flexShrink:0, padding:'14px 28px', gap:12` → `shrink-0 px-[28px] py-[14px] gap-3` (px-7=32 config 함정 회피 → arbitrary `px-[28px]`)
- L117 `flex:1` → `flex-1`
- L123 `padding:'8px 14px', cursor:'pointer'` → `px-[14px] py-2 cursor-pointer`
- L131 `padding:'8px 20px', gap:8, border:'none', flexShrink:0` → `px-5 py-2 gap-2 border-0 shrink-0`
- L141 multiline `flex:1, minHeight:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:24` → `flex-1 min-h-0 overflow-hidden flex items-center justify-center p-6`
- L147 multiline `width:'100%', height:'100%', maxWidth:'calc((100vh - 140px) * 1.414)', maxHeight:'100%'` → `w-full h-full max-w-[calc((100vh-140px)*1.414)] max-h-full`

**P2/P3 mobile wrapper**
- L163 `width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden'` → `w-full h-full flex flex-col overflow-hidden`
- L167 `flexShrink:0, padding:'8px 12px 9px', gap:8` → `shrink-0 pt-2 px-3 pb-[9px] gap-2`
- L172 `flexShrink:0, cursor:'pointer'` → `shrink-0 cursor-pointer`
- L176 `flex:1` → `flex-1`
- L180 `padding:'6px 10px', cursor:'pointer'` → `px-2.5 py-[6px] cursor-pointer`
- L186 `flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:16` → `flex-1 overflow-auto p-4 flex flex-col gap-4`
- L188 `width:'100%'` → `w-full`
- L193 `textAlign:'center'` → `text-center`
- L194 `marginBottom:12` → `mb-3`
- L201 `width:'100%', padding:'14px', gap:8, border:'none'` → `w-full p-[14px] gap-2 border-0`

### AnnualPlanPage 예상: 21 → 잔존 1 (L79 yearPos 캘리브 좌표 LOCKED)

### 합계 예상

| 파일 | Before | After | 변환 | 잔존 |
|---|---:|---:|---:|---|
| WorkShiftPage | 24 | ~5 | ~19 | HDR_H/ROW_H/SHIFT_COLOR 동적 변수 |
| AnnualPlanPage | 21 | 1 | 20 | yearPos 캘리브 좌표 LOCKED |
| **합계** | **45** | **~6** | **~39 (-87%)** |

### 룰 (locked)
- 옵션 X (정확값 arbitrary) — 캘리브 보존
- 옵션 P (leading 명시)
- 옵션 M (className conditional + 색변수 N)
- HDR_H/ROW_H 등 상수 변수도 동적으로 취급 → 옵션 N 잔존 (유지보수성 + 정확성)
- 비즈 anchor precise diff = empty
- Phase A 보존
- TypeScript 0 error
- 변경 파일 = 2 .tsx 만

### 메모리 anchors
- `feedback_tailwind_w8_h8_is_48px.md` (w-7=32, w-8=48 — Wave 2 동일 함정 회피)
- `feedback_tailwind_token_class_pattern.md`
- `project_redesign_16_workshift_status.md` (캘리브 + holidays fetch)
- `project_redesign_17_annual_plan_status.md` (캘리브 좌표 1 byte 0)

</context>

<tasks>

<task type="auto">
  <name>Task 1: Bulk apply WorkShift + Annual inline → tailwind</name>
  <files>
    src/pages/WorkShiftPage.tsx
    src/pages/AnnualPlanPage.tsx
  </files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
for F in src/pages/WorkShiftPage.tsx src/pages/AnnualPlanPage.tsx; do
  echo "$F before: $(grep -c 'style={{' $F)"
done

for F in src/pages/WorkShiftPage.tsx src/pages/AnnualPlanPage.tsx; do
  echo "=== $F ==="
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
  done
done > /tmp/cjn-before.txt

for F in src/pages/WorkShiftPage.tsx src/pages/AnnualPlanPage.tsx; do
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/cjn-clicks-$(basename $F .tsx).txt
done
```

### Step 2: Edit WorkShiftPage.tsx

PLAN context 의 "WorkShiftPage 24 inline 변환 매핑" 표 그대로 적용.

핵심 룰:
- **HDR_H / ROW_H 변수는 잔존** (옵션 N — 상수 변수 참조). L158/L169/L195/L218 의 `height: HDR_H` 또는 `height: ROW_H` 는 그대로
- **SHIFT_COLOR 배열 변수도 잔존** (옵션 N). L218/L241 의 SHIFT_COLOR[sh] 동적
- **L195 tdy spread** (`...(tdy ? { background: ... } : {})`) → conditional className `${tdy ? 'bg-[rgba(59,130,246,0.15)]' : ''}` (옵션 M)
- **L218 td** — SHIFT_COLOR 동적이 같이 들어가 있어, 정적 부분만 className 추출 + 나머지 style 잔존
- **px-7=32 (w-7=32 함정) 회피** — 28px / 32px 등은 옵션 X 따라 `px-[28px]` `px-[32px]` arbitrary

### Step 3: Edit AnnualPlanPage.tsx

PLAN context 의 "AnnualPlanPage 21 inline 변환 매핑" 표 그대로 적용.

**L79 yearPos 캘리브 좌표 — 절대 변경 0** (메모리 룰 + OQ #5 LOCKED 주석). 옵션 N 잔존.

다른 모든 inline 은 변환.

특히:
- L71 img cursor 동적 conditional className 으로
- L94 calibMode 안내 박스 — 정적 변환 가능 (rgba arbitrary)
- L115 `px-[28px]` arbitrary (px-7=32 함정 회피)
- L147 maxWidth calc → `max-w-[calc((100vh-140px)*1.414)]`

### Step 4: After verification

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety

# 1. style count
for F in src/pages/WorkShiftPage.tsx src/pages/AnnualPlanPage.tsx; do
  echo "$F after: $(grep -c 'style={{' $F)"
done

# 2. 비즈 anchor identity
for F in src/pages/WorkShiftPage.tsx src/pages/AnnualPlanPage.tsx; do
  echo "=== $F ==="
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
  done
done > /tmp/cjn-after.txt
diff /tmp/cjn-before.txt /tmp/cjn-after.txt
# MUST be empty

# 3. onClick precise
for F in src/pages/WorkShiftPage.tsx src/pages/AnnualPlanPage.tsx; do
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/cjn-clicks-$(basename $F .tsx)-after.txt
  diff /tmp/cjn-clicks-$(basename $F .tsx).txt /tmp/cjn-clicks-$(basename $F .tsx)-after.txt
done

# 4. emoji + 비색
for F in src/pages/WorkShiftPage.tsx src/pages/AnnualPlanPage.tsx; do
  echo "$F emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
  echo "$F 비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"
done
# 모두 0

# 5. TypeScript
./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

# 6. file scope
cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/\(WorkShift\|AnnualPlan\)Page.tsx" | grep -v ".planning/" | wc -l

# 7. 캘리브 anchor (AnnualPlan L79 yearPos)
grep -c "yearPos.y\|yearPos.x" src/pages/AnnualPlanPage.tsx
# 변경 전후 동일 (yearPos.y 1건 + yearPos.x 1건 = 2건)
```

### Step 5: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/WorkShiftPage.tsx cha-bio-safety/src/pages/AnnualPlanPage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260528-cjn-01): Phase B Wave 3 — WorkShift 24 + Annual 21 inline → tailwind

WorkShiftPage 24→N (HDR_H/ROW_H/SHIFT_COLOR 상수+동적 변수 옵션 N 잔존, isDesktop conditional 옵션 M).
AnnualPlanPage 21→1 (L79 yearPos 캘리브 좌표 LOCKED 보존).
옵션 X+P+M+색변수N 승계. 시각 0 byte. 캘리브 anchor 5건 + holidays fetch 보존.
비즈 anchor identical. TypeScript 0 error. w-7=32/w-8=48 override 함정 회피 (px-[28px] arbitrary).
EOF
)"
```

### Step 6: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260528-cjn-phase-b-wave-3/260528-cjn-SUMMARY.md`.
Reference `.../260528-c9s-phase-b-wave-2/260528-c9s-SUMMARY.md` 포맷.

Include:
- 옵션 X+P+M+색변수N 명시
- Before/After grep count
- 변환 매핑 (per line)
- 잔존 inline 목록 (옵션 N 케이스 — HDR_H/ROW_H/SHIFT_COLOR/yearPos)
- 비즈 anchor identity 결과
- 캘리브 anchor 보존 확인 (L79 yearPos byte 변경 0)
- Phase A 보존
- Self-Check: PASSED
- Next: Wave 4 (Dashboard + DailyReport + WorkLog)

Do NOT commit SUMMARY.md — orchestrator handles.

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && WS=$(grep -c 'style={{' src/pages/WorkShiftPage.tsx) && AP=$(grep -c 'style={{' src/pages/AnnualPlanPage.tsx) && echo "WS=$WS AP=$AP" && [ "$WS" -le "8" ] && [ "$AP" -le "2" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/WorkShiftPage.tsx src/pages/AnnualPlanPage.tsx | awk -F: '{s+=$2} END{print s}')" = "0" ] && [ "$(grep -c 'yearPos\.' src/pages/AnnualPlanPage.tsx)" -ge "2" ] && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - WorkShiftPage inline style ≤8 (24→~5 예상, HDR_H/ROW_H/SHIFT_COLOR 잔존)
    - AnnualPlanPage inline style ≤2 (21→1 예상, yearPos 잔존)
    - 비즈 anchor precise diff = empty
    - emoji 0 + 비색 0 (Phase A 보존)
    - yearPos.y / yearPos.x 변경 0 (캘리브 anchor 룰)
    - TypeScript 0 error
    - 변경 파일 = 2 .tsx 만
  </done>
</task>

</tasks>

<commits>
- Pre-dispatch: `docs(260528-cjn): pre-dispatch plan for Phase B Wave 3`
- Task 1: `feat(260528-cjn-01): Phase B Wave 3 — WorkShift + Annual ...`
- Docs: `docs(quick-260528-cjn): Wave 3 완료 — SUMMARY + STATE`
</commits>
