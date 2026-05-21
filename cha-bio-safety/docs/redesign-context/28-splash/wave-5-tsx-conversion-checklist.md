---
title: "redesign/28-splash — wave 5 (TSX conversion checklist)"
status: pending  # TSX 변환 wave 시작 전 사용자 컨펌 후 in-progress
created: 2026-05-22
quick_id: 260522-2q6
branch: redesign/28-splash
source_tsx_1: cha-bio-safety/src/pages/SplashScreen.tsx
source_tsx_1_lines: 83
source_tsx_2: cha-bio-safety/src/components/InstallPrompt.tsx
source_tsx_2_lines: 237
source_util_1: cha-bio-safety/src/utils/pwaInstall.ts (수정 0)
source_util_2: cha-bio-safety/src/utils/versionCheck.ts (수정 0)
sketch_sources:
  - cha-bio-safety/docs/redesign-context/28-splash/sketch-wave-2-splash.html
  - cha-bio-safety/docs/redesign-context/28-splash/sketch-wave-3-install-main.html
  - cha-bio-safety/docs/redesign-context/28-splash/sketch-wave-4-install-guides.html
mirror_of: cha-bio-safety/docs/redesign-context/17-annual-plan/wave-5-tsx-conversion-checklist.md (260522-0j3)
oq_locked:
  - "OQ #1 — InstallPrompt 설치 버튼 bg-safe-bar solid + 그라데이션 폐기 (W3 + 본 wave §3.2 / §4)"
  - "OQ #2 — SplashScreen 진행 바 bg-accent solid + 그라데이션 폐기 (W2 + 본 wave §3.1 / §4)"
  - "OQ #3 — 폰트 격상 매핑 verbatim (W2~W4 + 본 wave §3.1~§3.4 / §4)"
  - "OQ #4 — 토큰 치환 + 인라인 유지 4건 (트랙 / 카드 border / 오버레이 / boxShadow) (W2~W4 + 본 wave §3.1~§3.4 / §4)"
  - "OQ #5 — iOS ⋮ U+22EE + ⎋ U+238B 글리프 fontSize 16 + verticalAlign middle 보존 (W4 + 본 wave §3.3 / §3.4 / §4 / §5)"
---

# redesign/28-splash — wave 5 (TSX conversion checklist)

본 문서는 redesign/28-splash 의 sketch 3 wave (W2 splash + W3 install-main + W4 install-guides) 결정을 토대로
`SplashScreen.tsx` (83 lines) + `InstallPrompt.tsx` (237 lines) **2 파일 단일 atomic 변환**을 위한 **verify checklist** 다.
**sketch 가 아닌 markdown** — 본 wave 작성 후 사용자 시각 검수 → 다음 quick task (W6 — TSX 변환) 진입 직전
본 checklist 의 §3 매핑 표 verbatim + §5/§6/§7/§8 verify gate 그대로 적용.

mirror_of: 17-annual-plan/wave-5-tsx-conversion-checklist.md (260522-0j3). 차이점 = 단일 파일 변환이 아닌 2 파일 단일 atomic 변환 +
OQ 결정 내용 변경 (설치 버튼 그라데이션 + 진행 바 그라데이션 2건 모두 폐기 + ⋮ ⎋ 글리프 보존).

---

## §1. 변환 범위 + 산출 파일

- **2 파일 단일 atomic 변환**:
  - `cha-bio-safety/src/pages/SplashScreen.tsx` (83 lines → 약 90~110 lines 예상)
  - `cha-bio-safety/src/components/InstallPrompt.tsx` (237 lines → 약 250~290 lines 예상)
  - Tailwind v0.1.1 className 으로 인라인 style 치환
- W2 (SplashScreen 전체) + W3 (InstallPrompt 메인 view) + W4 (InstallPrompt Android + iOS 가이드 view) 3 sketch 결정 → className 1:1 매핑
- **components.css 신규 생성 X** (페이지 로컬 인라인 토큰 유지)
- **`pwaInstall.ts` + `versionCheck.ts` 변경 0** (PWA 이벤트 구독 + 버전 체크 비즈 보존)
- **★ 비즈 anchor 16건 (SplashScreen 8 + InstallPrompt 8) 1 byte 변경 금지** (§2 박스)
- 비즈 로직 0 diff (state/handler/effect/hook 모두 보존, §10 체크박스)

산출 (W6 wave 의 expected output):
1. `SplashScreen.tsx` + `InstallPrompt.tsx` 2 파일 단일 atomic 변환 완료 (in-place)
2. atomic commit 1개: `feat(28-splash): W6 TSX 변환 (v0.1.1 className 매핑 + 비즈 anchor 16건 보존 + ⋮ ⎋ 글리프 anchor)`
3. `pwaInstall.ts` + `versionCheck.ts` 변경 0 byte (final verify gate)

---

## §2. 보존 (비즈 anchor 16건 박스 — 1 byte 변경 금지)

### ★ SplashScreen 8건 (line 별, `SplashScreen.tsx`)

```
1. __APP_VERSION__ Vite define (line 73, `v{__APP_VERSION__} · 경기도 성남시 분당구`)
2. @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} } (line 79)
3. 48ms setInterval tick (line 18: setInterval(() => setPct(p => Math.min(p + 4, 100)), 48))
4. 1600ms setTimeout (line 26: setTimeout(... , 1600))
5. +4 increment per tick (line 18: p + 4)
6. checkVersionAndRefresh() void 호출 (line 16)
7. isAuthenticated ? '/dashboard' : '/login' 분기 (line 24, 34)
8. shouldShowInstallPrompt() 분기 (line 21)
```

### ★ InstallPrompt 8건 (line 별, `InstallPrompt.tsx`)

```
1. isStandalone() (line 5~10, iOS standalone + display-mode standalone/fullscreen 3분기)
2. isIOS() (line 12~17, iPhone/iPad/iPod + Macintosh+maxTouchPoints fallback)
3. getDeferredInstallPrompt / subscribeInstallPrompt / showInstallPrompt import (line 2)
4. shouldShowInstallPrompt() export (line 224~233, isStandalone() + 24h TTL)
5. dismissInstallPrompt() export (line 235~237, localStorage.setItem)
6. localStorage key 'pwa-install-dismissed' + TTL 24 * 60 * 60 * 1000
7. outcome 3 분기: 'accepted' → onDismiss / 'unavailable' → setShowAndroidGuide(true) / 'dismissed' → no-op (line 40~47)
8. 3 view state: 메인 (!showIOSGuide && !showAndroidGuide) / Android (showAndroidGuide) / iOS (else) — line 88~215
```

### 비즈 로직 보존 표 (line 별)

| file | line | 항목 | 보존 방식 |
|---|---|---|---|
| SplashScreen.tsx | 1~5 | import 5개 (useEffect/useState / useNavigate / useAuthStore / InstallPrompt+shouldShow+dismiss / checkVersionAndRefresh) | 그대로 |
| SplashScreen.tsx | 7~35 | function body (state, useEffect, handleDismiss) | 그대로 |
| SplashScreen.tsx | 16 | `void checkVersionAndRefresh()` | **1 byte 변경 금지** (★ PWA 캐시 anchor) |
| SplashScreen.tsx | 18 | `setInterval(() => setPct(p => Math.min(p + 4, 100)), 48)` | **1 byte 변경 금지** (★ 48ms tick + +4 increment) |
| SplashScreen.tsx | 26 | `setTimeout(... , 1600)` | **1 byte 변경 금지** (★ 1600ms) |
| SplashScreen.tsx | 21 | `shouldShowInstallPrompt()` 분기 | **1 byte 변경 금지** |
| SplashScreen.tsx | 24, 34 | `isAuthenticated ? '/dashboard' : '/login'` 분기 양쪽 | **1 byte 변경 금지** |
| SplashScreen.tsx | 38~82 | render (외곽 + 로고 + 타이틀 + 진행 바 + 버전 + InstallPrompt 마운트 + style) | **className 변환 대상** (§3.1) |
| SplashScreen.tsx | 73 | `v{__APP_VERSION__} · 경기도 성남시 분당구` | **1 byte 변경 금지** (★ __APP_VERSION__ Vite define) |
| SplashScreen.tsx | 79 | `@keyframes slideUp { from{...} to{...} }` | **1 byte 변경 금지** (★ animation anchor) |
| InstallPrompt.tsx | 1~2 | import (useState/useEffect + 3 pwaInstall 함수) | 그대로 |
| InstallPrompt.tsx | 5~17 | isStandalone() + isIOS() | **1 byte 변경 금지** (★ PWA 미설치 검출 anchor) |
| InstallPrompt.tsx | 25~55 | function body (state, useEffect, handleInstallAndroid, handleInstallIOS, ios) | 그대로 |
| InstallPrompt.tsx | 40~47 | outcome 3 분기 ('accepted' / 'unavailable' / 'dismissed') | **1 byte 변경 금지** |
| InstallPrompt.tsx | 57~219 | render (오버레이 + 카드 + 3 view state — 메인 / Android / iOS) | **className 변환 대상** (§3.2 / §3.3 / §3.4) |
| InstallPrompt.tsx | 122 | `<span style={{ fontSize: 16 }}>⋮</span>` | **1 byte 변경 금지** (★ OQ #5 LOCKED, Lucide 교체 X) |
| InstallPrompt.tsx | 164 | `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>` | **1 byte 변경 금지** (★ OQ #5 LOCKED, Lucide 교체 X) |
| InstallPrompt.tsx | 224~233 | shouldShowInstallPrompt() export (isStandalone + 24h TTL) | **1 byte 변경 금지** (★ PWA 미설치 신고 우선순위 anchor) |
| InstallPrompt.tsx | 235~237 | dismissInstallPrompt() export (localStorage 'pwa-install-dismissed') | **1 byte 변경 금지** |
| pwaInstall.ts | 전체 | beforeinstallprompt 이벤트 구독 + 3 export 함수 | **0 byte 변경 금지** |
| versionCheck.ts | 전체 | __APP_VERSION__ + checkVersionAndRefresh export | **0 byte 변경 금지** |

---

## §3. 변환 매핑 (영역별 className/토큰/폰트 — W2/W3/W4 sketch verbatim 인용)

### §3.1 SplashScreen — 외곽 + 로고 + 타이틀 + 진행 바 + 버전 (line 38~82, W2 sketch 출처)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| 외곽 div `minHeight:'100dvh', background:'#161b22'` (line 38~43) | `className="bg-surface-page"` + `style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:0 }}` (OQ #4 LOCKED) | W2 |
| 로고 박스 wrapper `animation:'slideUp .4s ease-out', display:'flex', flexDirection:'column', alignItems:'center', gap:20, marginBottom:56` (line 45) | 인라인 유지 (animation anchor) | W2 |
| 로고 박스 `width:88, height:88, borderRadius:22, background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)'` (line 47~52) | `className="rounded-[22px]"` + `style={{ width:88, height:88, background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}` (OQ #4 인라인 유지 중 일부) | W2 |
| 타이틀 h1 `fontSize 22 fontWeight 900 color #e6edf3 letterSpacing -.02em` (line 58) | `className="text-heading font-black tracking-tight text-text-primary"` + `style={{ margin:0 }}` (OQ #3 LOCKED 22→text-heading) | W2 |
| 부제 p `fontSize twelve color #6e7681 letterSpacing .1em` (line 59) | `className="text-caption leading-relaxed text-text-tertiary"` + `style={{ margin:'6px 0 0', letterSpacing:'.1em' }}` (OQ #3 LOCKED 12 유지 + leading-relaxed) | W2 |
| 진행 바 트랙 `height:2, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden'` (line 65) | 인라인 유지 (★ OQ #4 인라인 유지 1/4 — 진행 바 트랙 alpha 정밀도) | W2 |
| 진행 바 fill `background:'linear-gradient(90deg,#3b82f6,#0ea5e9)'` (line 66) | `className="bg-accent"` + `style={{ height:'100%', borderRadius:2, width:`${pct}%`, transition:'width .05s linear' }}` (★ OQ #2 LOCKED solid, 그라데이션 폐기) | W2 |
| 진행 라벨 p `fontSize eleven color #6e7681 textAlign center marginTop 10` (line 68) | `className="text-caption leading-none text-text-tertiary"` + `style={{ textAlign:'center', marginTop:10 }}` (OQ #3 LOCKED 11→12 격상) | W2 |
| 버전 p `fontSize ten color #3d444d position absolute bottom 20` (line 73) | `className="text-caption leading-none text-text-disabled"` + `style={{ position:'absolute', bottom:20 }}` (OQ #3 LOCKED 10→12 격상 + OQ #4 #3d444d → text-text-disabled) | W2 |
| `@keyframes slideUp` (line 79) | 인라인 유지 (animation anchor) | W2 |

### §3.2 InstallPrompt 메인 view — 오버레이 + 카드 + 아이콘 + 제목 + 설치 버튼 + 나중에 (line 57~111, W3 sketch 출처)

| 현재 | 변환 후 | sketch |
|---|---|---|
| 오버레이 `position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', padding:24` (line 58~63) | 인라인 유지 (★ OQ #4 인라인 유지 2/4 — 오버레이 alpha 정밀도) | W3 |
| 카드 `background:'#1c2128', borderRadius:20, padding:'28px 24px', maxWidth:340, width:'100%', textAlign:'center', border:'1px solid rgba(59,130,246,0.3)', boxShadow:'0 8px 40px rgba(0,0,0,0.5)'` (line 64~70) | `className="bg-surface-raised rounded-[20px]"` + `style={{ padding:'28px 24px', maxWidth:340, width:'100%', textAlign:'center', border:'1px solid rgba(59,130,246,0.3)', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}` (OQ #4 카드 토큰 + ★ 인라인 유지 3/4 border + ★ 인라인 유지 4/4 boxShadow) | W3 |
| 아이콘 박스 `width:64, height:64, borderRadius:16, margin:'0 auto 16px', background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)'` (line 72~77) | `className="rounded-lg"` + `style={{ width:64, height:64, margin:'0 auto 16px', background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}` (OQ #4 인라인 rgba 유지) | W3 |
| 제목 h2 `fontSize eighteen fontWeight 800 color #e6edf3 margin '0 0 8px'` (line 81) | `className="text-title font-extrabold text-text-primary"` + `style={{ margin:'0 0 8px' }}` (OQ #3 LOCKED 18→text-title) | W3 |
| 부제 p `fontSize twelve color #8b949e margin '0 0 20px' lineHeight 1.5` (line 84) | `className="text-caption leading-relaxed text-text-secondary"` + `style={{ margin:'0 0 20px' }}` (OQ #3 LOCKED 12 유지 + leading-relaxed + OQ #4 #8b949e → text-text-secondary) | W3 |
| 설치 버튼 `width:'100%', height:48, borderRadius:12, background:'linear-gradient(135deg, #2563eb, #0ea5e9)', border:'none', color:'#fff', fontSize fifteen, fontWeight:700, cursor:'pointer'` (line 92~98) | `className="bg-safe-bar text-text-on-accent text-body font-bold rounded-md"` + `style={{ width:'100%', height:48, border:'none', cursor:'pointer' }}` (★ OQ #1 LOCKED solid + OQ #3 LOCKED 15→16 격상, 그라데이션 폐기) | W3 |
| 나중에 할게요 `width:'100%', height:40, borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#6e7681', fontSize twelve, fontWeight:600, cursor:'pointer'` (line 101~108) | `className="text-caption font-bold leading-none text-text-tertiary rounded-md"` + `style={{ width:'100%', height:40, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer' }}` (OQ #3 LOCKED 12 유지 + OQ #4 #6e7681 → text-text-tertiary) | W3 |

### §3.3 InstallPrompt Android 가이드 — 노란 경고 + 3-step + 확인했습니다 (line 112~147, W4 sketch 출처)

| 현재 | 변환 후 | sketch |
|---|---|---|
| 노란 경고 `fontSize twelve color #f59e0b background 'rgba(245,158,11,0.1)' border '1px solid rgba(245,158,11,0.25)' borderRadius 8 padding '8px 10px' marginBottom 14` (line 115) | `className="text-caption leading-relaxed text-warning bg-warning-bg border-warning/25 rounded-sm"` + `style={{ border:'1px solid', padding:'8px 10px', marginBottom:14 }}` (OQ #4 LOCKED warning 토큰 3종) | W4 frame 1/3 |
| 숫자 원 `width:28, height:28, borderRadius:8, flexShrink:0, background:'rgba(59,130,246,0.15)', color:'#3b82f6', display flex, alignItems center, justifyContent center, fontSize thirteen, fontWeight:800` (line 120/127/134) | `className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm"` + `style={{ width:28, height:28, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}` (OQ #4 LOCKED + OQ #3 LOCKED 13 text-label) | W4 |
| step 제목 `fontSize thirteen fontWeight 700 color #e6edf3` (line 122/130/136) | `className="text-label leading-none text-text-primary"` + `style={{ fontWeight:700 }}` (OQ #3 LOCKED 13 text-label) | W4 |
| step 하위 설명 `fontSize eleven color #8b949e marginTop 2` (line 123/131/137) | `className="text-caption leading-relaxed text-text-secondary"` + `style={{ marginTop:2 }}` (OQ #3 LOCKED 11→12 격상 + OQ #4 #8b949e → text-text-secondary) | W4 |
| `<strong style={{ color: '#e6edf3' }}>` 강조 (line 130/137) | `<strong className="text-text-primary">` (OQ #4 LOCKED) | W4 |
| **★ Android ⋮ 글리프 `<span style={{ fontSize: 16 }}>⋮</span>` (line 122)** | **인라인 100% 유지 — OQ #5 LOCKED, Lucide 교체 X** | W4 frame 1/3 |
| 확인했습니다 버튼 `width:'100%', height:44, borderRadius:10, marginTop:18, background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)', color:'#3b82f6', fontSize thirteen, fontWeight:700, cursor:'pointer'` (line 142~143) | `className="bg-accent/15 text-accent text-label font-bold leading-none rounded-md"` + `style={{ width:'100%', height:44, marginTop:18, border:'1px solid rgba(59,130,246,0.3)', cursor:'pointer' }}` (OQ #4 LOCKED 인라인 border 유지 + OQ #3 LOCKED 13 text-label) | W4 |

### §3.4 InstallPrompt iOS 가이드 — 3-step + ⎋ 글리프 + 확인했습니다 (line 148~215, W4 sketch 출처)

| 현재 | 변환 후 | sketch |
|---|---|---|
| (노란 경고 없음 — Android only) | (해당 없음) | W4 frame 2 |
| 숫자 원 (line 153~158/170~175/186~191) | 동일 (Android 와 동일 className/style) | W4 frame 2 |
| step 제목 (line 160/177/194) | 동일 | W4 frame 2 |
| step 하위 설명 (line 163/180/197) | 동일 | W4 frame 2 |
| **★ iOS ⎋ 글리프 `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>` (line 164)** | **인라인 100% 유지 — OQ #5 LOCKED, verticalAlign 'middle' 보존, Lucide 교체 X** | W4 frame 2 |
| 확인했습니다 버튼 (line 204~210) | 동일 (Android 와 동일 className/style) | W4 frame 2 |

---

## §4. OQ LOCKED 5건 변환 결과 반영 (W1 §7 verbatim + 코드 적용 line 범위)

```
OQ #1 LOCKED (InstallPrompt 설치 버튼 bg-safe-bar solid + 그라데이션 완전 폐기):
  - line 92~98 (설치 버튼): background 'linear-gradient(135deg, #2563eb, #0ea5e9)' → className "bg-safe-bar text-text-on-accent"
  - 그라데이션 0건 강제 (grep gate)
  - 영향: InstallPrompt.tsx line 92~98

OQ #2 LOCKED (SplashScreen 진행 바 bg-accent solid + 그라데이션 완전 폐기):
  - line 66 (진행 바 fill): background 'linear-gradient(90deg,#3b82f6,#0ea5e9)' → className "bg-accent"
  - line 65 (진행 바 트랙): background 'rgba(255,255,255,0.07)' 인라인 유지
  - 그라데이션 0건 강제 (grep gate)
  - 영향: SplashScreen.tsx line 65~66

OQ #3 LOCKED (폰트 격상 verbatim):
  - SplashScreen line 58 타이틀 22 → "text-heading font-black tracking-tight"
  - SplashScreen line 59 부제 12 → "text-caption leading-relaxed" (유지)
  - SplashScreen line 68 진행 라벨 11 → "text-caption leading-none" (11→12 격상)
  - SplashScreen line 73 버전 10 → "text-caption leading-none" (10→12 격상)
  - InstallPrompt line 81 카드 제목 18 → "text-title font-extrabold"
  - InstallPrompt line 84 카드 부제 12 → "text-caption leading-relaxed" (유지)
  - InstallPrompt line 96 설치 버튼 15 → "text-body font-bold" (15→16 격상)
  - InstallPrompt line 106 나중에 할게요 12 → "text-caption font-bold leading-none" (유지)
  - InstallPrompt line 115 노란 경고 12 → "text-caption leading-relaxed"
  - InstallPrompt line 120/127/134/154/171/187 숫자 원 13 → "text-label font-extrabold leading-none"
  - InstallPrompt line 122/130/136/160/177/194 step 제목 13 → "text-label leading-none"
  - InstallPrompt line 123/131/137/163/180/197 하위 설명 11 → "text-caption leading-relaxed" (11→12 격상)
  - InstallPrompt line 143/209 확인했습니다 버튼 13 → "text-label font-bold leading-none"
  - InstallPrompt line 122/164 글리프 인라인 fontSize:16 유지 (OQ #5 LOCKED 예외)

OQ #4 LOCKED (토큰 치환 + 인라인 유지 4건):
  - 페이지 background #161b22 → "bg-surface-page" (SplashScreen line 39)
  - 카드 background #1c2128 → "bg-surface-raised" (InstallPrompt line 65)
  - text #e6edf3 → "text-text-primary" (다수)
  - text #8b949e → "text-text-secondary" (다수)
  - text #6e7681 → "text-text-tertiary" (다수)
  - text #3d444d → "text-text-disabled" (SplashScreen line 73)
  - 노란 경고 3종 → "text-warning bg-warning-bg border-warning/25" (InstallPrompt line 115)
  - 숫자 원 + 확인했습니다 → "bg-accent/15 text-accent" (InstallPrompt 다수)
  - **인라인 유지 4건**:
    * SplashScreen line 65 진행 바 트랙 rgba(255,255,255,0.07)
    * InstallPrompt line 68 카드 border rgba(59,130,246,0.3)
    * InstallPrompt line 59 오버레이 rgba(0,0,0,0.85)
    * InstallPrompt line 69 boxShadow '0 8px 40px rgba(0,0,0,0.5)'

OQ #5 LOCKED (iOS ⋮ ⎋ 글리프 인라인 보존):
  - InstallPrompt line 122 `<span style={{ fontSize: 16 }}>⋮</span>` 100% 유지 (Android Chrome 메뉴 시그니처, U+22EE)
  - InstallPrompt line 164 `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>` 100% 유지 (iOS Safari 공유 시그니처, U+238B)
  - Lucide 교체 금지 (글꼴 의미 anchor)
  - emoji negative grep 시 [emoji block] 패턴은 ⋮ ⎋ 매칭 X (Unicode 블록 외부 codepoint)
```

---

## §5. negative gate (TSX 변환 후 2 파일 모두 통과해야 할 grep gate)

```bash
# 1. 이모지 0건 — 단, ⋮ (U+22EE) + ⎋ (U+238B) 예외 anchor
#    InstallPrompt.tsx 안 ⋮ ⎋ 는 OQ #5 LOCKED 정상. Emoji 블록 외부 codepoint 이므로 emoji range grep 매칭 안 됨.
#    (확인: grep -P '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' 같은 emoji 패턴 카운트)
grep -cE '[😀-🙏🚀-🛿🤀-🧿]' cha-bio-safety/src/pages/SplashScreen.tsx == 0
grep -cE '[😀-🙏🚀-🛿🤀-🧿]' cha-bio-safety/src/components/InstallPrompt.tsx == 0

# 2. linear-gradient 0건 (OQ #1 + OQ #2 LOCKED — 설치 버튼 + 진행 바 그라데이션 폐기)
grep -c 'linear-gradient' cha-bio-safety/src/pages/SplashScreen.tsx == 0
grep -c 'linear-gradient' cha-bio-safety/src/components/InstallPrompt.tsx == 0

# 3. 9·10·11px 0건 (OQ #3 LOCKED 격상 결과 — 단 fontSize:16 글리프 OQ #5 예외)
grep -v '^\s*//' cha-bio-safety/src/pages/SplashScreen.tsx | grep -cE 'fontSize:\s*(9|10|11)[^0-9px]|font-size:\s*(9|10|11)[^0-9px]' == 0
grep -v '^\s*//' cha-bio-safety/src/components/InstallPrompt.tsx | grep -cE 'fontSize:\s*(9|10|11)[^0-9px]|font-size:\s*(9|10|11)[^0-9px]' == 0

# 4. status- prefix 0건
grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/src/pages/SplashScreen.tsx == 0
grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/src/components/InstallPrompt.tsx == 0

# 5. w-8 / h-8 0건 (w-8=48 함정)
grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/src/pages/SplashScreen.tsx == 0
grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/src/components/InstallPrompt.tsx == 0

# 6. 옛 alias 토큰 0건
grep -cE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent)\)' cha-bio-safety/src/pages/SplashScreen.tsx == 0
grep -cE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent)\)' cha-bio-safety/src/components/InstallPrompt.tsx == 0

# 7. 비즈 anchor 16건 보존 (★ 1 byte 변경 금지)
grep -c '__APP_VERSION__' cha-bio-safety/src/pages/SplashScreen.tsx >= 1
grep -c '@keyframes slideUp' cha-bio-safety/src/pages/SplashScreen.tsx >= 1
grep -c ', 48' cha-bio-safety/src/pages/SplashScreen.tsx >= 1   # setInterval 48ms tick
grep -c '1600' cha-bio-safety/src/pages/SplashScreen.tsx >= 1   # setTimeout 1600ms
grep -c 'p + 4' cha-bio-safety/src/pages/SplashScreen.tsx >= 1  # +4 increment per tick
grep -c 'checkVersionAndRefresh' cha-bio-safety/src/pages/SplashScreen.tsx >= 1
grep -c 'shouldShowInstallPrompt' cha-bio-safety/src/pages/SplashScreen.tsx >= 1
grep -c "isAuthenticated ? '/dashboard' : '/login'" cha-bio-safety/src/pages/SplashScreen.tsx >= 2

grep -c 'isStandalone' cha-bio-safety/src/components/InstallPrompt.tsx >= 2  # 정의 + 사용
grep -c 'isIOS' cha-bio-safety/src/components/InstallPrompt.tsx >= 2
grep -c 'subscribeInstallPrompt\|getDeferredInstallPrompt\|showInstallPrompt' cha-bio-safety/src/components/InstallPrompt.tsx >= 3
grep -c 'shouldShowInstallPrompt' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c 'dismissInstallPrompt' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c "'pwa-install-dismissed'" cha-bio-safety/src/components/InstallPrompt.tsx >= 2
grep -c '24 \* 60 \* 60 \* 1000' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # 24h TTL
grep -c "'accepted'\|'unavailable'\|'dismissed'" cha-bio-safety/src/components/InstallPrompt.tsx >= 2

# 8. 특수 글리프 보존 (★ OQ #5 LOCKED, 1 byte 변경 금지)
grep -c '⋮' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # Android Chrome 메뉴 U+22EE
grep -c '⎋' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # iOS Safari 공유 U+238B
grep -c "verticalAlign: 'middle'" cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # iOS ⎋ 글리프
```

---

## §6. positive gate (변환 후 등장해야 할 패턴)

```bash
# 1. v0.1.1 토큰 class 카운트
grep -c 'bg-surface-page' cha-bio-safety/src/pages/SplashScreen.tsx >= 1
grep -c 'bg-surface-raised' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c 'bg-safe-bar' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # 설치 버튼 OQ #1
grep -c 'text-text-on-accent' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c 'bg-accent' cha-bio-safety/src/pages/SplashScreen.tsx >= 1  # 진행 바 fill OQ #2
grep -c 'bg-accent/15' cha-bio-safety/src/components/InstallPrompt.tsx >= 4  # 숫자 원 6 + 확인했습니다 2
grep -c 'text-accent' cha-bio-safety/src/components/InstallPrompt.tsx >= 4
grep -c 'text-warning' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # Android 노란 경고
grep -c 'bg-warning-bg' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c 'border-warning/25' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c 'text-text-primary' cha-bio-safety/src/components/InstallPrompt.tsx >= 3
grep -c 'text-text-secondary' cha-bio-safety/src/components/InstallPrompt.tsx >= 3
grep -c 'text-text-tertiary' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c 'text-text-tertiary' cha-bio-safety/src/pages/SplashScreen.tsx >= 1  # 진행 라벨
grep -c 'text-text-disabled' cha-bio-safety/src/pages/SplashScreen.tsx >= 1  # 버전

# 2. 폰트 토큰 (OQ #3 LOCKED 격상)
grep -c 'text-heading' cha-bio-safety/src/pages/SplashScreen.tsx >= 1   # 타이틀 22
grep -c 'text-title' cha-bio-safety/src/components/InstallPrompt.tsx >= 1   # 카드 제목 18
grep -c 'text-body' cha-bio-safety/src/components/InstallPrompt.tsx >= 1   # 설치 버튼 15→16
grep -c 'text-label' cha-bio-safety/src/components/InstallPrompt.tsx >= 6  # step 제목 + 숫자 원 + 확인했습니다
grep -c 'text-caption' cha-bio-safety/src/pages/SplashScreen.tsx >= 3  # 부제 + 진행 라벨 + 버전
grep -c 'text-caption' cha-bio-safety/src/components/InstallPrompt.tsx >= 6  # 부제 + 나중에 할게요 + 노란 경고 + step 하위 설명 6
grep -c 'leading-none' cha-bio-safety/src/pages/SplashScreen.tsx >= 2
grep -c 'leading-relaxed' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c 'font-black' cha-bio-safety/src/pages/SplashScreen.tsx >= 1  # 타이틀
grep -c 'tracking-tight' cha-bio-safety/src/pages/SplashScreen.tsx >= 1  # 타이틀
grep -c 'font-extrabold' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # 카드 제목

# 3. 인라인 유지 4건 (OQ #4 LOCKED)
grep -c 'rgba(255,255,255,0.07)' cha-bio-safety/src/pages/SplashScreen.tsx >= 1  # 진행 바 트랙
grep -c 'rgba(59,130,246,0.3)' cha-bio-safety/src/components/InstallPrompt.tsx >= 2  # 카드 border + 아이콘 박스 + 확인했습니다 버튼
grep -c 'rgba(0,0,0,0.85)' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # 오버레이
grep -c 'boxShadow.*rgba(0,0,0,0.5)\|0 8px 40px rgba(0,0,0,0.5)' cha-bio-safety/src/components/InstallPrompt.tsx >= 1

# 4. radius 토큰
grep -c 'rounded-\[22px\]' cha-bio-safety/src/pages/SplashScreen.tsx >= 1  # 로고 박스
grep -c 'rounded-\[20px\]' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # 카드
grep -c 'rounded-lg' cha-bio-safety/src/components/InstallPrompt.tsx >= 1  # 아이콘 박스 16
grep -c 'rounded-md' cha-bio-safety/src/components/InstallPrompt.tsx >= 3  # 설치 버튼 + 나중에 할게요 + 확인했습니다 2
grep -c 'rounded-sm' cha-bio-safety/src/components/InstallPrompt.tsx >= 7  # 노란 경고 + 숫자 원 6

# 5. 카피 verbatim
grep -c 'CBC 방재' cha-bio-safety/src/pages/SplashScreen.tsx >= 1
grep -c 'CBC 방재' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c '소방안전 통합관리 시스템' cha-bio-safety/src/pages/SplashScreen.tsx >= 1
grep -c '시스템 초기화 중\|데이터 불러오는 중\|준비 완료' cha-bio-safety/src/pages/SplashScreen.tsx >= 3
grep -c '경기도 성남시 분당구' cha-bio-safety/src/pages/SplashScreen.tsx >= 1
grep -c '홈 화면에 앱을 설치하면' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c '홈 화면에 설치\|설치 방법 보기' cha-bio-safety/src/components/InstallPrompt.tsx >= 2
grep -c '나중에 할게요' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c '자동 설치 창이 뜨지 않으면' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c '크롬 우상단' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c '하단 공유 버튼 터치' cha-bio-safety/src/components/InstallPrompt.tsx >= 1
grep -c '홈 화면에 추가' cha-bio-safety/src/components/InstallPrompt.tsx >= 3
grep -c '확인했습니다' cha-bio-safety/src/components/InstallPrompt.tsx >= 2
```

---

## §7. build / tsc gate

```bash
cd cha-bio-safety && npx tsc --noEmit                # 0 error
cd cha-bio-safety && npm run build                   # exit 0
# Splash/Install chunk size 확인
ls -la cha-bio-safety/dist/assets/SplashScreen-*.js
ls -la cha-bio-safety/dist/assets/InstallPrompt-*.js  # 또는 main 번들 안 포함
```

---

## §8. 자체 verify 명령 (TSX 변환 wave 진입 시점 + 완료 시점 양쪽 실행)

각 gate 의 grep/wc/git 명령을 fence 안에 verbatim 박제.

```bash
# 진입 시점: sketch 3 파일 모두 존재 확인
ls cha-bio-safety/docs/redesign-context/28-splash/sketch-wave-2-splash.html \
   cha-bio-safety/docs/redesign-context/28-splash/sketch-wave-3-install-main.html \
   cha-bio-safety/docs/redesign-context/28-splash/sketch-wave-4-install-guides.html

# 완료 시점: §5 negative + §6 positive + §7 build 모두 PASS

# pwaInstall.ts + versionCheck.ts 변경 0 확인 (TSX 변환 wave 끝나도 유지)
git diff HEAD -- cha-bio-safety/src/utils/pwaInstall.ts | wc -l == 0
git diff HEAD -- cha-bio-safety/src/utils/versionCheck.ts | wc -l == 0
```

---

## §9. Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑 표)

| v0.1.1 토큰 | Tailwind utility | 28-splash 적용 위치 |
|---|---|---|
| `--surface-page` | `bg-surface-page` | SplashScreen 외곽 |
| `--surface-raised` | `bg-surface-raised` | InstallPrompt 카드 |
| `--text-primary` | `text-text-primary` | 모든 제목 / step 본문 |
| `--text-secondary` | `text-text-secondary` | 부제 / step 하위 설명 |
| `--text-tertiary` | `text-text-tertiary` | "나중에 할게요" 버튼 / 진행 라벨 |
| `--text-disabled` | `text-text-disabled` | SplashScreen 버전 문자열 |
| `--safe-bar` | `bg-safe-bar` + `text-text-on-accent` | InstallPrompt 설치 버튼 (OQ #1) |
| `--accent` | `bg-accent` / `bg-accent/15` / `text-accent` | 진행 바 fill (OQ #2) / 숫자 원 / 확인했습니다 버튼 |
| `--warning` | `text-warning` / `bg-warning-bg` / `border-warning/25` | Android 노란 경고 (OQ #4) |
| (radius 8) | `rounded-sm` | 모든 step 카드 / 숫자 원 / 노란 경고 |
| (radius 10) | `rounded-md` | 나중에 할게요 / 확인했습니다 |
| (radius 12) | `rounded-md` | 설치 버튼 |
| (radius 16) | `rounded-lg` | InstallPrompt 아이콘 박스 |
| (radius 20) | `rounded-[20px]` | InstallPrompt 카드 (토큰 없음) |
| (radius 22) | `rounded-[22px]` | SplashScreen 로고 박스 (토큰 없음) |
| (인라인 유지 OQ #4) | `style={{ background:'rgba(255,255,255,0.07)' }}` | 진행 바 트랙 |
| (인라인 유지 OQ #4) | `style={{ border:'1px solid rgba(59,130,246,0.3)' }}` | 카드 border / 아이콘 박스 / 확인했습니다 버튼 |
| (인라인 유지 OQ #4) | `style={{ background:'rgba(0,0,0,0.85)' }}` | 오버레이 |
| (인라인 유지 OQ #4) | `style={{ boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}` | 카드 shadow |
| (인라인 유지 OQ #5) | `<span style={{ fontSize:16 }}>⋮</span>` | Android Chrome 메뉴 글리프 (U+22EE) |
| (인라인 유지 OQ #5) | `<span style={{ fontSize:16, verticalAlign:'middle' }}>⎋</span>` | iOS Safari 공유 글리프 (U+238B) |

---

## §10. 비즈 보존 체크박스 (TSX 변환 wave 완료 후 직접 체크)

### SplashScreen 8건

- [ ] `__APP_VERSION__` Vite define line 73 그대로 (1 byte 변경 금지)
- [ ] `@keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }` line 79 그대로
- [ ] `setInterval(() => setPct(p => Math.min(p + 4, 100)), 48)` line 18 그대로 (48ms tick + +4 increment)
- [ ] `setTimeout(... , 1600)` line 26 그대로 (1600ms)
- [ ] `checkVersionAndRefresh()` void 호출 line 16 그대로
- [ ] `shouldShowInstallPrompt()` 분기 line 21 그대로
- [ ] `isAuthenticated ? '/dashboard' : '/login'` 분기 line 24, 34 양쪽 그대로
- [ ] `useNavigate` / `useAuthStore` / `useState` (pct, showInstall) hook 보존

### InstallPrompt 8건

- [ ] `isStandalone()` 함수 line 5~10 그대로 (iOS standalone + display-mode standalone/fullscreen 3 분기)
- [ ] `isIOS()` 함수 line 12~17 그대로 (iPhone/iPad/iPod + Macintosh+maxTouchPoints fallback)
- [ ] `getDeferredInstallPrompt` / `subscribeInstallPrompt` / `showInstallPrompt` import line 2 그대로
- [ ] `shouldShowInstallPrompt()` export line 224~233 그대로 (isStandalone + 24h TTL 분기)
- [ ] `dismissInstallPrompt()` export line 235~237 그대로 (localStorage.setItem)
- [ ] localStorage key `'pwa-install-dismissed'` + TTL `24 * 60 * 60 * 1000` 그대로
- [ ] outcome 3 분기 `'accepted'` / `'unavailable'` / `'dismissed'` line 40~47 그대로
- [ ] 3 view state 구조 line 88~215 그대로 (메인 / Android / iOS)

### ★ 특수 글리프 OQ #5 (2건)

- [ ] InstallPrompt line 122 `<span style={{ fontSize: 16 }}>⋮</span>` (Android Chrome 메뉴 U+22EE) 1 byte 변경 금지
- [ ] InstallPrompt line 164 `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>` (iOS Safari 공유 U+238B) 1 byte 변경 금지

### ★ pwaInstall.ts + versionCheck.ts

- [ ] `pwaInstall.ts` export 0 byte 변경 (beforeinstallprompt 이벤트 구독)
- [ ] `versionCheck.ts` export 0 byte 변경

---

## §11. 메모리 룰 inline 인용 (W1 mirror, 12+ 룰 — 28-splash 특화 룰 2건 포함)

각 룰 작용 케이스 한 줄 — `feedback_*.md` 파일명 + How (28-splash 컨텍스트).

1. `feedback_design_sketch_first` — spacing/sizing 변경 시 sketch 먼저 컨펌. T1~T3 에서 진행 바 width / 카드 크기 / step gap 조정 시 sketch 먼저.
2. `feedback_redesign_sketch_rule_enforcement` — 설치 버튼 = CTA → `bg-safe-bar` solid (의미 anchor, OQ #1). `bg-status-safe-bg` 위험 색 사용 금지. 진행 바 fill = neutral → `bg-accent` (OQ #2). 노란 경고 = warning → `bg-warning-bg` + `text-warning` (OQ #4).
3. `feedback_sketch_realistic_data` — 카피 verbatim (CBC 방재 / 소방안전 통합관리 시스템 / 시스템 초기화 중 / 데이터 불러오는 중 / 준비 완료 / 경기도 성남시 분당구 / 홈 화면에 앱을 설치하면 더 빠르고 편리하게 / 홈 화면에 설치 / 설치 방법 보기 / 나중에 할게요 / 자동 설치 창이 뜨지 않으면 / 크롬 우상단 ⋮ 메뉴 / 앱 설치 / 홈 화면에 추가 / 설치 확인 / 하단 공유 버튼 터치 / Safari 하단의 ⎋ 공유 아이콘 / 추가 / 확인했습니다). 시안에서 변경 금지.
4. `feedback_planner_prompt_sketch_verbatim` — TSX 변환 진입 시 W2~W4 sketch 의 Tailwind class / CSS 토큰 grep 으로 추출 → 본 §3 verbatim 인용. 특히 ⋮ ⎋ 글리프 fontSize:16 / 카드 boxShadow 0 8px 40px / 진행 바 트랙 rgba(255,255,255,0.07) / 카드 border rgba(59,130,246,0.3) 모두 추측 X — sketch verbatim.
5. `feedback_tailwind_token_class_pattern` — 설치 버튼 그라데이션 → `bg-safe-bar` solid (OQ #1). `bg-status-safe-bar` (status- prefix) 사용 시 W5 verify FAIL. 진행 바 fill → `bg-accent` (OQ #2). 노란 경고 → `text-warning bg-warning-bg border-warning/25` (`status-warning` X). 숫자 원 → `bg-accent/15 text-accent`.
6. `feedback_tailwind_w8_h8_is_48px` — InstallPrompt 숫자 원 28x28 (line 120 etc.) → `w-8 h-8` 사용 시 48x48 (1.7배 확대 사고). `style={{ width:28, height:28 }}` 인라인 필수. SplashScreen 로고 88x88 도 동일 — 인라인 유지.
7. `feedback_text_caption_leading_none` — SplashScreen 진행 라벨 11px h≈18, 버전 10px h≈16 (작은 컨테이너) → `text-caption leading-none` (12 + leading-none). InstallPrompt 부제 12px lineHeight:1.5 (가독성 우선) → `text-caption leading-relaxed` (12 유지 + leading-relaxed). 노란 경고 12px padding 8px (작은 칩) → `text-caption leading-relaxed` (텍스트 wrap 가능성). step 제목 13px h≈18 (작은 컨테이너) → `text-label leading-none`. step 하위 설명 11→12 → `text-caption leading-relaxed`.
8. `feedback_tsx_wave_emoji_dot_gap` — sketch + TSX 본문 이모지 0건 강제. **단, ⋮ (U+22EE) + ⎋ (U+238B) 2 글리프는 OQ #5 LOCKED 예외 anchor — emoji 블록 외부 codepoint 이므로 [emoji block] grep 패턴 매칭 안 됨**. 카드 부제의 `<br/>` (line 85) 는 콘텐츠 줄바꿈, 이모지 아님.
9. `feedback_tsx_wave_stat_card_drift` — SplashScreen + InstallPrompt 에 Stat Card 28px display 숫자 없음 → §3.5 "미적용" 메타 명시 (본 페이지는 Stat Card 없음). 단, sketch 새 패턴 (진행률 매트릭스 + 가이드 3-step + iOS 글리프) 은 verbatim 인용해 W5 checklist 박제. source 의 `linear-gradient(135deg, #2563eb, #0ea5e9)` (line 94) + `linear-gradient(90deg,#3b82f6,#0ea5e9)` (line 66) 두 그라데이션이 sketch 의 `bg-safe-bar` + `bg-accent` 토큰 패턴을 덮어쓰지 않도록 명시.
10. `feedback_avoid_premature_confirmation` — TSX 변환 후 "approved 거의 일치" 자체 판단 금지. 결과 보여주고 사용자 판단. 특히 ⋮ ⎋ 글리프 시각 결과 (모바일 iOS Safari + Android Chrome 실기 확인) 는 사용자 판단 영역.
11. ★ `feedback_pwa_cache_invalidation` (28-splash 특화 — 캐시 갱신 anchor) — SplashScreen 의 `checkVersionAndRefresh()` (line 16) 는 PWA 캐시 무효화 핵심 시그니처. `__APP_VERSION__` 미스매치 시 `location.reload()` 호출. TSX 변환 시 이 호출 1 byte 변경 시 PWA 캐시가 배포 무시 (메모리 룰). 변경 금지.
12. ★ `feedback_ios_pwa_push_silent_drop` (28-splash 특화 — PWA 설치 anchor) — InstallPrompt 의 `isStandalone()` (line 5~10) + `shouldShowInstallPrompt()` (line 224~233) 는 PWA 미설치 시 푸시 silent drop 검출 첫 단추. 24h TTL (line 230) 도 미설치 신고 우선순위 anchor. 변경 금지.
13. `feedback_check_branch_before_edit` — TSX 변환 wave 진입 전 현재 branch 가 `redesign/28-splash` 인지 확인 (main 단일-trunk 운영, dirty 면 사용자 컨펌 먼저).

---

## §12. 다음 단계

1. 본 wave (W5 checklist) 작성 완료 → 4 commit + push (orchestrator cherry-pick 으로 부모 머지).
2. 사용자 시각 검수 — cbc7119-preview 배포 사이클 1회 (main 머지 후 자동) — sketch 3 HTML 직접 열어 frame 진행률 매트릭스 + 가이드 ⋮ ⎋ 글리프 시각 확인 (Android Chrome + iOS Safari 양쪽 실기 확인 권장).
3. 사용자 컨펌 받으면 **다음 quick task 시작** (`/clear` 권장 — memory `feedback_gsd_workflow_strict`) — TSX 변환 wave 진입.
   - 새 quick id (예: 260523-XX) 생성
   - PLAN: 1 task (W6 — 2 파일 단일 atomic 변환), action = §3 매핑 표 verbatim + §5/§6/§7/§8 verify gate 그대로 적용
   - 산출: SplashScreen.tsx + InstallPrompt.tsx 2 파일 atomic 수정 + atomic commit 1개 (`feat(28-splash): W6 TSX 변환 ...`)
4. TSX 변환 wave 완료 → 사용자 시각 검수 → main 머지 → cbc7119-preview 배포 → 직원도메인 별도 배포 (메모리 `feedback_deploy_test` 룰 — design 작업은 사용자 명시 컨펌 후만).
5. 28-splash 완결 status 메모 (memory `project_redesign_*_status` 패턴).

---

## § 자체 verify (본 W5 checklist 가 통과해야 할 gate)

- 4 src 파일 (SplashScreen.tsx + InstallPrompt.tsx + pwaInstall.ts + versionCheck.ts) 모두 변경 0 (`git diff HEAD~4 HEAD -- {4 paths}` empty)
- 12 섹션 헤더 ≥1 each (§1~§12)
- verify 명령 fence ≥4 (§5/§6/§7/§8)
- sketch 출처 frontmatter sketch_sources 3개 (W2/W3/W4) 모두 존재 확인 (test -f)
- OQ #1~#5 인용 ≥5건
- 메모리 룰 ≥12 인용 (10 기본 + 28-splash 특화 PWA cache + iOS PWA push 2건)
- 비즈 anchor 16건 (SplashScreen 8 + InstallPrompt 8) 모두 verbatim 박제
- 특수 글리프 ⋮ ⎋ 2건 박제 (U+22EE + U+238B + verticalAlign 인용)
