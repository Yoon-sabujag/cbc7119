---
phase: 260420-fri-splash-version-cache
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/vite.config.ts
  - cha-bio-safety/src/utils/versionCheck.ts
  - cha-bio-safety/src/pages/SplashScreen.tsx
  - cha-bio-safety/src/main.tsx
autonomous: true
requirements:
  - QUICK-260420-SPLASH-CACHE
must_haves:
  truths:
    - "빌드 산출물 dist/version.json에 현재 APP_VERSION과 KST BUILD_TIME이 담겨 서비스된다"
    - "스플래쉬 진입 시 /version.json을 no-store로 fetch하여 localStorage의 이전 버전과 비교한다"
    - "버전이 다르면 모든 Cache Storage 삭제 + 서비스워커 unregister 후 location.reload()가 실행된다"
    - "최초 실행(저장된 버전 없음)에는 현재 버전만 기록하고 리로드하지 않는다"
    - "fetch 실패/타임아웃 시 스플래쉬가 블로킹되지 않고 정상 진행한다"
    - "스플래쉬 하단 버전 표기가 하드코딩 'v1.0.0'이 아닌 __APP_VERSION__ 값으로 표시된다"
    - "main.tsx의 레거시 하드코딩 cache clear(floorplan/workbox-precache) 블록이 제거된다"
    - "백그라운드 복귀 기반 체크(visibilitychange/pageshow)는 추가되지 않는다"
  artifacts:
    - path: "cha-bio-safety/vite.config.ts"
      provides: "build 시 version.json asset을 emit하는 인라인 플러그인"
      contains: "version.json"
    - path: "cha-bio-safety/src/utils/versionCheck.ts"
      provides: "checkVersionAndRefresh 함수 — 버전 비교 + 캐시/SW 초기화 + reload"
      exports: ["checkVersionAndRefresh"]
    - path: "cha-bio-safety/src/pages/SplashScreen.tsx"
      provides: "스플래쉬에서 버전 체크 호출 + 동적 버전 표기"
      contains: "checkVersionAndRefresh"
    - path: "cha-bio-safety/src/main.tsx"
      provides: "레거시 하드코딩 캐시 삭제 제거된 엔트리"
      contains: "ReactDOM.createRoot"
  key_links:
    - from: "cha-bio-safety/vite.config.ts (plugin)"
      to: "dist/version.json"
      via: "generateBundle hook + this.emitFile"
      pattern: "emitFile.*version\\.json"
    - from: "cha-bio-safety/src/pages/SplashScreen.tsx"
      to: "cha-bio-safety/src/utils/versionCheck.ts"
      via: "useEffect 내부 checkVersionAndRefresh() 호출"
      pattern: "checkVersionAndRefresh\\(\\)"
    - from: "checkVersionAndRefresh"
      to: "/version.json"
      via: "fetch with cache: 'no-store' + AbortController"
      pattern: "fetch.*version\\.json.*no-store"
    - from: "checkVersionAndRefresh"
      to: "caches.keys / serviceWorker.getRegistrations"
      via: "mismatch 시 모두 삭제/unregister 후 location.reload"
      pattern: "caches\\.delete|unregister|location\\.reload"
---

<objective>
스플래쉬 진입 시 `/version.json`과 localStorage 저장 버전을 비교해, 달라졌을 때만 모든 캐시/서비스워커를 초기화하고 강제 리로드한다. 기존의 하드코딩된 무조건 캐시 삭제(floorplan/workbox-precache)는 제거한다. 백그라운드 복귀 감지는 입력 손실 위험 때문에 추가하지 않는다.

Purpose: 매 배포마다 수동 캐시 초기화 없이 사용자 기기가 최신 빌드를 확실히 받도록 보장한다. 동시에 작업 중(입력창)인 상태에서 갑자기 리로드되는 위험을 스플래쉬 타이밍으로 한정한다.

Output:
- `dist/version.json` (빌드 타임 생성 asset, `{ version, buildTime }` shape)
- `src/utils/versionCheck.ts` (신규 — 버전 비교/캐시 초기화 로직)
- `src/pages/SplashScreen.tsx` 패치 (버전 체크 호출 + 동적 버전 표기)
- `src/main.tsx` 패치 (레거시 하드코딩 캐시 삭제 제거)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@cha-bio-safety/vite.config.ts
@cha-bio-safety/src/pages/SplashScreen.tsx
@cha-bio-safety/src/main.tsx
@cha-bio-safety/src/vite-env.d.ts

<interfaces>
<!-- 이미 vite-env.d.ts에 선언됨. 변경 불필요. -->
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string

<!-- vite.config.ts 상단에서 이미 계산된 값 — 플러그인에서 그대로 재사용 -->
const APP_VERSION = pkg.version as string           // package.json의 version
const BUILD_TIME: string                            // KST "YYYY-MM-DD HH:mm"

<!-- checkVersionAndRefresh 시그니처 (Task 2에서 생성) -->
export async function checkVersionAndRefresh(): Promise<void>
// - /version.json을 no-store + 3s AbortController timeout으로 fetch
// - 실패/타임아웃 시 silent return (스플래쉬 블로킹 금지)
// - localStorage key: 'app_version'
// - 최초 실행: 저장만, reload 없음
// - 버전 mismatch: caches 전체 delete → SW 전부 unregister → localStorage 갱신 → location.reload()
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: version.json 빌드 emit + 레거시 cache clear 제거</name>
  <files>cha-bio-safety/vite.config.ts, cha-bio-safety/src/main.tsx</files>
  <action>
vite.config.ts에 인라인 Vite 플러그인을 추가해 빌드 시 `version.json`을 asset으로 emit한다.

1. `vite.config.ts`의 `plugins: [...]` 배열에 다음과 같은 인라인 플러그인을 추가(react()와 VitePWA() 사이가 아닌, VitePWA() 다음 위치에 둔다 — PWA precache가 asset 목록을 먼저 수집하므로 순서는 무관하지만 명시적으로 뒤에 둔다):

```ts
{
  name: 'emit-version-json',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({
        version: APP_VERSION,
        buildTime: BUILD_TIME,
      }),
    })
  },
},
```

- `APP_VERSION`, `BUILD_TIME`은 파일 상단에 이미 계산되어 있으므로 그대로 참조.
- `apply: 'build'`로 제한해 dev 서버에서는 실행되지 않게 한다. dev에서는 `/version.json`이 없으면 fetch가 404 → checkVersionAndRefresh가 silent fail하도록 Task 2에서 처리한다.
- `public/` 정적 파일과 동일하게 dist 루트(`/version.json`)로 서빙된다.

2. `src/main.tsx`에서 레거시 하드코딩 cache clear 블록 전체를 삭제한다:
   - 삭제 대상: 20~30번 라인 `// 서비스워커 캐시 강제 클리어 (v3 마이그레이션)` 주석과 그 아래 `if ('caches' in window) { caches.keys().then(...) }` 블록 전부.
   - Promise polyfill(withResolvers / try) 블록은 유지.
   - ReactDOM.createRoot 블록도 그대로 유지.
   - 이 코드는 Task 2에서 추가되는 버전 기반 체크로 대체되며, 매 부팅마다 floorplan 캐시를 지우는 것은 PWA 캐시 전략을 무효화하므로 반드시 제거한다.
</action>
  <verify>
    <automated>cd cha-bio-safety && npm run build 2>&1 | tail -20 && test -f dist/version.json && cat dist/version.json && ! grep -q "workbox-precache" src/main.tsx && ! grep -q "floorplan" src/main.tsx</automated>
  </verify>
  <done>
    - `dist/version.json`이 존재하고 `{"version":"...","buildTime":"YYYY-MM-DD HH:mm"}` shape JSON이다.
    - `npm run build` 성공(exit 0), PWA precache 생성에 영향 없음.
    - `src/main.tsx`에서 `caches.keys` / `floorplan` / `workbox-precache` 문자열이 모두 사라졌다.
    - Promise polyfill 블록 및 ReactDOM.createRoot는 그대로 남아있다.
  </done>
</task>

<task type="auto">
  <name>Task 2: checkVersionAndRefresh 유틸 작성 + SplashScreen 통합 + 동적 버전 표기</name>
  <files>cha-bio-safety/src/utils/versionCheck.ts, cha-bio-safety/src/pages/SplashScreen.tsx</files>
  <action>
신규 파일 `src/utils/versionCheck.ts`를 생성하고 `SplashScreen.tsx`에서 호출한다.

1. `src/utils/versionCheck.ts` 작성:

```ts
// 스플래쉬 진입 시 버전 비교 — 다르면 캐시/SW 초기화 + 강제 리로드.
// 백그라운드 복귀 기반 체크는 입력 손실 위험으로 의도적으로 미도입(LOCKED).

const STORAGE_KEY = 'app_version'
const VERSION_URL = '/version.json'
const FETCH_TIMEOUT_MS = 3000

export async function checkVersionAndRefresh(): Promise<void> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(VERSION_URL, { cache: 'no-store', signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) return
    const data = await res.json() as { version?: string; buildTime?: string }
    const remote = data?.version
    if (!remote || typeof remote !== 'string') return

    const stored = localStorage.getItem(STORAGE_KEY)

    // 최초 실행: 저장만, reload 안 함
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, remote)
      return
    }

    // 동일 버전: 아무 것도 안 함
    if (stored === remote) return

    // 버전 mismatch: 캐시/SW 전부 초기화 후 리로드
    try {
      if ('caches' in window) {
        const names = await caches.keys()
        await Promise.all(names.map(n => caches.delete(n)))
      }
    } catch (_) { /* ignore */ }

    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map(r => r.unregister()))
      }
    } catch (_) { /* ignore */ }

    localStorage.setItem(STORAGE_KEY, remote)
    window.location.reload()
  } catch (_) {
    // 네트워크 실패/abort/JSON 파싱 실패 등 — 스플래쉬 블로킹 금지
    return
  }
}
```

- 절대 throw하지 않는다. 최상위 try/catch로 모든 예외 흡수.
- `cache: 'no-store'`로 브라우저/SW 캐시 우회.
- AbortController 3초 타임아웃 — 오프라인/느린 네트워크에서도 스플래쉬가 멈추지 않는다.
- 최초 실행 가드(`!stored`)로 신규 설치 사용자가 즉시 리로드되는 루프를 방지.

2. `src/pages/SplashScreen.tsx` 수정:

(a) 상단 import에 추가:
```ts
import { checkVersionAndRefresh } from '../utils/versionCheck'
```

(b) `useEffect` 본문 맨 앞(tick setInterval 전)에서 버전 체크를 fire-and-forget으로 호출:
```ts
// 버전 체크 — 결과를 기다리지 않고 스플래쉬 진행.
// 버전 mismatch면 내부에서 location.reload()가 호출되어 이 컴포넌트가 재마운트된다.
void checkVersionAndRefresh()
```
- `await`하지 않는다(스플래쉬 UI 진행을 막지 않기 위해). 리로드가 필요한 경우 내부에서 `location.reload()`가 전체 페이지를 재시작시키므로 1600ms navigate와 경쟁해도 문제 없음(reload이 이기면 컴포넌트는 재마운트되고, 느리면 단순히 스플래쉬 다음 네비게이션이 그대로 진행됨 → 다음 세션 스플래쉬에서 다시 체크).

(c) 하단 footer의 하드코딩 `v1.0.0` 문자열을 `__APP_VERSION__`로 교체:
```tsx
<p style={{ position:'absolute', bottom:20, fontSize:10, color:'#3d444d' }}>v{__APP_VERSION__} · 경기도 성남시 분당구</p>
```
- `__APP_VERSION__`은 `vite-env.d.ts`에 이미 declare되어 있으므로 import 없이 사용 가능.
- TypeScript 경고가 뜨면 vite-env.d.ts 선언을 재확인(이미 선언됨 — 변경 불필요).

(d) cleanup 함수(`return () => ...`)와 navigate 로직은 그대로 유지.
  </action>
  <verify>
    <automated>cd cha-bio-safety && grep -n "checkVersionAndRefresh" src/utils/versionCheck.ts src/pages/SplashScreen.tsx && grep -n "__APP_VERSION__" src/pages/SplashScreen.tsx && ! grep -n "v1.0.0" src/pages/SplashScreen.tsx && ! grep -rn "visibilitychange\|pageshow" src/utils/versionCheck.ts src/pages/SplashScreen.tsx && npm run build 2>&1 | tail -15</automated>
  </verify>
  <done>
    - `src/utils/versionCheck.ts` 파일이 존재하며 `checkVersionAndRefresh`를 named export 한다.
    - `SplashScreen.tsx`의 useEffect 내부에서 `checkVersionAndRefresh()`가 호출된다.
    - 하단 footer 텍스트가 `v{__APP_VERSION__}`를 사용하며, `v1.0.0` 하드코딩 문자열은 사라졌다.
    - `visibilitychange` / `pageshow` 관련 코드는 추가되지 않았다.
    - `npm run build`가 타입 에러 없이 성공하고 `dist/version.json`이 여전히 존재한다.
  </done>
</task>

</tasks>

<verification>
빌드 + 배포 후 실환경에서 확인:

1. `cd cha-bio-safety && npm run build`
   - exit 0
   - `dist/version.json` 존재, 내용에 현재 package.json version과 KST 타임스탬프
   - `dist/index.html`에 새 해시의 asset 참조 포함

2. `dist/` 내 레거시 하드코딩 캐시 삭제 코드가 번들에 남아있지 않은지 확인:
   - `grep -r "floorplan" dist/assets/*.js | grep -i "caches.delete"` → 결과 없음 이상적(최소한 main 진입 코드에서 제거됨)

3. 배포 후 수동 체크(선택, /gsd:execute-phase의 verify 단계에서):
   - 초회 접속 → 스플래쉬 통과, localStorage `app_version`에 현재 버전 기록됨
   - package.json version bump 후 재배포 → 스플래쉬 진입 시 한 번 리로드 발생, 리로드 후 새 번들 로드 확인
   - 오프라인 상태에서 스플래쉬 진입 → 버전 체크 silent fail, 스플래쉬는 정상적으로 1.6s 뒤 다음 화면으로 이동
</verification>

<success_criteria>
- `dist/version.json`이 빌드마다 올바른 `{version, buildTime}`으로 생성된다.
- 스플래쉬 진입 시 `checkVersionAndRefresh`가 호출되고, 버전 mismatch에서만 cache+SW 초기화 + reload이 일어난다.
- 최초 실행/네트워크 실패는 절대 스플래쉬를 블로킹하지 않는다.
- `main.tsx`에서 무조건 실행되던 floorplan/workbox-precache 삭제 블록이 사라졌다.
- 스플래쉬 하단 버전 표기가 빌드 버전을 정확히 반영한다.
- 백그라운드 복귀 기반 체크는 포함되지 않았다(입력 손실 위험 회피 — LOCKED).
</success_criteria>

<output>
After completion, create `.planning/quick/260420-fri-splash-version-cache/260420-fri-SUMMARY.md`
</output>
