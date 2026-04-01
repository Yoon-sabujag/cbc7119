import { useNavigate, useLocation } from 'react-router-dom'

type NavKey = 'dashboard' | 'inspection' | 'qr' | 'remediation' | 'elevator'

const ITEMS: { key: NavKey; label: string; path: string; icon: React.ReactNode }[] = [
  {
    key: 'dashboard', label: '대시보드', path: '/dashboard',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  },
  {
    key: 'inspection', label: '점검', path: '/inspection',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  },
  {
    key: 'qr', label: 'QR 스캔', path: '/inspection/qr',
    icon: null, // 특수 버튼
  },
  {
    key: 'remediation', label: '조치', path: '/remediation',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.148c.424-.071.765-.384.93-.781.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
  {
    key: 'elevator', label: '승강기', path: '/elevator',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l3-3 3 3M9 15l3 3 3-3"/></svg>,
  },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = ITEMS.find(i => i.path !== '/' && pathname.startsWith(i.path))?.key ?? 'dashboard'

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(54px + var(--sab, 34px))',
        paddingBottom: 'var(--sab, 34px)',
        background: 'rgba(22,27,34,0.97)',
        borderTop: '1px solid var(--bd)',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      {ITEMS.map(item => {
        if (item.key === 'qr') {
          return (
            <button
              key="qr"
              onClick={() => navigate('/inspection/qr')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '3px 0', border: 'none', background: 'none', cursor: 'pointer',
                marginTop: -14,
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(37,99,235,0.55)',
              }}>
                <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
                  <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"/>
                </svg>
              </div>
              <span style={{ fontSize: 9.5, color: 'var(--acl)', fontWeight: 700 }}>QR 스캔</span>
            </button>
          )
        }
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '3px 0', border: 'none', background: 'none', cursor: 'pointer',
              color: isActive ? 'var(--acl)' : 'var(--t3)',
            }}
          >
            <div style={{ width: 21, height: 21, color: isActive ? 'var(--acl)' : 'var(--t3)' }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 500, color: isActive ? 'var(--acl)' : 'var(--t3)' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
