// ── 업무수행기록표 페이지 ──────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { workLogApi } from '../utils/api'
import { generateWorkLogExcel } from '../utils/generateExcel'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'
import type { WorkLogPayload } from '../types'

// ── 월 유틸 ────────────────────────────────────────────────
function thisMonthKST(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number)
  const dt = new Date(y, m - 1 + n, 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

// ── 스타일 상수 (DailyReportPage 미러링) ──────────────────
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

const skeletonStyle: React.CSSProperties = {
  background: 'var(--bg4)', borderRadius: 4, height: 12, width: '70%',
  animation: 'blink 2s ease-in-out infinite',
}

// ── 컴포넌트 ──────────────────────────────────────────────
export default function WorkLogPage() {
  const queryClient = useQueryClient()
  const isDesktop = useIsDesktop()
  const { staff } = useAuthStore()
  const isAdmin = staff?.role === 'admin'

  const [ym, setYm] = useState<string>(thisMonthKST())
  const [year, month] = ym.split('-').map(Number)

  // 폼 상태
  const [managerName,   setManagerName]   = useState('')
  const [fireContent,   setFireContent]   = useState('')
  const [fireResult,    setFireResult]    = useState<'ok' | 'bad'>('ok')
  const [fireAction,    setFireAction]    = useState('')
  const [escapeContent, setEscapeContent] = useState('')
  const [escapeResult,  setEscapeResult]  = useState<'ok' | 'bad'>('ok')
  const [escapeAction,  setEscapeAction]  = useState('')
  const [gasContent,    setGasContent]    = useState('')
  const [gasResult,     setGasResult]     = useState<'' | 'ok' | 'bad'>('')
  const [gasAction,     setGasAction]     = useState('')
  const [etcContent,    setEtcContent]    = useState('')
  const [etcResult,     setEtcResult]     = useState<'' | 'ok' | 'bad'>('')
  const [etcAction,     setEtcAction]     = useState('')
  const [reportYear,    setReportYear]    = useState('')
  const [reportMonth,   setReportMonth]   = useState('')
  const [reportDay,     setReportDay]     = useState('')
  const [reportMethod,  setReportMethod]  = useState<'' | 'face' | 'written' | 'telecom'>('')
  const [fixMethod,     setFixMethod]     = useState<'' | 'relocate' | 'remove' | 'repair' | 'other'>('')

  const loadedRef = useRef<WorkLogPayload | null>(null)
  const prevYmRef = useRef<string>('')

  // 포커스 상태
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // 엑셀 생성 중
  const [generating, setGenerating] = useState(false)

  // ── 데이터 패칭 ──────────────────────────────────────
  const savedQuery = useQuery({
    queryKey: ['worklog', ym],
    queryFn: () => workLogApi.get(ym),
    retry: 1,
    staleTime: 0,
  })

  const previewQuery = useQuery({
    queryKey: ['worklog-preview', ym],
    queryFn: () => workLogApi.preview(ym),
    retry: 1,
    enabled: savedQuery.data === null && savedQuery.isSuccess,
  })

  // ── 데이터 로드 (월 변경 시에만 폼 초기화) ──────────────
  useEffect(() => {
    if (prevYmRef.current === ym) return
    if (savedQuery.isFetching) return

    if (savedQuery.isSuccess) {
      const record = savedQuery.data
      if (record) {
        const payload: WorkLogPayload = {
          manager_name:   record.manager_name,
          fire_content:   record.fire_content,
          fire_result:    record.fire_result,
          fire_action:    record.fire_action,
          escape_content: record.escape_content,
          escape_result:  record.escape_result,
          escape_action:  record.escape_action,
          gas_content:    record.gas_content,
          gas_result:     record.gas_result ?? '',
          gas_action:     record.gas_action ?? '',
          etc_content:    record.etc_content,
          etc_result:     record.etc_result ?? '',
          etc_action:     record.etc_action ?? '',
          report_year:    record.report_year ?? '',
          report_month:   record.report_month ?? '',
          report_day:     record.report_day ?? '',
          report_method:  record.report_method ?? '',
          fix_method:     record.fix_method ?? '',
        }
        setManagerName(record.manager_name)
        setFireContent(record.fire_content)
        setFireResult(record.fire_result)
        setFireAction(record.fire_action)
        setEscapeContent(record.escape_content)
        setEscapeResult(record.escape_result)
        setEscapeAction(record.escape_action)
        setGasContent(record.gas_content)
        setGasResult(record.gas_result ?? '')
        setGasAction(record.gas_action ?? '')
        setEtcContent(record.etc_content)
        setEtcResult(record.etc_result ?? '')
        setEtcAction(record.etc_action ?? '')
        setReportYear(record.report_year ?? '')
        setReportMonth(record.report_month ?? '')
        setReportDay(record.report_day ?? '')
        setReportMethod(record.report_method ?? '')
        setFixMethod(record.fix_method ?? '')
        loadedRef.current = payload
        prevYmRef.current = ym
      } else if (previewQuery.isSuccess && previewQuery.data) {
        const p = previewQuery.data
        setManagerName(p.manager_name)
        setFireContent(p.fire_content)
        setFireResult(p.fire_result)
        setFireAction(p.fire_action)
        setEscapeContent(p.escape_content)
        setEscapeResult(p.escape_result)
        setEscapeAction(p.escape_action)
        setGasContent(p.gas_content)
        setGasResult(p.gas_result ?? '')
        setGasAction(p.gas_action ?? '')
        setEtcContent(p.etc_content)
        setEtcResult(p.etc_result ?? '')
        setEtcAction(p.etc_action ?? '')
        setReportYear(p.report_year ?? '')
        setReportMonth(p.report_month ?? '')
        setReportDay(p.report_day ?? '')
        setReportMethod(p.report_method ?? '')
        setFixMethod(p.fix_method ?? '')
        loadedRef.current = p
        prevYmRef.current = ym
      }
    }
  }, [ym, savedQuery.isFetching, savedQuery.isSuccess, savedQuery.data, previewQuery.isSuccess, previewQuery.data])

  // 월 변경 시 prevYmRef 리셋
  const changeMonth = (newYm: string) => {
    prevYmRef.current = ''
    loadedRef.current = null
    setManagerName(''); setFireContent(''); setFireResult('ok'); setFireAction('')
    setEscapeContent(''); setEscapeResult('ok'); setEscapeAction('')
    setGasContent(''); setGasResult(''); setGasAction('')
    setEtcContent(''); setEtcResult(''); setEtcAction('')
    setReportYear(''); setReportMonth(''); setReportDay('')
    setReportMethod(''); setFixMethod('')
    setYm(newYm)
  }

  // ── dirty 감지 ────────────────────────────────────────
  const currentPayload: WorkLogPayload = {
    manager_name:   managerName,
    fire_content:   fireContent,
    fire_result:    fireResult,
    fire_action:    fireAction,
    escape_content: escapeContent,
    escape_result:  escapeResult,
    escape_action:  escapeAction,
    gas_content:    gasContent,
    gas_result:     gasResult,
    gas_action:     gasAction,
    etc_content:    etcContent,
    etc_result:     etcResult,
    etc_action:     etcAction,
    report_year:    reportYear,
    report_month:   reportMonth,
    report_day:     reportDay,
    report_method:  reportMethod,
    fix_method:     fixMethod,
  }

  const isDirty = loadedRef.current !== null && (
    managerName   !== loadedRef.current.manager_name   ||
    fireContent   !== loadedRef.current.fire_content   ||
    fireResult    !== loadedRef.current.fire_result    ||
    fireAction    !== loadedRef.current.fire_action    ||
    escapeContent !== loadedRef.current.escape_content ||
    escapeResult  !== loadedRef.current.escape_result  ||
    escapeAction  !== loadedRef.current.escape_action  ||
    gasContent    !== loadedRef.current.gas_content    ||
    gasResult     !== loadedRef.current.gas_result     ||
    gasAction     !== loadedRef.current.gas_action     ||
    etcContent    !== loadedRef.current.etc_content    ||
    etcResult     !== loadedRef.current.etc_result     ||
    etcAction     !== loadedRef.current.etc_action     ||
    reportYear    !== loadedRef.current.report_year    ||
    reportMonth   !== loadedRef.current.report_month   ||
    reportDay     !== loadedRef.current.report_day     ||
    reportMethod  !== loadedRef.current.report_method  ||
    fixMethod     !== loadedRef.current.fix_method
  )

  // ── 저장 ──────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () => workLogApi.save(ym, currentPayload),
    onSuccess: (saved) => {
      toast.success('저장되었습니다')
      const payload: WorkLogPayload = {
        manager_name:   saved.manager_name,
        fire_content:   saved.fire_content,
        fire_result:    saved.fire_result,
        fire_action:    saved.fire_action,
        escape_content: saved.escape_content,
        escape_result:  saved.escape_result,
        escape_action:  saved.escape_action,
        gas_content:    saved.gas_content,
        gas_result:     saved.gas_result ?? '',
        gas_action:     saved.gas_action ?? '',
        etc_content:    saved.etc_content,
        etc_result:     saved.etc_result ?? '',
        etc_action:     saved.etc_action ?? '',
        report_year:    saved.report_year ?? '',
        report_month:   saved.report_month ?? '',
        report_day:     saved.report_day ?? '',
        report_method:  saved.report_method ?? '',
        fix_method:     saved.fix_method ?? '',
      }
      loadedRef.current = payload
      queryClient.invalidateQueries({ queryKey: ['worklog', ym] })
    },
    onError: () => {
      toast.error('저장 실패 — 다시 시도해 주세요')
    },
  })

  // ── 엑셀 출력 ─────────────────────────────────────────
  const handleExport = async () => {
    if (isDirty) {
      const confirmed = window.confirm('저장되지 않은 변경사항이 있습니다\n\n저장 후 엑셀을 출력하시겠습니까?')
      if (!confirmed) return
      // 저장 후 출력
      try {
        await saveMutation.mutateAsync()
      } catch {
        return
      }
    }
    setGenerating(true)
    try {
      await generateWorkLogExcel(ym, currentPayload)
    } catch {
      toast.error('엑셀 생성 실패 — 다시 시도해 주세요')
    } finally {
      setGenerating(false)
    }
  }

  // ── 로딩 상태 ─────────────────────────────────────────
  const isLoading = savedQuery.isFetching || previewQuery.isFetching
  const isSaving  = saveMutation.isPending

  const roStyle: React.CSSProperties = isAdmin ? {} : {
    background: 'var(--bg2)', color: 'var(--t2)', cursor: 'default',
  }

  // ── 인라인 스타일 헬퍼 ──────────────────────────────────
  function taStyle(field: string): React.CSSProperties {
    return {
      ...textareaStyle,
      ...(focusedField === field && isAdmin ? { border: '1px solid var(--bd2)' } : {}),
      ...(!isAdmin ? roStyle : {}),
    }
  }

  function inputStyle(): React.CSSProperties {
    return {
      width: '100%', boxSizing: 'border-box' as const,
      background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 9,
      color: 'var(--t1)', fontSize: 13, fontFamily: 'inherit', fontWeight: 400,
      padding: '9px 12px', outline: 'none',
      ...(focusedField === 'managerName' && isAdmin ? { border: '1px solid var(--bd2)' } : {}),
      ...(!isAdmin ? roStyle : {}),
    }
  }

  // ── 월 picker ref ──────────────────────────────────────
  const monthPickerRef = useRef<HTMLInputElement>(null)

  // ── 공통 폼 컨텐츠 ──────────────────────────────────────
  const formContent = (
    <>
      {/* 기본 정보 카드 */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>기본 정보</div>
        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>관리자</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <input
              type="text"
              value={managerName}
              onChange={e => isAdmin && setManagerName(e.target.value)}
              readOnly={!isAdmin}
              placeholder="관리자 이름을 입력하세요"
              onFocus={() => setFocusedField('managerName')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle()}
            />
        }
      </div>

      {/* 소방시설 카드 */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>소방시설</div>

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>확인내용</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <textarea
              rows={4}
              value={fireContent}
              onChange={e => isAdmin && setFireContent(e.target.value)}
              readOnly={!isAdmin}
              onFocus={() => setFocusedField('fireContent')}
              onBlur={() => setFocusedField(null)}
              style={taStyle('fireContent')}
            />
        }

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4, marginTop: 8 }}>결과</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => isAdmin && setFireResult('ok')}
                style={{
                  padding: '5px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: isAdmin ? 'pointer' : 'default',
                  opacity: isAdmin ? 1 : 0.5,
                  ...(fireResult === 'ok'
                    ? { background: 'var(--safe)', border: '1px solid var(--safe)', color: '#fff' }
                    : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
                }}
              >양호</button>
              <button
                onClick={() => isAdmin && setFireResult('bad')}
                style={{
                  padding: '5px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: isAdmin ? 'pointer' : 'default',
                  opacity: isAdmin ? 1 : 0.5,
                  ...(fireResult === 'bad'
                    ? { background: 'var(--danger)', border: '1px solid var(--danger)', color: '#fff' }
                    : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
                }}
              >불량</button>
            </div>
        }

        <div style={{ fontSize: 11, color: fireResult === 'bad' ? 'var(--warn)' : 'var(--t2)', marginBottom: 4, marginTop: 8 }}>조치내역</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <textarea
              rows={3}
              value={fireAction}
              onChange={e => isAdmin && setFireAction(e.target.value)}
              readOnly={!isAdmin}
              placeholder="조치 내역 없음"
              onFocus={() => setFocusedField('fireAction')}
              onBlur={() => setFocusedField(null)}
              style={taStyle('fireAction')}
            />
        }
      </div>

      {/* 피난방화시설 카드 */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>피난방화시설</div>

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>확인내용</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <textarea
              rows={3}
              value={escapeContent}
              onChange={e => isAdmin && setEscapeContent(e.target.value)}
              readOnly={!isAdmin}
              onFocus={() => setFocusedField('escapeContent')}
              onBlur={() => setFocusedField(null)}
              style={taStyle('escapeContent')}
            />
        }

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4, marginTop: 8 }}>결과</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => isAdmin && setEscapeResult('ok')}
                style={{
                  padding: '5px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: isAdmin ? 'pointer' : 'default',
                  opacity: isAdmin ? 1 : 0.5,
                  ...(escapeResult === 'ok'
                    ? { background: 'var(--safe)', border: '1px solid var(--safe)', color: '#fff' }
                    : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
                }}
              >양호</button>
              <button
                onClick={() => isAdmin && setEscapeResult('bad')}
                style={{
                  padding: '5px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: isAdmin ? 'pointer' : 'default',
                  opacity: isAdmin ? 1 : 0.5,
                  ...(escapeResult === 'bad'
                    ? { background: 'var(--danger)', border: '1px solid var(--danger)', color: '#fff' }
                    : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
                }}
              >불량</button>
            </div>
        }

        <div style={{ fontSize: 11, color: escapeResult === 'bad' ? 'var(--warn)' : 'var(--t2)', marginBottom: 4, marginTop: 8 }}>조치내역</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <textarea
              rows={3}
              value={escapeAction}
              onChange={e => isAdmin && setEscapeAction(e.target.value)}
              readOnly={!isAdmin}
              placeholder="조치 내역 없음"
              onFocus={() => setFocusedField('escapeAction')}
              onBlur={() => setFocusedField(null)}
              style={taStyle('escapeAction')}
            />
        }
      </div>

      {/* 화기취급감독 카드 */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>화기취급감독</div>
        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>확인내용</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <textarea
              rows={2}
              value={gasContent}
              onChange={e => isAdmin && setGasContent(e.target.value)}
              readOnly={!isAdmin}
              onFocus={() => setFocusedField('gasContent')}
              onBlur={() => setFocusedField(null)}
              style={taStyle('gasContent')}
            />
        }

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4, marginTop: 8 }}>결과</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => isAdmin && setGasResult(gasResult === 'ok' ? '' : 'ok')}
                style={{
                  padding: '5px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: isAdmin ? 'pointer' : 'default',
                  opacity: isAdmin ? 1 : 0.5,
                  ...(gasResult === 'ok'
                    ? { background: 'var(--safe)', border: '1px solid var(--safe)', color: '#fff' }
                    : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
                }}
              >양호</button>
              <button
                onClick={() => isAdmin && setGasResult(gasResult === 'bad' ? '' : 'bad')}
                style={{
                  padding: '5px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: isAdmin ? 'pointer' : 'default',
                  opacity: isAdmin ? 1 : 0.5,
                  ...(gasResult === 'bad'
                    ? { background: 'var(--danger)', border: '1px solid var(--danger)', color: '#fff' }
                    : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
                }}
              >불량</button>
            </div>
        }

        <div style={{ fontSize: 11, color: gasResult === 'bad' ? 'var(--warn)' : 'var(--t2)', marginBottom: 4, marginTop: 8 }}>조치내역</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <textarea
              rows={3}
              value={gasAction}
              onChange={e => isAdmin && setGasAction(e.target.value)}
              readOnly={!isAdmin}
              placeholder="조치 내역 없음"
              onFocus={() => setFocusedField('gasAction')}
              onBlur={() => setFocusedField(null)}
              style={taStyle('gasAction')}
            />
        }
      </div>

      {/* 기타사항 카드 */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>기타사항</div>
        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>확인내용</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <textarea
              rows={3}
              value={etcContent}
              onChange={e => isAdmin && setEtcContent(e.target.value)}
              readOnly={!isAdmin}
              onFocus={() => setFocusedField('etcContent')}
              onBlur={() => setFocusedField(null)}
              style={taStyle('etcContent')}
            />
        }

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4, marginTop: 8 }}>결과</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => isAdmin && setEtcResult(etcResult === 'ok' ? '' : 'ok')}
                style={{
                  padding: '5px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: isAdmin ? 'pointer' : 'default',
                  opacity: isAdmin ? 1 : 0.5,
                  ...(etcResult === 'ok'
                    ? { background: 'var(--safe)', border: '1px solid var(--safe)', color: '#fff' }
                    : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
                }}
              >양호</button>
              <button
                onClick={() => isAdmin && setEtcResult(etcResult === 'bad' ? '' : 'bad')}
                style={{
                  padding: '5px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: isAdmin ? 'pointer' : 'default',
                  opacity: isAdmin ? 1 : 0.5,
                  ...(etcResult === 'bad'
                    ? { background: 'var(--danger)', border: '1px solid var(--danger)', color: '#fff' }
                    : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
                }}
              >불량</button>
            </div>
        }

        <div style={{ fontSize: 11, color: etcResult === 'bad' ? 'var(--warn)' : 'var(--t2)', marginBottom: 4, marginTop: 8 }}>조치내역</div>
        {isLoading
          ? <div style={skeletonStyle} />
          : <textarea
              rows={3}
              value={etcAction}
              onChange={e => isAdmin && setEtcAction(e.target.value)}
              readOnly={!isAdmin}
              placeholder="조치 내역 없음"
              onFocus={() => setFocusedField('etcAction')}
              onBlur={() => setFocusedField(null)}
              style={taStyle('etcAction')}
            />
        }
      </div>

      {/* 불량사항 개선보고 카드 */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>불량사항 개선보고</div>

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>보고일시</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="text" value={reportYear} onChange={e => isAdmin && setReportYear(e.target.value)} readOnly={!isAdmin} placeholder="연" style={{ ...inputStyle(), width: 50, textAlign: 'center' }} />
          <span style={{ color: 'var(--t2)', fontSize: 12 }}>.</span>
          <input type="text" value={reportMonth} onChange={e => isAdmin && setReportMonth(e.target.value)} readOnly={!isAdmin} placeholder="월" style={{ ...inputStyle(), width: 40, textAlign: 'center' }} />
          <span style={{ color: 'var(--t2)', fontSize: 12 }}>.</span>
          <input type="text" value={reportDay} onChange={e => isAdmin && setReportDay(e.target.value)} readOnly={!isAdmin} placeholder="일" style={{ ...inputStyle(), width: 40, textAlign: 'center' }} />
        </div>

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4, marginTop: 8 }}>보고방법</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {([['face', '대면'], ['written', '서면'], ['telecom', '정보통신']] as const).map(([val, label]) => (
            <button key={val}
              onClick={() => isAdmin && setReportMethod(reportMethod === val ? '' : val)}
              style={{
                padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                cursor: isAdmin ? 'pointer' : 'default', opacity: isAdmin ? 1 : 0.5,
                ...(reportMethod === val
                  ? { background: 'var(--acl)', border: '1px solid var(--acl)', color: '#fff' }
                  : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
              }}
            >{label}</button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4, marginTop: 8 }}>조치방법</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {([['relocate', '이전'], ['remove', '제거'], ['repair', '수리·교체'], ['other', '기타']] as const).map(([val, label]) => (
            <button key={val}
              onClick={() => isAdmin && setFixMethod(fixMethod === val ? '' : val)}
              style={{
                padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                cursor: isAdmin ? 'pointer' : 'default', opacity: isAdmin ? 1 : 0.5,
                ...(fixMethod === val
                  ? { background: 'var(--acl)', border: '1px solid var(--acl)', color: '#fff' }
                  : { background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)' }),
              }}
            >{label}</button>
          ))}
        </div>
      </div>
    </>
  )

  // ── 푸터 버튼 ──────────────────────────────────────────
  const footerButtons = (
    <div style={{ display: 'flex', gap: 8 }}>
      {/* 저장 버튼 */}
      <button
        onClick={() => isAdmin && !isSaving && saveMutation.mutate()}
        title={!isAdmin ? '관리자만 저장할 수 있습니다' : undefined}
        style={{
          flex: 1, padding: 11, borderRadius: 9, border: 'none',
          fontSize: 13, fontWeight: 700, cursor: isAdmin && !isSaving ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
          ...(isSaving || !isAdmin
            ? { background: 'var(--bg3)', color: 'var(--t3)' }
            : { background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff' }),
        }}
      >
        {isSaving ? '저장 중...' : (
          <>
            저장
            {isDirty && (
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--warn)', marginLeft: 6 }}>· 수정됨</span>
            )}
          </>
        )}
      </button>

      {/* 엑셀 출력 버튼 */}
      <button
        onClick={() => isAdmin && !generating && handleExport()}
        title={!isAdmin ? '관리자만 저장할 수 있습니다' : undefined}
        style={{
          flex: 1, padding: 11, borderRadius: 9, border: '1px solid var(--bd)',
          fontSize: 13, fontWeight: 700, cursor: isAdmin && !generating ? 'pointer' : 'default',
          ...(generating || !isAdmin
            ? { background: 'var(--bg3)', color: 'var(--t3)' }
            : { background: 'var(--bg2)', color: 'var(--t1)' }),
        }}
      >
        {generating ? '출력 중...' : '엑셀 출력'}
      </button>
    </div>
  )

  // ── 월 네비게이터 (공통) ──────────────────────────────────
  const monthNav = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button style={navBtn} onClick={() => changeMonth(addMonths(ym, -1))}>‹</button>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => monthPickerRef.current?.showPicker?.() ?? monthPickerRef.current?.click()}
          style={{ minWidth: 90, fontSize: 15, fontWeight: 700, color: 'var(--t1)', textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
        >
          {year}년 {month}월
        </button>
        <input
          ref={monthPickerRef}
          type="month"
          value={ym}
          onChange={e => e.target.value && changeMonth(e.target.value)}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, top: 0, left: 0 }}
        />
      </div>
      <button style={navBtn} onClick={() => changeMonth(addMonths(ym, 1))}>›</button>
    </div>
  )

  // ── 렌더 — 데스크톱 ────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

        {/* 좌측 편집 패널 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>업무수행기록표</span>
            {monthNav}
          </div>
          {formContent}
          <div style={{ marginTop: 4 }}>
            {footerButtons}
          </div>
          <div style={{ height: 24 }} />
        </div>

        {/* 우측 A4 세로 미리보기 패널 */}
        <div style={{
          aspectRatio: '210 / 297',
          height: '100%', flexShrink: 0,
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
            pointerEvents: 'none', zIndex: 5,
          }}>
            인쇄 미리보기
          </div>
          <WorkLogPortraitPreview
            yearMonth={ym}
            managerName={managerName}
            fireContent={fireContent}
            fireResult={fireResult}
            fireAction={fireAction}
            escapeContent={escapeContent}
            escapeResult={escapeResult}
            escapeAction={escapeAction}
            gasContent={gasContent}
            gasResult={gasResult}
            gasAction={gasAction}
            etcContent={etcContent}
            etcResult={etcResult}
            etcAction={etcAction}
            reportYear={reportYear}
            reportMonth={reportMonth}
            reportDay={reportDay}
            reportMethod={reportMethod}
            fixMethod={fixMethod}
          />
        </div>
      </div>
    )
  }

  // ── 렌더 — 모바일 ──────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', padding: '12px 16px' }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {monthNav}
      <div style={{ height: 14 }} />
      {formContent}

      {/* 하단 여백 (푸터 높이만큼) */}
      <div style={{ height: 72 }} />

      {/* 고정 푸터 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '10px 16px',
        paddingBottom: 'calc(10px + var(--sab))',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--bd)',
        zIndex: 10,
      }}>
        {footerButtons}
      </div>
    </div>
  )
}

// ── 캘리브레이션 설정 ─────────────────────────────────────
const WORKLOG_CALIB_STEPS = [
  { key: 'perfYear',      label: '수행일자 — 연 (C4)',         color: '#64748b' },
  { key: 'perfMonth1',    label: '수행일자 — 시작월',          color: '#475569' },
  { key: 'perfDay1',      label: '수행일자 — 시작일',          color: '#334155' },
  { key: 'perfMonth2',    label: '수행일자 — 종료월',          color: '#1e293b' },
  { key: 'perfDay2',      label: '수행일자 — 종료일',          color: '#0f172a' },
  { key: 'manager',       label: '관리자 이름 (U4)',           color: '#3b82f6' },
  { key: 'fireContent',   label: '소방시설 확인내용 (C10)',     color: '#22c55e' },
  { key: 'fireOk',        label: '양호 체크 (Y12)',            color: '#10b981' },
  { key: 'fireBad',       label: '불량 체크 (Y14)',            color: '#06b6d4' },
  { key: 'fireAction',    label: '조치내역 (AA10)',            color: '#f59e0b' },
  { key: 'escapeContent', label: '피난방화 확인내용 (C14)',     color: '#d97706' },
  { key: 'escapeOk',      label: '양호 체크 (Y19)',            color: '#ef4444' },
  { key: 'escapeBad',     label: '불량 체크 (Y21)',            color: '#a855f7' },
  { key: 'escapeAction',  label: '조치내역 (AA14)',            color: '#7c3aed' },
  { key: 'gasContent',    label: '화기취급감독 확인내용 (C17)', color: '#ec4899' },
  { key: 'gasOk',         label: '화기취급 양호 (Y26)',        color: '#f43f5e' },
  { key: 'gasBad',        label: '화기취급 불량 (Y28)',        color: '#be185d' },
  { key: 'gasAction',     label: '화기취급 조치내역 (AA17)',   color: '#db2777' },
  { key: 'etcContent',    label: '기타사항 확인내용 (C24)',     color: '#14b8a6' },
  { key: 'etcOk',         label: '기타사항 양호 (Y33)',        color: '#0d9488' },
  { key: 'etcBad',        label: '기타사항 불량 (Y35)',        color: '#115e59' },
  { key: 'etcAction',     label: '기타사항 조치내역 (AA24)',   color: '#134e4a' },
  { key: 'rptYear',       label: '보고일시 — 연',             color: '#78716c' },
  { key: 'rptMonth',      label: '보고일시 — 월',             color: '#57534e' },
  { key: 'rptDay',        label: '보고일시 — 일',             color: '#44403c' },
  { key: 'rptFace',       label: '보고방법 — 대면',           color: '#292524' },
  { key: 'rptWritten',    label: '보고방법 — 서면',           color: '#1c1917' },
  { key: 'rptTelecom',    label: '보고방법 — 정보통신',       color: '#0c0a09' },
  { key: 'fixRelocate',   label: '조치방법 — 이전',           color: '#713f12' },
  { key: 'fixRemove',     label: '조치방법 — 제거',           color: '#854d0e' },
  { key: 'fixRepair',     label: '조치방법 — 수리·교체',      color: '#a16207' },
  { key: 'fixOther',      label: '조치방법 — 기타',           color: '#ca8a04' },
]

const WORKLOG_CALIB_KEY = 'calib_worklog'
const FINGER_OFFSET = 60

interface WorkLogCalibData {
  [key: string]: { x: number; y: number }
}

function loadWorkLogCalib(): WorkLogCalibData | null {
  try { return JSON.parse(localStorage.getItem(WORKLOG_CALIB_KEY) ?? 'null') } catch { return null }
}
function saveWorkLogCalib(data: WorkLogCalibData) {
  localStorage.setItem(WORKLOG_CALIB_KEY, JSON.stringify(data))
}

// ── 템플릿 이미지 오버레이 미리보기 ─────────────────────────
function WorkLogPortraitPreview({
  yearMonth, managerName, fireContent, fireResult, fireAction,
  escapeContent, escapeResult, escapeAction,
  gasContent, gasResult, gasAction,
  etcContent, etcResult, etcAction,
  reportYear, reportMonth, reportDay, reportMethod, fixMethod,
}: {
  yearMonth: string
  managerName: string
  fireContent: string
  fireResult: 'ok' | 'bad'
  fireAction: string
  escapeContent: string
  escapeResult: 'ok' | 'bad'
  escapeAction: string
  gasContent: string
  gasResult: '' | 'ok' | 'bad'
  gasAction: string
  etcContent: string
  etcResult: '' | 'ok' | 'bad'
  etcAction: string
  reportYear: string
  reportMonth: string
  reportDay: string
  reportMethod: '' | 'face' | 'written' | 'telecom'
  fixMethod: '' | 'relocate' | 'remove' | 'repair' | 'other'
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

  const calib = loadWorkLogCalib()
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

    if (calibStep + 1 >= WORKLOG_CALIB_STEPS.length) {
      // 모든 스텝 완료 → 저장
      const data: WorkLogCalibData = {}
      newPoints.forEach((pt, i) => {
        if (pt) data[WORKLOG_CALIB_STEPS[i].key] = pt
      })
      saveWorkLogCalib(data)
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
  const AREA_KEYS = new Set(['fireContent', 'fireAction', 'escapeContent', 'escapeAction', 'gasContent', 'etcContent'])

  const textStyle = (fontSize = 7): React.CSSProperties => ({
    fontSize, color: '#111', fontWeight: 400,
    whiteSpace: 'pre-wrap', lineHeight: 1.6,
    fontFamily: "'Noto Sans KR', sans-serif",
    overflow: 'hidden',
  })

  const [year, month] = yearMonth.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()

  const overlayItems: { key: string; text: string; isArea?: boolean; width?: string }[] = calib ? [
    { key: 'perfYear', text: String(year) },
    { key: 'perfMonth1', text: String(month) },
    { key: 'perfDay1', text: '1' },
    { key: 'perfMonth2', text: String(month) },
    { key: 'perfDay2', text: String(lastDay) },
    { key: 'manager', text: managerName },
    { key: 'fireContent', text: fireContent, isArea: true },
    { key: 'fireOk', text: fireResult === 'ok' ? '\u221A' : '' },
    { key: 'fireBad', text: fireResult === 'bad' ? '\u221A' : '' },
    { key: 'fireAction', text: fireAction, isArea: true, width: '22%' },
    { key: 'escapeContent', text: escapeContent, isArea: true },
    { key: 'escapeOk', text: escapeResult === 'ok' ? '\u221A' : '' },
    { key: 'escapeBad', text: escapeResult === 'bad' ? '\u221A' : '' },
    { key: 'escapeAction', text: escapeAction, isArea: true, width: '22%' },
    { key: 'gasContent', text: gasContent, isArea: true },
    { key: 'gasOk', text: gasResult === 'ok' ? '\u221A' : '' },
    { key: 'gasBad', text: gasResult === 'bad' ? '\u221A' : '' },
    { key: 'gasAction', text: gasAction, isArea: true, width: '22%' },
    { key: 'etcContent', text: etcContent, isArea: true },
    { key: 'etcOk', text: etcResult === 'ok' ? '\u221A' : '' },
    { key: 'etcBad', text: etcResult === 'bad' ? '\u221A' : '' },
    { key: 'etcAction', text: etcAction, isArea: true, width: '22%' },
    { key: 'rptYear', text: reportYear },
    { key: 'rptMonth', text: reportMonth },
    { key: 'rptDay', text: reportDay },
    { key: 'rptFace', text: reportMethod === 'face' ? '\u221A' : '' },
    { key: 'rptWritten', text: reportMethod === 'written' ? '\u221A' : '' },
    { key: 'rptTelecom', text: reportMethod === 'telecom' ? '\u221A' : '' },
    { key: 'fixRelocate', text: fixMethod === 'relocate' ? '\u221A' : '' },
    { key: 'fixRemove', text: fixMethod === 'remove' ? '\u221A' : '' },
    { key: 'fixRepair', text: fixMethod === 'repair' ? '\u221A' : '' },
    { key: 'fixOther', text: fixMethod === 'other' ? '\u221A' : '' },
  ] : []

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', position: 'relative',
      }}
    >
      <img
        ref={imgRef}
        src="/templates/preview/worklog-1.png"
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
          {/* 데이터 오버레이 (캘리브레이션 완료 후) */}
          {!calibMode && calib && overlayItems.map(item => {
            const pt = calib[item.key]
            if (!pt || !item.text) return null
            if (item.isArea) {
              return (
                <div key={item.key} style={{
                  position: 'absolute',
                  left: `${pt.x}%`, top: `${pt.y}%`,
                  width: item.width || '75%',
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
                ...textStyle(12), fontWeight: 700, textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {item.text}
              </span>
            )
          })}

          {/* 확정된 캘리브레이션 마커 */}
          {calibMode && calibPoints.map((pt, i) => (
            pt && <WorkLogCalibMarker key={i} x={pt.x} y={pt.y} color={WORKLOG_CALIB_STEPS[i].color} label={`${i + 1}`} />
          ))}

          {/* 드래그 중 마커 */}
          {calibMode && activePoint && (
            <WorkLogCalibMarker x={activePoint.x} y={activePoint.y} color={WORKLOG_CALIB_STEPS[calibStep].color} label={`${calibStep + 1}`} active />
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
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            background: WORKLOG_CALIB_STEPS[calibStep].color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, flexShrink: 0,
          }}>{calibStep + 1}</span>
          <span>{WORKLOG_CALIB_STEPS[calibStep].label}</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>
            {activePoint ? `(${activePoint.x.toFixed(1)}, ${activePoint.y.toFixed(1)})` : '터치/클릭'}
          </span>
          {activePoint && (
            <button onClick={confirmPoint} style={{
              background: '#22c55e', border: 'none', color: '#fff',
              padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>확인</button>
          )}
          <button onClick={() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
          }}>취소</button>
        </div>
      )}

      {/* 위치 설정 버튼 */}
      {!calibMode && (
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
    </div>
  )
}

// ── 캘리브레이션 마커 ───────────────────────────────────────
function WorkLogCalibMarker({ x, y, color, label, active }: { x: number; y: number; color: string; label: string; active?: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`, top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}>
      <div style={{ position: 'absolute', left: -20, top: 0, width: 40, height: 2, background: color, opacity: 0.8 }} />
      <div style={{ position: 'absolute', top: -20, left: 0, width: 2, height: 40, background: color, opacity: 0.8 }} />
      <div style={{
        width: active ? 20 : 16, height: active ? 20 : 16,
        borderRadius: '50%', background: color,
        border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
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
