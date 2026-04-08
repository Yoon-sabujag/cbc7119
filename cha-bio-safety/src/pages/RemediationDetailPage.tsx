import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { remediationApi, api } from '../utils/api'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', common: '공용' }

import { fmtKstDateTime as fmtDate } from '../utils/datetime'

function KVRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: 'var(--t3)', width: 64, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--t1)', flex: 1, lineHeight: 1.5 }}>{children}</span>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 10 }}>
      {children}
    </div>
  )
}

export default function RemediationDetailPage() {
  const { recordId } = useParams<{ recordId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [memo, setMemo] = useState('')
  const [actionPick, setActionPick] = useState<'본체 교체' | '예비전원 교체' | '직접 입력'>('본체 교체')
  const [materialName, setMaterialName] = useState('')
  const [materialCount, setMaterialCount] = useState<string>('1')
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

  // 점검 시 증상에 따라 기본 조치 선택
  useEffect(() => {
    if (!isGuideLight || !record) return
    const sym = record.memo ?? ''
    if (sym === '점등 이상') setActionPick('본체 교체')
    else if (sym === '예비전원 이상') setActionPick('예비전원 교체')
    else setActionPick('직접 입력')
  }, [isGuideLight, record?.id])

  useEffect(() => {
    if (!isGuideLight) return
    if (actionPick === '본체 교체') {
      setMaterialName(GL_TYPE_LABEL[record?.guideLightType ?? ''] ?? '')
      setMaterialCount('1')
    } else if (actionPick === '예비전원 교체') {
      setMaterialName('예비전원')
      setMaterialCount('1')
    } else {
      setMaterialName('')
      setMaterialCount('')
    }
  }, [actionPick, isGuideLight, record?.guideLightType])

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
    // 유도등이면 피커, 아니면 직접 입력 메모 사용
    let finalMemo = ''
    if (isGuideLight) {
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
      const materialsString = isGuideLight
        ? (materialName.trim() ? `${materialName.trim()} ${materialCount || 1}ea` : null)
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
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
          aria-label="목록으로 돌아가기"
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
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>조치 상세</span>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2px solid var(--bd2)', borderTopColor: 'var(--acl)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      )}

      {/* 에러 */}
      {error && !isLoading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', fontSize: 14, color: 'var(--t2)' }}>
          항목을 불러오지 못했습니다. 뒤로 가서 다시 시도하세요.
        </div>
      )}

      {/* 콘텐츠 */}
      {!isLoading && !error && record && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: record.status === 'open' ? 'calc(72px + var(--sab, 0px))' : 24,
        }}>
          {/* Section 1: 점검 정보 */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
            <SectionHeader>점검 정보</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                <span style={{
                  display: 'inline-block',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 5,
                  background: record.result === 'bad' ? 'rgba(239,68,68,.13)' : 'rgba(245,158,11,.13)',
                  color: record.result === 'bad' ? 'var(--danger)' : 'var(--warn)',
                }}>
                  {record.result === 'bad' ? '불량' : '주의'}
                </span>
              </KVRow>
            </div>
          </div>

          {/* Section 2: 점검 기록 */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
            <SectionHeader>점검 기록</SectionHeader>
            <p style={{ fontSize: 14, color: record.memo ? 'var(--t1)' : 'var(--t3)', lineHeight: 1.5, margin: 0 }}>
              {record.memo ?? '메모 없음'}
            </p>
            {record.photoKey && (
              <img
                src={'/api/uploads/' + record.photoKey}
                alt="점검 사진"
                style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block', marginTop: 12 }}
              />
            )}
          </div>

          {/* Section 3: 조치 완료 정보 (resolved only) */}
          {record.status === 'resolved' && (
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--bd)' }}>
              <SectionHeader>조치 완료</SectionHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <KVRow label="조치일시">{fmtDate(record.resolvedAt)}</KVRow>
                <KVRow label="조치자">{record.resolvedBy ?? '-'}</KVRow>
                <KVRow label="조치 메모">
                  <span style={{ whiteSpace: 'pre-wrap' }}>{record.resolutionMemo ?? '-'}</span>
                </KVRow>
                <KVRow label="소모 자재">
                  <span style={{ whiteSpace: 'pre-wrap' }}>{record.materialsUsed ?? '-'}</span>
                </KVRow>
              </div>
              {record.resolutionPhotoKey && (
                <img
                  src={'/api/uploads/' + record.resolutionPhotoKey}
                  alt="조치 사진"
                  style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block', marginTop: 12 }}
                />
              )}
            </div>
          )}

          {/* Admin 액션 영역 */}
          {isAdmin && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bd)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {record.status === 'resolved' && (
                <button
                  onClick={handleUnresolve}
                  style={{
                    padding: '8px 14px', borderRadius: 8, border: '1px solid var(--warn)',
                    background: 'transparent', color: 'var(--warn)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >조치 취소</button>
              )}
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--danger)',
                  background: 'transparent', color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >점검 기록 삭제</button>
            </div>
          )}

          {/* Section 4: 조치 내용 입력 (open only) */}
          {record.status !== 'resolved' && (
            <div style={{ padding: '20px 16px' }}>
              <SectionHeader>조치 내용 입력</SectionHeader>

              {/* 유도등: 조치 피커 */}
              {isGuideLight && (
                <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                  {(['본체 교체', '예비전원 교체', '직접 입력'] as const).map(opt => (
                    <button key={opt} onClick={() => setActionPick(opt)} style={{
                      flex: 1, padding: '10px 4px', borderRadius: 10, cursor: 'pointer',
                      border: actionPick === opt ? '2px solid var(--acl)' : '1px solid var(--bd)',
                      background: actionPick === opt ? 'rgba(59,130,246,.12)' : 'var(--bg2)',
                      fontSize: 12, fontWeight: 700, color: actionPick === opt ? 'var(--acl)' : 'var(--t2)',
                    }}>{opt}</button>
                  ))}
                </div>
              )}

              {/* 직접 입력 textarea — 비유도등 항상 / 유도등에서 직접입력일 때만 */}
              {(!isGuideLight || actionPick === '직접 입력') && (
                <textarea
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="조치 내용을 입력하세요 (필수)"
                  style={{
                    width: '100%',
                    minHeight: 96,
                    background: 'var(--bg3)',
                    border: '1px solid var(--bd2)',
                    borderRadius: 10,
                    fontSize: 14,
                    color: 'var(--t1)',
                    padding: 12,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'Noto Sans KR, sans-serif',
                    lineHeight: 1.5,
                  }}
                />
              )}

              {/* 유도등 전용: 자재 + 개수 + 사진 (한 줄) */}
              {isGuideLight ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>소모 자재</span>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>조치 사진 (선택)</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, height: 72 }}>
                      <input
                        type="text"
                        value={materialName}
                        onChange={e => setMaterialName(e.target.value)}
                        placeholder="자재명"
                        style={{
                          flex: 1, minHeight: 0, minWidth: 0, width: '100%',
                          background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 8,
                          fontSize: 13, color: 'var(--t1)', padding: '0 10px',
                          boxSizing: 'border-box', fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0 }}>
                        <input
                          type="number"
                          min={0}
                          value={materialCount}
                          onChange={e => setMaterialCount(e.target.value)}
                          placeholder="0"
                          style={{
                            width: '100%', height: '100%', minWidth: 0,
                            background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 8,
                            fontSize: 13, color: 'var(--t1)', padding: '0 28px 0 10px',
                            boxSizing: 'border-box', fontFamily: 'inherit',
                          }}
                        />
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--t3)', pointerEvents: 'none' }}>ea</span>
                      </div>
                    </div>
                    <PhotoButton hook={photo} label="촬영" noCapture />
                  </div>
                </>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <PhotoButton hook={photo} noCapture />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 고정 하단 CTA (open only) */}
      {!isLoading && !error && record && record.status !== 'resolved' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg)',
          borderTop: '1px solid var(--bd)',
          padding: '12px 16px',
          paddingBottom: 'calc(12px + var(--sab, 0px))',
        }}>
          <button
            onClick={handleResolve}
            disabled={submitting}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--acl)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              borderRadius: 12,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {submitting ? '처리 중...' : '조치 완료'}
          </button>
        </div>
      )}
    </div>
  )
}
