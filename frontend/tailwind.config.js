export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    fontFamily: { sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'] },
    colors: { navy: { 900: '#0f172a', 800: '#16213b', 700: '#1e2b4a' }, brand: { 50: '#eef2ff', 600: '#4338ca', 700: '#3730a3' } },
  } },
  plugins: [],
}
