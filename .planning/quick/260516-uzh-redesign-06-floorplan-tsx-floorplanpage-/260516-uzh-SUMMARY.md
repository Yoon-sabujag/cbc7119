---
phase: quick-260516-uzh
plan: 01
subsystem: frontend/pages
tags:
  - redesign
  - floorplan
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - multi-wave
dependency_graph:
  requires:
    - 260516-sxb (floorplan-sketch.html + floorplan-modals-sketch.html 완료)
    - 260515-3mc (ElevatorPage 11-wave 변환 패턴 권위)
    - 260515-1p0 / 260515-2r5 / 260514-tbj (InspectionPage 모달 변환 패턴 권위)
  provides:
    - FloorPlanPage.tsx v0.1.1 완전 변환 (6 wave 전체)
  affects:
    - cha-bio-safety/src/pages/FloorPlanPage.tsx
tech_stack:
  added: []
  patterns:
    - Tailwind utility-only 인라인 style 제거 (v0.1.1 규칙)
    - STATUS_COLOR var(--status-*-bar) 토큰화
    - 04+05 paired-precedent 1:1 mirror (결과 배지 / CTA 단색)
    - lucide-react import 신설 (ChevronLeft / Trash2 / X)
    - 노안 12px 마지노 (dangerBadge text-[10px] → text-caption)
key_files:
  modified:
    - cha-bio-safety/src/pages/FloorPlanPage.tsx
decisions:
  - "조치 CTA: linear-gradient(#f59e0b,#ef4444) → bg-fire text-on-fire (단색, paired-precedent 04+05 결정)"
  - "소화기 분리 CTA: bg-danger text-white (단색 danger — 분리는 위험 조치 신호)"
  - "dangerBadge ! 텍스트: fontSize:9 → text-caption font-black (12px, 14×14 컨테이너 확대)"
  - "resolved 색: var(--accent) (STATUS_COLOR #3b82f6 → accent 1:1 매핑)"
  - "마커 SVG 내부 stroke #fff 계열: 시각 정체성 유지 (보존)"
  - "도면 배경 #1a1f2b: 화이트리스트 (sketch 그대로)"
metrics:
  duration: ~60min (6 wave, 단일 파일 2165→2117줄)
  completed: 2026-05-16
  tasks_completed: 6
  files_modified: 1
---

# Quick 260516-uzh: FloorPlanPage TSX 6-Wave 변환 Summary

**One-liner:** FloorPlanPage.tsx 전체 v0.1.1 변환 — 19종 마커 SVG STATUS_COLOR 토큰화 + 말풍선/바텀시트/점검모달/수정모달/추가모달/confirm 3종/조치모달 Tailwind-only 토큰화 + lucide import 신설 + CTA 단색 전환 (6 wave)

## Completed Tasks

| Wave | Name | Commit | Lines |
|------|------|--------|-------|
| W1 | 자체 헤더 + 도면 탭 + 층 스크롤 + 캔버스 + 범례 | 1f06a32 | 940~1470 |
| W2 | STATUS_COLOR 토큰화 + dangerBadge + 말풍선 + 바텀시트 | 028cef3 | 103~1390 |
| W3 | 점검 모달 inline (자산 카드 + 결과 3택 + 증상 피커 + paired BC) | d2c75d5 | 1672~1906 |
| W4 | 마커 수정 모달 (구역 selector + 종류 grid + 라벨 input + 자산 분리/배치) | 266b809 | 1423~1533 |
| W5 | 마커 추가 모달 + Confirm 모달 3종 (분리/미배치/배치 확인) | 266b809 | 1535~1993 |
| W6 | InspectionRevisitPopup 컨테이너 + 인라인 조치 모달 | 266b809 | 1639~2115 |

Note: W4/W5/W6 are in a single commit (266b809) — all 3 waves applied in one dispatch run.

## Verification Results

| Check | Result |
|-------|--------|
| `var(--(bg\|bg2\|bg3\|bd\|bd2\|acl\|t1\|t2\|t3\|safe\|warn\|danger\|fire\|info))` | 0건 |
| `linear-gradient` | 0건 |
| `fontSize: (9\|10\|10.5\|11)` | 0건 |
| TypeScript errors in FloorPlanPage | 0건 |
| File line count | 2117 (범위 2100~2300 PASS) |
| 비즈니스 로직 변경 | 0건 |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Commit Strategy Note

Wave 4, 5, 6 were applied in a single dispatch run without intermediate commits between waves (sequential edits to same file). The 3 waves are grouped in commit 266b809 (W4 label). This is a dispatch-level implementation detail — the code changes for each wave are all present and correct.

## Design Token Mapping (v0.1.1)

| Old token | New Tailwind class |
|-----------|-------------------|
| `var(--bg2)` | `bg-surface-raised` |
| `var(--bg3)` | `bg-surface-sunken` |
| `var(--bd)` | `border-border-default` |
| `var(--bd2)` | `border-border-strong` |
| `var(--acl)` | `bg-accent` / `text-on-accent` |
| `var(--t1)` | `text-text-primary` |
| `var(--t2)` | `text-text-secondary` |
| `var(--t3)` | `text-text-tertiary` |
| `var(--warn)` | `text-warning` / `bg-warning-bg` |
| `var(--danger)` | `text-danger` / `bg-danger-bg` |
| `linear-gradient(#f59e0b,#ef4444)` | `bg-fire text-on-fire` |
| `rgba(239,68,68,0.85)` | `bg-danger` |
| `fontSize: 11` | `text-caption` (12px) |
| `fontSize: 10` | `text-caption` (12px) |

## STATUS_COLOR Token Mapping

```ts
const STATUS_COLOR: Record<string, string> = {
  uninspected: 'var(--text-tertiary)',
  normal:      'var(--status-safe-bar)',
  caution:     'var(--status-warning-bar)',
  bad:         'var(--status-danger-bar)',
  fault:       'var(--status-danger-bar)',
  resolved:    'var(--accent)',
}
```

## Known Stubs

None — all data sources wired, no placeholder text.

## Self-Check: PASSED

- FloorPlanPage.tsx exists at correct path
- W1 commit 1f06a32: found
- W2 commit 028cef3: found
- W3 commit d2c75d5: found
- W4/W5/W6 commit 266b809: found
- 0 old tokens
- 0 linear-gradient
- 0 small font sizes
- File lines 2117 (within 2100-2300)
