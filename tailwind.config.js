/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        surface: '#1a1a1a',
        'surface-light': '#2a2a2a',
        accent: '#ff4444'
      }
    }
  },
  plugins: []
}
