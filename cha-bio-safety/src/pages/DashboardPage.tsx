import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Map as MapIcon, BarChart3, Siren, Users } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { dashboardApi, scheduleApi, fireAlarmApi } from '../utils/api'
import { DutyChip, RoleLabel, Donut, CatBar } from '../components/ui'
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
    // §6.2 Stat Card negative rule:
    // - 숫자 색은 위험 임계치(threshold) 일 때만 status 색
    // - 정상치는 text-text-primary (흰색/검정)
    // - 좌측 3px 색바: status 의 bar 변종 (오늘 일정은 회색)
    const statCards = [
      {
        label: '점검 미완료',
        val: String(incomplete),
        sub: `/${stats.inspectTotal}`,
        isThreshold: incomplete > 0,
        thresholdColorClass: 'text-danger',
        barClass: 'bg-danger-bar',  // incomplete 의 의미 자체가 위험
        onClick: goToInspection,
      },
      {
        label: '미조치 항목',
        val: String(stats.unresolved),
        sub: '건',
        isThreshold: stats.unresolved > 0,
        thresholdColorClass: 'text-fire',
        barClass: 'bg-fire-bar',
        onClick: () => navigate('/remediation?tab=open'),
      },
      {
        label: '오늘 일정',
        val: String(stats.scheduleCount),
        sub: '건',
        isThreshold: false,             // 정보 카드 — 항상 text-primary
        thresholdColorClass: '',
        barClass: 'bg-border-default',  // 회색
        onClick: () => navigate('/schedule'),
      },
      {
        label: '승강기 고장',
        val: String(stats.elevatorFault),
        sub: '대',
        isThreshold: stats.elevatorFault > 0,
        thresholdColorClass: 'text-danger',
        barClass: stats.elevatorFault > 0 ? 'bg-danger-bar' : 'bg-safe-bar',
        onClick: () => navigate('/elevator'),
      },
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

        {/* Row 2: 통계 카드 4열 (§6.2 Stat Card negative rule) */}
        <div className="grid grid-cols-4 gap-3.5">
          {statCards.map(c => (
            <div
              key={c.label}
              onClick={c.onClick}
              className="bg-surface-raised border border-border-default rounded-lg px-5 py-5 cursor-pointer relative overflow-hidden hover:border-border-strong hover:-translate-y-px transition-all"
            >
              <div className="text-caption font-semibold text-text-tertiary mb-2.5">{c.label}</div>
              <div className="flex items-baseline gap-1">
                <span className={`font-mono text-[36px] font-bold leading-none ${c.isThreshold ? c.thresholdColorClass : 'text-text-primary'}`}>{c.val}</span>
                <span className="text-body-sm text-text-tertiary">{c.sub}</span>
              </div>
              {c.label === '승강기 고장' && stats.elevInspDueSoon > 0 && (
                <div className="flex justify-end mt-2">
                  <span className="bg-warning-bg text-warning text-caption font-semibold px-1.5 py-0.5 rounded-sm">
                    검사도래 {stats.elevInspDueSoon}
                  </span>
                </div>
              )}
              <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-b-lg ${c.barClass}`} />
            </div>
          ))}
        </div>

        {/* Row 3: 2열 — 좌(점검현황 + 빠른도구) | 우(캘린더 + 일정) */}
        <div className="flex gap-4 flex-1 min-h-0">

          {/* 좌: 점검 현황 + 빠른 도구 */}
          <div className="flex-1 flex flex-col gap-4">

            {/* 이번 달 점검 현황 */}
            <div className="bg-surface-raised border border-border-default rounded-lg overflow-hidden flex flex-col flex-1">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-default shrink-0">
                <span className="text-body-sm font-bold text-text-primary">이번 달 점검 현황</span>
                <span className="text-label text-text-tertiary">{calYear}년 {calMonth + 1}월</span>
              </div>
              {monthly.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-body-sm text-text-tertiary">이번 달 점검 일정 없음</div>
              ) : (
                <div className="px-6 py-5 flex flex-col gap-8 flex-1 justify-center overflow-y-auto">
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
                      <div key={ri} className="flex justify-evenly gap-2">
                        {row.map((m, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
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
                            <div className="text-caption text-text-secondary text-center leading-snug whitespace-normal [word-break:keep-all]">{m.label}</div>
                            <div className={`text-caption font-mono font-semibold ${m.total > 0 && m.done >= m.total ? 'text-safe' : 'text-text-tertiary'}`}>{m.done}/{m.total}</div>
                          </div>
                        ))}
                      </div>
                    ))
                  })()}
                </div>
              )}
            </div>

            {/* 빠른 도구 모음 (가로 4열) — §7.1 일관성: 모두 회색 통일 */}
            <div className="grid grid-cols-4 gap-3 shrink-0">
              {tools.map(t => (
                <div
                  key={t.label}
                  onClick={() => navigate(t.path)}
                  className="bg-surface-raised border border-border-default rounded-md p-4 flex flex-col items-center gap-2.5 text-center cursor-pointer hover:border-border-strong hover:-translate-y-px transition-all"
                >
                  <div className="w-11 h-11 rounded-md bg-surface-sunken flex items-center justify-center">
                    <t.Icon size={22} className="text-text-secondary" />
                  </div>
                  <div>
                    <div className="text-label font-bold text-text-primary">{t.label}</div>
                    <div className="text-caption text-text-tertiary mt-0.5 leading-snug">{t.descDesktop}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우: 캘린더 + 오늘 일정 (340px) */}
          <div className="w-[340px] shrink-0 flex flex-col gap-4">

            {/* 미니 캘린더 */}
            <div className="bg-surface-raised border border-border-default rounded-lg px-3.5 py-4 shrink-0">
              <div className="text-label font-bold text-text-primary text-center mb-2.5">
                {calYear}년 {calMonth + 1}월
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {['일','월','화','수','목','금','토'].map(d => {
                  const dowColor = d === '일' ? 'text-danger' : d === '토' ? 'text-info' : 'text-text-tertiary'
                  return (
                    <div key={d} className={`text-caption font-bold py-0.5 ${dowColor}`}>{d}</div>
                  )
                })}
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
                  // 셀 색 분기 (요일/오늘/공휴일)
                  const cellTextColor = isToday
                    ? 'text-text-on-accent'
                    : (dow === 0 || isHoliday)
                      ? 'text-danger'
                      : dow === 6
                        ? 'text-info'
                        : 'text-text-primary'
                  const cellBgClass = isToday
                    ? 'bg-accent'
                    : isHoliday
                      ? 'bg-danger-bg'
                      : 'bg-transparent'
                  const cellWeight = (isToday || isHoliday) ? 'font-bold' : 'font-normal'
                  return (
                    <div key={d} title={holName} className="py-0.5 relative">
                      <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-caption ${cellWeight} ${cellTextColor} ${cellBgClass}`}>
                        {d}
                      </div>
                      {dayCats.length > 0 && (
                        <div className="flex justify-center gap-0.5 mt-px h-[5px]">
                          {dayCats.slice(0, 3).map((cat, ci) => (
                            // CAT_DOT[cat] 은 카테고리별 동적 색 — var(--*) 직참조, 인라인 허용
                            <div key={ci} className="w-1 h-1 rounded-full" style={{ background: CAT_DOT[cat] ?? 'var(--text-tertiary)' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 오늘 일정 */}
            <div className="bg-surface-raised border border-border-default rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-default shrink-0">
                <span className="text-label font-bold text-text-primary">오늘 일정</span>
                <span className="text-caption text-text-tertiary bg-surface-sunken px-2.5 py-0.5 rounded-pill">{schedule.length}건</span>
              </div>
              <div className="overflow-y-auto flex-1">
                {schedule.length === 0 ? (
                  <div className="p-6 text-center text-label text-text-tertiary">오늘 일정 없음</div>
                ) : (
                  <>
                    {timed.length > 0 && (
                      <>
                        <div className="px-4 pt-2 pb-1 text-caption font-bold text-text-tertiary tracking-wider">시간 확정</div>
                        {timed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
                      </>
                    )}
                    {untimed.length > 0 && (
                      <>
                        <div className={`px-4 pt-2 pb-1 text-caption font-bold text-text-tertiary tracking-wider ${timed.length > 0 ? 'border-t border-border-default' : ''}`}>시간 미정</div>
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

        {/* ② 오늘 현황 — §6.2 Stat Card negative rule */}
        <div style={{ animation:'slideUp .28s .06s ease-out both' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-caption font-bold text-text-secondary">오늘 현황</span>
            {stats.streakDays > 0 && (
              <span className="font-mono text-caption font-semibold text-safe bg-safe-bg border border-safe px-2 py-0.5 rounded-pill">
                연속 {stats.streakDays}일 점검 달성 🔥
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(() => {
              // §6.2 Stat Card negative rule:
              // - 숫자 색은 위험 임계치 일 때만 status 색
              // - 정상치는 text-text-primary
              // - 좌측 색바: status 의 bar 변종 (오늘 일정은 회색)
              const cardsMobile = [
                {
                  label: '점검 미완료',
                  val: String(incomplete),
                  sub: `/${stats.inspectTotal}`,
                  isThreshold: incomplete > 0,
                  thresholdColorClass: 'text-danger',
                  barClass: 'bg-danger-bar',
                  onClick: goToInspection,
                },
                {
                  label: '미조치 항목',
                  val: String(stats.unresolved),
                  sub: '건',
                  isThreshold: stats.unresolved > 0,
                  thresholdColorClass: 'text-fire',
                  barClass: 'bg-fire-bar',
                  onClick: () => navigate('/remediation?tab=open'),
                },
                {
                  label: '오늘 일정',
                  val: String(stats.scheduleCount),
                  sub: '건',
                  isThreshold: false,
                  thresholdColorClass: '',
                  barClass: 'bg-border-default',
                  onClick: () => navigate('/schedule'),
                },
                {
                  label: '승강기 고장',
                  val: String(stats.elevatorFault),
                  sub: '대',
                  isThreshold: stats.elevatorFault > 0,
                  thresholdColorClass: 'text-danger',
                  barClass: stats.elevatorFault > 0 ? 'bg-danger-bar' : 'bg-safe-bar',
                  onClick: () => navigate('/elevator?tab=fault'),
                },
              ]
              return cardsMobile.map(c => (
                <div
                  key={c.label}
                  onClick={c.onClick}
                  className="bg-surface-raised border border-border-default rounded-md px-2 pt-2 pb-2.5 flex flex-col gap-1 relative overflow-hidden cursor-pointer hover:border-border-strong transition-all"
                >
                  <div className="text-caption font-bold text-text-tertiary whitespace-nowrap overflow-hidden text-ellipsis">{c.label}</div>
                  <div className="flex items-baseline gap-0.5 flex-wrap">
                    <span className={`font-mono text-[20px] font-semibold leading-none ${c.isThreshold ? c.thresholdColorClass : 'text-text-primary'}`}>{c.val}</span>
                    <span className="text-caption text-text-tertiary">{c.sub}</span>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-md ${c.barClass}`} />
                </div>
              ))
            })()}
          </div>
          {stats.elevInspDueSoon > 0 && (
            <div className="flex justify-end mt-1">
              <span className="bg-warning-bg text-warning text-caption font-semibold px-1.5 py-0.5 rounded-sm">
                검사도래 {stats.elevInspDueSoon}
              </span>
            </div>
          )}
        </div>

        {/* ③ 빠른 도구 모음 — §7.1 일관성: 모두 회색 통일 */}
        <div style={{ animation:'slideUp .28s .12s ease-out both' }}>
          <div className="flex items-center mb-1.5">
            <span className="text-caption font-bold text-text-secondary">빠른 도구 모음</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tools.map(t => (
              <div
                key={t.label}
                onClick={() => navigate(t.path)}
                className="bg-surface-raised border border-border-default rounded-md px-3 py-3 flex items-center gap-3 cursor-pointer hover:bg-surface-sunken hover:border-border-strong transition-all"
              >
                <div className="w-[38px] h-[38px] rounded-md shrink-0 bg-surface-sunken flex items-center justify-center">
                  <t.Icon size={18} className="text-text-secondary" />
                </div>
                <div className="min-w-0">
                  <div className="text-label font-bold text-text-primary">{t.label}</div>
                  <div className="text-caption text-text-tertiary mt-0.5 leading-snug whitespace-pre-line">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ④ 오늘 일정 */}
        <div
          className="bg-surface-raised border border-border-default rounded-md overflow-hidden flex flex-col min-h-0"
          style={{ animation:'slideUp .28s .16s ease-out both' }}
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-default shrink-0">
            <span className="text-caption font-bold text-text-secondary">오늘 일정</span>
            <span className="text-caption text-text-tertiary bg-surface-sunken px-2 py-0.5 rounded-pill">{schedule.length}건</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {timed.length > 0 && (
              <>
                <div className="px-2.5 pt-1 pb-0.5 text-caption font-bold text-text-tertiary tracking-wider uppercase">⏰ 시간 확정</div>
                {timed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
              </>
            )}
            {untimed.length > 0 && (
              <>
                <div className="px-2.5 pt-1 pb-0.5 mt-0.5 text-caption font-bold text-text-tertiary tracking-wider uppercase border-t border-border-default">📋 시간 미정</div>
                {untimed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
              </>
            )}
          </div>
        </div>

        {/* ⑤ 이번 달 점검 현황 — 메모리 룰: 가로 스크롤 (flex-nowrap) */}
        <div
          className="bg-surface-raised border border-border-default rounded-md overflow-hidden flex flex-col"
          style={{
            animation:'slideUp .28s .20s ease-out both',
            // IS_ANDROID 분기 동적 height — 인라인 허용 키
            height: IS_ANDROID ? 125 : undefined,
          }}
        >
          <div className="flex items-center justify-between px-3 py-1 border-b border-border-default shrink-0">
            <span className="text-caption font-bold text-text-secondary">이번 달 점검 현황</span>
            <span className="text-caption text-text-tertiary">{new Date().getFullYear()}년 {new Date().getMonth()+1}월</span>
          </div>
          {monthly.length === 0 ? (
            <div className="py-3.5 text-center text-caption text-text-tertiary">이번 달 점검 일정 없음</div>
          ) : (
            <div
              className="overflow-x-auto px-2.5 py-2 flex flex-nowrap gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                // overflowY:clip + IS_ANDROID 동적 분기 — 인라인 허용 키
                overflowY: 'clip',
                flex: IS_ANDROID ? 1 : undefined,
                height: IS_ANDROID ? 101 : undefined,
              }}
            >
              {monthly.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0 min-w-[64px]">
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
                  <div className="text-caption text-text-tertiary text-center leading-snug max-w-[72px] [word-break:keep-all]">{m.label}</div>
                  <div className={`text-caption ${m.total > 0 && m.done >= m.total ? 'text-safe' : 'text-text-tertiary'}`}>{m.done}/{m.total}</div>
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
          className="fixed inset-0 z-[9999] bg-surface-overlay flex items-end justify-center"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[400px] bg-surface-raised rounded-t-lg pt-4 px-4"
            // safe-area-bottom 동적 — 인라인 허용 (calc + var)
            style={{ paddingBottom: 'calc(16px + var(--sab, 0px))' }}
          >
            <div className="text-body-sm font-bold text-text-primary text-center mb-3.5">
              {contactStaff.name}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { window.location.href = `tel:${contactStaff.phone}`; setContactStaff(null) }}
                className="w-full py-3.5 rounded-md bg-accent text-text-on-accent text-body-sm font-bold border-0 cursor-pointer hover:bg-accent-hover transition-colors"
              >
                전화 걸기
              </button>
              <button
                onClick={() => { window.location.href = `sms:${contactStaff.phone}`; setContactStaff(null) }}
                className="w-full py-3.5 rounded-md bg-surface-sunken text-text-primary text-body-sm font-bold border border-border-default cursor-pointer hover:bg-surface-active transition-colors"
              >
                문자 보내기
              </button>
            </div>
            <button
              onClick={() => setContactStaff(null)}
              className="w-full py-3 mt-2 bg-transparent text-text-tertiary text-label font-semibold border-0 cursor-pointer"
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
  // 완료 행은 safe 배경, 미완료는 hover 시에만 sunken
  const rowBgClass = item.completed
    ? 'bg-safe-bg/60 hover:bg-safe-bg/80'
    : 'hover:bg-surface-sunken'
  return (
    <div className={`flex items-start gap-1.5 px-2.5 py-1.5 border-b border-border-default cursor-pointer transition-colors ${rowBgClass}`}>
      <div className="font-mono text-caption text-text-tertiary w-[30px] shrink-0 pt-px">
        {item.time ?? '—'}
      </div>
      {/* 카테고리별 동적 색바 — catColor[item.category] var() 직참조, 인라인 허용 */}
      <div
        className="w-0.5 rounded-sm shrink-0 self-stretch min-h-[20px]"
        style={{ background: catColor[item.category] ?? 'var(--text-tertiary)' }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-label font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</div>
        {item.memo && <div className="text-caption text-text-tertiary mt-px whitespace-nowrap overflow-hidden text-ellipsis">{item.memo}</div>}
      </div>
      <ScheduleStatusPill status={item.completed ? 'done' : item.status} />
      {item.completed && (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M3 8.5L6.5 12L13 4" stroke="var(--status-safe-bar)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {!item.completed && item.category !== 'inspect' && (
        <button
          onClick={(e) => { e.stopPropagation(); onManualComplete?.(item) }}
          className="text-caption font-bold px-1.5 py-0.5 rounded-sm bg-surface-sunken text-text-tertiary border border-border-default cursor-pointer shrink-0 whitespace-nowrap hover:bg-surface-active transition-colors"
        >
          완료 처리
        </button>
      )}
    </div>
  )
}

// 일정 상태 pill — 완료처리 버튼과 같은 폰트/패딩 사이즈, 단 border 없음 (시안 의도:
// 버튼만 테두리 강조로 클릭 시그널). ui/StatusBadge(8px) 는 너무 작아서 페이지 로컬 대체.
function ScheduleStatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:     { label: '예정',   cls: 'bg-surface-sunken text-text-tertiary' },
    in_progress: { label: '진행중', cls: 'bg-warning-bg text-warning' },
    done:        { label: '완료',   cls: 'bg-safe-bg text-safe' },
    overdue:     { label: '지연',   cls: 'bg-danger-bg text-danger' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`text-caption font-bold px-1.5 py-0.5 rounded-sm shrink-0 whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  )
}
