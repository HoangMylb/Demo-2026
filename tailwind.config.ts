import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
        },
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
      backgroundImage: {
        'hero-radial': 'var(--hero-radial)',
      },
    },
  },
  plugins: [],
} satisfies Config;
