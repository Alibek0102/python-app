import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: "#58CC02",
          greenDark: "#58A700",
          greenLight: "#D7FFB8",
          blue: "#1CB0F6",
          blueDark: "#0E8FCC",
          blueLight: "#DDF4FF",
          red: "#FF4B4B",
          redDark: "#D33A3A",
          redLight: "#FFDFE0",
          yellow: "#FFC800",
          yellowDark: "#E6A000",
          yellowLight: "#FFF7CC",
          purple: "#CE82FF",
          purpleDark: "#8549BA",
          purpleLight: "#F3E7FF",
          gray: "#AFAFAF",
          grayDark: "#4B4B4B",
          grayLight: "#F7F7F7",
          ink: "#3C3C3C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
