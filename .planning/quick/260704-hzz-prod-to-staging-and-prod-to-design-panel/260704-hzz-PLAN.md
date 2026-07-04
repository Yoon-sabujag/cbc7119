---
quick_id: 260704-hzz
title: prod→staging / prod→design 화재수신반 패널 갭 이관 핸드오프 문서 2개
date: 2026-07-04
status: complete
type: docs-only
---

# Quick 260704-hzz — 패널 갭 이관 핸드오프 문서

## 목표
화재수신반 패널 작업(260702-p22 백엔드 + 260704-0xr/fh2 UI)이 prod(`production` 브랜치)에 직접
적용되면서 staging(cbc7119-data)·design(cbc7119-design)이 뒤처짐. 두 콘솔이 각자 갭을 메울 수 있게
**이관 지시서 2개를 이 prod 리포에 작성**. 앱/코드 변경 없음 — 문서만.

## 기준점 (분석 세션 git 실측)
- prod HEAD: `a4e89772` (production)
- staging 동기점: `0f564d77` — cbc7119-data 는 이 상태에서 멈춤(마이그 0092까지, functions 백엔드 본체 있음)
- design base: `origin/main` `e524b90a` (마이그 0090까지, 신규 3파일 없음, api.ts 에 fault 타입 없음)

## 갭 요약
- **staging = 백엔드/데이터**: 마이그 `0093_panel_alarms_fault` + `0094_panel_alarms_location`
  + `functions/_lib/{alarm,push}.ts` + `functions/api/alarm/{trigger,clear,renotify}.ts`
- **design = UI**: 신규 `panelEvents.ts`/`PanelEventRow.tsx`/`FireAlarmHistoryPage.tsx`
  + `InspectionPage/DashboardPage/FireAlarmPage/App/api/LivePanelImage` 변경

## 산출물
1. `STAGING-HANDOFF.md` — staging 콘솔(cbc7119-data)에 붙일 지시서
2. `DESIGN-HANDOFF.md` — design 콘솔(cbc7119-design)에 붙일 지시서

## 태스크
- [x] STAGING-HANDOFF.md (마이그 복사경로 + 백엔드 델타 git apply -p2 fast path + 수기 fallback + 배포/검증)
- [x] DESIGN-HANDOFF.md (신규/변경 파일 + 승인 시안 경로 + cherry-pick 함정 + push→cbc7119-preview)

## 검증 노트
- 두 문서는 분석 세션의 `git diff 0f564d77..production` / `git log origin/main..production` / 3-트랙 파일 대조로 실측한 사실만 담음
- 콘솔 격리 유지: 문서는 prod 리포에만 두고, 각 콘솔은 절대경로로 읽음 (prod 콘솔에서 staging/design 직접 조작 X)
