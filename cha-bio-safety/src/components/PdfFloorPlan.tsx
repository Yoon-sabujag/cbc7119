import { useRef, useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface PdfFloorPlanProps {
  url: string
  scale?: number
  onReady: (info: { naturalW: number; naturalH: number; offX: number; offY: number; w: number; h: number }) => void
}

export default function PdfFloorPlan({ url, scale = 1, onReady }: PdfFloorPlanProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [debug, setDebug] = useState('')
  const pageRef = useRef<any>(null)
  const readyFired = useRef(false)

  // PDF 로드
  useEffect(() => {
    let cancelled = false
    pageRef.current = null
    readyFired.current = false
    setLoading(true)

    pdfjsLib.getDocument({
      url,
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: '/standard_fonts/',
    }).promise.then(doc => {
      if (cancelled) return
      return doc.getPage(1)
    }).then(page => {
      if (cancelled || !page) return
      pageRef.current = page
      renderPdf(page, scale)
    }).catch(e => {
      if (!cancelled) console.error('PDF load error:', e)
    })

    return () => { cancelled = true }
  }, [url])

  // 줌 변경 시 재렌더
  useEffect(() => {
    if (!pageRef.current) return
    const timer = setTimeout(() => renderPdf(pageRef.current, scale), 150)
    return () => clearTimeout(timer)
  }, [scale])

  function renderPdf(page: any, zoomScale: number) {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const cw = container.clientWidth
    const ch = container.clientHeight
    if (cw === 0 || ch === 0) return

    const vp0 = page.getViewport({ scale: 1 })
    const pdfW = vp0.width
    const pdfH = vp0.height
    const dpr = window.devicePixelRatio || 1
    const fitScale = Math.min(cw / pdfW, ch / pdfH)

    // 화면 물리 픽셀에 1:1 대응 → 줌 시 비례 증가
    // 최신 iPhone(A15+)은 ~50M px 지원, 구형은 ~16.7M
    const MAX_PIXELS = 40_000_000
    const rawScale = fitScale * dpr * zoomScale
    const rawPixels = (pdfW * rawScale) * (pdfH * rawScale)
    const renderScale = rawPixels > MAX_PIXELS
      ? rawScale * Math.sqrt(MAX_PIXELS / rawPixels)
      : rawScale

    const vp = page.getViewport({ scale: renderScale })

    // 캔버스 크기 = 고해상도
    canvas.width = Math.round(vp.width)
    canvas.height = Math.round(vp.height)

    // CSS 크기 = 화면 맞춤 (줌은 부모 transform이 처리)
    const displayW = pdfW * fitScale
    const displayH = pdfH * fitScale
    canvas.style.width = `${displayW}px`
    canvas.style.height = `${displayH}px`

    const dbg = `container=${cw.toFixed(0)}x${ch.toFixed(0)} canvas=${canvas.width}x${canvas.height} css=${displayW.toFixed(0)}x${displayH.toFixed(0)} scale=${renderScale.toFixed(2)}`
    setDebug(dbg)
    console.log(`[PdfFloorPlan] ${dbg}`)

    const ctx = canvas.getContext('2d')!
    // 흰 배경
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    page.render({ canvasContext: ctx, viewport: vp }).promise.then(() => {
      console.log(`[PdfFloorPlan] render complete: ${canvas.width}x${canvas.height}px`)
      if (!readyFired.current) {
        readyFired.current = true
        onReady({
          naturalW: pdfW, naturalH: pdfH,
          offX: (cw - displayW) / 2,
          offY: (ch - displayH) / 2,
          w: displayW, h: displayH,
        })
        setLoading(false)
      }
    }).catch((e: any) => {
      if (e?.name !== 'RenderingCancelled') console.error('PDF render error:', e)
    })
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', pointerEvents: 'none', userSelect: 'none' }}
        draggable={false}
      />
      {debug && (
        <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.8)', color: '#0f0', fontSize: 10, padding: '2px 6px', borderRadius: 4, zIndex: 99, fontFamily: 'monospace' }}>
          {debug}
        </div>
      )}
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
