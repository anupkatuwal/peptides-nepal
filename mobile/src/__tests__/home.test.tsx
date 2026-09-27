import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';

jest.mock('expo-router', () => ({ Stack: { Screen: () => null } }));

describe('HomeScreen', () => {
  it('shows the app name and the education-only note', async () => {
    await render(<HomeScreen />);
    expect(screen.getByRole('header', { name: 'Peptides Nepal' })).toBeTruthy();
    expect(screen.getByText(/Education only, not medical advice/)).toBeTruthy();
  });
});
