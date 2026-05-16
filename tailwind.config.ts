import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"]
      },
      colors: {
        obsidian: "#050505",
        gold: "#D4AF37",
        emerald: "#10B981",
        void: "#09090B",
        rune: "#171717",
        border: "rgba(212,175,55,0.18)"
      },
      boxShadow: {
        gold: "0 0 60px rgba(212,175,55,0.18)",
        emerald: "0 0 40px rgba(16,185,129,0.18)"
      },
      backgroundImage: {
        "radial-gold": "radial-gradient(circle at top, rgba(212,175,55,0.16), transparent 35%)",
        "vanguard-card": "linear-gradient(145deg, rgba(23,23,23,0.94), rgba(5,5,5,0.98))"
      }
    }
  },
  plugins: [animate]
};
export default config;
