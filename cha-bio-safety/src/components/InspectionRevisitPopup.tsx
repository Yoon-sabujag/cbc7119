// ── 일반 점검 카테고리 완료/미조치 개소 재진입 팝업 ─────────────────
// 소화기 방식 부분 오버레이 스타일 통일 (position:absolute; inset:0; zIndex:10).
// 부모 박스는 반드시 position:relative 여야 한다.

import { CheckCircle2, Wrench } from 'lucide-react'

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

  // 문구 — 존칭 일관성 "에 의해" + 줄바꿈(\n) 반영
  const message = variant === 'completed'
    ? `${when}에 ${who}에 의해\n이미 점검한 개소입니다.`
    : `${when}에 ${who}에 의해\n조치 대기중인 개소입니다.\n조치 내용을 입력하시겠습니까?`

  return (
    <div
      role="alertdialog"
      aria-label={variant === 'completed' ? '이미 점검된 개소' : '조치 대기 중인 개소'}
      className="absolute inset-0 z-10 bg-surface-raised border border-border-default rounded-md flex flex-col items-center justify-center gap-2.5 p-5"
    >
      {variant === 'completed'
        ? <CheckCircle2 size={32} className="text-safe" />
        : <Wrench size={32} className="text-fire" />}
      <div className="text-label font-bold text-text-primary text-center leading-snug whitespace-pre-line">
        {message}
      </div>

      {variant === 'completed' && (
        <button
          onClick={onClose}
          className="mt-1 px-8 py-2.5 rounded-sm bg-accent text-text-on-accent text-label font-bold cursor-pointer"
        >
          확인
        </button>
      )}

      {variant === 'pending-action' && (
        <div className="mt-1 flex gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-sm bg-surface-page border border-border-strong text-text-secondary text-label font-bold cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={() => { if (recordId) onGoToRemediation?.(recordId) }}
            className="px-6 py-2.5 rounded-sm bg-accent text-text-on-accent text-label font-bold cursor-pointer"
          >
            이동
          </button>
        </div>
      )}
    </div>
  )
}
