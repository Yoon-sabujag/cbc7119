---
quick_id: 260725-ipk
slug: desktop-panel-scroll-fix
date: 2026-07-25
branch: production
status: complete
files_modified:
  - cha-bio-safety/src/pages/InspectionPage.tsx
---

# SUMMARY — 데스크톱 화재수신반 pane 스크롤/클리핑 버그 수정

## 무엇을 했나
`DesktopInspectionView`의 화재수신반 상세 pane `id-body`를 **flex 컬럼 겸 스크롤러**에서
**순수 블록 스크롤러 + 내부 flex 래퍼**로 분리했다.

```
- <div className="flex-1 flex flex-col gap-[15px] overflow-y-auto p-4 pb-[22px]">
+ <div className="flex-1 overflow-y-auto p-4 pb-[22px]">
+   <div className="flex flex-col gap-[15px]">
      ... (maint-note · biglive · alarm 폼 · evt-card · form-card 그대로)
+   </div>
  </div>
```

diff = 6 insertions / 2 deletions, InspectionPage.tsx 1파일.

## 왜
스크롤 컨테이너가 동시에 `flex flex-col`이면 자식(기본 `flex-shrink:1`)이 pane 높이에
맞춰 축소된다 → 오버플로 없음 → 스크롤 죽음 + biglive/form-card의 `overflow-hidden`으로
하단 클리핑. 라이브뷰 하단 잘림 + 수동 기록 추가 카드 스크롤 불가의 원인.

## 검증
- **headless Chrome 재현/대조 (수정 전 로직)**: BROKEN `scrollHeight==clientHeight`(708==708,
  scrollable=false), form 415<452(잘림) → FIXED `scrollHeight 952 > clientHeight 708`
  (scrollable=true), 카드 full-height. 동일 flex 구조 harness로 CSS 동작 확정.
- **`npm run build` (tsc + vite) PASS** — JSX 래퍼 삽입 후 태그 균형·타입 이상 없음.
  InspectionPage chunk 정상 빌드.
- 편집 영역 육안 확인 — 내부 래퍼가 패널 자식 전체(maint-note~form-card)를 정확히 감쌈.

## 범위 밖 (미변경)
`panelHistoryOpen` 분기, alarm/normal 폼 내부, 모바일 `FireAlarmModal`(이미 올바른 패턴),
다른 카테고리 pane, PanelMonitorPage.

## 배포
**미배포.** production 수동 wrangler 배포는 사용자 시각 확인 후 진행 예정.
