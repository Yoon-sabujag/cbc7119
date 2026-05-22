---
phase: 260522-ffc
plan: 01
subsystem: redesign/10-cctv-info
tags: [tsx-conversion, tailwind-class, atomic-commit, redesign]
dependency_graph:
  requires:
    - cha-bio-safety/src/utils/cctv.ts (CCTV_DVRS, CCTV_INFO_UPDATED)
    - cha-bio-safety/src/hooks/useIsDesktop.ts
    - cha-bio-safety/tailwind.config.js (token → class 매핑)
  provides:
    - Tailwind class 기반 CctvInfoPage 마크업 (후속 디자인 토큰 grep + 일괄 변환 용이)
  affects:
    - App.tsx 변경 0 (라우트 보존)
tech_stack:
  added: []
  patterns:
    - Tailwind arbitrary value `[Npx]` / `[var(--...)]` 폴백
    - 이중 prefix class (`text-text-primary`, `border-border-default`) — tailwind.config 키명 그대로
    - text-caption + leading-none 조합 (작은 컨테이너에서 line-height:1.5 시각 패딩 제거)
    - 조건부 className template literal (`${isDesktop ? 'A' : 'B'}`)
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/CctvInfoPage.tsx (86 → 52 lines, -34 lines, 60% reduction)
decisions:
  - "PLAN 의 Tailwind 매핑 표 그대로 1:1 적용 (추측 X)"
  - "텍스트 4 곳 (채널수/배지/합계/푸터) 에 leading-none 명시 (text-caption lh:1.5 트랩 회피)"
  - "arbitrary value 사용 6곳: w-[6px], h-[6px], mt-[6px], py-[2px], px-[10px], px-[14px], gap-x-[10px], max-w-[960px], grid-cols-[auto_1fr_1fr] — tailwind.config custom scale 에 없는 값"
  - "isEstimate / isReplaced 분기는 className template literal 안에서 처리 (외부 분기 변수 추가 X)"
metrics:
  duration_min: 4
  tasks_completed: 1
  files_modified: 1
  completed_date: 2026-05-22
---

# Phase 260522-ffc Plan 01: redesign/10-cctv-info TSX Tailwind class 변환 Summary

CctvInfoPage 의 inline style + var(--token) 마크업을 Tailwind class 로 1:1 변환. 시각 변경 0 / 비즈 anchor 10건 1 byte 변경 0 / App.tsx 변경 0 / 단일 atomic commit (86 → 52 lines, -39%).

## Commit

```
68103d7 refactor(10-cctv): inline style → Tailwind class 변환 (CctvInfoPage)
```

## Verify Gate 5건 결과

| Gate | Check                                                                          | Result   |
| ---- | ------------------------------------------------------------------------------ | -------- |
| 1    | `grep -c "style={" src/pages/CctvInfoPage.tsx` → 0 기대 (최대 1)               | **0** PASS |
| 2    | `grep -c "var(--" src/pages/CctvInfoPage.tsx` → 0 기대 (최대 3)                | **0** PASS |
| 3    | 비즈 anchor 10건 grep 매치 → 합계 10 기대                                       | **10/10** PASS |
| 4    | `git diff --stat origin/main..HEAD -- cha-bio-safety/src/App.tsx` → empty 기대 | **empty** PASS |
| 5    | 단일 파일 변경 (CctvInfoPage.tsx)                                              | **PASS** |

5/5 PASS.

## 비즈 anchor 10건 1 byte 변경 0 (verify gate 3 상세)

| #  | Anchor                                                                                                       | Match |
| -- | ------------------------------------------------------------------------------------------------------------ | ----- |
| 1  | `import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'`                                               | 1     |
| 2  | `import { useIsDesktop } from '../hooks/useIsDesktop'`                                                       | 1     |
| 3  | `export default function CctvInfoPage()`                                                                     | 1     |
| 4  | `const isDesktop = useIsDesktop()`                                                                           | 1     |
| 5  | `CCTV_DVRS.map(dvr =>`                                                                                       | 1     |
| 6  | `const totalCap = dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)`         | 1     |
| 7  | `const isEstimate = dvr.retention.includes('추정')`                                                          | 1     |
| 8  | `dvr.ports.flatMap(p =>`                                                                                     | 1     |
| 9  | `const isReplaced = p.replaced !== '기존'`                                                                   | 1     |
| 10 | `출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}`                                                              | 1     |

10/10 모두 1줄 정확 매치.

## 변환 line 통계

| Metric | Before | After | Δ              |
| ------ | ------ | ----- | -------------- |
| Lines  | 86     | 52    | -34 (-39.5%)   |
| insertions / deletions | -    | -     | +20 / -54 |

## 변환 후 className 통계

| Category               | Count / Set                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `className=` 속성 총수 | 20                                                                                                             |
| text-text-* (이중 prefix) | text-text-primary, text-text-secondary, text-text-tertiary                                                  |
| border-border-* (이중 prefix) | border-border-default                                                                                   |
| bg-* (status/surface)  | bg-info-bg, bg-safe-bg, bg-surface-page, bg-surface-raised                                                     |
| rounded-*              | rounded-md, rounded-pill, rounded-sm                                                                            |
| leading-none           | 4 (채널수/배지/합계푸터/페이지푸터 — text-caption 트랩 회피)                                                    |
| arbitrary `[N]`        | `[10px]`, `[14px]`, `[2px]`, `[6px]`, `[960px]`, `[auto_1fr_1fr]` — tailwind.config custom scale 에 없는 6 종 |

## Deviations from Plan

None — PLAN 의 outline 그대로 시행. Tailwind 매핑 표 1:1 적용. 추측 / 임의 토큰 / 신규 패턴 0건.

## 사용자 머지/배포 컨펌 대기

- 워크트리 branch (`worktree-agent-a64389c21e0d7ea1c`) 에 commit 만 생성. **main 머지 / push 자율 금지** (CLAUDE.local.md + 메모리 박제 `feedback_deploy_test.md`).
- 머지 후 GitHub Actions 가 cbc7119-preview 자동 배포 (직원 도메인 cbc7119 절대 X).
- 사용자 컨펌 시점에 머지 + push 진행하면 됨.
- wrangler 명령 0건 사용 (CLAUDE.local.md deny).

## Manual Smoke Check (사용자 머지/배포 후)

- 모바일 viewport (~375px): DVR 1 카드 3포트 모두 "기존" / 50일 safe(녹색) 배지
- 모바일 viewport: DVR 7 카드 #4/#6 교체일자 info(파랑) 굵게 / #5 기존 tertiary
- 모바일 viewport: DVR 13 카드 보존배지 info(파랑) + dot / #1 4TB 2026-04-28 info 강조
- 데스크톱 viewport (≥768px): 2열 grid, DVR 13 마지막 행 오른쪽 빈 슬롯
- 출처 푸터: 가운데 정렬 + text-tertiary + 한 줄

## 메모리 박제 후보

다음 페이지(11-DIV 이후 잔여 / 04-elevator / ...) Tailwind class 변환 시 재사용 가능한 패턴 4건:

1. **이중 prefix 패턴** (`text-text-primary`, `border-border-default`) — tailwind.config 의 colors 키명이 `'text-primary'` / `'border-default'` 이므로 Tailwind utility prefix `text-` / `border-` 가 한번 더 붙어서 이중 prefix 가 자연스럽게 발생. 추측 / 단축 (`text-primary`) 금지. (이미 메모리 박제: `feedback_tailwind_token_class_pattern.md`)

2. **text-caption + leading-none 4 곳 룰** (채널수/배지/합계푸터/페이지푸터) — sketch 의 `line-height:1` 명시 텍스트는 반드시 `leading-none` 동반. 누락 시 12px 컨테이너에 시각 패딩 (lh:1.5 = 18px) 들어감. (이미 메모리 박제: `feedback_text_caption_leading_none.md`)

3. **w-[Npx] / h-[Npx] arbitrary 함정** — tailwind.config 의 spacing override 가 `w-8=48px` 처럼 큰 값으로 잡혀 있어, 작은 dot/icon (6px, 14px 등) 은 반드시 arbitrary `[Npx]` 로 명시. (이미 메모리 박제: `feedback_tailwind_w8_h8_is_48px.md`)

4. **grid-cols-[auto_1fr_1fr] arbitrary** — Tailwind 기본 grid-cols-N 은 `repeat(N, minmax(0,1fr))` 만 지원. `auto 1fr 1fr` 같은 비대칭 그리드는 반드시 arbitrary template `grid-cols-[auto_1fr_1fr]` (공백 → underscore). 포트 표 / 데이터 표 변환 시 재사용 패턴.

(4건 모두 기존 메모리에 박제되어 있어 추가 박제 불요 — 다음 page 변환 시 그대로 적용)

## Self-Check: PASSED

- File exists: cha-bio-safety/src/pages/CctvInfoPage.tsx (52 lines)
- Commit exists: 68103d7
- Verify gate 5/5 PASS
- Post-commit deletion check: empty (no deletions)
