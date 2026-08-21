/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        razorpay: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          navy: '#0c2340',
          dark: '#0a192f',
          sky: '#edf5ff',
          surface: '#ffffff',
          slate: '#f8fafc',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Mulish', 'Segoe UI', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
