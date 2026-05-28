---
phase: 260528-hbv-phase-b-wave-6-schedule-education
plan: 01
type: execute
wave: 6
depends_on: [260528-h3z]
files_modified:
  - src/pages/SchedulePage.tsx
  - src/pages/EducationPage.tsx
autonomous: true
roadmap-wave: Tier 1 / Wave 6 (일정/교육 — 단일 wave 최대치 137)
---

<objective>
**Phase B Wave 6 — 일정/교육.** Tier 1 가장 큰 wave.

- SchedulePage (1240줄, 83 inline) — `inp`/`lbl` shared style objects + isDesktop conditional 모달
- EducationPage (586줄, 54 inline) — 표준 패턴

**옵션 X+P+M+색변수N 승계.** 시각 0 byte.

### 위험 anchor 없음 (양쪽 redesign 완결, 캘리브 없음)
</objective>

<context>

### SchedulePage 83 inline 분석 (구조 변환)

**옵션 N 잔존 (예상 17건)**
- L1232-1235 `const lbl: React.CSSProperties` 정의 자체 — 보존
- L1236-1239 `const inp: React.CSSProperties` 정의 자체 — 보존
- 12건 `style={{ ...inp, ... }}` spread (옵션 N — shared style 참조 + 동적 분기)
  - L1196 `style={{ ...inp, ...(titleError ? { borderColor: ... } : {}) }}` — 잔존
  - L1205/L1210 `style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}` — 잔존 (spread + 동적)
  - L1216 `style={{ ...inp, resize:'none', lineHeight:1.6 }}` — 잔존
  - 그 외 spread 패턴 모두 — 잔존
- 5건 `cat?.color` / `catInfo(...)?.color` 동적 색 — 잔존
  - L336 `background: catInfo(cat)?.color ?? 'var(--text-tertiary)'`
  - L387 `color: cat?.color, background: \`${cat?.color}22\`` (template literal 동적)
  - L1184 `background: cat?.color`
  - 그 외

**옵션 M conditional className 변환 (모달 4-6건)**
- L920-924 outer modal wrapper `background:'rgba(0,0,0,0.55)', justifyContent: isDesktop ? 'center' : 'flex-end', alignItems: isDesktop ? 'center' : undefined`
  → 정적 `bg-[rgba(0,0,0,0.55)]` + 옵션 M `${isDesktop ? 'justify-center items-center' : 'justify-end'}`
- L926-933 inner modal `borderRadius: isDesktop ? 16 : '20px 20px 0 0', padding: isDesktop ? '24px 28px 28px' : '20px 16px 40px', maxHeight:'90dvh', ...(isDesktop ? { width: 480, maxWidth: '90vw' } : {})`
  → 옵션 M template literal: `max-h-[90dvh] ${isDesktop ? 'rounded-lg pt-6 px-7 pb-7 w-[480px] max-w-[90vw]' : 'rounded-t-[20px] pt-5 px-4 pb-10'}`
  - **주의**: rounded-lg = 16px (config), 24px = px-6 (config), 28px = px-7 (config = 32 함정 → arbitrary `px-[28px]`), 40px = pb-10 default, 20px = pb-5, 16px = px-4
- L1156-1164 동일 패턴 다른 모달 — 동일 변환

**P1/P2/P3/P5 정적 변환 (~55-60건)**
- 표준 padding/flex/sizing 패턴 다수
- `padding: '2px 8px'`, `padding: '4px 10px'`, `lineHeight: 1.4`, `gap: N`, `marginBottom: N` 등
- 모두 P1/P2/P3 매핑

### Schedule 예상: 83 → ~17-20 잔존 (-76%)

### EducationPage 54 inline 분석

표준 패턴 다수, redesign 완결.

**변환 가능 (예상 ~50건)**
- L63 `padding: '2px 8px', flexShrink: 0` → `px-2 py-0.5 shrink-0`
- L92-101 multiline header style
- L101 `display: 'flex', alignItems: 'flex-start', gap: 12` → `flex items-start gap-3`
- L118 `flex: 1, minWidth: 0` → `flex-1 min-w-0`
- L119 `lineHeight: 1.3` → `leading-[1.3]`
- L122/L256 `marginTop: 2` → `mt-[2px]`
- L134 `marginTop: 10, paddingLeft: 44` → `mt-[10px] pl-11` (pl-11 default = 44)
- L146 `display: 'flex', alignItems: 'center', gap: 6` → `flex items-center gap-1.5`
- L238/L240 flex/gap → P2 변환
- L254 `flex: 1` → `flex-1`
- L506 `flex: 1, display: 'flex', flexDirection: 'column', height: '100%'` → `flex-1 flex flex-col h-full`
- L507 `flex: 1, overflowY: 'auto', padding: '24px'` → `flex-1 overflow-y-auto p-6`
- L513 `flex: 1, overflowY: 'auto', padding: '24px 32px'` → `flex-1 overflow-y-auto px-[32px] py-6` (32px config 함정 → arbitrary)
- L522 `display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'` → `flex items-center justify-center h-full`
- L533 root → `flex flex-col h-full`
- L538 `height: 48, display: 'flex', alignItems: 'center', flexShrink: 0` → `h-12 flex items-center shrink-0` (h-12 default = 48; 또는 h-8=48 config — 둘 다 OK, **default `h-12` 권장 — 직관적**)
- L556 `flex: 1, textAlign: 'center'` → `flex-1 text-center`
- L559 `width: 44` → `w-11` (default = 44)
- L563 `flex: 1, overflowY: 'auto', padding: 16` → `flex-1 overflow-y-auto p-4`

**옵션 N 잔존 (예상 ~3-5건)** — 동적 색 변수 / props 기반 case
- L105/L243 staff avatar 추정 동적 색 (확인 후 결정)
- L92 multiline (확인 후)
- L543 multiline button (확인 후)

### Education 예상: 54 → ~3-5 잔존 (-91%)

### 합계 예상

| 파일 | Before | After | 변환 |
|---|---:|---:|---:|
| Schedule | 83 | ~17-20 | ~63-66 |
| Education | 54 | ~3-5 | ~49-51 |
| **합계** | **137** | **~20-25** | **~112-117 (-82%)** |

### 룰 (locked)
- 옵션 X+P+M+색변수N 승계
- 비즈 anchor precise diff = empty
- Phase A 보존
- TypeScript 0 error
- 변경 파일 = 2 .tsx 만

### 핵심 함정 회피
- **w-7=32 / p-7=32 / w-8=48 / p-8=48 config override** (메모리 anchor)
- 28px → `[28px]` arbitrary
- 32px → `-7` (config) 또는 arbitrary
- 36px → `[36px]` arbitrary (default 36 없음)
- 44px → `w-11` (default)
- 48px → `h-12` (default) 또는 `-8` (config)
- 56px → `h-14` (default)
- 64px → `h-16` (default)

### `inp` / `lbl` shared style 보존
- L1232-1239 정의 자체 보존 (옵션 N 잔존 — 동적 변수 취급)
- `style={inp}` / `style={lbl}` 직접 참조 보존 (이미 inline 아님)
- `style={{ ...inp, ... }}` spread 보존 (옵션 N — shared 참조)

### 메모리 anchors
- `feedback_tailwind_w8_h8_is_48px.md`
- `feedback_tailwind_token_class_pattern.md`

</context>

<tasks>

<task type="auto">
  <name>Task 1: Bulk apply Schedule + Education inline → tailwind</name>
  <files>
    src/pages/SchedulePage.tsx
    src/pages/EducationPage.tsx
  </files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
for F in src/pages/SchedulePage.tsx src/pages/EducationPage.tsx; do
  echo "$F before: $(grep -c 'style={{' $F)"
done

for F in src/pages/SchedulePage.tsx src/pages/EducationPage.tsx; do
  echo "=== $F ==="
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
  done
done > /tmp/hbv-before.txt

for F in src/pages/SchedulePage.tsx src/pages/EducationPage.tsx; do
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/hbv-clicks-$(basename $F .tsx).txt
done
```

### Step 2: Edit SchedulePage.tsx

**보존 룰:**
- L1232-1239 `const lbl` / `const inp` 정의 — 변경 0
- `style={inp}` / `style={lbl}` 직접 참조 — 그대로 (이미 inline 아님)
- `style={{ ...inp, ... }}` spread 패턴 — 옵션 N 잔존 (shared 참조)
- `cat?.color` / `catInfo(...)?.color` 동적 색 — 옵션 N 잔존

**변환 핵심:**
- 모달 isDesktop conditional → 옵션 M template literal className
- L920-933 outer/inner modal wrapper
- L1156-1164 다른 모달 동일 패턴
- 나머지 P1/P2/P3/P5 정적 inline 다수

### Step 3: Edit EducationPage.tsx

표준 패턴 변환 — context "변환 가능" 표 그대로.
- L538 height:48 → `h-12` (default) **NOT h-8** (config override = 48 도 동일하지만 default 권장 직관적)
- L513 `px-[32px]` arbitrary (px-7=32 함정 회피)
- L134 pl-11 = 44 default
- L559 w-11 = 44 default

### Step 4: After verification

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety

for F in src/pages/SchedulePage.tsx src/pages/EducationPage.tsx; do
  echo "$F after: $(grep -c 'style={{' $F)"
done

for F in src/pages/SchedulePage.tsx src/pages/EducationPage.tsx; do
  echo "=== $F ==="
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
  done
done > /tmp/hbv-after.txt
diff /tmp/hbv-before.txt /tmp/hbv-after.txt

for F in src/pages/SchedulePage.tsx src/pages/EducationPage.tsx; do
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/hbv-clicks-$(basename $F .tsx)-after.txt
  diff /tmp/hbv-clicks-$(basename $F .tsx).txt /tmp/hbv-clicks-$(basename $F .tsx)-after.txt
done

for F in src/pages/SchedulePage.tsx src/pages/EducationPage.tsx; do
  echo "$F emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
  echo "$F 비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"
done

./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/\(SchedulePage\|EducationPage\).tsx" | grep -v ".planning/" | wc -l

# inp/lbl 정의 보존
grep -n "^const lbl\|^const inp" src/pages/SchedulePage.tsx
# L1232/L1236 (또는 변경 후 동일 줄번호) 존재
```

### Step 5: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/SchedulePage.tsx cha-bio-safety/src/pages/EducationPage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260528-hbv-01): Phase B Wave 6 — Schedule 83 + Education 54 → tailwind

Schedule 83→N (inp/lbl shared style spread 12건 + cat?.color 동적 5건 옵션 N 잔존, isDesktop modal 2종 옵션 M conditional, 나머지 ~60건 변환).
Education 54→N (표준 패턴 ~50건 변환, h-12 default/px-[32px] arbitrary 함정 회피).
옵션 X+P+M+색변수N 승계. 시각 0 byte. 비즈 anchor identical. TypeScript 0 error. inp/lbl 정의 보존.
EOF
)"
```

### Step 6: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260528-hbv-phase-b-wave-6/260528-hbv-SUMMARY.md` (Wave 5 SUMMARY 포맷 reference).

Do NOT commit SUMMARY.md.

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && S=$(grep -c 'style={{' src/pages/SchedulePage.tsx) && E=$(grep -c 'style={{' src/pages/EducationPage.tsx) && echo "S=$S E=$E" && [ "$S" -le "25" ] && [ "$E" -le "8" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/SchedulePage.tsx src/pages/EducationPage.tsx | awk -F: '{s+=$2} END{print s}')" = "0" ] && [ "$(grep -c '^const lbl\|^const inp' src/pages/SchedulePage.tsx)" = "2" ] && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - Schedule inline ≤25 (83→~17-20 예상)
    - Education inline ≤8 (54→~3-5 예상)
    - 비즈 anchor precise diff = empty
    - emoji 0 + 비색 0
    - inp/lbl 정의 보존 (2건 const)
    - TypeScript 0 error
    - 변경 파일 = 2 .tsx 만
  </done>
</task>

</tasks>

<commits>
- Pre-dispatch: `docs(260528-hbv): pre-dispatch plan for Phase B Wave 6`
- Task 1: `feat(260528-hbv-01): Phase B Wave 6 — Schedule + Education ...`
- Docs: `docs(quick-260528-hbv): Wave 6 완료 — SUMMARY + STATE`
</commits>
