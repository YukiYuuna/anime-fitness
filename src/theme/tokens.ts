export const tokens = {
  colors: {
    background: '#0e0e12',
    surface: '#1a1a22',
    text: '#f5f5f7',
    textMuted: '#a0a0ab',
    primary: '#7c5cff',
    border: '#2a2a35',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    title: { fontSize: 28, fontWeight: '700' },
    body: { fontSize: 16, fontWeight: '400' },
    label: { fontSize: 13, fontWeight: '600' },
  },
} as const;

export type Theme = typeof tokens;
