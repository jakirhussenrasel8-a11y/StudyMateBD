/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Set 'rose' palette as the primary brand color for buttons, active nav states, and accents
        primary: {
          50: '#fff1f2',   // soft light pink
          100: '#ffe4e6',  // light blush
          200: '#fecdd3',  // pastel pink
          300: '#fda4af',  // gentle rose
          400: '#fb7185',  // vibrant rose
          500: '#f43f5e',  // primary brand rose
          600: '#e11d48',  // deep rose
          700: '#be123c',  // dark rose
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        brand: {
          soft: '#fff1f2',
          pink: '#fb7185',
          rose: '#f43f5e',
          deep: '#e11d48',
        },
      },
    },
  },
  plugins: [],
};
