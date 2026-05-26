---
phase: quick-260526-re5
plan: 01
subsystem: redesign/29-extinguisher-public
tags:
  - redesign
  - 29-extinguisher-public
  - sketch
  - paper-form
  - print-design
  - w2
  - sketch-atomic
requirements:
  - W2-SKETCH-ATOMIC
  - OQ-LOCKED-5
  - BIZ-ANCHOR-27
  - PRINT-HEX-8
  - COPY-VERBATIM-17
dependency_graph:
  requires:
    - cha-bio-safety/docs/redesign-context/29-extinguisher-public/wave-1-index.md (W1 인덱스 + OQ LOCKED 5건 + 비즈 anchor 27건 + negative rule 22건 + 메모리 룰 12건 verbatim 인용 source)
    - cha-bio-safety/docs/redesign-context/29-extinguisher-public/ExtinguisherPublicPage.tsx (149 lines source markup)
    - cha-bio-safety/docs/redesign-context/29-extinguisher-public/typography.css (--font-sans = Pretendard 실측 → OQ #1 LOCKED 근거)
    - cha-bio-safety/docs/redesign-context/29-extinguisher-public/design-system.md (v0.1.1 §1.1 / §1.2 / §1.3 / §6 / §7 / §2.7 인용)
    - cha-bio-safety/docs/redesign-context/29-extinguisher-public/29-extinguisher-public.md (섹션 4 종이 양식 시각 보존 룰)
  provides:
    - cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html (W3 TSX 변환 wave 의 1 byte 변경 0 기준 자료)
  affects: []
tech-stack:
  added: []
  patterns:
    - 평면(flat) sketch 배치 — sketch/ 서브폴더 0 (13-schedule / 14-reports / 27-login / 16-workshift / 17-annual-plan / 28-splash / 23-education 일관 패턴 8번째 적용)
    - 단일 atomic sketch HTML (10-cctv-info 69 lines + 28-splash 4i9 + 23-education 9f32344 + 10-cctv-info 69 lines 단일 패턴 결합)
    - 머리 주석 OQ LOCKED 매트릭스 + 비즈 anchor 박스 + 메모리 룰 + negative rule 4중 박제 (28-splash precedent mirror)
    - 외곽 다크 chrome (rgb 14~26) 안에 흰 종이 양식 (#fff) scope 격리 노출 (10-cctv-info / 28-splash 패턴)
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html (757 lines, 단일 atomic sketch — 외곽 다크 chrome + 종이 양식 컨테이너 + 4 frame: 기본/점검기록 채워짐/loading/error)
  modified: []
decisions:
  - OQ #1 LOCKED 적용 — Noto Sans KR 인라인 보존. typography.css 실측 결과 --font-sans = 'Pretendard Variable', 'Pretendard', system-ui, -apple-system, sans-serif (line 14) 로 확인. 토큰 치환 시 Pretendard 적용 = 1 byte 변경 사고. 정확한 LOCKED 해석 = 인라인 "Noto Sans KR" 유지.
  - OQ #2 LOCKED 적용 — background #fff 인라인 보존. --surface-page 라이트와 값 일치하지만, 토큰 치환 시 다크 모드 자동 적용 위험. 인라인 hex 강제.
  - OQ #3 LOCKED 적용 — maxWidth 480 인라인 보존. Tailwind max-w-md (448) / max-w-lg (512) 모두 480 아님.
  - OQ #4 LOCKED 적용 — 점검관리자 정 '석현민' 하드코딩 sketch 보존. 동적 분기는 별도 quick task 후보 (이번 redesign 범위 X).
  - OQ #5 LOCKED 적용 — 부 점검관리자 빈 셀 sketch 보존. OQ #4 동적 분기 채택 시 함께 검토.
  - 단일 atomic 패턴 채택 (149 lines + 종이 양식 모방 + 시각 일관성) — 10-cctv-info 69 lines 단일 sketch + 28-splash 통합 atomic 패턴 결합. W2a/W2b 분할 후보 reject.
  - 평면 배치 — sketch/ 서브폴더 0. 13/14/16/17/27/28/23 일관 패턴 8번째 적용.
  - 외곽 다크 chrome (sketch 작업자용) 안에 흰 종이 양식 scope 격리. 10-cctv-info / 28-splash precedent mirror.
  - Frame 4종 작성 — 기본 (records 0) / 점검 기록 채워짐 (1월 무 / 4월 유 / 5월 무 / 8월 무 — status 분기 시각 비교) / loading (조회 중...) / error (데이터를 찾을 수 없습니다). 사용자 시각 컨펌 시 W3 에서 동일 처리.
metrics:
  duration: 약 6분 (read + sketch write + verify gate + 인라인 style 공백 hotfix 3건 + commit)
  completed: 2026-05-26
---

# Quick 260526-re5: redesign/29-extinguisher-public W2 sketch atomic Summary

ExtinguisherPublicPage.tsx (149 lines 인증 없는 public route `/e/:checkpointId` 소화기 점검표 종이 양식 모방 페이지) 전체를 단일 sketch HTML 1 파일 (757 lines) 로 visual mirror. OQ LOCKED 5건 + 비즈 anchor 27건 + 인쇄 색 hex 8종 + 카피 verbatim 17종 + 메모리 룰 12건 + negative rule 22건 머리 주석에 verbatim 박제 — W3 TSX 변환 wave 의 1 byte 변경 0 기준 자료.

## Tasks Completed

### Task 1 — sketch-wave-2-extinguisher-table.html 단일 atomic sketch 작성

- **Commit:** `46e43a3` — docs(quick-260526-re5): redesign/29-extinguisher-public W2 sketch atomic (sketch-wave-2-extinguisher-table.html 757 lines verbatim — OQ LOCKED 5 / biz anchor 27 / print hex 8 / copy verbatim 17 / memory rule 12)
- **Files Created:** `cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html` (757 lines)
- **Files Modified:** 없음
- **상세 산출물 (sketch HTML 구조):**
  - DOCTYPE + html lang="ko" + head meta charset/viewport + title `29 소화기 점검표 · v0.1.1 재디자인 시안 (W2 sketch atomic)`
  - **머리 주석 블록 (line 7~228, 222 lines)** — 6 섹션 박제:
    1. 파일 메타 (작성일 / quick id / 범위 / out of scope)
    2. ★ W1 OQ LOCKED 5건 매트릭스 (본 wave 작용 = O/X)
    3. 메모리 룰 12건 박제 (10 기본 + 29-extinguisher-public 특화 2건)
    4. ★ 비즈 anchor 27건 (wave-1-index.md §1.3 박스) verbatim 인용 — react-router/state/fetch 8건 + 비즈 로직 8건 + 인쇄 색/폰트/속성 15건 + 라벨/카피 verbatim 17종 + colgroup 비율 + ROW_H
    5. negative rule 22건 (wave-1-index.md §6 후속 wave 전달분) verbatim 인용
    6. 참고 메타 (precedent 3종 + 본 sketch 핵심 결정 4건)
  - **`<style>` 블록 (line 230~321, 91 lines)** — 2 scope 분리:
    - (a) sketch 외곽 chrome — body 다크 (rgb 14~26 #0a0d12 / #adb6c0) + h1/h2/p/.vp-desc. 28-splash + 10-cctv-info precedent mirror.
    - (b) ★ 종이 양식 페이지 컨테이너 — .ext-page (maxWidth 480 / Noto Sans KR 인라인 / #fff / #000 / fontWeight 700 / WebkitUserSelect+userSelect+WebkitTouchCallout 'none') / .ext-tbl (width 100% / borderCollapse collapse / border 2px solid #333 / fontSize 12 / #000 / fontWeight 700) / .ext-th (#f0ede5 / border 1px solid #999 / padding 5px 4px / fontSize 10 / fontWeight 700 / whiteSpace nowrap) / .ext-cl (border 1px solid #bbb / padding 5px 4px / fontSize 12 / fontWeight 700) — ExtinguisherPublicPage.tsx line 146~149 의 page/tbl/th/cl 4 객체 verbatim
    - (c) .ext-state — loading/error 시각 카피 컨테이너 (textAlign center / padding 40 / color #333 / fontSize 14)
  - **`<body>` 본문 (line 323~756, 434 lines)** — 4 frame:
    - Frame 1 — 기본 표시 (점검 기록 0건 / 점검관리자 정 석현민 / 종류 ABC 분말). 1~12월 좌측 6 셀 모두 빈 셀 + 우측 1~7월 정기점검 안내 PNG (rowSpan 7, height 245px) + 8월 소화기번호 라벨 + 9월 EXT-A-001-01 / 10월 설 치 장 소 라벨 + 11~12월 location rowSpan 2 'A동 1F 사무실 출입구 좌측' + 하단 빨강 푸터.
    - Frame 2 — 점검 기록 채워진 상태 (참고용 시각 비교). 1월 '무' / 4월 '유' / 5월 '무' / 8월 '무' status 분기 시각 차이 + 점검자 서명 셀 (signaturePad 미적용 — 종이 양식 인쇄 후 손서명 의도) verbatim.
    - Frame 3 — loading 상태 (.ext-page > .ext-state '조회 중...')
    - Frame 4 — error / cp null 상태 (.ext-page > .ext-state '데이터를 찾을 수 없습니다')

## Verification Results

Plan 의 verify gate 49 항목 + 추가 4 gate 모두 통과:

| Gate | 결과 |
| --- | --- |
| 파일 존재 (`test -f $FILE`) | OK |
| 줄 수 ≥ 250 (`wc -l ≥ 250`) | OK (757 lines) |
| grep 필수 토큰 49건 (`redesign/29-extinguisher-public W2`, `OQ LOCKED`, `비즈 anchor`, `negative rule`, `메모리 룰`, `260526-re5`, `Noto Sans KR`, `max-width: 480px`, hex 8종, 콜백 `031-881-7119`, 카피 verbatim 17종, 보존 속성 3건 `webkit-user-select` / `user-select: none` / `webkit-touch-callout`, `letter-spacing` / `0.15em`, `line-height: 1.4` / `line-height: 1.8`, `border-collapse: collapse`, border `2px solid #333` / `1px solid #999` / `1px solid #bbb`, colgroup 비율 `width:6%` / `3%` / `10%` / `13%` / `14%`, `height:35px` / `height:245px`, `font-weight: 700` / `font-weight: 900`) | OK (모두 매칭) |
| 이모지 0건 (head title 점 `·` 1건만 제외) | OK (`emoji count: 0`) |
| `cha-bio-safety/src/**` 변경 0 (`git diff HEAD --stat`) | OK (`src diff: 0`) |
| `cha-bio-safety/functions/**` 변경 0 (`git diff HEAD --stat`) | OK (`functions diff: 0`) |
| production 배포 도구 호출 0회 (CLAUDE.local.md 강제 + 본 wave 의 sketch HTML 1 파일만 추가) | OK (도구 호출 자체 없음) |
| status 단일 wrangler/deploy 파일 매칭 0 | OK (`wrangler/deploy files: 0`) |
| post-commit deletion 검증 (`git diff --diff-filter=D HEAD~1 HEAD`) | OK (NONE — 의도된 삭제 없음) |
| 브랜치 검증 | `worktree-agent-a8ca1630208fd6280` (parallel executor worktree) — base 46d1d8020 확인 OK |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 인라인 style 공백 누락 — verify gate 3 토큰 미스 hotfix**
- **Found during:** Task 1 verify gate 1차 실행
- **Issue:** 첫 Write 시 인라인 `style="...; line-height:1.4; ..."` (공백 없음) 형태로 작성 → verify gate 의 `grep -q "line-height: 1.4"` (공백 있음) 3 토큰 (`line-height: 1.4` / `line-height: 1.8` / `font-weight: 900`) 매칭 실패.
- **Fix:** Edit replace_all 3건으로 인라인 style 의 `line-height:1.4` → `line-height: 1.4` / `line-height:1.8` → `line-height: 1.8` / `font-weight:900` → `font-weight: 900` 공백 통일. 모든 매칭 (Frame 1+2 각 2건씩 총 6건) 일괄 수정.
- **Files modified:** `cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html` (commit 전, 같은 커밋에 묶음)
- **Commit:** `46e43a3` (단일 atomic commit 안에 포함)

### Auto-Added Critical Functionality

없음 — plan 의 verify gate + done criteria 가 이미 모든 critical 항목을 명시했고 추가로 필요한 비즈 보존이나 보안 항목 발견 0.

### Architectural Changes

없음.

## Auth Gates

없음 — sketch HTML 1 파일 작성, 외부 인증 의존성 0.

## Known Stubs

없음 — sketch HTML 은 표시 분기/라벨 룰을 코드 그대로 박제 (`feedback_sketch_realistic_data` 적용 — 임의 mgmtNo `EXT-A-001-01` 및 location `A동 1F 사무실 출입구 좌측` 은 sketch 시각 확인용 placeholder 임을 머리 주석에 명시).

## Threat Flags

없음 — sketch HTML 1 파일 (정적 문서), 네트워크 endpoint/auth path/file access pattern/schema 변경 0.

## TDD Gate Compliance

해당 없음 — sketch 작업 (TDD 대상 X).

## Self-Check: PASSED

1. **Created file 존재 검증:**
   - `cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html` — FOUND (757 lines)

2. **Commit 존재 검증:**
   - `46e43a3` — FOUND (`git log --oneline -3` 확인: `46e43a3 docs(quick-260526-re5): redesign/29-extinguisher-public W2 sketch atomic ...`)

3. **post-commit deletion 검증:**
   - `git diff --diff-filter=D HEAD~1 HEAD` — NONE (의도/비의도 삭제 0)

4. **Code 변경 격리 검증:**
   - `git diff HEAD -- cha-bio-safety/src/` → 0 lines
   - `git diff HEAD -- cha-bio-safety/functions/` → 0 lines

## Next Steps

1. **사용자 시각 컨펌** — 브라우저에서 `cha-bio-safety/docs/redesign-context/29-extinguisher-public/sketch-wave-2-extinguisher-table.html` 열어 4 frame (기본 / 점검 기록 채워짐 / loading / error) 종이 양식 시각 확인.
2. **main 머지** — 사용자 컨펌 후 worktree 머지 + GitHub Actions 자동 cbc7119-preview 갱신.
3. **W3 TSX 변환 wave 진입** — 별도 quick task 생성 (sketch CSS verbatim 인용 + 비즈 anchor 27건 1 byte 변경 0 verify gate + Tailwind class 치환표 + WebkitUserSelect 보존 + 인쇄 색 hex 보존 verify). sketch HTML 이 W3 의 1 byte 변경 0 기준 자료.

## Reference Patterns Applied

- **단일 atomic sketch** — 10-cctv-info 69 lines 단일 sketch (`project_redesign_10_cctv_info_status`) + 28-splash 4i9 단일 atomic (`project_redesign_28_splash_status`) + 23-education 9f32344 단일 atomic (`project_redesign_23_education_status`) 패턴 4번째 자동 도달.
- **머리 주석 OQ LOCKED 매트릭스 + 비즈 anchor + 메모리 룰 + negative rule 4중 박제** — 28-splash sketch-wave-2-splash.html (320 lines 통합) precedent mirror.
- **평면 배치 (sketch/ 서브폴더 0)** — 13-schedule / 14-reports / 27-login / 16-workshift / 17-annual-plan / 28-splash / 23-education 일관 패턴 8번째 적용.
- **외곽 다크 chrome 안 흰 종이 양식 scope 격리** — 10-cctv-info / 28-splash precedent.
- **`feedback_planner_prompt_sketch_verbatim`** — ExtinguisherPublicPage.tsx 의 page/tbl/th/cl 4 객체 grep 추출 후 sketch CSS 에 verbatim 인용 (추측 0).
- **`feedback_tsx_wave_stat_card_drift` 일반화** — 인쇄 색 hex 8종 + colgroup 비율 + ROW_H + letterSpacing/lineHeight 모두 verify gate grep 강제.
- **`feedback_check_branch_before_edit`** — 작업 시작 전 base commit 검증 + reset + post-commit deletion 검증 룰 적용.
