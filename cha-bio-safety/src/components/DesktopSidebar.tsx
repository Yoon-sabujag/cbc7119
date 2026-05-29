import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { MENU, MenuItem } from './SideMenu'

// ── 데스크톱 전용 섹션 순서 (D-04) ──────────────────────────────────────────
const DESKTOP_SECTIONS = [
  { label: '점검 현황', paths: ['/dashboard', '/inspection', '/remediation', '/floorplan'] },
  { label: '시설 관리', paths: ['/div', '/extinguishers', '/floorplan', '/legal', '/elevator', '/cctv', '/checkpoints'] },
  { label: '문서 관리', paths: ['/daily-report', '/worklog', '/schedule', '/workshift', '/annual-plan', '/documents', '/reports', '/qr-print'] },
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
    <div
      data-no-print
      className="w-[280px] flex-shrink-0 h-dvh bg-surface-raised border-r border-border-default flex flex-col"
    >
      {/* ── 로고 스트립 ─────────────────────────────────────────── */}
      <div
        onClick={() => navigate('/dashboard')}
        className="h-[54px] box-border px-4 bg-surface-raised border-b border-border-default flex items-center gap-2.5 flex-shrink-0 cursor-pointer"
      >
        <img src="/icons/icon-192.png" alt="" className="w-[30px] h-[30px] rounded-[8px] flex-shrink-0" />
        <div>
          <div className="text-[13px] font-bold text-text-primary">차바이오컴플렉스</div>
          <div className="text-[9.5px] text-text-tertiary mt-px">소방안전 통합관리</div>
        </div>
      </div>

      {/* ── 스크롤 가능 네비 (flex: 1) ────────────────────────────────── */}
      <div className="flex-1 overflow-auto flex flex-col justify-evenly">
        {DESKTOP_SECTIONS.map(section => {
          const isCollapsed = collapsed[section.label] === true
          return (
            <div key={section.label}>
              {/* 섹션 라벨 */}
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center w-full text-left text-[11px] font-bold text-text-secondary uppercase pt-2 px-4 pb-1 bg-transparent border-0 cursor-pointer tracking-[0.05em]"
              >
                <span className="flex-1">{section.label}</span>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-150 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
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
      <div className="h-14 bg-surface-raised border-t border-border-default px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[12px] font-bold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
            {staff?.name ?? ''}
          </span>
          <span className="text-[11px] font-normal text-text-secondary">
            {staff?.role === 'admin' ? '관리자' : '부관리자'}
          </span>
        </div>
        <button
          onClick={onSettingsOpen}
          aria-label="설정"
          className="bg-transparent border-0 cursor-pointer p-1 flex items-center opacity-80"
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

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center w-full h-9 px-4 border-0 text-left gap-1 ${active ? 'bg-surface-active border-l-[3px] border-l-accent' : hovered ? 'bg-surface-sunken border-l-[3px] border-l-transparent' : 'bg-transparent border-l-[3px] border-l-transparent'} ${soon ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
    >
      <span className={`flex-1 text-[14px] font-normal overflow-hidden text-ellipsis whitespace-nowrap ${soon ? 'text-text-tertiary' : active ? 'text-accent' : 'text-text-primary'}`}>
        {label}
      </span>
      {badge > 0 && (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-[8px] bg-danger-bar text-white text-[11px] font-bold flex-shrink-0">
          {badge}
        </span>
      )}
    </button>
  )
}
