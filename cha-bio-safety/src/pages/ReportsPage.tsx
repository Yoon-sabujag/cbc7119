import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { generateDivExcel, generateCheckExcel } from '../utils/generateExcel'

type ReportType = 'div-early' | 'div-late' | '소화전' | '청정소화약제' | '비상콘센트'

const REPORT_CARDS: { type: ReportType; title: string; sub: string }[] = [
  { type: 'div-early',   title: '월초 유수검지 장치 점검표',  sub: 'DIV · 34개소' },
  { type: 'div-late',    title: '월말 유수검지 장치 점검표',  sub: 'DIV · 34개소' },
  { type: '소화전',      title: '월간 옥내소화전 점검일지',   sub: '소화전 · 각 층' },
  { type: '청정소화약제', title: '청정소화약제설비 점검일지', sub: '가스소화 · 3개소' },
  { type: '비상콘센트',  title: '월간 비상콘센트 점검일지',   sub: '비상콘센트 · 8개소' },
]

const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = 2023

export default function ReportsPage() {
  const navigate  = useNavigate()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [loading, setLoading] = useState<ReportType | null>(null)

  const handleDownload = async (type: ReportType) => {
    setLoading(type)
    try {
      if (type === 'div-early' || type === 'div-late') {
        const data = await api.get<any[]>(`/reports/div?year=${year}`)
        generateDivExcel(year, data, type === 'div-early' ? '월초' : '월말')
      } else {
        const data = await api.get<any[]>(
          `/reports/check-monthly?year=${year}&category=${encodeURIComponent(type)}`
        )
        generateCheckExcel(year, data, type)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <header style={{ flexShrink: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', padding: '8px 12px 9px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={iconBtn}>
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>점검 기록 출력</span>

        {/* 연도 선택 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
            {year > MIN_YEAR && (
              <button onClick={() => setYear(y => y - 1)} style={navBtn}>‹</button>
            )}
          </div>
          <span style={{ width: 44, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{year}년</span>
          <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
            {year < CURRENT_YEAR && (
              <button onClick={() => setYear(y => y + 1)} style={navBtn}>›</button>
            )}
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {REPORT_CARDS.map(card => (
          <div key={card.type} style={{ background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--bd)', padding: '14px', marginBottom: 10 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{card.title}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{card.sub} · {year}년도</div>
            </div>
            <button
              onClick={() => handleDownload(card.type)}
              disabled={loading === card.type}
              style={{
                width: '100%', padding: '11px', borderRadius: 9, border: 'none',
                background: loading === card.type ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                color: loading === card.type ? 'var(--t3)' : '#fff',
                fontSize: 12, fontWeight: 700, cursor: loading === card.type ? 'default' : 'pointer',
              }}>
              {loading === card.type ? '생성 중...' : '⬇ 엑셀 다운로드'}
            </button>
          </div>
        ))}

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--t3)', padding: '8px 0 20px' }}>
          다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)
        </div>
      </div>
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
  background: 'var(--bg3)', border: '1px solid var(--bd)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const navBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: '1px solid var(--bd)',
  background: 'var(--bg3)', color: 'var(--t1)', fontSize: 16, fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1,
}
