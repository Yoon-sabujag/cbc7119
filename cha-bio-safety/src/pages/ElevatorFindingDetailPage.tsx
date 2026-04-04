import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { elevatorInspectionApi } from '../utils/api'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'

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
export default function ElevatorFindingDetailPage() {
  const { fid } = useParams<{ fid: string }>()
  const [searchParams] = useSearchParams()
  const eid = searchParams.get('eid') ?? ''
  const iid = searchParams.get('iid') ?? ''

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [memo, setMemo] = useState('')
  const resolutionPhoto = usePhotoUpload()

  const { data: findings, isLoading, error } = useQuery({
    queryKey: ['elev-findings', iid],
    queryFn: () => elevatorInspectionApi.getFindings(eid, iid),
    enabled: !!eid && !!iid,
  })

  const finding = findings?.find(f => f.id === fid)

  const resolveMutation = useMutation({
    mutationFn: async () => {
      let photoKey: string | undefined = undefined
      if (resolutionPhoto.hasPhoto) {
        const key = await resolutionPhoto.upload()
        if (key === null) throw new Error('photo upload failed')
        photoKey = key
      }
      return elevatorInspectionApi.resolveFinding(eid, iid, fid!, {
        resolution_memo: memo.trim(),
        resolution_photo_key: photoKey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elev-findings', iid] })
      toast.success('조치 완료')
      navigate(-1)
    },
    onError: () => {
      toast.error('조치 처리 실패')
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
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 상세</span>
      </div>

      {/* 로딩 */}
      {isLoading && <Spinner />}

      {/* 에러 or 없음 */}
      {!isLoading && (error || !finding) && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', fontSize: 14, color: 'var(--t2)' }}>
          항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.
        </div>
      )}

      {/* 콘텐츠 */}
      {!isLoading && finding && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: finding.status === 'open' ? 'calc(72px + var(--sab, 0px))' : 24,
        }}>
          {/* Section 1: 지적 정보 */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <SectionHeader>지적 정보</SectionHeader>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: finding.status === 'open' ? 'rgba(239,68,68,.12)' : 'rgba(34,197,94,.12)',
                color: finding.status === 'open' ? 'var(--danger)' : 'var(--safe)',
              }}>
                {finding.status === 'open' ? '미조치' : '조치완료'}
              </span>
            </div>
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
            {finding.photoKey ? (
              <img
                src={'/api/uploads/' + finding.photoKey}
                alt="지적 사진"
                style={{
                  width: '100%',
                  maxHeight: 240,
                  objectFit: 'cover',
                  borderRadius: 10,
                  border: '1px solid var(--bd)',
                  display: 'block',
                  marginTop: 12,
                }}
              />
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
              {finding.resolutionPhotoKey && (
                <img
                  src={'/api/uploads/' + finding.resolutionPhotoKey}
                  alt="조치 사진"
                  style={{
                    width: '100%',
                    maxHeight: 240,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: '1px solid var(--bd)',
                    display: 'block',
                    marginTop: 12,
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 고정 하단 CTA (open 상태만) */}
      {!isLoading && finding && finding.status === 'open' && (
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
