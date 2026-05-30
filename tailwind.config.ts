import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#eef7ff',
          100: '#d9ebff',
          500: '#4f8cff',
          600: '#316df5',
          700: '#2457d4',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top, rgba(79, 140, 255, 0.24), transparent 40%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
