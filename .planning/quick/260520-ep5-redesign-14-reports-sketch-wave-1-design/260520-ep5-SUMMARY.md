---
phase: quick-260520-ep5
plan: 01
type: execute
wave: 1
status: complete
branch: redesign/14-reports
commit: ff2ed29
files_created:
  - cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md
files_modified: []
src_changes: 0
sketch_html_changes: 0
duration_minutes: ~10
completed: 2026-05-20
requirements_satisfied:
  - REDESIGN-14-WAVE1
tags: [redesign, 14-reports, sketch, wave-1, design-rule, index, memory-rule-pinning]
key_decisions:
  - "13-schedule 폴더 구조 실측 결과 = flat sibling (sketch-wave-N.html 직접 배치). 14-reports 도 동일 평면 배치 결정 — sketch/ 서브폴더 만들지 않음."
  - "산출 파일 명명 통일: sketch-wave-N-{slug}.html (W2~W6) + wave-7-tsx-conversion-checklist.md (W7). PLAN.md task_scope 의 'wave-N-*' prefix 와 본 인덱스의 'sketch-wave-N-*' prefix 차이 — 13-schedule 일관성 우선해서 후자로 통일 (인덱스 §2 명시)."
  - "메모리 룰 11건 inline (strict-regex 10 + 보너스 `feedback_cbc7119_design_never_wrangler.md` digit-포함 1)."
  - "OQ #1/#3: gradient → bg-safe-bar solid 통일 — 13-schedule W6 LOCKED b 일관 + design-system §6.4 룰."
  - "그라데이션 폐기 외 OQ default 답: 260px 유지 / footer 유지 / dot span / 11px 일괄 상향."
verify_gate:
  - "gate 1 (`# §[1-7]` 7 headers): PASS = 7"
  - "gate 2 (sub-wave rows `| W[2-7] `): PASS = 6"
  - "gate 3 (unique `feedback_*` strict regex `[a-z_]+`): PASS = 10"
  - "gate 4 (negative rule에 wrangler + npm-deploy 키워드): PASS = both ≥1"
  - "gate 5 (src/migrations/scripts/functions 변경): PASS = 0"
  - "gate 6 (OQ #N 항목): PASS = 5"
  - "gate 7 (fence ``` open+close): PASS = 14"
folder_structure_audit:
  measured: cha-bio-safety/docs/redesign-context/13-schedule/ 직속 = sketch-wave-1.html ... sketch-wave-6.html (6 sketch) + wave-7-tsx-conversion-checklist.md + 컨텍스트 4 (13-schedule.md, design-system.md, SchedulePage.tsx, tokens.css, typography.css) — flat, no sketch/ subdir.
  applied: 14-reports/ 도 동일 flat — wave-1-index.md 를 14-reports/ 직속에 배치.
open_questions_pending:
  - "OQ #1: 모바일 카드 그라데이션 → bg-safe-bar solid 통일? (default OK)"
  - "OQ #2: 데스크톱 좌측 패널 너비 260px 유지? (default 유지)"
  - "OQ #3: 데스크톱 일괄 다운로드 버튼 그라데이션 → solid 통일? (default OK)"
  - "OQ #4: 모바일 footer 안내 유지? (default 유지)"
  - "OQ #5: 카드 sub 가운뎃점 → dot span? (default dot span)"
next_wave: "W2 — sketch-wave-2-mobile-header-card.html (사용자가 §7 OQ 5건 컨펌 후 진입)"
---

# Quick 260520-ep5 — redesign/14-reports sketch wave 1 (index) SUMMARY

## 1. Outcome

단일 산출물: `cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md` (338 lines).

본 인덱스 1개 파일이 W2~W7 후속 wave 의 **단일 진입점**으로 자격을 갖췄음. 후속 wave 작업자(자기 자신이든 다른 세션이든)는 본 인덱스만 읽으면:
- ReportsPage.tsx (405 lines, 실측 확인) + ExcelPreview.tsx (535 lines) 의 element 가 6 sub-wave 로 어떻게 분배되는지
- design-system.md v0.1.1 §1.1/§1.2/§1.3/§6.1/§6.2/§7.1/§6.4 룰 verbatim
- 02+06 chrome 통일 룰의 14-reports 적용 범위 (헤더 폰트/뒤로 버튼/MOBILE_NO_NAV_PATHS)
- 메모리 룰 11건 (strict-regex 10 + 보너스 1) 의 inline 인용 + 14-reports 컨텍스트 적용법
- §6 negative rule (sketch HTML / 코드 수정 / 디플 명령 / 폴더 구조)
- §7 OQ 5건 + default 답

을 한 번에 파악할 수 있다.

## 2. Files

| Action | Path | Lines | Notes |
|---|---|---|---|
| Created | `cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md` | 338 | 7 sections + 11 memory rules + 5 OQ + 7 fences |

`git diff --stat HEAD~1 HEAD`:
```
 cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md | 338 ++++++++++++++++++++++++
 1 file changed, 338 insertions(+)
```

## 3. Verify gate result (사용자 prompt 7-gate)

| Gate | Expected | Measured | Result |
|---|---|---|---|
| 1. `# §[1-7]` headers | =7 | 7 | PASS |
| 2. sub-wave rows `\| W[2-7]` | ≥6 | 6 | PASS |
| 3. unique `feedback_*` (strict `[a-z_]`) | ≥10 | 10 | PASS |
| 4a. wrangler keyword in §6 | ≥1 | 4 | PASS |
| 4b. npm-deploy keyword in §6 | ≥1 | 2 | PASS |
| 5. src/migrations/scripts/functions diff | =0 | 0 | PASS |
| 6. `- OQ #` items | ≥5 | 5 | PASS |
| 7. fence (open+close) | ≥6 | 14 | PASS |

전체 7-gate PASS.

## 4. 13-schedule 폴더 구조 실측 결과 + 평면 vs sketch/ 결정

`ls -la cha-bio-safety/docs/redesign-context/13-schedule/` 실측:

```
13-schedule.md
design-system.md
SchedulePage.tsx
sketch-wave-1.html
sketch-wave-2.html
sketch-wave-3.html
sketch-wave-4.html
sketch-wave-5.html
sketch-wave-6.html
tokens.css
typography.css
wave-7-tsx-conversion-checklist.md
```

- **결과**: 13-schedule 는 **평면(flat sibling) 패턴**. `sketch/` 서브폴더 없음. sketch HTML 6개 (`sketch-wave-1.html` ~ `sketch-wave-6.html`) + W7 checklist markdown (`wave-7-tsx-conversion-checklist.md`) 모두 `13-schedule/` 직속에 배치.

- **결정**: 14-reports 도 동일하게 **평면 배치**. 본 wave 산출 파일 (`wave-1-index.md`) 도 `14-reports/` 직속. PLAN.md context line 71~73 의 "13-schedule 패턴 mirror — sketch/ 서브폴더 만들지 말 것" 일관.

- **사유**:
  1. 일관성 — 13-schedule 와 같은 폴더 운영 패턴
  2. 평면 배치가 ls 결과를 단순화하고 wave 진행 순서를 명확히 보여줌
  3. sketch/ 서브폴더는 12-staff-service 시리즈 (cha-bio-safety/docs/redesign-context/12-staff-service/sketch/ 의 10-tsx-conversion-checklist.md 패턴) 에서 사용됐지만, 직전 13-schedule 가 평면으로 회귀한 패턴을 mirror

- **PLAN.md task_scope 의 "wave-1-index.md" 위치**: PLAN.md frontmatter `files_modified` = `cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md` (평면). 사용자 prompt files_to_read 의 "sketch/wave-1-index.md" 와 약간 불일치하지만, PLAN.md (사용자가 직접 dispatch 한 권위 문서) 우선 적용.

## 5. OQ §7 5건 (W2 진입 전 사용자 컨펌 대기)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 OQ 5건. 각 OQ 의 default 답을 본 인덱스 §7 에 명시.

- **OQ #1**: 모바일 카드 그라데이션 (`linear-gradient(135deg,#1d4ed8,#2563eb)`, ReportsPage.tsx line 370) → `bg-safe-bar` solid 통일 OK? — default: **OK** (13-schedule W6 LOCKED b 일관 + design-system §6.4 의 CTA 그라데이션 폐기 룰).

- **OQ #2**: 데스크톱 좌측 패널 너비 — 현재 260px 유지 / `--sidebar-width` 토큰 도입 / 너비 조정 중 어느 것? — default: **260px 유지** (design-system 토큰에 `--sidebar-width` 없음).

- **OQ #3**: 데스크톱 상단 바 일괄 다운로드 버튼 그라데이션 (line 202) → solid 통일 OK? — default: **OK** (OQ #1 과 동일 일관).

- **OQ #4**: 모바일 footer 안내 "다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)" (line 380) 유지/제거/위치 변경? — default: **유지** (사용자 가이드 정보, 카피 변경은 메모리 룰 3 위반 위험).

- **OQ #5**: 카드 sub 가운뎃점 `·` (line 13 `'DIV · 34개소'` + line 360 `{card.sub} · {year}년도`) — dot span / 텍스트 가운뎃점 / 13-schedule 패턴 따를지? — default: **dot span** (`<span class="text-text-tertiary">·</span>`, 13-schedule sub-wave 일관 + 메모리 룰 8).

## 6. Memory rules pinned (11건, 본 인덱스 §5 안 inline 인용)

strict-regex 10 + 보너스 1:

1. `feedback_design_sketch_first.md` — spacing/sizing sketch 먼저
2. `feedback_redesign_sketch_rule_enforcement.md` — negative rule 4중 강화
3. `feedback_sketch_realistic_data.md` — 표시 분기/카피 verbatim
4. `feedback_planner_prompt_sketch_verbatim.md` — sketch CSS grep 추출
5. `feedback_tailwind_token_class_pattern.md` — status- prefix 없음
6. `feedback_tailwind_w8_h8_is_48px.md` — w-8 = 48px 함정 (digit 포함, inclusive regex)
7. `feedback_text_caption_leading_none.md` — 작은 컨테이너 leading-none
8. `feedback_tsx_wave_emoji_dot_gap.md` — 이모지 제거 + dot span 추가
9. `feedback_tsx_wave_stat_card_drift.md` — Stat Card 룰 verbatim
10. `feedback_avoid_premature_confirmation.md` — "거의 일치" 자신감 금지
11. `feedback_gsd_workflow_strict.md` — `/gsd:quick` 또는 `/gsd:execute-phase` 시작 필수 (보너스)

추가 mention (negative rule 안): `feedback_cbc7119_design_never_wrangler.md` (digit 포함, inclusive regex 만 match).

## 7. Negative rule audit

본 wave 에서 금지된 행동 모두 준수:

- sketch HTML 생성 0건 (W2 부터) ✓
- ReportsPage.tsx / ExcelPreview.tsx / src/** 변경 0줄 (`git diff` 확인) ✓
- 다른 페이지 (13-schedule 등) 변경 0건 ✓
- 디플 명령 실행 0건 (CLAUDE.local.md 워크트리 룰) ✓
- 13-schedule 폴더 구조 일관 — 평면 배치 (sketch/ 서브폴더 X) ✓
- App.tsx 변경 0건 — `MOBILE_NO_NAV_PATHS` 이미 `/reports` 등재됨 ✓
- atomic 1-commit (ff2ed29, 1 file changed) ✓

## 8. Self-check

- [x] `wave-1-index.md` 파일 존재 (`cha-bio-safety/docs/redesign-context/14-reports/`)
- [x] 7 헤더 (§1~§7) 모두 존재
- [x] sub-wave 분배 표 W2~W7 6 row
- [x] 메모리 룰 strict-regex 10 unique
- [x] negative rule 안 wrangler + 디플 명령 키워드 모두 포함
- [x] OQ 5건 + 각 default 답 1줄
- [x] 코드 변경 0건
- [x] commit ff2ed29 (1 file, 338 insertions)
- [x] 13-schedule 폴더 구조 mirror — 평면 배치

## 9. Next

- 사용자가 §7 OQ 5건 컨펌 → W2 (`sketch-wave-2-mobile-header-card.html`) 진입
- W2 진입 시 새로운 `/gsd:quick` 또는 `/gsd:execute-phase` 시작 (memory `feedback_gsd_workflow_strict.md`)
- W2~W7 모두 본 인덱스의 §2 분배 + §3 룰 + §5 메모리 룰 따라 작성
