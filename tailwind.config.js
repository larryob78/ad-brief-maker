/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0d0d0d',
        'surface-light': '#1a1a1a',
        'surface-lighter': '#262626',
        accent: '#ff3b3b',
        'accent-glow': 'rgba(255, 59, 59, 0.3)'
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 59, 59, 0.4)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.3)'
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
