/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: '#1A1A1A',
        sidebar: '#111111',
        card: {
          dark: '#222222',
          light: '#F5F0E8',
          orange: '#F4622A',
          yellow: '#F5C842',
        },
        accent: {
          orange: '#F4622A',
          green: '#4CAF50',
          tan: '#C4B99A',
        },
        muted: '#888888',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'block': '16px',
      }
    },
  },
  plugins: [],
}
