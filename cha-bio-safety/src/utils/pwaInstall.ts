// PWA 설치 프롬프트 조기 캡처 유틸
// 크롬/안드로이드는 페이지 로드 직후 beforeinstallprompt 이벤트를
// 단 한 번만 발사하므로, React 렌더보다 먼저 리스너를 걸어야 한다.
// main.tsx에서 import만 해도 side-effect로 리스너가 등록된다.

type PromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

let deferredPrompt: PromptEvent | null = null
const listeners = new Set<(e: PromptEvent | null) => void>()

function notify() {
  listeners.forEach(fn => fn(deferredPrompt))
}

window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault()
  deferredPrompt = e as PromptEvent
  notify()
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  notify()
})

export function getDeferredInstallPrompt(): PromptEvent | null {
  return deferredPrompt
}

export function subscribeInstallPrompt(fn: (e: PromptEvent | null) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export async function showInstallPrompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const p = deferredPrompt
  if (!p) return 'unavailable'
  try {
    await p.prompt()
    const { outcome } = await p.userChoice
    if (outcome === 'accepted') {
      deferredPrompt = null
      notify()
    }
    return outcome
  } catch {
    return 'unavailable'
  }
}
