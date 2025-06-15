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
            // '--tw-prose-body': theme(''),
            // '--tw-prose-headings': theme(''),
            // '--tw-prose-lead': theme(''),
            // '--tw-prose-links': theme(''),
            // '--tw-prose-bold': theme(''),
            // '--tw-prose-counters': theme(''),
            // '--tw-prose-bullets': theme('colors.pink.500'),
            // '--tw-prose-hr': theme(''),
            // '--tw-prose-quotes': theme('colors.pink.200'),
            // '--tw-prose-quote-borders': theme('colors.pink.200'),
            // '--tw-prose-captions': theme('colors.pink.200'),

            '--tw-prose-body': theme('colors.slate.900'),           // Main text
            // '--tw-prose-headings': theme('colors.slate.900'),       // Headings (neutral, dark)
            // '--tw-prose-lead': theme('colors.slate.800'),           // Lead text
            // '--tw-prose-links': theme('colors.sky.600'),            // Links (blue for contrast)
            // '--tw-prose-bold': theme('colors.slate.900'),           // Bold text
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