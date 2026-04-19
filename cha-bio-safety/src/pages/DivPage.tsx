/**
 * DIV (드라이파이프 밸브) 압력 관리 페이지
 * 탭 1: 압력 트렌드     — 34개 측정점 1차압/2차압/챔버압
 * 탭 2: 챔버배수주기   — DIV 챔버 배수 이력 (div_drain_log)
 * 탭 3: 탱크배수주기   — 컴프레셔 탱크 배수 이력 (comp_drain_log)
 * 탭 4: 오일 주기       — 컴프레셔 오일 보충 이력 (div_compressor_log)
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── 상수: 34개 DIV 측정점 ──────────────────────────────────────
const DIV_POINTS = [
  // 층 숫자(floor), 위치번호(pos), ID
  { floor: 9,  pos: 3, id: '9-3',  floorLabel: '8-1층', loc: '사) 8층 계단 위' },
  { floor: 8,  pos: 1, id: '8-1',  floorLabel: '8층',   loc: '연) 8층 공조실' },
  { floor: 8,  pos: 2, id: '8-2',  floorLabel: '8층',   loc: '연) 8층 PS실'   },
  { floor: 8,  pos: 3, id: '8-3',  floorLabel: '8층',   loc: '사) 8층 PS실'   },
  { floor: 7,  pos: 1, id: '7-1',  floorLabel: '7층',   loc: '연) 7층 공조실' },
  { floor: 7,  pos: 2, id: '7-2',  floorLabel: '7층',   loc: '연) 7층 PS실'   },
  { floor: 7,  pos: 3, id: '7-3',  floorLabel: '7층',   loc: '사) 7층 PS실'   },
  { floor: 6,  pos: 1, id: '6-1',  floorLabel: '6층',   loc: '연) 6층 공조실' },
  { floor: 6,  pos: 2, id: '6-2',  floorLabel: '6층',   loc: '연) 6층 PS실'   },
  { floor: 6,  pos: 3, id: '6-3',  floorLabel: '사) 6층', loc: '사) 6층 PS실' },
  { floor: 5,  pos: 1, id: '5-1',  floorLabel: '5층',   loc: '연) 5층 공조실' },
  { floor: 5,  pos: 2, id: '5-2',  floorLabel: '5층',   loc: '연) 5층 PS실'   },
  { floor: 5,  pos: 3, id: '5-3',  floorLabel: '5층',   loc: '사) 5층 PS실'   },
  { floor: 3,  pos: 1, id: '3-1',  floorLabel: '3층',   loc: '연) 3층 공조실' },
  { floor: 3,  pos: 2, id: '3-2',  floorLabel: '3층',   loc: '연) 3층 PS실'   },
  { floor: 3,  pos: 3, id: '3-3',  floorLabel: '3층',   loc: '사) 3층 PS실'   },
  { floor: 2,  pos: 2, id: '2-2',  floorLabel: '2층',   loc: '연) 2층 PS실'   },
  { floor: 2,  pos: 3, id: '2-3',  floorLabel: '2층',   loc: '사) 2층 PS실'   },
  { floor: 1,  pos: 1, id: '1-1',  floorLabel: '1층',   loc: '연) 1층 공조실' },
  { floor: 1,  pos: 2, id: '1-2',  floorLabel: '1층',   loc: '연) 1층 PS실'   },
  { floor: 1,  pos: 3, id: '1-3',  floorLabel: '1층',   loc: '사) 1층 PS실'   },
  { floor: -1, pos: 1, id: '-1-1', floorLabel: 'B1층',  loc: '지) B1층 공조실' },
  { floor: -1, pos: 2, id: '-1-2', floorLabel: 'B1층',  loc: '지) B1층 화장실' },
  { floor: -1, pos: 3, id: '-1-3', floorLabel: 'B1층',  loc: '지) B1층 식당 뒤' },
  { floor: -2, pos: 1, id: '-2-1', floorLabel: 'B2층',  loc: '지) B2층 공조실' },
  { floor: -2, pos: 2, id: '-2-2', floorLabel: 'B2층',  loc: '지) B2층 CPX실'  },
  { floor: -2, pos: 3, id: '-2-3', floorLabel: 'B2층',  loc: '지) B2층 PS실'   },
  { floor: -3, pos: 2, id: '-3-2', floorLabel: 'B3층',  loc: '지) B3층 팬룸'   },
  { floor: -3, pos: 3, id: '-3-3', floorLabel: 'B3층',  loc: '지) B3층 기사대기실' },
  { floor: -4, pos: 1, id: '-4-1', floorLabel: 'B4층',  loc: '지) B4층 팬룸'   },
  { floor: -4, pos: 2, id: '-4-2', floorLabel: 'B4층',  loc: '지) B4층 기계실'  },
  { floor: -4, pos: 3, id: '-4-3', floorLabel: 'B4층',  loc: '지) B4층 창고'   },
  { floor: -5, pos: 2, id: '-5-2', floorLabel: 'B5층',  loc: '지) B5층 2번팬룸' },
  { floor: -5, pos: 3, id: '-5-3', floorLabel: 'B5층',  loc: '지) B5층 1번팬룸' },
] as const

type DivPoint = typeof DIV_POINTS[number]

// 이상값 감지: ±10% → 주의, ±20% → 불량
// 설정압 기준 없으므로 직전 대비 편차 체크 (향후 세팅압 컬럼 추가 시 개선)
// alertOn: 'rise' = 상승 경보(1차압), 'fall' = 하강 경보(2차/세팅압)
function pressureStatus(val: number, ref: number | null, alertOn: 'rise' | 'fall'): 'ok' | 'warn' | 'danger' {
  if (!ref || ref === 0) return 'ok'
  const pct = ((val - ref) / ref) * 100   // 양수 = 상승, 음수 = 하강
  const exceeded = alertOn === 'rise' ? pct : -pct
  if (exceeded >= 20) return 'danger'
  if (exceeded >= 10) return 'warn'
  return 'ok'
}

const STATUS_COLOR = { ok: 'var(--safe)', warn: 'var(--warn)', danger: 'var(--danger)' }

// DIV 그룹 레이블
const POS_LABEL: Record<number, string> = { 1: 'DIV #1', 2: 'DIV #2', 3: 'DIV #3' }

// ── API ────────────────────────────────────────────────────────
async function fetchPressure(year?: number) {
  const url = year ? `/api/div/pressure?year=${year}` : '/api/div/pressure'
  const res = await fetch(url, { headers: authHeader() })
  const j   = await res.json() as { ok: boolean; records: any[] }
  return j.records ?? []
}
async function fetchLogs(type: 'drain' | 'compressor' | 'comp_drain') {
  const res = await fetch(`/api/div/logs?type=${type}`, { headers: authHeader() })
  const j   = await res.json() as { ok: boolean; logs: any[] }
  return j.logs ?? []
}

// ── 층별 그룹 (pos 1→2→3 순, 층 내림차순) ──────────────────────
const FLOOR_GROUPS: DivPoint[][] = (() => {
  const map = new Map<number, DivPoint[]>()
  for (const p of DIV_POINTS) {
    const arr = map.get(p.floor) ?? []
    arr.push(p as DivPoint)
    map.set(p.floor, arr)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b - a)
    .map(([, pts]) => pts.sort((a, b) => a.pos - b.pos))
})()

// ── 최근 12개월 YYYY-MM 배열 ───────────────────────────────────
function getLast12Months(): string[] {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

// ── 기록 간격 막대차트 ─────────────────────────────────────────
// dates: 정렬된 "YYYY-MM-DD" 배열, 최근 6건에서 5개 간격 추출
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}
function IntervalBar({ dates, color }: { dates: string[]; color: string }) {
  const recent = dates.slice(-6)   // 최근 6건
  if (recent.length < 2) {
    return <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'var(--t3)' }}>기록 없음</div>
  }
  const intervals = recent.slice(1).map((d, i) => ({
    days: daysBetween(recent[i], d),
    mm:   d.slice(5, 7),   // "MM"
    dd:   d.slice(8, 10),  // "DD"
  }))
  const maxDays = Math.max(...intervals.map(iv => iv.days))
  const barW = 13, gap = 3, topPad = 6, barMaxH = 15, labelH = 11
  const n = intervals.length
  const totalW = n * (barW + gap) - gap
  const totalH = topPad + barMaxH + labelH + 2
  return (
    <svg width="100%" height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} preserveAspectRatio="xMidYMid meet">
      {intervals.map(({ days, mm, dd }, i) => {
        const h = maxDays > 0 ? Math.max(4, Math.round((days / maxDays) * barMaxH)) : barMaxH
        const x = i * (barW + gap)
        const barY = topPad + barMaxH - h
        return (
          <g key={i}>
            <rect x={x} y={barY} width={barW} height={h} rx={2} fill={color} opacity={0.85} />
            <text x={x + barW / 2} y={barY - 2} textAnchor="middle"
              fontSize="5.5" fill={color} fontFamily="JetBrains Mono, monospace" opacity={0.9}>
              {days}
            </text>
            <text x={x + barW / 2} y={topPad + barMaxH + 7} textAnchor="middle"
              fontSize="5" fill="rgba(139,148,158,0.55)" fontFamily="JetBrains Mono, monospace">{mm}</text>
            <text x={x + barW / 2} y={topPad + barMaxH + 14} textAnchor="middle"
              fontSize="5" fill="rgba(139,148,158,0.45)" fontFamily="JetBrains Mono, monospace">{dd}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── 메인 페이지 ────────────────────────────────────────────────
type Tab = 'pressure' | 'drain' | 'comp_drain' | 'compressor'

export default function DivPage() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const qc         = useQueryClient()
  const fromNavRef = useRef(false)

  const today = new Date()
  const [tab, setTab]       = useState<Tab>('pressure')
  const [year, setYear]     = useState(today.getFullYear())
  const [selDiv, setSelDiv] = useState<DivPoint | null>(null)

  // 점검 페이지에서 openDivId 상태로 넘어온 경우 자동으로 해당 개소 상세 열기
  useEffect(() => {
    const state = location.state as { openDivId?: string } | null
    if (state?.openDivId) {
      const pt = DIV_POINTS.find(p => p.id === state.openDivId) as DivPoint | undefined
      if (pt) { setSelDiv(pt); fromNavRef.current = true }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const closeDetail = () => {
    setSelDiv(null)
    if (fromNavRef.current) { fromNavRef.current = false; navigate(-1) }
  }

  // ── 데이터 fetch ──────────────────────────────────────────────
  const { data: pressureRecs = [] } = useQuery({
    queryKey: ['div-pressure'],
    queryFn: () => fetchPressure(),
  })
  const { data: drainLogs = [] } = useQuery({
    queryKey: ['div-drain'],
    queryFn: () => fetchLogs('drain'),
    enabled: tab === 'drain',
  })
  const { data: compDrainLogs = [] } = useQuery({
    queryKey: ['div-comp-drain'],
    queryFn: () => fetchLogs('comp_drain'),
    enabled: tab === 'comp_drain',
  })
  const { data: oilLogs = [] } = useQuery({
    queryKey: ['div-oil'],
    queryFn: () => fetchLogs('compressor'),
    enabled: tab === 'compressor',
  })

  // ── 압력 데이터 맵: divId → [{month, v1, v2, vc}] ────────────
  const pressureMap = useMemo(() => {
    const m: Record<string, { year: number; month: number; timing: string | null; v1: number; v2: number; vc: number }[]> = {}
    for (const r of pressureRecs) {
      if (!m[r.location_no]) m[r.location_no] = []
      m[r.location_no].push({ year: r.year, month: r.month, timing: r.timing ?? null, v1: r.pressure_1 ?? 0, v2: r.pressure_2 ?? 0, vc: r.pressure_set ?? 0 })
    }
    const timingOrder = (t: string) => t === 'early' ? 0 : 1
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month !== b.month ? a.month - b.month : timingOrder(a.timing) - timingOrder(b.timing))
    }
    return m
  }, [pressureRecs])

  // ── 배수/오일 날짜 배열: divId → 정렬된 "YYYY-MM-DD"[] ─────────
  const drainDateMap = useMemo(() => {
    const m: Record<string, string[]> = {}
    for (const log of drainLogs) {
      if (!m[log.div_id]) m[log.div_id] = []
      if (!m[log.div_id].includes(log.drained_at)) m[log.div_id].push(log.drained_at)
    }
    for (const k of Object.keys(m)) m[k].sort()
    return m
  }, [drainLogs])

  const compDrainDateMap = useMemo(() => {
    const m: Record<string, string[]> = {}
    for (const log of compDrainLogs) {
      if (!m[log.div_id]) m[log.div_id] = []
      if (!m[log.div_id].includes(log.drained_at)) m[log.div_id].push(log.drained_at)
    }
    for (const k of Object.keys(m)) m[k].sort()
    return m
  }, [compDrainLogs])

  const oilDateMap = useMemo(() => {
    const m: Record<string, string[]> = {}
    for (const log of oilLogs) {
      if (!m[log.div_id]) m[log.div_id] = []
      if (!m[log.div_id].includes(log.action_at)) m[log.div_id].push(log.action_at)
    }
    for (const k of Object.keys(m)) m[k].sort()
    return m
  }, [oilLogs])

  // ── 특정 DIV 전체 이력 fetch ──────────────────────────────────
  const { data: selHistory = [] } = useQuery({
    queryKey: ['div-history', selDiv?.id],
    queryFn: async () => {
      const res = await fetch(`/api/div/pressure?location=${selDiv!.id}`, { headers: authHeader() })
      const j   = await res.json() as { ok: boolean; records: any[] }
      return j.records ?? []
    },
    enabled: !!selDiv,
  })

  // selDiv 열릴 때마다 해당 DIV 최신 연도로 초기화
  useEffect(() => {
    if (selHistory.length > 0) {
      const maxYear = Math.max(...selHistory.map((r: any) => r.year))
      setYear(maxYear)
    }
  }, [selDiv?.id, selHistory.length])

  // ── 압력 트렌드 탭: 층별 3열 그리드 ─────────────────────────
  function renderPressureTab() {
    return (
      <div style={{ padding: '6px 8px 80px' }}>
        {FLOOR_GROUPS.map(group => {
          const byPos: Partial<Record<number, DivPoint>> = {}
          for (const p of group) byPos[p.pos] = p
          const floorLabel = group[0].floorLabel

          return (
            <div key={group[0].floor} style={{ marginBottom: 4 }}>
              {/* 층 라벨 */}
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', marginBottom: 2, paddingLeft: 2, letterSpacing: '0.04em' }}>
                {floorLabel}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {[1, 2, 3].map(pos => {
                  const div = byPos[pos]
                  if (!div) return <div key={pos} />
                  const hist   = pressureMap[div.id] ?? []
                  const last   = hist[hist.length - 1]
                  const prev   = hist[hist.length - 2]
                  const s1     = last && prev ? pressureStatus(last.v1, prev.v1, 'rise') : 'ok'
                  const s2     = last && prev ? pressureStatus(last.v2, prev.v2, 'fall') : 'ok'
                  const sc     = last && prev ? pressureStatus(last.vc, prev.vc, 'fall') : 'ok'
                  const alarm  = s1 === 'danger' || s2 === 'danger' || sc === 'danger'
                  const warn   = !alarm && (s1 === 'warn' || s2 === 'warn' || sc === 'warn')

                  return (
                    <div
                      key={div.id}
                      onClick={() => setSelDiv(div)}
                      style={{
                        background: 'var(--bg2)',
                        border: `1px solid ${alarm ? 'rgba(239,68,68,.4)' : warn ? 'rgba(245,158,11,.3)' : 'var(--bd)'}`,
                        borderRadius: 8, padding: '5px 5px 4px', cursor: 'pointer',
                      }}
                    >
                      {/* 헤더: 호기 · 위치 · 월 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--t3)', flexShrink: 0 }}>#{pos}</span>
                        <span style={{ fontSize: 7, color: 'var(--t2)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {div.loc.replace(/^[^\)]+\) /, '')}
                        </span>
                        {alarm && <span style={{ fontSize: 7, fontWeight: 700, color: 'var(--danger)', flexShrink: 0 }}>이상</span>}
                        {warn  && <span style={{ fontSize: 7, fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>주의</span>}
                        {last  && <span style={{ fontSize: 7, color: 'var(--t3)', flexShrink: 0 }}>{last.month}월{last.timing === 'early' ? '초' : last.timing === 'late' ? '말' : ''}</span>}
                      </div>
                      {/* 압력값: SVG와 동일한 34px 고정 높이 */}
                      <div style={{ height: 34, display: 'flex', alignItems: 'center' }}>
                        {!last ? (
                          <div style={{ width: '100%', textAlign: 'center', fontSize: 9, color: 'var(--t3)' }}>-</div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                            {[
                              { label: '1차', val: last.v1, col: '#3b82f6', s: s1 },
                              { label: '2차', val: last.v2, col: '#f97316',  s: s2 },
                              { label: '세팅', val: last.vc, col: '#22c55e', s: sc },
                            ].map(p => (
                              <div key={p.label} style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{
                                  fontSize: 14, fontWeight: 800, lineHeight: 1, fontFamily: 'JetBrains Mono, monospace',
                                  color: p.s === 'danger' ? 'var(--danger)' : p.s === 'warn' ? '#f59e0b' : p.col,
                                }}>{p.val.toFixed(1)}</div>
                                <div style={{ fontSize: 7, color: 'var(--t3)', marginTop: 3 }}>{p.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── 배수/오일 탭: 층별 3열 간격 막대차트 ────────────────────
  function renderLogTab(type: 'drain' | 'comp_drain' | 'compressor') {
    const dateMap = type === 'drain' ? drainDateMap : type === 'comp_drain' ? compDrainDateMap : oilDateMap
    const color   = type === 'drain' ? '#38bdf8' : type === 'comp_drain' ? '#8b4513' : '#f97316'

    return (
      <div style={{ padding: '6px 8px 80px' }}>
        {FLOOR_GROUPS.map(group => {
          const byPos: Partial<Record<number, DivPoint>> = {}
          for (const p of group) byPos[p.pos] = p
          const floorLabel = group[0].floorLabel

          return (
            <div key={group[0].floor} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', marginBottom: 2, paddingLeft: 2, letterSpacing: '0.04em' }}>
                {floorLabel}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {[1, 2, 3].map(pos => {
                  const div = byPos[pos]
                  if (!div) return <div key={pos} />
                  const dates = dateMap[div.id] ?? []
                  return (
                    <div key={div.id} style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 8, padding: '5px 5px 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--t3)', flexShrink: 0 }}>#{pos}</span>
                        <span style={{ fontSize: 7, color: 'var(--t2)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{div.loc.replace(/^[^\)]+\) /, '')}</span>
                      </div>
                      <IntervalBar dates={dates} color={color} />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── DIV 상세 바텀시트 ─────────────────────────────────────────
  function renderDivDetail() {
    if (!selDiv) return null
    const allHist = [...selHistory].sort((a: any, b: any) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    const currentYear = new Date().getFullYear()
    const hist = (() => {
      if (year === currentYear) {
        // 올해: 최신 기록 기준 최근 12개월
        const lastRec = allHist[allHist.length - 1]
        if (!lastRec) return []
        const endY = lastRec.year, endM = lastRec.month
        const startDate = new Date(endY - 1, endM, 1)
        return allHist.filter((r: any) => {
          const d = new Date(r.year, r.month - 1, 1)
          return d >= startDate && (r.year < endY || (r.year === endY && r.month <= endM))
        })
      } else {
        // 과거 연도: 해당 연도 1월~12월
        return allHist.filter((r: any) => r.year === year)
      }
    })()
    const W = typeof window !== 'undefined' ? window.innerWidth - 32 : 358
    const n = hist.length

    return (
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}
        onClick={closeDetail}
      >
        <div
          style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0', padding: '16px 16px 36px', maxHeight: '80vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
          {/* 타이틀 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{selDiv.floorLabel} · {selDiv.loc}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{POS_LABEL[selDiv.pos]} · {selDiv.id}</div>
            </div>
            {/* 연도 선택 */}
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
              <div style={{ width: 30, display: 'flex', justifyContent: 'center' }}>
                {year > 2023 && <button onClick={e => { e.stopPropagation(); setYear(y => y - 1) }} style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', color: 'var(--t2)', fontSize: 15 }}>‹</button>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', width: 38, textAlign: 'center', display: 'inline-block' }}>{year}</span>
              <div style={{ width: 30, display: 'flex', justifyContent: 'center' }}>
                {year < new Date().getFullYear() && <button onClick={e => { e.stopPropagation(); setYear(y => y + 1) }} style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', color: 'var(--t2)', fontSize: 15 }}>›</button>}
              </div>
            </div>
            <button
              onClick={closeDetail}
              style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 20, cursor: 'pointer' }}
            >✕</button>
          </div>

          {/* 3개 분리 차트 */}
          {hist.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--t3)', padding: '30px 0', fontSize: 13 }}>데이터 없음</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                { key: 'pressure_1' as const,   label: '1차압',  color: '#3b82f6', dashed: false },
                { key: 'pressure_2' as const,   label: '2차압',  color: '#f97316', dashed: false },
                { key: 'pressure_set' as const, label: '세팅압', color: '#22c55e', dashed: true  },
              ] as const).map(({ key, label, color, dashed }) => {
                const vals = hist.map((r: any) => r[key]).filter((v: any) => v != null && v > 0)
                if (vals.length === 0) return null
                const center = (Math.min(...vals) + Math.max(...vals)) / 2
                const sMinV  = center - 0.5
                const sMaxV  = center + 0.5
                const sRange = sMaxV - sMinV
                const sH = 160, sPadL = 34, sPadR = 12, sPadT = 38, sPadB = 22
                const sCW = W - sPadL - sPadR, sCH = sH - sPadT - sPadB
                function spx(i: number) { return sPadL + (n > 1 ? (i / (n - 1)) * sCW : sCW / 2) }
                function spy(v: number) { return sPadT + (1 - (v - sMinV) / sRange) * sCH }
                const sTicks = [sMinV, (sMinV + sMaxV) / 2, sMaxV].map(v => Math.round(v * 10) / 10)
                return (
                  <div key={key}>
                    <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 3 }}>{label}</div>
                    <div style={{ overflowX: 'auto' }}>
                      <svg width={Math.max(W, n * 28)} height={sH} style={{ display: 'block' }}>
                        {sTicks.map((t, ti) => (
                          <g key={ti}>
                            <text x={sPadL - 5} y={spy(t) + 4} textAnchor="end" fill="rgba(139,148,158,0.7)" fontSize="11" fontFamily="JetBrains Mono, monospace">{t.toFixed(1)}</text>
                            <line x1={sPadL} y1={spy(t)} x2={W - sPadR} y2={spy(t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          </g>
                        ))}
                        {hist.map((r: any, i: number) => (
                          <text key={i} x={spx(i)} y={sH - 4} textAnchor="middle" fill="rgba(139,148,158,0.6)" fontSize="9" fontFamily="JetBrains Mono, monospace">
                            {String(r.month).padStart(2, '0')}{r.timing === 'early' ? '초' : r.timing === 'late' ? '말' : ''}
                          </text>
                        ))}
                        <polyline
                          points={hist.map((r: any, i: number) => `${spx(i).toFixed(1)},${spy(r[key] ?? 0).toFixed(1)}`).join(' ')}
                          fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"
                          strokeDasharray={dashed ? '4 2' : undefined}
                        />
                        {hist.map((r: any, i: number) => {
                          const cx = spx(i), cy = spy(r[key] ?? center)
                          const vx = cx
                          const vy = cy - 18
                          return (
                            <g key={i}>
                              <circle cx={cx} cy={cy} r={3} fill={color} />
                              <text
                                x={vx} y={vy}
                                textAnchor="middle" dominantBaseline="central"
                                transform={`rotate(-90, ${vx.toFixed(1)}, ${vy.toFixed(1)})`}
                                fontSize="11" fill={color} fontFamily="JetBrains Mono, monospace" opacity={0.9}
                              >{(r[key] ?? 0).toFixed(1)}</text>
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 수치 테이블 */}
          {hist.length > 0 && (
            <div style={{ marginTop: 14, borderRadius: 10, border: '1px solid var(--bd)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', background: 'var(--bg3)', padding: '7px 10px' }}>
                {['월', '1차압', '2차압', '세팅압'].map(h => (
                  <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textAlign: 'center' }}>{h}</div>
                ))}
              </div>
              {[...hist].reverse().slice(0, 24).map((r: any) => (
                <div key={`${r.year}-${r.month}-${r.timing}`} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', padding: '7px 10px', borderTop: '1px solid var(--bd)' }}>
                  <div style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>{String(r.month).padStart(2,'0')}{r.timing === 'early' ? '초' : r.timing === 'late' ? '말' : ''}</div>
                  {[r.pressure_1, r.pressure_2, r.pressure_set].map((v: number, i: number) => (
                    <div key={i} style={{ fontSize: 12, fontWeight: 700, color: ['#3b82f6','#f97316','#22c55e'][i], textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                      {v != null ? v.toFixed(1) : '-'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── 헤더 ── */}
      <header style={{ flexShrink: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>DIV 압력 관리</span>
      </header>

      {/* ── 탭 ── */}
      <div style={{ flexShrink: 0, display: 'flex', background: 'var(--bg2)', borderBottom: '1px solid var(--bd)' }}>
        {([
          { key: 'pressure',   label: '압력 트렌드' },
          { key: 'drain',      label: '챔버배수주기' },
          { key: 'comp_drain', label: '탱크배수주기' },
          { key: 'compressor', label: '오일 주기' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: 'transparent',
              color: tab === t.key ? 'var(--acl)' : 'var(--t3)',
              borderBottom: `2px solid ${tab === t.key ? 'var(--acl)' : 'transparent'}`,
              transition: 'color .15s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── 컨텐츠 ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'pressure'   && renderPressureTab()}
        {tab === 'drain'      && renderLogTab('drain')}
        {tab === 'comp_drain' && renderLogTab('comp_drain')}
        {tab === 'compressor' && renderLogTab('compressor')}
      </div>

      {/* ── 오버레이 ── */}
      {renderDivDetail()}
    </div>
  )
}
