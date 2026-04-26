---
status: complete
phase: 260426-jzp-qr-zoom-0-5x
plan: 01
subsystem: qr-scan
tags:
  - qr
  - camera
  - ios
  - zoom
  - debug
  - temp-ui
dependency_graph:
  requires:
    - 260426-jeh-qr-ultra-wide  # 라벨 기반 deviceId 매칭 + permission prime 로직 의존
  provides:
    - qr-zoom-track-constraint
    - qr-camera-diagnostic-overlay
  affects:
    - src/pages/QRScanPage.tsx
tech_stack:
  added: []
  patterns:
    - "MediaStreamTrack.applyConstraints({ advanced: [{ zoom }] }) — Safari/Chrome zoom track constraint"
    - "MediaTrackCapabilities.zoom?.{ min, max } — 비표준 capabilities 인터섹션 타입 단언으로 우회"
    - "Temporary debug overlay — 🐞 prefix + 'jzp' 주석으로 다음 사이클 일괄 제거 마커"
key_files:
  created: []
  modified:
    - src/pages/QRScanPage.tsx
decisions:
  - "zoom 0.5x 강제 시점은 scannerRef.current.start() await 직후 setScanning(true) 직전 — 그 시점에 video track 이 활성"
  - "MediaTrackCapabilities.zoom 은 표준 lib.dom 미등재 → 인터섹션 타입 + advanced as any 로 우회 (strict:false 환경)"
  - "진단 UI 는 임시(temp) — 🐞 prefix + 260426-jzp 주석을 두 위치(state 선언, JSX 블록)에 달아 다음 사이클에서 grep 'jzp' 한 번에 제거 가능"
  - "직전 quick 260426-jeh 의 라벨 매칭 + permission prime 로직은 한 줄도 변경하지 않음 — 회귀 방지"
metrics:
  duration_seconds: 70
  tasks_completed: 1
  files_modified: 1
  commits: 1
  completed: 2026-04-26T05:27:34Z
requirements:
  - QR-ZOOM-01
---

# 260426-jzp Plan 01: QR Scan video track zoom 0.5x + temporary diagnostic UI Summary

iPhone 16 Pro / iOS 26.4.1 환경의 "처음에 1x 메인 광각으로 시작 → 늦게 초광각 자동 전환" 첫 흐림 단계를 제거하기 위해 QR 스캔 시작 직후 video track 에 `zoom: 0.5x` track constraint 를 강제 적용하고, 동시에 다음 디버깅 사이클을 위한 임시 진단 표시(🐞 cams/pick/zoom/caps)를 스캔 화면에 노출했다.

## What Changed

`src/pages/QRScanPage.tsx` 한 파일, 3 부위에 한정된 +48 라인 변경.

### 부위 1 — `diag` state 추가 (component 본문 useState 블록 끝)

**Before:**
```tsx
const [scanning,   setScanning]   = useState(false)

const scannerRef = useRef<Html5Qrcode | null>(null)
```

**After:**
```tsx
const [scanning,   setScanning]   = useState(false)
// 🐞 debug — Ultra Wide / zoom 진단. 디버그 완료 후 제거 예정 (260426-jzp)
const [diag, setDiag] = useState<{
  cams: string[]
  pick: string
  zoom: string
  caps: string
}>({ cams: [], pick: '', zoom: '', caps: '' })

const scannerRef = useRef<Html5Qrcode | null>(null)
```

### 부위 2 — `startCamera` 내부 zoom 적용 + diag 채우기 (scannerRef.start() 직후 ~ setScanning(true) 직전)

**Before:**
```tsx
)
setScanning(true)
```

**After:**
```tsx
)

// ── zoom 0.5x 강제 (iPhone Ultra Wide 첫 흐림 단계 제거) — 260426-jzp ──
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

### 부위 3 — `stage === 'scan'` JSX 진단 블록 (안내 텍스트 ↔ cpError 사이)

**Before:**
```tsx
) : (
  <div style={{ fontSize:12, color:'var(--t2)', textAlign:'center' }}>
    QR 코드를 카메라에 비춰주세요
  </div>
)}

{cpError && (
```

**After:**
```tsx
) : (
  <div style={{ fontSize:12, color:'var(--t2)', textAlign:'center' }}>
    QR 코드를 카메라에 비춰주세요
  </div>
)}

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

{cpError && (
```

## Why It Works

- **zoom 0.5x track constraint:** iPhone 의 main 광각 카메라(1x)와 Ultra Wide(0.5x)는 같은 deviceId 로 묶일 수 있고(virtual triple-camera), 그 경우 deviceId 선택만으로는 0.5x 가 강제되지 않는다. WebRTC `MediaStreamTrack.applyConstraints({ advanced: [{ zoom }] })` 는 같은 track 안에서 광학 zoom 비율을 직접 설정하므로 첫 프레임부터 초광각으로 시작 가능.
- **Capabilities-aware target:** `caps.zoom.min` 을 읽고 `Math.max(caps.zoom.min, 0.5)` 로 최종 타겟 결정 — 0.5 미만 min 인 디바이스에서도 0.5 로 클램프, 1x 부터 시작하는 디바이스에서는 zoom 미시도(이론상 caps.zoom 자체가 없음).
- **Silent fallback:** zoom capability 미지원 환경(데스크톱 / 일부 안드로이드)은 `caps.zoom` 이 undefined 라 if 분기 진입 자체가 안 됨 → `zoomResult = 'unsupported'` 만 표시되고 카메라는 정상 동작.
- **진단 데이터:** 다음 디버깅 사이클에서 사용자에게 `cams: ...`, `pick: ...`, `zoom: ...`, `caps: ...` 4 줄을 캡처해 받으면 — (a) Html5Qrcode.getCameras() 가 라벨을 반환했는지 / (b) 정규식이 매칭했는지 / (c) zoom track constraint 가 통했는지 / (d) capabilities 범위가 어떻게 보이는지 — 한 번에 판정 가능.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc --noEmit` — 통과 (no errors)
- `grep -n "applyConstraints" src/pages/QRScanPage.tsx` — 1 match (line 156)
- `grep -n "🐞" src/pages/QRScanPage.tsx` — 5 matches (state 주석 1 + JSX 주석 1 + 진단 3줄)
- `grep -n "setDiag" src/pages/QRScanPage.tsx` — 2 matches (선언 + startCamera 내부 호출)
- `grep -n "ultra\[\\s-\]?wide" src/pages/QRScanPage.tsx` — 1 match (line 128, 직전 quick 260426-jeh 정규식 그대로 보존)
- `git diff --stat` — `1 file changed, 48 insertions(+)` — 부위 3곳 한정 / 다른 함수·stage·헤더·Spinner 무수정

## Deferred-to-User (실기기 검증)

**배포:**
```bash
npm run build
npx wrangler pages deploy dist --branch production --commit-message "qr zoom 0.5x + diag"
```

**테스트 시나리오 — iPhone 16 Pro / iOS 26.4.1 PWA:**
1. 앱 강제 새로고침 또는 재설치 (PWA SW 캐시)
2. QR 스캔 페이지 진입
3. 스캔 박스 아래 4 줄(🐞 cams / 🐞 pick / 🐞 zoom + caps) 노출 확인
4. **기대 (zoom 통한 경우):** 첫 프레임부터 초광각 시야로 시작, `zoom: 0.5x ✓ (caps: 0.5–...x)` 표시
5. **확인용 데이터 캡처(스크린샷):**
   - `cams:` — 발견된 카메라 라벨 목록 (Ultra Wide / Wide / Telephoto / Front 등)
   - `pick:` — 라벨 매칭으로 선택된 카메라 또는 `fallback (environment)`
   - `zoom:` — `0.5x ✓` / `unsupported` / `failed: ...` 중 하나
   - `caps:` — capabilities 범위 (예: `0.5–10x`) 또는 `—`

**Android / 데스크톱 회귀 확인 (선택):**
- Android Chrome: zoom capabilities 가 있을 수도/없을 수도. `unsupported` 또는 `Nx ✓` 어느 쪽이든 카메라 자체는 동작해야 함.
- 데스크톱: `unsupported` 노출 + 기존 환경카메라 그대로 동작.

## Temp UI 제거 계획 (다음 사이클에서)

진단 UI 는 디버깅용 임시 추가다. 다음 사이클에서 다음 두 부분을 한 번에 제거:

1. **state 선언 (line ~37):**
```tsx
// 🐞 debug — Ultra Wide / zoom 진단. 디버그 완료 후 제거 예정 (260426-jzp)
const [diag, setDiag] = useState<{ cams: string[]; pick: string; zoom: string; caps: string }>(...)
```

2. **startCamera 내부 setDiag 호출 (line ~164):**
```tsx
setDiag({ cams: ..., pick: ..., zoom: zoomResult, caps: capsRange || '—' })
```
`zoomResult` / `capsRange` 변수와 zoom apply 블록은 — zoom 0.5x 적용이 검증되면 — 유지하고 setDiag 호출만 제거.

3. **JSX 진단 div (line ~307):**
```tsx
{/* 🐞 debug — Ultra Wide / zoom 진단. 디버그 완료 후 제거 예정 (260426-jzp) */}
{diag.cams.length > 0 && ( ... )}
```

**일괄 제거 grep:**
```bash
grep -n "260426-jzp\|🐞" src/pages/QRScanPage.tsx
```
세 위치(state 주석 1 + JSX 주석 1 + state 선언 + setDiag 호출 + JSX 블록 4줄)를 모두 잡아낸다.

## Self-Check: PASSED

**Files modified:**
- FOUND: `src/pages/QRScanPage.tsx` (확인: 변경 +48 lines, 부위 3곳)

**Commit exists:**
```bash
$ git log --oneline -1 src/pages/QRScanPage.tsx
b02eb45 feat(260426-jzp-01): QR scan video track zoom 0.5x + temp diag UI
```
- FOUND: `b02eb45`

**Verification artifacts:**
- FOUND: `applyConstraints` (line 156) — 1 match
- FOUND: `🐞` — 5 matches
- FOUND: `setDiag` — 2 matches (선언 + 1 호출)
- FOUND: `/ultra[\s-]?wide|초광각|울트라/i` regex 보존 (line 128)
- PASSED: `npx tsc --noEmit` no errors
