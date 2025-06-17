/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
module.exports = {
  content: [
    "./index.html",
    "./src/**/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate.900'),           // Main text
            '--tw-prose-counters': theme('colors.slate.800'),       // Ordered list numbers
            '--tw-prose-bullets': theme('colors.slate.800'),        // Unordered list bullets
            '--tw-prose-hr': theme('colors.slate.200'),             // Horizontal rule
            '--tw-prose-quote-borders': theme('colors.blue.200'),   // Blockquote border
          }
          ,
        },
      }),
    },
  },
  plugins: [typography],
};