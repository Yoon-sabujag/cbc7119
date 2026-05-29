import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addMonths, addYears, differenceInCalendarDays, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { educationApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'
import type { EducationRecord, StaffEducation } from '../types'
import { ChevronLeft } from 'lucide-react'

// ── D-day 계산 ────────────────────────────────────────────────
function calcNextDeadline(
  appointedAt: string | null,
  records: EducationRecord[]
): { deadline: Date | null; dday: number | null; label: string } {
  if (!appointedAt) return { deadline: null, dday: null, label: '선임일 미등록' }
  const sorted = [...records].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  if (sorted.length === 0) {
    const d = addMonths(parseISO(appointedAt), 6)
    return { deadline: d, dday: differenceInCalendarDays(d, new Date()), label: '첫 실무교육' }
  }
  const d = addYears(parseISO(sorted[0].completedAt), 2)
  return { deadline: d, dday: differenceInCalendarDays(d, new Date()), label: '보수교육' }
}

// ── 날짜 포매터 ───────────────────────────────────────────────
function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${y}-${m}-${d}`
}

function dateToYmd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ── 직급 정렬 순서 ───────────────────────────────────────────
const TITLE_ORDER: Record<string, number> = { '주임': 0, '대리': 1, '기사': 2 }
function titleRank(title: string) { return TITLE_ORDER[title] ?? 99 }

// ── D-day 배지 ────────────────────────────────────────────────
function DdayBadge({ dday }: { dday: number }) {
  let colorClass: string
  let label: string

  if (dday > 30) {
    colorClass = 'bg-safe-bg text-safe'
    label = `D-${dday}`
  } else if (dday >= 0) {
    colorClass = 'bg-warning-bg text-warning'
    label = `D-${dday}`
  } else {
    colorClass = 'bg-danger-bg text-danger'
    label = `D+${Math.abs(dday)} 초과`
  }

  return (
    <div
      className={`text-caption font-bold leading-none rounded-sm ${colorClass}`}
      style={{ padding: '2px 8px', flexShrink: 0 }}
    >
      {label}
    </div>
  )
}

// ── 직원 교육 카드 ────────────────────────────────────────────
function StaffEducationCard({
  item,
  canEdit,
  selected,
  onTap,
}: {
  item: StaffEducation
  canEdit: boolean
  selected?: boolean
  onTap: () => void
}) {
  const { staff, records } = item
  const { deadline, dday, label } = calcNextDeadline(staff.appointedAt, records)

  const sorted = [...records].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  const lastRecord = sorted[0] ?? null

  return (
    <div
      onClick={canEdit ? onTap : undefined}
      className={`bg-surface-raised rounded-md ${selected ? 'border-2 border-accent' : 'border border-border-default'}`}
      style={{
        padding: 16,
        minHeight: 80,
        cursor: canEdit ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* 상단 행: 아바타 + 이름/직책 + 배지 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* 아바타 */}
        <div
          className="bg-surface-sunken text-text-secondary text-body-sm font-bold rounded-full"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {staff.name.charAt(0)}
        </div>

        {/* 이름 + 직책 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-body font-bold text-text-primary" style={{ lineHeight: 1.3 }}>
            {staff.name}
          </div>
          <div className="text-label text-text-secondary" style={{ marginTop: 2 }}>
            {staff.title}
          </div>
        </div>

        {/* D-day 배지 */}
        {dday !== null ? (
          <DdayBadge dday={dday} />
        ) : null}
      </div>

      {/* 하단 행: 이수 이력 + 다음 마감 */}
      <div style={{ marginTop: 10, paddingLeft: 44 }}>
        {lastRecord ? (
          <div className="text-caption leading-relaxed text-text-tertiary" style={{ marginBottom: 2 }}>
            마지막 이수: {fmtDate(lastRecord.completedAt)} ({lastRecord.educationType === 'initial' ? '실무' : '보수'})
          </div>
        ) : null}

        {staff.appointedAt === null ? (
          <div className="text-caption leading-relaxed text-text-tertiary">
            선임일 미등록
          </div>
        ) : deadline ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="text-caption leading-relaxed text-text-secondary">
              다음 마감: {dateToYmd(deadline)}
            </span>
            <span className="text-caption leading-relaxed text-text-tertiary">
              ({label})
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ── 이수 기록 등록/수정 패널 (데스크톱 우측 패널 & 모바일 바텀시트 공용) ──
interface EditPanelProps {
  item: StaffEducation
  canEdit: boolean
  onSaved: () => void
}

function EducationEditPanel({ item, canEdit, onSaved }: EditPanelProps) {
  const queryClient = useQueryClient()
  const { staff, records } = item
  const { deadline, dday, label } = calcNextDeadline(staff.appointedAt, records)

  const sorted = [...records].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  const hasRecords = sorted.length > 0

  const [completedAt, setCompletedAt] = useState(dateToYmd(new Date()))
  const [educationType, setEducationType] = useState<'initial' | 'refresher'>(
    hasRecords ? 'refresher' : 'initial'
  )
  const [editingRecord, setEditingRecord] = useState<EducationRecord | null>(null)

  const isEditMode = editingRecord !== null

  const createMutation = useMutation({
    mutationFn: () => educationApi.create({
      staffId: staff.id,
      education_type: educationType,
      completed_at: completedAt,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      toast.success('이수일이 기록되었습니다.')
      onSaved()
    },
    onError: () => toast.error('이수 기록 저장에 실패했습니다.'),
  })

  const updateMutation = useMutation({
    mutationFn: () => educationApi.update(editingRecord!.id, { completed_at: completedAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      toast.success('이수일이 수정되었습니다.')
      onSaved()
    },
    onError: () => toast.error('이수 기록 저장에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => educationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      toast.success('이수 기록이 삭제되었습니다.')
      onSaved()
    },
    onError: (e: any) => toast.error(e?.message ?? '삭제에 실패했습니다.'),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  function handleStartEdit(record: EducationRecord) {
    setEditingRecord(record)
    setCompletedAt(record.completedAt)
    setEducationType(record.educationType)
  }

  function handleCancelEdit() {
    setEditingRecord(null)
    setCompletedAt(dateToYmd(new Date()))
    setEducationType(hasRecords ? 'refresher' : 'initial')
  }

  function handleSubmit() {
    if (!completedAt) return
    if (isEditMode) updateMutation.mutate()
    else createMutation.mutate()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 프로필 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          className="bg-surface-sunken text-text-secondary text-body font-bold rounded-full"
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {staff.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div className="text-title font-extrabold text-text-primary">{staff.name}</div>
          <div className="text-label text-text-secondary" style={{ marginTop: 2 }}>{staff.title}</div>
        </div>
        {dday !== null && <DdayBadge dday={dday} />}
      </div>

      {/* 마감 정보 */}
      {staff.appointedAt && deadline && (
        <div className="bg-surface-sunken rounded-md" style={{ padding: '12px 16px' }}>
          <div className="text-caption leading-none text-text-tertiary" style={{ marginBottom: 4 }}>다음 마감</div>
          <div className="text-body-sm font-bold text-text-primary">
            {dateToYmd(deadline)} <span className="text-caption leading-none text-text-tertiary">({label})</span>
          </div>
        </div>
      )}

      {/* 이수 이력 */}
      {sorted.length > 0 && (
        <div>
          <div className="text-label font-bold text-text-secondary" style={{ marginBottom: 8 }}>이수 이력</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sorted.map(rec => (
              <div
                key={rec.id}
                className="bg-surface-sunken rounded-sm"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px',
                }}
              >
                <span className="text-label text-text-secondary">
                  {fmtDate(rec.completedAt)} ({rec.educationType === 'initial' ? '실무' : '보수'})
                </span>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => editingRecord?.id === rec.id ? handleCancelEdit() : handleStartEdit(rec)}
                      className="bg-surface-raised border border-border-strong text-label leading-none rounded-sm text-text-secondary"
                      style={{
                        padding: '4px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      {editingRecord?.id === rec.id ? '취소' : '수정'}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(rec.id)}
                      disabled={isSubmitting}
                      className="bg-surface-raised border border-border-strong text-label leading-none rounded-sm text-text-tertiary"
                      style={{
                        padding: '4px 10px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 등록/수정 폼 */}
      {canEdit && (
        <div className="border-t border-border-default" style={{ paddingTop: 16 }}>
          <div className="text-label font-bold text-text-secondary" style={{ marginBottom: 10 }}>
            {isEditMode ? '이수일 수정' : '이수 기록 등록'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div className="text-caption leading-none font-bold text-text-tertiary" style={{ marginBottom: 6 }}>이수일</div>
              <input
                type="date"
                value={completedAt}
                onChange={e => setCompletedAt(e.target.value)}
                className="bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  minWidth: 0,
                }}
              />
            </div>
            <div>
              <div className="text-caption leading-none font-bold text-text-tertiary" style={{ marginBottom: 6 }}>교육 유형</div>
              <select
                value={educationType}
                onChange={e => setEducationType(e.target.value as 'initial' | 'refresher')}
                disabled={!hasRecords && !isEditMode}
                className={`${(!hasRecords && !isEditMode) ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed' : 'bg-surface-sunken text-text-primary cursor-pointer'} border border-border-strong text-label rounded-md`}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  minWidth: 0,
                  pointerEvents: (!hasRecords && !isEditMode) ? 'none' : 'auto',
                }}
              >
                <option value="initial">실무교육 (최초)</option>
                <option value="refresher">보수교육</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !completedAt}
              className="text-text-on-accent text-body font-bold rounded-md"
              style={{
                width: '100%',
                height: 44,
                border: 'none',
                cursor: isSubmitting ? 'default' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                marginTop: 4,
                background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
              }}
            >
              {isSubmitting ? '저장 중...' : (isEditMode ? '수정 완료' : '이수일 기록')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 모바일 바텀시트 ──────────────────────────────────────────
function EducationBottomSheet({ item, canEdit, onClose, onSaved }: EditPanelProps & { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 50,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-surface-raised rounded-t-lg"
        style={{
          animation: 'slideUp 0.28s ease-out both',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '16px 16px 32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div className="bg-border-strong rounded-sm" style={{ width: 32, height: 4 }} />
        </div>
        <EducationEditPanel item={item} canEdit={canEdit} onSaved={onSaved} />
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function EducationPage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const { staff: currentStaff } = useAuthStore()

  const [selectedItem, setSelectedItem] = useState<StaffEducation | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['education'],
    queryFn: educationApi.list,
  })

  function canEdit(cardStaffId: string): boolean {
    if (!currentStaff) return false
    return currentStaff.role === 'admin' || currentStaff.id === cardStaffId
  }

  // 그룹핑: admin=소방안전관리자, assistant=보조자 / 직급순 정렬
  const adminList = (data ?? []).filter(i => i.staff.role === 'admin').sort((a, b) => titleRank(a.staff.title) - titleRank(b.staff.title))
  const assistantList = (data ?? []).filter(i => i.staff.role !== 'admin').sort((a, b) => titleRank(a.staff.title) - titleRank(b.staff.title))

  function renderCards(items: StaffEducation[]) {
    return items.map(item => (
      <StaffEducationCard
        key={item.staff.id}
        item={item}
        canEdit={canEdit(item.staff.id)}
        selected={isDesktop && selectedItem?.staff.id === item.staff.id}
        onTap={() => setSelectedItem(item)}
      />
    ))
  }

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: isDesktop ? 15 : 13,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: 8,
    marginTop: 4,
  }

  function renderGroupedList() {
    if (isLoading) return (
      <>
        <div className="bg-surface-sunken rounded-md" style={{ height: 88, animation: 'blink 2s ease-in-out infinite' }} />
        <div className="bg-surface-sunken rounded-md" style={{ height: 88, animation: 'blink 2s ease-in-out infinite' }} />
        <div className="bg-surface-sunken rounded-md" style={{ height: 88, animation: 'blink 2s ease-in-out infinite' }} />
        <div className="bg-surface-sunken rounded-md" style={{ height: 88, animation: 'blink 2s ease-in-out infinite' }} />
      </>
    )
    if (isError) return (
      <div className="text-body-sm text-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: 24 }}>
        교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.
      </div>
    )
    if (!data || data.length === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: 24, gap: 8 }}>
        <div className="text-body font-bold text-text-secondary">교육 이력 없음</div>
        <div className="text-body-sm text-text-tertiary">이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.</div>
      </div>
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {adminList.length > 0 && (
          <>
            <div style={sectionLabelStyle}>소방안전관리자</div>
            {renderCards(adminList)}
          </>
        )}
        {assistantList.length > 0 && (
          <>
            <div style={{ ...sectionLabelStyle, marginTop: adminList.length > 0 ? 12 : 4 }}>소방안전관리 보조자</div>
            {renderCards(assistantList)}
          </>
        )}
      </div>
    )
  }

  // ── 데스크톱: 2분할 레이아웃 ──
  if (isDesktop) {
    return (
      <div className="bg-surface-page" style={{ display: 'flex', height: '100%' }}>
        {/* 좌측: 카드 목록 — 페이지 제목은 App.tsx 헤더에서 표시 */}
        <div className="border-r border-border-default" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {renderGroupedList()}
          </div>
        </div>

        {/* 우측: 상세 패널 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {selectedItem ? (
            <EducationEditPanel
              key={selectedItem.staff.id}
              item={selectedItem}
              canEdit={canEdit(selectedItem.staff.id)}
              onSaved={() => {}}
            />
          ) : (
            <div className="text-body-sm text-text-tertiary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              좌측에서 직원을 선택하세요
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── 모바일 ──
  return (
    <div className="bg-surface-page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* 모바일 헤더 */}
      <div
        className="bg-surface-raised border-b border-border-default"
        style={{ height: 48, display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-text-secondary w-7 h-7 rounded-[7px] bg-surface-sunken border-0 cursor-pointer flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-title font-semibold text-text-primary flex-1 text-center">
          보수교육
        </span>
        <div className="w-7" />
      </div>

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {renderGroupedList()}
      </div>

      {/* 모바일 바텀시트 */}
      {selectedItem && (
        <EducationBottomSheet
          item={selectedItem}
          canEdit={canEdit(selectedItem.staff.id)}
          onClose={() => setSelectedItem(null)}
          onSaved={() => setSelectedItem(null)}
        />
      )}

      {/* 애니메이션 */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
