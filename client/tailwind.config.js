/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-color-purple-a": "#667aff",
        "dark-color-purple-b": "#7386ff",
        "light-color-purple": "#E6E9FF",
        secondary: "#777",
        "success-color": "#44b700",
        "error-color": "#CC3333",
      },
    },
  },
  plugins: [],
};
