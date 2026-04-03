import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { PhotoButton } from '../components/PhotoButton'
import type { LegalFinding, LegalInspection, InspectionType, InspectionResult, FindingStatus } from '../types'

// ── 날짜 포매터 ───────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

// ── 인라인 SVG 아이콘 ─────────────────────────────────────────
function IconChevronLeft({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

// ── 스켈레톤 ──────────────────────────────────────────────────
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 타입 배지 ─────────────────────────────────────────────────
function TypeBadge({ type }: { type: InspectionType }) {
  const isComprehensive = type === 'comprehensive'
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 6px',
      borderRadius: 5,
      background: isComprehensive ? 'rgba(14,165,233,0.13)' : 'rgba(249,115,22,0.13)',
      color: isComprehensive ? 'var(--info)' : 'var(--fire)',
      flexShrink: 0,
    }}>
      {isComprehensive ? '종합정밀' : '작동기능'}
    </span>
  )
}

// ── 결과 배지 ─────────────────────────────────────────────────
function ResultBadge({ result }: { result: InspectionResult }) {
  const cfg = {
    pass:        { bg: 'rgba(34,197,94,0.13)',   color: 'var(--safe)',   label: '적합' },
    conditional: { bg: 'rgba(245,158,11,0.13)',  color: 'var(--warn)',   label: '조건부' },
    fail:        { bg: 'rgba(239,68,68,0.13)',   color: 'var(--danger)', label: '부적합' },
  }[result]
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 6px',
      borderRadius: 5,
      background: cfg.bg,
      color: cfg.color,
      flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  )
}

// ── 상태 배지 ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: FindingStatus }) {
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 6px',
      borderRadius: 5,
      background: status === 'open' ? 'rgba(245,158,11,0.13)' : 'rgba(34,197,94,0.13)',
      color: status === 'open' ? 'var(--warn)' : 'var(--safe)',
      flexShrink: 0,
    }}>
      {status === 'open' ? '미조치' : '완료'}
    </span>
  )
}

// ── 지적사항 카드 ────────────────────────────────────────────
function FindingCard({ item, onClick }: { item: LegalFinding; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--bd)',
        borderLeft: item.status === 'open' ? '2px solid var(--warn)' : '2px solid var(--safe)',
        borderRadius: 12,
        padding: 12,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* description preview */}
      <div style={{
        fontSize: 14,
        color: 'var(--t1)',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: 1.5,
      }}>
        {item.description}
      </div>

      {/* location + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {item.location ? (
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>{item.location}</span>
        ) : (
          <span />
        )}
        <StatusBadge status={item.status} />
      </div>

      {/* createdAt */}
      <div style={{ fontSize: 12, color: 'var(--t2)' }}>
        {fmtDate(item.createdAt)}
      </div>
    </div>
  )
}

// ── 지적 등록 BottomSheet (all staff) ───────────────────────
interface CreateFindingSheetProps {
  inspectionId: string
  onClose: () => void
}

function CreateFindingSheet({ inspectionId, onClose }: CreateFindingSheetProps) {
  const queryClient = useQueryClient()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const photo = usePhotoUpload()

  const mutation = useMutation({
    mutationFn: async () => {
      let photoKey: string | undefined
      if (photo.hasPhoto) {
        const key = await photo.upload()
        if (key === null) { toast.error('사진 업로드 실패'); throw new Error('photo upload failed') }
        photoKey = key
      }
      return legalApi.createFinding(inspectionId, {
        description: description.trim(),
        location: location.trim() || undefined,
        photo_key: photoKey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-findings', inspectionId] })
      queryClient.invalidateQueries({ queryKey: ['legal-inspections'] })
      toast.success('지적사항이 등록되었습니다')
      onClose()
    },
    onError: () => {
      toast.error('등록에 실패했습니다. 다시 시도해 주세요.')
    },
  })

  const isSubmitting = mutation.isPending
  const canSubmit = description.trim() && !isSubmitting

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg3)',
    borderRadius: 8,
    padding: 12,
    border: '1px solid var(--bd2)',
    color: 'var(--t1)',
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'Noto Sans KR, sans-serif',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 50,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          borderRadius: '16px 16px 0 0',
          animation: 'slideUp 0.28s ease-out both',
          maxHeight: '90vh',
          overflowY: 'auto',
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
        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 지적 내용 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>지적 내용 <span style={{ color: 'var(--danger)' }}>*</span></div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="지적 내용을 입력하세요"
              style={{ ...inputStyle, minHeight: 88, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* 위치 정보 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>위치 정보 (선택)</div>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="예: B1F 전기실 동쪽"
              style={{ ...inputStyle, height: 44 }}
            />
          </div>

          {/* 지적 사진 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8 }}>지적 사진 (선택)</div>
            <PhotoButton hook={photo} label="사진 첨부" />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit}
            style={{
              width: '100%',
              height: 48,
              background: 'var(--acl)',
              borderRadius: 10,
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor: canSubmit ? 'pointer' : 'default',
              opacity: canSubmit ? 1 : 0.5,
              transition: 'opacity 0.15s',
            }}
          >
            {isSubmitting ? '처리 중...' : '지적 등록'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 48,
              background: 'transparent',
              borderRadius: 10,
              border: '1px solid var(--bd2)',
              color: 'var(--t2)',
              fontWeight: 400,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function LegalFindingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as 'all' | 'open' | 'resolved') || 'open'
  const setTab = (t: 'all' | 'open' | 'resolved') => {
    setSearchParams(prev => { prev.set('tab', t); return prev }, { replace: true })
  }
  const [showCreate, setShowCreate] = useState(false)

  // 회차 요약용: 전체 목록에서 id로 찾기
  const { data: inspections } = useQuery({
    queryKey: ['legal-inspections'],
    queryFn: legalApi.listInspections,
    staleTime: 30_000,
  })
  const inspection = inspections?.find(i => i.id === id) ?? null

  const { data: findings, isLoading, isError } = useQuery({
    queryKey: ['legal-findings', id],
    queryFn: () => legalApi.listFindings(id!),
    enabled: !!id,
    staleTime: 30_000,
  })

  // 필터 + 정렬: open 먼저, 그 다음 resolved, 각 그룹 내 createdAt DESC
  const allFindings = findings ?? []
  const filtered: LegalFinding[] = allFindings
    .filter(f => tab === 'all' ? true : f.status === tab)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'open' ? -1 : 1
      return b.createdAt.localeCompare(a.createdAt)
    })

  const STATUS_TABS: { key: 'open' | 'resolved' | 'all'; label: string }[] = [
    { key: 'open', label: '미조치' },
    { key: 'resolved', label: '완료' },
    { key: 'all', label: '전체' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>

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
          onClick={() => navigate('/legal')}
          style={{
            position: 'absolute',
            left: 8,
            width: 36,
            height: 36,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--t2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconChevronLeft size={20} color="var(--t2)" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항</span>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            position: 'absolute',
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--acl)',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          + 지적 등록
        </button>
      </div>

      {/* 회차 요약 스트립 */}
      {inspection && (
        <div style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--bd)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          flexWrap: 'wrap',
          minHeight: 56,
        }}>
          <TypeBadge type={inspection.inspectionType} />
          <span style={{ fontSize: 13, color: 'var(--t2)' }}>{fmtDate(inspection.inspectedAt)}</span>
          <span style={{ fontSize: 13, color: 'var(--t2)' }}>· {inspection.agency}</span>
          <ResultBadge result={inspection.result} />
        </div>
      )}

      {/* 상태 필터 탭 */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
        <div style={{ display: 'flex' }}>
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                height: 44,
                border: 'none',
                background: tab === t.key ? 'var(--bg4)' : 'transparent',
                color: tab === t.key ? 'var(--t1)' : 'var(--t3)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: tab === t.key ? '2px solid var(--acl)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading && (
          <>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </>
        )}

        {isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14 }}>
            목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
            {tab === 'all' ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>지적사항 없음</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>이번 점검에서 등록된 지적사항이 없습니다.</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>해당 조건의 지적사항 없음</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>필터를 변경해 다시 조회하세요.</div>
              </>
            )}
          </div>
        )}

        {!isLoading && !isError && filtered.map(item => (
          <FindingCard
            key={item.id}
            item={item}
            onClick={() => navigate(`/legal/${id}/finding/${item.id}`)}
          />
        ))}
      </div>

      {/* 지적 등록 BottomSheet */}
      {showCreate && id && (
        <CreateFindingSheet inspectionId={id} onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}
