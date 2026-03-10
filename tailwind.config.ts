import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#FFD700',
        surface: {
          DEFAULT: '#161616',
          2: '#1e1e1e',
          3: '#262626',
        },
        bg: '#0d0d0d',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
