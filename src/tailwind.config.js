/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          hover: '#b80710',
          dark: '#141414',
          card: '#181818',
          border: '#2f2f2f',
          muted: '#8c8c8c'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
