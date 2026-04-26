import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuthStore } from '../stores/authStore'
import { inspectionApi } from '../utils/api'
import type { CheckPoint, CheckResult } from '../types'

// ── 타입 ──────────────────────────────────────────────────
type Stage = 'scan' | 'manual' | 'found' | 'form' | 'done'

const RESULT_OPTIONS: { value: CheckResult; label: string; color: string; bg: string; icon: string }[] = [
  { value: 'normal',     label: '정상',   color: 'var(--safe)',   bg: 'rgba(34,197,94,.13)',   icon: '✅' },
  { value: 'caution',    label: '주의',   color: 'var(--warn)',   bg: 'rgba(245,158,11,.13)',  icon: '⚠️' },
  { value: 'bad',        label: '불량',   color: 'var(--danger)', bg: 'rgba(239,68,68,.13)',   icon: '❌' },
  { value: 'unresolved', label: '미조치', color: 'var(--fire)',   bg: 'rgba(249,115,22,.13)',  icon: '🔧' },
  { value: 'missing',    label: '미확인', color: 'var(--t3)',     bg: 'rgba(110,118,129,.13)', icon: '❓' },
]

const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', common: '공용' }

const QR_REGION_ID = 'qr-reader-region'

export default function QRScanPage() {
  const navigate  = useNavigate()
  const { staff } = useAuthStore()

  const [stage,      setStage]      = useState<Stage>('scan')
  const [camError,   setCamError]   = useState<string | null>(null)
  const [manualQr,   setManualQr]   = useState('')
  const [checkpoint, setCheckpoint] = useState<CheckPoint | null>(null)
  const [cpError,    setCpError]    = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState<CheckResult | null>(null)
  const [memo,       setMemo]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [scanning,   setScanning]   = useState(false)
  // 🐞 debug — Ultra Wide / zoom 진단. 디버그 완료 후 제거 예정 (260426-jzp)
  const [diag, setDiag] = useState<{
    cams: string[]
    pick: string
    zoom: string
    caps: string
  }>({ cams: [], pick: '', zoom: '', caps: '' })

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
    } catch (e: any) {
      if (e?.message?.includes('permission') || e?.message?.includes('NotAllowed')) {
        setCamError('카메라 권한이 필요합니다.\n설정에서 카메라 접근을 허용해주세요.')
      } else {
        setCamError('카메라를 시작할 수 없습니다.\n수동 입력을 이용해주세요.')
      }
    }
  }

  // ── 결과 저장 ──
  const handleSubmit = async () => {
    if (!result || !checkpoint || !staff) return
    setSubmitting(true)
    setCpError(null)
    try {
      const today = new Date().toISOString().slice(0, 10)
      let sessionId: string
      try {
        const sessions = await inspectionApi.getSessions(today)
        const mine = sessions.find((s: any) => s.staff_id === staff.id || s.staffId === staff.id)
        if (mine) {
          sessionId = mine.id
        } else {
          throw new Error('no session')
        }
      } catch {
        const sess = await inspectionApi.createSession({
          date:  today,
          floor: checkpoint.floor,
          zone:  checkpoint.zone,
        })
        sessionId = sess.id
      }
      await inspectionApi.submitRecord(sessionId, {
        checkpointId: checkpoint.id,
        result,
        memo: memo.trim() || undefined,
      })
      setStage('done')
    } catch (e: any) {
      setCpError(e.message ?? '저장 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── 다시 스캔 ──
  const handleRescan = () => {
    setCheckpoint(null)
    setResult(null)
    setMemo('')
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

  // ────────────────────────────────────────────────────────
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>

      {/* 헤더 */}
      <header style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'8px 12px 8px', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => { stopCamera(); navigate(-1) }} style={iconBtnSt}>
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)', flex:1 }}>
          {stage === 'scan'   && 'QR 스캔'}
          {stage === 'manual' && 'QR 코드 수동 입력'}
          {stage === 'found' && '체크포인트 확인'}
          {stage === 'form'  && '점검 결과 입력'}
          {stage === 'done'  && '저장 완료'}
        </span>
        {stage === 'scan' && (
          <button
            onClick={() => { stopCamera(); setStage('manual') }}
            style={{ ...iconBtnSt, width:'auto', padding:'0 10px', fontSize:11, fontWeight:600, color:'var(--t2)' }}
          >
            수동입력
          </button>
        )}
        {stage === 'manual' && (
          <button
            onClick={() => { setStage('scan'); startCamera() }}
            style={{ ...iconBtnSt, width:'auto', padding:'0 10px', fontSize:11, fontWeight:600, color:'var(--acl)' }}
          >
            카메라
          </button>
        )}
      </header>

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

        {/* ── 체크포인트 확인 ── */}
        {stage === 'found' && checkpoint && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:16, gap:12, animation:'slideUp .22s ease-out' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--bd2)', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--bd)', background:'linear-gradient(100deg,rgba(59,130,246,.12),rgba(14,165,233,.06))' }}>
                <div style={{ fontSize:9, fontWeight:700, color:'var(--info)', letterSpacing:'.06em', marginBottom:3 }}>체크포인트 확인</div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>{checkpoint.location}</div>
              </div>
              <div style={{ padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'층',   value: checkpoint.floor },
                  { label:'구역', value: ZONE_LABEL[checkpoint.zone] ?? checkpoint.zone },
                  { label:'분류', value: checkpoint.category },
                  ...(checkpoint.description ? [{ label:'설명', value: checkpoint.description }] : []),
                  { label:'ID',  value: checkpoint.id, mono: true },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ fontSize:10, fontWeight:700, color:'var(--t3)', width:36, flexShrink:0, paddingTop:1 }}>{row.label}</span>
                    <span style={{ fontSize:11, color:'var(--t1)', fontFamily:(row as any).mono ? 'JetBrains Mono,monospace' : undefined, lineHeight:1.4 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleRescan} style={{ ...ghostBtnSt, flex:1 }}>다시 스캔</button>
              <button onClick={() => setStage('form')} style={{ ...primaryBtnSt, flex:2 }}>결과 입력 →</button>
            </div>
          </div>
        )}

        {/* ── 결과 입력 폼 ── */}
        {stage === 'form' && checkpoint && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:16, gap:12, animation:'slideUp .22s ease-out' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'8px 13px', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:13 }}>📍</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{checkpoint.location}</div>
                <div style={{ fontSize:10, color:'var(--t3)' }}>{checkpoint.floor} · {ZONE_LABEL[checkpoint.zone]} · {checkpoint.category}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:8 }}>점검 결과 선택</div>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {RESULT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setResult(opt.value)}
                    style={{
                      display:'flex', alignItems:'center', gap:11,
                      padding:'11px 14px', borderRadius:12, cursor:'pointer',
                      border: result === opt.value ? `1.5px solid ${opt.color}` : '1px solid var(--bd)',
                      background: result === opt.value ? opt.bg : 'var(--bg2)',
                      transition:'all .13s',
                    }}
                  >
                    <span style={{ fontSize:18 }}>{opt.icon}</span>
                    <span style={{ fontSize:13, fontWeight:700, color: result === opt.value ? opt.color : 'var(--t2)' }}>
                      {opt.label}
                    </span>
                    {result === opt.value && (
                      <svg style={{ marginLeft:'auto' }} width={16} height={16} fill="none" viewBox="0 0 24 24" stroke={opt.color} strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--t2)', display:'block', marginBottom:6 }}>
                메모 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span>
              </label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="특이사항, 조치내용 등을 입력하세요"
                rows={3}
                style={{ ...inputSt, resize:'none', lineHeight:1.5 }}
              />
            </div>

            {cpError && (
              <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'10px 13px', fontSize:11, color:'var(--danger)', textAlign:'center' }}>
                {cpError}
              </div>
            )}

            <div style={{ display:'flex', gap:8, paddingBottom:8 }}>
              <button onClick={() => setStage('found')} style={ghostBtnSt}>← 뒤로</button>
              <button
                onClick={handleSubmit}
                disabled={!result || submitting}
                style={{ ...primaryBtnSt, flex:1, opacity:(!result || submitting) ? 0.5 : 1 }}
              >
                {submitting ? '저장 중...' : '점검 기록 저장'}
              </button>
            </div>
          </div>
        )}

        {/* ── 완료 ── */}
        {stage === 'done' && checkpoint && result && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:16, animation:'slideUp .25s ease-out' }}>
            <div style={{ fontSize:56 }}>
              {RESULT_OPTIONS.find(o => o.value === result)?.icon}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--t1)', marginBottom:4 }}>저장 완료!</div>
              <div style={{ fontSize:12, color:'var(--t2)' }}>{checkpoint.location}</div>
            </div>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--bd2)', borderRadius:14, padding:'12px 18px', width:'100%', maxWidth:300, textAlign:'center' }}>
              {(() => {
                const opt = RESULT_OPTIONS.find(o => o.value === result)!
                return (
                  <>
                    <div style={{ fontSize:11, color:'var(--t3)', marginBottom:6 }}>점검 결과</div>
                    <div style={{ fontSize:20, fontWeight:700, color:opt.color }}>{opt.label}</div>
                    {memo && <div style={{ fontSize:10, color:'var(--t3)', marginTop:8, lineHeight:1.5 }}>{memo}</div>}
                  </>
                )
              })()}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%', maxWidth:300 }}>
              <button onClick={handleRescan} style={primaryBtnSt}>다음 QR 스캔</button>
              <button onClick={() => { stopCamera(); navigate('/dashboard') }} style={ghostBtnSt}>대시보드로 이동</button>
            </div>
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
const iconBtnSt: React.CSSProperties = {
  width:34, height:34, borderRadius:8, flexShrink:0,
  background:'var(--bg3)', border:'1px solid var(--bd)',
  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
}

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
