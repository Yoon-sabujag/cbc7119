import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FloorB5, MARKER_STATUS_COLOR, type FloorMarker } from '../components/floors/FloorB5'

// ── 현재 구현된 층 ──────────────────────────────────────────────
const FLOORS = [
  { id: 'B5', label: 'B5', ready: true  },
  { id: 'B4', label: 'B4', ready: false },
  { id: 'B3', label: 'B3', ready: false },
  { id: 'B2', label: 'B2', ready: false },
  { id: 'M',  label: 'M',  ready: false },
  { id: 'B1', label: 'B1', ready: false },
  { id: '1F', label: '1F', ready: false },
  { id: '2F', label: '2F', ready: false },
  { id: '3F', label: '3F', ready: false },
  { id: '5F', label: '5F', ready: false },
  { id: '6F', label: '6F', ready: false },
  { id: '7F', label: '7F', ready: false },
  { id: '8F', label: '8F', ready: false },
]

// ── 샘플 마커 (추후 DB 연동) ────────────────────────────────────
const SAMPLE_MARKERS: FloorMarker[] = [
  { id: 'm1', x: 190, y: 335, type: 'extinguisher', name: '소화기 B5-01', status: 'normal',  lastInspect: '2026-03-20' },
  { id: 'm2', x: 190, y: 420, type: 'extinguisher', name: '소화기 B5-02', status: 'caution', lastInspect: '2026-03-10' },
  { id: 'm3', x: 190, y: 508, type: 'extinguisher', name: '소화기 B5-03', status: 'normal',  lastInspect: '2026-03-20' },
  { id: 'm4', x: 500, y: 390, type: 'hydrant',      name: '옥내소화전 B5-01', status: 'normal', lastInspect: '2026-03-15' },
  { id: 'm5', x: 720, y: 390, type: 'hydrant',      name: '옥내소화전 B5-02', status: 'normal', lastInspect: '2026-03-15' },
  { id: 'm6', x: 500, y: 520, type: 'detector',     name: '감지기 B5-01', status: 'normal' },
  { id: 'm7', x: 650, y: 520, type: 'detector',     name: '감지기 B5-02', status: 'fault',  lastInspect: '2026-03-18' },
]

const TYPE_LABEL: Record<FloorMarker['type'], string> = {
  extinguisher: '소화기',
  hydrant:      '옥내소화전',
  detector:     '감지기',
  sprinkler:    '스프링클러',
  exit_light:   '유도등',
  pump:         '소방펌프',
  other:        '기타',
}
const STATUS_LABEL: Record<FloorMarker['status'], string> = {
  normal:  '정상',
  caution: '주의',
  fault:   '불량',
}

// ── SVG 원본 치수 ──────────────────────────────────────────────
const SVG_W = 960
const SVG_H = 680

export default function FloorPlanPage() {
  const navigate = useNavigate()
  const [floor, setFloor] = useState('B5')
  const [selected, setSelected] = useState<FloorMarker | null>(null)

  // viewBox 상태 (pan/zoom)
  const [vb, setVb] = useState({ x: 0, y: 0, w: SVG_W, h: SVG_H })
  const vbRef = useRef(vb)
  vbRef.current = vb

  // 터치 추적
  const prevTouches = useRef<{ x: number; y: number }[]>([])
  const prevDist    = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  function dist2(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }

  function onTouchStart(e: React.TouchEvent) {
    const ts = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }))
    prevTouches.current = ts
    if (ts.length === 2) prevDist.current = dist2(ts[0], ts[1])
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    const ts   = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }))
    const prev = prevTouches.current
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const cur = vbRef.current

    if (ts.length === 1 && prev.length >= 1) {
      // 패닝
      const sx = cur.w / rect.width
      const sy = cur.h / rect.height
      const dx = (ts[0].x - prev[0].x) * sx
      const dy = (ts[0].y - prev[0].y) * sy
      setVb(v => ({
        ...v,
        x: Math.min(Math.max(v.x - dx, -SVG_W * 0.3), SVG_W * 0.3),
        y: Math.min(Math.max(v.y - dy, -SVG_H * 0.3), SVG_H * 0.3),
      }))

    } else if (ts.length === 2 && prev.length >= 2) {
      // 핀치 줌
      const d    = dist2(ts[0], ts[1])
      const scale = prevDist.current / d
      prevDist.current = d

      // 핀치 중심점 → SVG 좌표
      const cx   = (ts[0].x + ts[1].x) / 2
      const cy   = (ts[0].y + ts[1].y) / 2
      const svgX = cur.x + (cx - rect.left) / rect.width  * cur.w
      const svgY = cur.y + (cy - rect.top)  / rect.height * cur.h

      const minW = SVG_W * 0.25
      const newW = Math.min(Math.max(cur.w * scale, minW), SVG_W)
      const newH = newW * (SVG_H / SVG_W)

      setVb({
        x: svgX - (cx - rect.left) / rect.width  * newW,
        y: svgY - (cy - rect.top)  / rect.height * newH,
        w: newW,
        h: newH,
      })
    }
    prevTouches.current = ts
  }

  function onTouchEnd() {
    prevTouches.current = []
  }

  function resetView() {
    setVb({ x: 0, y: 0, w: SVG_W, h: SVG_H })
  }

  const viewBox = `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}>

      {/* ── 헤더 ──────────────────────────────────────────────── */}
      <header style={{ flexShrink: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>건물 도면</span>
        <button
          onClick={resetView}
          style={{ height: 30, padding: '0 10px', borderRadius: 7, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
        >
          초기화
        </button>
      </header>

      {/* ── 층 선택 탭 ─────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, overflowX: 'auto', display: 'flex', gap: 4, padding: '7px 10px', background: 'var(--bg2)', borderBottom: '1px solid var(--bd)' }}>
        {FLOORS.map(f => (
          <button
            key={f.id}
            onClick={() => f.ready && setFloor(f.id)}
            style={{
              flexShrink: 0,
              padding: '4px 10px', borderRadius: 7,
              fontSize: 11, fontWeight: 600, cursor: f.ready ? 'pointer' : 'default',
              background: floor === f.id ? 'var(--acl)' : 'var(--bg3)',
              color:      floor === f.id ? '#fff' : f.ready ? 'var(--t2)' : 'var(--t3)',
              border:     '1px solid ' + (floor === f.id ? 'transparent' : 'var(--bd)'),
              opacity:    f.ready ? 1 : 0.4,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── SVG 캔버스 ─────────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => selected && setSelected(null)}
      >
        <svg
          style={{ width: '100%', height: '100%', display: 'block' }}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {floor === 'B5' && (
            <FloorB5
              markers={SAMPLE_MARKERS}
              onMarkerClick={m => { setSelected(m) }}
            />
          )}
          {floor !== 'B5' && (
            <text x="480" y="340" textAnchor="middle"
              fill="rgba(139,148,158,0.4)" fontSize="18" fontWeight="600"
              fontFamily="Noto Sans KR, sans-serif">
              {floor} 도면 준비 중
            </text>
          )}
        </svg>
      </div>

      {/* ── 범례 ──────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, padding: '7px 12px', background: 'var(--bg2)', borderTop: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {(['normal', 'caution', 'fault'] as FloorMarker['status'][]).map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: MARKER_STATUS_COLOR[s] }} />
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>{STATUS_LABEL[s]}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 'auto' }}>핀치 확대 · 드래그 이동</span>
      </div>

      {/* ── 마커 상세 바텀시트 ─────────────────────────────────── */}
      {selected && (
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'var(--bg2)',
            borderTop: '1px solid var(--bd2)',
            borderRadius: '16px 16px 0 0',
            padding: '16px 16px 28px',
            zIndex: 30,
            boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* 핸들 */}
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd2)', margin: '0 auto 14px' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            {/* 상태 인디케이터 */}
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: MARKER_STATUS_COLOR[selected.status] + '22',
              border: `1.5px solid ${MARKER_STATUS_COLOR[selected.status]}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: MARKER_STATUS_COLOR[selected.status] }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>{selected.name}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>{TYPE_LABEL[selected.type]}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: MARKER_STATUS_COLOR[selected.status] }}>
                  {STATUS_LABEL[selected.status]}
                </span>
                {selected.lastInspect && (
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>최근 점검 {selected.lastInspect}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          <button
            style={{
              width: '100%', height: 46, borderRadius: 12,
              background: 'var(--acl)', border: 'none',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            점검 기록 입력
          </button>
        </div>
      )}

    </div>
  )
}
