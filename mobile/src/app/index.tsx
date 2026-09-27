import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, usePalette } from '@/theme';

export default function HomeScreen() {
  const palette = usePalette();
  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ title: 'Peptides Nepal' }} />
      <Text accessibilityRole="header" style={[styles.title, { color: palette.textPrimary }]}>
        Peptides Nepal
      </Text>
      <Text style={[styles.body, { color: palette.textSecondary }]}>
        Evidence-first peptide guides. Education only, not medical advice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    gap: spacing[2],
  },
  title: { fontSize: 28, fontWeight: '700' },
  body: { fontSize: 16, textAlign: 'center' },
});
