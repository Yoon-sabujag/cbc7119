import { useRef, useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'
import { DIV_ORDER } from '../utils/generateExcel'

type ReportType = 'div-early' | 'div-late' | '소화전' | '청정소화약제' | '비상콘센트'
  | '피난방화' | '방화셔터' | '제연' | '자탐' | '소방펌프'

interface ExcelPreviewProps {
  reportType: ReportType | null
  year: number
  month?: number
}

const PREVIEW_IMAGES: Record<ReportType, string> = {
  'div-early':   '/templates/preview/report-01.png',
  'div-late':    '/templates/preview/report-02.png',
  '소화전':      '/templates/preview/report-03.png',
  '비상콘센트':  '/templates/preview/report-04.png',
  '청정소화약제': '/templates/preview/report-05.png',
  '피난방화':    '/templates/preview/report-06.png',
  '방화셔터':    '/templates/preview/report-07.png',
  '제연':        '/templates/preview/report-08.png',
  '자탐':        '/templates/preview/report-09.png',
  '소방펌프':    '/templates/preview/report-10.png',
}

const REPORT_GRID: Record<string, { rows: number; cols: number }> = {
  '소화전': { rows: 7, cols: 12 },
  '청정소화약제': { rows: 10, cols: 12 },
  '비상콘센트': { rows: 7, cols: 12 },
  '피난방화': { rows: 9, cols: 12 },
  '방화셔터': { rows: 9, cols: 12 },
  '제연': { rows: 9, cols: 12 },
  '자탐': { rows: 10, cols: 12 },
  '소방펌프': { rows: 10, cols: 2 },
}

const MATRIX_TYPES = new Set(['피난방화', '방화셔터', '제연', '자탐'])
const MATRIX_CATEGORIES: Record<string, string> = {
  '피난방화': '특별피난계단', '방화셔터': '방화셔터', '제연': '전실제연댐퍼', '자탐': '소방용전원공급반',
}

function fetchKey(rt: ReportType | null, year: number): string {
  if (!rt) return ''
  if (rt === 'div-early' || rt === 'div-late') return `/reports/div?year=${year}`
  if (rt === '소방펌프') return `/reports/check-monthly?year=${year}&category=${encodeURIComponent('소방펌프')}`
  const cat = MATRIX_TYPES.has(rt) ? MATRIX_CATEGORIES[rt] ?? rt : rt
  return `/reports/check-monthly?year=${year}&category=${encodeURIComponent(cat)}`
}

// ── 오버레이 ────────────────────────────────────────────────
interface OI { x: number; y: number; text: string; fontSize?: number; color?: string; fontWeight?: number }

// ── 캘리브레이션 ────────────────────────────────────────────
interface CalibData {
  firstCell: { x: number; y: number }
  lastCell: { x: number; y: number }
  yearPos?: { x: number; y: number }
  monthPos?: { x: number; y: number }
  locPos?: { x: number; y: number }
  firstDate?: { x: number; y: number }
  lastDate?: { x: number; y: number }
  firstInspector?: { x: number; y: number }
  lastInspector?: { x: number; y: number }
}

const CALIB_STEPS = [
  { label: '첫번째 ○ (좌상단)', color: '#22c55e', skip: false },
  { label: '마지막 ○ (우하단)', color: '#ef4444', skip: false },
  { label: '년도', color: '#3b82f6', skip: true },
  { label: '월', color: '#06b6d4', skip: true },
  { label: '개소명', color: '#10b981', skip: true },
  { label: '첫 일자 (1월)', color: '#f59e0b', skip: true },
  { label: '끝 일자 (12월)', color: '#d97706', skip: true },
  { label: '첫 점검자', color: '#a855f7', skip: true },
  { label: '끝 점검자', color: '#7c3aed', skip: true },
]
const FINGER_OFFSET = 60

function loadCalib(rt: ReportType): CalibData | null {
  try { return JSON.parse(localStorage.getItem(`calib_${rt}`) ?? 'null') } catch { return null }
}
function saveCalib(rt: ReportType, data: CalibData) {
  localStorage.setItem(`calib_${rt}`, JSON.stringify(data))
}

function calcGrid(calib: CalibData, rows: number, cols: number) {
  const cg = cols > 1 ? (calib.lastCell.x - calib.firstCell.x) / (cols - 1) : 0
  const rg = rows > 1 ? (calib.lastCell.y - calib.firstCell.y) / (rows - 1) : 0
  return {
    monthXs: Array.from({ length: cols }, (_, i) => calib.firstCell.x + cg * i),
    itemYs: Array.from({ length: rows }, (_, i) => calib.firstCell.y + rg * i),
  }
}

// ── DIV (하드코딩) ──────────────────────────────────────────
const DL = { valve: 14.62, pressure: 20.91, switch: 27.19, clean: 33.52, pValue: 39.93, inspector: 46.47, day: 9.81 }
const DR = { valve: 56.31, pressure: 62.63, switch: 69.00, clean: 75.29, pValue: 81.57, inspector: 88.20, day: 51.50 }
const DY = [
  [31.88, 34.22, 36.56], [38.90, 41.23, 43.57], [45.91, 48.25, 50.58],
  [52.92, 55.26, 57.60], [59.94, 62.27, 64.61], [66.95, 69.29, 71.62],
]

function buildDivOverlay(data: any[], year?: number): OI[] {
  const items: OI[] = []
  const loc = DIV_ORDER[0]
  const entries = data.filter((r: any) => r.location_no === loc)
  if (year) items.push({ x: 18.60, y: 13.66, text: String(year), fontSize: 30 })
  items.push({ x: 59.30, y: 13.66, text: `#${loc}`, fontSize: 30 })
  for (const e of entries) {
    const m = e.month; if (m < 1 || m > 12) continue
    const p = m <= 6 ? DL : DR, y = DY[(m - 1) % 6]
    items.push({ x: p.valve, y: y[1], text: '○', fontSize: 11, fontWeight: 900 })
    items.push({ x: p.pressure, y: y[1], text: '○', fontSize: 11, fontWeight: 900 })
    items.push({ x: p.switch, y: y[1], text: '○', fontSize: 11, fontWeight: 900 })
    items.push({ x: p.clean, y: y[1], text: '○', fontSize: 11, fontWeight: 900 })
    if (e.pressure_1 != null) items.push({ x: p.pValue, y: y[0], text: Number(e.pressure_1).toFixed(1), fontSize: 8, fontWeight: 900 })
    if (e.pressure_2 != null) items.push({ x: p.pValue, y: y[1], text: Number(e.pressure_2).toFixed(1), fontSize: 8, fontWeight: 900 })
    if (e.pressure_set != null) items.push({ x: p.pValue, y: y[2], text: Number(e.pressure_set).toFixed(1), fontSize: 8, fontWeight: 900 })
    if (e.inspector) items.push({ x: p.inspector, y: y[1], text: e.inspector, fontSize: 8, fontWeight: 900 })
    if (e.day) items.push({ x: p.day - 0.5, y: y[2], text: String(e.day), fontSize: 8, fontWeight: 900 })
  }
  return items
}

// ── 월간/연간 (캘리브레이션 기반) ────────────────────────────
function buildCheckOverlay(data: any[], rt: string, year?: number): OI[] {
  const items: OI[] = []
  const calib = loadCalib(rt as ReportType)
  const grid = REPORT_GRID[rt]
  if (!calib || !grid) return items
  const { monthXs, itemYs } = calcGrid(calib, grid.rows, grid.cols)

  // 년도
  if (year && calib.yearPos) items.push({ x: calib.yearPos.x, y: calib.yearPos.y, text: String(year), fontSize: 30 })

  // 일자 그리드 (firstDate~lastDate를 12등분)
  let dateXs: number[] | null = null
  if (calib.firstDate && calib.lastDate) {
    const dg = (calib.lastDate.x - calib.firstDate.x) / 11
    dateXs = Array.from({ length: 12 }, (_, i) => calib.firstDate!.x + dg * i)
  }
  const dateY = calib.firstDate?.y

  // 점검자 그리드 (firstInspector~lastInspector를 12등분)
  let inspXs: number[] | null = null
  if (calib.firstInspector && calib.lastInspector) {
    const ig = (calib.lastInspector.x - calib.firstInspector.x) / 11
    inspXs = Array.from({ length: 12 }, (_, i) => calib.firstInspector!.x + ig * i)
  }
  const inspY = calib.firstInspector?.y

  // 해당 월에 데이터가 하나라도 있으면 → 모든 항목에 ○ (엑셀 생성 로직과 동일)
  const activeMonths = new Set<number>()
  for (const cp of data) {
    const months = cp.months ?? {}
    for (let m = 1; m <= 12; m++) {
      if (months[m] || months[String(m)]) activeMonths.add(m)
    }
  }

  for (const m of activeMonths) {
    if (m - 1 >= monthXs.length) continue
    for (let r = 0; r < itemYs.length; r++) {
      items.push({ x: monthXs[m - 1], y: itemYs[r], text: '○', fontSize: 11, fontWeight: 900 })
    }
  }

  // 일자 표시 (첫번째 데이터에서 월별 day 추출)
  if (dateXs && dateY != null) {
    for (const cp of data) {
      const months = cp.months ?? {}
      for (let m = 1; m <= 12; m++) {
        const cell = months[m] ?? months[String(m)]
        if (cell?.day && dateXs[m - 1] != null) {
          items.push({ x: dateXs[m - 1], y: dateY, text: String(cell.day), fontSize: 8, fontWeight: 900 })
        }
      }
      break // 일자는 첫 항목에서만
    }
  }

  // 점검자 표시
  if (inspXs && inspY != null) {
    for (const cp of data) {
      const months = cp.months ?? {}
      for (let m = 1; m <= 12; m++) {
        const cell = months[m] ?? months[String(m)]
        if (cell?.inspector && inspXs[m - 1] != null) {
          items.push({ x: inspXs[m - 1], y: inspY, text: cell.inspector, fontSize: 8, fontWeight: 900 })
        }
      }
      break
    }
  }

  return items
}

// ── 소방펌프 (캘리브레이션 기반) ─────────────────────────────
function buildPumpOverlay(data: any[], year?: number, month?: number): OI[] {
  const items: OI[] = []
  const calib = loadCalib('소방펌프')
  if (year) items.push({ x: calib?.yearPos?.x ?? 20.60, y: calib?.yearPos?.y ?? 14.20, text: String(year), fontSize: 30 })
  if (month) items.push({ x: 28.79, y: 13.59, text: String(month), fontSize: 30 })
  const hasData = data.some(cp => Object.keys(cp.months ?? {}).length > 0)
  if (!hasData) return items
  if (calib) {
    const { itemYs, monthXs } = calcGrid(calib, 10, 2)
    for (let i = 0; i < 10; i++) {
      items.push({ x: monthXs[0], y: itemYs[i], text: '○', fontSize: 11, fontWeight: 900 })
      items.push({ x: monthXs[1], y: itemYs[i], text: '○', fontSize: 11, fontWeight: 900 })
    }
  } else {
    const rows = [30.44, 35.19, 40.02, 44.86, 49.70, 54.53, 59.37, 64.21, 69.04, 73.88]
    for (let i = 0; i < 10; i++) {
      items.push({ x: 44.83, y: rows[i], text: '○', fontSize: 11, fontWeight: 900 })
      items.push({ x: 89.46, y: rows[i], text: '○', fontSize: 11, fontWeight: 900 })
    }
  }
  return items
}

function buildOverlay(rt: ReportType, data: any[], year?: number, month?: number): OI[] {
  if (rt === 'div-early' || rt === 'div-late') return buildDivOverlay(data, year)
  if (rt === '소방펌프') return buildPumpOverlay(data, year, month)
  if (REPORT_GRID[rt]) return buildCheckOverlay(data, rt, year)
  return []
}

// ── Main ────────────────────────────────────────────────────
export function ExcelPreview({ reportType, year, month }: ExcelPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [imgRect, setImgRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  // 캘리브레이션
  const [calibMode, setCalibMode] = useState(false)
  const [calibStep, setCalibStep] = useState(0)
  const [calibPoints, setCalibPoints] = useState<{ x: number; y: number }[]>([])
  const [activePoint, setActivePoint] = useState<{ x: number; y: number } | null>(null) // 드래그 중 포인트
  const isDragging = useRef(false)

  const path = fetchKey(reportType, year)
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['report-preview', reportType, year, month],
    queryFn: () => api.get<any[]>(path),
    enabled: !!reportType,
    staleTime: 5 * 60 * 1000,
  })

  const overlay = reportType && data && data.length > 0 && !calibMode ? buildOverlay(reportType, data, year, month) : []
  const previewSrc = reportType ? PREVIEW_IMAGES[reportType] : null
  const hasCalib = reportType ? !!loadCalib(reportType) : false
  const isDivType = reportType === 'div-early' || reportType === 'div-late'

  const measure = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return
    const img = imgRef.current, cont = containerRef.current
    const ib = img.getBoundingClientRect(), cb = cont.getBoundingClientRect()
    const nw = img.naturalWidth || 2339, nh = img.naturalHeight || 1654
    const dw = img.clientWidth, dh = img.clientHeight
    const s = Math.min(dw / nw, dh / nh)
    const rw = nw * s, rh = nh * s
    setImgRect({ left: (ib.left - cb.left) + (dw - rw) / 2, top: (ib.top - cb.top) + (dh - rh) / 2, width: rw, height: rh })
  }, [])

  useEffect(() => {
    measure()
    const obs = new ResizeObserver(() => measure())
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [measure, previewSrc])

  // 터치/마우스 → 이미지 % 좌표 변환
  const clientToImgPct = useCallback((clientX: number, clientY: number, fingerOffset = 0) => {
    if (!imgRect) return null
    const cont = containerRef.current
    if (!cont) return null
    const cb = cont.getBoundingClientRect()
    const x = ((clientX - cb.left - imgRect.left) / imgRect.width) * 100
    const y = (((clientY - fingerOffset) - cb.top - imgRect.top) / imgRect.height) * 100
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }, [imgRect])

  // 캘리브레이션 터치 핸들러
  const onCalibTouchStart = useCallback((e: React.TouchEvent) => {
    if (!calibMode || e.touches.length !== 1) return
    e.preventDefault()
    isDragging.current = true
    const t = e.touches[0]
    const pt = clientToImgPct(t.clientX, t.clientY, FINGER_OFFSET)
    if (pt) setActivePoint(pt)
  }, [calibMode, clientToImgPct])

  const onCalibTouchMove = useCallback((e: React.TouchEvent) => {
    if (!calibMode || !isDragging.current || e.touches.length !== 1) return
    e.preventDefault()
    const t = e.touches[0]
    const pt = clientToImgPct(t.clientX, t.clientY, FINGER_OFFSET)
    if (pt) setActivePoint(pt)
  }, [calibMode, clientToImgPct])

  const onCalibTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!calibMode || !isDragging.current) return
    e.preventDefault()
    isDragging.current = false
    // 터치 떼면 activePoint 유지 — "확인" 버튼으로 확정
  }, [calibMode])

  // 포인트 확정 또는 스킵 → 다음 단계
  const advanceStep = useCallback((point: { x: number; y: number } | null) => {
    const newPoints = [...calibPoints, point]
    setCalibPoints(newPoints)
    setActivePoint(null)

    if (calibStep + 1 >= CALIB_STEPS.length) {
      // 저장
      if (reportType) {
        const cd: CalibData = {
          firstCell: newPoints[0]!,
          lastCell: newPoints[1]!,
          yearPos: newPoints[2] ?? undefined,
          monthPos: newPoints[3] ?? undefined,
          locPos: newPoints[4] ?? undefined,
          firstDate: newPoints[5] ?? undefined,
          lastDate: newPoints[6] ?? undefined,
          firstInspector: newPoints[7] ?? undefined,
          lastInspector: newPoints[8] ?? undefined,
        }
        saveCalib(reportType, cd)
      }
      setTimeout(() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]) }, 800)
    } else {
      setCalibStep(calibStep + 1)
    }
  }, [calibPoints, calibStep, reportType])

  const confirmPoint = useCallback(() => {
    if (!activePoint) return
    advanceStep(activePoint)
  }, [activePoint, advanceStep])

  const skipPoint = useCallback(() => {
    advanceStep(null)
  }, [advanceStep])

  // 마우스 클릭 (PC) — 클릭으로 위치 지정, 확인 버튼으로 확정
  const onCalibClick = useCallback((e: React.MouseEvent) => {
    if (!calibMode) return
    const pt = clientToImgPct(e.clientX, e.clientY, 0)
    if (pt) setActivePoint(pt)
  }, [calibMode, clientToImgPct])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', background: 'var(--bg)',
        position: 'relative',
      }}
    >
      {!reportType && (
        <span style={{ fontSize: 14, color: 'var(--t2)' }}>좌측에서 점검일지를 선택하세요.</span>
      )}

      {reportType && previewSrc && (
        <>
          <img
            ref={imgRef}
            src={previewSrc}
            alt=""
            onLoad={measure}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              borderRadius: 4, background: '#fff',
            }}
          />

          {/* 오버레이 + 캘리브레이션 영역 */}
          {imgRect && imgRect.width > 0 && (
            <div
              onClick={calibMode ? onCalibClick : undefined}
              onTouchStart={calibMode ? onCalibTouchStart : undefined}
              onTouchMove={calibMode ? onCalibTouchMove : undefined}
              onTouchEnd={calibMode ? onCalibTouchEnd : undefined}
              style={{
                position: 'absolute',
                left: imgRect.left, top: imgRect.top,
                width: imgRect.width, height: imgRect.height,
                pointerEvents: calibMode ? 'auto' : 'none',
                cursor: calibMode ? 'crosshair' : 'default',
                touchAction: calibMode ? 'none' : 'auto',
              }}
            >
              {/* 데이터 오버레이 */}
              {!calibMode && overlay.map((item, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`, top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: item.fontSize ?? 10,
                    color: item.color ?? '#1a1a1a',
                    fontWeight: item.fontWeight ?? 700,
                    whiteSpace: 'nowrap', lineHeight: 1,
                    fontFamily: "'Noto Sans KR', sans-serif",
                  }}
                >
                  {item.text}
                </span>
              ))}

              {/* 확정된 캘리브레이션 마커 */}
              {calibMode && calibPoints.map((pt, i) => (
                pt && <CalibMarker key={i} x={pt.x} y={pt.y} color={CALIB_STEPS[i].color} label={`${i + 1}`} />
              ))}

              {/* 드래그 중 마커 */}
              {calibMode && activePoint && (
                <CalibMarker x={activePoint.x} y={activePoint.y} color={CALIB_STEPS[calibStep].color} label={`${calibStep + 1}`} active />
              )}
            </div>
          )}

          {/* 캘리브레이션 안내 바 */}
          {calibMode && (
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.9)', color: '#fff',
              padding: '10px 20px', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 16, zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: CALIB_STEPS[calibStep].color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>{calibStep + 1}</span>
              <span>{CALIB_STEPS[calibStep].label}</span>
              <span style={{ fontSize: 11, color: '#aaa' }}>{activePoint ? '위치를 확인하세요' : '터치 후 드래그'}</span>
              {activePoint && (
                <button onClick={confirmPoint} style={{
                  background: '#22c55e', border: 'none', color: '#fff',
                  padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                }}>확인</button>
              )}
              {CALIB_STEPS[calibStep].skip && !activePoint && (
                <button onClick={skipPoint} style={{
                  background: 'rgba(255,255,255,0.3)', border: 'none', color: '#fff',
                  padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                }}>스킵</button>
              )}
              <button onClick={() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
              }}>취소</button>
            </div>
          )}

          {/* 위치 설정 버튼 */}
          {!calibMode && !isDivType && (
            <button
              onClick={() => { setCalibMode(true); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }}
              style={{
                position: 'absolute', bottom: 12, right: 12,
                background: hasCalib ? 'rgba(0,0,0,0.6)' : 'rgba(239,68,68,0.9)',
                color: '#fff', border: 'none',
                padding: '8px 16px', borderRadius: 8,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', zIndex: 10,
              }}
            >
              {hasCalib ? '위치 재설정' : '⚠ 위치 설정'}
            </button>
          )}

          {isLoading && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.7)', borderRadius: 4,
            }}>
              <span style={{ fontSize: 12, color: '#666' }}>데이터 로딩 중...</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── 캘리브레이션 마커 ───────────────────────────────────────
function CalibMarker({ x, y, color, label, active }: { x: number; y: number; color: string; label: string; active?: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`, top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}>
      {/* 십자선 */}
      <div style={{
        position: 'absolute', left: -20, top: 0,
        width: 40, height: 2, background: color, opacity: 0.8,
      }} />
      <div style={{
        position: 'absolute', top: -20, left: 0,
        width: 2, height: 40, background: color, opacity: 0.8,
      }} />
      {/* 중심점 */}
      <div style={{
        width: active ? 20 : 16, height: active ? 20 : 16,
        borderRadius: '50%',
        background: color,
        border: `2px solid #fff`,
        boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 900, color: '#fff',
        transform: 'translate(-50%, -50%)',
        position: 'absolute', left: 0, top: 0,
      }}>
        {label}
      </div>
    </div>
  )
}
