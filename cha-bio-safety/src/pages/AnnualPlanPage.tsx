import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, Crosshair, FileDown } from 'lucide-react'
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
    <div className="relative w-full h-full">
      <img
        ref={imgRef}
        src="/templates/preview/annual-plan.png"
        alt="연간 업무 추진 계획 미리보기"
        onClick={handleImageClick}
        onTouchStart={handleImageTouch}
        className={[
          'w-full h-full object-contain rounded-sm bg-white',
          calibMode ? 'border-2 border-accent cursor-crosshair' : 'border border-border-default cursor-default',
        ].join(' ')}
      />
      {/* 연도 오버레이 — 좌표 동적이라 inline style 필수 */}
      {yearPos && (
        <div
          className="absolute font-bold text-black pointer-events-none"
          style={{
            top: `${yearPos.y}%`,
            left: `${yearPos.x}%`,
            transform: 'translate(-50%,-50%)',
            fontSize: 'min(1.4vw, 16px)',
            fontFamily: 'Malgun Gothic, 맑은 고딕, sans-serif',
          }}
        >
          {nextYear}
        </div>
      )}
      {/* 캘리브 안내 칩 */}
      {calibMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-accent text-text-on-accent px-3.5 py-1.5 rounded-sm text-caption font-bold whitespace-nowrap pointer-events-none">
          연도가 들어갈 위치를 클릭하세요
        </div>
      )}
    </div>
  )

  // ── 데스크톱: 자체 헤더 통합 ──
  if (isDesktop) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-surface-page">

        {/* 자체 헤더 — sketch verbatim */}
        <header className="flex-shrink-0 h-[54px] px-5 bg-surface-raised border-b border-border-default flex items-center gap-2.5">
          <span className="flex-1 text-title font-bold text-text-primary">연간 업무 추진 계획</span>
          <div className="flex items-center gap-3">
            <span className="text-caption text-text-tertiary">
              대상 연도 <strong className="text-text-primary font-bold text-label">{nextYear}년</strong>
            </span>
            <button
              onClick={() => setCalibMode(m => !m)}
              className={[
                'h-9 px-3 rounded-sm text-label font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors',
                calibMode
                  ? 'bg-accent-soft border border-accent text-accent'
                  : 'bg-surface-sunken border border-border-default text-text-secondary hover:bg-surface-active',
              ].join(' ')}
            >
              <Crosshair size={14} />
              {calibMode ? '취소' : '위치 조정'}
            </button>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="h-11 px-4 rounded-sm bg-cta-gradient hover:bg-cta-gradient-hover text-white text-body-sm font-bold cursor-pointer inline-flex items-center gap-2 disabled:bg-none disabled:bg-surface-sunken disabled:text-text-tertiary disabled:cursor-not-allowed transition-colors"
            >
              <FileDown size={16} />
              {loading ? '생성 중...' : '엑셀 다운로드'}
            </button>
          </div>
        </header>

        {/* 미리보기 영역 */}
        <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-6 bg-surface-page">
          <div className="w-full h-full max-w-[calc((100vh-140px)*1.414)] max-h-full">
            {previewImage}
          </div>
        </div>
      </div>
    )
  }

  // ── 모바일 ──
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-surface-page">

      {/* 자체 헤더 */}
      <header className="flex-shrink-0 bg-surface-raised border-b border-border-default flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="w-9 h-9 rounded-sm bg-surface-sunken border border-border-default flex items-center justify-center text-text-secondary cursor-pointer flex-shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="flex-1 text-body font-bold text-text-primary">연간 업무 추진 계획</span>
        <button
          onClick={() => setCalibMode(m => !m)}
          className={[
            'h-8 px-2.5 rounded-sm text-caption font-semibold cursor-pointer inline-flex items-center gap-1 leading-none transition-colors',
            calibMode
              ? 'bg-accent-soft border border-accent text-accent'
              : 'bg-surface-sunken border border-border-default text-text-secondary',
          ].join(' ')}
        >
          <Crosshair size={13} />
          {calibMode ? '취소' : '위치 조정'}
        </button>
      </header>

      {/* 본문 (스크롤) + sticky bottom CTA */}
      <div className="flex-1 overflow-auto flex flex-col px-4 pt-4">
        <div className="w-full">
          {previewImage}
        </div>

        <div className="text-center pt-4 pb-3">
          <div className="text-label text-text-tertiary">
            표지 및 일정표 연도가 <strong className="text-text-primary font-bold">{nextYear}년</strong>으로 자동 설정됩니다.
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface-page pt-2 pb-4 mt-auto">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full h-11 px-4 rounded-sm bg-cta-gradient hover:bg-cta-gradient-hover text-white text-body-sm font-bold cursor-pointer inline-flex items-center justify-center gap-2 disabled:bg-none disabled:bg-surface-sunken disabled:text-text-tertiary disabled:cursor-not-allowed transition-colors"
          >
            <FileDown size={16} />
            {loading ? '생성 중...' : '엑셀 다운로드'}
          </button>
        </div>
      </div>
    </div>
  )
}
