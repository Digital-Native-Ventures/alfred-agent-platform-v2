/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { display: ["Inter", "sans-serif"] },
      colors: {
        brand: { 50: "#f0f7ff", 500: "#3874ff", 700: "#1d4ed8" }
      }
    },
  },
  plugins: [],
}