/**
 * DIV (드라이파이프 밸브) 압력 관리 페이지
 * 탭 1: 압력 트렌드     — 34개 측정점 1차압/2차압/챔버압
 * 탭 2: 챔버배수주기   — DIV 챔버 배수 이력 (div_drain_log)
 * 탭 3: 오일 주기       — 컴프레셔 오일 보충 이력 (div_compressor_log)
 * 탭 4: 탱크배수주기   — 컴프레셔 탱크 배수 이력 (comp_drain_log)
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, BarChart3, Droplets } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { DIV_POINTS, type DivPoint } from '../constants/divPoints'

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

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

const STATUS_COLOR = { ok: 'var(--status-safe)', warn: 'var(--status-warning)', danger: 'var(--status-danger)' }

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
    return <div className="h-[70px] flex items-center justify-center text-[13px] text-text-tertiary">기록 없음</div>
  }
  const intervals = recent.slice(1).map((d, i) => ({
    days: daysBetween(recent[i], d),
    mm:   d.slice(5, 7),   // "MM"
    dd:   d.slice(8, 10),  // "DD"
  }))
  const maxDays = Math.max(...intervals.map(iv => iv.days))
  const barW = 24, gap = 6, topPad = 10, barMaxH = 36, labelH = 20
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
            <rect x={x} y={barY} width={barW} height={h} rx={3} fill={color} opacity={0.85} />
            <text x={x + barW / 2} y={barY - 2} textAnchor="middle"
              fontSize="10" fill={color} fontFamily="JetBrains Mono, monospace" opacity={0.9}>
              {days}
            </text>
            <text x={x + barW / 2} y={topPad + barMaxH + 12} textAnchor="middle"
              fontSize="10" fill="rgba(139,148,158,0.65)" fontFamily="JetBrains Mono, monospace">{mm}</text>
            <text x={x + barW / 2} y={topPad + barMaxH + 22} textAnchor="middle"
              fontSize="10" fill="rgba(139,148,158,0.5)" fontFamily="JetBrains Mono, monospace">{dd}</text>
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
  const isDesktop = useIsDesktop()

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

  // ── 데스크톱: 전체 포인트 상태 요약 ─────────────────────────
  type PointStatus = {
    point: DivPoint
    status: 'ok' | 'warn' | 'danger'
    worstKind: '1차압' | '2차압' | '세팅' | null
    pct: number | null
    last: { year: number; month: number; timing: string | null; v1: number; v2: number; vc: number } | null
  }
  const pointStatusList = useMemo<PointStatus[]>(() => {
    return DIV_POINTS.map(point => {
      const hist = pressureMap[point.id] ?? []
      const last = hist[hist.length - 1]
      const prev = hist[hist.length - 2]
      if (!last || !prev) {
        return { point: point as DivPoint, status: 'ok', worstKind: null, pct: null, last: last ?? null }
      }
      const cases = [
        { kind: '1차압' as const, val: last.v1, ref: prev.v1, alert: 'rise' as const },
        { kind: '2차압' as const, val: last.v2, ref: prev.v2, alert: 'fall' as const },
        { kind: '세팅' as const, val: last.vc, ref: prev.vc, alert: 'fall' as const },
      ]
      const ranked = cases.map(c => ({ ...c, s: pressureStatus(c.val, c.ref, c.alert) }))
      const sev = (s: 'ok' | 'warn' | 'danger') => s === 'danger' ? 2 : s === 'warn' ? 1 : 0
      ranked.sort((a, b) => sev(b.s) - sev(a.s))
      const top = ranked[0]
      const pct = top.ref && top.ref !== 0 ? Math.round(((top.val - top.ref) / top.ref) * 100) : null
      return { point: point as DivPoint, status: top.s, worstKind: top.kind, pct, last }
    })
  }, [pressureMap])

  const dangerList = pointStatusList.filter(p => p.status === 'danger')
  const warnList   = pointStatusList.filter(p => p.status === 'warn')
  const okCount    = pointStatusList.filter(p => p.status === 'ok').length

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

  // ── 압력 트렌드 탭: 층별 1열 카드 ─────────────────────────
  function renderPressureTab() {
    return (
      <div className="p-[12px_12px_80px]">
        {FLOOR_GROUPS.map(group => {
          const byPos: Partial<Record<number, DivPoint>> = {}
          for (const p of group) byPos[p.pos] = p
          const floorLabel = group[0].floorLabel

          return (
            <div key={group[0].floor} className="mb-1">
              {/* 층 라벨 */}
              <div className="text-[12px] font-bold text-text-tertiary mb-2 pl-0.5 tracking-[0.04em]">
                {floorLabel}
              </div>
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map(pos => {
                  const div = byPos[pos]
                  if (!div) return null
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
                      className={`bg-surface-raised rounded-lg cursor-pointer ${
                        alarm ? 'border border-border-default border-l-4 border-l-status-danger-bar p-[10px_12px_10px_9px]' :
                        warn  ? 'border border-border-default border-l-4 border-l-status-warning-bar p-[10px_12px_10px_9px]' :
                                'border border-border-default p-[10px_12px]'
                      }`}
                    >
                      {/* 헤더: 호기 · 위치 · 배지 · 월 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[14px] font-bold text-text-primary flex-shrink-0">DIV #{pos}</span>
                        <span className="text-[13px] text-text-secondary flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                          {div.loc.replace(/^[^\)]+\) /, '')}
                        </span>
                        {alarm && <span className="text-[12px] font-bold text-danger flex-shrink-0">이상</span>}
                        {warn  && <span className="text-[12px] font-bold text-warning-bar flex-shrink-0">주의</span>}
                        {last  && <span className="text-[12px] text-text-tertiary flex-shrink-0">{last.month}월{last.timing === 'early' ? '초' : last.timing === 'late' ? '말' : ''}</span>}
                      </div>
                      {/* 압력값 */}
                      {!last ? (
                        <div className="w-full text-center text-[13px] text-text-tertiary">-</div>
                      ) : (
                        <div className="flex justify-around">
                          {[
                            { label: '1차', val: last.v1, s: s1 },
                            { label: '2차', val: last.v2, s: s2 },
                            { label: '세팅', val: last.vc, s: sc },
                          ].map(p => (
                            <div key={p.label} className="text-center flex-1">
                              <div className={`text-[22px] font-bold leading-none font-mono ${
                                p.s === 'danger' ? 'text-danger' :
                                p.s === 'warn'   ? 'text-warning' :
                                p.label === '1차' ? 'text-accent' :
                                p.label === '2차' ? 'text-fire-bar' :
                                                    'text-safe-bar'
                              }`}>{p.val.toFixed(1)}</div>
                              <div className="text-[12px] text-text-tertiary mt-1.5">{p.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
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

  // ── 배수/오일 탭: 층별 1열 간격 막대차트 ────────────────────
  function renderLogTab(type: 'drain' | 'comp_drain' | 'compressor') {
    const dateMap = type === 'drain' ? drainDateMap : type === 'comp_drain' ? compDrainDateMap : oilDateMap
    const color   = type === 'drain' ? 'var(--status-info)' : type === 'comp_drain' ? '#8b4513' : 'var(--status-fire-bar)'

    return (
      <div className="p-[12px_12px_80px]">
        {FLOOR_GROUPS.map(group => {
          const byPos: Partial<Record<number, DivPoint>> = {}
          for (const p of group) byPos[p.pos] = p
          const floorLabel = group[0].floorLabel

          return (
            <div key={group[0].floor} className="mb-1">
              <div className="text-[12px] font-bold text-text-tertiary mb-2 pl-0.5 tracking-[0.04em]">
                {floorLabel}
              </div>
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map(pos => {
                  const div = byPos[pos]
                  if (!div) return null
                  const dates = dateMap[div.id] ?? []
                  return (
                    <div key={div.id} className="bg-surface-raised border border-border-default rounded-lg p-[10px_12px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[14px] font-bold text-text-primary flex-shrink-0">DIV #{pos}</span>
                        <span className="text-[13px] text-text-secondary flex-1 overflow-hidden whitespace-nowrap text-ellipsis">{div.loc.replace(/^[^\)]+\) /, '')}</span>
                        {dates.length > 0 && <span className="text-[12px] text-text-tertiary flex-shrink-0">최근 {dates[dates.length-1]?.slice(5)?.replace('-', '/') ?? ''}</span>}
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
    const tOrder = (t: string | null | undefined) => t === 'early' ? 0 : 1
    const allHist = [...selHistory].sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year
      if (a.month !== b.month) return a.month - b.month
      return tOrder(a.timing) - tOrder(b.timing)
    })
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
        className="fixed inset-0 z-40 flex flex-col justify-end bg-black/50"
        onClick={closeDetail}
      >
        <div
          className="bg-surface-raised rounded-t-2xl p-[16px_16px_36px] max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* 타이틀 */}
          <div className="flex items-center gap-2.5 mb-4">
            <div>
              <div className="text-[16px] font-bold text-text-primary">{selDiv.floorLabel} · {selDiv.loc}</div>
              <div className="text-[12px] text-text-tertiary mt-0.5">{POS_LABEL[selDiv.pos]} · {selDiv.id}</div>
            </div>
            {/* 연도 선택 */}
            <div className="flex items-center ml-auto">
              <div className="w-[30px] flex justify-center">
                {year > 2023 && <button onClick={e => { e.stopPropagation(); setYear(y => y - 1) }} className="bg-surface-sunken border-0 rounded-md px-2 py-1 text-text-secondary text-[15px] cursor-pointer">‹</button>}
              </div>
              <span className="text-[13px] font-bold text-text-primary w-[38px] text-center inline-block">{year}</span>
              <div className="w-[30px] flex justify-center">
                {year < new Date().getFullYear() && <button onClick={e => { e.stopPropagation(); setYear(y => y + 1) }} className="bg-surface-sunken border-0 rounded-md px-2 py-1 text-text-secondary text-[15px] cursor-pointer">›</button>}
              </div>
            </div>
            <button
              onClick={closeDetail}
              className="bg-transparent border-0 text-text-tertiary text-[20px] cursor-pointer"
            >✕</button>
          </div>

          {/* 3개 분리 차트 */}
          {hist.length === 0 ? (
            <div className="text-center text-text-tertiary py-[30px] text-[13px]">데이터 없음</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {([
                { key: 'pressure_1' as const,   label: '1차압',  color: 'var(--accent)',          dashed: false },
                { key: 'pressure_2' as const,   label: '2차압',  color: 'var(--status-fire-bar)', dashed: false },
                { key: 'pressure_set' as const, label: '세팅압', color: 'var(--status-safe-bar)', dashed: true  },
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
                    <div className="text-[12px] font-bold mb-1" style={{ color }}>{label}</div>
                    <div className="overflow-x-auto">
                      <svg width={Math.max(W, n * 28)} height={sH} className="block">
                        {sTicks.map((t, ti) => (
                          <g key={ti}>
                            <text x={sPadL - 5} y={spy(t) + 4} textAnchor="end" fill="rgba(139,148,158,0.7)" fontSize="12" fontFamily="JetBrains Mono, monospace">{t.toFixed(1)}</text>
                            <line x1={sPadL} y1={spy(t)} x2={W - sPadR} y2={spy(t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                          </g>
                        ))}
                        {(() => {
                          const labels: { x: number; m: number }[] = []
                          let li = 0
                          while (li < hist.length) {
                            const r0 = hist[li], r1 = hist[li+1]
                            if (r1 && r1.year === r0.year && r1.month === r0.month) {
                              labels.push({ x: (spx(li) + spx(li+1)) / 2, m: r0.month }); li += 2
                            } else {
                              labels.push({ x: spx(li), m: r0.month }); li += 1
                            }
                          }
                          return labels.map((L, idx) => (
                            <text key={idx} x={L.x} y={sH - 4} textAnchor="middle" fill="rgba(139,148,158,0.6)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                              {String(L.m).padStart(2, '00')}
                            </text>
                          ))
                        })()}
                        <polyline
                          points={hist.map((r: any, i: number) => `${spx(i).toFixed(1)},${spy(r[key] ?? 0).toFixed(1)}`).join(' ')}
                          fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"
                          strokeDasharray={dashed ? '4 2' : undefined}
                        />
                        {hist.map((r: any, i: number) => {
                          const cx = spx(i), cy = spy(r[key] ?? center)
                          const vx = cx
                          const vy = cy - 18
                          const isLate = r.timing === 'late'
                          return (
                            <g key={i}>
                              <circle cx={cx} cy={cy} r={3}
                                fill={isLate ? color : 'var(--surface-raised)'}
                                stroke={color} strokeWidth={isLate ? 0 : 1.5}
                              />
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
            <div className="mt-3.5 rounded-[10px] border border-border-default overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_1fr_1fr] bg-surface-sunken p-[8px_10px]">
                {['월', '1차압', '2차압', '세팅압'].map(h => (
                  <div key={h} className="text-[12px] font-bold text-text-tertiary text-center">{h}</div>
                ))}
              </div>
              {[...hist].reverse().slice(0, 24).map((r: any) => (
                <div key={`${r.year}-${r.month}-${r.timing}`} className="grid grid-cols-[60px_1fr_1fr_1fr] p-[8px_10px] border-t border-border-default">
                  <div className="text-[13px] text-text-secondary text-center font-mono">{String(r.month).padStart(2,'0')}{r.timing === 'early' ? '초' : r.timing === 'late' ? '말' : ''}</div>
                  {[r.pressure_1, r.pressure_2, r.pressure_set].map((v: number, i: number) => (
                    <div key={i} className={`text-[14px] font-bold text-center font-mono ${
                      i === 0 ? 'text-accent' :
                      i === 1 ? 'text-fire-bar' :
                                'text-safe-bar'
                    }`}>
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

  // ── 데스크톱: 압력 트렌드 차트 (모바일 renderDivDetail 차트 로직 복사) ───────
  function renderDesktopPressureChart(div: DivPoint) {
    const tOrder = (t: string | null | undefined) => t === 'early' ? 0 : 1
    const allHist = [...selHistory].sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year
      if (a.month !== b.month) return a.month - b.month
      return tOrder(a.timing) - tOrder(b.timing)
    })
    const currentYear = new Date().getFullYear()
    const hist = (() => {
      if (year === currentYear) {
        const lastRec = allHist[allHist.length - 1]
        if (!lastRec) return []
        const endY = lastRec.year, endM = lastRec.month
        const startDate = new Date(endY - 1, endM, 1)
        return allHist.filter((r: any) => {
          const d = new Date(r.year, r.month - 1, 1)
          return d >= startDate && (r.year < endY || (r.year === endY && r.month <= endM))
        })
      } else {
        return allHist.filter((r: any) => r.year === year)
      }
    })()
    void div
    const W = 600
    const n = hist.length

    if (hist.length === 0) {
      return <div className="text-text-tertiary py-[30px] text-center text-[13px]">데이터 없음</div>
    }

    return (
      <div>
        <div className="flex flex-col gap-2.5">
          {([
            { key: 'pressure_1' as const,   label: '1차압',  color: 'var(--accent)',          dashed: false },
            { key: 'pressure_2' as const,   label: '2차압',  color: 'var(--status-fire-bar)', dashed: false },
            { key: 'pressure_set' as const, label: '세팅압', color: 'var(--status-safe-bar)', dashed: true  },
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
                <div className="text-[12px] font-bold mb-1" style={{ color }}>{label}</div>
                <div className="overflow-x-auto">
                  <svg width={Math.max(W, n * 28)} height={sH} className="block">
                    {sTicks.map((t, ti) => (
                      <g key={ti}>
                        <text x={sPadL - 5} y={spy(t) + 4} textAnchor="end" fill="rgba(139,148,158,0.7)" fontSize="12" fontFamily="JetBrains Mono, monospace">{t.toFixed(1)}</text>
                        <line x1={sPadL} y1={spy(t)} x2={W - sPadR} y2={spy(t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      </g>
                    ))}
                    {(() => {
                      const labels: { x: number; m: number }[] = []
                      let li = 0
                      while (li < hist.length) {
                        const r0 = hist[li], r1 = hist[li+1]
                        if (r1 && r1.year === r0.year && r1.month === r0.month) {
                          labels.push({ x: (spx(li) + spx(li+1)) / 2, m: r0.month }); li += 2
                        } else {
                          labels.push({ x: spx(li), m: r0.month }); li += 1
                        }
                      }
                      return labels.map((L, idx) => (
                        <text key={idx} x={L.x} y={sH - 4} textAnchor="middle" fill="rgba(139,148,158,0.6)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                          {String(L.m).padStart(2, '0')}
                        </text>
                      ))
                    })()}
                    <polyline
                      points={hist.map((r: any, i: number) => `${spx(i).toFixed(1)},${spy(r[key] ?? 0).toFixed(1)}`).join(' ')}
                      fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"
                      strokeDasharray={dashed ? '4 2' : undefined}
                    />
                    {hist.map((r: any, i: number) => {
                      const cx = spx(i), cy = spy(r[key] ?? center)
                      const vx = cx
                      const vy = cy - 18
                      const isLate = r.timing === 'late'
                      return (
                        <g key={i}>
                          <circle cx={cx} cy={cy} r={3}
                            fill={isLate ? color : 'var(--surface-raised)'}
                            stroke={color} strokeWidth={isLate ? 0 : 1.5}
                          />
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

        {/* 수치 테이블 */}
        <div className="mt-3.5 rounded-[10px] border border-border-default overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_1fr_1fr] bg-surface-sunken p-[8px_10px]">
            {['월', '1차압', '2차압', '세팅압'].map(h => (
              <div key={h} className="text-[12px] font-bold text-text-tertiary text-center">{h}</div>
            ))}
          </div>
          {[...hist].reverse().slice(0, 24).map((r: any) => (
            <div key={`${r.year}-${r.month}-${r.timing}`} className="grid grid-cols-[60px_1fr_1fr_1fr] p-[8px_10px] border-t border-border-default">
              <div className="text-[13px] text-text-secondary text-center font-mono">{String(r.month).padStart(2,'0')}{r.timing === 'early' ? '초' : r.timing === 'late' ? '말' : ''}</div>
              {[r.pressure_1, r.pressure_2, r.pressure_set].map((v: number, i: number) => (
                <div key={i} className={`text-[14px] font-bold text-center font-mono ${
                  i === 0 ? 'text-accent' :
                  i === 1 ? 'text-fire-bar' :
                            'text-safe-bar'
                }`}>
                  {v != null ? v.toFixed(1) : '-'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── 데스크톱: 배수/오일 타임라인 (큰 막대그래프 + 날짜 리스트) ─────
  function renderDesktopLogTimeline(div: DivPoint, type: 'drain' | 'comp_drain' | 'compressor') {
    const dateMap = type === 'drain' ? drainDateMap : type === 'comp_drain' ? compDrainDateMap : oilDateMap
    const dates = dateMap[div.id] ?? []
    const color = type === 'drain' ? 'var(--status-info)' : type === 'comp_drain' ? '#8b4513' : 'var(--status-fire-bar)'
    const label = type === 'drain' ? '챔버 배수' : type === 'comp_drain' ? '탱크 배수' : '오일 보충'

    // 데스크톱용 큰 막대그래프: 최근 6건 → 5개 간격
    const recent = dates.slice(-6)
    const intervals = recent.length >= 2
      ? recent.slice(1).map((d, i) => ({
          days: daysBetween(recent[i], d),
          mm:   d.slice(5, 7),
          dd:   d.slice(8, 10),
        }))
      : []
    const maxDays = intervals.length > 0 ? Math.max(...intervals.map(iv => iv.days)) : 0
    const topPad  = 32                // 막대 위 숫자 라벨 공간
    const barMaxH = 100
    const labelY  = topPad + barMaxH + 30
    const subY    = topPad + barMaxH + 56
    const chartH  = topPad + barMaxH + 70

    return (
      <div className="flex flex-col gap-3.5">
        <div className="text-[12px] font-bold tracking-[0.04em]" style={{ color }}>{label} 간격</div>
        <div className="bg-surface-raised border border-border-default rounded-[10px] p-[18px_20px]">
          {intervals.length === 0 ? (
            <div className="flex items-center justify-center text-text-tertiary text-[13px]" style={{ height: chartH }}>
              기록이 부족하여 간격을 표시할 수 없습니다 (최소 2건 필요)
            </div>
          ) : (
            <svg width="100%" height={chartH} viewBox={`0 0 ${intervals.length * 100} ${chartH}`} preserveAspectRatio="xMidYMid meet">
              {intervals.map(({ days, mm, dd }, i) => {
                const h = maxDays > 0 ? Math.max(16, Math.round((days / maxDays) * barMaxH)) : barMaxH
                const cx = i * 100 + 50
                const barW = 60
                const x = cx - barW / 2
                const barY = topPad + (barMaxH - h)
                return (
                  <g key={i}>
                    <rect x={x} y={barY} width={barW} height={h} rx={6} fill={color} opacity={0.85} />
                    <text x={cx} y={barY - 10} textAnchor="middle"
                      fontSize="20" fontWeight="700" fill={color} fontFamily="JetBrains Mono, monospace">
                      {days}일
                    </text>
                    <text x={cx} y={labelY} textAnchor="middle"
                      fontSize="16" fontWeight="700" fill="var(--text-secondary)" fontFamily="JetBrains Mono, monospace">{Number(mm)}월</text>
                    <text x={cx} y={subY} textAnchor="middle"
                      fontSize="14" fill="var(--text-tertiary)" fontFamily="JetBrains Mono, monospace">{Number(dd)}일</text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>
        <div className="text-[12px] font-bold text-text-tertiary mt-1.5">최근 기록</div>
        {dates.length === 0 ? (
          <div className="text-[13px] text-text-tertiary p-4 text-center">기록 없음</div>
        ) : (
          <div className="flex flex-col gap-1">
            {[...dates].reverse().slice(0, 20).map(d => (
              <div key={d} className="flex gap-2.5 p-[8px_12px] bg-surface-raised rounded-lg border border-border-default">
                <span className="text-[13px] font-mono text-text-primary">{d}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── 데스크톱: 우측 상세 패널 ─────────────────────────────────
  function renderDesktopRightPanel() {
    // A. 빈 상태: 전역 통계 요약
    if (!selDiv) {
      // 배수/오일 평균 간격 + 최근 날짜 계산
      function summarizeMap(m: Record<string, string[]>) {
        const intervals: number[] = []
        let recent: string | null = null
        for (const id of Object.keys(m)) {
          const arr = m[id]
          if (arr.length >= 2) {
            intervals.push(daysBetween(arr[arr.length - 2], arr[arr.length - 1]))
          }
          const last = arr[arr.length - 1]
          if (last && (!recent || last > recent)) recent = last
        }
        const avg = intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : null
        return { avg, recent }
      }
      const drainSum = summarizeMap(drainDateMap)
      const compDrainSum = summarizeMap(compDrainDateMap)
      const oilSum = summarizeMap(oilDateMap)

      const counters = [
        { label: '정상', count: okCount,           bgClass: 'bg-safe-bg',    borderClass: 'border-safe-bar/25',    textClass: 'text-safe-bar' },
        { label: '주의', count: warnList.length,   bgClass: 'bg-warning-bg', borderClass: 'border-warning-bar/40', textClass: 'text-warning-bar' },
        { label: '이상', count: dangerList.length, bgClass: 'bg-danger-bg',  borderClass: 'border-danger-bar/40',  textClass: 'text-danger' },
      ]

      const logCards = [
        { label: '챔버 배수', sum: drainSum,     colorClass: 'text-info' },
        { label: '탱크 배수', sum: compDrainSum, colorClass: 'text-[#8b4513]' },
        { label: '오일 보충', sum: oilSum,       colorClass: 'text-fire-bar' },
      ]

      const alertItems = [...dangerList, ...warnList]

      return (
        <div className="flex flex-col gap-[18px]">
          {/* 섹션 1: 측정점 현황 */}
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] font-bold text-text-secondary mb-2.5">
              <BarChart3 size={16} />
              34개 측정점 현황
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {counters.map(c => (
                <div key={c.label} className={`${c.bgClass} border ${c.borderClass} rounded-[10px] p-[14px_12px] text-center`}>
                  <div className={`text-[28px] font-extrabold leading-none font-mono ${c.textClass}`}>{c.count}</div>
                  <div className="text-[12px] text-text-secondary mt-1.5 font-semibold">{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 섹션 2: 배수/오일 현황 */}
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] font-bold text-text-secondary mb-2.5">
              <Droplets size={16} />
              배수/오일 현황
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {logCards.map(card => (
                <div key={card.label} className="bg-surface-raised border border-border-default rounded-[10px] p-[12px_12px]">
                  <div className={`text-[12px] font-bold mb-1.5 tracking-[0.04em] ${card.colorClass}`}>{card.label}</div>
                  <div className="text-[18px] font-extrabold text-text-primary font-mono">
                    {card.sum.avg != null ? `평균 ${card.sum.avg}일` : '기록 없음'}
                  </div>
                  <div className="text-[12px] text-text-tertiary mt-1 font-mono">
                    {card.sum.recent ? `최근 ${card.sum.recent}` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 섹션 3: 이상/주의 리스트 */}
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] font-bold text-text-secondary mb-2.5">
              <AlertTriangle size={16} />
              이상/주의 포인트
            </div>
            {alertItems.length === 0 ? (
              <div className="text-[12px] text-text-tertiary p-4 text-center bg-surface-raised border border-border-default rounded-lg">
                이상·주의 포인트가 없습니다
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {alertItems.map(item => {
                  const isDanger = item.status === 'danger'
                  return (
                    <button
                      key={item.point.id}
                      onClick={() => setSelDiv(item.point as DivPoint)}
                      className={`flex items-center gap-2.5 p-[10px_12px] rounded-lg cursor-pointer text-left border ${
                        isDanger
                          ? 'bg-danger-bg/50 border-danger-bar/30'
                          : 'bg-warning-bg/50 border-warning-bar/30'
                      }`}
                    >
                      <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold flex-shrink-0 min-w-[56px] ${isDanger ? 'text-danger' : 'text-warning-bar'}`}>
                        <span className={`w-2 h-2 rounded-full inline-block ${isDanger ? 'bg-danger-bar' : 'bg-warning-bar'}`} />
                        {isDanger ? '이상' : '주의'}
                      </span>
                      <span className="text-[14px] font-bold text-text-primary font-mono flex-shrink-0 min-w-[80px]">
                        {item.point.id}
                      </span>
                      <span className="text-[12px] text-text-secondary flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
                        {item.point.floorLabel} · {item.point.loc}
                      </span>
                      <span className={`text-[12px] font-bold font-mono flex-shrink-0 ${isDanger ? 'text-danger' : 'text-warning-bar'}`}>
                        {item.worstKind ?? ''}{item.pct != null ? ` ${item.pct > 0 ? '+' : ''}${item.pct}%` : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )
    }

    // B. 선택 상태: 제목 + 연도 네비 + 내부 탭 + 탭 콘텐츠
    const selectedDiv: DivPoint = selDiv
    return (
      <div className="flex flex-col gap-3.5 pb-10">
        {/* 헤더: 제목 + 연도 네비 + ✕ */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-bold text-text-primary">
              {selectedDiv.floorLabel} · {selectedDiv.loc}
            </div>
            <div className="text-[12px] text-text-tertiary mt-0.5">
              {POS_LABEL[selectedDiv.pos]} · {selectedDiv.id}
            </div>
          </div>
          {tab === 'pressure' && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="w-[30px] flex justify-center">
                {year > 2023 && (
                  <button onClick={() => setYear(y => y - 1)} className="bg-surface-sunken border-0 rounded-md px-2 py-1 text-text-secondary text-[15px] cursor-pointer">‹</button>
                )}
              </div>
              <span className="text-[13px] font-bold text-text-primary w-[38px] text-center inline-block">{year}</span>
              <div className="w-[30px] flex justify-center">
                {year < new Date().getFullYear() && (
                  <button onClick={() => setYear(y => y + 1)} className="bg-surface-sunken border-0 rounded-md px-2 py-1 text-text-secondary text-[15px] cursor-pointer">›</button>
                )}
              </div>
            </div>
          )}
          <button
            onClick={closeDetail}
            className="bg-transparent border-0 text-text-tertiary text-[22px] cursor-pointer flex-shrink-0"
          >✕</button>
        </div>

        {/* 내부 탭 */}
        <div className="flex border-b border-border-default">
          {([
            { key: 'pressure',   label: '압력 트렌드' },
            { key: 'drain',      label: '챔버배수' },
            { key: 'compressor', label: '오일' },
            { key: 'comp_drain', label: '탱크배수' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 p-[10px_4px] border-0 bg-transparent cursor-pointer text-[13px] font-semibold border-b-2 ${
                tab === t.key ? 'text-accent border-accent' : 'text-text-tertiary border-transparent'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {tab === 'pressure'   && renderDesktopPressureChart(selectedDiv)}
        {tab === 'drain'      && renderDesktopLogTimeline(selectedDiv, 'drain')}
        {tab === 'comp_drain' && renderDesktopLogTimeline(selectedDiv, 'comp_drain')}
        {tab === 'compressor' && renderDesktopLogTimeline(selectedDiv, 'compressor')}
      </div>
    )
  }

  // ── 데스크톱: 전체 레이아웃 (헤더 + 배너 + 좌 매트릭스 + 우 상세) ─────────
  function renderDesktopLayout() {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-surface-page">
        {/* 헤더 — 데스크톱 표준 (sketch 07a) */}
        <header className="flex-shrink-0 h-[54px] bg-surface-raised border-b border-border-default px-5 flex items-center gap-2.5">
          <span className="flex-1 text-[16px] font-bold text-text-primary">DIV 압력 관리</span>
        </header>

        {/* 상단 알림 배너 */}
        <div className="flex-shrink-0 bg-surface-raised border-b border-border-default p-[8px_24px] flex items-center gap-2.5 overflow-x-auto">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-text-secondary flex-shrink-0">
            <AlertTriangle size={14} />
            이상 {dangerList.length}건 · 주의 {warnList.length}건
          </span>
          {[...dangerList, ...warnList].map(item => (
            <button
              key={item.point.id}
              onClick={() => setSelDiv(item.point as DivPoint)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 border rounded-2xl px-2.5 py-1 text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                item.status === 'danger'
                  ? 'border-danger-bar/40 bg-danger-bg text-danger'
                  : 'border-warning-bar/40 bg-warning-bg text-warning-bar'
              }`}
            >
              <span className={`w-2 h-2 rounded-full inline-block ${item.status === 'danger' ? 'bg-danger-bar' : 'bg-warning-bar'}`} />
              {item.point.id} {item.worstKind ?? ''}{item.pct != null ? ` ${item.pct > 0 ? '+' : ''}${item.pct}%` : ''}
            </button>
          ))}
          {dangerList.length === 0 && warnList.length === 0 && (
            <span className="text-[11px] text-text-tertiary">모든 포인트 정상</span>
          )}
        </div>

        {/* 본문: 좌 매트릭스 / 우 상세 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측 매트릭스 */}
          <div className="flex-1 min-w-0 border-r border-border-default overflow-y-auto p-[20px_24px]">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[80px_repeat(3,1fr)] gap-2 mb-2.5 pb-2.5 border-b border-border-default">
              <div className="text-[12px] font-bold text-text-tertiary">층</div>
              <div className="text-[12px] font-bold text-text-tertiary text-center">#1 연구동</div>
              <div className="text-[12px] font-bold text-text-tertiary text-center">#2 연구동</div>
              <div className="text-[12px] font-bold text-text-tertiary text-center">#3 사무동</div>
            </div>

            {FLOOR_GROUPS.map(group => {
              const floorLabel = group[0].floorLabel
              return (
                <div key={group[0].floor} className="grid grid-cols-[80px_repeat(3,1fr)] gap-2 mb-2">
                  {/* 층 라벨 */}
                  <div className="text-[13px] font-bold text-text-secondary flex items-center pl-1">
                    {floorLabel}
                  </div>
                  {[1, 2, 3].map(pos => {
                    const div = group.find(g => g.pos === pos) as DivPoint | undefined
                    if (!div) {
                      return (
                        <div key={pos} className="bg-surface-sunken border border-dashed border-border-default rounded-lg min-h-[80px] flex items-center justify-center text-text-tertiary text-[16px] p-[10px_12px]">—</div>
                      )
                    }
                    const info = pointStatusList.find(p => p.point.id === div.id)
                    const status = info?.status ?? 'ok'
                    const last = info?.last ?? null
                    const selected = selDiv?.id === div.id

                    let bgClass = 'bg-surface-raised'
                    let borderClass = 'border border-border-default'
                    if (status === 'danger')      { bgClass = 'bg-danger-bg';  borderClass = 'border border-danger-bar/40' }
                    else if (status === 'warn')   { bgClass = 'bg-warning-bg'; borderClass = 'border border-warning-bar/40' }
                    else if (last)                { bgClass = 'bg-safe-bg';    borderClass = 'border border-safe-bar/25' }
                    const selectedBorder = selected ? 'border-2 border-accent' : borderClass
                    const padding = selected ? 'p-[9px_11px]' : 'p-[10px_12px]'

                    const colColor = (col: '1차' | '2차' | '세팅') => {
                      if (info?.worstKind === col) {
                        return status === 'danger' ? 'text-danger' : status === 'warn' ? 'text-warning' : ''
                      }
                      return col === '1차' ? 'text-accent' : col === '2차' ? 'text-fire-bar' : 'text-safe-bar'
                    }

                    return (
                      <div
                        key={pos}
                        onClick={() => setSelDiv(div)}
                        className={`${bgClass} ${selectedBorder} ${padding} rounded-lg relative min-h-[80px] flex flex-col cursor-pointer transition-colors`}
                      >
                        {/* 우상단 배지 */}
                        {status === 'danger' && (
                          <span className="absolute top-1.5 right-2.5 text-[11px] font-bold text-danger">이상</span>
                        )}
                        {status === 'warn' && (
                          <span className="absolute top-1.5 right-2.5 text-[11px] font-bold text-warning-bar">주의</span>
                        )}
                        {/* 좌상단: 개소번호 + 월 (세로 스택) */}
                        <div className="absolute top-2 left-3 flex flex-col gap-0.5">
                          <div className="text-[13px] font-bold text-text-primary leading-none">{div.id}</div>
                          <div className="text-[12px] text-text-tertiary leading-none">
                            {last ? `${last.month}월${last.timing === 'early' ? '초' : last.timing === 'late' ? '말' : ''}` : '기록 없음'}
                          </div>
                        </div>
                        {/* 중앙: 1차/2차/세팅압 */}
                        {last && (
                          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center items-center gap-2.5 font-mono leading-none">
                            <span className={`text-[18px] font-bold ${colColor('1차')}`}>{last.v1.toFixed(1)}</span>
                            <span className="text-[13px] text-text-tertiary font-normal">|</span>
                            <span className={`text-[18px] font-bold ${colColor('2차')}`}>{last.v2.toFixed(1)}</span>
                            <span className="text-[13px] text-text-tertiary font-normal">|</span>
                            <span className={`text-[18px] font-bold ${colColor('세팅')}`}>{last.vc.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* 범례 */}
            <div className="mt-4 p-[12px_12px] border-t border-border-default flex gap-4 flex-wrap text-[12px] text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-[14px] h-[14px] bg-safe-bg border border-safe-bar/25 rounded-[3px]" /> 정상
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-[14px] h-[14px] bg-warning-bg border border-warning-bar/40 rounded-[3px]" /> 주의
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-[14px] h-[14px] bg-danger-bg border border-danger-bar/40 rounded-[3px]" /> 이상
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-[14px] h-[14px] bg-surface-sunken border border-dashed border-border-default rounded-[3px]" /> 해당없음
              </span>
            </div>
          </div>

          {/* 우측 상세 패널 */}
          <div className="flex-1 min-w-0 overflow-y-auto p-[20px_24px]">
            {renderDesktopRightPanel()}
          </div>
        </div>
      </div>
    )
  }

  if (isDesktop) {
    return <>{renderDesktopLayout()}</>
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-page">

      {/* ── 헤더 — App GlobalHeader (대시보드) 버튼 사이즈와 일치: 48px 헤더 + 32×32 백버튼 ── */}
      {/* ⚠ tailwind.config.js spacing override: w-8/h-8 = 48px (Tailwind 기본 32px 아님). 32 명시 ── */}
      <header className="flex-shrink-0 flex items-center h-12 px-3 bg-surface-raised border-b border-border-default">
        <button onClick={() => navigate(-1)} className="w-[32px] h-[32px] rounded-[7px] bg-surface-sunken flex items-center justify-center text-text-secondary cursor-pointer border-0">
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="flex-1 text-[13px] font-bold text-text-primary ml-2">DIV 압력 관리</span>
      </header>

      {/* ── 탭 ── */}
      <div className="flex-shrink-0 flex bg-surface-raised border-b border-border-default">
        {([
          { key: 'pressure',   label: '압력 트렌드' },
          { key: 'drain',      label: '챔버배수주기' },
          { key: 'compressor', label: '오일 주기' },
          { key: 'comp_drain', label: '탱크배수주기' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-1 py-2.5 text-[12px] font-semibold bg-transparent cursor-pointer transition-colors border-b-2 ${tab === t.key ? 'text-accent border-accent' : 'text-text-tertiary border-transparent'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* ── 컨텐츠 ── */}
      <div className="flex-1 overflow-y-auto">
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
