/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens — resolved from CSS variables so they flip with the theme.
        // RGB triplets keep Tailwind's `/<alpha>` opacity modifiers working everywhere.
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        // elevated card surface — pure white in light, raised slate in dark
        card: 'rgb(var(--c-card) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          ink: 'rgb(var(--c-accent-ink) / <alpha-value>)',
        },
        // hairlines / subtle fills — black overlays in light, white overlays in dark
        hair: 'rgb(var(--c-hair) / <alpha-value>)',
        // modal scrim — stays dark in both themes
        scrim: 'rgb(var(--c-scrim) / <alpha-value>)',
        // git-style commit tag tints (bg + readable ink), themed
        tagfeat: { bg: 'rgb(var(--c-tagfeat-bg) / <alpha-value>)', ink: 'rgb(var(--c-tagfeat-ink) / <alpha-value>)' },
        tagfix: { bg: 'rgb(var(--c-tagfix-bg) / <alpha-value>)', ink: 'rgb(var(--c-tagfix-ink) / <alpha-value>)' },
        tagdocs: { bg: 'rgb(var(--c-tagdocs-bg) / <alpha-value>)', ink: 'rgb(var(--c-tagdocs-ink) / <alpha-value>)' },
        tagtest: { bg: 'rgb(var(--c-tagtest-bg) / <alpha-value>)', ink: 'rgb(var(--c-tagtest-ink) / <alpha-value>)' },
        tagperf: { bg: 'rgb(var(--c-tagperf-bg) / <alpha-value>)', ink: 'rgb(var(--c-tagperf-ink) / <alpha-value>)' },
        tagrefactor: { bg: 'rgb(var(--c-tagrefactor-bg) / <alpha-value>)', ink: 'rgb(var(--c-tagrefactor-ink) / <alpha-value>)' },
        tagchore: { bg: 'rgb(var(--c-tagchore-bg) / <alpha-value>)', ink: 'rgb(var(--c-tagchore-ink) / <alpha-value>)' },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        serif: ['"Newsreader"', 'Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(0,0,0,0.03), 0 10px 30px -16px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
};
