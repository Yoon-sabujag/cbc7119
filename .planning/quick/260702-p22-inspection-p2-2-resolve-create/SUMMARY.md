---
quick_id: 260702-p22
slug: inspection-p2-2-resolve-create
date: 2026-07-02
status: complete
parent_commit: 13a94daa
commits:
  - c45097e5  # P2-2 resolve↔create open-time snapshot
  - 142aac24  # 데스크톱 takeover 모달 + biglive 줌 오버레이 재승격 + P2-1
deploy_url: https://9f4b9aea.cbc7119.pages.dev
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

## 후속 — 데스크톱 재승격 완료 (142aac24, 배포 9f4b9aea)

사용자 '둘 다 지금' 결정 → design/main `704c9158` 에서 **takeover 모달 + biglive 줌 오버레이 2블록을 DesktopInspectionView return 끝에 verbatim 이식** + **P2-1**(`alarmAcked` sticky bool → `ackedId` id-비교).

- 삽입 위치: 내용 `</div>` 다음, 루트 `</div>` 앞 (main 과 동일 구조).
- biglive 클릭(L5179 setPanelZoomOpen)·딥링크 zoom=1(L4836) 트리거는 이미 있었으나 여는 오버레이 JSX 가 없어 dead 였던 것 해소.
- 의존성 전부 prod 존재: Flame(L27 import)·X·Maximize2·paBlink·LivePanelImage·panelZoom hook·FIRE_ALARM_IDX·setCategoryIdx·setRecordId·panelStatus.
- 검증: 이식 2블록 `diff` vs main **byte-identical**. 마커 am-card/alarm-modal/am-ico/panelZoom.bind/onClick handleAlarmAck 각 1·ackedId 3·alarmAcked 0. tsc 0 + build 87.
- **결과: 데스크톱 InspectionView = preview.** 직원 앱 화재수신반 코드 전 표면 완결.

## 남은 것

- **UAT**(실발현은 맥 에이전트 배포 후): 데스크톱 2번째 경보 takeover 재노출 / biglive 크게보기 줌 / 편집 중 15s 폴링에도 저장 정확 분기 + prod PWA 재설치.
- **다음 단계 = 맥 에이전트 연동** (캡처보드 프레임 R2 업로드 → 라이브뷰 활성 → 실제 디버깅). 백엔드·AGENT_KEY prod 준비됨.
