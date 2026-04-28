---
quick_id: 260428-hbh
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/QRScanPage.tsx
  - src/App.tsx
autonomous: true
requirements:
  - QUICK-260428-hbh
must_haves:
  truths:
    - "QRScanPage는 scan/manual 두 stage만 가지며 found/form/done 코드 경로가 존재하지 않는다"
    - "/inspection/qr 진입 시 헤더는 GlobalHeader 하나만 표시되고 페이지 자체 <header>는 더 이상 렌더되지 않는다"
    - "stage가 scan일 때 GlobalHeader 우측에 '수동입력' 버튼, manual일 때 '카메라' 버튼이 portal로 렌더된다"
    - "다른 페이지(대시보드 등)의 GlobalHeader rightSlot 동작은 그대로 유지된다"
    - "npm run build가 TypeScript 에러 없이 성공한다"
  artifacts:
    - path: "src/pages/QRScanPage.tsx"
      provides: "QR 스캔 + 수동 입력 페이지 (slim)"
      contains: "createPortal"
    - path: "src/App.tsx"
      provides: "Layout — GlobalHeader rightSlot에 QR portal 슬롯 div 포함"
      contains: "qr-header-portal-slot"
  key_links:
    - from: "src/App.tsx Layout"
      to: "src/pages/QRScanPage.tsx"
      via: "DOM id 'qr-header-portal-slot' (App.tsx에서 렌더, QRScanPage에서 createPortal target으로 조회)"
      pattern: "qr-header-portal-slot"
    - from: "QRScanPage useEffect cleanup"
      to: "stopCamera"
      via: "unmount 시 카메라 트랙 해제 (햄버거 메뉴로 이탈 시 카메라 누수 방지)"
      pattern: "return.*stopCamera"
---

<objective>
QRScanPage 데드 코드 제거 + 헤더 통합.

배경: 현재 QRScanPage의 stage 머신은 'scan' | 'manual' | 'found' | 'form' | 'done' 5단계로 선언되어 있으나, lookupCheckpoint가 cp 발견 시 즉시 `navigate('/inspection', { state: { qrCheckpoint: cp } })`로 떠나기 때문에 found/form/done 경로는 사실상 도달 불가능한 데드 코드. 또한 페이지 자체 `<header>`와 GlobalHeader가 함께 떠서 이중 헤더 상태.

Purpose: 코드 표면적을 줄여 유지보수 부담을 낮추고, 다른 페이지와 동일한 GlobalHeader 단일 헤더 구조로 통일한다. 사용자 직접 조사·설계한 변경이며 디자인 결정 사항 그대로 진행.

Output:
- src/pages/QRScanPage.tsx (slim 버전, scan/manual 2 stage만)
- src/App.tsx (Layout 내 mobile rightSlot에 QR 전용 portal 슬롯 div 포함)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@.planning/STATE.md

@src/pages/QRScanPage.tsx
@src/App.tsx
@src/components/GlobalHeader.tsx

<interfaces>
<!-- 작업에 필요한 핵심 시그니처. 코드베이스 추가 탐색 불필요. -->

From src/components/GlobalHeader.tsx:
```typescript
interface GlobalHeaderProps {
  title: string
  onMenuOpen: () => void
  rightSlot?: React.ReactNode
}
export function GlobalHeader({ title, onMenuOpen, rightSlot }: GlobalHeaderProps): JSX.Element
```

From src/App.tsx (Layout 내 mobile rightSlot 구성, line 121~138, 161~167):
```typescript
const isDashboard = location.pathname === '/dashboard'

const dashboardRightSlot = (
  <span ...>차바이오컴플렉스 방재팀</span>
)

const settingsGearBtn = (
  <button onClick={() => setSettingsOpen(true)} aria-label="설정" ...>
    <svg>...</svg>
  </button>
)

// GlobalHeader 호출 (현재):
<GlobalHeader
  title={isDashboard ? dateOnly : pageTitle}
  onMenuOpen={() => setSideOpen(true)}
  rightSlot={isDashboard
    ? <div style={{ display:'flex', alignItems:'center', gap:6 }}>{dashboardRightSlot}{settingsGearBtn}</div>
    : settingsGearBtn}
/>
```

PAGE_TITLES['/inspection/qr'] = 'QR 스캔'  (App.tsx line 71 — 그대로 유지)

From src/pages/QRScanPage.tsx (현재 자체 헤더 line 222~251):
- 뒤로가기 버튼 + title + (stage==='scan' ? 수동입력 버튼 : stage==='manual' ? 카메라 버튼)
- 뒤로가기/title은 GlobalHeader가 이미 담당하므로 제거. 토글 버튼만 portal로 이전.

react-dom createPortal:
```typescript
import { createPortal } from 'react-dom'
createPortal(node: React.ReactNode, container: Element): React.ReactPortal
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: QRScanPage 데드 코드 제거 + GlobalHeader portal 통합</name>
  <files>src/pages/QRScanPage.tsx, src/App.tsx</files>
  <action>
**Part A — src/App.tsx 수정 (portal 슬롯 추가):**

Layout 함수 내부, GlobalHeader 호출부(현재 line ~161~167)를 수정한다.

1. `isDashboard` 직후에 `isQrScan` 플래그 추가:
   ```typescript
   const isDashboard = location.pathname === '/dashboard'
   const isQrScan    = location.pathname === '/inspection/qr'
   ```

2. `<GlobalHeader>` 호출의 `rightSlot` prop을 다음 우선순위로 분기:
   - `isDashboard` → 기존 `<div>{dashboardRightSlot}{settingsGearBtn}</div>` (변경 없음)
   - `isQrScan` → `<div style={{ display:'flex', alignItems:'center', gap:6 }}><div id="qr-header-portal-slot" /></div>{settingsGearBtn}` 형태로 portal 컨테이너를 settings 톱니 좌측에 둔다. 정확한 JSX:
     ```tsx
     <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
       <div id="qr-header-portal-slot" style={{ display: 'flex', alignItems: 'center' }} />
       {settingsGearBtn}
     </div>
     ```
   - 그 외 → 기존 `settingsGearBtn` (변경 없음)

3. 결과적으로 `rightSlot` prop은 다음과 같은 삼항 분기:
   ```tsx
   rightSlot={
     isDashboard ? (
       <div style={{ display:'flex', alignItems:'center', gap:6 }}>{dashboardRightSlot}{settingsGearBtn}</div>
     ) : isQrScan ? (
       <div style={{ display:'flex', alignItems:'center', gap:6 }}>
         <div id="qr-header-portal-slot" style={{ display:'flex', alignItems:'center' }} />
         {settingsGearBtn}
       </div>
     ) : settingsGearBtn
   }
   ```

App.tsx 그 외 부분(데스크톱 헤더, MOBILE_NO_NAV_PATHS, PAGE_TITLES 등)은 일절 손대지 않는다. `/inspection/qr`은 이미 MOBILE_NO_NAV_PATHS에 없으므로 그대로 두면 GlobalHeader가 노출된다.

**Part B — src/pages/QRScanPage.tsx 재작성 (slim 버전):**

Edit 매칭이 큰 연속 구간(line 1~493 전반)을 다루므로, 정확하고 안전한 git diff를 위해 **Write 도구로 전체 파일을 재작성**한다. 아래 골격을 그대로 사용:

```tsx
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuthStore } from '../stores/authStore'
import type { CheckPoint } from '../types'

// ── 타입 ──────────────────────────────────────────────────
type Stage = 'scan' | 'manual'

const QR_REGION_ID = 'qr-reader-region'
const HEADER_PORTAL_ID = 'qr-header-portal-slot'

export default function QRScanPage() {
  const navigate = useNavigate()

  const [stage,    setStage]    = useState<Stage>('scan')
  const [camError, setCamError] = useState<string | null>(null)
  const [manualQr, setManualQr] = useState('')
  const [cpError,  setCpError]  = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [scanning, setScanning] = useState(false)
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannedRef = useRef(false)

  // ── 카메라 정지 ──
  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        try { await scannerRef.current.stop() } catch { /* */ }
        try { scannerRef.current.clear() } catch { /* */ }
        scannerRef.current = null
      }
    } catch { /* 이미 정지됨 */ }
    try {
      const videoEl = document.querySelector(`#${QR_REGION_ID} video`) as HTMLVideoElement
      if (videoEl?.srcObject) {
        (videoEl.srcObject as MediaStream).getTracks().forEach(t => t.stop())
        videoEl.srcObject = null
      }
    } catch { /* */ }
    setScanning(false)
  }

  // ── 체크포인트 조회 → 점검 페이지로 이동 ──
  const lookupCheckpoint = async (qr: string) => {
    setLoading(true)
    setCpError(null)
    try {
      const token = useAuthStore.getState().token
      const res   = await fetch(`/api/checkpoints?qr=${encodeURIComponent(qr)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json() as { success: boolean; data?: CheckPoint[] }
      if (json.success && json.data && json.data.length > 0) {
        const cp = json.data[0]
        await stopCamera()
        navigate('/inspection', { state: { qrCheckpoint: cp } })
      } else {
        setCpError(`QR 코드를 찾을 수 없습니다.\n(${qr})`)
        scannedRef.current = false
        startCamera()
      }
    } catch {
      setCpError('체크포인트 조회 중 오류가 발생했습니다.')
      scannedRef.current = false
      startCamera()
    } finally {
      setLoading(false)
    }
  }

  // ── 카메라 시작 ──
  const startCamera = async () => {
    setCamError(null)
    scannedRef.current = false

    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* 무시 */ }
      try { scannerRef.current.clear() }     catch { /* 무시 */ }
    }

    try {
      let cameras: { id: string; label: string }[] = []
      try {
        cameras = await Html5Qrcode.getCameras()
      } catch { /* 권한 부여 전 */ }
      if (cameras.length === 0 || cameras.every(c => !c.label)) {
        try {
          const primeStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          })
          primeStream.getTracks().forEach(t => t.stop())
          cameras = await Html5Qrcode.getCameras()
        } catch { /* 권한 거부 / 미지원 */ }
      }
      const ultraWide = cameras.find(c =>
        /ultra[\s-]?wide|초광각|울트라/i.test(c.label || '')
      )

      scannerRef.current = new Html5Qrcode(QR_REGION_ID)
      await scannerRef.current.start(
        ultraWide ? { deviceId: { exact: ultraWide.id } } : { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        async (decodedText) => {
          if (scannedRef.current) return
          scannedRef.current = true
          await stopCamera()
          await lookupCheckpoint(decodedText)
        },
        () => { /* 스캔 실패 무시 */ }
      )

      // ── zoom 0.5x 안전망 ──
      try {
        const videoEl = document.querySelector(`#${QR_REGION_ID} video`) as HTMLVideoElement | null
        const stream  = videoEl?.srcObject as MediaStream | null
        const track   = stream?.getVideoTracks?.()[0]
        const caps    = (track?.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { zoom?: { min: number; max: number } }
        if (track && caps.zoom) {
          await track.applyConstraints({ advanced: [{ zoom: Math.max(caps.zoom.min, 0.5) } as any] })
        }
      } catch { /* 미지원 / 일시적 실패 무시 */ }

      setScanning(true)
    } catch (e: any) {
      if (e?.message?.includes('permission') || e?.message?.includes('NotAllowed')) {
        setCamError('카메라 권한이 필요합니다.\n설정에서 카메라 접근을 허용해주세요.')
      } else {
        setCamError('카메라를 시작할 수 없습니다.\n수동 입력을 이용해주세요.')
      }
    }
  }

  // ── 다시 스캔 ──
  const handleRescan = () => {
    setCpError(null)
    setStage('scan')
    startCamera()
  }

  // ── 수동 조회 ──
  const handleManualSearch = () => {
    if (!manualQr.trim() || loading) return
    lookupCheckpoint(manualQr.trim())
  }

  // ── 마운트/언마운트 ──
  useEffect(() => {
    startCamera()
    return () => { stopCamera() }
  }, []) // eslint-disable-line

  // ── GlobalHeader portal slot 연결 ──
  useEffect(() => {
    const el = document.getElementById(HEADER_PORTAL_ID)
    setHeaderSlot(el)
    // App.tsx에서 isQrScan 분기로 슬롯 div를 mount 시점에 같이 렌더하므로
    // 일반적으로 즉시 잡히지만, 만약 lazy 마운트 타이밍 차이가 생기면 다음 paint 에서 재시도
    if (!el) {
      const id = requestAnimationFrame(() => {
        setHeaderSlot(document.getElementById(HEADER_PORTAL_ID))
      })
      return () => cancelAnimationFrame(id)
    }
  }, [])

  const headerToggleBtn =
    stage === 'scan' ? (
      <button
        onClick={() => { stopCamera(); setStage('manual') }}
        style={{ height:32, padding:'0 10px', borderRadius:7, background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:600, color:'var(--t2)', cursor:'pointer' }}
      >
        수동입력
      </button>
    ) : (
      <button
        onClick={() => { setStage('scan'); startCamera() }}
        style={{ height:32, padding:'0 10px', borderRadius:7, background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:600, color:'var(--acl)', cursor:'pointer' }}
      >
        카메라
      </button>
    )

  // ────────────────────────────────────────────────────────
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>

      {headerSlot && createPortal(headerToggleBtn, headerSlot)}

      {/* 본문 */}
      <main style={{ flex:1, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column' }}>

        {/* ── 스캔 화면 ── */}
        {stage === 'scan' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 16px', gap:16 }}>

            <div style={{ width:'100%', maxWidth:320, borderRadius:20, overflow:'hidden', background:'#000', boxShadow:'0 0 0 1px var(--bd2)', position:'relative' }}>
              <div id={QR_REGION_ID} style={{ width:'100%' }} />
              {loading && (
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
                  <Spinner />
                </div>
              )}
            </div>

            {camError ? (
              <div style={{ width:'100%', maxWidth:320, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>📷</div>
                <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.6, whiteSpace:'pre-line', marginBottom:12 }}>{camError}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={startCamera} style={{ ...primaryBtnSt, flex:1 }}>다시 시도</button>
                  <button onClick={() => { stopCamera(); setStage('manual') }} style={{ ...ghostBtnSt, flex:1 }}>수동 입력</button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize:12, color:'var(--t2)', textAlign:'center' }}>
                QR 코드를 카메라에 비춰주세요
              </div>
            )}

            {cpError && (
              <div style={{ width:'100%', maxWidth:320, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'10px 13px', fontSize:11, color:'var(--danger)', textAlign:'center', whiteSpace:'pre-line', lineHeight:1.5 }}>
                {cpError}
              </div>
            )}
          </div>
        )}

        {/* ── 수동 입력 ── */}
        {stage === 'manual' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:16 }}>
            <div style={{ fontSize:40, textAlign:'center' }}>🔍</div>
            <div style={{ width:'100%', maxWidth:320 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--t2)', display:'block', marginBottom:6 }}>QR 코드 값</label>
              <input
                autoFocus
                value={manualQr}
                onChange={e => setManualQr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                placeholder="예: QR-3F-OFF-001"
                style={inputSt}
              />
            </div>
            <button
              onClick={handleManualSearch}
              disabled={!manualQr.trim() || loading}
              style={{ ...primaryBtnSt, width:'100%', maxWidth:320, opacity:(!manualQr.trim() || loading) ? 0.5 : 1 }}
            >
              {loading ? '조회 중...' : '체크포인트 조회'}
            </button>
            {cpError && (
              <div style={{ width:'100%', maxWidth:320, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'10px 13px', fontSize:11, color:'var(--danger)', textAlign:'center', whiteSpace:'pre-line', lineHeight:1.5 }}>
                {cpError}
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  )
}

// ── 서브 컴포넌트 ──────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ width:28, height:28, border:'2px solid rgba(255,255,255,.2)', borderTopColor:'var(--acl)', borderRadius:'50%', animation:'spin .7s linear infinite' }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}

// ── 공통 스타일 ───────────────────────────────────────────
const primaryBtnSt: React.CSSProperties = {
  width:'100%', padding:'13px 0', borderRadius:12, border:'none',
  background:'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
  color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
  boxShadow:'0 4px 14px rgba(37,99,235,0.35)', transition:'opacity .13s',
}

const ghostBtnSt: React.CSSProperties = {
  padding:'12px 16px', borderRadius:12,
  background:'var(--bg2)', border:'1px solid var(--bd2)',
  color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer',
}

const inputSt: React.CSSProperties = {
  width:'100%', padding:'11px 13px', borderRadius:10,
  background:'var(--bg2)', border:'1px solid var(--bd2)',
  color:'var(--t1)', fontSize:13, outline:'none',
  fontFamily:'inherit',
}
```

**제거되는 항목 체크리스트 (전부 위 골격에 부재 확인):**
- import: `inspectionApi` 제거, `CheckResult` 타입 제거 (CheckPoint만 유지)
- 상수: `RESULT_OPTIONS`, `ZONE_LABEL`, `iconBtnSt` 제거
- state: `checkpoint/setCheckpoint`, `result/setResult`, `memo/setMemo`, `submitting/setSubmitting` 제거
- 함수: `handleSubmit` 제거. `handleRescan`은 setCheckpoint/setResult/setMemo 라인 제거된 축소판으로 유지 (현재 코드에서 done 블록의 "다음 QR 스캔" 버튼이 사용했지만 done 블록 자체가 제거되므로 사실상 dead가 됨 → handleRescan도 제거 가능. 위 골격에서는 handleRescan 자체를 제거하지 않고 남겨도 무방하지만, 깔끔히 제거해 unused warning을 피한다)
  - **결정:** 위 골격에서는 `handleRescan`을 완전히 제거 (어디서도 호출하지 않음). cpError 후 `lookupCheckpoint` 내부에서 직접 `startCamera()`를 호출하는 기존 로직이 그대로 살아있어 별도의 rescan 트리거가 불필요.
- `<header>` JSX 블록 (line 222~251) 제거 → `headerToggleBtn`을 portal로 위임
- found stage 렌더 블록 (line 322~350) 제거
- form stage 렌더 블록 (line 352~422) 제거
- done stage 렌더 블록 (line 424~451) 제거
- Stage 타입을 `'scan' | 'manual'`로 좁힘

**주의사항:**
- 카메라 누수 방지: 기존 `useEffect(() => { startCamera(); return () => { stopCamera() } }, [])`은 그대로 유지 (이미 cleanup 존재).
- StrictMode 호환: `useEffect`의 portal 슬롯 lookup은 setState idempotent하므로 두 번 실행되어도 안전.
- App.tsx의 portal 슬롯 div는 `isQrScan`일 때만 렌더되므로, QRScanPage가 마운트되는 시점에 div는 이미 DOM에 존재한다 (App Layout이 부모 컴포넌트라 먼저 렌더됨). RAF 폴백은 안전장치.
- 데스크톱(simple 헤더)에서는 portal 슬롯 div가 존재하지 않으므로 `headerSlot`이 null로 유지되어 `createPortal` 호출이 일어나지 않는다 → 토글 버튼이 헤더에 표시되지 않을 뿐 페이지 본문은 정상 동작. 추후 데스크톱 보강은 별도 task.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
- npm run build 성공 (TypeScript 에러 0건)
- `grep -nE "RESULT_OPTIONS|ZONE_LABEL|handleSubmit|setCheckpoint|setResult\\b|setMemo|setSubmitting" src/pages/QRScanPage.tsx` 결과 0건
- `grep -nE "stage === 'found'|stage === 'form'|stage === 'done'" src/pages/QRScanPage.tsx` 결과 0건
- `grep -n "type Stage" src/pages/QRScanPage.tsx` 출력에 `'scan' | 'manual'`만 포함 (found/form/done 미포함)
- `grep -n "qr-header-portal-slot" src/App.tsx` 1건 이상
- `grep -n "createPortal" src/pages/QRScanPage.tsx` 1건 이상
- `grep -n "<header" src/pages/QRScanPage.tsx` 결과 0건
- `grep -n "inspectionApi" src/pages/QRScanPage.tsx` 결과 0건
- `grep -n "CheckResult" src/pages/QRScanPage.tsx` 결과 0건
- `grep -n "iconBtnSt" src/pages/QRScanPage.tsx` 결과 0건 (사용처 모두 제거되었으므로 상수도 제거)
  </done>
</task>

</tasks>

<verification>
빌드 검증 + grep 기반 데드 코드 부재 확인 + portal 통합 확인을 한 번의 task verify에서 수행한다. 사용자 PWA 시연은 사용자 별도 지시에 따라 배포 단계에서 수행 (이번 task 범위 외).
</verification>

<success_criteria>
- src/pages/QRScanPage.tsx가 scan/manual 두 stage만 렌더한다 (found/form/done 코드 0건)
- 페이지 자체 `<header>`가 사라지고 GlobalHeader 단일 헤더만 노출된다
- GlobalHeader 우측 슬롯에 stage 토글 버튼이 portal로 정상 마운트된다 (HMR/StrictMode에서도)
- 다른 페이지(대시보드/일반 점검 등)의 GlobalHeader 동작은 그대로다 — App.tsx의 isQrScan 분기는 `/inspection/qr` 한 경로에서만 활성화
- 카메라 권한/Ultra Wide/zoom 0.5x 안전망 등 기존 보강 로직 모두 유지
- npm run build TypeScript 에러 0
</success_criteria>

<output>
사용자가 commit/배포 지시 시 추가 단계 진행. 이번 plan은 코드 수정 + npm run build 검증까지.
요약 파일은 quick task 관례에 따라 PROGRESS.md/VERIFICATION.md 형식으로 사용자가 최종 확인 후 작성.
</output>
