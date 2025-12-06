import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          light: 'var(--primary-light)',
          subtle: 'var(--primary-subtle)',
          glass: 'var(--primary-glass)',
          glow: 'var(--primary-glow)',
          foreground: 'var(--primary-foreground)',
        },
        // Secondary
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        // Accent
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          light: 'var(--accent-light)',
          subtle: 'var(--accent-subtle)',
          glass: 'var(--accent-glass)',
          glow: 'var(--accent-glow)',
        },
        // Backgrounds
        background: 'var(--bg)',
        'bg-subtle': 'var(--bg-subtle)',
        'bg-muted': 'var(--bg-muted)',
        // Surfaces
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          glass: 'var(--surface-glass)',
          solid: 'var(--surface-solid)',
        },
        // Semantic colors
        success: {
          DEFAULT: 'var(--success)',
          light: 'var(--success-light)',
          subtle: 'var(--success-subtle)',
          glass: 'var(--success-glass)',
          glow: 'var(--success-glow)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          light: 'var(--warning-light)',
          subtle: 'var(--warning-subtle)',
          glass: 'var(--warning-glass)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          light: 'var(--danger-light)',
          subtle: 'var(--danger-subtle)',
          glass: 'var(--danger-glass)',
        },
        info: {
          DEFAULT: 'var(--info)',
          light: 'var(--info-light)',
          subtle: 'var(--info-subtle)',
          glass: 'var(--info-glass)',
        },
        // Finance-specific
        'tax-accent': 'var(--tax)',
        'debt-accent': 'var(--debt)',
        investment: {
          DEFAULT: 'var(--investment)',
          glow: 'var(--investment-glow)',
        },
        savings: 'var(--savings)',
        'money-in': 'var(--money-in)',
        'money-out': 'var(--money-out)',
        // Borders
        border: {
          DEFAULT: 'var(--border)',
          hover: 'var(--border-hover)',
          glass: 'var(--border-glass)',
          'glass-strong': 'var(--border-glass-strong)',
        },
        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-on-glass': 'var(--text-on-glass)',
      },
      // Border radius - concentric system
      borderRadius: {
        'xs': 'var(--radius-xs)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      // Spacing
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      // Box shadows
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'glass': 'var(--shadow-glass)',
        'elevated': 'var(--shadow-elevated)',
        'float': 'var(--shadow-float)',
        'glow': 'var(--shadow-glow)',
        'glow-accent': 'var(--shadow-glow-accent)',
        'edge': 'var(--edge-highlight), var(--edge-shadow)',
      },
      // Backdrop blur
      backdropBlur: {
        'none': 'var(--blur-none)',
        'sm': 'var(--blur-sm)',
        'md': 'var(--blur-md)',
        'lg': 'var(--blur-lg)',
        'xl': 'var(--blur-xl)',
        '2xl': 'var(--blur-2xl)',
      },
      // Background images
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-surface': 'var(--gradient-surface)',
        'gradient-glass': 'var(--gradient-glass)',
        'gradient-shine': 'var(--gradient-shine)',
        'gradient-mesh': 'var(--gradient-mesh)',
        'gradient-ocean': 'var(--gradient-ocean)',
        'mesh': 'var(--bg-mesh)',
      },
      // Transitions
      transitionDuration: {
        'instant': 'var(--duration-instant)',
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--easing-smooth)',
        'bounce': 'var(--easing-bounce)',
        'glass': 'var(--easing-glass)',
      },
      // Animations
      animation: {
        'fade-in': 'fadeIn var(--duration-normal) var(--easing-glass)',
        'fade-in-up': 'fadeInUp var(--duration-normal) var(--easing-glass)',
        'scale-in': 'scaleIn var(--duration-normal) var(--easing-glass)',
        'shimmer': 'shimmer 1.5s ease infinite',
        'glow-pulse': 'glowPulse 2s ease infinite',
        'mesh-shift': 'meshShift 15s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px var(--primary-glow)' },
          '50%': { boxShadow: '0 0 24px var(--primary-glow)' },
        },
        meshShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      // Font family
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
    }
  },
  plugins: []
}

export default config
