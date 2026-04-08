import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import {
  settingsApi,
  type SideMenuEntry,
  type MenuConfig,
  DEFAULT_SIDE_MENU,
} from '../utils/api'
import { MENU } from './SideMenu'

// path → label lookup (from SideMenu.MENU)
const PATH_LABEL: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  MENU.forEach(s => s.items.forEach(i => { m[i.path] = i.label }))
  return m
})()

// Stable id generator for new dividers (no nanoid dep — use timestamp+rand)
function newDividerId(): string {
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function entriesEqual(a: SideMenuEntry[], b: SideMenuEntry[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i]
    if (x.type !== y.type) return false
    if (x.type === 'item' && y.type === 'item') {
      if (x.path !== y.path || x.visible !== y.visible) return false
    } else if (x.type === 'divider' && y.type === 'divider') {
      if (x.id !== y.id || x.title !== y.title) return false
    }
  }
  return true
}

export function MenuSettingsSection() {
  const qc = useQueryClient()
  const { data: serverConfig } = useQuery<MenuConfig>({
    queryKey: ['menu-config'],
    queryFn: () => settingsApi.getMenu(),
    staleTime: 300_000,
  })

  // Draft state — initialized from server, mutated locally until 설정 저장
  const [draft, setDraft] = useState<SideMenuEntry[]>([])
  const [editingDividerIdx, setEditingDividerIdx] = useState<number | null>(null)
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const confirmTimerRef = useRef<number | null>(null)

  // Initialize draft on first server response (or refetch)
  useEffect(() => {
    if (serverConfig?.sideMenu) {
      setDraft(serverConfig.sideMenu.map(e => ({ ...e })))
    } else if (serverConfig === null || (serverConfig && !serverConfig.sideMenu)) {
      setDraft(DEFAULT_SIDE_MENU.map(e => ({ ...e })))
    }
  }, [serverConfig])

  const dirty = useMemo(() => {
    if (!serverConfig?.sideMenu) return draft.length > 0
    return !entriesEqual(draft, serverConfig.sideMenu)
  }, [draft, serverConfig])

  const saveMutation = useMutation({
    mutationFn: () => settingsApi.saveMenu({ sideMenu: draft }),
    onSuccess: () => {
      toast.success('메뉴 설정이 저장되었습니다')
      qc.invalidateQueries({ queryKey: ['menu-config'] })
    },
    onError: () => toast.error('저장에 실패했습니다. 다시 시도해주세요.'),
  })

  // ── Mutators ──────────────────────────────────────
  function moveUp(idx: number) {
    if (idx <= 0) return
    setDraft(prev => {
      const next = prev.slice()
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }
  function moveDown(idx: number) {
    setDraft(prev => {
      if (idx >= prev.length - 1) return prev
      const next = prev.slice()
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
  }
  function toggleVisible(idx: number) {
    setDraft(prev => prev.map((e, i) => {
      if (i !== idx || e.type !== 'item') return e
      return { ...e, visible: !e.visible }
    }))
  }
  function renameDivider(idx: number, title: string) {
    const trimmed = title.trim().slice(0, 20)
    if (!trimmed) {
      // empty → silent revert: do nothing
      setEditingDividerIdx(null)
      return
    }
    setDraft(prev => prev.map((e, i) => {
      if (i !== idx || e.type !== 'divider') return e
      return { ...e, title: trimmed }
    }))
    setEditingDividerIdx(null)
  }
  function deleteDivider(idx: number) {
    setDraft(prev => prev.filter((_, i) => i !== idx))
    setConfirmDeleteIdx(null)
    if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current)
  }
  function addDivider() {
    const newEntry: SideMenuEntry = { type: 'divider', id: newDividerId(), title: '새 구분선' }
    setDraft(prev => {
      const next = [...prev, newEntry]
      // editing index = new last position
      setTimeout(() => setEditingDividerIdx(next.length - 1), 0)
      return next
    })
  }
  function resetToDefaults() {
    setDraft(DEFAULT_SIDE_MENU.map(e => ({ ...e })))
    setConfirmReset(false)
  }

  // Auto-dismiss delete confirmation after 5s
  useEffect(() => {
    if (confirmDeleteIdx === null) return
    if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current)
    confirmTimerRef.current = window.setTimeout(() => setConfirmDeleteIdx(null), 5000)
    return () => {
      if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current)
    }
  }, [confirmDeleteIdx])

  // ── Render ────────────────────────────────────────
  return (
    <div style={{ padding: '12px 13px 5px' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        메뉴 설정
      </div>

      {/* Entry list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {draft.map((entry, idx) => {
          const isFirst = idx === 0
          const isLast = idx === draft.length - 1
          const isConfirmingDelete = confirmDeleteIdx === idx

          if (entry.type === 'divider') {
            const isEditing = editingDividerIdx === idx
            return (
              <div key={`d-${entry.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', background: 'var(--bg3)', borderRadius: 9,
                borderLeft: '2px solid var(--bd2)',
              }}>
                <div style={{ width: 16, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <DividerTitleInput
                      initial={entry.title}
                      onCommit={(v) => renameDivider(idx, v)}
                    />
                  ) : (
                    <span
                      onClick={() => setEditingDividerIdx(idx)}
                      style={{
                        fontSize: 9, fontWeight: 700, color: 'var(--t2)',
                        letterSpacing: '.08em', textTransform: 'uppercase',
                        cursor: 'pointer', display: 'block',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.title}
                    </span>
                  )}
                </div>

                {isConfirmingDelete ? (
                  <DeleteConfirmInline
                    onCancel={() => setConfirmDeleteIdx(null)}
                    onConfirm={() => deleteDivider(idx)}
                  />
                ) : (
                  <>
                    <ArrowButton dir="up"   disabled={isFirst} onClick={() => moveUp(idx)} />
                    <ArrowButton dir="down" disabled={isLast}  onClick={() => moveDown(idx)} />
                    <button
                      onClick={() => setConfirmDeleteIdx(idx)}
                      aria-label="구분선 삭제"
                      style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            )
          }

          // item
          const label = PATH_LABEL[entry.path] ?? entry.path
          return (
            <div key={`i-${entry.path}`} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', background: 'var(--bg3)', borderRadius: 9,
              opacity: entry.visible ? 1 : 0.4,
            }}>
              <div style={{ width: 16, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
                {!entry.visible && (
                  <span style={{ fontSize: 9, color: 'var(--t3)', flexShrink: 0 }}>숨김</span>
                )}
              </div>
              <ArrowButton dir="up"   disabled={isFirst} onClick={() => moveUp(idx)} />
              <ArrowButton dir="down" disabled={isLast}  onClick={() => moveDown(idx)} />
              <ToggleSmall
                on={entry.visible}
                onChange={() => toggleVisible(idx)}
                ariaLabel={`${label} 표시`}
              />
            </div>
          )
        })}
      </div>

      {/* Add divider button */}
      <button
        onClick={addDivider}
        style={{
          marginTop: 10, width: '100%', height: 36,
          border: '1px dashed var(--bd2)', background: 'transparent',
          color: 'var(--t2)', borderRadius: 8, fontSize: 12, fontWeight: 400, cursor: 'pointer',
        }}
      >
        + 구분선 추가
      </button>

      {/* Reset to defaults */}
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
        {confirmReset ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--t2)' }}>기본 배치로 되돌릴까요?</span>
            <button
              onClick={() => setConfirmReset(false)}
              style={{ background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
            >취소</button>
            <button
              onClick={resetToDefaults}
              style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
            >초기화</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 10, cursor: 'pointer', padding: 0 }}
          >
            기본값으로 초기화
          </button>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={() => saveMutation.mutate()}
        disabled={!dirty || saveMutation.isPending}
        style={{
          marginTop: 8, width: '100%', height: 40,
          background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 9,
          fontSize: 12, fontWeight: 700,
          cursor: dirty && !saveMutation.isPending ? 'pointer' : 'not-allowed',
          opacity: dirty && !saveMutation.isPending ? 1 : 0.4,
        }}
      >
        {saveMutation.isPending ? '저장 중…' : '설정 저장'}
      </button>
    </div>
  )
}

// ── Subcomponents ───────────────────────────────────

function ArrowButton({ dir, disabled, onClick }: { dir: 'up' | 'down'; disabled: boolean; onClick: () => void }) {
  const Icon = dir === 'up' ? ChevronUp : ChevronDown
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'up' ? '위로 이동' : '아래로 이동'}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
        color: 'var(--t2)',
        opacity: disabled ? 0.25 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <Icon size={14} />
    </button>
  )
}

function ToggleSmall({ on, onChange, ariaLabel }: { on: boolean; onChange: () => void; ariaLabel: string }) {
  return (
    <button
      onClick={onChange}
      aria-label={ariaLabel}
      aria-pressed={on}
      style={{
        width: 38, height: 21, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: on ? '#2563eb' : 'var(--bg4)',
        position: 'relative', transition: 'background 0.18s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: 2, width: 17, height: 17, borderRadius: '50%',
        background: '#fff', transition: 'transform 0.18s',
        transform: on ? 'translateX(17px)' : 'translateX(0)',
        display: 'block',
      }} />
    </button>
  )
}

function DividerTitleInput({ initial, onCommit }: { initial: string; onCommit: (value: string) => void }) {
  const [value, setValue] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      maxLength={20}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.currentTarget.blur() }
        if (e.key === 'Escape') { setValue(initial); setTimeout(() => onCommit(initial), 0) }
      }}
      aria-label="구분선 제목"
      style={{
        height: 40, width: '100%', boxSizing: 'border-box',
        background: 'var(--bg3)', border: '1px solid var(--acl)', borderRadius: 8,
        padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none',
      }}
    />
  )
}

function DeleteConfirmInline({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: 'var(--t2)' }}>삭제할까요?</span>
      <button
        onClick={onCancel}
        style={{ background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
      >취소</button>
      <button
        onClick={onConfirm}
        style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
      >삭제</button>
    </div>
  )
}
