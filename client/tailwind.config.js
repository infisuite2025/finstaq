/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finstaq: {
          dark: '#0f172a',
          sidebar: '#1e293b',
          accent: '#2563eb',
          gold: '#f59e0b',
          rowHover: '#f8fafc',
          activeCell: '#e0f2fe',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
        sans: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
