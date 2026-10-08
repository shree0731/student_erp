/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#7c6cf0',
        'brand-secondary': '#ece9ff',
        'brand-bg': '#f7f7fb',
        'brand-accent': '#f0a830',
        'brand-text': '#1f2430',
        'brand-card': '#ffffff',
        'ink': '#1f2430',
        'muted': '#7b8094',
        'purple': '#7c6cf0',
        'purple-soft': '#ece9ff',
        'green': '#2fbf86',
        'green-soft': '#e4f9f0',
        'amber': '#f0a830',
        'amber-soft': '#fdf1dd',
        'red': '#ef5f6a',
        'red-soft': '#fde9ea',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
