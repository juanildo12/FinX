import { ThemeMode } from '../types';

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    income: string;
    expense: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; letterSpacing: number };
    h2: { fontSize: number; fontWeight: string; letterSpacing: number };
    h3: { fontSize: number; fontWeight: string };
    bodyLarge: { fontSize: number; fontWeight: string };
    body: { fontSize: number; fontWeight: string };
    caption: { fontSize: number; fontWeight: string };
    small: { fontSize: number; fontWeight: string };
  };
}

const lightColors = {
  primary: '#10B981',
  primaryDark: '#059669',
  secondary: '#3B82F6',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E2E8F0',
  income: '#22C55E',
  expense: '#EF4444',
};

const darkColors = {
  primary: '#10B981',
  primaryDark: '#059669',
  secondary: '#3B82F6',
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#334155',
  income: '#22C55E',
  expense: '#EF4444',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const },
  bodyLarge: { fontSize: 17, fontWeight: '400' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '400' as const },
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  borderRadius,
  typography,
};

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
