import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

// redesign/29-extinguisher-public W3 — 종이 양식 모방 페이지 인라인 유지 default (W1 §1.3 비즈 anchor 27 / W2 5 CSS verbatim / OQ LOCKED 5)

interface CheckRecord { id: string; result: string; memo?: string; checked_at: string; staff_name: string }
interface CheckpointInfo { id: string; locationNo: string; location: string; floor: string; description?: string }
interface ExtInfo { mgmtNo: string; type: string; approvalNo?: string; manufacturedAt?: string; manufacturer?: string; prefixCode?: string; sealNo?: string; serialNo?: string; note?: string; location?: string }

export default function ExtinguisherPublicPage() {
  const { checkpointId } = useParams<{ checkpointId: string }>()
  const [cp, setCp] = useState<CheckpointInfo | null>(null)
  const [ext, setExt] = useState<ExtInfo | null>(null)
  const [records, setRecords] = useState<CheckRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!checkpointId) return
    fetch(`/api/public/extinguisher/${encodeURIComponent(checkpointId)}`)
      .then(r => r.json())
      .then((json: any) => {
        if (json.success) { setCp(json.data.checkpoint); setExt(json.data.extinguisher); setRecords(json.data.records) }
        else setError(json.error ?? '조회 실패')
      })
      .catch(() => setError('네트워크 오류'))
      .finally(() => setLoading(false))
  }, [checkpointId])

  const year = new Date().getFullYear()
  const yearShort = year % 100

  const byMonth: Record<number, CheckRecord> = {}
  records.forEach(r => {
    const d = new Date(r.checked_at)
    if (d.getFullYear() !== year) return
    const m = d.getMonth() + 1
    if (!byMonth[m] || new Date(r.checked_at) > new Date(byMonth[m].checked_at)) byMonth[m] = r
  })

  if (loading) return <div style={page}><div className="text-center p-10 text-[#333] text-[14px]">조회 중...</div></div>
  if (error || !cp) return <div style={page}><div className="text-center p-10 text-[#333] text-[14px]">{error ?? '데이터를 찾을 수 없습니다'}</div></div>

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const typeText = ext?.type ?? '-'
  const ROW_H = 35 // 고정 행 높이 (이미지 230px / 7행 + 패딩)

  return (
    <div style={page}>
      <table className={tbl} cellSpacing={0} cellPadding={0}>
        <colgroup>
          <col className="w-[6%]" />{/* 월 */}
          <col className="w-[3%]" />{/* / */}
          <col className="w-[6%]" />{/* 일 */}
          <col className="w-[10%]" />{/* 점검자1 */}
          <col className="w-[10%]" />{/* 점검자2 */}
          <col className="w-[10%]" />{/* 이상유무 */}
          <col className="w-[13%]" />{/* 서명 */}
          <col className="w-[14%]" />{/* 점검사항1 */}
          <col className="w-[14%]" />{/* 점검사항2 */}
          <col className="w-[14%]" />{/* 점검사항3 */}
        </colgroup>
        {/* ── 제목 ── */}
        <thead>
          <tr><td colSpan={10} className="bg-[#c00] text-[#FFD700] text-center text-[18px] font-black py-[10px] px-0 tracking-[0.15em] border-2 border-[#333]">
            소 화 기 점 검 표
          </td></tr>
        </thead>

        <tbody>
          {/* ── Row 5: 년도 / 점검관리자 / 정 ── */}
          <tr>
            <td colSpan={3} className={`${th} text-center`}>년 도</td>
            <td className={`${cl} text-right border-r-transparent`}>{yearShort}</td>
            <td className={`${cl} border-l-transparent`}>년</td>
            <td rowSpan={2} colSpan={2} className={`${th} text-center align-middle`}>점검관리자</td>
            <td className={`${th} text-center`}>정</td>
            <td colSpan={2} className={`${cl} text-center`}>석현민</td>
          </tr>
          {/* ── Row 6: 종류 / 부 ── */}
          <tr>
            <td colSpan={3} className={`${th} text-center`}>종 류</td>
            <td colSpan={2} className={`${cl} text-center`}>{typeText}</td>
            <td className={`${th} text-center`}>부</td>
            <td colSpan={2} className={`${cl} text-center`}></td>
          </tr>

          {/* ── 헤더 행 ── */}
          <tr className="bg-[#f0ede5]">
            <td className={`${th} text-center border-r-transparent`}>월</td>
            <td className={`${th} text-center border-l-transparent border-r-transparent`}>/</td>
            <td className={`${th} text-center border-l-transparent`}>일</td>
            <td colSpan={2} className={`${th} text-center`}>점검자성명</td>
            <td colSpan={2} className={`${th} text-center`}>이상유무/서명</td>
            <td colSpan={3} className={`${th} text-center`}>점검사항</td>
          </tr>

          {/* ── 1~12월 기록 ── */}
          {months.map((m, i) => {
            const rec = byMonth[m]
            const day = rec ? new Date(rec.checked_at).getDate() : ''
            const name = rec?.staff_name ?? ''
            const status = rec ? (rec.result === 'normal' ? '무' : '유') : ''

            let rightCell = null
            if (i === 0) {
              rightCell = (
                <td rowSpan={7} colSpan={3} className={`${cl} p-0 border-l-2 border-l-[#333] h-[245px] relative overflow-hidden`}>
                  <img src="/extinguisher-check.png" alt="정기점검(월1회)" className="absolute top-0 left-0 w-full h-full object-fill block" />
                </td>
              )
            } else if (i === 7) {
              rightCell = <td colSpan={3} className={`${th} text-center border-l-2 border-l-[#333] text-[10px] h-[35px]`}>소화기번호</td>
            } else if (i === 8) {
              rightCell = <td colSpan={3} className={`${cl} text-center border-l-2 border-l-[#333] h-[35px]`}>{ext?.mgmtNo ?? cp.locationNo ?? '-'}</td>
            } else if (i === 9) {
              rightCell = <td colSpan={3} className={`${th} text-center border-l-2 border-l-[#333] text-[10px] h-[35px]`}>설 치 장 소</td>
            } else if (i === 10) {
              rightCell = <td rowSpan={2} colSpan={3} className={`${cl} text-center border-l-2 border-l-[#333] text-[10px] align-middle leading-[1.4]`}>{ext?.location ?? cp.location}</td>
            }

            return (
              <tr key={m}>
                <td className={`${cl} text-center h-[35px] border-r-transparent`}>{m}</td>
                <td className={`${cl} text-center h-[35px] border-l-transparent border-r-transparent p-0 w-2 text-[#999]`}>/</td>
                <td className={`${cl} text-center h-[35px] border-l-transparent`}>{day}</td>
                <td colSpan={2} className={`${cl} text-center h-[35px]`}>{name}</td>
                <td className={`${cl} text-center h-[35px]`}>{status}</td>
                <td className={`${cl} text-center h-[35px]`}>{name}</td>
                {rightCell}
              </tr>
            )
          })}

          {/* ── 하단 ── */}
          <tr>
            <td colSpan={10} className="bg-[#c00] text-[#fff] text-center text-[11px] font-bold py-2 px-1.5 leading-[1.8] border-2 border-[#333]">
              이상 발견 즉시 수리를 의뢰하십시오.<br />
              <span className="text-[10px]">방 재 실 &nbsp;&nbsp;&nbsp; 031-881-7119</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const page: React.CSSProperties = { maxWidth:480, margin:'0 auto', padding:'8px 8px 8px', fontFamily:'"Noto Sans KR", sans-serif', background:'#fff', color:'#000', fontWeight:700, WebkitUserSelect:'none', userSelect:'none', WebkitTouchCallout:'none' } as any
const tbl = "w-full border-collapse border-2 border-[#333] text-[12px] text-[#000] font-bold"
const th  = "bg-[#f0ede5] border border-[#999] py-[5px] px-1 font-bold text-[10px] whitespace-nowrap text-[#000]"
const cl  = "border border-[#bbb] py-[5px] px-1 text-[12px] text-[#000] font-bold"
