/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Samsara Brand Colors - Earthy, Natural Tones
        background: "hsl(40, 10%, 97%)", // Light stone/beige
        foreground: "hsl(30, 10%, 15%)", // Dark stone
        primary: {
          DEFAULT: "hsl(150, 70%, 45%)", // Emerald green - main brand color
          foreground: "hsl(0, 0%, 100%)",
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
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        border: "hsl(30, 15%, 88%)",
        input: "hsl(30, 15%, 88%)",
        ring: "hsl(150, 70%, 45%)",
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(30, 10%, 15%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(30, 10%, 15%)",
        },
        // Additional Samsara colors
        emerald: {
          50: "hsl(152, 76%, 96%)",
          100: "hsl(149, 80%, 90%)",
          200: "hsl(152, 76%, 80%)",
          300: "hsl(156, 72%, 67%)",
          400: "hsl(158, 64%, 52%)",
          500: "hsl(160, 84%, 39%)",
          600: "hsl(150, 70%, 45%)", // Primary brand color #059669
          700: "hsl(162, 93%, 30%)",
          800: "hsl(163, 94%, 24%)",
          900: "hsl(164, 86%, 20%)",
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
          1: "hsl(150, 70%, 45%)",
          2: "hsl(160, 84%, 39%)",
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
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          '"Helvetica Neue"',
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
