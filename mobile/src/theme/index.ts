import { useColorScheme } from 'react-native';

import { colors, type Palette } from './colors';

export { colors } from './colors';
export type { ColorScheme, Palette } from './colors';

export const spacing = { 1: 6, 2: 12, 3: 18, 4: 24, 5: 30, 6: 36 } as const;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? colors.dark : colors.light;
}
