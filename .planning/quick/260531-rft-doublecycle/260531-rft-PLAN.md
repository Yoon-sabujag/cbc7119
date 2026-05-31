---
quick_id: 260531-rft
slug: doublecycle
date: 2026-05-31
status: in-progress
---

# Quick Task 260531-rft: 대시보드 이번달 점검현황 doubleCycle 도넛 중앙 텍스트 색 두 바퀴 반복 룰

## Problem

DIV/컴프레셔 two-lap 도넛(0~200%)의 중앙 % 텍스트가 `var(--t2)`(중립 회색)로 고정되어 있어,
200%(=양쪽 cycle 완료)인데도 흰색으로 보임. 단일 arc 도넛은 100% 완료 시 초록(`progressColor(pct)`)
인데 더블사이클만 색 룰이 안 적용되어 불일치.

## Rule (사용자 승인)

§6.1 progressColor 그라데이션을 **두 바퀴 반복**:

```
within = pct > 100 ? pct - 100 : pct
textColor = progressColor(within)
```

- 100%, 200% → 초록 `#22c55e`
- 그 사이 → 1바퀴와 동일하게 주황(1~49) → 파랑(50~99) 재진행
- 0%(allZero) → 회색 `var(--t3)` (기존 유지)

엣지(early=50·late=50→합100→초록 텍스트, ring은 반쪽 파랑)는 숫자 기준 룰로 수용.

## Tasks

### Task 1 — Donut doubleCycle 중앙 텍스트 색을 color prop 으로
- **file:** `cha-bio-safety/src/components/ui/index.tsx`
- **action:** doubleCycle 분기 중앙 텍스트(line ~212) `style={{ color: allZero ? 'var(--t3)' : 'var(--t2)' }}`
  → `style={{ color: allZero ? 'var(--t3)' : color }}`. 단일 arc "변경 금지" 블록(line 220+)은 손대지 않음.
- **verify:** doubleCycle 텍스트가 `color` prop 을 따름. 단일 arc 블록 무변경.
- **done:** grep 으로 `var(--t2)` 제거 + 단일 arc 블록 동일.

### Task 2 — DashboardPage doubleCycle color prop 을 wrapped progressColor 로
- **file:** `cha-bio-safety/src/pages/DashboardPage.tsx`
- **action:** 데스크톱(line 332) + 모바일(line 675) doubleCycle `<Donut>` 의
  `color={progressColor(m.pct)}` → `color={progressColor(m.pct > 100 ? m.pct - 100 : m.pct)}`.
  비-doubleCycle 단일 Donut(line 342, 685)은 `progressColor(m.pct)` 그대로 유지.
- **verify:** 두 doubleCycle 호출만 wrapped. 단일 호출 2개 무변경.
- **done:** grep 으로 doubleCycle 2곳 wrapped 확인.

## Handoff (직원 콘솔 20260328 워크트리)

같은 파일 경로(`src/components/ui/index.tsx`, `src/pages/DashboardPage.tsx`)에 동일 패치 적용.
sync 노트는 SUMMARY.md 에 cherry-pick 가능한 형태로 정리.
