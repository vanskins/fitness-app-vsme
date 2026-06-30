/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1D9E75",
        "ai-bg": "#EAF3DE",
        "ai-border": "#C0DD97",
        "ai-text": "#27500A",
        ink: "#1A1A1A",
        muted: "#6B7280",
        border: "#E5E7EB",
        surface: "#FFFFFF",
        background: "#F7F8FA",
        amber: "#B45309",
        "amber-bg": "#FEF3C7",
      },
      borderRadius: {
        card: "14px",
        pill: "99px",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
