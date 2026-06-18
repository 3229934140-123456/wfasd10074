/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'rose-gold': {
          DEFAULT: '#D4A574',
          light: '#E8C9A0',
          dark: '#B88B5C',
        },
        cream: '#FFF8F0',
        'soft-pink': '#F5D5D4',
        'dark-brown': '#3D2914',
        'sage-green': '#7BA17C',
        bg: '#FFFBF7',
        card: '#FFFFFF',
        border: '#F0E6D8',
        'text-primary': '#3D2914',
        'text-secondary': '#8B7355',
        'text-muted': '#B8A88A',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(212, 165, 116, 0.08)',
        medium: '0 4px 24px rgba(212, 165, 116, 0.12)',
        lift: '0 8px 32px rgba(212, 165, 116, 0.16)',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
