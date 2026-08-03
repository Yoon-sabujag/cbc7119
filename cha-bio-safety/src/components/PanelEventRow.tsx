// 화재수신반 이벤트 1행 (승인 시안 001-B) — 카드 ×2 + 이력 페이지 공용(드리프트 0).
// 좌측 세로 스택: [종류칩]. 출처 구분 칩(과거 자동/수동 표시)은 260803-vp9 제거(사건 단위 병합으로 무의미).
import { KIND_BADGE, type PanelEventItem } from '../utils/panelEvents'

export function PanelEventRow({ item, thumb, onSelect }: { item: PanelEventItem; thumb?: boolean; onSelect?: (item: PanelEventItem) => void }) {
  const badge = KIND_BADGE[item.kind]
  return (
    <div
      className={`flex items-start gap-[9px] px-3 py-[9px] border-b border-border-default last:border-b-0${onSelect ? ' cursor-pointer' : ''}`}
      onClick={() => onSelect?.(item)}
      role={onSelect ? 'button' : undefined}
    >
      {/* 썸네일 (데스크톱 전용, thumb) */}
      {thumb && (
        <div className="w-[84px] h-[48px] shrink-0 rounded-sm overflow-hidden bg-black self-start mt-0.5">
          {item.snapshotUrl ? (
            <img src={item.snapshotUrl} alt="이벤트 스냅샷" loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-text-tertiary bg-surface-sunken">캡처 없음</div>
          )}
        </div>
      )}
      {/* 좌측 세로 스택 (lc) */}
      <div className="flex flex-col gap-1 items-start shrink-0 mt-0.5">
        <span className={`rounded-[6px] px-[7px] py-0.5 text-[10.5px] font-extrabold leading-none ${badge.cls}`}>{badge.label}</span>
      </div>
      {/* 우측 (rt) */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[11.5px] text-text-tertiary tabular-nums">{item.time}</span>
          <span className="text-[13px] font-semibold text-text-primary">{item.location ?? '수신반 확인 필요'}</span>
        </div>
        {item.cause && <div className="text-caption text-text-tertiary mt-0.5">{item.cause}</div>}
      </div>
    </div>
  )
}
