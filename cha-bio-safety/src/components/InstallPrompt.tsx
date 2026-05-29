import { useState, useEffect } from 'react'
import { getDeferredInstallPrompt, subscribeInstallPrompt, showInstallPrompt } from '../utils/pwaInstall'

// PWA 설치 여부 확인
function isStandalone(): boolean {
  if ((window.navigator as any).standalone === true) return true // iOS
  if (window.matchMedia('(display-mode: standalone)').matches) return true // Android
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true
  return false
}

function isIOS(): boolean {
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return true
  // iPadOS 13+ reports as Macintosh with touch support
  if (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1) return true
  return false
}

/**
 * PWA 미설치 시 스플래시에서 강제 표시되는 설치 안내 팝업.
 * - Android: beforeinstallprompt 이벤트로 네이티브 설치 팝업
 * - iOS: Safari 공유 → 홈 화면에 추가 안내
 * - 이미 PWA로 실행 중이면 표시 안 함
 */
export function InstallPrompt({ onDismiss }: { onDismiss: () => void }) {
  // pwaInstall 유틸이 모듈 로드 시점에 이미 이벤트를 캡처해뒀으므로
  // mount 시 즉시 값이 있을 수 있음. 아직 안 왔다면 구독해서 기다림.
  const [hasPrompt, setHasPrompt] = useState<boolean>(() => !!getDeferredInstallPrompt())
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [showAndroidGuide, setShowAndroidGuide] = useState(false)

  useEffect(() => {
    const unsub = subscribeInstallPrompt(p => setHasPrompt(!!p))
    return unsub
  }, [])

  // Android 네이티브 설치
  async function handleInstallAndroid() {
    const outcome = await showInstallPrompt()
    if (outcome === 'accepted') {
      onDismiss()
    } else if (outcome === 'unavailable') {
      // 브라우저가 아직 설치 가능 이벤트를 발사하지 않았거나 이미 설치됨
      // → 수동 설치 가이드 표시
      setShowAndroidGuide(true)
    }
    // 'dismissed': 사용자가 팝업에서 취소 → 아무것도 안 함
  }

  // iOS 안내
  function handleInstallIOS() {
    setShowIOSGuide(true)
  }

  const ios = isIOS()

  return (
    <div className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.85)] flex items-center justify-center p-6">
      <div className="bg-surface-raised rounded-[20px] px-6 pt-7 pb-7 max-w-[340px] w-full text-center border border-[rgba(59,130,246,0.3)] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        {/* 아이콘 */}
        <div className="rounded-lg w-16 h-16 mx-auto mb-4 bg-[rgba(37,99,235,0.2)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center">
          <img src="/icons/icon-192.png" alt="" className="w-12 h-12 rounded-xl" />
        </div>

        <h2 className="text-title font-extrabold text-text-primary mb-2 mt-0">
          CBC 방재
        </h2>
        <p className="text-caption leading-relaxed text-text-secondary mb-5 mt-0">
          홈 화면에 앱을 설치하면<br/>더 빠르고 편리하게 사용할 수 있습니다
        </p>

        {!showIOSGuide && !showAndroidGuide ? (
          <div className="flex flex-col gap-2.5">
            <button
              onClick={ios ? handleInstallIOS : handleInstallAndroid}
              className="bg-safe-bar text-text-on-accent text-body font-bold rounded-md w-full h-12 border-0 cursor-pointer"
            >
              {ios ? '설치 방법 보기' : hasPrompt ? '홈 화면에 설치' : '설치 방법 보기'}
            </button>
            <button
              onClick={onDismiss}
              className="text-caption font-bold leading-none text-text-tertiary rounded-md w-full h-10 bg-transparent border border-[rgba(255,255,255,0.1)] cursor-pointer"
            >
              나중에 할게요
            </button>
          </div>
        ) : showAndroidGuide ? (
          /* Android Chrome 수동 설치 가이드 (이벤트 미발사 fallback) */
          <div className="text-left">
            <div className="text-caption leading-relaxed text-warning bg-warning-bg border border-warning/25 rounded-sm px-2.5 py-2 mb-3.5">
              자동 설치 창이 뜨지 않으면 아래 순서로 설치해 주세요.
            </div>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-start gap-3">
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center">1</div>
                <div>
                  <div className="text-label leading-none text-text-primary font-bold">크롬 우상단 <span style={{ fontSize: 16 }}>⋮</span> 메뉴</div>
                  <div className="text-caption leading-relaxed text-text-secondary mt-0.5">주소창 오른쪽 점 세 개 메뉴를 누르세요</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center">2</div>
                <div>
                  <div className="text-label leading-none text-text-primary font-bold">'앱 설치' 또는 '홈 화면에 추가' 선택</div>
                  <div className="text-caption leading-relaxed text-text-secondary mt-0.5">메뉴에서 <strong className="text-text-primary">앱 설치</strong>(또는 <strong className="text-text-primary">홈 화면에 추가</strong>)를 누르세요</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center">3</div>
                <div>
                  <div className="text-label leading-none text-text-primary font-bold">'설치' 확인</div>
                  <div className="text-caption leading-relaxed text-text-secondary mt-0.5">팝업에서 <strong className="text-text-primary">설치</strong>를 누르면 완료</div>
                </div>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="bg-accent/15 text-accent text-label font-bold leading-none rounded-md w-full h-11 mt-[18px] border border-[rgba(59,130,246,0.3)] cursor-pointer"
            >
              확인했습니다
            </button>
          </div>
        ) : (
          /* iOS Safari 설치 가이드 */
          <div className="text-left">
            <div className="flex flex-col gap-3.5">
              <div className="flex items-start gap-3">
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center">1</div>
                <div>
                  <div className="text-label leading-none text-text-primary font-bold">
                    하단 공유 버튼 터치
                  </div>
                  <div className="text-caption leading-relaxed text-text-secondary mt-0.5">
                    Safari 하단의 <span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span> 공유 아이콘을 누르세요
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center">2</div>
                <div>
                  <div className="text-label leading-none text-text-primary font-bold">
                    '홈 화면에 추가' 선택
                  </div>
                  <div className="text-caption leading-relaxed text-text-secondary mt-0.5">
                    스크롤해서 <strong className="text-text-primary">홈 화면에 추가</strong>를 찾아 누르세요
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center">3</div>
                <div>
                  <div className="text-label leading-none text-text-primary font-bold">
                    '추가' 터치
                  </div>
                  <div className="text-caption leading-relaxed text-text-secondary mt-0.5">
                    오른쪽 상단 <strong className="text-text-primary">추가</strong> 버튼을 누르면 완료!
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="bg-accent/15 text-accent text-label font-bold leading-none rounded-md w-full h-11 mt-[18px] border border-[rgba(59,130,246,0.3)] cursor-pointer"
            >
              확인했습니다
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 스플래시에서 사용: PWA 미설치 시 true 반환
 */
export function shouldShowInstallPrompt(): boolean {
  if (isStandalone()) return false
  // 24시간 내 dismiss 했으면 다시 안 보여줌
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    const ts = parseInt(dismissed, 10)
    if (Date.now() - ts < 24 * 60 * 60 * 1000) return false
  }
  return true
}

export function dismissInstallPrompt() {
  localStorage.setItem('pwa-install-dismissed', String(Date.now()))
}
