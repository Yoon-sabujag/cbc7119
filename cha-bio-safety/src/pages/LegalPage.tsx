import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronLeft, Camera, Loader2, Check, X, Lock, Save } from 'lucide-react'
import { legalApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { useAuthStore } from '../stores/authStore'
import { useMultiPhotoUpload } from '../hooks/useMultiPhotoUpload'
import { PhotoGrid } from '../components/PhotoGrid'
import { PhotoSourceModal } from '../components/PhotoSourceModal'
import { FindingEditModal } from '../components/FindingEditModal'
import { buildMetaTxt } from '../utils/findingDownload'
import type { LegalRound, LegalInspectionResult, LegalFinding } from '../types'

// ── 날짜 포매터 ──────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}
function fmtDateTime(iso: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// ── 좌측 강조 색상 (Tailwind class) ──────────────────────────────
function accentColor(result: LegalInspectionResult | null): string {
  if (result === 'pass') return 'border-safe-bar'
  if (result === 'fail') return 'border-danger-bar'
  if (result === 'conditional') return 'border-warning-bar'
  return 'border-border-strong'
}

// ── 1열 카드 strip 색 (submission_status 기준) ──────────────────────────
function stripBySubmission(status: 'pending' | 'completed'): string {
  return status === 'completed' ? 'border-safe-bar' : 'border-warning-bar'
}

// ── 다운로드 파일명 — "{YYYY}.{MM})차바이오컴플렉스 {종합점검|작동기능점검} {결과내역서|지적사항 조치 작업사진}.{ext}"
function pptFileName(round: LegalRound): string {
  const year = round.date.slice(0, 4)
  const month = round.date.slice(5, 7)
  const kind = round.title.includes('종합') ? '종합점검' : '작동기능점검'
  return `${year}.${month})차바이오컴플렉스 ${kind} 지적사항 조치 작업사진.pptx`
}
function reportFileName(round: LegalRound): string {
  const year = round.date.slice(0, 4)
  const month = round.date.slice(5, 7)
  const kind = round.title.includes('종합') ? '종합점검' : '작동기능점검'
  // 결과내역서는 PDF 확장자 가정 (와치독/수동 업로드 모두 PDF)
  return `${year}.${month})차바이오컴플렉스 ${kind} 결과내역서.pdf`
}
function downloadWithName(url: string, fileName: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ── 결과 배지 ──────────────────────────────────────────────────────
function ResultBadge({ result }: { result: LegalInspectionResult | null }) {
  const map: Record<string, { cls: string; label: string }> = {
    pass: { cls: 'bg-safe-bg text-safe', label: '적합' },
    fail: { cls: 'bg-danger-bg text-danger', label: '부적합' },
    conditional: { cls: 'bg-warning-bg text-warning', label: '조건부적합' },
  }
  const m = result ? map[result] : null
  return (
    <span
      className={`${m?.cls ?? 'bg-transparent text-text-tertiary'} text-caption font-bold leading-none rounded-sm`}
      style={{ padding: '2px 8px', flexShrink: 0 }}
    >
      {m?.label ?? '결과 미입력'}
    </span>
  )
}

// ── 스켈레톤 ──────────────────────────────────────────────────────
const SKELETON_CLS = 'bg-surface-sunken rounded-md'
const SKELETON_STYLE: React.CSSProperties = { height: 72, animation: 'blink 2s ease-in-out infinite' }

// ── 탭 ───────────────────────────────────────────────────────────
type TabKey = '전체' | '미조치' | '완료'
const TABS: { key: TabKey; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: '미조치', label: '진행 중' },
  { key: '완료', label: '완료' },
]
function filterRounds(rounds: LegalRound[], tab: TabKey): LegalRound[] {
  if (tab === '미조치') return rounds.filter(r => r.findingCount > r.resolvedCount)
  if (tab === '완료') return rounds.filter(r => r.findingCount > 0 && r.findingCount === r.resolvedCount)
  return rounds
}
function genYears() {
  const c = new Date().getFullYear(); const y: string[] = []
  for (let i = 2024; i <= c; i++) y.push(String(i)); return y
}

// ── KVRow ────────────────────────────────────────────────────────
function KVRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span className="text-caption leading-none text-text-tertiary" style={{ width: 64, flexShrink: 0 }}>{label}</span>
      <span className="text-label text-text-primary" style={{ flex: 1, lineHeight: 1.5 }}>{children}</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── 데스크톱: 중앙 패널 (지적사항 목록) ─────────────────────────────
// ══════════════════════════════════════════════════════════════════
function FindingsPanel({ roundId, onSelectFinding, selectedFindingId, activeTab, setActiveTab }: {
  roundId: string
  onSelectFinding: (fid: string) => void
  selectedFindingId: string | null
  activeTab: 'internal' | 'submission'
  setActiveTab: (t: 'internal' | 'submission') => void
}) {
  const queryClient = useQueryClient()
  const [editingFinding, setEditingFinding] = useState<LegalFinding | null>(null)

  const { data: round } = useQuery({
    queryKey: ['legal-round', roundId],
    queryFn: () => legalApi.get(roundId),
    enabled: !!roundId,
  })
  const { data: findings, isLoading } = useQuery({
    queryKey: ['legal-findings', roundId],
    queryFn: () => legalApi.getFindings(roundId),
    enabled: !!roundId,
    staleTime: 30_000,
  })

  const handleDelete = async (finding: LegalFinding) => {
    try {
      await legalApi.deleteFinding(roundId, finding.id)
      queryClient.invalidateQueries({ queryKey: ['legal-findings', roundId] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', roundId] })
      toast.success('삭제됨')
    } catch (err: any) { toast.error(err?.message ?? '삭제 실패') }
  }

  const sorted = [...(findings ?? [])].sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1
    if (a.status !== 'open' && b.status === 'open') return 1
    return b.createdAt.localeCompare(a.createdAt)
  })

  const selectedCount = (findings ?? []).filter(f => f.submissionSelected).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 (title + date 만; result/저장/보고서 UI 는 1열 카드로 이동 또는 제거됨 — W3 / W4) */}
      <div style={{ padding: '16px 16px 12px', flexShrink: 0 }}>
        <div className="text-body-sm font-bold text-text-primary">{round?.title ?? '지적사항 목록'}</div>
        {round && <div className="text-caption leading-none text-text-secondary" style={{ marginTop: 2 }}>{fmtDate(round.date)}{round.endDate ? ` ~ ${fmtDate(round.endDate)}` : ''}</div>}
      </div>

      {/* 탭 헤더 */}
      <div className="border-b border-border-default" style={{ display: 'flex', flexShrink: 0 }}>
        {([
          { key: 'internal' as const, label: '내부용', count: sorted.length },
          { key: 'submission' as const, label: '제출용', count: selectedCount },
        ]).map(t => {
          const isActive = activeTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-label font-bold leading-none ${isActive ? 'text-accent' : 'text-text-tertiary'}`}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: isActive ? 'var(--surface-page)' : 'var(--surface-raised)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {t.label}
              <span
                className="text-caption font-bold leading-none"
                style={{
                  marginLeft: 6,
                  padding: '2px 7px',
                  borderRadius: 99,
                  background: isActive ? 'var(--accent)' : 'var(--surface-sunken)',
                  color: isActive ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                }}
              >{t.count}</span>
            </button>
          )
        })}
      </div>

      {/* 본문 */}
      {activeTab === 'internal' ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {isLoading && <div className={SKELETON_CLS} style={SKELETON_STYLE} />}
          {sorted.length === 0 && !isLoading && (
            <div className="text-label text-text-tertiary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>지적사항 없음</div>
          )}
          {sorted.map(f => (
            <div
              key={f.id}
              onClick={() => onSelectFinding(f.id)}
              className={`bg-surface-sunken rounded-md ${selectedFindingId === f.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${f.status === 'open' ? 'border-danger-bar' : 'border-safe-bar'}`}
              style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span className="text-label font-medium text-text-primary" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</span>
                <span className={`${f.status === 'open' ? 'bg-danger-bg text-danger' : 'bg-safe-bg text-safe'} text-caption font-bold leading-none rounded-sm`} style={{ padding: '1px 6px', flexShrink: 0 }}>{f.status === 'open' ? '미조치' : '완료'}</span>
              </div>
              <div className="text-caption leading-none text-text-secondary">{f.location ?? '위치 미지정'}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="text-caption leading-none text-text-tertiary">{fmtDate(f.createdAt)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); setEditingFinding(f) }} className="text-caption leading-none text-text-tertiary" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}>수정</button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(f) }} className="text-caption leading-none text-text-tertiary" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}>삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <SubmissionTabPanel roundId={roundId} isLocked={round?.submissionStatus === 'completed'} />
      )}

      {/* 수정 모달 — FindingEditModal 이 조치 완료 메모/사진 편집 capability 보유 (260520-x4q) */}
      {editingFinding && (
        <FindingEditModal
          scheduleItemId={roundId}
          finding={editingFinding}
          onClose={() => setEditingFinding(null)}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── 데스크톱: 2열 제출용 탭 (드래그&드롭 순서, 체크박스 제거 W10) ────────
// ══════════════════════════════════════════════════════════════════
function SubmissionTabPanel({ roundId, isLocked }: { roundId: string; isLocked: boolean }) {
  const queryClient = useQueryClient()
  const { data: findings, isLoading } = useQuery({
    queryKey: ['legal-findings', roundId],
    queryFn: () => legalApi.getFindings(roundId),
    enabled: !!roundId,
    staleTime: 30_000,
  })

  // 카드별 로컬 라벨 (미저장)
  const [localLabels, setLocalLabels] = useState<Record<string, string>>({})
  // 카드별 저장 상태 (saved / dirty / saving / error)
  const [saveStates, setSaveStates] = useState<Record<string, 'saved' | 'dirty' | 'saving' | 'error'>>({})
  // 디바운스 타이머
  const debounceTimers = useRef<Record<string, number>>({})
  // 드래그 중인 finding id (시각 효과용)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ kind: 'card'|'empty'|'divider'; id?: string; pos?: 'top'|'bottom' } | null>(null)

  // 라운드 바뀌면 로컬 상태 초기화
  useEffect(() => {
    setLocalLabels({})
    setSaveStates({})
    Object.values(debounceTimers.current).forEach(t => clearTimeout(t))
    debounceTimers.current = {}
  }, [roundId])

  const persistLabel = (fid: string, label: string) => {
    setSaveStates(prev => ({ ...prev, [fid]: 'saving' }))
    legalApi.updateFinding(roundId, fid, { submission_label: label })
      .then(() => setSaveStates(prev => ({ ...prev, [fid]: 'saved' })))
      .catch((err: any) => {
        setSaveStates(prev => ({ ...prev, [fid]: 'error' }))
        toast.error(err?.message ?? '라벨 저장 실패')
      })
  }

  const handleLabelChange = (fid: string, label: string) => {
    setLocalLabels(prev => ({ ...prev, [fid]: label }))
    setSaveStates(prev => ({ ...prev, [fid]: 'dirty' }))
    if (debounceTimers.current[fid]) clearTimeout(debounceTimers.current[fid])
    debounceTimers.current[fid] = window.setTimeout(() => persistLabel(fid, label), 500)
  }
  const handleSaveNow = (fid: string, label: string) => {
    if (debounceTimers.current[fid]) clearTimeout(debounceTimers.current[fid])
    persistLabel(fid, label)
  }

  const getDisplayLabel = (f: LegalFinding): string => {
    if (localLabels[f.id] !== undefined) return localLabels[f.id]
    if (f.submissionLabel !== null) return f.submissionLabel
    return `${f.location ?? ''} ${f.description}`.trim()
  }

  // 선택된 카드: submissionOrder ASC. 미선택: status open 우선 + createdAt DESC.
  const all = findings ?? []
  const selected = all.filter(f => f.submissionOrder > 0).sort((a, b) => a.submissionOrder - b.submissionOrder)
  const unselected = all
    .filter(f => f.submissionOrder === 0)
    .sort((a, b) => {
      if (a.status === 'open' && b.status !== 'open') return -1
      if (a.status !== 'open' && b.status === 'open') return 1
      return b.createdAt.localeCompare(a.createdAt)
    })

  // ── 순서 저장 mutation (optimistic) ──
  const orderMutation = useMutation({
    mutationFn: (ids: string[]) => legalApi.setSubmissionOrder(roundId, ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['legal-findings', roundId] })
      const prev = queryClient.getQueryData<LegalFinding[]>(['legal-findings', roundId])
      queryClient.setQueryData<LegalFinding[]>(['legal-findings', roundId], (cur) => {
        if (!cur) return cur
        const idxMap = new Map(ids.map((id, i) => [id, i + 1]))
        return cur.map(f => ({
          ...f,
          submissionOrder: idxMap.get(f.id) ?? 0,
          submissionSelected: idxMap.has(f.id),
        }))
      })
      return { prev }
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['legal-findings', roundId], ctx.prev)
      toast.error(err?.message ?? '순서 저장 실패')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['legal-findings', roundId] }),
  })

  // 드롭 → 새 순서 계산 후 mutation
  const reorder = (fromFid: string, target: { kind: 'top' } | { kind: 'card'; id: string; pos: 'top'|'bottom' } | { kind: 'divider' }) => {
    const curIds = selected.map(f => f.id)
    const without = curIds.filter(id => id !== fromFid)
    let nextIds: string[]
    if (target.kind === 'divider') {
      // 구분선 드롭 = 미포함 처리
      nextIds = without
    } else if (target.kind === 'top') {
      // 빈 영역 = 선택 영역의 맨 끝에 (현재 0개 → idx 0)
      nextIds = [...without, fromFid]
    } else {
      const targetIdx = without.indexOf(target.id)
      if (targetIdx === -1) {
        // 타겟이 미포함 카드면 = 미포함 → 미포함은 그대로, fromFid 만 제거
        nextIds = without
      } else {
        const insertAt = target.pos === 'top' ? targetIdx : targetIdx + 1
        nextIds = [...without.slice(0, insertAt), fromFid, ...without.slice(insertAt)]
      }
    }
    orderMutation.mutate(nextIds)
  }

  // ── 카드 드래그 핸들러 ──
  const onCardDragStart = (e: React.DragEvent<HTMLDivElement>, fid: string, photosOk: boolean) => {
    if (isLocked || !photosOk) { e.preventDefault(); return }
    e.dataTransfer.setData('text/plain', fid)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => setDraggingId(fid), 0)
  }
  const onCardDragEnd = () => { setDraggingId(null); setDropTarget(null) }
  const onCardDragOver = (e: React.DragEvent<HTMLDivElement>, targetFid: string) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const halfway = rect.top + rect.height / 2
    setDropTarget({ kind: 'card', id: targetFid, pos: e.clientY < halfway ? 'top' : 'bottom' })
  }
  const onCardDrop = (e: React.DragEvent<HTMLDivElement>, targetFid: string) => {
    e.preventDefault()
    const fromFid = e.dataTransfer.getData('text/plain')
    if (!fromFid || fromFid === targetFid) { setDropTarget(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    const halfway = rect.top + rect.height / 2
    reorder(fromFid, { kind: 'card', id: targetFid, pos: e.clientY < halfway ? 'top' : 'bottom' })
    setDropTarget(null)
  }
  const onEmptyDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const fromFid = e.dataTransfer.getData('text/plain')
    if (fromFid) reorder(fromFid, { kind: 'top' })
    setDropTarget(null)
  }
  const onDividerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const fromFid = e.dataTransfer.getData('text/plain')
    if (fromFid) reorder(fromFid, { kind: 'divider' })
    setDropTarget(null)
  }

  if (isLoading) {
    return <div style={{ flex: 1, padding: 16 }}><div className={SKELETON_CLS} style={SKELETON_STYLE} /></div>
  }
  if (all.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="text-label text-text-tertiary" style={{ textAlign: 'center', lineHeight: 1.6 }}>
          지적사항 없음<br />
          <span className="text-caption text-text-disabled">내부용 탭에서 먼저 지적/조치를 등록하세요</span>
        </div>
      </div>
    )
  }

  // ── 카드 렌더 ──
  const renderCard = (f: LegalFinding, isSelected: boolean, orderNum: number | null) => {
    const hasBefore = f.photoKeys.length > 0
    const hasAfter = f.resolutionPhotoKeys.length > 0
    const photosOk = hasBefore && hasAfter
    const label = getDisplayLabel(f)
    const saveState = saveStates[f.id] ?? 'saved'
    const cardDraggable = !isLocked && photosOk
    const cardDimmed = !photosOk && !isSelected
    const dropOver = dropTarget?.kind === 'card' && dropTarget.id === f.id
    const dragging = draggingId === f.id
    const pptPage = orderNum ? Math.ceil(orderNum / 2) : 0
    const pptSide = orderNum && orderNum % 2 === 1 ? '좌측' : orderNum ? '우측' : ''

    return (
      <div
        key={f.id}
        draggable={cardDraggable}
        onDragStart={(e) => onCardDragStart(e, f.id, photosOk)}
        onDragEnd={onCardDragEnd}
        onDragOver={(e) => onCardDragOver(e, f.id)}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(e) => onCardDrop(e, f.id)}
        className={`rounded-md border ${isSelected ? 'bg-surface-active border-accent' : 'bg-surface-raised border-border-strong'}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '18px 28px 1fr auto',
          gridTemplateRows: 'auto auto',
          columnGap: 10,
          rowGap: 8,
          padding: '12px 12px 12px 8px',
          opacity: dragging ? 0.35 : (cardDimmed ? 0.7 : 1),
          transition: 'transform .15s, opacity .15s, border-color .15s, box-shadow .15s',
          transform: dragging ? 'scale(0.98)' : 'none',
          boxShadow: dropOver
            ? (dropTarget?.pos === 'top' ? 'inset 0 3px 0 var(--accent)' : 'inset 0 -3px 0 var(--accent)')
            : 'none',
          userSelect: 'none',
          cursor: cardDraggable ? 'grab' : 'default',
        }}
      >
        {/* 드래그 핸들 (col 1, span 2 rows, 카드 세로 중앙) */}
        <div
          style={{
            gridColumn: 1, gridRow: '1 / span 2',
            alignSelf: 'center', justifySelf: 'center',
            color: cardDraggable ? 'var(--t3)' : 'var(--text-disabled)',
            opacity: cardDraggable ? 1 : 0.25,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 22,
          }}
          aria-hidden
        >
          <svg width={14} height={14} viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.4" /><circle cx="11" cy="3" r="1.4" />
            <circle cx="5" cy="8" r="1.4" /><circle cx="11" cy="8" r="1.4" />
            <circle cx="5" cy="13" r="1.4" /><circle cx="11" cy="13" r="1.4" />
          </svg>
        </div>

        {/* 순서 뱃지 슬롯 (col 2, span 2 rows, 카드 세로 중앙) */}
        <div
          style={{
            gridColumn: 2, gridRow: '1 / span 2',
            alignSelf: 'center', justifySelf: 'center',
            width: 28, height: 28,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isSelected && orderNum !== null && (
            <span
              className="bg-accent text-text-on-accent text-caption font-extrabold rounded-sm inline-flex items-center justify-center"
              style={{ height: 28, minWidth: 28, padding: '0 6px' }}
            >#{orderNum}</span>
          )}
        </div>

        {/* textarea (col 3, row 1) — 미선택 카드는 readonly */}
        <textarea
          value={label}
          readOnly={!isSelected || isLocked}
          onChange={(e) => isSelected && !isLocked && handleLabelChange(f.id, e.target.value)}
          placeholder=""
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className={`text-text-primary border rounded-sm focus:border-accent focus:outline-none ${isSelected ? 'bg-surface-sunken border-border-strong' : 'bg-surface-page border-border-strong text-text-tertiary'}`}
          style={{
            gridColumn: 3, gridRow: 1,
            padding: '8px 10px', fontSize: 12, fontFamily: 'inherit',
            minHeight: 56, lineHeight: 1.45, resize: 'vertical',
            width: '100%',
            borderStyle: isSelected ? 'solid' : 'dashed',
            cursor: isSelected ? 'text' : 'not-allowed',
          }}
        />

        {/* 저장 버튼 (col 4, row 1) — selected + dirty/error 일 때만 의미 */}
        <button
          type="button"
          onClick={() => handleSaveNow(f.id, label)}
          disabled={!isSelected || isLocked || !(saveState === 'dirty' || saveState === 'error')}
          className={`text-caption font-bold leading-none rounded-sm border-0 ${
            isSelected && (saveState === 'dirty' || saveState === 'error')
              ? 'bg-warning-bg text-warning'
              : 'bg-surface-sunken text-text-disabled'
          }`}
          style={{
            gridColumn: 4, gridRow: 1,
            padding: '0 12px', cursor: isSelected && (saveState === 'dirty' || saveState === 'error') ? 'pointer' : 'not-allowed',
            alignSelf: 'stretch', flexShrink: 0,
          }}
        >저장</button>

        {/* meta-row (col 3, row 2) — 사진 chip(좌) + PPT hint or 상태문구(우, textarea 우측 모서리) */}
        <div
          style={{
            gridColumn: 3, gridRow: 2,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 11, gap: 8,
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="text-caption font-bold text-text-tertiary">사진 :</span>
            <span className={`text-caption font-bold leading-none rounded-sm ${hasBefore ? 'bg-safe-bg text-safe' : 'bg-danger-bg text-danger'}`} style={{ padding: '2px 6px' }}>
              조치 전 {hasBefore ? <Check size={12} className="inline-block align-text-bottom ml-0.5" /> : <X size={12} className="inline-block align-text-bottom ml-0.5" />}
            </span>
            <span className={`text-caption font-bold leading-none rounded-sm ${hasAfter ? 'bg-safe-bg text-safe' : 'bg-danger-bg text-danger'}`} style={{ padding: '2px 6px' }}>
              조치 후 {hasAfter ? <Check size={12} className="inline-block align-text-bottom ml-0.5" /> : <X size={12} className="inline-block align-text-bottom ml-0.5" />}
            </span>
          </div>
          {/* 우측 끝: 선택 시 PPT hint, 미선택 + 사진부족 시 안내문구 */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            {isSelected ? (
              <span className="text-text-tertiary">PPT <b className="text-accent font-bold">{pptPage}페이지 {pptSide}</b></span>
            ) : !photosOk ? (
              <span className="text-danger">사진 부족 — PPT 포함 불가</span>
            ) : (
              <span className="text-text-tertiary">—</span>
            )}
          </div>
        </div>

        {/* save-status (col 4, row 2) — 인디케이터 + 저장됨/저장중 (save-btn 좌측 모서리 정렬) */}
        {isSelected && (
          <div
            style={{
              gridColumn: 4, gridRow: 2,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, whiteSpace: 'nowrap',
            }}
            className={`leading-none ${
              isLocked ? 'text-text-tertiary' :
              saveState === 'saving' ? 'text-accent' :
              saveState === 'dirty'  ? 'text-warning' :
              saveState === 'error'  ? 'text-danger'  :
              'text-safe'
            }`}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            <span>{
              isLocked          ? <><Lock size={12} className="inline-block align-text-bottom mr-1" />제출 완료</> :
              saveState === 'saving' ? '저장중...' :
              saveState === 'dirty'  ? '변경됨' :
              saveState === 'error'  ? '저장 실패' :
              '저장됨'
            }</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* 상단: 선택된 카드 OR 빈 영역 */}
      {selected.length === 0 ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDropTarget({ kind: 'empty' }) }}
          onDragLeave={() => setDropTarget(null)}
          onDrop={onEmptyDrop}
          style={{
            border: `1.5px dashed ${dropTarget?.kind === 'empty' ? 'var(--accent)' : 'var(--border-strong)'}`,
            background: dropTarget?.kind === 'empty' ? 'rgba(59,130,246,0.06)' : 'transparent',
            borderRadius: 10, minHeight: 116,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: 16, textAlign: 'center',
            color: dropTarget?.kind === 'empty' ? 'var(--accent)' : 'var(--t3)',
            transition: 'border-color .15s, background .15s',
          }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
          <span className="text-label font-bold" style={{ color: dropTarget?.kind === 'empty' ? 'var(--accent)' : 'var(--t2)' }}>
            PPT 에 포함할 카드를 여기로 드래그
          </span>
          <span className="text-caption">아래 미포함 카드를 잡고 위로 끌면 자동으로 #1 부여</span>
        </div>
      ) : (
        selected.map((f, idx) => renderCard(f, true, idx + 1))
      )}

      {/* 구분선 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDropTarget({ kind: 'divider' }) }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={onDividerDrop}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 2px', fontSize: 11,
          color: dropTarget?.kind === 'divider' ? 'var(--accent)' : 'var(--t3)',
          userSelect: 'none',
        }}
      >
        <div style={{ flex: 1, height: 1, background: dropTarget?.kind === 'divider' ? 'var(--accent)' : 'var(--bd)' }} />
        <span>아래는 PPT 미포함</span>
        <div style={{ flex: 1, height: 1, background: dropTarget?.kind === 'divider' ? 'var(--accent)' : 'var(--bd)' }} />
      </div>

      {/* 하단: 미포함 카드 */}
      {unselected.map(f => renderCard(f, false, null))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── 데스크톱: 3열 PPT 미리보기 (제출용 탭 활성 시) ────────────────────
// ══════════════════════════════════════════════════════════════════
function SubmissionPreviewPanel({ roundId }: { roundId: string }) {
  const queryClient = useQueryClient()
  const { data: round } = useQuery({
    queryKey: ['legal-round', roundId],
    queryFn: () => legalApi.get(roundId),
    enabled: !!roundId,
  })
  const { data: findings, isLoading } = useQuery({
    queryKey: ['legal-findings', roundId],
    queryFn: () => legalApi.getFindings(roundId),
    enabled: !!roundId,
    staleTime: 30_000,
  })

  // 선택된 finding 만 (submission_order > 0 + 사진 둘 다 있음 = PPT 포함). W10: order 순으로 정렬.
  const eligibleFindings = (findings ?? [])
    .filter(f => f.submissionSelected && f.photoKeys.length > 0 && f.resolutionPhotoKeys.length > 0)
    .sort((a, b) => {
      const ao = a.submissionOrder > 0 ? a.submissionOrder : 999999
      const bo = b.submissionOrder > 0 ? b.submissionOrder : 999999
      if (ao !== bo) return ao - bo
      return a.createdAt.localeCompare(b.createdAt)
    })

  // 자동저장 상태
  const [genState, setGenState] = useState<'saved' | 'dirty' | 'saving' | 'error' | 'idle'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const autoSaveTimer = useRef<number | null>(null)
  const lastEligibleSignature = useRef<string>('')

  // eligible findings 의 signature (id + label + 체크/사진 상태) — 변경 감지용
  const signature = JSON.stringify(eligibleFindings.map(f => ({
    id: f.id,
    l: f.submissionLabel,
    p: f.photoKeys.length,
    r: f.resolutionPhotoKeys.length,
  })))

  const generateMutation = useMutation({
    mutationFn: () => legalApi.generateSubmissionPpt(roundId),
    onMutate: () => setGenState('saving'),
    onSuccess: () => {
      setGenState('saved')
      setLastSavedAt(Date.now())
      lastEligibleSignature.current = signature
      // round 갱신 (ppt_file_key) → 1열 카드 지적조치사진 버튼 활성
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', roundId] })
      toast.success('지적조치사진 PPT 저장')
    },
    onError: (err: any) => {
      setGenState('error')
      toast.error(err?.message ?? 'PPT 생성 실패')
    },
  })

  const isLocked = round?.submissionStatus === 'completed'
  const count = eligibleFindings.length

  // 변경 감지: signature 가 lastEligibleSignature 와 다르면 dirty
  useEffect(() => {
    if (count === 0 || isLocked) return
    if (genState === 'idle' && round?.pptFileKey) {
      // 이미 저장된 상태로 진입
      setGenState('saved')
      lastEligibleSignature.current = signature
      return
    }
    if (genState === 'idle' && !round?.pptFileKey) {
      // 미생성 상태로 진입 → dirty
      setGenState('dirty')
      return
    }
    if (signature !== lastEligibleSignature.current && genState !== 'saving') {
      setGenState('dirty')
    }
  }, [signature, round?.pptFileKey, count, isLocked, genState])

  // 10초 디바운스 자동저장 (dirty 일 때만)
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = null
    }
    if (genState !== 'dirty' || count === 0 || isLocked) return
    autoSaveTimer.current = window.setTimeout(() => {
      generateMutation.mutate()
    }, 10_000)
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genState, count, isLocked])

  const handleSaveNow = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    generateMutation.mutate()
  }

  // 인디케이터 라벨
  const indicatorLabel = (() => {
    if (count === 0) return '대상 없음'
    if (isLocked) return <><Lock size={12} className="inline-block align-text-bottom mr-1" />제출 완료</>
    if (genState === 'saving') return '저장중...'
    if (genState === 'error') return '저장 실패'
    if (genState === 'dirty') return '변경됨 · 자동저장 대기'
    if (genState === 'saved') {
      if (!lastSavedAt) return '저장됨'
      const sec = Math.floor((Date.now() - lastSavedAt) / 1000)
      return sec < 10 ? `저장됨 · 방금` : `저장됨 · ${sec}초 전`
    }
    return '대기'
  })()
  const indicatorColor = (() => {
    if (count === 0 || isLocked) return 'text-text-tertiary'
    if (genState === 'saving') return 'text-accent'
    if (genState === 'error') return 'text-danger'
    if (genState === 'dirty') return 'text-warning'
    if (genState === 'saved') return 'text-safe'
    return 'text-text-tertiary'
  })()

  // 라벨 (DB submissionLabel || prefill)
  const labelFor = (f: LegalFinding): string =>
    f.submissionLabel ?? `${f.location ?? ''} ${f.description}`.trim()

  // 본문 슬라이드 = 지적 2건씩
  const pages: Array<{ left: LegalFinding | null; right: LegalFinding | null }> = []
  for (let i = 0; i < eligibleFindings.length; i += 2) {
    pages.push({ left: eligibleFindings[i] ?? null, right: eligibleFindings[i + 1] ?? null })
  }
  const totalPages = pages.length

  const [pageIdx, setPageIdx] = useState(0)
  useEffect(() => {
    if (pageIdx >= totalPages && totalPages > 0) setPageIdx(totalPages - 1)
  }, [totalPages, pageIdx])
  const currentPage = pages[pageIdx] ?? null

  // PPT 표지 텍스트 — "{연도}년 소방 {종합정밀|작동기능}점검" (상반기/하반기 제외)
  const coverYear = round?.date?.slice(0, 4) ?? ''
  const coverKind = round?.title?.includes('종합') ? '종합정밀점검' : '작동기능점검'
  const coverTitle = round ? `${coverYear}년 ${coverKind}` : '지적사항 조치 작업사진'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-page)' }}>
      {/* 헤더: 타이틀 (좌) + [인디케이터 + 저장하기] (우, bottom 정렬) */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div className="text-label font-bold text-text-primary">
          지적사항 조치 작업사진 <span className="text-accent">{count}</span>건
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div className={`text-caption ${indicatorColor}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, lineHeight: 1, paddingBottom: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            {indicatorLabel}
          </div>
          <button
            type="button"
            onClick={handleSaveNow}
            disabled={count === 0 || isLocked || genState === 'saving'}
            className={`border-0 ${count === 0 || isLocked || genState === 'saving' ? 'bg-surface-sunken text-text-disabled' : genState === 'dirty' || genState === 'error' ? 'bg-warning-bg text-warning' : 'bg-accent text-text-on-accent'}`}
            style={{ height: 32, padding: '0 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: count === 0 || isLocked || genState === 'saving' ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {genState === 'saving' ? '저장중...' : <><Save size={14} className="inline-block align-text-bottom mr-1" />저장하기</>}
          </button>
        </div>
      </div>

      {/* 본문: 표지 + 현재 페이지 슬라이드 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isLoading ? (
          <div className={SKELETON_CLS} style={SKELETON_STYLE} />
        ) : count === 0 ? (
          <div className="text-label text-text-tertiary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.6 }}>
            제출용 탭에서 PPT 에 포함할 지적사항을 체크해주세요<br />
            <span className="text-caption text-text-disabled">사진이 조치 전/후 모두 있어야 PPT 포함 가능</span>
          </div>
        ) : (
          <>
            {/* 표지 (A4 가로 297:210) */}
            <div>
              <div className="text-caption text-text-tertiary" style={{ marginBottom: 4 }}>표지 (slide 1)</div>
              <div style={{ aspectRatio: '297/210', background: '#fff', color: '#000', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                <div style={{ fontSize: 36, fontWeight: 700 }}>{coverTitle}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>지적사항 조치 작업사진</div>
                <div style={{ fontSize: 18, marginTop: 24, color: '#444' }}>차바이오 컴플렉스</div>
              </div>
            </div>

            {/* 본문 슬라이드 */}
            {currentPage && (
              <div>
                <div className="text-caption text-text-tertiary" style={{ marginBottom: 4 }}>
                  조치 전 / 후 (slide {pageIdx + 2} of {totalPages + 1}) — A4 가로
                </div>
                <div style={{ aspectRatio: '297/210', background: '#fff', color: '#000', borderRadius: 8, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr auto 1fr', gap: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                  {/* Row 1: 라벨 (조치 전) */}
                  <SlideLabelCell text={currentPage.left ? `${labelFor(currentPage.left)} 조치 전` : ''} />
                  <SlideLabelCell text={currentPage.right ? `${labelFor(currentPage.right)} 조치 전` : ''} />
                  {/* Row 2: 사진 (조치 전) */}
                  <SlidePhotoCell src={currentPage.left?.photoKeys[0]} />
                  <SlidePhotoCell src={currentPage.right?.photoKeys[0]} />
                  {/* Row 3: 라벨 (조치 후) */}
                  <SlideLabelCell text={currentPage.left ? `${labelFor(currentPage.left)} 조치 후` : ''} />
                  <SlideLabelCell text={currentPage.right ? `${labelFor(currentPage.right)} 조치 후` : ''} />
                  {/* Row 4: 사진 (조치 후) */}
                  <SlidePhotoCell src={currentPage.left?.resolutionPhotoKeys[0]} />
                  <SlidePhotoCell src={currentPage.right?.resolutionPhotoKeys[0]} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 페이지 네비 */}
      {totalPages > 0 && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-default)', background: 'var(--surface-raised)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setPageIdx(i => Math.max(0, i - 1))}
            disabled={pageIdx === 0}
            className="bg-surface-sunken border border-border-strong text-text-primary disabled:text-text-disabled disabled:border-border-default disabled:bg-transparent"
            style={{ width: 36, height: 36, borderRadius: 6, fontSize: 16, cursor: pageIdx === 0 ? 'not-allowed' : 'pointer' }}
          >◀</button>
          <div className="text-label font-bold text-text-primary" style={{ minWidth: 80, textAlign: 'center' }}>
            {pageIdx + 1} / {totalPages}
          </div>
          <button
            type="button"
            onClick={() => setPageIdx(i => Math.min(totalPages - 1, i + 1))}
            disabled={pageIdx >= totalPages - 1}
            className="bg-surface-sunken border border-border-strong text-text-primary disabled:text-text-disabled disabled:border-border-default disabled:bg-transparent"
            style={{ width: 36, height: 36, borderRadius: 6, fontSize: 16, cursor: pageIdx >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
          >▶</button>
        </div>
      )}

      {isLocked && (
        <div className="bg-safe-bg text-safe text-caption font-bold" style={{ padding: '6px 16px', textAlign: 'center', flexShrink: 0 }}>
          <Lock size={14} className="inline-block align-text-bottom mr-1" />제출 완료된 점검 — 재생성 불가
        </div>
      )}
    </div>
  )
}

function SlideLabelCell({ text }: { text: string }) {
  return (
    <div style={{ border: '1px solid #888', background: '#f5f5f5', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 11, fontWeight: 700, lineHeight: 1.4, overflow: 'hidden' }}>
      {text}
    </div>
  )
}

function SlidePhotoCell({ src }: { src: string | undefined }) {
  return (
    <div style={{ border: '1px solid #888', background: '#e5e5e5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {src ? (
        <img src={'/api/uploads/' + src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: '#888', fontSize: 11 }}>—</span>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── 데스크톱: 우측 패널 (지적사항 상세) ──────────────────────────────
// ══════════════════════════════════════════════════════════════════
function FindingDetailPanel({ roundId, findingId }: { roundId: string; findingId: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [memo, setMemo] = useState('')
  const staff = useAuthStore(s => s.staff)
  const resPhotos = useMultiPhotoUpload()
  const [downloading, setDownloading] = useState(false)

  const { data: finding, isLoading } = useQuery({
    queryKey: ['legal-finding', roundId, findingId],
    queryFn: () => legalApi.getFinding(roundId, findingId),
    enabled: !!roundId && !!findingId,
  })

  const resolveMutation = useMutation({
    mutationFn: async () => {
      const keys = await resPhotos.uploadAll()
      return legalApi.resolveFinding(roundId, findingId, {
        resolution_memo: memo.trim(),
        resolution_photo_keys: keys.length > 0 ? keys : undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-finding', roundId, findingId] })
      queryClient.invalidateQueries({ queryKey: ['legal-findings', roundId] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', roundId] })
      toast.success('조치 완료')
      resPhotos.reset()
      setMemo('')
    },
    onError: () => toast.error('조치 처리 실패'),
  })

  async function handleDownload() {
    if (!finding) return
    setDownloading(true)
    try {
      const { zipSync } = await import('fflate')
      const files: Record<string, Uint8Array> = {}; const enc = new TextEncoder()
      files['내용.txt'] = enc.encode(buildMetaTxt(finding))
      const pRes = await Promise.allSettled(finding.photoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer())))
      pRes.forEach((r, j) => { if (r.status === 'fulfilled') files[`지적사진-${j+1}.jpg`] = new Uint8Array(r.value) })
      const rRes = await Promise.allSettled(finding.resolutionPhotoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer())))
      rRes.forEach((r, j) => { if (r.status === 'fulfilled') files[`조치사진-${j+1}.jpg`] = new Uint8Array(r.value) })
      const z = zipSync(files, { level: 6 })
      const blob = new Blob([z.buffer as ArrayBuffer], { type: 'application/zip' })
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url
      a.download = `지적사항_${(finding.location ?? '').replace(/[\/\\:*?"<>|]/g, '_')}.zip`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 3000)
      toast.success('다운로드 완료')
    } catch { toast.error('다운로드 실패') }
    finally { setDownloading(false) }
  }

  const isSubmitting = resolveMutation.isPending || resPhotos.isUploading

  if (isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin text-accent" size={24} />
    </div>
  )
  if (!finding) return <div className="text-label text-text-tertiary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>항목을 불러오지 못했습니다.</div>

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="text-body-sm font-bold text-text-primary">지적 상세</div>
        {staff?.role === 'admin' && (
          <button onClick={handleDownload} disabled={downloading} className="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm" style={{ height: 28, padding: '0 10px', cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.5 : 1 }}>{downloading ? '...' : '다운로드'}</button>
        )}
      </div>

      {/* 지적 정보 */}
      <div style={{ marginBottom: 16 }}>
        <div className="text-caption leading-none font-bold text-text-tertiary" style={{ marginBottom: 8 }}>지적 정보</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <KVRow label="지적 내용"><span style={{ whiteSpace: 'pre-wrap' }}>{finding.description}</span></KVRow>
          <KVRow label="위치">{finding.location ?? '-'}</KVRow>
          <KVRow label="등록일">{fmtDateTime(finding.createdAt)}</KVRow>
          <KVRow label="등록자">{finding.createdByName ?? finding.createdBy}</KVRow>
        </div>
      </div>

      {/* 지적 사진 */}
      <div style={{ marginBottom: 16 }}>
        <div className="text-caption leading-none font-bold text-text-tertiary" style={{ marginBottom: 8 }}>지적 사진</div>
        {finding.photoKeys.length > 0 ? <PhotoGrid photoUrls={finding.photoKeys.map(k => '/api/uploads/' + k)} /> : <div className="text-caption leading-none text-text-tertiary">사진 없음</div>}
      </div>

      {/* 조치 입력 (open) */}
      {finding.status === 'open' && (
        <div className="border-t border-border-default" style={{ paddingTop: 16 }}>
          <div className="text-caption leading-none font-bold text-text-tertiary" style={{ marginBottom: 8 }}>조치 내용</div>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="조치 내용을 입력하세요" rows={3} className="bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md" style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical', outline: 'none' }} />
          <div style={{ marginTop: 10 }}>
            <div className="text-caption leading-none font-bold text-text-tertiary" style={{ marginBottom: 6 }}>조치 사진 (최대 5장)</div>
            <input ref={resPhotos.cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={resPhotos.handleFiles} />
            <input ref={resPhotos.albumRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={resPhotos.handleFiles} />
            <PhotoSourceModal open={resPhotos.showPicker} onClose={resPhotos.closePicker} onCamera={resPhotos.pickCamera} onAlbum={resPhotos.pickAlbum} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {resPhotos.slots.map((slot, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={slot.preview} alt="" className="border border-border-default rounded-sm" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                  <button onClick={() => resPhotos.removeSlot(i)} className="text-text-on-accent text-caption font-bold leading-none" style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: 'var(--status-danger-bar)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {resPhotos.canAdd && (
                <button onClick={resPhotos.openPicker} className="bg-surface-sunken text-text-tertiary rounded-sm" style={{ width: 64, height: 64, border: '1px dashed var(--border-strong)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <Camera size={18} />
                  <span className="text-caption leading-none font-bold">첨부</span>
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => { if (!memo.trim()) { toast.error('조치 내용을 입력하세요'); return }; resolveMutation.mutate() }}
            disabled={isSubmitting}
            className="text-text-on-accent text-label font-bold rounded-md"
            style={{ marginTop: 12, width: '100%', height: 44, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1, background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}
          >{isSubmitting ? '처리 중...' : '조치 완료'}</button>
        </div>
      )}

      {/* 조치 결과 (resolved) */}
      {finding.status === 'resolved' && (
        <div className="border-t border-border-default" style={{ paddingTop: 16 }}>
          <div className="text-caption leading-none font-bold text-text-tertiary" style={{ marginBottom: 8 }}>조치 결과</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <KVRow label="조치일시">{fmtDateTime(finding.resolvedAt)}</KVRow>
            <KVRow label="조치자">{finding.resolvedByName ?? finding.resolvedBy ?? '-'}</KVRow>
            <KVRow label="조치 내용"><span style={{ whiteSpace: 'pre-wrap' }}>{finding.resolutionMemo ?? '-'}</span></KVRow>
          </div>
          {finding.resolutionPhotoKeys.length > 0 && (
            <div style={{ marginTop: 10 }}><PhotoGrid photoUrls={finding.resolutionPhotoKeys.map(k => '/api/uploads/' + k)} /></div>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── 메인 페이지 ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
export default function LegalPage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as TabKey) || '전체'
  const setTab = (t: TabKey) => setSearchParams(prev => { prev.set('tab', t); return prev }, { replace: true })

  const [year, setYear] = useState(new Date().getFullYear().toString())
  const years = genYears()
  const { staff } = useAuthStore()
  const isAdmin = staff?.role === 'admin'
  const queryClient = useQueryClient()

  // 카드별 토글 미저장 상태 (사용자가 토글했지만 저장 안 한 값)
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, 'pending' | 'completed'>>({})
  const [savingRoundId, setSavingRoundId] = useState<string | null>(null)

  const saveStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'completed' }) =>
      legalApi.updateResult(id, { submission_status: status }),
    onMutate: ({ id }) => setSavingRoundId(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      setPendingStatuses(prev => { const next = { ...prev }; delete next[id]; return next })
      toast.success('제출 상태 저장됨')
    },
    onError: (err: any) => toast.error(err?.message ?? '저장 실패'),
    onSettled: () => setSavingRoundId(null),
  })

  // 결과내역서 업로드 (admin 전용; 카드 클릭 시 hidden file input 트리거)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)
  const [uploadingRoundId, setUploadingRoundId] = useState<string | null>(null)
  const triggerUpload = (roundId: string) => {
    setUploadTargetId(roundId)
    uploadInputRef.current?.click()
  }
  const handleReportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const targetId = uploadTargetId
    e.target.value = ''
    setUploadTargetId(null)
    if (!file || !targetId) return
    setUploadingRoundId(targetId)
    try {
      const form = new FormData()
      form.append('file', file, file.name)
      form.append('folder', `legal/${targetId}/report`)
      const token = useAuthStore.getState().token
      const res = await fetch('/api/uploads', { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      if (!json.success || !json.data?.key) throw new Error('upload failed')
      await legalApi.updateResult(targetId, { report_file_key: json.data.key })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', targetId] })
      toast.success('결과내역서 업로드')
    } catch (err: any) {
      toast.error(err?.message ?? '업로드 실패')
    } finally {
      setUploadingRoundId(null)
    }
  }

  // 결과내역서 삭제 (admin 전용, 새 파일 업로드 대비)
  const deleteReportMutation = useMutation({
    mutationFn: (id: string) => legalApi.updateResult(id, { report_file_key: null }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      toast.success('결과내역서 삭제')
    },
    onError: (err: any) => toast.error(err?.message ?? '삭제 실패'),
  })
  const handleDeleteReport = (round: LegalRound) => {
    if (!confirm(`"${round.title}" 의 결과내역서를 삭제하시겠습니까?\n(R2 의 파일도 함께 정리 권장)`)) return
    deleteReportMutation.mutate(round.id)
  }

  // 데스크톱 3분할 상태
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null)
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null)
  // 2열 탭 (internal=기존 finding list / submission=PPT 제출용 W5)
  const [activeTab, setActiveTab] = useState<'internal' | 'submission'>('internal')

  const { data: rounds, isLoading, isError, refetch } = useQuery({
    queryKey: ['legal-rounds', year],
    queryFn: () => legalApi.list(year),
    staleTime: 30_000,
  })
  const filtered = filterRounds(rounds ?? [], tab)

  // ── 라운드 카드 클릭 ──
  function handleRoundClick(round: LegalRound) {
    if (isDesktop) {
      setSelectedRoundId(round.id)
      setSelectedFindingId(null)
    } else {
      navigate(`/legal/${round.id}`)
    }
  }

  // ── 좌측: 라운드 목록 ──
  const roundList = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 필터 */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`${tab === t.key ? 'bg-surface-active text-text-primary' : 'text-text-tertiary'} text-caption font-bold leading-none`}
              style={{ flex: 1, height: 38, border: 'none', background: tab === t.key ? undefined : 'transparent', cursor: 'pointer', borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent' }}
            >{t.label}</button>
          ))}
        </div>
        <div style={{ padding: '6px 12px' }}>
          <select value={year} onChange={e => setYear(e.target.value)} className="bg-surface-sunken border border-border-strong text-caption leading-none text-text-primary rounded-sm" style={{ padding: '4px 8px', cursor: 'pointer', appearance: 'none' }}>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
      </div>

      {/* 카드 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {isLoading && <><div className={SKELETON_CLS} style={SKELETON_STYLE} /><div className={SKELETON_CLS} style={SKELETON_STYLE} /><div className={SKELETON_CLS} style={SKELETON_STYLE} /></>}
        {isError && !isLoading && (
          <div className="text-label text-text-secondary" style={{ textAlign: 'center', padding: 24 }}>
            <span>불러오기 실패</span>
            <button onClick={() => refetch()} className="bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm" style={{ display: 'block', margin: '8px auto', border: 'none', padding: '6px 16px', cursor: 'pointer' }}>재시도</button>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-caption leading-none text-text-tertiary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 16 }}>점검 이력 없음</div>
        )}
        {!isLoading && !isError && filtered.map(round => {
          const effectiveStatus = pendingStatuses[round.id] ?? round.submissionStatus
          const isDirty = effectiveStatus !== round.submissionStatus
          const isLocked = round.submissionStatus === 'completed' && !isDirty
          const isSaving = savingRoundId === round.id
          return (
          <div
            key={round.id}
            onClick={() => handleRoundClick(round)}
            className={`bg-surface-sunken rounded-md ${selectedRoundId === round.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${stripBySubmission(effectiveStatus)}`}
            style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
              <span className="text-label font-bold text-text-primary" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingTop: 4 }}>{round.title}</span>
              {isDesktop && (
                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    disabled={!isAdmin || isLocked || isSaving}
                    onClick={() => {
                      if (!isAdmin || isLocked) return
                      setPendingStatuses(prev => ({ ...prev, [round.id]: effectiveStatus === 'completed' ? 'pending' : 'completed' }))
                    }}
                    className={`text-caption font-bold leading-none rounded-sm ${effectiveStatus === 'completed' ? 'bg-safe-bg text-safe' : 'bg-warning-bg text-warning'}`}
                    style={{ height: 26, padding: '0 10px', cursor: isAdmin && !isLocked ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}
                  >
                    제출 {effectiveStatus === 'completed' ? '완료' : '미완료'}
                  </button>
                  {isLocked ? (
                    <button
                      type="button"
                      disabled
                      className="text-caption font-bold leading-none rounded-sm bg-safe-bg text-safe"
                      style={{ height: 26, padding: '0 10px', cursor: 'default', whiteSpace: 'nowrap' }}
                    ><Lock size={12} className="inline-block align-text-bottom mr-1" />종결</button>
                  ) : (
                    <button
                      type="button"
                      disabled={!isAdmin || !isDirty || isSaving}
                      onClick={() => {
                        if (!isAdmin || !isDirty) return
                        saveStatusMutation.mutate({ id: round.id, status: effectiveStatus })
                      }}
                      className={`text-caption font-bold leading-none rounded-sm border-0 ${isDirty ? 'bg-warning-bg text-warning' : 'bg-accent text-text-on-accent'} disabled:bg-surface-sunken disabled:text-text-disabled`}
                      style={{ height: 26, padding: '0 10px', cursor: isAdmin && isDirty ? 'pointer' : 'not-allowed' }}
                    >
                      {isSaving ? '저장중...' : isDirty ? '저장 *' : '저장'}
                    </button>
                  )}
                </div>
              )}
              {!isDesktop && (
                <span
                  className={`text-caption font-bold leading-none rounded-sm ${effectiveStatus === 'completed' ? 'bg-safe-bg text-safe' : 'bg-warning-bg text-warning'}`}
                  style={{ padding: '3px 8px', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  제출 {effectiveStatus === 'completed' ? '완료' : '미완료'}
                </span>
              )}
            </div>
            <div className="text-caption leading-none text-text-secondary">
              {fmtDate(round.date)} · 지적 {round.findingCount} · 완료 {round.resolvedCount}
            </div>
            <div style={{ display: 'flex', gap: 6, paddingTop: 6, borderTop: '1px dashed var(--border-default)' }}>
              {/* 결과내역서: reportFileKey 있으면 다운로드 + (데스크톱 admin && !locked) X 삭제 / 없으면 (데스크톱 admin) 업로드 */}
              {round.reportFileKey ? (
                <div style={{ flex: 1, position: 'relative' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (round.reportFileKey) {
                        downloadWithName('/api/uploads/' + round.reportFileKey, reportFileName(round))
                      }
                    }}
                    className="text-caption font-bold leading-none rounded-sm bg-surface-raised border border-border-strong text-text-primary"
                    style={{ width: '100%', height: 32, cursor: 'pointer' }}
                  >↓ 결과내역서</button>
                  {isDesktop && isAdmin && !isLocked && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteReport(round) }}
                      title="결과내역서 삭제 (새 파일 업로드 시)"
                      className="bg-danger-bar text-text-on-accent border-0"
                      style={{
                        position: 'absolute',
                        top: -6, right: -6,
                        width: 18, height: 18,
                        borderRadius: '50%',
                        fontSize: 12,
                        lineHeight: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >×</button>
                  )}
                </div>
              ) : (
                (() => {
                  const canUpload = isDesktop && isAdmin && !isLocked
                  const isUploading = uploadingRoundId === round.id
                  return (
                    <button
                      type="button"
                      disabled={!canUpload || isUploading}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canUpload) triggerUpload(round.id)
                      }}
                      className={`text-caption font-bold leading-none rounded-sm ${canUpload ? 'bg-surface-raised border border-border-strong text-text-primary' : 'border border-border-default text-text-disabled'}`}
                      style={{ flex: 1, height: 32, cursor: canUpload ? 'pointer' : 'not-allowed', background: canUpload ? undefined : 'transparent' }}
                    >
                      {isUploading ? '업로드중...' : (canUpload ? '⬆ 결과내역서 업로드' : '↓ 결과내역서 (미업로드)')}
                    </button>
                  )
                })()
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (round.pptFileKey) {
                    downloadWithName('/api/uploads/' + round.pptFileKey, pptFileName(round))
                  }
                }}
                disabled={!round.pptFileKey}
                className={`text-caption font-bold leading-none rounded-sm ${round.pptFileKey ? 'bg-surface-raised border border-border-strong text-text-primary' : 'border border-border-default text-text-disabled'}`}
                style={{ flex: 1, height: 32, cursor: round.pptFileKey ? 'pointer' : 'not-allowed', background: round.pptFileKey ? undefined : 'transparent' }}
              >
                ↓ 지적조치사진{round.pptFileKey ? '' : ' (미생성)'}
              </button>
            </div>
          </div>
          )
        })}
      </div>

      {/* 결과내역서 업로드용 hidden file input — 카드의 업로드 버튼이 ref 통해 트리거 */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleReportFileChange}
      />
    </div>
  )

  // ── 데스크톱 3분할 ──
  if (isDesktop) {
    return (
      <div className="bg-surface-page" style={{ display: 'flex', height: '100%' }}>
        <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

        {/* 좌측: 라운드 목록 — 페이지 제목은 App.tsx 헤더에서 표시 */}
        <div className="border-r border-border-default" style={{ width: 500, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {roundList}
        </div>

        {/* 중앙: 지적사항 목록 */}
        <div className="border-r border-border-default" style={{ width: 500, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {selectedRoundId ? (
            <FindingsPanel
              key={selectedRoundId}
              roundId={selectedRoundId}
              onSelectFinding={fid => setSelectedFindingId(fid)}
              selectedFindingId={selectedFindingId}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <div className="text-label text-text-tertiary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>좌측에서 점검을 선택하세요</div>
          )}
        </div>

        {/* 우측: 상세 — 2열 탭에 따라 swap */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'submission' && selectedRoundId ? (
            <SubmissionPreviewPanel key={selectedRoundId} roundId={selectedRoundId} />
          ) : selectedFindingId && selectedRoundId ? (
            <FindingDetailPanel key={selectedFindingId} roundId={selectedRoundId} findingId={selectedFindingId} />
          ) : (
            <div className="text-label text-text-tertiary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedRoundId ? '중앙에서 지적사항을 선택하세요' : '점검을 먼저 선택하세요'}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── 모바일 ──
  return (
    <div className="bg-surface-page" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      <div className="bg-surface-raised border-b border-border-default" style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
        <button
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="text-text-primary"
          style={{ position: 'absolute', left: 8, width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        ><ChevronLeft size={20} /></button>
        <span className="text-body font-bold text-text-primary">소방 점검 관리</span>
      </div>

      {/* 필터 */}
      <div className="bg-surface-raised border-b border-border-default" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`${tab === t.key ? 'bg-surface-active text-text-primary' : 'text-text-tertiary'} text-caption font-bold leading-none`}
              style={{ flex: 1, height: 44, border: 'none', background: tab === t.key ? undefined : 'transparent', cursor: 'pointer', borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent' }}
            >{t.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
          <select value={year} onChange={e => setYear(e.target.value)} className="bg-surface-sunken border border-border-strong text-label leading-none text-text-primary rounded-sm" style={{ padding: '6px 12px', cursor: 'pointer', appearance: 'none' }}>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
      </div>

      {/* 카드 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading && <><div className={SKELETON_CLS} style={SKELETON_STYLE} /><div className={SKELETON_CLS} style={SKELETON_STYLE} /><div className={SKELETON_CLS} style={SKELETON_STYLE} /></>}
        {isError && !isLoading && (
          <div className="text-body-sm text-text-secondary" style={{ textAlign: 'center', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span>목록을 불러오지 못했습니다.</span>
            <button onClick={() => refetch()} className="bg-accent text-text-on-accent text-body-sm font-bold rounded-sm" style={{ border: 'none', padding: '8px 24px', cursor: 'pointer' }}>다시 시도</button>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
            <div className="text-body font-bold text-text-primary">소방 점검 관리 이력 없음</div>
            <div className="text-caption leading-relaxed text-text-secondary" style={{ textAlign: 'center' }}>소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.</div>
          </div>
        )}
        {!isLoading && !isError && filtered.map(round => (
          <div
            key={round.id}
            onClick={() => handleRoundClick(round)}
            className={`bg-surface-sunken rounded-md border border-border-default border-l-[3px] ${accentColor(round.result)}`}
            style={{ padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span className="text-body-sm font-bold text-text-primary" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{round.title}</span>
              <ResultBadge result={round.result} />
            </div>
            <div className="text-caption leading-relaxed text-text-secondary">
              {fmtDate(round.date)}{round.endDate ? ` ~ ${fmtDate(round.endDate)}` : ''} · 지적 {round.findingCount}건 · 완료 {round.resolvedCount}건
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
