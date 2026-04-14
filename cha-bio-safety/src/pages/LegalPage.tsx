import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { useAuthStore } from '../stores/authStore'
import { useMultiPhotoUpload } from '../hooks/useMultiPhotoUpload'
import { PhotoGrid } from '../components/PhotoGrid'
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

// ── 좌측 강조 색상 ────────────────────────────────────────────────
function accentColor(result: LegalInspectionResult | null): string {
  if (result === 'pass') return 'var(--safe)'
  if (result === 'fail') return 'var(--danger)'
  if (result === 'conditional') return 'var(--warn)'
  return 'var(--bd2)'
}

// ── 결과 배지 ──────────────────────────────────────────────────────
function ResultBadge({ result }: { result: LegalInspectionResult | null }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pass: { bg: 'rgba(34,197,94,.13)', color: 'var(--safe)', label: '적합' },
    fail: { bg: 'rgba(239,68,68,.15)', color: 'var(--danger)', label: '부적합' },
    conditional: { bg: 'rgba(245,158,11,.15)', color: 'var(--warn)', label: '조건부적합' },
  }
  const m = result ? map[result] : null
  return (
    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 8px', flexShrink: 0, background: m?.bg ?? 'transparent', color: m?.color ?? 'var(--t3)' }}>
      {m?.label ?? '결과 미입력'}
    </span>
  )
}

// ── 스켈레톤 ──────────────────────────────────────────────────────
const SKELETON: React.CSSProperties = { background: 'var(--bg3)', borderRadius: 12, height: 72, animation: 'blink 2s ease-in-out infinite' }

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
      <span style={{ fontSize: 12, color: 'var(--t3)', width: 64, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--t1)', flex: 1, lineHeight: 1.5 }}>{children}</span>
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
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{round?.title ?? '지적사항 목록'}</div>
        {round && <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{fmtDate(round.date)}{round.endDate ? ` ~ ${fmtDate(round.endDate)}` : ''}</div>}
      </div>

      {/* 관리자 도구 */}
      {role === 'admin' && round && (
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
          <select value={effectiveResult} onChange={e => setSelectedResult(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 6, padding: '4px 8px', color: 'var(--t1)', fontSize: 12, appearance: 'none', cursor: 'pointer' }}>
            <option value="">미입력</option>
            <option value="pass">적합</option>
            <option value="fail">부적합</option>
            <option value="conditional">조건부적합</option>
          </select>
          <button onClick={handleSaveResult} disabled={savingResult} style={{ fontSize: 11, fontWeight: 700, height: 28, background: 'var(--acl)', borderRadius: 6, padding: '0 10px', border: 'none', color: '#fff', cursor: 'pointer', opacity: savingResult ? 0.6 : 1 }}>저장</button>
          <input ref={reportInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleReportUpload} />
          {round.reportFileKey ? (
            <button onClick={() => window.open('/api/uploads/' + round.reportFileKey, '_blank')} style={{ fontSize: 11, fontWeight: 700, height: 28, background: 'var(--bg3)', borderRadius: 6, padding: '0 10px', border: '1px solid var(--bd2)', color: 'var(--t1)', cursor: 'pointer' }}>보고서</button>
          ) : (
            <button onClick={() => reportInputRef.current?.click()} disabled={uploadingReport} style={{ fontSize: 11, fontWeight: 700, height: 28, background: 'var(--bg3)', borderRadius: 6, padding: '0 10px', border: '1px solid var(--bd2)', color: 'var(--t2)', cursor: 'pointer', opacity: uploadingReport ? 0.6 : 1 }}>{uploadingReport ? '...' : '보고서 업로드'}</button>
          )}
        </div>
      )}

      {/* 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {isLoading && <div style={SKELETON} />}
        {sorted.length === 0 && !isLoading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>지적사항 없음</div>
        )}
        {sorted.map(f => (
          <div
            key={f.id}
            onClick={() => onSelectFinding(f.id)}
            style={{
              background: 'var(--bg3)',
              border: selectedFindingId === f.id ? '1.5px solid var(--acl)' : '1px solid var(--bd)',
              borderLeft: `3px solid ${f.status === 'open' ? 'var(--danger)' : 'var(--safe)'}`,
              borderRadius: 10, padding: 10, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</span>
              <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 5, padding: '1px 6px', flexShrink: 0, background: f.status === 'open' ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.13)', color: f.status === 'open' ? 'var(--danger)' : 'var(--safe)' }}>{f.status === 'open' ? '미조치' : '완료'}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--t2)' }}>{f.location ?? '위치 미지정'}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>{fmtDate(f.createdAt)}</span>
              <button onClick={e => { e.stopPropagation(); handleDelete(f) }} style={{ fontSize: 10, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
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

  if (isLoading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 24, height: 24, border: '2px solid var(--bd2)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></div>
  if (!finding) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>항목을 불러오지 못했습니다.</div>

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>지적 상세</div>
        {staff?.role === 'admin' && (
          <button onClick={handleDownload} disabled={downloading} style={{ fontSize: 11, fontWeight: 700, height: 28, background: 'var(--bg3)', borderRadius: 6, padding: '0 10px', border: '1px solid var(--bd2)', color: 'var(--t1)', cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.5 : 1 }}>{downloading ? '...' : '다운로드'}</button>
        )}
      </div>

      {/* 지적 정보 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>지적 정보</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <KVRow label="지적 내용"><span style={{ whiteSpace: 'pre-wrap' }}>{finding.description}</span></KVRow>
          <KVRow label="위치">{finding.location ?? '-'}</KVRow>
          <KVRow label="등록일">{fmtDateTime(finding.createdAt)}</KVRow>
          <KVRow label="등록자">{finding.createdByName ?? finding.createdBy}</KVRow>
        </div>
      </div>

      {/* 지적 사진 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>지적 사진</div>
        {finding.photoKeys.length > 0 ? <PhotoGrid photoUrls={finding.photoKeys.map(k => '/api/uploads/' + k)} /> : <div style={{ fontSize: 12, color: 'var(--t3)' }}>사진 없음</div>}
      </div>

      {/* 조치 입력 (open) */}
      {finding.status === 'open' && (
        <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>조치 내용</div>
          <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="조치 내용을 입력하세요" rows={3} style={{ width: '100%', background: 'var(--bg3)', borderRadius: 9, padding: '10px 12px', border: '1px solid var(--bd2)', color: 'var(--t1)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical', outline: 'none' }} />
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }}>조치 사진 (최대 5장)</div>
            <input ref={resPhotos.inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={resPhotos.handleFiles} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {resPhotos.slots.map((slot, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={slot.preview} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--bd)' }} />
                  <button onClick={() => resPhotos.removeSlot(i)} style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {resPhotos.canAdd && (
                <button onClick={resPhotos.pickPhotos} style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--bg3)', border: '1px dashed var(--bd2)', color: 'var(--t3)', fontSize: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontSize: 18 }}>📷</span>첨부
                </button>
              )}
            </div>
          </div>
          <button onClick={() => { if (!memo.trim()) { toast.error('조치 내용을 입력하세요'); return }; resolveMutation.mutate() }} disabled={isSubmitting} style={{ marginTop: 12, width: '100%', height: 40, background: 'var(--acl)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 10, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.5 : 1 }}>
            {isSubmitting ? '처리 중...' : '조치 완료'}
          </button>
        </div>
      )}

      {/* 조치 결과 (resolved) */}
      {finding.status === 'resolved' && (
        <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>조치 결과</div>
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
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, height: 38, border: 'none',
              background: tab === t.key ? 'var(--bg4)' : 'transparent',
              color: tab === t.key ? 'var(--t1)' : 'var(--t3)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              borderBottom: tab === t.key ? '2px solid var(--acl)' : '2px solid transparent',
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ padding: '6px 12px' }}>
          <select value={year} onChange={e => setYear(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 6, padding: '4px 8px', color: 'var(--t1)', fontSize: 12, cursor: 'pointer', appearance: 'none' }}>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
      </div>

      {/* 카드 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {isLoading && <><div style={SKELETON} /><div style={SKELETON} /><div style={SKELETON} /></>}
        {isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--t2)', fontSize: 13 }}>
            <span>불러오기 실패</span>
            <button onClick={() => refetch()} style={{ display: 'block', margin: '8px auto', background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>재시도</button>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 12, textAlign: 'center', padding: 16 }}>점검 이력 없음</div>
        )}
        {!isLoading && !isError && filtered.map(round => (
          <div
            key={round.id}
            onClick={() => handleRoundClick(round)}
            style={{
              background: 'var(--bg3)',
              border: selectedRoundId === round.id ? '1.5px solid var(--acl)' : '1px solid var(--bd)',
              borderLeft: `3px solid ${accentColor(round.result)}`,
              borderRadius: 10, padding: 10, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 3,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{round.title}</span>
              <ResultBadge result={round.result} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--t2)' }}>
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
      <div style={{ display: 'flex', height: '100%', background: 'var(--bg)' }}>
        <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

        {/* 좌측: 라운드 목록 */}
        <div style={{ width: 500, flexShrink: 0, borderRight: '1px solid var(--bd)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 12px 8px' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>소방 점검 관리</div>
          </div>
          {roundList}
        </div>

        {/* 중앙: 지적사항 목록 */}
        <div style={{ width: 500, flexShrink: 0, borderRight: '1px solid var(--bd)', display: 'flex', flexDirection: 'column' }}>
          {selectedRoundId ? (
            <FindingsPanel
              key={selectedRoundId}
              roundId={selectedRoundId}
              onSelectFinding={fid => setSelectedFindingId(fid)}
              selectedFindingId={selectedFindingId}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>좌측에서 점검을 선택하세요</div>
          )}
        </div>

        {/* 우측: 상세 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedFindingId && selectedRoundId ? (
            <FindingDetailPanel key={selectedFindingId} roundId={selectedRoundId} findingId={selectedFindingId} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>
              {selectedRoundId ? '중앙에서 지적사항을 선택하세요' : '점검을 먼저 선택하세요'}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── 모바일 ──
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      <div style={{
        height: 48, background: 'rgba(22,27,34,0.97)', borderBottom: '1px solid var(--bd)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0,
      }}>
        <button aria-label="뒤로 가기" onClick={() => navigate(-1)} style={{ position: 'absolute', left: 12, width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--t1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>소방 점검 관리</span>
      </div>

      {/* 필터 */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, height: 44, border: 'none',
              background: tab === t.key ? 'var(--bg4)' : 'transparent',
              color: tab === t.key ? 'var(--t1)' : 'var(--t3)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              borderBottom: tab === t.key ? '2px solid var(--acl)' : '2px solid transparent',
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
          <select value={year} onChange={e => setYear(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 8, padding: '6px 12px', color: 'var(--t1)', fontSize: 13, cursor: 'pointer', appearance: 'none' }}>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
      </div>

      {/* 카드 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading && <><div style={SKELETON} /><div style={SKELETON} /><div style={SKELETON} /></>}
        {isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span>목록을 불러오지 못했습니다.</span>
            <button onClick={() => refetch()} style={{ background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>다시 시도</button>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>소방 점검 관리 이력 없음</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.</div>
          </div>
        )}
        {!isLoading && !isError && filtered.map(round => (
          <div key={round.id} onClick={() => handleRoundClick(round)} style={{
            background: 'var(--bg3)', border: '1px solid var(--bd)',
            borderLeft: `3px solid ${accentColor(round.result)}`,
            borderRadius: 12, padding: 12, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{round.title}</span>
              <ResultBadge result={round.result} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>
              {fmtDate(round.date)}{round.endDate ? ` ~ ${fmtDate(round.endDate)}` : ''} · 지적 {round.findingCount}건 · 완료 {round.resolvedCount}건
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
