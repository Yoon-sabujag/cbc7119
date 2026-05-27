---
phase: 260527-fcd-dim-highlight
plan: 01
type: quick
tags:
  - redesign
  - inspection-page
  - mobile-only
  - design-system-v0.1.2
key-files:
  modified:
    - src/pages/InspectionPage.tsx
  created:
    - .planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html
commits:
  - 4daa966 feat(260527-fcd-01) 시안 HTML (Task 1)
  - 156f933 feat(260527-fcd-03) TSX 적용 옵션 B (Task 3)
option-selected: B
completed: 2026-05-27
---

# 260527-fcd 모바일 카테고리 카드 강조 반전 (v0.1.2 후보) Summary

InspectionPage 모바일 카테고리 카드의 강조 로직을 반전: 미시작 카드는 더 이상 dim 되지 않고(opacity 100 강조), 완료 카드는 safe-bg 초록을 유지하면서 opacity-50 으로 흐리게 표시(옵션 B). 시선을 "행동 필요" 항목으로 유도하는 §6.1 progress color rule 와 같은 철학.

## 사용자 옵션 선택

| 옵션 | 설명                                              | 채택 |
|------|---------------------------------------------------|------|
| A    | opacity-50 만 적용 (safe-bg 제거, 깔끔)            |      |
| B    | opacity-50 + bg-safe-bg/40 + border-safe-bar/40 유지 (완료 식별 강함) | **선택** |

채택 사유 (사용자 결정): 완료 카드의 초록 잔존이 "완료" 상태 인식을 빠르게 만든다. dim 만으로는 단순 비활성으로 오인될 수 있음.

## 변경 위치

`cha-bio-safety/src/pages/InspectionPage.tsx` — **단일 hunk** `@@ -5184,8 +5184,7 @@`.

### Before (lines 5183-5189, 7 lines)

```tsx
const cardClass = [
  'relative bg-surface-raised border border-border-default rounded-md',
  'px-2.5 py-2.5 flex items-start gap-1.5 overflow-hidden min-h-[86px] box-border transition-all duration-150',
  !hasItems ? 'opacity-[0.38] cursor-default' : 'cursor-pointer hover:border-border-strong hover:-translate-y-px',
  hasItems && total > 0 && doneCnt === 0 ? 'opacity-60' : '',
  allDone ? 'bg-safe-bg/40 border-safe-bar/40' : '',
].filter(Boolean).join(' ')
```

### After (lines 5183-5188, 6 lines)

```tsx
const cardClass = [
  'relative bg-surface-raised border border-border-default rounded-md',
  'px-2.5 py-2.5 flex items-start gap-1.5 overflow-hidden min-h-[86px] box-border transition-all duration-150',
  !hasItems ? 'opacity-[0.38] cursor-default' : 'cursor-pointer hover:border-border-strong hover:-translate-y-px',
  allDone ? 'bg-safe-bg/40 border-safe-bar/40 opacity-50' : '',
].filter(Boolean).join(' ')
```

### 변경 요약

- **제거**: `hasItems && total > 0 && doneCnt === 0 ? 'opacity-60' : ''` (1 line)
- **수정**: `allDone ? 'bg-safe-bg/40 border-safe-bar/40' : ''` → `allDone ? 'bg-safe-bg/40 border-safe-bar/40 opacity-50' : ''` (opacity-50 추가)
- 순 변동: 2 lines removed, 1 line added (net -1 line)

## 상태별 시각 효과 (v0.1.1 → v0.1.2)

| 상태               | 판정 조건                              | v0.1.1 (Before)                | v0.1.2 (After, 옵션 B)               |
|--------------------|----------------------------------------|--------------------------------|--------------------------------------|
| 체크포인트 0       | `!hasItems`                            | `opacity-[0.38]` disabled       | **변화 없음** (계속 disabled)         |
| 미시작 (0%)        | `hasItems && total > 0 && doneCnt===0` | `opacity-60` (어둡게)           | **opacity 100** (강조)                |
| 진행중 (0<n<total) | `doneCnt > 0 && !allDone`              | opacity 100 + `text-warning`    | **변화 없음**                         |
| 완료 (100%)        | `allDone`                              | `bg-safe-bg/40 border-safe-bar/40` (강조) | `bg-safe-bg/40 border-safe-bar/40 opacity-50` (초록 유지 + dim) |

## Verify Gate 결과

| Gate | 검증                                          | 목표 | 실측 | 결과 |
|------|-----------------------------------------------|------|------|------|
| 1    | `grep -c "doneCnt === 0 ? 'opacity-60'"`      | 0    | 0    | PASS |
| 2    | `grep -c "allDone ? 'bg-safe-bg/40 border-safe-bar/40 opacity-50'"` | 1    | 1    | PASS |
| 3    | git diff hunk 범위                            | 5184 한 곳만 | `@@ -5184,8 +5184,7 @@` 단일 | PASS |
| 4    | `git diff` 에 `getCatBarClass` 출현 횟수      | 0    | 0    | PASS |
| 5    | tsc --noEmit 에서 InspectionPage.tsx 신규 에러 | 0    | 0    | PASS |

tsc 환경 노트: 이 워크트리는 node_modules 미설치라 `npx -p typescript@5.6.3 tsc --noEmit -p .` 로 실행. 결과: InspectionPage.tsx 관련 에러 0. 환경 에러(`@cloudflare/workers-types` / `vite/client` 타입 미설치) 2건은 빌드 환경 문제로 변경과 무관 (PLAN.md verify §6 와 동일 기준 — InspectionPage 에러만 카운트).

## 데스크톱 카드 무변경 확인

git diff hunk 가 `@@ -5184,8 +5184,7 @@` 단 한 곳. 데스크톱 카테고리 카드 영역(5820~5867)에는 어떤 hunk 도 없음. 즉 byte-level 무변동.

`getCatBarClass` (line 110-118) 도 diff 출현 0회 — §6.1 색바 룰(회색 → 노랑 → 파랑 → 초록) 그대로.

## Task 1 회상 (4daa966)

- 시안 파일: `.planning/quick/260527-fcd-dim-highlight/sketch/card-emphasis-reversal.html` (401 lines)
- Old vs New 좌우 패널 + 6 카드 케이스 (미시작/진행중 1~49/진행중 50~99/완료/체크포인트 없음/화재수신반)
- New 패널 안에 완료 옵션 A (opacity-50 만) / 옵션 B (opacity-50 + bg-safe-bg/40) 비교 행
- 외부 의존성 0, 인라인 CSS + 인라인 SVG, file:// 로드 가능
- §6.1 4색 hex (#22c55e / #f59e0b / #3b82f6 / safe-bar #16a34a) + 다크 surface 토큰 인라인

## Commits

| Task | Hash    | Message                                                  | Files                                    |
|------|---------|----------------------------------------------------------|------------------------------------------|
| 1    | 4daa966 | feat(260527-fcd-01): 카테고리 카드 강조 반전 시안 HTML | sketch/card-emphasis-reversal.html (+401) |
| 3    | 156f933 | feat(260527-fcd-03): 카테고리 카드 강조 반전 — 옵션 B   | src/pages/InspectionPage.tsx (-2 +1)     |

## Deviations from Plan

None - 플랜대로 정확히 실행. 사용자 선택 옵션 B 적용.

## 배포

- main 머지 시 GitHub Actions 가 자동으로 cbc7119-preview 에 배포.
- 직원 도메인 (cbc7119) 은 이 워크트리에서 다루지 않음 — CLAUDE.local.md 워크트리 규칙 준수.
- wrangler 명령 사용 0 — 이 워크트리는 wrangler deny.

## Follow-up (별도 작업 권고)

- v0.1.2 design-system.md 업데이트 — 카테고리 카드 강조 반전 룰 정식 등재. 이번 작업 범위 외.
- InspectionPage 외 다른 카드 컴포넌트(예: ElevatorPage, FloorPlan 등)에 같은 반전 룰 적용 검토. 사용자 의사 확인 후 quick 로 분리.

## Self-Check: PASSED

- src/pages/InspectionPage.tsx 변경 확인 (single hunk @@ 5184)
- Commit 156f933 존재 확인 (`git log --oneline -1`)
- Commit 4daa966 (Task 1) 존재 확인 (`git log --all --oneline | grep 4daa966`)
- sketch HTML 은 worktree 브랜치 (base 3430489) tree 에는 없으나 main(db0c586) tree 에 존재. orchestrator 가 worktree 머지 시 sketch 파일은 main 에 그대로 보존됨 — 추가 작업 불필요.
- Verify gates 1~5 모두 PASS
- 데스크톱 카드 + getCatBarClass byte-level 무변동 확인

## Worktree Base Note

이 worktree 브랜치 (`worktree-agent-a52798984d36421d5`) 의 parent 는 `3430489` (PLAN 커밋). 그러나 main 의 최신은 `db0c586` (= `3430489 + 4daa966` 머지). cardClass 영역(line 5183-5189) 은 3430489 와 db0c586 에서 동일 — sketch-only 머지가 InspectionPage.tsx 를 건드리지 않았기 때문. 따라서 이 worktree 의 TSX 패치는 db0c586 위에 그대로 적용 가능, conflict 없음.
