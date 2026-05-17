import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'
import { useIsDesktop } from '../hooks/useIsDesktop'

export default function CctvInfoPage() {
  const isDesktop = useIsDesktop()

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: 'var(--surface-page)',
      padding: isDesktop ? '20px 24px' : '12px 14px',
    }}>
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isDesktop ? 'repeat(2, minmax(0, 1fr))' : '1fr',
        gap: isDesktop ? 12 : 8,
      }}>
        {CCTV_DVRS.map(dvr => {
          const totalCap = dvr.ports.reduce((s, p) => s + (p.cap.endsWith('TB') ? parseFloat(p.cap) : 0), 0)
          const isEstimate = dvr.retention.includes('추정')
          return (
            <div key={dvr.no} style={{
              background: 'var(--surface-raised)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              border: '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{dvr.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', lineHeight: 1 }}>{dvr.channels}ch</span>
                <span style={{ flex: 1 }} />
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 700, lineHeight: 1,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: isEstimate ? 'var(--status-info-bg)' : 'var(--status-safe-bg)',
                  color: isEstimate ? 'var(--status-info)' : 'var(--status-safe)',
                  border: `1px solid ${isEstimate ? 'var(--status-info-bar)' : 'var(--status-safe-bar)'}`,
                }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} />
                  {dvr.retention}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>녹화구역 </span>{dvr.desc}
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '4px 10px',
                background: 'var(--surface-page)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                border: '1px solid var(--border-default)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>포트</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>용량</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>교체일자</div>
                {dvr.ports.flatMap(p => {
                  const isReplaced = p.replaced !== '기존'
                  return [
                    <div key={`p-${p.p}`} style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>#{p.p}</div>,
                    <div key={`c-${p.p}`} style={{ fontSize: 12, color: 'var(--text-primary)' }}>{p.cap}</div>,
                    <div key={`r-${p.p}`} style={{
                      fontSize: 12,
                      color: isReplaced ? 'var(--status-info)' : 'var(--text-tertiary)',
                      fontWeight: isReplaced ? 700 : 400,
                    }}>{p.replaced}</div>,
                  ]
                })}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6, textAlign: 'right', lineHeight: 1 }}>
                합계 {totalCap}TB · 포트 {dvr.ports.length}개
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px 0 0 0', lineHeight: 1 }}>
        출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}
      </div>
    </div>
  )
}
