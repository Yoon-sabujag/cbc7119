import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

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
