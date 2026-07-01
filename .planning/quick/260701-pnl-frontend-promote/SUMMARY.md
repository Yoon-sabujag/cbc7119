---
status: complete
slug: 260701-pnl-frontend-promote
date: 2026-07-02
parent_commit: 42ef77e8
deploy_url: https://fad4a10f.cbc7119.pages.dev
---

# 화재수신반 Phase 25 프론트 직원도메인 승격 (외과적 10파일)

main(디자인 트랙)의 Phase 25 프론트를 직원 domain(cbc7119 `production` 브랜치)으로
**외과적 선별 승격**. `git merge main`이나 파일 통째복사는 금지 — production↔main이
양방향 분기(63파일)라 merge 시 되돌리면 안 되는 것들(photoVault 사진누락가드 / DivInspectModal /
cp_description / computeCategoryCounts / 6·7·6 도넛 그리드)을 회귀시킴.

## 사전 리뷰 (4병렬 read-only workflow)

- **스코프**: Phase 25 관련 = 정확히 10파일. 나머지 53(ElevatorPage/SchedulePage/FloorPlanPage 등
  redesign 드리프트) + main 삭제분(DivInspectModal/photoVault/formatFloorLabel/cp_description) 제외 확정.
- **정확성**: P1 없음. P2-1(sticky alarmAcked), P2-2(resolve-vs-create 15s 폴링), P2-3(더블탭 줌 리셋) + P3들.
- **백엔드정합**: API 경로 전부 일치, 저장=resolve, **AGENT_KEY 프론트 누출 0(P1 없음)**, VAPID 구독·sw 딥링크 정상.
  F1(중): `mapAlarm` location 누락 → "방재실 화재수신반" 대신 "장소 확인 필요".
- **회귀**: merge 금지 재확인. sw.ts fallback 회귀 발견.

## 승격 (10파일, GSD quick 메인 직접 — worktree/서브에이전트 미사용, production 브랜치)

- **clean-copy/신규 7**: FireAlarmPage(신규) + components/panel/{LivePanelImage,freshness}(신규) +
  hooks/usePinchZoom(신규) + index.css(keyframes append) + App.tsx(/fire-alarm 라우트+no-nav, cp) +
  sw.ts(딥링크, cp + **fallback `/fire-alarm`→`/` 회귀수정**).
- **재패치 3** (통째복사 금지, production 소스 보존):
  - api.ts — panelApi/alarmApi/Alarm interface append, **cp_description 보존**.
  - DashboardPage — cp main + **6·7·6 데스크톱 그리드+gap-4 복원**(main의 May-2 even-split 리그레션 제외).
  - InspectionPage — line-splice로 Phase25 4조각만: imports + deep-link useEffect + FireAlarmModal
    3-state 확장 + DesktopInspectionView panel pane. **DivInspectModal/useDivNames/CompressorModal 보존**.
    누락 아이콘 5(BellRing/BellOff/RefreshCw/Maximize2/Plus) 추가.
- **검증**: tsc 0 + build(precache 87) + 배포 후 스모크(앱 200·/fire-alarm 200·/api/* 401 JSON·메인청크).

## 상태

- **dormant**: 백엔드(260701-pnl)+프론트 모두 prod. 단 맥 에이전트 미배포 → 라이브뷰 미연결·경보없음 placeholder.
  직원 화면에 대시보드 패널카드/화재수신반 UI 노출(placeholder). **사용자 UI 검증 대기(브라우저+PWA 재설치).**

## 다음 (맥 에이전트 배포 전 처리)

1. **기능버그 source 수정** (세 트랙 수렴): design 프론트 — P2-1 alarmAcked를 alarm.id 키로 / P2-2 modal-open
   스냅샷으로 resolve-vs-create 고정 / P2-3 onDoubleClick 비-터치 게이트 / sw.ts fallback `/`. staging+prod
   백엔드 — F1 `mapAlarm`에 `location: LOCATION_LABEL` 추가.
2. 맥 에이전트 배포(프레임 R2 업로드, AGENT_KEY 동일값).
3. cbc-cron-worker watchdog(연결감시) 프로액티브 push.
