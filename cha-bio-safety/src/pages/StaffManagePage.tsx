import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { staffApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import type { StaffFull, StaffUpdatePayload, Role } from '../types'
import { UserPlus } from 'lucide-react'

// ── BottomSheet ──────────────────────────────────────────
function BottomSheet({ onClose, title, children }: {
  onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0', animation: 'slideUp 0.28s ease-out both', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div className="w-[32px] h-[4px] rounded-full bg-border-strong" />
        </div>
        <div className="text-body font-bold text-text-primary" style={{ padding: '12px 16px 0' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

// ── Modal (Desktop) ─────────────────────────────────────
function DesktopModal({ onClose, title, children }: {
  onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--bg2)', borderRadius: 12, width: 440, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.18)' }}>
        <div className="text-body font-bold text-text-primary" style={{ padding: '20px 24px 0' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

// ── 스타일 상수 ─────────────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  height: 44, background: 'var(--bg3)', border: '1px solid var(--bd)',
  borderRadius: 8, padding: '0 12px', fontSize: 14, color: 'var(--t1)',
  width: '100%', boxSizing: 'border-box', outline: 'none',
}
const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, display: 'block',
}

// ── Staff Modal Content ─────────────────────────────────
interface StaffFormState {
  name: string; id: string; phone: string; email: string;
  appointedAt: string; birthDate: string; title: string; role: Role;
  shiftOffset: string; shiftFixed: string;
}
const EMPTY_STAFF_FORM: StaffFormState = {
  name: '', id: '', phone: '', email: '', appointedAt: '', birthDate: '', title: '', role: 'assistant',
  shiftOffset: '', shiftFixed: '',
}

// ── 교체 모달 ───────────────────────────────────────────
function ReplaceModalContent({ oldStaff, onClose }: { oldStaff: StaffFull; onClose: () => void }) {
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  // 활성 직원 중 교대 설정이 없는 직원만 후보 (oldStaff 제외)
  const { data: allStaff = [] } = useQuery({ queryKey: ['staff-list'], queryFn: staffApi.list })
  const candidates = allStaff.filter(s => s.active === 1 && s.id !== oldStaff.id && s.shiftOffset === null && s.shiftFixed === null)

  const shiftLabel = oldStaff.shiftFixed === 'day' ? '평일 주간 고정' :
    oldStaff.shiftOffset !== null ? `3교대 (오프셋 ${oldStaff.shiftOffset})` : '미설정'

  async function handleReplace() {
    if (!selectedId) return
    const newStaff = allStaff.find(s => s.id === selectedId)
    if (!newStaff) return
    setSubmitting(true)
    try {
      // 1. 신규 직원에 교대 설정 이전
      await staffApi.update(selectedId, {
        shiftOffset: oldStaff.shiftOffset,
        shiftFixed: oldStaff.shiftFixed,
      })
      // 2. 기존 직원 비활성화 + 개인정보 제거 + 교대 설정 제거
      await staffApi.update(oldStaff.id, { active: 0, phone: '', email: '', shiftOffset: null, shiftFixed: null })
      qc.invalidateQueries({ queryKey: ['staff-list'] })
      toast.success(`${oldStaff.name} → ${newStaff.name} 교체 완료`)
      onClose()
    } catch (e: any) {
      toast.error(e.message || '교체 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="replace-info-box" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'rgba(59,130,246,.08)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--t2)' }}>
        <strong>{oldStaff.name}</strong> ({oldStaff.title})의 근무 패턴을 이전합니다.<br/>
        근무 패턴: <strong>{shiftLabel}</strong><br/>
        <span className="text-caption text-text-tertiary">기존 점검 기록은 보존되며, 개인정보(연락처/이메일)는 삭제됩니다.</span>
      </div>

      <div>
        <label style={LABEL_STYLE}>교체할 직원 선택</label>
        {candidates.length === 0 ? (
          <div className="replace-no-candidates bg-surface-sunken text-caption text-text-tertiary" style={{ padding: '12px', borderRadius: 8 }}>
            교체 가능한 직원이 없습니다. 먼저 "직원 추가"로 신규 직원을 등록해주세요.
          </div>
        ) : (
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="replace-select" style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
            <option value="">선택하세요</option>
            {candidates.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.title}) — {s.id}</option>
            ))}
          </select>
        )}
      </div>

      <div className="btn-row" style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={onClose} className="btn-cancel bg-surface-active text-text-secondary text-body-sm font-bold" style={{ flex: 1, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer' }}>취소</button>
        <button onClick={handleReplace} disabled={!selectedId || submitting}
          className="btn-replace-confirm"
          style={{ flex: 1, height: 44, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, cursor: selectedId && !submitting ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, opacity: selectedId && !submitting ? 1 : 0.4 }}>
          {submitting ? '처리 중...' : '교체'}
        </button>
      </div>
    </div>
  )
}

function StaffModalContent({
  mode, staff, onClose,
}: { mode: 'add' | 'edit'; staff?: StaffFull; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<StaffFormState>(
    mode === 'edit' && staff
      ? { name: staff.name, id: staff.id, phone: staff.phone ?? '', email: staff.email ?? '', appointedAt: staff.appointedAt ?? '', birthDate: staff.birthDate ?? '', title: staff.title, role: staff.role, shiftOffset: staff.shiftOffset !== null ? String(staff.shiftOffset) : '', shiftFixed: staff.shiftFixed ?? '' }
      : EMPTY_STAFF_FORM
  )
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)

  const setField = (k: keyof StaffFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const createMutation = useMutation({
    mutationFn: () => staffApi.create({ id: form.id, name: form.name, role: form.role, title: form.title, phone: form.phone || undefined, email: form.email || undefined, appointedAt: form.appointedAt || undefined, birthDate: form.birthDate || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-list'] }); toast.success('직원이 추가되었습니다'); onClose() },
    onError: () => toast.error('저장에 실패했습니다. 입력값을 확인해 주세요'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: StaffUpdatePayload) => staffApi.update(staff!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-list'] }); toast.success('직원 정보가 수정되었습니다'); onClose() },
    onError: () => toast.error('저장에 실패했습니다. 입력값을 확인해 주세요'),
  })

  const resetPwMutation = useMutation({
    mutationFn: () => staffApi.resetPassword(staff!.id),
    onSuccess: () => { toast.success('비밀번호가 초기화되었습니다 (사번 뒷 4자리)'); setConfirmReset(false) },
    onError: () => toast.error('비밀번호 초기화에 실패했습니다'),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => staffApi.update(staff!.id, { active: 0 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff-list'] }); toast.success('직원이 비활성화되었습니다'); onClose() },
    onError: () => toast.error('비활성화에 실패했습니다'),
  })

  const canSave = form.name.trim() !== '' && form.id.trim() !== ''

  function handleSave() {
    if (!canSave) return
    if (!/^\d{10}$/.test(form.id)) { toast.error('사번은 10자리 숫자여야 합니다'); return }
    if (mode === 'add') {
      createMutation.mutate()
    } else {
      updateMutation.mutate({ name: form.name, role: form.role, title: form.title, phone: form.phone || undefined, email: form.email || undefined, appointedAt: form.appointedAt || undefined, birthDate: form.birthDate || null })
    }
  }

  const isBusy = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <div className="form-body" style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-field">
          <label style={LABEL_STYLE}>이름 <span className="form-required" style={{ color: 'var(--danger)' }}>*</span></label>
          <input className="form-input" style={INPUT_STYLE} value={form.name} onChange={setField('name')} placeholder="홍길동" />
        </div>
        <div className="form-field">
          <label style={LABEL_STYLE}>사번 <span className="form-required" style={{ color: 'var(--danger)' }}>*</span></label>
          <input className={`form-input mono${mode === 'edit' ? ' form-input mono disabled' : ''}`} style={{ ...INPUT_STYLE, fontFamily: 'JetBrains Mono, monospace', ...(mode === 'edit' ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }} value={form.id} onChange={setField('id')} placeholder="0000000000" inputMode="numeric" disabled={mode === 'edit'} />
        </div>
        <div className="form-field">
          <label style={LABEL_STYLE}>연락처</label>
          <input className="form-input" style={INPUT_STYLE} value={form.phone} onChange={setField('phone')} placeholder="010-0000-0000" type="tel" />
        </div>
        <div className="form-field">
          <label style={LABEL_STYLE}>이메일</label>
          <input className="form-input" style={INPUT_STYLE} value={form.email} onChange={setField('email')} placeholder="email@example.com" type="email" />
        </div>
        <div className="form-field">
          <label style={LABEL_STYLE}>입사일 <span className="form-sub-label text-caption text-text-tertiary">(사번 앞 8자리에서 자동)</span></label>
          <input
            className="form-input disabled"
            style={{ ...INPUT_STYLE, opacity: 0.5, cursor: 'not-allowed' }}
            value={(() => {
              const p = (form.id ?? '').slice(0, 8)
              return /^[0-9]{8}$/.test(p) ? `${p.slice(0,4)}-${p.slice(4,6)}-${p.slice(6,8)}` : ''
            })()}
            placeholder="사번 입력 시 자동 채워짐"
            readOnly
          />
        </div>
        <div className="form-field">
          <label style={LABEL_STYLE}>생년월일 <span className="form-sub-label text-caption text-text-tertiary">(휴가신청서 자동 채움)</span></label>
          <input className="form-input" style={INPUT_STYLE} value={form.birthDate} onChange={setField('birthDate')} type="date" />
        </div>
        <div className="form-field">
          <label style={LABEL_STYLE}>직책</label>
          <input className="form-input" style={INPUT_STYLE} value={form.title} onChange={setField('title')} placeholder="소방안전관리자" />
        </div>
        <div className="form-field">
          <label style={LABEL_STYLE}>역할</label>
          <div className="role-toggle" style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--bd)' }}>
            {(['admin', 'assistant'] as Role[]).map(r => (
              <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                className={`text-caption font-bold ${form.role === r ? 'bg-accent text-white' : 'bg-surface-active text-text-tertiary'}`}
                style={{ flex: 1, height: 40, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                {r === 'admin' ? '관리자' : '보조자'}
              </button>
            ))}
          </div>
        </div>

        {mode === 'edit' && (
          <div>
            {!confirmReset ? (
              <button className="confirm-reset-link" onClick={() => setConfirmReset(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--warn)', textDecoration: 'underline', padding: 0 }}>
                비밀번호 초기화
              </button>
            ) : (
              <div className="confirm-reset-box" style={{ background: 'rgba(245,158,11,.08)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--t2)' }}>
                <div className="confirm-reset-text" style={{ marginBottom: 8 }}>사번 뒷 4자리로 비밀번호를 초기화합니다. 계속하시겠습니까?</div>
                <div className="small-btn-row" style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setConfirmReset(false)} className="small-btn cancel" style={{ flex: 1, height: 32, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>취소</button>
                  <button onClick={() => resetPwMutation.mutate()} disabled={resetPwMutation.isPending}
                    className="small-btn confirm-init"
                    style={{ flex: 1, height: 32, background: 'var(--warn)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, opacity: resetPwMutation.isPending ? 0.6 : 1 }}>
                    초기화
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!confirmDeactivate ? (
        <div className="action-row" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="btn-row" style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} className="btn-cancel text-body-sm font-bold bg-surface-active text-text-secondary" style={{ flex: 1, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer' }}>취소</button>
            <button onClick={handleSave} disabled={!canSave || isBusy}
              className={`btn-save${!canSave || isBusy ? ' btn-save disabled' : ''} text-body-sm font-bold bg-accent text-white`}
              style={{ flex: 1, height: 44, border: 'none', borderRadius: 8, cursor: canSave && !isBusy ? 'pointer' : 'not-allowed', opacity: canSave && !isBusy ? 1 : 0.4 }}>
              저장
            </button>
          </div>
          {mode === 'edit' && staff?.active !== 0 && (
            <div className="btn-row" style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDeactivate(true)}
                className="btn-deactivate text-caption"
                style={{ flex: 1, height: 40, background: 'rgba(239,68,68,.08)', color: 'var(--danger)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                비활성화
              </button>
              <button onClick={() => { onClose(); setTimeout(() => (window as any).__openReplaceModal?.(staff), 100) }}
                className="btn-replace text-caption font-bold"
                style={{ flex: 1, height: 40, background: 'rgba(245,158,11,.1)', color: '#d97706', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                교체
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="confirm-deactivate-box" style={{ padding: 16 }}>
          <div style={{ background: 'rgba(239,68,68,.08)', borderRadius: 8, padding: '12px', fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
            이 직원을 비활성화합니다. 점검 기록은 보존됩니다.
          </div>
          <div className="btn-row" style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDeactivate(false)} className="btn-cancel text-body-sm bg-surface-active text-text-secondary" style={{ flex: 1, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer' }}>취소</button>
            <button onClick={() => deactivateMutation.mutate()} disabled={deactivateMutation.isPending}
              className="btn-deactivate-confirm text-body-sm font-bold bg-danger-bar text-white"
              style={{ flex: 1, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer', opacity: deactivateMutation.isPending ? 0.6 : 1 }}>
              비활성화
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Staff Card (Mobile) ─────────────────────────────────
function StaffCard({ staff, onEdit }: { staff: StaffFull; onEdit: () => void }) {
  return (
    <div className="staff-card" onClick={onEdit} style={{ background: 'var(--bg3)', borderRadius: 12, padding: '12px 16px', minHeight: 56, display: 'flex', alignItems: 'center', gap: 10, opacity: staff.active === 0 ? 0.45 : 1, cursor: 'pointer' }}>
      <div className="w-[8px] h-[8px] rounded-full" style={{ flexShrink: 0, background: staff.active !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span className="text-body font-bold text-text-primary">{staff.name}</span>
          {staff.title && <span className="text-caption text-text-secondary">{staff.title}</span>}
          <span className={`text-caption leading-none px-1.5 py-0.5 rounded`} style={{
            flexShrink: 0,
            background: staff.role === 'admin' ? 'rgba(59,130,246,.13)' : 'rgba(110,118,129,.15)',
            color: staff.role === 'admin' ? 'var(--acl)' : 'var(--t2)',
          }}>
            {staff.role === 'admin' ? 'admin' : 'assistant'}
          </span>
        </div>
        <span className="text-caption font-mono text-text-tertiary">{staff.id}</span>
      </div>
      <span className="text-caption leading-none text-accent font-bold card-action" style={{ flexShrink: 0 }}>수정 ▸</span>
    </div>
  )
}

// ── 스켈레톤 ─────────────────────────────────────────────
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)', borderRadius: 12, height: 64,
  animation: 'blink 2s ease-in-out infinite',
}

// 직급 정렬 순서: 대리 → 주임 → 기사 → 기타
function rankOfTitle(title: string | null | undefined): number {
  const t = title ?? ''
  if (t.includes('대리')) return 0
  if (t.includes('주임')) return 1
  if (t.includes('기사')) return 2
  return 3
}

// ── 메인 페이지 ──────────────────────────────────────────
export default function StaffManagePage() {
  const navigate = useNavigate()
  const { staff: me } = useAuthStore()
  const isDesktop = useIsDesktop()
  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: StaffFull }>({ open: false, mode: 'add' })
  const [replaceModal, setReplaceModal] = useState<{ open: boolean; target?: StaffFull }>({ open: false })

  // 교체 모달 열기 콜백 (StaffModalContent에서 호출)
  useEffect(() => {
    (window as any).__openReplaceModal = (staff: StaffFull) => setReplaceModal({ open: true, target: staff })
    return () => { delete (window as any).__openReplaceModal }
  }, [])

  // Role guard
  useEffect(() => {
    if (me?.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [me, navigate])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff-list'],
    queryFn: staffApi.list,
    staleTime: 30_000,
  })
  const staffList = (data ?? []).slice().sort((a, b) => {
    const r = rankOfTitle(a.title) - rankOfTitle(b.title)
    return r !== 0 ? r : a.id.localeCompare(b.id)
  })

  if (me?.role !== 'admin') return null

  const ModalWrapper = isDesktop ? DesktopModal : BottomSheet

  return (
    <div className="desktop-frame flex flex-col h-full overflow-hidden bg-surface-page">
      <style>{`
        @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        input:focus { border-color: var(--acl) !important; }
      `}</style>

      {/* 헤더 */}
      {isDesktop ? (
        <div className="desktop-header shrink-0 hidden lg:flex items-center h-14 px-5 border-b border-border-default">
          <span className="desktop-header-title flex-1 text-title font-semibold text-text-primary">
            직원 관리 <span className="desktop-header-count text-caption text-text-tertiary ml-2">{staffList.length}명</span>
          </span>
          <button onClick={() => setModal({ open: true, mode: 'add' })}
            className="desktop-add-btn flex items-center gap-2 h-7 px-3 rounded-sm bg-accent text-white text-label font-bold border-0 cursor-pointer">
            <UserPlus size={16} color="#fff" />
            직원 추가
          </button>
        </div>
      ) : (
        <div className="mobile-header flex lg:hidden items-center px-4 py-2" style={{ flexShrink: 0 }}>
          <span className="mobile-header-count flex-1 text-caption text-text-tertiary">{staffList.length}명</span>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading && (
          <div className="skeleton-wrap" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton-bar" style={SKELETON_STYLE} />
            <div className="skeleton-bar" style={SKELETON_STYLE} />
            <div className="skeleton-bar" style={SKELETON_STYLE} />
          </div>
        )}
        {isError && !isLoading && (
          <div className="state-error flex items-center justify-center h-full text-text-secondary text-body-sm" style={{ padding: '40px 16px' }}>
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
          </div>
        )}

        {/* 데스크톱: 테이블 */}
        {isDesktop && !isLoading && !isError && (
          <div className="desktop-content" style={{ padding: '0 24px 24px' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="border-b-2 border-border-default text-left table-wrap">
                  <th className="text-caption font-bold text-text-secondary" style={{ padding: '10px 8px' }}>이름</th>
                  <th className="text-caption font-bold text-text-secondary" style={{ padding: '10px 8px' }}>사번</th>
                  <th className="text-caption font-bold text-text-secondary" style={{ padding: '10px 8px' }}>직책</th>
                  <th className="text-caption font-bold text-text-secondary" style={{ padding: '10px 8px' }}>역할</th>
                  <th className="text-caption font-bold text-text-secondary" style={{ padding: '10px 8px' }}>연락처</th>
                  <th className="text-caption font-bold text-text-secondary" style={{ padding: '10px 8px' }}>상태</th>
                  <th className="text-caption font-bold text-text-secondary" style={{ padding: '10px 8px', width: 60 }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 && (
                  <tr><td colSpan={7} className="state-empty text-center text-body-sm text-text-tertiary" style={{ padding: '40px 16px' }}>등록된 직원이 없습니다</td></tr>
                )}
                {staffList.map(s => (
                  <tr key={s.id}
                    onClick={() => setModal({ open: true, mode: 'edit', target: s })}
                    className={s.active === 0 ? 'row-inactive' : ''}
                    style={{ borderBottom: '1px solid var(--bd)', cursor: 'pointer', opacity: s.active === 0 ? 0.5 : 1, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="name-cell text-text-primary" style={{ padding: '10px 8px', fontWeight: 600 }}>{s.name}</td>
                    <td className="id-cell text-caption font-mono text-text-secondary" style={{ padding: '10px 8px' }}>{s.id}</td>
                    <td className="title-cell text-text-secondary" style={{ padding: '10px 8px' }}>{s.title || '-'}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`role-badge ${s.role === 'admin' ? 'admin' : 'assistant'} text-caption leading-none px-1.5 py-0.5 rounded`} style={{
                        background: s.role === 'admin' ? 'rgba(59,130,246,.13)' : 'rgba(110,118,129,.15)',
                        color: s.role === 'admin' ? 'var(--acl)' : 'var(--t2)',
                      }}>
                        {s.role === 'admin' ? '관리자' : '보조자'}
                      </span>
                    </td>
                    <td className="phone-cell text-caption text-text-secondary" style={{ padding: '10px 8px' }}>{s.phone || '-'}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`status-cell ${s.active !== 0 ? 'status-active' : 'status-inactive'} text-caption leading-none inline-flex items-center gap-1`} style={{
                        color: s.active !== 0 ? 'var(--safe)' : 'var(--t3)',
                      }}>
                        <span className="status-dot w-[6px] h-[6px] rounded-full" style={{ background: s.active !== 0 ? 'var(--safe)' : 'var(--t3)' }} />
                        {s.active !== 0 ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="action-cell" style={{ padding: '10px 8px' }}>
                      <span className="text-caption font-bold text-accent">수정</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 모바일: 카드 리스트 */}
        {!isDesktop && !isLoading && !isError && (
          <div className="card-list" style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {staffList.length === 0 && (
              <div className="mobile-empty" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
                <div className="empty-title text-body font-bold text-text-primary">등록된 직원이 없습니다</div>
                <div className="empty-desc text-caption text-text-secondary" style={{ textAlign: 'center' }}>직원 추가 버튼을 눌러 첫 번째 직원을 등록하세요</div>
              </div>
            )}
            {staffList.map(s => (
              <StaffCard key={s.id} staff={s} onEdit={() => setModal({ open: true, mode: 'edit', target: s })} />
            ))}
          </div>
        )}
      </div>

      {/* 모바일 FAB */}
      {!isDesktop && (
        <div className="mobile-fab-wrap" style={{ position: 'sticky', bottom: 0, padding: '0 16px', paddingBottom: 'calc(16px + var(--sab))', background: 'var(--bg)' }}>
          <button onClick={() => setModal({ open: true, mode: 'add' })}
            className="mobile-fab w-full h-[52px] bg-accent text-white rounded-md flex items-center justify-center gap-2 text-body-sm font-bold"
            style={{ border: 'none', cursor: 'pointer' }}>
            <UserPlus size={18} color="#fff" />
            직원 추가
          </button>
        </div>
      )}

      {/* 모달 */}
      {modal.open && (
        <ModalWrapper onClose={() => setModal({ open: false, mode: 'add' })} title={modal.mode === 'add' ? '직원 추가' : '직원 수정'}>
          <StaffModalContent mode={modal.mode} staff={modal.target} onClose={() => setModal({ open: false, mode: 'add' })} />
        </ModalWrapper>
      )}

      {/* 교체 모달 */}
      {replaceModal.open && replaceModal.target && (
        <ModalWrapper onClose={() => setReplaceModal({ open: false })} title="직원 교체">
          <ReplaceModalContent oldStaff={replaceModal.target} onClose={() => setReplaceModal({ open: false })} />
        </ModalWrapper>
      )}
    </div>
  )
}
