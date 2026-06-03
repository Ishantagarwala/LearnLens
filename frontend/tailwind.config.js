/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0A0A0F',
          purple: '#6C3EF6',
          violet: '#A855F7',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6C3EF6, #A855F7)',
        'gradient-brand-r': 'linear-gradient(135deg, #A855F7, #6C3EF6)',
      },
    },
  },
  plugins: [],
};
