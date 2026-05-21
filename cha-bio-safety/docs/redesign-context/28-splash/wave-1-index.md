---
title: "redesign/28-splash — sketch wave 1 (index)"
status: ready_for_oq
created: 2026-05-22
quick_id: 260522-209
branch: redesign/28-splash
source_tsx_1: cha-bio-safety/src/pages/SplashScreen.tsx
source_tsx_1_lines: 83
source_tsx_2: cha-bio-safety/src/components/InstallPrompt.tsx
source_tsx_2_lines: 237
source_util_1: cha-bio-safety/src/utils/pwaInstall.ts (52 lines, 수정 0)
source_util_2: cha-bio-safety/src/utils/versionCheck.ts (55 lines, 수정 0)
design_system: cha-bio-safety/docs/redesign-context/28-splash/design-system.md (v0.1.1, c8bfa86)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (인증 전 스플래시 = 점검 시리즈 아님 — 직접 적용 X, showNav false 단락으로 BottomNav/AppHeader 둘 다 미렌더)
mirror_of: cha-bio-safety/docs/redesign-context/17-annual-plan/wave-1-index.md (260521-wmq) + cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md (260521-sjj) + cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (260521-c6p) — 7 섹션 + 4 sub-wave 구조 mirror
calibration_precedent: cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md (260521-* SW3) — 비즈 anchor (좌표 시스템) 1 byte 변경 금지 패턴 일반화
sub_wave_count: 4 (W2~W5)
memory_rules_inline: 12 (10 기본 + feedback_tsx_wave_emoji_dot_gap 특수 글리프 예외 + project_redesign_15_daily_report_status 비즈 anchor 보존)
open_questions: 5
---

# redesign/28-splash — sketch wave 1 (index)

본 문서는 W2~W5 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:

- SplashScreen.tsx (83 라인 — 인증 전 `/` route 스플래쉬) + InstallPrompt.tsx (237 라인 — PWA 설치 안내 팝업) 통합 320 라인의 element 인벤토리 → 4 sub-wave 분배 + **비즈 시그니처** 보존 anchor (`__APP_VERSION__` Vite define / `@keyframes slideUp` / localStorage `pwa-install-dismissed` / 48ms tick / 1600ms / +4 / shouldShowInstallPrompt / dismissInstallPrompt / isStandalone / isIOS / getDeferredInstallPrompt / subscribeInstallPrompt / showInstallPrompt / checkVersionAndRefresh)
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6 / §7 / §7.1 의 verbatim 룰 박제 (§6/§7 은 미적용 1줄 메타 동반, §7.1 Lucide 룰은 적용)
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 28-splash 적용 여부 (인증 전 스플래시 = 점검 시리즈 아님 — `/` 가 `MOBILE_NO_NAV_PATHS` + `DESKTOP_NO_NAV_PATHS` 양쪽 등재 + `PAGE_TITLES` 미등재로 showNav false 단락 → BottomNav 모바일/데스크톱 + 글로벌 AppHeader 모두 미렌더)
- 메모리 룰 12건 (`feedback_*.md` 10 + `feedback_tsx_wave_emoji_dot_gap` 특수 글리프 예외 결정 + `project_redesign_15_daily_report_status` 비즈 anchor 보존 일반화) inline 인용 — 28-splash 특화 룰 2건 (특수 글리프 ⋮ U+22EE / ⎋ U+238B 콘텐츠 글리프 처리 + 15-daily-report 캘리브 좌표 시스템 → 비즈 anchor 1 byte 변경 금지 일반화) 포함
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌 (InstallPrompt 설치 버튼 그라데이션 / SplashScreen 진행 바 그라데이션 / 폰트 격상 부분 절충 / 외곽 hex 토큰 치환 / 특수 글리프 ⋮ ⎋ 콘텐츠 글리프 유지)

작성일: 2026-05-22 / Quick ID: 260522-209 / Branch: redesign/28-splash

> 17-annual-plan W1 (260521-wmq) + 27-login W1 (260521-c6p) + 16-workshift W1 (260521-sjj) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. SplashScreen 83 lines + InstallPrompt 237 lines 통합 320 lines 인증 전 페이지 (`/` route, chrome 미적용). InstallPrompt 의 3 view state (메인 / Android 가이드 / iOS 가이드) 중 메인 (W3) + 가이드 (W4) 분리 — 시각 디자인 차이 크고 특수 글리프 ⋮ ⎋ 결정 분리 필요. 13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan 모두 평면(flat sibling) 패턴 — `28-splash/sketch-wave-N-{slug}.html` 직접 배치, `sketch/` 서브폴더 없음. 본 인덱스도 `28-splash/wave-1-index.md` (flat) 으로 위치한다.

---

# §1. SplashScreen.tsx + InstallPrompt.tsx 인벤토리

본 인벤토리는 SplashScreen.tsx (83 lines, 실측) + InstallPrompt.tsx (237 lines, 실측) 통합 320 lines 의 element 를 (1) SplashScreen 외곽+로고+타이틀 / (2) SplashScreen 진행 바+버전+animation / (3) InstallPrompt 오버레이+카드+헤더 / (4) InstallPrompt 메인 view (설치 버튼+나중에 버튼) / (5) InstallPrompt Android+iOS 가이드 view 5 영역으로 나눠 정리한다. line 범위는 **실측 결과** (grep + Read 검증, drift 없음).

**28-splash 의 구조 특이성** (인벤토리 머리말):

- **2개 파일 통합** (SplashScreen + InstallPrompt) — SplashScreen 이 `<InstallPrompt onDismiss={handleDismiss} />` 컴포넌트를 1600ms tick 후 `shouldShowInstallPrompt()` 결과에 따라 렌더 (SplashScreen line 76)
- **인증 전 페이지** — `/` route (App.tsx line 265), `MOBILE_NO_NAV_PATHS` + `DESKTOP_NO_NAV_PATHS` 양쪽 등재 (App.tsx line 71/74) → BottomNav 모바일/데스크톱 모두 숨김. `DESKTOP_HEADER_HIDE_PATHS` 미등재 (App.tsx line 77 — 단 showNav 가 false 라 무의미) + `PAGE_TITLES` 미등재 → 글로벌 AppHeader 타이틀 미렌더 (showNav 가 false 라 헤더 자체 미표시). chrome 룰 직접 적용 X.
- **특수 글리프 2개** — InstallPrompt Android 가이드 line 122 `⋮` (U+22EE, "크롬 우상단 메뉴") + iOS 가이드 line 164 `⎋` (U+238B, "Safari 하단 공유 버튼"). 사용자 OS UI 표기 일치 → 콘텐츠 글리프 유지가 default (memory `feedback_tsx_wave_emoji_dot_gap` 예외 결정 룰, 27-login OQ #4 ☎ 와 동일 룰).
- **`__APP_VERSION__` Vite define 인젝션** (SplashScreen line 73) — 빌드 시점 치환, 보존 필수
- **localStorage 키 `pwa-install-dismissed`** (InstallPrompt line 227/236) — 24h TTL (24 * 60 * 60 * 1000), 변경 금지
- **외부 모듈 의존** — `pwaInstall.ts` (`getDeferredInstallPrompt` / `subscribeInstallPrompt` / `showInstallPrompt`) + `versionCheck.ts` (`checkVersionAndRefresh`) — 수정 0
- **모바일 전용** — 데스크톱 분기 없음 (`/` 가 PC 1920x1080 에도 모바일 레이아웃으로 동일 표시). 단 InstallPrompt 의 `isIOS()` / Android 분기는 디바이스 사용자에이전트 기반 (런타임 분기).
- **별도 컴포넌트 import 없음** — Lucide 미사용 (모든 글리프가 콘텐츠 텍스트 또는 SVG path 인라인이 아님 — 다운로드 / 뒤로 가기 아이콘 자체가 없음). InstallPrompt 의 인포 일러스트는 `<img src=/icons/icon-192.png>` PNG 그대로 사용.

## §1.1 영역별 인벤토리 표

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. SplashScreen 외곽 + 로고 + 타이틀 | imports + state (useState pct / showInstall / useNavigate / useAuthStore / InstallPrompt / shouldShowInstallPrompt / dismissInstallPrompt / checkVersionAndRefresh) | 1~11 | 정적 import + 페이지 state 2 + auth hook | useAuthStore().isAuthenticated 분기 | 무관 (보존만) |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | useEffect (checkVersionAndRefresh void + setInterval 48ms tick +4 + setTimeout 1600ms → shouldShowInstallPrompt() ? setShowInstall(true) : navigate(...)) | 13~29 | 진행 바 progress + 1600ms 후 분기 | `void checkVersionAndRefresh()` (line 16) / `Math.min(p + 4, 100)` (line 18) / `clearInterval` + `clearTimeout` cleanup | W2 (tick 4 state 매트릭스) |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | handleDismiss (dismissInstallPrompt + setShowInstall(false) + navigate isAuthenticated ? '/dashboard' : '/login' replace:true) | 31~35 | InstallPrompt 닫기 시 라우팅 | `dismissInstallPrompt()` / `navigate(...)` | W3 (메인 view 나중에 버튼 + W4 가이드 확인 버튼) |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | 외곽 wrapper (minHeight 100dvh / background `#161b22` / flex column center / gap 0) | 37~43 | 페이지 wrapper | 정적 wrapper | W2 |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | 로고 wrapper (animation `slideUp .4s ease-out` / flex column center / gap 20 / marginBottom 56) | 45 | 로고 묶음 fade+translateY | `@keyframes slideUp` 인라인 (line 78~80) | W2 |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | 로고 박스 (88x88 / radius 22 / bg `rgba(37,99,235,0.2)` / border `1px solid rgba(59,130,246,0.3)` / flex center / overflow hidden) | 47~55 | 로고 컨테이너 | 정적 | W2 |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | 로고 img (src `/icons/icon-192.png` / 64x64 / radius 14) | 54 | 로고 PNG | 자산 경로 변경 시 404 | W2 |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | 타이틀 div (textAlign center) | 57~60 | 타이틀+부제 묶음 | 정적 wrapper | W2 |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | h1 (fontSize 22 / fontWeight 900 / color `#e6edf3` / margin 0 / letterSpacing `-.02em`) — "CBC 방재" verbatim | 58 | 페이지 식별 | 정적 카피 | W2 |
| 1. SplashScreen 외곽 + 로고 + 타이틀 | p 부제 (fontSize 12 / color `#6e7681` / margin `6px 0 0` / letterSpacing `.1em`) — "소방안전 통합관리 시스템" verbatim | 59 | 부제 | 정적 카피 | W2 |
| 2. SplashScreen 진행 바 + 버전 + animation | 진행 바 wrapper (width 160) | 64 | 진행 바 묶음 wrapper | 정적 wrapper | W2 |
| 2. SplashScreen 진행 바 + 버전 + animation | 진행 바 트랙 (height 2 / bg `rgba(255,255,255,0.07)` / radius 2 / overflow hidden) | 65~67 | 진행 바 트랙 | 정적 | W2 |
| 2. SplashScreen 진행 바 + 버전 + animation | 진행 바 fill (height 100% / bg `linear-gradient(90deg,#3b82f6,#0ea5e9)` / radius 2 / width `${pct}%` / transition `width .05s linear`) | 66 | pct 시각 표현 | `${pct}%` 인라인 / pct setInterval (line 18) | W2 |
| 2. SplashScreen 진행 바 + 버전 + animation | 진행 텍스트 p (fontSize 11 / color `#6e7681` / textAlign center / marginTop 10 / pct<40 '시스템 초기화 중...' / pct<80 '데이터 불러오는 중...' / '준비 완료') | 68~70 | 진행 단계 카피 | pct 분기 3 카피 verbatim | W2 |
| 2. SplashScreen 진행 바 + 버전 + animation | 하단 버전 p (position absolute / bottom 20 / fontSize 10 / color `#3d444d` — `v${__APP_VERSION__} · 경기도 성남시 분당구`) | 73 | 버전 + 위치 표시 | Vite define `__APP_VERSION__` 빌드 시점 인젝션 — 변경 금지 | W2 |
| 2. SplashScreen 진행 바 + 버전 + animation | InstallPrompt 렌더 분기 (`{showInstall && <InstallPrompt onDismiss={handleDismiss} />}`) | 76 | 1600ms 후 PWA 안내 마운트 | showInstall state | W3 (InstallPrompt 진입) |
| 2. SplashScreen 진행 바 + 버전 + animation | `@keyframes slideUp` 인라인 style (from opacity 0 translateY 16px / to opacity 1 translateY 0) | 78~80 | 로고 fade+translateY animation | 변경 금지 (비즈 anchor) | W2 |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | imports + isStandalone() + isIOS() helper | 1~17 | 정적 import + display-mode/UA 분기 helper | `(window.navigator as any).standalone` / `matchMedia('(display-mode: standalone)')` / `matchMedia('(display-mode: fullscreen)')` / `userAgent /iPhone\|iPad\|iPod/` / Macintosh + maxTouchPoints>1 (iPadOS 13+) | 무관 (보존만) |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | InstallPrompt 함수 본체 시작 + state (hasPrompt = !!getDeferredInstallPrompt() / showIOSGuide / showAndroidGuide / useEffect subscribeInstallPrompt 구독) | 25~35 | 컴포넌트 state + 외부 이벤트 구독 | `getDeferredInstallPrompt()` initial / `subscribeInstallPrompt(p => setHasPrompt(!!p))` (line 33) / unsubscribe return (line 34) | 무관 (보존만) |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | handleInstallAndroid async (await showInstallPrompt() → 'accepted' onDismiss / 'unavailable' setShowAndroidGuide(true) / 'dismissed' noop) | 38~48 | Android 네이티브 설치 트리거 + fallback | `showInstallPrompt()` outcome 3분기 | 무관 (보존만) |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | handleInstallIOS (setShowIOSGuide(true)) | 51~53 | iOS 가이드 진입 | 정적 setter | 무관 (보존만) |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | const ios = isIOS() | 55 | render 시점 분기 캐시 | `isIOS()` 단발 호출 | 무관 (보존만) |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | 오버레이 (position fixed / inset 0 / zIndex 9999 / bg `rgba(0,0,0,0.85)` / flex center / padding 24) | 58~63 | 풀스크린 dimmer | 정적 wrapper | W3 |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | 카드 (bg `#1c2128` / radius 20 / padding `28px 24px` / maxWidth 340 / width 100% / textAlign center / border `1px solid rgba(59,130,246,0.3)` / boxShadow `0 8px 40px rgba(0,0,0,0.5)`) | 64~70 | 모달 카드 | 정적 wrapper | W3 |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | 아이콘 박스 (64x64 / radius 16 / margin `0 auto 16px` / bg `rgba(37,99,235,0.2)` / border `1px solid rgba(59,130,246,0.3)` / flex center) | 72~78 | 아이콘 컨테이너 | 정적 | W3 |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | 아이콘 img (`/icons/icon-192.png` / 48x48 / radius 12) | 78 | 아이콘 PNG | 자산 경로 변경 시 404 | W3 |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | h2 (fontSize 18 / fontWeight 800 / color `#e6edf3` / margin `0 0 8px`) — "CBC 방재" verbatim | 81~83 | 모달 제목 | 정적 카피 | W3 |
| 3. InstallPrompt 오버레이 + 카드 + 헤더 | p 부제 (fontSize 12 / color `#8b949e` / margin `0 0 20px` / lineHeight 1.5) — "홈 화면에 앱을 설치하면<br/>더 빠르고 편리하게 사용할 수 있습니다" verbatim | 84~86 | 모달 부제 (2줄, `<br/>` 보존) | 정적 카피 | W3 |
| 4. InstallPrompt 메인 view (설치 버튼 + 나중에 버튼) | 분기 시작 (`!showIOSGuide && !showAndroidGuide ? (메인) : showAndroidGuide ? (Android) : (iOS)`) | 88 | 3 view state 분기 | showIOSGuide / showAndroidGuide state | W3 + W4 |
| 4. InstallPrompt 메인 view (설치 버튼 + 나중에 버튼) | 메인 view wrapper (flex column gap 10) | 89 | 메인 버튼 묶음 | 정적 wrapper | W3 |
| 4. InstallPrompt 메인 view (설치 버튼 + 나중에 버튼) | 설치 버튼 (onClick ios ? handleInstallIOS : handleInstallAndroid / width 100% / height 48 / radius 12 / bg `linear-gradient(135deg, #2563eb, #0ea5e9)` / border none / color `#fff` / fontSize 15 / fontWeight 700 / cursor pointer) | 90~100 | 메인 CTA | label 3 분기 (ios ? '설치 방법 보기' : hasPrompt ? '홈 화면에 설치' : '설치 방법 보기') | W3 |
| 4. InstallPrompt 메인 view (설치 버튼 + 나중에 버튼) | 나중에 버튼 (onClick onDismiss / width 100% / height 40 / radius 10 / bg transparent / border `1px solid rgba(255,255,255,0.1)` / color `#6e7681` / fontSize 12 / fontWeight 600 / cursor pointer) — '나중에 할게요' verbatim | 101~110 | 닫기 + handleDismiss (SplashScreen 로 흐름 반환) | onDismiss prop | W3 |
| 5. InstallPrompt Android + iOS 가이드 view | Android 가이드 wrapper (textAlign left) | 113~114 | Android 가이드 묶음 | 정적 wrapper | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | Android 노란 경고 박스 (fontSize 12 / color `#f59e0b` / bg `rgba(245,158,11,0.1)` / border `1px solid rgba(245,158,11,0.25)` / radius 8 / padding `8px 10px` / marginBottom 14) — '자동 설치 창이 뜨지 않으면 아래 순서로 설치해 주세요.' verbatim | 115~117 | Android 시스템 안내 (caution 색, 위험 의미 X) | 정적 카피 | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | Android 3-step list wrapper (flex column gap 14) | 118 | step list 묶음 | 정적 wrapper | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | Android Step 1 (숫자 원 `28x28 radius:8 bg:rgba(59,130,246,0.15) color:#3b82f6 fontSize:13 fontWeight:800` — '1' / 타이틀 `fontSize:13 fontWeight:700 color:#e6edf3` — `크롬 우상단 <span style={{ fontSize:16 }}>⋮</span> 메뉴` / 서브 `fontSize:11 color:#8b949e marginTop:2` — '주소창 오른쪽 점 세 개 메뉴를 누르세요') | 119~125 | step 1 — ⋮ (U+22EE) 콘텐츠 글리프 | 정적 카피 + 특수 글리프 ⋮ 유지 (OQ #5) | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | Android Step 2 (동일 구조 — 타이틀 "'앱 설치' 또는 '홈 화면에 추가' 선택" / 서브 "메뉴에서 <strong>앱 설치</strong>(또는 <strong>홈 화면에 추가</strong>)를 누르세요" — strong color `#e6edf3`) | 126~132 | step 2 — 메뉴 항목 안내 | 정적 카피 (strong 강조 위치 verbatim) | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | Android Step 3 (동일 구조 — 타이틀 "'설치' 확인" / 서브 "팝업에서 <strong>설치</strong>를 누르면 완료") | 133~139 | step 3 — 팝업 확인 | 정적 카피 | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | Android 확인 버튼 (width 100% / height 44 / radius 10 / marginTop 18 / bg `rgba(59,130,246,0.15)` / border `1px solid rgba(59,130,246,0.3)` / color `#3b82f6` / fontSize 13 / fontWeight 700 / cursor pointer) — '확인했습니다' verbatim | 141~146 | Android 가이드 닫기 | onDismiss prop | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | iOS 가이드 wrapper (textAlign left) | 150 | iOS 가이드 묶음 (노란 경고 박스 없음) | 정적 wrapper | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | iOS 3-step list wrapper (flex column gap 14) | 151 | step list 묶음 | 정적 wrapper | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | iOS Step 1 (숫자 원 동일 / 타이틀 '하단 공유 버튼 터치' / 서브 `Safari 하단의 <span style={{ fontSize:16, verticalAlign:'middle' }}>⎋</span> 공유 아이콘을 누르세요`) | 152~167 | step 1 — ⎋ (U+238B) 콘텐츠 글리프 | 정적 카피 + 특수 글리프 ⎋ 유지 (verticalAlign:'middle' — Android Step 1 ⋮ 와 다른 점, OQ #5) | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | iOS Step 2 (동일 구조 — 타이틀 "'홈 화면에 추가' 선택" / 서브 "스크롤해서 <strong>홈 화면에 추가</strong>를 찾아 누르세요") | 169~184 | step 2 — 공유 메뉴 항목 | 정적 카피 | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | iOS Step 3 (동일 구조 — 타이틀 "'추가' 터치" / 서브 "오른쪽 상단 <strong>추가</strong> 버튼을 누르면 완료!") | 186~201 | step 3 — 상단 추가 | 정적 카피 | W4 |
| 5. InstallPrompt Android + iOS 가이드 view | iOS 확인 버튼 (Android 동일 토큰 — width 100% / height 44 / radius 10 / marginTop 18 / bg `rgba(59,130,246,0.15)` / border `1px solid rgba(59,130,246,0.3)` / color `#3b82f6` / fontSize 13 / fontWeight 700) — '확인했습니다' verbatim | 204~213 | iOS 가이드 닫기 | onDismiss prop | W4 |

## §1.2 line 수 실측 확인

```
$ wc -l cha-bio-safety/src/pages/SplashScreen.tsx cha-bio-safety/src/components/InstallPrompt.tsx
      83 cha-bio-safety/src/pages/SplashScreen.tsx
     237 cha-bio-safety/src/components/InstallPrompt.tsx
     320 total
```

PLAN 추정치 + 28-splash.md 메타 일치, drift 없음. `pwaInstall.ts` = 52 lines / `versionCheck.ts` = 55 lines (별도 utility — 비즈 로직 보존 대상, 수정 0).

## §1.3 비즈 시그니처 보존 anchor (별도 박스)

W5 TSX 변환 wave 에서 다음 식별자/값은 **1 byte 변경 금지** (15-daily-report SW3 portraitPos 좌표 시스템 보존 룰 일반화, memory `project_redesign_15_daily_report_status`):

```
[SplashScreen.tsx]
- useState<number> pct (0~100, +4 per 48ms tick)
- useState<boolean> showInstall
- useEffect:
    void checkVersionAndRefresh()
    setInterval(() => setPct(p => Math.min(p + 4, 100)), 48)
    setTimeout(() => {
      if (shouldShowInstallPrompt()) {
        setShowInstall(true)
      } else {
        navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })
      }
    }, 1600)
    return () => { clearInterval(tick); clearTimeout(nav) }
- handleDismiss():
    dismissInstallPrompt()
    setShowInstall(false)
    navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })
- __APP_VERSION__ Vite define 인젝션 (line 73, 변경 금지 — vite.config.ts 의 define 파라미터 연결)
- @keyframes slideUp (line 78~80, 변경 금지)
- background hex `#161b22` (page bg, 토큰 치환 OK — OQ #4)
- 진행 텍스트 3 분기 카피 verbatim ('시스템 초기화 중...' / '데이터 불러오는 중...' / '준비 완료')
- 하단 버전 카피 verbatim ('v${__APP_VERSION__} · 경기도 성남시 분당구')
- "CBC 방재" h1 + "소방안전 통합관리 시스템" p 부제 verbatim
- 로고 자산 경로 `/icons/icon-192.png` (변경 시 404)

[InstallPrompt.tsx]
- isStandalone(): boolean (변경 금지 — display-mode + iOS navigator.standalone 분기)
- isIOS(): boolean (변경 금지 — userAgent + iPadOS 13+ Macintosh maxTouchPoints>1 분기)
- export function InstallPrompt({ onDismiss }: { onDismiss: () => void })
- useState<boolean> hasPrompt = !!getDeferredInstallPrompt()
- useState<boolean> showIOSGuide
- useState<boolean> showAndroidGuide
- useEffect: subscribeInstallPrompt(p => setHasPrompt(!!p)) → unsubscribe return
- handleInstallAndroid(): await showInstallPrompt() → 'accepted' onDismiss() / 'unavailable' setShowAndroidGuide(true) / 'dismissed' noop (3 outcome 분기 — 변경 금지)
- handleInstallIOS(): setShowIOSGuide(true)
- export function shouldShowInstallPrompt(): boolean — !isStandalone() && 24h dismissed (line 224~233, 변경 금지)
- export function dismissInstallPrompt(): localStorage.setItem('pwa-install-dismissed', String(Date.now())) (line 235~237, 변경 금지)
- localStorage key 'pwa-install-dismissed' (line 227/236, 변경 금지)
- 24h TTL 윈도우 `24 * 60 * 60 * 1000` (line 230, 변경 금지)
- 카드 background hex `#1c2128` (토큰 치환 OK — OQ #4)
- 카드 boxShadow `0 8px 40px rgba(0,0,0,0.5)` (단일 사용처 인라인 유지)
- 카드 border `1px solid rgba(59,130,246,0.3)` (단일 사용처 인라인 유지)
- 오버레이 alpha `rgba(0,0,0,0.85)` (단일 사용처 인라인 유지)
- 노란 경고 박스 3 색 알파 (`color:#f59e0b` / `bg:rgba(245,158,11,0.1)` / `border:rgba(245,158,11,0.25)`) — 토큰화 검토 (OQ #4, status-warning 알리아스)
- 숫자 원 패턴 (`28x28 / radius:8 / bg:rgba(59,130,246,0.15) / color:#3b82f6 / fontSize:13 / fontWeight:800`) — `bg-accent/15 + text-accent` 토큰화 OK
- 설치 버튼 그라데이션 `linear-gradient(135deg, #2563eb, #0ea5e9)` → `bg-safe-bar` solid 치환 (OQ #1)
- 진행 바 fill `linear-gradient(90deg,#3b82f6,#0ea5e9)` → `bg-accent` solid 치환 (OQ #2)
- 카피 verbatim:
    "CBC 방재" (h2, line 82)
    "홈 화면에 앱을 설치하면\n더 빠르고 편리하게 사용할 수 있습니다" (부제, line 85, `<br/>` 보존)
    "나중에 할게요" (line 109)
    "자동 설치 창이 뜨지 않으면 아래 순서로 설치해 주세요." (Android 경고, line 116)
    Android Step 1 타이틀: "크롬 우상단 ⋮ 메뉴" (line 122, ⋮ span fontSize:16)
    Android Step 1 서브: "주소창 오른쪽 점 세 개 메뉴를 누르세요" (line 123)
    Android Step 2 타이틀: "'앱 설치' 또는 '홈 화면에 추가' 선택" (line 129)
    Android Step 2 서브: "메뉴에서 앱 설치(또는 홈 화면에 추가)를 누르세요" (line 130, strong 2개)
    Android Step 3 타이틀: "'설치' 확인" (line 136)
    Android Step 3 서브: "팝업에서 설치를 누르면 완료" (line 137, strong 1개)
    iOS Step 1 타이틀: "하단 공유 버튼 터치" (line 161)
    iOS Step 1 서브: "Safari 하단의 ⎋ 공유 아이콘을 누르세요" (line 164, ⎋ span fontSize:16 verticalAlign:middle)
    iOS Step 2 타이틀: "'홈 화면에 추가' 선택" (line 178)
    iOS Step 2 서브: "스크롤해서 홈 화면에 추가를 찾아 누르세요" (line 181, strong 1개)
    iOS Step 3 타이틀: "'추가' 터치" (line 195)
    iOS Step 3 서브: "오른쪽 상단 추가 버튼을 누르면 완료!" (line 198, strong 1개)
    "확인했습니다" (확인 버튼, line 145/212)
- 아이콘 자산 경로 `/icons/icon-192.png` (line 78, 변경 시 404)
- 특수 글리프 ⋮ (U+22EE, Android Step 1) + ⎋ (U+238B, iOS Step 1) 콘텐츠 글리프 유지 (OQ #5)

[pwaInstall.ts] (수정 0)
- export function getDeferredInstallPrompt(): PromptEvent | null
- export function subscribeInstallPrompt(fn: (e: PromptEvent | null) => void): () => void
- export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'>

[versionCheck.ts] (수정 0)
- export async function checkVersionAndRefresh(): Promise<void>
```

위 모든 식별자/값은 §6 negative rule + §5 룰 11/12 + §7 OQ #1/#2/#5 default 답에서 재확인. 1 byte 변경 시 W5 verify FAIL (15-daily-report SW3 precedent 동일 적용).

## §1.4 비즈 로직 시그니처 (W5 TSX 보존 anchor)

```
from '../stores/authStore':
  - useAuthStore() → { isAuthenticated: boolean }

from '../components/InstallPrompt':
  - export function InstallPrompt({ onDismiss }: { onDismiss: () => void })
  - export function shouldShowInstallPrompt(): boolean
  - export function dismissInstallPrompt(): void

from '../utils/pwaInstall':
  - export function getDeferredInstallPrompt(): PromptEvent | null
  - export function subscribeInstallPrompt(fn: (e: PromptEvent | null) => void): () => void
  - export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'>

from '../utils/versionCheck':
  - export async function checkVersionAndRefresh(): Promise<void>

from 'react-router-dom':
  - useNavigate() → navigate(path, { replace: true })

페이지 로컬 상수:
  - localStorage key: 'pwa-install-dismissed' (24h TTL)
  - tick interval: 48ms
  - pct step: +4 per tick (0 → 100 in 25 ticks ≈ 1200ms)
  - navigation timeout: 1600ms
  - logo animation: slideUp .4s ease-out
  - __APP_VERSION__ : Vite define 빌드 시점 치환

페이지 로컬 함수:
  - handleDismiss(): void
  - handleInstallAndroid(): Promise<void>
  - handleInstallIOS(): void
  - isStandalone(): boolean
  - isIOS(): boolean
```

---

# §2. 4 sub-wave 분배 plan

평면 패턴 4-wave 개수와 `sketch-wave-N-{slug}.html` (W2~W4) + `wave-5-tsx-conversion-checklist.md` (W5) 유지. InstallPrompt 의 3 view state 중 메인 view (W3) + 가이드 view (W4) 분리 — 시각 디자인 차이 크고 특수 글리프 ⋮ ⎋ 결정 분리 필요. W5 TSX 변환은 2개 파일 합쳐서 단일 atomic 변환 권장 (두 파일이 같은 흐름에 묶여 있어서 — SplashScreen → InstallPrompt 트리거 — 분할 시 컨텍스트 낭비).

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | SplashScreen 전체 (외곽 + 로고 + 타이틀 + 진행 바 + 하단 버전 + slideUp animation) | 영역 1 + 영역 2 — `/` route 인증 전 스플래시 단일 화면. background `#161b22` / 로고 88x88 radius 22 + img 64x64 radius 14 / "CBC 방재" 22px fontWeight 900 + "소방안전 통합관리 시스템" 12px / 진행 바 width 160 + height 2 + fill `linear-gradient(90deg,#3b82f6,#0ea5e9)` + 진행 텍스트 3 분기 / 하단 버전 `v${__APP_VERSION__} · 경기도 성남시 분당구` / @keyframes slideUp. tick 4 state (0% / 40% / 80% / 100%) 매트릭스 권장. | sketch-wave-2-splash.html |
| W3 | InstallPrompt 메인 view (오버레이 + 카드 + 헤더 + 설치 버튼 + 나중에 버튼) | 영역 3 + 영역 4 — 오버레이 `rgba(0,0,0,0.85)` + 카드 `#1c2128` maxWidth 340 radius 20 + 아이콘 64x64 radius 16 + "CBC 방재" h2 18px fontWeight 800 + 부제 12px lineHeight 1.5 `<br/>` + 설치 버튼 그라데이션 `linear-gradient(135deg, #2563eb, #0ea5e9)` height 48 radius 12 fontSize 15 fontWeight 700 + 나중에 버튼 transparent border `rgba(255,255,255,0.1)` height 40 radius 10 fontSize 12. 3 label 분기 (iOS / Android hasPrompt / Android !hasPrompt) 매트릭스 권장. | sketch-wave-3-install-main.html |
| W4 | InstallPrompt Android + iOS 가이드 view (3-step + 노란 경고 박스 + 특수 글리프 ⋮ ⎋) | 영역 5 — Android 노란 경고 박스 (color/bg/border #f59e0b 알파) + Android 3-step (⋮ U+22EE 글리프 fontSize:16 포함) + iOS 3-step (⎋ U+238B 글리프 fontSize:16 verticalAlign:middle 포함) + 확인 버튼 (둘 다 `rgba(59,130,246,0.15)` variant + `rgba(59,130,246,0.3)` border + `#3b82f6` text). 메인 view 외곽 (영역 3 카드 wrapper) 은 W3 에서 정의된 것 그대로 nested 사용. | sketch-wave-4-install-guide.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + SplashScreen + InstallPrompt 비즈 로직 보존 룰 + 비즈 시그니처 1 byte 변경 금지 checklist + Tailwind cheatsheet + 2개 파일 atomic 단일 변환 권장 메모 | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트

### W2 — SplashScreen 전체

- **보존**: `pct` setInterval 48ms +4 (line 18) / `setTimeout` 1600ms (line 20) / `shouldShowInstallPrompt()` (line 21) / `navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })` (line 24) / `void checkVersionAndRefresh()` (line 16) / `__APP_VERSION__` Vite define (line 73) / `@keyframes slideUp` (line 78~80) / 진행 텍스트 3 분기 카피 verbatim ('시스템 초기화 중...' / '데이터 불러오는 중...' / '준비 완료', line 69) / 하단 버전 카피 verbatim ('v${__APP_VERSION__} · 경기도 성남시 분당구', line 73) / "CBC 방재" h1 verbatim (line 58) / "소방안전 통합관리 시스템" 부제 verbatim (line 59) / 로고 자산 경로 `/icons/icon-192.png` (line 54) / `handleDismiss` 호출 흐름 (line 31~35) — 모두 1 byte 변경 금지
- **토큰**: page bg `#161b22` (line 39) → `bg-surface-page` (마이그레이션 §4.1 `var(--bg)` → `--surface-page` 다크 `#0a0d12` 와 다른 hex 라 직접 토큰 매핑 어려움 — neutral approach: 인라인 유지 또는 신규 토큰 `--surface-splash` 정의 검토, OQ #4 default 토큰 치환 OK) / h1 color `#e6edf3` → `text-text-primary` / p 부제 color `#6e7681` → `text-text-tertiary` / 진행 텍스트 color `#6e7681` → `text-text-tertiary` / 하단 버전 color `#3d444d` → `text-text-disabled` (마이그레이션 §4.1 `--text-disabled` 다크 `#5d646e` 와 다른 hex — neutral: 인라인 유지 또는 alpha-tinted disabled 토큰 검토) / 로고 박스 bg `rgba(37,99,235,0.2)` + border `rgba(59,130,246,0.3)` 인라인 유지 (브랜드 강조, 단일 사용처) / 진행 바 트랙 bg `rgba(255,255,255,0.07)` 인라인 유지 (단일 사용처) / 진행 바 fill `linear-gradient(90deg,#3b82f6,#0ea5e9)` → solid `bg-accent` 치환 (OQ #2 default) / **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`)
- **폰트**: h1 22 (line 58) → `text-heading` (22) `font-black` (fontWeight 900 — `text-heading` weight 600 보다 강함, font-black 명시) `tracking-tight` (letterSpacing -.02em) / 부제 12 (line 59) → `text-caption leading-relaxed tracking-widest` (12 + letterSpacing .1em) / 진행 텍스트 11 (line 68) → §1.1 위반 → `text-caption leading-none` (12 + leading-none, memory `feedback_text_caption_leading_none`) / 하단 버전 10 (line 73) → §1.1 위반 강도 최대 → `text-caption leading-none` (12 격상, OQ #3 default 격상) — 노안 친화 §1.1 룰 일괄 상향

### W3 — InstallPrompt 메인 view (오버레이 + 카드 + 헤더 + 설치 버튼 + 나중에 버튼)

- **보존**: `isStandalone` / `isIOS` helper (변경 금지) / `hasPrompt = !!getDeferredInstallPrompt()` initial (line 28) / `subscribeInstallPrompt(p => setHasPrompt(!!p))` 구독 (line 33) / unsubscribe return (line 34) / `handleInstallAndroid` await `showInstallPrompt()` 3 outcome 분기 (line 38~48, 변경 금지) / `handleInstallIOS` setShowIOSGuide(true) (line 51~53) / `onDismiss` prop (line 25, 102) / 설치 버튼 label 3 분기 verbatim (`ios ? '설치 방법 보기' : hasPrompt ? '홈 화면에 설치' : '설치 방법 보기'`, line 99) / "CBC 방재" h2 verbatim (line 82) / 부제 verbatim "홈 화면에 앱을 설치하면<br/>더 빠르고 편리하게 사용할 수 있습니다" (line 85, `<br/>` 보존) / "나중에 할게요" verbatim (line 109) / 아이콘 자산 경로 `/icons/icon-192.png` (line 78) / **모두 1 byte 변경 금지**
- **토큰**: 오버레이 `rgba(0,0,0,0.85)` (line 60) → `bg-surface-overlay` 대응 `rgba(0,0,0,0.6)` 와 다른 alpha (0.85 vs 0.6) — 인라인 유지 권장 (28-splash 풀스크린 dimmer 특화, design-system §2.1 default overlay 보다 진함) / 카드 bg `#1c2128` (line 65) → `bg-surface-raised` 대응 다크 `#1a1f27` 와 다른 hex — 토큰 치환 OK (OQ #4 default, 28-splash 의 카드 bg 가 design-system 의 surface-raised 와 사실상 같은 의미) 또는 인라인 유지 / 카드 border `rgba(59,130,246,0.3)` 인라인 유지 (단일 사용처, 브랜드 강조) / 카드 boxShadow `0 8px 40px rgba(0,0,0,0.5)` 인라인 유지 (design-system §6.7 "그림자 사용하지 않음" 룰 위반 후보 — 인증 전 모달 단일 예외, OQ 후보 아님 default 유지) / 카드 radius 20 → `rounded-lg` (16) 또는 `rounded-[20px]` (마이그레이션 §4.3 16,20 → `rounded-lg` 16 표준화 또는 임의 정수 인라인 — sketch 단계 결정) / 아이콘 박스 bg `rgba(37,99,235,0.2)` + border `rgba(59,130,246,0.3)` (line 74~75) 인라인 유지 (W2 로고 박스와 동일 토큰 — 일관성) / 설치 버튼 그라데이션 `linear-gradient(135deg, #2563eb, #0ea5e9)` (line 94) → `bg-safe-bar` solid 치환 (OQ #1 default — 27-login + 14-reports + 16-workshift + 17-annual-plan 일관) / 설치 버튼 height 48 → `h-12` (48, OK) / 설치 버튼 radius 12 → `rounded-md` (12) / 설치 버튼 color `#fff` → `text-text-on-accent` / 나중에 버튼 bg transparent + border `rgba(255,255,255,0.1)` 인라인 유지 (semi-transparent ghost border, design-system 에 ghost button 토큰 없음) / 나중에 버튼 color `#6e7681` → `text-text-tertiary` / 나중에 버튼 height 40 → `h-10` (40, OK) / 나중에 버튼 radius 10 → `rounded-sm` (8) 또는 `rounded-[10px]` (마이그레이션 §4.3 7,8,9,10 → `--radius-sm` 8 일괄 — sketch 단계 결정) / h2 color `#e6edf3` → `text-text-primary` / 부제 color `#8b949e` → `text-text-tertiary` — **status- prefix 없음**
- **폰트**: h2 18 (line 81) → `text-title` (18) `font-extrabold` (fontWeight 800) / 부제 12 (line 84) → `text-caption leading-relaxed` (12 + lineHeight 1.5 유지 — `<br/>` 2줄 부제라 leading-none 금지) / 설치 버튼 15 (line 96) → `text-body-sm font-bold` (14) 또는 `text-body font-bold` (16, CTA 강조 + 노안 친화 §1.1 권장 — OQ #3 default 격상 권장) / 나중에 버튼 12 (line 106) → `text-caption font-semibold leading-none` (12 + leading-none, h:40 작은 컨테이너)

### W4 — InstallPrompt Android + iOS 가이드 view

- **보존**: `showIOSGuide` / `showAndroidGuide` state (변경 금지) / `setShowIOSGuide(true)` (line 52) / `setShowAndroidGuide(true)` (line 45) / 노란 경고 박스 카피 verbatim '자동 설치 창이 뜨지 않으면 아래 순서로 설치해 주세요.' (line 116) / Android 3 step 카피 verbatim (Step 1 타이틀 '크롬 우상단 ⋮ 메뉴' line 122 + 서브 '주소창 오른쪽 점 세 개 메뉴를 누르세요' line 123 / Step 2 타이틀 "'앱 설치' 또는 '홈 화면에 추가' 선택" line 129 + 서브 "메뉴에서 앱 설치(또는 홈 화면에 추가)를 누르세요" line 130 strong 2개 / Step 3 타이틀 "'설치' 확인" line 136 + 서브 "팝업에서 설치를 누르면 완료" line 137 strong 1개) / iOS 3 step 카피 verbatim (Step 1 타이틀 '하단 공유 버튼 터치' line 161 + 서브 'Safari 하단의 ⎋ 공유 아이콘을 누르세요' line 164 / Step 2 타이틀 "'홈 화면에 추가' 선택" line 178 + 서브 '스크롤해서 홈 화면에 추가를 찾아 누르세요' line 181 strong 1개 / Step 3 타이틀 "'추가' 터치" line 195 + 서브 '오른쪽 상단 추가 버튼을 누르면 완료!' line 198 strong 1개) / 확인 버튼 카피 '확인했습니다' verbatim (Android line 145, iOS line 212) / `onDismiss` prop / **특수 글리프 ⋮ (U+22EE, line 122 fontSize:16) + ⎋ (U+238B, line 164 fontSize:16 verticalAlign:middle) 콘텐츠 글리프 유지** (OQ #5 default — 27-login OQ #4 ☎ 와 동일 룰)
- **토큰**: 노란 경고 박스 — color `#f59e0b` (line 115) → `text-status-warning` 대응 (design-system §2.3 `--status-warning` foreground) — **단 `status-` prefix 없음** (memory `feedback_tailwind_token_class_pattern` — `text-warning` alias 가 올바른 패턴, `text-status-warning` X) / bg `rgba(245,158,11,0.1)` → `bg-warning-bg` (design-system §2.3 `--status-warning-bg` 대응) / border `rgba(245,158,11,0.25)` → 토큰 정의 없음, 인라인 유지 또는 `border-warning/25` alpha 검토 (sketch 단계 결정). **위험 임계치 의미 부여 (예: bad/danger) 금지** (memory `feedback_redesign_sketch_rule_enforcement` §6.2 negative rule — Android 자동 설치 fallback 안내는 시스템 안내이지 진척률 위반 아님) / 노란 경고 박스 radius 8 → `rounded-sm` (8, OK) / 숫자 원 `28x28` (line 120, 127, 134, 153, 170, 187) — `w-7 h-7` 정확히 32px (memory `feedback_tailwind_w8_h8_is_48px` — w-7=32 confirmed) → **`w-[28px] h-[28px]` 인라인 명시 또는 신규 spacing 28px 정의** (32 격상 시 시각 변화 — sketch 단계 결정. **`w-8 h-8` 사용 시 48×48 1.7배 확대 사고**) / 숫자 원 bg `rgba(59,130,246,0.15)` + color `#3b82f6` → `bg-accent/15 + text-accent` 토큰화 OK / 숫자 원 radius 8 → `rounded-sm` / 숫자 원 fontSize 13 fontWeight 800 → `text-label font-extrabold` / Step 타이틀 color `#e6edf3` → `text-text-primary` / Step 서브 color `#8b949e` → `text-text-tertiary` / strong color `#e6edf3` → `text-text-primary font-bold` (또는 nested span — sketch 결정) / 확인 버튼 bg `rgba(59,130,246,0.15)` + border `rgba(59,130,246,0.3)` + color `#3b82f6` → `bg-accent/15 border-accent/30 text-accent` 또는 `bg-accent/15 border border-accent text-accent` (alpha 정밀도 결정 sketch 단계) / 확인 버튼 height 44 → `h-11` (44, 모바일 터치 마지노선 §1.1 부합) / 확인 버튼 radius 10 → `rounded-sm` (8) 또는 `rounded-[10px]` / **특수 글리프 ⋮ ⎋ 는 텍스트 inline span fontSize 16 유지** (Lucide MoreVertical / Share 교체 X — OQ #5 default). **status- prefix 없음**
- **폰트**: 노란 경고 박스 12 (line 115) → `text-caption leading-none` (12 + leading-none, 작은 박스 dense layout) / Step 타이틀 13 (line 122/129/136/160/177/194) → `text-label font-bold leading-none` (13 + leading-none, dense 3-step) / Step 서브 11 (line 123/130/137/163/180/197) → §1.1 위반 → `text-caption leading-snug` (12 + lineHeight 1.4 정도 — 서브 텍스트 2줄 가능성 위해 leading-none 금지, lineHeight 1.5 명시는 없으나 줄바꿈 가능성 고려) / 숫자 원 fontSize 13 fontWeight 800 → `text-label font-extrabold leading-none` / 확인 버튼 13 (line 143/209) → `text-label font-bold leading-none` (h:44 작은 컨테이너) / **특수 글리프 ⋮ ⎋ fontSize 16 (line 122, 164)** — 콘텐츠 글리프, fontSize 명시 유지 (`text-body` 16 매칭 — 인라인 fontSize:16 또는 className `text-base` 둘 다 OK)

### W5 — TSX 변환 verify checklist (markdown)

- **보존**: SplashScreen.tsx + InstallPrompt.tsx 의 모든 비즈 로직 (useState 5종 [pct/showInstall/hasPrompt/showIOSGuide/showAndroidGuide] / useEffect 2종 / useNavigate / useAuthStore / handleDismiss / handleInstallAndroid / handleInstallIOS / isStandalone / isIOS / shouldShowInstallPrompt / dismissInstallPrompt / `__APP_VERSION__` / `@keyframes slideUp` / localStorage `pwa-install-dismissed` 24h TTL / 48ms tick / 1600ms / +4) 100% 보존. **비즈 시그니처 anchor (§1.3 박스) 1 byte 변경 금지** grep gate. import 시그니처 (`from '../components/InstallPrompt'`, `from '../utils/pwaInstall'`, `from '../utils/versionCheck'`, `from '../stores/authStore'`) 변경 금지. UI markup + 인라인 style 만 재작성. **2개 파일 atomic 단일 변환 권장** — 두 파일이 같은 흐름에 묶여 있어서 분할 시 컨텍스트 낭비.
- **토큰**: W2~W4 sketch 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → checklist 안에 verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`). **status- prefix 없음** 룰 (memory `feedback_tailwind_token_class_pattern`) + `w-8/h-8 = 48px` 함정 룰 (memory `feedback_tailwind_w8_h8_is_48px`) verbatim 박제. 설치 버튼 `bg-safe-bar` solid 결정 (OQ #1) / 진행 바 `bg-accent` solid 결정 (OQ #2) / 노란 경고 박스 `text-warning + bg-warning-bg` alias 결정 (OQ #4) / 외곽 hex 토큰 치환 결정 (OQ #4) / 특수 글리프 ⋮ ⎋ inline span 유지 결정 (OQ #5) 모두 명시. 숫자 원 28×28 함정 (w-7=32 / w-8=48 둘 다 X) → `w-[28px] h-[28px]` 인라인 권장 명시.
- **폰트**: design-system.md §2.7 7단계 cheatsheet + 마이그레이션 룰 §4.2 의 9·10·11px 일괄 상향 룰 verbatim 박제. SplashScreen 하단 버전 10 → 12 격상 / 진행 텍스트 11 → 12 격상 / Step 서브 11 → 12 격상 / 설치 버튼 15 → 16 격상 (CTA 강조) / 모든 격상 결정 (OQ #3) 명시. **특수 글리프 fontSize 16 유지 + `__APP_VERSION__` 보존 + localStorage key 'pwa-install-dismissed' 보존** verbatim.

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

본 인용은 `cha-bio-safety/docs/redesign-context/28-splash/design-system.md` (v0.1.1, c8bfa86) 원문 그대로. 후속 wave 작업자가 design-system.md 를 별도로 열지 않아도 핵심 룰을 본 인덱스에서 직접 확인 가능하도록 박제한다.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

> 28-splash 현재 fontSize 위반 후보: **10** (SplashScreen 하단 버전 line 73 — 위반 강도 최대) / **11** (SplashScreen 진행 텍스트 line 68 + InstallPrompt Step 서브 line 123/130/137/163/180/197 다수). 12 (SplashScreen 부제 line 59 / InstallPrompt 부제 line 84 / 노란 경고 line 115 / 나중에 버튼 line 106) 는 §1.1 마지노선. OQ #3 default 답 참조.

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

> 28-splash 는 인증 전 페이지 (스플래시 1.6초 + PWA 설치 안내 팝업 — 1회성 진입). §1.2 의 "장식 빼고 빠른 식별" 룰 부합. 설치 버튼 그라데이션 → solid 폐기 (§6.4 + OQ #1 default OK) 도 §1.2 의 일관 적용. 단 카드 boxShadow `0 8px 40px rgba(0,0,0,0.5)` 는 §6.7 "그림자 사용하지 않음" 룰 위반 후보 — 인증 전 모달 단일 예외로 default 유지 (모달이 풀스크린 dimmer 위에 떠 있어 그림자가 입체감 보다는 카드 경계 강화 역할).

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

> 28-splash 는 **모바일 전용 화면** — 데스크톱 분기 없음 (`/` 가 PC 1920x1080 에도 모바일 레이아웃으로 동일 표시). §1.3 의 "모바일/데스크톱 동일 폰트" 룰은 자명하게 충족 (단일 화면). 단 모바일 단일 layout 이라 데스크톱 PC 사용자가 1920x1080 화면에 작은 모달 (maxWidth 340) 을 보게 됨 — `inset 0 + flex center` 풀스크린 dimmer 가 적절한 처리.

## §3.4 design-system §6.1 Progress Color Rule (verbatim)

```
### 6.1 Progress Color Rule (진척률 색 매핑)

점검 카테고리 도넛, 카테고리 카드 좌측 색바 등 **진척률을 표현할 때** 일관 적용한다.

| 진척률 | 색상 | 토큰 |
|---|---|---|
| 100% (완료) | 녹색 | `--status-safe-bar` |
| 50~99% | 파랑 | `--accent` |
| 1~49% | 노랑 | `--status-warning-bar` |
| 0% (미시작) | 회색 | `--text-tertiary` |

**카테고리별 임의 색 배정 폐지** — 카테고리는 아이콘 모양으로 구분하고, 색은 진척률 기반만 사용한다.
```

> **§6 미적용 — 인증 전 스플래시 + PWA 설치 안내에는 진척률 도넛/카테고리 카드 없음.** SplashScreen 의 진행 바 (line 65~67) 는 "시스템 초기화 1.6초 progress" 시각 표현이지 점검 진척률이 아님 → Progress Color Rule 대상 element 0개. 단 **§6.4 그라데이션 폐기 룰은 적용** (OQ #1 — 설치 버튼 `linear-gradient(135deg, #2563eb, #0ea5e9)` → `bg-safe-bar` solid + OQ #2 — 진행 바 `linear-gradient(90deg,#3b82f6,#0ea5e9)` → `bg-accent` solid).

## §3.5 design-system §6.2 Stat Card Number Color (verbatim)

```
### 6.2 Stat Card Number Color

통계 카드(28px display 숫자) 색상 룰:
- 기본 숫자 색: `--text-primary` (흰색/검정)
- 라벨: `--text-secondary`
- 단위: `--text-tertiary`
- **위험 임계치 조건부 처리**: `점검 미완료 > 0`, `미조치 > 0` 등 주의가 필요한 상태일 때 숫자만 `--status-danger`로 변경
- 카드 좌측 3px 색바: 해당 status 토큰의 `bar` 변종 (예: `--status-danger-bar`)
```

> **§7 (= "Stat Card" 룰) 미적용 — 인증 전 스플래시 + PWA 설치 안내에는 통계 숫자 카드 없음.** 28-splash 페이지에 28px display 숫자 카드 0개 (h1 22px + h2 18px 만 존재, display 28px 없음). **W5 변환 wave executor 가 Stat Card §6.2 룰 verbatim 인용 누락으로 deviation 잡으면 안 됨** — 실제로 28-splash 에 적용 대상 element 가 없으므로 (memory `feedback_tsx_wave_stat_card_drift` 룰 따라 본 인덱스에 "미적용" 명시).

## §3.6 design-system §6.4 Backgrounds & Gradients 폐기 룰 (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

> 28-splash 현재 그라데이션 2개: (1) 설치 버튼 `linear-gradient(135deg, #2563eb, #0ea5e9)` (InstallPrompt line 94) — §6.4 의 "저장/CTA 그라데이션" 후보처럼 보이지만 시작 색 #2563eb ≠ #1d4ed8 — 정확 매치 아님. (2) 진행 바 fill `linear-gradient(90deg,#3b82f6,#0ea5e9)` (SplashScreen line 66) — 90deg + 시작 #3b82f6 — §6.4 두 그라데이션 모두 매치 X. **27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 + 16-workshift W1 OQ #1 + 17-annual-plan W1 OQ #1 default OK 일관 정책** 따라 둘 다 폐기 → 설치 버튼 = `bg-safe-bar` solid (OQ #1) + 진행 바 = `bg-accent` solid (OQ #2). 이 결정은 §7 OQ #1, OQ #2 에서 사용자 컨펌 (default OK).

## §3.7 design-system §7.1 Iconography — Lucide (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

> **§7.1 — Lucide 사용 가능.** 단 InstallPrompt 의 특수 글리프 ⋮ (Android 가이드 line 122, U+22EE) + ⎋ (iOS 가이드 line 164, U+238B) 는 사용자 OS UI 표기 일치 목적의 **콘텐츠 글리프** 이므로 Lucide `MoreVertical` / `Share` 교체 X (OQ #5 default — 27-login OQ #4 ☎ 와 동일 룰 — 전화번호 표기 콘텐츠). 다른 아이콘 없음 (다운로드 / 뒤로 가기 등) — InstallPrompt 의 인포 일러스트는 `<img src=/icons/icon-192.png>` PNG 그대로 사용. 본 페이지에 이모지 0건 (현재 잘 지켜짐 — ⋮ ⎋ 는 emoji 가 아닌 U+22EE Vertical Ellipsis / U+238B Broken Circle With Northwest Arrow). 단 W5 verify gate 에서 emoji-0 grep 검사 시 ⋮ ⎋ 는 예외 처리 (U+22EE / U+238B anchor).

추가 메타:
- 기존 디자인 = InstallPrompt 설치 버튼 `linear-gradient(135deg, #2563eb, #0ea5e9)` (line 94) → `bg-safe-bar` solid 통일 검토 — **default OK**. 근거: 27-login W1 OQ #1 default OK (그라데이션 → solid) + 14-reports W1 OQ #1/#3 default OK + 16-workshift W1 OQ #1 default OK + 17-annual-plan W1 OQ #1 default OK 일관 + design-system §6.4 CTA solid 룰 + memory `feedback_design_sketch_first` + `feedback_tailwind_token_class_pattern`. 이 결정은 §7 OQ #1 에서 사용자 컨펌 받음.
- SplashScreen 진행 바 `linear-gradient(90deg,#3b82f6,#0ea5e9)` (line 66) — 시각적 진행 표현이 핵심 (width 변화로 진행 표시). solid `bg-accent` 치환 default 권장. §7 OQ #2 에서 컨펌.

---

# §4. 02+06 chrome 통일 룰 적용 여부

28-splash 페이지 (`/` route) 는 **인증 전 스플래시 + PWA 설치 안내** → `inspection-modal-chrome-rules.md` 의 chrome 룰 자체는 **직접 적용 X** (zone/category/floor/line wrapper 없음, 점검 모달 없음, editMode 토글 없음, BottomNav 없음).

단, 다음 3 패턴은 mirror 검토 안 됨 (인증 전 페이지 특성):

1. **헤더 없음** — SplashScreen 은 헤더 X (전체 화면 중앙 정렬 `minHeight:100dvh` + `flex column center` + `gap:0`, line 38~43). InstallPrompt 는 오버레이 모달 안 카드 (헤더 = 아이콘 64x64 + 제목 h2 + 부제 p, line 72~86) — chrome 룰 §2.1 의 `bg-surface-page` 통일 룰 적용 안 됨 (모달 카드 = `bg-surface-raised` 패턴 — 단 modal-content padding 패턴은 적용 후보로 `28px 24px` 인라인 vs `--modal-padding` 토큰 치환 검토).
2. **back button 없음** — 인증 전 페이지 → 모바일 자체 헤더의 back button 패턴 (chrome 룰 §7.2 `w-8 h-8 bg-surface-sunken`) 적용 안 됨. 닫기 동작은 InstallPrompt 의 '나중에 할게요' 버튼 (line 101~110, height 40 transparent ghost) + 가이드 '확인했습니다' 버튼 (line 141~146, height 44 accent variant) 이 담당.
3. **BottomNav 숨김 / AppHeader 숨김** — `cha-bio-safety/src/App.tsx` 실측 결과:

```
line 16: const SplashScreen = lazy(() => import('./pages/SplashScreen'))
line 71: const MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']   // '/' 등재 → 모바일 BottomNav 숨김
line 74: const DESKTOP_NO_NAV_PATHS = ['/', '/login']   // '/' 등재 → 데스크톱 BottomNav 숨김 (사이드바)
line 77: const DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']   // '/' 미등재 (단 showNav false 라 무의미)
line 79~: const PAGE_TITLES: Record<string, string> = { ... }   // '/' 미등재 → 글로벌 AppHeader 가 표시할 타이틀 없음
line 113: const noNavPaths = isDesktop ? DESKTOP_NO_NAV_PATHS : MOBILE_NO_NAV_PATHS   // 두 배열 중 하나 선택
line 227: {isDesktop && showNav && !DESKTOP_HEADER_HIDE_PATHS.includes(location.pathname) && (...)}   // showNav 가 첫번째 조건 → false 면 단락
line 265: <Route path="/" element={<SplashScreen />} />   // 인증 가드 (Auth wrapper) 없이 노출
```

**핵심 시사점:**
- **모바일**: `/` ∈ `MOBILE_NO_NAV_PATHS` → BottomNav **숨김**. SplashScreen 자체 헤더도 없음 → 화면 100% SplashScreen 또는 InstallPrompt 오버레이 차지. sketch 시 nav/header placeholder 그릴 필요 없음.
- **데스크톱**: `/` ∈ `DESKTOP_NO_NAV_PATHS` → BottomNav (사이드바) **숨김**. `/` ∉ `DESKTOP_HEADER_HIDE_PATHS` 이지만 `showNav` 가 false 라 line 227 분기 단락 → 글로벌 AppHeader **미렌더**. `PAGE_TITLES` 에도 `/` 미등재 → 헤더가 표시되더라도 타이틀 무. **데스크톱 = 화면 100% SplashScreen 또는 InstallPrompt 오버레이만.** 17-annual-plan 과 다른 점 = 17-annual-plan 은 데스크톱 글로벌 AppHeader + 자체 상단 바 + 사이드바 BottomNav 3 영역 표시, 28-splash 는 0 영역 (인증 전 페이지).
- **인증 가드 없음** — line 265 `<Route path="/" element={<SplashScreen />} />` 가 Auth wrapper 로 감싸지지 않음. SplashScreen 본체에서 `useAuthStore().isAuthenticated` 분기 후 `/dashboard` 또는 `/login` 으로 1600ms 뒤 자동 navigate (line 24).

본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 17-annual-plan W1 의 10건 + 28-splash 특화 2건 (`feedback_tsx_wave_emoji_dot_gap` 의 특수 글리프 ⋮ ⎋ 예외 결정 강조 + `project_redesign_15_daily_report_status` 의 캘리브 좌표 시스템 → 비즈 anchor 1 byte 변경 금지 일반화). 각 룰은 슬러그 + 요약 + Why + How (28-splash 컨텍스트) 4 항목.

### 룰 1 — feedback_design_sketch_first
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (28-splash)**: InstallPrompt 카드 패딩 (현재 `28px 24px`, line 66) + 설치 버튼 height (현재 48, line 93) + 나중에 버튼 height (현재 40, line 104) + 확인 버튼 height (현재 44, line 142/207) + 노란 경고 박스 padding (`8px 10px`, line 115) + 숫자 원 28×28 (line 120/127/134/153/170/187) + 카드 boxShadow `0 8px 40px rgba(0,0,0,0.5)` 같은 spacing/sizing 도 변경 시 `sketch-wave-2-splash.html` / `sketch-wave-3-install-main.html` / `sketch-wave-4-install-guide.html` 먼저 보여주고 사용자 컨펌. "버튼 좀 크게/작게" 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (28-splash)**: 노란 경고 박스 `#f59e0b` + `rgba(245,158,11,0.1)` + `rgba(245,158,11,0.25)` (InstallPrompt line 115) 은 status 임계치 색이 아니라 **시스템 안내** (Android 자동 설치 fallback 안내) — `bg-warning-bg` + `text-warning` 알리아스 토큰화 OK (status- prefix 없음 룰 룰 5 함께 참조). 단 **위험 임계치 의미 부여 (예: bad/danger) 금지**. 숫자 원 + 확인 버튼 `rgba(59,130,246,0.15)` + `#3b82f6` (line 120/143) 는 accent (시스템 강조) 의미 — `bg-accent/15 + text-accent`. 설치 버튼은 CTA → `bg-safe-bar` solid (의미: "이 작업 실행" 정상 CTA, OQ #1 default).

### 룰 3 — feedback_sketch_realistic_data
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 "CBC 방재" 같은 텍스트나 설치 버튼 label 분기 카피 '홈 화면에 설치' 등을 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (28-splash)**: 카피 verbatim — "CBC 방재" (SplashScreen h1 line 58 + InstallPrompt h2 line 82, 둘 다 동일), "소방안전 통합관리 시스템" (SplashScreen 부제 line 59), "시스템 초기화 중..." / "데이터 불러오는 중..." / "준비 완료" (진행 텍스트 3 분기 line 69), "v${__APP_VERSION__} · 경기도 성남시 분당구" (버전 line 73), "홈 화면에 앱을 설치하면\\n더 빠르고 편리하게 사용할 수 있습니다" (InstallPrompt 부제 line 85, `<br/>` 보존), 설치 버튼 label 3 분기 ("홈 화면에 설치" / "설치 방법 보기", line 99), "나중에 할게요" (line 109), "자동 설치 창이 뜨지 않으면 아래 순서로 설치해 주세요." (노란 경고 line 116), Android 3-step (Step 1 '크롬 우상단 ⋮ 메뉴' + '주소창 오른쪽 점 세 개 메뉴를 누르세요' / Step 2 "'앱 설치' 또는 '홈 화면에 추가' 선택" + "메뉴에서 앱 설치(또는 홈 화면에 추가)를 누르세요" / Step 3 "'설치' 확인" + "팝업에서 설치를 누르면 완료") + iOS 3-step (Step 1 '하단 공유 버튼 터치' + 'Safari 하단의 ⎋ 공유 아이콘을 누르세요' / Step 2 "'홈 화면에 추가' 선택" + "스크롤해서 홈 화면에 추가를 찾아 누르세요" / Step 3 "'추가' 터치" + "오른쪽 상단 추가 버튼을 누르면 완료!") + strong 강조 위치 verbatim, "확인했습니다" (line 145/212). 시안에서 변경 금지.

### 룰 4 — feedback_planner_prompt_sketch_verbatim
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (28-splash)**: W5 TSX 변환 wave 진입 직전 `sketch-wave-2~4.html` 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → `wave-5-tsx-conversion-checklist.md` 안에 verbatim 인용. 특히 카드 boxShadow `0 8px 40px rgba(0,0,0,0.5)` (InstallPrompt line 69) / 오버레이 alpha `rgba(0,0,0,0.85)` (line 60) / 카드 border `rgba(59,130,246,0.3)` (line 68) / 노란 경고 박스 3 색 알파 분기 (`#f59e0b` text / `rgba(245,158,11,0.1)` bg / `rgba(245,158,11,0.25)` border, line 115) / 숫자 원 패턴 (`rgba(59,130,246,0.15)` bg + `#3b82f6` color, line 120) / 설치 버튼 그라데이션 `linear-gradient(135deg, #2563eb, #0ea5e9)` (line 94) / 진행 바 그라데이션 `linear-gradient(90deg,#3b82f6,#0ea5e9)` (SplashScreen line 66) 같은 인라인 값은 추측 X — sketch 결과 verbatim 인용.

### 룰 5 — feedback_tailwind_token_class_pattern
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (28-splash)**: 설치 버튼 그라데이션 → `bg-safe-bar` solid 치환 (OQ #1). `bg-status-safe-bar` (status- prefix) 사용 시 W5 verify FAIL. 진행 바 → `bg-accent` solid 치환 (OQ #2). `bg-status-accent` X. 노란 경고 박스 → `bg-warning-bg + text-warning` (OQ #4). `bg-status-warning-bg` X. 숫자 원 + 확인 버튼 → `bg-accent/15 + text-accent`. Lucide 미사용 (특수 글리프 ⋮ ⎋ 는 인라인 span fontSize:16, OQ #5 default). 만약 W2~W4 에서 Lucide 도입 결정 시 prop `size={N}` 사용 — className 으로 `w-N h-N` 금지.

### 룰 6 — feedback_tailwind_w8_h8_is_48px
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (28-splash)**: ★ 28-splash 핵심 함정 — InstallPrompt 숫자 원 28×28 (line 120/127/134/153/170/187, 총 6개) → **`w-8 h-8` 사용 시 48×48 (1.7배 확대 사고)**. `w-7 h-7` 도 32×32 (1.14배 확대). **`w-[28px] h-[28px]` 인라인 명시 필수** (또는 시각 변화 감수하고 `w-7 h-7` 32px 격상 — sketch 단계 결정). 설치 버튼 height 48 (line 93) → `h-12` (48, 정상 매핑 OK). 나중에 버튼 height 40 (line 104) → `h-10` (40, OK). 확인 버튼 height 44 (line 142/207) → `h-11` (44, OK, 모바일 터치 마지노선 §1.1 부합). 로고 박스 88×88 (SplashScreen line 47~48) → `w-[88px] h-[88px]` 인라인 (88 토큰 없음). 아이콘 박스 64×64 (InstallPrompt line 72~73) → `w-16 h-16` (64 — w-16 토큰 검증 필요. 4의 배수 룰 §1.1 부합).

### 룰 7 — feedback_text_caption_leading_none
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (28-splash)**: SplashScreen 하단 버전 10 (line 73, position absolute bottom:20) → `text-caption leading-none` (12 격상 + leading-none) / SplashScreen 진행 텍스트 11 (line 68, marginTop 10) → `text-caption leading-none` (12 + leading-none) / InstallPrompt 나중에 버튼 12 (line 106, h:40) → `text-caption leading-none font-semibold` / InstallPrompt 노란 경고 박스 12 (line 115, padding 8px 10px) → `text-caption leading-none` (작은 박스 dense layout) / InstallPrompt Step 서브 11 (line 123 등) → §1.1 위반 → `text-caption leading-snug` (12 + lineHeight 1.4, 서브 텍스트 2줄 가능성 위해 leading-none 금지). 단 InstallPrompt 부제 (line 84, lineHeight:1.5 명시 + `<br/>` 2줄 부제) 는 `leading-relaxed` 유지 — leading-none 금지.

### 룰 8 — feedback_tsx_wave_emoji_dot_gap (★ 28-splash 특화 — 특수 글리프 예외 결정)
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify. **단 28-splash 의 특수 글리프 ⋮ (U+22EE) + ⎋ (U+238B) 는 콘텐츠 글리프 = 사용자 OS UI 표기 일치 → 유지 허용** (27-login OQ #4 ☎ 와 동일 룰).
- **Why**: sketch 의 `🎯` `⬇` 같은 장식 이모지/특수문자가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨. **하지만 ⋮ ⎋ 는 사용자가 실제 Android Chrome 메뉴 / iOS Safari 공유 UI 에서 볼 글리프와 1:1 매칭** → 교체 시 인지 부조화.
- **How to apply (28-splash)**: ★ 28-splash 핵심 룰 — 일반 장식 이모지는 sketch 시 제거 + dot span 추가 룰 유지. 단 InstallPrompt 의 `⋮` (U+22EE, Android Step 1 line 122, "크롬 우상단 ⋮ 메뉴" 콘텐츠) + `⎋` (U+238B, iOS Step 1 line 164, "Safari 하단의 ⎋ 공유 아이콘" 콘텐츠) 은 **콘텐츠 글리프** — 사용자가 실제 OS 에서 볼 UI 와 1:1 매칭 → 유지 허용. fontSize:16 inline span 형태 유지 (line 122 verticalAlign 무 / line 164 verticalAlign:'middle'). W2~W4 sketch 진입 시 emoji-0 grep 자동 verify gate 에서 ⋮ ⎋ 는 예외로 처리 (또는 grep 패턴이 emoji range 만 잡고 U+22EE/U+238B 는 anchor 로 명시). 28-splash 본문에는 일반 장식 이모지 0건 (현재 잘 지켜짐).

### 룰 9 — feedback_tsx_wave_stat_card_drift
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (28-splash)**: 28-splash 페이지에 Stat Card (28px display 숫자) 없음 → §3.5 인용 후 "미적용" 메타 명시. 단 sketch 새 패턴 (예: SplashScreen tick 진행 4 state 매트릭스 — 0%/40%/80%/100% / InstallPrompt 3 view state 매트릭스 — 메인/Android 가이드/iOS 가이드 / 설치 버튼 label 3 분기 매트릭스 — iOS/Android hasPrompt/Android !hasPrompt) 는 verbatim 인용 필수 W5 진입 시. source SplashScreen.tsx + InstallPrompt.tsx 의 인라인 hex/그라데이션 (예: `linear-gradient(135deg, #2563eb, #0ea5e9)` 설치 버튼) 이 sketch 의 새 토큰 패턴 (`bg-safe-bar`) 을 덮어쓰지 않도록 명시 필수.

### 룰 10 — feedback_avoid_premature_confirmation
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (28-splash)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지. 특히 InstallPrompt 의 3 view state (메인/Android 가이드/iOS 가이드) 시각 결과 + 특수 글리프 ⋮ ⎋ 표현은 사용자 판단 영역 (Android/iOS 디바이스 실 환경 매칭 인지).

### 룰 11 — feedback_planner_prompt_sketch_verbatim (재인용/강조 ★ 28-splash 특화 — 320 라인 2-file 통합)
- **요약**: 2-file 통합 320 lines — sketch CSS verbatim grep 강도 최대. 특히 카드 boxShadow / 오버레이 alpha / 카드 border / 노란 경고 박스 3 색 알파 분기 / 숫자 원 패턴 — 1 byte 어긋나면 W5 verify FAIL.
- **Why**: 17-annual-plan (225 lines 단일 파일) 보다 1.4배 큰 320 lines 통합 — verbatim grep 강도 최대 필요. 특히 InstallPrompt 의 3 view state × 3 step × strong 강조 위치 + 특수 글리프 fontSize:16 + verticalAlign:'middle' (iOS Step 1 만) 같은 미세 차이까지 sketch 결과 verbatim 인용.
- **How to apply (28-splash)**: W5 진입 시 sketch HTML 의 CSS 정의 (특히 카드 boxShadow `0 8px 40px rgba(0,0,0,0.5)` / 오버레이 `rgba(0,0,0,0.85)` / 카드 border `rgba(59,130,246,0.3)` / 노란 경고 박스 3 색 알파 (`color:#f59e0b` / `bg:rgba(245,158,11,0.1)` / `border:rgba(245,158,11,0.25)`) / 숫자 원 6개 모두 동일 패턴 (`28x28 / radius:8 / bg:rgba(59,130,246,0.15) / color:#3b82f6 / fontSize:13 / fontWeight:800`) / 설치 버튼 그라데이션 `linear-gradient(135deg, #2563eb, #0ea5e9)` / 진행 바 그라데이션 `linear-gradient(90deg,#3b82f6,#0ea5e9)` / strong color `#e6edf3` 5번 (Android Step 2 2개 + Step 3 1개 + iOS Step 2 1개 + Step 3 1개)) 를 grep 으로 추출해 그대로 인용. 추측 토큰명 사용 시 deviation 유발.

### 룰 12 — project_redesign_15_daily_report_status (★ 28-splash 특화 — 15-daily-report 좌표 시스템 → 비즈 anchor 1 byte 변경 금지 일반화)
- **요약**: redesign/15-daily-report W1~W7 sketch + SW1~SW4 TSX 변환 완결 (319aef8). **캘리브 좌표 시스템 100% 보존 패턴** → **28-splash 의 비즈 anchor 1 byte 변경 금지** 룰 일반화.
- **Why**: 15-daily-report 의 portraitPos (인물사진 좌표 보정) + 17-annual-plan 의 yearPos (연도 위치 보정) — localStorage 영구 저장 + 좌표 계산식 + 시그니처/식별자/값 1 byte 변경 금지 룰. SW3 변환 시 좌표 시스템 무손실 변환 성공 patterns 동일 적용. 28-splash 는 좌표 시스템은 아니지만 **시간 anchor (48ms tick / 1600ms / +4) + 외부 anchor (__APP_VERSION__ Vite define / localStorage 'pwa-install-dismissed' 24h TTL / @keyframes slideUp)** 가 동일 의미의 비즈 anchor.
- **How to apply (28-splash)**: SplashScreen 의 **시간 anchor**: `setInterval(48)` (line 18) / `Math.min(p + 4, 100)` (line 18) / `setTimeout(1600)` (line 20) / `@keyframes slideUp .4s ease-out` (line 78~80) 모두 1 byte/숫자 변경 금지. **외부 anchor**: `__APP_VERSION__` Vite define 인젝션 (line 73) / 로고 자산 경로 `/icons/icon-192.png` (line 54). InstallPrompt 의 **외부 anchor**: `localStorage key 'pwa-install-dismissed'` (line 227/236) / 24h TTL `24 * 60 * 60 * 1000` (line 230) / 아이콘 자산 경로 `/icons/icon-192.png` (line 78). **분기 anchor**: `isStandalone()` 3 분기 (iOS standalone / Android display-mode standalone/fullscreen) + `isIOS()` 2 분기 (userAgent + iPadOS Macintosh maxTouchPoints) + `handleInstallAndroid` 3 outcome ('accepted'/'unavailable'/'dismissed') 모두 분기 로직 1 byte 변경 금지. §1.3 별도 박스 + §6 negative rule + §7 OQ #5 default 답에서 재확인. 15-daily-report SW3 portraitPos / 17-annual-plan W3 yearPos 보존 룰 (precedent) 의 시간/외부/분기 anchor 일반화 적용.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **SplashScreen.tsx + InstallPrompt.tsx + pwaInstall.ts + versionCheck.ts 4개 파일 모두 코드 수정 금지** — `cha-bio-safety/src/pages/SplashScreen.tsx` (83 lines) + `cha-bio-safety/src/components/InstallPrompt.tsx` (237 lines) + `cha-bio-safety/src/utils/pwaInstall.ts` (52 lines) + `cha-bio-safety/src/utils/versionCheck.ts` (55 lines) 모두 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- {4 파일}` 결과 0 줄.
- **비즈 로직 시그니처 변경 금지 (7건+)** — `isStandalone()` / `isIOS()` / `getDeferredInstallPrompt()` / `subscribeInstallPrompt()` / `showInstallPrompt()` / `shouldShowInstallPrompt()` / `dismissInstallPrompt()` / `checkVersionAndRefresh()` 모두 import/export 동일하게 유지. 본 wave + W2~W5 모두.
- **다른 페이지 (13-schedule / 14-reports / 27-login / 16-workshift / 17-annual-plan / 15-daily-report / 02 / 06 등) 영향 금지** — `git status` 에 28-splash/ 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **13-schedule + 14-reports + 27-login + 16-workshift + 17-annual-plan 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 평면(flat sibling). `sketch/` 서브폴더 만들지 않음. 28-splash 도 동일 평면 배치 (`28-splash/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` (line 71, `/` 등재) + `DESKTOP_NO_NAV_PATHS` (line 74, `/` 등재) + `DESKTOP_HEADER_HIDE_PATHS` (line 77, `/` 미등재 — 단 showNav false 라 무의미) + `PAGE_TITLES` (line 79~, `/` 미등재) + `Route` (line 265, Auth wrapper 없이 노출) 모두 실측 확인됨. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.
- **★ `__APP_VERSION__` Vite define 인젝션 보존** — SplashScreen line 73 의 `v${__APP_VERSION__} · 경기도 성남시 분당구` 카피에서 식별자 변경 금지 (vite.config.ts 의 define 파라미터 연결). 변경 시 빌드 에러 또는 `undefined` 렌더.
- **★ `@keyframes slideUp .4s ease-out` 보존** — SplashScreen line 78~80 의 from/to 키프레임 (`from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)}`) 변경 금지. animation 이름/duration/easing 모두 1 byte 변경 금지 (line 45 의 `animation:'slideUp .4s ease-out'` 참조와 매칭).
- **★ localStorage key `'pwa-install-dismissed'` 24h TTL 보존** — InstallPrompt line 227/236 의 키 문자열 + 24h 윈도우 (`24 * 60 * 60 * 1000`, line 230) 변경 금지. 키 변경 시 기존 사용자 dismiss 상태 손실.
- **★ 시간 anchor 보존** — SplashScreen line 18 `setInterval(..., 48)` (48ms tick) / line 18 `Math.min(p + 4, 100)` (+4 per tick) / line 20 `setTimeout(..., 1600)` (1600ms 후 navigate) 모두 1 byte/숫자 변경 금지.
- **★ 특수 글리프 ⋮ (U+22EE) + ⎋ (U+238B) 제거 금지** — InstallPrompt line 122 + 164. Lucide `MoreVertical` / `Share` 교체 금지 (콘텐츠 글리프, OQ #5 default). fontSize:16 inline span + verticalAlign:'middle' (iOS Step 1만) 유지.
- **외부 PNG 자산 경로 `/icons/icon-192.png` 변경 금지** — SplashScreen line 54 (로고 64×64 radius 14) + InstallPrompt line 78 (아이콘 48×48 radius 12). public/icons 폴더의 실 파일 경로. 변경 시 404.
- **분기 로직 변경 금지** — `isStandalone()` 3 분기 (iOS standalone / Android display-mode standalone / Android display-mode fullscreen, line 5~10) + `isIOS()` 2 분기 (userAgent /iPhone\|iPad\|iPod/ / Macintosh + maxTouchPoints>1, line 12~17) + `handleInstallAndroid` 3 outcome ('accepted' onDismiss / 'unavailable' setShowAndroidGuide / 'dismissed' noop, line 38~48) + 설치 버튼 label 3 분기 (ios / hasPrompt / !hasPrompt, line 99) + 진행 텍스트 3 분기 (pct<40 / pct<80 / else, line 69) — 모두 분기 조건/순서/카피 1 byte 변경 금지.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: InstallPrompt 설치 버튼 `linear-gradient(135deg, #2563eb, #0ea5e9)` (line 94) → `bg-safe-bar` solid 통일 OK?
  - **default 답: OK** — 27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 + 16-workshift W1 OQ #1 + 17-annual-plan W1 OQ #1 default OK 일관 + design-system §6.4 CTA solid 룰 (그라데이션 시작 색 #2563eb 이 §6.4 의 "유일한 그라디언트 2종"의 #1d4ed8 와 다르므로 폐기 후보로 명확). color = `text-text-on-accent` (#fff 유지). InstallPrompt 카드 안에서 설치 버튼이 핵심 CTA — solid `bg-safe-bar` (녹색 "이 작업 실행" 정상 CTA 의미) 적합.

- **OQ #2**: SplashScreen 진행 바 fill `linear-gradient(90deg,#3b82f6,#0ea5e9)` (line 66) → `bg-accent` solid 치환 vs 그라데이션 유지?
  - **default 답: solid `bg-accent` 치환 OK** — 진행 바는 시각적 진행 표현이 핵심 (width 변화로 진행 표시) → 색상 그라데이션 없어도 시각 메시지 손상 없음. solid 통일 시 design-system 일관성 + 토큰 정의 효율. 그라데이션 유지 시 인라인만 가능 (토큰 비용 vs 단일 사용처 trade-off, 16-workshift W1 OQ #4 SHIFT_COLOR hex+22 인라인 유지 패턴과 일관 — 다만 진행 바는 단일 element 라 토큰화 default 우세). 진행 바 트랙 `rgba(255,255,255,0.07)` (line 65) 는 인라인 유지 (alpha 정밀도 + 단일 사용처).

- **OQ #3**: 폰트 격상 매핑 — 현재 fontSize:**10** (SplashScreen 하단 버전 line 73) / **11** (SplashScreen 진행 텍스트 line 68, InstallPrompt Step 서브 line 123/130/137/163/180/197 다수) / **12** (SplashScreen 부제 line 59, InstallPrompt 부제 line 84, 노란 경고 line 115, 나중에 버튼 line 106) / **13** (Step 타이틀 line 122/129/136/160/177/194, 숫자 원 line 120 등, 확인 버튼 line 143/209) / **15** (InstallPrompt 설치 버튼 line 96) / **16** (특수 글리프 ⋮ ⎋ inline span line 122/164) / **18** (InstallPrompt h2 line 81) / **22** (SplashScreen h1 line 58 "CBC 방재"). §1.1 9·10·11px 위반. 어디까지 격상?
  - **default 답: 부분 절충** — fontSize:10 (버전) → `text-caption leading-none` (12 격상, §1.1 위반 강도 최대 강제 상향) / fontSize:11 (진행 텍스트 + Step 서브 + 다른 위반) → `text-caption leading-none` (12 + leading-none, §1.1 위반 일괄 상향, 마이그레이션 §4.2) / fontSize:12 (부제 + 노란 경고 + 나중에 버튼) → `text-caption leading-none` 유지 (dense 영역 + lineHeight:1.5 명시는 leading-relaxed 유지 — InstallPrompt 부제만 `<br/>` 2줄 부제라 leading-relaxed 유지) / fontSize:13 (Step 타이틀 + 숫자 원 + 확인 버튼) → `text-label leading-none` 유지 / fontSize:15 (설치 버튼) → `text-body font-bold` (16 격상 CTA 강조 + 노안 친화 강화) / fontSize:16 (특수 글리프 ⋮ ⎋ inline) → 콘텐츠 글리프 유지 / fontSize:18 (h2) → `text-title font-extrabold` (fontWeight 800) / fontSize:22 (h1 splash) → `text-heading font-black tracking-tight` (fontWeight 900 + letterSpacing -.02em). 17-annual-plan W1 OQ #3 부분 절충 패턴 mirror.

- **OQ #4**: 외곽 hex 인라인 — SplashScreen `#161b22` (page bg, line 39) / InstallPrompt 카드 `#1c2128` (line 65) / 텍스트 hex `#e6edf3` (primary, line 58/81/122/129/136/160/177/194) + `#8b949e` (secondary, line 84/123/130/137/163/180/197) + `#6e7681` (tertiary, line 59/68/106) + `#3d444d` (disabled, line 73) — 디자인 토큰 (`bg-surface-page` / `bg-surface-raised` / `text-text-primary` / `-secondary` / `-tertiary` / `-disabled`) 치환 OK? 노란 경고 박스 3 색 (`#f59e0b` + `rgba(245,158,11,0.1)` + `rgba(245,158,11,0.25)`, line 115) 도 `text-warning + bg-warning-bg + border-warning/25` 알리아스 토큰화 OK?
  - **default 답: 토큰 치환 OK** — status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`). 인라인 hex/rgba 다수 (page bg 1, card bg 1, text 4종, 노란 경고 박스 3 색, 숫자 원 2 색, 진행 바 트랙 alpha 1, 카드 border alpha 1, 오버레이 alpha 1, 카드 boxShadow 1) 중 토큰 대응 명확한 ~10개 치환 (page/card bg + text 4종 + 노란 경고 3색 + 숫자 원 2색), 인라인 잔존 4개 (진행 바 트랙 `rgba(255,255,255,0.07)` + 카드 border `rgba(59,130,246,0.3)` + 오버레이 `rgba(0,0,0,0.85)` + 카드 boxShadow `0 8px 40px rgba(0,0,0,0.5)`) 는 단일 사용처 + alpha 정밀도 + design-system 토큰과 차이 (오버레이 0.85 vs --surface-overlay 0.6 / 카드 boxShadow 룰 §6.7 위반 후보) 라 인라인 유지. 17-annual-plan W1 OQ #4 일관 패턴.

- **OQ #5**: 특수 글리프 ⋮ (Android 가이드 line 122, U+22EE) / ⎋ (iOS 가이드 line 164, U+238B) — Lucide `MoreVertical` / `Share` 교체 vs 콘텐츠 글리프 유지?
  - **default 답: 콘텐츠 글리프 유지** — 27-login OQ #4 ☎ 와 동일 룰 (전화번호 표기 콘텐츠). 사용자가 실제 Android Chrome 우상단 메뉴 / iOS Safari 하단 공유 버튼 UI 에서 볼 글리프와 1:1 매칭 → 교체 시 인지 부조화 (Lucide MoreVertical 은 추상화된 점 3개 — 실제 OS UI 와 시각 차이 가능). fontSize:16 inline span 형태 유지 (line 122 verticalAlign 무 / line 164 verticalAlign:'middle' — line 164 의 verticalAlign:'middle' 은 Safari 하단 공유 버튼 글리프가 행 가운데 정렬되도록 한 의도된 차이, 1 byte 변경 금지). 단 W5 verify gate 에서 emoji-0 grep 검사 시 ⋮ ⎋ 는 예외 처리 (U+22EE / U+238B anchor — emoji range 가 아닌 Vertical Ellipsis / Broken Circle With Northwest Arrow). memory `feedback_tsx_wave_emoji_dot_gap` 의 예외 결정 룰 inline 박제 (§5 룰 8).

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

본 문서가 후속 wave 진입 자격을 갖췄는지 verify:

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. 7 헤더 존재 | `grep -c '^# §[1-7]' wave-1-index.md` | =7 |
| 2. sub-wave 분배 표 ≥4 | `grep -E '^\| W[2-5] \|' wave-1-index.md \| wc -l` | ≥4 |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 4. negative §6 안 wrangler+npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/pages/SplashScreen.tsx cha-bio-safety/src/components/InstallPrompt.tsx cha-bio-safety/src/utils/pwaInstall.ts cha-bio-safety/src/utils/versionCheck.ts` | 0 lines |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]' wave-1-index.md` | ≥5 |
| 7. design-system fence ≥6 (open+close) | `grep -c '^```' wave-1-index.md` | ≥6 |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 5건 답변으로 받는다.

다음 wave 파일명: `sketch-wave-2-splash.html` (OQ #1 답변 후 `/clear` + 새 `/gsd:quick` 시작 권장 — memory `feedback_gsd_workflow_strict`).
