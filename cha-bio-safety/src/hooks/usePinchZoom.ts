import { useCallback, useRef, useState } from 'react'

// Phase 25: 재사용 핀치/더블탭/휠 줌 훅.
// FloorPlanPage.tsx (:425-686) 의 검증된 줌 패턴을 self-contained 훅으로 포팅.
// FloorPlanPage 원본은 절대 수정하지 않는다 (배포된 도면 줌 회귀 위험) — 패턴만 복사.
//
// 사용: 줌 스테이지 엘리먼트에
//   ref={containerRef}
//   style={{ touchAction: 'none', transform }}
//   {...bind}
// 를 붙인다.
//
// 주의: React 합성 onTouchMove 는 일부 브라우저에서 passive-by-default 라
// preventDefault 가 필요한 consumer 는 native non-passive listener 를 별도 등록해야 한다
// (예: el.addEventListener('touchmove', h, { passive: false })). 훅은 framework-idiomatic
// 하게 유지하고, preventDefault 는 핸들러 내부에서 best-effort 로 호출한다.

interface UsePinchZoomOptions {
  maxScale?: number
  doubleTapScale?: number
}

interface Pt { x: number; y: number }

function dist(a: Pt, b: Pt) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) }
function mid(a: Pt, b: Pt): Pt { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }

export function usePinchZoom(options: UsePinchZoomOptions = {}) {
  const maxScale = options.maxScale ?? 2.5
  const doubleTapScale = options.doubleTapScale ?? 2.5

  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState<Pt>({ x: 0, y: 0 })
  const scaleRef = useRef(1)
  const txRef = useRef(0)
  const tyRef = useRef(0)
  scaleRef.current = scale
  txRef.current = translate.x
  tyRef.current = translate.y

  const prevTouches = useRef<Pt[]>([])
  const prevDist = useRef(0)
  const prevMid = useRef<Pt>({ x: 0, y: 0 })
  const isPinching = useRef(false)
  const lastTap = useRef(0)
  // 마지막 터치 시각 — 터치 더블탭 뒤 브라우저가 합성하는 dblclick 이 onDoubleClick(줌)을
  // 재발동해 확대를 즉시 원복시키던 충돌(모바일 더블탭 무반응) 방지용.
  const lastTouchAt = useRef(0)

  // translate 를 컨테이너 경계 안으로 clamp (FloorPlanPage :544-552 포팅)
  const clampTranslate = useCallback((tx: number, ty: number, s: number): Pt => {
    const el = containerRef.current
    if (!el) return { x: tx, y: ty }
    const cw = el.clientWidth, ch = el.clientHeight
    const iw = cw * s, ih = ch * s
    const maxX = Math.max(0, (iw - cw) / 2)
    const maxY = Math.max(0, (ih - ch) / 2)
    return { x: Math.min(maxX, Math.max(-maxX, tx)), y: Math.min(maxY, Math.max(-maxY, ty)) }
  }, [])

  const reset = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    lastTouchAt.current = Date.now()
    const ts = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }))
    prevTouches.current = ts
    if (ts.length === 2) {
      prevDist.current = dist(ts[0], ts[1])
      prevMid.current = mid(ts[0], ts[1])
      isPinching.current = true
    }
    // 더블탭 판정 (300ms 창) — FloorPlanPage :660-686 포팅
    if (ts.length === 1) {
      const now = Date.now()
      if (now - lastTap.current < 300) {
        if (scaleRef.current > 1.5) {
          reset()
        } else {
          const el = containerRef.current
          if (el) {
            const rect = el.getBoundingClientRect()
            const cx = ts[0].x - rect.left - rect.width / 2
            const cy = ts[0].y - rect.top - rect.height / 2
            const newScale = doubleTapScale
            const clamped = clampTranslate(-cx * (newScale - 1), -cy * (newScale - 1), newScale)
            setScale(newScale)
            setTranslate(clamped)
          }
        }
        lastTap.current = 0
      } else {
        lastTap.current = now
      }
    }
  }, [clampTranslate, reset, doubleTapScale])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    // best-effort — passive listener 면 무시됨 (상단 주석 참조)
    if (e.cancelable) e.preventDefault()
    const ts = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }))
    const prev = prevTouches.current
    const s = scaleRef.current
    const tx = txRef.current, ty = tyRef.current

    if (ts.length === 1 && prev.length >= 1 && !isPinching.current) {
      // 패닝 (scale>1 일 때만 의미 있음)
      const dx = ts[0].x - prev[0].x
      const dy = ts[0].y - prev[0].y
      setTranslate(clampTranslate(tx + dx, ty + dy, s))
    } else if (ts.length === 2 && prev.length >= 2) {
      // 핀치줌
      isPinching.current = true
      const d = dist(ts[0], ts[1])
      const m = mid(ts[0], ts[1])
      const ratio = d / prevDist.current
      const newScale = Math.min(maxScale, Math.max(1, s * ratio))
      const el = containerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const cx = m.x - rect.left - rect.width / 2
        const cy = m.y - rect.top - rect.height / 2
        const newTx = tx - (cx - tx) * (newScale / s - 1) + (m.x - prevMid.current.x)
        const newTy = ty - (cy - ty) * (newScale / s - 1) + (m.y - prevMid.current.y)
        setScale(newScale)
        setTranslate(clampTranslate(newTx, newTy, newScale))
      }
      prevDist.current = d
      prevMid.current = m
    }
    prevTouches.current = ts
  }, [clampTranslate, maxScale])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    lastTouchAt.current = Date.now()
    if (e.touches.length === 0) isPinching.current = false
    prevTouches.current = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }))
  }, [])

  // 마우스 휠 줌 (데스크톱) — FloorPlanPage :640-657 포팅
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.cancelable) e.preventDefault()
    const s = scaleRef.current
    const tx = txRef.current, ty = tyRef.current
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(maxScale, Math.max(1, s * delta))
    const el = containerRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const newTx = tx - (cx - tx) * (newScale / s - 1)
      const newTy = ty - (cy - ty) * (newScale / s - 1)
      setScale(newScale)
      setTranslate(clampTranslate(newTx, newTy, newScale))
    }
  }, [clampTranslate, maxScale])

  // 마우스 더블클릭 줌 (데스크톱)
  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    // 터치에서 합성된 dblclick 은 무시 — 터치 더블탭은 onTouchStart 가 이미 처리(중복 원복 방지).
    if (Date.now() - lastTouchAt.current < 700) return
    if (scaleRef.current > 1.5) {
      reset()
      return
    }
    const el = containerRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const newScale = doubleTapScale
      setScale(newScale)
      setTranslate(clampTranslate(-cx * (newScale - 1), -cy * (newScale - 1), newScale))
    }
  }, [clampTranslate, reset, doubleTapScale])

  const transform = `translate3d(${txRef.current}px, ${tyRef.current}px, 0) scale(${scale})`

  const bind = { onTouchStart, onTouchMove, onTouchEnd, onWheel, onDoubleClick }

  return { containerRef, scale, transform, reset, bind }
}

export default usePinchZoom
