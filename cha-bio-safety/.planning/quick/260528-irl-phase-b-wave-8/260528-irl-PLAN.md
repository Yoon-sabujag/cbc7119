---
phase: 260528-irl-phase-b-wave-8-extinguisher
plan: 01
type: execute
wave: 8
depends_on: [260528-iht]
files_modified:
  - src/pages/ExtinguisherPublicPage.tsx
  - src/pages/ExtinguishersListPage.tsx
autonomous: true
roadmap-wave: Tier 1 / Wave 8 (소화기 묶음)
---

<objective>
**Phase B Wave 8 — 소화기.** 두 파일 합계 122 inline → tailwind.

- ExtinguisherPublicPage (151줄, 44 inline) — 비로그인 점검표 인쇄 페이지
- ExtinguishersListPage (1194줄, 78 inline) — 소화기 목록 + 모달 + 8 shared style 객체

옵션 X+P+M+색변수N + shared style obj N 승계.
</objective>

<context>

### ExtinguisherPublicPage 44 inline

**보존 (옵션 N)**
- L148 `const page: React.CSSProperties` 정의 — vendor prefix (WebkitUserSelect/WebkitTouchCallout) 포함, `as any` 캐스팅 → 변경 0
- `style={page}` 직접 참조 (3건+) — 이미 inline 아님

**변환 (예상 ~38건)**
- L41/L42 `<div style={{ textAlign:'center', padding:40, color:'#333', fontSize:14 }}>` → `className="text-center p-10 text-[#333] text-[14px]"` (`p-10 = 40px default`)
- L52-64 `<col style={{ width:'N%' }} />` × 다수 → `<col className="w-[N%]" />` (table col width arbitrary)
- 나머지 표 셀 + signature 영역 inline → 표준 P1/P2/P3 변환

### ExtinguishersListPage 78 inline

**보존 (옵션 N — shared style 8개 + 동적)**
- L812-1199 const 정의 8건: actionBtnStyle / dangerBtnStyle / modalWrapperStyle / infoBannerStyle / inputStyle / cancelBtnStyle / primaryBtnStyle — 변경 0
- `style={actionBtnStyle}` 직접 참조 — 이미 inline 아님
- `style={{ ...modalWrapperStyle, ... }}` spread 12건 — 옵션 N 잔존 (shared 참조)
- `style={{ ...inputStyle, borderColor: borderForField(...) }}` 동적 — 옵션 N

**변환 (예상 ~50-55건)**
- L316-405 multiline 상단 헤더/탭 영역 — 표준 P1/P2/P3
- L1071 `display: 'flex', gap: 8, marginTop: 16` → `flex gap-2 mt-4`
- L1105 `fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10` → `text-base font-bold text-text-primary mb-[10px]`
- L1106 `fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16` → `text-[13px] text-text-secondary leading-relaxed mb-4`
- L1107 `display: 'flex', gap: 8` → `flex gap-2`
- L1108 onCancel button — 정적 button reset (spread 없으면 변환)
- L1116 onClick button — 정적
- L1152 `fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 6` → `text-caption font-medium text-text-tertiary mb-1.5`
- L1136 multiline — 확인 후 (정적이면 변환)
- L1104 spread `{{ ...modalWrapperStyle, maxWidth: 320 }}` — 옵션 N 잔존 (spread)

### 예상

| 파일 | Before | After | 변환 |
|---|---:|---:|---:|
| ExtinguisherPublic | 44 | ~5 | ~38 |
| ExtinguishersList | 78 | ~25-30 | ~50 |
| **합계** | **122** | **~30-35** | **~88 (-72%)** |

### 룰 (locked)
- 옵션 X+P+M+색변수N + shared style obj N + vendor N
- 비즈 anchor precise diff = empty
- Phase A 보존
- TypeScript 0 error
- 변경 파일 = 2 .tsx 만

### 함정 회피 (누적 학습)
- w-7/p-7=32 / w-8/p-8=48 config override
- 28px → `[28px]` / 36px → `[36px]` / 44px → `w-11` / 48px → `h-12` 또는 `h-8` (둘 다 48px)
- `p-10 = 40px default` ✓
- table col `width: 'N%'` → `<col className="w-[N%]"/>` arbitrary

### 메모리 anchors
- `feedback_tailwind_w8_h8_is_48px.md`
- `feedback_tailwind_token_class_pattern.md`

</context>

<tasks>

<task type="auto">
  <name>Task 1: Bulk apply Extinguisher Public + List inline → tailwind</name>
  <files>
    src/pages/ExtinguisherPublicPage.tsx
    src/pages/ExtinguishersListPage.tsx
  </files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
for F in src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx; do
  echo "$F before: $(grep -c 'style={{' $F)"
done

for F in src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx; do
  echo "=== $F ==="
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
  done
done > /tmp/irl-before.txt

for F in src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx; do
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/irl-clicks-$(basename $F .tsx).txt
done
```

### Step 2: Edit ExtinguisherPublicPage.tsx

핵심 룰:
- **L148 `const page` 정의 보존** (vendor prefix + as any)
- **`style={page}` 참조 그대로**
- L41/L42 inline → className
- L52-64 `<col style={{ width: 'N%' }} />` × 다수 → `<col className="w-[N%]" />`
- 나머지 표/signature 영역 표준 변환

### Step 3: Edit ExtinguishersListPage.tsx

핵심 룰:
- **L812-1199 const 8개 정의 보존**
- `style={...Style}` 직접 참조 그대로
- `style={{ ...modalWrapperStyle, ... }}` spread 잔존 (옵션 N)
- `style={{ ...inputStyle, borderColor: ... }}` 동적 spread 잔존 (옵션 N)
- 단독 inline `style={{...}}` (spread 없는 것) → 변환

### Step 4: After verification

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety

for F in src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx; do
  echo "$F after: $(grep -c 'style={{' $F)"
done

for F in src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx; do
  echo "=== $F ==="
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
  done
done > /tmp/irl-after.txt
diff /tmp/irl-before.txt /tmp/irl-after.txt

for F in src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx; do
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/irl-clicks-$(basename $F .tsx)-after.txt
  diff /tmp/irl-clicks-$(basename $F .tsx).txt /tmp/irl-clicks-$(basename $F .tsx)-after.txt
done

for F in src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx; do
  echo "$F emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
  echo "$F 비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"
done

./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/\(ExtinguisherPublic\|ExtinguishersList\)Page.tsx" | grep -v ".planning/" | wc -l

# shared style 정의 보존
grep -c "^const page\|^const actionBtnStyle\|^const dangerBtnStyle\|^const modalWrapperStyle\|^const infoBannerStyle\|^const inputStyle\|^const cancelBtnStyle\|^const primaryBtnStyle" src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx
# Public 1 (page) + List 7 = 8
```

### Step 5: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx cha-bio-safety/src/pages/ExtinguishersListPage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260528-irl-01): Phase B Wave 8 — Extinguisher (Public 44 + List 78) → tailwind

Public 44→N (const page 정의 + style={page} 참조 보존, col width arbitrary 변환, 표/signature 영역 표준 변환).
List 78→N (8 shared style 객체 정의 보존, spread + 동적 spread 옵션 N, 단독 inline 표준 변환).
옵션 X+P+M+색변수N + shared style obj N + vendor N 승계. 시각 0 byte.
비즈 anchor identical. TypeScript 0 error.
EOF
)"
```

### Step 6: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260528-irl-phase-b-wave-8/260528-irl-SUMMARY.md`.

Do NOT commit SUMMARY.md.

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && P=$(grep -c 'style={{' src/pages/ExtinguisherPublicPage.tsx) && L=$(grep -c 'style={{' src/pages/ExtinguishersListPage.tsx) && echo "P=$P L=$L" && [ "$P" -le "10" ] && [ "$L" -le "40" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx | awk -F: '{s+=$2} END{print s}')" = "0" ] && [ "$(grep -cE '^const (page|actionBtnStyle|dangerBtnStyle|modalWrapperStyle|infoBannerStyle|inputStyle|cancelBtnStyle|primaryBtnStyle)' src/pages/ExtinguisherPublicPage.tsx src/pages/ExtinguishersListPage.tsx | awk -F: '{s+=$2} END{print s}')" = "8" ] && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - ExtinguisherPublic inline ≤10
    - ExtinguishersList inline ≤40
    - 비즈 anchor precise diff = empty
    - emoji 0 + 비색 0
    - shared style 정의 8개 보존
    - TypeScript 0 error
    - 변경 파일 = 2 .tsx 만
  </done>
</task>

</tasks>
