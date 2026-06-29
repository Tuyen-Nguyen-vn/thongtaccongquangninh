/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10202d',
        ocean: '#0b5e8e',
        marine: '#0d8a8a',
        leaf: '#159766',
        warning: '#f26a21',
        danger: '#d93232',
      },
      boxShadow: {
        soft: '0 12px 32px rgba(16, 32, 45, 0.10)',
        lift: '0 18px 48px rgba(16, 32, 45, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
