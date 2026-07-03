---
phase: quick-260704-0xr
plan: 01
subsystem: 화재수신반 원격감시 (Phase 25)
tags: [frontend, react, panel-alarm, fire-alarm, merge-view]
requires:
  - alarmApi.getEvents (기존)
  - fireAlarmApi.getByYear (기존)
provides:
  - PanelEventItem / mergePanelEvents / KIND_BADGE / kstStr / useRecentPanelEvents (utils/panelEvents)
  - PanelEventRow (공용 이벤트 행)
  - /fire-alarm-history 페이지
affects:
  - InspectionPage 화재수신반 카드 x2 (모바일 모달 + 데스크톱 pane)
tech-stack:
  added: []
  patterns: [react-query 캐시키 공유, JSX 명시적 제네릭 타입인자, KST wall-clock Intl.formatToParts]
key-files:
  created:
    - cha-bio-safety/src/utils/panelEvents.ts
    - cha-bio-safety/src/components/PanelEventRow.tsx
    - cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx
    - cha-bio-safety/src/App.tsx
decisions:
  - "수동기록 kind 는 fire/non_fire 모두 화재(kind:'fire')로 취급 — 화재수신반 수동기록은 전부 화재수신반 사건"
  - "데스크톱 구버전 84x48 ethumb 썸네일 제거 — 시안 001-B(썸네일 없음)가 SSOT, 수동기록엔 스냅샷 부재"
metrics:
  duration: ~15m
  completed: 2026-07-04
---

# Quick 260704-0xr: 화재수신반 최근 이벤트 병합 뷰 + 이력 페이지 Summary

자동감지(panel_alarms)와 수동기록(fire_alarm_records)을 단일 정규화 타입으로 시간 내림차순 병합해 화재수신반 카드에 최근 48시간 통합 뷰를 띄우고, 신설 `/fire-alarm-history` 페이지에서 종류·출처 세그먼트 필터 + 월 스테퍼 + 날짜 그룹으로 전체 이력을 조회하도록 구현. 백엔드 무변경, 기존 엔드포인트만 소비.

## Tasks

### Task 1 — 병합 헬퍼 + 공용 행 컴포넌트 + 카드 x2 개조 (687464ac)
- `panelEvents.ts`: `PanelEventItem` 타입, `normalizeAuto`/`normalizeManual`(created_by!=='panel-agent' 필터로 자동초안 중복 제외), `mergePanelEvents`(time 문자열 localeCompare 내림차순), `KIND_BADGE`, `kstStr`(Intl.formatToParts 로 KST wall-clock, epoch 산술 회피), `useRecentPanelEvents`(48h 창 + 연말경계 시 전년 쿼리 enabled 게이트로 훅 순서 고정).
- `PanelEventRow.tsx`: 시안 001-B — 좌측 세로 칩 스택(종류칩 + 자동감지/수동칩) + 우측 시각/위치/원인.
- `InspectionPage.tsx` 카드 2곳(모바일 `FireAlarmModal` + 데스크톱 `DesktopInspectionView`): 타이틀 '최근 이벤트 (최근 48시간)', 비-경보 우상단 '전체 이력' 버튼(navigate('/fire-alarm-history')), 경보 '감지중 N' 유지, 리스트를 `mergedEvents`/`mergedPanelEvents`.map → `PanelEventRow` 로 교체. 저장 성공 분기(resolve/create 양쪽)에 `fire-alarm-year` 무효화 추가. 미사용된 `badge2`/`panelBadge2` 삭제.

### Task 2 — 이력 페이지 신설 + 라우트 등록 (cf019347)
- `FireAlarmHistoryPage.tsx`: 시안 002-A. 내부 `Segment` 제네릭 컴포넌트(종류/출처), 월 스테퍼(12↔1 롤오버), 자동 720h + 수동 연도쿼리(`fire-alarm-year` 캐시 Task1 공유), 병합→월/종류/출처 필터→날짜 연속그룹(오늘/어제/MM-DD), `PanelEventRow` 재사용, 빈상태 문구.
- `App.tsx`: `/fire-alarm-history` lazy 라우트(Auth 래핑) + `MOBILE_NO_NAV_PATHS`·`DESKTOP_HEADER_HIDE_PATHS` 등록(사이드바 유지, 자체 헤더).

## Deviations from Plan

**1. [Rule 3 - Blocking] Segment 제네릭 타입인자 명시**
- **Found during:** Task 2 typecheck
- **Issue:** `<Segment value={kindF} onChange={setKindF} .../>` 에서 TS 가 options 배열 리터럴의 `key: string` 로부터 제네릭 T 를 `string` 으로 넓혀 `onChange`(Dispatch<KindFilter>) 와 불일치 (TS2322 x2).
- **Fix:** 호출부에 명시적 타입인자 `<Segment<KindFilter>>` / `<Segment<SrcFilter>>` 부여.
- **Files modified:** cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx
- **Commit:** cf019347

그 외 계획대로 실행됨.

## Verification
- `npx tsc --noEmit` 통과 (신규 타입 에러 0, baseline 도 clean 이었음).
- functions/ git diff 0 (두 커밋 통합 확인) — 백엔드 무변경 게이트 통과.
- 신규 파일 3개 존재 확인.
- 카드 2곳 타이틀/버튼/리스트 교체 + 001-B 세로 칩 스택 반영, 이력 페이지 mergePanelEvents/PanelEventRow 재사용.
- 헤드리스 렌더 육안 확인은 오케스트레이터 별도 수행(플랜 범위 밖).

## Known Stubs
없음 — 모든 카드/페이지가 실데이터(alarmApi/fireAlarmApi)에 연결됨. 자동감지 감시는 6월 시작이라 720h(30일) 창이 현재 자동 전량 커버.

## Self-Check: PASSED
- FOUND: src/utils/panelEvents.ts, src/components/PanelEventRow.tsx, src/pages/FireAlarmHistoryPage.tsx
- FOUND commit 687464ac, cf019347
