/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'system-ui', 'sans-serif', 'Noto Color Emoji'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg:'var(--bg)',bg2:'var(--bg2)',bg3:'var(--bg3)',bg4:'var(--bg4)',
        t1:'var(--t1)',t2:'var(--t2)',t3:'var(--t3)',
        acl:'var(--acl)',info:'var(--info)',safe:'var(--safe)',
        warn:'var(--warn)',danger:'var(--danger)',fire:'var(--fire)',
      },
      animation: {
        'slide-up': 'slideUp 0.28s ease-out both',
        'blink':    'blink 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
