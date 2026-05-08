import { CCTV_DVRS, CCTV_INFO_UPDATED } from '../utils/cctv'
import { useIsDesktop } from '../hooks/useIsDesktop'

export default function CctvInfoPage() {
  const isDesktop = useIsDesktop()

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg)',
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
            <div key={dvr.no} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--bd)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{dvr.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)' }}>{dvr.channels}ch</span>
                <span style={{ flex: 1 }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                  background: isEstimate ? 'rgba(234,179,8,.12)' : 'rgba(34,197,94,.1)',
                  color: isEstimate ? '#a16207' : 'var(--safe)',
                  border: `1px solid ${isEstimate ? 'rgba(234,179,8,.3)' : 'rgba(34,197,94,.25)'}`,
                }}>{dvr.retention}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 8 }}>
                <span style={{ color: 'var(--t3)' }}>녹화구역 </span>{dvr.desc}
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '4px 10px',
                fontSize: 11, background: 'var(--bg)', borderRadius: 7, padding: '7px 10px',
                border: '1px solid var(--bd)',
              }}>
                <div style={{ color: 'var(--t3)', fontWeight: 600 }}>포트</div>
                <div style={{ color: 'var(--t3)', fontWeight: 600 }}>용량</div>
                <div style={{ color: 'var(--t3)', fontWeight: 600 }}>교체일자</div>
                {dvr.ports.flatMap(p => {
                  const isReplaced = p.replaced !== '기존'
                  return [
                    <div key={`p-${p.p}`} style={{ color: 'var(--t1)', fontWeight: 700 }}>#{p.p}</div>,
                    <div key={`c-${p.p}`} style={{ color: 'var(--t1)' }}>{p.cap}</div>,
                    <div key={`r-${p.p}`} style={{ color: isReplaced ? '#1d4ed8' : 'var(--t2)', fontWeight: isReplaced ? 700 : 400 }}>{p.replaced}</div>,
                  ]
                })}
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6, textAlign: 'right' }}>
                합계 {totalCap}TB · 포트 {dvr.ports.length}개
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', padding: '14px 0 8px' }}>
        출처: CCTV 녹화 설비 현황 {CCTV_INFO_UPDATED}
      </div>
    </div>
  )
}
