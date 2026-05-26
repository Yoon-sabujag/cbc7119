---
quick_id: 260526-vjz
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/NotFoundPage.tsx
autonomous: true
requirements:
  - REDESIGN-30-W2
tags:
  - redesign
  - 30-not-found
  - tsx-conversion
  - v0.1.1-tokens
  - tailwind-class

must_haves:
  truths:
    - "wildcard `*` 라우트 진입 시 404 페이지가 다크/라이트 양쪽에서 동일하게 센터링 표시된다"
    - "404 디스플레이가 96px (sketch §3 §4) 로 노안 룰을 만족하고 색은 var(--text-tertiary) (정보 없음 의미) 이다"
    - "'대시보드로 이동' 버튼이 var(--accent-active) solid 배경 + var(--text-on-accent) 텍스트로 표시되고 클릭 시 navigate('/dashboard') 가 호출된다"
    - "비즈 anchor 5건 (useNavigate import / navigate('/dashboard') / '404' / '페이지를 찾을 수 없습니다' / '대시보드로 이동') 이 verbatim 1 byte 변경 없이 보존된다"
    - "App.tsx 의 lazy default import (`./pages/NotFoundPage`) 가 그대로 작동한다 (export default 유지)"
  artifacts:
    - path: "cha-bio-safety/src/pages/NotFoundPage.tsx"
      provides: "v0.1.1 토큰 + Tailwind class 풀-마이그레이션 변환된 404 페이지"
      contains: "export default function NotFoundPage"
  key_links:
    - from: "cha-bio-safety/src/pages/NotFoundPage.tsx"
      to: "react-router-dom useNavigate"
      via: "import + navigate('/dashboard') onClick"
      pattern: "useNavigate.*react-router-dom"
    - from: "cha-bio-safety/src/pages/NotFoundPage.tsx"
      to: "cha-bio-safety/src/styles/tokens.css (v0.1.1)"
      via: "Tailwind class (bg-surface-page / text-text-primary / text-text-tertiary / bg-accent-active / text-text-on-accent) + h-button + arbitrary text-[96px]"
      pattern: "bg-surface-page|text-text-tertiary|bg-accent-active"
    - from: "cha-bio-safety/src/App.tsx (line 22, 296)"
      to: "NotFoundPage default export"
      via: "lazy(() => import('./pages/NotFoundPage'))"
      pattern: "export default function NotFoundPage"
---

<objective>
NotFoundPage.tsx (11 라인 wildcard `*` 라우트 페이지) 를 v0.1.1 디자인 토큰 + Tailwind class 로 단일 atomic TSX 변환.

Purpose: redesign/30-not-found W1 sketch (260526-ucq) 에서 사용자 컨펌된 **옵션 A 풀-마이그레이션** (legacy alias `--bg`/`--t1`/`--bg4` → v0.1.1 semantic `--surface-page`/`--text-primary`/`--text-tertiary`) 결정을 페이지 1개에 반영. 인라인 style 제거 + Tailwind class 통일 + 노안 룰 (404 56→96px, 메시지 16→18px, 버튼 14→16px) 적용.

Output: cha-bio-safety/src/pages/NotFoundPage.tsx 1 파일 변환 (약 11~18 라인), 1-commit atomic. 보호 파일 7개 (App.tsx / tokens.css / typography.css / design-system.md / 30-not-found.md / sketch.html / tailwind.config.js) 변경 0 byte. 28-splash 4i9 / 29-extinguisher-public sfw 단일 파일 atomic 패턴 5번째 자동 도달.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@./CLAUDE.local.md
@cha-bio-safety/src/pages/NotFoundPage.tsx
@cha-bio-safety/docs/redesign-context/30-not-found/sketch.html
@cha-bio-safety/docs/redesign-context/30-not-found/30-not-found.md
@cha-bio-safety/docs/redesign-context/30-not-found/design-system.md
@cha-bio-safety/src/styles/tokens.css
@cha-bio-safety/tailwind.config.js
@cha-bio-safety/src/App.tsx
@.planning/quick/260526-ucq-redesign-30-not-found-w1-sketch-notfound/260526-ucq-SUMMARY.md

<interfaces>
<!-- Tailwind theme keys (실측 — tailwind.config.js verbatim) -->
<!-- Executor 는 아래 매핑 표만 보고 변환 가능. 추가 grep 불필요. -->

cha-bio-safety/tailwind.config.js — colors:
```
'surface-page':    'var(--surface-page)'      → class: bg-surface-page
'text-primary':    'var(--text-primary)'      → class: text-text-primary
'text-tertiary':   'var(--text-tertiary)'     → class: text-text-tertiary
'text-on-accent':  'var(--text-on-accent)'    → class: text-text-on-accent
'accent-active':   'var(--accent-active)'     → class: bg-accent-active
'accent':          'var(--accent)'            → (hover 미사용 — pure CSS hover 룰은 본 페이지 제외)
```

cha-bio-safety/tailwind.config.js — borderRadius / spacing / height:
```
borderRadius.md   = 12px  → class: rounded-md       (sketch.html line 206 var(--radius-md) 매핑)
spacing.4         = 16px  → class: gap-4            (sketch.html line 183 var(--space-4) 매핑)
height.button     = var(--button-height) (44 모바일 / 40 데스크톱 auto)  → class: h-button
```

cha-bio-safety/tailwind.config.js — fontSize presets:
```
text-body   = 16px / lineHeight 1.7 / weight 400   (버튼/메시지 base)
text-title  = 18px / lineHeight 1.4 / weight 500   (메시지 — sketch.html line 197)
text-display= 28px / lineHeight 1.0 / weight 500   (404 96px 보다 작아서 미적용 — arbitrary 사용)
```

Tailwind 미등록 = arbitrary value:
- 404 96px (display 28 보다 큼) → `text-[96px]`
- 버튼 padding 좌우 28 (Tailwind spacing.7 = 32, spacing.6 = 24 매핑 안 됨) → `px-7` 사용 가능 (32 → 28 차이 4px, 시각적 무시 가능) **또는** arbitrary `px-[28px]` 정확 매핑 — sketch.html line 205 `padding: 0 28px` verbatim 보존 위해 **arbitrary `px-[28px]` 선택**

font-weight (Tailwind preset 사용 가능 — text-* preset 의 weight 무시되므로 명시):
```
font-black     = 900  (404 디스플레이 — sketch.html line 190)
font-semibold  = 600  (메시지 — sketch.html line 198, 16 → 18 격상 + weight 700→600 격상도 sketch reflect)
font-bold      = 700  (버튼 — sketch.html line 211)
```

cha-bio-safety/src/App.tsx — Auth wrapper / lazy import:
```
line 22:  const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'))
line 296: <Route path="*" element={<NotFoundPage />} />
```
→ default export 유지 필수 (`export default function NotFoundPage()`).
→ App.tsx 자체 변경 금지 (보호 파일).

cha-bio-safety/src/styles/tokens.css — v0.1.1 토큰 실측 (라이브):
```
line 19:  --surface-page    #0a0d12 (dark) / line 75: #ffffff (light)
line 28:  --text-tertiary   #8b949e (dark) / line 83: #656d76 (light)
line 41:  --accent-active   #2563eb (dark) / line 94: #0a52c4 (light)
line 30:  --text-on-accent  #ffffff
line 144: --button-height   44px (mobile) / line 159: 40px (desktop) auto
```
→ tokens.css 변경 금지 (보호 파일).
</interfaces>

<conversion_table>
<!-- 원본 → 변환 후 매핑 (sketch.html line 31~38 + line 187~218 verbatim mirror) -->

원본 (NotFoundPage.tsx 11 라인 — 100% 보존 대상):
```tsx
import { useNavigate } from 'react-router-dom'
export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', color:'var(--t1)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ fontSize:56, fontWeight:900, color:'var(--bg4)', margin:0 }}>404</p>
      <p style={{ fontSize:16, fontWeight:700, margin:0 }}>페이지를 찾을 수 없습니다</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding:'12px 28px', borderRadius:12, background:'#2563eb', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>대시보드로 이동</button>
    </div>
  )
}
```

변환 후 (옵션 A 풀-마이그레이션 + 노안 룰 적용 + 인라인 style 제거):

| 원본 인라인 | 변환 후 |
|---|---|
| `minHeight:'100dvh'` | `min-h-dvh` (Tailwind 기본) |
| `background:'var(--bg)'` (legacy alias) | `bg-surface-page` (v0.1.1 semantic) |
| `color:'var(--t1)'` (legacy alias) | `text-text-primary` (v0.1.1 semantic) |
| `display:'flex'` + `flexDirection:'column'` | `flex flex-col` |
| `alignItems:'center'` + `justifyContent:'center'` | `items-center justify-center` |
| `gap:16` | `gap-4` (Tailwind spacing.4 = var(--space-4) = 16) |
| **404 `<p>`** — `fontSize:56` 노안 격상 | **`text-[96px]`** (sketch.html line 189 96px verbatim) |
| `fontWeight:900` | `font-black` |
| `color:'var(--bg4)'` (legacy alias) | `text-text-tertiary` (v0.1.1 — 정보 없음 의미) |
| `margin:0` | `m-0` |
| (404 추가 — sketch.html line 192~194) | `leading-none tracking-[-0.02em]` |
| **메시지 `<p>`** — `fontSize:16` 노안 격상 | **`text-title`** (Tailwind 18px / lineHeight 1.4) — sketch line 197 18px reflect |
| `fontWeight:700` → 격상 후 600 (sketch line 198) | `font-semibold` (sketch reflect) |
| `margin:0` | `m-0` |
| **버튼** — `padding:'12px 28px'` → height 토큰화 | `h-button px-[28px]` (sketch.html line 204~205 verbatim) |
| `borderRadius:12` | `rounded-md` |
| `background:'#2563eb'` (raw hex) | `bg-accent-active` (v0.1.1) |
| `border:'none'` | `border-none` |
| `color:'#fff'` (raw hex) | `text-text-on-accent` (v0.1.1) |
| `fontSize:14` 노안 격상 | `text-body` (16px) — sketch line 210 reflect |
| `fontWeight:700` | `font-bold` |
| `cursor:'pointer'` | `cursor-pointer` |
| (추가) | `type="button"` (form submit 방지 — defensive) |

**비즈 anchor 5건 (1 byte 변경 0 — verify gate):**
1. `import { useNavigate } from 'react-router-dom'` (line 1)
2. `const navigate = useNavigate()` (line 3)
3. `onClick={() => navigate('/dashboard')}` (line 8 — 인자 `'/dashboard'` 포함)
4. 텍스트 `"404"` (line 6)
5. 텍스트 `"페이지를 찾을 수 없습니다"` (line 7)
6. 텍스트 `"대시보드로 이동"` (line 8 button 내용)

(엄밀히는 6건 — scope 의 5건 + 텍스트 3종 + import + hook 호출 + onClick 인자. verify gate 는 핵심 5 anchor 만 grep.)
</conversion_table>
</context>

<tasks>

<task type="auto">
  <name>NotFoundPage.tsx v0.1.1 토큰 + Tailwind class 풀-마이그레이션 변환</name>
  <files>cha-bio-safety/src/pages/NotFoundPage.tsx</files>
  <action>
원본 11 라인 NotFoundPage.tsx 를 아래 변환 후 코드로 1 파일 통째 교체. <conversion_table> 의 매핑 표 verbatim 적용. 옵션 A 풀-마이그레이션 (W1 260526-ucq 사용자 컨펌 결정) 으로 legacy alias `--bg`/`--t1`/`--bg4` 와 raw hex `#2563eb`/`#fff` 모두 v0.1.1 semantic 으로 교체. sketch.html line 31~38 (token mapping) + line 187~218 (TSX 변환 대상 CSS) verbatim 인용.

**변환 후 코드 (Write 또는 Edit 로 통째 교체 — 약 13~16 라인):**

```tsx
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh bg-surface-page text-text-primary flex flex-col items-center justify-center gap-4">
      <p className="text-[96px] font-black text-text-tertiary m-0 leading-none tracking-[-0.02em]">404</p>
      <p className="text-title font-semibold m-0">페이지를 찾을 수 없습니다</p>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="h-button px-[28px] rounded-md bg-accent-active border-none text-text-on-accent text-body font-bold cursor-pointer"
      >
        대시보드로 이동
      </button>
    </div>
  )
}
```

**필수 보존 (1 byte 변경 0):**
- line 1: `import { useNavigate } from 'react-router-dom'` (anchor #1)
- `const navigate = useNavigate()` (anchor #2)
- `navigate('/dashboard')` 문자열 인자 (anchor #3 — '/dashboard' 슬래시 포함 정확)
- 텍스트 `404` (anchor #4)
- 텍스트 `페이지를 찾을 수 없습니다` (anchor #5)
- 텍스트 `대시보드로 이동` (anchor #6)
- `export default function NotFoundPage()` (App.tsx lazy import 호환)

**디자인 의식 결정 (sketch.html reflect):**
1. 404 색 = `text-text-tertiary` — design-system §1.4 의미 우선 룰 (404 는 에러가 아니라 정보 없음, status-danger 절대 금지)
2. 404 fontSize 96px → Tailwind `text-display` (28px) 미적용, arbitrary `text-[96px]` 사용 (sketch line 189 verbatim)
3. 메시지 weight 700 → 600 (sketch line 198 `font-weight: 600` reflect — 18px 격상에 맞춰 시각 무게 조정)
4. 버튼 padding 좌우 28px → `px-[28px]` arbitrary (Tailwind spacing.7 = 32 와 4px 차이 — sketch line 205 verbatim 보존 위해 arbitrary 채택)
5. 버튼 height → `h-button` (var(--button-height) — 모바일 44 / 데스크톱 40 auto)
6. `type="button"` 추가 — form submit 방지 (defensive — 비즈 anchor 미해당, 보호 룰과 무관, 사용자 컨펌 불필요한 안전 패턴)
7. 인라인 style `{...}` 객체 0건 — 30-not-found.md §4 요구사항 (텍스트 96px 같은 큰 디스플레이는 arbitrary class 로 처리, 인라인 사용 안 함)

**금지 사항:**
- App.tsx / tokens.css / typography.css / design-system.md / 30-not-found.md / sketch.html / tailwind.config.js 변경 0 byte (보호 파일 7개)
- 새 공통 컴포넌트 / 새 파일 생성 금지
- `lg:*` prefix 사용 금지 (정적 센터링 페이지, 분기 불필요 — 30-not-found.md §4 룰)
- linear-gradient / 이모지 / status-danger 색 사용 금지 (sketch §4 negative gate)
- 9 / 10 / 11px fontSize 사용 금지 (노안 마지노선 16px)
- `style={...}` 인라인 객체 사용 금지 (전부 Tailwind class)
- 한글 주석 추가 자제 (페이지 너무 단순, 코드 자체가 self-documenting)

**wrangler / npm run deploy 금지** (CLAUDE.local.md — 디자인 워크트리 룰). main 머지는 사용자가 redesign/30-not-found 브랜치에서 직접 진행.
  </action>
  <verify>
<automated>
cd /Users/jykevin/Documents/cbc7119-design && \
test -f cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== anchor #1 useNavigate import ===" && \
grep -c "import { useNavigate } from 'react-router-dom'" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== anchor #2 useNavigate hook ===" && \
grep -c "const navigate = useNavigate()" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== anchor #3 navigate('/dashboard') ===" && \
grep -c "navigate('/dashboard')" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== anchor #4 '404' ===" && \
grep -c ">404<" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== anchor #5 '페이지를 찾을 수 없습니다' ===" && \
grep -c "페이지를 찾을 수 없습니다" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== anchor #6 '대시보드로 이동' ===" && \
grep -c "대시보드로 이동" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== anchor #7 export default ===" && \
grep -c "export default function NotFoundPage" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== v0.1.1 토큰 class 5종 (bg-surface-page) ===" && \
grep -c "bg-surface-page" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== v0.1.1 토큰 class (text-text-primary) ===" && \
grep -c "text-text-primary" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== v0.1.1 토큰 class (text-text-tertiary) ===" && \
grep -c "text-text-tertiary" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== v0.1.1 토큰 class (bg-accent-active) ===" && \
grep -c "bg-accent-active" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== v0.1.1 토큰 class (text-text-on-accent) ===" && \
grep -c "text-text-on-accent" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== Tailwind layout class (min-h-dvh) ===" && \
grep -c "min-h-dvh" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== Tailwind layout class (flex-col) ===" && \
grep -c "flex-col" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== Tailwind layout class (gap-4) ===" && \
grep -c "gap-4" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== 404 96px arbitrary ===" && \
grep -c "text-\[96px\]" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== 버튼 h-button ===" && \
grep -c "h-button" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== 버튼 rounded-md ===" && \
grep -c "rounded-md" cha-bio-safety/src/pages/NotFoundPage.tsx && \
echo "=== negative: legacy alias --bg --t1 --bg4 0건 ===" && \
[ "$(grep -E -c 'var\(--(bg|t1|bg4)\)' cha-bio-safety/src/pages/NotFoundPage.tsx)" = "0" ] && echo "PASS legacy alias 0" && \
echo "=== negative: raw hex #2563eb 0건 ===" && \
[ "$(grep -c '#2563eb' cha-bio-safety/src/pages/NotFoundPage.tsx)" = "0" ] && echo "PASS raw #2563eb 0" && \
echo "=== negative: raw hex #fff 0건 ===" && \
[ "$(grep -E -c '#fff([^0-9a-fA-F]|$)' cha-bio-safety/src/pages/NotFoundPage.tsx)" = "0" ] && echo "PASS raw #fff 0" && \
echo "=== negative: style={ 인라인 0건 ===" && \
[ "$(grep -c 'style={' cha-bio-safety/src/pages/NotFoundPage.tsx)" = "0" ] && echo "PASS inline style 0" && \
echo "=== negative: status-danger / status-fire 0건 ===" && \
[ "$(grep -E -c '(status-danger|status-fire|text-danger|bg-danger|text-fire|bg-fire)' cha-bio-safety/src/pages/NotFoundPage.tsx)" = "0" ] && echo "PASS status- 0" && \
echo "=== negative: 9/10/11px fontSize 0건 (노안 룰) ===" && \
[ "$(grep -E -c 'text-\[(9|10|11)px\]|fontSize:\s*(9|10|11)\b' cha-bio-safety/src/pages/NotFoundPage.tsx)" = "0" ] && echo "PASS 9/10/11px 0" && \
echo "=== negative: linear-gradient 0건 ===" && \
[ "$(grep -c 'linear-gradient' cha-bio-safety/src/pages/NotFoundPage.tsx)" = "0" ] && echo "PASS gradient 0" && \
echo "=== negative: 이모지 0건 (BMP+SMP emoji ranges) ===" && \
[ "$(LC_ALL=C grep -P -c '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' cha-bio-safety/src/pages/NotFoundPage.tsx 2>/dev/null || echo 0)" = "0" ] && echo "PASS emoji 0" && \
echo "=== 보호 파일 7개 변경 0 (working tree diff) ===" && \
[ -z "$(git diff --name-only HEAD -- cha-bio-safety/src/App.tsx cha-bio-safety/src/styles/tokens.css cha-bio-safety/docs/redesign-context/30-not-found/sketch.html cha-bio-safety/docs/redesign-context/30-not-found/30-not-found.md cha-bio-safety/docs/redesign-context/30-not-found/design-system.md cha-bio-safety/docs/redesign-context/30-not-found/typography.css cha-bio-safety/tailwind.config.js)" ] && echo "PASS 보호 7파일 변경 0" && \
echo "=== tsc 타입 체크 (no emit) ===" && \
cd cha-bio-safety && npx tsc --noEmit 2>&1 | tee /tmp/tsc-vjz.log | tail -5 && \
[ "$(grep -c 'error TS' /tmp/tsc-vjz.log)" = "0" ] && echo "PASS tsc 0 errors" && \
echo "=== ALL GATES PASS ==="
</automated>
  </verify>
  <done>
- cha-bio-safety/src/pages/NotFoundPage.tsx 변환 완료 (옵션 A 풀-마이그레이션)
- 비즈 anchor 7건 (useNavigate import / hook / navigate('/dashboard') / "404" / "페이지를 찾을 수 없습니다" / "대시보드로 이동" / export default) verbatim 보존
- v0.1.1 토큰 5종 (bg-surface-page / text-text-primary / text-text-tertiary / bg-accent-active / text-text-on-accent) + Tailwind layout class 적용
- legacy alias (--bg / --t1 / --bg4) 0건, raw hex (#2563eb / #fff) 0건, 인라인 style={...} 0건
- status-danger / status-fire / 이모지 / linear-gradient / 9-11px fontSize 모두 0건
- 보호 파일 7개 (App.tsx / tokens.css / typography.css / design-system.md / 30-not-found.md / sketch.html / tailwind.config.js) git diff 0 byte
- tsc --noEmit 0 errors
- 노안 룰 PASS (404 96px / 메시지 text-title 18px / 버튼 text-body 16px — 모두 16px 마지노선 초과)
  </done>
</task>

</tasks>

<verification>
변환 후 최종 산출물:
- `cha-bio-safety/src/pages/NotFoundPage.tsx` 1 파일만 변경 (약 13~16 라인)
- 모든 verify gate PASS (anchor 7건 / 토큰 5종 / Tailwind layout 3종 / arbitrary text-[96px] / negative gate 7종 / 보호 7파일 diff 0 / tsc 0 errors)
- 28-splash 4i9 / 29-extinguisher-public sfw 단일 파일 atomic 패턴 5번째 자동 도달 (10-cctv-info 의 3-wave 분리 패턴 대비 본 페이지는 11 라인이라 단일 atomic 정합)

배포 검증 (사용자가 main 머지 후):
- `cbc7119-preview.pages.dev/anything-not-existing` 접속 → 다크 모드 (기본) 에서 404 페이지 표시
- 404 시각적 검증: 96px 큰 디스플레이 + var(--text-tertiary) 색 + 정적 센터링
- "대시보드로 이동" 버튼 클릭 → /dashboard 로 라우팅 작동
- 라이트 모드 (data-theme 토글) 에서도 동일 작동 (tokens.css 자동 분기)
- 노안 룰: 안내문/버튼 모두 16px 이상

배포 금지 사항 (이 워크트리):
- wrangler 명령 절대 금지 (CLAUDE.local.md)
- npm run deploy 절대 금지
- 디자인 검증은 사용자 main push → GitHub Actions → cbc7119-preview 자동 배포로만
</verification>

<success_criteria>
- [ ] NotFoundPage.tsx 변환 완료 (옵션 A 풀-마이그레이션)
- [ ] 비즈 anchor 7건 verbatim 보존 (grep 카운트 각 >=1)
- [ ] v0.1.1 토큰 class 5종 모두 적용 (grep 카운트 각 >=1)
- [ ] Tailwind layout class (min-h-dvh / flex-col / gap-4) 적용
- [ ] arbitrary `text-[96px]` 404 디스플레이 적용 (노안 룰 PASS)
- [ ] Negative gate 7종 모두 0건 (legacy alias / raw hex / inline style / status- / 9-11px / gradient / 이모지)
- [ ] 보호 파일 7개 git diff 0 byte (App.tsx / tokens.css / typography.css / design-system.md / 30-not-found.md / sketch.html / tailwind.config.js)
- [ ] tsc --noEmit 0 errors
- [ ] App.tsx lazy import 호환 (export default 유지)
- [ ] sketch.html (W1) 의 token mapping / negative gate / 비즈 anchor 결정 100% reflect
</success_criteria>

<output>
After completion, create `.planning/quick/260526-vjz-redesign-30-not-found-w2-tsx-notfoundpag/260526-vjz-SUMMARY.md`.

SUMMARY 에 포함해야 할 항목:
- 변경된 파일 1개 (NotFoundPage.tsx) — before/after 라인 수
- 옵션 A 풀-마이그레이션 결정 reflect (legacy alias 3종 → v0.1.1 semantic 3종 + raw hex 2종 → v0.1.1 token 2종)
- 노안 룰 적용 결과 (404 56→96px / 메시지 16→18px / 버튼 14→16px)
- Tailwind arbitrary 사용 사유 (text-[96px] / px-[28px] — Tailwind preset 미커버)
- 패턴 박제: 단일 파일 atomic 5번째 사례 (28-splash 4i9 / 29-extinguisher-public sfw / 10-cctv-info cd01e96 / 10-cctv-info 831d719 / 30-not-found vjz)
- 보호 파일 7개 diff 0 확인
- 후속 작업: 사용자가 redesign/30-not-found 브랜치에서 main 머지 → cbc7119-preview 자동 배포 → 시각 검증
</output>
