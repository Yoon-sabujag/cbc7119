import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { InstallPrompt, shouldShowInstallPrompt, dismissInstallPrompt } from '../components/InstallPrompt'

export default function SplashScreen() {
  const [pct, setPct] = useState(0)
  const [showInstall, setShowInstall] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const tick = setInterval(() => setPct(p => Math.min(p + 4, 100)), 48)

    const nav = setTimeout(() => {
      if (shouldShowInstallPrompt()) {
        setShowInstall(true)
      } else {
        navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })
      }
    }, 1600)

    return () => { clearInterval(tick); clearTimeout(nav) }
  }, [isAuthenticated, navigate])

  function handleDismiss() {
    dismissInstallPrompt()
    setShowInstall(false)
    navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })
  }

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
            overflow: 'hidden',
          }}>
            <img src="/icons/icon-192.png" alt="" style={{ width: 64, height: 64, borderRadius: 14 }} />
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <h1 style={{ fontSize:22, fontWeight:900, color:'#e6edf3', margin:0, letterSpacing:'-.02em' }}>CBC 방재</h1>
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

      {/* PWA 설치 팝업 */}
      {showInstall && <InstallPrompt onDismiss={handleDismiss} />}

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
