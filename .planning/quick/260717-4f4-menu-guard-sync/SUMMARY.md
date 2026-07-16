---
id: 260717-4f4
slug: menu-guard-sync
status: complete
created: 2026-07-17
completed: 2026-07-17
commit: f92719ea
deploy: https://5c79ccde.cbc7119.pages.dev
---

# SUMMARY — 식단표 가드 4종 + 토요일 저장/식대 정상화 (staging sync)

식단표 밀림 근본 수정(staging cbc7119-data 검증본 8a5f146+d16d84c+82875b5)을 prod 이식했다.
staging 은 별도 repo → cherry-pick 불가, **prod 소스 기준 재구현**.

## 이식 결과 (4파일 + 데이터)

| 파일 | 변경 | 방식 |
|---|---|---|
| `functions/api/menu/index.ts` | parser_version 게이트(MIN=2, 426) + 공휴일직후토 저장차단 제거 | staging diff 그대로(로직 동일) |
| `src/utils/api.ts` | `upsert(menus, pdfKey, parserVersion?)` | 동일 |
| `src/utils/mealCalc.ts` | isPrevDayHoliday 파라미터/분기 제거 → 공휴일직후토=일반토(제공1·5,500) | 동일 |
| `src/pages/StaffServicePage.tsx` | PARSER_VERSION=2 / colRanges=dateCols(토포함,토헤더경계) / 가드3종 실측보정 / upsert토큰 / menuData 공휴일직후토 숨김제거 / isPrevDayHoliday·prevYMD 정리 / **menuSection 토표시 하드닝** | 로직=diff, **표시=prod 인라인 재패치** |
| (D1) `holidays` | 제헌절(2026-07-17) 삭제 | prod D1 직접 |

## ★ prod≠staging 재패치 지점 (메모리 [[feedback_handoff_diff_prod_inline_vs_design_tailwind]])

menuSection 중식 카드: **staging=Tailwind `bg-[rgba(...)]`, prod=인라인 `style={{ background: ... }}`**.
staging diff old_string 그대로 붙이면 no-op → 의도만(게이트 `(lunch_a||lunch_b)` + A코너 `menu.lunch_a &&` 독립 렌더)
가져와 prod 인라인 유지하며 재패치.

## 검증

- `tsc` 0 오류 + `build` 88 precache. isPrevDayHoliday/prevYMD 잔재 0.
- **정합성**: 프론트 PARSER_VERSION=2 ↔ 백엔드 MIN_PARSER_VERSION=2, upsert 3인자 호출, 게이트 426.
- **staging 최종 vs prod 이식 로직 라인 1:1 대조**: colRanges=dateCols / emptyWeekdays>=2 / weekdayMenuCount<calendarWeekdays-1 /
  monday 계산 / PARSER_VERSION / (lunch_a||lunch_b) / MIN=2 / prevDayYMD 0 / isPrevDayHoliday 0 — 전부 일치.
- **라이브**: 배포 5c79ccde←f92719e. POST /api/menu 401(미들웨어 인증 먼저=라우트 정상). 게이트 426 실증은
  staging 이 admin 토큰으로 이미 완료(6.6).
- holidays 감사: 2026 23건 중 제헌절만 stale → 삭제. 7/17 남은 행 0.

## 배포

원자배포 1회(백엔드 functions + 프론트 함께) — 게이트↔토큰 정합. 게이트가 구 캐시 번들 426 은 의도된 동작.
holidays 삭제는 배포와 독립 D1 실행.

## 남은 것 / known-minor (staging 판단, 코드변경 안 함)

- prod 기존 `'\n'` 정상주/토요일 유령행은 이 변경으로 자동정정 안 됨 → 필요 시 재업로드(새 번들)로 덮어씀.
  (내가 260716 교정한 개행 데이터도 동일 — 재업로드 시 `' / '` 정규화.)
- 재업로드가 수기교정 토 행 덮어씀 = 평일과 동일 UPSERT semantics(의도).
- 게이트 426 시 R2 고아 PDF = 기존 4xx도 동일(관리자 전용).
- `thisYear` 하드코딩 연말경계 = 기존 이슈, 범위 밖.
