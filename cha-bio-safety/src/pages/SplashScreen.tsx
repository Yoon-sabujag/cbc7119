import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function SplashScreen() {
  const [pct, setPct] = useState(0)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const tick = setInterval(() => setPct(p => Math.min(p + 4, 100)), 48)
    const nav  = setTimeout(() => navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true }), 1600)
    return () => { clearInterval(tick); clearTimeout(nav) }
  }, [isAuthenticated, navigate])

  return (
    <div style={{
      minHeight:'100dvh', background:'#161b22',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:0,
    }}>
      {/* 로고 */}
      <div style={{ animation:'slideUp .4s ease-out', display:'flex', flexDirection:'column', alignItems:'center', gap:20, marginBottom:56 }}>
        <div style={{ position:'relative' }}>
          <div style={{
            width:88, height:88, borderRadius:22,
            background:'rgba(37,99,235,0.2)',
            border:'1px solid rgba(59,130,246,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width={48} height={48} viewBox="0 0 52 52" fill="none">
              <path d="M26 8C26 8 18 18 18 26C18 30.4 21.6 34 26 34C30.4 34 34 30.4 34 26C34 22 32 18 28 14C28 14 30 20 26 22C22 20 26 8 26 8Z" fill="#f97316"/>
              <path d="M26 22C24 24 22 26 22 28C22 30.2 23.8 32 26 32C28.2 32 30 30.2 30 28C30 26 28 24 26 22Z" fill="#fde68a"/>
              <path d="M14 36V42C14 45.3 19.4 48 26 48C32.6 48 38 45.3 38 42V36H14Z" fill="none" stroke="#93c5fd" strokeWidth={1.5} strokeLinejoin="round"/>
              <line x1="14" y1="36" x2="38" y2="36" stroke="#93c5fd" strokeWidth={1.5} strokeLinecap="round"/>
              <text x="26" y="44" textAnchor="middle" fontSize="9" fontWeight="600" fill="#93c5fd">방재</text>
            </svg>
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <h1 style={{ fontSize:22, fontWeight:900, color:'#e6edf3', margin:0, letterSpacing:'-.02em' }}>차바이오컴플렉스</h1>
          <p style={{ fontSize:12, color:'#6e7681', margin:'6px 0 0', letterSpacing:'.1em' }}>소방안전 통합관리 시스템</p>
        </div>
      </div>

      {/* 진행 바 */}
      <div style={{ width:160 }}>
        <div style={{ height:2, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,#3b82f6,#0ea5e9)', borderRadius:2, width:`${pct}%`, transition:'width .05s linear' }} />
        </div>
        <p style={{ fontSize:11, color:'#6e7681', textAlign:'center', marginTop:10 }}>
          {pct < 40 ? '시스템 초기화 중...' : pct < 80 ? '데이터 불러오는 중...' : '준비 완료'}
        </p>
      </div>

      <p style={{ position:'absolute', bottom:20, fontSize:10, color:'#3d444d' }}>v1.0.0 · 경기도 성남시 분당구</p>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
