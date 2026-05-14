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

  // ── 카메라 정지 (모든 미디어 트랙 해제) ──
  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        try { await scannerRef.current.stop() } catch { /* */ }
        try { scannerRef.current.clear() } catch { /* */ }
        scannerRef.current = null
      }
    } catch { /* 이미 정지됨 */ }
    // 혹시 남아있는 카메라 트랙 강제 해제
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
        // 점검 페이지로 이동하면서 QR로 찾은 체크포인트 정보 전달
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
      // ── Ultra Wide 카메라 자동 선택 (주로 iPhone 13 Pro 이상) ──
      let cameras: { id: string; label: string }[] = []
      try {
        cameras = await Html5Qrcode.getCameras()
      } catch {
        // iOS Safari: 권한 부여 전이면 throw — 아래에서 프라임 시도
      }
      // 라벨이 비었거나 모두 generic 이면 권한 프라임 후 재조회
      if (cameras.length === 0 || cameras.every(c => !c.label)) {
        try {
          const primeStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          })
          primeStream.getTracks().forEach(t => t.stop())
          cameras = await Html5Qrcode.getCameras()
        } catch {
          // 권한 거부 / 미지원 — 폴백 분기로 진행
        }
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

      // ── zoom 0.5x 안전망 (라벨 매칭 실패한 환경에서 메인 카메라 광각 강제. 미지원이면 무시) ──
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
