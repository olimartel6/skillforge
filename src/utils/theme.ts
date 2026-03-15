export const colors = {
  background: '#0a0a0b',
  primary: '#FF6B35',
  primaryDark: '#FF3D00',
  secondary: '#6C63FF',
  secondaryDark: '#4F46E5',
  success: '#34D399',
  successDark: '#059669',
  error: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#444444',
  textDark: '#333333',
  glassBg: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
  glassStrongBg: 'rgba(255, 255, 255, 0.07)',
  glassStrongBorder: 'rgba(255, 255, 255, 0.1)',
  cardBg: 'rgba(255, 255, 255, 0.03)',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  '2xl': 24, '3xl': 28, '4xl': 32, '5xl': 40, '6xl': 48,
} as const;

export const borderRadius = {
  sm: 8, md: 12, lg: 14, xl: 16, '2xl': 20, '3xl': 24, full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '900' as const, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '500' as const },
  label: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 2, textTransform: 'uppercase' as const },
  stat: { fontSize: 24, fontWeight: '900' as const },
  timer: { fontSize: 42, fontWeight: '200' as const, letterSpacing: 4 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  button: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};

export function glowShadow(color: string) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  };
}
