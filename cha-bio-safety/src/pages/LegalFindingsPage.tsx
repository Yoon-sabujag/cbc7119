import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { legalApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { FindingFormSheet } from '../components/FindingFormSheet'
import { FindingEditModal } from '../components/FindingEditModal'
import { buildMetaTxt } from '../utils/findingDownload'
import type { LegalFinding } from '../types'

// ── 날짜 포매터 ──────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

function fmtMonthOnly(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.`
}

// ── 스켈레톤 ──────────────────────────────────────────────────────
const SKELETON_STYLE: React.CSSProperties = {
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 메인 페이지 ───────────────────────────────────────────────────
export default function LegalFindingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { staff } = useAuthStore()
  const role = staff?.role

  const [showSheet, setShowSheet] = useState(false)
  const [editingFinding, setEditingFinding] = useState<LegalFinding | null>(null)
  const [selectedResult, setSelectedResult] = useState<string>('')
  const [savingResult, setSavingResult] = useState(false)
  const [uploadingReport, setUploadingReport] = useState(false)
  const [zipLoading, setZipLoading] = useState<string | false>(false)
  const reportInputRef = useRef<HTMLInputElement>(null)

  const { data: round, isLoading: roundLoading } = useQuery({
    queryKey: ['legal-round', id],
    queryFn: () => legalApi.get(id!),
    enabled: !!id,
  })

  const { data: findings, isLoading: findingsLoading, isError } = useQuery({
    queryKey: ['legal-findings', id],
    queryFn: () => legalApi.getFindings(id!),
    enabled: !!id,
    staleTime: 30_000,
  })

  const isLoading = roundLoading || findingsLoading

  // 결과 초기값 동기화
  const currentResult = round?.result ?? null
  const effectiveSelectedResult = selectedResult || (currentResult ?? '')

  const handleSaveResult = async () => {
    if (!id) return
    setSavingResult(true)
    try {
      await legalApi.updateResult(id, { result: effectiveSelectedResult || undefined })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      toast.success('점검 결과가 저장되었습니다.')
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setSavingResult(false)
    }
  }

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    e.target.value = ''
    setUploadingReport(true)
    try {
      const form = new FormData()
      form.append('file', file, file.name)
      form.append('folder', `legal/${id}/report`)
      const { useAuthStore: store } = await import('../stores/authStore')
      const token = store.getState().token
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      if (!json.success || !json.data?.key) throw new Error('upload failed')
      await legalApi.updateResult(id, { report_file_key: json.data.key })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      toast.success('보고서가 업로드되었습니다.')
    } catch {
      toast.error('사진 업로드 실패')
    } finally {
      setUploadingReport(false)
    }
  }

  // 동적 헤더 제목
  const headerTitle = round
    ? `${round.title.includes('종합정밀') ? '종합정밀' : '작동기능'} ${fmtMonthOnly(round.date)}`
    : '지적사항 목록'

  const handleDeleteFinding = async (e: React.MouseEvent, finding: LegalFinding) => {
    e.stopPropagation()
    if (!id) return
    try {
      await legalApi.deleteFinding(id, finding.id)
      queryClient.invalidateQueries({ queryKey: ['legal-findings', id] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', id] })
      toast.success('삭제되었습니다')
    } catch (err: any) {
      toast.error(err?.message ?? '삭제 실패')
    }
  }

  async function handleZipDownload() {
    if (!findings?.length) return
    setZipLoading('준비 중...')
    try {
      const { zipSync } = await import('fflate')
      const files: Record<string, Uint8Array> = {}
      const encoder = new TextEncoder()

      for (let i = 0; i < findings.length; i++) {
        const f = findings[i]
        const idx = String(i + 1).padStart(3, '0')
        const folderName = `finding-${idx}_${(f.location ?? '위치없음').replace(/[\/\\:*?"<>|]/g, '_')}`
        setZipLoading(`수집 중... (${i + 1}/${findings.length})`)

        // 내용.txt — always included even if no photos
        files[`${folderName}/내용.txt`] = encoder.encode(buildMetaTxt(f))

        // 지적 사진
        const photoResults = await Promise.allSettled(
          f.photoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer()))
        )
        photoResults.forEach((r, j) => {
          if (r.status === 'fulfilled') {
            files[`${folderName}/지적사진-${j + 1}.jpg`] = new Uint8Array(r.value)
          }
        })

        // 조치 사진
        const resResults = await Promise.allSettled(
          f.resolutionPhotoKeys.map(k => fetch('/api/uploads/' + k).then(r => r.arrayBuffer()))
        )
        resResults.forEach((r, j) => {
          if (r.status === 'fulfilled') {
            files[`${folderName}/조치사진-${j + 1}.jpg`] = new Uint8Array(r.value)
          }
        })
      }

      setZipLoading('압축 중...')
      const zipped = zipSync(files, { level: 6 })
      const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)

      // iOS PWA: <a download> 방식이 가장 안정적으로 파일 앱 저장 다이얼로그 트리거
      const a = document.createElement('a')
      a.href = url
      a.download = `지적사항_${round?.title ?? 'report'}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 3000)
      toast.success('다운로드 완료')
    } catch (e) {
      console.error('ZIP download failed:', e)
      toast.error('다운로드에 실패했습니다')
    } finally {
      setZipLoading(false)
    }
  }

  const sortedFindings: LegalFinding[] = [...(findings ?? [])].sort((a, b) => {
    // open 먼저
    if (a.status === 'open' && b.status !== 'open') return -1
    if (a.status !== 'open' && b.status === 'open') return 1
    return b.createdAt.localeCompare(a.createdAt)
  })

  const isDesktop = useIsDesktop()

  // 제출 완료(종결) = 지적/조치 신규 등록·수정·삭제 잠금
  const isLocked = round?.submissionStatus === 'completed'

  // ── 관리자 도구 바 (데스크톱 전용 — 모바일은 결과 입력/저장·보고서·일괄 다운로드 제거) ──
  const adminBar = role === 'admin' && round && isDesktop ? (
    <div
      className={`bg-surface-raised border-b border-border-default flex gap-2 items-center flex-shrink-0 flex-wrap py-2 ${isDesktop ? 'px-6' : 'px-4'}`}
    >
      <select
        value={effectiveSelectedResult}
        onChange={e => setSelectedResult(e.target.value)}
        className="bg-surface-sunken border border-border-strong text-text-primary text-label rounded-sm px-3 py-1.5 appearance-none cursor-pointer"
      >
        <option value="">결과 미입력</option>
        <option value="pass">적합</option>
        <option value="fail">부적합</option>
        <option value="conditional">조건부적합</option>
      </select>
      <button
        onClick={handleSaveResult}
        disabled={savingResult}
        className={`bg-accent text-text-on-accent text-caption font-bold leading-none rounded-sm h-9 px-3 border-0 flex-shrink-0 ${savingResult ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}
      >결과 저장</button>
      <input ref={reportInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleReportUpload} />
      {round.reportFileKey ? (
        <button
          onClick={() => window.open('/api/uploads/' + round.reportFileKey, '_blank')}
          className="bg-surface-sunken border border-border-strong text-text-primary text-caption font-bold leading-none rounded-sm h-9 px-3 cursor-pointer flex-shrink-0"
        >보고서 보기</button>
      ) : (
        <button
          onClick={() => reportInputRef.current?.click()}
          disabled={uploadingReport}
          className={`bg-surface-sunken border border-border-strong text-text-secondary text-caption font-bold leading-none rounded-sm h-9 px-3 flex-shrink-0 ${uploadingReport ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}
        >{uploadingReport ? '업로드 중...' : '보고서 업로드'}</button>
      )}
      <button
        onClick={handleZipDownload}
        disabled={!!zipLoading || !findings?.length}
        className={`bg-surface-sunken border border-border-strong text-text-primary text-caption font-bold leading-none rounded-sm h-9 px-3 flex-shrink-0 whitespace-nowrap ${(zipLoading || !findings?.length) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}
      >{zipLoading || '일괄 다운로드'}</button>
    </div>
  ) : null

  // ── 지적사항 카드 렌더 ──
  const findingCard = (finding: LegalFinding) => (
    <div
      key={finding.id}
      onClick={() => navigate(`/legal/${id}/finding/${finding.id}`)}
      className={`bg-surface-sunken border border-border-default border-l-2 ${finding.status === 'open' ? 'border-fire-bar' : 'border-safe-bar'} rounded-md cursor-pointer flex flex-col gap-[3px] ${isDesktop ? 'p-4' : 'p-3'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm text-text-primary font-medium flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{finding.description}</span>
        <span
          className={`text-caption font-bold leading-none rounded-sm px-2 py-0.5 flex-shrink-0 ${finding.status === 'open' ? 'bg-fire-bg text-fire' : 'bg-safe-bg text-safe'}`}
        >{finding.status === 'open' ? '미조치' : '완료'}</span>
      </div>
      <div className="text-caption leading-none text-text-secondary">{finding.location ?? '위치 미지정'}</div>
      <div className="flex items-center justify-between">
        <span className="text-caption leading-none text-text-tertiary">{fmtDate(finding.createdAt)} · {finding.createdByName ?? finding.createdBy}</span>
        {!isLocked && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setEditingFinding(finding) }}
              className="text-caption leading-none text-text-tertiary bg-transparent border-0 cursor-pointer px-1 py-0.5"
            >수정</button>
            <button
              onClick={(e) => handleDeleteFinding(e, finding)}
              className="text-caption leading-none text-text-tertiary bg-transparent border-0 cursor-pointer px-1 py-0.5"
            >삭제</button>
          </div>
        )}
      </div>
    </div>
  )

  // ── 등록 버튼 (제출 완료 시 잠금 → 미표시) ──
  const addButton = isLocked ? null : (
    <button
      onClick={() => setShowSheet(true)}
      className={`text-text-on-accent font-bold border-0 cursor-pointer flex-shrink-0 ${isDesktop ? 'rounded-sm w-auto h-9 text-label px-4' : 'rounded-md w-full h-8 text-body-sm'}`}
      style={{
        background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
      }}
    >
      + 지적사항 등록
    </button>
  )

  return (
    <div className="bg-surface-page flex-1 flex flex-col h-full overflow-hidden">
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      {/* 모바일 헤더 */}
      {!isDesktop && (
        <header className="flex items-center h-12 px-3 bg-surface-raised border-b border-border-default shrink-0">
          <button
            aria-label="뒤로 가기"
            onClick={() => navigate(-1)}
            className="w-7 h-7 rounded-[7px] bg-surface-sunken text-text-secondary border-0 cursor-pointer flex items-center justify-center shrink-0"
          ><ChevronLeft size={20} /></button>
          <span className="flex-1 text-title font-semibold text-text-primary ml-2">{headerTitle}</span>
        </header>
      )}

      {/* 데스크톱 타이틀 + 등록 버튼 */}
      {isDesktop && (
        <div className="pt-6 px-7 pb-3 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-text-primary text-heading font-extrabold">{headerTitle}</div>
            {round && <div className="text-label text-text-secondary mt-1">{round.title}</div>}
          </div>
          {addButton}
        </div>
      )}

      {adminBar}

      {/* 제출 완료 잠금 안내 */}
      {isLocked && (
        <div className={`bg-safe-bg text-safe text-caption font-bold border-b border-border-default text-center flex-shrink-0 py-2 ${isDesktop ? 'px-7' : 'px-4'}`}>
          제출 완료된 점검 — 지적/조치사항 등록·수정·삭제 불가
        </div>
      )}

      {/* 콘텐츠 영역 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent" size={28} />
          {/* SKELETON_STYLE 박제 (외부 사용처 없음 — 변환 후 시각 디자인 동등) */}
          <div className="bg-surface-sunken rounded-md" style={{ ...SKELETON_STYLE, display: 'none' }} />
        </div>
      ) : isError ? (
        <div
          className="text-body-sm text-text-secondary flex-1 flex items-center justify-center px-6 text-center"
        >
          목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.
        </div>
      ) : (
        <div className={`flex-1 overflow-y-auto flex flex-col gap-2 ${isDesktop ? 'px-7 py-4 pb-6 max-w-[800px]' : isLocked ? 'px-4 py-3 pb-6' : 'px-4 py-3 pb-[calc(72px+var(--sab,0px))]'}`}>
          {sortedFindings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-[60px]">
              <div className="text-body font-bold text-text-primary">지적사항 없음</div>
              <div className="text-caption text-text-secondary text-center">{isLocked ? '제출 완료된 점검입니다.' : `현장에서 지적된 항목을 등록하려면 ${isDesktop ? '상단' : '아래'} 버튼을 누르세요.`}</div>
            </div>
          ) : sortedFindings.map(findingCard)}
        </div>
      )}

      {/* 모바일 고정 하단 CTA (제출 완료 시 잠금 → 미표시) */}
      {!isDesktop && !isLocked && (
        <div
          className="bg-surface-page border-t border-border-default fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[calc(12px+var(--sab,0px))] z-20"
        >
          {addButton}
        </div>
      )}

      {/* 등록 시트/모달 */}
      {showSheet && id && (
        <FindingFormSheet
          scheduleItemId={id}
          mode="create"
          onClose={() => setShowSheet(false)}
        />
      )}

      {/* 수정 시트/모달 */}
      {editingFinding && id && (
        <FindingEditModal
          scheduleItemId={id}
          finding={editingFinding}
          onClose={() => setEditingFinding(null)}
        />
      )}
    </div>
  )
}
