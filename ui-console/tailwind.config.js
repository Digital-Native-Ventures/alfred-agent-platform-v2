/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Background colors for stat cards
    'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50',
    'bg-red-50', 'bg-indigo-50', 'bg-pink-50', 'bg-cyan-50',
    
    // Text colors for icons
    'text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600',
    'text-red-600', 'text-indigo-600', 'text-pink-600', 'text-cyan-600',
    
    // Status dot colors
    'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-blue-500',
    'bg-purple-500', 'bg-orange-500',
    
    // Gradient classes
    'bg-gradient-to-r', 'from-blue-50', 'to-purple-50',
  ],
  theme: {
    extend: {
      fontFamily: { 
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: { 
          50: "#f0f7ff", 
          100: "#e0f0ff",
          500: "#3874ff", 
          600: "#2563eb",
          700: "#1d4ed8",
        },
        primary: {
          50: "#f0f7ff",
          500: "#3874ff",
          600: "#2563eb",
          700: "#1d4ed8",
        }
      }
    },
  },
  plugins: [],
}
