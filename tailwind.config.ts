import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cr-bg':           '#07182D',
        'cr-surface':      '#091A2F',
        'cr-elevated':     '#182432',
        'cr-accent':       '#2563EB',
        'cr-accent-hover': '#3B82F6',
        'cr-border':       '#1F2937',
        'cr-text':         '#E5E7EB',
        'cr-muted':        '#9CA3AF',
      },
    },
  },
  plugins: [],
};

export default config;
