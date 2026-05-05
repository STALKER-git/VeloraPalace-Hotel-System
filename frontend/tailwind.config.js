/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c97a',
          dark: '#9a7a2e',
          glow: 'rgba(201, 168, 76, 0.3)',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          muted: '#c8bfa8',
        },
        bg: {
          DEFAULT: 'var(--bg)',
          secondary: 'var(--bg-secondary)',
        },
        'black-soft': '#111111',
        'black-card': '#161616',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'card-bg': 'var(--card-bg)',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
      animation: {
        'ken-burns': 'kenBurns 25s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'slide-down': 'slideDown 0.4s ease forwards',
        'scale-in': 'scaleIn 0.4s ease forwards',
        'line-grow': 'lineGrow 0.8s ease forwards',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'shimmer': 'shimmer 2s infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
