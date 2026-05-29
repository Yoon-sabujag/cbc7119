import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { getMonthlySchedule } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'
import { settingsApi, type SideMenuEntry, type MenuConfig } from '../utils/api'
import { X } from 'lucide-react' // W3-OQ #A LOCKED — close icon migrated to Lucide X

const NAV_H = 'calc(54px + var(--sab, 0px))'

interface Props {
  open: boolean
  onClose: () => void
  unresolvedCount?: number
}

export type MenuItem = { label: string; path: string; badge: number; role?: 'admin' | 'assistant'; desktopOnly?: boolean }

export const MENU: { section: string; items: MenuItem[] }[] = [
  { section: '주요 기능', items: [
    { label: '대시보드',    path: '/dashboard',      badge: 0 },
    { label: '일반 점검',   path: '/inspection',     badge: 0 },
    { label: 'QR 스캔',    path: '/inspection/qr',  badge: 0 },
    { label: '조치 관리',   path: '/remediation',    badge: 0 },
    { label: '승강기 관리', path: '/elevator',       badge: 0 },
  ]},
  { section: '시설 관리', items: [
    { label: 'DIV 압력 관리',   path: '/div',           badge: 0 },
    // 소화기 관리: 데스크톱만 노출. 모바일은 점검 페이지/도면 동행으로 진입 (기존 동작 유지)
    { label: '소화기 관리',      path: '/extinguishers', badge: 0, desktopOnly: true },
    // CCTV 현황: 데스크톱만 노출. 모바일은 CCTV 점검 모달 헤더 버튼으로 진입
    { label: 'CCTV 현황',       path: '/cctv',          badge: 0, desktopOnly: true },
    { label: '소방 시설 도면',   path: '/floorplan',     badge: 0 },
    { label: '소방 점검 관리',   path: '/legal',         badge: 0 },
  ]},
  { section: '문서 관리', items: [
    { label: '일일 업무 일지',   path: '/daily-report',  badge: 0 },
    { label: '업무 수행 기록표', path: '/worklog', badge: 0, role: 'admin' },
    { label: '월간 점검 계획', path: '/schedule',      badge: 0 },
    { label: '월간 출근부',   path: '/workshift',      badge: 0 },
    { label: '연간 업무 추진 계획', path: '/annual-plan', badge: 0 },
    { label: '소방계획서/훈련자료', path: '/documents', badge: 0 },
    { label: '점검 일지 출력', path: '/reports',        badge: 0 },
    { label: 'QR 코드 출력',  path: '/qr-print',      badge: 0 },
  ]},
  { section: '근무·복지', items: [
    { label: '업무 관련 리스트', path: '/work-list',      badge: 0 },
    { label: '인수 인계장',      path: '/handovers',      badge: 0 },
    { label: '연차 및 식사',     path: '/staff-service',  badge: 0 },
    { label: '보수교육',        path: '/education',      badge: 0 },
  ]},
  { section: '시스템', items: [
    { label: '직원 관리', path: '/staff-manage', badge: 0, role: 'admin' },
  ]},
]

const ITEM_META: Record<string, MenuItem> = {}
MENU.forEach(s => s.items.forEach(i => { ITEM_META[i.path] = i }))

export function SideMenu({ open, onClose, unresolvedCount = 0 }: Props) {
  const navigate  = useNavigate()
  const { staff } = useAuthStore()
  const { data: staffList } = useStaffList()
  const { data: menuConfig } = useQuery({ queryKey: ['menu-config'], queryFn: () => settingsApi.getMenu(), staleTime: 300_000 })

  // Phase 18: 평면 SideMenuEntry[] 기반 렌더 (D-05)
  const appliedEntries: SideMenuEntry[] = useMemo(() => {
    const cfg = menuConfig as MenuConfig | undefined
    const entries = cfg?.sideMenu ?? []
    return entries.length > 0 ? entries : []
  }, [menuConfig])

  const RAW_TO_LABEL: Record<string, string> = { '당':'당직', '비':'비번', '주':'주간', '휴':'연차' }
  const [todayShiftLabel, setTodayShiftLabel] = useState('평일주간고정')
  useEffect(() => {
    if (!staff) return
    const now = new Date()
    const ref = (now.getHours() < 8 || (now.getHours() === 8 && now.getMinutes() < 30))
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) : now
    const staffForCalc = (staffList ?? []).map(s => ({ id: s.id, name: s.name, title: s.title }))
    const { staffRows } = getMonthlySchedule(ref.getFullYear(), ref.getMonth() + 1, staffForCalc)
    const row = staffRows.find(r => r.id === staff.id)
    if (row) {
      const idx = ref.getDate() - 1
      setTodayShiftLabel(RAW_TO_LABEL[row.shifts[idx]] ?? '주간')
    }
  }, [staff])

  // 메뉴 열림 시 뒤쪽 스크롤 방지
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const prevent = (e: TouchEvent) => {
      const panel = document.getElementById('side-menu-panel')
      if (panel && panel.contains(e.target as Node)) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('touchmove', prevent)
    }
  }, [open])

  const go = (path: string) => { navigate(path); onClose() }

  return (
    <>
      {/* 오버레이 */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[190] bg-black/65 transition-opacity duration-[280ms]"
        style={{
          // 동적 분기 — open prop 따라 변경. Tailwind class dynamic value 한계로 인라인 유지
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
        }}
      />

      {/* 패널 */}
      <div
        id="side-menu-panel"
        className="fixed left-0 z-[200] w-[82%] max-w-[300px] bg-surface-raised flex flex-col overflow-hidden rounded-r-[16px]"
        style={{
          // 동적 분기 (open) + safe-area css var + cubic-bezier transition — Tailwind class 한계로 인라인 유지
          top: 'var(--sat, 0px)',
          bottom: `calc(${NAV_H} - var(--sat, 0px))`,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* 헤더 — SettingsPanel 시각 통일 (W11 balance v2): 로고 24x24 (gear 16과 시각 비중 균형) + 단일 title 18px text-title + close X=14, 부제 제거 */}
        <div className="flex items-center gap-2.5 px-[15px] py-3 border-b border-border-default shrink-0">
          <img src="/icons/icon-192.png" alt="" className="w-6 h-6 rounded-[8px] shrink-0" />
          <span className="text-title font-bold text-text-primary flex-1">차바이오컴플렉스</span>
          <button
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="w-7 h-7 rounded-[7px] bg-surface-sunken border-none text-text-secondary cursor-pointer flex items-center justify-center shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* 메뉴 목록 — 평면 리스트, divider = 섹션 헤더 */}
        <div className="overflow-y-auto flex-1 py-[5px]">
          {appliedEntries.map((entry, idx) => {
            if (entry.type === 'divider') {
              return (
                <div
                  key={`d-${entry.id}-${idx}`}
                  className="px-3 pt-2.5 pb-[2px] text-caption font-bold text-text-tertiary tracking-[.08em] uppercase leading-none"
                >
                  {entry.title}
                </div>
              )
            }
            // item
            if (!entry.visible) return null
            const meta = ITEM_META[entry.path]
            if (!meta) return null
            if (meta.role && staff?.role !== meta.role) return null
            if (meta.desktopOnly) return null
            const badgeCount = meta.path === '/remediation' ? unresolvedCount : meta.badge
            return (
              <div
                key={`i-${entry.path}-${idx}`}
                onClick={() => go(meta.path)}
                className="flex items-center gap-2.5 px-3 py-2.5 mx-3 mb-[5px] rounded-[9px] cursor-pointer text-text-primary transition-colors duration-150 hover:bg-surface-active"
              >
                <span className="text-body font-medium flex-1">{meta.label}</span>
                {badgeCount > 0 && (
                  <span className="bg-fire-bar text-white text-label font-bold font-mono px-1 py-[2px] rounded-[9px] min-w-[16px] text-center">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* 로그인 사용자 */}
        {/* 사용자 카드 — SettingsPanel 프로필 시각 통일 (W11 v4): avatar 44x44 bg-accent-active solid (그라데이션 폐기 — OQ #3 사용자 override) + name text-body 16 */}
        <div className="px-3 py-3 border-t border-border-default shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 bg-surface-sunken rounded-[9px]">
            <div className="w-11 h-11 rounded-full shrink-0 bg-accent-active flex items-center justify-center text-[18px] font-bold text-text-on-accent">
              {staff?.name?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body font-bold text-text-primary">{staff?.name}</div>
              <div className="text-caption leading-none text-text-tertiary mt-px">{staff?.title} · {todayShiftLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
