# MNMKNK Merchant — Mobile App Build Guide

## Quick Start (Development)

```bash
cd mobile
npm install
npx expo start
```

- **Web**: `npx expo start --web` → opens at `http://localhost:8081`
- **Android**: `npx expo start --android` (requires Android Studio / emulator)
- **iOS**: `npx expo start --ios` (requires macOS + Xcode)

---

## Building APK (Android)

### Prerequisites
1. Create an Expo account at https://expo.dev
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`

### Debug APK (for testing)
```bash
eas build --platform android --profile development
```
→ Downloads an `.apk` you can install directly on any Android device.

### Preview APK (closer to production)
```bash
eas build --platform android --profile preview
```

### Production AAB (for Google Play Store)
```bash
eas build --platform android --profile production
```
→ Generates an `.aab` file for Play Store submission.

---

## Building iOS (requires macOS + Apple Developer account)

```bash
# Development build
eas build --platform ios --profile development

# Production build for App Store
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

---

## Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout (AuthProvider + AuthGate)
│   ├── login.tsx            # Login screen (email/password)
│   ├── +not-found.tsx       # 404 screen
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Bottom tabs (5 tabs)
│   │   ├── index.tsx        # Overview — stats, shop banner, notifications
│   │   ├── products.tsx     # Products list + delete
│   │   ├── sales.tsx        # Orders list with status badges
│   │   ├── notifications.tsx # Notifications with mark-all-read
│   │   └── more.tsx         # More menu (all other sections + logout)
│   ├── more/
│   │   └── [screen].tsx     # Dynamic: reservations/invoice/pos/promotions/customers/reports/gallery/builder
│   └── settings/
│       └── [section].tsx    # Dynamic: overview/account/security/store/modules/payments/receipt_theme/notifications
├── contexts/
│   └── AuthContext.tsx       # Auth state (login/logout/user/shop)
├── services/
│   ├── api.ts               # API service (all endpoints)
│   ├── authStorage.ts       # SecureStore token/user persistence
│   └── httpClient.ts        # Axios instance with auth interceptor
├── constants/
│   ├── Colors.ts            # Theme colors
│   └── env.ts               # API base URL (dev vs prod)
├── eas.json                 # EAS Build profiles
└── app.json                 # Expo config
```

---

## Backend Connection

The app connects to the **same NestJS backend** used by the web app:
- **Dev**: `http://127.0.0.1:4000/api/v1`
- **Prod**: `https://ray-eg-production.up.railway.app/api/v1`

Authentication uses JWT tokens stored in `expo-secure-store`.
The 401 interceptor auto-clears the session.

---

## Environment Variables

No `.env` files needed for the mobile app. The `constants/env.ts` file auto-detects `__DEV__` mode:
- `__DEV__ = true` → uses localhost
- `__DEV__ = false` → uses production URL
