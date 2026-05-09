---
quick_id: 260508-ibx
slug: div-comp-check-records-zone-basement
status: complete
date: 2026-05-08
commit: 601602e
---

# 260508-ibx — DIV/Comp 사진 check_records 누락 + zone basement 한글 표기 누락

## What changed

### Bug 1 — DIV/Compressor 점검 사진이 조치 상세에 안 보이던 문제

`cha-bio-safety/src/pages/InspectionPage.tsx`

- `DivModal` (line 1036) 의 `onSaveRecord` 시그니처에 `photoKey?: string` 추가
- `DivModal.handleSave` (line 1229) 에서 onSaveRecord 호출 시 `photoKey ?? undefined` 전달
- `CompressorModal` (line 1608) 동일 시그니처 변경
- `CompressorModal.handleSave` (line 1728) 동일 photoKey 전달

기존엔 사진이 `div_pressures.photo_key` / `comp_inspections.photo_key` 에만 저장되고, `onSaveRecord` → 부모 `handleSave` → `/api/check-points/{cpId}/check` 흐름에서 photoKey 가 누락돼 `check_records.photo_key=NULL` 이었음. `/api/remediation` 은 `check_records` 만 읽으므로 DIV/Comp 항목은 항상 사진 없음.

### Bug 2 — `'basement'` 가 한글 라벨로 안 바뀌던 문제

migration `0081_zone_common_to_basement` 이후 cp.zone='basement' 인데 4개 ZONE_LABEL/ZONE_LBL 맵에 key 등록이 빠져 있어, `ZONE_LABEL[zone] ?? zone` 폴백으로 'basement' 가 그대로 노출됨.

수정한 4곳 (모두 `{ office: '사무동', research: '연구동', basement: '지하', common: '지하' }`):
- `cha-bio-safety/src/pages/RemediationDetailPage.tsx:10`
- `cha-bio-safety/src/pages/InspectionPage.tsx:4767` (`ZONE_LBL`)
- `cha-bio-safety/src/pages/InspectionPage.tsx:4851`
- `cha-bio-safety/src/pages/InspectionPage.tsx:5114`

이미 올바른 곳: `RemediationPage.tsx:10`, `dailyReportCalc.ts:379` (후자는 일일 업무 일지 도메인 상 'common' 의미를 별도로 보존해야 해서 `common: '공용'`, `basement: '지하'` 분리 유지).

## Verification

- `npx tsc --noEmit` exit 0
- 변경 8+/8- 라인, 두 파일에 한정

## Branch operations note

작업 시작 시 working tree 가 `feature/design-tokens` 브랜치였고 디자인 토큰 WIP 미커밋 변경이 있었음. fix 커밋(601602e) 은 feature 위에 만들어졌고, main 은 c8bfa86 에 머물러 있었음. 사용자 결정에 따라:
1. feature 의 WIP 를 stash
2. main 을 ff-merge 로 601602e 까지 진행
3. main 에서 docs commit + 배포
4. 이후 feature 로 돌아가 stash pop (다음 task 재개)

이 방식 덕에 in-progress 디자인 토큰 작업이 운영에 누출되지 않음.

## Out of scope

- 기존 check_records.photo_key=NULL 인 DIV/Comp record 의 photo 백필 (div_pressures/comp_inspections 에서 끌어오기) — 점검 기록 삭제 불가 원칙상 데이터 보존, 표시만 영향
- DIV/Comp 외 다른 모달의 zone 표시 사례 sweep (오늘은 명시된 위치만 정정)

## Commit

`601602e` — fix(inspection): DIV/Comp 점검 사진을 check_records 에도 저장 + zone basement 한글 표기 통일
