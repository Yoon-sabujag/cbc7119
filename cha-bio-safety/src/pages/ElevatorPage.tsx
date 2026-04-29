import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { PhotoSourceModal } from '../components/PhotoSourceModal'
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { elevatorInspectionApi, elevatorRepairApi } from '../utils/api'
import type { ElevatorNextInspection, ElevatorRepair } from '../types'
import PdfFloorPlan from '../components/PdfFloorPlan'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { fmtKstDate, fmtKstDateTime, nowKstLocal } from '../utils/datetime'
import { KoelsaHistorySection } from '../components/KoelsaHistorySection'
import { fetchInspectHistory } from '../utils/inspectHistory'

const NAV_H = 'calc(54px + env(safe-area-inset-bottom, 20px))'

// ── 타입 ──────────────────────────────────────────────────
interface Elevator {
  id: string
  number: number
  public_number?: number
  type: 'passenger' | 'cargo' | 'dumbwaiter' | 'escalator'
  location: string
  status: 'normal' | 'fault' | 'maintenance' | 'out_of_service'
  active_faults?: number
  last_inspect_date?: string
  // 공단 등록 정보 (0054 마이그레이션)
  cert_no?: string        // 승강기고유번호 (예: 2114-971)
  public_no?: number      // 공단 호기 (1~17)
  classification?: string // 분류 (장애/전망용, 전망용, 승객용, 화물용, 덤웨이터, 에스컬레이터 등)
  service_range?: string  // 설치층수 (예: B5-8, 2-B1(D))
  capacity_person?: number // 탑승인원
  capacity_kg?: number    // 용량 kg
  // 검사성적서 상세 (0055 마이그레이션)
  model_type?: string           // 형식/종류 (권상식/VVVF/장애/전망용 등)
  manufacturer?: string         // 제조업체
  maintenance_company?: string  // 유지관리업체
  machine_location?: string     // 구동기 공간/설치위치
  rated_speed?: string          // 정격속도/공칭속도
  floor_count?: number          // 운행층수
  rope_diameter?: string        // 매다는장치의 지름/두께
  safety_device?: string        // 추락방지안전장치
  rope_count?: number           // 매다는장치의 가닥수
  max_capacity_persons?: number // 최대수용능력 (에스컬레이터)
  incline_angle?: number        // 경사 각도 (에스컬레이터)
  auxiliary_brake?: string      // 보조브레이크 (에스컬레이터)
  operation_mode?: string       // 운전 방식 (에스컬레이터)
}
interface ElevatorFault {
  id: string
  elevator_id: string
  fault_at: string
  symptoms: string
  repair_company?: string
  repaired_at?: string
  repair_detail?: string
  is_resolved: number
  reporter_name: string
  elevator_location: string
  elevator_number: number
  elevator_type: string
  photo_keys?: string                 // JSON string from D1 (e.g. '["abc","def"]')
  repair_photo_keys?: string          // JSON string from D1
}
interface ElevatorInspection {
  id: string
  elevator_id: string
  inspect_date: string
  type: string
  overall: string
  inspect_type?: string
  result?: string
  action_needed?: string
  memo?: string
  certificate_key?: string
  elevator_location: string
  elevator_number: number
  elevator_type: string
  // 0057: 검사성적서 PDF 파싱 데이터
  inspector_name?: string
  inspection_agency?: string
  judgment?: string
  validity_start?: string
  validity_end?: string
  cert_number?: string
  inspection_items?: string  // JSON 문자열
  // 0058: 조치 후 합격 cert 부모 링크
  parent_inspection_id?: string
}
type Tab   = 'list' | 'fault' | 'repair' | 'inspect' | 'annual' | 'safety'
type Modal = null | 'fault_new' | 'fault_resolve' | 'inspect_new' | 'repair_new' | 'ev_detail'
type EvKind = '' | 'elevator' | 'escalator'

// 호기 상세 이력 타입
interface EvDetailHistory {
  id: string
  kind: 'fault' | 'repair' | 'inspect' | 'annual'
  date: string
  floor?: string
  summary: string
  detail?: string
  check_item?: string  // 점검항목 (브레이크/도어 등)
  is_resolved?: number
}
interface FloorStat {
  floor: string
  fault_total: number
  fault_unresolved: number
  action_count: number
}

// ── 호기별 운행 층 ─────────────────────────────────────────
const EV_FLOORS: Record<string, string[]> = {
  'EV-01': ['B5F','B4F','B3F','B2F','B1F','연1F','연2F'],
  'EV-02': ['B5F','B4F','B3F','B2F','B1F','연1F','연2F'],
  'EV-03': ['연1F','연3F','연5F','연6F','연7F','연8F'],
  'EV-04': ['B3F','사3F','사5F','사6F','사7F','사8F'],
  'EV-05': ['B2F','B1F','사1F','사2F','사3F','사5F','사6F','사7F'],
  'EV-06': ['B2F','B1F','사1F','사2F','사3F','사5F','사6F','사7F'],
  'EV-07': ['B2F','M','B1F'],
  'EV-08': ['연3F','연5F','연6F','연7F'],
  'EV-09': ['B2F','B1F','B1F식당','2F하역장','연3F','연5F','연6F','연7F'],
  'EV-10': ['2F하역장','연8F'],
  'EV-11': ['B1F식당','2F하역장'],
}

// ── 에스컬레이터 노선 타입 ────────────────────────────────
interface EsNodeBtn { id:string; label:string; dir:string }
interface EsNode {
  floor?: string        // 층 레이블 (버튼 없는 행)
  isBottom?: boolean    // 최하단 층 (버튼 없음)
  left?: EsNodeBtn      // 버튼 행
  right?: EsNodeBtn
}

// ── 승강기 그룹 ───────────────────────────────────────────
const EV_GROUPS_FAULT = [
  { title:'투명 엘리베이터',   ids:['EV-01','EV-02','EV-03'] },
  { title:'오렌지 엘리베이터', ids:['EV-04','EV-05','EV-06'] },
  { title:'기타 엘리베이터',   ids:['EV-07','EV-08'] },
  { title:'화물 엘리베이터',   ids:['EV-09','EV-10'] },
]
const EV_GROUPS_ANNUAL = [
  { title:'투명 엘리베이터',   ids:['EV-01','EV-02','EV-03'] },
  { title:'오렌지 엘리베이터', ids:['EV-04','EV-05','EV-06'] },
  { title:'기타 엘리베이터',   ids:['EV-07','EV-08'] },
  { title:'화물 엘리베이터',   ids:['EV-09','EV-10'] },
  { title:'덤웨이터',          ids:['EV-11'] },
]

// 고장·점검용 에스컬 노선 (3·4호기 제외)
// 3층→2층: 1,2호기 / 2층→B1층: 5,6호기
const ES_NODES_FAULT: EsNode[] = [
  { floor:'3층' },
  { left:{ id:'ES-05', label:'1호기', dir:'하행' }, right:{ id:'ES-06', label:'2호기', dir:'상행' } },
  { floor:'2층' },
  { left:{ id:'ES-03', label:'5호기', dir:'하행' }, right:{ id:'ES-04', label:'6호기', dir:'상행' } },
  { floor:'B1층', isBottom:true },
]

// 검사용 에스컬 노선 (전체 6대)
// 3층→2층: 1,2호기 / 2층→B1층: 5,6호기 / B1층→M층: 3,4호기
const ES_NODES_ANNUAL: EsNode[] = [
  { floor:'3층' },
  { left:{ id:'ES-05', label:'1호기', dir:'하행' }, right:{ id:'ES-06', label:'2호기', dir:'상행' } },
  { floor:'2층' },
  { left:{ id:'ES-03', label:'5호기', dir:'하행' }, right:{ id:'ES-04', label:'6호기', dir:'상행' } },
  { floor:'B1층' },
  { left:{ id:'ES-01', label:'3호기', dir:'하행' }, right:{ id:'ES-02', label:'4호기', dir:'상행' } },
  { floor:'M층', isBottom:true },
]

// ── 점검 항목 ──────────────────────────────────────────────
const CHECK_ITEMS_EV = [
  { key:'brake',         label:'브레이크' },
  { key:'door',          label:'도어'     },
  { key:'safetyDevice',  label:'안전장치' },
  { key:'lighting',      label:'조명'     },
  { key:'emergencyCall', label:'비상통화' },
]
const CHECK_ITEMS_ES = [
  { key:'brake',         label:'구동체인·스텝' },
  { key:'door',          label:'콤/스커트 가드' },
  { key:'safetyDevice',  label:'안전장치'       },
  { key:'lighting',      label:'조명'           },
  { key:'emergencyCall', label:'비상정지버튼'    },
]

// ── 상수 ──────────────────────────────────────────────────
const TYPE_ICON:  Record<string,string> = { passenger:'🛗', cargo:'📦', dumbwaiter:'🔲', escalator:'↕️' }
const TYPE_LABEL: Record<string,string> = { passenger:'인승용', cargo:'화물용', dumbwaiter:'덤웨이터', escalator:'에스컬레이터' }
const STATUS_STYLE: Record<string,{ label:string; color:string; bg:string }> = {
  normal:         { label:'정상',    color:'var(--safe)',   bg:'rgba(34,197,94,.13)'   },
  fault:          { label:'고장',    color:'var(--danger)', bg:'rgba(239,68,68,.13)'   },
  maintenance:    { label:'점검중',  color:'var(--warn)',   bg:'rgba(245,158,11,.13)'  },
  out_of_service: { label:'운행중지',color:'var(--t3)',     bg:'rgba(110,118,129,.13)' },
}
const OVERALL_STYLE: Record<string,{ label:string; color:string }> = {
  normal:      { label:'이상없음',  color:'var(--safe)'   },
  caution:     { label:'주의',      color:'var(--warn)'   },
  bad:         { label:'불량',      color:'var(--danger)' },
  pass:        { label:'합격',      color:'var(--safe)'   },
  conditional: { label:'조건부합격',color:'var(--warn)'   },
  fail:        { label:'불합격',    color:'var(--danger)' },
}
const INSPECT_TYPE_LABEL: Record<string, string> = {
  regular:  '정기검사',
  special:  '수시검사',
  detailed: '정밀안전검사',
}
const RESULT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pass:        { bg: '#e8f5e9', color: '#2e7d32', label: '합격' },
  conditional: { bg: '#fff3e0', color: '#e65100', label: '조건부합격' },
  fail:        { bg: '#ffebee', color: '#c62828', label: '불합격' },
}
const TKE_TEL = 'tel:18999070'

// ── API ───────────────────────────────────────────────────
function authHeader() {
  return { 'Content-Type':'application/json', Authorization:`Bearer ${useAuthStore.getState().token}` }
}
async function fetchElevators(): Promise<Elevator[]> {
  const res  = await fetch('/api/elevators', { headers:authHeader() })
  const json = await res.json() as { success:boolean; data:Elevator[] }
  return json.data ?? []
}
async function fetchFaults(): Promise<ElevatorFault[]> {
  const res  = await fetch('/api/elevators/faults', { headers:authHeader() })
  const json = await res.json() as { success:boolean; data:ElevatorFault[] }
  return json.data ?? []
}
// ── 공단 자체점검결과 조회 ──
interface KoelsaInspection {
  elevatorNo: string
  summary: {
    inspectDate: string
    startTime: string
    endTime: string
    inspectorName: string
    subInspectorName: string
    companyName: string
    overallResult: string
    confirmDate: string
    registDate: string
  } | null
  resultCounts: { A: number; B: number; C: number; D: number; E: number }
  issues: { titNo: string; itemName: string; itemDetail: string; result: string }[]
  totalItems: number
}
async function fetchKoelsaInspection(elevatorNo: string, yyyymm: string): Promise<KoelsaInspection | null> {
  try {
    const res = await fetch(`/api/elevators/koelsa?elevator_no=${elevatorNo}&yyyymm=${yyyymm}`, { headers: authHeader() })
    const json = await res.json() as any
    if (!json.success || !json.data?.summary) return null
    return json.data as KoelsaInspection
  } catch { return null }
}
async function fetchKoelsaAll(elevators: Elevator[], yyyymm: string): Promise<Map<string, KoelsaInspection>> {
  const map = new Map<string, KoelsaInspection>()
  const promises = elevators
    .filter(ev => ev.cert_no)
    .map(async ev => {
      const no = ev.cert_no!.replace(/-/g, '')
      const data = await fetchKoelsaInspection(no, yyyymm)
      if (data) map.set(ev.id, data)
    })
  await Promise.all(promises)
  return map
}

async function fetchEvHistory(elevatorId: string, from: string, to: string): Promise<EvDetailHistory[]> {
  const res  = await fetch(`/api/elevators/history?elevator_id=${elevatorId}&from=${from}&to=${to}`, { headers:authHeader() })
  const json = await res.json() as { success:boolean; data:EvDetailHistory[] }
  return json.data ?? []
}

function openClipReport(mwEv: any, order: number) {
  const data = JSON.stringify({
    report_name: 'APD015',
    report_file_path: '/welvt/APD015.crf',
    report_param: {
      PARAM1: mwEv.rptInsttCd,
      PARAM2: mwEv.rptRecptDe,
      PARAM3: String(mwEv.rptRecptNo),
      PARAM4: String(order),
      PARAM5: '1',
      PARAM6: '',
    },
    datasource_name: 'KOELSAB',
  })
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = 'https://minwon.koelsa.or.kr:8080/ClipReport4/viewReport'
  form.target = '_blank'
  const input = document.createElement('input')
  input.type = 'hidden'; input.name = 'print_data'; input.value = data
  form.appendChild(input)
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

// ── 메인 ─────────────────────────────────────────────────
export default function ElevatorPage() {
  const qc = useQueryClient()
  const { staff } = useAuthStore()
  const isAdmin = staff?.role === 'admin'
  const isDesktop = useIsDesktop()
  const [tab,           setTab]           = useState<Tab>('list')
  const [modal,         setModal]         = useState<Modal>(null)
  const [selectedEv,    setSelectedEv]    = useState<Elevator | null>(null)
  const [selectedFault, setSelectedFault] = useState<ElevatorFault | null>(null)
  const [expandedInspect, setExpandedInspect] = useState<string | null>(null)
  // expandedAnnual: desktop repair 탭 확장 상태 (네이밍 레거시 — repair 카드 ID key로 사용)
  const [expandedAnnual, setExpandedAnnual] = useState<string | null>(null)
  // 모바일 annual(검사 기록) 탭 — 연도 피커 + 카드별 펼침 상태
  const [mobileAnnualYear, setMobileAnnualYear] = useState<number>(() => new Date().getFullYear())
  const [expandedMobileAnnual, setExpandedMobileAnnual] = useState<Record<string, boolean>>({})
  const [desktopRightTab, setDesktopRightTab] = useState<'fault' | 'repair' | 'inspect' | 'annual' | 'safety'>('fault')
  const [editRepairData, setEditRepairData] = useState<any>(null)

  async function deleteRecord(type: 'fault' | 'inspection', id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    try {
      const endpoint = type === 'fault' ? '/api/elevators/faults' : '/api/elevators/inspections'
      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE', headers: { Authorization:`Bearer ${useAuthStore.getState().token}` } })
      if (!res.ok) throw new Error('삭제 요청 실패')
      qc.invalidateQueries({ queryKey: ['elevator_faults'] })
      qc.invalidateQueries({ queryKey: ['elevator_inspections'] })
      toast.success('삭제 완료')
    } catch {
      toast.error('삭제 실패')
    }
  }

  const { data: elevators   = [] } = useQuery({ queryKey:['elevators'],            queryFn: fetchElevators })
  const { data: faults      = [] } = useQuery({ queryKey:['elevator_faults'],      queryFn: fetchFaults })
  const { data: repairs     = [] } = useQuery({ queryKey:['elevator_repairs_all'], queryFn: () => elevatorRepairApi.list() })

  // 모바일 annual(검사 기록) 탭 — 모든 cert_no 보유 호기의 공단 검사이력을 일괄 조회
  // 각 호기별 staleTime 6h 유지, 상위로 리프트하여 연도 Set 계산에 사용
  const certElevators = useMemo(
    () => elevators.filter(e => e.cert_no).sort((a, b) => {
      // escalator 뒤로, 같은 type이면 number 오름차순
      if (a.type === 'escalator' && b.type !== 'escalator') return 1
      if (a.type !== 'escalator' && b.type === 'escalator') return -1
      return a.number - b.number
    }),
    [elevators],
  )
  const mobileAnnualQueries = useQueries({
    queries: certElevators.map(ev => ({
      queryKey: ['elevator_inspect_history', ev.cert_no] as const,
      queryFn: () => fetchInspectHistory(ev.cert_no!),
      enabled: !!ev.cert_no,
      staleTime: 6 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  })
  // 연도 Set: 모든 호기 검사이력에서 inspect_date(YYYY-MM-DD)의 연도 추출, 내림차순
  const mobileAnnualAvailableYears = useMemo(() => {
    const yset = new Set<number>()
    for (const q of mobileAnnualQueries) {
      const data = q.data
      if (!data) continue
      for (const item of data.history) {
        if (item.inspectDate && item.inspectDate.length >= 4) {
          const y = parseInt(item.inspectDate.slice(0, 4), 10)
          if (!Number.isNaN(y)) yset.add(y)
        }
      }
    }
    return Array.from(yset).sort((a, b) => b - a)
  }, [mobileAnnualQueries])
  // 초기 로드: 데이터 있는 가장 최근 연도로 이동 (현재 연도에 데이터 없으면)
  useEffect(() => {
    if (mobileAnnualAvailableYears.length > 0 && !mobileAnnualAvailableYears.includes(mobileAnnualYear)) {
      setMobileAnnualYear(mobileAnnualAvailableYears[0])
    }
  }, [mobileAnnualAvailableYears])

  // 공단 자체점검결과 조회 (월 선택)
  const now = new Date()
  const [koelsaMonth, setKoelsaMonth] = useState(() => `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}`)

  // 데이터 있는 월 목록
  const koelsaMonthsQuery = useQuery({
    queryKey: ['koelsa_available_months'],
    queryFn: async () => {
      const res = await fetch('/api/elevators/koelsa-months', { headers: authHeader() })
      const json = await res.json() as any
      return json.success ? (json.data as string[]) : []
    },
  })
  const availableMonths = useMemo(() => new Set(koelsaMonthsQuery.data ?? []), [koelsaMonthsQuery.data])

  // 초기 로드 시 가장 최근 데이터 있는 월로 이동
  useEffect(() => {
    if (koelsaMonthsQuery.data && koelsaMonthsQuery.data.length > 0 && !availableMonths.has(koelsaMonth)) {
      setKoelsaMonth(koelsaMonthsQuery.data[0])
    }
  }, [koelsaMonthsQuery.data])

  const koelsaQuery = useQuery({
    queryKey: ['koelsa_inspections', koelsaMonth, elevators.length],
    queryFn: () => fetchKoelsaAll(elevators, koelsaMonth),
    enabled: elevators.length > 0,
    staleTime: 5 * 60_000,
  })
  const koelsaMap = koelsaQuery.data ?? new Map<string, KoelsaInspection>()

  const nextInspQuery = useQuery({
    queryKey: ['elev-next-inspection'],
    queryFn: () => elevatorInspectionApi.getNextInspection(),
  })
  const nextInspMap = useMemo(() => {
    const m = new Map<string, ElevatorNextInspection>()
    nextInspQuery.data?.forEach(ni => m.set(ni.elevatorId, ni))
    return m
  }, [nextInspQuery.data])

  const location = useLocation()
  const navigate  = useNavigate()
  const [detailEv,       setDetailEv]       = useState<Elevator | null>(null)
  const [fromDashboard,  setFromDashboard]  = useState(false)

  // URL 파라미터로 모달 자동 오픈 (대시보드 고장접수 버튼)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const m = params.get('modal')
    if (m === 'fault_new') {
      setModal('fault_new')
      setTab('fault')
      setFromDashboard(true)
    }
  }, [location.search])

  const evMap = Object.fromEntries(elevators.map(e => [e.id, e]))

  const submitFault = useMutation({
    mutationFn: async (body: object) => {
      const res = await fetch('/api/elevators/faults', { method:'POST', headers:authHeader(), body:JSON.stringify(body) })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:['elevators'] })
      qc.invalidateQueries({ queryKey:['elevator_faults'] })
      setModal(null)
      toast.success('고장 접수 완료 — TKE 1899-9070')
      // 대시보드에서 왔으면 고장탭으로 이동
      if (fromDashboard) {
        setFromDashboard(false)
        setTab('fault')
        navigate('/elevator', { replace:true })
      }
    },
    onError: () => toast.error('고장 접수 실패'),
  })
  const resolveFault = useMutation({
    mutationFn: async (body: object) => {
      const res = await fetch('/api/elevators/faults', { method:'PATCH', headers:authHeader(), body:JSON.stringify(body) })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey:['elevators'] }); qc.invalidateQueries({ queryKey:['elevator_faults'] }); setModal(null); toast.success('수리 완료') },
    onError:   () => toast.error('처리 실패'),
  })
  const submitInspect = useMutation({
    mutationFn: async (body: any) => {
      const token = useAuthStore.getState().token
      const res = await fetch('/api/elevators/inspections', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body:JSON.stringify(body),
      })
      const json = await res.json() as any
      if (!res.ok || !json.success) throw new Error(json.error || '저장 실패')
      // 조건부합격/불합격 시 지적사항 자동 생성
      if (body.findings?.length && json.data?.id && body.elevatorId) {
        for (const f of body.findings) {
          await elevatorInspectionApi.createFinding(body.elevatorId, json.data.id, {
            description: f.description,
            location: f.location || undefined,
          })
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey:['elevators'] })
      qc.invalidateQueries({ queryKey:['elevator_inspections'] })
      setModal(null); toast.success('기록 저장 완료')
    },
    onError: (e: any) => toast.error(e?.message || '저장 실패'),
  })

  const unresolvedCount = faults.filter(f => !f.is_resolved).length
  const repairCount = faults.filter(f => f.is_resolved && f.repair_detail).length

  // 안전관리자 정보
  const safetyMgrQuery = useQuery({
    queryKey: ['elevator_safety_manager'],
    queryFn: async () => {
      const res = await fetch('/api/elevators/safety-manager', { headers: authHeader() })
      const json = await res.json() as any
      return json.success ? json.data : null
    },
    staleTime: 30 * 60_000,
  })

  // 공단 공식 검사이력 (데스크톱 annual 탭) — selectedDesktopEv 와 동일한 우선순위로 cert_no 계산
  // (selectedDesktopEv 는 isDesktop 블록 내부에서 계산되므로, React hooks 규칙을 위해 여기서 별도 계산)
  const _desktopEvsSorted = useMemo(
    () => elevators.filter(e => e.type !== 'escalator').sort((a, b) => a.number - b.number),
    [elevators],
  )
  const _desktopEssSorted = useMemo(
    () => elevators.filter(e => e.type === 'escalator').sort((a, b) => a.number - b.number),
    [elevators],
  )
  const desktopCertNo = (detailEv ?? _desktopEvsSorted[0] ?? _desktopEssSorted[0] ?? null)?.cert_no ?? null
  const koelsaHistoryDesktop = useQuery({
    queryKey: ['elevator_inspect_history', desktopCertNo],
    queryFn: () => fetchInspectHistory(desktopCertNo!),
    enabled: !!desktopCertNo && isDesktop && desktopRightTab === 'annual',
    staleTime: 6 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const TABS: { key:Tab; label:string }[] = [
    { key:'list',    label:'목록' },
    { key:'fault',   label:`고장${unresolvedCount > 0 ? ` (${unresolvedCount})` : ''}` },
    { key:'repair',  label:'수리' },
    { key:'inspect', label:'점검 기록' },
    { key:'annual',  label:'검사 기록' },
    { key:'safety',  label:'안전관리자' },
  ]

  // ── 데스크톱: 좌=배치도 / 우=호기별 이력 탭 ─────────────────
  if (isDesktop) {
    const evs = elevators.filter(e => e.type !== 'escalator').sort((a, b) => a.number - b.number)
    const ess = elevators.filter(e => e.type === 'escalator').sort((a, b) => a.number - b.number)
    const evGroups = [
      evs.filter(e => e.number >= 1 && e.number <= 3),
      evs.filter(e => e.number >= 4 && e.number <= 6),
      evs.filter(e => e.number >= 7 && e.number <= 8),
      evs.filter(e => e.number >= 9 && e.number <= 11),
    ].filter(g => g.length > 0)
    const esRow1Left  = ess.filter(e => e.number === 3 || e.number === 4)
    const esRow1Right = ess.filter(e => e.number === 5 || e.number === 6)
    const esRow2      = ess.filter(e => e.number === 1 || e.number === 2)

    const selectedDesktopEv = detailEv ?? evs[0] ?? ess[0] ?? null
    const evFaults      = selectedDesktopEv ? faults.filter(f => f.elevator_id === selectedDesktopEv.id) : []
    // 통합 수리 이력: API가 독립수리+고장수리+검사조치를 합쳐서 반환
    const evRepairs = selectedDesktopEv ? repairs.filter((r: any) => r.elevatorId === selectedDesktopEv.id) : []
    const evKoelsa = selectedDesktopEv ? koelsaMap.get(selectedDesktopEv.id) ?? null : null

    const renderEvCard = (ev: Elevator) => {
      const st = STATUS_STYLE[ev.status] ?? STATUS_STYLE.normal
      const isSel = selectedDesktopEv?.id === ev.id
      return (
        <div
          key={ev.id}
          onClick={() => setDetailEv(ev)}
          style={{
            background: isSel ? 'rgba(59,130,246,.12)' : 'var(--bg2)',
            border: '2px solid ' + (isSel ? 'var(--acl)' : (ev.status === 'fault' ? 'rgba(239,68,68,.3)' : 'var(--bd)')),
            borderRadius: 10, padding: '10px 6px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            width: '100%', height: 130, boxSizing: 'border-box', overflow: 'hidden',
            transition: 'background-color .12s',
          }}
        >
          <div style={{ fontSize: 22, lineHeight: 1 }}>{TYPE_ICON[ev.type]}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{ev.number}호기</div>
          <div style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.25, wordBreak: 'keep-all', maxWidth: '100%' }}>
            {ev.location}
            {ev.type === 'escalator' && ev.public_number != null && (
              <div style={{ marginTop: 2, fontSize: 9, color: 'var(--t3)' }}>공단 {ev.public_number}호기</div>
            )}
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: st.color, background: st.bg, padding: '2px 6px', borderRadius: 12, marginTop: 'auto' }}>{st.label}</span>
          {(ev.active_faults ?? 0) > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--danger)' }}>미해결 {ev.active_faults}</span>}
        </div>
      )
    }

    const RIGHT_TABS: { key:'fault'|'repair'|'inspect'|'annual'|'safety'; label:string; count:number }[] = [
      { key:'fault',   label:'고장 이력', count: evFaults.length },
      { key:'repair',  label:'수리 이력', count: evRepairs.length },
      { key:'inspect', label:'점검 기록', count: evKoelsa ? 1 : 0 },
      { key:'annual',  label:'검사 기록', count: 0 },
      { key:'safety',  label:'안전관리자', count: 0 },
    ]

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 헤더 */}
        <header style={{ flexShrink: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', flex: 1 }}>승강기 관리</span>
          {unresolvedCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'rgba(239,68,68,.13)', border: '1px solid rgba(239,68,68,.25)', padding: '3px 10px', borderRadius: 20 }}>
              미해결 고장 {unresolvedCount}건
            </span>
          )}
          <button onClick={() => { setSelectedEv(selectedDesktopEv); setModal('fault_new') }}
            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#991b1b,#ef4444)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            🚨 고장 접수
          </button>
          <button onClick={() => { setSelectedEv(selectedDesktopEv); setModal('repair_new') }}
            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#854d0e,#eab308)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            🔧 수리 기록
          </button>
        </header>

        {/* 본문: 좌 50% / 우 50% */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── 좌측: 승강기 배치도 ── */}
          <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid var(--bd)', overflowY: 'auto', padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.06em', marginBottom: 10 }}>🛗 엘리베이터</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {evGroups.map((group, gi) => (
                <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 0', minWidth: 0 }}>
                  {group.map(ev => renderEvCard(ev))}
                </div>
              ))}
            </div>

            {ess.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.06em', marginBottom: 10 }}>↕️ 에스컬레이터</div>
                {/* E/V와 동일한 4컬럼 그리드 — 카드 너비 통일 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, rowGap: 8 }}>
                  {/* Row 1: ES 3,4 (col 1-2) | ES 5,6 (col 3-4) */}
                  {esRow1Left[0]  && <div style={{ minWidth: 0 }}>{renderEvCard(esRow1Left[0])}</div>}
                  {esRow1Left[1]  && <div style={{ minWidth: 0 }}>{renderEvCard(esRow1Left[1])}</div>}
                  {esRow1Right[0] && <div style={{ minWidth: 0 }}>{renderEvCard(esRow1Right[0])}</div>}
                  {esRow1Right[1] && <div style={{ minWidth: 0 }}>{renderEvCard(esRow1Right[1])}</div>}
                  {/* Row 2: ES 1,2 (col 1-2) — 빈 col 3,4 */}
                  {esRow2[0] && <div style={{ gridColumn: '1', minWidth: 0 }}>{renderEvCard(esRow2[0])}</div>}
                  {esRow2[1] && <div style={{ gridColumn: '2', minWidth: 0 }}>{renderEvCard(esRow2[1])}</div>}
                </div>
              </>
            )}
          </div>

          {/* ── 우측: 호기별 이력 ── */}
          <div style={{ flex: 1, minWidth: 0, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {selectedDesktopEv ? (
              <>
                {/* 호기 정보 헤더 */}
                <div style={{ flexShrink: 0, padding: '16px 24px 12px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{TYPE_ICON[selectedDesktopEv.type]}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{selectedDesktopEv.number}호기</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>{selectedDesktopEv.location}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: (STATUS_STYLE[selectedDesktopEv.status] ?? STATUS_STYLE.normal).color, background: (STATUS_STYLE[selectedDesktopEv.status] ?? STATUS_STYLE.normal).bg, padding: '4px 10px', borderRadius: 20 }}>
                    {(STATUS_STYLE[selectedDesktopEv.status] ?? STATUS_STYLE.normal).label}
                  </span>
                </div>

                {/* 승강기 정보 (검사성적서 상단 양식) */}
                <div style={{ flexShrink: 0, padding: '12px 24px', borderBottom: '1px solid var(--bd)' }}>
                  <ElevatorInfoCard ev={selectedDesktopEv} />
                </div>

                {/* 탭 버튼 */}
                <div style={{ flexShrink: 0, display: 'flex', gap: 4, padding: '10px 24px 0', borderBottom: '1px solid var(--bd)' }}>
                  {RIGHT_TABS.map(t => (
                    <button key={t.key} onClick={() => setDesktopRightTab(t.key)}
                      style={{
                        padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700,
                        color: desktopRightTab === t.key ? 'var(--acl)' : 'var(--t3)',
                        borderBottom: desktopRightTab === t.key ? '2px solid var(--acl)' : '2px solid transparent',
                        marginBottom: -1,
                      }}>
                      {t.label} {t.count > 0 && <span style={{ fontSize:10, opacity:0.7 }}>({t.count})</span>}
                    </button>
                  ))}
                </div>

                {/* 탭 콘텐츠 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>

                  {desktopRightTab === 'fault' && (
                    evFaults.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)', fontSize: 13 }}>고장 이력이 없습니다</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {evFaults.map(f => {
                          const pure = f.symptoms.replace(/^\[[^\]]+\]\s*/, '').replace(/\[승객탑승\]\s*/, '')
                          const floorMatch = f.symptoms.match(/^\[([^\]]+)\]/)
                          return (
                            <div key={f.id} style={{ background:'var(--bg2)', border: `1px solid ${f.is_resolved ? 'var(--bd)' : 'rgba(239,68,68,.3)'}`, borderRadius: 10, padding: '10px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{pure}</span>
                                {floorMatch && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--info)', background: 'rgba(14,165,233,.12)', padding: '2px 6px', borderRadius: 6 }}>{floorMatch[1]}</span>}
                                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: f.is_resolved ? 'var(--safe)' : 'var(--danger)' }}>
                                  {f.is_resolved ? '✅ 수리완료' : '🚨 미해결'}
                                </span>
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--t3)' }}>{fmtKstDateTime(f.fault_at)} · {f.reporter_name}</div>
                              {!f.is_resolved && (
                                <button onClick={() => { setSelectedFault(f); setModal('fault_resolve') }}
                                  style={{ marginTop: 6, padding: '5px 10px', borderRadius: 7, border: '1px solid var(--safe)', background: 'rgba(34,197,94,.1)', color: 'var(--safe)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                                  수리 입력
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  )}

                  {desktopRightTab === 'repair' && (
                    evRepairs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)', fontSize: 13 }}>수리 이력이 없습니다</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {evRepairs.map((r: any) => {
                          const isExp = expandedAnnual === `repair-${r.id}`
                          const hasPhotos = r.partsArrivalPhotos || r.damagedPartsPhotos || r.duringRepairPhotos || r.completedPhotos
                          const hasDetail = (r.detail && r.detail !== r.title) || hasPhotos
                          const renderPhotoRow = (label: string, csv: string | null) => {
                            if (!csv) return null
                            const keys = csv.split(',').filter(Boolean)
                            if (!keys.length) return null
                            return (
                              <div style={{ marginTop:6 }}>
                                <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', marginBottom:3 }}>{label} ({keys.length})</div>
                                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                                  {keys.map((k: string) => <img key={k} src={`/api/uploads/${k}`} style={{ width:64, height:64, objectFit:'cover', borderRadius:6, border:'1px solid var(--bd)' }} />)}
                                </div>
                              </div>
                            )
                          }
                          return (
                          <div key={r.id} style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 10, overflow:'hidden' }}>
                            <div onClick={() => hasDetail && setExpandedAnnual(isExp ? null : `repair-${r.id}`)} style={{ padding: '10px 14px', display:'flex', gap:12, cursor: hasDetail ? 'pointer' : 'default' }}>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{r.title}</span>
                                  {r.sourceType === 'fault' && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--warn)', background: 'rgba(245,158,11,.12)', padding: '1px 6px', borderRadius: 4 }}>고장수리</span>}
                                  {r.isInspectionAction && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--info)', background: 'rgba(59,130,246,.12)', padding: '1px 6px', borderRadius: 4 }}>검사조치</span>}
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                                  {r.hallFloor && `${r.hallFloor} `}
                                  {r.target && `${REPAIR_TARGET_LABEL[r.target] ?? r.target} `}
                                  {r.company && `· ${r.company}`}
                                </div>
                              </div>
                              <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                                <span style={{ fontSize: 10, color: 'var(--t3)' }}>{r.date}</span>
                                {r.sourceType === 'standalone' && (
                                  <div style={{ display:'flex', gap:4 }}>
                                    <button onClick={(e) => { e.stopPropagation(); setEditRepairData(r) }}
                                      style={{ padding:'3px 8px', borderRadius:5, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', color:'var(--info)', fontSize:9, fontWeight:600, cursor:'pointer' }}>수정</button>
                                    <button onClick={async (e) => {
                                      e.stopPropagation()
                                      if (!confirm('삭제하시겠습니까?')) return
                                      try {
                                        await elevatorRepairApi.delete(r.sourceId)
                                        qc.invalidateQueries({ queryKey: ['elevator_repairs_all'] })
                                        toast.success('삭제 완료')
                                      } catch { toast.error('삭제 실패') }
                                    }}
                                      style={{ padding:'3px 8px', borderRadius:5, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--danger)', fontSize:9, fontWeight:600, cursor:'pointer' }}>삭제</button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {isExp && (
                              <div style={{ padding:'0 14px 12px', borderTop:'1px solid var(--bd)' }}>
                                {r.detail && r.detail !== r.title && (
                                  <div style={{ paddingTop:10, fontSize:12, color:'var(--t2)', lineHeight:1.5, whiteSpace:'pre-wrap' }}>{r.detail}</div>
                                )}
                                {renderPhotoRow('부품 입고', r.partsArrivalPhotos)}
                                {renderPhotoRow('파손 부품', r.damagedPartsPhotos)}
                                {renderPhotoRow('수리 중', r.duringRepairPhotos)}
                                {renderPhotoRow('수리 완료', r.completedPhotos)}
                              </div>
                            )}
                          </div>
                          )
                        })}
                      </div>
                    )
                  )}

                  {desktopRightTab === 'inspect' && (() => {
                    const fmtDate = (d: string) => d ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : '-'
                    const sortedMonths = [...availableMonths].sort()
                    const curIdx = sortedMonths.indexOf(koelsaMonth)
                    const hasPrev = curIdx > 0
                    const hasNext = curIdx < sortedMonths.length - 1
                    const goPrev = () => { if (hasPrev) setKoelsaMonth(sortedMonths[curIdx - 1]) }
                    const goNext = () => { if (hasNext) setKoelsaMonth(sortedMonths[curIdx + 1]) }
                    return (
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {/* 월 선택 — 데이터 있는 월만 이동 */}
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <button onClick={goPrev} disabled={!hasPrev} style={{ width:28, height:28, borderRadius:6, background:'var(--bg2)', border:'1px solid var(--bd)', cursor: hasPrev ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color: hasPrev ? 'var(--t2)' : 'var(--bd)', opacity: hasPrev ? 1 : 0.4 }}>‹</button>
                          <span style={{ flex:1, textAlign:'center', fontSize:13, fontWeight:700, color:'var(--t1)' }}>{koelsaMonth.slice(0,4)}년 {parseInt(koelsaMonth.slice(4))}월</span>
                          <button onClick={goNext} disabled={!hasNext} style={{ width:28, height:28, borderRadius:6, background:'var(--bg2)', border:'1px solid var(--bd)', cursor: hasNext ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color: hasNext ? 'var(--t2)' : 'var(--bd)', opacity: hasNext ? 1 : 0.4 }}>›</button>
                        </div>
                        {koelsaQuery.isLoading && <div style={{ textAlign:'center', padding:'30px 0', color:'var(--t3)', fontSize:13 }}>공단 데이터 조회 중...</div>}
                        {!koelsaQuery.isLoading && !evKoelsa && <div style={{ textAlign:'center', padding:'30px 0', color:'var(--t3)', fontSize:13 }}>해당 월 점검 기록이 없습니다</div>}
                        {/* 요약 */}
                        {evKoelsa && evKoelsa.summary && (() => {
                          const s = evKoelsa.summary!
                          return (
                            <>
                              <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:10, padding:'10px 14px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                                  <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{fmtDate(s.inspectDate)}</span>
                                  <span style={{ fontSize:10, fontWeight:700, color: evKoelsa.issues.length > 0 ? 'var(--warn)' : 'var(--safe)', background: evKoelsa.issues.length > 0 ? 'rgba(245,158,11,.12)' : 'rgba(34,197,94,.12)', padding:'1px 6px', borderRadius:6 }}>{evKoelsa.issues.length > 0 ? '이상' : '양호'}</span>
                                </div>
                                <div style={{ fontSize:11, color:'var(--t2)' }}>{s.companyName} · 점검자 {s.inspectorName}</div>
                                <div style={{ display:'flex', gap:6, marginTop:6, fontSize:10 }}>
                                  {(['A','B','C','D','E'] as const).map(r => {
                                    const cnt = evKoelsa.resultCounts[r]; if (!cnt) return null
                                    const colors: Record<string,string> = { A:'var(--safe)', B:'var(--warn)', C:'var(--danger)', D:'var(--t3)', E:'var(--t3)' }
                                    const labels: Record<string,string> = { A:'양호', B:'주의', C:'긴급', D:'제외', E:'없음' }
                                    return <span key={r} style={{ fontWeight:700, color:colors[r], background:`${colors[r]}18`, padding:'2px 6px', borderRadius:4 }}>{labels[r]} {cnt}</span>
                                  })}
                                </div>
                              </div>
                              {/* 이상 항목 — 그리드 */}
                              {evKoelsa.issues.length > 0 && (
                                <div style={{ border:'1px solid var(--bd)', borderRadius:8, overflow:'hidden' }}>
                                  <div style={{ padding:'6px 10px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', fontSize:10.5, fontWeight:700, color:'var(--warn)' }}>
                                    ⚠️ 주의관찰 항목
                                  </div>
                                  <div style={{ display:'grid', gridTemplateColumns:'50px 1fr auto', background:'var(--bg3)' }}>
                                    {evKoelsa.issues.map((issue, idx) => {
                                      const isLast = idx === evKoelsa.issues.length - 1
                                      const cellSt: React.CSSProperties = { padding:'5px 8px', fontSize:11, borderBottom: isLast ? 'none' : '1px solid var(--bd)' }
                                      const resultColor = issue.result === 'C' ? 'var(--danger)' : 'var(--warn)'
                                      const resultLabel = issue.result === 'C' ? '긴급수리' : '주의관찰'
                                      return (
                                        <div key={idx} style={{ display:'contents' }}>
                                          <div style={{ ...cellSt, color:'var(--t3)', fontWeight:600, fontFamily:'JetBrains Mono, monospace', fontSize:10 }}>{issue.titNo}</div>
                                          <div style={{ ...cellSt, color:'var(--t1)' }}>
                                            {issue.itemName}
                                            {issue.itemDetail && <span style={{ color:'var(--t3)', marginLeft:4, fontSize:10 }}>({issue.itemDetail})</span>}
                                          </div>
                                          <div style={{ ...cellSt, color:resultColor, fontWeight:700 }}>{resultLabel}</div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    )
                  })()}

                  {desktopRightTab === 'annual' && (
                    <KoelsaHistorySection
                      certNo={selectedDesktopEv?.cert_no}
                      data={koelsaHistoryDesktop.data}
                      isLoading={koelsaHistoryDesktop.isLoading}
                      isError={koelsaHistoryDesktop.isError}
                    />
                  )}
                  {desktopRightTab === 'safety' && (() => {
                    const data = safetyMgrQuery.data
                    if (safetyMgrQuery.isLoading) return <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t3)', fontSize:13 }}>공단 데이터 조회 중...</div>
                    if (!data?.manager) return <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t3)', fontSize:13 }}>안전관리자 정보가 없습니다</div>

                    const m = data.manager
                    const edu = data.education
                    const reg = data.registration

                    const fmtDday = (days: number | null) => {
                      if (days === null) return null
                      if (days < 0) return { text: `D+${Math.abs(days)} 초과`, color: 'var(--danger)', bg: 'rgba(239,68,68,.12)' }
                      if (days <= 60) return { text: `D-${days}`, color: 'var(--warn)', bg: 'rgba(245,158,11,.12)' }
                      if (days <= 365) return { text: `D-${days}`, color: 'var(--info)', bg: 'rgba(59,130,246,.12)' }
                      return { text: `D-${days}`, color: 'var(--safe)', bg: 'rgba(34,197,94,.12)' }
                    }
                    const refreshDday = fmtDday(edu.refreshEdu.daysLeft)

                    return (
                      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {/* 안전관리자 프로필 */}
                        <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:10, padding:'14px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                            <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>👤</div>
                            <div>
                              <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>{m.realName ?? m.maskedName}</div>
                              <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>승강기 안전관리자</div>
                            </div>
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12 }}>
                            <div style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 10px' }}>
                              <div style={{ color:'var(--t3)', fontSize:10, marginBottom:2 }}>선임일</div>
                              <div style={{ fontWeight:700, color:'var(--t1)' }}>{m.appointedAt}</div>
                            </div>
                            <div style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 10px' }}>
                              <div style={{ color:'var(--t3)', fontSize:10, marginBottom:2 }}>교육이수일</div>
                              <div style={{ fontWeight:700, color:'var(--t1)' }}>{m.eduDate}</div>
                            </div>
                          </div>
                        </div>

                        {/* 교육 현황 */}
                        <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:10, padding:'14px 16px' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)', marginBottom:10 }}>📚 교육 현황</div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                            <div style={{ background:'var(--bg3)', borderRadius:8, padding:'10px 12px' }}>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                                <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>보수(재) 교육</span>
                                {refreshDday && <span style={{ fontSize:10, fontWeight:700, color:refreshDday.color, background:refreshDday.bg, padding:'2px 6px', borderRadius:6 }}>{refreshDday.text}</span>}
                              </div>
                              <div style={{ fontSize:11, color:'var(--t3)' }}>유효: {m.eduValidFrom} ~ {m.eduValidTo}</div>
                              <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>마감: {edu.refreshEdu.deadline ?? '-'}</div>
                            </div>
                            <div style={{ background:'var(--bg3)', borderRadius:8, padding:'10px 12px' }}>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                                <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>신규 교육</span>
                                {edu.newEdu.daysLeft !== null && edu.newEdu.daysLeft < 0 ? (
                                  <span style={{ fontSize:10, fontWeight:700, color:'var(--safe)', background:'rgba(34,197,94,.12)', padding:'2px 6px', borderRadius:6 }}>완료</span>
                                ) : edu.newEdu.daysLeft !== null ? (
                                  <span style={{ fontSize:10, fontWeight:700, color:'var(--warn)', background:'rgba(245,158,11,.12)', padding:'2px 6px', borderRadius:6 }}>D-{edu.newEdu.daysLeft}</span>
                                ) : null}
                              </div>
                              <div style={{ fontSize:10, color:'var(--t3)' }}>마감: {edu.newEdu.deadline ?? '-'} (선임일+3월)</div>
                            </div>
                          </div>
                        </div>

                        {/* 등록 현황 */}
                        <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:10, padding:'14px 16px' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)', marginBottom:8 }}>🏢 공단 등록 현황</div>
                          <div style={{ fontSize:12, color:'var(--t2)', marginBottom:10 }}>
                            {reg.total}대 중 <span style={{ fontWeight:700, color:'var(--safe)' }}>{reg.registered}대</span> 등록
                            {reg.total - reg.registered > 0 && <span style={{ color:'var(--warn)', marginLeft:6 }}>· 미등록 {reg.total - reg.registered}대</span>}
                          </div>
                          {(() => {
                            const evMap = new Map(elevators.map(e => [e.id, e]))
                            const chip = (evId: string | undefined) => {
                              if (!evId) return <div />
                              const ev = evMap.get(evId)
                              if (!ev) return <div />
                              const isReg = reg.registeredIds.includes(evId)
                              const icon = ev.type === 'escalator' ? 'ES' : 'EV'
                              return <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:6, background: isReg ? 'rgba(34,197,94,.12)' : 'rgba(245,158,11,.12)', color: isReg ? 'var(--safe)' : 'var(--warn)', textAlign:'center', display:'block' }}>{icon}{ev.number} {isReg ? '✓' : '✗'}</span>
                            }
                            const find = (type: string, num: number) => elevators.find(e => (type === 'ev' ? e.type !== 'escalator' : e.type === 'escalator') && e.number === num)?.id
                            // 고정 배치 7열: EV 4열 + sep + ES 2열
                            const grid = [
                              [find('ev',1), find('ev',4), find('ev',7), find('ev',9), null, find('es',5), find('es',6)],
                              [find('ev',2), find('ev',5), find('ev',8), find('ev',10), null, find('es',3), find('es',4)],
                              [find('ev',3), find('ev',6), undefined,    find('ev',11), null, find('es',1), find('es',2)],
                            ]
                            return (
                              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr) 8px repeat(2, 1fr)', gap:4, alignItems:'center' }}>
                                <div style={{ gridColumn:'1/5', fontSize:9, fontWeight:700, color:'var(--t3)', letterSpacing:'.04em' }}>🛗 엘리베이터</div>
                                <div />
                                <div style={{ gridColumn:'6/8', fontSize:9, fontWeight:700, color:'var(--t3)', letterSpacing:'.04em' }}>↕️ 에스컬레이터</div>
                                {grid.map((row, ri) => row.map((id, ci) => {
                                  if (id === null) return <div key={`${ri}-sep`} />
                                  return <div key={`${ri}-${ci}`}>{chip(id)}</div>
                                }))}
                              </div>
                            )
                          })()}
                        </div>

                      </div>
                    )
                  })()}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>
                좌측에서 호기를 선택하세요
              </div>
            )}
          </div>
        </div>

        {/* 모달 */}
        {modal === 'fault_new' && (
          fromDashboard
            ? <FaultNewFullscreen elevators={elevators} onClose={() => { setModal(null); setFromDashboard(false); navigate('/elevator', { replace:true }) }} onSubmit={b => submitFault.mutate(b)} loading={submitFault.isPending} />
            : <FaultNewModal elevators={elevators} selected={selectedEv} onClose={() => setModal(null)} onSubmit={b => submitFault.mutate(b)} loading={submitFault.isPending} />
        )}
        {modal === 'fault_resolve' && <FaultResolveModal fault={selectedFault!} onClose={() => setModal(null)} onSubmit={b => resolveFault.mutate(b)} loading={resolveFault.isPending} />}
        {modal === 'repair_new' && <RepairNewModal elevators={elevators} selected={selectedEv} onClose={() => setModal(null)} />}
        {modal === 'ev_detail' && detailEv && <EvDetailModal ev={detailEv} onClose={() => { setModal(null); setDetailEv(null) }} />}
        {editRepairData && <RepairNewModal elevators={elevators} selected={null} onClose={() => setEditRepairData(null)} editData={editRepairData} />}
      </div>
    )
  }

  // ── 모바일 ─────────────────────────────────────────────────
  return (
    <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* 헤더 */}
      <header style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'8px 12px 8px' }}>
        {unresolvedCount > 0 && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:6 }}>
            <span style={{ fontSize:10, fontWeight:700, color:'var(--danger)', background:'rgba(239,68,68,.13)', border:'1px solid rgba(239,68,68,.25)', padding:'2px 8px', borderRadius:20 }}>
              미해결 {unresolvedCount}건
            </span>
          </div>
        )}
        <div style={{ display:'flex', gap:5, overflowX:'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer',
              fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0,
              background: tab === t.key ? 'var(--acl)' : 'var(--bg3)',
              color:      tab === t.key ? '#fff'       : 'var(--t3)',
            }}>{t.label}</button>
          ))}
        </div>
      </header>

      {/* 본문 */}
      <main style={{ flex:1, minHeight:0, overflowY:'auto', padding:'10px 12px', paddingBottom:'calc(80px + var(--sab, 0px))', display:'flex', flexDirection:'column', gap:8 }}>

        {/* ── 목록 ── */}
        {tab === 'list' && (
          <>
            {(['passenger','cargo','dumbwaiter','escalator'] as const).map(type => {
              const group = elevators.filter(e => e.type === type)
              if (!group.length) return null
              return (
                <div key={type}>
                  <div style={{ fontSize:9, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:5, marginTop:4 }}>
                    {TYPE_ICON[type]} {TYPE_LABEL[type]} ({group.length}대)
                  </div>
                  {group.map(ev => {
                    const st = STATUS_STYLE[ev.status] ?? STATUS_STYLE.normal
                    const ni = nextInspMap.get(ev.id)
                    return (
                      <div key={ev.id}
                        onClick={() => { setDetailEv(ev); setModal('ev_detail') }}
                        style={{ background:'var(--bg2)', border:`1px solid ${ev.status==='fault'?'rgba(239,68,68,.3)':'var(--bd)'}`, borderRadius:12, padding:'10px 13px', display:'flex', alignItems:'center', gap:10, marginBottom:6, cursor:'pointer' }}
                      >
                        <div style={{ width:40, height:40, borderRadius:10, background:ev.status==='fault'?'rgba(239,68,68,.15)':'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                          {TYPE_ICON[type]}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>
                            {ev.number}호기
                            <span style={{ fontSize:10, fontWeight:400, color:'var(--t3)', marginLeft:6 }}>{ev.location}</span>
                            {ev.type === 'escalator' && ev.public_number != null && (
                              <span style={{ fontSize:10, fontWeight:400, color:'var(--t3)', marginLeft:6 }}>(공단 {ev.public_number}호기)</span>
                            )}
                          </div>
                          <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>
                            {ev.last_inspect_date ? `최근 점검: ${ev.last_inspect_date}` : '점검 기록 없음'}
                            {(ev.active_faults ?? 0) > 0 && <span style={{ color:'var(--danger)', marginLeft:6 }}>미해결 {ev.active_faults}건</span>}
                          </div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                          <span style={{ fontSize:10, fontWeight:700, color:st.color, background:st.bg, padding:'3px 8px', borderRadius:20 }}>{st.label}</span>
                          {ni && ni.status === 'due_soon' && ni.daysUntil != null && (
                            <span style={{ background:'#fff3e0', color:'#e65100', padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:600 }}>
                              D-{ni.daysUntil}
                            </span>
                          )}
                          {ni && ni.status === 'overdue' && (
                            <span style={{ background:'#ffebee', color:'#c62828', padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:600 }}>
                              검사 초과
                            </span>
                          )}
                          {ni && ni.status === 'no_record' && (
                            <span style={{ background:'#e3f2fd', color:'#1565c0', padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:600 }}>
                              기록 없음
                            </span>
                          )}
                        </div>
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth={2} style={{ flexShrink:0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </>
        )}

        {/* ── 고장 기록 ── */}
        {tab === 'fault' && (
          <>
            {faults.length === 0 && <EmptyState icon="✅" text="고장 기록이 없어요" />}
            {faults.map(f => {
              const isEs = f.elevator_type === 'escalator'
              const floorMatch     = f.symptoms.match(/^\[([^\]]+)\]/)
              const passengerMatch = f.symptoms.includes('[승객탑승]')
              const pureSymptoms   = f.symptoms.replace(/^\[[^\]]+\]\s*/, '').replace(/\[승객탑승\]\s*/, '')
              const floorLabel     = floorMatch ? floorMatch[1] : null

              return (
                <div key={f.id} style={{ background:'var(--bg2)', border:`1px solid ${f.is_resolved?'var(--bd)':'rgba(239,68,68,.3)'}`, borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', gap:10, minHeight:72 }}>

                  {/* 아이콘 */}
                  <div style={{ width:52, height:52, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>
                    {TYPE_ICON[f.elevator_type]}
                  </div>

                  {/* 호기+발생층 / 증상 */}
                  <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:3 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>{f.elevator_number}호기</span>
                      {!isEs && floorLabel && (
                        <span style={{ fontSize:11, fontWeight:700, color:'var(--info)', background:'rgba(14,165,233,.12)', padding:'2px 7px', borderRadius:8 }}>{floorLabel}</span>
                      )}
                      {!isEs && passengerMatch && (
                        <span style={{ fontSize:10, fontWeight:700, color:'var(--danger)', background:'rgba(239,68,68,.12)', padding:'2px 6px', borderRadius:8 }}>승객🚨</span>
                      )}
                    </div>
                    <div style={{ fontSize:13, color:'var(--t2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pureSymptoms}</div>
                    <div style={{ fontSize:10, color:'var(--t3)' }}>{fmtKstDateTime(f.fault_at)}</div>
                  </div>

                  {/* 수리내역 or "고장 수리 중" */}
                  <div style={{ flexShrink:0, maxWidth:90, textAlign:'right' }}>
                    {f.is_resolved && f.repair_detail
                      ? <span style={{ fontSize:13, color:'var(--safe)', fontWeight:600, lineHeight:1.4 }}>{f.repair_detail}</span>
                      : <span style={{ fontSize:13, color:'var(--danger)', fontWeight:700 }}>고장 수리 중</span>
                    }
                  </div>

                  {/* 수리완료 버튼(정사각형) or ✅ */}
                  {!f.is_resolved ? (
                    <button
                      onClick={() => { setSelectedFault(f); setModal('fault_resolve') }}
                      style={{ flexShrink:0, width:52, height:52, borderRadius:10, border:'none', cursor:'pointer', background:'rgba(34,197,94,.15)', color:'var(--safe)', fontSize:10, fontWeight:700, whiteSpace:'pre-line', textAlign:'center', lineHeight:1.4 }}
                    >{'수리\n내용\n입력'}</button>
                  ) : (
                    <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ width:52, height:52, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>✅</div>
                      {isAdmin && (
                        <button onClick={() => deleteRecord('fault', f.id)} style={{ fontSize:9, color:'var(--danger)', background:'none', border:'none', cursor:'pointer', fontWeight:600, opacity:0.6 }}>삭제</button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* ── 수리 내역 ── */}
        {tab === 'repair' && (
          <RepairListSection elevators={elevators} navigate={navigate} />
        )}

        {/* ── 점검 기록 (공단 자체점검결과) ── */}
        {tab === 'inspect' && (() => {
          const fmtDate8 = (d: string) => d && d.length === 8 ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : d || '-'
          const sortedMonths = [...availableMonths].sort()
          const curIdx = sortedMonths.indexOf(koelsaMonth)
          const hasPrev = curIdx > 0
          const hasNext = curIdx < sortedMonths.length - 1
          const goPrev = () => { if (hasPrev) setKoelsaMonth(sortedMonths[curIdx - 1]) }
          const goNext = () => { if (hasNext) setKoelsaMonth(sortedMonths[curIdx + 1]) }
          return (
          <>
            {/* 월 선택 — 데이터 있는 월만 이동 */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <button onClick={goPrev} disabled={!hasPrev} style={{ width:32, height:32, borderRadius:8, background:'var(--bg2)', border:'1px solid var(--bd)', cursor: hasPrev ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color: hasPrev ? 'var(--t2)' : 'var(--bd)', opacity: hasPrev ? 1 : 0.4 }}>‹</button>
              <span style={{ flex:1, textAlign:'center', fontSize:14, fontWeight:700, color:'var(--t1)' }}>
                {koelsaMonth.slice(0,4)}년 {parseInt(koelsaMonth.slice(4))}월
              </span>
              <button onClick={goNext} disabled={!hasNext} style={{ width:32, height:32, borderRadius:8, background:'var(--bg2)', border:'1px solid var(--bd)', cursor: hasNext ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color: hasNext ? 'var(--t2)' : 'var(--bd)', opacity: hasNext ? 1 : 0.4 }}>›</button>
            </div>

            {koelsaQuery.isLoading && <div style={{ textAlign:'center', padding:'24px 0', color:'var(--t3)', fontSize:12 }}>공단 데이터 조회 중...</div>}
            {koelsaQuery.isError && <div style={{ textAlign:'center', padding:'24px 0', color:'var(--danger)', fontSize:12 }}>공단 API 조회 실패</div>}

            {!koelsaQuery.isLoading && koelsaMap.size === 0 && !koelsaQuery.isError && (
              <EmptyState icon="📋" text="해당 월 점검 기록이 없어요" />
            )}

            {(['passenger','cargo','dumbwaiter','escalator'] as const).map(type => {
              const group = elevators.filter(e => e.type === type && e.cert_no).sort((a,b) => a.number - b.number)
              if (!group.length) return null
              const fmtDate = (d: string) => d ? `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}` : '-'
              return (
                <div key={type}>
                  <div style={{ fontSize:9, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:5, marginTop:4 }}>
                    {TYPE_ICON[type]} {TYPE_LABEL[type]} ({group.length}대)
                  </div>
                  {group.map(ev => {
                    const data = koelsaMap.get(ev.id)
                    const hasIssues = data ? data.issues.length > 0 : false
                    const badge = !data ? { text:'미점검', color:'var(--t3)', bg:'var(--bg3)' } : hasIssues ? { text:'이상', color:'var(--warn)', bg:'rgba(245,158,11,.12)' } : { text:'양호', color:'var(--safe)', bg:'rgba(34,197,94,.12)' }
                    const isExp = expandedInspect === ev.id
                    return (
                      <div key={ev.id} style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, overflow:'hidden', marginBottom:6, flexShrink:0 }}>
                        <div onClick={() => data && setExpandedInspect(isExp ? null : ev.id)} style={{ padding:'10px 13px', display:'flex', alignItems:'center', gap:10, cursor: data ? 'pointer' : 'default' }}>
                          <div style={{ width:40, height:40, borderRadius:10, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{TYPE_ICON[type]}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{ev.number}호기 <span style={{ fontSize:10, fontWeight:400, color:'var(--t3)', marginLeft:4 }}>{ev.location}</span></div>
                            <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{data ? `점검일: ${fmtDate8(data.summary!.inspectDate)}` : '점검 데이터 없음'}</div>
                          </div>
                          <span style={{ fontSize:10, fontWeight:700, color:badge.color, background:badge.bg, padding:'3px 8px', borderRadius:20, flexShrink:0 }}>{badge.text}</span>
                          {data && <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth={2} style={{ flexShrink:0, transform: isExp ? 'rotate(90deg)' : 'none', transition:'transform .15s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>}
                        </div>
                        {isExp && data && (
                          <div style={{ borderTop:'1px solid var(--bd)', padding:'12px 14px' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px', fontSize:11, marginBottom:8 }}>
                              <div><span style={{ color:'var(--t3)' }}>점검업체 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{data.summary!.companyName}</span></div>
                              <div><span style={{ color:'var(--t3)' }}>점검자 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{data.summary!.inspectorName}</span></div>
                            </div>
                            <div style={{ display:'flex', gap:6, fontSize:10, flexWrap:'wrap', marginBottom: hasIssues ? 10 : 0 }}>
                              {(['A','B','C','D','E'] as const).map(r => {
                                const cnt = data.resultCounts[r]; if (!cnt) return null
                                const c: Record<string,string> = { A:'var(--safe)', B:'var(--warn)', C:'var(--danger)', D:'var(--t3)', E:'var(--t3)' }
                                const l: Record<string,string> = { A:'양호', B:'주의', C:'긴급', D:'제외', E:'없음' }
                                return <span key={r} style={{ fontWeight:700, color:c[r], background:`${c[r]}18`, padding:'2px 8px', borderRadius:6 }}>{l[r]} {cnt}</span>
                              })}
                            </div>
                            {hasIssues && (
                              <div style={{ border:'1px solid var(--bd)', borderRadius:8, overflow:'hidden' }}>
                                <div style={{ padding:'6px 10px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', fontSize:10.5, fontWeight:700, color:'var(--warn)' }}>
                                  ⚠️ 주의관찰 항목
                                </div>
                                <div style={{ display:'grid', gridTemplateColumns:'50px 1fr auto', background:'var(--bg3)' }}>
                                  {data.issues.map((issue, idx) => {
                                    const isLast = idx === data.issues.length - 1
                                    const cellSt: React.CSSProperties = { padding:'5px 8px', fontSize:11, borderBottom: isLast ? 'none' : '1px solid var(--bd)' }
                                    const resultColor = issue.result === 'C' ? 'var(--danger)' : 'var(--warn)'
                                    const resultLabel = issue.result === 'C' ? '긴급수리' : '주의관찰'
                                    return (
                                      <div key={idx} style={{ display:'contents' }}>
                                        <div style={{ ...cellSt, color:'var(--t3)', fontWeight:600, fontFamily:'JetBrains Mono, monospace', fontSize:10 }}>{issue.titNo}</div>
                                        <div style={{ ...cellSt, color:'var(--t1)' }}>
                                          {issue.itemName}
                                          {issue.itemDetail && <span style={{ color:'var(--t3)', marginLeft:4, fontSize:10 }}>({issue.itemDetail})</span>}
                                        </div>
                                        <div style={{ ...cellSt, color:resultColor, fontWeight:700 }}>{resultLabel}</div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </>
          )
        })()}

        {/* ── 검사 기록 (연도 선택 + 호기별 펼침) ── */}
        {tab === 'annual' && (() => {
          // 판정 배지 색상 (KoelsaHistorySection 과 동일 로직)
          const dispColor = (disp: string | null | undefined): string => {
            if (!disp) return 'var(--t3)'
            const s = disp
            const hasBo = s.includes('보완')
            const hasFail = s.includes('불합격')
            const hasCond = s.includes('조건부')
            const hasBoAfterPass = s.includes('보완후합격')
            const hasPass = s.includes('합격')
            if (hasBoAfterPass || hasCond) return 'var(--warn)'
            if (hasBo || hasFail) return 'var(--danger)'
            if (hasPass) return 'var(--safe)'
            return 'var(--t3)'
          }

          // cert_no 없음
          if (certElevators.length === 0) {
            return (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t3)', fontSize:12 }}>
                공단 고유번호가 등록된 호기가 없습니다
              </div>
            )
          }

          const anyLoading = mobileAnnualQueries.some(q => q.isLoading && !q.data)
          const anyError   = mobileAnnualQueries.some(q => q.isError)

          // 연도 피커 — 사용 가능한 연도 내에서 ◀/▶ 이동 (availableYears 는 내림차순)
          const years = mobileAnnualAvailableYears
          const hasAny = years.length > 0
          // 현재 선택 연도가 years 에 없으면 0번(가장 최근)으로 fallback 인덱스 표시
          const curYearIdx = hasAny ? Math.max(0, years.indexOf(mobileAnnualYear)) : -1
          // years 는 내림차순 — "이전 연도(더 오래된)"는 index+1, "다음 연도(더 최근)"는 index-1
          const hasOlder = hasAny && curYearIdx < years.length - 1
          const hasNewer = hasAny && curYearIdx > 0
          const goOlder = () => { if (hasOlder) setMobileAnnualYear(years[curYearIdx + 1]) }
          const goNewer = () => { if (hasNewer) setMobileAnnualYear(years[curYearIdx - 1]) }

          // 선택된 연도에 해당하는 호기별 items 집계
          const yearStr = String(mobileAnnualYear)
          const perElevatorYearItems = certElevators.map((ev, i) => {
            const q = mobileAnnualQueries[i]
            const items = (q.data?.history ?? []).filter(it => it.inspectDate?.slice(0, 4) === yearStr)
            // 최신순 정렬
            items.sort((a, b) => (b.inspectDate ?? '').localeCompare(a.inspectDate ?? ''))
            return { ev, items, isLoading: q.isLoading, isError: q.isError }
          })
          const visible = perElevatorYearItems.filter(r => r.items.length > 0)

          return (
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom: 10 }}>
              {/* 연도 선택 — 점검 기록 탭 월 피커와 동일 스타일, 연 단위 */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <button
                  onClick={goOlder}
                  disabled={!hasOlder}
                  style={{ width:32, height:32, borderRadius:8, background:'var(--bg2)', border:'1px solid var(--bd)', cursor: hasOlder ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color: hasOlder ? 'var(--t2)' : 'var(--bd)', opacity: hasOlder ? 1 : 0.4 }}
                >‹</button>
                <span style={{ flex:1, textAlign:'center', fontSize:14, fontWeight:700, color:'var(--t1)' }}>
                  {mobileAnnualYear}년
                </span>
                <button
                  onClick={goNewer}
                  disabled={!hasNewer}
                  style={{ width:32, height:32, borderRadius:8, background:'var(--bg2)', border:'1px solid var(--bd)', cursor: hasNewer ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color: hasNewer ? 'var(--t2)' : 'var(--bd)', opacity: hasNewer ? 1 : 0.4 }}
                >›</button>
              </div>

              {anyLoading && (
                <div style={{ textAlign:'center', padding:'24px 0', color:'var(--t3)', fontSize:12 }}>공단 검사이력 조회 중...</div>
              )}
              {!anyLoading && anyError && visible.length === 0 && (
                <div style={{ textAlign:'center', padding:'24px 0', color:'var(--danger)', fontSize:12 }}>공단 API 일시 오류 — 잠시 후 다시 시도해주세요</div>
              )}
              {!anyLoading && !hasAny && !anyError && (
                <EmptyState icon="🔍" text="등록된 검사 이력이 없어요" />
              )}
              {!anyLoading && hasAny && visible.length === 0 && (
                <EmptyState icon="📋" text="해당 연도에 검사 이력이 없어요" />
              )}

              {/* 호기 카드 리스트 — 선택 연도에 이력 있는 호기만 */}
              {visible.map(({ ev, items }) => {
                const prefix = ev.type === 'escalator' ? 'ES' : 'EV'
                const numStr = String(ev.number).padStart(2, '0')
                const evKey = ev.id
                const isExp = !!expandedMobileAnnual[evKey]
                // 최신 판정 (items 는 이미 최신순 정렬됨)
                const latest = items[0]
                const badge = dispColor(latest?.dispWords)
                return (
                  <div key={evKey} style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                    {/* 카드 헤더 */}
                    <div
                      onClick={() => setExpandedMobileAnnual(p => ({ ...p, [evKey]: !p[evKey] }))}
                      style={{ padding:'10px 13px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
                    >
                      <div style={{ width:40, height:40, borderRadius:10, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{TYPE_ICON[ev.type]}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>
                          {prefix}-{numStr}
                          {ev.classification && (
                            <span style={{ fontSize:10, fontWeight:400, color:'var(--t3)', marginLeft:4 }}>· {ev.classification}</span>
                          )}
                        </div>
                        <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{items.length}건 · 최근 {latest.inspectDate ?? '-'}</div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, color:badge, background:`${badge}22`, padding:'3px 8px', borderRadius:20, flexShrink:0 }}>
                        {latest?.dispWords ?? '-'}
                      </span>
                      <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth={2} style={{ flexShrink:0, transform: isExp ? 'rotate(90deg)' : 'none', transition:'transform .15s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </div>
                    {/* 펼침 시 해당 연도 이력 상세 */}
                    {isExp && (
                      <div style={{ borderTop:'1px solid var(--bd)', padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
                        {items.map(item => {
                          const itemBadge = dispColor(item.dispWords)
                          const hasFails = item.fails.length > 0
                          return (
                            <div key={item.failCd} style={{ background:'var(--bg3)', border:'1px solid var(--bd)', borderRadius:10, padding:'10px 12px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                                <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{item.inspectDate ?? '-'}</span>
                                <span style={{ fontSize:10, color:'var(--t3)' }}>· {item.inspectKind ?? '-'}</span>
                                <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, color:itemBadge, background:`${itemBadge}22`, padding:'2px 8px', borderRadius:12 }}>
                                  {item.dispWords ?? '-'}
                                </span>
                              </div>
                              {(item.validStart || item.validEnd) && (
                                <div style={{ fontSize:11, color:'var(--t2)' }}>
                                  유효기간 {item.validStart ?? '-'} ~ {item.validEnd ?? '-'}
                                </div>
                              )}
                              <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>
                                {[item.inspectInstitution, item.companyName].filter(Boolean).join(' · ') || '기관 정보 없음'}
                              </div>
                              {hasFails && (
                                <div style={{ borderTop:'1px solid var(--bd)', marginTop:8, paddingTop:8 }}>
                                  <div style={{ fontSize:11, fontWeight:700, color:'var(--warn)', marginBottom:6 }}>
                                    부적합 {item.fails.length}건
                                  </div>
                                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                    {item.fails.map((f, idx) => (
                                      <div key={idx} style={{ fontSize:11, color:'var(--t2)', lineHeight:1.5 }}>
                                        <div style={{ fontWeight:700, color:'var(--t1)' }}>
                                          ▸ {[f.standardArticle, f.standardTitle].filter(Boolean).join(' ') || '조항 정보 없음'}
                                        </div>
                                        {f.failDesc && (
                                          <div style={{ marginTop:2, paddingLeft:12 }}>
                                            {f.failDesc}
                                            {f.failDescInspector && (
                                              <span style={{ color:'var(--t3)' }}> ({f.failDescInspector})</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}
        {/* ── 안전관리자 ── */}
        {tab === 'safety' && (() => {
          const data = safetyMgrQuery.data
          if (safetyMgrQuery.isLoading) return <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t3)', fontSize:12 }}>공단 데이터 조회 중...</div>
          if (!data?.manager) return <EmptyState icon="👤" text="안전관리자 정보가 없어요" />

          const m = data.manager
          const edu = data.education
          const reg = data.registration

          const fmtDday = (days: number | null) => {
            if (days === null) return null
            if (days < 0) return { text: `D+${Math.abs(days)} 초과`, color: 'var(--danger)', bg: 'rgba(239,68,68,.12)' }
            if (days <= 60) return { text: `D-${days}`, color: 'var(--warn)', bg: 'rgba(245,158,11,.12)' }
            if (days <= 365) return { text: `D-${days}`, color: 'var(--info)', bg: 'rgba(59,130,246,.12)' }
            return { text: `D-${days}`, color: 'var(--safe)', bg: 'rgba(34,197,94,.12)' }
          }

          const refreshDday = fmtDday(edu.refreshEdu.daysLeft)

          return (
            <>
              {/* 안전관리자 프로필 */}
              <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'16px', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>👤</div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{m.realName ?? m.maskedName}</div>
                    <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>승강기 안전관리자</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:11 }}>
                  <div style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ color:'var(--t3)', marginBottom:2 }}>선임일</div>
                    <div style={{ fontWeight:700, color:'var(--t1)' }}>{m.appointedAt}</div>
                  </div>
                  <div style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ color:'var(--t3)', marginBottom:2 }}>교육이수일</div>
                    <div style={{ fontWeight:700, color:'var(--t1)' }}>{m.eduDate}</div>
                  </div>
                </div>
              </div>

              {/* 교육 현황 */}
              <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'16px', flexShrink:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)', marginBottom:12 }}>📚 교육 현황</div>

                {/* 보수(재) 교육 */}
                <div style={{ background:'var(--bg3)', borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>보수(재) 교육</span>
                    {refreshDday && (
                      <span style={{ fontSize:11, fontWeight:700, color:refreshDday.color, background:refreshDday.bg, padding:'2px 8px', borderRadius:6 }}>{refreshDday.text}</span>
                    )}
                  </div>
                  <div style={{ fontSize:11, color:'var(--t3)' }}>
                    유효기간: {m.eduValidFrom} ~ {m.eduValidTo}
                  </div>
                  <div style={{ fontSize:10, color:'var(--t3)', marginTop:4 }}>
                    다음 교육 마감: {edu.refreshEdu.deadline ?? '-'} (직전 이수일 + 3년)
                  </div>
                </div>

                {/* 신규 교육 (이미 완료된 경우) */}
                <div style={{ background:'var(--bg3)', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>신규 교육</span>
                    {edu.newEdu.daysLeft !== null && edu.newEdu.daysLeft < 0 ? (
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--safe)', background:'rgba(34,197,94,.12)', padding:'2px 8px', borderRadius:6 }}>완료</span>
                    ) : edu.newEdu.daysLeft !== null ? (
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--warn)', background:'rgba(245,158,11,.12)', padding:'2px 8px', borderRadius:6 }}>D-{edu.newEdu.daysLeft}</span>
                    ) : null}
                  </div>
                  <div style={{ fontSize:10, color:'var(--t3)' }}>
                    마감: {edu.newEdu.deadline ?? '-'} (선임일 + 3개월)
                  </div>
                </div>
              </div>

              {/* 등록 현황 */}
              <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'16px', flexShrink:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)', marginBottom:8 }}>🏢 공단 등록 현황</div>
                <div style={{ fontSize:12, color:'var(--t2)', marginBottom:10 }}>
                  {reg.total}대 중 <span style={{ fontWeight:700, color:'var(--safe)' }}>{reg.registered}대</span> 등록
                  {reg.total - reg.registered > 0 && (
                    <span style={{ color:'var(--warn)', marginLeft:6 }}>· 미등록 {reg.total - reg.registered}대</span>
                  )}
                </div>
                {(() => {
                  const evMap = new Map(elevators.map(e => [e.id, e]))
                  const chip = (evId: string | undefined) => {
                    if (!evId) return <div />
                    const ev = evMap.get(evId)
                    if (!ev) return <div />
                    const isReg = reg.registeredIds.includes(evId)
                    const icon = ev.type === 'escalator' ? 'ES' : 'EV'
                    return <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:6, background: isReg ? 'rgba(34,197,94,.12)' : 'rgba(245,158,11,.12)', color: isReg ? 'var(--safe)' : 'var(--warn)', textAlign:'center', display:'block' }}>{icon}{ev.number} {isReg ? '✓' : '✗'}</span>
                  }
                  const find = (type: string, num: number) => elevators.find(e => (type === 'ev' ? e.type !== 'escalator' : e.type === 'escalator') && e.number === num)?.id
                  const grid = [
                    [find('ev',1), find('ev',4), find('ev',7), find('ev',9), null, find('es',5), find('es',6)],
                    [find('ev',2), find('ev',5), find('ev',8), find('ev',10), null, find('es',3), find('es',4)],
                    [find('ev',3), find('ev',6), undefined,    find('ev',11), null, find('es',1), find('es',2)],
                  ]
                  return (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr) 6px repeat(2, 1fr)', gap:4, alignItems:'center' }}>
                      <div style={{ gridColumn:'1/5', fontSize:9, fontWeight:700, color:'var(--t3)', letterSpacing:'.04em' }}>🛗 엘리베이터</div>
                      <div />
                      <div style={{ gridColumn:'6/8', fontSize:9, fontWeight:700, color:'var(--t3)', letterSpacing:'.04em' }}>↕️ 에스컬레이터</div>
                      {grid.map((row, ri) => row.map((id, ci) => {
                        if (id === null) return <div key={`${ri}-sep`} />
                        return <div key={`${ri}-${ci}`}>{chip(id)}</div>
                      }))}
                    </div>
                  )
                })()}
              </div>

            </>
          )
        })()}

      </main>

      {/* ── FAB 버튼 (BottomNav 바로 위, flex 형제) ── */}
      {(tab === 'fault' || tab === 'repair') && (
        <div style={{ flexShrink:0, padding:'8px 12px', background:'var(--bg)' }}>
          {tab === 'fault' && (
            <button onClick={() => { setSelectedEv(null); setModal('fault_new') }}
              style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#991b1b,#ef4444)', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(239,68,68,.4)' }}>
              🚨 고장 접수
            </button>
          )}
          {tab === 'repair' && (
            <button onClick={() => { setSelectedEv(null); setModal('repair_new') }}
              style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#854d0e,#eab308)', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(234,179,8,.4)' }}>
              🔧 수리 기록 입력
            </button>
          )}
        </div>
      )}

      {/* 모달 */}
      {modal === 'fault_new' && (
        fromDashboard
          ? <FaultNewFullscreen
              elevators={elevators}
              onClose={() => { setModal(null); setFromDashboard(false); navigate('/elevator', { replace:true }) }}
              onSubmit={b => submitFault.mutate(b)}
              loading={submitFault.isPending}
            />
          : <FaultNewModal
              elevators={elevators} selected={selectedEv}
              onClose={() => setModal(null)}
              onSubmit={b => submitFault.mutate(b)}
              loading={submitFault.isPending}
            />
      )}
      {modal === 'fault_resolve'&& <FaultResolveModal fault={selectedFault!}                     onClose={() => setModal(null)} onSubmit={b => resolveFault.mutate(b)} loading={resolveFault.isPending} />}
      {modal === 'inspect_new'  && <InspectModal      elevators={elevators} selected={selectedEv} onClose={() => setModal(null)} onSubmit={b => submitInspect.mutate(b)} loading={submitInspect.isPending} />}
      {modal === 'repair_new'  && <RepairNewModal    elevators={elevators} selected={selectedEv} onClose={() => setModal(null)} />}
      {modal === 'ev_detail'    && detailEv && <EvDetailModal ev={detailEv} onClose={() => { setModal(null); setDetailEv(null) }} />}
    </div>
  )
}

// ── 호기 상세 이력 모달 ───────────────────────────────────
const CHECK_ITEM_LABELS: Record<string,string> = {
  brake:'브레이크', door:'도어', safety_device:'안전장치', lighting:'조명', emergency_call:'비상통화'
}
const PERIOD_OPTIONS = [
  { label:'1개월', months:1 },
  { label:'3개월', months:3 },
  { label:'6개월', months:6 },
  { label:'1년',   months:12 },
]
type HistoryTab = 'all' | 'fault' | 'repair' | 'inspect' | 'annual'
const HISTORY_TABS: { key:HistoryTab; label:string }[] = [
  { key:'all',     label:'전체' },
  { key:'fault',   label:'고장' },
  { key:'repair',  label:'수리' },
  { key:'inspect', label:'점검' },
  { key:'annual',  label:'검사' },
]

function EvDetailModal({ ev, onClose }: { ev:Elevator; onClose:()=>void }) {
  const isDesktop = useIsDesktop()
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      window.scrollTo(0, scrollY)
    }
  }, [])
  const [periodIdx,   setPeriodIdx]   = useState(1) // 기본 3개월
  const [checkFilter, setCheckFilter] = useState('all')
  const [histTab,     setHistTab]     = useState<HistoryTab>('all')

  // 기간 계산
  const toDate   = new Date()
  const fromDate = new Date()
  fromDate.setMonth(fromDate.getMonth() - PERIOD_OPTIONS[periodIdx].months)
  const from = fromDate.toISOString().slice(0,10)
  const to   = toDate.toISOString().slice(0,10)

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['ev_history', ev.id, from, to],
    queryFn:  () => fetchEvHistory(ev.id, from, to),
    staleTime: 60_000,
  })

  // 층별 집계
  const floors = EV_FLOORS[ev.id] ?? []
  const floorStats: FloorStat[] = floors.map(floor => {
    const faults   = history.filter(h => h.kind === 'fault'   && h.floor === floor)
    const repairs  = history.filter(h => h.kind === 'repair'  && h.floor === floor)
    const actions  = history.filter(h => h.kind === 'inspect' && h.floor === floor)
    const unresolved = faults.filter(f => !f.is_resolved).length
    return { floor, fault_total: faults.length, fault_unresolved: unresolved, action_count: actions.length }
  }).filter(s => s.fault_total > 0 || s.action_count > 0)

  // 이력 필터링
  const filtered = history.filter(h => {
    const kindOk = histTab === 'all' || h.kind === histTab
    const checkOk = checkFilter === 'all' || h.check_item === checkFilter
    return kindOk && checkOk
  }).sort((a,b) => b.date.localeCompare(a.date))

  const KIND_STYLE: Record<string,{color:string;label:string;icon:string}> = {
    fault:   { color:'var(--danger)', label:'고장',  icon:'🔴' },
    repair:  { color:'var(--safe)',   label:'수리',  icon:'🔧' },
    inspect: { color:'var(--info)',   label:'점검',  icon:'📋' },
    annual:  { color:'var(--warn)',   label:'검사',  icon:'🔍' },
  }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:90 }} />
      <div style={
        isDesktop
          ? { position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex:100, background:'var(--bg2)', borderRadius:14, width:720, maxWidth:'92vw', maxHeight:'88vh', display:'flex', flexDirection:'column', overflowX:'hidden', border:'1px solid var(--bd2)', boxShadow:'0 20px 60px rgba(0,0,0,.5)' }
          : { position:'fixed', bottom:NAV_H, left:0, right:0, zIndex:100, background:'var(--bg2)', borderRadius:'20px 20px 0 0', maxHeight:'calc(100dvh - var(--sat, 44px) - var(--sab, 0px) - 54px)', display:'flex', flexDirection:'column', overflowX:'hidden' }
      }>

        {/* 헤더 */}
        <div style={{ flexShrink:0, padding:'14px 16px 12px', borderBottom:'1px solid var(--bd)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
            {TYPE_ICON[ev.type]}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>{ev.number}호기</div>
            <div style={{ fontSize:10, color:'var(--t3)' }}>{ev.location}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>

        {/* 기간 선택 */}
        <div style={{ flexShrink:0, padding:'10px 16px 8px', borderBottom:'1px solid var(--bd)' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', marginBottom:6 }}>조회 기간</div>
          <div style={{ display:'flex', gap:6 }}>
            {PERIOD_OPTIONS.map((p,i) => (
              <button key={i} onClick={() => setPeriodIdx(i)} style={{
                flex:1, padding:'6px 0', borderRadius:8, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                background: periodIdx===i ? 'var(--acl)' : 'var(--bg3)',
                color:      periodIdx===i ? '#fff'       : 'var(--t3)',
              }}>{p.label}</button>
            ))}
          </div>
          <div style={{ fontSize:10, color:'var(--t3)', marginTop:5, textAlign:'right' }}>{from} ~ {to}</div>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ flex:1, minHeight:0, overflowY:'auto', WebkitOverflowScrolling:'touch', overscrollBehavior:'contain', padding:'12px 16px', display:'flex', flexDirection:'column', gap:14 } as React.CSSProperties}>

          {/* 승강기 정보 (검사성적서 상단 양식) */}
          <ElevatorInfoCard ev={ev} compact={!isDesktop} />

          {isLoading ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'var(--t3)', fontSize:13 }}>불러오는 중...</div>
          ) : (
            <>
              {/* 층별 누적 이력 */}
              {ev.type !== 'escalator' && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', marginBottom:8 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)' }}>층별 누적 이력</div>
                    <div style={{ marginLeft:'auto', display:'flex', gap:8, fontSize:10, color:'var(--t3)' }}>
                      <span>🔴 미해결</span>
                      <span>⚠️ 이력있음</span>
                      <span>✅ 이상없음</span>
                    </div>
                  </div>
                  {floorStats.length === 0 ? (
                    <div style={{ fontSize:12, color:'var(--t3)', padding:'10px 0' }}>해당 기간 이상 없음 ✅</div>
                  ) : (
                    floorStats.map(s => (
                      <div key={s.floor} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:'var(--bg3)', borderRadius:9, marginBottom:5 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)', width:56, flexShrink:0 }}>{s.floor}</span>
                        <div style={{ flex:1, display:'flex', gap:10, flexWrap:'wrap' }}>
                          {s.fault_total > 0 && (
                            <span style={{ fontSize:11, color:'var(--danger)' }}>
                              고장 {s.fault_total}회{s.fault_unresolved > 0 ? ` (미해결 ${s.fault_unresolved})` : ''}
                            </span>
                          )}
                          {s.action_count > 0 && (
                            <span style={{ fontSize:11, color:'var(--warn)' }}>조치지적 {s.action_count}회</span>
                          )}
                        </div>
                        <span style={{ fontSize:16 }}>
                          {s.fault_unresolved > 0 ? '🔴' : s.fault_total > 0 || s.action_count > 0 ? '⚠️' : '✅'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 점검항목 필터 */}
              {ev.type !== 'escalator' && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:8 }}>점검항목 필터</div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {['all','brake','door','safety_device','lighting','emergency_call'].map(k => (
                      <button key={k} onClick={() => setCheckFilter(k)} style={{
                        padding:'5px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                        background: checkFilter===k ? 'var(--acl)' : 'var(--bg3)',
                        color:      checkFilter===k ? '#fff'       : 'var(--t3)',
                      }}>{k==='all' ? '전체' : CHECK_ITEM_LABELS[k]}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* 이력 리스트 */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:8 }}>이력</div>
                {/* 이력 탭 */}
                <div style={{ display:'flex', gap:5, marginBottom:10, overflowX:'auto' }}>
                  {HISTORY_TABS.map(t => (
                    <button key={t.key} onClick={() => setHistTab(t.key)} style={{
                      padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0,
                      background: histTab===t.key ? 'var(--acl)' : 'var(--bg3)',
                      color:      histTab===t.key ? '#fff'       : 'var(--t3)',
                    }}>{t.label}</button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'20px 0', color:'var(--t3)', fontSize:12 }}>해당 이력이 없어요</div>
                ) : (
                  filtered.map(h => {
                    const ks = KIND_STYLE[h.kind] ?? KIND_STYLE.inspect
                    return (
                      <div key={h.id} style={{ padding:'9px 11px', background:'var(--bg3)', borderRadius:10, marginBottom:6, borderLeft:`3px solid ${ks.color}` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                          <span style={{ fontSize:11 }}>{ks.icon}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:ks.color }}>{ks.label}</span>
                          {h.floor && <span style={{ fontSize:10, fontWeight:700, color:'var(--info)', background:'rgba(14,165,233,.12)', padding:'1px 6px', borderRadius:6 }}>{h.floor}</span>}
                          {h.check_item && <span style={{ fontSize:10, color:'var(--t3)', background:'var(--bg4)', padding:'1px 6px', borderRadius:6 }}>{CHECK_ITEM_LABELS[h.check_item] ?? h.check_item}</span>}
                          <span style={{ marginLeft:'auto', fontSize:10, color:'var(--t3)', fontFamily:'JetBrains Mono, monospace' }}>{h.date.slice(0,10)}</span>
                        </div>
                        <div style={{ fontSize:12, color:'var(--t1)', fontWeight:600 }}>{h.summary}</div>
                        {h.detail && <div style={{ fontSize:11, color:'var(--t3)', marginTop:3 }}>{h.detail}</div>}
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── 에스컬 노선도 버튼 ────────────────────────────────────
function EsBtn({ id, label, dir, isDown, selected, onSelect }: {
  id:string; label:string; dir:string; isDown:boolean; selected:boolean; onSelect:(id:string)=>void
}) {
  const color = isDown ? 'var(--danger)' : 'var(--safe)'
  return (
    <button onClick={() => onSelect(id)} style={{
      flex:1, padding:'10px 6px', borderRadius:9, border:'none', cursor:'pointer',
      background: selected ? (isDown?'rgba(239,68,68,.2)':'rgba(34,197,94,.2)') : 'var(--bg2)',
      outline: selected ? `2px solid ${color}` : 'none',
      display:'flex', flexDirection:'column', alignItems:'center', gap:3,
    }}>
      <span style={{ fontSize:13, fontWeight:700, color:selected?color:'var(--t1)' }}>{label}</span>
      <span style={{ fontSize:10, color, fontWeight:600 }}>{isDown?'▼':'▲'} {dir}</span>
    </button>
  )
}

// ── 에스컬 노선도 ─────────────────────────────────────────
function EsNodeMap({ nodes, elevatorId, onSelect }: { nodes:EsNode[]; elevatorId:string; onSelect:(id:string)=>void }) {
  return (
    <div style={{ background:'var(--bg3)', borderRadius:12, padding:'14px 10px', position:'relative' }}>
      <div style={{ position:'absolute', left:'50%', top:20, bottom:20, width:1, background:'var(--bd2)', transform:'translateX(-50%)' }} />
      {nodes.map((node, idx) => (
        <div key={idx}>
          {/* 층 레이블 */}
          {node.floor && (
            <div style={{ textAlign:'center', fontSize:12, fontWeight:700, color:'var(--t2)', marginBottom:8, position:'relative', zIndex:1 }}>
              {node.floor}
            </div>
          )}
          {/* 버튼 행 */}
          {node.left && node.right && (
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <EsBtn id={node.left.id} label={node.left.label} dir={node.left.dir} isDown selected={elevatorId===node.left.id} onSelect={onSelect} />
              <EsBtn id={node.right.id} label={node.right.label} dir={node.right.dir} isDown={false} selected={elevatorId===node.right.id} onSelect={onSelect} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── 호기 선택 공용 컴포넌트 ───────────────────────────────
function EvSelector({ elevators, evKind, setEvKind, elevatorId, setElevatorId, groups, esNodes }: {
  elevators: Elevator[]; evKind: EvKind; setEvKind:(v:EvKind)=>void
  elevatorId: string; setElevatorId:(v:string)=>void
  groups: { title:string; ids:string[] }[]; esNodes: EsNode[]
}) {
  const evList = elevators.filter(e => e.type !== 'escalator')

  return (
    <>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:7 }}>종류 선택</div>
        <div style={{ display:'flex', gap:8 }}>
          {[{ val:'elevator', label:'🛗 엘리베이터' }, { val:'escalator', label:'↕️ 에스컬레이터' }].map(opt => (
            <button key={opt.val} onClick={() => { setEvKind(opt.val as EvKind); setElevatorId('') }} style={{
              flex:1, padding:'12px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
              background: evKind === opt.val ? 'var(--acl)' : 'var(--bg3)',
              color:      evKind === opt.val ? '#fff'       : 'var(--t2)',
            }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {evKind === 'elevator' && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:8 }}>호기 선택</div>
          {groups.map(group => {
            const groupEvs = group.ids.map(id => evList.find(e => e.id === id)).filter(Boolean) as Elevator[]
            if (!groupEvs.length) return null
            return (
              <div key={group.title} style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', marginBottom:6 }}>{group.title}</div>
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${groupEvs.length}, 1fr)`, gap:8 }}>
                  {groupEvs.map(ev => (
                    <button key={ev.id} onClick={() => setElevatorId(ev.id)} style={{
                      padding:'12px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:14, fontWeight:700,
                      background: elevatorId === ev.id ? 'var(--acl)' : ev.status === 'fault' ? 'rgba(239,68,68,.15)' : 'var(--bg3)',
                      color:      elevatorId === ev.id ? '#fff'       : ev.status === 'fault' ? 'var(--danger)'        : 'var(--t1)',
                      outline:    elevatorId === ev.id ? '2px solid var(--acl)' : 'none',
                    }}>
                      {ev.number}호기{ev.status === 'fault' ? ' ⚠️' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {evKind === 'escalator' && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:8 }}>호기 선택</div>
          <EsNodeMap nodes={esNodes} elevatorId={elevatorId} onSelect={setElevatorId} />
        </div>
      )}
    </>
  )
}

// ── 고장 접수 모달 ─────────────────────────────────────────
function FaultNewModal({ elevators, selected, onClose, onSubmit, loading }: {
  elevators:Elevator[]; selected:Elevator|null; onClose:()=>void; onSubmit:(b:any)=>void; loading:boolean
}) {
  const initKind: EvKind = selected ? (selected.type==='escalator'?'escalator':'elevator') : ''
  const [evKind,       setEvKind]       = useState<EvKind>(initKind)
  const [elevatorId,   setElevatorId]   = useState(selected?.id ?? '')
  const [faultAt,      setFaultAt]      = useState(nowKstLocal())
  const [faultFloor,   setFaultFloor]   = useState('')
  const [hasPassenger, setHasPassenger] = useState(false)
  const [symptoms,     setSymptoms]     = useState('')
  const [photoKeys,    setPhotoKeys]    = useState<string[]>([])

  const isElev = evKind === 'elevator'
  const floors = elevatorId ? (EV_FLOORS[elevatorId] ?? []) : []

  const handleSelectEv = (id: string) => {
    setElevatorId(id)
    setFaultAt(nowKstLocal())
    setFaultFloor('')
  }

  const handleSubmit = () => {
    const floorPart = faultFloor ? `[${faultFloor}] ` : ''
    const passPart  = isElev && hasPassenger ? '[승객탑승] ' : ''
    onSubmit({ elevatorId, faultAt:faultAt+':00', symptoms:`${floorPart}${passPart}${symptoms}`, photoKeys, isResolved:false })
  }

  return (
    <ModalWrap title="고장 접수" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <EvSelector
          elevators={elevators} evKind={evKind}
          setEvKind={v => { setEvKind(v); setElevatorId(''); setFaultFloor('') }}
          elevatorId={elevatorId} setElevatorId={handleSelectEv}
          groups={EV_GROUPS_FAULT} esNodes={ES_NODES_FAULT}
        />

        {elevatorId && (
          <>
            <Field label="발생 일시">
              <input type="datetime-local" value={faultAt} onChange={e => setFaultAt(e.target.value)} style={inputSt} />
            </Field>

            {/* 발생층 + 승객탑승 (엘베만) */}
            {isElev && (
              <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                <Field label="발생 층" style={{ flex:1 }}>
                  <select value={faultFloor} onChange={e => setFaultFloor(e.target.value)} style={inputSt}>
                    <option value="">선택</option>
                    {floors.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <div style={{ flexShrink:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:5 }}>승객 탑승</div>
                  <button onClick={() => setHasPassenger(v => !v)} style={{
                    height: 42, padding:'0 16px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                    background: hasPassenger ? 'rgba(239,68,68,.15)' : 'var(--bg3)',
                    color:      hasPassenger ? 'var(--danger)'        : 'var(--t3)',
                    outline:    hasPassenger ? '2px solid var(--danger)' : 'none',
                    whiteSpace:'nowrap',
                  }}>
                    {hasPassenger ? '탑승 🚨' : '미탑승'}
                  </button>
                </div>
              </div>
            )}

            <Field label="증상">
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} placeholder="고장 증상을 입력하세요" style={{ ...inputSt, resize:'none' }} />
            </Field>

            <MultiPhotoUpload label="증상 사진" keys={photoKeys} setKeys={setPhotoKeys} />

            <a href={TKE_TEL} style={{ textDecoration:'none', display:'block' }}>
              <button
                onClick={handleSubmit}
                disabled={!symptoms.trim() || loading}
                style={{ ...primaryBtnSt, opacity:(!symptoms.trim()||loading)?0.5:1, width:'100%' }}
              >
                {loading ? '접수 중...' : '고장 접수 (TKE 자동 연결)'}
              </button>
            </a>
          </>
        )}
      </div>
    </ModalWrap>
  )
}

// ── 고장 접수 전체화면 (대시보드에서 진입) ────────────────
function FaultNewFullscreen({ elevators, onClose, onSubmit, loading }: {
  elevators:Elevator[]; onClose:()=>void; onSubmit:(b:any)=>void; loading:boolean
}) {
  const [evKind,       setEvKind]       = useState<EvKind>('')
  const [elevatorId,   setElevatorId]   = useState('')
  const [faultAt,      setFaultAt]      = useState(nowKstLocal())
  const [faultFloor,   setFaultFloor]   = useState('')
  const [hasPassenger, setHasPassenger] = useState(false)
  const [symptoms,     setSymptoms]     = useState('')
  const [photoKeys,    setPhotoKeys]    = useState<string[]>([])

  const isElev = evKind === 'elevator'
  const floors = elevatorId ? (EV_FLOORS[elevatorId] ?? []) : []

  const handleSelectEv = (id: string) => {
    setElevatorId(id)
    setFaultAt(nowKstLocal())
    setFaultFloor('')
  }
  const handleSubmit = () => {
    const floorPart = faultFloor ? `[${faultFloor}] ` : ''
    const passPart  = isElev && hasPassenger ? '[승객탑승] ' : ''
    onSubmit({ elevatorId, faultAt:faultAt+':00', symptoms:`${floorPart}${passPart}${symptoms}`, photoKeys, isResolved:false })
  }

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:NAV_H, zIndex:100, background:'var(--bg)', display:'flex', flexDirection:'column', paddingTop:'var(--sat, 44px)', boxSizing:'border-box' }}>
      {/* 헤더 */}
      <div style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'14px 16px 12px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:9, background:'rgba(239,68,68,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🚨</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>고장 접수</div>
          <div style={{ fontSize:10, color:'var(--t3)' }}>접수 후 TKE(1899-9070) 자동 연결</div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:18 }}>✕</button>
      </div>

      {/* 본문 스크롤 */}
      <div style={{ flex:1, minHeight:0, overflowY:'auto', overflowX:'hidden', padding:'16px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          <EvSelector
            elevators={elevators} evKind={evKind}
            setEvKind={v => { setEvKind(v); setElevatorId(''); setFaultFloor('') }}
            elevatorId={elevatorId} setElevatorId={handleSelectEv}
            groups={EV_GROUPS_FAULT} esNodes={ES_NODES_FAULT}
          />

          {elevatorId && (
            <>
              <Field label="발생 일시">
                <input type="datetime-local" value={faultAt} onChange={e => setFaultAt(e.target.value)} style={inputSt} />
              </Field>

              {isElev && (
                <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                  <Field label="발생 층" style={{ flex:1 }}>
                    <select value={faultFloor} onChange={e => setFaultFloor(e.target.value)} style={inputSt}>
                      <option value="">선택</option>
                      {floors.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                  <div style={{ flexShrink:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:5 }}>승객 탑승</div>
                    <button onClick={() => setHasPassenger(v => !v)} style={{
                      height:42, padding:'0 16px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                      background: hasPassenger ? 'rgba(239,68,68,.15)' : 'var(--bg3)',
                      color:      hasPassenger ? 'var(--danger)'        : 'var(--t3)',
                      outline:    hasPassenger ? '2px solid var(--danger)' : 'none',
                      whiteSpace:'nowrap',
                    }}>
                      {hasPassenger ? '탑승 🚨' : '미탑승'}
                    </button>
                  </div>
                </div>
              )}

              <Field label="증상">
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={4} placeholder="고장 증상을 입력하세요" style={{ ...inputSt, resize:'none' }} />
              </Field>

              <MultiPhotoUpload label="증상 사진" keys={photoKeys} setKeys={setPhotoKeys} />
            </>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div style={{ flexShrink:0, padding:'12px 16px', background:'var(--bg2)', borderTop:'1px solid var(--bd)' }}>
        <a href={TKE_TEL} style={{ textDecoration:'none', display:'block' }}>
          <button
            onClick={handleSubmit}
            disabled={!elevatorId || !symptoms.trim() || loading}
            style={{ ...primaryBtnSt, background:'linear-gradient(135deg,#991b1b,#ef4444)', opacity:(!elevatorId||!symptoms.trim()||loading)?0.5:1, width:'100%' }}
          >
            {loading ? '접수 중...' : '🚨 고장 접수 (TKE 자동 연결)'}
          </button>
        </a>
      </div>
    </div>
  )
}

// ── 수리 완료 모달 ─────────────────────────────────────────
function FaultResolveModal({ fault, onClose, onSubmit, loading }: {
  fault:ElevatorFault; onClose:()=>void; onSubmit:(b:any)=>void; loading:boolean
}) {
  const [repairCompany,    setRepairCompany]    = useState('TKE')
  const [repairedAt,       setRepairedAt]       = useState(nowKstLocal())
  const [repairDetail,     setRepairDetail]     = useState('')
  const [repairPhotoKeys,  setRepairPhotoKeys]  = useState<string[]>([])

  const pureSymptoms = fault.symptoms.replace(/^\[[^\]]+\]\s*/, '').replace(/\[승객탑승\]\s*/, '')

  return (
    <ModalWrap title="수리 완료 처리" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ background:'var(--bg3)', borderRadius:10, padding:'10px 13px', fontSize:11, color:'var(--t2)' }}>
          {TYPE_ICON[fault.elevator_type]} {fault.elevator_number}호기<br/>
          <span style={{ color:'var(--t1)' }}>{pureSymptoms}</span>
        </div>
        <Field label="수리 업체">
          <input value={repairCompany} onChange={e => setRepairCompany(e.target.value)} style={inputSt} />
        </Field>
        <Field label="수리 완료 일시">
          <input type="datetime-local" value={repairedAt} onChange={e => setRepairedAt(e.target.value)} style={inputSt} />
        </Field>
        <Field label="수리 내용">
          <textarea value={repairDetail} onChange={e => setRepairDetail(e.target.value)} rows={3} placeholder="수리 내용" style={{ ...inputSt, resize:'none' }} />
        </Field>
        <MultiPhotoUpload label="수리 사진" keys={repairPhotoKeys} setKeys={setRepairPhotoKeys} />
        <button
          onClick={() => onSubmit({ id:fault.id, repairCompany, repairedAt:repairedAt+':00', repairDetail, repairPhotoKeys })}
          disabled={!repairDetail.trim()||loading}
          style={{ ...primaryBtnSt, opacity:(!repairDetail.trim()||loading)?0.5:1 }}
        >
          {loading ? '처리 중...' : '수리 완료'}
        </button>
      </div>
    </ModalWrap>
  )
}

// ── 점검 기록 모달 ─────────────────────────────────────────
function InspectModal({ elevators, selected, onClose, onSubmit, loading }: {
  elevators:Elevator[]; selected:Elevator|null; onClose:()=>void; onSubmit:(b:any)=>void; loading:boolean
}) {
  const initKind: EvKind = selected ? (selected.type==='escalator'?'escalator':'elevator') : ''
  const [evKind,       setEvKind]       = useState<EvKind>(initKind)
  const [elevatorId,   setElevatorId]   = useState(selected?.id ?? '')
  const [inspectDate,  setInspectDate]  = useState(new Date().toISOString().slice(0,10))
  const [checks,       setChecks]       = useState<Record<string,string>>({
    brake:'normal', door:'normal', safetyDevice:'normal', lighting:'normal', emergencyCall:'normal'
  })
  const [actionFloor,  setActionFloor]  = useState('')
  const [actionNeeded, setActionNeeded] = useState('')
  const [memo,         setMemo]         = useState('')

  const isElev = evKind === 'elevator'
  const checkItems = isElev ? CHECK_ITEMS_EV : CHECK_ITEMS_ES
  const floors = elevatorId ? (EV_FLOORS[elevatorId] ?? []) : []

  const overall = Object.values(checks).some(v=>v==='bad') ? 'bad'
                : Object.values(checks).some(v=>v==='caution') ? 'caution'
                : 'normal'

  return (
    <ModalWrap title="점검 기록 입력" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <EvSelector
          elevators={elevators} evKind={evKind}
          setEvKind={v => { setEvKind(v); setElevatorId('') }}
          elevatorId={elevatorId} setElevatorId={setElevatorId}
          groups={EV_GROUPS_FAULT} esNodes={ES_NODES_FAULT}
        />

        {elevatorId && (
          <>
            <Field label="점검일">
              <input type="date" value={inspectDate} onChange={e => setInspectDate(e.target.value)} style={inputSt} />
            </Field>

            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:7 }}>점검 항목</div>
              {checkItems.map(item => {
                const isOk = checks[item.key] === 'normal'
                return (
                  <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--bg3)', borderRadius:9, marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'var(--t1)' }}>{item.label}</span>
                    <button onClick={() => setChecks(p => ({ ...p, [item.key]:p[item.key]==='normal'?'bad':'normal' }))} style={{
                      padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                      background: isOk ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
                      color:      isOk ? 'var(--safe)'         : 'var(--danger)',
                    }}>{isOk ? '정상' : '불량'}</button>
                  </div>
                )
              })}
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--bg3)', borderRadius:9 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--t2)' }}>종합 결과</span>
              <span style={{ fontSize:13, fontWeight:700, color:OVERALL_STYLE[overall].color }}>{OVERALL_STYLE[overall].label}</span>
            </div>

            {/* 조치 필요 + 조치 필요 층 (엘베만) */}
            <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <Field label="조치 필요" style={{ flex:1 }}>
                <textarea value={actionNeeded} onChange={e => setActionNeeded(e.target.value)} rows={2} placeholder="조치가 필요한 사항" style={{ ...inputSt, resize:'none' }} />
              </Field>
              {isElev && (
                <Field label="조치 필요 층" style={{ flexShrink:0, width:90 }}>
                  <select value={actionFloor} onChange={e => setActionFloor(e.target.value)} style={{ ...inputSt, height:62, display:'block' }}>
                    <option value="">-</option>
                    {floors.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              )}
            </div>

            <Field label="메모 (선택)">
              <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={2} placeholder="기타 특이사항" style={{ ...inputSt, resize:'none' }} />
            </Field>

            <button
              onClick={() => onSubmit({
                elevatorId, inspectDate, type:'monthly', ...checks, overall,
                actionNeeded: actionFloor ? `[${actionFloor}] ${actionNeeded}` : actionNeeded,
                memo
              })}
              disabled={!elevatorId || loading}
              style={{ ...primaryBtnSt, opacity:(!elevatorId||loading)?0.5:1 }}
            >
              {loading ? '저장 중...' : '점검 기록 저장'}
            </button>
          </>
        )}
      </div>
    </ModalWrap>
  )
}

// ── 인증서 뷰어 모달 ─────────────────────────────────────
function CertViewerModal({ certKey, onClose }: { certKey:string; onClose:()=>void }) {
  const isPdf = certKey.toLowerCase().endsWith('.pdf')
  const url   = `/api/uploads/${certKey}`
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:200 }} />
      <div style={{ position:'fixed', inset:0, zIndex:201, display:'flex', flexDirection:'column', paddingTop:'var(--sat, 44px)', paddingBottom:'var(--sab, 0px)' }}>
        {/* 헤더 */}
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'rgba(22,27,34,0.97)', borderBottom:'1px solid var(--bd)' }}>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>검사성적서</span>
          <div style={{ display:'flex', gap:8 }}>
            <a href={url} target="_blank" rel="noopener" style={{ fontSize:11, fontWeight:700, color:'var(--acl)', padding:'6px 12px', borderRadius:8, background:'rgba(59,130,246,.15)', border:'1px solid rgba(59,130,246,.3)', textDecoration:'none' }}>새 탭 열기</a>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:20 }}>✕</button>
          </div>
        </div>
        {/* 뷰어 영역 */}
        <div style={{ flex:1, minHeight:0, overflow:'hidden', position:'relative', background:'var(--bg)' }}>
          {isPdf ? (
            <PdfFloorPlan url={url} scale={1} onReady={() => {}} />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', overflow:'auto' }}>
              <img src={url} alt="인증서" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', display:'block' }} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── 지적 건수 배지 (헤더용) ───────────────────────────────
function FindingCountBadge({ elevatorId, inspectionId, isConditional }: { elevatorId:string; inspectionId:string; isConditional:boolean }) {
  const { data: findings = [] } = useQuery({
    queryKey: ['elev-findings', inspectionId],
    queryFn:  () => elevatorInspectionApi.getFindings(elevatorId, inspectionId),
    enabled:  isConditional,
    staleTime: 60_000,
  })
  if (!isConditional || findings.length === 0) return null
  const open = findings.filter(f => f.status === 'open').length
  return (
    <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:6, background:'rgba(239,68,68,.12)', color:'var(--danger)' }}>
      지적 {findings.length}건{open > 0 ? ` (미조치 ${open})` : ''}
    </span>
  )
}

// ── 조건부합격 지적사항 패널 ─────────────────────────────
// hasCorrective: 조치 후 합격 cert가 이미 링크되어 있으면 "합격 전환" 버튼 숨김
function FindingsPanel({ elevatorId, inspectionId, inspectionResult, navigate, hasCorrective }: { elevatorId:string; inspectionId:string; inspectionResult:string; navigate:(to:string)=>void; hasCorrective?:boolean }) {
  const qc = useQueryClient()
  const { staff: fpStaff } = useAuthStore()
  const isAdmin = fpStaff?.role === 'admin'
  const [newDesc, setNewDesc] = useState('')
  const [addingFinding, setAddingFinding] = useState(false)
  const [linkingFindingId, setLinkingFindingId] = useState<string | null>(null)

  const { data: findings = [], isLoading } = useQuery({
    queryKey: ['elev-findings', inspectionId],
    queryFn:  () => elevatorInspectionApi.getFindings(elevatorId, inspectionId),
    staleTime: 60_000,
  })

  // 해당 호기 수리이력
  const { data: repairsList = [] } = useQuery({
    queryKey: ['elev-repairs-for-panel', elevatorId],
    queryFn: () => elevatorRepairApi.list({ elevator_id: elevatorId }),
    enabled: !!elevatorId,
  })

  const allResolved = findings.length > 0 && findings.every(f => f.status === 'resolved')

  // 지적사항 추가
  const handleAddFinding = async () => {
    if (!newDesc.trim()) return
    setAddingFinding(true)
    try {
      await elevatorInspectionApi.createFinding(elevatorId, inspectionId, { description: newDesc.trim() })
      setNewDesc('')
      qc.invalidateQueries({ queryKey: ['elev-findings', inspectionId] })
      toast.success('지적사항 등록 완료')
    } catch { toast.error('등록 실패') }
    setAddingFinding(false)
  }

  // 수리이력 연결 → 조치 완료
  const handleLinkRepair = async (findingId: string, repair: any) => {
    try {
      await elevatorInspectionApi.resolveFinding(elevatorId, inspectionId, findingId, {
        resolution_memo: `[수리이력 연결] ${repair.date} · ${repair.title}${repair.detail && repair.detail !== repair.title ? '\n' + repair.detail : ''}`,
        resolved_date: repair.date,
        repair_id: repair.sourceId,
      })
      qc.invalidateQueries({ queryKey: ['elev-findings', inspectionId] })
      qc.invalidateQueries({ queryKey: ['elevator_repairs_all'] })
      qc.invalidateQueries({ queryKey: ['elev-repairs'] })
      setLinkingFindingId(null)
      toast.success('조치 연결 완료')
    } catch { toast.error('연결 실패') }
  }

  // 합격 전환 mutation
  const convertToPass = useMutation({
    mutationFn: async () => {
      await fetch(`/api/elevators/${elevatorId}/inspections/${inspectionId}/cert`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ result: 'pass' }),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['elev-findings', inspectionId] })
      toast.success('합격으로 전환되었습니다')
    },
    onError: () => toast.error('전환 실패'),
  })

  return (
    <div style={{ padding:'6px 8px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:10, fontWeight:700, color: inspectionResult === 'fail' ? 'var(--danger)' : 'var(--warn)' }}>지적사항 및 조치</span>
        {findings.length > 0 && <span style={{ fontSize:9, color:'var(--t3)' }}>{findings.filter(f => f.status === 'resolved').length}/{findings.length} 조치</span>}
      </div>

      {isLoading && <div style={{ fontSize:9, color:'var(--t3)' }}>불러오는 중...</div>}

      {findings.map(f => (
        <div key={f.id} style={{ padding:'4px 6px', background:'var(--bg2)', borderRadius:5, marginBottom:3 }}>
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10 }}>
            <span style={{ flex:1, color:'var(--t1)', fontWeight:600, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
              onClick={() => navigate(`/elevator/findings/${f.id}?eid=${elevatorId}&iid=${inspectionId}`)}>{f.description}</span>
            <span style={{ fontSize:8, fontWeight:700, padding:'1px 4px', borderRadius:6, flexShrink:0,
              background: f.status === 'open' ? 'rgba(239,68,68,.12)' : 'rgba(34,197,94,.12)',
              color: f.status === 'open' ? 'var(--danger)' : 'var(--safe)',
            }}>{f.status === 'open' ? '미조치' : '완료'}</span>
          </div>
          {f.status === 'open' && linkingFindingId !== f.id && (
            <button onClick={() => setLinkingFindingId(f.id)}
              style={{ marginTop:2, padding:'2px 6px', borderRadius:4, background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.15)', color:'var(--info)', fontSize:9, fontWeight:600, cursor:'pointer' }}>
              수리이력 연결
            </button>
          )}
          {linkingFindingId === f.id && (
            <div style={{ marginTop:3, background:'var(--bg3)', borderRadius:4, padding:4, maxHeight:100, overflowY:'auto', border:'1px solid var(--bd)' }}>
              {repairsList.filter((r: any) => r.sourceType === 'standalone').length === 0 && <div style={{ fontSize:9, color:'var(--t3)', padding:2 }}>수리 이력 없음</div>}
              {repairsList.filter((r: any) => r.sourceType === 'standalone').map((r: any) => (
                <div key={r.id} onClick={() => handleLinkRepair(f.id, r)}
                  style={{ padding:'2px 5px', borderRadius:3, cursor:'pointer', marginBottom:1, background:'var(--bg2)', fontSize:9 }}>
                  <span style={{ fontWeight:600, color:'var(--t1)' }}>{r.date}</span> <span style={{ color:'var(--t2)' }}>{r.title}</span>
                </div>
              ))}
              <button onClick={() => setLinkingFindingId(null)} style={{ marginTop:2, padding:'1px 5px', borderRadius:3, background:'none', border:'1px solid var(--bd)', color:'var(--t3)', fontSize:8, cursor:'pointer' }}>취소</button>
            </div>
          )}
          {f.status === 'resolved' && f.resolutionMemo && (
            <div style={{ fontSize:9, color:'var(--safe)', marginTop:2 }}>✅ {f.resolutionMemo}</div>
          )}
        </div>
      ))}

      <div style={{ display:'flex', gap:4, marginTop:3 }}>
        <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="지적사항 입력..."
          onKeyDown={e => e.key === 'Enter' && handleAddFinding()}
          style={{ flex:1, padding:'3px 6px', borderRadius:4, border:'1px solid var(--bd)', background:'var(--bg)', color:'var(--t1)', fontSize:10, outline:'none' }} />
        <button onClick={handleAddFinding} disabled={!newDesc.trim() || addingFinding}
          style={{ padding:'3px 8px', borderRadius:4, border:'none', background: inspectionResult === 'fail' ? 'var(--danger)' : 'var(--warn)', color:'#fff', fontSize:9, fontWeight:700, cursor:'pointer', opacity: !newDesc.trim() || addingFinding ? 0.5 : 1 }}>
          {addingFinding ? '..' : '추가'}
        </button>
      </div>
    </div>
  )
}

// ── 공용 컴포넌트 ─────────────────────────────────────────
function ModalWrap({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  const isDesktop = useIsDesktop()
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:90 }} />
      <div style={
        isDesktop
          ? { position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex:100, background:'var(--bg2)', borderRadius:14, padding:'0 24px 24px', width:540, maxWidth:'90vw', maxHeight:'85vh', overflowY:'auto', overflowX:'hidden', border:'1px solid var(--bd2)', boxShadow:'0 20px 60px rgba(0,0,0,.5)' }
          : { position:'fixed', bottom:NAV_H, left:0, right:0, zIndex:100, background:'var(--bg2)', borderRadius:'20px 20px 0 0', padding:'0 16px 32px', maxHeight:'calc(100dvh - var(--sat, 44px) - var(--sab, 0px) - 54px)', overflowY:'auto', overflowX:'hidden' }
      }>
        <div style={{ display:'flex', alignItems:'center', padding:'14px 0 12px', borderBottom:'1px solid var(--bd)', marginBottom:14, position: isDesktop ? 'sticky' : 'static', top:0, background:'var(--bg2)', zIndex:1 }}>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)', flex:1 }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        {children}
      </div>
    </>
  )
}
function Field({ label, children, style }: { label:string; children:React.ReactNode; style?:React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ fontSize:11, fontWeight:700, color:'var(--t2)', display:'block', marginBottom:5 }}>{label}</label>
      {children}
    </div>
  )
}
function EmptyState({ icon, text }: { icon:string; text:string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 0', gap:10 }}>
      <div style={{ fontSize:36 }}>{icon}</div>
      <div style={{ fontSize:13, color:'var(--t3)' }}>{text}</div>
    </div>
  )
}

// ── 검사성적서 요약 (검사기록 카드 펼침 시 표시) ────────────
// inspection 객체에 PDF 파싱된 항목별 결과(inspection_items JSON) + 검사실시정보가 있으면 표시
// corrective: 조건부합격 → 시정조치 후 합격 cert (선택적)
function CertSummary({ inspection, corrective, onViewCert, elevatorId, inspectionId, inspectionResult, navigate }: {
  inspection: ElevatorInspection
  corrective?: ElevatorInspection
  onViewCert?: (key: string) => void
  elevatorId?: string
  inspectionId?: string
  inspectionResult?: string
  navigate?: (to: string) => void
}) {
  const hasOriginal = certHasData(inspection)
  const hasCorrective = corrective && certHasData(corrective)
  if (!hasOriginal && !hasCorrective) return null

  const showFindings = elevatorId && inspectionId && inspectionResult && navigate &&
    (inspectionResult === 'conditional' || inspectionResult === 'fail' || inspection.action_needed?.includes('→합격 전환'))

  return (
    <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:14 }}>
      {hasOriginal && <CertBlock inspection={inspection} title="검사성적서" onViewCert={onViewCert}
        elevatorId={showFindings ? elevatorId : undefined} inspectionId={showFindings ? inspectionId : undefined}
        inspectionResult={showFindings ? inspectionResult : undefined} navigate={showFindings ? navigate : undefined} />}
      {hasCorrective && (
        <CertBlock
          inspection={corrective!}
          title="조치 후 합격 검사성적서"
          accent="var(--safe)"
          onViewCert={onViewCert}
        />
      )}
    </div>
  )
}
function certHasData(insp: ElevatorInspection): boolean {
  if (insp.inspection_items) return true
  return !!(insp.inspector_name || insp.inspection_agency || insp.judgment || insp.validity_start || insp.cert_number || insp.certificate_key)
}
function CertBlock({ inspection, title, accent, onViewCert, elevatorId, inspectionId, inspectionResult, navigate }: {
  inspection: ElevatorInspection
  title: string
  accent?: string
  onViewCert?: (key: string) => void
  elevatorId?: string
  inspectionId?: string
  inspectionResult?: string
  navigate?: (to: string) => void
}) {
  let items: Array<{ no:string; name:string; result:string }> = []
  if (inspection.inspection_items) {
    try { items = JSON.parse(inspection.inspection_items) } catch { /* ignore */ }
  }
  const hasInfo =
    inspection.inspector_name || inspection.inspection_agency ||
    inspection.judgment || inspection.validity_start || inspection.cert_number
  const resultColor = (r: string) =>
    r === '적합' ? 'var(--safe)' : r === '부적합' ? 'var(--danger)' : 'var(--t3)'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* 섹션 타이틀 + PDF 보기 */}
      <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:4 }}>
        <div style={{ width:3, height:14, background: accent ?? 'var(--acl)', borderRadius:2 }} />
        <span style={{ fontSize:12, fontWeight:700, color: accent ?? 'var(--t1)' }}>{title}</span>
        {inspection.certificate_key && onViewCert && (
          <button onClick={(e) => { e.stopPropagation(); onViewCert(inspection.certificate_key!) }}
            style={{ marginLeft:'auto', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'var(--safe)', cursor:'pointer' }}>
            📄 PDF 보기
          </button>
        )}
      </div>

      {/* 항목별 검사결과 */}
      {items.length > 0 && (
        <div style={{ border:'1px solid var(--bd)', borderRadius:8, overflow:'hidden' }}>
          <div style={{ padding:'6px 10px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', fontSize:10.5, fontWeight:700, color:'var(--t2)' }}>
            항목별 검사결과
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', background:'var(--bg3)' }}>
            {items.map((it, idx) => {
              const isLast = idx === items.length - 1 && it.result !== '부적합'
              const cellSt: React.CSSProperties = { padding:'5px 8px', fontSize:11, borderBottom: isLast ? 'none' : '1px solid var(--bd)' }
              return (<>
                <div key={`${idx}-no`} style={{ ...cellSt, color:'var(--t3)', fontWeight:600 }}>{it.no}</div>
                <div key={`${idx}-name`} style={{ ...cellSt, color:'var(--t1)' }}>{it.name}</div>
                <div key={`${idx}-result`} style={{ ...cellSt, color:resultColor(it.result), fontWeight:700 }}>{it.result}</div>
                {it.result === '부적합' && elevatorId && inspectionId && inspectionResult && navigate && (<>
                  <div key={`${idx}-findings-spacer`} style={{ borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--bd)' }} />
                  <div key={`${idx}-findings`} style={{ gridColumn:'2 / -1', borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--bd)' }}>
                    <FindingsPanel elevatorId={elevatorId} inspectionId={inspectionId} inspectionResult={inspectionResult} navigate={navigate} />
                  </div>
                </>)}
              </>)
            })}
          </div>
        </div>
      )}

      {/* 검사실시정보 */}
      {hasInfo && (
        <div style={{ border:'1px solid var(--bd)', borderRadius:8, overflow:'hidden' }}>
          <div style={{ padding:'6px 10px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', fontSize:10.5, fontWeight:700, color:'var(--t2)' }}>
            검사실시정보
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'112px minmax(0, 1fr)', background:'var(--bg3)' }}>
            {[
              ['검사실시일', inspection.inspect_date ?? '-'],
              ['검사자', inspection.inspector_name ?? '-'],
              ['관할 검사 기관', inspection.inspection_agency ?? '-'],
              ['판정 결과', inspection.judgment ?? '-'],
              ['검사유효기간', inspection.validity_start && inspection.validity_end ? `${inspection.validity_start} ~ ${inspection.validity_end}` : '-'],
              ['합격증명서 번호', inspection.cert_number ?? '-'],
            ].map(([k, v], idx, arr) => {
              const isLast = idx === arr.length - 1
              const cellK: React.CSSProperties = { padding:'5px 8px', fontSize:10.5, color:'var(--t3)', fontWeight:600, background:'var(--bg2)', borderBottom: isLast ? 'none' : '1px solid var(--bd)', borderRight:'1px solid var(--bd)' }
              const cellV: React.CSSProperties = { padding:'5px 8px', fontSize:11, color:'var(--t1)', fontWeight:600, borderBottom: isLast ? 'none' : '1px solid var(--bd)', wordBreak:'break-all' }
              return [
                <div key={`${idx}-k`} style={cellK}>{k}</div>,
                <div key={`${idx}-v`} style={cellV}>{v}</div>,
              ]
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 승강기정보 카드 (검사성적서 상단 재현) ──────────────────
// 호기(설치장소) 포맷 — EV: "1(1-1)", 화물: "9(1-9)", 덤웨이터: "11(1-11)", ES: "16(E/S-5)"
function formatInstallLocation(ev: Elevator): string {
  if (!ev.public_no) return ''
  if (ev.type === 'escalator') return `${ev.public_no}(E/S-${ev.public_no - 11})`
  return `${ev.public_no}(1-${ev.public_no})`
}
// 빈 값은 대시 처리
function dashIfEmpty(v: string | number | null | undefined): string {
  return (v === null || v === undefined || v === '') ? '-' : String(v)
}
function ElevatorInfoCard({ ev, compact }: { ev: Elevator; compact?: boolean }) {
  const isEsc = ev.type === 'escalator'
  // 운행구간 표시 — 엘리베이터: "B5-8(12)", 에스컬레이터: 그대로
  const rangeText = !isEsc && ev.service_range && ev.floor_count
    ? `${ev.service_range}(${ev.floor_count})`
    : dashIfEmpty(ev.service_range)
  // 엘리베이터 vs 에스컬레이터 필드 세트 다름 (검사성적서 원본 양식 준수)
  const rows: Array<[string, string, string, string]> = isEsc
    ? [
        ['호기(설치장소)', formatInstallLocation(ev),                                 '승강기 고유번호', dashIfEmpty(ev.cert_no)],
        ['형식/종류',      dashIfEmpty(ev.model_type),                                '운행구간(운행수)', rangeText],
        ['제조업체',       dashIfEmpty(ev.manufacturer),                              '유지관리업체',     dashIfEmpty(ev.maintenance_company)],
        ['구동기설치위치', dashIfEmpty(ev.machine_location),                          '운전 방식',        dashIfEmpty(ev.operation_mode)],
        ['최대수용능력',   ev.max_capacity_persons ? `${ev.max_capacity_persons.toLocaleString()} 명/h` : '-', '공칭속도', dashIfEmpty(ev.rated_speed)],
        ['경사 각도',      ev.incline_angle ? `${ev.incline_angle}°` : '-',           '보조브레이크',     dashIfEmpty(ev.auxiliary_brake)],
      ]
    : [
        ['호기(설치장소)', formatInstallLocation(ev),                                 '승강기 고유번호',     dashIfEmpty(ev.cert_no)],
        ['형식/종류',      dashIfEmpty(ev.model_type ?? ev.classification),           '운행구간(운행층수)', rangeText],
        ['제조업체',       dashIfEmpty(ev.manufacturer),                              '유지관리업체',       dashIfEmpty(ev.maintenance_company)],
        ['구동기 공간',    dashIfEmpty(ev.machine_location),                          '적재하중',           ev.capacity_kg ? `${ev.capacity_kg.toLocaleString()} kg` : '-'],
        ['정격속도',       dashIfEmpty(ev.rated_speed),                               '매다는장치 지름/두께', dashIfEmpty(ev.rope_diameter)],
        ['추락방지안전장치', dashIfEmpty(ev.safety_device),                           '매다는장치 가닥수',   ev.rope_count ? `${ev.rope_count} 가닥` : '-'],
      ]
  // 라벨/값 셀 공통 스타일
  const kSt: React.CSSProperties = { color:'var(--t3)', fontWeight:600, fontSize:10.5, padding:'5px 7px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', borderRight:'1px solid var(--bd)', lineHeight:1.3, wordBreak:'keep-all' }
  const vSt: React.CSSProperties = { color:'var(--t1)', fontWeight:600, fontSize:11,   padding:'5px 7px', borderBottom:'1px solid var(--bd)', borderRight:'1px solid var(--bd)', wordBreak:'break-all', lineHeight:1.3 }
  // ── 컴팩트(모바일): 2열 (라벨|값), 한 줄에 한 항목 + 카드 내부 자체 스크롤 ──
  if (compact) {
    // 4열 페어를 풀어서 한 줄에 하나씩
    const flatRows: Array<[string, string]> = [
      ['건물명', '차바이오컴플렉스'],
      ['건물주소', '경기도 성남시 분당구 판교로 335 (삼평동)'],
      ...rows.flatMap(([k1, v1, k2, v2]): Array<[string, string]> => [[k1, v1], [k2, v2]]),
    ]
    return (
      <div style={{ border:'1px solid var(--bd)', borderRadius:8, overflow:'hidden', flexShrink:0 }}>
        <div style={{ padding:'7px 10px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', fontSize:11, fontWeight:700, color:'var(--t1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span>승강기 정보</span>
          <span style={{ fontSize:9, fontWeight:500, color:'var(--t3)' }}>↕ 스크롤</span>
        </div>
        {/* 자체 스크롤 영역 — 약 6행(운행구간까지) 보이는 높이 */}
        <div style={{ maxHeight:170, overflowY:'auto', WebkitOverflowScrolling:'touch', overscrollBehavior:'contain', display:'grid', gridTemplateColumns:'112px minmax(0, 1fr)', background:'var(--bg3)' } as React.CSSProperties}>
          {flatRows.map(([k, v], idx) => {
            const isLast = idx === flatRows.length - 1
            const lastRowSt = isLast ? { borderBottom:'none' } : null
            return [
              <div key={`${idx}-k`} style={{ ...kSt, ...lastRowSt }}>{k}</div>,
              <div key={`${idx}-v`} style={{ ...vSt, ...lastRowSt, borderRight:'none' }}>{v}</div>,
            ]
          })}
        </div>
      </div>
    )
  }
  // ── 일반(데스크톱): 4열 (검사성적서 양식 그대로) ──
  return (
    <div style={{ border:'1px solid var(--bd)', borderRadius:8, overflow:'hidden' }}>
      <div style={{ padding:'7px 10px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', fontSize:11, fontWeight:700, color:'var(--t1)' }}>
        승강기 정보
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'max-content minmax(0, 1fr) max-content minmax(0, 1fr)', background:'var(--bg3)' }}>
        <div style={kSt}>건물명</div>
        <div style={{ ...vSt, gridColumn:'2 / -1', borderRight:'none' }}>차바이오컴플렉스</div>
        <div style={kSt}>건물주소</div>
        <div style={{ ...vSt, gridColumn:'2 / -1', borderRight:'none' }}>경기도 성남시 분당구 판교로 335 (삼평동)</div>
        {rows.map(([k1, v1, k2, v2], idx) => {
          const isLast = idx === rows.length - 1
          const lastRowSt = isLast ? { borderBottom:'none' } : null
          return [
            <div key={`${idx}-k1`} style={{ ...kSt, ...lastRowSt }}>{k1}</div>,
            <div key={`${idx}-v1`} style={{ ...vSt, ...lastRowSt }}>{v1}</div>,
            <div key={`${idx}-k2`} style={{ ...kSt, ...lastRowSt }}>{k2}</div>,
            <div key={`${idx}-v2`} style={{ ...vSt, ...lastRowSt, borderRight:'none' }}>{v2}</div>,
          ]
        })}
      </div>
    </div>
  )
}

// ── 스타일 ────────────────────────────────────────────────
const primaryBtnSt: React.CSSProperties = {
  width:'100%', padding:'13px 0', borderRadius:12, border:'none',
  background:'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
  color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
}
const inputSt: React.CSSProperties = {
  width:'100%', padding:'10px 12px', borderRadius:9,
  background:'var(--bg3)', border:'1px solid var(--bd2)',
  color:'var(--t1)', fontSize:13, outline:'none', fontFamily:'inherit',
  boxSizing:'border-box', minWidth:0,
  WebkitAppearance:'none', appearance:'none',
}
function smBtn(color: string): React.CSSProperties {
  return {
    padding:'5px 12px', borderRadius:8, border:`1px solid ${color}33`,
    background:`${color}15`, color, fontSize:11, fontWeight:700, cursor:'pointer',
  }
}

// ── 수리 대상 레이블 ─────────────────────────────────────────
const REPAIR_TARGET_LABEL: Record<string, string> = {
  car: '카', hall: '홀', machine_room: '기계실', pit: '피트', escalator: '에스컬레이터',
}
const SOURCE_LABEL: Record<string, string> = {
  standalone: '수리', fault: '고장수리', inspect: '점검수리', annual: '검사수리',
}

// ── 수리 통합 뷰 (고장수리 + 검사조치 + 독립수리 통합) ──────
const SOURCE_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  standalone:     { label: '독립수리', color: '#eab308' },
  fault:          { label: '고장수리', color: 'var(--danger)' },
  inspect:        { label: '점검조치', color: 'var(--acl)' },
  annual_finding: { label: '검사조치', color: 'var(--warn)' },
}

function RepairListSection({ elevators, navigate }: { elevators: Elevator[]; navigate: (to:string)=>void }) {
  const qc = useQueryClient()
  const [evType, setEvType] = useState<'' | 'elevator' | 'escalator'>('')
  const [filterEv, setFilterEv] = useState('')
  const [keyword, setKeyword] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewerSrc, setViewerSrc] = useState<string | null>(null)
  const [editRepair, setEditRepair] = useState<any>(null)

  const filteredElevators = (evType ? elevators.filter(e => evType === 'escalator' ? e.type === 'escalator' : e.type !== 'escalator') : elevators).slice().sort((a, b) => a.number - b.number)

  const { data: repairs = [], isLoading } = useQuery({
    queryKey: ['elev-repairs', filterEv, keyword, evType],
    queryFn: () => elevatorRepairApi.list({
      elevator_id: filterEv || undefined,
      keyword: keyword || undefined,
      ev_type: evType || undefined,
    }),
    staleTime: 30_000,
  })

  const renderPhotos = (label: string, csv: string | null) => {
    if (!csv) return null
    const keys = csv.split(',').filter(Boolean)
    if (!keys.length) return null
    return (
      <div style={{ marginTop:8 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', marginBottom:4 }}>{label} ({keys.length})</div>
        <div style={{ display:'flex', gap:4, overflowX:'auto' }}>
          {keys.map((k, i) => (
            <img key={k} src={`/api/uploads/${k}`} alt="" onClick={() => setViewerSrc(`/api/uploads/${k}`)}
              style={{ width:56, height:56, objectFit:'cover', borderRadius:6, border:'1px solid var(--bd)', cursor:'pointer', flexShrink:0 }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {viewerSrc && <RepairImageViewer src={viewerSrc} onClose={() => setViewerSrc(null)} />}

      {/* 필터 바 */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8, flexShrink:0 }}>
        <select value={evType} onChange={e => { setEvType(e.target.value as any); setFilterEv('') }} style={{ ...inputSt, flex:'1 1 90px', fontSize:11 }}>
          <option value="">전체 유형</option>
          <option value="elevator">엘리베이터</option>
          <option value="escalator">에스컬레이터</option>
        </select>
        <select value={filterEv} onChange={e => setFilterEv(e.target.value)} style={{ ...inputSt, flex:'1 1 100px', fontSize:11 }}>
          <option value="">전체 호기</option>
          {filteredElevators.map(e => <option key={e.id} value={e.id}>{e.number}호기 ({e.location})</option>)}
        </select>
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="부품, 호기, 층, 대상 검색..." style={{ ...inputSt, flex:'2 1 100px', fontSize:11 }} />
      </div>

      {isLoading && <EmptyState icon="⏳" text="불러오는 중..." />}
      {!isLoading && repairs.length === 0 && <EmptyState icon="🔧" text="수리 내역이 없어요" />}

      {repairs.map((r: any) => {
        const st = SOURCE_TYPE_LABEL[r.sourceType] ?? SOURCE_TYPE_LABEL.standalone
        const isExpanded = expandedId === r.id
        return (
          <div key={r.id} style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, overflow:'hidden', flexShrink:0, marginBottom:2 }}>
            <div onClick={() => setExpandedId(isExpanded ? null : r.id)} style={{ padding:'10px 12px', display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <div style={{ width:36, height:36, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {TYPE_ICON[r.elevatorType] ?? '🔧'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{r.elevatorNumber}호기</span>
                  <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:5, background:`${st.color}18`, color:st.color }}>{st.label}</span>
                  {r.target && <span style={{ fontSize:9, fontWeight:600, padding:'1px 5px', borderRadius:5, background:'var(--bg3)', color:'var(--t3)' }}>{REPAIR_TARGET_LABEL[r.target]}{r.hallFloor ? ` ${r.hallFloor}` : ''}</span>}
                </div>
                <div style={{ fontSize:12, color:'var(--t1)', marginTop:2, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</div>
                <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>
                  {r.date}{r.company ? ` · ${r.company}` : ''}
                  {r.photos && ' · 📷'}
                </div>
              </div>
              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth={2} style={{ flexShrink:0, transform: isExpanded ? 'rotate(90deg)' : 'none', transition:'transform 0.15s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </div>

            {isExpanded && (
              <div style={{ padding:'0 12px 12px', borderTop:'1px solid var(--bd)' }}>
                {r.detail && (
                  <div style={{ paddingTop:10, fontSize:12, color:'var(--t2)', lineHeight:1.5, whiteSpace:'pre-wrap' }}>{r.detail}</div>
                )}
                {renderPhotos('부품 입고', r.partsArrivalPhotos)}
                {renderPhotos('파손 부품', r.damagedPartsPhotos)}
                {renderPhotos('수리 중', r.duringRepairPhotos)}
                {renderPhotos('수리 완료 / 조치 사진', r.completedPhotos)}
                {r.sourceType === 'standalone' && (
                  <div style={{ display:'flex', gap:8, marginTop:10 }}>
                    <button
                      onClick={() => { setEditRepair(r); setExpandedId(null) }}
                      style={{ flex:1, padding:'8px 0', borderRadius:8, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', color:'var(--info)', fontSize:11, fontWeight:600, cursor:'pointer' }}
                    >
                      수정
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('삭제하시겠습니까?')) return
                        try {
                          await elevatorRepairApi.delete(r.sourceId)
                          qc.invalidateQueries({ queryKey: ['elev-repairs'] })
                          toast.success('삭제 완료')
                          setExpandedId(null)
                        } catch { toast.error('삭제 실패') }
                      }}
                      style={{ flex:1, padding:'8px 0', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--danger)', fontSize:11, fontWeight:600, cursor:'pointer' }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
      {editRepair && <RepairNewModal elevators={elevators} selected={null} onClose={() => setEditRepair(null)} editData={editRepair} />}
    </>
  )
}

// ── 수리 이미지 뷰어 (핀치투줌+패닝) ─────────────────────────
function RepairImageViewer({ src, onClose }: { src: string; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x:0, y:0 })
  const [dragging, setDragging] = useState(false)
  const lastTouch = useRef<{ dist:number; x:number; y:number } | null>(null)
  const dragStart = useRef<{ x:number; y:number; px:number; py:number } | null>(null)
  const dist = (t: React.TouchEvent) => {
    if (t.touches.length < 2) return 0
    const dx = t.touches[0].clientX - t.touches[1].clientX, dy = t.touches[0].clientY - t.touches[1].clientY
    return Math.sqrt(dx*dx+dy*dy)
  }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.95)', display:'flex', flexDirection:'column' }}>
      <div style={{ flexShrink:0, display:'flex', justifyContent:'flex-end', padding:'12px 16px', paddingTop:'calc(12px + var(--sat, 44px))' }}>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#fff', fontSize:24, cursor:'pointer' }}>✕</button>
      </div>
      <div
        onTouchStart={e => {
          if (e.touches.length === 2) { e.preventDefault(); lastTouch.current = { dist:dist(e), x:pos.x, y:pos.y } }
          else if (e.touches.length === 1 && scale > 1) { dragStart.current = { x:e.touches[0].clientX, y:e.touches[0].clientY, px:pos.x, py:pos.y }; setDragging(true) }
        }}
        onTouchMove={e => {
          if (e.touches.length === 2 && lastTouch.current) {
            e.preventDefault(); const s = Math.min(5, Math.max(1, scale * (dist(e) / lastTouch.current.dist))); setScale(s); if (s <= 1) setPos({x:0,y:0})
          } else if (e.touches.length === 1 && dragging && dragStart.current) {
            setPos({ x:dragStart.current.px + e.touches[0].clientX - dragStart.current.x, y:dragStart.current.py + e.touches[0].clientY - dragStart.current.y })
          }
        }}
        onTouchEnd={() => { lastTouch.current = null; dragStart.current = null; setDragging(false); if (scale <= 1) setPos({x:0,y:0}) }}
        onDoubleClick={() => { if (scale > 1) { setScale(1); setPos({x:0,y:0}) } else setScale(2.5) }}
        style={{ flex:1, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', touchAction:'none' }}
      >
        <img src={src} alt="" draggable={false} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', transform:`translate(${pos.x}px,${pos.y}px) scale(${scale})`, transition: dragging ? 'none' : 'transform 0.15s', userSelect:'none' }} />
      </div>
    </div>
  )
}

// ── 다중 사진 업로드 컴포넌트 ────────────────────────────────
function MultiPhotoUpload({ label, keys, setKeys, max = 5 }: { label: string; keys: string[]; setKeys: (k: string[]) => void; max?: number }) {
  const [uploading, setUploading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const camRef = useRef<HTMLInputElement>(null)
  const albRef = useRef<HTMLInputElement>(null)

  const handleAdd = async (file: File) => {
    if (keys.length >= max) { toast.error(`사진은 최대 ${max}장까지 가능합니다`); return }
    setUploading(true)
    try {
      const { compressImage } = await import('../utils/imageUtils')
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append('file', compressed)
      const token = useAuthStore.getState().token
      const res = await fetch('/api/uploads', { method: 'POST', body: fd, headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json() as any
      if (!json.success) throw new Error(json.error)
      setKeys([...keys, json.data.key])
    } catch { toast.error('업로드 실패') }
    setUploading(false)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleAdd(f); e.target.value = '' }

  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:6 }}>{label} ({keys.length}/{max})</div>
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={onFileChange} />
      <input ref={albRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onFileChange} />
      <PhotoSourceModal open={showPicker} onClose={() => setShowPicker(false)} onCamera={() => camRef.current?.click()} onAlbum={() => albRef.current?.click()} />
      <div style={{ display:'flex', gap:6, overflowX:'auto' }}>
        {keys.length < max && (
          <button onClick={() => !uploading && setShowPicker(true)} style={{ width:64, height:64, flexShrink:0, borderRadius:8, border:'1px dashed var(--bd2)', background:'var(--bg3)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, cursor: uploading ? 'wait' : 'pointer' }}>
            <span style={{ fontSize:18 }}>📷</span>
            <span style={{ fontSize:8, color:'var(--t3)', fontWeight:600 }}>{uploading ? '...' : '추가'}</span>
          </button>
        )}
        {keys.map((key, idx) => (
          <div key={key} style={{ position:'relative', width:64, height:64, flexShrink:0 }}>
            <img src={`/api/uploads/${key}`} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:8, border:'1px solid var(--bd)' }} />
            <button onClick={() => setKeys(keys.filter((_,i) => i !== idx))} style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'var(--danger)', color:'#fff', border:'none', fontSize:9, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 수리 기록 입력 모달 ──────────────────────────────────────
function RepairNewModal({ elevators, selected, onClose, editData }: { elevators: Elevator[]; selected: Elevator | null; onClose: () => void; editData?: any }) {
  const qc = useQueryClient()
  const isEdit = !!editData
  const initKind: EvKind = editData ? (elevators.find(e => e.id === editData.elevatorId)?.type === 'escalator' ? 'escalator' : 'elevator') : selected ? (selected.type === 'escalator' ? 'escalator' : 'elevator') : ''
  const [evKind, setEvKind] = useState<EvKind>(initKind)
  const [elevatorId, setElevatorId] = useState(editData?.elevatorId ?? selected?.id ?? '')
  const [repairDate, setRepairDate] = useState(editData?.date ?? new Date().toISOString().slice(0,10))
  const [repairTarget, setRepairTarget] = useState<string>(editData?.target ?? '')
  const [hallFloor, setHallFloor] = useState(editData?.hallFloor ?? '')
  const [repairItem, setRepairItem] = useState(editData?.title ?? '')
  const [repairDetail, setRepairDetail] = useState(editData?.detail ?? '')
  const [repairCompany, setRepairCompany] = useState(editData?.company ?? 'TKE')
  const [partsPhotos, setPartsPhotos] = useState<string[]>(editData?.partsArrivalPhotos?.split(',').filter(Boolean) ?? [])
  const [damagedPhotos, setDamagedPhotos] = useState<string[]>(editData?.damagedPartsPhotos?.split(',').filter(Boolean) ?? [])
  const [duringPhotos, setDuringPhotos] = useState<string[]>(editData?.duringRepairPhotos?.split(',').filter(Boolean) ?? [])
  const [completedPhotos, setCompletedPhotos] = useState<string[]>(editData?.completedPhotos?.split(',').filter(Boolean) ?? [])
  const [saving, setSaving] = useState(false)

  const selectedEv = elevators.find(e => e.id === elevatorId)
  const isEscalator = evKind === 'escalator'
  const floors = selectedEv ? (EV_FLOORS[`EV-${String(selectedEv.number).padStart(2,'0')}`] ?? []) : []

  // 에스컬레이터면 자동 설정
  useEffect(() => {
    if (isEscalator && repairTarget !== 'escalator') setRepairTarget('escalator')
  }, [isEscalator])

  const handleSubmit = async () => {
    if (!elevatorId || !repairTarget || !repairItem.trim()) return
    setSaving(true)
    const body = {
      elevatorId, repairDate, repairTarget,
      hallFloor: repairTarget === 'hall' ? hallFloor : undefined,
      repairItem: repairItem.trim(),
      repairDetail: repairDetail.trim() || undefined,
      repairCompany: repairCompany.trim() || undefined,
      partsArrivalPhotos: partsPhotos.length ? partsPhotos.join(',') : undefined,
      damagedPartsPhotos: damagedPhotos.length ? damagedPhotos.join(',') : undefined,
      duringRepairPhotos: duringPhotos.length ? duringPhotos.join(',') : undefined,
      completedPhotos: completedPhotos.length ? completedPhotos.join(',') : undefined,
    }
    try {
      if (isEdit) {
        await elevatorRepairApi.update(editData.sourceId, body)
      } else {
        await elevatorRepairApi.create(body)
      }
      qc.invalidateQueries({ queryKey: ['elev-repairs'] })
      qc.invalidateQueries({ queryKey: ['elevator_repairs_all'] })
      toast.success(isEdit ? '수리 기록 수정 완료' : '수리 기록 저장 완료')
      onClose()
    } catch { toast.error(isEdit ? '수정 실패' : '저장 실패') }
    setSaving(false)
  }

  const canSubmit = elevatorId && repairTarget && repairItem.trim() && !saving

  return (
    <ModalWrap title={isEdit ? "수리 기록 수정" : "수리 기록 입력"} onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <EvSelector
          elevators={elevators} evKind={evKind}
          setEvKind={v => { setEvKind(v); setElevatorId(''); setRepairTarget('') }}
          elevatorId={elevatorId} setElevatorId={setElevatorId}
          groups={EV_GROUPS_ANNUAL} esNodes={ES_NODES_ANNUAL}
        />

        {elevatorId && (
          <>
            <Field label="수리일">
              <input type="date" value={repairDate} onChange={e => setRepairDate(e.target.value)} style={inputSt} />
            </Field>

            {/* 수리 대상 선택 */}
            {!isEscalator && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:7 }}>수리 대상</div>
                <div style={{ display:'flex', gap:7 }}>
                  {([
                    { key:'car', label:'카' },
                    { key:'hall', label:'홀' },
                    { key:'machine_room', label:'기계실' },
                    { key:'pit', label:'피트' },
                  ] as const).map(opt => (
                    <button key={opt.key} onClick={() => { setRepairTarget(opt.key); setHallFloor('') }} style={{
                      flex:1, padding:'11px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                      background: repairTarget === opt.key ? '#eab30822' : 'var(--bg3)',
                      color: repairTarget === opt.key ? '#eab308' : 'var(--t3)',
                      outline: repairTarget === opt.key ? '2px solid #eab308' : 'none',
                    }}>{opt.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* 홀 선택 시 층 선택 */}
            {repairTarget === 'hall' && floors.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:7 }}>층 선택</div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {floors.map(f => (
                    <button key={f} onClick={() => setHallFloor(f)} style={{
                      padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                      background: hallFloor === f ? '#eab30822' : 'var(--bg3)',
                      color: hallFloor === f ? '#eab308' : 'var(--t3)',
                      outline: hallFloor === f ? '2px solid #eab308' : 'none',
                    }}>{f}</button>
                  ))}
                </div>
              </div>
            )}

            <Field label="수리 항목">
              <input value={repairItem} onChange={e => setRepairItem(e.target.value)} placeholder="수리 부품/항목명" style={inputSt} />
            </Field>

            <Field label="수리 내용 (선택)">
              <textarea value={repairDetail} onChange={e => setRepairDetail(e.target.value)} rows={3} placeholder="수리 상세 내용" style={{ ...inputSt, resize:'none' }} />
            </Field>

            <Field label="수리 업체 (선택)">
              <input value={repairCompany} onChange={e => setRepairCompany(e.target.value)} placeholder="예: TKE, 현대엘리베이터" style={inputSt} />
            </Field>

            {/* 4단계 사진 업로드 */}
            <MultiPhotoUpload label="부품 입고 사진" keys={partsPhotos} setKeys={setPartsPhotos} />
            <MultiPhotoUpload label="파손 부품 사진" keys={damagedPhotos} setKeys={setDamagedPhotos} />
            <MultiPhotoUpload label="수리 중 사진" keys={duringPhotos} setKeys={setDuringPhotos} />
            <MultiPhotoUpload label="수리 완료 사진" keys={completedPhotos} setKeys={setCompletedPhotos} />

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{ ...primaryBtnSt, opacity: canSubmit ? 1 : 0.5 }}
            >
              {saving ? '저장 중...' : '수리 기록 저장'}
            </button>
          </>
        )}
      </div>
    </ModalWrap>
  )
}

// ── 민원24 지적사항 패널 ─────────────────────────────────────
function MinwonFindingsPanel({ elevatorId, year, order, repairs }: { elevatorId: string; year: number; order: number; repairs: any[] }) {
  const qc = useQueryClient()
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [linkingId, setLinkingId] = useState<number | null>(null)

  const { data: findings = [] } = useQuery({
    queryKey: ['minwon-findings', elevatorId, year],
    queryFn: async () => {
      const res = await fetch(`/api/elevators/minwon-findings?elevator_id=${elevatorId}&year=${year}`, { headers: authHeader() })
      const json = await res.json() as any
      return json.success ? json.data : []
    },
  })

  const handleAdd = async () => {
    if (!newDesc.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/elevators/minwon-findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ elevatorId, inspectYear: year, inspectOrder: order, description: newDesc.trim() }),
      })
      const json = await res.json() as any
      if (json.success) {
        setNewDesc('')
        qc.invalidateQueries({ queryKey: ['minwon-findings', elevatorId, year] })
        toast.success('지적사항 등록 완료')
      } else {
        toast.error(json.error ?? '등록 실패')
      }
    } catch { toast.error('등록 실패') }
    setSaving(false)
  }

  const handleLink = async (findingId: number, repairId: string) => {
    try {
      await fetch(`/api/elevators/minwon-findings?id=${findingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` },
        body: JSON.stringify({ repairId }),
      })
      qc.invalidateQueries({ queryKey: ['minwon-findings', elevatorId, year] })
      setLinkingId(null)
      toast.success('조치 연결 완료')
    } catch { toast.error('연결 실패') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`/api/elevators/minwon-findings?id=${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
    })
    qc.invalidateQueries({ queryKey: ['minwon-findings', elevatorId, year] })
    toast.success('삭제 완료')
  }

  // 해당 호기의 독립수리 기록만 필터
  const standaloneRepairs = repairs.filter((r: any) => r.sourceType === 'standalone')

  return (
    <div style={{ background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.2)', borderRadius:10, padding:'12px 14px', marginTop:4 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--warn)', marginBottom:8 }}>⚠️ 지적사항 및 조치</div>

      {/* 기존 지적사항 목록 */}
      {findings.map((f: any) => (
        <div key={f.id} style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:8, padding:'8px 12px', marginBottom:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'var(--t1)', flex:1 }}>{f.description}</span>
            <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:4, background: f.status === 'resolved' ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)', color: f.status === 'resolved' ? 'var(--safe)' : 'var(--danger)' }}>
              {f.status === 'resolved' ? '조치완료' : '미조치'}
            </span>
            <button onClick={() => handleDelete(f.id)} style={{ background:'none', border:'none', color:'var(--t3)', fontSize:12, cursor:'pointer', padding:0 }}>✕</button>
          </div>

          {f.status === 'resolved' && f.repair_item && (
            <div style={{ fontSize:10, color:'var(--safe)', marginTop:2 }}>
              조치: {f.repair_date} · {f.repair_item}
            </div>
          )}

          {f.status === 'open' && linkingId !== f.id && (
            <button onClick={() => setLinkingId(f.id)}
              style={{ marginTop:4, padding:'4px 10px', borderRadius:6, background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.2)', color:'var(--info)', fontSize:10, fontWeight:600, cursor:'pointer' }}>
              수리이력에서 조치 연결
            </button>
          )}

          {linkingId === f.id && (
            <div style={{ marginTop:6, background:'var(--bg3)', borderRadius:6, padding:8, maxHeight:150, overflowY:'auto' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', marginBottom:4 }}>수리 이력 선택:</div>
              {standaloneRepairs.length === 0 && <div style={{ fontSize:10, color:'var(--t3)' }}>수리 이력이 없습니다</div>}
              {standaloneRepairs.map((r: any) => (
                <div key={r.id} onClick={() => handleLink(f.id, r.sourceId)}
                  style={{ padding:'5px 8px', borderRadius:5, cursor:'pointer', fontSize:10, color:'var(--t1)', marginBottom:2, background:'var(--bg2)', border:'1px solid var(--bd)' }}>
                  <span style={{ fontWeight:600 }}>{r.date}</span> · {r.title}
                </div>
              ))}
              <button onClick={() => setLinkingId(null)}
                style={{ marginTop:4, padding:'3px 8px', borderRadius:5, background:'none', border:'1px solid var(--bd)', color:'var(--t3)', fontSize:9, cursor:'pointer' }}>취소</button>
            </div>
          )}
        </div>
      ))}

      {/* 새 지적사항 입력 */}
      <div style={{ display:'flex', gap:6, marginTop:4 }}>
        <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="지적사항 입력..."
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{ flex:1, padding:'7px 10px', borderRadius:7, border:'1px solid var(--bd)', background:'var(--bg)', color:'var(--t1)', fontSize:11, outline:'none' }} />
        <button onClick={handleAdd} disabled={!newDesc.trim() || saving}
          style={{ padding:'7px 14px', borderRadius:7, border:'none', background:'var(--warn)', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', opacity: !newDesc.trim() || saving ? 0.5 : 1 }}>
          {saving ? '...' : '추가'}
        </button>
      </div>
    </div>
  )
}
