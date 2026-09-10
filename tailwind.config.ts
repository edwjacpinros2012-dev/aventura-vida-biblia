import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172147",
        sky: "#eaf8ff",
        sun: "#ffc83d",
        coral: "#ff6e67",
        leaf: "#1eaa82",
        violet: "#7664e9",
      },
      boxShadow: {
        card: "0 14px 40px rgba(34, 56, 112, .12)",
        lift: "0 20px 45px rgba(34, 56, 112, .18)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-rounded", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
