import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

// ── Collapsible section header ────────────────────────
function SectionHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={!collapsed}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', marginBottom: collapsed ? 0 : 6,
        padding: 0, background: 'none', border: 'none', cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <ChevronRight
        size={14}
        color="var(--t3)"
        style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.15s' }}
      />
    </button>
  )
}

function usePersistedCollapse(key: string, defaultCollapsed = true): [boolean, (v: boolean | ((c: boolean) => boolean)) => void] {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(key)
      if (v === null) return defaultCollapsed
      return v !== 'false'
    } catch { return defaultCollapsed }
  })
  useEffect(() => {
    try { localStorage.setItem(key, String(collapsed)) } catch {}
  }, [key, collapsed])
  return [collapsed, setCollapsed]
}
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { authApi, pushApi, NotificationPreferences } from '../utils/api'
import { MenuSettingsSection } from './MenuSettingsSection'

interface Props {
  open: boolean
  onClose: () => void
  isDesktop?: boolean
}

// ── 토글 ─────────────────────────────────────────────
function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange?.(!on)}
      style={{
        width: 38, height: 21, borderRadius: 11, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: on ? '#2563eb' : 'var(--bg4)',
        position: 'relative', transition: 'background 0.18s', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
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

// ── 알림 권한 상태 배지 ───────────────────────────────
function PermBadge({ perm }: { perm: NotificationPermission }) {
  const map: Record<string, { text: string; color: string }> = {
    granted: { text: '허용됨', color: 'var(--safe, #22c55e)' },
    denied:  { text: '차단됨', color: 'var(--danger, #ef4444)' },
    default: { text: '권한 미설정', color: 'var(--t3, #6e7681)' },
  }
  const { text, color } = map[perm] || map.default
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
      background: `${color}22`, color,
    }}>{text}</span>
  )
}

// ── Row ──────────────────────────────────────────────
function Row({ label, sub, children, onClick }: { label: string; sub?: string; children?: React.ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 9, marginBottom: 5, cursor: onClick ? 'pointer' : 'default' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

// ── 비밀번호 변경 폼 ─────────────────────────────────
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
    <div style={{ padding: '12px 13px' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>비밀번호 변경</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input type="password" placeholder="현재 비밀번호" value={current} onChange={e => setCurrent(e.target.value)}
          style={{ height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
        <input type="password" placeholder="새 비밀번호 (4자 이상)" value={next} onChange={e => setNext(e.target.value)}
          style={{ height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
        <input type="password" placeholder="새 비밀번호 확인" value={confirm} onChange={e => setConfirm(e.target.value)}
          style={{ height: 40, background: 'var(--bg3)', border: `1px solid ${confirm && next !== confirm ? 'var(--danger)' : 'var(--bd)'}`, borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
        {confirm && next !== confirm && (
          <div style={{ fontSize: 11, color: 'var(--danger)' }}>비밀번호가 일치하지 않습니다</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onDone} style={{ flex: 1, height: 36, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>취소</button>
          <button onClick={() => mutation.mutate()} disabled={!canSave || mutation.isPending}
            style={{ flex: 1, height: 36, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 8, cursor: canSave && !mutation.isPending ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, opacity: canSave && !mutation.isPending ? 1 : 0.4 }}>
            변경
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 이름 변경 모달 ───────────────────────────────────
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
        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} maxLength={20}
          placeholder="이름 입력 (최대 20자)" autoFocus
          style={{ height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8, padding: '0 12px', fontSize: 13, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, height: 36, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>취소</button>
          <button onClick={() => mutation.mutate()} disabled={!canSave || mutation.isPending}
            style={{ flex: 1, height: 36, background: 'var(--acl)', color: '#fff', border: 'none', borderRadius: 8, cursor: canSave && !mutation.isPending ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, opacity: canSave && !mutation.isPending ? 1 : 0.4 }}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SettingsPanel ────────────────────────────────────
export function SettingsPanel({ open, onClose, isDesktop = false }: Props) {
  const navigate = useNavigate()
  const { staff, logout, updateStaff } = useAuthStore()
  const [showPwChange, setShowPwChange] = useState(false)
  const [showNameEdit, setShowNameEdit] = useState(false)
  const [notifCollapsed, setNotifCollapsed] = usePersistedCollapse('settings.notif.collapsed', true)
  const [displayCollapsed, setDisplayCollapsed] = usePersistedCollapse('settings.display.collapsed', true)
  const [accountCollapsed, setAccountCollapsed] = usePersistedCollapse('settings.account.collapsed', true)

  const displayName = staff?.name ?? ''
  const displayRole = staff?.role === 'admin' ? '관리자' : '보조자'
  const displayTitle = staff?.title ?? ''
  const avatarChar = displayName ? displayName.charAt(0) : '?'

  // ── 알림 상태 ─────────────────────────────────────
  const [permState, setPermState] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const [subscribed, setSubscribed] = useState(false)
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    daily_schedule: true, incomplete_schedule: true,
    unresolved_issue: true, education_reminder: true,
    event_15min: true, event_5min: true,
  })

  // 패널 열릴 때 구독 상태 로드
  useEffect(() => {
    if (!open) return
    pushApi.getStatus()
      .then(data => {
        setSubscribed(data.subscribed)
        if (data.subscribed && data.preferences) setPrefs(data.preferences)
      })
      .catch(() => {})
  }, [open])

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
  }

  async function handleSubscribe() {
    try {
      if (permState === 'denied') {
        toast('브라우저 설정에서 알림을 허용해 주세요.')
        return
      }
      const result = await Notification.requestPermission()
      setPermState(result)
      if (result !== 'granted') {
        toast('알림 권한이 차단되었습니다. 브라우저 설정에서 허용해주세요.')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const vapidKey = await pushApi.getVapidKey()
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as ArrayBuffer,
      })
      await pushApi.subscribe(sub)
      setSubscribed(true)
      toast.success('푸시 알림이 활성화되었습니다.')
    } catch (e) {
      console.error('Push subscribe error:', e)
      toast.error('알림 구독에 실패했습니다. 다시 시도해주세요.')
    }
  }

  async function handleUnsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await pushApi.unsubscribe(sub.endpoint)
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (e) {
      console.error('Push unsubscribe error:', e)
      toast.error('알림 해제에 실패했습니다.')
    }
  }

  async function handlePrefToggle(key: keyof NotificationPreferences) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    try {
      await pushApi.updatePreferences(next)
    } catch {
      setPrefs(prefs)
      toast.error('설정 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  useEffect(() => {
    if (!open) return
    const prevent = (e: TouchEvent) => {
      const panel = document.getElementById('settings-panel')
      if (panel && panel.contains(e.target as Node)) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => document.removeEventListener('touchmove', prevent)
  }, [open])

  function handleLogout() {
    logout()
    navigate('/login')
    onClose()
  }

  function handleNameSaved(newName: string) {
    updateStaff({ name: newName })
    toast.success('이름이 변경되었습니다')
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 190,
          background: 'rgba(0,0,0,0.65)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.28s',
        }}
      />
      <div
        id="settings-panel"
        style={{
          position: 'fixed', top: isDesktop ? 0 : 'var(--sat, 0px)', bottom: isDesktop ? 0 : 'calc(54px + var(--sab, 34px) - var(--sat, 0px))', right: 0, zIndex: 200,
          width: '88%', maxWidth: 320,
          background: 'var(--bg2)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
          overflowY: 'auto',
          borderRadius: '16px 0 0 16px',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 15px', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>설정</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 7, background: 'var(--bg3)', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>✕</button>
        </div>

        {/* 프로필 */}
        <div style={{ padding: '14px 13px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: '#fff',
            }}>
              {avatarChar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div onClick={() => setShowNameEdit(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{displayName}</span>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{displayTitle} · {displayRole}</div>
            </div>
          </div>
        </div>

        {/* 알림 */}
        <div style={{ padding: '12px 13px 5px' }}>
          <SectionHeader label="알림" collapsed={notifCollapsed} onToggle={() => setNotifCollapsed(c => !c)} />

          {/* 권한 상태 + 구독 토글 (항상 표시) */}
          <Row label="푸시 알림" sub={permState === 'denied' ? '브라우저 설정에서 알림을 허용해주세요' : subscribed ? '구독 중' : '구독하려면 토글을 켜세요'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PermBadge perm={permState} />
              <Toggle
                on={subscribed}
                onChange={v => v ? handleSubscribe() : handleUnsubscribe()}
                disabled={permState === 'denied'}
              />
            </div>
          </Row>

          {!notifCollapsed && (
            <div style={{ marginTop: 8, padding: '8px 10px 4px', background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 9 }}>
              {/* 점검 그룹 */}
              <div style={{ fontSize: 9, color: 'var(--t3)', marginBottom: 4, fontWeight: 700, letterSpacing: '.08em' }}>점검</div>
              <Row label="금일 점검 일정" sub="매일 08:45">
                <Toggle on={prefs.daily_schedule} onChange={() => handlePrefToggle('daily_schedule')} disabled={!subscribed || permState === 'denied'} />
              </Row>
              <Row label="전일 미완료 점검" sub="매일 08:45">
                <Toggle on={prefs.incomplete_schedule} onChange={() => handlePrefToggle('incomplete_schedule')} disabled={!subscribed || permState === 'denied'} />
              </Row>
              <Row label="미조치 항목" sub="매일 08:45">
                <Toggle on={prefs.unresolved_issue} onChange={() => handlePrefToggle('unresolved_issue')} disabled={!subscribed || permState === 'denied'} />
              </Row>

              {/* 일정 그룹 */}
              <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 10, marginBottom: 4, fontWeight: 700, letterSpacing: '.08em' }}>일정</div>
              <Row label="행사 15분 전 알림" sub="행사 시작 15분 전">
                <Toggle on={prefs.event_15min} onChange={() => handlePrefToggle('event_15min')} disabled={!subscribed || permState === 'denied'} />
              </Row>
              <Row label="행사 5분 전 알림" sub="행사 시작 5분 전">
                <Toggle on={prefs.event_5min} onChange={() => handlePrefToggle('event_5min')} disabled={!subscribed || permState === 'denied'} />
              </Row>
              <Row label="교육 D-30 알림" sub="교육일 30일 전">
                <Toggle on={prefs.education_reminder} onChange={() => handlePrefToggle('education_reminder')} disabled={!subscribed || permState === 'denied'} />
              </Row>
            </div>
          )}
        </div>

        {/* 메뉴 설정 (Phase 18) */}
        <MenuSettingsSection />

        {/* 화면 */}
        <div style={{ padding: '12px 13px 5px' }}>
          <SectionHeader label="화면" collapsed={displayCollapsed} onToggle={() => setDisplayCollapsed(c => !c)} />
          {!displayCollapsed && <>
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
            <Row label="결과 즉시 저장"><Toggle on={true} /></Row>
          </>}
        </div>

        {/* 계정 */}
        {showPwChange ? (
          <ChangePasswordForm onDone={() => setShowPwChange(false)} />
        ) : (
          <div style={{ padding: '12px 13px 5px' }}>
            <SectionHeader label="계정" collapsed={accountCollapsed} onToggle={() => setAccountCollapsed(c => !c)} />
            {!accountCollapsed && (
              <Row label="비밀번호 변경" onClick={() => setShowPwChange(true)}>
                <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Row>
            )}
          </div>
        )}

        {/* 로그아웃 */}
        <div style={{ padding: '12px 13px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', height: 40, background: 'rgba(220,38,38,0.12)', color: '#dc2626',
              border: '1px solid rgba(220,38,38,0.25)', borderRadius: 9,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            로그아웃
          </button>
        </div>

        {/* 앱 정보 */}
        <div style={{ padding: 13, textAlign: 'center' }}>
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
    </>
  )
}
