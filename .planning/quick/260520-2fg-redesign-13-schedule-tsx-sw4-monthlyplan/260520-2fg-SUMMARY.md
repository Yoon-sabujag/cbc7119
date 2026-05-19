---
title: SW4 — 월간 점검 계획 미리보기 테이블 (MonthlyPlanPreview) 완료
phase_id: quick-260520-2fg
phase: quick-260520-2fg
plan: 01
type: execute
wave: 1
status: complete
depends_on: [quick-260520-1q0]
subsystem: redesign/13-schedule
tags: [tsx-conversion, redesign, schedule, sw4, monthly-plan-preview, desktop-only, tokens]
requirements: [SCHED-SW4]
files_modified:
  - cha-bio-safety/src/pages/SchedulePage.tsx
metrics:
  duration_minutes: 3
  tasks_completed: 1
  files_modified: 1
  lines_added: 20
  lines_removed: 20
  commit_hash: ea1f33a
completed_at: 2026-05-19T16:55:20Z
---

# Phase quick-260520-2fg Plan 01: SW4 월간 점검 계획 미리보기 테이블 (MonthlyPlanPreview) Summary

## One-liner

MonthlyPlanPreview 컴포넌트 (SchedulePage.tsx line 643~787) 의 옛 alias var() 토큰을 v0.1.1 semantic 토큰으로 1:1 치환하고, cell fontSize 9/10/11 을 모두 12 로 노안 격상. 31×21 본문 + 31×2 헤더의 dynamic 분기 인라인 style 은 W7 §10 화이트리스트로 잔존 (옵션 A 채택). 데스크톱 1280px 미리보기 표 토큰 정합성 확보.

## 변환 결과 표 (Before / After)

| 영역                                | Before                                                                                                                                                      | After                                                                                                                                                                                | 변경 사유                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `cellStyle` base (line 673~676)     | `border: '1px solid var(--bd)'` / `fontSize: 11` / `color: 'var(--t1)'`                                                                                     | `border: '1px solid var(--border-default)'` / `fontSize: 12` / `color: 'var(--text-primary)'`                                                                                        | v0.1.1 토큰 + 노안 격상 11→12 (sketch line 286)      |
| `headCell` (line 677)               | `background: 'var(--bg3)'` / `color: 'var(--t1)'`                                                                                                           | `background: 'var(--surface-sunken)'` / `color: 'var(--text-primary)'`                                                                                                               | v0.1.1 토큰                                     |
| outer container (line 680)          | `background: 'var(--bg2)'`                                                                                                                                  | `background: 'var(--surface-raised)'`                                                                                                                                                | v0.1.1 토큰                                     |
| 타이틀 (line 682)                       | `color: 'var(--t1)'`                                                                                                                                        | `color: 'var(--text-primary)'`                                                                                                                                                       | v0.1.1 토큰 (카피 1 byte 변경 0)                    |
| 날짜 행 31 cell (line 698~705)       | `color: ... 'var(--t1)'` / `background: ... 'var(--bg3)'` / `borderLeft/Right/Top: '2px solid var(--acl)'`                                                  | `color: ... 'var(--text-primary)'` / `background: ... 'var(--surface-sunken)'` / `borderLeft/Right/Top: '2px solid var(--accent)'`                                                   | v0.1.1 토큰. raw hex `#ef4444`/`#3b82f6` + alpha rgba 잔존 (§10) |
| 요일 행 31 cell (line 722~727)       | `color: ... 'var(--t1)'` / `borderLeft/Right: '2px solid var(--acl)'`                                                                                       | `color: ... 'var(--text-primary)'` / `borderLeft/Right: '2px solid var(--accent)'`                                                                                                   | v0.1.1 토큰. fontWeight: 600 유지 (sketch line 297) |
| label 셀 (line 739)                  | `fontSize: 10`                                                                                                                                              | `fontSize: 12`                                                                                                                                                                       | 노안 격상 10→12 (sketch line 302)                  |
| day 셀 31개 (line 765~774)           | `fontSize: 10` / `color: 'var(--t1)'` / `borderLeft/Right/Bottom: '2px solid var(--acl)'`                                                                   | `fontSize: 12` / `color: 'var(--text-primary)'` / `borderLeft/Right/Bottom: '2px solid var(--accent)'`                                                                               | 노안 격상 + v0.1.1 토큰. alpha rgba 0.06/0.1 잔존 (§10) |
| note 셀 (line 779)                   | `fontSize: 9` / `color: 'var(--t3)'`                                                                                                                        | `fontSize: 12` / `color: 'var(--text-tertiary)'`                                                                                                                                     | 노안 격상 9→12 (sketch line 304) + v0.1.1 토큰      |

**총 변경량:** +20/-20 lines, file size delta = 0 (alias 길이 차이로 line 일부 늘었으나 전체 line 수는 동일).

## verify gate 결과 표

### §4.1 NEGATIVE gates (0 이어야 함)

| #  | 항목                                   | 결과       | PASS |
| -- | -------------------------------------- | -------- | ---- |
| #1 | 이모지 (시계 글리프 포함)                  | 0        | OK   |
| #3 | `text-status-*` / `bg-status-*` 잘못된 prefix | 0        | OK   |
| #4 | linear-gradient                        | 0        | OK   |
| #5 | 옛 alias `var(--bg2/bg3/bd/bd2/t1/t2/t3/acl)` | 0        | OK   |
| #6 | "오늘" 텍스트 (isTdy 분기는 bg/border 만)   | 0        | OK   |
| #7 | raw hex (§10 화이트리스트)               | `#3b82f6`, `#ef4444` 2종만 | OK   |

### §4.2 QUANTITATIVE gates (≥ threshold)

| #   | 항목                                | 결과 | 목표 | PASS |
| --- | ----------------------------------- | -- | --- | ---- |
| #9  | surface 토큰                         | 3  | ≥2  | OK   |
| #10 | text 토큰                            | 7  | ≥3  | OK   |
| #11 | border 토큰                          | 1  | ≥1  | OK   |
| #12 | accent 토큰                          | 8  | ≥6  | OK   |

추가:
- fontSize 9/10/11 (expect 0): **0 OK**
- fontSize 12 (expect ≥4): **4 OK** (cellStyle base 1 + label 1 + day 1 + note 1)
- accent 2px solid border (expect ≥6): **8 OK** (date 3 + weekday 2 + body 3)
- alpha rgba 인스턴스 (expect ≥6): **6 unique OK** (rgba(239,68,68,0.06/0.08), rgba(59,130,246,0.06/0.08/0.18), rgba(34,197,94,0.1))

### §4.3 BUILD gates

| #   | 항목                            | 결과    | PASS |
| --- | ------------------------------- | ----- | ---- |
| #19 | `npx tsc --noEmit`              | exit 0 | OK   |
| #20 | `npm run build`                 | exit 0, vite ✓ built in 14.22s | OK   |

### NEGATIVE PRESERVATION (1 byte 변경 0)

| 항목                                                | 결과     | PASS |
| --------------------------------------------------- | ------ | ---- |
| `PLAN_PREVIEW_ROWS` / `dayCatMap` / `Array.from` / `row.daily` / `row.cats` / `row.cl` / `row.note` grep hits | 14 (≥12) | OK   |
| 타이틀 카피 `중요업무추진계획(방재)`                          | 1      | OK   |
| 헤더 카피 `시행일자` / `NO.` / `비고`                  | 3      | OK   |
| `text || '.'` dot fallback                          | 1      | OK   |
| 호출 site 분기 (line 575, `if (isDesktop)` 부모 블록) | 변경 0 | OK   |
| 컴포넌트 안 early return 추가                        | 없음  | OK   |

## Atomic commit

| 필드           | 값                                                                                |
| -------------- | --------------------------------------------------------------------------------- |
| commit hash    | `ea1f33a`                                                                         |
| commit message | `tsx(13-schedule): SW4 — 월간 점검 계획 미리보기 테이블 (MonthlyPlanPreview)` |
| files modified | `cha-bio-safety/src/pages/SchedulePage.tsx` (+20/-20)                             |
| branch         | `redesign/13-schedule`                                                            |

## Deviations from Plan

None — plan executed exactly as written.

- PLAN.md 의 §10 옵션 A 인라인 잔존 채택 그대로 적용.
- sketch CSS verbatim 매핑 6 영역 모두 plan 의 변환 매핑 표 그대로 1:1 치환.
- SW3 학습 inherit: `text-status-*` 정정 패턴은 SW4 에 적용 불가 (Tailwind class 0 사용). 단 §4.1 #3 grep gate 로 오탈자 방지 확인 — 0 hit PASS.
- raw hex `#ef4444` / `#3b82f6` 잔존 (§10 화이트리스트 — sketch line 312~313 verbatim `.sun.hol` / `.sat` color).
- alpha rgba 0.06/0.08/0.1/0.18 잔존 (§10 — 8중 분기 정적 Tailwind 불가).

## Authentication gates

None.

## 사용자 검수 흐름 reminder

**검수 환경:** 데스크톱 1280px (1 뷰포트, 모바일 변환 X — W3 OQ #1 LOCKED desktop-only).

검수 포인트:
1. **라이트 + 다크 토큰 정합성**
   - light: 흰 배경 + 옅은 회색 row + 본문 점검일 옅은 초록.
   - dark: 어두운 raised + 더 어두운 sunken 헤더 row + 점검일 옅은 초록.
2. **today (2026-05-20) accent border**
   - 5월 보드, 5/20 컬럼 (수요일)에 accent 컬러 (light=blue 600 / dark=accent token) 2px border 가 date row top + L/R + weekday row L/R + body L/R + last-row bottom 모두 두름.
3. **31일 cramped 폰트 12px 가독성**
   - W3 OQ #3 LOCKED a) 1280px cramped 그대로 — 표 가로 폭 좁아 31일 헤더 + 21 row × 31 day cell 이 빽빽하지만 fontSize 12 로 노안 격상되어 시인 OK 여부 확인.
4. **21 row × 31 day 배치**
   - NO. (2%) + 내   용 (20%) + 31일 cell + 비고 (6%) 컬럼 폭 비율 그대로.
   - 빈 셀에 dot (`.`) 표시 보존 (text || '.').
5. **타이틀 + 헤더 카피 0 byte 변경**
   - `5월 중요업무추진계획(방재)` / `시행일자` / `NO.` / `내   용` (HTML entity `&nbsp;`) / `비고` 그대로.
6. **호출 site desktop-only**
   - 모바일 (< 1024px) 에서는 표 자체가 안 보임. 부모 `if (isDesktop)` 블록으로 가드됨 (line 554).

**다음 단계 (사용자 컨펌 대기):**

- 본 commit `ea1f33a` 은 `redesign/13-schedule` 브랜치에만 적용. main 머지 / push 사용자 명시 컨펌 후에만 진행 (CLAUDE.local.md `feedback_deploy_test.md` 룰).
- main 머지 후 `cbc7119-preview.pages.dev` 자동 배포로 다크/라이트 검수.

## 다음 SW 예고

W7 §6 sub-task 5~ (SW5/SW6 — 외부 함수 / AddModal / EditModal / detail panel 등) 잔존. 본 SW4 는 미리보기 표 (line 643~787) 단일 컴포넌트만 종결.

## Self-Check: PASSED

- File modified: `cha-bio-safety/src/pages/SchedulePage.tsx` — FOUND (verified via `git diff --stat` and target Read line 643~787)
- Commit `ea1f33a` — FOUND (verified via `git rev-parse --short HEAD`)
- Verify gates: §4.1 negative 6/6 PASS / §4.2 quantitative 4/4 PASS / §4.3 build 2/2 PASS / NEGATIVE preservation 6/6 PASS
- tsc PASS exit 0 / npm build PASS exit 0
