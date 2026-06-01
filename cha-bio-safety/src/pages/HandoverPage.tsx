import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { handoverApi, type HandoverItem, type HandoverDetail } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'
import type { Staff } from '../types'
import { Pin, Check, RotateCcw, Search, Plus, Trash2, History, X, Paperclip, ImageIcon } from 'lucide-react'

type FilterTab = 'all' | 'waiting' | 'done'

function fmtTime(iso?: string | null) {
  if (!iso) return ''
  return iso.replace('T', ' ').replace(/:\d{2}\.\d+Z?$/, '').slice(0, 16)
}

async function uploadFile(file: File): Promise<{ key: string; contentType: string; sizeBytes: number; filename: string }> {
  const form = new FormData()
  form.append('file', file)
  const auth = useAuthStore.getState().token
  const res = await fetch('/api/uploads', {
    method: 'POST',
    body: form,
    headers: auth ? { Authorization: `Bearer ${auth}` } : undefined,
  })
  const json: any = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error || '업로드 실패')
  return { key: json.data.key, contentType: file.type, sizeBytes: file.size, filename: file.name }
}

export default function HandoverPage() {
  const qc = useQueryClient()
  const me = useAuthStore(s => s.staff)
  const [tab, setTab] = useState<FilterTab>('all')
  const [searchQ, setSearchQ] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [historyId, setHistoryId] = useState<string | null>(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['handovers', tab, searchQ, showDeleted],
    queryFn: () => handoverApi.list({
      q: searchQ || undefined,
      status: tab === 'all' ? undefined : tab,
      showDeleted: !!searchQ && showDeleted,
    }),
    staleTime: 10_000,
  })

  const isDesktop = useIsDesktop()
  if (isDesktop) return (
    <DesktopHandover
      tab={tab} setTab={setTab}
      searchInput={searchInput} setSearchInput={setSearchInput}
      searchQ={searchQ} setSearchQ={setSearchQ}
      showDeleted={showDeleted} setShowDeleted={setShowDeleted}
      composeOpen={composeOpen} setComposeOpen={setComposeOpen}
      historyId={historyId} setHistoryId={setHistoryId}
      items={items} isLoading={isLoading}
      me={me}
    />
  )

  return (
    <div className="flex flex-col h-full bg-surface-page" style={{ overflow: 'hidden' }}>
      <div className="px-4 py-3 flex flex-col gap-2 border-b border-border-default" style={{ flexShrink: 0 }}>
        <div className="flex gap-2 items-center">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="제목/본문/작성자 검색"
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
          <button onClick={() => setComposeOpen(true)}
            style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Plus size={14} /><span className="text-body-sm font-bold">새 글</span>
          </button>
        </div>

        <div className="flex gap-1">
          {([
            { k: 'all',     l: '전체' },
            { k: 'waiting', l: '대기' },
            { k: 'done',    l: '완료' },
          ] as const).map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ flex: 1, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: tab === t.k ? 'var(--accent)' : 'var(--surface-active)',
                color: tab === t.k ? '#fff' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 700 }}>
              {t.l}
            </button>
          ))}
        </div>

        {searchQ && (
          <label className="flex items-center gap-2 text-caption" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
            삭제된 글도 검색 결과에 표시
          </label>
        )}
      </div>

      <div className="flex-1 overflow-auto" style={{ padding: '12px 16px 80px' }}>
        {isLoading && <div className="text-body-sm text-text-tertiary text-center py-10">불러오는 중…</div>}
        {!isLoading && items.length === 0 && (
          <div className="text-body-sm text-text-tertiary text-center py-10">
            {searchQ ? '검색 결과가 없습니다' : '등록된 인수 인계가 없습니다'}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(h => (
            <HandoverCard
              key={h.id} h={h}
              isMine={!!me && h.staffId === me.id}
              editing={editingId === h.id}
              onStartEdit={() => setEditingId(h.id)}
              onCancelEdit={() => setEditingId(null)}
              onShowHistory={() => setHistoryId(h.id)}
            />
          ))}
        </div>
      </div>

      {composeOpen && (
        <ComposeModal onClose={() => setComposeOpen(false)} onSaved={() => {
          qc.invalidateQueries({ queryKey: ['handovers'] })
          setComposeOpen(false)
        }} />
      )}

      {historyId && (
        <HistoryModal handoverId={historyId} onClose={() => setHistoryId(null)} />
      )}
    </div>
  )
}

function HandoverCard({ h, isMine, editing, onStartEdit, onCancelEdit, onShowHistory }: {
  h: HandoverItem; isMine: boolean
  editing: boolean
  onStartEdit: () => void; onCancelEdit: () => void
  onShowHistory: () => void
}) {
  const qc = useQueryClient()
  const [title, setTitle] = useState(h.title)
  const [body, setBody] = useState(h.body)
  const isDeleted = !!h.deletedAt

  // 상세 (첨부 포함) — editing 또는 카드에 첨부 카운트 > 0 일 때 fetch
  const { data: detail } = useQuery({
    queryKey: ['handover-detail', h.id],
    queryFn: () => handoverApi.get(h.id),
    enabled: (h.attachmentCount ?? 0) > 0,
    staleTime: 30_000,
  })

  const updateMutation = useMutation({
    mutationFn: (patch: Parameters<typeof handoverApi.update>[1]) => handoverApi.update(h.id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['handovers'] }),
    onError: (e: any) => toast.error(e?.message || '저장 실패'),
  })

  const editMutation = useMutation({
    mutationFn: () => handoverApi.update(h.id, { title: title.trim(), body: body.trim() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['handovers'] }); onCancelEdit(); toast.success('수정되었습니다') },
    onError: (e: any) => toast.error(e?.message || '수정 실패'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => handoverApi.delete(h.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['handovers'] }); toast.success('삭제되었습니다') },
    onError: (e: any) => toast.error(e?.message || '삭제 실패'),
  })

  if (editing) {
    return (
      <div style={CARD(isDeleted)}>
        <input style={INPUT_S} placeholder="제목 (선택)" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea style={{ ...INPUT_S, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: 100, marginTop: 6 }}
          rows={5} value={body} onChange={e => setBody(e.target.value)} />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button onClick={() => { setTitle(h.title); setBody(h.body); onCancelEdit() }} style={{ ...BTN_GHOST, flex: 1, height: 36 }}>취소</button>
          <button onClick={() => editMutation.mutate()} disabled={!body.trim() || editMutation.isPending}
            style={{ ...BTN_PRIMARY, flex: 1, height: 36, opacity: !body.trim() ? 0.4 : 1 }}>저장</button>
        </div>
      </div>
    )
  }

  return (
    <div style={CARD(isDeleted)}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {h.status === 'done'
          ? <span className="text-caption font-bold" style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--status-safe-bg)', color: 'var(--status-safe-bar)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={12} />완료</span>
          : <span className="text-caption font-bold" style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--status-warning-bg)', color: 'var(--status-warning-bar)' }}>대기</span>}
        {isDeleted && <span className="text-caption font-bold" style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--status-danger-bg)', color: 'var(--status-danger-bar)' }}>삭제됨</span>}
        <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
          {h.staffName} · {fmtTime(h.createdAt)}
          {h.updatedAt !== h.createdAt && <> · 수정 {fmtTime(h.updatedAt)}</>}
        </span>
      </div>

      {h.title?.trim() && (
        <div className="text-body font-bold" style={{ color: 'var(--text-primary)', marginBottom: 4 }}>{h.title}</div>
      )}
      <div className="text-body-sm" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{h.body}</div>

      {detail?.attachments && detail.attachments.length > 0 && (
        <AttachmentList attachments={detail.attachments} />
      )}

      {!isDeleted && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {/* 고정은 대기 글에만 의미 — 완료 상태에서는 비활성 */}
          <button
            onClick={() => updateMutation.mutate({ pinned: !h.pinned })}
            disabled={h.status === 'done' && !h.pinned}
            style={{ ...CHIP(h.pinned, h.pinned ? '#d97706' : undefined), opacity: (h.status === 'done' && !h.pinned) ? 0.4 : 1, cursor: (h.status === 'done' && !h.pinned) ? 'not-allowed' : 'pointer' }}>
            <Pin size={12} /> 고정
          </button>
          <button onClick={onShowHistory} style={CHIP(false)}>
            <History size={12} /> 이력
          </button>
          <button
            onClick={() => updateMutation.mutate({ status: h.status === 'done' ? 'waiting' : 'done' })}
            style={CHIP(h.status === 'done')}>
            <Check size={12} /> 완료
          </button>
          {isMine && (
            <>
              <button onClick={onStartEdit} style={{ ...CHIP(false), marginLeft: 'auto' }}>수정</button>
              <button onClick={() => { if (confirm('이 글을 삭제하시겠습니까?\n(이력은 보존되어 검색에서 회복 가능)')) deleteMutation.mutate() }}
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

function AttachmentList({ attachments }: { attachments: HandoverDetail['attachments'] }) {
  return (
    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {attachments.map(a => {
        const isImage = (a.contentType ?? '').startsWith('image/')
        const url = `/api/uploads/${a.storageKey}`
        if (isImage) {
          return (
            <a key={a.id} href={url} target="_blank" rel="noopener"
              style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', background: 'var(--surface-sunken)', display: 'block' }}>
              <img src={url} alt={a.filename ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </a>
          )
        }
        return (
          <a key={a.id} href={url} target="_blank" rel="noopener"
            style={{ height: 32, padding: '0 10px', borderRadius: 16, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            <Paperclip size={12} /> {a.filename ?? '첨부파일'}
          </a>
        )
      })}
    </div>
  )
}

function ComposeModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? [])
    setFiles(prev => [...prev, ...list])
    e.target.value = ''
  }
  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      // 1) 글 생성
      const { id } = await handoverApi.create({
        title: title.trim() || undefined,
        body: body.trim(),
        pinned,
      })
      // 2) 첨부 업로드 → R2 키 받아 글에 연결
      if (files.length > 0) {
        setUploading(true)
        for (const f of files) {
          try {
            const up = await uploadFile(f)
            await handoverApi.addAttachment(id, {
              storageKey: up.key,
              filename: up.filename,
              contentType: up.contentType,
              sizeBytes: up.sizeBytes,
            })
          } catch (e: any) {
            toast.error(`'${f.name}' 첨부 실패: ${e?.message ?? ''}`)
          }
        }
        setUploading(false)
      }
      return { id }
    },
    onSuccess: () => { toast.success('등록되었습니다'); onSaved() },
    onError: () => { setUploading(false); toast.error('등록 실패') },
  })

  const canSave = !!body.trim() && !createMutation.isPending && !uploading

  return (
    <Modal title="새 인수 인계" onClose={onClose}>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="제목 (선택)" value={title} onChange={e => setTitle(e.target.value)} style={INPUT_S} />
        <textarea placeholder="본문" value={body} onChange={e => setBody(e.target.value)}
          rows={6} style={{ ...INPUT_S, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: 120 }} />

        <label className="flex items-center gap-2 text-body-sm" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
          <Pin size={12} /> 고정 (목록 최상단)
        </label>

        <div>
          <label htmlFor="handover-file-input" style={{ ...BTN_GHOST, height: 36, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 12px', cursor: 'pointer' }}>
            <ImageIcon size={14} /> 사진/파일 첨부
          </label>
          <input id="handover-file-input" type="file" multiple accept="image/*,application/pdf"
            onChange={handleFiles} style={{ display: 'none' }} />
        </div>

        {files.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {files.map((f, idx) => {
              const isImage = f.type.startsWith('image/')
              return (
                <div key={idx} style={{ position: 'relative', height: 64, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isImage
                    ? <img src={URL.createObjectURL(f)} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                    : <Paperclip size={16} />}
                  <span className="text-caption" style={{ color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-tertiary)' }}>
                    <X size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div style={{ padding: 16, display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ ...BTN_GHOST, flex: 1 }} disabled={uploading}>취소</button>
        <button onClick={() => createMutation.mutate()} disabled={!canSave}
          style={{ ...BTN_PRIMARY, flex: 1, opacity: canSave ? 1 : 0.4 }}>
          {uploading ? '업로드 중…' : '저장'}
        </button>
      </div>
    </Modal>
  )
}

function HistoryModal({ handoverId, onClose }: { handoverId: string; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: revs = [], isLoading } = useQuery({
    queryKey: ['handover-revisions', handoverId],
    queryFn: () => handoverApi.revisions(handoverId),
    staleTime: 5_000,
  })

  const revertMutation = useMutation({
    mutationFn: (revisionId: string) => handoverApi.revert(handoverId, revisionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['handovers'] })
      qc.invalidateQueries({ queryKey: ['handover-revisions', handoverId] })
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
              {r.title?.trim() && <div className="text-body-sm font-bold" style={{ color: 'var(--text-primary)' }}>{r.title}</div>}
              <div className="text-caption" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginTop: 2 }}>{r.body}</div>
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
function DesktopHandover({
  tab, setTab,
  searchInput, setSearchInput,
  searchQ, setSearchQ,
  showDeleted, setShowDeleted,
  composeOpen, setComposeOpen,
  historyId, setHistoryId,
  items, isLoading,
  me,
}: {
  tab: FilterTab; setTab: (t: FilterTab) => void
  searchInput: string; setSearchInput: (v: string) => void
  searchQ: string; setSearchQ: (v: string) => void
  showDeleted: boolean; setShowDeleted: (v: boolean) => void
  composeOpen: boolean; setComposeOpen: (v: boolean) => void
  historyId: string | null; setHistoryId: (v: string | null) => void
  items: HandoverItem[]; isLoading: boolean
  me: Staff | null
}) {
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingModalId, setEditingModalId] = useState<string | null>(null)

  const selectedItem = items.find(h => h.id === selectedId) ?? null

  const { data: detail } = useQuery({
    queryKey: ['handover-detail', selectedId],
    queryFn: () => handoverApi.get(selectedId!),
    enabled: !!selectedId,
    staleTime: 30_000,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof handoverApi.update>[1] }) =>
      handoverApi.update(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['handovers'] })
      if (selectedId) qc.invalidateQueries({ queryKey: ['handover-detail', selectedId] })
    },
    onError: (e: any) => toast.error(e?.message || '저장 실패'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => handoverApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['handovers'] })
      setSelectedId(null)
      toast.success('삭제되었습니다')
    },
    onError: (e: any) => toast.error(e?.message || '삭제 실패'),
  })

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-surface-page">
      {/* ── 툴바 ── */}
      <div className="px-5 py-3 flex items-center gap-3 border-b border-border-default" style={{ flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="제목/본문/작성자 검색"
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

        <div className="flex gap-1">
          {([
            { k: 'all' as const,     l: '전체' },
            { k: 'waiting' as const, l: '대기' },
            { k: 'done' as const,    l: '완료' },
          ]).map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ height: 36, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t.k ? 'var(--accent)' : 'var(--surface-active)',
                color: tab === t.k ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700 }}>
              {t.l}
            </button>
          ))}
        </div>

        {searchQ && (
          <label className="flex items-center gap-2 text-caption" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
            삭제된 글 포함
          </label>
        )}

        <button onClick={() => setComposeOpen(true)} style={{ marginLeft: 'auto', height: 36, padding: '0 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <Plus size={14} /><span style={{ fontSize: 13, fontWeight: 700 }}>새 글</span>
        </button>
      </div>

      {/* ── 카드 그리드 ── */}
      <div className="flex-1 overflow-auto" style={{ padding: '16px 20px' }}>
        {isLoading && <div className="text-body-sm text-text-tertiary text-center py-10">불러오는 중…</div>}
        {!isLoading && items.length === 0 && (
          <div className="text-body-sm text-text-tertiary text-center py-10">
            {searchQ ? '검색 결과가 없습니다' : '등록된 인수 인계가 없습니다'}
          </div>
        )}
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {items.map(h => {
            const isDeleted = !!h.deletedAt
            const barClass = h.status === 'done' ? 'bg-safe-bar' : 'bg-warning-bar'
            return (
              <div
                key={h.id}
                onClick={() => !isDeleted && setSelectedId(h.id)}
                className="bg-surface-raised border border-border-default rounded-md relative overflow-hidden hover:border-border-strong hover:-translate-y-px transition-transform"
                style={{ padding: '10px 12px 10px 16px', cursor: isDeleted ? 'default' : 'pointer', opacity: isDeleted ? 0.55 : 1 }}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${barClass}`} />
                {h.pinned && (
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <Pin size={12} color="var(--text-tertiary)" />
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {h.status === 'done'
                    ? <span className="text-caption font-bold leading-none" style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--status-safe-bg)', color: 'var(--status-safe-bar)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={10} />완료</span>
                    : <span className="text-caption font-bold leading-none" style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--status-warning-bg)', color: 'var(--status-warning-bar)' }}>대기</span>}
                  {isDeleted && <span className="text-caption font-bold leading-none" style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--status-danger-bg)', color: 'var(--status-danger-bar)' }}>삭제됨</span>}
                </div>
                {h.title?.trim() && (
                  <div className="text-body font-bold line-clamp-2" style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{h.title}</div>
                )}
                <div className="text-body-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{h.body}</div>
                <div className="flex items-center gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                  <span className="text-caption" style={{ color: 'var(--text-tertiary)' }}>{h.staffName} · {fmtTime(h.createdAt)}</span>
                  {(h.attachmentCount ?? 0) > 0 && (
                    <span className="text-caption" style={{ color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Paperclip size={10} />{h.attachmentCount}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        </div>
      </div>

      {/* ── 상세 모달 ── */}
      {selectedId && selectedItem && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelectedId(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div style={{ background: 'var(--bg2)', borderRadius: 12, width: 'min(600px, 100%)', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            {/* 모달 헤더 — 액션 버튼들 */}
            <div className="flex items-center gap-2" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
              <button
                onClick={() => updateMutation.mutate({ id: selectedItem.id, patch: { status: selectedItem.status === 'done' ? 'waiting' : 'done' } })}
                style={{ height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Check size={12} />{selectedItem.status === 'done' ? '대기로' : '완료'}
              </button>
              <button
                onClick={() => updateMutation.mutate({ id: selectedItem.id, patch: { pinned: !selectedItem.pinned } })}
                disabled={selectedItem.status === 'done' && !selectedItem.pinned}
                style={{ height: 32, padding: '0 10px', borderRadius: 8, border: selectedItem.pinned ? '1px solid #d97706' : '1px solid var(--border-default)', background: selectedItem.pinned ? 'rgba(217,119,6,.15)' : 'transparent', color: selectedItem.pinned ? '#d97706' : 'var(--text-secondary)', cursor: (selectedItem.status === 'done' && !selectedItem.pinned) ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, opacity: (selectedItem.status === 'done' && !selectedItem.pinned) ? 0.4 : 1 }}>
                <Pin size={12} />고정
              </button>
              <button
                onClick={() => { setHistoryId(selectedItem.id) }}
                style={{ height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <History size={12} />이력
              </button>
              {me && selectedItem.staffId === me.id && (
                <>
                  <button
                    onClick={() => { setEditingModalId(selectedItem.id); setSelectedId(null) }}
                    style={{ height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                    수정
                  </button>
                  <button
                    onClick={() => { if (confirm('이 글을 삭제하시겠습니까?\n(이력은 보존되어 검색에서 회복 가능)')) deleteMutation.mutate(selectedItem.id) }}
                    style={{ height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--status-danger)', background: 'transparent', color: 'var(--status-danger)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Trash2 size={12} />삭제
                  </button>
                </>
              )}
              <button onClick={() => setSelectedId(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="var(--text-tertiary)" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px' }}>
              <div className="text-caption" style={{ color: 'var(--text-tertiary)', marginBottom: 10 }}>
                {selectedItem.staffName} · {fmtTime(selectedItem.createdAt)}
                {selectedItem.updatedAt !== selectedItem.createdAt && <> · 수정 {fmtTime(selectedItem.updatedAt)}</>}
              </div>
              {selectedItem.title?.trim() && (
                <div className="text-body font-bold" style={{ color: 'var(--text-primary)', marginBottom: 10 }}>{selectedItem.title}</div>
              )}
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>{selectedItem.body}</div>
              {detail?.attachments && detail.attachments.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <AttachmentList attachments={detail.attachments} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 수정 모달 (인라인 편집을 위해 ComposeModal 재사용 불가, HandoverCard 수정 로직 재구현) ── */}
      {editingModalId && (() => {
        const h = items.find(x => x.id === editingModalId)
        if (!h) return null
        return <HandoverEditModal h={h} onClose={() => setEditingModalId(null)} onSaved={() => {
          qc.invalidateQueries({ queryKey: ['handovers'] })
          setEditingModalId(null)
        }} />
      })()}

      {composeOpen && (
        <ComposeModal onClose={() => setComposeOpen(false)} onSaved={() => {
          qc.invalidateQueries({ queryKey: ['handovers'] })
          setComposeOpen(false)
        }} />
      )}

      {historyId && (
        <HistoryModal handoverId={historyId} onClose={() => setHistoryId(null)} />
      )}
    </div>
  )
}

function HandoverEditModal({ h, onClose, onSaved }: { h: HandoverItem; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(h.title)
  const [body, setBody] = useState(h.body)
  const editMutation = useMutation({
    mutationFn: () => handoverApi.update(h.id, { title: title.trim(), body: body.trim() }),
    onSuccess: () => { toast.success('수정되었습니다'); onSaved() },
    onError: (e: any) => toast.error(e?.message || '수정 실패'),
  })
  return (
    <Modal title="인수 인계 수정" onClose={onClose}>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="제목 (선택)" value={title} onChange={e => setTitle(e.target.value)} style={INPUT_S} />
        <textarea placeholder="본문" value={body} onChange={e => setBody(e.target.value)}
          rows={6} style={{ ...INPUT_S, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: 120 }} />
      </div>
      <div style={{ padding: 16, display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ ...BTN_GHOST, flex: 1 }}>취소</button>
        <button onClick={() => editMutation.mutate()} disabled={!body.trim() || editMutation.isPending}
          style={{ ...BTN_PRIMARY, flex: 1, opacity: !body.trim() ? 0.4 : 1 }}>저장</button>
      </div>
    </Modal>
  )
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
