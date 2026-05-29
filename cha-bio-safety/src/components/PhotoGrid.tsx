import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { useMultiPhotoUpload } from '../hooks/useMultiPhotoUpload'
import { PhotoSourceModal } from './PhotoSourceModal'

// ── 다중 사진 그리드 (썸네일 + 라이트박스) ────────────────────

interface PhotoGridProps {
  photoUrls?: string[]                           // display mode: resolved URLs (e.g. '/api/uploads/key')
  hook?: ReturnType<typeof useMultiPhotoUpload>  // upload mode: hook instance
  label?: string                                 // add-slot label, default '사진 첨부'
}

export function PhotoGrid({ photoUrls, hook, label = '사진 첨부' }: PhotoGridProps) {
  const [lbOpen,  setLbOpen]  = useState(false)
  const [lbIndex, setLbIndex] = useState(0)

  // Build slides from either display URLs or hook slot previews
  const slides = photoUrls
    ? photoUrls.map(src => ({ src }))
    : hook
      ? hook.slots.map(s => ({ src: s.preview }))
      : []

  const hasContent = slides.length > 0 || (hook && hook.canAdd)
  if (!hasContent) return null

  const thumbnails = photoUrls
    ? photoUrls.map((url, i) => ({ url, uploading: false, error: null, isSlot: false, idx: i }))
    : hook
      ? hook.slots.map((s, i) => ({ url: s.preview, uploading: s.uploading, error: s.error, isSlot: true, idx: i }))
      : []

  return (
    <div>
      <div className="flex flex-row overflow-x-auto gap-2 px-[2px] pt-1.5 pb-1">
        {thumbnails.map(({ url, uploading, error, isSlot, idx }) => (
          <div key={url} className="relative shrink-0">
            <img
              src={url}
              alt={`사진 ${idx + 1}`}
              className="w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default cursor-pointer block"
              onClick={() => { setLbIndex(idx); setLbOpen(true) }}
            />
            {isSlot && hook && (
              <button
                aria-label="사진 제거"
                onClick={() => hook.removeSlot(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger-bar border-none text-white text-[11px] font-bold cursor-pointer flex items-center justify-center leading-none"
              >
                ✕
              </button>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)] rounded-[10px] flex items-center justify-center text-[10px] text-white">
                업로드 중
              </div>
            )}
            {error && (
              <div className="text-[11px] text-danger-bar text-center mt-0.5">
                {error}
              </div>
            )}
          </div>
        ))}

        {hook && hook.canAdd && (
          <button
            onClick={hook.openPicker}
            className="w-[72px] h-[72px] rounded-[10px] bg-surface-raised border border-dashed border-border-strong text-text-tertiary text-[11px] font-semibold cursor-pointer shrink-0 flex flex-col items-center justify-center gap-1"
          >
            <span className="text-[22px]">📷</span>
            {label}
          </button>
        )}
      </div>

      {hook && (
        <>
          <input ref={hook.cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={hook.handleFiles} />
          <input ref={hook.albumRef} type="file" accept="image/*" multiple className="hidden" onChange={hook.handleFiles} />
          <PhotoSourceModal open={hook.showPicker} onClose={hook.closePicker} onCamera={hook.pickCamera} onAlbum={hook.pickAlbum} />
        </>
      )}

      <Lightbox
        open={lbOpen}
        close={() => setLbOpen(false)}
        index={lbIndex}
        slides={slides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        render={{
          buttonZoom: () => null,
          iconClose: () => <span className="text-[18px] font-bold">✕</span>,
        }}
        styles={{
          root: { position: 'fixed', inset: 0, zIndex: 9999, '--yarl__color_button': 'rgba(255,255,255,0.9)', '--yarl__toolbar_padding': 'calc(env(safe-area-inset-top, 0px) + 8px) 8px 0', '--yarl__navigation_padding': '0', '--yarl__container_background_color': '#000' } as any,
        }}
      />
    </div>
  )
}
