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
      className={`text-caption font-bold leading-none rounded-sm px-2 py-0.5 shrink-0 ${colorClass}`}
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
      className={`bg-surface-raised rounded-md p-4 min-h-[80px] select-none [-webkit-tap-highlight-color:transparent] ${canEdit ? 'cursor-pointer' : 'cursor-default'} ${selected ? 'border-2 border-accent' : 'border border-border-default'}`}
    >
      {/* 상단 행: 아바타 + 이름/직책 + 배지 */}
      <div className="flex items-start gap-3">
        {/* 아바타 */}
        <div className="bg-surface-sunken text-text-secondary text-body-sm font-bold rounded-full w-[32px] h-[32px] flex items-center justify-center shrink-0">
          {staff.name.charAt(0)}
        </div>

        {/* 이름 + 직책 */}
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold text-text-primary leading-[1.3]">
            {staff.name}
          </div>
          <div className="text-label text-text-secondary mt-[2px]">
            {staff.title}
          </div>
        </div>

        {/* D-day 배지 */}
        {dday !== null ? (
          <DdayBadge dday={dday} />
        ) : null}
      </div>

      {/* 하단 행: 이수 이력 + 다음 마감 */}
      <div className="mt-[10px] pl-11">
        {lastRecord ? (
          <div className="text-caption leading-relaxed text-text-tertiary mb-[2px]">
            마지막 이수: {fmtDate(lastRecord.completedAt)} ({lastRecord.educationType === 'initial' ? '실무' : '보수'})
          </div>
        ) : null}

        {staff.appointedAt === null ? (
          <div className="text-caption leading-relaxed text-text-tertiary">
            선임일 미등록
          </div>
        ) : deadline ? (
          <div className="flex items-center gap-1.5">
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
    <div className="flex flex-col gap-4">
      {/* 프로필 헤더 */}
      <div className="flex items-center gap-3">
        <div className="bg-surface-sunken text-text-secondary text-body font-bold rounded-full w-10 h-10 flex items-center justify-center shrink-0">
          {staff.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="text-title font-extrabold text-text-primary">{staff.name}</div>
          <div className="text-label text-text-secondary mt-[2px]">{staff.title}</div>
        </div>
        {dday !== null && <DdayBadge dday={dday} />}
      </div>

      {/* 마감 정보 */}
      {staff.appointedAt && deadline && (
        <div className="bg-surface-sunken rounded-md px-4 py-3">
          <div className="text-caption leading-none text-text-tertiary mb-1">다음 마감</div>
          <div className="text-body-sm font-bold text-text-primary">
            {dateToYmd(deadline)} <span className="text-caption leading-none text-text-tertiary">({label})</span>
          </div>
        </div>
      )}

      {/* 이수 이력 */}
      {sorted.length > 0 && (
        <div>
          <div className="text-label font-bold text-text-secondary mb-2">이수 이력</div>
          <div className="flex flex-col gap-1.5">
            {sorted.map(rec => (
              <div
                key={rec.id}
                className="bg-surface-sunken rounded-sm flex items-center justify-between px-3 py-2"
              >
                <span className="text-label text-text-secondary">
                  {fmtDate(rec.completedAt)} ({rec.educationType === 'initial' ? '실무' : '보수'})
                </span>
                {canEdit && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => editingRecord?.id === rec.id ? handleCancelEdit() : handleStartEdit(rec)}
                      className="bg-surface-raised border border-border-strong text-label leading-none rounded-sm text-text-secondary px-[10px] py-1 cursor-pointer"
                    >
                      {editingRecord?.id === rec.id ? '취소' : '수정'}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(rec.id)}
                      disabled={isSubmitting}
                      className={`bg-surface-raised border border-border-strong text-label leading-none rounded-sm text-text-tertiary px-[10px] py-1 ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
        <div className="border-t border-border-default pt-4">
          <div className="text-label font-bold text-text-secondary mb-[10px]">
            {isEditMode ? '이수일 수정' : '이수 기록 등록'}
          </div>
          <div className="flex flex-col gap-[10px]">
            <div>
              <div className="text-caption leading-none font-bold text-text-tertiary mb-1.5">이수일</div>
              <input
                type="date"
                value={completedAt}
                onChange={e => setCompletedAt(e.target.value)}
                className="bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md w-full px-3 py-[10px] outline-none box-border appearance-none [-webkit-appearance:none] min-w-0"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <div className="text-caption leading-none font-bold text-text-tertiary mb-1.5">교육 유형</div>
              <select
                value={educationType}
                onChange={e => setEducationType(e.target.value as 'initial' | 'refresher')}
                disabled={!hasRecords && !isEditMode}
                className={`${(!hasRecords && !isEditMode) ? 'bg-surface-sunken text-text-tertiary cursor-not-allowed pointer-events-none' : 'bg-surface-sunken text-text-primary cursor-pointer pointer-events-auto'} border border-border-strong text-label rounded-md w-full px-3 py-[10px] outline-none box-border appearance-none [-webkit-appearance:none] min-w-0`}
                style={{ fontFamily: 'inherit' }}
              >
                <option value="initial">실무교육 (최초)</option>
                <option value="refresher">보수교육</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !completedAt}
              className={`text-text-on-accent text-body font-bold rounded-md w-full h-11 border-0 mt-1 bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] ${isSubmitting ? 'cursor-default opacity-60' : 'cursor-pointer opacity-100'}`}
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
    <>
      {/* backdrop — z-[98], 화면 dim */}
      <div onClick={onClose} className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-[98]" />
      {/* sheet — /education 는 MOBILE_NO_NAV_PATHS (BottomNav 없음) → bottom:0 + max-h safe-area only */}
      <div
        onClick={e => e.stopPropagation()}
        className="fixed left-0 right-0 bottom-0 z-[99] bg-surface-raised rounded-t-lg border-t border-border-default overflow-y-auto overflow-x-hidden px-4 pt-4 pb-8 max-h-[calc(100dvh-var(--sat,0px)-var(--sab,0px))] [animation:slideUp_0.28s_ease-out_both]"
      >
        <div className="flex justify-center mb-2">
          <div className="bg-border-strong rounded-sm w-8 h-1" />
        </div>
        <EducationEditPanel item={item} canEdit={canEdit} onSaved={onSaved} />
      </div>
    </>
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
        <div className="bg-surface-sunken rounded-md h-[88px] [animation:blink_2s_ease-in-out_infinite]" />
        <div className="bg-surface-sunken rounded-md h-[88px] [animation:blink_2s_ease-in-out_infinite]" />
        <div className="bg-surface-sunken rounded-md h-[88px] [animation:blink_2s_ease-in-out_infinite]" />
        <div className="bg-surface-sunken rounded-md h-[88px] [animation:blink_2s_ease-in-out_infinite]" />
      </>
    )
    if (isError) return (
      <div className="text-body-sm text-danger flex items-center justify-center flex-1 text-center p-6">
        교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.
      </div>
    )
    if (!data || data.length === 0) return (
      <div className="flex flex-col items-center justify-center flex-1 text-center p-6 gap-2">
        <div className="text-body font-bold text-text-secondary">교육 이력 없음</div>
        <div className="text-body-sm text-text-tertiary">이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.</div>
      </div>
    )

    return (
      <div className="flex flex-col gap-3">
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
      <div className="bg-surface-page flex h-full">
        {/* 좌측: 카드 목록 — 페이지 제목은 App.tsx 헤더에서 표시 */}
        <div className="border-r border-border-default flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {renderGroupedList()}
          </div>
        </div>

        {/* 우측: 상세 패널 */}
        <div className="flex-1 overflow-y-auto px-[32px] py-6">
          {selectedItem ? (
            <EducationEditPanel
              key={selectedItem.staff.id}
              item={selectedItem}
              canEdit={canEdit(selectedItem.staff.id)}
              onSaved={() => {}}
            />
          ) : (
            <div className="text-body-sm text-text-tertiary flex items-center justify-center h-full">
              좌측에서 직원을 선택하세요
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── 모바일 ──
  return (
    <div className="bg-surface-page flex flex-col h-full">

      {/* 모바일 헤더 */}
      <div className="bg-surface-raised border-b border-border-default h-12 flex items-center shrink-0">
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
      <div className="flex-1 overflow-y-auto p-4">
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
