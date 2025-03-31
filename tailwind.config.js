/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme(''),
            '--tw-prose-headings': theme(''),
            '--tw-prose-lead': theme(''),
            '--tw-prose-links': theme(''),
            '--tw-prose-bold': theme(''),
            '--tw-prose-counters': theme(''),
            '--tw-prose-bullets': theme(''),
            '--tw-prose-hr': theme(''),
            '--tw-prose-quotes': theme(''),
            '--tw-prose-quote-borders': theme(''),
            '--tw-prose-captions': theme(''),
            '--tw-prose-code': theme(''),
            // '--tw-prose-pre-code': theme('colors.black'),
            // '--tw-prose-pre-bg': theme('colors.gray.100'),
            '--tw-prose-th-borders': theme(''),
            '--tw-prose-td-borders': theme(''),
            '--tw-prose-invert-body': theme(''),
            '--tw-prose-invert-headings': theme(''),
            '--tw-prose-invert-lead': theme(''),
            '--tw-prose-invert-links': theme(''),
            '--tw-prose-invert-bold': theme(''),
            '--tw-prose-invert-counters': theme(''),
            '--tw-prose-invert-bullets': theme(''),
            '--tw-prose-invert-hr': theme(''),
            '--tw-prose-invert-quotes': theme(''),
            '--tw-prose-invert-quote-borders': theme(''),
            '--tw-prose-invert-captions': theme(''),
            '--tw-prose-invert-code': theme(''),
            '--tw-prose-invert-pre-code': theme(''),
            '--tw-prose-invert-pre-bg': theme(''),
            '--tw-prose-invert-th-borders': theme(''),
            '--tw-prose-invert-td-borders': theme(''),
          }

          ,
        },
      }),
    },
  },
  plugins: [typography],
}

