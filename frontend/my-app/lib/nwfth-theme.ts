/**
 * NWFTH Theme Configuration
 * Northern Wind Food Thailand - Warm Elegant Industrial Theme
 */

export const NWFTH_COLORS = {
  // Primary Colors
  primaryBrown: '#3A2920',
  forestGreen: '#3F7D3E',
  accentGold: '#E0AA2F',

  // Background Colors
  background: '#FAF8F4',
  backgroundWarm: '#F5F1EB',

  // Text Colors
  textPrimary: '#2B1C14',
  textSecondary: '#5B4A3F',
  textMuted: '#8B7A6F',

  // Border Colors
  border: '#E2DAD2',
  borderLight: '#EDE8E2',

  // Status Colors
  danger: '#C62828',
  success: '#3F7D3E',
  warning: '#E0AA2F',
  info: '#5B7EA7',

  // Surface Colors
  surface: '#FFFFFF',
  surfaceHover: '#F9F7F4',
} as const;

export const NWFTH_TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
} as const;

export const NWFTH_SHADOWS = {
  sm: '0 1px 2px 0 rgba(58, 41, 32, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(58, 41, 32, 0.1), 0 1px 2px -1px rgba(58, 41, 32, 0.1)',
  md: '0 4px 6px -1px rgba(58, 41, 32, 0.1), 0 2px 4px -2px rgba(58, 41, 32, 0.1)',
  lg: '0 10px 15px -3px rgba(58, 41, 32, 0.1), 0 4px 6px -4px rgba(58, 41, 32, 0.1)',
} as const;

export const NWFTH_THEME = {
  colors: NWFTH_COLORS,
  typography: NWFTH_TYPOGRAPHY,
  shadows: NWFTH_SHADOWS,
} as const;
