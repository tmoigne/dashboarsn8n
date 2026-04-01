import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: "#0d1117",
        surface: "#161b22",
        border: "#30363d",
        text: "#c9d1d9",
        dim: "#8b949e",
        green: "#3fb950",
        "green-dark": "#238636",
        muted: "#21262d",
        accent: "#3fb950",  // temporary alias — remove after full migration
      },
    },
  },
  plugins: [],
};

export default config;
