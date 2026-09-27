# Peptides Nepal App — Project Rules

## Product
Educational mobile app for Peptides Nepal (@peptidesnepal). Shows peptide research
guides and Instagram-style carousel posts pulled from the peptides-nepal website repo.
Contact: contact@anup-katuwal.com.np and the Instagram page.

## Hard rules
- Education only. Never add purchase flows, prices, vendor links, or dosing instructions.
- Every peptide detail screen must show sources.
- No user accounts in v1. No collection of personal data beyond anonymous analytics.
- TypeScript strict mode. No `any`.
- All colours, spacing, fonts come from `src/theme/` tokens. No hard-coded colours.
- Support light + dark mode, Dynamic Type / font scaling, and screen readers
  (accessibilityLabel on every touchable).
- Every screen handles loading, empty, error, and offline states.

## Stack
Expo SDK 57, Expo Router, TypeScript, TanStack Query for data,
MMKV for local storage, expo-notifications, expo-image, Sentry, Jest + React Native
Testing Library, Maestro for end-to-end tests.

## Layout
- This app lives in `mobile/` inside the website repo. Run every command from `mobile/`.
- Routes live in `src/app/` (every file is a screen, `_layout.tsx` is a navigator).
  Keep components, hooks and utils outside `src/app/`.
- Tests live in `src/__tests__/`. React Native Testing Library 14: `render` is async, so `await` it.

## Commands
- `npx expo start` — dev server
- `npm test` — unit tests
- `npm run lint` / `npm run typecheck` / `npm run format:check`
- `npx expo install <pkg>` — add packages (picks SDK-compatible versions). If the Expo API is
  blocked by the network, prefix with `EXPO_OFFLINE=1`.
- `eas build --profile preview` — test builds
- `eas build --profile production --platform all` — store builds

## Expo changes fast
Before using an Expo or React Native API, check the SDK 57 docs
(https://docs.expo.dev/versions/v57.0.0/) instead of relying on memory.
Never create or edit `ios/` or `android/` by hand; configure native behaviour in `app.json`.

## Workflow
- Work in small commits, one feature per commit.
- Run lint, typecheck, and tests before saying a task is done.
- Ask before adding a new dependency.
