// ── 일일업무일지 페이지 ────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { dailyReportApi } from '../utils/api'
import { buildDailyReportData } from '../utils/dailyReportCalc'
import { generateDailyExcel } from '../utils/generateExcel'
import { useStaffList } from '../hooks/useStaffList'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { ChevronLeft, ChevronRight, Download, AlertTriangle } from 'lucide-react'

// ── 날짜 유틸 ──────────────────────────────────────────────
function todayKST(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

function nowKSTHour(): number {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  return d.getHours()
}

// ── 컴포넌트 ──────────────────────────────────────────────
export default function DailyReportPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isDesktop = useIsDesktop()
  const { data: staffList } = useStaffList()
  const staffData = staffList?.map(s => ({ id: s.id, name: s.name, title: s.title ?? '' }))

  const [date, setDate] = useState<string>(todayKST())
  const [todayText, setTodayText] = useState<string>('')
  const [tomorrowText, setTomorrowText] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [genMonthly, setGenMonthly] = useState(false)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [loaded, setLoaded] = useState<string>('')

  const today = todayKST()
  const [mm, dd] = [date.split('-')[1], date.split('-')[2]]
  const isFutureDate = date > today
  const canForward = date < today

  // 디바운스 타이머
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // ── 데이터 패칭 ────────────────────────────────────────
  const queryData = useQuery({
    queryKey: ['daily-report', date],
    queryFn: () => dailyReportApi.getData(date),
    retry: 1,
  })

  const queryNotes = useQuery({
    queryKey: ['daily-notes', date],
    queryFn: () => dailyReportApi.getNotes(date),
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })

  // ── 자동 생성 데이터 ──────────────────────────────────
  const autoData = useCallback(() => {
    if (!queryData.data) return null
    try { return buildDailyReportData(date, queryData.data, '', staffData) }
    catch { return null }
  }, [date, queryData.data, staffData])

  const auto = autoData()

  // ── D1에서 로드 또는 자동 생성으로 초기화 (날짜 변경 시에만) ──
  const prevDateRef = useRef<string>('')
  useEffect(() => {
    if (!auto || queryNotes.isFetching) return
    // 날짜가 바뀔 때만 D1에서 로드 (같은 날짜에서 저장 후 refetch 시에는 무시)
    if (prevDateRef.current === date && loaded === date) return
    prevDateRef.current = date
    const saved = queryNotes.data as any
    const isAutoSaved = saved && Number(saved.is_auto) === 1
    if (saved && !isAutoSaved && (saved.today_text || saved.tomorrow_text || saved.content)) {
      // D1에 사용자 편집 내용 있으면 복원
      setTodayText(saved.today_text ?? auto.todayText)
      setTomorrowText(saved.tomorrow_text ?? auto.tomorrowText)
      setNotes(saved.content ?? '')
    } else if (isAutoSaved) {
      // 자동 저장본은 항상 최신 자동 생성 내용으로 갱신
      setTodayText(auto.todayText)
      setTomorrowText(auto.tomorrowText)
      setNotes(auto.notes ?? '')
      dailyReportApi.saveNotes({
        date, today_text: auto.todayText, tomorrow_text: auto.tomorrowText, content: auto.notes ?? '', is_auto: 1,
      }).catch(() => {})
    } else {
      // D1 비어있음 — 자동 생성 내용 표시
      setTodayText(auto.todayText)
      setTomorrowText(auto.tomorrowText)
      setNotes(auto.notes ?? '')

      // Lazy auto-save: 과거 날짜이거나 오늘 17:00 이후이면 자동 저장
      const isPast = date < today
      const isAfter17 = date === today && nowKSTHour() >= 17
      if (isPast || isAfter17) {
        dailyReportApi.saveNotes({
          date, today_text: auto.todayText, tomorrow_text: auto.tomorrowText, content: auto.notes ?? '', is_auto: 1,
        }).catch(() => {})
      }
    }
    setLoaded(date)
  }, [date, auto?.date, queryNotes.data])

  // ── 필드별 D1 저장 (디바운스 2초) ─────────────────────
  const debouncedSave = useCallback((field: string, value: string) => {
    if (loaded !== date) return
    if (debounceRef.current[field]) clearTimeout(debounceRef.current[field])
    debounceRef.current[field] = setTimeout(() => {
      const payload: any = { date }
      if (field === 'today') payload.today_text = value
      else if (field === 'tomorrow') payload.tomorrow_text = value
      else payload.content = value
      dailyReportApi.saveNotes(payload).then(() => {
        queryClient.invalidateQueries({ queryKey: ['daily-notes', date] })
      }).catch(() => {})
    }, 2000)
  }, [date, loaded])

  const handleTodayChange = (v: string) => { setTodayText(v); debouncedSave('today', v) }
  const handleTomorrowChange = (v: string) => { setTomorrowText(v); debouncedSave('tomorrow', v) }
  const handleNotesChange = (v: string) => { setNotes(v); debouncedSave('notes', v) }

  // ── 수동 저장 ─────────────────────────────────────────
  const handleManualSave = async (field: string) => {
    setSaving(s => ({ ...s, [field]: true }))
    try {
      const payload: any = { date }
      if (field === 'today') payload.today_text = todayText
      else if (field === 'tomorrow') payload.tomorrow_text = tomorrowText
      else payload.content = notes
      await dailyReportApi.saveNotes(payload)
      queryClient.invalidateQueries({ queryKey: ['daily-notes', date] })
      toast.success('저장되었습니다')
    } catch { toast.error('저장 실패') }
    finally { setSaving(s => ({ ...s, [field]: false })) }
  }

  // ── 초기화 (자동 생성 내용으로 되돌리기) ──────────────
  const handleReset = async (field: string) => {
    if (!auto) return
    if (field === 'today') { setTodayText(auto.todayText); debouncedSave('today', auto.todayText) }
    else if (field === 'tomorrow') { setTomorrowText(auto.tomorrowText); debouncedSave('tomorrow', auto.tomorrowText) }
    else { setNotes(''); debouncedSave('notes', '') }
    toast.success('초기화되었습니다')
  }

  // ── 날짜 네비게이션 ────────────────────────────────────
  const goBack = () => setDate(d => addDays(d, -1))
  const goForward = () => { if (canForward) setDate(d => addDays(d, 1)) }

  // ── 일별 다운로드 ─────────────────────────────────────
  const handleDailyDownload = async () => {
    if (generating) return
    setGenerating(true)
    try {
      // 다운로드 전 현재 내용 D1 저장
      await dailyReportApi.saveNotes({ date, today_text: todayText, tomorrow_text: tomorrowText, content: notes })
      if (!auto) throw new Error('데이터 없음')
      const data = { ...auto, todayText, tomorrowText, notes }
      const [y, m, d] = date.split('-').map(Number)
      await generateDailyExcel('daily', y, m, { [d]: data }, d)
    } catch { toast.error('엑셀 생성 중 오류가 발생했습니다') }
    finally { setGenerating(false) }
  }

  // ── 월별 다운로드 ─────────────────────────────────────
  const handleMonthlyDownload = async () => {
    if (genMonthly) return
    setGenMonthly(true)
    try {
      const [y, m] = date.split('-').map(Number)
      const todayD = today.split('-').map(Number)
      const limitDay = (y === todayD[0] && m === todayD[1]) ? todayD[2] : new Date(y, m, 0).getDate()

      // 월별 저장된 내용 조회
      const monthNotes = await dailyReportApi.getMonthNotes(y, m)
      const savedMap: Record<number, any> = {}
      for (const row of (monthNotes ?? [])) {
        const day = Number(row.date.split('-')[2])
        savedMap[day] = row
      }

      const dayDataMap: Record<number, any> = {}
      for (let day = 1; day <= limitDay; day++) {
        const dayStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const saved = savedMap[day]

        if (saved && (saved.today_text || saved.tomorrow_text)) {
          // D1에 저장된 내용 사용
          try {
            const apiData = await dailyReportApi.getData(dayStr)
            const autoGen = buildDailyReportData(dayStr, apiData, '', staffData)
            dayDataMap[day] = {
              ...autoGen,
              todayText: saved.today_text ?? autoGen.todayText,
              tomorrowText: saved.tomorrow_text ?? autoGen.tomorrowText,
              notes: saved.content ?? '',
            }
          } catch {
            dayDataMap[day] = buildDailyReportData(dayStr, { schedules: [], leaves: [], elevatorFaults: [] }, '', staffData)
          }
        } else {
          // D1 비어있음 → 자동 생성 + lazy save
          try {
            const apiData = await dailyReportApi.getData(dayStr)
            const autoGen = buildDailyReportData(dayStr, apiData, '', staffData)
            dayDataMap[day] = autoGen
            // lazy save
            await dailyReportApi.saveNotes({
              date: dayStr, today_text: autoGen.todayText, tomorrow_text: autoGen.tomorrowText, content: autoGen.notes ?? '', is_auto: 1,
            }).catch(() => {})
          } catch {
            dayDataMap[day] = buildDailyReportData(dayStr, { schedules: [], leaves: [], elevatorFaults: [] }, '', staffData)
          }
        }
      }
      await generateDailyExcel('monthly', y, m, dayDataMap, limitDay)
    } catch { toast.error('월별 엑셀 생성 중 오류가 발생했습니다') }
    finally { setGenMonthly(false) }
  }

  // ── 인원현황 데이터 ────────────────────────────────────
  const preview = auto

  // ── 공통 본문 컨텐츠 ──────────────────────────────────
  const formContent = (
    <>
      {/* 금일업무 카드 */}
      <EditableCard
        label="금일업무" field="today"
        value={todayText} onChange={handleTodayChange}
        onSave={handleManualSave} onReset={handleReset}
        saving={saving['today']} rows={10}
      />

      {/* 명일업무 카드 */}
      <EditableCard
        label="명일업무" field="tomorrow"
        value={tomorrowText} onChange={handleTomorrowChange}
        onSave={handleManualSave} onReset={handleReset}
        saving={saving['tomorrow']} rows={5}
      />

      {/* 특이사항 카드 */}
      <EditableCard
        label="특이사항" field="notes"
        value={notes} onChange={handleNotesChange}
        onSave={handleManualSave} onReset={handleReset}
        saving={saving['notes']} rows={4}
        placeholder="오늘 특이사항을 입력하세요"
      />

      {/* 인원현황 요약 */}
      <div className="summary-card">
        <div className="summary-card-label">인원현황</div>
        {queryData.isLoading ? (
          <div className="summary-card-skeleton" />
        ) : queryData.isError ? (
          <div className="summary-card-error">데이터 불러오기 실패 — 다시 시도해 주세요</div>
        ) : preview ? (
          <div className="summary-card-body">
            <span>총원 {preview.personnel.total}</span>
            <span className="dot-meta" />
            <span>현재원 {preview.personnel.present}</span>
            {preview.personnel.offDuty && (<>
              <span className="dot-meta" />
              <span>비번 {preview.personnel.offDuty}</span>
            </>)}
            {preview.personnel.onLeave.length > 0 && (<>
              <span className="dot-meta" />
              <span>연차 {preview.personnel.onLeave.join(', ')}</span>
            </>)}
            {preview.personnel.halfLeave.length > 0 && (<>
              <span className="dot-meta" />
              <span>반차 {preview.personnel.halfLeave.join(', ')}</span>
            </>)}
            {preview.personnel.training.length > 0 && (<>
              <span className="dot-meta" />
              <span>교육/훈련 {preview.personnel.training.join(', ')}</span>
            </>)}
            {preview.personnel.dayShift.length > 0 && (<>
              <span className="dot-meta" />
              <span>주간근무자 {preview.personnel.dayShift.join(', ')}</span>
            </>)}
            {preview.personnel.onDuty && (<>
              <span className="dot-meta" />
              <span>당직근무자 {preview.personnel.onDuty}</span>
            </>)}
          </div>
        ) : (
          <div className="summary-card-empty">해당 날짜 데이터 없음</div>
        )}
      </div>

      {/* 다운로드 버튼 */}
      <div className={isDesktop ? 'download-action download-action--desktop' : 'download-action'}>
        <button
          type="button"
          onClick={handleDailyDownload}
          disabled={generating || queryData.isLoading}
          className={`download-btn download-btn--daily${(generating || queryData.isLoading) ? ' download-btn--disabled' : ''}`}
        >
          {generating ? '생성 중...' : (
            <>
              <Download size={16} className="download-btn-icon" />
              {`${Number(mm)}월${dd}일 방재업무일지 다운로드`}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleMonthlyDownload}
          disabled={genMonthly}
          className={`download-btn download-btn--monthly${genMonthly ? ' download-btn--disabled' : ''}`}
        >
          {genMonthly ? '월별 생성 중...' : (
            <>
              <Download size={16} className="download-btn-icon" />
              {`일일업무일지(${mm}월) 다운로드`}
            </>
          )}
        </button>
      </div>

      <div className="page-footer-note">
        수정 내용은 자동 저장됩니다 <span className="dot-meta" /> 월별은 저장된 모든 날짜를 포함합니다
      </div>
    </>
  )

  // ── 날짜 네비게이터 (공통) ─────────────────────────────
  const dateNav = (
    <div className="date-nav">
      <button type="button" onClick={goBack} className="date-nav-btn" aria-label="이전 날짜">
        <ChevronLeft size={16} />
      </button>
      <span className="date-display">{date}</span>
      {canForward
        ? (
          <button type="button" onClick={goForward} className="date-nav-btn" aria-label="다음 날짜">
            <ChevronRight size={16} />
          </button>
        )
        : <span className="date-nav-spacer" />
      }
    </div>
  )

  // ── 렌더 — 데스크톱 ────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="desktop-layout">
        {/* 좌측 편집 패널 — 페이지 제목은 App.tsx 헤더에서 표시 */}
        <div className="desktop-edit-panel">
          {/* 데스크톱 날짜 네비게이터 */}
          <div className="desktop-edit-panel-header">
            {dateNav}
          </div>
          {formContent}
        </div>

        {/* 우측 A4 세로 미리보기 패널 — 높이 기준으로 A4 비율 폭 계산 */}
        <div className="desktop-portrait-wrapper">
          <div className="desktop-portrait-print-label">인쇄 미리보기</div>
          <DailyPortraitPreview
            date={date}
            todayText={todayText}
            tomorrowText={tomorrowText}
            notes={notes}
            personnel={preview?.personnel}
          />
        </div>
      </div>
    )
  }

  // ── 렌더 — 모바일 ──────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-page">
      {/* 헤더 */}
      <header className="page-header">
        <button type="button" onClick={() => navigate(-1)} className="back-btn" aria-label="뒤로 가기">
          <ChevronLeft size={15} />
        </button>
        <span className="page-title">일일 업무 일지</span>
        {dateNav}
      </header>

      {/* 스크롤 본문 */}
      <div className="page-body flex-1 overflow-y-auto">
        {formContent}
      </div>
    </div>
  )
}

// ── 캘리브레이션 설정 ─────────────────────────────────────
const DAILY_CALIB_STEPS = [
  { key: 'date',        label: '????년 ??월 ??일', color: '#3b82f6' },
  { key: 'today',       label: '금일업무',         color: '#22c55e' },
  { key: 'tomorrow',    label: '명일업무',         color: '#10b981' },
  { key: 'notes',       label: '특이사항',         color: '#06b6d4' },
  { key: 'pTotal',      label: '총원',             color: '#f59e0b' },
  { key: 'pPresent',    label: '현재원',           color: '#d97706' },
  { key: 'pDuty',       label: '당직',             color: '#ef4444' },
  { key: 'pOff',        label: '비번',             color: '#a855f7' },
  { key: 'pRest',       label: '휴무',             color: '#7c3aed' },
  { key: 'pLeave',      label: '연차',             color: '#ec4899' },
  { key: 'pHalf',       label: '반차',             color: '#f43f5e' },
  { key: 'pTraining',   label: '교육/훈련',        color: '#14b8a6' },
  { key: 'pAbsent',     label: '결원',             color: '#64748b' },
  { key: 'dayWorker',   label: '주간근무자',       color: '#eab308' },
  { key: 'dutyWorker',  label: '당직근무자',       color: '#e11d48' },
]

const DAILY_CALIB_KEY = 'calib_daily_report'
const FINGER_OFFSET = 60

interface DailyCalibData {
  [key: string]: { x: number; y: number }
}

function loadDailyCalib(): DailyCalibData | null {
  try { return JSON.parse(localStorage.getItem(DAILY_CALIB_KEY) ?? 'null') } catch { return null }
}
function saveDailyCalib(data: DailyCalibData) {
  localStorage.setItem(DAILY_CALIB_KEY, JSON.stringify(data))
}

// ── 템플릿 이미지 오버레이 미리보기 ─────────────────────────
function DailyPortraitPreview({ date, todayText, tomorrowText, notes, personnel }: {
  date: string
  todayText: string
  tomorrowText: string
  notes: string
  personnel?: {
    total: number
    present: number
    offDuty: string
    onLeave: string[]
    halfLeave: string[]
    training: string[]
    holiday: string[]
    dayShift: string[]
    onDuty: string
  }
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [imgRect, setImgRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  // 캘리브레이션 상태
  const [calibMode, setCalibMode] = useState(false)
  const [calibStep, setCalibStep] = useState(0)
  const [calibPoints, setCalibPoints] = useState<({ x: number; y: number } | null)[]>([])
  const [activePoint, setActivePoint] = useState<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)

  const measure = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return
    const img = imgRef.current, cont = containerRef.current
    const ib = img.getBoundingClientRect(), cb = cont.getBoundingClientRect()
    const nw = img.naturalWidth || 1, nh = img.naturalHeight || 1
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
  }, [measure])

  const calib = loadDailyCalib()
  const hasCalib = !!calib

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
  }, [calibMode])

  // 포인트 확정 → 다음 단계
  const advanceStep = useCallback((point: { x: number; y: number } | null) => {
    const newPoints = [...calibPoints, point]
    setCalibPoints(newPoints)
    setActivePoint(null)

    if (calibStep + 1 >= DAILY_CALIB_STEPS.length) {
      // 모든 스텝 완료 → 저장
      const data: DailyCalibData = {}
      newPoints.forEach((pt, i) => {
        if (pt) data[DAILY_CALIB_STEPS[i].key] = pt
      })
      saveDailyCalib(data)
      setTimeout(() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]) }, 500)
    } else {
      setCalibStep(calibStep + 1)
    }
  }, [calibPoints, calibStep])

  const confirmPoint = useCallback(() => {
    if (!activePoint) return
    advanceStep(activePoint)
  }, [activePoint, advanceStep])

  // 마우스 클릭 (PC)
  const onCalibClick = useCallback((e: React.MouseEvent) => {
    if (!calibMode) return
    const pt = clientToImgPct(e.clientX, e.clientY, 0)
    if (pt) setActivePoint(pt)
  }, [calibMode, clientToImgPct])

  // ── 오버레이 데이터 ──
  const [y, m, d] = date.split('-')
  const dateLabel = `${y}년 ${Number(m)}월 ${Number(d)}일`

  const textStyle = (fontSize = 7): React.CSSProperties => ({
    fontSize, color: '#111', fontWeight: 400,
    whiteSpace: 'pre-wrap', lineHeight: 1.6,
    fontFamily: "'Noto Sans KR', sans-serif",
    overflow: 'hidden',
  })

  // 포인트 기반 오버레이 항목
  const LARGE_KEYS = new Set(['date', 'today', 'tomorrow', 'notes'])
  const overlayItems: { key: string; text: string; isArea?: boolean }[] = calib ? [
    { key: 'date', text: dateLabel },
    { key: 'today', text: todayText, isArea: true },
    { key: 'tomorrow', text: tomorrowText, isArea: true },
    { key: 'notes', text: notes, isArea: true },
    ...(personnel ? [
      { key: 'pTotal', text: String(personnel.total) },
      { key: 'pPresent', text: String(personnel.present) },
      { key: 'pDuty', text: personnel.onDuty ? '1' : '' },
      { key: 'pOff', text: personnel.offDuty || '' },
      { key: 'pRest', text: personnel.holiday.length > 0 ? String(personnel.holiday.length) : '' },
      { key: 'pLeave', text: personnel.onLeave.join(', ') },
      { key: 'pHalf', text: personnel.halfLeave.join(', ') },
      { key: 'pTraining', text: personnel.training.join(', ') },
      { key: 'pAbsent', text: '' },
      { key: 'dayWorker', text: personnel.dayShift.join(', ') },
      { key: 'dutyWorker', text: personnel.onDuty || '' },
    ] : []),
  ] : []

  return (
    <div
      ref={containerRef}
      className="daily-portrait-wrapper"
    >
      <img
        ref={imgRef}
        src="/templates/preview/daily-1.png"
        alt=""
        onLoad={measure}
        className="daily-portrait-image"
      />

      {/* 오버레이 + 캘리브레이션 영역 */}
      {imgRect && imgRect.width > 0 && (
        <div
          className={`daily-portrait-overlay-area ${calibMode ? 'daily-portrait-overlay-area--calib' : ''}`}
          onClick={calibMode ? onCalibClick : undefined}
          onTouchStart={calibMode ? onCalibTouchStart : undefined}
          onTouchMove={calibMode ? onCalibTouchMove : undefined}
          onTouchEnd={calibMode ? onCalibTouchEnd : undefined}
          style={{
            left: imgRect.left, top: imgRect.top,
            width: imgRect.width, height: imgRect.height,
          }}
        >
          {/* 데이터 오버레이 (캘리브레이션 완료 후) */}
          {!calibMode && calib && overlayItems.map(item => {
            const pt = calib[item.key]
            if (!pt || !item.text) return null
            const isLarge = LARGE_KEYS.has(item.key)
            if (item.isArea) {
              return (
                <div key={item.key} style={{
                  position: 'absolute',
                  left: `${pt.x}%`, top: `${pt.y}%`,
                  width: '75%',
                  ...textStyle(10), fontWeight: 700,
                }}>
                  {item.text}
                </div>
              )
            }
            return (
              <span key={item.key} style={{
                position: 'absolute',
                left: `${pt.x}%`, top: `${pt.y}%`,
                transform: 'translate(-50%,-50%)',
                ...textStyle(isLarge ? 12 : 10), fontWeight: 700, textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {item.text}
              </span>
            )
          })}

          {/* 확정된 캘리브레이션 마커 */}
          {calibMode && calibPoints.map((pt, i) => (
            pt && <DailyCalibMarker key={i} x={pt.x} y={pt.y} color={DAILY_CALIB_STEPS[i].color} label={`${i + 1}`} />
          ))}

          {/* 드래그 중 마커 */}
          {calibMode && activePoint && (
            <DailyCalibMarker x={activePoint.x} y={activePoint.y} color={DAILY_CALIB_STEPS[calibStep].color} label={`${calibStep + 1}`} active />
          )}
        </div>
      )}

      {/* 캘리브레이션 안내 바 */}
      {calibMode && (
        <div className="daily-portrait-calib-bar">
          <span
            className="daily-portrait-calib-bar-step"
            style={{ background: DAILY_CALIB_STEPS[calibStep].color }}
          >{calibStep + 1}</span>
          <span className="daily-portrait-calib-bar-label">{DAILY_CALIB_STEPS[calibStep].label}</span>
          <span className="daily-portrait-calib-bar-coord">
            {activePoint ? `(${activePoint.x.toFixed(1)}, ${activePoint.y.toFixed(1)})` : '터치/클릭'}
          </span>
          {activePoint && (
            <button type="button" onClick={confirmPoint} className="daily-portrait-calib-confirm">확인</button>
          )}
          <button
            type="button"
            onClick={() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }}
            className="daily-portrait-calib-cancel"
          >취소</button>
        </div>
      )}

      {/* 위치 설정 버튼 */}
      {!calibMode && (
        <button
          type="button"
          onClick={() => { setCalibMode(true); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }}
          className={`daily-portrait-setup-btn ${hasCalib ? 'daily-portrait-setup-btn--ready' : 'daily-portrait-setup-btn--missing'}`}
        >
          {hasCalib ? '위치 재설정' : (<><AlertTriangle size={14} /> 위치 설정</>)}
        </button>
      )}
    </div>
  )
}

// ── 캘리브레이션 마커 ───────────────────────────────────────
function DailyCalibMarker({ x, y, color, label, active }: { x: number; y: number; color: string; label: string; active?: boolean }) {
  return (
    <div className="daily-portrait-calib-marker" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="daily-portrait-calib-marker-crosshair-h" style={{ background: color }} />
      <div className="daily-portrait-calib-marker-crosshair-v" style={{ background: color }} />
      <div
        className={`daily-portrait-calib-marker-dot ${active ? 'daily-portrait-calib-marker-dot--active' : ''}`}
        style={{ background: color }}
      >
        {label}
      </div>
    </div>
  )
}

// ── 편집 가능 카드 컴포넌트 ─────────────────────────────
function EditableCard({ label, field, value, onChange, onSave, onReset, saving, rows, placeholder }: {
  label: string; field: string; value: string
  onChange: (v: string) => void; onSave: (f: string) => void; onReset: (f: string) => void
  saving?: boolean; rows: number; placeholder?: string
}) {
  return (
    <div className="editable-card">
      <div className="editable-card-head">
        <div className="editable-card-label">{label}</div>
        <div className="editable-card-actions">
          <button type="button" onClick={() => onReset(field)} className="editable-card-btn--reset">
            초기화
          </button>
          <button type="button" onClick={() => onSave(field)} disabled={saving} className="editable-card-btn--save">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? `${label} 내용이 자동 생성됩니다`}
        className="editable-card-textarea"
        rows={rows}
      />
    </div>
  )
}
