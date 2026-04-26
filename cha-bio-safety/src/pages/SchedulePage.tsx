import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { scheduleApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { generateMonthlyPlan } from '../utils/generateMonthlyPlan'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { HOLIDAYS_FALLBACK } from '../utils/holidays'
import type { ScheduleItem, ScheduleCategory } from '../types'

// ── 날짜 헬퍼 (로컬 시간 기준) ──────────────────────────────
function localYMD(d: Date) {
  const y  = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${dd}`
}
function localYM(d: Date) { return localYMD(d).slice(0, 7) }

async function fetchHolidays(): Promise<Record<string, string>> {
  const res = await fetch('https://holidays.hyunbin.page/basic.json')
  if (!res.ok) throw new Error('fetch failed')
  const data: Record<string, Record<string, string[]>> = await res.json()
  const result: Record<string, string> = {}
  Object.values(data).forEach(yearData => {
    Object.entries(yearData).forEach(([date, names]) => {
      result[date] = names[0] ?? ''
    })
  })
  return result
}

// ── 상수 ────────────────────────────────────────────────────
const INSP_CATEGORIES = [
  '소화기','소화전','방화문','특별피난계단','유도등','방화셔터','DIV','컴프레셔',
  '비상콘센트','배연창','주차장비','완강기','전실제연댐퍼',
  '청정소화약제','연결송수관','소방용전원공급반','회전문','소방펌프','CCTV',
]

const INSP_DEFAULTS: Record<string, { title: string; memo: string }> = {
  '소화기':       { title:'전층 소화기 점검',             memo:'   - 소화기 압력상태 점검\n   - 안전핀 체결상태 확인\n   - 위치표시 스티커 부착상태 점검\n   - 받침대 파손여부 점검' },
  '소화전':       { title:'전층 소화전 점검',             memo:'   - 소화전 앵글밸브 누수여부 점검\n   - 소화전 호스 및 관창 상태 점검\n   - 발신기 및 표시등 상태 점검' },
  '방화문':       { title:'전층 방화문 동작상태 점검',    memo:'   - 방화문 폐쇄상태 및 파손상태 점검\n   - 방화문 도어첵크 설치상태 점검' },
  '특별피난계단': { title:'전층 피난계단 점검',           memo:'   - 계단내 적재물 상태점검\n   - 계단 통로유도등 점검' },
  '유도등':       { title:'전층 유도등 점검',             memo:'   - 유도등 점등상태 및 부착상태 점검\n   - 상용전원 및 예비전원 점검' },
  '방화셔터':     { title:'전층 방화셔터 점검',           memo:'   - 방화셔터 수동 업,다운 점검\n   - 연동제어기 전원 및 예비전원 점검\n   - 방화셔터 하부 물품적치상태 점검 및 이동조치' },
  'DIV':          { title:'전층 DIV 점검',               memo:'   - 밸브 정위치 상태 점검 및 누기상태 점검\n   - 1차수압 및 2차 공기압 상태 점검\n   - 클래퍼 셋팅압력 점검\n   - 압력스위치 상태점검' },
  '컴프레셔':     { title:'전층 DIV 컴프레셔 점검',      memo:'   - 컴프레샤 작동상태 압력 점검\n   - 컴프레샤 오일상태 체크 및 작동시험' },
  '비상콘센트':   { title:'전층 비상 콘센트 설비 점검',  memo:'   - 단상220V, 삼상380V 전압 측정\n   - 차단기 점검 및 트립버튼 점검' },
  '배연창':       { title:'전층 배연창 점검',             memo:'   - 배연창 기밀상태 점검\n   - 현장 수동기동 테스트\n   - 배연창 동작시 화재수신반 시그널 확인상태 점검' },
  '주차장비':     { title:'주차관제 시스템 점검',         memo:'   - 2층 및 B1층 주차상태 표시기 점검\n   - 주차입, 출구 차단바 작동상태 점검\n   - B1층 주차시스템 표시 상태 점검 및 차량출입 상태 점검\n   - 주차램프구간내 차량검지기 상태 점검' },
  '완강기':       { title:'전층 완강기 점검',             memo:'   - 지지대 고정상태 점검\n   - 완강기 장비 배치상태 점검\n   - 완강기 및 장비 외관 청소' },
  '전실제연댐퍼': { title:'1F~B5F 특별피난계단 전실댐퍼(급,배기) 점검', memo:'   - 급,배기 댐퍼 모터동작 및 개폐상태 점검\n   - 댐퍼 동작시 방재실 화재수신반 점등확인' },
  '청정소화약제': { title:'가스소화설비(집합관,모듈러) 점검', memo:'   - 소화약제 저장용기 압력상태 점검\n   - 회로도통시험 및 예비전원 시험\n   - 솔레노이드 체결상태 점검' },
  '연결송수관':   { title:'연결송수관 설비 점검',         memo:'   - 1층, B4층 배관 점검 및 오토드립밸브 점검\n   - 2층, B1층 송수구 점검 및 연결부 이상유무 점검' },
  '소방용전원공급반': { title:'화재수신기 및 전원공급반 점검', memo:'   - 전층 전원공급반 전압상태 확인\n   - 휴즈 및 LED 점등상태 확인\n   - 중계기 통신상태 점검 및 예비전원 시험' },
  '회전문':       { title:'회전문 점검',                 memo:'   - 구리스 주입 및 안전센서 점검' },
  '소방펌프':     { title:'소방펌프 점검',               memo:'   - 밸브 개폐상태 점검 및 템퍼스위치 점검\n   - 압력셋팅 확인 및 MCC반 조작스위치 상태 점검\n   - 펌프 수동테스트\n   - 밸브 동작시 화재수신반 시그널 확인상태 점검' },
  'CCTV':         { title:'전층 CCTV 및 DVR 점검',       memo:'   - CCTV 부착상태 및 화각체크\n   - DVR 작동상태 및 녹화상태 점검' },
}

const ELEV_SUBCATS = ['승강기 정기 점검', '승강기 수리', '승강기 법정 검사'] as const
const FIRE_SUBCATS = ['소방 상반기 종합정밀점검', '소방 하반기 작동기능점검', '소방 시설물 공사', '소방 관공서 불시 점검'] as const

type ElevSubCat = typeof ELEV_SUBCATS[number]
type FireSubCat = typeof FIRE_SUBCATS[number]

const ELEV_AGENCY: Record<ElevSubCat, string> = {
  '승강기 정기 점검': 'TKE',
  '승강기 수리': 'TKE',
  '승강기 법정 검사': '한국승강기안전공단',
}
const FIRE_AGENCY: Record<FireSubCat, string> = {
  '소방 상반기 종합정밀점검': '동양소방',
  '소방 하반기 작동기능점검': '동양소방',
  '소방 시설물 공사':       '동양소방',
  '소방 관공서 불시 점검':   '성남소방서',
}

const SCHED_CATEGORIES: { value: ScheduleCategory; label: string; color: string }[] = [
  { value:'inspect',  label:'점검',  color:'#3b82f6' },
  { value:'task',     label:'업무',  color:'#eab308' },
  { value:'event',    label:'행사',  color:'#e2e8f0' },
  { value:'elevator', label:'승강기', color:'#f97316' },
  { value:'fire',     label:'소방',  color:'#ef4444' },
]

const STATUS_LABEL: Record<string,{label:string;color:string}> = {
  pending:     { label:'예정',   color:'var(--t3)'     },
  in_progress: { label:'진행중', color:'var(--acl)'    },
  done:        { label:'완료',   color:'var(--safe)'   },
  overdue:     { label:'지연',   color:'var(--danger)' },
}

const WEEK_DAYS = ['일','월','화','수','목','금','토']

// ── 미리보기 행 정의 ──────────────────────────────────────────
const PLAN_PREVIEW_ROWS: { label: string; daily?: boolean; cats?: string[]; cl?: Record<string,string>; note?: string }[] = [
  { label: '소화설비 점검(소화기, 소화전)', cats: ['소화기','소화전'], cl: {'소화기':'기','소화전':'전'} },
  { label: '경보설비 점검(자탐설비, 비상방송설비)', daily: true, note: '일상점검' },
  { label: '피난설비(유도등 및 완강기) 점검', daily: true, note: '일상점검' },
  { label: '더블인터록밸브 점검(콤프레셔포함)', cats: ['DIV','컴프레셔','유도등','배연창','완강기'], cl: {'유도등':'유도등','배연창':'배연창','완강기':'완강기'}, note: '격주' },
  { label: '소화 활동설비(전실제연댐퍼,연결송수관)', cats: ['전실제연댐퍼','연결송수관'] },
  { label: '특별피난계단 점검', cats: ['특별피난계단'] },
  { label: '소방펌프 주변 점검(MCC, 지하수조)', daily: true, note: '일상점검' },
  { label: '청정소화약제 점검', cats: ['청정소화약제','소방펌프'], cl: {'소방펌프':'펌프'}, note: '펌프' },
  { label: '배연창 관리상태 점검', daily: true, note: '일상점검' },
  { label: '화재수신반 점검', daily: true, note: '일상점검' },
  { label: '방화셔터 연동제어기 점검', cats: ['방화셔터'] },
  { label: '피난,방화시설 집중점검(비파라치)', cats: ['방화문'] },
  { label: '옥상 및 취약지구 순찰점검', daily: true, note: '일상점검' },
  { label: '전층 방화문 점검', cats: ['방화문'], note: '방화문' },
  { label: '비상콘센트 설비 점검', cats: ['비상콘센트'], note: '소화전' },
  { label: '소방용 전원공급반 점검', cats: ['소방용전원공급반'] },
  { label: '승강기 점검(운행상태, AS신청)', daily: true, note: '일상점검' },
  { label: '출입통제 시스템 및 CCTV 점검', daily: true, note: '상황발생시 현장점검' },
  { label: '주차장비 시스템', cats: ['주차장비','CCTV'], cl: {'CCTV':'cctv'} },
  { label: '회전문 점검', cats: ['회전문'] },
  { label: '전관방송 시스템 점검', daily: true, note: '일상점검' },
]

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function SchedulePage() {
  const navigate  = useNavigate()
  const { staff } = useAuthStore()
  const qc        = useQueryClient()
  const isDesktop = useIsDesktop()

  const today    = localYMD(new Date())
  const [curMonth, setCurMonth] = useState(() => localYM(new Date()))
  const [selDate,  setSelDate]  = useState(today)
  const [showAdd,  setShowAdd]  = useState(false)
  const [editItem, setEditItem] = useState<ScheduleItem | null>(null)
  const [planLoading, setPlanLoading] = useState(false)

  const { data: fetchedHolidays } = useQuery({
    queryKey: ['holidays'],
    queryFn:  fetchHolidays,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  })
  const holidays = fetchedHolidays ?? HOLIDAYS_FALLBACK

  const { data: monthItems = [], isLoading } = useQuery({
    queryKey: ['schedule', curMonth],
    queryFn:  () => scheduleApi.getByMonth(curMonth),
    staleTime: 10_000,
  })

  // 범위 일정: 시작일~종료일 사이 모든 날짜에 표시
  const matchesDate = (item: ScheduleItem, d: string) =>
    d >= item.date && d <= (item.endDate ?? item.date)

  const dayItems = useMemo(
    () => [...monthItems.filter(i => matchesDate(i, selDate))]
            .sort((a,b) => (a.time??'99:99').localeCompare(b.time??'99:99')),
    [monthItems, selDate]
  )

  const dotMap = useMemo(() => {
    const m: Record<string, ScheduleCategory[]> = {}
    const [y, mo] = curMonth.split('-').map(Number)
    const daysInMonth = new Date(y, mo, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const dd = `${curMonth}-${String(d).padStart(2, '0')}`
      monthItems.forEach(i => {
        if (matchesDate(i, dd)) (m[dd] ??= []).push(i.category)
      })
    }
    return m
  }, [monthItems, curMonth])

  const calDays = useMemo(() => {
    const [y, mo] = curMonth.split('-').map(Number)
    const first   = new Date(y, mo - 1, 1)
    const last    = new Date(y, mo, 0)
    const startDow = first.getDay()
    const cells: (string|null)[] = Array(startDow).fill(null)
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(localYMD(new Date(y, mo - 1, d)))
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [curMonth])

  const shiftMonth = (delta: number) => {
    const [y, mo] = curMonth.split('-').map(Number)
    setCurMonth(localYM(new Date(y, mo - 1 + delta, 1)))
  }

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['schedule', curMonth] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const handleStatus = async (item: ScheduleItem, status: string) => {
    await scheduleApi.updateStatus(item.id, status)
    invalidate()
    toast.success(status === 'done' ? '완료 처리됐습니다' : '상태 변경됐습니다')
  }

  const handleDelete = async (item: ScheduleItem) => {
    try {
      await scheduleApi.delete(item.id)
      invalidate()
      toast.success('삭제됐습니다')
    } catch (e: any) {
      toast.error(e?.message ?? '삭제 중 오류가 발생했습니다')
    }
  }

  const catInfo = (c: string) => SCHED_CATEGORIES.find(x => x.value === c)

  const handlePlanDownload = async () => {
    const [y, mo] = curMonth.split('-').map(Number)
    setPlanLoading(true)
    try {
      await generateMonthlyPlan(y, mo)
      toast.success('엑셀이 다운로드됐습니다')
    } catch (e: any) {
      toast.error(e?.message ?? '생성 중 오류')
    } finally {
      setPlanLoading(false)
    }
  }

  // ── 공통 요소 ──────────────────────────────────────────────
  const calendarEl = (
    <>
      {/* 월 이동 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <button onClick={() => shiftMonth(-1)} style={arrowBtn}>‹</button>
        <span style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>
          {curMonth.split('-')[0]}년 {parseInt(curMonth.split('-')[1])}월
        </span>
        <button onClick={() => shiftMonth(1)} style={arrowBtn}>›</button>
      </div>

      {/* 캘린더 */}
      <div style={{ background:'var(--bg2)', borderRadius:14, border:'1px solid var(--bd)', overflow:'hidden', marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid var(--bd)' }}>
          {WEEK_DAYS.map((d,i) => (
            <div key={d} style={{ textAlign:'center', padding:'7px 0', fontSize:10, fontWeight:600,
              color: i===0 ? '#ef4444' : i===6 ? 'var(--acl)' : 'var(--t3)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {calDays.map((date, idx) => {
            if (!date) return <div key={idx} />
            const isToday   = date === today
            const isSel     = date === selDate
            const dow       = idx % 7
            const isHoliday = !!holidays[date]
            const dots      = dotMap[date] ?? []
            const isRed     = dow === 0 || isHoliday

            return (
              <button key={idx} onClick={() => setSelDate(date)}
                style={{ padding:'5px 0 7px', cursor:'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                  borderRadius: isSel ? 8 : 0,
                  background: isSel ? 'rgba(59,130,246,0.15)' : 'transparent',
                  border: isSel ? '2px solid #3b82f6' : '2px solid transparent',
                  boxSizing: 'border-box' }}>
                <span style={{
                  fontSize:12, fontWeight: isToday||isSel ? 700:400,
                  color: isSel ? 'var(--acl)' : isToday ? '#fff' : isRed ? '#ef4444' : dow===6 ? 'var(--acl)' : 'var(--t1)',
                  width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center',
                  borderRadius:'50%', background: isToday&&!isSel ? 'var(--acl)':'transparent',
                }}>
                  {parseInt(date.slice(8))}
                </span>
                <div style={{ display:'flex', gap:2, height:4 }}>
                  {dots.slice(0,3).map((cat,ci) => (
                    <span key={ci} style={{ width:4, height:4, borderRadius:'50%', background: catInfo(cat)?.color??'var(--t3)' }} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 공휴일 표시 */}
      {holidays[selDate] && (
        <div style={{ marginBottom:8, fontSize:11, color:'#ef4444', fontWeight:600, paddingLeft:2 }}>
          {holidays[selDate]}
        </div>
      )}
    </>
  )

  // ── 일정 카드 1개 렌더 ────────────────────────────────────
  const renderCard = (item: ScheduleItem, grouped?: boolean) => {
    const cat = catInfo(item.category)
    const st  = STATUS_LABEL[item.status] ?? STATUS_LABEL.pending
    return (
      <div key={item.id} style={{ background:'var(--bg2)', borderRadius:10, border:'1px solid var(--bd)', padding:'10px 12px', ...(grouped ? { height: 130, display:'flex', flexDirection:'column' as const } : {}) }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4, flexWrap:'wrap' }}>
          {!grouped && (
            <span style={{ fontSize:10, fontWeight:700, color:cat?.color, background:`${cat?.color}22`, borderRadius:5, padding:'2px 7px' }}>
              {cat?.label}
            </span>
          )}
          {item.inspectionCategory && (
            <span style={{ fontSize:10, color:'var(--info)', background:'rgba(14,165,233,0.12)', borderRadius:5, padding:'2px 6px' }}>
              {item.inspectionCategory}
            </span>
          )}
          <span style={{ fontSize:10, color:st.color, marginLeft:'auto' }}>{st.label}</span>
        </div>
        <div style={{ fontSize:12, fontWeight:600, color:'var(--t1)', marginBottom: (item.memo || item.time) ? 3 : 0 }}>{item.title}</div>
        <div style={{ flex: grouped ? 1 : undefined, minHeight: 0, overflow:'hidden' }}>
          {item.memo && <div style={{ fontSize:10, color:'var(--t2)', lineHeight:1.4, whiteSpace:'pre-line', marginBottom: item.time ? 3 : 0, display:'-webkit-box', WebkitLineClamp: grouped ? 2 : 3, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>{item.memo}</div>}
          {item.time && <div style={{ fontSize:10, color:'var(--t3)' }}>🕐 {item.time}</div>}
        </div>
        <div style={{ display:'flex', gap:4, marginTop: grouped ? 'auto' : 5, paddingTop: grouped ? 4 : 0 }}>
          {item.status !== 'done' && (
            <button onClick={() => handleStatus(item,'done')}
              style={{ padding:'3px 7px', borderRadius:6, border:'1px solid var(--safe)', background:'rgba(34,197,94,0.1)', color:'var(--safe)', fontSize:10, fontWeight:700, cursor:'pointer' }}>
              완료
            </button>
          )}
          <button onClick={() => setEditItem(item)}
            style={{ padding:'3px 7px', borderRadius:6, border:'1px solid var(--bd2)', background:'var(--bg3)', color:'var(--t2)', fontSize:10, cursor:'pointer' }}>
            수정
          </button>
          <button onClick={() => handleDelete(item)}
            style={{ padding:'3px 7px', borderRadius:6, border:'1px solid var(--bd)', background:'var(--bg3)', color:'var(--t3)', fontSize:10, cursor:'pointer' }}>
            삭제
          </button>
        </div>
      </div>
    )
  }

  const scheduleListEl = (
    <>
      <div style={{ display:'flex', alignItems:'center', marginBottom:8, gap:6 }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--t2)' }}>
          {selDate === today ? '오늘' : `${selDate.slice(5).replace('-','/')}`} 일정
        </span>
        <span style={{ fontSize:11, color:'var(--t3)' }}>{dayItems.length}건</span>
        <span style={{ flex:1 }}/>
        {isDesktop && (
          <button onClick={() => setShowAdd(true)}
            style={{ padding:'5px 12px', borderRadius:7, border:'none', background:'var(--acl)', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            + 추가
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign:'center', padding:32, color:'var(--t3)', fontSize:12 }}>불러오는 중...</div>
      ) : dayItems.length === 0 ? (
        <div style={{ textAlign:'center', padding:'28px 0', color:'var(--t3)', fontSize:12 }}>
          등록된 일정이 없습니다<br/>
          <button onClick={() => setShowAdd(true)}
            style={{ marginTop:12, padding:'8px 16px', borderRadius:8, border:'1px solid var(--bd2)', background:'var(--bg2)', color:'var(--t2)', fontSize:12, cursor:'pointer' }}>
            + 일정 추가
          </button>
        </div>
      ) : isDesktop ? (
        /* 데스크톱: 카테고리별 컬럼 */
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', flexWrap:'wrap' }}>
          {(() => {
            // 카테고리별 그룹핑
            const groups: Record<string, ScheduleItem[]> = {}
            for (const item of dayItems) {
              const key = item.category
              if (!groups[key]) groups[key] = []
              groups[key].push(item)
            }
            return Object.entries(groups).map(([catKey, items]) => {
              const cat = catInfo(catKey)
              return (
                <div key={catKey} style={{ flex:'0 0 auto', width: 300, minWidth: 0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color: cat?.color, marginBottom:5, padding:'3px 0', borderBottom:`2px solid ${cat?.color}44` }}>
                    {cat?.label} ({items.length})
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {items.map(item => renderCard(item, true))}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {dayItems.map(item => renderCard(item))}
        </div>
      )}
    </>
  )

  const modalsEl = (
    <>
      {showAdd && (
        <AddModal
          defaultDate={selDate}
          staffId={staff?.id ?? '2018042451'}
          onClose={() => setShowAdd(false)}
          onSaved={() => { invalidate(); toast.success('일정 추가됨') }}
          onDateChange={setSelDate}
          isDesktop={isDesktop}
        />
      )}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { invalidate(); setEditItem(null); toast.success('수정됐습니다') }}
          isDesktop={isDesktop}
        />
      )}
    </>
  )

  // ── 렌더 — 데스크톱 ────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg)' }}>
        {/* 상단 헤더 */}
        <div style={{ padding:'10px 24px', borderBottom:'1px solid var(--bd)', display:'flex', alignItems:'center', gap:8, flexShrink:0, background:'var(--bg2)' }}>
          <span style={{ flex:1, fontSize:15, fontWeight:700, color:'var(--t1)' }}>점검 계획 관리</span>
          <button onClick={handlePlanDownload} disabled={planLoading}
            style={{ padding:'6px 12px', borderRadius:8, border:'none', background: planLoading ? 'var(--bg3)' : 'linear-gradient(135deg,#15803d,#22c55e)', color: planLoading ? 'var(--t3)' : '#fff', fontSize:12, fontWeight:700, cursor: planLoading ? 'default' : 'pointer', display:'flex', alignItems:'center', gap:5 }}>
            <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4M4 19h16"/></svg>
            {planLoading ? '생성 중...' : '엑셀 다운로드'}
          </button>
        </div>

        {/* 상단: 월간 점검 계획 테이블 */}
        <div style={{ flexShrink:0, overflow:'hidden', borderBottom:'1px solid var(--bd)' }}>
          <MonthlyPlanPreview curMonth={curMonth} items={monthItems} holidays={holidays} todayStr={today} />
        </div>

        {/* 하단: 좌=달력, 우=일정 */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {/* 달력 */}
          <div style={{ width:380, flexShrink:0, overflowY:'auto', padding:'16px 20px', borderRight:'1px solid var(--bd)' }}>
            {calendarEl}
          </div>
          {/* 일정 리스트 */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
            {scheduleListEl}
          </div>
        </div>

        {modalsEl}
      </div>
    )
  }

  // ── 렌더 — 모바일 ──────────────────────────────────────────
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>

      <header style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'8px 12px 9px', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => navigate(-1)} style={iconBtn}>
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--t1)' }}>점검 계획 관리</span>
        <button onClick={handlePlanDownload} disabled={planLoading}
          style={{ padding:'6px 12px', borderRadius:8, border:'none', background: planLoading ? 'var(--bg3)' : 'linear-gradient(135deg,#15803d,#22c55e)', color: planLoading ? 'var(--t3)' : '#fff', fontSize:12, fontWeight:700, cursor: planLoading ? 'default' : 'pointer', display:'flex', alignItems:'center', gap:5 }}>
          <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4M4 19h16"/></svg>
          {planLoading ? '생성 중...' : '엑셀 다운로드'}
        </button>
        <button onClick={() => setShowAdd(true)}
          style={{ padding:'6px 14px', borderRadius:8, border:'none', background:'var(--acl)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          + 추가
        </button>
      </header>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 24px' }}>
        {calendarEl}
        {scheduleListEl}
      </div>

      {modalsEl}
    </div>
  )
}

// ── 월간 점검 계획 테이블 ──────────────────────────────────────
function MonthlyPlanPreview({ curMonth, items, holidays, todayStr }: {
  curMonth: string; items: ScheduleItem[]; holidays: Record<string, string>; todayStr: string
}) {
  const [y, mo] = curMonth.split('-').map(Number)
  const daysInMonth = new Date(y, mo, 0).getDate()
  const firstDow = new Date(y, mo - 1, 1).getDay()
  const DOW = ['일','월','화','수','목','금','토']

  // 날짜별 카테고리 매핑
  const dayCatMap = useMemo(() => {
    const m: Record<number, Set<string>> = {}
    for (const item of items) {
      if (item.category !== 'inspect' || !item.inspectionCategory) continue
      const sd = parseInt(item.date.split('-')[2])
      const ed = item.endDate ? parseInt(item.endDate.split('-')[2]) : sd
      for (let d = sd; d <= ed; d++) {
        if (!m[d]) m[d] = new Set()
        m[d].add(item.inspectionCategory)
      }
    }
    return m
  }, [items])

  const cellStyle: React.CSSProperties = {
    border: '1px solid var(--bd)', padding: '3px 1px', textAlign: 'center',
    fontSize: 11, lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--t1)',
  }
  const headCell: React.CSSProperties = { ...cellStyle, fontWeight: 700, background: 'var(--bg3)', color: 'var(--t1)' }

  return (
    <div style={{ width: '100%', padding: '12px 20px 8px', background: 'var(--bg2)' }}>
      {/* 타이틀 */}
      <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--t1)' }}>
        {mo}월 중요업무추진계획(방재)
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          {/* 날짜 행 */}
          <tr>
            <th style={{ ...headCell, width: '2%' }}></th>
            <th style={{ ...headCell, width: '20%' }}>시행일자</th>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dow = (firstDow + i) % 7
              const dateStr = `${curMonth}-${String(i + 1).padStart(2, '0')}`
              const isHol = !!holidays[dateStr]
              const isTdy = dateStr === todayStr
              return (
                <th key={i} style={{
                  ...headCell,
                  color: dow === 0 || isHol ? '#ef4444' : dow === 6 ? '#3b82f6' : 'var(--t1)',
                  background: isTdy ? 'rgba(59,130,246,0.18)' : dow === 0 || isHol ? 'rgba(239,68,68,0.08)' : dow === 6 ? 'rgba(59,130,246,0.08)' : 'var(--bg3)',
                  borderLeft: isTdy ? '2px solid var(--acl)' : undefined,
                  borderRight: isTdy ? '2px solid var(--acl)' : undefined,
                  borderTop: isTdy ? '2px solid var(--acl)' : undefined,
                }}>
                  {i + 1}
                </th>
              )
            })}
            <th style={{ ...headCell, width: '6%' }}>비고</th>
          </tr>
          {/* 요일 행 */}
          <tr>
            <th style={{ ...headCell, width: '2%' }}>NO.</th>
            <th style={{ ...headCell, textAlign: 'left', paddingLeft: 6 }}>내 &nbsp; 용</th>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dow = (firstDow + i) % 7
              const dateStr = `${curMonth}-${String(i + 1).padStart(2, '0')}`
              const isHol = !!holidays[dateStr]
              const isTdy = dateStr === todayStr
              return (
                <th key={i} style={{
                  ...headCell, fontWeight: 600,
                  color: dow === 0 || isHol ? '#ef4444' : dow === 6 ? '#3b82f6' : 'var(--t1)',
                  borderLeft: isTdy ? '2px solid var(--acl)' : undefined,
                  borderRight: isTdy ? '2px solid var(--acl)' : undefined,
                }}>
                  {DOW[dow]}
                </th>
              )
            })}
            <th style={headCell} />
          </tr>
        </thead>
        <tbody>
          {PLAN_PREVIEW_ROWS.map((row, ri) => (
            <tr key={ri}>
              <td style={{ ...cellStyle, fontWeight: 600 }}>{ri + 1}</td>
              <td style={{ ...cellStyle, textAlign: 'left', paddingLeft: 6, fontSize: 10 }}>{row.label}</td>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1
                const dow = (firstDow + i) % 7
                const dateStr = `${curMonth}-${String(d).padStart(2, '0')}`
                const isHol = !!holidays[dateStr]
                const isWeekend = dow === 0 || dow === 6 || isHol
                const isTdy = dateStr === todayStr

                let text = ''
                if (row.daily) {
                  text = '점검'
                } else if (row.cats) {
                  const dayCats = dayCatMap[d]
                  if (dayCats) {
                    for (const cat of row.cats) {
                      if (dayCats.has(cat)) {
                        text = row.cl?.[cat] ?? '점검'
                        break
                      }
                    }
                  }
                }

                const isLastRow = ri === PLAN_PREVIEW_ROWS.length - 1

                return (
                  <td key={i} style={{
                    ...cellStyle, fontSize: 10,
                    color: text ? 'var(--t1)' : 'transparent',
                    background: isWeekend ? (dow === 0 || isHol ? 'rgba(239,68,68,0.06)' : 'rgba(59,130,246,0.06)')
                      : text && !row.daily ? 'rgba(34,197,94,0.1)' : 'transparent',
                    borderLeft: isTdy ? '2px solid var(--acl)' : undefined,
                    borderRight: isTdy ? '2px solid var(--acl)' : undefined,
                    borderBottom: isTdy && isLastRow ? '2px solid var(--acl)' : undefined,
                  }}>
                    {text || '.'}
                  </td>
                )
              })}
              <td style={{ ...cellStyle, fontSize: 9, color: 'var(--t3)', whiteSpace: 'normal', lineHeight: 1.2 }}>
                {row.note ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── 추가 모달 ────────────────────────────────────────────────
function AddModal({ defaultDate, staffId, onClose, onSaved, onDateChange, isDesktop }: {
  defaultDate: string; staffId: string; onClose: ()=>void; onSaved: ()=>void; onDateChange: (d: string) => void; isDesktop?: boolean
}) {
  const [cat,        setCat]       = useState<ScheduleCategory>('inspect')
  const [insCat,     setInsCat]   = useState('')
  const [inspTitle,  setInspTitle]= useState('')
  const [title,      setTitle]    = useState('')
  const [memo,       setMemo]     = useState('')

  const handleCat = (v: ScheduleCategory) => {
    setCat(v)
    setInsCat(''); setInspTitle(''); setTitle(''); setMemo('')
  }

  const handleInsCat = (v: string) => {
    setInsCat(v)
    const def = INSP_DEFAULTS[v]
    setInspTitle(def?.title ?? v)
    setMemo(def?.memo ?? '')
  }
  const [date,      setDate]      = useState(defaultDate)
  const [time,      setTime]      = useState('')
  const [endDate,   setEndDate]   = useState(defaultDate)
  const [endTime,   setEndTime]   = useState('')
  const [elevSub,   setElevSub]   = useState<ElevSubCat>('승강기 정기 점검')
  const [elevAgency,setElevAgency]= useState(ELEV_AGENCY['승강기 정기 점검'])
  const [fireSub,   setFireSub]   = useState<FireSubCat>('소방 상반기 종합정밀점검')
  const [fireAgency,setFireAgency]= useState(FIRE_AGENCY['소방 상반기 종합정밀점검'])
  const [saving,    setSaving]    = useState(false)

  const handleElevSub = (v: ElevSubCat) => { setElevSub(v); setElevAgency(ELEV_AGENCY[v]) }
  const handleFireSub = (v: FireSubCat) => { setFireSub(v); setFireAgency(FIRE_AGENCY[v]) }

  const shiftDate = (delta: number) => {
    const [y, m, d] = date.split('-').map(Number)
    const next = localYMD(new Date(y, m - 1, d + delta))
    setDate(next)
    onDateChange(next)
    if (!endDate || endDate < next) setEndDate(next)
  }

  // 범위 일수 계산
  const rangeDays = (date && endDate && endDate >= date)
    ? Math.round((new Date(endDate).getTime() - new Date(date).getTime()) / 86400000) + 1
    : 0

  const handleSave = async () => {
    if (!date) { toast.error('날짜를 입력하세요'); return }

    let finalTitle = ''
    let finalInsCat: string|undefined

    if (cat === 'inspect') {
      if (!insCat) { toast.error('점검 분류를 선택하세요'); return }
      finalTitle  = inspTitle.trim() || insCat
      finalInsCat = insCat
    } else if (cat === 'elevator') {
      finalTitle  = elevSub
      finalInsCat = elevAgency
    } else if (cat === 'fire') {
      finalTitle  = fireSub
      finalInsCat = fireAgency
    } else {
      if (!title.trim()) { toast.error('제목을 입력하세요'); return }
      finalTitle = title.trim()
    }

    setSaving(true)
    try {
      const hasRange = endDate && endDate > date
      await scheduleApi.create({
        title:              finalTitle,
        date,
        time:               time || undefined,
        category:           cat,
        assigneeId:         staffId,
        inspectionCategory: finalInsCat,
        memo:               memo || undefined,
        ...(hasRange ? { end_date: endDate } : {}),
      })
      onSaved()
    } catch {
      toast.error('저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300, display:'flex', flexDirection:'column', justifyContent: isDesktop ? 'center' : 'flex-end', alignItems: isDesktop ? 'center' : undefined }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background:'var(--bg2)',
          borderRadius: isDesktop ? 16 : '20px 20px 0 0',
          padding: isDesktop ? '24px 28px 28px' : '20px 16px 40px',
          maxHeight:'90dvh', overflowY:'auto',
          ...(isDesktop ? { width: 480, maxWidth: '90vw' } : {}),
        }}>

        {/* 헤더 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>일정 추가</span>
          <button onClick={onClose}
            style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--bd)', background:'var(--bg3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* 1. 구분 — 1행 5열 */}
          <div>
            <label style={lbl}>구분</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:5 }}>
              {SCHED_CATEGORIES.map(c => (
                <button key={c.value} onClick={() => handleCat(c.value)}
                  style={{ padding:'8px 0', borderRadius:8,
                    border:`1px solid ${cat===c.value?c.color:'var(--bd)'}`,
                    background: cat===c.value?`${c.color}22`:'var(--bg3)',
                    color: cat===c.value?c.color:'var(--t2)',
                    fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 점검 ── */}
          {cat === 'inspect' && (
            <>
              <div>
                <label style={lbl}>점검 분류</label>
                <select value={insCat} onChange={e => handleInsCat(e.target.value)} style={inp}>
                  <option value="">-- 선택하세요 --</option>
                  {INSP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {insCat && (
                <>
                  <div>
                    <label style={lbl}>제목</label>
                    <input value={inspTitle} onChange={e=>setInspTitle(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>내용</label>
                    <textarea value={memo} onChange={e=>setMemo(e.target.value)}
                      rows={5} style={{ ...inp, resize:'none', lineHeight:1.6 }} />
                  </div>
                </>
              )}
            </>
          )}

          {/* ── 업무 / 행사 ── */}
          {(cat === 'task' || cat === 'event') && (
            <>
              <div>
                <label style={lbl}>제목</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="일정 제목" style={inp} />
              </div>
              <div>
                <label style={lbl}>내용 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span></label>
                <textarea value={memo} onChange={e=>setMemo(e.target.value)}
                  placeholder="상세 내용을 입력하세요" rows={3}
                  style={{ ...inp, resize:'none', lineHeight:1.5 }} />
              </div>
            </>
          )}

          {/* ── 승강기 ── */}
          {cat === 'elevator' && (
            <>
              <div>
                <label style={lbl}>제목</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                  {ELEV_SUBCATS.map(v => (
                    <button key={v} onClick={() => handleElevSub(v)}
                      style={{ padding:'9px 0', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer',
                        border:`1px solid ${elevSub===v?'#f97316':'var(--bd)'}`,
                        background: elevSub===v?'rgba(249,115,22,0.15)':'var(--bg3)',
                        color: elevSub===v?'#f97316':'var(--t2)' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>업체 및 기관</label>
                <input value={elevAgency} onChange={e=>setElevAgency(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>내용 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span></label>
                <textarea value={memo} onChange={e=>setMemo(e.target.value)}
                  placeholder="상세 내용을 입력하세요" rows={3}
                  style={{ ...inp, resize:'none', lineHeight:1.5 }} />
              </div>
            </>
          )}

          {/* ── 소방 ── */}
          {cat === 'fire' && (
            <>
              <div>
                <label style={lbl}>제목</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
                  {FIRE_SUBCATS.map(v => (
                    <button key={v} onClick={() => handleFireSub(v)}
                      style={{ padding:'8px 4px', borderRadius:9, fontSize:10, fontWeight:700, cursor:'pointer', lineHeight:1.4,
                        border:`1px solid ${fireSub===v?'#ef4444':'var(--bd)'}`,
                        background: fireSub===v?'rgba(239,68,68,0.13)':'var(--bg3)',
                        color: fireSub===v?'#ef4444':'var(--t2)' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>업체 및 기관</label>
                <input value={fireAgency} onChange={e=>setFireAgency(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>내용 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span></label>
                <textarea value={memo} onChange={e=>setMemo(e.target.value)}
                  placeholder="상세 내용을 입력하세요" rows={3}
                  style={{ ...inp, resize:'none', lineHeight:1.5 }} />
              </div>
            </>
          )}

          {/* 시작일 / 시작시간 */}
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:'0 0 calc(50% - 5px)', minWidth:0, overflow:'hidden' }}>
              <label style={lbl}>시작일</label>
              <input type="date" value={date} onChange={e=>{ const v=e.target.value; setDate(v); onDateChange(v); if(!endDate||endDate<v) setEndDate(v) }}
                style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }} />
            </div>
            <div style={{ flex:'0 0 calc(50% - 5px)', minWidth:0, overflow:'hidden' }}>
              <label style={lbl}>시작시간 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span></label>
              <input type="time" value={time} onChange={e=>setTime(e.target.value)}
                style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }} />
            </div>
          </div>

          {/* 종료일 / 종료시간 */}
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:'0 0 calc(50% - 5px)', minWidth:0, overflow:'hidden' }}>
              <label style={lbl}>종료일 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span></label>
              <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} min={date}
                style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }} />
            </div>
            <div style={{ flex:'0 0 calc(50% - 5px)', minWidth:0, overflow:'hidden' }}>
              <label style={lbl}>종료시간 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span></label>
              <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)}
                style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }} />
            </div>
          </div>

          {/* N일 미리보기 */}
          {rangeDays > 1 && (
            <div style={{ fontSize:12, color:'var(--acl)', fontWeight:600, textAlign:'center', marginTop:-8 }}>
              {rangeDays}일 일정이 추가됩니다
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 3fr 1fr', gap:6, marginTop:4 }}>
            <button onClick={() => shiftDate(-1)} disabled={saving}
              style={{ padding:'14px 0', borderRadius:12, border:'1px solid var(--bd2)',
                background:'var(--bg3)', color:'var(--t2)', fontSize:18, lineHeight:1,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              ‹
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding:'14px', borderRadius:12, border:'none',
                background:'linear-gradient(135deg,#1d4ed8,#2563eb)',
                color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer',
                opacity:saving?0.6:1 }}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button onClick={() => shiftDate(1)} disabled={saving}
              style={{ padding:'14px 0', borderRadius:12, border:'1px solid var(--bd2)',
                background:'var(--bg3)', color:'var(--t2)', fontSize:18, lineHeight:1,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 수정 모달 ────────────────────────────────────────────────
function EditModal({ item, onClose, onSaved, isDesktop }: {
  item: ScheduleItem; onClose: () => void; onSaved: () => void; isDesktop?: boolean
}) {
  const [title,  setTitle]  = useState(item.title)
  const [date,   setDate]   = useState(item.date)
  const [time,   setTime]   = useState(item.time ?? '')
  const [memo,   setMemo]   = useState(item.memo ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) { toast.error('제목을 입력하세요'); return }
    setSaving(true)
    try {
      await scheduleApi.update(item.id, { title: title.trim(), date, time: time || undefined, memo: memo || undefined })
      onSaved()
    } catch {
      toast.error('수정 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300, display:'flex', flexDirection:'column', justifyContent: isDesktop ? 'center' : 'flex-end', alignItems: isDesktop ? 'center' : undefined }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background:'var(--bg2)',
          borderRadius: isDesktop ? 16 : '20px 20px 0 0',
          padding: isDesktop ? '24px 28px 28px' : '20px 16px 40px',
          maxHeight:'90dvh', overflowY:'auto',
          ...(isDesktop ? { width: 480, maxWidth: '90vw' } : {}),
        }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'var(--t1)' }}>일정 수정</span>
          <button onClick={onClose}
            style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--bd)', background:'var(--bg3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={lbl}>제목</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inp} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={lbl}>날짜</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }} />
            </div>
            <div style={{ flex:1 }}>
              <label style={lbl}>시간 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span></label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }} />
            </div>
          </div>
          <div>
            <label style={lbl}>내용 <span style={{ fontWeight:400, color:'var(--t3)' }}>(선택)</span></label>
            <textarea value={memo} onChange={e => setMemo(e.target.value)}
              rows={4} style={{ ...inp, resize:'none', lineHeight:1.6 }} />
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:'14px', borderRadius:12, border:'none',
              background:'linear-gradient(135deg,#1d4ed8,#2563eb)',
              color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer',
              opacity:saving?0.6:1 }}>
            {saving ? '저장 중...' : '수정 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 스타일 ───────────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  width:34, height:34, borderRadius:8, flexShrink:0,
  background:'var(--bg3)', border:'1px solid var(--bd)',
  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
}
const arrowBtn: React.CSSProperties = {
  width:32, height:32, borderRadius:8, border:'1px solid var(--bd)',
  background:'var(--bg2)', color:'var(--t1)', fontSize:20, lineHeight:'1',
  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
}
const lbl: React.CSSProperties = {
  fontSize:11, fontWeight:700, color:'var(--t3)', display:'block', marginBottom:6,
}
const inp: React.CSSProperties = {
  width:'100%', padding:'11px 12px', borderRadius:10, boxSizing:'border-box',
  background:'var(--bg3)', border:'1px solid var(--bd2)',
  color:'var(--t1)', fontSize:13, outline:'none', fontFamily:'inherit',
}
