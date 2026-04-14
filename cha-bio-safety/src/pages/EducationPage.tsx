import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addMonths, addYears, differenceInCalendarDays, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { educationApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'
import { useIsDesktop } from '../hooks/useIsDesktop'
import type { EducationRecord, StaffEducation } from '../types'

// ── 인라인 SVG 아이콘 ─────────────────────────────────────────
function IconChevronLeft({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

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

// ── 스켈레톤 ──────────────────────────────────────────────────
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

// ── D-day 배지 ────────────────────────────────────────────────
function DdayBadge({ dday }: { dday: number }) {
  let bg: string
  let color: string
  let label: string

  if (dday > 30) {
    bg = 'rgba(34,197,94,0.12)'
    color = 'var(--safe)'
    label = `D-${dday}`
  } else if (dday >= 0) {
    bg = 'rgba(245,158,11,0.15)'
    color = 'var(--warn)'
    label = `D-${dday}`
  } else {
    bg = 'rgba(239,68,68,0.15)'
    color = 'var(--danger)'
    label = `D+${Math.abs(dday)} 초과`
  }

  return (
    <div style={{
      background: bg,
      color,
      fontSize: 12,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 8,
      flexShrink: 0,
    }}>
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
      style={{
        background: 'var(--bg2)',
        borderRadius: 12,
        padding: 16,
        border: selected ? '1.5px solid var(--acl)' : '1px solid var(--bd)',
        cursor: canEdit ? 'pointer' : 'default',
        minHeight: 80,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* 상단 행: 아바타 + 이름/직책 + 배지 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* 아바타 */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--bg3)',
          color: 'var(--t2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {staff.name.charAt(0)}
        </div>

        {/* 이름 + 직책 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.3 }}>
            {staff.name}
          </div>
          <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--t2)', marginTop: 2 }}>
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
          <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--t3)', marginBottom: 2 }}>
            마지막 이수: {fmtDate(lastRecord.completedAt)} ({lastRecord.educationType === 'initial' ? '실무' : '보수'})
          </div>
        ) : null}

        {staff.appointedAt === null ? (
          <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--t3)' }}>
            선임일 미등록
          </div>
        ) : deadline ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--t2)' }}>
              다음 마감: {dateToYmd(deadline)}
            </span>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--t3)' }}>
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

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg3)', borderRadius: 9,
    padding: '10px 12px', border: '1px solid var(--bd2)', color: 'var(--t1)',
    fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
    minWidth: 0, WebkitAppearance: 'none', appearance: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 프로필 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: 'var(--bg3)',
          color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, flexShrink: 0,
        }}>
          {staff.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{staff.name}</div>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 2 }}>{staff.title}</div>
        </div>
        {dday !== null && <DdayBadge dday={dday} />}
      </div>

      {/* 마감 정보 */}
      {staff.appointedAt && deadline && (
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--t3)', marginBottom: 4 }}>다음 마감</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>
            {dateToYmd(deadline)} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--t3)' }}>({label})</span>
          </div>
        </div>
      )}

      {/* 이수 이력 */}
      {sorted.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 8 }}>이수 이력</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sorted.map(rec => (
              <div key={rec.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px',
              }}>
                <span style={{ fontSize: 13, color: 'var(--t2)' }}>
                  {fmtDate(rec.completedAt)} ({rec.educationType === 'initial' ? '실무' : '보수'})
                </span>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => editingRecord?.id === rec.id ? handleCancelEdit() : handleStartEdit(rec)}
                      style={{
                        background: editingRecord?.id === rec.id ? 'var(--bg4)' : 'var(--bg2)',
                        border: '1px solid var(--bd2)', borderRadius: 6,
                        padding: '4px 10px', fontSize: 12, color: 'var(--t2)', cursor: 'pointer',
                      }}
                    >
                      {editingRecord?.id === rec.id ? '취소' : '수정'}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(rec.id)}
                      disabled={isSubmitting}
                      style={{
                        background: 'var(--bg2)', border: '1px solid var(--bd2)', borderRadius: 6,
                        padding: '4px 10px', fontSize: 12, color: 'var(--t3)',
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
        <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 10 }}>
            {isEditMode ? '이수일 수정' : '이수 기록 등록'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }}>이수일</div>
              <input type="date" value={completedAt} onChange={e => setCompletedAt(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }}>교육 유형</div>
              <select
                value={educationType}
                onChange={e => setEducationType(e.target.value as 'initial' | 'refresher')}
                disabled={!hasRecords && !isEditMode}
                style={{
                  ...inputStyle,
                  color: (!hasRecords && !isEditMode) ? 'var(--t3)' : 'var(--t1)',
                  cursor: (!hasRecords && !isEditMode) ? 'default' : 'pointer',
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
              style={{
                width: '100%', height: 44, background: 'var(--acl)', borderRadius: 10,
                border: 'none', color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: isSubmitting ? 'default' : 'pointer', opacity: isSubmitting ? 0.6 : 1,
                marginTop: 4,
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
        style={{
          background: 'var(--bg2)', borderRadius: '16px 16px 0 0',
          animation: 'slideUp 0.28s ease-out both', maxHeight: '90vh',
          overflowY: 'auto', padding: '16px 16px 32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
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
    color: 'var(--t2)',
    marginBottom: 8,
    marginTop: 4,
  }

  function renderGroupedList() {
    if (isLoading) return (
      <>
        <div style={SKELETON_STYLE} />
        <div style={SKELETON_STYLE} />
        <div style={SKELETON_STYLE} />
        <div style={SKELETON_STYLE} />
      </>
    )
    if (isError) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', fontSize: 14, color: 'var(--danger)', padding: 24 }}>
        교육 현황을 불러오지 못했습니다. 화면을 당겨서 새로고침하세요.
      </div>
    )
    if (!data || data.length === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: 24, gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t2)' }}>교육 이력 없음</div>
        <div style={{ fontSize: 14, color: 'var(--t3)' }}>이수일을 기록하면 다음 교육 마감일이 자동으로 계산됩니다.</div>
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
      <div style={{ display: 'flex', height: '100%', background: 'var(--bg)' }}>
        {/* 좌측: 카드 목록 */}
        <div style={{
          flex: 1, borderRight: '1px solid var(--bd)',
          display: 'flex', flexDirection: 'column', height: '100%',
        }}>
          <div style={{ padding: '24px 24px 16px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>보수교육</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
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
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: 'var(--t3)', fontSize: 14,
            }}>
              좌측에서 직원을 선택하세요
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── 모바일 ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>

      {/* 모바일 헤더 */}
      <div style={{
        height: 48,
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 44, height: 44,
            background: 'none', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--t2)',
          }}
        >
          <IconChevronLeft size={20} color="var(--t2)" />
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
          보수교육
        </span>
        <div style={{ width: 44 }} />
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
