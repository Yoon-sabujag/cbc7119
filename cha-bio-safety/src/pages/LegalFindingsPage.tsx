import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import type { LegalFinding } from '../types'

// ── 날짜 포매터 ──────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

function fmtMonthOnly(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.`
}

// ── 스켈레톤 ──────────────────────────────────────────────────────
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 스핀너 ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--bd2)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}

// ── 지적사항 등록 BottomSheet ─────────────────────────────────────
interface BottomSheetProps {
  scheduleItemId: string
  onClose: () => void
}

function FindingBottomSheet({ scheduleItemId, onClose }: BottomSheetProps) {
  const queryClient = useQueryClient()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  const mutation = useMutation({
    mutationFn: () => legalApi.createFinding(scheduleItemId, {
      description: description.trim(),
      location: location.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-findings', scheduleItemId] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', scheduleItemId] })
      toast.success('지적사항이 등록되었습니다.')
      onClose()
    },
    onError: () => {
      toast.error('등록에 실패했습니다. 다시 시도해 주세요.')
    },
  })

  const isSubmitting = mutation.isPending

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('지적 내용을 입력하세요')
      return
    }
    mutation.mutate()
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg3)',
    borderRadius: 8,
    padding: 12,
    border: '1px solid var(--bd2)',
    width: '100%',
    color: 'var(--t1)',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'Noto Sans KR, sans-serif',
    lineHeight: 1.5,
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 50,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          borderRadius: '16px 16px 0 0',
          animation: 'slideUp 0.28s ease-out both',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* 드래그 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
        </div>

        {/* 제목 */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 등록</div>
        </div>

        {/* 폼 */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 지적 내용 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }}>
              지적 내용 <span style={{ color: 'var(--danger)' }}>*</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="지적 내용을 입력하세요"
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* 위치 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }}>위치 (선택)</div>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="예: 3층 복도"
              style={inputStyle}
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--acl)',
              borderRadius: 8,
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? '처리 중...' : '등록'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 48,
              background: 'transparent',
              border: '1px solid var(--bd2)',
              borderRadius: 8,
              color: 'var(--t2)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────
export default function LegalFindingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { staff } = useAuthStore()
  const role = staff?.role

  const [showSheet, setShowSheet] = useState(false)
  const [selectedResult, setSelectedResult] = useState<string>('')
  const [savingResult, setSavingResult] = useState(false)
  const [uploadingReport, setUploadingReport] = useState(false)
  const reportInputRef = useRef<HTMLInputElement>(null)

  const { data: round, isLoading: roundLoading } = useQuery({
    queryKey: ['legal-round', id],
    queryFn: () => legalApi.get(id!),
    enabled: !!id,
  })

  const { data: findings, isLoading: findingsLoading, isError } = useQuery({
    queryKey: ['legal-findings', id],
    queryFn: () => legalApi.getFindings(id!),
    enabled: !!id,
    staleTime: 30_000,
  })

  const isLoading = roundLoading || findingsLoading

  // 결과 초기값 동기화
  const currentResult = round?.result ?? null
  const effectiveSelectedResult = selectedResult || (currentResult ?? '')

  const handleSaveResult = async () => {
    if (!id) return
    setSavingResult(true)
    try {
      await legalApi.updateResult(id, { result: effectiveSelectedResult || undefined })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      toast.success('점검 결과가 저장되었습니다.')
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setSavingResult(false)
    }
  }

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    e.target.value = ''
    setUploadingReport(true)
    try {
      const form = new FormData()
      form.append('file', file, file.name)
      form.append('folder', `legal/${id}/report`)
      const { useAuthStore: store } = await import('../stores/authStore')
      const token = store.getState().token
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      if (!json.success || !json.data?.key) throw new Error('upload failed')
      await legalApi.updateResult(id, { report_file_key: json.data.key })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      toast.success('보고서가 업로드되었습니다.')
    } catch {
      toast.error('사진 업로드 실패')
    } finally {
      setUploadingReport(false)
    }
  }

  // 동적 헤더 제목
  const headerTitle = round
    ? `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}`
    : '지적사항 목록'

  const sortedFindings: LegalFinding[] = [...(findings ?? [])].sort((a, b) => {
    // open 먼저
    if (a.status === 'open' && b.status !== 'open') return -1
    if (a.status !== 'open' && b.status === 'open') return 1
    return b.createdAt.localeCompare(a.createdAt)
  })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      {/* 자체 헤더 */}
      <div style={{
        height: 48,
        background: 'rgba(22,27,34,0.97)',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}>
        <button
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 12,
            width: 36,
            height: 36,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--t1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{headerTitle}</span>
      </div>

      {/* 관리자 전용 서브 헤더 */}
      {role === 'admin' && round && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--bd)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <select
            value={effectiveSelectedResult}
            onChange={e => setSelectedResult(e.target.value)}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--bd2)',
              borderRadius: 8,
              padding: '6px 12px',
              color: 'var(--t1)',
              fontSize: 13,
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">결과 미입력</option>
            <option value="pass">적합</option>
            <option value="fail">부적합</option>
            <option value="conditional">조건부적합</option>
          </select>

          <button
            onClick={handleSaveResult}
            disabled={savingResult}
            style={{
              fontSize: 12,
              fontWeight: 700,
              height: 36,
              background: 'var(--acl)',
              borderRadius: 8,
              padding: '0 12px',
              border: 'none',
              color: '#fff',
              cursor: savingResult ? 'not-allowed' : 'pointer',
              opacity: savingResult ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            결과 저장
          </button>

          <input
            ref={reportInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleReportUpload}
          />

          {round.reportFileKey ? (
            <button
              onClick={() => window.open('/api/uploads/' + round.reportFileKey, '_blank')}
              style={{
                fontSize: 12,
                fontWeight: 700,
                height: 36,
                background: 'var(--bg3)',
                borderRadius: 8,
                padding: '0 12px',
                border: '1px solid var(--bd2)',
                color: 'var(--t1)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              보고서 보기
            </button>
          ) : (
            <button
              onClick={() => reportInputRef.current?.click()}
              disabled={uploadingReport}
              style={{
                fontSize: 12,
                fontWeight: 700,
                height: 36,
                background: 'var(--bg3)',
                borderRadius: 8,
                padding: '0 12px',
                border: '1px solid var(--bd2)',
                color: 'var(--t2)',
                cursor: uploadingReport ? 'not-allowed' : 'pointer',
                opacity: uploadingReport ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              {uploadingReport ? '업로드 중...' : '보고서 업로드'}
            </button>
          )}
        </div>
      )}

      {/* 콘텐츠 영역 */}
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', fontSize: 14, color: 'var(--t2)' }}>
          목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.
        </div>
      ) : (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          paddingBottom: 'calc(72px + var(--sab, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {sortedFindings.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 없음</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>현장에서 지적된 항목을 등록하려면 아래 버튼을 누르세요.</div>
            </div>
          ) : (
            sortedFindings.map(finding => (
              <div
                key={finding.id}
                onClick={() => navigate(`/legal/${id}/finding/${finding.id}`)}
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--bd)',
                  borderLeft: `2px solid ${finding.status === 'open' ? 'var(--danger)' : 'var(--safe)'}`,
                  borderRadius: 12,
                  padding: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {/* Line 1: 지적 내용 + 상태 배지 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {finding.description}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: '2px 8px',
                    flexShrink: 0,
                    background: finding.status === 'open' ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.13)',
                    color: finding.status === 'open' ? 'var(--danger)' : 'var(--safe)',
                  }}>
                    {finding.status === 'open' ? '미조치' : '완료'}
                  </span>
                </div>

                {/* Line 2: 위치 */}
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                  {finding.location ?? '위치 미지정'}
                </div>

                {/* Line 3: 등록일 + 등록자 */}
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                  {fmtDate(finding.createdAt)} · {finding.createdByName ?? finding.createdBy}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 고정 하단 CTA */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg)',
        borderTop: '1px solid var(--bd)',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + var(--sab, 0px))',
        zIndex: 20,
      }}>
        <button
          onClick={() => setShowSheet(true)}
          style={{
            width: '100%',
            height: 48,
            background: 'var(--acl)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          + 지적사항 등록
        </button>
      </div>

      {/* BottomSheet */}
      {showSheet && id && (
        <FindingBottomSheet
          scheduleItemId={id}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  )
}
