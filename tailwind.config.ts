import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        // Fatura Expert inspired palette
        ink: {
          950: "#040814",
          900: "#070d1f",
          850: "#0a1330",
          800: "#0d1a3f",
          700: "#11224f",
          600: "#1a2e6b",
        },
        royal: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bccfff",
          300: "#8eadff",
          400: "#5d83ff",
          500: "#3b5cff",
          600: "#2740f0",
          700: "#1f31cc",
          800: "#1d2da3",
          900: "#1d2b81",
        },
        cyan: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
        },
        success: "#10b981",
        warn: "#f59e0b",
        danger: "#ef4444",
      },
      backgroundImage: {
        "grad-primary":
          "linear-gradient(135deg,#2740f0 0%,#3b5cff 40%,#22d3ee 100%)",
        "grad-deep":
          "linear-gradient(180deg,#040814 0%,#070d1f 40%,#0a1330 100%)",
        "grad-card":
          "linear-gradient(160deg,rgba(39,64,240,0.10) 0%,rgba(34,211,238,0.06) 100%)",
        "grad-glow":
          "radial-gradient(60% 60% at 50% 0%,rgba(59,92,255,0.35) 0%,rgba(0,0,0,0) 70%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(39,64,240,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04), 0 12px 32px -16px rgba(0,0,0,0.6)",
        "card-hover":
          "0 1px 0 0 rgba(255,255,255,0.08), 0 24px 60px -20px rgba(34,211,238,0.35)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
