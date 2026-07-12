/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#69BFA1",
          hover: "#58ab8e",
        },
        accent: {
          DEFAULT: "#4FA6B0",
          hover: "#3e939c",
        },
        lime: {
          DEFAULT: "#A6D65B",
          hover: "#93c148",
        },
        charcoal: "#2F2F2F",
        graylight: "#F4F4F4",
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      }
    },
  },
  plugins: [],
}
