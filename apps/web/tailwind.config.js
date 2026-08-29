/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          400: "#4ade80",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        navy: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        risk: {
          low: "#16a34a",
          medium: "#d97706",
          high: "#ea580c",
          critical: "#dc2626",
        },
        surface: {
          DEFAULT: "#0b1120",
          elevated: "#111827",
          border: "#1e293b",
        },
        intel: {
          blue: "#3b82f6",
          amber: "#f59e0b",
          red: "#ef4444",
          green: "#10b981",
          muted: "#64748b",
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
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
