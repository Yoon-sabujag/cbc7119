import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
import { PhotoGrid } from '../components/PhotoGrid'
import type { LegalFinding } from '../types'

// ── 날짜 포매터 ──────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// ── KVRow ──────────────────────────────────────────────────────────
function KVRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: 'var(--t3)', width: 64, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--t1)', flex: 1, lineHeight: 1.5 }}>{children}</span>
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 10 }}>
      {children}
    </div>
  )
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

// ── 메인 페이지 ───────────────────────────────────────────────────
export default function LegalFindingDetailPage() {
  const { id, fid } = useParams<{ id: string; fid: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [memo, setMemo] = useState('')
  const resolutionPhoto = usePhotoUpload()
  const beforePhoto = usePhotoUpload()

  const { data: finding, isLoading, error } = useQuery({
    queryKey: ['legal-finding', id, fid],
    queryFn: () => legalApi.getFinding(id!, fid!),
    enabled: !!id && !!fid,
  })

  const resolveMutation = useMutation({
    mutationFn: async () => {
      let photoKey: string | undefined = undefined
      if (resolutionPhoto.hasPhoto) {
        const key = await resolutionPhoto.upload()
        if (key === null) throw new Error('photo upload failed')
        photoKey = key
      }
      return legalApi.resolveFinding(id!, fid!, {
        resolution_memo: memo.trim(),
        resolution_photo_key: photoKey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-finding', id, fid] })
      queryClient.invalidateQueries({ queryKey: ['legal-findings', id] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      toast.success('조치 완료')
      navigate(-1)
    },
    onError: () => {
      toast.error('조치 처리 실패')
    },
  })

  const updateBeforePhotoMutation = useMutation({
    mutationFn: async () => {
      const key = await beforePhoto.upload()
      if (key === null) throw new Error('photo upload failed')
      return legalApi.updateFinding(id!, fid!, { photo_key: key })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-finding', id, fid] })
      toast.success('사진이 저장되었습니다.')
      beforePhoto.reset()
    },
    onError: () => {
      toast.error('사진 업로드 실패')
    },
  })

  const handleResolve = () => {
    if (!memo.trim()) {
      toast.error('조치 내용을 입력하세요')
      return
    }
    resolveMutation.mutate()
  }

  const isSubmitting = resolveMutation.isPending

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

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
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적 상세</span>
      </div>

      {/* 로딩 */}
      {isLoading && <Spinner />}

      {/* 에러 */}
      {error && !isLoading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', fontSize: 14, color: 'var(--t2)' }}>
          항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.
        </div>
      )}

      {/* 콘텐츠 */}
      {!isLoading && !error && finding && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: finding.status === 'open' ? 'calc(72px + var(--sab, 0px))' : 24,
        }}>
          {/* Section 1: 지적 정보 */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
            <SectionHeader>지적 정보</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <KVRow label="지적 내용">
                <span style={{ whiteSpace: 'pre-wrap' }}>{finding.description}</span>
              </KVRow>
              <KVRow label="위치">{finding.location ?? '-'}</KVRow>
              <KVRow label="등록일">{fmtDate(finding.createdAt)}</KVRow>
              <KVRow label="등록자">{finding.createdByName ?? finding.createdBy}</KVRow>
            </div>
          </div>

          {/* Section 2: 지적 사진 */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
            <SectionHeader>지적 사진</SectionHeader>
            {finding.photoKeys && finding.photoKeys.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <PhotoGrid photoUrls={finding.photoKeys.map(k => '/api/uploads/' + k)} />
              </div>
            ) : finding.status === 'open' ? (
              <div style={{ marginTop: 8 }}>
                <PhotoButton hook={beforePhoto} label="지적 사진" noCapture />
                {beforePhoto.hasPhoto && (
                  <button
                    onClick={() => updateBeforePhotoMutation.mutate()}
                    disabled={updateBeforePhotoMutation.isPending}
                    style={{
                      marginTop: 8,
                      padding: '6px 12px',
                      background: 'var(--bg3)',
                      border: '1px solid var(--bd2)',
                      borderRadius: 8,
                      color: 'var(--t2)',
                      fontSize: 12,
                      cursor: updateBeforePhotoMutation.isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {updateBeforePhotoMutation.isPending ? '저장 중...' : '사진 저장'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 8 }}>사진 없음</div>
            )}
          </div>

          {/* Section 3: 조치 내용 입력 (open 상태만) */}
          {finding.status === 'open' && (
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
              <SectionHeader>조치 내용</SectionHeader>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="조치 내용을 입력하세요"
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--bg3)',
                  borderRadius: 8,
                  padding: 12,
                  border: '1px solid var(--bd2)',
                  color: 'var(--t1)',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  fontFamily: 'Noto Sans KR, sans-serif',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
              <div style={{ marginTop: 12 }}>
                <PhotoButton hook={resolutionPhoto} label="조치 사진" noCapture />
              </div>
            </div>
          )}

          {/* Section 4: 조치 완료 (resolved 상태만) */}
          {finding.status === 'resolved' && (
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
              <SectionHeader>조치 결과</SectionHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <KVRow label="조치일시">{fmtDate(finding.resolvedAt)}</KVRow>
                <KVRow label="조치자">{finding.resolvedByName ?? finding.resolvedBy ?? '-'}</KVRow>
                <KVRow label="조치 내용">
                  <span style={{ whiteSpace: 'pre-wrap' }}>{finding.resolutionMemo ?? '-'}</span>
                </KVRow>
              </div>
              {finding.resolutionPhotoKeys && finding.resolutionPhotoKeys.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <PhotoGrid photoUrls={finding.resolutionPhotoKeys.map(k => '/api/uploads/' + k)} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 고정 하단 CTA (open 상태만) */}
      {!isLoading && !error && finding && finding.status === 'open' && (
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
            onClick={handleResolve}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--acl)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              borderRadius: 12,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isSubmitting ? '처리 중...' : '조치 완료'}
          </button>
        </div>
      )}
    </div>
  )
}
