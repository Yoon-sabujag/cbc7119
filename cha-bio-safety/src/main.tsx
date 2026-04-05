import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Polyfill: Promise.withResolvers + Promise.try (Chrome < 128, Windows 7 등)
if (typeof (Promise as any).withResolvers !== 'function') {
  ;(Promise as any).withResolvers = function () {
    let resolve: any, reject: any
    const promise = new Promise((res, rej) => { resolve = res; reject = rej })
    return { promise, resolve, reject }
  }
}
if (typeof (Promise as any).try !== 'function') {
  ;(Promise as any).try = function (fn: () => any) {
    return new Promise((resolve) => resolve(fn()))
  }
}

// 서비스워커 캐시 강제 클리어 (v3 마이그레이션)
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      if (name.includes('floorplan') || name.includes('workbox-precache')) {
        caches.delete(name)
        console.log('[cache] deleted:', name)
      }
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
