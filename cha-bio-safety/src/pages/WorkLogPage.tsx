// ── 업무수행기록표 페이지 ──────────────────────────────────────
import { useState, useEffect, useRef } from 'react'
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
  const [etcContent,    setEtcContent]    = useState('')

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
          etc_content:    record.etc_content,
        }
        setManagerName(record.manager_name)
        setFireContent(record.fire_content)
        setFireResult(record.fire_result)
        setFireAction(record.fire_action)
        setEscapeContent(record.escape_content)
        setEscapeResult(record.escape_result)
        setEscapeAction(record.escape_action)
        setGasContent(record.gas_content)
        setEtcContent(record.etc_content)
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
        setEtcContent(p.etc_content)
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
    setGasContent(''); setEtcContent('')
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
    etc_content:    etcContent,
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
    etcContent    !== loadedRef.current.etc_content
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
        etc_content:    saved.etc_content,
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

  // ── 렌더 ──────────────────────────────────────────────
  const pad = isDesktop ? { padding: '24px 32px' } : { padding: '12px 16px' }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', ...pad }}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* 월 네비게이션 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
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
      </div>

      {/* 하단 여백 (푸터 높이만큼) */}
      <div style={{ height: 72 }} />

      {/* 고정 푸터 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '10px 16px',
        paddingBottom: 'calc(10px + var(--sab))',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--bd)',
        display: 'flex', gap: 8, zIndex: 10,
      }}>
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
    </div>
  )
}
