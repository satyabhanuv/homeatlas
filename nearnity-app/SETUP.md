# Nearnity Mobile App — Setup & Launch Guide

Everything you need to go from this folder to the App Store and Google Play.
Estimated time: **2–3 hours** (most of that is waiting for Expo to build).

---

## Prerequisites — do these first

### 1. Node.js (if not installed)
Download from https://nodejs.org — install the LTS version.

### 2. Expo CLI
```bash
npm install -g eas-cli expo-cli
```

### 3. Expo Account (free)
Go to https://expo.dev → Create Account. Remember your login — you'll need it for builds.

### 4. Apple Developer Account — $99/year
Enroll at https://developer.apple.com/programs/enroll/
- Takes **24–48 hours** to approve. Start this first.
- Use your personal Apple ID (Satyabhanuv@gmail.com or similar).
- You can enroll as an **Individual** now; transfer to Nearnity LLC later when it's formed.

### 5. Google Play Console — $25 one-time
Sign up at https://play.google.com/console
- Instant access after payment.
- Use your personal Google account for now.

### 6. Google Maps API Key (for Android map display — free)
1. Go to https://console.cloud.google.com
2. Create a new project named "Nearnity"
3. Enable: **Maps SDK for Android**
4. Create an API key (restrict it to your Android app package: `com.nearnity.app`)
5. Copy the key — you'll add it to `app.json`

---

## Step 1 — Initialize the Expo project

Open Terminal, navigate to the `nearnity-app` folder, and run:

```bash
cd /path/to/nearnity-app

# Install all dependencies
npm install

# Link the Expo project to your EAS account
eas init --id (Expo will generate a project ID — copy it)
```

After `eas init`, open `app.json` and replace `REPLACE_WITH_EAS_PROJECT_ID` with the ID Expo gave you.

---

## Step 2 — Add your Google Maps API key

Open `app.json` and replace:
```
"apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
```
with the key you created in Google Cloud Console.

---

## Step 3 — Add placeholder app icon & splash screen

The `assets/` folder needs these files before building. Create them using any image editor
(Figma, Canva, or just drop PNGs in). Required files:

| File | Size | Notes |
|---|---|---|
| `assets/icon.png` | 1024×1024 | Square PNG with Nearnity logo, no transparency |
| `assets/splash.png` | 1284×2778 | Splash screen — can just be the logo on a blue (#006aff) background |
| `assets/adaptive-icon.png` | 1024×1024 | Android foreground layer (same as icon.png is fine for v1) |
| `assets/favicon.png` | 32×32 | Only for web — a small version of the icon |

> **Quick option:** For a first test build, create a simple 1024×1024 blue square PNG and use it for all three. You can design the real icons before App Store submission.

---

## Step 4 — Test on your phone (local dev)

```bash
# Start the development server
npx expo start

# Scan the QR code with:
# - iOS: Camera app
# - Android: Expo Go app (install from Play Store first)
```

This lets you see the app running live on your device. Hot reload means every file save updates the app instantly.

---

## Step 5 — Build for App Stores (via EAS cloud)

EAS Build runs in Expo's cloud — no Mac required for iOS builds.

```bash
# Build for both platforms (uses cloud builders)
npm run build:all

# Or build one at a time:
npm run build:ios
npm run build:android
```

The first build takes 15–30 minutes. Subsequent builds are faster.
You'll get a download link for the `.ipa` (iOS) and `.aab` (Android).

---

## Step 6 — Configure App Store submission

### iOS (Apple App Store Connect)

Before submitting, open `eas.json` and fill in:
- `appleId`: Your Apple ID email
- `ascAppId`: Your App Store Connect app ID (create the app record first at appstoreconnect.apple.com)
- `appleTeamId`: Your team ID (visible in Apple Developer portal → Membership)

Then:
```bash
npm run submit:ios
```

### Android (Google Play)

1. In Google Play Console, create a new app record
2. Download a Service Account JSON key (Google Play Console → Setup → API access)
3. Save it as `google-service-account.json` in the nearnity-app folder
4. Update `eas.json` with the path if different

Then:
```bash
npm run submit:android
```

---

## App Store listing info (for when you submit)

**App name:** Nearnity

**Subtitle (iOS, max 30 chars):** Everything about here.

**Description:**
```
Tap Near Me and instantly see verified public information about wherever you're standing.

• Schools, free clinics, libraries, and civic services nearby
• Real-time weather alerts from the National Weather Service
• Air quality (EPA AirNow) and recent earthquakes (USGS)
• Upcoming events from Ticketmaster, SeatGeek, and city calendars
• Free federally-qualified health centers (HRSA)
• National parks and federal recreation sites (NPS / Recreation.gov)

All data from public federal sources. No accounts. No ads. No sign-up. No location data stored.

911 · 988 · 211 — always visible at the top.
```

**Category:** Utilities (primary), Reference (secondary)

**Keywords (iOS):** near me, local services, public data, health centers, weather alerts, civic, community

**Privacy:** No data collected. No account required. Location used only to show nearby results — never stored or transmitted to Nearnity servers.

---

## Project file map

```
nearnity-app/
├── app/
│   ├── _layout.tsx        ← Root navigation setup
│   ├── index.tsx          ← Home screen (Near Me button)
│   └── results.tsx        ← Results (map + 5-tab content)
├── components/
│   ├── EmergencyBar.tsx   ← 911/988/211 persistent top bar
│   ├── CategoryTabs.tsx   ← Horizontal tab row
│   ├── PlaceCard.tsx      ← OSM/HRSA place result row
│   ├── AlertCard.tsx      ← Weather/AQI/quake cards
│   └── EventCard.tsx      ← Event result row
├── constants/
│   ├── colors.ts          ← Nearnity brand palette (matches web)
│   └── config.ts          ← API URLs and defaults
├── hooks/
│   ├── useLocation.ts     ← GPS + permission flow
│   └── useNearby.ts       ← Parallel data loading
├── services/
│   ├── geocoding.ts       ← Nominatim reverse geocode
│   ├── overpass.ts        ← OSM Overpass queries (3 tabs)
│   ├── hrsa.ts            ← HRSA free clinics
│   ├── risks.ts           ← NWS + USGS (direct) + AirNow (proxied)
│   └── events.ts          ← nearnity.com/api/events Worker
├── types/index.ts         ← All TypeScript types
├── app.json               ← Expo/EAS config (fill in your keys here)
├── eas.json               ← Build + submit config (fill in your credentials)
└── package.json
```

---

## API improvements vs the web app

| Feed | Web app | Mobile app | Why |
|---|---|---|---|
| NWS Alerts | Proxied via Worker | **Direct** `api.weather.gov` | No CORS in native; faster |
| USGS Quakes | Proxied via Worker | **Direct** `earthquake.usgs.gov` | No CORS in native; faster |
| HRSA Clinics | Sometimes CORS-blocked | **Direct** (always works) | No browser CORS restrictions |
| AirNow AQI | Proxied (needs key) | Proxied (needs key) | API key required |
| Events | Proxied (needs key) | Proxied (needs key) | Ticketmaster key required |
| OSM Overpass | Direct | Direct | Same |

---

## Version history

- **v1.0.0** — Initial MVP: Near Me → 5-tab results (Nearby, Health, Alerts, Civic, Events)

---

## Troubleshooting

**"Maps not showing on Android"** → You haven't added the Google Maps API key to `app.json` yet.

**"Location permission denied"** → On iOS, go to Settings → Privacy → Location Services → Nearnity.

**"Events tab empty"** → The `/api/events` Worker may need Ticketmaster/SeatGeek keys configured in Cloudflare. Check `nearnity.com/api/health`.

**"Build failed"** → Run `eas build --platform ios --profile development` first to test with a dev build before production.

**"HRSA returns no results"** → The HRSA API can be slow for rural areas. Check `findahealthcenter.hrsa.gov` manually to confirm coverage for that location.
