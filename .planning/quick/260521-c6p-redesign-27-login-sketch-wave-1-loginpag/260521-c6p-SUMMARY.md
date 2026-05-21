---
phase: quick-260521-c6p
plan: 01
subsystem: redesign/27-login
tags: [redesign, 27-login, sketch-wave-1, index, login-page, pre-auth]
dependency_graph:
  requires:
    - cha-bio-safety/src/pages/LoginPage.tsx (220 lines, 분석 대상 — 수정 0)
    - cha-bio-safety/docs/redesign-context/27-login/27-login.md (페이지 컨텍스트 메타)
    - cha-bio-safety/docs/redesign-context/27-login/design-system.md (v0.1.1, verbatim 인용 source)
    - cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (인증 전 미적용 명시 source)
    - cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md (7 섹션 구조 mirror precedent)
    - cha-bio-safety/src/App.tsx (line 71/74 BottomNav 양쪽 숨김 실측)
  provides:
    - cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (W2~W5 단일 진입점)
  affects:
    - none (sketch HTML 0건, 코드 수정 0건)
tech_stack:
  added: []
  patterns:
    - "14-reports W1 7 섹션 구조 mirror — sub-wave 만 6 → 4 로 축소 (LoginPage 220 lines 단순 페이지 반영)"
    - "27-login/ 평면(flat sibling) 폴더 구조 — sketch/ 서브폴더 없음 (13-schedule + 14-reports 일관)"
    - "design-system.md 실측 §번호 사용 (§7.1 Iconography) — PLAN 의 §10 가정은 drift 보정"
key_files:
  created:
    - cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (343 lines)
  modified: []
decisions:
  - "27-login/ 평면 배치 채택 (sketch/ 서브폴더 X) — 13-schedule + 14-reports 패턴 일관"
  - "sub-wave 6 → 4 축소: W2 shell+wrapper+헤더 / W3 staff card grid / W4 로그인 폼+footer / W5 TSX checklist"
  - "design-system 인용 §번호 PLAN drift 보정: §10 → §7.1 실측 (Iconography Lucide)"
  - "OQ #1 로그인 버튼 그라데이션 → bg-safe-bar solid default (13-schedule W6 LOCKED b + 14-reports W1 OQ #1/#3 일관)"
  - "OQ #2 CARD_COLORS 6종 인라인 rgba 유지 default (status/duty 별개 카테고리 색, 27-login.md 섹션 4 명시)"
  - "OQ #5 로고 38×38 / 내부 icon 28×28 인라인 명시 default (memory feedback_tailwind_w8_h8_is_48px 함정 회피)"
  - "App.tsx 손대지 않음 — /login 이 MOBILE_NO_NAV_PATHS + DESKTOP_NO_NAV_PATHS 양쪽에 이미 등재됨 (line 71/74 실측)"
metrics:
  duration_minutes: 12
  completed_date: 2026-05-21
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  commit_count: 1
---

# Phase quick-260521-c6p Plan 01: redesign/27-login sketch wave 1 — LoginPage 인벤토리 인덱스 Summary

LoginPage.tsx (220 lines) 의 6 영역 인벤토리 + 4 sub-wave 분배 + design-system §1.1/§1.2/§1.3/§6.1/§6.2/§6.4/§7.1 verbatim 박제 + 메모리 룰 10건 + OQ 5건을 담은 wave-1-index.md 단일 markdown 산출 — sketch HTML 0건, 코드 변경 0건.

## What was done

후속 W2~W5 sketch/TSX 변환 wave 의 단일 진입점으로 기능할 `cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md` (343 lines) 1개 markdown 파일 작성. 14-reports W1 (260520-ep5) 의 7 섹션 구조를 mirror 하되 LoginPage 가 ReportsPage(405) 대비 짧은 220 lines 단순 페이지인 점을 반영해 sub-wave 만 6 → 4 로 축소.

### 7 섹션 요약

| 섹션 | 내용 |
|---|---|
| §1 | LoginPage.tsx 인벤토리 — 6 영역 표 (공통 hook/state/handler 1~80 / 모바일 헤더 204~213 / staff grid 85~115 / 로그인 폼 118~165 / footer 167~170 / 데스크톱 wrapper 175~198) |
| §2 | 4 sub-wave 분배 표 + 각 wave 의 보존/토큰/폰트 3 미니 섹션 |
| §3 | design-system v0.1.1 §1.1/§1.2/§1.3/§6.1/§6.2/§6.4/§7.1 fence verbatim 박제 (7 fence × 2 = 14 fence line) |
| §4 | 02+06 chrome 룰 인증 전 페이지 미적용 + App.tsx line 71/74 BottomNav 양쪽 숨김 실측 |
| §5 | 메모리 룰 10건 inline (각 룰 슬러그 + 1줄 요약 + Why + How — How 는 27-login 컨텍스트 구체화) |
| §6 | negative rule 8건 (sketch 금지 / 코드 수정 금지 / 워크트리 CLI 금지 / 운영 도메인 push 금지 / 평면 폴더 / App.tsx 미수정 등) |
| §7 | OQ 5건 (그라데이션 / CARD_COLORS / footer 폰트 / show-hide 토글 / 로고 박스) — 각 default 답 1줄 |

### 4 sub-wave 분배 (W2~W5)

| Wave | scope | 산출 파일 |
|---|---|---|
| W2 | 모바일 shell + 데스크톱 wrapper + 공통 헤더 (영역 2 + 영역 6) | sketch-wave-2-mobile-shell.html |
| W3 | 직원 카드 그리드 (영역 3, CARD_COLORS 6종 cycle + isSelected) | sketch-wave-3-staff-card-grid.html |
| W4 | 로그인 폼 + footer 안내문 (영역 4 + 영역 5) | sketch-wave-4-login-form.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | wave-5-tsx-conversion-checklist.md |

## Key decisions / deviations from PLAN

### Decision 1 — design-system 인용 §번호 보정 (PLAN drift)
- PLAN 은 §6 / §7 / §10 인용을 요청 — 실측 design-system.md (v0.1.1, c8bfa86) 에는 §10 없음 (§7 Iconography 까지). 따라서 §3 의 7번째 fence 박제 대상을 §10 → §7.1 (Iconography Lucide) 로 치환. PLAN 의 "design-system.md 안 섹션 번호/제목이 task_scope 가정과 다르면 실제 파일 기준으로 §번호를 맞춰 인용하고, 1줄 메타에서 그 차이를 명시" 룰을 그대로 따름.
- §3 머리말에 PLAN drift 보정 메타 1단락 박제 (실측 §6.1/§6.2/§6.4/§7.1 4개 사용).
- 14-reports W1 (260520-ep5) 의 §3.6 도 §7.1 Lucide 박제와 일관 — 본 결정은 precedent 와 일치.

### Decision 2 — 메모리 룰 12 unique (10 mandated + 2 bonus)
- PLAN 의 mandated 10건은 모두 inline 인용 완료. 추가로 `feedback_cbc7119_design_never_wrangler.md` (CLAUDE.local.md 룰 보강용) + `feedback_gsd_workflow_strict.md` (W5 진입 시 새 `/gsd:quick` 시작 권장 1줄) 2건 자연스럽게 등장 — verify 의 `grep -oE 'feedback_[a-z_]+'` 결과 unique 12 (≥10 만족). 14-reports W1 도 동일하게 룰 11 (보너스) 포함 패턴.

### Decision 3 — 4 sub-wave 분배 label 확정 (PLAN <interfaces> 권장안 = 실측 결과)
- PLAN 의 <interfaces> 가 권장한 label (mobile-shell / staff-card-grid / login-form / tsx-conversion-checklist) 이 인벤토리 실측 결과와 합리적 매핑 — label 변경 없이 그대로 §2 표에 확정.

### Decision 4 — line 범위 실측 vs PLAN 추정치 비교
| 영역 | PLAN 추정 | 실측 | diff |
|---|---|---|---|
| inner 정의 | line ~82~172 | line 82~172 | match |
| 모바일 헤더 | line ~204~213 | line 204~213 | match |
| 데스크톱 wrapper | line ~175~198 | line 175~198 | match |
| 데스크톱 카드 헤더 | line ~180~190 | line 180~190 | match |
| 데스크톱 카드 바디 | line ~192~194 | line 192~194 | match |
| inner staff grid | line ~85~115 | line 85~115 | match |
| inner 로그인 폼 | line ~118~165 | line 118~165 | match |
| inner footer | line ~167~170 | line 167~170 | match |

- 모든 line 범위가 PLAN 추정치와 일치 — drift 없음. §1 머리말에 1줄 명시 ("PLAN 추정치 + 27-login.md 메타 일치, drift 없음").

## Deviations from Plan

None - plan executed exactly as written. (Decision 1 의 §10 → §7.1 보정은 PLAN 자체의 "실제 파일 기준으로 §번호를 맞춰 인용" 룰을 따른 것이므로 deviation 이 아닌 PLAN 의 의도된 fallback 경로.)

## Auth gates

None - 인증 게이트 발생 없음 (markdown 작성만, 외부 API 호출 0).

## Verify gates (PASS 결과)

| gate | 기대값 | 실측 | 결과 |
|---|---|---|---|
| 1. 7 헤더 존재 (`grep -c '^# §[1-7]'`) | =7 | 7 | PASS |
| 2. sub-wave 분배 표 W2~W5 (`grep -E '^\| W[2-5] \|' \| wc -l`) | ≥4 | 4 | PASS |
| 3. 메모리 룰 unique (`grep -oE 'feedback_[a-z_]+' \| sort -u \| wc -l`) | ≥10 | 12 | PASS |
| 4. negative §6 안 워크트리 CLI 키워드 | ≥1 | 6 | PASS |
| 5. negative §6 안 운영 도메인 push 키워드 | ≥1 | 4 | PASS |
| 6. OQ 5건 (`grep -cE 'OQ #[1-5]'`) | ≥5 | 19 | PASS |
| 7. design-system fence (`grep -c '^\`\`\`'`) | ≥6 | 16 | PASS |
| 8. LoginPage.tsx 변경 0 (`git diff --name-only HEAD`) | 0 | 0 | PASS |

자체 verify 8 gate 모두 PASS — W2 진입 자격 (인덱스 단일 진입점) 충족. 단, 사용자 컨펌은 §7 OQ 5건 답변으로 별도 받음 (memory `feedback_avoid_premature_confirmation`).

## Commits

| Hash | Message | Files |
|---|---|---|
| 32e4937 | `docs(quick-260521-c6p): redesign/27-login sketch wave 1 index — LoginPage 인벤토리 + 4 sub-wave 분배 + 룰 박제` | cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (+343 lines) |

(SUMMARY.md / STATE.md 등 docs 아티팩트는 orchestrator 의 Step 8 에서 별도 commit.)

## Next steps

1. 사용자가 §7 OQ 5건 답변 (default OK / 변경 / 추가 의견)
2. 답변 후 `/clear` + 새 `/gsd:quick` 시작 (memory `feedback_gsd_workflow_strict`) → W2 sketch-wave-2-mobile-shell.html 작성
3. W2 → W3 → W4 → W5 순서로 sketch + TSX checklist 진행 → main 머지 → cbc7119-preview 자동 배포

## Self-Check: PASSED

- File EXISTS: `cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md` (343 lines, 8 verify gate 모두 PASS)
- Commit EXISTS: `32e4937` on branch `redesign/27-login` (verified via `git log --oneline -3`)
- LoginPage.tsx UNTOUCHED: `git diff --name-only HEAD -- cha-bio-safety/src/pages/LoginPage.tsx` = 0 lines
- sketch HTML 생성 = 0 (W2 부터)
- 다른 페이지 영향 = 0 (`git status` 에 27-login/ 외 변경 0)
