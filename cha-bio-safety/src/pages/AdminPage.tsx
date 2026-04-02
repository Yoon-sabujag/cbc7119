import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// ── 인라인 SVG 아이콘 ────────────────────────────────────
function IconChevronLeft({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
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
function IconPlus({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconLock({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
function IconChevronDown({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
import { useAuthStore } from '../stores/authStore'
import { staffApi, checkPointApi } from '../utils/api'
import type { StaffFull, CheckPointFull, Role, BuildingZone } from '../types'

// ── 상수 ────────────────────────────────────────────────────
const CATEGORIES = [
  '소화기', '옥내소화전', '스프링클러', '유수검지장치',
  '청정소화약제', '소방펌프', '자탐', '제연설비',
  '방화셔터', '비상콘센트', '비상방송', '피난방화', '승강기',
]
const ZONE_LABEL: Record<BuildingZone, string> = {
  office: '사무동', research: '연구동', common: '공용',
}
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)', borderRadius: 12, height: 64,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 입력 필드 공통 스타일 ─────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  height: 44, background: 'var(--bg3)', border: '1px solid var(--bd)',
  borderRadius: 8, padding: '0 12px', fontSize: 14, color: 'var(--t1)',
  width: '100%', boxSizing: 'border-box', outline: 'none',
}
const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, display: 'block',
}

// ── 바텀시트 공통 래퍼 ───────────────────────────────────
function BottomSheet({ onClose, title, children }: {
  onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0', animation: 'slideUp 0.28s ease-out both', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* 드래그 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
        </div>
        {/* 타이틀 */}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', padding: '12px 16px 0' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

// ── Staff 모달 ───────────────────────────────────────────
interface StaffFormState {
  name: string; id: string; phone: string; email: string;
  appointedAt: string; title: string; role: Role;
}
const EMPTY_STAFF_FORM: StaffFormState = {
  name: '', id: '', phone: '', email: '', appointedAt: '', title: '', role: 'assistant',
}

function StaffModal({
  mode, staff, onClose,
}: { mode: 'add' | 'edit'; staff?: StaffFull; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<StaffFormState>(
    mode === 'edit' && staff
      ? { name: staff.name, id: staff.id, phone: staff.phone ?? '', email: staff.email ?? '', appointedAt: staff.appointedAt ?? '', title: staff.title, role: staff.role }
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
    mutationFn: (data: import('../types').StaffUpdatePayload) => staffApi.update(staff!.id, data),
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
    <BottomSheet onClose={onClose} title={mode === 'add' ? '직원 추가' : '직원 수정'}>
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 이름 */}
        <div>
          <label style={LABEL_STYLE}>이름 <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input style={INPUT_STYLE} value={form.name} onChange={setField('name')} placeholder="홍길동" />
        </div>
        {/* 사번 */}
        <div>
          <label style={LABEL_STYLE}>사번 <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input style={{ ...INPUT_STYLE, fontFamily: 'JetBrains Mono, monospace', ...(mode === 'edit' ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }} value={form.id} onChange={setField('id')} placeholder="0000000000" inputMode="numeric" disabled={mode === 'edit'} />
        </div>
        {/* 연락처 */}
        <div>
          <label style={LABEL_STYLE}>연락처</label>
          <input style={INPUT_STYLE} value={form.phone} onChange={setField('phone')} placeholder="010-0000-0000" type="tel" />
        </div>
        {/* 이메일 */}
        <div>
          <label style={LABEL_STYLE}>이메일</label>
          <input style={INPUT_STYLE} value={form.email} onChange={setField('email')} placeholder="email@example.com" type="email" />
        </div>
        {/* 선임일자 */}
        <div>
          <label style={LABEL_STYLE}>선임일자</label>
          <input style={INPUT_STYLE} value={form.appointedAt} onChange={e => {
            const v = e.target.value.replace(/[^0-9]/g, '')
            if (v.length <= 4) setForm(f => ({ ...f, appointedAt: v }))
            else if (v.length <= 6) setForm(f => ({ ...f, appointedAt: v.slice(0,4) + '-' + v.slice(4) }))
            else setForm(f => ({ ...f, appointedAt: v.slice(0,4) + '-' + v.slice(4,6) + '-' + v.slice(6,8) }))
          }} placeholder="2024-01-15" inputMode="numeric" maxLength={10} />
        </div>
        {/* 직책 */}
        <div>
          <label style={LABEL_STYLE}>직책</label>
          <input style={INPUT_STYLE} value={form.title} onChange={setField('title')} placeholder="소방안전관리자" />
        </div>
        {/* 역할 */}
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

        {/* 비밀번호 초기화 (edit only) */}
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

      {/* 저장/취소 버튼 */}
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
            <button onClick={() => setConfirmDeactivate(true)}
              style={{ width: '100%', height: 40, background: 'rgba(239,68,68,.08)', color: 'var(--danger)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
              비활성화
            </button>
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
    </BottomSheet>
  )
}

// ── CheckPoint 모달 ──────────────────────────────────────
interface CpFormState {
  location: string; category: string; zone: BuildingZone; floor: string;
  description: string; locationNo: string;
}
const EMPTY_CP_FORM: CpFormState = {
  location: '', category: '', zone: 'common', floor: '', description: '', locationNo: '',
}

function CheckPointModal({
  mode, cp, onClose,
}: { mode: 'add' | 'edit'; cp?: CheckPointFull; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<CpFormState>(
    mode === 'edit' && cp
      ? { location: cp.location, category: cp.category, zone: cp.zone, floor: cp.floor, description: cp.description ?? '', locationNo: cp.locationNo ?? '' }
      : EMPTY_CP_FORM
  )
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)

  const setField = (k: keyof CpFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const createMutation = useMutation({
    mutationFn: () => {
      const id = `cp_${Date.now()}`
      const qrCode = `QR-${id}`
      return checkPointApi.create({ id, qrCode, floor: form.floor, zone: form.zone, location: form.location, category: form.category, description: form.description || undefined, locationNo: form.locationNo || undefined })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['check-points'] }); toast.success('개소가 추가되었습니다'); onClose() },
    onError: () => toast.error('저장에 실패했습니다. 입력값을 확인해 주세요'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: import('../types').CheckPointUpdatePayload) => checkPointApi.update(cp!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['check-points'] }); toast.success('개소 정보가 수정되었습니다'); onClose() },
    onError: () => toast.error('저장에 실패했습니다. 입력값을 확인해 주세요'),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => checkPointApi.update(cp!.id, { isActive: 0 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['check-points'] }); toast.success('개소가 비활성화되었습니다'); onClose() },
    onError: () => toast.error('비활성화에 실패했습니다'),
  })

  const canSave = form.location.trim() !== '' && form.category !== ''
  const isBusy = createMutation.isPending || updateMutation.isPending

  function handleSave() {
    if (!canSave) return
    if (mode === 'add') {
      createMutation.mutate()
    } else {
      updateMutation.mutate({ location: form.location, category: form.category, zone: form.zone, floor: form.floor, description: form.description || undefined, locationNo: form.locationNo || undefined })
    }
  }

  return (
    <BottomSheet onClose={onClose} title={mode === 'add' ? '개소 추가' : '개소 수정'}>
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 개소명 */}
        <div>
          <label style={LABEL_STYLE}>개소명 <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input style={INPUT_STYLE} value={form.location} onChange={setField('location')} placeholder="1층 로비 소화기" />
        </div>
        {/* 카테고리 */}
        <div>
          <label style={LABEL_STYLE}>카테고리 <span style={{ color: 'var(--danger)' }}>*</span></label>
          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.category} onChange={setField('category')}>
            <option value="">카테고리 선택</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* 구역 */}
        <div>
          <label style={LABEL_STYLE}>구역</label>
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--bd)' }}>
            {(['office', 'research', 'common'] as BuildingZone[]).map(z => (
              <button key={z} onClick={() => setForm(f => ({ ...f, zone: z }))}
                style={{ flex: 1, height: 36, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all 0.15s', background: form.zone === z ? 'var(--acl)' : 'var(--bg4)', color: form.zone === z ? '#fff' : 'var(--t3)' }}>
                {ZONE_LABEL[z]}
              </button>
            ))}
          </div>
        </div>
        {/* 층 */}
        <div>
          <label style={LABEL_STYLE}>층</label>
          <input style={INPUT_STYLE} value={form.floor} onChange={setField('floor')} placeholder="1F" />
        </div>
        {/* 위치번호 */}
        <div>
          <label style={LABEL_STYLE}>위치번호</label>
          <input style={INPUT_STYLE} value={form.locationNo} onChange={setField('locationNo')} placeholder="001" />
        </div>
        {/* 설명 */}
        <div>
          <label style={LABEL_STYLE}>설명</label>
          <input style={INPUT_STYLE} value={form.description} onChange={setField('description')} placeholder="메모 (선택)" />
        </div>
      </div>

      {/* 버튼 */}
      {!confirmDeactivate ? (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, height: 44, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>취소</button>
            <button onClick={handleSave} disabled={!canSave || isBusy}
              style={{ flex: 1, height: 44, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 8, cursor: canSave && !isBusy ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, opacity: canSave && !isBusy ? 1 : 0.4 }}>
              저장
            </button>
          </div>
          {mode === 'edit' && cp?.isActive !== 0 && (
            <button onClick={() => setConfirmDeactivate(true)}
              style={{ width: '100%', height: 40, background: 'rgba(239,68,68,.08)', color: 'var(--danger)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
              비활성화
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: 16 }}>
          <div style={{ background: 'rgba(239,68,68,.08)', borderRadius: 8, padding: '12px', fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
            이 개소를 비활성화합니다. 기존 점검 기록은 보존됩니다.
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
    </BottomSheet>
  )
}

// ── 메인 페이지 ──────────────────────────────────────────
type AdminTab = 'staff' | 'checkpoints'

export default function AdminPage() {
  const navigate = useNavigate()
  const { staff } = useAuthStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('staff')

  // 직원관리 상태
  const [staffModal, setStaffModal] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: StaffFull }>({ open: false, mode: 'add' })

  // 개소관리 상태
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cpModal, setCpModal] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: CheckPointFull }>({ open: false, mode: 'add' })

  // Role Guard
  useEffect(() => {
    if (staff?.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [staff, navigate])

  if (staff?.role !== 'admin') return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        input:focus { border-color: var(--acl) !important; }
        select:focus { border-color: var(--acl) !important; outline: none; }
      `}</style>

      {/* ── 셀프 헤더 ─────────────────────────────────── */}
      <div style={{ height: 48, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)', flexShrink: 0 }}>
          <IconChevronLeft size={20} color="var(--t2)" />
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>관리자 설정</span>
        <div style={{ width: 44 }} />
      </div>

      {/* ── 탭 바 ────────────────────────────────────── */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', display: 'flex', flexShrink: 0 }}>
        {([
          { key: 'staff' as AdminTab, label: '직원 관리' },
          { key: 'checkpoints' as AdminTab, label: '개소 관리' },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, height: 44, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
              background: activeTab === tab.key ? 'var(--bg4)' : 'transparent',
              color: activeTab === tab.key ? 'var(--t1)' : 'var(--t3)',
              borderBottom: activeTab === tab.key ? '2px solid var(--acl)' : '2px solid transparent',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 탭 콘텐츠 ────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {activeTab === 'staff' ? (
          <StaffTabContent
            onAdd={() => setStaffModal({ open: true, mode: 'add' })}
            onEdit={s => setStaffModal({ open: true, mode: 'edit', target: s })}
          />
        ) : (
          <CheckPointTabContent
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAdd={() => setCpModal({ open: true, mode: 'add' })}
            onEdit={cp => setCpModal({ open: true, mode: 'edit', target: cp })}
          />
        )}
      </div>

      {/* ── 모달 ─────────────────────────────────────── */}
      {staffModal.open && (
        <StaffModal
          mode={staffModal.mode}
          staff={staffModal.target}
          onClose={() => setStaffModal({ open: false, mode: 'add' })}
        />
      )}
      {cpModal.open && (
        <CheckPointModal
          mode={cpModal.mode}
          cp={cpModal.target}
          onClose={() => setCpModal({ open: false, mode: 'add' })}
        />
      )}
    </div>
  )
}

// ── 직원 탭 콘텐츠 ──────────────────────────────────────
function StaffTabContent({ onAdd, onEdit }: { onAdd: () => void; onEdit: (s: StaffFull) => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['staff-list'],
    queryFn: staffApi.list,
    staleTime: 30_000,
  })
  const staffList = data ?? []

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 목록 */}
      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80 }}>
        {isLoading && (
          <>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </>
        )}
        {isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14 }}>
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
          </div>
        )}
        {!isLoading && !isError && staffList.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>등록된 직원이 없습니다</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>직원 추가 버튼을 눌러 첫 번째 직원을 등록하세요</div>
          </div>
        )}
        {!isLoading && !isError && staffList.map(s => (
          <StaffCard key={s.id} staff={s} onEdit={() => onEdit(s)} />
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: 'sticky', bottom: 0, padding: '0 16px', paddingBottom: 'calc(16px + var(--sab))', background: 'var(--bg)' }}>
        <button onClick={onAdd}
          style={{ width: '100%', height: 52, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <IconUserPlus size={18} color="#fff" />
          직원 추가
        </button>
      </div>
    </div>
  )
}

function StaffCard({ staff, onEdit }: { staff: StaffFull; onEdit: () => void }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '12px 16px', minHeight: 56, display: 'flex', alignItems: 'center', gap: 10, opacity: staff.active === 0 ? 0.5 : 1 }}>
      {/* 활성 도트 */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: staff.active !== 0 ? 'var(--safe)' : 'var(--t3)' }} />

      {/* 이름/사번/직책 */}
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

      {/* 수정 버튼 */}
      <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--acl)', cursor: 'pointer', fontSize: 12, fontWeight: 700, flexShrink: 0, padding: '4px 8px' }}>
        수정 ▸
      </button>
    </div>
  )
}

// ── 개소 탭 콘텐츠 ──────────────────────────────────────
function CheckPointTabContent({
  selectedCategory, onCategoryChange, onAdd, onEdit,
}: {
  selectedCategory: string; onCategoryChange: (c: string) => void;
  onAdd: () => void; onEdit: (cp: CheckPointFull) => void;
}) {
  const { data: categories = [] } = useQuery({
    queryKey: ['check-point-categories'],
    queryFn: checkPointApi.categories,
    staleTime: 60_000,
  })

  const { data: checkPoints, isLoading, isError } = useQuery({
    queryKey: ['check-points', selectedCategory],
    queryFn: () => checkPointApi.list(selectedCategory || undefined),
    enabled: selectedCategory !== '',
    staleTime: 30_000,
  })

  const cpList = checkPoints ?? []

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
      {/* 카테고리 드롭다운 */}
      <div style={{ padding: 16, flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value)}
            style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }}
          >
            <option value="">전체 (카테고리 선택)</option>
            {(categories.length > 0 ? categories : CATEGORIES).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--t2)' }}>
            <IconChevronDown size={16} color="var(--t2)" />
          </div>
        </div>
      </div>

      {/* 카테고리 조회 전용 섹션 */}
      <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <IconLock size={12} color="var(--t3)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)' }}>카테고리 (조회 전용)</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(categories.length > 0 ? categories : CATEGORIES).map(c => (
            <span key={c} style={{ background: 'var(--bg4)', borderRadius: 16, padding: '4px 10px', fontSize: 12, color: 'var(--t2)' }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 개소 목록 */}
      <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80, overflowY: 'auto' }}>
        {selectedCategory === '' && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t3)', fontSize: 14 }}>
            카테고리를 선택하면 개소 목록이 표시됩니다
          </div>
        )}
        {selectedCategory !== '' && isLoading && (
          <>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </>
        )}
        {selectedCategory !== '' && isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14 }}>
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
          </div>
        )}
        {selectedCategory !== '' && !isLoading && !isError && cpList.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>해당 카테고리에 개소가 없습니다</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>개소 추가 버튼을 눌러 점검 개소를 등록하세요</div>
          </div>
        )}
        {!isLoading && !isError && cpList.map(cp => (
          <CheckPointCard key={cp.id} cp={cp} onEdit={() => onEdit(cp)} />
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: 'sticky', bottom: 0, padding: '0 16px', paddingBottom: 'calc(16px + var(--sab))', background: 'var(--bg)' }}>
        <button onClick={onAdd}
          style={{ width: '100%', height: 52, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <IconPlus size={18} color="#fff" />
          개소 추가
        </button>
      </div>
    </div>
  )
}

function CheckPointCard({ cp, onEdit }: { cp: CheckPointFull; onEdit: () => void }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '12px 16px', minHeight: 48, display: 'flex', alignItems: 'center', gap: 10, opacity: cp.isActive === 0 ? 0.45 : 1 }}>
      {/* 활성 도트 */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: cp.isActive !== 0 ? 'var(--safe)' : 'var(--t3)' }} />

      {/* 개소명 / 구역·층 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.location}</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, background: 'rgba(59,130,246,.13)', color: 'var(--acl)', flexShrink: 0 }}>
            {cp.category}
          </span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--t2)' }}>
          {ZONE_LABEL[cp.zone] ?? cp.zone} · {cp.floor}
        </span>
      </div>

      {/* 수정 버튼 */}
      <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--acl)', cursor: 'pointer', fontSize: 12, fontWeight: 700, flexShrink: 0, padding: '4px 8px' }}>
        수정 ▸
      </button>
    </div>
  )
}
