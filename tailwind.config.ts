/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2C3E50',  // Основной тёмно-синий
          light: '#34495E',    // Светлее основного
          dark: '#1A2633',     // Темнее основного
          custom: '#32CD32',   // Дополнительный зелёный цвет
        },
        secondary: {
          DEFAULT: '#27AE60',  // Основной зелёный для успеха
          light: '#2ECC71',
          dark: '#219653',
          custom: '#F0F0F0',   // Серый фон
        },
        warning: {
          DEFAULT: '#E67E22',
          light: '#F39C12',
          dark: '#D35400',
        },
        danger: {
          DEFAULT: '#E74C3C',
          light: '#FC6D65',
          dark: '#C0392B',
        },
        neutral: {
          100: '#F7FAFC',
          200: '#EDF2F7',
          300: '#E2E8F0',
          400: '#CBD5E0',
          500: '#A0AEC0',
          600: '#718096',
          700: '#4A5568',
          800: '#2D3748',
          900: '#1A202C',
        },
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      tremor: {
        brand: {
          faint: "#eff6ff",
          muted: "#bfdbfe",
          subtle: "#60a5fa",
          DEFAULT: "#3b82f6",
          emphasis: "#1d4ed8",
          inverted: "#ffffff",
        },
      },
      animation: {
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  safelist: [
    {
      pattern: /^(bg|text|border)-(red|orange|yellow|lime|emerald)-/,
    },
  ],
  plugins: [],
};

export default config;
