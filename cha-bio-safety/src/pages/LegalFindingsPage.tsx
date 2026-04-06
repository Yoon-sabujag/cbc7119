import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { useMultiPhotoUpload } from '../hooks/useMultiPhotoUpload'
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
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 스핀너 ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--bd2)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}

// ── 구역/층 매핑 ─────────────────────────────────────────────────
const ZONES = [
  { key: 'research', label: '연구동' },
  { key: 'office',   label: '사무동' },
  { key: 'bridge',   label: '브릿지' },
  { key: 'basement', label: '지하' },
] as const

const ZONE_FLOORS: Record<string, string[]> = {
  research: ['8-1F','8F','7F','6F','5F','3F','2F','1F'],
  office:   ['8-1F','8F','7F','6F','5F','3F','2F','1F'],
  bridge:   ['7F','6F','5F','3F'],
  basement: ['B1','M','B2','B3','B4','B5'],
}

const FINDING_ITEMS = [
  '직접입력',
  '감지기(불꽃)','감지기(열)','감지기(연기)',
  '방화문','방화셔터','비상방송설비','비상콘센트',
  'DIV','소방펌프','소화기','소화전','스프링클러','시각경보기',
  '완강기','유도등','자동화재탐지설비',
  '전실제연댐퍼','청정소화약제',
]

const ZONE_FLOOR_DETAILS = [
  '직접입력',
  '복도',
  '계단실',
  '화장실',
  'EPS',
  'TPS',
  '기계실',
  '전기실',
  '주차장',
  '로비',
  '회의실',
  '실험실',
  '옥상',
] as const

// ── 지적사항 등록 BottomSheet ─────────────────────────────────────
interface BottomSheetProps {
  scheduleItemId: string
  onClose: () => void
}

function FindingBottomSheet({ scheduleItemId, onClose }: BottomSheetProps) {
  const queryClient = useQueryClient()
  const [zone, setZone] = useState('')
  const [floor, setFloor] = useState('')
  const [locationDetail, setLocationDetail] = useState('직접입력')
  const [customLocationDetail, setCustomLocationDetail] = useState('')
  const [inspectionItem, setInspectionItem] = useState('')
  const [customItem, setCustomItem] = useState('')
  const [description, setDescription] = useState('')
  const photos = useMultiPhotoUpload()

  const mutation = useMutation({
    mutationFn: async () => {
      const photoKeys = await photos.uploadAll()
      const detailValue = locationDetail === '직접입력' ? customLocationDetail.trim() : locationDetail
      const loc = [
        ZONES.find(z => z.key === zone)?.label,
        floor,
        detailValue || undefined,
      ].filter(Boolean).join(' ')
      const item = inspectionItem === '직접입력' ? customItem.trim() : inspectionItem
      return legalApi.createFinding(scheduleItemId, {
        description: [item, description.trim()].filter(Boolean).join(' — '),
        location: loc || undefined,
        photo_keys: photoKeys.length > 0 ? photoKeys : undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-findings', scheduleItemId] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', scheduleItemId] })
      toast.success('지적사항이 등록되었습니다.')
      photos.reset()
      onClose()
    },
    onError: () => {
      toast.error('등록에 실패했습니다. 다시 시도해 주세요.')
    },
  })

  const isSubmitting = mutation.isPending || photos.isUploading

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('지적 내용을 입력하세요')
      return
    }
    mutation.mutate()
  }

  const floors = zone ? (ZONE_FLOORS[zone] ?? []) : []

  const lblStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }
  const inputStyle: React.CSSProperties = {
    background: 'var(--bg3)',
    borderRadius: 9,
    padding: '10px 12px',
    border: '1px solid var(--bd2)',
    width: '100%',
    color: 'var(--t1)',
    fontSize: 13,
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    minWidth: 0,
    WebkitAppearance: 'none',
    appearance: 'none',
  }
  const chipStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    padding: '9px 0',
    borderRadius: 8,
    border: active ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background: active ? 'rgba(59,130,246,.12)' : 'var(--bg3)',
    color: active ? 'var(--acl)' : 'var(--t2)',
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    textAlign: 'center',
  })
  const floorChipStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    padding: '7px 0',
    borderRadius: 8,
    border: active ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background: active ? 'rgba(59,130,246,.12)' : 'var(--bg3)',
    color: active ? 'var(--acl)' : 'var(--t2)',
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    textAlign: 'center',
  })

  return (
    <div
      onClick={onClose}
      onTouchMove={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 50,
        overscrollBehavior: 'contain',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onTouchMove={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          borderRadius: '16px 16px 0 0',
          animation: 'slideUp 0.28s ease-out both',
          maxHeight: '90vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {/* 드래그 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
        </div>

        {/* 제목 */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 등록</div>
        </div>

        {/* 폼 */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 구역 선택 */}
          <div>
            <div style={lblStyle}>구역</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ZONES.map(z => (
                <button key={z.key} onClick={() => { setZone(z.key); setFloor('') }} style={chipStyle(zone === z.key)}>{z.label}</button>
              ))}
            </div>
          </div>

          {/* 층 선택 */}
          {floors.length > 0 && (
            <div>
              <div style={lblStyle}>층</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {floors.map(f => (
                  <button key={f} onClick={() => setFloor(f)} style={floorChipStyle(floor === f)}>{f}</button>
                ))}
              </div>
            </div>
          )}

          {/* 위치 상세 */}
          <div>
            <div style={lblStyle}>위치 상세</div>
            <select
              value={locationDetail}
              onChange={e => { setLocationDetail(e.target.value); setCustomLocationDetail('') }}
              style={{
                background: 'var(--bg3)',
                borderRadius: 9,
                padding: '8px 12px',
                border: '1px solid var(--bd2)',
                width: '100%',
                color: 'var(--t1)',
                fontSize: 13,
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              {ZONE_FLOOR_DETAILS.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            {locationDetail === '직접입력' && (
              <input
                type="text"
                value={customLocationDetail}
                onChange={e => setCustomLocationDetail(e.target.value)}
                placeholder="직접 입력"
                style={{ ...inputStyle, marginTop: 8 }}
              />
            )}
          </div>

          {/* 지적 항목 (리스트 선택) */}
          <div>
            <div style={lblStyle}>지적 항목</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--bd2)', borderRadius: 9, overflow: 'hidden', maxHeight: 123, overflowY: 'auto' }}>
              {FINDING_ITEMS.map((item, i) => (
                <button
                  key={item}
                  onClick={() => setInspectionItem(item)}
                  style={{
                    padding: '10px 12px',
                    background: inspectionItem === item ? 'rgba(59,130,246,.1)' : 'var(--bg3)',
                    border: 'none',
                    borderBottom: i < FINDING_ITEMS.length - 1 ? '1px solid var(--bd)' : 'none',
                    color: inspectionItem === item ? 'var(--acl)' : 'var(--t1)',
                    fontSize: 13,
                    fontWeight: inspectionItem === item ? 700 : 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            {inspectionItem === '직접입력' && (
              <input
                type="text"
                value={customItem}
                onChange={e => setCustomItem(e.target.value)}
                placeholder="점검 항목을 직접 입력하세요"
                style={{ ...inputStyle, marginTop: 8 }}
              />
            )}
          </div>

          {/* 지적 내용 */}
          <div>
            <div style={lblStyle}>
              지적 내용 <span style={{ color: 'var(--danger)' }}>*</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="지적 내용을 입력하세요"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* 지적 사진 (최대 5장) */}
          <div>
            <div style={lblStyle}>지적 사진 (최대 5장)</div>
            <input ref={photos.inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={photos.handleFiles} />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {photos.slots.map((slot, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={slot.preview} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block' }} />
                  <button
                    aria-label="사진 제거"
                    onClick={() => photos.removeSlot(i)}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                  >✕</button>
                  {slot.uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>업로드 중</div>}
                </div>
              ))}
              {photos.canAdd && (
                <button onClick={photos.pickPhotos} style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg3)', border: '1px dashed var(--bd2)', color: 'var(--t3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 22 }}>📷</span>사진 첨부
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div style={{ padding: '4px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--acl)',
              borderRadius: 10,
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? '처리 중...' : '지적사항 등록'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 48,
              background: 'transparent',
              border: '1px solid var(--bd2)',
              borderRadius: 10,
              color: 'var(--t2)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────
export default function LegalFindingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { staff } = useAuthStore()
  const role = staff?.role

  const [showSheet, setShowSheet] = useState(false)
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      {/* 자체 헤더 */}
      <div style={{
        height: 48,
        background: 'rgba(22,27,34,0.97)',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}>
        <button
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 12,
            width: 36,
            height: 36,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--t1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{headerTitle}</span>
      </div>

      {/* 관리자 전용 서브 헤더 */}
      {role === 'admin' && round && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--bd)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <select
            value={effectiveSelectedResult}
            onChange={e => setSelectedResult(e.target.value)}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--bd2)',
              borderRadius: 8,
              padding: '6px 12px',
              color: 'var(--t1)',
              fontSize: 13,
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">결과 미입력</option>
            <option value="pass">적합</option>
            <option value="fail">부적합</option>
            <option value="conditional">조건부적합</option>
          </select>

          <button
            onClick={handleSaveResult}
            disabled={savingResult}
            style={{
              fontSize: 12,
              fontWeight: 700,
              height: 36,
              background: 'var(--acl)',
              borderRadius: 8,
              padding: '0 12px',
              border: 'none',
              color: '#fff',
              cursor: savingResult ? 'not-allowed' : 'pointer',
              opacity: savingResult ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            결과 저장
          </button>

          <input
            ref={reportInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleReportUpload}
          />

          {round.reportFileKey ? (
            <button
              onClick={() => window.open('/api/uploads/' + round.reportFileKey, '_blank')}
              style={{
                fontSize: 12,
                fontWeight: 700,
                height: 36,
                background: 'var(--bg3)',
                borderRadius: 8,
                padding: '0 12px',
                border: '1px solid var(--bd2)',
                color: 'var(--t1)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              보고서 보기
            </button>
          ) : (
            <button
              onClick={() => reportInputRef.current?.click()}
              disabled={uploadingReport}
              style={{
                fontSize: 12,
                fontWeight: 700,
                height: 36,
                background: 'var(--bg3)',
                borderRadius: 8,
                padding: '0 12px',
                border: '1px solid var(--bd2)',
                color: 'var(--t2)',
                cursor: uploadingReport ? 'not-allowed' : 'pointer',
                opacity: uploadingReport ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              {uploadingReport ? '업로드 중...' : '보고서 업로드'}
            </button>
          )}

          <button
            onClick={handleZipDownload}
            disabled={!!zipLoading || !findings?.length}
            style={{
              fontSize: 12,
              fontWeight: 700,
              height: 36,
              background: 'var(--bg3)',
              borderRadius: 8,
              padding: '0 12px',
              border: '1px solid var(--bd2)',
              color: 'var(--t1)',
              cursor: (zipLoading || !findings?.length) ? 'not-allowed' : 'pointer',
              opacity: (zipLoading || !findings?.length) ? 0.6 : 1,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {zipLoading || '일괄 다운로드'}
          </button>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', fontSize: 14, color: 'var(--t2)' }}>
          목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.
        </div>
      ) : (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          paddingBottom: 'calc(72px + var(--sab, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {sortedFindings.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 없음</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>현장에서 지적된 항목을 등록하려면 아래 버튼을 누르세요.</div>
            </div>
          ) : (
            sortedFindings.map(finding => (
              <div
                key={finding.id}
                onClick={() => navigate(`/legal/${id}/finding/${finding.id}`)}
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--bd)',
                  borderLeft: `2px solid ${finding.status === 'open' ? 'var(--danger)' : 'var(--safe)'}`,
                  borderRadius: 12,
                  padding: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {/* Line 1: 지적 내용 + 상태 배지 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {finding.description}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: '2px 8px',
                    flexShrink: 0,
                    background: finding.status === 'open' ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.13)',
                    color: finding.status === 'open' ? 'var(--danger)' : 'var(--safe)',
                  }}>
                    {finding.status === 'open' ? '미조치' : '완료'}
                  </span>
                </div>

                {/* Line 2: 위치 */}
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                  {finding.location ?? '위치 미지정'}
                </div>

                {/* Line 3: 등록일 + 등록자 + 삭제 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                    {fmtDate(finding.createdAt)} · {finding.createdByName ?? finding.createdBy}
                  </span>
                  <button
                    onClick={(e) => handleDeleteFinding(e, finding)}
                    style={{ fontSize: 10, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 고정 하단 CTA */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg)',
        borderTop: '1px solid var(--bd)',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + var(--sab, 0px))',
        zIndex: 20,
      }}>
        <button
          onClick={() => setShowSheet(true)}
          style={{
            width: '100%',
            height: 48,
            background: 'var(--acl)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          + 지적사항 등록
        </button>
      </div>

      {/* BottomSheet */}
      {showSheet && id && (
        <FindingBottomSheet
          scheduleItemId={id}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  )
}
