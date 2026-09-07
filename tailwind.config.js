/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
