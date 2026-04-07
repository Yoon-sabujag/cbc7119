import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../utils/api'
import type { BottomNavKey } from '../types/menuConfig'

const ITEMS: { key: BottomNavKey; label: string; path: string; icon: React.ReactNode }[] = [
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
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* 렌치 (우상→좌하) */}
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>,
  },
  {
    key: 'elevator', label: '승강기', path: '/elevator',
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l3-3 3 3M9 15l3 3 3-3"/></svg>,
  },
]

export function BottomNav({ unresolvedCount = 0 }: { unresolvedCount?: number }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: menuConfig } = useQuery({ queryKey: ['menu-config'], queryFn: () => settingsApi.getMenu(), staleTime: 300_000 })

  const orderedItems = useMemo(() => {
    if (!menuConfig) return ITEMS
    const cfgByKey = new Map(menuConfig.bottomNav.map(b => [b.key, b]))
    // Always force qr visible (D-13) — defensive, normalizeMenuConfig already enforces
    const visible = ITEMS.filter(item => {
      if (item.key === 'qr') return true
      return cfgByKey.get(item.key)?.visible !== false
    })
    return visible.sort((a, b) => {
      const oa = cfgByKey.get(a.key)?.order ?? 999
      const ob = cfgByKey.get(b.key)?.order ?? 999
      return oa - ob
    })
  }, [menuConfig])

  const active = orderedItems.find(i => i.path !== '/' && pathname.startsWith(i.path))?.key ?? 'dashboard'

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
      {orderedItems.map(item => {
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
            <div style={{ position: 'relative', width: 21, height: 21, color: isActive ? 'var(--acl)' : 'var(--t3)' }}>
              {item.icon}
              {item.key === 'remediation' && unresolvedCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--danger)', color: '#fff',
                  fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono',
                  padding: '2px 4px', borderRadius: 9,
                  minWidth: 16, textAlign: 'center',
                  lineHeight: 1,
                  transform: 'translate(50%, -50%)',
                }}>
                  {unresolvedCount > 99 ? '99+' : unresolvedCount}
                </span>
              )}
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
