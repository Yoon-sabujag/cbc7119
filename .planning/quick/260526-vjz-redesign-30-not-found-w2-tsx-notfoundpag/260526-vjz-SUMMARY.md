---
quick_id: 260526-vjz
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
tags:
  - redesign
  - 30-not-found
  - tsx-conversion
  - v0.1.1-tokens
  - tailwind-class
requirements:
  - REDESIGN-30-W2
dependency-graph:
  requires:
    - "260526-ucq (W1 sketch) — 옵션 A 풀-마이그레이션 결정 + token mapping 산출"
    - "cha-bio-safety/src/styles/tokens.css v0.1.1 (live)"
    - "cha-bio-safety/tailwind.config.js (theme.colors / spacing / fontSize 매핑)"
  provides:
    - "cha-bio-safety/src/pages/NotFoundPage.tsx (v0.1.1 토큰 + Tailwind class 통일)"
  affects:
    - "cha-bio-safety wildcard `*` 라우트 (App.tsx line 296) — UI 시각 변경, 라우팅 로직 무변경"
tech-stack:
  added: []
  patterns:
    - "단일 파일 atomic TSX 변환 (5번째 사례)"
    - "v0.1.1 semantic 토큰 풀-마이그레이션 (legacy alias 3종 → semantic 3종 + raw hex 2종 → token 2종)"
    - "Tailwind arbitrary value 노안 디스플레이 (text-[96px] / px-[28px])"
key-files:
  created: []
  modified:
    - "cha-bio-safety/src/pages/NotFoundPage.tsx (11 → 18 라인)"
decisions:
  - "옵션 A 풀-마이그레이션 채택 (W1 sketch 260526-ucq 사용자 컨펌) — legacy alias `--bg`/`--t1`/`--bg4` 와 raw hex `#2563eb`/`#fff` 모두 v0.1.1 semantic 으로 교체"
  - "404 색은 var(--text-tertiary) 사용 — design-system §1.4 의미 우선 룰 (404 = 정보 없음, status-danger 절대 금지)"
  - "404 fontSize 96px 는 Tailwind text-display (28px) 미적용, arbitrary text-[96px] 사용 (sketch.html line 189 verbatim)"
  - "메시지 weight 700 → 600 격상 (sketch line 198 reflect — 18px 격상에 따른 시각 무게 조정)"
  - "버튼 padding 좌우 28px 는 px-[28px] arbitrary (Tailwind spacing.7 = 32 와 4px 차이 — sketch line 205 verbatim 보존 위해 arbitrary 채택)"
  - "type='button' 추가 (defensive — form submit 방지, 비즈 anchor 미해당, 사용자 컨펌 불필요한 안전 패턴)"
metrics:
  duration: "2m 55s"
  completed: "2026-05-26T13:51:21Z"
  tasks_total: 1
  tasks_completed: 1
  files_changed: 1
  commits: 1
---

# Quick 260526-vjz: redesign/30-not-found W2 TSX NotFoundPage v0.1.1 변환 Summary

**One-liner:** NotFoundPage.tsx (wildcard `*` 라우트) 를 옵션 A 풀-마이그레이션으로 v0.1.1 semantic 토큰 + Tailwind class 통일하고 노안 룰 (404 56→96px / 메시지 16→18px / 버튼 14→16px) 적용한 1-commit atomic 변환.

## 실행 개요

- **단일 task / 단일 파일 / 단일 commit** — Plan 의 `<task>` 1건을 그대로 실행
- **변환 source:** W1 sketch (260526-ucq) 의 옵션 A 풀-마이그레이션 컨펌 결정
- **산출:** `cha-bio-safety/src/pages/NotFoundPage.tsx` 1 파일 (11 → 18 라인, 7라인 증가)
- **commit:** `624bb3f` (feat scope `quick-260526-vjz`)

## Before / After

### Before (11 라인 — 인라인 style 4개 + legacy alias 3종 + raw hex 2종)

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

### After (18 라인 — 인라인 style 0건, Tailwind class only)

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

## 토큰 마이그레이션 매핑 (옵션 A 풀-마이그레이션)

### Legacy alias → v0.1.1 semantic (3종)

| Before | After | 의미 |
|---|---|---|
| `var(--bg)` | `bg-surface-page` | 페이지 배경 |
| `var(--t1)` | `text-text-primary` | 본문 텍스트 (메시지에 적용 — 사실상 default) |
| `var(--bg4)` | `text-text-tertiary` | 404 색 (정보 없음 의미) |

### Raw hex → v0.1.1 토큰 (2종)

| Before | After | 의미 |
|---|---|---|
| `#2563eb` | `bg-accent-active` | 액션 버튼 배경 |
| `#fff` | `text-text-on-accent` | 액센트 위 텍스트 |

### 노안 룰 적용 (3건 격상)

| 항목 | Before | After | Tailwind |
|---|---|---|---|
| 404 디스플레이 | 56px | 96px | `text-[96px]` (arbitrary) |
| 메시지 | 16px / weight 700 | 18px / weight 600 | `text-title font-semibold` |
| 버튼 텍스트 | 14px | 16px | `text-body` |

### Layout class 변환

| Before (inline) | After (Tailwind) |
|---|---|
| `minHeight:'100dvh'` | `min-h-dvh` |
| `display:'flex'` + `flexDirection:'column'` | `flex flex-col` |
| `alignItems:'center'` + `justifyContent:'center'` | `items-center justify-center` |
| `gap:16` | `gap-4` |
| `margin:0` | `m-0` |
| `padding:'12px 28px'` (height 토큰화) | `h-button px-[28px]` |
| `borderRadius:12` | `rounded-md` |
| `border:'none'` | `border-none` |
| `cursor:'pointer'` | `cursor-pointer` |

## Tailwind arbitrary value 사용 사유

본 변환에서 arbitrary 2건은 모두 sketch.html verbatim 보존이 목적:

1. **`text-[96px]`** — 404 디스플레이.
   - Tailwind preset 최대치 `text-display` = 28px → 96px 미커버
   - sketch.html line 189 `font-size: 96px` verbatim 보존 위해 arbitrary 채택

2. **`px-[28px]`** — 버튼 좌우 padding.
   - Tailwind `spacing.7` = 32px, `spacing.6` = 24px → 28px 미커버 (4px 차이)
   - sketch.html line 205 `padding: 0 28px` verbatim 보존 위해 arbitrary 채택

## 비즈 anchor 보존 (7건, 1 byte 변경 0)

| # | Anchor | 위치 | 보존 확인 |
|---|---|---|---|
| 1 | `import { useNavigate } from 'react-router-dom'` | line 1 | PASS |
| 2 | `const navigate = useNavigate()` | line 4 | PASS |
| 3 | `navigate('/dashboard')` (인자 verbatim) | line 11 | PASS |
| 4 | 텍스트 `"404"` | line 7 | PASS |
| 5 | 텍스트 `"페이지를 찾을 수 없습니다"` | line 8 | PASS |
| 6 | 텍스트 `"대시보드로 이동"` | line 14 | PASS |
| 7 | `export default function NotFoundPage` (App.tsx lazy 호환) | line 3 | PASS |

## 보호 파일 7개 변경 0 byte 확인

`git diff --name-only HEAD~1 HEAD` 으로 7파일 모두 변경 0 검증 완료:

- `cha-bio-safety/src/App.tsx`
- `cha-bio-safety/src/styles/tokens.css`
- `cha-bio-safety/docs/redesign-context/30-not-found/sketch.html`
- `cha-bio-safety/docs/redesign-context/30-not-found/30-not-found.md`
- `cha-bio-safety/docs/redesign-context/30-not-found/design-system.md`
- `cha-bio-safety/docs/redesign-context/30-not-found/typography.css`
- `cha-bio-safety/tailwind.config.js`

## Verify Gate 결과

모든 자동 verify gate PASS:

### 비즈 anchor 양성 카운트 (각 ≥ 1)

- useNavigate import: 1
- useNavigate hook: 1
- navigate('/dashboard'): 1
- ">404<": 1
- "페이지를 찾을 수 없습니다": 1
- "대시보드로 이동": 1
- export default function NotFoundPage: 1

### v0.1.1 토큰 class 카운트 (각 ≥ 1)

- bg-surface-page: 1
- text-text-primary: 1
- text-text-tertiary: 1
- bg-accent-active: 1
- text-text-on-accent: 1

### Tailwind layout class 카운트 (각 ≥ 1)

- min-h-dvh: 1
- flex-col: 1
- gap-4: 1
- text-[96px]: 1
- h-button: 1
- rounded-md: 1

### Negative gate (각 = 0)

- legacy alias `var(--bg|t1|bg4)`: 0 PASS
- raw hex `#2563eb`: 0 PASS
- raw hex `#fff`: 0 PASS
- 인라인 `style={`: 0 PASS
- `status-danger` / `status-fire` / `text-danger` 등: 0 PASS
- 9/10/11px fontSize: 0 PASS
- `linear-gradient`: 0 PASS
- 이모지 (BMP+SMP 범위): 0 PASS

### 빌드 검증

- `npx tsc --noEmit`: 0 errors PASS

## Deviations from Plan

**없음.** Plan 의 변환 후 코드를 verbatim 적용, 모든 verify gate PASS, deviation rule 트리거 없음.

다만 실행 환경 측면에서 1건 부수 작업이 있었음 (deviation 아닌 환경 셋업):

- **환경 셋업:** `cha-bio-safety/node_modules` 미설치 상태였음. tsc 실행을 위해 `cd cha-bio-safety && npm install` 1회 실행 (564 패키지 설치). 이 작업은 commit 에 포함되지 않음 (node_modules 는 .gitignore). plan 의 verify gate 가 `npx tsc --noEmit` 을 요구하므로 환경 셋업은 verify 의 일부로 간주.

## 패턴 박제

### 단일 파일 atomic 변환 5번째 사례

| # | 사례 | commit | 라인 수 | 비고 |
|---|---|---|---|---|
| 1 | 28-splash | 4i9 | 1 파일 | 첫 atomic |
| 2 | 29-extinguisher-public | sfw | 1 파일 | 단순 페이지 |
| 3 | 10-cctv-info inline+var | cd01e96 | 1 파일 | 2-단계 분리 (1) |
| 4 | 10-cctv-info Tailwind | 831d719 | 1 파일 | 2-단계 분리 (2) |
| 5 | 30-not-found | **624bb3f** | 1 파일 | 본 케이스 (11 → 18 라인) |

### 옵션 A 풀-마이그레이션 패턴

W1 sketch 단계에서 legacy alias / raw hex 사용량을 먼저 카운트하고, 페이지 전체를 v0.1.1 semantic 으로 한 번에 교체. 부분 마이그레이션 (옵션 B) 대비 후속 grep 검색이 깨끗하고, design-system §1.4 의미 우선 룰 (404 = `text-tertiary`, status-danger 금지) 을 코드 레벨로 강제.

### Tailwind preset 미커버 시 arbitrary verbatim 보존

sketch.html 의 CSS 값을 verbatim 보존하는 것이 우선. preset 에 정확히 매칭되지 않는 경우 (예: 28px → spacing.7=32 / spacing.6=24 사이) `px-[28px]` arbitrary 로 1 byte 정확 보존. preset 으로 근사하면 후속 시각 검수에서 deviation 발견되어 재작업.

## 후속 작업

- 사용자가 `redesign/30-not-found` 브랜치에서 main 머지 → cbc7119-preview 자동 배포
- 시각 검증: `cbc7119-preview.pages.dev/anything-not-existing` 접속 → 다크/라이트 모드 양쪽에서 404 표시
- 버튼 클릭 → `/dashboard` 라우팅 작동 확인
- 노안 룰 시각 검증: 안내문/버튼 모두 16px 이상

## Self-Check: PASSED

### Files

- FOUND: `cha-bio-safety/src/pages/NotFoundPage.tsx` (modified, 18 lines)

### Commits

- FOUND: `624bb3f` — `feat(quick-260526-vjz): redesign/30-not-found W2 TSX NotFoundPage v0.1.1 token migration`
