// ── 일반 점검 카테고리 완료/미조치 개소 재진입 팝업 ─────────────────
// 소화기 방식 부분 오버레이 스타일 통일 (position:absolute; inset:0; zIndex:10).
// 부모 박스는 반드시 position:relative 여야 한다.

export type RevisitVariant = 'completed' | 'pending-action'

export interface InspectionRevisitPopupProps {
  variant:          RevisitVariant
  checkedAt:        string                                // ISO 또는 'YYYY-MM-DD HH:mm' 로컬
  inspectorName:    string
  recordId?:        string                                // variant='pending-action' 일 때 필요
  onClose:          () => void
  // variant='pending-action' 일 때만 사용됨
  onGoToRemediation?: (recordId: string) => void
}

// 컴포넌트 독립성 유지 — 외부 유틸 import 금지
function fmtDateTime(value: string): string {
  if (!value) return ''
  // 이미 'YYYY-MM-DD HH:mm' 로컬 포맷이면 초 이하만 자르고 반환
  const localLike = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/)
  if (localLike) return `${localLike[1]} ${localLike[2]}`
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  const kst = new Date(d.getTime() + 9 * 3600_000)
  const y  = kst.getUTCFullYear()
  const mo = String(kst.getUTCMonth() + 1).padStart(2, '0')
  const da = String(kst.getUTCDate()).padStart(2, '0')
  const hh = String(kst.getUTCHours()).padStart(2, '0')
  const mi = String(kst.getUTCMinutes()).padStart(2, '0')
  return `${y}-${mo}-${da} ${hh}:${mi}`
}

export function InspectionRevisitPopup({
  variant, checkedAt, inspectorName, recordId, onClose, onGoToRemediation,
}: InspectionRevisitPopupProps) {
  const who = inspectorName || '—'
  const when = fmtDateTime(checkedAt)

  const message = variant === 'completed'
    ? `${when}에 ${who}이 이미 점검한 개소입니다.`
    : `${when}에 ${who}에 의해 조치 대기중인 개소입니다. 조치 내용을 입력하시겠습니까?`

  return (
    <div style={{
      position:'absolute', inset:0, zIndex:10,
      background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:10, padding:20,
    }}>
      <div style={{ fontSize:32 }}>⚠️</div>
      <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', textAlign:'center', lineHeight:1.55 }}>
        {message}
      </div>

      {variant === 'completed' && (
        <button
          onClick={onClose}
          style={{ marginTop:4, padding:'10px 32px', borderRadius:10, border:'none', background:'var(--acl)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}
        >
          확인
        </button>
      )}

      {variant === 'pending-action' && (
        <div style={{ marginTop:4, display:'flex', gap:8 }}>
          <button
            onClick={onClose}
            style={{ padding:'10px 22px', borderRadius:10, background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)', fontSize:13, fontWeight:700, cursor:'pointer' }}
          >
            취소
          </button>
          <button
            onClick={() => { if (recordId) onGoToRemediation?.(recordId) }}
            style={{ padding:'10px 22px', borderRadius:10, border:'none', background:'var(--acl)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}
          >
            이동
          </button>
        </div>
      )}
    </div>
  )
}
