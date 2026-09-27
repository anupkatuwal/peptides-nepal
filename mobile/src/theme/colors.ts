// Matcha palette, copied from the website's styles.css (:root and the dark-mode block).
export const colors = {
  light: {
    accent: '#3E481D',
    background: '#F0F0E0',
    surface: '#FFFFFF',
    textPrimary: '#3E481D',
    textSecondary: '#5f6b3a',
    border: '#DCE3CE',
  },
  dark: {
    accent: '#C0CBA9',
    background: '#12140e',
    surface: '#1a1c14',
    textPrimary: '#C0CBA9',
    textSecondary: '#94a468',
    border: '#C0CBA91A',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type Palette = (typeof colors)[ColorScheme];
