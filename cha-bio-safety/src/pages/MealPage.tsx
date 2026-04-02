import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getMonthlySchedule } from '../utils/shiftCalc'

// ── 인라인 SVG 아이콘 ─────────────────────────────────────────
function IconChevronLeft({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function IconChevronRight({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function IconUtensilsCrossed({ size = 40, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.5 10.5A5 5 0 0 1 16 16" />
      <path d="M8.5 8.5A5 5 0 0 0 3 14" />
      <path d="M14 14a4 4 0 0 0 5.657 5.657" />
      <path d="M14 9l5-5" />
      <path d="M5 5l3 3" />
    </svg>
  )
}
import { calcProvidedMeals, calcWeekendAllowance } from '../utils/mealCalc'
import { mealApi, leaveApi } from '../utils/api'
import { useStaffList } from '../hooks/useStaffList'
import { useAuthStore } from '../stores/authStore'

// ── 날짜 헬퍼 ─────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`

type MealTab = 'record' | 'menu'

// ── 요약 카드 스켈레톤 ─────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div style={{
      flex: '1 0 auto',
      minWidth: 72,
      background: 'var(--bg3)',
      borderRadius: 12,
      height: 64,
      animation: 'blink 2s ease-in-out infinite',
    }} />
  )
}

// ── 요약 카드 컴포넌트 ────────────────────────────────────────
function StatCard({ label, value, color, suffix }: {
  label: string
  value: string | number
  color: string
  suffix?: string
}) {
  return (
    <div style={{
      flex: '1 0 auto',
      minWidth: 72,
      background: 'var(--bg2)',
      borderRadius: 12,
      padding: '12px 16px',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
        {suffix && (
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t2)' }}>{suffix}</span>
        )}
      </div>
    </div>
  )
}

export default function MealPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { staff } = useAuthStore()
  const staffId = staff?.id ?? ''

  // ── 탭 상태 ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MealTab>('record')

  // ── 월 상태 (1-indexed month) ────────────────────────────
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const monthStr = `${year}-${pad(month)}`

  // ── 월 이동 범위 제한 ─────────────────────────────────────
  const minDate = new Date(today.getFullYear(), today.getMonth() - 6, 1)
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  const canGoPrev = new Date(year, month - 2, 1) >= minDate
  const canGoNext = new Date(year, month, 1) <= maxDate

  const handlePrevMonth = () => {
    if (!canGoPrev) return
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const handleNextMonth = () => {
    if (!canGoNext) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  // ── 직원 목록 ─────────────────────────────────────────────
  const { data: staffList } = useStaffList()

  // ── 월간 스케줄 계산 ──────────────────────────────────────
  const { daysInMonth, myShifts } = useMemo(() => {
    const staffForCalc = (staffList ?? []).map(s => ({ id: s.id, name: s.name, title: s.title }))
    const sched = getMonthlySchedule(year, month, staffForCalc)
    const myRow = sched.staffRows.find(r => r.id === staffId)
    return { daysInMonth: sched.daysInMonth, myShifts: myRow?.shifts ?? [] }
  }, [year, month, staffList, staffId])

  // ── 식사 기록 쿼리 ────────────────────────────────────────
  const { data: mealData, isLoading: mealLoading } = useQuery({
    queryKey: ['meal', year, month],
    queryFn: () => mealApi.list(year, monthStr),
    enabled: activeTab === 'record',
  })

  // ── 연차 쿼리 ─────────────────────────────────────────────
  const { data: leaveData, isLoading: leaveLoading } = useQuery({
    queryKey: ['leaves', year, monthStr],
    queryFn: () => leaveApi.list(year, monthStr),
    enabled: activeTab === 'record',
  })

  // ── 맵 빌드 ───────────────────────────────────────────────
  const leaveMap = useMemo<Record<string, string>>(() => {
    const leaves = leaveData?.myLeaves ?? []
    const map: Record<string, string> = {}
    for (const l of leaves) { map[l.date] = l.type }
    return map
  }, [leaveData])

  const serverMealMap = useMemo<Record<string, number>>(() => {
    const records = mealData?.records ?? []
    const map: Record<string, number> = {}
    for (const r of records) { map[r.date] = r.skippedMeals }
    return map
  }, [mealData])

  // ── 낙관적 업데이트 상태 ──────────────────────────────────
  const [optimisticMealMap, setOptimisticMealMap] = useState<Record<string, number>>({})

  // 서버 데이터 갱신 시 낙관적 상태 초기화
  const mealMap = useMemo<Record<string, number>>(() => {
    return { ...serverMealMap, ...optimisticMealMap }
  }, [serverMealMap, optimisticMealMap])

  // ── 월별 통계 계산 ────────────────────────────────────────
  const stats = useMemo(() => {
    let totalProvided = 0
    let totalSkipped = 0
    let weekendAllowance = 0

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d)
      const dayOfWeek = date.getDay()
      const rawShift = myShifts[d - 1]
      if (!rawShift) continue
      const dateStr = ymd(year, month, d)
      const leaveType = leaveMap[dateStr]

      totalProvided += calcProvidedMeals(rawShift, leaveType, dayOfWeek)
      totalSkipped += mealMap[dateStr] ?? 0
      weekendAllowance += calcWeekendAllowance(rawShift, dayOfWeek)
    }

    const actual = totalProvided - totalSkipped
    return { totalProvided, totalSkipped, actual, weekendAllowance }
  }, [daysInMonth, year, month, myShifts, leaveMap, mealMap])

  // ── 탭 인터랙션 핸들러 ────────────────────────────────────
  const handleDayTap = useCallback(async (dateStr: string, providedMeals: number) => {
    if (providedMeals === 0) return
    const current = mealMap[dateStr] ?? 0
    const next = (current + 1) > providedMeals ? 0 : current + 1

    // 낙관적 업데이트
    setOptimisticMealMap(prev => ({ ...prev, [dateStr]: next }))
    try {
      await mealApi.upsert(dateStr, next)
      queryClient.invalidateQueries({ queryKey: ['meal', year, month] })
    } catch {
      // 롤백
      setOptimisticMealMap(prev => ({ ...prev, [dateStr]: current }))
      toast.error('저장에 실패했습니다. 다시 시도해 주세요')
    }
  }, [year, month, mealMap, queryClient])

  // ── 달력 그리드 빌드 ──────────────────────────────────────
  const todayStr = ymd(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const startDow = new Date(year, month - 1, 1).getDay() // 0=일

  const isLoading = mealLoading || leaveLoading

  // ── DOW 헤더 색상 ──────────────────────────────────────────
  const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토']
  const dowColor = (dow: number) => {
    if (dow === 0) return '#ef4444'
    if (dow === 6) return '#3b82f6'
    return 'var(--t2)'
  }

  const tabs: { key: MealTab; label: string }[] = [
    { key: 'record', label: '식사 기록' },
    { key: 'menu', label: '메뉴표' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>

      {/* 헤더 */}
      <div style={{
        height: 48,
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 44, height: 44,
            background: 'none', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--t2)',
          }}
        >
          <IconChevronLeft size={20} color="var(--t2)" />
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
          식사 기록
        </span>
        <div style={{ width: 44 }} />
      </div>

      {/* 탭 바 */}
      <div style={{
        display: 'flex',
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--bd)',
        flexShrink: 0,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              height: 44,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
              transition: 'all 0.15s',
              background: activeTab === tab.key ? 'var(--bg4)' : 'transparent',
              color: activeTab === tab.key ? 'var(--t1)' : 'var(--t3)',
              borderBottom: activeTab === tab.key ? '2px solid var(--acl)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* ── 식사 기록 탭 ── */}
        {activeTab === 'record' && (
          <>
            {/* 요약 카드 행 */}
            <div style={{
              display: 'flex',
              gap: 8,
              padding: '12px 12px 0',
              overflowX: 'auto',
            }}>
              {isLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard label="제공 식수" value={stats.totalProvided} color="var(--t1)" suffix="끼" />
                  <StatCard label="실제 식수" value={stats.actual} color="var(--safe)" suffix="끼" />
                  <StatCard label="미식" value={stats.totalSkipped} color="var(--acl)" suffix="끼" />
                  <StatCard label="주말 식대" value={stats.weekendAllowance.toLocaleString()} color="var(--warn)" suffix="원" />
                </>
              )}
            </div>

            {/* 월 네비게이터 */}
            <div style={{
              height: 44,
              background: 'var(--bg2)',
              borderBottom: '1px solid var(--bd)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              marginTop: 12,
            }}>
              <button
                onClick={handlePrevMonth}
                disabled={!canGoPrev}
                style={{
                  background: 'var(--bg3)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 16,
                  fontWeight: 700,
                  color: canGoPrev ? 'var(--t2)' : 'var(--t3)',
                  cursor: canGoPrev ? 'pointer' : 'default',
                  opacity: canGoPrev ? 1 : 0.4,
                }}
              >
                <IconChevronLeft size={16} color={canGoPrev ? 'var(--t2)' : 'var(--t3)'} />
              </button>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
                {year}년 {month}월
              </span>
              <button
                onClick={handleNextMonth}
                disabled={!canGoNext}
                style={{
                  background: 'var(--bg3)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 16,
                  fontWeight: 700,
                  color: canGoNext ? 'var(--t2)' : 'var(--t3)',
                  cursor: canGoNext ? 'pointer' : 'default',
                  opacity: canGoNext ? 1 : 0.4,
                }}
              >
                <IconChevronRight size={16} color={canGoNext ? 'var(--t2)' : 'var(--t3)'} />
              </button>
            </div>

            {/* 달력 그리드 */}
            <div style={{ padding: '8px 8px 16px' }}>

              {/* 요일 헤더 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 4,
                marginBottom: 4,
              }}>
                {DOW_LABELS.map((label, i) => (
                  <div
                    key={label}
                    style={{
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: dowColor(i),
                      padding: '4px 0',
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 200,
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    border: '2px solid var(--bd2)',
                    borderTopColor: 'var(--acl)',
                    borderRadius: '50%',
                    animation: 'spin .7s linear infinite',
                  }} />
                  <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 4,
                }}>
                  {/* 첫 주 앞쪽 빈 셀 */}
                  {Array.from({ length: startDow }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {/* 날짜 셀 */}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const d = i + 1
                    const dateStr = ymd(year, month, d)
                    const date = new Date(year, month - 1, d)
                    const dayOfWeek = date.getDay()
                    const rawShift = myShifts[d - 1]
                    const leaveType = leaveMap[dateStr]
                    const providedMeals = rawShift
                      ? calcProvidedMeals(rawShift, leaveType, dayOfWeek)
                      : 0
                    const skipped = mealMap[dateStr] ?? 0
                    const isToday = dateStr === todayStr
                    const isProvided = providedMeals > 0

                    // 셀 배경
                    let cellBg = 'transparent'
                    if (skipped === 1) cellBg = 'rgba(59,130,246,0.12)'
                    else if (skipped === 2) cellBg = 'rgba(59,130,246,0.22)'

                    // 날짜 텍스트 색상
                    let dateColor: string
                    if (!isProvided) dateColor = 'var(--t2)'
                    else if (dayOfWeek === 0) dateColor = '#ef4444'
                    else if (dayOfWeek === 6) dateColor = '#3b82f6'
                    else dateColor = 'var(--t1)'

                    return (
                      <div
                        key={dateStr}
                        onClick={() => handleDayTap(dateStr, providedMeals)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: 8,
                          position: 'relative',
                          userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          background: cellBg,
                          opacity: isProvided ? 1 : 0.4,
                          cursor: isProvided ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* 날짜 숫자 */}
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: isToday ? 'var(--acl)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? '#fff' : dateColor,
                          flexShrink: 0,
                        }}>
                          {d}
                        </div>

                        {/* 미식 배지 */}
                        {skipped > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            fontSize: 12,
                            fontWeight: 700,
                            background: 'var(--acl)',
                            color: '#fff',
                            borderRadius: 10,
                            padding: '0 3px',
                            minWidth: 14,
                            textAlign: 'center',
                            lineHeight: '16px',
                          }}>
                            {skipped === 1 ? '①' : '②'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── 메뉴표 탭 ── */}
        {activeTab === 'menu' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 0,
            padding: '40px 16px',
          }}>
            <IconUtensilsCrossed size={40} color="var(--t3)" />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t2)', marginTop: 12 }}>
              메뉴표
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--t3)', marginTop: 4 }}>
              준비 중입니다
            </div>
          </div>
        )}
      </div>

      {/* 애니메이션 */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
