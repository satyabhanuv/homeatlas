# HomeAtlas — Release Notes

A running log of every shipped iteration. Newest version on top.

**Live site:** https://homeatlas.satyabhanuv.workers.dev/
**Repo:** GitHub (Satya's account) → Cloudflare auto-deploys on push to `index.html`.

---

## v0.13 — 2026-04-30 — Phase 2 begins: Yard & Garden module

First Phase 2 deliverable. New full-width card below the schools card.

- USDA Plant Hardiness Zone resolved via 3-level fallback: top-150 city lookup → state default → latitude approximation. Works for all 50 states + DC.
- 4 climate fields per address: avg min winter temp, first fall frost, last spring frost, growing-season length, climate type (Subarctic / Cold continental / Cool continental / Temperate / Warm temperate / Subtropical-Mediterranean / Tropical).
- 39-plant database categorized as Trees / Shrubs / Perennials & flowers / Edibles & herbs. Filtered by user's zone.
- Plant cards include: scientific name, description, and pill tags for **Native**, **Drought-tolerant**, **Shade-OK**, **Edible**.
- Soil section: region-typical descriptions for 9 major states + generic fallback. Button to USDA Web Soil Survey for exact soil series at the address.
- Watering & care: 3 honey-colored tip blocks tailored by climate type.
- Removed "Yard & garden" from the Coming Soon section (now shipped).
- Bumped brand tag to "Preview · Phase 2".

---

## v0.12 — 2026-04-30 — Dual icons + top-5 cap + schools 3×3 restructure

Polish iteration before Phase 2.

- Per-provider **dual icon links** in every result row:
  - 🌐 "Reach them" — provider's website
  - 📍 Map — Google Maps centered on user's lat/lon, searching for nearest physical location
- Schools use **exact OSM coordinates** for the map pin (zoom 18 to the school).
- **Top-5 cap per tile** (with "top of N" indicator) — Internet sorted by tech priority (Cable → Fiber → 5G → Satellite). TV mix: cable + 2 satellite + 2 streaming. Security: 3 DIY + 1 Pro install + 1 Smart home.
- **Schools restructured to 3×3 grid:** 3 categories (Public / Private / Other) × 3 levels (Elementary / Middle / High) = 9 cells.
- Charter/magnet detection added to classifier. Routes into the new "Other" category.
- Schools without explicit level fall back to "Mixed levels" — used as fill for slot.
- "No nearby match" placeholder cell instead of hidden rows when a level isn't found.

---

## v0.11 — 2026-04-30 — Nominatim fallback geocoder

Fix for missing addresses in smaller towns (e.g. Phoenixville PA).

- **Photon → Nominatim fallback chain** for address autocomplete. Photon stays primary; when it returns 0 US results we silently fall back to a single Nominatim search call (within Nominatim's 1-req/sec limit thanks to debounce).
- Removed the US-center lat/lon bias (was ranking Kansas-area matches above east-coast addresses).
- More permissive USA filter (accepts `country_code=us` as well as `country=United States`).
- "No matches for X" empty state in the dropdown with a typing-format hint.
- Debounce bumped from 280ms → 350ms to give Nominatim breathing room.

---

## v0.10 — 2026-04-30 — Depth for PA, NY, TX, WA, NJ

Five new states with full California-equivalent depth.

- All counties → primary IOU/utility for: Pennsylvania (PECO/PPL/Duquesne/FirstEnergy companies), New York (Con Edison/National Grid/NYSEG/RG&E/Orange & Rockland/Central Hudson/PSEG Long Island), Texas (Oncor/CenterPoint/AEP/El Paso Electric/Entergy/Austin Energy/CPS/etc.), Washington (Seattle City Light/Tacoma Power/PUDs/Avista/Puget Sound Energy), New Jersey (PSE&G/JCP&L/Atlantic City Electric).
- City-level POU overrides (Garland P&L, Tacoma Power, Vineland Municipal, etc.).
- Cable provider mapping per county (Spectrum, Optimum/Altice, Comcast, Cox, etc.).
- Major-city fiber availability (Verizon Fios, AT&T Fiber, Google Fiber, Frontier FiberOptic, Sonic, Optimum Fiber, CenturyLink, Click! Network).
- City→county fallback expanded to ~120 US cities.
- City→school district mapping for ~30 cities per state.
- **NYC borough handling**: Brooklyn=Kings, Queens=Queens, Manhattan=New York County, Bronx=Bronx, Staten Island=Richmond.
- **TX retail-choice indicator**: ERCOT TDU customers get a "PowerToChoose.org" supplier-shopping row alongside their TDU.
- 30+ new utility/ISP URLs in PROVIDER_URL.
- Verified with 20 regression tests across all 6 states + a Boston "unloaded state" fallback.

---

## v0.9 — 2026-04-30 — Open to all US states with national fallbacks

Removed the CA-only gate. The site now works for any US address.

- Photon autocomplete opened to US-wide (filter by country=USA).
- Non-CA addresses still get: geocoded address, map of home, 6 nationwide ISPs (3 5G Home + 3 satellite), 8 nationwide TV providers, 13 nationwide security brands, OpenStreetMap-based schools.
- State-aware empty-state callouts when state-specific data isn't loaded — points users to U.S. Energy Atlas for utilities, Google search fallback.
- Brand tag changed from "Preview · California" to "Preview · United States".

---

## v0.8 — 2026-04-30 — Schools restructure (closest-by-level + better classifier)

Fix for schools card showing only elementary in dense urban areas.

- **Bug fix**: previous `slice(0, 12)` on a sorted-by-level list let elementary fill all slots before middle/high were considered. Replaced with per-level grouping.
- **Tiered output**: Tier 1 = closest in each level (1 elementary + 1 middle + 1 high). Tier 2 = next 2 in each level.
- Strengthened classifier: reads OSM `grades` attribute (`K-5`, `6-8`, `9-12`), `isced:level`, plus stricter name patterns (Junior High, JHS, Intermediate, etc.).
- Filter out non-K-12 schools that get tagged `amenity=school` in OSM (driving schools, music schools, learning centers, tutoring).
- UI caveat clarifies "closest ≠ zoned" with link to district school finder.
- Verified with 25 classifier tests + tiered grouping simulation.

---

## v0.7 — 2026-04-30 — Parallel Overpass queries + map embed

Schools section reliability + visual improvement.

- **Schools fetch**: split single heavy Overpass query into two parallel queries (schools + amenities) using `Promise.allSettled`. Each is half the load → much less likely to hit a 504. Partial success is acceptable (schools succeed even if amenities fail).
- Added 4th Overpass mirror (`overpass.osm.ch`).
- Per-mirror timeout dropped from 40s → 20s for faster fall-through.
- **Map embed**: OpenStreetMap iframe inside the resolved-address card. Shows the home with a marker. Two-column layout on desktop (map left, fields right); stacks on mobile.
- "View larger map on OpenStreetMap" link below the embed.

---

## v0.6 — 2026-04-30 — Deployment polish + guide

Production-ready packaging.

- Inline SVG favicon (green house).
- Open Graph + Twitter meta tags for proper preview cards when the URL is shared.
- Theme color (`#2d6a4f`) on mobile browser chrome.
- Mailto feedback link in footer with placeholder email (`CHANGE-ME@example.com`) — to be replaced by user before deploying publicly.
- Version stamp.
- Wrote `HomeAtlas_Deployment_Guide.md` — step-by-step GitHub + Cloudflare Pages walkthrough.
- Created `index.html` as the deploy-ready copy alongside the working `homeatlas.html`.

---

## v0.5 — 2026-04-30 — Grouped providers + county fallback + schools fix

UX cleanup and reliability.

- **Provider grouping**: Internet/TV/Security cards now show sub-sections (Cable / Fiber / Fixed wireless / 5G Home / Satellite for Internet, etc.) instead of flat lists.
- **CA city→county fallback** (~120 cities): handles San Francisco and other consolidated city-counties where Nominatim omits the county field.
- Help-callout when utility resolves to "Unknown" — points to CEC service-territory map + Google search of the address.
- **Schools fetch fix**: switched Overpass from POST to GET (avoids CORS preflight on `file://` origins), added 3 mirrors with fallback chain.
- Retry button on schools-section failure.
- Better progress messaging: "Searching overpass-api.de…" → "Server 1 was slow. Trying backup server 2 of 3…".

---

## v0.4 — 2026-04-30 — Real schools via OpenStreetMap Overpass API

First version with live nearby-schools data.

- Schools card moved to full-width section below the 4-card grid.
- Live Overpass API query for everything within 2.5 miles: schools, preschools, colleges, universities, libraries, swimming pools, sports centers, community centers.
- Results grouped into 4 sections (Public K-12 / Private / Higher Ed / Libraries+Pools+Enrichment).
- Sorted by haversine distance from address.
- Public/private classification via OSM tags (`school:type`, `operator:type`) + name patterns (Catholic, Christian, Montessori, Saint, Country Day, etc.).
- Each row clickable to Google search of the school name.

---

## v0.3 — 2026-04-30 — Structured address + interactive provider tables

Major UX rework based on FCC site as reference.

- Address-resolved panel: replaced comma-string with labeled grid (Street / City / County / ZIP / State / Coordinates).
- All result cards converted to **FCC-style provider tables** with clickable provider names + "Visit →" buttons per row.
- Internet table shows typical max **Down / Up speeds** in Mbps.
- Fixed broken CDE school-district URL → replaced with Google search + GreatSchools + stable CDE landing page.
- "Search a different address" reset button in the resolved-address header.
- Auto-scroll results into view after lookup.

---

## v0.2 — 2026-04-30 — Autocomplete + ISP/TV/Security/CCA expansion

Major feature expansion of the v0.1 prototype.

- **Photon address autocomplete** with 3-char trigger, 280ms debounce, keyboard nav (arrow keys + Enter + Escape), click-to-select.
- **Internet card** now lists named providers (cable monopoly + fiber + 5G Home + satellite) instead of just an FCC link.
- **TV providers card** added: 8 streaming/satellite options + OTA antenna.
- **Home security card** added: 13 brands across DIY / Pro install / Smart home.
- **CCA breakdown on electric card**: Marin Clean Energy, Peninsula Clean Energy, Ava Community Energy, San Jose Clean Energy, CleanPowerSF, Clean Power Alliance, Sonoma Clean Power, etc. Only shown for IOU customers (PG&E/SCE/SDG&E); skipped for LADWP/SMUD/POU.
- City→CCA overrides for San Jose, Lancaster, Apple Valley, etc.

---

## v0.1 — 2026-04-30 — Initial MVP prototype (CA-only)

First working build after the architecture plan.

- Single self-contained HTML/CSS/JS file. No build step. No backend.
- Photon (limited) + Nominatim reverse geocode for addresses.
- 3 result cards: Electric utility (CA county lookup), Internet (FCC link only), School district (city lookup).
- 6 "Coming next" placeholder cards for Phase 2 modules (House anatomy, HVAC, Materials, Yard, Risk, Civic).
- Privacy-first: no address storage, no accounts, no server.
- Deployed test: opens locally, all queries work without API keys.

---

## How to update these notes going forward

For each new version I ship, I'll provide a short release-notes block at the bottom of my response. Copy-paste it to the top of this file (just below the title) and commit alongside the `index.html` change. Format stays the same: `## vX.Y — YYYY-MM-DD — Headline`, then a 3-7 bullet list focused on what visibly changed.
