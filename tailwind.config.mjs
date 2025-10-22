// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    // Ensure this path correctly points to your components and pages
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;