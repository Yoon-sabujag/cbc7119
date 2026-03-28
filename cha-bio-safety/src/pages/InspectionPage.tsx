import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { inspectionApi } from '../utils/api'
import { compressImage } from '../utils/imageUtils'
import type { CheckPoint, CheckResult, Floor } from '../types'

// ── 사진 업로드 훅 ─────────────────────────────────────
function usePhotoUpload() {
  const [photoBlob,     setPhotoBlob]     = useState<Blob | null>(null)
  const [photoPreview,  setPhotoPreview]  = useState<string | null>(null)
  const [uploading,     setUploading]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const pickPhoto = () => inputRef.current?.click()

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // 입력 초기화 (같은 파일 재선택 허용)
    e.target.value = ''
    const blob = await compressImage(file)
    setPhotoBlob(blob)
    setPhotoPreview(URL.createObjectURL(blob))
  }, [])

  const removePhoto = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoBlob(null)
    setPhotoPreview(null)
  }, [photoPreview])

  // 업로드 → photo_key 반환
  const upload = useCallback(async (): Promise<string | null> => {
    if (!photoBlob) return null
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', photoBlob, 'photo.jpg')
      const res  = await fetch('/api/uploads', {
        method: 'POST',
        body:   form,
        headers: { Authorization: `Bearer ${(await import('../stores/authStore')).useAuthStore.getState().token}` },
      })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      return json.success ? json.data!.key : null
    } finally {
      setUploading(false)
    }
  }, [photoBlob])

  const reset = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoBlob(null)
    setPhotoPreview(null)
  }, [photoPreview])

  return { inputRef, photoPreview, uploading, pickPhoto, handleFile, removePhoto, upload, reset, hasPhoto: !!photoBlob }
}

// ── 사진 버튼 UI ───────────────────────────────────────
function PhotoButton({ hook, label = '사진 첨부', noCapture }: { hook: ReturnType<typeof usePhotoUpload>; label?: string; noCapture?: boolean }) {
  return (
    <div>
      <input ref={hook.inputRef} type="file" accept="image/*" {...(noCapture ? {} : { capture:'environment' })} style={{ display:'none' }} onChange={hook.handleFile} />
      {hook.photoPreview ? (
        <div style={{ position:'relative', display:'inline-block' }}>
          <img src={hook.photoPreview} alt="첨부사진" style={{ width:72, height:72, objectFit:'cover', borderRadius:10, border:'1px solid var(--bd)', display:'block' }} />
          <button onClick={hook.removePhoto} style={{ position:'absolute', top:-6, right:-6, width:20, height:20, borderRadius:'50%', background:'var(--danger)', border:'none', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>✕</button>
          {hook.uploading && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>업로드 중</div>}
        </div>
      ) : (
        <button onClick={hook.pickPhoto} style={{ width:72, height:72, borderRadius:10, background:'var(--bg2)', border:'1px dashed var(--bd2)', color:'var(--t3)', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, flexShrink:0 }}>
          <span style={{ fontSize:22 }}>📷</span>{label}
        </button>
      )}
    </div>
  )
}

const NAV_BOTTOM = 'calc(54px + env(safe-area-inset-bottom, 20px))'

// ── 층 분류 ───────────────────────────────────────────
const GROUND_LIST: Floor[] = ['8F','7F','6F','5F','3F','2F','1F']
const UNDER_LIST:  Floor[] = ['B1','M','B2','B3','B4','B5']
const GROUND_SET   = new Set<Floor>(GROUND_LIST)
const UNDER_SET    = new Set<Floor>(UNDER_LIST)

// ── 카테고리 그룹 ──────────────────────────────────────
const CATEGORY_GROUPS: { labels:string[]; icon:string; color:string; border:string; categories:string[] }[] = [
  { labels:['특별피난계단','피난·방화시설','방화문'], icon:'🚪', color:'rgba(34,197,94,.12)',  border:'rgba(34,197,94,.3)',  categories:['특별피난계단'] },
  { labels:['청정소화약제'],                         icon:'☁️', color:'rgba(14,165,233,.12)', border:'rgba(14,165,233,.3)', categories:['청정소화약제'] },
  { labels:['전실제연댐퍼','연결송수관'],              icon:'💨', color:'rgba(100,116,139,.12)',border:'rgba(100,116,139,.3)',categories:['전실제연댐퍼','연결송수관'] },
  { labels:['주차장비','회전문'],                     icon:'🚗', color:'rgba(168,85,247,.12)', border:'rgba(168,85,247,.3)', categories:['주차장비','회전문'] },
  { labels:['소방용전원공급반'],                       icon:'⚡', color:'rgba(245,158,11,.12)', border:'rgba(245,158,11,.3)', categories:['소방용전원공급반'] },
  { labels:['방화셔터'],                              icon:'🔩', color:'rgba(239,68,68,.12)',  border:'rgba(239,68,68,.3)',  categories:['방화셔터'] },
  { labels:['DIV'],                                  icon:'📊', color:'rgba(245,158,11,.12)', border:'rgba(245,158,11,.3)', categories:['DIV'] },
  { labels:['유도등'],                               icon:'⬅️', color:'rgba(234,179,8,.12)',  border:'rgba(234,179,8,.3)',  categories:['유도등'] },
  { labels:['배연창'],                               icon:'🪟', color:'rgba(59,130,246,.12)', border:'rgba(59,130,246,.3)', categories:['배연창'] },
  { labels:['완강기'],                               icon:'🪢', color:'rgba(249,115,22,.12)', border:'rgba(249,115,22,.3)', categories:['완강기'] },
  { labels:['소화전','비상콘센트'],                    icon:'🔌', color:'rgba(59,130,246,.12)', border:'rgba(59,130,246,.3)', categories:['소화전','비상콘센트'] },
  { labels:['소화기'],                               icon:'🧯', color:'rgba(239,68,68,.12)',  border:'rgba(239,68,68,.3)',  categories:['소화기'] },
  { labels:['소방펌프'],                              icon:'💧', color:'rgba(14,165,233,.12)', border:'rgba(14,165,233,.3)', categories:['소방펌프'] },
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
function StairwellModal({ group, allCheckpoints, records, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload()
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
          <>
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
          </>
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

// ── 배연창 전용 모달 ─────────────────────────────────────
type BYZone = 'research' | 'office'
const BY_ZONE_LABELS: Record<BYZone, string> = { research:'연구동', office:'사무동' }
const BY_LOC_NO:     Record<BYZone, string> = { research:'BY-R',   office:'BY-O'   }
const BY_FLOOR_ORDER: Floor[] = ['8F','7F','6F','5F','3F','2F','1F']

function BaeyeonModal({ group, allCheckpoints, records, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload()
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
    zone ? allCheckpoints.filter(cp => cp.category === '배연창' && cp.locationNo === BY_LOC_NO[zone]) : [],
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
            const zCPs    = allCheckpoints.filter(cp => cp.category === '배연창' && cp.locationNo === BY_LOC_NO[z])
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
          <>
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
          </>
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
type DivPt = typeof DIV_PTS[number]

const DIV_PTS = [
  { floor: 9,  pos: 3, id: '9-3',  floorLabel: '8-1층', loc: '사) 8층 계단 위'     },
  { floor: 8,  pos: 1, id: '8-1',  floorLabel: '8층',   loc: '연) 8층 공조실'      },
  { floor: 8,  pos: 2, id: '8-2',  floorLabel: '8층',   loc: '연) 8층 PS실'        },
  { floor: 8,  pos: 3, id: '8-3',  floorLabel: '8층',   loc: '사) 8층 PS실'        },
  { floor: 7,  pos: 1, id: '7-1',  floorLabel: '7층',   loc: '연) 7층 공조실'      },
  { floor: 7,  pos: 2, id: '7-2',  floorLabel: '7층',   loc: '연) 7층 PS실'        },
  { floor: 7,  pos: 3, id: '7-3',  floorLabel: '7층',   loc: '사) 7층 PS실'        },
  { floor: 6,  pos: 1, id: '6-1',  floorLabel: '6층',   loc: '연) 6층 공조실'      },
  { floor: 6,  pos: 2, id: '6-2',  floorLabel: '6층',   loc: '연) 6층 PS실'        },
  { floor: 6,  pos: 3, id: '6-3',  floorLabel: '6층',   loc: '사) 6층 PS실'        },
  { floor: 5,  pos: 1, id: '5-1',  floorLabel: '5층',   loc: '연) 5층 공조실'      },
  { floor: 5,  pos: 2, id: '5-2',  floorLabel: '5층',   loc: '연) 5층 PS실'        },
  { floor: 5,  pos: 3, id: '5-3',  floorLabel: '5층',   loc: '사) 5층 PS실'        },
  { floor: 3,  pos: 1, id: '3-1',  floorLabel: '3층',   loc: '연) 3층 공조실'      },
  { floor: 3,  pos: 2, id: '3-2',  floorLabel: '3층',   loc: '연) 3층 PS실'        },
  { floor: 3,  pos: 3, id: '3-3',  floorLabel: '3층',   loc: '사) 3층 PS실'        },
  { floor: 2,  pos: 2, id: '2-2',  floorLabel: '2층',   loc: '연) 2층 PS실'        },
  { floor: 2,  pos: 3, id: '2-3',  floorLabel: '2층',   loc: '사) 2층 PS실'        },
  { floor: 1,  pos: 1, id: '1-1',  floorLabel: '1층',   loc: '연) 1층 공조실'      },
  { floor: 1,  pos: 2, id: '1-2',  floorLabel: '1층',   loc: '연) 1층 PS실'        },
  { floor: 1,  pos: 3, id: '1-3',  floorLabel: '1층',   loc: '사) 1층 PS실'        },
  { floor: -1, pos: 1, id: '-1-1', floorLabel: 'B1층',  loc: '지) B1층 공조실'     },
  { floor: -1, pos: 2, id: '-1-2', floorLabel: 'B1층',  loc: '지) B1층 화장실'     },
  { floor: -1, pos: 3, id: '-1-3', floorLabel: 'B1층',  loc: '지) B1층 식당 뒤'   },
  { floor: -2, pos: 1, id: '-2-1', floorLabel: 'B2층',  loc: '지) B2층 공조실'     },
  { floor: -2, pos: 2, id: '-2-2', floorLabel: 'B2층',  loc: '지) B2층 CPX실'      },
  { floor: -2, pos: 3, id: '-2-3', floorLabel: 'B2층',  loc: '지) B2층 PS실'       },
  { floor: -3, pos: 2, id: '-3-2', floorLabel: 'B3층',  loc: '지) B3층 팬룸'       },
  { floor: -3, pos: 3, id: '-3-3', floorLabel: 'B3층',  loc: '지) B3층 기사대기실' },
  { floor: -4, pos: 1, id: '-4-1', floorLabel: 'B4층',  loc: '지) B4층 팬룸'       },
  { floor: -4, pos: 2, id: '-4-2', floorLabel: 'B4층',  loc: '지) B4층 기계실'     },
  { floor: -4, pos: 3, id: '-4-3', floorLabel: 'B4층',  loc: '지) B4층 창고'       },
  { floor: -5, pos: 2, id: '-5-2', floorLabel: 'B5층',  loc: '지) B5층 1번팬룸'    },
  { floor: -5, pos: 3, id: '-5-3', floorLabel: 'B5층',  loc: '지) B5층 2번팬룸'    },
] as const

const DIV_LINE_SEQ: Record<number, number[]> = {
  1: [8, 7, 6, 5, 3, 1],
  2: [8, 7, 6, 5, 3, 1, 2],
  3: [9, 8, 7, 6, 5, 3, 2, 1],
}
const DIV_UNDER_SEQ = ['-1-1','-1-2','-1-3','-2-3','-2-1','-2-2','-3-2','-3-3','-4-1','-4-2','-4-3','-5-3','-5-2']

// DIV 측정점 floor → 점검 체크포인트 ID 매핑
const DIV_FLOOR_CP: Record<number, string> = {
   8: 'CP-8F-DIV-001',
   7: 'CP-7F-DIV-001',
   6: 'CP-6F-DIV-001',
   5: 'CP-5F-DIV-001',
   3: 'CP-3F-DIV-001',
   2: 'CP-2F-DIV-001',
   1: 'CP-1F-DIV-001',
  [-1]: 'CP-B1-DIV-001',
  [-2]: 'CP-B2-DIV-001',
  [-3]: 'CP-B3-DIV-001',
  [-4]: 'CP-B4-DIV-001',
  [-5]: 'CP-B5-DIV-001',
}

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
                        {hist.map((r: any, i: number) => (
                          <text key={i} x={spx(i)} y={sH-4} textAnchor="middle" fill="rgba(139,148,158,0.6)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                            {String(r.month).padStart(2,'0')}
                          </text>
                        ))}
                        <polyline
                          points={hist.map((r: any, i: number) => `${spx(i).toFixed(1)},${spy(r[key] ?? 0).toFixed(1)}`).join(' ')}
                          fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"
                          strokeDasharray={dashed ? '4 2' : undefined}
                        />
                        {hist.map((r: any, i: number) => {
                          const cx = spx(i), cy = spy(r[key] ?? center)
                          const vx = cx, vy = cy - 18
                          return (
                            <g key={i}>
                              <circle cx={cx} cy={cy} r={3} fill={color} />
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

function DivModal({ onClose, onSaveRecord }: {
  onClose: () => void
  onSaveRecord: (cpId: string, result: CheckResult, memo: string) => Promise<void>
}) {
  const staff = useAuthStore(s => s.staff)

  // ── 단계 선택 ──
  const [zone,         setZone]         = useState<DivZone|null>(null)
  const [line,         setLine]         = useState<number|null>(null)
  const [lineIdx,      setLineIdx]      = useState(0)
  const [underPending, setUnderPending] = useState<string[]>([...DIV_UNDER_SEQ])
  const [underPickIdx, setUnderPickIdx] = useState(0)

  // ── 압력 입력 (6 digit boxes) ──
  const [digits, setDigits] = useState<string[]>(['','','','','',''])
  const dRef0 = useRef<HTMLInputElement>(null)
  const dRef1 = useRef<HTMLInputElement>(null)
  const dRef2 = useRef<HTMLInputElement>(null)
  const dRef3 = useRef<HTMLInputElement>(null)
  const dRef4 = useRef<HTMLInputElement>(null)
  const dRef5 = useRef<HTMLInputElement>(null)
  const dRefs = useMemo(() => [dRef0,dRef1,dRef2,dRef3,dRef4,dRef5], [])

  // ── 부가 항목 ──
  const [drain,  setDrain]  = useState<'none'|'yes'>('none')
  const [oil,    setOil]    = useState<'sufficient'|'refill'>('sufficient')
  const [result, setResult] = useState<CheckResult>('normal')
  const [memo,   setMemo]   = useState('')
  const photo = usePhotoUpload()

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
        const sorted = (j.records ?? []).sort((a: any, b: any) =>
          b.year !== a.year ? b.year - a.year : b.month - a.month
        )
        setPrevRecords(sorted)
      })
      .catch(() => setPrevRecords([]))
  }, [currentPt?.id])

  // ── 자동 결과 판단 ──
  useEffect(() => {
    const p1 = digits[0] && digits[1] ? parseFloat(`${digits[0]}.${digits[1]}`) : null
    const p2 = digits[2] && digits[3] ? parseFloat(`${digits[2]}.${digits[3]}`) : null
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
    setDigits(['','','','','',''])
    setDrain('none')
    setOil('sufficient')
    setResult('normal')
    setMemo('')
    setAutoReason('')
    photo.reset()
  }, [photo])

  // ── 저장 ──
  const handleSave = async () => {
    if (!currentPt) return
    const p1 = digits[0] && digits[1] ? parseFloat(`${digits[0]}.${digits[1]}`) : null
    const p2 = digits[2] && digits[3] ? parseFloat(`${digits[2]}.${digits[3]}`) : null
    const p3 = digits[4] && digits[5] ? parseFloat(`${digits[4]}.${digits[5]}`) : null
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

      await fetch('/api/div/pressure', {
        method:'POST', headers: hdrs,
        body: JSON.stringify({
          location_no: currentPt.id,
          floor:       currentPt.floor,
          position:    currentPt.pos,
          year:        now.getFullYear(),
          month:       now.getMonth()+1,
          day:         now.getDate(),
          pressure_1:  p1,
          pressure_2:  p2,
          pressure_set: p3,
          result,
          drain,
          oil,
          memo:      memo || null,
          photo_key: photoKey ?? null,
          inspector: staff?.name ?? null,
        })
      })

      if (drain === 'yes') {
        await fetch('/api/div/logs', {
          method:'POST', headers: hdrs,
          body: JSON.stringify({ type:'drain', div_id:currentPt.id, date:today, staff_name:staff?.name })
        })
      }
      if (oil === 'refill') {
        await fetch('/api/div/logs', {
          method:'POST', headers: hdrs,
          body: JSON.stringify({ type:'compressor', div_id:currentPt.id, date:today, action:'오일보충', staff_name:staff?.name })
        })
      }

      // 점검 기록 연동 — 해당 층 체크포인트에 결과 반영
      const cpId = DIV_FLOOR_CP[currentPt.floor]
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
  const parsedP1 = digits[0] && digits[1] ? parseFloat(`${digits[0]}.${digits[1]}`) : null
  const parsedP2 = digits[2] && digits[3] ? parseFloat(`${digits[2]}.${digits[3]}`) : null
  const parsedP3 = digits[4] && digits[5] ? parseFloat(`${digits[4]}.${digits[5]}`) : null

  function diffTag(cur: number|null, ref: number|null, badIfUp: boolean) {
    if (cur === null || ref === null) return null
    const d = cur - ref
    if (Math.abs(d) < 0.05) return { text:'→0.0', color:'var(--t3)' }
    const isBad = badIfUp ? d > 0 : d < 0
    return { text:`${d > 0 ? '↑' : '↓'}${Math.abs(d).toFixed(1)}`, color: isBad ? 'var(--warn)' : 'var(--safe)' }
  }

  const handleDigit = (idx: number, val: string) => {
    const v = val.replace(/\D/g,'').slice(-1)
    const next = [...digits]; next[idx] = v; setDigits(next)
    if (v && idx < 5) setTimeout(() => dRefs[idx+1].current?.focus(), 30)
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

      {/* 본문 */}
      <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:14 }}>

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
                ? `${prev.month}월${prev.day ? (prev.day <= 15 ? '초' : '말') : ''}`
                : null
              const P_COLORS = ['#3b82f6', '#f97316', '#22c55e']
              const rows = [
                { label:'1차압', dIdx:0, prevVal: prev?.pressure_1   ?? null, diff:diffTag(parsedP1, prev?.pressure_1   ?? null, true),  color: P_COLORS[0] },
                { label:'2차압', dIdx:2, prevVal: prev?.pressure_2   ?? null, diff:diffTag(parsedP2, prev?.pressure_2   ?? null, false), color: P_COLORS[1] },
                { label:'세팅압', dIdx:4, prevVal: prev?.pressure_set ?? null, diff:diffTag(parsedP3, prev?.pressure_set ?? null, false), color: P_COLORS[2] },
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
                  {rows.map(({ label, dIdx, prevVal, diff, color }) => (
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
                      {/* 입력 박스 — flex:1 중앙 정렬, 소수점 고정 (초록선) */}
                      <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', gap:2 }}>
                        <input ref={dRefs[dIdx]} type="text" inputMode="decimal" pattern="[0-9]*" value={digits[dIdx]} maxLength={1}
                          onChange={e => handleDigit(dIdx, e.target.value)}
                          onKeyDown={e => handleDigitKey(dIdx, e)}
                          style={{ width:34, height:42, textAlign:'center', fontSize:20, fontWeight:700, borderRadius:8, border:`2px solid ${digits[dIdx] ? color : 'var(--bd)'}`, background:'var(--bg)', color, outline:'none', flexShrink:0 }} />
                        <span style={{ fontSize:18, fontWeight:700, color, flexShrink:0 }}>.</span>
                        <input ref={dRefs[dIdx+1]} type="text" inputMode="decimal" pattern="[0-9]*" value={digits[dIdx+1]} maxLength={1}
                          onChange={e => handleDigit(dIdx+1, e.target.value)}
                          onKeyDown={e => handleDigitKey(dIdx+1, e)}
                          style={{ width:34, height:42, textAlign:'center', fontSize:20, fontWeight:700, borderRadius:8, border:`2px solid ${digits[dIdx+1] ? color : 'var(--bd)'}`, background:'var(--bg)', color, outline:'none', flexShrink:0 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* 배수 / 오일 */}
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
                <div style={{ fontSize:11, fontWeight:600, color:'var(--t3)', marginBottom:8 }}>컴프 오일</div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setOil('sufficient')}
                    style={{ flex:1, padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background: oil==='sufficient' ? 'var(--bg)' : 'transparent', color: oil==='sufficient' ? 'var(--t1)' : 'var(--t3)', boxShadow: oil==='sufficient' ? '0 0 0 2px var(--primary)' : '0 0 0 1px var(--bd)', opacity: oil==='sufficient' ? 1 : 0.45 }}>충분함</button>
                  <button onClick={() => setOil('refill')}
                    style={{ flex:1, padding:'9px 0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background: oil==='refill' ? 'rgba(245,158,11,.18)' : 'transparent', color: oil==='refill' ? 'var(--warn)' : 'var(--t3)', boxShadow: oil==='refill' ? '0 0 0 2px var(--warn)' : '0 0 0 1px var(--bd)', opacity: oil==='refill' ? 1 : 0.45 }}>보충함</button>
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
          <button onClick={handleSave} disabled={saving || digits.some(d => d === '')}
            style={{ flex:1, padding:14, borderRadius:12, border:'none', background: (saving || digits.some(d=>d==='')) ? 'var(--bd)' : 'var(--primary)', color:'#fff', fontSize:15, fontWeight:700, cursor: saving ? 'default' : 'pointer' }}>
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
          records={[...prevRecords].sort((a: any, b: any) => a.year !== b.year ? a.year - b.year : a.month - b.month)}
          onClose={() => setShowTrend(false)}
        />
      )}
    </div>
  )
}

// ── 소방용전원공급반 전용 모달 ───────────────────────────
type PPZone = 'research' | 'office' | 'underground'
const PP_ZONE_LABELS: Record<PPZone, string> = { research:'연구동', office:'사무동', underground:'지하' }
const PP_ZONE_PREFIX: Record<PPZone, string> = { research:'PP-R', office:'PP-O', underground:'PP-U' }

function PowerPanelModal({ group, allCheckpoints, records, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload()
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
          <>
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
          </>
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
function ParkingGateModal({ group, allCheckpoints, records, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload()
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
          <>
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
          </>
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
function DamperModal({ group, allCheckpoints, records, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
  const photo = usePhotoUpload()
  const [item,        setItem]        = useState<'전실제연댐퍼'|'연결송수관'|null>(null)
  // 연결송수관 states
  const [subItem,     setSubItem]     = useState<string|null>(null)
  const [result,      setResult]      = useState<CheckResult>('normal')
  // 전실제연댐퍼 states — StairwellModal 패턴
  const [selectedStair, setSelectedStair] = useState<string|null>(null)
  const [selectedEquip, setSelectedEquip] = useState<string|null>(null)
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
                    <div key={cp.id} style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 8px 6px', border:'1px solid var(--bd)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:5 }}>{JD_FLOOR_LABEL[cp.floor] ?? cp.floor}</div>
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
                    <div key={cp.id} style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 8px 6px', border:'1px solid var(--bd)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--t2)', marginBottom:5 }}>{JD_FLOOR_LABEL[cp.floor] ?? cp.floor}</div>
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
function InspectionModal({ group, allCheckpoints, records, onClose, onSave }: {
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}) {
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

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  // 구역 자동 선택 (첫 번째 구역)
  useEffect(() => {
    if (availableZones.length > 0 && !selectedZone) setSelectedZone(availableZones[0])
  }, [availableZones])

  const availableFloors = useMemo(() =>
    selectedZone ? getFloorsByZone(groupCPs, selectedZone) : [],
    [groupCPs, selectedZone]
  )

  // 층 자동 선택 (첫 번째 층)
  useEffect(() => {
    if (availableFloors.length > 0 && !selectedFloor) setSelectedFloor(availableFloors[0])
  }, [availableFloors])

  // ▶ floorCPs memoize — pickerIdx 변경에는 재계산 안 됨
  const floorCPs = useMemo(() =>
    selectedZone && selectedFloor
      ? groupCPs.filter(cp => matchZone(cp, selectedZone) && cp.floor === selectedFloor)
      : [],
    [groupCPs, selectedZone, selectedFloor]
  )

  // 소화전/비상콘센트 혼합 그룹 피커 소스:
  // 소화전이 있는 층 → 소화전만, 소화전 없는 층(지하 등) → 비상콘센트 직접 표시
  const pickerSourceCPs = useMemo(() => {
    if (!isSohwaGroup) return floorCPs
    const sohwaCPs = floorCPs.filter(cp => cp.category === '소화전')
    return sohwaCPs.length > 0 ? sohwaCPs : floorCPs.filter(cp => cp.category === '비상콘센트')
  }, [isSohwaGroup, floorCPs])
  // 미완료 항목만 피커에 표시
  const pendingCPs = useMemo(() => pickerSourceCPs.filter(cp => !records[cp.id] && !cp.defaultResult), [pickerSourceCPs, records])

  const selectedCP   = pendingCPs[pickerIdx] ?? null
  const totalCount   = pickerSourceCPs.length
  const doneCount    = totalCount - pendingCPs.length

  // 선택된 소화전과 같은 location_no를 가진 비상콘센트 (소화전인 경우에만)
  const pairedBC = useMemo(() =>
    isSohwaGroup && selectedCP?.category === '소화전' && selectedCP?.locationNo
      ? floorCPs.find(cp => cp.category === '비상콘센트' && cp.locationNo === selectedCP.locationNo) ?? null
      : null,
    [isSohwaGroup, selectedCP, floorCPs]
  )

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

  const handleSave = async () => {
    if (!result || !selectedCP) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const photoKey = await photo.upload()
      await onSave(selectedCP.id, result, memo, photoKey ?? undefined)
      if (pairedBC) {
        const bcPhotoKey = await bcPhoto.upload()
        await onSave(pairedBC.id, bcResult, bcMemo, bcPhotoKey ?? undefined)
      }
      photo.reset()
      bcPhoto.reset()
      setJustSaved(true)
      // #14: 저장 후 다음 항목/층/구역 자동 이동
      setTimeout(() => {
        // pendingCPs는 현재 렌더 기준이므로 저장 후 1개 줄어듦
        const remainingAfterSave = pendingCPs.length - 1
        if (remainingAfterSave > 0) {
          // 같은 층에 미완료 있으면 다음 항목
          if (pickerIdx >= remainingAfterSave) setPickerIdx(0)
        } else if (selectedFloor && selectedZone) {
          // 이 층 완료 — 같은 구역 내 다음 미완료 층 찾기
          const nextFloor = availableFloors.find(f => {
            if (f === selectedFloor) return false
            const fCPs = groupCPs.filter(cp => matchZone(cp, selectedZone) && cp.floor === f)
            return fCPs.some(cp => !records[cp.id])
          })
          if (nextFloor) {
            setSelectedFloor(nextFloor)
            setPickerIdx(0)
          } else {
            // 이 구역 완료 — 다음 미완료 구역 찾기
            const nextZone = availableZones.find(z => {
              if (z === selectedZone) return false
              const zCPs = groupCPs.filter(cp => matchZone(cp, z))
              return zCPs.some(cp => !records[cp.id])
            })
            if (nextZone) {
              setSelectedZone(nextZone)
              setSelectedFloor(null)
              setPickerIdx(0)
            }
          }
        }
      }, 600)
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

      {/* ── 헤더 (닫기 버튼 없음 — 하단 버튼으로 대체) ── */}
      <div style={{ paddingTop:'10px', paddingBottom:10, paddingLeft:16, paddingRight:16, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{group.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{group.labels[0]}</div>
          {group.labels.length > 1 && <div style={{ fontSize:10, color:'var(--t3)', marginTop:1 }}>{group.labels.slice(1).join(' · ')}</div>}
        </div>
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
              const fDone = fCPs.filter(cp => records[cp.id]).length
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
      {selectedFloor && floorCPs.length > 1 && (
        <div style={{ padding:'10px 14px 8px', flexShrink:0, background:'var(--bg)' }}>
          {pendingCPs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'16px 0', color:'var(--safe)', fontSize:13, fontWeight:600 }}>
              ✅ 이 층 점검 완료 ({doneCount}/{totalCount})
            </div>
          ) : (
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
                <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600 }}>현재 개소 ({pickerIdx + 1}/{pendingCPs.length} 미완료 · {doneCount}/{totalCount} 완료)</div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--t1)', marginTop:2 }}>{selectedCP?.location ?? ''}</div>
                {selectedCP?.description && <div style={{ fontSize:11, color:'var(--t2)', marginTop:2 }}>{selectedCP.description}</div>}
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
        {/* 개소가 1개인 경우 정보 표시 */}
        {selectedCP && floorCPs.length <= 1 && (
          <div style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 12px', border:'1px solid var(--bd)' }}>
            <div style={{ fontSize:10, color:'var(--t3)' }}>{selectedCP.category}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', marginTop:1 }}>{selectedCP.location}</div>
            {selectedCP.description && <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{selectedCP.description}</div>}
          </div>
        )}

        {/* 결과 선택 — 1행 3열 (정상/주의/불량, 기본값 정상) */}
        {selectedCP && (
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
        )}

        {/* 특이사항 + 증빙사진 (한 행) */}
        {selectedCP && (
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
          disabled={submitting || photo.uploading || bcPhoto.uploading || !selectedCP}
          style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background: submitting||photo.uploading||bcPhoto.uploading||!selectedCP ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', color: submitting||photo.uploading||bcPhoto.uploading||!selectedCP ? 'var(--t3)' : '#fff', fontSize:13, fontWeight:700, cursor: submitting||photo.uploading||bcPhoto.uploading||!selectedCP ? 'default' : 'pointer', transition:'all .13s' }}
        >
          {(photo.uploading || bcPhoto.uploading) ? '사진 업로드 중...' : submitting ? '저장 중...' : '점검 기록 저장'}
        </button>
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
                {item.checkedAt && <div style={{ fontSize:9.5, color:'var(--t3)', marginTop:4 }}>{new Date(item.checkedAt).toLocaleString('ko-KR')}</div>}
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
                {item.resolvedAt && <div style={{ fontSize:9.5, color:'var(--t3)' }}>{new Date(item.resolvedAt).toLocaleString('ko-KR')}</div>}
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

  const [allCheckpoints,   setAllCheckpoints]   = useState<CheckPoint[]>([])
  const [loading,          setLoading]          = useState(true)
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null)
  const [records,          setRecords]          = useState<Record<string, CheckResult>>({})
  const [recordMeta,       setRecordMeta]       = useState<Record<string, RecordMeta>>({})
  const [showTodayDetail,  setShowTodayDetail]  = useState(false)
  const [sessionId,        setSessionId]        = useState<string | null>(null)
  const [syncedAt,         setSyncedAt]         = useState<Date | null>(null)
  const [resolveTarget,    setResolveTarget]    = useState<{ cpId: string; recordId: string; result: CheckResult; photoKey?: string; memo?: string } | null>(null)
  const wkAutoRef = useRef(false)
  const [detailTarget,     setDetailTarget]     = useState<{ cpId: string } | null>(null)

  // 오늘 전체 점검 기록 로드 (타 직원 포함)
  const loadTodayRecords = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const data  = await inspectionApi.getTodayRecords(today)
      const map:  Record<string, CheckResult> = {}
      const meta: Record<string, RecordMeta>  = {}
      for (const r of data) {
        map[r.checkpointId]  = r.result as CheckResult
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
      setRecords(map)
      setRecordMeta(meta)
      setSyncedAt(new Date())
    } catch { /* 실패해도 로컬 상태 유지 */ }
  }, [])

  // 체크포인트 + 오늘 기록 초기 로드
  useEffect(() => {
    Promise.all([
      inspectionApi.getCheckpoints(),
      loadTodayRecords(),
    ]).then(([cps]) => { setAllCheckpoints(cps); setLoading(false) })
      .catch(() => setLoading(false))
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
    const today = new Date().toISOString().slice(0, 10)
    try {
      const sessions = await inspectionApi.getSessions(today)
      const mine = sessions.find((s: any) => s.staff_id === staff?.id || s.staffId === staff?.id)
      if (mine) { setSessionId(mine.id); return mine.id }
    } catch { /* create new */ }
    const sess = await inspectionApi.createSession({ date: today, floor: null })
    setSessionId(sess.id)
    return sess.id
  }

  const handleSave = async (cpId: string, result: CheckResult, memo: string, photoKey?: string) => {
    const sid = await ensureSession()
    await inspectionApi.submitRecord(sid, { checkpointId: cpId, result, memo: memo.trim() || undefined, photoKey })
    // 로컬 즉시 반영 + DB와 동기화
    setRecords(prev => ({ ...prev, [cpId]: result }))
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

  const categoryStats = useMemo(() =>
    CATEGORY_GROUPS.map((g, idx) => {
      const cps  = allCheckpoints.filter(cp => g.categories.includes(cp.category))
      const done = cps.filter(cp => records[cp.id] || cp.defaultResult).length
      return { idx, group:g, total:cps.length, done }
    }).filter(s => s.done > 0),
    [allCheckpoints, records]
  )

  const selectedGroup = selectedGroupIdx !== null ? CATEGORY_GROUPS[selectedGroupIdx] : null

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>

      {/* 헤더 */}
      <div style={{ padding:'8px 16px 12px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:18, fontWeight:700, color:'var(--t1)' }}>소방 점검</div>
        {syncedAt && (
          <div style={{ fontSize:10, color:'var(--t3)' }}>
            동기화 {syncedAt.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
          </div>
        )}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', paddingBottom:80 }}>

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
                  { icon:'✓',  label:'조치완',  val:resolvedItems.length,   color:'var(--safe)', bg:'rgba(34,197,94,.08)', border:'rgba(34,197,94,.25)' },
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
                    <span style={{ fontSize:13 }}>✅</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--safe)' }}>조치 완료 항목</span>
                    <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:'var(--safe)', borderRadius:20, padding:'1px 7px' }}>{resolvedItems.length}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {resolvedItems.map(item => {
                      const opt = ALL_RESULT_OPTIONS.find(o => o.value === item.result)!
                      return (
                        <div key={item.cpId} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(34,197,94,.06)', borderRadius:10, border:'1px solid rgba(34,197,94,.2)' }}>
                          <span style={{ fontSize:13, flexShrink:0 }}>{opt.icon}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:11, fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.cp!.location}</div>
                            <div style={{ fontSize:10, color:'var(--t3)' }}>{item.cp!.floor} · {item.cp!.category}</div>
                          </div>
                          <button
                            onClick={() => setDetailTarget({ cpId: item.cpId })}
                            style={{ flexShrink:0, padding:'4px 9px', borderRadius:8, border:'1px solid rgba(34,197,94,.4)', background:'rgba(34,197,94,.1)', color:'var(--safe)', fontSize:11, fontWeight:700, cursor:'pointer' }}
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
              {CATEGORY_GROUPS.map((g, idx) => {
                const cps     = allCheckpoints.filter(cp => g.categories.includes(cp.category))
                const doneCnt = cps.filter(cp => records[cp.id] || cp.defaultResult).length
                const allDone = cps.length > 0 && doneCnt === cps.length
                return (
                  <div key={idx} onClick={() => cps.length > 0 && setSelectedGroupIdx(idx)} style={{ background: allDone ? 'rgba(34,197,94,.08)' : g.color, border:`1px solid ${allDone ? 'rgba(34,197,94,.35)' : g.border}`, borderRadius:12, padding:'11px 8px', display:'flex', alignItems:'flex-start', gap:6, cursor: cps.length > 0 ? 'pointer' : 'default', opacity: cps.length > 0 ? 1 : 0.38, transition:'all .13s', minHeight:86, boxSizing:'border-box' }}>
                    <span style={{ fontSize:16, lineHeight:1.3, flexShrink:0 }}>{g.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      {g.labels.map(l => <div key={l} style={{ fontSize:10, fontWeight:600, color:'var(--t1)', lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l}</div>)}
                      <div style={{ fontSize:10, marginTop:2, color: allDone ? 'var(--safe)' : doneCnt > 0 ? 'var(--warn)' : 'var(--t3)' }}>
                        {cps.length === 0 ? '없음' : allDone ? '✓ 완료' : doneCnt > 0 ? `${doneCnt}/${cps.length}` : `${cps.length}개`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* 전체화면 점검 모달 */}
      {selectedGroup && (
        selectedGroup.categories.includes('DIV') ? (
          <DivModal onClose={() => setSelectedGroupIdx(null)} onSaveRecord={handleSave} />
        ) : selectedGroup.categories.includes('배연창') ? (
          <BaeyeonModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : selectedGroup.categories.includes('소방용전원공급반') ? (
          <PowerPanelModal
            group={selectedGroup}
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
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : selectedGroup.categories.includes('주차장비') ? (
          <ParkingGateModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : selectedGroup.categories.includes('연결송수관') ? (
          <DamperModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
          />
        ) : (
          <InspectionModal
            group={selectedGroup}
            allCheckpoints={allCheckpoints}
            records={records}
            onClose={() => setSelectedGroupIdx(null)}
            onSave={handleSave}
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
    </div>
  )
}
