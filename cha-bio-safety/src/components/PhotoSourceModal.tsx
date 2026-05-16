import { useEffect } from 'react'
import { Camera, Image as ImageIcon } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onCamera: () => void
  onAlbum: () => void
}

const btnClass = 'w-full flex items-center gap-3 px-4 py-[14px] mb-2 rounded-xl bg-[var(--surface-sunken)] text-[var(--text-primary)] text-[15px] font-semibold border-0 cursor-pointer hover:bg-[var(--surface-active)] transition-colors'

export function PhotoSourceModal({ open, onClose, onCamera, onAlbum }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-[var(--surface-overlay)]"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[400px] bg-[var(--surface-page)] rounded-t-2xl px-4 pt-5"
        style={{ paddingBottom: 'calc(54px + var(--sab, env(safe-area-inset-bottom, 0px)) + 12px + 16px)' }}
      >
        <div className="text-center text-[14px] font-bold text-[var(--text-primary)] mb-4">
          사진 선택
        </div>
        <button onClick={() => { onCamera(); onClose() }} className={btnClass}>
          <Camera size={20} />
          <span>카메라로 촬영</span>
        </button>
        <button onClick={() => { onAlbum(); onClose() }} className={btnClass}>
          <ImageIcon size={20} />
          <span>앨범에서 선택</span>
        </button>
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center px-4 py-[14px] mt-1 rounded-xl bg-[var(--surface-raised)] text-[var(--text-tertiary)] text-[15px] font-semibold border-0 cursor-pointer hover:bg-[var(--surface-active)] transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
