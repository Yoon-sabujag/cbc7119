import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inspectionApi, fireAlarmApi, extinguisherApi, remediationApi, scheduleApi, floorPlanMarkerApi, type ExtinguisherDetail, type FloorPlanMarker } from '../utils/api'
import toast from 'react-hot-toast'
import type { CheckPoint, CheckResult, Floor } from '../types'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { fmtKstLocaleString, fmtKstDate, fmtKstDateTime } from '../utils/datetime'
import { DIV_POINTS as DIV_PTS, type DivPoint as DivPt } from '../constants/divPoints'
import { InspectionRevisitPopup } from '../components/InspectionRevisitPopup'
import { AccessBlockedPopup } from '../components/AccessBlockedPopup'
import { useInspectionRevisitPopup, type MonthRecordEntry } from '../hooks/useInspectionRevisitPopup'
import type { ScheduleItem } from '../types'
import { computeCardCompletion } from '../utils/inspectionProgress'
import { getReplaceWarning } from '../utils/extinguisher'
import { CCTV_DVRS } from '../utils/cctv'
import {
  ChevronLeft, ChevronRight, Bell, Check, X, TrendingUp, Flame,
  // 카테고리 lucide (11종)
  Cloud, Shield, Car, Zap, BarChart3, Wind, ArrowDownToLine, Waves, Video, Server,
  FlaskConical, Building2, TrainFront,
  // Zone (3종)
  // 결과 (5종)
  CheckCircle2, AlertTriangle, XCircle, Wrench, HelpCircle,
  // 라벨 / 빈상태 (1종) — 260527-gql §7.1 enforce
  ClipboardList,
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

// 아이콘 컴포넌트 공통 타입 — lucide-react (size: string | number) 와 custom icons.tsx 모두 호환.
type IconComp = ComponentType<{ size?: number | string; className?: string }>

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

// 결과 아이콘 매핑 (§7.3)
const RESULT_ICONS: Record<string, IconComp> = {
  normal:     CheckCircle2,
  caution:    AlertTriangle,
  bad:        XCircle,
  unresolved: Wrench,
  missing:    HelpCircle,
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

// 점검 결과 입력용 (정상/주의/불량만 — 미조치는 별도 조치 스텝에서 처리)
// `icon` 필드는 § 7.1 enforce (260527-gql) 로 제거됨 — Lucide RESULT_ICONS 매핑이 단일 진실 원천.
const INSPECT_RESULT_OPTIONS: { value:CheckResult; label:string; color:string; bg:string }[] = [
  { value:'normal',  label:'정상', color:'var(--safe)',   bg:'rgba(34,197,94,.13)'  },
  { value:'caution', label:'주의', color:'var(--warn)',   bg:'rgba(245,158,11,.13)' },
  { value:'bad',     label:'불량', color:'var(--danger)', bg:'rgba(239,68,68,.13)'  },
]
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
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-[3] bg-[linear-gradient(to_bottom,var(--surface-raised)_30%,transparent)]"
           style={{ height: pad }} />
      {/* 하단 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[3] bg-[linear-gradient(to_top,var(--surface-raised)_30%,transparent)]"
           style={{ height: pad }} />

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
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload()
  const navigate = useNavigate()
  const [selectedSW,  setSelectedSW]  = useState<number | null>(null)
  const [floorResults, setFloorResults] = useState<Record<string, CheckResult>>({})
  const [memo,        setMemo]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [justSaved,   setJustSaved]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [visible,     setVisible]     = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const swDef = STAIRWELLS.find(s => s.id === selectedSW) ?? null

  // 선택된 계단실의 CP 목록
  const swCPs = useMemo(() =>
    selectedSW
      ? allCheckpoints.filter(cp => group.categories.includes(cp.category) && cp.locationNo === `S${selectedSW}`)
      : [],
    [selectedSW, allCheckpoints, group]
  )

  // 계단실 바뀌면 기존 records 로드 + 초기화
  const prevSW = useRef(selectedSW)
  useEffect(() => {
    if (prevSW.current !== selectedSW) {
      prevSW.current = selectedSW
      const init: Record<string, CheckResult> = {}
      swCPs.forEach(cp => { init[cp.id] = (records[cp.id] as CheckResult) ?? 'normal' })
      setFloorResults(init)
      setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  })// eslint-disable-line

  const swDoneCount = swCPs.filter(cp => records[cp.id]).length

  // 재진입 팝업 (공통 훅) — 선택된 계단실의 첫 CP 기준
  // 계단실 일괄 저장이라 개별 CP 기반이지만, 첫 CP 만 있어도 완료/미조치 상태를 드러내기에 충분.
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: swCPs[0]?.id ?? null,
    category:     '특별피난계단',
    monthRecords,
    scheduleItems,
  })

  const handleSave = async () => {
    if (!swDef || swCPs.length === 0) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      // 사진은 계단실 단위 메타에 가깝다. 모든 층 record 에 동일 photoKey 를 박으면
      // 상세 진입 시 전층이 같은 사진을 표시하므로, caution/bad 가 있으면 그 첫 층,
      // 없으면 첫 층 1건에만 attach.
      const photoTargetCp = photoKey
        ? (swCPs.find(cp => {
            const r = floorResults[cp.id] ?? 'normal'
            return r === 'caution' || r === 'bad'
          }) ?? swCPs[0])
        : null
      for (const cp of swCPs) {
        const keyForCp = photoTargetCp && cp.id === photoTargetCp.id ? photoKey : undefined
        await onSave(cp.id, floorResults[cp.id] ?? 'normal', memo, keyForCp ?? undefined)
      }
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  // result-mini 클래스 매핑 (Wave 5 — Stairwell/Cctv 공용 컴팩트 픽커)
  const resultMiniCls = (active: boolean, value: CheckResult) =>
    active
      ? value === 'normal' ? 'border-safe-bar bg-safe-bg text-safe'
        : value === 'caution' ? 'border-warning-bar bg-warning-bg text-warning'
        : 'border-danger-bar bg-danger-bg text-danger'
      : 'border-border-default bg-surface-page text-text-tertiary'

  const resultIcon = (value: CheckResult) =>
    value === 'normal' ? CheckCircle2 : value === 'caution' ? AlertTriangle : XCircle

  return (
    <div
      className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col overflow-hidden"
      style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
    >

      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0">
        <StairsIcon size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold text-text-primary leading-tight truncate">
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
            const done = swCPsAll.length > 0 && swCPsAll.every(cp => records[cp.id])
            const isActive = selectedSW === sw.id
            const stateCls = isActive
              ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
              : done
                ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                : 'border border-border-strong bg-surface-page text-text-secondary'
            return (
              <button
                key={sw.id}
                onClick={() => setSelectedSW(sw.id)}
                className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors ${stateCls}`}
              >
                {sw.id}{done && !isActive && <Check size={12} className="inline-block ml-1 opacity-85" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 relative">
        {!selectedSW && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">계단실을 선택해 주세요</div>
        )}

        {swDef && (
          <div className="relative flex flex-col gap-2.5">
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
            {/* 완료 뱃지 */}
            {swDoneCount > 0 && !justSaved && (
              <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-1.5 text-label font-semibold text-safe inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-safe flex-shrink-0" />
                {swDoneCount}/{swCPs.length}층 이미 점검 완료
              </div>
            )}

            {/* 층별 결과 — 2열 */}
            <div className="grid grid-cols-2 gap-2">
              {/* 왼쪽 열 */}
              <div className="flex flex-col gap-1.5">
                {swDef.floors.slice(0, swDef.leftCount).map(floor => {
                  const cp = swCPs.find(c => c.floor === floor)
                  if (!cp) return null
                  const curResult = floorResults[cp.id] ?? 'normal'
                  return (
                    <div key={floor} className="bg-surface-raised border border-border-default rounded-md px-2 pt-2 pb-1.5">
                      <div className="text-caption font-bold text-text-secondary mb-1.5">{floor}</div>
                      <div className="flex gap-1">
                        {INSPECT_RESULT_OPTIONS.map(opt => {
                          const Icon = resultIcon(opt.value)
                          const active = curResult === opt.value
                          return (
                            <button
                              key={opt.value}
                              onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))}
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
                })}
              </div>
              {/* 오른쪽 열 */}
              <div className="flex flex-col gap-1.5">
                {swDef.floors.slice(swDef.leftCount).map(floor => {
                  const cp = swCPs.find(c => c.floor === floor)
                  if (!cp) return null
                  const curResult = floorResults[cp.id] ?? 'normal'
                  return (
                    <div key={floor} className="bg-surface-raised border border-border-default rounded-md px-2 pt-2 pb-1.5">
                      <div className="text-caption font-bold text-text-secondary mb-1.5">{floor}</div>
                      <div className="flex gap-1">
                        {INSPECT_RESULT_OPTIONS.map(opt => {
                          const Icon = resultIcon(opt.value)
                          const active = curResult === opt.value
                          return (
                            <button
                              key={opt.value}
                              onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))}
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
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none outline-none box-border font-sans placeholder:text-text-tertiary" />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>

            {submitError && <div className="bg-danger-bg border border-danger-bar rounded-sm px-3 py-2 text-label font-semibold text-danger">{submitError}</div>}
            {justSaved  && <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-2 text-label font-semibold text-safe inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-safe flex-shrink-0" />저장 완료</div>}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        <button onClick={onClose}
          className="px-[18px] py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-label font-semibold cursor-pointer transition-colors">
          닫기
        </button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || !selectedSW}
          className="flex-1 py-3.5 rounded-md text-body font-bold border-0 transition-all"
          style={{
            background: (submitting || photo.uploading || !selectedSW) ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
            color:      (submitting || photo.uploading || !selectedSW) ? 'var(--text-tertiary)' : '#fff',
            cursor:     (submitting || photo.uploading || !selectedSW) ? 'default' : 'pointer',
            boxShadow:  (submitting || photo.uploading || !selectedSW) ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
          }}
        >
          {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : `계단실 ${selectedSW ?? ''} 점검 저장`}
        </button>
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
  const photo = usePhotoUpload()
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
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0">
        <Video size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold text-text-primary truncate">CCTV 점검</div>
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
  const photo = usePhotoUpload()
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
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0">
        <SmokeVentIcon size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1">
          <div className="text-body font-bold text-text-primary">{group.labels[0]}</div>
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
                {ZIcon && <ZIcon size={14} />}{BY_ZONE_LABELS[z]}{allDone && <Check size={12} className="inline-block ml-1 opacity-80" />}
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
                  {f}{fDone && <Check size={12} className="inline-block ml-0.5 opacity-75" />}
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
                  {getPositionLabel(cp)}{isDone && <Check size={12} className="inline-block ml-1 opacity-80" />}
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
              <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-[9px] text-label text-safe flex items-center gap-1.5"><Check size={14} />이미 점검 완료된 항목입니다</div>
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
            {justSaved  && <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-2 text-label text-safe flex items-center gap-1.5"><Check size={14} />저장 완료</div>}
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
          className={`flex-1 py-[13px] rounded-md border-none text-white text-body-sm font-bold cursor-pointer transition-colors disabled:text-text-tertiary disabled:cursor-default ${
            submitting||photo.uploading||!selectedCP
              ? 'bg-border-strong'
              : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]'
          }`}
        >
          {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : '점검 기록 저장'}
        </button>
      </div>
    </div>
  )
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
        className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-[2] pointer-events-none bg-[rgba(14,165,233,.08)] border-y border-[rgba(14,165,233,.22)]"
        style={{ height: ITEM_H }}
      />
      <div
        className="absolute top-0 left-0 right-0 z-[3] pointer-events-none bg-[linear-gradient(to_bottom,var(--surface-raised)_30%,transparent)]"
        style={{ height: pad }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 z-[3] pointer-events-none bg-[linear-gradient(to_top,var(--surface-raised)_30%,transparent)]"
        style={{ height: pad }}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto box-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [scroll-snap-type:y_mandatory]"
        style={{ paddingTop: pad, paddingBottom: pad }}
      >
        {items.map((item, idx) => {
          const dist = Math.abs(idx - activeIdx)
          const opacityClass = dist === 0 ? 'opacity-100' : dist === 1 ? 'opacity-[0.48]' : 'opacity-[0.15]'
          return (
            <div
              key={item.id}
              className={`flex items-center px-3.5 cursor-pointer transition-opacity duration-100 [scroll-snap-align:center] ${opacityClass}`}
              style={{ height: ITEM_H }}
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
function DivTrendSubview({ point, records, onClose }: {
  point:   DivPt
  records: any[]   // oldest → newest
  onClose: () => void
}) {
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
      className="fixed left-0 right-0 z-[99] flex flex-col bg-surface-page top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]"
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
          <div className="text-body-sm font-bold text-text-primary">{point.floorLabel} — {point.loc}</div>
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
                      <svg width={Math.max(W, n * 28)} height={sH} className="block">
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
                    <div key={i} className={`text-caption font-bold text-center font-mono ${i === 0 ? 'text-[#3b82f6]' : i === 1 ? 'text-[#f97316]' : 'text-[#22c55e]'}`}>
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

function DivModal({ onClose, onSaveRecord, initialLocationNo, monthRecords, scheduleItems }: {
  onClose: () => void
  onSaveRecord: (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
  initialLocationNo?: string
  monthRecords:  Record<string, MonthRecordEntry>
  scheduleItems: ScheduleItem[]
}) {
  const staff = useAuthStore(s => s.staff)
  const navigate = useNavigate()

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
  const [result, setResult] = useState<CheckResult>('normal')
  const [memo,   setMemo]   = useState('')
  const photo = usePhotoUpload()
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
      })
      .catch(() => setPrevRecords([]))
  }, [currentPt?.id])

  // ── 자동 결과 판단 ──
  useEffect(() => {
    const p1 = parsedP1
    const p2 = parsedP2
    if (p1 === null && p2 === null) { setAutoReason(''); return }

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

    if (reasons.length > 0) {
      setAutoReason(`${level === 'bad' ? '불량' : '주의'} 자동 선택 — ${reasons.join(', ')}`)
      setResult(level === 'bad' ? 'bad' : 'caution')
    } else {
      setAutoReason('')
      setResult('normal')
    }
  }, [digits, prevRecords])

  // ── 폼 초기화 ──
  const resetForm = useCallback(() => {
    setDigits(['','','','','','','','',''])
    setDrain('none')
    setResult('normal')
    setMemo('')
    setAutoReason('')
    photo.reset()
  }, [photo])

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
          result,
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
        await onSaveRecord(cpId, result, memo || '', photoKey ?? undefined).catch(() => {/* 점검 기록 실패해도 압력 저장은 유지 */})
      }

      resetForm()
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
    return { id, label: `${pt?.floorLabel} — ${pt?.loc}` }
  }), [underPending])

  // ── 재진입 팝업 (공통 훅) ──
  const currentCpId = currentPt ? DIV_PT_CP[currentPt.id] ?? null : null
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: currentCpId,
    category:     'DIV',
    monthRecords,
    scheduleItems,
  })

  // ── 완료 화면 ──
  if (done) return (
    <div
      className="fixed left-0 right-0 z-[99] flex flex-col items-center justify-center gap-4 bg-surface-page top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]"
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
      className="fixed left-0 right-0 z-[99] flex flex-col overflow-hidden bg-surface-page top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0">
        <BarChart3 size={18} className="text-text-secondary" />
        <span className="text-body font-bold text-text-primary">DIV 점검</span>
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

      {/* 구역 선택 — sticky raised wrapper */}
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

      {/* 라인 선택 (연구동/사무동) — sticky raised wrapper */}
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
                  DIV #{l}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 본문 (재진입 팝업 부분 오버레이의 부모 — position:relative 필수) */}
      <div className="relative flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
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
                    const sx = (e.currentTarget as any)._swX
                    if (sx == null) return
                    const dx = e.changedTouches[0].clientX - sx
                    if (dx > 40 && canPrev) goPrev()
                    else if (dx < -40 && canNext) goNext()
                  }}
                >
                  <button className={navBtnCls(canPrev)} onClick={canPrev ? goPrev : undefined}>
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-caption text-text-tertiary font-semibold">현재 개소</div>
                    <div className="text-body-sm font-bold text-text-primary mt-0.5">{currentPt.floorLabel} — DIV #{currentPt.pos}</div>
                    <div className="text-caption text-text-secondary mt-0.5">{currentPt.loc}</div>
                  </div>
                  <button className={navBtnCls(canNext)} onClick={canNext ? goNext : undefined}>
                    <ChevronRight size={20} />
                  </button>
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
                  className="w-full px-2.5 py-2 rounded-sm text-label font-bold cursor-pointer border border-border-default bg-surface-active text-text-primary inline-flex items-center justify-center gap-1.5">
                  <Wind size={14} className="text-text-secondary" />
                  컴프레셔 점검 →
                </button>
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
              {autoReason && (
                result === 'bad' ? (
                  <div className="mt-2 px-3 py-2 rounded-sm bg-fire-bg border border-fire-bar text-fire text-label font-semibold inline-flex items-center gap-1.5">
                    <Flame size={14} /> {autoReason}
                  </div>
                ) : (
                  <div className="mt-2 px-3 py-2 rounded-sm bg-warning-bg border border-warning-bar text-warning text-label font-semibold inline-flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {autoReason}
                  </div>
                )
              )}
            </div>

            {/* 특이사항 + 사진 */}
            <div className="flex gap-2.5 items-start">
              <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항 (선택)"
                className="flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none outline-none box-border font-sans placeholder:text-text-tertiary" />
              <PhotoButton hook={photo} />
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 바 — 닫기 항상, 저장은 개소 선택 후 */}
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        <button onClick={onClose} className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer">닫기</button>
        {currentPt && (
          <button onClick={handleSave} disabled={saving || digits.slice(0, totalDigitSlots).some(d => d === '')}
            className="flex-1 py-3.5 rounded-md text-text-on-accent text-body font-bold border-0"
            style={{
              background: (saving || digits.slice(0, totalDigitSlots).some(d=>d==='')) ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
              cursor: saving ? 'default' : 'pointer'
            }}>
            {saving ? '저장 중...' :
              zone === 'underground'
                ? (underPickIdx < underPending.length-1 ? '저장 후 다음 개소' : '저장 (완료)')
                : (lineIdx < DIV_LINE_SEQ[line!].length-1 ? '저장 후 다음 층' : '저장 (완료)')}
          </button>
        )}
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
        />
      )}

      {/* 컴프레셔 점검 서브뷰 (DIV에서 호출) */}
      {showCompressor && currentPt && (
        <CompressorModal
          onClose={() => setShowCompressor(false)}
          onSaveRecord={onSaveRecord}
          initialLocationNo={currentPt.id}
          mode="from-div"
          monthRecords={monthRecords}
          scheduleItems={scheduleItems}
        />
      )}
    </div>
  )
}

// ── 컴프레셔 점검 모달 ──────────────────────────────────
function CompressorModal({ onClose, onSaveRecord, initialLocationNo, mode = 'standalone', monthRecords, scheduleItems }: {
  onClose: () => void
  onSaveRecord: (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
  initialLocationNo?: string
  mode?: 'standalone' | 'from-div'
  monthRecords:  Record<string, MonthRecordEntry>
  scheduleItems: ScheduleItem[]
}) {
  const staff = useAuthStore(s => s.staff)
  const photo = usePhotoUpload()
  const navigate = useNavigate()

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

      await fetch('/api/div/comp-inspection', {
        method:'POST', headers: hdrs,
        body: JSON.stringify({
          location_no: currentPt.id, floor: currentPt.floor, position: currentPt.pos,
          year: now.getFullYear(), month: now.getMonth()+1, day: now.getDate(),
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
      className={`fixed left-0 right-0 flex flex-col items-center justify-center gap-4 bg-surface-page top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))] ${mode === 'from-div' ? 'z-[120]' : 'z-[99]'}`}
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
      className={`fixed left-0 right-0 flex flex-col overflow-hidden bg-surface-page top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))] ${mode === 'from-div' ? 'z-[120]' : 'z-[99]'}`}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0">
        <Wind size={18} className="text-text-secondary" />
        <span className="text-body font-bold text-text-primary">컴프레셔 점검</span>
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
                    <div className="text-caption text-text-secondary mt-0.5">{currentPt.loc}</div>
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
                <div className="text-caption text-text-secondary mt-0.5">{currentPt.loc}</div>
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
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
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
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload()
  const navigate = useNavigate()
  const [zone,        setZone]        = useState<PPZone | null>(null)
  const [pickerIdx,   setPickerIdx]   = useState<number>(0)
  const [result,      setResult]      = useState<CheckResult>('normal')
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
  const isDone     = selectedCP ? !!records[selectedCP.id] : false
  const doneCount  = zoneCPs.filter(cp => records[cp.id]).length
  const totalCount = zoneCPs.length

  const prevZone = useRef(zone)
  useEffect(() => {
    if (prevZone.current !== zone) {
      prevZone.current = zone
      setPickerIdx(0); setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  const prevIdx = useRef(pickerIdx)
  useEffect(() => {
    if (prevIdx.current !== pickerIdx) {
      prevIdx.current = pickerIdx
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // 재진입 팝업 (공통 훅)
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: selectedCP?.id ?? null,
    category:     '소방용전원공급반',
    monthRecords,
    scheduleItems,
  })

  const handleSave = async () => {
    if (!selectedCP) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      await onSave(selectedCP.id, result, memo, photoKey ?? undefined)
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
      <div className="flex items-center px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0 gap-2.5">
        <Zap size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold text-text-primary">{group.labels[0]}</div>
        </div>
      </div>

      {/* 구역 선택 */}
      <div className="bg-surface-raised border-b border-border-default px-3.5 py-2 flex-shrink-0">
        <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">구역 선택</div>
        <div className="flex gap-1.5">
          {(['research','office','underground'] as PPZone[]).map(z => {
            const zCPs   = allCheckpoints.filter(cp => cp.category === '소방용전원공급반' && cp.locationNo?.startsWith(PP_ZONE_PREFIX[z]))
            const allDone = zCPs.length > 0 && zCPs.every(cp => records[cp.id])
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

      {/* 개소 선택 — DIV 스타일 카드 + 좌우 스와이프 */}
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
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-3 relative">
        {!zone && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">구역을 선택해 주세요</div>
        )}

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
          disabled={submitting || photo.uploading || !selectedCP}
          className="flex-1 py-3.5 rounded-md text-body font-bold border-0 transition-all"
          style={{
            background: (submitting || photo.uploading || !selectedCP) ? 'var(--border-default)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
            color:      (submitting || photo.uploading || !selectedCP) ? 'var(--text-tertiary)' : '#fff',
            cursor:     (submitting || photo.uploading || !selectedCP) ? 'default' : 'pointer',
            boxShadow:  (submitting || photo.uploading || !selectedCP) ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
          }}
        >
          {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : '점검 기록 저장'}
        </button>
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
  const photo = usePhotoUpload()
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
      <div className="flex items-center px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0 gap-2.5">
        <Car size={18} className="text-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold text-text-primary truncate">
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
                {label}{!isActive && allDone && <Check size={12} className="inline-block ml-1 opacity-85" />}
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
                  {door}{!isActive && doneDoor && <Check size={12} className="inline-block ml-1 opacity-85" />}
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
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
  initialCpId?:   string
}) {
  const photo = usePhotoUpload()
  const navigate = useNavigate()
  // QR에서 넘어온 경우 초기 항목 자동 선택
  const initCp = initialCpId ? allCheckpoints.find(cp => cp.id === initialCpId) : null
  const initItem: '전실제연댐퍼'|'연결송수관'|null = initCp?.category === '전실제연댐퍼' ? '전실제연댐퍼' : initCp?.category === '연결송수관' ? '연결송수관' : null
  // 전실제연댐퍼 QR: locationNo에서 계단전실 번호 추출 (예: "B5F-2" → "2")
  const initStair = initCp?.category === '전실제연댐퍼' && initCp.locationNo ? initCp.locationNo.split('-').pop() ?? null : null
  // 연결송수관 QR: location으로 subItem 설정
  const initSubItem = initCp?.category === '연결송수관' ? initCp.location : null
  const [item,        setItem]        = useState<'전실제연댐퍼'|'연결송수관'|null>(initItem)
  // 연결송수관 states
  const [subItem,     setSubItem]     = useState<string|null>(initSubItem)
  const [result,      setResult]      = useState<CheckResult>('normal')
  // 전실제연댐퍼 states — StairwellModal 패턴
  const [selectedStair, setSelectedStair] = useState<string|null>(initStair)
  const [selectedEquip, setSelectedEquip] = useState<string|null>(!initStair && initCp?.category === '전실제연댐퍼' && !initCp.locationNo ? initCp.id : null)
  const [floorResults,  setFloorResults]  = useState<Record<string, CheckResult>>({})

  const [memo,        setMemo]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [justSaved,   setJustSaved]   = useState(false)
  const [submitError, setSubmitError] = useState<string|null>(null)
  const [visible,     setVisible]     = useState(false)
  // Wave 2 sp7 패턴 — 댐퍼 증상 피커(equip + yscp 두 모드에서 result !== 'normal' 시 표시)
  const [damperSymptomPick, setDamperSymptomPick] = useState<string>('기판 조작 불량')

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  // Reset on item change
  const prevItem = useRef(item)
  useEffect(() => {
    if (prevItem.current !== item) {
      prevItem.current = item
      setSubItem(null); setSelectedStair(null); setSelectedEquip(null)
      setFloorResults({}); setResult('normal')
      setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
      setDamperSymptomPick('기판 조작 불량')
    }
  }) // eslint-disable-line

  // Reset on 연결송수관 subItem change
  const prevSub = useRef(subItem)
  useEffect(() => {
    if (prevSub.current !== subItem) {
      prevSub.current = subItem
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
      setDamperSymptomPick('기판 조작 불량')
    }
  }) // eslint-disable-line

  // 계단전실 unique numbers (from locationNo last segment)
  const stairNums = useMemo(() => {
    const nums = new Set(
      allCheckpoints
        .filter(cp => cp.category === '전실제연댐퍼' && cp.locationNo)
        .map(cp => cp.locationNo!.split('-').pop()!)
    )
    return Array.from(nums).sort((a, b) => Number(a) - Number(b))
  }, [allCheckpoints])

  // 배기팬/급기팬 (locationNo가 없는 장비 항목)
  const equipCPs = useMemo(() => {
    const order: Floor[] = ['B5','B4','B3','B2','B1','1F','2F']
    return allCheckpoints
      .filter(cp => cp.category === '전실제연댐퍼' && !cp.locationNo)
      .sort((a, b) => order.indexOf(a.floor) - order.indexOf(b.floor))
  }, [allCheckpoints])

  // 선택된 계단전실의 층별 CP 목록
  const stairCPs = useMemo(() => {
    if (!selectedStair) return []
    const order: Floor[] = ['B5','B4','B3','B2','B1','1F']
    return order
      .map(f => allCheckpoints.find(cp => cp.category === '전실제연댐퍼' && cp.locationNo?.endsWith(`-${selectedStair}`) && cp.floor === f))
      .filter(Boolean) as CheckPoint[]
  }, [selectedStair, allCheckpoints])

  // Reset on stairwell change — load existing records
  const prevStair = useRef(selectedStair)
  useEffect(() => {
    if (prevStair.current !== selectedStair) {
      prevStair.current = selectedStair
      setSelectedEquip(null)
      if (selectedStair) {
        const init: Record<string, CheckResult> = {}
        stairCPs.forEach(cp => { init[cp.id] = (records[cp.id] as CheckResult) ?? 'normal' })
        setFloorResults(init)
      }
      setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // Reset on equip change
  const prevEquip = useRef(selectedEquip)
  useEffect(() => {
    if (prevEquip.current !== selectedEquip) {
      prevEquip.current = selectedEquip
      setSelectedStair(null)
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
      setDamperSymptomPick('기판 조작 불량')
    }
  }) // eslint-disable-line

  const stairDoneCount = stairCPs.filter(cp => records[cp.id]).length

  const JD_FLOOR_LABEL: Record<string, string> = {
    'B5':'지하5층','B4':'지하4층','B3':'지하3층','B2':'지하2층','B1':'지하1층','1F':'지상1층','2F':'지상2층'
  }

  // 연결송수관 cpId
  const yscpId = useMemo(() => {
    if (item === '연결송수관' && subItem)
      return allCheckpoints.find(cp => cp.category === '연결송수관' && cp.location === subItem)?.id ?? null
    return null
  }, [item, subItem, allCheckpoints])

  // 재진입 팝업 (공통 훅) — 선택된 개소 / 카테고리 기준
  const revisitCpId = item === '연결송수관'
    ? yscpId
    : (selectedEquip ?? (selectedStair ? stairCPs[0]?.id ?? null : null))
  const { popupState, dismiss } = useInspectionRevisitPopup({
    checkpointId: revisitCpId ?? null,
    category:     item === '연결송수관' ? '연결송수관' : '전실제연댐퍼',
    monthRecords,
    scheduleItems,
  })

  // 전실제연댐퍼 계단전실 일괄 저장
  const handleStairSave = async () => {
    if (stairCPs.length === 0) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      // 계단전실 한 동을 층별로 일괄 점검. 사진은 stair 단위 메타에 가까우므로
      // 모든 층 record 에 동일 photoKey 가 박혀 상세 전 record 가 같은 사진을 표시하지 않도록,
      // caution/bad 가 있으면 그 첫 층, 없으면 첫 층 1건에만 attach.
      const photoTargetCp = photoKey
        ? (stairCPs.find(cp => {
            const r = floorResults[cp.id] ?? 'normal'
            return r === 'caution' || r === 'bad'
          }) ?? stairCPs[0])
        : null
      // 댐퍼 증상 피커 — stair 모드에서도 nonnormal 층 1+ 있을 때 finalMemo 분기 (Wave 2 패턴 일관)
      const hasNonNormal = stairCPs.some(cp => {
        const r = floorResults[cp.id] ?? 'normal'
        return r !== 'normal'
      })
      const finalMemo = hasNonNormal
        ? (damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick)
        : memo
      for (const cp of stairCPs) {
        const keyForCp = photoTargetCp && cp.id === photoTargetCp.id ? photoKey : undefined
        await onSave(cp.id, floorResults[cp.id] ?? 'normal', finalMemo, keyForCp ?? undefined)
      }
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  // 연결송수관 or 장비 개별 저장
  const handleSingleSave = async () => {
    const cpId = item === '연결송수관' ? yscpId : selectedEquip
    if (!cpId) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      // 댐퍼 증상 피커 — 전실제연댐퍼 equip 모드 + result !== 'normal' 시만 적용.
      // 연결송수관(yscp)은 별개 소화설비 (탭으로만 묶임) — 증상 피커 패턴 적용 X.
      const finalMemo = (item === '전실제연댐퍼' && result !== 'normal')
        ? (damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick)
        : memo
      await onSave(cpId, result, finalMemo, photoKey ?? undefined)
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  const canSave = (item === '전실제연댐퍼' && selectedStair && stairCPs.length > 0)
    || (item === '전실제연댐퍼' && selectedEquip)
    || (item === '연결송수관' && subItem)

  // 전실제연댐퍼 UI mode
  const jdMode = item === '전실제연댐퍼' ? (selectedStair ? 'stair' : selectedEquip ? 'equip' : 'select') : null

  // 결과 picker 클래스 매핑 (BaeyeonModal 과 동일 — pill + lucide outline + status outline+tinted bg)
  const resultPickerCls = (active: boolean, value: CheckResult) =>
    active
      ? value === 'normal' ? 'border-safe-bar bg-safe-bg text-safe'
        : value === 'caution' ? 'border-warning-bar bg-warning-bg text-warning'
        : 'border-danger-bar bg-danger-bg text-danger'
      : 'border-border-default bg-surface-raised text-text-tertiary'

  // result-mini 클래스 매핑 (stair 모드 — 축소판)
  const resultMiniCls = (active: boolean, value: CheckResult) =>
    active
      ? value === 'normal' ? 'border-safe-bar bg-safe-bg text-safe'
        : value === 'caution' ? 'border-warning-bar bg-warning-bg text-warning'
        : 'border-danger-bar bg-danger-bg text-danger'
      : 'border-border-default bg-surface-page text-text-tertiary'

  const resultIcon = (value: CheckResult) =>
    value === 'normal' ? CheckCircle2 : value === 'caution' ? AlertTriangle : XCircle

  return (
    <div
      className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col"
      style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
    >

      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0">
        <Shield className="w-[18px] h-[18px] text-text-secondary flex-shrink-0" />
        <div className="flex-1">
          <div className="text-body font-bold text-text-primary truncate">
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
            const allDone = catCPs.length > 0 && catCPs.every(cp => records[cp.id])
            const isSel   = item === label
            const cls = isSel
              ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
              : allDone
                ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                : 'border border-border-strong bg-surface-page text-text-secondary'
            return (
              <button key={label} onClick={() => setItem(label)}
                className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                {label}{allDone && <Check size={12} className="inline-block ml-1 opacity-80" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 전실제연댐퍼 → 계단전실 선택 */}
      {item === '전실제연댐퍼' && (
        <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0">
          <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">계단전실 선택</div>
          <div className="flex gap-1.5 flex-wrap">
            {stairNums.map(num => {
              const sCPs = allCheckpoints.filter(cp => cp.category === '전실제연댐퍼' && cp.locationNo?.endsWith(`-${num}`))
              const done = sCPs.length > 0 && sCPs.every(cp => records[cp.id])
              const isSel = selectedStair === num
              const cls = isSel
                ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                : done
                  ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                  : 'border border-border-strong bg-surface-page text-text-secondary'
              return (
                <button key={num} onClick={() => { setSelectedEquip(null); setSelectedStair(num) }}
                  className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                  {num}{done && <Check size={12} className="inline-block ml-1 opacity-80" />}
                </button>
              )
            })}
            {equipCPs.length > 0 && equipCPs.map(cp => {
              const done = !!records[cp.id]
              const isSel = selectedEquip === cp.id
              const cls = isSel
                ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                : done
                  ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                  : 'border border-border-strong bg-surface-page text-text-secondary'
              return (
                <button key={cp.id} onClick={() => { setSelectedStair(null); setSelectedEquip(cp.id) }}
                  className={`px-2.5 py-1.5 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                  {cp.location}{done && <Check size={12} className="inline-block ml-1 opacity-80" />}
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
              const isDone = !!records[cp.id]
              const cls = isSel
                ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                : isDone
                  ? 'border-[1.5px] border-safe-bar bg-safe-bg text-safe'
                  : 'border border-border-strong bg-surface-page text-text-secondary'
              return (
                <button key={cp.id} onClick={() => setSubItem(cp.location)}
                  className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-sm text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${cls}`}>
                  {cp.location}{isDone && <Check size={12} className="inline-block ml-1 opacity-80" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 relative">
        {!item && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">항목을 선택해 주세요</div>
        )}

        {/* 점검 폼 컨테이너 (재진입 팝업 부분 오버레이의 부모) — item 선택 후에만 렌더 */}
        {item && (
          <div className="relative flex flex-col gap-2.5">
            {/* 재진입 팝업 (소화기 방식 부분 오버레이 — 폼 서브 컨테이너만 덮음) */}
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

        {/* 전실제연댐퍼 — 계단전실 2열 층별 리스트 (StairwellModal 패턴) */}
        {jdMode === 'stair' && (
          <>
            {stairDoneCount > 0 && !justSaved && (
              <div className="bg-safe-bg border border-safe-bar rounded-sm px-3 py-1.5 text-label text-safe flex items-center gap-1.5">
                <Check size={14} />{stairDoneCount}/{stairCPs.length}층 이미 점검 완료
              </div>
            )}

            {/* 층별 결과 — 2열 */}
            <div className="grid grid-cols-2 gap-2">
              {/* 왼쪽 열 */}
              <div className="flex flex-col gap-1.5">
                {stairCPs.slice(0, Math.ceil(stairCPs.length / 2)).map(cp => {
                  const curResult = floorResults[cp.id] ?? 'normal'
                  const isInit = !!(initCp && cp.floor === initCp.floor)
                  return (
                    <div key={cp.id}
                      className={`bg-surface-raised rounded-[10px] px-[9px] pt-[9px] pb-[7px] ${isInit ? 'border-2 border-fire-bar' : 'border border-border-default'}`}>
                      <div className={`text-caption font-bold mb-1.5 ${isInit ? 'text-fire-bar' : 'text-text-secondary'}`}>{JD_FLOOR_LABEL[cp.floor] ?? cp.floor}</div>
                      <div className="flex gap-1">
                        {INSPECT_RESULT_OPTIONS.map(opt => {
                          const Icon = resultIcon(opt.value)
                          const active = curResult === opt.value
                          return (
                            <button key={opt.value} onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))}
                              className={`flex-1 px-1 py-1.5 rounded-pill border-[1.5px] text-caption font-bold whitespace-nowrap inline-flex items-center justify-center gap-[3px] cursor-pointer transition-colors ${resultMiniCls(active, opt.value)}`}>
                              <Icon className="w-3 h-3 flex-shrink-0" />
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* 오른쪽 열 */}
              <div className="flex flex-col gap-1.5">
                {stairCPs.slice(Math.ceil(stairCPs.length / 2)).map(cp => {
                  const curResult = floorResults[cp.id] ?? 'normal'
                  const isInit = !!(initCp && cp.floor === initCp.floor)
                  return (
                    <div key={cp.id}
                      className={`bg-surface-raised rounded-[10px] px-[9px] pt-[9px] pb-[7px] ${isInit ? 'border-2 border-fire-bar' : 'border border-border-default'}`}>
                      <div className={`text-caption font-bold mb-1.5 ${isInit ? 'text-fire-bar' : 'text-text-secondary'}`}>{JD_FLOOR_LABEL[cp.floor] ?? cp.floor}</div>
                      <div className="flex gap-1">
                        {INSPECT_RESULT_OPTIONS.map(opt => {
                          const Icon = resultIcon(opt.value)
                          const active = curResult === opt.value
                          return (
                            <button key={opt.value} onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))}
                              className={`flex-1 px-1 py-1.5 rounded-pill border-[1.5px] text-caption font-bold whitespace-nowrap inline-flex items-center justify-center gap-[3px] cursor-pointer transition-colors ${resultMiniCls(active, opt.value)}`}>
                              <Icon className="w-3 h-3 flex-shrink-0" />
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 댐퍼 증상 피커 (stair 모드 — nonnormal 층 1+ 있을 때만 표시, Wave 2 sp7 패턴 일관) */}
            {stairCPs.some(cp => (floorResults[cp.id] ?? 'normal') !== 'normal') && (
              <div>
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
                <div className="flex flex-wrap gap-1.5">
                  {['기판 조작 불량','모터 기능 이상','직접 입력'].map(s => {
                    const active = damperSymptomPick === s
                    return (
                      <button key={s} onClick={() => setDamperSymptomPick(s)}
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

            {/* 특이사항 + 사진 (stair 모드 — 메모 1건, 모든 층 record 에 동일 박힘) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">
                  {stairCPs.some(cp => (floorResults[cp.id] ?? 'normal') !== 'normal') && damperSymptomPick === '직접 입력'
                    ? '증상 상세 및 특이사항 (선택)'
                    : '특이사항 (선택)'}
                </label>
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

        {/* 전실제연댐퍼 — 장비(배기/급기팬) 개별 폼 */}
        {jdMode === 'equip' && selectedEquip && (() => {
          const eqCp = equipCPs.find(cp => cp.id === selectedEquip)
          if (!eqCp) return null
          const eqDone = !!records[eqCp.id]
          return (
            <>
              {eqDone && !justSaved && (
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
              {/* 댐퍼 증상 피커 (Wave 2 sp7 패턴 — result !== 'normal' 시 표시) */}
              {result !== 'normal' && (
                <div>
                  <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
                  <div className="flex flex-wrap gap-1.5">
                    {['기판 조작 불량','모터 기능 이상','직접 입력'].map(s => {
                      const active = damperSymptomPick === s
                      return (
                        <button key={s} onClick={() => setDamperSymptomPick(s)}
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
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-caption font-semibold text-text-tertiary tracking-wider">
                    {result !== 'normal' && damperSymptomPick === '직접 입력' ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}
                  </label>
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
          )
        })()}

        {/* 전실제연댐퍼 — 선택 안내 */}
        {item === '전실제연댐퍼' && jdMode === 'select' && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">계단전실을 선택해 주세요</div>
        )}

        {/* 연결송수관 — 개별 폼 */}
        {item === '연결송수관' && !subItem && (
          <div className="flex-1 flex items-center justify-center text-text-tertiary text-label">위치를 선택해 주세요</div>
        )}
        {item === '연결송수관' && subItem && (
          <>
            {yscpId && records[yscpId] && !justSaved && (
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
            {/* 연결송수관은 증상 피커 없음 — 전실제연댐퍼와 별개 소화설비 (탭으로만 묶임) */}
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
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0">
        <button onClick={onClose}
          className="px-[18px] py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-label font-semibold cursor-pointer">
          닫기
        </button>
        <button
          onClick={jdMode === 'stair' ? handleStairSave : handleSingleSave}
          disabled={submitting || photo.uploading || !canSave}
          className={`flex-1 py-[13px] rounded-md border-none text-white text-body-sm font-bold cursor-pointer transition-colors disabled:text-text-tertiary disabled:cursor-default ${
            submitting||photo.uploading||!canSave
              ? 'bg-border-strong'
              : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]'
          }`}
        >
          {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : jdMode === 'stair' ? `계단전실 ${selectedStair} 점검 저장` : '점검 기록 저장'}
        </button>
      </div>
    </div>
  )
}

// ── Inspection Modal (전체화면) ────────────────────────
function InspectionModal({ group, allCheckpoints, records, monthRecords, recordCounts, markerRecords, scheduleItems, onClose, onSave, initialCpId }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  recordCounts?:  Record<string, number>
  markerRecords?: Record<string, CheckResult>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string, extra?: { guide_light_type?: string; floor_plan_marker_id?: string }) => Promise<void>
  initialCpId?:   string
}) {
  const navigate = useNavigate()
  const isGuideLight = group.categories.includes('유도등')
  const [glMarkers, setGlMarkers] = useState<FloorPlanMarker[]>([])
  const photo   = usePhotoUpload()
  const bcPhoto = usePhotoUpload()
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
  const [bcResult,      setBcResult]      = useState<CheckResult>('normal')
  const [bcMemo,        setBcMemo]        = useState('')
  const [symptomPick,   setSymptomPick]   = useState<string>('점등 이상')
  const [symptomCustom, setSymptomCustom] = useState('')
  const [extSymptomPick, setExtSymptomPick] = useState<string>('받침 파손')
  const [hydrantSymptomPick, setHydrantSymptomPick] = useState<string>('경종 파손')
  const [shutterSymptomPick, setShutterSymptomPick] = useState<string>('방화셔터 라인 표시 필요')

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
      setBcResult('normal')
      setBcMemo('')
      bcPhoto.reset()
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
      } else if (selectedCP?.category === '소화전' && result !== 'normal') {
        finalMemo = hydrantSymptomPick === '직접 입력' ? memo.trim() : hydrantSymptomPick
      } else if (selectedCP?.category === '방화셔터' && result !== 'normal') {
        finalMemo = shutterSymptomPick === '직접 입력' ? memo.trim() : shutterSymptomPick
      }
      await onSave(cpIdToSave, result, finalMemo, photoKey ?? undefined, extra)
      if (pairedBC) {
        const bcPhotoKey = await bcPhoto.upload()
        await onSave(pairedBC.id, bcResult, bcMemo, bcPhotoKey ?? undefined)
      }
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
      <div className="shrink-0 bg-surface-page border-b border-border-default px-4 py-2.5 flex items-center gap-2.5">
        {HeaderIcon && <HeaderIcon size={22} className="text-text-secondary shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold text-text-primary truncate">
            {group.labels[0]}
            {group.labels.length > 1 && (
              <span className="text-caption text-text-tertiary font-normal ml-1.5">· {group.labels.slice(1).join(' · ')}</span>
            )}
          </div>
        </div>
        {isExtinguisher && (
          <button onClick={() => navigate('/extinguishers')}
                  className="h-input px-3 rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-active transition-colors">
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
              className="bg-surface-raised rounded-md px-3 py-2.5 border border-border-default flex items-center gap-2.5 touch-pan-y"
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
      <div className="flex-1 overflow-y-auto px-3.5 pt-2.5 pb-2 flex flex-col gap-2">
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

        {/* 결과 선택 ~ 특이사항 영역 (이미 점검한 개소 오버레이 포함) */}
        {selectedCP && (
          <div className="relative">
            {/* 접근불가 개소 안내 팝업 (최우선) — 재진입 팝업보다 앞에 렌더 */}
            {showAccessBlockedPopup ? (
              <AccessBlockedPopup
                onConfirm={() => advanceToNextPending(selectedCP.id, true)}
              />
            ) : popupState && (
              /* 재진입 팝업 (공통 컴포넌트) */
              <InspectionRevisitPopup
                variant={popupState.variant}
                checkedAt={popupState.checkedAt}
                inspectorName={popupState.inspectorName}
                recordId={popupState.recordId}
                onClose={dismiss}
                onGoToRemediation={(recordId) => { dismiss(); navigate('/remediation/' + recordId) }}
              />
            )}

            {/* 결과 선택 — 1행 3열 (정상/주의/불량, 기본값 정상) */}
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

            {/* 소화전: 증상 피커 */}
            {selectedCP?.category === '소화전' && result !== 'normal' && (
              <div className="mt-2.5">
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
                <div className="flex flex-wrap gap-1.5">
                  {['경종 파손','위치표시등 점등 이상','호스걸이 파손','직접 입력'].map(s => {
                    const active = hydrantSymptomPick === s
                    return (
                      <button key={s} onClick={() => setHydrantSymptomPick(s)}
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

            {/* 방화셔터: 증상 피커 */}
            {selectedCP?.category === '방화셔터' && result !== 'normal' && (
              <div className="mt-2.5">
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
                <div className="flex flex-wrap gap-1.5">
                  {['방화셔터 라인 표시 필요','연동제어기 기판 작동 불','직접 입력'].map(s => {
                    const active = shutterSymptomPick === s
                    return (
                      <button key={s} onClick={() => setShutterSymptomPick(s)}
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

            {/* 특이사항 + 증빙사진 (한 행) */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">
                  {(isGuideLight && result !== 'normal' && (selectedCP as any).locationNo !== 'audience_passage' && symptomPick === '직접 입력')
                    || (isExtinguisher && result !== 'normal' && extSymptomPick === '직접 입력')
                    || (selectedCP?.category === '소화전' && result !== 'normal' && hydrantSymptomPick === '직접 입력')
                    || (selectedCP?.category === '방화셔터' && result !== 'normal' && shutterSymptomPick === '직접 입력')
                    ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}
                </label>
                <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption resize-none outline-none box-border focus:border-border-focus transition-colors" />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>
          </div>
        )}

        {/* 비상콘센트 (소화전과 location_no가 같은 경우 함께 표시) */}
        {pairedBC && (
          <>
            <div className="h-px bg-border-default my-0.5" />
            <div className="bg-surface-raised rounded-md px-3 py-2 border border-border-default">
              <div className="text-caption text-text-tertiary">{pairedBC.category}</div>
              <div className="text-label font-bold text-text-primary mt-0.5">{pairedBC.location}</div>
              {pairedBC.description && <div className="text-caption text-text-tertiary mt-0.5">{pairedBC.description}</div>}
            </div>
            <div>
              <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">비상콘센트 점검 결과</div>
              <div className="flex gap-1.5">
                {INSPECT_RESULT_OPTIONS.map(opt => {
                  const RIcon = RESULT_ICONS[opt.value]
                  const isSel = bcResult === opt.value
                  const activeCls = opt.value === 'normal'  ? 'border-2 border-safe-bar bg-safe-bg text-safe'
                                  : opt.value === 'caution' ? 'border-2 border-warning-bar bg-warning-bg text-warning'
                                  :                            'border-2 border-danger-bar bg-danger-bg text-danger'
                  return (
                    <button key={opt.value} onClick={() => setBcResult(opt.value)}
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
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>
                <span className="text-caption text-text-tertiary">점검 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <textarea value={bcMemo} onChange={e => setBcMemo(e.target.value)} placeholder="특이사항을 입력하세요"
                  className="flex-1 h-[72px] px-2.5 py-2 rounded-md bg-surface-raised border border-border-strong text-text-primary text-caption resize-none outline-none box-border focus:border-border-focus transition-colors" />
                <PhotoButton hook={bcPhoto} label="촬영" noCapture />
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
          <div className="bg-safe-bg/40 border border-safe-bar/30 rounded-sm px-3 py-2 text-caption text-safe flex items-center gap-1.5"><Check size={12} />저장 완료</div>
        )}
      </div>

      {/* ── 저장 버튼 ── */}
      <div className="px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default shrink-0 flex gap-2">
        <button onClick={onClose}
                className="px-4 py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-caption font-semibold cursor-pointer hover:bg-surface-sunken transition-colors">
          닫기
        </button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || bcPhoto.uploading || !selectedCP || isAccessBlocked}
          className={`flex-1 py-3 rounded-md border-0 text-label font-bold transition-shadow ${
            submitting || photo.uploading || bcPhoto.uploading || !selectedCP || isAccessBlocked
              ? 'bg-border-default text-text-tertiary cursor-default'
              : 'bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] text-text-on-accent cursor-pointer hover:shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
          }`}
        >
          {(photo.uploading || bcPhoto.uploading) ? '사진 업로드 중...' : submitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : '점검 기록 저장'}
        </button>
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
              className="absolute top-[calc(var(--sat,0px)+14px)] right-4 w-9 h-9 rounded-full bg-white/20 border-0 text-white text-body cursor-pointer flex items-center justify-center hover:bg-white/30 transition-colors"><X size={14} /></button>
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
  const photo         = usePhotoUpload()

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const handleResolve = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const photoKey = await photo.upload()
      await onResolve(item.recordId, memo, photoKey ?? undefined)
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
            {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : <><Check size={14} className="inline-block align-text-bottom mr-1" />조치 완료</>}
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
        const entry: MonthRecordEntry = {
          result:    rawResult,
          checkedAt: (r as any).checkedAt,
          staffName: (r as any).staffName ?? undefined,
          recordId:  (r as any).id,
          status:    ((r as any).status ?? 'open') as 'open' | 'resolved',
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
    const n = new Date()
    const today = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
    try {
      const sessions = await inspectionApi.getSessions(today)
      const mine = sessions.find((s: any) => s.staff_id === staff?.id || s.staffId === staff?.id)
      if (mine) { setSessionId(mine.id); return mine.id }
    } catch { /* create new */ }
    const sess = await inspectionApi.createSession({ date: today, floor: null })
    setSessionId(sess.id)
    return sess.id
  }

  const handleSave = async (cpId: string, result: CheckResult, memo: string, photoKey?: string, extra?: { guide_light_type?: string; floor_plan_marker_id?: string }) => {
    const sid = await ensureSession()
    await inspectionApi.submitRecord(sid, { checkpointId: cpId, result, memo: memo.trim() || undefined, photoKey, ...(extra ?? {}) })
    // 로컬 즉시 반영 + DB와 동기화
    const nowIso = new Date().toISOString()
    const localEntry: MonthRecordEntry = {
      result, checkedAt: nowIso,
      staffName: staff?.name ?? undefined,
      // recordId 는 loadTodayRecords() 가 서버 응답으로 채워줌
      status: 'open',
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
                const isGL    = g.categories.includes('유도등')
                const cps     = allCheckpoints.filter(cp => g.categories.includes(cp.category))
                const total   = isGL ? glMarkerCount : cps.length
                // 카드 완료 판정은 대시보드와 동일 기준 (DISTINCT checkpoint_id + 자동완료).
                // 유도등은 당월 inspect 일정 중 status='done' 이 하나라도 있으면 100%
                // 바이패스(scheduleItems 는 useQuery 로 당월치만 로드됨), 아니면
                // markerRecords 기반 카운트.
                let doneCnt: number
                if (isGL) {
                  const glSchedDone = scheduleItems.some(s =>
                    s.category === 'inspect' &&
                    s.inspectionCategory === '유도등' &&
                    s.status === 'done'
                  )
                  doneCnt = glSchedDone ? total : Object.keys(markerRecords).length
                } else {
                  // 260427-1dc: DIV/컴프레셔만 월 반반 분할 (1~15 / 16~말, computeCardCompletion 안에서)
                  doneCnt = computeCardCompletion({ cps, monthRecordDates, today: _todayForCycle })
                }
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
                        {g.categories.includes('화재수신반') ? '기록' : total === 0 ? '없음' : allDone ? <><Check size={12} className="inline-block align-text-bottom mr-0.5" />완료</> : doneCnt > 0 ? `${doneCnt}/${total}` : `${total}개`}
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
          <DivModal
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

// ── 화재수신반 기록 (전체 화면) ─────────────────────────────────
function FireAlarmModal({ onClose }: { onClose: () => void }) {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const [type, setType] = useState<'fire'|'non_fire'>('non_fire')
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState(timeStr)
  const [location, setLocation] = useState('')
  const [cause, setCause] = useState('오작동')
  const [action, setAction] = useState('자동복구, 현장확인')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fireAlarmApi.create({ type, occurred_at: `${date} ${time}:00`, location, cause, action })
      toast.success('화재수신반 기록이 저장되었습니다')
      onClose()
    } catch { toast.error('저장 실패') }
    finally { setSaving(false) }
  }

  const labelCls = 'text-caption font-semibold text-text-tertiary mb-1.5 block'
  const inputCls = 'w-full box-border px-3 py-2.5 rounded-sm border border-border-default bg-surface-raised text-text-primary text-label outline-none min-w-0 [appearance:none] [-webkit-appearance:none] focus:border-border-focus transition-colors'

  return (
    <div className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col overflow-hidden top-[var(--sat,0px)] bottom-[calc(54px+env(safe-area-inset-bottom,20px))]">
      {/* 헤더 */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0">
        <Bell size={18} className="text-text-secondary flex-shrink-0" />
        <span className="text-body font-bold text-text-primary">화재수신반 기록</span>
      </div>

      {/* 스크롤 본문 */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5">
        <div className="flex flex-col gap-3.5">
          {/* 구분 */}
          <div>
            <label className={labelCls}>구분</label>
            <div className="flex gap-2">
              {([['fire','화재보'],['non_fire','비화재보']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setType(v)}
                  className={`flex-1 px-0 py-2.5 rounded-sm text-label font-bold cursor-pointer transition-colors ${
                    type===v
                      ? 'border-2 border-danger-bar bg-danger-bg text-danger'
                      : 'border border-border-default bg-surface-sunken text-text-secondary hover:bg-surface-active'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 발생일시 */}
          <div>
            <label className={labelCls}>발생일시</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className={`${inputCls} block mb-1.5 h-input`} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className={`${inputCls} block h-input`} />
          </div>

          {/* 발생장소 */}
          <div>
            <label className={labelCls}>발생장소</label>
            <textarea value={location} onChange={e => setLocation(e.target.value)}
              placeholder="발생장소를 입력하세요" rows={2}
              className={`${inputCls} resize-none leading-relaxed`} />
          </div>

          {/* 발생원인 */}
          <div>
            <label className={labelCls}>발생원인</label>
            <textarea value={cause} onChange={e => setCause(e.target.value)}
              rows={2} className={`${inputCls} resize-none leading-relaxed`} />
          </div>

          {/* 조치사항 */}
          <div>
            <label className={labelCls}>조치사항</label>
            <textarea value={action} onChange={e => setAction(e.target.value)}
              rows={2} className={`${inputCls} resize-none leading-relaxed`} />
          </div>
        </div>
      </div>

      {/* 하단 버튼 바 */}
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
          {saving ? '저장 중...' : '점검 기록 저장'}
        </button>
      </div>
    </div>
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
}: {
  categoryIdx: number | null
  setCategoryIdx: (idx: number | null) => void
  recordId: string | null
  setRecordId: (id: string | null) => void
  dateFilter: number
  setDateFilter: (d: number) => void
}) {
  const navigate = useNavigate()

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
    return CATEGORY_GROUPS.map(g => {
      const matches = allRecords.filter(r => g.categories.includes(r.category))
      // 점검 완료 개소 = 고유 checkpoint 개수 (location+floor+category 조합)
      const uniqueSites = new Set(matches.map(r => `${r.zone}|${r.floor}|${r.location}|${r.category}`))
      return {
        total:    matches.length,
        completed: uniqueSites.size,
        bad:      matches.filter(r => r.result === 'bad').length,
        caution:  matches.filter(r => r.result === 'caution').length,
        open:     matches.filter(r => r.status === 'open').length,
      }
    })
  }, [allRecords])

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
                        <Check size={12} className="inline-block align-text-bottom mr-1" />점검완료 {c.completed}
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
        {recordId && detail ? (
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
                {excludeNormal ? <><Check size={12} className="inline-block align-text-bottom mr-0.5" />정상 제외</> : '정상 제외'}
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
    </div>
  )
}
