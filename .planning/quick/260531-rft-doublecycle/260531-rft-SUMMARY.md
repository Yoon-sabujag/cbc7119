---
quick_id: 260531-rft
slug: doublecycle
date: 2026-05-31
status: complete
commit: a0e2eba
---

# Quick Task 260531-rft — SUMMARY

## What changed

DIV/컴프레셔 two-lap 도넛(0~200%) 중앙 % 텍스트 색을 §6.1 progressColor 그라데이션
**두 바퀴 반복** 룰로 변경. 100%·200% 에서 초록, 그 사이는 주황→파랑 재진행.

| File | Change |
|------|--------|
| `cha-bio-safety/src/components/ui/index.tsx` | Donut doubleCycle 분기 중앙 텍스트 `style={{ color: allZero ? 'var(--t3)' : 'var(--t2)' }}` → `'var(--t3)' : color`. 단일 arc "변경 금지" 블록 무변경. |
| `cha-bio-safety/src/pages/DashboardPage.tsx` | 데스크톱(L332)+모바일(L675) doubleCycle `<Donut color={progressColor(m.pct)}>` → `color={progressColor(m.pct > 100 ? m.pct - 100 : m.pct)}`. 단일 Donut(L342/L685) 무변경. |

## Rule

```
within = pct > 100 ? pct - 100 : pct
textColor = progressColor(within)
```
0→회색(allZero) · 1~49→주황 · 50~99→파랑 · 100→초록 · 101~149→주황 · 150~199→파랑 · 200→초록.

엣지: early=50·late=50→합100→텍스트 초록인데 ring은 반쪽 파랑. 숫자 기준 룰로 수용(실사용 희소).

## Verify

- `npx tsc --noEmit` 통과 (exit 0)
- grep: doubleCycle 2곳만 wrapped, 단일 호출 2곳 + 단일 arc 블록 무변경 확인

---

## 직원 콘솔 (20260328 워크트리) 이관용 sync 노트

> 디자인 preview(cbc7119-preview) 시각 컨펌 후 적용. 두 파일 경로가 운영 PWA와 동일.

**대상 파일 (운영 repo 동일 경로):**
- `src/components/ui/index.tsx`
- `src/pages/DashboardPage.tsx`

**적용할 diff (3곳, 1줄씩):**

1. `src/components/ui/index.tsx` — Donut doubleCycle 중앙 텍스트
```diff
-          style={{ color: allZero ? 'var(--t3)' : 'var(--t2)' }}
+          style={{ color: allZero ? 'var(--t3)' : color }}
```
⚠ 단일 arc 블록(`// ── 기존 단일 arc 동작 (변경 금지) ──`)의 `zero ? 'var(--t3)' : color` 는 건드리지 말 것.

2. `src/pages/DashboardPage.tsx` — 데스크톱 doubleCycle `<Donut>` (size={76})
```diff
-                                color={progressColor(m.pct)}
+                                color={progressColor(m.pct > 100 ? m.pct - 100 : m.pct)}
```

3. `src/pages/DashboardPage.tsx` — 모바일 doubleCycle `<Donut>` (size={44})
```diff
-                      color={progressColor(m.pct)}
+                      color={progressColor(m.pct > 100 ? m.pct - 100 : m.pct)}
```
⚠ doubleCycle 블록 안의 `color=` 만. 비-doubleCycle 단일 `<Donut pct={m.pct} color={progressColor(m.pct)} size={...} />` (L342/L685 대응)은 무변경.

**검증:** 운영 repo 에서 `git grep "progressColor(m.pct > 100"` → 정확히 2건. `git grep "var(--t2)"` 도넛 라인에서 0건.

**적용 방식:** 디자인 트랙 커밋 `a0e2eba` 를 직접 cherry-pick 하면 동일 (단, 두 repo 가 분리되어 있으면 위 diff 수동 적용). 단일 atomic 커밋이라 cherry-pick 깔끔.
