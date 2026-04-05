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

// ── 스타일 상수 ────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
  background: 'var(--bg3)', border: '1px solid var(--bd)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const navBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: '1px solid var(--bd)',
  background: 'var(--bg3)', color: 'var(--t1)', fontSize: 16, fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: '1',
}

const card: React.CSSProperties = {
  background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--bd)',
  padding: 14, marginBottom: 10,
}

const textareaStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 9,
  color: 'var(--t1)', fontSize: 12, fontFamily: 'inherit', fontWeight: 400,
  padding: '10px 12px', resize: 'vertical', outline: 'none', lineHeight: 1.6,
}

const smallBtn: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
  border: '1px solid var(--bd)', cursor: 'pointer',
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
    if (saved && (saved.today_text || saved.tomorrow_text || saved.content)) {
      // D1에 저장된 내용 있으면 복원
      setTodayText(saved.today_text ?? auto.todayText)
      setTomorrowText(saved.tomorrow_text ?? auto.tomorrowText)
      setNotes(saved.content ?? '')
    } else {
      // D1 비어있음 — 자동 생성 내용 표시
      setTodayText(auto.todayText)
      setTomorrowText(auto.tomorrowText)
      setNotes('')

      // Lazy auto-save: 과거 날짜이거나 오늘 17:00 이후이면 자동 저장
      const isPast = date < today
      const isAfter17 = date === today && nowKSTHour() >= 17
      if (isPast || isAfter17) {
        dailyReportApi.saveNotes({
          date, today_text: auto.todayText, tomorrow_text: auto.tomorrowText, content: '', is_auto: 1,
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
              date: dayStr, today_text: autoGen.todayText, tomorrow_text: autoGen.tomorrowText, content: '', is_auto: 1,
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
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>인원현황</div>
        {queryData.isLoading ? (
          <div style={{ background: 'var(--bg4)', borderRadius: 4, height: 12, width: '70%', animation: 'blink 2s ease-in-out infinite' }}/>
        ) : queryData.isError ? (
          <div style={{ fontSize: 11, color: 'var(--danger)' }}>데이터 불러오기 실패 — 다시 시도해 주세요</div>
        ) : preview ? (
          <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6 }}>
            총원 {preview.personnel.total} · 현재원 {preview.personnel.present}
            {preview.personnel.offDuty ? ` · 비번 ${preview.personnel.offDuty}` : ''}
            {preview.personnel.onLeave.length > 0 ? ` · 연차 ${preview.personnel.onLeave.join(', ')}` : ''}
            {preview.personnel.halfLeave.length > 0 ? ` · 반차 ${preview.personnel.halfLeave.join(', ')}` : ''}
            {preview.personnel.training.length > 0 ? ` · 교육/훈련 ${preview.personnel.training.join(', ')}` : ''}
            {preview.personnel.dayShift.length > 0 ? ` · 주간근무자 ${preview.personnel.dayShift.join(', ')}` : ''}
            {preview.personnel.onDuty ? ` · 당직근무자 ${preview.personnel.onDuty}` : ''}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>해당 날짜 데이터 없음</div>
        )}
      </div>

      {/* 일별 다운로드 버튼 */}
      <button
        onClick={handleDailyDownload}
        disabled={generating || queryData.isLoading}
        style={{
          width: '100%', padding: 11, borderRadius: 9, border: 'none',
          background: (generating || queryData.isLoading) ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
          color: (generating || queryData.isLoading) ? 'var(--t3)' : '#fff',
          fontSize: 13, fontWeight: 700, marginBottom: 8,
          cursor: (generating || queryData.isLoading) ? 'default' : 'pointer',
        }}
      >
        {generating ? '생성 중...' : `⬇ ${Number(mm)}월${dd}일 방재업무일지 다운로드`}
      </button>

      {/* 월별 다운로드 버튼 */}
      <button
        onClick={handleMonthlyDownload}
        disabled={genMonthly}
        style={{
          width: '100%', padding: 11, borderRadius: 9, border: '1px solid var(--bd)',
          background: genMonthly ? 'var(--bg3)' : 'var(--bg2)',
          color: genMonthly ? 'var(--t3)' : 'var(--t1)',
          fontSize: 13, fontWeight: 700,
          cursor: genMonthly ? 'default' : 'pointer',
        }}
      >
        {genMonthly ? '월별 생성 중...' : `⬇ 일일업무일지(${mm}월) 다운로드`}
      </button>

      <div style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', padding: '8px 0 20px' }}>
        수정 내용은 자동 저장됩니다 · 월별은 저장된 모든 날짜를 포함합니다
      </div>
    </>
  )

  // ── 날짜 네비게이터 (공통) ─────────────────────────────
  const dateNav = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <button onClick={goBack} style={navBtn}>‹</button>
      <span style={{ width: 90, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
        {date}
      </span>
      <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>
        {canForward
          ? <button onClick={goForward} style={navBtn}>›</button>
          : <span style={{ width: 28 }}/>
        }
      </div>
    </div>
  )

  // ── 렌더 — 데스크톱 ────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
        {/* 좌측 편집 패널 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
          {/* 데스크톱 날짜 네비게이터 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>일일업무일지</span>
            {dateNav}
          </div>
          {formContent}
        </div>

        {/* 우측 A4 세로 미리보기 패널 */}
        <div style={{
          width: 400, flexShrink: 0,
          borderLeft: '1px solid var(--bd)',
          overflow: 'hidden',
          background: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 8, left: 0, right: 0,
            textAlign: 'center', fontSize: 11, color: 'var(--t2)',
            fontWeight: 700, textTransform: 'uppercase',
            pointerEvents: 'none',
          }}>
            인쇄 미리보기
          </div>
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* 헤더 */}
      <header style={{ flexShrink: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', padding: '8px 12px 9px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={iconBtn} aria-label="뒤로 가기">
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>일일업무일지</span>
        {dateNav}
      </header>

      {/* 스크롤 본문 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {formContent}
      </div>
    </div>
  )
}

// ── A4 세로 미리보기 컴포넌트 ─────────────────────────────
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
    dayShift: string[]
    onDuty: string
  }
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const A4_W = 794
  const A4_H = 1123

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

  const [y, m, d] = date.split('-')
  const dateLabel = `${y}년 ${Number(m)}월 ${Number(d)}일`

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <div
        className="excel-preview-inner"
        style={{
          width: A4_W, height: A4_H,
          background: '#ffffff',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          transformOrigin: 'center center',
          transform: `scale(${scale})`,
          overflow: 'hidden',
          position: 'relative',
          padding: 48,
          boxSizing: 'border-box',
        }}
      >
        {/* 제목 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#000', marginBottom: 4 }}>방재업무일지</div>
          <div style={{ fontSize: 13, color: '#444' }}>{dateLabel}</div>
        </div>

        {/* 구분선 */}
        <hr style={{ border: 'none', borderTop: '2px solid #000', marginBottom: 20 }} />

        {/* 인원현황 */}
        {personnel && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>인원현황</div>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
              <tbody>
                <tr>
                  <td style={PT}>총원</td>
                  <td style={PD}>{personnel.total}명</td>
                  <td style={PT}>현재원</td>
                  <td style={PD}>{personnel.present}명</td>
                  <td style={PT}>비번</td>
                  <td style={PD}>{personnel.offDuty || '—'}</td>
                </tr>
                {(personnel.onDuty) && (
                  <tr>
                    <td style={PT}>당직</td>
                    <td style={{ ...PD, colSpan: 5 } as any}>{personnel.onDuty}</td>
                  </tr>
                )}
                {personnel.dayShift.length > 0 && (
                  <tr>
                    <td style={PT}>주간</td>
                    <td style={{ ...PD, colSpan: 5 } as any}>{personnel.dayShift.join(', ')}</td>
                  </tr>
                )}
                {personnel.onLeave.length > 0 && (
                  <tr>
                    <td style={PT}>연차</td>
                    <td style={{ ...PD, colSpan: 5 } as any}>{personnel.onLeave.join(', ')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 금일업무 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>금일업무</div>
          <div style={{ fontSize: 11, color: '#222', lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: 60 }}>
            {todayText || '(내용 없음)'}
          </div>
        </div>

        {/* 명일업무 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>명일업무</div>
          <div style={{ fontSize: 11, color: '#222', lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: 40 }}>
            {tomorrowText || '(내용 없음)'}
          </div>
        </div>

        {/* 특이사항 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#000', marginBottom: 6, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>특이사항</div>
          <div style={{ fontSize: 11, color: '#222', lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: 40 }}>
            {notes || '(내용 없음)'}
          </div>
        </div>

        {/* 서명란 */}
        <div style={{ position: 'absolute', bottom: 48, left: 48, right: 48 }}>
          <hr style={{ border: 'none', borderTop: '1px solid #ccc', marginBottom: 16 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, fontSize: 11, color: '#444' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 24 }}>작성자</div>
              <div style={{ borderTop: '1px solid #999', width: 80 }}></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 24 }}>확인자</div>
              <div style={{ borderTop: '1px solid #999', width: 80 }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── A4 미리보기 셀 스타일 ──────────────────────────────────
const PT: React.CSSProperties = {
  border: '1px solid #ccc', padding: '3px 6px', fontWeight: 700,
  fontSize: 11, color: '#000', background: '#f0f0f0', whiteSpace: 'nowrap',
}
const PD: React.CSSProperties = {
  border: '1px solid #ccc', padding: '3px 6px',
  fontSize: 11, color: '#000',
}

// ── 편집 가능 카드 컴포넌트 ─────────────────────────────
function EditableCard({ label, field, value, onChange, onSave, onReset, saving, rows, placeholder }: {
  label: string; field: string; value: string
  onChange: (v: string) => void; onSave: (f: string) => void; onReset: (f: string) => void
  saving?: boolean; rows: number; placeholder?: string
}) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', flex: 1 }}>{label}</div>
        <button onClick={() => onReset(field)}
          style={{ ...smallBtn, background: 'var(--bg3)', color: 'var(--t3)', marginRight: 6 }}>
          초기화
        </button>
        <button onClick={() => onSave(field)} disabled={saving}
          style={{ ...smallBtn, background: 'var(--bg4)', color: saving ? 'var(--t3)' : 'var(--t2)' }}>
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? `${label} 내용이 자동 생성됩니다`}
        style={textareaStyle}
        rows={rows}
        onFocus={e => { e.target.style.borderColor = 'var(--bd2)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--bd)' }}
      />
    </div>
  )
}
