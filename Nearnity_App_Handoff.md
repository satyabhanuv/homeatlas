# Nearnity Mobile App — Session Handoff

Paste this into your first message in the new session so Claude has full context.

---

## What Nearnity is

Location-first public site at **nearnity.com** (Cloudflare Worker, single `index.html`). Tap "Near Me" → get verified public info about wherever you are: schools, free clinics, weather alerts, civic services, events, parks. No accounts, no ads, no data stored. Solo founder project (Satya Bhanu), self-funded, targeting acquisition exit. Soft launch done May 29, 2026.

**Stack:** Single-file static `index.html` (~17K lines) hosted on Cloudflare Workers. Cloudflare Worker `nearnity-events` proxies Ticketmaster + SeatGeek + city iCal. Cloudflare Worker also proxies AirNow, NPS, RIDB (need API keys).

## Mobile App — What was built

A full **React Native + Expo** MVP is scaffolded at:
`/Users/[your-username]/Documents/Claude/Projects/Personal/nearnity-app/`

### Project structure (24 files)
```
nearnity-app/
├── app/
│   ├── _layout.tsx        ← Root navigation
│   ├── index.tsx          ← Home screen (Near Me button + GPS flow)
│   └── results.tsx        ← Results screen (map + 5-tab content)
├── components/
│   ├── EmergencyBar.tsx   ← 911/988/211 persistent bar
│   ├── CategoryTabs.tsx   ← Horizontal tab selector
│   ├── PlaceCard.tsx      ← OSM/HRSA place card
│   ├── AlertCard.tsx      ← Weather/AQI/earthquake cards
│   └── EventCard.tsx      ← Event result card
├── constants/
│   ├── colors.ts          ← Nearnity brand palette
│   └── config.ts          ← API URLs and defaults
├── hooks/
│   ├── useLocation.ts     ← expo-location GPS + permission state machine
│   └── useNearby.ts       ← Fires all 5 parallel data fetches
├── services/
│   ├── geocoding.ts       ← Nominatim reverse geocode
│   ├── overpass.ts        ← OSM Overpass (Nearby / Health / Civic tabs)
│   ├── hrsa.ts            ← HRSA free clinics (federal, no key)
│   ├── risks.ts           ← NWS alerts + USGS quakes (DIRECT, no proxy) + AirNow (proxied)
│   └── events.ts          ← nearnity.com/api/events Worker
├── types/index.ts         ← All TypeScript interfaces
├── app.json               ← Expo config (needs: EAS project ID, Google Maps API key)
├── eas.json               ← Build/submit config (needs: Apple ID, ASC app ID, team ID)
├── package.json
└── SETUP.md               ← Full step-by-step launch guide (READ THIS)
```

### 5 tabs in the Results screen
1. **Nearby** — OSM Overpass: parks, libraries, groceries, pharmacies
2. **Health** — HRSA FQHCs (federal free clinics, direct API) + OSM hospitals
3. **Alerts** — NWS weather (direct `api.weather.gov`) + AQI (Worker) + USGS quakes (direct)
4. **Civic** — OSM: libraries, post offices, fire/police, government buildings
5. **Events** — `nearnity.com/api/events` Worker (Ticketmaster + SeatGeek)

### Key mobile improvement over web
NWS and USGS APIs are called **directly** from the device (no Worker proxy) because native apps have no CORS. This is faster and reduces Worker load.

## Tech decisions already made
- **Framework:** React Native + Expo (SDK 53)
- **Navigation:** expo-router (file-based)
- **Maps:** react-native-maps (Apple Maps on iOS, Google Maps on Android)
- **GPS:** expo-location (Balanced accuracy)
- **Build/deploy:** EAS Build + EAS Submit (cloud builds, no Mac required)
- **Cost:** ~$124/year total (Apple $99/yr + Google Play $25 once)
- **Business model:** Free forever, no user monetization, targeting acquisition exit

## What still needs to be done (next sessions)

### Must-do before first build
1. **App icons** — need `assets/icon.png` (1024×1024), `assets/splash.png`, `assets/adaptive-icon.png`
2. **Google Maps API key** — add to `app.json` → android → config → googleMaps → apiKey
3. **EAS project ID** — run `eas init` in the project folder, replace placeholder in `app.json`
4. **Apple Developer + Google Play accounts** — see SETUP.md

### V1 enhancements (after MVP ships)
- Push notifications for active weather alerts
- "My Home" tab: broadband/ISP lookup (FCC), flood zone, school district
- Address search (not just Near Me)
- Save favorite locations (AsyncStorage)
- Share results via share sheet
- Dark mode

## Nearnity web app details
- **URL:** https://nearnity.com
- **Cloudflare account:** Satyabhanuv@gmail.com
- **Domain:** nearnity.com (Cloudflare Registrar, $10.49/yr)
- **Worker:** `nearnity-events` — routes `nearnity.com/api/*`
- **Events API:** `GET https://nearnity.com/api/events?lat=&lon=&radius=`
- **Health check:** `GET https://nearnity.com/api/health`
- **Colors:** Primary blue `#006aff` → `#0050c2`, Green `#2d6a4f`, Emergency red `#A32D2D`
- **Version at handoff:** v0.68.2+

## How to continue in a new session
1. Sign into your personal Claude account
2. Connect the folder: `/Users/[your-username]/Documents/Claude/Projects/Personal/`
3. Paste this file's contents as your first message
4. Say: "Continue building the Nearnity mobile app — the project is in nearnity-app/"
