/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8fb6ff",
          400: "#5b8dff",
          500: "#3766f5",
          600: "#2348e0",
          700: "#1c39b8",
          800: "#1d3493",
          900: "#1d3175",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.06)",
        cardlg: "0 10px 30px -12px rgba(15,23,42,0.18)",
      },
    },
  },
  plugins: [],
};
