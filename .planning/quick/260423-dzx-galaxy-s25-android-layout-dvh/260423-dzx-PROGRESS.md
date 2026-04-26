---
title: Galaxy S25 Android 대시보드 레이아웃 이슈 — 작업 경과 및 잔여 작업
date: 2026-04-23
status: partial
---

# Galaxy S25 Android 대시보드 레이아웃 이슈

## 최초 증상 (2026-04-23 제보)

- 근무자 칩 줄 좌우 폭 오버플로우 (3 admin + 1 assistant 칩이 412px 뷰포트 초과)
- 이번 달 점검 현황 하단 잘림 (도넛까지만 보이고 라벨/숫자 안 보임)
- 다른 페이지 → 대시보드 복귀 시 재현
- 점검 페이지 등 타 페이지 하단도 유사 증상

## 성공한 수정 (현재 유지)

| # | 수정 내용 | 대상 파일 | 해결한 증상 |
|---|---------|----------|------------|
| 1 | `DutyChip` 에 `small` prop 적용 | `pages/DashboardPage.tsx:370,376` | 근무자 칩 가로 오버플로우 |
| 2 | Monthly card `height: 125` + strip `height: 101` + `flex: 1` (Android만) | `pages/DashboardPage.tsx:508~522` | 2줄 라벨 표시. scroll-container intrinsic height 0 버그 우회 |
| 3 | Grid row 5 `minmax(140px, auto)` (Android만) | `pages/DashboardPage.tsx:395~397` | Grid 알고리즘이 row 5 최소 140px 확보 |
| 4 | `useStaffList` render-time shift config 주입 | `hooks/useStaffList.ts` | 근무자 칩 초기 로딩 지연 해결 |
| 5 | 캐시 초기화 시 SW unregister | `components/SettingsPanel.tsx:411` | `reg.update()` 는 새 SW 활성화 대기 안 함 → unregister로 완전 해제 |

## 실패/롤백한 시도 목록

| 시도 | 문제점 | 결과 |
|------|-------|------|
| `App.tsx` Layout `height: 100dvh → 100%` | 효과 없음 | 롤백 |
| `visualViewport.height → --app-height` JS 주입 | iPhone 좌우 폭 깨짐 | 롤백 |
| Monthly card `overflow: hidden` 제거 | 의도된 디자인 영향 | 롤백 |
| Strip `overflow-x:auto → flex-wrap:wrap` | 디자인 무단 변경 (사용자 지적) | 롤백, 메모리 교훈 저장 |
| `--sab: 32` Android fallback | BottomNav padding 너무 커짐, content 영역 축소 | 롤백 |
| `--sab: 12` Android fallback | 위와 동일 약한 버전, 여전히 monthly 잘림 유발 | 롤백 |
| Grid row 5 `140px` 순수 픽셀 | `minmax(140px, auto)` 대비 차이 없음 | minmax로 회귀 |
| Monthly card `minHeight: 140` | Android grid auto track 계산에 영향 없음 | 제거 |

## 미해결 이슈

### 1) 캐시 초기화 후 Monthly 잘림 (핵심)

**재현:**
1. PWA 재설치 → 정상 (card 125, 도넛 + 2줄 라벨 + 숫자)
2. 설정 → "캐시 초기화" 버튼 → 같은 화면에서 reload
3. reload 후 **오늘 일정 영역이 아래로 길어지면서 월간 현황이 1줄만 표시되고 잘림**
4. 다른 페이지 갔다 복귀해도 동일 상태 유지

**단서:**
- 배포된 JS에는 모든 fix 정상 포함됨 (`grep` 로 검증됨):
  - `height: O?125:void 0`, `height: O?101:void 0`, `minmax(140px, auto)`
- 앱 재설치 직후엔 동작하는데 캐시 초기화 후엔 안 됨 → "뭐가 다른가?"
- 그리드 `1fr`(오늘 일정) 이 커지고 row 5(monthly)가 작아지는 증상 → grid 알고리즘이 `minmax` 또는 card `height:125` 를 무시함
- 핀치줌 후 원복하면 레이아웃 재측정됨 (과거 관찰) → 브라우저 레이아웃 캐시 이슈 의심

**가설:**
- Chrome Android가 캐시 clear + reload 직후 grid 알고리즘이 stale한 intrinsic 사이즈 사용
- React Query 로딩 state → 데이터 도착 state 전환 시 grid 레이아웃이 recompute 안 됨
- SW 재등록 타이밍과 초기 페인트 간 상호작용

### 2) ElevatorPage 고장접수 버튼 BottomNav 묻힘 (확인 필요)

사용자가 관찰 보고. 코드상 FAB는 `flex: 1` main의 flex 형제이고 App main의 paddingBottom 보장 영역 위에 위치해야 함. 실제 스크린샷 미확인 상태. 우선순위 낮음.

### 3) BottomNav 하단 gesture 영역 갭 없음 — 해결됨 ✓ (2026-04-24)

Samsung Chrome이 `env(safe-area-inset-bottom)` 0 반환 → BottomNav 버튼과 시스템 제스처바 간 공간 없음.

**해결:** `--sab` 전역 우회, BottomNav.tsx 내부 IS_ANDROID 분기로 nav 높이 자체를 12px 키우는 방식.

```tsx
// components/BottomNav.tsx
const IS_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
...
height: IS_ANDROID ? 'calc(54px + var(--sab, 0px) + 12px)' : 'calc(54px + var(--sab, 0px))',
paddingBottom: IS_ANDROID ? 'calc(var(--sab, 0px) + 12px)' : 'var(--sab, 0px)',
```

- `bottom: 0` 유지 (nav 밑변은 viewport 바닥에 붙음)
- Android 에서만 nav 높이 66px, paddingBottom 12px → 버튼은 상단 54px 기존 크기, 하단 12px는 같은 nav 배경색으로 연속
- App main `paddingBottom` 은 54 그대로 → Dashboard grid 영향 0
- 배포: https://9e098b5c.cbc7119.pages.dev (production)
- 사용자 확정 ("됐어. 별문제 없으면 이렇게 쓰라고 하자.")

**시도 이력:**
1. `paddingBottom: 12` + height 유지 → 버튼이 42px로 압축되어 부자연스러움
2. `bottom: 12` nav 전체 들어 올림 → body 배경 노출, "붕 떠 있는" 모습
3. **height + paddingBottom 증가** → 확정 (nav 배경 연속)

**교훈 메모리 저장:** `feedback_bottomnav_gap_style.md`

## 메모리에 저장된 교훈

- Dashboard 그리드 `1fr` 유지 (핀치줌 깜빡임 방지)
- 월간 도넛 strip은 단일행 가로 스크롤 (`flex-wrap` 금지)
- 디자인 변경 전 사용자 상의 필수
- PWA 캐시가 배포 무시 → 재설치 유도 / `grep` 으로 배포 반영 확인
- wrangler 한글 커밋 메시지 거부 → `--commit-message` ASCII 별도 지정

## 배포 커밋 이력 (주요)

| Commit | 내용 |
|--------|------|
| `ddd724a` | DutyChip small + Layout 100% (초기 시도) |
| `bcebce9` | Android card `height:140` + strip `height:108` (첫 돌파) |
| `ce22097` | card/strip 튜닝 125/101 (사용자 "정확해") |
| `f4f5542` | `--sab=12` Android fallback (갭 시도, 이슈 발단) |
| `adac8b9` | 캐시 초기화 SW unregister (유지) |
| `42b6a26` | useStaffList render-time 주입 (유지) |
| `3b7b85f` | Grid row `140px` 순수 |
| `936b711` | ce22097 grid 구성 + useStaffList + SW unregister 유지, `--sab=12` 제거, grid 140px → minmax(140, auto) 회귀 |
| `b5cc20a` | **현재 상태** — BottomNav.tsx IS_ANDROID 분기로 nav 높이 +12px / paddingBottom +12px (Option D 변형). 하단 제스처 갭 이슈 해결 |

## 향후 방향 옵션 (사용자 결정 대기)

### A. 구조적 변경 — Monthly 카드를 grid 밖으로 빼기
```
DashboardPage outer (flex column)
  ├── chip strip (flex-shrink:0)
  ├── main (flex:1, grid 4 rows: banner + stats + tools + 1fr 오늘일정)
  └── monthly card (flex-shrink:0, 고정 높이)
```
Grid track 계산 이슈 자체를 회피. Monthly 항상 dashboard 하단 고정.

### B. Grid 전체 폐기 → flex column + 스크롤
모든 row를 content-based로 배치하고 전체가 스크롤되게. 단 "오늘 일정" 카드가 남은 공간 채우던 효과 상실.

### C. 캐시 초기화 직후 상태 세부 진단
스크린샷 + Chrome DevTools remote debugging 으로 grid 실제 계산값 확인. 원인 특정 후 최소 수정.

### D. BottomNav 갭은 BottomNav 컴포넌트 자체에 padding
`--sab` 전역 변수 우회, BottomNav.tsx 에 `paddingBottom: IS_ANDROID ? 12 : 'var(--sab)'` 같은 분기. 다른 페이지 영향 최소화하되 App main `paddingBottom` 과 불일치 가능성 주의.

## 현재 베이스라인

commit `936b711` 배포 상태:
- 근무자 칩 정상
- 초기 진입 시 monthly 정상 (card 125, 2줄 라벨 + 숫자)
- 캐시 초기화 시 monthly 잘림 (미해결)
- 근무자 칩 즉시 로딩
- 캐시 초기화 SW unregister
