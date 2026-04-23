---
id: 260423-dzx
title: Galaxy S25 Android 레이아웃 버그 수정 — Layout dvh 및 근무자 칩 오버플로우
date: 2026-04-23
type: quick
status: complete
commit: ddd724a
---

# 260423-dzx: Galaxy S25 Android 레이아웃 버그 수정

## 결과

**수정 커밋:** `ddd724a` — fix(layout): Galaxy S25 Android 레이아웃 이슈 수정

### 변경 내역

| 파일 | 변경 |
|------|------|
| `cha-bio-safety/src/App.tsx:143` | Layout 외곽 div `height:'100dvh'` → `'100%'` |
| `cha-bio-safety/src/pages/DashboardPage.tsx:370` | admin `<DutyChip>` 에 `small` prop 추가 |
| `cha-bio-safety/src/pages/DashboardPage.tsx:376` | assistant `<DutyChip>` 에 `small` prop 추가 |

총 2 files, +3/-3 lines

## 원인 요약

### 1) 세로 하단 잘림 (라우트 전환 후)

Layout 최상위 div와 body가 모두 `height:100dvh`로 이중 지정되어 있었고, Android Chrome SPA 라우트 전환 시 주소바 상태 변화로 인한 dvh 재계산이 Layout div에 반영되지 않는 알려진 버그가 있었음. body는 정상 갱신되지만 Layout div가 stale한 dvh 값을 유지해 내부 콘텐츠가 실제 viewport보다 아래로 밀려 BottomNav 부분이 콘텐츠를 덮어 하단이 잘려 보였음.

`#root`가 이미 `flex:1, min-height:0`로 body의 현재 높이를 전달하므로, Layout은 `height:'100%'`로 부모 높이를 상속받으면 dvh를 직접 참조하지 않아 본 이슈가 사라짐.

### 2) 가로 오버플로우 (근무자 칩 줄)

S25 CSS 폭 ≈412px, 컨테이너 padding 24px 제외 388px 가용. 기본 `DutyChip`(원 32px + 패딩 14px + 내부 텍스트) 4개 + `RoleLabel` 2개 + gap으로 약 412px 필요 → 오른쪽이 잘림. `html { overflow:hidden }` 때문에 스크롤도 노출 안 됨.

`DutyChip`이 이미 지원하는 `small` prop 활성화 시:
- 원: 32 → 28 px
- 패딩: '4px 10px 4px 4px' → '3px 8px 3px 3px'
- 텍스트 fontSize: 12 → 11

전체 약 380px로 축소되어 388px 가용폭에 수용됨.

## 검증

- `npm run build` 통과 (TypeScript/Vite 에러 없음)
- 실제 S25 확인은 프로덕션 배포 후 필요 (로컬 서버 미사용 정책)

## 미수행 (의도적 범위 제한)

- `DesktopSidebar.tsx:42` 의 `100dvh` — 데스크톱 전용이며 S25 증상과 무관
- `LoginPage.tsx`, `SplashScreen.tsx`, `NotFoundPage.tsx` 의 `minHeight:'100dvh'` — 해당 페이지들은 라우트 전환 진입점이 아닌 엔드 상태이며 내부 스크롤 없음, 상위 Layout 수정으로 커버되는지 관찰 후 필요 시 별도 수정

## 참고

- 관련 메모리: `feedback_deploy_branch.md` (배포 시 --branch production 필수), `feedback_deploy_test.md` (프로덕션 배포 후 테스트)
- 운영 관찰 모드 원칙 준수: 신규 기능 추가 없이 실전 검증에서 발견된 UX 버그만 수정
