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
      className={`${m?.cls ?? 'bg-transparent text-text-tertiary'} text-caption font-bold leading-none rounded-sm px-2 py-[2px] shrink-0`}
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
    <div className="flex gap-3 items-start">
      <span className="text-caption leading-none text-text-tertiary w-[64px] shrink-0">{label}</span>
      <span className="text-label text-text-primary flex-1 leading-[1.5]">{children}</span>
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
    <div className="flex flex-col h-full">
      {/* 헤더 (title + date 만; result/저장/보고서 UI 는 1열 카드로 이동 또는 제거됨 — W3 / W4) */}
      <div className="pt-4 px-4 pb-3 shrink-0">
        <div className="text-body-sm font-bold text-text-primary">{round?.title ?? '지적사항 목록'}</div>
        {round && <div className="text-caption leading-none text-text-secondary mt-[2px]">{fmtDate(round.date)}{round.endDate ? ` ~ ${fmtDate(round.endDate)}` : ''}</div>}
      </div>

      {/* 탭 헤더 */}
      <div className="border-b border-border-default flex shrink-0">
        {([
          { key: 'internal' as const, label: '내부용', count: sorted.length },
          { key: 'submission' as const, label: '제출용', count: selectedCount },
        ]).map(t => {
          const isActive = activeTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-label font-bold leading-none flex-1 px-2 py-3 border-0 cursor-pointer ${isActive ? 'text-accent bg-surface-page' : 'text-text-tertiary bg-surface-raised'}`}
              style={{
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {t.label}
              <span
                className={`text-caption font-bold leading-none ml-[6px] px-[7px] py-[2px] rounded-pill ${isActive ? 'bg-accent text-text-on-accent' : 'bg-surface-sunken text-text-secondary'}`}
              >{t.count}</span>
            </button>
          )
        })}
      </div>

      {/* 본문 */}
      {activeTab === 'internal' ? (
        <div className="flex-1 overflow-y-auto pt-3 px-4 pb-4 flex flex-col gap-[6px]">
          {isLoading && <div className={SKELETON_CLS} style={SKELETON_STYLE} />}
          {sorted.length === 0 && !isLoading && (
            <div className="text-label text-text-tertiary flex-1 flex items-center justify-center">지적사항 없음</div>
          )}
          {sorted.map(f => (
            <div
              key={f.id}
              onClick={() => onSelectFinding(f.id)}
              className={`bg-surface-sunken rounded-md ${selectedFindingId === f.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${f.status === 'open' ? 'border-danger-bar' : 'border-safe-bar'} p-[10px] cursor-pointer flex flex-col gap-[2px]`}
            >
              <div className="flex items-center justify-between gap-[6px]">
                <span className="text-label font-medium text-text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{f.description}</span>
                <span className={`${f.status === 'open' ? 'bg-danger-bg text-danger' : 'bg-safe-bg text-safe'} text-caption font-bold leading-none rounded-sm px-[6px] py-[1px] shrink-0`}>{f.status === 'open' ? '미조치' : '완료'}</span>
              </div>
              <div className="text-caption leading-none text-text-secondary">{f.location ?? '위치 미지정'}</div>
              <div className="flex items-center justify-between">
                <span className="text-caption leading-none text-text-tertiary">{fmtDate(f.createdAt)}</span>
                <div className="flex items-center gap-[6px]">
                  <button onClick={e => { e.stopPropagation(); setEditingFinding(f) }} className="text-caption leading-none text-text-tertiary bg-transparent border-0 cursor-pointer px-[3px] py-[1px]">수정</button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(f) }} className="text-caption leading-none text-text-tertiary bg-transparent border-0 cursor-pointer px-[3px] py-[1px]">삭제</button>
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
// ── 데스크톱: 2열 제출용 탭 (체크박스 + 라벨 + 자동저장) ──────────────
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
      .then(() => {
        setSaveStates(prev => ({ ...prev, [fid]: 'saved' }))
        // localLabels 는 그대로 유지 — textarea 의 controlled value 가 재설정되면
        // 커서 위치가 문장 끝으로 점프하고 입력 중인 글자가 중복/소실되는 사고 (260527 발견)
        // 라운드 전환 시 useEffect 에서 일괄 reset 함
        // invalidateQueries 도 생략 — 라벨 저장은 다른 mutation 결과에 영향 X
        // 체크박스 토글 (handleToggle) 은 별도로 invalidate
      })
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

  const handleToggle = (fid: string, current: boolean) => {
    legalApi.updateFinding(roundId, fid, { submission_selected: !current })
      .then(() => queryClient.invalidateQueries({ queryKey: ['legal-findings', roundId] }))
      .catch((err: any) => toast.error(err?.message ?? '선택 변경 실패'))
  }

  const getDisplayLabel = (f: LegalFinding): string => {
    if (localLabels[f.id] !== undefined) return localLabels[f.id]
    if (f.submissionLabel !== null) return f.submissionLabel
    return `${f.location ?? ''} ${f.description}`.trim()
  }

  const sorted = [...(findings ?? [])].sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1
    if (a.status !== 'open' && b.status === 'open') return 1
    return b.createdAt.localeCompare(a.createdAt)
  })

  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className={SKELETON_CLS} style={SKELETON_STYLE} />
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-label text-text-tertiary text-center leading-[1.6]">
          지적사항 없음<br />
          <span className="text-caption text-text-disabled">내부용 탭에서 먼저 지적/조치를 등록하세요</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pt-3 px-4 pb-4 flex flex-col gap-[10px]">
      {sorted.map(f => {
        const hasBefore = f.photoKeys.length > 0
        const hasAfter = f.resolutionPhotoKeys.length > 0
        const photosOk = hasBefore && hasAfter
        const isSelected = f.submissionSelected
        const label = getDisplayLabel(f)
        const saveState = saveStates[f.id] ?? 'saved'
        const cardDisabled = isLocked || !photosOk
        // 저장 버튼 활성: selected + photosOk + !locked + (dirty OR error)
        const canSaveBtn = isSelected && photosOk && !isLocked && (saveState === 'dirty' || saveState === 'error')

        return (
          <div
            key={f.id}
            className={`rounded-md border p-3 flex flex-col gap-2 ${isSelected ? 'bg-surface-active border-accent' : 'bg-surface-raised border-border-strong'} ${cardDisabled && !isSelected ? 'opacity-70' : 'opacity-100'}`}
          >
            {/* info-line: location | description */}
            <div className="text-label font-bold text-text-primary leading-[1.4]">
              <span className="text-text-secondary">{f.location ?? '위치 미지정'}</span>
              <span className="text-text-tertiary px-[6px]">|</span>
              <span className="text-text-primary">{f.description}</span>
            </div>

            {/* input-row: 체크 (가로축 중앙) + textarea + 저장 버튼 */}
            <div className="flex gap-[10px] items-stretch">
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => { if (!cardDisabled) handleToggle(f.id, isSelected) }}
                  disabled={cardDisabled}
                  aria-pressed={isSelected}
                  className={`rounded-sm flex items-center justify-center font-bold w-[28px] h-[28px] text-[18px] leading-none ${cardDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                    isSelected
                      ? 'bg-accent border-2 border-accent text-text-on-accent'
                      : cardDisabled
                        ? 'border-2 border-border-default text-text-disabled'
                        : 'border-2 border-border-strong text-text-disabled'
                  }`}
                >{isSelected ? <Check size={14} className="inline-block" /> : null}</button>
              </div>
              <textarea
                value={label}
                disabled={!isSelected || cardDisabled}
                onChange={(e) => handleLabelChange(f.id, e.target.value)}
                placeholder={isSelected ? '' : '체크하면 PPT 라벨 입력 가능'}
                className="bg-surface-sunken border border-border-strong text-text-primary rounded-sm focus:border-accent focus:outline-none flex-1 min-h-[36px] px-[10px] py-2 text-[12px] resize-y"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                type="button"
                onClick={() => handleSaveNow(f.id, label)}
                disabled={!canSaveBtn}
                className={`text-caption font-bold leading-none rounded-sm border-0 px-3 self-stretch shrink-0 ${canSaveBtn ? 'bg-accent text-text-on-accent cursor-pointer' : 'bg-surface-sunken text-text-disabled cursor-not-allowed'}`}
              >저장</button>
            </div>

            {/* meta-row: 사진 chip (좌) + 저장 인디케이터 (우, 저장버튼 우측 모서리 정렬) */}
            <div className="flex justify-between items-center gap-2">
              <div className="inline-flex items-center gap-[6px]">
                <span className="text-caption font-bold text-text-tertiary">사진 :</span>
                <span className={`text-caption font-bold leading-none rounded-sm px-[6px] py-[2px] ${hasBefore ? 'bg-safe-bg text-safe' : 'bg-danger-bg text-danger'}`}>
                  조치 전 {hasBefore ? <Check size={12} className="inline-block align-text-bottom ml-0.5" /> : <X size={12} className="inline-block align-text-bottom ml-0.5" />}
                </span>
                <span className={`text-caption font-bold leading-none rounded-sm px-[6px] py-[2px] ${hasAfter ? 'bg-safe-bg text-safe' : 'bg-danger-bg text-danger'}`}>
                  조치 후 {hasAfter ? <Check size={12} className="inline-block align-text-bottom ml-0.5" /> : <X size={12} className="inline-block align-text-bottom ml-0.5" />}
                </span>
              </div>
              <div className="text-caption leading-none inline-flex items-center gap-1">
                {!photosOk ? (
                  <span className="text-danger">사진 부족 — 저장 불가</span>
                ) : isLocked ? (
                  <span className="text-text-tertiary inline-flex items-center gap-1"><Lock size={12} />제출 완료</span>
                ) : !isSelected ? (
                  <span className="text-text-tertiary">—</span>
                ) : saveState === 'saving' ? (
                  <span className="text-accent"><span className="w-[6px] h-[6px] rounded-full bg-current inline-block mr-1" />저장중...</span>
                ) : saveState === 'dirty' ? (
                  <span className="text-warning"><span className="w-[6px] h-[6px] rounded-full bg-current inline-block mr-1" />변경됨</span>
                ) : saveState === 'error' ? (
                  <span className="text-danger"><span className="w-[6px] h-[6px] rounded-full bg-current inline-block mr-1" />저장 실패</span>
                ) : (
                  <span className="text-safe"><span className="w-[6px] h-[6px] rounded-full bg-current inline-block mr-1" />저장됨</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
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

  // 선택된 finding 만 (체크박스 ON + 사진 둘 다 있음 = PPT 포함 가능)
  const eligibleFindings = (findings ?? []).filter(f =>
    f.submissionSelected && f.photoKeys.length > 0 && f.resolutionPhotoKeys.length > 0
  )

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
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-page">
      {/* 헤더: 타이틀 (좌) + [인디케이터 + 저장하기] (우, bottom 정렬) */}
      <div className="px-4 py-[14px] border-b border-border-default flex justify-between items-center shrink-0">
        <div className="text-label font-bold text-text-primary">
          지적사항 조치 작업사진 <span className="text-accent">{count}</span>건
        </div>
        <div className="flex items-end gap-[10px]">
          <div className={`text-caption ${indicatorColor} inline-flex items-center gap-1 leading-none pb-2`}>
            <span className="w-[6px] h-[6px] rounded-full bg-current" />
            {indicatorLabel}
          </div>
          <button
            type="button"
            onClick={handleSaveNow}
            disabled={count === 0 || isLocked || genState === 'saving'}
            className={`border-0 h-[32px] px-[14px] rounded-[6px] text-[12px] font-bold inline-flex items-center gap-[6px] ${count === 0 || isLocked || genState === 'saving' ? 'bg-surface-sunken text-text-disabled cursor-not-allowed' : `${genState === 'dirty' || genState === 'error' ? 'bg-warning-bg text-warning' : 'bg-accent text-text-on-accent'} cursor-pointer`}`}
          >
            {genState === 'saving' ? '저장중...' : <><Save size={14} className="inline-block align-text-bottom mr-1" />저장하기</>}
          </button>
        </div>
      </div>

      {/* 본문: 표지 + 현재 페이지 슬라이드 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {isLoading ? (
          <div className={SKELETON_CLS} style={SKELETON_STYLE} />
        ) : count === 0 ? (
          <div className="text-label text-text-tertiary flex-1 flex items-center justify-center text-center leading-[1.6]">
            제출용 탭에서 PPT 에 포함할 지적사항을 체크해주세요<br />
            <span className="text-caption text-text-disabled">사진이 조치 전/후 모두 있어야 PPT 포함 가능</span>
          </div>
        ) : (
          <>
            {/* 표지 (A4 가로 297:210) */}
            <div>
              <div className="text-caption text-text-tertiary mb-1">표지 (slide 1)</div>
              <div className="bg-white text-black rounded-[8px] p-6 flex flex-col justify-center items-center text-center aspect-[297/210] shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                <div className="text-[36px] font-bold">{coverTitle}</div>
                <div className="text-[22px] font-bold mt-4">지적사항 조치 작업사진</div>
                <div className="text-[18px] mt-6 text-[#444]">차바이오 컴플렉스</div>
              </div>
            </div>

            {/* 본문 슬라이드 */}
            {currentPage && (
              <div>
                <div className="text-caption text-text-tertiary mb-1">
                  조치 전 / 후 (slide {pageIdx + 2} of {totalPages + 1}) — A4 가로
                </div>
                <div className="bg-white text-black rounded-[8px] p-2 grid gap-1 aspect-[297/210] grid-cols-[1fr_1fr] grid-rows-[auto_1fr_auto_1fr] shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
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
        <div className="px-4 py-3 border-t border-border-default bg-surface-raised flex justify-center items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setPageIdx(i => Math.max(0, i - 1))}
            disabled={pageIdx === 0}
            className={`bg-surface-sunken border border-border-strong text-text-primary disabled:text-text-disabled disabled:border-border-default disabled:bg-transparent w-[36px] h-[36px] rounded-[6px] text-[16px] ${pageIdx === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >◀</button>
          <div className="text-label font-bold text-text-primary min-w-[80px] text-center">
            {pageIdx + 1} / {totalPages}
          </div>
          <button
            type="button"
            onClick={() => setPageIdx(i => Math.min(totalPages - 1, i + 1))}
            disabled={pageIdx >= totalPages - 1}
            className={`bg-surface-sunken border border-border-strong text-text-primary disabled:text-text-disabled disabled:border-border-default disabled:bg-transparent w-[36px] h-[36px] rounded-[6px] text-[16px] ${pageIdx >= totalPages - 1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >▶</button>
        </div>
      )}

      {isLocked && (
        <div className="bg-safe-bg text-safe text-caption font-bold px-4 py-[6px] text-center shrink-0">
          <Lock size={14} className="inline-block align-text-bottom mr-1" />제출 완료된 점검 — 재생성 불가
        </div>
      )}
    </div>
  )
}

function SlideLabelCell({ text }: { text: string }) {
  return (
    <div className="border border-[#888] bg-[#f5f5f5] p-2 flex items-center justify-center text-center text-[11px] font-bold leading-[1.4] overflow-hidden">
      {text}
    </div>
  )
}

function SlidePhotoCell({ src }: { src: string | undefined }) {
  return (
    <div className="border border-[#888] bg-[#e5e5e5] overflow-hidden flex items-center justify-center">
      {src ? (
        <img src={'/api/uploads/' + src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-[#888] text-[11px]">—</span>
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
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-accent" size={24} />
    </div>
  )
  if (!finding) return <div className="text-label text-text-tertiary flex-1 flex items-center justify-center">항목을 불러오지 못했습니다.</div>

  return (
    <div className="flex-1 overflow-y-auto py-4 px-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-body-sm font-bold text-text-primary">지적 상세</div>
        {staff?.role === 'admin' && (
          <button onClick={handleDownload} disabled={downloading} className={`bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm h-[28px] px-[10px] ${downloading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}>{downloading ? '...' : '다운로드'}</button>
        )}
      </div>

      {/* 지적 정보 */}
      <div className="mb-4">
        <div className="text-caption leading-none font-bold text-text-tertiary mb-2">지적 정보</div>
        <div className="flex flex-col gap-[6px]">
          <KVRow label="지적 내용"><span className="whitespace-pre-wrap">{finding.description}</span></KVRow>
          <KVRow label="위치">{finding.location ?? '-'}</KVRow>
          <KVRow label="등록일">{fmtDateTime(finding.createdAt)}</KVRow>
          <KVRow label="등록자">{finding.createdByName ?? finding.createdBy}</KVRow>
        </div>
      </div>

      {/* 지적 사진 */}
      <div className="mb-4">
        <div className="text-caption leading-none font-bold text-text-tertiary mb-2">지적 사진</div>
        {finding.photoKeys.length > 0 ? <PhotoGrid photoUrls={finding.photoKeys.map(k => '/api/uploads/' + k)} /> : <div className="text-caption leading-none text-text-tertiary">사진 없음</div>}
      </div>

      {/* 조치 입력 (open) */}
      {finding.status === 'open' && (
        <div className="border-t border-border-default pt-4">
          <div className="text-caption leading-none font-bold text-text-tertiary mb-2">조치 내용</div>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="조치 내용을 입력하세요" rows={3} className="bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md w-full px-3 py-[10px] box-border leading-[1.5] resize-y outline-none" style={{ fontFamily: 'inherit' }} />
          <div className="mt-[10px]">
            <div className="text-caption leading-none font-bold text-text-tertiary mb-[6px]">조치 사진 (최대 5장)</div>
            <input ref={resPhotos.cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={resPhotos.handleFiles} />
            <input ref={resPhotos.albumRef} type="file" accept="image/*" multiple className="hidden" onChange={resPhotos.handleFiles} />
            <PhotoSourceModal open={resPhotos.showPicker} onClose={resPhotos.closePicker} onCamera={resPhotos.pickCamera} onAlbum={resPhotos.pickAlbum} />
            <div className="flex gap-2 flex-wrap">
              {resPhotos.slots.map((slot, i) => (
                <div key={i} className="relative">
                  <img src={slot.preview} alt="" className="border border-border-default rounded-sm w-[64px] h-[64px] object-cover" />
                  <button onClick={() => resPhotos.removeSlot(i)} className="text-text-on-accent text-caption font-bold leading-none absolute -top-[5px] -right-[5px] w-[18px] h-[18px] rounded-full bg-danger-bar border-0 cursor-pointer flex items-center justify-center">✕</button>
                </div>
              ))}
              {resPhotos.canAdd && (
                <button onClick={resPhotos.openPicker} className="bg-surface-sunken text-text-tertiary rounded-sm w-[64px] h-[64px] border border-dashed border-border-strong cursor-pointer flex flex-col items-center justify-center gap-[2px]">
                  <Camera size={18} />
                  <span className="text-caption leading-none font-bold">첨부</span>
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => { if (!memo.trim()) { toast.error('조치 내용을 입력하세요'); return }; resolveMutation.mutate() }}
            disabled={isSubmitting}
            className={`text-text-on-accent text-label font-bold rounded-md mt-3 w-full h-[44px] border-0 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)' }}
          >{isSubmitting ? '처리 중...' : '조치 완료'}</button>
        </div>
      )}

      {/* 조치 결과 (resolved) */}
      {finding.status === 'resolved' && (
        <div className="border-t border-border-default pt-4">
          <div className="text-caption leading-none font-bold text-text-tertiary mb-2">조치 결과</div>
          <div className="flex flex-col gap-[6px]">
            <KVRow label="조치일시">{fmtDateTime(finding.resolvedAt)}</KVRow>
            <KVRow label="조치자">{finding.resolvedByName ?? finding.resolvedBy ?? '-'}</KVRow>
            <KVRow label="조치 내용"><span className="whitespace-pre-wrap">{finding.resolutionMemo ?? '-'}</span></KVRow>
          </div>
          {finding.resolutionPhotoKeys.length > 0 && (
            <div className="mt-[10px]"><PhotoGrid photoUrls={finding.resolutionPhotoKeys.map(k => '/api/uploads/' + k)} /></div>
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
    <div className="flex flex-col h-full">
      {/* 필터 */}
      <div className="shrink-0">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`${tab === t.key ? 'bg-surface-active text-text-primary' : 'text-text-tertiary bg-transparent'} text-caption font-bold leading-none flex-1 h-[38px] border-0 cursor-pointer`}
              style={{ borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent' }}
            >{t.label}</button>
          ))}
        </div>
        <div className="px-3 py-[6px]">
          <select value={year} onChange={e => setYear(e.target.value)} className="bg-surface-sunken border border-border-strong text-caption leading-none text-text-primary rounded-sm px-2 py-[4px] cursor-pointer appearance-none">
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
      </div>

      {/* 카드 */}
      <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col gap-[6px]">
        {isLoading && <><div className={SKELETON_CLS} style={SKELETON_STYLE} /><div className={SKELETON_CLS} style={SKELETON_STYLE} /><div className={SKELETON_CLS} style={SKELETON_STYLE} /></>}
        {isError && !isLoading && (
          <div className="text-label text-text-secondary text-center p-6">
            <span>불러오기 실패</span>
            <button onClick={() => refetch()} className="bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm block mx-auto my-2 border-0 px-4 py-[6px] cursor-pointer">재시도</button>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-caption leading-none text-text-tertiary flex-1 flex items-center justify-center text-center p-4">점검 이력 없음</div>
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
            className={`bg-surface-sunken rounded-md ${selectedRoundId === round.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${stripBySubmission(effectiveStatus)} p-[10px] cursor-pointer flex flex-col gap-[6px]`}
          >
            <div className="flex items-start justify-between gap-[6px]">
              <span className="text-label font-bold text-text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap pt-1">{round.title}</span>
              {isDesktop && (
                <div onClick={(e) => e.stopPropagation()} className="flex gap-1 items-center shrink-0">
                  <button
                    type="button"
                    disabled={!isAdmin || isLocked || isSaving}
                    onClick={() => {
                      if (!isAdmin || isLocked) return
                      setPendingStatuses(prev => ({ ...prev, [round.id]: effectiveStatus === 'completed' ? 'pending' : 'completed' }))
                    }}
                    className={`text-caption font-bold leading-none rounded-sm h-[26px] px-[10px] whitespace-nowrap ${isAdmin && !isLocked ? 'cursor-pointer' : 'cursor-not-allowed'} ${effectiveStatus === 'completed' ? 'bg-safe-bg text-safe' : 'bg-warning-bg text-warning'}`}
                  >
                    제출 {effectiveStatus === 'completed' ? '완료' : '미완료'}
                  </button>
                  {isLocked ? (
                    <button
                      type="button"
                      disabled
                      className="text-caption font-bold leading-none rounded-sm bg-safe-bg text-safe h-[26px] px-[10px] cursor-default whitespace-nowrap"
                    ><Lock size={12} className="inline-block align-text-bottom mr-1" />종결</button>
                  ) : (
                    <button
                      type="button"
                      disabled={!isAdmin || !isDirty || isSaving}
                      onClick={() => {
                        if (!isAdmin || !isDirty) return
                        saveStatusMutation.mutate({ id: round.id, status: effectiveStatus })
                      }}
                      className={`text-caption font-bold leading-none rounded-sm border-0 h-[26px] px-[10px] ${isAdmin && isDirty ? 'cursor-pointer' : 'cursor-not-allowed'} ${isDirty ? 'bg-warning-bg text-warning' : 'bg-accent text-text-on-accent'} disabled:bg-surface-sunken disabled:text-text-disabled`}
                    >
                      {isSaving ? '저장중...' : isDirty ? '저장 *' : '저장'}
                    </button>
                  )}
                </div>
              )}
              {!isDesktop && (
                <span
                  className={`text-caption font-bold leading-none rounded-sm px-2 py-[3px] shrink-0 whitespace-nowrap ${effectiveStatus === 'completed' ? 'bg-safe-bg text-safe' : 'bg-warning-bg text-warning'}`}
                >
                  제출 {effectiveStatus === 'completed' ? '완료' : '미완료'}
                </span>
              )}
            </div>
            <div className="text-caption leading-none text-text-secondary">
              {fmtDate(round.date)} · 지적 {round.findingCount} · 완료 {round.resolvedCount}
            </div>
            <div className="flex gap-[6px] pt-[6px] border-t border-dashed border-border-default">
              {/* 결과내역서: reportFileKey 있으면 다운로드 + (데스크톱 admin && !locked) X 삭제 / 없으면 (데스크톱 admin) 업로드 */}
              {round.reportFileKey ? (
                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (round.reportFileKey) {
                        downloadWithName('/api/uploads/' + round.reportFileKey, reportFileName(round))
                      }
                    }}
                    className="text-caption font-bold leading-none rounded-sm bg-surface-raised border border-border-strong text-text-primary w-full h-[32px] cursor-pointer"
                  >↓ 결과내역서</button>
                  {isDesktop && isAdmin && !isLocked && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteReport(round) }}
                      title="결과내역서 삭제 (새 파일 업로드 시)"
                      className="bg-danger-bar text-text-on-accent border-0 absolute -top-[6px] -right-[6px] w-[18px] h-[18px] rounded-full text-[12px] leading-none flex items-center justify-center cursor-pointer p-0"
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
                      className={`text-caption font-bold leading-none rounded-sm flex-1 h-[32px] ${canUpload ? 'bg-surface-raised border border-border-strong text-text-primary cursor-pointer' : 'border border-border-default text-text-disabled bg-transparent cursor-not-allowed'}`}
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
                className={`text-caption font-bold leading-none rounded-sm flex-1 h-[32px] ${round.pptFileKey ? 'bg-surface-raised border border-border-strong text-text-primary cursor-pointer' : 'border border-border-default text-text-disabled bg-transparent cursor-not-allowed'}`}
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
        className="hidden"
        onChange={handleReportFileChange}
      />
    </div>
  )

  // ── 데스크톱 3분할 ──
  if (isDesktop) {
    return (
      <div className="bg-surface-page flex h-full">
        <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

        {/* 좌측: 라운드 목록 — 페이지 제목은 App.tsx 헤더에서 표시 */}
        <div className="border-r border-border-default w-[500px] shrink-0 flex flex-col">
          {roundList}
        </div>

        {/* 중앙: 지적사항 목록 */}
        <div className="border-r border-border-default w-[500px] shrink-0 flex flex-col">
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
            <div className="text-label text-text-tertiary flex-1 flex items-center justify-center">좌측에서 점검을 선택하세요</div>
          )}
        </div>

        {/* 우측: 상세 — 2열 탭에 따라 swap */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'submission' && selectedRoundId ? (
            <SubmissionPreviewPanel key={selectedRoundId} roundId={selectedRoundId} />
          ) : selectedFindingId && selectedRoundId ? (
            <FindingDetailPanel key={selectedFindingId} roundId={selectedRoundId} findingId={selectedFindingId} />
          ) : (
            <div className="text-label text-text-tertiary flex-1 flex items-center justify-center">
              {selectedRoundId ? '중앙에서 지적사항을 선택하세요' : '점검을 먼저 선택하세요'}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── 모바일 ──
  return (
    <div className="bg-surface-page flex-1 flex flex-col h-full overflow-hidden">
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      <div className="bg-surface-raised border-b border-border-default h-12 px-3 flex items-center justify-center relative shrink-0">
        <button
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="text-text-primary absolute left-2 w-7 h-7 rounded-[7px] bg-surface-sunken border-0 cursor-pointer flex items-center justify-center"
        ><ChevronLeft size={20} /></button>
        <span className="text-title font-semibold text-text-primary">소방 점검 관리</span>
      </div>

      {/* 필터 */}
      <div className="bg-surface-raised border-b border-border-default shrink-0">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`${tab === t.key ? 'bg-surface-active text-text-primary' : 'text-text-tertiary bg-transparent'} text-caption font-bold leading-none flex-1 h-[44px] border-0 cursor-pointer`}
              style={{ borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent' }}
            >{t.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-2">
          <select value={year} onChange={e => setYear(e.target.value)} className="bg-surface-sunken border border-border-strong text-label leading-none text-text-primary rounded-sm px-3 py-[6px] cursor-pointer appearance-none">
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
      </div>

      {/* 카드 목록 */}
      <div className="flex-1 overflow-y-auto py-3 px-4 flex flex-col gap-2">
        {isLoading && <><div className={SKELETON_CLS} style={SKELETON_STYLE} /><div className={SKELETON_CLS} style={SKELETON_STYLE} /><div className={SKELETON_CLS} style={SKELETON_STYLE} /></>}
        {isError && !isLoading && (
          <div className="text-body-sm text-text-secondary text-center py-10 px-4 flex flex-col items-center gap-3">
            <span>목록을 불러오지 못했습니다.</span>
            <button onClick={() => refetch()} className="bg-accent text-text-on-accent text-body-sm font-bold rounded-sm border-0 px-6 py-2 cursor-pointer">다시 시도</button>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-[60px] px-4">
            <div className="text-body font-bold text-text-primary">소방 점검 관리 이력 없음</div>
            <div className="text-caption leading-relaxed text-text-secondary text-center">소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.</div>
          </div>
        )}
        {!isLoading && !isError && filtered.map(round => (
          <div
            key={round.id}
            onClick={() => handleRoundClick(round)}
            className={`bg-surface-sunken rounded-md border border-border-default border-l-[3px] ${accentColor(round.result)} p-3 cursor-pointer flex flex-col gap-1`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-body-sm font-bold text-text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{round.title}</span>
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
