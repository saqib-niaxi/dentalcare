/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Luxury color palette
        luxury: {
          black: '#0a0a0a',
          charcoal: '#1a1a1a',
          slate: '#2d2d2d',
          gold: '#d4af37',
          goldLight: '#f4e4bc',
          goldDark: '#b8960c',
          cream: '#faf9f6',
          white: '#fefefe',
        },
        // Keep existing functional colors
        primary: {
          DEFAULT: '#2a9d8f',
          light: '#3ab5a5',
          dark: '#238578'
        },
        accent: '#e76f51',
        dark: '#264653',
        light: '#f8f9fa'
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5), 0 0 10px rgba(212, 175, 55, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'gold': '0 10px 40px -10px rgba(212, 175, 55, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
    }
  },
  plugins: []
}
