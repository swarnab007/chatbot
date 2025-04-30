/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7bc7fc',
          400: '#47acf9',
          500: '#2a8af2',
          600: '#1366e5',
          700: '#0f51cc',
          800: '#0A2463', // Deep blue for primary
          900: '#101e47',
        },
        teal: {
          400: '#3E92CC', // Secondary teal
          500: '#2a85bf',
        },
        orange: {
          400: '#FF9A3C', // Accent orange
          500: '#ff7b00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};