import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { generateDivExcel, generateCheckExcel, generateMatrixExcel, generatePumpExcel } from '../utils/generateExcel'

type ReportType = 'div-early' | 'div-late' | '소화전' | '청정소화약제' | '비상콘센트'
  | '피난방화' | '방화셔터' | '제연' | '자탐' | '소방펌프'

interface ExcelPreviewProps {
  reportType: ReportType | null
  year: number
  month?: number
}

const MATRIX_CONFIG: Record<string, { category: string; sheetIndex: number; itemCount: number; name: string; inspectorRow?: number }> = {
  '피난방화': { category: '특별피난계단', sheetIndex: 6, itemCount: 9, name: '피난방화시설', inspectorRow: 29 },
  '방화셔터': { category: '방화셔터', sheetIndex: 7, itemCount: 9, name: '방화셔터', inspectorRow: 29 },
  '제연': { category: '전실제연댐퍼', sheetIndex: 8, itemCount: 9, name: '제연설비', inspectorRow: 29 },
  '자탐': { category: '소방용전원공급반', sheetIndex: 9, itemCount: 10, name: '자동화재탐지설비', inspectorRow: 31 },
}
const MATRIX_TYPES = new Set(Object.keys(MATRIX_CONFIG))

// ── spinner ─────────────────────────────────────────
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

// ── API data key ────────────────────────────────────
function fetchKey(reportType: ReportType | null, year: number): string {
  if (!reportType) return ''
  if (reportType === 'div-early' || reportType === 'div-late') return `/reports/div?year=${year}`
  if (reportType === '소방펌프') return `/reports/pump?year=${year}`
  const category = MATRIX_TYPES.has(reportType) ? MATRIX_CONFIG[reportType]?.category ?? reportType : reportType
  return `/reports/check-monthly?year=${year}&category=${encodeURIComponent(category)}`
}

// ── Generate Excel blob ─────────────────────────────
async function generateBlob(reportType: ReportType, year: number, data: any[]): Promise<Blob | null> {
  try {
    if (reportType === 'div-early' || reportType === 'div-late') {
      return (await generateDivExcel(year, data, reportType === 'div-early' ? '월초' : '월말', true)) as Blob
    }
    if (reportType in MATRIX_CONFIG) {
      const cfg = MATRIX_CONFIG[reportType]
      if (['자탐', '방화셔터', '제연'].includes(reportType) && data.length > 0) {
        const ASSISTANTS = ['석현민', '김병조', '박보융']
        for (const cp of data) {
          for (const m of Object.keys(cp.months ?? {})) {
            if (!cp.months[m].inspector) {
              cp.months[m].inspector = ASSISTANTS[Math.floor(Math.random() * ASSISTANTS.length)]
            }
          }
        }
      }
      return (await generateMatrixExcel(year, data, cfg.sheetIndex, cfg.itemCount, cfg.name, cfg.inspectorRow, true)) as Blob
    }
    if (reportType === '소방펌프') {
      return (await generatePumpExcel(year, data, true)) as Blob
    }
    return (await generateCheckExcel(year, data, reportType, true)) as Blob
  } catch (e) {
    console.error('generateBlob failed:', e)
    return null
  }
}

// ── Upload blob to R2 and get public URL ────────────
async function uploadForPreview(blob: Blob): Promise<string | null> {
  try {
    const { token } = useAuthStore.getState()
    const form = new FormData()
    form.append('file', blob, 'preview.xlsx')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch('/api/uploads', { method: 'POST', body: form, headers })
    const json = await res.json() as any
    if (json.success && json.data?.url) {
      return `${window.location.origin}${json.data.url}`
    }
    return null
  } catch (e) {
    console.error('uploadForPreview failed:', e)
    return null
  }
}

// ── Main component ──────────────────────────────────
export function ExcelPreview({ reportType, year, month }: ExcelPreviewProps) {
  useSpinStyle()

  const path = fetchKey(reportType, year)

  const { data, isLoading: dataLoading, isError } = useQuery<any[]>({
    queryKey: ['report-preview', reportType, year, month],
    queryFn: () => api.get<any[]>(path),
    enabled: !!reportType,
    staleTime: 5 * 60 * 1000,
  })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!reportType || !data || data.length === 0) {
      setPreviewUrl(null)
      return
    }
    let cancelled = false
    setUploading(true)
    setPreviewUrl(null)
    ;(async () => {
      const blob = await generateBlob(reportType, year, data)
      if (cancelled || !blob) { setUploading(false); return }
      const publicUrl = await uploadForPreview(blob)
      if (!cancelled) {
        if (publicUrl) {
          setPreviewUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`)
        }
        setUploading(false)
      }
    })()
    return () => { cancelled = true }
  }, [reportType, year, month, data])

  const isLoading = dataLoading || uploading

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      {!reportType && (
        <Centered>
          <span style={{ fontSize: 14, color: 'var(--t2)' }}>좌측에서 점검일지를 선택하세요.</span>
        </Centered>
      )}

      {reportType && isLoading && (
        <Centered>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 24, height: 24, margin: '0 auto 8px',
              border: '3px solid var(--bd2)',
              borderTopColor: 'var(--acl)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>미리보기 생성 중...</span>
          </div>
        </Centered>
      )}

      {reportType && isError && !isLoading && (
        <Centered>
          <span style={{ fontSize: 14, color: 'var(--t2)' }}>데이터를 불러오지 못했습니다. 새로고침 해주세요.</span>
        </Centered>
      )}

      {reportType && !isLoading && !isError && data && data.length === 0 && (
        <Centered>
          <span style={{ fontSize: 14, color: 'var(--t2)' }}>선택한 기간의 점검 데이터가 없습니다.</span>
        </Centered>
      )}

      {reportType && !isLoading && previewUrl && (
        <iframe
          src={previewUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#fff',
          }}
          title="Excel Preview"
        />
      )}
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
