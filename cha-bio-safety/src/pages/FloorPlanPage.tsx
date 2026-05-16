import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronLeft, Trash2, X } from 'lucide-react'
import { floorPlanMarkerApi, inspectionApi, extinguisherApi, scheduleApi, api, type FloorPlanMarker, type ExtinguisherDetail } from '../utils/api'
import { getReplaceWarning, REPLACE_WARNING_STROKE, type ReplaceWarning } from '../utils/extinguisher'
import { useAuthStore } from '../stores/authStore'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { InspectionRevisitPopup, type RevisitVariant } from '../components/InspectionRevisitPopup'
import { AccessBlockedPopup } from '../components/AccessBlockedPopup'
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
type ExtinguisherType = 'fire_extinguisher' | 'ext_powder20' | 'ext_halogen' | 'ext_kitchen_k' | 'indoor_hydrant' | 'descending_lifeline' | 'div_marker'
// 마커 타입 enum (기존 데이터 + 렌더링 분기용 — 7종 그대로 유지)
const EXTINGUISHER_MARKER_TYPES: { key: ExtinguisherType; label: [string, string] }[] = [
  { key: 'fire_extinguisher',    label: ['분말', '3.3kg']   },
  { key: 'ext_powder20',         label: ['분말', '20kg']    },
  { key: 'ext_halogen',          label: ['할로겐', '']      },
  { key: 'ext_kitchen_k',        label: ['K급', '주방']     },
  { key: 'indoor_hydrant',       label: ['소화전', '']      },
  { key: 'descending_lifeline',  label: ['완강기', '']      },
  { key: 'div_marker',           label: ['DIV', '']         },
]
// 마커 「추가」 모달 옵션 (4종 — 분말 종류는 자산 등록/수정에서 결정, 마커 자체는 위치 placeholder)
const EXTINGUISHER_ADD_OPTIONS: { key: ExtinguisherType; label: [string, string] }[] = [
  { key: 'fire_extinguisher',   label: ['소화기', '빈 개소'] },
  { key: 'indoor_hydrant',      label: ['소화전', '']        },
  { key: 'descending_lifeline', label: ['완강기', '']        },
  { key: 'div_marker',          label: ['DIV', '']           },
]
// 소화기 자산-위치 분리 대상 marker_type (빈 마커 ❓ 판정에 사용)
const EXT_ASSET_MARKER_TYPES = new Set<string>(['fire_extinguisher', 'ext_powder20', 'ext_halogen', 'ext_kitchen_k'])

// 자산 type → 마커 시각용 marker_type 매핑. 매핑된 자산이 있으면 그 type 으로 마커 모양 결정.
// 사용자 결정: 강화액 = K급 모양, 이산화탄소 = 할로겐 모양 (기존 마커 SVG 재사용).
function extTypeToMarkerType(extType: string | null | undefined): string {
  switch (extType) {
    case '분말 20kg': return 'ext_powder20'
    case '할로겐':
    case '이산화탄소': return 'ext_halogen'
    case 'K급':
    case '강화액':    return 'ext_kitchen_k'
    case '분말':
    case '분말 3.3kg':
    default:          return 'fire_extinguisher'
  }
}

type MarkerType = GuidelampType | DetectorType | SprinklerType | ExtinguisherType
const MARKER_TYPES_MAP: Record<PlanType, { key: string; label: [string, string] }[]> = {
  guidelamp: GUIDELAMP_MARKER_TYPES,
  detector: DETECTOR_MARKER_TYPES,
  sprinkler: SPRINKLER_MARKER_TYPES,
  extinguisher: EXTINGUISHER_MARKER_TYPES,
}

// ── 상태별 색상 (tokens.css var() 로 토큰화 — §6.2 negative rule 예외: 마커 fill 상태 표현 매체) ──
const STATUS_COLOR: Record<string, string> = {
  uninspected: 'var(--text-tertiary)',
  normal:      'var(--status-safe-bar)',
  caution:     'var(--status-warning-bar)',
  bad:         'var(--status-danger-bar)',
  fault:       'var(--status-danger-bar)',
  resolved:    'var(--accent)',
}

function getMarkerStatus(m: FloorPlanMarker): string {
  if (!m.last_result) return 'uninspected'
  if ((m.last_result === 'bad' || m.last_result === 'caution') && m.last_status === 'resolved') return 'resolved'
  return STATUS_COLOR[m.last_result] ? m.last_result : 'uninspected'
}

// ── 마커 SVG 렌더링 ────────────────────────────────────
// strokeColor/strokeWidth/dangerBadge 는 분말 소화기 (fire_extinguisher, ext_powder20)
// 에서만 의미있게 사용된다. 다른 마커는 기존 하드코딩 stroke 그대로 유지 (외형 무변화).
function MarkerIcon({
  markerType, color, size = 20,
  strokeColor = '#fff', strokeWidth = 1.5, dangerBadge = false,
}: {
  markerType: string | null; color: string; size?: number;
  strokeColor?: string; strokeWidth?: number; dangerBadge?: boolean;
}) {
  const s = size
  const hs = s / 2
  let svg: JSX.Element
  switch (markerType) {
    case 'wall_exit': // ■ 사각형
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><rect x={1} y={1} width={s-2} height={s-2} rx={2} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
      break
    case 'ceiling_exit': // 역사다리꼴 (위가 넓고 아래가 좁음)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`1,2 ${s-1},2 ${s*0.75},${s-2} ${s*0.25},${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    case 'stair_corridor': // ◆ 마름모 + 가로 흰선 (상하 삼각만 색 변경)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${s-1},${hs} ${hs},${s-1} 1,${hs}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <line x1={1} y1={hs} x2={s-1} y2={hs} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    case 'hallway_corridor': // ◆ 마름모 + 세로 흰선 (좌우 삼각만 색 변경)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${s-1},${hs} ${hs},${s-1} 1,${hs}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <line x1={hs} y1={1} x2={hs} y2={s-1} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    case 'room_corridor': // ▽ 역삼각형
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`1,2 ${s-1},2 ${hs},${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
      break
    case 'seat_corridor': // ● 원형
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs-1} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
      break
    // ── 감지기 마커 ──
    case 'smoke_detector': // ◉ 큰 원 + 점 (연기감지기)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={hs} cy={hs} r={hs-1} fill="none" stroke={color} strokeWidth={2}/>
          <circle cx={hs} cy={hs} r={3} fill={color}/>
        </svg>
      )
      break
    case 'heat_detector': // △ 삼각형 (열감지기)
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`${hs},2 ${s-1},${s-2} 1,${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
      break
    // ── 스프링클러 마커 ──
    case 'closed_head': // ● 채운 원 (작게)
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs*0.65} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
      break
    case 'open_head': // ○ 빈 원
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs*0.65} fill="none" stroke={color} strokeWidth={2.5}/></svg>
      break
    case 'king_head': // ◎ 이중 원 (헤드왕)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={hs} cy={hs} r={hs-1} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <circle cx={hs} cy={hs} r={hs*0.45} fill="none" stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    case 'test_valve': // ▣ 사각+십자
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect x={2} y={2} width={s-4} height={s-4} rx={2} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <line x1={hs} y1={3} x2={hs} y2={s-3} stroke="#fff" strokeWidth={1.5}/>
          <line x1={3} y1={hs} x2={s-3} y2={hs} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    // ── 소화기·소화전 마커 ──
    case 'fire_extinguisher': // ● 원 (분말3.3kg) — 외곽 stroke 만 prop 화 (교체 연한 강조)
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs-1} fill={color} stroke={strokeColor} strokeWidth={strokeWidth}/></svg>
      break
    case 'ext_powder20': // ◎ 도넛 (분말20kg) — 외곽 stroke 만 prop 화. 안쪽 도넛 흰선은 시각 정체성이라 #fff/1.5 유지
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={hs} cy={hs} r={hs-1} fill={color} stroke={strokeColor} strokeWidth={strokeWidth}/>
          <circle cx={hs} cy={hs} r={hs*0.4} fill="none" stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    case 'ext_halogen': // ▲ 삼각 (할로겐)
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><polygon points={`${hs},2 ${s-1},${s-2} 1,${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
      break
    case 'ext_kitchen_k': // △ 삼각+구멍 (K급주방)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},2 ${s-1},${s-2} 1,${s-2}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
          <circle cx={hs} cy={hs*1.15} r={hs*0.3} fill="none" stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    case 'indoor_hydrant': // ⬡ 육각 (소화전)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${s-2},${hs*0.5} ${s-2},${hs*1.5} ${hs},${s-1} 2,${hs*1.5} 2,${hs*0.5}`} fill={color} stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    case 'descending_lifeline': // ◇ 빈 마름모 (완강기)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${s-1},${hs} ${hs},${s-1} 1,${hs}`} fill="none" stroke={color} strokeWidth={2.5}/>
        </svg>
      )
      break
    case 'div_marker': // ■ 사각 (DIV)
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><rect x={1} y={1} width={s-2} height={s-2} rx={2} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
      break
    case 'flame': // ★ 별
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${hs},1 ${hs*1.24},${hs*0.72} ${s-1},${hs*0.72} ${hs*1.38},${hs*1.18} ${hs*1.58},${s-1} ${hs},${hs*1.42} ${hs*0.42},${s-1} ${hs*0.62},${hs*1.18} 1,${hs*0.72} ${hs*0.76},${hs*0.72}`} fill={color} stroke="#fff" strokeWidth={1}/>
        </svg>
      )
      break
    default:
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs-1} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
  }

  if (!dangerBadge) return svg

  // danger 마커 — 우상단 ! 배지 (시안 A안). pointerEvents:none 으로 클릭 통과.
  // 컨테이너 14×14 (12px 텍스트가 들어가도록 확장 — 노안 12px 마지노 룰)
  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      {svg}
      <div style={{
        position: 'absolute',
        top: -8,
        right: -8,
        width: 14,
        height: 14,
        background: '#ef4444',
        border: '1.5px solid #fff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 900,
        color: '#fff',
        lineHeight: 1,
        pointerEvents: 'none',
      }}>!</div>
    </div>
  )
}

// ── 도면 파일 경로 ──────────────────────────────────────
function getFloorPlanUrl(planType: PlanType, floor: string) {
  return `/floorplans/${planType}/${floor}.png?v=18`
}

// ══════════════════════════════════════════════════════
export default function FloorPlanPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { staff } = useAuthStore()
  const canEditMarker = !!staff
  const isDesktop = useIsDesktop()
  const isAdmin = staff?.role === 'admin'

  const [searchParams, setSearchParams] = useSearchParams()
  const [planType, setPlanType] = useState<PlanType>(() => {
    const pt = searchParams.get('planType') as PlanType | null
    return (pt && PLAN_TYPES.find(p => p.key === pt)) ? pt : 'guidelamp'
  })
  // 라벨/시각 lookup용 — 항상 전체 marker_type (extinguisher 7종 포함). 자산-위치 분리 후에도 기존 marker_type 데이터 보존.
  const currentMarkerTypes = MARKER_TYPES_MAP[planType] ?? []
  // 마커 「추가」 모달 노출 옵션. extinguisher 는 4종(소화기/소화전/완강기/DIV)만 — 분말 종류는 자산 등록에서 결정.
  const addOptionMarkerTypes = planType === 'extinguisher'
    ? EXTINGUISHER_ADD_OPTIONS
    : currentMarkerTypes
  const [floor, setFloor] = useState<string>(() => {
    const f = searchParams.get('floor')
    return (f && FLOORS.includes(f)) ? f : '8-1F'
  })

  // Phase 24: planType / floor 변경 시 URL 도 sync — back 으로 돌아올 때 state 보존.
  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('planType', planType)
      next.set('floor', floor)
      return next
    }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planType, floor])
  const [selected, setSelected] = useState<FloorPlanMarker | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [addModal, setAddModal] = useState<{ x_pct: number; y_pct: number } | null>(null)
  const [addMarkerType, setAddMarkerType] = useState<MarkerType>('wall_exit')
  const [addZone, setAddZone] = useState<'research' | 'office' | 'basement' | 'common'>('research')
  const [addLabel, setAddLabel] = useState('')
  const [addCheckpointId, setAddCheckpointId] = useState<string | null>(null)
  const [addCheckpoints, setAddCheckpoints] = useState<any[]>([])
  const [addSubmitting, setAddSubmitting] = useState(false)
  // ── Phase 24: URL state (placingExtinguisher モード) ──
  const placingExtId = searchParams.get('placingExtinguisher')
  const isPlacingMode = !!placingExtId
  // ── Phase 24: 소화기 분리 confirm ──
  const [unassignConfirm, setUnassignConfirm] = useState<ExtinguisherDetail | null>(null)
  // ── Phase 24: 미배치 ❓ 마커 클릭 안내 (점검 모드) ──
  const [emptyMarkerModal, setEmptyMarkerModal] = useState<FloorPlanMarker | null>(null)
  // ── Phase 24: placing 확인 모달 ──
  const [placingConfirm, setPlacingConfirm] = useState<FloorPlanMarker | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<{ x_pct: number; y_pct: number } | null>(null) // 드래그 중 실시간 위치
  const [editMarker, setEditMarker] = useState(false) // 마커 수정 모달
  const [inspectModal, setInspectModal] = useState(false) // 인라인 점검 모달
  // ── 재진입 팝업 (일반 점검 완료/미조치 개소 진입 가드) ──
  const [revisitPopup, setRevisitPopup] = useState<{
    variant:       RevisitVariant
    checkedAt:     string
    inspectorName: string
    recordId?:     string
  } | null>(null)
  const [inspectExtDetail, setInspectExtDetail] = useState<ExtinguisherDetail | null>(null)
  const [inspectResult, setInspectResult] = useState<'normal' | 'caution' | 'bad'>('normal')
  const [inspectMemo, setInspectMemo] = useState('')
  const [inspectSymptomPick, setInspectSymptomPick] = useState<string>('점등 이상')
  const [inspectSymptomCustom, setInspectSymptomCustom] = useState('')
  const [inspectSubmitting, setInspectSubmitting] = useState(false)
  const inspectPhoto = usePhotoUpload()
  // ── paired BC (소화전 마커일 때 같은 location_no 의 비상콘센트를 함께 점검) ──
  const inspectBcPhoto = usePhotoUpload()
  const [inspectBcResult, setInspectBcResult] = useState<'normal' | 'caution' | 'bad'>('normal')
  const [inspectBcMemo, setInspectBcMemo] = useState('')
  const [pairedBC, setPairedBC] = useState<any | null>(null)
  const [resolveModal, setResolveModal] = useState(false)
  const [resolveMemo, setResolveMemo] = useState('')
  const [resolveActionPick, setResolveActionPick] = useState<'본체 교체' | '예비전원 교체' | '직접 입력'>('본체 교체')
  const [resolveMaterialName, setResolveMaterialName] = useState('')
  const [resolveMaterialCount, setResolveMaterialCount] = useState<string>('1')
  const [resolveSubmitting, setResolveSubmitting] = useState(false)
  const resolvePhoto = usePhotoUpload()
  const [editLabel, setEditLabel] = useState('')
  const [editMarkerType, setEditMarkerType] = useState<MarkerType>('wall_exit')
  const [editZone, setEditZone] = useState<'research' | 'office' | 'basement' | 'common'>('research')
  const [checkpoints, setCheckpoints] = useState<any[]>([]) // 현재 층 개소 목록 (비소화기 타입용)

  const MARKER_TYPE_KO: Record<string,string> = {
    ceiling_exit: '천장피난구',
    wall_exit: '벽부피난구',
    room_corridor: '거실통로',
    hallway_corridor: '복도통로',
    stair_corridor: '계단통로',
  }

  // 조치 모달 열릴 때 증상에 따라 기본 조치 선택
  useEffect(() => {
    if (!resolveModal || planType !== 'guidelamp' || !selected) return
    const sym = selected.last_memo ?? ''
    if (sym === '점등 이상') setResolveActionPick('본체 교체')
    else if (sym === '예비전원 이상') setResolveActionPick('예비전원 교체')
    else setResolveActionPick('직접 입력')
  }, [resolveModal, selected?.id])

  useEffect(() => {
    if (!resolveModal || planType !== 'guidelamp' || !selected) return
    if (resolveActionPick === '본체 교체') {
      setResolveMaterialName(MARKER_TYPE_KO[selected.marker_type ?? ''] ?? '')
      setResolveMaterialCount('1')
    } else if (resolveActionPick === '예비전원 교체') {
      setResolveMaterialName('예비전원')
      setResolveMaterialCount('1')
    } else {
      setResolveMaterialName('')
      setResolveMaterialCount('')
    }
  }, [resolveActionPick, resolveModal, planType, selected])

  // ── paired BC 식별 (소화전 마커 진입 시 같은 location_no 의 비상콘센트 조회) ──
  // InspectionPage 페어 모달과 동일한 룰. extinguisher plan + indoor_hydrant 마커 + check_point_id 가 있을 때만.
  // BC 매핑이 없거나 모달이 닫히면 항상 null.
  useEffect(() => {
    let cancelled = false
    if (!inspectModal || !selected || planType !== 'extinguisher' || selected.marker_type !== 'indoor_hydrant' || !selected.check_point_id) {
      setPairedBC(null)
      return
    }
    inspectionApi.getCheckpoints(selected.floor).then((all: any[]) => {
      if (cancelled) return
      const sh = all.find(cp => cp.id === selected.check_point_id)
      if (!sh || !sh.locationNo) { setPairedBC(null); return }
      const bc = all.find(cp => cp.category === '비상콘센트' && cp.locationNo === sh.locationNo)
      setPairedBC(bc ?? null)
    }).catch(() => { if (!cancelled) setPairedBC(null) })
    return () => { cancelled = true }
  }, [inspectModal, selected?.id, planType, selected?.marker_type, selected?.check_point_id, selected?.floor])

  // 모달이 닫히면 BC state 초기화
  useEffect(() => {
    if (!inspectModal) {
      setPairedBC(null)
      setInspectBcResult('normal')
      setInspectBcMemo('')
      inspectBcPhoto.reset()
    }
  }, [inspectModal])

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

  // ── 분말 소화기 교체 연한 강조용 데이터 ─────────────────
  // planType=extinguisher 일 때만 floor 별 소화기 데이터 fetch.
  // Phase 24: 자산 배치/분리/폐기/등록 후 도면 재진입 시 즉시 fresh — 빈 마커 판정 stale 방지.
  const extListQuery = useQuery({
    queryKey: ['extinguishers', floor],
    queryFn: () => extinguisherApi.list({ floor }),
    enabled: planType === 'extinguisher',
    staleTime: 30_000,           // 5분 → 30초 (자산-위치 분리는 자주 변경)
    refetchOnMount: 'always',    // 페이지 재진입 시 항상 refetch
  })

  // check_point_id → ReplaceWarning Map (분말 마커 강조 lookup 용)
  const cpIdToWarning = useMemo(() => {
    const map = new Map<string, NonNullable<ReplaceWarning>>()
    if (planType !== 'extinguisher') return map
    const items = extListQuery.data?.items ?? []
    for (const it of items) {
      const w = getReplaceWarning(it.type, it.manufactured_at)
      if (w && it.cp_id) map.set(it.cp_id, w)
    }
    return map
  }, [extListQuery.data, planType])

  // Phase 24: cp_id → 배치된 active 자산의 type. 마커 시각이 자산 type 기반으로 분기되도록.
  const cpIdToExtType = useMemo(() => {
    const map = new Map<string, string>()
    if (planType !== 'extinguisher') return map
    for (const it of extListQuery.data?.items ?? []) {
      if (it.cp_id && it.status !== '폐기' && it.type) map.set(it.cp_id, it.type)
    }
    return map
  }, [extListQuery.data, planType])

  // ── 이번 달 schedule_items — 재진입 팝업 판정에 사용 ──
  const currentMonth = (() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
  })()
  const { data: scheduleItems = [] } = useQuery({
    queryKey: ['schedule-month', currentMonth],
    queryFn: () => scheduleApi.getByMonth(currentMonth),
    staleTime: 60_000,
  })

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

  // Phase 24: 소화기 배치/분리 mutation
  const assignMutation = useMutation({
    mutationFn: ({ extId, cpId }: { extId: number; cpId: string }) => extinguisherApi.assign(extId, cpId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extinguishers', floor] })
      qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] })
      toast.success('소화기 배치 완료')
    },
    onError: (e: any) => toast.error(e.message ?? '배치 실패'),
  })
  const unassignMutation = useMutation({
    mutationFn: (extId: number) => extinguisherApi.unassign(extId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extinguishers', floor] })
      qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] })
      toast.success('소화기 분리 완료')
    },
    onError: (e: any) => toast.error(e.message ?? '분리 실패'),
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
    // 유도등 마커 추가는 관리자 데스크톱에서만 허용
    if (planType === 'guidelamp' && !isAdmin) return
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
        const firstType = addOptionMarkerTypes[0]?.key ?? 'wall_exit'
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
    // 데스크톱 편집 모드에서는 mouseUp에서 선택 처리 (드래그 충돌 방지)
    if (isDesktop && editMode) return

    // Phase 24: 소화기 배치 모드 — 마커 클릭 시 배치 확인 모달 또는 toast
    if (isPlacingMode && planType === 'extinguisher') {
      const items = extListQuery.data?.items ?? []
      const isExtAsset = EXT_ASSET_MARKER_TYPES.has(m.marker_type ?? '')
      const isEmpty = isExtAsset && (!m.check_point_id || !items.some(it => it.cp_id === m.check_point_id && it.status !== '폐기'))
      if (isEmpty) {
        // 미배치 마커 클릭 → 배치 확인
        setPlacingConfirm(m)
      } else {
        // 이미 소화기가 있는 개소 클릭 → 안내 toast
        toast('이미 소화기가 배치된 개소입니다', { icon: 'ℹ️' })
      }
      return
    }

    // Phase 24: 점검 모드에서 미배치 마커 클릭 → 안내 모달
    if (planType === 'extinguisher' && !editMode) {
      const items = extListQuery.data?.items ?? []
      const isExtAsset = EXT_ASSET_MARKER_TYPES.has(m.marker_type ?? '')
      const isEmpty = isExtAsset && (!m.check_point_id || !items.some(it => it.cp_id === m.check_point_id && it.status !== '폐기'))
      if (isEmpty) {
        setEmptyMarkerModal(m)
        return
      }
    }

    setSelected(m)
  }

  function onMarkerTouchStart(m: FloorPlanMarker, e: React.TouchEvent) {
    e.stopPropagation()
    if (editMode) {
      // 유도등 마커 이동은 관리자 데스크톱에서만 허용
      if (planType === 'guidelamp' && !isAdmin) { setSelected(m); return }
      setDragId(m.id)
      setSelected(m)
    }
  }

  // ── 데스크톱: 마우스 드래그로 마커 이동 ───────────────────
  const mouseDragRef = useRef(false)
  const mouseMovedRef = useRef(false)
  const mousePanRef = useRef(false)
  const mouseLastRef = useRef({ x: 0, y: 0 })
  const mouseDragMarkerRef = useRef<FloorPlanMarker | null>(null)

  function onMarkerMouseDown(m: FloorPlanMarker, e: React.MouseEvent) {
    if (!editMode || !isDesktop) return
    // 유도등 마커 이동은 관리자만 가능
    if (planType === 'guidelamp' && !isAdmin) return
    e.preventDefault()
    e.stopPropagation()
    setDragId(m.id)
    mouseDragRef.current = true
    mouseMovedRef.current = false
    mouseDragMarkerRef.current = m
  }

  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDesktop) return
    mouseLastRef.current = { x: e.clientX, y: e.clientY }
    mousePanRef.current = true
  }, [isDesktop])

  const onCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDesktop) return
    // 마커 드래그
    if (mouseDragRef.current && dragId) {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const s = scaleRef.current
      const t = translateRef.current
      const wx = (e.clientX - rect.left - rect.width / 2 - t.x) / s + rect.width / 2
      const wy = (e.clientY - rect.top - rect.height / 2 - t.y) / s + rect.height / 2
      const xPct = ((wx - imgRect.offX) / imgRect.w) * 100
      const yPct = ((wy - imgRect.offY) / imgRect.h) * 100
      if (xPct >= 0 && xPct <= 100 && yPct >= 0 && yPct <= 100) {
        setDragPos({ x_pct: Math.round(xPct * 100) / 100, y_pct: Math.round(yPct * 100) / 100 })
        mouseMovedRef.current = true
      }
      return
    }
    // 캔버스 패닝
    if (mousePanRef.current) {
      const dx = e.clientX - mouseLastRef.current.x
      const dy = e.clientY - mouseLastRef.current.y
      mouseLastRef.current = { x: e.clientX, y: e.clientY }
      const s = scaleRef.current
      const t = translateRef.current
      const clamped = clampTranslate(t.x + dx, t.y + dy, s)
      setTranslate(clamped)
    }
  }, [isDesktop, dragId])

  const onCanvasMouseUp = useCallback(() => {
    if (!isDesktop) return
    if (mouseDragRef.current) {
      if (mouseMovedRef.current && dragId && dragPos) {
        // 실제 드래그 발생 → DB에 위치 저장
        updateMutation.mutate({ id: dragId, body: { x_pct: dragPos.x_pct, y_pct: dragPos.y_pct } })
      } else if (!mouseMovedRef.current && mouseDragMarkerRef.current) {
        // 클릭만 한 경우 → 마커 선택
        setSelected(mouseDragMarkerRef.current)
      }
    }
    mouseDragRef.current = false
    mouseMovedRef.current = false
    mousePanRef.current = false
    mouseDragMarkerRef.current = null
    setDragId(null)
    setDragPos(null)
  }, [isDesktop, dragId, dragPos])

  // ── 데스크톱: 더블클릭으로 마커 추가 ─────────────────────
  const onCanvasDblClick = useCallback((e: React.MouseEvent) => {
    if (!isDesktop || !editMode) return
    // 유도등 마커 추가는 관리자만 가능
    if (planType === 'guidelamp' && !isAdmin) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const s = scaleRef.current
    const t = translateRef.current
    const wx = (e.clientX - rect.left - rect.width / 2 - t.x) / s + rect.width / 2
    const wy = (e.clientY - rect.top - rect.height / 2 - t.y) / s + rect.height / 2
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
  }, [isDesktop, editMode, addOptionMarkerTypes])

  // ── 데스크톱: 말풍선 위치 계산 ────────────────────────────
  function getBalloonPos(m: FloorPlanMarker) {
    const el = containerRef.current
    if (!el) return { left: 0, top: 0, arrowDir: 'bottom' as const }
    const rect = el.getBoundingClientRect()
    const s = scaleRef.current
    const t = translateRef.current
    const px = imgRect.offX + (m.x_pct / 100) * imgRect.w
    const py = imgRect.offY + (m.y_pct / 100) * imgRect.h
    // 변환된 화면 좌표
    const screenX = (px - rect.width / 2) * s + t.x + rect.width / 2
    const screenY = (py - rect.height / 2) * s + t.y + rect.height / 2
    // 말풍선 방향 결정 (마커가 상단이면 아래로, 하단이면 위로)
    const arrowDir = screenY > rect.height * 0.5 ? 'top' : 'bottom'
    return { left: screenX, top: screenY, arrowDir }
  }

  // ── 추가 모달: 마커 타입 변경 시 개소 로드 (소화기·소화전) ──
  function loadAddCheckpoints(markerType: string) {
    if (planType === 'extinguisher') {
      const markerCatMap: Record<string, string> = { fire_extinguisher: '소화기', ext_powder20: '소화기', ext_halogen: '소화기', ext_kitchen_k: '소화기', indoor_hydrant: '소화전', descending_lifeline: '완강기', div_marker: 'DIV' }
      const cat = markerCatMap[markerType] ?? '소화기'
      inspectionApi.getCheckpoints(floor).then(all => setAddCheckpoints(all.filter((cp: any) => cp.category === cat))).catch(() => setAddCheckpoints([]))
    }
    setAddCheckpointId(null)
  }

  // ── 마커 추가 제출 ────────────────────────────────────
  // Phase 24: extinguisher plan type 은 개소명(label) + 구역 만 입력. 마커 위치만 등록, 소화기 매핑은 별도.
  async function submitAddMarker() {
    if (!addModal) return
    if (planType === 'extinguisher') {
      if (!addLabel.trim()) { toast.error('개소명을 입력하세요'); return }
    }
    createMutation.mutate({
      floor,
      plan_type: planType,
      marker_type: addMarkerType,
      x_pct: addModal.x_pct,
      y_pct: addModal.y_pct,
      label: addLabel || undefined,
      check_point_id: addCheckpointId || undefined,
      zone: (planType === 'guidelamp' || planType === 'extinguisher') ? addZone : undefined,
    })
    setAddModal(null)
  }

  // ── 도면 URL & 현재 마커 타입 목록 ─────────────────────
  const floorPlanUrl = getFloorPlanUrl(planType, floor)
  const planReady = PLAN_TYPES.find(p => p.key === planType)?.ready

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-page relative">

      {/* ── 헤더 ─────────────────────────────────────── */}
      {/* 데스크톱: height 54 + padding '0 20px', 뒤로가기 제거 (사이드바 nav). 모바일: 기존 유지 */}
      <header className={`flex-shrink-0 flex items-center bg-surface-raised border-b border-border-default ${isDesktop ? 'h-[54px] px-5 gap-2.5' : 'px-3 py-2 gap-2'}`}>
        {!isDesktop && (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex-shrink-0 rounded-lg bg-surface-sunken border border-border-default text-text-secondary inline-flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
        )}
        <span className={`flex-1 font-bold text-text-primary truncate ${isDesktop ? 'text-body' : 'text-body-sm'}`}>소방 시설 도면</span>
        {canEditMarker && (
          <button
            onClick={() => { setEditMode(!editMode); setSelected(null) }}
            className={`h-8 px-3 rounded-lg text-caption font-semibold leading-none cursor-pointer inline-flex items-center gap-1 transition-[background,border-color] duration-[130ms] ${editMode ? 'bg-accent border border-accent text-on-accent' : 'bg-surface-sunken border border-border-default text-text-secondary'}`}
          >
            {editMode ? '편집 완료' : '마커 편집'}
          </button>
        )}
        <button
          onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }) }}
          className="h-8 px-3 rounded-lg bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold leading-none cursor-pointer inline-flex items-center gap-1 transition-[background,border-color] duration-[130ms]"
        >
          축소보기
        </button>
      </header>

      {/* ── 도면 종류 선택 ───────────────────────────── */}
      <div className="flex-shrink-0 flex gap-1 px-3 py-2 bg-surface-raised border-b border-border-default">
        {PLAN_TYPES.map(p => (
          <button
            key={p.key}
            onClick={() => p.ready && setPlanType(p.key)}
            className={`flex-1 h-9 rounded-lg text-label font-semibold transition-[background] duration-[130ms] inline-flex items-center justify-center relative ${p.ready ? 'cursor-pointer' : 'cursor-default opacity-40'} ${planType === p.key ? 'bg-accent border border-accent text-on-accent' : 'bg-surface-sunken border border-border-default text-text-tertiary'}`}
          >
            {p.label}
            {!p.ready && <span className="absolute -top-1.5 -right-0.5 text-[10px] leading-none bg-surface-sunken text-text-tertiary px-1 py-px rounded border border-border-default">준비중</span>}
          </button>
        ))}
      </div>

      {/* ── 층 선택 탭 ───────────────────────────────── */}
      <div className="flex-shrink-0 flex gap-1 overflow-x-auto px-3 py-2 bg-surface-raised border-b border-border-default">
        {FLOORS.map(f => (
          <button
            key={f}
            onClick={() => setFloor(f)}
            className={`flex-shrink-0 h-8 px-3 rounded-lg text-caption font-semibold leading-none cursor-pointer inline-flex items-center justify-center transition-[background] duration-[130ms] ${floor === f ? 'bg-accent border border-accent text-on-accent' : 'bg-surface-sunken border border-border-default text-text-secondary'}`}
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
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
        onMouseLeave={onCanvasMouseUp}
        onDoubleClick={onCanvasDblClick}
        onClick={() => { if (!editMode && !mousePanRef.current) setSelected(null) }}
      >
        {/* ── 편집모드 안내 (absolute — 레이아웃 영향 없음) ── */}
        {editMode && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, pointerEvents: 'none' }} className="px-3 py-1.5 bg-accent/90 text-caption font-semibold leading-none text-white text-center flex items-center justify-center gap-1.5">
            {isDesktop ? '더블클릭으로 마커 추가 · 마커를 드래그하여 이동 · 클릭하여 선택' : '길게 누르면 마커 추가 · 마커를 터치하여 선택/삭제'}
          </div>
        )}
        {/* Phase 24: 소화기 배치 모드 안내 배너 */}
        {isPlacingMode && !editMode && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, pointerEvents: 'none' }} className="px-3 py-1.5 bg-danger/90 text-caption font-bold leading-none text-white text-center flex items-center justify-center">
            배치할 위치(개소)를 선택하세요 — 뒤로가기로 취소
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
                  onMouseDown={(e) => onMarkerMouseDown(m, e)}
                  style={{
                    position: 'absolute',
                    left: px,
                    top: py,
                    transform: `translate(-50%, -50%) scale(${Math.max(0.5, 1 / Math.sqrt(scale))})`,
                    cursor: 'pointer',
                    zIndex: isDragging ? 50 : selected?.id === m.id ? 10 : 1,
                    outline: (isDragging || selected?.id === m.id) ? '2.5px solid var(--accent)' : 'none',
                    outlineOffset: 2,
                    borderRadius: '50%',
                    pointerEvents: 'auto',
                  }}
                >
                  {(() => {
                    // Phase 24: 빈 마커 (미배치) 판단 — extinguisher plan type 의 소화기 자산 마커만
                    // 소화전/완강기/DIV는 자체 점검 대상이라 빈 마커 판정에서 제외.
                    if (planType === 'extinguisher' && EXT_ASSET_MARKER_TYPES.has(m.marker_type ?? '')) {
                      const items = extListQuery.data?.items ?? []
                      const isEmpty = !m.check_point_id || !items.some(it => it.cp_id === m.check_point_id && it.status !== '폐기')
                      if (isEmpty) {
                        return (
                          <svg width={13} height={13} viewBox="0 0 13 13">
                            <circle cx="6.5" cy="6.5" r="6.5" fill="#ef4444"/>
                            <text x="6.5" y="10.5" fontSize={8} fill="#fff" textAnchor="middle"
                              fontWeight={700} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>?</text>
                          </svg>
                        )
                      }
                    }
                    // Phase 24: 매핑된 ext 자산이 있으면 자산 type 기반으로 시각 분기.
                    // 매핑 없거나 이외 marker_type 은 그대로 marker_type 시각 사용.
                    const mappedExtType = m.check_point_id ? cpIdToExtType.get(m.check_point_id) : undefined
                    const effectiveMarkerType = (planType === 'extinguisher' && mappedExtType && EXT_ASSET_MARKER_TYPES.has(m.marker_type ?? ''))
                      ? extTypeToMarkerType(mappedExtType)
                      : m.marker_type
                    const isPowder = effectiveMarkerType === 'fire_extinguisher' || effectiveMarkerType === 'ext_powder20'
                    const warning = isPowder && m.check_point_id ? (cpIdToWarning.get(m.check_point_id) ?? null) : null
                    const stroke = warning ? REPLACE_WARNING_STROKE[warning] : { color: '#fff', width: 1.5 }
                    return (
                      <MarkerIcon
                        markerType={effectiveMarkerType}
                        color={color}
                        size={13}
                        strokeColor={stroke.color}
                        strokeWidth={stroke.width}
                        dangerBadge={warning === 'danger'}
                      />
                    )
                  })()}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-text-tertiary text-body-sm font-semibold">
            도면 준비 중
          </div>
        )}

        {/* ── 마커 상세 (데스크톱: 말풍선 / 모바일: 바텀시트) ── */}
        {selected && !addModal && !editMarker && (() => {
        const statusColor = STATUS_COLOR[getMarkerStatus(selected)] ?? STATUS_COLOR.normal
        // Phase 24: cp_location (실제 위치명) 우선 표시. 없으면 사용자 라벨 → marker_type 라벨 fallback.
        const markerLabel = selected.cp_location || selected.label || currentMarkerTypes.find(mt => mt.key === selected.marker_type)?.label.join('') || '마커'
        const statusLabel = { normal: '정상', caution: '주의', fault: '불량', bad: '불량', resolved: '조치완료' }[getMarkerStatus(selected)] ?? '미점검'

        const openEditMarkerModal = () => {
          setEditLabel(selected.label ?? '')
          setEditMarkerType((selected.marker_type as MarkerType) ?? 'wall_exit')
          setEditZone(((selected as any).zone as 'research' | 'office' | 'basement' | 'common') ?? 'research')
          if (planType !== 'extinguisher') {
            const cat = { detector: '자동화재탐지설비', sprinkler: '스프링클러설비', guidelamp: '유도등' }[planType] ?? '유도등'
            inspectionApi.getCheckpoints(floor).then(all => setCheckpoints(all.filter((cp: any) => cp.category === cat))).catch(() => setCheckpoints([]))
          }
          setEditMarker(true)
        }

        const canInspect = !isDesktop && (planType === 'guidelamp' || !!selected.check_point_id)
        const canResolve = !isDesktop && !!selected.last_record_id && (selected.last_result === 'bad' || selected.last_result === 'caution') && selected.last_status !== 'resolved'

        // ── 재진입 팝업 판정 (점검 기록 입력 버튼 클릭 시) ──
        // 마커 카테고리 → schedule_items.inspectionCategory 매핑.
        // 잠긴 결정 기준 (CCTV·화재수신반 만 제외, 나머지 전부 대상).
        //   guidelamp    → 유도등
        //   extinguisher → 소화기 / 소화전 / 완강기 / DIV (marker_type 기준)
        //   detector     → 자동화재탐지설비
        //   sprinkler    → 스프링클러설비
        const planTypeToCategory = (() => {
          if (planType === 'guidelamp') return '유도등'
          if (planType === 'detector')  return '자동화재탐지설비'
          if (planType === 'sprinkler') return '스프링클러설비'
          if (planType === 'extinguisher') {
            const map: Record<string, string> = {
              fire_extinguisher: '소화기', ext_powder20: '소화기', ext_halogen: '소화기', ext_kitchen_k: '소화기',
              indoor_hydrant: '소화전', descending_lifeline: '완강기', div_marker: 'DIV',
            }
            return map[selected.marker_type ?? ''] ?? '소화기'
          }
          return null
        })()

        const SCHED_ALIAS: Record<string, string> = { '방화문': '특별피난계단' }
        const evalRevisit = (): { variant: RevisitVariant; checkedAt: string; inspectorName: string; recordId?: string } | null => {
          if (!planTypeToCategory) return null
          if (!selected.last_result) return null
          if (!selected.last_inspected_at) return null

          // Task 6.4: pending (bad|caution + status !== 'resolved') 은 기간 무관 즉시 팝업.
          // 정책: 조치 대기는 "기간" 이 아니라 "이 개소 조치해야 함" 경고.
          //       사용자가 재진입 = 조치 확인 의도로 해석 → activeWindow / scheduleMatch 필터 전부 skip.
          //       훅(useInspectionRevisitPopup)의 T6.1 과 동일 규칙.
          const who = (selected.last_inspected_by as string | null | undefined) ?? '—'
          const isPending = (selected.last_result === 'bad' || selected.last_result === 'caution') && selected.last_status !== 'resolved'
          if (isPending) {
            return {
              variant:       'pending-action',
              checkedAt:     selected.last_inspected_at as string,
              inspectorName: who,
              recordId:      selected.last_record_id as string | undefined,
            }
          }

          // Task 7: completed 분기도 inPeriod 체크 제거.
          // 정책: "오늘 그 카테고리 활성 창이 존재 + 해당 개소에 기록이 존재" 이면 팝업.
          // 기록 날짜가 창 안일 필요 없음 (훅 useInspectionRevisitPopup T7.1 과 동일 규칙).
          const matches = scheduleItems.filter(s => {
            if (s.category !== 'inspect') return false
            const ic = s.inspectionCategory ?? ''
            if (ic === planTypeToCategory) return true
            if (SCHED_ALIAS[ic] && SCHED_ALIAS[ic] === planTypeToCategory) return true
            return false
          })
          if (matches.length === 0) return null

          const todayYmd = (() => {
            const now = new Date()
            return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
          })()
          const activeMatch = matches.find(s => {
            const start = s.date
            const end   = s.endDate ?? s.date
            return todayYmd >= start && todayYmd <= end
          })
          if (!activeMatch) return null

          return {
            variant:       'completed',
            checkedAt:     selected.last_inspected_at as string,
            inspectorName: who,
            recordId:      selected.last_record_id as string | undefined,
          }
        }

        const openInspectModal = () => {
          setInspectResult('normal'); setInspectMemo(''); setInspectSymptomPick('점등 이상'); setInspectSymptomCustom('')
          inspectPhoto.reset(); setInspectExtDetail(null)
          setInspectBcResult('normal'); setInspectBcMemo(''); inspectBcPhoto.reset()
          if (planType === 'extinguisher' && selected?.check_point_id) {
            extinguisherApi.getDetail(selected.check_point_id).then(d => setInspectExtDetail(d)).catch(() => {})
          }
          setInspectModal(true)
        }

        const actionButtons = (
          <div className="flex gap-2">
            {canInspect && (
              <button
                onClick={() => {
                  // 접근불가 마커는 점검완료 팝업 건너뛰고 바로 AccessBlockedPopup 만 표시
                  if (selected?.description?.includes('접근불가')) { openInspectModal(); return }
                  const r = evalRevisit(); if (r) setRevisitPopup(r); else openInspectModal()
                }}
                className="flex-1 h-11 rounded-[10px] bg-accent border-none text-on-accent text-body-sm font-bold cursor-pointer inline-flex items-center justify-center"
              >
                점검 기록 입력
              </button>
            )}
            {canResolve && (
              <button
                onClick={() => { setResolveMemo(''); resolvePhoto.reset(); setResolveModal(true) }}
                className="flex-1 h-11 rounded-[10px] bg-[var(--status-fire-bar)] border-none text-white text-body-sm font-bold cursor-pointer inline-flex items-center justify-center"
              >
                조치
              </button>
            )}
            {editMode && (
              <>
                <button
                  onClick={openEditMarkerModal}
                  className={`flex-1 ${isDesktop ? 'h-[38px] rounded-[10px] text-label' : 'h-11 rounded-[10px] text-body-sm'} bg-surface-sunken border border-border-default text-text-primary font-semibold cursor-pointer inline-flex items-center justify-center`}
                >
                  수정
                </button>
                <button
                  onClick={() => { if (confirm('마커를 삭제하시겠습니까?')) deleteMutation.mutate(selected.id) }}
                  className={`${isDesktop ? 'w-[38px] h-[38px] rounded-[10px]' : 'w-11 h-11 rounded-[10px]'} bg-danger-bg border border-danger-bar/30 text-danger cursor-pointer inline-flex items-center justify-center flex-shrink-0`}
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        )

        // ── 데스크톱: 말풍선 ──
        if (isDesktop) {
          const bp = getBalloonPos(selected)
          const BALLOON_W = 320
          const BALLOON_GAP = 16
          return (
            <div
              style={{
                position: 'absolute',
                left: Math.max(8, Math.min(bp.left - BALLOON_W / 2, (containerRef.current?.clientWidth ?? 800) - BALLOON_W - 8)),
                top: bp.arrowDir === 'bottom' ? bp.top + BALLOON_GAP : undefined,
                bottom: bp.arrowDir === 'top' ? (containerRef.current?.clientHeight ?? 600) - bp.top + BALLOON_GAP : undefined,
                width: BALLOON_W,
                zIndex: 30,
              }}
              className="bg-surface-raised border border-border-strong rounded-[14px] px-4 pt-[14px] pb-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
              onClick={e => e.stopPropagation()}
            >
              {/* 화살표 */}
              <div style={{
                position: 'absolute',
                left: Math.max(16, Math.min(bp.left - Math.max(8, Math.min(bp.left - BALLOON_W / 2, (containerRef.current?.clientWidth ?? 800) - BALLOON_W - 8)), BALLOON_W - 16)),
                ...(bp.arrowDir === 'bottom'
                  ? { top: -8, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid var(--surface-raised)' }
                  : { bottom: -8, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid var(--surface-raised)' }
                ),
                width: 0, height: 0, transform: 'translateX(-8px)',
              }} />

              <div className="flex items-start gap-2.5 mb-3">
                <div
                  className="w-9 h-9 rounded-[9px] flex-shrink-0 flex items-center justify-center"
                  style={{ background: statusColor + '22', border: `1.5px solid ${statusColor}55` }}
                >
                  <MarkerIcon markerType={selected.marker_type} color={statusColor} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm font-bold text-text-primary mb-0.5">{markerLabel}</div>
                  <div className="flex gap-1.5 flex-wrap items-center">
                    <span className="text-caption text-text-tertiary">{floor}</span>
                    {selected.check_point_id && <span className="text-caption text-text-tertiary">ID: {selected.check_point_id}</span>}
                    <span className="text-caption font-bold" style={{ color: statusColor }}>{statusLabel}</span>
                    {selected.last_inspected_at && <span className="text-caption text-text-tertiary">최근 {selected.last_inspected_at.slice(0, 10)}</span>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 flex-shrink-0 bg-transparent border-none text-text-tertiary cursor-pointer inline-flex items-center justify-center rounded-[6px]">
                  <X size={16} />
                </button>
              </div>
              {actionButtons}
            </div>
          )
        }

        // ── 모바일: 바텀시트 ──
        return (
          <div
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30 }}
            className="bg-surface-raised border-t border-border-strong rounded-t-2xl px-4 pt-3.5 pb-5 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-sm bg-border-strong mx-auto mb-3.5" />
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                style={{ background: statusColor + '22', border: `1.5px solid ${statusColor}55` }}
              >
                <MarkerIcon markerType={selected.marker_type} color={statusColor} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body-sm font-bold text-text-primary mb-0.5">{markerLabel}</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-caption text-text-tertiary">{floor}</span>
                  {selected.check_point_id && <span className="text-caption text-text-tertiary">ID: {selected.check_point_id}</span>}
                  <span className="text-caption font-bold" style={{ color: statusColor }}>{statusLabel}</span>
                  {selected.last_inspected_at && <span className="text-caption text-text-tertiary">최근 {selected.last_inspected_at.slice(0, 10)}</span>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex-shrink-0 bg-transparent border-none text-text-tertiary cursor-pointer inline-flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            {actionButtons}
          </div>
        )
      })()}
      </div>

      {/* ── 범례 — BottomNav 사이즈(54 + safe-area) 기본, 항목 많으면 wrap 으로 자동 확장.
             각 row 는 양끝 정렬(space-between), 폭 부족시 두 줄로 wrap. 가로 스크롤 없음. ── */}
      {(() => {
        return (
          <div
            data-no-print
            className="flex-shrink-0 bg-surface-raised border-t border-border-default px-3 pb-[26px] pt-px flex flex-col gap-2 min-h-[93px]"
          >
            {/* Row 1: 마커 종류 — 양끝 정렬, 안 들어가면 두 줄로 wrap */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 w-full">
              {currentMarkerTypes.map(mt => (
                <div key={mt.key} className="inline-flex items-center gap-[5px] flex-shrink-0">
                  <MarkerIcon markerType={mt.key} color="var(--text-tertiary)" size={13} />
                  <span className="text-caption font-medium leading-none text-text-secondary whitespace-nowrap">{mt.label.join('')}</span>
                </div>
              ))}
            </div>
            {/* Row 2: 점검 상태 + (planType==='extinguisher' 일 때) 연한 */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 w-full">
              {['normal', 'caution', 'fault', 'resolved'].map(s => (
                <div key={s} className="inline-flex items-center gap-[5px] flex-shrink-0">
                  <div className="w-[9px] h-[9px] rounded-full" style={{ background: STATUS_COLOR[s] }} />
                  <span className="text-caption font-medium leading-none text-text-secondary whitespace-nowrap">{{ normal: '정상', caution: '주의', fault: '불량', resolved: '완료' }[s]}</span>
                </div>
              ))}
              {/* Phase 24: 미배치 마커 범례 */}
              {planType === 'extinguisher' && (
                <div className="inline-flex items-center gap-[5px] flex-shrink-0">
                  <div className="w-[9px] h-[9px] rounded-full bg-[#ef4444] flex items-center justify-center">
                    <span className="text-[6px] font-bold text-white leading-none">?</span>
                  </div>
                  <span className="text-caption font-medium leading-none text-text-secondary whitespace-nowrap">미배치</span>
                </div>
              )}
              {planType === 'extinguisher' && (
                <>
                  <div className="w-px h-3 bg-border-default mx-0.5 flex-shrink-0" />
                  {(['warn', 'imminent', 'danger'] as const).map(w => {
                    const stroke = REPLACE_WARNING_STROKE[w]
                    const label = { warn: '도래', imminent: '임박', danger: '초과' }[w]
                    return (
                      <div key={w} className="inline-flex items-center gap-[5px] flex-shrink-0">
                        <MarkerIcon
                          markerType="fire_extinguisher"
                          color="var(--text-tertiary)"
                          size={13}
                          strokeColor={stroke.color}
                          strokeWidth={stroke.width}
                          dangerBadge={w === 'danger'}
                        />
                        <span className="text-caption font-medium leading-none text-text-secondary whitespace-nowrap">{label}</span>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        )
      })()}

      {/* ── 마커 수정 모달 ───────────────────────────── */}
      {editMarker && selected && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60" onClick={() => setEditMarker(false)}>
          <div className="w-[90%] max-w-[340px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="text-body-sm font-bold text-text-primary mb-4">마커 수정</div>

            {(planType === 'guidelamp' || planType === 'extinguisher') && (
              <>
                <div className="text-caption text-text-tertiary mb-1.5">구역</div>
                <div className="flex gap-1.5 mb-3.5">
                  {([
                    { key: 'research', label: '연구동' },
                    { key: 'office',   label: '사무동' },
                    { key: 'basement', label: '지하'   },
                  ] as const).map(z => (
                    <button
                      key={z.key}
                      onClick={() => setEditZone(z.key)}
                      className={`flex-1 py-2 rounded-lg text-caption font-bold cursor-pointer ${
                        editZone === z.key
                          ? 'bg-accent text-on-accent border-0'
                          : 'bg-surface-sunken text-text-secondary border border-border-default'
                      }`}
                    >{z.label}</button>
                  ))}
                </div>
              </>
            )}

            <div className="text-caption text-text-tertiary mb-1.5">{{ detector: '감지기 종류', sprinkler: '스프링클러 종류', guidelamp: '유도등 종류', extinguisher: '마커 종류' }[planType]}</div>
            <div className="grid grid-cols-3 gap-1.5 mb-3.5">
              {addOptionMarkerTypes.map(mt => (
                <button
                  key={mt.key}
                  onClick={() => setEditMarkerType(mt.key as MarkerType)}
                  className={`px-1 py-2 rounded-lg text-caption font-semibold cursor-pointer flex flex-col items-center gap-[3px] leading-[1.2] ${
                    editMarkerType === mt.key
                      ? 'bg-accent text-on-accent border-0'
                      : 'bg-surface-sunken text-text-secondary border border-border-default'
                  }`}
                >
                  <MarkerIcon markerType={mt.key} color={editMarkerType === mt.key ? '#fff' : 'var(--text-tertiary)'} size={16} />
                  <span>{mt.label[0]}</span><span>{mt.label[1]}</span>
                </button>
              ))}
            </div>

            <div className="text-caption text-text-tertiary mb-1.5">{planType === 'extinguisher' ? '개소명' : '라벨'}</div>
            <input
              value={editLabel}
              onChange={e => setEditLabel(e.target.value)}
              placeholder="예: 피난구 B5-01"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-sunken border border-border-default text-text-primary text-body-sm mb-3.5 box-border"
            />

            {/* Phase 24: extinguisher plan type — 소화기 관련 액션 버튼 (점검 개소 연결 셀렉터 제거) */}
            {planType === 'extinguisher' && (() => {
              const items = extListQuery.data?.items ?? []
              const mappedExt = selected.check_point_id
                ? items.find(it => it.cp_id === selected.check_point_id && it.status !== '폐기')
                : null
              if (mappedExt) {
                return (
                  <>
                    <div className="flex gap-2 mb-3.5">
                      <button
                        onClick={() => { setUnassignConfirm(mappedExt as ExtinguisherDetail); setEditMarker(false) }}
                        className="flex-1 py-2 rounded-lg text-caption font-bold cursor-pointer bg-danger-bg text-danger border border-danger-bar/30"
                      >소화기 분리</button>
                    </div>
                  </>
                )
              }
              // 미배치 마커 — 소화기 배치 버튼. fromMarker 는 marker_id (FPM-) 또는 cp_id (CP-FE-) 둘 다 지원.
              return (
                <button
                  onClick={() => {
                    setEditMarker(false)
                    const ref = selected.check_point_id || selected.id
                    navigate(`/extinguishers?fromMarker=${ref}&zone=${(selected as any).zone ?? ''}&floor=${selected.floor ?? floor}`)
                  }}
                  className="w-full h-[42px] rounded-[10px] bg-accent text-on-accent text-body-sm font-bold cursor-pointer mb-3.5"
                >소화기 배치</button>
              )
            })()}

            <div className="flex gap-2">
              <button onClick={() => setEditMarker(false)} className="flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">
                취소
              </button>
              <button
                onClick={() => {
                  updateMutation.mutate({
                    id: selected.id,
                    body: {
                      label: editLabel || undefined,
                      marker_type: editMarkerType,
                      zone: (planType === 'guidelamp' || planType === 'extinguisher') ? editZone : undefined,
                    }
                  }, {
                    onSuccess: () => { setEditMarker(false); setSelected(null); toast.success('마커 수정됨') }
                  })
                }}
                className="flex-1 h-[42px] rounded-[10px] bg-accent text-on-accent text-label font-bold cursor-pointer"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 마커 추가 모달 ───────────────────────────── */}
      {addModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60" onClick={() => setAddModal(null)}>
          <div className="w-[90%] max-w-[320px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong" onClick={e => e.stopPropagation()}>
            <div className="text-body-sm font-bold text-text-primary mb-4">마커 추가</div>

            {planType === 'guidelamp' && (
              <>
                <div className="text-caption text-text-tertiary mb-1.5">구역</div>
                <div className="flex gap-1.5 mb-3.5">
                  {([
                    { key: 'research', label: '연구동' },
                    { key: 'office',   label: '사무동' },
                    { key: 'basement', label: '지하'   },
                  ] as const).map(z => (
                    <button
                      key={z.key}
                      onClick={() => setAddZone(z.key)}
                      className={`flex-1 py-2 rounded-lg text-caption font-bold cursor-pointer ${
                        addZone === z.key
                          ? 'bg-accent text-on-accent border-0'
                          : 'bg-surface-sunken text-text-secondary border border-border-default'
                      }`}
                    >{z.label}</button>
                  ))}
                </div>
              </>
            )}

            <div className="text-caption text-text-tertiary mb-1.5">{{ detector: '감지기 종류', sprinkler: '스프링클러 종류', guidelamp: '유도등 종류', extinguisher: '마커 종류' }[planType]}</div>
            <div className="grid grid-cols-3 gap-1.5 mb-3.5">
              {addOptionMarkerTypes.map(mt => (
                <button
                  key={mt.key}
                  onClick={() => { setAddMarkerType(mt.key as MarkerType); setAddCheckpointId(null); loadAddCheckpoints(mt.key) }}
                  className={`px-1 py-2 rounded-lg text-caption font-semibold cursor-pointer flex flex-col items-center gap-[3px] leading-[1.2] ${
                    addMarkerType === mt.key
                      ? 'bg-accent text-on-accent border-0'
                      : 'bg-surface-sunken text-text-secondary border border-border-default'
                  }`}
                >
                  <MarkerIcon markerType={mt.key} color={addMarkerType === mt.key ? '#fff' : 'var(--text-tertiary)'} size={16} />
                  <span>{mt.label[0]}</span><span>{mt.label[1]}</span>
                </button>
              ))}
            </div>

            {/* Phase 24: extinguisher plan type — 개소명 + 구역 만 입력 */}
            {planType === 'extinguisher' ? (
              <>
                <div className="text-caption text-text-tertiary mb-1.5">개소명 *</div>
                <input
                  value={addLabel}
                  onChange={e => setAddLabel(e.target.value)}
                  placeholder="예: 5번계단 뒤"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-sunken border border-border-default text-text-primary text-body-sm mb-3.5 box-border"
                />
                <div className="text-caption text-text-tertiary mb-1.5">구역 *</div>
                <div className="flex gap-1.5 mb-3.5">
                  {([
                    { key: 'research', label: '연구동' },
                    { key: 'office',   label: '사무동' },
                    { key: 'basement', label: '지하'   },
                  ] as const).map(z => (
                    <button
                      key={z.key}
                      onClick={() => setAddZone(z.key)}
                      className={`flex-1 py-2 rounded-lg text-caption font-bold cursor-pointer ${
                        addZone === z.key
                          ? 'bg-accent text-on-accent border-0'
                          : 'bg-surface-sunken text-text-secondary border border-border-default'
                      }`}
                    >{z.label}</button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-caption text-text-tertiary mb-1.5">라벨 (선택)</div>
                <input
                  value={addLabel}
                  onChange={e => setAddLabel(e.target.value)}
                  placeholder="예: 피난구 B5-01"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-sunken border border-border-default text-text-primary text-body-sm mb-3.5 box-border"
                />
              </>
            )}

            <div className="flex gap-2">
              <button onClick={() => setAddModal(null)} className="flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">
                취소
              </button>
              <button disabled={addSubmitting} onClick={submitAddMarker} className={`flex-1 h-[42px] rounded-[10px] text-label font-bold ${addSubmitting ? 'bg-border-strong text-text-tertiary cursor-default' : 'bg-accent text-on-accent cursor-pointer'}`}>
                {addSubmitting ? '등록 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 재진입 팝업 (일반 점검 완료/미조치 개소 진입 시) ── */}
      {revisitPopup && (
        <div className="fixed inset-0 z-[60] bg-black/55 flex items-center justify-center p-4">
          <div className="relative w-[90%] max-w-[320px] min-h-[180px]">
            <InspectionRevisitPopup
              variant={revisitPopup.variant}
              checkedAt={revisitPopup.checkedAt}
              inspectorName={revisitPopup.inspectorName}
              recordId={revisitPopup.recordId}
              onClose={() => {
                // Task 5 C3 신규 버그 수정:
                // 완료(가) 확인 → 재점검 모달로 넘어감. 잠긴 결정의 '확인 = 재점검 가능' 조항을
                // 마커 경로에서도 실제로 연결. pending(나) 취소는 기존대로 단순 닫기 (InspectionPage
                // 모달들과 일관된 UX — 사용자가 명시적으로 다시 '점검 기록 입력' 을 눌러야 함).
                const wasCompleted = revisitPopup.variant === 'completed'
                setRevisitPopup(null)
                if (wasCompleted && selected) {
                  setInspectResult('normal'); setInspectMemo(''); setInspectSymptomPick('점등 이상'); setInspectSymptomCustom('')
                  inspectPhoto.reset(); setInspectExtDetail(null)
                  setInspectBcResult('normal'); setInspectBcMemo(''); inspectBcPhoto.reset()
                  if (planType === 'extinguisher' && selected.check_point_id) {
                    extinguisherApi.getDetail(selected.check_point_id).then(d => setInspectExtDetail(d)).catch(() => {})
                  }
                  setInspectModal(true)
                }
              }}
              onGoToRemediation={(recordId) => { setRevisitPopup(null); navigate('/remediation/' + recordId) }}
            />
          </div>
        </div>
      )}

      {/* ── 인라인 점검 기록 모달 ────────────────────── */}
      {inspectModal && selected && (planType === 'guidelamp' || selected.check_point_id) && (() => {
        const MARKER_TO_GL: Record<string,string> = {
          ceiling_exit:'ceiling_exit', wall_exit:'wall_exit',
          room_corridor:'room_passage', hallway_corridor:'corridor_passage', stair_corridor:'stair_passage',
        }
        const glType = planType === 'guidelamp' ? (MARKER_TO_GL[selected.marker_type ?? ''] ?? '') : ''
        const needSymptom = planType === 'guidelamp' && inspectResult !== 'normal' && glType !== 'audience_passage' && glType !== ''
        // Bug J: 마커 description 에 '접근불가' 포함 시 AccessBlockedPopup 오버레이 노출.
        // InspectionPage InspectionModal 과 동일한 UX. FloorPlanPage 는 단일 마커 기반
        // 이라 확인 = 모달 닫기 (다음 마커 네비게이션 없음).
        const isAccessBlocked = !!selected.description?.includes('접근불가')
        // 접근불가 개소: 폼 렌더링 생략하고 팝업만 표시. plan type 무관하게
        // 일정한 사이즈(유도등 모달 자연 높이 ≈ 290px)로 통일.
        if (isAccessBlocked) {
          return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setInspectModal(false)}>
              <div className="relative w-[90%] max-w-[340px] h-[290px] bg-surface-raised rounded-2xl border border-border-strong" onClick={e => e.stopPropagation()}>
                <AccessBlockedPopup onConfirm={() => { setInspectModal(false); setSelected(null) }} />
              </div>
            </div>
          )
        }
        return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setInspectModal(false)}>
          <div className="relative w-[90%] max-w-[340px] bg-surface-raised rounded-2xl p-5 border border-border-strong max-h-[86vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="text-body-sm font-bold text-text-primary mb-1">점검 기록 입력</div>
            <div className="text-caption text-text-tertiary mb-3.5">
              {selected.cp_location || selected.label || currentMarkerTypes.find(mt => mt.key === selected.marker_type)?.label.join('') || '마커'} · {floor}
            </div>

            {planType === 'extinguisher' && inspectExtDetail && (
              <div className="bg-surface-sunken rounded-[10px] px-3 py-2.5 border border-border-default mb-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-caption">
                  <div><span className="text-text-tertiary">위치 </span><span className="text-text-primary font-semibold">{inspectExtDetail.location || (inspectExtDetail as any).cp_location || selected?.cp_location || '-'}</span></div>
                  <div><span className="text-text-tertiary">제조업체 </span><span className="text-text-primary font-semibold">{inspectExtDetail.manufacturer ?? '-'}</span></div>
                  <div><span className="text-text-tertiary">제조년월 </span><span className="text-text-primary font-semibold">{inspectExtDetail.manufactured_at ?? '-'}</span></div>
                  <div><span className="text-text-tertiary">형식승인 </span><span className="text-text-primary font-semibold">{inspectExtDetail.approval_no ?? '-'}</span></div>
                  <div><span className="text-text-tertiary">접두문자 </span><span className="text-text-primary font-semibold">{inspectExtDetail.prefix_code ?? '-'}</span></div>
                  <div><span className="text-text-tertiary">증지번호 </span><span className="text-text-primary font-semibold">{inspectExtDetail.seal_no ?? '-'}</span></div>
                  <div><span className="text-text-tertiary">제조번호 </span><span className="text-text-primary font-semibold">{inspectExtDetail.serial_no ?? '-'}</span></div>
                  {selected?.check_point_id && <div><span className="text-text-tertiary">ID </span><span className="text-text-primary font-semibold">{selected.check_point_id}</span></div>}
                </div>
              </div>
            )}
            {/* Phase 24: 소화기 정보 수정 + 분리 서브액션 행 */}
            {planType === 'extinguisher' && inspectExtDetail && (
              <div className="flex gap-1.5 mb-3.5">
                <button
                  onClick={() => {
                    setInspectModal(false)
                    navigate(`/extinguishers/${inspectExtDetail.id}`)
                  }}
                  className="flex-1 h-9 rounded-lg bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold leading-none cursor-pointer inline-flex items-center justify-center"
                >정보 수정</button>
                <button
                  onClick={() => {
                    setInspectModal(false)
                    setUnassignConfirm(inspectExtDetail)
                  }}
                  className="flex-1 h-9 rounded-lg bg-danger-bg border border-danger-bar/30 text-danger text-caption font-semibold leading-none cursor-pointer inline-flex items-center justify-center"
                >소화기 분리</button>
              </div>
            )}

            <div className="text-caption font-semibold text-text-tertiary mb-1.5">점검 결과</div>
            <div className="flex gap-1.5 mb-3.5">
              {([
                ['normal', '정상', 'safe'],
                ['caution', '주의', 'warning'],
                ['bad',    '불량', 'danger'],
              ] as const).map(([val, label, tok]) => (
                <button key={val} onClick={() => setInspectResult(val as 'normal' | 'caution' | 'bad')} className={`flex-1 h-11 rounded-[10px] text-body-sm font-bold cursor-pointer inline-flex items-center justify-center ${
                  inspectResult === val
                    ? tok === 'safe'    ? 'bg-safe-bg border-2 border-safe-bar text-safe'
                    : tok === 'warning' ? 'bg-warning-bg border-2 border-warning-bar text-warning'
                    :                    'bg-danger-bg border-2 border-danger-bar text-danger'
                    : 'bg-surface-sunken border border-border-default text-text-tertiary'
                }`}>{label}</button>
              ))}
            </div>

            {needSymptom && (
              <>
                <div className="text-caption font-semibold text-text-tertiary mb-1.5">증상</div>
                <div className="flex gap-[5px] mb-3 flex-wrap">
                  {['점등 이상','예비전원 이상','직접 입력'].map(s => (
                    <button key={s} onClick={() => setInspectSymptomPick(s)} className={`flex-1 min-w-[80px] h-10 rounded-[10px] text-label font-semibold cursor-pointer ${
                      inspectSymptomPick === s
                        ? 'bg-accent border border-accent text-on-accent'
                        : 'bg-surface-sunken border border-border-default text-text-secondary'
                    }`}>{s}</button>
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-between mb-[5px]">
              <label className="text-caption font-semibold text-text-tertiary tracking-[0.05em]">
                {needSymptom && inspectSymptomPick === '직접 입력' ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}
              </label>
              <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
            </div>
            <div className="flex gap-2 items-start mb-3.5">
              <textarea
                value={inspectMemo}
                onChange={e => setInspectMemo(e.target.value)}
                placeholder="특이사항을 입력하세요"
                className="flex-1 h-[72px] px-3 py-2.5 rounded-[10px] bg-surface-sunken border border-border-default text-text-primary text-label resize-none font-[inherit] outline-none box-border"
              />
              <PhotoButton hook={inspectPhoto} label="촬영" noCapture />
            </div>

            {/* paired 비상콘센트 (소화전 마커 + 같은 location_no BC 매핑이 있을 때만 노출) */}
            {pairedBC && (
              <>
                <div className="h-px bg-border-default my-2.5" />
                <div className="bg-surface-sunken rounded-[10px] px-3 py-2 border border-border-default mb-2.5">
                  <div className="text-caption font-bold text-text-tertiary tracking-[0.03em]">{pairedBC.category}</div>
                  <div className="text-label font-bold text-text-primary mt-px">{pairedBC.location}</div>
                  {pairedBC.description && <div className="text-caption text-text-tertiary mt-0.5">{pairedBC.description}</div>}
                </div>
                <div className="mb-2.5">
                  <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-[0.05em]">비상콘센트 점검 결과</div>
                  <div className="flex gap-1.5">
                    {([
                      ['normal', '정상', 'safe'],
                      ['caution', '주의', 'warning'],
                      ['bad',    '불량', 'danger'],
                    ] as const).map(([val, label, tok]) => (
                      <button key={val} onClick={() => setInspectBcResult(val as 'normal' | 'caution' | 'bad')} className={`flex-1 h-11 rounded-[10px] text-body-sm font-bold cursor-pointer inline-flex items-center justify-center ${
                        inspectBcResult === val
                          ? tok === 'safe'    ? 'bg-safe-bg border-2 border-safe-bar text-safe'
                          : tok === 'warning' ? 'bg-warning-bg border-2 border-warning-bar text-warning'
                          :                    'bg-danger-bg border-2 border-danger-bar text-danger'
                          : 'bg-surface-sunken border border-border-default text-text-tertiary'
                      }`}>{label}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-3.5">
                  <div className="flex items-center justify-between mb-[5px]">
                    <label className="text-caption font-semibold text-text-tertiary tracking-[0.05em]">특이사항 (선택)</label>
                    <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <textarea
                      value={inspectBcMemo}
                      onChange={e => setInspectBcMemo(e.target.value)}
                      placeholder="특이사항을 입력하세요"
                      className="flex-1 h-[72px] px-3 py-2.5 rounded-[10px] bg-surface-sunken border border-border-default text-text-primary text-label resize-none font-[inherit] outline-none box-border"
                    />
                    <PhotoButton hook={inspectBcPhoto} label="촬영" noCapture />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button onClick={() => setInspectModal(false)} className="flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">
                취소
              </button>
              <button
                disabled={inspectSubmitting || inspectPhoto.uploading || inspectBcPhoto.uploading || isAccessBlocked}
                onClick={async () => {
                  setInspectSubmitting(true)
                  try {
                    const today = new Date().toISOString().slice(0, 10)
                    let sessions = await inspectionApi.getSessions(today)
                    let sid: string
                    if (sessions.length > 0) sid = sessions[0].id
                    else { const s = await inspectionApi.createSession({ date: today }); sid = s.id }
                    const photoKey = await inspectPhoto.upload()

                    let cpId = selected.check_point_id ?? ''
                    let finalMemo = inspectMemo
                    const extra: any = {}
                    if (planType === 'guidelamp') {
                      // 유도등: 마커 floor+zone 으로 check_point 조회.
                      // zone 불일치 시 (예: B층 마커 zone='common' vs CP zone='basement',
                      // 또는 zone=null 마커) 같은 층의 첫 번째 유도등 CP 로 fallback.
                      const all = await inspectionApi.getCheckpoints(selected.floor)
                      const guideLightCps = (all as any[]).filter(cp => cp.category === '유도등')
                      if (guideLightCps.length === 0) { toast.error('이 층에 유도등 개소가 없습니다'); setInspectSubmitting(false); return }
                      const gl = guideLightCps.find(cp => cp.zone === (selected as any).zone) ?? guideLightCps[0]
                      cpId = gl.id
                      extra.floor_plan_marker_id = selected.id
                      extra.guide_light_type = glType
                      if (needSymptom) {
                        finalMemo = inspectSymptomPick === '직접 입력' ? inspectMemo.trim() : inspectSymptomPick
                      } else {
                        finalMemo = inspectMemo.trim()
                      }
                    }
                    await inspectionApi.submitRecord(sid, {
                      checkpointId: cpId,
                      result: inspectResult,
                      memo: finalMemo || undefined,
                      photoKey: photoKey ?? undefined,
                      ...extra,
                    })
                    // ── paired BC 동시 저장 (소화전 마커일 때만, BC 매핑 있을 때만) ──
                    // SH 저장이 throw 하면 catch 가 잡아서 이 블록은 자동 스킵.
                    // atomic 보장은 out-of-scope (서버 batch endpoint 별도 phase).
                    if (pairedBC) {
                      const bcPhotoKey = await inspectBcPhoto.upload()
                      await inspectionApi.submitRecord(sid, {
                        checkpointId: pairedBC.id,
                        result: inspectBcResult,
                        memo: inspectBcMemo.trim() || undefined,
                        photoKey: bcPhotoKey ?? undefined,
                      })
                    }
                    inspectBcPhoto.reset()
                    setInspectBcResult('normal')
                    setInspectBcMemo('')
                    toast.success('점검 기록 저장됨')
                    setInspectModal(false)
                    setSelected(null)
                    qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] })
                  } catch (e: any) {
                    toast.error(e.message ?? '저장 실패')
                  } finally {
                    setInspectSubmitting(false)
                  }
                }}
                className={`flex-1 h-[42px] rounded-[10px] border-none text-label font-bold ${(inspectSubmitting || inspectPhoto.uploading || inspectBcPhoto.uploading || isAccessBlocked) ? 'bg-border-strong text-text-tertiary cursor-default' : 'bg-accent text-on-accent cursor-pointer'}`}
              >
                {(inspectPhoto.uploading || inspectBcPhoto.uploading) ? '사진 업로드 중...' : inspectSubmitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : '저장'}
              </button>
            </div>
          </div>
        </div>
        )
      })()}

      {/* ── 인라인 조치 모달 ────────────────────── */}
      {/* ── Phase 24: 소화기 분리 확인 모달 ──────────────── */}
      {unassignConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setUnassignConfirm(null)}>
          <div className="w-[90%] max-w-[320px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong" onClick={e => e.stopPropagation()}>
            <div className="text-body-sm font-bold text-text-primary mb-2">소화기 분리</div>
            <div className="text-caption text-text-secondary mb-4 leading-relaxed">
              <strong className="text-text-primary font-semibold">{unassignConfirm.location}</strong>에서 소화기를 분리하면 이 개소는 미배치 상태가 됩니다.
            </div>
            <div className="flex gap-2">
              <button onClick={() => setUnassignConfirm(null)} className="flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">취소</button>
              <button
                disabled={unassignMutation.isPending}
                onClick={() => {
                  if (!unassignConfirm.id) { toast.error('소화기 ID가 없습니다'); return }
                  unassignMutation.mutate(unassignConfirm.id, {
                    onSuccess: () => { setUnassignConfirm(null); setSelected(null) }
                  })
                }}
                className={`flex-1 h-[42px] rounded-[10px] text-label font-bold ${unassignMutation.isPending ? 'bg-border-strong text-text-tertiary cursor-default' : 'bg-danger text-white cursor-pointer'}`}
              >{unassignMutation.isPending ? '처리 중...' : '분리'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase 24: 미배치 마커 안내 모달 (점검 모드) ──── */}
      {emptyMarkerModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setEmptyMarkerModal(null)}>
          <div className="w-[90%] max-w-[320px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong" onClick={e => e.stopPropagation()}>
            <div className="text-body-sm font-bold text-text-primary mb-2">소화기 미배치</div>
            <div className="text-caption text-text-secondary mb-4 leading-relaxed">
              <strong className="text-text-primary font-semibold">{emptyMarkerModal.label || '이 개소'}</strong>에 소화기가 배치되지 않았습니다.<br/>
              소화기 관리 페이지에서 배치할 수 있습니다.
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEmptyMarkerModal(null)} className="flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">닫기</button>
              <button
                onClick={() => {
                  const m = emptyMarkerModal
                  setEmptyMarkerModal(null)
                  const ref = m.check_point_id || m.id
                  navigate(`/extinguishers?fromMarker=${ref}&zone=${(m as any).zone ?? ''}&floor=${m.floor ?? floor}`)
                }}
                className="flex-1 h-[42px] rounded-[10px] bg-accent text-on-accent text-label font-bold cursor-pointer"
              >소화기 배치하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase 24: 소화기 배치 확인 모달 (placing 모드) ── */}
      {placingConfirm && isPlacingMode && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setPlacingConfirm(null)}>
          <div className="w-[90%] max-w-[320px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong" onClick={e => e.stopPropagation()}>
            <div className="text-body-sm font-bold text-text-primary mb-2">소화기 배치</div>
            <div className="text-caption text-text-secondary mb-4 leading-relaxed">
              <strong className="text-text-primary font-semibold">{placingConfirm.label || '이 개소'}</strong>에 소화기를 배치하시겠습니까?
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPlacingConfirm(null)} className="flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">취소</button>
              <button
                disabled={assignMutation.isPending}
                onClick={async () => {
                  const m = placingConfirm
                  if (!placingExtId) { toast.error('소화기 ID가 없습니다'); setPlacingConfirm(null); return }
                  const extIdNum = parseInt(placingExtId, 10)
                  if (isNaN(extIdNum)) { toast.error('소화기 ID가 올바르지 않습니다'); setPlacingConfirm(null); return }
                  // Phase 24: cp_id 가 있으면 기존 assign, 없으면 marker 기반 placeAsset (cp 자동 생성).
                  try {
                    if (m.check_point_id) {
                      await assignMutation.mutateAsync({ extId: extIdNum, cpId: m.check_point_id })
                    } else {
                      await floorPlanMarkerApi.placeAsset(m.id, extIdNum)
                      qc.invalidateQueries({ queryKey: ['extinguishers'], refetchType: 'all' })
                      qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType], refetchType: 'all' })
                      toast.success('소화기 배치 완료')
                    }
                    setPlacingConfirm(null); navigate(-1)
                  } catch (e: any) { toast.error(e?.message ?? '배치 실패') }
                }}
                className={`flex-1 h-[42px] rounded-[10px] text-label font-bold ${assignMutation.isPending ? 'bg-border-strong text-text-tertiary cursor-default' : 'bg-accent text-on-accent cursor-pointer'}`}
              >{assignMutation.isPending ? '처리 중...' : '배치'}</button>
            </div>
          </div>
        </div>
      )}

      {resolveModal && selected?.last_record_id && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setResolveModal(false)}>
          <div className="w-[90%] max-w-[340px] bg-surface-raised rounded-2xl px-5 py-5 border border-border-strong" onClick={e => e.stopPropagation()}>
            <div className="text-body-sm font-bold text-text-primary mb-1">조치 입력</div>
            <div className="text-caption text-text-tertiary mb-2">{selected.label || '마커'} · {floor}</div>
            {selected.last_memo && (
              <div className="bg-warning-bg text-warning border border-warning-bar/30 rounded-xl px-2.5 py-1.5 text-caption mb-3">
                지적: {selected.last_memo}
              </div>
            )}
            {planType === 'guidelamp' ? (
              <>
                {/* 조치 피커 */}
                <div className="flex gap-[5px] mb-2.5">
                  {(['본체 교체','예비전원 교체','직접 입력'] as const).map(opt => (
                    <button key={opt} onClick={() => setResolveActionPick(opt)} className={`flex-1 py-2.5 px-1 rounded-[10px] text-caption font-bold cursor-pointer ${
                      resolveActionPick === opt
                        ? 'bg-accent/10 border-2 border-accent text-accent'
                        : 'bg-surface-sunken border border-border-default text-text-secondary'
                    }`}>{opt}</button>
                  ))}
                </div>

                {/* 직접 입력일 때만 textarea */}
                {resolveActionPick === '직접 입력' && (
                  <textarea
                    value={resolveMemo}
                    onChange={e => setResolveMemo(e.target.value)}
                    placeholder="조치 내용을 입력하세요 (필수)"
                    className="w-full h-[72px] px-3 py-2.5 rounded-[10px] bg-surface-sunken border border-border-strong text-text-primary text-label resize-none font-[inherit] outline-none box-border mb-2.5"
                  />
                )}

                {/* 소모 자재 라벨 */}
                <div className="flex items-center justify-between mb-[5px]">
                  <label className="text-caption font-semibold text-text-tertiary tracking-[0.05em]">소모 자재</label>
                  <span className="text-caption text-text-tertiary">조치 사진 (선택)</span>
                </div>

                {/* 자재명 + 개수 + 사진 — 한 줄 */}
                <div className="flex gap-2 items-start mb-3.5">
                  <div className="flex-1 min-w-0 flex flex-col gap-1 h-[72px]">
                    <input
                      type="text"
                      value={resolveMaterialName}
                      onChange={e => setResolveMaterialName(e.target.value)}
                      placeholder="자재명"
                      className="flex-1 min-h-0 min-w-0 w-full px-2.5 rounded-lg bg-surface-sunken border border-border-strong text-text-primary text-body-sm box-border font-[inherit]"
                    />
                    <div style={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0 }}>
                      <input
                        type="number"
                        min={0}
                        value={resolveMaterialCount}
                        onChange={e => setResolveMaterialCount(e.target.value)}
                        placeholder="0"
                        className="w-full h-full min-w-0 pl-2.5 pr-7 rounded-lg bg-surface-sunken border border-border-strong text-text-primary text-body-sm box-border font-[inherit]"
                      />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} className="text-caption text-text-tertiary">ea</span>
                    </div>
                  </div>
                  <PhotoButton hook={resolvePhoto} label="촬영" noCapture />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-[5px]">
                  <label className="text-caption font-semibold text-text-tertiary tracking-[0.05em]">조치 내용 (필수)</label>
                  <span className="text-caption text-text-tertiary">조치 사진 (선택)</span>
                </div>
                <div className="flex gap-2 items-start mb-3.5">
                  <textarea
                    value={resolveMemo}
                    onChange={e => setResolveMemo(e.target.value)}
                    placeholder="조치 내용을 입력하세요"
                    className="flex-1 h-[72px] px-3 py-2.5 rounded-[10px] bg-surface-sunken border border-border-strong text-text-primary text-label resize-none font-[inherit] outline-none box-border"
                  />
                  <PhotoButton hook={resolvePhoto} label="촬영" noCapture />
                </div>
              </>
            )}
            <div className="flex gap-2">
              <button onClick={() => setResolveModal(false)} className="flex-1 h-[42px] rounded-[10px] bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">
                취소
              </button>
              <button
                disabled={resolveSubmitting || resolvePhoto.uploading}
                onClick={async () => {
                  let finalMemo = ''
                  let materialsString: string | null = null
                  if (planType === 'guidelamp') {
                    finalMemo = resolveActionPick === '직접 입력' ? resolveMemo.trim() : resolveActionPick
                    if (!finalMemo) { toast.error('조치 내용을 입력하세요'); return }
                    materialsString = resolveMaterialName.trim() ? `${resolveMaterialName.trim()} ${resolveMaterialCount || 1}ea` : null
                  } else {
                    finalMemo = resolveMemo.trim()
                    if (!finalMemo) { toast.error('조치 내용을 입력하세요'); return }
                  }
                  setResolveSubmitting(true)
                  try {
                    const photoKey = await resolvePhoto.upload()
                    await api.post(`/inspections/records/${selected.last_record_id}/resolve`, {
                      resolution_memo: finalMemo,
                      resolution_photo_key: photoKey,
                      materials_used: materialsString,
                    })
                    toast.success('조치 완료')
                    setResolveModal(false)
                    setSelected(null)
                    qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] })
                  } catch (e: any) {
                    toast.error(e.message ?? '조치 실패')
                  } finally {
                    setResolveSubmitting(false)
                  }
                }}
                className={`flex-1 h-[42px] rounded-[10px] text-label font-bold ${(resolveSubmitting || resolvePhoto.uploading) ? 'bg-border-strong text-text-tertiary cursor-default' : 'bg-fire text-on-fire cursor-pointer'}`}
              >
                {resolvePhoto.uploading ? '사진 업로드 중...' : resolveSubmitting ? '저장 중...' : '조치 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
