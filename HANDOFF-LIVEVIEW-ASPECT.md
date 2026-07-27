# 지시서 — 라이브뷰 좌우 잘림 수정 (A/B 안 미리보기 → 사용자 선택 → 반영)

작성: 2026-07-27 (panel-agent 콘솔에서 진단 완료 → prod 콘솔 실행용). branch=production.

## 1. 문제 (진단 확정 — 재조사 불필요)

라이브뷰가 화재수신반 화면의 좌우 테두리를 잘라 보여준다. **우측 화재/설비/고장/회로차단
카운터 패널이 잘리는 위치라 감시 품질에 실해가 있는 잘림이다.**

- 원본(에이전트 업로드): **1920×932, 비율 2.06:1** — 맥미니 `config.env` 의 `CROP` 이
  1080 에서 상단 148px(수신반 PC 의 윈도우 메뉴바)을 의도적으로 제거한 결과. **원본에는
  수신반 본 화면(도면+우측 카운터+층목록)이 전부 들어 있다.** 실물 확인:
  `https://cbc7119.pages.dev/api/public/panel/latest.jpg` (공개 경로).
- 잘림의 주범 = **표시 단계**: 라이브 컨테이너가 전부 16:9(`aspect-video`) 고정 +
  `object-cover` → 2.06:1 원본의 **좌우 합계 ~13.5%가 잘린다.**
- ⚠️ 비율 2.06 을 하드코딩하지 마라 — `CROP` 값이 바뀌면 비율도 바뀐다. B안은 반드시
  이미지 `naturalWidth/naturalHeight` 에서 동적으로.

## 2. 두 안 — **둘 다 미리보기로 만들어 사용자가 보고 결정한다**

- **A안 — `object-contain`**: 전체 화면 상시 가시, 위아래 레터박스(~13%). 컨테이너 불변 →
  레이아웃 영향 0. (배경은 이미 `bg-black` 이라 레터박스가 자연스럽다)
- **B안 — 컨테이너 비율을 원본에 동적으로 맞춤**: `LivePanelImage` 가 `onLoad` 에서
  naturalWidth/Height 를 읽어 wrapper 에 `style={{ aspectRatio: w/h }}` 적용. 여백도 잘림도
  없으나 카드 높이가 줄어 배치가 바뀐다 — 고정높이 사용처는 적용 제외 필요(아래 표).

**미리보기 방법**: 각각 브랜치 없이 `npx wrangler pages deploy dist --branch=preview-a` /
`--branch=preview-b` 로 올리면 별도 preview URL 이 나온다 — 실기기(아이폰)+데스크톱에서 두
URL 비교. preview 환경에 D1/R2 바인딩이 없어 라이브뷰가 안 뜨면 폴백: 로컬
`npm run dev:front` + `dev:api` 로 확인. **판정 기준 = 우측 카운터 4행(화재/설비/고장/회로차단)
완전 가시 + 하단 '도면출력' 버튼 가시.**

## 3. 표시 지점 전수 (2026-07-27 HEAD `d469a580` 기준 실측)

| 파일 | 위치 | 현재 | 비고 |
|---|---|---|---|
| `src/components/panel/LivePanelImage.tsx` | props 기본값 | `aspectClass='aspect-video'`, `objectClass='object-cover'` | **공용 컴포넌트 — 기본값을 바꾸면 전 소비처에 일괄 적용된다.** B안 로직도 여기에 |
| `src/pages/DashboardPage.tsx` | :492 부근 (데스크톱 카드) | `imgClassName="w-full h-full object-cover"` | aspect-video 블록 내부 |
| `src/pages/DashboardPage.tsx` | :689 부근 (모바일 카드) | `aspectClass="h-full" objectClass="object-fill"` | **고정높이 트랙(h-120px) — B안 적용 제외 대상.** object-fill 은 짜부(왜곡) — A안이면 contain 으로 통일 검토 |
| `src/pages/InspectionPage.tsx` | :4534 부근 (모바일 페인) | `imgClassName="...object-cover"` | |
| `src/pages/InspectionPage.tsx` | :4711 부근 (줌/확대 뷰) | 확인 필요 | 핀치줌 뷰 — 이미 전체 표시라면 손대지 말 것 |
| `src/pages/InspectionPage.tsx` | :5435 부근 (데스크톱 페인) | `imgClassName="...object-cover"` | |
| `src/pages/PanelMonitorPage.tsx` | :463 부근 | 기본값(cover) | |
| `src/pages/FireAlarmPage.tsx` | :131 부근 | 확인 필요 | 풀스크린 경보 화면 — 경보 스냅샷 모드 포함. 화재 순간 화면이니 신중히 |

## 4. 회귀 금지 (오늘 들어간 것들 — 건드리면 안 됨)

- `LivePanelImage` 의 `signalDownLabel` prop(캡처 죽음 회색 오버레이)과 프리로드 더블버퍼 폴 로직.
- `liveSignalDown` 게이트(freshness.ts)·PanelMonitorPage blind 판정·pm-body 스크롤 구조.
- 경보 스냅샷 모드(`snapshotKey`)의 표시도 같은 컴포넌트를 탄다 — cover→contain 변경이
  스냅샷 썸네일(FireAlarmHistory 등)에 미치는 영향 확인.

## 5. 절차

1. A안 구현 → preview-a 배포 · B안 구현 → preview-b 배포 (커밋은 아직 production 반영 금지)
2. 사용자 실기기 비교 → 선택
3. 선택안만 production 커밋(quick task 컨벤션) + `npm run deploy`
4. 실기기 재확인(카운터 4행 가시) 후 종료
