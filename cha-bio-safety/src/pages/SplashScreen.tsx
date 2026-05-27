import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { InstallPrompt, shouldShowInstallPrompt, dismissInstallPrompt } from '../components/InstallPrompt'
import { checkVersionAndRefresh } from '../utils/versionCheck'

export default function SplashScreen() {
  const [pct, setPct] = useState(0)
  const [showInstall, setShowInstall] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // 버전 체크 — 결과를 기다리지 않고 스플래쉬 진행.
    // 버전 mismatch면 내부에서 location.reload()가 호출되어 이 컴포넌트가 재마운트된다.
    void checkVersionAndRefresh()

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
    <div className="bg-surface-page min-h-[100dvh] flex flex-col items-center justify-center gap-0">
      {/* 로고 */}
      <div className="[animation:slideUp_.4s_ease-out] flex flex-col items-center gap-5 mb-14">
        <div className="relative">
          <div className="rounded-[22px] w-[88px] h-[88px] bg-[rgba(37,99,235,0.2)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center overflow-hidden">
            <img src="/icons/icon-192.png" alt="" className="w-16 h-16 rounded-[14px]" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-heading font-black tracking-tight text-text-primary m-0">CBC 방재</h1>
          <p className="text-caption leading-relaxed text-text-tertiary mt-[6px] tracking-[.1em]">소방안전 통합관리 시스템</p>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="w-40">
        <div className="h-[2px] bg-[rgba(255,255,255,0.07)] rounded-[2px] overflow-hidden">
          <div className="bg-accent h-full rounded-[2px] transition-[width] duration-[50ms] ease-linear" style={{ width:`${pct}%` }} />
        </div>
        <p className="text-caption leading-none text-text-tertiary text-center mt-[10px]">
          {pct < 40 ? '시스템 초기화 중...' : pct < 80 ? '데이터 불러오는 중...' : '준비 완료'}
        </p>
      </div>

      <p className="text-caption leading-none text-text-disabled absolute bottom-5">v{__APP_VERSION__} · 경기도 성남시 분당구</p>

      {/* PWA 설치 팝업 */}
      {showInstall && <InstallPrompt onDismiss={handleDismiss} />}

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
