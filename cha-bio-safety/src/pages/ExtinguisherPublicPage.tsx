import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

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

  if (loading) return <div style={page}><div style={{ textAlign:'center', padding:40, color:'#333', fontSize:14 }}>조회 중...</div></div>
  if (error || !cp) return <div style={page}><div style={{ textAlign:'center', padding:40, color:'#333', fontSize:14 }}>{error ?? '데이터를 찾을 수 없습니다'}</div></div>

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const typeText = ext?.type ? (ext.type + (ext.type === '분말' ? ' 3.3kg' : '')) : '-'
  const ROW_H = 35 // 고정 행 높이 (이미지 230px / 7행 + 패딩)

  return (
    <div style={page}>
      <table style={tbl} cellSpacing={0} cellPadding={0}>
        <colgroup>
          <col style={{ width:'6%' }} />{/* 월 */}
          <col style={{ width:'3%' }} />{/* / */}
          <col style={{ width:'6%' }} />{/* 일 */}
          <col style={{ width:'10%' }} />{/* 점검자1 */}
          <col style={{ width:'10%' }} />{/* 점검자2 */}
          <col style={{ width:'10%' }} />{/* 이상유무 */}
          <col style={{ width:'13%' }} />{/* 서명 */}
          <col style={{ width:'14%' }} />{/* 점검사항1 */}
          <col style={{ width:'14%' }} />{/* 점검사항2 */}
          <col style={{ width:'14%' }} />{/* 점검사항3 */}
        </colgroup>
        {/* ── 제목 ── */}
        <thead>
          <tr><td colSpan={10} style={{ background:'#c00', color:'#FFD700', textAlign:'center', fontSize:18, fontWeight:900, padding:'10px 0', letterSpacing:'0.15em', border:'2px solid #333' }}>
            소 화 기 점 검 표
          </td></tr>
        </thead>

        <tbody>
          {/* ── Row 5: 년도 / 점검관리자 / 정 ── */}
          <tr>
            <td colSpan={3} style={{ ...th, textAlign:'center' }}>년 도</td>
            <td style={{ ...cl, textAlign:'right', borderRight:'1px solid transparent' }}>{yearShort}</td>
            <td style={{ ...cl, borderLeft:'1px solid transparent' }}>년</td>
            <td rowSpan={2} colSpan={2} style={{ ...th, textAlign:'center', verticalAlign:'middle' }}>점검관리자</td>
            <td style={{ ...th, textAlign:'center' }}>정</td>
            <td colSpan={2} style={{ ...cl, textAlign:'center' }}>석현민</td>
          </tr>
          {/* ── Row 6: 종류 / 부 ── */}
          <tr>
            <td colSpan={3} style={{ ...th, textAlign:'center' }}>종 류</td>
            <td colSpan={2} style={{ ...cl, textAlign:'center' }}>{typeText}</td>
            <td style={{ ...th, textAlign:'center' }}>부</td>
            <td colSpan={2} style={{ ...cl, textAlign:'center' }}></td>
          </tr>

          {/* ── 헤더 행 ── */}
          <tr style={{ background:'#f0ede5' }}>
            <td style={{ ...th, textAlign:'center', borderRight:'1px solid transparent' }}>월</td>
            <td style={{ ...th, textAlign:'center', borderLeft:'1px solid transparent', borderRight:'1px solid transparent' }}>/</td>
            <td style={{ ...th, textAlign:'center', borderLeft:'1px solid transparent' }}>일</td>
            <td colSpan={2} style={{ ...th, textAlign:'center' }}>점검자성명</td>
            <td colSpan={2} style={{ ...th, textAlign:'center' }}>이상유무/서명</td>
            <td colSpan={3} style={{ ...th, textAlign:'center' }}>점검사항</td>
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
                <td rowSpan={7} colSpan={3} style={{ ...cl, padding:0, borderLeft:'2px solid #333', height: ROW_H * 7, position:'relative' as any, overflow:'hidden' }}>
                  <img src="/extinguisher-check.png" alt="정기점검(월1회)" style={{ position:'absolute' as any, top:0, left:0, width:'100%', height:'100%', objectFit:'fill', display:'block' }} />
                </td>
              )
            } else if (i === 7) {
              rightCell = <td colSpan={3} style={{ ...th, textAlign:'center', borderLeft:'2px solid #333', fontSize:10, height:ROW_H }}>소화기번호</td>
            } else if (i === 8) {
              rightCell = <td colSpan={3} style={{ ...cl, textAlign:'center', borderLeft:'2px solid #333', height:ROW_H }}>{ext?.mgmtNo ?? cp.locationNo ?? '-'}</td>
            } else if (i === 9) {
              rightCell = <td colSpan={3} style={{ ...th, textAlign:'center', borderLeft:'2px solid #333', fontSize:10, height:ROW_H }}>설 치 장 소</td>
            } else if (i === 10) {
              rightCell = <td rowSpan={2} colSpan={3} style={{ ...cl, textAlign:'center', borderLeft:'2px solid #333', fontSize:10, verticalAlign:'middle', lineHeight:1.4 }}>{ext?.location ?? cp.location}</td>
            }

            return (
              <tr key={m}>
                <td style={{ ...cl, textAlign:'center', height:ROW_H, borderRight:'1px solid transparent' }}>{m}</td>
                <td style={{ ...cl, textAlign:'center', height:ROW_H, borderLeft:'1px solid transparent', borderRight:'1px solid transparent', padding:0, width:8, color:'#999' }}>/</td>
                <td style={{ ...cl, textAlign:'center', height:ROW_H, borderLeft:'1px solid transparent' }}>{day}</td>
                <td colSpan={2} style={{ ...cl, textAlign:'center', height:ROW_H }}>{name}</td>
                <td style={{ ...cl, textAlign:'center', height:ROW_H }}>{status}</td>
                <td style={{ ...cl, textAlign:'center', height:ROW_H }}>{name}</td>
                {rightCell}
              </tr>
            )
          })}

          {/* ── 하단 ── */}
          <tr>
            <td colSpan={10} style={{ background:'#c00', color:'#fff', textAlign:'center', fontSize:11, fontWeight:700, padding:'8px 6px', lineHeight:1.8, border:'2px solid #333' }}>
              이상 발견 즉시 수리를 의뢰하십시오.<br />
              <span style={{ fontSize:10 }}>방 재 실 &nbsp;&nbsp;&nbsp; 031-881-7119</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const page: React.CSSProperties = { maxWidth:480, margin:'0 auto', padding:'8px 8px 8px', fontFamily:'"Noto Sans KR", sans-serif', background:'#fff', color:'#000', fontWeight:700, WebkitUserSelect:'none', userSelect:'none', WebkitTouchCallout:'none' } as any
const tbl: React.CSSProperties = { width:'100%', borderCollapse:'collapse', border:'2px solid #333', fontSize:12, color:'#000', fontWeight:700 }
const th: React.CSSProperties = { background:'#f0ede5', border:'1px solid #999', padding:'5px 4px', fontWeight:700, fontSize:10, whiteSpace:'nowrap', color:'#000' }
const cl: React.CSSProperties = { border:'1px solid #bbb', padding:'5px 4px', fontSize:12, color:'#000', fontWeight:700 }
