import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        // Deep clinical blue — text, headers, primary actions
        ink: {
          50: "#F3F6FA",
          100: "#E4EBF4",
          200: "#C6D4E6",
          300: "#9AB2D1",
          400: "#6788B5",
          500: "#43679A",
          600: "#2F4F80",
          700: "#243E68",
          800: "#1B2F52",
          900: "#13223D",
          950: "#0B1628",
        },
        // Soft green — purity, verification, success
        sage: {
          50: "#F1F8F4",
          100: "#DDEFE4",
          200: "#BCDFCB",
          300: "#8FC8A8",
          400: "#5FAB83",
          500: "#3F9068",
          600: "#2F7353",
          700: "#275C44",
          800: "#224A38",
          900: "#1D3D2F",
        },
        paper: "#FBFCFD",
        mist: "#F4F7F6",
        line: "#E3E9EE",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(2.6rem, 5.5vw, 4.5rem)", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(2rem, 3.6vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.5rem, 2.4vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(19,34,61,0.04), 0 8px 24px -12px rgba(19,34,61,0.12)",
        lift: "0 2px 4px rgba(19,34,61,0.05), 0 24px 48px -20px rgba(19,34,61,0.25)",
        ring: "0 0 0 1px rgba(19,34,61,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        trace: {
          "0%": { strokeDashoffset: "1200" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        trace: "trace 2.4s cubic-bezier(0.65, 0, 0.35, 1) 0.3s both",
      },
    },
  },
  plugins: [forms],
};

export default config;
