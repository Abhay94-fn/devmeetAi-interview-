/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#060612",
        "base-deep": "#030310",
        "editor-bg": "#080816",
        purple: { DEFAULT: "#8B5CF6", light: "#A78BFA" },
        cyan: { DEFAULT: "#06B6D4", light: "#22D3EE" },
        amber: { DEFAULT: "#F59E0B", light: "#FBBF24" },
        pink: { DEFAULT: "#EC4899", light: "#F472B6" },
        green: { DEFAULT: "#10B981", light: "#34D399" },
        error: "#EF4444",
        muted: "#94A3B8",
        "muted-dark": "#475569",
        "text-primary": "#F8FAFC",
        glass: "rgba(255,255,255,0.04)",
        "glass-hover": "rgba(255,255,255,0.07)",
        "glass-border": "rgba(255,255,255,0.09)",
        "syn-keyword": "#c792ea",
        "syn-function": "#82aaff",
        "syn-string": "#c3e88d",
        "syn-comment": "#546E7A",
        "syn-variable": "#f07178",
        "syn-number": "#f78c6c",
        "syn-property": "#2DD4BF",
        "syn-operator": "#89ddff",
        "line-number": "#1e293b",
      },
      backgroundImage: {
        g1: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
        g2: "linear-gradient(135deg, #F59E0B, #EC4899)",
        g3: "linear-gradient(135deg, #10B981, #06B6D4)",
        g4: "linear-gradient(135deg, #EF4444, #EC4899)",
        g5: "linear-gradient(135deg, #F59E0B, #FBBF24)",
        "ai-panel":
          "linear-gradient(135deg, rgba(139,92,246,0.04), rgba(6,182,212,0.02))",
      },
      backdropBlur: {
        glass: "16px",
        nav: "20px",
      },
      borderRadius: {
        glass: "14px",
        btn: "10px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontWeight: {
        heading: "800",
        "heading-xl": "900",
      },
      letterSpacing: {
        heading: "-1px",
        "heading-lg": "-2px",
      },
      boxShadow: {
        glow: "0 0 40px rgba(139,92,246,0.3)",
        "glow-cyan": "0 0 40px rgba(6,182,212,0.3)",
        "glow-pink": "0 0 40px rgba(236,72,153,0.3)",
        "glow-green": "0 0 40px rgba(16,185,129,0.3)",
      },
      animation: {
        "pulse-live": "pulse-live 1.5s ease-in-out infinite",
        "speaking-ring": "speaking-ring 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "spin-slow": "spin 6s linear infinite",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
        "speaking-ring": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(6,182,212,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(6,182,212,0.15)" },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
