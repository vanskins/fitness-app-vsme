/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1D9E75",
        "primary-dark": "#0C7E5C",
        "ai-bg": "#E1F5EE",
        "ai-border": "#9FE1CB",
        "ai-text": "#0F6E56",
        ink: "#15171A",
        muted: "#6B7280",
        faint: "#9AA0A6",
        border: "#EEF0F2",
        surface: "#FFFFFF",
        background: "#F4F6F8",
        amber: "#B45309",
        "amber-bg": "#FEF3C7",
        coral: "#D85A30",
        "coral-bg": "#FAECE7",
      },
      borderRadius: {
        card: "16px",
        pill: "99px",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
