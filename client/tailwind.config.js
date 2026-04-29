/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7c3aed",
          hover: "#6d28d9",
          light: "rgba(124,58,237,0.1)",
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        sidebar: {
          bg: "#1e1b4b",
          surface: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.08)",
          text: "#e0e7ff",
          muted: "#a5b4fc",
          hover: "rgba(255,255,255,0.08)",
          active: "rgba(124,58,237,0.25)",
        },
        chat: {
          bg: "#e5ddd5",
          header: "#1e1b4b",
        },
        sent: "#7c3aed",
        received: "#ffffff",
        online: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        surface: "rgba(0,0,0,0.03)",
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.15)",
        "glow-lg": "0 0 40px rgba(124, 58, 237, 0.2)",
        soft: "0 2px 15px rgba(0, 0, 0, 0.05)",
        card: "0 4px 24px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
