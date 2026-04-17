import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { useMultiPhotoUpload } from '../hooks/useMultiPhotoUpload'
import { PhotoGrid } from '../components/PhotoGrid'
import { PhotoSourceModal } from '../components/PhotoSourceModal'
import { useAuthStore } from '../stores/authStore'
import { buildMetaTxt } from '../utils/findingDownload'
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
  const [downloading, setDownloading] = useState(false)
  const staff = useAuthStore(s => s.staff)
  const resolutionPhotos = useMultiPhotoUpload()

  const { data: finding, isLoading, error } = useQuery({
    queryKey: ['legal-finding', id, fid],
    queryFn: () => legalApi.getFinding(id!, fid!),
    enabled: !!id && !!fid,
  })

  const resolveMutation = useMutation({
    mutationFn: async () => {
      const photoKeys = await resolutionPhotos.uploadAll()
      return legalApi.resolveFinding(id!, fid!, {
        resolution_memo: memo.trim(),
        resolution_photo_keys: photoKeys.length > 0 ? photoKeys : undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-finding', id, fid] })
      queryClient.invalidateQueries({ queryKey: ['legal-findings', id] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      toast.success('조치 완료')
      resolutionPhotos.reset()
      navigate(-1)
    },
    onError: () => {
      toast.error('조치 처리 실패')
    },
  })

  async function handleDownload() {
    if (!finding) return
    setDownloading(true)
    try {
      const { zipSync } = await import('fflate')
      const files: Record<string, Uint8Array> = {}
      const encoder = new TextEncoder()
      const name = (finding.location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')

      files['내용.txt'] = encoder.encode(buildMetaTxt(finding))

      const photoResults = await Promise.allSettled(
        finding.photoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer()))
      )
      photoResults.forEach((r, j) => {
        if (r.status === 'fulfilled') files[`지적사진-${j + 1}.jpg`] = new Uint8Array(r.value)
      })

      const resResults = await Promise.allSettled(
        finding.resolutionPhotoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer()))
      )
      resResults.forEach((r, j) => {
        if (r.status === 'fulfilled') files[`조치사진-${j + 1}.jpg`] = new Uint8Array(r.value)
      })

      const zipped = zipSync(files, { level: 6 })
      const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `지적사항_${name}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 3000)
      toast.success('다운로드 완료')
    } catch {
      toast.error('다운로드 실패')
    } finally {
      setDownloading(false)
    }
  }

  const handleResolve = () => {
    if (!memo.trim()) {
      toast.error('조치 내용을 입력하세요')
      return
    }
    resolveMutation.mutate()
  }

  const isSubmitting = resolveMutation.isPending || resolutionPhotos.isUploading

  const isDesktop = useIsDesktop()
  const sectionPad = isDesktop ? '20px 32px' : '20px 16px'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

      {/* 모바일 헤더 */}
      {!isDesktop && (
        <div style={{
          height: 48, background: 'rgba(22,27,34,0.97)', borderBottom: '1px solid var(--bd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0,
        }}>
          <button aria-label="뒤로 가기" onClick={() => navigate(-1)} style={{ position: 'absolute', left: 12, width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--t1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적 상세</span>
          {staff?.role === 'admin' && finding && (
            <button aria-label="다운로드" onClick={handleDownload} disabled={downloading} style={{ position: 'absolute', right: 12, width: 36, height: 36, border: 'none', background: 'none', cursor: downloading ? 'not-allowed' : 'pointer', color: 'var(--t1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: downloading ? 0.5 : 1 }}>
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6M5 19h14" /></svg>
            </button>
          )}
        </div>
      )}

      {/* 데스크톱 타이틀 */}
      {isDesktop && (
        <div style={{ padding: '24px 32px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)' }}>지적 상세</div>
          {staff?.role === 'admin' && finding && (
            <button onClick={handleDownload} disabled={downloading} style={{ fontSize: 13, fontWeight: 700, height: 36, background: 'var(--bg3)', borderRadius: 8, padding: '0 16px', border: '1px solid var(--bd2)', color: 'var(--t1)', cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.5 : 1 }}>
              {downloading ? '다운로드 중...' : '다운로드'}
            </button>
          )}
        </div>
      )}

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
          flex: 1, overflowY: 'auto',
          paddingBottom: finding.status === 'open' ? (isDesktop ? 24 : 'calc(72px + var(--sab, 0px))') : 24,
          maxWidth: isDesktop ? 700 : undefined,
        }}>
          {/* Section 1: 지적 정보 */}
          <div style={{ padding: sectionPad, borderBottom: '1px solid var(--bd)' }}>
            <SectionHeader>지적 정보</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <KVRow label="지적 내용"><span style={{ whiteSpace: 'pre-wrap' }}>{finding.description}</span></KVRow>
              <KVRow label="위치">{finding.location ?? '-'}</KVRow>
              <KVRow label="등록일">{fmtDate(finding.createdAt)}</KVRow>
              <KVRow label="등록자">{finding.createdByName ?? finding.createdBy}</KVRow>
            </div>
          </div>

          {/* Section 2: 지적 사진 */}
          <div style={{ padding: sectionPad, borderBottom: '1px solid var(--bd)' }}>
            <SectionHeader>지적 사진</SectionHeader>
            {finding.photoKeys && finding.photoKeys.length > 0 ? (
              <div style={{ marginTop: 8 }}><PhotoGrid photoUrls={finding.photoKeys.map(k => '/api/uploads/' + k)} /></div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 8 }}>사진 없음</div>
            )}
          </div>

          {/* Section 3: 조치 내용 입력 (open) */}
          {finding.status === 'open' && (
            <div style={{ padding: sectionPad, borderBottom: '1px solid var(--bd)' }}>
              <SectionHeader>조치 내용</SectionHeader>
              <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="조치 내용을 입력하세요" rows={3} style={{ width: '100%', background: 'var(--bg3)', borderRadius: 9, padding: '10px 12px', border: '1px solid var(--bd2)', color: 'var(--t1)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical', outline: 'none' }} />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }}>조치 사진 (최대 5장)</div>
                <input ref={resolutionPhotos.cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={resolutionPhotos.handleFiles} />
                <input ref={resolutionPhotos.albumRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={resolutionPhotos.handleFiles} />
                <PhotoSourceModal open={resolutionPhotos.showPicker} onClose={resolutionPhotos.closePicker} onCamera={resolutionPhotos.pickCamera} onAlbum={resolutionPhotos.pickAlbum} />
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {resolutionPhotos.slots.map((slot, i) => (
                    <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={slot.preview} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block' }} />
                      <button aria-label="사진 제거" onClick={() => resolutionPhotos.removeSlot(i)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>✕</button>
                      {slot.uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>업로드 중</div>}
                    </div>
                  ))}
                  {resolutionPhotos.canAdd && (
                    <button onClick={resolutionPhotos.openPicker} style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg3)', border: '1px dashed var(--bd2)', color: 'var(--t3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 22 }}>📷</span>사진 첨부
                    </button>
                  )}
                </div>
              </div>

              {/* 데스크톱: 조치 완료 버튼 인라인 */}
              {isDesktop && (
                <button onClick={handleResolve} disabled={isSubmitting} style={{ marginTop: 16, width: '100%', height: 48, background: 'var(--acl)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 12, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1 }}>
                  {isSubmitting ? '처리 중...' : '조치 완료'}
                </button>
              )}
            </div>
          )}

          {/* Section 4: 조치 완료 (resolved) */}
          {finding.status === 'resolved' && (
            <div style={{ padding: sectionPad, borderBottom: '1px solid var(--bd)' }}>
              <SectionHeader>조치 결과</SectionHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <KVRow label="조치일시">{fmtDate(finding.resolvedAt)}</KVRow>
                <KVRow label="조치자">{finding.resolvedByName ?? finding.resolvedBy ?? '-'}</KVRow>
                <KVRow label="조치 내용"><span style={{ whiteSpace: 'pre-wrap' }}>{finding.resolutionMemo ?? '-'}</span></KVRow>
              </div>
              {finding.resolutionPhotoKeys && finding.resolutionPhotoKeys.length > 0 && (
                <div style={{ marginTop: 12 }}><PhotoGrid photoUrls={finding.resolutionPhotoKeys.map(k => '/api/uploads/' + k)} /></div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 모바일 고정 하단 CTA (open 상태만) */}
      {!isDesktop && !isLoading && !error && finding && finding.status === 'open' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTop: '1px solid var(--bd)', padding: '12px 16px', paddingBottom: 'calc(12px + var(--sab, 0px))' }}>
          <button onClick={handleResolve} disabled={isSubmitting} style={{ width: '100%', height: 48, background: 'var(--acl)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 12, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1, transition: 'opacity 0.15s' }}>
            {isSubmitting ? '처리 중...' : '조치 완료'}
          </button>
        </div>
      )}
    </div>
  )
}
