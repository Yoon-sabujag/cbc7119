---
phase: 260528-jey-phase-b-wave-9-floorplan
plan: 01
type: execute
wave: 9
depends_on: [260528-irl]
files_modified:
  - src/pages/FloorPlanPage.tsx
autonomous: true
roadmap-wave: Tier 1 / Wave 9 (도면 — chrome 통일 룰)
---

<objective>
**Phase B Wave 9 — 도면.** FloorPlanPage 25 inline → tailwind. chrome 통일 룰 보존.

옵션 X+P+M+색변수N + 마커 좌표 동적 N 승계.

### 위험 anchor
- 메모리 `project_inspection_chrome_unified.md`: chrome 통일 룰 적용 페이지
- 마커 positioning 동적 좌표 (px/py) — 잔존
- SVG element inline style — tailwind 안 됨, 잔존
</objective>

<context>

### FloorPlanPage 25 inline 분석

**옵션 N 잔존 (예상 ~12-14건)**

- L1030 root container `as any` + vendor prefix (WebkitUserSelect/userSelect/WebkitTouchCallout) — 잔존
- L1058 marker `left: px, top: py, transform: \`translate(...) scale(...)\`, zIndex: isDragging ? ... : ..., outline: ... ? ... : ...` — 동적 좌표 + conditional 다수 → 잔존
- L1097 marker variant (확인 후, 비슷한 패턴이면 잔존)
- L1121 SVG `<text style={{ textShadow: ... }}>` — SVG element, tailwind 안 됨 → 잔존
- L1325 balloon positioning multiline (Math.max/min 동적) → 잔존
- L1337 arrow conditional spread (`...(bp.arrowDir === 'bottom' ? {...} : {...})`) → 잔존
- L1866/L1917/L2139/L2188 `height: 72, fontFamily: 'inherit'` (혼합 — height 단독 변환 어렵, fontFamily 잔존) → 옵션 N 잔존 OR 분리 시도
- L2158/L2168 `fontFamily: 'inherit'` 단독 — Wave 5/7 precedent → 잔존

**변환 (예상 ~11-13건)**

- L262 `style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}` → `className="relative inline-block leading-none"`
- L264 marker badge multiline 정적 → `absolute -top-2 -right-2 w-3 h-3 bg-[#ef4444] border-[1.5px] border-white rounded-full flex items-center justify-center text-[9px] font-black text-white leading-none pointer-events-none` (다 정적)
- L1044 notification banner `position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '6px 12px', background: 'rgba(59,130,246,0.85)', fontSize: 11, color: '#fff', fontWeight: 600, textAlign: 'center', pointerEvents: 'none'` → `absolute top-0 left-0 right-0 z-20 px-3 py-[6px] bg-[rgba(59,130,246,0.85)] text-[11px] text-white font-semibold text-center pointer-events-none`
- L1050 동일 패턴 → 동일 변환 (red banner)
- L1078 img `width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none'` → className 합병 `w-full h-full object-contain block pointer-events-none select-none`
- L1151 placeholder text `display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t3)', fontSize: 14, fontWeight: 600` → `flex items-center justify-center h-full text-text-tertiary text-[14px] font-semibold`
  - (`var(--t3)` confirm: 만약 `--text-tertiary` alias 면 `text-text-tertiary`, 아니면 arbitrary)
- L1373 `boxShadow: '0 -8px 32px rgba(0,0,0,0.4)'` → `shadow-[0_-8px_32px_rgba(0,0,0,0.4)]`
- L1694 modal overlay `position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:16` → `fixed inset-0 z-[60] bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4`
- L1695 modal box `position:'relative', width:'90%', maxWidth:320, minHeight:180` → `relative w-[90%] max-w-[320px] min-h-[180px]`
- L1745/L1760/L2097 backdrop `background: 'rgba(0,0,0,0.6)'` → `bg-[rgba(0,0,0,0.6)]`
- L2151 `height: 72` 단독 → `h-[72px]`

### 예상

| Before | After | 변환 |
|---:|---:|---:|
| 25 | ~12-14 | ~11-13 (-52%) |

### 룰 (locked)
- 옵션 X+P+M+색변수N + 좌표 동적 N + SVG style N
- 비즈 anchor precise diff = empty
- Phase A 보존
- TypeScript 0 error
- 변경 파일 = 1 .tsx 만

### 함정 회피 (누적)
- w-7=32 / w-8=48 config override
- 28px → `[28px]` / 36px → `[36px]` / 44px → `w-11` / 48px → `h-12` 또는 `h-8`
- `[animation:...]` underscore
- `bg-[rgba(...)]` underscore 없이 또는 rgb 공백 제거

### 메모리 anchors
- `feedback_tailwind_w8_h8_is_48px.md`
- `feedback_tailwind_token_class_pattern.md`
- `project_inspection_chrome_unified.md` (chrome 통일 룰)

</context>

<tasks>

<task type="auto">
  <name>Task 1: Bulk apply FloorPlanPage inline → tailwind</name>
  <files>src/pages/FloorPlanPage.tsx</files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/FloorPlanPage.tsx
echo "before: $(grep -c 'style={{' $F)"
for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\(' 'onMarker'; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/jey-before.txt
grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/jey-clicks.txt
```

### Step 2: Edit FloorPlanPage.tsx

PLAN context 변환 매핑 그대로 적용.

핵심:
- **잔존**: L1030 vendor + L1058/L1097 marker positioning + L1121 SVG + L1325/L1337 balloon dynamic + fontFamily inherit 그룹
- **변환**: L262/L264 marker badge + L1044/L1050 banner + L1078 img + L1151 placeholder + L1373 shadow + L1694/L1695 modal + L1745/L1760/L2097 backdrop + L2151 height

L1151 의 `var(--t3)` 확인: tokens.css 에 `--t3` 가 alias 라면 그에 맞춰 tailwind class 선택. 모호하면 arbitrary `text-[var(--t3)]`.

### Step 3: After verification

```bash
F=src/pages/FloorPlanPage.tsx
echo "after: $(grep -c 'style={{' $F)"

for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\(' 'onMarker'; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/jey-after.txt
diff /tmp/jey-before.txt /tmp/jey-after.txt

grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/jey-clicks-after.txt
diff /tmp/jey-clicks.txt /tmp/jey-clicks-after.txt

echo "emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/FloorPlanPage.tsx" | grep -v ".planning/" | wc -l
```

### Step 4: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/FloorPlanPage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260528-jey-01): Phase B Wave 9 — FloorPlanPage 25 inline → tailwind

마커 좌표 동적 (L1058/L1097 px/py + transform scale + conditional zIndex/outline) + balloon positioning multiline + SVG textShadow + vendor prefix as any + fontFamily inherit 그룹 옵션 N 잔존.
정적 변환 ~11-13건: marker badge / notification banner 2종 / img full-cover / placeholder / shadow / modal overlay+box / backdrop 3종 / height 단독.
옵션 X+P+M+색변수N+좌표 N+vendor N+SVG N 승계. 시각 0 byte. chrome 통일 룰 보존.
비즈 anchor identical. TypeScript 0 error.
EOF
)"
```

### Step 5: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260528-jey-phase-b-wave-9/260528-jey-SUMMARY.md`.

Do NOT commit SUMMARY.md.

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && C=$(grep -c 'style={{' src/pages/FloorPlanPage.tsx) && echo "after=$C" && [ "$C" -le "18" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/FloorPlanPage.tsx)" = "0" ] && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - FloorPlanPage inline ≤18 (25→~12-14 예상)
    - 비즈 anchor precise diff = empty
    - emoji 0 + 비색 0
    - TypeScript 0 error
    - 변경 파일 = 1 .tsx 만
  </done>
</task>

</tasks>
