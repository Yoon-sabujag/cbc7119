import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { inspectionApi, fireAlarmApi, extinguisherApi, remediationApi, scheduleApi, floorPlanMarkerApi, type ExtinguisherDetail, type ExtinguisherListResponse, type FloorPlanMarker } from '../utils/api'
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
const CATEGORY_GROUPS: { labels:string[]; icon:string; color:string; border:string; categories:string[] }[] = [
  { labels:['특별피난계단','피난·방화시설','방화문'], icon:'🚪', color:'rgba(34,197,94,.12)',  border:'rgba(34,197,94,.3)',  categories:['특별피난계단'] },
  { labels:['청정소화약제'],                         icon:'☁️', color:'rgba(14,165,233,.12)', border:'rgba(14,165,233,.3)', categories:['청정소화약제'] },
  { labels:['전실제연댐퍼','연결송수관'],              icon:'🛡️', color:'rgba(100,116,139,.12)',border:'rgba(100,116,139,.3)',categories:['전실제연댐퍼','연결송수관'] },
  { labels:['주차장비','회전문'],                     icon:'🚗', color:'rgba(168,85,247,.12)', border:'rgba(168,85,247,.3)', categories:['주차장비','회전문'] },
  { labels:['소방용전원공급반'],                       icon:'⚡', color:'rgba(245,158,11,.12)', border:'rgba(245,158,11,.3)', categories:['소방용전원공급반'] },
  { labels:['방화셔터'],                              icon:'⬜️', color:'rgba(239,68,68,.12)',  border:'rgba(239,68,68,.3)',  categories:['방화셔터'] },
  { labels:['DIV'],                                  icon:'📊', color:'rgba(245,158,11,.12)', border:'rgba(245,158,11,.3)', categories:['DIV'] },
  { labels:['컴프레셔'],                              icon:'💨', color:'rgba(100,116,139,.12)',border:'rgba(100,116,139,.3)',categories:['컴프레셔'] },
  { labels:['유도등'],                               icon:'⬅️', color:'rgba(234,179,8,.12)',  border:'rgba(234,179,8,.3)',  categories:['유도등'] },
  { labels:['배연창'],                               icon:'🪟', color:'rgba(59,130,246,.12)', border:'rgba(59,130,246,.3)', categories:['배연창'] },
  { labels:['완강기'],                               icon:'🪢', color:'rgba(249,115,22,.12)', border:'rgba(249,115,22,.3)', categories:['완강기'] },
  { labels:['소화전','비상콘센트'],                    icon:'🚰', color:'rgba(59,130,246,.12)', border:'rgba(59,130,246,.3)', categories:['소화전','비상콘센트'] },
  { labels:['소화기'],                               icon:'🧯', color:'rgba(239,68,68,.12)',  border:'rgba(239,68,68,.3)',  categories:['소화기'] },
  { labels:['소방펌프'],                              icon:'🌊', color:'rgba(14,165,233,.12)', border:'rgba(14,165,233,.3)', categories:['소방펌프'] },
  { labels:['화재수신반'],                            icon:'🔔', color:'rgba(239,68,68,.12)', border:'rgba(239,68,68,.3)',  categories:['화재수신반'] },
  { labels:['CCTV'],                               icon:'📹', color:'rgba(71,85,105,.12)',  border:'rgba(71,85,105,.3)',  categories:['CCTV'] },
]

// 점검 결과 입력용 (정상/주의/불량만 — 미조치는 별도 조치 스텝에서 처리)
const INSPECT_RESULT_OPTIONS: { value:CheckResult; label:string; color:string; bg:string; icon:string }[] = [
  { value:'normal',  label:'정상', color:'var(--safe)',   bg:'rgba(34,197,94,.13)',  icon:'✅' },
  { value:'caution', label:'주의', color:'var(--warn)',   bg:'rgba(245,158,11,.13)', icon:'⚠️' },
  { value:'bad',     label:'불량', color:'var(--danger)', bg:'rgba(239,68,68,.13)',  icon:'❌' },
]
// 오늘 현황 표시용 (모든 결과값 대응)
const ALL_RESULT_OPTIONS: { value:CheckResult; label:string; color:string; bg:string; icon:string }[] = [
  ...INSPECT_RESULT_OPTIONS,
  { value:'unresolved', label:'미조치', color:'var(--fire)',  bg:'rgba(249,115,22,.13)',  icon:'🔧' },
  { value:'missing',    label:'미확인', color:'var(--t3)',    bg:'rgba(110,118,129,.13)', icon:'❓' },
]
const RESULT_LABEL: Record<CheckResult,string> = { normal:'정상',caution:'주의',bad:'불량',unresolved:'미조치',missing:'미확인' }
const RESULT_COLOR: Record<CheckResult,string> = { normal:'var(--safe)',caution:'var(--warn)',bad:'var(--danger)',unresolved:'var(--fire)',missing:'var(--t3)' }

// ── 구역 (Zone) 유틸 ──────────────────────────────────
type ZoneKey = 'research' | 'office' | 'underground'

const ZONE_CONFIG: { key:ZoneKey; label:string; icon:string }[] = [
  { key:'research',   label:'연구동', icon:'🔬' },
  { key:'office',     label:'사무동', icon:'🏢' },
  { key:'underground', label:'지하',  icon:'🚇' },
]

/** 해당 CP가 zone+구역 기준에 부합하는지 */
function matchZone(cp: CheckPoint, zone: ZoneKey): boolean {
  if (zone === 'underground') return UNDER_SET.has(cp.floor)
  if (zone === 'office')      return cp.zone === 'office' && GROUND_SET.has(cp.floor)
  // research: research zone + common zone on ground floors
  return (cp.zone === 'research' || (cp.zone === 'common' && GROUND_SET.has(cp.floor)))
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
    <div style={{ position:'relative', height:containerH, borderRadius:12, overflow:'hidden', background:'var(--bg2)', border:'1px solid var(--bd)' }}>
      {/* 중앙 하이라이트 */}
      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:ITEM_H, transform:'translateY(-50%)', background:'rgba(14,165,233,.08)', borderTop:'1px solid rgba(14,165,233,.22)', borderBottom:'1px solid rgba(14,165,233,.22)', pointerEvents:'none', zIndex:2 }} />
      {/* 상단 페이드 */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:pad, background:'linear-gradient(to bottom, var(--bg2) 30%, transparent)', pointerEvents:'none', zIndex:3 }} />
      {/* 하단 페이드 */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:pad, background:'linear-gradient(to top, var(--bg2) 30%, transparent)', pointerEvents:'none', zIndex:3 }} />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height:'100%', overflowY:'auto', scrollSnapType:'y mandatory', paddingTop:pad, paddingBottom:pad, boxSizing:'border-box', scrollbarWidth:'none' }}
      >
        {items.map((item, idx) => {
          const dist = Math.abs(idx - activeIdx)
          const done = records[item.id]
          return (
            <div key={item.id} style={{ height:ITEM_H, display:'flex', alignItems:'center', padding:'0 14px', scrollSnapAlign:'center', cursor:'pointer', opacity: dist===0 ? 1 : dist===1 ? 0.48 : 0.15, transition:'opacity .1s' }}>
              <div style={{ flex:1, fontSize:dist===0 ? 13 : 11, fontWeight:dist===0 ? 700 : 400, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.location}
              </div>
              {done && <span style={{ fontSize:10, fontWeight:700, color:RESULT_COLOR[done], flexShrink:0, marginLeft:8 }}>{RESULT_LABEL[done]}</span>}
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
      for (const cp of swCPs) {
        await onSave(cp.id, floorResults[cp.id] ?? 'normal', memo, photoKey ?? undefined)
      }
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  const btnStyle = (sel: boolean) => ({
    flex:1, padding:'7px 0', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' as const,
    border:      sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background:  sel ? 'var(--acl)' : 'var(--bg)',
    color:       sel ? '#fff' : 'var(--t2)',
    transition: 'all .12s',
  })

  const resultBtnStyle = (active: boolean, opt: typeof INSPECT_RESULT_OPTIONS[0]) => ({
    flex:1, padding:'4px 2px', borderRadius:7, fontSize:10, fontWeight:700, cursor:'pointer' as const,
    border:      active ? `1.5px solid ${opt.color}` : '1px solid var(--bd)',
    background:  active ? opt.bg : 'var(--bg2)',
    color:       active ? opt.color : 'var(--t3)',
    transition: 'all .1s',
  })

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}>

      {/* 헤더 */}
      <div style={{ padding:'10px 16px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{group.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{group.labels[0]}</div>
          {group.labels.length > 1 && <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>{group.labels.slice(1).join(' · ')}</div>}
        </div>
      </div>

      {/* 계단실 선택 */}
      <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>계단실 선택</div>
        <div style={{ display:'flex', gap:6 }}>
          {STAIRWELLS.map(sw => {
            const swCPsAll = allCheckpoints.filter(cp => group.categories.includes(cp.category) && cp.locationNo === `S${sw.id}`)
            const done = swCPsAll.length > 0 && swCPsAll.every(cp => records[cp.id])
            return (
              <button key={sw.id} onClick={() => setSelectedSW(sw.id)} style={btnStyle(selectedSW === sw.id)}>
                {sw.id}{done && <span style={{ fontSize:9, marginLeft:3, opacity:0.8 }}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 폼 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {!selectedSW && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>계단실을 선택해 주세요</div>
        )}

        {swDef && (
          <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:10 }}>
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
              <div style={{ fontSize:11, color:'var(--safe)', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:8, padding:'6px 10px' }}>
                ✓ {swDoneCount}/{swCPs.length}층 이미 점검 완료
              </div>
            )}

            {/* 층별 결과 — 2열 */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {/* 왼쪽 열 */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {swDef.floors.slice(0, swDef.leftCount).map(floor => {
                  const cp = swCPs.find(c => c.floor === floor)
                  if (!cp) return null
                  const curResult = floorResults[cp.id] ?? 'normal'
                  return (
                    <div key={floor} style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 8px 6px', border:'1px solid var(--bd)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:5 }}>{floor}</div>
                      <div style={{ display:'flex', gap:4 }}>
                        {INSPECT_RESULT_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))} style={resultBtnStyle(curResult === opt.value, opt)}>
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* 오른쪽 열 */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {swDef.floors.slice(swDef.leftCount).map(floor => {
                  const cp = swCPs.find(c => c.floor === floor)
                  if (!cp) return null
                  const curResult = floorResults[cp.id] ?? 'normal'
                  return (
                    <div key={floor} style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 8px 6px', border:'1px solid var(--bd)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:5 }}>{floor}</div>
                      <div style={{ display:'flex', gap:4 }}>
                        {INSPECT_RESULT_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))} style={resultBtnStyle(curResult === opt.value, opt)}>
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 특이사항 + 사진 */}
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
                <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>

            {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
            {justSaved  && <div style={{ background:'rgba(34,197,94,.1)',  border:'1px solid rgba(34,197,94,.25)',  borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || !selectedSW}
          style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading||!selectedSW ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color: submitting||photo.uploading||!selectedSW ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading||!selectedSW ? 'default' : 'pointer', transition:'all .13s' }}
        >
          {photo.uploading ? '사진 업로드 중...' : submitting ? '저장 중...' : `계단실 ${selectedSW ?? ''} 점검 저장`}
        </button>
      </div>
    </div>
  )
}

// ── CCTV DVR 점검 모달 ───────────────────────────────────
const CCTV_DVRS = [
  { no: 'DVR-01', label: 'DVR 1',  desc: '8F, 7F' },
  { no: 'DVR-02', label: 'DVR 2',  desc: '6F, 5F' },
  { no: 'DVR-03', label: 'DVR 3',  desc: '5F, 2F' },
  { no: 'DVR-04', label: 'DVR 4',  desc: '3F' },
  { no: 'DVR-05', label: 'DVR 5',  desc: '3F, 2F' },
  { no: 'DVR-06', label: 'DVR 6',  desc: '1F, B1F' },
  { no: 'DVR-07', label: 'DVR 7',  desc: 'B1F, B2F' },
  { no: 'DVR-08', label: 'DVR 8',  desc: 'B2F~B4F' },
  { no: 'DVR-09', label: 'DVR 9',  desc: 'B3F (주차장)' },
  { no: 'DVR-10', label: 'DVR 10', desc: 'B4F (주차장)' },
  { no: 'DVR-11', label: 'DVR 11', desc: 'B5F (주차장)' },
  { no: 'DVR-12', label: 'DVR 12', desc: '리서치프라자, 서버실' },
]

function CctvModal({ allCheckpoints, records, onClose, onSave }: {
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload()
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

  const resultBtnStyle = (active: boolean, opt: typeof INSPECT_RESULT_OPTIONS[0]) => ({
    flex:1, padding:'4px 2px', borderRadius:7, fontSize:10, fontWeight:700, cursor:'pointer' as const,
    border:      active ? `1.5px solid ${opt.color}` : '1px solid var(--bd)',
    background:  active ? opt.bg : 'var(--bg2)',
    color:       active ? opt.color : 'var(--t3)',
    transition: 'all .1s',
  })

  const handleSave = async () => {
    if (cctvCPs.length === 0) return
    setSubmitting(true); setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      for (const cp of cctvCPs) {
        await onSave(cp.id, dvrResults[cp.id] ?? 'normal', memo, photoKey ?? undefined)
      }
      setJustSaved(true); setMemo(''); photo.reset()
    } catch (e: any) {
      setSubmitError(e.message ?? '저장 오류')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}>

      {/* 헤더 */}
      <div style={{ padding:'10px 16px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>📹</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>CCTV 점검</div>
          <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>B1F 방재센터 DVR 12대</div>
        </div>
        {allDone && !justSaved && (
          <div style={{ fontSize:11, color:'var(--safe)', background:'rgba(34,197,94,.1)', borderRadius:6, padding:'3px 8px', border:'1px solid rgba(34,197,94,.2)' }}>✓ 완료</div>
        )}
      </div>

      {/* 스크롤 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>

        {doneCnt > 0 && !justSaved && (
          <div style={{ fontSize:11, color:'var(--safe)', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:8, padding:'6px 10px' }}>
            ✓ {doneCnt}/{cctvCPs.length}대 이미 점검 완료
          </div>
        )}

        {/* 2열 그리드: 좌 DVR-01~06 / 우 DVR-07~12 */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {/* 왼쪽 열 */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {CCTV_DVRS.slice(0, 6).map(dvr => {
              const cp = cctvCPs.find(c => c.locationNo === dvr.no)
              if (!cp) return null
              const curResult = dvrResults[cp.id] ?? 'normal'
              return (
                <div key={dvr.no} style={{ background:'var(--bg2)', borderRadius:10, padding:'6px 8px 5px', border:'1px solid var(--bd)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--t2)' }}>{dvr.label}</span>
                    <span style={{ fontSize:9, color:'var(--t3)' }}>{dvr.desc}</span>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    {INSPECT_RESULT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setDvrResults(prev => ({ ...prev, [cp.id]: opt.value }))} style={resultBtnStyle(curResult === opt.value, opt)}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          {/* 오른쪽 열 */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {CCTV_DVRS.slice(6, 12).map(dvr => {
              const cp = cctvCPs.find(c => c.locationNo === dvr.no)
              if (!cp) return null
              const curResult = dvrResults[cp.id] ?? 'normal'
              return (
                <div key={dvr.no} style={{ background:'var(--bg2)', borderRadius:10, padding:'6px 8px 5px', border:'1px solid var(--bd)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--t2)' }}>{dvr.label}</span>
                    <span style={{ fontSize:9, color:'var(--t3)' }}>{dvr.desc}</span>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    {INSPECT_RESULT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setDvrResults(prev => ({ ...prev, [cp.id]: opt.value }))} style={resultBtnStyle(curResult === opt.value, opt)}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 특이사항 + 사진 */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
            <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
            <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
            <PhotoButton hook={photo} label="촬영" noCapture />
          </div>
        </div>

        {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
        {justSaved  && <div style={{ background:'rgba(34,197,94,.1)',  border:'1px solid rgba(34,197,94,.25)',  borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
      </div>

      {/* 하단 바 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading}
          style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color: submitting||photo.uploading ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading ? 'default' : 'pointer', transition:'all .13s' }}
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

  const tabStyle = (sel: boolean) => ({
    flex:1, padding:'9px 0', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer' as const,
    border:     sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background: sel ? 'var(--acl)' : 'var(--bg)',
    color:      sel ? '#fff' : 'var(--t2)',
    transition: 'all .12s',
  })

  const getPositionLabel = (cp: CheckPoint) =>
    cp.location.includes('북측') ? '북측' : cp.location.includes('동측') ? '동측' : cp.location

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}>

      {/* 헤더 */}
      <div style={{ padding:'10px 16px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{group.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{group.labels[0]}</div>
        </div>
      </div>

      {/* 구역 선택 */}
      <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>구역 선택</div>
        <div style={{ display:'flex', gap:8 }}>
          {(['research','office'] as BYZone[]).map(z => {
            const zCPs    = allCheckpoints.filter(cp => cp.category === '배연창' && cp.locationNo?.startsWith(BY_LOC_NO[z]))
            const allDone = zCPs.length > 0 && zCPs.every(cp => records[cp.id])
            return (
              <button key={z} onClick={() => setZone(z)} style={tabStyle(zone === z)}>
                {BY_ZONE_LABELS[z]}{allDone && <span style={{ fontSize:10, marginLeft:4, opacity:0.8 }}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 층 선택 */}
      {zone && (
        <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>층 선택</div>
          <div style={{ display:'flex', gap:5, overflowX:'auto', scrollbarWidth:'none' }}>
            {availableFloors.map(f => {
              const fCPs  = zoneCPs.filter(cp => cp.floor === f)
              const fDone = fCPs.every(cp => records[cp.id]) && fCPs.length > 0
              const isSel = f === selFloor
              return (
                <button key={f} onClick={() => setSelFloor(f)} style={{ flexShrink:0, padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', border: isSel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)', background: isSel ? 'var(--acl)' : 'var(--bg)', color: isSel ? '#fff' : 'var(--t2)', transition:'all .1s' }}>
                  {f}{fDone && <span style={{ fontSize:9, marginLeft:2, opacity:0.75 }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 위치 선택 (연구동에서 같은 층에 복수 CP인 경우) */}
      {zone && selFloor && floorCPs.length > 1 && (
        <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>위치 선택</div>
          <div style={{ display:'flex', gap:8 }}>
            {floorCPs.map(cp => {
              const isSel = selectedId === cp.id
              const isDone = !!records[cp.id]
              return (
                <button key={cp.id} onClick={() => setSelectedId(cp.id)} style={tabStyle(isSel)}>
                  {getPositionLabel(cp)}{isDone && <span style={{ fontSize:10, marginLeft:4, opacity:0.8 }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 폼 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:12 }}>
        {!zone && <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>구역을 선택해 주세요</div>}
        {zone && !selFloor && <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>층을 선택해 주세요</div>}
        {zone && selFloor && floorCPs.length > 1 && !selectedId && <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>위치를 선택해 주세요</div>}

        {selectedCP && (
          <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:12 }}>
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
              <div style={{ background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', borderRadius:8, padding:'9px 12px', fontSize:12, color:'var(--safe)' }}>✓ 이미 점검 완료된 항목입니다</div>
            )}
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>점검 결과</div>
              <div style={{ display:'flex', gap:6 }}>
                {INSPECT_RESULT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setResult(opt.value)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', border: result===opt.value ? `2px solid ${opt.color}` : '1px solid var(--bd)', background: result===opt.value ? opt.bg : 'var(--bg2)', transition:'all .13s' }}>
                    <span style={{ fontSize:20 }}>{opt.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: result===opt.value ? opt.color : 'var(--t3)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
                <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>
            {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
            {justSaved  && <div style={{ background:'rgba(34,197,94,.1)',  border:'1px solid rgba(34,197,94,.25)',  borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || !selectedCP}
          style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading||!selectedCP ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color: submitting||photo.uploading||!selectedCP ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading||!selectedCP ? 'default' : 'pointer', transition:'all .13s' }}
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
    <div style={{ position:'relative', height:containerH, borderRadius:12, overflow:'hidden', background:'var(--bg2)', border:'1px solid var(--bd)' }}>
      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:ITEM_H, transform:'translateY(-50%)', background:'rgba(14,165,233,.08)', borderTop:'1px solid rgba(14,165,233,.22)', borderBottom:'1px solid rgba(14,165,233,.22)', pointerEvents:'none', zIndex:2 }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:pad, background:'linear-gradient(to bottom, var(--bg2) 30%, transparent)', pointerEvents:'none', zIndex:3 }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:pad, background:'linear-gradient(to top, var(--bg2) 30%, transparent)', pointerEvents:'none', zIndex:3 }} />
      <div ref={scrollRef} onScroll={handleScroll}
        style={{ height:'100%', overflowY:'auto', scrollSnapType:'y mandatory', paddingTop:pad, paddingBottom:pad, boxSizing:'border-box', scrollbarWidth:'none' }}>
        {items.map((item, idx) => {
          const dist = Math.abs(idx - activeIdx)
          return (
            <div key={item.id} style={{ height:ITEM_H, display:'flex', alignItems:'center', padding:'0 14px', scrollSnapAlign:'center', cursor:'pointer', opacity: dist===0 ? 1 : dist===1 ? 0.48 : 0.15, transition:'opacity .1s' }}>
              <span style={{ fontSize: dist===0 ? 13 : 11, fontWeight: dist===0 ? 700 : 400, color:'var(--t1)' }}>{item.label}</span>
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
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      {/* 헤더 */}
      <div style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--bd)', gap:10, flexShrink:0 }}>
        <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--bd)', background:'var(--bg2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✕</button>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>{point.floorLabel} — {point.loc}</div>
          <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>DIV #{point.pos} · {point.id}</div>
        </div>
      </div>
      {/* 차트 + 테이블 */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 40px' }}>
        {hist.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--t3)', padding:'40px 0', fontSize:13 }}>이전 기록 없음</div>
        ) : (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
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
                    <div style={{ fontSize:10, fontWeight:700, color, marginBottom:3 }}>{label}</div>
                    <div style={{ overflowX:'auto' }}>
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
                                fill={isLate ? color : 'var(--bg2)'}
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
            <div style={{ marginTop:14, borderRadius:10, border:'1px solid var(--bd)', overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr 1fr', background:'var(--bg3)', padding:'7px 10px' }}>
                {['월','1차압','2차압','세팅압'].map(h => (
                  <div key={h} style={{ fontSize:9, fontWeight:700, color:'var(--t3)', textAlign:'center' }}>{h}</div>
                ))}
              </div>
              {[...hist].reverse().slice(0,12).map((r: any) => (
                <div key={`${r.year}-${r.month}`} style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr 1fr', padding:'7px 10px', borderTop:'1px solid var(--bd)' }}>
                  <div style={{ fontSize:11, color:'var(--t3)', textAlign:'center', fontFamily:'JetBrains Mono, monospace' }}>{r.year}-{String(r.month).padStart(2,'0')}</div>
                  {[r.pressure_1, r.pressure_2, r.pressure_set].map((v: number, i: number) => (
                    <div key={i} style={{ fontSize:12, fontWeight:700, color:['#3b82f6','#f97316','#22c55e'][i], textAlign:'center', fontFamily:'JetBrains Mono, monospace' }}>
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
  onSaveRecord: (cpId: string, result: CheckResult, memo: string) => Promise<void>
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
        await onSaveRecord(cpId, result, memo || '').catch(() => {/* 점검 기록 실패해도 압력 저장은 유지 */})
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
    if (Math.abs(d) < 0.05) return { text:'→0.0', color:'var(--t3)' }
    const isBad = badIfUp ? d > 0 : d < 0
    return { text:`${d > 0 ? '↑' : '↓'}${Math.abs(d).toFixed(1)}`, color: isBad ? 'var(--warn)' : 'var(--safe)' }
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

  const resultColor: Partial<Record<CheckResult,string>> = { normal:'var(--safe)', caution:'var(--warn)', bad:'var(--danger)' }
  const resultLabel: Partial<Record<CheckResult,string>> = { normal:'정상', caution:'주의', bad:'불량' }

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
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, background:'var(--bg)', zIndex:99, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <span style={{ fontSize:48 }}>✅</span>
      <div style={{ fontSize:18, fontWeight:700, color:'var(--t1)' }}>점검 완료</div>
      <button onClick={onClose} style={{ marginTop:8, padding:'12px 32px', borderRadius:10, background:'var(--primary)', border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>닫기</button>
    </div>
  )

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, background:'var(--bg)', zIndex:99, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* 헤더 */}
      <div style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--bd)', gap:8, flexShrink:0 }}>
        <span style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>📊 DIV 점검</span>
        {currentPt && totalSteps && (
          <span style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:'var(--t3)' }}>{lineIdx+1} / {totalSteps}</span>
        )}
        {currentPt && zone === 'underground' && (
          <span style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:'var(--t3)' }}>{underPickIdx+1} / {underPending.length}</span>
        )}
      </div>

      {/* 본문 (재진입 팝업 부분 오버레이의 부모 — position:relative 필수) */}
      <div style={{ position:'relative', flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:14 }}>
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

        {/* 월초/월말 선택 */}
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>점검 구분</div>
          <div style={{ display:'flex', gap:8 }}>
            {([['early','월초 점검'],['late','월말 점검']] as const).map(([t, label]) => {
              const sel = timing === t
              return (
                <button key={t}
                  onClick={() => setTiming(t)}
                  style={{ flex:1, padding:'10px 0', borderRadius:10, border: sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)', fontSize:13, fontWeight:700, cursor:'pointer', background: sel ? 'var(--acl)' : 'var(--bg)', color: sel ? '#fff' : 'var(--t2)', transition:'all .12s' }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 구역 선택 */}
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>구역 선택</div>
          <div style={{ display:'flex', gap:8 }}>
            {(['research','office','underground'] as DivZone[]).map(z => {
              const sel = zone === z
              return (
                <button key={z}
                  onClick={() => { setZone(z); setLine(null); setLineIdx(0); setUnderPending([...DIV_UNDER_SEQ]); setUnderPickIdx(0); resetForm() }}
                  style={{ flex:1, padding:'10px 0', borderRadius:10, border: sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)', fontSize:13, fontWeight:700, cursor:'pointer', background: sel ? 'var(--acl)' : 'var(--bg)', color: sel ? '#fff' : 'var(--t2)', transition:'all .12s' }}>
                  {z==='research' ? '연구동' : z==='office' ? '사무동' : '지하'}
                </button>
              )
            })}
          </div>
        </div>

        {/* 라인 선택 (연구동/사무동) */}
        {zone && zone !== 'underground' && (
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>라인 선택</div>
            <div style={{ display:'flex', gap:8 }}>
              {(zone === 'research' ? [1,2] : [3]).map(l => {
                const sel = line === l
                return (
                  <button key={l}
                    onClick={() => { setLine(l); setLineIdx(0); resetForm() }}
                    style={{ flex:1, padding:'10px 0', borderRadius:10, border: sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)', fontSize:13, fontWeight:700, cursor:'pointer', background: sel ? 'var(--acl)' : 'var(--bg)', color: sel ? '#fff' : 'var(--t2)', transition:'all .12s' }}>
                    DIV #{l}
                  </button>
                )
              })}
            </div>
          </div>
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
              const btnStyle = (enabled: boolean): React.CSSProperties => ({
                width:36, height:36, borderRadius:8, border:'1px solid var(--bd)', background:'var(--bg)',
                color: enabled ? 'var(--t1)' : 'var(--t3)', fontSize:20, fontWeight:700, cursor: enabled ? 'pointer' : 'default',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity: enabled ? 1 : 0.3,
              })
              return (
                <div
                  style={{ background:'var(--bg2)', borderRadius:12, padding:'10px 12px', border:'1px solid var(--bd)', display:'flex', alignItems:'center', gap:10, touchAction:'pan-y' }}
                  onTouchStart={e => { (e.currentTarget as any)._swX = e.touches[0].clientX }}
                  onTouchEnd={e => {
                    const sx = (e.currentTarget as any)._swX
                    if (sx == null) return
                    const dx = e.changedTouches[0].clientX - sx
                    if (dx > 40 && canPrev) goPrev()
                    else if (dx < -40 && canNext) goNext()
                  }}
                >
                  <button style={btnStyle(canPrev)} onClick={canPrev ? goPrev : undefined}>‹</button>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>현재 개소</div>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginTop:2 }}>{currentPt.floorLabel} — DIV #{currentPt.pos}</div>
                    <div style={{ fontSize:11, color:'var(--t2)', marginTop:2 }}>{currentPt.loc}</div>
                  </div>
                  <button style={btnStyle(canNext)} onClick={canNext ? goNext : undefined}>›</button>
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
                <div style={{ background:'var(--bg2)', borderRadius:12, padding:14, border:'1px solid var(--bd)' }}>
                  {/* 섹션 헤더 */}
                  <div style={{ display:'flex', alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--t3)', flex:1 }}>압력 입력</span>
                    {currentPt && (
                      <button onClick={() => setShowTrend(true)}
                        style={{ padding:'4px 10px', borderRadius:7, border:'1px solid var(--bd)', background:'var(--bg)', color:'var(--t3)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                        📈 트렌드
                      </button>
                    )}
                  </div>
                  {/* 컬럼 헤더: [라벨42] [직전 flex:1] [변화 flex:1] [현재 flex:1] */}
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:4 }}>
                    <div style={{ width:42, flexShrink:0 }} />
                    <div style={{ flex:1, textAlign:'center', fontSize:10, fontWeight:600, color:'var(--t3)' }}>{prevMonthLabel ?? '직전'}</div>
                    <div style={{ flex:1 }} />
                    <div style={{ flex:1, textAlign:'center', fontSize:10, fontWeight:600, color:'var(--t3)' }}>현재</div>
                  </div>
                  {/* 압력 행: [라벨42] [직전 flex:1] [변화 flex:1] [입력 flex:1] — 균등 배분 */}
                  {rows.map(({ label, dIdx, slots, prevVal, diff, color }) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:4, marginBottom:10 }}>
                      {/* 라벨 */}
                      <div style={{ width:42, flexShrink:0, fontSize:11, fontWeight:600, color:'var(--t3)' }}>{label}</div>
                      {/* 직전값 — flex:1, 소수점 중앙 고정 (빨간선) */}
                      <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'baseline' }}>
                        {prevVal !== null ? (
                          <>
                            <span style={{ display:'inline-block', width:16, fontFamily:'JetBrains Mono,monospace', fontSize:20, fontWeight:700, color:'var(--t3)', textAlign:'right' }}>{String(Number(prevVal).toFixed(1)).split('.')[0]}</span>
                            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:20, fontWeight:700, color:'var(--t3)' }}>.</span>
                            <span style={{ display:'inline-block', width:14, fontFamily:'JetBrains Mono,monospace', fontSize:20, fontWeight:700, color:'var(--t3)', textAlign:'left' }}>{String(Number(prevVal).toFixed(1)).split('.')[1]}</span>
                          </>
                        ) : <span style={{ fontSize:20, fontWeight:700, color:'var(--t3)' }}>—</span>}
                      </div>
                      {/* 변화량 — flex:1, 소수점 중앙 고정 (노란선) */}
                      <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'baseline' }}>
                        {diff ? (
                          <>
                            <span style={{ display:'inline-block', width:20, fontFamily:'JetBrains Mono,monospace', fontSize:12, fontWeight:800, color:diff.color, textAlign:'right' }}>{diff.text.split('.')[0]}</span>
                            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, fontWeight:800, color:diff.color }}>.</span>
                            <span style={{ display:'inline-block', width:9, fontFamily:'JetBrains Mono,monospace', fontSize:12, fontWeight:800, color:diff.color, textAlign:'left' }}>{diff.text.split('.')[1] ?? '0'}</span>
                          </>
                        ) : <span style={{ fontSize:12, color:'var(--t3)' }}>—</span>}
                      </div>
                      {/* 입력 박스 — 정수 칸(slots-1개) + . + 소수 1칸 */}
                      <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', gap:2 }}>
                        {Array.from({ length: slots - 1 }, (_, i) => (
                          <input key={i} ref={dRefs[dIdx + i]} type="text" inputMode="decimal" pattern="[0-9]*" value={digits[dIdx + i]} maxLength={1}
                            onChange={e => handleDigit(dIdx + i, e.target.value)}
                            onKeyDown={e => handleDigitKey(dIdx + i, e)}
                            style={{ width:34, height:42, textAlign:'center', fontSize:20, fontWeight:700, borderRadius:8, border:`2px solid ${digits[dIdx + i] ? color : 'var(--bd)'}`, background:'var(--bg)', color, outline:'none', flexShrink:0 }} />
                        ))}
                        <span style={{ fontSize:18, fontWeight:700, color, flexShrink:0 }}>.</span>
                        <input ref={dRefs[dIdx + slots - 1]} type="text" inputMode="decimal" pattern="[0-9]*" value={digits[dIdx + slots - 1]} maxLength={1}
                          onChange={e => handleDigit(dIdx + slots - 1, e.target.value)}
                          onKeyDown={e => handleDigitKey(dIdx + slots - 1, e)}
                          style={{ width:34, height:42, textAlign:'center', fontSize:20, fontWeight:700, borderRadius:8, border:`2px solid ${digits[dIdx + slots - 1] ? color : 'var(--bd)'}`, background:'var(--bg)', color, outline:'none', flexShrink:0 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* 배수 / 컴프 점검 */}
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>배수</div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setDrain('none')}
                    style={{ flex:1, padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background: drain==='none' ? 'var(--bg)' : 'transparent', color: drain==='none' ? 'var(--t1)' : 'var(--t3)', boxShadow: drain==='none' ? '0 0 0 2px var(--primary)' : '0 0 0 1px var(--bd)', opacity: drain==='none' ? 1 : 0.45 }}>없음</button>
                  <button onClick={() => setDrain('yes')}
                    style={{ flex:1, padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background: drain==='yes' ? 'rgba(59,130,246,.18)' : 'transparent', color: drain==='yes' ? '#3b82f6' : 'var(--t3)', boxShadow: drain==='yes' ? '0 0 0 2px #3b82f6' : '0 0 0 1px var(--bd)', opacity: drain==='yes' ? 1 : 0.45 }}>있음</button>
                </div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>컴프 점검</div>
                <button onClick={() => setShowCompressor(true)}
                  style={{ width:'100%', padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background:'rgba(100,116,139,.12)', color:'var(--t1)', boxShadow:'0 0 0 1px rgba(100,116,139,.3)' }}>
                  💨 컴프레셔 점검 →
                </button>
              </div>
            </div>

            {/* 점검 결과 */}
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>점검 결과</div>
              <div style={{ display:'flex', gap:8 }}>
                {(['normal','caution','bad'] as const).map(r => (
                  <button key={r} onClick={() => setResult(r)}
                    style={{ flex:1, padding:'10px 0', borderRadius:10, border:`2px solid ${result===r ? resultColor[r]! : 'var(--bd)'}`, background: result===r ? resultColor[r]! : 'var(--bg2)', color: result===r ? '#fff' : 'var(--t2)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    {resultLabel[r]}
                  </button>
                ))}
              </div>
              {autoReason && (
                <div style={{ marginTop:8, padding:'8px 12px', borderRadius:8, background: result==='bad' ? 'rgba(239,68,68,.1)' : 'rgba(245,158,11,.1)', border:`1px solid ${result==='bad' ? 'rgba(239,68,68,.3)' : 'rgba(245,158,11,.3)'}`, fontSize:12, fontWeight:600, color: result==='bad' ? 'var(--danger)' : 'var(--warn)' }}>
                  {result==='bad' ? '🚨' : '⚠️'} {autoReason}
                </div>
              )}
            </div>

            {/* 특이사항 + 사진 */}
            <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항 (선택)"
                style={{ flex:1, height:72, padding:'10px 12px', borderRadius:10, border:'1px solid var(--bd)', background:'var(--bg2)', color:'var(--t1)', fontSize:14, resize:'none', boxSizing:'border-box' }} />
              <PhotoButton hook={photo} />
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 바 — 닫기 항상, 저장은 개소 선택 후 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        {currentPt && (
          <button onClick={handleSave} disabled={saving || digits.slice(0, totalDigitSlots).some(d => d === '')}
            style={{ flex:1, padding:14, borderRadius:12, border:'none', background: (saving || digits.slice(0, totalDigitSlots).some(d=>d==='')) ? 'var(--bd)' : 'var(--primary)', color:'#fff', fontSize:15, fontWeight:700, cursor: saving ? 'default' : 'pointer' }}>
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
  onSaveRecord: (cpId: string, result: CheckResult, memo: string) => Promise<void>
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

  const resultColor: Partial<Record<CheckResult,string>> = { normal:'var(--safe)', caution:'var(--warn)', bad:'var(--danger)' }
  const resultLabel: Partial<Record<CheckResult,string>> = { normal:'정상', caution:'주의', bad:'불량' }

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
      if (cpId) await onSaveRecord(cpId, result, memo || '').catch(() => {})

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
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, background:'var(--bg)', zIndex: mode === 'from-div' ? 120 : 99, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <span style={{ fontSize:48 }}>✅</span>
      <div style={{ fontSize:18, fontWeight:700, color:'var(--t1)' }}>점검 완료</div>
      <button onClick={onClose} style={{ marginTop:8, padding:'12px 32px', borderRadius:10, background:'var(--primary)', border:'none', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>닫기</button>
    </div>
  )

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, background:'var(--bg)', zIndex: mode === 'from-div' ? 120 : 99, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* 헤더 */}
      <div style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--bd)', gap:8, flexShrink:0 }}>
        <span style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>💨 컴프레셔 점검</span>
        {mode !== 'from-div' && currentPt && totalSteps && (
          <span style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:'var(--t3)' }}>{lineIdx+1} / {totalSteps}</span>
        )}
        {mode !== 'from-div' && currentPt && zone === 'underground' && (
          <span style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:'var(--t3)' }}>{underPickIdx+1} / {underPending.length}</span>
        )}
      </div>

      {/* 본문 */}
      <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:14 }}>
        {/* from-div 모드가 아닐 때만 구역/라인 선택 표시 */}
        {mode !== 'from-div' && (
          <>
            {/* 구역 선택 */}
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>구역 선택</div>
              <div style={{ display:'flex', gap:8 }}>
                {(['research','office','underground'] as DivZone[]).map(z => {
                  const sel = zone === z
                  return (
                    <button key={z}
                      onClick={() => { setZone(z); setLine(null); setLineIdx(0); setUnderPending([...DIV_UNDER_SEQ]); setUnderPickIdx(0); resetForm() }}
                      style={{ flex:1, padding:'10px 0', borderRadius:10, border: sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)', fontSize:13, fontWeight:700, cursor:'pointer', background: sel ? 'var(--acl)' : 'var(--bg)', color: sel ? '#fff' : 'var(--t2)', transition:'all .12s' }}>
                      {z==='research' ? '연구동' : z==='office' ? '사무동' : '지하'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 라인 선택 (연구동/사무동) */}
            {zone && zone !== 'underground' && (
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>라인 선택</div>
                <div style={{ display:'flex', gap:8 }}>
                  {(zone === 'research' ? [1,2] : [3]).map(l => {
                    const sel = line === l
                    return (
                      <button key={l}
                        onClick={() => { setLine(l); setLineIdx(0); resetForm() }}
                        style={{ flex:1, padding:'10px 0', borderRadius:10, border: sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)', fontSize:13, fontWeight:700, cursor:'pointer', background: sel ? 'var(--acl)' : 'var(--bg)', color: sel ? '#fff' : 'var(--t2)', transition:'all .12s' }}>
                        컴프 #{l}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* 점검 폼 영역 — 개소 네비 카드는 항상 표시, 재진입 팝업은 입력 폼만 덮음 */}
        {currentPt && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* 개소 정보 + 이전/다음 네비 (standalone만) — 팝업에 안 덮임 */}
            {mode !== 'from-div' && (() => {
              const seq = zone !== 'underground' && line ? DIV_LINE_SEQ[line] : null
              const canPrev = zone === 'underground' ? underPickIdx > 0 : lineIdx > 0
              const canNext = zone === 'underground' ? underPickIdx < underPending.length - 1 : seq ? lineIdx < seq.length - 1 : false
              const goPrev = () => { if (zone === 'underground') setUnderPickIdx(i => i - 1); else setLineIdx(i => i - 1); resetForm() }
              const goNext = () => { if (zone === 'underground') setUnderPickIdx(i => i + 1); else setLineIdx(i => i + 1); resetForm() }
              const navBtnStyle = (enabled: boolean): React.CSSProperties => ({
                width:36, height:36, borderRadius:8, border:'1px solid var(--bd)', background:'var(--bg)',
                color: enabled ? 'var(--t1)' : 'var(--t3)', fontSize:20, fontWeight:700, cursor: enabled ? 'pointer' : 'default',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity: enabled ? 1 : 0.3,
              })
              return (
                <div
                  style={{ background:'var(--bg2)', borderRadius:12, padding:'10px 12px', border:'1px solid var(--bd)', display:'flex', alignItems:'center', gap:10, touchAction:'pan-y' }}
                  onTouchStart={e => { (e.currentTarget as any)._swX = e.touches[0].clientX }}
                  onTouchEnd={e => { const sx = (e.currentTarget as any)._swX; if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (dx > 40 && canPrev) goPrev(); else if (dx < -40 && canNext) goNext() }}
                >
                  <button style={navBtnStyle(canPrev)} onClick={canPrev ? goPrev : undefined}>‹</button>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>현재 개소</div>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginTop:2 }}>{currentPt.floorLabel} — 컴프 #{currentPt.pos}</div>
                    <div style={{ fontSize:11, color:'var(--t2)', marginTop:2 }}>{currentPt.loc}</div>
                  </div>
                  <button style={navBtnStyle(canNext)} onClick={canNext ? goNext : undefined}>›</button>
                </div>
              )
            })()}

            {/* from-div: 간단한 개소 정보 — 팝업에 안 덮임 */}
            {mode === 'from-div' && (
              <div style={{ background:'var(--bg2)', borderRadius:12, padding:'10px 12px', border:'1px solid var(--bd)', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>현재 개소</div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginTop:2 }}>{currentPt.floorLabel} — 컴프 #{currentPt.pos}</div>
                <div style={{ fontSize:11, color:'var(--t2)', marginTop:2 }}>{currentPt.loc}</div>
              </div>
            )}

            {/* 입력 폼 서브 컨테이너 — 재진입 팝업 부분 오버레이의 부모 (position:relative)
                H2 (260423-htx Task 5): 팝업이 '현재 개소' 네비 카드를 가리지 않고
                입력 폼(탱크배수/오일/결과/특이사항) 영역만 덮도록 부모 범위를 축소. */}
            <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:14 }}>
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
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                    탱크 배수
                    {drainDPlus !== null && (
                      <span style={{ fontSize:10, fontWeight:700, color: drainDPlus > 60 ? 'var(--warn)' : 'var(--t3)', background: drainDPlus > 60 ? 'rgba(245,158,11,.12)' : 'var(--bg3)', padding:'1px 6px', borderRadius:4 }}>D+{drainDPlus}</span>
                    )}
                    {drainDPlus === null && <span style={{ fontSize:10, color:'var(--t3)', opacity:0.5 }}>기록 없음</span>}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setTankDrain('none')} style={{ flex:1, padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background: tankDrain==='none' ? 'var(--bg)' : 'transparent', color: tankDrain==='none' ? 'var(--t1)' : 'var(--t3)', boxShadow: tankDrain==='none' ? '0 0 0 2px var(--primary)' : '0 0 0 1px var(--bd)', opacity: tankDrain==='none' ? 1 : 0.45 }}>없음</button>
                    <button onClick={() => setTankDrain('yes')} style={{ flex:1, padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background: tankDrain==='yes' ? 'rgba(59,130,246,.18)' : 'transparent', color: tankDrain==='yes' ? '#3b82f6' : 'var(--t3)', boxShadow: tankDrain==='yes' ? '0 0 0 2px #3b82f6' : '0 0 0 1px var(--bd)', opacity: tankDrain==='yes' ? 1 : 0.45 }}>있음</button>
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>컴프 오일</div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setOil('sufficient')} style={{ flex:1, padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background: oil==='sufficient' ? 'var(--bg)' : 'transparent', color: oil==='sufficient' ? 'var(--t1)' : 'var(--t3)', boxShadow: oil==='sufficient' ? '0 0 0 2px var(--primary)' : '0 0 0 1px var(--bd)', opacity: oil==='sufficient' ? 1 : 0.45 }}>충분함</button>
                    <button onClick={() => setOil('refill')} style={{ flex:1, padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background: oil==='refill' ? 'rgba(245,158,11,.18)' : 'transparent', color: oil==='refill' ? 'var(--warn)' : 'var(--t3)', boxShadow: oil==='refill' ? '0 0 0 2px var(--warn)' : '0 0 0 1px var(--bd)', opacity: oil==='refill' ? 1 : 0.45 }}>보충함</button>
                  </div>
                </div>
              </div>

              {/* 점검 결과 */}
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>점검 결과</div>
                <div style={{ display:'flex', gap:8 }}>
                  {(['normal','caution','bad'] as const).map(r => (
                    <button key={r} onClick={() => setResult(r)}
                      style={{ flex:1, padding:'10px 0', borderRadius:10, border:`2px solid ${result===r ? resultColor[r]! : 'var(--bd)'}`, background: result===r ? resultColor[r]! : 'var(--bg2)', color: result===r ? '#fff' : 'var(--t2)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      {resultLabel[r]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 특이사항 + 사진 */}
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항 (선택)"
                  style={{ flex:1, height:72, padding:'10px 12px', borderRadius:10, border:'1px solid var(--bd)', background:'var(--bg2)', color:'var(--t1)', fontSize:14, resize:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={photo} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 바 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        {currentPt && (
          <button onClick={handleSave} disabled={saving}
            style={{ flex:1, padding:14, borderRadius:12, border:'none', background: saving ? 'var(--bd)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color:'#fff', fontSize:15, fontWeight:700, cursor: saving ? 'default' : 'pointer', boxShadow: saving ? 'none' : '0 4px 14px rgba(37,99,235,0.35)' }}>
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
  const [selectedId,  setSelectedId]  = useState<string>('')
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
  const selectedCP = selectedId ? (allCheckpoints.find(cp => cp.id === selectedId) ?? null) : null
  const isDone     = selectedCP ? !!records[selectedCP.id] : false

  const prevZone = useRef(zone)
  useEffect(() => {
    if (prevZone.current !== zone) {
      prevZone.current = zone
      setSelectedId(''); setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

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

  const zoneBtnStyle = (sel: boolean) => ({
    flex:1, padding:'9px 0', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer' as const,
    border:     sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background: sel ? 'var(--acl)' : 'var(--bg)',
    color:      sel ? '#fff' : 'var(--t2)',
    transition: 'all .12s',
  })

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}>

      {/* 헤더 */}
      <div style={{ padding:'10px 16px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{group.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{group.labels[0]}</div>
        </div>
      </div>

      {/* 구역 선택 */}
      <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>구역 선택</div>
        <div style={{ display:'flex', gap:8 }}>
          {(['research','office','underground'] as PPZone[]).map(z => {
            const zCPs   = allCheckpoints.filter(cp => cp.category === '소방용전원공급반' && cp.locationNo?.startsWith(PP_ZONE_PREFIX[z]))
            const allDone = zCPs.length > 0 && zCPs.every(cp => records[cp.id])
            return (
              <button key={z} onClick={() => setZone(z)} style={zoneBtnStyle(zone === z)}>
                {PP_ZONE_LABELS[z]}{allDone && <span style={{ fontSize:10, marginLeft:4, opacity:0.8 }}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 위치 드롭박스 */}
      {zone && (
        <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>위치 선택</div>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ width:'100%', padding:'10px 12px', borderRadius:10, background:'var(--bg)', border:'1px solid var(--bd2)', color: selectedId ? 'var(--t1)' : 'var(--t3)', fontSize:13, fontFamily:'inherit', outline:'none', appearance:'none', cursor:'pointer' }}
          >
            <option value=''>위치를 선택하세요</option>
            {zoneCPs.map(cp => (
              <option key={cp.id} value={cp.id}>
                {cp.location}{records[cp.id] ? ' ✓' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 폼 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:12 }}>
        {!zone && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>구역을 선택해 주세요</div>
        )}
        {zone && !selectedId && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>위치를 선택해 주세요</div>
        )}

        {selectedCP && (
          <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:12 }}>
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
              <div style={{ background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', borderRadius:8, padding:'9px 12px', fontSize:12, color:'var(--safe)' }}>✓ 이미 점검 완료된 항목입니다</div>
            )}

            {/* 점검 결과 */}
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>점검 결과</div>
              <div style={{ display:'flex', gap:6 }}>
                {INSPECT_RESULT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setResult(opt.value)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', border: result===opt.value ? `2px solid ${opt.color}` : '1px solid var(--bd)', background: result===opt.value ? opt.bg : 'var(--bg2)', transition:'all .13s' }}>
                    <span style={{ fontSize:20 }}>{opt.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: result===opt.value ? opt.color : 'var(--t3)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 특이사항 + 사진 */}
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
                <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>

            {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
            {justSaved  && <div style={{ background:'rgba(34,197,94,.1)',  border:'1px solid rgba(34,197,94,.25)',  borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || !selectedCP}
          style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading||!selectedCP ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color: submitting||photo.uploading||!selectedCP ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading||!selectedCP ? 'default' : 'pointer', transition:'all .13s' }}
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

  const btnStyle = (sel: boolean) => ({
    flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' as const,
    border:      sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background:  sel ? 'var(--acl)' : 'var(--bg)',
    color:       sel ? '#fff' : 'var(--t2)',
    transition: 'all .12s',
  })

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}>

      {/* 헤더 */}
      <div style={{ padding:'10px 16px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{group.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{group.labels[0]}</div>
          {group.labels.length > 1 && <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>{group.labels.slice(1).join(' · ')}</div>}
        </div>
      </div>

      {/* 항목 선택 */}
      <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>항목 선택</div>
        <div style={{ display:'flex', gap:8 }}>
          {(['주차장비','회전문'] as const).map(label => {
            const catCPs  = allCheckpoints.filter(cp => cp.category === label)
            const allDone = catCPs.length > 0 && catCPs.every(cp => records[cp.id])
            const isSel   = item === label
            return (
              <button key={label} onClick={() => setItem(label)} style={btnStyle(isSel)}>
                {label}{allDone && <span style={{ fontSize:10, marginLeft:4, opacity:0.8 }}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 회전문 → 북문/남문 */}
      {item === '회전문' && (
        <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>문 선택</div>
          <div style={{ display:'flex', gap:8 }}>
            {(['북문','남문'] as const).map(door => {
              const doorCP  = allCheckpoints.find(cp => cp.category === '회전문' && cp.location === door)
              const doneDoor = doorCP ? !!records[doorCP.id] : false
              const isSel   = subItem === door
              return (
                <button key={door} onClick={() => setSubItem(door)} style={btnStyle(isSel)}>
                  {door}{doneDoor && <span style={{ fontSize:10, marginLeft:4, opacity:0.8 }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 폼 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:12 }}>
        {!item && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>항목을 선택해 주세요</div>
        )}
        {item === '회전문' && !subItem && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>북문 또는 남문을 선택해 주세요</div>
        )}

        {showForm && (
          <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:12 }}>
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
              <div style={{ background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', borderRadius:8, padding:'9px 12px', fontSize:12, color:'var(--safe)' }}>✓ 이미 점검 완료된 항목입니다</div>
            )}

            {/* 점검 결과 */}
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>점검 결과</div>
              <div style={{ display:'flex', gap:6 }}>
                {INSPECT_RESULT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setResult(opt.value)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', border: result===opt.value ? `2px solid ${opt.color}` : '1px solid var(--bd)', background: result===opt.value ? opt.bg : 'var(--bg2)', transition:'all .13s' }}>
                    <span style={{ fontSize:20 }}>{opt.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: result===opt.value ? opt.color : 'var(--t3)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 특이사항 + 사진 */}
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
                <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>

            {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
            {justSaved  && <div style={{ background:'rgba(34,197,94,.1)',  border:'1px solid rgba(34,197,94,.25)',  borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || !canSave}
          style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading||!canSave ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color: submitting||photo.uploading||!canSave ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading||!canSave ? 'default' : 'pointer', transition:'all .13s' }}
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

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  // Reset on item change
  const prevItem = useRef(item)
  useEffect(() => {
    if (prevItem.current !== item) {
      prevItem.current = item
      setSubItem(null); setSelectedStair(null); setSelectedEquip(null)
      setFloorResults({}); setResult('normal')
      setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
    }
  }) // eslint-disable-line

  // Reset on 연결송수관 subItem change
  const prevSub = useRef(subItem)
  useEffect(() => {
    if (prevSub.current !== subItem) {
      prevSub.current = subItem
      setResult('normal'); setMemo(''); setSubmitError(null); setJustSaved(false); photo.reset()
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
      for (const cp of stairCPs) {
        await onSave(cp.id, floorResults[cp.id] ?? 'normal', memo, photoKey ?? undefined)
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
      await onSave(cpId, result, memo, photoKey ?? undefined)
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

  const btnStyle = (sel: boolean) => ({
    flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' as const,
    border:     sel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background: sel ? 'var(--acl)' : 'var(--bg)',
    color:      sel ? '#fff' : 'var(--t2)',
    transition: 'all .12s',
  })

  const resultBtnStyle = (active: boolean, opt: typeof INSPECT_RESULT_OPTIONS[0]) => ({
    flex:1, padding:'4px 2px', borderRadius:7, fontSize:10, fontWeight:700, cursor:'pointer' as const,
    border:      active ? `1.5px solid ${opt.color}` : '1px solid var(--bd)',
    background:  active ? opt.bg : 'var(--bg2)',
    color:       active ? opt.color : 'var(--t3)',
    transition: 'all .1s',
  })

  // 전실제연댐퍼 UI mode
  const jdMode = item === '전실제연댐퍼' ? (selectedStair ? 'stair' : selectedEquip ? 'equip' : 'select') : null

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}>

      {/* 헤더 */}
      <div style={{ padding:'10px 16px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{group.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{group.labels[0]}</div>
          {group.labels.length > 1 && <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>{group.labels.slice(1).join(' · ')}</div>}
        </div>
      </div>

      {/* 항목 선택 */}
      <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>항목 선택</div>
        <div style={{ display:'flex', gap:8 }}>
          {(['전실제연댐퍼','연결송수관'] as const).map(label => {
            const catCPs  = allCheckpoints.filter(cp => cp.category === label)
            const allDone = catCPs.length > 0 && catCPs.every(cp => records[cp.id])
            const isSel   = item === label
            return (
              <button key={label} onClick={() => setItem(label)} style={btnStyle(isSel)}>
                {label}{allDone && <span style={{ fontSize:10, marginLeft:4, opacity:0.8 }}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 전실제연댐퍼 → 계단전실 선택 */}
      {item === '전실제연댐퍼' && (
        <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>계단전실 선택</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {stairNums.map(num => {
              const sCPs = allCheckpoints.filter(cp => cp.category === '전실제연댐퍼' && cp.locationNo?.endsWith(`-${num}`))
              const done = sCPs.length > 0 && sCPs.every(cp => records[cp.id])
              return (
                <button key={num} onClick={() => { setSelectedEquip(null); setSelectedStair(num) }} style={btnStyle(selectedStair === num)}>
                  {num}{done && <span style={{ fontSize:9, marginLeft:3, opacity:0.8 }}>✓</span>}
                </button>
              )
            })}
            {equipCPs.length > 0 && equipCPs.map(cp => {
              const done = !!records[cp.id]
              return (
                <button key={cp.id} onClick={() => { setSelectedStair(null); setSelectedEquip(cp.id) }} style={{ padding:'7px 10px', borderRadius:9, fontSize:11, fontWeight:700, cursor:'pointer', border: selectedEquip === cp.id ? '1.5px solid var(--acl)' : done ? '1.5px solid var(--safe)' : '1px solid var(--bd2)', background: selectedEquip === cp.id ? 'var(--acl)' : done ? 'rgba(34,197,94,.1)' : 'var(--bg)', color: selectedEquip === cp.id ? '#fff' : done ? 'var(--safe)' : 'var(--t2)', transition:'all .12s' }}>
                  {cp.location}{done && <span style={{ fontSize:9, marginLeft:3, opacity:0.8 }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 연결송수관 → 위치 선택 (DB 데이터 기반) */}
      {item === '연결송수관' && (
        <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>위치 선택</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {allCheckpoints.filter(cp => cp.category === '연결송수관').map(cp => {
              const isSel  = subItem === cp.location
              const isDone = !!records[cp.id]
              return (
                <button key={cp.id} onClick={() => setSubItem(cp.location)} style={btnStyle(isSel)}>
                  {cp.location}{isDone && <span style={{ fontSize:10, marginLeft:4, opacity:0.8 }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 폼 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {!item && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>항목을 선택해 주세요</div>
        )}

        {/* 점검 폼 컨테이너 (재진입 팝업 부분 오버레이의 부모) — item 선택 후에만 렌더 */}
        {item && (
          <div style={{ position:'relative', display:'flex', flexDirection:'column', gap:10 }}>
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
              <div style={{ fontSize:11, color:'var(--safe)', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:8, padding:'6px 10px' }}>
                ✓ {stairDoneCount}/{stairCPs.length}층 이미 점검 완료
              </div>
            )}

            {/* 층별 결과 — 2열 */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {/* 왼쪽 열 */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {stairCPs.slice(0, Math.ceil(stairCPs.length / 2)).map(cp => {
                  const curResult = floorResults[cp.id] ?? 'normal'
                  return (
                    <div key={cp.id} style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 8px 6px', border: initCp && cp.floor === initCp.floor ? '2px solid #f97316' : '1px solid var(--bd)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color: initCp && cp.floor === initCp.floor ? '#f97316' : 'var(--t2)', marginBottom:5 }}>{JD_FLOOR_LABEL[cp.floor] ?? cp.floor}</div>
                      <div style={{ display:'flex', gap:4 }}>
                        {INSPECT_RESULT_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))} style={resultBtnStyle(curResult === opt.value, opt)}>
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* 오른쪽 열 */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {stairCPs.slice(Math.ceil(stairCPs.length / 2)).map(cp => {
                  const curResult = floorResults[cp.id] ?? 'normal'
                  return (
                    <div key={cp.id} style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 8px 6px', border: initCp && cp.floor === initCp.floor ? '2px solid #f97316' : '1px solid var(--bd)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color: initCp && cp.floor === initCp.floor ? '#f97316' : 'var(--t2)', marginBottom:5 }}>{JD_FLOOR_LABEL[cp.floor] ?? cp.floor}</div>
                      <div style={{ display:'flex', gap:4 }}>
                        {INSPECT_RESULT_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))} style={resultBtnStyle(curResult === opt.value, opt)}>
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 특이사항 + 사진 */}
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
                <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>

            {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
            {justSaved  && <div style={{ background:'rgba(34,197,94,.1)',  border:'1px solid rgba(34,197,94,.25)',  borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
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
                <div style={{ background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', borderRadius:8, padding:'9px 12px', fontSize:12, color:'var(--safe)' }}>✓ 이미 점검 완료된 항목입니다</div>
              )}
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>점검 결과</div>
                <div style={{ display:'flex', gap:6 }}>
                  {INSPECT_RESULT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setResult(opt.value)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', border: result===opt.value ? `2px solid ${opt.color}` : '1px solid var(--bd)', background: result===opt.value ? opt.bg : 'var(--bg2)', transition:'all .13s' }}>
                      <span style={{ fontSize:20 }}>{opt.icon}</span>
                      <span style={{ fontSize:11, fontWeight:700, color: result===opt.value ? opt.color : 'var(--t3)' }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                  <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
                  <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                  <PhotoButton hook={photo} label="촬영" noCapture />
                </div>
              </div>
              {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
              {justSaved  && <div style={{ background:'rgba(34,197,94,.1)',  border:'1px solid rgba(34,197,94,.25)',  borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
            </>
          )
        })()}

        {/* 전실제연댐퍼 — 선택 안내 */}
        {item === '전실제연댐퍼' && jdMode === 'select' && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>계단전실을 선택해 주세요</div>
        )}

        {/* 연결송수관 — 개별 폼 */}
        {item === '연결송수관' && !subItem && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>위치를 선택해 주세요</div>
        )}
        {item === '연결송수관' && subItem && (
          <>
            {yscpId && records[yscpId] && !justSaved && (
              <div style={{ background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', borderRadius:8, padding:'9px 12px', fontSize:12, color:'var(--safe)' }}>✓ 이미 점검 완료된 항목입니다</div>
            )}
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>점검 결과</div>
              <div style={{ display:'flex', gap:6 }}>
                {INSPECT_RESULT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setResult(opt.value)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', border: result===opt.value ? `2px solid ${opt.color}` : '1px solid var(--bd)', background: result===opt.value ? opt.bg : 'var(--bg2)', transition:'all .13s' }}>
                    <span style={{ fontSize:20 }}>{opt.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: result===opt.value ? opt.color : 'var(--t3)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
                <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>
            {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
            {justSaved  && <div style={{ background:'rgba(34,197,94,.1)',  border:'1px solid rgba(34,197,94,.25)',  borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
          </>
        )}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        <button
          onClick={jdMode === 'stair' ? handleStairSave : handleSingleSave}
          disabled={submitting || photo.uploading || !canSave}
          style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading||!canSave ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color: submitting||photo.uploading||!canSave ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading||!canSave ? 'default' : 'pointer', transition:'all .13s' }}
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
        if (selectedZone === 'underground') return mzone === 'common'
        if (selectedZone === 'office')      return mzone === 'office'
        // research
        return mzone === 'research' || mzone === 'common'
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
  const [showExtList, setShowExtList] = useState(false)

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

  // ── 렌더 ─────────────────────────────────────────────
  return (
    <div style={{
      position:'fixed',
      top: 'var(--sat, 0px)', left:0, right:0,
      bottom: NAV_BOTTOM,   // BottomNav 위에 맞춤
      zIndex:99,            // BottomNav(100) 아래 — 네비는 항상 표시
      background:'var(--bg)',
      display:'flex', flexDirection:'column',
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)',
    }}>

      {/* ── 헤더 ── */}
      <div style={{ paddingTop:'10px', paddingBottom:10, paddingLeft:16, paddingRight:16, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{group.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{group.labels[0]}</div>
          {group.labels.length > 1 && <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>{group.labels.slice(1).join(' · ')}</div>}
        </div>
        {isExtinguisher && (
          <button onClick={() => setShowExtList(true)} style={{ height:30, padding:'0 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)', color:'var(--t2)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
            리스트
          </button>
        )}
      </div>

      {/* ── 구역 선택 — CP가 2개 이상일 때만 ── */}
      {groupCPs.length > 1 && (
      <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
        <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>구역 선택</div>
        <div style={{ display:'flex', gap:6 }}>
          {ZONE_CONFIG.filter(z => availableZones.includes(z.key)).map(z => {
            const isSel = z.key === selectedZone
            return (
              <button key={z.key} onClick={() => handleZoneChange(z.key)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'4px 8px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', border: isSel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)', background: isSel ? 'var(--acl)' : 'var(--bg)', color: isSel ? '#fff' : 'var(--t2)', transition:'all .1s' }}>
                <span style={{ fontSize:13 }}>{z.icon}</span>{z.label}
              </button>
            )
          })}
        </div>
      </div>
      )}

      {/* ── 층 선택 (구역 선택 후, CP가 2개 이상일 때만) ── */}
      {groupCPs.length > 1 && selectedZone && (
        <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>층 선택</div>
          <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
            {availableFloors.map(f => {
              const fCPs  = groupCPs.filter(cp => matchZone(cp, selectedZone) && cp.floor === f)
              // 260426-f54: '점검 시도 있음' 이 아니라 '확정 완료' 를 카운트 (isCpCompleted 룰)
              const fDone = fCPs.filter(cp => isCpCompleted(monthRecords[cp.id])).length
              const isSel = f === selectedFloor
              return (
                <button key={f} onClick={() => handleFloorChange(f)} style={{ flexShrink:0, padding:'4px 12px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', border: isSel ? '1.5px solid var(--acl)' : '1px solid var(--bd2)', background: isSel ? 'var(--acl)' : 'var(--bg)', color: isSel ? '#fff' : 'var(--t2)', transition:'all .1s' }}>
                  {f}{fDone > 0 && <span style={{ marginLeft:3, fontSize:9, opacity:0.75 }}>({fDone})</span>}
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
        <div style={{ padding:'10px 14px 8px', flexShrink:0, background:'var(--bg)' }}>
          {pendingCPs.length >= 1 && (
            <div
              style={{ background:'var(--bg2)', borderRadius:12, padding:'10px 12px', border:'1px solid var(--bd)', display:'flex', alignItems:'center', gap:10, touchAction:'pan-y' }}
              onTouchStart={e => { (e.currentTarget as any)._swX = e.touches[0].clientX }}
              onTouchEnd={e => {
                const sx = (e.currentTarget as any)._swX
                if (sx == null) return
                const dx = e.changedTouches[0].clientX - sx
                if (dx > 40 && pickerIdx > 0) setPickerIdx(pickerIdx - 1)
                else if (dx < -40 && pickerIdx < pendingCPs.length - 1) setPickerIdx(pickerIdx + 1)
              }}
            >
              <button onClick={() => { if (pickerIdx > 0) setPickerIdx(pickerIdx - 1) }} style={{ width:36, height:36, borderRadius:8, border:'1px solid var(--bd)', background:'var(--bg)', color: pickerIdx > 0 ? 'var(--t1)' : 'var(--t3)', fontSize:20, fontWeight:700, cursor: pickerIdx > 0 ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity: pickerIdx > 0 ? 1 : 0.3 }}>‹</button>
              <div style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>개소 ({pickerIdx + 1}/{pendingCPs.length}) · {doneCount}/{totalCount} 완료</div>
                {isExtinguisher && extDetail ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:3 }}>
                    <span style={{ fontSize:14 }}>🧯</span>
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>{extDetail.mgmt_no}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:'#ef4444', background:'rgba(239,68,68,.1)', padding:'1px 6px', borderRadius:4 }}>{extDetail.type}</span>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginTop:2 }}>{selectedCP?.location ?? ''}</div>
                    {selectedCP?.description && <div style={{ fontSize:11, color:'var(--t2)', marginTop:2 }}>{selectedCP.description}</div>}
                  </>
                )}
                {/* H1 (260423-htx Task 5): '✓ 점검 완료' 초록 알약 제거 —
                    개소 카드 첫줄 `doneCount/totalCount 완료` 표기로 대체. */}
              </div>
              <button onClick={() => { if (pickerIdx < pendingCPs.length - 1) setPickerIdx(pickerIdx + 1) }} style={{ width:36, height:36, borderRadius:8, border:'1px solid var(--bd)', background:'var(--bg)', color: pickerIdx < pendingCPs.length - 1 ? 'var(--t1)' : 'var(--t3)', fontSize:20, fontWeight:700, cursor: pickerIdx < pendingCPs.length - 1 ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity: pickerIdx < pendingCPs.length - 1 ? 1 : 0.3 }}>›</button>
            </div>
          )}
        </div>
      )}

      {/* ── 나머지 (스크롤 가능) ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px 14px 8px', display:'flex', flexDirection:'column', gap:8 }}>
        {/* 접근불가 뱃지 (해당 항목만) */}
        {selectedCP?.defaultResult && (
          <div style={{ background:'rgba(234,179,8,.08)', border:'1px solid rgba(234,179,8,.3)', borderRadius:8, padding:'6px 10px', fontSize:11, color:'#b45309', fontWeight:600 }}>
            접근불가 구역 — 자동 정상 처리
          </div>
        )}
        {/* ── 소화기 상세정보 ── */}
        {isExtinguisher && selectedCP && extDetail && (() => {
          // 분말 소화기 교체 주기: 제조 후 10년 (헬퍼 위임 — src/utils/extinguisher.ts)
          const replaceWarning = getReplaceWarning(extDetail.type, extDetail.manufactured_at)
          const rwStyle = {
            danger:   { bg:'rgba(239,68,68,.12)', border:'rgba(239,68,68,.3)', color:'#dc2626', text:'연한 초과 — 즉시 교체 필요' },
            imminent: { bg:'rgba(249,115,22,.12)', border:'rgba(249,115,22,.3)', color:'#c2410c', text:'연한 임박 — 교체 시급' },
            warn:     { bg:'rgba(234,179,8,.12)',  border:'rgba(234,179,8,.3)',  color:'#a16207', text:'연한 도래 — 교체 준비 필요' },
          }
          return (
            <div style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 12px', border:'1px solid var(--bd)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px', fontSize:11 }}>
                <div><span style={{ color:'var(--t3)' }}>위치 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{extDetail.location}</span></div>
                <div><span style={{ color:'var(--t3)' }}>제조업체 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{extDetail.manufacturer ?? '-'}</span></div>
                <div><span style={{ color:'var(--t3)' }}>제조년월 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{extDetail.manufactured_at ?? '-'}</span></div>
                <div><span style={{ color:'var(--t3)' }}>형식승인 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{extDetail.approval_no ?? '-'}</span></div>
                <div><span style={{ color:'var(--t3)' }}>접두문자 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{extDetail.prefix_code ?? '-'}</span></div>
                <div><span style={{ color:'var(--t3)' }}>증지번호 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{extDetail.seal_no ?? '-'}</span></div>
                <div><span style={{ color:'var(--t3)' }}>제조번호 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{extDetail.serial_no ?? '-'}</span></div>
              </div>
              {replaceWarning && (
                <div style={{
                  marginTop:8, fontSize:11, fontWeight:700, borderRadius:6, padding:'6px 10px',
                  background: rwStyle[replaceWarning].bg,
                  border: `1px solid ${rwStyle[replaceWarning].border}`,
                  color: rwStyle[replaceWarning].color,
                }}>
                  {rwStyle[replaceWarning].text}
                </div>
              )}
              {extDetail.note && (
                <div style={{ marginTop:6, fontSize:11, color:'var(--t2)', background:'rgba(245,158,11,.08)', padding:'4px 8px', borderRadius:4 }}>
                  {extDetail.note}
                </div>
              )}
            </div>
          )
        })()}

        {/* 결과 선택 ~ 특이사항 영역 (이미 점검한 개소 오버레이 포함) */}
        {selectedCP && (
          <div style={{ position:'relative' }}>
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
              <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>점검 결과</div>
              <div style={{ display:'flex', gap:6 }}>
                {INSPECT_RESULT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setResult(opt.value)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', border: result===opt.value ? `2px solid ${opt.color}` : '1px solid var(--bd)', background: result===opt.value ? opt.bg : 'var(--bg2)', transition:'all .13s' }}>
                    <span style={{ fontSize:20 }}>{opt.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: result===opt.value ? opt.color : 'var(--t3)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 유도등: 증상 피커 (점검 결과 아래, 특이사항 위) */}
            {isGuideLight && result !== 'normal' && (selectedCP as any).locationNo !== 'audience_passage' && (
              <div style={{ marginTop:10 }}>
                <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>증상</div>
                <div style={{ display:'flex', gap:5 }}>
                  {['점등 이상','예비전원 이상','직접 입력'].map(s => (
                    <button key={s} onClick={() => setSymptomPick(s)} style={{
                      flex:1, padding:'8px 4px', borderRadius:10, cursor:'pointer',
                      border: symptomPick===s ? '2px solid var(--acl)' : '1px solid var(--bd)',
                      background: symptomPick===s ? 'rgba(59,130,246,.12)' : 'var(--bg2)',
                      fontSize:11, fontWeight:700, color: symptomPick===s ? 'var(--acl)' : 'var(--t2)',
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* 특이사항 + 증빙사진 (한 행) */}
            <div style={{ marginTop:10 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>
                  {isGuideLight && result !== 'normal' && (selectedCP as any).locationNo !== 'audience_passage' && symptomPick === '직접 입력' ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}
                </label>
                <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>
          </div>
        )}

        {/* 비상콘센트 (소화전과 location_no가 같은 경우 함께 표시) */}
        {pairedBC && (
          <>
            <div style={{ height:1, background:'var(--bd)', margin:'2px 0' }} />
            <div style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 12px', border:'1px solid var(--bd)' }}>
              <div style={{ fontSize:10, color:'var(--t3)' }}>{pairedBC.category}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', marginTop:1 }}>{pairedBC.location}</div>
              {pairedBC.description && <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{pairedBC.description}</div>}
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>비상콘센트 점검 결과</div>
              <div style={{ display:'flex', gap:6 }}>
                {INSPECT_RESULT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setBcResult(opt.value)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', borderRadius:12, cursor:'pointer', border: bcResult===opt.value ? `2px solid ${opt.color}` : '1px solid var(--bd)', background: bcResult===opt.value ? opt.bg : 'var(--bg2)', transition:'all .13s' }}>
                    <span style={{ fontSize:20 }}>{opt.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: bcResult===opt.value ? opt.color : 'var(--t3)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
                <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <textarea value={bcMemo} onChange={e => setBcMemo(e.target.value)} placeholder="특이사항을 입력하세요" style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }} />
                <PhotoButton hook={bcPhoto} label="촬영" noCapture />
              </div>
            </div>
          </>
        )}

        {groupCPs.length > 1 && !selectedZone && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'var(--t3)', fontSize:13, paddingTop:20 }}>
            <span>위에서 구역을 선택해 주세요</span>
          </div>
        )}
        {groupCPs.length > 1 && selectedZone && !selectedFloor && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'var(--t3)', fontSize:13, paddingTop:20 }}>
            <span>층을 선택해 주세요</span>
          </div>
        )}
        {groupCPs.length === 1 && pendingCPs.length === 0 && !selectedCP && (
          <div style={{ textAlign:'center', padding:'24px 0', color:'var(--safe)', fontSize:13, fontWeight:600 }}>
            ✅ 점검 완료
          </div>
        )}

        {submitError && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{submitError}</div>}
        {justSaved && !submitError && <div style={{ background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--safe)' }}>✓ 저장 완료</div>}
      </div>

      {/* ── 저장 버튼 ── */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>닫기</button>
        <button
          onClick={handleSave}
          disabled={submitting || photo.uploading || bcPhoto.uploading || !selectedCP || isAccessBlocked}
          style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading||bcPhoto.uploading||!selectedCP||isAccessBlocked ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color: submitting||photo.uploading||bcPhoto.uploading||!selectedCP||isAccessBlocked ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading||bcPhoto.uploading||!selectedCP||isAccessBlocked ? 'default' : 'pointer', transition:'all .13s' }}
        >
          {(photo.uploading || bcPhoto.uploading) ? '사진 업로드 중...' : submitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : '점검 기록 저장'}
        </button>
      </div>

      {/* ── 소화기 리스트 풀스크린 오버레이 ── */}
      {showExtList && <ExtinguisherListOverlay onClose={() => setShowExtList(false)} />}
    </div>
  )
}

// ── 소화기 리스트 오버레이 ──────────────────────────────
function ExtinguisherListOverlay({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<ExtinguisherListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{ floor?: string; zone?: string; type?: string; q?: string }>({})
  const [replaceFilter, setReplaceFilter] = useState<'warn' | 'imminent' | 'danger' | false>(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  useEffect(() => {
    setLoading(true)
    extinguisherApi.list(filter).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [filter])

  // 교체 필요 판별: danger(초과) > imminent(6개월) > warn(1년)
  // (헬퍼 위임 — src/utils/extinguisher.ts, 시그니처 유지로 호출처 무변화)
  function getReplaceStatus(item: any): 'danger' | 'imminent' | 'warn' | null {
    return getReplaceWarning(item?.type, item?.manufactured_at)
  }

  // 만료일 계산 (정렬용)
  function getExpiryMs(item: any): number {
    if (!item.manufactured_at) return Infinity
    const [y, m] = item.manufactured_at.split('-').map(Number)
    if (!y || !m) return Infinity
    return new Date(y + 10, m - 1).getTime()
  }

  const allItems = data?.items ?? []
  const dangerCount = allItems.filter(i => getReplaceStatus(i) === 'danger').length
  const imminentCount = allItems.filter(i => getReplaceStatus(i) === 'imminent').length
  const warnCount = allItems.filter(i => getReplaceStatus(i) === 'warn').length
  const displayItems = replaceFilter
    ? allItems.filter(i => getReplaceStatus(i) === replaceFilter).sort((a, b) => getExpiryMs(a) - getExpiryMs(b))
    : allItems

  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, bottom:0,
      zIndex:120, background:'var(--bg)',
      display:'flex', flexDirection:'column',
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)',
    }}>

      {/* 헤더 */}
      <div style={{ padding:'10px 16px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>🧯</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>소화기 리스트</div>
          <div style={{ fontSize:10, color:'var(--t3)' }}>{data ? `총 ${data.total}개` : '로딩 중...'}</div>
        </div>
        <button onClick={onClose} style={{ height:30, padding:'0 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)', color:'var(--t2)', fontSize:11, fontWeight:600, cursor:'pointer' }}>닫기</button>
      </div>

      {/* 종류별 요약 + 교체 경고 뱃지 */}
      {data && (
        <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:5, flexWrap:'wrap' }}>
          {data.stats.map(s => (
            <button key={s.type} onClick={() => { setReplaceFilter(false); setFilter(f => f.type === s.type ? { ...f, type: undefined } : { ...f, type: s.type }) }} style={{
              padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:600, cursor:'pointer',
              background: !replaceFilter && filter.type === s.type ? 'var(--acl)' : 'var(--bg3)',
              color: !replaceFilter && filter.type === s.type ? '#fff' : 'var(--t2)',
              border: !replaceFilter && filter.type === s.type ? 'none' : '1px solid var(--bd)',
            }}>
              {s.type} {s.cnt}
            </button>
          ))}
          {(warnCount > 0 || imminentCount > 0 || dangerCount > 0) && (
            <div style={{ width:1, height:18, background:'var(--bd)', margin:'0 2px', alignSelf:'center' }} />
          )}
          {warnCount > 0 && (
            <button onClick={() => { setReplaceFilter(replaceFilter === 'warn' ? false : 'warn'); setFilter(f => ({ ...f, type: undefined })) }} style={{
              padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:700, cursor:'pointer',
              background: replaceFilter === 'warn' ? 'rgba(234,179,8,.25)' : 'rgba(234,179,8,.08)',
              color: '#a16207',
              border: replaceFilter === 'warn' ? '1.5px solid rgba(234,179,8,.5)' : '1px solid rgba(234,179,8,.25)',
            }}>
              연한도래 {warnCount}
            </button>
          )}
          {imminentCount > 0 && (
            <button onClick={() => { setReplaceFilter(replaceFilter === 'imminent' ? false : 'imminent'); setFilter(f => ({ ...f, type: undefined })) }} style={{
              padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:700, cursor:'pointer',
              background: replaceFilter === 'imminent' ? 'rgba(249,115,22,.25)' : 'rgba(249,115,22,.08)',
              color: '#c2410c',
              border: replaceFilter === 'imminent' ? '1.5px solid rgba(249,115,22,.5)' : '1px solid rgba(249,115,22,.25)',
            }}>
              연한임박 {imminentCount}
            </button>
          )}
          {dangerCount > 0 && (
            <button onClick={() => { setReplaceFilter(replaceFilter === 'danger' ? false : 'danger'); setFilter(f => ({ ...f, type: undefined })) }} style={{
              padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:700, cursor:'pointer',
              background: replaceFilter === 'danger' ? 'rgba(239,68,68,.25)' : 'rgba(239,68,68,.08)',
              color: '#dc2626',
              border: replaceFilter === 'danger' ? '1.5px solid rgba(239,68,68,.5)' : '1px solid rgba(239,68,68,.25)',
            }}>
              연한초과 {dangerCount}
            </button>
          )}
        </div>
      )}

      {/* 필터 바 */}
      <div style={{ padding:'8px 14px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:5, alignItems:'center' }}>
        <input
          placeholder="제조번호 검색"
          value={filter.q ?? ''}
          onChange={e => setFilter(f => ({ ...f, q: e.target.value || undefined }))}
          style={{ flex:1, minWidth:0, padding:'6px 8px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)', color:'var(--t1)', fontSize:11, boxSizing:'border-box' }}
        />
        <select value={filter.zone ?? ''} onChange={e => setFilter(f => ({ ...f, zone: e.target.value || undefined }))} style={{ padding:'6px 6px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)', color:'var(--t1)', fontSize:11 }}>
          <option value="">구역</option>
          {data?.zones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <select value={filter.floor ?? ''} onChange={e => setFilter(f => ({ ...f, floor: e.target.value || undefined }))} style={{ padding:'6px 6px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)', color:'var(--t1)', fontSize:11 }}>
          <option value="">층</option>
          {data?.floors.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* 리스트 */}
      <div style={{ flex:1, overflowY:'auto', padding:'6px 14px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:'var(--t3)', fontSize:13 }}>로딩 중...</div>
        ) : displayItems.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:'var(--t3)', fontSize:13 }}>결과 없음</div>
        ) : displayItems.map(item => {
          const rs = getReplaceStatus(item)
          return (
            <div
              key={item.seq_no}
              onClick={() => setSelectedItem(selectedItem?.seq_no === item.seq_no ? null : item)}
              style={{
                padding:'8px 10px', margin:'4px 0', borderRadius:10, cursor:'pointer',
                background: selectedItem?.seq_no === item.seq_no ? 'var(--bg3)' : 'var(--bg2)',
                border: rs === 'danger' ? '1px solid rgba(239,68,68,.4)' : rs === 'imminent' ? '1px solid rgba(249,115,22,.4)' : rs === 'warn' ? '1px solid rgba(234,179,8,.4)' : '1px solid var(--bd)',
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)', minWidth:70 }}>{item.mgmt_no}</span>
                <span style={{ fontSize:10, fontWeight:600, color:'#ef4444', background:'rgba(239,68,68,.1)', padding:'1px 5px', borderRadius:4 }}>{item.type}</span>
                <span style={{ flex:1, fontSize:10, color:'var(--t3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.location}</span>
                {rs === 'danger' && <span style={{ fontSize:9, fontWeight:700, color:'#dc2626', background:'rgba(239,68,68,.12)', padding:'1px 4px', borderRadius:3 }}>연한초과</span>}
                {rs === 'imminent' && <span style={{ fontSize:9, fontWeight:700, color:'#c2410c', background:'rgba(249,115,22,.12)', padding:'1px 4px', borderRadius:3 }}>연한임박</span>}
                {rs === 'warn' && <span style={{ fontSize:9, fontWeight:700, color:'#a16207', background:'rgba(234,179,8,.12)', padding:'1px 4px', borderRadius:3 }}>연한도래</span>}
              </div>

              {/* 펼침 상세 */}
              {selectedItem?.seq_no === item.seq_no && (
                <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3px 12px', fontSize:11 }}>
                  <div><span style={{ color:'var(--t3)' }}>제조업체 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{item.manufacturer ?? '-'}</span></div>
                  <div><span style={{ color:'var(--t3)' }}>제조년월 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{item.manufactured_at ?? '-'}</span></div>
                  <div><span style={{ color:'var(--t3)' }}>형식승인 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{item.approval_no ?? '-'}</span></div>
                  <div><span style={{ color:'var(--t3)' }}>접두문자 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{item.prefix_code ?? '-'}</span></div>
                  <div><span style={{ color:'var(--t3)' }}>증지번호 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{item.seal_no ?? '-'}</span></div>
                  <div><span style={{ color:'var(--t3)' }}>제조번호 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{item.serial_no ?? '-'}</span></div>
                  {item.note && <div style={{ gridColumn:'1/3', color:'var(--t2)', background:'rgba(245,158,11,.08)', padding:'3px 6px', borderRadius:4, marginTop:2 }}>{item.note}</div>}
                  {rs && (() => {
                    const s = { danger: { color:'#dc2626', text:'연한 초과 — 즉시 교체 필요' }, imminent: { color:'#c2410c', text:'연한 임박 — 교체 시급' }, warn: { color:'#a16207', text:'연한 도래 — 교체 준비 필요' } }
                    return <div style={{ gridColumn:'1/3', marginTop:2, fontWeight:700, color: s[rs].color, fontSize:10 }}>{s[rs].text}</div>
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
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

  return (
    <>
      {viewerUrl && <PhotoViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />}
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:98, background:'rgba(0,0,0,0.4)' }} />
      <div style={{ position:'fixed', bottom:NAV_BOTTOM, left:0, right:0, zIndex:99, background:'var(--bg)', borderRadius:'16px 16px 0 0', borderTop:'1px solid var(--bd)', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)', display:'flex', flexDirection:'column', maxHeight:'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 54px)' }}>
        <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>조치 결과</div>
          <button onClick={onClose} style={{ padding:'4px 10px', borderRadius:8, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, cursor:'pointer' }}>닫기</button>
        </div>
        {cp && (
          <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16 }}>{resultOpt.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{cp.location}</div>
              <div style={{ fontSize:10, color:'var(--t3)' }}>{cp.floor} · {cp.category}</div>
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:resultOpt.color, background:resultOpt.bg, padding:'2px 8px', borderRadius:20 }}>{resultOpt.label}</span>
          </div>
        )}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {/* 점검 시 */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em', textAlign:'center' }}>📋 점검 시</div>
              {item.photoKey ? (
                <div onClick={() => setViewerUrl(`/api/uploads/${item.photoKey}`)} style={{ width:'100%', aspectRatio:'1/1', borderRadius:10, overflow:'hidden', cursor:'pointer', marginBottom:6 }}>
                  <img src={`/api/uploads/${item.photoKey}`} alt="점검사진" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                </div>
              ) : (
                <div style={{ width:'100%', aspectRatio:'1/1', borderRadius:10, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:6, border:'1px solid var(--bd)' }}>
                  <span style={{ fontSize:10, color:'var(--t3)' }}>사진 없음</span>
                </div>
              )}
              <div style={{ background:'var(--bg2)', borderRadius:8, padding:'7px 9px', border:'1px solid var(--bd)', fontSize:11 }}>
                <div style={{ color:'var(--t3)', marginBottom:2, fontSize:10 }}>특이사항</div>
                <div style={{ color: item.memo ? 'var(--t1)' : 'var(--t3)' }}>{item.memo || '없음'}</div>
                {item.checkedAt && <div style={{ fontSize:9.5, color:'var(--t3)', marginTop:4 }}>{fmtKstLocaleString(item.checkedAt)}</div>}
              </div>
            </div>
            {/* 조치 후 */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--safe)', marginBottom:6, letterSpacing:'0.05em', textAlign:'center' }}>🔧 조치 후</div>
              {item.resolutionPhotoKey ? (
                <div onClick={() => setViewerUrl(`/api/uploads/${item.resolutionPhotoKey}`)} style={{ width:'100%', aspectRatio:'1/1', borderRadius:10, overflow:'hidden', cursor:'pointer', marginBottom:6 }}>
                  <img src={`/api/uploads/${item.resolutionPhotoKey}`} alt="조치사진" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                </div>
              ) : (
                <div style={{ width:'100%', aspectRatio:'1/1', borderRadius:10, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:6, border:'1px solid var(--bd)' }}>
                  <span style={{ fontSize:10, color:'var(--t3)' }}>사진 없음</span>
                </div>
              )}
              <div style={{ background:'var(--bg2)', borderRadius:8, padding:'7px 9px', border:'1px solid var(--bd)', fontSize:11 }}>
                <div style={{ color:'var(--t3)', marginBottom:2, fontSize:10 }}>조치 내용</div>
                <div style={{ color:'var(--t1)', marginBottom:4 }}>{item.resolutionMemo || '없음'}</div>
                {item.resolvedAt && <div style={{ fontSize:9.5, color:'var(--t3)' }}>{fmtKstLocaleString(item.resolvedAt)}</div>}
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
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.96)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <img src={url} alt="사진" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} onClick={e => e.stopPropagation()} />
      <button onClick={onClose} style={{ position:'absolute', top:'calc(var(--sat, 0px) + 14px)', right:16, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.18)', border:'none', color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
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

  return (
    <>
      {viewerUrl && <PhotoViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />}

      {/* 백드롭 */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:98, background:'rgba(0,0,0,0.4)' }} />

      {/* 하단 시트 */}
      <div style={{
        position:'fixed', bottom:NAV_BOTTOM, left:0, right:0,
        zIndex:99,
        background:'var(--bg)', borderRadius:'16px 16px 0 0',
        borderTop:'1px solid var(--bd)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)',
        display:'flex', flexDirection:'column',
        maxHeight:'84vh',
      }}>
        {/* 헤더 */}
        <div style={{ padding:'14px 16px 12px', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginBottom: cp ? 8 : 0 }}>조치 입력</div>
            {cp && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'var(--bg2)', borderRadius:10, border:`1px solid ${resultOpt.color}33` }}>
                <span style={{ fontSize:16 }}>{resultOpt.icon}</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--t1)' }}>{cp.location}</div>
                  <div style={{ fontSize:10, color:'var(--t3)' }}>{cp.floor} · {cp.category}</div>
                </div>
                <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, color:resultOpt.color, background:resultOpt.bg, padding:'2px 8px', borderRadius:20 }}>{resultOpt.label}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ padding:'4px 10px', borderRadius:8, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, cursor:'pointer', flexShrink:0 }}>닫기</button>
        </div>

        {/* 점검 사진 썸네일 (있을 때만) — 특이사항 좌측 + 증빙사진 우측 */}
        {item.photoKey && (
          <div style={{ flexShrink:0, padding:'14px 16px 4px', display:'flex', alignItems:'flex-start', gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, fontWeight:600, color:item.result==='bad'?'var(--danger)':'var(--warn)', marginBottom:4 }}>
                {item.result === 'bad' ? '🔴 불량' : '🟡 주의'} 특이사항
              </div>
              <div style={{ height:72, overflowY:'auto', background:'var(--bg2)', borderRadius:8, padding:'8px 10px', border:'1px solid var(--bd)', fontSize:11 }}>
                {item.memo
                  ? <span style={{ color:'var(--t2)' }}>{item.memo}</span>
                  : <span style={{ color:'var(--t3)' }}>없음</span>
                }
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0, alignItems:'center' }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)' }}>증빙 사진</div>
              <div onClick={() => setViewerUrl(`/api/uploads/${item.photoKey}`)} style={{ width:72, height:72, borderRadius:10, overflow:'hidden', cursor:'pointer', border:'1px solid var(--bd)' }}>
                <img src={`/api/uploads/${item.photoKey}`} alt="점검사진" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              </div>
            </div>
          </div>
        )}

        {/* 내용 (스크롤 가능) */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>조치 내용 *</label>
            <span style={{ fontSize:10, color:'var(--t3)' }}>조치 후 사진 (선택)</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="어떻게 조치했는지 입력하세요"
              style={{ flex:1, height:72, padding:'10px 12px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:13, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
            />
            <PhotoButton hook={photo} label="촬영" />
          </div>

          {error && <div style={{ marginTop:8, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:8, padding:'8px 12px', fontSize:11, color:'var(--danger)' }}>{error}</div>}
        </div>

        {/* 버튼 */}
        <div style={{ padding:'10px 16px 14px', borderTop:'1px solid var(--bd)', display:'flex', gap:8, flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:13, fontWeight:600, cursor:'pointer' }}>취소</button>
          <button
            onClick={handleResolve}
            disabled={submitting || photo.uploading || !memo.trim()}
            style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading||!memo.trim() ? 'var(--bd2)' : 'linear-gradient(135deg,#16a34a,#22c55e)', color: submitting||photo.uploading||!memo.trim() ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading||!memo.trim() ? 'default' : 'pointer', transition:'all .13s' }}
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
  const routeLocation = useLocation()
  const qrCheckpoint = (routeLocation.state as any)?.qrCheckpoint as CheckPoint | undefined

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
  const wkAutoRef = useRef(false)
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
    }).catch(() => setLoading(false))
  }, []) // eslint-disable-line

  // 30초마다 폴링 (타 직원 기록 실시간 반영)
  useEffect(() => {
    const id = setInterval(loadTodayRecords, 10_000)
    return () => clearInterval(id)
  }, [loadTodayRecords])

  // 완강기 카테고리 선택 시 접근불가 개소 자동 정상처리 (1회)
  useEffect(() => {
    if (selectedGroupIdx === null || wkAutoRef.current || allCheckpoints.length === 0) return
    if (!CATEGORY_GROUPS[selectedGroupIdx].categories.includes('완강기')) return

    const inaccessible = allCheckpoints.filter(
      cp => cp.category === '완강기' && cp.description === '접근불가' && !records[cp.id]
    )
    if (inaccessible.length === 0) { wkAutoRef.current = true; return }

    wkAutoRef.current = true
    ;(async () => {
      try {
        const sid = await ensureSession()
        await Promise.all(
          inaccessible.map(cp =>
            inspectionApi.submitRecord(sid, {
              checkpointId: cp.id,
              result: 'normal',
              memo: '접근불가 개소 자동 정상처리',
            })
          )
        )
        loadTodayRecords()
      } catch { wkAutoRef.current = false }
    })()
  }, [selectedGroupIdx, allCheckpoints]) // eslint-disable-line

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
    <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', paddingBottom:80 }}>
        {syncedAt && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
            <span style={{ fontSize:10, color:'var(--t3)' }}>
              동기화 {syncedAt.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
          </div>
        )}

        {/* 오늘 점검 현황 */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
          <div onClick={() => recordCount > 0 && setShowTodayDetail(p => !p)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor: recordCount > 0 ? 'pointer' : 'default' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>오늘 점검 현황</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {recordCount > 0 && <div style={{ fontSize:11, fontWeight:700, color:'var(--safe)', background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.25)', borderRadius:20, padding:'2px 9px' }}>{recordCount}건 완료</div>}
              {recordCount > 0 && <span style={{ color:'var(--t3)', fontSize:11 }}>{showTodayDetail ? '▲' : '▼'}</span>}
            </div>
          </div>

          {recordCount === 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 0 2px', color:'var(--t3)' }}>
              <span style={{ fontSize:20 }}>📋</span>
              <span style={{ fontSize:12 }}>아직 점검 기록이 없습니다</span>
            </div>
          )}

          {recordCount > 0 && !showTodayDetail && (
            <>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
                {categoryStats.map(s => (
                  <div key={s.idx} style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:8, padding:'3px 8px' }}>
                    <span style={{ fontSize:11 }}>{s.group.icon}</span>
                    <span style={{ fontSize:11, color:'var(--t1)', fontWeight:600 }}>{s.group.labels[0]}</span>
                    <span style={{ fontSize:10, color:'var(--safe)', fontWeight:700 }}>{s.done}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', flexWrap:'nowrap', gap:3, marginTop:6, overflowX:'auto' }}>
                {[
                  { icon:'✅', label:'정상', val:resultStats.normal,     color:'var(--safe)',   bg:'rgba(34,197,94,.1)',  border:'rgba(34,197,94,.3)'  },
                  { icon:'⚠️', label:'주의', val:resultStats.caution,    color:'var(--warn)',   bg:'rgba(245,158,11,.1)', border:'rgba(245,158,11,.3)' },
                  { icon:'❌', label:'불량', val:resultStats.bad,        color:'var(--danger)', bg:'rgba(239,68,68,.1)',  border:'rgba(239,68,68,.3)'  },
                ].map(({ icon, label, val, color, bg, border }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:3, background:bg, border:`1px solid ${border}`, borderRadius:20, padding:'1px 6px', flexShrink:0 }}>
                    <span style={{ fontSize:9 }}>{icon}</span>
                    <span style={{ fontSize:9, color, fontWeight:700 }}>{label} {val}</span>
                  </div>
                ))}
                <span style={{ fontSize:9, color:'var(--t3)', alignSelf:'center', flexShrink:0, padding:'0 1px' }}>—</span>
                {[
                  { icon:'🔧', label:'미조치', val:unresolvedItems.length, color:'var(--fire)',  bg:'rgba(249,115,22,.1)', border:'rgba(249,115,22,.3)' },
                  { icon:'✓',  label:'조치완',  val:resolvedItems.length,   color:'#3b82f6', bg:'rgba(59,130,246,.08)', border:'rgba(59,130,246,.25)' },
                ].map(({ icon, label, val, color, bg, border }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:3, background:bg, border:`1px solid ${border}`, borderRadius:20, padding:'1px 6px', flexShrink:0 }}>
                    <span style={{ fontSize:9 }}>{icon}</span>
                    <span style={{ fontSize:9, color, fontWeight:700 }}>{label} {val}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {showTodayDetail && (
            <div style={{ marginTop:10 }}>
              {/* 미조치 항목 */}
              {unresolvedItems.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:13 }}>🔧</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--danger)' }}>미조치 항목</span>
                    <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:'var(--danger)', borderRadius:20, padding:'1px 7px' }}>{unresolvedItems.length}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {unresolvedItems.map(item => {
                      const opt = ALL_RESULT_OPTIONS.find(o => o.value === item.result)!
                      return (
                        <div key={item.cpId} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(239,68,68,.06)', borderRadius:10, border:`1px solid ${opt.color}33` }}>
                          <span style={{ fontSize:13, flexShrink:0 }}>{opt.icon}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:11, fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.cp!.location}</div>
                            <div style={{ fontSize:10, color:'var(--t3)' }}>{item.cp!.floor} · {item.cp!.category}</div>
                          </div>
                          <button
                            onClick={() => setResolveTarget({ cpId: item.cpId, recordId: item.recordId, result: item.result, photoKey: item.photoKey, memo: item.memo })}
                            style={{ flexShrink:0, padding:'4px 9px', borderRadius:8, border:'1px solid var(--danger)', background:'rgba(239,68,68,.1)', color:'var(--danger)', fontSize:11, fontWeight:700, cursor:'pointer' }}
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
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:13 }}>🔵</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'#3b82f6' }}>조치 완료 항목</span>
                    <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:'#3b82f6', borderRadius:20, padding:'1px 7px' }}>{resolvedItems.length}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {resolvedItems.map(item => {
                      const opt = ALL_RESULT_OPTIONS.find(o => o.value === item.result)!
                      return (
                        <div key={item.cpId} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(59,130,246,.06)', borderRadius:10, border:'1px solid rgba(59,130,246,.2)' }}>
                          <span style={{ fontSize:13, flexShrink:0 }}>{opt.icon}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:11, fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.cp!.location}</div>
                            <div style={{ fontSize:10, color:'var(--t3)' }}>{item.cp!.floor} · {item.cp!.category}</div>
                          </div>
                          <button
                            onClick={() => setDetailTarget({ cpId: item.cpId })}
                            style={{ flexShrink:0, padding:'4px 9px', borderRadius:8, border:'1px solid rgba(59,130,246,.4)', background:'rgba(59,130,246,.1)', color:'#3b82f6', fontSize:11, fontWeight:700, cursor:'pointer' }}
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
                <div style={{ marginTop: unresolvedItems.length > 0 || resolvedItems.length > 0 ? 10 : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:13 }}>✅</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--safe)' }}>정상 항목</span>
                    <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:'var(--safe)', borderRadius:20, padding:'1px 7px' }}>{normalItems.length}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {normalItems.map(item => (
                      <div key={item.cpId} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:'rgba(34,197,94,.06)', borderRadius:10, border:'1px solid rgba(34,197,94,.18)' }}>
                        <span style={{ fontSize:13, flexShrink:0 }}>✅</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.cp!.location}</div>
                          <div style={{ fontSize:10, color:'var(--t3)' }}>{item.cp!.floor} · {item.cp!.category}</div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, color:'var(--safe)', flexShrink:0 }}>정상</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unresolvedItems.length === 0 && resolvedItems.length === 0 && normalItems.length === 0 && (
                <div style={{ textAlign:'center', padding:'8px 0', color:'var(--t3)', fontSize:12 }}>점검 항목 없음</div>
              )}
            </div>
          )}
        </div>

        {/* 카테고리 그리드 */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:'var(--t3)', fontSize:13 }}>체크포인트 불러오는 중...</div>
        ) : (
          <>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8, letterSpacing:'0.05em' }}>점검 항목 선택</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
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
                return (
                  <div key={idx} onClick={() => {
                    if (g.categories.includes('화재수신반')) { setShowFireAlarm(true); return }
                    if (hasItems) setSelectedGroupIdx(idx)
                  }} style={{ background: allDone ? 'rgba(34,197,94,.08)' : g.color, border:`1px solid ${allDone ? 'rgba(34,197,94,.35)' : g.border}`, borderRadius:12, padding:'11px 8px', display:'flex', alignItems:'flex-start', gap:6, cursor: hasItems ? 'pointer' : 'default', opacity: hasItems ? 1 : 0.38, transition:'all .13s', minHeight:86, boxSizing:'border-box' }}>
                    <span style={{ fontSize:16, lineHeight:1.3, flexShrink:0 }}>{g.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      {g.labels.map(l => <div key={l} style={{ fontSize:10, fontWeight:600, color:'var(--t1)', lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l}</div>)}
                      <div style={{ fontSize:10, marginTop:2, color: allDone ? 'var(--safe)' : doneCnt > 0 ? 'var(--warn)' : 'var(--t3)' }}>
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

  const lbl: React.CSSProperties = { fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:6, display:'block' }
  const inp: React.CSSProperties = { width:'100%', boxSizing:'border-box' as const, padding:'10px 12px', borderRadius:9, border:'1px solid var(--bd)', background:'var(--bg)', color:'var(--t1)', fontSize:13, outline:'none', fontFamily:'inherit', minWidth:0, WebkitAppearance:'none', appearance:'none' }

  return (
    <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* 헤더 */}
      <div style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>🔔</span>
        <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>화재수신반 기록</span>
      </div>

      {/* 스크롤 본문 */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 16px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* 구분 */}
          <div>
            <label style={lbl}>구분</label>
            <div style={{ display:'flex', gap:8 }}>
              {([['fire','화재보'],['non_fire','비화재보']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setType(v)}
                  style={{
                    flex:1, padding:'10px 0', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer',
                    border: type===v ? '2px solid #ef4444' : '1px solid var(--bd)',
                    background: type===v ? 'rgba(239,68,68,0.12)' : 'var(--bg3)',
                    color: type===v ? '#ef4444' : 'var(--t2)',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 발생일시 */}
          <div>
            <label style={lbl}>발생일시</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ ...inp, display:'block', marginBottom:6, height:44 }} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ ...inp, display:'block', height:44 }} />
          </div>

          {/* 발생장소 */}
          <div>
            <label style={lbl}>발생장소</label>
            <textarea value={location} onChange={e => setLocation(e.target.value)}
              placeholder="발생장소를 입력하세요" rows={2}
              style={{ ...inp, resize:'none', lineHeight:1.5 }} />
          </div>

          {/* 발생원인 */}
          <div>
            <label style={lbl}>발생원인</label>
            <textarea value={cause} onChange={e => setCause(e.target.value)}
              rows={2} style={{ ...inp, resize:'none', lineHeight:1.5 }} />
          </div>

          {/* 조치사항 */}
          <div>
            <label style={lbl}>조치사항</label>
            <textarea value={action} onChange={e => setAction(e.target.value)}
              rows={2} style={{ ...inp, resize:'none', lineHeight:1.5 }} />
          </div>
        </div>
      </div>

      {/* 하단 버튼 바 */}
      <div style={{ padding:'10px 14px 12px', background:'var(--bg2)', borderTop:'1px solid var(--bd)', flexShrink:0, display:'flex', gap:8 }}>
        <button onClick={onClose}
          style={{ padding:'12px 18px', borderRadius:12, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          닫기
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex:1, padding:14, borderRadius:12, border:'none', background: saving ? 'var(--bd)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)', color:'#fff', fontSize:15, fontWeight:700, cursor: saving ? 'default' : 'pointer', boxShadow: saving ? 'none' : '0 2px 8px rgba(37,99,235,0.3)' }}>
          {saving ? '저장 중...' : '점검 기록 저장'}
        </button>
      </div>
    </div>
  )
}

// ── 써머리 카드 ────────────────────────────────────────────
const ZONE_LBL: Record<string, string> = { office: '사무동', research: '연구동', common: '공용' }

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

      const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', common: '공용' }
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
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 6, scrollbarWidth: 'none' }}>
        {photos.map((p, i) => (
          <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
            <img src={`/api/uploads/${p.key}`} alt={p.label}
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: `2px solid ${color}`, cursor: 'pointer', display: 'block' }}
              onClick={() => downloadPhoto(p.key, `${p.label}.jpg`)}
              title="클릭하여 다운로드"
            />
          </div>
        ))}
      </div>
    )
  }

  if (filteredRecords.length === 0 && schedDates.length === 0) return null

  return (
    <div id={`summary-card-${categoryIdx}`} style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{group.icon} {schedTitle}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>점검일: {schedDateLabel} · 총 {filteredRecords.length}건</div>
          {schedInfos.map((s, i) => s.memo && (
            <div key={i} style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
              {schedInfos.length > 1 && <span style={{ fontWeight: 600, color: 'var(--t2)' }}>[{s.title}]</span>}{schedInfos.length > 1 ? '\n' : ''}{s.memo}
            </div>
          ))}
        </div>
        <button onClick={downloadReport} style={{ fontSize: 11, fontWeight: 700, height: 30, background: 'var(--bg3)', borderRadius: 7, padding: '0 12px', border: '1px solid var(--bd)', color: 'var(--t1)', cursor: 'pointer' }}>
          보고서 다운로드
        </button>
      </div>

      {/* 정상 / 주의 / 불량 박스 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {/* 정상 */}
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--safe)' }}>정상</span>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono,monospace', color: 'var(--safe)' }}>{normalRecs.length}</span>
          </div>
          {photoRow(normalPhotos, 'rgba(34,197,94,0.5)')}
        </div>

        {/* 주의 */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warn)' }}>주의</span>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono,monospace', color: 'var(--warn)' }}>{cautionRecs.length}</span>
          </div>
          {cautionRecs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {cautionRecs.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.3 }}>
                  <span style={{ fontWeight: 600 }}>{ZONE_LBL[r.zone] ?? r.zone} {r.floor}</span>{r.location ? ` · ${r.location}` : ''}
                  {r.memo && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.memo.split('\n')[0]}</div>}
                </div>
              ))}
            </div>
          )}
          {photoRow(cautionPhotos, 'rgba(245,158,11,0.5)')}
        </div>

        {/* 불량 */}
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)' }}>불량</span>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono,monospace', color: 'var(--danger)' }}>{badRecs.length}</span>
          </div>
          {badRecs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {badRecs.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.3 }}>
                  <span style={{ fontWeight: 600 }}>{ZONE_LBL[r.zone] ?? r.zone} {r.floor}</span>{r.location ? ` · ${r.location}` : ''}
                  {r.memo && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.memo.split('\n')[0]}</div>}
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

  const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', common: '공용' }
  const fmtDate = fmtKstDate
  const fmtDateTime = fmtKstDateTime

  return (
    <div style={{ flex:1, minHeight:0, display:'flex', overflow:'hidden', background:'var(--bg)' }}>

      {/* ── 좌측: 카테고리 카드 ── */}
      <div style={{ width:'50%', flexShrink:0, minWidth:0, borderRight:'1px solid var(--bd)', display:'flex', flexDirection:'column' }}>
        <div style={{ flexShrink:0, padding:'12px 20px', borderBottom:'1px solid var(--bd)', background:'var(--bg2)', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)', flex:1 }}>점검 항목</span>
          <span style={{ fontSize:11, color:'var(--t3)' }}>{dateFilter === -1 ? '이번달' : dateFilter === 0 ? '전체' : `최근 ${dateFilter}일`}</span>
          <div style={{ display:'flex', gap:4 }}>
            {PERIOD_BUTTONS.map(b => (
              <button key={b.value} onClick={() => setDateFilter(b.value)}
                style={{ padding:'4px 10px', borderRadius:6, border:'none',
                  background: dateFilter === b.value ? 'var(--acl)' : 'var(--bg3)',
                  color: dateFilter === b.value ? '#fff' : 'var(--t3)',
                  fontSize:10, fontWeight:700, cursor:'pointer' }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'14px 18px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:10 }}>
            {CATEGORY_GROUPS.map((g, idx) => {
              const c = groupCounts[idx]
              const isSel = categoryIdx === idx
              return (
                <div key={idx}
                  onClick={() => { setCategoryIdx(idx); setRecordId(null) }}
                  style={{
                    background: isSel ? 'rgba(59,130,246,.18)' : g.color,
                    border: '2px solid ' + (isSel ? 'var(--acl)' : g.border),
                    borderRadius: 12, padding: '12px 10px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 6, minHeight: 100,
                    transition: 'background-color .12s',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:18, lineHeight:1 }}>{g.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      {g.labels.map(l => <div key={l} style={{ fontSize:11, fontWeight:700, color:'var(--t1)', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l}</div>)}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:4, marginTop:'auto' }}>
                    {/* 좌하단: 이슈 없음 또는 불량/주의 */}
                    <div style={{ display:'flex', gap:3, flexWrap:'wrap', flex:1, minWidth:0 }}>
                      {c.bad === 0 && c.caution === 0 ? (
                        <span style={{ fontSize:10, color:'var(--t3)' }}>이슈 없음</span>
                      ) : (
                        <>
                          {c.bad > 0 && <span style={{ fontSize:10, fontWeight:700, color:'var(--danger)', background:'rgba(239,68,68,.13)', padding:'2px 6px', borderRadius:5 }}>불량 {c.bad}</span>}
                          {c.caution > 0 && <span style={{ fontSize:10, fontWeight:700, color:'var(--warn)', background:'rgba(245,158,11,.13)', padding:'2px 6px', borderRadius:5 }}>주의 {c.caution}</span>}
                        </>
                      )}
                    </div>
                    {/* 우하단: 점검 완료 개소 수 */}
                    {c.completed > 0 && (
                      <span style={{ fontSize:10, fontWeight:700, color:'var(--safe)', background:'rgba(34,197,94,.10)', padding:'2px 6px', borderRadius:5, flexShrink:0 }}>
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
      <div style={{ width:'50%', flexShrink:0, minWidth:0, display:'flex', flexDirection:'column' }}>
        {recordId && detail ? (
          // ── 상세 보기 ──
          <>
            <div style={{ flexShrink:0, padding:'12px 20px', borderBottom:'1px solid var(--bd)', background:'var(--bg2)', display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => setRecordId(null)}
                style={{ width:32, height:32, borderRadius:7, background:'var(--bg3)', border:'1px solid var(--bd)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)', flex:1 }}>조치 상세</span>
              <button onClick={() => navigate('/remediation/' + recordId)}
                style={{ padding:'5px 12px', borderRadius:7, background:'var(--bg3)', border:'1px solid var(--bd)', color:'var(--t2)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                전체 화면 열기
              </button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)', marginBottom:4 }}>{(detail as any).category}</div>
              <div style={{ fontSize:11, color:'var(--t3)', marginBottom:14 }}>{ZONE_LABEL[(detail as any).zone] ?? (detail as any).zone} {(detail as any).floor}{(detail as any).location ? ` · ${(detail as any).location}` : ''}</div>

              <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:18 }}>
                <tbody>
                  {[
                    ['점검일시', fmtDateTime((detail as any).checkedAt)],
                    ['점검자',   (detail as any).staffName ?? '-'],
                    ['판정',     null],
                    ['상태',     null],
                    ['메모',     (detail as any).memo ?? '-'],
                  ].map(([label, value], i) => (
                    <tr key={i}>
                      <th style={{ width:90, padding:'7px 10px', background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:700, color:'var(--t2)', textAlign:'left', verticalAlign:'top' }}>{label}</th>
                      <td style={{ padding:'7px 10px', border:'1px solid var(--bd)', fontSize:12, color:'var(--t1)', whiteSpace:'pre-wrap', verticalAlign:'top' }}>
                        {label === '판정' ? (
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:5,
                            background: (detail as any).result === 'bad' ? 'rgba(239,68,68,.13)' : 'rgba(245,158,11,.13)',
                            color: (detail as any).result === 'bad' ? 'var(--danger)' : 'var(--warn)' }}>
                            {(detail as any).result === 'bad' ? '불량' : '주의'}
                          </span>
                        ) : label === '상태' ? (
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:5,
                            background: (detail as any).status === 'open' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.13)',
                            color: (detail as any).status === 'open' ? 'var(--danger)' : 'var(--safe)' }}>
                            {(detail as any).status === 'open' ? '미조치' : '조치완료'}
                          </span>
                        ) : value as string}
                      </td>
                    </tr>
                  ))}
                  {(detail as any).status === 'resolved' && (
                    <>
                      <tr>
                        <th style={{ width:90, padding:'7px 10px', background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:700, color:'var(--t2)', textAlign:'left' }}>조치일시</th>
                        <td style={{ padding:'7px 10px', border:'1px solid var(--bd)', fontSize:12, color:'var(--t1)' }}>{fmtDateTime((detail as any).resolvedAt)}</td>
                      </tr>
                      <tr>
                        <th style={{ width:90, padding:'7px 10px', background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:700, color:'var(--t2)', textAlign:'left' }}>조치자</th>
                        <td style={{ padding:'7px 10px', border:'1px solid var(--bd)', fontSize:12, color:'var(--t1)' }}>{(detail as any).resolvedBy ?? '-'}</td>
                      </tr>
                      <tr>
                        <th style={{ width:90, padding:'7px 10px', background:'var(--bg3)', border:'1px solid var(--bd)', fontSize:11, fontWeight:700, color:'var(--t2)', textAlign:'left' }}>조치 내용</th>
                        <td style={{ padding:'7px 10px', border:'1px solid var(--bd)', fontSize:12, color:'var(--t1)', whiteSpace:'pre-wrap' }}>{(detail as any).resolutionMemo ?? '-'}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* 사진 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={{ border:'1px solid var(--bd)', borderRadius:10, padding:10, background:'var(--bg2)' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:6 }}>📷 조치 전</div>
                  {(detail as any).photoKey ? (
                    <img src={'/api/uploads/' + (detail as any).photoKey} alt="조치 전" style={{ width:'100%', maxHeight:240, objectFit:'contain', borderRadius:6, background:'#000' }} />
                  ) : (
                    <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:11 }}>사진 없음</div>
                  )}
                </div>
                <div style={{ border:'1px solid var(--bd)', borderRadius:10, padding:10, background:'var(--bg2)' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:6 }}>📷 조치 후</div>
                  {(detail as any).resolutionPhotoKey ? (
                    <img src={'/api/uploads/' + (detail as any).resolutionPhotoKey} alt="조치 후" style={{ width:'100%', maxHeight:240, objectFit:'contain', borderRadius:6, background:'#000' }} />
                  ) : (
                    <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:11 }}>{(detail as any).status === 'open' ? '아직 조치 전' : '사진 없음'}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : categoryIdx !== null ? (
          // ── 카테고리 내역 목록 ──
          <>
            <div style={{ flexShrink:0, padding:'12px 20px', borderBottom:'1px solid var(--bd)', background:'var(--bg2)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18, lineHeight:1 }}>{CATEGORY_GROUPS[categoryIdx].icon}</span>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)', flex:1 }}>{CATEGORY_GROUPS[categoryIdx].labels.join(', ')}</span>
              <button onClick={() => setExcludeNormal(!excludeNormal)}
                style={{ padding:'4px 10px', borderRadius:6, border:'1px solid ' + (excludeNormal ? 'var(--acl)' : 'var(--bd)'),
                  background: excludeNormal ? 'rgba(59,130,246,.13)' : 'var(--bg3)',
                  color: excludeNormal ? 'var(--acl)' : 'var(--t3)',
                  fontSize:10, fontWeight:700, cursor:'pointer' }}>
                {excludeNormal ? '✓ 정상 제외' : '정상 제외'}
              </button>
              <span style={{ fontSize:11, color:'var(--t3)' }}>{categoryRecords.length}건</span>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'14px 18px' }}>
              {/* 써머리 카드 */}
              <InspectionSummaryCard categoryIdx={categoryIdx} allRecords={allRecords} />
              {isLoading ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t3)', fontSize:12 }}>불러오는 중...</div>
              ) : categoryRecords.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t3)', fontSize:12 }}>점검 내역이 없습니다</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {categoryRecords.map(r => {
                    const isIssue = r.result === 'bad' || r.result === 'caution'
                    const isResolved = isIssue && r.status === 'resolved'
                    const borderColor = isResolved ? '#3b82f6' : r.result === 'bad' ? 'var(--danger)' : r.result === 'caution' ? 'var(--warn)' : 'var(--safe)'
                    return (
                    <div key={r.id}
                      onClick={() => isIssue && setRecordId(r.id)}
                      style={{
                        background:'var(--bg2)',
                        border:'1px solid var(--bd)',
                        borderLeft: `4px solid ${borderColor}`,
                        borderRadius:10, padding:'10px 12px', cursor: isIssue ? 'pointer' : 'default',
                        display:'flex', flexDirection:'column', gap:3,
                      }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)', flex:1 }}>{r.category}</span>
                        <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:5,
                          background: r.result === 'bad' ? 'rgba(239,68,68,.13)' : r.result === 'caution' ? 'rgba(245,158,11,.13)' : 'rgba(34,197,94,.13)',
                          color: r.result === 'bad' ? 'var(--danger)' : r.result === 'caution' ? 'var(--warn)' : 'var(--safe)' }}>
                          {r.result === 'bad' ? '불량' : r.result === 'caution' ? '주의' : '정상'}
                        </span>
                        {isIssue && (
                          <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:5,
                            background: r.status === 'open' ? 'rgba(249,115,22,.15)' : 'rgba(59,130,246,.13)',
                            color: r.status === 'open' ? 'var(--danger)' : '#3b82f6' }}>
                            {r.status === 'open' ? '미조치' : '조치완료'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:11, color:'var(--t2)' }}>
                        {(ZONE_LABEL[r.zone] ?? r.zone)} {r.floor}{r.location ? ` · ${r.location}` : ''}
                      </div>
                      {r.memo && <div style={{ fontSize:11, color:'var(--t3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.memo.split('\n')[0]}</div>}
                      <div style={{ fontSize:10, color:'var(--t3)' }}>{fmtDate(r.checkedAt)}</div>
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', fontSize:13 }}>
            좌측에서 점검 항목을 선택하세요
          </div>
        )}
      </div>
    </div>
  )
}
