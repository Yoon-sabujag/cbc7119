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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div
        className="bg-surface-raised rounded-[20px]"
        style={{
          padding: '28px 24px', maxWidth: 340, width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(59,130,246,0.3)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* 아이콘 */}
        <div
          className="rounded-lg"
          style={{
            width: 64, height: 64, margin: '0 auto 16px',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img src="/icons/icon-192.png" alt="" style={{ width: 48, height: 48, borderRadius: 12 }} />
        </div>

        <h2 className="text-title font-extrabold text-text-primary" style={{ margin: '0 0 8px' }}>
          CBC 방재
        </h2>
        <p className="text-caption leading-relaxed text-text-secondary" style={{ margin: '0 0 20px' }}>
          홈 화면에 앱을 설치하면<br/>더 빠르고 편리하게 사용할 수 있습니다
        </p>

        {!showIOSGuide && !showAndroidGuide ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={ios ? handleInstallIOS : handleInstallAndroid}
              className="bg-safe-bar text-text-on-accent text-body font-bold rounded-md"
              style={{
                width: '100%', height: 48,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {ios ? '설치 방법 보기' : hasPrompt ? '홈 화면에 설치' : '설치 방법 보기'}
            </button>
            <button
              onClick={onDismiss}
              className="text-caption font-bold leading-none text-text-tertiary rounded-md"
              style={{
                width: '100%', height: 40,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              나중에 할게요
            </button>
          </div>
        ) : showAndroidGuide ? (
          /* Android Chrome 수동 설치 가이드 (이벤트 미발사 fallback) */
          <div style={{ textAlign: 'left' }}>
            <div className="text-caption leading-relaxed text-warning bg-warning-bg border-warning/25 rounded-sm" style={{ border: '1px solid', padding: '8px 10px', marginBottom: 14 }}>
              자동 설치 창이 뜨지 않으면 아래 순서로 설치해 주세요.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm" style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                <div>
                  <div className="text-label leading-none text-text-primary" style={{ fontWeight: 700 }}>크롬 우상단 <span style={{ fontSize: 16 }}>⋮</span> 메뉴</div>
                  <div className="text-caption leading-relaxed text-text-secondary" style={{ marginTop: 2 }}>주소창 오른쪽 점 세 개 메뉴를 누르세요</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm" style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                <div>
                  <div className="text-label leading-none text-text-primary" style={{ fontWeight: 700 }}>'앱 설치' 또는 '홈 화면에 추가' 선택</div>
                  <div className="text-caption leading-relaxed text-text-secondary" style={{ marginTop: 2 }}>메뉴에서 <strong className="text-text-primary">앱 설치</strong>(또는 <strong className="text-text-primary">홈 화면에 추가</strong>)를 누르세요</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm" style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                <div>
                  <div className="text-label leading-none text-text-primary" style={{ fontWeight: 700 }}>'설치' 확인</div>
                  <div className="text-caption leading-relaxed text-text-secondary" style={{ marginTop: 2 }}>팝업에서 <strong className="text-text-primary">설치</strong>를 누르면 완료</div>
                </div>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="bg-accent/15 text-accent text-label font-bold leading-none rounded-md"
              style={{ width: '100%', height: 44, marginTop: 18, border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer' }}
            >
              확인했습니다
            </button>
          </div>
        ) : (
          /* iOS Safari 설치 가이드 */
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm" style={{
                  width: 28, height: 28, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>1</div>
                <div>
                  <div className="text-label leading-none text-text-primary" style={{ fontWeight: 700 }}>
                    하단 공유 버튼 터치
                  </div>
                  <div className="text-caption leading-relaxed text-text-secondary" style={{ marginTop: 2 }}>
                    Safari 하단의 <span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span> 공유 아이콘을 누르세요
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm" style={{
                  width: 28, height: 28, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>2</div>
                <div>
                  <div className="text-label leading-none text-text-primary" style={{ fontWeight: 700 }}>
                    '홈 화면에 추가' 선택
                  </div>
                  <div className="text-caption leading-relaxed text-text-secondary" style={{ marginTop: 2 }}>
                    스크롤해서 <strong className="text-text-primary">홈 화면에 추가</strong>를 찾아 누르세요
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm" style={{
                  width: 28, height: 28, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>3</div>
                <div>
                  <div className="text-label leading-none text-text-primary" style={{ fontWeight: 700 }}>
                    '추가' 터치
                  </div>
                  <div className="text-caption leading-relaxed text-text-secondary" style={{ marginTop: 2 }}>
                    오른쪽 상단 <strong className="text-text-primary">추가</strong> 버튼을 누르면 완료!
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="bg-accent/15 text-accent text-label font-bold leading-none rounded-md"
              style={{
                width: '100%', height: 44, marginTop: 18,
                border: '1px solid rgba(59,130,246,0.3)',
                cursor: 'pointer',
              }}
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
