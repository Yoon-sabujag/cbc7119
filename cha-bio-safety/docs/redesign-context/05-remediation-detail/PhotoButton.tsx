import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoSourceModal } from './PhotoSourceModal'

// ── 사진 버튼 UI ───────────────────────────────────────
export function PhotoButton({ hook, label = '사진 첨부', noCapture }: { hook: ReturnType<typeof usePhotoUpload>; label?: string; noCapture?: boolean }) {
  return (
    <div>
      <input ref={hook.cameraRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={hook.handleFile} />
      <input ref={hook.albumRef} type="file" accept="image/*" style={{ display:'none' }} onChange={hook.handleFile} />
      <PhotoSourceModal open={hook.showPicker} onClose={hook.closePicker} onCamera={hook.pickCamera} onAlbum={hook.pickAlbum} />
      {hook.photoPreview ? (
        <div style={{ position:'relative', display:'inline-block' }}>
          <img src={hook.photoPreview} alt="첨부사진" style={{ width:72, height:72, objectFit:'cover', borderRadius:10, border:'1px solid var(--bd)', display:'block' }} />
          <button aria-label="사진 제거" onClick={hook.removePhoto} style={{ position:'absolute', top:-6, right:-6, width:20, height:20, borderRadius:'50%', background:'var(--danger)', border:'none', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>✕</button>
          {hook.uploading && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff' }}>업로드 중</div>}
        </div>
      ) : (
        <button onClick={hook.openPicker} style={{ width:72, height:72, borderRadius:10, background:'var(--bg2)', border:'1px dashed var(--bd2)', color:'var(--t3)', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, flexShrink:0 }}>
          <span style={{ fontSize:22 }}>📷</span>{label}
        </button>
      )}
    </div>
  )
}
