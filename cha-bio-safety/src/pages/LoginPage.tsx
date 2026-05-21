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
      <div className="bg-surface-raised border border-border-default" style={{ borderRadius:16, padding:16, marginBottom:12 }}>
        <p className="text-caption font-bold uppercase tracking-wider text-text-tertiary leading-none" style={{ marginBottom:12 }}>담당자 선택</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {staffList.map((s, i) => {
            const isSelected = selected === s.id
            const c = CARD_COLORS[i % CARD_COLORS.length]
            const initial = s.name.charAt(0)
            const titleLabel = s.role === 'admin' ? '관리자' : s.title
            return (
              <button
                key={s.id}
                onClick={() => selectStaff(s.id)}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:10,
                  borderRadius:12, border:`1px solid ${isSelected ? 'rgba(59,130,246,0.6)' : c.border}`,
                  background: isSelected ? 'rgba(59,130,246,0.12)' : c.color,
                  cursor:'pointer', textAlign:'left', transition:'all .13s',
                }}
              >
                <div className="w-[34px] h-[34px] rounded-[10px]" style={{ background:isSelected?'#2563eb':c.border, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>
                  <span className="text-body font-bold leading-none">{initial}</span>
                </div>
                <div>
                  <div className="text-label font-bold text-text-primary leading-none" style={{ marginBottom:4 }}>{s.name}</div>
                  <div className="text-caption text-text-tertiary leading-none">{titleLabel}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="bg-surface-raised border border-border-default" style={{ borderRadius:16, padding:16 }}>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label className="text-label font-bold leading-none text-text-secondary" style={{ display:'block', marginBottom:6 }}>사번</label>
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
            <label className="text-label font-bold leading-none text-text-secondary" style={{ display:'block', marginBottom:6 }}>비밀번호</label>
            <div style={{ position:'relative' }}>
              <input
                ref={pwRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="비밀번호 입력"
                className={inputClass}
                style={{ padding:'12px 44px 12px 14px', borderRadius:12, fontSize:14, outline:'none', transition:'border-color .15s' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="text-text-tertiary"
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:13 }}
              >
                {showPw ? '숨김' : '표시'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={loading ? 'bg-surface-sunken text-text-tertiary font-bold' : 'bg-safe-bar text-text-on-accent font-bold'}
            style={{
              padding:'14px', borderRadius:12, border:'none',
              fontSize:14, cursor:loading?'not-allowed':'pointer',
              transition:'all .13s', marginTop:4,
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      <p className="text-caption leading-relaxed text-text-tertiary" style={{ textAlign:'center', marginTop:20 }}>
        초기 비밀번호: 사번 뒤 4자리<br/>
        문의: 방재팀 내선 ☎ 031-881-7119
      </p>
    </>
  )

  // ── 데스크톱 레이아웃 (768px 이상) ──────────────────────
  if (isDesktop) {
    return (
      <div className="bg-surface-page" style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <div className="bg-surface-raised border border-border-default" style={{ maxWidth:420, width:'100%', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', overflow:'hidden' }}>
          {/* 카드 헤더 */}
          <div className="bg-surface-raised border-b border-border-default" style={{ padding:'24px 24px 20px' }}>
            <div className="flex items-center" style={{ gap:12 }}>
              <div className="w-[38px] h-[38px] rounded-[11px]" style={{ background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                <img src="/icons/icon-192.png" alt="" className="w-[28px] h-[28px] rounded-[7px]" />
              </div>
              <div>
                <div className="text-body font-bold text-text-primary">차바이오컴플렉스 방재팀</div>
                <div className="text-caption text-text-tertiary leading-none" style={{ marginTop:2 }}>소방안전 통합관리 시스템</div>
              </div>
            </div>
          </div>
          {/* 카드 바디 */}
          <div style={{ padding:'16px 16px 24px' }}>
            {inner}
          </div>
        </div>
      </div>
    )
  }

  // ── 모바일 레이아웃 (768px 미만) — 기존 유지 ────────────
  return (
    <div className="bg-surface-page" style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      {/* 상단 헤더 */}
      <div className="bg-surface-raised border-b border-border-default" style={{ padding:'16px 20px 24px' }}>
        <div className="flex items-center" style={{ gap:12, marginTop:16 }}>
          <div className="w-[38px] h-[38px] rounded-[11px]" style={{ background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
            <img src="/icons/icon-192.png" alt="" className="w-[28px] h-[28px] rounded-[7px]" />
          </div>
          <div>
            <div className="text-body font-bold text-text-primary">차바이오컴플렉스 방재팀</div>
            <div className="text-caption text-text-tertiary leading-none" style={{ marginTop:2 }}>소방안전 통합관리 시스템</div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, padding:'16px 16px 32px', overflowY:'auto' }}>
        {inner}
      </div>
    </div>
  )
}
