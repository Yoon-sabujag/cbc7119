---
phase: 260518-pe4
plan: 01
type: execute
wave: 1
status: complete
completed_at: 2026-05-18
commit: 893fb6e
files_modified:
  - cha-bio-safety/src/pages/StaffServicePage.tsx
tags:
  - redesign
  - tsx-conversion
  - tailwind-v0.1.1
  - staff-service
requirements:
  - REDESIGN-12-TSX-CONVERSION
---

# Phase 260518-pe4 Plan 01: StaffServicePage.tsx v0.1.1 Tailwind 변환 Summary

## One-liner

StaffServicePage.tsx (1552 lines) 의 legacy 인라인 style + alias 토큰을 v0.1.1 Tailwind class 로 재작성 — 모바일 BottomSheet + 데스크톱 3-panel + 달력 grid + 식단 + dropzone + PDF preview 모두 W1~W10 sketch 1:1 매핑, 비즈니스 로직 100% 보존 (atomic single commit).

## 변경 line 수

| Source | Target | Diff |
|---|---|---|
| 1552 lines | **1486 lines** | **-66 (-4.3%)** |

- 인라인 style 절감: ~120 → 34 case (§E 화이트리스트 한정, ~72% 감소)
- dead code 제거: `detailPanel` 86 lines (W10 OQ4 — 사용처 0)
- 토큰 변환은 컴팩트(class < inline style attribute string) 라서 줄 수 감소

## 변환된 region

W10 §3 의 9 region 모두 1:1 매핑 완료:

| Region | Source lines | 상태 | Sketch |
|---|---|---|---|
| `region.app-chrome` | 1023, 1281 | bg-surface-page / overflow-hidden | W1+W6 |
| `region.calendar` | 681~798 → 700~826 | 7×6 grid, aspect-square/[1.2], 12px+ text-caption | W2+W6 |
| `region.legend` | 800~824 → 828~870 | duty 4종 = bg-duty-* class / 카테고리 6종 = 정규화 hex inline / 반차 = gradient inline | W3 |
| `region.summary-cards` | 826~840 → 872~890 | flex-1 min-w-72, 정규화 hex, 연차 임계치 색 (>=3 #42d778 / <3 #facc15 / <1 #d74242) | W3 |
| `region.menu-cards` | 842~894 → 892~944 | grid-cols-2, 식단 cyan/magenta/orange (정규화 hex) inline bg with alpha | W4 |
| `region.menu-upload` | 984~1018 → 946~972 | label dropzone, 모바일 border / 데스크톱 border-2 border-dashed py-12 | W4 |
| `region.desktop-3panel` | 1020~1276 → 974~1192 | 3-panel flex layout, 좌측 1fr + 중앙 280px + 우측 1fr (max-w-595px) | W6 |
| `region.desktop-center-form` | 1041~1223 → 992~1156 | DOC_LEAVE_GRID 7행, lucide Check size=12, bg-safe-bar 휴가신청 CTA | W7 |
| `region.desktop-pdf-preview` | 1225~1273 → 1158~1211 | A4 max-w-595, lp[0..16] 17 instance overlay (fontSize: 12 정정 — W10 §10 화이트리스트) | W8 |
| `region.bottomsheet` | 1280~1549 → 1213~1466 | overlay rgba+animation jsx style, sheet rounded-t-[20px], drag handle w-9 h-1, Check size=12 in registered button | W5 |

## Negative gates (모두 0 hits 통과)

```
1. alias 토큰          : 0  (need 0) ✓
2. 이모지 (이미지 set) : 0  (need 0) ✓
3. U+2713 ✓ 글리프     : 0  (need 0 — lucide Check 대체) ✓
4. lg:* spacing 분기   : 0  (need 0 — token 자동 분기) ✓
5. 9·10·11px 인라인    : 0  (need 0 — 노안 룰) ✓
6. text-fire/bg-fire   : 0  (need 0 — UI-SPEC §3.4.1) ✓
7. 옛 카테고리 hex     : 0  (need 0 — 정규화 hex 26 instance) ✓
```

## Positive gates (모두 최소 hits 통과)

```
1.  bg-surface-*          : 27  (need ≥10) ✓
2.  text-text-*           : 57  (need ≥15) ✓
3.  border-border-*       : 19  (need ≥5) ✓
4.  text-safe/warn/dang/info: 7  (need ≥4) ✓
5.  bg-*-bar              : 3   (need ≥3) ✓
5b. border-*-bar          : 3   (보너스)
6.  bg-*-bg               : 4   (need ≥3) ✓
7.  bg-duty-*             : 4   (need ≥4) ✓
8.  정규화 hex            : 26  (need ≥6) ✓
9.  lucide-react import   : 1   (need ≥1) ✓
10. leading-*             : 58  (need ≥5) ✓
11. typography (text-N)   : 68  (need ≥15) ✓
```

## fontSize 인라인 (예외 §E #12)

- 잔존: **1 instance** — `ovAt` helper 안 `fontSize: 12` (PDF overlay 17개 span 모두 공유)
- Source 의 `fontSize: 10` → `fontSize: 12` 격상 (노안 룰)
- 체크박스 사각형 `width: 12, height: 12` 는 px 단위 아닌 number 라서 9-11px grep 미캐치 (의도)

## Build 결과

```
$ ./node_modules/.bin/tsc --noEmit
  exit 0 ✓ (0 errors)

$ npm run build
  ✓ built in 14.33s
  StaffServicePage chunk: 38.26 kB │ gzip: 12.08 kB
  PWA inject manifest: 82 entries (7881 KiB)
  exit 0 ✓
```

## 비즈니스 로직 보존 (NEGATIVE scope)

| 항목 | 보존 결과 |
|---|---|
| useQuery 6 keys (leaves/leaves-year/meals/schedule/holidays/menu) | ✓ 모두 보존 (queryKey 14 hits) |
| useMutation 4 (leaveApi.create/delete, mealApi.upsert, menuApi.upsert) | ✓ 모두 보존 (leaveApi 9 / mealApi 2 / menuApi 2) |
| toast.* 카피 18개 한글 verbatim | ✓ 보존 (25 calls — 변환 전과 동일) |
| lp[0..16] 17 좌표 0 변경 | ✓ 17 references |
| 상수 8종 (DOC_LEAVE_GRID, DOC_TO_API_TYPE, ANNUAL_TYPES, HOLIDAYS_FALLBACK, HALF_TYPES, SHIFT_LABEL, MONTH_NAMES, LEAVE_LABEL) | ✓ 0 변경 |
| LEAVE_TYPES rgb 정규화 update | ✓ A-5 정규화 좌표로 교체 (6 entries: 66,215,120 / 143,66,215 등) |
| LEAVE_BG 옛 hex → 정규화 hex update | ✓ #22c55e→#42d778 등 (11 entries) |
| SHIFT_BG alias → duty 토큰 update | ✓ var(--c-day) → var(--duty-day) 등 |
| calcLeaveQuota / HIRE_DATES | ✓ 0 변경 |
| calcProvidedMeals / calcWeekendAllowance import | ✓ 0 변경 |
| isBlocked / getCellInfo / getRawShift | ✓ 0 변경 (isBlocked 3 hits) |
| handleMenuUpload PDF 파싱 알고리즘 | ✓ 0 변경 |
| generateLeaveRequest / printLeaveRequest 호출 | ✓ 0 변경 |
| useIsDesktop() 분기 | ✓ 보존 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] tsc / vite 가 worktree node_modules 없이 실행 불가**
- **Found during:** Task 1 verify gate
- **Issue:** `npx tsc` 가 wrong package 호출 (typescript@latest npm cache lookup), 로컬 tsc 없음
- **Fix:** `npm install` 으로 node_modules 설치 후 `./node_modules/.bin/tsc --noEmit` 직접 실행
- **Files modified:** node_modules/ (gitignored, no commit)
- **Commit:** N/A (build artifact)

**2. [Rule 2 — Critical] 9px 인라인이 padding 인데 grep 이 캐치**
- **Found during:** Task 1 negative gate #5
- **Issue:** 소스 의 "오늘" 배지가 `padding: '3px 9px'` 사용 → 9px grep hit. font-size 아닌 padding 이지만 grep 통과 불가
- **Fix:** "오늘" 배지를 `px-2.5 py-0.5` Tailwind class 로 전환, inline padding 제거
- **Files modified:** StaffServicePage.tsx (1 instance, line ~764)
- **Commit:** 893fb6e (atomic)

**3. [Rule 2 — Spec compliance] bg-*-bar 0 hits → 3 hits 보강**
- **Found during:** Task 1 positive gate #5
- **Issue:** 휴가 신청 CTA 가 `bg-safe` (foreground green) 사용했는데 plan §A-2 cheatsheet 는 solid 배경에 `bg-*-bar` 권장
- **Fix:** desktop+mobile 휴가 신청 CTA 를 `bg-safe-bar` 로 / mobile PDF 다운로드 (source `#2563eb`) 를 `bg-info-bar` 로 (semantic differentiation from desktop accent)
- **Files modified:** StaffServicePage.tsx (3 instance)
- **Commit:** 893fb6e (atomic)

**4. [OQ4 default — dead code] detailPanel 제거**
- **Found during:** Task 1 sub-task 3
- **Issue:** W10 §3.1 + OQ4 default — detailPanel 변수가 정의되지만 어디서도 render 되지 않음 (모바일은 BottomSheet, 데스크톱은 중앙 폼)
- **Fix:** 86 lines 의 detailPanel 변수 + JSX 전체 삭제
- **Files modified:** StaffServicePage.tsx (line 896~982 source)
- **Commit:** 893fb6e (atomic)

### No User Permission Required

- 모든 deviation 은 Rule 1~3 적용 — 자동 처리, plan §C OQ default 룰 준수, 비즈니스 로직 0 변경 유지.

## 인라인 style 잔존 case 분포 (~34, source ~120)

§E 화이트리스트 한정:

| # | 카테고리 | 위치 | 갯수 |
|---|---|---|---|
| 1 | PDF overlay lp[0..16] | desktop right panel | ~17 (동적 left/top) |
| 2 | LEAVE_BG 셀 동적 bg | calendarGrid | 1 (변수 cellBg) |
| 3 | 반차 linear-gradient | calendarGrid + legend 반차 dot | 2 |
| 4 | boxShadow | "오늘" badge / PDF preview img / 셀 today shadow | 3 |
| 5 | animation jsx style | overlay fadeIn / sheet slideUp / spinner spin | 3 |
| 6 | 식단 alpha bg | 3 식단 카드 + 주말식대 안내 | 4 |
| 7 | 동적 color | dateColor / cellInfo 색 / shift 칩 SHIFT_COLOR | 6 |
| 8 | #facc15 노랑 (일수 표시) | desktop 폼 + mobile 시트 | 2 |
| 9 | #8f42d7 보라 (주말식대) | mobile 시트 | 1 |
| 10 | 셀 border 동적 (선택/오늘) | calendarGrid | 1 |
| 11 | 체크박스 12×12 | PDF preview | 1 |
| 12 | Webkit appearance / scrolling | input date / overflow-x | 3 |

총 ~34 case (target ~30-50). source 의 ~120 case 대비 **~72% 감소**.

## Lucide Check 사용처 (✓ U+2713 대체)

- desktop 휴가신청 폼 — `Check size={12}` × 1 (DOC_LEAVE_GRID 등록 표시)
- mobile BottomSheet 휴가 버튼 — `Check size={12}` × 1 (MOBILE_BTNS 등록 표시)
- 총 2 사용처 (renderered 시점 dynamic — `isRegistered && <Check />`)

## Self-Check: PASSED

**Files check:**
```
[ -f "cha-bio-safety/src/pages/StaffServicePage.tsx" ] && echo "FOUND: source"
$ FOUND: source

[ -f ".planning/quick/260518-pe4-.../260518-pe4-SUMMARY.md" ] && echo "FOUND: summary"
$ FOUND: summary
```

**Commit check:**
```
git log --oneline | grep -q "893fb6e" && echo "FOUND: 893fb6e"
$ FOUND: 893fb6e
```

## Next Steps

1. ~~atomic commit~~ ✓ (893fb6e)
2. SUMMARY.md ✓ (this file)
3. **Pending — orchestrator:** main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions, 메모리 룰 project_cbc7119_design_repo + reference_cbc7119_domain)
4. **Pending — 사용자:** 모바일 (393px) + 데스크톱 (1280px) 시각 검수 (5 region 인터랙션)
5. 직원 도메인 cbc7119.pages.dev 영향 0 (이 워크트리는 디자인 격리 — 메모리 룰 feedback_cbc7119_design_never_wrangler)

## CLAUDE.local.md 룰 준수

- wrangler 명령 실행: **0회** ✓
- npm run deploy: **0회** ✓
- StaffServicePage.tsx 외 다른 파일 수정: **0** ✓
- main push 발생: **0** (worktree branch 만 commit)
