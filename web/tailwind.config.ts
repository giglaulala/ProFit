import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E2FF00",
        secondary: "#ccff00",
        accent: "#b3ff00",
        background: "#121212",
        text: "#ffffff",
        darkGray: "#1E1E1E",
        lightGray: "#2A2A2A",
        warning: "#ffaa00",
        error: "#ff4444",
        purple: "#8b5cf6",
        blue: "#3b82f6",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #E2FF00 0%, #8b5cf6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
