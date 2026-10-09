/**
 * Sistema de diseño de Barber OS.
 *
 * Los nombres de color son los mismos que usan las exportaciones de Stitch
 * (design/stitch/*), para poder copiar sus clases tal cual al pasar las
 * pantallas a React. Los valores son los de la paleta elegida (prompt
 * original): primario #2563EB, fondo #F8FAFC y grises de la escala slate.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primario (azul)
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        'on-primary': '#FFFFFF',
        'primary-container': '#2563EB',
        'on-primary-container': '#FFFFFF',
        'primary-fixed': '#DBEAFE',
        'primary-fixed-dim': '#BFDBFE',
        'on-primary-fixed': '#1E3A8A',
        'on-primary-fixed-variant': '#1D4ED8',
        'inverse-primary': '#93C5FD',
        'surface-tint': '#2563EB',

        // Fondos y superficies
        background: '#F8FAFC',
        'on-background': '#0F172A',
        surface: '#F8FAFC',
        'surface-bright': '#F8FAFC',
        'surface-dim': '#CBD5E1',
        'surface-variant': '#E2E8F0',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F1F5F9',
        'surface-container': '#EBEFF5',
        'surface-container-high': '#E2E8F0',
        'surface-container-highest': '#CBD5E1',
        'inverse-surface': '#1E293B',
        'inverse-on-surface': '#F1F5F9',

        // Texto y bordes
        'on-surface': '#0F172A',
        'on-surface-variant': '#475569',
        outline: '#94A3B8',
        'outline-variant': '#E2E8F0',

        // Secundario (gris azulado)
        secondary: '#475569',
        'on-secondary': '#FFFFFF',
        'secondary-container': '#E2E8F0',
        'on-secondary-container': '#334155',
        'secondary-fixed': '#E2E8F0',
        'secondary-fixed-dim': '#CBD5E1',
        'on-secondary-fixed': '#0F172A',
        'on-secondary-fixed-variant': '#334155',

        // Terciario (ámbar)
        tertiary: '#B45309',
        'on-tertiary': '#FFFFFF',
        'tertiary-container': '#D97706',
        'on-tertiary-container': '#FFFBEB',
        'tertiary-fixed': '#FEF3C7',
        'tertiary-fixed-dim': '#FCD34D',
        'on-tertiary-fixed': '#451A03',
        'on-tertiary-fixed-variant': '#92400E',

        // Error
        error: '#B91C1C',
        'on-error': '#FFFFFF',
        'error-container': '#FEE2E2',
        'on-error-container': '#7F1D1D',

        // Estilo "barbería premium" (landing y portal público): carbón + dorado
        ink: {
          DEFAULT: '#0F0F10',
          soft: '#18181B',
          raised: '#222226',
          line: '#2E2E33',
          muted: '#A1A1AA',
        },
        gold: {
          DEFAULT: '#C9A45C',
          hover: '#B8914A',
          light: '#E8D3A3',
          soft: '#F6EEDC',
          deep: '#8A6A2F',
        },
        cream: '#FAF8F4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        // Títulos con presencia del landing y el portal público
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        'headline-page': ['Inter', 'sans-serif'],
        'headline-page-mobile': ['Inter', 'sans-serif'],
        'headline-section': ['Inter', 'sans-serif'],
        'body-default': ['Inter', 'sans-serif'],
        'body-medium': ['Inter', 'sans-serif'],
        'body-semibold': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
        'table-header': ['Inter', 'sans-serif'],
        'badge-label': ['Inter', 'sans-serif'],
        'numeric-metric': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'headline-page': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-page-mobile': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-section': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-default': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'body-semibold': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'table-header': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'badge-label': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'numeric-metric': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      // Igual que en las exportaciones de Stitch (no como en DESIGN.md)
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2rem',
        gutter: '1.5rem',
        'gutter-mobile': '1rem',
        margin: '2rem',
        'margin-mobile': '1rem',
      },
    },
  },
  plugins: [],
}
