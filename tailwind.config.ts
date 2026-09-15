import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", "Open Sans", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#0B1533",
          dark: "#060D22",
          light: "#E9EDF5",
        },
        "primary-dark": "#060D22",
        "primary-light": "#E9EDF5",
        silver: "#C5C8D0",
        grey: "#C5C8D0",
        background: "#FFFFFF",
        surface: "#F7F8FA",
        text: {
          DEFAULT: "#172033",
          primary: "#172033",
          secondary: "#667085",
        },
        "text-primary": "#172033",
        "text-secondary": "#667085",
        success: "#12B76A",
        error: "#D92D20",
      },
      fontSize: {
        "page-heading": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "section-heading": ["22px", { lineHeight: "30px", fontWeight: "700" }],
        "card-heading": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "table-heading": ["13px", { lineHeight: "20px", fontWeight: "600" }],
        "body-large": ["16px", { lineHeight: "26px", fontWeight: "400" }],
        "body-regular": ["14px", { lineHeight: "22px", fontWeight: "400" }],
        "body-small": ["13px", { lineHeight: "20px", fontWeight: "400" }],
        label: ["14px", { lineHeight: "20px", fontWeight: "600" }],
        badge: ["12px", { lineHeight: "18px", fontWeight: "600" }],
        "metric-number": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "metric-label": ["13px", { lineHeight: "20px", fontWeight: "600" }],
        helper: ["12px", { lineHeight: "18px", fontWeight: "400" }],
        "modal-heading": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        footer: ["13px", { lineHeight: "20px", fontWeight: "400" }],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
