---
phase: 260528-nkv-phase-b-wave-11-elevator-finding-detail
plan: 01
type: execute
wave: 11
depends_on: [260528-jxo]
files_modified:
  - src/pages/ElevatorFindingDetailPage.tsx
autonomous: true
roadmap-wave: Tier 1 / Wave 11 (승강기 상세 — deprecated 진입점, Tier 1 마지막)
---

<objective>
**Phase B Wave 11 — 승강기 상세.** Tier 1 마지막 wave.

- ElevatorFindingDetailPage (505줄, **60 inline + 3 ✕**)
- 메모리 `project_08_finding_detail_deprecated.md`: deprecated 진입점, deep link 호환만

옵션 X+P+M+색변수N 승계. 시각 0 byte.

### 토큰 alias 매핑 (tokens.css L178-191)
- `var(--bg)` → `bg-surface-page` (alias of `--surface-page`)
- `var(--bg2)` → `bg-surface-raised`
- `var(--bg3)` → `bg-surface-sunken`
- `var(--bd)` → `border-border-default`
- `var(--bd2)` → `border-border-strong`
- `var(--t1)` → `text-text-primary`
- `var(--t2)` → `text-text-secondary`
- `var(--t3)` → `text-text-tertiary`
- `var(--acl)` → `bg-accent` / `text-accent` / `border-accent`
- `var(--danger)` → `bg-danger-bar` / `text-danger-bar`
</objective>

<context>

### ElevatorFindingDetailPage 60 inline + 3 ✕ 분석

**Lucide import 확장 필요**: 기존 `import { Wrench } from 'lucide-react'` → `import { Wrench, X } from 'lucide-react'`

### ✕ Sweep (3곳)
- L68 photo modal close button: `>✕</button>` → `><X size={24} /></button>` (기존 className 합병)
- L353 linked repair clear button: `>✕</button>` → `><X size={14} /></button>`
- L425 photo remove button: `>✕</button>` → `><X size={10} /></button>`

### Inline → tailwind (60곳)

**옵션 N 잔존 (예상 ~5-10건)**
- L425 photo remove button multiline — 동적 conditional 없음, 사실 정적 → 변환 가능
- L300 multiline (확인 후, dynamic 일 수 있음)
- L82 multiline (확인 후)
- L274 multiline (확인 후)
- L472 multiline button positioning — 확인
- L485 multiline — 확인
- photoKeys map L424/L458 img/button — 동적 인덱스 사용 가능, 변환 시도
- L450 main resolution image — 정적 변환 가능

**변환 (예상 ~50건)**
- L66 modal overlay `position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column'` → `fixed inset-0 z-[300] bg-[rgba(0,0,0,0.95)] flex flex-col`
- L67 close button area → `shrink-0 flex justify-end px-4 py-3 pt-[calc(12px+var(--sat,44px))]`
- L68 close button → 변환 + ✕ → `<X size={24} />`
- L76 image container → `flex-1 overflow-hidden flex items-center justify-center touch-none`
- L104 KV row `display: 'flex', gap: 12, alignItems: 'flex-start'` → `flex gap-3 items-start`
- L105 label `fontSize: 12, color: 'var(--t3)', width: 64, flexShrink: 0` → `text-caption text-text-tertiary w-16 shrink-0`
- L106 value `fontSize: 14, color: 'var(--t1)', flex: 1, lineHeight: 1.5` → `text-[14px] text-text-primary flex-1 leading-[1.5]`
- L114 section header `fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 10` → `text-caption font-bold text-text-tertiary mb-[10px]`
- L123 spinner container → `flex-1 flex items-center justify-center`
- L124 spinner `width: 28, height: 28, border: '2px solid var(--bd2)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite'` → `w-[28px] h-[28px] border-2 border-border-strong border-t-accent rounded-full [animation:spin_.7s_linear_infinite]`
- L214 root `flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden'` → `flex-1 flex flex-col bg-surface-page h-full overflow-hidden`
- L219/L232 header multiline
- L250 title `fontSize: 16, fontWeight: 700, color: 'var(--t1)'` → `text-base font-bold text-text-primary`
- L258 placeholder `flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', fontSize: 14, color: 'var(--t2)'` → `flex-1 flex items-center justify-center px-6 text-center text-[14px] text-text-secondary`
- L265 detail container multiline
- L271 section `padding: '20px 16px', borderBottom: '1px solid var(--bd)'` → `px-4 py-5 border-b border-border-default`
- L272 header row `display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12` → `flex items-center justify-between mb-3`
- L274 status badge multiline
- L282 flex-col gap-2 → 표준 변환
- L284 whitespace pre-wrap → `whitespace-pre-wrap`
- L312 `fontSize: 13, color: 'var(--t3)', marginTop: 8` → `text-[13px] text-text-tertiary mt-2`
- L353 ✕ button → 변환
- L424 img `width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)'` → `w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default`
- L425 ✕ button → 변환 + Lucide X
- L435 section → 표준
- L437 column gap → 표준
- L441 whitespace pre-wrap
- L450 main img `width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block', marginTop: 12, cursor: 'pointer'` → `w-full max-h-[240px] object-cover rounded-[10px] border border-border-default block mt-3 cursor-pointer`
- L455 photo wrap `display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12` → `flex gap-1.5 flex-wrap mt-3`
- L458 thumbnail img `width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--bd)', cursor: 'pointer'` → `w-20 h-20 object-cover rounded-sm border border-border-default cursor-pointer` (w-20=80 default)
- L472/L485 multiline (확인 후 표준 변환)

### 예상

| Before | After | 변환 |
|---:|---:|---:|
| 60 inline + 3 emoji | ~5-10 | ~53-58 (-90%) |

### 룰 (locked)
- 옵션 X+P+M+색변수N + Lucide X 사용
- 비즈 anchor precise diff = empty
- Phase A 보존 (이제 모든 페이지 emoji 0)
- TypeScript 0 error
- 변경 파일 = 1 .tsx 만

### 함정 회피
- w-7=32 / w-8=48 config (예: 28px → `[28px]`)
- 토큰 alias `var(--tN)` → `text-text-XXX` (XXX = primary/secondary/tertiary)
- spinner animation `[animation:spin_.7s_linear_infinite]` underscore

### 메모리 anchors
- `feedback_tailwind_w8_h8_is_48px.md`
- `project_08_finding_detail_deprecated.md` (deprecated 진입점, 단 sweep 안전)
- Wave 5 (RemediationDetail) spinner precedent + Wave 10 emoji Lucide precedent

</context>

<tasks>

<task type="auto">
  <name>Task 1: Bulk sweep ElevatorFindingDetailPage — 60 inline + 3 emoji → tailwind + Lucide X</name>
  <files>src/pages/ElevatorFindingDetailPage.tsx</files>
  <action>

### Step 1: Before snapshot

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/ElevatorFindingDetailPage.tsx
echo "style before: $(grep -c 'style={{' $F)"
echo "emoji before: $(grep -cE '✓|✗|✕|🔒|💾' $F)"

for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/nkv-before.txt

grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/nkv-clicks.txt
```

### Step 2: Lucide import 확장
`import { Wrench } from 'lucide-react'` → `import { Wrench, X } from 'lucide-react'`

### Step 3: ✕ Sweep (3곳)
- L68: `>✕</button>` → `><X size={24} /></button>` + 기존 style → className
- L353: `>✕</button>` → `><X size={14} /></button>` + style → className
- L425: `>✕</button>` → `><X size={10} /></button>` + style → className

### Step 4: Inline → tailwind (60곳)

PLAN context "Inline → tailwind" 그대로 적용.

핵심:
- 토큰 alias 매핑 (`var(--t3)` → `text-text-tertiary` 등)
- spinner `[animation:spin_.7s_linear_infinite]`
- w-7/w-8 함정 회피 (28px → `[28px]`)
- 표준 P1/P2/P3 변환

### Step 5: After verification

```bash
F=src/pages/ElevatorFindingDetailPage.tsx
echo "style after: $(grep -c 'style={{' $F)"
echo "emoji after: $(grep -cE '✓|✗|✕|🔒|💾' $F)"
# emoji MUST = 0 (모든 ✕ → X 변환)

for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
  echo "  $ANCHOR : $(grep -cE "$ANCHOR" $F)"
done > /tmp/nkv-after.txt
diff /tmp/nkv-before.txt /tmp/nkv-after.txt

grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/nkv-clicks-after.txt
diff /tmp/nkv-clicks.txt /tmp/nkv-clicks-after.txt

echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"

# Lucide X import
grep "from 'lucide-react'" $F

cd .. && git diff --name-only HEAD | grep -v "cha-bio-safety/src/pages/ElevatorFindingDetailPage.tsx" | grep -v ".planning/" | wc -l
```

### Step 6: Atomic commit

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/pages/ElevatorFindingDetailPage.tsx
git commit --no-verify -m "$(cat <<'EOF'
feat(260528-nkv-01): Phase B Wave 11 — ElevatorFindingDetail 60 inline + 3 ✕ → tailwind + Lucide X

3 ✕ → Lucide X (size 24/14/10). 60 inline → ~5-10 잔존.
토큰 alias 매핑 (var(--t1/t2/t3/bg/bd/bd2/acl/danger) → tailwind tokens).
옵션 X+P+M+색변수N 승계. 시각 0 byte. Tier 1 마지막 wave.
비즈 anchor identical. TypeScript 0 error. deprecated 진입점 호환 보존.
EOF
)"
```

### Step 7: SUMMARY.md

Write `cha-bio-safety/.planning/quick/260528-nkv-phase-b-wave-11/260528-nkv-SUMMARY.md`.

**중요**: Tier 1 11 wave 완료 마지막 — Tier 1 누적 통계 포함:
- Tier 1 총 inline 변화 (685→~150)
- Phase A emoji 0 완료
- 다음: Tier 2 (12a~15b, 모바일 zone 분할)

Do NOT commit SUMMARY.md.

  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && S=$(grep -c 'style={{' src/pages/ElevatorFindingDetailPage.tsx) && E=$(grep -cE '✓|✗|✕|🔒|💾' src/pages/ElevatorFindingDetailPage.tsx) && echo "S=$S E=$E" && [ "$S" -le "15" ] && [ "$E" = "0" ] && [ "$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c 'error TS')" = "0" ] && [ "$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' src/pages/ElevatorFindingDetailPage.tsx)" = "0" ] && grep "Wrench, X\|X, Wrench" src/pages/ElevatorFindingDetailPage.tsx | head -1 && cd .. && [ "$(git diff --name-only HEAD | grep -v 'cha-bio-safety/src/pages/' | grep -v '.planning/' | wc -l | tr -d ' ')" = "0" ]</automated>
  </verify>
  <done>
    - ElevatorFindingDetail inline ≤15 (60→~5-10 예상)
    - emoji ✓✗✕ = 0
    - Lucide X import 추가
    - 비즈 anchor precise diff = empty
    - 비색 0
    - TypeScript 0 error
    - 변경 파일 = 1 .tsx 만
  </done>
</task>

</tasks>
