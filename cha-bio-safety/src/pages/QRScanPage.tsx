import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, ScanLine, Loader2, Keyboard } from 'lucide-react'
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
        className="h-8 px-3 rounded-lg bg-surface-sunken border border-border-default text-caption font-semibold text-text-secondary cursor-pointer inline-flex items-center gap-1"
      >
        <Keyboard size={14} />
        <span>수동입력</span>
      </button>
    ) : (
      <button
        onClick={() => { setStage('scan'); startCamera() }}
        className="h-8 px-3 rounded-lg bg-surface-sunken border border-border-default text-caption font-semibold text-accent cursor-pointer inline-flex items-center gap-1"
      >
        <Camera size={14} />
        <span>카메라</span>
      </button>
    )

  // ────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-surface-page">

      {headerSlot && createPortal(headerToggleBtn, headerSlot)}

      {/* 본문 */}
      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col">

        {/* ── 스캔 화면 ── */}
        {stage === 'scan' && (
          <div className="flex-1 flex flex-col items-center px-4 py-5 gap-4">

            <div className="w-full max-w-[320px] rounded-[20px] overflow-hidden bg-black ring-1 ring-border-strong relative">
              <div id={QR_REGION_ID} style={{ width:'100%' }} />
              {loading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <Loader2 size={28} className="animate-spin text-accent" />
                </div>
              )}
            </div>

            {camError ? (
              <div className="w-full max-w-[320px] bg-danger-bg border border-danger-bar/40 rounded-xl p-4 text-center">
                <Camera size={28} className="text-danger mx-auto mb-2" />
                <div className="text-caption text-text-secondary leading-relaxed whitespace-pre-line mb-3">{camError}</div>
                <div className="flex gap-2">
                  <button
                    onClick={startCamera}
                    className="w-full py-[13px] rounded-xl border-0 bg-accent text-on-accent text-body font-bold cursor-pointer transition-opacity"
                  >
                    다시 시도
                  </button>
                  <button
                    onClick={() => { stopCamera(); setStage('manual') }}
                    className="py-3 px-4 rounded-xl bg-surface-sunken border border-border-default text-text-secondary text-body-sm font-semibold cursor-pointer"
                  >
                    수동 입력
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-caption text-text-secondary text-center">
                QR 코드를 카메라에 비춰주세요
              </div>
            )}

            {cpError && (
              <div className="w-full max-w-[320px] bg-danger-bg border border-danger-bar/40 rounded-lg px-3 py-2.5 text-caption text-danger text-center whitespace-pre-line leading-relaxed">
                {cpError}
              </div>
            )}
          </div>
        )}

        {/* ── 수동 입력 ── */}
        {stage === 'manual' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <ScanLine size={40} className="text-text-secondary mx-auto" />
            <div className="w-full max-w-[320px]">
              <label className="block text-caption font-bold text-text-secondary mb-1.5">QR 코드 값</label>
              <input
                autoFocus
                value={manualQr}
                onChange={e => setManualQr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                placeholder="예: QR-3F-OFF-001"
                className="w-full px-3.5 py-3 rounded-lg bg-surface-sunken border border-border-default text-text-primary text-body-sm outline-none font-inherit"
              />
            </div>
            <button
              onClick={handleManualSearch}
              disabled={!manualQr.trim() || loading}
              className={`w-full max-w-[320px] py-[13px] rounded-xl border-0 bg-accent text-on-accent text-body font-bold cursor-pointer transition-opacity ${(!manualQr.trim() || loading) ? 'opacity-50' : ''}`}
            >
              {loading ? '조회 중...' : '체크포인트 조회'}
            </button>
            {cpError && (
              <div className="w-full max-w-[320px] bg-danger-bg border border-danger-bar/40 rounded-lg px-3 py-2.5 text-caption text-danger text-center whitespace-pre-line leading-relaxed">
                {cpError}
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  )
}
