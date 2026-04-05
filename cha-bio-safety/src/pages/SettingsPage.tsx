import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../utils/api'

// ── 토글 컴포넌트 ────────────────────────────────────────
function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn(v => !v)}
      style={{
        width: 38, height: 21, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: on ? '#2563eb' : 'var(--bg4)',
        position: 'relative', transition: 'background 0.18s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: 2, width: 17, height: 17, borderRadius: '50%',
        background: '#fff', transition: 'transform 0.18s',
        transform: on ? 'translateX(17px)' : 'translateX(0)',
        display: 'block',
      }} />
    </button>
  )
}

// ── Row 컴포넌트 ─────────────────────────────────────────
function Row({ label, sub, children, onClick }: { label: string; sub?: string; children?: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', background: 'var(--bg3)', borderRadius: 9, marginBottom: 5,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

// ── 비밀번호 변경 폼 ──────────────────────────────────────
function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: current, newPassword: next }),
    onSuccess: () => { toast.success('비밀번호가 변경되었습니다'); onDone() },
    onError: (e: any) => toast.error(e?.message || '비밀번호 변경에 실패했습니다'),
  })

  const canSave = current.trim() !== '' && next.trim() !== '' && next === confirm && next.length >= 4

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          type="password" placeholder="현재 비밀번호" value={current}
          onChange={e => setCurrent(e.target.value)}
          style={{ height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        />
        <input
          type="password" placeholder="새 비밀번호 (4자 이상)" value={next}
          onChange={e => setNext(e.target.value)}
          style={{ height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        />
        <input
          type="password" placeholder="새 비밀번호 확인" value={confirm}
          onChange={e => setConfirm(e.target.value)}
          style={{ height: 40, background: 'var(--bg3)', border: `1px solid ${confirm && next !== confirm ? 'var(--danger)' : 'var(--bd)'}`, borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        />
        {confirm && next !== confirm && (
          <div style={{ fontSize: 11, color: 'var(--danger)' }}>비밀번호가 일치하지 않습니다</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onDone}
            style={{ flex: 1, height: 36, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
          >취소</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSave || mutation.isPending}
            style={{ flex: 1, height: 36, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 8, cursor: canSave && !mutation.isPending ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, opacity: canSave && !mutation.isPending ? 1 : 0.4 }}
          >변경</button>
        </div>
      </div>
    </div>
  )
}

// ── 이름 변경 모달 ────────────────────────────────────────
function NameEditModal({ currentName, onClose, onSave }: { currentName: string; onClose: () => void; onSave: (name: string) => void }) {
  const [editName, setEditName] = useState(currentName)

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({ name: editName.trim() }),
    onSuccess: (data) => { onSave(data.name); onClose() },
    onError: (e: any) => toast.error(e?.message || '이름 변경에 실패했습니다'),
  })

  const canSave = editName.trim() !== '' && editName.trim() !== currentName && editName.trim().length <= 20

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div style={{ background: 'var(--bg2)', borderRadius: 14, padding: '20px 18px', width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>이름 변경</div>
        <input
          type="text"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          maxLength={20}
          placeholder="이름 입력 (최대 20자)"
          style={{ height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 12 }}
          autoFocus
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 36, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
          >취소</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSave || mutation.isPending}
            style={{ flex: 1, height: 36, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 8, cursor: canSave && !mutation.isPending ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, opacity: canSave && !mutation.isPending ? 1 : 0.4 }}
          >저장</button>
        </div>
      </div>
    </div>
  )
}

// ── 섹션 헤더 ─────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, paddingLeft: 2 }}>
      {label}
    </div>
  )
}

// ── SettingsPage ─────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate()
  const { staff, logout, updateStaff } = useAuthStore()
  const [showPwChange, setShowPwChange] = useState(false)
  const [showNameEdit, setShowNameEdit] = useState(false)

  const displayName = staff?.name ?? ''
  const displayTitle = staff?.title ?? ''
  const displayRole = staff?.role === 'admin' ? '관리자' : '보조자'
  const avatarChar = displayName ? displayName.charAt(0) : '?'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNameSaved(newName: string) {
    updateStaff({ name: newName })
    toast.success('이름이 변경되었습니다')
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', overflowY: 'auto', paddingBottom: 'calc(54px + var(--sab, 20px) + 20px)' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--bd)', background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: 'none', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700 }}>설정</span>
      </div>

      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* 프로필 섹션 */}
        <div>
          <SectionHeader label="프로필" />
          <div style={{ background: 'var(--bg2)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 14px', borderBottom: '1px solid var(--bd)' }}>
              {/* 아바타 */}
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: '#fff',
              }}>
                {avatarChar}
              </div>
              {/* 이름/직책 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  onClick={() => setShowNameEdit(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{displayName}</span>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                  {displayTitle} · {displayRole}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 계정 섹션 */}
        <div>
          <SectionHeader label="계정" />
          <div style={{ background: 'var(--bg2)', borderRadius: 12, overflow: 'hidden', padding: '8px 10px' }}>
            {showPwChange ? (
              <ChangePasswordForm onDone={() => setShowPwChange(false)} />
            ) : (
              <Row label="비밀번호 변경" onClick={() => setShowPwChange(true)}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Row>
            )}
          </div>
        </div>

        {/* 알림 섹션 */}
        <div>
          <SectionHeader label="알림" />
          <div style={{ background: 'var(--bg2)', borderRadius: 12, overflow: 'hidden', padding: '8px 10px' }}>
            <Row label="점검 미완료 알림" sub="마감 1시간 전"><Toggle defaultOn /></Row>
            <Row label="미조치 항목 알림" sub="매일 09:00"><Toggle defaultOn /></Row>
            <Row label="승강기 점검 D-7 알림"><Toggle defaultOn={false} /></Row>
          </div>
        </div>

        {/* 화면 섹션 */}
        <div>
          <SectionHeader label="화면" />
          <div style={{ background: 'var(--bg2)', borderRadius: 12, overflow: 'hidden', padding: '8px 10px' }}>
            <Row label="테마">
              <select style={{ background: 'var(--bg4)', border: '1px solid var(--bd2)', color: 'var(--t1)', fontSize: 11, padding: '4px 7px', borderRadius: 7, outline: 'none' }}>
                <option>다크</option><option>라이트</option><option>시스템</option>
              </select>
            </Row>
            <Row label="주간 현황 기준">
              <select style={{ background: 'var(--bg4)', border: '1px solid var(--bd2)', color: 'var(--t1)', fontSize: 11, padding: '4px 7px', borderRadius: 7, outline: 'none' }}>
                <option>이번 주</option><option>최근 7일</option>
              </select>
            </Row>
            <Row label="결과 즉시 저장"><Toggle defaultOn /></Row>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', height: 44, background: 'rgba(220,38,38,0.12)', color: '#dc2626',
            border: '1px solid rgba(220,38,38,0.25)', borderRadius: 10,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          로그아웃
        </button>

        {/* 앱 정보 푸터 */}
        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--t3)' }}>차바이오컴플렉스 방재 v1.0.0</div>
          <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>경기도 성남시 분당구 판교로 335</div>
        </div>

      </div>

      {/* 이름 변경 모달 */}
      {showNameEdit && (
        <NameEditModal
          currentName={displayName}
          onClose={() => setShowNameEdit(false)}
          onSave={handleNameSaved}
        />
      )}
    </div>
  )
}
