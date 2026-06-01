import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { workListApi, type WorkListItem } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'
import type { Staff } from '../types'
import { Search, Plus, Trash2, History, X, RotateCcw, Edit3, Eye, EyeOff } from 'lucide-react'

type TabKey = 'password' | 'contact'

function fmtTime(iso?: string | null) {
  if (!iso) return ''
  return iso.replace('T', ' ').replace(/:\d{2}\.\d+Z?$/, '').slice(0, 16)
}

// 필드 의미 매핑:
//  password: label=항목명, affiliation=아이디(선택), value=비밀번호, memo=메모(선택)
//  contact:  label=항목명(회사/소속), affiliation=이름, extra=직책/직급(선택), value=전화번호, memo=메모(선택)

export default function WorkListPage() {
  const qc = useQueryClient()
  const me = useAuthStore(s => s.staff)
  const [tab, setTab] = useState<TabKey>('password')
  const [searchInput, setSearchInput] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [revealAll, setRevealAll] = useState(false)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['work-list', tab, searchQ, showDeleted],
    queryFn: () => workListApi.list(tab, {
      q: searchQ || undefined,
      showDeleted: !!searchQ && showDeleted,
    }),
    staleTime: 10_000,
  })

  const isDesktop = useIsDesktop()
  if (isDesktop) return (
    <DesktopWorkList
      tab={tab} setTab={setTab}
      searchInput={searchInput} setSearchInput={setSearchInput}
      searchQ={searchQ} setSearchQ={setSearchQ}
      showDeleted={showDeleted} setShowDeleted={setShowDeleted}
      composeOpen={composeOpen} setComposeOpen={setComposeOpen}
      editingId={editingId} setEditingId={setEditingId}
      historyId={historyId} setHistoryId={setHistoryId}
      revealAll={revealAll} setRevealAll={setRevealAll}
      items={items} isLoading={isLoading}
      me={me}
    />
  )

  return (
    <div className="flex flex-col h-full bg-surface-page" style={{ overflow: 'hidden' }}>
      <div className="px-4 py-3 flex flex-col gap-2 border-b border-border-default" style={{ flexShrink: 0 }}>
        <div className="flex gap-1">
          {([
            { k: 'password' as const, l: '비밀번호' },
            { k: 'contact'  as const, l: '연락처' },
          ]).map(t => (
            <button key={t.k} onClick={() => { setTab(t.k); setEditingId(null) }}
              style={{ flex: 1, height: 38, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t.k ? 'var(--accent)' : 'var(--surface-active)',
                color: tab === t.k ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700 }}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder={tab === 'password' ? '항목명/아이디/메모/작성자 검색' : '회사·이름·직책/번호/메모 검색'}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearchQ(searchInput.trim())}
              style={{ width: '100%', height: 36, paddingLeft: 32, paddingRight: searchInput ? 32 : 10, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', fontSize: 13 }}
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearchQ('') }}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={14} color="var(--text-tertiary)" />
              </button>
            )}
          </div>
          {tab === 'password' && (
            <button onClick={() => setRevealAll(v => !v)}
              title={revealAll ? '비밀번호 가리기' : '비밀번호 보기'}
              style={{ height: 36, width: 36, borderRadius: 8, background: 'var(--surface-active)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              {revealAll ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          <button onClick={() => setComposeOpen(true)}
            style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Plus size={14} /><span className="text-body-sm font-bold">추가</span>
          </button>
        </div>

        {searchQ && (
          <label className="flex items-center gap-2 text-caption" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
            삭제된 항목도 검색 결과에 표시
          </label>
        )}
      </div>

      <div className="flex-1 overflow-auto" style={{ padding: '12px 16px 80px' }}>
        {isLoading && <div className="text-body-sm text-text-tertiary text-center py-10">불러오는 중…</div>}
        {!isLoading && items.length === 0 && (
          <div className="text-body-sm text-text-tertiary text-center py-10">
            {searchQ ? '검색 결과가 없습니다' : (tab === 'password' ? '등록된 비밀번호가 없습니다' : '등록된 연락처가 없습니다')}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <WorkListCard
              key={item.id} item={item}
              tab={tab}
              isMine={!!me && item.createdBy === me.id}
              editing={editingId === item.id}
              revealAll={revealAll}
              onStartEdit={() => setEditingId(item.id)}
              onCancelEdit={() => setEditingId(null)}
              onSaved={() => setEditingId(null)}
              onShowHistory={() => setHistoryId(item.id)}
            />
          ))}
        </div>
      </div>

      {composeOpen && (
        <ComposeModal type={tab} onClose={() => setComposeOpen(false)} onSaved={() => {
          qc.invalidateQueries({ queryKey: ['work-list'] })
          setComposeOpen(false)
        }} />
      )}

      {historyId && (
        <WorkListHistoryModal itemId={historyId} onClose={() => setHistoryId(null)} />
      )}
    </div>
  )
}

function WorkListCard({ item, tab, isMine, editing, revealAll, onStartEdit, onCancelEdit, onSaved, onShowHistory }: {
  item: WorkListItem; tab: TabKey; isMine: boolean
  editing: boolean; revealAll: boolean
  onStartEdit: () => void; onCancelEdit: () => void; onSaved: () => void
  onShowHistory: () => void
}) {
  const qc = useQueryClient()
  const [label, setLabel] = useState(item.label)
  const [value, setValue] = useState(item.value)
  const [affiliation, setAffiliation] = useState(item.affiliation ?? '')
  const [extra, setExtra] = useState(item.extra ?? '')
  const [memo, setMemo] = useState(item.memo ?? '')
  const [revealed, setRevealed] = useState(false)
  const isDeleted = !!item.deletedAt

  const updateMutation = useMutation({
    mutationFn: () => workListApi.update(item.id, { label, value, affiliation, extra: tab === 'contact' ? extra : null, memo }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['work-list'] }); toast.success('수정되었습니다'); onSaved() },
    onError: (e: any) => toast.error(e?.message || '수정 실패'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => workListApi.delete(item.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['work-list'] }); toast.success('삭제되었습니다') },
    onError: (e: any) => toast.error(e?.message || '삭제 실패'),
  })

  const showValue = revealAll || revealed || tab === 'contact'

  if (editing) {
    return (
      <div style={CARD(isDeleted)}>
        {tab === 'password' ? (
          <>
            <input style={INPUT_S} placeholder="항목명" value={label} onChange={e => setLabel(e.target.value)} />
            <input style={{ ...INPUT_S, marginTop: 6 }} placeholder="아이디 (선택)" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
            <input style={{ ...INPUT_S, marginTop: 6 }} placeholder="비밀번호" value={value} onChange={e => setValue(e.target.value)} />
            <textarea style={{ ...INPUT_S, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: 60, marginTop: 6 }}
              rows={2} placeholder="메모 (선택)" value={memo} onChange={e => setMemo(e.target.value)} />
          </>
        ) : (
          <>
            <input style={INPUT_S} placeholder="항목명 (회사/소속)" value={label} onChange={e => setLabel(e.target.value)} />
            <input style={{ ...INPUT_S, marginTop: 6 }} placeholder="이름" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
            <input style={{ ...INPUT_S, marginTop: 6 }} placeholder="직책/직급 (선택)" value={extra} onChange={e => setExtra(e.target.value)} />
            <input style={{ ...INPUT_S, marginTop: 6 }} placeholder="전화번호" value={value} onChange={e => setValue(e.target.value)} />
            <textarea style={{ ...INPUT_S, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: 60, marginTop: 6 }}
              rows={2} placeholder="메모 (선택)" value={memo} onChange={e => setMemo(e.target.value)} />
          </>
        )}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button onClick={() => {
            setLabel(item.label); setValue(item.value); setAffiliation(item.affiliation ?? ''); setExtra(item.extra ?? ''); setMemo(item.memo ?? '');
            onCancelEdit()
          }} style={{ ...BTN_GHOST, flex: 1, height: 36 }}>취소</button>
          <button onClick={() => updateMutation.mutate()} disabled={!label.trim() || !value.trim() || (tab === 'contact' && !affiliation.trim()) || updateMutation.isPending}
            style={{ ...BTN_PRIMARY, flex: 1, height: 36, opacity: (!label.trim() || !value.trim() || (tab === 'contact' && !affiliation.trim())) ? 0.4 : 1 }}>저장</button>
        </div>
      </div>
    )
  }

  return (
    <div style={CARD(isDeleted)}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {isDeleted && <span className="text-caption font-bold" style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,.15)', color: 'var(--status-danger)' }}>삭제됨</span>}
        <span className="text-body font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
      </div>

      {tab === 'password' ? (
        <>
          {item.affiliation && (
            <div className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: 2 }}>
              <span style={{ fontWeight: 700 }}>아이디:</span> <span style={{ color: 'var(--text-secondary)' }}>{item.affiliation}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span className="text-caption" style={{ color: 'var(--text-tertiary)', fontWeight: 700 }}>비밀번호:</span>
            <span className="text-body-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
              {showValue ? item.value : '••••••••'}
            </span>
            <button onClick={() => setRevealed(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)' }}>
              {showValue ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.affiliation}</span>
            {item.extra && <span style={{ color: 'var(--text-tertiary)' }}> · {item.extra}</span>}
          </div>
          <div className="text-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{item.value}</div>
        </>
      )}

      {item.memo && <div className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{item.memo}</div>}
      <div className="text-caption" style={{ color: 'var(--text-tertiary)', marginTop: 6 }}>
        등록: {item.createdByName} · {fmtTime(item.createdAt)}
        {item.updatedAt !== item.createdAt && item.updatedByName && (
          <> · 수정: {item.updatedByName} · {fmtTime(item.updatedAt)}</>
        )}
      </div>

      {!isDeleted && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <button onClick={onShowHistory} style={CHIP(false)}><History size={12} /> 이력</button>
          {isMine && (
            <>
              <button onClick={onStartEdit} style={{ ...CHIP(false), marginLeft: 'auto' }}><Edit3 size={12} /> 수정</button>
              <button onClick={() => { if (confirm('이 항목을 삭제하시겠습니까?\n(이력은 보존)')) deleteMutation.mutate() }}
                style={CHIP(false, 'var(--status-danger)')}>
                <Trash2 size={12} /> 삭제
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ComposeModal({ type, onClose, onSaved }: { type: TabKey; onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [extra, setExtra] = useState('')
  const [memo, setMemo] = useState('')

  const createMutation = useMutation({
    mutationFn: () => workListApi.create({
      type, label: label.trim(), value: value.trim(),
      affiliation: affiliation.trim() || undefined,
      extra: type === 'contact' ? (extra.trim() || undefined) : undefined,
      memo: memo.trim() || undefined,
    }),
    onSuccess: () => { toast.success('등록되었습니다'); onSaved() },
    onError: () => toast.error('등록 실패'),
  })

  const canSave = !!label.trim() && !!value.trim() && (type === 'password' || !!affiliation.trim()) && !createMutation.isPending

  return (
    <Modal title={type === 'password' ? '비밀번호 추가' : '연락처 추가'} onClose={onClose}>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {type === 'password' ? (
          <>
            <Field label="항목명" required>
              <input style={INPUT_S} placeholder="예: 방재실 출입" value={label} onChange={e => setLabel(e.target.value)} />
            </Field>
            <Field label="아이디 (선택)">
              <input style={INPUT_S} placeholder="예: admin" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
            </Field>
            <Field label="비밀번호" required>
              <input style={INPUT_S} value={value} onChange={e => setValue(e.target.value)} />
            </Field>
            <Field label="메모 (선택)">
              <textarea style={{ ...INPUT_S, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: 60 }}
                rows={2} value={memo} onChange={e => setMemo(e.target.value)} />
            </Field>
          </>
        ) : (
          <>
            <Field label="항목명 (회사/소속)" required>
              <input style={INPUT_S} placeholder="예: 에스원" value={label} onChange={e => setLabel(e.target.value)} />
            </Field>
            <Field label="이름" required>
              <input style={INPUT_S} placeholder="예: 홍길동" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
            </Field>
            <Field label="직책/직급 (선택)">
              <input style={INPUT_S} placeholder="예: 팀장" value={extra} onChange={e => setExtra(e.target.value)} />
            </Field>
            <Field label="전화번호" required>
              <input style={INPUT_S} placeholder="010-0000-0000" value={value} onChange={e => setValue(e.target.value)} />
            </Field>
            <Field label="메모 (선택)">
              <textarea style={{ ...INPUT_S, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: 60 }}
                rows={2} value={memo} onChange={e => setMemo(e.target.value)} />
            </Field>
          </>
        )}
      </div>
      <div style={{ padding: 16, display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ ...BTN_GHOST, flex: 1 }}>취소</button>
        <button onClick={() => createMutation.mutate()} disabled={!canSave}
          style={{ ...BTN_PRIMARY, flex: 1, opacity: canSave ? 1 : 0.4 }}>저장</button>
      </div>
    </Modal>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-caption font-bold" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
        {label}{required && <span style={{ color: 'var(--status-danger)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function WorkListHistoryModal({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: revs = [], isLoading } = useQuery({
    queryKey: ['work-list-revisions', itemId],
    queryFn: () => workListApi.revisions(itemId),
    staleTime: 5_000,
  })

  const revertMutation = useMutation({
    mutationFn: (revisionId: string) => workListApi.revert(itemId, revisionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['work-list'] })
      qc.invalidateQueries({ queryKey: ['work-list-revisions', itemId] })
      toast.success('해당 시점으로 복원되었습니다')
    },
    onError: (e: any) => toast.error(e?.message || '복원 실패'),
  })

  return (
    <Modal title="수정 이력 (타임머신)" onClose={onClose}>
      <div style={{ padding: '12px 16px', maxHeight: '60vh', overflow: 'auto' }}>
        {isLoading && <div className="text-body-sm text-text-tertiary py-4 text-center">불러오는 중…</div>}
        {!isLoading && revs.length === 0 && <div className="text-body-sm text-text-tertiary py-4 text-center">이력 없음</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {revs.map((r, idx) => (
            <div key={r.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface-sunken)', border: '1px solid var(--border-default)' }}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {idx === 0 && <span className="text-caption font-bold" style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,.15)', color: 'var(--accent)' }}>현재</span>}
                {r.isDeletion && <span className="text-caption font-bold" style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,.15)', color: 'var(--status-danger)' }}>삭제 시점</span>}
                {r.isRevertFrom && <span className="text-caption font-bold" style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,.15)', color: '#9333ea' }}><RotateCcw size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> 복원</span>}
                <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>{r.staffName} · {fmtTime(r.createdAt)}</span>
              </div>
              <div className="text-body-sm font-bold" style={{ color: 'var(--text-primary)' }}>{r.label}</div>
              {r.type === 'password' ? (
                <>
                  {r.affiliation && <div className="text-caption" style={{ color: 'var(--text-tertiary)' }}>아이디: {r.affiliation}</div>}
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{r.value}</div>
                </>
              ) : (
                <>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{r.affiliation}{r.extra && ` · ${r.extra}`}</div>
                  <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>{r.value}</div>
                </>
              )}
              {r.memo && <div className="text-caption" style={{ color: 'var(--text-tertiary)', whiteSpace: 'pre-wrap', marginTop: 2 }}>{r.memo}</div>}
              {!r.isDeletion && idx !== 0 && (
                <button
                  onClick={() => { if (confirm('이 시점으로 복원하시겠습니까?')) revertMutation.mutate(r.id) }}
                  style={{ marginTop: 6, height: 28, padding: '0 10px', borderRadius: 6, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                  이 시점으로 복원
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <button onClick={onClose} style={{ ...BTN_GHOST, width: '100%' }}>닫기</button>
      </div>
    </Modal>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--bg2)', borderRadius: 12, width: 'min(480px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between" style={{ padding: '16px 16px 0' }}>
          <span className="text-body font-bold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="var(--text-tertiary)" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── 데스크톱 뷰 ──────────────────────────────────────────────────────────────
function DesktopWorkList({
  tab, setTab,
  searchInput, setSearchInput,
  searchQ, setSearchQ,
  showDeleted, setShowDeleted,
  composeOpen, setComposeOpen,
  editingId, setEditingId,
  historyId, setHistoryId,
  revealAll, setRevealAll,
  items, isLoading,
  me,
}: {
  tab: TabKey; setTab: (t: TabKey) => void
  searchInput: string; setSearchInput: (v: string) => void
  searchQ: string; setSearchQ: (v: string) => void
  showDeleted: boolean; setShowDeleted: (v: boolean) => void
  composeOpen: boolean; setComposeOpen: (v: boolean) => void
  editingId: string | null; setEditingId: (v: string | null) => void
  historyId: string | null; setHistoryId: (v: string | null) => void
  revealAll: boolean; setRevealAll: (fn: (v: boolean) => boolean) => void
  items: WorkListItem[]; isLoading: boolean
  me: Staff | null
}) {
  const qc = useQueryClient()

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-surface-page">
      {/* ── 툴바 ── */}
      <div className="px-5 py-3 flex items-center gap-3 border-b border-border-default" style={{ flexShrink: 0 }}>
        <div className="flex gap-1">
          {([
            { k: 'password' as const, l: '비밀번호' },
            { k: 'contact'  as const, l: '연락처' },
          ]).map(t => (
            <button key={t.k} onClick={() => { setTab(t.k); setEditingId(null) }}
              style={{ height: 36, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t.k ? 'var(--accent)' : 'var(--surface-active)',
                color: tab === t.k ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700 }}>
              {t.l}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder={tab === 'password' ? '항목명/아이디/메모/작성자 검색' : '회사·이름·직책/번호/메모 검색'}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setSearchQ(searchInput.trim())}
            style={{ width: '100%', height: 36, paddingLeft: 32, paddingRight: searchInput ? 32 : 10, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', fontSize: 13 }}
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearchQ('') }}
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={14} color="var(--text-tertiary)" />
            </button>
          )}
        </div>

        {tab === 'password' && (
          <button onClick={() => setRevealAll(v => !v)}
            title={revealAll ? '비밀번호 가리기' : '비밀번호 보기'}
            style={{ height: 36, width: 36, borderRadius: 8, background: 'var(--surface-active)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            {revealAll ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}

        {searchQ && (
          <label className="flex items-center gap-2 text-caption" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
            삭제된 항목 포함
          </label>
        )}

        <button onClick={() => setComposeOpen(true)} style={{ marginLeft: 'auto', height: 36, padding: '0 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <Plus size={14} /><span style={{ fontSize: 13, fontWeight: 700 }}>추가</span>
        </button>
      </div>

      {/* ── 테이블 ── */}
      <div className="flex-1 overflow-auto">
        {isLoading && <div className="text-body-sm text-text-tertiary text-center py-10">불러오는 중…</div>}
        {!isLoading && items.length === 0 && (
          <div className="text-body-sm text-text-tertiary text-center py-10">
            {searchQ ? '검색 결과가 없습니다' : (tab === 'password' ? '등록된 비밀번호가 없습니다' : '등록된 연락처가 없습니다')}
          </div>
        )}
        {!isLoading && items.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }} className="bg-surface-raised">
              {tab === 'password' ? (
                <tr>
                  <th style={TH}>항목명</th>
                  <th style={TH}>아이디</th>
                  <th style={{ ...TH, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>비밀번호</span>
                    <button onClick={() => setRevealAll(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center' }}>
                      {revealAll ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </th>
                  <th style={TH}>메모</th>
                  <th style={TH}>작성자</th>
                  <th style={{ ...TH, width: 100 }}>액션</th>
                </tr>
              ) : (
                <tr>
                  <th style={TH}>항목명</th>
                  <th style={TH}>이름</th>
                  <th style={TH}>직책</th>
                  <th style={TH}>전화번호</th>
                  <th style={TH}>메모</th>
                  <th style={TH}>작성자</th>
                  <th style={{ ...TH, width: 100 }}>액션</th>
                </tr>
              )}
            </thead>
            <tbody>
              {items.map(item => {
                const isMine = !!me && item.createdBy === me.id
                const isDeleted = !!item.deletedAt
                return (
                  <DesktopWorkListRow
                    key={item.id}
                    item={item}
                    tab={tab}
                    isMine={isMine}
                    isDeleted={isDeleted}
                    revealAll={revealAll}
                    editing={editingId === item.id}
                    onStartEdit={() => setEditingId(item.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onSaved={() => { setEditingId(null); qc.invalidateQueries({ queryKey: ['work-list'] }) }}
                    onShowHistory={() => setHistoryId(item.id)}
                    onDeleted={() => qc.invalidateQueries({ queryKey: ['work-list'] })}
                  />
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {composeOpen && (
        <ComposeModal type={tab} onClose={() => setComposeOpen(false)} onSaved={() => {
          qc.invalidateQueries({ queryKey: ['work-list'] })
          setComposeOpen(false)
        }} />
      )}

      {historyId && (
        <WorkListHistoryModal itemId={historyId} onClose={() => setHistoryId(null)} />
      )}
    </div>
  )
}

const TH: React.CSSProperties = {
  padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700,
  color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-default)',
  whiteSpace: 'nowrap',
}
const TD: React.CSSProperties = {
  padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-default)', verticalAlign: 'middle',
}

function DesktopWorkListRow({ item, tab, isMine, isDeleted, revealAll, editing, onStartEdit, onCancelEdit, onSaved, onShowHistory, onDeleted }: {
  item: WorkListItem; tab: TabKey; isMine: boolean; isDeleted: boolean; revealAll: boolean
  editing: boolean
  onStartEdit: () => void; onCancelEdit: () => void; onSaved: () => void
  onShowHistory: () => void; onDeleted: () => void
}) {
  const [revealed, setRevealed] = useState(false)
  const [label, setLabel] = useState(item.label)
  const [value, setValue] = useState(item.value)
  const [affiliation, setAffiliation] = useState(item.affiliation ?? '')
  const [extra, setExtra] = useState(item.extra ?? '')
  const [memo, setMemo] = useState(item.memo ?? '')
  const qc = useQueryClient()

  const showValue = revealAll || revealed || tab === 'contact'

  const updateMutation = useMutation({
    mutationFn: () => workListApi.update(item.id, { label, value, affiliation, extra: tab === 'contact' ? extra : null, memo }),
    onSuccess: () => { toast.success('수정되었습니다'); onSaved() },
    onError: (e: any) => toast.error(e?.message || '수정 실패'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => workListApi.delete(item.id),
    onSuccess: () => { toast.success('삭제되었습니다'); qc.invalidateQueries({ queryKey: ['work-list'] }); onDeleted() },
    onError: (e: any) => toast.error(e?.message || '삭제 실패'),
  })

  if (editing) {
    const colSpan = tab === 'password' ? 6 : 7
    return (
      <tr style={{ background: 'var(--surface-active)' }}>
        <td colSpan={colSpan} style={{ padding: '10px 12px' }}>
          {tab === 'password' ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input style={{ ...INLINE_INPUT, flex: '1 1 140px' }} placeholder="항목명" value={label} onChange={e => setLabel(e.target.value)} />
              <input style={{ ...INLINE_INPUT, flex: '1 1 140px' }} placeholder="아이디 (선택)" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
              <input style={{ ...INLINE_INPUT, flex: '1 1 140px' }} placeholder="비밀번호" value={value} onChange={e => setValue(e.target.value)} />
              <input style={{ ...INLINE_INPUT, flex: '1 1 200px' }} placeholder="메모 (선택)" value={memo} onChange={e => setMemo(e.target.value)} />
              <button onClick={() => updateMutation.mutate()} disabled={!label.trim() || !value.trim() || updateMutation.isPending} style={{ height: 32, padding: '0 12px', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>저장</button>
              <button onClick={() => { setLabel(item.label); setValue(item.value); setAffiliation(item.affiliation ?? ''); setMemo(item.memo ?? ''); onCancelEdit() }} style={{ height: 32, padding: '0 12px', borderRadius: 6, background: 'var(--surface-active)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>취소</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input style={{ ...INLINE_INPUT, flex: '1 1 140px' }} placeholder="항목명 (회사/소속)" value={label} onChange={e => setLabel(e.target.value)} />
              <input style={{ ...INLINE_INPUT, flex: '1 1 120px' }} placeholder="이름" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
              <input style={{ ...INLINE_INPUT, flex: '1 1 100px' }} placeholder="직책/직급 (선택)" value={extra} onChange={e => setExtra(e.target.value)} />
              <input style={{ ...INLINE_INPUT, flex: '1 1 140px' }} placeholder="전화번호" value={value} onChange={e => setValue(e.target.value)} />
              <input style={{ ...INLINE_INPUT, flex: '1 1 180px' }} placeholder="메모 (선택)" value={memo} onChange={e => setMemo(e.target.value)} />
              <button onClick={() => updateMutation.mutate()} disabled={!label.trim() || !value.trim() || !affiliation.trim() || updateMutation.isPending} style={{ height: 32, padding: '0 12px', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>저장</button>
              <button onClick={() => { setLabel(item.label); setValue(item.value); setAffiliation(item.affiliation ?? ''); setExtra(item.extra ?? ''); setMemo(item.memo ?? ''); onCancelEdit() }} style={{ height: 32, padding: '0 12px', borderRadius: 6, background: 'var(--surface-active)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>취소</button>
            </div>
          )}
        </td>
      </tr>
    )
  }

  return (
    <tr style={{ opacity: isDeleted ? 0.55 : 1 }} className="hover:bg-surface-active border-b border-border-default">
      <td style={TD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isDeleted && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(239,68,68,.15)', color: 'var(--status-danger)' }}>삭제됨</span>}
          <span style={{ fontWeight: 700 }}>{item.label}</span>
        </div>
      </td>
      {tab === 'password' ? (
        <>
          <td style={TD}><span style={{ color: 'var(--text-secondary)' }}>{item.affiliation ?? '—'}</span></td>
          <td style={TD}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{showValue ? item.value : '••••••••'}</span>
              <button onClick={() => setRevealed(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center' }}>
                {showValue ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
          </td>
          <td style={{ ...TD, maxWidth: 200 }}>
            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-tertiary)', fontSize: 12 }}>{item.memo ?? ''}</span>
          </td>
        </>
      ) : (
        <>
          <td style={TD}><span style={{ color: 'var(--text-secondary)' }}>{item.affiliation ?? '—'}</span></td>
          <td style={TD}><span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{item.extra ?? '—'}</span></td>
          <td style={TD}><span style={{ color: 'var(--text-secondary)' }}>{item.value}</span></td>
          <td style={{ ...TD, maxWidth: 200 }}>
            <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-tertiary)', fontSize: 12 }}>{item.memo ?? ''}</span>
          </td>
        </>
      )}
      <td style={{ ...TD, fontSize: 12, color: 'var(--text-tertiary)' }}>{item.createdByName}</td>
      <td style={TD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={onShowHistory} title="이력" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center' }}>
            <History size={14} />
          </button>
          {isMine && !isDeleted && (
            <>
              <button onClick={onStartEdit} title="수정" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center' }}>
                <Edit3 size={14} />
              </button>
              <button onClick={() => { if (confirm('이 항목을 삭제하시겠습니까?\n(이력은 보존)')) deleteMutation.mutate() }}
                title="삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--status-danger)', display: 'inline-flex', alignItems: 'center' }}>
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

const INLINE_INPUT: React.CSSProperties = {
  height: 32, background: 'var(--surface-sunken)', border: '1px solid var(--border-default)',
  borderRadius: 6, padding: '0 10px', fontSize: 13, color: 'var(--text-primary)',
  boxSizing: 'border-box', outline: 'none', minWidth: 0,
}

const INPUT_S: React.CSSProperties = {
  height: 40, background: 'var(--surface-sunken)', border: '1px solid var(--border-default)',
  borderRadius: 8, padding: '0 12px', fontSize: 14, color: 'var(--text-primary)',
  width: '100%', boxSizing: 'border-box', outline: 'none',
}
const BTN_PRIMARY: React.CSSProperties = {
  height: 44, background: 'var(--accent)', color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
}
const BTN_GHOST: React.CSSProperties = {
  height: 44, background: 'var(--surface-active)', color: 'var(--text-secondary)',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14,
}
const CARD = (deleted: boolean): React.CSSProperties => ({
  padding: '12px 14px', borderRadius: 10,
  background: deleted ? 'rgba(0,0,0,.05)' : 'var(--bg2)',
  border: '1px solid var(--border-default)',
  opacity: deleted ? 0.6 : 1,
})
const CHIP = (active: boolean, color?: string): React.CSSProperties => ({
  height: 28, padding: '0 10px', borderRadius: 14,
  border: active ? `1px solid ${color || 'var(--accent)'}` : '1px solid var(--border-default)',
  background: active ? `${color || 'var(--accent)'}20` : 'transparent',
  color: active ? (color || 'var(--accent)') : (color || 'var(--text-secondary)'),
  cursor: 'pointer', fontSize: 12, fontWeight: 700,
  display: 'inline-flex', alignItems: 'center', gap: 4,
})
