# Sentinel (Polihek18)

Sentinel is a crisis-support mobile app designed to keep working when connectivity is unreliable. Users can search through offline documents/manuals, chat with an on-device AI assistant, use a map, and store personal data locally. When the device is online, Sentinel can also show hazard zones.

## What it does

- **Offline-first crisis info:** browse and search helpful documents/manuals.
- **AI chat (on-device):** ask questions and get guidance based on locally available content.
- **Map view:** view your position and navigate information.
- **Local “Secret Vault”:** store personal notes/documents locally on the device.
- **Hazard zones (online):** when connected, the app can fetch and display hazard areas.

## Offline vs online behavior

- **Works offline:** document browsing/search, AI chat (on-device), map UI, and local data storage.
- **Enhanced online:** hazard-zone data becomes available when the device has connectivity.

## Tech stack

- Expo (React Native) + `expo-router`
- Firebase (Auth, Firestore, Functions)
- MapLibre (React Native)
- On-device RAG / AI: `@react-native-rag/executorch` + SQLite (`@op-engineering/op-sqlite`)

## Prerequisites

- Node.js + npm
- Expo tooling (this repo uses Expo SDK 54)
- Android Studio + Android Emulator (for Android development builds)

## Quick start

```bash
npm install
```

Start the Metro bundler:

```bash
npm run start
```

Run on Android (development build):

```bash
npm run android
```

Other platforms:

```bash
npm run ios
npm run web
```

Lint:

```bash
npm run lint
```

## Configuration notes

- **Android package id:** `ro.polihek18.app` (see `app.json`).
- **Firebase on Android:** `google-services.json` is referenced from `app.json` and must be present at the repo root.
- **EAS build profiles:** see `eas.json` (`development`, `preview`, `production`).

## Project structure

- `app/` — screens/routes (expo-router)
  - `app/dashboard.tsx` — main dashboard (includes consent gating + credits)
  - `app/map.tsx` — map screen
  - `app/secretvault.tsx` — local vault
  - `app/ChatScreen.tsx` — AI chat
  - `app/components/` — UI components (modals, chat UI, etc.)
  - `app/utils/` — local utilities (including offline storage helpers)
- `assets/` — bundled assets
- `PolihackV18-hazard-location-detection-main/` — Firebase backend (functions + config)

## Backend (Firebase Functions)

The folder `PolihackV18-hazard-location-detection-main/` contains a Firebase project with a `functions/` package. If you deploy/use the backend, follow Firebase CLI workflows from inside that folder.

## Lockfiles

This repo uses npm and includes `package-lock.json`. In most teams, you should commit lockfiles to keep installs reproducible across machines and CI.

## Troubleshooting

- **`npm run android` fails:** ensure Android Studio + an emulator are installed and your `ANDROID_HOME` is configured.
- **No hazard zones:** hazard data requires connectivity and a configured backend (see `PolihackV18-hazard-location-detection-main/`).

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```
