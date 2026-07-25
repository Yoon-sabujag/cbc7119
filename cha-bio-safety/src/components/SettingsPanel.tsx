import { useState, useEffect, useRef } from 'react'
import { ChevronRight, X, Send, Loader2, Download } from 'lucide-react'
import JSZip from 'jszip'

// ── Collapsible section header ────────────────────────
function SectionHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={!collapsed}
      className={`flex items-center justify-between w-full p-0 bg-transparent border-none cursor-pointer ${collapsed ? '' : 'mb-1.5'}`}
    >
      {/* W6 §7 #12 — 9 → 12 격상 (caption leading-none uppercase) */}
      <span className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase">
        {label}
      </span>
      <ChevronRight
        size={14}
        className={`text-text-tertiary transition-transform duration-150 ${collapsed ? '' : 'rotate-90'}`}
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { authApi, pushApi, staffApi, NotificationPreferences } from '../utils/api'
import { useStaffList } from '../hooks/useStaffList'
import { MenuSettingsSection } from './MenuSettingsSection'
import { getThemePreference, setThemePreference, type ThemePreference } from '../utils/theme'

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
      disabled={disabled}
      // W5 OQ #5-A LOCKED — Toggle on raw #2563eb → bg-accent-active
      className={`relative w-[38px] h-[21px] rounded-full border-none shrink-0 p-0 transition-colors duration-200 ${
        on ? 'bg-accent-active' : 'bg-surface-active'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer opacity-100'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-[17px] h-[17px] rounded-full bg-white block transition-transform duration-200 ${
          on ? 'translate-x-[17px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ── 알림 권한 상태 배지 ───────────────────────────────
function PermBadge({ perm }: { perm: NotificationPermission }) {
  // sketch §6.3 매트릭스 — 3 분기 (text 토큰 class + bg 는 16% alpha 인라인 합성)
  const map: Record<string, { text: string; textClass: string; bg: string }> = {
    granted: { text: '허용됨',      textClass: 'text-safe',          bg: 'rgba(34, 197, 94, 0.16)' },
    denied:  { text: '차단됨',      textClass: 'text-danger',        bg: 'rgba(239, 68, 68, 0.16)' },
    default: { text: '권한 미설정', textClass: 'text-text-tertiary', bg: 'rgba(139, 148, 158, 0.16)' },
  }
  const { text, textClass, bg } = map[perm] || map.default
  return (
    <span
      // W6 §7 #14 — 10 → 12 격상 (caption + leading-none + font-semibold)
      className={`text-caption leading-none font-semibold px-[7px] py-[2px] rounded-[10px] ${textClass}`}
      // 동적 색상 16% alpha 합성 — Tailwind class 한계로 인라인 유지 (W6 §9.3 화이트리스트)
      style={{ background: bg }}
    >
      {text}
    </span>
  )
}

// ── Row ──────────────────────────────────────────────
function Row({ label, sub, children, onClick }: { label: string; sub?: string; children?: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 bg-surface-sunken rounded-[9px] mb-[5px] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div>
        {/* W11 balance v3 — text-label (13) → text-body (16) 통일 (SideMenu item + 노안 마지노선) */}
        <div className="text-body font-medium text-text-primary">{label}</div>
        {sub && (
          /* W6 §7 #16 — 10 → 12 격상 (caption) */
          <div className="text-caption text-text-tertiary mt-px">{sub}</div>
        )}
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
    <div className="px-[13px] py-3">
      {/* W6 §7 #17 — 9 → 12 격상 (caption leading-none uppercase) */}
      <div className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase mb-2">비밀번호 변경</div>
      <div className="flex flex-col gap-2">
        <input
          type="password" placeholder="현재 비밀번호" value={current} onChange={e => setCurrent(e.target.value)}
          className="h-10 w-full box-border bg-surface-sunken border border-border-default rounded-sm px-3 text-label text-text-primary outline-none"
        />
        <input
          type="password" placeholder="새 비밀번호 (4자 이상)" value={next} onChange={e => setNext(e.target.value)}
          className="h-10 w-full box-border bg-surface-sunken border border-border-default rounded-sm px-3 text-label text-text-primary outline-none"
        />
        <input
          type="password" placeholder="새 비밀번호 확인" value={confirm} onChange={e => setConfirm(e.target.value)}
          className={`h-10 w-full box-border bg-surface-sunken border rounded-sm px-3 text-label text-text-primary outline-none ${
            confirm && next !== confirm ? 'border-danger' : 'border-border-default'
          }`}
        />
        {confirm && next !== confirm && (
          /* W6 §7 #19 — 11 → 12 격상 (caption text-danger) */
          <div className="text-caption text-danger">비밀번호가 일치하지 않습니다</div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onDone}
            className="flex-1 h-9 bg-surface-active text-text-secondary border-none rounded-sm cursor-pointer text-label font-bold"
          >
            취소
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSave || mutation.isPending}
            className={`flex-1 h-9 bg-accent text-text-on-accent border-none rounded-sm text-label font-bold ${
              canSave && !mutation.isPending ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'
            }`}
          >
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
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({ name: editName.trim() }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['staff-list'] })
      onSave(data.name); onClose()
    },
    onError: (e: any) => toast.error(e?.message || '이름 변경에 실패했습니다'),
  })

  const canSave = editName.trim() !== '' && editName.trim() !== currentName && editName.trim().length <= 20

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60">
      <div className="bg-surface-raised rounded-[14px] px-[18px] py-[20px] w-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* W6 §7 #21 — 13 → 16 격상 (text-body font-bold) */}
        <div className="text-body font-bold mb-[14px] text-text-primary">이름 변경</div>
        <input
          type="text" value={editName} onChange={e => setEditName(e.target.value)} maxLength={20}
          placeholder="이름 입력 (최대 20자)" autoFocus
          className="h-10 w-full box-border bg-surface-sunken border border-border-default rounded-sm px-3 text-label text-text-primary outline-none mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-9 bg-surface-active text-text-secondary border-none rounded-sm cursor-pointer text-label font-bold"
          >
            취소
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSave || mutation.isPending}
            className={`flex-1 h-9 bg-accent text-text-on-accent border-none rounded-sm text-label font-bold ${
              canSave && !mutation.isPending ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'
            }`}
          >
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
  const qc = useQueryClient()

  const [name, setName] = useState(staff?.name ?? '')
  const [phone, setPhone] = useState(staffFull?.phone ?? '')
  const [email, setEmail] = useState(staffFull?.email ?? '')
  const [birthDate, setBirthDate] = useState(staffFull?.birthDate ?? '')

  // staffFull 로드 후 초기값 반영
  useEffect(() => {
    if (staffFull) {
      setPhone(staffFull.phone ?? '')
      setEmail(staffFull.email ?? '')
      setBirthDate(staffFull.birthDate ?? '')
    }
  }, [staffFull])

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({ phone, email, birthDate: birthDate || null }),
    onSuccess: (data) => {
      updateStaff({ name: data.name })
      // 5분 staleTime 으로 캐시된 staff-list 를 즉시 무효화 — 폼 재진입 시 최신 phone/email 반영
      qc.invalidateQueries({ queryKey: ['staff-list'] })
      toast.success('개인정보가 수정되었습니다')
      onDone()
    },
    onError: (e: any) => toast.error(e?.message || '수정에 실패했습니다'),
  })

  const canSave = true

  const INPUT_CLS = "h-[38px] w-full box-border bg-surface-sunken border border-border-default rounded-sm px-3 text-caption text-text-primary outline-none"
  const READONLY_CLS = "h-[38px] w-full box-border bg-surface-page border border-border-default rounded-sm px-3 text-caption text-text-tertiary outline-none"

  return (
    <div className="px-[13px] py-3">
      {/* W6 §7 #23 — 9 → 12 격상 (caption leading-none uppercase) */}
      <div className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase mb-2">개인정보 수정</div>
      <div className="flex flex-col gap-1.5">
        {/* W6 §7 #24 — 8 필드 라벨 10 → 12 격상 */}
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">이름</div>
          <input value={name} readOnly className={READONLY_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">사번</div>
          <input value={staff?.id ?? ''} readOnly className={READONLY_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">직책</div>
          <input value={staff?.title ?? '-'} readOnly className={READONLY_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">역할</div>
          <input value={staff?.role === 'admin' ? '관리자' : '보조자'} readOnly className={READONLY_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">입사일</div>
          <input
            value={(() => {
              const p = (staff?.id ?? '').slice(0, 8)
              return /^[0-9]{8}$/.test(p) ? `${p.slice(0,4)}-${p.slice(4,6)}-${p.slice(6,8)}` : (staffFull?.appointedAt ?? '-')
            })()}
            readOnly className={READONLY_CLS}
          />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">생년월일</div>
          <input
            type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
            className={INPUT_CLS}
            // type=date 의 native widget 정렬 보정 — Tailwind class 한계로 인라인 유지 (W6 §9.3 화이트리스트)
            style={{ WebkitAppearance: 'none', appearance: 'none', minWidth: 0, textAlign: 'left' }}
          />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">연락처</div>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" className={INPUT_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">이메일</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={INPUT_CLS} />
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={onDone}
            className="flex-1 h-9 bg-surface-active text-text-secondary border-none rounded-sm cursor-pointer text-label font-bold"
          >
            취소
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSave || mutation.isPending}
            className={`flex-1 h-9 bg-accent text-text-on-accent border-none rounded-sm text-label font-bold ${
              canSave && !mutation.isPending ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'
            }`}
          >
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
  const [themePref, setThemePrefState] = useState<ThemePreference>(() => getThemePreference())
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as ThemePreference
    setThemePreference(v)
    setThemePrefState(v)
  }
  const [accountCollapsed, setAccountCollapsed] = usePersistedCollapse('settings.account.collapsed', true)
  const [dbCollapsed, setDbCollapsed] = usePersistedCollapse('settings.db.collapsed', true)
  const [systemCollapsed, setSystemCollapsed] = usePersistedCollapse('settings.system.collapsed', true)
  const [appInfoCollapsed, setAppInfoCollapsed] = usePersistedCollapse('settings.appinfo.collapsed', true)
  const [cacheClearing, setCacheClearing] = useState(false)
  const [dbBackingUp, setDbBackingUp] = useState(false)
  const [dbRestoring, setDbRestoring] = useState(false)
  const [r2BackingUp, setR2BackingUp] = useState(false)
  const [r2BackupProgress, setR2BackupProgress] = useState('')
  const [r2Restoring, setR2Restoring] = useState(false)
  const [autoBackupOpen, setAutoBackupOpen] = useState(false)
  const [autoBackupLoading, setAutoBackupLoading] = useState(false)
  const [autoBackupList, setAutoBackupList] = useState<{ date: string; size: number; key: string }[]>([])
  const [autoBackupDownloading, setAutoBackupDownloading] = useState<string | null>(null)
  const [testSending, setTestSending] = useState(false)

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
      const existing = await reg.pushManager.getSubscription()
      if (existing) await existing.unsubscribe()
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

  async function handleTestPush() {
    const token = useAuthStore.getState().token
    const base = import.meta.env.VITE_API_BASE_URL || '/api'
    setTestSending(true)
    try {
      const res = await fetch(`${base}/push/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const json = await res.json() as { success: boolean; data?: { sent: number; total: number }; error?: string }
      if (json.success) {
        toast.success(`테스트 푸시 발송: ${json.data?.sent ?? 0}/${json.data?.total ?? 0} 성공`)
      } else {
        toast.error(`실패: ${json.error ?? '알 수 없는 오류'}`)
      }
    } catch {
      toast.error('요청 실패: 네트워크 확인')
    } finally {
      setTestSending(false)
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
        // reg.update()는 새 SW 다운로드만 요청하고 활성화 대기하지 않아
        // 바로 reload 시 구 SW가 precache 서빙 → 신버전 코드 적용 안 됨.
        // unregister로 완전 해제 후 reload해야 새 SW가 깨끗하게 재등록됨.
        if (reg) await reg.unregister()
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

  async function fetchAutoBackups() {
    setAutoBackupLoading(true)
    try {
      const token = useAuthStore.getState().token
      const base = import.meta.env.VITE_API_BASE_URL || '/api'
      const res = await fetch(`${base}/database/r2-list`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json() as any
      if (!json.success) throw new Error(json.error || '목록 조회 실패')
      const keys = json.data.keys as { key: string; size: number; uploaded: string }[]
      const filtered = keys
        .filter(k => k.key.startsWith('backups/db/') && k.key.endsWith('.sql'))
        .map(k => ({ date: k.key.replace('backups/db/', '').replace('.sql', ''), size: k.size, key: k.key }))
        .sort((a, b) => b.date.localeCompare(a.date))
      setAutoBackupList(filtered)
    } catch (e: any) {
      toast.error(e.message || '백업 목록을 불러오지 못했습니다')
      setAutoBackupList([])
    } finally {
      setAutoBackupLoading(false)
    }
  }

  function toggleAutoBackup() {
    setAutoBackupOpen(prev => {
      const next = !prev
      if (next) fetchAutoBackups()
      return next
    })
  }

  async function downloadAutoBackup(item: { date: string; size: number; key: string }) {
    if (autoBackupDownloading) return
    setAutoBackupDownloading(item.key)
    try {
      const token = useAuthStore.getState().token
      const base = import.meta.env.VITE_API_BASE_URL || '/api'
      const res = await fetch(`${base}/database/r2-download?key=${encodeURIComponent(item.key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error((j as any).error || '다운로드 실패') }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cha-bio-safety_${item.date}.sql`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('백업 파일이 다운로드되었습니다')
    } catch (e: any) {
      toast.error(e.message || '다운로드 실패')
    } finally {
      setAutoBackupDownloading(null)
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
        if (json.data.warning) toast(json.data.warning, { icon: '⚠️', duration: 8000 })
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
        className="fixed inset-0 z-[190] bg-black/65 transition-opacity duration-[280ms]"
        style={{
          // 동적 분기 — open prop 따라 opacity/pointerEvents 변경. Tailwind class dynamic value 한계로 인라인 유지 (W6 §9.3 화이트리스트)
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
        }}
      />
      <div
        id="settings-panel"
        className="fixed right-0 z-[200] w-[88%] max-w-[320px] bg-surface-raised overflow-y-auto rounded-l-[16px]"
        style={{
          // isDesktop 분기 + safe-area css var + cubic-bezier transition — Tailwind class 한계로 인라인 유지 (W6 §9.3 화이트리스트)
          top: isDesktop ? 0 : 'var(--sat, 0px)',
          bottom: isDesktop ? 0 : 'calc(54px + var(--sab, 0px) - var(--sat, 0px))',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2.5 px-[15px] py-3 border-b border-border-default shrink-0">
          {/* OQ #5 LOCKED — gear svg path verbatim 인라인 유지 (Lucide 교체 X) */}
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {/* W6 §7 #25 — 13.5 → 18 격상 (text-title font-bold) */}
          <span className="text-title font-bold text-text-primary">설정</span>
          {/* W3-OQ #A LOCKED — close glyph 텍스트 → Lucide X (size 14, w-7 h-7 = 32px) */}
          <button
            onClick={onClose}
            aria-label="설정 닫기"
            className="ml-auto w-7 h-7 rounded-[7px] bg-surface-sunken border-none text-text-secondary cursor-pointer flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>

        {/* 프로필 */}
        <div className="px-[13px] pt-3.5 pb-2">
          <div className="flex items-center gap-3 mb-2.5">
            {/* OQ #4 LOCKED — 프로필 아바타 그라데이션 (raw blue→purple 135deg) 폐기 → bg-accent-active solid */}
            <div className="w-11 h-11 rounded-full shrink-0 bg-accent-active flex items-center justify-center text-[18px] font-bold text-text-on-accent">
              {avatarChar}
            </div>
            <div className="flex-1 min-w-0">
              {/* W6 §7 #28 — 14 → 16 격상 (text-body font-bold) */}
              <span className="text-body font-bold text-text-primary">{displayName}</span>
              {/* W6 §7 #29 — 10 → 12 격상 (caption leading-none) */}
              <div className="text-caption leading-none text-text-tertiary mt-px">{displayTitle} · {displayRole}</div>
            </div>
          </div>
        </div>

        {/* 알림 */}
        <div className="px-[13px] pt-3 pb-1.5">
          <SectionHeader label="알림" collapsed={notifCollapsed} onToggle={() => setNotifCollapsed(c => !c)} />

          {/* 권한 상태 + 구독 토글 (항상 표시) */}
          <Row label="푸시 알림" sub={permState === 'denied' ? '브라우저 설정에서 알림을 허용해주세요' : subscribed ? '구독 중' : '구독하려면 토글을 켜세요'}>
            <div className="flex items-center gap-2">
              <PermBadge perm={permState} />
              <Toggle
                on={subscribed}
                onChange={v => v ? handleSubscribe() : handleUnsubscribe()}
                disabled={permState === 'denied'}
              />
            </div>
          </Row>

          {!notifCollapsed && (
            <div className="mt-2 pt-2 px-2.5 pb-1 bg-surface-sunken border border-border-strong rounded-[9px]">
              {/* admin 전용 테스트 푸시 버튼 — OQ #6 LOCKED 이모지 제거 + Lucide Send/Loader2 */}
              {staff?.role === 'admin' && subscribed && permState === 'granted' && (
                <button
                  onClick={handleTestPush}
                  disabled={testSending}
                  className={`w-full mb-2 bg-surface-active text-text-primary border border-border-strong rounded-sm px-2.5 py-[7px] text-label font-semibold flex items-center justify-center gap-2 ${
                    testSending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'
                  }`}
                >
                  {testSending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>전송 중...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>테스트 푸시 보내기</span>
                    </>
                  )}
                </button>
              )}
              {/* 점검 그룹 (W6 §7 #31 — 9 → 12 격상) */}
              <div className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase mb-1">점검</div>
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
              <div className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase mt-2.5 mb-1">일정</div>
              <Row label="행사 15분 전 알림" sub="행사 시작 15분 전">
                <Toggle on={prefs.event_15min} onChange={() => handlePrefToggle('event_15min')} disabled={!subscribed || permState === 'denied'} />
              </Row>
              <Row label="행사 5분 전 알림" sub="행사 시작 5분 전">
                <Toggle on={prefs.event_5min} onChange={() => handlePrefToggle('event_5min')} disabled={!subscribed || permState === 'denied'} />
              </Row>
              <Row label="교육 D-60 알림" sub="교육일 60일 전">
                <Toggle on={prefs.education_reminder} onChange={() => handlePrefToggle('education_reminder')} disabled={!subscribed || permState === 'denied'} />
              </Row>
            </div>
          )}
        </div>

        {/* 메뉴 설정 (Phase 18) — W10 변환됨 */}
        <MenuSettingsSection />

        {/* 화면 */}
        <div className="px-[13px] pt-3 pb-1.5">
          <SectionHeader label="화면" collapsed={displayCollapsed} onToggle={() => setDisplayCollapsed(c => !c)} />
          {!displayCollapsed && <>
            <Row label="테마">
              <select
                value={themePref}
                onChange={handleThemeChange}
                className="bg-surface-active border border-border-strong text-text-primary text-label leading-none px-2.5 py-1.5 rounded-sm outline-none"
              >
                <option value="dark">다크</option>
                <option value="light">라이트</option>
                <option value="auto">시스템</option>
              </select>
            </Row>
          </>}
        </div>

        {/* 계정 */}
        {showPwChange ? (
          <ChangePasswordForm onDone={() => setShowPwChange(false)} />
        ) : showProfileEdit ? (
          <ProfileEditForm onDone={() => setShowProfileEdit(false)} />
        ) : (
          <div className="px-[13px] pt-3 pb-1.5">
            <SectionHeader label="계정" collapsed={accountCollapsed} onToggle={() => setAccountCollapsed(c => !c)} />
            {!accountCollapsed && (<>
              <Row label="개인정보 수정" sub="연락처, 이메일, 생년월일" onClick={() => setShowProfileEdit(true)}>
                <ChevronRight size={13} className="text-text-tertiary" />
              </Row>
              <Row label="비밀번호 변경" onClick={() => setShowPwChange(true)}>
                <ChevronRight size={13} className="text-text-tertiary" />
              </Row>
            </>)}
          </div>
        )}

        {/* 시스템 — 관리자 + 워치독 수신자(panel_watchdog=1). 진입점은 여기 하나뿐(하단 네비/사이드메뉴에는 없음). */}
        {(staff?.role === 'admin' || staff?.panel_watchdog === 1) && (
          <div className="px-[13px] pt-3 pb-1.5">
            <SectionHeader label="시스템" collapsed={systemCollapsed} onToggle={() => setSystemCollapsed(c => !c)} />
            {!systemCollapsed && (
              <Row
                label="화재수신반 에이전트 모니터"
                sub="캡처보드 · 업로드 · 감지 · OCR 4단계 상태"
                onClick={() => { onClose(); navigate('/panel-monitor') }}
              >
                <ChevronRight size={13} className="text-text-tertiary" />
              </Row>
            )}
          </div>
        )}

        {/* 데이터베이스 */}
        {staff?.role === 'admin' && (
          <div className="px-[13px] pt-3 pb-1.5">
            <SectionHeader label="데이터베이스" collapsed={dbCollapsed} onToggle={() => setDbCollapsed(c => !c)} />
            {!dbCollapsed && (<>
              {/* W6 §7 #33 — 10 → 12 격상 (caption) */}
              <div className="text-caption text-text-tertiary mb-1">DB (점검기록, 직원, 설정 등)</div>
              <div className="flex gap-2 mb-2.5">
                <button
                  onClick={handleDbBackup}
                  disabled={dbBackingUp}
                  className={`flex-1 h-10 bg-surface-sunken border border-border-default rounded-[9px] text-label font-bold text-text-primary flex items-center justify-center gap-1.5 ${
                    dbBackingUp ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'
                  }`}
                >
                  {/* OQ #5 LOCKED 확장 — DB 백업 svg path verbatim 인라인 유지 */}
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                  {dbBackingUp ? '백업 중...' : '백업'}
                </button>
                <button
                  onClick={handleDbRestore}
                  disabled={dbRestoring}
                  className={`flex-1 h-10 bg-surface-sunken border border-border-default rounded-[9px] text-label font-bold text-text-primary flex items-center justify-center gap-1.5 ${
                    dbRestoring ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'
                  }`}
                >
                  {/* OQ #5 LOCKED 확장 — DB 복원 svg path verbatim 인라인 유지 */}
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  {dbRestoring ? '복원 중...' : '업로드'}
                </button>
              </div>
              {/* ── 자동백업 인라인 펼침 Row ─────────────────── */}
              <div className="mb-2.5">
                <div
                  onClick={toggleAutoBackup}
                  className="flex items-center justify-between cursor-pointer mb-2.5"
                >
                  <div>
                    <div className="text-body font-medium text-text-primary">자동백업</div>
                    <div className="text-caption text-text-tertiary mt-px">매일 03:32 생성 · 14일 보관</div>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`text-text-tertiary transition-transform duration-150 ${autoBackupOpen ? 'rotate-90' : ''}`}
                  />
                </div>
                {autoBackupOpen && (
                  <div>
                    {autoBackupLoading && (
                      <div className="text-caption text-text-tertiary px-3 py-2">불러오는 중...</div>
                    )}
                    {!autoBackupLoading && autoBackupList.length === 0 && (
                      <div className="text-caption text-text-tertiary px-3 py-2">자동백업 없음</div>
                    )}
                    {!autoBackupLoading && autoBackupList.map(item => (
                      <div
                        key={item.key}
                        onClick={() => downloadAutoBackup(item)}
                        className={`flex items-center justify-between px-3 py-2 bg-surface-sunken rounded-[9px] mb-[5px] ${
                          autoBackupDownloading === item.key ? 'opacity-50 cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <div>
                          <span className="text-body font-medium text-text-primary">{item.date}</span>
                          <span className="text-caption text-text-tertiary ml-2">{(item.size / 1048576).toFixed(1)}MB</span>
                        </div>
                        {autoBackupDownloading === item.key
                          ? <Loader2 size={16} className="text-text-tertiary animate-spin" />
                          : <Download size={16} className="text-text-tertiary" />
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-caption text-text-tertiary mb-1">파일 (점검 사진 등)</div>
              <div className="flex gap-2">
                <button
                  onClick={handleR2Backup}
                  disabled={r2BackingUp}
                  className={`flex-1 h-10 bg-surface-sunken border border-border-default rounded-[9px] text-label font-bold text-text-primary flex items-center justify-center gap-1.5 ${
                    r2BackingUp ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'
                  }`}
                >
                  {/* OQ #5 LOCKED 확장 — R2 백업 svg path verbatim 인라인 유지 */}
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {r2BackingUp ? (r2BackupProgress || '백업 중...') : '백업'}
                </button>
                <button
                  onClick={handleR2Restore}
                  disabled={r2Restoring}
                  className={`flex-1 h-10 bg-surface-sunken border border-border-default rounded-[9px] text-label font-bold text-text-primary flex items-center justify-center gap-1.5 ${
                    r2Restoring ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'
                  }`}
                >
                  {/* OQ #5 LOCKED 확장 — R2 복원 svg path verbatim 인라인 유지 */}
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  {r2Restoring ? '복원 중...' : '업로드'}
                </button>
              </div>
            </>)}
          </div>
        )}

        {/* 앱 정보 */}
        <div className="px-[13px] pt-3 pb-1.5">
          <SectionHeader label="앱 정보" collapsed={appInfoCollapsed} onToggle={() => setAppInfoCollapsed(c => !c)} />
          {!appInfoCollapsed && (
            <>
              <Row label="버전" sub={`v${__APP_VERSION__} (${__BUILD_TIME__})`} />
              <Row
                label={cacheClearing ? '초기화 중…' : '캐시 초기화'}
                sub="최신 리소스로 새로고침"
                onClick={cacheClearing ? undefined : handleClearCache}
              >
                <ChevronRight size={13} className="text-text-tertiary" />
              </Row>
              <Row label="차바이오컴플렉스 방재" sub="경기도 성남시 분당구 판교로 335" />
            </>
          )}
        </div>

        {/* 로그아웃 — W6 §10 cheatsheet — raw #dc2626 / rgba(220,38,38,...) → token (bg-danger/text-danger) */}
        <div className="px-[13px] py-3">
          <button
            onClick={handleLogout}
            className="w-full h-10 bg-danger/10 text-danger border border-danger/25 rounded-[9px] text-label font-bold cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>

    </>
  )
}
