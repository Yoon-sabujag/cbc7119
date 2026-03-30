import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { leaveApi, scheduleApi, type LeaveItem } from '../utils/api'
import { useAuthStore } from '../stores/authStore'

// ── 입사일 (사번 기준, 엑셀 검증 완료) ──────────────────────
const HIRE_DATES: Record<string, string> = {
  '2018042451': '2018-04-24', // 석현민
  '2021061451': '2021-06-14', // 김병조
  '2022051052': '2022-05-10', // 윤종엽
  '2023071752': '2023-07-17', // 박보융
}

// ── 연차 생성 계산 (오늘 날짜 기준) ─────────────────────────
// 기준일: 오늘 (현재 날짜에서 입사일을 뺀 근속 기반)
// 기본: 근속 > 365일이면 15일
// 추가: TRUNC((완전근속년수 - 1) / 2), 최대 10일
// 합계 최대 25일
function calcLeaveQuota(staffId: string): number {
  const hireStr = HIRE_DATES[staffId]
  if (!hireStr) return 15
  const hire    = new Date(hireStr)
  const today   = new Date()

  const daysWorked = Math.round((today.getTime() - hire.getTime()) / 86400000) + 1
  if (daysWorked <= 365) {
    return Math.min(Math.floor(daysWorked / 30), 11) // 월차 최대 11일
  }

  // 완전 근속년수
  let years = today.getFullYear() - hire.getFullYear()
  if (today.getMonth() < hire.getMonth() ||
     (today.getMonth() === hire.getMonth() && today.getDate() < hire.getDate())) {
    years--
  }
  const extra = Math.min(Math.max(0, Math.floor((years - 1) / 2)), 10)
  return Math.min(15 + extra, 25)
}

// ── 날짜 헬퍼 ────────────────────────────────────────────────
function localYMD(d: Date) {
  const y  = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${dd}`
}

// ── 대한민국 공휴일 ───────────────────────────────────────────
const HOLIDAYS_FALLBACK: Record<string, string> = {
  // 2025
  '2025-01-01': '신정',
  '2025-01-27': '임시공휴일',
  '2025-01-28': '설날 연휴', '2025-01-29': '설날', '2025-01-30': '설날 연휴',
  '2025-03-01': '삼일절',
  '2025-03-03': '대체공휴일',
  '2025-05-05': '어린이날·부처님오신날',
  '2025-05-06': '대체공휴일',
  '2025-06-03': '임시공휴일',
  '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-03': '개천절',
  '2025-10-05': '추석 연휴', '2025-10-06': '추석', '2025-10-07': '추석 연휴',
  '2025-10-08': '대체공휴일',
  '2025-10-09': '한글날',
  '2025-12-25': '크리스마스',
  // 2026
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-03-02': '대체공휴일',
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '대체공휴일',
  '2026-06-03': '전국동시지방선거',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-08-17': '대체공휴일',
  '2026-09-23': '추석 연휴', '2026-09-24': '추석', '2026-09-25': '추석 연휴',
  '2026-10-03': '개천절',
  '2026-10-05': '대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '크리스마스',
  // 2027
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴', '2027-02-07': '설날', '2027-02-08': '설날 연휴',
  '2027-02-09': '대체공휴일',
  '2027-03-01': '삼일절',
  '2027-05-05': '어린이날',
  '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일',
  '2027-08-15': '광복절',
  '2027-08-16': '대체공휴일',
  '2027-10-03': '개천절',
  '2027-10-04': '대체공휴일',
  '2027-10-09': '한글날',
  '2027-10-14': '추석 연휴', '2027-10-15': '추석', '2027-10-16': '추석 연휴',
  '2027-12-25': '크리스마스',
}

// 달 이름
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const DAY_NAMES   = ['일','월','화','수','목','금','토']

export default function LeavePage() {
  const navigate   = useNavigate()
  const qc         = useQueryClient()
  const { staff }  = useAuthStore()

  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed
  const [selDate, setSelDate] = useState<string | null>(null)

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  // ── 연차 데이터 fetch ────────────────────────────────────────
  const { data: leaveData, isLoading: leaveLoading } = useQuery({
    queryKey: ['leaves', year, monthStr],
    queryFn: () => leaveApi.list(year, monthStr),
    enabled: !!staff,
  })

  // 연간 연차 집계용 (년도 전체)
  const { data: leaveYearData } = useQuery({
    queryKey: ['leaves-year', year],
    queryFn: () => leaveApi.list(year),
    enabled: !!staff,
  })

  // ── 점검 일정 fetch (elevator/fire 체크) ─────────────────────
  const { data: scheduleItems = [] } = useQuery({
    queryKey: ['schedule', monthStr],
    queryFn: () => scheduleApi.getByMonth(monthStr),
    enabled: !!staff,
  })

  const myLeaves   = leaveData?.myLeaves   ?? []
  const teamLeaves = leaveData?.teamLeaves  ?? []

  const myLeavesYear  = leaveYearData?.myLeaves ?? []

  // 소진연차 계산 (공가는 연차 소진에 포함하지 않음)
  const usedDays = useMemo(() => {
    return myLeavesYear.reduce((acc, l) => {
      if (l.type === 'full') return acc + 1
      if (l.type === 'half_am' || l.type === 'half_pm') return acc + 0.5
      return acc // official_* 는 연차 소진 아님
    }, 0)
  }, [myLeavesYear])

  const quota      = staff ? calcLeaveQuota(staff.id) : 15
  const remaining  = quota - usedDays

  // date → LeaveItem 맵핑
  const myLeaveMap   = useMemo(() => {
    const m: Record<string, LeaveItem> = {}
    myLeaves.forEach(l => { m[l.date] = l })
    return m
  }, [myLeaves])

  const teamLeaveMap = useMemo(() => {
    const m: Record<string, LeaveItem[]> = {}
    teamLeaves.forEach(l => {
      if (!m[l.date]) m[l.date] = []
      m[l.date].push(l)
    })
    return m
  }, [teamLeaves])

  // 연차 차단 일정: 소방 상반기 종합정밀점검 / 하반기 작동기능점검만
  const inspectDates = useMemo(() => {
    const s = new Set<string>()
    scheduleItems.forEach(item => {
      if (item.category === 'fire' && (
        item.title?.includes('상반기 종합정밀점검') || item.title?.includes('하반기 작동기능점검')
      )) {
        s.add(item.date)
      }
    })
    return s
  }, [scheduleItems])

  // elevator/fire 일정 날짜 → 제목 맵
  const inspectMap = useMemo(() => {
    const m: Record<string, string> = {}
    scheduleItems.forEach(item => {
      if (item.category === 'elevator' || item.category === 'fire') {
        if (!m[item.date]) m[item.date] = item.title
      }
    })
    return m
  }, [scheduleItems])

  // ── 달력 데이터 계산 ─────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay  = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay() // 0=일

    const days: Array<{
      date: Date | null
      ymd: string
      isToday: boolean
      isHoliday: boolean
      holidayName: string
      isWeekend: boolean
      myLeave: LeaveItem | null
      teamLeaveList: LeaveItem[]
      hasInspect: boolean
    }> = []

    // 빈 칸 (전월)
    for (let i = 0; i < startDow; i++) {
      days.push({ date: null, ymd: '', isToday: false, isHoliday: false, holidayName: '', isWeekend: false, myLeave: null, teamLeaveList: [], hasInspect: false })
    }

    const todayYMD = localYMD(today)

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const ymd  = localYMD(date)
      const dow  = date.getDay()
      days.push({
        date,
        ymd,
        isToday:      ymd === todayYMD,
        isHoliday:    !!HOLIDAYS_FALLBACK[ymd],
        holidayName:  HOLIDAYS_FALLBACK[ymd] ?? '',
        isWeekend:    dow === 0 || dow === 6,
        myLeave:      myLeaveMap[ymd] ?? null,
        teamLeaveList: teamLeaveMap[ymd] ?? [],
        hasInspect:   inspectDates.has(ymd),
      })
    }

    return days
  }, [year, month, myLeaveMap, teamLeaveMap, inspectDates, today])

  // ── 날짜 클릭: 선택/해제 ──
  function handleDayClick(ymd: string, isWeekend: boolean, isHoliday: boolean) {
    if (isWeekend) { toast('주말은 연차 등록이 불가합니다', { icon: '🚫' }); return }
    if (isHoliday) { toast(`공휴일(${HOLIDAYS_FALLBACK[ymd]})은 연차 등록이 불가합니다`, { icon: '🚫' }); return }
    setSelDate(prev => prev === ymd ? null : ymd)
  }

  // ── 타입 버튼 핸들러: 선택한 날짜에 신청/취소 ──
  const selCell = calendarDays.find(c => c.ymd === selDate)
  const selMyLeave = selCell?.myLeave ?? null

  async function handleTypeBtn(type: string) {
    if (!selDate) return
    try {
      if (selMyLeave && selMyLeave.type === type) {
        // 같은 타입 다시 누르면 취소
        await leaveApi.delete(selMyLeave.id)
        toast.success('취소되었습니다')
      } else {
        // 다른 타입이면 기존 삭제 후 새로 생성
        if (selMyLeave) await leaveApi.delete(selMyLeave.id)
        await leaveApi.create(selDate, type as any)
        const labels: Record<string,string> = {
          full: '연차(전일)', half_am: '반차(오전)', half_pm: '반차(오후)',
          official_full: '공가(전일)', official_half_am: '공가(오전)', official_half_pm: '공가(오후)',
        }
        toast.success(`${labels[type] ?? type}이(가) 등록되었습니다`)
      }
    } catch (err: any) {
      toast.error(err?.message ?? '오류가 발생했습니다')
      return
    }
    qc.invalidateQueries({ queryKey: ['leaves'] })
    qc.invalidateQueries({ queryKey: ['leaves-year'] })
  }

  // ── 월 이동 ──────────────────────────────────────────────────
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // ── 팀원 이름 맵 (staffId → name) ───────────────────────────
  const teamStaffNameMap = useMemo(() => {
    const m: Record<string, string> = {}
    teamLeaves.forEach(l => {
      if (!m[l.staffId]) {
        m[l.staffId] = l.staffName ?? l.staffId.slice(-2)
      }
    })
    return m
  }, [teamLeaves])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── 헤더 ── */}
      <div style={{ padding: '8px 16px 10px', background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 8, color: 'var(--t1)', fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center' }}
        >
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={{ flex: 1, fontSize: 17, fontWeight: 700, color: 'var(--t1)' }}>연차 관리</div>
        {/* 연도 선택 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setYear(y => y - 1)}
            style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', color: 'var(--t2)', fontSize: 13 }}
          >‹</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', minWidth: 38, textAlign: 'center' }}>{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', color: 'var(--t2)', fontSize: 13 }}
          >›</button>
        </div>
      </div>

      {/* ── 스크롤 영역 ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 20px' }}>

        {/* ── 월 이동 ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', background: 'var(--bg2)', borderBottom: '1px solid var(--bd)' }}>
          <button
            onClick={prevMonth}
            style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 14px', color: 'var(--t2)', fontSize: 16, fontWeight: 700 }}
          >‹</button>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
            {year}년 {MONTH_NAMES[month]}
          </span>
          <button
            onClick={nextMonth}
            style={{ background: 'var(--bg3)', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 14px', color: 'var(--t2)', fontSize: 16, fontWeight: 700 }}
          >›</button>
        </div>

        {/* ── 달력 ── */}
        <div style={{ padding: '12px 12px 0' }}>
          {/* 요일 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAY_NAMES.map((d, i) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : 'var(--t3)', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          {leaveLoading ? (
            <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 24, border: '2px solid var(--bd2)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {calendarDays.map((cell, idx) => {
                if (!cell.date) {
                  return <div key={`empty-${idx}`} style={{ aspectRatio: '1', padding: 2 }} />
                }

                const dow = cell.date.getDay()
                const isClickable = !cell.isWeekend

                // 배경 결정
                let cellBg = 'transparent'
                let cellBorder = 'none'
                const lt = cell.myLeave?.type
                const isGreen = lt === 'full' || lt === 'half_am' || lt === 'half_pm'
                const isOrange = lt === 'official_full' || lt === 'official_half_am' || lt === 'official_half_pm'
                const isAm = lt === 'half_am' || lt === 'official_half_am'
                const isPm = lt === 'half_pm' || lt === 'official_half_pm'
                const isHalf = isAm || isPm
                const leaveC = isGreen ? '34,197,94' : isOrange ? '249,115,22' : ''

                if (lt === 'full') cellBg = 'rgba(34,197,94,0.18)'
                else if (lt === 'official_full') cellBg = 'rgba(249,115,22,0.18)'
                else if (isHalf) {
                  cellBg = 'transparent'
                  cellBorder = `2px solid rgba(${leaveC},0.7)`
                }
                const isSel = cell.ymd === selDate

                // 날짜 숫자 색
                let dateColor = dow === 0 || cell.isHoliday ? '#ef4444' : dow === 6 ? '#3b82f6' : 'var(--t1)'
                if (cell.isWeekend) dateColor = dow === 0 ? 'rgba(239,68,68,0.45)' : 'rgba(59,130,246,0.45)'

                // 점검일 옅게
                const inspectOpacity = cell.hasInspect ? 0.55 : 1

                return (
                  <div
                    key={cell.ymd}
                    onClick={() => isClickable && handleDayClick(cell.ymd, cell.isWeekend, cell.isHoliday)}
                    style={{
                      aspectRatio: '1',
                      padding: 2,
                      borderRadius: 8,
                      background: isSel ? 'rgba(59,130,246,0.15)' : (isHalf ? 'transparent' : cellBg),
                      border: isSel ? '2px solid #3b82f6' : (isHalf ? 'none' : cellBorder),
                      overflow: 'hidden',
                      cursor: isClickable ? 'pointer' : 'default',
                      opacity: inspectOpacity,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      position: 'relative',
                      userSelect: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {/* 반일 대각선 배경 */}
                    {isHalf && !isSel && (
                      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:8 }} viewBox="0 0 40 40" preserveAspectRatio="none">
                        <rect width={40} height={40} rx={3} fill="transparent" stroke={`rgba(${leaveC},0.7)`} strokeWidth={2} />
                        <polygon points={isAm ? '0,0 40,0 0,40' : '40,0 40,40 0,40'} fill={`rgba(${leaveC},0.15)`} />
                        <line x1={0} y1={40} x2={40} y2={0} stroke={`rgba(${leaveC},0.5)`} strokeWidth={1.5} />
                      </svg>
                    )}
                    {/* 날짜 숫자 */}
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: cell.isToday ? 'var(--acl)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: cell.isToday ? 700 : 500,
                      color: cell.isToday ? '#fff' : dateColor,
                      flexShrink: 0,
                    }}>
                      {cell.date.getDate()}
                    </div>

                    {/* 팀원 연차 이름 첫글자 */}
                    {cell.teamLeaveList.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, marginTop: 1 }}>
                        {cell.teamLeaveList.slice(0, 2).map(tl => (
                          <span
                            key={tl.id}
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: '#fff',
                              background: 'rgba(107,114,128,0.75)',
                              borderRadius: 4,
                              padding: '1px 3px',
                              lineHeight: 1.3,
                            }}
                          >
                            {(teamStaffNameMap[tl.staffId] ?? tl.staffId.slice(-2))[0]}
                            {tl.type === 'half_am' ? '½오전' : tl.type === 'half_pm' ? '½오후' : tl.type === 'official_full' ? '공' : tl.type === 'official_half_am' ? '공½' : tl.type === 'official_half_pm' ? '공½' : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 도트 */}
                    <div style={{ display: 'flex', gap: 2, marginTop: 'auto', paddingBottom: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {cell.hasInspect && (
                        <>
                          {scheduleItems.some(s => s.date === cell.ymd && s.category === 'elevator') && (
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#f97316', display: 'block' }} />
                          )}
                          {scheduleItems.some(s => s.date === cell.ymd && s.category === 'fire') && (
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef4444', display: 'block' }} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 신청 버튼 패널 (날짜 선택 시) */}
          {selDate && !selCell?.isWeekend && !selCell?.isHoliday && (
            <div style={{ padding: '10px 0 4px' }}>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 6 }}>
                {selDate} — 탭하여 신청 (같은 버튼 다시 누르면 취소)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {([
                  { type: 'full',             label: '연차(전일)',  rgb: '34,197,94',   isHalfType: false, isAm: false },
                  { type: 'half_am',          label: '반차(오전)',  rgb: '34,197,94',   isHalfType: true,  isAm: true },
                  { type: 'half_pm',          label: '반차(오후)',  rgb: '34,197,94',   isHalfType: true,  isAm: false },
                  { type: 'official_full',    label: '공가(전일)',  rgb: '249,115,22',  isHalfType: false, isAm: false },
                  { type: 'official_half_am', label: '공가(오전)',  rgb: '249,115,22',  isHalfType: true,  isAm: true },
                  { type: 'official_half_pm', label: '공가(오후)',  rgb: '249,115,22',  isHalfType: true,  isAm: false },
                ] as const).map(btn => {
                  const isActive = selMyLeave?.type === btn.type
                  return (
                    <button key={btn.type} onClick={() => handleTypeBtn(btn.type)}
                      style={{
                        padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', position: 'relative', overflow: 'hidden',
                        background: isActive ? `rgba(${btn.rgb},0.25)` : (btn.isHalfType ? 'transparent' : `rgba(${btn.rgb},0.1)`),
                        border: isActive ? '2px solid var(--acl)' : (btn.isHalfType ? `2px solid rgba(${btn.rgb},0.5)` : '1px solid var(--bd)'),
                        color: isActive ? 'var(--t1)' : 'var(--t2)',
                      }}>
                      {btn.isHalfType && !isActive && (
                        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 80 32" preserveAspectRatio="none">
                          <polygon points={btn.isAm ? '0,0 80,0 0,32' : '80,0 80,32 0,32'} fill={`rgba(${btn.rgb},0.12)`} />
                          <line x1={0} y1={32} x2={80} y2={0} stroke={`rgba(${btn.rgb},0.4)`} strokeWidth={1} />
                        </svg>
                      )}
                      <span style={{ position:'relative', zIndex:1 }}>{btn.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 범례 (날짜 미선택 시) */}
          {!selDate && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '10px 2px 0', marginBottom: 4 }}>
              {/* 연차(전일) */}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:12, height:12, borderRadius:3, background:'rgba(34,197,94,0.18)', display:'inline-block' }} />
                <span style={{ fontSize:10, color:'var(--t3)' }}>연차</span>
              </div>
              {/* 반차(오전) — 좌하→우상 대각선, 왼쪽(위) 채우기 */}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <svg width={12} height={12} viewBox="0 0 12 12" style={{ display:'block' }}>
                  <rect width={12} height={12} rx={3} fill="transparent" stroke="rgba(34,197,94,0.7)" strokeWidth={1.5} />
                  <polygon points="0,0 12,0 0,12" fill="rgba(34,197,94,0.3)" />
                  <line x1={0} y1={12} x2={12} y2={0} stroke="rgba(34,197,94,0.7)" strokeWidth={1} />
                </svg>
                <span style={{ fontSize:10, color:'var(--t3)' }}>반차(오전)</span>
              </div>
              {/* 반차(오후) — 오른쪽(아래) 채우기 */}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <svg width={12} height={12} viewBox="0 0 12 12" style={{ display:'block' }}>
                  <rect width={12} height={12} rx={3} fill="transparent" stroke="rgba(34,197,94,0.7)" strokeWidth={1.5} />
                  <polygon points="12,0 12,12 0,12" fill="rgba(34,197,94,0.3)" />
                  <line x1={0} y1={12} x2={12} y2={0} stroke="rgba(34,197,94,0.7)" strokeWidth={1} />
                </svg>
                <span style={{ fontSize:10, color:'var(--t3)' }}>반차(오후)</span>
              </div>
              {/* 공가(전일) */}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:12, height:12, borderRadius:3, background:'rgba(249,115,22,0.18)', display:'inline-block' }} />
                <span style={{ fontSize:10, color:'var(--t3)' }}>공가</span>
              </div>
              {/* 공가(오전) */}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <svg width={12} height={12} viewBox="0 0 12 12" style={{ display:'block' }}>
                  <rect width={12} height={12} rx={3} fill="transparent" stroke="rgba(249,115,22,0.7)" strokeWidth={1.5} />
                  <polygon points="0,0 12,0 0,12" fill="rgba(249,115,22,0.3)" />
                  <line x1={0} y1={12} x2={12} y2={0} stroke="rgba(249,115,22,0.7)" strokeWidth={1} />
                </svg>
                <span style={{ fontSize:10, color:'var(--t3)' }}>공가(오전)</span>
              </div>
              {/* 공가(오후) */}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <svg width={12} height={12} viewBox="0 0 12 12" style={{ display:'block' }}>
                  <rect width={12} height={12} rx={3} fill="transparent" stroke="rgba(249,115,22,0.7)" strokeWidth={1.5} />
                  <polygon points="12,0 12,12 0,12" fill="rgba(249,115,22,0.3)" />
                  <line x1={0} y1={12} x2={12} y2={0} stroke="rgba(249,115,22,0.7)" strokeWidth={1} />
                </svg>
                <span style={{ fontSize:10, color:'var(--t3)' }}>공가(오후)</span>
              </div>
              {/* 팀원 */}
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:12, height:12, borderRadius:3, background:'rgba(107,114,128,0.75)', display:'inline-block' }} />
                <span style={{ fontSize:10, color:'var(--t3)' }}>팀원</span>
              </div>
            </div>
          )}
        </div>

        {/* ── 연차 집계 카드 ── */}
        <div style={{ padding: '12px 12px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginBottom: 8, paddingLeft: 2, letterSpacing: '0.05em' }}>
            {year}년 연차 현황
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: '생성연차', value: quota, unit: '일', color: 'var(--acl)', bg: 'rgba(59,130,246,0.08)', bd: 'rgba(59,130,246,0.2)' },
              { label: '소진연차', value: usedDays, unit: '일', color: 'var(--warn)', bg: 'rgba(245,158,11,0.08)', bd: 'rgba(245,158,11,0.2)' },
              { label: '잔여연차', value: remaining, unit: '일', color: remaining <= 3 ? 'var(--danger)' : 'var(--safe)', bg: remaining <= 3 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', bd: remaining <= 3 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)' },
            ].map(card => (
              <div
                key={card.label}
                style={{
                  background: card.bg,
                  border: `1px solid ${card.bd}`,
                  borderRadius: 12,
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>{card.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: card.color, lineHeight: 1 }}>
                  {card.value % 1 === 0 ? card.value : card.value.toFixed(1)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{card.unit}</div>
              </div>
            ))}
          </div>

          {/* 상세 목록 */}
          {myLeavesYear.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginBottom: 8, paddingLeft: 2, letterSpacing: '0.05em' }}>
                내 연차 목록
              </div>
              <div style={{ background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--bd)', overflow: 'hidden' }}>
                {myLeavesYear.map((l, i) => (
                  <div
                    key={l.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '11px 14px',
                      borderBottom: i < myLeavesYear.length - 1 ? '1px solid var(--bd)' : 'none',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{l.date}</span>
                      <span style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        color: l.type.startsWith('official') ? 'rgba(249,115,22,0.9)' : 'rgba(34,197,94,0.9)',
                        background: (l.type === 'full' || l.type === 'official_full') ? (l.type.startsWith('official') ? 'rgba(249,115,22,0.12)' : 'rgba(34,197,94,0.12)') : 'transparent',
                        border: (l.type !== 'full' && l.type !== 'official_full') ? `1px solid ${l.type.startsWith('official') ? 'rgba(249,115,22,0.5)' : 'rgba(34,197,94,0.5)'}` : 'none',
                        borderRadius: 6,
                        padding: '1px 6px',
                      }}>
                        {{ full:'연차(전일)', half_am:'반차(오전)', half_pm:'반차(오후)', official_full:'공가(전일)', official_half_am:'공가(오전)', official_half_pm:'공가(오후)' }[l.type] ?? l.type}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await leaveApi.delete(l.id)
                          toast.success('연차가 취소되었습니다')
                          qc.invalidateQueries({ queryKey: ['leaves'] })
                          qc.invalidateQueries({ queryKey: ['leaves-year'] })
                        } catch (err: any) {
                          toast.error(err?.message ?? '삭제 실패')
                        }
                      }}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 8,
                        color: '#ef4444',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      취소
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 사용 안내 */}
        <div style={{ margin: '16px 12px 0', padding: '12px 14px', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--bd)' }}>
          <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>연차 등록 안내</div>
            <div>• 날짜 클릭: 없음 → 전일 → 반차 → 취소</div>
            <div>• 팀 내 하루 1명 제한 (동일 날짜 중복 불가)</div>
            <div>• 승강기·소방 점검일은 연차 등록 불가</div>
            <div>• 주말·공휴일은 연차 등록 불가</div>
          </div>
        </div>

      </div>
    </div>
  )
}
