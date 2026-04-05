import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { elevatorInspectionApi, elevatorRepairApi } from '../utils/api'
import type { ElevatorNextInspection, ElevatorRepair } from '../types'
import PdfFloorPlan from '../components/PdfFloorPlan'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'

const NAV_H = 'calc(54px + env(safe-area-inset-bottom, 20px))'

// ── 타입 ──────────────────────────────────────────────────
interface Elevator {
  id: string
  number: number
  type: 'passenger' | 'cargo' | 'dumbwaiter' | 'escalator'
  location: string
  status: 'normal' | 'fault' | 'maintenance' | 'out_of_service'
  active_faults?: number
  last_inspect_date?: string
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
}
type Tab   = 'list' | 'fault' | 'repair' | 'inspect' | 'annual'
type Modal = null | 'fault_new' | 'fault_resolve' | 'inspect_new' | 'annual_new' | 'repair_new' | 'ev_detail'
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

// 고장·점검용 에스컬 노선 (1·2호기 제외)
// 3층→2층: 5,6호기 / 2층→B1층: 3,4호기
const ES_NODES_FAULT: EsNode[] = [
  { floor:'3층' },
  { left:{ id:'ES-05', label:'5호기', dir:'하행' }, right:{ id:'ES-06', label:'6호기', dir:'상행' } },
  { floor:'2층' },
  { left:{ id:'ES-03', label:'3호기', dir:'하행' }, right:{ id:'ES-04', label:'4호기', dir:'상행' } },
  { floor:'B1층', isBottom:true },
]

// 검사용 에스컬 노선 (전체 6대)
// 3층→2층: 5,6호기 / 2층→B1층: 3,4호기 / B1층→M층: 1,2호기
const ES_NODES_ANNUAL: EsNode[] = [
  { floor:'3층' },
  { left:{ id:'ES-05', label:'5호기', dir:'하행' }, right:{ id:'ES-06', label:'6호기', dir:'상행' } },
  { floor:'2층' },
  { left:{ id:'ES-03', label:'3호기', dir:'하행' }, right:{ id:'ES-04', label:'4호기', dir:'상행' } },
  { floor:'B1층' },
  { left:{ id:'ES-01', label:'1호기', dir:'하행' }, right:{ id:'ES-02', label:'2호기', dir:'상행' } },
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
async function fetchInspections(type: string): Promise<ElevatorInspection[]> {
  const res  = await fetch(`/api/elevators/inspections?type=${type}`, { headers:authHeader() })
  const json = await res.json() as { success:boolean; data:ElevatorInspection[] }
  return json.data ?? []
}
async function fetchEvHistory(elevatorId: string, from: string, to: string): Promise<EvDetailHistory[]> {
  const res  = await fetch(`/api/elevators/history?elevator_id=${elevatorId}&from=${from}&to=${to}`, { headers:authHeader() })
  const json = await res.json() as { success:boolean; data:EvDetailHistory[] }
  return json.data ?? []
}

// ── 메인 ─────────────────────────────────────────────────
export default function ElevatorPage() {
  const qc = useQueryClient()
  const { staff } = useAuthStore()
  const isAdmin = staff?.role === 'admin'
  const [tab,           setTab]           = useState<Tab>('list')
  const [modal,         setModal]         = useState<Modal>(null)
  const [selectedEv,    setSelectedEv]    = useState<Elevator | null>(null)
  const [selectedFault, setSelectedFault] = useState<ElevatorFault | null>(null)
  const [expandedAnnual, setExpandedAnnual] = useState<string | null>(null)
  const [certViewerKey,  setCertViewerKey]  = useState<string | null>(null)

  async function deleteRecord(type: 'fault' | 'inspection', id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    try {
      const endpoint = type === 'fault' ? '/api/elevators/faults' : '/api/elevators/inspections'
      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE', headers: { Authorization:`Bearer ${useAuthStore.getState().token}` } })
      if (!res.ok) throw new Error('삭제 요청 실패')
      qc.invalidateQueries({ queryKey: type === 'fault' ? ['elevator_faults'] : ['elevator_annuals'] })
      qc.invalidateQueries({ queryKey: ['elevator_inspections'] })
      toast.success('삭제 완료')
    } catch {
      toast.error('삭제 실패')
    }
  }

  const { data: elevators   = [] } = useQuery({ queryKey:['elevators'],            queryFn: fetchElevators })
  const { data: faults      = [] } = useQuery({ queryKey:['elevator_faults'],      queryFn: fetchFaults })
  const { data: inspections = [] } = useQuery({ queryKey:['elevator_inspections'], queryFn: () => fetchInspections('monthly') })
  const { data: annuals     = [] } = useQuery({ queryKey:['elevator_annuals'],     queryFn: () => fetchInspections('annual') })
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
    onSuccess: (_,vars:any) => {
      qc.invalidateQueries({ queryKey:['elevators'] })
      qc.invalidateQueries({ queryKey: vars.type === 'annual' ? ['elevator_annuals'] : ['elevator_inspections'] })
      setModal(null); toast.success('기록 저장 완료')
    },
    onError: (e: any) => toast.error(e?.message || '저장 실패'),
  })

  const unresolvedCount = faults.filter(f => !f.is_resolved).length
  const repairCount = faults.filter(f => f.is_resolved && f.repair_detail).length
  const TABS: { key:Tab; label:string }[] = [
    { key:'list',    label:'목록' },
    { key:'fault',   label:`고장${unresolvedCount > 0 ? ` (${unresolvedCount})` : ''}` },
    { key:'repair',  label:'수리' },
    { key:'inspect', label:'점검 기록' },
    { key:'annual',  label:'검사 기록' },
  ]

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
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
                    <div style={{ fontSize:10, color:'var(--t3)' }}>{f.fault_at.slice(0,16).replace('T',' ')}</div>
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

        {/* ── 점검 기록 ── */}
        {tab === 'inspect' && (
          <>
            {inspections.length === 0 && <EmptyState icon="📋" text="점검 기록이 없어요" />}
            {inspections.map(i => {
              const ov = OVERALL_STYLE[i.overall] ?? OVERALL_STYLE.normal
              const isEs = i.elevator_type === 'escalator'
              // action_needed에서 층 파싱
              const floorMatch = i.action_needed?.match(/^\[([^\]]+)\]/)
              const pureAction = i.action_needed?.replace(/^\[[^\]]+\]\s*/, '')
              const floorLabel = floorMatch ? floorMatch[1] : null

              return (
                <div key={i.id} style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'stretch', gap:10 }}>
                  {/* 아이콘 */}
                  <div style={{ width:48, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>
                    {TYPE_ICON[i.elevator_type]}
                  </div>
                  {/* 내용 */}
                  <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:3 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{i.elevator_number ? `${i.elevator_number}호기` : i.elevator_location || '호기 미상'}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:ov.color, background:`${ov.color}22`, padding:'1px 6px', borderRadius:6 }}>{ov.label}</span>
                    </div>
                    <div style={{ fontSize:13, color:'var(--t2)' }}>{pureAction || '조치 사항 없음'}</div>
                    <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{i.inspect_date}</div>
                  </div>
                  {/* 우측: 해당층 + 삭제 */}
                  <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    {!isEs && floorLabel && (
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--info)', background:'rgba(14,165,233,.1)', padding:'2px 7px', borderRadius:8 }}>{floorLabel}</span>
                    )}
                    {isAdmin && (
                      <button onClick={() => deleteRecord('inspection', i.id)} style={{ fontSize:9, color:'var(--danger)', background:'none', border:'none', cursor:'pointer', fontWeight:600, opacity:0.6 }}>삭제</button>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* ── 검사 기록 ── */}
        {tab === 'annual' && (
          <>
            {annuals.length === 0 && <EmptyState icon="📋" text="검사 기록이 없어요" />}
            {annuals.map(i => {
              const resultKey = i.result || i.overall
              const rs = RESULT_STYLE[resultKey] ?? RESULT_STYLE.pass
              const isExpanded = expandedAnnual === i.id
              const isConditional = resultKey === 'conditional'
              const typeLabel = i.inspect_type ? (INSPECT_TYPE_LABEL[i.inspect_type] ?? i.inspect_type) : '정기검사'
              return (
                <div key={i.id} style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                  {/* 리스트 행: 탭하면 상세 펼침 */}
                  <div
                    onClick={() => setExpandedAnnual(isExpanded ? null : i.id)}
                    style={{ padding:'10px 12px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
                  >
                    <div style={{ width:40, height:40, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>
                      {TYPE_ICON[i.elevator_type]}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{i.elevator_number ? `${i.elevator_number}호기` : i.elevator_location || '호기 미상'}</span>
                        <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:6, background:rs.bg, color:rs.color }}>{rs.label}</span>
                        <FindingCountBadge elevatorId={i.elevator_id} inspectionId={i.id} isConditional={isConditional} />
                      </div>
                      <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{i.inspect_date} · {typeLabel}</div>
                    </div>
                    {/* 우측: 인증서 버튼 */}
                    {i.certificate_key ? (
                      <button
                        onClick={e => { e.stopPropagation(); setCertViewerKey(i.certificate_key!) }}
                        style={{ width:52, height:52, borderRadius:10, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, flexShrink:0, cursor:'pointer' }}
                      >
                        <span style={{ fontSize:20 }}>📄</span>
                        <span style={{ fontSize:8, fontWeight:700, color:'var(--safe)' }}>인증서 보기</span>
                      </button>
                    ) : isAdmin ? (
                      <label
                        onClick={e => e.stopPropagation()}
                        style={{ width:52, height:52, borderRadius:10, background:'var(--bg3)', border:'1px dashed var(--bd2)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, flexShrink:0, cursor:'pointer' }}
                      >
                        <span style={{ fontSize:20 }}>📎</span>
                        <span style={{ fontSize:8, fontWeight:600, color:'var(--t3)' }}>첨부</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const fd = new FormData()
                              fd.append('file', file)
                              const res = await fetch('/api/uploads', { method:'POST', body:fd, headers:{ Authorization:`Bearer ${useAuthStore.getState().token}` } })
                              const json = await res.json() as any
                              if (!json.success) throw new Error(json.error)
                              await fetch(`/api/elevators/${i.elevator_id}/inspections/${i.id}/cert`, {
                                method:'PUT',
                                headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${useAuthStore.getState().token}` },
                                body: JSON.stringify({ certificate_key: json.data.key }),
                              })
                              qc.invalidateQueries({ queryKey:['elevator_annuals'] })
                              toast.success('인증서 첨부 완료')
                            } catch (err: any) {
                              toast.error(err?.message ?? '업로드 실패')
                            }
                            e.target.value = ''
                          }}
                        />
                      </label>
                    ) : null}
                  </div>

                  {/* 상세 펼침 */}
                  {isExpanded && (
                    <div style={{ padding:'0 12px 12px', borderTop:'1px solid var(--bd)' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, paddingTop:10 }}>
                        <div>
                          <div style={{ fontSize:10, color:'var(--t3)', fontWeight:600, marginBottom:2 }}>검사일</div>
                          <div style={{ fontSize:12, color:'var(--t1)', fontWeight:600 }}>{i.inspect_date}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:'var(--t3)', fontWeight:600, marginBottom:2 }}>검사 유형</div>
                          <div style={{ fontSize:12, color:'var(--t1)', fontWeight:600 }}>{typeLabel}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:'var(--t3)', fontWeight:600, marginBottom:2 }}>검사 결과</div>
                          <div style={{ fontSize:12, fontWeight:700, color:rs.color }}>{rs.label}</div>
                        </div>
                      </div>
                      {i.action_needed && (
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:10, color:'var(--t3)', fontWeight:600, marginBottom:2 }}>검사 결과 상세</div>
                          <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.5, whiteSpace:'pre-wrap' }}>{i.action_needed}</div>
                        </div>
                      )}
                      {i.memo && (
                        <div style={{ marginTop:8 }}>
                          <div style={{ fontSize:10, color:'var(--t3)', fontWeight:600, marginBottom:2 }}>메모</div>
                          <div style={{ fontSize:12, color:'var(--t2)', lineHeight:1.5, whiteSpace:'pre-wrap' }}>{i.memo}</div>
                        </div>
                      )}

                      {/* 조건부합격/불합격 조치 패널 (합격 전환 후에도 이력 표시) */}
                      {(resultKey === 'conditional' || resultKey === 'fail' || i.action_needed?.includes('→합격 전환')) && (
                        <FindingsPanel elevatorId={i.elevator_id} inspectionId={i.id} inspectionResult={resultKey} navigate={navigate} />
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => deleteRecord('inspection', i.id)}
                          style={{ marginTop:10, width:'100%', padding:'8px 0', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--danger)', fontSize:11, fontWeight:600, cursor:'pointer' }}
                        >
                          검사 기록 삭제
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

      </main>

      {/* ── FAB 버튼 (BottomNav 바로 위, flex 형제) ── */}
      {(tab === 'fault' || tab === 'repair' || tab === 'inspect' || tab === 'annual') && (
        <div style={{ flexShrink:0, padding:'8px 12px', background:'var(--bg)' }}>
          {tab === 'fault' && (
            <button onClick={() => { setSelectedEv(null); setModal('fault_new') }}
              style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#991b1b,#ef4444)', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(239,68,68,.4)' }}>
              🚨 고장 접수
            </button>
          )}
          {tab === 'inspect' && (
            <button onClick={() => { setSelectedEv(null); setModal('inspect_new') }}
              style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(59,130,246,.4)' }}>
              📋 점검 기록 입력
            </button>
          )}
          {tab === 'repair' && (
            <button onClick={() => { setSelectedEv(null); setModal('repair_new') }}
              style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#854d0e,#eab308)', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(234,179,8,.4)' }}>
              🔧 수리 기록 입력
            </button>
          )}
          {tab === 'annual' && (
            <button onClick={() => { setSelectedEv(null); setModal('annual_new') }}
              style={{ width:'100%', height:52, borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#14532d,#22c55e)', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(34,197,94,.4)' }}>
              🔍 검사 기록 입력
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
      {modal === 'annual_new'   && <AnnualModal       elevators={elevators} selected={selectedEv} onClose={() => setModal(null)} onSubmit={b => submitInspect.mutate(b)} loading={submitInspect.isPending} />}
      {modal === 'repair_new'  && <RepairNewModal    elevators={elevators} selected={selectedEv} onClose={() => setModal(null)} />}
      {modal === 'ev_detail'    && detailEv && <EvDetailModal ev={detailEv} onClose={() => { setModal(null); setDetailEv(null) }} />}
      {certViewerKey && <CertViewerModal certKey={certViewerKey} onClose={() => setCertViewerKey(null)} />}
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
      <div style={{ position:'fixed', bottom:NAV_H, left:0, right:0, zIndex:100, background:'var(--bg2)', borderRadius:'20px 20px 0 0', maxHeight:'calc(100dvh - var(--sat, 44px) - var(--sab, 0px) - 54px)', display:'flex', flexDirection:'column', overflowX:'hidden' }}>

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
        <div style={{ flex:1, minHeight:0, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:14 }}>

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
  const [faultAt,      setFaultAt]      = useState(new Date().toISOString().slice(0,16))
  const [faultFloor,   setFaultFloor]   = useState('')
  const [hasPassenger, setHasPassenger] = useState(false)
  const [symptoms,     setSymptoms]     = useState('')

  const isElev = evKind === 'elevator'
  const floors = elevatorId ? (EV_FLOORS[elevatorId] ?? []) : []

  const handleSelectEv = (id: string) => {
    setElevatorId(id)
    setFaultAt(new Date().toISOString().slice(0,16))
    setFaultFloor('')
  }

  const handleSubmit = () => {
    const floorPart = faultFloor ? `[${faultFloor}] ` : ''
    const passPart  = isElev && hasPassenger ? '[승객탑승] ' : ''
    onSubmit({ elevatorId, faultAt:faultAt+':00', symptoms:`${floorPart}${passPart}${symptoms}`, isResolved:false })
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
  const [faultAt,      setFaultAt]      = useState(new Date().toISOString().slice(0,16))
  const [faultFloor,   setFaultFloor]   = useState('')
  const [hasPassenger, setHasPassenger] = useState(false)
  const [symptoms,     setSymptoms]     = useState('')

  const isElev = evKind === 'elevator'
  const floors = elevatorId ? (EV_FLOORS[elevatorId] ?? []) : []

  const handleSelectEv = (id: string) => {
    setElevatorId(id)
    setFaultAt(new Date().toISOString().slice(0,16))
    setFaultFloor('')
  }
  const handleSubmit = () => {
    const floorPart = faultFloor ? `[${faultFloor}] ` : ''
    const passPart  = isElev && hasPassenger ? '[승객탑승] ' : ''
    onSubmit({ elevatorId, faultAt:faultAt+':00', symptoms:`${floorPart}${passPart}${symptoms}`, isResolved:false })
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
  const [repairCompany, setRepairCompany] = useState('TKE')
  const [repairedAt,    setRepairedAt]    = useState(new Date().toISOString().slice(0,16))
  const [repairDetail,  setRepairDetail]  = useState('')

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
        <button
          onClick={() => onSubmit({ id:fault.id, repairCompany, repairedAt:repairedAt+':00', repairDetail })}
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

// ── 검사 기록 모달 ─────────────────────────────────────────
function AnnualModal({ elevators, selected, onClose, onSubmit, loading }: {
  elevators:Elevator[]; selected:Elevator|null; onClose:()=>void; onSubmit:(b:any)=>void; loading:boolean
}) {
  const initKind: EvKind = selected ? (selected.type==='escalator'?'escalator':'elevator') : ''
  const [evKind,        setEvKind]        = useState<EvKind>(initKind)
  const [elevatorId,    setElevatorId]    = useState(selected?.id ?? '')
  const [inspectDate,   setInspectDate]   = useState(new Date().toISOString().slice(0,10))
  const [inspectType,   setInspectType]   = useState<'regular'|'special'|'detailed'>('regular')
  const [annualOverall, setAnnualOverall] = useState<'pass'|'conditional'|'fail'|''>('')
  const [inspectResult, setInspectResult] = useState('')
  const [memo,          setMemo]          = useState('')
  // 지적사항 입력 (조건부합격/불합격 시)
  const [findings, setFindings] = useState<{description:string; location:string}[]>([])
  const [findingDesc, setFindingDesc] = useState('')
  const [findingLoc,  setFindingLoc]  = useState('')

  const needsFindings = annualOverall === 'conditional' || annualOverall === 'fail'

  return (
    <ModalWrap title="검사 기록 입력" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <EvSelector
          elevators={elevators} evKind={evKind}
          setEvKind={v => { setEvKind(v); setElevatorId('') }}
          elevatorId={elevatorId} setElevatorId={setElevatorId}
          groups={EV_GROUPS_ANNUAL} esNodes={ES_NODES_ANNUAL}
        />

        {elevatorId && (
          <>
            <Field label="검사일">
              <input type="date" value={inspectDate} onChange={e => setInspectDate(e.target.value)} style={inputSt} />
            </Field>

            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:7 }}>검사 유형</div>
              <div style={{ display:'flex', gap:7 }}>
                {([
                  { key:'regular',  label:'정기검사'    },
                  { key:'special',  label:'수시검사'    },
                  { key:'detailed', label:'정밀안전검사' },
                ] as const).map(opt => (
                  <button key={opt.key} onClick={() => setInspectType(opt.key)} style={{
                    flex:1, padding:'11px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                    background: inspectType === opt.key ? 'var(--acl)' : 'var(--bg3)',
                    color:      inspectType === opt.key ? '#fff'        : 'var(--t3)',
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:7 }}>검사 결과</div>
              <div style={{ display:'flex', gap:7 }}>
                {([
                  { key:'pass',        label:'합격',        color:'var(--safe)'   },
                  { key:'conditional', label:'조건부 합격', color:'var(--warn)'   },
                  { key:'fail',        label:'불합격',      color:'var(--danger)' },
                ] as const).map(opt => (
                  <button key={opt.key} onClick={() => setAnnualOverall(opt.key)} style={{
                    flex:1, padding:'11px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:700,
                    background: annualOverall === opt.key ? `${opt.color}22` : 'var(--bg3)',
                    color:      annualOverall === opt.key ? opt.color         : 'var(--t3)',
                    outline:    annualOverall === opt.key ? `2px solid ${opt.color}` : 'none',
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>

            {/* 합격: 검사 결과 상세 + 메모 */}
            {annualOverall === 'pass' && (
              <>
                <Field label="검사 결과 상세 (선택)">
                  <textarea value={inspectResult} onChange={e => setInspectResult(e.target.value)} rows={3} placeholder="검사 결과 상세 내용" style={{ ...inputSt, resize:'none' }} />
                </Field>
                <Field label="메모 (선택)">
                  <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={2} placeholder="기타 특이사항" style={{ ...inputSt, resize:'none' }} />
                </Field>
              </>
            )}

            {/* 조건부합격/불합격: 지적사항 입력 */}
            {needsFindings && (
              <div style={{ background:'var(--bg3)', borderRadius:10, padding:'10px 12px' }}>
                <div style={{ fontSize:11, fontWeight:700, color: annualOverall === 'fail' ? 'var(--danger)' : 'var(--warn)', marginBottom:8 }}>
                  {annualOverall === 'fail' ? '불합격 지적사항' : '조건부합격 지적사항'}
                </div>

                {/* 등록된 지적사항 목록 */}
                {findings.map((f, idx) => (
                  <div key={idx} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', background:'var(--bg2)', borderRadius:8, marginBottom:6 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, color:'var(--t1)', fontWeight:600 }}>{f.description}</div>
                      {f.location && <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>{f.location}</div>}
                    </div>
                    <button onClick={() => setFindings(prev => prev.filter((_, i) => i !== idx))} style={{ background:'none', border:'none', color:'var(--danger)', fontSize:14, cursor:'pointer', flexShrink:0 }}>✕</button>
                  </div>
                ))}

                {/* 지적사항 추가 폼 */}
                <Field label="지적 내용">
                  <textarea value={findingDesc} onChange={e => setFindingDesc(e.target.value)} rows={2} placeholder="지적 내용을 입력하세요" style={{ ...inputSt, resize:'none', fontSize:12 }} />
                </Field>
                <div style={{ marginTop:6 }}>
                  <Field label="위치 (선택)">
                    <input value={findingLoc} onChange={e => setFindingLoc(e.target.value)} placeholder="예: B1층 주차장" style={{ ...inputSt, fontSize:12 }} />
                  </Field>
                </div>
                <button
                  onClick={() => {
                    if (!findingDesc.trim()) return
                    setFindings(prev => [...prev, { description: findingDesc.trim(), location: findingLoc.trim() }])
                    setFindingDesc(''); setFindingLoc('')
                  }}
                  disabled={!findingDesc.trim()}
                  style={{
                    marginTop:8, width:'100%', padding:'10px 0', borderRadius:8, border:'none', fontSize:12, fontWeight:700, cursor:'pointer',
                    background: findingDesc.trim() ? 'var(--acl)' : 'var(--bg)',
                    color: findingDesc.trim() ? '#fff' : 'var(--t3)',
                    opacity: findingDesc.trim() ? 1 : 0.5,
                  }}
                >
                  {findingDesc.trim() ? '지적사항 추가' : '지적 내용을 입력하세요'}
                </button>
                {findings.length > 0 && (
                  <div style={{ fontSize:11, color:'var(--safe)', fontWeight:600, textAlign:'center', marginTop:6 }}>
                    ✓ {findings.length}건 등록됨
                  </div>
                )}
                {findings.length === 0 && (
                  <div style={{ fontSize:10, color:'var(--danger)', textAlign:'center', marginTop:6 }}>
                    * 지적사항을 1건 이상 추가해야 저장할 수 있습니다
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => onSubmit({ elevatorId, inspectDate, type:'annual', inspect_type:inspectType, result:annualOverall, overall:annualOverall, actionNeeded:inspectResult || undefined, memo: memo || undefined, findings: needsFindings ? findings : undefined })}
              disabled={!elevatorId || !annualOverall || loading || (needsFindings && findings.length === 0)}
              style={{ ...primaryBtnSt, opacity:(!elevatorId||!annualOverall||loading||(needsFindings && findings.length === 0))?0.5:1 }}
            >
              {loading ? '저장 중...' : '검사 기록 저장'}
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
          <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>인증서</span>
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
function FindingsPanel({ elevatorId, inspectionId, inspectionResult, navigate }: { elevatorId:string; inspectionId:string; inspectionResult:string; navigate:(to:string)=>void }) {
  const qc = useQueryClient()
  const { staff: fpStaff } = useAuthStore()
  const isAdmin = fpStaff?.role === 'admin'

  const { data: findings = [], isLoading } = useQuery({
    queryKey: ['elev-findings', inspectionId],
    queryFn:  () => elevatorInspectionApi.getFindings(elevatorId, inspectionId),
    staleTime: 60_000,
  })

  const allResolved = findings.length > 0 && findings.every(f => f.status === 'resolved')

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
      qc.invalidateQueries({ queryKey: ['elevator_annuals'] })
      qc.invalidateQueries({ queryKey: ['elev-findings', inspectionId] })
      toast.success('합격으로 전환되었습니다')
    },
    onError: () => toast.error('전환 실패'),
  })

  return (
    <div style={{ marginTop:12, borderTop:'1px solid var(--bd)', paddingTop:10 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ fontSize:11, fontWeight:700, color: inspectionResult === 'fail' ? 'var(--danger)' : 'var(--warn)' }}>
          지적사항 및 조치
        </div>
        {findings.length > 0 && (
          <span style={{ fontSize:10, color:'var(--t3)' }}>
            조치완료 {findings.filter(f => f.status === 'resolved').length}/{findings.length}건
          </span>
        )}
      </div>

      {isLoading && <div style={{ fontSize:11, color:'var(--t3)' }}>불러오는 중...</div>}

      {findings.map(f => (
        <div key={f.id}
          onClick={() => navigate(`/elevator/findings/${f.id}?eid=${elevatorId}&iid=${inspectionId}`)}
          style={{ padding:'8px 10px', background:'var(--bg3)', borderRadius:9, marginBottom:6, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}
        >
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, color:'var(--t1)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.description}</div>
            {f.location && <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{f.location}</div>}
          </div>
          <span style={{
            fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10, flexShrink:0,
            background: f.status === 'open' ? 'rgba(239,68,68,.12)' : 'rgba(34,197,94,.12)',
            color:      f.status === 'open' ? 'var(--danger)'        : 'var(--safe)',
          }}>{f.status === 'open' ? '미조치' : '조치완료'}</span>
          <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth={2} style={{ flexShrink:0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </div>
      ))}

      {findings.length === 0 && !isLoading && (
        <div style={{ fontSize:11, color:'var(--t3)', textAlign:'center', padding:'8px 0' }}>등록된 지적사항이 없습니다</div>
      )}

      {/* 합격 전환 버튼 — 모든 지적사항이 조치완료된 경우에만 표시 */}
      {allResolved && isAdmin && inspectionResult !== 'pass' && (
        <button
          onClick={() => { if (confirm('모든 조치가 완료되었습니다. 합격으로 전환하시겠습니까?')) convertToPass.mutate() }}
          disabled={convertToPass.isPending}
          style={{ width:'100%', marginTop:8, padding:'10px 0', borderRadius:8, border:'none', background:'rgba(34,197,94,0.15)', color:'var(--safe)', fontSize:12, fontWeight:700, cursor:'pointer' }}
        >
          {convertToPass.isPending ? '전환 중...' : '✓ 합격으로 전환'}
        </button>
      )}
    </div>
  )
}

// ── 공용 컴포넌트 ─────────────────────────────────────────
function ModalWrap({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:90 }} />
      <div style={{ position:'fixed', bottom:NAV_H, left:0, right:0, zIndex:100, background:'var(--bg2)', borderRadius:'20px 20px 0 0', padding:'0 16px 32px', maxHeight:'calc(100dvh - var(--sat, 44px) - var(--sab, 0px) - 54px)', overflowY:'auto', overflowX:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', padding:'14px 0 12px', borderBottom:'1px solid var(--bd)', marginBottom:14 }}>
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
  const [evType, setEvType] = useState<'' | 'elevator' | 'escalator'>('')
  const [filterEv, setFilterEv] = useState('')
  const [keyword, setKeyword] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewerSrc, setViewerSrc] = useState<string | null>(null)

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
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="부품, 호기, 층, 업체 검색..." style={{ ...inputSt, flex:'2 1 100px', fontSize:11 }} />
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
              </div>
            )}
          </div>
        )
      })}
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

  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:6 }}>{label} ({keys.length}/{max})</div>
      <div style={{ display:'flex', gap:6, overflowX:'auto' }}>
        {keys.length < max && (
          <label style={{ width:64, height:64, flexShrink:0, borderRadius:8, border:'1px dashed var(--bd2)', background:'var(--bg3)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, cursor: uploading ? 'wait' : 'pointer' }}>
            <span style={{ fontSize:18 }}>📷</span>
            <span style={{ fontSize:8, color:'var(--t3)', fontWeight:600 }}>{uploading ? '...' : '추가'}</span>
            <input type="file" accept="image/*" style={{ display:'none' }} disabled={uploading}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAdd(f); e.target.value = '' }}
            />
          </label>
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
function RepairNewModal({ elevators, selected, onClose }: { elevators: Elevator[]; selected: Elevator | null; onClose: () => void }) {
  const qc = useQueryClient()
  const initKind: EvKind = selected ? (selected.type === 'escalator' ? 'escalator' : 'elevator') : ''
  const [evKind, setEvKind] = useState<EvKind>(initKind)
  const [elevatorId, setElevatorId] = useState(selected?.id ?? '')
  const [repairDate, setRepairDate] = useState(new Date().toISOString().slice(0,10))
  const [repairTarget, setRepairTarget] = useState<string>('')
  const [hallFloor, setHallFloor] = useState('')
  const [repairItem, setRepairItem] = useState('')
  const [repairDetail, setRepairDetail] = useState('')
  const [repairCompany, setRepairCompany] = useState('')
  const [partsPhotos, setPartsPhotos] = useState<string[]>([])
  const [damagedPhotos, setDamagedPhotos] = useState<string[]>([])
  const [duringPhotos, setDuringPhotos] = useState<string[]>([])
  const [completedPhotos, setCompletedPhotos] = useState<string[]>([])
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
    try {
      await elevatorRepairApi.create({
        elevatorId, repairDate, repairTarget,
        hallFloor: repairTarget === 'hall' ? hallFloor : undefined,
        repairItem: repairItem.trim(),
        repairDetail: repairDetail.trim() || undefined,
        repairCompany: repairCompany.trim() || undefined,
        partsArrivalPhotos: partsPhotos.length ? partsPhotos.join(',') : undefined,
        damagedPartsPhotos: damagedPhotos.length ? damagedPhotos.join(',') : undefined,
        duringRepairPhotos: duringPhotos.length ? duringPhotos.join(',') : undefined,
        completedPhotos: completedPhotos.length ? completedPhotos.join(',') : undefined,
      })
      qc.invalidateQueries({ queryKey: ['elev-repairs'] })
      toast.success('수리 기록 저장 완료')
      onClose()
    } catch { toast.error('저장 실패') }
    setSaving(false)
  }

  const canSubmit = elevatorId && repairTarget && repairItem.trim() && !saving

  return (
    <ModalWrap title="수리 기록 입력" onClose={onClose}>
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
