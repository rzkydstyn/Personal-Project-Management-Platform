/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366F1', // Indigo
          hover: '#4F46E5',   // Deep Indigo
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#64748B', // Slate
          dark: '#0F172A',    // Dark Navy
        },
        background: {
          DEFAULT: '#F8FAFC', // Light Background
          surface: '#FFFFFF', // Surface
        },
        semantic: {
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
};