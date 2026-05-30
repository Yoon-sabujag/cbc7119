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
      <span className="text-caption text-text-tertiary leading-none flex-shrink-0 w-[64px]">{label}</span>
      <span className="text-body-sm text-text-primary flex-1 leading-relaxed">{children}</span>
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-caption font-bold text-text-tertiary leading-none mb-[10px]">
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

  // 라운드 제출 상태 — 제출 완료(종결) 시 조치(신규 등록) 잠금
  const { data: round } = useQuery({
    queryKey: ['legal-round', id],
    queryFn: () => legalApi.get(id!),
    enabled: !!id,
  })
  const isLocked = round?.submissionStatus === 'completed'

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
  const sectionPadCls = isDesktop ? 'px-7 py-5' : 'px-4 py-5'

  return (
    <div className="flex-1 flex flex-col bg-surface-page h-full overflow-hidden">

      {/* 모바일 헤더 */}
      {!isDesktop && (
        <div
          className="bg-surface-raised border-b border-border-default flex items-center justify-center relative flex-shrink-0 h-8"
        >
          <button
            aria-label="뒤로 가기"
            onClick={() => navigate(-1)}
            className="text-text-primary absolute left-2 w-[44px] h-[44px] border-0 bg-transparent cursor-pointer flex items-center justify-center"
          ><ChevronLeft size={20} /></button>
          <span className="text-body font-bold text-text-primary">지적 상세</span>
          {staff?.role === 'admin' && finding && (
            <button
              aria-label="다운로드"
              onClick={handleDownload}
              disabled={downloading}
              className={`text-text-primary absolute right-2 w-[44px] h-[44px] border-0 bg-transparent flex items-center justify-center ${downloading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
            ><Download size={18} /></button>
          )}
        </div>
      )}

      {/* 데스크톱 타이틀 */}
      {isDesktop && (
        <div
          className="flex items-center justify-between flex-shrink-0 pt-6 px-7 pb-3"
        >
          <div className="text-text-primary text-[22px] font-extrabold">지적 상세</div>
          {staff?.role === 'admin' && finding && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`bg-surface-sunken border border-border-strong text-text-primary text-caption font-bold leading-none rounded-sm h-[36px] px-4 ${downloading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
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
          className="flex-1 flex items-center justify-center text-center text-body-sm text-text-secondary px-6"
        >
          항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.
        </div>
      )}

      {/* 콘텐츠 */}
      {!isLoading && !error && finding && (
        <div
          className={`flex-1 overflow-y-auto ${isDesktop ? 'max-w-[700px] pb-6' : (finding.status === 'open' && !isLocked ? 'pb-[calc(72px+var(--sab,0px))]' : 'pb-6')}`}
        >
          {/* Section 1: 지적 정보 */}
          <div className={`border-b border-border-default ${sectionPadCls}`}>
            <SectionHeader>지적 정보</SectionHeader>
            <div className="flex flex-col gap-2">
              <KVRow label="지적 내용"><span className="whitespace-pre-wrap">{finding.description}</span></KVRow>
              <KVRow label="위치">{finding.location ?? '-'}</KVRow>
              <KVRow label="등록일">{fmtDate(finding.createdAt)}</KVRow>
              <KVRow label="등록자">{finding.createdByName ?? finding.createdBy}</KVRow>
            </div>
          </div>

          {/* Section 2: 지적 사진 */}
          <div className={`border-b border-border-default ${sectionPadCls}`}>
            <SectionHeader>지적 사진</SectionHeader>
            {finding.photoKeys && finding.photoKeys.length > 0 ? (
              <div className="mt-2"><PhotoGrid photoUrls={finding.photoKeys.map(k => '/api/uploads/' + k)} /></div>
            ) : (
              <div className="text-body-sm text-text-tertiary mt-2">사진 없음</div>
            )}
          </div>

          {/* 제출 완료 잠금 안내 (open + locked) */}
          {finding.status === 'open' && isLocked && (
            <div className={`bg-safe-bg text-safe text-caption font-bold border-b border-border-default text-center ${sectionPadCls}`}>
              제출 완료된 점검 — 조치 등록·수정 불가
            </div>
          )}

          {/* Section 3: 조치 내용 입력 (open + 미잠금) */}
          {finding.status === 'open' && !isLocked && (
            <div className={`border-b border-border-default ${sectionPadCls}`}>
              <SectionHeader>조치 내용</SectionHeader>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="조치 내용을 입력하세요"
                rows={3}
                className="bg-surface-sunken border border-border-strong text-text-primary text-body-sm rounded-sm w-full px-3 py-[10px] box-border leading-[1.5] resize-y outline-none"
                style={{ fontFamily: 'inherit' }}
              />
              <div className="mt-3">
                <div className="text-caption font-bold text-text-tertiary leading-none mb-[6px]">조치 사진 (최대 5장)</div>
                <input ref={resolutionPhotos.cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={resolutionPhotos.handleFiles} />
                <input ref={resolutionPhotos.albumRef} type="file" accept="image/*" multiple className="hidden" onChange={resolutionPhotos.handleFiles} />
                <PhotoSourceModal open={resolutionPhotos.showPicker} onClose={resolutionPhotos.closePicker} onCamera={resolutionPhotos.pickCamera} onAlbum={resolutionPhotos.pickAlbum} />
                <div className="flex overflow-x-auto gap-2 pb-1">
                  {resolutionPhotos.slots.map((slot, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      <img src={slot.preview} alt="" className="border border-border-default w-[72px] h-[72px] object-cover rounded-[10px] block" />
                      <button
                        aria-label="사진 제거"
                        onClick={() => resolutionPhotos.removeSlot(i)}
                        className="bg-danger-bar rounded-full text-text-on-accent text-caption font-bold leading-none flex items-center justify-center absolute -top-[6px] -right-[6px] w-5 h-5 border-0 cursor-pointer"
                      >✕</button>
                      {slot.uploading && (
                        <div
                          className="absolute inset-0 flex items-center justify-center text-caption leading-none text-text-on-accent rounded-[10px]"
                          style={{ background: 'rgba(0,0,0,0.4)' }}
                        >업로드 중</div>
                      )}
                    </div>
                  ))}
                  {resolutionPhotos.canAdd && (
                    <button
                      onClick={resolutionPhotos.openPicker}
                      className="bg-surface-sunken border border-dashed border-border-strong text-text-tertiary text-caption font-bold leading-none flex flex-col items-center justify-center flex-shrink-0 w-[72px] h-[72px] rounded-[10px] cursor-pointer gap-1"
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
                  className={`w-full text-text-on-accent text-body font-bold rounded-md mt-4 h-8 border-0 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}
                >
                  {isSubmitting ? '처리 중...' : '조치 완료'}
                </button>
              )}
            </div>
          )}

          {/* Section 4: 조치 완료 (resolved) */}
          {finding.status === 'resolved' && (
            <div className={`border-b border-border-default ${sectionPadCls}`}>
              <SectionHeader>조치 결과</SectionHeader>
              <div className="flex flex-col gap-2">
                <KVRow label="조치일시">{fmtDate(finding.resolvedAt)}</KVRow>
                <KVRow label="조치자">{finding.resolvedByName ?? finding.resolvedBy ?? '-'}</KVRow>
                <KVRow label="조치 내용"><span className="whitespace-pre-wrap">{finding.resolutionMemo ?? '-'}</span></KVRow>
              </div>
              {finding.resolutionPhotoKeys && finding.resolutionPhotoKeys.length > 0 && (
                <div className="mt-3"><PhotoGrid photoUrls={finding.resolutionPhotoKeys.map(k => '/api/uploads/' + k)} /></div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 모바일 고정 하단 CTA (open + 미잠금) */}
      {!isDesktop && !isLoading && !error && finding && finding.status === 'open' && !isLocked && (
        <div
          className="bg-surface-page border-t border-border-default fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[calc(12px+var(--sab,0px))]"
        >
          <button
            onClick={handleResolve}
            disabled={isSubmitting}
            className={`w-full text-text-on-accent text-body font-bold rounded-md h-8 border-0 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
            style={{ transition: 'opacity 0.15s', background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}
          >
            {isSubmitting ? '처리 중...' : '조치 완료'}
          </button>
        </div>
      )}
    </div>
  )
}
