---
phase: quick-260521-wmq
plan: 01
subsystem: redesign/17-annual-plan
tags: [redesign, 17-annual-plan, sketch-wave-1, index, annual-plan, calibration]
status: complete
mirror_of: cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (precedent)
dependency_graph:
  requires:
    - cha-bio-safety/src/pages/AnnualPlanPage.tsx (225 lines, 분석 — 수정 0)
    - cha-bio-safety/src/utils/generateAnnualPlan.ts (분석 — 수정 0)
    - cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (precedent)
    - cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (precedent)
    - cha-bio-safety/src/App.tsx (line 71/74/77/99 실측)
  provides:
    - cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md (W2~W5 단일 진입점)
  affects:
    - none (sketch HTML 0, 코드 0)
key_files:
  created:
    - cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md (430 lines)
  modified: []
metrics:
  completed_date: 2026-05-21
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  commit_count: 1
---

# Phase quick-260521-wmq Plan 01: redesign/17-annual-plan sketch wave 1 — AnnualPlanPage 인벤토리 인덱스 Summary

AnnualPlanPage.tsx (225 lines) 의 4 영역 인벤토리 + 4 sub-wave 분배 (옵션 C 캘리브 독립) + design-system §1.1/§1.2/§1.3/§6.1/§6.2/§6.4/§7.1 verbatim 박제 + 메모리 룰 13건 inline + OQ 5건을 담은 wave-1-index.md 단일 markdown 산출 — sketch HTML 0건, 코드 변경 0건.

## What was done

후속 W2~W5 sketch/TSX 변환 wave 의 단일 진입점으로 기능할 `cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md` (430 lines) 1개 markdown 파일 작성. 27-login + 16-workshift W1 의 7 섹션 구조 mirror 하되 캘리브 좌표 시스템 (15-daily-report 패턴) 보존 룰 추가.

### 7 섹션 요약

| 섹션 | 내용 |
|---|---|
| §1 | AnnualPlanPage.tsx 인벤토리 — 4 영역 표 (imports/상수 1~12 / hook+state+handlers 14~59 / previewImage 공통 element 61~103 / 데스크톱·모바일 layout 분기 106~224). §1.3 캘리브 좌표 시스템 보존 시그니처 별도 박스 (STORAGE_KEY / FINGER_OFFSET 60 / handleImageClick / handleImageTouch / yearPos overlay / preview asset / nextYear / generateAnnualPlan) |
| §2 | 4 sub-wave 분배 — 옵션 C 채택 (캘리브 시스템 W3 독립): W2 chrome / W3 preview-calibration / W4 download / W5 tsx-checklist + 각 wave 의 보존/토큰/폰트 3 미니 섹션 |
| §3 | design-system v0.1.1 §1.1/§1.2/§1.3/§6.1/§6.2/§6.4/§7.1 fence verbatim 박제 (20 fence) |
| §4 | App.tsx 실측 박제 — `/annual-plan` ∈ MOBILE_NO_NAV_PATHS (line 71) + PAGE_TITLES (line 99) / DESKTOP_NO_NAV_PATHS (line 74) 미등재 (사이드바 표시) / DESKTOP_HEADER_HIDE_PATHS (line 77) 미등재 (글로벌 AppHeader 표시). 데스크톱 = 글로벌 AppHeader + 자체 상단 바 둘 다 표시 (16-workshift 와 다른 점) |
| §5 | 메모리 룰 13 inline (10 기본 + feedback_pdflib_subset_false 폰트 임베딩 일반화 + project_redesign_15_daily_report_status 캘리브 precedent + cross-ref) |
| §6 | negative rule 11건 — sketch 금지 / 코드 수정 0 / 비즈 시그니처 변경 X / 다른 페이지 영향 X / wrangler 0 / `npm run deploy` 0 / 평면 폴더 / App.tsx 미수정 / 캘리브 좌표 시그니처 변경 X / preview PNG 경로 변경 X / Malgun Gothic 폰트 패밀리 보존 |
| §7 | OQ 5건 + 각 default 답 1줄 |

### 4 sub-wave 분배 (W2~W5) — 옵션 C 캘리브 독립

| Wave | scope | 산출 파일 |
|---|---|---|
| W2 | 모바일 + 데스크톱 chrome (헤더 + 상단 바) | sketch-wave-2-chrome.html |
| W3 | preview + 캘리브 좌표 시스템 (★ 단독 wave) | sketch-wave-3-preview-calibration.html |
| W4 | 다운로드 버튼 + 설명 (모바일/데스크톱) | sketch-wave-4-download.html |
| W5 | TSX 변환 verify checklist (markdown) | wave-5-tsx-conversion-checklist.md |

## Verify gates (PLAN automated, ALL PASS)

| gate | 기대값 | 실측 | 결과 |
|---|---|---|---|
| §1~§7 헤더 | =7 | 7 | PASS |
| W2~W5 sub-wave 행 | ≥4 | 4 | PASS |
| `feedback_*` unique | ≥10 | 13 | PASS |
| OQ #1~#5 anchor | ≥5 | 32 | PASS |
| design-system fence | ≥6 | 20 | PASS |
| AnnualPlanPage.tsx + generateAnnualPlan.ts 변경 | =0 | 0 | PASS |

## OQ 5건 default 답 (W1 §7 박제)

- OQ #1: 다운로드 버튼 `linear-gradient(135deg,#1e40af,#3b82f6)` → `bg-safe-bar` solid (default OK)
- OQ #2: 위치조정 토글 활성 색 → `border-accent + bg-accent/10 + text-accent` 토큰 (default OK)
- OQ #3: 폰트 격상 — 11→12 / 12→leading-none 유지 / 13→text-label / 14→text-body-sm / 모바일 헤더 14→16 / 다운로드 14→16 / 연도 오버레이 `min(1.4vw,16px)` 유지 (default 부분 절충)
- OQ #4: 모바일 back button + 다운로드 svg → Lucide `ChevronLeft size={15}` + `Download size={15}` 둘 다 교체 (default OK)
- OQ #5: 캘리브 안내 칩 rgba 인라인 유지 + preview border `border-accent` 토큰 치환 (default OK)

## Commits

| Hash | Message | Files |
|---|---|---|
| 2fe3103 | `docs(quick-260521-wmq): redesign/17-annual-plan sketch wave 1 index — AnnualPlanPage 인벤토리 + 4 sub-wave 분배 + 룰 박제` | wave-1-index.md (+430 lines) |

(원래 executor worktree commit a1ba6e1 → 부모 브랜치 자동 머지 안 됨 → orchestrator cherry-pick 으로 복구 → 2fe3103. 동일 사고 16-workshift sjj 에서도 발생, executor worktree commit propagation 이슈는 cherry-pick 으로 복구 가능.)

## Deviations from Plan

None — PLAN 그대로 실행. SUMMARY.md 만 executor 가 작성 안 함 → orchestrator 가 직접 작성 (Step 8 책임).

## Auth gates

None — markdown 작성만, 외부 API 호출 0.

## Next steps

1. 사용자 §7 OQ 5건 답변 (default OK / 변경 / 추가 의견)
2. 답변 후 W2~W5 통합 quick task (27-login f01 + 16-workshift t12 패턴) → atomic 4-commit
3. 이어 TSX 변환 quick task → main 머지 → cbc7119-preview 자동 배포

## Self-Check: PASSED

- File EXISTS: `cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md` (430 lines, 6 verify gate 모두 PASS)
- Commit EXISTS: `2fe3103` on branch `redesign/17-annual-plan`
- AnnualPlanPage.tsx + generateAnnualPlan.ts UNTOUCHED: `git diff` 0 lines
- sketch HTML 생성 = 0 (W2 부터)
- 다른 페이지 영향 = 0
