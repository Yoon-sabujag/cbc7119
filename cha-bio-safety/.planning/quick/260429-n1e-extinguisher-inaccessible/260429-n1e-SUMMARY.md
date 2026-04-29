---
phase: quick-260429-n1e
plan: 01
subsystem: inspection
tags: [inspection, extinguisher, migration, auto-complete, access-blocked]
requires:
  - InspectionPage 완강기 자동완료 패턴 (line 4037~4063)
  - AccessBlockedPopup includes('접근불가') 트리거 (수정 없음)
provides:
  - 소화기 카테고리 진입 시 접근불가 cp 자동 'normal' 기록
  - 13개 소화기 cp description 라벨링 ('분말 [접근불가]' / '할로겐 [접근불가]')
affects:
  - 점검 완료율 통계 (소화기 카테고리)
  - AccessBlockedPopup 노출 (신규 description 포맷도 매치)
tech-stack:
  added: []
  patterns:
    - useRef 1회 가드 + useEffect 자동 처리 (완강기 패턴 재사용)
key-files:
  created:
    - migrations/0075_extinguisher_inaccessible_marks.sql
  modified:
    - src/pages/InspectionPage.tsx
decisions:
  - description 매칭은 `includes('[접근불가]')` 대괄호 포함 부분 매치 — 분말/할로겐 prefix 보존
  - CP-FE-0427 은 14개 보고된 cp 중 이미 별도 갱신되어 마이그레이션 제외 (총 13개만 UPDATE)
  - 원격 D1 적용 / 배포는 사용자 별도 단계 — task 범위 밖
metrics:
  duration_min: 6
  completed_date: 2026-04-29
  task_count: 3
  file_count: 2
  commit: 7a9d3e7
---

# Quick 260429-n1e: 소화기 접근불가 개소 자동완료 + 14개 cp 마이그레이션 Summary

소화기 카테고리 진입 시 접근불가 표시된 cp 가 자동으로 'normal' 기록되도록 완강기 패턴을 동일하게 이식하고, 13개 소화기 cp description 을 '분말/할로겐 [접근불가]' 라벨로 갱신하는 0075 마이그레이션을 작성했다.

## What Changed

### 1. `migrations/0075_extinguisher_inaccessible_marks.sql` (신규)

두 개의 `UPDATE check_points` 문으로 13개 cp description 라벨링:

- **분말 9개**: `CP-FE-0044`, `CP-FE-0407`, `CP-FE-0408`, `CP-FE-0005`, `CP-FE-0010`, `CP-FE-0011`, `CP-FE-0414`, `CP-FE-0012`, `CP-FE-0415` → `'분말 [접근불가]'`
- **할로겐 4개**: `CP-FE-0416`, `CP-FE-0417`, `CP-FE-0418`, `CP-FE-0419` → `'할로겐 [접근불가]'`
- `CP-FE-0427` 은 이미 갱신되어 있어 제외 (헤더 주석에 명시)

원격 D1 적용은 사용자 배포 단계에서 별도 실행 — wrangler 호출 없음.

### 2. `src/pages/InspectionPage.tsx` (수정)

**2-1. `feAutoRef` 선언 추가** (line 3899 `wkAutoRef` 직후):

```ts
const feAutoRef = useRef(false)
```

**2-2. 소화기 자동완료 useEffect 추가** (완강기 useEffect 직후, `ensureSession` 선언 직전):

완강기 패턴과 동일하지만 차이는 두 가지:
- 카테고리 매칭: `'완강기'` → `'소화기'`
- description 매칭: `=== '접근불가'` (정확) → `?.includes('[접근불가]')` (부분 매치, 분말/할로겐 prefix 보존)

기존 스코프 식별자(`selectedGroupIdx`, `allCheckpoints`, `records`, `CATEGORY_GROUPS`, `ensureSession`, `inspectionApi.submitRecord`, `loadTodayRecords`)를 그대로 사용. 새 import 없음.

### 완강기 useEffect (line 4037~4063): 미변경
시그니처/동작 모두 한 글자도 건드리지 않음. `wkAutoRef` 출현 횟수는 5건으로 baseline 유지.

### AccessBlockedPopup: 미변경
기존 트리거(`description?.includes('접근불가')`)는 신규 포맷('분말 [접근불가]', '할로겐 [접근불가]') 도 그대로 매치하므로 코드 수정 불필요. 분석 후 task 범위 밖으로 확정.

## Verification

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Migration file exists | yes | yes | OK |
| `UPDATE check_points` count | 2 | 2 | OK |
| All 13 CP-FE IDs present in UPDATEs | 13 | 13 | OK |
| `CP-FE-0427` in any UPDATE | no | no (only in comment) | OK |
| `feAutoRef` count in InspectionPage | ≥ 4 | 5 | OK |
| `wkAutoRef` count (baseline) | 5 | 5 | OK (unchanged) |
| 소화기 자동완료 코멘트 존재 | yes | yes | OK |
| `npm run build` | success | success (10.09s) | OK |
| Commit file count | 2 | 2 | OK |
| Commit message contains `quick-260429-n1e` | yes | yes (`7a9d3e7`) | OK |

## Deviations from Plan

None — plan executed exactly as written.

### Note on User Verify Spec

The task brief's `<verify>` block included `grep -c "CP-FE-" migrations/0075_extinguisher_inaccessible_marks.sql == 13`. The actual count is 14 because the PLAN.md-mandated header comment on line 2 mentions `CP-FE-0427` as the excluded cp. The 13 IDs in the two UPDATE statements are all correct and complete. This is a brief-vs-plan count discrepancy on the explanatory comment, not a content defect — the SQL itself updates exactly 13 cps as required.

## Authentication Gates

None.

## Commits

| # | Hash | Type | Description |
|---|------|------|-------------|
| 1 | `7a9d3e7` | fix | 소화기 접근불가 개소 자동완료 + 14개 cp 마이그레이션 |

## Known Stubs

None.

## Out of Scope (per Task Brief)

- 원격 D1 적용 (사용자 배포 단계)
- `npm run deploy` (사용자 지시 대기)
- ROADMAP.md / .planning/ 갱신 (Do NOT commit docs)
- AccessBlockedPopup 코드 수정 (이미 신규 포맷 매치)

## Human Verification (Post-Deploy)

배포 후 사용자가 확인할 항목:
1. 원격 D1 에 `0075_extinguisher_inaccessible_marks.sql` 적용
2. PWA 재설치 (서비스워커 캐시 새로고침 — `feedback_pwa_cache_invalidation.md`)
3. 점검 페이지에서 소화기 카테고리 진입 → 14개 미점검 소화기가 자동으로 'normal' 기록됨 (memo='접근불가 개소 자동 정상처리')
4. 자동 처리된 cp 선택 시 AccessBlockedPopup 정상 노출

## Self-Check: PASSED

- File `migrations/0075_extinguisher_inaccessible_marks.sql` exists.
- File `src/pages/InspectionPage.tsx` modified with `feAutoRef` declaration + 소화기 useEffect.
- Commit `7a9d3e7` exists in git log with correct message and exactly 2 files.
- `npm run build` succeeded.
- Completed wkAutoRef baseline preservation (5 → 5).
