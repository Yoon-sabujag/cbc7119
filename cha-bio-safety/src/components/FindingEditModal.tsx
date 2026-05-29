import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { useMultiPhotoUpload } from '../hooks/useMultiPhotoUpload'
import { PhotoSourceModal } from './PhotoSourceModal'
import type { LegalFinding } from '../types'

interface Props {
  scheduleItemId: string
  finding: LegalFinding
  onClose: () => void
}

export function FindingEditModal({ scheduleItemId, finding, onClose }: Props) {
  const queryClient = useQueryClient()
  const [description, setDescription] = useState(finding.description)
  const [location, setLocation] = useState(finding.location ?? '')
  const [existingKeys, setExistingKeys] = useState<string[]>(finding.photoKeys ?? [])
  const photos = useMultiPhotoUpload()

  const isResolved = finding.status === 'resolved'
  const [resolutionMemo, setResolutionMemo] = useState(finding.resolutionMemo ?? '')
  const [existingResolutionKeys, setExistingResolutionKeys] = useState<string[]>(finding.resolutionPhotoKeys ?? [])
  const resolutionPhotos = useMultiPhotoUpload()

  const totalCount = existingKeys.length + photos.slots.length
  const canAddMore = totalCount < 5
  const resolutionTotalCount = existingResolutionKeys.length + resolutionPhotos.slots.length
  const canAddMoreResolution = resolutionTotalCount < 5

  const mutation = useMutation({
    mutationFn: async () => {
      const newKeys = await photos.uploadAll()
      const merged = [...existingKeys, ...newKeys].slice(0, 5)
      const body: Record<string, any> = {
        description: description.trim(),
        location: location.trim() || null,
        photo_keys: merged,
      }
      if (isResolved) {
        const newResolutionKeys = await resolutionPhotos.uploadAll()
        const mergedResolution = [...existingResolutionKeys, ...newResolutionKeys].slice(0, 5)
        body.resolution_memo = resolutionMemo.trim() || null
        body.resolution_photo_keys = mergedResolution
      }
      return legalApi.updateFinding(scheduleItemId, finding.id, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-findings', scheduleItemId] })
      queryClient.invalidateQueries({ queryKey: ['legal-finding', scheduleItemId, finding.id] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', scheduleItemId] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      toast.success('지적사항이 수정되었습니다.')
      photos.reset()
      resolutionPhotos.reset()
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.message ?? '수정에 실패했습니다.')
    },
  })

  const isSubmitting = mutation.isPending || photos.isUploading || resolutionPhotos.isUploading

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('지적 내용을 입력하세요')
      return
    }
    mutation.mutate()
  }

  const removeExisting = (key: string) => {
    setExistingKeys(prev => prev.filter(k => k !== key))
  }

  const removeExistingResolution = (key: string) => {
    setExistingResolutionKeys(prev => prev.filter(k => k !== key))
  }

  const isDesktopSheet = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

  const lblStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }
  const inputStyle: React.CSSProperties = {
    background: 'var(--bg3)',
    borderRadius: 9,
    padding: '10px 12px',
    border: '1px solid var(--bd2)',
    width: '100%',
    color: 'var(--t1)',
    fontSize: 13,
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    minWidth: 0,
    WebkitAppearance: 'none',
    appearance: 'none',
  }

  const formContent = (
    <>
      <div className={`flex flex-col gap-3.5 ${isDesktopSheet ? 'px-6' : 'py-3 px-4'}`}>
        <div>
          <div style={lblStyle}>
            지적 내용 <span className="text-danger-bar">*</span>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="지적 내용을 입력하세요"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <div style={lblStyle}>위치</div>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="예: 연구동 6F 606c-1"
            style={inputStyle}
          />
        </div>

        <div>
          <div style={lblStyle}>지적 사진 (최대 5장 · 현재 {totalCount}장)</div>
          <input ref={photos.cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={photos.handleFiles} />
          <input ref={photos.albumRef} type="file" accept="image/*" multiple className="hidden" onChange={photos.handleFiles} />
          <PhotoSourceModal open={photos.showPicker} onClose={photos.closePicker} onCamera={photos.pickCamera} onAlbum={photos.pickAlbum} />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {existingKeys.map((key) => (
              <div key={key} className="relative shrink-0">
                <img src={'/api/uploads/' + key} alt="" className="w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default block" />
                <button
                  aria-label="사진 제거"
                  onClick={() => removeExisting(key)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger-bar border-0 text-white text-[11px] font-bold cursor-pointer flex items-center justify-center leading-none"
                >✕</button>
              </div>
            ))}
            {photos.slots.map((slot, i) => (
              <div key={'new-' + i} className="relative shrink-0">
                <img src={slot.preview} alt="" className="w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default block" />
                <button
                  aria-label="사진 제거"
                  onClick={() => photos.removeSlot(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger-bar border-0 text-white text-[11px] font-bold cursor-pointer flex items-center justify-center leading-none"
                >✕</button>
                {slot.uploading && <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)] rounded-[10px] flex items-center justify-center text-[10px] text-white">업로드 중</div>}
              </div>
            ))}
            {canAddMore && (
              <button onClick={photos.openPicker} className="w-[72px] h-[72px] rounded-[10px] bg-surface-sunken border border-dashed border-border-strong text-text-tertiary text-[11px] font-semibold cursor-pointer flex flex-col items-center justify-center gap-1 shrink-0">
                <span className="text-[22px]">📷</span>사진 첨부
              </button>
            )}
          </div>
        </div>

        {isResolved && (
          <>
            <div className="h-px bg-border-default my-1" />

            <div>
              <div style={lblStyle}>조치 내용</div>
              <textarea
                value={resolutionMemo}
                onChange={e => setResolutionMemo(e.target.value)}
                placeholder="조치 내용을 입력하세요"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div>
              <div style={lblStyle}>조치 사진 (최대 5장 · 현재 {resolutionTotalCount}장)</div>
              <input ref={resolutionPhotos.cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={resolutionPhotos.handleFiles} />
              <input ref={resolutionPhotos.albumRef} type="file" accept="image/*" multiple className="hidden" onChange={resolutionPhotos.handleFiles} />
              <PhotoSourceModal open={resolutionPhotos.showPicker} onClose={resolutionPhotos.closePicker} onCamera={resolutionPhotos.pickCamera} onAlbum={resolutionPhotos.pickAlbum} />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {existingResolutionKeys.map((key) => (
                  <div key={key} className="relative shrink-0">
                    <img src={'/api/uploads/' + key} alt="" className="w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default block" />
                    <button
                      aria-label="사진 제거"
                      onClick={() => removeExistingResolution(key)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger-bar border-0 text-white text-[11px] font-bold cursor-pointer flex items-center justify-center leading-none"
                    >✕</button>
                  </div>
                ))}
                {resolutionPhotos.slots.map((slot, i) => (
                  <div key={'newr-' + i} className="relative shrink-0">
                    <img src={slot.preview} alt="" className="w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default block" />
                    <button
                      aria-label="사진 제거"
                      onClick={() => resolutionPhotos.removeSlot(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger-bar border-0 text-white text-[11px] font-bold cursor-pointer flex items-center justify-center leading-none"
                    >✕</button>
                    {slot.uploading && <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)] rounded-[10px] flex items-center justify-center text-[10px] text-white">업로드 중</div>}
                  </div>
                ))}
                {canAddMoreResolution && (
                  <button onClick={resolutionPhotos.openPicker} className="w-[72px] h-[72px] rounded-[10px] bg-surface-sunken border border-dashed border-border-strong text-text-tertiary text-[11px] font-semibold cursor-pointer flex flex-col items-center justify-center gap-1 shrink-0">
                    <span className="text-[22px]">📷</span>사진 첨부
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`flex flex-col gap-2 ${isDesktopSheet ? 'pt-2 px-6 pb-6' : 'pt-1 px-4 pb-8'}`}>
        <button onClick={handleSubmit} disabled={isSubmitting} className={`w-full h-12 bg-accent rounded-[10px] border-0 text-white font-bold text-[14px] ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}>
          {isSubmitting ? '처리 중...' : '저장'}
        </button>
        <button onClick={onClose} disabled={isSubmitting} className="w-full h-12 bg-transparent border border-border-strong rounded-[10px] text-text-secondary text-[14px] cursor-pointer">
          취소
        </button>
      </div>
    </>
  )

  if (isDesktopSheet) {
    return (
      <div onClick={onClose} className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
        <div onClick={e => e.stopPropagation()} className="bg-surface-raised rounded-xl w-[520px] max-h-[85vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,.18)]">
          <div className="pt-5 px-6 pb-3 flex items-center justify-between">
            <div className="text-[16px] font-bold text-text-primary">지적사항 수정</div>
            <button onClick={onClose} className="w-[28px] h-[28px] rounded-[7px] bg-surface-sunken border-0 text-text-secondary cursor-pointer flex items-center justify-center text-[15px]">✕</button>
          </div>
          {formContent}
        </div>
      </div>
    )
  }

  return (
    <div onClick={onClose} onTouchMove={e => e.stopPropagation()} className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex flex-col justify-end z-50 overscroll-contain">
      <div onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} className="bg-surface-raised rounded-t-[16px] max-h-[90vh] overflow-y-auto overscroll-contain" style={{ animation: 'slideUp 0.28s ease-out both' }}>
        <div className="flex justify-center pt-3">
          <div className="w-[32px] h-1 bg-border-strong rounded-[2px]" />
        </div>
        <div className="pt-3 px-4">
          <div className="text-[16px] font-bold text-text-primary">지적사항 수정</div>
        </div>
        {formContent}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </div>
  )
}
