/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
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
    const { title, body, type } = event.data.json()
    event.waitUntil(
      self.registration.showNotification(title || 'CBC 방재', {
        body: body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: type || 'default',
        data: { type },
      })
    )
  } catch (e) {
    console.error('Push event parse error:', e)
  }
})

// ── 알림 클릭 핸들러 — 앱 루트 열기 ─────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) {
        return existing.focus()
      }
      return self.clients.openWindow('/')
    })
  )
})
