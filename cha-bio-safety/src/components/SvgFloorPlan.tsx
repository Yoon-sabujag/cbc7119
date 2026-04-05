import { useRef, useEffect, useState } from 'react'

interface SvgFloorPlanProps {
  url: string
  scale: number
  onReady: (info: { naturalW: number; naturalH: number; offX: number; offY: number; w: number; h: number }) => void
}

/**
 * SVG 도면을 <object> 태그로 렌더.
 * - 기본 뷰/줌 중: CSS transform scale이 처리 (부모에서)
 * - 줌 멈춘 후(디바운스): object 내부 SVG width/height를 줌 스케일 반영하여 재설정
 *   → 브라우저가 해당 크기로 벡터 재래스터화 → 선명
 */
export default function SvgFloorPlan({ url, scale, onReady }: SvgFloorPlanProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const objectRef = useRef<HTMLObjectElement>(null)
  const [loading, setLoading] = useState(true)
  const naturalSize = useRef({ w: 0, h: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  function handleLoad() {
    const obj = objectRef.current
    const container = containerRef.current
    if (!obj || !container) return

    const cw = container.clientWidth
    const ch = container.clientHeight
    if (cw === 0 || ch === 0) return

    try {
      const svgDoc = obj.contentDocument
      const svgEl = svgDoc?.querySelector('svg')
      if (!svgEl) return

      const vb = svgEl.viewBox.baseVal
      const nw = vb.width || 1
      const nh = vb.height || 1
      naturalSize.current = { w: nw, h: nh }

      // contain 방식 표시 크기
      const fitScale = Math.min(cw / nw, ch / nh)
      const displayW = nw * fitScale
      const displayH = nh * fitScale

      // SVG 초기 크기를 display 크기 × dpr로 설정 (기본 뷰 선명도)
      const dpr = window.devicePixelRatio || 1
      svgEl.setAttribute('width', String(Math.round(displayW * dpr)))
      svgEl.setAttribute('height', String(Math.round(displayH * dpr)))

      // object CSS 크기는 display 크기로 고정
      obj.style.width = `${displayW}px`
      obj.style.height = `${displayH}px`

      onReady({
        naturalW: nw, naturalH: nh,
        offX: (cw - displayW) / 2,
        offY: (ch - displayH) / 2,
        w: displayW, h: displayH,
      })
      setLoading(false)
    } catch (e) {
      console.error('SVG load error:', e)
      setLoading(false)
    }
  }

  // 줌 변경 시 SVG 내부 해상도 업데이트 (디바운스)
  useEffect(() => {
    const obj = objectRef.current
    if (!obj || naturalSize.current.w === 0) return

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const svgDoc = obj.contentDocument
        const svgEl = svgDoc?.querySelector('svg')
        if (!svgEl) return

        const container = containerRef.current
        if (!container) return
        const cw = container.clientWidth
        const ch = container.clientHeight
        const nw = naturalSize.current.w
        const nh = naturalSize.current.h
        const fitScale = Math.min(cw / nw, ch / nh)
        const displayW = nw * fitScale
        const displayH = nh * fitScale
        const dpr = window.devicePixelRatio || 1

        // SVG 내부 크기를 현재 줌 × dpr로 설정 → 벡터 재래스터화
        svgEl.setAttribute('width', String(Math.round(displayW * dpr * scale)))
        svgEl.setAttribute('height', String(Math.round(displayH * dpr * scale)))
      } catch { /* cross-origin */ }
    }, 200)

    return () => clearTimeout(timerRef.current)
  }, [scale])

  useEffect(() => {
    naturalSize.current = { w: 0, h: 0 }
    setLoading(true)
  }, [url])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}
    >
      <object
        ref={objectRef}
        key={url}
        data={url}
        type="image/svg+xml"
        onLoad={handleLoad}
        style={{
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        도면 로딩 실패
      </object>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--t3)', fontSize: 13, fontWeight: 600,
        }}>
          도면 로딩 중...
        </div>
      )}
    </div>
  )
}
