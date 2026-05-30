import { useState, useRef, useCallback } from 'react'
import { PhotoSourceModal } from '../components/PhotoSourceModal'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Wrench, X } from 'lucide-react'
import { elevatorInspectionApi, elevatorRepairApi } from '../utils/api'

// ── 이미지 뷰어 (핀치투줌 + 패닝) ─────────────────────────────────
function ImageViewer({ src, onClose }: { src: string; onClose: () => void }) {
  const imgRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const lastTouch = useRef<{ dist: number; cx: number; cy: number; x: number; y: number } | null>(null)
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  const getTouchDist = (t: React.TouchEvent) => {
    if (t.touches.length < 2) return 0
    const dx = t.touches[0].clientX - t.touches[1].clientX
    const dy = t.touches[0].clientY - t.touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
  const getTouchCenter = (t: React.TouchEvent) => ({
    x: (t.touches[0].clientX + t.touches[1].clientX) / 2,
    y: (t.touches[0].clientY + t.touches[1].clientY) / 2,
  })

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      lastTouch.current = { dist: getTouchDist(e), cx: getTouchCenter(e).x, cy: getTouchCenter(e).y, x: pos.x, y: pos.y }
    } else if (e.touches.length === 1 && scale > 1) {
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, px: pos.x, py: pos.y }
      setDragging(true)
    }
  }, [scale, pos])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouch.current) {
      e.preventDefault()
      const newDist = getTouchDist(e)
      const newScale = Math.min(5, Math.max(1, scale * (newDist / lastTouch.current.dist)))
      setScale(newScale)
      if (newScale <= 1) setPos({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && dragging && dragStart.current) {
      const dx = e.touches[0].clientX - dragStart.current.x
      const dy = e.touches[0].clientY - dragStart.current.y
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
    }
  }, [scale, dragging])

  const onTouchEnd = useCallback(() => {
    lastTouch.current = null
    dragStart.current = null
    setDragging(false)
    if (scale <= 1) setPos({ x: 0, y: 0 })
  }, [scale])

  const handleDoubleTap = useCallback(() => {
    if (scale > 1) { setScale(1); setPos({ x: 0, y: 0 }) }
    else setScale(2.5)
  }, [scale])

  return (
    <div className="fixed inset-0 z-[300] bg-[rgba(0,0,0,0.95)] flex flex-col">
      <div className="shrink-0 flex justify-end px-4 py-3 pt-[calc(12px+var(--sat,44px))]">
        <button onClick={onClose} className="bg-transparent border-none text-white cursor-pointer"><X size={24} /></button>
      </div>
      <div
        ref={imgRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={handleDoubleTap}
        className="flex-1 overflow-hidden flex items-center justify-center touch-none"
      >
        <img
          src={src}
          alt="상세보기"
          draggable={false}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: dragging ? 'none' : 'transform 0.15s ease',
          }}
        />
      </div>
    </div>
  )
}

// ── 날짜 포매터 ──────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// ── KVRow ──────────────────────────────────────────────────────────
function KVRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-caption text-text-tertiary w-16 shrink-0">{label}</span>
      <span className="text-[14px] text-text-primary flex-1 leading-[1.5]">{children}</span>
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-caption font-bold text-text-tertiary mb-[10px]">
      {children}
    </div>
  )
}

// ── 스핀너 ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-[28px] h-[28px] border-2 border-border-strong border-t-accent rounded-full [animation:spin_.7s_linear_infinite]" />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────
export default function ElevatorFindingDetailPage() {
  const { fid } = useParams<{ fid: string }>()
  const [searchParams] = useSearchParams()
  const eid = searchParams.get('eid') ?? ''
  const iid = searchParams.get('iid') ?? ''

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [memo, setMemo] = useState('')
  const [resolveDate, setResolveDate] = useState(new Date().toISOString().slice(0,10))
  const [photoKeys, setPhotoKeys] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const [showRepairPicker, setShowRepairPicker] = useState(false)
  const [linkedRepair, setLinkedRepair] = useState<any>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const [viewerSrc, setViewerSrc] = useState<string | null>(null)

  const { data: findings, isLoading, error } = useQuery({
    queryKey: ['elev-findings', iid],
    queryFn: () => elevatorInspectionApi.getFindings(eid, iid),
    enabled: !!eid && !!iid,
  })

  const finding = findings?.find(f => f.id === fid)

  // 해당 호기의 수리이력 조회
  const { data: repairList = [] } = useQuery({
    queryKey: ['elev-repairs-for-finding', eid],
    queryFn: () => elevatorRepairApi.list({ elevator_id: eid }),
    enabled: !!eid,
  })

  // 사진 업로드 핸들러 (최대 5장)
  const handlePhotoAdd = async (file: File) => {
    if (photoKeys.length >= 5) { toast.error('사진은 최대 5장까지 가능합니다'); return }
    setUploading(true)
    try {
      const { compressImage } = await import('../utils/imageUtils')
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append('file', compressed)
      const token = (await import('../stores/authStore')).useAuthStore.getState().token
      const res = await fetch('/api/uploads', { method: 'POST', body: fd, headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json() as any
      if (!json.success) throw new Error(json.error)
      setPhotoKeys(prev => [...prev, json.data.key])
      toast.success(`사진 ${photoKeys.length + 1}/5 업로드 완료`)
    } catch { toast.error('업로드 실패') }
    setUploading(false)
  }

  const resolveMutation = useMutation({
    mutationFn: async () => {
      return elevatorInspectionApi.resolveFinding(eid, iid, fid!, {
        resolution_memo: memo.trim(),
        resolution_photo_key: photoKeys.length > 0 ? photoKeys.join(',') : undefined,
        resolved_date: resolveDate,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elev-findings', iid] })
      toast.success('조치 완료')
      navigate(-1)
    },
    onError: () => {
      toast.error('조치 처리 실패')
    },
  })

  const handleResolve = () => {
    if (!memo.trim()) {
      toast.error('조치 내용을 입력하세요')
      return
    }
    resolveMutation.mutate()
  }

  const isSubmitting = resolveMutation.isPending

  return (
    <div className="flex-1 flex flex-col bg-surface-page h-full overflow-hidden">
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      {viewerSrc && <ImageViewer src={viewerSrc} onClose={() => setViewerSrc(null)} />}

      {/* 자체 헤더 */}
      <div className="h-12 bg-[rgba(22,27,34,0.97)] border-b border-border-default flex items-center shrink-0 px-3">
        <button
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="w-7 h-7 border-none bg-transparent cursor-pointer text-text-primary flex items-center justify-center shrink-0"
        >
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="flex-1 ml-2 text-title font-semibold text-text-primary">지적사항 상세</span>
      </div>

      {/* 로딩 */}
      {isLoading && <Spinner />}

      {/* 에러 or 없음 */}
      {!isLoading && (error || !finding) && (
        <div className="flex-1 flex items-center justify-center px-6 text-center text-[14px] text-text-secondary">
          항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.
        </div>
      )}

      {/* 콘텐츠 */}
      {!isLoading && finding && (
        <div
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: finding.status === 'open' ? 'calc(72px + var(--sab, 0px))' : 24 }}
        >
          {/* Section 1: 지적 정보 */}
          <div className="px-4 py-5 border-b border-border-default">
            <div className="flex items-center justify-between mb-3">
              <SectionHeader>지적 정보</SectionHeader>
              <span
                className={`text-[10px] font-bold px-2 py-[2px] rounded-[10px] ${
                  finding.status === 'open'
                    ? 'bg-[rgba(239,68,68,0.12)] text-danger-bar'
                    : 'bg-[rgba(34,197,94,0.12)] text-safe-bar'
                }`}
              >
                {finding.status === 'open' ? '미조치' : '조치완료'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <KVRow label="지적 내용">
                <span className="whitespace-pre-wrap">{finding.description}</span>
              </KVRow>
              <KVRow label="위치">{finding.location ?? '-'}</KVRow>
              <KVRow label="등록일">{fmtDate(finding.createdAt)}</KVRow>
              <KVRow label="등록자">{finding.createdByName ?? finding.createdBy}</KVRow>
            </div>
          </div>

          {/* Section 2: 지적 사진 */}
          <div className="px-4 py-5 border-b border-border-default">
            <SectionHeader>지적 사진</SectionHeader>
            {finding.photoKey ? (
              <img
                src={'/api/uploads/' + finding.photoKey}
                alt="지적 사진"
                onClick={() => setViewerSrc('/api/uploads/' + finding.photoKey)}
                className="w-full max-h-[240px] object-cover rounded-[10px] border border-border-default block mt-3 cursor-pointer"
              />
            ) : (
              <div className="text-[13px] text-text-tertiary mt-2">사진 없음</div>
            )}
          </div>

          {/* Section 3: 조치 내용 입력 (open 상태만) */}
          {finding.status === 'open' && (
            <div className="px-4 py-5 border-b border-border-default">
              <SectionHeader>조치 내용</SectionHeader>

              {/* 수리이력에서 선택 */}
              {!linkedRepair && (
                <button
                  onClick={() => setShowRepairPicker(!showRepairPicker)}
                  className="w-full mb-3 p-[10px] rounded-sm bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] text-info-bar text-caption font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Wrench size={14} />
                  수리이력에서 조치 선택
                </button>
              )}
              {showRepairPicker && !linkedRepair && (
                <div className="mb-3 bg-surface-sunken rounded-sm p-[10px] max-h-[200px] overflow-y-auto">
                  {repairList.filter((r: any) => r.sourceType === 'standalone').length === 0 && (
                    <div className="text-[11px] text-text-tertiary text-center p-2">수리 이력이 없습니다</div>
                  )}
                  {repairList.filter((r: any) => r.sourceType === 'standalone').map((r: any) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setLinkedRepair(r)
                        setMemo(r.title + (r.detail && r.detail !== r.title ? '\n' + r.detail : ''))
                        setResolveDate(r.date)
                        setShowRepairPicker(false)
                      }}
                      className="px-[10px] py-2 rounded-[6px] cursor-pointer mb-1 bg-surface-raised border border-border-default text-[11px]"
                    >
                      <div className="font-semibold text-text-primary">{r.title}</div>
                      <div className="text-text-tertiary mt-0.5">{r.date}{r.company ? ` · ${r.company}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
              {linkedRepair && (
                <div className="mb-3 bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.2)] rounded-sm px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 text-[11px]">
                    <span className="font-bold text-safe-bar inline-flex items-center gap-1 align-middle"><Wrench size={14} />연결됨: </span>
                    <span className="text-text-primary">{linkedRepair.date} · {linkedRepair.title}</span>
                  </div>
                  <button onClick={() => setLinkedRepair(null)} className="bg-transparent border-none text-text-tertiary cursor-pointer"><X size={14} /></button>
                </div>
              )}

              <div className="mb-3">
                <div className="text-caption text-text-tertiary mb-1">조치일</div>
                <input
                  type="date"
                  value={resolveDate}
                  onChange={e => setResolveDate(e.target.value)}
                  className="w-full px-3 py-[10px] rounded-[9px] bg-surface-sunken border border-border-strong text-text-primary text-[13px] outline-none font-[inherit] box-border min-w-0 appearance-none [-webkit-appearance:none]"
                />
              </div>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="조치 내용을 입력하세요"
                rows={4}
                className="w-full bg-surface-sunken rounded-sm p-3 border border-border-strong text-text-primary text-[14px] box-border font-['Noto_Sans_KR',sans-serif] leading-[1.5] resize-y outline-none"
              />
              <div className="mt-3">
                <div className="text-caption text-text-tertiary mb-1.5">조치 사진 ({photoKeys.length}/5)</div>
                <div className="flex gap-2 overflow-x-auto">
                  {/* 추가 버튼 (1:1 정사각형) */}
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoAdd(f); e.target.value = '' }} />
                  <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoAdd(f); e.target.value = '' }} />
                  <PhotoSourceModal open={showPhotoPicker} onClose={() => setShowPhotoPicker(false)} onCamera={() => cameraInputRef.current?.click()} onAlbum={() => albumInputRef.current?.click()} />
                  {photoKeys.length < 5 && (
                    <button
                      onClick={() => !uploading && setShowPhotoPicker(true)}
                      className={`w-[72px] h-[72px] shrink-0 rounded-[10px] border border-dashed border-border-strong bg-surface-sunken flex flex-col items-center justify-center gap-1 ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}
                    >
                      <span className="text-[22px]">📷</span>
                      <span className="text-[9px] text-text-tertiary font-semibold">{uploading ? '업로드 중' : `${photoKeys.length}/5`}</span>
                    </button>
                  )}
                  {/* 업로드된 사진 썸네일 */}
                  {photoKeys.map((key, idx) => (
                    <div key={key} className="relative w-[72px] h-[72px] shrink-0">
                      <img src={`/api/uploads/${key}`} alt={`조치 사진 ${idx+1}`} className="w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default" />
                      <button onClick={() => setPhotoKeys(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-danger-bar text-white border-none cursor-pointer flex items-center justify-center"><X size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: 조치 완료 (resolved 상태만) */}
          {finding.status === 'resolved' && (
            <div className="px-4 py-5 border-b border-border-default">
              <SectionHeader>조치 결과</SectionHeader>
              <div className="flex flex-col gap-2">
                <KVRow label="조치일시">{fmtDate(finding.resolvedAt)}</KVRow>
                <KVRow label="조치자">{finding.resolvedByName ?? finding.resolvedBy ?? '-'}</KVRow>
                <KVRow label="조치 내용">
                  <span className="whitespace-pre-wrap">{finding.resolutionMemo ?? '-'}</span>
                </KVRow>
              </div>
              {finding.resolutionPhotoKey && (() => {
                const keys = finding.resolutionPhotoKey!.split(',').filter(Boolean)
                if (keys.length === 1) {
                  return (
                    <img src={'/api/uploads/' + keys[0]} alt="조치 사진"
                      onClick={() => setViewerSrc('/api/uploads/' + keys[0])}
                      className="w-full max-h-[240px] object-cover rounded-[10px] border border-border-default block mt-3 cursor-pointer"
                    />
                  )
                }
                return (
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {keys.map((key, idx) => (
                      <img key={key} src={'/api/uploads/' + key} alt={`조치 사진 ${idx+1}`}
                        className="w-20 h-20 object-cover rounded-sm border border-border-default cursor-pointer"
                        onClick={() => setViewerSrc('/api/uploads/' + key)}
                      />
                    ))}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* 고정 하단 CTA (open 상태만) */}
      {!isLoading && finding && finding.status === 'open' && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-page border-t border-border-default px-4 py-3 pb-[calc(12px+var(--sab,0px))]">
          <button
            onClick={handleResolve}
            disabled={isSubmitting}
            className={`w-full h-8 bg-accent text-white text-[14px] font-bold border-none rounded-md transition-opacity duration-150 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
          >
            {isSubmitting ? '처리 중...' : '조치 완료'}
          </button>
        </div>
      )}
    </div>
  )
}
