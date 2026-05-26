import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronLeft, Camera, Loader2 } from 'lucide-react'
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
function FindingsPanel({ roundId, onSelectFinding, selectedFindingId }: {
  roundId: string
  onSelectFinding: (fid: string) => void
  selectedFindingId: string | null
}) {
  const queryClient = useQueryClient()
  const { staff } = useAuthStore()
  const role = staff?.role
  const [selectedResult, setSelectedResult] = useState('')
  const [savingResult, setSavingResult] = useState(false)
  const [uploadingReport, setUploadingReport] = useState(false)
  const [editingFinding, setEditingFinding] = useState<LegalFinding | null>(null)
  const reportInputRef = useRef<HTMLInputElement>(null)

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

  const effectiveResult = selectedResult || (round?.result ?? '')

  const handleSaveResult = async () => {
    setSavingResult(true)
    try {
      await legalApi.updateResult(roundId, { result: effectiveResult || undefined })
      queryClient.invalidateQueries({ queryKey: ['legal-round', roundId] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      toast.success('점검 결과 저장')
    } catch { toast.error('저장 실패') }
    finally { setSavingResult(false) }
  }

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; e.target.value = ''
    setUploadingReport(true)
    try {
      const form = new FormData(); form.append('file', file, file.name); form.append('folder', `legal/${roundId}/report`)
      const token = useAuthStore.getState().token
      const res = await fetch('/api/uploads', { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      if (!json.success || !json.data?.key) throw new Error()
      await legalApi.updateResult(roundId, { report_file_key: json.data.key })
      queryClient.invalidateQueries({ queryKey: ['legal-round', roundId] })
      toast.success('보고서 업로드 완료')
    } catch { toast.error('업로드 실패') }
    finally { setUploadingReport(false) }
  }

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 16px 8px', flexShrink: 0 }}>
        <div className="text-body-sm font-bold text-text-primary">{round?.title ?? '지적사항 목록'}</div>
        {round && <div className="text-caption leading-none text-text-secondary" style={{ marginTop: 2 }}>{fmtDate(round.date)}{round.endDate ? ` ~ ${fmtDate(round.endDate)}` : ''}</div>}
      </div>

      {/* 관리자 도구 */}
      {role === 'admin' && round && (
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
          <select value={effectiveResult} onChange={e => setSelectedResult(e.target.value)} className="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm" style={{ padding: '4px 8px', appearance: 'none', cursor: 'pointer' }}>
            <option value="">미입력</option>
            <option value="pass">적합</option>
            <option value="fail">부적합</option>
            <option value="conditional">조건부적합</option>
          </select>
          <button onClick={handleSaveResult} disabled={savingResult} className="bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm" style={{ height: 28, padding: '0 10px', border: 'none', cursor: 'pointer', opacity: savingResult ? 0.6 : 1 }}>저장</button>
          <input ref={reportInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleReportUpload} />
          {round.reportFileKey ? (
            <button onClick={() => window.open('/api/uploads/' + round.reportFileKey, '_blank')} className="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-primary rounded-sm" style={{ height: 28, padding: '0 10px', cursor: 'pointer' }}>보고서</button>
          ) : (
            <button onClick={() => reportInputRef.current?.click()} disabled={uploadingReport} className="bg-surface-sunken border border-border-strong text-caption font-bold leading-none text-text-secondary rounded-sm" style={{ height: 28, padding: '0 10px', cursor: 'pointer', opacity: uploadingReport ? 0.6 : 1 }}>{uploadingReport ? '...' : '보고서 업로드'}</button>
          )}
        </div>
      )}

      {/* 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
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

  // 데스크톱 3분할 상태
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null)
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null)

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
        {!isLoading && !isError && filtered.map(round => (
          <div
            key={round.id}
            onClick={() => handleRoundClick(round)}
            className={`bg-surface-sunken rounded-md ${selectedRoundId === round.id ? 'border-2 border-accent' : 'border border-border-default'} border-l-[3px] ${accentColor(round.result)}`}
            style={{ padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span className="text-label font-bold text-text-primary" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{round.title}</span>
              <ResultBadge result={round.result} />
            </div>
            <div className="text-caption leading-none text-text-secondary">
              {fmtDate(round.date)} · 지적 {round.findingCount} · 완료 {round.resolvedCount}
            </div>
          </div>
        ))}
      </div>
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
            />
          ) : (
            <div className="text-label text-text-tertiary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>좌측에서 점검을 선택하세요</div>
          )}
        </div>

        {/* 우측: 상세 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedFindingId && selectedRoundId ? (
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
