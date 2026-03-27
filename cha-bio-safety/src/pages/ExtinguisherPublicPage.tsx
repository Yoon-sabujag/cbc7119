import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface CheckRecord {
  id: string
  result: string
  memo?: string
  checked_at: string
  staff_name: string
}

interface CheckpointInfo {
  id: string
  locationNo: string
  location: string
  floor: string
  description?: string
}

const RESULT_LABEL: Record<string, string> = {
  normal: '이상없음',
  caution: '주의',
  bad: '불량',
  unresolved: '미조치',
  missing: '미확인',
}

export default function ExtinguisherPublicPage() {
  const { checkpointId } = useParams<{ checkpointId: string }>()
  const [checkpoint, setCheckpoint] = useState<CheckpointInfo | null>(null)
  const [records, setRecords]       = useState<CheckRecord[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    if (!checkpointId) return
    fetch(`/api/public/extinguisher/${encodeURIComponent(checkpointId)}`)
      .then(r => r.json())
      .then((json: any) => {
        if (json.success) {
          setCheckpoint(json.data.checkpoint)
          setRecords(json.data.records)
        } else {
          setError(json.error ?? '조회 실패')
        }
      })
      .catch(() => setError('네트워크 오류가 발생했습니다'))
      .finally(() => setLoading(false))
  }, [checkpointId])

  const year = new Date().getFullYear()

  // 월별로 그룹핑
  const byMonth: Record<number, CheckRecord[]> = {}
  records.forEach(r => {
    const m = new Date(r.checked_at).getMonth() + 1
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(r)
  })

  if (loading) {
    return (
      <div style={pageSt}>
        <div style={{ textAlign: 'center', padding: 40, color: '#666', fontSize: 14 }}>조회 중...</div>
      </div>
    )
  }

  if (error || !checkpoint) {
    return (
      <div style={pageSt}>
        <div style={{ textAlign: 'center', padding: 40, color: '#c00', fontSize: 14 }}>
          {error ?? '데이터를 찾을 수 없습니다'}
        </div>
      </div>
    )
  }

  return (
    <div style={pageSt}>
      {/* 제목 */}
      <div style={titleBarSt}>소화기 점검표</div>

      {/* 기본 정보 */}
      <table style={tableSt}>
        <tbody>
          <tr>
            <td style={thSt}>년 도</td>
            <td style={tdSt}>{year} 년</td>
            <td style={thSt}>점검관리자</td>
            <td style={tdSt}>방화관리자</td>
          </tr>
          <tr>
            <td style={thSt}>소화기번호</td>
            <td style={tdSt}>{checkpoint.locationNo}</td>
            <td style={thSt}>설치장소</td>
            <td style={tdSt}>{checkpoint.location} ({checkpoint.floor})</td>
          </tr>
        </tbody>
      </table>

      {/* 점검 기록 */}
      <table style={{ ...tableSt, marginTop: 0 }}>
        <thead>
          <tr>
            <th style={{ ...thSt, width: 60 }}>월/일</th>
            <th style={thSt}>점검자성명</th>
            <th style={thSt}>이상유무</th>
            <th style={{ ...thSt, width: 80 }}>서명</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
            const monthRecords = byMonth[month] ?? []
            if (monthRecords.length === 0) {
              return (
                <tr key={month}>
                  <td style={{ ...tdSt, textAlign: 'center', color: '#999' }}>{month}/</td>
                  <td style={tdSt} />
                  <td style={tdSt} />
                  <td style={tdSt} />
                </tr>
              )
            }
            return monthRecords.map((rec, idx) => {
              const d = new Date(rec.checked_at)
              const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
              const isNormal = rec.result === 'normal'
              return (
                <tr key={rec.id}>
                  <td style={{ ...tdSt, textAlign: 'center' }}>{dateStr}</td>
                  <td style={{ ...tdSt, textAlign: 'center' }}>{rec.staff_name}</td>
                  <td style={{
                    ...tdSt,
                    textAlign: 'center',
                    color: isNormal ? '#16a34a' : '#dc2626',
                    fontWeight: 600,
                  }}>
                    {RESULT_LABEL[rec.result] ?? rec.result}
                    {rec.memo ? ` (${rec.memo})` : ''}
                  </td>
                  <td style={tdSt} />
                </tr>
              )
            })
          })}
        </tbody>
      </table>

      {/* 점검 항목 안내 */}
      <div style={infoBoxSt}>
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>정기점검 항목 (월 1회)</div>
        <div style={{ fontSize: 11, lineHeight: 1.8, color: '#444' }}>
          안전핀 · 손잡이 · 충전압력 · 봉인끈 · 현장스티커<br />
          사용기간 · 분사호스/분사노즐 · 도장상태 & 밑받침
        </div>
      </div>

      {/* 하단 */}
      <div style={footerSt}>
        이상 발견 즉시 수리를 의뢰하십시오<br />
        <span style={{ fontSize: 11, color: '#555' }}>방화관리자: 차바이오컴플렉스 방재팀</span>
      </div>
    </div>
  )
}

// ── 스타일 ──────────────────────────────────────────────────
const pageSt: React.CSSProperties = {
  maxWidth: 480,
  margin: '0 auto',
  padding: '12px 12px 40px',
  fontFamily: 'sans-serif',
  background: '#fff',
  minHeight: '100vh',
}

const titleBarSt: React.CSSProperties = {
  background: '#c00',
  color: '#FFD700',
  textAlign: 'center',
  fontSize: 22,
  fontWeight: 900,
  padding: '10px 0',
  borderRadius: '4px 4px 0 0',
  letterSpacing: '0.05em',
}

const tableSt: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #999',
  fontSize: 12,
}

const thSt: React.CSSProperties = {
  background: '#f0f0f0',
  border: '1px solid #999',
  padding: '6px 8px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
}

const tdSt: React.CSSProperties = {
  border: '1px solid #bbb',
  padding: '6px 8px',
  minHeight: 24,
}

const infoBoxSt: React.CSSProperties = {
  border: '1px solid #999',
  borderTop: 'none',
  padding: '10px 12px',
  background: '#fafafa',
}

const footerSt: React.CSSProperties = {
  background: '#c00',
  color: '#fff',
  textAlign: 'center',
  fontSize: 12,
  fontWeight: 700,
  padding: '8px 0',
  borderRadius: '0 0 4px 4px',
  lineHeight: 1.8,
}
