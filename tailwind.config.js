/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Root cause of "F1 font never applied": every widget uses Tailwind's
      // font-sans / font-mono, which shadowed var(--theme-font). Mapping the
      // two families to the theme variables themes the whole overlay at once.
      fontFamily: {
        sans: ["var(--theme-font)"],
        mono: ["var(--theme-font-mono)"],
        wide: ["var(--theme-font-wide)"],
      },
      colors: {
        f1: {
          red: "#E10600",
          carbon: "#15151E",
        },
        wrc: {
          orange: "#FF5500",
          yellow: "#FFD200",
        },
        wec: {
          hypercar: "#E10600",
          lmp2: "#0066CC",
          lmgt3: "#FF8800",
        },
        indy: {
          blue: "#002F6C",
          red: "#C8102E",
        },
      },
    },
  },
  plugins: [],
};
