// 화재수신반 이벤트 세부 열람 모달 (260803-vp9) — 3곳(모바일 최근카드/전체 이력/데스크톱 in-pane) 공용.
// 확정 기록: 구분·발생일시·장소·원인·조치·캡처. 미확정 경보: 종류·시각·해제사유·캡처. 캡처 탭 시 전체화면 확대.
import { useState } from 'react'
import { X } from 'lucide-react'
import { KIND_BADGE, type PanelEventItem } from '../utils/panelEvents'

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="text-caption text-text-tertiary w-[64px] shrink-0">{label}</span>
      <span className="text-body-sm text-text-primary min-w-0 break-words">{value || '-'}</span>
    </div>
  )
}

export function PanelEventDetailModal({ item, onClose }: { item: PanelEventItem; onClose: () => void }) {
  const [zoom, setZoom] = useState(false)
  const badge = KIND_BADGE[item.kind]
  const isManual = item.source === 'manual'
  const recordTypeCls = item.recordType === 'non_fire'
    ? 'text-text-secondary bg-surface-sunken'
    : 'text-danger bg-danger-bg'
  const recordTypeLabel = item.recordType === 'non_fire' ? '비화재보' : '화재보'

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-[360px] bg-surface-raised border border-border-default rounded-md overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-border-default">
          <span className={`rounded-[6px] px-[7px] py-0.5 text-[10.5px] font-extrabold leading-none ${isManual ? recordTypeCls : badge.cls}`}>
            {isManual ? recordTypeLabel : badge.label}
          </span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-[7px] bg-surface-sunken text-text-secondary shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-3.5 py-3">
          {isManual ? (
            <>
              <Field label="발생일시" value={item.time} />
              <Field label="발생장소" value={item.location ?? '수신반 확인 필요'} />
              <Field label="원인" value={item.cause} />
              <Field label="조치" value={item.action} />
            </>
          ) : (
            <>
              <Field label="종류" value={badge.label} />
              <Field label="시각" value={item.time} />
              <Field label="해제 사유" value={item.clearedReason} />
            </>
          )}

          {item.snapshotKey && (
            <div className="mt-2.5">
              <div className="text-caption text-text-tertiary mb-1.5">경보 시점 캡처</div>
              <div
                onClick={() => setZoom(true)}
                className="w-full aspect-video rounded-sm overflow-hidden bg-black cursor-pointer"
              >
                <img
                  src={`/api/public/panel/${item.snapshotKey}.jpg`}
                  alt="경보 시점 캡처"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {zoom && item.snapshotKey && (
        <div onClick={() => setZoom(false)} className="fixed inset-0 z-[300] bg-[#05070a] flex items-center justify-center cursor-pointer p-4">
          <img
            src={`/api/public/panel/${item.snapshotKey}.jpg`}
            alt="경보 시점 캡처 확대"
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button onClick={() => setZoom(false)}
            className="absolute right-4 w-9 h-9 rounded-full bg-white/20 border-0 text-white cursor-pointer flex items-center justify-center hover:bg-white/30 transition-colors"
            style={{ top: 'calc(var(--sat, 0px) + 14px)' }}>
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
