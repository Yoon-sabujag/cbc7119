---
phase: 260518-nd0
plan: 01
subsystem: 12-staff-service-redesign
tags: [redesign, sketch, 12-staff-service, W9, state-matrix, toast-catalog]
provides:
  - "12-staff-service W9 sketch — single-source-of-truth for TSX 변환 wave (W10)"
  - "18 verbatim toast 카피 시각화 (success 6 / error 8 / loading 4)"
  - "9 region × 4~7 state matrix + light-frame cross-check"
requires:
  - tokens.css v0.1.0
  - typography.css v0.1.0
  - StaffServicePage.tsx (toast verbatim source)
affects:
  - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/09-states-sketch.html
tech-stack:
  added: []
  patterns:
    - "@keyframes spin (single definition) + .spinner (24/20/16) variants"
    - "shimmer skeleton (linear-gradient + animation 1.4s ease-in-out)"
    - "btn-disabled = surface-sunken + text-tertiary + border-default"
    - ".light-frame scoped 라이트 토큰 재정의 (W8 패턴)"
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/09-states-sketch.html
  modified: []
decisions:
  - "raw 11.5px font-size 도 12px 로 격상 (노안 룰 보수적 적용)"
  - ".light-frame 셀렉터를 [data-theme=\"light\"] 와 합쳐 라이트 토큰 단일 선언"
metrics:
  duration: "~30분"
  tasks-completed: 1
  files-changed: 1
  insertions: 1826
  completed: 2026-05-18
---

# Phase 260518-nd0 Plan 01: 12-staff-service W9 — All Region States Sketch Summary

W9 sketch — StaffServicePage 의 모든 region 의 모든 non-normal state (loading / empty / error / optimistic / disabled / blocked) 를 단일 sketch HTML 에 grid 로 모은 source-of-truth. TSX 변환 wave (W10) 가 cite 할 수 있도록 9 region × 4~7 state + 18 verbatim toast 카피 + light-frame cross-check 모두 포함.

## What Got Built

- `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/09-states-sketch.html` (1,826 lines)
  - **`<style>` 블록:**
    - tokens.css `:root, [data-theme="dark"]` (line 16~69) verbatim
    - tokens.css `[data-theme="light"]` (line 74~119) verbatim → `[data-theme="light"], .light-frame` 합치기
    - tokens.css Spacing + Radius + @media (≥768px) verbatim
    - typography.css 7 type-scale 클래스 + body + .leading-none + .font-medium/-semibold
    - `@keyframes spin` (단일 정의) + `.spinner` / `.spinner.sm` / `.spinner.md`
    - `@keyframes shimmer` + `.menu-card-mini.shimmer`
    - `.toast` + `.toast-icon.success/.error` + `.toast-floating`
    - `.btn-disabled` + `.cta-mini` variants (accent / outline / outline-accent / loading-safe / loading-accent / disabled)
  - **9 region row + 1 toast catalog + 1 light-frame cross-check:**
    1. Row 1 — 달력: 정상 / loading / empty / error (5×7 mini grid + dot duty)
    2. Row 2 — 식단 카드: 정상 / skeleton (shimmer) / empty / 식당 미운영
    3. Row 3 — PDF 업로드 dropzone: idle / dragover / uploading / success / error
    4. Row 4 — BottomSheet 휴가 폼 (모바일): 정상 / 주말 차단 / 공휴일 차단 / 점검일 경고 / 신청 중 / 신청 성공 / 신청 실패
    5. Row 5 — 데스크톱 중앙 폼: 신청 중 / 신청 성공 / 취소
    6. Row 6 — 데스크톱 우측 PDF 미리보기: 정상 / 생성 중 / 생성 에러 / 인쇄 준비 중 / 인쇄 성공 (A4 mini #ffffff)
    7. Row 7 — 식사 미사용 끼수: 비활성 (0끼) / 활성 (1끼+) / 클릭 후 토스트
    8. Row 8 — 휴가 종류 버튼: normal / selected / registered (✓ leading) / disabled
    9. Row 9 — CTA 트리오: 모두 활성 / 모두 비활성 / 신청 로딩 / 다운로드 로딩 / 인쇄 로딩
    10. Toast 카탈로그 — 18종 verbatim:
        - **success (6):** 휴가신청서 다운로드 완료 / 새 탭에서 인쇄 다이얼로그가 열립니다 / {N}일분 메뉴 등록 완료 / 취소되었습니다 / 연차 등록 / {N}일 등록
        - **error (8):** 생성 실패 / 인쇄 실패 / 식단표 분석 실패 / 해당 날짜에는 연차 신청이 불가합니다 / 오류가 발생했습니다 / PDF 파일만 업로드 가능합니다 / 기간과 휴가 종류를 선택하세요 / 오류 발생
        - **loading (4):** 휴가신청서 생성 중... / 인쇄 준비 중... / 식단표 분석 중... / 등록 중...
    11. 라이트 모드 cross-check — Row 1 정상+error, Row 3 idle+error, Row 9 활성+모두비활성 (총 6 state-card 라이트 토큰 자동 적용)

## Verification

### Plan Automated Block

```
W9 sketch verification PASS
```

### Negative Gates (모두 0 또는 expected count 충족)

| Gate | Result | Target |
|------|--------|--------|
| 이모지 (✓ / ! 제외) | 0 | 0 |
| status-fire / text-fire / bg-fire / --fire markup | 0 | 0 |
| alias var(--bg/--t1/--c-day/...) markup | 0 | 0 |
| 9·10·11px font-size | 0 | 0 |
| @keyframes spin 정의 | 1 | 1 |
| .spinner 클래스 사용 | 15 | ≥4 |
| light-frame 컨테이너 | 6 | ≥1 |
| HTML5 doctype | `<!DOCTYPE html>` | required |
| Toast 18종 verbatim | 18/18 OK | 18/18 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 11px font-size 3건 발견 (룰 위반)**
- **Found during:** Self-verify gate
- **Issue:** `.a4-mini-title` 와 2개 inline `.toast-icon.success` 가 font-size: 11px 사용 — 노안 룰 (typography.css 주석) 위반
- **Fix:** 모두 12px 로 상향
- **Files modified:** sketch/09-states-sketch.html
- **Commit:** 9acd4c9 (commit 직전 인-flight fix)

**2. [Rule 2 - Missing critical] 11.5px font-size — 노안 룰 보수적 격상**
- **Found during:** 11.5px sanity 추가 grep
- **Issue:** `.leave-type-btn` font-size 11.5px — plan 의 grep gate `font-size:\s*(9|10|11)px` 는 통과하지만 노안 룰 (12px 마지노선) 정신 위반
- **Fix:** 12px 로 상향 + height 26 유지 (라벨 한 줄 fit)
- **Files modified:** sketch/09-states-sketch.html
- **Commit:** 9acd4c9 (commit 직전 인-flight fix)

## Known Stubs

없음. sketch 는 정적 디자인 reference 이므로 stub 개념 N/A.

## Self-Check: PASSED

- ✓ FOUND: cha-bio-safety/docs/redesign-context/12-staff-service/sketch/09-states-sketch.html (1,826 lines)
- ✓ FOUND: commit 9acd4c9 (`git log --oneline -1 9acd4c9` resolves)
- ✓ Plan verify block PASS
- ✓ All 18 toast verbatim grep PASS
- ✓ Negative gates all 0
