---
id: 260423-dzx
title: Galaxy S25 Android 레이아웃 버그 수정 — Layout dvh 및 근무자 칩 오버플로우
date: 2026-04-23
type: quick
---

# 260423-dzx: Galaxy S25 Android 레이아웃 버그 수정

## 문제

Galaxy S25 (Android) 에서 두 가지 레이아웃 버그 관찰됨:

1. **세로 높이 이슈** — 다른 페이지로 이동했다가 대시보드/점검 페이지로 돌아오면 하단부(이번 달 점검 현황 도넛, 바텀 네비 위 콘텐츠)가 잘려 보임. 원인: `App.tsx` Layout 최상위 div의 `height:'100dvh'`와 body의 `height:100dvh`가 이중으로 걸려 있는 상태에서, Android Chrome SPA 라우트 전환 시 주소바 상태 변화로 dvh 재계산이 누락되는 알려진 버그.

2. **가로 오버플로우** — 대시보드 상단 근무자 칩 줄(`관리자 + 3 admin chips + 보조자 + 1 assistant chip`)이 S25 CSS 폭(~412px)에서 오른쪽이 잘림. `html { overflow: hidden }` 때문에 스크롤도 안 보임.

## 수정

### Task 1: Layout 외곽 div dvh → 100%

**파일:** `cha-bio-safety/src/App.tsx:143`

- `height: '100dvh'` → `height: '100%'`
- `#root`가 이미 `flex:1 min-height:0`로 body(100dvh)의 현재 높이를 내려주므로, Layout은 그것을 그대로 따라가면 됨. dvh를 직접 참조하지 않으므로 Android Chrome SPA dvh 미갱신 이슈에서 자유로움.

### Task 2: 모바일 근무자 칩에 `small` 적용

**파일:** `cha-bio-safety/src/pages/DashboardPage.tsx:370, 376`

- 두 곳의 `<DutyChip key={s.id} staff={s} onClick={...} />`에 `small` prop 추가
- `DutyChip` 기존 `small` prop: 원 32→28px, 패딩 `'4px 10px 4px 4px'` → `'3px 8px 3px 3px'`, 내부 텍스트 fontSize 12→11
- 결과 폭: 전체 약 412px → ~380px로 축소되어 412px 뷰포트의 padding 24px 제외 388px에 수용

## 검증

- `npm run build` 통과 (TypeScript 에러 없음)
- 프로덕션 배포 후 Galaxy S25에서 실제 확인 필요 (메모리: 로컬 서버 X, 항상 프로덕션 배포 후 테스트)

## 범위 제한

- 데스크톱 레이아웃 (DashboardPage.tsx Row 0 근무자 칩)은 이미 충분한 폭에서 렌더되므로 미수정
- `DesktopSidebar.tsx:42`의 `100dvh`도 동일 패턴이지만 데스크톱 전용이라 이번 증상과 무관, 수정 보류
- 다른 페이지의 `100dvh` 참조(LoginPage, SplashScreen, NotFoundPage 등)는 상위 Layout 수정만으로 해결되는지 먼저 확인 후 필요 시 별도 태스크
