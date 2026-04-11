import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { MENU, MenuItem } from './SideMenu'

// ── 데스크톱 전용 섹션 순서 (D-04) ──────────────────────────────────────────
const DESKTOP_SECTIONS = [
  { label: '점검 현황', paths: ['/dashboard', '/inspection', '/remediation', '/floorplan'] },
  { label: '시설 관리', paths: ['/div', '/legal', '/elevator', '/inspection/qr', '/checkpoints'] },
  { label: '문서 관리', paths: ['/documents', '/worklog', '/daily-report', '/schedule', '/workshift', '/annual-plan', '/reports', '/qr-print'] },
  { label: '직원 관리', paths: ['/staff-manage', '/staff-service', '/education'] },
]

interface DesktopSidebarProps {
  unresolvedCount: number
  onSettingsOpen: () => void
}

export function DesktopSidebar({ unresolvedCount, onSettingsOpen }: DesktopSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { staff } = useAuthStore()

  // 섹션 접힘/펼침 — 기본값 모두 열림
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // MENU에서 path로 아이템 찾기
  const allItems: MenuItem[] = MENU.flatMap(s => s.items)
  const findItem = (path: string) => allItems.find(i => i.path === path)

  const toggleSection = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div data-no-print style={{
      width: 280,
      flexShrink: 0,
      height: '100dvh',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--bd)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── 로고 스트립 ─────────────────────────────────────────── */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          height: 54,
          boxSizing: 'border-box',
          padding: '0 16px',
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--bd)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <img src="/icons/icon-192.png" alt="" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>차바이오컴플렉스</div>
          <div style={{ fontSize: 9.5, color: 'var(--t3)', marginTop: 1 }}>소방안전 통합관리</div>
        </div>
      </div>

      {/* ── 스크롤 가능 네비 (flex: 1) ────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
        {DESKTOP_SECTIONS.map(section => {
          const isCollapsed = collapsed[section.label] === true
          return (
            <div key={section.label}>
              {/* 섹션 라벨 */}
              <button
                onClick={() => toggleSection(section.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--t2)',
                  textTransform: 'uppercase',
                  padding: '8px 16px 4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                }}
              >
                <span style={{ flex: 1 }}>{section.label}</span>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.15s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* 섹션 아이템 */}
              {!isCollapsed && section.paths.map(path => {
                const item = findItem(path)
                if (!item) return null

                // role 기반 필터: 관리자 전용 메뉴 숨김
                if (item.role && staff?.role !== item.role) return null

                const active = isActive(path)
                const isSoon = item.soon
                const showBadge = path === '/remediation' && unresolvedCount > 0

                return (
                  <NavItem
                    key={path}
                    label={item.label}
                    active={active}
                    soon={isSoon}
                    badge={showBadge ? unresolvedCount : 0}
                    onClick={() => {
                      if (!isSoon) navigate(path)
                    }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      {/* ── 사용자 카드 (56px) ────────────────────────────────────────── */}
      <div style={{
        height: 56,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--bd)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--t1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {staff?.name ?? ''}
          </span>
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--t2)' }}>
            {staff?.role === 'admin' ? '관리자' : '부관리자'}
          </span>
        </div>
        <button
          onClick={onSettingsOpen}
          aria-label="설정"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
        >
          <Settings size={16} color="var(--t2)" />
        </button>
      </div>
    </div>
  )
}

// ── 개별 네비 아이템 ──────────────────────────────────────────────────────────
interface NavItemProps {
  label: string
  active: boolean
  soon: boolean
  badge: number
  onClick: () => void
}

function NavItem({ label, active, soon, badge, onClick }: NavItemProps) {
  const [hovered, setHovered] = useState(false)

  const bg = active ? 'var(--bg4)' : hovered ? 'var(--bg3)' : 'transparent'
  const color = soon ? 'var(--t3)' : active ? 'var(--acl)' : 'var(--t1)'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: 36,
        padding: '0 16px',
        background: bg,
        border: 'none',
        borderLeft: active ? '3px solid var(--acl)' : '3px solid transparent',
        cursor: soon ? 'default' : 'pointer',
        pointerEvents: soon ? 'none' : 'auto',
        textAlign: 'left',
        gap: 4,
      }}
    >
      <span style={{
        flex: 1,
        fontSize: 14,
        fontWeight: 400,
        color,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      {badge > 0 && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: 8,
          background: 'var(--danger)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}
