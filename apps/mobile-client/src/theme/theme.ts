import { colors } from './colors';

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  typography: {
    heading: {
      fontSize: 24,
      fontWeight: '800' as const,
      color: colors.textPrimary,
    },
    title: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.textPrimary,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: colors.textPrimary,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: colors.textSecondary,
    },
  },
};

export type AppTheme = typeof theme;
