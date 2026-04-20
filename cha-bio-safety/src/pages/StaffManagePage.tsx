import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { staffApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import type { StaffFull, StaffUpdatePayload, Role } from '../types'

// ── SVG ──────────────────────────────────────────────────
function IconUserPlus({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

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
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', padding: '12px 16px 0' }}>{title}</div>
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
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', padding: '20px 24px 0' }}>{title}</div>
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
  appointedAt: string; title: string; role: Role;
  shiftOffset: string; shiftFixed: string;
}
const EMPTY_STAFF_FORM: StaffFormState = {
  name: '', id: '', phone: '', email: '', appointedAt: '', title: '', role: 'assistant',
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
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'rgba(59,130,246,.08)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--t2)' }}>
        <strong>{oldStaff.name}</strong> ({oldStaff.title})의 근무 패턴을 이전합니다.<br/>
        근무 패턴: <strong>{shiftLabel}</strong><br/>
        <span style={{ fontSize: 11, color: 'var(--t3)' }}>기존 점검 기록은 보존되며, 개인정보(연락처/이메일)는 삭제됩니다.</span>
      </div>

      <div>
        <label style={LABEL_STYLE}>교체할 직원 선택</label>
        {candidates.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--t3)', padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
            교체 가능한 직원이 없습니다. 먼저 "직원 추가"로 신규 직원을 등록해주세요.
          </div>
        ) : (
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
            <option value="">선택하세요</option>
            {candidates.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.title}) — {s.id}</option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={onClose} style={{ flex: 1, height: 44, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>취소</button>
        <button onClick={handleReplace} disabled={!selectedId || submitting}
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
      ? { name: staff.name, id: staff.id, phone: staff.phone ?? '', email: staff.email ?? '', appointedAt: staff.appointedAt ?? '', title: staff.title, role: staff.role, shiftOffset: staff.shiftOffset !== null ? String(staff.shiftOffset) : '', shiftFixed: staff.shiftFixed ?? '' }
      : EMPTY_STAFF_FORM
  )
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)

  const setField = (k: keyof StaffFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const createMutation = useMutation({
    mutationFn: () => staffApi.create({ id: form.id, name: form.name, role: form.role, title: form.title, phone: form.phone || undefined, email: form.email || undefined, appointedAt: form.appointedAt || undefined }),
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
      updateMutation.mutate({ name: form.name, role: form.role, title: form.title, phone: form.phone || undefined, email: form.email || undefined, appointedAt: form.appointedAt || undefined })
    }
  }

  const isBusy = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>이름 <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input style={INPUT_STYLE} value={form.name} onChange={setField('name')} placeholder="홍길동" />
        </div>
        <div>
          <label style={LABEL_STYLE}>사번 <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input style={{ ...INPUT_STYLE, fontFamily: 'JetBrains Mono, monospace', ...(mode === 'edit' ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }} value={form.id} onChange={setField('id')} placeholder="0000000000" inputMode="numeric" disabled={mode === 'edit'} />
        </div>
        <div>
          <label style={LABEL_STYLE}>연락처</label>
          <input style={INPUT_STYLE} value={form.phone} onChange={setField('phone')} placeholder="010-0000-0000" type="tel" />
        </div>
        <div>
          <label style={LABEL_STYLE}>이메일</label>
          <input style={INPUT_STYLE} value={form.email} onChange={setField('email')} placeholder="email@example.com" type="email" />
        </div>
        <div>
          <label style={LABEL_STYLE}>선임일자</label>
          <input style={INPUT_STYLE} value={form.appointedAt} onChange={e => {
            const v = e.target.value.replace(/[^0-9]/g, '')
            if (v.length <= 4) setForm(f => ({ ...f, appointedAt: v }))
            else if (v.length <= 6) setForm(f => ({ ...f, appointedAt: v.slice(0,4) + '-' + v.slice(4) }))
            else setForm(f => ({ ...f, appointedAt: v.slice(0,4) + '-' + v.slice(4,6) + '-' + v.slice(6,8) }))
          }} placeholder="2024-01-15" inputMode="numeric" maxLength={10} />
        </div>
        <div>
          <label style={LABEL_STYLE}>직책</label>
          <input style={INPUT_STYLE} value={form.title} onChange={setField('title')} placeholder="소방안전관리자" />
        </div>
        <div>
          <label style={LABEL_STYLE}>역할</label>
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--bd)' }}>
            {(['admin', 'assistant'] as Role[]).map(r => (
              <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                style={{ flex: 1, height: 36, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s', background: form.role === r ? 'var(--acl)' : 'var(--bg4)', color: form.role === r ? '#fff' : 'var(--t3)' }}>
                {r === 'admin' ? '관리자' : '보조자'}
              </button>
            ))}
          </div>
        </div>

        {mode === 'edit' && (
          <div>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--warn)', textDecoration: 'underline', padding: 0 }}>
                비밀번호 초기화
              </button>
            ) : (
              <div style={{ background: 'rgba(245,158,11,.08)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--t2)' }}>
                <div style={{ marginBottom: 8 }}>사번 뒷 4자리로 비밀번호를 초기화합니다. 계속하시겠습니까?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setConfirmReset(false)} style={{ flex: 1, height: 32, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>취소</button>
                  <button onClick={() => resetPwMutation.mutate()} disabled={resetPwMutation.isPending}
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
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, height: 44, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>취소</button>
            <button onClick={handleSave} disabled={!canSave || isBusy}
              style={{ flex: 1, height: 44, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 8, cursor: canSave && !isBusy ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, opacity: canSave && !isBusy ? 1 : 0.4 }}>
              저장
            </button>
          </div>
          {mode === 'edit' && staff?.active !== 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDeactivate(true)}
                style={{ flex: 1, height: 40, background: 'rgba(239,68,68,.08)', color: 'var(--danger)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
                비활성화
              </button>
              <button onClick={() => { onClose(); setTimeout(() => (window as any).__openReplaceModal?.(staff), 100) }}
                style={{ flex: 1, height: 40, background: 'rgba(245,158,11,.1)', color: '#d97706', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                교체
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          <div style={{ background: 'rgba(239,68,68,.08)', borderRadius: 8, padding: '12px', fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
            이 직원을 비활성화합니다. 점검 기록은 보존됩니다.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDeactivate(false)} style={{ flex: 1, height: 44, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>취소</button>
            <button onClick={() => deactivateMutation.mutate()} disabled={deactivateMutation.isPending}
              style={{ flex: 1, height: 44, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, opacity: deactivateMutation.isPending ? 0.6 : 1 }}>
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
    <div onClick={onEdit} style={{ background: 'var(--bg3)', borderRadius: 12, padding: '12px 16px', minHeight: 56, display: 'flex', alignItems: 'center', gap: 10, opacity: staff.active === 0 ? 0.5 : 1, cursor: 'pointer' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: staff.active !== 0 ? 'var(--safe)' : 'var(--t3)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{staff.name}</span>
          {staff.title && <span style={{ fontSize: 12, color: 'var(--t2)' }}>{staff.title}</span>}
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, flexShrink: 0,
            background: staff.role === 'admin' ? 'rgba(59,130,246,.13)' : 'rgba(110,118,129,.15)',
            color: staff.role === 'admin' ? 'var(--acl)' : 'var(--t2)',
          }}>
            {staff.role === 'admin' ? 'admin' : 'assistant'}
          </span>
        </div>
        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--t3)' }}>{staff.id}</span>
      </div>
      <span style={{ color: 'var(--acl)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>수정 ▸</span>
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
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        input:focus { border-color: var(--acl) !important; }
      `}</style>

      {/* 헤더 */}
      {isDesktop ? (
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
            직원 관리 <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--t3)', marginLeft: 8 }}>{staffList.length}명</span>
          </span>
          <button onClick={() => setModal({ open: true, mode: 'add' })}
            style={{ height: 36, padding: '0 16px', background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconUserPlus size={16} color="#fff" />
            직원 추가
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', flexShrink: 0 }}>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--t3)' }}>{staffList.length}명</span>
        </div>
      )}

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {isLoading && (
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </div>
        )}
        {isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14 }}>
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
          </div>
        )}

        {/* 데스크톱: 테이블 */}
        {isDesktop && !isLoading && !isError && (
          <div style={{ padding: '0 24px 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--bd)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: 12 }}>이름</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: 12 }}>사번</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: 12 }}>직책</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: 12 }}>역할</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: 12 }}>연락처</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: 12 }}>상태</th>
                  <th style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: 12, width: 60 }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t3)', fontSize: 14 }}>등록된 직원이 없습니다</td></tr>
                )}
                {staffList.map(s => (
                  <tr key={s.id}
                    onClick={() => setModal({ open: true, mode: 'edit', target: s })}
                    style={{ borderBottom: '1px solid var(--bd)', cursor: 'pointer', opacity: s.active === 0 ? 0.5 : 1, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--t1)' }}>{s.name}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--t2)', fontSize: 12 }}>{s.id}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--t2)' }}>{s.title || '-'}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: s.role === 'admin' ? 'rgba(59,130,246,.13)' : 'rgba(110,118,129,.15)',
                        color: s.role === 'admin' ? 'var(--acl)' : 'var(--t2)',
                      }}>
                        {s.role === 'admin' ? '관리자' : '보조자'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--t2)', fontSize: 12 }}>{s.phone || '-'}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                        color: s.active !== 0 ? 'var(--safe)' : 'var(--t3)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.active !== 0 ? 'var(--safe)' : 'var(--t3)' }} />
                        {s.active !== 0 ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ color: 'var(--acl)', fontSize: 12, fontWeight: 700 }}>수정</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 모바일: 카드 리스트 */}
        {!isDesktop && !isLoading && !isError && (
          <div style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {staffList.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>등록된 직원이 없습니다</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>직원 추가 버튼을 눌러 첫 번째 직원을 등록하세요</div>
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
        <div style={{ position: 'sticky', bottom: 0, padding: '0 16px', paddingBottom: 'calc(16px + var(--sab))', background: 'var(--bg)' }}>
          <button onClick={() => setModal({ open: true, mode: 'add' })}
            style={{ width: '100%', height: 52, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <IconUserPlus size={18} color="#fff" />
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
