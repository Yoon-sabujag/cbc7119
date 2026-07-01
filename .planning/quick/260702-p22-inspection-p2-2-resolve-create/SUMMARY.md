---
quick_id: 260702-p22
slug: inspection-p2-2-resolve-create
date: 2026-07-02
status: complete
parent_commit: 13a94daa
commits:
  - c45097e5  # P2-2 InspectionPage resolve↔create open-time snapshot
deploy_url: https://095bbd44.cbc7119.pages.dev
---

# SUMMARY — P2-2 prod 미러 + P2-1 데스크톱 UI 미승격 발견

design/main 코드리뷰 기능버그(260702-1vw) 중 InspectionPage 2건(P2-1/P2-2)의 prod 재승격 시도. **P2-2 는 적용·배포, P2-1 은 대상 UI 부재로 보류(발견 보고).**

## P2-2 — resolve↔create 오분기 (적용 완료)

**버그**: FireAlarmModal(모바일)·DesktopInspectionView 패널 pane 의 저장 2분기(`경보중=resolve / 평상시=create`)가 15s 폴링되는 LIVE `activeAlarm`/`mode` 로 판단 → 사용자가 폼 편집하는 사이 폴링이 alarm↔normal 을 뒤집으면 중복 `create` 또는 오분 `resolve`.

**수정** (design f5978ff7 동일): 오픈 시점 activeAlarm 1회 스냅샷 ref.
- 모바일: `openAlarmRef`(mount-settle 캡처), maintOn 시 null.
- 데스크톱: `panelOpenAlarmRef`(`isPanel` true 캡처·false 리셋).
- save 분기·prefill 이 `snap` 사용(`resolve(snap.id`), DISPLAY(`mode`/`panelMode`)는 LIVE 유지.

**검증**: prod 4개 블록이 design diff "old" 와 **byte-identical** → design "new" 그대로 적용. 의존 심볼 존재(isPanel L4797·maintOn·`type Alarm` import). 마커 openAlarmRef 5·panelOpenAlarmRef 6·`resolve(snap.id` 2·잔존 `resolve(activeAlarm.id` 0. tsc 0 + build precache 87. 배포 095bbd44. 커밋 c45097e5(InspectionPage.tsx, 4곳).

## P2-1 — 보류 (중요 발견)

P2-1(데스크톱 두번째 경보 takeover 안뜸: `alarmAcked` sticky bool → `ackedId`)의 **대상 takeover 모달이 prod 에 존재하지 않음.**

**근거**: `alarmAcked`(L4848)·`handleAlarmAck`(L4903)는 선언되나 **읽는/호출하는 JSX 없음**. `alarm-modal`/`am-card` 클래스 0건. `panelZoomOpen`(L4847)·`panelZoom.*` 도 선언만·미사용 = biglive **줌 오버레이 JSX 도 미승격**. prod InspectionPage 5472줄 vs main 6768줄(**~1300줄 축소**).

**결론**: 42ef77e8(Phase 25 프론트 승격)이 DesktopInspectionView 를 **축소 이식** — 데스크톱 takeover 모달 + biglive 줌 오버레이가 통째로 빠짐. 따라서 **prod 데스크톱 ≠ preview**. P2-1 은 단독 3줄 패치 대상이 없어 보류. 데스크톱 경보 UI 를 preview 와 맞추려면 **DesktopInspectionView 재승격(별도 작업)** 필요.

## 사용자 결정 대기

- 데스크톱 경보 UI(takeover 모달 + 크게보기 줌) 재승격 여부. dormant·데스크톱 한정·모바일이 주 인터페이스라 우선순위 판단 필요.
- UAT: 실경보(맥 에이전트 배포 후) 편집 중 폴링에도 저장 정확 분기 + prod PWA 재설치.
