---
phase: quick-260803-vp9
plan: 01
subsystem: alarm-history
tags: [panel-agent, fire-alarm, dedup, modal]
dependency-graph:
  requires: [260803-tan]
  provides: [panel-event-detail-modal, panel-event-dedup]
  affects: [FireAlarmHistoryPage, InspectionPage-FireAlarmModal, InspectionPage-desktop-pane]
tech-stack:
  added: []
  patterns: ["draftRecordId 기반 사건단위 dedup 조인", "3곳 공용 세부 열람 모달"]
key-files:
  created:
    - cha-bio-safety/src/components/PanelEventDetailModal.tsx
  modified:
    - cha-bio-safety/src/utils/panelEvents.ts
    - cha-bio-safety/src/components/PanelEventRow.tsx
    - cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx
    - cha-bio-safety/src/pages/InspectionPage.tsx
decisions:
  - "다중 auto 가 한 record 를 가리키는 경우 마지막 매칭이 캡처를 남기도록 Map 순서에 위임(실사용 1:1이라 무해)"
  - "출처(자동/수동) 세그먼트 필터 완전 제거 — 종류 필터만 유지"
metrics:
  duration: "약 35분"
  completed: 2026-08-03
---

# Phase quick-260803-vp9 Plan 01: 수신반 이력 통합·캡처 열람 Summary

draftRecordId 조인으로 확정 기록과 연결 자동 경보를 사건 단위 1행으로 병합하고, 캡처 열람을 3곳 공용 세부 모달로 이전, 줌 뷰어는 라이브 전용으로 복귀.

## 배경

260803-tan 배포 직후 사용자 피드백 3건 반영:
1. 줌 뷰어(모바일·데스크톱)의 라이브↔경보시점 토글이 원래 취지를 벗어남 → 라이브 전용 복귀
2. 확정 기록(fire_alarm_records)과 연결된 자동 경보(panel_alarms)가 이력에 2행으로 중복 표시 → 사건 단위 dedup
3. 캡처는 라이브 자리가 아니라 기록·이력 열람에 붙어야 함 → 이벤트 행 탭 시 열리는 세부 모달 신설

## 완료한 작업

### Task 1 — panelEvents.ts 사건단위 dedup 병합

`PanelEventItem` 에 `snapshotKey`, `detectedAt`, `action`, `clearedReason`, `recordType`, `status`, `draftRecordId` 7개 필드 추가. `mergePanelEvents`를 재작성해 `draftRecordId === record.id` 로 조인되는 자동 경보 행을 숨기고, 그 캡처(snapshotKey/snapshotUrl/detectedAt)를 대응하는 수동 기록 행에 부착한다. 한쪽 창에만 존재하는 상대는 매칭 실패로 그대로 표시(데이터 손실 없음).

커밋: `51b5a112`

### Task 2 — 출처칩 제거·탭 + 공용 세부 모달 3곳 배선

- `PanelEventRow.tsx`: 자동감지/수동 출처 칩 삭제, `onSelect` prop 추가로 행 전체 탭 가능화. 썸네일 미연결 폴백 문구를 출처 중립 `'캡처 없음'` 으로 변경.
- `PanelEventDetailModal.tsx` (신규): 확정 기록은 구분(화재보/비화재보)·발생일시·장소·원인·조치, 미확정 경보는 종류·시각·해제사유를 보여주고, `snapshotKey` 있으면 경보 시점 캡처 이미지(`/api/public/panel/{key}.jpg`)를 노출. 이미지 탭 시 전체화면 확대.
- `FireAlarmHistoryPage.tsx`: `FireAlarmHistoryView` 에 모달 배선, **출처 Segment 필터 완전 제거**(종류 필터는 유지). 월 스테퍼는 같은 행에서 유지.
- `InspectionPage.tsx`: 모바일 `FireAlarmModal` 최근 이벤트 카드에 모달 배선. 데스크톱 in-pane 이력은 `FireAlarmHistoryView` 재사용이라 자동 커버.

커밋: `16ce8a0f`

### Task 3 — 줌 뷰어 라이브↔경보시점 토글 제거

260803-tan(`b2821a67`/`035a8d26`)이 넣었던 줌 뷰어 라이브/경보시점 토글을 모바일 `FireAlarmModal`·데스크톱 pane 양쪽에서 제거. `zoomSnap`/`panelZoomSnap`/`draftSnapKey`/`panelDraftSnapKey` 상태·토글 버튼·조건부 프레임 렌더를 모두 삭제하고 `<LivePanelImage frameUpdatedAt=.../>` 만 남김. 줌 뱃지의 `화재`/`LIVE` 표기·blink 는 라이브 상태 표기이므로 그대로 유지.

커밋: `b523c96d`

## Deviations from Plan

None - 플랜 그대로 실행됨. 라인 번호는 앞선 태스크 편집으로 소폭(±3~7줄) 밀렸으나 grep/read 로 실제 위치를 재확인하여 정확히 대상 심볼만 편집.

## 검증 결과

- `npx tsc --noEmit`: 통과 (각 태스크 개별 + 최종)
- `npm run build`: 통과 (`InspectionPage-BeeHX1bJ.js` 176.39 kB — 정상 번들)
- `grep -c draftRecordId panelEvents.ts` = 6 (≥3 요구 충족)
- `grep -c "자동감지" PanelEventRow.tsx` = 0
- `grep -c "zoomSnap\|panelZoomSnap\|draftSnapKey\|panelDraftSnapKey" InspectionPage.tsx` = 0
- `functions/` 디렉토리 diff 없음 — 서버 무변경 확인
- InspectionPage.tsx 전체 diff 육안 검토 — 260803-tan 의 자동 ack·초안 카드·OCR prefill·푸시 문구 로직은 손대지 않음

## 실데이터 육안 검증 (배포 후, 사용자 몫 — 이번 실행 범위 밖)

- 확정 기록 FA-zZOVmVA2wi ↔ 경보 PA-Zz0QWdxnus 가 이력에 1행만 표시되는지
- 그 행 탭 → 세부 모달에 구분·발생일시·장소·원인·조치 + 경보 시점 캡처 노출, 캡처 탭 시 확대되는지
- 줌 뷰어(모바일·데스크톱)에 라이브/경보시점 토글 버튼이 없는지
- 미확정 경보 행 탭 → 종류·시각·해제사유 + 캡처(있으면)만 표시되는지

## Self-Check: PASSED
