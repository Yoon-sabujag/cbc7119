import { useEffect } from 'react'

// ── 사진 소스 선택 바텀시트 ───────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
  onCamera: () => void
  onAlbum: () => void
}

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  border: 'none', background: 'var(--bg3)', color: 'var(--t1)',
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
}

export function PhotoSourceModal({ open, onClose, onCamera, onAlbum }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 400, background: 'var(--bg)',
        borderRadius: '16px 16px 0 0',
        paddingTop: 20, paddingLeft: 16, paddingRight: 16,
        paddingBottom: 'calc(54px + var(--sab, env(safe-area-inset-bottom, 0px)) + 12px + 16px)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 16, textAlign: 'center' }}>
          사진 선택
        </div>
        <button onClick={() => { onCamera(); onClose() }} style={btnStyle}>
          <span style={{ fontSize: 20 }}>📷</span>
          <span>카메라로 촬영</span>
        </button>
        <button onClick={() => { onAlbum(); onClose() }} style={btnStyle}>
          <span style={{ fontSize: 20 }}>🖼️</span>
          <span>앨범에서 선택</span>
        </button>
        <button onClick={onClose} style={{
          ...btnStyle, marginTop: 4, justifyContent: 'center',
          color: 'var(--t3)', background: 'var(--bg2)',
        }}>
          취소
        </button>
      </div>
    </div>
  )
}
