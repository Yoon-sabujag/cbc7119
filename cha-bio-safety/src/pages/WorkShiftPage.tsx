import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronDown, FileDown } from 'lucide-react'
import { getMonthlySchedule, DOW_KO } from '../utils/shiftCalc'
import type { RawShift } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'
import { useIsDesktop } from '../hooks/useIsDesktop'

const SHIFT_LABEL: Record<RawShift, string> = { '당':'당직','비':'비번','주':'주간','휴':'휴무' }

// sketch CSS verbatim — .cell-day/-night/-off/-leave (color + bg pair)
const CELL_CLASS: Record<RawShift, string> = {
  '당': 'text-duty-night bg-duty-night-bg',
  '비': 'text-duty-off   bg-duty-off-bg',
  '주': 'text-duty-day   bg-duty-day-bg',
  '휴': 'text-duty-leave bg-duty-leave-bg',
}

// sketch CSS verbatim — .chip-* (color + bg + 1.5px border)
const CHIP_CLASS: Record<RawShift, string> = {
  '당': 'text-duty-night bg-duty-night-bg border-duty-night',
  '비': 'text-duty-off   bg-duty-off-bg   border-duty-off',
  '주': 'text-duty-day   bg-duty-day-bg   border-duty-day',
  '휴': 'text-duty-leave bg-duty-leave-bg border-duty-leave',
}

export default function WorkShiftPage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [dlLoading, setDlLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayRef  = useRef<HTMLTableCellElement>(null)

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays-dates'],
    queryFn: async () => {
      try {
        const res  = await fetch('https://holidays.hyunbin.page/basic.json')
        const data = await res.json() as Record<string, Record<string, string[]>>
        const dates: string[] = []
        for (const yr of Object.values(data)) {
          for (const d of Object.keys(yr)) dates.push(d)
        }
        return dates
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 60 * 24,
  })

  const { data: staffList } = useStaffList()
  const STAFF_ORDER = ['석현민', '김병조', '윤종엽', '박보융']
  const staffForCalc = (staffList ?? []).map(s => ({ id: s.id, name: s.name, title: s.title }))
    .sort((a, b) => {
      const ai = STAFF_ORDER.indexOf(a.name), bi = STAFF_ORDER.indexOf(b.name)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  const { daysInMonth, staffRows } = getMonthlySchedule(year, month, staffForCalc)

  const isToday = (d: number) =>
    year === today.getFullYear() && month === today.getMonth() + 1 && d === today.getDate()

  const isRed = (d: number): boolean => {
    const dow = new Date(year, month - 1, d).getDay()
    if (dow === 0 || dow === 6) return true
    if (!Array.isArray(holidays) || holidays.length === 0) return false
    const str = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    return holidays.includes(str)
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      todayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
    })
    return () => cancelAnimationFrame(raf)
  }, [year, month])

  const handleExcel = async () => {
    setDlLoading(true)
    try {
      const { generateShiftExcel } = await import('../utils/generateExcel')
      await generateShiftExcel(year, month, staffForCalc)
    } catch (e: any) {
      console.error('엑셀 생성 오류:', e)
      const { default: toast } = await import('react-hot-toast')
      toast.error('엑셀 생성 실패: ' + (e.message ?? '알 수 없는 오류'))
    } finally {
      setDlLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-page">

      {/* 자체 헤더 — 06 FloorPlanPage chrome 룰 표준 (project_redesign_self_header_chrome) */}
      <header
        className={isDesktop
          ? 'flex items-center gap-2.5 h-[54px] px-5 bg-surface-page border-b border-border-default flex-shrink-0'
          : 'flex items-center gap-2.5 px-4 py-2.5 bg-surface-page border-b border-border-default flex-shrink-0'}
      >
        {!isDesktop && (
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="w-7 h-7 rounded-sm bg-surface-sunken border border-border-default text-text-secondary inline-flex items-center justify-center"
          >
            <ChevronLeft size={14} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold text-text-primary truncate">월간 출근부</div>
        </div>
        <button
          onClick={handleExcel}
          disabled={dlLoading}
          className="h-7 px-2.5 rounded-sm bg-accent border border-accent text-text-on-accent text-caption font-semibold leading-none inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FileDown size={12} />
          {dlLoading ? '생성중...' : '엑셀 저장'}
        </button>
      </header>

      {/* 연/월 선택 */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 bg-surface-raised border-b border-border-default">
        <div className="relative">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="appearance-none h-9 pl-3 pr-8 rounded-sm bg-surface-sunken border border-border-default text-text-primary text-body-sm outline-none focus:border-border-focus cursor-pointer"
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="appearance-none h-9 pl-3 pr-8 rounded-sm bg-surface-sunken border border-border-default text-text-primary text-body-sm outline-none focus:border-border-focus cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      {/* 매트릭스 영역 */}
      <div className={`flex-1 overflow-auto flex flex-col items-center ${isDesktop ? 'pt-[6vh]' : ''}`}>
        <div className={`inline-flex flex-col ${isDesktop ? 'px-8' : 'px-4 pt-4'}`}>
          <div className="flex">

            {/* 좌측 이름 컬럼 (고정) */}
            <div className="flex-shrink-0">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="h-[52px] w-[88px] px-2.5 border border-border-default bg-surface-sunken text-text-tertiary text-caption font-bold whitespace-nowrap">
                      이름
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffRows.map(s => (
                    <tr key={s.id}>
                      <td className="h-[46px] px-2.5 border border-border-default bg-surface-raised whitespace-nowrap text-left">
                        <div className="text-body-sm font-bold text-text-primary leading-none">{s.name}</div>
                        <div className="text-caption text-text-tertiary mt-0.5 leading-none">{s.title}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 우측 날짜 컬럼 (가로 스크롤) */}
            <div ref={scrollRef} className="flex-1 overflow-x-auto">
              <table className="border-collapse">
                <thead>
                  <tr>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const d   = i + 1
                      const dow = new Date(year, month - 1, d).getDay()
                      const red = isRed(d)
                      const tdy = isToday(d)
                      return (
                        <th
                          key={d}
                          ref={tdy ? todayRef : undefined}
                          className={[
                            'h-[52px] min-w-[40px] px-0.5 py-1 text-center',
                            tdy
                              ? 'border-2 border-accent bg-accent-soft'
                              : 'border border-border-default bg-surface-sunken',
                            red ? 'text-cal-red' : 'text-text-secondary',
                          ].join(' ')}
                        >
                          <div className="text-label font-bold leading-tight">{d}</div>
                          <div className="text-caption leading-none mt-0.5">{DOW_KO[dow]}</div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {staffRows.map(s => (
                    <tr key={s.id}>
                      {s.shifts.map((sh, i) => {
                        const d   = i + 1
                        const tdy = isToday(d)
                        return (
                          <td
                            key={i}
                            className={[
                              'h-[46px] min-w-[40px] px-0.5 text-center font-bold text-[15px]',
                              tdy ? 'border-2 border-accent' : 'border border-border-default',
                              CELL_CLASS[sh],
                            ].join(' ')}
                          >
                            {sh}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 범례 */}
          <div className="flex gap-3.5 pt-3 pb-4 justify-center flex-wrap flex-shrink-0">
            {(['당','비','주','휴'] as RawShift[]).map(sh => (
              <div key={sh} className="flex items-center gap-1.5">
                <div className={`w-[26px] h-[26px] rounded-[6px] flex items-center justify-center font-extrabold text-label leading-none border-[1.5px] ${CHIP_CLASS[sh]}`}>
                  {sh}
                </div>
                <span className="text-label text-text-secondary">{SHIFT_LABEL[sh]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
