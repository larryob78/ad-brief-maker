/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        dublin: {
          green: "#00A86B",
          dark: "#0D1117",
        },
        napkin: {
          orange: "#FF6B35",
          yellow: "#FFD93D",
        },
        runway: {
          purple: "#6366F1",
          blue: "#3B82F6",
        },
      },
    },
  },
  plugins: [],
};
