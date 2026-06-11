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
  const photos = useMultiPhotoUpload('legal-finding')

  const isResolved = finding.status === 'resolved'
  const [resolutionMemo, setResolutionMemo] = useState(finding.resolutionMemo ?? '')
  const [existingResolutionKeys, setExistingResolutionKeys] = useState<string[]>(finding.resolutionPhotoKeys ?? [])
  const resolutionPhotos = useMultiPhotoUpload('legal-finding-resolution')

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
    if (totalCount > 5 || (isResolved && resolutionTotalCount > 5)) {
      toast.error('사진은 최대 5장입니다')
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
  const pad = isDesktopSheet ? '0 24px' : '12px 16px'

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
      <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={lblStyle}>
            지적 내용 <span style={{ color: 'var(--danger)' }}>*</span>
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
          <input ref={photos.cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={photos.handleFiles} />
          <input ref={photos.albumRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={photos.handleFiles} />
          <PhotoSourceModal open={photos.showPicker} onClose={photos.closePicker} onCamera={photos.pickCamera} onAlbum={photos.pickAlbum} restoreCount={photos.vaultPendingCount} onRestore={() => photos.restoreFromVault(Math.max(0, 5 - totalCount))} />
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {existingKeys.map((key) => (
              <div key={key} style={{ position: 'relative', flexShrink: 0 }}>
                <img src={'/api/uploads/' + key} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block' }} />
                <button
                  aria-label="사진 제거"
                  onClick={() => removeExisting(key)}
                  style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                >✕</button>
              </div>
            ))}
            {photos.slots.map((slot, i) => (
              <div key={'new-' + i} style={{ position: 'relative', flexShrink: 0 }}>
                <img src={slot.preview} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block' }} />
                <button
                  aria-label="사진 제거"
                  onClick={() => photos.removeSlot(i)}
                  style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                >✕</button>
                {slot.uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>업로드 중</div>}
              </div>
            ))}
            {canAddMore && (
              <button onClick={photos.openPicker} style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg3)', border: '1px dashed var(--bd2)', color: 'var(--t3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 22 }}>📷</span>사진 첨부
              </button>
            )}
          </div>
        </div>

        {isResolved && (
          <>
            <div style={{ height: 1, background: 'var(--bd)', margin: '4px 0' }} />

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
              <input ref={resolutionPhotos.cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={resolutionPhotos.handleFiles} />
              <input ref={resolutionPhotos.albumRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={resolutionPhotos.handleFiles} />
              <PhotoSourceModal open={resolutionPhotos.showPicker} onClose={resolutionPhotos.closePicker} onCamera={resolutionPhotos.pickCamera} onAlbum={resolutionPhotos.pickAlbum} restoreCount={resolutionPhotos.vaultPendingCount} onRestore={() => resolutionPhotos.restoreFromVault(Math.max(0, 5 - resolutionTotalCount))} />
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {existingResolutionKeys.map((key) => (
                  <div key={key} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={'/api/uploads/' + key} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block' }} />
                    <button
                      aria-label="사진 제거"
                      onClick={() => removeExistingResolution(key)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >✕</button>
                  </div>
                ))}
                {resolutionPhotos.slots.map((slot, i) => (
                  <div key={'newr-' + i} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={slot.preview} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block' }} />
                    <button
                      aria-label="사진 제거"
                      onClick={() => resolutionPhotos.removeSlot(i)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >✕</button>
                    {slot.uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>업로드 중</div>}
                  </div>
                ))}
                {canAddMoreResolution && (
                  <button onClick={resolutionPhotos.openPicker} style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg3)', border: '1px dashed var(--bd2)', color: 'var(--t3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 22 }}>📷</span>사진 첨부
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: isDesktopSheet ? '8px 24px 24px' : '4px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={handleSubmit} disabled={isSubmitting} style={{ width: '100%', height: 48, background: 'var(--acl)', borderRadius: 10, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
          {isSubmitting ? '처리 중...' : '저장'}
        </button>
        <button onClick={onClose} disabled={isSubmitting} style={{ width: '100%', height: 48, background: 'transparent', border: '1px solid var(--bd2)', borderRadius: 10, color: 'var(--t2)', fontSize: 14, cursor: 'pointer' }}>
          취소
        </button>
      </div>
    </>
  )

  if (isDesktopSheet) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: 12, width: 520, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.18)' }}>
          <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 수정</div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg3)', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>✕</button>
          </div>
          {formContent}
        </div>
      </div>
    )
  }

  return (
    <div onClick={onClose} onTouchMove={e => e.stopPropagation()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 50, overscrollBehavior: 'contain' }}>
      <div onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0', animation: 'slideUp 0.28s ease-out both', maxHeight: '90vh', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
        </div>
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 수정</div>
        </div>
        {formContent}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </div>
  )
}
