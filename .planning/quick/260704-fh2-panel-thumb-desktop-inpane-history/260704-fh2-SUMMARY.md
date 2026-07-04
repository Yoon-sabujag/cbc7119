# Quick 260704-fh2: 데스크톱 수신반 썸네일 복원 + 전체이력 in-pane Summary

260704-0xr(화재수신반 이벤트 병합 + 전체이력 페이지) 후속. 데스크톱 이벤트 카드에 84×48 수신반 스냅샷 썸네일을 되살리고(모바일 제외), 데스크톱 "전체 이력"을 별도 라우트 대신 화재수신반 상세 pane 안에서 렌더(사용자 선택 A). PanelEventRow / FireAlarmHistoryView 를 카드·in-pane·모바일 route 3곳이 공유해 드리프트 0.

## 변경 파일

- `cha-bio-safety/src/utils/panelEvents.ts` — `PanelEventItem.snapshotUrl: string | null` 추가. 자동(`normalizeAuto`)=Alarm.snapshotUrl, 수동(`normalizeManual`)=null.
- `cha-bio-safety/src/components/PanelEventRow.tsx` — optional `thumb?: boolean`. thumb 시 리딩에 84×48 썸네일(snapshotUrl 있으면 img object-cover, 없으면 수기/미연결 fallback).
- `cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx` — `FireAlarmHistoryView({ thumb })` 추출(필터존+리스트, 풀페이지 헤더 제외). `FireAlarmHistoryPage`(모바일 route)는 h-12 back 헤더 + View(thumb 없음). 리스트 PanelEventRow 에 `thumb={thumb}`.
- `cha-bio-safety/src/pages/InspectionPage.tsx` —
  - `panelHistoryOpen` state + `FireAlarmHistoryView` import.
  - 데스크톱 카드 리스트 `PanelEventRow ... thumb` (모바일 4341 은 그대로).
  - 데스크톱 "전체 이력" 버튼: `navigate('/fire-alarm-history')` → `setPanelHistoryOpen(true)` (모바일 4335 버튼은 navigate 유지).
  - `isPanel` pane 을 `panelHistoryOpen` 로 분기: true 면 pane 헤더(ChevronLeft 뒤로가기 + BellRing "화재수신반 이력", 기존 pane 헤더 컨벤션) + `FireAlarmHistoryView thumb`, false 면 기존 화재수신반 콘텐츠.
  - `isPanel` else effect 에 `setPanelHistoryOpen(false)` 리셋 추가.

## 커밋

- `c4255ac8` feat(260704-fh2): 데스크톱 카드 수신반 스냅샷 썸네일 복원
- `cf08be76` feat(260704-fh2): 데스크톱 전체 이력 in-pane 렌더 (선택 A)

## Deviations from Plan

None — 계획대로 실행. Alarm 타입에 `snapshotUrl?: string | null` 이 이미 선언돼 있어 `as any` 불필요, 타입드 접근(`a.snapshotUrl ?? null`) 사용.

## 검증

- `npx tsc --noEmit` — 신규 에러 0 (TASK1/TASK2 각각 통과).
- FRONTEND ONLY, functions/ 무변경. 새 의존성 X. 인라인 tailwind 다크토큰 유지.
- 3곳(모바일 카드 / 데스크톱 카드 / 모바일 route 이력 / 데스크톱 in-pane 이력)이 PanelEventRow·FireAlarmHistoryView 공유 — 드리프트 0.
- 데스크톱 pane 열기/닫기 로직: 전체이력 버튼→panelHistoryOpen true→in-pane 이력, 뒤로가기→false→화재수신반 콘텐츠 복귀. 카테고리 벗어나면(isPanel false) effect 로 리셋.

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/utils/panelEvents.ts
- FOUND: cha-bio-safety/src/components/PanelEventRow.tsx
- FOUND: cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx
- FOUND: cha-bio-safety/src/pages/InspectionPage.tsx
- FOUND commit: c4255ac8
- FOUND commit: cf08be76
