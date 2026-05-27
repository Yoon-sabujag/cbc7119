---
phase: 260527-egj
plan: 01
subsystem: dashboard
tags:
  - dashboard
  - donut
  - design-system
  - v0.1.1
  - 6.1-progress-color-rule
requires: []
provides:
  - "DashboardPage progressColor(pct) helper"
  - "§6.1 Progress Color Rule client-side derive (4 도넛 위치)"
affects:
  - src/pages/DashboardPage.tsx
tech-stack:
  added: []
  patterns:
    - "Client-side derive of UI-only props (서버 응답의 color 필드 무시, pct 기반 helper)"
    - "API BC 유지 — 응답 shape 무수정, 클라이언트에서만 표시 룰 변경"
key-files:
  created:
    - .planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html
  modified:
    - src/pages/DashboardPage.tsx
decisions:
  - "progressColor helper 는 hex 직접 리턴 (SVG stroke attribute 환경 안전 + tokens.css var() 가 일부 PWA 캐시 시점에 미정의 가능성)"
  - "doubleCycle overlay (m.early_color/m.late_color) 은 §6.1 적용 범위 밖 — info(파랑)/warn(주황) overlay 정체성 유지"
  - "MonthlyItem 인터페이스 color 필드 보존 — API 응답 shape BC, 미래 reuse 가능성"
  - "stats.ts ITEM_COLORS 회전 팔레트는 서버에 그대로 두되 클라이언트에서 무시 — server 변경 시 risk 0"
metrics:
  duration_minutes: ~12
  completed_date: 2026-05-27
---

# Quick 260527-egj: §6.1 Progress Color Rule 클라이언트 derive Summary

대시보드 "이번 달 점검 현황" 도넛 색을 카테고리별 임의 회전 팔레트에서 진척률 기반 §6.1 4단계 룰 (100%→safe-bar 초록 / 50~99%→accent 파랑 / 1~49%→warning-bar 노랑 / 0%→text-tertiary 회색) 로 통일. 클라이언트 헬퍼만 추가하고 API 는 무수정 (BC 유지).

## 작업 흐름

| Task | 내용 | 상태 | 결과 commit |
| --- | --- | --- | --- |
| 1 | 시안 HTML (donut-progress-color.html) | 완료 | 11515d5 (사전 dispatch, main 머지 337d0a9) |
| 2 | Checkpoint: 사용자 승인 | 완료 | "approved / TSX 진행" |
| 3 | DashboardPage.tsx patch | 완료 | **a780d60** (이번 wave) |

### Task 1 — 시안 HTML (선행 dispatch 결과)

- **경로:** `.planning/quick/260527-egj-6-1-progress-color-rule-derive/sketch/donut-progress-color.html`
- **commit:** 11515d5 (이전 dispatch agent 가 작성, main 337d0a9 으로 머지됨)
- **내용:** Old (ITEM_COLORS) vs New (§6.1) 비교 + 모바일 strip size 76 (pct 7개) + 데스크톱 strip size 44 + doubleCycle 예외 시각화
- **사용자 승인:** "approved / TSX 진행" — 이번 dispatch 프롬프트의 명시적 신호

### Task 3 — DashboardPage.tsx Patch (이번 wave)

**1. progressColor helper 추가 (lines 19-28, IS_ANDROID 직후):**

```typescript
// §6.1 Progress Color Rule (design-system v0.1.1)
// 진척률 → 색 매핑. 모든 진척률 도넛/색바에서 일관 적용.
// 카테고리별 임의 색 배정 폐지 (server stats.ts ITEM_COLORS 회전 폐기).
function progressColor(pct: number): string {
  const p = Number.isFinite(pct) ? pct : 0
  if (p >= 100) return '#22c55e' // --status-safe-bar
  if (p >= 50)  return '#3b82f6' // --accent
  if (p >= 1)   return '#f59e0b' // --status-warning-bar
  return '#8b949e'               // --text-tertiary (0% 미시작)
}
```

방어 동작: `NaN`/`-5`/`undefined` 케이스도 0 으로 폴백 → 회색 안전치.

**2. Donut color prop 교체 (정확히 4 곳):**

| # | 영역 | 라인 (after patch) | Before | After |
| --- | --- | --- | --- | --- |
| 1 | 모바일 doubleCycle | 332 | `color={m.color}` | `color={progressColor(m.pct)}` |
| 2 | 모바일 일반 | 342 | `color={m.color}` (inline) | `color={progressColor(m.pct)}` (inline) |
| 3 | 데스크톱 doubleCycle | 681 | `color={m.color}` | `color={progressColor(m.pct)}` |
| 4 | 데스크톱 일반 | 691 | `color={m.color}` (inline) | `color={progressColor(m.pct)}` (inline) |

**3. 유지 (변경 0 byte) 확인:**

| 항목 | 라인 (after patch) | 상태 |
| --- | --- | --- |
| 모바일 earlyColor overlay | 337 `earlyColor: m.early_color ?? 'var(--info)'` | 그대로 |
| 모바일 lateColor overlay | 338 `lateColor:  m.late_color  ?? 'var(--warn)'` | 그대로 |
| 데스크톱 earlyColor overlay | 686 `earlyColor: m.early_color ?? 'var(--info)'` | 그대로 |
| 데스크톱 lateColor overlay | 687 `lateColor:  m.late_color  ?? 'var(--warn)'` | 그대로 |
| MonthlyItem.color 필드 | line 31 `color: string` | 그대로 (API BC) |
| MonthlyItem.early_color/late_color | lines 39-40 | 그대로 |
| done/total `text-safe` 조건 | lines 345, 694 | 그대로 |
| `functions/api/dashboard/stats.ts` | — | `git diff HEAD` empty (0 line) |

## Verify Gate 결과 (PLAN.md Task 3 \<automated\>)

| Check | Expected | Actual | Status |
| --- | --- | --- | --- |
| `grep -c 'function progressColor'` | 1 | 1 | PASS |
| `grep -c 'progressColor(m.pct)'` | 4 | 4 | PASS |
| `grep -c 'color={m.color}'` | 0 | 0 | PASS |
| `grep -c 'm.early_color\|m.late_color'` | 4 | 4 | PASS |
| `git diff HEAD -- functions/api/dashboard/stats.ts` | empty | 0 lines | PASS |
| `./node_modules/.bin/tsc --noEmit` | 0 new errors | **0 errors total** | PASS |

## Color 매핑 검증 (의도 vs 헬퍼)

| pct | §6.1 룰 | helper 반환 | 시각 |
| --- | --- | --- | --- |
| 100, 100.5, 150 | safe-bar | `#22c55e` | 초록 |
| 99 | accent | `#3b82f6` | 파랑 |
| 60 | accent | `#3b82f6` | 파랑 |
| 50 | accent | `#3b82f6` | 파랑 |
| 49 | warning-bar | `#f59e0b` | 노랑 |
| 1 | warning-bar | `#f59e0b` | 노랑 |
| 0 | text-tertiary | `#8b949e` | 회색 |
| -5 | 0 폴백 | `#8b949e` | 회색 |
| NaN | 0 폴백 | `#8b949e` | 회색 |

## Build / Type Check

```
./node_modules/.bin/tsc --noEmit
  exit=0
  errors=0
  DashboardPage 관련 에러: 0
```

(이번 wave 의 patch 가 어떤 신규 에러도 만들지 않았다 — 기존 비관련 에러도 없음.)

## 배포 / 도메인 영향

- **이 worktree 의 push:** main 머지 시 GitHub Actions 가 `cbc7119-preview.pages.dev` 자동 배포 (디자인 도메인).
- **직원 도메인 `cbc7119.pages.dev`:** 무영향 — production 브랜치 + 수동 wrangler 만 배포. 본 작업은 main → preview 만 도달.
- **운영 PWA (`/Users/jykevin/Documents/20260328`):** 별도 워크트리. 본 작업 영향 0.
- **D1 migration:** 0 건. SQL/스키마 무수정.
- **wrangler 명령 사용 0건** — CLAUDE.local.md 룰 준수.

## Deviation

없음 — PLAN 그대로 실행.

## Self-Check

- [x] DashboardPage.tsx 변경 (commit a780d60): FOUND
- [x] sketch/donut-progress-color.html: FOUND (commit 11515d5, main 337d0a9)
- [x] verify gate 6/6 PASS
- [x] tsc 0 errors
- [x] stats.ts 0 byte 변경

## Self-Check: PASSED
