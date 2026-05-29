import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMonthlySchedule, DOW_KO, SHIFT_COLOR } from '../utils/shiftCalc'
import type { RawShift } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { ChevronLeft } from 'lucide-react'

const SHIFT_LABEL: Record<RawShift, string> = { '당':'당직','비':'비번','주':'주간','휴':'휴무' }
const HDR_H = 52
const ROW_H = 46

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
        // { "2026": { "2026-03-01": ["삼일절"], ... } } → ["2026-03-01", "2026-03-02", ...]
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

  // 오늘 날짜 열로 자동 스크롤 (화면 가운데 정렬)
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
    <div className="bg-surface-page h-full flex flex-col overflow-hidden">

      {/* 헤더 — 데스크톱: 표준 (height 54, padding '0 20px', 뒤로가기 X). 모바일: 기존 */}
      <header
        className={`bg-surface-raised border-b border-border-default flex items-center shrink-0 ${isDesktop ? 'h-[54px] px-5 gap-2.5' : 'h-12 px-3 gap-2'}`}
      >
        {!isDesktop && (
          <button
            onClick={() => navigate(-1)}
            className="w-7 h-7 rounded-sm bg-surface-sunken border border-border-default flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft size={15} className="text-text-secondary" />
          </button>
        )}
        <span className="text-body font-bold text-text-primary flex-1">월간 출근부</span>
        <button
          onClick={handleExcel}
          disabled={dlLoading}
          className={`bg-safe-bar text-text-on-accent text-caption font-bold leading-none rounded-sm border-0 h-7 px-[14px] ${dlLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {dlLoading ? '생성중...' : '엑셀 저장'}
        </button>
      </header>

      {/* 년/월 선택 */}
      <div className="bg-surface-raised border-b border-border-default flex shrink-0 gap-2 px-3 py-[10px]">
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="bg-surface-sunken border border-border-strong text-text-primary text-label rounded-[9px] px-2.5 py-[7px] outline-none"
        >
          {[2025,2026,2027].map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="bg-surface-sunken border border-border-strong text-text-primary text-label rounded-[9px] px-2.5 py-[7px] outline-none"
        >
          {Array.from({length:12},(_,i) => i+1).map(m => <option key={m} value={m}>{m}월</option>)}
        </select>
      </div>

      {/* 표 영역 */}
      <div className={`flex-1 overflow-auto flex flex-col items-center justify-start ${isDesktop ? 'pt-[12vh]' : 'pt-0'}`}>
        <div className={`inline-flex flex-col ${isDesktop ? 'px-[32px]' : 'px-6 py-4'}`}>
          <div className="flex">
            {/* 이름 열 (고정) */}
            <div className="shrink-0">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th
                      className="bg-surface-sunken border border-border-default text-text-secondary text-caption font-bold leading-none w-[82px] px-2.5 whitespace-nowrap"
                      style={{ height:HDR_H }}
                    >
                      이름
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffRows.map(s => (
                    <tr key={s.id}>
                      <td
                        className="bg-surface-raised border border-border-default px-2.5 whitespace-nowrap"
                        style={{ height:ROW_H }}
                      >
                        <div className="text-body-sm font-bold text-text-primary">{s.name}</div>
                        <div className="text-caption leading-none text-text-tertiary mt-[2px]">{s.title}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 날짜 열 (가로 스크롤) */}
            <div ref={scrollRef} className="flex-1 overflow-x-auto">
              <table className="border-collapse">
                <thead>
                  <tr>
                    {Array.from({length:daysInMonth},(_,i) => {
                      const d   = i + 1
                      const dow = new Date(year, month-1, d).getDay()
                      const red = isRed(d)
                      const tdy = isToday(d)
                      return (
                        <th
                          key={d}
                          ref={tdy ? todayRef : undefined}
                          className={`${tdy ? 'border-2 border-accent bg-[rgba(59,130,246,0.15)]' : 'border border-border-default bg-surface-sunken'} ${red ? 'text-[#ef4444]' : 'text-text-secondary'} min-w-10 px-[2px] py-1 text-center`}
                          style={{ height: HDR_H }}
                        >
                          <div className="text-label font-bold leading-none">{d}</div>
                          <div className="text-caption leading-none mt-[2px]">{DOW_KO[dow]}</div>
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
                            className={`${tdy ? 'border-2 border-accent' : 'border border-border-default'} text-body font-bold min-w-10 px-[2px] text-center`}
                            style={{
                              height: ROW_H,
                              color: SHIFT_COLOR[sh], background: SHIFT_COLOR[sh]+'22',
                            }}
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

          {/* 범례 — 테이블 바로 아래 정렬 */}
          <div className="flex flex-wrap justify-center gap-[14px] pt-[10px] pb-[28px]">
            {(['당','비','주','휴'] as RawShift[]).map(sh => (
              <div key={sh} className="flex items-center gap-[5px]">
                <div
                  className="w-6 h-6 rounded-[5px] border-[1.5px] flex items-center justify-center text-label font-extrabold leading-none"
                  style={{ background:SHIFT_COLOR[sh]+'22', borderColor:SHIFT_COLOR[sh], color:SHIFT_COLOR[sh] }}
                >
                  {sh}
                </div>
                <span className="text-caption leading-none text-text-secondary">{SHIFT_LABEL[sh]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
