---
quick_id: 260508-ibx
slug: div-comp-check-records-zone-basement
description: DIV/Compressor 모달 점검 시 photoKey 가 check_records 에 안 박혀 조치 상세에서 사진 누락 + zone='basement' 한글 표기 ('지하') 누락된 4곳 일괄
date: 2026-05-08
status: planned
must_haves:
  truths:
    - DivModal/CompressorModal 의 onSaveRecord 시그니처가 photoKey 를 안 받아 check_records.photo_key 가 NULL 로 들어감
    - 사진은 div_pressures.photo_key, comp_inspections.photo_key 에는 정상 저장되지만 RemediationDetailPage 는 check_records 만 읽음
    - 0081 마이그레이션으로 cp.zone 'common' → 'basement' 정리됐지만 4개 ZONE_LABEL/ZONE_LBL 맵에 basement 미등록
  artifacts:
    - cha-bio-safety/src/pages/InspectionPage.tsx (DivModal, CompressorModal, ZONE 맵 3곳)
    - cha-bio-safety/src/pages/RemediationDetailPage.tsx (ZONE_LABEL 맵)
  key_links:
    - InspectionPage.tsx:1036 (DivModal props)
    - InspectionPage.tsx:1188-1230 (DivModal handleSave - photoKey 누락)
    - InspectionPage.tsx:1608 (CompressorModal props)
    - InspectionPage.tsx:1700-1728 (CompressorModal handleSave - photoKey 누락)
    - InspectionPage.tsx:4767, 4851, 5114 (ZONE_LBL/ZONE_LABEL basement 누락)
    - RemediationDetailPage.tsx:10 (ZONE_LABEL basement 누락)
---

# 260508-ibx — DIV/Comp 사진 check_records 누락 + zone basement 한글 표기 누락

## Bug 1 — DIV/Comp 점검 사진이 조치 상세에 안 보임

DivModal 의 `handleSave`:

```ts
const photoKey = await photo.upload()
await fetch('/api/div/pressure', { ..., photo_key: photoKey ?? null })  // ← OK: div_pressures 에 저장
...
await onSaveRecord(cpId, result, memo || '')  // ← 누락: photoKey 안 넘김
```

CompressorModal 의 handleSave 도 동일 패턴 (`/api/div/comp-inspection` 에는 photo_key 가, onSaveRecord 호출에는 photoKey 가 빠짐).

조치 페이지(`/api/remediation`, `/api/remediation/:recordId`)는 `check_records.photo_key` 만 읽음 → DIV/Comp 항목은 항상 사진 없음.

### Fix

`onSaveRecord` 시그니처를 다른 모달의 `onSave` 와 동일하게 변경:

```ts
onSaveRecord: (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
```

호출부에서 `photoKey ?? undefined` 전달. 부모 `handleSave` 는 이미 photoKey 를 처리할 수 있음 (다른 모달들과 동일 prop).

## Bug 2 — zone='basement' 가 한글 라벨로 안 바뀜

migration 0081 (`zone_common_to_basement`) 이후 cp.zone 값이 'basement' 가 됐지만 다음 4개 맵에 basement 미등록:

| 위치 | 현재 |
|---|---|
| RemediationDetailPage.tsx:10 | `{ office: '사무동', research: '연구동', common: '공용' }` |
| InspectionPage.tsx:4767 (ZONE_LBL) | 동일 |
| InspectionPage.tsx:4851 (ZONE_LABEL) | 동일 |
| InspectionPage.tsx:5114 (ZONE_LABEL) | 동일 |

이미 올바른 곳: `RemediationPage.tsx:10`, `dailyReportCalc.ts:379`.

### Fix

4개 맵 모두 다음으로 통일:
```ts
{ office: '사무동', research: '연구동', basement: '지하', common: '지하' }
```

(common 도 '지하' 로 매핑 — RemediationPage 가 이미 그 패턴이고, 0081 이전 데이터 잔존 가능)

## Tasks

### Task 1 — DivModal photoKey forwarding

**files:** InspectionPage.tsx (line 1036-1038, 1227-1229)
**action:** onSaveRecord 시그니처에 photoKey 추가, handleSave 에서 onSaveRecord 호출 시 photoKey 전달
**verify:** tsc --noEmit 통과
**done:** DIV 점검 시 check_records.photo_key 가 R2 키로 저장됨 (조치 상세에서 사진 보임)

### Task 2 — CompressorModal photoKey forwarding

**files:** InspectionPage.tsx (line 1608-1610, ~1728)
**action:** Task 1 과 동일 패턴
**verify:** tsc --noEmit 통과
**done:** 컴프 점검 시 check_records.photo_key 가 저장됨

### Task 3 — ZONE_LABEL/ZONE_LBL 4곳 basement 추가

**files:**
- RemediationDetailPage.tsx:10
- InspectionPage.tsx:4767, 4851, 5114
**action:** `{ office: '사무동', research: '연구동', basement: '지하', common: '지하' }`
**verify:** tsc --noEmit 통과
**done:** 조치 상세 등에서 'basement' 대신 '지하' 표시

## Out of scope

- 기존 check_records.photo_key=NULL 인 DIV/Comp record 의 photo 복구 (div_pressures/comp_inspections 에서 조인해 끌어오는 백필) — 점검 기록 삭제 불가 원칙상 데이터는 보존, 표시만 제한
- DIV/Comp 외 다른 모달의 zone 표시 사례
