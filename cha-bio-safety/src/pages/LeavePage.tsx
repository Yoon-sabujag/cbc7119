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

  // 소진연차 계산
  const usedDays = useMemo(() => {
    return myLeavesYear.reduce((acc, l) => acc + (l.type === 'full' ? 1 : 0.5), 0)
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

  // elevator/fire 일정 날짜 셋
  const inspectDates = useMemo(() => {
    const s = new Set<string>()
    scheduleItems.forEach(item => {
      if (item.category === 'elevator' || item.category === 'fire') {
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

  // ── 날짜 클릭 핸들러: 없음→full→half→취소 ────────────────────
  async function handleDayClick(ymd: string, myLeave: LeaveItem | null, isWeekend: boolean, isHoliday: boolean, hasInspect: boolean) {
    if (isWeekend) {
      toast('주말은 연차 등록이 불가합니다', { icon: '🚫' })
      return
    }
    if (isHoliday) {
      toast(`공휴일(${HOLIDAYS_FALLBACK[ymd]})은 연차 등록이 불가합니다`, { icon: '🚫' })
      return
    }
    if (hasInspect && !myLeave) {
      toast(`점검 일정(${inspectMap[ymd]})이 있어 연차 등록이 불가합니다`, { icon: '🔍' })
      return
    }

    try {
      // 현재 상태에서 다음 상태로
      if (!myLeave) {
        // 없음 → full
        await leaveApi.create(ymd, 'full')
        toast.success('연차(전일)가 등록되었습니다')
      } else if (myLeave.type === 'full') {
        // full → half: 기존 삭제 후 half 등록
        await leaveApi.delete(myLeave.id)
        await leaveApi.create(ymd, 'half')
        toast.success('반차로 변경되었습니다')
      } else {
        // half → 취소
        await leaveApi.delete(myLeave.id)
        toast.success('연차가 취소되었습니다')
      }
    } catch (err: any) {
      const msg = err?.message ?? '오류가 발생했습니다'
      toast.error(msg)
      return
    }

    // 캐시 무효화
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
                if (cell.myLeave?.type === 'full') {
                  cellBg = 'rgba(34,197,94,0.18)'
                } else if (cell.myLeave?.type === 'half') {
                  cellBg = 'transparent'
                  cellBorder = '2px solid rgba(34,197,94,0.7)'
                }

                // 날짜 숫자 색
                let dateColor = dow === 0 || cell.isHoliday ? '#ef4444' : dow === 6 ? '#3b82f6' : 'var(--t1)'
                if (cell.isWeekend) dateColor = dow === 0 ? 'rgba(239,68,68,0.45)' : 'rgba(59,130,246,0.45)'

                // 점검일 옅게
                const inspectOpacity = cell.hasInspect ? 0.55 : 1

                return (
                  <div
                    key={cell.ymd}
                    onClick={() => isClickable && handleDayClick(cell.ymd, cell.myLeave, cell.isWeekend, cell.isHoliday, cell.hasInspect)}
                    style={{
                      aspectRatio: '1',
                      padding: 2,
                      borderRadius: 8,
                      background: cellBg,
                      border: cellBorder,
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
                            {tl.type === 'half' ? '½' : ''}
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

          {/* 범례 */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '10px 2px 0', marginBottom: 4 }}>
            {[
              { color: 'rgba(34,197,94,0.18)', border: 'none', label: '연차(전일)', isFill: true },
              { color: 'transparent', border: '2px solid rgba(34,197,94,0.7)', label: '반차', isFill: false },
              { color: 'rgba(107,114,128,0.75)', border: 'none', label: '팀원 연차', isFill: true },
              { color: '#f97316', border: 'none', label: '승강기 점검', isDot: true },
              { color: '#ef4444', border: 'none', label: '소방 점검', isDot: true },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {(l as any).isDot ? (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                ) : (
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: l.border, display: 'inline-block' }} />
                )}
                <span style={{ fontSize: 10, color: 'var(--t3)' }}>{l.label}</span>
              </div>
            ))}
          </div>
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
                        color: l.type === 'full' ? 'rgba(34,197,94,0.9)' : 'rgba(34,197,94,0.7)',
                        background: l.type === 'full' ? 'rgba(34,197,94,0.12)' : 'transparent',
                        border: l.type === 'half' ? '1px solid rgba(34,197,94,0.5)' : 'none',
                        borderRadius: 6,
                        padding: '1px 6px',
                      }}>
                        {l.type === 'full' ? '전일' : '반차'}
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
