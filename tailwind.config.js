/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hh: {
          green: {
            900: "#0D2820",
            700: "#12332A",
            500: "#1C4735",
            300: "#2D6A4F",
          },
          yellow: {
            DEFAULT: "#FFD000",
            dark: "#E6BE00",
          },
          pink: {
            DEFAULT: "#E63888",
            dark: "#C22872",
          },
          cream: "#FFF8EB",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
        stamp: ["var(--font-baloo)", "var(--font-fraunces)", "serif"],
      },
      boxShadow: {
        stamp: "4px 4px 0px rgba(0,0,0,0.25)",
        "stamp-sm": "2px 2px 0px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
