# Peptides Nepal — mobile app

Expo (React Native) + Expo Router + TypeScript. One codebase for iOS, Android and web.
Project rules are in `CLAUDE.md`.

## Run it on your phone (Expo Go)

1. Install **Expo Go** from the App Store or Google Play.
2. On your computer (Node LTS installed):
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. A QR code appears in the terminal.
   - **iPhone:** open the Camera app and scan it. Tap the banner to open in Expo Go.
   - **Android:** open Expo Go and tap **Scan QR code**.
4. Phone and computer must be on the same Wi-Fi. If that fails (office or hotel Wi-Fi),
   run `npx expo start --tunnel` instead.
5. Edit a file and save. The app reloads on your phone.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
```

## App IDs

- Name: Peptides Nepal · slug: `peptides-nepal` · URL scheme: `peptidesnepal://`
- iOS bundle ID and Android package: `np.peptidesnepal.app`
