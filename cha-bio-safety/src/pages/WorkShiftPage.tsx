import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMonthlySchedule, DOW_KO, SHIFT_COLOR } from '../utils/shiftCalc'
import type { RawShift } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'

const SHIFT_LABEL: Record<RawShift, string> = { '당':'당직','비':'비번','주':'주간','휴':'휴무' }
const HDR_H = 52
const ROW_H = 46

export default function WorkShiftPage() {
  const navigate = useNavigate()
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
  const staffForCalc = (staffList ?? []).map(s => ({ id: s.id, name: s.name, title: s.title }))
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
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>

      {/* 헤더 */}
      <header style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'8px 12px 9px', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => navigate(-1)} style={{ width:34, height:34, borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--t1)' }}>월 근무표</span>
        <button
          onClick={handleExcel}
          disabled={dlLoading}
          style={{ height:34, padding:'0 14px', borderRadius:8, background:'var(--acl)', border:'none', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', opacity: dlLoading ? 0.6 : 1 }}
        >
          {dlLoading ? '생성중...' : '엑셀 저장'}
        </button>
      </header>

      {/* 년/월 선택 */}
      <div style={{ flexShrink:0, display:'flex', gap:8, padding:'10px 12px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)' }}>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding:'7px 10px', borderRadius:9, background:'var(--bg3)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:13, outline:'none' }}>
          {[2025,2026,2027].map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ padding:'7px 10px', borderRadius:9, background:'var(--bg3)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:13, outline:'none' }}>
          {Array.from({length:12},(_,i) => i+1).map(m => <option key={m} value={m}>{m}월</option>)}
        </select>
      </div>

      {/* 표 영역 */}
      <div style={{ flex:1, overflowX:'hidden', overflowY:'auto', display:'flex', justifyContent:'center' }}>
        <div style={{ display:'flex', maxWidth:1200, padding:'16px 24px' }}>

          {/* 이름 열 (고정) */}
          <div style={{ flexShrink:0 }}>
            <table style={{ borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th style={{ height:HDR_H, width:82, padding:'0 10px', border:'1px solid var(--bd)', background:'var(--bg3)', color:'var(--t2)', fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}>
                    이름
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffRows.map(s => (
                  <tr key={s.id}>
                    <td style={{ height:ROW_H, padding:'0 10px', border:'1px solid var(--bd)', background:'var(--bg2)', whiteSpace:'nowrap' }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>{s.name}</div>
                      <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{s.title}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 날짜 열 (가로 스크롤) */}
          <div ref={scrollRef} style={{ flex:1, overflowX:'auto' }}>
            <table style={{ borderCollapse:'collapse' }}>
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
                        style={{
                          height: HDR_H, minWidth: 40, padding: '4px 2px',
                          border: tdy ? '2px solid var(--acl)' : '1px solid var(--bd)',
                          background: tdy ? 'rgba(59,130,246,0.15)' : 'var(--bg3)',
                          color: red ? '#ef4444' : 'var(--t2)',
                          textAlign:'center',
                        }}
                      >
                        <div style={{ fontWeight:700, fontSize:13 }}>{d}</div>
                        <div style={{ fontSize:10 }}>{DOW_KO[dow]}</div>
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
                          style={{
                            height: ROW_H, minWidth: 40, padding: '0 2px',
                            border: tdy ? '2px solid var(--acl)' : '1px solid var(--bd)',
                            textAlign:'center', fontWeight:700, fontSize:15,
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

        {/* 범례 */}
        <div style={{ display:'flex', gap:14, padding:'14px 12px 28px', flexWrap:'wrap' }}>
          {(['당','비','주','휴'] as RawShift[]).map(sh => (
            <div key={sh} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
              <div style={{ width:24, height:24, borderRadius:5, background:SHIFT_COLOR[sh]+'22', border:`1.5px solid ${SHIFT_COLOR[sh]}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:SHIFT_COLOR[sh] }}>{sh}</div>
              <span style={{ color:'var(--t2)' }}>{SHIFT_LABEL[sh]}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
