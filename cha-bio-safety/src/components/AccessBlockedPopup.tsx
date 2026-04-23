// ── 접근불가 개소 안내 팝업 ──────────────────────────────
// InspectionRevisitPopup 와 동일한 부분 오버레이 스타일 (position:absolute; inset:0; zIndex:10).
// 부모 박스는 반드시 position:relative 여야 한다.
// 자동 스킵 대신 "접근 불가 개소입니다" 안내 → 확인 시 다음 미점검 개소로 자동 이동.
// 사용자는 확인 버튼 외에도 스와이프 / 이전·이후 화살표로도 스킵 가능 (피커 자체는 상위 레이어).

export interface AccessBlockedPopupProps {
  onConfirm: () => void
}

export function AccessBlockedPopup({ onConfirm }: AccessBlockedPopupProps) {
  return (
    <div style={{
      position:'absolute', inset:0, zIndex:10,
      background:'var(--bg2)', border:'1px solid var(--bd)', borderRadius:12,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:10, padding:20,
    }}>
      <div style={{ fontSize:32 }}>🚫</div>
      <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', textAlign:'center', lineHeight:1.55, whiteSpace:'pre-line' }}>
        {'접근 불가 개소입니다.\n점검 기록 없이 다음 개소로 이동합니다.'}
      </div>
      <button
        onClick={onConfirm}
        style={{ marginTop:4, padding:'10px 32px', borderRadius:10, border:'none', background:'var(--acl)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}
      >
        확인
      </button>
    </div>
  )
}
