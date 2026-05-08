/**
 * Tailwind 설정 v0.1.0
 *
 * 디자인 토큰 (tokens.css의 CSS 변수)을 Tailwind utility로 노출.
 * 모바일/데스크톱 분기는 CSS 변수가 자동 처리하므로 컴포넌트에서 lg:* 같은 분기 필요 없음.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  // data-theme="dark" 시 dark: utility 활성화 (사용 시)
  darkMode: ['selector', '[data-theme="dark"]'],

  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'D2 Coding', 'monospace'],
      },

      fontSize: {
        caption:   ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        label:     ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        body:      ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        title:     ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        heading:   ['22px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        display:   ['28px', { lineHeight: '1.0', fontWeight: '500', letterSpacing: '-0.02em' }],
      },

      colors: {
        // Surface
        'surface-page':    'var(--surface-page)',
        'surface-raised':  'var(--surface-raised)',
        'surface-sunken':  'var(--surface-sunken)',
        'surface-active':  'var(--surface-active)',
        'surface-overlay': 'var(--surface-overlay)',

        // Text — 사용 예: text-text-primary
        'text-primary':    'var(--text-primary)',
        'text-secondary':  'var(--text-secondary)',
        'text-tertiary':   'var(--text-tertiary)',
        'text-disabled':   'var(--text-disabled)',
        'text-on-accent':  'var(--text-on-accent)',
        'text-link':       'var(--text-link)',

        // Border — 사용 예: border-border-default
        'border-default':  'var(--border-default)',
        'border-strong':   'var(--border-strong)',
        'border-focus':    'var(--border-focus)',

        // Accent
        accent:            'var(--accent)',
        'accent-hover':    'var(--accent-hover)',
        'accent-active':   'var(--accent-active)',

        // Status — foreground
        safe:    'var(--status-safe)',
        warning: 'var(--status-warning)',
        danger:  'var(--status-danger)',
        info:    'var(--status-info)',
        fire:    'var(--status-fire)',

        // Status — bar (좌측 색바)
        'safe-bar':    'var(--status-safe-bar)',
        'warning-bar': 'var(--status-warning-bar)',
        'danger-bar':  'var(--status-danger-bar)',
        'info-bar':    'var(--status-info-bar)',
        'fire-bar':    'var(--status-fire-bar)',

        // Status — bg (배지 채움)
        'safe-bg':    'var(--status-safe-bg)',
        'warning-bg': 'var(--status-warning-bg)',
        'danger-bg':  'var(--status-danger-bg)',
        'info-bg':    'var(--status-info-bg)',
        'fire-bg':    'var(--status-fire-bg)',

        // Duty (근무)
        'duty-day':    'var(--duty-day)',
        'duty-night':  'var(--duty-night)',
        'duty-off':    'var(--duty-off)',
        'duty-leave':  'var(--duty-leave)',
      },

      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        pill: '99px',
      },

      spacing: {
        // primitive (Tailwind 기본도 4pt이지만 명시)
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '32px',
        '8': '48px',

        // semantic (CSS 변수 통해 모바일/데스크톱 자동 분기)
        'card':       'var(--card-padding)',
        'card-sm':    'var(--card-padding-sm)',
        'card-gap':   'var(--card-gap)',
        'modal':      'var(--modal-padding)',
        'section':    'var(--section-gap)',
        'page':       'var(--page-padding)',
      },

      height: {
        input:  'var(--input-height)',
        button: 'var(--button-height)',
      },
      minHeight: {
        input:  'var(--input-height)',
        button: 'var(--button-height)',
      },
    },
  },

  plugins: [],
};
