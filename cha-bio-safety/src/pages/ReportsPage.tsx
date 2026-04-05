import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { api } from '../utils/api'
import { generateDivExcel, generateCheckExcel, generateMatrixExcel, generatePumpExcel } from '../utils/generateExcel'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { ExcelPreview } from '../components/ExcelPreview'

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

// ── 데스크톱 3분할 레이아웃 ───────────────────────────────────
function DesktopReportsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedType, setSelectedType] = useState<ReportType>(DESKTOP_CATEGORIES[0].types[0])
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [downloading, setDownloading] = useState(false)
  const [tabHover, setTabHover] = useState<number | null>(null)
  const [itemHover, setItemHover] = useState<ReportType | null>(null)
  const [dlHover, setDlHover] = useState(false)
  const [prHover, setPrHover] = useState(false)

  const handleTabChange = (idx: number) => {
    setActiveTab(idx)
    setSelectedType(DESKTOP_CATEGORIES[idx].types[0])
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadReport(selectedType, year)
    } finally {
      setDownloading(false)
    }
  }

  const showMonthFilter = !ANNUAL_TYPES.has(selectedType)

  const currentTypes = DESKTOP_CATEGORIES[activeTab].types

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── 대카테고리 탭 행 ───────────────────────────────────── */}
      <div
        data-no-print
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--bd)',
          background: 'var(--bg2)',
          flexShrink: 0,
          height: 44,
          alignItems: 'stretch',
        }}
      >
        {DESKTOP_CATEGORIES.map((cat, idx) => {
          const isActive = idx === activeTab
          const isHover = tabHover === idx && !isActive
          return (
            <button
              key={cat.label}
              onClick={() => handleTabChange(idx)}
              onMouseEnter={() => setTabHover(idx)}
              onMouseLeave={() => setTabHover(null)}
              style={{
                padding: '0 20px',
                fontSize: 14,
                color: isActive ? 'var(--acl)' : isHover ? 'var(--t1)' : 'var(--t2)',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--acl)' : '2px solid transparent',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ── 바디 행 ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── 좌측 패널 ──────────────────────────────────────── */}
        <div
          data-no-print
          style={{
            width: 280,
            flexShrink: 0,
            borderRight: '1px solid var(--bd)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg2)',
          }}
        >
          {/* 연도/월 필터 */}
          <div style={{
            padding: '12px 16px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            borderBottom: '1px solid var(--bd)',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}>
            <label style={{ fontSize: 12, color: 'var(--t2)' }}>연도</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={SELECT_STYLE}
            >
              {Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i).map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>

            {showMonthFilter && (
              <>
                <label style={{ fontSize: 12, color: 'var(--t2)' }}>월</label>
                <select
                  value={month}
                  onChange={e => setMonth(Number(e.target.value))}
                  style={SELECT_STYLE}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* 항목 목록 */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {currentTypes.map(type => {
              const card = REPORT_CARDS.find(c => c.type === type)
              if (!card) return null
              const isSelected = selectedType === type
              const isHover = itemHover === type && !isSelected
              return (
                <div
                  key={type}
                  onClick={() => setSelectedType(type)}
                  onMouseEnter={() => setItemHover(type)}
                  onMouseLeave={() => setItemHover(null)}
                  style={{
                    height: 44,
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--bd)',
                    background: (isSelected || isHover) ? 'var(--bg3)' : 'var(--bg2)',
                    borderLeft: isSelected ? '3px solid var(--acl)' : '3px solid transparent',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{
                    fontSize: 14,
                    color: 'var(--t1)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                  }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', width: '100%' }}>
                    {card.sub}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 액션 버튼 */}
          <div
            data-no-print
            style={{
              padding: '12px 16px',
              display: 'flex',
              gap: 8,
              flexShrink: 0,
              borderTop: '1px solid var(--bd)',
            }}
          >
            <button
              onClick={handleDownload}
              disabled={downloading}
              onMouseEnter={() => setDlHover(true)}
              onMouseLeave={() => setDlHover(false)}
              style={{
                flex: 1,
                height: 36,
                background: (dlHover && !downloading) ? 'var(--bg4)' : 'var(--bg3)',
                border: '1px solid var(--bd2)',
                borderRadius: 6,
                color: 'var(--t1)',
                fontSize: 14,
                cursor: downloading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                opacity: downloading ? 0.5 : 1,
              }}
            >
              <Download size={16} />
              엑셀 다운로드
            </button>
            <button
              onClick={() => window.print()}
              onMouseEnter={() => setPrHover(true)}
              onMouseLeave={() => setPrHover(false)}
              style={{
                flex: 1,
                height: 36,
                background: prHover ? 'var(--bg4)' : 'var(--bg3)',
                border: '1px solid var(--bd2)',
                borderRadius: 6,
                color: 'var(--t1)',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Printer size={16} />
              인쇄
            </button>
          </div>
        </div>

        {/* ── 우측 A4 미리보기 ────────────────────────────────── */}
        <div style={{ flex: 1, overflow: 'hidden', background: 'var(--bg)' }}>
          <ExcelPreview reportType={selectedType} year={year} month={month} />
        </div>
      </div>
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
