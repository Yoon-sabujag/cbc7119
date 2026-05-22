import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'
import { useIsDesktop } from '../hooks/useIsDesktop'

export default function CctvInfoPage() {
  const isDesktop = useIsDesktop()

  return (
    <div className={`flex-1 overflow-y-auto bg-surface-page ${isDesktop ? 'py-5 px-6' : 'py-3 px-[14px]'}`}>
      <div className={`max-w-[960px] mx-auto grid ${isDesktop ? 'grid-cols-2 gap-3' : 'grid-cols-1 gap-2'}`}>
        {CCTV_DVRS.map(dvr => {
          const totalCap = dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)
          const isEstimate = dvr.retention.includes('추정')
          return (
            <div key={dvr.no} className="bg-surface-raised border border-border-default rounded-md p-3">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-label font-bold text-text-primary">{dvr.label}</span>
                <span className="text-caption leading-none font-semibold text-text-tertiary">{dvr.channels}ch</span>
                <span className="flex-1" />
                <span className={`inline-flex items-center gap-1 py-[2px] px-2 rounded-pill text-caption leading-none font-bold ${isEstimate ? 'bg-info-bg border border-info-bar text-info' : 'bg-safe-bg border border-safe-bar text-safe'}`}>
                  <span className="inline-block w-[6px] h-[6px] rounded-pill bg-current" />
                  {dvr.retention}
                </span>
              </div>
              <div className="text-caption text-text-secondary mb-2">
                <span className="text-text-tertiary">녹화구역 </span>{dvr.desc}
              </div>
              <div className="grid grid-cols-[auto_1fr_1fr] gap-x-[10px] gap-y-1 bg-surface-page border border-border-default rounded-sm py-2 px-[10px]">
                <div className="text-caption text-text-tertiary font-semibold">포트</div>
                <div className="text-caption text-text-tertiary font-semibold">용량</div>
                <div className="text-caption text-text-tertiary font-semibold">교체일자</div>
                {dvr.ports.flatMap(p => {
                  const isReplaced = p.replaced !== '기존'
                  return [
                    <div key={`p-${p.p}`} className="text-caption text-text-primary font-bold">#{p.p}</div>,
                    <div key={`c-${p.p}`} className="text-caption text-text-primary">{p.cap}</div>,
                    <div key={`r-${p.p}`} className={`text-caption ${isReplaced ? 'text-info font-bold' : 'text-text-tertiary'}`}>{p.replaced}</div>,
                  ]
                })}
              </div>
              <div className="text-caption leading-none text-text-tertiary text-right mt-[6px]">
                합계 {totalCap}TB · 포트 {dvr.ports.length}개
              </div>
            </div>
          )
        })}
      </div>
      <div className="text-caption leading-none text-text-tertiary text-center pt-3">
        출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}
      </div>
    </div>
  )
}
