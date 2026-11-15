import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'media',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#0F2A3D', sea: '#1F7A8C', sun: '#F4A300' }, fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] } } },
  plugins: [],
};
export default config;
