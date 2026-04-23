import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: {
          50:  "#fdf8ee",
          100: "#f9eed4",
          200: "#f2d9a3",
          300: "#e8c06a",
          400: "#dda83e",
          500: "#BFA06A",
          600: "#a8843a",
          700: "#8C6E30",
          800: "#6b5227",
          900: "#4a3a1c",
        },
        cream: {
          50:  "#FDFAF4",
          100: "#FAF6EF",
          200: "#F5EDE0",
          300: "#EDE0C8",
          400: "#E0CBA8",
        },
        dark: {
          900: "#0C0B09",
          800: "#111009",
          700: "#181510",
          600: "#1C1914",
          500: "#22201A",
        },
      },
      fontFamily: {
        cinzel: ["'Cinzel Decorative'", "serif"],
        marcellus: ["'Marcellus'", "serif"],
        cormorant: ["'Cormorant Garamond'", "serif"],
        jost: ["'Jost'", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #8C6E30 0%, #BFA06A 50%, #D4B483 100%)",
        "gold-gradient-h": "linear-gradient(90deg, #8C6E30 0%, #BFA06A 50%, #D4B483 100%)",
        "dark-gradient": "linear-gradient(180deg, rgba(12,11,9,0.0) 0%, rgba(12,11,9,0.6) 55%, rgba(12,11,9,0.97) 100%)",
        "light-gradient": "linear-gradient(180deg, rgba(253,250,244,0.0) 0%, rgba(253,250,244,0.6) 55%, rgba(253,250,244,0.97) 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease both",
        "fade-in": "fadeIn 0.6s ease both",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
        "slide-left": "slideLeft 0.6s ease both",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-gold": "pulseGold 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(191, 160, 106, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(191, 160, 106, 0)" },
        },
      },
      boxShadow: {
        gold: "0 8px 32px rgba(191, 160, 106, 0.25)",
        "gold-lg": "0 16px 56px rgba(191, 160, 106, 0.3)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
        luxury: "0 24px 80px rgba(0, 0, 0, 0.15)",
      },
      backdropBlur: {
        xs: "4px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
