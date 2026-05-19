---
phase: 260519-mxo
plan: 01
type: execute
wave: 1
status: complete
duration_minutes: 8
completed_at: 2026-05-19
files_created:
  - cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md
files_modified: []
commits:
  - 399d59c: "docs(13-schedule): wave 7 TSX 변환 verify checklist"
requirements_completed:
  - REDESIGN-13-W7-CHECKLIST
verify_gates: 14/14 PASS
provides:
  - "13-schedule TSX 변환 wave (Wave 8) 진입 전 LOCKED 룰 통합 가이드"
---

# Phase 260519-mxo Plan 01: redesign/13-schedule sketch wave 7 TSX verify checklist Summary

## One-liner

13-schedule TSX 변환 wave (Wave 8) executor 가 1-pass 로 적용할 LOCKED 룰 / verify gate / region 매핑 통합 markdown — sketch HTML 6장 (W1~W6) + SchedulePage.tsx 1062 lines + design-system.md / tokens.css / typography.css 의 모든 LOCKED 결정 16건 + 비즈 로직 보존 룰 + 인라인 style 화이트리스트 + Open Question 4건 + 메모리 룰 5건 inline 박제를 12 sections 520 lines 한 장으로 통합. 12-staff-service W10 (436 lines) 패턴 mirror.

## Generated artifact

- **Path:** `cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md`
- **Lines:** 520 (목표 ≥400 충족, 12-staff W10 436 줄 mirror — 13-schedule 의 추가 컨텍스트로 84 lines 더 길어짐: AddModal 5 cat 분기 + EditModal mirror + 6 wave LOCKED + 미리보기 테이블 31×21 cell 룰 분량)
- **Sections:** 12 (§1 Scope / §2 NEGATIVE / §3 Region / §4 Verify gates / §5 Cheatsheet / §6 Sub-task / §7 non-trivial / §8 LOCKED 표 / §9 비즈 verify / §10 inline whitelist / §11 검수 / §12 OQ) — empty section 0

## 14 verify gate 결과

| # | Gate | 기대 | 실제 | 결과 |
|---|---|---|---|---|
| 1 | 파일 존재 | exists | exists | PASS |
| 2 | LINES ≥ 400 | ≥400 | 520 | PASS |
| 3 | SECTIONS ≥ 12 | ≥12 | 12 | PASS |
| 4 | NEG_ITEMS ≥ 15 (verbatim / line N / toast.) | ≥15 | 111 | PASS |
| 5 | LOCKED_ROWS ≥ 13 (`^\| W[1-6]`) | ≥13 | 15 | PASS |
| 6 | CHEAT_ROWS ≥ 12 (`var\(--`) | ≥12 | 29 | PASS |
| 7 | MEMORY_HITS ≥ 5 (feedback_*.md) | ≥5 | 10 | PASS |
| 8 | SOURCE_LINES ≥ 10 (`line N`) | ≥10 | 99 | PASS |
| 9 | W10_REF ≥ 1 (12-staff mirror) | ≥1 | 4 | PASS |
| 10 | WRANGLER_DENY ≥ 1 | ≥1 | 1 | PASS |
| 11 | OQ_COUNT ≥ 4 (`OQ #[1-4]`) | ≥4 | 21 | PASS |
| 12 | INLINE_WL ≥ 1 (인라인 style / 화이트리스트) | ≥1 | 8 | PASS |
| 13 | EMOJI = 0 (Unicode 1F300-1FAFF / 2600-27BF) | 0 | 0 | PASS |
| 14 | "ALL 14 GATES PASS" 출력 | yes | yes | PASS |

**최종: ALL 14 GATES PASS**

## Key LOCKED rule 통계

### W1~W6 OQ count (16 LOCKED — §8 인용표)

| Wave | OQ count | 결정 요약 |
|---|---|---|
| W1 | 3 | event dot #94a3b8 (라이트) / 멀티데이 dot only / "오늘" 칩 제거 |
| W2 | 3 | 상태 칩 색 verbatim / FAB CTA 우하단 56px / 멀티데이 시간 자리 텍스트 |
| W3 | 3 | 모바일 미구현 / FAB 없음 / 1280px cramped 그대로 |
| W4 | 3 | BottomSheet 90dvh / 저장 var(--accent) solid / INSP_CATEGORIES native select |
| W5 | 2 (b 채택) | 카테고리 lock 메타 row / empty title inline 에러 |
| W6 | 1 | 엑셀 버튼 var(--status-safe-bar) solid |
| 노안 | 1 | 헤더 15→18 / 저장 14→16 / close X 28→32 + 14→16 |
| **Total** | **16** | — |

### 메모리 룰 5건 inline 인용 위치

- `feedback_tailwind_token_class_pattern.md` — §1.4 + §5.6 (status- prefix 정확 패턴 + lucide size prop)
- `feedback_tailwind_w8_h8_is_48px.md` — §1.4 + §5.4 (w-7=32 / w-8=48 함정, close X / 백버튼 32px)
- `feedback_planner_prompt_sketch_verbatim.md` — §1.4 + §7.10 (sketch CSS grep 추출 후 verbatim 인용)
- `feedback_tsx_wave_emoji_dot_gap.md` — §1.4 + §7.8 (이모지 0 + dot span 추가 markup verify)
- `feedback_text_caption_leading_none.md` — §1.4 + §7.9 (작은 컨테이너 안 text-caption → leading-none 명시)

추가 메모리 인용 (각 1회):
- `feedback_korean_holidays_library_gap.md` — §2 (HOLIDAYS_FALLBACK 사유)
- `project_redesign_workflow` — §11.6
- `feedback_cbc7119_design_never_wrangler.md` — §11.9 (wrangler 금지)
- `project_cbc7119_design_repo` / `reference_cbc7119_domain` — §11.8

## 다음 wave (Wave 8 — TSX 변환) 진입 전 사용자 컨펌 필요 사항

§ 12 의 4 Open Question, executor 가 시작 시점에 사용자에게 컨펌:

- **OQ #1**: 단일 atomic commit vs 6 sub-wave 분할 → default b) 6 sub-wave 분할 (SW1 page-shell / SW2 캘린더 / SW3 카드 / SW4 미리보기 / SW5 AddModal / SW6 EditModal+lucide+verify)
- **OQ #2**: lucide 도입 범위 → default a) 모두 lucide (Download / Plus / ChevronLeft / X / CheckCircle2 / AlertCircle 6개 + 시계 글리프 → Clock size 10)
- **OQ #3**: 미리보기 desktop-only 분기 implementation → default a) source `isDesktop && <MonthlyPlanPreview ... />` verbatim 유지
- **OQ #4**: INSP_CATEGORIES native `<select>` vs grid 칩 → default W4 OQ #3 LOCKED a 유지 (재확인 불필요)

## Deviations from Plan

None — plan 의 14 verify gate 모두 PASS, 단 emoji gate (#13) 가 첫 시도에서 1 hit (U+1F550 시계 글리프 — source line 325 의 시각 표기를 §8 LOCKED 표에서 verbatim 옮긴 결과 잔존) 잡혀 즉시 텍스트 표기 (`U+1F550`) + lucide 치환 안내로 재작성 후 통과. 추가 deviation 없음.

## Self-Check: PASSED

- **File exists:** `cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md` (520 lines)
- **Commit exists:** `399d59c` on `redesign/13-schedule` — `docs(13-schedule): wave 7 TSX 변환 verify checklist`
- **Constraints honored:**
  - SchedulePage.tsx 0 byte 수정 (snapshot 그대로)
  - wrangler / `npm run deploy` 0 호출 (워크트리 룰)
  - SUMMARY.md 위치 정확 (`.planning/quick/260519-mxo-redesign-13-schedule-sketch-wave-7-tsx-v/260519-mxo-SUMMARY.md`)
  - ROADMAP/STATE 직접 갱신 0 (orchestrator 처리 영역)
