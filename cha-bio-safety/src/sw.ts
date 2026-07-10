/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// 런타임 캐시: 도면 (CacheFirst) — vite.config.ts workbox.runtimeCaching에서 이전
registerRoute(
  ({ url }) => /\/floorplans\/.+\.(svg|png|pdf)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'floorplan-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 30 * 24 * 3600 })],
  })
)

// 화재수신반 실시간 경로는 SW 캐시 우회 (2초 폴 신선도 보장) — 일반 /api/ NetworkFirst 보다 먼저 매칭.
registerRoute(
  ({ request, url }) => request.method === 'GET' &&
    (url.pathname.startsWith('/api/public/panel/') || url.pathname === '/api/panel/status'),
  new NetworkOnly()
)

// 런타임 캐시: API GET (NetworkFirst) — vite.config.ts workbox.runtimeCaching에서 이전
registerRoute(
  ({ request, url }) => request.method === 'GET' && /\/api\//.test(url.pathname),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 300 })],
  })
)

// ── 푸시 알림 핸들러 ─────────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return
  try {
    // 백엔드 §1.4 superset payload {kind,alarmType,alarmId,location,detectedAt,url} 중
    // 딥링크에 필요한 url + alarmType 을 notification.data 로 전달 (구 payload 는 undefined 로 안전)
    const { title, body, type, url, alarmType } = event.data.json()
    event.waitUntil(
      self.registration.showNotification(title || 'CBC 방재', {
        body: body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: type || 'default',
        data: { type, url, alarmType },
      })
    )
  } catch (e) {
    console.error('Push event parse error:', e)
  }
})

// ── 알림 클릭 핸들러 — 딥링크 이동 ─────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  // 목적지: data.url (백엔드 per-type url = /fire-alarm) 우선.
  // url 없는 레거시/비-패널 푸시(일일·일정 리마인더 등)는 루트로 — 회귀 방지 (prod 260701-pnl).
  const data = event.notification.data || {}
  const fallback =
    data.alarmType === 'equip' || data.type === 'equip'
      ? '/inspection?panel=fire-alarm'
      : '/'
  const url = data.url || fallback
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) {
        // navigate 후 focus (WindowClient.navigate 미지원 환경은 focus 로 폴백)
        return typeof existing.navigate === 'function'
          ? existing.navigate(url).then(c => (c ? c.focus() : existing.focus()))
          : existing.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
