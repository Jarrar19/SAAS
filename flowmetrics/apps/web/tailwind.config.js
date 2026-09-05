/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F8FA",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#12151C",
          muted: "#5B6270",
        },
        accent: {
          DEFAULT: "#0F766E",
          hover: "#115E59",
          subtle: "#F0FDFA",
        },
        border: {
          DEFAULT: "#E4E7EC",
          strong: "#D0D5DD",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
