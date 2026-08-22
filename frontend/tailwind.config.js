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
          blue: '#0C54EA',      // Official Razorpay Royal Blue
          darkblue: '#02042B',  // Official Razorpay Brand Navy
          lightblue: '#EDF5FF', // Official Soft Icy Blue Banner
          sky: '#3395FF',       // Razorpay Sky Accent
          surface: '#FFFFFF',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          50: '#edf5ff',
          100: '#e0effe',
          500: '#0c54ea',
          600: '#0052a3',
          700: '#003d7a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Mulish', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

