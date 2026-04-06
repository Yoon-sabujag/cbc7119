import { useRef, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { floorPlanMarkerApi, inspectionApi, type FloorPlanMarker } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
// import PdfFloorPlan from '../components/PdfFloorPlan'
// import SvgFloorPlan from '../components/SvgFloorPlan'

// ── 도면 종류 ──────────────────────────────────────────
type PlanType = 'guidelamp' | 'detector' | 'sprinkler' | 'extinguisher'
const PLAN_TYPES: { key: PlanType; label: string; ready: boolean }[] = [
  { key: 'guidelamp',    label: '유도등',       ready: true  },
  { key: 'detector',     label: '감지기',       ready: true  },
  { key: 'sprinkler',    label: '스프링클러',    ready: true  },
  { key: 'extinguisher', label: '소화기·소화전', ready: true  },
]

// ── 층 목록 (위→아래 순서) ──────────────────────────────
const FLOORS = [
  '8-1F','8F','7F','6F','5F','3F','2F','1F','B1','B2','B3','B4','B5',
]

// ── 유도등 마커 타입 ────────────────────────────────────
type GuidelampType = 'ceiling_exit' | 'wall_exit' | 'room_corridor' | 'hallway_corridor' | 'stair_corridor' | 'seat_corridor'
const GUIDELAMP_MARKER_TYPES: { key: GuidelampType; label: [string, string] }[] = [
  { key: 'ceiling_exit',     label: ['천장', '피난구']  },
  { key: 'wall_exit',        label: ['벽부', '피난구']  },
  { key: 'room_corridor',    label: ['거실', '통로']    },
  { key: 'hallway_corridor', label: ['복도', '통로']    },
  { key: 'stair_corridor',   label: ['계단', '통로']    },
  { key: 'seat_corridor',    label: ['객석', '통로']    },
]

// ── 감지기 마커 타입 ────────────────────────────────────
type DetectorType = 'smoke_detector' | 'heat_detector'
const DETECTOR_MARKER_TYPES: { key: DetectorType; label: [string, string] }[] = [
  { key: 'smoke_detector',  label: ['연기', '감지기']  },
  { key: 'heat_detector',   label: ['열', '감지기']    },
]

// ── 스프링클러 마커 타입 ─────────────────────────────────
type SprinklerType = 'closed_head' | 'open_head' | 'king_head' | 'test_valve'
const SPRINKLER_MARKER_TYPES: { key: SprinklerType; label: [string, string] }[] = [
  { key: 'closed_head',  label: ['폐쇄형', '헤드']    },
  { key: 'open_head',    label: ['개방형', '헤드']    },
  { key: 'king_head',    label: ['헤드왕', '']        },
  { key: 'test_valve',   label: ['시험', '밸브']      },
]

// ── 소화기·소화전 마커 타입 ──────────────────────────────
type ExtinguisherType = 'fire_extinguisher' | 'indoor_hydrant' | 'descending_lifeline' | 'div_marker'
const EXTINGUISHER_MARKER_TYPES: { key: ExtinguisherType; label: [string, string] }[] = [
  { key: 'fire_extinguisher',    label: ['소화기', '']      },
  { key: 'indoor_hydrant',       label: ['소화전', '']      },
  { key: 'descending_lifeline',  label: ['완강기', '']      },
  { key: 'div_marker',           label: ['DIV', '']         },
]

type MarkerType = GuidelampType | DetectorType | SprinklerType | ExtinguisherType
const MARKER_TYPES_MAP: Record<PlanType, { key: string; label: [string, string] }[]> = {
  guidelamp: GUIDELAMP_MARKER_TYPES,
  detector: DETECTOR_MARKER_TYPES,
  sprinkler: SPRINKLER_MARKER_TYPES,
  extinguisher: EXTINGUISHER_MARKER_TYPES,
}

// ── 상태별 색상 ─────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  normal:  '#22c55e',
  caution: '#eab308',
  bad:     '#ef4444',
  fault:   '#ef4444',
}

function getMarkerStatus(m: FloorPlanMarker): string {
  return m.last_result && STATUS_COLOR[m.last_result] ? m.last_result : 'normal'
}

// ── 마커 SVG 렌더링 ────────────────────────────────────
function MarkerIcon({ markerType, color, size = 20 }: { markerType: string | null; color: string; size?: number }) {
  const s = size
  const hs = s / 2
  switch (markerType) {
    case 'wall_exit': // ■ 사각형
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><rect x={1} y={1} width={s-2} height={s-2} rx={2} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
    case 'ceiling_exit': // 역사다리꼴 (위가 넓고 아래가 좁음)
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`1,2 ${s-1},2 ${s*0.75},${s-2} ${s*0.25},${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
    case 'stair_corridor': // ◆ 마름모 + 가로 흰선 (상하 삼각만 색 변경)
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${s-1},${hs} ${hs},${s-1} 1,${hs}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <line x1={1} y1={hs} x2={s-1} y2={hs} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
    case 'hallway_corridor': // ◆ 마름모 + 세로 흰선 (좌우 삼각만 색 변경)
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${s-1},${hs} ${hs},${s-1} 1,${hs}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <line x1={hs} y1={1} x2={hs} y2={s-1} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
    case 'room_corridor': // ▽ 역삼각형
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`1,2 ${s-1},2 ${hs},${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
    case 'seat_corridor': // ● 원형
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs-1} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
    // ── 감지기 마커 ──
    case 'smoke_detector': // ◉ 큰 원 + 점 (연기감지기)
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={hs} cy={hs} r={hs-1} fill="none" stroke={color} strokeWidth={2}/>
          <circle cx={hs} cy={hs} r={3} fill={color}/>
        </svg>
      )
    case 'heat_detector': // △ 삼각형 (열감지기)
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`${hs},2 ${s-1},${s-2} 1,${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
    // ── 스프링클러 마커 ──
    case 'closed_head': // ● 채운 원 (작게)
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs*0.65} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
    case 'open_head': // ○ 빈 원
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs*0.65} fill="none" stroke={color} strokeWidth={2.5}/></svg>
    case 'king_head': // ◎ 이중 원 (헤드왕)
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={hs} cy={hs} r={hs-1} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <circle cx={hs} cy={hs} r={hs*0.45} fill="none" stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
    case 'test_valve': // ▣ 사각+십자
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect x={2} y={2} width={s-4} height={s-4} rx={2} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <line x1={hs} y1={3} x2={hs} y2={s-3} stroke="#fff" strokeWidth={1.5}/>
          <line x1={3} y1={hs} x2={s-3} y2={hs} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
    // ── 소화기·소화전 마커 ──
    case 'fire_extinguisher': // ▲ 삼각
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`${hs},2 ${s-1},${s-2} 1,${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
    case 'indoor_hydrant': // ⬡ 육각 (소화전)
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${s-2},${hs*0.5} ${s-2},${hs*1.5} ${hs},${s-1} 2,${hs*1.5} 2,${hs*0.5}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
    case 'descending_lifeline': // ◇ 빈 마름모 (완강기)
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${s-1},${hs} ${hs},${s-1} 1,${hs}`} fill="none" stroke={color} strokeWidth={2.5}/>
        </svg>
      )
    case 'div_marker': // ■ 사각 (DIV)
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><rect x={1} y={1} width={s-2} height={s-2} rx={2} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
    case 'flame': // ★ 별
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${hs*1.24},${hs*0.72} ${s-1},${hs*0.72} ${hs*1.38},${hs*1.18} ${hs*1.58},${s-1} ${hs},${hs*1.42} ${hs*0.42},${s-1} ${hs*0.62},${hs*1.18} 1,${hs*0.72} ${hs*0.76},${hs*0.72}`} fill={color} stroke="#fff" strokeWidth={1}/>
        </svg>
      )
    default:
      return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs-1} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
  }
}

// ── 도면 파일 경로 ──────────────────────────────────────
function getFloorPlanUrl(planType: PlanType, floor: string) {
  return `/floorplans/${planType}/${floor}.png?v=4`
}

// ══════════════════════════════════════════════════════
export default function FloorPlanPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { staff } = useAuthStore()
  const canEditMarker = !!staff

  const [planType, setPlanType] = useState<PlanType>('guidelamp')
  const [floor, setFloor] = useState('8-1F')
  const [selected, setSelected] = useState<FloorPlanMarker | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [addModal, setAddModal] = useState<{ x_pct: number; y_pct: number } | null>(null)
  const [addMarkerType, setAddMarkerType] = useState<MarkerType>('wall_exit')
  const [addLabel, setAddLabel] = useState('')
  const [addCheckpointId, setAddCheckpointId] = useState<string | null>(null)
  const [addCheckpoints, setAddCheckpoints] = useState<any[]>([])
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<{ x_pct: number; y_pct: number } | null>(null) // 드래그 중 실시간 위치
  const [editMarker, setEditMarker] = useState(false) // 마커 수정 모달
  const [inspectModal, setInspectModal] = useState(false) // 인라인 점검 모달
  const [inspectResult, setInspectResult] = useState<'normal' | 'caution' | 'bad'>('normal')
  const [inspectMemo, setInspectMemo] = useState('')
  const [inspectSubmitting, setInspectSubmitting] = useState(false)
  const inspectPhoto = usePhotoUpload()
  const [editLabel, setEditLabel] = useState('')
  const [editMarkerType, setEditMarkerType] = useState<MarkerType>('wall_exit')
  const [editCheckpointId, setEditCheckpointId] = useState<string | null>(null)
  const [checkpoints, setCheckpoints] = useState<any[]>([]) // 현재 층 개소 목록

  // ── 핀치줌 상태 ───────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const scaleRef = useRef(1)
  const translateRef = useRef({ x: 0, y: 0 })
  scaleRef.current = scale
  translateRef.current = translate

  const prevTouches = useRef<{ x: number; y: number }[]>([])
  const prevDist = useRef(0)
  const prevMid = useRef({ x: 0, y: 0 })
  const isPinching = useRef(false)
  const lastTap = useRef(0)

  // ── 이미지 사이즈 & 렌더 영역 ──────────────────────────
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 })
  const [imgLoaded, setImgLoaded] = useState(false)
  // objectFit:contain 에서 실제 이미지 영역 (wrapper 내 offset/size)
  const [imgRect, setImgRect] = useState({ offX: 0, offY: 0, w: 1, h: 1 })

  // ── 마커 데이터 ───────────────────────────────────────
  const markersQuery = useQuery({
    queryKey: ['floorplan-markers', floor, planType],
    queryFn: () => floorPlanMarkerApi.list(floor, planType),
    staleTime: 30_000,
    refetchInterval: 10_000,
  })
  const markers = markersQuery.data ?? []

  const createMutation = useMutation({
    mutationFn: (body: Parameters<typeof floorPlanMarkerApi.create>[0]) => floorPlanMarkerApi.create(body),
    retry: 2,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] }); toast.success('마커 추가됨') },
    onError: (e: any) => toast.error(e.message ?? '마커 추가 실패 — 다시 시도해주세요'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof floorPlanMarkerApi.update>[1] }) => floorPlanMarkerApi.update(id, body),
    retry: 2,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] }),
    onError: (e: any) => toast.error(e.message ?? '마커 수정 실패'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => floorPlanMarkerApi.delete(id),
    retry: 2,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] }); setSelected(null); toast.success('마커 삭제됨') },
    onError: (e: any) => toast.error(e.message ?? '마커 삭제 실패'),
  })

  // ── 핀치줌 핸들러 ─────────────────────────────────────
  function dist(a: {x:number;y:number}, b: {x:number;y:number}) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2)
  }
  function mid(a: {x:number;y:number}, b: {x:number;y:number}) {
    return { x: (a.x+b.x)/2, y: (a.y+b.y)/2 }
  }

  function clampTranslate(tx: number, ty: number, s: number) {
    const el = containerRef.current
    if (!el) return { x: tx, y: ty }
    const cw = el.clientWidth, ch = el.clientHeight
    const iw = cw * s, ih = ch * s
    const maxX = Math.max(0, (iw - cw) / 2)
    const maxY = Math.max(0, (ih - ch) / 2)
    return { x: Math.min(maxX, Math.max(-maxX, tx)), y: Math.min(maxY, Math.max(-maxY, ty)) }
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const ts = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }))
    prevTouches.current = ts
    if (ts.length === 2) {
      prevDist.current = dist(ts[0], ts[1])
      prevMid.current = mid(ts[0], ts[1])
      isPinching.current = true
      cancelLongPress()
    } else if (ts.length === 1) {
      startLongPress(ts[0].x, ts[0].y)
    }
  }, [editMode])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    cancelLongPress()
    const ts = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }))
    const prev = prevTouches.current
    const s = scaleRef.current
    const t = translateRef.current

    if (ts.length === 1 && prev.length >= 1 && !isPinching.current) {
      // 패닝
      const dx = ts[0].x - prev[0].x
      const dy = ts[0].y - prev[0].y

      // 편집 모드에서 드래그중인 마커가 있으면 마커 이동
      if (editMode && dragId) {
        const el = containerRef.current
        if (el) {
          const rect = el.getBoundingClientRect()
          // 터치 좌표 → wrapper 내 좌표 (스케일/이동 보정)
          const FINGER_OFFSET = 60 // 손가락 위로 60px 오프셋
          const wx = (ts[0].x - rect.left - rect.width / 2 - t.x) / s + rect.width / 2
          const wy = (ts[0].y - FINGER_OFFSET - rect.top - rect.height / 2 - t.y) / s + rect.height / 2
          const xPct = ((wx - imgRect.offX) / imgRect.w) * 100
          const yPct = ((wy - imgRect.offY) / imgRect.h) * 100
          if (xPct >= 0 && xPct <= 100 && yPct >= 0 && yPct <= 100) {
            setDragPos({ x_pct: Math.round(xPct * 100) / 100, y_pct: Math.round(yPct * 100) / 100 })
          }
        }
      } else {
        const clamped = clampTranslate(t.x + dx, t.y + dy, s)
        setTranslate(clamped)
      }
    } else if (ts.length === 2 && prev.length >= 2) {
      // 핀치줌
      isPinching.current = true
      const d = dist(ts[0], ts[1])
      const m = mid(ts[0], ts[1])
      const ratio = d / prevDist.current
      const newScale = Math.min(5, Math.max(1, s * ratio))

      const el = containerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const cx = m.x - rect.left - rect.width / 2
        const cy = m.y - rect.top - rect.height / 2
        const newTx = t.x - (cx - t.x) * (newScale / s - 1) + (m.x - prevMid.current.x)
        const newTy = t.y - (cy - t.y) * (newScale / s - 1) + (m.y - prevMid.current.y)
        const clamped = clampTranslate(newTx, newTy, newScale)
        setScale(newScale)
        setTranslate(clamped)
      }

      prevDist.current = d
      prevMid.current = m
    }
    prevTouches.current = ts
  }, [editMode, dragId])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    cancelLongPress()
    if (e.touches.length === 0) {
      isPinching.current = false
      // 드래그 완료 → DB에 위치 저장
      if (dragId && dragPos) {
        updateMutation.mutate({ id: dragId, body: { x_pct: dragPos.x_pct, y_pct: dragPos.y_pct } })
      }
      setDragId(null)
      setDragPos(null)
    }
    prevTouches.current = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }))
  }, [dragId, dragPos])

  // 마우스 휠 줌 (PC)
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const s = scaleRef.current
    const t = translateRef.current
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(5, Math.max(1, s * delta))
    const el = containerRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const newTx = t.x - (cx - t.x) * (newScale / s - 1)
      const newTy = t.y - (cy - t.y) * (newScale / s - 1)
      const clamped = clampTranslate(newTx, newTy, newScale)
      setScale(newScale)
      setTranslate(clamped)
    }
  }, [])

  // 더블탭 줌
  const handleTap = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const now = Date.now()
    if (now - lastTap.current < 300) {
      // 더블탭
      if (scaleRef.current > 1.5) {
        setScale(1)
        setTranslate({ x: 0, y: 0 })
      } else {
        const el = containerRef.current
        if (el) {
          const rect = el.getBoundingClientRect()
          const cx = e.touches[0].clientX - rect.left - rect.width / 2
          const cy = e.touches[0].clientY - rect.top - rect.height / 2
          const newScale = 2.5
          const newTx = -cx * (newScale - 1)
          const newTy = -cy * (newScale - 1)
          const clamped = clampTranslate(newTx, newTy, newScale)
          setScale(newScale)
          setTranslate(clamped)
        }
      }
      lastTap.current = 0
    } else {
      lastTap.current = now
    }
  }, [])

  // 층/도면 전환 시 줌 축소보기
  useEffect(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
    setSelected(null)
    setEditMode(false)
    setImgLoaded(false)
  }, [floor, planType])

  // ── 편집모드: 롱프레스로 마커 추가 ────────────────────
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressPos = useRef<{ x: number; y: number } | null>(null)

  function cancelLongPress() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    longPressPos.current = null
  }

  function startLongPress(clientX: number, clientY: number) {
    if (!editMode) return
    cancelLongPress()
    longPressPos.current = { x: clientX, y: clientY }
    longPressTimer.current = setTimeout(() => {
      const el = containerRef.current
      if (!el || !longPressPos.current) return
      const rect = el.getBoundingClientRect()
      const s = scaleRef.current
      const t = translateRef.current
      // 터치 좌표 → wrapper 내 좌표 → 스케일/이동 보정 → 이미지 영역 내 %
      const wx = (longPressPos.current.x - rect.left - rect.width / 2 - t.x) / s + rect.width / 2
      const wy = (longPressPos.current.y - rect.top - rect.height / 2 - t.y) / s + rect.height / 2
      const xPct = ((wx - imgRect.offX) / imgRect.w) * 100
      const yPct = ((wy - imgRect.offY) / imgRect.h) * 100
      if (xPct >= 0 && xPct <= 100 && yPct >= 0 && yPct <= 100) {
        setAddModal({ x_pct: Math.round(xPct * 100) / 100, y_pct: Math.round(yPct * 100) / 100 })
        setAddLabel('')
        const firstType = currentMarkerTypes[0]?.key ?? 'wall_exit'
        setAddMarkerType(firstType as MarkerType)
        setAddCheckpointId(null)
        loadAddCheckpoints(firstType)
      }
      longPressPos.current = null
    }, 600)
  }

  // ── 마커 클릭 ─────────────────────────────────────────
  function onMarkerClick(m: FloorPlanMarker, e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    if (editMode) {
      setSelected(m)
    } else {
      setSelected(m)
    }
  }

  function onMarkerTouchStart(m: FloorPlanMarker, e: React.TouchEvent) {
    e.stopPropagation()
    if (editMode) {
      setDragId(m.id)
      setSelected(m)
    }
  }

  // ── 추가 모달: 마커 타입 변경 시 개소 로드 (소화기·소화전) ──
  function loadAddCheckpoints(markerType: string) {
    if (planType === 'extinguisher') {
      const markerCatMap: Record<string, string> = { fire_extinguisher: '소화기', indoor_hydrant: '소화전', descending_lifeline: '완강기', div_marker: 'DIV' }
      const cat = markerCatMap[markerType] ?? '소화기'
      inspectionApi.getCheckpoints(floor).then(all => setAddCheckpoints(all.filter((cp: any) => cp.category === cat))).catch(() => setAddCheckpoints([]))
    }
    setAddCheckpointId(null)
  }

  // ── 마커 추가 제출 ────────────────────────────────────
  function submitAddMarker() {
    if (!addModal) return
    createMutation.mutate({
      floor,
      plan_type: planType,
      marker_type: addMarkerType,
      x_pct: addModal.x_pct,
      y_pct: addModal.y_pct,
      label: addLabel || undefined,
      check_point_id: addCheckpointId || undefined,
    })
    setAddModal(null)
  }

  // ── 도면 URL & 현재 마커 타입 목록 ─────────────────────
  const floorPlanUrl = getFloorPlanUrl(planType, floor)
  const planReady = PLAN_TYPES.find(p => p.key === planType)?.ready
  const currentMarkerTypes = MARKER_TYPES_MAP[planType] ?? []

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}>

      {/* ── 헤더 ─────────────────────────────────────── */}
      <header style={{ flexShrink: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>건물 도면</span>
        {canEditMarker && (
          <button
            onClick={() => { setEditMode(!editMode); setSelected(null) }}
            style={{
              height: 30, padding: '0 10px', borderRadius: 7,
              background: editMode ? 'var(--acl)' : 'var(--bg3)',
              border: editMode ? 'none' : '1px solid var(--bd)',
              color: editMode ? '#fff' : 'var(--t2)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {editMode ? '편집 완료' : '마커 편집'}
          </button>
        )}
        <button
          onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }) }}
          style={{ height: 30, padding: '0 10px', borderRadius: 7, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
        >
          축소보기
        </button>
      </header>

      {/* ── 도면 종류 선택 ───────────────────────────── */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 4, padding: '7px 10px', background: 'var(--bg2)', borderBottom: '1px solid var(--bd)' }}>
        {PLAN_TYPES.map(p => (
          <button
            key={p.key}
            onClick={() => p.ready && setPlanType(p.key)}
            style={{
              flex: 1, padding: '6px 4px', borderRadius: 7, fontSize: 11, fontWeight: 600,
              cursor: p.ready ? 'pointer' : 'default',
              background: planType === p.key ? 'var(--acl)' : 'var(--bg3)',
              color: planType === p.key ? '#fff' : p.ready ? 'var(--t2)' : 'var(--t3)',
              border: planType === p.key ? 'none' : '1px solid var(--bd)',
              opacity: p.ready ? 1 : 0.4,
              position: 'relative',
            }}
          >
            {p.label}
            {!p.ready && <span style={{ position: 'absolute', top: -6, right: -2, fontSize: 8, background: 'var(--bg3)', color: 'var(--t3)', padding: '1px 4px', borderRadius: 4, border: '1px solid var(--bd)' }}>준비중</span>}
          </button>
        ))}
      </div>

      {/* ── 층 선택 탭 ───────────────────────────────── */}
      <div style={{ flexShrink: 0, overflowX: 'auto', display: 'flex', gap: 4, padding: '7px 10px', background: 'var(--bg2)', borderBottom: '1px solid var(--bd)' }}>
        {FLOORS.map(f => (
          <button
            key={f}
            onClick={() => setFloor(f)}
            style={{
              flexShrink: 0, padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: floor === f ? 'var(--acl)' : 'var(--bg3)',
              color: floor === f ? '#fff' : 'var(--t2)',
              border: floor === f ? 'none' : '1px solid var(--bd)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── 도면 캔버스 (핀치줌) ──────────────────────── */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', touchAction: 'none', background: '#1a1f2b', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' } as any}
        onTouchStart={(e) => { handleTap(e); onTouchStart(e) }}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        onClick={() => { if (!editMode) setSelected(null) }}
      >
        {/* ── 편집모드 안내 (absolute — 레이아웃 영향 없음) ── */}
        {editMode && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '6px 12px', background: 'rgba(59,130,246,0.85)', fontSize: 11, color: '#fff', fontWeight: 600, textAlign: 'center', pointerEvents: 'none' }}>
            길게 누르면 마커 추가 · 마커를 터치하여 선택/삭제
          </div>
        )}

        {planReady ? (
          <div
            ref={imgRef}
            style={{
              width: '100%', height: '100%', position: 'relative',
              transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            <img
              src={floorPlanUrl}
              alt={`${floor} ${planType}`}
              onLoad={(e) => {
                const img = e.currentTarget
                const nw = img.naturalWidth, nh = img.naturalHeight
                setImgNatural({ w: nw, h: nh })
                const cw = img.clientWidth, ch = img.clientHeight
                const ratio = Math.min(cw / nw, ch / nh)
                const rw = nw * ratio, rh = nh * ratio
                setImgRect({ offX: (cw - rw) / 2, offY: (ch - rh) / 2, w: rw, h: rh })
                setImgLoaded(true)
              }}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
              draggable={false}
            />

            {/* ── 마커 오버레이 ──────────────────────── */}
            {imgLoaded && markers.map(m => {
              const color = STATUS_COLOR[getMarkerStatus(m)] ?? STATUS_COLOR.normal
              // 드래그 중이면 실시간 위치, 아니면 DB 위치
              const isDragging = dragId === m.id && dragPos
              const xPct = isDragging ? dragPos.x_pct : m.x_pct
              const yPct = isDragging ? dragPos.y_pct : m.y_pct
              const px = imgRect.offX + (xPct / 100) * imgRect.w
              const py = imgRect.offY + (yPct / 100) * imgRect.h
              return (
                <div
                  key={m.id}
                  onClick={(e) => onMarkerClick(m, e)}
                  onTouchStart={(e) => onMarkerTouchStart(m, e)}
                  style={{
                    position: 'absolute',
                    left: px,
                    top: py,
                    transform: `translate(-50%, -50%) scale(${1/scale})`,
                    cursor: 'pointer',
                    zIndex: isDragging ? 50 : selected?.id === m.id ? 10 : 1,
                    outline: (isDragging || selected?.id === m.id) ? '2.5px solid #3b82f6' : 'none',
                    outlineOffset: 2,
                    borderRadius: '50%',
                    pointerEvents: 'auto',
                  }}
                >
                  <MarkerIcon markerType={m.marker_type} color={color} size={20} />
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t3)', fontSize: 14, fontWeight: 600 }}>
            도면 준비 중
          </div>
        )}
      </div>

      {/* ── 범례 ─────────────────────────────────────── */}
      <div style={{ flexShrink: 0, padding: '7px 12px', background: 'var(--bg2)', borderTop: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {currentMarkerTypes.map(mt => (
          <div key={mt.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MarkerIcon markerType={mt.key} color="#22c55e" size={14} />
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>{mt.label.join('')}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 12, background: 'var(--bd)', margin: '0 2px' }} />
        {['normal', 'caution', 'fault'].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[s] }} />
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>{{ normal: '정상', caution: '주의', fault: '불량' }[s]}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 'auto' }}>핀치 확대 · 드래그 이동</span>
      </div>

      {/* ── 마커 상세 바텀시트 ────────────────────────── */}
      {selected && !addModal && !editMarker && (
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'var(--bg2)', borderTop: '1px solid var(--bd2)',
            borderRadius: '16px 16px 0 0', padding: '16px 16px 28px', zIndex: 30,
            boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bd2)', margin: '0 auto 14px' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: (STATUS_COLOR[getMarkerStatus(selected)] ?? STATUS_COLOR.normal) + '22',
              border: `1.5px solid ${(STATUS_COLOR[getMarkerStatus(selected)] ?? STATUS_COLOR.normal)}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MarkerIcon markerType={selected.marker_type} color={STATUS_COLOR[getMarkerStatus(selected)] ?? STATUS_COLOR.normal} size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>
                {selected.label || currentMarkerTypes.find(mt => mt.key === selected.marker_type)?.label.join('') || '마커'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>{floor}</span>
                {selected.check_point_id && <span style={{ fontSize: 11, color: 'var(--t3)' }}>ID: {selected.check_point_id}</span>}
                <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[getMarkerStatus(selected)] ?? STATUS_COLOR.normal }}>
                  {{ normal: '정상', caution: '주의', fault: '불량', bad: '불량' }[getMarkerStatus(selected)] ?? '미점검'}
                </span>
                {selected.last_inspected_at && (
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>최근 {selected.last_inspected_at.slice(0, 10)}</span>
                )}
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}>
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {selected.check_point_id && (
              <button
                onClick={() => { setInspectResult('normal'); setInspectMemo(''); inspectPhoto.reset(); setInspectModal(true) }}
                style={{ flex: 1, height: 46, borderRadius: 12, background: 'var(--acl)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                점검 기록 입력
              </button>
            )}
            {editMode && (
              <>
                <button
                  onClick={() => {
                    setEditLabel(selected.label ?? '')
                    setEditMarkerType((selected.marker_type as MarkerType) ?? 'wall_exit')
                    setEditCheckpointId(selected.check_point_id)
                    // 현재 층 해당 카테고리 개소 로딩
                    if (planType === 'extinguisher') {
                      // 소화기·소화전: 마커 타입별로 점검 개소 카테고리 매핑
                      const markerCatMap: Record<string, string> = { fire_extinguisher: '소화기', indoor_hydrant: '소화전', descending_lifeline: '완강기', div_marker: 'DIV' }
                      const markerCat = markerCatMap[selected.marker_type ?? ''] ?? '소화기'
                      inspectionApi.getCheckpoints(floor).then(all => setCheckpoints(all.filter((cp: any) => cp.category === markerCat))).catch(() => setCheckpoints([]))
                    } else {
                      const cat = { detector: '자동화재탐지설비', sprinkler: '스프링클러설비', guidelamp: '유도등' }[planType] ?? '유도등'
                      inspectionApi.getCheckpoints(floor).then(all => setCheckpoints(all.filter((cp: any) => cp.category === cat))).catch(() => setCheckpoints([]))
                    }
                    setEditMarker(true)
                  }}
                  style={{ flex: 1, height: 46, borderRadius: 12, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t1)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  수정
                </button>
                <button
                  onClick={() => { if (confirm('마커를 삭제하시겠습니까?')) deleteMutation.mutate(selected.id) }}
                  style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 마커 수정 모달 ───────────────────────────── */}
      {editMarker && selected && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setEditMarker(false)}>
          <div style={{ width: '90%', maxWidth: 340, background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid var(--bd2)', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>마커 수정</div>

            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>{{ detector: '감지기 종류', sprinkler: '스프링클러 종류', guidelamp: '유도등 종류', extinguisher: '소화기 종류' }[planType]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
              {currentMarkerTypes.map(mt => (
                <button
                  key={mt.key}
                  onClick={() => setEditMarkerType(mt.key as MarkerType)}
                  style={{
                    padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: editMarkerType === mt.key ? 'var(--acl)' : 'var(--bg3)',
                    color: editMarkerType === mt.key ? '#fff' : 'var(--t2)',
                    border: editMarkerType === mt.key ? 'none' : '1px solid var(--bd)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, lineHeight: 1.2,
                  }}
                >
                  <MarkerIcon markerType={mt.key} color={editMarkerType === mt.key ? '#fff' : '#888'} size={16} />
                  <span>{mt.label[0]}</span><span>{mt.label[1]}</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>라벨</div>
            <input
              value={editLabel}
              onChange={e => setEditLabel(e.target.value)}
              placeholder="예: 피난구 B5-01"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t1)', fontSize: 13, marginBottom: 14, boxSizing: 'border-box' }}
            />

            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>점검 개소 연결</div>
            <select
              value={editCheckpointId ?? ''}
              onChange={e => setEditCheckpointId(e.target.value || null)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t1)', fontSize: 13, marginBottom: 6, boxSizing: 'border-box' }}
            >
              <option value="">연결 안 함</option>
              {checkpoints.filter((cp: any) => !markers.some(m => m.check_point_id === cp.id) || cp.id === editCheckpointId).map((cp: any) => (
                <option key={cp.id} value={cp.id}>{cp.location_no ?? cp.id} — {cp.location} ({cp.category})</option>
              ))}
            </select>
            <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 14 }}>개소를 연결하면 "점검 기록 입력" 버튼이 표시됩니다</div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditMarker(false)} style={{ flex: 1, height: 42, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                취소
              </button>
              <button
                onClick={() => {
                  updateMutation.mutate({
                    id: selected.id,
                    body: {
                      label: editLabel || undefined,
                      marker_type: editMarkerType,
                      check_point_id: editCheckpointId,
                    }
                  }, {
                    onSuccess: () => { setEditMarker(false); setSelected(null); toast.success('마커 수정됨') }
                  })
                }}
                style={{ flex: 1, height: 42, borderRadius: 10, background: 'var(--acl)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 마커 추가 모달 ───────────────────────────── */}
      {addModal && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setAddModal(null)}>
          <div style={{ width: '85%', maxWidth: 320, background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid var(--bd2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>마커 추가</div>

            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>{{ detector: '감지기 종류', sprinkler: '스프링클러 종류', guidelamp: '유도등 종류', extinguisher: '소화기 종류' }[planType]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
              {currentMarkerTypes.map(mt => (
                <button
                  key={mt.key}
                  onClick={() => { setAddMarkerType(mt.key as MarkerType); loadAddCheckpoints(mt.key) }}
                  style={{
                    padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: addMarkerType === mt.key ? 'var(--acl)' : 'var(--bg3)',
                    color: addMarkerType === mt.key ? '#fff' : 'var(--t2)',
                    border: addMarkerType === mt.key ? 'none' : '1px solid var(--bd)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, lineHeight: 1.2,
                  }}
                >
                  <MarkerIcon markerType={mt.key} color={addMarkerType === mt.key ? '#fff' : '#888'} size={16} />
                  <span>{mt.label[0]}</span><span>{mt.label[1]}</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>라벨 (선택)</div>
            <input
              value={addLabel}
              onChange={e => setAddLabel(e.target.value)}
              placeholder="예: 피난구 B5-01"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t1)', fontSize: 13, marginBottom: 14, boxSizing: 'border-box' }}
            />

            {planType === 'extinguisher' && (
              <>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>점검 개소 연결</div>
                <select
                  value={addCheckpointId ?? ''}
                  onChange={e => setAddCheckpointId(e.target.value || null)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t1)', fontSize: 13, marginBottom: 6, boxSizing: 'border-box' }}
                >
                  <option value="">연결 안 함</option>
                  {addCheckpoints.filter((cp: any) => !markers.some(m => m.check_point_id === cp.id)).map((cp: any) => (
                    <option key={cp.id} value={cp.id}>{cp.location_no ?? cp.id} — {cp.location} ({cp.category})</option>
                  ))}
                </select>
                <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 14 }}>개소를 연결하면 "점검 기록 입력" 버튼이 표시됩니다</div>
              </>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAddModal(null)} style={{ flex: 1, height: 42, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={submitAddMarker} style={{ flex: 1, height: 42, borderRadius: 10, background: 'var(--acl)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 인라인 점검 기록 모달 ────────────────────── */}
      {inspectModal && selected?.check_point_id && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setInspectModal(false)}>
          <div style={{ width: '90%', maxWidth: 340, background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid var(--bd2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>점검 기록 입력</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14 }}>
              {selected.label || currentMarkerTypes.find(mt => mt.key === selected.marker_type)?.label.join('') || '마커'} · {floor}
            </div>

            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>점검 결과</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {([['normal','정상','#22c55e'],['caution','주의','#eab308'],['bad','불량','#ef4444']] as const).map(([val, label, color]) => (
                <button key={val} onClick={() => setInspectResult(val)} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: inspectResult === val ? color + '22' : 'var(--bg3)',
                  color: inspectResult === val ? color : 'var(--t3)',
                  border: inspectResult === val ? `2px solid ${color}` : '1px solid var(--bd)',
                }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', letterSpacing: '0.05em' }}>특이사항 (선택)</label>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>점검 사진 (선택)</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14 }}>
              <textarea
                value={inspectMemo}
                onChange={e => setInspectMemo(e.target.value)}
                placeholder="특이사항을 입력하세요"
                style={{ flex: 1, height: 72, padding: '9px 11px', borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--bd2)', color: 'var(--t1)', fontSize: 12, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
              <PhotoButton hook={inspectPhoto} label="촬영" noCapture />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setInspectModal(false)} style={{ flex: 1, height: 42, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                취소
              </button>
              <button
                disabled={inspectSubmitting || inspectPhoto.uploading}
                onClick={async () => {
                  setInspectSubmitting(true)
                  try {
                    const today = new Date().toISOString().slice(0, 10)
                    // 오늘 세션 조회 또는 생성
                    let sessions = await inspectionApi.getSessions(today)
                    let sid: string
                    if (sessions.length > 0) {
                      sid = sessions[0].id
                    } else {
                      const s = await inspectionApi.createSession({ date: today })
                      sid = s.id
                    }
                    const photoKey = await inspectPhoto.upload()
                    await inspectionApi.submitRecord(sid, {
                      checkpoint_id: selected.check_point_id,
                      result: inspectResult,
                      memo: inspectMemo || null,
                      photo_key: photoKey ?? undefined,
                    })
                    toast.success('점검 기록 저장됨')
                    setInspectModal(false)
                    setSelected(null)
                    // 마커 상태 새로고침
                    qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] })
                  } catch (e: any) {
                    toast.error(e.message ?? '저장 실패')
                  } finally {
                    setInspectSubmitting(false)
                  }
                }}
                style={{ flex: 1, height: 42, borderRadius: 10, background: (inspectSubmitting || inspectPhoto.uploading) ? 'var(--bd2)' : 'var(--acl)', border: 'none', color: (inspectSubmitting || inspectPhoto.uploading) ? 'var(--t3)' : '#fff', fontSize: 13, fontWeight: 700, cursor: (inspectSubmitting || inspectPhoto.uploading) ? 'default' : 'pointer' }}
              >
                {inspectPhoto.uploading ? '사진 업로드 중...' : inspectSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
