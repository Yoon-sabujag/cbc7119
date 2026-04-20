// 스플래쉬 진입 시 버전 비교 — 다르면 캐시/SW 초기화 + 강제 리로드.
// 백그라운드 복귀 기반 체크는 입력 손실 위험으로 의도적으로 미도입(LOCKED).

const STORAGE_KEY = 'app_version'
const VERSION_URL = '/version.json'
const FETCH_TIMEOUT_MS = 3000

export async function checkVersionAndRefresh(): Promise<void> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(VERSION_URL, { cache: 'no-store', signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
    if (!res.ok) return
    const data = await res.json() as { version?: string; buildTime?: string }
    const remote = data?.version
    if (!remote || typeof remote !== 'string') return

    const stored = localStorage.getItem(STORAGE_KEY)

    // 최초 실행: 저장만, reload 안 함
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, remote)
      return
    }

    // 동일 버전: 아무 것도 안 함
    if (stored === remote) return

    // 버전 mismatch: 캐시/SW 전부 초기화 후 리로드
    try {
      if ('caches' in window) {
        const names = await caches.keys()
        await Promise.all(names.map(n => caches.delete(n)))
      }
    } catch (_) { /* ignore */ }

    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map(r => r.unregister()))
      }
    } catch (_) { /* ignore */ }

    localStorage.setItem(STORAGE_KEY, remote)
    window.location.reload()
  } catch (_) {
    // 네트워크 실패/abort/JSON 파싱 실패 등 — 스플래쉬 블로킹 금지
    return
  }
}
