---
slug: hydrant-count-mismatch
status: root_cause_found
trigger: "일반점검 페이지 소화전 카드는 153/154로 표시되는데, 실제 소화전 점검 페이지에 들어가서 층별로 보면 모든 개소가 완료 상태로 표시됨. 카드 카운트와 실제 점검 페이지의 완료 상태가 불일치하는 원인 파악 필요. 점검 완료 단일 룰(isCpCompleted: normal | caution | (bad+resolved))이 두 곳에서 다르게 적용되는지 확인."
created: 2026-04-28T12:42:31+0900
updated: 2026-04-28T13:10:00+0900
---

# Debug: hydrant-count-mismatch

## Symptoms

<DATA_START type="user-symptoms">
- expected: 일반점검 페이지의 소화전 카드 카운트와 실제 소화전 점검 페이지의 층별 완료 표시가 일치해야 함. 점검 완료 단일 룰(isCpCompleted: normal | caution | (bad+resolved))이 양쪽에 동일하게 적용돼야 함.
- actual: 일반점검 페이지 소화전 카드는 153/154 (1개 미완료)로 표시되지만, 실제 소화전 점검 페이지에 들어가서 층별로 보면 모든 층의 모든 개소가 완료 상태로 표시됨.
- error_messages: 없음 (조용한 데이터 불일치)
- timeline: 사용자가 보고한 시점 기준 (2026-04-28). 언제부터 발생한지 미확인.
- reproduction: 일반점검 페이지 → 소화전 카드 확인 (153/154) → 소화전 점검 페이지 진입 → 층별 완료 개수 합산 시 154/154로 보임
</DATA_END>

## Current Focus

- hypothesis: (재확정 — 이전 가설 폐기) 카드 그룹은 소화전(106) + 비상콘센트(48) 총 154 개. DB 상 진짜 미완료 1개는 `CP-B1-6-BC` (B1, 비상콘센트, 재단 시설팀 안). 짝꿍 소화전 `CP-B1-6-SH` 는 2026-04-27 14:44:43 에 박보융(2023071752)이 정상으로 저장. **실제 원인은 InspectionModal 의 SH→BC 순차 await 실패가 아니라, FloorPlanPage 의 인라인 점검 모달이 paired BC 저장 로직을 전혀 가지고 있지 않은 것**. 박보융은 그날 14:01–14:44 동안 floorplan/소화기·소화전 뷰에서 소화기 16건을 연속 점검하다가 같은 평면도의 소화전 마커(`FPM-76rYZ7YrP6Di` ↔ `CP-B1-6-SH`)를 탭하고 단독 저장. 이 경로에는 paired BC 가 화면에 뜨지도, 코드 상 호출되지도 않음.
- next_action: 사용자에게 fix 옵션 제시 — (A) 데이터 즉시 회복, (B) FloorPlanPage 점검 모달에 paired BC 추가, (C) 또는 hydrant 마커는 점검 시 InspectionPage 의 paired modal 로 라우팅.
- test: B1 비상콘센트 `CP-B1-6-BC` 1건 점검 → 카드 154/154 회복 확인. 동시에 FloorPlanPage 에서 다른 SH 단독 저장 시도 → BC paired flow 가 작동(또는 차단)하는지 확인.
- expecting: 카드 154/154, FloorPlanPage 도 SH 단독 저장 차단 또는 BC 동시 저장.

## Evidence

- timestamp: 2026-04-28T13:50
  - finding: `isCpCompleted` 룰이 코드 한 곳(InspectionPage.tsx 22~25)에만 정의되어 있고 공유 유틸이 아님. 사용 위치는 line 3227 의 `fDone` (층 chip "(N)") 한 군데뿐.
  - source: src/pages/InspectionPage.tsx:22-25, 3227

- timestamp: 2026-04-28T13:51
  - finding: 같은 페이지의 picker `doneCount` (line 2974), `firstPending` (2935), `advanceToNextPending::isIncomplete` (3060) 는 `monthRecords[cp.id]` truthy 체크만 사용 → strict isCpCompleted 룰과 분기.
  - source: src/pages/InspectionPage.tsx:2935, 2974, 3060

- timestamp: 2026-04-28T13:53
  - finding: 카드 카운트는 `computeCardCompletion(monthRecordDates)` 사용. monthRecordDates 자체가 `(normal | caution | bad+resolved) AND checkedAt 존재` 일 때만 push 되므로 결과적으로 strict 룰과 동치.
  - source: src/utils/inspectionProgress.ts, src/pages/InspectionPage.tsx:4022-4031

- timestamp: 2026-04-28T13:55
  - finding: D1 쿼리 결과 — 4월 기준 소화전+비상콘센트 154개 중 strict 완료 153개. 미완료 1개 = `CP-B1-6-BC` (B1, 비상콘센트, 재단 시설팀 안). 4월 기록 0건. 가장 최근 기록은 2026-03-28.
  - source: D1 SELECT — `cha-bio-db.check_records JOIN check_points`

- timestamp: 2026-04-28T13:56
  - finding: 짝꿍 소화전 `CP-B1-6-SH` 는 2026-04-27 14:44:43 에 normal 로 저장됨. paired BC 도 같은 시점에 함께 저장됐어야 했는데 누락.
  - source: D1 SELECT

- timestamp: 2026-04-28T13:57
  - finding: 소화전+비상콘센트 그룹 picker 는 floorCPs 중 소화전이 있으면 소화전만 표시 (line 2911-2913). B1 은 소화전 10 / 비상콘센트 10 모두 있어 비상콘센트는 picker 에 등장하지 않음. paired BC 는 선택된 소화전이 있을 때만 함께 표시되며 (line 2980-2984), 저장도 SH 저장 후 BC 저장이 직렬로 await 되는 구조 (line 3157-3161).
  - source: src/pages/InspectionPage.tsx:2880-2914, 2980-2984, 3157-3161

- timestamp: 2026-04-28T13:58 (이 evidence 는 이제 재해석됨 — handleSave 자체는 atomic 하진 않지만 본 케이스의 실패 원인은 아님)
  - finding: handleSave 가 `await onSave(SH)` → `if (pairedBC) { await bcPhoto.upload(); await onSave(BC) }` 순서. 1단계 성공 후 2단계 throw 시 SH 만 DB 에 저장. 그러나 본 케이스에서 박보융이 InspectionPage 모달을 사용했다는 직접 증거는 없으며, 아래 14:10 evidence 는 다른 경로(FloorPlanPage)를 가리킴.
  - source: src/pages/InspectionPage.tsx:3134-3173 (handleSave)

- timestamp: 2026-04-28T13:59
  - finding: 4-27 의 telemetry_events 테이블에는 cold-retry / json-parse-fail 기록 없음. 즉 자동 retry telemetry 로는 잡히지 않은 type 의 실패였거나, 또는 그날 paired-save 가 한 단계만 fire 된 다른 시나리오.
  - source: D1 SELECT telemetry_events WHERE ts BETWEEN ...

- timestamp: 2026-04-28T14:05 (사용자 pushback 로 재조사 시작)
  - finding: 사용자 지적 — "한 버튼이면 같이 저장돼야 하는데 어떻게 SH만 저장되고 BC는 안 될 수 있냐". 이전 가설의 SH→BC 순차 await 실패 시나리오를 의심해야 함을 명시.
  - source: user pushback (DATA_START/DATA_END)

- timestamp: 2026-04-28T14:08
  - finding: 4-27 14:44:43 의 SH 저장은 staff_id `2023071752` (박보융) 로 기록됨 — 사용자(윤종엽 2022051052) 가 아님. 동일 CP 의 모든 다른 기록은 윤종엽이 SH+BC 같은 timestamp 로 저장한 페어 패턴 (3-28 12:07:06, 3-28 08:53:33).
  - source: D1 SELECT — check_records WHERE checkpoint_id IN ('CP-B1-6-SH','CP-B1-6-BC')

- timestamp: 2026-04-28T14:10
  - finding: 박보융이 4-27 14:01~14:44 사이 동일 session_id `B3cQQD0JNBgcozbWQminL` 로 소화기 16건 연속 저장 (모두 CP-FE-* 카테고리=소화기). 14:44:43 에 CP-B1-6-SH 가 같은 session 에서 저장. 직전 소화기 저장(14:44:12)과 31초 차이.
  - source: D1 SELECT JOIN check_points (staff_id=박보융, 14:00~15:30)

- timestamp: 2026-04-28T14:12
  - finding: **새 가설 검증** — `floor_plan_markers` 테이블에 `plan_type='extinguisher'`, `marker_type='indoor_hydrant'` 마커가 존재하며, `check_point_id='CP-B1-6-SH'` 와 1:1 연결 (`FPM-76rYZ7YrP6Di`). 동일 plan_type 의 indoor_hydrant 마커 총 106개. BC 카테고리 마커는 0개.
  - source: D1 SELECT floor_plan_markers WHERE check_point_id IN ('CP-B1-6-SH','CP-B1-6-BC')

- timestamp: 2026-04-28T14:14
  - finding: **결정적 증거** — `src/pages/FloorPlanPage.tsx:1545-1595` 에 인라인 점검 모달이 있고, 단일 `inspectionApi.submitRecord` 호출만 함 (line 1574-1580). `pairedBC`, `bcResult`, `bcMemo`, `bcPhoto` 등 관련 변수/UI 가 전혀 존재하지 않음. 즉 floorplan 에서 hydrant 마커 점검 시 SH 만 저장되고 BC 는 절대 저장되지 않음.
  - source: src/pages/FloorPlanPage.tsx:1459-1599 (인라인 점검 기록 모달), 1545-1580 (저장 버튼 onClick)

- timestamp: 2026-04-28T14:16
  - finding: floorplan plan_type 정의 — `extinguisher` 라벨이 "소화기·소화전" (line 21). 마커 타입 enum 에 `indoor_hydrant` 포함 (line 57). 비상콘센트는 여기 없음. 즉 사용자가 평면도 메뉴에서 "소화기·소화전" 을 열고 hydrant 마커를 탭하면 SH 단독 저장 경로로 고정.
  - source: src/pages/FloorPlanPage.tsx:21, 57, 63

- timestamp: 2026-04-28T14:18
  - finding: 시나리오 재구성 — 박보융이 4-27 14:01 부터 floorplan/소화기·소화전 뷰에서 소화기 마커 16건을 연속 탭/저장하다가, 14:44:43 에 같은 평면도에 있던 소화전 마커(B1 재단시설팀 안)를 탭하여 단독 저장. 동일 session_id, 31초 인터벌, 같은 staff — InspectionPage InspectionModal 경로로 이동했다고 보기 어려움 (이동했다면 zone/floor 재선택 + 소화기 모달 닫기 + 일반점검 페이지 이동 + 소화전 카드 진입 등 5단계 이상 필요).
  - source: 14:10, 14:12, 14:14, 14:16 evidence 종합

- timestamp: 2026-04-28T14:20
  - finding: 4월 기준 SH 인스펙션은 됐는데 같은 location_no 의 BC 가 4월에 저장 안 된 케이스 = 58건 으로 카운트되는 조회 결과가 있었으나, 이는 location_no 가 매핑 안 되거나 (지하 등 SH-only) BC 자체가 없는 케이스도 포함된 것으로 추정. **단순 SH 단독 저장 ≠ 데이터 불일치**: 카드 카운트는 154 = SH 106 + BC 48 합산으로 잘 잡히고, 실제 빠진 BC 는 1개 (B1F-6) 로 153/154 와 정확히 일치.
  - source: D1 SELECT count + 카드 카운트 계산식 재검토

## Eliminated

- ~~InspectionModal 의 handleSave SH→BC 순차 await 실패 (이전 세션의 root cause)~~ — 이전 가설은 가능성으로만 존재, 본 incident 의 직접 원인이 아님. 박보융이 그 경로를 사용했다는 증거 없음. (구조적 위험은 여전히 존재하지만 separate concern.)
- isCpCompleted 룰 화면 분기 — 이번 케이스의 원인 아님 (현재 데이터에서는 strict/loose 결과 동일).
- DB 데이터 무결성 — 누락은 단순히 CP-B1-6-BC 4월 기록 부재 (기록이 있다가 사라진 게 아님).
- migrations 영향 — CP id 변경 흔적 없음 (3월 기록은 정상적으로 같은 id 로 저장돼 있음).
- 사용자가 단독 모드를 골라서 SH만 저장 — InspectionPage 그룹 정의(CATEGORY_GROUPS line 48) 에 단독 모드 분기 없음. 단독 모드는 floorplan 경로에서만 발생.

## Resolution

- root_cause:
  1. **(직접 원인 — 이전 세션과 다름)** `src/pages/FloorPlanPage.tsx` 의 평면도 인라인 점검 모달은 단일 마커의 check_point_id 만 저장한다. paired BC 저장 로직(category=소화전 ↔ category=비상콘센트, 같은 location_no)이 **존재하지 않음**. 박보융이 4-27 14:44:43 에 floorplan/소화기·소화전 뷰에서 B1F-6 소화전 마커를 탭하여 단독 저장 → BC 누락 → 카드 153/154.
  2. **(설계 갭)** floor_plan_markers 테이블에는 indoor_hydrant 마커만 106개 존재하고 비상콘센트 카테고리 마커는 0개. 즉 평면도에서는 비상콘센트가 시각화되지도, 함께 저장되지도 않는다. InspectionPage 의 페어 그룹 모델과 floorplan 의 single-marker 모델이 정합되지 않음.
  3. **(이전 세션이 잡은 부수 위험)** InspectionPage 의 SH→BC 순차 await 자체도 비원자적이지만 본 케이스는 그 경로가 사용된 증거가 없다. 별개 항목으로 관리.
  4. **(인지 불일치)** 소화전+비상콘센트 그룹 picker 가 B1 같은 "소화전 있는 층" 에서 비상콘센트를 picker 에 표시하지 않으므로, BC 가 누락된 사실이 picker 에선 드러나지 않고 사용자에게는 "층별 모든 개소가 완료" 로 보인다 — 진짜 표면 증상의 원인.

- fix:
  - **A. 즉시 데이터 회복 (사용자 작업, 수 초)**: B1 비상콘센트 `CP-B1-6-BC` (재단 시설팀 안) 만 한 번 점검 → 카드 154/154 로 회복.
  - **B. floorplan 측 paired 저장 (권장, 재발 방지)**: `src/pages/FloorPlanPage.tsx` 의 인라인 점검 모달이 `marker_type='indoor_hydrant'` 인 경우, 같은 location_no 의 비상콘센트 CP 를 자동으로 함께 저장. UI 옵션:
    - B-1: SH 저장 직전 또는 직후 BC 결과/메모/사진 입력란을 같은 모달에 추가 (InspectionModal 의 paired BC 섹션과 동일).
    - B-2: hydrant 마커 탭 시 floorplan 인라인 모달 대신 InspectionPage 의 paired modal 로 navigate (initialCpId=SH 로 세팅하여 zone/floor 자동 선택 → 사용자는 결과만 입력).
  - **C. 가시성 개선 (보조)**: InspectionPage picker 에 같은 층 floorCPs (소화전 + 비상콘센트 모두) 의 strict 완료 카운트 함께 표기 → "B1 비상콘센트 1건 미완료" 즉시 표시. (이전 세션의 Fix B 와 같은 방향, 별도 task 로 수행 가능.)
  - **D. 운영 가시성 (보조)**: dashboard 또는 InspectionPage 카드 long-press 로 missing CP 목록 노출.

- verification:
  1. **A** 수행 후 `/inspection` 페이지 reload → 소화전·비상콘센트 카드 154/154 표시.
  2. **B** 적용 후, floorplan 에서 임의 SH 마커 (예: 같은 결정의 B1F-6) 탭 → BC 입력란 노출 또는 InspectionPage paired modal 로 이동 확인. 저장 시 SH+BC 동시 저장.
  3. D1 SELECT count 재실행 — 4월 기준 (SH 106 OR BC 48) 합산이 카드 카운트 = 154 와 항상 동치.
  4. **B-1** 적용 시 사진 업로드 실패/네트워크 오류로 SH 만 저장되는 사고 재현 시 사용자에게 명시적 경고 + 재시도 버튼 표시.

- files_changed: (pending — 사용자 fix 선택 대기)
- specialist_hint: typescript

## Open Questions / Followups

- floorplan plan_type 에 비상콘센트 카테고리 마커를 추가할지 여부 (시각화 가치 vs. 마커 관리 부담 trade-off). 사용자 의사 확인 필요.
- B-2 (navigate) 선택 시 InspectionPage 의 `qrCheckpoint` 메커니즘을 floorplan 에서도 재사용 가능. 코드 변경 폭 작음.
- 4월 기준으로 실제 floorplan 경로로 단독 저장된 SH 가 본 1건 외 더 있는지 추가 점검 필요 (다른 SH 들은 BC 가 같은 시각에 함께 저장된 페어 패턴 vs. 단독 패턴 빈도 측정).
