import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { generateAnnualPlan } from '../utils/generateAnnualPlan'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { ChevronLeft, Download } from 'lucide-react'

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
        className={`rounded-sm ${calibMode ? 'border-2 border-accent' : 'border border-border-default'}`}
        style={{
          width:'100%', height:'100%', objectFit:'contain',
          background:'#fff',
          cursor: calibMode ? 'crosshair' : 'default',
        }}
      />
      {/* 연도 오버레이 — 캘리브 좌표 시스템 시그니처 (1 byte 변경 금지) */}
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
      {/* 캘리브레이션 안내 — OQ #5 LOCKED (rgba 인라인 유지) */}
      {calibMode && (
        <div
          className="text-caption font-bold leading-none text-white rounded-sm"
          style={{
            position:'absolute', top:8, left:'50%', transform:'translateX(-50%)',
            background:'rgba(59,130,246,0.9)',
            padding:'6px 16px',
            whiteSpace:'nowrap',
            pointerEvents:'none',
          }}
        >
          연도가 들어갈 위치를 클릭하세요
        </div>
      )}
    </div>
  )

  // ── 데스크톱: 상하 2분할 ──
  if (isDesktop) {
    return (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* 상단: 설명 + 버튼들 — 페이지 제목은 App.tsx 헤더에서 표시 */}
        <div
          className="border-b border-border-default flex items-center"
          style={{ flexShrink:0, padding:'14px 28px', gap:12 }}
        >
          <div className="text-caption leading-none text-text-tertiary" style={{ flex:1 }}>
            대상 연도 <strong className="text-text-primary font-bold">{nextYear}년</strong> — 표지 및 일정표 연도가 자동 설정됩니다.
          </div>
          <button
            onClick={() => setCalibMode(m => !m)}
            className={`text-caption font-bold leading-none rounded-sm border ${calibMode ? 'border-accent bg-accent/10 text-accent' : 'bg-surface-sunken border-border-strong text-text-secondary'}`}
            style={{ padding:'8px 14px', cursor:'pointer' }}
          >
            {calibMode ? '취소' : '위치 조정'}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`text-label font-bold leading-none rounded-sm flex items-center ${loading ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed' : 'bg-safe-bar text-text-on-accent cursor-pointer'}`}
            style={{ padding:'8px 20px', gap:8, border:'none', flexShrink:0 }}
          >
            <Download size={15} />
            {loading ? '생성 중...' : '엑셀 다운로드'}
          </button>
        </div>

        {/* 하단: 미리보기 */}
        <div
          className="bg-surface-page"
          style={{
            flex:1, minHeight:0, overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:24,
          }}
        >
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
    <div className="bg-surface-page w-full h-full flex flex-col overflow-hidden">
      <header className="bg-surface-raised border-b border-border-default flex items-center shrink-0 h-12 px-3 gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-7 h-7 rounded-sm bg-surface-sunken border border-border-default flex items-center justify-center shrink-0 cursor-pointer"
        >
          <ChevronLeft size={15} className="text-text-secondary" />
        </button>
        <span className="text-title font-semibold text-text-primary flex-1">연간 업무 추진 계획</span>
        <button
          onClick={() => setCalibMode(m => !m)}
          className={`text-caption font-bold leading-none rounded-sm border px-2.5 h-7 inline-flex items-center cursor-pointer ${calibMode ? 'border-accent bg-accent/10 text-accent' : 'bg-surface-sunken border-border-strong text-text-secondary'}`}
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
          <div className="text-label leading-relaxed text-text-tertiary" style={{ marginBottom:12 }}>
            표지 및 일정표 연도가 {nextYear}년으로 자동 설정됩니다.
          </div>
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`text-body font-bold rounded-md flex items-center justify-center ${loading ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed' : 'bg-safe-bar text-text-on-accent cursor-pointer'}`}
            style={{ width:'100%', padding:'14px', gap:8, border:'none' }}
          >
            <Download size={16} />
            {loading ? '생성 중...' : '엑셀 다운로드'}
          </button>
        </div>
      </div>
    </div>
  )
}
