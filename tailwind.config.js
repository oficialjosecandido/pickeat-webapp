/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        main: {
          1: "#FF7F30",
          2: "#F35B6A",
        },
        bg: {
          1: "#f8f4f4",
          2: "#ffffff",
        },
        p: "#696969",
      },
      keyframes: {
        spinRight: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
      },
      animation: {
        spinRight: "spinRight 1s linear infinite",
      },
    },
  },
  plugins: [],
};
