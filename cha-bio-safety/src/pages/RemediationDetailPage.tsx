import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { remediationApi, api } from '../utils/api'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'
import { ChevronLeft, Image, RotateCcw, Trash2, Check } from 'lucide-react'

const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', basement: '지하', common: '지하' }

import { fmtKstDateTime as fmtDate } from '../utils/datetime'

function KVRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-caption leading-relaxed text-text-tertiary w-16 flex-shrink-0">{label}</span>
      <span className="text-body-sm leading-relaxed text-text-primary flex-1">{children}</span>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-caption font-bold leading-none mb-2.5 text-text-tertiary">
      {children}
    </div>
  )
}

export default function RemediationDetailPage() {
  const { recordId } = useParams<{ recordId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [memo, setMemo] = useState('')
  const [actionPick, setActionPick] = useState<
    '본체 교체' | '예비전원 교체' | '받침 교체' | '소화기 교체' | '경종 교체' | '위치표시등 교체' | '호스걸이 교체' | '방화셔터 라인 표시함' | '연동제어기 기판 교체' | '기판 교체' | '모터 교체' | '직접 입력'
  >('본체 교체')
  const [materialName, setMaterialName] = useState('')
  const [materialCount, setMaterialCount] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const photo = usePhotoUpload()
  const isAdmin = useAuthStore(s => s.staff?.role === 'admin')

  const GL_TYPE_LABEL: Record<string, string> = {
    ceiling_exit: '천장피난구',
    wall_exit: '벽부피난구',
    room_passage: '거실통로',
    corridor_passage: '복도통로',
    stair_passage: '계단통로',
    audience_passage: '객석통로',
  }

  const { data: record, isLoading, error } = useQuery({
    queryKey: ['remediation-detail', recordId],
    queryFn: () => remediationApi.get(recordId!),
    enabled: !!recordId,
  })

  const isGuideLight = record?.category === '유도등'
  const isExtinguisher = record?.category === '소화기'
  const isHydrant = record?.category === '소화전'
  const isFireShutter = record?.category === '방화셔터'
  const isSmokeDamper = record?.category === '전실제연댐퍼'

  // 점검 시 증상에 따라 기본 조치 선택 (유도등)
  useEffect(() => {
    if (!isGuideLight || !record) return
    const sym = record.memo ?? ''
    if (sym === '점등 이상') setActionPick('본체 교체')
    else if (sym === '예비전원 이상') setActionPick('예비전원 교체')
    else setActionPick('직접 입력')
  }, [isGuideLight, record?.id])

  // 점검 시 증상에 따라 기본 조치 선택 (소화기)
  useEffect(() => {
    if (!isExtinguisher || !record) return
    const sym = record.memo ?? ''
    if (sym === '받침 파손') setActionPick('받침 교체')
    else if (sym === '연한 만료') setActionPick('소화기 교체')
    else setActionPick('직접 입력')
  }, [isExtinguisher, record?.id])

  // 점검 시 증상에 따라 기본 조치 선택 (소화전)
  useEffect(() => {
    if (!isHydrant || !record) return
    const sym = record.memo ?? ''
    if (sym === '경종 파손') setActionPick('경종 교체')
    else if (sym === '위치표시등 점등 이상') setActionPick('위치표시등 교체')
    else if (sym === '호스걸이 파손') setActionPick('호스걸이 교체')
    else setActionPick('직접 입력')
  }, [isHydrant, record?.id])

  // 점검 시 증상에 따라 기본 조치 선택 (방화셔터)
  useEffect(() => {
    if (!isFireShutter || !record) return
    const sym = record.memo ?? ''
    if (sym === '방화셔터 라인 표시 필요') setActionPick('방화셔터 라인 표시함')
    else if (sym === '연동제어기 기판 작동 불') setActionPick('연동제어기 기판 교체')
    else setActionPick('직접 입력')
  }, [isFireShutter, record?.id])

  // 점검 시 증상에 따라 기본 조치 선택 (전실제연댐퍼)
  useEffect(() => {
    if (!isSmokeDamper || !record) return
    const sym = record.memo ?? ''
    if (sym === '기판 조작 불량') setActionPick('기판 교체')
    else if (sym === '모터 기능 이상') setActionPick('모터 교체')
    else setActionPick('직접 입력')
  }, [isSmokeDamper, record?.id])

  useEffect(() => {
    if (!isGuideLight) return
    if (actionPick === '본체 교체') {
      const t = GL_TYPE_LABEL[record?.guideLightType ?? ''] ?? ''
      setMaterialName(t ? `${t} 유도등` : '유도등')
      setMaterialCount('1')
    } else if (actionPick === '예비전원 교체') {
      setMaterialName('예비전원 4.8V 유도등')
      setMaterialCount('1')
    } else {
      setMaterialName('')
      setMaterialCount('')
    }
  }, [actionPick, isGuideLight, record?.guideLightType])

  // 소화기: 조치 → 자재 자동 채움
  useEffect(() => {
    if (!isExtinguisher) return
    if (actionPick === '받침 교체') {
      setMaterialName('소화기 받침')
      setMaterialCount('1')
    } else if (actionPick === '소화기 교체') {
      const t = (record?.extinguisherType ?? '').trim()
      setMaterialName(t ? `${t} 소화기` : '소화기')
      setMaterialCount('1')
    } else {
      setMaterialName('')
      setMaterialCount('')
    }
  }, [actionPick, isExtinguisher, record?.extinguisherType])

  // 소화전: 조치 → 자재 자동 채움
  useEffect(() => {
    if (!isHydrant) return
    if (actionPick === '경종 교체') {
      setMaterialName('경종')
      setMaterialCount('1')
    } else if (actionPick === '위치표시등 교체') {
      setMaterialName('위치표시등')
      setMaterialCount('1')
    } else if (actionPick === '호스걸이 교체') {
      setMaterialName('호스걸이')
      setMaterialCount('1')
    } else {
      setMaterialName('')
      setMaterialCount('')
    }
  }, [actionPick, isHydrant])

  // 방화셔터: 조치 → 자재 자동 채움
  useEffect(() => {
    if (!isFireShutter) return
    if (actionPick === '방화셔터 라인 표시함') {
      setMaterialName('방화셔터 스티커')
      setMaterialCount('1')
    } else if (actionPick === '연동제어기 기판 교체') {
      setMaterialName('연동제어기 기판')
      setMaterialCount('1')
    } else {
      setMaterialName('')
      setMaterialCount('')
    }
  }, [actionPick, isFireShutter])

  // 전실제연댐퍼: 조치 → 자재 자동 채움
  useEffect(() => {
    if (!isSmokeDamper) return
    if (actionPick === '기판 교체') {
      setMaterialName('제연댐퍼 작동 기판')
      setMaterialCount('1')
    } else if (actionPick === '모터 교체') {
      setMaterialName('제연댐퍼 모터')
      setMaterialCount('1')
    } else {
      setMaterialName('')
      setMaterialCount('')
    }
  }, [actionPick, isSmokeDamper])

  const handleDelete = async () => {
    if (!confirm('이 점검 기록을 영구 삭제합니다. 되돌릴 수 없습니다. 진행할까요?')) return
    try {
      await api.delete('/inspections/records/' + recordId)
      queryClient.invalidateQueries({ queryKey: ['remediation'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('삭제 완료')
      navigate(-1)
    } catch {
      toast.error('삭제 실패')
    }
  }

  const handleUnresolve = async () => {
    if (!confirm('조치를 취소하고 미조치 상태로 되돌립니다. 조치 메모/사진/소모 자재가 삭제됩니다. 진행할까요?')) return
    try {
      await api.post('/inspections/records/' + recordId + '/unresolve', {})
      queryClient.invalidateQueries({ queryKey: ['remediation'] })
      queryClient.invalidateQueries({ queryKey: ['remediation-detail'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('조치 취소됨')
      navigate(-1)
    } catch {
      toast.error('조치 취소 실패')
    }
  }

  const handleResolve = async () => {
    // 유도등/소화기는 피커, 그 외 카테고리는 직접 입력 메모 사용
    let finalMemo = ''
    if (isGuideLight) {
      finalMemo = actionPick === '직접 입력' ? memo.trim() : actionPick
      if (!finalMemo) { toast.error('조치 내용을 입력하세요'); return }
    } else if (isExtinguisher) {
      finalMemo = actionPick === '직접 입력' ? memo.trim() : actionPick
      if (!finalMemo) { toast.error('조치 내용을 입력하세요'); return }
    } else if (isHydrant) {
      finalMemo = actionPick === '직접 입력' ? memo.trim() : actionPick
      if (!finalMemo) { toast.error('조치 내용을 입력하세요'); return }
    } else if (isFireShutter) {
      finalMemo = actionPick === '직접 입력' ? memo.trim() : actionPick
      if (!finalMemo) { toast.error('조치 내용을 입력하세요'); return }
    } else if (isSmokeDamper) {
      finalMemo = actionPick === '직접 입력' ? memo.trim() : actionPick
      if (!finalMemo) { toast.error('조치 내용을 입력하세요'); return }
    } else {
      finalMemo = memo.trim()
      if (!finalMemo) { toast.error('조치 내용을 입력하세요'); return }
    }
    try {
      setSubmitting(true)
      let photoKey: string | null = null
      if (photo.hasPhoto) {
        photoKey = await photo.upload()
        if (photoKey === null) { toast.error('사진 업로드 실패'); return }
      }
      const materialsString = materialName.trim()
        ? `${materialName.trim()} ${materialCount || 1}ea`
        : null
      await api.post('/inspections/records/' + recordId + '/resolve', {
        resolution_memo: finalMemo,
        resolution_photo_key: photoKey,
        materials_used: materialsString,
      })
      queryClient.invalidateQueries({ queryKey: ['remediation'] })
      queryClient.invalidateQueries({ queryKey: ['remediation-detail'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('조치 완료')
      navigate(-1)
    } catch {
      toast.error('조치 처리 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-page">
      {/* 자체 헤더 — sketch .det-page-hd */}
      <div className="h-12 bg-surface-raised border-b border-border-default flex items-center justify-center relative flex-shrink-0 px-3">
        <button
          aria-label="목록으로 돌아가기"
          onClick={() => navigate(-1)}
          className="absolute left-3 w-7 h-7 border-none bg-transparent cursor-pointer text-text-primary flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-title font-semibold text-text-primary">조치 상세</span>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="border-2 border-border-strong border-t-accent rounded-full w-[28px] h-[28px] [animation:spin_.7s_linear_infinite]" />
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      )}

      {/* 에러 */}
      {error && !isLoading && (
        <div className="flex-1 flex items-center justify-center px-6 text-center text-body-sm text-text-secondary">
          항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.
        </div>
      )}

      {/* 콘텐츠 */}
      {!isLoading && !error && record && (
        <div
          className={`flex-1 overflow-y-auto ${record.status === 'open' ? 'pb-[calc(72px+var(--sab,0px))]' : 'pb-6'}`}
        >
          {/* Section 1: 점검 정보 — sketch .det-section */}
          <div className="py-5 px-4 border-b border-border-default">
            <SectionHeader>점검 정보</SectionHeader>
            <div className="flex flex-col gap-2">
              <KVRow label="카테고리">{record.category}</KVRow>
              <KVRow label="위치">
                {(() => {
                  const zk = ZONE_LABEL[record.zone] ?? record.zone
                  const spot = record.locationDetail || record.markerLabel
                  if (record.category === '유도등' && spot) return `${zk} ${record.floor} ${spot}`
                  return `${zk} ${record.floor}${record.location ? ` · ${record.location}` : ''}`
                })()}
              </KVRow>
              <KVRow label="점검일">{fmtDate(record.checkedAt)}</KVRow>
              <KVRow label="점검자">{record.staffName ?? '-'}</KVRow>
              <KVRow label="판정결과">
                {record.result === 'bad'
                  ? <span className="inline-flex items-center text-caption font-bold leading-none px-1.5 py-0.5 rounded-[5px] bg-danger-bg text-danger">불량</span>
                  : <span className="inline-flex items-center text-caption font-bold leading-none px-1.5 py-0.5 rounded-[5px] bg-warning-bg text-warning">주의</span>
                }
              </KVRow>
            </div>
          </div>

          {/* Section 2: 점검 기록 — sketch .det-section */}
          <div className="py-5 px-4 border-b border-border-default">
            <SectionHeader>점검 기록</SectionHeader>
            <p className={`text-body-sm leading-relaxed m-0 whitespace-pre-wrap ${record.memo ? 'text-text-primary' : 'text-text-tertiary'}`}>
              {record.memo ?? '메모 없음'}
            </p>
            {record.photoKey && (
              <img
                src={'/api/uploads/' + record.photoKey}
                alt="점검 사진"
                className="w-full max-h-60 object-cover rounded-[10px] border border-border-default block mt-3 bg-surface-sunken"
              />
            )}
          </div>

          {/* Section 3: 조치 완료 정보 (resolved only) — sketch .det-section */}
          {record.status === 'resolved' && (
            <div className="py-5 px-4 border-b border-border-default">
              <SectionHeader>조치 완료</SectionHeader>
              <div className="flex flex-col gap-2">
                <KVRow label="조치일시">{fmtDate(record.resolvedAt)}</KVRow>
                <KVRow label="조치자">{record.resolvedBy ?? '-'}</KVRow>
                <KVRow label="조치 메모">
                  <span className="whitespace-pre-wrap">{record.resolutionMemo ?? '-'}</span>
                </KVRow>
                <KVRow label="소모 자재">
                  <span className="whitespace-pre-wrap">{record.materialsUsed ?? '-'}</span>
                </KVRow>
              </div>
              {record.resolutionPhotoKey && (
                <img
                  src={'/api/uploads/' + record.resolutionPhotoKey}
                  alt="조치 사진"
                  className="w-full max-h-60 object-cover rounded-[10px] border border-border-default block mt-3 bg-surface-sunken"
                />
              )}
            </div>
          )}

          {/* Admin 액션 영역 — sketch .det-admin-row */}
          {isAdmin && (
            <div className="py-3.5 px-4 border-b border-border-default flex gap-2 flex-wrap">
              {record.status === 'resolved' && (
                <button
                  onClick={handleUnresolve}
                  className="px-3.5 py-2 rounded-md bg-transparent text-caption font-bold leading-none cursor-pointer inline-flex items-center gap-1 border border-warning-bar text-warning-bar"
                >
                  <RotateCcw size={14} />조치 취소
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-md bg-transparent text-caption font-bold leading-none cursor-pointer inline-flex items-center gap-1 border border-danger-bar text-danger-bar"
              >
                <Trash2 size={14} />점검 기록 삭제
              </button>
            </div>
          )}

          {/* Section 4: 조치 내용 입력 (open only) — sketch .det-section */}
          {record.status !== 'resolved' && (
            <div className="py-5 px-4">
              <SectionHeader>조치 내용 입력</SectionHeader>

              {/* 유도등: 조치 피커 — sketch .det-picker */}
              {isGuideLight && (
                <div className="flex gap-[5px] mb-2.5">
                  {(['본체 교체', '예비전원 교체', '직접 입력'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActionPick(opt)}
                      className={`flex-1 rounded-[10px] cursor-pointer font-bold leading-tight text-center border text-caption px-1 py-2.5${actionPick === opt ? ' border-2 border-accent text-accent' : ' border-border-default bg-surface-raised text-text-secondary'}`}
                      style={actionPick === opt ? { background: 'rgba(59,130,246,0.12)' } : undefined}
                    >{opt}</button>
                  ))}
                </div>
              )}

              {/* 소화기: 조치 피커 — sketch .det-picker */}
              {isExtinguisher && (
                <div className="flex gap-[5px] mb-2.5">
                  {(['받침 교체', '소화기 교체', '직접 입력'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActionPick(opt)}
                      className={`flex-1 rounded-[10px] cursor-pointer font-bold leading-tight text-center border text-caption px-1 py-2.5${actionPick === opt ? ' border-2 border-accent text-accent' : ' border-border-default bg-surface-raised text-text-secondary'}`}
                      style={actionPick === opt ? { background: 'rgba(59,130,246,0.12)' } : undefined}
                    >{opt}</button>
                  ))}
                </div>
              )}

              {/* 소화전: 조치 피커 (4-옵션 tight) — sketch .det-picker.tight, 11px 화이트리스트 */}
              {isHydrant && (
                <div className="flex gap-[5px] mb-2.5">
                  {(['경종 교체', '위치표시등 교체', '호스걸이 교체', '직접 입력'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActionPick(opt)}
                      className={`flex-1 rounded-[10px] cursor-pointer font-bold leading-tight text-center border${actionPick === opt ? ' border-2 border-accent text-accent' : ' border-border-default bg-surface-raised text-text-secondary'}`}
                      style={actionPick === opt ? { fontSize: 11, padding: '10px 2px', background: 'rgba(59,130,246,0.12)' } : { fontSize: 11, padding: '10px 2px' }}
                    >{opt}</button>
                  ))}
                </div>
              )}

              {/* 방화셔터: 조치 피커 — sketch .det-picker */}
              {isFireShutter && (
                <div className="flex gap-[5px] mb-2.5">
                  {(['방화셔터 라인 표시함', '연동제어기 기판 교체', '직접 입력'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActionPick(opt)}
                      className={`flex-1 rounded-[10px] cursor-pointer font-bold leading-tight text-center border text-caption px-1 py-2.5${actionPick === opt ? ' border-2 border-accent text-accent' : ' border-border-default bg-surface-raised text-text-secondary'}`}
                      style={actionPick === opt ? { background: 'rgba(59,130,246,0.12)' } : undefined}
                    >{opt}</button>
                  ))}
                </div>
              )}

              {/* 전실제연댐퍼: 조치 피커 — sketch .det-picker */}
              {isSmokeDamper && (
                <div className="flex gap-[5px] mb-2.5">
                  {(['기판 교체', '모터 교체', '직접 입력'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setActionPick(opt)}
                      className={`flex-1 rounded-[10px] cursor-pointer font-bold leading-tight text-center border text-caption px-1 py-2.5${actionPick === opt ? ' border-2 border-accent text-accent' : ' border-border-default bg-surface-raised text-text-secondary'}`}
                      style={actionPick === opt ? { background: 'rgba(59,130,246,0.12)' } : undefined}
                    >{opt}</button>
                  ))}
                </div>
              )}

              {/* 직접 입력 textarea — 피커 카테고리 외 항상 / 피커 카테고리에서 직접입력일 때만 */}
              {((!isGuideLight && !isExtinguisher && !isHydrant && !isFireShutter && !isSmokeDamper) || actionPick === '직접 입력') && (
                <textarea
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="조치 내용을 입력하세요 (필수)"
                  className="w-full min-h-24 bg-surface-sunken border border-border-strong rounded-[10px] text-body-sm leading-relaxed text-text-primary p-3 resize-y box-border font-sans"
                />
              )}

              {/* 소모 자재 + 사진 (모든 카테고리 공통) — sketch .det-mat-row* */}
              <div className="flex items-center justify-between mt-3 mb-1">
                <span className="text-caption leading-none text-text-tertiary">소모 자재</span>
                <span className="text-caption leading-none text-text-tertiary">조치 사진 (선택)</span>
              </div>
              <div className="flex gap-2 items-start">
                <div className="flex-1 min-w-0 flex flex-col gap-1 h-[72px]">
                  <input
                    type="text"
                    value={materialName}
                    onChange={e => setMaterialName(e.target.value)}
                    placeholder="자재명"
                    className="flex-1 min-h-0 min-w-0 w-full bg-surface-sunken border border-border-strong rounded-md text-label text-text-primary px-2.5 box-border"
                    style={{ fontFamily: 'inherit' }}
                  />
                  <div className="relative flex-1 min-h-0 min-w-0">
                    <input
                      type="number"
                      min={0}
                      value={materialCount}
                      onChange={e => setMaterialCount(e.target.value)}
                      placeholder="0"
                      className="w-full h-full min-w-0 bg-surface-sunken border border-border-strong rounded-md text-label text-text-primary pr-7 pl-2.5 box-border"
                      style={{ fontFamily: 'inherit' }}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-caption leading-none text-text-tertiary pointer-events-none">ea</span>
                  </div>
                </div>
                <PhotoButton hook={photo} label="촬영" noCapture />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 고정 하단 CTA (open only) — sketch .det-cta */}
      {!isLoading && !error && record && record.status !== 'resolved' && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-surface-page border-t border-border-default px-4 py-3 pb-[calc(12px+var(--sab,0px))]"
        >
          <button
            onClick={handleResolve}
            disabled={submitting}
            className={`w-full h-12 bg-accent text-on-accent text-body-sm font-bold border-none rounded-xl transition-opacity flex items-center justify-center gap-1.5 leading-none ${submitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'}`}
          >
            <Check size={16} />
            {submitting ? '처리 중...' : '조치 완료'}
          </button>
        </div>
      )}
    </div>
  )
}
