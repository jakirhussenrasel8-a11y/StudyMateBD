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
        // Reference image pastel design system
        lavender: {
          50: '#FBF9FD',
          100: '#F2EDF8', // Soft lavender background in reference
          200: '#E4D8F1',
          300: '#D4C0E9',
          400: '#C5A7E2', // Primary brand lavender in reference
          500: '#A67FCF',
          600: '#8B5EB8',
          700: '#70479A',
          800: '#583679',
          900: '#42285C',
          950: '#251336',
        },
        pastelMint: {
          50: '#F4FAF8',
          100: '#E6F4F1',
          200: '#CFE4E0', // Mint green in reference
          300: '#A8D2C9',
          400: '#7EBDB1',
          500: '#5BA497',
        },
        pastelYellow: {
          50: '#FFFDF5',
          100: '#FFF9E5',
          200: '#FFE49A', // Soft yellow in reference
          300: '#FFD366',
          400: '#FFBF33',
        },
        pastelBlue: {
          50: '#F2F8FE',
          100: '#E4F1FD',
          200: '#C0DFFB',
          300: '#80B9F0', // Sky blue in reference
          400: '#569EEA',
        },
        charcoal: {
          DEFAULT: '#1D222B', // Text in reference
          50: '#F8F9FA',
          100: '#F0F1F3',
          200: '#DCDFE4',
          300: '#B6BAC3',
          400: '#8E939E',
          500: '#62646D', // Muted text in reference
          600: '#484B54',
          700: '#34383F',
          800: '#23262D',
          900: '#1D222B',
          950: '#111317',
        },
        primary: {
          50: '#FBF9FD',
          100: '#F2EDF8',
          200: '#E4D8F1',
          300: '#D4C0E9',
          400: '#C5A7E2',
          500: '#A67FCF',
          600: '#8B5EB8',
          700: '#70479A',
          800: '#583679',
          900: '#42285C',
          950: '#251336',
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
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
