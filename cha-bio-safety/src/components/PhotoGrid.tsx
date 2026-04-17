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
      <div style={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', gap: 8, padding: '6px 2px 4px' }}>
        {thumbnails.map(({ url, uploading, error, isSlot, idx }) => (
          <div key={url} style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={url}
              alt={`사진 ${idx + 1}`}
              style={{
                width: 72,
                height: 72,
                objectFit: 'cover',
                borderRadius: 10,
                border: '1px solid var(--bd)',
                cursor: 'pointer',
                display: 'block',
              }}
              onClick={() => { setLbIndex(idx); setLbOpen(true) }}
            />
            {isSlot && hook && (
              <button
                aria-label="사진 제거"
                onClick={() => hook.removeSlot(idx)}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
            {uploading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#fff',
              }}>
                업로드 중
              </div>
            )}
            {error && (
              <div style={{ fontSize: 11, color: 'var(--danger)', textAlign: 'center', marginTop: 2 }}>
                {error}
              </div>
            )}
          </div>
        ))}

        {hook && hook.canAdd && (
          <button
            onClick={hook.openPicker}
            style={{
              width: 72,
              height: 72,
              borderRadius: 10,
              background: 'var(--bg2)',
              border: '1px dashed var(--bd2)',
              color: 'var(--t3)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 22 }}>📷</span>
            {label}
          </button>
        )}
      </div>

      {hook && (
        <>
          <input ref={hook.cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={hook.handleFiles} />
          <input ref={hook.albumRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={hook.handleFiles} />
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
          iconClose: () => <span style={{ fontSize: 18, fontWeight: 700 }}>✕</span>,
        }}
        styles={{
          root: { position: 'fixed', inset: 0, zIndex: 9999, '--yarl__color_button': 'rgba(255,255,255,0.9)', '--yarl__toolbar_padding': 'calc(env(safe-area-inset-top, 0px) + 8px) 8px 0', '--yarl__navigation_padding': '0', '--yarl__container_background_color': '#000' } as any,
        }}
      />
    </div>
  )
}
