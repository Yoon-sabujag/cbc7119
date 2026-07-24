import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, ChevronLeft } from 'lucide-react'
import { api } from '../utils/api'
import { generateDivExcel, generateCheckExcel, generateMatrixExcel, generatePumpExcel } from '../utils/generateExcel'
import { ExcelPreview } from '../components/ExcelPreview'
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

const MATRIX_CONFIG: Record<string, { category: string; sheetIndex: number; itemCount: number; name: string; inspectorRow?: number; secondaryCategory?: string; primaryItems?: number }> = {
  // 피난방화 sheet6: 특별피난계단(rows 1-5) + 완강기(rows 6-9, secondary) 병합.
  '피난방화': { category: '특별피난계단', sheetIndex: 6, itemCount: 9, name: '피난방화시설', inspectorRow: 29, secondaryCategory: '완강기', primaryItems: 5 },
  '방화셔터': { category: '방화셔터', sheetIndex: 7, itemCount: 10, name: '방화셔터', inspectorRow: 31 },
  '제연':     { category: '전실제연댐퍼', sheetIndex: 8, itemCount: 10, name: '제연설비', inspectorRow: 31 },
  '자탐':     { category: '소방용전원공급반', sheetIndex: 9, itemCount: 10, name: '자동화재탐지설비', inspectorRow: 31 },
}

const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = 2023

// Annual report types — no month filter
const ANNUAL_TYPES = new Set<ReportType>(['피난방화', '방화셔터', '제연', '자탐'])

// ── 공통 handleDownload 로직 ───────────────────────────────────
async function downloadReport(type: ReportType, year: number): Promise<void> {
  if (type === 'div-early' || type === 'div-late') {
    const timing = type === 'div-early' ? 'early' : 'late'
    const data = await api.get<any[]>(`/reports/div?year=${year}&timing=${timing}`)
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
    const secondary = cfg.secondaryCategory
      ? await api.get<any[]>(`/reports/check-monthly?year=${year}&category=${encodeURIComponent(cfg.secondaryCategory)}`)
      : undefined
    await generateMatrixExcel(year, data, cfg.sheetIndex, cfg.itemCount, cfg.name, cfg.inspectorRow, false, secondary, cfg.primaryItems)
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

// ── 개별 보고서 blob 생성 (다운로드 없이) ─────────────────────
async function generateReportBlob(type: ReportType, year: number): Promise<{ blob: Blob; filename: string } | null> {
  try {
    if (type === 'div-early' || type === 'div-late') {
      const timingParam = type === 'div-early' ? 'early' : 'late'
      const data = await api.get<any[]>(`/reports/div?year=${year}&timing=${timingParam}`)
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
      const secondary = cfg.secondaryCategory
        ? await api.get<any[]>(`/reports/check-monthly?year=${year}&category=${encodeURIComponent(cfg.secondaryCategory)}`)
        : undefined
      const blob = await generateMatrixExcel(year, data, cfg.sheetIndex, cfg.itemCount, cfg.name, cfg.inspectorRow, true, secondary, cfg.primaryItems) as Blob
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
  const { zipSync } = await import('fflate')

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

// ── 데스크톱 좌우 2분할 레이아웃 (목록 + 이미지 미리보기) ─────
const DESKTOP_SECTIONS = [
  { label: '유수검지 장치', types: ['div-early', 'div-late'] as ReportType[] },
  { label: '소화전 · 가스 · 비상콘센트', types: ['소화전', '청정소화약제', '비상콘센트'] as ReportType[] },
  { label: '연간 점검일지', types: ['피난방화', '방화셔터', '제연', '자탐'] as ReportType[] },
  { label: '소방펌프', types: ['소방펌프'] as ReportType[] },
]

function DesktopReportsPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [selectedType, setSelectedType] = useState<ReportType>('div-early')
  const [loading, setLoading] = useState<ReportType | null>(null)
  const [zipLoading, setZipLoading] = useState<string | null>(null)
  const [hoverType, setHoverType] = useState<ReportType | null>(null)
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

  const selectedCard = REPORT_CARDS.find(c => c.type === selectedType)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── 상단 바 (전체 폭): 연도 + 일괄 다운로드 + 선택 정보 + 개별 다운로드 ── */}
      <div className="toolbar">
        <label className="toolbar-year-label">연도</label>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="toolbar-select">
          {Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i).map(y => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <button
          className={zipLoading ? 'toolbar-batch-btn toolbar-batch-btn--loading' : 'toolbar-batch-btn'}
          onClick={handleDownloadAll}
          disabled={!!zipLoading}
        >
          <Download size={13} />
          {zipLoading ?? '일괄 다운로드'}
        </button>

        <div className="toolbar-spacer" />

        <span className="toolbar-selected-title">{selectedCard?.title}</span>
        <button
          className={loading === selectedType ? 'toolbar-individual-btn toolbar-individual-btn--loading' : 'toolbar-individual-btn'}
          onClick={() => handleDownload(selectedType)}
          disabled={loading === selectedType}
        >
          <Download size={13} />
          {loading === selectedType ? '생성 중...' : '엑셀 다운로드'}
        </button>
      </div>

      {/* ── 하단: 좌측 항목목록 + 우측 미리보기 ─────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* 좌측 항목 목록 */}
        <div className="sidelist">
          {DESKTOP_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="sidelist-section-header">
                {section.label.split(' · ').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="dot-meta"></span>}
                  </span>
                ))}
              </div>
              {section.types.map(type => {
                const card = REPORT_CARDS.find(c => c.type === type)
                if (!card) return null
                const isSelected = selectedType === type
                const isHover = hoverType === type && !isSelected
                return (
                  <div
                    key={type}
                    onClick={() => setSelectedType(type)}
                    onMouseEnter={() => setHoverType(type)}
                    onMouseLeave={() => setHoverType(null)}
                    className={
                      isSelected ? 'sidelist-row sidelist-row--selected' :
                      isHover ? 'sidelist-row sidelist-row--hover' :
                      'sidelist-row'
                    }
                  >
                    <div className={isSelected ? 'sidelist-row-title sidelist-row-title--selected' : 'sidelist-row-title'}>
                      {card.title}
                    </div>
                    <div className="sidelist-row-sub">{card.sub}</div>
                  </div>
                )
              })}
            </div>
          ))}

        </div>

        {/* 우측 이미지 미리보기 + 데이터 오버레이 */}
        <div className="preview-wrapper">
          <ExcelPreview reportType={selectedType} year={year} month={month} />
        </div>
      </div>
    </div>
  )
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-page)' }}>
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로 가기">
          <ChevronLeft size={15} />
        </button>
        <span className="page-title">점검 일지 출력</span>

        {/* 연도 선택 */}
        <div className="year-pager">
          <div className="year-pager-slot">
            {year > MIN_YEAR && (
              <button className="year-nav-btn" onClick={() => setYear(y => y - 1)} aria-label="이전 연도">‹</button>
            )}
          </div>
          <span className="year-label">{year}년</span>
          <div className="year-pager-slot">
            {year < CURRENT_YEAR && (
              <button className="year-nav-btn" onClick={() => setYear(y => y + 1)} aria-label="다음 연도">›</button>
            )}
          </div>
        </div>
      </header>

      <div className="page-body" style={{ flex: 1, overflowY: 'auto' }}>
        {REPORT_CARDS.map(card => {
          const isLoading = loading === card.type
          const [subLeft, subRight] = card.sub.split(' · ')
          return (
            <div
              key={card.type}
              className={isLoading ? 'report-card report-card--loading' : 'report-card'}
            >
              <div className="report-card-head">
                <div className="report-card-title">{card.title}</div>
                <div className="report-card-sub">
                  <span>{subLeft}</span>
                  <span className="dot-meta"></span>
                  <span>{subRight}</span>
                  <span className="dot-meta"></span>
                  <span>{year}년도</span>
                </div>
              </div>

              <button
                className="report-card-btn"
                onClick={() => handleDownload(card.type)}
                disabled={isLoading}
              >
                {isLoading ? (
                  '생성 중...'
                ) : (
                  <>
                    <Download size={14} />
                    <span>엑셀 다운로드</span>
                  </>
                )}
              </button>
            </div>
          )
        })}

        <div className="page-footer-note">
          다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)
        </div>
      </div>
    </div>
  )
}

// ── 기본 export: 데스크톱/모바일 분기 ─────────────────────────
export default function ReportsPage() {
  const isDesktop = useIsDesktop()
  if (isDesktop) return <DesktopReportsPage />
  return <MobileReportsPage />
}
