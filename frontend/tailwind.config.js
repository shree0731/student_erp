/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAF8FF',
        card: '#FFFFFF',
        ink: '#3B3651',
        mute: '#6B6680',
        line: '#EBE6FA',
        primary: '#7C3AED',
        soft: '#F3EFFF',
        note: {
          DEFAULT: '#FEF3C7',
          text: '#78350F',
        },
        pink: {
          DEFAULT: '#FCE7F3',
          text: '#831843',
        },
        green: '#10B981',
        amber: '#F59E0B',
        red: '#EF4444',
        dot: '#E9E3F7',
        // Legacy compatibility mappings
        'brand-primary': '#7C3AED',
        'brand-secondary': '#F3EFFF',
        'brand-bg': '#FAF8FF',
        'brand-card': '#FFFFFF',
        'purple': '#7C3AED',
        'purple-soft': '#F3EFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
      },
      borderRadius: {
        card: '22px',
        btn: '12px',
        input: '8px',
        pill: '99px',
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(139,92,246,.08), 0 2px 6px rgba(139,92,246,.04)',
      },
    },
  },
  plugins: [],
}
