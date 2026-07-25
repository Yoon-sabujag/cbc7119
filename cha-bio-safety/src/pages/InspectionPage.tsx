import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inspectionApi, fireAlarmApi, extinguisherApi, remediationApi, scheduleApi, floorPlanMarkerApi, panelApi, alarmApi, type ExtinguisherDetail, type FloorPlanMarker, type Alarm } from '../utils/api'
import LivePanelImage from '../components/panel/LivePanelImage'
import { freshnessLabel } from '../components/panel/freshness'
import { usePinchZoom } from '../hooks/usePinchZoom'
import toast from 'react-hot-toast'
import type { CheckPoint, CheckResult, Floor } from '../types'
import { usePhotoUpload, photoUploadFailMsg } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
import { PanelEventRow } from '../components/PanelEventRow'
import { useRecentPanelEvents } from '../utils/panelEvents'
import { FireAlarmHistoryView } from './FireAlarmHistoryPage'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { fmtKstLocaleString, fmtKstDate, fmtKstDateTime, todayKstYmd } from '../utils/datetime'
import { DIV_POINTS as DIV_PTS, type DivPoint as DivPt } from '../constants/divPoints'
import { useDivNames } from '../hooks/useDivNames'
import { InspectionRevisitPopup } from '../components/InspectionRevisitPopup'
import { DivInspectModal, CompressorModal } from '../components/div/DivInspectModal'
import { AccessBlockedPopup } from '../components/AccessBlockedPopup'
import { useInspectionRevisitPopup, type MonthRecordEntry } from '../hooks/useInspectionRevisitPopup'
import type { ScheduleItem } from '../types'
import { computeCardCompletion } from '../utils/inspectionProgress'
import { getReplaceWarning } from '../utils/extinguisher'
import { CCTV_DVRS } from '../utils/cctv'
import { inspectionContent, type InspectionItem } from '../data/inspectionContent'
import { RESULT_ICONS, INSPECT_RESULT_OPTIONS, faWorst, faLineResults, faAutoMemo, faAllResolved, FamilyACard, type IconComp, type FaMark } from '../components/inspection/familyCard'
import { faAutoMemoFor, hydrantRemediationSymbol } from '../components/inspection/familyHelpers'
import {
  ChevronLeft, ChevronRight, Bell, X, TrendingUp, Flame,
  BellRing, BellOff, RefreshCw, Maximize2, Plus,  // Phase 25 화재수신반
  // 카테고리 lucide (11종)
  Cloud, Shield, Car, Zap, BarChart3, Wind, ArrowDownToLine, Waves, Video, Server,
  FlaskConical, Building2, TrainFront,
  // Zone (3종)
  // 결과 (5종)
  CheckCircle2, AlertTriangle, XCircle, Wrench, HelpCircle,
  // 라벨 / 빈상태 (1종) — 260527-gql §7.1 enforce
  ClipboardList,
  // 점검내용 카드 접기/펼치기
  ChevronDown, ChevronUp, Check,
} from 'lucide-react'
import {
  StairsIcon, ShutterIcon, ExitSignIcon, SmokeVentIcon, HoseReelIcon, FireExtinguisherCustom,
} from '../components/ui/icons'

// 완료 정의 통일 — 카드/대시보드/층별 화면 모두 동일 룰을 사용한다.
// "완료" = normal | caution | (bad + status='resolved')
// bad+open (조치 대기) 와 기록 없음은 미완료. (260426-f54)
const isCpCompleted = (entry: MonthRecordEntry | undefined): boolean =>
  entry?.result === 'normal' ||
  entry?.result === 'caution' ||
  (entry?.result === 'bad' && entry?.status === 'resolved')

const NAV_BOTTOM = 'calc(54px + env(safe-area-inset-bottom, 20px))'

// ── 층 분류 ───────────────────────────────────────────
const GROUND_LIST: Floor[] = ['8-1F','8F','7F','6F','5F','3F','2F','1F']
const UNDER_LIST:  Floor[] = ['B1','M','B2','B3','B4','B5']
const GROUND_SET   = new Set<Floor>(GROUND_LIST)
const UNDER_SET    = new Set<Floor>(UNDER_LIST)

// ── 카테고리 그룹 ──────────────────────────────────────
const CATEGORY_GROUPS: { labels:string[]; color:string; border:string; categories:string[] }[] = [
  { labels:['특별피난계단','피난·방화시설','방화문'], color:'rgba(34,197,94,.12)',  border:'rgba(34,197,94,.3)',  categories:['특별피난계단'] },
  { labels:['청정소화약제'],                         color:'rgba(14,165,233,.12)', border:'rgba(14,165,233,.3)', categories:['청정소화약제'] },
  { labels:['전실제연댐퍼','연결송수관'],              color:'rgba(100,116,139,.12)',border:'rgba(100,116,139,.3)',categories:['전실제연댐퍼','연결송수관'] },
  { labels:['주차장비','회전문'],                     color:'rgba(168,85,247,.12)', border:'rgba(168,85,247,.3)', categories:['주차장비','회전문'] },
  { labels:['소방용전원공급반'],                       color:'rgba(245,158,11,.12)', border:'rgba(245,158,11,.3)', categories:['소방용전원공급반'] },
  { labels:['방화셔터'],                              color:'rgba(239,68,68,.12)',  border:'rgba(239,68,68,.3)',  categories:['방화셔터'] },
  { labels:['DIV'],                                  color:'rgba(245,158,11,.12)', border:'rgba(245,158,11,.3)', categories:['DIV'] },
  { labels:['컴프레셔'],                              color:'rgba(100,116,139,.12)',border:'rgba(100,116,139,.3)',categories:['컴프레셔'] },
  { labels:['유도등'],                               color:'rgba(234,179,8,.12)',  border:'rgba(234,179,8,.3)',  categories:['유도등'] },
  { labels:['배연창'],                               color:'rgba(59,130,246,.12)', border:'rgba(59,130,246,.3)', categories:['배연창'] },
  { labels:['완강기'],                               color:'rgba(249,115,22,.12)', border:'rgba(249,115,22,.3)', categories:['완강기'] },
  { labels:['소화전','비상콘센트'],                    color:'rgba(59,130,246,.12)', border:'rgba(59,130,246,.3)', categories:['소화전','비상콘센트'] },
  { labels:['소화기'],                               color:'rgba(239,68,68,.12)',  border:'rgba(239,68,68,.3)',  categories:['소화기'] },
  { labels:['소방펌프'],                              color:'rgba(14,165,233,.12)', border:'rgba(14,165,233,.3)', categories:['소방펌프'] },
  { labels:['화재수신반'],                            color:'rgba(239,68,68,.12)', border:'rgba(239,68,68,.3)',  categories:['화재수신반'] },
  { labels:['CCTV'],                               color:'rgba(71,85,105,.12)',  border:'rgba(71,85,105,.3)',  categories:['CCTV'] },
]

// 16 카테고리 아이콘 컴포넌트 매핑 (§7.2). CATEGORY_GROUPS 와 동일 순서.
// 카테고리 카드 내부에서는 §6.3 룰에 따라 모두 회색 (text-text-secondary).
const CATEGORY_ICONS: IconComp[] = [
  StairsIcon,            // 0. 특별피난계단
  Cloud,                 // 1. 청정소화약제
  Shield,                // 2. 전실제연댐퍼/연결송수관
  Car,                   // 3. 주차장비/회전문
  Zap,                   // 4. 소방용전원공급반
  ShutterIcon,           // 5. 방화셔터
  BarChart3,             // 6. DIV
  Wind,                  // 7. 컴프레셔
  ExitSignIcon,          // 8. 유도등
  SmokeVentIcon,         // 9. 배연창
  ArrowDownToLine,       // 10. 완강기
  HoseReelIcon,          // 11. 소화전/비상콘센트
  FireExtinguisherCustom,// 12. 소화기
  Waves,                 // 13. 소방펌프
  Bell,                  // 14. 화재수신반
  Video,                 // 15. CCTV
]

// Zone 아이콘 매핑 — 11개 점검 모달의 zone 탭 통일용 (연구동/사무동/지하 패턴)
const ZONE_ICONS: Record<string, IconComp> = {
  research:    FlaskConical,
  office:      Building2,
  underground: TrainFront,
}

// §6.1 Progress Color Rule — 카테고리 카드 좌측 3px 색바 클래스
function getCatBarClass(total: number, doneCnt: number): string {
  if (total === 0) return ''
  const pct = (doneCnt / total) * 100
  if (pct === 0)   return 'bg-text-tertiary/40'
  if (pct < 50)    return 'bg-warning-bar'
  if (pct < 100)   return 'bg-accent'
  return 'bg-safe-bar'
}

// 카테고리 1개의 완료 집계 — 모바일 그리드/데스크톱 카드 공유 단일 경로.
// 완료 단일 진실원천(isCpCompleted)을 따르는 computeCardCompletion / 유도등 마커 /
// DIV·컴프 반월 사이클을 그대로 캡슐화한다. 드리프트 0 보장.
function computeCategoryCounts(
  g: { categories: string[] },
  ctx: {
    allCheckpoints: CheckPoint[]
    scheduleItems: ScheduleItem[]
    markerRecords: Record<string, CheckResult>
    monthRecordDates: Record<string, string[]>
    glMarkerCount: number
    today: string
  }
): { total: number; doneCnt: number } {
  const isGL = g.categories.includes('유도등')
  const cps  = ctx.allCheckpoints.filter(cp => g.categories.includes(cp.category))
  const total = isGL ? ctx.glMarkerCount : cps.length
  let doneCnt: number
  if (isGL) {
    const glSchedDone = ctx.scheduleItems.some(s =>
      s.category === 'inspect' &&
      s.inspectionCategory === '유도등' &&
      s.status === 'done'
    )
    doneCnt = glSchedDone ? total : Object.keys(ctx.markerRecords).length
  } else {
    // 260427-1dc: DIV/컴프레셔만 월 반반 분할 (1~15 / 16~말, computeCardCompletion 안에서)
    doneCnt = computeCardCompletion({ cps, monthRecordDates: ctx.monthRecordDates, today: ctx.today })
  }
  return { total, doneCnt }
}

// 오늘 현황 표시용 (모든 결과값 대응)
const ALL_RESULT_OPTIONS: { value:CheckResult; label:string; color:string; bg:string }[] = [
  ...INSPECT_RESULT_OPTIONS,
  { value:'unresolved', label:'미조치', color:'var(--fire)',  bg:'rgba(249,115,22,.13)'  },
  { value:'missing',    label:'미확인', color:'var(--t3)',    bg:'rgba(110,118,129,.13)' },
]
const RESULT_LABEL: Record<CheckResult,string> = { normal:'정상',caution:'주의',bad:'불량',unresolved:'미조치',missing:'미확인' }
const RESULT_COLOR: Record<CheckResult,string> = { normal:'var(--safe)',caution:'var(--warn)',bad:'var(--danger)',unresolved:'var(--fire)',missing:'var(--t3)' }

// ── 구역 (Zone) 유틸 ──────────────────────────────────
type ZoneKey = 'research' | 'office' | 'underground'

// `icon` 필드는 § 7.1 enforce (260527-gql) 로 제거됨 — Lucide ZONE_ICONS 매핑이 단일 진실 원천.
const ZONE_CONFIG: { key:ZoneKey; label:string }[] = [
  { key:'research',   label:'연구동' },
  { key:'office',     label:'사무동' },
  { key:'underground', label:'지하'   },
]

/** 해당 CP가 zone+구역 기준에 부합하는지 */
function matchZone(cp: CheckPoint, zone: ZoneKey): boolean {
  if (zone === 'underground') return UNDER_SET.has(cp.floor)
  if (zone === 'office')      return cp.zone === 'office' && GROUND_SET.has(cp.floor)
  // research: research zone + basement(legacy 'common') zone on ground floors — 지상층의 공용공간 자산은 연구동에 합산.
  return (cp.zone === 'research' || ((cp.zone === 'basement' || cp.zone === 'common') && GROUND_SET.has(cp.floor)))
}

function getAvailableZones(cps: CheckPoint[]): ZoneKey[] {
  return ZONE_CONFIG.map(z => z.key).filter(key => cps.some(cp => matchZone(cp, key)))
}

function getFloorsByZone(cps: CheckPoint[], zone: ZoneKey): Floor[] {
  const floorSet = new Set(cps.filter(cp => matchZone(cp, zone)).map(cp => cp.floor))
  const list = zone === 'underground' ? UNDER_LIST : GROUND_LIST
  return list.filter(f => floorSet.has(f))
}

// ── Wheel Picker ──────────────────────────────────────
const ITEM_H = 44
const VISIBLE = 3          // 3개만 보여서 높이 절약

function WheelPicker({ items, onSelect, records }: {
  items:    CheckPoint[]
  onSelect: (idx: number) => void
  records:  Record<string, CheckResult>
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const containerH = ITEM_H * VISIBLE
  const pad        = ITEM_H * Math.floor(VISIBLE / 2)  // 44px = 1칸

  // ▶ 실제 항목 ID가 바뀔 때만 리셋 (폴링으로 새 배열 참조 생성 시 리셋 방지)
  const prevIdsRef = useRef('')
  useEffect(() => {
    const currIds = items.map(i => i.id).join(',')
    if (prevIdsRef.current !== currIds) {
      prevIdsRef.current = currIds
      setActiveIdx(0)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    }
  })

  const snapTo = useCallback((idx: number, smooth = true) => {
    scrollRef.current?.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior) })
  }, [])

  const handleScroll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!scrollRef.current) return
      const idx = Math.max(0, Math.min(Math.round(scrollRef.current.scrollTop / ITEM_H), items.length - 1))
      snapTo(idx)
      setActiveIdx(idx)
      onSelect(idx)
    }, 100)
  }, [items.length, onSelect, snapTo])

  return (
    <div className="relative rounded-md overflow-hidden bg-surface-raised border border-border-default"
         style={{ height: containerH }}>
      {/* 중앙 하이라이트 */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-info-bg/60 border-t border-b border-info-bar/30 pointer-events-none z-[2]"
           style={{ height: ITEM_H }} />
      {/* 상단 페이드 */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-[3]"
           style={{ height: pad, background: 'linear-gradient(to bottom, var(--surface-raised) 30%, transparent)' }} />
      {/* 하단 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[3]"
           style={{ height: pad, background: 'linear-gradient(to top, var(--surface-raised) 30%, transparent)' }} />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto [scroll-snap-type:y_mandatory] box-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: pad, paddingBottom: pad }}
      >
        {items.map((item, idx) => {
          const dist = Math.abs(idx - activeIdx)
          const done = records[item.id]
          const opacityClass = dist === 0 ? 'opacity-100' : dist === 1 ? 'opacity-[0.48]' : 'opacity-[0.15]'
          const doneColorCls =
            done === 'normal'     ? 'text-safe'
          : done === 'caution'    ? 'text-warning'
          : done === 'bad'        ? 'text-danger'
          : done === 'unresolved' ? 'text-fire'
          :                          'text-text-tertiary'
          return (
            <div key={item.id}
                 className={`flex items-center px-3.5 cursor-pointer [scroll-snap-align:center] transition-opacity duration-100 ${opacityClass}`}
                 style={{ height: ITEM_H }}>
              <div className={`flex-1 truncate text-text-primary ${dist === 0 ? 'text-label font-bold' : 'text-caption font-normal'}`}>
                {item.location}
              </div>
              {done && (
                <span className={`text-caption font-bold shrink-0 ml-2 ${doneColorCls}`}>
                  {RESULT_LABEL[done]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 계단실 정의 ─────────────────────────────────────────
const STAIRWELLS = [
  { id:1, label:'계단실 1', floors:['8F','7F','6F','5F','3F','2F','1F'] as Floor[],                         leftCount:4 },
  { id:2, label:'계단실 2', floors:['8F','7F','6F','5F','3F','2F','1F','B1','B2','B3','B4','B5'] as Floor[], leftCount:6 },
  { id:3, label:'계단실 3', floors:['8F','7F','6F','5F','3F','2F','1F','B1'] as Floor[],                    leftCount:4 },
  { id:4, label:'계단실 4', floors:['8F','7F','6F','5F','3F','2F','1F','B1','B2','B3','B4','B5'] as Floor[], leftCount:6 },
  { id:5, label:'계단실 5', floors:['8F','7F','6F','5F','3F','2F','1F','B1','B2','B3','B4'] as Floor[],      leftCount:6 },
]

// ── 특별피난계단 전용 모달 ───────────────────────────────
function StairwellModal({ group, allCheckpoints, records, monthRecords, scheduleItems, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string, extra?: { guide_light_type?: string; floor_plan_marker_id?: string; line_results?: string; remediation_symbol?: string }) => Promise<void>
}) {
  const photo = usePhotoUpload()
  const navigate = useNavigate()
  const strItems: InspectionItem[] = inspectionContent['특별피난계단']?.items ?? []
  const [selectedSW,    setSelectedSW]    = useState<number | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null)
  const [faMarks,       setFaMarks]       = useState<Record<number, FaMark>>({})
  const [faChecked,     setFaChecked]     = useState<Set<number>>(new Set())
  const [faReinspecting, setFaReinspecting] = useState(false)
  const [memo,          setMemo]          = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [justSaved,     setJustSaved]     = useState(false)
  const [submitError,   setSubmitError]   = useState<string | null>(null)
  const [visible,       setVisible]       = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const swDef = STAIRWELLS.find(s => s.id === selectedSW) ?? null
  const swFloors: Floor[] = swDef?.floors ?? []

  // 계단실 선택 시 첫 층 자동 선택
  useEffect(() => {
    if (selectedSW && swFloors.length > 0 && (!selectedFloor || !swFloors.includes(selectedFloor))) setSelectedFloor(swFloors[0])
  }, [selectedSW])// eslint-disable-line

  // 선택된 (계단실, 층) 의 CP — 다른 개소와 동일하게 이 CP 하나에 line_results[5] 저장.
  const selectedCp = useMemo(() =>
    (selectedSW && selectedFloor)
      ? allCheckpoints.find(cp => group.categories.includes(cp.category) && cp.locationNo === `S${selectedSW}` && cp.floor === selectedFloor) ?? null
      : null,
    [allCheckpoints, group, selectedSW, selectedFloor]
  )

  // 재진입 팝업 (선택 CP 기준)
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: selectedCp?.id ?? null,
    category:     '특별피난계단',
    monthRecords,
    scheduleItems,
  })

  // CP 바뀌면 기간 스코프 로드 + 첫 진입 전체선택 + 수동 memo 복원(auto 스트립)
  useEffect(() => {
    if (!selectedCp) return
    const saved = monthRecords[selectedCp.id]?.line_results
    const nextMarks: Record<number, FaMark> = {}
    if (Array.isArray(saved)) saved.forEach((v, i) => { if (v === 'normal' || v === 'caution' || v === 'bad') nextMarks[i] = v })
    setFaMarks(nextMarks)
    setFaChecked(new Set(strItems.map(it => it.i)))
    setFaReinspecting(false)
    photo.reset(); setSubmitError(null); setJustSaved(false)
    const savedMemo = monthRecords[selectedCp.id]?.memo ?? ''
    const autoAtSave = faAutoMemo(strItems, nextMarks)
    setMemo(autoAtSave && savedMemo.startsWith(autoAtSave) ? savedMemo.slice(autoAtSave.length).replace(/^\n/, '') : savedMemo)
  }, [selectedCp?.id])// eslint-disable-line

  const faAuto = faAutoMemo(strItems, faMarks)
  const faResolved = faAllResolved(strItems, faMarks)
  const faSaved = !!selectedCp && Array.isArray(monthRecords[selectedCp.id]?.line_results) && (monthRecords[selectedCp.id]!.line_results as any[]).length > 0
  const faShowDone = faSaved && !faReinspecting
  const faReadonly = !!popupState || faShowDone
  const faAllChecked = strItems.length > 0 && faChecked.size === strItems.length

  const toggleItem = (i: number) => setFaChecked(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n })
  const toggleSelectAll = () => { if (faReadonly) return; setFaChecked(faAllChecked ? new Set<number>() : new Set(strItems.map(it => it.i))) }
  const applyResult = (val: CheckResult) => {
    if (faReadonly || faChecked.size === 0) return
    setFaMarks(prev => { const n = { ...prev }; faChecked.forEach(i => { n[i] = val }); return n })
    setFaChecked(new Set())
  }

  const handleSave = async () => {
    if (!selectedCp || !faResolved || faReadonly) return  // 완료(done)/재진입 상태면 재저장 금지 — 확인(재점검) 후에만
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      const lineResultsArr = faLineResults(strItems, faMarks)
      const finalMemo = [faAuto, memo.trim()].filter(Boolean).join('\n')
      // 다른 Family A 개소와 동일 — 선택된 층 CP 하나에 line_results[5]+worst+memo 저장(서버 worst 롤업).
      await onSave(selectedCp.id, faWorst(faMarks), finalMemo, photoKey ?? undefined, { line_results: JSON.stringify(lineResultsArr) })
      photo.reset(); setJustSaved(true); setFaReinspecting(false)
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col overflow-hidden"
      style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
    >

      {/* 헤더 */}
      <div className="flex items-center gap-2.5 h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0">
        <StairsIcon size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-title font-semibold text-text-primary leading-tight truncate">
            {group.labels[0]}
            {group.labels.length > 1 && (
              <span className="text-caption text-text-tertiary font-normal ml-1.5">· {group.labels.slice(1).join(' · ')}</span>
            )}
          </div>
        </div>
      </div>

      {/* 계단실 선택 */}
      <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
        <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">계단실 선택</div>
        <div className="flex gap-1.5">
          {STAIRWELLS.map(sw => {
            const swCPsAll = allCheckpoints.filter(cp => group.categories.includes(cp.category) && cp.locationNo === `S${sw.id}`)
            const done = swCPsAll.length > 0 && swCPsAll.every(cp => isCpCompleted(monthRecords[cp.id]))
            const isActive = selectedSW === sw.id
            const stateCls = isActive
              ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
              : done
                ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                : 'border border-border-strong bg-surface-page text-text-secondary'
            return (
              <button
                key={sw.id}
                onClick={() => { setSelectedSW(sw.id); setSelectedFloor(null) }}
                className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors ${stateCls}`}
              >
                {sw.id}{done && !isActive && <Check size={12} className="inline-block ml-1 opacity-85" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 층 선택 (선택된 계단실의 접근 가능 층) */}
      {selectedSW && (
        <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">층 선택</div>
          <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {swFloors.map(f => {
              const cp = allCheckpoints.find(c => group.categories.includes(c.category) && c.locationNo === `S${selectedSW}` && c.floor === f)
              const fDone = cp ? isCpCompleted(monthRecords[cp.id]) : false
              const isSel = f === selectedFloor
              return (
                <button key={f} onClick={() => setSelectedFloor(f)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    isSel ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                          : 'border border-border-strong bg-surface-page text-text-secondary'
                  }`}>
                  {f}{fDone && <Check size={11} className="inline-block ml-1 opacity-75" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 본문 (스크롤) — 다른 개소와 동일: 점검내용 카드 + 결과버튼 + 특이사항 + 사진 */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5">
        {!selectedSW && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">계단실을 선택해 주세요</div>
        )}
        {selectedSW && !selectedCp && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">층을 선택해 주세요</div>
        )}

        {/* 점검 내용 카드 — 오버레이에 덮이지 않음(readonly 조회) */}
        {selectedCp && (
          <FamilyACard
            category="특별피난계단"
            items={strItems}
            marks={faMarks}
            checked={faChecked}
            readonly={faReadonly}
            allChecked={faAllChecked}
            onSelectAll={toggleSelectAll}
            onToggleCheck={toggleItem}
          />
        )}

        {/* 결과 ~ 특이사항 (이미 점검한 개소 오버레이가 이 영역만 덮음) */}
        {selectedCp && (
          <div className="relative">
            {popupState ? (
              <InspectionRevisitPopup
                variant={popupState.variant}
                checkedAt={popupState.checkedAt}
                inspectorName={popupState.inspectorName}
                recordId={popupState.recordId}
                onClose={dismiss}
                onGoToRemediation={(recordId) => { dismiss(); navigate('/remediation/' + recordId) }}
              />
            ) : faShowDone ? (
              <InspectionRevisitPopup
                variant="completed"
                checkedAt={monthRecords[selectedCp.id]?.checkedAt ?? ''}
                inspectorName={monthRecords[selectedCp.id]?.staffName ?? '—'}
                onClose={() => setFaReinspecting(true)}
              />
            ) : null}

            {/* 결과 버튼 — 체크된 행에 적용 */}
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
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <textarea
                  value={[faAuto, memo].filter(Boolean).join('\n')}
                  onChange={e => { const v = e.target.value; setMemo(faAuto && v.startsWith(faAuto) ? v.slice(faAuto.length).replace(/^\n/, '') : v) }}
                  placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption resize-none outline-none box-border focus:border-border-focus transition-colors" />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>

            {submitError && <div className="mt-2 bg-danger-bg/40 border border-danger-bar/30 rounded-sm px-3 py-2 text-caption text-danger">{submitError}</div>}
            {justSaved && !submitError && <div className="mt-2 bg-safe-bg/40 border border-safe-bar/30 rounded-sm px-3 py-2 text-caption text-safe inline-flex items-center gap-1.5"><Check size={12} />저장 완료</div>}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        {selectedCp && !faResolved && (
          <div className="mb-1.5 text-caption text-warning font-semibold text-center leading-snug">
            모든 항목의 점검 결과를 입력해야 저장됩니다 (‘전체 선택’ → 정상)
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-sunken transition-colors">
            닫기
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || photo.uploading || !selectedCp || !faResolved || faReadonly}
            className={`flex-1 py-3 rounded-md border-0 text-label font-bold transition-shadow ${
              submitting || photo.uploading || !selectedCp || !faResolved || faReadonly
                ? 'bg-border-default text-text-tertiary cursor-default'
                : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] text-text-on-accent cursor-pointer hover:shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
            }`}
          >
            {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : (selectedCp && !faResolved) ? '전 항목 결과 입력 필요' : '점검 기록 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CCTV DVR 점검 모달 ───────────────────────────────────
// 설비 상세 데이터는 src/utils/cctv.ts. 설비 현황 페이지: /cctv

function CctvModal({ allCheckpoints, records, onClose, onSave }: {
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload('inspection')
  const navigate = useNavigate()
  const [dvrResults,  setDvrResults]  = useState<Record<string, CheckResult>>({})
  const [memo,        setMemo]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [justSaved,   setJustSaved]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [visible,     setVisible]     = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const cctvCPs = useMemo(() =>
    allCheckpoints.filter(cp => cp.category === 'CCTV'),
    [allCheckpoints]
  )

  // 초기화: 기존 records 로드, 없으면 'normal'
  useEffect(() => {
    const init: Record<string, CheckResult> = {}
    cctvCPs.forEach(cp => { init[cp.id] = (records[cp.id] as CheckResult) ?? 'normal' })
    setDvrResults(init)
  }, [cctvCPs]) // eslint-disable-line

  const doneCnt = cctvCPs.filter(cp => records[cp.id]).length
  const allDone = doneCnt === cctvCPs.length && cctvCPs.length > 0

  // result-mini 클래스 매핑 (Wave 5 — Stairwell/Cctv 공용 컴팩트 픽커, 각 모달에 local 정의)
  const resultMiniCls = (active: boolean, value: CheckResult) =>
    active
      ? value === 'normal' ? 'border-safe-bar bg-safe-bg text-safe'
        : value === 'caution' ? 'border-warning-bar bg-warning-bg text-warning'
        : 'border-danger-bar bg-danger-bg text-danger'
      : 'border-border-default bg-surface-page text-text-tertiary'

  const resultIcon = (value: CheckResult) =>
    value === 'normal' ? CheckCircle2 : value === 'caution' ? AlertTriangle : XCircle

  const handleSave = async () => {
    if (cctvCPs.length === 0) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      if (photo.hasPhoto && photoKey === null) throw new Error(photoUploadFailMsg(photo.vaultBacked))
      // DVR 13대 일괄 점검이라 사진 1장이 의도. 모든 record 에 같은 photoKey 를 박으면
      // 상세 진입 시 전 DVR 이 같은 사진을 표시하므로, caution/bad 가 있으면 그 첫 cp,
      // 없으면 첫 cp 1건에만 attach.
      const photoTargetCp = photoKey
        ? (cctvCPs.find(cp => {
            const r = dvrResults[cp.id] ?? 'normal'
            return r === 'caution' || r === 'bad'
          }) ?? cctvCPs[0])
        : null
      for (const cp of cctvCPs) {
        const keyForCp = photoTargetCp && cp.id === photoTargetCp.id ? photoKey : undefined
        await onSave(cp.id, dvrResults[cp.id] ?? 'normal', memo, keyForCp ?? undefined)
      }
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col overflow-hidden"
      style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
    >

      {/* 헤더 */}
      <div className="flex items-center gap-2.5 h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0">
        <Video size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-title font-semibold text-text-primary truncate">CCTV 점검</div>
        </div>
        {allDone && !justSaved && (
          <div className="text-caption font-semibold text-safe bg-safe-bg border border-safe-bar rounded-sm px-2 py-0.5 flex-shrink-0 inline-flex items-center gap-1">
            <CheckCircle2 size={12} className="flex-shrink-0" />
            완료
          </div>
        )}
        <button
          onClick={() => navigate('/cctv')}
          className="flex-shrink-0 px-2.5 py-1.5 rounded-sm border border-border-strong bg-surface-raised text-text-secondary text-caption font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
        >
          <Server size={13} className="flex-shrink-0" />
          설비 현황
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5">

        {/* DVR 총 갯수 표시 (CCTV_DVRS.length 기반 동적) */}
        <div className="text-caption text-text-tertiary leading-tight">
          B1F 방재센터 DVR {CCTV_DVRS.length}대
        </div>

        {doneCnt > 0 && !justSaved && (
          <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-1.5 text-label font-semibold text-safe inline-flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-safe flex-shrink-0" />
            {doneCnt}/{cctvCPs.length}대 이미 점검 완료
          </div>
        )}

        {/* 2열 그리드: 절반씩 분할 (DVR 갯수에 따라 자동) */}
        {(() => {
          const half = Math.ceil(CCTV_DVRS.length / 2)
          const renderCard = (dvr: typeof CCTV_DVRS[number]) => {
            const cp = cctvCPs.find(c => c.locationNo === dvr.no)
            if (!cp) return null
            const curResult = dvrResults[cp.id] ?? 'normal'
            return (
              <div key={dvr.no} className="bg-surface-raised border border-border-default rounded-md px-2 pt-1.5 pb-1.5">
                <div className="text-label font-bold text-text-primary leading-tight">{dvr.label}</div>
                <div className="text-caption text-text-tertiary mt-0.5 mb-1.5 leading-tight min-h-[1.25em]">{dvr.desc}</div>
                <div className="flex gap-1">
                  {INSPECT_RESULT_OPTIONS.map(opt => {
                    const Icon = resultIcon(opt.value)
                    const active = curResult === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setDvrResults(prev => ({ ...prev, [cp.id]: opt.value }))}
                        className={`flex-1 px-1 py-1.5 rounded-pill border-[1.5px] text-caption font-bold whitespace-nowrap inline-flex items-center justify-center gap-1 cursor-pointer transition-colors ${resultMiniCls(active, opt.value)}`}
                      >
                        <Icon className="w-3 h-3 flex-shrink-0" />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          }
          return (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                {CCTV_DVRS.slice(0, half).map(renderCard)}
              </div>
              <div className="flex flex-col gap-1.5">
                {CCTV_DVRS.slice(half).map(renderCard)}
              </div>
            </div>
          )
        })()}

        {/* 특이사항 + 사진 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
            <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
          </div>
          <div className="flex gap-2 items-start">
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요"
              className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none outline-none box-border font-sans placeholder:text-text-tertiary" />
            <PhotoButton hook={photo} label="촬영" noCapture />
          </div>
        </div>

        {submitError && <div className="bg-danger-bg border border-danger-bar rounded-sm px-3 py-2 text-label font-semibold text-danger">{submitError}</div>}
        {justSaved  && <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-2 text-label font-semibold text-safe inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-safe flex-shrink-0" />저장 완료</div>}
      </div>

      {/* 하단 바 */}
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        <button onClick={onClose}
          className="px-[18px] py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-label font-semibold cursor-pointer transition-colors">
          닫기
        </button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading}
          className="flex-1 py-3.5 rounded-md text-body font-bold border-0 transition-all"
          style={{
            background: (submitting || photo.uploading) ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
            color:      (submitting || photo.uploading) ? 'var(--text-tertiary)' : '#fff',
            cursor:     (submitting || photo.uploading) ? 'default' : 'pointer',
            boxShadow:  (submitting || photo.uploading) ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
          }}
        >
          {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : 'CCTV 점검 저장'}
        </button>
      </div>
    </div>
  )
}

// ── 배연창 전용 모달 ─────────────────────────────────────
type BYZone = 'research' | 'office'
const BY_ZONE_LABELS: Record<BYZone, string> = { research:'연구동', office:'사무동' }
const BY_LOC_NO:     Record<BYZone, string> = { research:'BY-R',   office:'BY-O'   }
const BY_FLOOR_ORDER: Floor[] = ['8F','7F','6F','5F','3F','2F','1F']

function BaeyeonModal({ group, allCheckpoints, records, monthRecords, scheduleItems, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload('inspection')
  const navigate = useNavigate()
  const [zone,        setZone]        = useState<BYZone | null>(null)
  const [selFloor,    setSelFloor]    = useState<Floor | null>(null)
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [result,      setResult]      = useState<CheckResult>('normal')
  const [memo,        setMemo]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [justSaved,   setJustSaved]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [visible,     setVisible]     = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const zoneCPs = useMemo(() =>
    zone ? allCheckpoints.filter(cp => cp.category === '배연창' && cp.locationNo?.startsWith(BY_LOC_NO[zone])) : [],
    [zone, allCheckpoints]
  )
  const availableFloors = useMemo(() => {
    const floorSet = new Set(zoneCPs.map(cp => cp.floor))
    return BY_FLOOR_ORDER.filter(f => floorSet.has(f))
  }, [zoneCPs])

  const floorCPs = useMemo(() =>
    selFloor ? zoneCPs.filter(cp => cp.floor === selFloor) : [],
    [zoneCPs, selFloor]
  )

  const selectedCP = selectedId ? (allCheckpoints.find(cp => cp.id === selectedId) ?? null) : null

  // 층 바뀌면: CP 1개면 자동선택, 복수면 초기화
  const prevFloor = useRef(selFloor)
  useEffect(() => {
    if (prevFloor.current !== selFloor) {
      prevFloor.current = selFloor
      setSelectedId(floorCPs.length === 1 ? floorCPs[0].id : null)
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // 구역 바뀌면 초기화
  const prevZone = useRef(zone)
  useEffect(() => {
    if (prevZone.current !== zone) {
      prevZone.current = zone
      setSelFloor(null); setSelectedId(null); setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // 위치 선택 바뀌면 폼 초기화
  const prevId = useRef(selectedId)
  useEffect(() => {
    if (prevId.current !== selectedId) {
      prevId.current = selectedId
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // 재진입 팝업 (공통 훅)
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: selectedCP?.id ?? null,
    category:     '배연창',
    monthRecords,
    scheduleItems,
  })

  const handleSave = async () => {
    if (!selectedCP) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      if (photo.hasPhoto && photoKey === null) throw new Error(photoUploadFailMsg(photo.vaultBacked))
      await onSave(selectedCP.id, result, memo, photoKey ?? undefined)
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  const getPositionLabel = (cp: CheckPoint) =>
    cp.location.includes('북측') ? '북측' : cp.location.includes('동측') ? '동측' : cp.location

  return (
    <div
      className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col"
      style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
    >

      {/* 헤더 */}
      <div className="flex items-center gap-2.5 h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0">
        <SmokeVentIcon size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1">
          <div className="text-title font-semibold text-text-primary">{group.labels[0]}</div>
        </div>
      </div>

      {/* 구역 선택 */}
      <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0">
        <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">구역 선택</div>
        <div className="flex gap-2">
          {(['research','office'] as BYZone[]).map(z => {
            const zCPs    = allCheckpoints.filter(cp => cp.category === '배연창' && cp.locationNo?.startsWith(BY_LOC_NO[z]))
            const allDone = zCPs.length > 0 && zCPs.every(cp => records[cp.id])
            const isSel   = zone === z
            const ZIcon   = ZONE_ICONS[z]
            const cls = isSel
              ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
              : allDone
                ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                : 'border border-border-strong bg-surface-page text-text-secondary'
            return (
              <button key={z} onClick={() => setZone(z)}
                className={`flex-1 basis-0 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                {ZIcon && <ZIcon size={14} />}{BY_ZONE_LABELS[z]}{allDone && <span className="text-caption ml-1 opacity-80">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 층 선택 */}
      {zone && (
        <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">층 선택</div>
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {availableFloors.map(f => {
              const fCPs  = zoneCPs.filter(cp => cp.floor === f)
              const fDone = fCPs.every(cp => records[cp.id]) && fCPs.length > 0
              const isSel = f === selFloor
              const cls = isSel
                ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                : 'border border-border-strong bg-surface-page text-text-secondary'
              return (
                <button key={f} onClick={() => setSelFloor(f)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                  {f}{fDone && <span className="text-caption ml-0.5 opacity-75">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 위치 선택 (연구동에서 같은 층에 복수 CP인 경우) */}
      {zone && selFloor && floorCPs.length > 1 && (
        <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">위치 선택</div>
          <div className="flex gap-2">
            {floorCPs.map(cp => {
              const isSel = selectedId === cp.id
              const isDone = !!records[cp.id]
              const cls = isSel
                ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                : isDone
                  ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                  : 'border border-border-strong bg-surface-page text-text-secondary'
              return (
                <button key={cp.id} onClick={() => setSelectedId(cp.id)}
                  className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                  {getPositionLabel(cp)}{isDone && <span className="text-caption ml-1 opacity-80">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 relative">
        {!zone && <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">구역을 선택해 주세요</div>}
        {zone && !selFloor && <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">층을 선택해 주세요</div>}
        {zone && selFloor && floorCPs.length > 1 && !selectedId && <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">위치를 선택해 주세요</div>}

        {selectedCP && (
          <div className="relative flex flex-col gap-3">
            {/* 재진입 팝업 (소화기 방식 부분 오버레이 — 이 서브 컨테이너만 덮음) */}
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
            {!!records[selectedCP.id] && !justSaved && (
              <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-[9px] text-label text-safe flex items-center gap-1.5">✓ 이미 점검 완료된 항목입니다</div>
            )}
            <div>
              <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">점검 결과</div>
              <div className="flex gap-2">
                {INSPECT_RESULT_OPTIONS.map(opt => {
                  const Icon = opt.value === 'normal' ? CheckCircle2 : opt.value === 'caution' ? AlertTriangle : XCircle
                  const active = result === opt.value
                  const stateCls = active
                    ? opt.value === 'normal' ? 'border-safe-bar bg-safe-bg text-safe'
                      : opt.value === 'caution' ? 'border-warning-bar bg-warning-bg text-warning'
                      : 'border-danger-bar bg-danger-bg text-danger'
                    : 'border-border-default bg-surface-raised text-text-tertiary'
                  return (
                    <button key={opt.value} onClick={() => setResult(opt.value)}
                      className={`flex-1 px-2 py-[9px] rounded-pill border-[1.5px] text-body-sm font-bold whitespace-nowrap inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${stateCls}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none font-sans outline-none box-border placeholder:text-text-tertiary" />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>
            {submitError && <div className="bg-danger-bg border border-danger-bar rounded-sm px-3 py-2 text-label text-danger">{submitError}</div>}
            {justSaved  && <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-2 text-label text-safe">✓ 저장 완료</div>}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        <button onClick={onClose}
          className="px-[18px] py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-label font-semibold cursor-pointer">
          닫기
        </button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || !selectedCP}
          className="flex-1 py-[13px] rounded-md border-none text-white text-body-sm font-bold cursor-pointer transition-colors disabled:text-text-tertiary disabled:cursor-default"
          style={{ background: submitting||photo.uploading||!selectedCP ? 'var(--border-strong)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}
        >
          {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : '점검 기록 저장'}
        </button>
      </div>
    </div>
  )
}

// ── 소방용전원공급반 전용 모달 ───────────────────────────
type PPZone = 'research' | 'office' | 'underground'
const PP_ZONE_LABELS: Record<PPZone, string> = { research:'연구동', office:'사무동', underground:'지하' }
const PP_ZONE_PREFIX: Record<PPZone, string> = { research:'PP-R', office:'PP-O', underground:'PP-U' }

function PowerPanelModal({ group, allCheckpoints, records, monthRecords, scheduleItems, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string, extra?: { guide_light_type?: string; floor_plan_marker_id?: string; line_results?: string; remediation_symbol?: string }) => Promise<void>
}) {
  const photo = usePhotoUpload()
  const navigate = useNavigate()
  const ppItems: InspectionItem[] = inspectionContent['소방용전원공급반']?.items ?? []
  const [zone,        setZone]        = useState<PPZone | null>(null)
  const [pickerIdx,   setPickerIdx]   = useState<number>(0)
  // 소방용전원공급반 — 표준 Family A 카드 (special 없음, C/D 자동만)
  const [faMarks,     setFaMarks]     = useState<Record<number, FaMark>>({})
  const [faChecked,   setFaChecked]   = useState<Set<number>>(new Set())
  const [faReinspecting, setFaReinspecting] = useState(false)
  const [memo,        setMemo]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [justSaved,   setJustSaved]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [visible,     setVisible]     = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const zoneCPs = useMemo(() => {
    if (!zone) return []
    const FLOOR_ORDER: string[] = ['8F','7F','6F','5F','3F','2F','1F','B1','B2','B3','B4','B5']
    return allCheckpoints
      .filter(cp => cp.category === '소방용전원공급반' && cp.locationNo?.startsWith(PP_ZONE_PREFIX[zone]))
      .sort((a, b) => FLOOR_ORDER.indexOf(a.floor) - FLOOR_ORDER.indexOf(b.floor))
  }, [zone, allCheckpoints])
  const selectedCP = zoneCPs[pickerIdx] ?? null
  const doneCount  = zoneCPs.filter(cp => isCpCompleted(monthRecords[cp.id])).length
  const totalCount = zoneCPs.length

  const prevZone = useRef(zone)
  useEffect(() => {
    if (prevZone.current !== zone) { prevZone.current = zone; setPickerIdx(0) }
  }) // eslint-disable-line

  // 재진입 팝업 (공통 훅)
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: selectedCP?.id ?? null,
    category:     '소방용전원공급반',
    monthRecords,
    scheduleItems,
  })

  // 선택 CP 변경(구역/스와이프) 시 기간 스코프 로드 + 첫 진입 전체선택 + 수동 memo 복원(auto 스트립)
  useEffect(() => {
    if (!selectedCP) return
    const saved = monthRecords[selectedCP.id]?.line_results
    const nextMarks: Record<number, FaMark> = {}
    if (Array.isArray(saved)) saved.forEach((v, i) => { if (v === 'normal' || v === 'caution' || v === 'bad') nextMarks[i] = v })
    setFaMarks(nextMarks)
    setFaChecked(new Set(ppItems.map(it => it.i)))
    setFaReinspecting(false)
    photo.reset(); setSubmitError(null); setJustSaved(false)
    const savedMemo = monthRecords[selectedCP.id]?.memo ?? ''
    const autoAtSave = faAutoMemo(ppItems, nextMarks)
    setMemo(autoAtSave && savedMemo.startsWith(autoAtSave) ? savedMemo.slice(autoAtSave.length).replace(/^\n/, '') : savedMemo)
  }, [selectedCP?.id])// eslint-disable-line

  const faAuto = faAutoMemo(ppItems, faMarks)
  const faResolved = faAllResolved(ppItems, faMarks)
  const faSaved = !!selectedCP && Array.isArray(monthRecords[selectedCP.id]?.line_results) && (monthRecords[selectedCP.id]!.line_results as any[]).length > 0
  const faShowDone = faSaved && !faReinspecting
  const faReadonly = !!popupState || faShowDone
  const faAllChecked = ppItems.length > 0 && faChecked.size === ppItems.length

  const toggleItem = (i: number) => setFaChecked(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n })
  const toggleSelectAll = () => { if (faReadonly) return; setFaChecked(faAllChecked ? new Set<number>() : new Set(ppItems.map(it => it.i))) }
  const applyResult = (val: CheckResult) => {
    if (faReadonly || faChecked.size === 0) return
    setFaMarks(prev => { const n = { ...prev }; faChecked.forEach(i => { n[i] = val }); return n })
    setFaChecked(new Set())
  }

  const handleSave = async () => {
    if (!selectedCP || !faResolved || faReadonly) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      const lineResultsArr = faLineResults(ppItems, faMarks)
      const finalMemo = [faAuto, memo.trim()].filter(Boolean).join('\n')
      // 서버 worst 롤업. 출력=자탐 매트릭스 sheet9 에 line_results[10] 자동 반영(추가 엑셀 작업 0).
      await onSave(selectedCP.id, faWorst(faMarks), finalMemo, photoKey ?? undefined, { line_results: JSON.stringify(lineResultsArr) })
      photo.reset(); setJustSaved(true); setFaReinspecting(false)
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed left-0 right-0 z-[99] flex flex-col overflow-hidden bg-surface-page"
      style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
    >

      {/* 헤더 */}
      <div className="flex items-center h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0 gap-2.5">
        <Zap size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-title font-semibold text-text-primary">{group.labels[0]}</div>
        </div>
      </div>

      {/* 구역 선택 */}
      <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
        <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">구역 선택</div>
        <div className="flex gap-1.5">
          {(['research','office','underground'] as PPZone[]).map(z => {
            const zCPs   = allCheckpoints.filter(cp => cp.category === '소방용전원공급반' && cp.locationNo?.startsWith(PP_ZONE_PREFIX[z]))
            const allDone = zCPs.length > 0 && zCPs.every(cp => isCpCompleted(monthRecords[cp.id]))
            const isActive = zone === z
            const ZIcon    = ZONE_ICONS[z]
            const baseCls  = 'flex-1 basis-0 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-sm text-label font-bold cursor-pointer whitespace-nowrap transition-colors'
            const stateCls = isActive ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                           : allDone   ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                           :             'border border-border-strong bg-surface-page text-text-secondary'
            return (
              <button key={z} onClick={() => setZone(z)} className={`${baseCls} ${stateCls}`}>
                {ZIcon && <ZIcon size={14} />}{PP_ZONE_LABELS[z]}{!isActive && allDone && <Check size={12} className="inline-block ml-1 opacity-85" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 개소 선택 — 카드 + 좌우 스와이프 */}
      {zone && zoneCPs.length >= 1 && (
        <div className="bg-surface-raised border-b border-border-default px-3.5 pt-2.5 pb-2 flex-shrink-0">
          <div
            className="bg-surface-page border border-border-default rounded-md px-3 py-2.5 flex items-center gap-2.5 touch-pan-y"
            onTouchStart={e => { (e.currentTarget as any)._swX = e.touches[0].clientX }}
            onTouchEnd={e => {
              const sx = (e.currentTarget as any)._swX
              if (sx == null) return
              const dx = e.changedTouches[0].clientX - sx
              if (dx > 40 && pickerIdx > 0) setPickerIdx(pickerIdx - 1)
              else if (dx < -40 && pickerIdx < zoneCPs.length - 1) setPickerIdx(pickerIdx + 1)
            }}
          >
            <button
              onClick={() => { if (pickerIdx > 0) setPickerIdx(pickerIdx - 1) }}
              disabled={pickerIdx === 0}
              className={`w-9 h-9 rounded-sm border border-border-default bg-surface-page flex items-center justify-center flex-shrink-0 transition-opacity ${pickerIdx > 0 ? 'cursor-pointer text-text-primary opacity-100' : 'cursor-default text-text-tertiary opacity-30'}`}
            >
              <ChevronLeft size={18} className="flex-shrink-0" />
            </button>
            <div className="flex-1 text-center min-w-0">
              <div className="text-caption text-text-tertiary font-semibold">개소 ({pickerIdx + 1}/{totalCount}) · {doneCount}/{totalCount} 완료</div>
              <div className="text-[15px] font-bold text-text-primary mt-0.5 truncate">{selectedCP?.location ?? ''}</div>
            </div>
            <button
              onClick={() => { if (pickerIdx < zoneCPs.length - 1) setPickerIdx(pickerIdx + 1) }}
              disabled={pickerIdx >= zoneCPs.length - 1}
              className={`w-9 h-9 rounded-sm border border-border-default bg-surface-page flex items-center justify-center flex-shrink-0 transition-opacity ${pickerIdx < zoneCPs.length - 1 ? 'cursor-pointer text-text-primary opacity-100' : 'cursor-default text-text-tertiary opacity-30'}`}
            >
              <ChevronRight size={18} className="flex-shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-3">
        {!zone && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">구역을 선택해 주세요</div>
        )}

        {/* 점검 내용 카드 — 오버레이에 덮이지 않음(readonly 조회) */}
        {selectedCP && (
          <FamilyACard
            category="소방용전원공급반"
            items={ppItems}
            marks={faMarks}
            checked={faChecked}
            readonly={faReadonly}
            allChecked={faAllChecked}
            onSelectAll={toggleSelectAll}
            onToggleCheck={toggleItem}
          />
        )}

        {/* 결과 ~ 특이사항 (이미 점검한 개소 오버레이가 이 영역만 덮음) */}
        {selectedCP && (
          <div className="relative flex flex-col gap-3">
            {popupState ? (
              <InspectionRevisitPopup
                variant={popupState.variant}
                checkedAt={popupState.checkedAt}
                inspectorName={popupState.inspectorName}
                recordId={popupState.recordId}
                onClose={dismiss}
                onGoToRemediation={(recordId) => { dismiss(); navigate('/remediation/' + recordId) }}
              />
            ) : faShowDone ? (
              <InspectionRevisitPopup
                variant="completed"
                checkedAt={monthRecords[selectedCP.id]?.checkedAt ?? ''}
                inspectorName={monthRecords[selectedCP.id]?.staffName ?? '—'}
                onClose={() => setFaReinspecting(true)}
              />
            ) : null}

            {/* 결과 버튼 — 체크된 행에 적용 */}
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
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <textarea
                  value={[faAuto, memo].filter(Boolean).join('\n')}
                  onChange={e => { const v = e.target.value; setMemo(faAuto && v.startsWith(faAuto) ? v.slice(faAuto.length).replace(/^\n/, '') : v) }}
                  placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none outline-none box-border font-sans placeholder:text-text-tertiary"
                />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>

            {submitError && (
              <div className="bg-danger-bg border border-danger-bar text-danger rounded-sm px-3 py-2 text-label font-semibold">{submitError}</div>
            )}
            {justSaved && !submitError && (
              <div className="bg-safe-bg border border-safe-bar text-safe rounded-sm px-3 py-2 text-label font-semibold inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span>저장 완료</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        {selectedCP && !faResolved && (
          <div className="mb-1.5 text-caption text-warning font-semibold text-center leading-snug">
            모든 항목의 점검 결과를 입력해야 저장됩니다 (‘전체 선택’ → 정상)
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-label font-semibold cursor-pointer transition-colors"
          >닫기</button>
          <button
            onClick={handleSave}
            disabled={submitting || photo.uploading || !selectedCP || !faResolved || faReadonly}
            className="flex-1 py-3.5 rounded-md text-body font-bold border-0 transition-all"
            style={{
              background: (submitting || photo.uploading || !selectedCP || !faResolved || faReadonly) ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
              color:      (submitting || photo.uploading || !selectedCP || !faResolved || faReadonly) ? 'var(--text-tertiary)' : '#fff',
              cursor:     (submitting || photo.uploading || !selectedCP || !faResolved || faReadonly) ? 'default' : 'pointer',
              boxShadow:  (submitting || photo.uploading || !selectedCP || !faResolved || faReadonly) ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
            }}
          >
            {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : (selectedCP && !faResolved) ? '전 항목 결과 입력 필요' : '점검 기록 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 주차장비·회전문 전용 모달 ──────────────────────────
function ParkingGateModal({ group, allCheckpoints, records, monthRecords, scheduleItems, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload('inspection')
  const navigate = useNavigate()
  const [item,        setItem]        = useState<'주차장비'|'회전문'|null>(null)
  const [subItem,     setSubItem]     = useState<'북문'|'남문'|null>(null)
  const [result,      setResult]      = useState<CheckResult>('normal')
  const [memo,        setMemo]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [justSaved,   setJustSaved]   = useState(false)
  const [submitError, setSubmitError] = useState<string|null>(null)
  const [visible,     setVisible]     = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  // 항목 바뀌면 하위 상태 초기화
  const prevItem = useRef(item)
  useEffect(() => {
    if (prevItem.current !== item) {
      prevItem.current = item
      setSubItem(null); setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // 문 바뀌면 폼 초기화
  const prevSub = useRef(subItem)
  useEffect(() => {
    if (prevSub.current !== subItem) {
      prevSub.current = subItem
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  const cpId = useMemo(() => {
    if (item === '주차장비') return allCheckpoints.find(cp => cp.category === '주차장비')?.id ?? null
    if (item === '회전문' && subItem) return allCheckpoints.find(cp => cp.category === '회전문' && cp.location === subItem)?.id ?? null
    return null
  }, [item, subItem, allCheckpoints])

  const isDone   = cpId ? !!records[cpId] : false
  const canSave  = !!(item === '주차장비' ? cpId : cpId && subItem)
  const showForm = item === '주차장비' || (item === '회전문' && !!subItem)

  // 재진입 팝업 (공통 훅) — 주 카테고리 기준
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: cpId,
    category:     '주차장비',
    monthRecords,
    scheduleItems,
  })

  const handleSave = async () => {
    if (!cpId) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      if (photo.hasPhoto && photoKey === null) throw new Error(photoUploadFailMsg(photo.vaultBacked))
      await onSave(cpId, result, memo, photoKey ?? undefined)
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  const resultIcon = (v: CheckResult) => {
    if (v === 'normal')  return <CheckCircle2 size={16} className="flex-shrink-0" />
    if (v === 'caution') return <AlertTriangle size={16} className="flex-shrink-0" />
    return <XCircle size={16} className="flex-shrink-0" />
  }

  return (
    <div
      className="fixed left-0 right-0 z-[99] flex flex-col overflow-hidden bg-surface-page"
      style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
    >

      {/* 헤더 */}
      <div className="flex items-center h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0 gap-2.5">
        <Car size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-title font-semibold text-text-primary truncate">
            {group.labels[0]}
            {group.labels.length > 1 && (
              <span className="text-caption text-text-tertiary font-normal ml-1.5">· {group.labels.slice(1).join(' · ')}</span>
            )}
          </div>
        </div>
      </div>

      {/* 항목 선택 */}
      <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
        <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">항목 선택</div>
        <div className="flex gap-1.5">
          {(['주차장비','회전문'] as const).map(label => {
            const catCPs  = allCheckpoints.filter(cp => cp.category === label)
            const allDone = catCPs.length > 0 && catCPs.every(cp => records[cp.id])
            const isActive = item === label
            const baseCls  = 'flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold cursor-pointer whitespace-nowrap transition-colors inline-flex items-center justify-center'
            const stateCls = isActive ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                           : allDone   ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                           :             'border border-border-strong bg-surface-page text-text-secondary'
            return (
              <button key={label} onClick={() => setItem(label)} className={`${baseCls} ${stateCls}`}>
                {label}{!isActive && allDone && <span className="text-caption ml-1 opacity-85">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 회전문 → 북문/남문 */}
      {item === '회전문' && (
        <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">문 선택</div>
          <div className="flex gap-1.5">
            {(['북문','남문'] as const).map(door => {
              const doorCP  = allCheckpoints.find(cp => cp.category === '회전문' && cp.location === door)
              const doneDoor = doorCP ? !!records[doorCP.id] : false
              const isActive = subItem === door
              const baseCls  = 'flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold cursor-pointer whitespace-nowrap transition-colors inline-flex items-center justify-center'
              const stateCls = isActive ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                             : doneDoor  ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                             :             'border border-border-strong bg-surface-page text-text-secondary'
              return (
                <button key={door} onClick={() => setSubItem(door)} className={`${baseCls} ${stateCls}`}>
                  {door}{!isActive && doneDoor && <span className="text-caption ml-1 opacity-85">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-3 relative">
        {!item && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">항목을 선택해 주세요</div>
        )}
        {item === '회전문' && !subItem && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">북문 또는 남문을 선택해 주세요</div>
        )}

        {showForm && (
          <div className="relative flex flex-col gap-3">
            {/* 재진입 팝업 (소화기 방식 부분 오버레이 — 이 서브 컨테이너만 덮음) */}
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
            {isDone && !justSaved && (
              <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-2 text-label font-semibold text-safe inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-safe flex-shrink-0" />
                <span>이미 점검 완료된 항목입니다</span>
              </div>
            )}

            {/* 점검 결과 */}
            <div>
              <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">점검 결과</div>
              <div className="flex gap-1.5">
                {INSPECT_RESULT_OPTIONS.map(opt => {
                  const isActive = result === opt.value
                  const baseCls  = 'flex-1 py-2.5 rounded-md border-[1.5px] inline-flex items-center justify-center gap-1.5 text-label font-bold cursor-pointer whitespace-nowrap transition-colors'
                  const stateCls = !isActive                 ? 'border-border-default bg-surface-raised text-text-tertiary'
                                 : opt.value === 'normal'    ? 'border-safe-bar bg-safe-bg text-safe'
                                 : opt.value === 'caution'   ? 'border-warning-bar bg-warning-bg text-warning'
                                 :                             'border-danger-bar bg-danger-bg text-danger'
                  return (
                    <button key={opt.value} onClick={() => setResult(opt.value)} className={`${baseCls} ${stateCls}`}>
                      {resultIcon(opt.value)}
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 특이사항 + 사진 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <textarea
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none outline-none box-border font-sans placeholder:text-text-tertiary"
                />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>

            {submitError && (
              <div className="bg-danger-bg border border-danger-bar text-danger rounded-sm px-3 py-2 text-label font-semibold">{submitError}</div>
            )}
            {justSaved && (
              <div className="bg-safe-bg border border-safe-bar text-safe rounded-sm px-3 py-2 text-label font-semibold inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span>저장 완료</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-label font-semibold cursor-pointer transition-colors"
        >닫기</button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || !canSave}
          className="flex-1 py-3.5 rounded-md text-body font-bold border-0 transition-all"
          style={{
            background: (submitting || photo.uploading || !canSave) ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
            color:      (submitting || photo.uploading || !canSave) ? 'var(--text-tertiary)' : '#fff',
            cursor:     (submitting || photo.uploading || !canSave) ? 'default' : 'pointer',
            boxShadow:  (submitting || photo.uploading || !canSave) ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
          }}
        >
          {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : '점검 기록 저장'}
        </button>
      </div>
    </div>
  )
}

// ── 전실제연댐퍼·연결송수관 전용 모달 ────────────────────
function DamperModal({ group, allCheckpoints, records, monthRecords, scheduleItems, onClose, onSave, initialCpId }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string, extra?: { guide_light_type?: string; floor_plan_marker_id?: string; line_results?: string; remediation_symbol?: string }) => Promise<void>
  initialCpId?:   string
}) {
  const photo = usePhotoUpload()
  const navigate = useNavigate()
  const dmpItems: InspectionItem[] = inspectionContent['전실제연댐퍼']?.items ?? []

  // QR 진입 초기값
  const initCp = initialCpId ? allCheckpoints.find(cp => cp.id === initialCpId) : null
  const initItem: '전실제연댐퍼'|'연결송수관'|null = initCp?.category === '전실제연댐퍼' ? '전실제연댐퍼' : initCp?.category === '연결송수관' ? '연결송수관' : null
  // 전실제연댐퍼 QR: locationNo 마지막 세그먼트 = 계단전실 번호 (예: "B5F-2" → "2"), floor = 층
  const initStair = initCp?.category === '전실제연댐퍼' && initCp.locationNo ? initCp.locationNo.split('-').pop() ?? null : null
  const initFloor: Floor|null = initCp?.category === '전실제연댐퍼' ? (initCp.floor as Floor) : null
  // 연결송수관 QR: location 으로 subItem 설정
  const initSubItem = initCp?.category === '연결송수관' ? initCp.location : null

  const [item,          setItem]          = useState<'전실제연댐퍼'|'연결송수관'|null>(initItem)
  // 연결송수관 states (카드 없음 — 별개 소화설비, 탭으로만 묶임)
  const [subItem,       setSubItem]       = useState<string|null>(initSubItem)
  const [result,        setResult]        = useState<CheckResult>('normal')
  // 전실제연댐퍼 states — 계단전실+층 피커 → 표준 Family A 카드 (StairwellModal 패턴)
  const [selectedStair, setSelectedStair] = useState<string|null>(initStair)
  const [selectedFloor, setSelectedFloor] = useState<Floor|null>(initFloor)
  const [faMarks,       setFaMarks]       = useState<Record<number, FaMark>>({})
  const [faChecked,     setFaChecked]     = useState<Set<number>>(new Set())
  const [faReinspecting, setFaReinspecting] = useState(false)

  const [memo,        setMemo]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [justSaved,   setJustSaved]   = useState(false)
  const [submitError, setSubmitError] = useState<string|null>(null)
  const [visible,     setVisible]     = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  // 계단전실 unique 번호 (locationNo 마지막 세그먼트) — LIVE = {2,4,5}
  const stairNums = useMemo(() => {
    const nums = new Set(
      allCheckpoints
        .filter(cp => cp.category === '전실제연댐퍼' && cp.locationNo)
        .map(cp => cp.locationNo!.split('-').pop()!)
    )
    return Array.from(nums).sort((a, b) => Number(a) - Number(b))
  }, [allCheckpoints])

  // 선택된 계단전실의 접근 가능 층 (지상→지하 순, 계단전실별 범위 상이)
  const stairFloors = useMemo(() => {
    if (!selectedStair) return [] as Floor[]
    const order: Floor[] = ['1F','B1','B2','B3','B4','B5']
    return order.filter(f => allCheckpoints.some(cp => cp.category === '전실제연댐퍼' && cp.locationNo?.endsWith(`-${selectedStair}`) && cp.floor === f))
  }, [selectedStair, allCheckpoints])

  // 선택된 (계단전실, 층) CP — 다른 Family A 개소와 동일하게 이 CP 하나에 line_results[10] 저장
  const selectedCp = useMemo(() =>
    (item === '전실제연댐퍼' && selectedStair && selectedFloor)
      ? allCheckpoints.find(cp => cp.category === '전실제연댐퍼' && cp.locationNo?.endsWith(`-${selectedStair}`) && cp.floor === selectedFloor) ?? null
      : null,
    [allCheckpoints, item, selectedStair, selectedFloor]
  )

  // 연결송수관 cpId (location 으로만 식별 — locationNo 없음)
  const yscpId = useMemo(() => {
    if (item === '연결송수관' && subItem)
      return allCheckpoints.find(cp => cp.category === '연결송수관' && cp.location === subItem)?.id ?? null
    return null
  }, [item, subItem, allCheckpoints])

  // 재진입 팝업 (선택 개소 / 카테고리 기준)
  const revisitCpId = item === '연결송수관' ? yscpId : (selectedCp?.id ?? null)
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: revisitCpId ?? null,
    category:     item === '연결송수관' ? '연결송수관' : '전실제연댐퍼',
    monthRecords,
    scheduleItems,
  })

  // 항목(전실제연댐퍼 ↔ 연결송수관) 전환 시 리셋
  const prevItem = useRef(item)
  useEffect(() => {
    if (prevItem.current !== item) {
      prevItem.current = item
      setSubItem(null); setSelectedStair(null); setSelectedFloor(null)
      setFaMarks({}); setFaChecked(new Set()); setFaReinspecting(false)
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // 연결송수관 위치 전환 시 리셋
  const prevSub = useRef(subItem)
  useEffect(() => {
    if (prevSub.current !== subItem) {
      prevSub.current = subItem
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // 계단전실 선택 시 첫 층 자동 선택 (StairwellModal 패턴)
  useEffect(() => {
    if (selectedStair && stairFloors.length > 0 && (!selectedFloor || !stairFloors.includes(selectedFloor))) setSelectedFloor(stairFloors[0])
  }, [selectedStair])// eslint-disable-line

  // 선택 CP 변경 시 기간 스코프 로드 + 첫 진입 전체선택 + 수동 memo 복원(auto 스트립)
  useEffect(() => {
    if (!selectedCp) return
    const saved = monthRecords[selectedCp.id]?.line_results
    const nextMarks: Record<number, FaMark> = {}
    if (Array.isArray(saved)) saved.forEach((v, i) => { if (v === 'normal' || v === 'caution' || v === 'bad') nextMarks[i] = v })
    setFaMarks(nextMarks)
    setFaChecked(new Set(dmpItems.map(it => it.i)))
    setFaReinspecting(false)
    photo.reset(); setSubmitError(null); setJustSaved(false)
    const savedMemo = monthRecords[selectedCp.id]?.memo ?? ''
    const autoAtSave = faAutoMemoFor('전실제연댐퍼', dmpItems, nextMarks)
    setMemo(autoAtSave && savedMemo.startsWith(autoAtSave) ? savedMemo.slice(autoAtSave.length).replace(/^\n/, '') : savedMemo)
  }, [selectedCp?.id])// eslint-disable-line

  const faAuto = faAutoMemoFor('전실제연댐퍼', dmpItems, faMarks)
  const faResolved = faAllResolved(dmpItems, faMarks)
  const faSaved = !!selectedCp && Array.isArray(monthRecords[selectedCp.id]?.line_results) && (monthRecords[selectedCp.id]!.line_results as any[]).length > 0
  const faShowDone = faSaved && !faReinspecting
  const faReadonly = !!popupState || faShowDone
  const faAllChecked = dmpItems.length > 0 && faChecked.size === dmpItems.length

  const toggleItem = (i: number) => setFaChecked(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n })
  const toggleSelectAll = () => { if (faReadonly) return; setFaChecked(faAllChecked ? new Set<number>() : new Set(dmpItems.map(it => it.i))) }
  const applyResult = (val: CheckResult) => {
    if (faReadonly || faChecked.size === 0) return
    setFaMarks(prev => { const n = { ...prev }; faChecked.forEach(i => { n[i] = val }); return n })
    setFaChecked(new Set())
  }

  // 전실제연댐퍼 저장 — 선택 (계단전실,층) CP 1건에 line_results[10]+worst+조치심볼 (StairwellModal 미러)
  const handleDamperSave = async () => {
    if (!selectedCp || !faResolved || faReadonly) return  // 완료(done)/재진입 상태면 재저장 금지
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      const lineResultsArr = faLineResults(dmpItems, faMarks)
      const finalMemo = [faAuto, memo.trim()].filter(Boolean).join('\n')
      // 서버가 worst 롤업으로 result 덮음. 댐퍼는 조치용 remediation_symbol 도 함께 저장(i4 기판 > i0 모터).
      const faExtra: { line_results: string; remediation_symbol?: string } = { line_results: JSON.stringify(lineResultsArr) }
      const sym = damperRemediationSymbol(faMarks)
      if (sym) faExtra.remediation_symbol = sym
      await onSave(selectedCp.id, faWorst(faMarks), finalMemo, photoKey ?? undefined, faExtra)
      photo.reset(); setJustSaved(true); setFaReinspecting(false)
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  // 연결송수관 저장 (카드 없음, 단일 결과 — 별개 소화설비)
  const handleYscpSave = async () => {
    if (!yscpId) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      await onSave(yscpId, result, memo, photoKey ?? undefined)
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  // 결과 picker 클래스 (연결송수관 — pill + lucide outline + status outline+tinted bg)
  const resultPickerCls = (active: boolean, value: CheckResult) =>
    active
      ? value === 'normal' ? 'border-safe-bar bg-safe-bg text-safe'
        : value === 'caution' ? 'border-warning-bar bg-warning-bg text-warning'
        : 'border-danger-bar bg-danger-bg text-danger'
      : 'border-border-default bg-surface-raised text-text-tertiary'

  const resultIcon = (value: CheckResult) =>
    value === 'normal' ? CheckCircle2 : value === 'caution' ? AlertTriangle : XCircle

  return (
    <div
      className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col overflow-hidden"
      style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
    >

      {/* 헤더 */}
      <div className="flex items-center gap-2.5 h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0">
        <Shield className="w-[18px] h-[18px] text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-title font-semibold text-text-primary leading-tight truncate">
            {group.labels[0]}
            {group.labels.length > 1 && (
              <span className="text-caption text-text-tertiary font-normal ml-1.5">· {group.labels.slice(1).join(' · ')}</span>
            )}
          </div>
        </div>
      </div>

      {/* 항목 선택 */}
      <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0">
        <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">항목 선택</div>
        <div className="flex gap-2">
          {(['전실제연댐퍼','연결송수관'] as const).map(label => {
            const catCPs  = allCheckpoints.filter(cp => cp.category === label)
            const allDone = catCPs.length > 0 && catCPs.every(cp => isCpCompleted(monthRecords[cp.id]))
            const isSel   = item === label
            const cls = isSel
              ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
              : allDone
                ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                : 'border border-border-strong bg-surface-page text-text-secondary'
            return (
              <button key={label} onClick={() => setItem(label)}
                className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                {label}{allDone && !isSel && <Check size={12} className="inline-block ml-1 opacity-80" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 전실제연댐퍼 → 계단전실 선택 */}
      {item === '전실제연댐퍼' && (
        <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">계단전실 선택</div>
          <div className="flex gap-1.5">
            {stairNums.map(num => {
              const sCPs = allCheckpoints.filter(cp => cp.category === '전실제연댐퍼' && cp.locationNo?.endsWith(`-${num}`))
              const done = sCPs.length > 0 && sCPs.every(cp => isCpCompleted(monthRecords[cp.id]))
              const isSel = selectedStair === num
              const cls = isSel
                ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                : done
                  ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                  : 'border border-border-strong bg-surface-page text-text-secondary'
              return (
                <button key={num} onClick={() => { setSelectedStair(num); setSelectedFloor(null) }}
                  className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap inline-flex items-center justify-center cursor-pointer transition-colors ${cls}`}>
                  {num}{done && !isSel && <Check size={12} className="inline-block ml-1 opacity-80" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 전실제연댐퍼 → 층 선택 (선택된 계단전실의 접근 가능 층) */}
      {item === '전실제연댐퍼' && selectedStair && (
        <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">층 선택</div>
          <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {stairFloors.map(f => {
              const cp = allCheckpoints.find(c => c.category === '전실제연댐퍼' && c.locationNo?.endsWith(`-${selectedStair}`) && c.floor === f)
              const fDone = cp ? isCpCompleted(monthRecords[cp.id]) : false
              const isSel = f === selectedFloor
              return (
                <button key={f} onClick={() => setSelectedFloor(f)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    isSel ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                          : 'border border-border-strong bg-surface-page text-text-secondary'
                  }`}>
                  {f}{fDone && <Check size={11} className="inline-block ml-1 opacity-75" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 연결송수관 → 위치 선택 (DB 데이터 기반) */}
      {item === '연결송수관' && (
        <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">위치 선택</div>
          <div className="flex flex-wrap gap-2">
            {allCheckpoints.filter(cp => cp.category === '연결송수관').map(cp => {
              const isSel  = subItem === cp.location
              const isDone = isCpCompleted(monthRecords[cp.id])
              const cls = isSel
                ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                : isDone
                  ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                  : 'border border-border-strong bg-surface-page text-text-secondary'
              return (
                <button key={cp.id} onClick={() => setSubItem(cp.location)}
                  className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                  {cp.location}{isDone && !isSel && <Check size={12} className="inline-block ml-1 opacity-80" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 본문 (스크롤) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5">
        {!item && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">항목을 선택해 주세요</div>
        )}

        {/* 전실제연댐퍼 — 표준 Family A 카드 (계단전실+층 피커) */}
        {item === '전실제연댐퍼' && (
          <>
            {!selectedStair && (
              <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">계단전실을 선택해 주세요</div>
            )}
            {selectedStair && !selectedCp && (
              <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">층을 선택해 주세요</div>
            )}

            {/* 점검 내용 카드 — 오버레이에 덮이지 않음(readonly 조회) */}
            {selectedCp && (
              <FamilyACard
                category="전실제연댐퍼"
                items={dmpItems}
                marks={faMarks}
                checked={faChecked}
                readonly={faReadonly}
                allChecked={faAllChecked}
                onSelectAll={toggleSelectAll}
                onToggleCheck={toggleItem}
              />
            )}

            {/* 결과 ~ 특이사항 (이미 점검한 개소 오버레이가 이 영역만 덮음) */}
            {selectedCp && (
              <div className="relative">
                {popupState ? (
                  <InspectionRevisitPopup
                    variant={popupState.variant}
                    checkedAt={popupState.checkedAt}
                    inspectorName={popupState.inspectorName}
                    recordId={popupState.recordId}
                    onClose={dismiss}
                    onGoToRemediation={(recordId) => { dismiss(); navigate('/remediation/' + recordId) }}
                  />
                ) : faShowDone ? (
                  <InspectionRevisitPopup
                    variant="completed"
                    checkedAt={monthRecords[selectedCp.id]?.checkedAt ?? ''}
                    inspectorName={monthRecords[selectedCp.id]?.staffName ?? '—'}
                    onClose={() => setFaReinspecting(true)}
                  />
                ) : null}

                {/* 결과 버튼 — 체크된 행에 적용 */}
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
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                    <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <textarea
                      value={[faAuto, memo].filter(Boolean).join('\n')}
                      onChange={e => { const v = e.target.value; setMemo(faAuto && v.startsWith(faAuto) ? v.slice(faAuto.length).replace(/^\n/, '') : v) }}
                      placeholder="특이사항을 입력하세요"
                      className="flex-1 h-[72px] px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption resize-none outline-none box-border focus:border-border-focus transition-colors" />
                    <PhotoButton hook={photo} label="촬영" noCapture />
                  </div>
                </div>

                {submitError && <div className="mt-2 bg-danger-bg/40 border border-danger-bar/30 rounded-sm px-3 py-2 text-caption text-danger">{submitError}</div>}
                {justSaved && !submitError && <div className="mt-2 bg-safe-bg/40 border border-safe-bar/30 rounded-sm px-3 py-2 text-caption text-safe inline-flex items-center gap-1.5"><Check size={12} />저장 완료</div>}
              </div>
            )}
          </>
        )}

        {/* 연결송수관 — 개별 폼 (카드 없음, 별개 소화설비) */}
        {item === '연결송수관' && (
          <div className="relative flex flex-col gap-2.5">
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
            {!subItem && (
              <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">위치를 선택해 주세요</div>
            )}
            {subItem && (
              <>
                {yscpId && isCpCompleted(monthRecords[yscpId]) && !justSaved && (
                  <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-[9px] text-label text-safe flex items-center gap-1.5"><Check size={14} />이미 점검 완료된 항목입니다</div>
                )}
                <div>
                  <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">점검 결과</div>
                  <div className="flex gap-2">
                    {INSPECT_RESULT_OPTIONS.map(opt => {
                      const Icon = resultIcon(opt.value)
                      const active = result === opt.value
                      return (
                        <button key={opt.value} onClick={() => setResult(opt.value)}
                          className={`flex-1 px-2 py-[9px] rounded-pill border-[1.5px] text-body-sm font-bold whitespace-nowrap inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${resultPickerCls(active, opt.value)}`}>
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* 연결송수관은 증상 피커 없음 — 전실제연댐퍼와 별개 소화설비 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                    <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요"
                      className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none font-sans outline-none box-border placeholder:text-text-tertiary" />
                    <PhotoButton hook={photo} label="촬영" noCapture />
                  </div>
                </div>
                {submitError && <div className="bg-danger-bg border border-danger-bar rounded-sm px-3 py-2 text-label text-danger">{submitError}</div>}
                {justSaved  && <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-2 text-label text-safe flex items-center gap-1.5"><Check size={14} />저장 완료</div>}
              </>
            )}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        {item === '전실제연댐퍼' && selectedCp && !faResolved && (
          <div className="mb-1.5 text-caption text-warning font-semibold text-center leading-snug">
            모든 항목의 점검 결과를 입력해야 저장됩니다 (‘전체 선택’ → 정상)
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-sunken transition-colors">
            닫기
          </button>
          {item === '연결송수관' ? (
            <button
              onClick={handleYscpSave}
              disabled={submitting || photo.uploading || !yscpId}
              className={`flex-1 py-3 rounded-md border-0 text-label font-bold transition-shadow ${
                submitting || photo.uploading || !yscpId
                  ? 'bg-border-default text-text-tertiary cursor-default'
                  : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] text-text-on-accent cursor-pointer hover:shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
              }`}
            >
              {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : '점검 기록 저장'}
            </button>
          ) : (
            <button
              onClick={handleDamperSave}
              disabled={submitting || photo.uploading || !selectedCp || !faResolved || faReadonly}
              className={`flex-1 py-3 rounded-md border-0 text-label font-bold transition-shadow ${
                submitting || photo.uploading || !selectedCp || !faResolved || faReadonly
                  ? 'bg-border-default text-text-tertiary cursor-default'
                  : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] text-text-on-accent cursor-pointer hover:shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
              }`}
            >
              {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : (selectedCp && !faResolved) ? '전 항목 결과 입력 필요' : '점검 기록 저장'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inspection Modal (전체화면) ────────────────────────
// ── Family A (증상피커 없는 공용 InspectionModal) 점검내용 카드 대상 카테고리 ──
// 증분 A: 청정소화약제·소방펌프·완강기 (Family A 공용카드, 증상피커 없음).
// 증분 B: 소화전 추가 — 소화전+비상콘센트 그룹이 Family A 이중 카드(pairedBC 함께 저장).
//         소화전은 라인0(위치표시등)/라인3(소화전함·호스) 특례(faAutoMemoFor·hydrantRemediationSymbol).
// 완강기 카드는 A 포함(사용자 확정, 13개소); 완강기 엑셀(피난방화 sheet6)만 증분 C.
const FAMILY_A_CATEGORIES = ['청정소화약제', '소방펌프', '완강기', '소화전', '방화셔터']

// 전실제연댐퍼 조치용 remediation_symbol 도출(개소당 단일). 우선순위: i4(수동기동→'기판 조작 불량') > i0(공기유입구→'모터 기능 이상').
// 반환값은 special[i].symbol 문자열 그대로 — RemediationDetailPage 가 이 심볼로 기본 조치/자재를 역매핑.
function damperRemediationSymbol(marks: Record<number, FaMark>): string | undefined {
  const special = inspectionContent['전실제연댐퍼']?.special
  if (!special) return undefined
  if (marks[4] === 'caution' || marks[4] === 'bad') return special['4'].symbol as string
  if (marks[0] === 'caution' || marks[0] === 'bad') return special['0'].symbol as string
  return undefined
}

// 방화셔터 조치용 remediation_symbol 도출(개소당 단일). 우선순위: i2(연동제어기 전원·스위치→'연동제어기 기판 작동 불', 기능결함) > i9(표식→'방화셔터 라인 표시 필요').
function fireShutterRemediationSymbol(marks: Record<number, FaMark>): string | undefined {
  const special = inspectionContent['방화셔터']?.special
  if (!special) return undefined
  if (marks[2] === 'caution' || marks[2] === 'bad') return special['2'].symbol as string
  if (marks[9] === 'caution' || marks[9] === 'bad') return special['9'].symbol as string
  return undefined
}

function InspectionModal({ group, allCheckpoints, records, monthRecords, recordCounts, markerRecords, scheduleItems, onClose, onSave, initialCpId }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  recordCounts?:  Record<string, number>
  markerRecords?: Record<string, CheckResult>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string, extra?: { guide_light_type?: string; floor_plan_marker_id?: string; line_results?: string; remediation_symbol?: string }) => Promise<void>
  initialCpId?:   string
}) {
  const navigate = useNavigate()
  const isGuideLight = group.categories.includes('유도등')
  // Family A (청정·펌프·완강기·소화전): 공용 카드. faItems 는 selectedCP 정의 후 아래에서 계산.
  const isFamilyA = FAMILY_A_CATEGORIES.includes(group.categories[0])
  const [faMarks,   setFaMarks]   = useState<Record<number, FaMark>>({})
  const [faChecked, setFaChecked] = useState<Set<number>>(new Set())
  // 소화전+비상콘센트 두 번째 카드(비상콘센트, pairedBC) 전용 상태
  const [faMarks2,   setFaMarks2]   = useState<Record<number, FaMark>>({})
  const [faChecked2, setFaChecked2] = useState<Set<number>>(new Set())
  const [faReinspecting,  setFaReinspecting]  = useState(false)  // 소화전/단일 카드 '재점검'(편집) 모드 — done 오버레이 해제
  const [faReinspecting2, setFaReinspecting2] = useState(false)  // 비상콘센트(pairedBC) 카드 재점검 — 카드별 독립
  const [glMarkers, setGlMarkers] = useState<FloorPlanMarker[]>([])
  const photo   = usePhotoUpload('inspection')
  const bcPhoto = usePhotoUpload('inspection-bc')
  // ▶ groupCPs memoize — 이 참조가 안정돼야 피커가 리셋 안 됨
  const groupCPs       = useMemo(() => allCheckpoints.filter(cp => group.categories.includes(cp.category)), [allCheckpoints, group])
  const isSohwaGroup   = group.categories.includes('소화전') && group.categories.includes('비상콘센트')
  const availableZones = useMemo(() => getAvailableZones(groupCPs), [groupCPs])

  const [selectedZone,  setSelectedZone]  = useState<ZoneKey | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null)
  const [pickerIdx,     setPickerIdx]     = useState(0)
  const [result,        setResult]        = useState<CheckResult>('normal')
  const [memo,          setMemo]          = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [submitError,   setSubmitError]   = useState<string | null>(null)
  const [justSaved,     setJustSaved]     = useState(false)
  const [visible,       setVisible]       = useState(false)
  const [bcMemo,        setBcMemo]        = useState('')   // 비상콘센트(pairedBC) 수동 특이사항
  const [symptomPick,   setSymptomPick]   = useState<string>('점등 이상')
  const [symptomCustom, setSymptomCustom] = useState('')
  const [extSymptomPick, setExtSymptomPick] = useState<string>('받침 파손')
  // 소화전 라인3(소화전함·호스) 인라인 증상 피커. 구식 전역 4버튼 피커(hydrantSymptomPick)는 폐기.
  const [hydrantLinePick,   setHydrantLinePick]   = useState<string>('경종')
  const [hydrantLineCustom, setHydrantLineCustom] = useState('')

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  // 구역 자동 선택 (QR 체크포인트 또는 첫 번째 구역)
  useEffect(() => {
    if (availableZones.length > 0 && !selectedZone) {
      if (initialCpId) {
        const cp = allCheckpoints.find(c => c.id === initialCpId)
        if (cp) {
          const zone = ZONE_CONFIG.find(z => matchZone(cp, z.key))
          if (zone) { setSelectedZone(zone.key); return }
        }
      }
      setSelectedZone(availableZones[0])
    }
  }, [availableZones])

  const availableFloors = useMemo(() =>
    selectedZone ? getFloorsByZone(groupCPs, selectedZone) : [],
    [groupCPs, selectedZone]
  )

  // 층 자동 선택 (QR 체크포인트 또는 첫 번째 층)
  useEffect(() => {
    if (availableFloors.length > 0 && !selectedFloor) {
      if (initialCpId) {
        const cp = allCheckpoints.find(c => c.id === initialCpId)
        if (cp && availableFloors.includes(cp.floor)) { setSelectedFloor(cp.floor); return }
      }
      setSelectedFloor(availableFloors[0])
    }
  }, [availableFloors])

  // 유도등: 선택된 층의 마커 로드
  useEffect(() => {
    if (!isGuideLight || !selectedFloor) { setGlMarkers([]); return }
    floorPlanMarkerApi.list(selectedFloor, 'guidelamp').then(setGlMarkers).catch(() => setGlMarkers([]))
  }, [isGuideLight, selectedFloor])

  const initialCpAppliedRef = useRef(false)

  // ▶ floorCPs memoize — pickerIdx 변경에는 재계산 안 됨
  const floorCPs = useMemo(() =>
    selectedZone && selectedFloor
      ? groupCPs.filter(cp => matchZone(cp, selectedZone) && cp.floor === selectedFloor)
      : [],
    [groupCPs, selectedZone, selectedFloor]
  )

  // 유도등: 마커 → synthetic CheckPoint 매핑
  const MARKER_TO_GL_COL: Record<string, string> = {
    ceiling_exit: 'ceiling_exit',
    wall_exit: 'wall_exit',
    room_corridor: 'room_passage',
    hallway_corridor: 'corridor_passage',
    stair_corridor: 'stair_passage',
  }
  const GL_COL_LABEL: Record<string, string> = {
    ceiling_exit: '천장피난구',
    wall_exit: '벽부피난구',
    room_passage: '거실통로',
    corridor_passage: '복도통로',
    stair_passage: '계단통로',
    audience_passage: '객석통로',
  }

  // 소화전/비상콘센트 혼합 그룹 피커 소스:
  // 소화전이 있는 층 → 소화전만, 소화전 없는 층(지하 등) → 비상콘센트 직접 표시
  const pickerSourceCPs = useMemo(() => {
    if (isGuideLight) {
      if (!selectedZone) return []
      const zoneMatch = (mzone: string | null | undefined): boolean => {
        // 'common' 은 0081 이전 legacy 값 — 'basement' 와 동일 처리.
        if (selectedZone === 'underground') return mzone === 'basement' || mzone === 'common'
        if (selectedZone === 'office')      return mzone === 'office'
        // research
        return mzone === 'research' || mzone === 'basement' || mzone === 'common'
      }
      return glMarkers
        .filter(m => zoneMatch((m as any).zone))
        .map((m, idx) => {
          // description: 마커에 저장된 값이 있으면 우선 사용 ('[접근불가]' 등 판정용).
          // 없으면 marker_type 의 한글 라벨을 기본값으로 (기존 동작 유지).
          const markerDesc = (m as any).description as string | null | undefined
          const typeLabel = GL_COL_LABEL[MARKER_TO_GL_COL[m.marker_type ?? ''] ?? ''] ?? ''
          const desc = (markerDesc && markerDesc.trim()) ? markerDesc : typeLabel
          return {
            id: 'MARKER:' + m.id,
            qrCode: '',
            floor: m.floor as any,
            zone: m.zone as any,
            location: m.label || `${typeLabel || '유도등'} #${idx + 1}`,
            category: '유도등',
            description: desc,
            locationNo: MARKER_TO_GL_COL[m.marker_type ?? ''] ?? '',
          } as any as CheckPoint
        })
    }
    if (!isSohwaGroup) return floorCPs
    const sohwaCPs = floorCPs.filter(cp => cp.category === '소화전')
    return sohwaCPs.length > 0 ? sohwaCPs : floorCPs.filter(cp => cp.category === '비상콘센트')
  }, [isGuideLight, glMarkers, selectedZone, isSohwaGroup, floorCPs])
  // 피커 표시 대상: defaultResult 는 자동 정상 처리라 제외.
  // 접근불가 cp 는 피커에 포함 → 선택 시 AccessBlockedPopup 오버레이로 안내 (자동 스킵 안 함).
  // 유도등 마커도 비-유도등과 동일하게 처리 (완료 마커를 피커에 남겨 재진입 팝업이 뜰 수 있게).
  const pendingCPs = useMemo(() => pickerSourceCPs.filter(cp => {
    if (cp.defaultResult) return false
    return true
  }), [pickerSourceCPs])

  // 초기 포커스: QR 지정이 있으면 그 개소, 없으면 첫 미완료, 전부 완료면 0.
  // 접근불가 cp 는 "첫 미완료" 후보에서 제외 (실제 점검 대상 먼저 보여주기 위함).
  useEffect(() => {
    if (initialCpAppliedRef.current || pendingCPs.length === 0) return
    if (initialCpId) {
      const idx = pendingCPs.findIndex(cp => cp.id === initialCpId)
      if (idx >= 0) {
        setPickerIdx(idx)
        initialCpAppliedRef.current = true
        return
      }
    }
    const firstPending = pendingCPs.findIndex(cp => !monthRecords[cp.id] && !cp.description?.includes('접근불가'))
    setPickerIdx(firstPending >= 0 ? firstPending : 0)
    initialCpAppliedRef.current = true
  }, [initialCpId, pendingCPs, monthRecords])

  const currentSelCP = pendingCPs[pickerIdx] ?? null
  const isAccessBlocked = !!currentSelCP?.description?.includes('접근불가')

  // Bug F: 접근불가 팝업에서 '확인' 눌렀는데 이동할 다음 층이 없는 경우
  //  → 모달은 유지하고 해당 cp 의 팝업만 닫는다. 다른 cp 로 이동하면 자동 리셋.
  const [dismissedBlockedId, setDismissedBlockedId] = useState<string | null>(null)
  useEffect(() => {
    if (dismissedBlockedId && currentSelCP?.id !== dismissedBlockedId) {
      setDismissedBlockedId(null)
    }
  }, [currentSelCP?.id, dismissedBlockedId])
  const showAccessBlockedPopup = isAccessBlocked && dismissedBlockedId !== currentSelCP?.id

  // ── 재진입 팝업 (공통 훅) ──
  // 유도등: cp.id = 'MARKER:{markerId}'. loadTodayRecords 가 monthRecords 에 같은 키로
  // 엔트리를 병행 적재하므로, 훅에 그대로 넘기면 (가)/(나) 팝업이 동일하게 뜬다.
  // 접근불가 cp 는 AccessBlockedPopup 이 우선하므로 훅은 호출하지 않음.
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: isAccessBlocked ? null : (currentSelCP?.id ?? null),
    category:     isGuideLight ? '유도등' : (group.categories[0] ?? null),
    monthRecords,
    scheduleItems,
  })

  const selectedCP   = pendingCPs[pickerIdx] ?? null
  const totalCount   = pickerSourceCPs.length
  // QR 스캔으로 들어온 cp 는 이미 저장돼도 pendingCPs 에 남아 있어서
  // totalCount - pendingCPs.length 로 계산하면 완료수가 1 부족해짐.
  // 실제 저장 기록(records / markerRecords / defaultResult / [접근불가]) 기준으로 집계.
  const doneCount    = isGuideLight
    ? pickerSourceCPs.filter(cp => {
        const mid = cp.id.startsWith('MARKER:') ? cp.id.slice(7) : ''
        return !!markerRecords?.[mid]
      }).length
    : pickerSourceCPs.filter(cp =>
        monthRecords[cp.id] || cp.defaultResult || cp.description?.includes('접근불가')
      ).length
  // (H1 — '이 층 점검 완료' 배너/플래그 제거. 개소 카드의 doneCount/totalCount 표기만 유지.)

  // 선택된 소화전과 같은 location_no를 가진 비상콘센트 (소화전인 경우에만)
  const pairedBC = useMemo(() =>
    isSohwaGroup && selectedCP?.category === '소화전' && selectedCP?.locationNo
      ? floorCPs.find(cp => cp.category === '비상콘센트' && cp.locationNo === selectedCP.locationNo) ?? null
      : null,
    [isSohwaGroup, selectedCP, floorCPs]
  )

  // Family A 카드 항목. ★ group.categories[0] 이 아니라 선택 개소 카테고리 기준 —
  // 소화전 없는 층의 단독 비상콘센트도 올바른 항목을 보이게 함.
  const faCategory = isFamilyA ? (selectedCP?.category ?? group.categories[0]) : ''
  const faItems: InspectionItem[] = faCategory ? (inspectionContent[faCategory]?.items ?? []) : []
  const isHydrant = faCategory === '소화전'
  const isFireShutter = faCategory === '방화셔터'
  // 두 번째 카드(비상콘센트) — 소화전에 pairedBC 가 있을 때만
  const faItems2: InspectionItem[] = pairedBC ? (inspectionContent['비상콘센트']?.items ?? []) : []

  // ── 소화기 상세정보 ──
  const isExtinguisher = group.categories.includes('소화기')
  const [extDetail, setExtDetail] = useState<ExtinguisherDetail | null>(null)

  // ── Phase 24: 정보 수정 / 분리 모달 상태 ──
  const [editExtModalOpen, setEditExtModalOpen] = useState<ExtinguisherDetail | null>(null)
  const [unassignConfirmExt, setUnassignConfirmExt] = useState<ExtinguisherDetail | null>(null)
  // 정보 수정 모달 로컬 입력 상태
  const [editExtForm, setEditExtForm] = useState<{
    type: string; prefix_code: string; seal_no: string; serial_no: string;
    approval_no: string; manufactured_at: string; manufacturer: string;
  }>({ type:'', prefix_code:'', seal_no:'', serial_no:'', approval_no:'', manufactured_at:'', manufacturer:'' })

  // editExtModalOpen 이 열릴 때 원본 값으로 초기화
  useEffect(() => {
    if (editExtModalOpen) {
      setEditExtForm({
        type:          editExtModalOpen.type          ?? '',
        prefix_code:   editExtModalOpen.prefix_code   ?? '',
        seal_no:       editExtModalOpen.seal_no       ?? '',
        serial_no:     editExtModalOpen.serial_no     ?? '',
        approval_no:   editExtModalOpen.approval_no   ?? '',
        manufactured_at: editExtModalOpen.manufactured_at ?? '',
        manufacturer:  editExtModalOpen.manufacturer  ?? '',
      })
    }
  }, [editExtModalOpen?.mgmt_no])

  const qcInspection = useQueryClient()

  const updateExtMutation = useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: Record<string, string | null> }) =>
      extinguisherApi.update(id, fields as any),
    onSuccess: () => {
      qcInspection.invalidateQueries({ queryKey: ['extinguishers'] })
      // 현재 CP 의 extDetail 도 갱신
      if (selectedCP) {
        extinguisherApi.getDetail(selectedCP.id).then(d => setExtDetail(d)).catch(() => {})
      }
      toast.success('수정 완료')
      setEditExtModalOpen(null)
    },
    onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
  })

  const unassignExtMutation = useMutation({
    mutationFn: (id: number) => extinguisherApi.unassign(id),
    onSuccess: () => {
      qcInspection.invalidateQueries({ queryKey: ['extinguishers'] })
      setExtDetail(null)
      toast.success('분리 완료')
      setUnassignConfirmExt(null)
    },
    onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
  })

  // CP 바뀌면 기존 기록 로드 (없으면 기본값 '정상') + 사진 초기화
  useEffect(() => {
    if (selectedCP) {
      const existing = records[selectedCP.id]
      setResult(INSPECT_RESULT_OPTIONS.some(o => o.value === existing) ? existing! : 'normal')
      setMemo('')
      setSubmitError(null)
      setJustSaved(false)
      photo.reset()
      setBcMemo('')
      bcPhoto.reset()
      // Family A: 기간 스코프 로드 — monthRecords[cpId].line_results 에서 전 항목 결과(정상/주의/불량) 복원.
      // 저장 기록 없으면 빈 카드(전 항목 결과 미입력 = 점검 미완료). 새 점검 기간 = 빈 카드.
      if (isFamilyA) {
        const saved = monthRecords[selectedCP.id]?.line_results
        const nextMarks: Record<number, FaMark> = {}
        if (Array.isArray(saved)) {
          saved.forEach((v, i) => { if (v === 'normal' || v === 'caution' || v === 'bad') nextMarks[i] = v })
        }
        setFaMarks(nextMarks)
        // 첫 진입 시 점검 내용 전체 선택 상태(전 항목 체크) — 정상 일괄 적용 등 빠른 입력 목적.
        setFaChecked(new Set(faItems.map(it => it.i)))
        setFaReinspecting(false)   // 개소 전환 시 재점검 모드 해제 → 저장된 개소면 done 오버레이 표시
        setFaReinspecting2(false)  // 카드별 독립 — 개소 전환 시 둘 다 해제
        // 소화전 라인3 피커 선택값 복원(remediation_symbol → pick/custom). 라인3 우선 저장이라 역매핑 가능.
        let hpick = '경종', hcustom = ''
        if (selectedCP.category === '소화전') {
          const sym = monthRecords[selectedCP.id]?.remediation_symbol ?? ''
          if (sym === '경종 파손') hpick = '경종'
          else if (sym === '호스걸이 파손') hpick = '호스걸이'
          else if (sym && sym !== '위치표시등 점등 이상' && (nextMarks[3] === 'caution' || nextMarks[3] === 'bad')) { hpick = '직접 입력'; hcustom = sym }
          setHydrantLinePick(hpick)
          setHydrantLineCustom(hcustom)
        }
        // WR-02: 저장된 memo 에서 자동문구(auto) 프리픽스를 벗겨 수동분(manual)만 복원.
        // auto 는 복원된 marks(+소화전 피커)로 결정적이라 저장 당시와 일치 → 남은 tail 이 수동 기입분.
        const savedMemo = monthRecords[selectedCP.id]?.memo ?? ''
        const autoAtSave = faAutoMemoFor(selectedCP.category, faItems, nextMarks, { hydrantPick: hpick, hydrantCustom: hcustom })
        const manual = autoAtSave && savedMemo.startsWith(autoAtSave)
          ? savedMemo.slice(autoAtSave.length).replace(/^\n/, '')
          : savedMemo
        setMemo(manual)
        // 두 번째 카드(비상콘센트, pairedBC) 복원 — line_results + manual memo
        if (pairedBC) {
          const saved2 = monthRecords[pairedBC.id]?.line_results
          const nextMarks2: Record<number, FaMark> = {}
          if (Array.isArray(saved2)) {
            saved2.forEach((v, i) => { if (v === 'normal' || v === 'caution' || v === 'bad') nextMarks2[i] = v })
          }
          setFaMarks2(nextMarks2)
          setFaChecked2(new Set(faItems2.map(it => it.i)))  // 첫 진입 시 전체 선택
          const savedMemo2 = monthRecords[pairedBC.id]?.memo ?? ''
          const autoAtSave2 = faAutoMemo(faItems2, nextMarks2)
          const manual2 = autoAtSave2 && savedMemo2.startsWith(autoAtSave2)
            ? savedMemo2.slice(autoAtSave2.length).replace(/^\n/, '')
            : savedMemo2
          setBcMemo(manual2)
        } else {
          setFaMarks2({})
          setFaChecked2(new Set())
        }
      }
      // 소화기면 상세정보 로드
      if (isExtinguisher) {
        setExtDetail(null)
        extinguisherApi.getDetail(selectedCP.id).then(d => setExtDetail(d)).catch(() => {})
      }
    }
  }, [selectedCP?.id]) // eslint-disable-line

  const handleZoneChange = (z: ZoneKey) => {
    setSelectedZone(z)
    setSelectedFloor(null)
    setPickerIdx(0)
  }

  const handleFloorChange = (f: Floor) => {
    setSelectedFloor(f)
    setPickerIdx(0)
  }

  const handlePickerSelect = useCallback((idx: number) => setPickerIdx(idx), [])

  // 저장/접근불가 확인 후 다음 미완료 개소로 자동 이동.
  // 접근불가/defaultResult/이미 완료 된 개소는 건너뛴다.
  // Bug E 수정: AccessBlockedPopup '확인' 에서 호출될 때 accessible 한 대상이
  // 전혀 없는 경우(잔여 전부 접근불가 등) 현재 cp 에 그대로 머물러 사용자가
  // "확인 버튼이 안 눌린다" 고 체감하던 문제 해결.
  // Bug F 수정(초판): Bug E 폴백이 `onClose()` 로 모달을 닫아버리면 "다음 층에
  // 점검할 개소가 있을 수 있는데 닫히는건 불편" 하다는 사용자 피드백 반영.
  // Bug F-a 추가 수정: 같은 층에 접근불가 cp 가 2개 이상 있는데 첫 cp 에서 확인을
  // 눌러도 두 번째 cp 로 이동하지 않던 문제. 기존 폴백은 "accessible 한 cp 없으면
  // 바로 다음 층" 이라 같은 층의 잔여 접근불가 cp 를 건너뛰었다.
  // Bug F-a 수정 (Task 5): Task 13(fad7fc5) 의 7단계 폴백 중 "현재 층 다른
  // 접근불가 cp (first)" 단계가 2-개 접근불가 cp 만 있는 층에서 무한 순환을
  // 유발 (A→B→A). linear forward 만 유지하기 위해 first-재탐색을 제거.
  //
  // fromAccessBlocked=true 폴백 체인 (순서 보장, 6단계):
  //   1) 현재 층의 accessible next cp (피커 인덱스 i > pickerIdx)
  //   2) 현재 층의 accessible first cp (처음부터 재탐색 — 점검 가능한 cp 는
  //      전체 탐색이 맞음)
  //   3) 현재 층의 다른 접근불가 cp (현재 제외, i > pickerIdx) — next 만
  //   4) 같은 zone 내 다음 층 (availableFloors[currIdx+1])
  //   5) 다음 zone 첫 층 (availableZones 순서; selectedFloor=null 으로 두면
  //      useEffect 가 availableFloors[0] 으로 자동 설정)
  //   6) 그 외: dismissedBlockedId 설정 — 팝업만 닫고 모달 유지.
  //
  // fromAccessBlocked 없을 때(handleSave auto-advance)는 기존 4-tier 그대로.
  //
  // Bug I 수정 (260424-7l2-06): 유도등 마커 description='[접근불가]' 에서 호출된
  // AccessBlockedPopup '확인' 이 전혀 반응하지 않던 문제. `if (isGuideLight) return`
  // 가드가 맨 앞에 있어 fromAccessBlocked 분기에도 진입 전에 no-op 으로 종료됐음.
  // 유도등도 일반 카테고리와 동일 의미로 pickerIdx / selectedFloor / selectedZone
  // 기반 네비게이션이 작동하므로 fromAccessBlocked=true 에 한해 가드를 통과시킨다.
  // handleSave auto-advance 경로는 유도등에서 여전히 no-op (기존 동작 보존).
  const advanceToNextPending = (skipCpId?: string, fromAccessBlocked?: boolean) => {
    if (isGuideLight && !fromAccessBlocked) return
    const isIncomplete = (cp: CheckPoint, alsoSkipId?: string) =>
      cp.id !== alsoSkipId && !monthRecords[cp.id] && !cp.defaultResult && !cp.description?.includes('접근불가')

    if (fromAccessBlocked) {
      // Step 1/2: 현재 층의 accessible(점검 가능) cp 탐색 — next 우선, 없으면 first.
      const nextIncIdx = pendingCPs.findIndex((cp, i) => i > pickerIdx && isIncomplete(cp, skipCpId))
      if (nextIncIdx >= 0) { setPickerIdx(nextIncIdx); return }
      const firstIncIdx = pendingCPs.findIndex(cp => isIncomplete(cp, skipCpId))
      if (firstIncIdx >= 0) { setPickerIdx(firstIncIdx); return }

      // Step 3: 현재 층의 다른 접근불가 cp 탐색 (현재 제외) — next 만.
      // first 재탐색 시 이전 cp 로 되돌아가 무한 순환이 발생하므로 linear forward
      // 만 유지. 사용자가 이전 접근불가 cp 로 돌아가려면 수동 스와이프/← 사용.
      // defaultResult (자동 처리) 인 접근불가 cp 는 피커에서 이미 제외됐으므로 여기서
      // 한 번 더 확인할 필요는 없지만 방어적으로 포함.
      const isBlockedOther = (cp: CheckPoint) =>
        cp.id !== skipCpId && !cp.defaultResult && !!cp.description?.includes('접근불가')
      const nextBlIdx = pendingCPs.findIndex((cp, i) => i > pickerIdx && isBlockedOther(cp))
      if (nextBlIdx >= 0) { setPickerIdx(nextBlIdx); return }

      // Step 4: 같은 zone 내 다음 층. availableFloors 는 cps 있는 층만 포함하므로
      // 그대로 +1 로 이동. 잔여(accessible/blocked) 여부는 이미 step 1~3 에서
      // 없음이 확정됐으므로 "다음 층 자체" 로만 이동.
      if (selectedFloor && selectedZone) {
        const currFloorIdx = availableFloors.indexOf(selectedFloor)
        if (currFloorIdx >= 0 && currFloorIdx + 1 < availableFloors.length) {
          setSelectedFloor(availableFloors[currFloorIdx + 1])
          setPickerIdx(0)
          return
        }
      }

      // Step 5: 다음 zone 첫 층. availableZones 는 ZONE_CONFIG(research → office →
      // underground) 순서를 그대로 유지한 subset. currZoneIdx+1 이 존재하면 이동.
      // selectedFloor=null 로 두면 availableFloors 재계산 후 useEffect 가 첫 층을
      // 자동 선택 (line ~2829). 피커는 useEffect 의 prevIdsRef 체크로 자동 리셋.
      if (selectedZone) {
        const currZoneIdx = availableZones.indexOf(selectedZone)
        if (currZoneIdx >= 0 && currZoneIdx + 1 < availableZones.length) {
          setSelectedZone(availableZones[currZoneIdx + 1])
          setSelectedFloor(null)
          setPickerIdx(0)
          return
        }
      }

      // Step 6: 최후 폴백 — 팝업만 닫고 모달 유지. 사용자가 ‹/› / 구역·층 탭 /
      // 닫기 버튼으로 수동 탈출.
      if (skipCpId) setDismissedBlockedId(skipCpId)
      return
    }

    // handleSave 경로 (fromAccessBlocked 미전달) — 기존 4-tier 유지.
    const nextIdx = pendingCPs.findIndex((cp, i) => i > pickerIdx && isIncomplete(cp, skipCpId))
    if (nextIdx >= 0) { setPickerIdx(nextIdx); return }
    const firstIdx = pendingCPs.findIndex(cp => isIncomplete(cp, skipCpId))
    if (firstIdx >= 0) { setPickerIdx(firstIdx); return }
    if (selectedFloor && selectedZone) {
      // forward-only: 현재 층보다 뒤(availableFloors index 큰 쪽) 의 incomplete 층만 탐색.
      // 이전 층의 잔여 incomplete 는 자동 복귀하지 않음 — 사용자 수동 탐색 (260427).
      const currFloorIdx = availableFloors.indexOf(selectedFloor)
      const nextFloor = (currFloorIdx >= 0 ? availableFloors.slice(currFloorIdx + 1) : []).find(f => {
        const fCPs = groupCPs.filter(cp => matchZone(cp, selectedZone) && cp.floor === f)
        return fCPs.some(cp => isIncomplete(cp, skipCpId))
      })
      if (nextFloor) { setSelectedFloor(nextFloor); setPickerIdx(0); return }
      const nextZone = availableZones.find(z => {
        if (z === selectedZone) return false
        const zCPs = groupCPs.filter(cp => matchZone(cp, z))
        return zCPs.some(cp => isIncomplete(cp, skipCpId))
      })
      if (nextZone) { setSelectedZone(nextZone); setSelectedFloor(null); setPickerIdx(0); return }
    }
  }

  const handleSave = async () => {
    if (!result || !selectedCP) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      if (photo.hasPhoto && photoKey === null) throw new Error(photoUploadFailMsg(photo.vaultBacked))
      // ── Family A: 카드 기반 저장 (line_results + auto/manual 분리 memo + 로컬 worst) ──
      if (isFamilyA) {
        // 편집 중인(=done 오버레이로 덮이지 않은) 카드만 저장. done 카드는 이미 저장돼 있어 건너뜀
        // → 한쪽만 재점검한 경우 그 카드만 저장(변경 없는 카드는 재기록·재타임스탬프 안 함).
        const save1 = !faShowDone1
        const save2 = !!pairedBC && !faShowDone2
        if (save1) {
          const lineResultsArr = faLineResults(faItems, faMarks)
          // 소화전 특례(라인0 고정심볼·라인3 피커 프리픽스) 반영 auto. 비-소화전은 일반 C/D.
          const auto = faAutoMemoFor(faCategory, faItems, faMarks, { hydrantPick: hydrantLinePick, hydrantCustom: hydrantLineCustom })
          const faFinalMemo = [auto, memo.trim()].filter(Boolean).join('\n')
          // 서버가 worst 롤업으로 result 덮음. 소화전은 조치용 remediation_symbol 도 함께 저장.
          const faExtra: { line_results: string; remediation_symbol?: string } = { line_results: JSON.stringify(lineResultsArr) }
          if (isHydrant) {
            const sym = hydrantRemediationSymbol(faMarks, hydrantLinePick, hydrantLineCustom)
            if (sym) faExtra.remediation_symbol = sym
          } else if (isFireShutter) {
            const sym = fireShutterRemediationSymbol(faMarks)
            if (sym) faExtra.remediation_symbol = sym
          }
          await onSave(selectedCP.id, faWorst(faMarks), faFinalMemo, photoKey ?? undefined, faExtra)
        }
        // pairedBC(비상콘센트) — 편집 중일 때만 별도 저장 (특례 없음, 일반 C/D)
        if (save2 && pairedBC) {
          const lr2 = faLineResults(faItems2, faMarks2)
          const finalMemo2 = [faAutoMemo(faItems2, faMarks2), bcMemo.trim()].filter(Boolean).join('\n')
          const bcPhotoKey = await bcPhoto.upload()
          await onSave(pairedBC.id, faWorst(faMarks2), finalMemo2, bcPhotoKey ?? undefined, { line_results: JSON.stringify(lr2) })
        }
        photo.reset()
        bcPhoto.reset()
        setJustSaved(true)
        // 자동 다음이동 안 함 — 저장 직후 각 카드 '이미 점검 완료' done 상태로 완료를 확인시킨다.
        // (monthRecords 낙관적 갱신으로 faSaved1/2=true → faShowDone1/2=true → done 오버레이)
        setFaReinspecting(false)
        setFaReinspecting2(false)
        return
      }
      let finalMemo = memo
      let extra: { guide_light_type?: string; floor_plan_marker_id?: string } | undefined
      let cpIdToSave = selectedCP.id
      if (isGuideLight && selectedCP.id.startsWith('MARKER:')) {
        const markerId = selectedCP.id.slice(7)
        const glTypeFromMarker = (selectedCP as any).locationNo ?? ''
        // 실제 checkpoint 조회 (floor + zone)
        const realCp = groupCPs.find(cp => cp.floor === selectedFloor && matchZone(cp, selectedZone!))
        if (!realCp) { setSubmitError('유도등 개소를 찾을 수 없습니다'); setSubmitting(false); return }
        cpIdToSave = realCp.id
        extra = { floor_plan_marker_id: markerId, guide_light_type: glTypeFromMarker }
        if (result !== 'normal' && glTypeFromMarker !== 'audience_passage') {
          finalMemo = symptomPick === '직접 입력' ? memo.trim() : symptomPick
        } else {
          finalMemo = memo.trim()
        }
      } else if (isExtinguisher && result !== 'normal') {
        finalMemo = extSymptomPick === '직접 입력' ? memo.trim() : extSymptomPick
      }
      // 소화전(+비상콘센트 pairedBC)은 이제 Family A 이중 카드라 위 isFamilyA 분기에서 함께 저장됨.
      await onSave(cpIdToSave, result, finalMemo, photoKey ?? undefined, extra)
      photo.reset()
      bcPhoto.reset()
      setJustSaved(true)
      // 저장 후 다음 미완료로 자동 이동 (피커에 완료 개소도 포함되므로 records 기반 탐색)
      const justSavedId = cpIdToSave
      setTimeout(() => { advanceToNextPending(justSavedId) }, 600)
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Family A 카드 상호작용 ──
  const toggleFaCheck = (i: number) => setFaChecked(prev => {
    const next = new Set(prev)
    if (next.has(i)) next.delete(i); else next.add(i)
    return next
  })
  // 체크된 행 전부에 결과 명시 적용(정상/주의/불량) 후 체크 해제.
  const applyFaResult = (val: CheckResult) => {
    if (faReadonly1 || faChecked.size === 0) return  // 재방문 readonly 에서 결과 적용 차단
    setFaMarks(prev => {
      const next = { ...prev }
      faChecked.forEach(i => { next[i] = val })
      return next
    })
    setFaChecked(new Set())
  }
  // 두 번째 카드(비상콘센트) 상호작용
  const toggleFaCheck2 = (i: number) => setFaChecked2(prev => {
    const next = new Set(prev)
    if (next.has(i)) next.delete(i); else next.add(i)
    return next
  })
  const applyFaResult2 = (val: CheckResult) => {
    if (faReadonly2 || faChecked2.size === 0) return
    setFaMarks2(prev => {
      const next = { ...prev }
      faChecked2.forEach(i => { next[i] = val })
      return next
    })
    setFaChecked2(new Set())
  }
  // 이번 기간에 각 카드 레코드가 저장됐는가 (카드별 독립). pairedBC 없으면 faSaved2=false.
  // 카드별 done 이라 부분저장(소화전만 저장·비상콘센트 실패) 시에도 비상콘센트는 편집 가능(유실 방지).
  const faSaved1 = isFamilyA && !!selectedCP
    && Array.isArray(monthRecords[selectedCP.id]?.line_results)
    && (monthRecords[selectedCP.id]!.line_results as any[]).length > 0
  const faSaved2 = !!pairedBC
    && Array.isArray(monthRecords[pairedBC.id]?.line_results)
    && (monthRecords[pairedBC.id]!.line_results as any[]).length > 0
  // 각 카드 독립 done 상태 — 각자의 '확인(재점검)' 이 해당 카드만 편집 해제(스케줄 무관).
  const faShowDone1 = faSaved1 && !faReinspecting
  const faShowDone2 = faSaved2 && !faReinspecting2
  // 재방문 활성 창(오버레이)/접근불가 OR 해당 카드 done 이면 그 카드 readonly.
  const faReadonly1 = isFamilyA && (!!popupState || showAccessBlockedPopup || faShowDone1)
  const faReadonly2 = isFamilyA && (!!popupState || showAccessBlockedPopup || faShowDone2)
  // 전체 선택 / 선택 해제 토글 (타이틀 옆 버튼, 카드별)
  const faAllChecked = isFamilyA && faItems.length > 0 && faChecked.size === faItems.length
  const toggleSelectAllFa = () => {
    if (faReadonly1) return
    setFaChecked(faAllChecked ? new Set<number>() : new Set(faItems.map(it => it.i)))
  }
  const faAllChecked2 = !!pairedBC && faItems2.length > 0 && faChecked2.size === faItems2.length
  const toggleSelectAllFa2 = () => {
    if (faReadonly2) return
    setFaChecked2(faAllChecked2 ? new Set<number>() : new Set(faItems2.map(it => it.i)))
  }
  // 소화전 라인3 '직접 입력' 선택 시 커스텀 텍스트 필수 — 비우면 remediation_symbol 미저장·
  // auto 프리픽스만 남아 재방문 왕복이 깨지므로 저장을 막는다.
  const faHydrantPickOk = !isHydrant
    || !(faMarks[3] === 'caution' || faMarks[3] === 'bad')
    || hydrantLinePick !== '직접 입력'
    || !!hydrantLineCustom.trim()
  // 전 항목이 명시적 결과를 가졌는가 — 저장 허용 조건(미입력 항목 있으면 저장 차단). 두 카드 모두 충족해야.
  const faResolved = !isFamilyA || (faAllResolved(faItems, faMarks) && (!pairedBC || faAllResolved(faItems2, faMarks2)) && faHydrantPickOk)
  const faAuto  = isFamilyA ? faAutoMemoFor(faCategory, faItems, faMarks, { hydrantPick: hydrantLinePick, hydrantCustom: hydrantLineCustom }) : ''
  const faAuto2 = pairedBC ? faAutoMemo(faItems2, faMarks2) : ''

  // 현재 group 의 lucide/커스텀 아이콘 (헤더용)
  const headerGroupIdx = CATEGORY_GROUPS.findIndex(g => g === group)
  const HeaderIcon = headerGroupIdx >= 0 ? CATEGORY_ICONS[headerGroupIdx] : null

  // ── 렌더 ─────────────────────────────────────────────
  return (
    <div
      className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col"
      style={{
        top: 'var(--sat, 0px)',
        bottom: NAV_BOTTOM,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.26s cubic-bezier(0.32,0.72,0,1)',
      }}
    >

      {/* ── 헤더 ── */}
      <div className="shrink-0 bg-surface-page border-b border-border-default h-12 px-3 flex items-center gap-2.5">
        {HeaderIcon && <HeaderIcon size={22} className="text-text-secondary shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-title font-semibold text-text-primary truncate">
            {group.labels[0]}
            {group.labels.length > 1 && (
              <span className="text-caption text-text-tertiary font-normal ml-1.5">· {group.labels.slice(1).join(' · ')}</span>
            )}
          </div>
        </div>
        {isExtinguisher && (
          <button onClick={() => navigate('/extinguishers')}
                  className="h-7 px-3 rounded-[7px] bg-surface-sunken text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-active transition-colors">
            소화기 관리
          </button>
        )}
      </div>

      {/* ── 구역 선택 — CP가 2개 이상일 때만 ── */}
      {groupCPs.length > 1 && (
      <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default shrink-0">
        <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">구역 선택</div>
        <div className="flex gap-1.5">
          {ZONE_CONFIG.filter(z => availableZones.includes(z.key)).map(z => {
            const isSel = z.key === selectedZone
            const ZIcon = ZONE_ICONS[z.key]
            return (
              <button key={z.key} onClick={() => handleZoneChange(z.key)}
                      className={`flex-1 basis-0 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        isSel
                          ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                          : 'border border-border-strong bg-surface-page text-text-secondary'
                      }`}>
                {ZIcon && <ZIcon size={14} />}{z.label}
              </button>
            )
          })}
        </div>
      </div>
      )}

      {/* ── 층 선택 (구역 선택 후, CP가 2개 이상일 때만) ── */}
      {groupCPs.length > 1 && selectedZone && (
        <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">층 선택</div>
          <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {availableFloors.map(f => {
              const fCPs  = groupCPs.filter(cp => matchZone(cp, selectedZone) && cp.floor === f)
              // 260426-f54: '점검 시도 있음' 이 아니라 '확정 완료' 를 카운트 (isCpCompleted 룰)
              const fDone = fCPs.filter(cp => isCpCompleted(monthRecords[cp.id])).length
              const isSel = f === selectedFloor
              return (
                <button key={f} onClick={() => handleFloorChange(f)}
                        className={`flex-shrink-0 px-3.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${
                          isSel
                            ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                            : 'border border-border-strong bg-surface-page text-text-secondary'
                        }`}>
                  {f}{fDone > 0 && <span className="text-caption ml-0.5 opacity-75">({fDone})</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 개소 선택 — DIV 스타일 박스 + 좌우 스와이프 ── */}
      {/* H1 (260423-htx Task 5): '이 층 점검 완료 (N/N)' 배너 제거 —
         개소 카드 첫줄의 `doneCount/totalCount 완료` 표기로 대체. */}
      {selectedFloor && (isGuideLight ? pickerSourceCPs.length >= 1 : floorCPs.length >= 1) && (
        <div className="px-3.5 pt-2.5 pb-2 shrink-0 bg-surface-page">
          {pendingCPs.length >= 1 && (
            <div
              className="bg-surface-raised rounded-md px-3 py-2.5 border border-border-default flex items-center gap-2.5"
              style={{ touchAction: 'pan-y' }}
              onTouchStart={e => { (e.currentTarget as any)._swX = e.touches[0].clientX }}
              onTouchEnd={e => {
                const sx = (e.currentTarget as any)._swX
                if (sx == null) return
                const dx = e.changedTouches[0].clientX - sx
                if (dx > 40 && pickerIdx > 0) setPickerIdx(pickerIdx - 1)
                else if (dx < -40 && pickerIdx < pendingCPs.length - 1) setPickerIdx(pickerIdx + 1)
              }}
            >
              <button onClick={() => { if (pickerIdx > 0) setPickerIdx(pickerIdx - 1) }}
                      className={`w-9 h-9 rounded-sm border border-border-default bg-surface-page text-body font-bold flex items-center justify-center shrink-0 transition-opacity ${
                        pickerIdx > 0
                          ? 'text-text-primary cursor-pointer opacity-100'
                          : 'text-text-tertiary cursor-default opacity-30'
                      }`}>‹</button>
              <div className="flex-1 text-center">
                <div className="text-caption text-text-tertiary font-semibold">개소 ({pickerIdx + 1}/{pendingCPs.length}) · {doneCount}/{totalCount} 완료</div>
                {isExtinguisher && extDetail ? (
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <FireExtinguisherCustom size={14} className="text-text-secondary shrink-0" />
                    <span className="text-body-sm font-bold text-text-primary">{extDetail.mgmt_no}</span>
                    <span className="text-caption font-semibold text-danger bg-danger-bg px-1.5 py-0.5 rounded-sm">{extDetail.type}</span>
                  </div>
                ) : (
                  <>
                    <div className="text-label font-bold text-text-primary mt-0.5">{selectedCP?.location ?? ''}</div>
                    {selectedCP?.description && <div className="text-caption text-text-secondary mt-0.5">{selectedCP.description}</div>}
                  </>
                )}
                {/* H1 (260423-htx Task 5): '✓ 점검 완료' 초록 알약 제거 —
                    개소 카드 첫줄 `doneCount/totalCount 완료` 표기로 대체. */}
              </div>
              <button onClick={() => { if (pickerIdx < pendingCPs.length - 1) setPickerIdx(pickerIdx + 1) }}
                      className={`w-9 h-9 rounded-sm border border-border-default bg-surface-page text-body font-bold flex items-center justify-center shrink-0 transition-opacity ${
                        pickerIdx < pendingCPs.length - 1
                          ? 'text-text-primary cursor-pointer opacity-100'
                          : 'text-text-tertiary cursor-default opacity-30'
                      }`}>›</button>
            </div>
          )}
        </div>
      )}

      {/* ── 나머지 (스크롤 가능) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3.5 pt-2.5 pb-2 flex flex-col gap-2">
        {/* 접근불가 뱃지 (해당 항목만) */}
        {selectedCP?.defaultResult && (
          <div className="bg-warning-bg/40 border border-warning-bar/40 rounded-sm px-2.5 py-1.5 text-caption text-warning font-semibold">
            접근불가 구역 — 자동 정상 처리
          </div>
        )}
        {/* ── 소화기 상세정보 ── */}
        {isExtinguisher && selectedCP && extDetail && (() => {
          // 분말 소화기 교체 주기: 제조 후 10년 (헬퍼 위임 — src/utils/extinguisher.ts)
          const replaceWarning = getReplaceWarning(extDetail.type, extDetail.manufactured_at)
          const rwClass: Record<'danger' | 'imminent' | 'warn', { box: string; text: string }> = {
            danger:   { box: 'bg-danger-bg/60 border-danger-bar/40 text-danger',   text: '연한 초과 — 즉시 교체 필요' },
            imminent: { box: 'bg-fire-bg/60 border-fire-bar/40 text-fire',         text: '연한 임박 — 교체 시급' },
            warn:     { box: 'bg-warning-bg/60 border-warning-bar/40 text-warning',text: '연한 도래 — 교체 준비 필요' },
          }
          return (
            <div className="bg-surface-raised rounded-md px-3 py-2.5 border border-border-default">
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-caption">
                <div><span className="text-text-tertiary">위치 </span><span className="text-text-primary font-semibold">{extDetail.location || (extDetail as any).cp_location || '-'}</span></div>
                <div><span className="text-text-tertiary">제조업체 </span><span className="text-text-primary font-semibold">{extDetail.manufacturer ?? '-'}</span></div>
                <div><span className="text-text-tertiary">제조년월 </span><span className="text-text-primary font-semibold">{extDetail.manufactured_at ?? '-'}</span></div>
                <div><span className="text-text-tertiary">형식승인 </span><span className="text-text-primary font-semibold">{extDetail.approval_no ?? '-'}</span></div>
                <div><span className="text-text-tertiary">접두문자 </span><span className="text-text-primary font-semibold">{extDetail.prefix_code ?? '-'}</span></div>
                <div><span className="text-text-tertiary">증지번호 </span><span className="text-text-primary font-semibold">{extDetail.seal_no ?? '-'}</span></div>
                <div><span className="text-text-tertiary">제조번호 </span><span className="text-text-primary font-semibold">{extDetail.serial_no ?? '-'}</span></div>
              </div>
              {replaceWarning && (
                <div className={`mt-2 text-caption font-bold rounded-sm px-2.5 py-1.5 border ${rwClass[replaceWarning].box}`}>
                  {rwClass[replaceWarning].text}
                </div>
              )}
              {/* ── Phase 24: 정보 수정 / 소화기 분리 sub-action row ── */}
              {extDetail.id != null && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditExtModalOpen(extDetail)}
                    className="flex-1 h-button rounded-sm text-label font-bold bg-surface-sunken text-text-primary border border-border-strong cursor-pointer hover:bg-surface-active transition-colors">
                    정보 수정
                  </button>
                  <button
                    onClick={() => setUnassignConfirmExt(extDetail)}
                    className="flex-1 h-button rounded-sm text-label font-bold bg-danger-bg/60 text-danger border border-danger-bar/40 cursor-pointer hover:bg-danger-bg transition-colors">
                    소화기 분리
                  </button>
                </div>
              )}
              {extDetail.note && (
                <div className="mt-1.5 text-caption text-text-secondary bg-warning-bg/40 px-2 py-1 rounded-sm">
                  {extDetail.note}
                </div>
              )}
            </div>
          )
        })()}

        {/* Family A 점검내용 카드 — 결과 블록 위, 오버레이에 덮이지 않음(readonly 조회 가능) */}
        {selectedCP && isFamilyA && (
          <FamilyACard
            category={faCategory}
            items={faItems}
            marks={faMarks}
            checked={faChecked}
            readonly={faReadonly1}
            allChecked={faAllChecked}
            onSelectAll={toggleSelectAllFa}
            onToggleCheck={toggleFaCheck}
          />
        )}

        {/* 결과 선택 ~ 특이사항 영역 (이미 점검한 개소 오버레이 포함) */}
        {selectedCP && (
          <div className="relative">
            {/* 접근불가 개소 안내 팝업 (최우선) — 재진입 팝업보다 앞에 렌더 */}
            {showAccessBlockedPopup ? (
              <AccessBlockedPopup
                onConfirm={() => advanceToNextPending(selectedCP.id, true)}
              />
            ) : popupState ? (
              /* 재진입 팝업 (공통 컴포넌트) */
              <InspectionRevisitPopup
                variant={popupState.variant}
                checkedAt={popupState.checkedAt}
                inspectorName={popupState.inspectorName}
                recordId={popupState.recordId}
                onClose={dismiss}
                onGoToRemediation={(recordId) => { dismiss(); navigate('/remediation/' + recordId) }}
              />
            ) : faShowDone1 ? (
              /* 소화전/단일 카드: '이미 점검 완료' done 오버레이 (스케줄 무관). 확인=이 카드만 재점검 */
              <InspectionRevisitPopup
                variant="completed"
                checkedAt={monthRecords[selectedCP.id]?.checkedAt ?? ''}
                inspectorName={monthRecords[selectedCP.id]?.staffName ?? '—'}
                onClose={() => setFaReinspecting(true)}
              />
            ) : null}

            {/* Family A: 결과버튼 영역 — 체크된 행 전부에 적용(정상=되돌리기), 적용 후 체크 해제 */}
            {isFamilyA && (
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
                    const disabled = faChecked.size === 0 || faReadonly1  // WR-04
                    return (
                      <button key={opt.value} onClick={() => applyFaResult(opt.value)} disabled={disabled}
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
            )}

            {/* 소화전 라인3(소화전함·호스) 인라인 증상 피커 — 라인3 마킹 시에만 (readonly 제외) */}
            {isHydrant && (faMarks[3] === 'caution' || faMarks[3] === 'bad') && !faReadonly1 && (
              <div className="mt-2.5">
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">소화전함·호스 증상</div>
                <div className="flex flex-wrap gap-1.5">
                  {['경종','호스걸이','직접 입력'].map(s => {
                    const active = hydrantLinePick === s
                    return (
                      <button key={s} onClick={() => setHydrantLinePick(s)}
                        className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors ${
                          active
                            ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent'
                            : 'border-[1.5px] border-border-default bg-surface-raised text-text-secondary'
                        }`}>
                        {s}
                      </button>
                    )
                  })}
                </div>
                {hydrantLinePick === '직접 입력' && (
                  <input value={hydrantLineCustom} onChange={e => setHydrantLineCustom(e.target.value)} placeholder="증상 항목 직접 입력"
                    className="mt-1.5 w-full px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption outline-none box-border focus:border-border-focus transition-colors" />
                )}
              </div>
            )}

            {/* 결과 선택 — 1행 3열 (정상/주의/불량, 기본값 정상) */}
            {!isFamilyA && (
            <div>
              <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">점검 결과</div>
              <div className="flex gap-1.5">
                {INSPECT_RESULT_OPTIONS.map(opt => {
                  const RIcon = RESULT_ICONS[opt.value]
                  const isSel = result === opt.value
                  const activeCls = opt.value === 'normal'  ? 'border-2 border-safe-bar bg-safe-bg text-safe'
                                  : opt.value === 'caution' ? 'border-2 border-warning-bar bg-warning-bg text-warning'
                                  :                            'border-2 border-danger-bar bg-danger-bg text-danger'
                  return (
                    <button key={opt.value} onClick={() => setResult(opt.value)}
                            className={`flex-1 flex flex-col items-center gap-1 px-1 py-2.5 rounded-md cursor-pointer transition-colors ${
                              isSel ? activeCls : 'border border-border-default bg-surface-raised text-text-tertiary hover:bg-surface-active'
                            }`}>
                      {RIcon ? <RIcon size={20} /> : null}
                      <span className="text-caption font-bold">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            )}

            {/* 유도등: 증상 피커 (점검 결과 아래, 특이사항 위) */}
            {isGuideLight && result !== 'normal' && (selectedCP as any).locationNo !== 'audience_passage' && (
              <div className="mt-2.5">
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
                <div className="flex flex-wrap gap-1.5">
                  {['점등 이상','예비전원 이상','직접 입력'].map(s => {
                    const active = symptomPick === s
                    return (
                      <button key={s} onClick={() => setSymptomPick(s)}
                        className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors ${
                          active
                            ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent'
                            : 'border-[1.5px] border-border-default bg-surface-raised text-text-secondary'
                        }`}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 소화기: 증상 피커 (점검 결과 아래, 특이사항 위) */}
            {isExtinguisher && result !== 'normal' && (
              <div className="mt-2.5">
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
                <div className="flex flex-wrap gap-1.5">
                  {['받침 파손','연한 만료','직접 입력'].map(s => {
                    const active = extSymptomPick === s
                    return (
                      <button key={s} onClick={() => setExtSymptomPick(s)}
                        className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors ${
                          active
                            ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent'
                            : 'border-[1.5px] border-border-default bg-surface-raised text-text-secondary'
                        }`}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* (구식 소화전 전역 증상 피커 폐기 — 증분 B 라인3 인라인 피커로 대체) */}

            {/* 특이사항 + 증빙사진 (한 행). Family A: 자동 특이사항(마킹행 C/D)이 이 입력란에 함께 기재됨(별도 프리뷰 박스 없음). */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">
                  {isFamilyA ? '특이사항 (선택)' :
                    (isGuideLight && result !== 'normal' && (selectedCP as any).locationNo !== 'audience_passage' && symptomPick === '직접 입력')
                    || (isExtinguisher && result !== 'normal' && extSymptomPick === '직접 입력')
                    ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}
                </label>
                <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <textarea
                  value={isFamilyA ? [faAuto, memo].filter(Boolean).join('\n') : memo}
                  onChange={e => {
                    const v = e.target.value
                    if (isFamilyA) setMemo(faAuto && v.startsWith(faAuto) ? v.slice(faAuto.length).replace(/^\n/, '') : v)
                    else setMemo(v)
                  }}
                  placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption resize-none outline-none box-border focus:border-border-focus transition-colors" />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>
          </div>
        )}

        {/* 비상콘센트 (소화전과 location_no 가 같은 pairedBC) — Family A 두 번째 카드, 소화전과 함께 저장 */}
        {pairedBC && (
          <>
            <div className="h-px bg-border-default my-0.5" />
            <div className="bg-surface-raised rounded-md px-3 py-2 border border-border-default">
              <div className="text-caption text-text-tertiary">{pairedBC.category}</div>
              <div className="text-label font-bold text-text-primary mt-0.5">{pairedBC.location}</div>
              {pairedBC.description && <div className="text-caption text-text-tertiary mt-0.5">{pairedBC.description}</div>}
            </div>
            <FamilyACard
              category="비상콘센트"
              items={faItems2}
              marks={faMarks2}
              checked={faChecked2}
              readonly={faReadonly2}
              allChecked={faAllChecked2}
              onSelectAll={toggleSelectAllFa2}
              onToggleCheck={toggleFaCheck2}
            />
            {/* 결과~특이사항 영역 — 소화전과 동일하게 완료 시 '이미 점검 완료' 오버레이가 덮음(렌더는 유지) */}
            <div className="relative">
              {faShowDone2 && (
                <InspectionRevisitPopup
                  variant="completed"
                  checkedAt={monthRecords[pairedBC.id]?.checkedAt ?? ''}
                  inspectorName={monthRecords[pairedBC.id]?.staffName ?? '—'}
                  onClose={() => setFaReinspecting2(true)}
                />
              )}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-caption font-semibold text-text-tertiary tracking-wider">비상콘센트 점검 결과</span>
                  <span className="text-caption text-text-tertiary">· 선택 {faChecked2.size}개</span>
                </div>
                <div className="flex gap-1.5">
                  {INSPECT_RESULT_OPTIONS.map(opt => {
                    const RIcon = RESULT_ICONS[opt.value]
                    const activeCls = opt.value === 'normal'  ? 'border-2 border-safe-bar bg-safe-bg text-safe'
                                    : opt.value === 'caution' ? 'border-2 border-warning-bar bg-warning-bg text-warning'
                                    :                            'border-2 border-danger-bar bg-danger-bg text-danger'
                    const disabled = faChecked2.size === 0 || faReadonly2
                    return (
                      <button key={opt.value} onClick={() => applyFaResult2(opt.value)} disabled={disabled}
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
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                  <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
                </div>
                <div className="flex gap-2 items-start">
                  <textarea
                    value={[faAuto2, bcMemo].filter(Boolean).join('\n')}
                    onChange={e => {
                      const v = e.target.value
                      setBcMemo(faAuto2 && v.startsWith(faAuto2) ? v.slice(faAuto2.length).replace(/^\n/, '') : v)
                    }}
                    placeholder="특이사항을 입력하세요"
                    className="flex-1 h-[72px] px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption resize-none outline-none box-border focus:border-border-focus transition-colors" />
                  <PhotoButton hook={bcPhoto} label="촬영" noCapture />
                </div>
              </div>
            </div>
          </>
        )}

        {groupCPs.length > 1 && !selectedZone && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">
            <span>위에서 구역을 선택해 주세요</span>
          </div>
        )}
        {groupCPs.length > 1 && selectedZone && !selectedFloor && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label pt-5">
            <span>층을 선택해 주세요</span>
          </div>
        )}
        {groupCPs.length === 1 && pendingCPs.length === 0 && !selectedCP && (
          <div className="text-center py-6 text-safe text-label font-semibold">
            <CheckCircle2 size={14} className="inline-block align-text-bottom mr-1" />점검 완료
          </div>
        )}

        {submitError && (
          <div className="bg-danger-bg/40 border border-danger-bar/30 rounded-sm px-3 py-2 text-caption text-danger">{submitError}</div>
        )}
        {justSaved && !submitError && (
          <div className="bg-safe-bg/40 border border-safe-bar/30 rounded-sm px-3 py-2 text-caption text-safe">✓ 저장 완료</div>
        )}
      </div>

      {/* ── 저장 버튼 ── */}
      <div className="px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default shrink-0">
        {isFamilyA && selectedCP && !isAccessBlocked && !faResolved && (
          <div className="mb-1.5 text-caption text-warning font-semibold text-center leading-snug">
            {!faHydrantPickOk
              ? '소화전함·호스 증상(직접 입력)을 입력해야 저장됩니다'
              : '모든 항목의 점검 결과를 입력해야 저장됩니다 (‘전체 선택’ → 정상)'}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose}
                  className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-sunken transition-colors">
            닫기
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || photo.uploading || bcPhoto.uploading || !selectedCP || isAccessBlocked || !faResolved}
            className={`flex-1 py-3 rounded-md border-0 text-label font-bold transition-shadow ${
              submitting || photo.uploading || bcPhoto.uploading || !selectedCP || isAccessBlocked || !faResolved
                ? 'bg-border-default text-text-tertiary cursor-default'
                : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] text-text-on-accent cursor-pointer hover:shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
            }`}
          >
            {(photo.uploading || bcPhoto.uploading) ? '사진 업로드 중...' : submitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : (isFamilyA && !faResolved) ? '전 항목 결과 입력 필요' : '점검 기록 저장'}
          </button>
        </div>
      </div>

      {/* ── Phase 24: 정보 수정 모달 ── */}
      {editExtModalOpen != null && (() => {
        const orig = editExtModalOpen
        const EDITABLE_FIELDS = ['type','prefix_code','seal_no','serial_no','approval_no','manufactured_at','manufacturer'] as const
        const norm = (v: string | null | undefined) => (v === '' || v === undefined) ? null : v
        const changedCount = EDITABLE_FIELDS.filter(f => norm(editExtForm[f]) !== norm(orig[f])).length
        const counterChipCls =
          changedCount === 0 ? 'bg-surface-sunken text-text-tertiary' :
          changedCount <= 3  ? 'bg-accent/15 text-accent' :
                               'bg-danger-bg text-danger'
        const EXT_TYPES = ['분말 3.3kg', '분말 20kg', '이산화탄소', '할로겐', '강화액', 'K급']
        const fieldChanged = (field: typeof EDITABLE_FIELDS[number]) =>
          norm(editExtForm[field]) !== norm(orig[field])
        const inputClass = (field: typeof EDITABLE_FIELDS[number]) =>
          `w-full h-input px-3 rounded-sm bg-surface-sunken text-text-primary text-label mb-3 box-border outline-none border ${
            fieldChanged(field) ? 'border-accent' : 'border-border-strong'
          } focus:border-border-focus transition-colors`
        const canSave = changedCount >= 1 && changedCount <= 3
        return (
          <div
            className="absolute inset-0 z-[40] bg-black/60 flex items-center justify-center"
            onClick={() => setEditExtModalOpen(null)}
          >
            <div
              className="w-[90%] max-w-[360px] bg-surface-raised rounded-lg p-5 border border-border-strong max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-body font-bold text-text-primary">정보 수정</span>
                <span className={`inline-flex px-2 py-0.5 rounded-sm text-caption font-bold ${counterChipCls}`}>
                  변경: {changedCount} / 3
                </span>
              </div>
              {changedCount > 3 && (
                <div className="text-caption text-danger mb-3">
                  4개 이상 변경하려면 「폐기 후 재등록」을 사용하세요.
                </div>
              )}
              {/* 종류 — 3열 버튼 그리드 */}
              <div className="text-caption text-text-tertiary mb-1.5">종류</div>
              <div className="grid grid-cols-3 gap-1.5 mb-3.5">
                {EXT_TYPES.map(t => {
                  const sel = editExtForm.type === t
                  return (
                    <button key={t} onClick={() => setEditExtForm(f => ({ ...f, type:t }))}
                      className={`py-2 rounded-sm text-caption font-bold cursor-pointer ${
                        sel
                          ? 'bg-accent text-text-on-accent border-0'
                          : 'bg-surface-sunken text-text-secondary border border-border-default hover:bg-surface-active'
                      } transition-colors`}>
                      {t}
                    </button>
                  )
                })}
              </div>
              {/* 텍스트 필드 */}
              {([
                { field:'prefix_code',   label:'접두문자' },
                { field:'seal_no',       label:'증지번호' },
                { field:'serial_no',     label:'제조번호' },
                { field:'approval_no',   label:'형식승인' },
                { field:'manufactured_at', label:'제조년월' },
                { field:'manufacturer',  label:'제조업체' },
              ] as const).map(({ field, label }) => (
                <div key={field}>
                  <div className="text-caption text-text-tertiary mb-1.5">{label}</div>
                  <input
                    value={editExtForm[field]}
                    onChange={e => setEditExtForm(f => ({ ...f, [field]: e.target.value }))}
                    className={inputClass(field)}
                  />
                </div>
              ))}
              {/* 액션 */}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditExtModalOpen(null)}
                  className="flex-1 h-button rounded-md bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer hover:bg-surface-active transition-colors">
                  취소
                </button>
                <button
                  onClick={() => {
                    if (!canSave || orig.id == null || updateExtMutation.isPending) return
                    const fields: Record<string, string | null> = {}
                    EDITABLE_FIELDS.forEach(f => {
                      if (norm(editExtForm[f]) !== norm(orig[f])) fields[f] = norm(editExtForm[f])
                    })
                    updateExtMutation.mutate({ id: orig.id, fields })
                  }}
                  disabled={!canSave || updateExtMutation.isPending}
                  className={`flex-1 h-button rounded-md border-0 text-label font-bold ${
                    canSave && !updateExtMutation.isPending
                      ? 'bg-accent text-text-on-accent cursor-pointer hover:bg-accent-hover'
                      : 'bg-border-default text-text-tertiary cursor-not-allowed'
                  } transition-colors`}>
                  {updateExtMutation.isPending ? '저장 중…' : '저장'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Phase 24: 소화기 분리 confirm 모달 ── */}
      {unassignConfirmExt != null && (
        <div
          className="absolute inset-0 z-[40] bg-black/60 flex items-center justify-center"
          onClick={() => setUnassignConfirmExt(null)}
        >
          <div
            className="w-[90%] max-w-[360px] bg-surface-raised rounded-lg p-5 border border-border-strong max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-body font-bold text-text-primary mb-4">소화기 분리</div>
            <div className="text-label font-normal text-text-secondary mb-4">
              「{unassignConfirmExt.cp_location ?? unassignConfirmExt.location ?? unassignConfirmExt.mgmt_no}」 위치에서 분리합니다. 자산은 미배치 상태로 유지됩니다.
            </div>
            <div className="flex gap-2">
              <button onClick={() => setUnassignConfirmExt(null)}
                className="flex-1 h-button rounded-md bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer hover:bg-surface-active transition-colors">
                취소
              </button>
              <button
                onClick={() => { if (unassignConfirmExt.id != null && !unassignExtMutation.isPending) unassignExtMutation.mutate(unassignConfirmExt.id) }}
                disabled={unassignExtMutation.isPending}
                className={`flex-1 h-button rounded-md border-0 text-label font-bold ${
                  unassignExtMutation.isPending
                    ? 'bg-border-default text-text-tertiary cursor-not-allowed'
                    : 'bg-accent text-text-on-accent cursor-pointer hover:bg-accent-hover'
                } transition-colors`}>
                {unassignExtMutation.isPending ? '처리 중…' : '분리'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 조치 결과 상세 모달 ────────────────────────────────
function ResolutionDetailModal({ item, allCheckpoints, onClose }: {
  item:           any
  allCheckpoints: CheckPoint[]
  onClose:        () => void
}) {
  const cp         = allCheckpoints.find(c => c.id === item.cpId)
  const resultOpt  = ALL_RESULT_OPTIONS.find(o => o.value === item.result)!
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [visible,   setVisible]   = useState(false)
  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const ResIcon = RESULT_ICONS[item.result] ?? CheckCircle2
  const resultTone = item.result === 'normal'  ? 'bg-safe-bg text-safe'
                   : item.result === 'caution' ? 'bg-warning-bg text-warning'
                   : item.result === 'bad'     ? 'bg-danger-bg text-danger'
                   : item.result === 'unresolved' ? 'bg-fire-bg text-fire'
                   :                                'bg-surface-sunken text-text-secondary'

  return (
    <>
      {viewerUrl && <PhotoViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />}
      <div onClick={onClose} className="fixed inset-0 z-[98] bg-black/40" />
      <div
        className="fixed left-0 right-0 z-[99] bg-surface-page rounded-t-lg border-t border-border-default flex flex-col"
        style={{
          bottom: NAV_BOTTOM,
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.26s cubic-bezier(0.32,0.72,0,1)',
          maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 54px)',
        }}
      >
        <div className="px-4 pt-3.5 pb-2.5 border-b border-border-default shrink-0 flex items-center justify-between">
          <div className="text-body-sm font-bold text-text-primary">조치 결과</div>
          <button onClick={onClose}
                  className="px-2.5 py-1 rounded-sm bg-surface-raised border border-border-strong text-text-secondary text-caption cursor-pointer hover:bg-surface-sunken transition-colors">닫기</button>
        </div>
        {cp && (
          <div className="px-4 py-2.5 border-b border-border-default shrink-0 flex items-center gap-2">
            <ResIcon size={16} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-label font-bold text-text-primary truncate">{cp.location}</div>
              <div className="text-caption text-text-tertiary">{cp.floor} · {cp.category}</div>
            </div>
            <span className={`text-caption font-bold px-2 py-0.5 rounded-pill ${resultTone}`}>{resultOpt.label}</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-3.5 py-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* 점검 시 */}
            <div>
              <div className="text-caption font-bold text-text-tertiary mb-1.5 tracking-wider text-center"><ClipboardList size={12} className="inline-block align-text-bottom mr-1" />점검 시</div>
              {item.photoKey ? (
                <div onClick={() => setViewerUrl(`/api/uploads/${item.photoKey}`)}
                     className="w-full aspect-square rounded-md overflow-hidden cursor-pointer mb-1.5">
                  <img src={`/api/uploads/${item.photoKey}`} alt="점검사진" className="w-full h-full object-cover block" />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-md bg-surface-raised border border-border-default flex items-center justify-center mb-1.5">
                  <span className="text-caption text-text-tertiary">사진 없음</span>
                </div>
              )}
              <div className="bg-surface-raised rounded-sm px-2.5 py-1.5 border border-border-default text-caption">
                <div className="text-text-tertiary mb-0.5">특이사항</div>
                <div className={item.memo ? 'text-text-primary' : 'text-text-tertiary'}>{item.memo || '없음'}</div>
                {item.checkedAt && <div className="text-caption text-text-tertiary mt-1">{fmtKstLocaleString(item.checkedAt)}</div>}
              </div>
            </div>
            {/* 조치 후 */}
            <div>
              <div className="text-caption font-bold text-safe mb-1.5 tracking-wider text-center"><Wrench size={12} className="inline-block align-text-bottom mr-1" />조치 후</div>
              {item.resolutionPhotoKey ? (
                <div onClick={() => setViewerUrl(`/api/uploads/${item.resolutionPhotoKey}`)}
                     className="w-full aspect-square rounded-md overflow-hidden cursor-pointer mb-1.5">
                  <img src={`/api/uploads/${item.resolutionPhotoKey}`} alt="조치사진" className="w-full h-full object-cover block" />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-md bg-surface-raised border border-border-default flex items-center justify-center mb-1.5">
                  <span className="text-caption text-text-tertiary">사진 없음</span>
                </div>
              )}
              <div className="bg-surface-raised rounded-sm px-2.5 py-1.5 border border-border-default text-caption">
                <div className="text-text-tertiary mb-0.5">조치 내용</div>
                <div className="text-text-primary mb-1">{item.resolutionMemo || '없음'}</div>
                {item.resolvedAt && <div className="text-caption text-text-tertiary">{fmtKstLocaleString(item.resolvedAt)}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── 레코드 메타 타입 ───────────────────────────────────
type RecordMeta = {
  recordId:           string
  status:             'open' | 'resolved'
  memo?:              string
  photoKey?:          string
  checkedAt?:         string
  resolutionMemo?:    string
  resolutionPhotoKey?:string
  resolvedAt?:        string
  resolvedBy?:        string
}

// ── 사진 풀스크린 뷰어 ─────────────────────────────────
function PhotoViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center cursor-pointer p-4">
      <img src={url} alt="사진" className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
      <button onClick={onClose}
              className="absolute right-4 w-9 h-9 rounded-full bg-white/20 border-0 text-white text-body cursor-pointer flex items-center justify-center hover:bg-white/30 transition-colors"
              style={{ top: 'calc(var(--sat, 0px) + 14px)' }}>✕</button>
    </div>
  )
}

// ── Resolution Modal (하단 시트) ────────────────────────
function ResolutionModal({ item, allCheckpoints, onClose, onResolve }: {
  item:           { cpId: string; recordId: string; result: CheckResult; photoKey?: string; memo?: string }
  allCheckpoints: CheckPoint[]
  onClose:        () => void
  onResolve:      (recordId: string, memo: string, photoKey?: string) => Promise<void>
}) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const cp            = allCheckpoints.find(c => c.id === item.cpId)
  const resultOpt     = ALL_RESULT_OPTIONS.find(o => o.value === item.result)!
  const [memo,        setMemo]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [visible,     setVisible]     = useState(false)
  const photo         = usePhotoUpload('inspection-resolution')

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const handleResolve = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const photoKey = await photo.upload()
      if (photo.hasPhoto && photoKey === null) throw new Error(photoUploadFailMsg(photo.vaultBacked))
      await onResolve(item.recordId, memo, photoKey ?? undefined)
      photo.reset()
      onClose()
    } catch (e: any) {
      setError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  const ResIcon = RESULT_ICONS[item.result] ?? AlertTriangle
  const resultTone = item.result === 'bad'     ? 'bg-danger-bg text-danger'
                   : item.result === 'caution' ? 'bg-warning-bg text-warning'
                   :                              'bg-surface-sunken text-text-secondary'

  return (
    <>
      {viewerUrl && <PhotoViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />}

      {/* 백드롭 */}
      <div onClick={onClose} className="fixed inset-0 z-[98] bg-black/40" />

      {/* 하단 시트 */}
      <div
        className="fixed left-0 right-0 z-[99] bg-surface-page rounded-t-lg border-t border-border-default flex flex-col max-h-[84vh]"
        style={{
          bottom: NAV_BOTTOM,
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.26s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* 헤더 */}
        <div className="px-4 pt-3.5 pb-3 border-b border-border-default shrink-0 flex items-start justify-between gap-2.5">
          <div className="flex-1">
            <div className={`text-body-sm font-bold text-text-primary ${cp ? 'mb-2' : ''}`}>조치 입력</div>
            {cp && (
              <div className="flex items-center gap-2 px-2.5 py-2 bg-surface-raised rounded-md border border-border-default">
                <ResIcon size={16} className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-label font-bold text-text-primary truncate">{cp.location}</div>
                  <div className="text-caption text-text-tertiary">{cp.floor} · {cp.category}</div>
                </div>
                <span className={`ml-auto text-caption font-bold px-2 py-0.5 rounded-pill ${resultTone}`}>{resultOpt.label}</span>
              </div>
            )}
          </div>
          <button onClick={onClose}
                  className="px-2.5 py-1 rounded-sm bg-surface-raised border border-border-strong text-text-secondary text-caption cursor-pointer shrink-0 hover:bg-surface-sunken transition-colors">닫기</button>
        </div>

        {/* 점검 사진 썸네일 (있을 때만) — 특이사항 좌측 + 증빙사진 우측 */}
        {item.photoKey && (
          <div className="shrink-0 px-4 pt-3.5 pb-1 flex items-start gap-2.5">
            <div className="flex-1 min-w-0">
              <div className={`text-caption font-semibold mb-1 ${item.result === 'bad' ? 'text-danger' : 'text-warning'}`}>
                {item.result === 'bad' ? '🔴 불량' : '🟡 주의'} 특이사항
              </div>
              <div className="h-[72px] overflow-y-auto bg-surface-raised rounded-sm px-2.5 py-2 border border-border-default text-caption">
                {item.memo
                  ? <span className="text-text-secondary">{item.memo}</span>
                  : <span className="text-text-tertiary">없음</span>
                }
              </div>
            </div>
            <div className="flex flex-col gap-1 items-center shrink-0">
              <div className="text-caption font-semibold text-text-tertiary">증빙 사진</div>
              <div onClick={() => setViewerUrl(`/api/uploads/${item.photoKey}`)}
                   className="w-[72px] h-[72px] rounded-md overflow-hidden cursor-pointer border border-border-default">
                <img src={`/api/uploads/${item.photoKey}`} alt="점검사진" className="w-full h-full object-cover block" />
              </div>
            </div>
          </div>
        )}

        {/* 내용 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-caption font-semibold text-text-tertiary tracking-wider">조치 내용 *</label>
            <span className="text-caption text-text-tertiary">조치 후 사진 (선택)</span>
          </div>
          <div className="flex gap-2 items-start">
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="어떻게 조치했는지 입력하세요"
              className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-strong text-text-primary text-label resize-none outline-none box-border focus:border-border-focus transition-colors"
            />
            <PhotoButton hook={photo} label="촬영" />
          </div>

          {error && (
            <div className="mt-2 bg-danger-bg/40 border border-danger-bar/30 rounded-sm px-3 py-2 text-caption text-danger">{error}</div>
          )}
        </div>

        {/* 버튼 */}
        <div className="px-4 pt-2.5 pb-3.5 border-t border-border-default flex gap-2 shrink-0">
          <button onClick={onClose}
                  className="px-4 py-3 rounded-md bg-surface-raised border border-border-strong text-text-secondary text-label font-semibold cursor-pointer hover:bg-surface-sunken transition-colors">취소</button>
          <button
            onClick={handleResolve}
            disabled={submitting || photo.uploading || !memo.trim()}
            className={`flex-1 py-3 rounded-md border-0 text-label font-bold transition-shadow ${
              submitting || photo.uploading || !memo.trim()
                ? 'bg-border-default text-text-tertiary cursor-default'
                : 'bg-[linear-gradient(135deg,#16a34a,#22c55e)] text-text-on-accent cursor-pointer hover:shadow-[0_2px_8px_rgba(22,163,74,0.3)]'
            }`}
          >
            {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : '✓ 조치 완료'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function InspectionPage() {
  const { staff } = useAuthStore()
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()
  const routeLocation = useLocation()
  const qrCheckpoint = (routeLocation.state as any)?.qrCheckpoint as CheckPoint | undefined
  const autoSelectCategory = (routeLocation.state as any)?.autoSelectCategory as string | undefined

  // 데스크톱 전용 상태
  const [desktopCategoryIdx, setDesktopCategoryIdx] = useState<number | null>(null)
  const [desktopRecordId,    setDesktopRecordId]    = useState<string | null>(null)
  const [desktopDateFilter,  setDesktopDateFilter]  = useState<number>(-1) // -1=이번달, 0=전체, N=일

  const [allCheckpoints,   setAllCheckpoints]   = useState<CheckPoint[]>([])
  const [glMarkerCount,    setGlMarkerCount]    = useState(0)
  const [loading,          setLoading]          = useState(true)
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null)
  const [records,          setRecords]          = useState<Record<string, CheckResult>>({})
  // DIV / 컴프레셔는 회당 2일 연속 점검이므로 전일 기록도 완료 판정에 포함
  const [prevDayRecords,   setPrevDayRecords]   = useState<Record<string, CheckResult>>({})
  // 이번 달 전체 기록 (이미 점검 여부 판정용) — 피커/팝업/✓ 뱃지 기준
  // 팝업 판정에 checkedAt/staffName/recordId/status 가 필요해서 엔트리 맵으로 확장.
  // 기존 `monthRecords[cpId]` 는 truthy 체크로만 사용 중이라 호환 유지.
  const [monthRecords,     setMonthRecords]     = useState<Record<string, MonthRecordEntry>>({})
  // 당월 normal/caution 기록을 cp.id 별 날짜 배열로 보관 — 카드 완료 카운트용.
  // 대시보드 월간 카드와 동일 기준(DISTINCT checkpoint_id + result in normal/caution).
  const [monthRecordDates, setMonthRecordDates] = useState<Record<string, string[]>>({})
  const [recordCounts,     setRecordCounts]     = useState<Record<string, number>>({})
  const [markerRecords,    setMarkerRecords]    = useState<Record<string, CheckResult>>({})
  const [recordMeta,       setRecordMeta]       = useState<Record<string, RecordMeta>>({})
  const [showTodayDetail,  setShowTodayDetail]  = useState(false)
  const [showFireAlarm,    setShowFireAlarm]    = useState(false)
  const [sessionId,        setSessionId]        = useState<string | null>(null)
  const [syncedAt,         setSyncedAt]         = useState<Date | null>(null)
  const [resolveTarget,    setResolveTarget]    = useState<{ cpId: string; recordId: string; result: CheckResult; photoKey?: string; memo?: string } | null>(null)
  const [detailTarget,     setDetailTarget]     = useState<{ cpId: string } | null>(null)

  // ── 딥링크 auto-open: /inspection?panel=fire-alarm (대시보드 tap + SW push 목적지) ──
  useEffect(() => {
    if (new URLSearchParams(routeLocation.search).get('panel') === 'fire-alarm') {
      setShowFireAlarm(true)
    }
  }, [routeLocation.search])

  // ── 이번 달 schedule_items — 재진입 팝업 판정에 사용 (SummaryCard 와 queryKey 공유) ──
  const currentMonth = useMemo(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
  }, [])
  const { data: scheduleItems = [] } = useQuery({
    queryKey: ['schedule-month', currentMonth],
    queryFn: () => scheduleApi.getByMonth(currentMonth),
    staleTime: 60_000,
  })

  // 오늘 전체 점검 기록 로드 (타 직원 포함)
  const loadTodayRecords = useCallback(async () => {
    try {
      // KST(로컬) 기준 날짜. toISOString()은 UTC라 자정~오전 9시 구간에서 전일 날짜가 나옴.
      const ymd = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      const now   = new Date()
      const today = ymd(now)
      const prev1 = new Date(now); prev1.setDate(prev1.getDate() - 1)
      const prev2 = new Date(now); prev2.setDate(prev2.getDate() - 2)

      const yyyymm = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
      const [data, prevData1, prevData2, monthData] = await Promise.all([
        inspectionApi.getTodayRecords(today),
        inspectionApi.getTodayRecords(ymd(prev1)).catch(() => [] as any[]),
        inspectionApi.getTodayRecords(ymd(prev2)).catch(() => [] as any[]),
        inspectionApi.getMonthRecords(yyyymm).catch(() => [] as any[]),
      ])

      const map:        Record<string, CheckResult> = {}
      const counts:     Record<string, number>      = {}
      const markerMap:  Record<string, CheckResult> = {}
      const meta:       Record<string, RecordMeta>  = {}
      for (const r of data) {
        map[r.checkpointId]  = r.result as CheckResult
        counts[r.checkpointId] = (counts[r.checkpointId] ?? 0) + 1
        const mid = (r as any).floorPlanMarkerId as string | null
        if (mid) markerMap[mid] = r.result as CheckResult
        meta[r.checkpointId] = {
          recordId:            r.id,
          status:              (r.status ?? 'open') as 'open' | 'resolved',
          memo:                r.memo ?? undefined,
          photoKey:            r.photoKey ?? undefined,
          checkedAt:           r.checkedAt ?? undefined,
          resolutionMemo:      r.resolutionMemo ?? undefined,
          resolutionPhotoKey:  r.resolutionPhotoKey ?? undefined,
          resolvedAt:          r.resolvedAt ?? undefined,
          resolvedBy:          r.resolvedBy ?? undefined,
        }
      }
      // 전일/전전일 기록 병합 (DIV/컴프레셔용 2일 연속 점검 완료 판정 목적)
      const prevMap: Record<string, CheckResult> = {}
      for (const r of [...prevData1, ...prevData2]) {
        if (!prevMap[r.checkpointId]) prevMap[r.checkpointId] = r.result as CheckResult
      }
      // 이번 달 전체 기록 (완료 판정 기준)
      // 팝업 우선순위: (나) 주의/불량 + status=open > (가) normal/resolved
      // 같은 체크포인트에 여러 기록이 있으면 pending-action 후보를 우선 선택.
      // 유도등(마커 기반): 동일 기록을 'MARKER:{markerId}' 키로도 병행 저장하여
      // InspectionModal 의 마커 피커가 useInspectionRevisitPopup 훅으로 팝업을 띄울 수 있게 한다.
      const isPending = (e: MonthRecordEntry) =>
        (e.result === 'bad' || e.result === 'caution') && e.status === 'open'
      const upsert = (m: Record<string, MonthRecordEntry>, key: string, entry: MonthRecordEntry) => {
        const prev = m[key]
        if (!prev) { m[key] = entry; return }
        if (!isPending(prev) && isPending(entry)) m[key] = entry
      }
      const monthMap: Record<string, MonthRecordEntry> = {}
      // 카드 완료 카운트용 — cp.id 별 당월 normal/caution 기록 날짜 배열
      const monthDatesMap: Record<string, string[]> = {}
      for (const r of monthData) {
        const cpId = (r as any).checkpointId
        if (!cpId) continue
        // Bug C 수정: upsert 조건 엄격화 — result 가 유효한 CheckResult 인 레코드만
        // monthRecords 에 반영한다. 과거에는 result 가 falsy 여도 entry 가 upsert
        // 되었고, 훅의 `if (!meta.result)` 가드에 의존해 간접적으로 필터되었다.
        // 이 구조는 상위 컨슈머(doneCount 등)가 entry 존재만으로 '기록 있음' 을
        // 판단할 때 오탐을 유발하므로, 소스 단에서 차단한다. 마커 병행 키도 동일.
        const rawResult = (r as any).result
        if (!rawResult) continue
        // line_results 는 서버가 원본 JSON 문자열(lineResults, camel)로 반환 — 파싱해 배열로.
        let parsedLR: any[] | undefined
        try {
          const raw = (r as any).lineResults
          if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) parsedLR = p }
        } catch { /* 파싱 실패 무시 */ }
        const entry: MonthRecordEntry = {
          result:    rawResult,
          checkedAt: (r as any).checkedAt,
          staffName: (r as any).staffName ?? undefined,
          recordId:  (r as any).id,
          status:    ((r as any).status ?? 'open') as 'open' | 'resolved',
          memo:         (r as any).memo ?? undefined,
          line_results: parsedLR,
          remediation_symbol: (r as any).remediationSymbol ?? undefined,
        }
        upsert(monthMap, cpId, entry)
        // 유도등 마커 병행 키 — 기록(result 유효) 있을 때만 적재
        const mkId = (r as any).floorPlanMarkerId as string | null
        if (mkId) upsert(monthMap, 'MARKER:' + mkId, entry)

        // 대시보드와 동일한 완료 기준(normal/caution/bad-resolved) 으로 날짜 인덱스 구축 (260426-f54)
        if (rawResult === 'normal' || rawResult === 'caution' || (rawResult === 'bad' && entry.status === 'resolved')) {
          const checkedAt = entry.checkedAt
          if (checkedAt) {
            if (!monthDatesMap[cpId]) monthDatesMap[cpId] = []
            monthDatesMap[cpId].push(checkedAt.slice(0, 10))
          }
        }
      }
      setRecords(map)
      setPrevDayRecords(prevMap)
      setMonthRecords(monthMap)
      setMonthRecordDates(monthDatesMap)
      setRecordCounts(counts)
      setMarkerRecords(markerMap)
      setRecordMeta(meta)
      setSyncedAt(new Date())
    } catch { /* 실패해도 로컬 상태 유지 */ }
  }, [])

  // 체크포인트 + 오늘 기록 초기 로드
  useEffect(() => {
    Promise.all([
      inspectionApi.getCheckpoints(),
      loadTodayRecords(),
      floorPlanMarkerApi.listAll('guidelamp').then(m => setGlMarkerCount(m.length)).catch(() => {}),
    ]).then(([cps]) => {
      setAllCheckpoints(cps); setLoading(false)
      // QR 스캔에서 넘어온 경우 해당 카테고리 자동 선택
      if (qrCheckpoint) {
        const groupIdx = CATEGORY_GROUPS.findIndex(g => g.categories.includes(qrCheckpoint.category))
        if (groupIdx >= 0) setSelectedGroupIdx(groupIdx)
      }
      // 대시보드 '점검 미완료' 카드에서 넘어온 경우 — 오늘 일정의 점검 카테고리 자동 선택
      if (autoSelectCategory) {
        // schedule.inspection_category 와 cp.category alias — 백엔드(stats.ts) 와 동일 매핑
        const SCHED_TO_CP_ALIAS: Record<string, string> = { '방화문': '특별피난계단' }
        const cat = SCHED_TO_CP_ALIAS[autoSelectCategory] ?? autoSelectCategory
        const groupIdx = CATEGORY_GROUPS.findIndex(g => g.categories.includes(cat))
        if (groupIdx >= 0) {
          if (isDesktop) setDesktopCategoryIdx(groupIdx)
          else setSelectedGroupIdx(groupIdx)
        }
        // state 비워서 모달 닫고 재렌더 시 재오픈 방지
        navigate(routeLocation.pathname, { replace: true, state: {} })
      }
    }).catch(() => setLoading(false))
  }, []) // eslint-disable-line

  // 30초마다 폴링 (타 직원 기록 실시간 반영)
  useEffect(() => {
    const id = setInterval(loadTodayRecords, 10_000)
    return () => clearInterval(id)
  }, [loadTodayRecords])

  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId
    // 세션 날짜는 KST 기준 (브라우저 타임존 무관) — UTC/로컬 getter 는 새벽 기록을 전날 세션에 귀속시킴
    const today = todayKstYmd()
    try {
      const sessions = await inspectionApi.getSessions(today)
      const mine = sessions.find((s: any) => s.staff_id === staff?.id || s.staffId === staff?.id)
      if (mine) { setSessionId(mine.id); return mine.id }
    } catch { /* create new */ }
    const sess = await inspectionApi.createSession({ date: today, floor: null })
    setSessionId(sess.id)
    return sess.id
  }

  const handleSave = async (cpId: string, result: CheckResult, memo: string, photoKey?: string, extra?: { guide_light_type?: string; floor_plan_marker_id?: string; line_results?: string; remediation_symbol?: string }) => {
    const sid = await ensureSession()
    await inspectionApi.submitRecord(sid, { checkpointId: cpId, result, memo: memo.trim() || undefined, photoKey, ...(extra ?? {}) })
    // 로컬 즉시 반영 + DB와 동기화
    const nowIso = new Date().toISOString()
    // 옵티미스틱: 카드가 넘긴 line_results(JSON 문자열)를 로컬 엔트리에도 파싱해 실어 즉시 반영
    let localLR: any[] | undefined
    try { if (extra?.line_results) { const p = JSON.parse(extra.line_results); if (Array.isArray(p)) localLR = p } } catch { /* 무시 */ }
    const localEntry: MonthRecordEntry = {
      result, checkedAt: nowIso,
      staffName: staff?.name ?? undefined,
      // recordId 는 loadTodayRecords() 가 서버 응답으로 채워줌
      status: 'open',
      memo: memo.trim() || undefined,
      line_results: localLR,
      remediation_symbol: extra?.remediation_symbol,
    }
    setRecords(prev => ({ ...prev, [cpId]: result }))
    setMonthRecords(prev => {
      const next = { ...prev, [cpId]: localEntry }
      // 유도등 마커 병행 키 — 재진입 팝업 즉시 동작 목적
      if (extra?.floor_plan_marker_id) next['MARKER:' + extra.floor_plan_marker_id] = localEntry
      return next
    })
    // 카드 완료 카운트도 서버 응답 전 반영 (대시보드와 동일: normal/caution 만)
    if (result === 'normal' || result === 'caution') {
      setMonthRecordDates(prev => {
        const next = { ...prev }
        next[cpId] = [...(next[cpId] ?? []), nowIso.slice(0, 10)]
        return next
      })
    }
    setRecordCounts(prev => ({ ...prev, [cpId]: (prev[cpId] ?? 0) + 1 }))
    if (extra?.floor_plan_marker_id) {
      setMarkerRecords(prev => ({ ...prev, [extra.floor_plan_marker_id!]: result }))
    }
    loadTodayRecords()
  }

  const handleResolve = async (recordId: string, memo: string, photoKey?: string) => {
    await inspectionApi.resolveRecord(recordId, memo, photoKey)
    // 로컬 즉시 resolved 표시
    setRecordMeta(prev => {
      const updated = { ...prev }
      const entry = Object.entries(updated).find(([, v]) => v.recordId === recordId)
      if (entry) updated[entry[0]] = { ...entry[1], status: 'resolved' }
      return updated
    })
    loadTodayRecords()
  }

  const recordCount = Object.keys(records).length

  // 미조치 항목 (불량/주의 + status=open)
  const unresolvedItems = useMemo(() =>
    Object.entries(records)
      .filter(([cpId, result]) =>
        (result === 'bad' || result === 'caution') &&
        recordMeta[cpId]?.status === 'open'
      )
      .map(([cpId, result]) => ({
        cpId,
        result:   result as CheckResult,
        recordId: recordMeta[cpId]?.recordId ?? '',
        photoKey: recordMeta[cpId]?.photoKey,
        memo:     recordMeta[cpId]?.memo,
        cp:       allCheckpoints.find(c => c.id === cpId),
      }))
      .filter(item => item.cp && item.recordId),
    [records, recordMeta, allCheckpoints]
  )

  // 조치 완료 항목 (불량/주의 + status=resolved)
  const resolvedItems = useMemo(() =>
    Object.entries(records)
      .filter(([cpId, result]) =>
        (result === 'bad' || result === 'caution') &&
        recordMeta[cpId]?.status === 'resolved'
      )
      .map(([cpId, result]) => ({
        cpId,
        result:             result as CheckResult,
        cp:                 allCheckpoints.find(c => c.id === cpId),
        ...recordMeta[cpId],
      }))
      .filter(item => item.cp && item.recordId),
    [records, recordMeta, allCheckpoints]
  )

  // 정상 항목
  const normalItems = useMemo(() =>
    Object.entries(records)
      .filter(([, result]) => result === 'normal')
      .map(([cpId]) => ({ cpId, cp: allCheckpoints.find(c => c.id === cpId) }))
      .filter(item => item.cp),
    [records, allCheckpoints]
  )

  const resultStats = useMemo(() => {
    let normal = 0, caution = 0, bad = 0
    for (const res of Object.values(records)) {
      if (res === 'normal') normal++
      else if (res === 'caution') caution++
      else if (res === 'bad') bad++
    }
    return { normal, caution, bad }
  }, [records])

  // '오늘 점검 현황' 칩 집계: 오늘 실제로 기록된 건수만 센다.
  // (defaultResult/[접근불가] 바이패스는 월간 완료 판정용이라 여기선 제외)
  const categoryStats = useMemo(() =>
    CATEGORY_GROUPS.map((g, idx) => {
      const cps  = allCheckpoints.filter(cp => g.categories.includes(cp.category))
      const done = cps.filter(cp => records[cp.id]).length
      return { idx, group:g, total:cps.length, done }
    }).filter(s => s.done > 0),
    [allCheckpoints, records]
  )

  const selectedGroup = selectedGroupIdx !== null ? CATEGORY_GROUPS[selectedGroupIdx] : null

  // ── 데스크톱 전용 렌더 ───────────────────────────────
  if (isDesktop) {
    return <DesktopInspectionView
      categoryIdx={desktopCategoryIdx}
      setCategoryIdx={setDesktopCategoryIdx}
      recordId={desktopRecordId}
      setRecordId={setDesktopRecordId}
      dateFilter={desktopDateFilter}
      setDateFilter={setDesktopDateFilter}
      allCheckpoints={allCheckpoints}
      scheduleItems={scheduleItems}
      markerRecords={markerRecords}
      monthRecordDates={monthRecordDates}
      glMarkerCount={glMarkerCount}
    />
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-surface-page">

      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-20">
        {syncedAt && (
          <div className="flex justify-end mb-1">
            <span className="text-caption text-text-tertiary">
              동기화 {syncedAt.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
          </div>
        )}

        {/* 오늘 점검 현황 */}
        <div className="bg-surface-raised border border-border-default rounded-md px-3.5 py-3 mb-4">
          <div onClick={() => recordCount > 0 && setShowTodayDetail(p => !p)}
               className={`flex items-center justify-between ${recordCount > 0 ? 'cursor-pointer' : ''}`}>
            <div className="text-caption font-semibold text-text-tertiary tracking-wider">오늘 점검 현황</div>
            <div className="flex items-center gap-1.5">
              {recordCount > 0 && (
                <div className="text-caption font-bold text-safe bg-safe-bg border border-safe-bar/40 rounded-pill px-2 py-0.5">{recordCount}건 완료</div>
              )}
              {recordCount > 0 && <span className="text-text-tertiary text-caption">{showTodayDetail ? '▲' : '▼'}</span>}
            </div>
          </div>

          {recordCount === 0 && (
            <div className="flex items-center gap-2 pt-2.5 pb-0.5 text-text-tertiary">
              <ClipboardList size={20} className="shrink-0" />
              <span className="text-caption">아직 점검 기록이 없습니다</span>
            </div>
          )}

          {recordCount > 0 && !showTodayDetail && (
            <>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {categoryStats.map(s => {
                  const CIcon = CATEGORY_ICONS[s.idx]
                  return (
                    <div key={s.idx} className="inline-flex items-center gap-1 bg-safe-bg/60 border border-safe-bar/30 rounded-sm px-2 py-0.5">
                      <CIcon size={12} className="text-text-secondary" />
                      <span className="text-caption text-text-primary font-semibold">{s.group.labels[0]}</span>
                      <span className="text-caption text-safe font-bold">{s.done}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-nowrap gap-1 mt-1.5 overflow-x-auto">
                {([
                  { key:'normal',  label:'정상', val:resultStats.normal,  tone:'safe' as const    },
                  { key:'caution', label:'주의', val:resultStats.caution, tone:'warning' as const },
                  { key:'bad',     label:'불량', val:resultStats.bad,     tone:'danger' as const  },
                ]).map(({ key, label, val, tone }) => {
                  const Icon = RESULT_ICONS[key]
                  const cls = tone === 'safe'    ? 'bg-safe-bg/70 border-safe-bar/40 text-safe'
                            : tone === 'warning' ? 'bg-warning-bg/70 border-warning-bar/40 text-warning'
                            :                       'bg-danger-bg/70 border-danger-bar/40 text-danger'
                  return (
                    <div key={key} className={`inline-flex items-center gap-1 border rounded-pill px-1.5 py-0.5 shrink-0 ${cls}`}>
                      <Icon size={12} />
                      <span className="text-caption font-bold">{label} {val}</span>
                    </div>
                  )
                })}
                <span className="text-caption text-text-tertiary self-center shrink-0 px-0.5">—</span>
                <div className="inline-flex items-center gap-1 bg-fire-bg/70 border border-fire-bar/40 rounded-pill px-1.5 py-0.5 shrink-0 text-fire">
                  <Wrench size={12} />
                  <span className="text-caption font-bold">미조치 {unresolvedItems.length}</span>
                </div>
                <div className="inline-flex items-center gap-1 bg-info-bg/70 border border-info-bar/40 rounded-pill px-1.5 py-0.5 shrink-0 text-info">
                  <CheckCircle2 size={12} />
                  <span className="text-caption font-bold">조치완 {resolvedItems.length}</span>
                </div>
              </div>
            </>
          )}

          {showTodayDetail && (
            <div className="mt-2.5">
              {/* 미조치 항목 */}
              {unresolvedItems.length > 0 && (
                <div className="mb-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Wrench size={14} className="text-danger" />
                    <span className="text-caption font-bold text-danger">미조치 항목</span>
                    <span className="text-caption font-bold text-text-on-accent bg-danger-bar rounded-pill px-1.5 py-0.5">{unresolvedItems.length}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {unresolvedItems.map(item => {
                      const Icon = RESULT_ICONS[item.result] ?? Wrench
                      return (
                        <div key={item.cpId} className="flex items-center gap-2 px-2.5 py-2 bg-danger-bg/40 rounded-md border border-danger-bar/30">
                          <Icon size={14} className="shrink-0 text-danger" />
                          <div className="flex-1 min-w-0">
                            <div className="text-caption font-semibold text-text-primary truncate">{item.cp!.location}</div>
                            <div className="text-caption text-text-tertiary">{item.cp!.floor} · {item.cp!.category}</div>
                          </div>
                          <button
                            onClick={() => setResolveTarget({ cpId: item.cpId, recordId: item.recordId, result: item.result, photoKey: item.photoKey, memo: item.memo })}
                            className="shrink-0 px-2 py-1 rounded-sm border border-danger-bar bg-danger-bg/60 text-danger text-caption font-bold cursor-pointer hover:bg-danger-bg transition-colors"
                          >
                            조치 입력
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 조치 완료 항목 */}
              {resolvedItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 size={14} className="text-info" />
                    <span className="text-caption font-bold text-info">조치 완료 항목</span>
                    <span className="text-caption font-bold text-text-on-accent bg-info-bar rounded-pill px-1.5 py-0.5">{resolvedItems.length}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {resolvedItems.map(item => {
                      const Icon = RESULT_ICONS[item.result] ?? CheckCircle2
                      return (
                        <div key={item.cpId} className="flex items-center gap-2 px-2.5 py-2 bg-info-bg/40 rounded-md border border-info-bar/30">
                          <Icon size={14} className="shrink-0 text-info" />
                          <div className="flex-1 min-w-0">
                            <div className="text-caption font-semibold text-text-primary truncate">{item.cp!.location}</div>
                            <div className="text-caption text-text-tertiary">{item.cp!.floor} · {item.cp!.category}</div>
                          </div>
                          <button
                            onClick={() => setDetailTarget({ cpId: item.cpId })}
                            className="shrink-0 px-2 py-1 rounded-sm border border-info-bar/60 bg-info-bg/60 text-info text-caption font-bold cursor-pointer hover:bg-info-bg transition-colors"
                          >
                            조치결과
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 정상 항목 */}
              {normalItems.length > 0 && (
                <div className={unresolvedItems.length > 0 || resolvedItems.length > 0 ? 'mt-2.5' : ''}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 size={14} className="text-safe" />
                    <span className="text-caption font-bold text-safe">정상 항목</span>
                    <span className="text-caption font-bold text-text-on-accent bg-safe-bar rounded-pill px-1.5 py-0.5">{normalItems.length}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {normalItems.map(item => (
                      <div key={item.cpId} className="flex items-center gap-2 px-2.5 py-2 bg-safe-bg/40 rounded-md border border-safe-bar/30">
                        <CheckCircle2 size={14} className="shrink-0 text-safe" />
                        <div className="flex-1 min-w-0">
                          <div className="text-caption font-semibold text-text-primary truncate">{item.cp!.location}</div>
                          <div className="text-caption text-text-tertiary">{item.cp!.floor} · {item.cp!.category}</div>
                        </div>
                        <span className="text-caption font-bold text-safe shrink-0">정상</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unresolvedItems.length === 0 && resolvedItems.length === 0 && normalItems.length === 0 && (
                <div className="text-center py-2 text-text-tertiary text-caption">점검 항목 없음</div>
              )}
            </div>
          )}
        </div>

        {/* 카테고리 그리드 */}
        {loading ? (
          <div className="text-center py-8 text-text-tertiary text-label">체크포인트 불러오는 중...</div>
        ) : (
          <>
            <div className="text-caption font-semibold text-text-tertiary mb-2 tracking-wider">점검 항목 선택</div>
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                // 260427-1dc: cycle window 분기용 today (KST local). 다른 today 로컬과 충돌 방지로 별도 이름.
                const _n = new Date()
                const _todayForCycle = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,'0')}-${String(_n.getDate()).padStart(2,'0')}`
                return CATEGORY_GROUPS.map((g, idx) => {
                const isGL = g.categories.includes('유도등')
                const { total, doneCnt } = computeCategoryCounts(g, {
                  allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount,
                  today: _todayForCycle,
                })
                const allDone = total > 0 && doneCnt >= total
                const hasItems = total > 0 || g.categories.includes('화재수신반')
                const Icon = CATEGORY_ICONS[idx]
                const barClass = getCatBarClass(total, doneCnt)
                const cardClass = [
                  'relative bg-surface-raised border border-border-default rounded-md',
                  'px-2.5 py-2.5 flex items-start gap-1.5 overflow-hidden min-h-[86px] box-border transition-all duration-150',
                  !hasItems ? 'opacity-[0.38] cursor-default' : 'cursor-pointer hover:border-border-strong hover:-translate-y-px',
                  allDone ? 'bg-[rgba(34,197,94,0.28)] border-[rgba(34,197,94,0.55)] opacity-50' : '',
                ].filter(Boolean).join(' ')
                return (
                  <div key={idx} onClick={() => {
                    if (g.categories.includes('화재수신반')) { setShowFireAlarm(true); return }
                    if (hasItems) setSelectedGroupIdx(idx)
                  }} className={cardClass}>
                    {total > 0 && <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${barClass}`} />}
                    <Icon size={20} className="text-text-secondary shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col">
                      {g.labels.map(l => (
                        <div key={l} className="text-caption font-semibold text-text-primary truncate leading-snug">{l}</div>
                      ))}
                      <div className={`text-caption mt-0.5 font-medium ${allDone ? 'text-safe font-bold' : doneCnt > 0 ? 'text-warning' : 'text-text-tertiary'}`}>
                        {g.categories.includes('화재수신반') ? '기록' : total === 0 ? '없음' : allDone ? '✓ 완료' : doneCnt > 0 ? `${doneCnt}/${total}` : `${total}개`}
                      </div>
                    </div>
                  </div>
                )
              })
              })()}
            </div>
          </>
        )}
      </div>

      {/* 전체화면 점검 모달 */}
      {selectedGroup && (
        selectedGroup.categories.includes('DIV') ? (
          <DivInspectModal
            onClose={() => setSelectedGroupIdx(null)}
            onSaveRecord={handleSave}
            initialLocationNo={qrCheckpoint?.category === 'DIV' ? qrCheckpoint.locationNo : undefined}
            monthRecords={monthRecords}
            scheduleItems={scheduleItems}
          />
        ) : selectedGroup.categories.includes('컴프레셔') ? (
          <CompressorModal
            onClose={() => setSelectedGroupIdx(null)}
            onSaveRecord={handleSave}
            initialLocationNo={qrCheckpoint?.category === '컴프레셔' ? qrCheckpoint.locationNo : undefined}
            monthRecords={monthRecords}
            scheduleItems={scheduleItems}
          />
        ) : selectedGroup.categories.includes('배연창') ? (
          <BaeyeonModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            monthRecords={monthRecords}
            scheduleItems={scheduleItems}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : selectedGroup.categories.includes('소방용전원공급반') ? (
          <PowerPanelModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            monthRecords={monthRecords}
            scheduleItems={scheduleItems}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : selectedGroup.categories.includes('CCTV') ? (
          <CctvModal
            allCheckpoints={allCheckpoints}
            records={records}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : selectedGroup.categories.includes('특별피난계단') ? (
          <StairwellModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            monthRecords={monthRecords}
            scheduleItems={scheduleItems}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : selectedGroup.categories.includes('주차장비') ? (
          <ParkingGateModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            monthRecords={monthRecords}
            scheduleItems={scheduleItems}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : selectedGroup.categories.includes('연결송수관') ? (
          <DamperModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            monthRecords={monthRecords}
            scheduleItems={scheduleItems}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
            initialCpId={qrCheckpoint?.id}
          />
        ) : (
          <InspectionModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            monthRecords={monthRecords}
            recordCounts={recordCounts}
            markerRecords={markerRecords}
            scheduleItems={scheduleItems}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
            initialCpId={qrCheckpoint?.id}
          />
        )
      )}

      {/* 조치 입력 하단 시트 */}
      {resolveTarget && (
        <ResolutionModal
          item={resolveTarget}
          allCheckpoints={allCheckpoints}
          onClose={() => setResolveTarget(null)}
          onResolve={handleResolve}
        />
      )}

      {/* 조치 결과 상세 */}
      {detailTarget && (
        <ResolutionDetailModal
          item={{ cpId: detailTarget.cpId, ...recordMeta[detailTarget.cpId], result: records[detailTarget.cpId] }}
          allCheckpoints={allCheckpoints}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {/* 화재수신반 기록 모달 */}
      {showFireAlarm && (
        <FireAlarmModal onClose={() => setShowFireAlarm(false)} />
      )}
    </div>
  )
}

// ── 화재수신반 원격감시 페이지 (전체 화면) ───────────────────────
// Phase 25: 라이브 카드 + 48h 자동감지 이벤트 + 3-state 폼(평상시/경보중/점검모드).
// 백엔드 /api/panel|alarm/* 은 이 디자인 트랙 미배포 -> 모든 query try/catch 평상시 폴백.
function FireAlarmModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  // ── 원격감시 상태 (미배포 -> 평상시 폴백) ──
  const { data: status } = useQuery({
    queryKey: ['panel-status'],
    queryFn: async () => { try { return await panelApi.getStatus() } catch { return null } },
    refetchInterval: 2_000,
    retry: false,
  })
  const { data: activeAlarm } = useQuery({
    queryKey: ['alarm-active'],
    queryFn: async () => { try { return await alarmApi.getActive() } catch { return null } },
    refetchInterval: 2_000,
    retry: false,
  })
  const { data: events = [] } = useQuery({
    queryKey: ['alarm-events'],
    queryFn: async () => { try { return await alarmApi.getEvents(48) } catch { return [] as Alarm[] } },
    refetchInterval: activeAlarm ? 2_000 : 30_000,
    retry: false,
  })
  // 자동감지(events) + 수동기록 병합 뷰 (최근 48시간) — '감지중 N' 카운트는 events(status) 유지.
  const mergedEvents = useRecentPanelEvents(events)

  const maintOn = !!status?.maint?.enabled
  // 경보 takeover(빨강 '화재'+화재보/비화재보 초안)는 fire 전용. 고장/설비는 push+풀스크린만 → 기록 페이지는 normal 유지.
  const mode: 'normal' | 'alarm' | 'maint' = maintOn ? 'maint' : (activeAlarm?.type === 'fire' ? 'alarm' : 'normal')
  const fresh = freshnessLabel(status?.frameUpdatedAt ?? null)
  // 라이브 카드 상태 표기 = 실제 경보 타입 (기록 takeover=mode 는 fire 전용이나, 상태 표기는 전 타입). maint 시 억제.
  const liveDisp = maintOn ? null
    : activeAlarm?.type === 'fire' ? { label: '화재 경보', text: 'text-danger', dot: 'bg-danger-bar', badge: '화재', badgeBg: 'rgba(239,68,68,.9)', border: 'border-danger-bar bg-danger-bg shadow-[0_0_0_1px_rgba(239,68,68,.4)]', pulse: true }
    : activeAlarm?.type === 'equip' ? { label: '설비 동작', text: 'text-safe', dot: 'bg-safe-bar', badge: '설비', badgeBg: 'rgba(34,197,94,.9)', border: 'border-safe-bar bg-safe-bg', pulse: false }
    : activeAlarm?.type === 'fault' ? { label: '고장', text: 'text-warning', dot: 'bg-warning-bar', badge: '고장', badgeBg: 'rgba(245,158,11,.9)', border: 'border-warning-bar bg-warning-bg', pulse: false }
    : null

  // ── form state (기존 5필드 유지) ──
  const [type, setType] = useState<'fire'|'non_fire'>('non_fire')
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState(timeStr)
  const [location, setLocation] = useState('')
  const [cause, setCause] = useState('오작동')
  const [action, setAction] = useState('자동복구, 현장확인')
  const [saving, setSaving] = useState(false)
  const [maintBusy, setMaintBusy] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const zoom = usePinchZoom()

  // 줌 뷰어 스크롤 잠금 — SideMenu 패턴 (overflow:hidden + touchmove 차단, NEVER body:fixed)
  useEffect(() => {
    if (!zoomOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const prevent = (e: TouchEvent) => {
      const frame = document.getElementById('panel-zoom-frame')
      if (frame && frame.contains(e.target as Node)) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('touchmove', prevent)
      zoom.reset()
    }
  }, [zoomOpen])

  // P2-2: 폴링(15s)이 편집 중 alarm 상태를 뒤집어 resolve↔create 오분기하는 것 방지. 오픈 시점 activeAlarm 1회 스냅샷 → save 분기·prefill 이 스냅샷 사용(폴링값 X). display(mode)는 live 유지.
  const openAlarmRef = useRef<Alarm | null | undefined>(undefined)  // undefined=쿼리 미settle, null/Alarm=settle 스냅샷
  const prefilledRef = useRef(false)
  useEffect(() => {
    if (openAlarmRef.current === undefined && activeAlarm !== undefined) {
      openAlarmRef.current = maintOn ? null : (activeAlarm?.type === 'fire' ? activeAlarm : null)
      const snap = openAlarmRef.current
      if (snap && !prefilledRef.current) {
        prefilledRef.current = true
        const [d, t] = (snap.detectedAt || '').split(' ')
        if (d) setDate(d)
        if (t) setTime(t.slice(0, 5))
        setType('non_fire')
      }
    }
  }, [activeAlarm, maintOn])

  // ── 저장 2분기: 경보중 = resolve(칩 소멸) / 평상시 = create(신규) ──
  const handleSave = async () => {
    setSaving(true)
    try {
      const snap = openAlarmRef.current
      if (snap) {
        // 경보중 자동초안 보완 -> in-place UPDATE + 확정 + panel_alarm cleared -> 대시보드 칩 소멸
        await alarmApi.resolve(snap.id, { type, occurredAt: `${date} ${time}:00`, location, cause, action })
        qc.invalidateQueries({ queryKey: ['alarm-active'] })
        qc.invalidateQueries({ queryKey: ['fire-alarm-recent'] })
        qc.invalidateQueries({ queryKey: ['fire-alarm-year'] })
      } else {
        await fireAlarmApi.create({ type, occurred_at: `${date} ${time}:00`, location, cause, action })
        qc.invalidateQueries({ queryKey: ['fire-alarm-recent'] })
        qc.invalidateQueries({ queryKey: ['fire-alarm-year'] })
      }
      toast.success('화재수신반 기록이 저장되었습니다')
      onClose()
    } catch { toast.error('저장 실패') }
    finally { setSaving(false) }
  }

  // ── 점검(정비)모드 토글 — PUT /api/panel/maint + 경보중 409 confirm 재시도 ──
  const handleMaintToggle = async () => {
    if (maintBusy) return
    setMaintBusy(true)
    try {
      await panelApi.setMaint({ enabled: !maintOn })
    } catch (e: any) {
      const is409 = e?.status === 409 || String(e?.message || '').includes('active_alarm_requires_confirm')
      if (is409) {
        const ok = window.confirm('경보 진행 중입니다. 점검모드로 전환하면 진행 중 경보가 해제되고 자동초안이 폐기됩니다. 계속할까요?')
        if (ok) {
          try { await panelApi.setMaint({ enabled: true, confirmAlarm: true }) } catch { toast.error('점검모드 전환 실패') }
        }
      }
      // 그 외 미배포/네트워크 -> 조용히 무시 (평상시 폴백)
    } finally {
      qc.invalidateQueries({ queryKey: ['panel-status'] })
      qc.invalidateQueries({ queryKey: ['alarm-active'] })
      setMaintBusy(false)
    }
  }

  const labelCls = 'text-caption font-semibold text-text-tertiary mb-1.5 block'
  const inputCls = 'w-full box-border px-3 py-2.5 rounded-sm border border-border-default bg-surface-raised text-text-primary text-label outline-none min-w-0 [appearance:none] [-webkit-appearance:none] focus:border-border-focus transition-colors'
  const blinkStyle = { animation: 'blink 1s steps(1,end) infinite' }

  return (
    <>
    <div className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col overflow-hidden top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]">
      {/* 헤더 gh */}
      <div className="flex items-center h-12 px-3 bg-surface-page border-b border-border-default flex-shrink-0">
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-[7px] bg-surface-sunken text-text-secondary cursor-pointer shrink-0">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 flex items-center gap-[7px] pl-2.5 text-title font-semibold text-text-primary min-w-0">
          <BellRing size={18} className="text-text-secondary shrink-0" />
          <span className="truncate">화재수신반</span>
        </div>
        {/* 점검모드 토글 gh-maint (single control point) */}
        <button type="button" role="switch" aria-checked={maintOn} onClick={handleMaintToggle}
          className={`inline-flex items-center gap-1.5 rounded-pill px-[7px] py-1 pl-[9px] text-[11px] font-bold leading-none cursor-pointer transition-colors shrink-0 ${
            maintOn
              ? 'text-text-primary bg-[rgba(173,182,192,.16)] border border-border-strong'
              : 'text-text-tertiary bg-surface-sunken border border-border-default'
          }`}>
          <BellOff size={13} />
          <span>점검모드</span>
          <span className={`relative w-7 h-[18px] rounded-pill transition-colors ${maintOn ? 'bg-info' : 'bg-border-default'}`}>
            <span className="absolute top-0.5 left-0.5 w-[14px] h-[14px] rounded-full bg-white transition-transform"
              style={{ transform: maintOn ? 'translateX(14px)' : 'translateX(0)' }} />
          </span>
        </button>
      </div>

      {/* 스크롤 본문 scroll > cont */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2.5 px-3 py-3">
          {/* maint-autonote (점검모드 only) */}
          {mode === 'maint' && (
            <div className="flex gap-2 p-2 px-[11px] rounded-[10px] bg-surface-sunken border border-border-strong text-caption text-text-tertiary leading-normal">
              <RefreshCw size={13} className="shrink-0 mt-0.5" />
              <span>자동 ON/복구 · 월간 점검 계획에 소방점검 일정이 잡힌 날은 일과 시작 시 자동 ON. 야간 일정 없으면 17:30, 있으면 21:00 자동 복구. 필요 시 위 토글로 직접 켜고 끌 수 있습니다.</span>
            </div>
          )}
          {/* panel-notice (경보중 only) */}
          {mode === 'alarm' && (
            <div className="flex gap-2 p-[9px_11px] rounded-[10px] bg-danger-bg border border-[rgba(239,68,68,.4)] text-caption text-danger leading-normal">
              <span className="w-[7px] h-[7px] rounded-full bg-danger-bar shrink-0 mt-1" style={blinkStyle} />
              <span>경보 자동감지 — 비화재보 기록 초안이 생성됐습니다. 수신반 활성화는 대부분 오작동이라 비화재보로 자동선택됩니다. 현장 확인·조치 후 발생장소·원인·조치를 보완해 저장하고, 실화재면 화재보로 바꾸세요.</span>
            </div>
          )}
          {/* live-card */}
          <div className={`bg-surface-raised border rounded-md overflow-hidden ${liveDisp ? liveDisp.border : 'border-border-default'}`}
            style={liveDisp?.pulse ? { animation: 'firepulse 1.4s ease-in-out infinite' } : undefined}>
            <div className="relative w-full aspect-video bg-black cursor-pointer" onClick={() => setZoomOpen(true)}>
              <LivePanelImage frameUpdatedAt={status?.frameUpdatedAt} imgClassName="w-full h-full object-cover" />
              {/* LIVE 배지 live-ov */}
              <div className="absolute top-[7px] left-[7px] inline-flex items-center gap-1 rounded-pill px-[7px] py-0.5 text-[10px] font-extrabold text-white"
                style={{ background: liveDisp ? liveDisp.badgeBg : 'rgba(34,197,94,.85)' }}>
                <span className="w-[6px] h-[6px] rounded-full bg-white" style={blinkStyle} />
                {liveDisp ? liveDisp.badge : 'LIVE'}
              </div>
              {/* fshint */}
              <div className="absolute bottom-[7px] right-[7px] inline-flex items-center gap-1 bg-black/50 rounded-sm px-[7px] py-0.5 text-[10px] text-white pointer-events-none">
                <Maximize2 size={12} />
                탭하면 크게 보기
              </div>
            </div>
            {/* live-status */}
            <div className="flex items-center gap-1.5 flex-wrap p-2 px-[11px] text-caption text-text-secondary tabular-nums">
              {liveDisp ? (
                <>
                  <span className={`w-[7px] h-[7px] rounded-full ${liveDisp.dot} shrink-0`} style={blinkStyle} />
                  <span className={`${liveDisp.text} font-extrabold`}>{liveDisp.label}</span>
                  <span className="text-text-tertiary">·</span>
                  <span>{activeAlarm?.location ?? '수신반 확인 필요'}</span>
                  <span className="text-text-tertiary">·</span>
                  <span>{activeAlarm?.detectedAt ?? ''}</span>
                </>
              ) : (
                <>
                  <span className="w-[7px] h-[7px] rounded-full bg-safe-bar shrink-0" style={blinkStyle} />
                  <span className="text-safe font-bold">정상</span>
                  <span className="text-text-tertiary">·</span>
                  <span>이상 없음</span>
                  <span className="text-text-tertiary">·</span>
                  <span>{fresh.label}</span>
                </>
              )}
            </div>
          </div>

          {/* evt-card (최근 48시간 병합 뷰 — 자동감지 + 수동기록) */}
          <div className="bg-surface-raised border border-border-default rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-[7px_12px] border-b border-border-default">
              <span className="text-caption font-semibold text-text-secondary">최근 이벤트 (최근 48시간)</span>
              {mode === 'alarm' ? (
                <span className="rounded-pill text-[11px] font-bold text-danger bg-danger-bg border border-[rgba(239,68,68,.4)] px-2 py-0.5 leading-none">감지중 {events.filter(e => e.status === 'active' || e.status === 'acked').length || 1}</span>
              ) : (
                <button onClick={() => navigate('/fire-alarm-history')} className="inline-flex items-center gap-[3px] rounded-pill text-[11px] font-bold text-text-secondary bg-surface-sunken border border-border-default pl-2.5 pr-2 py-1 leading-none cursor-pointer">전체 이력<ChevronRight size={13} /></button>
              )}
            </div>
            {mergedEvents.length === 0 ? (
              <div className="p-[14px_12px] text-caption text-text-tertiary text-center">최근 48시간 이벤트 없음</div>
            ) : (
              mergedEvents.map(ev => <PanelEventRow key={ev.id} item={ev} />)
            )}
          </div>

          {/* 폼 (점검모드에선 숨김 — 자동기록만 멈춤) */}
          {mode !== 'maint' && (
          <div className="flex flex-col gap-3.5">
            {/* fh header */}
            <div className="flex items-center gap-1.5 text-label font-bold">
              {mode === 'alarm' ? (
                <>
                  <AlertTriangle size={15} className="text-danger shrink-0" />
                  <span className="text-danger">자동 생성 초안 — 보완 필요</span>
                </>
              ) : (
                <>
                  <Plus size={15} className="text-text-secondary shrink-0" />
                  <span className="text-text-primary">수동 기록 추가</span>
                </>
              )}
            </div>

            {/* 구분 */}
            <div>
              <label className={labelCls}>
                구분
                {mode === 'alarm' && <span className="ml-1.5 text-[10.5px] text-info bg-info-bg rounded-sm px-1.5 py-0.5 leading-none">자동선택</span>}
              </label>
              <div className="flex gap-2">
                {([['fire','화재보'],['non_fire','비화재보']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setType(v)}
                    className={`flex-1 px-0 py-2.5 rounded-sm text-label font-bold cursor-pointer transition-colors ${
                      type===v
                        ? (v === 'fire'
                            ? 'border-2 border-danger-bar bg-danger-bg text-danger'
                            : 'border-2 border-accent bg-[rgba(59,130,246,.13)] text-[#60a5fa]')
                        : 'border border-border-default bg-surface-sunken text-text-secondary hover:bg-surface-active'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* 발생일시 */}
            <div>
              <label className={labelCls}>
                발생일시
                {mode === 'alarm' && <span className="ml-1.5 text-[10.5px] text-info bg-info-bg rounded-sm px-1.5 py-0.5 leading-none">자동</span>}
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className={`${inputCls} block mb-1.5 h-input ${mode === 'alarm' ? 'border-[#0ea5e9] bg-info-bg' : ''}`} />
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className={`${inputCls} block h-input ${mode === 'alarm' ? 'border-[#0ea5e9] bg-info-bg' : ''}`} />
            </div>

            {/* 발생장소 */}
            <div>
              <label className={labelCls}>발생장소{mode === 'alarm' && <span className="text-danger font-bold"> · 확인 필요</span>}</label>
              <textarea value={location} onChange={e => setLocation(e.target.value)}
                placeholder={mode === 'alarm' ? '현장 확인 후 입력 (예: B1F-2 DIV 경비과 3F)' : '발생장소를 입력하세요'} rows={2}
                className={`${inputCls} resize-none leading-relaxed ${mode === 'alarm' ? 'border-danger-bar bg-danger-bg' : ''}`} />
            </div>

            {/* 발생원인 */}
            <div>
              <label className={labelCls}>발생원인{mode === 'alarm' && <span className="text-danger font-bold"> · 확인 필요</span>}</label>
              <textarea value={cause} onChange={e => setCause(e.target.value)}
                placeholder={mode === 'alarm' ? '현장 확인 후 입력 (예: 실화재 / 오작동 / 습기)' : undefined}
                rows={2} className={`${inputCls} resize-none leading-relaxed ${mode === 'alarm' ? 'border-danger-bar bg-danger-bg' : ''}`} />
            </div>

            {/* 조치사항 */}
            <div>
              <label className={labelCls}>조치사항{mode === 'alarm' && <span className="text-info font-bold"> · 입력 대기</span>}</label>
              <textarea value={action} onChange={e => setAction(e.target.value)}
                rows={2} className={`${inputCls} resize-none leading-relaxed ${mode === 'alarm' ? 'border-[#0ea5e9] bg-info-bg' : ''}`} />
            </div>
          </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 바 formbar (점검모드에선 숨김) */}
      {mode !== 'maint' && (
      <div className="px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default shrink-0 flex gap-2">
        <button onClick={onClose}
          className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-sunken transition-colors">
          닫기
        </button>
        <button onClick={handleSave} disabled={saving}
          className={`flex-1 py-3.5 rounded-md border-0 text-text-on-accent text-body font-bold transition-shadow ${
            saving
              ? 'bg-border-default cursor-default'
              : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] cursor-pointer shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
          }`}>
          {saving ? '저장 중...' : (mode === 'alarm' ? '조치완료 후 저장' : '점검 기록 저장')}
        </button>
      </div>
      )}
    </div>

    {/* 전체화면 줌 뷰어 fsv (safe-area pin, body:fixed-free lock) */}
    {zoomOpen && (
      <div className="fixed left-0 right-0 z-[100] flex flex-col bg-[#05070a] text-white top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]">
        {/* fsv-close */}
        <button onClick={() => setZoomOpen(false)}
          className="absolute top-[11px] right-3 w-[34px] h-[34px] flex items-center justify-center rounded-full bg-white/[.12] text-white cursor-pointer z-10">
          <X size={17} />
        </button>
        {/* fsv-top */}
        <div className="flex items-center gap-2 p-[13px_16px] shrink-0">
          <span className="inline-flex items-center gap-1.5 text-caption font-extrabold">
            <span className="w-[7px] h-[7px] rounded-full shrink-0"
              style={{ ...blinkStyle, background: mode === 'alarm' ? '#ef4444' : '#22c55e' }} />
            {mode === 'alarm' ? '화재' : 'LIVE'}
          </span>
          <span className="text-caption text-white/70">
            {mode === 'alarm' ? '화재 발생 · 자세히 보기' : '실시간 수신반 화면 · 자세히 보기'}
          </span>
        </div>
        {/* fsv-frame */}
        <div className="flex-1 flex items-center justify-center px-3 pb-3 min-h-0">
          <div
            id="panel-zoom-frame"
            ref={zoom.containerRef}
            {...zoom.bind}
            style={{ touchAction: 'none', transform: zoom.transform }}
            className="w-full aspect-video rounded-md bg-black overflow-hidden cursor-zoom-in">
            <LivePanelImage frameUpdatedAt={status?.frameUpdatedAt} imgClassName="w-full h-full object-cover" />
          </div>
        </div>
        {/* fsv-hint (mobile keeps text) */}
        <div className="shrink-0 text-center text-caption text-white/60 p-[10px_16px_16px]">
          화면을 <b className="text-white/85">더블탭(두 번 터치)</b>하면 확대 · 다시 <b className="text-white/85">더블탭</b>하면 원복
        </div>
      </div>
    )}
    </>
  )
}

// ── 써머리 카드 ────────────────────────────────────────────
const ZONE_LBL: Record<string, string> = { office: '사무동', research: '연구동', basement: '지하', common: '지하' }

function InspectionSummaryCard({ categoryIdx, allRecords }: { categoryIdx: number; allRecords: any[] }) {
  const group = CATEGORY_GROUPS[categoryIdx]
  const cats = group.categories

  // 이번 달 일정에서 해당 카테고리의 점검일 조회
  const nowY = new Date().getFullYear()
  const nowM = String(new Date().getMonth() + 1).padStart(2, '0')
  const month = `${nowY}-${nowM}`
  const { data: schedItems } = useQuery({
    queryKey: ['schedule-month', month],
    queryFn: () => scheduleApi.getByMonth(month),
    staleTime: 60_000,
  })

  // 해당 카테고리의 점검 일정 추출 (alias 역매핑 포함: 방화문→특별피난계단)
  const SCHED_ALIAS: Record<string, string> = { '방화문': '특별피난계단' }
  const schedMatches = useMemo(() => {
    if (!schedItems) return [] as typeof schedItems
    return schedItems.filter(s => {
      if (s.category !== 'inspect') return false
      const ic = s.inspectionCategory ?? ''
      return cats.includes(ic) || cats.includes(SCHED_ALIAS[ic] ?? '')
    })
  }, [schedItems, cats])

  const schedDates = useMemo(() => schedMatches.map(s => s.date), [schedMatches])

  // 점검명 & 세부내역 (복수 일정 지원)
  const schedInfos = useMemo(() => {
    const seen = new Set<string>()
    return schedMatches.filter(s => {
      const key = `${s.title}|${s.memo ?? ''}`
      if (seen.has(key)) return false
      seen.add(key); return true
    }).map(s => ({ title: s.title, memo: s.memo ?? '' }))
  }, [schedMatches])
  const schedTitle = schedInfos.length > 0 ? schedInfos.map(s => s.title).join(' / ') : group.labels.join(', ')

  // 해당 날짜에 행한 점검만 필터 (날짜만 비교)
  const filteredRecords = useMemo(() => {
    if (schedDates.length === 0) return allRecords.filter(r => cats.includes(r.category))
    const dateSet = new Set(schedDates)
    return allRecords.filter(r => cats.includes(r.category) && dateSet.has((r.checkedAt ?? '').slice(0, 10)))
  }, [allRecords, cats, schedDates])

  const normalRecs  = filteredRecords.filter(r => r.result === 'normal')
  const cautionRecs = filteredRecords.filter(r => r.result === 'caution')
  const badRecs     = filteredRecords.filter(r => r.result === 'bad')

  const normalPhotos  = normalRecs.filter(r => r.photoKey).map(r => ({ key: r.photoKey, label: `${r.category} ${r.floor}` }))
  const cautionPhotos = cautionRecs.filter(r => r.photoKey).map(r => ({ key: r.photoKey, label: `${r.category} ${r.floor}` }))
  const badPhotos     = badRecs.filter(r => r.photoKey).map(r => ({ key: r.photoKey, label: `${r.category} ${r.floor}` }))

  const schedDateLabel = schedDates.length > 0
    ? schedDates.map(d => { const [y,m,dd] = d.split('-'); return `${y}년 ${parseInt(m)}월 ${parseInt(dd)}일` }).join(', ')
    : '일정 미등록'

  async function downloadPhoto(photoKey: string, filename: string) {
    try {
      const res = await fetch('/api/uploads/' + photoKey)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 3000)
    } catch { toast.error('다운로드 실패') }
  }

  async function downloadReport() {
    try {
      // 사진을 base64로 변환
      async function toB64(key: string): Promise<string | null> {
        try {
          const res = await fetch('/api/uploads/' + key)
          if (!res.ok) return null
          const blob = await res.blob()
          return await new Promise<string>((resolve, reject) => {
            const r = new FileReader(); r.onloadend = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(blob)
          })
        } catch { return null }
      }

      const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', basement: '지하', common: '지하' }
      const title = group.labels.join(', ')

      // 정상 사진 행
      const normalWithPhoto = normalRecs.filter((r: any) => r.photoKey)
      const normalPhotoHtml = await Promise.all(normalWithPhoto.map(async (r: any) => {
        const b64 = await toB64(r.photoKey)
        const place = `${ZONE_LABEL[r.zone] ?? r.zone} ${r.floor}${r.location ? ' · ' + r.location : ''}`
        return b64 ? `<div style="display:inline-block;margin:4px;text-align:center"><img src="${b64}" style="width:150px;height:112px;object-fit:cover;border-radius:4px;border:1px solid #ccc;display:block"/><div style="font-size:10px;color:#666;margin-top:2px">${place}</div></div>` : ''
      }))

      // 주의/불량 상세 행
      const issueRecs = [...cautionRecs, ...badRecs]
      const issueRows = await Promise.all(issueRecs.map(async (r: any) => {
        const photoB64 = r.photoKey ? await toB64(r.photoKey) : null
        const resPhotoB64 = r.resolutionPhotoKey ? await toB64(r.resolutionPhotoKey) : null
        const place = `${ZONE_LABEL[r.zone] ?? r.zone} ${r.floor}${r.location ? ' · ' + r.location : ''}`
        const resultLabel = r.result === 'bad' ? '불량' : '주의'
        const resultClass = r.result === 'bad' ? 'bad' : 'cau'
        const statusLabel = r.status === 'open' ? '미조치' : '조치완료'
        const statusClass = r.status === 'open' ? 'open' : 'done'
        return `
        <tr>
          <td>${place}</td>
          <td><span class="badge ${resultClass}">${resultLabel}</span></td>
          <td><span class="badge ${statusClass}">${statusLabel}</span></td>
          <td style="white-space:pre-wrap">${r.memo ?? '-'}</td>
          <td>${r.resolvedAt ? fmtKstDateTime(r.resolvedAt) : '-'}</td>
          <td style="white-space:pre-wrap">${r.resolutionMemo ?? '-'}</td>
        </tr>
        ${(photoB64 || resPhotoB64) ? `<tr><td colspan="6" style="padding:6px 10px">
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            ${photoB64 ? `<div><div style="font-size:11px;font-weight:700;margin-bottom:4px;color:#666">점검 사진</div><img src="${photoB64}" style="max-width:200px;max-height:150px;border-radius:4px;border:1px solid #ccc"/></div>` : ''}
            ${resPhotoB64 ? `<div><div style="font-size:11px;font-weight:700;margin-bottom:4px;color:#666">조치 사진</div><img src="${resPhotoB64}" style="max-width:200px;max-height:150px;border-radius:4px;border:1px solid #ccc"/></div>` : ''}
          </div>
        </td></tr>` : ''}`
      }))

      const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title} 점검 보고서</title>
<style>
body{font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif;max-width:900px;margin:24px auto;padding:0 24px;color:#222;font-size:13px}
h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:16px}
.summary{display:flex;gap:16px;margin-bottom:20px}
.summary-box{flex:1;border-radius:10px;padding:16px;text-align:center}
.summary-box .count{font-size:28px;font-weight:800;font-family:'JetBrains Mono',monospace}
.summary-box .label{font-size:12px;font-weight:700;margin-bottom:6px}
.normal-box{background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a}
.caution-box{background:#fffbeb;border:1px solid #fde68a;color:#b45309}
.bad-box{background:#fef2f2;border:1px solid #fecaca;color:#dc2626}
table{width:100%;border-collapse:collapse;margin:12px 0}
th,td{border:1px solid #999;padding:7px 10px;font-size:12px;text-align:left;vertical-align:top}
th{background:#f0f0f0;font-weight:700}
.info-table th{width:140px}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700}
.bad{background:#fee;color:#c33}.cau{background:#fef3c7;color:#b8740b}
.open{background:#fed7aa;color:#c2410c}.done{background:#d1fae5;color:#15803d}
.footer{margin-top:24px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#888;text-align:center}
@media print{body{margin:0;padding:16px}h1{font-size:16px}.summary-box .count{font-size:22px}}
</style></head><body>
<h1>${schedTitle} 점검 보고서</h1>

<table class="info-table">
  <tr><th>점검명</th><td>${schedTitle}</td></tr>
  <tr><th>점검일</th><td>${schedDateLabel}</td></tr>
  <tr><th>점검 개소 총수</th><td>${filteredRecords.length}개소</td></tr>
  <tr><th>점검 세부내역</th><td style="white-space:pre-wrap">${schedInfos.map(s => (schedInfos.length > 1 ? `[${s.title}]\n` : '') + (s.memo || '-')).join('\n\n') || '-'}</td></tr>
</table>

<div class="summary">
  <div class="summary-box normal-box"><div class="label">정상</div><div class="count">${normalRecs.length}</div></div>
  <div class="summary-box caution-box"><div class="label">주의</div><div class="count">${cautionRecs.length}</div></div>
  <div class="summary-box bad-box"><div class="label">불량</div><div class="count">${badRecs.length}</div></div>
</div>

${normalPhotoHtml.filter(Boolean).length > 0 ? `
<h2 style="font-size:15px;margin-top:24px">정상 점검 사진 (${normalPhotoHtml.filter(Boolean).length}건)</h2>
<div style="display:flex;flex-wrap:wrap;gap:4px">${normalPhotoHtml.filter(Boolean).join('')}</div>` : ''}

${issueRecs.length > 0 ? `
<h2 style="font-size:15px;margin-top:24px">주의/불량 상세 내역 (${issueRecs.length}건)</h2>
<table>
  <thead><tr><th>개소</th><th>판정</th><th>상태</th><th>점검 메모</th><th>조치일</th><th>조치 내용</th></tr></thead>
  <tbody>${issueRows.join('')}</tbody>
</table>` : '<p style="color:#16a34a;font-weight:700;margin-top:16px">전 개소 정상 — 주의/불량 항목 없음</p>'}

<div class="footer">
  차바이오컴플렉스 방재팀 · 생성일: ${new Date().toLocaleDateString('ko-KR')}
</div>
</body></html>`

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${schedTitle}_점검보고서_${month}.html`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('보고서 다운로드 완료')
    } catch (e) {
      console.error(e)
      toast.error('보고서 생성 실패')
    }
  }

  const photoRow = (photos: { key: string; label: string }[], color: string) => {
    if (photos.length === 0) return null
    return (
      <div className="flex gap-1.5 overflow-x-auto pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {photos.map((p, i) => (
          <div key={i} className="relative shrink-0">
            <img src={`/api/uploads/${p.key}`} alt={p.label}
              className="w-14 h-14 object-cover rounded-sm cursor-pointer block border-2"
              style={{ borderColor: color }}
              onClick={() => downloadPhoto(p.key, `${p.label}.jpg`)}
              title="클릭하여 다운로드"
            />
          </div>
        ))}
      </div>
    )
  }

  if (filteredRecords.length === 0 && schedDates.length === 0) return null

  const SummaryIcon = CATEGORY_ICONS[categoryIdx]

  return (
    <div id={`summary-card-${categoryIdx}`} className="bg-surface-raised border border-border-default rounded-md p-4 mb-3.5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-body-sm font-bold text-text-primary flex items-center gap-1.5">
            <SummaryIcon size={16} className="text-text-secondary" />
            {schedTitle}
          </div>
          <div className="text-caption text-text-tertiary mt-0.5">점검일: {schedDateLabel} · 총 {filteredRecords.length}건</div>
          {schedInfos.map((s, i) => s.memo && (
            <div key={i} className="text-caption text-text-tertiary mt-0.5 whitespace-pre-wrap leading-snug">
              {schedInfos.length > 1 && <span className="font-semibold text-text-secondary">[{s.title}]</span>}{schedInfos.length > 1 ? '\n' : ''}{s.memo}
            </div>
          ))}
        </div>
        <button onClick={downloadReport} className="text-caption font-bold h-input bg-surface-sunken rounded-sm px-3 border border-border-default text-text-primary cursor-pointer hover:bg-surface-active transition-colors">
          보고서 다운로드
        </button>
      </div>

      {/* 정상 / 주의 / 불량 박스 */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* 정상 */}
        <div className="bg-safe-bg/40 border border-safe-bar/40 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-caption font-bold text-safe">정상</span>
            <span className="text-[20px] font-extrabold font-mono text-safe">{normalRecs.length}</span>
          </div>
          {photoRow(normalPhotos, 'rgba(34,197,94,0.5)')}
        </div>

        {/* 주의 */}
        <div className="bg-warning-bg/40 border border-warning-bar/40 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-caption font-bold text-warning">주의</span>
            <span className="text-[20px] font-extrabold font-mono text-warning">{cautionRecs.length}</span>
          </div>
          {cautionRecs.length > 0 && (
            <div className="flex flex-col gap-1 mt-1.5">
              {cautionRecs.map((r: any, i: number) => (
                <div key={i} className="text-caption text-text-secondary leading-snug">
                  <span className="font-semibold">{ZONE_LBL[r.zone] ?? r.zone} {r.floor}</span>{r.location ? ` · ${r.location}` : ''}
                  {r.memo && <div className="text-caption text-text-tertiary mt-0.5 truncate">{r.memo.split('\n')[0]}</div>}
                </div>
              ))}
            </div>
          )}
          {photoRow(cautionPhotos, 'rgba(245,158,11,0.5)')}
        </div>

        {/* 불량 */}
        <div className="bg-danger-bg/40 border border-danger-bar/40 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-caption font-bold text-danger">불량</span>
            <span className="text-[20px] font-extrabold font-mono text-danger">{badRecs.length}</span>
          </div>
          {badRecs.length > 0 && (
            <div className="flex flex-col gap-1 mt-1.5">
              {badRecs.map((r: any, i: number) => (
                <div key={i} className="text-caption text-text-secondary leading-snug">
                  <span className="font-semibold">{ZONE_LBL[r.zone] ?? r.zone} {r.floor}</span>{r.location ? ` · ${r.location}` : ''}
                  {r.memo && <div className="text-caption text-text-tertiary mt-0.5 truncate">{r.memo.split('\n')[0]}</div>}
                </div>
              ))}
            </div>
          )}
          {photoRow(badPhotos, 'rgba(239,68,68,0.5)')}
        </div>
      </div>
    </div>
  )
}

// ── 데스크톱 점검 관리 뷰 (좌=카테고리 카드 / 우=내역 또는 상세) ─────
function DesktopInspectionView({
  categoryIdx, setCategoryIdx, recordId, setRecordId, dateFilter, setDateFilter,
  allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount,
}: {
  categoryIdx: number | null
  setCategoryIdx: (idx: number | null) => void
  recordId: string | null
  setRecordId: (id: string | null) => void
  dateFilter: number
  setDateFilter: (d: number) => void
  allCheckpoints: CheckPoint[]
  scheduleItems: ScheduleItem[]
  markerRecords: Record<string, CheckResult>
  monthRecordDates: Record<string, string[]>
  glMarkerCount: number
}) {
  const navigate = useNavigate()

  // ── 화재수신반 원격감시 (Surface 6, 데스크톱 3분할 상세 pane) ──
  const qc = useQueryClient()
  const FIRE_ALARM_IDX = CATEGORY_GROUPS.findIndex(g => g.categories.includes('화재수신반'))
  const isPanel = categoryIdx !== null && CATEGORY_GROUPS[categoryIdx].categories.includes('화재수신반')

  // 원격감시 상태 (미배포 -> 평상시 폴백)
  const { data: panelStatus } = useQuery({
    queryKey: ['panel-status'],
    queryFn: async () => { try { return await panelApi.getStatus() } catch { return null } },
    refetchInterval: 2_000,
    retry: false,
  })
  const { data: activeAlarm } = useQuery({
    queryKey: ['alarm-active'],
    queryFn: async () => { try { return await alarmApi.getActive() } catch { return null } },
    refetchInterval: 2_000,
    retry: false,
  })
  const { data: panelEvents = [] } = useQuery({
    queryKey: ['alarm-events'],
    queryFn: async () => { try { return await alarmApi.getEvents(48) } catch { return [] as Alarm[] } },
    refetchInterval: activeAlarm ? 2_000 : 30_000,
    retry: false,
  })
  // 자동감지(panelEvents) + 수동기록 병합 뷰 (최근 48시간) — '감지중 N' 카운트는 panelEvents(status) 유지.
  const mergedPanelEvents = useRecentPanelEvents(panelEvents)

  const maintOn = !!panelStatus?.maint?.enabled
  // fire 전용 (mode 와 동일 룰) — 고장/설비는 화재수신반 pane 을 alarm 으로 만들지 않음.
  const panelMode: 'normal' | 'alarm' | 'maint' = maintOn ? 'maint' : (activeAlarm?.type === 'fire' ? 'alarm' : 'normal')
  const panelFresh = freshnessLabel(panelStatus?.frameUpdatedAt ?? null)
  // 라이브 카드 상태 표기 = 실제 경보 타입 (panelMode 는 fire 전용, 표기는 전 타입). maint 시 억제.
  const panelLiveDisp = maintOn ? null
    : activeAlarm?.type === 'fire' ? { label: '화재 경보', text: 'text-danger', dot: 'bg-danger-bar', badge: '화재', badgeBg: 'rgba(239,68,68,.9)', border: 'border-danger-bar bg-danger-bg shadow-[0_0_0_1px_rgba(239,68,68,.4)]', pulse: true }
    : activeAlarm?.type === 'equip' ? { label: '설비 동작', text: 'text-safe', dot: 'bg-safe-bar', badge: '설비', badgeBg: 'rgba(34,197,94,.9)', border: 'border-safe-bar bg-safe-bg', pulse: false }
    : activeAlarm?.type === 'fault' ? { label: '고장', text: 'text-warning', dot: 'bg-warning-bar', badge: '고장', badgeBg: 'rgba(245,158,11,.9)', border: 'border-warning-bar bg-warning-bg', pulse: false }
    : null

  // 딥링크 자동열기 (FLAG-1): /inspection?panel=fire-alarm -> 화재수신반 pane / &zoom=1 -> 줌 오버레이.
  // 데스크톱은 모바일 FireAlarmModal 마운트 전에 early-return 하므로 25-03 핸들러가 이 pane 을 열지 못함.
  const [sp] = useSearchParams()
  useEffect(() => {
    if (sp.get('panel') === 'fire-alarm' && FIRE_ALARM_IDX >= 0) {
      setCategoryIdx(FIRE_ALARM_IDX)
      setRecordId(null)
      if (sp.get('zoom') === '1') setPanelZoomOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp])

  // 화재수신반 폼 상태 (모바일 FireAlarmModal 과 동일 5필드)
  const nowKst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const todayStr = `${nowKst.getFullYear()}-${String(nowKst.getMonth()+1).padStart(2,'0')}-${String(nowKst.getDate()).padStart(2,'0')}`
  const timeStr = `${String(nowKst.getHours()).padStart(2,'0')}:${String(nowKst.getMinutes()).padStart(2,'0')}`
  const [paType, setPaType] = useState<'fire'|'non_fire'>('non_fire')
  const [paDate, setPaDate] = useState(todayStr)
  const [paTime, setPaTime] = useState(timeStr)
  const [paLocation, setPaLocation] = useState('')
  const [paCause, setPaCause] = useState('오작동')
  const [paAction, setPaAction] = useState('자동복구, 현장확인')
  const [paSaving, setPaSaving] = useState(false)
  const [maintBusy, setMaintBusy] = useState(false)
  const [panelZoomOpen, setPanelZoomOpen] = useState(false)
  const [panelHistoryOpen, setPanelHistoryOpen] = useState(false)
  const [ackedId, setAckedId] = useState<string | null>(null)
  const panelZoom = usePinchZoom({ maxScale: 2.2, doubleTapScale: 2.2 })

  // P2-2: 화재수신반 pane 열릴 때 activeAlarm 1회 스냅샷 → handlePanelSave 분기·prefill 이 스냅샷 사용(폴링값 X). display(panelMode)는 live 유지.
  const panelOpenAlarmRef = useRef<Alarm | null | undefined>(undefined)
  const panelPrefilledRef = useRef(false)
  useEffect(() => {
    if (isPanel) {
      if (panelOpenAlarmRef.current === undefined && activeAlarm !== undefined) {
        panelOpenAlarmRef.current = maintOn ? null : (activeAlarm?.type === 'fire' ? activeAlarm : null)
        const snap = panelOpenAlarmRef.current
        if (snap && !panelPrefilledRef.current) {
          panelPrefilledRef.current = true
          const [d, t] = (snap.detectedAt || '').split(' ')
          if (d) setPaDate(d)
          if (t) setPaTime(t.slice(0, 5))
          setPaType('non_fire')
        }
      }
    } else {
      panelOpenAlarmRef.current = undefined
      panelPrefilledRef.current = false
      setPanelHistoryOpen(false)  // pane 벗어나면 in-pane 이력 리셋
    }
  }, [isPanel, activeAlarm, maintOn])

  // 저장 2분기: 경보중 = resolve(칩 소멸) / 평상시 = create(신규)
  const handlePanelSave = async () => {
    setPaSaving(true)
    try {
      const snap = panelOpenAlarmRef.current
      if (snap) {
        await alarmApi.resolve(snap.id, { type: paType, occurredAt: `${paDate} ${paTime}:00`, location: paLocation, cause: paCause, action: paAction })
        qc.invalidateQueries({ queryKey: ['alarm-active'] })
        qc.invalidateQueries({ queryKey: ['fire-alarm-recent'] })
        qc.invalidateQueries({ queryKey: ['fire-alarm-year'] })
      } else {
        await fireAlarmApi.create({ type: paType, occurred_at: `${paDate} ${paTime}:00`, location: paLocation, cause: paCause, action: paAction })
        qc.invalidateQueries({ queryKey: ['fire-alarm-recent'] })
        qc.invalidateQueries({ queryKey: ['fire-alarm-year'] })
      }
      toast.success('화재수신반 기록이 저장되었습니다')
      setCategoryIdx(null)
    } catch { toast.error('저장 실패') }
    finally { setPaSaving(false) }
  }

  // 점검(정비)모드 토글 — PUT /api/panel/maint + 경보중 409 confirm 재시도
  const handlePanelMaintToggle = async () => {
    if (maintBusy) return
    setMaintBusy(true)
    try {
      await panelApi.setMaint({ enabled: !maintOn })
    } catch (e: any) {
      const is409 = e?.status === 409 || String(e?.message || '').includes('active_alarm_requires_confirm')
      if (is409) {
        const ok = window.confirm('경보 진행 중입니다. 점검모드로 전환하면 진행 중 경보가 해제되고 자동초안이 폐기됩니다. 계속할까요?')
        if (ok) {
          try { await panelApi.setMaint({ enabled: true, confirmAlarm: true }) } catch { toast.error('점검모드 전환 실패') }
        }
      }
    } finally {
      qc.invalidateQueries({ queryKey: ['panel-status'] })
      qc.invalidateQueries({ queryKey: ['alarm-active'] })
      setMaintBusy(false)
    }
  }

  // P2-1: ackedId=인지한 alarm.id — 두번째(다른 id) 경보는 takeover 재노출
  // 경보 인지(ack) — 데스크톱 takeover 모달
  const handleAlarmAck = async () => {
    const ackId = activeAlarm?.id ?? null
    setAckedId(ackId)
    if (ackId) { try { await alarmApi.ack(ackId); qc.invalidateQueries({ queryKey: ['alarm-active'] }) } catch { /* 미배포 폴백 */ } }
  }

  const paLabelCls = 'text-caption font-semibold text-text-tertiary mb-1.5 block'
  const paInputCls = 'w-full box-border px-3 py-2.5 rounded-sm border border-border-default bg-surface-raised text-text-primary text-body-sm outline-none min-w-0 [appearance:none] [-webkit-appearance:none] focus:border-border-focus transition-colors'
  const paBlink = { animation: 'blink 1s steps(1,end) infinite' }

  // 화재수신반 폼 5필드 (평상시/경보중 공용 — 경보중 = need-border/auto tag 데코)
  const renderPanelFields = (isAlarm: boolean) => (
    <div className="flex flex-col gap-3.5">
      {/* 구분 */}
      <div>
        <label className={paLabelCls}>
          구분
          {isAlarm && <span className="ml-1.5 text-[10.5px] text-info bg-info-bg rounded-sm px-1.5 py-0.5 leading-none">자동선택</span>}
        </label>
        <div className="flex gap-2">
          {([['fire','화재보'],['non_fire','비화재보']] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setPaType(v)}
              className={`flex-1 px-0 py-2.5 rounded-sm text-body-sm font-bold cursor-pointer transition-colors ${
                paType===v
                  ? (v === 'fire'
                      ? 'border-2 border-danger-bar bg-danger-bg text-danger'
                      : 'border-2 border-accent bg-[rgba(59,130,246,.13)] text-[#60a5fa]')
                  : 'border border-border-default bg-surface-sunken text-text-secondary hover:bg-surface-active'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {/* 발생일시 */}
      <div>
        <label className={paLabelCls}>
          발생일시
          {isAlarm && <span className="ml-1.5 text-[10.5px] text-info bg-info-bg rounded-sm px-1.5 py-0.5 leading-none">자동</span>}
        </label>
        <input type="date" value={paDate} onChange={e => setPaDate(e.target.value)}
          className={`${paInputCls} block mb-1.5 h-input ${isAlarm ? 'border-[#0ea5e9] bg-info-bg' : ''}`} />
        <input type="time" value={paTime} onChange={e => setPaTime(e.target.value)}
          className={`${paInputCls} block h-input ${isAlarm ? 'border-[#0ea5e9] bg-info-bg' : ''}`} />
      </div>
      {/* 발생장소 */}
      <div>
        <label className={paLabelCls}>발생장소{isAlarm && <span className="text-danger font-bold"> · 확인 필요</span>}</label>
        <textarea value={paLocation} onChange={e => setPaLocation(e.target.value)}
          placeholder={isAlarm ? '현장 확인 후 입력 (예: B1F-2 DIV 경비과 3F)' : '발생장소를 입력하세요'} rows={2}
          className={`${paInputCls} resize-none leading-relaxed ${isAlarm ? 'border-danger-bar bg-danger-bg' : ''}`} />
      </div>
      {/* 발생원인 */}
      <div>
        <label className={paLabelCls}>발생원인{isAlarm && <span className="text-danger font-bold"> · 확인 필요</span>}</label>
        <textarea value={paCause} onChange={e => setPaCause(e.target.value)}
          placeholder={isAlarm ? '현장 확인 후 입력 (예: 실화재 / 오작동 / 습기)' : undefined} rows={2}
          className={`${paInputCls} resize-none leading-relaxed ${isAlarm ? 'border-danger-bar bg-danger-bg' : ''}`} />
      </div>
      {/* 조치사항 */}
      <div>
        <label className={paLabelCls}>조치사항{isAlarm && <span className="text-info font-bold"> · 입력 대기</span>}</label>
        <textarea value={paAction} onChange={e => setPaAction(e.target.value)} rows={2}
          className={`${paInputCls} resize-none leading-relaxed ${isAlarm ? 'border-[#0ea5e9] bg-info-bg' : ''}`} />
      </div>
    </div>
  )

  // 정상 제외 필터 (우측 리스트용)
  const [excludeNormal, setExcludeNormal] = useState(false)

  // 월간 전체 점검 데이터 (정상 포함)
  // dateFilter: -1=이번달(현재 월의 1일~오늘), 0=전체, N=N일
  const effectiveDays = dateFilter === -1 ? Math.max(1, new Date().getDate() - 1) : dateFilter
  const { data: remediationData, isLoading } = useQuery({
    queryKey: ['inspection-monthly-all', dateFilter, effectiveDays],
    queryFn: () => remediationApi.list({ days: effectiveDays, includeNormal: true }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
  const allRecords = (remediationData?.records ?? []) as any[]

  // 카테고리 그룹별 카운트 (점검 완료 + 이슈)
  const groupCounts = useMemo(() => {
    const _n = new Date()
    const today = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,'0')}-${String(_n.getDate()).padStart(2,'0')}`
    return CATEGORY_GROUPS.map(g => {
      const { total, doneCnt } = computeCategoryCounts(g, {
        allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount, today,
      })
      const matches = allRecords.filter(r => g.categories.includes(r.category))
      return {
        total,                 // 막대 분모 = 모바일과 동일 (체크포인트/마커 단위)
        completed: doneCnt,    // 표시 숫자 + 막대 분자 = 모바일과 동일
        bad:      matches.filter(r => r.result === 'bad').length,      // 유지
        caution:  matches.filter(r => r.result === 'caution').length,  // 유지
        open:     matches.filter(r => r.status === 'open').length,     // 유지
      }
    })
  }, [allRecords, allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount])

  // 선택된 카테고리의 레코드 (정상 제외 필터 적용)
  const categoryRecords = useMemo(() => {
    if (categoryIdx === null) return []
    const cats = CATEGORY_GROUPS[categoryIdx].categories
    return allRecords
      .filter(r => cats.includes(r.category))
      .filter(r => !excludeNormal || r.result !== 'normal')
      .sort((a, b) => (b.checkedAt ?? '').localeCompare(a.checkedAt ?? ''))
  }, [allRecords, categoryIdx, excludeNormal])

  // 선택된 레코드의 상세 (조치 관리 페이지 데이터)
  const { data: detail } = useQuery({
    queryKey: ['remediation-detail', recordId],
    queryFn: () => remediationApi.get(recordId!),
    enabled: !!recordId,
    staleTime: 30_000,
  })

  const PERIOD_BUTTONS = [
    { value: -1, label: '이번달' },
    { value: 7,  label: '7일' },
    { value: 30, label: '30일' },
    { value: 90, label: '90일' },
    { value: 0,  label: '전체' },
  ]

  const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', basement: '지하', common: '지하' }
  const fmtDate = fmtKstDate
  const fmtDateTime = fmtKstDateTime

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden bg-surface-page">

      {/* ── 좌측: 카테고리 카드 ── */}
      <div className="w-1/2 shrink-0 min-w-0 border-r border-border-default flex flex-col">
        <div className="shrink-0 px-5 py-3 border-b border-border-default bg-surface-raised flex items-center gap-2.5">
          <span className="text-body-sm font-bold text-text-primary flex-1">점검 항목</span>
          <span className="text-caption text-text-tertiary">{dateFilter === -1 ? '이번달' : dateFilter === 0 ? '전체' : `최근 ${dateFilter}일`}</span>
          <div className="flex gap-1">
            {PERIOD_BUTTONS.map(b => (
              <button key={b.value} onClick={() => setDateFilter(b.value)}
                className={`px-2.5 py-1 rounded-sm border-0 text-caption font-bold cursor-pointer transition-colors ${
                  dateFilter === b.value
                    ? 'bg-accent text-text-on-accent'
                    : 'bg-surface-sunken text-text-tertiary hover:bg-surface-active'
                }`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3.5">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5">
            {CATEGORY_GROUPS.map((g, idx) => {
              const c = groupCounts[idx]
              const isSel = categoryIdx === idx
              const Icon = CATEGORY_ICONS[idx]
              const barClass = getCatBarClass(c.total, c.completed)
              return (
                <div key={idx}
                  onClick={() => { setCategoryIdx(idx); setRecordId(null) }}
                  className={`relative bg-surface-raised border rounded-md px-2.5 py-3 cursor-pointer flex flex-col gap-1.5 min-h-[100px] overflow-hidden transition-all duration-150 hover:border-border-strong hover:-translate-y-px ${
                    isSel ? 'border-2 border-accent ring-2 ring-accent/20' : 'border-border-default'
                  }`}>
                  {c.total > 0 && <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${barClass}`} />}
                  <div className="flex items-center gap-1.5">
                    <Icon size={20} className="text-text-secondary shrink-0" />
                    <div className="flex-1 min-w-0">
                      {g.labels.map(l => (
                        <div key={l} className="text-caption font-bold text-text-primary leading-snug truncate">{l}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-1 mt-auto">
                    {/* 좌하단: 이슈 없음 또는 불량/주의 */}
                    <div className="flex gap-0.5 flex-wrap flex-1 min-w-0">
                      {c.bad === 0 && c.caution === 0 ? (
                        <span className="text-caption text-text-tertiary">이슈 없음</span>
                      ) : (
                        <>
                          {c.bad > 0 && (
                            <span className="text-caption font-bold text-danger bg-danger-bg px-1.5 py-0.5 rounded-sm">불량 {c.bad}</span>
                          )}
                          {c.caution > 0 && (
                            <span className="text-caption font-bold text-warning bg-warning-bg px-1.5 py-0.5 rounded-sm">주의 {c.caution}</span>
                          )}
                        </>
                      )}
                    </div>
                    {/* 우하단: 점검 완료 개소 수 */}
                    {c.completed > 0 && (
                      <span className="text-caption font-bold text-safe bg-safe-bg px-1.5 py-0.5 rounded-sm shrink-0">
                        ✓ 점검완료 {c.completed}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 우측: 내역 목록 또는 상세 ── */}
      <div className="w-1/2 shrink-0 min-w-0 flex flex-col">
        {isPanel ? (
          panelHistoryOpen ? (
            // ── in-pane 전체 이력 (데스크톱, 사용자 선택 A) ──
            <>
              {/* 이력 헤더 (pane 컨벤션 재사용) */}
              <div className="shrink-0 flex items-center gap-2.5 px-5 py-2 border-b border-border-default bg-surface-raised">
                <button onClick={() => setPanelHistoryOpen(false)}
                  className="w-7 h-7 rounded-[7px] bg-surface-sunken border border-border-default cursor-pointer flex items-center justify-center shrink-0 hover:bg-surface-active transition-colors">
                  <ChevronLeft size={14} className="text-text-secondary" />
                </button>
                <div className="flex-1 flex items-center gap-1.5 text-[16px] font-bold text-text-primary min-w-0">
                  <BellRing size={16} className="text-text-secondary shrink-0" />
                  <span className="truncate">화재수신반 이력</span>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <FireAlarmHistoryView thumb />
              </div>
            </>
          ) : (
          // ── 화재수신반 3분할 상세 pane (Surface 6) ──
          <>
            {/* id-head */}
            {/* 카테고리 상세 pane 헤더(:6632, 다른 점검 항목 페이지)와 높이 정렬 (~50px):
                py-2 + 백버튼 w-7 h-7(32px). 점검모드 토글(34px) 수용. */}
            <div className="shrink-0 flex items-center gap-2.5 px-5 py-2 border-b border-border-default bg-surface-raised">
              <button onClick={() => setCategoryIdx(null)}
                className="w-7 h-7 rounded-[7px] bg-surface-sunken border border-border-default cursor-pointer flex items-center justify-center shrink-0 hover:bg-surface-active transition-colors">
                <ChevronLeft size={14} className="text-text-secondary" />
              </button>
              <div className="flex-1 flex items-center gap-1.5 text-[16px] font-bold text-text-primary min-w-0">
                <BellRing size={16} className="text-text-secondary shrink-0" />
                <span className="truncate">화재수신반</span>
              </div>
              {/* 점검모드 토글 imode-switch — '정상 라이브' pill + '전체화면' 버튼을 대체 */}
              <button type="button" role="switch" aria-checked={maintOn} onClick={handlePanelMaintToggle}
                className={`inline-flex items-center gap-[9px] rounded-pill pl-[14px] pr-[9px] py-1.5 text-label font-bold cursor-pointer transition-colors shrink-0 ${
                  maintOn
                    ? 'text-text-primary bg-[rgba(173,182,192,.16)] border border-border-strong'
                    : 'text-text-secondary bg-surface-sunken border border-border-default'
                }`}>
                <BellOff size={15} />
                <span>점검모드</span>
                <span className={`relative w-[38px] h-[22px] rounded-pill transition-colors ${maintOn ? 'bg-info' : 'bg-border-default'}`}>
                  <span className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white transition-transform"
                    style={{ transform: maintOn ? 'translateX(16px)' : 'translateX(0)' }} />
                </span>
              </button>
            </div>

            {/* id-body — 순수 블록 스크롤러. flex 컬럼(gap)은 내부 래퍼로 분리해야 자식이
                shrink 되지 않고 오버플로→스크롤한다 (스크롤러 자신을 flex-col 로 두면 biglive/
                form-card 가 pane 높이에 맞춰 축소돼 하단이 잘리고 스크롤이 죽는다). */}
            <div className="flex-1 overflow-y-auto p-4 pb-[22px]">
              <div className="flex flex-col gap-[15px]">
              {/* maint-autonote (점검모드 only, biglive 위 배너) */}
              {panelMode === 'maint' && (
                <div className="flex gap-2 px-[11px] py-2 rounded-[10px] bg-surface-sunken border border-border-strong text-caption text-text-tertiary leading-normal">
                  <RefreshCw size={13} className="shrink-0 mt-0.5" />
                  <span>자동 ON/복구 · 월간 점검 계획에 소방점검 일정이 잡힌 날은 일과 시작 시 자동 ON. 야간 일정 없으면 17:30, 있으면 21:00 자동 복구. 필요 시 위 토글로 직접 켜고 끌 수 있습니다.</span>
                </div>
              )}

              {/* ① biglive */}
              <div className={`bg-surface-raised border rounded-[14px] overflow-hidden ${panelLiveDisp ? panelLiveDisp.border : 'border-border-default'}`}
                style={panelLiveDisp?.pulse ? { animation: 'firepulse 1.4s ease-in-out infinite' } : undefined}>
                <div className="relative w-full aspect-video bg-black cursor-pointer rounded-t-[14px] overflow-hidden" onClick={() => setPanelZoomOpen(true)}>
                  <LivePanelImage frameUpdatedAt={panelStatus?.frameUpdatedAt} imgClassName="w-full h-full object-cover" />
                  {/* live-badge */}
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-caption font-extrabold leading-none text-white"
                    style={{ background: panelLiveDisp ? panelLiveDisp.badgeBg : 'rgba(34,197,94,.85)' }}>
                    <span className="w-[6px] h-[6px] rounded-full bg-white" style={paBlink} />
                    {panelLiveDisp ? panelLiveDisp.badge : 'LIVE'}
                  </div>
                  {/* live-hint */}
                  <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-black/50 rounded-sm px-2 py-0.5 text-caption text-white pointer-events-none">
                    <Maximize2 size={13} />
                    클릭하면 크게 보기
                  </div>
                </div>
                {/* live-status (desktop 14px = text-body-sm) */}
                <div className="flex items-center gap-1.5 flex-wrap px-3 py-2.5 text-body-sm text-text-secondary tabular-nums">
                  {panelLiveDisp ? (
                    <>
                      <span className={`w-[7px] h-[7px] rounded-full ${panelLiveDisp.dot} shrink-0`} style={paBlink} />
                      <span className={`${panelLiveDisp.text} font-extrabold`}>{panelLiveDisp.label}</span>
                      <span className="text-text-tertiary">·</span>
                      <span>{activeAlarm?.location ?? '수신반 확인 필요'}</span>
                      <span className="text-text-tertiary">·</span>
                      <span>{activeAlarm?.detectedAt ?? ''}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-[7px] h-[7px] rounded-full bg-safe-bar shrink-0" style={paBlink} />
                      <span className="text-safe font-bold">정상</span>
                      <span className="text-text-tertiary">·</span>
                      <span>이상 없음</span>
                      <span className="text-text-tertiary">·</span>
                      <span>{panelFresh.label}</span>
                    </>
                  )}
                </div>
              </div>

              {/* ② panel-notice + form-card (경보중 only) — NO red banner below header */}
              {panelMode === 'alarm' && (
                <div className="flex flex-col gap-[15px]">
                  {/* panel-notice */}
                  <div className="flex gap-2 px-[11px] py-[9px] rounded-[10px] bg-danger-bg border border-[rgba(239,68,68,.4)] text-caption text-danger leading-normal">
                    <span className="w-[7px] h-[7px] rounded-full bg-danger-bar shrink-0 mt-1" style={paBlink} />
                    <span>경보 자동감지 — 비화재보 기록 초안이 생성됐습니다. 수신반 활성화는 대부분 오작동이라 비화재보로 자동선택됩니다. 현장 확인·조치 후 발생장소·원인·조치를 보완해 저장하고, 실화재면 화재보로 바꾸세요.</span>
                  </div>
                  {/* auto-draft form-card */}
                  <div className="bg-surface-raised border border-border-default rounded-md overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3.5 py-3 border-b border-border-default text-label font-bold">
                      <AlertTriangle size={15} className="text-danger shrink-0" />
                      <span className="text-danger">자동 생성 초안 — 보완 필요</span>
                    </div>
                    <div className="px-3.5 py-3.5">
                      {renderPanelFields(true)}
                    </div>
                    {/* form-bar */}
                    <div className="flex gap-2 px-3.5 py-3 bg-surface-raised border-t border-border-default">
                      <button type="button" onClick={() => setCategoryIdx(null)}
                        className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-body-sm font-semibold cursor-pointer hover:bg-surface-sunken transition-colors">
                        나중에
                      </button>
                      <button type="button" onClick={handlePanelSave} disabled={paSaving}
                        className={`flex-1 py-3.5 rounded-md border-0 text-text-on-accent text-body font-bold transition-shadow ${
                          paSaving
                            ? 'bg-border-default cursor-default'
                            : 'bg-[linear-gradient(135deg,#dc2626,#ef4444)] cursor-pointer shadow-[0_2px_8px_rgba(239,68,68,0.3)]'
                        }`}>
                        {paSaving ? '저장 중...' : '조치완료 후 저장'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ③ evt-card (최근 48시간 병합 뷰 — 자동감지 + 수동기록, 점검모드 조회 유지) */}
              <div className="bg-surface-raised border border-border-default rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
                  <span className="text-caption font-semibold text-text-secondary">최근 이벤트 (최근 48시간)</span>
                  {panelMode === 'alarm' ? (
                    <span className="rounded-pill text-caption font-bold text-danger bg-danger-bg border border-[rgba(239,68,68,.4)] px-2 py-0.5 leading-none">감지중 {panelEvents.filter(e => e.status === 'active' || e.status === 'acked').length || 1}</span>
                  ) : (
                    <button onClick={() => setPanelHistoryOpen(true)} className="inline-flex items-center gap-[3px] rounded-pill text-[11px] font-bold text-text-secondary bg-surface-sunken border border-border-default pl-2.5 pr-2 py-1 leading-none cursor-pointer">전체 이력<ChevronRight size={13} /></button>
                  )}
                </div>
                {mergedPanelEvents.length === 0 ? (
                  <div className="px-3 py-[14px] text-caption text-text-tertiary text-center">최근 48시간 이벤트 없음</div>
                ) : (
                  mergedPanelEvents.map(ev => <PanelEventRow key={ev.id} item={ev} thumb />)
                )}
              </div>

              {/* ④ form-card (수기, 평상시 only) */}
              {panelMode === 'normal' && (
                <div className="bg-surface-raised border border-border-default rounded-md overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3.5 py-3 border-b border-border-default text-label font-bold">
                    <Plus size={15} className="text-text-secondary shrink-0" />
                    <span className="text-text-primary">수동 기록 추가</span>
                  </div>
                  <div className="px-3.5 py-3.5">
                    {renderPanelFields(false)}
                  </div>
                  {/* form-bar */}
                  <div className="flex gap-2 px-3.5 py-3 bg-surface-raised border-t border-border-default">
                    <button type="button" onClick={() => setCategoryIdx(null)}
                      className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-body-sm font-semibold cursor-pointer hover:bg-surface-sunken transition-colors">
                      취소
                    </button>
                    <button type="button" onClick={handlePanelSave} disabled={paSaving}
                      className={`flex-1 py-3.5 rounded-md border-0 text-text-on-accent text-body font-bold transition-shadow ${
                        paSaving
                          ? 'bg-border-default cursor-default'
                          : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] cursor-pointer shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
                      }`}>
                      {paSaving ? '저장 중...' : '점검 기록 저장'}
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </>
          )
        ) : recordId && detail ? (
          // ── 상세 보기 ──
          <>
            <div className="shrink-0 px-5 py-3 border-b border-border-default bg-surface-raised flex items-center gap-2.5">
              <button onClick={() => setRecordId(null)}
                className="w-8 h-8 rounded-sm bg-surface-sunken border border-border-default cursor-pointer flex items-center justify-center hover:bg-surface-active transition-colors">
                <ChevronLeft size={14} className="text-text-secondary" />
              </button>
              <span className="text-body-sm font-bold text-text-primary flex-1">조치 상세</span>
              <button onClick={() => navigate('/remediation/' + recordId)}
                className="px-3 py-1 rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-active transition-colors">
                전체 화면 열기
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="text-body font-bold text-text-primary mb-1">{(detail as any).category}</div>
              <div className="text-caption text-text-tertiary mb-3.5">
                {ZONE_LABEL[(detail as any).zone] ?? (detail as any).zone} {(detail as any).floor}{(detail as any).location ? ` · ${(detail as any).location}` : ''}
              </div>

              <table className="w-full border-collapse mb-4">
                <tbody>
                  {[
                    ['점검일시', fmtDateTime((detail as any).checkedAt)],
                    ['점검자',   (detail as any).staffName ?? '-'],
                    ['판정',     null],
                    ['상태',     null],
                    ['메모',     (detail as any).memo ?? '-'],
                  ].map(([label, value], i) => (
                    <tr key={i}>
                      <th className="w-[90px] px-2.5 py-1.5 bg-surface-sunken border border-border-default text-caption font-bold text-text-secondary text-left align-top">{label}</th>
                      <td className="px-2.5 py-1.5 border border-border-default text-label text-text-primary whitespace-pre-wrap align-top">
                        {label === '판정' ? (
                          <span className={`text-caption font-bold px-1.5 py-0.5 rounded-sm ${
                            (detail as any).result === 'bad'
                              ? 'bg-danger-bg text-danger'
                              : 'bg-warning-bg text-warning'
                          }`}>
                            {(detail as any).result === 'bad' ? '불량' : '주의'}
                          </span>
                        ) : label === '상태' ? (
                          <span className={`text-caption font-bold px-1.5 py-0.5 rounded-sm ${
                            (detail as any).status === 'open'
                              ? 'bg-fire-bg text-fire'
                              : 'bg-safe-bg text-safe'
                          }`}>
                            {(detail as any).status === 'open' ? '미조치' : '조치완료'}
                          </span>
                        ) : value as string}
                      </td>
                    </tr>
                  ))}
                  {(detail as any).status === 'resolved' && (
                    <>
                      <tr>
                        <th className="w-[90px] px-2.5 py-1.5 bg-surface-sunken border border-border-default text-caption font-bold text-text-secondary text-left">조치일시</th>
                        <td className="px-2.5 py-1.5 border border-border-default text-label text-text-primary">{fmtDateTime((detail as any).resolvedAt)}</td>
                      </tr>
                      <tr>
                        <th className="w-[90px] px-2.5 py-1.5 bg-surface-sunken border border-border-default text-caption font-bold text-text-secondary text-left">조치자</th>
                        <td className="px-2.5 py-1.5 border border-border-default text-label text-text-primary">{(detail as any).resolvedBy ?? '-'}</td>
                      </tr>
                      <tr>
                        <th className="w-[90px] px-2.5 py-1.5 bg-surface-sunken border border-border-default text-caption font-bold text-text-secondary text-left">조치 내용</th>
                        <td className="px-2.5 py-1.5 border border-border-default text-label text-text-primary whitespace-pre-wrap">{(detail as any).resolutionMemo ?? '-'}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* 사진 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border-default rounded-md p-2.5 bg-surface-raised">
                  <div className="text-caption font-bold text-text-secondary mb-1.5">📷 조치 전</div>
                  {(detail as any).photoKey ? (
                    <img src={'/api/uploads/' + (detail as any).photoKey} alt="조치 전" className="w-full max-h-[240px] object-contain rounded-sm bg-black" />
                  ) : (
                    <div className="h-[140px] flex items-center justify-center text-text-tertiary text-caption">사진 없음</div>
                  )}
                </div>
                <div className="border border-border-default rounded-md p-2.5 bg-surface-raised">
                  <div className="text-caption font-bold text-text-secondary mb-1.5">📷 조치 후</div>
                  {(detail as any).resolutionPhotoKey ? (
                    <img src={'/api/uploads/' + (detail as any).resolutionPhotoKey} alt="조치 후" className="w-full max-h-[240px] object-contain rounded-sm bg-black" />
                  ) : (
                    <div className="h-[140px] flex items-center justify-center text-text-tertiary text-caption">{(detail as any).status === 'open' ? '아직 조치 전' : '사진 없음'}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : categoryIdx !== null ? (
          // ── 카테고리 내역 목록 ──
          <>
            <div className="shrink-0 px-5 py-3 border-b border-border-default bg-surface-raised flex items-center gap-2.5">
              {(() => { const HeaderIcon = CATEGORY_ICONS[categoryIdx]; return <HeaderIcon size={20} className="text-text-secondary" /> })()}
              <span className="text-body-sm font-bold text-text-primary flex-1">{CATEGORY_GROUPS[categoryIdx].labels.join(', ')}</span>
              <button onClick={() => setExcludeNormal(!excludeNormal)}
                className={`px-2.5 py-1 rounded-sm text-caption font-bold cursor-pointer transition-colors ${
                  excludeNormal
                    ? 'border border-accent bg-accent/15 text-accent'
                    : 'border border-border-default bg-surface-sunken text-text-tertiary hover:bg-surface-active'
                }`}>
                {excludeNormal ? '✓ 정상 제외' : '정상 제외'}
              </button>
              <span className="text-caption text-text-tertiary">{categoryRecords.length}건</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3.5">
              {/* 써머리 카드 */}
              <InspectionSummaryCard categoryIdx={categoryIdx} allRecords={allRecords} />
              {isLoading ? (
                <div className="text-center py-10 text-text-tertiary text-caption">불러오는 중...</div>
              ) : categoryRecords.length === 0 ? (
                <div className="text-center py-10 text-text-tertiary text-caption">점검 내역이 없습니다</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {categoryRecords.map(r => {
                    const isIssue = r.result === 'bad' || r.result === 'caution'
                    const isResolved = isIssue && r.status === 'resolved'
                    const borderColorClass = isResolved
                      ? 'border-l-info-bar'
                      : r.result === 'bad'
                        ? 'border-l-danger-bar'
                        : r.result === 'caution'
                          ? 'border-l-warning-bar'
                          : 'border-l-safe-bar'
                    return (
                      <div key={r.id}
                        onClick={() => isIssue && setRecordId(r.id)}
                        className={`bg-surface-raised border border-border-default border-l-4 ${borderColorClass} rounded-md px-3 py-2.5 flex flex-col gap-1 transition-colors ${
                          isIssue ? 'cursor-pointer hover:bg-surface-sunken' : 'cursor-default'
                        }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-label font-bold text-text-primary flex-1">{r.category}</span>
                          <span className={`text-caption font-bold px-1.5 py-0.5 rounded-sm ${
                            r.result === 'bad'     ? 'bg-danger-bg text-danger'
                            : r.result === 'caution' ? 'bg-warning-bg text-warning'
                            :                          'bg-safe-bg text-safe'
                          }`}>
                            {r.result === 'bad' ? '불량' : r.result === 'caution' ? '주의' : '정상'}
                          </span>
                          {isIssue && (
                            <span className={`text-caption font-bold px-1.5 py-0.5 rounded-sm ${
                              r.status === 'open' ? 'bg-fire-bg text-fire' : 'bg-info-bg text-info'
                            }`}>
                              {r.status === 'open' ? '미조치' : '조치완료'}
                            </span>
                          )}
                        </div>
                        <div className="text-caption text-text-secondary">
                          {(ZONE_LABEL[r.zone] ?? r.zone)} {r.floor}{r.location ? ` · ${r.location}` : ''}
                        </div>
                        {r.memo && <div className="text-caption text-text-tertiary truncate">{r.memo.split('\n')[0]}</div>}
                        <div className="text-caption text-text-tertiary">{fmtDate(r.checkedAt)}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">
            좌측에서 점검 항목을 선택하세요
          </div>
        )}
      </div>

      {/* ── 데스크톱 경보 takeover 모달 (fire 전용, dash view only, !acked) — 고장/설비는 push+풀스크린만 ── */}
      {activeAlarm?.type === 'fire' && categoryIdx === null && ackedId !== activeAlarm.id && (
        <div className="alarm-modal absolute inset-0 z-[90] flex items-center justify-center p-6"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(239,68,68,.28), rgba(10,13,18,.92))' }}>
          <div className="am-card w-[560px] max-w-full rounded-[18px] border border-[rgba(239,68,68,.4)] bg-[rgba(26,31,39,.82)] backdrop-blur-md px-8 py-9 text-center shadow-[0_20px_60px_rgba(0,0,0,.5)]">
            <div className="am-ico w-[88px] h-[88px] mx-auto mb-5 rounded-full flex items-center justify-center bg-[rgba(239,68,68,.18)]"
              style={{ animation: 'firepulse 1.4s ease-in-out infinite' }}>
              <Flame size={44} className="text-danger" />
            </div>
            <div className="am-kind text-[24px] font-extrabold text-danger">화재 발생</div>
            <div className="am-loc text-[46px] font-extrabold text-text-primary leading-[1.05] my-2">{activeAlarm.location ?? '수신반 확인 필요'}</div>
            <div className="am-time font-mono tabular-nums text-body-sm text-text-tertiary">{activeAlarm.detectedAt}</div>
            <div className="am-sub text-body-sm text-text-secondary mt-2">현장 확인 및 조치 후 화재수신반 페이지에서 초안을 보완하세요</div>
            <div className="flex gap-2.5 mt-7">
              <button type="button" onClick={handleAlarmAck}
                className="am-ack flex-1 py-3.5 rounded-md border-0 bg-white text-[#b91c1c] text-body font-bold cursor-pointer hover:bg-white/90 transition-colors">
                확인 (경보 인지)
              </button>
              <button type="button" onClick={() => { setCategoryIdx(FIRE_ALARM_IDX); setRecordId(null); handleAlarmAck() }}
                className="am-go flex-1 py-3.5 rounded-md border border-border-strong bg-surface-sunken text-text-primary text-body font-bold cursor-pointer hover:bg-surface-active transition-colors">
                화재수신반 페이지
              </button>
            </div>
            <div className="am-note text-caption text-text-tertiary mt-4">해당시간 근무자 전원에게 발송 · 미확인 시 20초 × 3회 재발송</div>
          </div>
        </div>
      )}

      {/* ── 데스크톱 줌 오버레이 (biglive 클릭, usePinchZoom 2.2× · 줌 힌트 텍스트 없음) ── */}
      {panelZoomOpen && (
        <div className="zoom absolute inset-0 z-[95] flex flex-col bg-[#05070a] text-white">
          <button type="button" onClick={() => { setPanelZoomOpen(false); panelZoom.reset() }}
            className="zoom-close absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/[.12] text-white cursor-pointer z-10 hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 px-4 py-3.5 shrink-0">
            <span className="zoom-badge inline-flex items-center gap-1.5 text-body-sm font-extrabold">
              <span className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{ ...paBlink, background: panelMode === 'alarm' ? '#ef4444' : '#22c55e' }} />
              {panelMode === 'alarm' ? '화재' : 'LIVE'}
            </span>
            <span className="text-body-sm text-white/70">
              {panelMode === 'alarm' ? '화재 발생 · 자세히 보기' : '실시간 수신반 화면 · 자세히 보기'}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
            <div
              ref={panelZoom.containerRef}
              {...panelZoom.bind}
              style={{ touchAction: 'none', transform: panelZoom.transform }}
              className="zoom-frame w-full max-w-[1100px] aspect-video rounded-md bg-black overflow-hidden cursor-zoom-in">
              <LivePanelImage frameUpdatedAt={panelStatus?.frameUpdatedAt} imgClassName="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
