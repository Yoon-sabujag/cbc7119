import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'

// ── 날짜 포매터 ───────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '-'
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

// ── 스피너 ────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--bd2)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}

// ── 관리자 수정 BottomSheet ───────────────────────────────────
interface EditFindingSheetProps {
  inspectionId: string
  fid: string
  description: string
  location: string | null
  onClose: () => void
}

function EditFindingSheet({ inspectionId, fid, description: initDesc, location: initLoc, onClose }: EditFindingSheetProps) {
  const queryClient = useQueryClient()
  const [description, setDescription] = useState(initDesc)
  const [location, setLocation] = useState(initLoc ?? '')

  const mutation = useMutation({
    mutationFn: () => legalApi.updateFinding(inspectionId, fid, {
      description: description.trim(),
      location: location.trim() || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-finding-detail', fid] })
      queryClient.invalidateQueries({ queryKey: ['legal-findings', inspectionId] })
      toast.success('지적사항이 수정되었습니다')
      onClose()
    },
    onError: () => {
      toast.error('수정에 실패했습니다. 다시 시도해 주세요.')
    },
  })

  const isSubmitting = mutation.isPending
  const canSubmit = description.trim() && !isSubmitting

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
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 수정</div>
        </div>

        {/* 폼 */}
        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>지적 내용</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: 88, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>위치 정보 (선택)</div>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="예: B1F 전기실 동쪽"
              style={{ ...inputStyle, height: 44 }}
            />
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
            }}
          >
            {isSubmitting ? '처리 중...' : '수정 완료'}
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
export default function LegalFindingDetailPage() {
  const { id, fid } = useParams<{ id: string; fid: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { staff } = useAuthStore()
  const isAdmin = staff?.role === 'admin'

  const [resolutionMemo, setResolutionMemo] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const afterPhoto = usePhotoUpload()

  const { data: finding, isLoading, isError } = useQuery({
    queryKey: ['legal-finding-detail', fid],
    queryFn: () => legalApi.getFinding(id!, fid!),
    enabled: !!id && !!fid,
  })

  const resolveMutation = useMutation({
    mutationFn: async () => {
      let resolutionPhotoKey: string | undefined
      if (afterPhoto.hasPhoto) {
        const key = await afterPhoto.upload()
        if (key === null) { toast.error('사진 업로드 실패'); throw new Error('photo upload failed') }
        resolutionPhotoKey = key
      }
      return legalApi.resolveFinding(id!, fid!, {
        resolution_memo: resolutionMemo.trim() || undefined,
        resolution_photo_key: resolutionPhotoKey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-finding-detail', fid] })
      queryClient.invalidateQueries({ queryKey: ['legal-findings', id] })
      queryClient.invalidateQueries({ queryKey: ['legal-inspections'] })
      toast.success('조치 완료로 변경되었습니다')
      setResolutionMemo('')
      afterPhoto.reset()
    },
    onError: (err: any) => {
      if (err?.status === 409) {
        toast.error('이미 조치완료 상태입니다')
      } else {
        toast.error('처리에 실패했습니다. 다시 시도해 주세요.')
      }
    },
  })

  const isSubmitting = resolveMutation.isPending

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
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
          onClick={() => navigate(`/legal/${id}`)}
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
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적 상세</span>
        {isAdmin && finding && (
          <button
            onClick={() => setShowEdit(true)}
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
            수정
          </button>
        )}
      </div>

      {/* 로딩 */}
      {isLoading && <Spinner />}

      {/* 에러 */}
      {isError && !isLoading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', fontSize: 14, color: 'var(--t2)' }}>
          내용을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.
        </div>
      )}

      {/* 콘텐츠 */}
      {!isLoading && !isError && finding && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: finding.status === 'open' ? 'calc(72px + var(--sab, 0px))' : 24,
        }}>
          {/* Section 1: 지적 내용 */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t3)', marginBottom: 12 }}>지적 내용</div>

            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.5, marginBottom: finding.location ? 8 : 12 }}>
              {finding.description}
            </div>

            {finding.location && (
              <span style={{
                display: 'inline-block',
                fontSize: 12,
                color: 'var(--t3)',
                background: 'rgba(255,255,255,0.05)',
                padding: '2px 8px',
                borderRadius: 4,
                marginBottom: 12,
              }}>
                {finding.location}
              </span>
            )}

            {finding.photoKey && (
              <img
                src={'/api/uploads/' + finding.photoKey}
                alt="지적 사진"
                style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 12 }}
              />
            )}

            <div style={{ fontSize: 12, color: 'var(--t2)' }}>
              {finding.createdBy} · {fmtDate(finding.createdAt)}
            </div>
          </div>

          {/* Section 2: 조치 기록 (resolved only) */}
          {finding.status === 'resolved' && (
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>조치 기록</div>

              {finding.resolutionMemo && (
                <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.5, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
                  {finding.resolutionMemo}
                </p>
              )}

              {finding.resolutionPhotoKey && (
                <img
                  src={'/api/uploads/' + finding.resolutionPhotoKey}
                  alt="조치 사진"
                  style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 12 }}
                />
              )}

              <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                {finding.resolvedBy ?? '-'} · {fmtDate(finding.resolvedAt)}
              </div>
            </div>
          )}

          {/* Section 3: 조치 입력 (open only) */}
          {finding.status === 'open' && (
            <div style={{ padding: '20px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>조치 내용 입력</div>

              <textarea
                value={resolutionMemo}
                onChange={e => setResolutionMemo(e.target.value)}
                placeholder="조치 내용을 입력하세요 (선택)"
                style={{
                  width: '100%',
                  minHeight: 72,
                  background: 'var(--bg3)',
                  border: '1px solid var(--bd2)',
                  borderRadius: 8,
                  fontSize: 14,
                  color: 'var(--t1)',
                  padding: 12,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'Noto Sans KR, sans-serif',
                  lineHeight: 1.5,
                  outline: 'none',
                }}
              />
              <div style={{ marginTop: 12 }}>
                <PhotoButton hook={afterPhoto} label="조치 사진" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 고정 하단 CTA (open only) */}
      {!isLoading && !isError && finding && finding.status === 'open' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg)',
          borderTop: '1px solid var(--bd)',
          padding: '12px 16px',
          paddingBottom: 'calc(12px + var(--sab, 0px))',
        }}>
          <button
            onClick={() => resolveMutation.mutate()}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--acl)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              borderRadius: 10,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isSubmitting ? '처리 중...' : '조치완료로 변경'}
          </button>
        </div>
      )}

      {/* 관리자 수정 BottomSheet */}
      {showEdit && finding && id && fid && (
        <EditFindingSheet
          inspectionId={id}
          fid={fid}
          description={finding.description}
          location={finding.location}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
