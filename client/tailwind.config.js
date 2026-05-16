/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: '#622B14',
        sidebar: '#4A1E0D',
        card: {
          dark: '#995F2F',
          light: '#E4D6A9',
          orange: '#995F2F',
          yellow: '#978F66',
        },
        accent: {
          orange: '#995F2F',
          green: '#4CAF50',
          tan: '#978F66',
        },
        muted: '#E4D6A999',
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
