import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

type OpacityArg = { opacityValue?: string };

const c =
  (name: string) =>
  ({ opacityValue }: OpacityArg = {}) =>
    opacityValue === undefined
      ? `var(--${name})`
      : `color-mix(in oklab, var(--${name}) ${Number(opacityValue) * 100}%, transparent)`;

export default {
  darkMode: "class",
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      screens: {
        xs: "400px",
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        border: c("border"),
        input: c("input"),
        ring: c("ring"),
        background: c("background"),
        foreground: c("foreground"),
        surface: c("surface"),
        "surface-elevated": c("surface-elevated"),
        "surface-hover": c("surface-hover"),
        table: c("table-surface"),
        ink: c("ink"),
        "ink-muted": c("ink-muted"),
        "ink-faint": c("ink-faint"),
        ember: c("ember"),
        "ember-hover": c("ember-hover"),
        cream: c("cream"),
        violet: c("violet"),
        "violet-hover": c("violet-hover"),
        lavender: c("lavender"),
        highlight: c("highlight"),
        success: c("success"),
        danger: c("danger"),
        primary: {
          DEFAULT: c("primary"),
          foreground: c("primary-foreground"),
          glow: c("primary-glow"),
        },
        gold: {
          DEFAULT: c("gold"),
          foreground: c("gold-foreground"),
        },
        secondary: {
          DEFAULT: c("secondary"),
          foreground: c("secondary-foreground"),
        },
        destructive: {
          DEFAULT: c("destructive"),
          foreground: c("destructive-foreground"),
        },
        muted: {
          DEFAULT: c("muted"),
          foreground: c("muted-foreground"),
        },
        accent: {
          DEFAULT: c("accent"),
          foreground: c("accent-foreground"),
        },
        popover: {
          DEFAULT: c("popover"),
          foreground: c("popover-foreground"),
        },
        card: {
          DEFAULT: c("card"),
          foreground: c("card-foreground"),
        },
        "plate-1": c("plate-1"),
        "plate-2": c("plate-2"),
        "plate-3": c("plate-3"),
        "plate-4": c("plate-4"),
        "plate-5": c("plate-5"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
            boxShadow: {
        glow: "var(--shadow-glow)",
        elegant: "var(--shadow-elegant)",
        card: "var(--shadow-card)",
        "shadow-1": "var(--shadow-1)",
        "shadow-2": "var(--shadow-2)",
        "shadow-3": "var(--shadow-3)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      transitionTimingFunction: {
        "ease-out": "var(--ease-out)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
