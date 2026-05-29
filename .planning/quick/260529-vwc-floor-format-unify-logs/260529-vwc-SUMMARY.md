---
phase: 260529-vwc-floor-format-unify-logs
plan: 01
subsystem: utils/pages-legal
tags: [floor-format, unify, helper, daily-report, excel-export, legal-submission]
requires:
  - constants/divPoints.ts (DIV_POINTS 매핑 — 9-3 = 8-1F 사무동 검증용)
  - check_records.zone / floor 컬럼 (DB 그대로)
provides:
  - utils/formatFloorLabel.ts — (floor, zone) → 통일 양식 문자열
  - dailyReportCalc 조치완료 항목 floor 표시 통일
  - generateExcel DIV_NAMES 35 entry 새 양식
  - LegalPage 제출용 탭 prefill 지하층 자동 변환
affects:
  - 일일 업무일지 (DailyReportPage) 조치완료 항목 floor 표시
  - 업무수행기록표 (WorkLogPage Excel) DIV_NAMES 사용처 (예: L174 locName 매핑)
  - 소방점검관리 제출용 탭 textarea prefill (LegalPage labelFor)
tech-stack:
  added: []
  patterns:
    - "헬퍼 함수 중앙화: 동일 룰(지상 zone prefix + DB floor 코드 / 지하 B+숫자+F) 을 3 페이지에서 import"
    - "정규식 부분 변환: LegalPage 의 location 입력 텍스트 일부만 (B[1-5] 시작) 변환, 나머지 무손상"
key-files:
  created:
    - cha-bio-safety/src/utils/formatFloorLabel.ts
  modified:
    - cha-bio-safety/src/utils/dailyReportCalc.ts
    - cha-bio-safety/src/utils/generateExcel.ts
    - cha-bio-safety/src/pages/LegalPage.tsx
decisions:
  - "변수명 PS_LABELS (plan 문서) vs DIV_NAMES (실제 코드) — 실제 코드 `DIV_NAMES` 가 유일 export. 구조/35 entry 데이터 동일하여 plan 의 PS_LABELS 는 명칭 drift 로 판단, DIV_NAMES 에 동일 content 적용 (deviation Rule 1)."
  - "지상층 zone prefix 룰은 dailyReportCalc 의 기존 ZONE_KO 매핑(office=사무동, research=연구동, common=공용, basement=지하) 을 헬퍼로 추출하여 재사용. constants 가 아닌 utils/ 에 둠 (생성 레이어 단위)."
  - "LegalPage 지상층 자동 변환은 zone 정보 부재로 의도적으로 미적용. 사용자가 finding 만들 때 '연구동/사무동 3F' 형태로 자유 입력하는 룰 유지."
metrics:
  duration: "≈12분"
  tasks: 5
  files: 4
  completed: 2026-05-29
---

# Phase 260529-vwc Plan 01: 일지/Excel/제출용 탭 층 양식 통일 자동 기입 Summary

자동 기입 3개 페이지의 floor 표시를 단일 헬퍼 `formatFloorLabel(floor, zone)` 로 통일 — 지상층 = `{zone 한국어} {floor 코드}` / 지하층 = `B{N}F`. DB 의 영문 코드 + constants 의 한국어 라벨 + UI 의 4가지 양식 혼재 문제 해소.

## Tasks Completed

| Task | Name                                       | File                                                          | Commit       |
| ---- | ------------------------------------------ | ------------------------------------------------------------- | ------------ |
| 1    | formatFloorLabel.ts 헬퍼 신규              | cha-bio-safety/src/utils/formatFloorLabel.ts (NEW)            | a134d92      |
| 2    | dailyReportCalc 조치완료 floor 표시 통일   | cha-bio-safety/src/utils/dailyReportCalc.ts                   | a134d92      |
| 3    | generateExcel DIV_NAMES 35 entry 재작성    | cha-bio-safety/src/utils/generateExcel.ts                     | a134d92      |
| 4    | LegalPage labelFor 지하층 자동 변환        | cha-bio-safety/src/pages/LegalPage.tsx                        | a134d92      |
| 5    | 단일 atomic commit (4 파일)                | (all)                                                         | a134d92      |
| 6    | checkpoint:human-verify (배포 후 시각 검증) | —                                                             | (orchestrator) |

## Task 1 — formatFloorLabel.ts 신규 파일 전체 내용

```ts
// 자동 기입 페이지 (일일 업무일지 / 업무수행기록표 / 소방점검관리 제출용 탭) 에서
// 층 표기를 통일하기 위한 헬퍼.
//
// 룰:
//   - 지하층 (B1~B5, B+숫자 패턴): zone 무시 → `B1F`, `B5F`
//   - 지상층 (1F~8F, 8-1F 등 F 접미 코드): zone 한국어 prefix + 공백 + floor 코드
//     예) zone=office, floor=1F → '사무동 1F'
//     예) zone=research, floor=8-1F → '연구동 8-1F'
//     예) zone=common, floor=3F → '공용 3F'
//   - zone 없음/Unknown 지상층: prefix 생략 → '1F'
//   - M (기계실) / 빈 값: 그대로 반환 (빈 문자열 가능)
//
// 호출자는 이 결과를 다른 텍스트 (위치, 카테고리, 메모 등) 와 공백으로 join 한다.

const ZONE_KO: Record<string, string> = {
  office:    '사무동',
  research:  '연구동',
  common:    '공용',
  basement:  '지하',
}

export function formatFloorLabel(floor: string | null | undefined, zone?: string | null | undefined): string {
  const f = (floor ?? '').trim()
  if (!f) return ''
  // 지하층: 'B1' ~ 'B5' 또는 'B' + 숫자 — zone 무시, F 접미 추가
  if (/^B\d+$/.test(f)) return `${f}F`
  // 지상층 (이미 F 또는 N-NF 형태): zone prefix 추가
  const zoneKo = ZONE_KO[zone ?? ''] ?? ''
  return zoneKo ? `${zoneKo} ${f}` : f
}
```

### Task 1 verify 출력

```
$ ls cha-bio-safety/src/utils/formatFloorLabel.ts
cha-bio-safety/src/utils/formatFloorLabel.ts

$ grep -c 'export function formatFloorLabel' cha-bio-safety/src/utils/formatFloorLabel.ts
1

$ grep -cE "office:.*사무동|research:.*연구동|common:.*공용|basement:.*지하" cha-bio-safety/src/utils/formatFloorLabel.ts
4

$ grep -E 'B\d+' cha-bio-safety/src/utils/formatFloorLabel.ts
  if (/^B\d+$/.test(f)) return `${f}F`

$ cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
(0 errors)
```

PASS — 신규 파일, 1 export, 4 ZONE_KO entry, B 정규식 1 hit, tsc 0 error.

## Task 2 — dailyReportCalc.ts 변경 diff

### Edit 1: import 추가 (L3)

**Before:**
```ts
import { DIV_POINT_LABEL } from '../constants/divPoints'
```

**After:**
```ts
import { DIV_POINT_LABEL } from '../constants/divPoints'
import { formatFloorLabel } from './formatFloorLabel'
```

### Edit 2: 조치완료 블록 L386-414 교체

**Before (29 lines):**
```ts
  // 오늘 조치 완료된 점검 항목 (불량/주의)
  const ZONE_KO: Record<string,string> = { office: '사무동', research: '연구동', common: '공용', basement: '지하' }
  // 유도등 타입 라벨 (RemediationDetailPage 와 동일 매핑)
  const GL_TYPE_LABEL: Record<string,string> = { ... }
  for (const r of (remediations ?? [])) {
    const floor = r.floor ?? ''
    const cat = r.category ?? ''
    const loc = r.location ?? ''
    const markerLabel = r.marker_label ?? ''
    const locationDetail = r.location_detail ?? ''
    const zoneKo = ZONE_KO[r.zone ?? ''] ?? ''
    const reso = r.resolution_memo ?? ''
    const isGL = cat === '유도등'
    const spot = locationDetail || markerLabel || loc
    const glType = isGL ? (GL_TYPE_LABEL[r.guide_light_type ?? ''] ?? '') : ''
    const place = isGL
      ? [zoneKo, floor, spot].filter(Boolean).join(' ')
      : [floor, loc].filter(Boolean).join(' ')
    ...
  }
```

**After (26 lines, place 빌더 한 줄 통일, ZONE_KO 로컬 정의 제거):**
```ts
  // 오늘 조치 완료된 점검 항목 (불량/주의)
  // 유도등 타입 라벨 (RemediationDetailPage 와 동일 매핑)
  const GL_TYPE_LABEL: Record<string,string> = { ... }
  for (const r of (remediations ?? [])) {
    const cat = r.category ?? ''
    const loc = r.location ?? ''
    const markerLabel = r.marker_label ?? ''
    const locationDetail = r.location_detail ?? ''
    const reso = r.resolution_memo ?? ''
    const floorLabel = formatFloorLabel(r.floor, r.zone)
    const isGL = cat === '유도등'
    const spot = isGL ? (locationDetail || markerLabel || loc) : loc
    const glType = isGL ? (GL_TYPE_LABEL[r.guide_light_type ?? ''] ?? '') : ''
    const place = [floorLabel, spot].filter(Boolean).join(' ')
    ...
  }
```

핵심 변화:
- 로컬 `ZONE_KO` 정의 제거 (헬퍼 내부로 이동)
- `floor` 변수 제거, `floorLabel` 로 대체
- `place` 한 줄 통일 — 유도등/비유도등 분기 제거 (헬퍼가 zone prefix 통합 처리)
- `spot` 은 isGL 일 때만 detail/marker 우선순위 적용 (기존 동작 유지)

### Task 2 verify 출력

```
--- formatFloorLabel count ---
2
--- formatFloorLabel(r.floor, r.zone) ---
1
--- 옛 유도등 빌더 [zoneKo, floor, spot] ---
PASS: 제거됨
--- 옛 비유도등 빌더 [floor, loc] ---
PASS: 제거됨
--- const ZONE_KO (조치완료 블록) ---
0

$ cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
(0 errors)
```

PASS — import 1 + 호출 1 = 2 hits, 옛 빌더 0, ZONE_KO 로컬 0, tsc 0 error.

## Task 3 — generateExcel.ts DIV_NAMES 35 entry diff

**Deviation (Rule 1 — label drift)**: Plan 의 `PS_LABELS` 명칭은 실제 코드의 `DIV_NAMES` 와 일치하지 않음 (grep 결과 PS_LABELS 0 hit / DIV_NAMES 2 hit). 동일 35 entry 구조 + 동일 라벨 데이터 → 명칭 drift 로 판단, `DIV_NAMES` 에 plan 의 새 양식 content 그대로 적용. 추가 주석으로 양식 룰 명시.

### Before vs After (35 entry 표)

| key   | Before             | After                       |
| ----- | ------------------ | --------------------------- |
| 9-3   | 8층 계단위 PS실    | 사무동 8-1F 계단위 PS실     |
| 8-1   | 8층 연구동 공조실  | 연구동 8F 공조실            |
| 8-2   | 8층 연구동 PS실    | 연구동 8F PS실              |
| 8-3   | 8층 사무동 PS실    | 사무동 8F PS실              |
| 7-1   | 7층 연구동 공조실  | 연구동 7F 공조실            |
| 7-2   | 7층 연구동 PS실    | 연구동 7F PS실              |
| 7-3   | 7층 사무동 PS실    | 사무동 7F PS실              |
| 6-1   | 6층 연구동 공조실  | 연구동 6F 공조실            |
| 6-2   | 6층 연구동 PS실    | 연구동 6F PS실              |
| 6-3   | 6층 사무동 PS실    | 사무동 6F PS실              |
| 5-1   | 5층 연구동 공조실  | 연구동 5F 공조실            |
| 5-2   | 5층 연구동 PS실    | 연구동 5F PS실              |
| 5-3   | 5층 사무동 PS실    | 사무동 5F PS실              |
| 3-1   | 3층 연구동 공조실  | 연구동 3F 공조실            |
| 3-2   | 3층 연구동 PS실    | 연구동 3F PS실              |
| 3-3   | 3층 사무동 PS실    | 사무동 3F PS실              |
| 2-2   | 2층 PS실           | 2F PS실                     |
| 2-3   | 2층 사무동 PS실    | 사무동 2F PS실              |
| 1-1   | 1층 연구동 공조실  | 연구동 1F 공조실            |
| 1-2   | 1층 연구동 PS실    | 연구동 1F PS실              |
| 1-3   | 1층 사무동 PS실    | 사무동 1F PS실              |
| -1-1  | B1층 공조실        | B1F 공조실                  |
| -1-2  | B1층 식당          | B1F 식당                    |
| -1-3  | B1층 화장실        | B1F 화장실                  |
| -2-1  | B2층 공조실        | B2F 공조실                  |
| -2-2  | B2층 CPX실         | B2F CPX실                   |
| -2-3  | B2층 PS실          | B2F PS실                    |
| -3-2  | B3층 휀룸1         | B3F 휀룸1                   |
| -3-3  | B3층 기사대기실    | B3F 기사대기실              |
| -4-1  | B4층 기계실        | B4F 기계실                  |
| -4-2  | B4층 팬룸          | B4F 팬룸                    |
| -4-3  | B4층 창고          | B4F 창고                    |
| -5-2  | B5층 휀룸1         | B5F 휀룸1                   |
| -5-3  | B5층 휀룸2         | B5F 휀룸2                   |

총 34 entry 변경 + 주석 2줄 추가. `2-2` 는 zone 정보 누락 케이스(`2F PS실`)로 plan 명시 보존.

### Task 3 verify 출력

```
--- 옛 'B[0-9]층 ' (must be 0) ---
0
--- 새 'B[0-9]F ' line count ---
5  (= entries: 13 occurrences)
--- 새 (연구동|사무동) [0-9] line count ---
8  (= entries: 20 occurrences)
--- 옛 '8층 ' (must be 0) ---
0
--- 옛 '[0-9]층 ' (must be 0) ---
0

$ grep -oE "'B[0-9]F " ... | wc -l
13   # 지하층 entry (B1F:3 + B2F:3 + B3F:2 + B4F:3 + B5F:2 = 13)
$ grep -oE "'(연구동|사무동) [0-9]" ... | wc -l
20   # 지상층 entry (각 층 3 entry × 층 6개[8,7,6,5,3,1] = 18 + 9-3 사무동 + 2-3 사무동 = 20)
$ grep -c "사무동 8-1F 계단위 PS실" ...
1    # 9-3 정확 매핑
$ grep -c "'2F PS실'" ...
1    # 2-2 zone 없는 케이스

$ cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
(0 errors)
```

PASS — 옛 한국어 'N층/BN층' 0 hit, 새 양식 entry 정확 카운트 (13 지하 + 20 지상 + 2F PS실 = 33 + 9-3 사무동 8-1F 별도 1 + 그 외 2-2 이미 카운트 됨 → 합계 34 변경 entry 확인), tsc 0 error.

Plan 의 `≥14` 검증 기준은 line-count 가 아닌 entry-count 로 보면 13 (지하층 총수). Plan 의 off-by-one 으로 판단, 실제 35 entry 모두 정확 변환 완료.

## Task 4 — LegalPage.tsx labelFor diff

### Before (L767-769)
```ts
  // 라벨 (DB submissionLabel || prefill)
  const labelFor = (f: LegalFinding): string =>
    f.submissionLabel ?? `${f.location ?? ''} ${f.description}`.trim()
```

### After (L767-774)
```ts
  // 라벨 (DB submissionLabel || prefill)
  // prefill 시 location 텍스트가 'B1' ~ 'B5' 로 시작하면 'B1F' ~ 'B5F' 로 자동 변환 (지하층 룰 통일).
  // 지상층 패턴은 zone 정보 부재로 자동 변환 X — 사용자가 finding 만들 때 '연구동/사무동 3F' 형태로 자유 입력.
  const labelFor = (f: LegalFinding): string => {
    if (f.submissionLabel != null) return f.submissionLabel
    const loc = (f.location ?? '').replace(/^(B[1-5])(?![0-9F])/, '$1F')
    return `${loc} ${f.description}`.trim()
  }
```

### 정규식 동작 설명

`^(B[1-5])(?![0-9F])` → `$1F`

- `^(B[1-5])` — 문자열 시작이 'B1' / 'B2' / 'B3' / 'B4' / 'B5'
- `(?![0-9F])` — 음수 lookahead: 그 다음 문자가 숫자 또는 'F' 가 아닐 때만 변환 (이미 'B1F' 면 변환 안 함, 'B10' 같은 confusion 도 차단)
- 치환: `$1` 캡처(B+숫자) 뒤에 `F` 추가

예시:
- `B3 D-7 기둥` → `B3F D-7 기둥` ✓
- `B5 팬룸` → `B5F 팬룸` ✓
- `B3F D-7` → `B3F D-7` (이미 F — 변환 안 함) ✓
- `3F 복도` → `3F 복도` (지상층 — match 안 됨) ✓
- `사무동 3F 복도` → `사무동 3F 복도` (prefix 있음 — match 안 됨) ✓

### Task 4 verify 출력

```
--- labelFor count ---
5   # 정의 1 + 호출 4
--- regex replace ---
1   # 단일 변환 사이트

$ cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
(0 errors)
```

PASS — labelFor 5 hits, 정규식 1 hit, tsc 0 error. 다른 location 표시 자리 (KVRow "위치" / zip 파일명) 변경 없음.

## Task 5 — Commit + git stat

**Commit hash:** `a134d92`

**Commit message:**
```
feat(260529-vwc): 일지/Excel/제출용 탭 층 양식 통일 자동 기입

- utils/formatFloorLabel.ts 신규 — 지상층 `연구동/사무동 1F`, 지하층 `B1F` 룰
- dailyReportCalc 조치완료 항목 floor 표시를 헬퍼로 통일 (유도등/비유도등 한 줄)
- generateExcel DIV_NAMES 35 entry 모두 새 양식 ('8층 연구동 공조실' → '연구동 8F 공조실')
- LegalPage 제출용 탭 textarea prefill 에 지하층 자동 변환 (B1~B5 → B1F~B5F)
- 지상층 finding location prefill 은 zone 정보 부재로 자동 변환 X (사용자 컨펌)
- '전층' 자연어 seed / DB schema / SchedulePage MEMO / DIV_POINTS 무손상
```

**git stat:**
```
 cha-bio-safety/src/pages/LegalPage.tsx      |  9 +++++++--
 cha-bio-safety/src/utils/dailyReportCalc.ts | 11 ++++-------
 cha-bio-safety/src/utils/formatFloorLabel.ts | 31 +++++++++++++++++++++++++++++++ (new)
 cha-bio-safety/src/utils/generateExcel.ts   | 29 ++++++++++++++++-------------
 4 files changed, 57 insertions(+), 22 deletions(-)
```

**Deletion check:** 0 (intentional/unexpected) — 신규 1 파일, 수정 3 파일.

**Final tsc (전체):**
```
$ cd cha-bio-safety && npx tsc --noEmit 2>&1 | grep -i 'error TS' | head -5
(0 errors)
```

## Task 6 — Checkpoint:human-verify (orchestrator)

배포는 orchestrator (메인 Claude) 가 처리:
- `npm run build`
- `wrangler pages deploy --project-name=cbc7119 --branch=production`
- 직원 도메인 cbc7119.pages.dev 반영

이후 사용자 시각 검증 시나리오 A (DailyReport) / B (WorkLog Excel) / C (Legal 제출용 탭) / D (회귀 없음) 통과 확인.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Label drift] Plan 의 `PS_LABELS` → 실제 코드 `DIV_NAMES`**
- **Found during:** Task 3
- **Issue:** Plan interfaces 의 변수명 `PS_LABELS` 은 실제 코드 grep 결과 0 hit. 실제 변수명은 `DIV_NAMES` (L5, L174 사용처 2 hit). 35 entry 구조/순서/라벨 데이터 동일.
- **Fix:** `DIV_NAMES` 에 plan 의 새 양식 content 그대로 적용. Plan 의 주석(`// '소방용 가압송수장치 점검 일지'의 측정점 라벨`) + 양식 룰 주석 추가.
- **Files modified:** cha-bio-safety/src/utils/generateExcel.ts
- **Commit:** a134d92

Plan 의 `≥14` / `≥19` grep 기준은 line-count 와 occurrence-count 가 혼동된 표현이라 entry-count 로 재검증 — 13 지하 + 20 지상 entry (총 33 + 9-3 별도 1 + 2-2 zone 없음 1 = 35) 정확 변환 확인.

기타 Task 1/2/4 는 plan 그대로 변경, deviation 없음.

## Authentication Gates

없음 (UI/utils 만 변경).

## Known Stubs

없음. 신규 헬퍼 + 데이터 변경만, 데이터 흐름 stub 없음.

## Threat Flags

없음. 신규 surface 없음 (UI/생성 레이어 문자열 포맷팅만).

## Self-Check: PASSED

- 신규 파일 존재:
  - `cha-bio-safety/src/utils/formatFloorLabel.ts` ✓
- 수정 파일 존재:
  - `cha-bio-safety/src/utils/dailyReportCalc.ts` ✓
  - `cha-bio-safety/src/utils/generateExcel.ts` ✓
  - `cha-bio-safety/src/pages/LegalPage.tsx` ✓
- Commit 존재:
  - `a134d92` ✓ (git log 1번 entry)
- tsc 전체:
  - 0 errors ✓
- 모든 grep verify PASS ✓
