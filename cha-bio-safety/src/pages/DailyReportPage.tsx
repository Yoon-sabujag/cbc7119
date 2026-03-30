// ── 일일업무일지 페이지 ────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { dailyReportApi } from '../utils/api'
import { buildDailyReportData } from '../utils/dailyReportCalc'
import { generateDailyExcel } from '../utils/generateExcel'

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

function addMonths(dateStr: string, n: number): string {
  const [y, m] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1 + n, 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-01`
}

function getMonthStr(dateStr: string): string {
  const [y, m] = dateStr.split('-').map(Number)
  return `${y}년 ${String(m).padStart(2, '0')}월`
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

// ── shimmer 애니메이션 ─────────────────────────────────────
const shimmerStyle: React.CSSProperties = {
  background: 'var(--bg4)', borderRadius: 4, height: 12,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 컴포넌트 ──────────────────────────────────────────────
export default function DailyReportPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [date, setDate] = useState<string>(todayKST())
  const [mode, setMode] = useState<'daily' | 'monthly'>('daily')
  const [notes, setNotes] = useState<string>('')
  const [generating, setGenerating] = useState(false)

  const today = todayKST()
  const [todayYear, todayMonth] = today.split('-').map(Number)
  const [selYear, selMonth] = date.split('-').map(Number)

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
  })

  // 날짜 변경 시 노트 동기화
  useEffect(() => {
    if (queryNotes.data !== undefined) {
      setNotes((queryNotes.data as any)?.content ?? '')
    }
  }, [queryNotes.data, date])

  const mutationNotes = useMutation({
    mutationFn: ({ d, content }: { d: string; content: string }) =>
      dailyReportApi.saveNotes(d, content),
    onSuccess: () => {
      toast.success('특이사항이 저장되었습니다')
      queryClient.invalidateQueries({ queryKey: ['daily-notes', date] })
    },
    onError: () => {
      toast.error('저장 중 오류가 발생했습니다')
    },
  })

  // ── 날짜 네비게이션 ────────────────────────────────────
  const isFutureDate = date > today
  const isFutureMonth = selYear > todayYear || (selYear === todayYear && selMonth > todayMonth)

  const goBack = () => {
    if (mode === 'daily') setDate(d => addDays(d, -1))
    else setDate(d => addMonths(d, -1))
  }
  const goForward = () => {
    if (mode === 'daily') {
      if (!isFutureDate) setDate(d => addDays(d, 1))
    } else {
      if (!isFutureMonth) setDate(d => addMonths(d, 1))
    }
  }

  // 월별 모드에서 날짜 표시 (항상 해당 월 1일 기준)
  const displayDate = mode === 'daily' ? date : getMonthStr(date)
  const [dd, mm] = [date.split('-')[2], date.split('-')[1]]
  const canForward = mode === 'daily' ? date < today : !isFutureMonth

  // ── 미리보기 데이터 조합 ───────────────────────────────
  const reportData = useCallback(() => {
    if (!queryData.data) return null
    try {
      return buildDailyReportData(date, queryData.data, notes)
    } catch {
      return null
    }
  }, [date, queryData.data, notes])

  const preview = reportData()

  // ── 다운로드 핸들러 ────────────────────────────────────
  const handleDownload = async () => {
    if (generating) return
    setGenerating(true)
    try {
      const [y, m, d] = date.split('-').map(Number)

      if (mode === 'daily') {
        if (!queryData.data) throw new Error('데이터 없음')
        const data = buildDailyReportData(date, queryData.data, notes)
        await generateDailyExcel('daily', y, m, { [d]: data }, d)
      } else {
        // 월별: 1일~오늘까지
        const maxDay = (selYear === todayYear && selMonth === todayMonth)
          ? todayMonth === Number(today.split('-')[1]) ? Number(today.split('-')[2]) : d
          : new Date(y, m, 0).getDate()
        const today2 = today
        const todayD = Number(today2.split('-')[2])
        const limitDay = (y === todayYear && m === todayMonth) ? todayD : new Date(y, m, 0).getDate()

        const dayDataMap: Record<number, any> = {}
        for (let day = 1; day <= limitDay; day++) {
          const dayStr = `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          try {
            const data = await dailyReportApi.getData(dayStr)
            const notesRes = await dailyReportApi.getNotes(dayStr)
            const notesContent = (notesRes as any)?.content ?? ''
            dayDataMap[day] = buildDailyReportData(dayStr, data, notesContent)
          } catch {
            // 해당 날짜 데이터 없으면 빈 데이터로 패치
            dayDataMap[day] = buildDailyReportData(dayStr, { schedules: [], leaves: [], elevatorFaults: [] }, '')
          }
        }
        await generateDailyExcel('monthly', y, m, dayDataMap, limitDay)
      }
    } catch (err) {
      toast.error('엑셀 생성 중 오류가 발생했습니다')
    } finally {
      setGenerating(false)
    }
  }

  // ── 렌더 ──────────────────────────────────────────────
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

        {/* 날짜 네비게이터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={goBack} style={navBtn}>‹</button>
          <span style={{ width: mode === 'daily' ? 90 : 80, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
            {displayDate}
          </span>
          <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>
            {canForward
              ? <button onClick={goForward} style={navBtn}>›</button>
              : <span style={{ width: 28 }}/>
            }
          </div>
        </div>
      </header>

      {/* 스크롤 본문 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

        {/* 모드 토글 */}
        <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: 3, display: 'flex' }}>
            {(['daily', 'monthly'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  minWidth: 88, padding: '6px 16px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: mode === m ? 'var(--acl)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--t2)',
                }}
              >
                {m === 'daily' ? '일별' : '월별 누적'}
              </button>
            ))}
          </div>
        </div>

        {/* 특이사항 카드 */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>특이사항</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="오늘 특이사항을 입력하세요"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 9,
              color: 'var(--t1)', fontSize: 13, fontWeight: 400, padding: '10px 12px',
              minHeight: 80, resize: 'none', outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--bd2)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--bd)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={() => mutationNotes.mutate({ d: date, content: notes })}
              disabled={mutationNotes.isPending}
              style={{
                fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 7,
                background: 'var(--bg4)', border: '1px solid var(--bd)',
                color: mutationNotes.isPending ? 'var(--t3)' : 'var(--t2)',
                cursor: mutationNotes.isPending ? 'default' : 'pointer',
              }}
            >
              {mutationNotes.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 미리보기 카드 */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>일일업무일지 미리보기</div>
          {queryData.isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ ...shimmerStyle, width: '70%' }}/>
              <div style={{ ...shimmerStyle, width: '60%' }}/>
              <div style={{ ...shimmerStyle, width: '80%' }}/>
            </div>
          ) : queryData.isError ? (
            <div style={{ fontSize: 11, color: 'var(--danger)' }}>
              데이터 불러오기 실패 — 다시 시도해 주세요
            </div>
          ) : preview ? (
            <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6 }}>
              <div>
                <span style={{ color: 'var(--t3)' }}>인원현황: </span>
                총원 {preview.personnel.total} · 현재원 {preview.personnel.present}
                {preview.personnel.onDuty ? ` · 당직 ${preview.personnel.onDuty}` : ''}
                {preview.personnel.offDuty ? ` · 비번 ${preview.personnel.offDuty}` : ''}
              </div>
              <div>
                <span style={{ color: 'var(--t3)' }}>금일업무: </span>{preview.todayTasks.length}건
                <span style={{ color: 'var(--t3)' }}> · 명일업무: </span>{preview.tomorrowTasks.length}건
              </div>
              {preview.notes && (
                <div style={{ marginTop: 4, color: 'var(--t3)', fontSize: 11 }}>
                  특이사항: {preview.notes.slice(0, 40)}{preview.notes.length > 40 ? '...' : ''}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>
              해당 날짜 데이터 없음
            </div>
          )}
        </div>

        {/* 다운로드 버튼 */}
        <button
          onClick={handleDownload}
          disabled={generating || queryData.isLoading}
          style={{
            width: '100%', padding: 11, borderRadius: 9, border: 'none',
            background: (generating || queryData.isLoading) ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
            color: (generating || queryData.isLoading) ? 'var(--t3)' : '#fff',
            fontSize: 13, fontWeight: 700,
            cursor: (generating || queryData.isLoading) ? 'default' : 'pointer',
          }}
        >
          {generating
            ? '생성 중...'
            : mode === 'daily'
              ? `⬇ 방재업무일지(${dd}일) 다운로드`
              : `⬇ 일일업무일지(${mm}월) 다운로드`
          }
        </button>

        {/* 안내 문구 */}
        <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center', padding: '8px 0 20px' }}>
          {mode === 'daily' ? '다운로드 후 엑셀에서 인쇄하세요' : '오늘까지의 날짜만 시트가 생성됩니다'}
        </div>
      </div>
    </div>
  )
}
