---
quick_id: 260526-ucq
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/30-not-found/sketch.html
autonomous: true
requirements:
  - REDESIGN-30-W1
tags:
  - redesign
  - 30-not-found
  - sketch
  - design-system-v0.1.1

must_haves:
  truths:
    - "redesign/30-not-found W1 sketch HTML 1개 파일이 평면 폴더 (`cha-bio-safety/docs/redesign-context/30-not-found/sketch.html`) 에 작성된다"
    - "sketch 안에 NotFoundPage 다크 모드 변형이 1개 시연된다 (모바일 폭 480 컨테이너 시뮬레이션)"
    - "sketch 안에 NotFoundPage 라이트 모드 변형이 1개 시연된다 (모바일 폭 480 컨테이너 시뮬레이션)"
    - "본문 안내 문구 폰트는 ≥16px (text-body, 노안 룰 준수)"
    - "404 큰 텍스트는 fontSize ≥ 56px 인라인 (text-display 28px 초과, 컨텍스트 §4 권장)"
    - "404 텍스트 색은 status-danger 가 아닌 text-tertiary / text-secondary / text-disabled / accent 계열만 사용 (의미 일관성 — 404 는 에러가 아니라 정보 없음)"
    - "'대시보드로 이동' 버튼이 accent 토큰 기반 (var(--accent) 또는 --text-link) 으로 시각화된다"
    - "비즈 보존 anchor 5건 (useNavigate / navigate('/dashboard') / '404' / '페이지를 찾을 수 없습니다' / '대시보드로 이동') 이 sketch 캡션 또는 본문에 명시된다"
    - "sketch HTML 의 디자인 결정 요약 (사용 토큰 / 색 / spacing / 폰트 / 버튼 변형) 이 하단에 기록된다"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/30-not-found/sketch.html"
      provides: "redesign/30-not-found W1 단일 sketch — 다크 + 라이트 2 변형 + 디자인 결정 요약"
      contains: "404, 페이지를 찾을 수 없습니다, 대시보드로 이동, design-system, --text-tertiary, --accent"
  key_links:
    - from: "sketch.html"
      to: "tokens.css (design-system v0.1.1)"
      via: ":root 안 CSS 변수 인라인 정의 (10-cctv-info 평면 sketch precedent 패턴 mirror)"
      pattern: "--surface-page|--text-primary|--text-secondary|--text-tertiary|--accent"
    - from: "sketch.html 비즈 anchor 캡션"
      to: "NotFoundPage.tsx (W2 TSX 변환 wave 진입 시 참조)"
      via: "주석 또는 본문에 'useNavigate' / 'navigate(/dashboard)' / '404' / '페이지를 찾을 수 없습니다' / '대시보드로 이동' 텍스트 등장"
      pattern: "useNavigate|/dashboard|404|페이지를 찾을 수 없습니다|대시보드로 이동"
---

<objective>
redesign/30-not-found W1 — NotFoundPage.tsx (11 라인, wildcard route `*`) 의 디자인 시안 HTML 1 파일을 작성한다. 페이지가 너무 단순하기 때문에 28-splash / 23-education 의 W1 인덱스 markdown 작성을 생략하고 (10-cctv-info 평면 sketch precedent mirror), 평면 폴더 (`cha-bio-safety/docs/redesign-context/30-not-found/`) 직속에 `sketch.html` 1 개 파일을 만든다. 다크 + 라이트 2 변형, design-system v0.1.1 토큰 적용, 노안 룰 (본문 ≥16px), 비즈 anchor 5건 (useNavigate / navigate('/dashboard') / '404' / '페이지를 찾을 수 없습니다' / '대시보드로 이동') 명시, 디자인 결정 요약을 포함한다.

Purpose: W2 TSX 변환 wave 진입 전 사용자 컨펌용 시각 산출물. NotFoundPage.tsx / App.tsx / tokens.css / typography.css / design-system.md / 30-not-found.md 모두 1 byte 변경 없음.
Output: `cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` 1 파일.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@CLAUDE.local.md
@.planning/STATE.md
@cha-bio-safety/src/pages/NotFoundPage.tsx
@cha-bio-safety/docs/redesign-context/30-not-found/30-not-found.md
@cha-bio-safety/docs/redesign-context/30-not-found/tokens.css
@cha-bio-safety/docs/redesign-context/30-not-found/typography.css
@cha-bio-safety/docs/redesign-context/28-splash/sketch-wave-2-splash.html
@cha-bio-safety/docs/redesign-context/10-cctv-info/sketch/cctv-info-sketch.html

<interfaces>
<!-- NotFoundPage.tsx 11 라인 verbatim — 비즈 anchor 5건 (W1 sketch 가 캡션/본문에 의식해야 할 텍스트). W2 TSX 변환 wave 에서 1 byte 변경 0 보존 대상. -->

From cha-bio-safety/src/pages/NotFoundPage.tsx:
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

비즈 anchor 5건 (W2 TSX 1 byte 변경 0):
1. `useNavigate()` hook (line 1, 3)
2. `navigate('/dashboard')` 라우팅 (line 8 onClick)
3. "404" 텍스트 (line 6)
4. "페이지를 찾을 수 없습니다" 텍스트 (line 7)
5. "대시보드로 이동" 버튼 카피 (line 8)

토큰 매핑 가이드 (tokens.css v0.1.1 기준):
- 페이지 배경: `var(--bg)` → `var(--surface-page)` 권장 (현 코드의 alias 폐기 검토)
- 본문 색: `var(--t1)` → `var(--text-primary)` 권장
- 404 큰 텍스트 색: `var(--bg4)` (surface-active) 유지 가능 OR `var(--text-tertiary)` 권장 (의미: 정보 없음 강조)
  - **status-danger 금지** (404 는 에러가 아니라 정보 없음)
- 버튼 배경: `#2563eb` raw hex → `var(--accent-active)` 또는 `var(--accent)` 권장
- 버튼 텍스트 색: `#fff` raw → `var(--text-on-accent)` 권장
- gap: 16 → `var(--space-4)` (16) 또는 그대로 인라인 유지 가능
- borderRadius: 12 → `var(--radius-md)` (12) 권장

설계 옵션 (sketch 에서 시각화 — W2 에서 사용자 컨펌 후 선택):
- A. 토큰 풀-마이그레이션 (alias `--bg` / `--t1` / `--bg4` 모두 새 semantic 으로 교체)
- B. alias 유지 (`var(--bg)` / `var(--t1)` / `var(--bg4)` 그대로 — 변경 최소화)
- C. 하이브리드 (배경/텍스트는 alias 유지, 버튼 raw hex `#2563eb`/`#fff` 만 var(--accent-active)/var(--text-on-accent) 교체)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: sketch.html 작성 — 다크+라이트 2 변형 + 디자인 결정 요약</name>
  <files>cha-bio-safety/docs/redesign-context/30-not-found/sketch.html</files>
  <action>
다음 구조의 단일 HTML 파일을 작성한다. 외부 리소스는 Pretendard CDN 1건만 허용 (cha-bio-safety/docs/redesign-context/30-not-found/typography.css 의 `@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard...')` mirror). 그 외 모든 토큰 / 스타일은 단일 HTML 안에 인라인 `<style>` 으로 정의한다 (10-cctv-info/sketch/cctv-info-sketch.html 평면 sketch precedent 패턴 mirror).

**파일 구조 (위에서 아래로):**

1. `<!DOCTYPE html>` + `<html lang="ko">` + `<head>` 안 메타 + `<title>30 NotFoundPage · v0.1.1 재디자인 시안</title>` + `<style>` 블록
2. `<style>` 블록 내부:
   - `:root` (다크 토큰 인라인 정의 — design-system.md v0.1.1 §2 verbatim):
     - `--surface-page: #0a0d12`
     - `--surface-raised: #1a1f27`
     - `--surface-active: #2c333d`
     - `--text-primary: #e6edf3`
     - `--text-secondary: #adb6c0`
     - `--text-tertiary: #8b949e`
     - `--text-disabled: #5d646e`
     - `--text-on-accent: #ffffff`
     - `--accent: #3b82f6`
     - `--accent-active: #2563eb`
     - `--radius-md: 12px`
     - `--radius-lg: 16px`
     - `--space-4: 16px`
     - `--button-height: 44px`
     - `--font-sans: 'Pretendard Variable', 'Pretendard', system-ui, sans-serif`
   - `[data-theme="light"]` (라이트 토큰 인라인 정의 — design-system.md v0.1.1 §2 verbatim):
     - `--surface-page: #ffffff`
     - `--surface-raised: #f6f8fa`
     - `--surface-active: #d8dee4`
     - `--text-primary: #1f2328`
     - `--text-secondary: #4d5562`
     - `--text-tertiary: #656d76`
     - `--text-disabled: #afb8c1`
     - `--accent: #1f6feb`
     - `--accent-active: #0a52c4`
   - `body { background: #0f1218; ... font-family: var(--font-sans); }` (10-cctv-info sketch precedent body chrome 패턴 mirror — body 자체 raw hex 는 sketch chrome 예외, 카드 내부 마크업은 var(--...) 만 사용)
   - `h1` (sketch 외곽 제목, 22px, text-primary) + `h1 + p` (서브타이틀, text-tertiary, 13px)
   - `h2` (섹션 헤더, 14px, accent 좌측 border) + `.vp-desc` (섹션 설명, 12px text-tertiary)
   - `.row` (다크/라이트 두 frame 좌우 배치 flex container — gap 32, flex-wrap allow)
   - `.frame-mobile` (모바일 시뮬레이션, width:480, min-height:720, border-radius:16, background:var(--surface-page), color:var(--text-primary), border:1px solid var(--border-default), padding:24, display:flex, flex-direction:column, align-items:center, justify-content:center, gap:var(--space-4))
   - `.not-found-display` (404 큰 텍스트, fontSize:96, fontWeight:900, color:var(--text-tertiary), letter-spacing:-0.02em, margin:0, lineHeight:1.0)
   - `.not-found-message` (안내 문구, fontSize:18, fontWeight:600, color:var(--text-primary), margin:0, lineHeight:1.4) — text-title 토큰 매핑 (18px, weight 500-600). **본문 마지노선 16px 초과 ✓**
   - `.not-found-button` (버튼, height:var(--button-height) =44, padding:0 28px, border-radius:var(--radius-md), background:var(--accent-active), border:none, color:var(--text-on-accent), fontSize:16, fontWeight:700, cursor:pointer, font-family:inherit)
   - `.not-found-button:hover { background: var(--accent); }` (옵션 시연)
   - `.caption` (각 frame 하단 캡션 — 모드명/토큰/비즈 anchor 노출, 12px text-tertiary)
   - `.decision-summary` (하단 디자인 결정 요약 박스, background:var(--surface-raised), padding:20, border-radius:var(--radius-lg), color:var(--text-secondary), 16px text-body. `ul li` 안 텍스트 ≥ 14px 인라인 명시. 본문 텍스트는 ≥ 16px 룰 준수)
   - `.biz-anchors` (비즈 anchor 5건 박스, background:var(--surface-raised), padding:20, border-radius:var(--radius-lg), color:var(--text-secondary), 16px text-body)
3. `<body>` (다크가 기본 — `data-theme` 미부착) 내부:
   - `<h1>30 NotFoundPage · v0.1.1 재디자인 시안</h1>`
   - `<p>` 서브타이틀 — "redesign/30-not-found W1 · 11 라인 페이지 단일 sketch · design-system v0.1.1 토큰 적용 · NotFoundPage.tsx 변경 0 (W2 책임)"
   - `<h2>1. 다크 + 라이트 2 변형</h2>`
   - `<p class="vp-desc">` — "동일 페이지를 다크 (기본) 와 라이트 모드로 시연. 모바일 폭 480 컨테이너 시뮬레이션. 모바일/데스크톱 폰트 동일 (노안 룰)."
   - `<div class="row">`
     - `<div>`:
       - `<div class="frame-mobile">` (다크, data-theme 미부착):
         - `<p class="not-found-display">404</p>`
         - `<p class="not-found-message">페이지를 찾을 수 없습니다</p>`
         - `<button class="not-found-button" onclick="alert('sketch: navigate(/dashboard) 동작 시각화')">대시보드로 이동</button>`
       - `<p class="caption">` — "다크 · 404 색 var(--text-tertiary) · 버튼 var(--accent-active) · navigate('/dashboard')"
     - `<div>`:
       - `<div class="frame-mobile" data-theme="light">` (라이트):
         - 동일 마크업 (404 / 페이지를 찾을 수 없습니다 / 대시보드로 이동)
       - `<p class="caption">` — "라이트 · 404 색 var(--text-tertiary) #656d76 · 버튼 var(--accent-active) #0a52c4"
   - `<h2>2. 비즈 anchor 5건 (W2 TSX 변환 wave 1 byte 변경 0 보존)</h2>`
   - `<div class="biz-anchors">`:
     - `<ul>` 다섯 항목:
       1. `useNavigate()` hook (react-router-dom import line 1, line 3 호출)
       2. `navigate('/dashboard')` 라우팅 (button onClick line 8)
       3. "404" 텍스트 (line 6 `<p>` 내용)
       4. "페이지를 찾을 수 없습니다" 텍스트 (line 7 `<p>` 내용)
       5. "대시보드로 이동" 버튼 카피 (line 8 `<button>` 내용)
   - `<h2>3. 디자인 결정 요약</h2>`
   - `<div class="decision-summary">`:
     - `<ul>`:
       - **사용 토큰** — `--surface-page` (배경), `--text-primary` (본문), `--text-tertiary` (404 큰 텍스트), `--accent-active` (버튼 배경), `--text-on-accent` (버튼 텍스트), `--radius-md` (12, 버튼), `--space-4` (16, gap), `--button-height` (44)
       - **404 색 결정** — `--text-tertiary` (정보 없음 의미). **status-danger 금지** (404 는 에러가 아니라 정보 없음 성격, design-system §1.4 상태 색 의미 우선 룰)
       - **버튼 변형** — accent solid (var(--accent-active)). hover 시 var(--accent) 로 톤업
       - **폰트** — 404: 96px / weight 900 / lineHeight 1.0 (text-display 28px 초과 인라인 허용, 컨텍스트 §4 권장). 안내 문구: 18px / weight 600 (text-title) — 본문 마지노선 16px 초과 ✓. 버튼: 16px / weight 700 (text-body) — 본문 마지노선 16px 초과 ✓
       - **Spacing** — gap var(--space-4) =16. 모바일/데스크톱 동일 (정적 컨테이너 센터링이라 분기 불필요)
       - **Radius** — 버튼 var(--radius-md) =12
       - **모바일/데스크톱** — 폰트 동일, spacing 동일, 컨테이너 max-width 480 (모바일 시뮬레이션)
       - **alias 처리 옵션** — A. 풀-마이그레이션 (`--bg`/`--t1`/`--bg4` 모두 새 semantic 으로 교체) / B. alias 유지 (변경 최소화) / C. 하이브리드 (배경/텍스트 alias 유지 + 버튼 raw hex `#2563eb`/`#fff` 만 토큰 교체). **W2 사용자 컨펌 단계에서 선택**
   - `<h2>4. Negative gate (W2 변환 wave 가 의식할 룰)</h2>`
   - `<ul>` (text-body 사이즈):
     - 9 / 10 / 11 px fontSize 0건 (노안 마지노선 16 룰)
     - status-danger / status-fire 색 사용 0건 (404 는 에러가 아니라 정보 없음)
     - 이모지 0건 (feedback_tsx_wave_emoji_dot_gap.md)
     - linear-gradient 0건 (28-splash OQ #2 LOCKED 패턴 mirror — 단색 solid 만)
     - `style={...}` 인라인 0건 → W2 TSX 에서 Tailwind class 로 교체 (30-not-found.md §4 요구사항)

**HTML 작성 시 룰:**
- 단일 .html 파일 (외부 리소스 = Pretendard CDN 1건만)
- `<style>` 블록 안 `:root` 토큰 정의 → 카드 내부 마크업에서 `var(--...)` 만 사용 (10-cctv-info precedent verify gate mirror)
- 본문 어떤 텍스트도 9 / 10 / 11 px 사용 금지 (text-caption 12px 최저)
- 이모지 0건
- linear-gradient 0건
- 라이트 모드는 `data-theme="light"` attribute 로 frame-mobile 에 분기
- "design-system" 텍스트가 sketch HTML 본문 또는 메타에 등장 (verify gate)

**비즈 anchor 5건 명시:**
- §2 비즈 anchor 박스 안 `<ul>` 다섯 항목으로 모두 명시
- 캡션에 추가로 `useNavigate` / `/dashboard` 등 텍스트 노출 (grep verify gate 통과)

**파일 위치:** `cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` (평면 폴더, sketch/ 서브폴더 만들지 않음 — 28-splash/23-education/27-login/16-workshift 평면 패턴 mirror)

**금지 사항:**
- NotFoundPage.tsx Edit/Write 금지 (Read 만)
- App.tsx 변경 금지
- tokens.css / typography.css / design-system.md 변경 금지
- 30-not-found.md 변경 금지
- sketch/ 서브폴더 생성 금지 (평면 폴더 룰)
- wrangler 명령 금지 (CLAUDE.local.md)
- npm run deploy 금지
- W1 인덱스 markdown (wave-1-index.md 등) 작성 금지 — 페이지가 너무 단순해서 사용자 명시적 생략 지시
- W5 checklist markdown (wave-5-tsx-conversion-checklist.md 등) 작성 금지 — W2 책임

작성 후 자기 검수:
1. `test -f cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` PASS
2. `grep -c "404" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 3 (큰 텍스트 2회 + 캡션/요약 1회 이상)
3. `grep -c "페이지를 찾을 수 없습니다" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 2 (다크 + 라이트 2 변형)
4. `grep -c "대시보드로 이동" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 2 (다크 + 라이트 2 변형)
5. `grep -c "design-system" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 1
6. `grep -c "useNavigate" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 1
7. `grep -c "/dashboard" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 1
8. `grep -c "data-theme=\"light\"" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 1 (라이트 변형 증거)
9. `grep -c "var(--accent" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 1 (accent 토큰 사용 증거)
10. `grep -c "var(--text-tertiary)" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` ≥ 1 (404 색 토큰 사용 증거)
11. `grep -cE "status-danger|status-fire" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` = 0 OR 모두 negative gate 문구 안에만 등장 (404 의미 안 맞음 — 사용 금지 명시 negation 만 허용)
12. `grep -cE "font-size:\s*(9|10|11)px|fontSize:\s*(9|10|11)" cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` = 0 (노안 룰)
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/30-not-found/sketch.html && \
test "$(grep -c '404' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 3 && \
test "$(grep -c '페이지를 찾을 수 없습니다' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 2 && \
test "$(grep -c '대시보드로 이동' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 2 && \
test "$(grep -c 'design-system' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 1 && \
test "$(grep -c 'useNavigate' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 1 && \
test "$(grep -c '/dashboard' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 1 && \
test "$(grep -c 'data-theme="light"' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 1 && \
test "$(grep -c 'var(--accent' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 1 && \
test "$(grep -c 'var(--text-tertiary)' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -ge 1 && \
test "$(grep -cE 'font-size:[[:space:]]*(9|10|11)px|fontSize:[[:space:]]*(9|10|11)[^0-9]' cha-bio-safety/docs/redesign-context/30-not-found/sketch.html)" -eq 0 && \
test ! -e cha-bio-safety/docs/redesign-context/30-not-found/sketch && \
git diff --quiet cha-bio-safety/src/pages/NotFoundPage.tsx && \
git diff --quiet cha-bio-safety/src/App.tsx && \
git diff --quiet cha-bio-safety/docs/redesign-context/30-not-found/tokens.css && \
git diff --quiet cha-bio-safety/docs/redesign-context/30-not-found/typography.css && \
git diff --quiet cha-bio-safety/docs/redesign-context/30-not-found/design-system.md && \
git diff --quiet cha-bio-safety/docs/redesign-context/30-not-found/30-not-found.md</automated>
  </verify>
  <done>
sketch.html 단일 파일이 평면 폴더 (`cha-bio-safety/docs/redesign-context/30-not-found/sketch.html`) 에 작성됨. 다크 + 라이트 2 변형 (data-theme attribute) 시연. 본문 안내 문구 ≥ 16px, 404 큰 텍스트 ≥ 56px. 비즈 anchor 5건 (useNavigate / /dashboard / 404 / 페이지를 찾을 수 없습니다 / 대시보드로 이동) 모두 캡션 또는 본문에 명시. status-danger / status-fire 색 0건 (또는 negative gate negation 만). 9 / 10 / 11 px fontSize 0건. 디자인 결정 요약 섹션 + Negative gate 섹션 포함. NotFoundPage.tsx / App.tsx / tokens.css / typography.css / design-system.md / 30-not-found.md 1 byte 변경 0. sketch/ 서브폴더 생성 0.
  </done>
</task>

</tasks>

<verification>
- [ ] `test -f cha-bio-safety/docs/redesign-context/30-not-found/sketch.html` PASS
- [ ] sketch HTML 안 다크 + 라이트 2 변형 모두 시연 (data-theme="light" attribute 존재)
- [ ] 비즈 anchor 5건 (useNavigate / /dashboard / 404 / 페이지를 찾을 수 없습니다 / 대시보드로 이동) 모두 캡션 또는 본문에 텍스트 등장
- [ ] design-system v0.1.1 토큰 사용 증거 (`var(--accent...)` ≥ 1, `var(--text-tertiary)` ≥ 1)
- [ ] 노안 룰 준수 (9/10/11 px fontSize 0건)
- [ ] status-danger / status-fire 색 사용 0건 (또는 negative gate negation 문구 안에만 등장)
- [ ] 평면 폴더 룰 준수 (sketch/ 서브폴더 0)
- [ ] NotFoundPage.tsx / App.tsx / tokens.css / typography.css / design-system.md / 30-not-found.md 1 byte 변경 0 (`git diff --quiet` PASS)
</verification>

<success_criteria>
- redesign/30-not-found W1 sketch HTML 1 파일이 평면 폴더에 작성된다
- 사용자가 sketch HTML 을 브라우저에서 열어 다크 + 라이트 2 변형을 시각 확인할 수 있다
- 사용자 컨펌 후 W2 (TSX 변환) quick task 로 진행 가능한 상태가 된다
- W2 변환 wave 가 참조할 비즈 anchor 5건 / 토큰 매핑 가이드 / 디자인 결정 요약이 sketch HTML 안에 모두 박제되어 있다
- NotFoundPage.tsx / App.tsx / design-system 스냅샷 파일들 모두 1 byte 변경 0 보존
</success_criteria>

<output>
After completion, create `.planning/quick/260526-ucq-redesign-30-not-found-w1-sketch-notfound/260526-ucq-SUMMARY.md` summarizing:
- sketch.html 작성 결과 (라인 수, 다크/라이트 변형 시연 증거)
- 사용된 토큰 매핑 결정 (페이지 배경 / 404 색 / 버튼 / 폰트 / spacing / radius)
- 비즈 anchor 5건 sketch 안 등장 위치 (캡션 / 비즈 anchor 박스 / 디자인 결정 요약)
- W2 (TSX 변환) wave 진입 조건 (사용자 컨펌 대기) 및 alias 처리 옵션 A/B/C 중 사용자 선택 대기 명시
- 1 byte 변경 0 보존 증거 (NotFoundPage.tsx / App.tsx / tokens.css / typography.css / design-system.md / 30-not-found.md)
</output>
