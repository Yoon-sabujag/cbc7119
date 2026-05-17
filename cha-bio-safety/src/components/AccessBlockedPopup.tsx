// ── 접근불가 개소 안내 팝업 ──────────────────────────────
// InspectionRevisitPopup 와 동일한 부분 오버레이 스타일 (position:absolute; inset:0; zIndex:10).
// 부모 박스는 반드시 position:relative 여야 한다.
// 자동 스킵 대신 "접근 불가 개소입니다" 안내 → 확인 시 다음 미점검 개소로 자동 이동.
// 사용자는 확인 버튼 외에도 스와이프 / 이전·이후 화살표로도 스킵 가능 (피커 자체는 상위 레이어).
// 아이콘: lucide ShieldAlert + status-warning 톤 (의미 분리 — 조치대기=danger).

import { ShieldAlert } from 'lucide-react'

export interface AccessBlockedPopupProps {
  onConfirm: () => void
}

export function AccessBlockedPopup({ onConfirm }: AccessBlockedPopupProps) {
  return (
    <div
      role="alertdialog"
      aria-label="접근 불가 안내"
      className="absolute inset-0 z-10 bg-surface-raised border border-border-default rounded-md flex flex-col items-center justify-center gap-2.5 p-5"
    >
      <ShieldAlert size={32} className="text-danger" />
      <div className="text-label font-bold text-text-primary text-center leading-snug whitespace-pre-line">
        {'접근 불가 개소입니다.\n점검 기록 없이 다음 개소로 이동합니다.'}
      </div>
      <button
        onClick={onConfirm}
        className="mt-1 px-8 py-2.5 rounded-sm bg-accent text-text-on-accent text-label font-bold cursor-pointer"
      >
        확인
      </button>
    </div>
  )
}
