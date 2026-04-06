import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB — 고해상도 도면 PNG
        globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
        globIgnores: ['**/floorplans/**'], // 도면은 런타임 캐시 사용
      },
      manifest: {
        name: 'CBC 방재',
        short_name: 'CBC 방재',
        description: '차바이오컴플렉스 소방안전 통합관리',
        theme_color: '#161b22',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8788' },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core + react-dependent runtime libs — changes rarely, largest cache benefit
          // Include scheduler + loose-envify + goober (react dep chain) to avoid circular chunks
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/loose-envify/') ||
            id.includes('node_modules/js-tokens/') ||
            id.includes('node_modules/object-assign/') ||
            id.includes('node_modules/goober/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/@remix-run/') ||
            id.includes('node_modules/@tanstack/') ||
            id.includes('node_modules/zustand/') ||
            id.includes('node_modules/react-hot-toast/')
          ) {
            return 'vendor-react';
          }
          // QR libraries
          if (
            id.includes('node_modules/qrcode/') ||
            id.includes('node_modules/qrcode.react/') ||
            id.includes('node_modules/html5-qrcode/')
          ) {
            return 'vendor-qr';
          }
          // All remaining node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
