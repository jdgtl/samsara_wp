/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '547px', // Custom breakpoint for avatar grid
      },
      colors: {
        // Samsara Brand Colors - Based on samsaraexperience.com
        background: "hsl(40, 10%, 97%)", // Light stone/beige
        foreground: "hsl(30, 10%, 15%)", // Dark stone
        primary: {
          DEFAULT: "#E2B72D", // Gold - PRIMARY action color (from website)
          foreground: "#0C0004", // Dark text on gold buttons
        },
        secondary: {
          DEFAULT: "hsl(30, 10%, 90%)", // Muted stone grays
          foreground: "hsl(30, 10%, 15%)",
        },
        muted: {
          DEFAULT: "hsl(30, 10%, 95%)",
          foreground: "hsl(30, 10%, 40%)",
        },
        accent: {
          DEFAULT: "hsl(30, 10%, 90%)",
          foreground: "hsl(30, 10%, 15%)",
        },
        destructive: {
          DEFAULT: "#BA4542", // Red from website
          foreground: "hsl(0, 0%, 100%)",
        },
        border: "hsl(30, 15%, 88%)",
        input: "hsl(30, 15%, 88%)",
        ring: "#E2B72D", // Gold focus ring
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(30, 10%, 15%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(30, 10%, 15%)",
        },
        // Samsara brand colors (from brand guidelines + website)
        samsara: {
          gold: '#E2B72D',     // PRIMARY - main CTAs (from website)
          green: '#2E9754',    // SECONDARY - success states, Spanish Green
          red: '#BA4542',      // Alerts/errors (from website)
          black: '#0C0004',    // Dark UI (from website)
        },
        stone: {
          50: "hsl(40, 10%, 97%)",
          100: "hsl(40, 10%, 95%)",
          200: "hsl(30, 15%, 88%)",
          300: "hsl(30, 10%, 80%)",
          400: "hsl(30, 10%, 70%)",
          500: "hsl(30, 10%, 60%)",
          600: "hsl(30, 10%, 50%)",
          700: "hsl(30, 10%, 40%)",
          800: "hsl(30, 10%, 30%)",
          900: "hsl(30, 10%, 15%)",
        },
        // Chart colors for data visualization
        chart: {
          1: "#E2B72D", // Gold
          2: "#2E9754", // Green
          3: "hsl(30, 10%, 50%)",
          4: "hsl(40, 80%, 50%)",
          5: "hsl(20, 80%, 50%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          '"Montserrat"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
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
  plugins: [require("tailwindcss-animate")],
}
