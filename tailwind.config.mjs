import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-display)', ...defaultTheme.fontFamily.serif],
      },
      boxShadow: {
        luxe: '0 24px 80px rgba(0, 0, 0, 0.42)',
        bronze: '0 20px 50px rgba(185, 134, 82, 0.22)',
      },
      borderRadius: {
        panel: 'var(--radius-panel)',
        card: 'var(--radius-card)',
      },
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        smoke: 'rgb(var(--color-smoke) / <alpha-value>)',
        bronze: 'rgb(var(--color-bronze) / <alpha-value>)',
        ember: 'rgb(var(--color-ember) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
