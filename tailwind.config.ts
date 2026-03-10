import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#002244',
          dark: '#001122',
          light: '#003366',
        },
        'action-green': {
          DEFAULT: '#69BE28',
          dark: '#5AA023',
          light: '#7DD63A',
        },
        'wolf-grey': {
          DEFAULT: '#A5ACAF',
          light: '#C4C9CC',
          dark: '#808688',
        },
        'alert-yellow': {
          DEFAULT: '#FFB800',
          light: '#FFC933',
          dark: '#CC9300',
        },
        'alert-red': {
          DEFAULT: '#D32F2F',
          light: '#E57373',
          dark: '#B71C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px',
        'dashboard-btn': '120px',
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
export default config
