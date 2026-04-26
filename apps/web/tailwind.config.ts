import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))"
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(120deg, #7c3aed, #06b6d4, #f43f5e)"
      }
    }
  },
  plugins: []
};

export default config;
