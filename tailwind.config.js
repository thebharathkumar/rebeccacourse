/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        pace: {
          blue: '#002d72',
          gold: '#b4975a'
        }
      }
    },
  },
  plugins: [],
}
