import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.10)',
        lift: '0 2px 4px rgba(16,24,40,.04), 0 24px 48px -12px rgba(16,24,40,.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.16,1,.3,1) both',
        'fade-in': 'fade-in .4s ease both',
        'pop-in': 'pop-in .25s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    themes: [
      {
        // ——— 1. LIGHT ———
        uyimiz: {
          primary: '#0f766e',
          'primary-content': '#ffffff',
          secondary: '#0ea5e9',
          'secondary-content': '#ffffff',
          accent: '#f59e0b',
          'accent-content': '#1c1917',
          neutral: '#0f172a',
          'neutral-content': '#f8fafc',
          'base-100': '#ffffff',
          'base-200': '#f6f8f8',
          'base-300': '#e6ebeb',
          'base-content': '#0f172a',
          info: '#0284c7',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '2rem',
          '--animation-btn': '0.2s',
          '--border-btn': '1px',
        },
      },
      {
        // ——— 2. DARK ———
        'uyimiz-dark': {
          primary: '#2dd4bf',
          'primary-content': '#04211e',
          secondary: '#38bdf8',
          'secondary-content': '#04212f',
          accent: '#fbbf24',
          'accent-content': '#211603',
          neutral: '#1e293b',
          'neutral-content': '#e2e8f0',
          'base-100': '#0b1220',
          'base-200': '#111c2e',
          'base-300': '#1c2a41',
          'base-content': '#e6edf6',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '2rem',
          '--animation-btn': '0.2s',
          '--border-btn': '1px',
        },
      },
      {
        // ——— 3. EMERALD ———
        'uyimiz-emerald': {
          primary: '#059669',
          'primary-content': '#ffffff',
          secondary: '#14b8a6',
          'secondary-content': '#ffffff',
          accent: '#84cc16',
          'accent-content': '#132006',
          neutral: '#052e26',
          'neutral-content': '#ecfdf5',
          'base-100': '#f7fdfa',
          'base-200': '#e8f7f0',
          'base-300': '#d1ede1',
          'base-content': '#0b2e25',
          info: '#0891b2',
          success: '#16a34a',
          warning: '#ca8a04',
          error: '#e11d48',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '2rem',
          '--animation-btn': '0.2s',
          '--border-btn': '1px',
        },
      },
      {
        // ——— 4. SAND ———
        'uyimiz-sand': {
          primary: '#b45309',
          'primary-content': '#fffbeb',
          secondary: '#78716c',
          'secondary-content': '#fafaf9',
          accent: '#0f766e',
          'accent-content': '#ffffff',
          neutral: '#292524',
          'neutral-content': '#fafaf9',
          'base-100': '#fffdf8',
          'base-200': '#f7f1e7',
          'base-300': '#e9dfd0',
          'base-content': '#2b2019',
          info: '#0369a1',
          success: '#15803d',
          warning: '#b45309',
          error: '#b91c1c',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '2rem',
          '--animation-btn': '0.2s',
          '--border-btn': '1px',
        },
      },
    ],
  },
}
