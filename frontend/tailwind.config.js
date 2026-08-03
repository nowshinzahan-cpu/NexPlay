/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        sidebar: 'var(--color-sidebar)',
        'sidebar-hover': 'var(--color-sidebar-hover)',
        card: 'var(--color-card)',
        'card-hover': 'var(--color-card-hover)',
        'card-elevated': 'var(--color-card-elevated)',
        accent: 'rgba(var(--color-accent), <alpha-value>)',
        'accent-light': 'rgba(var(--color-accent-light), <alpha-value>)',
        'accent-text': 'rgba(var(--color-accent-text), <alpha-value>)',
        'accent-contrast': 'rgba(var(--color-accent-contrast), <alpha-value>)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'border-accent': 'var(--color-border-accent)',
        textPrimary: 'rgba(var(--color-text-primary), <alpha-value>)',
        textSecondary: 'rgba(var(--color-text-secondary), <alpha-value>)',
        'text-tertiary': 'rgba(var(--color-text-tertiary), <alpha-value>)',
        hover: 'var(--hover-bg)',
        'hover-strong': 'var(--hover-bg-strong)',
        'surface-subtle': 'var(--surface-subtle)',
        success: 'rgba(var(--color-success), <alpha-value>)',
        danger: 'rgba(var(--color-danger), <alpha-value>)',
        warning: 'rgba(var(--color-warning), <alpha-value>)',
        info: 'rgba(var(--color-info), <alpha-value>)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        display: ['ui-serif', '"New York"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif']
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'elevated': 'var(--shadow-elevated)',
        'glow-accent': 'var(--shadow-glow-accent)',
        'glow-accent-sm': 'var(--shadow-glow-accent-sm)',
        'netflix': '0 0 0 1px rgba(var(--color-accent), 0.25), 0 24px 60px rgba(0, 0, 0, 0.7)',
        'premium': '0 4px 24px rgba(var(--color-accent), 0.06), 0 0 0 1px var(--color-border)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-accent': 'pulseAccent 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(180deg, rgba(var(--color-accent), 0.05) 0%, transparent 50%)',
        'gradient-card': 'linear-gradient(180deg, rgba(var(--color-accent), 0.02) 0%, transparent 100%)',
        'gradient-overlay': 'linear-gradient(180deg, transparent 0%, var(--color-bg) 80%, var(--color-bg) 100%)',
        'gradient-overlay-light': 'linear-gradient(180deg, transparent 50%, var(--color-bg) 100%)',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-border-light) 0%, transparent 70%)',
        'gradient-premium': 'linear-gradient(180deg, rgb(var(--color-accent)) 0%, rgb(var(--color-accent-light)) 100%)',
      },
    }
  },
  plugins: []
};
