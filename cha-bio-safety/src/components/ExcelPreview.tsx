import { useRef, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'

type ReportType = 'div-early' | 'div-late' | '소화전' | '청정소화약제' | '비상콘센트'
  | '피난방화' | '방화셔터' | '제연' | '자탐' | '소방펌프'

interface ExcelPreviewProps {
  reportType: ReportType | null
  year: number
  month?: number
}

const MATRIX_TYPES = new Set(['피난방화', '방화셔터', '제연', '자탐'])
const MATRIX_CATEGORIES: Record<string, string> = {
  '피난방화': '특별피난계단',
  '방화셔터': '방화셔터',
  '제연': '전실제연댐퍼',
  '자탐': '소방용전원공급반',
}

const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12]

// ── spinner keyframes injected once ────────────────────────────
const SPIN_STYLE = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`

function useSpinStyle() {
  useEffect(() => {
    const id = 'excel-preview-spin'
    if (!document.getElementById(id)) {
      const s = document.createElement('style')
      s.id = id
      s.textContent = SPIN_STYLE
      document.head.appendChild(s)
    }
  }, [])
}

// ── API fetch key + fetcher ────────────────────────────────────
function fetchKey(reportType: ReportType | null, year: number): string {
  if (!reportType) return ''
  if (reportType === 'div-early' || reportType === 'div-late') {
    return `/reports/div?year=${year}`
  }
  const category = MATRIX_TYPES.has(reportType)
    ? MATRIX_CATEGORIES[reportType]
    : reportType
  return `/reports/check-monthly?year=${year}&category=${encodeURIComponent(category)}`
}

// ── DIV preview table ──────────────────────────────────────────
function DivTable({ data, period }: { data: any[]; period: '월초' | '월말' }) {
  const filtered = data.filter((r: any) => r.period === period || !r.period)
  if (filtered.length === 0) {
    return (
      <div style={{ padding: 24, fontSize: 12, color: '#666' }}>
        {period} 데이터 없음
      </div>
    )
  }
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
      <thead>
        <tr>
          <th style={TH}>점검 위치</th>
          {MONTHS.map(m => (
            <th key={m} style={TH}>{m}월</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((row: any, i: number) => (
          <tr key={i}>
            <td style={{ ...TD, fontWeight: 700 }}>{row.name || row.zone || '-'}</td>
            {MONTHS.map(m => {
              const cell = row.months?.[m] ?? row.months?.[String(m)]
              return (
                <td key={m} style={TD}>{cell?.result ?? cell ?? '-'}</td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Monthly check preview table ────────────────────────────────
function MonthlyTable({ data }: { data: any[] }) {
  if (data.length === 0) return null
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
      <thead>
        <tr>
          <th style={TH}>점검 항목</th>
          {MONTHS.map(m => (
            <th key={m} style={TH}>{m}월</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any, i: number) => (
          <tr key={i}>
            <td style={{ ...TD, fontWeight: 700 }}>{row.name ?? row.checkpoint_name ?? '-'}</td>
            {MONTHS.map(m => {
              const cell = row.months?.[m] ?? row.months?.[String(m)]
              const result = cell?.result ?? cell
              const color = result === '불량' ? '#dc2626' : result === '주의' ? '#d97706' : '#000'
              return (
                <td key={m} style={{ ...TD, color }}>{result ?? '-'}</td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── TH / TD base styles ────────────────────────────────────────
const TH: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '2px 4px',
  background: '#e8e8e8',
  fontWeight: 700,
  fontSize: 11,
  color: '#000',
  textAlign: 'center',
  whiteSpace: 'nowrap',
}

const TD: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '2px 4px',
  fontSize: 11,
  color: '#000',
  textAlign: 'center',
}

// ── Main component ─────────────────────────────────────────────
export function ExcelPreview({ reportType, year, month }: ExcelPreviewProps) {
  useSpinStyle()

  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const A4_W = 1123
  const A4_H = 794

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      const w = entry.contentRect.width
      const h = entry.contentRect.height
      setScale(Math.min(w / A4_W, h / A4_H) * 0.95)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const path = fetchKey(reportType, year)

  const { data, isLoading, isError } = useQuery<any[]>({
    queryKey: ['report-preview', reportType, year, month],
    queryFn: () => api.get<any[]>(path),
    enabled: !!reportType,
    staleTime: 5 * 60 * 1000,
  })

  // ── outer container ──────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      {/* ── A4 paper ────────────────────────────────────────── */}
      <div
        className="excel-preview-inner"
        style={{
          width: A4_W,
          height: A4_H,
          background: '#ffffff',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          transformOrigin: 'center center',
          transform: `scale(${scale})`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* null state */}
        {!reportType && (
          <Centered>
            <span style={{ fontSize: 14, color: 'var(--t2)' }}>좌측에서 점검일지를 선택하세요.</span>
          </Centered>
        )}

        {/* loading */}
        {reportType && isLoading && (
          <Centered>
            <div style={{
              width: 24, height: 24,
              border: '3px solid var(--bd2)',
              borderTopColor: 'var(--acl)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </Centered>
        )}

        {/* error */}
        {reportType && isError && (
          <Centered>
            <span style={{ fontSize: 14, color: 'var(--t2)' }}>데이터를 불러오지 못했습니다. 새로고침 해주세요.</span>
          </Centered>
        )}

        {/* no data */}
        {reportType && !isLoading && !isError && data && data.length === 0 && (
          <Centered>
            <span style={{ fontSize: 14, color: 'var(--t2)' }}>선택한 기간의 점검 데이터가 없습니다.</span>
          </Centered>
        )}

        {/* data */}
        {reportType && !isLoading && !isError && data && data.length > 0 && (
          <div style={{ padding: 16, overflow: 'hidden', height: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 10 }}>
              {year}년도 점검 기록
            </div>
            {(reportType === 'div-early' || reportType === 'div-late') ? (
              <DivTable data={data} period={reportType === 'div-early' ? '월초' : '월말'} />
            ) : (
              <MonthlyTable data={data} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}
