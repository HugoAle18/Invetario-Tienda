/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d1117',
          secondary: '#161b22',
          card: '#1c2333',
          hover: '#21262d',
          border: '#30363d',
        },
        brand: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#1e3a5f',
          muted: '#93c5fd',
        },
        success: { DEFAULT: '#22c55e', bg: '#14532d', light: '#bbf7d0' },
        danger: { DEFAULT: '#ef4444', bg: '#450a0a', light: '#fecaca' },
        warning: { DEFAULT: '#f59e0b', bg: '#451a03', light: '#fde68a' },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#484f58',
          inverse: '#1e293b',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
