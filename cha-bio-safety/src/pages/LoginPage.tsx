import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { authApi, staffApi, ApiError } from '../utils/api'
import type { StaffFull } from '../types'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

const CARD_COLORS = [
  { color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
  { color: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)'   },
  { color: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)'  },
  { color: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)'  },
  { color: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.3)'  },
  { color: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.3)'  },
]

export default function LoginPage() {
  const [staffId,  setStaffId]  = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [staffList, setStaffList] = useState<StaffFull[]>([])
  const pwRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    fetch('/api/public/staff-list').then(r => r.json()).then((j: any) => {
      if (j.success) setStaffList(j.data)
    }).catch(() => {})
  }, [])

  const selectStaff = (id: string) => {
    setSelected(id)
    setStaffId(id)
    setPassword('')
    setTimeout(() => pwRef.current?.focus(), 80)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!staffId.trim())  { toast.error('사번을 입력하세요'); return }
    if (!password.trim()) { toast.error('비밀번호를 입력하세요'); return }
    setLoading(true)
    try {
      const res = await authApi.login(staffId.trim(), password)
      login(res.token, res.staff)
      toast.success(`${res.staff.name}님, 안녕하세요!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : '로그인 실패')
      setPassword('')
      pwRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  // input className + 인라인 style 분리 (inputStyle 객체 분해, W5 §3.3)
  const inputClass = 'w-full bg-surface-sunken border border-border-strong text-text-primary'
  const inputInline: React.CSSProperties = {
    padding: '12px 14px', borderRadius: 12, fontSize: 14, outline: 'none',
    transition: 'border-color .15s',
  }

  // ── 공통 내부 콘텐츠 ────────────────────────────────────
  const inner = (
    <>
      {/* 담당자 선택 */}
      <div className="bg-surface-raised border border-border-default rounded-lg p-4 mb-3">
        <p className="text-caption font-bold uppercase tracking-wider text-text-tertiary leading-none mb-3">담당자 선택</p>
        <div className="grid grid-cols-2 gap-2">
          {staffList.map((s, i) => {
            const isSelected = selected === s.id
            const c = CARD_COLORS[i % CARD_COLORS.length]
            const initial = s.name.charAt(0)
            const titleLabel = s.role === 'admin' ? '관리자' : s.title
            return (
              <button
                key={s.id}
                onClick={() => selectStaff(s.id)}
                className="flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer text-left transition-all duration-[130ms]"
                style={{
                  borderColor: isSelected ? 'rgba(59,130,246,0.6)' : c.border,
                  background: isSelected ? 'rgba(59,130,246,0.12)' : c.color,
                }}
              >
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-white shrink-0" style={{ background:isSelected?'#2563eb':c.border }}>
                  <span className="text-body font-bold leading-none">{initial}</span>
                </div>
                <div>
                  <div className="text-label font-bold text-text-primary leading-none mb-1">{s.name}</div>
                  <div className="text-caption text-text-tertiary leading-none">{titleLabel}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="bg-surface-raised border border-border-default rounded-lg p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-label font-bold leading-none text-text-secondary block mb-[6px]">사번</label>
            <input
              type="text"
              inputMode="numeric"
              value={staffId}
              onChange={e => { setStaffId(e.target.value); setSelected(null) }}
              placeholder="사번 10자리"
              className={inputClass}
              style={inputInline}
            />
          </div>
          <div>
            <label className="text-label font-bold leading-none text-text-secondary block mb-[6px]">비밀번호</label>
            <div className="relative">
              <input
                ref={pwRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="비밀번호 입력"
                className={`${inputClass} pl-[14px] pr-[44px] py-3 rounded-md text-[14px] outline-none transition-[border-color] duration-150`}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="text-text-tertiary absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-[13px]"
              >
                {showPw ? '숨김' : '표시'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`${loading ? 'bg-surface-sunken text-text-tertiary' : 'bg-safe-bar text-text-on-accent'} font-bold p-[14px] rounded-md border-0 text-[14px] transition-all duration-[130ms] mt-1 ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      <p className="text-caption leading-relaxed text-text-tertiary text-center mt-5">
        초기 비밀번호: 사번 뒤 4자리<br/>
        문의: 방재팀 내선 ☎ 031-881-7119
      </p>
    </>
  )

  // ── 데스크톱 레이아웃 (768px 이상) ──────────────────────
  if (isDesktop) {
    return (
      <div className="bg-surface-page min-h-[100dvh] flex items-center justify-center p-5">
        <div className="bg-surface-raised border border-border-default max-w-[420px] w-full rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* 카드 헤더 */}
          <div className="bg-surface-raised border-b border-border-default pt-6 px-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-[11px] bg-[rgba(37,99,235,0.2)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center overflow-hidden shrink-0">
                <img src="/icons/icon-192.png" alt="" className="w-[28px] h-[28px] rounded-[7px]" />
              </div>
              <div>
                <div className="text-body font-bold text-text-primary">차바이오컴플렉스 방재팀</div>
                <div className="text-caption text-text-tertiary leading-none mt-[2px]">소방안전 통합관리 시스템</div>
              </div>
            </div>
          </div>
          {/* 카드 바디 */}
          <div className="px-4 pt-4 pb-6">
            {inner}
          </div>
        </div>
      </div>
    )
  }

  // ── 모바일 레이아웃 (768px 미만) — 기존 유지 ────────────
  return (
    <div className="bg-surface-page min-h-[100dvh] flex flex-col">
      {/* 상단 헤더 */}
      <div className="bg-surface-raised border-b border-border-default pt-4 px-5 pb-6">
        <div className="flex items-center gap-3 mt-4">
          <div className="w-[38px] h-[38px] rounded-[11px] bg-[rgba(37,99,235,0.2)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center overflow-hidden shrink-0">
            <img src="/icons/icon-192.png" alt="" className="w-[28px] h-[28px] rounded-[7px]" />
          </div>
          <div>
            <div className="text-body font-bold text-text-primary">차바이오컴플렉스 방재팀</div>
            <div className="text-caption text-text-tertiary leading-none mt-[2px]">소방안전 통합관리 시스템</div>
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 pt-4 pb-[32px] overflow-y-auto">
        {inner}
      </div>
    </div>
  )
}
