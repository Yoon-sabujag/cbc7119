---
phase: quick-260608-1am
plan: "01"
subsystem: dashboard
tags: [desktop, donut-layout, gap, balanced-distribution]
dependency_graph:
  requires: []
  provides: [desktop-monthly-donut-6-7-6, row-gap-4]
  affects: [DashboardPage]
tech_stack:
  added: []
  patterns: [balanced-center-out-distribution]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/DashboardPage.tsx
decisions:
  - "balanced counts[] 알고리즘 채택: 나머지를 가운데 줄부터 바깥쪽으로 배분 (order = sort by |i - mid|), greedy perRow 대비 시각 균형 개선"
  - "gap-4(16px) 선택: 사용자 시안 승인 기준, gap-8(32px) 대비 76px 도넛 박스 상·하단 잘림 해소"
metrics:
  duration: "~3 minutes"
  completed: "2026-06-08"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase quick-260608-1am Plan 01: 대시보드 데스크톱 월간 도넛 6·7·6 레이아웃 + 행 간격 축소 Summary

**One-liner:** 데스크톱 이번 달 점검 현황 도넛을 greedy 7·7·5 에서 balanced 6·7·6 으로 재분배하고 gap-8→gap-4 로 행 간격을 줄여 76px 도넛 잘림 해소

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | 데스크톱 월간 도넛 6·7·6 분배 + 행 간격 gap-4 적용 (2곳 Edit) | 44c4d40 | DashboardPage.tsx |

## What Was Built

DashboardPage.tsx 데스크톱 "이번 달 점검 현황" 박스에 정확히 2곳 Edit 적용:

**Edit 1 — 행 간격:** 컨테이너 `flex flex-col gap-8` → `flex flex-col gap-4`. 32px → 16px 줄어 3줄 x 76px 도넛이 박스 상·하단에서 잘리지 않음.

**Edit 2 — 분배 알고리즘:** greedy `perRow = Math.ceil(n/numRows)` + `slice(i*perRow, (i+1)*perRow)` 를 balanced counts 알고리즘으로 교체:
- `base = Math.floor(n / numRows)`
- `counts = new Array(numRows).fill(base)` — 각 줄 기본 개수
- `rem = n - base * numRows` — 나머지
- `mid = (numRows - 1) / 2` — 가운데 줄 인덱스
- `order = [...counts.keys()].sort(...)` — 가운데부터 먼 순서
- `counts[order[k]]++` — 나머지를 가운데 줄부터 배분
- offset 기반 slice: `rows.push(monthly.slice(off, off + counts[i])); off += counts[i]`

알고리즘 결과 (검증): n=19 → numRows=3, base=6, rem=1, mid=1, order=[1,0,2], counts=[6,7,6]. 슬라이스 6/7/6.

## Verify Results

| Check | Result |
|-------|--------|
| PASS-GAP | gap-8 0건 / gap-4 존재 |
| PASS-ALGO | perRow 0건 / counts+offset slice 존재 |
| PASS-MOBILE-UNTOUCHED | size={44}/flex-nowrap diff 미등장 |
| PASS-TSC | npx tsc --noEmit 오류 없음 |
| PASS-BUILD | npm run build 성공 |

## Deviations from Plan

None — plan executed exactly as written. 2곳 Edit, OLD→NEW 문자열 그대로 적용.

## Known Stubs

None.

## Threat Flags

None — 기존 클라이언트 렌더링 로직 재배분만. 네트워크 엔드포인트/인증 경로 변경 없음.

## Self-Check

- [x] DashboardPage.tsx modified: `44c4d40` commit exists
- [x] `gap-4` 존재, `gap-8` 0건
- [x] `const counts = new Array(numRows).fill(base)` 존재
- [x] 모바일 블록 (size=44, flex-nowrap) diff 미등장
- [x] TSC + Build PASS

## Self-Check: PASSED
