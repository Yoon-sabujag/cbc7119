// ── DIV 점검 공용 모듈 (DivInspectModal + CompressorModal) ───────────────
// InspectionPage 인라인 정의에서 추출 (260626-5hm). InspectionPage / FloorPlanPage 가 공유.
// 압력 파싱·세팅압 seeding·트렌드 판정·CompressorModal 의 단일 출처 — 복붙 금지.
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import type { CheckResult } from '../../types'
import type { ScheduleItem } from '../../types'
import { usePhotoUpload, photoUploadFailMsg } from '../../hooks/usePhotoUpload'
import { PhotoButton } from '../PhotoButton'
import { DIV_POINTS as DIV_PTS, type DivPoint as DivPt } from '../../constants/divPoints'
import { useDivNames } from '../../hooks/useDivNames'
import { InspectionRevisitPopup } from '../InspectionRevisitPopup'
import { useInspectionRevisitPopup, type MonthRecordEntry } from '../../hooks/useInspectionRevisitPopup'
import { FamilyACard, faLineResults, faAllResolved, faAutoMemo, faWorst, RESULT_ICONS, INSPECT_RESULT_OPTIONS, type FaMark } from '../inspection/familyCard'
import { inspectionContent, type InspectionItem } from '../../data/inspectionContent'
import {
  ChevronLeft, ChevronRight, X, TrendingUp, Flame, BarChart3, Wind,
  CheckCircle2, AlertTriangle, XCircle, Check,
  FlaskConical, Building2, TrainFront,
} from 'lucide-react'

// 모듈-로컬 상수 — fixed 풀스크린 모달 하단 safe-area (InspectionPage 와 별개 사본, 자립).
const NAV_BOTTOM = 'calc(54px + env(safe-area-inset-bottom, 20px))'

// 아이콘 컴포넌트 공통 타입
type IconComp = ComponentType<{ size?: number | string; className?: string }>

// Zone 아이콘 매핑 (연구동/사무동/지하)
const ZONE_ICONS: Record<string, IconComp> = {
  research:    FlaskConical,
  office:      Building2,
  underground: TrainFront,
}

// ── DIV 전용 모달 ─────────────────────────────────────────────
type DivZone = 'research'|'office'|'underground'

const DIV_LINE_SEQ: Record<number, number[]> = {
  1: [8, 7, 6, 5, 3, 1],
  2: [8, 7, 6, 5, 3, 1, 2],
  3: [9, 8, 7, 6, 5, 3, 2, 1],
}
const DIV_UNDER_SEQ = ['-1-1','-1-2','-1-3','-2-3','-2-1','-2-2','-3-2','-3-3','-4-1','-4-2','-4-3','-5-3','-5-2']

// DIV 측정점 id → 점검 체크포인트 ID 매핑 (34개 측정점별)
const DIV_PT_CP: Record<string, string> = Object.fromEntries(
  DIV_PTS.map(p => [p.id, `CP-DIV-${p.id}`])
)
// 컴프레셔 측정점 id → 점검 체크포인트 ID 매핑
const COMP_PT_CP: Record<string, string> = Object.fromEntries(
  DIV_PTS.map(p => [p.id, `CP-COMP-${p.id}`])
)

// 추세 판단: 연속 방향성 + 누적 임계값
function detectDivTrend(series: number[], badIfIncreasing: boolean): { level: 'normal'|'caution'|'bad'; cumulative: number } {
  if (series.length < 3) return { level: 'normal', cumulative: 0 }
  const NOISE = 0.05
  const intervals = series.slice(1).map((v,i) => v - series[i])
  let consecutive = 0
  for (let i = intervals.length - 1; i >= 0; i--) {
    const d = intervals[i]
    if (Math.abs(d) <= NOISE) break
    if (badIfIncreasing ? d > 0 : d < 0) consecutive++
    else break
  }
  const cumulative = badIfIncreasing
    ? series[series.length-1] - series[0]
    : series[0] - series[series.length-1]
  if (consecutive >= 2 && cumulative > 1.0) return { level: 'bad', cumulative }
  if (consecutive >= 2 && cumulative > 0.5) return { level: 'caution', cumulative }
  return { level: 'normal', cumulative }
}

// 지하 전용 미니 피커
function DivUnderPicker({ items, activeIdx, onChange }: {
  items: { id: string; label: string }[]
  activeIdx: number
  onChange: (idx: number) => void
}) {
  const ITEM_H = 44
  const VISIBLE = 3
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout>|null>(null)
  const prevIdsRef = useRef('')

  useEffect(() => {
    const curr = items.map(i => i.id).join(',')
    if (prevIdsRef.current !== curr) {
      prevIdsRef.current = curr
      if (scrollRef.current) scrollRef.current.scrollTop = activeIdx * ITEM_H
    }
  })

  const snapTo = useCallback((idx: number) => {
    scrollRef.current?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
  }, [])

  const handleScroll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!scrollRef.current) return
      const idx = Math.max(0, Math.min(Math.round(scrollRef.current.scrollTop / ITEM_H), items.length - 1))
      snapTo(idx)
      onChange(idx)
    }, 100)
  }, [items.length, onChange, snapTo])

  const pad = ITEM_H * Math.floor(VISIBLE / 2)
  const containerH = ITEM_H * VISIBLE

  return (
    <div
      className="relative rounded-md overflow-hidden bg-surface-raised border border-border-default"
      style={{ height: containerH }}
    >
      <div
        className="absolute left-0 right-0 z-[2] pointer-events-none bg-[rgba(14,165,233,.08)] border-y border-[rgba(14,165,233,.22)]"
        style={{ top:'50%', height: ITEM_H, transform:'translateY(-50%)' }}
      />
      <div
        className="absolute top-0 left-0 right-0 z-[3] pointer-events-none"
        style={{ height: pad, background:'linear-gradient(to bottom, var(--surface-raised) 30%, transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 z-[3] pointer-events-none"
        style={{ height: pad, background:'linear-gradient(to top, var(--surface-raised) 30%, transparent)' }}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto box-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType:'y mandatory', paddingTop: pad, paddingBottom: pad }}
      >
        {items.map((item, idx) => {
          const dist = Math.abs(idx - activeIdx)
          return (
            <div
              key={item.id}
              className="flex items-center px-3.5 cursor-pointer transition-opacity duration-100"
              style={{ height: ITEM_H, scrollSnapAlign:'center', opacity: dist===0 ? 1 : dist===1 ? 0.48 : 0.15 }}
            >
              <span className={dist === 0 ? 'text-label font-bold text-text-primary' : 'text-caption font-normal text-text-primary'}>
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── DIV 트렌드 서브뷰 (DivModal 내부 오버레이) ─────────────────
function DivTrendSubview({ point, records, onClose, lockToPoint }: {
  point:   DivPt
  records: any[]   // oldest → newest
  onClose: () => void
  lockToPoint?: boolean   // 도면 진입 시 하단 네비가 없어 full-screen (bottom:0)
}) {
  const { getDivName } = useDivNames()
  const W = typeof window !== 'undefined' ? window.innerWidth - 32 : 358
  // 최근 기록 기준 12개월
  const hist = (() => {
    if (records.length === 0) return []
    const last = records[records.length - 1]
    const endY = last.year as number, endM = last.month as number
    const startDate = new Date(endY - 1, endM, 1)
    return records.filter((r: any) => {
      const d = new Date(r.year, r.month - 1, 1)
      return d >= startDate && (r.year < endY || (r.year === endY && r.month <= endM))
    })
  })()
  const n = hist.length

  return (
    <div
      className="fixed left-0 right-0 z-[99] flex flex-col bg-surface-page"
      style={{ top:'var(--sat, 0px)', bottom: (lockToPoint ? 0 : NAV_BOTTOM) }}
    >
      {/* 헤더 */}
      <div className="flex items-center px-4 py-3 border-b border-border-default gap-2.5 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-sm border border-border-default bg-surface-raised cursor-pointer inline-flex items-center justify-center"
        >
          <X size={16} className="text-text-secondary" />
        </button>
        <div>
          <div className="text-body-sm font-bold text-text-primary">{point.floorLabel} — {getDivName(point.id) || point.loc}</div>
          <div className="text-caption text-text-tertiary mt-0.5">DIV #{point.pos} · {point.id}</div>
        </div>
      </div>
      {/* 차트 + 테이블 */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-10">
        {hist.length === 0 ? (
          <div className="text-center text-text-tertiary py-10 text-label">이전 기록 없음</div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {([
                { key:'pressure_1'   as const, label:'1차압',  color:'#3b82f6', dashed:false },
                { key:'pressure_2'   as const, label:'2차압',  color:'#f97316', dashed:false },
                { key:'pressure_set' as const, label:'세팅압', color:'#22c55e', dashed:true  },
              ] as const).map(({ key, label, color, dashed }) => {
                const vals = hist.map((r: any) => r[key]).filter((v: any) => v != null && v > 0)
                if (vals.length === 0) return null
                const center = (Math.min(...vals) + Math.max(...vals)) / 2
                const sMinV = center - 0.5, sMaxV = center + 0.5, sRange = sMaxV - sMinV
                const sH = 160, sPadL = 34, sPadR = 12, sPadT = 38, sPadB = 22
                const sCW = W - sPadL - sPadR, sCH = sH - sPadT - sPadB
                const spx = (i: number) => sPadL + (n > 1 ? (i / (n - 1)) * sCW : sCW / 2)
                const spy = (v: number) => sPadT + (1 - (v - sMinV) / sRange) * sCH
                const sTicks = [sMinV, (sMinV + sMaxV) / 2, sMaxV].map(v => Math.round(v * 10) / 10)
                return (
                  <div key={key}>
                    <div className="text-caption font-bold mb-1" style={{ color }}>{label}</div>
                    <div className="overflow-x-auto">
                      <svg width={Math.max(W, n * 28)} height={sH} style={{ display:'block' }}>
                        {sTicks.map((t, ti) => (
                          <g key={ti}>
                            <text x={sPadL-5} y={spy(t)+4} textAnchor="end" fill="rgba(139,148,158,0.7)" fontSize="11" fontFamily="JetBrains Mono, monospace">{t.toFixed(1)}</text>
                            <line x1={sPadL} y1={spy(t)} x2={W-sPadR} y2={spy(t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
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
                            <text key={idx} x={L.x} y={sH-4} textAnchor="middle" fill="rgba(139,148,158,0.6)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                              {String(L.m).padStart(2,'0')}
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
                          const vx = cx, vy = cy - 18
                          const isLate = r.timing === 'late'
                          return (
                            <g key={i}>
                              <circle cx={cx} cy={cy} r={3}
                                fill={isLate ? color : 'var(--surface-raised)'}
                                stroke={color} strokeWidth={isLate ? 0 : 1.5}
                              />
                              <text x={vx} y={vy} textAnchor="middle" dominantBaseline="central"
                                transform={`rotate(-90, ${vx.toFixed(1)}, ${vy.toFixed(1)})`}
                                fontSize="11" fill={color} fontFamily="JetBrains Mono, monospace" opacity={0.9}>
                                {(r[key] ?? 0).toFixed(1)}
                              </text>
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
            <div className="mt-3.5 rounded-md border border-border-default overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_1fr_1fr] bg-surface-sunken px-2.5 py-1.5">
                {['월','1차압','2차압','세팅압'].map(h => (
                  <div key={h} className="text-caption font-bold text-text-tertiary text-center">{h}</div>
                ))}
              </div>
              {[...hist].reverse().slice(0,12).map((r: any) => (
                <div key={`${r.year}-${r.month}`} className="grid grid-cols-[60px_1fr_1fr_1fr] px-2.5 py-1.5 border-t border-border-default">
                  <div className="text-caption text-text-tertiary text-center font-mono">{r.year}-{String(r.month).padStart(2,'0')}</div>
                  {[r.pressure_1, r.pressure_2, r.pressure_set].map((v: number, i: number) => (
                    <div key={i} className="text-caption font-bold text-center font-mono" style={{ color: ['#3b82f6','#f97316','#22c55e'][i] }}>
                      {v != null ? v.toFixed(1) : '-'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function DivInspectModal({ onClose, onSaveRecord, initialLocationNo, monthRecords, scheduleItems, lockToPoint }: {
  onClose: () => void
  onSaveRecord: (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
  initialLocationNo?: string
  monthRecords:  Record<string, MonthRecordEntry>
  scheduleItems: ScheduleItem[]
  /** true = 탭한 개소 1곳 고정 (zone/line/지하 네비 숨김, 저장 후 다음-개소 진행 대신 onClose). 도면(FloorPlanPage) 진입용. 기본 false = 일반 점검 동작 불변. */
  lockToPoint?: boolean
}) {
  const staff = useAuthStore(s => s.staff)
  const navigate = useNavigate()
  const { getDivName } = useDivNames()

  // ── 단계 선택 ──
  // initialLocationNo = DIV_PTS의 id (예: '8-1', '-5-3')
  const initPt = initialLocationNo ? DIV_PTS.find(p => p.id === initialLocationNo) : null
  const initIsUnder = initPt ? initPt.floor < 0 : false
  // pos 1,2 = 연구동(research), pos 3 = 사무동(office)
  const initZone: DivZone|null = initPt ? (initIsUnder ? 'underground' : initPt.pos <= 2 ? 'research' : 'office') : null
  // 지상: 구역→라인(pos)→층(lineIdx) 순서
  const initLine = initPt && !initIsUnder ? initPt.pos : null
  const initLineIdx = (() => {
    if (!initLine || !initPt) return 0
    const seq = DIV_LINE_SEQ[initLine]
    return seq ? Math.max(0, seq.indexOf(initPt.floor)) : 0
  })()
  // 지하: 해당 측정점 인덱스
  const initUnderIdx = initPt && initIsUnder ? Math.max(0, DIV_UNDER_SEQ.indexOf(initPt.id)) : 0
  const [timing,       setTiming]       = useState<'early'|'late'>(new Date().getDate() <= 15 ? 'early' : 'late')
  const [zone,         setZone]         = useState<DivZone|null>(initZone)
  const [line,         setLine]         = useState<number|null>(initLine)
  const [lineIdx,      setLineIdx]      = useState(initLineIdx)
  const [underPending, setUnderPending] = useState<string[]>([...DIV_UNDER_SEQ])
  const [underPickIdx, setUnderPickIdx] = useState(initUnderIdx)

  // ── 압력 입력 (최대 9 digit boxes: 각 행 2칸 or 3칸) ──
  const [digits, setDigits] = useState<string[]>(['','','','','','','','',''])
  const dRef0 = useRef<HTMLInputElement>(null)
  const dRef1 = useRef<HTMLInputElement>(null)
  const dRef2 = useRef<HTMLInputElement>(null)
  const dRef3 = useRef<HTMLInputElement>(null)
  const dRef4 = useRef<HTMLInputElement>(null)
  const dRef5 = useRef<HTMLInputElement>(null)
  const dRef6 = useRef<HTMLInputElement>(null)
  const dRef7 = useRef<HTMLInputElement>(null)
  const dRef8 = useRef<HTMLInputElement>(null)
  const dRefs = useMemo(() => [dRef0,dRef1,dRef2,dRef3,dRef4,dRef5,dRef6,dRef7,dRef8], [])

  // ── 부가 항목 ──
  const [drain,  setDrain]  = useState<'none'|'yes'>('none')
  const [memo,   setMemo]   = useState('')
  // ── 점검 내용 카드 (i0 밸브·i1 압력상태[자동판정]·i2 압력스위치·i3 청소) ──
  const divItems: InspectionItem[] = useMemo(() => inspectionContent['DIV']?.items ?? [], [])
  const divManualIds = useMemo(() => divItems.filter(it => it.i !== 1).map(it => it.i), [divItems])
  const [faMarks,   setFaMarks]   = useState<Record<number, FaMark>>({})            // i1 미판정=무마크(거짓'정상' 방지)
  const [faChecked, setFaChecked] = useState<Set<number>>(() => new Set(divManualIds))  // 첫 진입 수동항목 전체선택
  const [compRecords, setCompRecords] = useState<any[]>([])                          // 현재 개소 컴프레셔 이력(게이트용)
  const dirtyRef = useRef(false)                                                     // 사용자 편집 여부(마크 복원 클로버 방지)
  const photo = usePhotoUpload('inspection')
  const [showCompressor, setShowCompressor] = useState(false)

  // ── 이전 기록 & 자동 판단 ──
  const [prevRecords, setPrevRecords] = useState<any[]>([])
  const [autoReason,  setAutoReason]  = useState('')
  const [saving,     setSaving]     = useState(false)
  const [done,       setDone]       = useState(false)
  const [showTrend,  setShowTrend]  = useState(false)

  // ── 현재 측정점 ──
  const currentPt = useMemo(() => {
    if (!zone) return null
    if (zone === 'underground') {
      return DIV_PTS.find(p => p.id === underPending[underPickIdx]) ?? null
    }
    if (!line) return null
    const floor = DIV_LINE_SEQ[line][lineIdx]
    return DIV_PTS.find(p => p.pos === line && p.floor === floor) ?? null
  }, [zone, line, lineIdx, underPending, underPickIdx])

  // ── 이전 기록 fetch ──
  useEffect(() => {
    if (!currentPt) { setPrevRecords([]); return }
    const token = useAuthStore.getState().token
    fetch(`/api/div/pressure?location=${currentPt.id}`, {
      headers: token ? { Authorization:`Bearer ${token}` } : {}
    })
      .then(r => r.json() as Promise<{ok:boolean; records:any[]}>)
      .then(j => {
        const t = (x: any) => x?.timing === 'late' ? 1 : 0
        const sorted = (j.records ?? []).sort((a: any, b: any) => {
          if (a.year !== b.year) return b.year - a.year
          if (a.month !== b.month) return b.month - a.month
          return t(b) - t(a)
        })
        setPrevRecords(sorted)
        // 저장 마크 복원 — 현 timing 매칭 저장기록의 line_results→faMarks. 사용자가 아직 이 개소를 편집 안 했을 때만(입력·자동판정 클로버 방지).
        if (!dirtyRef.current) {
          const now = new Date()
          const saved = sorted.find((r: any) => r.year === now.getFullYear() && r.month === now.getMonth() + 1 && (r.timing ?? 'early') === timing)
          let arr: any = saved?.line_results
          if (typeof arr === 'string') { try { arr = JSON.parse(arr) } catch { arr = null } }
          const nextMarks: Record<number, FaMark> = {}   // 저장기록 없으면 i1 무마크. 있으면 line_results 로 복원.
          if (Array.isArray(arr)) arr.forEach((v: any, i: number) => { if (v === 'normal' || v === 'caution' || v === 'bad') nextMarks[i] = v })
          setFaMarks(nextMarks)
          setFaChecked(saved ? new Set() : new Set(divManualIds))   // 신규 개소: 수동 전체선택 / 저장기록 조회: 선택 없음
        }
      })
      .catch(() => setPrevRecords([]))
  }, [currentPt?.id, timing])// eslint-disable-line

  // ── 현재 개소 컴프레셔 점검 이력 로드(저장 게이트용) ──
  const loadComp = useCallback(() => {
    if (!currentPt) { setCompRecords([]); return }
    const token = useAuthStore.getState().token
    fetch(`/api/div/comp-inspection?location=${currentPt.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.json() as Promise<{ ok: boolean; records: any[] }>)
      .then(j => setCompRecords(j.records ?? []))
      .catch(() => setCompRecords([]))
  }, [currentPt?.id])
  useEffect(() => { loadComp() }, [loadComp])

  // ── 자동 결과 판단 → 카드 i1(압력상태)에 주입 ──
  useEffect(() => {
    const p1 = parsedP1
    const p2 = parsedP2
    if (p1 === null && p2 === null) {
      // 압력 미입력 → i1 미판정. 저장기록 조회(clean)면 복원된 i1 보존, 입력 후 지운 경우(dirty)만 해제.
      setAutoReason('')
      if (dirtyRef.current) setFaMarks(m => { if (!(1 in m)) return m; const n = { ...m }; delete n[1]; return n })
      return
    }

    const prev3 = prevRecords.slice(0,3).reverse() // oldest → newest
    const reasons: string[] = []
    let level: 'normal'|'caution'|'bad' = 'normal'

    if (p1 !== null && prev3.length >= 2) {
      const series = [...prev3.map((r:any) => r.pressure_1 as number), p1]
      const t = detectDivTrend(series, true)
      if (t.level !== 'normal') {
        reasons.push(`1차압 지속 상승 (+${t.cumulative.toFixed(1)})`)
        if (t.level === 'bad' || level === 'normal') level = t.level
      }
    }
    if (p2 !== null && prev3.length >= 2) {
      const series = [...prev3.map((r:any) => r.pressure_2 as number), p2]
      const t = detectDivTrend(series, false)
      if (t.level !== 'normal') {
        reasons.push(`2차압 지속 하강 (-${t.cumulative.toFixed(1)})`)
        if (t.level === 'bad' || level === 'normal') level = t.level
      }
    }

    // autoReason = 사유 텍스트만(정상/주의/불량 단어 없이 — 카드 i1 인라인 표시용). 판정을 faMarks[1] 에 주입.
    const verdict: CheckResult = reasons.length > 0 ? level : 'normal'
    setAutoReason(reasons.length > 0 ? reasons.join(', ') : '')
    setFaMarks(m => (m[1] === verdict ? m : { ...m, 1: verdict }))
  }, [digits, prevRecords])// eslint-disable-line

  // ── 폼 초기화 ──
  const resetForm = useCallback(() => {
    dirtyRef.current = false
    setDigits(['','','','','','','','',''])
    setDrain('none')
    setFaMarks({})
    setFaChecked(new Set(divManualIds))   // 첫 진입/개소전환: 수동 항목 전체선택
    setMemo('')
    setAutoReason('')
    photo.reset()
  }, [photo, divManualIds])

  // ── 저장 ──
  const handleSave = async () => {
    if (!currentPt) return
    const p1 = parsedP1
    const p2 = parsedP2
    const p3 = parsedP3
    if (p1 === null || p2 === null || p3 === null) {
      alert('압력값을 모두 입력해주세요')
      return
    }
    setSaving(true)
    try {
      const now   = new Date()
      const token = useAuthStore.getState().token
      const hdrs  = { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) }
      const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      const photoKey = await photo.upload()
      if (photo.hasPhoto && photoKey === null) { toast.error(photoUploadFailMsg(photo.vaultBacked)); return }

      // 카드 line_results 정본 = div_pressures(경로 /api/div/pressure). i1 = 압력 자동판정, i0/i2/i3 = 수동.
      // 도면(lockToPoint) 진입도 handleSave 공유 → 이 payload 한 곳으로 양 진입 커버(FloorPlanPage 어댑터 무변경).
      const pressureRes = await fetch('/api/div/pressure', {
        method:'POST', headers: hdrs,
        body: JSON.stringify({
          location_no: currentPt.id,
          floor:       currentPt.floor,
          position:    currentPt.pos,
          year:        now.getFullYear(),
          month:       now.getMonth()+1,
          day:         now.getDate(),
          timing,
          pressure_1:  p1,
          pressure_2:  p2,
          pressure_set: p3,
          result:       faMarks[1] ?? 'normal',
          line_results: JSON.stringify(faLineResults(divItems, faMarks)),
          drain,
          memo:      memo || null,
          photo_key: photoKey ?? null,
          inspector: staff?.name ?? null,
        })
      })
      if (!pressureRes.ok) {
        let detail = ''
        try {
          const j = await pressureRes.json() as { error?: string }
          detail = j?.error ? ` (${j.error})` : ''
        } catch { /* ignore parse errors */ }
        toast.error(`압력 저장 실패${detail} — 다시 시도해주세요`)
        return
      }

      if (drain === 'yes') {
        await fetch('/api/div/logs', {
          method:'POST', headers: hdrs,
          body: JSON.stringify({ type:'drain', div_id:currentPt.id, date:today, staff_name:staff?.name })
        })
      }
      // 점검 기록 연동 — 해당 층 체크포인트에 결과 반영
      const cpId = DIV_PT_CP[currentPt.id]
      if (cpId) {
        // 자동특이사항+메모 합성은 check_records 마커에만(div_pressures.memo 는 raw memo — staging parity)
        const finalMemo = [faAutoMemo(divItems, faMarks), memo.trim()].filter(Boolean).join('\n')
        await onSaveRecord(cpId, faWorst(faMarks), finalMemo, photoKey ?? undefined).catch(() => {/* 점검 기록 실패해도 압력 저장은 유지 */})
      }

      resetForm()
      // lockToPoint(도면 진입): 다음-개소 자동진행 없이 그 개소만 기록하고 닫는다.
      if (lockToPoint) { onClose(); return }
      if (zone === 'underground') {
        const newPending = underPending.filter(id => id !== currentPt.id)
        setUnderPending(newPending)
        if (newPending.length === 0) { setDone(true); return }
        if (underPickIdx >= newPending.length) setUnderPickIdx(newPending.length - 1)
      } else {
        const seq = DIV_LINE_SEQ[line!]
        if (lineIdx < seq.length - 1) setLineIdx(lineIdx + 1)
        else setDone(true)
      }
    } finally {
      setSaving(false)
    }
  }

  // ── UI 헬퍼 ──
  const prev = prevRecords[0] ?? null
  // 각 행의 칸 수: 지난달 값 >= 9.8이면 정수부 2칸(총 3) 아니면 1칸(총 2)
  const p1Slots = prev && Number(prev.pressure_1 ?? 0) >= 9.8 ? 3 : 2
  const p2Slots = prev && Number(prev.pressure_2 ?? 0) >= 9.8 ? 3 : 2
  const p3Slots = prev && Number(prev.pressure_set ?? 0) >= 9.8 ? 3 : 2
  const p1Start = 0
  const p2Start = p1Slots
  const p3Start = p1Slots + p2Slots

  function parseRow(start: number, slots: number): number | null {
    if (slots === 3) {
      return digits[start] && digits[start+1] && digits[start+2]
        ? parseFloat(`${digits[start]}${digits[start+1]}.${digits[start+2]}`)
        : (digits[start+1] && digits[start+2] ? parseFloat(`${digits[start+1]}.${digits[start+2]}`) : null)
    }
    return digits[start] && digits[start+1] ? parseFloat(`${digits[start]}.${digits[start+1]}`) : null
  }
  const parsedP1 = parseRow(p1Start, p1Slots)
  const parsedP2 = parseRow(p2Start, p2Slots)
  const parsedP3 = parseRow(p3Start, p3Slots)

  function diffTag(cur: number|null, ref: number|null, badIfUp: boolean) {
    if (cur === null || ref === null) return null
    const d = cur - ref
    if (Math.abs(d) < 0.05) return { text:'→0.0', color:'var(--text-tertiary)' }
    const isBad = badIfUp ? d > 0 : d < 0
    return { text:`${d > 0 ? '↑' : '↓'}${Math.abs(d).toFixed(1)}`, color: isBad ? 'var(--status-warning)' : 'var(--status-safe)' }
  }

  const totalDigitSlots = p1Slots + p2Slots + p3Slots
  const handleDigit = (idx: number, val: string) => {
    const v = val.replace(/\D/g,'').slice(-1)
    const next = [...digits]; next[idx] = v; setDigits(next)
    if (v && idx < totalDigitSlots - 1) setTimeout(() => dRefs[idx+1].current?.focus(), 30)
  }
  const handleDigitKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) dRefs[idx-1].current?.focus()
  }

  const totalSteps  = zone && zone !== 'underground' && line ? DIV_LINE_SEQ[line].length : null
  const underItems  = useMemo(() => underPending.map(id => {
    const pt = DIV_PTS.find(p => p.id === id)
    return { id, label: `${pt?.floorLabel} — ${getDivName(id) || pt?.loc || ''}` }
  }), [underPending, getDivName])

  // ── 재진입 팝업 (공통 훅) ──
  const currentCpId = currentPt ? DIV_PT_CP[currentPt.id] ?? null : null
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: currentCpId,
    category:     'DIV',
    monthRecords,
    scheduleItems,
  })

  // ── 카드 파생값 ──
  const DIV_MANUAL   = divItems.filter(it => it.i !== 1)
  const faResolved   = faAllResolved(DIV_MANUAL, faMarks)   // i0/i2/i3 수동만. i1은 압력입력으로 게이팅
  const compDone = useMemo(() => {                           // 현재 개소·현재 timing 컴프레셔 저장 여부
    if (!currentPt) return false
    const now = new Date()
    return compRecords.some(r => r.year === now.getFullYear() && r.month === now.getMonth()+1 && (r.timing ?? 'early') === timing)
  }, [compRecords, currentPt, timing])
  const faAllChecked = DIV_MANUAL.length > 0 && faChecked.size === DIV_MANUAL.length
  const faAuto       = faAutoMemo(divItems, faMarks)
  const faReadonly   = !!popupState
  const divI1Reason  = faMarks[1] == null ? '압력값 입력 시 자동판정' : faMarks[1] === 'normal' ? '압력 추세 안정' : (autoReason || '압력 추세 이상')
  const toggleItem = (i: number) => { dirtyRef.current = true; setFaChecked(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n }) }
  const toggleSelectAll = () => { dirtyRef.current = true; setFaChecked(faAllChecked ? new Set<number>() : new Set(DIV_MANUAL.map(it => it.i))) }
  const applyResult = (val: CheckResult) => { if (faChecked.size === 0) return; dirtyRef.current = true; setFaMarks(p => { const n = { ...p }; faChecked.forEach(i => { n[i] = val }); return n }); setFaChecked(new Set()) }

  // ── 완료 화면 ──
  if (done) return (
    <div
      className="fixed left-0 right-0 z-[99] flex flex-col items-center justify-center gap-4 bg-surface-page"
      style={{ top:'var(--sat, 0px)', bottom: (lockToPoint ? 0 : NAV_BOTTOM) }}
    >
      <CheckCircle2 size={48} className="text-safe" />
      <div className="text-title font-bold text-text-primary">점검 완료</div>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-3 rounded-md bg-accent text-text-on-accent text-body font-bold cursor-pointer border-0"
      >
        닫기
      </button>
    </div>
  )

  return (
    <div
      className="fixed left-0 right-0 z-[99] flex flex-col overflow-hidden bg-surface-page"
      style={{ top:'var(--sat, 0px)', bottom: (lockToPoint ? 0 : NAV_BOTTOM) }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0">
        <BarChart3 size={18} className="text-text-secondary" />
        <span className="text-title font-semibold text-text-primary">DIV 점검</span>
        {currentPt && totalSteps && (
          <span className="ml-auto text-caption font-semibold text-text-tertiary">{lineIdx+1} / {totalSteps}</span>
        )}
        {currentPt && zone === 'underground' && (
          <span className="ml-auto text-caption font-semibold text-text-tertiary">{underPickIdx+1} / {underPending.length}</span>
        )}
      </div>

      {/* 월초/월말 선택 — sticky raised wrapper (zone/line 영역 통일 룰) */}
      <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
        <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">점검 구분</div>
        <div className="flex gap-2">
          {([['early','월초 점검'],['late','월말 점검']] as const).map(([t, label]) => {
            const sel = timing === t
            return (
              <button key={t}
                onClick={() => setTiming(t)}
                className={`flex-1 px-2 py-2.5 rounded-md text-label font-bold transition-colors cursor-pointer ${
                  sel
                    ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                    : 'border border-border-strong bg-surface-page text-text-secondary'
                }`}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 구역 선택 — sticky raised wrapper (lockToPoint 도면 진입 시 숨김) */}
      {!lockToPoint && (
        <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">구역 선택</div>
          <div className="flex gap-2">
            {(['research','office','underground'] as DivZone[]).map(z => {
              const sel = zone === z
              const ZIcon = ZONE_ICONS[z]
              return (
                <button key={z}
                  onClick={() => { setZone(z); setLine(null); setLineIdx(0); setUnderPending([...DIV_UNDER_SEQ]); setUnderPickIdx(0); resetForm() }}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-md text-label font-bold transition-colors cursor-pointer ${
                    sel
                      ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                      : 'border border-border-strong bg-surface-page text-text-secondary'
                  }`}>
                  {ZIcon && <ZIcon size={14} />}{z==='research' ? '연구동' : z==='office' ? '사무동' : '지하'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 라인 선택 (연구동/사무동) — sticky raised wrapper (lockToPoint 시 숨김) */}
      {!lockToPoint && zone && zone !== 'underground' && (
        <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">라인 선택</div>
          <div className="flex gap-2">
            {(zone === 'research' ? [1,2] : [3]).map(l => {
              const sel = line === l
              return (
                <button key={l}
                  onClick={() => { setLine(l); setLineIdx(0); resetForm() }}
                  className={`flex-1 px-2 py-2.5 rounded-md text-label font-bold transition-colors cursor-pointer ${
                    sel
                      ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                      : 'border border-border-strong bg-surface-page text-text-secondary'
                  }`}>
                  DIV #{l}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 본문 (결과~특이사항 서브영역에 재진입 팝업 축소 — 압력입력·카드는 재진입 시에도 노출) */}
      <div className="relative flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {/* 점검 폼 */}
        {currentPt && (
          <>
            {/* 개소 정보 + 이전/다음 네비 */}
            {(() => {
              const seq = zone !== 'underground' && line ? DIV_LINE_SEQ[line] : null
              const canPrev = zone === 'underground' ? underPickIdx > 0 : lineIdx > 0
              const canNext = zone === 'underground'
                ? underPickIdx < underPending.length - 1
                : seq ? lineIdx < seq.length - 1 : false
              const goPrev = () => {
                if (zone === 'underground') { setUnderPickIdx(i => i - 1) } else { setLineIdx(i => i - 1) }
                resetForm()
              }
              const goNext = () => {
                if (zone === 'underground') { setUnderPickIdx(i => i + 1) } else { setLineIdx(i => i + 1) }
                resetForm()
              }
              const navBtnCls = (enabled: boolean) =>
                `w-9 h-9 rounded-sm border border-border-default bg-surface-page inline-flex items-center justify-center flex-shrink-0 transition-opacity ${
                  enabled ? 'text-text-primary opacity-100 cursor-pointer' : 'text-text-tertiary opacity-30 cursor-default'
                }`
              return (
                <div
                  className="bg-surface-raised rounded-md px-3 py-2.5 border border-border-default flex items-center gap-2.5 [touch-action:pan-y]"
                  onTouchStart={e => { (e.currentTarget as any)._swX = e.touches[0].clientX }}
                  onTouchEnd={e => {
                    if (lockToPoint) return
                    const sx = (e.currentTarget as any)._swX
                    if (sx == null) return
                    const dx = e.changedTouches[0].clientX - sx
                    if (dx > 40 && canPrev) goPrev()
                    else if (dx < -40 && canNext) goNext()
                  }}
                >
                  {!lockToPoint && (
                    <button className={navBtnCls(canPrev)} onClick={canPrev ? goPrev : undefined}>
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div className="flex-1 text-center">
                    <div className="text-caption text-text-tertiary font-semibold">현재 개소</div>
                    <div className="text-body-sm font-bold text-text-primary mt-0.5">{currentPt.floorLabel} — DIV #{currentPt.pos}</div>
                    <div className="text-caption text-text-secondary mt-0.5">{getDivName(currentPt.id) || currentPt.loc}</div>
                  </div>
                  {!lockToPoint && (
                    <button className={navBtnCls(canNext)} onClick={canNext ? goNext : undefined}>
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              )
            })()}

            {/* 압력 입력 */}
            {(() => {
              const prevMonthLabel = prev
                ? `${prev.month}월${prev.timing === 'late' ? '말' : prev.timing === 'early' ? '초' : ''}`
                : null
              const P_COLORS = ['#3b82f6', '#f97316', '#22c55e']
              const rows = [
                { label:'1차압', dIdx:p1Start, slots:p1Slots, prevVal: prev?.pressure_1   ?? null, diff:diffTag(parsedP1, prev?.pressure_1   ?? null, true),  color: P_COLORS[0] },
                { label:'2차압', dIdx:p2Start, slots:p2Slots, prevVal: prev?.pressure_2   ?? null, diff:diffTag(parsedP2, prev?.pressure_2   ?? null, false), color: P_COLORS[1] },
                { label:'세팅압', dIdx:p3Start, slots:p3Slots, prevVal: prev?.pressure_set ?? null, diff:diffTag(parsedP3, prev?.pressure_set ?? null, false), color: P_COLORS[2] },
              ]
              return (
                <div className="bg-surface-raised rounded-md p-3.5 border border-border-default">
                  {/* 섹션 헤더 */}
                  <div className="flex items-center mb-3">
                    <span className="text-caption font-semibold text-text-tertiary flex-1">압력 입력</span>
                    {currentPt && (
                      <button onClick={() => setShowTrend(true)}
                        className="px-2.5 py-1 rounded-sm border border-border-default bg-surface-page text-text-tertiary text-caption font-semibold cursor-pointer inline-flex items-center gap-1">
                        <TrendingUp size={12} /> 트렌드
                      </button>
                    )}
                  </div>
                  {/* 컬럼 헤더: [라벨42] [직전 flex:1] [변화 flex:1] [현재 flex:1] */}
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-[42px] flex-shrink-0" />
                    <div className="flex-1 text-center text-caption font-semibold text-text-tertiary">{prevMonthLabel ?? '직전'}</div>
                    <div className="flex-1" />
                    <div className="flex-1 text-center text-caption font-semibold text-text-tertiary">현재</div>
                  </div>
                  {/* 압력 행: [라벨42] [직전 flex:1] [변화 flex:1] [입력 flex:1] — 균등 배분 */}
                  {rows.map(({ label, dIdx, slots, prevVal, diff, color }) => (
                    <div key={label} className="flex items-center gap-1 mb-2.5">
                      {/* 라벨 */}
                      <div className="w-[42px] flex-shrink-0 text-caption font-semibold text-text-tertiary">{label}</div>
                      {/* 직전값 — flex:1, 소수점 중앙 고정 (빨간선) */}
                      <div className="flex-1 flex justify-center items-baseline">
                        {prevVal !== null ? (
                          <>
                            <span className="inline-block w-4 font-mono text-[20px] font-bold text-text-tertiary text-right">{String(Number(prevVal).toFixed(1)).split('.')[0]}</span>
                            <span className="font-mono text-[20px] font-bold text-text-tertiary">.</span>
                            <span className="inline-block w-[14px] font-mono text-[20px] font-bold text-text-tertiary text-left">{String(Number(prevVal).toFixed(1)).split('.')[1]}</span>
                          </>
                        ) : <span className="text-[20px] font-bold text-text-tertiary">—</span>}
                      </div>
                      {/* 변화량 — flex:1, 소수점 중앙 고정 (노란선) */}
                      <div className="flex-1 flex justify-center items-baseline">
                        {diff ? (
                          <>
                            <span className="inline-block w-5 font-mono text-caption font-extrabold text-right" style={{ color: diff.color }}>{diff.text.split('.')[0]}</span>
                            <span className="font-mono text-caption font-extrabold" style={{ color: diff.color }}>.</span>
                            <span className="inline-block w-[9px] font-mono text-caption font-extrabold text-left" style={{ color: diff.color }}>{diff.text.split('.')[1] ?? '0'}</span>
                          </>
                        ) : <span className="text-caption text-text-tertiary">—</span>}
                      </div>
                      {/* 입력 박스 — 정수 칸(slots-1개) + . + 소수 1칸 */}
                      <div className="flex-1 flex justify-center items-center gap-0.5">
                        {Array.from({ length: slots - 1 }, (_, i) => (
                          <input key={i} ref={dRefs[dIdx + i]} type="text" inputMode="decimal" pattern="[0-9]*" value={digits[dIdx + i]} maxLength={1}
                            onChange={e => handleDigit(dIdx + i, e.target.value)}
                            onKeyDown={e => handleDigitKey(dIdx + i, e)}
                            className="w-[34px] h-[42px] text-center text-[20px] font-bold rounded-sm bg-surface-page outline-none flex-shrink-0"
                            style={{ border: '2px solid ' + (digits[dIdx + i] ? color : 'var(--border-default)'), color }} />
                        ))}
                        <span className="text-[18px] font-bold flex-shrink-0" style={{ color }}>.</span>
                        <input ref={dRefs[dIdx + slots - 1]} type="text" inputMode="decimal" pattern="[0-9]*" value={digits[dIdx + slots - 1]} maxLength={1}
                          onChange={e => handleDigit(dIdx + slots - 1, e.target.value)}
                          onKeyDown={e => handleDigitKey(dIdx + slots - 1, e)}
                          className="w-[34px] h-[42px] text-center text-[20px] font-bold rounded-sm bg-surface-page outline-none flex-shrink-0"
                          style={{ border: '2px solid ' + (digits[dIdx + slots - 1] ? color : 'var(--border-default)'), color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* 배수 / 컴프 점검 */}
            <div className="flex gap-2.5">
              <div className="flex-1">
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">배수</div>
                <div className="flex gap-1.5">
                  <button onClick={() => setDrain('none')}
                    className={`flex-1 px-2 py-2 rounded-sm text-label font-bold cursor-pointer ${
                      drain==='none'
                        ? 'border-[1.5px] border-accent bg-surface-page text-text-primary'
                        : 'border border-border-strong bg-surface-sunken text-text-tertiary'
                    }`}>
                    없음
                  </button>
                  <button onClick={() => setDrain('yes')}
                    className={`flex-1 px-2 py-2 rounded-sm text-label font-bold cursor-pointer ${
                      drain==='yes'
                        ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,.18)] text-accent'
                        : 'border border-border-strong bg-surface-sunken text-text-tertiary'
                    }`}>
                    있음
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">컴프 점검</div>
                <button onClick={() => setShowCompressor(true)}
                  className={`w-full px-2.5 py-2 rounded-sm text-label font-bold cursor-pointer border inline-flex items-center justify-center gap-1.5 ${
                    compDone ? 'border-safe-bar/40 bg-safe-bg/40 text-safe' : 'border-border-default bg-surface-active text-text-primary'
                  }`}>
                  {compDone
                    ? <><Check size={14} className="text-safe" />컴프레셔 점검 완료</>
                    : <><Wind size={14} className="text-text-secondary" />컴프레셔 점검 →</>}
                </button>
              </div>
            </div>

            {/* 점검 내용 카드 — i1 압력상태 = 자동판정(체크박스 잠금·인라인 사유). 재진입 시에도 조회. */}
            <FamilyACard
              category="DIV"
              items={divItems}
              marks={faMarks}
              checked={faChecked}
              readonly={faReadonly}
              allChecked={faAllChecked}
              onSelectAll={toggleSelectAll}
              onToggleCheck={toggleItem}
              autoItems={{ 1: divI1Reason }}
            />

            {/* 점검 결과 ~ 특이사항 (재진입 팝업이 이 서브영역만 덮음) */}
            <div className="relative">
              {popupState && (
                <InspectionRevisitPopup
                  variant={popupState.variant}
                  checkedAt={popupState.checkedAt}
                  inspectorName={popupState.inspectorName}
                  recordId={popupState.recordId}
                  onClose={dismiss}
                  onGoToRemediation={(recordId) => { dismiss(); navigate('/remediation/' + recordId) }}
                />
              )}

              {/* 결과 버튼 — 체크된 항목(밸브/압력스위치/청소)에 적용 */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-caption font-semibold text-text-tertiary tracking-wider">점검 결과</span>
                  <span className="text-caption text-text-tertiary">· 선택 {faChecked.size}개</span>
                </div>
                <div className="flex gap-1.5">
                  {INSPECT_RESULT_OPTIONS.map(opt => {
                    const RIcon = RESULT_ICONS[opt.value]
                    const activeCls = opt.value === 'normal'  ? 'border-2 border-safe-bar bg-safe-bg text-safe'
                                    : opt.value === 'caution' ? 'border-2 border-warning-bar bg-warning-bg text-warning'
                                    :                            'border-2 border-danger-bar bg-danger-bg text-danger'
                    const disabled = faChecked.size === 0 || faReadonly
                    return (
                      <button key={opt.value} onClick={() => applyResult(opt.value)} disabled={disabled}
                              className={`flex-1 flex flex-col items-center gap-1 px-1 py-2.5 rounded-md transition-colors ${
                                disabled ? 'border border-border-default bg-surface-raised text-text-tertiary opacity-50 cursor-default' : `${activeCls} cursor-pointer`
                              }`}>
                        {RIcon ? <RIcon size={20} /> : null}
                        <span className="text-caption font-bold">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 특이사항(자동 + 수동 합성) + 사진 */}
              <div className="mt-2.5 flex gap-2.5 items-start">
                <textarea
                  value={[faAuto, memo].filter(Boolean).join('\n')}
                  onChange={e => { const v = e.target.value; setMemo(faAuto && v.startsWith(faAuto) ? v.slice(faAuto.length).replace(/^\n/, '') : v) }}
                  placeholder="특이사항 (선택)"
                  className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none outline-none box-border font-sans placeholder:text-text-tertiary" />
                <PhotoButton hook={photo} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 바 — 닫기 항상, 저장은 개소 선택 후 */}
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0" style={{ paddingBottom: lockToPoint ? 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' : undefined }}>
        <button onClick={onClose} className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer">닫기</button>
        {currentPt && (() => {
          const pressureMissing = digits.slice(0, totalDigitSlots).some(d => d === '')
          const blocked = saving || faReadonly || !faResolved || pressureMissing || !compDone
          return (
            <button onClick={handleSave} disabled={blocked}
              className="flex-1 py-3.5 rounded-md text-body font-bold border-0"
              style={{
                background: blocked ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
                color:      blocked ? 'var(--text-tertiary)' : '#fff',
                cursor:     blocked ? 'default' : 'pointer',
              }}>
              {saving ? '저장 중...'
                : lockToPoint ? '저장'
                : (!pressureMissing && !faResolved) ? '전 항목 결과 입력 필요'
                : (!pressureMissing && faResolved && !compDone) ? '컴프레셔 점검 필요'
                : zone === 'underground'
                  ? (underPickIdx < underPending.length-1 ? '저장 후 다음 개소' : '저장 (완료)')
                  : (lineIdx < DIV_LINE_SEQ[line!].length-1 ? '저장 후 다음 층' : '저장 (완료)')}
            </button>
          )
        })()}
      </div>

      {/* 트렌드 서브뷰 (폼 상태 유지, 오버레이) */}
      {showTrend && currentPt && (
        <DivTrendSubview
          point={currentPt}
          records={[...prevRecords].sort((a: any, b: any) => {
            if (a.year !== b.year) return a.year - b.year
            if (a.month !== b.month) return a.month - b.month
            const t = (x: any) => x?.timing === 'late' ? 1 : 0
            return t(a) - t(b)
          })}
          onClose={() => setShowTrend(false)}
          lockToPoint={lockToPoint}
        />
      )}

      {/* 컴프레셔 점검 서브뷰 (DIV에서 호출) */}
      {showCompressor && currentPt && (
        <CompressorModal
          onClose={() => setShowCompressor(false)}
          onSaveRecord={onSaveRecord}
          onSaved={loadComp}
          initialLocationNo={currentPt.id}
          mode="from-div"
          timing={timing}
          monthRecords={monthRecords}
          scheduleItems={scheduleItems}
          lockToPoint={lockToPoint}
        />
      )}
    </div>
  )
}

// ── 컴프레셔 점검 모달 ──────────────────────────────────
export function CompressorModal({ onClose, onSaveRecord, onSaved, initialLocationNo, mode = 'standalone', timing, monthRecords, scheduleItems, lockToPoint }: {
  onClose: () => void
  onSaveRecord: (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
  onSaved?: () => void   // 저장 성공 후 콜백(DIV 게이트 compDone 재조회)
  initialLocationNo?: string
  mode?: 'standalone' | 'from-div'
  timing?: 'early' | 'late'   // from-div: DIV 선택 주기 전달. standalone: 오늘 날짜로 파생
  monthRecords:  Record<string, MonthRecordEntry>
  scheduleItems: ScheduleItem[]
  lockToPoint?: boolean   // 도면 진입(DivInspectModal lockToPoint 에서 호출) 시 full-screen
}) {
  const staff = useAuthStore(s => s.staff)
  const photo = usePhotoUpload('inspection')
  const navigate = useNavigate()
  const { getDivName } = useDivNames()

  const initPt = initialLocationNo ? DIV_PTS.find(p => p.id === initialLocationNo) : null
  const initIsUnder = initPt ? initPt.floor < 0 : false
  const initZone: DivZone|null = initPt ? (initIsUnder ? 'underground' : initPt.pos <= 2 ? 'research' : 'office') : null
  const initLine = initPt && !initIsUnder ? initPt.pos : null
  const initLineIdx = (() => {
    if (!initLine || !initPt) return 0
    const seq = DIV_LINE_SEQ[initLine]
    return seq ? Math.max(0, seq.indexOf(initPt.floor)) : 0
  })()
  const initUnderIdx = initPt && initIsUnder ? Math.max(0, DIV_UNDER_SEQ.indexOf(initPt.id)) : 0

  const [zone,         setZone]         = useState<DivZone|null>(initZone)
  const [line,         setLine]         = useState<number|null>(initLine)
  const [lineIdx,      setLineIdx]      = useState(initLineIdx)
  const [underPending, setUnderPending] = useState<string[]>([...DIV_UNDER_SEQ])
  const [underPickIdx, setUnderPickIdx] = useState(initUnderIdx)

  const [tankDrain, setTankDrain] = useState<'none'|'yes'>('none')
  const [oil,       setOil]       = useState<'sufficient'|'refill'>('sufficient')
  const [result,    setResult]    = useState<CheckResult>('normal')
  const [memo,      setMemo]      = useState('')
  const [saving,    setSaving]    = useState(false)
  const [done,      setDone]      = useState(false)

  const [lastDrain, setLastDrain] = useState<string|null>(null)
  const [prevInspections, setPrevInspections] = useState<any[]>([])
  // from-div 는 DIV 선택 주기, standalone 은 오늘 날짜(1~15 early / 16~말 late)
  const effTiming: 'early' | 'late' = timing ?? (new Date().getDate() <= 15 ? 'early' : 'late')

  const currentPt = useMemo(() => {
    if (!zone) return null
    if (zone === 'underground') return DIV_PTS.find(p => p.id === underPending[underPickIdx]) ?? null
    if (!line) return null
    const floor = DIV_LINE_SEQ[line][lineIdx]
    return DIV_PTS.find(p => p.pos === line && p.floor === floor) ?? null
  }, [zone, line, lineIdx, underPending, underPickIdx])

  useEffect(() => {
    if (!currentPt) { setLastDrain(null); return }
    const token = useAuthStore.getState().token
    fetch(`/api/div/logs?type=comp_drain&divId=${currentPt.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.json() as Promise<{ ok: boolean; logs: any[] }>)
      .then(j => { const logs = j.logs ?? []; setLastDrain(logs.length > 0 ? logs[0].drained_at : null) })
      .catch(() => setLastDrain(null))
  }, [currentPt?.id])

  // 현재 개소의 comp_inspections 이력 로드 (이미 점검 여부 판정용)
  useEffect(() => {
    if (!currentPt) { setPrevInspections([]); return }
    const token = useAuthStore.getState().token
    fetch(`/api/div/comp-inspection?location=${currentPt.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.json() as Promise<{ ok: boolean; records: any[] }>)
      .then(j => setPrevInspections(j.records ?? []))
      .catch(() => setPrevInspections([]))
  }, [currentPt?.id])

  // 재진입 팝업 (공통 훅)
  const currentCpId = currentPt ? COMP_PT_CP[currentPt.id] ?? null : null
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: currentCpId,
    category:     '컴프레셔',
    monthRecords,
    scheduleItems,
  })

  const drainDPlus = useMemo(() => {
    if (!lastDrain) return null
    return Math.floor((new Date().getTime() - new Date(lastDrain).getTime()) / 86400000)
  }, [lastDrain])

  const resetForm = useCallback(() => {
    setTankDrain('none'); setOil('sufficient'); setResult('normal'); setMemo(''); photo.reset()
  }, [photo])

  const totalSteps = zone && zone !== 'underground' && line ? DIV_LINE_SEQ[line].length : null

  const handleSave = async () => {
    if (!currentPt) return
    setSaving(true)
    try {
      const now   = new Date()
      const token = useAuthStore.getState().token
      const hdrs  = { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) }
      const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      const photoKey = await photo.upload()
      if (photo.hasPhoto && photoKey === null) { toast.error(photoUploadFailMsg(photo.vaultBacked)); return }

      await fetch('/api/div/comp-inspection', {
        method:'POST', headers: hdrs,
        body: JSON.stringify({
          location_no: currentPt.id, floor: currentPt.floor, position: currentPt.pos,
          year: now.getFullYear(), month: now.getMonth()+1, day: now.getDate(), timing: effTiming,
          tank_drain: tankDrain, oil, result, memo: memo || null, photo_key: photoKey ?? null, inspector: staff?.name ?? null,
        })
      })

      if (tankDrain === 'yes') {
        await fetch('/api/div/logs', { method:'POST', headers: hdrs, body: JSON.stringify({ type:'comp_drain', div_id:currentPt.id, date:today, staff_name:staff?.name }) })
      }
      if (oil === 'refill') {
        await fetch('/api/div/logs', { method:'POST', headers: hdrs, body: JSON.stringify({ type:'compressor', div_id:currentPt.id, date:today, action:'오일보충', staff_name:staff?.name }) })
      }

      const cpId = COMP_PT_CP[currentPt.id]
      if (cpId) await onSaveRecord(cpId, result, memo || '', photoKey ?? undefined).catch(() => {})

      resetForm()
      onSaved?.()   // DIV 게이트(compDone) 재조회 트리거

      if (mode === 'from-div') { onClose(); return }

      if (zone === 'underground') {
        const newPending = underPending.filter(id => id !== currentPt.id)
        setUnderPending(newPending)
        if (newPending.length === 0) { setDone(true); return }
        if (underPickIdx >= newPending.length) setUnderPickIdx(newPending.length - 1)
      } else {
        const seq = DIV_LINE_SEQ[line!]
        if (lineIdx < seq.length - 1) setLineIdx(lineIdx + 1)
        else setDone(true)
      }
    } finally { setSaving(false) }
  }

  if (done) return (
    <div
      className="fixed left-0 right-0 flex flex-col items-center justify-center gap-4 bg-surface-page"
      style={{ top:'var(--sat, 0px)', bottom: (lockToPoint ? 0 : NAV_BOTTOM), zIndex: mode === 'from-div' ? 120 : 99 }}
    >
      <CheckCircle2 size={48} className="text-safe" />
      <div className="text-title font-bold text-text-primary">점검 완료</div>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-3 rounded-md bg-accent text-text-on-accent text-body font-bold cursor-pointer border-0"
      >
        닫기
      </button>
    </div>
  )

  return (
    <div
      className="fixed left-0 right-0 flex flex-col overflow-hidden bg-surface-page"
      style={{ top:'var(--sat, 0px)', bottom: (lockToPoint ? 0 : NAV_BOTTOM), zIndex: mode === 'from-div' ? 120 : 99 }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0">
        <Wind size={18} className="text-text-secondary" />
        <span className="text-title font-semibold text-text-primary">컴프레셔 점검</span>
        {mode !== 'from-div' && currentPt && totalSteps && (
          <span className="ml-auto text-caption font-semibold text-text-tertiary">{lineIdx+1} / {totalSteps}</span>
        )}
        {mode !== 'from-div' && currentPt && zone === 'underground' && (
          <span className="ml-auto text-caption font-semibold text-text-tertiary">{underPickIdx+1} / {underPending.length}</span>
        )}
      </div>

      {/* from-div 모드가 아닐 때만 구역/라인 선택 표시 — sticky raised wrapper (zone/line 영역 통일 룰) */}
      {mode !== 'from-div' && (
        <>
          {/* 구역 선택 */}
          <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
            <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">구역 선택</div>
            <div className="flex gap-2">
              {(['research','office','underground'] as DivZone[]).map(z => {
                const sel = zone === z
                const ZIcon = ZONE_ICONS[z]
                return (
                  <button key={z}
                    onClick={() => { setZone(z); setLine(null); setLineIdx(0); setUnderPending([...DIV_UNDER_SEQ]); setUnderPickIdx(0); resetForm() }}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-md text-label font-bold transition-colors cursor-pointer ${
                      sel
                        ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                        : 'border border-border-strong bg-surface-page text-text-secondary'
                    }`}>
                    {ZIcon && <ZIcon size={14} />}{z==='research' ? '연구동' : z==='office' ? '사무동' : '지하'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 라인 선택 (연구동/사무동) */}
          {zone && zone !== 'underground' && (
            <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
              <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">라인 선택</div>
              <div className="flex gap-2">
                {(zone === 'research' ? [1,2] : [3]).map(l => {
                  const sel = line === l
                  return (
                    <button key={l}
                      onClick={() => { setLine(l); setLineIdx(0); resetForm() }}
                      className={`flex-1 px-2 py-2.5 rounded-md text-label font-bold transition-colors cursor-pointer ${
                        sel
                          ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                          : 'border border-border-strong bg-surface-page text-text-secondary'
                      }`}>
                      컴프 #{l}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {/* 점검 폼 영역 — 개소 네비 카드는 항상 표시, 재진입 팝업은 입력 폼만 덮음 */}
        {currentPt && (
          <div className="flex flex-col gap-3.5">
            {/* 개소 정보 + 이전/다음 네비 (standalone만) — 팝업에 안 덮임 */}
            {mode !== 'from-div' && (() => {
              const seq = zone !== 'underground' && line ? DIV_LINE_SEQ[line] : null
              const canPrev = zone === 'underground' ? underPickIdx > 0 : lineIdx > 0
              const canNext = zone === 'underground' ? underPickIdx < underPending.length - 1 : seq ? lineIdx < seq.length - 1 : false
              const goPrev = () => { if (zone === 'underground') setUnderPickIdx(i => i - 1); else setLineIdx(i => i - 1); resetForm() }
              const goNext = () => { if (zone === 'underground') setUnderPickIdx(i => i + 1); else setLineIdx(i => i + 1); resetForm() }
              const navBtnCls = (enabled: boolean) =>
                `w-9 h-9 rounded-sm border border-border-default bg-surface-page inline-flex items-center justify-center flex-shrink-0 transition-opacity ${
                  enabled ? 'text-text-primary opacity-100 cursor-pointer' : 'text-text-tertiary opacity-30 cursor-default'
                }`
              return (
                <div
                  className="bg-surface-raised rounded-md px-3 py-2.5 border border-border-default flex items-center gap-2.5 [touch-action:pan-y]"
                  onTouchStart={e => { (e.currentTarget as any)._swX = e.touches[0].clientX }}
                  onTouchEnd={e => { const sx = (e.currentTarget as any)._swX; if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (dx > 40 && canPrev) goPrev(); else if (dx < -40 && canNext) goNext() }}
                >
                  <button className={navBtnCls(canPrev)} onClick={canPrev ? goPrev : undefined}>
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-caption text-text-tertiary font-semibold">현재 개소</div>
                    <div className="text-body-sm font-bold text-text-primary mt-0.5">{currentPt.floorLabel} — 컴프 #{currentPt.pos}</div>
                    <div className="text-caption text-text-secondary mt-0.5">{getDivName(currentPt.id) || currentPt.loc}</div>
                  </div>
                  <button className={navBtnCls(canNext)} onClick={canNext ? goNext : undefined}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              )
            })()}

            {/* from-div: 간단한 개소 정보 — 팝업에 안 덮임 */}
            {mode === 'from-div' && (
              <div className="bg-surface-raised rounded-md px-3 py-2.5 border border-border-default text-center">
                <div className="text-caption text-text-tertiary font-semibold">현재 개소</div>
                <div className="text-body-sm font-bold text-text-primary mt-0.5">{currentPt.floorLabel} — 컴프 #{currentPt.pos}</div>
                <div className="text-caption text-text-secondary mt-0.5">{getDivName(currentPt.id) || currentPt.loc}</div>
              </div>
            )}

            {/* 입력 폼 서브 컨테이너 — 재진입 팝업 부분 오버레이의 부모 (position:relative)
                H2 (260423-htx Task 5): 팝업이 '현재 개소' 네비 카드를 가리지 않고
                입력 폼(탱크배수/오일/결과/특이사항) 영역만 덮도록 부모 범위를 축소. */}
            <div className="relative flex flex-col gap-3.5">
              {popupState && (
                <InspectionRevisitPopup
                  variant={popupState.variant}
                  checkedAt={popupState.checkedAt}
                  inspectorName={popupState.inspectorName}
                  recordId={popupState.recordId}
                  onClose={dismiss}
                  onGoToRemediation={(recordId) => { dismiss(); navigate('/remediation/' + recordId) }}
                />
              )}

              {/* 탱크 배수 / 컴프 오일 */}
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <div className="text-caption font-semibold text-text-tertiary mb-2 flex items-center gap-1.5">
                    탱크 배수
                    {drainDPlus !== null && (
                      <span className={`text-caption font-bold px-1.5 py-0 rounded-[4px] ${
                        drainDPlus > 60 ? 'text-warning bg-warning-bg' : 'text-text-tertiary bg-surface-sunken'
                      }`}>D+{drainDPlus}</span>
                    )}
                    {drainDPlus === null && <span className="text-caption text-text-tertiary opacity-50">기록 없음</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setTankDrain('none')}
                      className={`flex-1 px-2 py-2 rounded-sm text-label font-bold cursor-pointer ${
                        tankDrain==='none'
                          ? 'border-[1.5px] border-accent bg-surface-page text-text-primary'
                          : 'border border-border-strong bg-surface-sunken text-text-tertiary'
                      }`}>
                      없음
                    </button>
                    <button onClick={() => setTankDrain('yes')}
                      className={`flex-1 px-2 py-2 rounded-sm text-label font-bold cursor-pointer ${
                        tankDrain==='yes'
                          ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,.18)] text-accent'
                          : 'border border-border-strong bg-surface-sunken text-text-tertiary'
                      }`}>
                      있음
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">컴프 오일</div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setOil('sufficient')}
                      className={`flex-1 px-2 py-2 rounded-sm text-label font-bold cursor-pointer ${
                        oil==='sufficient'
                          ? 'border-[1.5px] border-accent bg-surface-page text-text-primary'
                          : 'border border-border-strong bg-surface-sunken text-text-tertiary'
                      }`}>
                      충분함
                    </button>
                    <button onClick={() => setOil('refill')}
                      className={`flex-1 px-2 py-2 rounded-sm text-label font-bold cursor-pointer ${
                        oil==='refill'
                          ? 'border-[1.5px] border-warning-bar bg-warning-bg text-warning'
                          : 'border border-border-strong bg-surface-sunken text-text-tertiary'
                      }`}>
                      보충함
                    </button>
                  </div>
                </div>
              </div>

              {/* 점검 결과 */}
              <div>
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">점검 결과</div>
                <div className="flex gap-2">
                  {(['normal','caution','bad'] as const).map(r => {
                    const active = result === r
                    const inactiveCls = 'border-border-default bg-surface-sunken text-text-secondary'
                    const activeCls =
                      r === 'normal' ? 'border-safe-bar bg-safe-bg text-safe' :
                      r === 'caution' ? 'border-warning-bar bg-warning-bg text-warning' :
                      'border-danger-bar bg-danger-bg text-danger'
                    const Icon = r === 'normal' ? CheckCircle2 : r === 'caution' ? AlertTriangle : XCircle
                    const label = r === 'normal' ? '정상' : r === 'caution' ? '주의' : '불량'
                    return (
                      <button key={r} onClick={() => setResult(r)}
                        className={`flex-1 px-3 py-2.5 rounded-pill border-[1.5px] inline-flex items-center justify-center gap-1.5 text-label font-semibold transition-colors cursor-pointer ${active ? activeCls : inactiveCls}`}>
                        <Icon size={16} color="currentColor" />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 특이사항 + 사진 */}
              <div className="flex gap-2.5 items-start">
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항 (선택)"
                  className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none outline-none box-border font-sans placeholder:text-text-tertiary" />
                <PhotoButton hook={photo} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 바 */}
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0" style={{ paddingBottom: lockToPoint ? 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' : undefined }}>
        <button onClick={onClose} className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer">닫기</button>
        {currentPt && (
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3.5 rounded-md text-text-on-accent text-body font-bold border-0"
            style={{
              background: saving ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
              cursor: saving ? 'default' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(37,99,235,0.35)'
            }}>
            {saving ? '저장 중...' :
              mode === 'from-div' ? '저장 후 닫기' :
              zone === 'underground'
                ? (underPickIdx < underPending.length-1 ? '저장 후 다음 개소' : '저장 (완료)')
                : (lineIdx < DIV_LINE_SEQ[line!].length-1 ? '저장 후 다음 층' : '저장 (완료)')}
          </button>
        )}
      </div>
    </div>
  )
}
