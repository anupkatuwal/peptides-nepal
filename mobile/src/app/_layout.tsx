import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { usePalette } from '@/theme';

export default function RootLayout() {
  const palette = usePalette();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.textPrimary,
          contentStyle: { backgroundColor: palette.background },
        }}
      />
    </>
  );
}
