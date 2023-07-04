/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-color-purple-a": "#667aff",
        "dark-color-purple-b": "#7386ff",
        "dark-color-blue-header": "#081A2F",
        "dark-color-blue-background": "#031E3B",
        "light-color-gray": "#808D9A",
        "light-color-blue": "#66B3FE",
        "light-color-azure": "#007FFF",
        "light-color-purple": "#E6E9FF",
        secondary: "#777",
        "success-color": "#44b700",
        "error-color": "#CC3333",
      },
    },
  },
  plugins: [],
};
