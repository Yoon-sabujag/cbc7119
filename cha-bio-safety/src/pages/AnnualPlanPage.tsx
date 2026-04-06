import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { generateAnnualPlan } from '../utils/generateAnnualPlan'
import { useIsDesktop } from '../hooks/useIsDesktop'

const STORAGE_KEY = 'annual_plan_year_pos'
const FINGER_OFFSET = 60

function loadPos(): { x: number; y: number } | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') } catch { return null }
}

export default function AnnualPlanPage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const [loading, setLoading] = useState(false)
  const [calibMode, setCalibMode] = useState(false)
  const [yearPos, setYearPos] = useState<{ x: number; y: number } | null>(loadPos)
  const imgRef = useRef<HTMLImageElement>(null)
  const nextYear = new Date().getFullYear() + 1

  const handleDownload = async () => {
    setLoading(true)
    try {
      await generateAnnualPlan()
      toast.success('엑셀이 다운로드됐습니다')
    } catch (e: any) {
      toast.error(e?.message ?? '생성 중 오류')
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!calibMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const pos = { x, y }
    setYearPos(pos)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
    setCalibMode(false)
    toast.success(`연도 위치 저장됨 (${x.toFixed(1)}%, ${y.toFixed(1)}%)`)
  }

  const handleImageTouch = (e: React.TouchEvent<HTMLImageElement>) => {
    if (!calibMode) return
    e.preventDefault()
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = (((touch.clientY - FINGER_OFFSET) - rect.top) / rect.height) * 100
    const pos = { x, y }
    setYearPos(pos)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
    setCalibMode(false)
    toast.success(`연도 위치 저장됨`)
  }

  const previewImage = (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <img
        ref={imgRef}
        src="/templates/preview/annual-plan.png"
        alt="연간 업무 추진 계획 미리보기"
        onClick={handleImageClick}
        onTouchStart={handleImageTouch}
        style={{
          width:'100%', height:'100%', objectFit:'contain',
          borderRadius:8,
          border: calibMode ? '2px solid var(--acl)' : '1px solid var(--bd)',
          background:'#fff',
          cursor: calibMode ? 'crosshair' : 'default',
        }}
      />
      {/* 연도 오버레이 */}
      {yearPos && (
        <div style={{
          position:'absolute',
          top:`${yearPos.y}%`, left:`${yearPos.x}%`,
          transform:'translate(-50%,-50%)',
          fontSize:'min(1.4vw, 16px)', fontWeight:700,
          color:'#000', fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif',
          pointerEvents:'none',
        }}>
          {nextYear}
        </div>
      )}
      {/* 캘리브레이션 안내 */}
      {calibMode && (
        <div style={{
          position:'absolute', top:8, left:'50%', transform:'translateX(-50%)',
          background:'rgba(59,130,246,0.9)', color:'#fff',
          padding:'6px 16px', borderRadius:8,
          fontSize:12, fontWeight:700, whiteSpace:'nowrap',
          pointerEvents:'none',
        }}>
          연도가 들어갈 위치를 클릭하세요
        </div>
      )}
    </div>
  )

  // ── 데스크톱: 상하 2분할 ──
  if (isDesktop) {
    return (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* 상단: 설명 + 버튼들 */}
        <div style={{
          flexShrink:0, padding:'16px 28px',
          display:'flex', alignItems:'center', gap:12,
          borderBottom:'1px solid var(--bd)',
        }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>
              {nextYear}년 연간 업무 추진 계획
            </div>
            <div style={{ fontSize:12, color:'var(--t3)', marginTop:3 }}>
              표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.
            </div>
          </div>
          <button
            onClick={() => setCalibMode(m => !m)}
            style={{
              padding:'8px 14px', borderRadius:8,
              border: calibMode ? '1px solid var(--acl)' : '1px solid var(--bd2)',
              background: calibMode ? 'rgba(59,130,246,0.1)' : 'var(--bg3)',
              color: calibMode ? 'var(--acl)' : 'var(--t2)',
              fontSize:12, fontWeight:700, cursor:'pointer',
            }}
          >
            {calibMode ? '취소' : '위치 조정'}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              padding:'8px 20px', borderRadius:8, border:'none',
              background: loading ? 'var(--bg3)' : 'linear-gradient(135deg,#1e40af,#3b82f6)',
              color: loading ? 'var(--t3)' : '#fff',
              fontSize:13, fontWeight:700, cursor: loading ? 'default' : 'pointer',
              display:'flex', alignItems:'center', gap:8, flexShrink:0,
            }}
          >
            <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4M4 19h16"/>
            </svg>
            {loading ? '생성 중...' : '엑셀 다운로드'}
          </button>
        </div>

        {/* 하단: 미리보기 */}
        <div style={{
          flex:1, minHeight:0, overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:24, background:'var(--bg)',
        }}>
          <div style={{
            width:'100%', height:'100%',
            maxWidth:'calc((100vh - 140px) * 1.414)',
            maxHeight:'100%',
          }}>
            {previewImage}
          </div>
        </div>
      </div>
    )
  }

  // ── 모바일 ──
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>
      <header style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'8px 12px 9px', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => navigate(-1)} style={{
          width:34, height:34, borderRadius:8, flexShrink:0,
          background:'var(--bg3)', border:'1px solid var(--bd)',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--t1)' }}>연간 업무 추진 계획</span>
        <button
          onClick={() => setCalibMode(m => !m)}
          style={{
            padding:'6px 10px', borderRadius:8,
            border: calibMode ? '1px solid var(--acl)' : '1px solid var(--bd2)',
            background: calibMode ? 'rgba(59,130,246,0.1)' : 'var(--bg3)',
            color: calibMode ? 'var(--acl)' : 'var(--t2)',
            fontSize:11, fontWeight:700, cursor:'pointer',
          }}
        >
          {calibMode ? '취소' : '위치 조정'}
        </button>
      </header>

      <div style={{ flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:16 }}>
        {/* 미리보기 */}
        <div style={{ width:'100%' }}>
          {previewImage}
        </div>

        {/* 설명 + 다운로드 */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:13, color:'var(--t3)', marginBottom:12 }}>
            표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.
          </div>
          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              width:'100%', padding:'14px', borderRadius:10, border:'none',
              background: loading ? 'var(--bg3)' : 'linear-gradient(135deg,#1e40af,#3b82f6)',
              color: loading ? 'var(--t3)' : '#fff',
              fontSize:14, fontWeight:700, cursor: loading ? 'default' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}
          >
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4M4 19h16"/>
            </svg>
            {loading ? '생성 중...' : '엑셀 다운로드'}
          </button>
        </div>
      </div>
    </div>
  )
}
