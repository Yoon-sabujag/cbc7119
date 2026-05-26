import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronUp, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import {
  settingsApi,
  type SideMenuEntry,
  type MenuConfig,
  DEFAULT_SIDE_MENU,
} from '../utils/api'
import { MENU } from './SideMenu'
import { useAuthStore } from '../stores/authStore'

// path → label lookup (from SideMenu.MENU)
const PATH_LABEL: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  MENU.forEach(s => s.items.forEach(i => { m[i.path] = i.label }))
  return m
})()

// 메뉴 설정은 모바일 사이드바를 다룸 — 데스크톱 전용 아이템 (desktopOnly) 은 표시 대상에서 제외
const DESKTOP_ONLY_PATHS = new Set(
  MENU.flatMap(s => s.items).filter(i => i.desktopOnly).map(i => i.path),
)

// admin 전용 경로
const ADMIN_PATHS = new Set(
  MENU.flatMap(s => s.items).filter(i => i.role === 'admin').map(i => i.path)
)

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
  const staff = useAuthStore(s => s.staff)
  const isAdmin = staff?.role === 'admin'
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
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('menuSettings.collapsed') !== 'false' } catch { return true }
  })
  useEffect(() => {
    try { localStorage.setItem('menuSettings.collapsed', String(collapsed)) } catch {}
  }, [collapsed])

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
    <div className="pt-3 px-[13px] pb-[5px]">
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
        className={`flex items-center justify-between w-full p-0 bg-transparent border-none cursor-pointer ${collapsed ? '' : 'mb-1.5'}`}
      >
        <span className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase">
          메뉴 설정
        </span>
        <ChevronRight
          size={14}
          className={`text-text-tertiary transition-transform duration-150 ${collapsed ? '' : 'rotate-90'}`}
        />
      </button>

      {!collapsed && <>

      {/* Entry list */}
      <div className="flex flex-col gap-[5px]">
        {draft.map((entry, idx) => {
          // admin 전용 항목은 일반 사용자에게 숨김
          if (!isAdmin && entry.type === 'item' && ADMIN_PATHS.has(entry.path)) return null

          const isFirst = idx === 0
          const isLast = idx === draft.length - 1
          const isConfirmingDelete = confirmDeleteIdx === idx

          if (entry.type === 'divider') {
            const isEditing = editingDividerIdx === idx
            return (
              <div
                key={`d-${entry.id}`}
                className="flex items-center gap-2 py-2.5 px-3 bg-surface-sunken rounded-[9px] border-l-2 border-border-strong"
              >
                <div className="w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <DividerTitleInput
                      initial={entry.title}
                      onCommit={(v) => renameDivider(idx, v)}
                    />
                  ) : (
                    <span
                      onClick={() => setEditingDividerIdx(idx)}
                      className="text-caption leading-none font-bold text-text-secondary tracking-[.08em] uppercase cursor-pointer block overflow-hidden text-ellipsis whitespace-nowrap"
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
                      className="w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-danger shrink-0 p-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            )
          }

          // item — MENU 에서 제거된 path 또는 desktopOnly 아이템은 렌더 스킵 (메뉴 설정은 모바일 전용)
          if (!(entry.path in PATH_LABEL)) return null
          if (DESKTOP_ONLY_PATHS.has(entry.path)) return null
          const label = PATH_LABEL[entry.path]
          return (
            <div
              key={`i-${entry.path}`}
              className={`flex items-center gap-2 py-2.5 px-3 bg-surface-sunken rounded-[9px] ${entry.visible ? '' : 'opacity-40'}`}
            >
              <div className="w-4 shrink-0" />
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                <span className="text-caption font-normal text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                  {label}
                </span>
                {!entry.visible && (
                  <span className="text-caption leading-none text-text-tertiary shrink-0">숨김</span>
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
        className="mt-2.5 w-full h-9 border border-dashed border-border-strong bg-transparent text-text-secondary rounded-sm text-caption leading-none font-normal cursor-pointer"
      >
        + 구분선 추가
      </button>

      {/* Reset to defaults */}
      <div className="mt-2 flex justify-end">
        {confirmReset ? (
          <div className="flex items-center gap-1.5">
            <span className="text-caption leading-none text-text-secondary">기본 배치로 되돌릴까요?</span>
            <button
              onClick={() => setConfirmReset(false)}
              className="bg-surface-active text-text-secondary border-none rounded-[6px] px-2 py-1 text-caption leading-none font-bold cursor-pointer"
            >취소</button>
            <button
              onClick={resetToDefaults}
              className="bg-danger text-text-on-accent border-none rounded-[6px] px-2 py-1 text-caption leading-none font-bold cursor-pointer"
            >초기화</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="bg-transparent border-none text-text-tertiary text-caption leading-none cursor-pointer p-0"
          >
            기본값으로 초기화
          </button>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={() => saveMutation.mutate()}
        disabled={!dirty || saveMutation.isPending}
        className={`mt-2 w-full h-10 bg-accent text-text-on-accent border-none rounded-[9px] text-caption leading-none font-bold ${dirty && !saveMutation.isPending ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'}`}
      >
        {saveMutation.isPending ? '저장 중…' : '설정 저장'}
      </button>

      </>}
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
      className={`w-7 h-7 flex items-center justify-center bg-transparent border-none text-text-secondary shrink-0 p-0 ${disabled ? 'opacity-25 pointer-events-none cursor-default' : 'opacity-100 cursor-pointer'}`}
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
      className={`relative w-[38px] h-[21px] rounded-full border-none cursor-pointer shrink-0 p-0 transition-colors duration-200 ${on ? 'bg-accent-active' : 'bg-surface-active'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-[17px] h-[17px] rounded-full bg-text-on-accent block transition-transform duration-200 ${on ? 'translate-x-[17px]' : 'translate-x-0'}`}
      />
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
      className="h-10 w-full box-border bg-surface-sunken border border-accent rounded-sm px-3 text-label text-text-primary outline-none"
    />
  )
}

function DeleteConfirmInline({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-caption leading-none text-text-secondary">삭제할까요?</span>
      <button
        onClick={onCancel}
        className="bg-surface-active text-text-secondary border-none rounded-[6px] px-2 py-1 text-caption leading-none font-bold cursor-pointer"
      >취소</button>
      <button
        onClick={onConfirm}
        className="bg-danger text-text-on-accent border-none rounded-[6px] px-2 py-1 text-caption leading-none font-bold cursor-pointer"
      >삭제</button>
    </div>
  )
}
