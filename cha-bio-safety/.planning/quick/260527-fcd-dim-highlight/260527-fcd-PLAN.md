---
phase: 260527-fcd-dim-highlight
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html
  - src/pages/InspectionPage.tsx
autonomous: false
requirements:
  - 260527-fcd-01
tags:
  - redesign
  - inspection-page
  - mobile-only
  - design-system-v0.1.2

must_haves:
  truths:
    - "시안 HTML 이 사용자에게 모바일 카테고리 카드의 Old vs New 반전을 시각적으로 비교 가능하게 보여준다"
    - "시안 HTML 이 완료 카드 safe-bg 유지 여부(옵션 A 제거 / 옵션 B 유지) 두 가지를 별도 행으로 제시한다"
    - "사용자가 시안을 보고 옵션 A/B 중 하나를 선택한 뒤에야 TSX 수정이 시작된다"
    - "TSX 수정은 모바일 카드 cardClass 5183~5189 한 곳만 변경한다 (미시작 opacity-60 제거, 완료 opacity-50 추가, safe-bg 는 선택 옵션에 따름)"
    - "데스크톱 카드 (line 5820~5867) 와 getCatBarClass (line 111~118) 는 byte-level 무수정"
  artifacts:
    - path: ".planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html"
      provides: "Old vs New 반전 시안 + 옵션 A/B 비교"
      contains: "Old (현재)"
    - path: "src/pages/InspectionPage.tsx"
      provides: "모바일 카테고리 카드 cardClass 반전 반영"
      contains: "opacity-50"
  key_links:
    - from: "sketch/card-emphasis-reversal.html"
      to: "src/pages/InspectionPage.tsx (mobile cardClass, line 5183-5189)"
      via: "사용자 승인 후 cardClass 인라인 수정"
      pattern: "opacity-50"
---

<objective>
모바일 점검 페이지 카테고리 카드의 강조 로직을 반전한다. 현재는 미시작 카드(`doneCnt === 0`)가 `opacity-60` 으로 어둡게 표시되고, 완료 카드(`allDone`)가 `bg-safe-bg/40` 으로 강조된다 — 사용자가 행동해야 하는 항목을 어둡게 표시하는 모순. 새 룰은 미시작/진행중 = 강조(opacity 100), 완료 = dim(opacity-50) 으로 행동 필요 항목에 시선이 가도록 반전한다.

Purpose: §6.1 Progress Color Rule (직전 redesign/egj 작업)과 같은 철학 — 시선과 색을 "필요한 행동" 에 맞춘다. v0.1.2 design-system 후보 룰의 시각 검증.

Output:
- Sketch HTML (mobile 카드 6 케이스 + Old/New 좌우 비교 + 완료 옵션 A/B 두 행)
- 사용자 승인 + 옵션 선택 (A: safe-bg 제거 / B: safe-bg 유지)
- InspectionPage.tsx 모바일 cardClass 5183~5189 만 수정
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@../../../CLAUDE.local.md
@.planning/STATE.md
@docs/redesign-context/01-dashboard/design-system.md
@src/pages/InspectionPage.tsx

<critical_rules>
## 워크트리 규칙 (CLAUDE.local.md)
- **wrangler 명령 절대 금지** (이 워크트리에서 deploy 자체가 deny 됨)
- **`npm run deploy` 금지** (직원 도메인으로 가는 경로)
- **시안 HTML 먼저** — TSX 직접 적용 금지. Task 2 checkpoint blocking.
- 운영 PWA 버그 수정은 20260328 워크트리에서 — 여긴 디자인 격리 리포 (cbc7119-preview 자동 배포)

## 디자인 규칙 (재차 강제)
- **데스크톱 카드 (InspectionPage.tsx line 5820~5867) 절대 수정 금지** — 사용자 명시. opacity 분기 자체가 모바일에만 적용됨. 데스크톱은 `isSel ? 'border-2 border-accent ring-2 ring-accent/20' : 'border-border-default'` 만 사용.
- **getCatBarClass (line 111~118) 무수정** — §6.1 색바 룰 유지 (회색 → 노랑 → 파랑 → 초록). v0.1.2 반전과 별개.
- **CATEGORY_GROUPS / CATEGORY_ICONS / INSPECT_RESULT_OPTIONS / RESULT_ICONS / ALL_RESULT_OPTIONS 등 다른 정의 무수정**.
- 사용자 명시: "데스크톱 카드는 제외 — opacity 분기 자체가 모바일에만 적용".
</critical_rules>

<interfaces>
<!-- InspectionPage.tsx 에서 모바일 카드 렌더에 사용하는 식별자 (line ~5155-5210 발췌). 시안과 TSX 모두 이 시그니처를 그대로 따른다. -->

```ts
// line 110-118 — 좌측 3px 색바 클래스 (무수정 유지)
function getCatBarClass(total: number, doneCnt: number): string {
  if (total === 0) return ''
  const pct = (doneCnt / total) * 100
  if (pct === 0)   return 'bg-text-tertiary/40'   // 회색
  if (pct < 50)    return 'bg-warning-bar'         // 노랑
  if (pct < 100)   return 'bg-accent'              // 파랑
  return 'bg-safe-bar'                             // 초록
}

// line ~5179-5189 — 현재 cardClass (변경 대상)
const allDone  = total > 0 && doneCnt >= total
const hasItems = total > 0 || g.categories.includes('화재수신반')
const cardClass = [
  'relative bg-surface-raised border border-border-default rounded-md',
  'px-2.5 py-2.5 flex items-start gap-1.5 overflow-hidden min-h-[86px] box-border transition-all duration-150',
  !hasItems ? 'opacity-[0.38] cursor-default' : 'cursor-pointer hover:border-border-strong hover:-translate-y-px',
  hasItems && total > 0 && doneCnt === 0 ? 'opacity-60' : '',   // ← 제거 대상
  allDone ? 'bg-safe-bg/40 border-safe-bar/40' : '',             // ← 옵션 A/B 분기
].filter(Boolean).join(' ')
```

## 반전 룰 (v0.1.2 후보)

| 상태               | 판정 조건                              | 현재 (v0.1.1)                  | 새 룰 (v0.1.2 후보)                                  |
|--------------------|----------------------------------------|--------------------------------|------------------------------------------------------|
| 체크포인트 0       | `!hasItems`                            | `opacity-[0.38]` disabled       | **변화 없음** (계속 disabled)                         |
| 미시작 (0%)        | `hasItems && total > 0 && doneCnt===0` | `opacity-60` (어둡게)           | **opacity 100** (강조 — 행동 필요)                    |
| 진행중 (0<n<total) | `doneCnt > 0 && !allDone`              | opacity 100 + `text-warning`    | **변화 없음** (계속 강조)                             |
| 완료 (100%)        | `allDone`                              | `bg-safe-bg/40 border-safe-bar/40` (강조) | **opacity-50** + 옵션 A(safe-bg 제거) / B(유지) |

## 시각 토큰 (시안 인라인용)

```
--surface-page:    #0a0d12
--surface-raised:  #1a1f27
--border-default:  #2d3340
--border-strong:   #404857
--text-primary:    #f0f3f8
--text-secondary:  #c9d1d9
--text-tertiary:   #8b949e
--safe:            #22c55e
--safe-bar:        #16a34a
--safe-bg:         rgba(34,197,94,0.13)
--warning:         #f59e0b
--warning-bar:     #f59e0b
--accent:          #3b82f6
```

## §6.1 4색 (carBar)

- `bar-grey`  = `--text-tertiary` @ 0.4 alpha  → 미시작
- `bar-warn`  = `--warning-bar`                → 1~49%
- `bar-blue`  = `--accent`                     → 50~99%
- `bar-safe`  = `--safe-bar`                   → 100%
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Sketch HTML — Old vs New 모바일 카테고리 카드 반전 비교 + 옵션 A/B</name>
  <files>.planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html</files>
  <action>
Standalone HTML 시안을 생성한다. 외부 의존성 0 — 인라인 CSS, 인라인 SVG 아이콘 (또는 단순 도형), 인라인 토큰 hex.

## 구조

```
<!DOCTYPE html>
<html lang="ko"> <head> <meta charset="utf-8">
  <title>모바일 카테고리 카드 — 강조 반전 시안 (v0.1.2)</title>
  <style>
    :root {
      --surface-page:    #0a0d12;
      --surface-raised:  #1a1f27;
      --border-default:  #2d3340;
      --border-strong:   #404857;
      --text-primary:    #f0f3f8;
      --text-secondary:  #c9d1d9;
      --text-tertiary:   #8b949e;
      --safe:            #22c55e;
      --safe-bar:        #16a34a;
      --safe-bg:         rgba(34,197,94,0.13);
      --warning:         #f59e0b;
      --warning-bar:     #f59e0b;
      --accent:          #3b82f6;
    }
    body { margin:0; padding:24px; background:var(--surface-page); color:var(--text-primary);
           font-family: -apple-system, "Noto Sans KR", sans-serif; }
    h1 { font-size:18px; margin:0 0 4px; }
    .meta { font-size:12px; color:var(--text-tertiary); margin-bottom:24px; }
    .compare { display:grid; grid-template-columns:1fr 1fr; gap:24px; max-width:880px; margin:0 auto; }
    .panel { background:#11151c; border:1px solid var(--border-default); border-radius:8px; padding:16px; }
    .panel h2 { font-size:14px; margin:0 0 4px; color:var(--text-secondary); }
    .panel .tag { display:inline-block; font-size:11px; padding:2px 6px; border-radius:3px;
                  background:rgba(255,255,255,.08); color:var(--text-tertiary); margin-bottom:12px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    /* 모바일 카드 — InspectionPage.tsx line 5183-5189 재현 */
    .card { position:relative; background:var(--surface-raised); border:1px solid var(--border-default);
            border-radius:6px; padding:10px; display:flex; align-items:flex-start; gap:6px;
            overflow:hidden; min-height:86px; box-sizing:border-box;
            transition:all 150ms; }
    .card .bar { position:absolute; left:0; top:0; bottom:0; width:3px; }
    .card .bar.grey  { background:rgba(139,148,158,0.4); }
    .card .bar.warn  { background:var(--warning-bar); }
    .card .bar.blue  { background:var(--accent); }
    .card .bar.safe  { background:var(--safe-bar); }
    .card .icon { width:20px; height:20px; color:var(--text-secondary); flex-shrink:0; }
    .card .body { flex:1; min-width:0; display:flex; flex-direction:column; }
    .card .label { font-size:12px; font-weight:600; color:var(--text-primary); line-height:1.3; }
    .card .count { font-size:12px; margin-top:2px; font-weight:500; }
    .count.grey { color:var(--text-tertiary); }
    .count.warn { color:var(--warning); }
    .count.safe { color:var(--safe); font-weight:bold; }
    /* 상태 변종 */
    .card.disabled  { opacity:0.38; cursor:default; }
    .card.dim-old   { opacity:0.6; }                   /* 현재 미시작 dim */
    .card.bg-old    { background:var(--safe-bg); border-color:rgba(22,163,74,.4); }  /* 현재 완료 강조 */
    .card.dim-new   { opacity:0.5; }                    /* 새 완료 dim */
    /* 옵션 비교 */
    .options { margin-top:16px; padding-top:16px; border-top:1px dashed var(--border-default); }
    .options h3 { font-size:12px; margin:0 0 8px; color:var(--text-secondary); font-weight:600; }
    .options .opt-label { font-size:11px; color:var(--text-tertiary); margin:8px 0 4px; }
    .legend { max-width:880px; margin:24px auto 0; padding:12px 16px; background:#11151c;
              border:1px solid var(--border-default); border-radius:6px; font-size:12px; color:var(--text-tertiary); }
    .legend strong { color:var(--text-secondary); }
    .legend ul { margin:6px 0 0; padding-left:18px; }
  </style>
</head><body>
  <h1>모바일 카테고리 카드 — 강조 반전 시안 (v0.1.2 후보)</h1>
  <div class="meta">InspectionPage.tsx line 5155-5210 모바일 카드 / 데스크톱 (5820-5867) 제외 / 색바 §6.1 유지</div>

  <div class="compare">

    <!-- ─────────────────────── OLD ─────────────────────── -->
    <div class="panel">
      <h2>OLD — v0.1.1 (현재)</h2>
      <span class="tag">미시작 dim / 완료 강조 — 행동 필요 항목이 어둡다</span>
      <div class="grid">
        <!-- 1. 미시작 (0/12) — 현재 opacity-60 -->
        <div class="card dim-old">
          <div class="bar grey"></div>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/></svg>
          <div class="body">
            <div class="label">소화기</div>
            <div class="label">점검</div>
            <div class="count grey">12개</div>
          </div>
        </div>
        <!-- 2. 진행중 1~49% (3/12) -->
        <div class="card">
          <div class="bar warn"></div>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          <div class="body">
            <div class="label">유도등</div>
            <div class="count warn">3/12</div>
          </div>
        </div>
        <!-- 3. 진행중 50~99% (8/12) -->
        <div class="card">
          <div class="bar blue"></div>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,3 3,21 21,21"/></svg>
          <div class="body">
            <div class="label">방화셔터</div>
            <div class="count warn">8/12</div>
          </div>
        </div>
        <!-- 4. 완료 (12/12) — 현재 bg-safe -->
        <div class="card bg-old">
          <div class="bar safe"></div>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7"/></svg>
          <div class="body">
            <div class="label">소화전</div>
            <div class="count safe">✓ 완료</div>
          </div>
        </div>
        <!-- 5. 체크포인트 없음 (total=0) -->
        <div class="card disabled">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <div class="body">
            <div class="label">전실제연댐퍼</div>
            <div class="count grey">없음</div>
          </div>
        </div>
        <!-- 6. 화재수신반 (특수) -->
        <div class="card">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
          <div class="body">
            <div class="label">화재수신반</div>
            <div class="count grey">기록</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─────────────────────── NEW ─────────────────────── -->
    <div class="panel">
      <h2>NEW — v0.1.2 (반전)</h2>
      <span class="tag">미시작 강조 / 완료 dim — 시선이 "필요한 행동" 으로</span>
      <div class="grid">
        <!-- 1. 미시작 — opacity 100 (강조) -->
        <div class="card">
          <div class="bar grey"></div>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/></svg>
          <div class="body">
            <div class="label">소화기</div>
            <div class="label">점검</div>
            <div class="count grey">12개</div>
          </div>
        </div>
        <!-- 2. 진행중 1~49% — 변화 없음 -->
        <div class="card">
          <div class="bar warn"></div>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          <div class="body">
            <div class="label">유도등</div>
            <div class="count warn">3/12</div>
          </div>
        </div>
        <!-- 3. 진행중 50~99% — 변화 없음 -->
        <div class="card">
          <div class="bar blue"></div>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,3 3,21 21,21"/></svg>
          <div class="body">
            <div class="label">방화셔터</div>
            <div class="count warn">8/12</div>
          </div>
        </div>
        <!-- 4. 완료 — 옵션 A (opacity-50 만, safe-bg 제거) -->
        <div class="card dim-new">
          <div class="bar safe"></div>
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 13l4 4L19 7"/></svg>
          <div class="body">
            <div class="label">소화전</div>
            <div class="count safe">✓ 완료</div>
          </div>
        </div>
        <!-- 5. 체크포인트 없음 — 변화 없음 -->
        <div class="card disabled">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <div class="body">
            <div class="label">전실제연댐퍼</div>
            <div class="count grey">없음</div>
          </div>
        </div>
        <!-- 6. 화재수신반 — 변화 없음 -->
        <div class="card">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
          <div class="body">
            <div class="label">화재수신반</div>
            <div class="count grey">기록</div>
          </div>
        </div>
      </div>

      <!-- 옵션 A vs B: 완료 카드 safe-bg 유지 여부 -->
      <div class="options">
        <h3>완료 카드 — 옵션 비교</h3>

        <div class="opt-label">옵션 A — opacity-50 만 적용 (safe-bg 제거, 깔끔)</div>
        <div class="grid" style="grid-template-columns: 1fr 1fr;">
          <div class="card dim-new">
            <div class="bar safe"></div>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/></svg>
            <div class="body">
              <div class="label">소화전</div>
              <div class="count safe">✓ 완료</div>
            </div>
          </div>
          <div class="card dim-new">
            <div class="bar safe"></div>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/></svg>
            <div class="body">
              <div class="label">유도등</div>
              <div class="count safe">✓ 완료</div>
            </div>
          </div>
        </div>

        <div class="opt-label" style="margin-top:12px;">옵션 B — opacity-50 + bg-safe-bg/40 유지 (완료 식별 강함)</div>
        <div class="grid" style="grid-template-columns: 1fr 1fr;">
          <div class="card dim-new bg-old">
            <div class="bar safe"></div>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/></svg>
            <div class="body">
              <div class="label">소화전</div>
              <div class="count safe">✓ 완료</div>
            </div>
          </div>
          <div class="card dim-new bg-old">
            <div class="bar safe"></div>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/></svg>
            <div class="body">
              <div class="label">유도등</div>
              <div class="count safe">✓ 완료</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="legend">
    <strong>변경 요약</strong>
    <ul>
      <li><strong>미시작 (0%)</strong>: opacity-60 → opacity 100 (강조)</li>
      <li><strong>완료 (100%)</strong>: bg-safe-bg/40 강조 → opacity-50 dim (+ 옵션 A/B 로 safe-bg 선택)</li>
      <li><strong>색바 (좌측 3px)</strong>: §6.1 4색 그대로 (회색 → 노랑 → 파랑 → 초록)</li>
      <li><strong>데스크톱</strong>: 변경 없음. opacity 분기 자체가 모바일에만 적용됨.</li>
    </ul>
  </div>

</body></html>
```

## 시안 작성 룰

- 외부 CDN/폰트 의존 없음 — 인라인 CSS 만.
- SVG 아이콘은 lucide 흉내낸 단순 stroke 도형으로 충분 (시안 목적).
- 카드 폭은 grid 2열 기본 — 모바일 실제 grid-cols-3 와 다르지만 시안은 비교가 목적이므로 2 열이 더 잘 보임. 시안 코드에 주석 명시 권장.
- 6 케이스 모두 표시: 미시작 / 진행중 1~49 / 진행중 50~99 / 완료 / 체크포인트 없음 / 화재수신반.
- Old / New 좌우 비교 + New 패널 안에 완료 옵션 A/B 별도 행.
- 사용자가 ⌘+O 또는 더블클릭으로 파일 열 수 있어야 함 (file:// 직접 로드 가능).
  </action>
  <verify>
    <automated>
test -f .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q 'opacity:0.6' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q 'opacity:0.5' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q 'OLD' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q 'NEW' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q '옵션 A' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q '옵션 B' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q '화재수신반' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q '#22c55e' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q '#f59e0b' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
grep -q '#3b82f6' .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html && \
echo SKETCH_OK
    </automated>
  </verify>
  <done>
sketch/card-emphasis-reversal.html 파일이 존재하고, OLD/NEW 두 패널 + 6 카드 케이스 (미시작/진행중 1~49/진행중 50~99/완료/체크포인트 없음/화재수신반) + 완료 옵션 A/B 비교 행이 모두 들어있다. opacity:0.6 (old dim) / opacity:0.5 (new dim) / §6.1 4색 hex 가 모두 검출된다.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: 사용자 승인 + 완료 카드 safe-bg 옵션 선택</name>
  <what-built>
sketch/card-emphasis-reversal.html — Old vs New 모바일 카테고리 카드 강조 반전 시안 + 완료 옵션 A(opacity-50 만) / B(opacity-50 + bg-safe-bg/40 유지) 비교.
  </what-built>
  <how-to-verify>
1. 파일 열기:
   ```
   open .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html
   ```
2. 좌측 OLD 패널 — 현재 운영 상태:
   - 미시작 카드(소화기 12개)가 어둡게 (opacity 0.6) 표시되는지
   - 완료 카드(소화전 ✓ 완료)에 초록 배경(safe-bg) 이 깔린지
3. 우측 NEW 패널 — 반전 후:
   - 미시작 카드가 opacity 100 으로 또렷한지
   - 완료 카드가 opacity 0.5 로 흐릿한지
4. NEW 패널 하단 옵션 A/B 비교:
   - 옵션 A: opacity-50 만 적용한 모습 (배경 없음, 색바만 초록)
   - 옵션 B: opacity-50 + safe-bg/40 유지 (배경 살짝 초록 + 흐릿)
   - 둘 중 어느 쪽이 "완료 = 행동 불필요" 의도에 맞는지 선택
5. 6 케이스가 모두 표시되고 (특히 화재수신반 "기록" / 체크포인트 없음 "없음") 데스크톱은 시안에 안 들어가는 게 맞는지 확인
  </how-to-verify>
  <resume-signal>
다음 중 하나로 답:
- "옵션 A 로 진행" (opacity-50 만 — safe-bg 제거, cardClass 에서 `bg-safe-bg/40 border-safe-bar/40` 통째 제거)
- "옵션 B 로 진행" (opacity-50 추가 + safe-bg 유지 — cardClass `bg-safe-bg/40 border-safe-bar/40 opacity-50`)
- 또는 수정 요청 (시안 문제점 명시)
  </resume-signal>
</task>

<task type="auto" tdd="false">
  <name>Task 3: TSX 적용 — InspectionPage.tsx 모바일 cardClass 반전</name>
  <files>src/pages/InspectionPage.tsx</files>
  <behavior>
    - 모바일 카드: 미시작(`doneCnt === 0`) 카드에 더 이상 `opacity-60` 이 붙지 않는다 — 강조 유지
    - 모바일 카드: 완료(`allDone`) 카드에 `opacity-50` 이 붙는다 — dim
    - 옵션 A 선택 시: `bg-safe-bg/40 border-safe-bar/40` 제거
    - 옵션 B 선택 시: `bg-safe-bg/40 border-safe-bar/40` 유지 + `opacity-50` 추가
    - 데스크톱 카드(5820~5867) byte 단위 무변동
    - getCatBarClass(110~118) byte 단위 무변동
    - CATEGORY_GROUPS / CATEGORY_ICONS / INSPECT_RESULT_OPTIONS / RESULT_ICONS / ALL_RESULT_OPTIONS byte 단위 무변동
  </behavior>
  <action>
**전제:** Task 2 에서 옵션 A 또는 B 가 명시적으로 선택되었음. 옵션 미선택 상태로 Task 3 진입 금지.

## 수정 위치 — 단 한 곳

`src/pages/InspectionPage.tsx` line 5183-5189 의 `cardClass` 배열.

## 변경 전 (현재)

```tsx
const cardClass = [
  'relative bg-surface-raised border border-border-default rounded-md',
  'px-2.5 py-2.5 flex items-start gap-1.5 overflow-hidden min-h-[86px] box-border transition-all duration-150',
  !hasItems ? 'opacity-[0.38] cursor-default' : 'cursor-pointer hover:border-border-strong hover:-translate-y-px',
  hasItems && total > 0 && doneCnt === 0 ? 'opacity-60' : '',
  allDone ? 'bg-safe-bg/40 border-safe-bar/40' : '',
].filter(Boolean).join(' ')
```

## 변경 후 — 옵션 A (safe-bg 제거)

```tsx
const cardClass = [
  'relative bg-surface-raised border border-border-default rounded-md',
  'px-2.5 py-2.5 flex items-start gap-1.5 overflow-hidden min-h-[86px] box-border transition-all duration-150',
  !hasItems ? 'opacity-[0.38] cursor-default' : 'cursor-pointer hover:border-border-strong hover:-translate-y-px',
  allDone ? 'opacity-50' : '',
].filter(Boolean).join(' ')
```

(미시작 라인 통째 제거 + 완료 라인의 bg/border 제거 + opacity-50 추가 → 4 라인이 됨)

## 변경 후 — 옵션 B (safe-bg 유지 + dim)

```tsx
const cardClass = [
  'relative bg-surface-raised border border-border-default rounded-md',
  'px-2.5 py-2.5 flex items-start gap-1.5 overflow-hidden min-h-[86px] box-border transition-all duration-150',
  !hasItems ? 'opacity-[0.38] cursor-default' : 'cursor-pointer hover:border-border-strong hover:-translate-y-px',
  allDone ? 'bg-safe-bg/40 border-safe-bar/40 opacity-50' : '',
].filter(Boolean).join(' ')
```

(미시작 라인 통째 제거 + 완료 라인에 opacity-50 추가만)

## Edit 도구 사용 가이드

Edit 도구의 `old_string` 은 변경 전 5 라인 전체를 그대로 복사, `new_string` 은 선택된 옵션의 4 라인을 작성. context 4 라인이 unique 하므로 추가 컨텍스트 불필요.

## 절대 건드리지 말 것

1. `getCatBarClass` (line 110-118) — §6.1 색바 룰 유지
2. 데스크톱 카드 (line 5820-5867) — 사용자 명시: opacity 분기 자체가 모바일에만 적용
3. CATEGORY_GROUPS / CATEGORY_ICONS / INSPECT_RESULT_OPTIONS / ALL_RESULT_OPTIONS / RESULT_ICONS 정의
4. `text-warning` / `text-safe font-bold` count 텍스트 클래스 (line 5201) — 이미 §6.1 룰에 맞음
5. allDone / hasItems / doneCnt 계산식
6. barClass = getCatBarClass(...) 호출 및 색바 렌더 (line 5195)

## git diff 검증

수정 후 다음으로 데스크톱 미변경 확인:
```bash
git diff src/pages/InspectionPage.tsx | grep -E '^[+-]' | grep -v '^\+\+\+\|^---'
```

출력에 `cardClass` 영역 한 곳 (~5 라인 → 4 라인 또는 4 라인 → 4 라인) 외에 다른 hunk 가 없어야 함. 특히 line 5820 근처 데스크톱 hunk 가 나오면 즉시 롤백 후 재시도.
  </action>
  <verify>
    <automated>
# 1) TypeScript 컴파일 오류 없는지
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npx tsc --noEmit -p . 2>&1 | grep -E "src/pages/InspectionPage.tsx" | head -5
# (출력 없으면 OK — InspectionPage 관련 새 에러 없음)

# 2) 미시작 opacity-60 제거 확인 (있으면 안 됨)
! grep -n "doneCnt === 0 ? 'opacity-60'" src/pages/InspectionPage.tsx && echo "OPACITY_60_REMOVED"

# 3) allDone 라인에 opacity-50 있는지
grep -n "allDone ? .*opacity-50" src/pages/InspectionPage.tsx && echo "OPACITY_50_PRESENT"

# 4) 데스크톱 카드 영역 변동 없는지 — diff 에 5820~5867 라인 hunk 없어야
git diff src/pages/InspectionPage.tsx | awk '/^@@/ {match($0,/\+([0-9]+)/,m); ln=m[1]} ln>=5820 && ln<=5867 && /^[+-]/ {print "DESKTOP_TOUCHED:"$0; found=1} END {if (!found) print "DESKTOP_UNTOUCHED"}'

# 5) getCatBarClass 무변동 — 110~118 영역 diff 없어야
git diff src/pages/InspectionPage.tsx | awk '/^@@/ {match($0,/\+([0-9]+)/,m); ln=m[1]} ln>=110 && ln<=118 && /^[+-]/ {print "GETCATBARCLASS_TOUCHED:"$0; found=1} END {if (!found) print "GETCATBARCLASS_UNTOUCHED"}'

# 6) build smoke (선택적, vite tsc 통과 확인)
# cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npm run build 2>&1 | tail -20
    </automated>
  </verify>
  <done>
- `grep "doneCnt === 0 ? 'opacity-60'"` 결과 없음 (미시작 dim 제거됨)
- `grep "allDone ? .*opacity-50"` 결과 있음 (완료 dim 적용됨)
- `git diff` 가 데스크톱 카드 (5820~5867) 및 getCatBarClass (110~118) 영역에 hunk 없음
- TypeScript 새 에러 없음
- 선택된 옵션 (A 또는 B) 의 형태로 cardClass 가 4 라인 또는 4 라인으로 정리됨
  </done>
</task>

</tasks>

<verification>
Phase-level 검증:

1. **시안 존재 + 사용자 승인**
   ```bash
   test -f .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html
   ```

2. **TSX 미시작 dim 제거**
   ```bash
   ! grep -q "doneCnt === 0 ? 'opacity-60'" src/pages/InspectionPage.tsx
   ```

3. **TSX 완료 dim 적용**
   ```bash
   grep -q "allDone ? .*opacity-50" src/pages/InspectionPage.tsx
   ```

4. **데스크톱 카드 무변동**
   ```bash
   git diff src/pages/InspectionPage.tsx -- | awk '/^@@/ {match($0,/\+([0-9]+)/,m); ln=m[1]} ln>=5820 && ln<=5867 && /^[+-]/ {exit 1}'
   ```

5. **getCatBarClass 무변동**
   ```bash
   git diff src/pages/InspectionPage.tsx -- | awk '/^@@/ {match($0,/\+([0-9]+)/,m); ln=m[1]} ln>=110 && ln<=118 && /^[+-]/ {exit 1}'
   ```

6. **TypeScript 신규 에러 없음**
   ```bash
   npx tsc --noEmit -p . 2>&1 | grep "src/pages/InspectionPage.tsx" | wc -l   # 0 이어야 함
   ```
</verification>

<success_criteria>
- sketch/card-emphasis-reversal.html 이 Old/New + 옵션 A/B 비교를 모두 보여준다
- 사용자가 옵션 A 또는 B 를 선택한 뒤에야 TSX 가 수정된다
- InspectionPage.tsx 모바일 cardClass 만 수정되고 데스크톱/getCatBarClass/기타 정의는 byte 단위 무변동
- TypeScript 신규 에러 0
- 결과적으로 모바일 InspectionPage 에서 미시작 카드는 또렷하게, 완료 카드는 흐릿하게 보인다
</success_criteria>

<output>
After completion, create `.planning/quick/260527-fcd-dim-highlight/260527-fcd-SUMMARY.md` documenting:
- 사용자가 선택한 옵션 (A 또는 B)
- 최종 cardClass 코드 (변경 후 4 라인)
- git diff 요약 (몇 라인 변경, 어떤 영역 무변동인지)
- v0.1.2 design-system.md 업데이트 필요 여부 (별도 작업으로 분리 권고)
</output>
