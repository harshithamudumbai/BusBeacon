/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './contexts/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'hsl(0, 0%, 4%)',
        foreground: 'hsl(0, 0%, 98%)',
        card: 'hsl(0, 0%, 7%)',
        'card-foreground': 'hsl(0, 0%, 98%)',
        primary: {
          DEFAULT: 'hsl(142, 76%, 36%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        secondary: {
          DEFAULT: 'hsl(0, 0%, 15%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
        muted: {
          DEFAULT: 'hsl(0, 0%, 15%)',
          foreground: 'hsl(0, 0%, 64%)',
        },
        border: 'hsl(0, 0%, 15%)',
        destructive: {
          DEFAULT: 'hsl(0, 84%, 60%)',
          foreground: 'hsl(0, 0%, 98%)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
