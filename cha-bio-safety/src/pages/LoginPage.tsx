import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { authApi, ApiError } from '../utils/api'

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

const STAFF_LIST = [
  { id: '2018042451', name: '석현민', title: '관리자',  initial: '석', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
  { id: '2021061451', name: '김병조', title: '주임',    initial: '김', color: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)'   },
  { id: '2022051052', name: '윤종엽', title: '기사',    initial: '윤', color: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)'  },
  { id: '2023071752', name: '박보융', title: '기사',    initial: '박', color: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)'  },
]

export default function LoginPage() {
  const [staffId,  setStaffId]  = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const pwRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const isDesktop = useMediaQuery('(min-width: 768px)')

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

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'12px 14px', borderRadius:12,
    border:'1px solid var(--bd2)', background:'var(--bg3)',
    color:'var(--t1)', fontSize:14, outline:'none',
    transition:'border-color .15s',
  }

  // ── 공통 내부 콘텐츠 ────────────────────────────────────
  const inner = (
    <>
      {/* 담당자 선택 */}
      <div style={{ background:'var(--bg2)', borderRadius:16, padding:16, marginBottom:12, border:'1px solid var(--bd)' }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:12 }}>담당자 선택</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {STAFF_LIST.map(s => {
            const isSelected = selected === s.id
            return (
              <button
                key={s.id}
                onClick={() => selectStaff(s.id)}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:10,
                  borderRadius:12, border:`1px solid ${isSelected ? 'rgba(59,130,246,0.6)' : s.border}`,
                  background: isSelected ? 'rgba(59,130,246,0.12)' : s.color,
                  cursor:'pointer', textAlign:'left', transition:'all .13s',
                }}
              >
                <div style={{ width:34, height:34, borderRadius:10, background:isSelected?'#2563eb':s.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {s.initial}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{s.name}</div>
                  <div style={{ fontSize:10, color:'var(--t3)' }}>{s.title}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 입력 폼 */}
      <div style={{ background:'var(--bg2)', borderRadius:16, padding:16, border:'1px solid var(--bd)' }}>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:6 }}>사번</label>
            <input
              type="text"
              inputMode="numeric"
              value={staffId}
              onChange={e => { setStaffId(e.target.value); setSelected(null) }}
              placeholder="사번 10자리"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--t3)', display:'block', marginBottom:6 }}>비밀번호</label>
            <div style={{ position:'relative' }}>
              <input
                ref={pwRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="비밀번호 입력"
                style={{ ...inputStyle, paddingRight:44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--t3)', cursor:'pointer', fontSize:13 }}
              >
                {showPw ? '숨김' : '표시'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding:'14px', borderRadius:12, border:'none',
              background: loading ? 'var(--bg3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
              color:'#fff', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer',
              transition:'all .13s', marginTop:4,
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      <p style={{ textAlign:'center', fontSize:11, color:'var(--t3)', marginTop:20, lineHeight:1.6 }}>
        초기 비밀번호: 사번 뒤 4자리<br/>
        문의: 방재팀 내선 ☎ 031-881-7119
      </p>
    </>
  )

  // ── 데스크톱 레이아웃 (768px 이상) ──────────────────────
  if (isDesktop) {
    return (
      <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
        <div style={{ maxWidth:420, width:'100%', borderRadius:20, background:'var(--bg2)', border:'1px solid var(--bd)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', overflow:'hidden' }}>
          {/* 카드 헤더 */}
          <div style={{ background:'var(--bg2)', padding:'24px 24px 20px', borderBottom:'1px solid var(--bd)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <img src="/icons/icon-192.png" alt="" style={{ width:28, height:28, borderRadius:7 }} />
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>차바이오컴플렉스 방재팀</div>
                <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>소방안전 통합관리 시스템</div>
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
    <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column' }}>
      {/* 상단 헤더 */}
      <div style={{ background:'var(--bg2)', padding:'16px 20px 24px', borderBottom:'1px solid var(--bd)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:16 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'rgba(37,99,235,0.2)', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            <img src="/icons/icon-192.png" alt="" style={{ width:28, height:28, borderRadius:7 }} />
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>차바이오컴플렉스 방재팀</div>
            <div style={{ fontSize:11, color:'var(--t3)', marginTop:2 }}>소방안전 통합관리 시스템</div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, padding:'16px 16px 32px', overflowY:'auto' }}>
        {inner}
      </div>
    </div>
  )
}
