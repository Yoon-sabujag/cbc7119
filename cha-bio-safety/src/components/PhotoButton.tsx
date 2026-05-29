import { Camera } from 'lucide-react'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoSourceModal } from './PhotoSourceModal'

// ── 사진 버튼 UI ───────────────────────────────────────
export function PhotoButton({ hook, label = '사진 첨부', noCapture }: { hook: ReturnType<typeof usePhotoUpload>; label?: string; noCapture?: boolean }) {
  return (
    <div>
      <input ref={hook.cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={hook.handleFile} />
      <input ref={hook.albumRef} type="file" accept="image/*" className="hidden" onChange={hook.handleFile} />
      <PhotoSourceModal open={hook.showPicker} onClose={hook.closePicker} onCamera={hook.pickCamera} onAlbum={hook.pickAlbum} />
      {hook.photoPreview ? (
        <div className="relative inline-block">
          <img src={hook.photoPreview} alt="첨부사진" className="w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default block" />
          <button aria-label="사진 제거" onClick={hook.removePhoto} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger border-none text-white text-[12px] font-bold cursor-pointer flex items-center justify-center leading-none">✕</button>
          {hook.uploading && <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)] rounded-[10px] flex items-center justify-center text-[12px] text-white">업로드 중</div>}
        </div>
      ) : (
        <button onClick={hook.openPicker} className="w-[72px] h-[72px] rounded-[10px] bg-surface-raised border border-dashed border-border-strong text-text-secondary text-[12px] font-semibold cursor-pointer flex flex-col items-center justify-center gap-1 shrink-0">
          <Camera size={22} />{label}
        </button>
      )}
    </div>
  )
}
