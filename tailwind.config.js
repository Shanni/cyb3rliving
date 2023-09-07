/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "red",
      },
      colors: {
        primary: {
          light: "hsl(var(--primary-light) / <alpha-value>)",
          DEFAULT: "#f2f757",
          dark: "#f2f757",
        },
        secondary: "#5757f7",
        neutral: "#b2b2eb",
      },
    },
  },
  plugins: [],
};
