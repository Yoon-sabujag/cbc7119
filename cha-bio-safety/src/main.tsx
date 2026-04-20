import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './utils/pwaInstall' // side-effect: beforeinstallprompt 조기 캡처

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
