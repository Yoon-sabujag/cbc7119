import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Map as MapIcon, BarChart3, Siren, Users } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { dashboardApi, scheduleApi, fireAlarmApi } from '../utils/api'
import { DutyChip, RoleLabel, Donut, StatusBadge, CatBar } from '../components/ui'
import type { DashboardScheduleItem, Staff } from '../types'
import { getMonthlySchedule } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'
import { useIsDesktop } from '../hooks/useIsDesktop'

// Android Chrome은 overflow-x:auto + overflow-y:clip 조합에서도 element를
// 2축 scroll container로 취급해 strip의 intrinsic height를 0으로 계산함.
// iPhone Safari는 spec대로 처리되어 문제 없음. Android에만 min-height 강제.
const IS_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

const MOCK_SCHEDULE: DashboardScheduleItem[] = [
  { id:'1', title:'VIP 투어 업무협조',     date:'', time:'09:30', category:'event',   status:'in_progress', completed:false },
  { id:'2', title:'엘리베이터 5호기 수리', date:'', time:'14:00', category:'elevator', status:'pending',     completed:false },
  { id:'3', title:'소방 종합점검 협의',    date:'', time:'16:00', category:'inspect', status:'pending',     completed:false },
  { id:'4', title:'전 층 DIV 격주 점검',   date:'',              category:'inspect', status:'overdue',     completed:false },
  { id:'5', title:'3층 소화기 교체 확인',  date:'',              category:'task',    status:'pending',     completed:false },
]

// 260427-1dc: doubleCycle 메타 추가 (DIV/컴프레셔 two-lap overlay 도넛용)
interface MonthlyItem {
  label: string
  pct: number
  color: string
  total: number
  done: number
  doubleCycle?: boolean
  early_done?: number
  late_done?: number
  early_pct?: number
  late_pct?: number
  early_color?: string
  late_color?: string
}

export default function DashboardPage() {
  const navigate  = useNavigate()
  const { staff } = useAuthStore()
  const { data: staffList } = useStaffList()
  const [contactStaff, setContactStaff] = useState<Staff | null>(null)

  const queryClient = useQueryClient()


  const handleManualComplete = useCallback(async (item: DashboardScheduleItem) => {
    if (!confirm(`"${item.title}"을 완료 처리하시겠습니까?`)) return
    try {
      await scheduleApi.updateStatus(item.id, 'done')
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('일정이 완료 처리되었습니다')
    } catch {
      toast.error('완료 처리에 실패했습니다')
    }
  }, [queryClient])

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  dashboardApi.getStats,
    retry:    1,
    staleTime: 30_000,
    refetchInterval: 30_000,       // 30초마다 자동 갱신
    refetchOnWindowFocus: true,    // 탭 포커스 시 즉시 갱신
  })

  // 로딩 중엔 빈 값, API 실패 시에만 목업 폴백
  const stats       = data?.stats        ?? (isLoading ? { inspectTotal:0, inspectDone:0, scheduleCount:0, unresolved:0, elevatorFault:0, streakDays:0, elevInspDueSoon:0 } : { inspectTotal:34, inspectDone:22, scheduleCount:5, unresolved:2, elevatorFault:0, streakDays:0, elevInspDueSoon:0 })
  const schedule: DashboardScheduleItem[] = data?.todaySchedule ?? (isLoading ? [] : MOCK_SCHEDULE)
  const monthly: MonthlyItem[] = data?.monthlyItems ?? (isLoading ? [] : [])
  const todayTarget = data?.todayTarget   ?? (isLoading ? '' : '전 층 DIV 격주 점검 · B5~8층 34개 측정점')
  const monthScheduleDates: Record<string, string[]> = data?.monthScheduleDates ?? {}
  // 08:30 이전이면 전날 근무 기준
  const _now = new Date()
  const _today = (_now.getHours() < 8 || (_now.getHours() === 8 && _now.getMinutes() < 30))
    ? new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() - 1)
    : _now
  const staffForCalc = (staffList ?? []).map(s => ({ id: s.id, name: s.name, title: s.title }))
  const { staffRows } = getMonthlySchedule(_today.getFullYear(), _today.getMonth() + 1, staffForCalc)
  const _todayIdx = _today.getDate() - 1
  const RAW_TO_STYPE: Record<string, string> = { '당':'night','비':'off','주':'day','휴':'leave' }
  // 오늘 연차 데이터
  const todayStr = `${_today.getFullYear()}-${String(_today.getMonth()+1).padStart(2,'0')}-${String(_today.getDate()).padStart(2,'0')}`
  const { data: leaveData } = useQuery({
    queryKey: ['leaves', todayStr],
    queryFn: async () => {
      const ym = todayStr.slice(0,7)
      const res = await fetch(`/api/leaves?year=${_today.getFullYear()}&month=${ym}`, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      })
      const j = await res.json() as any
      return [...(j.data?.myLeaves ?? []), ...(j.data?.teamLeaves ?? [])]
    },
    staleTime: 30_000,
  })
  const leaveMap: Record<string, string> = {}
  for (const l of (leaveData ?? []) as any[]) {
    if (l.date === todayStr) leaveMap[l.staffId ?? l.staff_id] = l.type
  }

  // 최근 수신반 이력 (48시간)
  const { data: recentAlarms } = useQuery({
    queryKey: ['fire-alarm-recent'],
    queryFn: () => fireAlarmApi.getRecent(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
  const latestAlarm = (recentAlarms ?? [])[0] as any

  const dutyStaff: Staff[] = staffRows.map(s => ({
    id: s.id, name: s.name, title: s.title,
    role: staffList?.find(st => st.id === s.id)?.role ?? 'assistant',
    phone: staffList?.find(st => st.id === s.id)?.phone ?? null,
    shiftType: (RAW_TO_STYPE[s.shifts[_todayIdx]] ?? 'off') as Staff['shiftType'],
    leaveType: leaveMap[s.id] as Staff['leaveType'],
  }))

  const admin     = dutyStaff.filter(s => s.role === 'admin')
  const assistant = dutyStaff.filter(s => s.role !== 'admin')

  const incomplete = stats.inspectTotal - stats.inspectDone
  const timed     = schedule.filter(s => s.time)
  const untimed   = schedule.filter(s => !s.time)

  const CAT_COLOR: Record<string,string> = { event:'var(--fire)', repair:'var(--danger)', inspect:'var(--acl)', task:'var(--t3)', elevator:'#f97316', fire:'#ef4444' }

  // '점검 미완료' 카드 → 점검 페이지에서 자동 선택할 카테고리
  // (오늘 일정 중 첫 inspect 항목의 inspection_category)
  const todayInspectCategory =
    schedule.find(s => s.category === 'inspect' && s.inspectionCategory)?.inspectionCategory
  const goToInspection = () => {
    navigate('/inspection', todayInspectCategory ? { state: { autoSelectCategory: todayInspectCategory } } : undefined)
  }

  // 공통 tools 배열 — Lucide 아이콘 + §7.1 일관성 (배경/색 강조 제거)
  const tools = [
    { Icon: MapIcon,    label:'도면 점검',    desc:'층별 도면 보기\n유도등·감지기·소화기', descDesktop:'층별 도면 · 유도등 · 감지기',  path:'/floorplan' },
    { Icon: BarChart3,  label:'DIV 트렌드',   desc:'측정점 선택\n압력 트렌드 차트',         descDesktop:'측정점 압력 트렌드 차트',        path:'/div'        },
    { Icon: Siren,      label:'고장 접수',    desc:'승강기 고장 접수\nTKE 자동 연결',        descDesktop:'승강기 고장 접수 · TKE 연결',    path:'/elevator?modal=fault_new' },
    { Icon: Users,      label:'직원 서비스',  desc:'연차·식사 이용\n근무표 기반 통합',       descDesktop:'연차 · 식사 · 근무표 통합',     path:'/staff-service' },
  ]

  const isDesktop = useIsDesktop()

  // ── 데스크톱 레이아웃 ──────────────────────────────────────
  if (isDesktop) {
    const statCards = [
      { label:'점검 미완료', val: String(incomplete),           sub:`/${stats.inspectTotal}`, color:'var(--danger)', onClick: goToInspection },
      { label:'미조치 항목', val: String(stats.unresolved),     sub:'건',                     color:'var(--warn)',   onClick: () => navigate('/remediation?tab=open') },
      { label:'오늘 일정',   val: String(stats.scheduleCount),  sub:'건',                     color:'var(--info)',   onClick: () => navigate('/schedule') },
      { label:'승강기 고장', val: String(stats.elevatorFault),  sub:'대',                     color: stats.elevatorFault > 0 ? 'var(--danger)' : 'var(--safe)', onClick: () => navigate('/elevator') },
    ]

    // 미니 캘린더 데이터
    const now = new Date()
    const calYear = now.getFullYear(), calMonth = now.getMonth()
    const calFirst = new Date(calYear, calMonth, 1)
    const calLast = new Date(calYear, calMonth + 1, 0)
    const calStartDow = calFirst.getDay()
    const calDaysInMonth = calLast.getDate()
    const calToday = now.getDate()

    // 카테고리별 dot 색상
    const CAT_DOT: Record<string, string> = { inspect:'var(--acl)', event:'var(--fire)', repair:'var(--danger)', task:'var(--t3)', elevator:'#f97316', fire:'#ef4444' }
    // 날짜별 카테고리 목록 (API에서 받은 이번 달 전체)
    const calDayCategories: Record<number, string[]> = {}
    for (const [day, cats] of Object.entries(monthScheduleDates)) {
      calDayCategories[Number(day)] = cats
    }
    // 공휴일 맵 (API 응답: 'YYYY-MM-DD' → name) — 일자만 추출해 day-key 로 변환
    const monthHolidays: Record<string, string> = (data?.monthHolidays as Record<string,string>) ?? {}
    const calDayHolidays: Record<number, string> = {}
    for (const [ymd, name] of Object.entries(monthHolidays)) {
      const [hy, hm, hd] = ymd.split('-').map(Number)
      if (hy === calYear && hm === calMonth + 1) calDayHolidays[hd] = name
    }

    return (
      <div className="w-full h-full overflow-auto px-7 py-5 flex flex-col gap-4">

        {/* Row 0: 근무자 칩 + 연속 달성 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RoleLabel text="관리자" color="rgba(245,158,11,0.75)" />
            <div className="flex gap-1.5">{admin.map(s => <DutyChip key={s.id} staff={s} />)}</div>
            <div className="w-px h-[22px] bg-border-default mx-1.5" />
            <RoleLabel text="보조자" color="rgba(110,118,129,0.65)" />
            <div className="flex gap-1.5">{assistant.map(s => <DutyChip key={s.id} staff={s} />)}</div>
          </div>
          {stats.streakDays > 0 && (
            <span className="font-mono text-caption font-semibold text-safe bg-safe-bg border border-safe px-3.5 py-1 rounded-pill">
              연속 {stats.streakDays}일 점검 달성
            </span>
          )}
        </div>

        {/* Row 1: 전폭 배너 — 오늘 점검 대상 + 수신반 */}
        <div
          className="rounded-lg border border-info-bar/30 px-6 py-4 flex items-center gap-5 bg-[linear-gradient(135deg,rgba(37,99,235,.10),rgba(14,165,233,.05))]"
        >
          <div className="w-2 h-2 rounded-full bg-info-bar shrink-0 animate-[blink_2s_ease-in-out_infinite]" />
          <div className="flex-1">
            <div className="text-caption font-bold text-info-bar uppercase tracking-wider">오늘 점검 대상</div>
            <div className="text-body-sm font-bold text-text-primary mt-1 leading-snug">{todayTarget}</div>
          </div>
          {latestAlarm && (
            <>
              <div className="w-px h-9 bg-info-bar/20 shrink-0" />
              <div className="text-right shrink-0">
                <div className="text-caption font-bold text-danger-bar uppercase tracking-wider flex items-center justify-end gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger-bar animate-[blink_1s_ease-in-out_infinite]" />
                  최근 수신반 이력
                </div>
                <div className="text-body-sm font-bold text-text-primary mt-1">
                  {latestAlarm.location || '장소 미기록'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Row 2: 통계 카드 4열 (전폭) */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {statCards.map(c => (
            <div key={c.label} onClick={c.onClick} style={{
              background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:16,
              padding:'20px 22px', cursor:'pointer', position:'relative', overflow:'hidden',
              transition:'border-color .15s, transform .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bd2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.transform = 'none' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--t3)', marginBottom:10 }}>{c.label}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:36, fontWeight:700, lineHeight:1, color:c.color }}>{c.val}</span>
                <span style={{ fontSize:14, color:'var(--t3)' }}>{c.sub}</span>
              </div>
              {c.label === '승강기 고장' && stats.elevInspDueSoon > 0 && (
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
                  <span style={{ background:'#fff3e0', color:'#e65100', padding:'2px 6px', borderRadius:6, fontSize:11, fontWeight:600 }}>
                    검사도래 {stats.elevInspDueSoon}
                  </span>
                </div>
              )}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:c.color, borderRadius:'0 0 16px 16px' }} />
            </div>
          ))}
        </div>

        {/* Row 3: 2열 — 좌(점검현황 + 빠른도구) | 우(캘린더 + 일정) */}
        <div style={{ display:'flex', gap:16, flex:1, minHeight:0 }}>

          {/* 좌: 점검 현황 + 빠른 도구 */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16 }}>

            {/* 이번 달 점검 현황 */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>이번 달 점검 현황</span>
                <span style={{ fontSize:13, color:'var(--t3)' }}>{calYear}년 {calMonth + 1}월</span>
              </div>
              {monthly.length === 0 ? (
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'var(--t3)' }}>이번 달 점검 일정 없음</div>
              ) : (
                <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:32, flex:1, justifyContent:'center', overflowY:'auto' }}>
                  {(() => {
                    // 한 줄당 최대 7개 — 2줄에 균등 분배 (n≤7: 1줄, n≤14: 2줄, n>14: 3줄)
                    const rows: MonthlyItem[][] = []
                    const n = monthly.length
                    const cols = 7
                    const numRows = Math.max(1, Math.ceil(n / cols))
                    const perRow = Math.ceil(n / numRows)
                    for (let i = 0; i < numRows; i++) {
                      rows.push(monthly.slice(i * perRow, (i + 1) * perRow))
                    }
                    return rows.map((row, ri) => (
                      <div key={ri} style={{ display:'flex', justifyContent:'space-evenly', gap:8 }}>
                        {row.map((m, i) => (
                          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
                            {m.doubleCycle ? (
                              <Donut
                                pct={m.pct}
                                color={m.color}
                                size={76}
                                doubleCycle={{
                                  earlyPct: m.early_pct ?? 0,
                                  latePct:  m.late_pct  ?? 0,
                                  earlyColor: m.early_color ?? 'var(--info)',
                                  lateColor:  m.late_color  ?? 'var(--warn)',
                                }}
                              />
                            ) : (
                              <Donut pct={m.pct} color={m.color} size={76} />
                            )}
                            <div style={{ fontSize:11, color:'var(--t2)', textAlign:'center', lineHeight:1.3, wordBreak:'keep-all', whiteSpace:'normal' }}>{m.label}</div>
                            <div style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', fontWeight:600, color: m.total > 0 && m.done >= m.total ? 'var(--safe)' : 'var(--t3)' }}>{m.done}/{m.total}</div>
                          </div>
                        ))}
                      </div>
                    ))
                  })()}
                </div>
              )}
            </div>

            {/* 빠른 도구 모음 (가로 4열) */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, flexShrink:0 }}>
              {tools.map(t => (
                <div key={t.label} onClick={() => navigate(t.path)}
                  style={{
                    background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:14,
                    padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:10,
                    cursor:'pointer', transition:'border-color .15s, transform .15s', textAlign:'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bd2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <t.Icon size={22} style={{ color:'var(--t2)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{t.label}</div>
                    <div style={{ fontSize:12, color:'var(--t3)', marginTop:3, lineHeight:1.3 }}>{t.descDesktop}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우: 캘린더 + 오늘 일정 (340px) */}
          <div style={{ width:340, flexShrink:0, display:'flex', flexDirection:'column', gap:16 }}>

            {/* 미니 캘린더 */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:16, padding:'16px 14px', flexShrink:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', textAlign:'center', marginBottom:10 }}>
                {calYear}년 {calMonth + 1}월
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, textAlign:'center' }}>
                {['일','월','화','수','목','금','토'].map(d => (
                  <div key={d} style={{ fontSize:12, fontWeight:700, color: d==='일'?'var(--danger)':d==='토'?'var(--info)':'var(--t3)', padding:'3px 0' }}>{d}</div>
                ))}
                {Array.from({ length: calStartDow }, (_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: calDaysInMonth }, (_, i) => {
                  const d = i + 1
                  const dow = (calStartDow + i) % 7
                  const isToday = d === calToday
                  const dayCats = calDayCategories[d] ?? []
                  const holName = calDayHolidays[d]
                  const isHoliday = !!holName
                  return (
                    <div key={d} title={holName} style={{ padding:'2px 0', position:'relative' }}>
                      <div style={{
                        width:28, height:28, borderRadius:'50%', margin:'0 auto',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight: isToday || isHoliday ? 700 : 400,
                        color: isToday ? '#fff' : (dow===0 || isHoliday) ? 'var(--danger)' : dow===6 ? 'var(--info)' : 'var(--t1)',
                        background: isToday ? 'var(--acl)' : isHoliday ? 'rgba(239,68,68,0.08)' : 'transparent',
                      }}>
                        {d}
                      </div>
                      {dayCats.length > 0 && (
                        <div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:1, height:5 }}>
                          {dayCats.slice(0, 3).map((cat, ci) => (
                            <div key={ci} style={{ width:4, height:4, borderRadius:'50%', background: CAT_DOT[cat] ?? 'var(--t3)' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 오늘 일정 */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>오늘 일정</span>
                <span style={{ fontSize:12, color:'var(--t3)', background:'var(--bg3)', padding:'3px 10px', borderRadius:10 }}>{schedule.length}건</span>
              </div>
              <div style={{ overflowY:'auto', flex:1 }}>
                {schedule.length === 0 ? (
                  <div style={{ padding:24, textAlign:'center', fontSize:13, color:'var(--t3)' }}>오늘 일정 없음</div>
                ) : (
                  <>
                    {timed.length > 0 && (
                      <>
                        <div style={{ padding:'8px 16px 4px', fontSize:12, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em' }}>시간 확정</div>
                        {timed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
                      </>
                    )}
                    {untimed.length > 0 && (
                      <>
                        <div style={{ padding:'8px 16px 4px', fontSize:12, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', borderTop: timed.length > 0 ? '1px solid var(--bd)' : 'none' }}>시간 미정</div>
                        {untimed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── 모바일 레이아웃 ──────────────────────────────────────
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">

      {/* ══ 근무자 칩 바 ══ */}
      <div className="shrink-0 bg-surface-raised border-b border-border-default px-3 py-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RoleLabel text="관리자" color="rgba(245,158,11,0.75)" />
            <div className="flex gap-1.5">
              {admin.map(s => <DutyChip key={s.id} staff={s} onClick={() => s.phone && setContactStaff(s)} small />)}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <RoleLabel text="보조자" color="rgba(110,118,129,0.65)" />
            <div className="flex gap-1.5">
              {assistant.map(s => <DutyChip key={s.id} staff={s} onClick={() => s.phone && setContactStaff(s)} small />)}
            </div>
          </div>
        </div>
      </div>

      {/* ══ 메인 그리드 ══ */}
      <main
        className="flex-1 min-h-0 overflow-y-auto grid gap-[7px] px-[11px] py-[7px]"
        // gridTemplateRows 는 IS_ANDROID 동적 분기 — 인라인 허용 키
        style={{
          gridTemplateRows: IS_ANDROID
            ? 'auto auto auto 1fr minmax(140px, auto)'
            : 'auto auto auto 1fr auto',
        }}
      >

        {/* ① 오늘 점검 대상 배너 */}
        <div
          className="rounded-md border border-info-bar/30 px-3 py-2 flex items-center gap-2.5 bg-[linear-gradient(100deg,rgba(37,99,235,.17),rgba(14,165,233,.08))]"
          // animation 은 keyframe — Tailwind 정의 안 됨, 인라인 허용 키
          style={{ animation:'slideUp .28s ease-out' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-info-bar shrink-0 animate-[blink_2s_ease-in-out_infinite]" />
          <div className="flex-1">
            <div className="text-caption font-bold text-info-bar uppercase tracking-wider">오늘 점검 대상</div>
            <div className="text-label font-bold text-text-primary mt-0.5 leading-tight">{todayTarget}</div>
          </div>
          {latestAlarm && (
            <>
              <div className="text-right shrink-0">
                <div className="text-caption font-bold text-danger-bar uppercase tracking-wider">최근 수신반 이력</div>
                <div className="text-label font-bold text-text-primary mt-0.5 leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                  {latestAlarm.location || '장소 미기록'}
                </div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-danger-bar shrink-0 animate-[blink_1s_ease-in-out_infinite]" />
            </>
          )}
        </div>

        {/* ② 오늘 현황 */}
        <div style={{ animation:'slideUp .28s .06s ease-out both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--t2)' }}>오늘 현황</span>
            {stats.streakDays > 0 && (
              <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, fontWeight:600, color:'var(--safe)', background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.2)', padding:'2px 7px', borderRadius:20 }}>
                연속 {stats.streakDays}일 점검 달성 🔥
              </span>
            )}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {[
              { label:'점검 미완료', val: String(incomplete),           sub:`/${stats.inspectTotal}`, color:'var(--danger)', accent:'var(--danger)', onClick: goToInspection },
              { label:'미조치 항목', val: String(stats.unresolved),     sub:'건',                     color:'var(--warn)',   accent:'var(--warn)',   onClick: () => navigate('/remediation?tab=open') },
              { label:'오늘 일정',   val: String(stats.scheduleCount),  sub:'건',                     color:'var(--info)',   accent:'var(--info)',   onClick: () => navigate('/schedule') },
              { label:'승강기 고장', val: String(stats.elevatorFault),  sub:'대',                     color: stats.elevatorFault > 0 ? 'var(--danger)' : 'var(--safe)', accent: stats.elevatorFault > 0 ? 'var(--danger)' : 'var(--safe)', onClick: () => navigate('/elevator?tab=fault') },
            ].map(c => (
              <div key={c.label} onClick={c.onClick} style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'8px 8px 10px', display:'flex', flexDirection:'column', gap:4, position:'relative', overflow:'hidden', cursor:'pointer' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--t3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.label}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:2, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:20, fontWeight:600, lineHeight:1, color:c.color }}>{c.val}</span>
                  <span style={{ fontSize:12, color:'var(--t3)' }}>{c.sub}</span>
                </div>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, borderRadius:'0 0 12px 12px', background:c.accent }} />
              </div>
            ))}
          </div>
          {stats.elevInspDueSoon > 0 && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:4 }}>
              <span style={{ background:'#fff3e0', color:'#e65100', padding:'2px 6px', borderRadius:6, fontSize:12, fontWeight:600 }}>
                검사도래 {stats.elevInspDueSoon}
              </span>
            </div>
          )}
        </div>

        {/* ③ 빠른 도구 모음 */}
        <div style={{ animation:'slideUp .28s .12s ease-out both' }}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:5 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--t2)' }}>빠른 도구 모음</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
            {tools.map(t => (
              <div
                key={t.label}
                onClick={() => navigate(t.path)}
                style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'11px 12px', display:'flex', alignItems:'center', gap:11, cursor:'pointer', transition:'all .13s' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.borderColor='var(--bd2)' }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.borderColor='var(--bd)'  }}
              >
                <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <t.Icon size={18} style={{ color:'var(--t2)' }} />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{t.label}</div>
                  <div style={{ fontSize:12, color:'var(--t3)', marginTop:2, lineHeight:1.3, whiteSpace:'pre-line' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ④ 오늘 일정 */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:0, animation:'slideUp .28s .16s ease-out both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 11px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--t2)' }}>오늘 일정</span>
            <span style={{ fontSize:12, color:'var(--t3)', background:'var(--bg3)', padding:'1px 7px', borderRadius:9 }}>{schedule.length}건</span>
          </div>
          <div style={{ overflowY:'auto', flex:1 }}>
            {timed.length > 0 && (
              <>
                <div style={{ padding:'4px 10px 2px', fontSize:12, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase' }}>⏰ 시간 확정</div>
                {timed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
              </>
            )}
            {untimed.length > 0 && (
              <>
                <div style={{ padding:'4px 10px 2px', fontSize:12, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', borderTop:'1px solid var(--bd)', marginTop:2 }}>📋 시간 미정</div>
                {untimed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
              </>
            )}
          </div>
        </div>

        {/* ⑤ 이번 달 점검 현황 */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', animation:'slideUp .28s .20s ease-out both', height: IS_ANDROID ? 125 : undefined }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 11px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--t2)' }}>이번 달 점검 현황</span>
            <span style={{ fontSize:12, color:'var(--t3)' }}>{new Date().getFullYear()}년 {new Date().getMonth()+1}월</span>
          </div>
          {monthly.length === 0 ? (
            <div style={{ padding:'14px 0', textAlign:'center', fontSize:12, color:'var(--t3)' }}>이번 달 점검 일정 없음</div>
          ) : (
            <div style={{ overflowX:'auto', overflowY:'clip', scrollbarWidth:'none', padding:'8px 10px 10px', display:'flex', gap:12, flex: IS_ANDROID ? 1 : undefined, height: IS_ANDROID ? 101 : undefined }}>
              {monthly.map((m, i) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0, minWidth:64 }}>
                  {m.doubleCycle ? (
                    <Donut
                      pct={m.pct}
                      color={m.color}
                      size={44}
                      doubleCycle={{
                        earlyPct: m.early_pct ?? 0,
                        latePct:  m.late_pct  ?? 0,
                        earlyColor: m.early_color ?? 'var(--info)',
                        lateColor:  m.late_color  ?? 'var(--warn)',
                      }}
                    />
                  ) : (
                    <Donut pct={m.pct} color={m.color} size={44} />
                  )}
                  <div style={{ fontSize:12, color:'var(--t3)', textAlign:'center', lineHeight:1.3, maxWidth:72, wordBreak:'keep-all' }}>{m.label}</div>
                  <div style={{ fontSize:12, color: m.total > 0 && m.done >= m.total ? 'var(--safe)' : 'var(--t3)' }}>{m.done}/{m.total}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ══ 전화/문자 액션시트 ══ */}
      {contactStaff && (
        <div
          onClick={() => setContactStaff(null)}
          style={{
            position:'fixed', inset:0, zIndex:9999,
            background:'rgba(0,0,0,.45)',
            display:'flex', alignItems:'flex-end', justifyContent:'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width:'100%', maxWidth:400,
              background:'var(--bg2)', borderRadius:'16px 16px 0 0',
              padding:'16px 16px calc(16px + var(--sab, 0px))',
            }}
          >
            <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)', textAlign:'center', marginBottom:14 }}>
              {contactStaff.name}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button
                onClick={() => { window.location.href = `tel:${contactStaff.phone}`; setContactStaff(null) }}
                style={{
                  width:'100%', padding:'14px 0', borderRadius:12,
                  background:'var(--acl)', color:'#fff',
                  fontSize:14, fontWeight:700, border:'none', cursor:'pointer',
                }}
              >
                전화 걸기
              </button>
              <button
                onClick={() => { window.location.href = `sms:${contactStaff.phone}`; setContactStaff(null) }}
                style={{
                  width:'100%', padding:'14px 0', borderRadius:12,
                  background:'var(--bg3)', color:'var(--t1)',
                  fontSize:14, fontWeight:700, border:'1px solid var(--bd)', cursor:'pointer',
                }}
              >
                문자 보내기
              </button>
            </div>
            <button
              onClick={() => setContactStaff(null)}
              style={{
                width:'100%', padding:'12px 0', marginTop:8,
                background:'none', color:'var(--t3)',
                fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── 일정 행 서브컴포넌트 ─────────────────────────────────
function ScheduleRow({ item, catColor, onManualComplete }: {
  item: DashboardScheduleItem
  catColor: Record<string,string>
  onManualComplete?: (item: DashboardScheduleItem) => void
}) {
  return (
    <div
      style={{
        display:'flex', alignItems:'flex-start', gap:6, padding:'6px 10px',
        borderBottom:'1px solid var(--bd)', cursor:'pointer', transition:'background .1s',
        background: item.completed ? 'rgba(34,197,94,.08)' : 'transparent',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = item.completed ? 'rgba(34,197,94,.12)' : 'var(--bg3)')}
      onMouseLeave={e => (e.currentTarget.style.background = item.completed ? 'rgba(34,197,94,.08)' : 'transparent')}
    >
      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'var(--t3)', width:30, flexShrink:0, paddingTop:1 }}>
        {item.time ?? '—'}
      </div>
      <div style={{ width:2, borderRadius:2, flexShrink:0, alignSelf:'stretch', minHeight:20, background: catColor[item.category] ?? 'var(--t3)' }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--t1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
        {item.memo && <div style={{ fontSize:12, color:'var(--t3)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.memo}</div>}
      </div>
      <StatusBadge status={item.completed ? 'done' : item.status} />
      {item.completed && (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}>
          <path d="M3 8.5L6.5 12L13 4" stroke="var(--safe)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {!item.completed && item.category !== 'inspect' && (
        <button
          onClick={(e) => { e.stopPropagation(); onManualComplete?.(item) }}
          style={{
            fontSize:12, fontWeight:700, padding:'2px 6px', borderRadius:5,
            background:'var(--bg3)', color:'var(--t3)', border:'1px solid var(--bd)',
            cursor:'pointer', flexShrink:0, whiteSpace:'nowrap'
          }}
        >완료 처리</button>
      )}
    </div>
  )
}
