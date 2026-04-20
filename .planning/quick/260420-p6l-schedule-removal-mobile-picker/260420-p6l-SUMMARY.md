---
phase: 260420-p6l
plan: 01
subsystem: elevator
tags: [ui-cleanup, mobile-ux, dead-code-removal, react-query]
requires: []
provides:
  - mobile-annual-tab-full-list
  - safety-tab-schedule-card-removal
affects:
  - cha-bio-safety/src/pages/ElevatorPage.tsx
tech-stack:
  added: []
  patterns:
    - "모듈 스코프 Row 컴포넌트에 useQuery를 캡슐화하여 Hooks 규칙 위반 없이 리스트 병렬 fetch"
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/ElevatorPage.tsx
decisions:
  - "서버(/api/elevators/inspect-keys) 및 inspect_keys D1 테이블은 롤백 용도로 삭제하지 않고 유지"
  - "17대 병렬 fetch는 서버의 6h TTL 캐시(min_age=21600) + React Query staleTime 6h로 공단 API 직접 호출 없음"
  - "데스크톱 annual 탭(desktopRightTab === 'annual' 블록)은 이 작업 범위 밖으로 완전 미변경"
metrics:
  duration: "~15m"
  completed: "2026-04-20"
  tasks: 2
  files: 1
---

# Phase 260420-p6l Plan 01: 검사 일정 등록 UI 제거 + 모바일 검사 기록 탭 전체 리스트화 Summary

안전관리자 탭의 dead UI(🔍 검사 일정 등록 카드 + 관련 상태/쿼리)를 완전히 걷어내고, 모바일 "검사 기록"(annual) 탭을 cert_no 보유 호기 17대 전체 리스트로 재구성해 호기 선택 없이 바로 이력을 훑을 수 있게 개선.

## What Changed

**Removed symbols (7개, 총 −153줄):**
- `InspectionLookupInput` 컴포넌트 (구 line 2004-2091, ~88줄)
- `InspectKeyEntry` 타입 (구 line 2005)
- `inspectKeyList` state + 초기화 `useEffect` (구 line 475-480)
- `inspectKeysQuery` useQuery (구 line 453-474)
- `minwon24Query` useQuery (구 line 482-498, 주석 2줄 포함)
- `koelsaHistoryMobile` useQuery (구 line 511-519)
- `mobileCertNo` 지역 변수 (구 line 512)

**Removed UI blocks:**
- 데스크톱 safety 탭: `<InspectionLookupInput ... />` 렌더 (구 line 989-990)
- 모바일 safety 탭: `<InspectionLookupInput ... />` 렌더 (구 line 1408-1409)
- 모바일 annual 탭: 단일 호기 `<KoelsaHistorySection />` 블록 (구 line 1278-1289)

**Added:**
- `MobileAnnualRow` 컴포넌트 (신규 line 1954~1978, 25줄)
  - 모듈 스코프 함수 컴포넌트. `elevator.cert_no` 기반 `useQuery`(staleTime 6h) 1회 호출
  - 헤더: `prefix(EV|ES)-NN · classification` 포맷
  - `KoelsaHistorySection` 재사용 (`isMobile` 전달)
- 모바일 annual 탭 렌더 교체 (신규 line ~1230): `elevators.filter(cert_no).map(MobileAnnualRow)` + 빈 상태 fallback

**Net diff:** `cha-bio-safety/src/pages/ElevatorPage.tsx` 1 file changed, +31 / −153 lines (net −122).

## Task-by-Task

| Task | Commit | Description |
| ---- | ------ | ----------- |
| 1 | `65c700c` | 검사 일정 등록 UI 및 dead 상태/쿼리 제거 (7 심볼 중 5개 + 렌더 2곳 + 컴포넌트 정의) |
| 2 | `bec8bb5` | 모바일 annual 탭을 MobileAnnualRow 기반 17대 전체 리스트로 교체 (`koelsaHistoryMobile`/`mobileCertNo` 제거 포함) |

## Verification Results

**Task 1 grep (Task 1 커밋 직후):**
```
grep -cE "InspectionLookupInput|InspectKeyEntry|inspectKeyList|inspectKeysQuery|minwon24Query|검사 일정 등록|검사일정 등록" → 0
```

**전체 변경 검증 (두 커밋 후):**
```
grep -cE "InspectionLookupInput|InspectKeyEntry|inspectKeyList|inspectKeysQuery|minwon24Query|koelsaHistoryMobile|mobileCertNo" → 0
grep -cE "MobileAnnualRow" → 2   # 정의 1 + 렌더 1
grep -cE "KoelsaHistorySection" → 3  # import + 데스크톱 annual + MobileAnnualRow
```

**TypeScript:**
```
./node_modules/.bin/tsc --noEmit → 에러 0 (출력 없음)
```
(worktree에는 node_modules가 없어 메인 저장소 `/Users/jykevin/Documents/20260328/cha-bio-safety/node_modules` 를 심볼릭 링크로 연결 후 실행. 링크는 `.gitignore` 대상이라 커밋에 포함되지 않음.)

**서버/DB 무변경 (git diff --stat):**
- `cha-bio-safety/functions/**`: 변경 없음
- `cha-bio-safety/migrations/**`: 변경 없음
- `cha-bio-safety/wrangler.toml`: 변경 없음
- 전체 변경 파일: `cha-bio-safety/src/pages/ElevatorPage.tsx` 1개만.

**데스크톱 annual 탭 무변경:**
- `grep "desktopRightTab === 'annual'"` → line 478 (useQuery enabled 가드) + line 819 (렌더 블록) 여전히 존재
- `git diff ... | grep "desktopRightTab === 'annual'"` → 해당 범위 diff hunk 0건

## Deviations from Plan

None — plan executed exactly as written. 제거 대상 7개 심볼 + 렌더 3곳 + 컴포넌트 정의 1곳 모두 삭제, `MobileAnnualRow` 정의는 plan이 지정한 대로 `// ── 점검 기록 모달 ──` 블록 직전에 삽입. 데스크톱 annual 코드 경로 완전 보존.

## Manual Verification (배포 필요)

CLAUDE.md 정책 "프로덕션 배포 후 테스트" 원칙상, 다음 수동 점검은 **배포 후** 담당자가 확인해야 함 (executor는 배포 실행 권한 없음):

- [ ] 데스크톱 safety 탭에 🔍 검사 일정 등록 카드 없음
- [ ] 모바일 safety 탭에 🔍 검사 일정 등록 카드 없음
- [ ] 모바일 annual 탭: 호기 선택 없이 진입 → cert_no 보유 호기 세로 카드 리스트 표시 + 각 카드 펼침 동작
- [ ] 데스크톱 annual 탭 기존 동작 그대로(회귀 없음)

배포 명령: `cd cha-bio-safety && npm run build && wrangler pages deploy dist --branch production`

## Self-Check: PASSED

**Files:**
- `FOUND: cha-bio-safety/src/pages/ElevatorPage.tsx`

**Commits:**
- `FOUND: 65c700c` (Task 1 — refactor: 검사 일정 등록 UI 및 dead 상태/쿼리 제거)
- `FOUND: bec8bb5` (Task 2 — feat: 모바일 검사 기록 탭 17대 전체 리스트 교체)

---

## Revision — Year Picker + Collapsible Cards (2026-04-20)

### Trigger

사용자 피드백: bec8bb5 의 "17대 always-expanded" 리스트는 스크롤 길고 연도별 탐색이 어려움. 점검 기록(inspect) 탭처럼 상단 ◀/▶ 연 피커 + 호기 카드 펼침 패턴으로 통일 요청.

### Scope Delta

- **REMOVE:** `MobileAnnualRow` 컴포넌트(ElevatorPage.tsx 하단) — 17대 전체 세로 리스트 폐기
- **ADD:** 연도 피커 + cert_no 보유 호기 일괄 조회 + 선택 연도에 이력 있는 호기만 컴팩트 카드로 표시
- **PRESERVE:** 데스크톱 annual 탭(KoelsaHistorySection 재사용), KoelsaHistorySection 컴포넌트, inspectHistory.ts 유틸

### Implementation

- **Import:** `useQueries` 추가 (@tanstack/react-query, 이미 설치됨)
- **New state:**
  - `mobileAnnualYear: number` — 기본 현재 연도, 데이터 있는 가장 최근 연도로 auto-shift
  - `expandedMobileAnnual: Record<string, boolean>` — 호기 id → 펼침 여부
- **상위 리프트 쿼리:** `useQueries` 로 cert_no 보유 호기 전체(17대) 검사이력 일괄 조회. 각 staleTime 6h 유지(기존 MobileAnnualRow 동일) → React Query 가 cert_no별로 dedupe + 캐시하므로 데스크톱 annual 탭의 `koelsaHistoryDesktop` 와 queryKey 공유 시 자동 hit.
- **연도 Set:** 모든 쿼리 결과의 `history[].inspectDate.slice(0,4)` 에서 Set 추출 → 내림차순 정렬. 초기 로드 시 현재 연도에 데이터 없으면 `years[0]`(가장 최근)로 이동.
- **연도 피커 UI:** inspect 탭의 monthPicker 스타일 그대로 재사용 (32x32 버튼 + 중앙 "YYYY년"). years 내림차순 배열 기준으로 ◀=더 오래된, ▶=더 최근.
- **카드 리스트:** 선택 연도에 이력 있는 호기만 표시. 카드 헤더 = `{TYPE_ICON} {EV/ES-NN · classification} · N건 · 최근 YYYY-MM-DD + 판정 배지 + chevron`. 탭 시 해당 연도 items 상세(검사일/종류/판정/유효기간/기관/회사) + 부적합 상세(standardArticle/standardTitle/failDesc/failDescInspector) 인라인 렌더링.
- **판정 배지 색:** KoelsaHistorySection 과 동일 dispColor 함수를 로컬 복제 (합격→safe, 보완후합격/조건부→warn, 보완/불합격→danger).
- **Empty states:**
  - cert_no 등록 호기 0 → "공단 고유번호가 등록된 호기가 없습니다"
  - 전체 이력 없음(로딩 완료) → EmptyState 🔍 "등록된 검사 이력이 없어요"
  - 선택 연도에 이력 없음 → EmptyState 📋 "해당 연도에 검사 이력이 없어요"
- **정렬:** certElevators 는 passenger/cargo/dumbwaiter 가 number 오름차순, escalator 가 그 뒤로 (기존 bec8bb5 와 동일 로직).

### Verification

- **TypeScript:** `cd cha-bio-safety && npx tsc --noEmit` → exit 0 (0 errors)
- **Grep counts:**
  - `grep -c "MobileAnnualRow"` = **0** ✓ (old component removed)
  - `grep -c "mobileAnnualYear\|useQueries"` = **7** ✓ (≥2)
  - `grep -c "expandedMobileAnnual"` = **2** ✓ (≥2)

### Files Modified

- `cha-bio-safety/src/pages/ElevatorPage.tsx` (+215 / -38)
  - Imports: `useQueries` 추가
  - 2개 state 추가 (mobileAnnualYear, expandedMobileAnnual)
  - `useQueries` 블록 + mobileAnnualAvailableYears useMemo + initial year useEffect
  - `{tab === 'annual' && ...}` 블록 전체 재작성 (YearPicker + 카드 리스트 + 인라인 상세)
  - `MobileAnnualRow` 함수 제거

### Commit

- `d13da34` — feat: 모바일 검사 기록 탭 연도 피커 + 호기 카드 펼침 UX

### Manual Verification (배포 필요)

CLAUDE.md 정책상 프로덕션 배포 후 확인:

- [ ] 모바일 annual 탭 진입 → 상단 ◀ "YYYY년" ▶ 피커 표시
- [ ] 현재 연도에 이력 없으면 자동으로 가장 최근 데이터 있는 연도로 초기화
- [ ] ◀/▶ 버튼으로 연 이동 시 해당 연도에 이력 있는 호기만 카드로 표시
- [ ] 카드 탭 시 chevron 회전 + 해당 연도 이력 상세 + 부적합 상세 펼침
- [ ] 판정 배지 색상 정상 (합격=초록, 보완후합격=노랑, 보완/불합격=빨강)
- [ ] 선택 연도에 이력 없을 시 "해당 연도에 검사 이력이 없어요" empty state
- [ ] 데스크톱 annual 탭 기존 동작 회귀 없음 (KoelsaHistorySection 재사용 확인)

배포 명령: `cd cha-bio-safety && npm run build && wrangler pages deploy dist --branch production`

### Self-Check: PASSED

**Files:**
- `FOUND: cha-bio-safety/src/pages/ElevatorPage.tsx`

**Commits:**
- `FOUND: d13da34` (Revision — feat: mobile annual year picker + collapsible cards)
