---
quick_id: 260520-u3b
mode: quick
phase: quick
plan: 1
type: execute
wave: 1
status: complete
completed: 2026-05-20
commits:
  - 50b0e63
files_modified:
  - cha-bio-safety/docs/redesign-context/14-reports/wave-7-tsx-conversion-checklist.md
tags: [redesign, 14-reports, sketch-wave-7, tsx-conversion, verify-checklist]
---

# Quick 260520-u3b — redesign/14-reports sketch wave 7 (TSX 변환 verify checklist)

## One-liner

14-reports redesign 시리즈의 마지막 sketch wave — TSX 변환 wave (SW1~SW3) executor 가 1-pass 로 적용할 verify gate + region mapping + LOCKED 룰 박제 markdown 1개 파일 작성 (700 lines, 12 sections, 42 CSS class verbatim).

## 12 sections 체크 결과

| 섹션 | 제목 | 행 수 / 카운트 | 필수 |
|---|---|---|---|
| §1 | 개요 (Purpose / Scope / Status) | 29 lines | 채움 |
| §2 | W1~W7 LOCKED 인용표 | 18 row (≥10 PASS) | 채움 |
| §3 | W2~W6 CSS class 정의 verbatim 추출 | 121 lines / 42 class (≥30 PASS) | 채움 |
| §4 | Tailwind cheatsheet | 45 row 표 (≥28 PASS) | 채움 |
| §5 | NEGATIVE scope | 9 sub-section (§5.1~§5.9, ≥6 PASS) | 채움 |
| §6 | 3 Sub-wave 분할 (SW1/SW2/SW3) | 3 markers (≥3 PASS) | 채움 |
| §7 | source line ref 인용표 | 19 row (≥15 PASS) | 채움 |
| §8 | 메모리 룰 inline 인용 | 12 unique feedback_*.md (≥12 PASS) | 채움 |
| §9 | 인라인 style 화이트리스트 | 5 row + 이모지/그라데이션 0회 강제 | 채움 |
| §10 | 비즈 로직 보존 verify 체크리스트 | 20 checkbox row (≥15 PASS) | 채움 |
| §11 | verify gate per sub-wave | SW1 8 + SW2 10 + SW3 10 = 28 항목 (≥28 PASS) | 채움 |
| §12 | OQ (TSX SW1 진입 전 default 명시) | 5 OQ (≥4 PASS) | 채움 |

## verify gate 결과 (executor 자체 14건)

| # | 검증 항목 | 기대값 | 실측 | 결과 |
|---|---|---|---|---|
| 1 | `^## ` 헤더 ≥12 sections | ≥12 | 12 | PASS |
| 2 | CSS class verbatim fence ≥30 | ≥30 | 67 | PASS |
| 3 | W1~W7 LOCKED 표 행 ≥10 | ≥10 | 18 | PASS |
| 4 | Tailwind cheatsheet 표 행 ≥28 | ≥28 | 45 | PASS |
| 5 | source line ref 표 행 ≥15 | ≥15 | 19 | PASS |
| 6 | NEGATIVE scope sub-section ≥6 | ≥6 | 9 | PASS |
| 7 | sub-wave 정의 SW1/SW2/SW3 ≥3 | ≥3 | 3 | PASS |
| 8 | verify gate per sub-wave 항목 ≥28 | ≥28 | 28 (8+10+10) | PASS |
| 9 | 메모리 룰 unique feedback_*.md ≥12 | ≥12 | 12 | PASS |
| 10 | OQ § 12 항목 ≥4 | ≥4 | 5 | PASS |
| 11 | file size 500~700 lines | 500~700 | 700 | PASS |
| 12 | sketch HTML 생성 0 (markdown 만) | 0 | 0 | PASS |
| 13 | src+functions+migrations+scripts 변경 0 | 0 | 0 | PASS |
| 14 | wrangler 0 / `npm run deploy` 0 (단 negative scope 인용 허용) | ≥1 인용 | wrangler=3 / dep=2 | PASS (negative scope 박제) |

전 14건 PASS.

## W7 LOCKED 2건 박제 (본 wave 산출 결정)

- **W7 #1 LOCKED**: CSS class 처리 = `@layer components` 신규 파일 (`cha-bio-safety/src/styles/components.css` 단일 파일). 페이지별 분리 (`reports.css`) 안 함. 장기적으로 다른 페이지 재디자인도 합쳐 운영.
- **W7 #2 LOCKED**: sub-wave 분할 = 3 sub-wave (SW1 = components.css 신규 / SW2 = MobileReportsPage / SW3 = DesktopReportsPage), 각 atomic 1-commit. revert 단위 보장.

## TSX SW1 진입 전 OQ 5건 default 명시 (사용자 컨펌 대기)

- **OQ #1**: components.css 파일 위치 — default **(a) `cha-bio-safety/src/styles/components.css` 단일** (장기 유지보수 비용 낮음).
- **OQ #2**: SELECT_STYLE 처리 (line 306~313 상수) — default **(a) `.toolbar-select` CSS class 로 대체** (인라인 0, 상수 삭제).
- **OQ #3**: iconBtn / navBtn 상수 처리 (line 387~391, 393~398) — default **(a) CSS class 로 대체** (`.back-btn` / `.year-nav-btn` 사용, 상수 폐기).
- **OQ #4**: A4 미리보기 영역 `.a4-preview-table-placeholder` 추가 여부 — default **(c) wrapper layout 만 변환** (placeholder 0, ExcelPreview 본체 그대로 — W6 OQ #1 LOCKED 일관).
- **OQ #5**: TSX 변환 후 chunk size impact — default **(a) ±5KB OK** (components.css 신규 ~3KB + Tailwind className 길이 증가 자연스러움. 30~36KB 이내면 SW2/SW3 gate 통과).

## 산출 파일

- `cha-bio-safety/docs/redesign-context/14-reports/wave-7-tsx-conversion-checklist.md` (700 lines, 12 sections, 42 CSS class verbatim, 메모리 룰 12건, OQ 5건)

## Commit

| Hash | Message |
|---|---|
| `50b0e63` | `docs(14-reports): sketch wave 7 — TSX 변환 verify checklist (12 sections, 30+ CSS class verbatim 박제)` |

atomic 1-commit (markdown 1 파일 only). src/migrations/scripts 변경 0. wrangler / `npm run deploy` 0 (negative scope 인용만).

## 다음 액션

1. 사용자가 OQ 5건 default 컨펌 (별 의견 없으면 default 답 진행).
2. 컨펌 후 TSX 변환 wave SW1 진입 (components.css 신규):
   - 새 `/gsd:quick` 또는 `/gsd:execute-phase` 시작
   - 입력: 본 W7 checklist + sketch-wave-2~6.html + ReportsPage.tsx (405 lines) + ExcelPreview.tsx (535 lines, 무변경) + design-system.md + tokens.css + typography.css
   - 산출: `cha-bio-safety/src/styles/components.css` 신규 + `src/index.css` `@import` 추가
   - verify gate: SW1 8건 모두 PASS (§11 SW1 gate)
3. SW1 완료 후 SW2 (MobileReportsPage) → SW3 (DesktopReportsPage) 순차 진입. 각 atomic 1-commit.
4. SW3 완료 후 사용자 검수 (모바일 393px + 데스크톱 1280px + 다크/라이트) → main 머지 → cbc7119-preview 자동 배포.

## 워크트리 룰 준수 확인

- 브랜치 = `worktree-agent-a1c2a4d27388070a7` (b295b66 base 정렬 확인 완료, redesign/14-reports 라인에서 분기).
- wrangler 명령 0건 / `npm run deploy` 0건 (cbc7119-preview 자동 배포만).
- src/migrations/scripts 변경 0 (markdown 1 파일 only).
- 다른 페이지 (13-schedule / 02 / 06 등) 영향 0.

## Self-Check: PASSED

- 산출 파일 존재 확인: `cha-bio-safety/docs/redesign-context/14-reports/wave-7-tsx-conversion-checklist.md` (FOUND, 700 lines)
- 커밋 존재 확인: `50b0e63` (FOUND in `git log`)
- verify gate 14건 모두 PASS 출력 (ALL GATES PASS)
