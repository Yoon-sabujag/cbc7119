import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronLeft, Download, Loader2, Camera } from 'lucide-react'
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
    <div className="flex gap-3 items-start">
      <span className="text-caption text-text-tertiary leading-none flex-shrink-0" style={{ width: 64 }}>{label}</span>
      <span className="text-body-sm text-text-primary flex-1 leading-relaxed">{children}</span>
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-caption font-bold text-text-tertiary leading-none" style={{ marginBottom: 10 }}>
      {children}
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
    <div className="flex-1 flex flex-col bg-surface-page h-full overflow-hidden">

      {/* 모바일 헤더 */}
      {!isDesktop && (
        <div
          className="bg-surface-raised border-b border-border-default flex items-center justify-center relative flex-shrink-0"
          style={{ height: 48 }}
        >
          <button
            aria-label="뒤로 가기"
            onClick={() => navigate(-1)}
            className="text-text-primary"
            style={{ position: 'absolute', left: 8, width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          ><ChevronLeft size={20} /></button>
          <span className="text-body font-bold text-text-primary">지적 상세</span>
          {staff?.role === 'admin' && finding && (
            <button
              aria-label="다운로드"
              onClick={handleDownload}
              disabled={downloading}
              className="text-text-primary"
              style={{ position: 'absolute', right: 8, width: 44, height: 44, border: 'none', background: 'none', cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: downloading ? 0.5 : 1 }}
            ><Download size={18} /></button>
          )}
        </div>
      )}

      {/* 데스크톱 타이틀 */}
      {isDesktop && (
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: '24px 32px 12px' }}
        >
          <div className="text-text-primary" style={{ fontSize: 22, fontWeight: 800 }}>지적 상세</div>
          {staff?.role === 'admin' && finding && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-surface-sunken border border-border-strong text-text-primary text-caption font-bold leading-none rounded-sm"
              style={{ height: 36, padding: '0 16px', cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.5 : 1 }}
            >
              {downloading ? '다운로드 중...' : '다운로드'}
            </button>
          )}
        </div>
      )}

      {/* 로딩 */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      )}

      {/* 에러 */}
      {error && !isLoading && (
        <div
          className="flex-1 flex items-center justify-center text-center text-body-sm text-text-secondary"
          style={{ padding: '0 24px' }}
        >
          항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.
        </div>
      )}

      {/* 콘텐츠 */}
      {!isLoading && !error && finding && (
        <div
          className="flex-1 overflow-y-auto"
          style={{
            paddingBottom: finding.status === 'open' ? (isDesktop ? 24 : 'calc(72px + var(--sab, 0px))') : 24,
            maxWidth: isDesktop ? 700 : undefined,
          }}
        >
          {/* Section 1: 지적 정보 */}
          <div className="border-b border-border-default" style={{ padding: sectionPad }}>
            <SectionHeader>지적 정보</SectionHeader>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <KVRow label="지적 내용"><span style={{ whiteSpace: 'pre-wrap' }}>{finding.description}</span></KVRow>
              <KVRow label="위치">{finding.location ?? '-'}</KVRow>
              <KVRow label="등록일">{fmtDate(finding.createdAt)}</KVRow>
              <KVRow label="등록자">{finding.createdByName ?? finding.createdBy}</KVRow>
            </div>
          </div>

          {/* Section 2: 지적 사진 */}
          <div className="border-b border-border-default" style={{ padding: sectionPad }}>
            <SectionHeader>지적 사진</SectionHeader>
            {finding.photoKeys && finding.photoKeys.length > 0 ? (
              <div style={{ marginTop: 8 }}><PhotoGrid photoUrls={finding.photoKeys.map(k => '/api/uploads/' + k)} /></div>
            ) : (
              <div className="text-body-sm text-text-tertiary" style={{ marginTop: 8 }}>사진 없음</div>
            )}
          </div>

          {/* Section 3: 조치 내용 입력 (open) */}
          {finding.status === 'open' && (
            <div className="border-b border-border-default" style={{ padding: sectionPad }}>
              <SectionHeader>조치 내용</SectionHeader>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="조치 내용을 입력하세요"
                rows={3}
                className="bg-surface-sunken border border-border-strong text-text-primary text-body-sm rounded-sm"
                style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical', outline: 'none' }}
              />
              <div style={{ marginTop: 12 }}>
                <div className="text-caption font-bold text-text-tertiary leading-none" style={{ marginBottom: 6 }}>조치 사진 (최대 5장)</div>
                <input ref={resolutionPhotos.cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={resolutionPhotos.handleFiles} />
                <input ref={resolutionPhotos.albumRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={resolutionPhotos.handleFiles} />
                <PhotoSourceModal open={resolutionPhotos.showPicker} onClose={resolutionPhotos.closePicker} onCamera={resolutionPhotos.pickCamera} onAlbum={resolutionPhotos.pickAlbum} />
                <div className="flex overflow-x-auto" style={{ gap: 8, paddingBottom: 4 }}>
                  {resolutionPhotos.slots.map((slot, i) => (
                    <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={slot.preview} alt="" className="border border-border-default" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                      <button
                        aria-label="사진 제거"
                        onClick={() => resolutionPhotos.removeSlot(i)}
                        className="bg-danger-bar rounded-full text-text-on-accent text-caption font-bold leading-none flex items-center justify-center"
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, border: 'none', cursor: 'pointer' }}
                      >✕</button>
                      {slot.uploading && (
                        <div
                          className="absolute inset-0 flex items-center justify-center text-caption leading-none text-text-on-accent"
                          style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10 }}
                        >업로드 중</div>
                      )}
                    </div>
                  ))}
                  {resolutionPhotos.canAdd && (
                    <button
                      onClick={resolutionPhotos.openPicker}
                      className="bg-surface-sunken border border-dashed border-border-strong text-text-tertiary text-caption font-bold leading-none flex flex-col items-center justify-center flex-shrink-0"
                      style={{ width: 72, height: 72, borderRadius: 10, cursor: 'pointer', gap: 4 }}
                    >
                      <Camera size={22} />사진 첨부
                    </button>
                  )}
                </div>
              </div>

              {/* 데스크톱: 조치 완료 버튼 인라인 */}
              {isDesktop && (
                <button
                  onClick={handleResolve}
                  disabled={isSubmitting}
                  className="w-full text-text-on-accent text-body font-bold rounded-md"
                  style={{ marginTop: 16, height: 48, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1, background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}
                >
                  {isSubmitting ? '처리 중...' : '조치 완료'}
                </button>
              )}
            </div>
          )}

          {/* Section 4: 조치 완료 (resolved) */}
          {finding.status === 'resolved' && (
            <div className="border-b border-border-default" style={{ padding: sectionPad }}>
              <SectionHeader>조치 결과</SectionHeader>
              <div className="flex flex-col" style={{ gap: 8 }}>
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
        <div
          className="bg-surface-page border-t border-border-default"
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', paddingBottom: 'calc(12px + var(--sab, 0px))' }}
        >
          <button
            onClick={handleResolve}
            disabled={isSubmitting}
            className="w-full text-text-on-accent text-body font-bold rounded-md"
            style={{ height: 48, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1, transition: 'opacity 0.15s', background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}
          >
            {isSubmitting ? '처리 중...' : '조치 완료'}
          </button>
        </div>
      )}
    </div>
  )
}
