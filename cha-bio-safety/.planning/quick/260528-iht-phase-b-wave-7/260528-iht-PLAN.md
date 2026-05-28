---
phase: 260528-iht-phase-b-wave-7-staffservice
plan: 01
type: execute
wave: 7
depends_on: [260528-hbv]
files_modified:
  - src/pages/StaffServicePage.tsx
autonomous: true
roadmap-wave: Tier 1 / Wave 7 (직원 서비스 — redesign/12 완결)
---

<objective>
**Phase B Wave 7 — 직원 서비스.** StaffServicePage 34 inline → tailwind. redesign/12 완결.

옵션 X+P+M+색변수N 승계. 시각 0 byte.

### 위험 anchor 없음 (redesign/12 완결, 캘리브 없음)
- 단 식대 캘린더 동적 색 다수 (옵션 N 잔존 예상)
- vendor prefix (WebkitOverflowScrolling / WebkitAppearance / WebkitTapHighlightColor) — tailwind 표현 어려움 → 옵션 N
</objective>

<context>

### StaffServicePage 34 inline 분석

**정적 변환 가능 (~15-18건)**
- L721 spinner `borderTopColor: var(--accent), animation: 'spin .7s linear infinite'` (className 합병) → `border-t-accent [animation:spin_.7s_linear_infinite]`
- L762 `background: 'rgba(0,0,0,0.25)'` → `bg-[rgba(0,0,0,0.25)]`
- L767 multiline `background: 'var(--accent)', letterSpacing: '-.02em', boxShadow: '0 1px 3px rgba(0,0,0,0.35)'` → `bg-accent tracking-[-0.02em] shadow-[0_1px_3px_rgba(0,0,0,0.35)]`
- L792 `color: 'rgba(255,255,255,0.85)'` → `text-[rgba(255,255,255,0.85)]`
- L793 `color: '#fca5a5'` → `text-[#fca5a5]`
- L798 `color: '#fbbf24'` → `text-[#fbbf24]`
- L845 `background: 'linear-gradient(135deg, #42d778 50%, var(--duty-day) 50%)'` → `bg-[linear-gradient(135deg,#42d778_50%,var(--duty-day)_50%)]`
- L872 `letterSpacing: '-0.01em'` → `tracking-[-0.01em]`
- L906/L916/L929/L1479 식대 카드 `background: 'rgba(R,G,B,0.08)', borderColor: 'rgba(R,G,B,0.2)'` → arbitrary rgba (정적)
- L908/L918/L931/L1026/L1313/L1481 색 hex → arbitrary `text-[#hex]`
- L1161 `boxShadow: '0 2px 8px rgba(0,0,0,0.1)'` → `shadow-[0_2px_8px_rgba(0,0,0,0.1)]`
- L1228 `background: 'rgba(0,0,0,0.45)', animation: 'fadeIn .2s ease'` → arbitrary
- L1236 `boxShadow: '0 -4px 24px rgba(0,0,0,0.2)', animation: 'slideUp .25s ease'` → arbitrary
- L1290 `gridTemplateColumns: '1fr auto 1fr auto'` → `[grid-template-columns:1fr_auto_1fr_auto]`

**옵션 M conditional (1건)**
- L779 `color: isFullLeave ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)'` → 옵션 M template literal: `${isFullLeave ? 'text-[rgba(255,255,255,0.9)]' : 'text-[rgba(255,255,255,0.75)]'}` (className 추가)

**옵션 N 잔존 (예상 ~13-16건)**
- L754 multiline (cellBg + isSel/isToday conditional border + boxShadow conditional + WebkitTapHighlightColor) — 동적 변수 다수 + vendor prefix → 잔존
- L785 `color: dateColor` — 동적 → 잔존
- L838 `background: l.bg` — 동적 (props/loop) → 잔존
- L853 `WebkitOverflowScrolling: 'touch'` — vendor prefix → 잔존 또는 `[-webkit-overflow-scrolling:touch]` arbitrary (tailwind JIT 지원하면 변환 가능)
- L869 `boxShadow: \`inset 3px 0 0 ${c.barColor}\`` — template literal 동적 → 잔존
- L1000/L1250 `background: SHIFT_COLOR[selCell.rawShift]` — 동적 → 잔존
- L1172 multiline (`${p.x}%` `${p.y}%` 좌표 동적 + fontFamily Noto Sans + spread) — 동적 + spread → 잔존
- L1194 multiline (`${cp.x}%` `${cp.y}%` 동적) → 잔존
- L1298/L1309 `WebkitAppearance/MozAppearance as any` — vendor prefix + 캐스팅 → 잔존

### 예상

| Before | After | 변환 |
|---:|---:|---:|
| 34 | ~13-16 | ~18-21 (-55%) |

(잔존 비율 높은 이유: 식대/캘린더 동적 색 + 좌표 + vendor prefix 다수)

### 룰 (locked)
- 옵션 X+P+M+색변수N + vendor prefix N
- 비즈 anchor precise diff = empty
- Phase A 보존
- TypeScript 0 error
- 변경 파일 = 1 .tsx 만

### 함정 회피
- w-7=32 / w-8=48 config override
- `[animation:...]` underscore = 공백
- linear-gradient arbitrary 시 underscore 사용

### 메모리 anchors
- `feedback_tailwind_w8_h8_is_48px.md`
- `feedback_tailwind_token_class_pattern.md`

</context>

<tasks>

<task type="auto">
  <name>Task 1: Bulk apply StaffServicePage inline → tailwind</name>
  <files>src/pages/StaffServicePage.tsx</files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/StaffServicePage.tsx
echo "before: $(grep -c 'style={{' $F)"
for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/iht-before.txt
grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/iht-clicks.txt
```

### Step 2: Edit StaffServicePage.tsx

PLAN context 그대로 적용.

핵심 잔존 (옵션 N):
- L754 multiline (cellBg + 동적 border + vendor prefix) — 잔존
- L869 boxShadow template literal (barColor 동적) — 잔존
- L1172/L1194 좌표 동적 + fontFamily — 잔존
- L1298/L1309 vendor prefix `as any` — 잔존

핵심 변환:
- L767 multiline 정적 → 변환
- L779 isFullLeave conditional → 옵션 M
- 색 hex 모두 `text-[#hex]` arbitrary
- 식대 카드 rgba 정적 → arbitrary
- L1228/L1236 animation + boxShadow → arbitrary
- L1290 grid-template-columns → arbitrary

### Step 3: Verification

```bash
F=src/pages/StaffServicePage.tsx
echo "after: $(grep -c 'style={{' $F)"

for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/iht-after.txt
diff /tmp/iht-before.txt /tmp/iht-after.txt

grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/iht-clicks-after.txt
diff /tmp/iht-clicks.txt /tmp/iht-clicks-after.txt

echo "emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/StaffServicePage.tsx" | grep -v ".planning/" | wc -l
```

### Step 4: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/StaffServicePage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260528-iht-01): Phase B Wave 7 — StaffServicePage 34 inline → tailwind

식대 캘린더 동적 색변수 (cellBg/dateColor/l.bg/barColor/SHIFT_COLOR) + 좌표 (p.x/y/cp.x/y) + vendor prefix (WebkitOverflowScrolling/WebkitTapHighlightColor/WebkitAppearance) 옵션 N 잔존.
정적 색 hex 다수 + linear-gradient + grid-template-columns + shadow + animation 모두 arbitrary 변환.
L779 isFullLeave conditional 옵션 M. 옵션 X+P+M+색변수N+vendor N 승계. 시각 0 byte.
비즈 anchor identical. TypeScript 0 error.
EOF
)"
```

### Step 5: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260528-iht-phase-b-wave-7/260528-iht-SUMMARY.md`.

Do NOT commit SUMMARY.md.

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && C=$(grep -c 'style={{' src/pages/StaffServicePage.tsx) && echo "after=$C" && [ "$C" -le "20" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/StaffServicePage.tsx)" = "0" ] && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - StaffServicePage inline ≤20 (34→~13-16 예상)
    - 비즈 anchor precise diff = empty
    - emoji 0 + 비색 0
    - TypeScript 0 error
    - 변경 파일 = 1 .tsx 만
  </done>
</task>

</tasks>
