/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Add Roboto Mono as the primary monospaced font from the Canvas
        mono: ['"Roboto Mono"', ...fontFamily.mono],
      },
      colors: {
        // A new, more sophisticated palette for the "Digital Twin" theme
        'hud-dark': '#0D1117',       // Near-black background
        'hud-surface': '#161B22',    // Card and panel backgrounds
        'hud-border': '#30363D',     // Borders and dividers
        'hud-primary': '#084183ff',     // The main interactive blue
        'hud-primary-hover': '#014291ff',
        'hud-secondary': '#8B949E',   // Secondary text and icons
        'hud-text-primary': '#509ce7ff', // Main text color
        'hud-text-secondary': '#5b9ae3ff',
        'hud-glow': 'rgba(88, 166, 255, 0.5)', // For glow effects
      }
    },
  },
  plugins: [],
}

