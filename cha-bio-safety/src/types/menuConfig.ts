// Phase 18 menu customization schema (per D-02)
// Stored at app_settings.menu_config_{staffId} as JSON

export type BottomNavKey = 'dashboard' | 'inspection' | 'qr' | 'remediation' | 'elevator'

export interface BottomNavItemConfig {
  key: BottomNavKey
  visible: boolean
  order: number
}

export interface MenuItemConfig {
  path: string
  visible: boolean
  order: number
}

export interface MenuSectionConfig {
  id: string
  title: string
  order: number
  items: MenuItemConfig[]
}

export interface MenuConfig {
  version: 2
  bottomNav: BottomNavItemConfig[]
  sideMenu: MenuSectionConfig[]
}

// Legacy v1 shape (used for migration only — do not consume directly)
export type LegacyMenuConfig = Record<string, { visible: boolean; order: number }>
