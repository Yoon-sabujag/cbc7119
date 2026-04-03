import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import type { LegalInspection, InspectionType, InspectionResult } from '../types'

// ── 날짜 포매터 ───────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

// ── 인라인 SVG 아이콘 ─────────────────────────────────────────
function IconChevronLeft({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconPdf({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

// ── 스켈레톤 ──────────────────────────────────────────────────
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 타입 배지 ─────────────────────────────────────────────────
function TypeBadge({ type }: { type: InspectionType }) {
  const isComprehensive = type === 'comprehensive'
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 6px',
      borderRadius: 5,
      background: isComprehensive ? 'rgba(14,165,233,0.13)' : 'rgba(249,115,22,0.13)',
      color: isComprehensive ? 'var(--info)' : 'var(--fire)',
      flexShrink: 0,
    }}>
      {isComprehensive ? '종합정밀' : '작동기능'}
    </span>
  )
}

// ── 결과 배지 ─────────────────────────────────────────────────
function ResultBadge({ result }: { result: InspectionResult }) {
  const cfg = {
    pass:        { bg: 'rgba(34,197,94,0.13)',   color: 'var(--safe)',   label: '적합' },
    conditional: { bg: 'rgba(245,158,11,0.13)',  color: 'var(--warn)',   label: '조건부' },
    fail:        { bg: 'rgba(239,68,68,0.13)',   color: 'var(--danger)', label: '부적합' },
  }[result]
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 6px',
      borderRadius: 5,
      background: cfg.bg,
      color: cfg.color,
      flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  )
}

// ── 점검 회차 카드 ────────────────────────────────────────────
function LegalInspectionCard({ item, onClick }: { item: LegalInspection; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--bd)',
        borderRadius: 12,
        padding: 12,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Row 1: TypeBadge + ResultBadge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <TypeBadge type={item.inspectionType} />
        <ResultBadge result={item.result} />
      </div>

      {/* Row 2: agency + date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)' }}>{item.agency}</span>
        <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--t2)' }}>{fmtDate(item.inspectedAt)}</span>
      </div>

      {/* Row 3: finding count + PDF */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--t2)' }}>
          지적 {item.findingCount}건 · {item.resolvedCount}건 완료
        </span>
        {item.reportFileKey && (
          <button
            onClick={e => {
              e.stopPropagation()
              window.open('/api/uploads/' + item.reportFileKey, '_blank')
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--t3)',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
            }}
          >
            <IconPdf size={14} color="var(--t3)" />
            보고서 열기
          </button>
        )}
      </div>
    </div>
  )
}

// ── 점검 등록 BottomSheet (admin only) ───────────────────────
interface CreateInspectionSheetProps {
  onClose: () => void
}

function CreateInspectionSheet({ onClose }: CreateInspectionSheetProps) {
  const queryClient = useQueryClient()
  const { staff } = useAuthStore()
  const [inspectionType, setInspectionType] = useState<InspectionType>('comprehensive')
  const [inspectedAt, setInspectedAt] = useState('')
  const [agency, setAgency] = useState('')
  const [result, setResult] = useState<InspectionResult>('pass')
  const [memo, setMemo] = useState('')
  const [pdfKey, setPdfKey] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [pdfUploading, setPdfUploading] = useState(false)

  const mutation = useMutation({
    mutationFn: () => legalApi.createInspection({
      inspection_type: inspectionType,
      inspected_at: inspectedAt,
      agency: agency.trim(),
      result,
      report_file_key: pdfKey ?? undefined,
      memo: memo.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-inspections'] })
      toast.success('점검 회차가 등록되었습니다')
      onClose()
    },
    onError: () => {
      toast.error('등록에 실패했습니다. 다시 시도해 주세요.')
    },
  })

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPdfUploading(true)
    try {
      const form = new FormData()
      form.append('file', file, file.name)
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
        headers: { Authorization: `Bearer ${staff ? (await import('../stores/authStore')).useAuthStore.getState().token : ''}` },
      })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      if (json.success && json.data) {
        setPdfKey(json.data.key)
        setPdfName(file.name)
        toast.success('PDF가 업로드되었습니다')
      } else {
        toast.error('PDF 업로드에 실패했습니다')
      }
    } catch {
      toast.error('PDF 업로드 중 오류가 발생했습니다')
    } finally {
      setPdfUploading(false)
    }
  }

  const isSubmitting = mutation.isPending
  const canSubmit = inspectedAt && agency.trim() && !isSubmitting

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg3)',
    borderRadius: 8,
    padding: 12,
    border: '1px solid var(--bd2)',
    color: 'var(--t1)',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'Noto Sans KR, sans-serif',
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
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>점검 회차 등록</div>
        </div>

        {/* 폼 */}
        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 점검 유형 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>점검 유형</div>
            <div style={{ display: 'flex', gap: 0, background: 'var(--bg3)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--bd2)' }}>
              {([['comprehensive', '종합정밀점검'], ['functional', '작동기능점검']] as [InspectionType, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setInspectionType(val)}
                  style={{
                    flex: 1,
                    height: 40,
                    background: inspectionType === val ? 'var(--bg4)' : 'transparent',
                    border: 'none',
                    color: inspectionType === val ? 'var(--t1)' : 'var(--t3)',
                    fontSize: 13,
                    fontWeight: inspectionType === val ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 점검일자 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>점검일자</div>
            <input
              type="date"
              value={inspectedAt}
              onChange={e => setInspectedAt(e.target.value)}
              style={{ ...inputStyle, height: 44 }}
            />
          </div>

          {/* 점검기관 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>점검기관</div>
            <input
              type="text"
              value={agency}
              onChange={e => setAgency(e.target.value)}
              placeholder="점검기관명 입력"
              style={{ ...inputStyle, height: 44 }}
            />
          </div>

          {/* 결과 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>결과</div>
            <div style={{ display: 'flex', gap: 0, background: 'var(--bg3)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--bd2)' }}>
              {([['pass', '적합'], ['conditional', '조건부적합'], ['fail', '부적합']] as [InspectionResult, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setResult(val)}
                  style={{
                    flex: 1,
                    height: 40,
                    background: result === val ? 'var(--bg4)' : 'transparent',
                    border: 'none',
                    color: result === val ? 'var(--t1)' : 'var(--t3)',
                    fontSize: 12,
                    fontWeight: result === val ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 비고 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>비고 (선택)</div>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="메모 입력"
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* PDF 업로드 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>결과 보고서</div>
            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={handlePdfUpload}
            />
            {pdfKey && pdfName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--bd2)' }}>
                <IconPdf size={16} color="var(--t2)" />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfName}</span>
                <button
                  onClick={() => { setPdfKey(null); setPdfName(null) }}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '0 4px' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => document.getElementById('pdf-upload-input')?.click()}
                disabled={pdfUploading}
                style={{
                  width: '100%',
                  height: 44,
                  background: 'var(--bg3)',
                  border: '1px dashed var(--bd2)',
                  borderRadius: 8,
                  color: pdfUploading ? 'var(--t3)' : 'var(--t2)',
                  fontSize: 13,
                  cursor: pdfUploading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <IconPdf size={16} color="var(--t3)" />
                {pdfUploading ? '업로드 중...' : '결과 보고서 PDF 업로드'}
              </button>
            )}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--acl)',
              borderRadius: 10,
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor: canSubmit ? 'pointer' : 'default',
              opacity: canSubmit ? 1 : 0.5,
              transition: 'opacity 0.15s',
            }}
          >
            {isSubmitting ? '처리 중...' : '점검 등록'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 48,
              background: 'transparent',
              borderRadius: 10,
              border: '1px solid var(--bd2)',
              color: 'var(--t2)',
              fontWeight: 400,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function LegalPage() {
  const navigate = useNavigate()
  const { staff } = useAuthStore()
  const isAdmin = staff?.role === 'admin'
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['legal-inspections'],
    queryFn: legalApi.listInspections,
    staleTime: 30_000,
  })

  const inspections = data ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>

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
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 8,
            width: 36,
            height: 36,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--t2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconChevronLeft size={20} color="var(--t2)" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>법적 점검</span>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              position: 'absolute',
              right: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--acl)',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            + 점검 등록
          </button>
        )}
      </div>

      {/* 카드 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading && (
          <>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </>
        )}

        {isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14 }}>
            목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.
          </div>
        )}

        {!isLoading && !isError && inspections.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>법적 점검 기록 없음</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>상반기 종합정밀점검 또는 하반기 작동기능점검을 등록하세요.</div>
          </div>
        )}

        {!isLoading && !isError && inspections.map(item => (
          <LegalInspectionCard
            key={item.id}
            item={item}
            onClick={() => navigate('/legal/' + item.id)}
          />
        ))}
      </div>

      {/* 점검 등록 BottomSheet */}
      {showCreate && <CreateInspectionSheet onClose={() => setShowCreate(false)} />}
    </div>
  )
}
