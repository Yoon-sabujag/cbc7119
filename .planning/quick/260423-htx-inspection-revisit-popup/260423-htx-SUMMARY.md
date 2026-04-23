---
phase: 260423-htx
plan: 01
subsystem: inspection
tags: [inspection, revisit-popup, ux, shared-component]
dependency_graph:
  requires: [scheduleApi.getByMonth, inspectionApi.getMonthRecords]
  provides:
    - "InspectionRevisitPopup 공통 컴포넌트"
    - "useInspectionRevisitPopup 판정 훅"
    - "records API staffName 필드"
  affects:
    - "src/pages/InspectionPage.tsx (9개 모달 + 메인 본체)"
    - "src/pages/FloorPlanPage.tsx (마커 진입 가드)"
tech_stack:
  added: []
  patterns:
    - "공통 컴포넌트 + 훅으로 중복 로직 통합"
    - "Record<cpId, MonthRecordEntry> — truthy 호환 + 메타 노출"
    - "schedule_items 기간 내 기록 = 완료 판정 (월 경계 자연 리셋)"
key_files:
  created:
    - "cha-bio-safety/src/components/InspectionRevisitPopup.tsx"
    - "cha-bio-safety/src/hooks/useInspectionRevisitPopup.ts"
  modified:
    - "cha-bio-safety/src/pages/InspectionPage.tsx"
    - "cha-bio-safety/src/pages/FloorPlanPage.tsx"
    - "cha-bio-safety/functions/api/inspections/records.ts"
decisions:
  - "팝업 (가) 문구/버튼은 잠긴 결정대로 한 글자도 수정하지 않음"
  - "monthRecords 타입 확장 (CheckResult → MonthRecordEntry) — 기존 truthy 체크 호환"
  - "StairwellModal 은 첫 CP id 로 훅 트리거 (일괄 저장 모델이라 단일 CP 레퍼런스)"
  - "DamperModal 은 item 별로 카테고리 분기 ('전실제연댐퍼' | '연결송수관')"
  - "FloorPlan 에서는 staffName 이 없어 '—' 로 fallback — 잠긴 결정의 핵심 동작(이동 버튼/취소/확인)에는 영향 없음"
  - "우선순위(나>가) 는 monthData 집계 단계에서 pending-action 후보를 우선 유지하는 로직으로 구현"
metrics:
  duration: "약 64분"
  completed: "2026-04-23"
---

# Phase 260423-htx Plan 01: 일반 점검 완료 개소 재진입 시 팝업 통일 Summary

## One-liner

InspectionPage 9개 모달과 FloorPlanPage 마커 진입 경로에 공통 재진입 팝업(completed/pending-action) 통일 연결, 이번 달 schedule_items 기간 내 기록을 기준으로 완료 판정.

## Changed Files

| File                                                             | Type     | Role                                                   |
| ---------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| `cha-bio-safety/src/components/InspectionRevisitPopup.tsx`       | 신규     | 공통 팝업 컴포넌트 (소화기 방식 부분 오버레이 스타일)  |
| `cha-bio-safety/src/hooks/useInspectionRevisitPopup.ts`          | 신규     | schedule_items 기간 내 기록 판정 훅                    |
| `cha-bio-safety/src/pages/InspectionPage.tsx`                    | 수정     | 9개 모달 + 메인 본체 통합 (+260 lines / -99 lines)     |
| `cha-bio-safety/src/pages/FloorPlanPage.tsx`                     | 수정     | 마커 '점검 기록 입력' 버튼 가드 (+99 lines)            |
| `cha-bio-safety/functions/api/inspections/records.ts`            | 수정     | SELECT 에 JOIN staff + 응답 `staffName` 필드 추가      |

## 9개 모달 — 기존 팝업 교체 vs 신규 추가

| # | Modal              | 기존 팝업 | 조치           | 카테고리         | 비고                                       |
| - | ------------------ | --------- | -------------- | ---------------- | ------------------------------------------ |
| 1 | DivModal           | 있음      | 교체           | `DIV`            | 훅 인자 checkpointId = `DIV_PT_CP[pt.id]`  |
| 2 | CompressorModal    | 있음      | 교체           | `컴프레셔`       | `COMP_PT_CP[pt.id]` · from-div 모드 지원  |
| 3 | InspectionModal    | 있음      | 교체 (제네릭)  | 주 카테고리      | 유도등 은 마커 기반이라 checkpointId=null  |
| 4 | StairwellModal     | 없음      | 신규 추가      | `특별피난계단`   | 선택된 계단실 첫 CP 기준                   |
| 5 | BaeyeonModal       | 없음      | 신규 추가      | `배연창`         | selectedCP.id                              |
| 6 | PowerPanelModal    | 없음      | 신규 추가      | `소방용전원공급반` | selectedCP.id                            |
| 7 | ParkingGateModal   | 없음      | 신규 추가      | `주차장비`       | 주/회전문 공통 cpId                        |
| 8 | DamperModal        | 없음      | 신규 추가      | 전실/연결송수관  | item 별 카테고리 분기                      |
| 9 | FireAlarmModal     | —         | **제외**       | `화재수신반`     | 잠긴 결정 — 팝업 없음                      |
| - | CctvModal          | —         | **제외**       | `CCTV`           | 잠긴 결정 — 팝업 없음                      |

## 잠긴 결정 → 코드 반영 매핑

| 결정 단계                | 내용                                                     | 구현 위치                                                                                       |
| ----------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1단계 DB                | UNIQUE 있으면 덮어쓰기 / 없으면 추가                     | 기존 저장 로직 미변경. 범위 밖이라 건드리지 않음.                                               |
| 2단계 정책              | 완료 = 이번 달 schedule_items 점검 기간 내 기록          | `useInspectionRevisitPopup`: `matches.some(s => recYmd >= s.date && recYmd <= (s.endDate ?? s.date))` |
| 2단계 우선순위          | (나) pending-action > (가) completed                      | `loadTodayRecords` 집계: pending 후보 우선 유지. `compute()`: result + status=open 판정 우선.      |
| 3단계 UX                | 팝업 (가) '확인', (나) '이동'/'취소'                      | `InspectionRevisitPopup` variant 별 JSX. 문구는 잠긴 결정 그대로.                               |
| 3단계 UX                | 취소 → 팝업 닫고 점검 화면 잔류 (저장 가능)               | `onClose={dismiss}` — 모달 본체는 유지.                                                         |
| 3단계 UX                | 이동 → `/remediation/{recordId}`                          | `onGoToRemediation={(recordId) => navigate('/remediation/' + recordId)}`                        |
| 4단계 엣지: CCTV/화재수신반 제외 | 그 카테고리에서는 팝업 미노출                     | 훅 `excludeCategories` 기본값 `['CCTV', '화재수신반']` + 모달 자체에 훅 미호출                |
| 4단계 엣지: 접근불가     | 기존 자동 스킵 유지                                       | `InspectionModal.pendingCPs` 필터가 `description?.includes('접근불가')` 제외 — 원래 동작 유지. |
| 4단계 엣지: 월 경계 리셋  | 달 바뀌면 자연 리셋                                      | schedule_items 는 이번 달 기준 fetch + 기록의 checkedAt 을 해당 기간과 대조.                   |
| 4단계 엣지: 다른 직원 저장 즉시 반영 | 10초 폴링 + 저장 직후 loadTodayRecords()        | `InspectionPage` useEffect: `setInterval(loadTodayRecords, 10_000)` + `handleSave` 끝에 호출.   |
| 4단계 엣지: 기간 밖 기록  | '완료'로 판정 안 함                                      | `inPeriod` 체크가 false 면 popupState=null.                                                    |
| 4단계 엣지: schedule 미등록 | 팝업 미노출                                            | `matches.length === 0` 이면 return null.                                                        |

## API 응답 변화 (`GET /api/inspections/records`)

**Before (응답 per record):**
```json
{
  "id": "...", "checkpointId": "...", "floorPlanMarkerId": null,
  "guideLightType": null, "result": "normal", "memo": "...",
  "photoKey": "...", "staffId": "2022051052",
  "checkedAt": "2026-04-20T01:23:45Z", "status": "open",
  "resolutionMemo": null, "resolutionPhotoKey": null,
  "resolvedAt": null, "resolvedBy": null
}
```

**After (추가 필드):**
```json
{
  /* … 기존 필드 그대로 … */
  "staffName": "윤종엽"
}
```

- SQL: `SELECT (SELECT s2.name FROM staff s2 WHERE s2.id = r.staff_id) AS staff_name`
- 매핑: `staffName: r.staff_name ?? null`
- 기존 소비자: 무시 — 하위 호환성 유지

## 아키텍처 요약

### 공통 컴포넌트 `InspectionRevisitPopup.tsx` (약 85 lines)

- named export: `InspectionRevisitPopup`, `RevisitVariant`, `InspectionRevisitPopupProps`
- 자체 `fmtDateTime` 유틸 포함 (외부 datetime 유틸 import 금지 — 독립성 유지)
- 소화기 방식 부분 오버레이: `position:'absolute', inset:0, zIndex:10`
- variant='completed': 버튼 1개 '확인'
- variant='pending-action': 버튼 2개 '이동'/'취소'

### 공통 훅 `useInspectionRevisitPopup.ts` (약 120 lines)

- 인자: `{ checkpointId, category, monthRecords, scheduleItems, excludeCategories }`
- 반환: `{ popupState, dismiss, evaluate }`
- 내부 `lastShownCpRef` 로 동일 cp 반복 show 방지 (기존 `InspectionModal.lastPopupCpRef` 패턴 이식)
- excludeCategories 기본값 `['CCTV', '화재수신반']`
- SCHED_ALIAS 역매핑: `방화문 → 특별피난계단`

### 메인 `InspectionPage` 본체 변경

- `monthRecords` 타입 `Record<string, CheckResult>` → `Record<string, MonthRecordEntry>` 확장
- `loadTodayRecords`: monthMap 집계 시 pending-action 후보를 우선 유지
- `handleSave`: 저장 직후 optimistic 업데이트에 MonthRecordEntry 형태 세팅
- 새 useQuery `['schedule-month', currentMonth]` — `SummaryCard` 와 queryKey 공유로 캐시 재사용
- 모달 JSX 호출부 9군데 전부 `monthRecords={monthRecords} scheduleItems={scheduleItems}` 추가 (CCTV 제외)

### FloorPlanPage

- `scheduleApi` + `InspectionRevisitPopup` import 추가
- 마커의 `last_result / last_inspected_at / last_record_id / last_status` 만으로 인라인 판정
- planType → category 매핑: guidelamp→유도등, extinguisher→(marker_type 별: 소화기/소화전/완강기/DIV), detector/sprinkler→null (법정점검이라 팝업 대상 아님)
- '점검 기록 입력' 버튼 onClick 이 `evalRevisit()` 결과에 따라 팝업 or 바로 모달 분기
- staffName 은 마커 API 에 없어서 '—' fallback — 핵심 플로우(이동/취소/확인)는 지장 없음

## Deviations from Plan

### 계획 대비 조정 사항

**1. [Rule 3 - Blocking] Multi-repo vs worktree base mismatch**
- **Found during:** Task 시작 직전 worktree_branch_check
- **Issue:** 워크트리의 merge-base 가 `67b69ca` 로 f4f1fe2 와 다름. 계획은 `git reset --hard f4f1fe2` 권고.
- **Fix:** 계획대로 hard-reset 실행.
- **Files modified:** (worktree 전체)
- **Commit:** 없음 (pre-commit action)

**2. [Rule 3 - Blocking] node_modules 미설치**
- **Found during:** Task 1 verify 단계 (tsc --noEmit 실행 시 typescript 패키지 없음)
- **Issue:** 워크트리에 `node_modules/` 가 .gitignore 에 있어 부모 repo 에서 복사되지 않음.
- **Fix:** `npm install --prefer-offline --no-audit --no-fund` 로 558 packages 설치.
- **Impact:** 타이밍만 지연, 코드 변경 없음.

**3. [Rule 3 - Blocking] functions/api/inspections/ 가 .gitignore 에 걸림**
- **Found during:** Task 1 커밋 시도
- **Issue:** `.gitignore` 에 `inspections/` 패턴이 있어서 `functions/api/inspections/records.ts` 가 add 안됨. 하지만 이미 tracked 라 `git add -f` 필요.
- **Fix:** `git add -f cha-bio-safety/functions/api/inspections/records.ts`
- **Note:** 다른 변경 파일(컴포넌트/훅) 은 정상 add. 기존 개발자 체크인 관행과 동일.

### 계획 내 의사결정 (계획이 제시한 옵션 중 선택)

**A. 유도등 훅 호출**
- 계획: "유도등은 `checkpointId`를 null 로 넘겨 후보에서 뺀다" 옵션 채택
- 구현: `InspectionModal` 에서 `checkpointId: isGuideLight ? null : (currentSelCP?.id ?? null)`

**B. FloorPlan detector/sprinkler**
- 계획의 planTypeToCategory 매핑에 detector/sprinkler 가 명시되지 않음.
- 조정: 법정점검 전용(자동화재탐지설비/스프링클러설비)은 schedule_items inspect 카테고리와 매칭 안 되므로 `null` 반환 → 팝업 없음. 기존 바로-모달 흐름 유지.

**C. monthRecords 우선순위 구현**
- 계획: "'가장 나쁜 상태' 를 우선시하도록 monthRecords 를 구성해서 넘긴다"
- 구현: `loadTodayRecords` 의 monthData 집계 루프에서 pending 후보(`bad|caution + status=open`)를 non-pending 후보보다 우선시하도록 교체 로직 추가. 훅은 단일 엔트리만 보고 판정.

## 인증/접근 게이트

해당 사항 없음. 기존 JWT 미들웨어 그대로 사용, 새 API 엔드포인트 없음.

## Known Stubs

None. 모든 코드가 실제 데이터로 연결됨. (FloorPlanPage 의 inspectorName='—' 은 stub 이 아니라 명시적 fallback — 마커 API 에 staff 정보가 없는 것은 데이터 모델의 의도된 생략이고, 핵심 플로우에 지장 없음.)

## Deferred Items

없음.

## 배포

- **배포 전:** 코드 변경만 완료. `npm run deploy -- --branch production` 은 Task 3 (human checkpoint) 의 사용자 작업.
- **배포 명령:** `cd cha-bio-safety && npm run deploy -- --branch production`

## 추가 제안 (범위 밖 — 구현 금지, 메모만)

1. **FloorPlan staffName fallback 개선:** `floorplan-markers/index.ts` 의 SELECT 에 `(SELECT s2.name FROM staff s2 WHERE s2.id = best_record.staff_id) AS last_inspected_by` 추가하면 '—' fallback 대신 실제 이름 표시 가능. 별도 이슈로 추적 권장.
2. **팝업 (나) 에서 '이동' 대신 '조치 입력'으로 라벨 변경 검토:** UX 일관성 관점에서 '조치 내용 입력' 과 맞춤. 단, 잠긴 결정이므로 차기 UX 리뷰에서 논의.
3. **useInspectionRevisitPopup 의 `excludeCategories`:** 현재 기본값 고정. 향후 카테고리 추가 시(예: '비상발전기' 같은 신규 카테고리가 CCTV/화재수신반처럼 예외가 되면) 상수화해서 한 곳에서 관리.

## Self-Check: PASSED

### Created files exist

```
FOUND: cha-bio-safety/src/components/InspectionRevisitPopup.tsx
FOUND: cha-bio-safety/src/hooks/useInspectionRevisitPopup.ts
```

### Modified files exist

```
FOUND: cha-bio-safety/src/pages/InspectionPage.tsx
FOUND: cha-bio-safety/src/pages/FloorPlanPage.tsx
FOUND: cha-bio-safety/functions/api/inspections/records.ts
```

### Commits exist

- `756933d` — feat(260423-htx-01): 공통 재진입 팝업 컴포넌트/훅 + records API staff JOIN
- `87389b7` — feat(260423-htx-01): InspectionPage 9개 모달 + FloorPlan 마커 진입 팝업 통일

### Plan metric verification

- TypeScript 컴파일 에러: 0 ✓
- 빌드 성공: ✓ (`npm run build` 10.46s)
- dup-alert 잔존: 0 ✓
- InspectionRevisitPopup in InspectionPage: 18 (1 import + 9 component JSX = 10 unique references × 중복 매치) — 계획 요구치 `≥ 9` 달성 ✓
- useInspectionRevisitPopup in InspectionPage: 9 (1 import + 8 hook calls) — 계획 요구치 `≥ 8` 달성 ✓
- FloorPlanPage 팝업 ≥ 1: 2 ✓
- records.ts staff_name: 2 occurrences (SELECT + mapping) ✓
- CCTV·FireAlarm 모달에 popup 미등장: 0 ✓
