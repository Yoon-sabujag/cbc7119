---
phase: quick-260521-sjj
plan: 01
subsystem: redesign/16-workshift
tags: [redesign, sketch-wave-1, index, workshift, design-tokens]
requirements_completed: [REDESIGN-16-WAVE1]
provides:
  - "cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (W2~W5 단일 진입점)"
  - "WorkShiftPage.tsx 226 라인 인벤토리 (5 영역 — 공통 hook/state/handler / 헤더 / 년월 select / 표 영역 / 범례)"
  - "4 sub-wave 분배 매핑 (W2 헤더+년월select / W3 표영역 / W4 범례 / W5 TSX checklist)"
  - "design-system v0.1.1 §1.1 / §1.2 / §1.3 / §6.1 / §6.2 / §6.4 / §7.1 verbatim 박제"
  - "메모리 룰 12개 inline 인용 (10건 기본 + WorkShiftPage 특화 2건: holidays_library_gap + dashboard_horizontal_scroll)"
  - "App.tsx 실측 박제 — MOBILE_NO_NAV_PATHS line 71 (등재) / DESKTOP_NO_NAV_PATHS line 74 (미등재) / DESKTOP_HEADER_HIDE_PATHS line 77 (등재) / PAGE_TITLES line 89"
  - "OQ 5건 + 각 default 답 (엑셀 버튼 / chrome / 폰트 격상 / 셀 hex+opacity / today border+공휴일 색)"
affects:
  - "다음 wave W2 (sketch-wave-2-header-select.html) 진입 컨텍스트"
tech_stack:
  added: []
  patterns:
    - "27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조 mirror"
    - "13-schedule / 14-reports / 27-login 평면(flat sibling) 패턴 — sketch/ 서브폴더 없음"
    - "design-system §6 / §7 미적용 1줄 메타 동반 (memory feedback_tsx_wave_stat_card_drift 사고 방지)"
key_files:
  created:
    - "cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (400 lines)"
  modified: []
decisions:
  - "WorkShiftPage 가 226 lines 단순 페이지 → 4 sub-wave (W2~W5) 채택 (14-reports 6 sub-wave 보다 축소, 27-login W1 패턴 mirror)"
  - "메모리 룰 12개 inline 인용 — 27-login W1 10개 + WorkShiftPage 특화 2개 (holidays library gap + horizontal scroll) 추가"
  - "design-system §6 (Progress) / §7 (Stat Card) 미적용 — 출근부 페이지에는 진척률 도넛/통계 숫자 카드 없음. 1줄 메타로 명시 (W5 변환 wave executor 의 drift 사고 방지)"
  - "chrome 룰 직접 적용 X (출근부 = 점검 시리즈 아님). 헤더 패턴만 mirror 검토 + App.tsx line 71/74/77 실측 박제"
  - "OQ 5건 default 답: #1 엑셀 버튼 bg-safe-bar solid OK / #2 헤더 raised 유지 + 데스크톱 back X / #3 폰트 부분 절충 (10→12 상향 / 12 leading-none 유지 / 15→16 격상 검토) / #4 SHIFT_COLOR hex+22 인라인 유지 / #5 today/공휴일 색 토큰 치환 OK"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-21"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  lines_added: 400
---

# Phase quick-260521-sjj Plan 01: redesign/16-workshift sketch wave 1 Summary

WorkShiftPage.tsx (226 lines) 의 element 인벤토리 + 4 sub-wave 분배 + 디자인 룰 + 메모리 룰 12개를 verbatim 박제한 단일 진입점 markdown 1개 작성 (400 lines). 27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조를 mirror 하되, WorkShiftPage 특화 룰 2건 (holidays library gap + dashboard horizontal scroll) 추가. 코드 변경 0, sketch HTML 0 — 후속 wave W2~W5 진입의 단일 진입점.

## What Was Built

### wave-1-index.md (400 lines)

`cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md` — 7 섹션 구조:

- **§1. WorkShiftPage.tsx 인벤토리** — 5 영역 (공통 hook/state/handler / 헤더 / 년월 select / 표 영역 / 범례) × 6 컬럼 표 (영역/element/line 범위/역할/비즈 로직/후속 wave). 226 lines 실측 확인 + 비즈 로직 시그니처 (`SHIFT_COLOR` / `DOW_KO` / `RawShift` / `getMonthlySchedule` / `generateShiftExcel` / `STAFF_ORDER` / `SHIFT_LABEL` / `HDR_H=52` / `ROW_H=46`) 박제.

- **§2. 4 sub-wave 분배 plan** — W2 (헤더+년월select line 87~121) / W3 (표 영역 line 123~210) / W4 (범례 line 213~220) / W5 (TSX 변환 checklist markdown). 각 wave 행 아래 "보존 / 토큰 / 폰트" 3 미니 섹션 + 파일명 권장 (`sketch-wave-N-{slug}.html`).

- **§3. design-system.md v0.1.1 인용** — §1.1 (노안 친화) / §1.2 (정보 인지) / §1.3 (모바일/데스크톱 동일 폰트) / §6.1 (Progress Color Rule, 미적용) / §6.2 (Stat Card Number Color, 미적용) / §6.4 (Backgrounds & Gradients) / §7.1 (Iconography Lucide) 총 7 fence verbatim (open+close 14, 실측 18 — 일부 fence 안 sub-table 포함).

- **§4. 02+06 chrome 통일 룰** — 출근부 = 점검 시리즈 아님 → chrome 룰 직접 적용 X. 헤더 배경 / back button / BottomNav/AppHeader 숨김 3가지 mirror 검토. App.tsx 실측 박제:
  - line 71 `MOBILE_NO_NAV_PATHS` 에 `/workshift` 등재 → 모바일 BottomNav 숨김
  - line 74 `DESKTOP_NO_NAV_PATHS` 에 `/workshift` 미등재 → 데스크톱 BottomNav 표시
  - line 77 `DESKTOP_HEADER_HIDE_PATHS` 에 `/workshift` 등재 → 데스크톱 글로벌 AppHeader 숨김 + 자체 헤더
  - line 89 `PAGE_TITLES['/workshift']: '월간 출근부'` 등재

- **§5. 메모리 룰 inline 인용** — 12 룰 (27-login W1 10건 + WorkShiftPage 특화 2건):
  1. feedback_design_sketch_first
  2. feedback_redesign_sketch_rule_enforcement
  3. feedback_sketch_realistic_data
  4. feedback_planner_prompt_sketch_verbatim
  5. feedback_tailwind_token_class_pattern
  6. feedback_tailwind_w8_h8_is_48px
  7. feedback_text_caption_leading_none
  8. feedback_tsx_wave_emoji_dot_gap
  9. feedback_tsx_wave_stat_card_drift
  10. feedback_avoid_premature_confirmation
  11. **feedback_korean_holidays_library_gap** (★ WorkShiftPage 특화 — holidays.hyunbin.page fetch fallback try/catch → [] 패턴)
  12. **feedback_dashboard_horizontal_scroll** (★ WorkShiftPage 특화 — 날짜 열 flex-wrap 금지, 단일행+overflow-x:auto)

- **§6. negative rule** — sketch HTML 생성 금지 / WorkShiftPage.tsx + shiftCalc.ts + generateExcel.ts 코드 수정 금지 / 비즈 로직 시그니처 변경 금지 / 다른 페이지 영향 금지 / wrangler 명령 금지 / npm run deploy 금지 / sketch/ 서브폴더 도입 금지 / App.tsx 수정 금지 (총 8건).

- **§7. open questions** — 5건 + 각 default 답:
  - OQ #1 엑셀 저장 버튼 → `bg-safe-bar` solid 통일 (default OK)
  - OQ #2 헤더 chrome (raised vs page) + 데스크톱 back button (default raised 유지 / 데스크톱 back X)
  - OQ #3 폰트 격상 매핑 (default 부분 절충)
  - OQ #4 셀 SHIFT_COLOR hex+22 알파 (default 인라인 유지)
  - OQ #5 today border + 공휴일·주말 색 토큰 치환 (default 토큰 치환 OK)

## Decisions Made

1. **4 sub-wave (W2~W5) 채택** — WorkShiftPage 226 lines 단순 페이지 (LoginPage 220 lines 와 유사) 라 14-reports 의 6 sub-wave 보다 축소. 27-login W1 의 4 sub-wave 패턴 정확히 mirror.

2. **메모리 룰 12개 inline 인용** — 27-login W1 의 10건 표준 룰 + WorkShiftPage 특화 2건 (holidays library gap, dashboard horizontal scroll) 추가. 단순 cross-reference 까지 포함하면 unique 15건 (`feedback_*` 슬러그 grep 결과).

3. **design-system §6 / §7 미적용 명시** — 출근부 페이지에는 진척률 도넛 / 통계 숫자 카드 없음. fence 박제 후 "미적용" 1줄 메타 동반 (memory `feedback_tsx_wave_stat_card_drift` 의 W5 변환 wave executor drift 사고 방지 패턴).

4. **chrome 룰 직접 적용 X + 패턴 mirror 만** — 출근부 = 운영 일정 페이지 (점검 시리즈 아님). chrome 룰 §1 "3-Layer 배경 계층" / §3 "Zone wrapper" 등 직접 적용 안 됨. 헤더 배경 raised 유지 (02 InspectionPage 일관) + back button 패턴 mirror (w-8 = 48 함정 인지) + BottomNav/AppHeader App.tsx 실측 박제만.

5. **OQ 5건 default 답 확정** — 후속 wave 진입 시 사용자 컨펌 X 면 default 답으로 진행 (reasonable call). 모두 27-login + 14-reports W1 결정과 일관.

## Deviations from Plan

### Auto-fixed

**1. [Rule 2 - 코드 정합성] 폰트 사이즈 매핑 정정 (PLAN W3 보존/폰트)**

- **Found during:** §2.1 W3 작성 중 (line 197 shift cell 실측)
- **Issue:** PLAN.md line 207 W3 "폰트" 섹션이 fontSize 15 (cell shift) 언급. 실측 line 197 fontSize:15 일치. PLAN 정확 — deviation 아님.
- **Fix:** N/A — PLAN 의 fontSize 10/12/13/14/15 매핑이 실측과 모두 일치. 검수 통과.

**2. [Rule 3 - chrome 룰 추가 실측] §4 4번째 시사점 추가 (PLAN 4건 → 본 인덱스 3건)**

- **Found during:** §4 작성 중 (App.tsx line 74 `DESKTOP_NO_NAV_PATHS` 에 `/workshift` 미등재 — PLAN 에 명시 없음)
- **Issue:** PLAN 가 "MOBILE_NO_NAV_PATHS + DESKTOP_HEADER_HIDE_PATHS 실측" 만 요구. `DESKTOP_NO_NAV_PATHS` (line 74) 의 미등재 실측이 후속 wave (특히 W3 데스크톱 paddingTop 12vh + 사이드바 폭) 에 영향. 자동 추가 박제 (Rule 2 — 데이터 무결성).
- **Fix:** §4 에 3가지 패턴 모두 박제 + "데스크톱 사이드바 표시" 시사점 1줄 추가. PLAN 보다 명시도 강화.
- **Files modified:** `cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md` §4 만 (코드 변경 0).
- **Commit:** N/A (orchestrator Step 8 담당)

**3. [Rule 2 - memory rule 추가 인용] §3.7 §7.1 Iconography 박제 (PLAN drift 보정)**

- **Found during:** §3 design-system 인용 작성 중
- **Issue:** PLAN line 220 "§7.1 Iconography (Lucide)" 인용 요청. 실측 design-system.md §7.1 (line 358~363) 박제 + back button 인라인 SVG (line 98~100) → Lucide `ChevronLeft` 교체 후보 1줄 메타 추가. PLAN 정확 — 추가 deviation 없음.
- **Fix:** N/A — PLAN 의 §7.1 요구 그대로 박제.

전반적으로 PLAN 정확도 높음, 추가 4번째 실측 (DESKTOP_NO_NAV_PATHS) 만 자동 박제. 그 외 deviation 없음.

## Verification

자체 verify gate 모두 PASS:

| gate | 기대값 | 실측값 | 결과 |
|---|---|---|---|
| §1~§7 헤더 카운트 | =7 | 7 | PASS |
| sub-wave 표 W2~W5 행 | ≥4 | 4 | PASS |
| `feedback_*` unique slugs | ≥10 | 15 | PASS (12 명시 + 3 cross-ref) |
| `wrang` keyword | ≥1 | 3 | PASS |
| `deploy` keyword | ≥1 | 2 | PASS |
| OQ #1~#5 매치 | ≥5 | 19 | PASS |
| ``` fence | ≥6 | 18 | PASS (9 fence 블록) |
| WorkShiftPage.tsx 변경 | =0 | 0 | PASS |
| shiftCalc.ts 변경 | =0 | 0 | PASS |
| generateExcel.ts 변경 | =0 | 0 | PASS |
| git status (16-workshift/ 외) | clean | clean (wave-1-index.md 1개만) | PASS |

총 라인: **400** (PLAN 예상 280~380 + 약간 초과 — WorkShiftPage 특화 룰 2건 + §1.1 인벤토리 풍부 + §2.1 보존/토큰/폰트 W2~W5 4 wave 각 3 미니 섹션).

## Self-Check: PASSED

**1. File exists check:**

```
EXISTS: /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (400 lines)
```

**2. Commits exist check:** N/A — orchestrator Step 8 담당 (이 SUMMARY 작성 시점 commit 0).

**3. Source untouched check:**

```
git diff --name-only HEAD -- cha-bio-safety/src/pages/WorkShiftPage.tsx → 0 lines
git diff --name-only HEAD -- cha-bio-safety/src/utils/shiftCalc.ts → 0 lines
git diff --name-only HEAD -- cha-bio-safety/src/utils/generateExcel.ts → 0 lines
git status --short → ?? cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (untracked only)
```

ALL VERIFICATION PASSED.

## Next Steps

1. **사용자 컨펌 — §7 OQ 5건** 답변 받기. default 답 으로 진행 OK 면 단순 "OK" 응답으로 충분.
2. **W2 진입** = `sketch-wave-2-header-select.html` — `/clear` + 새 `/gsd:quick "redesign/16-workshift sketch wave 2: 헤더 + 년월 select"` 권장 (memory `feedback_gsd_workflow_strict`).
3. W2~W4 순차 진행 후 W5 TSX 변환 checklist markdown.

## Output Paths

- 산출물: `/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md`
- PLAN: `/Users/jykevin/Documents/cbc7119-design/.planning/quick/260521-sjj-redesign-16-workshift-sketch-wave-1-work/260521-sjj-PLAN.md`
- SUMMARY (this file): `/Users/jykevin/Documents/cbc7119-design/.planning/quick/260521-sjj-redesign-16-workshift-sketch-wave-1-work/260521-sjj-SUMMARY.md`
