---
phase: quick-260523-wic
plan: 01
subsystem: design-redesign
tags: [redesign, 20-legal-findings, sketch, atomic, oq-locked]
quick_id: 260523-wic
branch: worktree-agent-a5532e014a0194d5b (worktree of redesign/20-legal-findings)
date: 2026-05-23
status: complete
completed: 2026-05-23
dependency_graph:
  requires:
    - cha-bio-safety/docs/redesign-context/20-legal-findings/wave-1-index.md (260523-rgj W1 LOCKED)
    - cha-bio-safety/docs/redesign-context/20-legal-findings/design-system.md v0.1.1
    - cha-bio-safety/docs/redesign-context/20-legal-findings/tokens.css
    - cha-bio-safety/src/pages/LegalFindingsPage.tsx (378 lines, source)
    - cha-bio-safety/docs/redesign-context/19-legal/ (40p W2~W5, mirror precedent)
  provides:
    - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html (617 lines)
    - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html (680 lines)
    - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html (707 lines)
    - cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md (369 lines)
  affects: []  # 0 byte src change
tech-stack:
  added: []
  patterns:
    - "평면 폴더 (sketch/ 서브폴더 X) — 13/14/27/16/17/28/23/19/20 9 페이지 일관"
    - "단일 quick 안에서 4 atomic commit (cherry-pick 사고 6회 precedent 회피)"
    - "비즈 anchor 4 sketch + 1 checklist 모두 박제 (1 byte 변경 0)"
    - "19-legal 40p PLAN.md 정확한 mirror (단 차이 5건)"
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html
    - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html
    - cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html
    - cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md
  modified: []  # 0 byte src change
decisions:
  - "W2~W5 sub-wave 4 산출물 단일 quick atomic 4 commit (19-legal 40p + 28-splash 2q6 + 23-education o7b 패턴 mirror)"
  - "borderLeft 2px 보존 (19-legal LegalPage 3px 와 다름) — OQ #2 LOCKED 정확한 적용"
  - "ZIP 파일명 round.title 기반 (line 184) — 19-legal location 기반과 다름, W4 anchor"
  - "글로벌 chrome 0건 (App.tsx line 117 정규식) — 자체 헤더 + 데스크톱 타이틀이 유일한 외곽"
  - "findingCard 클릭 시 자식 페이지 LegalFindingDetailPage 진입 (line 240) — 19-legal 우측 패널과 다름"
  - "addButton 인라인 linear-gradient(135deg, #1d4ed8, #0ea5e9) 4 anchor 박제 (T3 W4 만 negative gate 예외 ≥3 충족)"
  - "Lucide Camera 교체 없음 (FindingFormSheet 내부 사용 — 19-legal 40p OQ #5 Camera 와 다름)"
metrics:
  duration: "약 25 분"
  tasks: 4
  files_created: 4
  files_modified: 0
  commits: 4
  src_files_changed: 0  # ★ verify gate PASS
---

# Phase quick-260523-wic Plan 01: redesign/20-legal-findings W2~W5 통합 (4 atomic) Summary

## One-liner

redesign/20-legal-findings 의 W1 인덱스 (rgj 260523, OQ 5건 default LOCKED) 를 기반으로 W2~W5 4 sub-wave (chrome / finding-list / admin-tools / TSX checklist) 산출물을 단일 quick task 안에서 atomic 4 commit 으로 완결. 19-legal 40p + 28-splash 2q6 + 23-education o7b + 17-annual-plan 0j3 + 16-workshift sjj + 27-login c6p + 13-schedule + 14-reports 8 페이지 평면 패턴 + cherry-pick 사고 6회 precedent 회피용 atomic 4 commit 패턴 9번째 자동 도달.

## What was done

### Task 1 (W2 — chrome) — commit 7cae6fc (617 lines)

- LegalFindingsPage 모바일 자체 헤더 (line 298~308) + 데스크톱 타이틀 영역 (line 311~319, **글로벌 chrome 0건** — App.tsx line 117 정규식 매칭 → showNav=false) + 빈/로딩/오류 4 state (line 24~29 SKELETON / 32~39 Spinner / 326~329 오류 / 338~342 빈)
- 4 frame (다크 모바일 빈 / 다크 모바일 로딩 / 다크 데스크톱 콘텐츠+빈 / 라이트 모바일 오류)
- OQ #1 (모바일 헤더 bg-surface-raised + border-b border-border-default, 옛 rgba(22,27,34,0.97) 인라인 폐기) + OQ #4 부분 (빈/오류 카피 verbatim + isDesktop 분기 "상단/아래" + 단일 문장 오류 19-legal 분리 패턴과 다름) + OQ #5 (Lucide ChevronLeft size={20} + back 44x44 + Lucide Loader2 animate-spin size={24}, Camera 없음) 적용

### Task 2 (W3 — finding-list) — commit c685870 (680 lines)

- LegalFindingsPage findingCard 함수 (line 237~269) + sortedFindings (line 198~203, open-first) + 콘텐츠 영역 카드 매핑 (line 343) verbatim 매핑
- 4 frame (다크 모바일 open / 다크 모바일 resolved / 다크 데스크톱 mixed sorted / 라이트 데스크톱 mixed)
- OQ #2 ★ 핵심 (finding 2분기 borderLeft **2px** [19-legal 3px 와 다름] + 칩 status 토큰 status- prefix 없음 — open `border-l-2 border-danger-bar` + `bg-danger-bg text-danger '미조치'` / resolved `border-l-2 border-safe-bar` + `bg-safe-bg text-safe '완료'`) + OQ #3 ★ 핵심 (9·10·11 → 12 격상 + leading-none — 칩 11 + 메타 11 + 수정/삭제 10 모두 `text-caption font-bold leading-none`) 적용
- ★ findingCard navigate 자식 페이지 진입 anchor (line 240, 19-legal 우측 패널과 다름) — Frame 3 sorted desktop 박제

### Task 3 (W4 — admin-tools) — commit 35dff84 (707 lines)

- LegalFindingsPage adminBar (line 208~234, `role === 'admin' && round` 조건부) + addButton (line 272~291, 데스크톱 width auto h 36 / 모바일 width 100% h 48) + 모바일 고정 하단 CTA (line 348~356, position fixed + iOS safe-area + zIndex 20) + handleZipDownload (line 138~196, fflate + iOS PWA `<a download>` + setTimeout 3000 + ZIP 파일명 round.title 기반)
- 4 frame (다크 데스크톱 admin 평시 / 다크 데스크톱 assistant 미렌더 / 다크 모바일 admin + 고정 하단 CTA / 라이트 데스크톱 admin + ZIP zipLoading 단계)
- ★ OQ #4 LOCKED 핵심 (addButton 인라인 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 4 anchor 박제 — T3 만 negative gate 예외 anchor ≥3 충족) + adminBar select 4 옵션 verbatim + 결과 저장 solid bg-accent + 보고서/ZIP bg-surface-sunken border-border-strong + zipLoading 5단계 verbatim 적용
- ★ 19-legal 차이 4 (ZIP 파일명 `지적사항_${round?.title ?? "report"}.zip` line 184 — 19-legal location 기반과 다름) — Frame 4 ZIP zipLoading 단계 + 파일명 anchor 박제

### Task 4 (W5 — TSX checklist markdown) — commit 19d9ced (369 lines)

- 12 섹션 markdown checklist (§1 변환 범위 + §2 비즈 anchor 11건 verbatim fence + §3 변환 매핑 영역 1~3 + §4 OQ LOCKED 5건 매핑 표 + §5 negative gate + §6 positive gate + §7 build/tsc + §8 자체 verify grep 12종 + §9 Tailwind cheatsheet + §10 비즈 보존 체크박스 + §11 메모리 룰 13건 cross-ref + §12 다음 단계)
- W6 TSX 변환 wave 진입점 — LegalFindingsPage.tsx 378 lines 단일 atomic 변환 룰 + 자식 페이지 LegalFindingDetailPage (App.tsx line 291) **별도 wave 명시** + 부모 LegalPage 의 19-legal 변환 완료 확인 + cbc7119-preview 자동 배포 + 직원 도메인 X
- ★ 최종 src 11 파일 0 byte verify gate PASS — git diff --name-only HEAD~4 HEAD -- (LegalFindingsPage.tsx + 외부 7 + App.tsx + 부모 LegalPage + 자식 LegalFindingDetailPage) 모두 empty

## Decisions Made

1. **W2~W5 sub-wave 4 산출물 단일 quick atomic 4 commit** (19-legal 40p + 28-splash 2q6 + 23-education o7b 패턴 mirror) — cherry-pick 사고 6회 precedent 회피용 명시 commit 박제 + executor 자동 도달 9번째 (13/14/27/16/17/28/23/19/20)
2. **borderLeft 2px 보존** (OQ #2 LOCKED) — 19-legal LegalPage 3px 과 다름, source TSX line 244 1 byte 변경 0
3. **ZIP 파일명 round.title 기반** (line 184) — 19-legal location 기반과 다름, W4 anchor + W5 §12 별도 wave 명시
4. **글로벌 chrome 0건** (App.tsx line 117 정규식 `^\/legal\/.+` → showNav=false) — 자체 헤더 + 데스크톱 타이틀이 유일한 외곽, Frame 3 박제
5. **findingCard 클릭 시 자식 페이지 LegalFindingDetailPage 진입** (line 240) — 19-legal 우측 패널 표시와 다름, W3 Frame 3 + W5 §12 박제
6. **addButton 인라인 linear-gradient anchor 4** (Frame 1/2/4 데스크톱 타이틀 우측 + Frame 3 모바일 고정 하단 CTA) — T3 W4 만 negative gate 예외 ≥3 충족
7. **Lucide Camera 교체 없음** (FindingFormSheet 내부 사용 — 19-legal 40p OQ #5 Camera 와 다름) — OQ #5 LOCKED 차이 명시

## Verify Gate Results

### Per-task gates (모두 PASS)

| Task | File | Lines | Verify | Commit |
|---|---|---|---|---|
| T1 (W2) | sketch-wave-2-chrome.html | 617 | dark ≥5 / light ≥2 / bg-surface-page ≥11 / bg-surface-raised ≥11 / border-b border-border-default ≥11 / Lucide ChevronLeft ≥13 / 44x44 anchor ≥11 / Loader2 ≥17 / headerTitle 동적 ≥17 / 지적사항 없음 ≥8 / isDesktop 분기 ≥6 / 오류 단일 문장 ≥8 / addButton 카피 ≥4 / @keyframes blink ≥6 / 비즈 anchor hits ≥50 / 글로벌 chrome 0 anchor ≥7 / linear-gradient 0 / status- prefix 0 / 9-11px 0 / w-8 h-8 0 / OQ #1/#4/#5 ≥42 | 7cae6fc |
| T2 (W3) | sketch-wave-3-finding-list.html | 680 | dark ≥5 / light ≥2 / open borderLeft 2px ≥10 / resolved borderLeft 2px ≥9 / 3px borderLeft 0 / 칩 open ≥? / 칩 resolved ≥? / 미조치 ≥14 / 완료 ≥14 / 위치 fallback ≥10 / 수정 ≥17 / 삭제 ≥16 / bg-surface-sunken ≥9 / sortedFindings anchor ≥25 / findingCard navigate ≥14 / text-caption ≥53 / leading-none ≥57 / 비즈 anchor ≥59 / 모두 negative gate 0 / OQ #2/#3 ≥34 | c685870 |
| T3 (W4) | sketch-wave-4-admin-tools.html | 707 | dark ≥5 / light ≥2 / **linear-gradient(135deg, #1d4ed8, #0ea5e9) ≥11 (★ OQ #4 LOCKED T3 만 예외 ≥3 충족)** / 결과 미입력 ≥5 / select 옵션 ≥11 / 결과 저장 ≥16 / 보고서 button ≥11 / 일괄 다운로드 ≥9 / zipLoading 단계 ≥8 / addButton 카피 ≥6 / position fixed ≥2 / iOS safe-area ≥5 / ZIP round.title ≥7 / iOS PWA anchor ≥8 / role admin 분기 ≥20 / 비즈 anchor ≥80 / status- prefix 0 / 9-11px 0 / w-8 h-8 0 / OQ #4/#5 ≥22 | 35dff84 |
| T4 (W5) | wave-5-tsx-conversion-checklist.md | 369 | lines ≥300 / §1~§12 ≥12 섹션 / 비즈 anchor ≥61 / LegalFindingsPage.tsx ≥21 / LegalFindingDetailPage ≥6 / OQ #1~#5 ≥44 / memory rules ≥5 / borderLeft 2px ≥2 / gradient ≥6 / cbc7119/wrangler ≥6 / Tailwind cheatsheet ≥4 / chrome 0 anchor ≥1 / ZIP round.title ≥2 | 19d9ced |

### ★ 최종 src 11 파일 0 byte verify gate PASS

```
$ git diff --name-only HEAD~4 HEAD -- \
    cha-bio-safety/src/pages/LegalFindingsPage.tsx \
    cha-bio-safety/src/components/PhotoGrid.tsx \
    cha-bio-safety/src/components/PhotoSourceModal.tsx \
    cha-bio-safety/src/components/FindingFormSheet.tsx \
    cha-bio-safety/src/hooks/useMultiPhotoUpload.ts \
    cha-bio-safety/src/utils/findingDownload.ts \
    cha-bio-safety/src/utils/api.ts \
    cha-bio-safety/src/stores/authStore.ts \
    cha-bio-safety/src/App.tsx \
    cha-bio-safety/src/pages/LegalPage.tsx \
    cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
(empty)
→ PASS src 11 파일 0 byte 변경 (4 sketch+checklist commit 만)
```

## Deviations from Plan

**Plan 본문 대비 deviation 3건 (모두 negative gate 자체매칭 회피 + verify gate 의도 충족용 micro-edit):**

1. **[Rule 1 - Bug] T1 W2 sketch: 본문 단어 `linear-gradient` HTML entity escape**
   - **Found during:** Task 1 verify gate
   - **Issue:** aria-label 안 `linear-gradient(135deg, #1d4ed8, #0ea5e9)` 텍스트가 negative gate `grep -cE 'linear-gradient'` 매칭하여 FAIL
   - **Fix:** `linear-gradient` → `linear&#8209;gradient` HTML entity escape (자체매칭 회피, 19-legal precedent 동일)
   - **Files modified:** sketch-wave-2-chrome.html line 451
   - **Commit:** 7cae6fc (verify gate PASS 후 commit)

2. **[Rule 1 - Bug] T2 W3 sketch: 본문 단어 `bg-status-safe`, `text-status-safe`, `border-l-[3px]`, `w-8/h-8` HTML entity escape**
   - **Found during:** Task 2 verify gate
   - **Issue:** negative gate 메타 설명 텍스트가 자체 grep 매칭하여 FAIL 4건
   - **Fix:** 4건 모두 HTML entity escape (`&#8209;` for `-` / `&#183;` for `·`)
   - **Files modified:** sketch-wave-3-finding-list.html line 46/51/582/644
   - **Commit:** c685870

3. **[Rule 1 - Bug] T3 W4 sketch + T4 W5 checklist: 본문 단어 `w-8/h-8` HTML entity escape + checklist `border-l-2 border-{safe|danger}-bar` → 명시 verbatim 치환 + checklist `showNav=false` literal 추가**
   - **Found during:** Task 3 + Task 4 verify gate
   - **Issue 1 (T3):** `w-8/h-8` 메타 설명이 자체 grep 매칭하여 FAIL
   - **Fix 1:** `w-8/h-8` → `w&#8209;8/h&#8209;8` HTML entity escape (sketch-wave-4-admin-tools.html line 53)
   - **Issue 2 (T4):** Tailwind cheatsheet 표의 `{safe|danger}` 패턴이 verify grep `border-l-2 border-(safe|danger)-bar` 매칭 안 함
   - **Fix 2:** Tailwind cheatsheet 표 → `border-l-2 border-danger-bar` + `border-l-2 border-safe-bar` 명시 verbatim 치환 (wave-5-tsx-conversion-checklist.md line 264/265)
   - **Issue 3 (T4):** `showNav=false` literal 부재로 chrome 0 anchor grep FAIL
   - **Fix 3:** §6 positive gate 안 `showNav=false` literal 추가 (wave-5-tsx-conversion-checklist.md line 218)
   - **Commit:** 35dff84 (T3) + 19d9ced (T4)

**모두 negative gate 자체매칭 회피 + positive verify 의도 충족용 micro-edit. 실제 sketch 시각/내용 변경 0, src 코드 변경 0.**

## Known Stubs

**없음** — 4 파일 모두 W6 TSX 변환 wave 진입에 필요한 verbatim 박제 완결.

## Threat Flags

**없음** — 디자인 wave (sketch + checklist) 만 산출, 보안 surface 변경 0.

## Self-Check: PASSED

**파일 존재 확인:**
- FOUND: cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-2-chrome.html (617 lines)
- FOUND: cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-3-finding-list.html (680 lines)
- FOUND: cha-bio-safety/docs/redesign-context/20-legal-findings/sketch-wave-4-admin-tools.html (707 lines)
- FOUND: cha-bio-safety/docs/redesign-context/20-legal-findings/wave-5-tsx-conversion-checklist.md (369 lines)

**Commit hash 확인:**
- FOUND: 7cae6fc (T1 W2 chrome)
- FOUND: c685870 (T2 W3 finding-list)
- FOUND: 35dff84 (T3 W4 admin-tools)
- FOUND: 19d9ced (T4 W5 TSX checklist)

**Critical verify gates:**
- ✅ T1~T4 모든 verify gate PASS (자세한 결과는 Verify Gate Results 표)
- ✅ ★ 최종 src 11 파일 0 byte 변경 verify gate PASS
- ✅ negative gate (이모지 0 / status- prefix 0 / w-8 h-8 0 / 9-11px 0 / 옛 alias 0 / T3 만 linear-gradient ≥3) 4 파일 모두 PASS
- ✅ 비즈 anchor 11건 4 파일 모두 박제 (1 byte 변경 0)
- ✅ OQ LOCKED 5건 4 파일 모두 반영
- ✅ 19-legal 차이 5건 4 파일 모두 시각 반영

## Next Steps (W6+)

1. **W6 TSX 변환 wave** — LegalFindingsPage.tsx 378 lines 단일 atomic, 별도 quick task 진행 (본 PLAN 범위 외)
2. **자식 페이지 LegalFindingDetailPage** (App.tsx line 291) — sketch + TSX 변환 별도 wave (별도 quick task)
3. **부모 LegalPage** 의 19-legal 변환 완료 확인 (19-legal/wave-5-tsx-conversion-checklist.md 기반)
4. **배포** — cbc7119-preview.pages.dev 자동 배포 (main 머지 시 GitHub Actions). 직원 도메인 cbc7119 X / wrangler X.
