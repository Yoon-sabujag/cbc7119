---
phase: 260529-epe-phase-b-wave-12a-staffmanage-mobile
plan: 01
type: execute
wave: 12a
depends_on: [260528-nkv]
files_modified:
  - src/pages/StaffManagePage.tsx
autonomous: true
roadmap-wave: Tier 2 / Wave 12a (StaffManage 모바일 zone — Tier 2 첫 wave)
---

<objective>
**Phase B Wave 12a — StaffManage 모바일 zone.** Tier 2 첫 wave.

StaffManagePage (529줄, **76 total inline**):
- **모바일 zone (sweep 대상): 52 inline** = shared 47 + mobile-only 5
- **데스크톱 zone (skip, Wave 12b 후행): 24 inline** (L396-L475 desktop header + data table)

옵션 X+P+M+색변수N + LABEL_STYLE/INPUT_STYLE 옵션 N 승계.

### 토큰 alias (Wave 11 precedent 확장)
- `var(--bg)` → `bg-surface-page`
- `var(--bg2)` → `bg-surface-raised`
- `var(--bg3)` → `bg-surface-sunken`
- `var(--bg4)` → `bg-surface-active`
- `var(--bd)` → `border-border-default`
- `var(--bd2)` → `border-border-strong`
- `var(--t1)` → `text-text-primary`
- `var(--t2)` → `text-text-secondary`
- `var(--t3)` → `text-text-tertiary`
- `var(--acl)` → `accent`
- `var(--danger)` → `danger-bar`
- `var(--warn)` → `warning-bar` (tokens.css L190)

### 위험 anchor
- 데스크톱 zone L429-485 데이터 테이블 — **변경 절대 0** (Wave 12b 책임)
- 모바일/데스크톱 boundary: `{isDesktop && ...}` (L429) / `{!isDesktop && ...}` (L486/L502) — boundary 줄 변경 0
</objective>

<context>

### 모바일 zone (sweep 대상 — 52 inline)

#### Shared 47곳 — 모달/카드/공통 영역

**Bottom-sheet modal (L17-24)**: 4곳
- L17 backdrop `fixed inset-0 bg-[rgba(0,0,0,0.6)] z-[50] flex flex-col justify-end`
- L20 sheet `bg-surface-raised rounded-t-2xl [animation:slideUp_0.28s_ease-out]`
- L21 handle area `flex justify-center pt-3`
- L24 title `px-4 pt-3 pb-0`

**Center modal (L37-41)**: 3곳
- L37 backdrop `fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[50] flex items-center justify-center p-4`
- L40 box `bg-surface-raised rounded-md w-[440px] max-h-[85vh] overflow-y-auto`
- L41 title `px-6 pt-5 pb-0`

**Replace modal (L106-133)**: 다수
- L106 info box `p-4 flex flex-col gap-3`
- L107 banner `bg-[rgba(59,130,246,.08)] rounded-sm px-3 py-2.5 text-[NNpx] ...`
- L116 no candidates → 기존 className 활용
- L120 select multiline → 변환
- L129 button row `flex gap-2 mt-1`
- L133 confirm button `flex-1 h-11 bg-[#f59e0b] text-white border-0 rounded-sm ...`

**Staff form modal (L196-304)**:
- L196 form body multiline → 변환
- L198/L202 label spans `text-danger-bar` 또는 단순
- L203 input — INPUT_STYLE spread, 옵션 N 잔존
- L217 disabled input → INPUT_STYLE spread 옵션 N
- L236 role toggle → 변환
- L240 toggle button → 변환
- L250 reset link → 변환
- L254-260 confirm reset 블록 → 변환
- L271-304 action row + buttons → 변환

**Staff card (L317-333)**: 5곳
- L317 card root → 변환
- L318 status dot → 동적 N or M
- L319/L320 flex containers → 변환
- L323 role badge multiline → 동적 color 옵션 N or M
- L333 action button → 변환

**Skeleton/error (L416/L423)**: 2곳
- L416 skeleton wrap → 변환
- L423 error state → 변환

#### Mobile-only 5곳 (L487-506)
- L487 card list `px-4 pb-20 flex flex-col gap-3`
- L489 empty container `flex-1 flex flex-col items-center justify-center py-10`
- L491 empty desc → 변환
- L503 FAB wrap `sticky bottom-0 ...`
- L506 FAB button `border-0 cursor-pointer`

### 데스크톱 zone — **변경 절대 0** (24곳, Wave 12b)
- L396-L407 (desktop header)
- L408 (mobile header — boundary 내부, but desktop ternary alternate)
- L429-L485 (`{isDesktop && ...}` data table block)

### LABEL_STYLE / INPUT_STYLE 보존 (옵션 N — Wave 6 SchedulePage inp/lbl precedent)
- L49 const INPUT_STYLE: React.CSSProperties — **정의 보존**
- L54 const LABEL_STYLE: React.CSSProperties — **정의 보존**
- `style={LABEL_STYLE}` 직접 참조 — 이미 inline 아님
- `style={{ ...INPUT_STYLE, ... }}` spread — 옵션 N 잔존

### 예상

| 구역 | Before | After | 변환 |
|---|---:|---:|---:|
| Shared | 47 | ~10-15 | ~32-37 |
| Mobile-only | 5 | 0-1 | 4-5 |
| **합계 sweep** | **52** | **~10-16** | **~36-42** |
| Desktop-only (skip) | 24 | 24 | 0 |
| **전체 file** | **76** | **~34-40** | **~36-42** |

### 룰 (locked)
- 옵션 X+P+M+색변수N + module-scope const N
- 데스크톱 zone 절대 변경 0 (Wave 12b 책임)
- 비즈 anchor precise diff = empty
- Phase A 보존
- TypeScript 0 error
- 변경 파일 = 1 .tsx 만

### 함정 회피
- `w-7=32/p-7=32/w-8=48` config override
- `[animation:slideUp_0.28s_ease-out]` underscore
- `bg-[rgba(...)]` 공백 제거

### 메모리 anchors
- `feedback_tailwind_w8_h8_is_48px.md`
- `feedback_tailwind_token_class_pattern.md`
- Wave 6 (Schedule inp/lbl precedent) — module const 옵션 N
- Wave 11 (ElevatorFindingDetail token alias precedent)

</context>

<tasks>

<task type="auto">
  <name>Task 1: Sweep StaffManagePage 모바일 zone — 52 inline (shared 47 + mobile-only 5)</name>
  <files>src/pages/StaffManagePage.tsx</files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/StaffManagePage.tsx
echo "style before: $(grep -c 'style={{' $F)"

for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/epe-before.txt
grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/epe-clicks.txt
```

### Step 2: Edit StaffManagePage.tsx — 모바일 zone 만

**절대 변경 금지 (데스크톱 zone, 24곳)**:
- L396-L407 desktop header (isDesktop true branch)
- L429-L485 desktop data table (`{isDesktop && ...}` block)

**모바일 zone 변환 (52곳)**: PLAN context 매핑 그대로
- L17/L20/L21/L24 bottom-sheet modal
- L37/L40/L41 center modal
- L106-L133 replace modal
- L196-L304 form modal (LABEL_STYLE/INPUT_STYLE spread 잔존)
- L317-L333 staff card (동적 색은 옵션 N 또는 M)
- L416/L423 skeleton/error
- L487-L506 mobile-only FAB + empty

**LABEL_STYLE/INPUT_STYLE 보존**: L49/L54 정의 그대로. spread 잔존.

### Step 3: After verification

```bash
F=src/pages/StaffManagePage.tsx
echo "style after: $(grep -c 'style={{' $F)"

for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/epe-after.txt
diff /tmp/epe-before.txt /tmp/epe-after.txt

grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/epe-clicks-after.txt
diff /tmp/epe-clicks.txt /tmp/epe-clicks-after.txt

echo "emoji: $(grep -cE '✓|✗|✕|🔒|💾' $F)"
echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

# 데스크톱 zone 보존 검증 (L429-485 block 변경 0)
git diff src/pages/StaffManagePage.tsx | grep -E "^[+-]" | grep -vE "^[+-]{3}" | awk -F: 'BEGIN{}' | wc -l > /tmp/epe-diff-lines.txt
# 추가/제거 라인이 desktop block 안 있으면 실패
git diff src/pages/StaffManagePage.tsx > /tmp/epe-diff.txt

# LABEL_STYLE / INPUT_STYLE 정의 보존
grep -c "^const INPUT_STYLE\|^const LABEL_STYLE" $F
# MUST = 2

cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/StaffManagePage.tsx" | grep -v ".planning/" | wc -l
```

### Step 4: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/StaffManagePage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260529-epe-01): Phase B Wave 12a — StaffManage 모바일 zone (52 inline) → tailwind

Tier 2 첫 wave. 모바일 zone (shared 47 + mobile-only 5) sweep. 데스크톱 zone 24곳 절대 변경 0 (Wave 12b 후행).
LABEL_STYLE/INPUT_STYLE 정의 + spread 옵션 N 잔존.
토큰 alias 매핑 (var(--bg2/bg3/bd/danger/warn 등) → tailwind tokens).
옵션 X+P+M+색변수N+module const N. 시각 0 byte 변경 (모바일 zone).
비즈 anchor identical. TypeScript 0 error.
EOF
)"
```

### Step 5: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260529-epe-phase-b-wave-12a/260529-epe-SUMMARY.md`.

Tier 2 첫 wave — zone 분할 패턴 documented for 12b/13a/13b/14a/14b/15a/15b 참조.

Do NOT commit SUMMARY.md.

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && S=$(grep -c 'style={{' src/pages/StaffManagePage.tsx) && echo "after=$S (was 76, expect ~34-40)" && [ "$S" -ge "30" ] && [ "$S" -le "42" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/StaffManagePage.tsx)" = "0" ] && [ "$(grep -c '^const INPUT_STYLE\|^const LABEL_STYLE' src/pages/StaffManagePage.tsx)" = "2" ] && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - StaffManagePage inline 30-42 (52 모바일 sweep + 24 desktop 잔존)
    - 데스크톱 zone (L429-485) 변경 0
    - LABEL_STYLE / INPUT_STYLE 정의 보존
    - 비즈 anchor precise diff = empty
    - emoji 0 + 비색 0
    - TypeScript 0 error
    - 변경 파일 = 1 .tsx 만
  </done>
</task>

</tasks>
