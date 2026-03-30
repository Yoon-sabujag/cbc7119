import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { dashboardApi, scheduleApi, fireAlarmApi } from '../utils/api'
import { useDateTime } from '../hooks/useDateTime'
import { SideMenu }      from '../components/SideMenu'
import { SettingsPanel } from '../components/SettingsPanel'
import { DutyChip, RoleLabel, Donut, StatusBadge, CatBar } from '../components/ui'
import type { DashboardScheduleItem, Staff, Role } from '../types'
import { getMonthlySchedule } from '../utils/shiftCalc'

const STAFF_ROLES: Record<string, Role> = {
  '2018042451': 'admin',
  '2023071752': 'assistant',
  '2021061451': 'assistant',
  '2022051052': 'assistant',
}

const MOCK_SCHEDULE: DashboardScheduleItem[] = [
  { id:'1', title:'VIP 투어 업무협조',     date:'', time:'09:30', category:'event',   status:'in_progress', completed:false },
  { id:'2', title:'엘리베이터 5호기 수리', date:'', time:'14:00', category:'elevator', status:'pending',     completed:false },
  { id:'3', title:'소방 종합점검 협의',    date:'', time:'16:00', category:'inspect', status:'pending',     completed:false },
  { id:'4', title:'전 층 DIV 격주 점검',   date:'',              category:'inspect', status:'overdue',     completed:false },
  { id:'5', title:'3층 소화기 교체 확인',  date:'',              category:'task',    status:'pending',     completed:false },
]

interface MonthlyItem { label:string; pct:number; color:string; total:number; done:number }

export default function DashboardPage() {
  const navigate  = useNavigate()
  const { staff } = useAuthStore()
  const datetime  = useDateTime()

  const queryClient = useQueryClient()

  const [sideOpen, setSideOpen]       = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

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
  const stats       = data?.stats        ?? (isLoading ? { inspectTotal:0, inspectDone:0, scheduleCount:0, unresolved:0, elevatorFault:0, streakDays:0 } : { inspectTotal:34, inspectDone:22, scheduleCount:5, unresolved:2, elevatorFault:0, streakDays:0 })
  const schedule: DashboardScheduleItem[] = data?.todaySchedule ?? (isLoading ? [] : MOCK_SCHEDULE)
  const monthly: MonthlyItem[] = data?.monthlyItems ?? (isLoading ? [] : [])
  const todayTarget = data?.todayTarget   ?? (isLoading ? '' : '전 층 DIV 격주 점검 · B5~8층 34개 측정점')
  // 08:30 이전이면 전날 근무 기준
  const _now = new Date()
  const _today = (_now.getHours() < 8 || (_now.getHours() === 8 && _now.getMinutes() < 30))
    ? new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() - 1)
    : _now
  const { staffRows } = getMonthlySchedule(_today.getFullYear(), _today.getMonth() + 1)
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
    role: STAFF_ROLES[s.id] ?? 'assistant',
    shiftType: (RAW_TO_STYPE[s.shifts[_todayIdx]] ?? 'off') as Staff['shiftType'],
    leaveType: leaveMap[s.id] as Staff['leaveType'],
  }))

  const admin     = dutyStaff.filter(s => s.role === 'admin')
  const assistant = dutyStaff.filter(s => s.role !== 'admin')

  const incomplete = stats.inspectTotal - stats.inspectDone
  const timed     = schedule.filter(s => s.time)
  const untimed   = schedule.filter(s => !s.time)

  const CAT_COLOR: Record<string,string> = { event:'var(--fire)', repair:'var(--danger)', inspect:'var(--acl)', task:'var(--t3)' }

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      <SideMenu    open={sideOpen}    onClose={() => setSideOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* ══ 헤더 ══ */}
      <header style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'8px 12px 9px' }}>

        {/* 1행 */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <button onClick={() => setSideOpen(true)} style={iconBtnStyle}>
            <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)', whiteSpace:'nowrap' }}>차바이오컴플렉스 방재팀</span>
          <div style={{ flex:1 }} />
          <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'var(--t2)', whiteSpace:'nowrap' }}>{datetime}</span>
          <button onClick={() => setSettingsOpen(true)} style={iconBtnStyle}>
            <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        {/* 2행: 관리자(좌) / 보조자(우) */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          {/* 관리자 */}
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <RoleLabel text="관리자" color="rgba(245,158,11,0.75)" />
            <div style={{ display:'flex', gap:5 }}>
              {admin.map(s => <DutyChip key={s.id} staff={s} />)}
            </div>
          </div>

          {/* 보조자 */}
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <RoleLabel text="보조자" color="rgba(110,118,129,0.65)" />
            <div style={{ display:'flex', gap:5 }}>
              {assistant.map(s => <DutyChip key={s.id} staff={s} />)}
            </div>
          </div>

        </div>
      </header>

      {/* ══ 메인 그리드 ══ */}
      <main style={{
        flex:1, minHeight:0, overflow:'hidden',
        display:'grid',
        gridTemplateRows:'auto auto auto 1fr auto',
        gap:7, padding:'7px 11px',
      }}>

        {/* ① 오늘 점검 대상 배너 */}
        <div style={{
          background:'linear-gradient(100deg,rgba(37,99,235,.17),rgba(14,165,233,.08))',
          border:'1px solid rgba(59,130,246,.22)', borderRadius:12,
          padding:'8px 13px', display:'flex', alignItems:'center', gap:9,
          animation:'slideUp .28s ease-out',
        }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--info)', flexShrink:0, animation:'blink 2s ease-in-out infinite' }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:9, fontWeight:700, color:'var(--info)', letterSpacing:'.05em', textTransform:'uppercase' }}>오늘 점검 대상</div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', marginTop:1, lineHeight:1.2 }}>{todayTarget}</div>
          </div>
          {latestAlarm && (
            <>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:9, fontWeight:700, color:'#ef4444', letterSpacing:'.05em' }}>최근 수신반 이력</div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', marginTop:1, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:150 }}>
                  {latestAlarm.location || '장소 미기록'}
                </div>
              </div>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', flexShrink:0, animation:'blink 1s ease-in-out infinite' }} />
            </>
          )}
        </div>

        {/* ② 오늘 현황 */}
        <div style={{ animation:'slideUp .28s .06s ease-out both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:10, fontWeight:700, color:'var(--t2)' }}>오늘 현황</span>
            {stats.streakDays > 0 && (
              <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9.5, fontWeight:600, color:'var(--safe)', background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.2)', padding:'2px 7px', borderRadius:20 }}>
                0/0/0 · {stats.streakDays}일 유지 🔥
              </span>
            )}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {[
              { label:'점검 미완료', val: String(incomplete),           sub:`/${stats.inspectTotal}`, color:'var(--danger)', accent:'var(--danger)' },
              { label:'미조치 항목', val: String(stats.unresolved),     sub:'건',                     color:'var(--warn)',   accent:'var(--warn)'   },
              { label:'오늘 일정',   val: String(stats.scheduleCount),  sub:'건',                     color:'var(--info)',   accent:'var(--info)'   },
              { label:'승강기 고장', val: String(stats.elevatorFault),  sub:'대',                     color: stats.elevatorFault > 0 ? 'var(--danger)' : 'var(--safe)', accent: stats.elevatorFault > 0 ? 'var(--danger)' : 'var(--safe)' },
            ].map(c => (
              <div key={c.label} style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'8px 8px 10px', display:'flex', flexDirection:'column', gap:4, position:'relative', overflow:'hidden', cursor:'pointer' }}>
                <div style={{ fontSize:9, fontWeight:700, color:'var(--t3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.label}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:2, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:20, fontWeight:600, lineHeight:1, color:c.color }}>{c.val}</span>
                  <span style={{ fontSize:9.5, color:'var(--t3)' }}>{c.sub}</span>
                </div>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, borderRadius:'0 0 12px 12px', background:c.accent }} />
              </div>
            ))}
          </div>
        </div>

        {/* ③ 빠른 도구 모음 */}
        <div style={{ animation:'slideUp .28s .12s ease-out both' }}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:5 }}>
            <span style={{ fontSize:10, fontWeight:700, color:'var(--t2)' }}>빠른 도구 모음</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
            {[
              { icon:'🗺️', label:'도면 점검',    desc:'층·동 선택\n도면 + 체크리스트', bg:'rgba(59,130,246,.13)', path:'/inspection' },
              { icon:'📈', label:'DIV 트렌드',   desc:'측정점 선택\n압력 트렌드 차트',  bg:'rgba(14,165,233,.13)', path:'/div'        },
              { icon:'🚨', label:'고장 접수',     desc:'승강기 고장 접수\nTKE 자동 연결', bg:'rgba(239,68,68,.13)',  path:'/elevator?modal=fault_new' },
              { icon:'🍱', label:'직원 서비스',   desc:'연차·식사 이용\n식당 메뉴표',    bg:'rgba(34,197,94,.13)',  path:'/more'       },
            ].map(t => (
              <div
                key={t.label}
                onClick={() => navigate(t.path)}
                style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, padding:'11px 12px', display:'flex', alignItems:'center', gap:11, cursor:'pointer', transition:'all .13s' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.borderColor='var(--bd2)' }}
                onMouseLeave={e => { e.currentTarget.style.background='var(--bg2)'; e.currentTarget.style.borderColor='var(--bd)'  }}
              >
                <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{t.icon}</div>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:'var(--t1)' }}>{t.label}</div>
                  <div style={{ fontSize:9.5, color:'var(--t3)', marginTop:2, lineHeight:1.3, whiteSpace:'pre-line' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ④ 오늘 일정 */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:0, animation:'slideUp .28s .16s ease-out both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 11px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
            <span style={{ fontSize:10, fontWeight:700, color:'var(--t2)' }}>오늘 일정</span>
            <span style={{ fontSize:9.5, color:'var(--t3)', background:'var(--bg3)', padding:'1px 7px', borderRadius:9 }}>{schedule.length}건</span>
          </div>
          <div style={{ overflowY:'auto', flex:1 }}>
            {timed.length > 0 && (
              <>
                <div style={{ padding:'4px 10px 2px', fontSize:8, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase' }}>⏰ 시간 확정</div>
                {timed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
              </>
            )}
            {untimed.length > 0 && (
              <>
                <div style={{ padding:'4px 10px 2px', fontSize:8, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', borderTop:'1px solid var(--bd)', marginTop:2 }}>📋 시간 미정</div>
                {untimed.map(item => <ScheduleRow key={item.id} item={item} catColor={CAT_COLOR} onManualComplete={handleManualComplete} />)}
              </>
            )}
          </div>
        </div>

        {/* ⑤ 이번 달 점검 현황 */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', animation:'slideUp .28s .20s ease-out both' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 11px', borderBottom:'1px solid var(--bd)', flexShrink:0 }}>
            <span style={{ fontSize:10, fontWeight:700, color:'var(--t2)' }}>이번 달 점검 현황</span>
            <span style={{ fontSize:9.5, color:'var(--t3)' }}>{new Date().getFullYear()}년 {new Date().getMonth()+1}월</span>
          </div>
          {monthly.length === 0 ? (
            <div style={{ padding:'14px 0', textAlign:'center', fontSize:11, color:'var(--t3)' }}>이번 달 점검 일정 없음</div>
          ) : (
            <div style={{ overflowX:'auto', scrollbarWidth:'none', padding:'8px 10px 10px', display:'flex', gap:12 }}>
              {monthly.map((m, i) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0, minWidth:64 }}>
                  <Donut pct={m.pct} color={m.color} size={44} />
                  <div style={{ fontSize:8, color:'var(--t3)', textAlign:'center', lineHeight:1.3, maxWidth:72, wordBreak:'keep-all' }}>{m.label}</div>
                  <div style={{ fontSize:8, color: m.pct === 100 ? 'var(--safe)' : 'var(--t3)' }}>{m.done}/{m.total}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

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
      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:9, color:'var(--t3)', width:30, flexShrink:0, paddingTop:1 }}>
        {item.time ?? '—'}
      </div>
      <div style={{ width:2, borderRadius:2, flexShrink:0, alignSelf:'stretch', minHeight:20, background: catColor[item.category] ?? 'var(--t3)' }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--t1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
        {item.memo && <div style={{ fontSize:9, color:'var(--t3)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.memo}</div>}
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
            fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:5,
            background:'var(--bg3)', color:'var(--t3)', border:'1px solid var(--bd)',
            cursor:'pointer', flexShrink:0, whiteSpace:'nowrap'
          }}
        >완료 처리</button>
      )}
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width:34, height:34, borderRadius:8, flexShrink:0,
  background:'var(--bg3)', border:'1px solid var(--bd)',
  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
  transition:'background .13s',
}
