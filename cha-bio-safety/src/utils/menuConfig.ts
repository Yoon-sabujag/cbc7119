import type { BottomNavItemConfig, LegacyMenuConfig, MenuConfig, MenuSectionConfig } from '../types/menuConfig'

// ── BottomNav 기본값 ───────────────────────────────────────
// BottomNav.tsx ITEMS 배열 순서와 동일 (dashboard, inspection, qr, remediation, elevator)
export const BOTTOM_NAV_DEFAULTS: BottomNavItemConfig[] = [
  { key: 'dashboard',   visible: true, order: 0 },
  { key: 'inspection',  visible: true, order: 1 },
  { key: 'qr',          visible: true, order: 2 },
  { key: 'remediation', visible: true, order: 3 },
  { key: 'elevator',    visible: true, order: 4 },
]

// ── SideMenu 기본값 ───────────────────────────────────────
// SideMenu.tsx MENU constant 구조와 동일 (5개 섹션, 16개 항목)
export const SIDE_MENU_DEFAULTS: MenuSectionConfig[] = [
  {
    id: 'main', title: '주요 기능', order: 0,
    items: [
      { path: '/dashboard',      visible: true, order: 0 },
      { path: '/inspection',     visible: true, order: 1 },
      { path: '/inspection/qr',  visible: true, order: 2 },
      { path: '/remediation',    visible: true, order: 3 },
      { path: '/elevator',       visible: true, order: 4 },
    ],
  },
  {
    id: 'facility', title: '시설 관리', order: 1,
    items: [
      { path: '/div',       visible: true, order: 0 },
      { path: '/floorplan', visible: true, order: 1 },
      { path: '/legal',     visible: true, order: 2 },
    ],
  },
  {
    id: 'docs', title: '문서 관리', order: 2,
    items: [
      { path: '/daily-report', visible: true, order: 0 },
      { path: '/schedule',     visible: true, order: 1 },
      { path: '/workshift',    visible: true, order: 2 },
      { path: '/annual-plan',  visible: true, order: 3 },
      { path: '/reports',      visible: true, order: 4 },
      { path: '/qr-print',     visible: true, order: 5 },
    ],
  },
  {
    id: 'work', title: '근무·복지', order: 3,
    items: [
      { path: '/staff-service', visible: true, order: 0 },
      { path: '/education',     visible: true, order: 1 },
    ],
  },
  {
    id: 'system', title: '시스템', order: 4,
    items: [
      { path: '/admin', visible: true, order: 0 },
    ],
  },
]

// path → BottomNavKey 매핑 (migration에 사용)
const PATH_TO_BOTTOM_NAV_KEY: Record<string, BottomNavItemConfig['key']> = {
  '/dashboard':     'dashboard',
  '/inspection':    'inspection',
  '/inspection/qr': 'qr',
  '/remediation':   'remediation',
  '/elevator':      'elevator',
}

// ── 기본값 생성 ───────────────────────────────────────────
export function buildDefaultMenuConfig(): MenuConfig {
  return JSON.parse(JSON.stringify({
    version: 2,
    bottomNav: BOTTOM_NAV_DEFAULTS,
    sideMenu: SIDE_MENU_DEFAULTS,
  })) as MenuConfig
}

// ── Legacy 감지 ───────────────────────────────────────────
// v1 shape: non-null object, no 'version' field, at least one key starting with '/'
export function isLegacyMenuConfig(raw: unknown): raw is LegacyMenuConfig {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return false
  const obj = raw as Record<string, unknown>
  if ('version' in obj) return false
  return Object.keys(obj).some(k => k.startsWith('/'))
}

// ── Legacy v1 → v2 마이그레이션 ───────────────────────────
// visibility 플래그를 보존하며 기본 섹션 순서를 사용
// (legacy order는 global order여서 per-section order와 호환 불가 — 무시)
export function migrateLegacyMenuConfig(legacy: LegacyMenuConfig): MenuConfig {
  const config = buildDefaultMenuConfig()

  // SideMenu 항목 visibility 적용
  for (const section of config.sideMenu) {
    for (const item of section.items) {
      const entry = legacy[item.path]
      if (entry !== undefined) {
        item.visible = entry.visible
      }
    }
  }

  // BottomNav visibility 적용
  for (const navItem of config.bottomNav) {
    const path = Object.entries(PATH_TO_BOTTOM_NAV_KEY).find(([, key]) => key === navItem.key)?.[0]
    if (path && legacy[path] !== undefined) {
      navItem.visible = legacy[path].visible
    }
  }

  // D-13: QR은 항상 표시
  const qrItem = config.bottomNav.find(i => i.key === 'qr')
  if (qrItem) qrItem.visible = true

  return config
}

// ── 정규화 (normalize) ────────────────────────────────────
// null → 기본값, v1 shape → 마이그레이션, v2 shape → 그대로 (QR 강제 적용 + missing key 보완)
export function normalizeMenuConfig(raw: unknown): MenuConfig {
  if (raw == null) return buildDefaultMenuConfig()
  if (isLegacyMenuConfig(raw)) return migrateLegacyMenuConfig(raw as LegacyMenuConfig)

  // v2 shape 검사
  if (
    typeof raw === 'object' && raw !== null &&
    (raw as any).version === 2 &&
    Array.isArray((raw as any).bottomNav) &&
    Array.isArray((raw as any).sideMenu)
  ) {
    const config = raw as MenuConfig

    // D-13: QR visible 강제 적용
    const qrItem = config.bottomNav.find(i => i.key === 'qr')
    if (qrItem) qrItem.visible = true

    // 누락된 BottomNavKey 보완 (BOTTOM_NAV_DEFAULTS 끝에 추가)
    const existingKeys = new Set(config.bottomNav.map(i => i.key))
    for (const def of BOTTOM_NAV_DEFAULTS) {
      if (!existingKeys.has(def.key)) {
        config.bottomNav.push({ ...def })
      }
    }

    return config
  }

  // 알 수 없는 형태 → 기본값 반환
  return buildDefaultMenuConfig()
}
