---
phase: 260527-tb3-legalpage-sweep-emoji-8-lucide-4
plan: 01
subsystem: redesign/submission-ppt
tags: [legal-page, emoji-sweep, color-token, lucide, design-system]
requires:
  - submission-ppt W1~W9 (production track) 완료 상태
provides:
  - LegalPage.tsx §7.1 (Iconography) 통과 — emoji 0
  - LegalPage.tsx §2.3 (색 토큰) 통과 — 비표준 토큰 0
affects:
  - src/pages/LegalPage.tsx (단일)
tech-stack:
  added: []
  patterns:
    - Unicode emoji → Lucide React 아이콘 컴포넌트
    - "string return → ReactNode return (IIFE 자연 type widen)"
    - "border + border-{color} 통째 제거 (pill 옵션 1)"
key-files:
  created:
    - .planning/quick/260527-tb3-legalpage-sweep-emoji-8-lucide-4/sketch/legalpage-sweep.html
  modified:
    - src/pages/LegalPage.tsx
decisions:
  - "L538 IIFE return 처리: 방법 A (JSX fragment 직접 반환, IIFE 타입 자연 widen 으로 ReactNode)"
  - "옵션 B — 저장 버튼 dirty 시 bg-warning-bg text-warning (outline 톤, pill 과 일관)"
  - "옵션 1 — pill border 통째 제거 (border 클래스 + border-{color} 모두 제거)"
  - "Save 아이콘 동반 — L599 텍스트 좌측에 Lock 패턴과 동일 align-text-bottom + mr-1"
metrics:
  duration: "약 10분 (Task 3 단독 실행)"
  completed-date: 2026-05-27
  tasks-completed: "2/3 (Task 1 sketch d542f58, Task 2 checkpoint resolved, Task 3 47b9088)"
  files-modified: 1
  lines-changed: "14 ins / 14 del (replacement only)"
---

# Phase 260527-tb3 Plan 01: LegalPage emoji + 색 토큰 sweep Summary

LegalPage.tsx (submission-ppt 트랙 W1~W9 완료 페이지) 의 §7.1 Iconography + §2.3 색 토큰 룰 enforce — 잔존 unicode emoji 8곳 → Lucide 아이콘 + 비표준 색 토큰 4곳 + 보너스 L1022 까지 sweep. 비즈니스 로직 / inline style 141곳 / 다른 파일 변경 0 byte.

## User Decisions (Task 2 checkpoint)

| ID  | 선택지                                                              | 결정                                  |
| --- | ------------------------------------------------------------------- | ------------------------------------- |
| (a) | emoji → Lucide 매핑                                                 | OK                                    |
| (b) | 저장 버튼 dirty 색 (옵션 A: bg-accent 단일 / B: bg-warning-bg outline) | **옵션 B**                            |
| (c) | pill border (옵션 1: 제거 / 2: -bar 변종)                          | **옵션 1** (제거)                     |
| (d) | Save 아이콘 동반                                                    | **동반** (<Save size={14} />)         |

## Task 1: Sketch HTML (commit d542f58)

`.planning/quick/260527-tb3-legalpage-sweep-emoji-8-lucide-4/sketch/legalpage-sweep.html` — 4 패턴 Old/New 비교 + 옵션 A/B + pill border 분기. 사용자 컨펌 완료 후 Task 3 진행.

## Task 3: TSX Sweep (commit 47b9088)

### Emoji 8곳 매핑

| Line | Before                                | After                                                                                     |
| ---- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| 380  | `{isSelected ? '✓' : ''}`             | `{isSelected ? <Check size={14} className="inline-block" /> : null}`                      |
| 404  | `조치 전 {hasBefore ? '✓' : '✗'}`     | `조치 전 {hasBefore ? <Check size={12} ... /> : <X size={12} ... />}` (currentColor 상속) |
| 407  | `조치 후 {hasAfter ? '✓' : '✗'}`      | `조치 후 {hasAfter ? <Check size={12} ... /> : <X size={12} ... />}` (동일)               |
| 414  | `<span ...>🔒 제출 완료</span>`         | `<span ... inline-flex items-center gap-1><Lock size={12} />제출 완료</span>`             |
| 538  | `if (isLocked) return '🔒 제출 완료'` | `return <><Lock size={12} ... />제출 완료</>` (방법 A — JSX 반환)                         |
| 599  | `: '💾 저장하기'`                     | `: <><Save size={14} ... />저장하기</>` (옵션 d 동반)                                     |
| 676  | `🔒 제출 완료된 점검 — 재생성 불가`     | `<Lock size={14} ... />제출 완료된 점검 — 재생성 불가`                                    |
| 1024 | `>🔒 종결</button>`                     | `><Lock size={12} ... />종결</button>`                                                    |

공통 className: `inline-block align-text-bottom mr-1` (Lock/Save 텍스트 베이스라인 정렬 패턴) / `ml-0.5` (L404/L407 텍스트 → 아이콘 간격).

### L538 IIFE return 처리 — 방법 A 적용

L536-L548 `indicatorLabel = (() => { ... })()` IIFE 가 string 을 반환하던 helper:
- L538 만 JSX fragment 로 변경 — TypeScript 가 IIFE 반환 타입을 `string | ReactNode` (= `ReactNode`) 로 자연 widen.
- 호출처 L590 `{indicatorLabel}` 은 JSX 안 단순 interpolation 이므로 ReactNode 그대로 렌더 OK.
- 다른 분기 (`'대상 없음'`, `'저장중...'`, 템플릿 문자열 `` `저장됨 · 방금` ``) 는 ReactNode 의 부분집합으로 그대로 유효.
- 함수 시그니처 / 호출처 변경 0.
- tsc --noEmit 통과로 검증 완료.

방법 B (호출처 분리) 는 더 침습적이라 미선택.

### 색 토큰 4곳 + 보너스 L1022 (옵션 B + 옵션 1)

| Line | Before                                                                                         | After                                                                              |
| ---- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 596  | `: 'bg-warning text-text-on-accent' : 'bg-accent text-text-on-accent'`                          | `: 'bg-warning-bg text-warning' : 'bg-accent text-text-on-accent'` (옵션 B)         |
| 1013 | `border ${... ? 'bg-safe-bg text-safe border-safe' : 'bg-warning-bg text-warning border-warning'}` | `${... ? 'bg-safe-bg text-safe' : 'bg-warning-bg text-warning'}` (옵션 1: border 통째 제거) |
| 1022 | `border border-safe bg-safe-bg text-safe`                                                       | `bg-safe-bg text-safe` (옵션 1 일관성: border + border-safe 동시 제거)              |
| 1033 | `${isDirty ? 'bg-warning text-text-on-accent' : 'bg-accent text-text-on-accent'}`              | `${isDirty ? 'bg-warning-bg text-warning' : 'bg-accent text-text-on-accent'}` (옵션 B) |
| 1043 | (L1013 과 동일 패턴)                                                                            | (L1013 과 동일 처리, 옵션 1)                                                       |

L1022 는 PLAN 의 "비표준 색 토큰 4곳" 외 추가로 발견된 동일 패턴 — pill 옵션 1 (border 제거) 일관성을 위해 함께 처리. PLAN scope 확장 (Rule 2 — UI 일관성 correctness).

### Lucide import 확장

```typescript
// Before (line 5)
import { ChevronLeft, Camera, Loader2 } from 'lucide-react'

// After
import { ChevronLeft, Camera, Loader2, Check, X, Lock, Save } from 'lucide-react'
```

## Verification Results

### Verify gate (모두 PASS)

| Check                                                                                             | Result |
| ------------------------------------------------------------------------------------------------- | ------ |
| `grep -E '✓\|✗\|🔒\|💾\|🔥\|⏰\|📋\|✅\|⚠️\|❌\|🔧\|🚨\|🔍\|🧯\|📊' \| wc -l`             | **0**  |
| `grep -cE 'bg-warning[^-]\|border-safe[^-]\|border-warning[^-]'`                                  | **0**  |
| Lucide import `Check` / `X` / `Lock` / `Save` 각 1                                                | **4/4** |
| `grep -c 'style={{'` (inline style 141곳 변경 0)                                                  | **141 = 141** |
| `git diff HEAD -- src/pages/LegalPage.tsx \| grep -E '^[+-]style='` (inline style 라인 diff 0)    | **0**  |
| `git diff HEAD -- src/pages/LegalPage.tsx \| grep -cE 'onClick\|useMutation\|useQuery\|useState\|useRef\|useEffect\|useNavigate\|legalApi\|fetch\('` | **0**  |
| `./node_modules/.bin/tsc --noEmit` (LegalPage.tsx 신규 에러)                                       | **0**  |
| `./node_modules/.bin/tsc --noEmit` (전체 프로젝트 에러)                                            | **0**  |
| `git status --short` (다른 파일 변경)                                                              | **LegalPage.tsx 만** |
| `git diff --diff-filter=D --name-only HEAD~1 HEAD` (post-commit deletions)                        | **0**  |

### Diff statistics

- `1 file changed, 14 insertions(+), 14 deletions(-)`
- replacement only — 신규 라인 추가 0
- 14 줄 = emoji 8곳 + 색 토큰 4곳 + L1022 보너스 + import 확장 = 14 라인 (계산 일치)

### TypeScript compile

Worktree 에 node_modules 가 없어서 production worktree 의 node_modules 를 read-only symlink 로 임시 연결 후 `./node_modules/.bin/tsc --noEmit` 실행 → LegalPage.tsx 0 error, 전체 프로젝트 0 error 확인. 검증 후 symlink 제거 (`rm node_modules`). production worktree 파일 손상 0.

## Commits

| Hash    | Subject                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------ |
| d542f58 | `feat(260527-tb3-01): LegalPage emoji + 색 토큰 sweep 시안 (4 패턴 + 옵션 분기)` (Task 1)               |
| 47b9088 | `feat(260527-tb3-03): LegalPage §7.1 emoji 8곳 → Lucide + §2.3 색 토큰 4곳 정리 (옵션 B/1/Save동반)` (Task 3) |

## Deviations from Plan

### Scope expansion (Rule 2 — UI 일관성 correctness)

**1. L1022 추가 처리**
- **Found during:** Task 3 grep 으로 비표준 색 토큰 확인 시 PLAN 에 명시되지 않은 5번째 위치 (`border border-safe bg-safe-bg text-safe`) 발견.
- **Issue:** PLAN 은 L596/L1013/L1033/L1043 4곳만 명시했지만, L1022 가 동일 패턴 (border + border-{color} 조합) 으로 존재. 옵션 1 (border 제거) 적용 시 L1022 를 그대로 두면 같은 시각 컨텍스트 안에서 일관성 깨짐.
- **Fix:** L1022 도 옵션 1 일관성으로 `border border-safe` 통째 제거 → `rounded-sm bg-safe-bg text-safe`.
- **Commit:** 47b9088

## 사용자 결정 누적 (Task 2 checkpoint 응답)

> (a) emoji 매핑 OK
> (b) 옵션 B
> (c) 옵션 1
> (d) Save 아이콘 동반

이 4가지 결정이 Task 3 의 모든 변경에 반영됨.

## 배포 계획

- **이 워크트리 (디자인 트랙):** main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions)
- **production cherry-pick 대상:** 47b9088 (Task 3 commit)
  - 20260328 production worktree 에서 별도 cherry-pick 결정 필요 (이 워크트리에서는 wrangler 금지 / production deploy 금지 룰).
  - production 측은 inline style 141 곳이 그대로라 phase B 작업과 함께 묶어 cherry-pick 검토 가능.

## Next Steps (out of scope for this plan)

- **inline style 141곳 → tailwind** (별도 phase B)
- **LegalFindingsPage.tsx** 동일 sweep 가능성 (별도 분석 필요)
- **LegalFindingDetailPage.tsx** 가 deprecated 라면 sweep 불필요 (memory `project_08_finding_detail_deprecated.md` 와 다른 페이지)
- production cherry-pick: 47b9088 (사용자 결정 대기)

## Self-Check: PASSED

**Files:**
- FOUND: cha-bio-safety/src/pages/LegalPage.tsx (modified, 1250 lines)
- FOUND: cha-bio-safety/.planning/quick/260527-tb3-legalpage-sweep-emoji-8-lucide-4/sketch/legalpage-sweep.html (from Task 1 d542f58)
- FOUND: cha-bio-safety/.planning/quick/260527-tb3-legalpage-sweep-emoji-8-lucide-4/260527-tb3-SUMMARY.md (this file)

**Commits:**
- FOUND: d542f58 (Task 1 sketch)
- FOUND: 47b9088 (Task 3 sweep)
