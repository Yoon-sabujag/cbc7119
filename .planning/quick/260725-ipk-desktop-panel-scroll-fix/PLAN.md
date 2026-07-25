---
quick_id: 260725-ipk
slug: desktop-panel-scroll-fix
date: 2026-07-25
branch: production
type: bugfix
---

# 데스크톱 화재수신반 pane 스크롤/클리핑 버그 수정

## 증상 (사용자 보고)
데스크톱 화재수신반 페이지에서 (1) 라이브뷰가 화면 하단이 잘림, (2) 수동 기록 추가
카드가 스크롤이 안 돼 내용이 다 안 보임.

## 근본 원인
`cha-bio-safety/src/pages/InspectionPage.tsx` — `DesktopInspectionView`의 화재수신반 상세
pane "id-body"(~5465행)가 **스크롤 컨테이너(`overflow-y-auto`)이면서 동시에 flex 컬럼
(`flex flex-col gap-[15px]`)**이다. 자식이 CSS 기본 `flex-shrink:1`을 가지므로 flexbox가
자식(biglive `aspect-video` 라이브뷰, `수동 기록 추가` form-card)을 pane 높이에 맞춰
**shrink** 시킨다 → 오버플로가 생기지 않아 스크롤바가 뜨지 않고, 축소된 카드는 각자의
`overflow-hidden` 때문에 하단이 잘린다.

- 올바른 패턴을 쓰는 곳: 모바일 `FireAlarmModal`(4558행 — 블록 스크롤러 + 내부 flex 래퍼),
  데스크톱 카테고리 목록(5706행 — 블록 스크롤러 + 내부 `flex flex-col`). 데스크톱 패널
  pane만 예외적으로 스크롤러 자체를 flex 컬럼으로 만들어 회귀.

## 검증 (수정 전, headless Chrome 실측)
동일 flex 구조 재현 harness:
- BROKEN: `scrollHeight == clientHeight` (708==708) → scrollable=false, form 415px < natural 452px (하단 잘림)
- FIXED : `scrollHeight 952 > clientHeight 708` → scrollable=true, form/라이브뷰 full-height

## 수정
`id-body`를 순수 블록 스크롤러로 바꾸고, 기존 자식 전체를 내부 flex 래퍼로 감싼다.

```
- <div className="flex-1 flex flex-col gap-[15px] overflow-y-auto p-4 pb-[22px]">
-   {children...}
- </div>
+ <div className="flex-1 overflow-y-auto p-4 pb-[22px]">
+   <div className="flex flex-col gap-[15px]">
+     {children...}
+   </div>
+ </div>
```

`gap-[15px]`는 내부 래퍼로 이동 → 카드 간 간격 시각 동일. 콘텐츠가 pane에 들어갈 때는
시각 변화 0, 넘칠 때만 정상 스크롤.

## 범위 밖 (건드리지 않음)
- `panelHistoryOpen` 분기, alarm/normal 폼 내부 구조, 모바일 `FireAlarmModal`
- 다른 카테고리 pane, PanelMonitorPage

## 검증 (수정 후)
- `npm run build` (tsc + vite) PASS — JSX 래퍼 삽입으로 태그 균형 확인
- 수정된 파일 diff = InspectionPage.tsx 1파일, id-body 래핑만

## 배포
production 수동 wrangler 배포는 **사용자 시각 확인 후**에만.
