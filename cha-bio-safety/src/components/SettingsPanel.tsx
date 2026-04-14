import { useState, useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import JSZip from 'jszip'

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
import { authApi, pushApi, staffApi, NotificationPreferences } from '../utils/api'
import { useStaffList } from '../hooks/useStaffList'
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

// ── 개인정보 수정 폼 ─────────────────────────────────
function ProfileEditForm({ onDone }: { onDone: () => void }) {
  const { staff, updateStaff } = useAuthStore()
  const { data: staffList = [] } = useStaffList()
  const staffFull = staffList.find(s => s.id === staff?.id)

  const [name, setName] = useState(staff?.name ?? '')
  const [phone, setPhone] = useState(staffFull?.phone ?? '')
  const [email, setEmail] = useState(staffFull?.email ?? '')

  // staffFull 로드 후 초기값 반영
  useEffect(() => {
    if (staffFull) {
      setPhone(staffFull.phone ?? '')
      setEmail(staffFull.email ?? '')
    }
  }, [staffFull])

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({ phone, email }),
    onSuccess: (data) => {
      updateStaff({ name: data.name })
      toast.success('개인정보가 수정되었습니다')
      onDone()
    },
    onError: (e: any) => toast.error(e?.message || '수정에 실패했습니다'),
  })

  const canSave = true

  const INPUT_STYLE: React.CSSProperties = {
    height: 38, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8,
    padding: '0 12px', fontSize: 12, color: 'var(--t1)', outline: 'none', width: '100%', boxSizing: 'border-box' as const,
  }
  const READONLY_STYLE: React.CSSProperties = { ...INPUT_STYLE, color: 'var(--t3)', background: 'var(--bg)' }

  return (
    <div style={{ padding: '12px 13px' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>개인정보 수정</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>이름</div>
          <input value={name} readOnly style={READONLY_STYLE} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>사번</div>
          <input value={staff?.id ?? ''} readOnly style={READONLY_STYLE} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>연락처</div>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" style={INPUT_STYLE} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>이메일</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={INPUT_STYLE} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>입사일</div>
          <input value={staffFull?.appointedAt ?? '-'} readOnly style={READONLY_STYLE} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>직책</div>
          <input value={staff?.title ?? '-'} readOnly style={READONLY_STYLE} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 2 }}>역할</div>
          <input value={staff?.role === 'admin' ? '관리자' : '보조자'} readOnly style={READONLY_STYLE} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={onDone} style={{ flex: 1, height: 36, background: 'var(--bg4)', color: 'var(--t2)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>취소</button>
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
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [notifCollapsed, setNotifCollapsed] = usePersistedCollapse('settings.notif.collapsed', true)
  const [displayCollapsed, setDisplayCollapsed] = usePersistedCollapse('settings.display.collapsed', true)
  const [accountCollapsed, setAccountCollapsed] = usePersistedCollapse('settings.account.collapsed', true)
  const [dbCollapsed, setDbCollapsed] = usePersistedCollapse('settings.db.collapsed', true)
  const [appInfoCollapsed, setAppInfoCollapsed] = usePersistedCollapse('settings.appinfo.collapsed', true)
  const [cacheClearing, setCacheClearing] = useState(false)
  const [dbBackingUp, setDbBackingUp] = useState(false)
  const [dbRestoring, setDbRestoring] = useState(false)
  const [r2BackingUp, setR2BackingUp] = useState(false)
  const [r2BackupProgress, setR2BackupProgress] = useState('')
  const [r2Restoring, setR2Restoring] = useState(false)

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

  async function handleClearCache() {
    if (!('caches' in window)) {
      toast.error('이 브라우저는 캐시 초기화를 지원하지 않습니다')
      return
    }
    setCacheClearing(true)
    try {
      const names = await caches.keys()
      await Promise.all(names.map(n => caches.delete(n)))
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) await reg.update()
      }
      window.location.reload()
    } catch (e) {
      console.error('Cache clear error:', e)
      toast.error('캐시 초기화에 실패했습니다')
      setCacheClearing(false)
    }
  }

  async function handleDbBackup() {
    setDbBackingUp(true)
    try {
      const token = useAuthStore.getState().token
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/database/backup`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error((j as any).error || '백업 실패'); }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cha-bio-safety_${new Date().toISOString().slice(0, 10)}.sql`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('백업 파일이 다운로드되었습니다')
    } catch (e: any) {
      toast.error(e.message || '백업 실패')
    } finally {
      setDbBackingUp(false)
    }
  }

  async function handleDbRestore() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.sql'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      if (!confirm(`"${file.name}" 파일로 데이터베이스를 복원합니다.\n기존 데이터가 덮어씌워집니다. 계속하시겠습니까?`)) return
      setDbRestoring(true)
      try {
        const token = useAuthStore.getState().token
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/database/restore`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        const json = await res.json() as any
        if (!json.success) throw new Error(json.error || '복원 실패')
        toast.success(`복원 완료 (${json.data.executed}개 실행, ${json.data.errors}개 오류)`)
      } catch (e: any) {
        toast.error(e.message || '복원 실패')
      } finally {
        setDbRestoring(false)
      }
    }
    input.click()
  }

  async function handleR2Backup() {
    setR2BackingUp(true)
    setR2BackupProgress('파일 목록 조회 중...')
    try {
      const token = useAuthStore.getState().token
      const base = import.meta.env.VITE_API_BASE_URL || '/api'
      const listRes = await fetch(`${base}/database/r2-list`, { headers: { Authorization: `Bearer ${token}` } })
      const listJson = await listRes.json() as any
      if (!listJson.success) throw new Error(listJson.error || '목록 조회 실패')

      const cronZips = (listJson.data.cronZips ?? []) as { key: string; date: string; size: number }[]
      // DB에서 마지막 백업 날짜 조회
      const statusRes = await fetch(`${base}/database/backup-status`, { headers: { Authorization: `Bearer ${token}` } })
      const statusJson = await statusRes.json() as any
      const lastDownloaded = statusJson.data?.lastDate ?? ''
      let downloaded = 0

      // 1. 새 크론 백업 zip 다운로드 (이미 받은 건 건너뜀)
      const newCronZips = cronZips.filter(z => z.date > lastDownloaded).sort((a, b) => a.date.localeCompare(b.date))
      for (const cz of newCronZips) {
        setR2BackupProgress(`크론 백업 다운로드 (${cz.date})...`)
        const res = await fetch(`${base}/database/r2-download?key=${encodeURIComponent(cz.key)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) continue
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cha-bio-r2_${cz.date}.zip`
        a.click()
        URL.revokeObjectURL(url)
        // DB에 마지막 받은 날짜 저장
        await fetch(`${base}/database/backup-status`, {
          method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: cz.date }),
        })
        downloaded++
      }

      // 2. 크론 이후 새로 생긴 파일만 delta zip
      const latestCronDate = newCronZips.length > 0
        ? newCronZips[newCronZips.length - 1].date
        : lastDownloaded
      const allKeys = listJson.data.keys as { key: string; size: number; uploaded: string }[]
      const deltaKeys = allKeys.filter(k =>
        !k.key.startsWith('documents/') && !k.key.startsWith('backups/') && !k.key.startsWith('preview/') &&
        k.uploaded.slice(0, 10) > latestCronDate
      )

      if (deltaKeys.length > 0) {
        const zip = new JSZip()
        for (let i = 0; i < deltaKeys.length; i++) {
          setR2BackupProgress(`신규 파일 다운로드 (${i + 1}/${deltaKeys.length})...`)
          const res = await fetch(`${base}/database/r2-download?key=${encodeURIComponent(deltaKeys[i].key)}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) continue
          const blob = await res.blob()
          zip.file(deltaKeys[i].key, blob)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cha-bio-r2_delta_${new Date().toISOString().slice(0, 10)}.zip`
        a.click()
        URL.revokeObjectURL(url)
        downloaded++
      }

      if (downloaded === 0 && deltaKeys.length === 0) {
        toast('새로 백업할 파일이 없습니다')
      } else {
        const parts = []
        if (newCronZips.length > 0) parts.push(`크론 백업 ${newCronZips.length}개`)
        if (deltaKeys.length > 0) parts.push(`신규 파일 ${deltaKeys.length}개`)
        toast.success(`R2 백업 완료 (${parts.join(', ')})`)
      }
    } catch (e: any) {
      toast.error(e.message || 'R2 백업 실패')
    } finally {
      setR2BackingUp(false)
      setR2BackupProgress('')
    }
  }

  async function handleR2Restore() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      if (!confirm(`"${file.name}" 파일로 R2 스토리지를 복원합니다. 계속하시겠습니까?`)) return
      setR2Restoring(true)
      try {
        const token = useAuthStore.getState().token
        const base = import.meta.env.VITE_API_BASE_URL || '/api'
        const zip = await JSZip.loadAsync(file)
        const fileNames = Object.keys(zip.files).filter(n => !zip.files[n].dir)
        let uploaded = 0

        // 10개씩 배치 업로드
        for (let i = 0; i < fileNames.length; i += 10) {
          const batch = fileNames.slice(i, i + 10)
          const formData = new FormData()
          for (const name of batch) {
            const blob = await zip.files[name].async('blob')
            formData.append('files', blob, name)
            formData.append('keys', name)
          }
          const res = await fetch(`${base}/database/r2-upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
          const json = await res.json() as any
          if (json.success) uploaded += json.data.uploaded
        }
        toast.success(`R2 복원 완료 (${uploaded}개 파일)`)
      } catch (e: any) {
        toast.error(e.message || 'R2 복원 실패')
      } finally {
        setR2Restoring(false)
      }
    }
    input.click()
  }

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
          position: 'fixed', top: isDesktop ? 0 : 'var(--sat, 0px)', bottom: isDesktop ? 0 : 'calc(54px + var(--sab, 0px) - var(--sat, 0px))', right: 0, zIndex: 200,
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
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{displayName}</span>
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
        ) : showProfileEdit ? (
          <ProfileEditForm onDone={() => setShowProfileEdit(false)} />
        ) : (
          <div style={{ padding: '12px 13px 5px' }}>
            <SectionHeader label="계정" collapsed={accountCollapsed} onToggle={() => setAccountCollapsed(c => !c)} />
            {!accountCollapsed && (<>
              <Row label="개인정보 수정" sub="연락처, 이메일" onClick={() => setShowProfileEdit(true)}>
                <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Row>
              <Row label="비밀번호 변경" onClick={() => setShowPwChange(true)}>
                <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Row>
            </>)}
          </div>
        )}

        {/* 데이터베이스 */}
        {staff?.role === 'admin' && (
          <div style={{ padding: '12px 13px 5px' }}>
            <SectionHeader label="데이터베이스" collapsed={dbCollapsed} onToggle={() => setDbCollapsed(c => !c)} />
            {!dbCollapsed && (<>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>DB (점검기록, 직원, 설정 등)</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button
                  onClick={handleDbBackup}
                  disabled={dbBackingUp}
                  style={{
                    flex: 1, height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)',
                    borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: dbBackingUp ? 'default' : 'pointer',
                    color: 'var(--t1)', opacity: dbBackingUp ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                  {dbBackingUp ? '백업 중...' : '백업'}
                </button>
                <button
                  onClick={handleDbRestore}
                  disabled={dbRestoring}
                  style={{
                    flex: 1, height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)',
                    borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: dbRestoring ? 'default' : 'pointer',
                    color: 'var(--t1)', opacity: dbRestoring ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  {dbRestoring ? '복원 중...' : '업로드'}
                </button>
              </div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>파일 (점검 사진 등)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleR2Backup}
                  disabled={r2BackingUp}
                  style={{
                    flex: 1, height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)',
                    borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: r2BackingUp ? 'default' : 'pointer',
                    color: 'var(--t1)', opacity: r2BackingUp ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {r2BackingUp ? (r2BackupProgress || '백업 중...') : '백업'}
                </button>
                <button
                  onClick={handleR2Restore}
                  disabled={r2Restoring}
                  style={{
                    flex: 1, height: 40, background: 'var(--bg3)', border: '1px solid var(--bd)',
                    borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: r2Restoring ? 'default' : 'pointer',
                    color: 'var(--t1)', opacity: r2Restoring ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  {r2Restoring ? '복원 중...' : '업로드'}
                </button>
              </div>
            </>)}
          </div>
        )}

        {/* 앱 정보 */}
        <div style={{ padding: '12px 13px 5px' }}>
          <SectionHeader label="앱 정보" collapsed={appInfoCollapsed} onToggle={() => setAppInfoCollapsed(c => !c)} />
          {!appInfoCollapsed && (
            <>
              <Row label="버전" sub={`v${__APP_VERSION__} (${__BUILD_TIME__})`} />
              <Row
                label={cacheClearing ? '초기화 중…' : '캐시 초기화'}
                sub="최신 리소스로 새로고침"
                onClick={cacheClearing ? undefined : handleClearCache}
              >
                <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Row>
              <Row label="차바이오컴플렉스 방재" sub="경기도 성남시 분당구 판교로 335" />
            </>
          )}
        </div>

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
      </div>

    </>
  )
}
