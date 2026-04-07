import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { settingsApi } from '../utils/api'
import { MENU } from './SideMenu'
import { BOTTOM_NAV_ITEMS } from './BottomNav'
import { buildDefaultMenuConfig } from '../utils/menuConfig'
import type { MenuConfig, MenuSectionConfig, BottomNavKey } from '../types/menuConfig'

// ── Row primitive (replicates SettingsPanel.tsx:54-64 + minHeight:44 per UI-SPEC §Accessibility) ──
function Row({ label, sub, left, right }: { label: string; sub?: string; left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', minHeight: 44, background: 'var(--bg3)', borderRadius: 9, marginBottom: 5, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        {left}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
          {sub && <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--t3)', marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  )
}

// ── Toggle primitive (replicates SettingsPanel.tsx:15-35 — 38×21, #2563eb / bg4) ──
function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={() => !disabled && onChange?.(!on)}
      style={{ width: 38, height: 21, borderRadius: 11, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: on ? '#2563eb' : 'var(--bg4)', position: 'relative', transition: 'background 0.18s', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}>
      <span style={{ position: 'absolute', top: 2, left: 2, width: 17, height: 17, borderRadius: '50%', background: '#fff', transition: 'transform 0.18s', transform: on ? 'translateX(17px)' : 'translateX(0)', display: 'block' }} />
    </button>
  )
}

// ── ArrowButton primitive (UI-SPEC §Component Inventory + §Accessibility 28×44 wrapper) ──
function ArrowBtn({ dir, disabled, onClick }: { dir: 'up' | 'down'; disabled: boolean; onClick: () => void }) {
  return (
    <div style={{ width: 28, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button type="button" onClick={() => !disabled && onClick()} disabled={disabled}
        style={{ background: 'none', border: 'none', color: disabled ? 'var(--t3)' : 'var(--t2)', cursor: disabled ? 'default' : 'pointer', fontSize: 14, padding: 0, lineHeight: 1, opacity: disabled ? 0.35 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        {dir === 'up' ? '▲' : '▼'}
      </button>
    </div>
  )
}

// ── Sub-header helper (matches SettingsPanel.tsx:312 + UI-SPEC §Typography Section label) ──
function SubHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6, marginTop: 12 }}>{children}</div>
}

// ── Stable section ID generator ──
function newSectionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'sec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

// ── Re-normalize orders to be 0-based sequential after structural changes ──
function reorderSections(sections: MenuSectionConfig[]): MenuSectionConfig[] {
  return sections
    .sort((a, b) => a.order - b.order)
    .map((s, idx) => ({
      ...s,
      order: idx,
      items: [...s.items].sort((a, b) => a.order - b.order).map((item, iIdx) => ({ ...item, order: iIdx })),
    }))
}

// ── Main component ────────────────────────────────────────────────────────────
export function MenuSettingsSection() {
  const qc = useQueryClient()
  const { data: serverConfig, error } = useQuery({
    queryKey: ['menu-config'],
    queryFn: () => settingsApi.getMenu(),
    staleTime: 300_000,
  })

  const [draft, setDraft] = useState<MenuConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editingTitleValue, setEditingTitleValue] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [movePickerItemPath, setMovePickerItemPath] = useState<string | null>(null)
  const [movePickerSectionId, setMovePickerSectionId] = useState<string | null>(null)
  const [showMinWarning, setShowMinWarning] = useState(false)

  // Initialize draft from serverConfig once loaded
  useEffect(() => {
    if (serverConfig && !draft) setDraft(structuredClone(serverConfig))
  }, [serverConfig])

  const dirty = useMemo(
    () => draft && serverConfig && JSON.stringify(draft) !== JSON.stringify(serverConfig),
    [draft, serverConfig]
  )

  // Visible BottomNav count (used by min-2 enforcement)
  const visibleBottomNavCount = draft ? draft.bottomNav.filter(b => b.visible).length : 0

  // ── BottomNav handlers ─────────────────────────────────────────────────────

  function moveBottomNav(key: BottomNavKey, delta: -1 | 1) {
    setDraft(d => {
      if (!d) return d
      const sorted = [...d.bottomNav].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex(b => b.key === key)
      const target = idx + delta
      if (target < 0 || target >= sorted.length) return d
      const a = sorted[idx], c = sorted[target]
      const newBottomNav = d.bottomNav.map(b => {
        if (b.key === a.key) return { ...b, order: c.order }
        if (b.key === c.key) return { ...b, order: a.order }
        return b
      })
      return { ...d, bottomNav: newBottomNav }
    })
  }

  function toggleBottomNavVisible(key: BottomNavKey, v: boolean) {
    if (key === 'qr') return // locked
    if (!v && visibleBottomNavCount <= 2) {
      setShowMinWarning(true)
      setTimeout(() => setShowMinWarning(false), 3000)
      return
    }
    setDraft(d => d ? { ...d, bottomNav: d.bottomNav.map(b => b.key === key ? { ...b, visible: v } : b) } : d)
  }

  // ── SideMenu section handlers ──────────────────────────────────────────────

  function moveSectionOrder(sectionId: string, delta: -1 | 1) {
    setDraft(d => {
      if (!d) return d
      const sorted = [...d.sideMenu].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex(s => s.id === sectionId)
      const target = idx + delta
      if (target < 0 || target >= sorted.length) return d
      const a = sorted[idx], c = sorted[target]
      const newSideMenu = d.sideMenu.map(s => {
        if (s.id === a.id) return { ...s, order: c.order }
        if (s.id === c.id) return { ...s, order: a.order }
        return s
      })
      return { ...d, sideMenu: newSideMenu }
    })
  }

  function commitSectionTitle(sectionId: string, value: string) {
    setDraft(d => {
      if (!d) return d
      return { ...d, sideMenu: d.sideMenu.map(s => s.id === sectionId ? { ...s, title: value } : s) }
    })
    setEditingTitleId(null)
  }

  function deleteSection(sectionId: string) {
    setDraft(d => {
      if (!d) return d
      const filtered = d.sideMenu.filter(s => s.id !== sectionId)
      return { ...d, sideMenu: reorderSections(filtered) }
    })
    setConfirmDeleteId(null)
    if (expandedSection === sectionId) setExpandedSection(null)
  }

  function addSection() {
    const id = newSectionId()
    setDraft(d => {
      if (!d) return d
      const maxOrder = d.sideMenu.reduce((m, s) => Math.max(m, s.order), -1)
      return {
        ...d,
        sideMenu: [...d.sideMenu, { id, title: '', order: maxOrder + 1, items: [] }],
      }
    })
    setExpandedSection(id)
    setEditingTitleId(id)
    setEditingTitleValue('')
  }

  // ── SideMenu item handlers ─────────────────────────────────────────────────

  function moveItemOrder(sectionId: string, itemPath: string, delta: -1 | 1) {
    setDraft(d => {
      if (!d) return d
      return {
        ...d,
        sideMenu: d.sideMenu.map(s => {
          if (s.id !== sectionId) return s
          const sorted = [...s.items].sort((a, b) => a.order - b.order)
          const idx = sorted.findIndex(i => i.path === itemPath)
          const target = idx + delta
          if (target < 0 || target >= sorted.length) return s
          const a = sorted[idx], c = sorted[target]
          const newItems = s.items.map(i => {
            if (i.path === a.path) return { ...i, order: c.order }
            if (i.path === c.path) return { ...i, order: a.order }
            return i
          })
          return { ...s, items: newItems }
        }),
      }
    })
  }

  function toggleItemVisible(sectionId: string, itemPath: string, v: boolean) {
    setDraft(d => {
      if (!d) return d
      return {
        ...d,
        sideMenu: d.sideMenu.map(s =>
          s.id === sectionId
            ? { ...s, items: s.items.map(i => i.path === itemPath ? { ...i, visible: v } : i) }
            : s
        ),
      }
    })
  }

  function moveItemToSection(fromSectionId: string, itemPath: string, toSectionId: string) {
    setDraft(d => {
      if (!d) return d
      let movedItem: (typeof d.sideMenu[0]['items'][0]) | null = null
      const withoutItem = d.sideMenu.map(s => {
        if (s.id !== fromSectionId) return s
        const item = s.items.find(i => i.path === itemPath)
        if (item) movedItem = item
        const remaining = s.items.filter(i => i.path !== itemPath)
        return { ...s, items: remaining.map((i, idx) => ({ ...i, order: idx })) }
      })
      if (!movedItem) return d
      const result = withoutItem.map(s => {
        if (s.id !== toSectionId) return s
        const maxOrder = s.items.reduce((m, i) => Math.max(m, i.order), -1)
        return { ...s, items: [...s.items, { ...movedItem!, order: maxOrder + 1 }] }
      })
      return { ...d, sideMenu: result }
    })
    setMovePickerItemPath(null)
    setMovePickerSectionId(null)
  }

  // ── Save handler ───────────────────────────────────────────────────────────

  async function handleSave() {
    if (!draft) return
    setSaving(true)
    try {
      await settingsApi.saveMenu(draft)
      await qc.invalidateQueries({ queryKey: ['menu-config'] })
      toast.success('메뉴 설정이 저장되었습니다')
    } catch {
      toast.error('저장 실패. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  // ── Path → label lookup from MENU ─────────────────────────────────────────
  const pathToLabel = useMemo(() => {
    const m = new Map<string, string>()
    MENU.forEach(s => s.items.forEach(i => m.set(i.path, i.label)))
    return m
  }, [])

  // ── Loading / error states ─────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{ padding: '12px 13px 5px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>메뉴 설정</div>
        <div style={{ padding: 12, fontSize: 11, color: 'var(--danger)' }}>메뉴 설정을 불러오지 못했습니다. 페이지를 새로고침해주세요.</div>
      </div>
    )
  }

  if (!draft && !serverConfig) {
    return (
      <div style={{ padding: '12px 13px 5px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>메뉴 설정</div>
        <div style={{ padding: 12, fontSize: 11, color: 'var(--t3)' }}>메뉴 설정을 불러오는 중...</div>
      </div>
    )
  }

  if (!draft) return null

  // ── Sorted BottomNav and SideMenu for render ──────────────────────────────
  const sortedBottomNav = [...draft.bottomNav].sort((a, b) => a.order - b.order)
  const sortedSideMenu = [...draft.sideMenu].sort((a, b) => a.order - b.order)

  // Non-QR BottomNav items (for arrow boundary detection)
  const nonQrBottomNav = sortedBottomNav.filter(b => b.key !== 'qr')

  return (
    <div style={{ padding: '12px 13px 5px' }}>
      {/* Section header */}
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>메뉴 설정</div>

      {/* ── 하단 내비게이션 ──────────────────────────────────────────────────── */}
      <SubHeader>하단 내비게이션</SubHeader>

      {sortedBottomNav.map(b => {
        const itemInfo = BOTTOM_NAV_ITEMS.find(i => i.key === b.key)
        const label = itemInfo?.label ?? b.key

        if (b.key === 'qr') {
          return (
            <div key={b.key} aria-label="QR 스캔 — 중앙 고정, 변경 불가">
              <Row
                label={label}
                right={
                  <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 6, padding: '2px 7px' }}>중앙 고정</span>
                }
              />
            </div>
          )
        }

        const nonQrIdx = nonQrBottomNav.findIndex(n => n.key === b.key)
        const isFirstNonQr = nonQrIdx === 0
        const isLastNonQr = nonQrIdx === nonQrBottomNav.length - 1

        return (
          <Row
            key={b.key}
            label={label}
            left={
              <div style={{ display: 'flex', gap: 0 }}>
                <ArrowBtn dir="up" disabled={isFirstNonQr} onClick={() => moveBottomNav(b.key as BottomNavKey, -1)} />
                <ArrowBtn dir="down" disabled={isLastNonQr} onClick={() => moveBottomNav(b.key as BottomNavKey, 1)} />
              </div>
            }
            right={<Toggle on={b.visible} onChange={v => toggleBottomNavVisible(b.key as BottomNavKey, v)} />}
          />
        )
      })}

      {showMinWarning && (
        <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4, marginBottom: 4 }}>
          하단 내비게이션은 최소 2개가 표시되어야 합니다
        </div>
      )}

      {/* ── 사이드 메뉴 ─────────────────────────────────────────────────────── */}
      <SubHeader>사이드 메뉴</SubHeader>

      {sortedSideMenu.map((section, sIdx) => {
        const isExpanded = expandedSection === section.id
        const sortedItems = [...section.items].sort((a, b) => a.order - b.order)
        const isFirst = sIdx === 0
        const isLast = sIdx === sortedSideMenu.length - 1
        const isEmpty = section.items.length === 0
        const isEditingTitle = editingTitleId === section.id
        const isConfirmingDelete = confirmDeleteId === section.id

        return (
          <div key={section.id} style={{ marginBottom: 5 }}>
            {/* Section header row */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg3)', borderRadius: 9, padding: '10px 12px', minHeight: 44, boxSizing: 'border-box', gap: 4 }}>
              {/* Section order arrows */}
              <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
                <ArrowBtn dir="up" disabled={isFirst} onClick={() => moveSectionOrder(section.id, -1)} />
                <ArrowBtn dir="down" disabled={isLast} onClick={() => moveSectionOrder(section.id, 1)} />
              </div>

              {/* Section title (inline editable) */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editingTitleValue}
                    onChange={e => setEditingTitleValue(e.target.value)}
                    placeholder="섹션 이름 입력"
                    autoFocus
                    onBlur={() => commitSectionTitle(section.id, editingTitleValue)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitSectionTitle(section.id, editingTitleValue)
                      if (e.key === 'Escape') {
                        setEditingTitleValue(section.title)
                        setEditingTitleId(null)
                      }
                    }}
                    style={{ height: 32, background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 6, padding: '0 8px', fontSize: 12, color: 'var(--t1)', outline: 'none', flex: 1 }}
                  />
                ) : (
                  <div
                    onClick={() => { setEditingTitleId(section.id); setEditingTitleValue(section.title) }}
                    style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)', cursor: 'pointer', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {section.title || <span style={{ color: 'var(--t3)' }}>섹션 이름 입력</span>}
                  </div>
                )}
                {/* Item count badge */}
                {!isEditingTitle && (
                  <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--bg2)', border: '1px solid var(--bd2)', borderRadius: 6, padding: '1px 6px', flexShrink: 0 }}>
                    {section.items.length}
                  </span>
                )}
              </div>

              {/* Delete button or inline confirm (empty sections only) */}
              {isEmpty && !isEditingTitle && (
                isConfirmingDelete ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: 'var(--t3)' }}>빈 섹션을 삭제하시겠습니까?</span>
                    <button type="button" onClick={() => deleteSection(section.id)}
                      style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                      삭제
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteId(null)}
                      style={{ background: 'var(--bg)', border: '1px solid var(--bd2)', color: 'var(--t2)', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmDeleteId(section.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 14, padding: '0 4px', flexShrink: 0 }}>
                    🗑
                  </button>
                )
              )}

              {/* Expand chevron */}
              {!isEditingTitle && !isConfirmingDelete && (
                <button type="button"
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 14, padding: '0 4px', flexShrink: 0 }}>
                  {isExpanded ? '▾' : '▸'}
                </button>
              )}
            </div>

            {/* Expanded items */}
            {isExpanded && (
              <div style={{ marginTop: 2, paddingLeft: 8 }}>
                {sortedItems.map((item, iIdx) => {
                  const itemLabel = pathToLabel.get(item.path) ?? item.path
                  const isItemFirst = iIdx === 0
                  const isItemLast = iIdx === sortedItems.length - 1
                  const isMoveOpen = movePickerItemPath === item.path && movePickerSectionId === section.id
                  const otherSections = sortedSideMenu.filter(s => s.id !== section.id)

                  return (
                    <div key={item.path} style={{ position: 'relative' }}>
                      <Row
                        label={itemLabel}
                        sub={!item.visible ? '숨기면 사이드 메뉴에 표시되지 않습니다' : undefined}
                        left={
                          <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
                            <ArrowBtn dir="up" disabled={isItemFirst} onClick={() => moveItemOrder(section.id, item.path, -1)} />
                            <ArrowBtn dir="down" disabled={isItemLast} onClick={() => moveItemOrder(section.id, item.path, 1)} />
                          </div>
                        }
                        right={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {/* Section move button */}
                            <button type="button"
                              onClick={() => {
                                if (isMoveOpen) {
                                  setMovePickerItemPath(null)
                                  setMovePickerSectionId(null)
                                } else {
                                  setMovePickerItemPath(item.path)
                                  setMovePickerSectionId(section.id)
                                }
                              }}
                              title="섹션 이동"
                              style={{ background: 'none', border: 'none', color: isMoveOpen ? 'var(--acl)' : 'var(--t3)', cursor: 'pointer', fontSize: 12, padding: '2px 4px', fontWeight: 700 }}>
                              ▸
                            </button>
                            <Toggle on={item.visible} onChange={v => toggleItemVisible(section.id, item.path, v)} />
                          </div>
                        }
                      />

                      {/* Section move picker */}
                      {isMoveOpen && (
                        <div style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 8, padding: 6, position: 'absolute', right: 0, zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.4)', minWidth: 140 }}>
                          {otherSections.length === 0 ? (
                            <div style={{ fontSize: 11, color: 'var(--t3)', padding: '6px 8px' }}>이동 가능한 섹션이 없습니다</div>
                          ) : (
                            otherSections.map(target => (
                              <button key={target.id} type="button"
                                onClick={() => moveItemToSection(section.id, item.path, target.id)}
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--t1)', fontSize: 12, cursor: 'pointer' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                {target.title || '(이름 없음)'}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* + 새 섹션 추가 */}
      <button type="button" onClick={addSection}
        style={{ border: '1px dashed var(--bd2)', background: 'transparent', color: 'var(--t3)', fontSize: 10, fontWeight: 600, padding: '7px 0', borderRadius: 8, width: '100%', cursor: 'pointer', marginTop: 4 }}>
        + 새 섹션 추가
      </button>

      {/* ── Footer (save/cancel + reset) ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="button"
          onClick={() => setDraft(serverConfig ? structuredClone(serverConfig) : null)}
          disabled={!dirty || saving}
          style={{ flex: 1, height: 40, borderRadius: 8, border: '1px solid var(--bd2)', background: 'var(--bg)', color: 'var(--t2)', fontSize: 12, fontWeight: 700, cursor: dirty && !saving ? 'pointer' : 'not-allowed', opacity: dirty && !saving ? 1 : 0.5 }}>
          취소
        </button>
        <button type="button" onClick={handleSave} disabled={!dirty || saving}
          style={{ flex: 2, height: 40, borderRadius: 8, border: 'none', background: 'var(--acl)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: dirty && !saving ? 'pointer' : 'not-allowed', opacity: dirty && !saving ? 1 : 0.5 }}>
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>
      <button type="button" onClick={() => setDraft(buildDefaultMenuConfig())}
        style={{ width: '100%', marginTop: 8, padding: '7px 0', borderRadius: 8, border: '1px dashed var(--bd2)', background: 'transparent', color: 'var(--t3)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
        기본값으로 복원
      </button>
    </div>
  )
}
