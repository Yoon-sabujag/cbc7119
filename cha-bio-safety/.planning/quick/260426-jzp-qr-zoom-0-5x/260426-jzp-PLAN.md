---
phase: 260426-jzp-qr-zoom-0-5x
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/QRScanPage.tsx
autonomous: true
requirements:
  - QR-ZOOM-01
tags:
  - qr
  - camera
  - ios
  - zoom
  - debug

must_haves:
  truths:
    - "iPhone 16 Pro / iOS 26.4.1 환경에서 QR 스캔 시작 직후 video track 의 zoom 0.5x 적용을 시도한다"
    - "zoom track constraint 가 지원되는 환경에서는 첫 흐림 단계 없이 곧바로 초광각 시야로 시작된다"
    - "zoom 미지원 환경에서는 silently 무시되고 기존 폴백 동작이 그대로 유지된다"
    - "stage === 'scan' 일 때 QR 스캔 박스 아래 임시 진단 텍스트(🐞 cams/pick/zoom/caps)가 노출된다"
    - "직전 quick 260426-jeh 의 라벨 기반 deviceId 매칭 + permission prime 로직은 회귀 없이 유지된다"
  artifacts:
    - path: "src/pages/QRScanPage.tsx"
      provides: "startCamera 내부 zoom 0.5x 강제 적용 + diag state + 진단 JSX"
      contains: "applyConstraints"
  key_links:
    - from: "startCamera 의 scannerRef.current.start() 직후"
      to: "video track.applyConstraints({ advanced: [{ zoom }] })"
      via: "document.querySelector('#qr-reader-region video').srcObject as MediaStream → getVideoTracks()[0]"
      pattern: "applyConstraints.*zoom"
    - from: "startCamera 결과"
      to: "diag state (cams/pick/zoom/caps)"
      via: "setDiag(...)"
      pattern: "setDiag"
    - from: "stage === 'scan' JSX 블록"
      to: "diag 진단 텍스트"
      via: "조건부 렌더 (diag.cams.length > 0)"
      pattern: "🐞"
---

<objective>
QR 스캔 시작 직후 video track 에 `zoom: 0.5x` 를 강제 적용해서 iPhone 16 Pro / iOS 26.4.1 환경의 "처음에 1x 메인 광각으로 시작 → 늦게 초광각 자동 전환" 첫 흐림 단계를 제거한다. 동시에 한시적 진단 표시(카메라 라벨 / 선택된 카메라 / zoom 적용 결과 / capabilities)를 스캔 화면에 노출해 다음 디버깅 사이클의 근거 데이터를 확보한다.

Purpose: 직전 quick 260426-jeh 의 라벨 기반 deviceId 매칭이 iPhone 16 Pro 에서 매칭에 실패한 원인을 진단 데이터로 좁히고, 동시에 zoom track constraint 라는 더 직접적인 경로로 초광각을 끌어내는 두 가지 시도를 한 번의 배포에서 수행.
Output: `src/pages/QRScanPage.tsx` 수정 1건 (startCamera 내부 zoom 적용 + diag state + 스캔 stage JSX 진단 블록 추가).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@src/pages/QRScanPage.tsx
@.planning/quick/260426-jeh-qr-ultra-wide/260426-jeh-SUMMARY.md

<interfaces>
<!-- 핵심 컨트랙트: 이미 파일에 존재. 신규 추가 없음. -->

기존 상수/ID:
```ts
const QR_REGION_ID = 'qr-reader-region'
```

기존 stage 타입:
```ts
type Stage = 'scan' | 'manual' | 'found' | 'form' | 'done'
```

추가할 state 타입 (startCamera 와 JSX 모두에서 참조):
```ts
type Diag = {
  cams: string[]   // 발견된 카메라 라벨 목록
  pick: string     // 매칭된 카메라 라벨 또는 'fallback (environment)'
  zoom: string     // '0.5x ✓' / 'unsupported' / 'failed: <reason>'
  caps: string     // zoom capabilities 범위 ('0.5–10x') 또는 '—'
}
```

브라우저 API (TypeScript lib.dom 표준):
```ts
HTMLVideoElement.srcObject: MediaStream | MediaSource | Blob | null
MediaStream.getVideoTracks(): MediaStreamTrack[]
MediaStreamTrack.getCapabilities?(): MediaTrackCapabilities  // optional, Safari 일부 미지원
MediaStreamTrack.applyConstraints(constraints: MediaTrackConstraints): Promise<void>
```

zoom 은 `MediaTrackCapabilities` / `MediaTrackConstraintSet` 표준에 아직 정식 등재 전이라 TS 타입 단언 필요:
```ts
const caps = track.getCapabilities?.() as (MediaTrackCapabilities & { zoom?: { min: number; max: number; step?: number } }) | undefined
await track.applyConstraints({ advanced: [{ zoom: target } as any] })
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: startCamera 에 zoom 0.5x 강제 + diag state + 스캔 stage JSX 진단 블록 추가</name>
  <files>src/pages/QRScanPage.tsx</files>
  <action>
`src/pages/QRScanPage.tsx` 한 파일만 수정. 다른 파일/페이지/컴포넌트 무수정.

**변경 1: diag state 추가 (기존 useState 블록 끝에 추가, 약 36행 `setScanning` 다음 줄)**

```ts
const [diag, setDiag] = useState<{
  cams: string[]
  pick: string
  zoom: string
  caps: string
}>({ cams: [], pick: '', zoom: '', caps: '' })
```

**변경 2: startCamera 내부, `await scannerRef.current.start(...)` 호출 직후 + `setScanning(true)` 직전에 zoom 적용 + diag 채우기 블록 삽입**

직전 quick 260426-jeh 에서 추가한 다음 로직은 한 줄도 건드리지 말 것:
- `cameras = await Html5Qrcode.getCameras()` (try/catch 포함)
- `if (cameras.length === 0 || cameras.every(c => !c.label))` permission prime 분기
- `const ultraWide = cameras.find(c => /ultra[\s-]?wide|초광각|울트라/i.test(c.label || ''))`
- `scannerRef.current.start(ultraWide ? { deviceId: { exact: ultraWide.id } } : { facingMode: 'environment' }, ...)` 호출 자체

`start()` 호출이 `await` 로 끝난 시점에 video track 이 활성 상태이므로, 거기서 다음을 시도한다:

```ts
// ── zoom 0.5x 강제 (iPhone Ultra Wide 첫 흐림 단계 제거) ──
let zoomResult = 'unsupported'
let capsRange = ''
try {
  const videoEl = document.querySelector(`#${QR_REGION_ID} video`) as HTMLVideoElement | null
  const stream  = videoEl?.srcObject as MediaStream | null
  const track   = stream?.getVideoTracks?.()[0]
  if (track) {
    const caps = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { zoom?: { min: number; max: number } }
    if (caps.zoom) {
      capsRange = `${caps.zoom.min}–${caps.zoom.max}x`
      const target = Math.max(caps.zoom.min, 0.5)  // iOS 16/26 에서 보통 0.5 가 min
      await track.applyConstraints({ advanced: [{ zoom: target } as any] })
      zoomResult = `${target}x ✓`
    }
  }
} catch (e: any) {
  zoomResult = `failed: ${e?.message || 'unknown'}`
}

setDiag({
  cams: cameras.map(c => c.label || '(no label)'),
  pick: ultraWide?.label || 'fallback (environment)',
  zoom: zoomResult,
  caps: capsRange || '—',
})

setScanning(true)
```

(기존 코드의 `setScanning(true)` 한 줄을 위 블록 끝의 `setScanning(true)` 로 대체. 즉 한 줄 → 다중 줄로 확장된다.)

**변경 3: 스캔 stage JSX 에 진단 블록 추가**

`{stage === 'scan' && ( ... )}` 블록 안, 기존 안내 텍스트 (`'QR 코드를 카메라에 비춰주세요'`) 와 같은 컬럼 자식으로, `cpError` 렌더 직전에 다음을 추가:

```tsx
{/* 🐞 debug — Ultra Wide / zoom 진단. 디버그 완료 후 제거 예정 (260426-jzp) */}
{diag.cams.length > 0 && (
  <div style={{
    width:'100%', maxWidth:320,
    fontSize:9, color:'var(--t3)', lineHeight:1.5,
    fontFamily:'JetBrains Mono,monospace', wordBreak:'break-all',
  }}>
    🐞 cams: {diag.cams.join(', ')}<br/>
    🐞 pick: {diag.pick}<br/>
    🐞 zoom: {diag.zoom} (caps: {diag.caps})
  </div>
)}
```

**제약 / 회귀 금지:**

- 다른 stage(manual / found / form / done) JSX 한 줄도 변경 금지.
- `scannedRef`, `stopCamera`, `lookupCheckpoint`, `handleSubmit`, `handleRescan`, `handleManualSearch`, useEffect 마운트 로직, 헤더 JSX, 공통 스타일 객체, `Spinner` 컴포넌트 모두 무수정.
- `onSuccess` (decodedText 콜백) / `onFailure` (스캔 실패 무시) 콜백 본문 무수정.
- import 추가 불필요 (모두 표준 DOM API 또는 기존 React 훅).
- TypeScript: `MediaTrackCapabilities.zoom` 은 표준 타입에 아직 없으므로 위와 같이 `as any` / 인터섹션 타입 단언으로 우회. `strict: false` 환경이라 추가 보일러플레이트 불요.
- 진단 텍스트는 명시적으로 `🐞` prefix 와 `260426-jzp` 주석을 달아 임시인 것을 표시 — 다음 사이클에서 한 번에 제거 가능하도록.
- 진단 표시는 `stage === 'scan'` 조건 블록 안에만 위치 — 다른 stage 에서 노출되지 않음.

**디자인 정책 (CLAUDE.md / project memory: "디자인 변경 전 상의 필수")**

본 변경은 디버그용 임시 UI 추가일 뿐, 사용자가 명시적으로 OK 했으므로 추가 협의 불필요. SUMMARY 에서 "임시 — 다음 사이클에서 제거 예정" 명시.

**배포 / 테스트 (Task 본 범위 외 — Future Notes 에 기재)**

- `npm run build` → `npx wrangler pages deploy dist --branch production --commit-message "qr zoom 0.5x + diag"`
- iPhone 16 Pro PWA 강제 새로고침 또는 앱 재설치 (PWA SW 캐시)
- 진단 텍스트로 다음 데이터 캡처: cams 라벨 목록 / 선택된 카메라 / zoom 적용 결과 / capabilities 범위
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit</automated>
  </verify>
  <done>
- `src/pages/QRScanPage.tsx` 가 수정됨 (다른 파일 변경 없음)
- `useState<{ cams: string[]; pick: string; zoom: string; caps: string }>` 형태의 `diag` state 가 추가됨
- `startCamera` 내부 `scannerRef.current.start(...)` 호출 직후, `setScanning(true)` 직전에 다음이 모두 존재:
  - `document.querySelector(`#${QR_REGION_ID} video`)` 로 video 엘리먼트 획득
  - `track.getCapabilities?.()` 호출
  - `track.applyConstraints({ advanced: [{ zoom: ... } as any] })` 호출
  - `setDiag({ cams, pick, zoom, caps })` 호출
- 스캔 stage JSX 에 `🐞 cams:` / `🐞 pick:` / `🐞 zoom:` 세 줄을 출력하는 조건부 div 가 추가됨
- 직전 quick 260426-jeh 의 다음 코드는 한 줄도 변경되지 않음:
  - `Html5Qrcode.getCameras()` 호출 + permission prime 분기
  - `/ultra[\s-]?wide|초광각|울트라/i` 정규식
  - `start()` 의 첫 인자 삼항식 (deviceId vs facingMode)
- 다른 stage(manual / found / form / done) JSX 무수정
- `npx tsc --noEmit` 통과 (no errors)
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` 통과
- `git diff src/pages/QRScanPage.tsx` 변경 범위가 (1) 컴포넌트 useState 블록 끝의 diag state 1개, (2) startCamera 내부 start() 직후 ~ setScanning(true) 사이의 zoom + diag 블록, (3) stage === 'scan' JSX 내부의 진단 div 1개 — 이 세 부위로만 한정됨
- `grep -n "applyConstraints" src/pages/QRScanPage.tsx` 1건 매치
- `grep -n "🐞" src/pages/QRScanPage.tsx` 3건 이상 매치 (cams / pick / zoom)
- `grep -n "setDiag" src/pages/QRScanPage.tsx` 1건 매치 (startCamera 내부)
- `grep -n "ultra\\[\\\\\\\\s-\\]?wide" src/pages/QRScanPage.tsx` 직전 quick 의 정규식 그대로 존재 확인
- 다른 함수/컴포넌트(stopCamera, lookupCheckpoint, handleSubmit, handleRescan, handleManualSearch, useEffect, 헤더 JSX, manual/found/form/done stage JSX, Spinner) 변경 없음
</verification>

<success_criteria>
- iPhone 16 Pro / iOS 26.4.1 환경에서 QR 스캔 페이지 진입 시 zoom 0.5x 적용이 시도되며, 지원되는 경우 첫 화면부터 초광각으로 시작
- 스캔 박스 아래 임시 진단 표시가 노출되어 다음 디버깅 사이클에 필요한 데이터(cams 라벨, 선택된 카메라, zoom 적용 결과, capabilities)가 사용자에게 보임
- zoom 미지원 환경(일부 안드로이드 / 데스크톱)에서는 silently `unsupported` 로 표시되고 기존 카메라 동작 유지
- 직전 quick 260426-jeh 의 라벨 기반 deviceId 매칭 + permission prime 로직 회귀 없음
- TypeScript 컴파일 통과
</success_criteria>

<output>
After completion, create `.planning/quick/260426-jzp-qr-zoom-0-5x/260426-jzp-SUMMARY.md` documenting:
- Before/After diff (zoom + diag 추가 부위)
- 변경된 부위 3곳 (state / startCamera 내부 / scan stage JSX)
- 사용자 실기기 검증 절차 (deferred-to-user) — 진단 텍스트로부터 캡처해야 할 데이터 목록 명시
- 임시 UI 제거 계획 (다음 사이클에서 `🐞` 진단 div 와 `diag` state 한 번에 제거)
- Self-Check
</output>
