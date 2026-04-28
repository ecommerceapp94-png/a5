import { AppTheme, ThemeColors, ThemeGradients, ThemeMode } from '@/types';

export const lightColors: ThemeColors = {
  background: '#f4f6fb',
  backgroundElevated: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#eef1f7',
  glass: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.6)',
  neuLight: '#ffffff',
  neuDark: '#c9cfdc',
  text: '#0b1020',
  textMuted: '#5b6478',
  textInverse: '#ffffff',
  primary: '#5b5cff',
  primarySoft: '#eceaff',
  secondary: '#22c1c3',
  accent: '#ff5e7e',
  success: '#1bbf8a',
  warning: '#ffb020',
  danger: '#ff4d6d',
  info: '#3aa5ff',
  border: '#dde2ec',
  divider: '#eceff5',
  overlay: 'rgba(11,16,32,0.35)',
  shadow: 'rgba(11,16,32,0.18)',
  ripple: 'rgba(91,92,255,0.15)',
};

export const darkColors: ThemeColors = {
  background: '#0b0f1a',
  backgroundElevated: '#11172a',
  surface: '#141b2f',
  surfaceAlt: '#0e1424',
  glass: 'rgba(20,27,47,0.55)',
  glassBorder: 'rgba(255,255,255,0.08)',
  neuLight: '#1c2540',
  neuDark: '#070a14',
  text: '#f4f6fb',
  textMuted: '#9aa3b8',
  textInverse: '#0b1020',
  primary: '#7c7dff',
  primarySoft: '#1e1f4d',
  secondary: '#34dada',
  accent: '#ff7a99',
  success: '#3fdcaa',
  warning: '#ffc857',
  danger: '#ff6b85',
  info: '#5cb8ff',
  border: '#1f2742',
  divider: '#172041',
  overlay: 'rgba(0,0,0,0.55)',
  shadow: 'rgba(0,0,0,0.6)',
  ripple: 'rgba(124,125,255,0.25)',
};

export const lightGradients: ThemeGradients = {
  brand: ['#7c7dff', '#22c1c3'],
  sunset: ['#ff7e5f', '#feb47b'],
  ocean: ['#2193b0', '#6dd5ed'],
  aurora: ['#a18cd1', '#fbc2eb'],
  forest: ['#11998e', '#38ef7d'],
  candy: ['#ff9a9e', '#fad0c4'],
  midnight: ['#232526', '#414345'],
  amber: ['#f7971e', '#ffd200'],
  cosmic: ['#5b5cff', '#ff5e7e'],
  neon: ['#00f2fe', '#4facfe'],
  pastel: ['#fbc2eb', '#a6c1ee'],
  fire: ['#f12711', '#f5af19'],
};

export const darkGradients: ThemeGradients = {
  brand: ['#5b5cff', '#22c1c3'],
  sunset: ['#cc4f1e', '#ff7e5f'],
  ocean: ['#0a4f6f', '#2193b0'],
  aurora: ['#5e3aa1', '#7d4caa'],
  forest: ['#0a6b5d', '#1bbf8a'],
  candy: ['#a13a52', '#ff7a99'],
  midnight: ['#0b0f1a', '#1f2742'],
  amber: ['#a36100', '#f7971e'],
  cosmic: ['#2b0a55', '#ff3d77'],
  neon: ['#00b6cf', '#1f6dff'],
  pastel: ['#7c4d8e', '#5570a8'],
  fire: ['#7e1606', '#cf6f00'],
};

export const baseTheme: Omit<AppTheme, 'mode' | 'colors' | 'gradients'> = {
  radius: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 22,
    xl: 32,
    pill: 999,
    round: 9999,
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  typography: {
    display: 36,
    h1: 28,
    h2: 22,
    h3: 18,
    h4: 16,
    body: 14,
    bodySm: 13,
    caption: 12,
    micro: 11,
  },
};

export function getTheme(mode: ThemeMode): AppTheme {
  return mode === 'dark'
    ? { ...baseTheme, mode, colors: darkColors, gradients: darkGradients }
    : { ...baseTheme, mode, colors: lightColors, gradients: lightGradients };
}

export const defaultTheme: AppTheme = getTheme('dark');
