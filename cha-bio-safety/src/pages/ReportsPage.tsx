import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import { api } from '../utils/api'
import { generateDivExcel, generateCheckExcel, generateMatrixExcel, generatePumpExcel } from '../utils/generateExcel'
import { useIsDesktop } from '../hooks/useIsDesktop'

type ReportType = 'div-early' | 'div-late' | '소화전' | '청정소화약제' | '비상콘센트'
  | '피난방화' | '방화셔터' | '제연' | '자탐' | '소방펌프'

const REPORT_CARDS: { type: ReportType; title: string; sub: string }[] = [
  { type: 'div-early',   title: '월초 유수검지 장치 점검표',  sub: 'DIV · 34개소' },
  { type: 'div-late',    title: '월말 유수검지 장치 점검표',  sub: 'DIV · 34개소' },
  { type: '소화전',      title: '월간 옥내소화전 점검일지',   sub: '소화전 · 각 층' },
  { type: '청정소화약제', title: '청정소화약제설비 점검일지', sub: '가스소화 · 3개소' },
  { type: '비상콘센트',  title: '월간 비상콘센트 점검일지',   sub: '비상콘센트 · 8개소' },
  { type: '피난방화',    title: '월간 피난방화시설 점검일지', sub: '피난방화 · 연간' },
  { type: '방화셔터',    title: '월간 방화셔터 점검일지',     sub: '방화셔터 · 연간' },
  { type: '제연',        title: '월간 제연설비 점검일지',     sub: '제연설비 · 연간' },
  { type: '자탐',        title: '자동화재탐지설비 점검일지',  sub: '자탐설비 · 연간' },
  { type: '소방펌프',    title: '월간 소방펌프 점검일지',     sub: '소방펌프 · 월간' },
]

const MATRIX_CONFIG: Record<string, { category: string; sheetIndex: number; itemCount: number; name: string; inspectorRow?: number }> = {
  '피난방화': { category: '특별피난계단', sheetIndex: 6, itemCount: 9, name: '피난방화시설', inspectorRow: 29 },
  '방화셔터': { category: '방화셔터', sheetIndex: 7, itemCount: 9, name: '방화셔터', inspectorRow: 29 },
  '제연':     { category: '전실제연댐퍼', sheetIndex: 8, itemCount: 9, name: '제연설비', inspectorRow: 29 },
  '자탐':     { category: '소방용전원공급반', sheetIndex: 9, itemCount: 10, name: '자동화재탐지설비', inspectorRow: 31 },
}

const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = 2023

// Annual report types — no month filter
const ANNUAL_TYPES = new Set<ReportType>(['피난방화', '방화셔터', '제연', '자탐'])

// ── 데스크톱 대카테고리 탭 ─────────────────────────────────────
const DESKTOP_CATEGORIES = [
  { label: '유수검지', types: ['div-early', 'div-late'] as ReportType[] },
  { label: '소화전',   types: ['소화전', '비상콘센트', '청정소화약제'] as ReportType[] },
  { label: '피난방화', types: ['피난방화', '방화셔터'] as ReportType[] },
  { label: '제연',     types: ['제연'] as ReportType[] },
  { label: '자탐',     types: ['자탐'] as ReportType[] },
  { label: '소방펌프', types: ['소방펌프'] as ReportType[] },
]

// ── 공통 handleDownload 로직 ───────────────────────────────────
async function downloadReport(type: ReportType, year: number): Promise<void> {
  if (type === 'div-early' || type === 'div-late') {
    const data = await api.get<any[]>(`/reports/div?year=${year}`)
    generateDivExcel(year, data, type === 'div-early' ? '월초' : '월말')
  } else if (type in MATRIX_CONFIG) {
    const cfg = MATRIX_CONFIG[type]
    const data = await api.get<any[]>(
      `/reports/check-monthly?year=${year}&category=${encodeURIComponent(cfg.category)}`
    )
    if (['자탐', '방화셔터', '제연'].includes(type) && data.length > 0) {
      const ASSISTANTS = ['석현민', '김병조', '박보융']
      for (const cp of data) {
        for (const m of Object.keys(cp.months ?? {})) {
          if (!cp.months[m].inspector) {
            cp.months[m].inspector = ASSISTANTS[Math.floor(Math.random() * ASSISTANTS.length)]
          }
        }
      }
    }
    await generateMatrixExcel(year, data, cfg.sheetIndex, cfg.itemCount, cfg.name, cfg.inspectorRow)
  } else if (type === '소방펌프') {
    const data = await api.get<any[]>(
      `/reports/check-monthly?year=${year}&category=${encodeURIComponent('소방펌프')}`
    )
    await generatePumpExcel(year, data)
  } else {
    const data = await api.get<any[]>(
      `/reports/check-monthly?year=${year}&category=${encodeURIComponent(type)}`
    )
    generateCheckExcel(year, data, type)
  }
}

// ── 데스크톱 섹션별 카드 그리드 레이아웃 ──────────────────────
const DESKTOP_SECTIONS = [
  { label: '유수검지 장치', types: ['div-early', 'div-late'] as ReportType[] },
  { label: '소화전 · 가스 · 비상콘센트', types: ['소화전', '청정소화약제', '비상콘센트'] as ReportType[] },
  { label: '연간 점검일지', types: ['피난방화', '방화셔터', '제연', '자탐'] as ReportType[] },
  { label: '소방펌프', types: ['소방펌프'] as ReportType[] },
]

// ── 개별 보고서 blob 생성 (다운로드 없이) ─────────────────────
async function generateReportBlob(type: ReportType, year: number): Promise<{ blob: Blob; filename: string } | null> {
  try {
    if (type === 'div-early' || type === 'div-late') {
      const data = await api.get<any[]>(`/reports/div?year=${year}`)
      const timing = type === 'div-early' ? '월초' : '월말'
      const blob = await generateDivExcel(year, data, timing, true) as Blob
      return { blob, filename: `${year}년도_DIV점검표_${timing}.xlsx` }
    }
    if (type in MATRIX_CONFIG) {
      const cfg = MATRIX_CONFIG[type]
      const data = await api.get<any[]>(`/reports/check-monthly?year=${year}&category=${encodeURIComponent(cfg.category)}`)
      if (['자탐', '방화셔터', '제연'].includes(type) && data.length > 0) {
        const ASSISTANTS = ['석현민', '김병조', '박보융']
        for (const cp of data) {
          for (const m of Object.keys(cp.months ?? {})) {
            if (!cp.months[m].inspector) cp.months[m].inspector = ASSISTANTS[Math.floor(Math.random() * ASSISTANTS.length)]
          }
        }
      }
      const blob = await generateMatrixExcel(year, data, cfg.sheetIndex, cfg.itemCount, cfg.name, cfg.inspectorRow, true) as Blob
      return { blob, filename: `${year}년도_${cfg.name}_점검일지.xlsx` }
    }
    if (type === '소방펌프') {
      const data = await api.get<any[]>(`/reports/check-monthly?year=${year}&category=${encodeURIComponent('소방펌프')}`)
      const blob = await generatePumpExcel(year, data, true) as Blob
      return { blob, filename: `${year}년도_소방펌프_점검일지.xlsx` }
    }
    const data = await api.get<any[]>(`/reports/check-monthly?year=${year}&category=${encodeURIComponent(type)}`)
    const blob = await generateCheckExcel(year, data, type, true) as Blob
    return { blob, filename: `${year}년도_${type}_점검일지.xlsx` }
  } catch (e) {
    console.error(`Failed to generate ${type}:`, e)
    return null
  }
}

// ── 일괄 다운로드 (zip) ──────────────────────────────────────
async function downloadAllAsZip(year: number, month: number, onProgress: (msg: string) => void) {
  const { zipSync, strToU8 } = await import('fflate')

  const allTypes = REPORT_CARDS.map(c => c.type)
  const files: Record<string, Uint8Array> = {}
  let done = 0

  for (const type of allTypes) {
    onProgress(`생성 중... (${++done}/${allTypes.length})`)
    const result = await generateReportBlob(type, year)
    if (result) {
      const ab = await result.blob.arrayBuffer()
      files[result.filename] = new Uint8Array(ab)
    }
  }

  onProgress('압축 중...')
  const zipped = zipSync(files, { level: 6 })
  const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${year}년도 점검일지 종합 (${String(month).padStart(2, '0')}월 업데이트).zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function DesktopReportsPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [loading, setLoading] = useState<ReportType | null>(null)
  const [zipLoading, setZipLoading] = useState<string | null>(null)
  const month = new Date().getMonth() + 1

  const handleDownload = async (type: ReportType) => {
    setLoading(type)
    try {
      await downloadReport(type, year)
    } finally {
      setLoading(null)
    }
  }

  const handleDownloadAll = async () => {
    setZipLoading('준비 중...')
    try {
      await downloadAllAsZip(year, month, setZipLoading)
    } finally {
      setZipLoading(null)
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px 32px' }}>
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', margin: 0 }}>점검 일지 출력</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--t2)' }}>연도</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={SELECT_STYLE}>
            {Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i).map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <button
            onClick={handleDownloadAll}
            disabled={!!zipLoading}
            style={{
              height: 36,
              padding: '0 16px',
              background: zipLoading ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
              border: 'none',
              borderRadius: 6,
              color: zipLoading ? 'var(--t3)' : '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: zipLoading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Download size={14} />
            {zipLoading ?? '일괄 다운로드'}
          </button>
        </div>
      </div>

      {/* 섹션별 카드 그리드 */}
      {DESKTOP_SECTIONS.map(section => (
        <div key={section.label} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            {section.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {section.types.map(type => {
              const card = REPORT_CARDS.find(c => c.type === type)
              if (!card) return null
              const isLoading = loading === type
              return (
                <div key={type} style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--bd)',
                  borderRadius: 10,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{card.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{card.sub} · {year}년도</div>
                  </div>
                  <button
                    onClick={() => handleDownload(type)}
                    disabled={isLoading}
                    style={{
                      height: 36,
                      background: isLoading ? 'var(--bg3)' : 'var(--bg3)',
                      border: '1px solid var(--bd2)',
                      borderRadius: 6,
                      color: isLoading ? 'var(--t3)' : 'var(--t1)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: isLoading ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    <Download size={14} />
                    {isLoading ? '생성 중...' : '엑셀 다운로드'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const SELECT_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  color: 'var(--t1)',
  border: '1px solid var(--bd2)',
  borderRadius: 4,
  padding: '4px 8px',
  fontSize: 12,
}

// ── 모바일 기존 레이아웃 ───────────────────────────────────────
function MobileReportsPage() {
  const navigate = useNavigate()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [loading, setLoading] = useState<ReportType | null>(null)

  const handleDownload = async (type: ReportType) => {
    setLoading(type)
    try {
      await downloadReport(type, year)
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
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                {card.sub} · {year}년도
              </div>
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

// ── 기본 export: 데스크톱/모바일 분기 ─────────────────────────
export default function ReportsPage() {
  const isDesktop = useIsDesktop()
  if (isDesktop) return <DesktopReportsPage />
  return <MobileReportsPage />
}
